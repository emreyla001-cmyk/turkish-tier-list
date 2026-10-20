'use client';

import React from 'react';

/**
 * 5 Boyutlu Güç / Stat Radarı (Radar Chart)
 * Değerler: 1 - 10 arası puanlar
 */
export default function StatRadar({ stats, size = 260 }) {
  // stats = [ { label: 'Güç', val: 10 }, { label: 'Zeka', val: 9 }, ... ]
  const count = stats.length || 5;
  const center = size / 2;
  const radius = (size / 2) - 36; // padding for labels

  // Açı hesaplama: Tepeden başla (-90 derece)
  function getCoordinates(index, valueRatio) {
    const angle = (Math.PI * 2 / count) * index - Math.PI / 2;
    const r = radius * valueRatio;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  }

  // 4 Kademeli eşmerkezli ağ çizgileri (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1];

  // Veri noktaları
  const points = stats.map((s, i) => {
    const val = Math.max(1, Math.min(10, Number(s.val) || 5));
    const ratio = val / 10;
    return getCoordinates(i, ratio);
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="stat-radar-wrap" style={{ width: size, height: size, margin: '0 auto', position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e6b325" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#e6455b" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e6b325" />
            <stop offset="100%" stopColor="#e6455b" />
          </linearGradient>
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Eşmerkezli Kılavuz Çizgileri */}
        {gridLevels.map((lvl) => {
          const lvlPoints = stats.map((_, i) => getCoordinates(i, lvl));
          const lvlPath = lvlPoints.map(p => `${p.x},${p.y}`).join(' ');
          return (
            <polygon
              key={lvl}
              points={lvlPath}
              fill={lvl === 1 ? 'rgba(255, 255, 255, 0.02)' : 'none'}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={lvl === 1 ? 1.5 : 1}
              strokeDasharray={lvl < 1 ? '3 3' : 'none'}
            />
          );
        })}

        {/* Merkezden köşelere eksen çizgileri */}
        {stats.map((_, i) => {
          const outer = getCoordinates(i, 1);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
            />
          );
        })}

        {/* Karakter Veri Alanı */}
        <polygon
          points={polygonPath}
          fill="url(#radarGrad)"
          stroke="url(#radarStroke)"
          strokeWidth="2.5"
          filter="url(#radarGlow)"
        />

        {/* Veri Noktaları */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4.5"
            fill="#fff"
            stroke="#e6455b"
            strokeWidth="2"
          />
        ))}

        {/* Etiketler (Labels) */}
        {stats.map((s, i) => {
          const labelCoord = getCoordinates(i, 1.22);
          const val = s.val ?? '?';
          return (
            <g key={i}>
              <text
                x={labelCoord.x}
                y={labelCoord.y - 4}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#f3f4f8"
                fontSize="11"
                fontWeight="700"
                fontFamily="'Manrope', sans-serif"
              >
                {s.label}
              </text>
              <text
                x={labelCoord.x}
                y={labelCoord.y + 9}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#e6b325"
                fontSize="10"
                fontWeight="800"
                fontFamily="'Sora', sans-serif"
              >
                {val}/10
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
