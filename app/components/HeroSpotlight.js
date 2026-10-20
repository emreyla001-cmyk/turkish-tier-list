'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import TierBadge from './TierBadge';
import { getTribute } from './tributes';

const INTERVAL_MS = 90 * 60 * 1000;

function getScheduledIndex(length) {
  if (!length || length <= 0) return 0;
  return Math.floor(Date.now() / INTERVAL_MS) % length;
}

function getMinutesRemaining() {
  const msRemaining = INTERVAL_MS - (Date.now() % INTERVAL_MS);
  return Math.max(1, Math.ceil(msRemaining / (60 * 1000)));
}

export default function HeroSpotlight({ featuredCharacters = [] }) {
  const charCount = featuredCharacters.length;

  const [activeIdx, setActiveIdx] = useState(() => getScheduledIndex(charCount));
  const [isManual, setIsManual] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(() => getMinutesRemaining());

  // 3D Parallax Tilt state
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50, isHover: false });

  // 1.5 saatlik senkronizasyon
  useEffect(() => {
    if (charCount <= 1) return;

    const scheduled = getScheduledIndex(charCount);
    if (!isManual) {
      setActiveIdx(scheduled);
    }

    const minuteTicker = setInterval(() => {
      setRemainingMinutes(getMinutesRemaining());
    }, 30000);

    const msToNext = INTERVAL_MS - (Date.now() % INTERVAL_MS);
    const timeout = setTimeout(() => {
      setActiveIdx(getScheduledIndex(charCount));
      setIsManual(false);
      setRemainingMinutes(90);

      const recurring = setInterval(() => {
        setActiveIdx(getScheduledIndex(charCount));
        setIsManual(false);
        setRemainingMinutes(90);
      }, INTERVAL_MS);

      return () => clearInterval(recurring);
    }, msToNext);

    return () => {
      clearTimeout(timeout);
      clearInterval(minuteTicker);
    };
  }, [charCount, isManual]);

  const current = featuredCharacters[activeIdx] || featuredCharacters[0];
  const tribute = current ? getTribute(current.name, current.series) : null;

  const nearbyIndices = useMemo(() => {
    if (charCount <= 5) return Array.from({ length: charCount }, (_, i) => i);
    const indices = [];
    for (let offset = -2; offset <= 2; offset++) {
      indices.push((activeIdx + offset + charCount) % charCount);
    }
    return indices;
  }, [activeIdx, charCount]);

  const handlePrev = () => {
    setIsManual(true);
    setActiveIdx((prev) => (prev - 1 + charCount) % charCount);
  };

  const handleNext = () => {
    setIsManual(true);
    setActiveIdx((prev) => (prev + 1) % charCount);
  };

  const handleSelect = (idx) => {
    setIsManual(true);
    setActiveIdx(idx);
  };

  const handleReturnToLive = () => {
    setIsManual(false);
    setActiveIdx(getScheduledIndex(charCount));
  };

  // BDSN & Eszter Bial seviyesinde 3D Mouse Tilt & Light Glare Efekti
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const rx = ((y - cy) / cy) * -18; // Max 18 deg tilt
    const ry = ((x - cx) / cx) * 18;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rx, ry, glareX, glareY, isHover: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 50, isHover: false });
  };

  if (!featuredCharacters || charCount === 0) return null;

  return (
    <section className="hero-spotlight">
      {/* Arka plan sinematik ambiyans katmanı */}
      <div
        className="hero-spotlight-bg"
        key={current.id + '-bg'}
        style={{
          backgroundImage: current.image_url ? `url(${current.image_url})` : undefined,
        }}
      />
      <div className="hero-spotlight-overlay" />

      <div className="wrap hero-spotlight-content">
        <div className="hero-spotlight-meta">
          <div className="hero-spotlight-badge-row">
            <span className="spotlight-tag">⭐ Öne Çıkan Karakter</span>
            <span
              className="spotlight-tag"
              style={{
                background: 'rgba(230, 179, 37, 0.15)',
                color: 'var(--accent)',
                border: '1px solid rgba(230, 179, 37, 0.35)',
              }}
              title="Afiş görseli her 1.5 saatte bir otomatik değişir."
            >
              🕒 1.5 Saatte Bir Yenilenir ({remainingMinutes} dk kaldı)
            </span>
            {current.category && <span className="spotlight-tag category-tag">{current.category}</span>}
            <TierBadge tier={current.tier} />
          </div>

          <h1 className="hero-spotlight-title" key={current.id + '-title'}>
            {current.name}
          </h1>

          <p className="hero-spotlight-series">
            Evren: <strong>{current.series || 'Bilinmiyor'}</strong>
          </p>

          <p className="hero-spotlight-desc">
            {(current.description_short || current.description)
              ? (current.description_short || current.description).slice(0, 160)
                + ((current.description_short || current.description).length > 160 ? '...' : '')
              : 'Türk kurgusunun en güçlü figürlerinden biri. Detaylı scaling, güç analizi ve tartışmalar sayfada.'}
          </p>

          {tribute && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '10px',
                background: 'rgba(230, 179, 37, 0.1)',
                border: '1px solid rgba(230, 179, 37, 0.3)',
                marginBottom: '18px',
                fontSize: '.82rem',
                color: '#fff',
              }}
            >
              <span>🎗️</span>
              <span>
                <strong>{tribute.actor}</strong> ({tribute.years}) anısına saygıyla
              </span>
            </div>
          )}

          {/* Hızlı Stat Önizlemesi & Neon Barlar */}
          <div className="hero-spotlight-stats">
            {[
              { icon: '⚡', label: 'Güç', val: current.power_score, color: '#ef4444' },
              { icon: '🧠', label: 'Zeka', val: current.intelligence_score, color: '#3b82f6' },
              { icon: '🏃', label: 'Hız', val: current.speed_score, color: '#f59e0b' },
              { icon: '🛡️', label: 'Dayanıklılık', val: current.durability_score, color: '#22c55e' },
            ].map((st) => (
              <div key={st.label} className="stat-pill" style={{ position: 'relative', overflow: 'hidden' }}>
                <span className="stat-icon">{st.icon}</span>
                <span className="stat-label">{st.label}</span>
                <strong className="stat-num">{st.val ?? '—'}/10</strong>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: `${Math.min(100, ((st.val || 5) / 10) * 100)}%`,
                    height: '2px',
                    background: st.color,
                    boxShadow: `0 0 8px ${st.color}`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="hero-spotlight-actions">
            <a href={`/karakter/${current.id}`} className="btn btn-spotlight-primary">
              Karakteri İncele →
            </a>
            <a href="/vs" className="btn btn-spotlight-secondary">
              ⚔️ VS Düellosuna Al
            </a>
            <a href="/tier-sistemi" className="btn btn-ghost">
              Tier Sistemi
            </a>
          </div>

          {/* Mini Vitrin Navigasyonu */}
          {charCount > 1 && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="spotlight-nav-btn"
                  title="Önceki Karakter"
                  aria-label="Önceki Karakter"
                >
                  ◀
                </button>

                {nearbyIndices.map((idx) => {
                  const c = featuredCharacters[idx];
                  if (!c) return null;
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`spotlight-dot ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelect(idx)}
                      title={`${c.name} (${c.series || ''})`}
                    >
                      <span className="dot-thumb">
                        {c.image_url ? <img src={c.image_url} alt={c.name} /> : '🎭'}
                      </span>
                      <span className="dot-name">{c.name}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={handleNext}
                  className="spotlight-nav-btn"
                  title="Sonraki Karakter"
                  aria-label="Sonraki Karakter"
                >
                  ▶
                </button>

                <span style={{ fontSize: '.75rem', color: 'var(--text-dim)', marginLeft: '4px', fontWeight: 600 }}>
                  {activeIdx + 1} / {charCount} Karakter
                </span>

                {isManual && (
                  <button
                    type="button"
                    onClick={handleReturnToLive}
                    style={{
                      background: 'rgba(230, 179, 37, 0.15)',
                      border: '1px solid rgba(230, 179, 37, 0.4)',
                      color: 'var(--accent)',
                      borderRadius: '16px',
                      padding: '3px 10px',
                      fontSize: '.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>🔄</span> Canlı Dilime Dön
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SAĞ TARAF: BÜYÜLEYİCİ 3D INTERACTIVE TILT POSTER VİTRİNİ */}
        <div className="hero-spotlight-visual">
          {/* Arkadaki 3D Döner Enerji Aurası Halka Katmanları */}
          <div className="hero-energy-ring" />
          <div className="hero-energy-ring secondary" />

          <div
            ref={cardRef}
            className="spotlight-poster-card"
            key={current.id + '-card'}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: tilt.isHover
                ? `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.04)`
                : undefined,
              transition: tilt.isHover ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out, box-shadow 0.5s ease-out',
            }}
          >
            {/* Holografik Dynamic Light Glare (Mouse takipli parlama şeridi) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: tilt.isHover
                  ? `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.35) 0%, rgba(0, 240, 255, 0.15) 30%, transparent 70%)`
                  : undefined,
                pointerEvents: 'none',
                zIndex: 4,
                mixBlendMode: 'overlay',
                transition: 'opacity 0.2s',
              }}
            />

            {current.image_url ? (
              <img src={current.image_url} alt={current.name} className="poster-img" />
            ) : (
              <div className="poster-placeholder">🎭</div>
            )}
            <div className="poster-glow" />
            <div className="poster-badge-float">
              <TierBadge tier={current.tier} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
