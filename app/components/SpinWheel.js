'use client';

import { useState } from 'react';

const COLORS = ['#e6455b', '#e68a25', '#e6c825', '#6fbf73', '#5b8ce6', '#9b59e6', '#e64592'];

function arcPath(cx, cy, r, startDeg, endDeg) {
  const toRad = (d) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

// rewards: [{id, label, icon}], onResultId: () => Promise<rewardId>
export default function SpinWheel({ rewards, disabled, onSpin, spinning, setSpinning }) {
  const [rotation, setRotation] = useState(0);
  const n = rewards.length;
  const seg = 360 / n;
  const size = 260;
  const r = size / 2 - 6;

  async function handleClick() {
    if (disabled || spinning) return;
    setSpinning(true);
    const rewardId = await onSpin();
    if (!rewardId) { setSpinning(false); return; }
    const idx = rewards.findIndex((x) => x.id === rewardId);
    const targetCenter = idx * seg + seg / 2;
    const spins = 5 * 360;
    const finalRotation = rotation - (rotation % 360) + spins + (360 - targetCenter);
    setRotation(finalRotation);
    setTimeout(() => setSpinning(false), 3200);
  }

  return (
    <div className="wheel-wrap">
      <div className="wheel-pointer">▼</div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 3.1s cubic-bezier(.17,.67,.16,1)' : 'none' }}>
        <g>
          {rewards.map((rw, i) => {
            const start = i * seg;
            const end = start + seg;
            const mid = start + seg / 2;
            const toRad = (d) => ((d - 90) * Math.PI) / 180;
            const lx = size / 2 + (r * 0.62) * Math.cos(toRad(mid));
            const ly = size / 2 + (r * 0.62) * Math.sin(toRad(mid));
            return (
              <g key={rw.id}>
                <path d={arcPath(size / 2, size / 2, r, start, end)} fill={COLORS[i % COLORS.length]} stroke="#0d0f14" strokeWidth="2" />
                <text x={lx} y={ly} fontSize="20" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${mid}, ${lx}, ${ly})`}>{rw.icon}</text>
              </g>
            );
          })}
          <circle cx={size / 2} cy={size / 2} r={size / 2} fill="none" stroke="#0d0f14" strokeWidth="4" />
        </g>
      </svg>
      <button className="btn wheel-btn" onClick={handleClick} disabled={disabled || spinning}>
        {spinning ? 'Dönüyor...' : 'Çevir'}
      </button>
    </div>
  );
}
