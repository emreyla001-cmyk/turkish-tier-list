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

function ProfilContent() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
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
        .select('id, username, avatar_url, role, xp, coins, vip_until, name_color_until, avatar_gif_until, equipped_frame, equipped_background, equipped_name_color')
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
    const gifAllowed = isFutureDate(profile?.avatar_gif_until);
    const okTypes = gifAllowed ? { ...EXT, 'image/gif': 'gif' } : EXT;
    if (!okTypes[file.type]) {
      say('avatar', gifAllowed ? 'Sadece PNG, JPG, WEBP veya GIF yükleyebilirsin.' : 'Sadece PNG, JPG veya WEBP yükleyebilirsin. GIF için mağazadan veya günlük çekilişten hak kazanmalısın.');
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

  if (user === undefined) return <div className="wrap empty">Yükleniyor...</div>;
  if (!user) return <div className="wrap empty">Profil ayarları için <a href="/giris-yap">giriş yapmalısın</a>.</div>;
  if (!profile) return <div className="wrap empty">Yükleniyor...</div>;

  const vipActive = profile?.role === 'vip' || profile?.role === 'admin' || isFutureDate(profile?.vip_until);
  const tempColorActive = isFutureDate(profile?.name_color_until);
  const gifActive = isFutureDate(profile?.avatar_gif_until);
  const currentXp = Number(profile?.xp) || 0;
  const level = levelFromXp(currentXp);
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const xpDiff = Math.max(1, next - cur);
  const pct = Math.min(100, Math.max(0, Math.round(((currentXp - cur) / xpDiff) * 100)));

  const bannerBg = resolveBackground(profile?.equipped_background, frameMap);
  const frameGrad = resolveFrame(profile?.equipped_frame, frameMap);
  const nameColorVal = resolveNameColor(profile?.equipped_name_color, frameMap);

  async function unequipCosmetic(column) {
    await supabase.from('profiles').update({ [column]: null }).eq('id', user.id);
    load();
  }

  return (
    <div className="wrap" style={{ maxWidth: '640px' }}>
      <h1>Profil Ayarları</h1>

      <ErrorBoundary>
        <div
          className="card profile-banner"
          style={{
            backgroundImage: bannerBg ? `${bannerBg}` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="profile-head">
            <Avatar url={profile?.avatar_url} name={profile?.username || user?.email || '?'} size={72} frameGradient={frameGrad} />
            <div>
              <h3 style={{ margin: '0 0 6px' }}>
                <NameTag name={profile?.username || 'Kullanıcı'} color={nameColorVal} />
              </h3>
              <UserBadge role={profile?.role || 'user'} xp={currentXp} vipActive={vipActive} />
            </div>
          </div>
          <div className="xp-track"><div className="xp-fill" style={{ width: `${pct}%` }} /></div>
          <p style={{ marginTop: '6px', fontSize: '.8rem' }}>{currentXp} XP · Sonraki seviyeye {Math.max(0, next - currentXp)} XP</p>
          <div className="status-grid">
            <div><span>🪙 Tier Parası</span><strong>{profile?.coins ?? 0}</strong></div>
            <div><span>💎 VIP</span><strong>{vipActive ? (profile?.vip_until ? `${formatDateSafe(profile.vip_until)} tarihine kadar` : 'Süresiz (rol)') : 'Yok'}</strong></div>
            <div><span>🌈 Renkli İsim Hakkı</span><strong>{tempColorActive ? `${formatDateSafe(profile?.name_color_until)} tarihine kadar` : 'Yok'}</strong></div>
            <div><span>🎞️ Hareketli Avatar Hakkı</span><strong>{gifActive ? `${formatDateSafe(profile?.avatar_gif_until)} tarihine kadar` : 'Yok'}</strong></div>
          </div>
          <p style={{ marginTop: '10px', fontSize: '.85rem', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <a href="/gorevler" style={{ color: 'var(--accent)', fontWeight: 700 }}>Görevler ve başarılar →</a>
            <a href="/magaza" style={{ color: 'var(--accent)', fontWeight: 700 }}>Mağaza →</a>
            <a href="/cekilis" style={{ color: 'var(--accent)', fontWeight: 700 }}>Günlük çekiliş →</a>
          </p>
        </div>
      </ErrorBoundary>

      {/* Kuşanılan Kozmetikler Yönetim Kartı */}
      <div className="card" style={{ marginTop: '14px' }}>
        <h3>Kuşanılan Eşyalar (Kozmetikler)</h3>
        <p style={{ fontSize: '.85rem', color: 'var(--text-dim)', margin: '4px 0 12px' }}>
          Mağazadan aldığın ve şu an profilinde/sohbette aktif olan eşyalar:
        </p>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-2)', padding: '10px 14px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🖼️</span>
              <div>
                <strong style={{ fontSize: '.88rem' }}>Avatar Çerçevesi:</strong>{' '}
                <span style={{ fontSize: '.85rem', color: 'var(--text-dim)' }}>
                  {profile?.equipped_frame ? 'Aktif' : 'Varsayılan'}
                </span>
              </div>
            </div>
            {profile?.equipped_frame && (
              <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '.75rem' }} onClick={() => unequipCosmetic('equipped_frame')}>
                Çerçeveyi Çıkar
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-2)', padding: '10px 14px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🎨</span>
              <div>
                <strong style={{ fontSize: '.88rem' }}>İsim Rengi:</strong>{' '}
                <span style={{ fontSize: '.85rem' }}>
                  {profile?.equipped_name_color ? (
                    <NameTag name="Örnek İsim" color={nameColorVal} />
                  ) : (
                    <span style={{ color: 'var(--text-dim)' }}>Varsayılan</span>
                  )}
                </span>
              </div>
            </div>
            {profile?.equipped_name_color && (
              <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '.75rem' }} onClick={() => unequipCosmetic('equipped_name_color')}>
                Rengi Sıfırla
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-2)', padding: '10px 14px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🌄</span>
              <div>
                <strong style={{ fontSize: '.88rem' }}>Profil Arka Planı:</strong>{' '}
                <span style={{ fontSize: '.85rem', color: 'var(--text-dim)' }}>
                  {profile?.equipped_background ? 'Aktif' : 'Varsayılan'}
                </span>
              </div>
            </div>
            {profile?.equipped_background && (
              <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '.75rem' }} onClick={() => unequipCosmetic('equipped_background')}>
                Arka Planı Kaldır
              </button>
            )}
          </div>
        </div>
        <p style={{ marginTop: '12px', fontSize: '.82rem' }}>
          Yeni çerçeve ve efektler için <a href="/magaza" style={{ color: 'var(--accent)', fontWeight: 700 }}>Mağazayı ziyaret et →</a>
        </p>
      </div>

      <div className="card" style={{ marginTop: '14px' }}>
        <h3>Avatar</h3>
        <p>PNG, JPG veya WEBP, en fazla 2 MB.</p>
        <div className="field" style={{ marginTop: '12px' }}>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} />
        </div>
        {profile?.avatar_url && <button type="button" className="btn btn-ghost" onClick={removeAvatar}>Avatarı kaldır</button>}
        {msg.avatar && <p style={{ marginTop: '10px', color: 'var(--text-dim)', fontSize: '.85rem' }}>{msg.avatar}</p>}
      </div>

      <form className="card" style={{ marginTop: '14px' }} onSubmit={saveUsername}>
        <h3>Kullanıcı Adı</h3>
        <div className="field" style={{ marginTop: '12px' }}>
          <input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20} required />
        </div>
        <button className="btn" type="submit">Kaydet</button>
        {msg.username && <p style={{ marginTop: '10px', color: 'var(--text-dim)', fontSize: '.85rem' }}>{msg.username}</p>}
      </form>

      <form className="card" style={{ marginTop: '14px' }} onSubmit={saveEmail}>
        <h3>E-posta</h3>
        <p>Şu anki e-postan: {user?.email || '-'}</p>
        <div className="field" style={{ marginTop: '12px' }}>
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Yeni e-posta adresi" required />
        </div>
        <button className="btn" type="submit">E-postayı Değiştir</button>
        {msg.email && <p style={{ marginTop: '10px', color: 'var(--text-dim)', fontSize: '.85rem' }}>{msg.email}</p>}
      </form>

      <form className="card" style={{ marginTop: '14px' }} onSubmit={savePassword}>
        <h3>Şifre</h3>
        <div className="field" style={{ marginTop: '12px' }}>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Yeni şifre" autoComplete="new-password" required />
        </div>
        <div className="field">
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Yeni şifre (tekrar)" autoComplete="new-password" required />
        </div>
        <button className="btn" type="submit">Şifreyi Değiştir</button>
        {msg.pw && <p style={{ marginTop: '10px', color: 'var(--text-dim)', fontSize: '.85rem' }}>{msg.pw}</p>}
      </form>

      <ErrorBoundary>
        <TwoFactor />
      </ErrorBoundary>
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
