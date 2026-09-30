'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import TierBadge from '../../components/TierBadge';
import { getCardRarity } from '../../lib/cardRarity';
import { cardAudio } from '../../lib/cardAudio';
import { getBotTierByTrophies, selectBotCard } from '../../lib/cardAIEngine';
import { CoinIcon, EnergyIcon, SwordsIcon, TrophyIcon, ShieldIcon } from '../../components/CyberIcons';

export default function DraftDuelPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Oyun Durumu
  // 'lobby' | 'drafting' | 'joker_reveal' | 'ready_battle' | 'battling' | 'finished'
  const [state, setState] = useState('lobby');

  // Draft Verileri
  const [draftRound, setDraftRound] = useState(0); // 0..3 (4 seçim turu)
  const [currentPair, setCurrentPair] = useState([]); // 2 kart
  const [playerDeck, setPlayerDeck] = useState([]); // 5 kart
  const [botDeck, setBotDeck] = useState([]); // 5 kart
  const [wildJokerPlayer, setWildJokerPlayer] = useState(null);
  const [wildJokerBot, setWildJokerBot] = useState(null);

  // Savaş Verileri
  const [battleRound, setBattleRound] = useState(0); // 0..4
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [activePlayerCard, setActivePlayerCard] = useState(null);
  const [activeBotCard, setActiveBotCard] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const { data: { user: u } } = await supabase.auth.getUser();
        setUser(u);
        if (u) {
          const { data: p } = await supabase.from('profiles').select('id, username, coins, xp').eq('id', u.id).maybeSingle();
          setProfile(p || { id: u.id, username: u.email?.split('@')[0], coins: 0, xp: 0 });
        }

        const { data: chars } = await supabase.from('characters').select('*').eq('status', 'published');
        setCharacters(chars || []);
      } catch (err) {
        console.error('Draft init error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // 1. DRAFTI BAŞLAT
  function startDraft() {
    if (characters.length < 12) return;
    cardAudio.playWhoosh();

    const shuffled = [...characters].sort(() => 0.5 - Math.random());
    setPlayerDeck([]);
    setBotDeck([]);
    setDraftRound(0);
    setPlayerScore(0);
    setBotScore(0);
    setBattleRound(0);
    setRewardClaimed(false);

    // İlk 2 kartlık çifti ayarla
    setCurrentPair([shuffled[0], shuffled[1]]);
    setState('drafting');
  }

  // 2. KART SEÇİMİ (Pick 1 for Me, Give 1 to Bot)
  function handlePickCard(pickedCard) {
    cardAudio.playPackOpening();
    const otherCard = currentPair.find((c) => c.id !== pickedCard.id);

    const newPlayerDeck = [...playerDeck, pickedCard];
    const newBotDeck = [...botDeck, otherCard];

    setPlayerDeck(newPlayerDeck);
    setBotDeck(newBotDeck);

    if (draftRound < 3) {
      // Bir sonraki draft çifti
      const nextIdx = (draftRound + 1) * 2;
      const shuffled = [...characters].filter((c) => !newPlayerDeck.some(p => p.id === c.id) && !newBotDeck.some(b => b.id === c.id));
      setCurrentPair([shuffled[0], shuffled[1]]);
      setDraftRound((r) => r + 1);
    } else {
      // 4 kart tamamlandı! 5. kart olarak SÜRPRİZ JOKER çekilir!
      const available = characters.filter((c) => !newPlayerDeck.some(p => p.id === c.id) && !newBotDeck.some(b => b.id === c.id));
      const jokerP = available[Math.floor(Math.random() * available.length)];
      const jokerB = available.filter(c => c.id !== jokerP.id)[Math.floor(Math.random() * (available.length - 1))];

      setWildJokerPlayer(jokerP);
      setWildJokerBot(jokerB);

      setPlayerDeck([...newPlayerDeck, jokerP]);
      setBotDeck([...newBotDeck, jokerB]);

      setState('joker_reveal');
    }
  }

  // 3. JOKERDEN SAVAŞA GEÇİŞ
  function proceedToBattle() {
    cardAudio.playWhoosh();
    setState('ready_battle');
  }

  // 4. RAUND KARTI SÜRME
  function handlePlayCard(card) {
    if (activePlayerCard) return;
    cardAudio.playWhoosh();

    setActivePlayerCard(card);

    // Kural tabanlı bot kartı
    const botRemaining = botDeck.filter((c, idx) => idx >= battleRound);
    const botPick = selectBotCard({
      remainingHand: botRemaining,
      playerCard: card,
      roundNumber: battleRound,
      playerScore,
      botScore,
    }) || botRemaining[0];

    setActiveBotCard(botPick);

    // 800ms sonra çarpışma
    setTimeout(() => {
      calculateClash(card, botPick);
    }, 800);
  }

  // 5. ÇARPIŞMA HESABI
  function calculateClash(pCard, bCard) {
    const pPower = (pCard.power_score || 5) * 2 + (pCard.speed_score || 5);
    const bPower = (bCard.power_score || 5) * 2 + (bCard.speed_score || 5);

    let winner = 'draw';
    if (pPower > bPower) {
      winner = 'player';
      setPlayerScore((s) => s + 1);
      cardAudio.playVictory();
    } else if (bPower > pPower) {
      winner = 'bot';
      setBotScore((s) => s + 1);
      cardAudio.playClash();
    } else {
      cardAudio.playClash();
    }

    setRoundResult({
      winner,
      pPower,
      bPower,
    });

    setState('battling');
  }

  // 6. SONRAKİ RAUND VEYA BİTİŞ
  function nextRound() {
    setActivePlayerCard(null);
    setActiveBotCard(null);
    setRoundResult(null);

    if (battleRound < 4) {
      setBattleRound((r) => r + 1);
      setState('ready_battle');
    } else {
      setState('finished');
      if (playerScore > botScore && !rewardClaimed) {
        claimReward();
      }
    }
  }

  // 7. ÖDÜL KAZANMA
  async function claimReward() {
    setRewardClaimed(true);
    if (!user) return;

    try {
      const { data: p } = await supabase.from('profiles').select('coins, xp').eq('id', user.id).maybeSingle();
      const newCoins = (p?.coins || 0) + 600;
      const newXp = (p?.xp || 0) + 300;

      await supabase.from('profiles').update({ coins: newCoins, xp: newXp }).eq('id', user.id);
      await supabase.auth.updateUser({ data: { coins: newCoins, xp: newXp } });

      // Klana puan kazandır
      await fetch('/api/clans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'contribute_cp', user_id: user.id, points: 150 }),
      }).catch(() => {});

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coins-updated', { detail: { coins: newCoins } }));
      }
    } catch (err) {
      console.error('Reward claim error:', err);
    }
  }

  if (loading) {
    return <div className="wrap empty">Draft Düellosu yükleniyor... 🃏</div>;
  }

  return (
    <div className="wrap" style={{ maxWidth: '880px', paddingBottom: '80px' }}>
      {/* 1. LOBİ EKRANI */}
      {state === 'lobby' && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <div className="card" style={{ padding: '40px 24px', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
            <span style={{ fontSize: '4rem' }}>🃏</span>
            <h1 style={{ fontSize: '2rem', margin: '14px 0 8px', color: '#fef08a' }}>
              Draft Duel (1v1 Taktiksel Mod)
            </h1>
            <p style={{ maxWidth: '580px', margin: '0 auto 24px', color: 'var(--text-dim)', fontSize: '.95rem', lineHeight: 1.6 }}>
              Clash Royale tarzı taktiksel kart seçimi! Her turda önüne gelen 2 karttan birini <strong>kendine al</strong>, diğerini <strong>rakibe ver</strong>. 5. turda gelen sürpriz Joker ile desteni tamamla ve 5 raundluk arenada zekanı konuştur!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '28px' }}>
              <div style={{ background: 'var(--bg-2)', padding: '12px 20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ display: 'block', fontSize: '.76rem', color: 'var(--text-dim)' }}>Zafer Ödülü</span>
                <strong style={{ color: '#fef08a', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                  <CoinIcon size={16} /> 600 Tier Parası
                </strong>
              </div>
              <div style={{ background: 'var(--bg-2)', padding: '12px 20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ display: 'block', fontSize: '.76rem', color: 'var(--text-dim)' }}>Deneyim</span>
                <strong style={{ color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                  <EnergyIcon size={16} /> 300 XP
                </strong>
              </div>
              <div style={{ background: 'var(--bg-2)', padding: '12px 20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ display: 'block', fontSize: '.76rem', color: 'var(--text-dim)' }}>Klan Bonusu</span>
                <strong style={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                  <ShieldIcon size={16} /> +150 Klan CP
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="btn"
              onClick={startDraft}
              style={{
                padding: '14px 44px',
                fontSize: '1.2rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <SwordsIcon size={22} /> Draft Düellosunu Başlat
            </button>
          </div>
        </div>
      )}

      {/* 2. DRAFT AŞAMASI (Pick 1 for Me, Give 1 to Bot) */}
      {state === 'drafting' && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontWeight: 900 }}>
              DRAFT TURU {draftRound + 1} / 4
            </span>
            <h2 style={{ fontSize: '1.5rem', margin: '8px 0 4px' }}>
              Birini Kendine Al, Diğerini Rakibe Ver!
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '.88rem' }}>
              Tıkladığın kart senin destene eklenir; diğeri doğrudan rakibin eline geçer.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {currentPair.map((card) => {
              const rarity = getCardRarity(card.tier);
              return (
                <div
                  key={card.id}
                  className="card"
                  onClick={() => handlePickCard(card)}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    border: '2px solid rgba(255,255,255,0.1)',
                    transition: 'all .2s ease',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.95), rgba(9, 9, 11, 0.95))',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f59e0b';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="tag" style={{ background: rarity.badgeBg, color: '#fff', fontWeight: 900, fontSize: '.74rem' }}>
                      {rarity.code}
                    </span>
                    <TierBadge tier={card.tier} />
                  </div>

                  <div style={{ width: '100%', height: '160px', borderRadius: '10px', overflow: 'hidden', background: '#000', marginBottom: '12px' }}>
                    <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem' }}>{card.name}</h3>
                  <span style={{ fontSize: '.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '12px' }}>
                    {card.series}
                  </span>

                  <div style={{ display: 'flex', justifyContent: 'space-around', background: 'var(--bg-2)', padding: '8px', borderRadius: '8px', fontSize: '.82rem', marginBottom: '14px' }}>
                    <span>Güç: <strong>{card.power_score || 5}</strong></span>
                    <span>Hız: <strong>{card.speed_score || 5}</strong></span>
                    <span>Dayanıklılık: <strong>{card.durability_score || 5}</strong></span>
                  </div>

                  <button type="button" className="btn" style={{ width: '100%', fontWeight: 800 }}>
                    👉 Kendime Al
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SÜRPRİZ JOKER AŞAMASI */}
      {state === 'joker_reveal' && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <div className="card" style={{ padding: '36px', borderRadius: '20px', border: '2px solid #8b5cf6' }}>
            <span style={{ fontSize: '3.5rem' }}>🃏</span>
            <h2 style={{ fontSize: '1.6rem', margin: '10px 0 6px', color: '#c084fc' }}>
              5. Tur: Sürpriz Joker Kartları Çekildi!
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '.9rem', marginBottom: '24px' }}>
              İki tarafa da desteyi tamamlayacak 1 adet gizli Wild Joker kartı eklendi.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '28px' }}>
              {/* Oyuncunun Jokeri */}
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-2)', border: '1px solid #8b5cf6', width: '220px' }}>
                <span className="tag" style={{ background: '#8b5cf6', color: '#fff', fontWeight: 800, fontSize: '.72rem' }}>SENİN JOKERİN</span>
                <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', margin: '10px 0' }}>
                  <img src={wildJokerPlayer?.image_url} alt={wildJokerPlayer?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ margin: '0 0 2px' }}>{wildJokerPlayer?.name}</h4>
                <TierBadge tier={wildJokerPlayer?.tier} />
              </div>

              {/* Rakibin Jokeri */}
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-2)', border: '1px solid rgba(255,255,255,0.1)', width: '220px', opacity: 0.8 }}>
                <span className="tag" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, fontSize: '.72rem' }}>RAKİBİN JOKERİ</span>
                <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', margin: '10px 0' }}>
                  <img src={wildJokerBot?.image_url} alt={wildJokerBot?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ margin: '0 0 2px' }}>{wildJokerBot?.name}</h4>
                <TierBadge tier={wildJokerBot?.tier} />
              </div>
            </div>

            <button
              type="button"
              className="btn"
              onClick={proceedToBattle}
              style={{
                padding: '12px 36px',
                fontWeight: 900,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <SwordsIcon size={20} /> 5v5 Arenaya Gir &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 4. SAVAŞ AŞAMASI */}
      {(state === 'ready_battle' || state === 'battling') && (
        <div style={{ marginTop: '20px' }}>
          {/* Skorboard */}
          <div className="card" style={{ padding: '16px 24px', borderRadius: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{profile?.username || 'Sen'}</strong>
              <span style={{ display: 'block', fontSize: '.78rem', color: 'var(--text-dim)' }}>Senin Skorun</span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontWeight: 800, fontSize: '.75rem' }}>
                RAUND {battleRound + 1} / 5
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '2px' }}>
                <span style={{ color: '#22c55e' }}>{playerScore}</span> : <span style={{ color: '#ef4444' }}>{botScore}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <strong style={{ color: '#fff', fontSize: '1.1rem' }}>Draft Botu 🤖</strong>
              <span style={{ display: 'block', fontSize: '.78rem', color: 'var(--text-dim)' }}>Rakip Skoru</span>
            </div>
          </div>

          {/* Sahadaki Kartlar */}
          {activePlayerCard && activeBotCard && (
            <div className="card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '20px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08))' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ color: '#22c55e', margin: '0 0 6px' }}>Senin Kartın</h4>
                  <img src={activePlayerCard.image_url} alt={activePlayerCard.name} style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #22c55e' }} />
                  <strong style={{ display: 'block', marginTop: '6px' }}>{activePlayerCard.name}</strong>
                  {roundResult && <span style={{ color: '#fef08a', fontWeight: 800 }}>Puan: {roundResult.pPower}</span>}
                </div>

                <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>VS</div>

                <div>
                  <h4 style={{ color: '#ef4444', margin: '0 0 6px' }}>Rakip Kartı</h4>
                  <img src={activeBotCard.image_url} alt={activeBotCard.name} style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #ef4444' }} />
                  <strong style={{ display: 'block', marginTop: '6px' }}>{activeBotCard.name}</strong>
                  {roundResult && <span style={{ color: '#fef08a', fontWeight: 800 }}>Puan: {roundResult.bPower}</span>}
                </div>
              </div>

              {roundResult && (
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ color: roundResult.winner === 'player' ? '#22c55e' : roundResult.winner === 'bot' ? '#ef4444' : '#eab308' }}>
                    {roundResult.winner === 'player' ? '🎉 Bu Raundu Kazandın!' : roundResult.winner === 'bot' ? '💀 Rakip Raundu Kazandı!' : '🤝 Berabere!'}
                  </h3>
                  <button type="button" className="btn" onClick={nextRound} style={{ marginTop: '10px', fontWeight: 800 }}>
                    {battleRound < 4 ? 'Sonraki Raund &rarr;' : 'Maçı Bitir &rarr;'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Elindeki Kartlar (Seçim Alanı) */}
          {!activePlayerCard && (
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Sahaya Süreceğin Kartı Seç:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                {playerDeck.slice(battleRound).map((card) => (
                  <div
                    key={card.id}
                    className="card"
                    onClick={() => handlePlayCard(card)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                    <strong style={{ display: 'block', fontSize: '.84rem', marginTop: '6px' }}>{card.name}</strong>
                    <TierBadge tier={card.tier} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. BİTİŞ EKRANI */}
      {state === 'finished' && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <div className="card" style={{ padding: '40px', borderRadius: '20px' }}>
            <span style={{ fontSize: '4.5rem' }}>{playerScore > botScore ? '🏆' : '💀'}</span>
            <h2 style={{ fontSize: '2rem', margin: '14px 0 6px', color: playerScore > botScore ? '#22c55e' : '#ef4444' }}>
              {playerScore > botScore ? 'DRAFT DÜELLOSU ZAFERİ!' : 'DÜELLOYU KAYBETTİN!'}
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginBottom: '24px' }}>
              Son Skor: <strong style={{ color: '#fff' }}>{playerScore} - {botScore}</strong>
            </p>

            {playerScore > botScore && (
              <div style={{ display: 'inline-flex', gap: '20px', alignItems: 'center', padding: '12px 24px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '12px', marginBottom: '28px' }}>
                <span style={{ color: '#fef08a', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <CoinIcon size={16} /> +600 Tier Parası
                </span>
                <span style={{ color: '#a5b4fc', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <EnergyIcon size={16} /> +300 XP
                </span>
                <span style={{ color: '#86efac', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldIcon size={16} /> +150 Klan CP
                </span>
              </div>
            )}

            <div>
              <button type="button" className="btn" onClick={startDraft} style={{ fontWeight: 900, padding: '12px 32px' }}>
                🔄 Yeniden Oyna
              </button>
              <a href="/oyunlar" className="btn btn-ghost" style={{ marginLeft: '12px' }}>
                Mini Oyunlara Dön
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
