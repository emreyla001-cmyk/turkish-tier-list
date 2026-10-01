'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import TierBadge from '../components/TierBadge';
import { TrophyIcon, CoinIcon, EnergyIcon, CrownIcon } from '../components/CyberIcons';
import { getCardRarity } from '../lib/cardRarity';
import { getEffectiveCoins, getEffectiveXP } from '../lib/wallet';

export function getAlbumCardReward(character) {
  const t = (typeof character === 'string' ? character : character?.tier || '').toUpperCase();
  const power = typeof character === 'object' ? (Number(character?.power_score) || 5) : 5;

  let baseCoins = 200;
  let baseXP = 80;
  let label = 'Standart (C)';

  if (t === 'TIER 0' || t === 'HIGH 1-A' || t === '1-A' || t === 'S-TIER' || t.startsWith('S-')) {
    baseCoins = 2500;
    baseXP = 1000;
    label = 'Mitolojik Kozmik (SSR)';
  } else if (t.includes('A-TIER') || t.startsWith('7-') || t.startsWith('HIGH 7-')) {
    baseCoins = 1200;
    baseXP = 500;
    label = 'Efsanevi (UR)';
  } else if (t.includes('B-TIER') || t.startsWith('9-') || t.startsWith('8-')) {
    baseCoins = 600;
    baseXP = 250;
    label = 'Epik (SR)';
  } else if (t.includes('C-TIER') || t.startsWith('10-')) {
    baseCoins = 300;
    baseXP = 125;
    label = 'Nadir (R)';
  }

  // Karakterin özel güç puanına göre (power_score) dinamik ölçekleme
  const finalCoins = Math.round(baseCoins + (power * 80));
  const finalXP = Math.round(baseXP + (power * 35));

  return { coins: finalCoins, xp: finalXP, label };
}

