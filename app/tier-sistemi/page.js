import TierBadge from '../components/TierBadge';
import { TIERS, GROUPS, tierNumber } from '../components/tiers';

export const metadata = {
  title: 'Tier Sistemi Nedir?',
  description: 'Karakterlerin güç seviyesini gösteren tier sisteminin açıklaması: 11-C\'den 0\'a kadar her tier ne anlama geliyor?',
};

const notes = [
  ['Tier neyi ölçer?', 'Ağırlıklı olarak bir karakterin yaratabildiği ya da yok edebildiği şeyin ölçeğini. Dayanıklılık da belirleyicidir: o tier\'daki birine zarar verebilmek de o tier\'a girmek için yeterli olabilir.'],
  ['Üst tier yenilmez demek değildir', 'Bazı yetenekler güç farkını tamamen aşabilir. Daha düşük tier\'daki bir karakter, özel gücü sayesinde üst tier\'dakiyle başa çıkabilir.'],
  ['Aynı tier, farklı güç', 'Bir tier\'ın alt ve üst sınırı arasındaki fark çok büyük olabilir. Bir karakterden çok daha güçlü olmak, otomatik olarak üst tier demek değildir.'],
  ['Low ve High ne demek?', 'Bazı tier\'lar alt ve üst kademelere ayrılır. Örneğin Low 7-C, 7-C\'den; 7-C ise High 7-C\'den zayıftır. Her tier\'ın bu kademeleri yoktur.'],
  ['Türk yapımlarında', 'Gerçekçi dizi ve film karakterlerinin çoğu 10. ve 9. tier aralığındadır. Üst tier\'lar fantastik ve bilimkurgu yapımlar içindir.'],
];

export default function TierSystemPage() {
  const grouped = {};
  TIERS.forEach((t) => {
    const n = tierNumber(t.id);
    (grouped[n] = grouped[n] || []).push(t);
  });
  const order = Object.keys(grouped).map(Number).sort((a, b) => b - a);

  return (
    <div className="wrap">
      <div className="tier-page-hero">
        <h1>Tier sistemi nedir?</h1>
        <p>
          Karakterlerin güç seviyesini tek bir bakışta karşılaştırabilmek için bir tier ölçeği kullanıyoruz.
          Sayı küçüldükçe güç artar; aynı sayıda A, B'den, B ise C'den güçlüdür. Aşağıda her tier'ın ne anlama geldiğini bulabilirsin.
        </p>
        <div className="jump">
          {order.map((n) => (
            <a key={n} href={`#tier-${n}`}>Tier {n} · {GROUPS[n][0]}</a>
          ))}
        </div>
      </div>

      <div className="notes">
        {notes.map(([title, text]) => (
          <div className="card" key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>

      {order.map((n) => (
        <section className="tier-group" id={`tier-${n}`} key={n}>
          <h2>Tier {n} · {GROUPS[n][0]}</h2>
          <p className="blurb">{GROUPS[n][1]}</p>
          <div className="card" style={{ padding: '4px 20px' }}>
            {grouped[n].map((t) => (
              <div className="tier-row" key={t.id}>
                <div><TierBadge tier={t.id} /></div>
                <div>
                  <div className="nm">{t.name}</div>
                  <div className="ds">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <p className="credit">
        Bu ölçek, <a href="https://vsbattles.fandom.com/wiki/Tiering_System" target="_blank" rel="noopener noreferrer">VS Battles Wiki'nin Tiering System sayfasından</a> Türkçeye uyarlanmıştır.
      </p>
    </div>
  );
}
