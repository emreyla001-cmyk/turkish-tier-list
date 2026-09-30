'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import UserBadge, { Avatar, NameTag, levelFromXp, xpForLevel, ROLES } from './UserBadge';
import { resolveBackground, resolveFrame, resolveNameColor } from './cosmetics';

function isFutureDate(dateVal) {
  if (!dateVal) return false;
  try {
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) && d.getTime() > Date.now();
  } catch {
    return false;
  }
}

function getRemainingTimeText(untilDate) {
  if (!untilDate) return null;
  try {
    const target = new Date(untilDate).getTime();
    if (isNaN(target)) return null;
    const diff = target - Date.now();
    if (diff <= 0) return 'Süresi Doldu';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days} gün ${hours} saat`;
    if (hours > 0) return `${hours} saat ${mins} dk`;
    return `${mins} dakika`;
  } catch {
    return null;
  }
}

export default function UserProfileModal({ userId, onClose, currentViewerRole = 'user' }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [coinAmount, setCoinAmount] = useState('500');
  const [banReason, setBanReason] = useState('Topluluk kurallarına aykırı davranış');
  const [actionLoading, setActionLoading] = useState(false);

  const isStaff = currentViewerRole === 'admin' || currentViewerRole === 'moderator';

  async function loadUser() {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Kullanıcı profili alınamadı:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, [userId]);

  if (!userId) return null;

  async function runAction(fn, successMsg) {
    setActionLoading(true);
    setMsg(null);
    try {
      const { error } = await fn();
      if (error) {
        setMsg({ text: error.message || 'İşlem başarısız oldu.', type: 'error' });
      } else {
        setMsg({ text: successMsg, type: 'success' });
        await loadUser();
      }
    } catch (e) {
      setMsg({ text: e.message || 'Beklenmeyen bir hata oluştu.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  }

  // Hızlı Moderasyon Fonksiyonları
  const handleRoleChange = (newRole) => {
    runAction(
      () => supabase.rpc('set_user_role', { target: userId, new_role: newRole }),
      `Kullanıcı rolü "${newRole}" olarak güncellendi.`
    );
  };

  const handleGiveCoins = (amt) => {
    runAction(
      () => supabase.rpc('grant_coins', { target: userId, amount: amt, reason: 'Admin: Hızlı Moderasyon' }),
      `${amt > 0 ? '+' : ''}${amt.toLocaleString('tr-TR')} Tier Parası uygulandı.`
    );
  };

  const handleMute = (minutes) => {
    runAction(
      () => supabase.rpc('moderate_user', { target: userId, action: 'mute', minutes }),
      `Kullanıcı ${minutes} dakika susturuldu.`
    );
  };

  const handleUnmute = () => {
    runAction(
      () => supabase.rpc('moderate_user', { target: userId, action: 'unmute' }),
      'Kullanıcının susturması kaldırıldı.'
    );
  };

  const handleBan = (minutes) => {
    runAction(
      () => supabase.rpc('moderate_user', { target: userId, action: 'ban', minutes, reason: banReason }),
      `Kullanıcı ${minutes >= 525600 ? 'kalıcı olarak' : `${Math.round(minutes / 1440)} gün`} yasaklandı.`
    );
  };

  const handleUnban = () => {
    runAction(
      () => supabase.rpc('moderate_user', { target: userId, action: 'unban' }),
      'Kullanıcının yasağı kaldırıldı.'
    );
  };

  const handleGrantPermit = (kind, days) => {
    runAction(async () => {
      const nowMs = Date.now();
      const col = kind === 'avatar_gif' ? 'avatar_gif_until' : 'profile_bg_until';
      const curExp = isFutureDate(profile?.[col]) ? new Date(profile[col]).getTime() : nowMs;
      const newUntil = new Date(curExp + days * 24 * 60 * 60 * 1000).toISOString();
      return await supabase.from('profiles').update({ [col]: newUntil }).eq('id', userId);
    }, `${days} Günlük ${kind === 'avatar_gif' ? 'GIF Avatar' : 'GIF Arka Plan'} hakkı tanımlandı.`);
  };

  const vipActive = profile?.role === 'vip' || profile?.role === 'admin' || isFutureDate(profile?.vip_until);
  const gifActive = vipActive || isFutureDate(profile?.avatar_gif_until);
  const bgActive = vipActive || isFutureDate(profile?.profile_bg_until);

  const bannerBg = bgActive && profile?.profile_bg_url
    ? `url("${profile.profile_bg_url}")`
    : resolveBackground(profile?.equipped_background);
  const frameGrad = resolveFrame(profile?.equipped_frame);
  const nameColor = resolveNameColor(profile?.equipped_name_color);

  const currentXp = Number(profile?.xp) || 0;
  const level = levelFromXp(currentXp);
  const isMuted = isFutureDate(profile?.muted_until);
  const isBanned = isFutureDate(profile?.banned_until);

  return (
    <div
      className="spotlight-overlay"
      style={{ zIndex: 120, padding: '40px 16px', alignItems: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#0e121d',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(0, 240, 255, 0.15)',
          borderRadius: '20px',
          padding: 0,
          position: 'relative',
        }}
      >
        {/* Kapat Butonu */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
            Kullanıcı profili yükleniyor...
          </div>
        ) : !profile ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#e6455b' }}>
            Kullanıcı profili bulunamadı.
          </div>
        ) : (
          <div>
            {/* Profil Afişi / Başlığı */}
            <div
              style={{
                height: '130px',
                backgroundImage: bannerBg,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                borderTopLeftRadius: '19px',
                borderTopRightRadius: '19px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(14, 18, 29, 0.2), rgba(14, 18, 29, 0.95))',
                }}
              />
            </div>

            {/* Avatar & Temel Bilgiler */}
            <div style={{ padding: '0 24px 20px', position: 'relative', marginTop: '-45px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px' }}>
                  <Avatar
                    url={profile.avatar_url}
                    name={profile.username || '?'}
                    size={72}
                    frameGradient={frameGrad}
                  />
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.35rem' }}>
                      <NameTag name={profile.username || 'Kullanıcı'} color={nameColor} />
                    </h2>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                      <UserBadge role={profile.role} xp={currentXp} vipActive={vipActive} />
                      {isBanned && (
                        <span className="tag" style={{ background: '#e6455b', color: '#fff', fontWeight: 800 }}>
                          🔨 YASAKLI
                        </span>
                      )}
                      {isMuted && (
                        <span className="tag" style={{ background: '#e68a25', color: '#fff', fontWeight: 800 }}>
                          🔇 SUSTURULMUŞ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bilgi Rozetleri */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '18px' }}>
                <div style={{ background: 'var(--bg-2)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '.74rem', color: 'var(--text-dim)' }}>🪙 Bakiye</div>
                  <div style={{ fontWeight: 800, color: '#fef08a', fontSize: '1rem', marginTop: '2px' }}>
                    {(profile.coins || 0).toLocaleString('tr-TR')}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-2)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '.74rem', color: 'var(--text-dim)' }}>⚡ Seviye</div>
                  <div style={{ fontWeight: 800, color: '#a5b4fc', fontSize: '1rem', marginTop: '2px' }}>
                    {level} ({currentXp} XP)
                  </div>
                </div>
                <div style={{ background: 'var(--bg-2)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '.74rem', color: 'var(--text-dim)' }}>💎 VIP</div>
                  <div style={{ fontWeight: 800, color: vipActive ? '#86efac' : 'var(--text-dim)', fontSize: '.9rem', marginTop: '2px' }}>
                    {vipActive ? 'Aktif' : 'Standart'}
                  </div>
                </div>
              </div>

              {/* GIF & Arka Plan Durumu */}
              <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '.8rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>🎞️ GIF Avatar: </span>
                  <strong style={{ color: gifActive ? '#86efac' : 'var(--text-dim)' }}>
                    {vipActive ? 'Sınırsız (VIP)' : getRemainingTimeText(profile.avatar_gif_until) || 'Kilitli'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>🖼️ GIF Arkaplan: </span>
                  <strong style={{ color: bgActive ? '#86efac' : 'var(--text-dim)' }}>
                    {vipActive ? 'Sınırsız (VIP)' : getRemainingTimeText(profile.profile_bg_until) || 'Kilitli'}
                  </strong>
                </div>
              </div>

              {/* Bildirim Mesajı */}
              {msg && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '.85rem',
                    fontWeight: 700,
                    background: msg.type === 'error' ? 'rgba(230,69,91,.15)' : 'rgba(111,191,115,.15)',
                    border: `1px solid ${msg.type === 'error' ? '#e6455b' : '#6fbf73'}`,
                    color: msg.type === 'error' ? '#e6455b' : '#6fbf73',
                  }}
                >
                  {msg.text}
                </div>
              )}

              {/* ⚡ HIZLI MODERATÖR & CEZA KONTROL PANELİ (Sadece Admin/Mod için) */}
              {isStaff && (
                <div
                  style={{
                    marginTop: '18px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <h4 style={{ margin: '0 0 10px', fontSize: '.95rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                    <span>⚡</span> Hızlı Moderatör & Ceza Masası
                  </h4>

                  {/* Rol Değiştirme */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Kullanıcı Rolü:</label>
                    <select
                      value={profile.role || 'user'}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      disabled={actionLoading}
                      style={{
                        width: '100%',
                        background: 'var(--bg-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '.85rem',
                      }}
                    >
                      {Object.entries(ROLES).map(([key, [icon, label]]) => (
                        <option key={key} value={key}>
                          {icon} {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Susturma (Mute) Aksiyonları */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Sohbet & Yorum Susturma:</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.75rem' }} onClick={() => handleMute(15)} disabled={actionLoading}>15 Dk</button>
                      <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.75rem' }} onClick={() => handleMute(60)} disabled={actionLoading}>1 Saat</button>
                      <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.75rem' }} onClick={() => handleMute(1440)} disabled={actionLoading}>24 Saat</button>
                      <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.75rem' }} onClick={() => handleMute(10080)} disabled={actionLoading}>7 Gün</button>
                      {isMuted && (
                        <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '.75rem', background: '#6fbf73' }} onClick={handleUnmute} disabled={actionLoading}>Susturmayı Aç</button>
                      )}
                    </div>
                  </div>

                  {/* Yasaklama (Ban) Aksiyonları */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Site Yasağı (Ban):</label>
                    <input
                      type="text"
                      placeholder="Yasak nedeni..."
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '.8rem',
                        marginBottom: '6px',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.75rem', borderColor: '#e6455b', color: '#e6455b' }} onClick={() => handleBan(1440)} disabled={actionLoading}>1 Gün Ban</button>
                      <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.75rem', borderColor: '#e6455b', color: '#e6455b' }} onClick={() => handleBan(4320)} disabled={actionLoading}>3 Gün Ban</button>
                      <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.75rem', borderColor: '#e6455b', color: '#e6455b' }} onClick={() => handleBan(10080)} disabled={actionLoading}>7 Gün Ban</button>
                      <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.75rem', borderColor: '#e6455b', color: '#e6455b', fontWeight: 800 }} onClick={() => handleBan(525600)} disabled={actionLoading}>Kalıcı Ban</button>
                      {isBanned && (
                        <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '.75rem', background: '#6fbf73' }} onClick={handleUnban} disabled={actionLoading}>Yasağı Kaldır</button>
                      )}
                    </div>
                  </div>

                  {/* Tier Parası Ayarlama */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Tier Parası Ver / Al:</label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={coinAmount}
                        onChange={(e) => setCoinAmount(e.target.value)}
                        style={{
                          width: '90px',
                          background: 'var(--bg-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '.85rem',
                        }}
                      />
                      <button type="button" className="btn" style={{ padding: '6px 10px', fontSize: '.78rem' }} onClick={() => handleGiveCoins(Number(coinAmount))} disabled={actionLoading}>
                        + Ekle
                      </button>
                      <button type="button" className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '.78rem' }} onClick={() => handleGiveCoins(-Number(coinAmount))} disabled={actionLoading}>
                        - Çıkar
                      </button>
                    </div>
                  </div>

                  {/* Hızlı Hak Tanımlama */}
                  <div>
                    <label style={{ fontSize: '.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Özel GIF Hakkı Tanımla:</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.75rem' }} onClick={() => handleGrantPermit('avatar_gif', 7)} disabled={actionLoading}>
                        +7 Gün Avatar GIF
                      </button>
                      <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.75rem' }} onClick={() => handleGrantPermit('avatar_gif', 30)} disabled={actionLoading}>
                        +30 Gün Avatar GIF
                      </button>
                      <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.75rem' }} onClick={() => handleGrantPermit('profile_bg', 30)} disabled={actionLoading}>
                        +30 Gün Arkaplan GIF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
