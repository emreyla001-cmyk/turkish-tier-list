'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import TierBadge from '../../components/TierBadge';
import { calculateTrophyChange, getLeagueForTrophies, simulateCardClash } from '../../lib/cardGameEngine';

const BOT_NAMES = [
  'Gölge Gladyatör',
  'Baron Fedaisi',
  'Bozkır Kurdu',
  'Pusu Ustası',
  'Kozmik Gezgin',
  'Kartal Pençesi',
  'Sokak Efsanesi',
  'Girdap Şövalyesi',
  'Ejderha Muhafızı',
  'Yeraltı Celladı'
];

export default function SavasArenasi() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [leaguesConfig, setLeaguesConfig] = useState({ leagues: [] });
  const [loading, setLoading] = useState(true);

  // Oyuncu verileri
  const [playerTrophies, setPlayerTrophies] = useState(150);
  const [playerDeck, setPlayerDeck] = useState([]); // 5 karakter objesi

  // Rakip verileri
  const [opponent, setOpponent] = useState(null); // { name, trophies, avatar, deck: [5 karakter objesi] }

  // Savaş Durumu
  // 'matchmaking' | 'ready' | 'clashing' | 'round_result' | 'match_finished'
  const [gameState, setGameState] = useState('matchmaking');
  const [currentRound, setCurrentRound] = useState(0); // 0..4 (5 raund)
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [roundHistory, setRoundHistory] = useState([]); // { round, playerCard, opponentCard, result }
  const [currentClashResult, setCurrentClashResult] = useState(null);
  const [cardRevealed, setCardRevealed] = useState(false);

  // Maç Sonu Verileri
  const [matchSummary, setMatchSummary] = useState(null); // { winner, trophyDelta, newTrophies, coinReward, xpReward }

  // Ses Efekti (Web Audio API ile harici dosya bağımlılığı olmadan temiz synth sesleri)
  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'clash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'loss') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Ses desteklenmiyorsa sessizce geç
    }
  };

  async function initArena() {
    setLoading(true);
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u || null);

      if (!u) {
        setLoading(false);
        return;
      }

      const [cfgRes, { data: chars }, { data: p }] = await Promise.all([
        fetch('/api/leagues').then((r) => r.json()),
        supabase.from('characters').select('*').eq('status', 'published'),
        supabase.from('profiles').select('id, username, coins, xp').eq('id', u.id).maybeSingle(),
      ]);

      setLeaguesConfig(cfgRes);
      setProfile(p);

      const allChars = chars || [];
      const userTrophies = Number(u.user_metadata?.trophies) || 150;
      setPlayerTrophies(userTrophies);

      // Oyuncunun 5 kartlık destesi
      let metaDeck = Array.isArray(u.user_metadata?.card_deck) ? u.user_metadata.card_deck : [];
      let playerDeckCards = metaDeck.map((id) => allChars.find((c) => c.id === id)).filter(Boolean);

      // Eğer destede 5 kart yoksa koleksiyondan veya genel havuzdan 5 kart tamamla
      if (playerDeckCards.length < 5) {
        const metaCollection = Array.isArray(u.user_metadata?.card_collection) ? u.user_metadata.card_collection : [];
        const collectionCards = metaCollection.map((id) => allChars.find((c) => c.id === id)).filter(Boolean);
        const pool = collectionCards.length >= 5 ? collectionCards : allChars;
        playerDeckCards = pool.slice(0, 5);
      }
      setPlayerDeck(playerDeckCards);

      // 🎯 Eşleşecek Rakibi Oluştur (Oyuncunun kupa aralığına uygun)
      const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      const trophyVariation = Math.floor(Math.random() * 80) - 35;
      const botTrophies = Math.max(20, userTrophies + trophyVariation);

      // Rakibin 5 kartını dengeli seç
      const shuffled = [...allChars].sort(() => 0.5 - Math.random());
      const botCards = shuffled.slice(0, 5);

      setOpponent({
        name: botName,
        trophies: botTrophies,
        deck: botCards,
      });

      // Eşleşme animasyonu sonrası savaşa başla
      setTimeout(() => {
        setGameState('ready');
        setLoading(false);
      }, 1400);

    } catch (err) {
      console.error('Arena başlatılamadı:', err);
      setLoading(false);
    }
  }

  useEffect(() => {
    initArena();
  }, []);

  // Raund Düellosunu Başlat
  function handleClashRound() {
    if (gameState !== 'ready') return;
    setGameState('clashing');
    setCardRevealed(false);

    const playerCard = playerDeck[currentRound];
    const opponentCard = opponent.deck[currentRound];

    playSound('clash');

    // Kart açılma ve çarpışma animasyonu (800ms)
    setTimeout(() => {
      setCardRevealed(true);
      const clash = simulateCardClash(playerCard, opponentCard);
      setCurrentClashResult(clash);

      let newPlayerScore = playerScore;
      let newOpponentScore = opponentScore;

      if (clash.winner === 'player') {
        newPlayerScore++;
        setPlayerScore(newPlayerScore);
        playSound('win');
      } else {
        newOpponentScore++;
        setOpponentScore(newOpponentScore);
        playSound('loss');
      }

      setRoundHistory((prev) => [
        ...prev,
        {
          round: currentRound + 1,
          playerCard,
          opponentCard,
          clash,
        },
      ]);

      setGameState('round_result');
    }, 800);
  }

  // Sonraki Raund veya Maç Sonu
  async function handleNextRound() {
    if (currentRound < 4) {
      setCurrentRound((prev) => prev + 1);
      setCurrentClashResult(null);
      setCardRevealed(false);
      setGameState('ready');
    } else {
      // 5 Raund Bitti -> Maçı Sonuçlandır
      await finishMatch();
    }
  }

  // Maçı Sonuçlandır ve Kupaları / Ödülleri Dağıt
  async function finishMatch() {
    const isPlayerWinner = playerScore > opponentScore;
    const delta = calculateTrophyChange(playerTrophies, opponent?.trophies || 100, isPlayerWinner);
    const newTrophies = Math.max(0, playerTrophies + delta);

    const coinReward = isPlayerWinner ? 250 : 75;
    const xpReward = isPlayerWinner ? 100 : 35;

    const summary = {
      winner: isPlayerWinner ? 'player' : (playerScore === opponentScore ? 'draw' : 'opponent'),
      playerScore,
      opponentScore,
      trophyDelta: delta,
      newTrophies,
      coinReward,
      xpReward,
    };

    setMatchSummary(summary);
    setGameState('match_finished');

    if (isPlayerWinner) playSound('win');
    else playSound('loss');

    // Supabase Profil ve Metadata Güncelle
    try {
      if (user) {
        await supabase.auth.updateUser({
          data: { trophies: newTrophies },
        });

        if (profile) {
          const updatedCoins = (profile.coins || 0) + coinReward;
          const updatedXp = (profile.xp || 0) + xpReward;
          await supabase.from('profiles').update({ coins: updatedCoins, xp: updatedXp }).eq('id', user.id);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('coins-updated', { detail: { coins: updatedCoins } }));
          }
        }
      }
    } catch (e) {
      console.error('Kupa ve ödül güncellenirken hata:', e);
    }
  }

  // Yeni Maç Bul
  function handlePlayAgain() {
    setCurrentRound(0);
    setPlayerScore(0);
    setOpponentScore(0);
    setRoundHistory([]);
    setCurrentClashResult(null);
    setCardRevealed(false);
    setMatchSummary(null);
    setGameState('matchmaking');
    initArena();
  }

  // WhatsApp / X Paylaşım Metni
  const shareText = `🃏 Türk Karakterleri Kart Arenası'nda 5v5 düelloyu ${playerScore}-${opponentScore} tamamladım! Sen de desteni kur, arenaya çık: ${typeof window !== 'undefined' ? window.location.origin : ''}/kart-oyunu`;

  if (user === undefined || loading) {
    return (
      <div className="wrap empty" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '3rem', animation: 'pulse 1s infinite' }}>⚔️</div>
        <h2 style={{ marginTop: '16px', color: 'var(--accent)' }}>Uygun Rakip Aranıyor...</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '.95rem' }}>Ligine ve kupa seviyene en yakın savaşçı eşleştiriliyor.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wrap empty">
        Kart Arenasında savaşmak için <a href="/giris-yap">giriş yapmalısın</a>.
      </div>
    );
  }

  const playerLeague = getLeagueForTrophies(playerTrophies, leaguesConfig.leagues);
  const opponentLeague = getLeagueForTrophies(opponent?.trophies || 100, leaguesConfig.leagues);

  const activePlayerCard = playerDeck[currentRound];
  const activeOpponentCard = opponent?.deck[currentRound];

  return (
    <div className="wrap" style={{ maxWidth: '960px', paddingBottom: '80px' }}>
      {/* 🏆 Üst Skorboard & Oyuncu Barları */}
      <div
        className="card"
        style={{
          marginTop: '16px',
          padding: '16px 24px',
          borderRadius: '16px',
          background: 'linear-gradient(180deg, rgba(18, 22, 36, 0.95), rgba(10, 13, 22, 0.9))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Oyuncu Tarafı */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${playerLeague.color}55, #111)`,
                border: `2px solid ${playerLeague.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              {playerLeague.icon}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
                {profile?.username || 'Sen'}
              </div>
              <div style={{ fontSize: '.8rem', color: playerLeague.color }}>
                🏆 {playerTrophies} Kupa ({playerLeague.name})
              </div>
            </div>
          </div>

          {/* Ortadaki Canlı Skor & Raund */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-dim)', marginBottom: '2px' }}>
              {gameState === 'match_finished' ? 'DÜELLO TAMAMLANDI' : `${currentRound + 1}. RAUND / 5`}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: playerScore > opponentScore ? '#22c55e' : '#fff' }}>{playerScore}</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>:</span>
              <span style={{ color: opponentScore > playerScore ? '#ef4444' : '#fff' }}>{opponentScore}</span>
            </div>
          </div>

          {/* Rakip Tarafı */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'right' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
                {opponent?.name}
              </div>
              <div style={{ fontSize: '.8rem', color: opponentLeague.color }}>
                🏆 {opponent?.trophies} Kupa ({opponentLeague.name})
              </div>
            </div>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${opponentLeague.color}55, #111)`,
                border: `2px solid ${opponentLeague.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              {opponentLeague.icon}
            </div>
          </div>
        </div>

        {/* 5 Raundluk İlerleme Puanları */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[0, 1, 2, 3, 4].map((idx) => {
            const hist = roundHistory[idx];
            let dotColor = 'rgba(255, 255, 255, 0.15)';
            let label = `R${idx + 1}`;
            if (hist) {
              if (hist.clash.winner === 'player') {
                dotColor = '#22c55e';
                label = '✓';
              } else {
                dotColor = '#ef4444';
                label = '✗';
              }
            } else if (idx === currentRound && gameState !== 'match_finished') {
              dotColor = 'var(--accent)';
            }
            return (
              <div
                key={idx}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: dotColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '.75rem',
                  fontWeight: 900,
                  color: '#fff',
                  border: idx === currentRound && gameState !== 'match_finished' ? '2px solid #fff' : 'none',
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* ⚔️ ARENA SAHNESİ: KART ÇARPIŞMASI */}
      {gameState !== 'match_finished' ? (
        <div style={{ marginTop: '24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 1. OYUNCU KARTI */}
            <div
              className="card"
              style={{
                padding: '20px',
                borderRadius: '16px',
                border: '2px solid var(--accent)',
                boxShadow: '0 0 25px rgba(226, 178, 44, 0.25)',
                background: 'linear-gradient(160deg, #131726, #0e111d)',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: '12px', left: '16px' }}>
                <TierBadge tier={activePlayerCard?.tier} large />
              </div>
              <div style={{ position: 'absolute', top: '14px', right: '16px', fontSize: '.8rem', color: 'var(--accent)', fontWeight: 800 }}>
                KARTIN
              </div>

              <div
                style={{
                  width: '140px',
                  height: '140px',
                  margin: '20px auto 14px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid var(--accent)',
                  boxShadow: '0 0 16px rgba(0,0,0,0.6)',
                  background: '#1a1f2e',
                }}
              >
                {activePlayerCard?.image_url ? (
                  <img
                    src={activePlayerCard.image_url}
                    alt={activePlayerCard.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                    👤
                  </div>
                )}
              </div>

              <h2 style={{ fontSize: '1.3rem', margin: '4px 0 2px' }}>{activePlayerCard?.name}</h2>
              <div style={{ fontSize: '.85rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
                {activePlayerCard?.series || 'Evren'}
              </div>

              {/* Stat Barları */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', fontSize: '.8rem' }}>
                <StatRow label="Güç" val={activePlayerCard?.power_score || 50} color="#ef4444" />
                <StatRow label="Hız" val={activePlayerCard?.speed_score || 50} color="#3b82f6" />
                <StatRow label="Zeka" val={activePlayerCard?.intelligence_score || 50} color="#eab308" />
                <StatRow label="Dayanıklılık" val={activePlayerCard?.durability_score || 50} color="#22c55e" />
              </div>
            </div>

            {/* 2. ORTA DÜELLO EYLEM BUTONU / HAKEM YORUMU */}
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>⚡ VS ⚡</div>

              {gameState === 'ready' && (
                <button
                  type="button"
                  onClick={handleClashRound}
                  className="btn"
                  style={{
                    padding: '16px 36px',
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #eab308, #ef4444)',
                    color: '#fff',
                    boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)',
                    width: '100%',
                    maxWidth: '260px',
                    cursor: 'pointer',
                  }}
                >
                  ⚔️ KARTLARI ÇARPIŞTIR
                </button>
              )}

              {gameState === 'clashing' && (
                <div style={{ padding: '16px', fontWeight: 800, color: 'var(--accent)', animation: 'pulse 0.6s infinite' }}>
                  🤖 Yapay Zeka Hakemi Hesaplıyor...
                </div>
              )}

              {gameState === 'round_result' && currentClashResult && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      display: 'inline-block',
                      fontWeight: 900,
                      fontSize: '.95rem',
                      marginBottom: '10px',
                      background: currentClashResult.winner === 'player' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      border: `1px solid ${currentClashResult.winner === 'player' ? '#22c55e' : '#ef4444'}`,
                      color: currentClashResult.winner === 'player' ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {currentClashResult.winner === 'player' ? '🏆 RAUNDU KAZANDIN!' : '❌ RAUNDU KAYBETTİN!'}
                  </div>

                  <div
                    className="card"
                    style={{
                      padding: '12px 14px',
                      background: 'rgba(0,0,0,0.5)',
                      borderRadius: '10px',
                      fontSize: '.85rem',
                      color: '#ddd',
                      lineHeight: '1.4',
                      marginBottom: '14px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '4px' }}>
                      ⚖️ Hakem Analizi:
                    </strong>
                    {currentClashResult.narrative}
                    <div style={{ marginTop: '6px', fontSize: '.78rem', color: '#94a3b8' }}>
                      {currentClashResult.statHighlight}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="btn"
                    style={{
                      padding: '12px 28px',
                      fontWeight: 800,
                      background: 'var(--accent)',
                      color: '#111',
                      cursor: 'pointer',
                      width: '100%',
                      maxWidth: '240px',
                    }}
                  >
                    {currentRound < 4 ? 'Sonraki Raund ➔' : 'Maçı Tamamla ➔'}
                  </button>
                </div>
              )}
            </div>

            {/* 3. RAKİP KARTI */}
            <div
              className="card"
              style={{
                padding: '20px',
                borderRadius: '16px',
                border: '2px solid rgba(255,255,255,0.15)',
                background: 'linear-gradient(160deg, #131726, #0e111d)',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: '12px', left: '16px' }}>
                {cardRevealed ? <TierBadge tier={activeOpponentCard?.tier} large /> : <span className="tier-badge">?</span>}
              </div>
              <div style={{ position: 'absolute', top: '14px', right: '16px', fontSize: '.8rem', color: 'var(--text-dim)', fontWeight: 800 }}>
                RAKİP KARTI
              </div>

              {cardRevealed ? (
                <>
                  <div
                    style={{
                      width: '140px',
                      height: '140px',
                      margin: '20px auto 14px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #ef4444',
                      boxShadow: '0 0 16px rgba(0,0,0,0.6)',
                      background: '#1a1f2e',
                    }}
                  >
                    {activeOpponentCard?.image_url ? (
                      <img
                        src={activeOpponentCard.image_url}
                        alt={activeOpponentCard.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                        👤
                      </div>
                    )}
                  </div>

                  <h2 style={{ fontSize: '1.3rem', margin: '4px 0 2px' }}>{activeOpponentCard?.name}</h2>
                  <div style={{ fontSize: '.85rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
                    {activeOpponentCard?.series || 'Evren'}
                  </div>

                  {/* Stat Barları */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', fontSize: '.8rem' }}>
                    <StatRow label="Güç" val={activeOpponentCard?.power_score || 50} color="#ef4444" />
                    <StatRow label="Hız" val={activeOpponentCard?.speed_score || 50} color="#3b82f6" />
                    <StatRow label="Zeka" val={activeOpponentCard?.intelligence_score || 50} color="#eab308" />
                    <StatRow label="Dayanıklılık" val={activeOpponentCard?.durability_score || 50} color="#22c55e" />
                  </div>
                </>
              ) : (
                /* Gizli / Ters Kart */
                <div
                  style={{
                    height: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    margin: '20px 0',
                    background: 'rgba(0,0,0,0.3)',
                  }}
                >
                  <div style={{ fontSize: '3.5rem', marginBottom: '8px', opacity: 0.6 }}>🎴</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-dim)' }}>Gizli Kart</div>
                  <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                    Çarpışma anında açılacak
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 🏆 MAÇ SONU ÖZET EKRANI */
        <div
          className="card"
          style={{
            marginTop: '30px',
            padding: '36px 24px',
            textAlign: 'center',
            borderRadius: '20px',
            background: matchSummary.winner === 'player'
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(15, 23, 42, 0.95))'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(15, 23, 42, 0.95))',
            border: `2px solid ${matchSummary.winner === 'player' ? '#22c55e' : '#ef4444'}`,
            boxShadow: `0 0 40px ${matchSummary.winner === 'player' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          }}
        >
          <div style={{ fontSize: '4.5rem', marginBottom: '10px' }}>
            {matchSummary.winner === 'player' ? '👑' : '💀'}
          </div>

          <h1 style={{ fontSize: '2.4rem', margin: '0 0 8px', color: matchSummary.winner === 'player' ? '#22c55e' : '#ef4444' }}>
            {matchSummary.winner === 'player' ? 'DESTANSI ZAFER!' : 'ARENADA YENİLGİ'}
          </h1>

          <div style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '24px' }}>
            Nihai Skor: <strong style={{ color: '#fff' }}>{playerScore} - {opponentScore}</strong>
          </div>

          {/* Kupa & Ödül Kartları */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              maxWidth: '560px',
              margin: '0 auto 30px',
            }}
          >
            <div
              className="card"
              style={{
                flex: '1 1 140px',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ fontSize: '.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Kupa Değişimi</div>
              <div
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  marginTop: '4px',
                  color: matchSummary.trophyDelta >= 0 ? '#22c55e' : '#ef4444',
                }}
              >
                {matchSummary.trophyDelta >= 0 ? `+${matchSummary.trophyDelta}` : matchSummary.trophyDelta} 🏆
              </div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Yeni Kupan: {matchSummary.newTrophies}
              </div>
            </div>

            <div
              className="card"
              style={{
                flex: '1 1 140px',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ fontSize: '.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Kazanılan Ödül</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '4px', color: '#fef08a' }}>
                +{matchSummary.coinReward} 🪙
              </div>
              <div style={{ fontSize: '.75rem', color: '#93c5fd', marginTop: '2px' }}>
                +{matchSummary.xpReward} XP
              </div>
            </div>
          </div>

          {/* Eylem Butonları */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePlayAgain}
              className="btn"
              style={{
                padding: '14px 28px',
                fontSize: '1.05rem',
                fontWeight: 900,
                background: 'var(--accent)',
                color: '#111',
                boxShadow: '0 0 20px var(--accent-glow)',
                cursor: 'pointer',
              }}
            >
              ⚔️ Yeni Rakip Bul & Savaş
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: 800,
                background: '#25D366',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>📲</span> WhatsApp'ta Paylaş
            </a>

            <a
              href="/kart-oyunu"
              className="btn btn-ghost"
              style={{
                padding: '14px 24px',
                fontSize: '1rem',
              }}
            >
              🃏 Desteye & Hub'a Dön
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, val, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#cbd5e1' }}>
        <span>{label}</span>
        <strong style={{ color }}>{val}</strong>
      </div>
      <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, val)}%`, height: '100%', background: color, borderRadius: '3px' }} />
      </div>
    </div>
  );
}
