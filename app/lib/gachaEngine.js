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
    cashback: 200,
    xpReward: 150,
    badge: '🥉 Başlangıç Paketi',
    badgeColor: '#cd7f32',
    desc: '3 Karakter Kartı içerir. Sokak ve çaylak seviyesindeki savaşçılar ile destene temel at. (+200 TP İade)',
    ratesText: 'R: %75 · SR: %20 · SSR: %4 · UR: %1',
    rates: { R: 0.75, SR: 0.20, SSR: 0.04, UR: 0.01 },
    guaranteedMinRarity: null,
  },
  {
    id: 'pack_silver',
    name: 'Gümüş Paket (Yeraltı Hükümdarı)',
    price: 4000,
    icon: '🥈',
    cardCount: 4,
    cashback: 600,
    xpReward: 400,
    badge: '🛡️ 1x SR Garanti',
    badgeColor: '#94a3b8',
    desc: '4 Karakter Kartı içerir. Bina ve mahalle yıkan kudretli dövüşçüler (En az 1x SR Garanti + 600 TP İade).',
    ratesText: 'R: %55 · SR: %32 · SSR: %10 · UR: %3',
    rates: { R: 0.55, SR: 0.32, SSR: 0.10, UR: 0.03 },
    guaranteedMinRarity: 'SR',
    guaranteedCount: 1,
  },
  {
    id: 'pack_gold',
    name: 'Altın Paket (Şehir & Savaş Baronu)',
    price: 9500,
    icon: '🥇',
    cardCount: 5,
    cashback: 1500,
    xpReward: 900,
    badge: '⚔️ Yüksek SSR İhtimali',
    badgeColor: '#f59e0b',
    desc: '5 Karakter Kartı içerir. Şehir ve ordu ölçeğinde efsaneleşmiş savaşçılar (1x SR+ Garanti + 1.500 TP İade).',
    ratesText: 'R: %35 · SR: %45 · SSR: %15 · UR: %5',
    rates: { R: 0.35, SR: 0.45, SSR: 0.15, UR: 0.05 },
    guaranteedMinRarity: 'SR',
    guaranteedCount: 1,
  },
  {
    id: 'pack_mega',
    name: 'Platin & Efsanevi Bozkır Paketi (Alpler)',
    price: 22000,
    icon: '💎',
    cardCount: 6,
    cashback: 3500,
    xpReward: 2000,
    badge: '💎 1x SSR Garanti!',
    badgeColor: '#00f0ff',
    desc: '6 Karakter Kartı içerir. Kıta ve gezegen seviyesinde devasa Türk kurgu kahramanları (1x Kesin SSR + 3.500 TP İade).',
    ratesText: 'R: %20 · SR: %40 · SSR: %30 · UR: %10',
    rates: { R: 0.20, SR: 0.40, SSR: 0.30, UR: 0.10 },
    guaranteedMinRarity: 'SSR',
    guaranteedCount: 1,
  },
  {
    id: 'pack_cosmic',
    name: 'Kozmik & İlahi Tanrılar Paketi (Tengri Divanı)',
    price: 48000,
    icon: '👑',
    cardCount: 7,
    cashback: 8500,
    xpReward: 4500,
    badge: '👑 2x SSR/UR Garanti!',
    badgeColor: '#eab308',
    desc: '7 Karakter Kartı içerir. Evren, boyut ve kozmik gerçeklik büken kadim tanrılar (2x SSR veya UR Garanti + 8.500 TP İade).',
    ratesText: 'R: %5 · SR: %30 · SSR: %45 · UR: %20',
    rates: { R: 0.05, SR: 0.30, SSR: 0.45, UR: 0.20 },
    guaranteedMinRarity: 'SSR',
    guaranteedCount: 2,
  },
  {
    id: 'pack_chaos_throne',
    name: 'Mitik Kaos Tahtı Paketi (Mutlak Hükümdarlar)',
    price: 85000,
    icon: '🌌',
    cardCount: 8,
    cashback: 18000,
    xpReward: 8000,
    badge: '🔥 1x UR + 2x SSR Garanti!',
    badgeColor: '#ff007f',
    desc: '8 Karakter Kartı içerir. Sıradan (R) kartlar elenmiştir! (1x Kesin UR + 2x SSR Garanti + 18.000 TP İade).',
    ratesText: 'R: %0 · SR: %20 · SSR: %50 · UR: %30',
    rates: { R: 0.00, SR: 0.20, SSR: 0.50, UR: 0.30 },
    guaranteedMinRarity: 'SSR',
    guaranteedCount: 3,
    guaranteedURCount: 1,
  },
];

/**
 * Ağırlıklı Rastgele Kart Çekilişi (Weighted Gacha Algorithm)
 * Güç seviyesi ve Tier arttıkça çıkma ihtimali orantılı olarak düşer!
 */
export function rollRaritySlot(packRates, forcedMinRarity = null) {
  if (forcedMinRarity === 'UR') return 'UR';
  if (forcedMinRarity === 'SSR') {
    // SSR veya UR çıkabilir (örn. %80 SSR, %20 UR)
    return Math.random() < 0.20 ? 'UR' : 'SSR';
  }
  if (forcedMinRarity === 'SR') {
    const r = Math.random();
    if (r < 0.05) return 'UR';
    if (r < 0.25) return 'SSR';
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

  // Garantili slot sayısı ve tipi
  const guaranteedMin = pack.guaranteedMinRarity || null;
  const guaranteedSlots = pack.guaranteedCount || (guaranteedMin ? 1 : 0);
  const guaranteedUR = pack.guaranteedURCount || 0;

  for (let slot = 0; slot < cardCount; slot++) {
    let targetRarity;

    // 1. Son slotta Pity aktifse %100 SSR veya UR garanti!
    if (slot === cardCount - 1 && isPityActive) {
      targetRarity = Math.random() < 0.25 ? 'UR' : 'SSR';
    }
    // 2. Özel Kesin UR slotu (Örn: Kaos Tahtı'nda kesin 1 UR)
    else if (slot < guaranteedUR) {
      targetRarity = 'UR';
    }
    // 3. Paketin kendi garantili slotları (Örn: Mega Paket'te en az 1 SSR, Kozmik'te 2 SSR/UR)
    else if (slot < guaranteedSlots) {
      targetRarity = rollRaritySlot(pack.rates, guaranteedMin);
    }
    // 4. Normal rastgele gacha slotu (güç seviyesi arttıkça çıkma oranı düşen formül)
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
