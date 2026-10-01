import { NextResponse } from 'next/server';

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
      'S-Tier': 100,
      'A-Tier': 85,
      'B-Tier': 70,
      'C-Tier': 55,
      'D-Tier': 40,
    };

    const score1 = (tierMap[t1] || 60) + (Number(c1.power_score) || 5) * 4 + (Number(c1.speed_score) || 5) * 3 + (Number(c1.intelligence_score) || 5) * 3 + (Number(c1.durability_score) || 5) * 2;
    const score2 = (tierMap[t2] || 60) + (Number(c2.power_score) || 5) * 4 + (Number(c2.speed_score) || 5) * 3 + (Number(c2.intelligence_score) || 5) * 3 + (Number(c2.durability_score) || 5) * 2;

    const diff = Math.abs(score1 - score2);
    let winPct1 = 50;
    if (score1 > score2) {
      winPct1 = Math.min(88, 52 + Math.round(diff / 4));
    } else if (score2 > score1) {
      winPct1 = Math.max(12, 48 - Math.round(diff / 4));
    }
    const winPct2 = 100 - winPct1;

    const winner = score1 >= score2 ? c1 : c2;
    const loser = score1 >= score2 ? c2 : c1;
    const winPct = score1 >= score2 ? winPct1 : winPct2;

    // Lore & Stat Hakem Analizleri
    const p1 = Number(c1.power_score) || 5;
    const p2 = Number(c2.power_score) || 5;
    const s1 = Number(c1.speed_score) || 5;
    const s2 = Number(c2.speed_score) || 5;
    const i1 = Number(c1.intelligence_score) || 5;
    const i2 = Number(c2.intelligence_score) || 5;
    const d1 = Number(c1.durability_score) || 5;
    const d2 = Number(c2.durability_score) || 5;

    const keyAdvantage = [];
    if (winner.id === c1.id) {
      if (p1 > p2) keyAdvantage.push(`Fiziksel / Yıkım Gücü Üstünlüğü (+${p1 - p2} Puan)`);
      if (s1 > s2) keyAdvantage.push(`Hız & Çabukluk Üstünlüğü (+${s1 - s2} Puan)`);
      if (i1 > i2) keyAdvantage.push(`Taktiksel Zeka & Strateji Üstünlüğü (+${i1 - i2} Puan)`);
      if (d1 > d2) keyAdvantage.push(`Dayanıklılık & Çelik İrade (+${d1 - d2} Puan)`);
    } else {
      if (p2 > p1) keyAdvantage.push(`Fiziksel / Yıkım Gücü Üstünlüğü (+${p2 - p1} Puan)`);
      if (s2 > s1) keyAdvantage.push(`Hız & Çabukluk Üstünlüğü (+${s2 - s1} Puan)`);
      if (i2 > i1) keyAdvantage.push(`Taktiksel Zeka & Strateji Üstünlüğü (+${i2 - i1} Puan)`);
      if (d2 > d1) keyAdvantage.push(`Dayanıklılık & Çelik İrade (+${d2 - d1} Puan)`);
    }

    if (keyAdvantage.length === 0) {
      keyAdvantage.push('Tier ve Sahne Deneyimi Faktörü');
    }

    const result = {
      winner_id: winner.id,
      winner_name: winner.name,
      loser_name: loser.name,
      win_percentage: winPct,
      tier_comparison: `${c1.name} (${t1}) vs ${c2.name} (${t2})`,
      key_advantages: keyAdvantage,
      scaling_summary: `${winner.name}, ${winner.series || 'kendi kurgu evrenindeki'} güç seviyesi (${winner.tier}) ve ${keyAdvantage[0]} sayesinde ${loser.name} karşısında net bir alan hakimiyeti kurmaktadır.`,
      fight_phases: [
        {
          phase: '1. Aşama — İlk Çatışma & Keşif',
          text: `Dövüş başladığında ${c1.name} ve ${c2.name} bir süre mesafe korur. ${c1.name} kendi tarzına uygun ${s1 >= s2 ? 'hızlı hamlelerle' : 'temkinli duruşuyla'} baskı kurarken, ${c2.name} ${i2 >= 7 ? 'rakibin açığını arayan stratejik bir yaklaşım' : 'doğrudan fiziksel hamleler'} sergiler.`
        },
        {
          phase: '2. Aşama — Taktiksel Kırılma',
          text: `Karşılaşmanın dönüm noktasında ${winner.name}, ${keyAdvantage[0]} faktörünü devreye sokar. ${loser.name} direnç göstermeye çalışsa da (${loser.tier} seviyesi), ${winner.name}'in yüksek ${i1 >= i2 ? 'zeka' : 'güç'} ve saha hakimiyeti rakibin savunma hattını yarmasını sağlar.`
        },
        {
          phase: '3. Aşama — Final ve Zafer',
          text: `${winner.name}, son kombinasyonunda kanonik yeteneklerini maksimum kapasitede kullanarak ${loser.name}'i saf dışı bırakır. Zafer %${winPct} ihtimalle ${winner.name}'in olur!`
        }
      ],
      lore_proofs: [
        `${winner.name}, ${winner.series || 'kendi evreninde'} sergilediği başat başarılar ve yüksek psikolojik dayanıklılığı sayesinde kritik anlarda hata yapmaz.`,
        `${loser.name} güçlü bir ${loser.tier} dövüşçüsü olmasına rağmen, ${winner.name}'in ${keyAdvantage.join(' ve ')} avantajına yanıt vermekte yetersiz kalmaktadır.`,
        `Kanonik scaling verileri incelediğinde ${winner.name}'in kriz anlarındaki kararlılığı galibiyeti tesciller.`
      ],
      counter_condition: `${loser.name}'in kazanması ancak ${winner.name}'in ciddi şekilde tuzağa düşürüldüğü veya %${Math.max(12, 100 - winPct)}'lik istisnai bir alan kısıtlamasının yaşandığı senaryolarda mümkündür.`
    };

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'AI Simülasyon hatası oluştu.' }, { status: 500 });
  }
}
