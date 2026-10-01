export default function Logo({ size = 32, id = 'logo-cyber' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.4))' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
      </defs>

      {/* Dış Kalkan & Neon Kenarlık */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id}-bg)`} stroke={`url(#${id})`} strokeWidth="2.5" />
      
      {/* İç Kalkan Amblemi */}
      <path
        d="M32 8L50 16V30C50 42 42 50 32 56C22 50 14 42 14 30V16L32 8Z"
        fill={`url(#${id})`}
        opacity="0.15"
      />
      <path
        d="M32 10L48 17V29C48 40 40 48 32 54C24 48 16 40 16 29V17L32 10Z"
        stroke={`url(#${id})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Stylized TS Harf Amblemi */}
      <path
        d="M22 22H42M32 22V44"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}
      />
      <path
        d="M38 34C38 34 32 32 32 38C32 44 38 42 38 46C38 50 32 48 32 48"
        stroke="#06b6d4"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.8))' }}
      />

      {/* Neon Köşe Vurgusu */}
      <circle cx="50" cy="14" r="2.5" fill="#06b6d4" />
    </svg>
  );
}
