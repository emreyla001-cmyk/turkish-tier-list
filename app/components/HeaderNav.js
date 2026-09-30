'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Avatar, NameTag } from './UserBadge';
import { resolveFrame, resolveNameColor } from './cosmetics';

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
        const { data: p } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, role, coins, is_admin, equipped_frame, equipped_name_color')
          .eq('id', data.user.id)
          .maybeSingle();
        if (mounted) {
          const effectiveCoins = data.user.user_metadata?.coins !== undefined
            ? Number(data.user.user_metadata.coins)
            : Number(p?.coins || 0);

          setProfile(p ? { ...p, coins: effectiveCoins } : {
            username: data.user.user_metadata?.username || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url || null,
            coins: effectiveCoins,
            role: 'user',
          });
        }
      }
    });

    const handleCoinsUpdated = (e) => {
      if (e?.detail?.coins !== undefined) {
        setProfile((prev) => (prev ? { ...prev, coins: e.detail.coins } : prev));
      } else if (mounted) {
        supabase.auth.getUser().then(async ({ data: ud }) => {
          if (ud?.user) {
            const { data: p } = await supabase
              .from('profiles')
              .select('id, username, avatar_url, role, coins, is_admin, equipped_frame, equipped_name_color')
              .eq('id', ud.user.id)
              .maybeSingle();
            const effectiveCoins = ud.user.user_metadata?.coins !== undefined
              ? Number(ud.user.user_metadata.coins)
              : Number(p?.coins || 0);
            if (mounted) setProfile(p ? { ...p, coins: effectiveCoins } : null);
          }
        });
      }
    };

    window.addEventListener('coins-updated', handleCoinsUpdated);
    window.addEventListener('profile-updated', handleCoinsUpdated);

    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      mounted = false;
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('coins-updated', handleCoinsUpdated);
      window.removeEventListener('profile-updated', handleCoinsUpdated);
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
      {/* 1. GRUP: KATALOG & ARENALAR SEKMESİ */}
      <div className="nav-dropdown-wrap">
        <button
          type="button"
          className={`nav-dropdown-trigger ${openDropdown === 'arena' ? 'active' : ''}`}
          onClick={() => toggleDropdown('arena')}
        >
          <span>⚔️ Arenalar & Rehber</span>
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
              <span className="dropdown-icon">⚔️</span>
              <div>
                <strong style={{ color: 'var(--accent)' }}>VS Arenası</strong>
                <p>Birebir düellolar ve topluluk oylaması</p>
              </div>
            </a>
            <a href="/kart-oyunu" onClick={closeDropdown} className="dropdown-item">
              <span className="dropdown-icon">🃏</span>
              <div>
                <strong style={{ color: '#eab308' }}>Kart Arenası & Ligler</strong>
                <p>5v5 kart düellosu, kupa ligleri ve paket açılımı</p>
              </div>
            </a>
            <a href="/tier-sistemi" onClick={closeDropdown} className="dropdown-item">
              <span className="dropdown-icon">📊</span>
              <div>
                <strong>Tier Sistemi</strong>
                <p>10-B'den 1-A'ya güç kademeleri rehberi</p>
              </div>
            </a>
          </div>
        )}
      </div>

      {/* 2. SOHBET ODASI */}
      <a href="/sohbet" className="nav-item-link" onClick={closeDropdown}>
        💬 Sohbet
      </a>

      {/* 3. GRUP: ETKİNLİKLER & MAĞAZA SEKMESİ */}
      <div className="nav-dropdown-wrap">
        <button
          type="button"
          className={`nav-dropdown-trigger ${openDropdown === 'activity' ? 'active' : ''}`}
          onClick={() => toggleDropdown('activity')}
        >
          <span>🎡 Etkinlikler</span>
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

      {/* 4. KULLANICI / PROFİL BÖLÜMÜ */}
      {!user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <a href="/giris-yap" className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '.85rem' }}>
            Giriş Yap
          </a>
          <a href="/kayit-ol" className="btn" style={{ padding: '6px 14px', fontSize: '.85rem' }}>
            Kayıt Ol
          </a>
        </div>
      ) : (
        <div className="nav-dropdown-wrap">
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
            <span className="user-nav-coins">
              🪙 {(profile?.coins || 0).toLocaleString('tr-TR')}
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
                  <div style={{ fontSize: '.76rem', color: 'var(--text-dim)' }}>
                    🪙 {(profile?.coins || 0).toLocaleString('tr-TR')} Tier Parası
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
