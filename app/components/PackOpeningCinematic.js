'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getCardRarity, getStarInfo } from '../lib/cardRarity';
import TierBadge from './TierBadge';
import { cardAudio } from '../lib/cardAudio';

/* ── Rarity → renk haritası ── */
const RARITY_THEME = {
  R:   { color: '#94a3b8', glow: 'rgba(148,163,184,0.3)', bg: 'linear-gradient(135deg,#475569,#334155)', label: 'Sıradan' },
  SR:  { color: '#a855f7', glow: 'rgba(168,85,247,0.5)',  bg: 'linear-gradient(135deg,#7c3aed,#2563eb)', label: 'Yüksek Nadirlik' },
  SSR: { color: '#ffd700', glow: 'rgba(255,215,0,0.6)',   bg: 'linear-gradient(135deg,#eab308,#ca8a04)', label: 'Çok Nadir' },
  UR:  { color: '#ff007f', glow: 'rgba(255,0,127,0.7)',   bg: 'linear-gradient(135deg,#ff007f,#7928ca)', label: 'Efsanevi' },
};

function getHighestRarity(cards) {
  const order = ['R', 'SR', 'SSR', 'UR'];
  let best = 0;
  cards.forEach(c => {
    const r = getCardRarity(c.tier).code;
    const idx = order.indexOf(r);
    if (idx > best) best = idx;
  });
  return order[best];
}

