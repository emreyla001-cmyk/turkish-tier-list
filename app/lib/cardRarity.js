import { tierRank } from '../components/tiers.js';

/**
 * Tier Normalizasyonu (Kısaltmaları tam isimlere eşler)
 */
export function normalizeTier(tier) {
  if (!tier) return '';
  const clean = String(tier).trim();
  const up = clean.toUpperCase();
  if (up === 'L2C' || up === 'LOW 2C') return 'Low 2-C';
  if (up === 'H3A' || up === 'HIGH 3A') return 'High 3-A';
  if (up === 'H7A' || up === 'HIGH 7A') return 'High 7-A';
  if (up === 'H8C' || up === 'HIGH 8C') return 'High 8-C';
  if (up === 'H6C' || up === 'HIGH 6C') return 'High 6-C';
  return clean;
}

/**
 * Karakter Tier'ını Kullanıcının Belirlediği Güç Aralıklarına Göre UR, SSR, SR, R Olarak Eşler:
 * 1. 0 - Low 2-C arası: UR (Ultra Rare)
 * 2. High 3-A - 6-C arası: SSR (Super Special Rare)
 * 3. High 7-A - 8-C arası: SR (Super Rare)
 * 4. Geri kalanda (9-A ve altı): R (Rare)
 */
export function getCardRarity(tier) {
  const norm = normalizeTier(tier);
  const rank = tierRank(norm);

  // 1. 0 - Low 2-C arası: UR (Rank 41 - 53)
  const isExplicitUR = [
    '0', '1-A', 'High 1-A', 'Low 1-A', '1-B', 'High 1-B', '1-C', 'High 1-C', 'Low 1-C',
    '2-A', '2-B', '2-C', 'Low 2-C', 'L2C'
  ].includes(norm) || norm === '0' || norm.startsWith('1-') || norm.startsWith('2-');

  if (rank >= 41 || isExplicitUR) {
    return {
      code: 'UR',
      name: 'Ultra Rare',
      subname: 'Kozmik & İlahi Seviye',
      color: '#ff007f',
      glow: '0 0 18px rgba(255, 0, 127, 0.7)',
      badgeBg: 'linear-gradient(135deg, #ff007f, #7928ca)',
      isHolo: true,
      cardBorder: '2px solid #ff007f',
    };
  }

  // 2. High 3-A - 6-C arası: SSR (Rank 20 - 40)
  const isExplicitSSR = [
    'High 3-A', 'H3A', '3-A', '3-B', '3-C',
    '4-A', '4-B', 'High 4-C', '4-C', 'Low 4-C',
    'High 5-A', '5-A', '5-B', 'Low 5-B', '5-C',
    'High 6-A', '6-A', 'High 6-B', '6-B', 'Low 6-B', 'High 6-C', '6-C'
  ].includes(norm) || norm.startsWith('3-') || norm.startsWith('4-') || norm.startsWith('5-') || norm.startsWith('6-');

  if ((rank >= 20 && rank <= 40) || isExplicitSSR) {
    return {
      code: 'SSR',
      name: 'Super Special Rare',
      subname: 'Efsanevi & Gezegensel Güç',
      color: '#ffd700',
      glow: '0 0 16px rgba(255, 215, 0, 0.6)',
      badgeBg: 'linear-gradient(135deg, #eab308, #ca8a04)',
      isHolo: true,
      cardBorder: '2px solid #eab308',
    };
  }

  // 3. High 7-A - 8-C arası: SR (Rank 9 - 19)
  const isExplicitSR = [
    'High 7-A', 'H7A', '7-A', '7-B', 'Low 7-B', 'High 7-C', '7-C', 'Low 7-C',
    '8-A', '8-B', 'High 8-C', '8-C', 'H8C'
  ].includes(norm) || norm.startsWith('7-') || norm.startsWith('8-');

  if ((rank >= 9 && rank <= 19) || isExplicitSR) {
    return {
      code: 'SR',
      name: 'Super Rare',
      subname: 'Şehir & Bina Yıkıcı Seviye',
      color: '#38bdf8',
      glow: '0 0 12px rgba(56, 189, 248, 0.5)',
      badgeBg: 'linear-gradient(135deg, #0284c7, #2563eb)',
      isHolo: false,
      cardBorder: '1px solid #38bdf8',
    };
  }

  // 4. Geri kalanda (9-A, 9-B, 9-C, 10-A, 10-B, 10-C vb.): R (Rare)
  return {
    code: 'R',
    name: 'Rare',
    subname: 'Sokak & İnsan Seviyesi',
    color: '#94a3b8',
    glow: 'none',
    badgeBg: 'linear-gradient(135deg, #475569, #334155)',
    isHolo: false,
    cardBorder: '1px solid #475569',
  };
}

