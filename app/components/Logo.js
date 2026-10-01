'use client';

export default function Logo({ size = 32, className = '' }) {
  return (
    <div
      className={`brand-logo-wrap ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 0 12px rgba(6, 182, 212, 0.4), 0 0 0 1px rgba(6, 182, 212, 0.3)',
        background: '#0e131f',
        flexShrink: 0,
        position: 'relative'
      }}
    >
      <img
        src="/logo.jpg"
        alt="Turkish Tier List Logo"
        width={size}
        height={size}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
        onError={(e) => {
          e.target.style.display = 'none';
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'block';
          }
        }}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'none', width: '100%', height: '100%' }}
      >
        <rect width="64" height="64" rx="14" fill="#0f172a" />
        <path d="M32 8L50 16V30C50 42 42 50 32 56C22 50 14 42 14 30V16L32 8Z" fill="#06b6d4" opacity="0.4" />
        <path d="M22 22H42M32 22V44" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
