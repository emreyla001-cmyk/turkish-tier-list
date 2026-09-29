'use client';

import { useEffect, useState, useMemo } from 'react';
import TierBadge from './TierBadge';
import { getTribute } from './tributes';

// Her 1.5 saat = 90 dakika = 5,400,000 milisaniye
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

  // Başlangıçta zaman dilimine göre deterministik karakter indeksi
  const [activeIdx, setActiveIdx] = useState(() => getScheduledIndex(charCount));
  const [isManual, setIsManual] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(() => getMinutesRemaining());

  // 1.5 saatlik zaman dilimi senkronizasyonu ve otomatik geçiş
  useEffect(() => {
    if (charCount <= 1) return;

    // Sayfa açıldığında doğru dilimi teyit et
    const scheduled = getScheduledIndex(charCount);
    if (!isManual) {
      setActiveIdx(scheduled);
    }

    // Kalan dakikayı her 30 saniyede bir güncelle
    const minuteTicker = setInterval(() => {
      setRemainingMinutes(getMinutesRemaining());
    }, 30000);

    // Kalan sürenin bitiş anında otomatik olarak sıradaki karaktere geç
    const msToNext = INTERVAL_MS - (Date.now() % INTERVAL_MS);
    const timeout = setTimeout(() => {
      setActiveIdx(getScheduledIndex(charCount));
      setIsManual(false);
      setRemainingMinutes(90);

      // Ardından her 1.5 saatte bir dön
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

  if (!featuredCharacters || charCount === 0) return null;

  const current = featuredCharacters[activeIdx] || featuredCharacters[0];
  const tribute = current ? getTribute(current.name, current.series) : null;

  // Aktif karakterin etrafındaki 5 karakteri gösteren mini navigasyon havuzu
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
              title="Afiş görseli her 1.5 saatte bir kataloğumuzdaki tüm fotoğraflı karakterler arasında otomatik olarak değişir."
            >
              🕒 1.5 Saatte Bir Yenilenir ({remainingMinutes} dk kaldı)
            </span>
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

          {/* Vefat eden usta sanatçılarımız için saygı şeridi */}
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

          {/* Modern Vitrin Navigasyonu (Tüm 73+ Karakter Arasında Gezinme) */}
          {charCount > 1 && (
            <div
              style={{
                marginTop: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Sol Ok */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="spotlight-nav-btn"
                  title="Önceki Karakter"
                  aria-label="Önceki Karakter"
                >
                  ◀
                </button>

                {/* Çevredeki 5 Karakter Butonu */}
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

                {/* Sağ Ok */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="spotlight-nav-btn"
                  title="Sonraki Karakter"
                  aria-label="Sonraki Karakter"
                >
                  ▶
                </button>

                {/* Sayaç ve Durum */}
                <span
                  style={{
                    fontSize: '.75rem',
                    color: 'var(--text-dim)',
                    marginLeft: '4px',
                    fontWeight: 600,
                  }}
                >
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
                    title="Şu anki 1.5 saatlik canlı vitrin karakterine dön"
                  >
                    <span>🔄</span> Canlı Dilime Dön
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sağ Taraf: Büyük Poster Vitrini */}
        <div className="hero-spotlight-visual">
          <div className="spotlight-poster-card" key={current.id + '-card'}>
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
