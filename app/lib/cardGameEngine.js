import { tierRank } from '../components/tiers';
import { getStarInfo } from './cardRarity';

export function calculateTrophyChange(playerTrophies = 0, opponentTrophies = 0, isWinner = true) {
  const trophyDiff = opponentTrophies - playerTrophies;
  // Temel kupa değişimi: 20
  // Eğer rakip senden çok yüksek kupalıysa kazanmak +30 verir
  // Eğer rakip senden düşük kupalıysa kazanmak +15 verir
  const delta = Math.round(trophyDiff / 40);
  if (isWinner) {
    return Math.min(30, Math.max(15, 20 + delta));
  } else {
    // Kaybedildiğinde: -15 ile -30 arası
    const loss = Math.min(30, Math.max(15, 20 - delta));
    return -loss;
  }
}

export function getLeagueForTrophies(trophies = 0, leagues = []) {
  if (!leagues || leagues.length === 0) {
    return { name: 'Sokak Dövüşçüsü', icon: '🥉', color: '#cd7f32' };
  }
  const match = leagues.find((l) => trophies >= l.minTrophies && trophies <= l.maxTrophies);
  return match || leagues[0];
}

export function calculateSeriesSynergy(card, deck = []) {
  if (!card || !card.series || !deck || deck.length === 0) return { hasSynergy: false, multiplier: 1.0 };
  const matches = deck.filter(
    (c) => c && c.id !== card.id && c.series && c.series.toLowerCase().trim() === card.series.toLowerCase().trim()
  );
  if (matches.length >= 1) {
    return { hasSynergy: true, multiplier: 1.15, series: card.series, matchesCount: matches.length + 1 };
  }
  return { hasSynergy: false, multiplier: 1.0 };
}