export default function KoleksiyonAlbumPage() {
  const [characters, setCharacters] = useState([]);
  const [ownedCardIds, setOwnedCardIds] = useState([]);
  const [claimedAlbumCardIds, setClaimedAlbumCardIds] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');
  const [claimingMsg, setClaimingMsg] = useState('');

  useEffect(() => {
    async function loadCollectionData() {
      setLoading(true);
      const { data: chars } = await supabase
        .from('characters')
        .select('id, name, series, tier, category, image_url, power_score')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      setCharacters(chars || []);

      const { data: userRes } = await supabase.auth.getUser();
      if (userRes?.user) {
        const u = userRes.user;
        setUser(u);

        const { data: prof } = await supabase
          .from('profiles')
          .select('id, username, coins, xp, inventory')
          .eq('id', u.id)
          .maybeSingle();

        const effectiveCoins = getEffectiveCoins(u, prof);
        const effectiveXp = getEffectiveXP(u, prof);
        setProfile(prof ? { ...prof, coins: effectiveCoins, xp: effectiveXp } : { id: u.id, coins: effectiveCoins, xp: effectiveXp });

        // Sahip olunan kartlar (Card Collection / Inventory)
        const metaCollection = Array.isArray(u.user_metadata?.card_collection) ? u.user_metadata.card_collection : [];
        const metaInv = Array.isArray(u.user_metadata?.inventory) ? u.user_metadata.inventory : [];
        const profInv = Array.isArray(prof?.inventory) ? prof.inventory : [];
        const combinedOwned = [...new Set([...metaCollection, ...metaInv, ...profInv])];
        setOwnedCardIds(combinedOwned);

        // Albümde Ödülü Alınan Kartlar
        const claimed = Array.isArray(u.user_metadata?.claimed_album_cards) ? u.user_metadata.claimed_album_cards : [];
        setClaimedAlbumCardIds(claimed);
      }
      setLoading(false);
    }
    loadCollectionData();
  }, []);

  const totalCount = characters.length;
  const ownedCount = useMemo(() => {
    return characters.filter((c) => ownedCardIds.includes(c.id)).length;
  }, [characters, ownedCardIds]);

  const claimedCount = useMemo(() => {
    return characters.filter((c) => claimedAlbumCardIds.includes(c.id)).length;
  }, [characters, claimedAlbumCardIds]);

  const unclaimedOwnedCards = useMemo(() => {
    return characters.filter((c) => ownedCardIds.includes(c.id) && !claimedAlbumCardIds.includes(c.id));
  }, [characters, ownedCardIds, claimedAlbumCardIds]);

  const completionPct = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  const categories = useMemo(() => {
    const set = new Set();
    characters.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return [...set].sort((a, b) => a.localeCompare(b, 'tr'));
  }, [characters]);

  const filteredCharacters = useMemo(() => {
    if (selectedCat === 'all') return characters;
    return characters.filter((c) => c.category === selectedCat);
  }, [characters, selectedCat]);

  async function claimSingleCardReward(character) {
    if (!user || !profile) return;
    const reward = getAlbumCardReward(character.tier);

    const newCoins = (profile.coins || 0) + reward.coins;
    const newXp = (profile.xp || 0) + reward.xp;
    const newClaimedList = [...claimedAlbumCardIds, character.id];

    setClaimingMsg(`✨ ${character.name} albüm ödülü alındı! +${reward.coins} Altın, +${reward.xp} XP`);
    setClaimedAlbumCardIds(newClaimedList);
    setProfile((prev) => ({ ...prev, coins: newCoins, xp: newXp }));

    try {
      await supabase.auth.updateUser({
        data: {
          coins: newCoins,
          xp: newXp,
          claimed_album_cards: newClaimedList,
        },
      });
      await supabase.from('profiles').update({ coins: newCoins, xp: newXp }).eq('id', user.id);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coins-updated', { detail: { coins: newCoins } }));
        window.dispatchEvent(new CustomEvent('xp-updated', { detail: { xp: newXp } }));
      }
    } catch (err) {
      console.error('Koleksiyon ödül kaydetme hatası:', err);
    }

    setTimeout(() => setClaimingMsg(''), 4000);
  }

  async function claimAllUnclaimedRewards() {
    if (!user || !profile || unclaimedOwnedCards.length === 0) return;

    let addedCoins = 0;
    let addedXp = 0;
    const newlyClaimedIds = [];

    unclaimedOwnedCards.forEach((c) => {
      const rew = getAlbumCardReward(c);
      addedCoins += rew.coins;
      addedXp += rew.xp;
      newlyClaimedIds.push(c.id);
    });

    const newCoins = (profile.coins || 0) + addedCoins;
    const newXp = (profile.xp || 0) + addedXp;
    const newClaimedList = [...claimedAlbumCardIds, ...newlyClaimedIds];

    setClaimingMsg(`🎉 TEBRİKLER! ${unclaimedOwnedCards.length} adet kart ödülü toplu alındı: +${addedCoins.toLocaleString('tr-TR')} Altın, +${addedXp.toLocaleString('tr-TR')} XP`);
    setClaimedAlbumCardIds(newClaimedList);
    setProfile((prev) => ({ ...prev, coins: newCoins, xp: newXp }));

    try {
      await supabase.auth.updateUser({
        data: {
          coins: newCoins,
          xp: newXp,
          claimed_album_cards: newClaimedList,
        },
      });
      await supabase.from('profiles').update({ coins: newCoins, xp: newXp }).eq('id', user.id);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coins-updated', { detail: { coins: newCoins } }));
        window.dispatchEvent(new CustomEvent('xp-updated', { detail: { xp: newXp } }));
      }
    } catch (err) {
      console.error('Toplu ödül alma hatası:', err);
    }

    setTimeout(() => setClaimingMsg(''), 5000);
  }

  return (
    <div className="wrap" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      {/* Koleksiyon Başlık & İlerleme Paneli */}
      <section
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '28px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--accent)',
                fontWeight: 800,
                fontSize: '.85rem',
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                marginBottom: '6px',
              }}
            >
              <TrophyIcon size={18} /> Karakter Koleksiyon Albümü
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>
              Envanter & Albüm Ödülleri
            </h1>
            <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: '.95rem' }}>
              Kart Arenasında veya Gacha'da elde ettiğiniz kartlar albümünüzde açılır. Her yeni açılan kart nadirliğine göre ekstra <strong>Altın ve EXP</strong> kazandırır!
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {unclaimedOwnedCards.length > 0 && (
              <button
                type="button"
                className="btn btn-spotlight-primary"
                onClick={claimAllUnclaimedRewards}
                style={{
                  padding: '12px 20px',
                  fontWeight: 900,
                  fontSize: '.9rem',
                  borderRadius: '12px',
                  boxShadow: '0 0 25px rgba(230, 179, 37, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>🎁</span>
                <span>Tüm Hazır Ödülleri Topla ({unclaimedOwnedCards.length})</span>
              </button>
            )}

            <div style={{ textAlign: 'right', minWidth: '160px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent)' }}>
                %{completionPct}
              </div>
              <div style={{ fontSize: '.84rem', color: 'var(--text-dim)', fontWeight: 700 }}>
                {ownedCount} / {totalCount} Karakter Sahibi
              </div>
            </div>
          </div>
        </div>

        {claimingMsg && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 18px',
              borderRadius: '12px',
              background: 'rgba(134, 239, 172, 0.15)',
              border: '1px solid #86efac',
              color: '#86efac',
              fontWeight: 800,
              fontSize: '.9rem',
            }}
          >
            {claimingMsg}
          </div>
        )}

        {/* İlerleme Çubuğu */}
        <div style={{ marginTop: '20px', height: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div
            style={{
              height: '100%',
              width: `${completionPct}%`,
              background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #f59e0b)',
              borderRadius: '10px',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.6)',
              transition: 'width .6s ease',
            }}
          />
        </div>
      </section>

      {/* Kategori Filtre Butonları */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          className={`modern-tab-pill ${selectedCat === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCat('all')}
        >
          Tüm Evrenler ({characters.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`modern-tab-pill ${selectedCat === cat ? 'active' : ''}`}
            onClick={() => setSelectedCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Karakter Kart Albüm Izgarası */}
      {loading ? (
        <div className="empty">Koleksiyon albümü ve envanter yükleniyor...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '18px' }}>
          {filteredCharacters.map((c) => {
            const isOwned = ownedCardIds.includes(c.id);
            const isClaimed = claimedAlbumCardIds.includes(c.id);
            const reward = getAlbumCardReward(c.tier);
            const rarity = getCardRarity(c.tier);

            return (
              <div
                key={c.id}
                className="poster-card"
                style={{
                  opacity: isOwned ? 1 : 0.45,
                  filter: isOwned ? 'none' : 'grayscale(0.9) brightness(0.65)',
                  border: isClaimed ? `2px solid ${rarity.color || 'var(--accent)'}` : isOwned ? '2px dashed #f59e0b' : '1px solid var(--border)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'var(--card)',
                }}
              >
                <div>
                  <div className="poster-media" style={{ height: '170px' }}>
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="poster-fallback-inner">🎭</div>
                    )}

                    <div className="poster-tier-float">
                      <TierBadge tier={c.tier} />
                    </div>

                    {!isOwned && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.65)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 4,
                          gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '2rem' }}>🔒</span>
                        <span style={{ fontSize: '.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                          KİLİTLİ (ENVANTERDE YOK)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="poster-details" style={{ padding: '12px' }}>
                    <h4 style={{ fontSize: '.92rem', fontWeight: 800, margin: '0 0 2px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name}
                    </h4>
                    <p style={{ fontSize: '.76rem', color: 'var(--text-dim)', margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.series || 'Kurgu'}
                    </p>

                    {/* Nadirlik ve Ödül Miktarı Bilgisi */}
                    <div style={{ fontSize: '.72rem', color: '#fef08a', background: 'rgba(254, 240, 138, 0.1)', padding: '4px 8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🪙 +{reward.coins}</span>
                      <span>⚡ +{reward.xp} XP</span>
                    </div>
                  </div>
                </div>

                {/* Aksiyon Butonu / Albüm Durum Rozeti */}
                <div style={{ padding: '0 12px 12px 12px' }}>
                  {!isOwned ? (
                    <a
                      href="/kart-oyunu"
                      className="btn btn-ghost"
                      style={{ width: '100%', fontSize: '.72rem', padding: '6px 0', textAlign: 'center', color: 'var(--text-dim)' }}
                    >
                      🃏 Paket Aç & Çıkar
                    </a>
                  ) : isClaimed ? (
                    <div
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        background: 'rgba(134, 239, 172, 0.15)',
                        border: '1px solid #86efac',
                        color: '#86efac',
                        textAlign: 'center',
                        fontSize: '.74rem',
                        fontWeight: 900,
                      }}
                    >
                      ✓ ALBÜMDE AÇILDI & ALINDI
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-spotlight-primary"
                      onClick={() => claimSingleCardReward(c)}
                      style={{
                        width: '100%',
                        fontSize: '.75rem',
                        padding: '8px 0',
                        fontWeight: 900,
                        borderRadius: '8px',
                        boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
                      }}
                    >
                      🎁 Ödülü Al & Albüme İşle
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
