import { tierRank } from '../components/tiers';

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

export function simulateCardClash(playerCard, opponentCard) {
  if (!playerCard || !opponentCard) {
    return { winner: 'player', narrative: 'Rakip kart çekemedi!', statHighlight: 'Hükmen' };
  }

  const r1 = tierRank(playerCard.tier);
  const r2 = tierRank(opponentCard.tier);

  // 1. Tier Karşılaştırması (En belirleyici faktör)
  if (Math.abs(r1 - r2) >= 2) {
    if (r1 > r2) {
      return {
        winner: 'player',
        narrative: `${playerCard.name}, ${playerCard.tier} seviyesindeki ezici evren kademesiyle ${opponentCard.name} (${opponentCard.tier}) karşısında tartışmasız bir zafer elde etti!`,
        statHighlight: `Tier Üstünlüğü: ${playerCard.tier} vs ${opponentCard.tier}`,
      };
    } else {
      return {
        winner: 'opponent',
        narrative: `${opponentCard.name}, ${opponentCard.tier} kademesindeki üstün gücüyle ${playerCard.name} (${playerCard.tier}) kartını tek hamlede alt etti!`,
        statHighlight: `Tier Üstünlüğü: ${opponentCard.tier} vs ${playerCard.tier}`,
      };
    }
  }

  // 2. Tier'lar çok yakınsa Detaylı Stat Kıyaslaması (Güç, Hız, Zeka, Dayanıklılık)
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

  const pTotal = pStats.power * 1.2 + pStats.speed * 1.1 + pStats.intelligence * 1.0 + pStats.durability * 0.9 + (r1 * 15);
  const oTotal = oStats.power * 1.2 + oStats.speed * 1.1 + oStats.intelligence * 1.0 + oStats.durability * 0.9 + (r2 * 15);

  const isPlayerWinner = pTotal >= oTotal;
  const winnerCard = isPlayerWinner ? playerCard : opponentCard;
  const loserCard = isPlayerWinner ? opponentCard : playerCard;
  const winStats = isPlayerWinner ? pStats : oStats;
  const loseStats = isPlayerWinner ? oStats : pStats;

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

  const narrative = narratives[Math.floor(Math.random() * narratives.length)];

  return {
    winner: isPlayerWinner ? 'player' : 'opponent',
    narrative,
    statHighlight: `${dominantStat} Farkı (${isPlayerWinner ? 'Oyuncu Zaferi' : 'Rakip Zaferi'})`,
  };
}