export function simulateCardClash(playerCard, opponentCard, playerDeck = [], opponentDeck = [], playerUpgrades = {}, opponentUpgrades = {}) {
  if (!playerCard || !opponentCard) {
    return { winner: 'player', narrative: 'Rakip kart çekemedi!', statHighlight: 'Hükmen', isSuperImpact: false };
  }

  const r1 = tierRank(playerCard.tier);
  const r2 = tierRank(opponentCard.tier);

  const pSynergy = calculateSeriesSynergy(playerCard, playerDeck);
  const oSynergy = calculateSeriesSynergy(opponentCard, opponentDeck);

  const pStarInfo = getStarInfo(playerUpgrades?.[playerCard.id] || 1);
  const oStarInfo = getStarInfo(opponentUpgrades?.[opponentCard.id] || 1);

  // 1. Tier Karşılaştırması (En belirleyici faktör)
  if (Math.abs(r1 - r2) >= 2) {
    const isSuperImpact = true;
    if (r1 > r2) {
      return {
        winner: 'player',
        narrative: `${playerCard.name}, ${playerCard.tier} seviyesindeki ezici evren kademesiyle ${opponentCard.name} (${opponentCard.tier}) karşısında sarsıcı bir zafer elde etti!`,
        statHighlight: `Tier Eziciliği: ${playerCard.tier} vs ${opponentCard.tier}`,
        isSuperImpact,
        pSynergy,
        oSynergy,
        pStarInfo,
        oStarInfo,
      };
    } else {
      return {
        winner: 'opponent',
        narrative: `${opponentCard.name}, ${opponentCard.tier} kademesindeki üstün gücüyle ${playerCard.name} (${playerCard.tier}) kartını tek hamlede alt etti!`,
        statHighlight: `Tier Eziciliği: ${opponentCard.tier} vs ${playerCard.tier}`,
        isSuperImpact,
        pSynergy,
        oSynergy,
        pStarInfo,
        oStarInfo,
      };
    }
  }

  // 2. Tier'lar çok yakınsa Detaylı Stat Kıyaslaması (Güç, Hız, Zeka, Dayanıklılık) + Sinerji + Yıldız Takviyesi
  const pStats = {
    power: Number(playerCard.power_score) || 50,
    speed: Number(playerCard.speed_score) || 50,
    intelligence: Number(playerCard.intelligence_score) || 50,
    durability: Number(playerCard.durability_score) || 50,
  };

  const oStats = {
    power: Number(opponentCard.power_score) || 50,
    speed: Number(opponentCard.speed_score) || 50,
    intelligence: Number(opponentCard.intelligence_score) || 50,
    durability: Number(opponentCard.durability_score) || 50,
  };

  let pTotal = (pStats.power * 1.2 + pStats.speed * 1.1 + pStats.intelligence * 1.0 + pStats.durability * 0.9 + (r1 * 15)) * pSynergy.multiplier * pStarInfo.multiplier;
  let oTotal = (oStats.power * 1.2 + oStats.speed * 1.1 + oStats.intelligence * 1.0 + oStats.durability * 0.9 + (r2 * 15)) * oSynergy.multiplier * oStarInfo.multiplier;

  const isPlayerWinner = pTotal >= oTotal;
  const isSuperImpact = Math.abs(pTotal - oTotal) > 60;
  const winnerCard = isPlayerWinner ? playerCard : opponentCard;
  const loserCard = isPlayerWinner ? opponentCard : playerCard;
  const winStats = isPlayerWinner ? pStats : oStats;
  const loseStats = isPlayerWinner ? oStats : pStats;
  const winSynergy = isPlayerWinner ? pSynergy : oSynergy;
  const winStarInfo = isPlayerWinner ? pStarInfo : oStarInfo;

  // Hangi stat en çok fark yarattı?
  let dominantStat = 'Güç';
  let diff = winStats.power - loseStats.power;

  if ((winStats.speed - loseStats.speed) > diff) {
    dominantStat = 'Çeviklik ve Hız';
    diff = winStats.speed - loseStats.speed;
  }
  if ((winStats.intelligence - loseStats.intelligence) > diff) {
    dominantStat = 'Stratejik Zeka ve Taktik';
    diff = winStats.intelligence - loseStats.intelligence;
  }
  if ((winStats.durability - loseStats.durability) > diff) {
    dominantStat = 'Dayanıklılık ve Zırh';
  }

  const narratives = [
    `${winnerCard.name}, ${dominantStat.toLowerCase()} avantajını kullanarak ${loserCard.name} karşısında nefes kesen düelloyu kazandı!`,
    `Hakem Analizi: ${winnerCard.name}, kritik anlarda sergilediği ${dominantStat.toLowerCase()} ile ${loserCard.name}'e üstünlük kurdu.`,
    `${winnerCard.name}, ${loserCard.name}'in hamlelerini önceden okuyarak ${dominantStat.toLowerCase()} farkıyla raundu hanesine yazdırdı!`,
  ];

  if (winStarInfo?.isMax) {
    narratives.push(
      `${winnerCard.name}, 👑 MAKSİMUM SEVİYE UYANIŞ (+%${winStarInfo.bonusPercent}) efsanevi aurasıyla ${loserCard.name}'e nefes aldırmadı!`
    );
  } else if (winStarInfo?.isAwakened) {
    narratives.push(
      `${winnerCard.name}, ${winStarInfo.awakened}. Uyanış seviye gücü (+%${winStarInfo.bonusPercent}) sayesinde ${loserCard.name} karşısında mutlak üstünlük sağladı!`
    );
  } else if (winStarInfo?.stars > 1) {
    narratives.push(
      `${winnerCard.name}, ${winStarInfo.stars} Yıldızlı seviye takviyesi (+%${winStarInfo.bonusPercent}) sayesinde kritik anda ${loserCard.name}'i devirdi!`
    );
  }

  if (winSynergy.hasSynergy) {
    narratives.push(
      `${winnerCard.name}, "${winSynergy.series}" evren sinerjisi (+%15 Güç Bonusu) sayesinde ${loserCard.name}'i dize getirdi!`
    );
  }

  const narrative = narratives[Math.floor(Math.random() * narratives.length)];

  return {
    winner: isPlayerWinner ? 'player' : 'opponent',
    narrative,
    statHighlight: `${dominantStat} Farkı (${isPlayerWinner ? 'Oyuncu Zaferi' : 'Rakip Zaferi'})`,
    isSuperImpact,
    pSynergy,
    oSynergy,
  };
}
