'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import UserBadge, { Avatar, NameTag, levelFromXp, xpForLevel } from '../components/UserBadge';
import { useFrameMap } from '../components/useFrameMap';
import { resolveBackground, resolveFrame, resolveNameColor } from '../components/cosmetics';
import TwoFactor from '../components/TwoFactor';

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Profil Hatası:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ margin: '14px 0', border: '1px solid #e6455b', padding: '16px' }}>
          <h4 style={{ color: '#e6455b', margin: '0 0 8px' }}>Bu bölüm yüklenirken bir sorun oluştu</h4>
          <p style={{ fontSize: '.85rem', color: 'var(--text-dim)', margin: 0 }}>
            {this.state.error?.message || String(this.state.error)}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function isFutureDate(dateVal) {
  if (!dateVal) return false;
  try {
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) && d.getTime() > Date.now();
  } catch {
    return false;
  }
}

function formatDateSafe(dateVal) {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('tr-TR');
  } catch {
    return '';
  }
}

function isVipUser(p) {
  if (!p) return false;
  return p.role === 'vip' || p.role === 'admin' || p.role === 'moderator' || isFutureDate(p.vip_until);
}

function ProfilContent() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'cosmetics' | 'security'
  const [username, setUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState({});
  const frameMap = useFrameMap() || {};
  const say = (key, text) => setMsg((m) => ({ ...m, [key]: text }));

  async function load() {
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u || null);
      if (!u) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, role, xp, coins, vip_until, name_color_until, avatar_gif_until, equipped_frame, equipped_background, equipped_name_color, profile_bg_url')
        .eq('id', u.id)
        .maybeSingle();

      const fallbackProfile = {
        id: u.id,
        username: u.user_metadata?.username || u.email?.split('@')[0] || 'Kullanıcı',
        avatar_url: u.user_metadata?.avatar_url || null,
        role: 'user',
        xp: 0,
        coins: 0,
        vip_until: null,
        name_color_until: null,
        avatar_gif_until: null,
        equipped_frame: null,
        equipped_background: null,
        equipped_name_color: null,
        profile_bg_url: null,
      };

      const prof = data || fallbackProfile;
      setProfile(prof);
      setUsername(prof.username || '');
    } catch (err) {
      console.error('Profil yükleme hatası:', err);
      setProfile((prev) => prev || {
        id: 'anon',
        username: 'Kullanıcı',
        role: 'user',
        xp: 0,
        coins: 0,
      });
    }
  }

  useEffect(() => { load(); }, []);

  async function saveUsername(e) {
    e.preventDefault();
    const name = username.trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(name)) {
      say('username', 'Kullanıcı adı 3-20 karakter olmalı; sadece harf, rakam ve alt çizgi (_) kullanabilirsin.');
      return;
    }
    if (name === (profile?.username || '')) {
      say('username', 'Bu zaten mevcut kullanıcı adın.');
      return;
    }
    if (name.toLowerCase() !== (profile?.username || '').toLowerCase()) {
      try {
        const { data: ok } = await supabase.rpc('username_available', { uname: name });
        if (ok === false) {
          say('username', 'Bu kullanıcı adı zaten alınmış.');
          return;
        }
      } catch {
        // RPC might not exist, continue
      }
    }
    const { error } = await supabase.from('profiles').update({ username: name }).eq('id', user.id);
    if (error) {
      say('username', error.code === '23505' ? 'Bu kullanıcı adı zaten alınmış.' : 'Kaydedilemedi: ' + (error.message || ''));
      return;
    }
    say('username', 'Kullanıcı adın güncellendi.');
    load();
  }

  async function uploadAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVip = isVipUser(profile);
    const gifAllowed = isVip || isFutureDate(profile?.avatar_gif_until);
    const okTypes = gifAllowed ? { ...EXT, 'image/gif': 'gif' } : EXT;
    if (!okTypes[file.type]) {
      say(
        'avatar',
        gifAllowed
          ? 'Sadece PNG, JPG, WEBP veya GIF yükleyebilirsin.'
          : 'Hareketli avatar (GIF) kullanabilmek için VIP üyeliğe sahip olmalısın. Normal kullanıcılar PNG, JPG veya WEBP yükleyebilir.'
      );
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      say('avatar', 'Görsel en fazla 2 MB olabilir.');
      return;
    }
    say('avatar', 'Yükleniyor...');
    const path = `${user.id}/${Date.now()}.${okTypes[file.type]}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type });
    if (error) {
      say('avatar', 'Yüklenemedi: ' + (error.message || ''));
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const { error: err2 } = await supabase.from('profiles').update({ avatar_url: data?.publicUrl }).eq('id', user.id);
    say('avatar', err2 ? 'Kaydedilemedi.' : 'Avatarın güncellendi.');
    load();
  }

  async function removeAvatar() {
    await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
    say('avatar', 'Avatar kaldırıldı.');
    load();
  }

  async function uploadBackground(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVip = isVipUser(profile);
    if (!isVip) {
      say('bg', 'Özel profil arka planı veya hareketli GIF arka plan yüklemek sadece VIP üyelere açıktır.');
      return;
    }
    const okTypes = { ...EXT, 'image/gif': 'gif' };
    if (!okTypes[file.type]) {
      say('bg', 'Sadece PNG, JPG, WEBP veya GIF formatında arka plan yükleyebilirsin.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      say('bg', 'Arka plan görseli en fazla 5 MB olabilir.');
      return;
    }
    say('bg', 'Arka plan yükleniyor...');
    const path = `${user.id}/bg_${Date.now()}.${okTypes[file.type]}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type });
    if (error) {
      say('bg', 'Yüklenemedi: ' + (error.message || ''));
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const { error: err2 } = await supabase.from('profiles').update({ profile_bg_url: data?.publicUrl }).eq('id', user.id);
    say('bg', err2 ? 'Kaydedilemedi.' : 'Özel profil arka planın güncellendi!');
    load();
  }

  async function removeCustomBackground() {
    await supabase.from('profiles').update({ profile_bg_url: null }).eq('id', user.id);
    say('bg', 'Özel arka plan kaldırıldı.');
    load();
  }

  async function savePassword(e) {
    e.preventDefault();
    if (pw.length < 6) { say('pw', 'Şifre en az 6 karakter olmalı.'); return; }
    if (pw !== pw2) { say('pw', 'Şifreler eşleşmiyor.'); return; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    say('pw', error ? error.message : 'Şifren güncellendi.');
    if (!error) { setPw(''); setPw2(''); }
  }

  async function saveEmail(e) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
    );
    say('email', error ? error.message : 'Onay bağlantısı gönderildi. E-posta değişikliği, gelen kutundaki linke tıklayınca tamamlanır.');
  }

  async function unequipCosmetic(column) {
    await supabase.from('profiles').update({ [column]: null }).eq('id', user.id);
    load();
  }

  if (user === undefined) return <div className="wrap empty">Yükleniyor...</div>;
  if (!user) return <div className="wrap empty">Profil ayarları için <a href="/giris-yap">giriş yapmalısın</a>.</div>;
  if (!profile) return <div className="wrap empty">Yükleniyor...</div>;

  const vipActive = isVipUser(profile);
  const tempColorActive = isFutureDate(profile?.name_color_until);
  const gifActive = vipActive || isFutureDate(profile?.avatar_gif_until);
  const currentXp = Number(profile?.xp) || 0;
  const level = levelFromXp(currentXp);
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const xpDiff = Math.max(1, next - cur);
  const pct = Math.min(100, Math.max(0, Math.round(((currentXp - cur) / xpDiff) * 100)));

  const bannerBg = profile?.profile_bg_url
    ? `url("${profile.profile_bg_url}")`
    : resolveBackground(profile?.equipped_background, frameMap);
  const frameGrad = resolveFrame(profile?.equipped_frame, frameMap);
  const nameColorVal = resolveNameColor(profile?.equipped_name_color, frameMap);

  return (
    <div className="wrap profile-dashboard" style={{ paddingBottom: '70px' }}>
      {/* 🚀 Fütüristik Cyber Profil Başlığı */}
      <ErrorBoundary>
        <div className="profile-hero-cyber">
          {bannerBg && (
            <div
              className="profile-hero-ambient"
              style={{ backgroundImage: bannerBg }}
            />
          )}

          <div className="profile-hero-content">
            <div className="profile-user-row">
              <div className="profile-avatar-aura">
                <Avatar
                  url={profile?.avatar_url}
                  name={profile?.username || user?.email || '?'}
                  size={84}
                  frameGradient={frameGrad}
                />
              </div>

              <div className="profile-user-info">
                <div className="profile-title-tag">
                  <h1 className="profile-username">
                    <NameTag name={profile?.username || 'Kullanıcı'} color={nameColorVal} />
                  </h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <UserBadge role={profile?.role || 'user'} xp={currentXp} vipActive={vipActive} />
                  <span className="tag" style={{ background: 'rgba(99, 102, 241, 0.2)', borderColor: '#818cf8', color: '#c7d2fe', fontWeight: 800 }}>
                    ⚡ Seviye {level}
                  </span>
                  {vipActive && (
                    <span className="tag" style={{ background: 'rgba(230, 179, 37, 0.25)', borderColor: '#e6b325', color: '#fef08a', fontWeight: 800 }}>
                      👑 VIP Üye
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Neon XP İlerleme Çubuğu */}
            <div className="cyber-xp-container">
              <div className="cyber-xp-header">
                <span>
                  <strong style={{ color: 'var(--accent)' }}>{currentXp} XP</strong> (Seviye {level})
                </span>
                <span style={{ color: 'var(--text-dim)' }}>
                  Sonraki Seviyeye: <strong style={{ color: '#fff' }}>{Math.max(0, next - currentXp)} XP</strong>
                </span>
              </div>
              <div className="cyber-xp-track">
                <div className="cyber-xp-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Hızlı İstatistik Kartları */}
            <div className="cyber-stat-grid">
              <div className="cyber-stat-card">
                <div className="cyber-stat-label"><span>🪙</span> Tier Parası</div>
                <div className="cyber-stat-value" style={{ color: '#fef08a' }}>{profile?.coins ?? 0}</div>
              </div>
              <div className="cyber-stat-card">
                <div className="cyber-stat-label"><span>⭐</span> Seviye & Kademe</div>
                <div className="cyber-stat-value" style={{ color: '#a5b4fc' }}>LVL {level}</div>
              </div>
              <div className="cyber-stat-card">
                <div className="cyber-stat-label"><span>💎</span> VIP Durumu</div>
                <div className="cyber-stat-value" style={{ fontSize: '1.1rem', color: vipActive ? '#86efac' : 'var(--text-dim)' }}>
                  {vipActive ? (profile?.vip_until ? `${formatDateSafe(profile.vip_until)}'e kadar` : 'Süresiz') : 'Standart'}
                </div>
              </div>
              <div className="cyber-stat-card">
                <div className="cyber-stat-label"><span>🎨</span> Kuşanılan Eşyalar</div>
                <div className="cyber-stat-value" style={{ fontSize: '1.1rem', color: '#f472b6' }}>
                  {[profile?.equipped_frame, profile?.equipped_name_color, profile?.equipped_background].filter(Boolean).length} / 3 Aktif
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>

      {/* 🧭 Modern Sekmeler (Tab Switcher) */}
      <div className="profile-nav-tabs">
        <button
          type="button"
          className={`profile-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span>📊</span>
          <span>Genel Bakış</span>
        </button>
        <button
          type="button"
          className={`profile-nav-tab ${activeTab === 'cosmetics' ? 'active' : ''}`}
          onClick={() => setActiveTab('cosmetics')}
        >
          <span>🎨</span>
          <span>Stil & Kozmetik</span>
        </button>
        <button
          type="button"
          className={`profile-nav-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <span>🛡️</span>
          <span>Hesap & Güvenlik</span>
        </button>
      </div>

      {/* 1. SEKME: GENEL BAKIŞ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '18px' }}>
          <div className="card">
            <h3>Hızlı Eylemler & Topluluk</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '.88rem', margin: '6px 0 16px' }}>
              XP kazanmak, çekilişe katılmak veya yeni kozmetikler açmak için etkinlik merkezlerini keşfet:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <a href="/gorevler" className="card" style={{ background: 'var(--bg-2)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.6rem' }}>🎯</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '.95rem' }}>Görevler & Başarılar</strong>
                  <span style={{ fontSize: '.78rem', color: 'var(--text-dim)' }}>XP ve unvan kazan</span>
                </div>
              </a>
              <a href="/magaza" className="card" style={{ background: 'var(--bg-2)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.6rem' }}>🛒</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '.95rem' }}>Kozmetik Mağazası</strong>
                  <span style={{ fontSize: '.78rem', color: 'var(--text-dim)' }}>Çerçeve ve efekt al</span>
                </div>
              </a>
              <a href="/cekilis" className="card" style={{ background: 'var(--bg-2)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.6rem' }}>🎡</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '.95rem' }}>Günlük Şans Çarkı</strong>
                  <span style={{ fontSize: '.78rem', color: 'var(--text-dim)' }}>Ücretsiz ödüller çevir</span>
                </div>
              </a>
            </div>
          </div>

          <div className="card">
            <h3>Hesap Bilgileri Özeti</h3>
            <div style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-2)', borderRadius: '10px', fontSize: '.88rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Kayıtlı E-posta:</span>
                <strong>{user?.email || '-'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-2)', borderRadius: '10px', fontSize: '.88rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Kullanıcı Rolü:</span>
                <strong style={{ textTransform: 'uppercase', color: 'var(--accent)' }}>{profile?.role || 'ÜYE'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-2)', borderRadius: '10px', fontSize: '.88rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Renkli İsim Geçerliliği:</span>
                <strong>{tempColorActive ? `${formatDateSafe(profile?.name_color_until)}` : 'Süresiz veya Yok'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-2)', borderRadius: '10px', fontSize: '.88rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Hareketli GIF Avatar:</span>
                <strong>{gifActive ? (vipActive ? 'Aktif (VIP)' : formatDateSafe(profile?.avatar_gif_until)) : 'Kapalı'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SEKME: KOZMETİK & STİL */}
      {activeTab === 'cosmetics' && (
        <div style={{ display: 'grid', gap: '18px' }}>
          {/* Kuşanılan Eşyalar */}
          <div className="card">
            <h3>Kuşanılan Eşyalar (Aktif Kozmetikler)</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--text-dim)', margin: '4px 0 14px' }}>
              Şu an profilinde, yorumlarda ve sohbette sergilenen aktif eşyaların:
            </p>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-2)', padding: '12px 16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🖼️</span>
                  <div>
                    <strong style={{ fontSize: '.9rem' }}>Avatar Çerçevesi</strong>
                    <div style={{ fontSize: '.8rem', color: 'var(--text-dim)' }}>
                      {profile?.equipped_frame ? 'Aktif Çerçeve Kuşanıldı' : 'Varsayılan'}
                    </div>
                  </div>
                </div>
                {profile?.equipped_frame && (
                  <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '.78rem' }} onClick={() => unequipCosmetic('equipped_frame')}>
                    Çıkar
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-2)', padding: '12px 16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🎨</span>
                  <div>
                    <strong style={{ fontSize: '.9rem' }}>İsim Rengi Efekti</strong>
                    <div style={{ fontSize: '.8rem' }}>
                      {profile?.equipped_name_color ? (
                        <NameTag name="Örnek Önizleme" color={nameColorVal} />
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>Varsayılan Beyaz</span>
                      )}
                    </div>
                  </div>
                </div>
                {profile?.equipped_name_color && (
                  <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '.78rem' }} onClick={() => unequipCosmetic('equipped_name_color')}>
                    Sıfırla
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-2)', padding: '12px 16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🌄</span>
                  <div>
                    <strong style={{ fontSize: '.9rem' }}>Profil Arka Planı</strong>
                    <div style={{ fontSize: '.8rem', color: 'var(--text-dim)' }}>
                      {profile?.equipped_background ? 'Mağaza Arka Planı Aktif' : 'Standart'}
                    </div>
                  </div>
                </div>
                {profile?.equipped_background && (
                  <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '.78rem' }} onClick={() => unequipCosmetic('equipped_background')}>
                    Kaldır
                  </button>
                )}
              </div>
            </div>
            <p style={{ marginTop: '14px', fontSize: '.84rem' }}>
              Yeni efekt ve eşyalar keşfetmek için <a href="/magaza" style={{ color: 'var(--accent)', fontWeight: 700 }}>Kozmetik Mağazasına git →</a>
            </p>
          </div>

          {/* Avatar Güncelleme */}
          <div className="card">
            <h3>Avatar Görseli</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--text-dim)', margin: '4px 0 12px' }}>
              Profil resmini PNG, JPG veya WEBP olarak yükle (en fazla 2 MB).
              {gifActive && (
                <span className="tag" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', marginLeft: '8px' }}>
                  ✨ VIP: Hareketli GIF Avatar Açık
                </span>
              )}
            </p>
            <div className="field">
              <input
                type="file"
                accept={gifActive ? 'image/png,image/jpeg,image/webp,image/gif' : 'image/png,image/jpeg,image/webp'}
                onChange={uploadAvatar}
              />
            </div>
            {profile?.avatar_url && (
              <button type="button" className="btn btn-ghost" style={{ marginTop: '8px' }} onClick={removeAvatar}>
                Avatarı Kaldır
              </button>
            )}
            {msg.avatar && <p style={{ marginTop: '10px', color: 'var(--accent)', fontSize: '.85rem' }}>{msg.avatar}</p>}
          </div>

          {/* Özel Profil Arka Planı (VIP) */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <h3>Özel Profil Arka Planı (Görsel veya GIF)</h3>
              <span className="tag" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>VIP</span>
            </div>
            <p style={{ fontSize: '.85rem', color: 'var(--text-dim)', margin: '6px 0 10px' }}>
              VIP üyeler kendi profillerine özel hareketli GIF veya yüksek kaliteli görsel arka plan yükleyebilir (en fazla 5 MB).
            </p>
            {vipActive ? (
              <div>
                <div className="field">
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadBackground} />
                </div>
                {profile?.profile_bg_url && (
                  <button type="button" className="btn btn-ghost" style={{ marginTop: '8px' }} onClick={removeCustomBackground}>
                    Özel Arka Planı Kaldır
                  </button>
                )}
                {msg.bg && <p style={{ marginTop: '10px', color: 'var(--accent)', fontSize: '.85rem' }}>{msg.bg}</p>}
              </div>
            ) : (
              <div style={{ background: 'var(--bg-2)', padding: '12px 16px', borderRadius: '12px', fontSize: '.85rem', color: 'var(--text-dim)' }}>
                Özel ve hareketli GIF arka plan yükleyebilmek için VIP üyeliğe sahip olmalısın.{' '}
                <a href="/magaza" style={{ color: 'var(--accent)', fontWeight: 700 }}>VIP olmak için Mağaza &rarr;</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SEKME: GÜVENLİK & HESAP AYARLARI */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gap: '18px' }}>
          <form className="card" onSubmit={saveUsername}>
            <h3>Kullanıcı Adı Değiştir</h3>
            <p style={{ fontSize: '.84rem', color: 'var(--text-dim)', margin: '4px 0 12px' }}>
              Sitede, sohbette ve sıralamalarda görünecek takma adın (3-20 karakter).
            </p>
            <div className="field">
              <input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20} required />
            </div>
            <button className="btn btn-spotlight-primary" type="submit" style={{ marginTop: '6px' }}>
              Kullanıcı Adını Güncelle
            </button>
            {msg.username && <p style={{ marginTop: '10px', color: 'var(--accent)', fontSize: '.85rem' }}>{msg.username}</p>}
          </form>

          <form className="card" onSubmit={saveEmail}>
            <h3>E-posta Adresi Değiştir</h3>
            <p style={{ fontSize: '.84rem', color: 'var(--text-dim)', margin: '4px 0 12px' }}>
              Mevcut e-posta: <strong>{user?.email || '-'}</strong>
            </p>
            <div className="field">
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Yeni e-posta adresi" required />
            </div>
            <button className="btn btn-ghost" type="submit" style={{ marginTop: '6px' }}>
              Onay Bağlantısı Gönder
            </button>
            {msg.email && <p style={{ marginTop: '10px', color: 'var(--accent)', fontSize: '.85rem' }}>{msg.email}</p>}
          </form>

          <form className="card" onSubmit={savePassword}>
            <h3>Şifre Değiştir</h3>
            <div className="field" style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '.8rem', color: 'var(--text-dim)' }}>Yeni Şifre</label>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="En az 6 karakter" autoComplete="new-password" required />
            </div>
            <div className="field">
              <label style={{ fontSize: '.8rem', color: 'var(--text-dim)' }}>Yeni Şifre (Tekrar)</label>
              <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Şifrenizi doğrulayın" autoComplete="new-password" required />
            </div>
            <button className="btn btn-ghost" type="submit" style={{ marginTop: '6px' }}>
              Şifreyi Güncelle
            </button>
            {msg.pw && <p style={{ marginTop: '10px', color: 'var(--accent)', fontSize: '.85rem' }}>{msg.pw}</p>}
          </form>

          <ErrorBoundary>
            <TwoFactor />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}

export default function ProfilPage() {
  return (
    <ErrorBoundary>
      <ProfilContent />
    </ErrorBoundary>
  );
}
