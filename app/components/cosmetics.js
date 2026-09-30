// Bilinen mağaza eşyalarının varsayılan CSS değerleri
export const KNOWN_FRAMES = {
  frame_gold: 'linear-gradient(135deg,#f4d35e,#e6b325)',
  frame_sapphire: 'linear-gradient(135deg,#5b8ce6,#1f3a8a)',
  frame_emerald: 'linear-gradient(135deg,#6fbf73,#1f6b3a)',
  frame_cosmic: 'linear-gradient(135deg,#9b59e6,#e6455b,#5b8ce6)',
  frame_ruby: 'linear-gradient(135deg,#e6455b,#8a1f2d)',
  frame_obsidian: 'linear-gradient(135deg,#2d3748,#1a202c,#4a5568)',
  // Hareketli & Özel Çerçeveler (Dinamik Conic-Gradient & Glow)
  frame_cyber_pulse: 'linear-gradient(135deg,#00f0ff,#7000ff,#ff007f,#00f0ff)',
  frame_dragon_fire: 'linear-gradient(135deg,#ff2200,#ff8800,#ffee00,#ff2200)',
  frame_tengri_aura: 'linear-gradient(135deg,#fef08a,#eab308,#ca8a04,#fef08a)',
  frame_neon_matrix: 'linear-gradient(135deg,#00ff66,#003311,#00ff99,#00ff66)',
  frame_void_abyss: 'linear-gradient(135deg,#18052e,#7000ff,#d946ef,#18052e)',
  frame_frost_bite: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#0284c7,#e0f2fe)',
  frame_thunder_storm: 'linear-gradient(135deg,#fef08a,#eab308,#0ea5e9,#fef08a)',
  frame_blood_eclipse: 'linear-gradient(135deg,#450a0a,#dc2626,#991b1b,#450a0a)',
  frame_samurai_gold: 'linear-gradient(135deg,#991b1b,#eab308,#f59e0b,#991b1b)',
  frame_hologram_prism: 'linear-gradient(135deg,#ff007f,#00f0ff,#7000ff,#ffee00,#ff007f)',
  frame_emerald_serpent: 'linear-gradient(135deg,#064e3b,#10b981,#34d399,#064e3b)',
  frame_celestial_star: 'linear-gradient(135deg,#0f172a,#6366f1,#a855f7,#ffffff)',
  frame_phoenix_sun: 'linear-gradient(135deg,#f97316,#ef4444,#fde047,#ea580c)',
  frame_galaxy_rift: 'linear-gradient(135deg,#ec4899,#8b5cf6,#3b82f6,#06b6d4)',
  frame_dark_matter: 'linear-gradient(135deg,#09090b,#701a75,#4c1d95,#f43f5e)',
  frame_radioactive: 'linear-gradient(135deg,#84cc16,#eab308,#22c55e,#a3e635)',
};

