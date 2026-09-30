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

function isVipUser(p) {
  if (!p) return false;
  return p.role === 'vip' || p.role === 'admin' || p.role === 'moderator' || isFutureDate(p.vip_until);
}

function ProfilContent() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
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

      // Rozetleri getir
      fetch(`/api/badges?userId=${u.id}`)
        .then((res) => res.json())
        .then((d) => {
          if (d?.badgeIds) setUserBadges(d.badgeIds);
        })
        .catch(() => {});

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
        avatar_gif_until: u.user_metadata?.avatar_gif_until || null,
        profile_bg_until: u.user_metadata?.profile_bg_until || null,
        equipped_frame: null,
        equipped_background: null,
        equipped_name_color: null,
        profile_bg_url: u.user_metadata?.profile_bg_url || null,
      };

      const prof = data ? { ...fallbackProfile, ...data } : fallbackProfile;
      if (!prof.profile_bg_url && u.user_metadata?.profile_bg_url) {
        prof.profile_bg_url = u.user_metadata.profile_bg_url;
      }
      if (!prof.profile_bg_until && u.user_metadata?.profile_bg_until) {
        prof.profile_bg_until = u.user_metadata.profile_bg_until;
      }
      if (!prof.avatar_gif_until && u.user_metadata?.avatar_gif_until) {
        prof.avatar_gif_until = u.user_metadata.avatar_gif_until;
      }
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
    const gifAllowed = isVip || isFutureDate(profile?.avatar_gif_until) || isFutureDate(user?.user_metadata?.avatar_gif_until);
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

    if (isGif && !gifAllowed) {
      say('avatar', 'Hareketli GIF avatar yüklemek VIP üyelere veya Mağaza\'dan 30 Günlük GIF Avatar Hakkı (30.000 Altın) alanlara özeldir. Standart üyeler PNG, JPG veya WEBP yükleyebilir.');
      return;
    }

    const okTypes = gifAllowed ? { ...EXT, 'image/gif': 'gif' } : EXT;
    if (!okTypes[file.type] && !isGif) {
      say(
        'avatar',
        gifAllowed
          ? 'Sadece PNG, JPG, WEBP veya GIF yükleyebilirsin.'
          : 'Sadece PNG, JPG veya WEBP formatında görsel yükleyebilirsin.'
      );
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      say('avatar', 'Avatar dosyası en fazla 10 MB olabilir.');
      return;
    }

    say('avatar', 'Yükleniyor...');
    const fileExt = isGif ? 'gif' : (okTypes[file.type] || 'jpg');
    const path = `avatars/${user.id}/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('character-media').upload(path, file, { contentType: file.type || 'image/gif', upsert: true });
    if (error) {
      say('avatar', 'Yüklenemedi: ' + (error.message || ''));
      return;
    }
    const { data } = supabase.storage.from('character-media').getPublicUrl(path);
    const newAvatarUrl = data?.publicUrl;

    let saved = false;
    let errMsg = '';
    try {
      const { error: err2 } = await supabase.from('profiles').update({ avatar_url: newAvatarUrl }).eq('id', user.id);
      if (!err2) saved = true;
      else errMsg = err2.message || '';
    } catch (e) {
      errMsg = e.message || '';
    }

    try {
      const { error: authErr } = await supabase.auth.updateUser({ data: { avatar_url: newAvatarUrl } });
      if (!authErr) saved = true;
    } catch {}

    say('avatar', saved ? 'Avatarın güncellendi!' : `Kaydedilemedi: ${errMsg || 'Hata oluştu'}`);
    load();
  }

  async function removeAvatar() {
    try {
      await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
    } catch {}
    try {
      await supabase.auth.updateUser({ data: { avatar_url: null } });
    } catch {}
    say('avatar', 'Avatar kaldırıldı.');
    load();
  }

  async function uploadBackground(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVip = isVipUser(profile);
    const bgAllowed = isVip || isFutureDate(profile?.profile_bg_until) || isFutureDate(user?.user_metadata?.profile_bg_until);
    if (!bgAllowed) {
      say('bg', 'Özel ve hareketli GIF profil arka planı yüklemek VIP üyelere veya Mağaza\'dan 30 Günlük Arka Plan Hakkı (30.000 Altın) alanlara özeldir. Mağaza\'yı ziyaret edebilirsin.');
      return;
    }
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    const okTypes = { ...EXT, 'image/gif': 'gif' };
    if (!okTypes[file.type] && !isGif) {
      say('bg', 'Sadece PNG, JPG, WEBP veya GIF formatında arka plan yükleyebilirsin.');
      return;
    }
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      say('bg', 'Arka plan görseli en fazla 10 MB olabilir.');
      return;
    }
    say('bg', 'Arka plan yükleniyor...');
    const fileExt = isGif ? 'gif' : (okTypes[file.type] || 'jpg');
    const path = `backgrounds/${user.id}/bg_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('character-media').upload(path, file, { contentType: file.type || 'image/gif', upsert: true });
    if (error) {
      say('bg', 'Yüklenemedi: ' + (error.message || ''));
      return;
    }
    const { data } = supabase.storage.from('character-media').getPublicUrl(path);
    const newBgUrl = data?.publicUrl;

    let saved = false;
    let errMsg = '';
    // 1. profiles tablosunu güncelle
    try {
      const { error: err2 } = await supabase.from('profiles').update({ profile_bg_url: newBgUrl }).eq('id', user.id);
      if (!err2) {
        saved = true;
      } else {
        errMsg = err2.message || '';
      }
    } catch (e) {
      errMsg = e.message || '';
    }

    // 2. Supabase Auth user_metadata'ya da kaydet (RLS kısıtlamalarına karşı yedekli)
    try {
      const { error: authErr } = await supabase.auth.updateUser({
        data: { profile_bg_url: newBgUrl }
      });
      if (!authErr) {
        saved = true;
      }
    } catch {}

    say('bg', saved ? 'Özel profil arka planın güncellendi!' : `Kaydedilemedi: ${errMsg || 'Hata oluştu'}`);
    load();
  }

  async function removeCustomBackground() {
    try {
      await supabase.from('profiles').update({ profile_bg_url: null }).eq('id', user.id);
    } catch {}
    try {
      await supabase.auth.updateUser({ data: { profile_bg_url: null } });
    } catch {}
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
  const gifActive = vipActive || isFutureDate(profile?.avatar_gif_until) || isFutureDate(user?.user_metadata?.avatar_gif_until);
  const bgActive = vipActive || isFutureDate(profile?.profile_bg_until) || isFutureDate(user?.user_metadata?.profile_bg_until);

  const avatarGifRemaining = vipActive ? 'Sınırsız (VIP)' : getRemainingTimeText(profile?.avatar_gif_until || user?.user_metadata?.avatar_gif_until);
  const profileBgRemaining = vipActive ? 'Sınırsız (VIP)' : getRemainingTimeText(profile?.profile_bg_until || user?.user_metadata?.profile_bg_until);

  const currentXp = Number(profile?.xp) || 0;
  const level = levelFromXp(currentXp);
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const xpDiff = Math.max(1, next - cur);
  const pct = Math.min(100, Math.max(0, Math.round(((currentXp - cur) / xpDiff) * 100)));

  // Eğer VIP veya 30 Günlük hak yoksa / süresi dolduysa, özel yüklenen görsel gösterilmez (varsayılana döner)
  const bannerBg = (bgActive && profile?.profile_bg_url)
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
                  <UserBadge role={profile?.role || 'user'} xp={currentXp} vipActive={vipActive} badges={userBadges} />
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
            <div className="cyber-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
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
                <div className="cyber-stat-value" style={{ fontSize: '1.05rem', color: vipActive ? '#86efac' : 'var(--text-dim)' }}>
                  {vipActive ? (profile?.vip_until ? `${formatDateSafe(profile.vip_until)}'e kadar` : 'Süresiz') : 'Standart'}
                </div>
              </div>
              <div className="cyber-stat-card">
                <div className="cyber-stat-label"><span>🎞️</span> GIF Avatar</div>
                <div className="cyber-stat-value" style={{ fontSize: '.95rem', color: avatarGifRemaining && avatarGifRemaining !== 'Süresi Doldu' ? '#86efac' : 'var(--text-dim)' }}>
                  {avatarGifRemaining || 'Kilitli'}
                </div>
              </div>
              <div className="cyber-stat-card">
                <div className="cyber-stat-label"><span>🖼️</span> GIF Arka Plan</div>
                <div className="cyber-stat-value" style={{ fontSize: '.95rem', color: profileBgRemaining && profileBgRemaining !== 'Süresi Doldu' ? '#86efac' : 'var(--text-dim)' }}>
                  {profileBgRemaining || 'Kilitli'}
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

          {/* Prestij Rozetleri Vitrini (Flex Alanı) */}
          <div className="card" style={{ border: '1px solid rgba(245, 158, 11, 0.3)', background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.8), rgba(9, 9, 11, 0.9))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#fef08a' }}>
                <span>🏆</span> Prestij Rozetleri Vitrini
              </h3>
              <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontWeight: 800 }}>
                {userBadges.length} Kazanılan Rozet
              </span>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '.86rem', margin: '0 0 16px' }}>
              Topluluğa ve Türk Kurgu Evrenine sağladığın katkılar, kültürel başarımlar ve yarışma nişanları burada sergilenir:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {/* 1. Katkıcı Rozeti */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: userBadges.includes('katkici') ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05))' : 'var(--bg-2)',
                  border: userBadges.includes('katkici') ? '1px solid #f59e0b' : '1px solid var(--border)',
                  opacity: userBadges.includes('katkici') ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <span style={{ fontSize: '2.4rem' }}>🌟</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '.92rem', color: userBadges.includes('katkici') ? '#f59e0b' : 'var(--text-dim)' }}>
                      Evren Katkıcısı
                    </strong>
                    {userBadges.includes('katkici') && <span className="tag" style={{ background: '#f59e0b', color: '#000', fontSize: '.7rem', fontWeight: 800 }}>KAZANILDI</span>}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '.78rem', color: 'var(--text-dim)', lineHeight: 1.35 }}>
                    Karakter önerisi editörlerce onaylanan ve evrene yeni figür kazandıran usta yazar.
                  </p>
                </div>
              </div>

              {/* 2. Kaos Elçisi */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: userBadges.includes('kaos_elcisi') ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(185, 28, 28, 0.05))' : 'var(--bg-2)',
                  border: userBadges.includes('kaos_elcisi') ? '1px solid #ef4444' : '1px solid var(--border)',
                  opacity: userBadges.includes('kaos_elcisi') ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <span style={{ fontSize: '2.4rem' }}>🔥</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '.92rem', color: userBadges.includes('kaos_elcisi') ? '#ef4444' : 'var(--text-dim)' }}>
                      Kaos Elçisi
                    </strong>
                    {userBadges.includes('kaos_elcisi') && <span className="tag" style={{ background: '#ef4444', color: '#fff', fontSize: '.7rem', fontWeight: 800 }}>KAZANILDI</span>}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '.78rem', color: 'var(--text-dim)', lineHeight: 1.35 }}>
                    Kaos Duvarında Haftanın Mitik Deliliğine seçilerek en yüksek oyu toplayan viral üretici.
                  </p>
                </div>
              </div>

              {/* 3. Kültür & Onur Muhafızı (5816 Kanunu Uyumlu, Satılamaz/Gacha Dışı) */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: userBadges.includes('onur_muhafizi') ? 'linear-gradient(135deg, rgba(225, 29, 72, 0.15), rgba(159, 18, 57, 0.05))' : 'var(--bg-2)',
                  border: userBadges.includes('onur_muhafizi') ? '1px solid #e11d48' : '1px solid var(--border)',
                  opacity: userBadges.includes('onur_muhafizi') ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <span style={{ fontSize: '2.4rem' }}>🇹🇷</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '.92rem', color: userBadges.includes('onur_muhafizi') ? '#e11d48' : 'var(--text-dim)' }}>
                      Kültür & Onur Muhafızı
                    </strong>
                    {userBadges.includes('onur_muhafizi') && <span className="tag" style={{ background: '#e11d48', color: '#fff', fontSize: '.7rem', fontWeight: 800 }}>KAZANILDI</span>}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '.78rem', color: 'var(--text-dim)', lineHeight: 1.35 }}>
                    Milli miras ve mitolojik figürleri en yüksek başarımla savunan onur nişanı (Devredilemez / Satılamaz).
                  </p>
                </div>
              </div>
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
                <strong>{gifActive ? (vipActive ? 'Aktif (💎 VIP - 10 MB)' : formatDateSafe(profile?.avatar_gif_until)) : 'Kapalı (VIP Gerekir)'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-2)', borderRadius: '10px', fontSize: '.88rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Hareketli GIF Arka Plan:</span>
                <strong>{vipActive ? 'Aktif (💎 VIP - 10 MB)' : 'Kapalı (VIP Gerekir)'}</strong>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <h3>Avatar Görseli</h3>
              {gifActive ? (
                <span className="tag" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(230, 179, 37, 0.1)' }}>
                  ✨ GIF Avatar Açık · {avatarGifRemaining}
                </span>
              ) : (
                <span className="tag" style={{ borderColor: 'var(--border)', color: 'var(--text-dim)' }}>
                  Standart: 10 MB (GIF için VIP veya 30 Günlük Hak)
                </span>
              )}
            </div>
            <p style={{ fontSize: '.85rem', color: 'var(--text-dim)', margin: '6px 0 12px' }}>
              Profil resmini PNG, JPG veya WEBP olarak yükle (en fazla 10 MB).{' '}
              {gifActive ? (
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  ✨ Hareketli GIF avatar ayrıcalığın aktif! ({avatarGifRemaining})
                </span>
              ) : (
                <span>
                  💎 Hareketli GIF avatar yüklemek <strong>VIP üyelere</strong> veya Mağaza'dan <strong>30 Günlük GIF Avatar Hakkı</strong> alanlara özeldir.{' '}
                  <a href="/magaza" style={{ color: 'var(--accent)', fontWeight: 700 }}>Mağaza'dan Al &rarr;</a>
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

          {/* Özel Profil Arka Planı (VIP veya 30 Günlük Hak) */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <h3>Özel Profil Arka Planı (Görsel veya Hareketli GIF)</h3>
              {bgActive ? (
                <span className="tag" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(230, 179, 37, 0.1)' }}>
                  ✨ GIF Arka Plan Açık · {profileBgRemaining}
                </span>
              ) : (
                <span className="tag" style={{ borderColor: 'var(--border)', color: 'var(--text-dim)' }}>
                  VIP veya 30 Günlük Hak Gerekir (10 MB)
                </span>
              )}
            </div>
            <p style={{ fontSize: '.85rem', color: 'var(--text-dim)', margin: '6px 0 10px' }}>
              Profiline özel hareketli GIF veya yüksek kaliteli görsel arka plan yükleyebilirsin (en fazla 10 MB).
            </p>
            {bgActive ? (
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
              <div style={{ background: 'var(--bg-2)', padding: '14px 18px', borderRadius: '12px', fontSize: '.88rem', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
                🔒 Özel ve hareketli GIF profil arka planı yüklemek <strong>VIP üyelere</strong> veya Mağaza'dan <strong>30 Günlük Arka Plan Hakkı</strong> alanlara özeldir.{' '}
                <a href="/magaza" style={{ color: 'var(--accent)', fontWeight: 700, marginLeft: '6px' }}>Mağaza'dan 30.000 Altına Al &rarr;</a>
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
