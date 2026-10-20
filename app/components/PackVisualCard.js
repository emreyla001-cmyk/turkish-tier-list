'use client';

import { useState } from 'react';

const PACK_THEMES = {
  pack_bronze: {
    borderColor: '#cd7f32',
    glowColor: 'rgba(205, 127, 50, 0.4)',
    accentGradient: 'linear-gradient(135deg, #cd7f32, #8b4513)',
    titleColor: '#fef08a',
    bgGradient: 'linear-gradient(160deg, #1f140e 0%, #0d0906 50%, #2a1b12 100%)',
    badgeText: '🥉 BRONZ PAKET',
  },
  pack_silver: {
    borderColor: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.5)',
    accentGradient: 'linear-gradient(135deg, #cbd5e1, #64748b)',
    titleColor: '#e2e8f0',
    bgGradient: 'linear-gradient(160deg, #111827 0%, #030712 50%, #1e293b 100%)',
    badgeText: '🥈 GÜMÜŞ PAKET',
  },
  pack_gold: {
    borderColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.55)',
    accentGradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
    titleColor: '#ffd700',
    bgGradient: 'linear-gradient(160deg, #241a06 0%, #0d0901 50%, #362708 100%)',
    badgeText: '🥇 ALTIN PAKET',
  },
  pack_mega: {
    borderColor: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.6)',
    accentGradient: 'linear-gradient(135deg, #00f0ff, #3b82f6)',
    titleColor: '#a5f3fc',
    bgGradient: 'linear-gradient(160deg, #061e29 0%, #020b12 50%, #092e3f 100%)',
    badgeText: '💎 PLATİN PAKET',
  },
  pack_cosmic: {
    borderColor: '#ff007f',
    glowColor: 'rgba(255, 0, 127, 0.65)',
    accentGradient: 'linear-gradient(135deg, #ff007f, #7928ca, #f59e0b)',
    titleColor: '#f0abfc',
    bgGradient: 'linear-gradient(160deg, #28061a 0%, #0f020a 50%, #3d0929 100%)',
    badgeText: '👑 KOZMİK DIVAN',
  },
};

export default function PackVisualCard({ pack, isOpening, onOpen }) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, isHover: false });
  const theme = PACK_THEMES[pack.id] || PACK_THEMES.pack_bronze;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const rx = ((y - cy) / cy) * -12;
    const ry = ((x - cx) / cx) * 12;

    setTilt({ rx, ry, isHover: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, isHover: false });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        perspective: '1000px',
        margin: '0 auto',
      }}
    >
      {/* REFERANS GÖRSELDEKİ SİNEMATİK PAKET KILIFI */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onOpen}
        style={{
          width: '180px',
          height: '250px',
          background: theme.bgGradient,
          borderRadius: '16px',
          border: `2px solid ${theme.borderColor}`,
          boxShadow: tilt.isHover
            ? `0 20px 40px rgba(0,0,0,0.9), 0 0 35px ${theme.glowColor}, inset 0 0 20px ${theme.glowColor}`
            : `0 10px 25px rgba(0,0,0,0.8), 0 0 20px ${theme.glowColor}`,
          transform: tilt.isHover
            ? `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.05)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
          transition: tilt.isHover ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out, box-shadow 0.4s ease-out',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          willChange: 'transform',
        }}
      >
        {/* Holografik Işık Şeridi Sweep */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-150%',
            width: '220%',
            height: '220%',
            background: 'linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.25) 48%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.25) 52%, transparent 70%)',
            transform: tilt.isHover ? 'translate3d(120%, 120%, 0) rotate(25deg)' : 'rotate(25deg)',
            transition: 'transform 0.75s ease',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />

        {/* Üst Taç İkonu */}
        <div style={{ fontSize: '2rem', marginBottom: '6px', filter: `drop-shadow(0 0 10px ${theme.borderColor})` }}>
          👑
        </div>

        {/* Kabarık "TÜRK TIER LIST" Başlığı */}
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.15rem',
            fontWeight: 900,
            color: theme.titleColor,
            textShadow: `0 0 12px ${theme.glowColor}, 0 2px 8px rgba(0,0,0,0.9)`,
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '1px',
            marginBottom: '8px',
          }}
        >
          TÜRK<br />TIER LIST
        </div>

        <div style={{ fontSize: '.6rem', color: '#94a3b8', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '14px' }}>
          Kartlarını Topla
        </div>

        {/* Paket Türü Etiketi */}
        <div
          style={{
            background: theme.accentGradient,
            color: '#fff',
            fontWeight: 900,
            fontSize: '.68rem',
            padding: '3px 10px',
            borderRadius: '6px',
            boxShadow: `0 0 12px ${theme.glowColor}`,
            letterSpacing: '.5px',
          }}
        >
          {theme.badgeText}
        </div>
      </div>
    </div>
  );
}
