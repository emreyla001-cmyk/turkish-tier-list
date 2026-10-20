const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
for (let l of env.split('\n')) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
}

const supabase = createClient(url, key);

const COSMIC_DEEPENING = [
  {
    name: 'Hızır',
    description: `1. Beşinci Boyut Varlığı ve Mekânsal Aşkınlık (5th-Dimensional Existence & Spatial Transcendence)
Gerekçe: Samanyolu 'Beşinci Boyut' ve geleneksel halk anlatılarında Hızır, insanların algıladığı 3 boyutlu fiziksel uzayın ve 4. boyut olan doğrusal zaman akışının tamamen ötesinde bir varoluş düzleminde yaşar.
Açıklama: Üç boyutlu dünyanın sınırlarına, mesafelerine ve kütleçekim kanunlarına tabi değildir. Mekandan tamamen bağımsızdır; aynı anda birden fazla yerde tecelli edebilir veya dilediği mekanda anında belirebilir (Omnipresence / Boyutlararası Anlık Tezahür).

2. Nedensellik Dışı Varoluş ve Zaman Bükme (Acausality & Temporal Mastery)
Gerekçe: Beşinci Boyut düzleminde geçmiş, şimdiki an ve gelecek tek bir levha halinde açıktır; Hızır zaman akışından etkilenmez ve olayların sebep-sonuç bağlarına müdahale edebilir.
Açıklama: İnsanların gelecekte yaşayacağı olayları, yapacakları ahlaki tercihleri ve sonuçlarını önceden bilir (Prekognisyon / Kader Görüsü). Gelecekte gerçekleşecek felaketleri daha tohum halindeyken engeller veya ilahi adaletin tecellisini hızlandırır.

3. Ontolojik Madde Dönüşümü ve Avatar Projeksiyonu (Transmutation & Shape-Shifting)
Gerekçe: Dilediği an fiziksel çevreyi, eşyaların kimyasal doğasını ve insanların zihin algılarını zahmetsizce manipüle eder.
Açıklama: Maddeleri yoktan var edebilir, zehirleri şifaya dönüştürebilir veya insanlara fakir bir dilenci, bir doktor ya da yaşlı bir seyyah suretinde görünebilir. Bedenleri gerçek bir biyolojik form değil, sadece 3 boyutlu dünyadaki geçici bir yansımadır.

4. Zihinsel Algı ve Sırları Okuma Kudreti (Nigh-Omniscience & Mind Penetration)
Gerekçe: Karşılaştığı ölümlülerin kalplerinden geçen en gizli niyetleri, dile getirilmemiş günahları ve pişmanlıkları doğrudan bilir.
Açıklama: Hiçbir yalan veya ikiyüzlülük onun nezdinde gizlenemez; zihinleri ve vicdanları bir kitap gibi okur (Telepati ve Manevi Basiret).

5. Fiziksel Hasara Tam Bağışıklık ve Ölümsüzlük (Abstract Immortality & Non-Physical State)
Gerekçe: Ab-ı Hayat (Hayat Suyu) içerek ebedi diriliğe kavuştuğu ve ilahi vazifeyle donatıldığı rivayet edilir.
Açıklama: Mermiler, bıçaklar, patlamalar veya dünyevi hiçbir silah ruhani varlığına temas dahi edemez; biyolojik ölüm kavramı onun için hükümsüzdür.

6. Çoklu Evren / 5. Boyut Powerscaling Temellendirmesi (Cosmological Justification)
Gerekçe: Evrensel ahlaki ve metafizik düzeni korumakla görevli ilahi bir arketip olması ve 3D/4D evrenin ötesindeki 'Beşinci Boyut' üzerinden müdahalelerde bulunması.
Açıklama: Yüksek boyutsal varoluş ve nedenselliği bükme kudreti, modern tiering sisteminde Hızır'ı fiziksel sınırların çok üzerinde kozmik bir düzenleyici konumuna yerleştirir.`
  },
  {
    name: 'Azrail',
    description: `1. Ölüm Kavramının Mutlak Cisimleşmesi (Conceptual Embodiment of Mortality)
Gerekçe: İslam ve Doğu eskatolojisinde yaratılmış her canlı nefsin (insanlar, cinler, melekler, hayvanlar) eceli geldiğinde canını almakla vazifeli büyük meleklerden biridir.
Açıklama: Azrail yalnızca güçlü bir savaşçı değil, yaratılışın temel kanunlarından biri olan 'Biyolojik ve Ruhani Entropi / Ölüm' kavramının ontolojik icracısıdır. Varlığı kavramsal olduğu için fiziksel hasarlarla yok edilemez.

2. Makro-Kozmik Boyut ve Aynı Anda Milyarlarca Ruh Kabzı (Omnipresence of Demise)
Gerekçe: Dini rivayetlerde ve tasavvufi metinlerde başı arşta, ayakları yeryüzünün dibinde olan, tüm kainatın avucundaki bir hardal tanesi gibi göründüğü muazzam bir boyutta tasvir edilir.
Açıklama: Aynı anda patlayan süpernovalarda, savaş meydanlarında veya gezegenlerde can veren milyarlarca varlığın ruhunu aynı saniyede kabzeder (Simultaneous Soul Reaping).

3. Levh-i Mahfuz ve Mutlak Ecel Bilgisi (Fate Cognition & Inevitability)
Gerekçe: Hangi canlının hangi saniyede, nerede ve nasıl öleceği ona kozmik kader levhasından (Levh-i Mahfuz) bildirilir; bu emir karşısında hiçbir güç erteleme yapamaz.
Açıklama: Karşı konulamaz bir kader otoritesine sahiptir; ölümlülerin savunmaları, zırhları veya kaçış planları Azrail'in tecellisi karşısında anlamsızdır.

4. Biyolojik ve Boyutsal Sınırları Aşma (Non-Physical Transcendence)
Gerekçe: Maddesel bedenleri, zırhları veya büyü kalkanlarını doğrudan delerek hedefin öz ruhuna (Letaif) dokunur.
Açıklama: Kalkanlar veya zırhlar bedenleri koruyabilir ancak Azrail doğrudan ruhun bağını koparır; bu durum tüm dayanıklılık (Durability) parametrelerini geçersiz kılar (Durability Negation).

5. Deli Dumrul Anlatısındaki Metafizik Üstünlük (Victory Over Mortal Heroes)
Gerekçe: Dede Korkut anlatısında kendisine kılıç çekmeye kalkan en kudretli Oğuz bahadırı Deli Dumrul'un canını tek bir bakışıyla boğazına düğümlemiş ve onu yalvartmıştır.
Açıklama: İnsanüstü fiziksel güçlerin Azrail'in manevi heybeti karşısında hiçbir hükmünün olmadığını simgeler.

6. Çoklu Evren Ölçekli Ölüm Yetkisi (Cosmic / Multiversal Tiering Argument)
Gerekçe: Bütün alemlerdeki ve katmanlardaki fanilik kuralını uygulaması.
Açıklama: Powerscaling'de kavramsal ölüm ajanları, tüm yaratılmış canlıları kapsayan mutlak etki alanı sebebiyle Tier 2 hiyerarşisinde değerlendirilir.`
  },
  {
    name: 'Beşinci Boyut Şeytan (İblis)',
    description: `1. Kozmik Kötülük ve Vesvese Ağı (Universal Temptation & Corruptive Network)
Gerekçe: Samanyolu 'Beşinci Boyut' ve dini metinlerde tüm insanlığın kalbine ve zihnine aynı anda fesat, intikam ve günah fısıldayan metafizik kötülük kutbudur.
Açıklama: Mekan sınırlaması olmaksızın milyarlarca bilince eşzamanlı olarak vesvese verebilir; insan iradesini manipüle ederek küresel savaşlara ve cinayetlere yol açar (Kavramsal Zihin ve Ahlak Manipülasyonu).

2. 5. Boyut ile 3. Boyut Arasında Serbest Geçiş (Interdimensional Phasing)
Gerekçe: Hızır'ın boyutsal zıttı olarak, insanların algılayamadığı 5. boyut düzleminden dünyayı gözetler ve dilediği an fiziksel dünyaya bir insan suretinde sızar.
Açıklama: Katı duvarlar, kapılar veya fiziksel güvenlik önlemleri onun için hiçbir engel teşkil etmez; uzay-zaman koordinatlarını dilediği gibi büker.

3. Şekil Değiştirme ve Suret Alma (Avatar Projection & Shapeshifting)
Gerekçe: Kurbanının karşısına en sevdiği dostu, otoriter bir patron veya zengin bir tüccar kılığında çıkabilir; sesi, kokuyu ve görünümü eksiksiz taklit eder.
Açıklama: Kusursuz bir psikolojik aldatma ve kimlik bürünme yeteneğine sahiptir.

4. Ebedi Varoluş ve Kavramsal Dokunulmazlık (Abstract Evil Immortality)
Gerekçe: Kıyamete kadar mühlet verilmiş bir varlık olup fiziksel dünyada kurşunla, bıçakla veya füzeyle öldürülemez.
Açıklama: Varlığı kötülük, nefis ve günah kavramları devam ettiği müddetçe baki kalır; sadece samimi manevi irade ve tövbe ile uzaklaştırılabilir.

5. Kozmik Hızır-İblis Dengesi (Cosmic Opposition to Hızır)
Gerekçe: Hızır nasıl iyiliğin ve hidayetin 5. boyut elçisiyse, İblis de karanlığın ve sapkınlığın karşıt kutbudur; evrendeki dualizmin temel direğidir.
Açıklama: Güç ölçeğinde Hızır ile denk bir etki alanına ve kavramsal nüfuza sahiptir.`
  },
  {
    name: 'Yüce Honos',
    description: `1. Ütopya Evreninin Yüce Yargıcı ve Kozmik Otorite (Supreme Arbiter of Utopia Cosmos)
Gerekçe: Selena evreninde hem iyilik perisi Selena'nın hem de kaos büyücüsü Şoker'in üzerindeki en yüksek ilahi makam ve kozmik kanun koyucudur.
Açıklama: Büyü ve peri ırkının tüm hiyerarşisi onun adaletine ve kanunlarına tabidir. Evrensel büyü dengesini tek başına tayin eder.

2. Büyü İptali ve Mutlak Hüküm (Absolute Power Nullification)
Gerekçe: Selena veya Şoker evren kurallarını çiğnediğinde, tek bir el hareketi veya sözüyle onların tüm büyü güçlerini tamamen iptal edebilir, güçlerini geri alabilir veya onları fani bir insana dönüştürebilir.
Açıklama: Karşı konulamaz bir kavramsal otoriteye sahiptir; emirleri kozmosun tüm sakinleri için tartışmasız bağlayıcıdır.

3. Boyut Hapsi ve Kozmik Cezalandırma (Dimensional Imprisonment)
Gerekçe: İsyankar varlıkları veya suç işleyen perileri Ütopya zindanlarına, ayna boyutlarına veya zaman boşluklarına hapsedebilir.
Açıklama: Hedefin uzay-zaman sürekliliğindeki yerini değiştirerek onu sonsuz bir izolasyona mahkum edebilir.

4. Zamansızlık ve Evrensel Sezgi (Cosmic Omnipresence Aura & Omniscience)
Gerekçe: Evrenin neresinde olursa olsun Selena veya Şoker'in yaptığı her eylemi anında görür ve bilir; hiçbir hile veya gizli plan ondan saklanamaz.
Açıklama: Bilgi işleme ve sezgi kapasitesi evrensel ölçektedir (Zeka: 10/10).

5. Ahlaki Denge ve Kozmik Dokunulmazlık (Cosmic Neutrality & Invulnerability)
Gerekçe: İyilik ile kötülük arasındaki ezeli dengenin koruyucusudur; hiçbir büyücü veya peri Honos'a doğrudan saldıramaz veya zarar veremez.
Açıklama: Varlığı Ütopya sisteminin temeli olduğu için sistem içi varlıklar ona asla üstünlük sağlayamaz.`
  }
];

async function run() {
  console.log('Cosmic characters deepening...');
  for (const c of COSMIC_DEEPENING) {
    const { error } = await supabase.from('characters').update({ description: c.description }).eq('name', c.name);
    if (error) console.error(`Error updating ${c.name}:`, error);
    else console.log(`✅ Deepened ${c.name} with rigorous multi-point academic feats!`);
  }
}

run();
