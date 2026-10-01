import { NextResponse } from 'next/server';

function evaluateHaxAndSpiritualBonus(char) {
  const cat = (char.category || '').toLowerCase();
  const desc = (char.description || '').toLowerCase();
  const series = (char.series || '').toLowerCase();

  let haxScore = 0;
  const haxTypes = [];

  // Ruhsal / Mistik / Zihinsel Yetenek Tespiti
  if (cat.includes('kozmik') || desc.includes('kozmik') || series.includes('kozmik')) {
    haxScore += 35;
    haxTypes.push('Kozmik Boyut & Gerçeklik Bükme');
  }
  if (cat.includes('mitoloji') || desc.includes('tanrı') || desc.includes('efsane') || cat.includes('mitik')) {
    haxScore += 30;
    haxTypes.push('Mitolojik İlahi Varlık & Ölümcül Kıyamet Gücü');
  }
  if (cat.includes('büyü') || cat.includes('mistik') || desc.includes('büyü') || desc.includes('tılsım')) {
    haxScore += 25;
    haxTypes.push('Mistik / Sihirsel Hasar (Fiziksel Zırhı Delip Geçer)');
  }
  if (desc.includes('ruh') || desc.includes('zihin') || desc.includes('illüzyon') || desc.includes('hipnoz')) {
    haxScore += 25;
    haxTypes.push('Ruhsal / Zihinsel Manipülasyon (Beden Savunmasını Yıkar)');
  }
  if (desc.includes('ölümsüz') || desc.includes('rejenere') || desc.includes('diriliş')) {
    haxScore += 20;
    haxTypes.push('Ölümsüzlük & Rejenerasyon Hax');
  }
  if (desc.includes('taktik') || desc.includes('dahi') || desc.includes('strateji')) {
    haxScore += 15;
    haxTypes.push('Stratejik Dahi / Zihinsel Hazırlık Üstünlüğü');
  }

  return { haxScore, haxTypes };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { c1, c2 } = body;

    if (!c1 || !c2) {
      return NextResponse.json({ error: 'İki dövüşçü karakter de gereklidir.' }, { status: 400 });
    }

    const t1 = c1.tier || 'B-Tier';
    const t2 = c2.tier || 'B-Tier';

    const tierMap = {
      'Tier 0': 120,
      'High 1-A': 115,
      '1-A': 110,
      'S-Tier': 100,
      'A-Tier': 85,
      'B-Tier': 70,
      'C-Tier': 55,
      'D-Tier': 40,
    };

    const h1 = evaluateHaxAndSpiritualBonus(c1);
    const h2 = evaluateHaxAndSpiritualBonus(c2);

    const rawPhysical1 = (Number(c1.power_score) || 5) * 4 + (Number(c1.speed_score) || 5) * 3 + (Number(c1.durability_score) || 5) * 2;
    const rawPhysical2 = (Number(c2.power_score) || 5) * 4 + (Number(c2.speed_score) || 5) * 3 + (Number(c2.durability_score) || 5) * 2;

    const intel1 = (Number(c1.intelligence_score) || 5) * 4;
    const intel2 = (Number(c2.intelligence_score) || 5) * 4;

    // Toplam Kombine Dövüş Gücü (Fiziksel Kas Gücü + Ruhsal/Mistik Hax + Zeka)
    const score1 = (tierMap[t1] || 60) + rawPhysical1 + intel1 + h1.haxScore;
    const score2 = (tierMap[t2] || 60) + rawPhysical2 + intel2 + h2.haxScore;

    const diff = Math.abs(score1 - score2);
    let winPct1 = 50;
    if (score1 > score2) {
      winPct1 = Math.min(90, 52 + Math.round(diff / 3.8));
    } else if (score2 > score1) {
      winPct1 = Math.max(10, 48 - Math.round(diff / 3.8));
    }
    const winPct2 = 100 - winPct1;

    const winner = score1 >= score2 ? c1 : c2;
    const loser = score1 >= score2 ? c2 : c1;
    const winnerHax = score1 >= score2 ? h1 : h2;
    const loserHax = score1 >= score2 ? h2 : h1;
    const winPct = score1 >= score2 ? winPct1 : winPct2;

    const keyAdvantage = [];
    if (winnerHax.haxTypes.length > 0) {
      keyAdvantage.push(...winnerHax.haxTypes);
    }
    if ((Number(winner.intelligence_score) || 5) > (Number(loser.intelligence_score) || 5)) {
      keyAdvantage.push('Taktiksel Hazırlık & Dahi Zeka');
    }
    if ((Number(winner.power_score) || 5) > (Number(loser.power_score) || 5)) {
      keyAdvantage.push('Fiziksel Vuruş Gücü');
    }
    if (keyAdvantage.length === 0) {
      keyAdvantage.push('Kanonik Sahne Başarımları & İrade Üstünlüğü');
    }

    const hasSpiritualBypass = winnerHax.haxTypes.length > 0 && (Number(loser.power_score) || 5) > (Number(winner.power_score) || 5);

    const scalingSummary = hasSpiritualBypass
      ? `${winner.name}, kaba kas gücü (${loser.power_score}/10) bakımından ${loser.name}'in gerisinde kalsa da; sahip olduğu ${winnerHax.haxTypes[0]} ve ruhsal/mistik hax yeteneği sayesinde rakibin fiziksel savunmasını tamamen bypass ederek zafere ulaşmaktadır.`
      : `${winner.name}, kanonik başarımları (${winner.tier}), ${keyAdvantage[0]} ve savaş alanı zekası sayesinde ${loser.name} karşısında net bir üstünlük kurmaktadır.`;

    const result = {
      winner_id: winner.id,
      winner_name: winner.name,
      loser_name: loser.name,
      win_percentage: winPct,
      tier_comparison: `${c1.name} (${t1}) vs ${c2.name} (${t2})`,
      key_advantages: keyAdvantage,
      has_spiritual_bypass: hasSpiritualBypass,
      scaling_summary: scalingSummary,
      fight_phases: [
        {
          phase: '1. Aşama — Temas ve Fiziksel Sınama',
          text: `${c1.name} ve ${c2.name} karşı karşıya gelir. ${loser.name} kaba kuvvetle hamle yaparken, ${winner.name} rakibin zayıf noktasını ve zihinsel açığını analiz eder.`
        },
        {
          phase: '2. Aşama — Ruhsal/Mistik Yetenek & Kırılma',
          text: hasSpiritualBypass
            ? `${loser.name} yüksek zırhı ve dayanıklılığı ile bastırmaya çalışır. Ancak ${winner.name}, ${winnerHax.haxTypes[0] || 'ruhsal/mistik yeteneğini'} devreye sokarak kas gücünün hiçbir işe yaramadığı manevi ve zihinsel boyutta rakibinin savunmasını yok eder!`
            : `${winner.name}, sahip olduğu ${keyAdvantage[0]} üstünlüğünü kullanarak dövüşün kontrolünü tamamen ele geçirir.`
        },
        {
          phase: '3. Aşama — Kanonik Sonuç & Hakem Kararı',
          text: `${winner.name}, son vuruşta rakibin direnç noktasını çökerterek %${winPct} zafer oranı ile dövüşü kazanır.`
        }
      ],
      lore_proofs: [
        `${winner.name}'in kanonik feat'leri ve ${winnerHax.haxTypes[0] || 'ruhi/zihinsel yetenekleri'}, sadece kas gücüne dayalı dövüşçülerin savunmasını etkisiz hale getirir.`,
        `${loser.name} güçlü bir ${loser.tier} seviyesine sahip olsa da, hax ve mistik alan koruması olmadığı için bu eşleşmede dezavantajlıdır.`,
        `Kanonik scaling analizinde sadece sayısal kas puanı değil; boyut, hax, ruhsal manipülasyon ve başat sahneler dikkate alınmıştır.`
      ],
      counter_condition: `${loser.name}'in kazanması ancak ${winner.name}'in ruhsal/mistik yeteneklerini kullanmasını engelleyen antika bir tilsim kısıtlamasının uygulandığı durumlarda mümkündür.`
    };

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'AI Simülasyon hatası oluştu.' }, { status: 500 });
  }
}