/* ── Ana Bileşen ── */
export default function PackOpeningCinematic({ packResult, onClose }) {
  const [stage, setStage] = useState(0);        // 0:appear 1:shake 2:burst 3:reveal 4:summary
  const [revealIdx, setRevealIdx] = useState(-1); // hangi kart açılıyor
  const [flipped, setFlipped] = useState({});     // { idx: true }
  const [autoAdvance, setAutoAdvance] = useState(true);
  const timersRef = useRef([]);

  const cards = packResult?.drawnCards || [];
  const highestRarity = getHighestRarity(cards);
  const theme = RARITY_THEME[highestRarity] || RARITY_THEME.R;

  const addTimer = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // Stage pipeline
  useEffect(() => {
    if (!packResult) return;
    // Stage 1: shake (1s)
    addTimer(() => {
      setStage(1);
      try { cardAudio.playPackTear(); } catch {}
    }, 1500);
    // Stage 2: burst (0.8s) → start reveal
    addTimer(() => {
      setStage(2);
      try { cardAudio.playPackOpening(); } catch {}
    }, 2500);
    // Stage 3: reveal start
    addTimer(() => {
      setStage(3);
      setRevealIdx(0);
    }, 3300);

    return () => timersRef.current.forEach(clearTimeout);
  }, [packResult, addTimer]);

  // Card reveal auto-advance
  useEffect(() => {
    if (stage !== 3 || revealIdx < 0) return;
    if (revealIdx >= cards.length) {
      addTimer(() => {
        setStage(4);
        try { cardAudio.playVictoryFanfare(); } catch {}
      }, 400);
      return;
    }
    // Flip current card after short delay
    const flipDelay = addTimer(() => {
      setFlipped(prev => ({ ...prev, [revealIdx]: true }));
      const rarity = getCardRarity(cards[revealIdx]?.tier).code;
      try { cardAudio.playRarityReveal(rarity); } catch {}
    }, 500);

    // Auto-advance to next card
    if (autoAdvance) {
      const rarity = getCardRarity(cards[revealIdx]?.tier).code;
      const dur = rarity === 'UR' ? 2800 : rarity === 'SSR' ? 2200 : 1500;
      addTimer(() => setRevealIdx(prev => prev + 1), dur);
    }
    return () => clearTimeout(flipDelay);
  }, [stage, revealIdx, cards, autoAdvance, addTimer]);

  const handleCardClick = useCallback(() => {
    if (stage === 3 && revealIdx < cards.length) {
      if (!flipped[revealIdx]) {
        setFlipped(prev => ({ ...prev, [revealIdx]: true }));
        try { cardAudio.playCardFlip(); } catch {}
      } else {
        setRevealIdx(prev => prev + 1);
      }
    }
  }, [stage, revealIdx, cards.length, flipped]);

  if (!packResult) return null;

  const currentCard = cards[revealIdx] || null;
  const currentRarity = currentCard ? getCardRarity(currentCard.tier) : null;
  const currentTheme = currentRarity ? (RARITY_THEME[currentRarity.code] || RARITY_THEME.R) : theme;

  return (
    <>
      <style>{`
        @keyframes poPackAppear {
          0% { opacity:0; transform:scale(0.6) translateY(30px); }
          60% { opacity:1; transform:scale(1.05) translateY(-5px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes poPackShake {
          0%,100% { transform:translateX(0) rotate(0deg); }
          10% { transform:translateX(-6px) rotate(-1.5deg); }
          20% { transform:translateX(6px) rotate(1.5deg); }
          30% { transform:translateX(-8px) rotate(-2deg); }
          40% { transform:translateX(8px) rotate(2deg); }
          50% { transform:translateX(-10px) rotate(-2.5deg); }
          60% { transform:translateX(10px) rotate(2.5deg); }
          70% { transform:translateX(-12px) rotate(-3deg); }
          80% { transform:translateX(12px) rotate(3deg); }
          90% { transform:translateX(-6px) rotate(-1deg); }
        }
        @keyframes poBurst {
          0% { opacity:1; transform:scale(1); }
          30% { opacity:1; transform:scale(1.4); }
          100% { opacity:0; transform:scale(2.5); }
        }
        @keyframes poScreenFlash {
          0% { opacity:0; }
          20% { opacity:0.85; }
          100% { opacity:0; }
        }
        @keyframes poCardEnter {
          0% { opacity:0; transform:perspective(800px) translateY(60px) scale(0.7); }
          100% { opacity:1; transform:perspective(800px) translateY(0) scale(1); }
        }
        @keyframes poCardFlip {
          0% { transform:perspective(800px) rotateY(0deg); }
          100% { transform:perspective(800px) rotateY(180deg); }
        }
        @keyframes poHoloSweep {
          0% { background-position:-200% 0; }
          100% { background-position:200% 0; }
        }
        @keyframes poGlowPulse {
          0%,100% { box-shadow:0 0 20px var(--po-glow), inset 0 0 10px var(--po-glow); }
          50% { box-shadow:0 0 45px var(--po-glow), 0 0 80px var(--po-glow), inset 0 0 20px var(--po-glow); }
        }
        @keyframes poParticle {
          0% { transform:translateY(0) translateX(0) scale(1); opacity:1; }
          100% { transform:translateY(-120px) translateX(var(--po-dx,20px)) scale(0); opacity:0; }
        }
        @keyframes poURScreenShake {
          0%,100% { transform:translate(0,0); }
          10% { transform:translate(-3px,2px); }
          30% { transform:translate(3px,-2px); }
          50% { transform:translate(-2px,3px); }
          70% { transform:translate(2px,-3px); }
        }
        @keyframes poURLightning {
          0%,40%,60%,100% { opacity:0; }
          45%,55% { opacity:0.7; }
        }
        @keyframes poSummaryIn {
          0% { opacity:0; transform:translateY(30px); }
          100% { opacity:1; transform:translateY(0); }
        }
        @keyframes poStatBar {
          0% { width:0%; }
        }
        @keyframes poBgRadial {
          0%,100% { transform:scale(1); opacity:0.4; }
          50% { transform:scale(1.15); opacity:0.7; }
        }
      `}</style>

      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: stage === 3 && currentRarity?.code === 'UR' ? 'poURScreenShake 0.3s ease-in-out' : undefined,
        }}
        onClick={stage === 3 ? handleCardClick : undefined}
      >
        {/* ── Radial background glow ── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at center, ${theme.glow} 0%, transparent 70%)`,
          animation: 'poBgRadial 3s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* ── Floating particles ── */}
        {stage <= 2 && Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            borderRadius: '50%',
            background: theme.color,
            left: `${Math.random() * 100}%`,
            top: `${60 + Math.random() * 40}%`,
            opacity: 0.6,
            animation: `poParticle ${1.5 + Math.random() * 2}s ease-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            '--po-dx': `${(Math.random() - 0.5) * 60}px`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* ══════ STAGE 0 & 1: PACK APPEAR + SHAKE ══════ */}
        {stage <= 1 && (
          <div style={{
            animation: stage === 0 ? 'poPackAppear 1s cubic-bezier(0.34,1.56,0.64,1) forwards'
                     : 'poPackShake 0.6s ease-in-out infinite',
            willChange: 'transform',
          }}>
            <div style={{
              width: '220px', height: '300px',
              background: 'linear-gradient(160deg, #1a1d2e 0%, #0d0f1a 40%, #151929 100%)',
              borderRadius: '16px',
              border: `2px solid ${stage === 1 ? theme.color : '#333'}`,
              boxShadow: stage === 1 ? `0 0 40px ${theme.glow}, 0 0 80px ${theme.glow}` : '0 0 20px rgba(0,0,0,0.8)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              transition: 'border-color 0.5s, box-shadow 0.5s',
            }}>
              {/* Holographic sweep */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 70%)',
                backgroundSize: '200% 100%',
                animation: 'poHoloSweep 2.5s ease-in-out infinite',
                pointerEvents: 'none',
              }} />
              {/* Crown + Title */}
              <div style={{ fontSize: '2.4rem', marginBottom: '8px', filter: 'drop-shadow(0 0 8px rgba(234,179,8,0.6))' }}>👑</div>
              <div style={{
                fontFamily: 'Georgia, serif',
                fontSize: '1.6rem', fontWeight: 900,
                background: 'linear-gradient(135deg, #ffd700, #fff, #ffd700)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '2px', textAlign: 'center', lineHeight: 1.2,
              }}>
                TÜRK<br />TIER LIST
              </div>
              <div style={{
                fontSize: '.7rem', color: '#94a3b8', marginTop: '12px',
                letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>
                Kartlarını Topla
              </div>
              {/* Pack type badge */}
              <div style={{
                position: 'absolute', bottom: '16px',
                background: theme.bg, color: '#fff',
                fontSize: '.68rem', fontWeight: 800,
                padding: '4px 12px', borderRadius: '8px',
                boxShadow: `0 0 12px ${theme.glow}`,
              }}>
                {packResult.pack?.icon} {packResult.pack?.name?.split('(')[0]?.trim()}
              </div>
            </div>
          </div>
        )}

        {/* ══════ STAGE 2: BURST FLASH ══════ */}
        {stage === 2 && (
          <>
            <div style={{
              position: 'absolute',
              width: '220px', height: '300px',
              background: theme.bg,
              borderRadius: '16px',
              animation: 'poBurst 0.8s ease-out forwards',
              willChange: 'transform, opacity',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle, ${theme.color} 0%, transparent 70%)`,
              animation: 'poScreenFlash 0.8s ease-out forwards',
              pointerEvents: 'none',
            }} />
          </>
        )}

        {/* ══════ STAGE 3: CARD REVEAL (tek tek) ══════ */}
        {stage === 3 && currentCard && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '20px',
            animation: 'poCardEnter 0.5s ease-out',
          }}>
            {/* Counter */}
            <div style={{
              color: '#94a3b8', fontSize: '.85rem', fontWeight: 700,
              letterSpacing: '2px', textTransform: 'uppercase',
            }}>
              KART {revealIdx + 1} / {cards.length}
            </div>

            {/* UR Lightning overlay */}
            {currentRarity?.code === 'UR' && flipped[revealIdx] && (
              <div style={{
                position: 'fixed', inset: 0,
                background: 'radial-gradient(circle, rgba(255,0,127,0.15) 0%, transparent 60%)',
                animation: 'poURLightning 0.5s ease-in-out',
                pointerEvents: 'none', zIndex: 0,
              }} />
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              {/* 3D CARD */}
              <div style={{
                width: '260px', height: '380px',
                perspective: '1000px',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: '100%', height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: flipped[revealIdx] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  willChange: 'transform',
                }}>
                  {/* ─── BACK FACE ─── */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(160deg, #1a1d2e, #0d0f1a, #151929)',
                    borderRadius: '16px',
                    border: '2px solid #333',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 30px rgba(0,0,0,0.6)',
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👑</div>
                    <div style={{
                      fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 900,
                      background: 'linear-gradient(135deg, #ffd700, #fff, #ffd700)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>TÜRK TIER LIST</div>
                    <div style={{
                      width: '60px', height: '60px', marginTop: '16px',
                      border: '2px solid #333', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.6rem',
                    }}>?</div>
                  </div>

                  {/* ─── FRONT FACE ─── */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: '#0a0c14',
                    border: `2px solid ${currentTheme.color}`,
                    '--po-glow': currentTheme.glow,
                    animation: flipped[revealIdx] ? 'poGlowPulse 2s ease-in-out infinite' : undefined,
                    boxShadow: `0 0 30px ${currentTheme.glow}`,
                  }}>
                    {/* Rarity Badge */}
                    <div style={{
                      position: 'absolute', top: '10px', left: '10px', zIndex: 5,
                      background: currentTheme.bg,
                      color: '#fff', fontWeight: 900, fontSize: '.9rem',
                      padding: '4px 12px', borderRadius: '8px',
                      boxShadow: `0 0 16px ${currentTheme.glow}`,
                      letterSpacing: '1px',
                    }}>
                      {currentRarity?.code}
                    </div>

                    {/* New / Duplicate badge */}
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px', zIndex: 5,
                      background: currentCard.isDuplicate
                        ? 'rgba(234,179,8,0.25)' : 'rgba(34,197,94,0.25)',
                      color: currentCard.isDuplicate ? '#fef08a' : '#86efac',
                      fontWeight: 800, fontSize: '.7rem',
                      padding: '3px 8px', borderRadius: '6px',
                      border: `1px solid ${currentCard.isDuplicate ? 'rgba(234,179,8,0.4)' : 'rgba(34,197,94,0.4)'}`,
                    }}>
                      {currentCard.isDuplicate
                        ? (currentCard.refundGiven ? '🪙 +1000 İade' : '✨ +1 Parça')
                        : '🎉 YENİ!'}
                    </div>

                    {/* Portrait */}
                    <div style={{ width: '100%', height: '70%', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={currentCard.image_url}
                        alt={currentCard.name}
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'cover',
                          filter: currentRarity?.code === 'UR' ? 'saturate(1.2) contrast(1.1)' : 'none',
                        }}
                      />
                      {/* Holographic sweep on card face */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 55%, transparent 70%)',
                        backgroundSize: '200% 100%',
                        animation: 'poHoloSweep 3s ease-in-out infinite',
                        pointerEvents: 'none',
                      }} />
                    </div>

                    {/* Name + Info Bar */}
                    <div style={{
                      padding: '10px 14px',
                      background: 'linear-gradient(180deg, rgba(10,12,20,0.9), #0a0c14)',
                      height: '30%',
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                      <div style={{
                        fontWeight: 900, fontSize: '1.15rem',
                        color: '#fff',
                        textShadow: `0 0 10px ${currentTheme.glow}`,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {currentCard.name}
                      </div>
                      <div style={{
                        fontSize: '.72rem', color: '#94a3b8',
                        marginTop: '2px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        <span>{currentCard.series || 'Bilinmiyor'}</span>
                        <TierBadge tier={currentCard.tier} />
                      </div>
                      {/* Branding */}
                      <div style={{
                        fontSize: '.6rem', color: '#475569',
                        marginTop: '6px', letterSpacing: '1px',
                      }}>
                        👑 Türk Tier List
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── STATS PANEL (sağ taraf) ─── */}
              {flipped[revealIdx] && (
                <div style={{
                  width: '220px',
                  background: 'rgba(13,15,26,0.95)',
                  border: `1px solid ${currentTheme.color}40`,
                  borderRadius: '14px',
                  padding: '18px',
                  animation: 'poSummaryIn 0.5s ease-out',
                  boxShadow: `0 0 20px ${currentTheme.glow}`,
                }}>
                  <div style={{
                    textAlign: 'center', marginBottom: '14px',
                    fontSize: '.75rem', color: '#94a3b8',
                    textTransform: 'uppercase', letterSpacing: '2px',
                  }}>TIER</div>
                  <div style={{
                    textAlign: 'center', marginBottom: '16px',
                  }}>
                    <span style={{
                      fontSize: '2.2rem', fontWeight: 900,
                      color: currentTheme.color,
                      textShadow: `0 0 20px ${currentTheme.glow}`,
                    }}>
                      {currentCard.tier || '?'}
                    </span>
                  </div>

                  {[
                    { label: 'Güç', value: currentCard.power_score, icon: '⚡', color: '#ef4444' },
                    { label: 'Zeka', value: currentCard.intelligence_score, icon: '🧠', color: '#3b82f6' },
                    { label: 'Dayanıklılık', value: currentCard.durability_score, icon: '🛡️', color: '#22c55e' },
                    { label: 'Hız', value: currentCard.speed_score, icon: '💨', color: '#f59e0b' },
                  ].map((stat, si) => (
                    <div key={stat.label} style={{ marginBottom: '10px' }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: '.72rem', color: '#94a3b8', marginBottom: '3px',
                      }}>
                        <span>{stat.icon} {stat.label}</span>
                        <span style={{ color: '#fff', fontWeight: 800 }}>{stat.value ?? '—'}/10</span>
                      </div>
                      <div style={{
                        width: '100%', height: '6px',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '3px', overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${Math.min(100, ((stat.value || 0) / 10) * 100)}%`,
                          height: '100%',
                          background: stat.color,
                          borderRadius: '3px',
                          boxShadow: `0 0 6px ${stat.color}80`,
                          animation: 'poStatBar 0.8s ease-out',
                          animationDelay: `${si * 0.1}s`,
                          animationFillMode: 'backwards',
                        }} />
                      </div>
                    </div>
                  ))}

                  {/* Star info */}
                  {(() => {
                    const sInfo = getStarInfo(currentCard.stars || 1, currentCard.awakened || 0);
                    return (
                      <div style={{
                        marginTop: '10px', textAlign: 'center',
                        fontSize: '.72rem', color: '#fef08a',
                      }}>
                        {sInfo.starString}
                        <div style={{ color: currentTheme.color, fontWeight: 800, marginTop: '2px' }}>
                          +%{sInfo.bonusPercent} Güç Takviyesi
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Tap hint */}
            <div style={{
              color: '#475569', fontSize: '.78rem',
              animation: 'poSummaryIn 1s ease-out',
              marginTop: '10px',
            }}>
              Devam etmek için dokun veya tıkla
            </div>

            {/* Mini progress dots */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              {cards.map((c, i) => {
                const r = getCardRarity(c.tier);
                const t = RARITY_THEME[r.code] || RARITY_THEME.R;
                const revealed = i < revealIdx || (i === revealIdx && flipped[i]);
                return (
                  <div key={i} style={{
                    width: '10px', height: '10px',
                    borderRadius: '50%',
                    background: revealed ? t.color : '#333',
                    boxShadow: revealed ? `0 0 8px ${t.glow}` : 'none',
                    border: i === revealIdx ? '2px solid #fff' : '1px solid #333',
                    transition: 'all 0.3s',
                  }} />
                );
              })}
            </div>
          </div>
        )}

        {/* ══════ STAGE 4: SUMMARY ══════ */}
        {stage === 4 && (
          <div style={{
            width: '100%', maxWidth: '900px',
            padding: '30px 20px',
            animation: 'poSummaryIn 0.6s ease-out',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '20px',
          }}>
            {/* Title */}
            <div style={{ textAlign: 'center' }}>
              {highestRarity === 'UR' || highestRarity === 'SSR' ? (
                <div style={{
                  background: RARITY_THEME[highestRarity].bg,
                  color: '#fff', fontWeight: 900,
                  padding: '8px 24px', borderRadius: '12px',
                  fontSize: '.95rem', marginBottom: '12px',
                  boxShadow: `0 0 30px ${RARITY_THEME[highestRarity].glow}`,
                  display: 'inline-block',
                }}>
                  🔥 {highestRarity === 'UR' ? 'EFSANEVİ' : 'NADİR'} WALKOUT!
                </div>
              ) : null}
              <h2 style={{
                fontSize: '1.8rem', color: '#fff', margin: '0 0 6px',
                fontFamily: 'Georgia, serif',
              }}>
                👑 {packResult.pack?.name} Açıldı!
              </h2>
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '16px',
                flexWrap: 'wrap', fontSize: '.85rem',
              }}>
                <span style={{ color: '#86efac', fontWeight: 800 }}>🪙 +{packResult.cashback?.toLocaleString('tr-TR')} TP</span>
                {packResult.refundTotal > 0 && (
                  <span style={{ color: '#fef08a', fontWeight: 800 }}>✨ +{packResult.refundTotal?.toLocaleString('tr-TR')} TP İade</span>
                )}
                <span style={{ color: '#a5b4fc', fontWeight: 800 }}>⚡ +{packResult.xpReward} XP</span>
              </div>
            </div>

            {/* All cards grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(cards.length, 7)}, 1fr)`,
              gap: '12px', width: '100%', maxWidth: '800px',
            }}>
              {cards.map((c, idx) => {
                const r = getCardRarity(c.tier);
                const t = RARITY_THEME[r.code] || RARITY_THEME.R;
                const sInfo = getStarInfo(c.stars || 1, c.awakened || 0);
                return (
                  <div key={`${c.id}-${idx}`} style={{
                    background: '#0d111c',
                    borderRadius: '12px',
                    border: `2px solid ${t.color}`,
                    boxShadow: `0 0 16px ${t.glow}`,
                    overflow: 'hidden',
                    textAlign: 'center',
                    animation: 'poSummaryIn 0.4s ease-out',
                    animationDelay: `${idx * 0.08}s`,
                    animationFillMode: 'backwards',
                  }}>
                    {/* Rarity strip */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '4px 8px',
                    }}>
                      <span style={{
                        background: t.bg, color: '#fff',
                        fontSize: '.6rem', fontWeight: 900,
                        padding: '2px 6px', borderRadius: '4px',
                      }}>{r.code}</span>
                      <span style={{
                        fontSize: '.55rem', fontWeight: 800,
                        color: c.isDuplicate ? '#fef08a' : '#86efac',
                      }}>
                        {c.isDuplicate ? (c.refundGiven ? '💰' : '✨') : '🎉'}
                      </span>
                    </div>
                    {/* Image */}
                    <div style={{ width: '100%', height: '100px', overflow: 'hidden' }}>
                      <img src={c.image_url} alt={c.name} style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                      }} />
                    </div>
                    {/* Info */}
                    <div style={{ padding: '6px' }}>
                      <div style={{
                        fontWeight: 800, fontSize: '.72rem', color: '#fff',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{c.name}</div>
                      <div style={{ margin: '2px 0' }}><TierBadge tier={c.tier} /></div>
                      <div style={{ fontSize: '.6rem', color: '#fef08a' }}>{sInfo.starString}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rarity legend */}
            <div style={{
              display: 'flex', gap: '12px', justifyContent: 'center',
              flexWrap: 'wrap', marginTop: '6px',
            }}>
              {['R', 'SR', 'SSR', 'UR'].map(code => (
                <div key={code} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontSize: '.7rem', color: '#94a3b8',
                }}>
                  <span style={{
                    background: RARITY_THEME[code].bg, color: '#fff',
                    fontSize: '.6rem', fontWeight: 900,
                    padding: '2px 6px', borderRadius: '4px',
                  }}>{code}</span>
                  {RARITY_THEME[code].label}
                </div>
              ))}
            </div>

            {/* Continue button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              style={{
                padding: '14px 50px',
                fontSize: '1.1rem', fontWeight: 900,
                background: 'linear-gradient(135deg, var(--accent, #00f0ff), var(--accent-2, #7928ca))',
                color: '#111', border: 'none',
                borderRadius: '14px', cursor: 'pointer',
                boxShadow: '0 0 20px rgba(0,240,255,0.3)',
                letterSpacing: '1px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 0 35px rgba(0,240,255,0.5)'; }}
              onMouseOut={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 0 20px rgba(0,240,255,0.3)'; }}
            >
              ✓ DEVAM ET
            </button>
          </div>
        )}
      </div>
    </>
  );
}
