import { tierRank } from '../components/tiers.js';
import { calculateSeriesSynergy } from './cardGameEngine.js';

export const BOT_TIERS = {
  CHUMP: { id: 'chump', name: 'Acemi Bot', badge: '🌱', desc: 'Rastgele ve tecrübesiz oynar.' },
  STANDARD: { id: 'standard', name: 'Standart Bot', badge: '⚔️', desc: 'Puan dengesine göre mantıklı kart sürer.' },
  VETERAN: { id: 'veteran', name: 'Kıdemli Bot', badge: '🛡️', desc: 'Kategori ve seri sinerjilerini gözetir.' },
  GRANDMASTER: { id: 'grandmaster', name: 'Büyük Usta Bot', badge: '👑', desc: 'Matematiksel optimal hamleleri hesaplar.' },
};

export function getBotTierByTrophies(trophies = 100) {
  if (trophies < 300) return BOT_TIERS.CHUMP;
  if (trophies < 800) return BOT_TIERS.STANDARD;
  if (trophies < 1500) return BOT_TIERS.VETERAN;
  return BOT_TIERS.GRANDMASTER;
}

/**
 * 4 Kademeli Kural Tabanlı Yapay Zeka Karar Mekanizması
 */
export function selectBotCard({
  botTier = BOT_TIERS.STANDARD,
  remainingHand = [],
  playerCard = null,
  playerRemainingHand = [],
  roundNumber = 0,
  playerScore = 0,
  botScore = 0,
}) {
  if (!remainingHand || remainingHand.length === 0) return null;
  if (remainingHand.length === 1) return remainingHand[0];

  // 1. KADEME: ACEMİ BOT (CHUMP)
  // Tamamen rastgele veya zayıf kart atar.
  if (botTier.id === 'chump') {
    // %40 ihtimalle elindeki en zayıf kartı atar
    if (Math.random() < 0.4) {
      return [...remainingHand].sort((a, b) => (a.power_score || 5) - (b.power_score || 5))[0];
    }
    return remainingHand[Math.floor(Math.random() * remainingHand.length)];
  }

  // 2. KADEME: STANDART BOT
  // Eğer oyuncu kartını açık sürmüşse, onu az farkla yenebilecek en ekonomik kartı seçer
  if (botTier.id === 'standard') {
    if (playerCard) {
      const playerVal = (playerCard.power_score || 5) + tierRank(playerCard.tier);
      const winningCards = remainingHand.filter((c) => {
        const myVal = (c.power_score || 5) + tierRank(c.tier);
        return myVal > playerVal;
      });

      if (winningCards.length > 0) {
        // En az farkla yenen en ekonomik kart
        return winningCards.sort((a, b) => {
          const valA = (a.power_score || 5) + tierRank(a.tier);
          const valB = (b.power_score || 5) + tierRank(b.tier);
          return valA - valB;
        })[0];
      }
    }
    // Yoksa ortalama güçlü kartı seç
    return [...remainingHand].sort((a, b) => (b.power_score || 5) - (a.power_score || 5))[Math.floor(remainingHand.length / 2)];
  }

  // 3. KADEME: KIDEMLİ BOT (VETERAN)
  // Seri ve kategori sinerjilerini gözetir, kritik raundlarda elindeki ası (en güçlü kartı) saklamayı ya da kullanmayı bilir
  if (botTier.id === 'veteran') {
    const isCriticalRound = (playerScore === 2 || botScore === 2);

    if (isCriticalRound) {
      // Kritik rauntta en güçlü kartını sahaya sür
      return [...remainingHand].sort((a, b) => {
        const valA = (a.power_score || 5) + tierRank(a.tier) * 2;
        const valB = (b.power_score || 5) + tierRank(b.tier) * 2;
        return valB - valA;
      })[0];
    }

    // Değilse serisi en çok tekrar eden (sinerji potansiyeli yüksek) kartı değerlendir
    const seriesCounts = {};
    remainingHand.forEach((c) => {
      seriesCounts[c.series] = (seriesCounts[c.series] || 0) + 1;
    });

    const sortedBySynergy = [...remainingHand].sort((a, b) => {
      const synA = (seriesCounts[a.series] || 0) * 3 + (a.power_score || 5);
      const synB = (seriesCounts[b.series] || 0) * 3 + (b.power_score || 5);
      return synB - synA;
    });

    return sortedBySynergy[0];
  }

  // 4. KADEME: BÜYÜK USTA BOT (GRANDMASTER)
  // Kusursuz oyun teorisi: Rakibin elindeki muhtemel kartları tartar.
  // Maç sayısı berabere ise (2-2) veya rakip maç sayısındaysa mutlak en güçlü kartı atar.
  // Rakip ilk turdaysa yem atar (bait), son turlarda oyuncunun en güçlü kartını boşa düşürür.
  if (botScore < playerScore && remainingHand.length <= 3) {
    // Gerideyse kaybetmemek için elindeki en yüksek skorlu kartı sahaya sürer
    return [...remainingHand].sort((a, b) => {
      const scoreA = (a.power_score || 5) * 2 + (a.durability_score || 5) + tierRank(a.tier) * 3;
      const scoreB = (b.power_score || 5) * 2 + (b.durability_score || 5) + tierRank(b.tier) * 3;
      return scoreB - scoreA;
    })[0];
  }

  if (roundNumber === 0 && Math.random() < 0.6) {
    // 1. Raund: Oyuncunun yüksek kartını çekmek için orta seviye yem kartı sür
    return [...remainingHand].sort((a, b) => (a.power_score || 5) - (b.power_score || 5))[Math.floor(remainingHand.length / 2)];
  }

  // Genel optimal seçim
  return [...remainingHand].sort((a, b) => {
    const scoreA = (a.power_score || 5) + (a.speed_score || 5) + tierRank(a.tier) * 2;
    const scoreB = (b.power_score || 5) + (b.speed_score || 5) + tierRank(b.tier) * 2;
    return scoreB - scoreA;
  })[0];
}
