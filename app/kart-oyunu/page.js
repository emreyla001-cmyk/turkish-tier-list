'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import TierBadge from '../components/TierBadge';
import { getLeagueForTrophies } from '../lib/cardGameEngine';
import { cardAudio } from '../lib/cardAudio';

export default function KartOyunuHub() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [leaguesConfig, setLeaguesConfig] = useState({ leagues: [], packs: [] });
  const [characters, setCharacters] = useState([]);
  const [activeTab, setActiveTab] = useState('arena'); // 'arena' | 'packs' | 'deck' | 'leagues'
  const [myCards, setMyCards] = useState([]);
  const [myDeck, setMyDeck] = useState([]); // 5 kart id'si
  const [trophies, setTrophies] = useState(100);
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

        setProfile(p);

        // Kullanıcının kartlarını ve kupasını metadata / localStorage'dan oku
        const metaCards = Array.isArray(u.user_metadata?.card_collection) ? u.user_metadata.card_collection : [];
        const metaDeck = Array.isArray(u.user_metadata?.card_deck) ? u.user_metadata.card_deck : [];
        const userTrophies = Number(u.user_metadata?.trophies) || 150;

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

  // Paket Açılımı Fonksiyonu
  async function handleOpenPack(pack) {
    if (!user || !profile) return;
    setMsg(null);

    if ((profile.coins || 0) < pack.price) {
      setMsg({ text: `Yetersiz bakiye! Bu paket için ${pack.price.toLocaleString('tr-TR')} Tier Parasına ihtiyacın var.`, type: 'error' });
      return;
    }

    setOpening(true);
    cardAudio.playWhoosh();
    try {
      // 1. Altın düş
      const newCoins = Math.max(0, (profile.coins || 0) - pack.price);
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ coins: newCoins })
        .eq('id', user.id);

      if (updateErr) {
        console.error('Bakiye güncelleme hatası:', updateErr);
        throw new Error('Bakiye düşülemedi: ' + updateErr.message);
      }

      // State ve global navbar güncelle
      setProfile((prev) => ({ ...prev, coins: newCoins }));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coins-updated', { detail: { coins: newCoins } }));
      }

      // 2. Filtreye göre karakterleri seç
      let pool = characters.filter((c) => pack.tierFilter.includes(c.tier));
      if (pool.length === 0) pool = characters;

      // 3 kart çek
      const drawn = [];
      for (let i = 0; i < 3; i++) {
        const rand = pool[Math.floor(Math.random() * pool.length)];
        drawn.push(rand);
      }

      // 3. Koleksiyona ekle
      const newCollection = Array.from(new Set([...myCards, ...drawn.map((c) => c.id)]));
      setMyCards(newCollection);
      await supabase.auth.updateUser({
        data: {
          card_collection: newCollection,
          coins: newCoins,
        },
      });

      // Animasyon için kartları göster
      setTimeout(() => {
        setOpenedPackCards(drawn);
        setOpening(false);
        cardAudio.playPackOpening();
      }, 1200);
    } catch (e) {
      setMsg({ text: `Paket açılırken hata oluştu: ${e.message}`, type: 'error' });
      setOpening(false);
    }
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
                      <div style={{ margin: '4px 0' }}><TierBadge tier={card.tier} /></div>
                      <div style={{ fontSize: '.76rem', color: 'var(--accent)', fontWeight: 800 }}>
                        Güç: {card.power_score || 50}
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ width: '100%', padding: '4px', fontSize: '.72rem', marginTop: '6px', borderColor: '#e6455b', color: '#e6455b' }}
                        onClick={() => toggleDeckCard(card.id)}
                      >
                        Çıkar
                      </button>
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

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <a
              href="/kart-oyunu/savas"
              className="btn"
              style={{
                padding: '14px 40px',
                fontSize: '1.15rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                color: '#111',
              }}
            >
              ⚔️ Bu Desteyle Arenaya Gir
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
                  <div style={{ margin: '4px 0' }}><TierBadge tier={c.tier} /></div>
                  <div style={{ fontSize: '.76rem', color: 'var(--accent)', fontWeight: 800 }}>
                    Güç: {c.power_score || 50} · Hız: {c.speed_score || 50}
                  </div>
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
                const isHighTier = ['0', '1-A', '1-B', '1-C', '2-A', '2-B', '2-C', '3-A', '3-B', '3-C'].includes(c.tier);
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
                    <div style={{ width: '100%', height: '160px', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px', background: '#000' }}>
                      <img src={c.image_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <strong style={{ fontSize: '.95rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </strong>
                    <div style={{ margin: '6px 0' }}><TierBadge tier={c.tier} /></div>
                    <div style={{ fontSize: '.8rem', color: 'var(--accent)', fontWeight: 800 }}>
                      Güç: {c.power_score || 50}
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