/**
 * YILDIZ & UYANIŞ (AWAKENING) SİSTEMİ
 * 1. Her sarı yıldız atlama için: 2 kopya kart
 * 2. 5 Sarı Yıldızdan 1. Uyanmış seviyesine geçmek için: 4 kopya kart
 * 3. Toplam 5 Uyanış seviyesine kadar yükselir (U1..U5)
 * 4. 5. Uyanışta '👑 MAKSİMUM SEVİYE' simgesi kazanır!
 */
export const MAX_STARS = 5;
export const MAX_AWAKENED = 5;

export function getStarInfo(starsOrObj = 1, maybeAwakened = 0) {
  let stars = 1;
  let awakened = 0;

  if (typeof starsOrObj === 'object' && starsOrObj !== null) {
    stars = Number(starsOrObj.stars) || 1;
    awakened = Number(starsOrObj.awakened) || 0;
  } else {
    stars = Number(starsOrObj) || 1;
    awakened = Number(maybeAwakened) || 0;
  }

  stars = Math.max(1, Math.min(MAX_STARS, stars));
  awakened = Math.max(0, Math.min(MAX_AWAKENED, awakened));

  const isMax = (stars === MAX_STARS && awakened === MAX_AWAKENED);

  // UYANIŞ AŞAMASI (awakened >= 1)
  if (awakened > 0) {
    // U1: +%26, U2: +%34, U3: +%42, U4: +%50, U5 (MAX): +%60
    const multiplier = 1.18 + (awakened * 0.08) + (isMax ? 0.02 : 0);
    const bonusPercent = Math.round((multiplier - 1.0) * 100);
    const nextCostShards = isMax ? 0 : 4; // Her uyanış seviyesi için 4 kopya kart

    const redStars = '🔴'.repeat(awakened);
    const starString = isMax ? '👑 5. Uyanış (MAKSİMUM SEVİYE)' : `${redStars} ${awakened}. Uyanış`;

    return {
      stars: 5,
      awakened,
      isAwakened: true,
      isMax,
      multiplier,
      bonusPercent,
      nextCostShards,
      starString,
      stageLabel: isMax ? '👑 MAKSİMUM SEVİYE' : `🔴 ${awakened}. Uyanış`,
    };
  }

  // SARI YILDIZ AŞAMASI (1..5)
  // Yıldız atlamak için her seferinde 2 kopya kart gerekir
  const multiplier = 1.0 + ((stars - 1) * 0.04); // 1: %0, 2: %4, 3: %8, 4: %12, 5: %16
  const bonusPercent = Math.round((multiplier - 1.0) * 100);
  const nextCostShards = stars === 5 ? 4 : 2; // 5'ten Uyanışa geçmek için 4 kart!

  const yellowStars = '⭐'.repeat(stars);
  const starString = stars === 5 ? '⭐⭐⭐⭐⭐ (Uyanışa Hazır)' : yellowStars;

  return {
    stars,
    awakened: 0,
    isAwakened: false,
    isMax: false,
    multiplier,
    bonusPercent,
    nextCostShards,
    starString,
    stageLabel: `${stars} Yıldız`,
  };
}
