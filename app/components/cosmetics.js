// Bilinen mağaza eşyalarının varsayılan CSS değerleri
export const KNOWN_FRAMES = {
  frame_gold: 'linear-gradient(135deg,#f4d35e,#e6b325)',
  frame_sapphire: 'linear-gradient(135deg,#5b8ce6,#1f3a8a)',
  frame_emerald: 'linear-gradient(135deg,#6fbf73,#1f6b3a)',
  frame_cosmic: 'linear-gradient(135deg,#9b59e6,#e6455b,#5b8ce6)',
  frame_ruby: 'linear-gradient(135deg,#e6455b,#8a1f2d)',
};

export const KNOWN_BACKGROUNDS = {
  bg_aurora: 'linear-gradient(135deg,#1b1f2a,#2a1f45,#12203a)',
  bg_sunset: 'linear-gradient(135deg,#3a1f2a,#6b2d1f,#2a1210)',
  bg_forest: 'linear-gradient(135deg,#12251a,#1f3a2a,#0d1a12)',
  bg_cosmic: 'linear-gradient(135deg,#1a0d2e,#3a1055,#0d0d2e)',
};

export const KNOWN_NAME_COLORS = {
  nc_ruby: '#e6455b',
  nc_gold: '#e6b325',
  nc_azure: '#5b8ce6',
  nc_emerald: '#6fbf73',
  nc_rainbow: 'linear-gradient(90deg,#e6455b,#e68a25,#e6c825,#6fbf73,#5b8ce6,#9b59e6)',
};

export function resolveFrame(val, map) {
  if (!val) return undefined;
  if (map && map[val]) return map[val];
  if (KNOWN_FRAMES[val]) return KNOWN_FRAMES[val];
  if (typeof val === 'string' && val.includes('gradient')) return val;
  return undefined;
}

export function resolveBackground(val, map) {
  if (!val) return undefined;
  if (map && map[val]) return map[val];
  if (KNOWN_BACKGROUNDS[val]) return KNOWN_BACKGROUNDS[val];
  if (typeof val === 'string' && (val.includes('gradient') || val.startsWith('#') || val.startsWith('url'))) return val;
  return undefined;
}

export function resolveNameColor(val, map) {
  if (!val) return undefined;
  if (map && map[val]) return map[val];
  if (KNOWN_NAME_COLORS[val]) return KNOWN_NAME_COLORS[val];
  return val;
}

export function frameStyle(gradient) {
  const g = resolveFrame(gradient) || gradient;
  if (!g || typeof g !== 'string') return {};
  return {
    border: '3px solid transparent',
    backgroundImage: `linear-gradient(var(--bg-2),var(--bg-2)), ${g}`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  };
}

export function nameColorStyle(value) {
  const v = resolveNameColor(value) || value;
  if (!v || typeof v !== 'string') return {};
  if (v.startsWith('linear-gradient')) {
    return {
      backgroundImage: v,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      fontWeight: 800,
      display: 'inline-block',
    };
  }
  return { color: v, fontWeight: 800 };
}
