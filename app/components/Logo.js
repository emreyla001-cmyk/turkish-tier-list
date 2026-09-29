export default function Logo({ size = 28, id = 'logo-g' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6b325" />
          <stop offset="1" stopColor="#e6455b" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${id})`} />
      <rect x="13" y="15" width="38" height="8" rx="4" fill="#0d0f14" />
      <rect x="13" y="28" width="28" height="8" rx="4" fill="#0d0f14" opacity=".8" />
      <rect x="13" y="41" width="18" height="8" rx="4" fill="#0d0f14" opacity=".6" />
    </svg>
  );
}