// 🌟 Gerçek 360° Dönen ve Nabız Yayan Hareketli Çerçeve Motoru (Conic-Gradient + Box-Shadow Glow)
export const ANIMATED_FRAMES_INFO = {
  frame_cyber_pulse: {
    conic: 'conic-gradient(from 0deg, #00f0ff, #7000ff, #ff007f, #00f0ff)',
    glow: '0 0 16px rgba(0, 240, 255, 0.75)',
    speed: '2.5s',
    name: 'Siber Nabız',
  },
  frame_dragon_fire: {
    conic: 'conic-gradient(from 0deg, #ff0000, #ff6600, #ffea00, #ff2200, #ff0000)',
    glow: '0 0 18px rgba(255, 68, 0, 0.85)',
    speed: '2s',
    name: 'Ejderha Ateşi',
  },
  frame_tengri_aura: {
    conic: 'conic-gradient(from 0deg, #ffd700, #fff7ed, #eab308, #ca8a04, #ffd700)',
    glow: '0 0 18px rgba(250, 204, 21, 0.85)',
    speed: '3s',
    name: 'Tengri Aurası',
  },
  frame_void_abyss: {
    conic: 'conic-gradient(from 0deg, #7000ff, #d946ef, #18052e, #a855f7, #7000ff)',
    glow: '0 0 16px rgba(217, 70, 239, 0.8)',
    speed: '3s',
    name: 'Hiçlik Boşluğu',
  },
  frame_frost_bite: {
    conic: 'conic-gradient(from 0deg, #38bdf8, #ffffff, #0284c7, #e0f2fe, #38bdf8)',
    glow: '0 0 16px rgba(56, 189, 248, 0.85)',
    speed: '2.8s',
    name: 'Buzul Kristali',
  },
  frame_thunder_storm: {
    conic: 'conic-gradient(from 0deg, #facc15, #0ea5e9, #ffffff, #eab308, #facc15)',
    glow: '0 0 18px rgba(250, 204, 21, 0.85)',
    speed: '1.8s',
    name: 'Fırtına Şimşeği',
  },
  frame_blood_eclipse: {
    conic: 'conic-gradient(from 0deg, #dc2626, #450a0a, #ef4444, #991b1b, #dc2626)',
    glow: '0 0 16px rgba(220, 38, 38, 0.85)',
    speed: '2.6s',
    name: 'Kanlı Tutulma',
  },
  frame_samurai_gold: {
    conic: 'conic-gradient(from 0deg, #b91c1c, #eab308, #450a0a, #f59e0b, #b91c1c)',
    glow: '0 0 16px rgba(234, 179, 8, 0.8)',
    speed: '3s',
    name: 'Samuray Onuru',
  },
  frame_hologram_prism: {
    conic: 'conic-gradient(from 0deg, #ff007f, #00f0ff, #7000ff, #ffee00, #00ff66, #ff007f)',
    glow: '0 0 20px rgba(0, 240, 255, 0.85)',
    speed: '2.2s',
    name: 'Sonsuzluk Prizması',
  },
  frame_neon_matrix: {
    conic: 'conic-gradient(from 0deg, #22c55e, #14532d, #86efac, #15803d, #22c55e)',
    glow: '0 0 16px rgba(34, 197, 94, 0.8)',
    speed: '2s',
    name: 'Matrix Kod Akışı',
  },
  frame_emerald_serpent: {
    conic: 'conic-gradient(from 0deg, #10b981, #064e3b, #6ee7b7, #047857, #10b981)',
    glow: '0 0 16px rgba(16, 185, 129, 0.8)',
    speed: '2.8s',
    name: 'Zümrüt Ejder Pulu',
  },
  frame_celestial_star: {
    conic: 'conic-gradient(from 0deg, #ffffff, #6366f1, #c084fc, #0f172a, #ffffff)',
    glow: '0 0 18px rgba(192, 132, 252, 0.85)',
    speed: '2.4s',
    name: 'Kozmik Süpernova',
  },
  frame_phoenix_sun: {
    conic: 'conic-gradient(from 0deg, #f97316, #ef4444, #fde047, #ea580c, #f97316)',
    glow: '0 0 18px rgba(249, 115, 22, 0.85)',
    speed: '2s',
    name: 'Anka Güneşi',
  },
  frame_galaxy_rift: {
    conic: 'conic-gradient(from 0deg, #ec4899, #8b5cf6, #3b82f6, #06b6d4, #ec4899)',
    glow: '0 0 18px rgba(139, 92, 246, 0.85)',
    speed: '2.5s',
    name: 'Galaksi Yarığı',
  },
  frame_dark_matter: {
    conic: 'conic-gradient(from 0deg, #09090b, #701a75, #4c1d95, #f43f5e, #09090b)',
    glow: '0 0 16px rgba(244, 63, 94, 0.8)',
    speed: '3.2s',
    name: 'Karanlık Madde',
  },
  frame_radioactive: {
    conic: 'conic-gradient(from 0deg, #84cc16, #eab308, #22c55e, #a3e635, #84cc16)',
    glow: '0 0 18px rgba(132, 204, 22, 0.85)',
    speed: '1.8s',
    name: 'Radyoaktif Plazma',
  },
};

export function getAnimatedFrameInfo(val) {
  if (!val || typeof val !== 'string') return null;
  if (ANIMATED_FRAMES_INFO[val]) return ANIMATED_FRAMES_INFO[val];
  // ID veya gradient eşleşmesi
  for (const [key, info] of Object.entries(ANIMATED_FRAMES_INFO)) {
    if (val.includes(key)) return info;
  }
  return null;
}

