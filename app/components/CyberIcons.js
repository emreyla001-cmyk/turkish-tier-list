import React from 'react';

/**
 * 🪙 Prestijli Altın Tier Parası İkonu (3D Metalik Parıltılı)
 */
export function CoinIcon({ size = 20, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block', filter: 'drop-shadow(0 2px 5px rgba(245, 158, 11, 0.4))', ...style }}
      className={className}
    >
      <defs>
        <linearGradient id="goldOuter" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef08a" />
          <stop offset="0.5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="goldInner" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef9c3" />
          <stop offset="0.7" stopColor="#d97706" />
          <stop offset="1" stopColor="#78350f" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#goldOuter)" stroke="#fef08a" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="7.8" fill="url(#goldInner)" />
      {/* T Harfi veya Yıldız Damgası */}
      <path
        d="M9 8.5H15M12 8.5V16"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
      />
      <circle cx="8" cy="8" r="1" fill="#fff" opacity="0.6" />
    </svg>
  );
}

/**
 * ⚡ Prestijli Neon Enerji / Stamina İkonu
 */
export function EnergyIcon({ size = 20, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block', filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))', ...style }}
      className={className}
    >
      <defs>
        <linearGradient id="lightningGrad" x1="13" y1="2" x2="11" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="0.6" stopColor="#0284c7" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        fill="url(#lightningGrad)"
        stroke="#bae6fd"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * ⚔️ Prestijli Çapraz Kılıçlar İkonu (Savaş & Düello)
 */
export function SwordsIcon({ size = 20, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block', filter: 'drop-shadow(0 2px 6px rgba(239, 68, 68, 0.4))', ...style }}
      className={className}
    >
      <defs>
        <linearGradient id="bladeGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f8fafc" />
          <stop offset="0.7" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
      </defs>
      <path d="M14.5 17.5L3 6V3H6L17.5 14.5M14.5 17.5L18.5 21.5L21.5 18.5L17.5 14.5M14.5 17.5L17.5 14.5" stroke="url(#bladeGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 17.5L21 6V3H18L6.5 14.5M9.5 17.5L5.5 21.5L2.5 18.5L6.5 14.5M9.5 17.5L6.5 14.5" stroke="url(#bladeGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" fill="#f59e0b" />
    </svg>
  );
}

/**
 * 👑 Prestijli Altın Kraliyet Tacı İkonu (Zafer & Grandmaster)
 */
export function CrownIcon({ size = 20, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block', filter: 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.6))', ...style }}
      className={className}
    >
      <defs>
        <linearGradient id="crownGrad" x1="2" y1="6" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef08a" />
          <stop offset="0.5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path
        d="M2 19H22L20 9L15 14L12 5L9 14L4 9L2 19Z"
        fill="url(#crownGrad)"
        stroke="#fef08a"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="4" cy="9" r="1.5" fill="#ef4444" stroke="#fff" strokeWidth="0.5" />
      <circle cx="12" cy="5" r="1.8" fill="#38bdf8" stroke="#fff" strokeWidth="0.5" />
      <circle cx="20" cy="9" r="1.5" fill="#ef4444" stroke="#fff" strokeWidth="0.5" />
      <rect x="3" y="19" width="18" height="2" rx="1" fill="#d97706" />
    </svg>
  );
}

/**
 * 🛡️ Prestijli Muhafız Kalkanı İkonu
 */
export function ShieldIcon({ size = 20, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block', filter: 'drop-shadow(0 2px 6px rgba(14, 165, 233, 0.4))', ...style }}
      className={className}
    >
      <defs>
        <linearGradient id="shieldGrad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="0.7" stopColor="#0369a1" />
          <stop offset="1" stopColor="#0c4a6e" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L4 5V11C4 16.5 7.5 20.8 12 22C16.5 20.8 20 16.5 20 11V5L12 2Z"
        fill="url(#shieldGrad)"
        stroke="#7dd3fc"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M12 6V18" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 11H16" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 🔥 Prestijli Ateş / Kaos İkonu
 */
export function FireIcon({ size = 20, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block', filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))', ...style }}
      className={className}
    >
      <defs>
        <linearGradient id="fireOuter" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ef4444" />
          <stop offset="0.6" stopColor="#f97316" />
          <stop offset="1" stopColor="#eab308" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C10 6 7 8 7 13C7 16.3 9.7 19 13 19C15.8 19 18 16.8 18 14C18 10 14 6 14 6C14 6 15 9 13 10C11.5 10.7 12 8 12 2Z"
        fill="url(#fireOuter)"
      />
      <path
        d="M12 12C11 14 10 15 10 17C10 18.1 10.9 19 12 19C13.1 19 14 18.1 14 17C14 15 13 14 12 12Z"
        fill="#fef08a"
      />
    </svg>
  );
}

/**
 * 🃏 Prestijli Kart Destesi İkonu
 */
export function CardDeckIcon({ size = 20, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block', filter: 'drop-shadow(0 2px 6px rgba(168, 85, 247, 0.4))', ...style }}
      className={className}
    >
      <rect x="6" y="4" width="14" height="18" rx="2" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.2" />
      <rect x="4" y="2" width="14" height="18" rx="2" fill="#312e81" stroke="#c084fc" strokeWidth="1.2" />
      <path d="M11 7L13 10L11 13L9 10L11 7Z" fill="#f59e0b" />
    </svg>
  );
}

/**
 * 🏆 Prestijli Şampiyonluk Kupası İkonu
 */
export function TrophyIcon({ size = 20, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block', filter: 'drop-shadow(0 2px 6px rgba(245, 158, 11, 0.5))', ...style }}
      className={className}
    >
      <defs>
        <linearGradient id="trophyGrad" x1="12" y1="2" x2="12" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde047" />
          <stop offset="0.6" stopColor="#eab308" />
          <stop offset="1" stopColor="#a16207" />
        </linearGradient>
      </defs>
      <path
        d="M6 3H18V9C18 12.3 15.3 15 12 15C8.7 15 6 12.3 6 9V3Z"
        fill="url(#trophyGrad)"
        stroke="#fef08a"
        strokeWidth="1.2"
      />
      <path d="M6 5H3V8C3 9.7 4.3 11 6 11V5Z" fill="url(#trophyGrad)" stroke="#fef08a" strokeWidth="1" />
      <path d="M18 5H21V8C21 9.7 19.7 11 18 11V5Z" fill="url(#trophyGrad)" stroke="#fef08a" strokeWidth="1" />
      <path d="M12 15V18M8 21H16M10 18H14" stroke="#eab308" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
