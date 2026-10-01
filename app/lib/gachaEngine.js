import { getCardRarity } from './cardRarity';
import { getStarInfo } from './cardRarity';

/**
 * Türk Tier List - Hoyoverse & Blue Archive Standartlarında Gacha Kataloğu
 */
export const GACHA_PACKS = [
  {
    id: 'pack_bronze',
    name: 'Bronz Paket (Sokak Dövüşçüsü)',
    price: 1500,
    icon: '🥉',
    cardCount: 3,
    cashback: 150,
    xpReward: 100,
    badge: '🥉 Başlangıç',
    badgeColor: '#cd7f32',
    desc: '3 Karakter Kartı. Sokak ve çaylak seviyesindeki kahramanlar. (+150 TP İade)',
    ratesText: 'Kart başına — R: %74,95 · SR: %22 · SSR: %3 · UR: %0,05',
    rates: { R: 0.562125, SR: 0.165, SSR: 0.0225, UR: 0.000375 },
    guaranteedMinRarity: null,
  },
  {
    id: 'pack_silver',
    name: 'Gümüş Paket (Yeraltı Arenası)',
    price: 4000,
    icon: '🥈',
    cardCount: 4,
    cashback: 400,
    xpReward: 250,
    badge: '🛡️ 1x SR Garanti',
    badgeColor: '#94a3b8',
    desc: '4 Karakter Kartı. En az 1x SR (Elite) kart garantilidir. SSR şansa bağlıdır. (+400 TP İade)',
    ratesText: 'Temel oran — R: %64,85 · SR: %31 · SSR: %4 · UR: %0,15',
    rates: { R: 0.486375, SR: 0.2325, SSR: 0.03, UR: 0.001125 },
    guaranteedMinRarity: 'SR',
    guaranteedCount: 1,
  },
  {
    id: 'pack_gold',
    name: 'Altın Paket (Şehir Baronu & Savaş Lordu)',
    price: 9000,
    icon: '🥇',
    cardCount: 5,
    cashback: 1000,
    xpReward: 600,
    badge: '⚔️ 1x SR Garanti',
    badgeColor: '#f59e0b',
    desc: '5 Karakter Kartı. En az 1x SR (Elite) kart garantilidir. (+1.000 TP İade)',
    ratesText: 'Temel oran — R: %54,2 · SR: %38 · SSR: %7,5 · UR: %0,3',
    rates: { R: 0.542, SR: 0.38, SSR: 0.075, UR: 0.003 },
    guaranteedMinRarity: 'SR',
    guaranteedCount: 1,
  },
  {
    id: 'pack_mega',
    name: 'Platin Paket (Bozkır Alpleri)',
    price: 20000,
    icon: '💎',
    cardCount: 6,
    cashback: 2500,
    xpReward: 1500,
    badge: '💎 1x SR Garanti (Yüksek Şans)',
    badgeColor: '#00f0ff',
    desc: '6 Karakter Kartı. En az 1x SR (Elite) kart garantilidir. (+2.500 TP İade)',
    ratesText: 'Temel oran — R: %46,15 · SR: %44 · SSR: %9,5 · UR: %0,35',
    rates: { R: 0.4615, SR: 0.44, SSR: 0.095, UR: 0.0035 },
    guaranteedMinRarity: 'SR',
    guaranteedCount: 1,
  },
  {
    id: 'pack_cosmic',
    name: 'Kozmik Tengri Divanı (Kadim Mitoloji)',
    price: 45000,
    icon: '👑',
    cardCount: 7,
    cashback: 6000,
    xpReward: 3500,
    badge: '👑 2x SR Garanti (Zirve Havuz)',
    badgeColor: '#eab308',
    desc: '7 Karakter Kartı. En az 2x SR (Elite) kart garantilidir. (+6.000 TP İade)',
    ratesText: 'Temel oran — R: %40 · SR: %49 · SSR: %10,5 · UR: %0,5',
    rates: { R: 0.40, SR: 0.49, SSR: 0.105, UR: 0.005 },
    guaranteedMinRarity: 'SR',
    guaranteedCount: 2,
  },
];

export function getPackOddsText(pack) {
  const cardCount = pack.cardCount || 3;
  const ssrChance = 1 - Math.pow(1 - (pack.rates?.SSR || 0), cardCount);
  const formattedChance = (ssrChance * 100).toLocaleString('tr-TR', { maximumFractionDigits: 1 });
  return `Paket başına en az 1 SSR: yaklaşık %${formattedChance} (pity hariç)`;
}

/**
 * Hoyoverse Soft Pity & Hard Pity Dinamik Düşme Oranı Hesaplayıcı
 */
