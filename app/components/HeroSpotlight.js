'use client';

import { useEffect, useState } from 'react';
import TierBadge from './TierBadge';

export default function HeroSpotlight({ featuredCharacters = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Otomatik geçiş (her 6 saniyede bir)
  useEffect(() => {
    if (featuredCharacters.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % featuredCharacters.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredCharacters.length]);

  if (!featuredCharacters || featuredCharacters.length === 0) return null;

  const current = featuredCharacters[activeIdx] || featuredCharacters[0];

  return (
    <section className="hero-spotlight">
      {/* Arka plan sinematik ambiyans katmanı */}
      <div
        className="hero-spotlight-bg"
        style={{
          backgroundImage: current.image_url ? `url(${current.image_url})` : undefined,
        }}
      />
      <div className="hero-spotlight-overlay" />

      <div className="wrap hero-spotlight-content">
        <div className="hero-spotlight-meta">
          <div className="hero-spotlight-badge-row">
            <span className="spotlight-tag">⭐ Öne Çıkan Karakter</span>
            {current.category && <span className="spotlight-tag category-tag">{current.category}</span>}
            <TierBadge tier={current.tier} />
          </div>

          <h1 className="hero-spotlight-title">{current.name}</h1>
          <p className="hero-spotlight-series">
            Evren: <strong>{current.series || 'Bilinmiyor'}</strong>
          </p>

          <p className="hero-spotlight-desc">
            {current.description
              ? current.description.slice(0, 160) + (current.description.length > 160 ? '...' : '')
              : 'Türk kurgusunun en güçlü figürlerinden biri. Detaylı scaling, güç analizi ve tartışmalar sayfada.'}
          </p>

          {/* Hızlı Stat Önizlemesi */}
          <div className="hero-spotlight-stats">
            <div className="stat-pill">
              <span className="stat-icon">⚡</span>
              <span className="stat-label">Güç</span>
              <strong className="stat-num">{current.power_score ?? '—'}/10</strong>
            </div>
            <div className="stat-pill">
              <span className="stat-icon">🧠</span>
              <span className="stat-label">Zeka</span>
              <strong className="stat-num">{current.intelligence_score ?? '—'}/10</strong>
            </div>
            <div className="stat-pill">
              <span className="stat-icon">🏃</span>
              <span className="stat-label">Hız</span>
              <strong className="stat-num">{current.speed_score ?? '—'}/10</strong>
            </div>
            <div className="stat-pill">
              <span className="stat-icon">🛡️</span>
              <span className="stat-label">Dayanıklılık</span>
              <strong className="stat-num">{current.durability_score ?? '—'}/10</strong>
            </div>
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

          {/* Slayt Geçiş Noktaları */}
          {featuredCharacters.length > 1 && (
            <div className="hero-spotlight-dots">
              {featuredCharacters.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  className={`spotlight-dot ${i === activeIdx ? 'active' : ''}`}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`${c.name} karakterine geç`}
                >
                  <span className="dot-thumb">
                    {c.image_url ? <img src={c.image_url} alt={c.name} /> : '🎭'}
                  </span>
                  <span className="dot-name">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sağ Taraf: Büyük Poster Vitrini */}
        <div className="hero-spotlight-visual">
          <div className="spotlight-poster-card">
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
