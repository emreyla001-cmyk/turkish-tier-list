import { tierRank } from '../components/tiers';

/**
 * Karakter Tier'ını Modern Kart Nadirliğine (UR, SSR, SR, R) Eşler
 */
export function getCardRarity(tier) {
  const rank = tierRank(tier);

  // 1. UR (Ultra Rare / Kozmik & İlahi): Tier 0 - Tier 2
  if (rank >= 18 || ['0', '1-A', '1-B', '1-C', '2-A', '2-B', '2-C'].includes(tier)) {
    return {
      code: 'UR',
      name: 'Ultra Rare',
      subname: 'Kozmik & İlahi',
      color: '#ff007f',
      glow: '0 0 16px rgba(255, 0, 127, 0.6)',
      badgeBg: 'linear-gradient(135deg, #ff007f, #7928ca)',
      isHolo: true,
    };
  }

  // 2. SSR (Super Special Rare / Kasaba & Şehir): Tier 3 - Tier 7
  if (rank >= 10 || ['3-A', '3-B', '3-C', '4-A', '4-B', '4-C', '5-A', '5-B', '5-C', '6-A', '6-B', '6-C', '7-A'].includes(tier)) {
    return {
      code: 'SSR',
      name: 'Super Special Rare',
      subname: 'Efsanevi Güç',
      color: '#ffd700',
      glow: '0 0 14px rgba(255, 215, 0, 0.5)',
      badgeBg: 'linear-gradient(135deg, #eab308, #ca8a04)',
      isHolo: true,
    };
  }

  // 3. SR (Super Rare / Duvar & Bina): Tier 7-B - Tier 9-B
  if (rank >= 5 || ['7-B', '7-C', '8-A', '8-B', '8-C', '9-A', '9-B'].includes(tier)) {
    return {
      code: 'SR',
      name: 'Super Rare',
      subname: 'Yıkıcı Seviye',
      color: '#38bdf8',
      glow: '0 0 12px rgba(56, 189, 248, 0.4)',
      badgeBg: 'linear-gradient(135deg, #0284c7, #2563eb)',
      isHolo: false,
    };
  }

  // 4. R (Rare / Sokak & Sıradan İnsan): Tier 9-C - Tier 10-C
  return {
    code: 'R',
    name: 'Rare',
    subname: 'Sokak Seviyesi',
    color: '#94a3b8',
    glow: 'none',
    badgeBg: 'linear-gradient(135deg, #475569, #334155)',
    isHolo: false,
  };
}

/**
 * Seviye Yükseltme (Yıldız) Gereksinimleri ve Bonusları
 */
export const MAX_STARS = 5;

export function getStarInfo(stars = 1) {
  const safeStars = Math.max(1, Math.min(MAX_STARS, Number(stars) || 1));
  switch (safeStars) {
    case 1:
      return { stars: 1, multiplier: 1.0, bonusPercent: 0, nextCostShards: 1, starString: '⭐' };
    case 2:
      return { stars: 2, multiplier: 1.05, bonusPercent: 5, nextCostShards: 2, starString: '⭐⭐' };
    case 3:
      return { stars: 3, multiplier: 1.10, bonusPercent: 10, nextCostShards: 3, starString: '⭐⭐⭐' };
    case 4:
      return { stars: 4, multiplier: 1.18, bonusPercent: 18, nextCostShards: 4, starString: '⭐⭐⭐⭐' };
    case 5:
    default:
      return { stars: 5, multiplier: 1.25, bonusPercent: 25, nextCostShards: 0, starString: '🌟🌟🌟🌟🌟 (Maksimum)' };
  }
}
