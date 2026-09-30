import { getCardRarity } from './cardRarity';
import { getStarInfo } from './cardRarity';

/**
 * Türk Tier List - Yüksek Heyecanlı Gacha & Paket Kataloğu
 * Her paketin kart sayısı, fiyatı, düşme oranları ve garantili hediyeleri belirlenmiştir.
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
    ratesText: 'R: %75 · SR: %22 · SSR: %2.9 · UR: %0.1',
    rates: { R: 0.75, SR: 0.22, SSR: 0.029, UR: 0.001 },
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
    ratesText: 'R: %65 · SR: %31 · SSR: %3.8 · UR: %0.2',
    rates: { R: 0.65, SR: 0.31, SSR: 0.038, UR: 0.002 },
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
    desc: '5 Karakter Kartı. 1x SR garantilidir. 2-3 pakette ortalama 1 SSR şansı yakalanır. (+1.000 TP İade)',
    ratesText: 'R: %56 · SR: %38 · SSR: %5.5 · UR: %0.5',
    rates: { R: 0.56, SR: 0.38, SSR: 0.055, UR: 0.005 },
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
    desc: '6 Karakter Kartı. 1x SR garantilidir. %7.2 SSR şansıyla ortalama 2 pakette 1 SSR kovalanır. (+2.500 TP İade)',
    ratesText: 'R: %48 · SR: %44 · SSR: %7.2 · UR: %0.8',
    rates: { R: 0.48, SR: 0.44, SSR: 0.072, UR: 0.008 },
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
    desc: '7 Karakter Kartı. 2x SR garantilidir. Zirve SSR (%9.5) ve UR (%1.5) ihtimaline sahip ilahi paket. (+6.000 TP İade)',
    ratesText: 'R: %40 · SR: %49 · SSR: %9.5 · UR: %1.5',
    rates: { R: 0.40, SR: 0.49, SSR: 0.095, UR: 0.015 },
    guaranteedMinRarity: 'SR',
    guaranteedCount: 2,
  },
];

/**
 * Ağırlıklı Rastgele Kart Çekilişi (MLA / AFK Arena Tarzı Gacha)
 * - UR çok nadir ve kıymetlidir (asla doğrudan paketle garantilenmez).
 * - SSR şansa bağlı olarak ortalama 2-3 pakette bir denk gelir.
 * - SR kartlar takım omurgası ve parça (shard) kaynağıdır.
 */
export function rollRaritySlot(packRates, forcedMinRarity = null) {
  if (forcedMinRarity === 'SR') {
    // 1x SR garantisi: en az SR verir, ama eğer şanslıysa pack'in SSR/UR oranıyla SSR veya UR'a yükselebilir!
    const r = Math.random();
    if (r < (packRates.UR || 0.005)) return 'UR';
    if (r < ((packRates.UR || 0.005) + (packRates.SSR || 0.05))) return 'SSR';
    return 'SR';
  }

  const rand = Math.random();
  const urThreshold = packRates.UR;
  const ssrThreshold = urThreshold + packRates.SSR;
  const srThreshold = ssrThreshold + packRates.SR;

  if (rand < urThreshold) return 'UR';
  if (rand < ssrThreshold) return 'SSR';
  if (rand < srThreshold) return 'SR';
  return 'R';
}

/**
 * Verilen nadirlik sınıfına (R, SR, SSR, UR) ait havuzdan güç puanına göre ağırlıklı seçim yapar.
 * Aynı nadirlik içinde bile power_score çok yüksek olan tanrısal kartlar daha nadir gelir.
 */
export function pickCardFromRarityPool(pool) {
  if (!pool || pool.length === 0) return null;
  if (pool.length === 1) return pool[0];

  // Ağırlık hesaplama: power_score'un kareköküne ters orantı (güç çok yüksekse biraz daha nadir)
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
 * Paketten kart çekme ana motoru
 */
export function drawCardsFromPack(pack, allCharacters, pityCount = 0, currentUpgrades = {}, myCards = []) {
  if (!allCharacters || allCharacters.length === 0) {
    return { drawnCards: [], nextPity: pityCount, refundTotal: 0, cashback: 0 };
  }

  // Karakterleri nadirliklerine göre grupla
  const grouped = { UR: [], SSR: [], SR: [], R: [] };
  allCharacters.forEach((c) => {
    const rarity = getCardRarity(c.tier).code;
    if (grouped[rarity]) {
      grouped[rarity].push(c);
    } else {
      grouped.R.push(c);
    }
  });

  // Eğer havuzda boşluk varsa yedek olarak tüm karakterleri doldur
  ['UR', 'SSR', 'SR', 'R'].forEach((key) => {
    if (grouped[key].length === 0) {
      grouped[key] = allCharacters;
    }
  });

  const cardCount = pack.cardCount || 3;
  const isPityActive = pityCount >= 9;
  const drawn = [];

  // Garantili slot sayısı ve tipi (Yalnızca SR taban garantisi, SSR/UR kesinlikle şansa bağlı!)
  const guaranteedMin = pack.guaranteedMinRarity || null;
  const guaranteedSlots = pack.guaranteedCount || (guaranteedMin ? 1 : 0);

  for (let slot = 0; slot < cardCount; slot++) {
    let targetRarity;

    // 1. Son slotta Pity aktifse (10 paket boyunca hiç SSR çıkmadıysa) 1 SSR garanti!
    if (slot === cardCount - 1 && isPityActive) {
      targetRarity = Math.random() < 0.02 ? 'UR' : 'SSR';
    }
    // 2. Paketin garantili SR slotları (Örn: Gümüş'te 1 SR, Tengri'de 2 SR)
    else if (slot < guaranteedSlots) {
      targetRarity = rollRaritySlot(pack.rates, guaranteedMin);
    }
    // 3. Normal rastgele gacha slotu (MLA drop oranları)
    else {
      targetRarity = rollRaritySlot(pack.rates);
    }

    const pool = grouped[targetRarity] || allCharacters;
    const picked = pickCardFromRarityPool(pool) || pool[0];
    drawn.push(picked);
  }

  // Pity sayacı hesabı: Eğer UR veya SSR çıktıysa pity sıfırlanır, çıkmadıysa +1 artar
  const hasHighRarity = drawn.some((c) => {
    const r = getCardRarity(c.tier).code;
    return r === 'UR' || r === 'SSR';
  });
  const nextPity = hasHighRarity ? 0 : Math.min(10, pityCount + 1);

  // Kopya kart, yükseltme ve iade hesabı
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
        refundTotal += 1000; // Maksimum Seviyedeyse 1.000 Tier Parası devasa nakit iade!
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
