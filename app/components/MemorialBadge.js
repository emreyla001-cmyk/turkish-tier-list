'use client';

import { getTribute } from './tributes';

/**
 * Karakter kartları (PosterGrid) üzerinde gösterilen zarif anma rozeti.
 */
export function MemorialPosterBadge({ characterName, seriesName }) {
  const tribute = getTribute(characterName, seriesName);
  if (!tribute) return null;

  return (
    <div
      className="poster-memorial-badge"
      title={`Saygıyla Anıyoruz: ${tribute.actor} (${tribute.years})\n${tribute.roleNote}`}
    >
      <span className="memorial-ribbon-icon">🎗️</span>
      <span className="memorial-actor-name">{tribute.actor}</span>
      <span className="memorial-years">({tribute.years})</span>
    </div>
  );
}

/**
 * Karakter Detay Sayfası için sinematik, saygılı anma paneli.
 */
export function MemorialBanner({ characterName, seriesName }) {
  const tribute = getTribute(characterName, seriesName);
  if (!tribute) return null;

  return (
    <div className="memorial-detail-card">
      <div className="memorial-card-left">
        <div className="memorial-emblem-wrap">
          <svg className="memorial-ribbon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            {/* Zarif Anma Kurdelesi İkonu */}
            <path
              d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 9.5 10 13 12 16C14 13 16.5 9.5 16.5 6.5C16.5 4 14.5 2 12 2Z"
              fill="rgba(212, 175, 55, 0.25)"
              stroke="#eab308"
              strokeWidth="1.5"
            />
            <path
              d="M10 14L5 22L9 20L12 16"
              stroke="#eab308"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 14L19 22L15 20L12 16"
              stroke="#eab308"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="memorial-dove-icon">🕊️</span>
        </div>
      </div>

      <div className="memorial-card-content">
        <div className="memorial-card-header">
          <span className="memorial-pre-title">SAYGIYLA VE RAHMETLE ANIYORUZ</span>
          <span className="memorial-years-tag">{tribute.years}</span>
        </div>
        <h3 className="memorial-actor-title">{tribute.actor}</h3>
        <p className="memorial-role-note">{tribute.roleNote}</p>
        <p className="memorial-tribute-message">{tribute.message}</p>
      </div>
    </div>
  );
}
