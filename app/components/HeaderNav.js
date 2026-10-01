'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Avatar, NameTag } from './UserBadge';
import { frameStyle, nameColorStyle, resolveFrame, resolveNameColor } from './cosmetics';
import { CoinIcon, SwordsIcon, ShieldIcon, CrownIcon, FireIcon, CardDeckIcon, TrophyIcon } from './CyberIcons';
import DarkModeToggle from './DarkModeToggle';
import { getEffectiveCoins, getEffectiveXP } from '../lib/wallet';

export default function HeaderNav() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null); // 'arena' | 'activity' | 'user' | null
  const navRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      setUser(data?.user || null);
      if (data?.user) {
        const u = data.user;
        const { data: p } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, role, coins, xp, is_admin, equipped_frame, equipped_name_color')
          .eq('id', u.id)
          .maybeSingle();
        if (mounted) {
          const effectiveCoins = getEffectiveCoins(u, p);
          const effectiveXp = getEffectiveXP(u, p);
          const localFrame = typeof window !== 'undefined' ? localStorage.getItem(`user_equipped_frame_${u.id}`) : null;
          const localNameColor = typeof window !== 'undefined' ? localStorage.getItem(`user_equipped_name_color_${u.id}`) : null;

          const activeFrame = p?.equipped_frame || u.user_metadata?.equipped_frame || localFrame || null;
          const activeNameColor = p?.equipped_name_color || u.user_metadata?.equipped_name_color || localNameColor || null;

          setProfile(p ? {
            ...p,
            coins: effectiveCoins,
            xp: effectiveXp,
            equipped_frame: activeFrame,
            equipped_name_color: activeNameColor,
          } : {
            id: u.id,
            username: u.user_metadata?.username || u.email?.split('@')[0],
            avatar_url: u.user_metadata?.avatar_url || null,
            coins: effectiveCoins,
            xp: effectiveXp,
            role: 'user',
            equipped_frame: activeFrame,
            equipped_name_color: activeNameColor,
          });
        }
      }
    });

    const handleProfileSync = (e) => {
      if (e?.detail) {
        setProfile((prev) => {
          if (!prev) return prev;
          const updated = { ...prev };
          if (e.detail.coins !== undefined) updated.coins = e.detail.coins;
          if (e.detail.xp !== undefined) updated.xp = e.detail.xp;
          if (e.detail.equipped_frame !== undefined) updated.equipped_frame = e.detail.equipped_frame;
          if (e.detail.equipped_name_color !== undefined) updated.equipped_name_color = e.detail.equipped_name_color;
          if (e.detail.avatar_url !== undefined) updated.avatar_url = e.detail.avatar_url;
          return updated;
        });
      }
    };

    window.addEventListener('coins-updated', handleProfileSync);
    window.addEventListener('xp-updated', handleProfileSync);
    window.addEventListener('profile-updated', handleProfileSync);
    window.addEventListener('cosmetics-updated', handleProfileSync);

    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      mounted = false;
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('coins-updated', handleProfileSync);
      window.removeEventListener('xp-updated', handleProfileSync);
      window.removeEventListener('profile-updated', handleProfileSync);
      window.removeEventListener('cosmetics-updated', handleProfileSync);
    };
  }, []);

  async function handleLogout(e) {
    e.preventDefault();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  const toggleDropdown = (key) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const closeDropdown = () => setOpenDropdown(null);

  const frameGrad = resolveFrame(profile?.equipped_frame);
  const nameColor = resolveNameColor(profile?.equipped_name_color);

  return (
    <nav className="nav-links modern-nav" ref={navRef}>
      {/* 1. GRUP: ARENALAR SEKMESİ */}
      <div className="nav-dropdown-wrap">
        <button
          type="button"
          className={`nav-dropdown-trigger ${openDropdown === 'arena' ? 'active' : ''}`}
          onClick={() => toggleDropdown('arena')}
        >
          <SwordsIcon size={16} />
          <span>Arenalar & Rehber</span>
          <span className="dropdown-arrow">▾</span>
        </button>

        {openDropdown === 'arena' && (
          <div className="nav-dropdown-menu">
            <a href="/#karakterler" onClick={closeDropdown} className="dropdown-item">
              <span className="dropdown-icon">🦸‍♂️</span>
              <div>
                <strong>Karakter Kataloğu</strong>
                <p>Güç puanları ve scaling analizleri</p>
              </div>
            </a>
            <a href="/vs" onClick={closeDropdown} className="dropdown-item">
              <span className="dropdown-icon"><SwordsIcon size={18} /></span>
              <div>
                <strong style={{ color: 'var(--accent)' }}>VS Arenası</strong>
                <p>Birebir düellolar ve topluluk oylaması</p>
              </div>
            </a>
            <a href="/kart-oyunu" onClick={closeDropdown} className="dropdown-item">
              <span className="dropdown-icon"><CardDeckIcon size={18} /></span>
              <div>
                <strong style={{ color: '#f59e0b' }}>Kart Arenası & Ligler</strong>
                <p>5v5 kart düellosu, kupa ligleri ve paket açılımı</p>
              </div>
            </a>
            <a href="/tier-sistemi" onClick={closeDropdown} className="dropdown-item">
              <span className="dropdown-icon"><ShieldIcon size={18} /></span>
              <div>
                <strong>Tier Sistemi</strong>
                <p>10-B'den 1-A'ya güç kademeleri rehberi</p>
              </div>
            </a>
          </div>
        )}
      </div>

      {/* 2. SOHBET ODASI & KAOS DUVARI */}
      <a href="/sohbet" className="nav-item-link" onClick={closeDropdown}>
        💬 Sohbet
      </a>
      <a
        href="/kaos"
        className="nav-item-link"
        onClick={closeDropdown}
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15))',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <FireIcon size={15} /> Kaos Duvarı
      </a>

      {/* 3. GRUP: ETKİNLİKLER & MAĞAZA SEKMESİ */}
      <div className="nav-dropdown-wrap">
        <button
          type="button"
          className={`nav-dropdown-trigger ${openDropdown === 'activity' ? 'active' : ''}`}
          onClick={() => toggleDropdown('activity')}
        >
          <TrophyIcon size={16} />
          <span>Etkinlikler & Mağaza</span>
          <span className="dropdown-arrow">▾</span>
        </button>

        {openDropdown === 'activity' && (
          <div className="nav-dropdown-menu">
            <a href="/oyunlar" onClick={closeDropdown} className="dropdown-item">
              <span className="dropdown-icon">🎮</span>
              <div>
                <strong style={{ color: 'var(--accent)' }}>Mini Oyunlar & Quiz</strong>
                <p>Karakter Bilmece & Kim Alır Düellosu</p>
              </div>
            </a>
            <a href="/magaza" onClick={closeDropdown} className="dropdown-item">
              <span className="dropdown-icon">🛍️</span>
              <div>
                <strong>Kozmetik Mağazası</strong>
                <p>Çerçeveler, renkler ve 30 günlük GIF hakları</p>
              </div>
            </a>
            <a href="/cekilis" onClick={closeDropdown} className="dropdown-item">
              <span className="dropdown-icon">🎡</span>
              <div>
                <strong>Günlük Çekiliş</strong>
                <p>Çarkıfelek çevir ve GIF izinleri kazan</p>
              </div>
            </a>
            <a href="/klanlar" onClick={closeDropdown} className="dropdown-item">
              <span className="dropdown-icon"><CrownIcon size={18} /></span>
              <div>
                <strong style={{ color: '#f59e0b' }}>Klanlar & Loncalar</strong>
                <p>Klan kur, ortak CP kas ve ligde yarış</p>
              </div>
            </a>
            <a href="/gorevler" onClick={closeDropdown} className="dropdown-item">
              <span className="dropdown-icon">📜</span>
              <div>
                <strong>Günlük Görevler</strong>
                <p>Görevleri yap, XP ve Tier Parası topla</p>
              </div>
            </a>
          </div>
        )}
      </div>

      {/* HAKKINDA LİNKİ */}
      <a href="/hakkinda" className="nav-item-link" onClick={closeDropdown}>
        ℹ️ Hakkında
      </a>

      {/* AYDINLIK / KARANLIK MODU TOGGLE */}
      <DarkModeToggle />

      {/* 4. KULLANICI / PROFİL BÖLÜMÜ */}
      {!user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <a href="/giris-yap" className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '.85rem' }}>
            Giriş Yap
          </a>
          <a href="/kayit-ol" className="btn" style={{ padding: '6px 14px', fontSize: '.85rem' }}>
            Kayıt Ol
          </a>
        </div>
      ) : (
        <div className="nav-dropdown-wrap" style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            className="user-nav-pill"
            onClick={() => toggleDropdown('user')}
          >
            <Avatar
              url={profile?.avatar_url}
              name={profile?.username || '?'}
              size={26}
              frameGradient={frameGrad}
            />
            <span className="user-nav-name">
              <NameTag name={profile?.username || 'Kullanıcı'} color={nameColor} />
            </span>
            <span className="user-nav-coins" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <CoinIcon size={14} /> {(profile?.coins || 0).toLocaleString('tr-TR')}
            </span>
            <span className="dropdown-arrow">▾</span>
          </button>

          {openDropdown === 'user' && (
            <div className="nav-dropdown-menu nav-user-dropdown">
              <div className="nav-user-header">
                <Avatar
                  url={profile?.avatar_url}
                  name={profile?.username || '?'}
                  size={36}
                  frameGradient={frameGrad}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 800, fontSize: '.92rem' }}>
                    <NameTag name={profile?.username || 'Kullanıcı'} color={nameColor} />
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    <CoinIcon size={13} /> {(profile?.coins || 0).toLocaleString('tr-TR')} Tier Parası
                  </div>
                </div>
              </div>

              <div className="dropdown-divider" />

              <a href="/profil" onClick={closeDropdown} className="dropdown-item">
                <span className="dropdown-icon">👤</span>
                <div>
                  <strong>Profil & Kozmetikler</strong>
                  <p>Stilini düzenle ve süreni gör</p>
                </div>
              </a>

              <a href="/magaza" onClick={closeDropdown} className="dropdown-item">
                <span className="dropdown-icon">🛍️</span>
                <div>
                  <strong>Mağazaya Git</strong>
                  <p>Altınlarını harca ve özelleştir</p>
                </div>
              </a>

              {profile?.is_admin && (
                <a href="/admin" onClick={closeDropdown} className="dropdown-item">
                  <span className="dropdown-icon">⚙️</span>
                  <div>
                    <strong>Admin Paneli</strong>
                    <p>Site yönetimi ve düzenleme</p>
                  </div>
                </a>
              )}

              <div className="dropdown-divider" />

              <a
                href="#"
                onClick={(e) => {
                  closeDropdown();
                  handleLogout(e);
                }}
                className="dropdown-item"
                style={{ color: '#e6455b' }}
              >
                <span className="dropdown-icon">🚪</span>
                <div>
                  <strong style={{ color: '#e6455b' }}>Çıkış Yap</strong>
                </div>
              </a>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