export function rollRaritySlot(packRates, forcedMinRarity = null, pityCount = 0) {
  // Hoyoverse Soft Pity: 5. paketten sonra her denemede SSR/UR şansı katlanarak artar
  let bonusSSR = 0;
  let bonusUR = 0;

  if (pityCount >= 5) {
    const extraPity = pityCount - 4;
    bonusSSR = extraPity * 0.12; // +%12 her pakette
    bonusUR = extraPity * 0.02;  // +%2 her pakette
  }

  const effectiveUR = (packRates.UR || 0.005) + bonusUR;
  const effectiveSSR = (packRates.SSR || 0.05) + bonusSSR;

  if (forcedMinRarity === 'SR') {
    const r = Math.random();
    if (r < effectiveUR) return 'UR';
    if (r < (effectiveUR + effectiveSSR)) return 'SSR';
    return 'SR';
  }

  const rand = Math.random();
  const urThreshold = effectiveUR;
  const ssrThreshold = urThreshold + effectiveSSR;
  const srThreshold = ssrThreshold + (packRates.SR || 0.3);

  if (rand < urThreshold) return 'UR';
  if (rand < ssrThreshold) return 'SSR';
  if (rand < srThreshold) return 'SR';
  return 'R';
}

export function pickCardFromRarityPool(pool) {
  if (!pool || pool.length === 0) return null;
  if (pool.length === 1) return pool[0];

  const weights = pool.map((c) => {
    const p = Math.max(20, Number(c.power_score) || 50);
    return 100 / Math.sqrt(p);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let randomVal = Math.random() * totalWeight;

  for (let i = 0; i < pool.length; i++) {
    if (randomVal <= weights[i]) {
      return pool[i];
    }
    randomVal -= weights[i];
  }

  return pool[pool.length - 1];
}

/**
 * Paketten kart çekme ana motoru (Hoyoverse Pity + Blue Archive Shards)
 */
export function drawCardsFromPack(pack, allCharacters, pityCount = 0, currentUpgrades = {}, myCards = []) {
  if (!allCharacters || allCharacters.length === 0) {
    return { drawnCards: [], nextPity: pityCount, refundTotal: 0, cashback: 0 };
  }

  const grouped = { UR: [], SSR: [], SR: [], R: [] };
  allCharacters.forEach((c) => {
    const rarity = getCardRarity(c.tier).code;
    if (grouped[rarity]) {
      grouped[rarity].push(c);
    } else {
      grouped.R.push(c);
    }
  });

  ['UR', 'SSR', 'SR', 'R'].forEach((key) => {
    if (grouped[key].length === 0) {
      grouped[key] = allCharacters;
    }
  });

  const cardCount = pack.cardCount || 3;
  const isHardPityActive = pityCount >= 9;
  const drawn = [];

  const guaranteedMin = pack.guaranteedMinRarity || null;
  const guaranteedSlots = pack.guaranteedCount || (guaranteedMin ? 1 : 0);

  for (let slot = 0; slot < cardCount; slot++) {
    let targetRarity;

    // Hard Pity Eşiği (9. paketten sonra kesin SSR/UR garantisi)
    if (slot === cardCount - 1 && isHardPityActive) {
      targetRarity = 'SSR';
    } else if (slot < guaranteedSlots) {
      targetRarity = rollRaritySlot(pack.rates, guaranteedMin, pityCount);
    } else {
      targetRarity = rollRaritySlot(pack.rates, null, pityCount);
    }

    const pool = grouped[targetRarity] || allCharacters;
    const picked = pickCardFromRarityPool(pool) || pool[0];
    drawn.push(picked);
  }

  const hasHighRarity = drawn.some((c) => {
    const r = getCardRarity(c.tier).code;
    return r === 'UR' || r === 'SSR';
  });
  const nextPity = hasHighRarity ? 0 : Math.min(10, pityCount + 1);

  let refundTotal = 0;
  const updatedUpgrades = { ...currentUpgrades };

  const processedCards = drawn.map((card) => {
    const isDuplicate = myCards.includes(card.id);
    const cur = updatedUpgrades[card.id] || { stars: 1, awakened: 0, shards: 0 };
    let stars = cur.stars || 1;
    let awakened = cur.awakened || 0;
    let shards = cur.shards || 0;

    const sInfo = getStarInfo(stars, awakened);

    if (isDuplicate) {
      if (sInfo.isMax) {
        refundTotal += 1000;
      } else {
        shards += 1;
      }
    }

    updatedUpgrades[card.id] = { stars, awakened, shards };

    return {
      ...card,
      isDuplicate,
      stars,
      awakened,
      shards,
      refundGiven: isDuplicate && sInfo.isMax,
    };
  });

  return {
    drawnCards: processedCards,
    nextPity,
    refundTotal,
    cashback: pack.cashback || 0,
    xpReward: pack.xpReward || 0,
    updatedUpgrades,
  };
}