export const KNOWN_BACKGROUNDS = {
  bg_aurora: 'linear-gradient(135deg,#1b1f2a,#2a1f45,#12203a)',
  bg_sunset: 'linear-gradient(135deg,#3a1f2a,#6b2d1f,#2a1210)',
  bg_forest: 'linear-gradient(135deg,#12251a,#1f3a2a,#0d1a12)',
  bg_cosmic: 'linear-gradient(135deg,#1a0d2e,#3a1055,#0d0d2e)',
  // Hareketli & Cyber Profil Arka Planları
  bg_cyber_neon: 'linear-gradient(135deg,#0a0e1a,#1a103c,#002b36,#0a0e1a)',
  bg_tengri_gold: 'linear-gradient(135deg,#1f1a0a,#3a2d0d,#5c4714,#1a1608)',
  bg_blood_moon: 'linear-gradient(135deg,#200508,#450a10,#681119,#150305)',
  bg_matrix: 'linear-gradient(135deg,#031408,#082810,#051e0c,#020d05)',
  bg_void: 'linear-gradient(135deg,#050508,#0c0818,#160b2b,#050508)',
  bg_synthwave: 'linear-gradient(135deg,#1e1035,#3b1261,#0d1527,#ff007f)',
  bg_aurora_borealis: 'linear-gradient(135deg,#042f2e,#115e59,#0f766e,#022c22)',
  bg_magma_core: 'linear-gradient(135deg,#260707,#450a0a,#7f1d1d,#180303)',
  bg_galaxy_cluster: 'linear-gradient(135deg,#090919,#1e1035,#1e1b4b,#06060c)',
  bg_zen_bamboo: 'linear-gradient(135deg,#052e16,#14532d,#064e3b,#021a0c)',
  bg_cyber_grid: 'linear-gradient(135deg,#020617,#0f172a,#0369a1,#020617)',
  bg_crimson_nebula: 'linear-gradient(135deg,#1c0609,#3b0710,#580c1b,#140305)',
};

export const KNOWN_NAME_COLORS = {
  nc_ruby: '#e6455b',
  nc_gold: '#e6b325',
  nc_azure: '#5b8ce6',
  nc_emerald: '#6fbf73',
  nc_rainbow: 'linear-gradient(90deg,#e6455b,#e68a25,#e6c825,#6fbf73,#5b8ce6,#9b59e6)',
  // Hareketli İsim Renkleri & Efektler
  nc_flame: 'linear-gradient(90deg,#ff4500,#ff8c00,#ffd700,#ff4500)',
  nc_cyber_cyan: 'linear-gradient(90deg,#00f0ff,#7000ff,#00f0ff)',
  nc_plasma: 'linear-gradient(90deg,#d946ef,#8b5cf6,#ec4899,#d946ef)',
  nc_toxic: 'linear-gradient(90deg,#10b981,#84cc16,#22c55e,#10b981)',
  nc_gold_shimmer: 'linear-gradient(90deg,#fef08a,#eab308,#ca8a04,#fef08a)',
  nc_blood_pulse: 'linear-gradient(90deg,#ef4444,#7f1d1d,#b91c1c,#ef4444)',
  nc_ice_frost: 'linear-gradient(90deg,#e0f2fe,#38bdf8,#0284c7,#e0f2fe)',
  nc_solar_flare: 'linear-gradient(90deg,#facc15,#fb923c,#f87171,#facc15)',
  nc_void_nebula: 'linear-gradient(90deg,#a855f7,#6366f1,#ec4899,#a855f7)',
  nc_matrix_green: 'linear-gradient(90deg,#22c55e,#15803d,#4ade80,#22c55e)',
  nc_cherry_blossom: 'linear-gradient(90deg,#f472b6,#ec4899,#fda4af,#f472b6)',
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
  const animInfo = getAnimatedFrameInfo(gradient);
  if (animInfo) {
    return {
      border: 'none',
      background: animInfo.conic,
      boxShadow: animInfo.glow,
      animation: `frameSpinContinuous ${animInfo.speed || '2.5s'} linear infinite`,
    };
  }
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
      backgroundSize: '200% auto',
      animation: 'nameGradientShift 3s linear infinite',
    };
  }
  return { color: v, fontWeight: 800 };
}
