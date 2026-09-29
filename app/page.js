import { supabase } from '../lib/supabaseClient';
import TierBadge from './components/TierBadge';
import CharacterGrid from './components/CharacterGrid';
import PopularCharacters from './components/PopularCharacters';
import HeroSpotlight from './components/HeroSpotlight';
import VersusDuel from './components/VersusDuel';
import { CtaBand, EmptyNote } from './components/HomeAuth';

export const revalidate = 0;

const steps = [
  ['1', 'Karakteri İncele', 'Her karakterin sayfasında güç, zeka, hız, dayanıklılık ve etki değerleri; ayrıca bu değerlerin gerekçesi yer alır.'],
  ['2', 'VS Arenasında Kıyasla', 'İki karakteri karşılaştır, stat farklarını gör ve topluluk oylamasında tarafını seç.'],
  ['3', 'Toplulukla Tartış', 'Karakter sayfalarında yorum yap, sohbet odasında teorilerini paylaş, seviye atla.'],
];

export default async function HomePage() {
  const { data: characters } = await supabase
    .from('characters')
    .select('id, name, series, tier, category, image_url, created_at, power_score, intelligence_score, speed_score, durability_score, description')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const list = characters || [];
  const count = list.length;

  // Spotlight vitrinine koyulacak karakterler (En yüksek tier/power veya en son eklenenler)
  const spotlightChars = list.slice(0, 4);

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Sinematik Hero Spotlight Afişi */}
      {count > 0 ? (
        <HeroSpotlight featuredCharacters={spotlightChars} />
      ) : (
        <section className="hero">
          <div className="wrap">
            <span className="kicker">Türk Kurgusunun Güç Sıralaması</span>
            <h1>Türk dizi ve filmlerinin karakterleri ne kadar güçlü?</h1>
            <p>
              Karakterlerin güç, zeka, hız ve dayanıklılık değerlerini gerekçeleri ve kaynak sahneleriyle birlikte incele.
            </p>
          </div>
        </section>
      )}

      <div className="wrap">
        {/* Popüler / Çok Tıklanan Karakterler */}
        <PopularCharacters />

        {/* Günün Düellosu (Versus Arena Widget) */}
        {count >= 2 && <VersusDuel characters={list} />}

        {/* Ana Karakterler Bölümü & 3:4 Poster Izgarası */}
        <section className="section" id="karakterler">
          <div className="section-head">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2>Karakter Kataloğu</h2>
                <p>{count > 0 ? `${count} karakter incelendi ve listelendi` : 'İlk sıralamalar hazırlanıyor'}</p>
              </div>
              <a href="/vs" className="btn btn-ghost" style={{ fontSize: '.85rem' }}>
                ⚔️ Tümünü Kıyasla (VS Arenası)
              </a>
            </div>
          </div>

          {count === 0 ? (
            <div className="empty">
              Karakterler çok yakında burada olacak. Editör ekibi ilk sıralamaları hazırlıyor.
              <br />
              <EmptyNote />
            </div>
          ) : (
            <CharacterGrid characters={list} />
          )}
        </section>

        {/* Nasıl Çalışır? */}
        <section className="section">
          <div className="section-head">
            <h2>Nasıl Çalışır?</h2>
            <p>Üç adımda Türk kurgu evreninin en kapsamlı gücünü keşfet.</p>
          </div>
          <div className="steps">
            {steps.map(([n, title, text]) => (
              <div className="card step" key={n}>
                <div className="num">{n}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>Tier sistemi nasıl okunur?</h2>
            <p>Sıralama, VS Battles Wiki'nin tier sistemine dayanır. Sayı küçüldükçe güç artar.</p>
          </div>
          <div className="card tier-guide">
            <div className="item"><TierBadge tier="10-B" /><span>Sıradan insan gücü. Gerçekçi dizi karakterlerinin çoğu 10. ve 9. tier'da yer alır.</span></div>
            <div className="item"><TierBadge tier="9-C" /><span>İnsan gücünün sınırı: olimpiyat sporcusu ya da çok usta bir dövüşçü.</span></div>
            <div className="item"><TierBadge tier="7-C" /><span>Bir kasabayı yok edebilecek güç. Fantastik ve bilimkurgu yapımlarda görülür.</span></div>
            <div className="item"><TierBadge tier="High 7-C" /><span>Low ve High, bazı tier'ların alt ve üst kademeleridir. Low 7-C, 7-C'den; 7-C ise High 7-C'den zayıftır.</span></div>
          </div>
          <p style={{ marginTop: '14px' }}><a href="/tier-sistemi" className="btn btn-ghost">Tüm tier'ları ve anlamlarını gör</a></p>
        </section>

        <CtaBand />
      </div>
    </div>
  );
}
