import TierBadge from '../components/TierBadge';
import { TIERS, GROUPS, tierNumber } from '../components/tiers';

export const metadata = {
  title: 'Tier Sistemi Rehberi | Güç Skalası Standartları',
  description: 'Karakterlerin güç seviyesini gösteren bilimsel tier sisteminin açıklaması: 11-C\'den 0 Tier\'a kadar detaylı rehber.',
};

const notes = [
  ['Tier Neyi Ölçer?', 'Ağırlıklı olarak bir karakterin yaratabildiği ya da yok edebildiği şeyin ölçeğini. Dayanıklılık da belirleyicidir: o tier\'daki birine zarar verebilmek de o tier\'a girmek için yeterlidir.'],
  ['Üst Tier Yenilmez Demek Değildir', 'Bazı yetenekler güç farkını tamamen aşabilir. Daha düşük tier\'daki bir karakter, özel zihinsel veya ruhsal yeteneği sayesinde üst tier\'daki rakibini alt edebilir.'],
  ['Aynı Tier, Farklı Güç Skalası', 'Bir tier\'ın alt ve üst sınırı arasındaki fark çok büyük olabilir. Bir karakterden çok daha güçlü olmak, otomatik olarak üst tier anlamına gelmez.'],
  ['Low ve High Kademe Ayrımı', 'Bazı tier\'lar alt ve üst kademelere ayrılır. Örneğin Low 7-C, 7-C\'den; 7-C ise High 7-C\'den zayıftır.'],
  ['Türk Yapımlarında Scaling', 'Gerçekçi dizi ve film karakterlerinin çoğu 10. ve 9. tier aralığındadır. Üst tier\'lar mitolojik, fantastik ve bilimkurgu evrenler içindir.'],
];

export default function TierSystemPage() {
  const grouped = {};
  TIERS.forEach((t) => {
    const n = tierNumber(t.id);
    (grouped[n] = grouped[n] || []).push(t);
  });
  const order = Object.keys(grouped).map(Number).sort((a, b) => b - a);

  return (
    <div className="wrap" style={{ paddingBottom: '60px' }}>
      <div className="tier-page-hero text-center" style={{ padding: '40px 0 28px' }}>
        <span className="kicker" style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: '.85rem' }}>BILIMSEL SCALING REHBERİ</span>
        <h1 style={{ fontFamily: "'Chakra Petch', 'Rajdhani', sans-serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, margin: '14px 0', letterSpacing: '-0.02em' }}>
          TIER SISTEMI NEDIR?
        </h1>
        <p style={{ maxWidth: '720px', margin: '0 auto 24px', color: 'var(--text-dim)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Karakterlerin güç seviyesini tek bir bakışta karşılaştırabilmek için uluslararası VS Battles ölçeğini kullanıyoruz.
          Sayı küçüldükçe güç ve yıkıcılık skalası artar.
        </p>
        <div className="jump" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {order.map((n) => (
            <a
              key={n}
              href={`#tier-${n}`}
              className="btn btn-ghost btn-sm"
              style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: '.82rem', borderRadius: '8px' }}
            >
              Tier {n} · {GROUPS[n][0]}
            </a>
          ))}
        </div>
      </div>

      <div className="notes" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', margin: '24px 0 40px' }}>
        {notes.map(([title, text]) => (
          <div className="card" key={title} style={{ borderRadius: '14px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', color: 'var(--accent)', margin: '0 0 8px' }}>{title}</h3>
            <p style={{ fontSize: '.9rem', lineHeight: 1.55 }}>{text}</p>
          </div>
        ))}
      </div>

      {order.map((n) => (
        <section className="tier-group" id={`tier-${n}`} key={n} style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: "'Chakra Petch', 'Rajdhani', sans-serif", fontSize: '1.45rem', fontWeight: 800, letterSpacing: '0.04em', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent)' }}>TIER {n}</span> · {GROUPS[n][0]}
          </h2>
          <p className="blurb" style={{ color: 'var(--text-dim)', fontSize: '.94rem', margin: '0 0 14px' }}>{GROUPS[n][1]}</p>
          <div className="card" style={{ padding: '8px 20px', borderRadius: '16px' }}>
            {grouped[n].map((t) => (
              <div
                className="tier-row"
                key={t.id}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}
              >
                <div style={{ flexShrink: 0 }}><TierBadge tier={t.id} large /></div>
                <div>
                  <div className="nm" style={{ fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.02em' }}>{t.name}</div>
                  <div className="ds" style={{ fontSize: '.88rem', color: 'var(--text-dim)', marginTop: '2px' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <p className="credit text-center" style={{ marginTop: '40px', color: 'var(--text-dim)', fontSize: '.88rem' }}>
        Bu ölçek, <a href="https://vsbattles.fandom.com/wiki/Tiering_System" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>VS Battles Wiki Tiering System</a> rehberinden Türkçeye uyarlanmıştır.
      </p>
    </div>
  );
}
