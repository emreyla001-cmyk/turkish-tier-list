import { supabase } from '../lib/supabaseClient';
import TierBadge from './components/TierBadge';
import CharacterGrid from './components/CharacterGrid';
import PopularCharacters from './components/PopularCharacters';
import { CtaBand, EmptyNote } from './components/HomeAuth';

export const revalidate = 0;

const steps = [
  ['1', 'Karakteri incele', 'Her karakterin sayfasında güç, zeka, hız, dayanıklılık ve etki değerleri; ayrıca bu değerlerin gerekçesi yer alır.'],
  ['2', 'Toplulukla tartış', 'Karakter sayfalarındaki yorumlarda görüşünü paylaş, sohbet odasında diğer izleyicilerle konuş.'],
  ['3', 'Karakter öner', 'Listede olmasını istediğin bir karakter mi var? Öneri gönder, editör ekibi inceleyip yayınlasın.'],
];

export default async function HomePage() {
  const { data: characters } = await supabase
    .from('characters')
    .select('id, name, series, tier, category, image_url, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const count = characters?.length || 0;

  return (
    <div>
      <section className="hero">
        <div className="wrap">
          <span className="kicker">Türk Kurgusunun Güç Sıralaması</span>
          <h1>Türk dizi ve filmlerinin karakterleri ne kadar güçlü?</h1>
          <p>
            Karakterlerin güç, zeka, hız ve dayanıklılık değerlerini gerekçeleri ve kaynak sahneleriyle birlikte incele.
            Sıralamalar editör onayından geçer, tartışma ise sana ait.
          </p>
          <div className="hero-actions">
            <a href="#karakterler" className="btn">Karakterleri Keşfet</a>
            <a href="/karakter-oner" className="btn btn-ghost">Karakter Öner</a>
          </div>
        </div>
      </section>

      <div className="wrap">
        <PopularCharacters />

        <section className="section" id="karakterler">
          <div className="section-head">
            <h2>Karakterler</h2>
            <p>{count > 0 ? `${count} karakter yayında` : 'İlk sıralamalar hazırlanıyor'}</p>
          </div>

          {count === 0 ? (
            <div className="empty">
              Karakterler çok yakında burada olacak. Editör ekibi ilk sıralamaları hazırlıyor.
              <br />
              <EmptyNote />
            </div>
          ) : (
            <CharacterGrid characters={characters} />
          )}
        </section>

        <section className="section">
          <div className="section-head">
            <h2>Nasıl çalışır?</h2>
            <p>Üç adımda topluluğun parçası ol.</p>
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
