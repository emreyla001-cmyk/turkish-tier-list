'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import TierBadge from '../components/TierBadge';
import { getLeagueForTrophies } from '../lib/cardGameEngine';
import { cardAudio } from '../lib/cardAudio';
import { getCardRarity, getStarInfo, MAX_STARS } from '../lib/cardRarity';
import { getStamina, buyStaminaPotion, POTION_COST, POTION_REFILL } from '../lib/stamina';

export default function KartOyunuHub() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [leaguesConfig, setLeaguesConfig] = useState({ leagues: [], packs: [] });
  const [characters, setCharacters] = useState([]);
  const [activeTab, setActiveTab] = useState('arena'); // 'arena' | 'packs' | 'deck' | 'leagues'
  const [myCards, setMyCards] = useState([]);
  const [myDeck, setMyDeck] = useState([]); // 5 kart id'si
  const [cardUpgrades, setCardUpgrades] = useState({}); // { [id]: { stars: 1..5, shards: number } }
  const [trophies, setTrophies] = useState(100);
  const [pityCount, setPityCount] = useState(0);
  const [stamina, setStamina] = useState({ current: 10, max: 10 });
  const [openedPackCards, setOpenedPackCards] = useState(null);
  const [opening, setOpening] = useState(false);
  const [msg, setMsg] = useState(null);

  async function load() {
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u || null);

      const [cfgRes, { data: chars }] = await Promise.all([
        fetch('/api/leagues').then((r) => r.json()),
        supabase
          .from('characters')
          .select('id, name, series, tier, category, power_score, speed_score, intelligence_score, durability_score, image_url')
          .eq('status', 'published'),
      ]);

      setLeaguesConfig(cfgRes);
      const allChars = chars || [];
      setCharacters(allChars);

      if (u) {
        const { data: p } = await supabase
          .from('profiles')
          .select('id, username, coins, xp')
          .eq('id', u.id)
          .maybeSingle();

        const currentCoins = u.user_metadata?.coins !== undefined
          ? Number(u.user_metadata.coins)
          : Number(p?.coins || 0);

        setProfile(p ? { ...p, coins: currentCoins } : { id: u.id, username: u.user_metadata?.username || 'Kullanıcı', coins: currentCoins, xp: 0 });

        // Kullanıcının kartlarını, yükseltmelerini ve kupasını metadata'dan oku
        const metaCards = Array.isArray(u.user_metadata?.card_collection) ? u.user_metadata.card_collection : [];
        const metaDeck = Array.isArray(u.user_metadata?.card_deck) ? u.user_metadata.card_deck : [];
        const metaUpgrades = (u.user_metadata?.card_upgrades && typeof u.user_metadata.card_upgrades === 'object')
          ? u.user_metadata.card_upgrades
          : {};
        const userTrophies = Number(u.user_metadata?.trophies) || 150;

        setCardUpgrades(metaUpgrades);

        const curPity = Number(u.user_metadata?.gacha_pity) || 0;
        setPityCount(curPity);
        setStamina(getStamina(u));

        // Başlangıç hediyesi: Eğer kartı yoksa en az 5 başlangıç kartı hediye et
        if (metaCards.length === 0 && allChars.length >= 5) {
          const starterCards = allChars.slice(0, 5).map((c) => c.id);
          setMyCards(starterCards);
          setMyDeck(starterCards);
          setTrophies(150);
          await supabase.auth.updateUser({
            data: {
              card_collection: starterCards,
              card_deck: starterCards,
              trophies: 150,
            },
          });
        } else {
          setMyCards(metaCards);
          setMyDeck(metaDeck.length === 5 ? metaDeck : metaCards.slice(0, 5));
          setTrophies(userTrophies);
        }
      }
    } catch (err) {
      console.error('Kart oyunu yüklenemedi:', err);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleBuyPotion() {
    if (!user) return;
    const currentCoins = user.user_metadata?.coins !== undefined
      ? Number(user.user_metadata.coins)
      : Number(profile?.coins || 0);

    const res = await buyStaminaPotion(user, currentCoins);
    if (res.success) {
      setStamina({ current: res.current, max: 10 });
      setProfile((p) => ({ ...p, coins: res.newCoins }));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coins-updated', { detail: { coins: res.newCoins } }));
      }
      setMsg({ text: `🧪 Enerji İksiri kullanıldı! Mevcut enerjin: ${res.current}/10`, type: 'success' });
    } else {
      setMsg({ text: res.error, type: 'error' });
    }
  }

  // Paket Açılımı Fonksiyonu (Kopya Kart ve Parça / Shard Sistemi)
  async function handleOpenPack(pack) {
    if (!user || !profile) return;
    setMsg(null);

    const currentCoins = user.user_metadata?.coins !== undefined
      ? Number(user.user_metadata.coins)
      : Number(profile?.coins || 0);

    if (currentCoins < pack.price) {
      setMsg({ text: `Yetersiz bakiye! Bu paket için ${pack.price.toLocaleString('tr-TR')} Tier Parasına ihtiyacın var.`, type: 'error' });
      return;
    }

    setOpening(true);
    cardAudio.playWhoosh();
    try {
      // 1. Altın düş
      const newCoins = Math.max(0, currentCoins - pack.price);

      // profiles tablosuna da kaydetmeyi dene (RLS kısıtlaması varsa sessizce metadata kullanılır)
      try {
        await supabase
          .from('profiles')
          .update({ coins: newCoins })
          .eq('id', user.id);
      } catch (tableErr) {
        console.warn('profiles tablosu güncellenemedi, user_metadata kullanılıyor:', tableErr);
      }

      // 2. Filtreye göre karakterleri seç
      let pool = characters.filter((c) => pack.tierFilter.includes(c.tier));
      if (pool.length === 0) pool = characters;

      // Pity (Şanssızlık Koruması) Mekaniği: 10. pakette (pityCount >= 9) kesin SSR veya UR!
      const isPityActive = pityCount >= 9;
      const drawn = [];
      for (let i = 0; i < 2; i++) {
        const rand = pool[Math.floor(Math.random() * pool.length)];
        drawn.push(rand);
      }

      if (isPityActive) {
        const highTierPool = characters.filter((c) => {
          const r = getCardRarity(c.tier).code;
          return r === 'UR' || r === 'SSR';
        });
        const guaranteedPool = highTierPool.length > 0 ? highTierPool : pool;
        const guaranteedCard = guaranteedPool[Math.floor(Math.random() * guaranteedPool.length)];
        drawn.push(guaranteedCard);
      } else {
        drawn.push(pool[Math.floor(Math.random() * pool.length)]);
      }

      // Pity güncelleme
      const hasHighRarity = drawn.some((c) => ['UR', 'SSR'].includes(getCardRarity(c.tier).code));
      const nextPity = hasHighRarity ? 0 : Math.min(10, pityCount + 1);
      setPityCount(nextPity);

      // 3. Kopya Kart ve Parça (Shard) Hesabı
      const updatedUpgrades = { ...cardUpgrades };
      let refundTotal = 0;

      const processedCards = drawn.map((card) => {
        const isDuplicate = myCards.includes(card.id);
        const cur = updatedUpgrades[card.id] || { stars: 1, awakened: 0, shards: 0 };
        let stars = cur.stars || 1;
        let awakened = cur.awakened || 0;
        let shards = cur.shards || 0;

        const sInfo = getStarInfo(stars, awakened);

        if (isDuplicate) {
          if (sInfo.isMax) {
            refundTotal += 500; // Maksimum Seviyedeyse boşa gitmesin: 500 Tier Parası İade!
          } else {
            shards += 1;
          }
        }

        updatedUpgrades[card.id] = { stars, awakened, shards };

        return {
          ...card,
          isDuplicate,
          stars,
          awakened,
          shards,
          refundGiven: isDuplicate && sInfo.isMax,
        };
      });

      const finalCoins = newCoins + refundTotal;
      if (refundTotal > 0) {
        try {
          await supabase.from('profiles').update({ coins: finalCoins }).eq('id', user.id);
        } catch {}
      }

      setProfile((prev) => ({ ...prev, coins: finalCoins }));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coins-updated', { detail: { coins: finalCoins } }));
      }

      setCardUpgrades(updatedUpgrades);
      const newCollection = Array.from(new Set([...myCards, ...drawn.map((c) => c.id)]));
      setMyCards(newCollection);

      await supabase.auth.updateUser({
        data: {
          card_collection: newCollection,
          card_upgrades: updatedUpgrades,
          coins: finalCoins,
          gacha_pity: nextPity,
        },
      });

      // Animasyon için kartları göster
      setTimeout(() => {
        setOpenedPackCards(processedCards);
        setOpening(false);
        cardAudio.playPackOpening();
      }, 1200);
    } catch (e) {
      setMsg({ text: `Paket açılırken hata oluştu: ${e.message}`, type: 'error' });
      setOpening(false);
    }
  }

  // Yıldız ve Uyanış (Awakening) Seviyesi Yükseltme Fonksiyonu
  async function handleUpgradeCard(cardId) {
    if (!user) return;
    const current = cardUpgrades[cardId] || { stars: 1, awakened: 0, shards: 0 };
    const starInfo = getStarInfo(current.stars, current.awakened);

    if (starInfo.isMax) {
      setMsg({ text: '👑 Bu karakter zaten 5. Uyanış MAKSİMUM SEVİYEYE ulaşmıştır!', type: 'info' });
      return;
    }

    if (current.shards < starInfo.nextCostShards) {
      setMsg({
        text: `Yetersiz karakter parçası! Bu yükseltme için ${starInfo.nextCostShards} adet aynı karta (parçaya) ihtiyacın var. Mevcut parçan: ${current.shards}`,
        type: 'error',
      });
      return;
    }

    let newStars = current.stars || 1;
    let newAwakened = current.awakened || 0;

    // Normal Sarı Yıldız Aşaması (1..5, her basamakta 2 kart)
    if (newStars < 5) {
      newStars += 1;
      newAwakened = 0;
    } else if (newStars === 5) {
      // 5 sarı yıldızdan sonra 4 aynı kartla Uyanışa dönüşür, 5 uyanışa kadar çıkar
      newAwakened = Math.min(MAX_AWAKENED, newAwakened + 1);
    }

    const newShards = current.shards - starInfo.nextCostShards;
    const updated = {
      ...cardUpgrades,
      [cardId]: { stars: newStars, awakened: newAwakened, shards: newShards },
    };

    setCardUpgrades(updated);
    cardAudio.playVictoryFanfare();

    const charObj = characters.find((c) => c.id === cardId);
    const nextInfo = getStarInfo(newStars, newAwakened);

    let congratText = '';
    if (nextInfo.isMax) {
      congratText = `👑 EFSANEVİ BAŞARI! ${charObj?.name || 'Karakter'} MAKSİMUM SEVİYEYE (5. Uyanış) ulaştı! (+%${nextInfo.bonusPercent} Maksimum Güç Patlaması)`;
    } else if (nextInfo.isAwakened) {
      congratText = `⚡ MUAZZAM UYANIŞ! ${charObj?.name || 'Karakter'} ${nextInfo.awakened}. Uyanış seviyesine evrildi! (+%${nextInfo.bonusPercent} Güç Takviyesi)`;
    } else {
      congratText = `⭐ Tebrikler! ${charObj?.name || 'Karakter'} ${nextInfo.stars}. Yıldız seviyesine yükseltildi! (+%${nextInfo.bonusPercent} Güç Takviyesi)`;
    }

    setMsg({
      type: 'success',
      text: congratText,
    });

    await supabase.auth.updateUser({
      data: { card_upgrades: updated },
    });
  }

  // Deste Kartı Seçme (5'li deste)
  async function toggleDeckCard(cardId) {
    cardAudio.playCardFlip();
    let updatedDeck = [...myDeck];
    if (updatedDeck.includes(cardId)) {
      if (updatedDeck.length <= 1) {
        setMsg({ text: 'Destende en az 1 kart bulunmalıdır!', type: 'error' });
        return;
      }
      updatedDeck = updatedDeck.filter((id) => id !== cardId);
    } else {
      if (updatedDeck.length >= 5) {
        setMsg({ text: 'Savaş destesi en fazla 5 karttan oluşabilir! Birini çıkarıp bunu ekleyebilirsin.', type: 'info' });
        return;
      }
      updatedDeck.push(cardId);
    }
    setMyDeck(updatedDeck);
    await supabase.auth.updateUser({
      data: { card_deck: updatedDeck },
    });
  }

  if (user === undefined) return <div className="wrap empty">Arena yükleniyor...</div>;
  if (!user) {
    return (
      <div className="wrap empty">
        Kart Arenasına katılmak ve paket açmak için <a href="/giris-yap">giriş yapmalısın</a>.
      </div>
    );
  }

  const currentLeague = getLeagueForTrophies(trophies, leaguesConfig.leagues);
  const deckCharacters = myDeck.map((id) => characters.find((c) => c.id === id)).filter(Boolean);
  const myCollectionCharacters = myCards.map((id) => characters.find((c) => c.id === id)).filter(Boolean);

  return (
    <div className="wrap" style={{ maxWidth: '960px', paddingBottom: '70px' }}>
      {/* 🏆 Üst Lig & Kupa Başlığı */}
      <div
        className="card"
        style={{
          marginTop: '20px',
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(14, 18, 29, 0.9), rgba(20, 26, 42, 0.8))',
          border: `2px solid ${currentLeague.color || 'var(--accent)'}`,
          boxShadow: `0 0 30px ${currentLeague.color}33`,
          borderRadius: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${currentLeague.color}55, #111)`,
              border: `3px solid ${currentLeague.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              boxShadow: `0 0 20px ${currentLeague.color}44`,
            }}
          >
            {currentLeague.icon}
          </div>
          <div>
            <span style={{ fontSize: '.84rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Mevcut Ligin & Rütben
            </span>
            <h1 style={{ margin: '2px 0 6px', fontSize: '1.7rem', color: currentLeague.color }}>
              {currentLeague.name}
            </h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fef08a' }}>
                🏆 {trophies} Kupa
              </span>
              <span className="coin-pill" style={{ fontSize: '.9rem' }}>
                🪙 {(profile?.coins || 0).toLocaleString('tr-TR')} Tier Parası
              </span>
            </div>
          </div>
        </div>

        <div>
          <a
            href="/kart-oyunu/savas"
            className="btn"
            style={{
              padding: '14px 28px',
              fontSize: '1.1rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              color: '#111',
              boxShadow: '0 0 24px var(--accent-glow)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>⚔️</span> RAKİP BUL & SAVAŞ
          </a>
        </div>
      </div>

      {msg && (
        <div
          className="card"
          style={{
            marginTop: '16px',
            padding: '12px 18px',
            borderRadius: '10px',
            background: msg.type === 'error' ? 'rgba(230,69,91,.15)' : 'rgba(111,191,115,.15)',
            border: `1px solid ${msg.type === 'error' ? '#e6455b' : '#6fbf73'}`,
            color: msg.type === 'error' ? '#e6455b' : '#6fbf73',
            fontWeight: 700,
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Sekmeler */}
      <div className="filter-tabs" style={{ marginTop: '24px', marginBottom: '20px' }}>
        <button
          type="button"
          className={`filter-tab ${activeTab === 'arena' ? 'active' : ''}`}
          onClick={() => setActiveTab('arena')}
        >
          ⚔️ Savaş Destem ({deckCharacters.length}/5)
        </button>
        <button
          type="button"
          className={`filter-tab ${activeTab === 'packs' ? 'active' : ''}`}
          onClick={() => setActiveTab('packs')}
        >
          📦 Paket Mağazası ({leaguesConfig.packs?.length || 4})
        </button>
        <button
          type="button"
          className={`filter-tab ${activeTab === 'collection' ? 'active' : ''}`}
          onClick={() => setActiveTab('collection')}
        >
          🃏 Tüm Kart Koleksiyonum ({myCollectionCharacters.length})
        </button>
        <button
          type="button"
          className={`filter-tab ${activeTab === 'leagues' ? 'active' : ''}`}
          onClick={() => setActiveTab('leagues')}
        >
          🏆 Ligler & Kupa Dereceleri
        </button>
      </div>

      {/* 1. SEKME: SAVAŞ DESTEM */}
      {activeTab === 'arena' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0 }}>Savaş Destesi (Maksimum 5 Karakter)</h3>
            <span style={{ fontSize: '.84rem', color: 'var(--text-dim)' }}>
              Arenada bu 5 kart sırayla rakibin 5 kartıyla karşılaşacaktır.
            </span>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
            {[0, 1, 2, 3, 4].map((slotIdx) => {
              const card = deckCharacters[slotIdx];
              return (
                <div
                  key={slotIdx}
                  className="card"
                  style={{
                    minHeight: '260px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: card ? 'space-between' : 'center',
                    alignItems: 'center',
                    padding: card ? '12px' : '20px',
                    textAlign: 'center',
                    border: card ? '2px solid var(--accent)' : '2px dashed rgba(255,255,255,0.15)',
                    background: card ? 'var(--bg-2)' : 'transparent',
                    borderRadius: '14px',
                    position: 'relative',
                  }}
                >
                  {card ? (
                    <>
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          fontSize: '.72rem',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontWeight: 800,
                        }}
                      >
                        #{slotIdx + 1}
                      </span>
                      <div style={{ width: '100%', height: '130px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', background: '#000' }}>
                        <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <strong style={{ fontSize: '.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                        {card.name}
                      </strong>
                      {(() => {
                        const rarity = getCardRarity(card.tier);
                        const upg = cardUpgrades[card.id] || { stars: 1, shards: 0 };
                        const sInfo = getStarInfo(upg.stars);
                        return (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '4px 0' }}>
                              <span style={{ background: rarity.badgeBg, color: '#fff', fontSize: '.68rem', fontWeight: 900, padding: '1px 5px', borderRadius: '4px' }}>
                                {rarity.code}
                              </span>
                              <TierBadge tier={card.tier} />
                            </div>
                            <div style={{ fontSize: '.74rem', color: '#fef08a', margin: '2px 0' }}>
                              {sInfo.starString} {sInfo.bonusPercent > 0 && `(+%${sInfo.bonusPercent})`}
                            </div>
                            <div style={{ fontSize: '.76rem', color: 'var(--accent)', fontWeight: 800 }}>
                              Güç: {Math.round((card.power_score || 50) * sInfo.multiplier)}
                            </div>
                            {upg.shards >= sInfo.nextCostShards && upg.stars < MAX_STARS && (
                              <button
                                type="button"
                                className="btn"
                                style={{ width: '100%', padding: '4px', fontSize: '.72rem', marginTop: '4px', background: 'linear-gradient(135deg, #f59e0b, #eab308)', color: '#111', fontWeight: 900 }}
                                onClick={() => handleUpgradeCard(card.id)}
                              >
                                ⭐ Yükselt ({upg.shards}/{sInfo.nextCostShards})
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-ghost"
                              style={{ width: '100%', padding: '4px', fontSize: '.72rem', marginTop: '6px', borderColor: '#e6455b', color: '#e6455b' }}
                              onClick={() => toggleDeckCard(card.id)}
                            >
                              Çıkar
                            </button>
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-dim)', fontSize: '.84rem' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '6px' }}>➕</div>
                      Boş Slot #{slotIdx + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ENERJİ (STAMINA) DURUMU */}
          <div
            style={{
              marginTop: '20px',
              padding: '14px 20px',
              background: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.6rem' }}>⚡</span>
              <div>
                <strong style={{ fontSize: '.95rem', color: stamina.current > 0 ? '#86efac' : '#ef4444' }}>
                  Enerjin: {stamina.current} / {stamina.max}
                </strong>
                <span style={{ fontSize: '.78rem', color: 'var(--text-dim)', display: 'block' }}>
                  Her maç 1 enerji tüketir. Saat başı 1 enerji otomatik yenilenir.
                </span>
              </div>
            </div>

            {stamina.current < stamina.max && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleBuyPotion}
                style={{ fontSize: '.82rem', padding: '6px 14px', borderColor: '#f59e0b', color: '#f59e0b', fontWeight: 800 }}
              >
                🧪 Enerji İksiri Al (+5 Enerji - 300 TP)
              </button>
            )}
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <a
              href={stamina.current > 0 ? '/kart-oyunu/savas' : '#'}
              onClick={(e) => {
                if (stamina.current <= 0) {
                  e.preventDefault();
                  setMsg({ text: '⚠️ Enerjin kalmadı! Enerji İksiri alabilir ya da saat başı yenilenmesini bekleyebilirsin.', type: 'error' });
                }
              }}
              className="btn"
              style={{
                padding: '14px 40px',
                fontSize: '1.15rem',
                fontWeight: 900,
                background: stamina.current > 0 ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : '#3f3f46',
                color: stamina.current > 0 ? '#111' : '#a1a1aa',
                cursor: stamina.current > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              {stamina.current > 0 ? '⚔️ Bu Desteyle Arenaya Gir (1 ⚡)' : '⚡ Enerji Tükendi'}
            </a>
          </div>
        </div>
      )}

      {/* 2. SEKME: PAKET MAĞAZASI (FUT Pack Opening) */}
      {activeTab === 'packs' && (
        <div>
          <div
            style={{
              marginBottom: '20px',
              padding: '14px 20px',
              background: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Tier Kart Paketleri</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '.86rem', margin: '4px 0 0' }}>
                Her paketten rastgele 3 adet karakter kartı çıkar. Desteni zirveye taşı!
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>
                Mevcut Bakiyen
              </span>
              <strong style={{ fontSize: '1.25rem', color: '#fef08a' }}>
                🪙 {(profile?.coins || 0).toLocaleString('tr-TR')} Tier Parası
              </strong>
            </div>
          </div>

          {/* PITY (ACIMA / GARANTİ) ÇUBUĞU */}
          <div
            className="card"
            style={{
              marginBottom: '20px',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.12))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🛡️</span>
                <strong style={{ color: '#fef08a', fontSize: '.95rem' }}>
                  Pity (Şanssızlık Koruması) Barı: {pityCount} / 10
                </strong>
              </div>
              <span className="tag" style={{ background: pityCount >= 9 ? '#ef4444' : 'rgba(245, 158, 11, 0.2)', color: pityCount >= 9 ? '#fff' : '#f59e0b', fontWeight: 800 }}>
                {pityCount >= 9 ? '🔥 SIRADAKİ ÇEKİLİŞTE KESİN SSR / UR!' : '10\'da Kesin SSR / UR Garanti'}
              </span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div
                style={{
                  width: `${Math.min(100, (pityCount / 10) * 100)}%`,
                  height: '100%',
                  background: pityCount >= 9 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #eab308, #f59e0b)',
                  transition: 'width 0.4s ease',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.6)',
                }}
              />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '.78rem', color: 'var(--text-dim)' }}>
              Üst üste 9 paket açılımında SSR veya UR çıkmazsa, 10. paket çekilişinde 3. kart %100 garantili SSR ya da UR seviyesinde gelir. Herhangi bir SSR/UR çıktığında bar sıfırlanır.
            </p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            {(leaguesConfig.packs || []).map((pack) => (
              <div
                key={pack.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.4))',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{pack.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 6px' }}>{pack.name}</h3>
                  <p style={{ fontSize: '.8rem', color: 'var(--text-dim)', minHeight: '36px', lineHeight: 1.4 }}>
                    {pack.desc}
                  </p>
                  <div style={{ margin: '14px 0', fontSize: '1.2rem', fontWeight: 900, color: '#fef08a' }}>
                    🪙 {pack.price.toLocaleString('tr-TR')}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn"
                  style={{ width: '100%', fontWeight: 800 }}
                  onClick={() => handleOpenPack(pack)}
                  disabled={opening}
                >
                  {opening ? 'Açılıyor...' : 'Paketi Aç'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SEKME: TÜM KART KOLEKSİYONUM */}
      {activeTab === 'collection' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Kart Koleksiyonun ({myCollectionCharacters.length} Karakter)</h3>
            <span style={{ fontSize: '.84rem', color: 'var(--text-dim)' }}>
              Destene eklemek veya çıkarmak için kartın üzerine tıkla.
            </span>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
            {myCollectionCharacters.map((c) => {
              const inDeck = myDeck.includes(c.id);
              return (
                <div
                  key={c.id}
                  className="card"
                  onClick={() => toggleDeckCard(c.id)}
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: inDeck ? '2px solid var(--accent)' : '1px solid var(--border)',
                    boxShadow: inDeck ? '0 0 16px var(--accent-glow)' : 'none',
                    borderRadius: '12px',
                    position: 'relative',
                  }}
                >
                  {inDeck && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'var(--accent)',
                        color: '#111',
                        fontSize: '.7rem',
                        fontWeight: 900,
                        padding: '2px 6px',
                        borderRadius: '10px',
                      }}
                    >
                      ✓ Destede
                    </span>
                  )}
                  <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', background: '#000' }}>
                    <img src={c.image_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <strong style={{ fontSize: '.88rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </strong>
                  {(() => {
                    const rarity = getCardRarity(c.tier);
                    const upg = cardUpgrades[c.id] || { stars: 1, awakened: 0, shards: 0 };
                    const sInfo = getStarInfo(upg.stars, upg.awakened);
                    const canUpgrade = upg.shards >= sInfo.nextCostShards && !sInfo.isMax;
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '4px 0' }}>
                          <span style={{ background: rarity.badgeBg, color: '#fff', fontSize: '.68rem', fontWeight: 900, padding: '1px 5px', borderRadius: '4px', boxShadow: rarity.glow }}>
                            {rarity.code}
                          </span>
                          <TierBadge tier={c.tier} />
                        </div>

                        {sInfo.isMax ? (
                          <div style={{ margin: '4px 0' }}>
                            <span
                              style={{
                                background: 'linear-gradient(135deg, #eab308, #ef4444, #7928ca)',
                                color: '#fff',
                                fontSize: '.68rem',
                                fontWeight: 900,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                border: '1px solid #ffd700',
                                boxShadow: '0 0 12px rgba(255, 215, 0, 0.7)',
                                display: 'inline-block',
                              }}
                            >
                              👑 MAKSİMUM SEVİYE
                            </span>
                            <div style={{ fontSize: '.72rem', color: '#ffd700', marginTop: '2px', fontWeight: 800 }}>
                              {sInfo.starString} (+%{sInfo.bonusPercent})
                            </div>
                          </div>
                        ) : sInfo.isAwakened ? (
                          <div style={{ margin: '4px 0' }}>
                            <span
                              style={{
                                background: 'linear-gradient(135deg, #dc2626, #9333ea)',
                                color: '#fff',
                                fontSize: '.68rem',
                                fontWeight: 900,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                boxShadow: '0 0 10px rgba(220, 38, 38, 0.6)',
                                display: 'inline-block',
                              }}
                            >
                              🔴 {sInfo.awakened}. UYANIŞ
                            </span>
                            <div style={{ fontSize: '.72rem', color: '#f87171', marginTop: '2px', fontWeight: 800 }}>
                              {sInfo.starString} (+%{sInfo.bonusPercent})
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '.74rem', color: '#fef08a', margin: '3px 0', fontWeight: 800 }}>
                            {sInfo.starString} {sInfo.bonusPercent > 0 && `(+%${sInfo.bonusPercent})`}
                          </div>
                        )}

                        <div style={{ fontSize: '.76rem', color: 'var(--accent)', fontWeight: 800 }}>
                          Güç: {Math.round((c.power_score || 50) * sInfo.multiplier)}
                        </div>

                        {canUpgrade ? (
                          <button
                            type="button"
                            className="btn"
                            style={{
                              width: '100%',
                              padding: '5px',
                              fontSize: '.72rem',
                              marginTop: '6px',
                              background: upg.stars === 5 ? 'linear-gradient(135deg, #dc2626, #9333ea)' : 'linear-gradient(135deg, #f59e0b, #eab308)',
                              color: upg.stars === 5 ? '#fff' : '#111',
                              fontWeight: 900,
                              border: 'none',
                              boxShadow: upg.stars === 5 ? '0 0 12px rgba(220, 38, 38, 0.6)' : 'none',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpgradeCard(c.id);
                            }}
                          >
                            {upg.stars === 5
                              ? `⚡ ${((upg.awakened || 0) + 1)}. Uyanış (${upg.shards}/${sInfo.nextCostShards})`
                              : `⭐ ${(upg.stars || 1) + 1}. Yıldız (${upg.shards}/${sInfo.nextCostShards})`}
                          </button>
                        ) : (
                          <div style={{ fontSize: '.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                            {sInfo.isMax ? '🏆 Zirve Seviye' : `Parça: ${upg.shards || 0}/${sInfo.nextCostShards}`}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SEKME: LİGLER VE KUPA SİSTEMİ */}
      {activeTab === 'leagues' && (
        <div style={{ display: 'grid', gap: '12px' }}>
          {(leaguesConfig.leagues || []).map((lig) => {
            const isCurrent = currentLeague.id === lig.id;
            return (
              <div
                key={lig.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 24px',
                  borderLeft: `5px solid ${lig.color}`,
                  background: isCurrent ? 'rgba(255,255,255,0.06)' : 'var(--bg-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '2.4rem' }}>{lig.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: lig.color }}>{lig.name}</h3>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '.86rem' }}>
                      Kupa Aralığı: <strong>{lig.minTrophies}</strong> - <strong>{lig.maxTrophies >= 99999 ? 'Sınırsız' : lig.maxTrophies}</strong>
                    </p>
                  </div>
                </div>
                {isCurrent && (
                  <span className="tag" style={{ background: lig.color, color: '#111', fontWeight: 900 }}>
                    ŞU ANKİ LİGİN
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PAKET AÇILIM MODALI (FUT Pack Opening Reveal) */}
      {openedPackCards && (
        <div
          className="spotlight-overlay"
          style={{ zIndex: 100, alignItems: 'center' }}
          onClick={() => setOpenedPackCards(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '680px',
              width: '100%',
              padding: '30px',
              textAlign: 'center',
              background: '#0d111c',
              border: '2px solid var(--accent)',
              boxShadow: '0 0 50px rgba(0, 240, 255, 0.4)',
              borderRadius: '24px',
              animation: 'modalIn .25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {openedPackCards.some((c) => ['0', '1-A', '1-B', '1-C', '2-A', '2-B', '2-C', '3-A', '3-B', '3-C'].includes(c.tier)) ? (
              <div style={{ marginBottom: '10px' }}>
                <span className="synergy-badge" style={{ fontSize: '.85rem', padding: '6px 14px' }}>
                  🔥 EFSANEVİ KOZMİK WALKOUT! 🔥
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '3rem', marginBottom: '6px' }}>✨</div>
            )}
            <h2 style={{ fontSize: '1.8rem', color: 'var(--accent)', margin: '0 0 6px' }}>PAKETTEN ÇIKAN KARTLAR!</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>Tebrikler, 3 yeni karakter kartı koleksiyonuna eklendi:</p>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {openedPackCards.map((c) => {
                const rarity = getCardRarity(c.tier);
                const isHighTier = rarity.isHolo;
                const starInfo = getStarInfo(c.stars || 1, c.awakened || 0);
                return (
                  <div
                    key={c.id}
                    className={`card ${isHighTier ? 'holo-foil-card' : ''}`}
                    style={{
                      padding: '14px',
                      textAlign: 'center',
                      background: 'var(--bg-2)',
                      border: isHighTier ? '2px solid var(--accent)' : '1px solid var(--border)',
                      borderRadius: '14px',
                      boxShadow: isHighTier ? '0 0 20px rgba(234, 179, 8, 0.4)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ background: rarity.badgeBg, color: '#fff', fontSize: '.68rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>
                        {rarity.code}
                      </span>
                      {c.isDuplicate ? (
                        c.refundGiven ? (
                          <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontSize: '.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                            🪙 +500 İade (MAX)
                          </span>
                        ) : (
                          <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fef08a', fontSize: '.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                            ✨ +1 Parça
                          </span>
                        )
                      ) : (
                        <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontSize: '.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                          🎉 YENİ!
                        </span>
                      )}
                    </div>

                    <div style={{ width: '100%', height: '150px', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px', background: '#000' }}>
                      <img src={c.image_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <strong style={{ fontSize: '.95rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </strong>
                    <div style={{ margin: '4px 0' }}><TierBadge tier={c.tier} /></div>
                    <div style={{ fontSize: '.72rem', color: '#fef08a', marginBottom: '2px' }}>
                      {starInfo.starString}
                    </div>
                    <div style={{ fontSize: '.8rem', color: 'var(--accent)', fontWeight: 800 }}>
                      Güç: {Math.round((c.power_score || 50) * starInfo.multiplier)}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="btn"
              onClick={() => setOpenedPackCards(null)}
              style={{ padding: '10px 30px', fontWeight: 800 }}
            >
              ✓ Koleksiyona Ekle & Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
