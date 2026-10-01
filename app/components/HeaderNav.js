'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { Avatar, NameTag } from './UserBadge';
import { resolveFrame, resolveNameColor } from './cosmetics';
import { CoinIcon } from './CyberIcons';
import DarkModeToggle from './DarkModeToggle';
import { getEffectiveCoins, getEffectiveXP } from '../lib/wallet';

export default function HeaderNav() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [openUserDropdown, setOpenUserDropdown] = useState(false);
  const [openExploreDropdown, setOpenExploreDropdown] = useState(false);
  const navRef = useRef(null);
  const pathname = usePathname();

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
        setOpenUserDropdown(false);
        setOpenExploreDropdown(false);
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

  const frameGrad = resolveFrame(profile?.equipped_frame);
  const nameColor = resolveNameColor(profile?.equipped_name_color);

  const mainNavLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/tier-sistemi', label: 'Tier Sistemi' },
    { href: '/vs', label: 'Karakter Karşılaşması' },
    { href: '/kart-oyunu', label: 'Arena' },
    { href: '/magaza', label: 'Mağaza' },
  ];

  const exploreSubLinks = [
    { href: '/oyunlar', label: 'Mini Oyunlar', desc: 'Bilmece, Kim Alır & Düellolar' },
    { href: '/koleksiyon', label: 'Koleksiyon Albümü', desc: 'Açılan kartlar ve albüm ödülleri' },
    { href: '/klanlar', label: 'Klanlar & Loncalar', desc: 'Topluluk klanları ve rekabet' },
    { href: '/kaos', label: 'Kaos Duvarı', desc: 'Rastgele kart kapışmaları' },
    { href: '/gorevler', label: 'Görevler', desc: 'Günlük görevler ve rozetler' },
    { href: '/cekilis', label: 'Çarkıfelek', desc: 'Günlük şans çarkı' },
    { href: '/hakkinda', label: 'Hakkında', desc: 'Adil kullanım ve sistem rehberi' },
  ];

  const isExploreActive = exploreSubLinks.some(link => pathname === link.href);

  return (
    <nav className="unified-nav-row" ref={navRef}>
      {/* ÜST DÜZEY GEZİNTİ MENÜSÜ */}
      <div className="unified-nav-links">
        {mainNavLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <a
              key={link.href}
              href={link.href}
              className={`unified-nav-item ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </a>
          );
        })}

        {/* ALT KADEME / DİĞER KEŞFET DROPDOWN */}
        <div
          className="nav-dropdown-wrap"
          onMouseEnter={() => setOpenExploreDropdown(true)}
          onMouseLeave={() => setOpenExploreDropdown(false)}
        >
          <button
            type="button"
            className={`unified-nav-item nav-explore-btn ${isExploreActive ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpenExploreDropdown((prev) => !prev);
            }}
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            Diğer Keşfet <span style={{ fontSize: '.75rem', marginLeft: '4px' }}>▾</span>
          </button>

          {openExploreDropdown && (
            <div className="nav-dropdown-menu nav-explore-dropdown">
              {exploreSubLinks.map((sub) => {
                const isSubActive = pathname === sub.href;
                return (
                  <a
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setOpenExploreDropdown(false)}
                    className={`dropdown-item ${isSubActive ? 'active' : ''}`}
                  >
                    <div>
                      <strong style={{ color: isSubActive ? 'var(--accent)' : 'inherit' }}>{sub.label}</strong>
                      <p>{sub.desc}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SAĞ TARAF: TEMA & PROFİL */}
      <div className="unified-nav-right">
        <DarkModeToggle />

        {!user ? (
          <div className="auth-btn-group">
            <a href="/giris-yap" className="btn btn-ghost btn-sm">
              Giriş Yap
            </a>
            <a href="/kayit-ol" className="btn btn-sm">
              Kayıt Ol
            </a>
          </div>
        ) : (
          <div className="nav-dropdown-wrap">
            <button
              type="button"
              className="user-nav-pill-unified"
              onClick={() => setOpenUserDropdown(!openUserDropdown)}
            >
              <Avatar
                url={profile?.avatar_url}
                name={profile?.username || '?'}
                size={28}
                frameGradient={frameGrad}
              />
              <span className="user-nav-name">
                <NameTag name={profile?.username || 'Kullanıcı'} color={nameColor} />
              </span>
              <span className="user-nav-coins">
                <CoinIcon size={14} /> {(profile?.coins || 0).toLocaleString('tr-TR')}
              </span>
            </button>

            {openUserDropdown && (
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

                <a href="/profil" onClick={() => setOpenUserDropdown(false)} className="dropdown-item">
                  <span className="dropdown-icon">👤</span>
                  <div>
                    <strong>Profil & Kozmetikler</strong>
                    <p>Stilini düzenle ve süreni gör</p>
                  </div>
                </a>

                <a href="/magaza" onClick={() => setOpenUserDropdown(false)} className="dropdown-item">
                  <span className="dropdown-icon">🛍️</span>
                  <div>
                    <strong>Mağazaya Git</strong>
                    <p>Altınlarını harca ve özelleştir</p>
                  </div>
                </a>

                {profile?.is_admin && (
                  <a href="/admin" onClick={() => setOpenUserDropdown(false)} className="dropdown-item">
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
                    setOpenUserDropdown(false);
                    handleLogout(e);
                  }}
                  className="dropdown-item"
                  style={{ color: '#ef4444' }}
                >
                  <span className="dropdown-icon">🚪</span>
                  <div>
                    <strong style={{ color: '#ef4444' }}>Çıkış Yap</strong>
                  </div>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
