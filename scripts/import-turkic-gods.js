const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
for (let l of env.split('\n')) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
}

const supabase = createClient(url, key);

const TURKIC_GODS = [
  {
    name: 'Bay Ülgen',
    series: 'Altay & Türk Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: '1-A',
    power_score: 10,
    intelligence_score: 10,
    speed_score: 10,
    durability_score: 10,
    influence_score: 10,
    description: `1. 16. Gök Katının ve Altın Dağ'ın Mutlak Hakimi (Ruler of the 16th Celestial Sphere)
Gerekçe: Altay Şamanist kozmolojisinde Kayra Han'ın 17. kattaki mutlak aşkınlığından hemen sonra, göğün 16. tabakasındaki Altın Dağ'da (Altın Taht) ikamet eden en yüksek iyilik ve gök tanrısıdır.
Açıklama: 16 gök katının tüm ilahi varlıkları, ruhları ve melekleri (Yayık, Suyla, Karlık) Ülgen'in mutlak iradesine tabidir. Yaratılmış evrenin göksel idaresi doğrudan onun tasarrufundadır.

2. Kozmik Yaratım ve Yeryüzünün Düzenlenmesi (Cosmic Creation & Terrestrial Architecture)
Gerekçe: Yaratılış destanlarında Kayra Han'ın emriyle yeryüzünü tanzim eden, insanlara ateşi, kurban sunmayı ve yaşam bilgisini öğreten yüce kurucu güçtür.
Açıklama: Yalnızca fiziksel varlıkları değil, sosyal ve dini kanunları (Töre) ilahi katmandan indirmiştir. Kaos halindeki dünyayı düzenli bir kozmosa dönüştürmüştür.

3. Şimşek, Gök Gürültüsü ve Işık Manipülasyonu (Supreme Atmospheric & Light Dominion)
Gerekçe: Elinde tuttuğu yıldırım kırbacı ve çakmak taşlarıyla karanlık güçleri ve Erlik'in yeryüzündeki ifritlerini yakıp yok eder; güneş ışığını yeryüzüne yönlendirir.
Açıklama: Gök hadiselerinin mutlak efendisidir; ışık ve pozitif enerji dalgalarıyla karanlık boyutsal varlıkları tek vuruşta defeder.

4. Erlik Han ile Ezeli Kozmik Mücadele (Cosmic Counter-Weight to Erlik)
Gerekçe: Erlik Han yeraltının karanlığını temsil ederken, Ülgen göklerin ve iyiliğin mutlak kutbudur; şamanların göğe yükseliş ayinlerindeki nihai hedeftir.
Açıklama: Erlik'in yeryüzünü işgal etme ve gökleri taklit etme girişimlerini ilahi yıldırımlarıyla bastırmıştır; evrendeki dualizmin koruyucusudur.

5. Hayat Ağacı ve Kozmik Denge (World Tree & Universal Axis)
Gerekçe: Göbeğinde yeryüzü ile göğü birbirine bağlayan efsanevi Hayat Ağacı (Bay Terek) yükselir; Ülgen bu eksen üzerinden tüm katmanlara can suyu ulaştırır.
Açıklama: Boyutsal katmanlar arasındaki ontolojik bağlantıyı sağlayan kozmik eksenin koruyucusudur.

6. Tier 1-A (Outerverse) Kozmolojik Aşkınlık Temellendirmesi (1-A Justification)
Gerekçe: 16 katlı gök hiyerarşisinin zirvesinde bulunması, 3 boyutlu uzay ve doğrusal zamanın tamamen ötesindeki göksel boyutta var olması ve Erlik Han (1-A) ile eşit kozmik terazide yer alması.
Açıklama: Powerscaling'de tüm uzay-zaman sürekliliklerini aşan 16 katlı aşkın yapının idarecisi olması hasebiyle Ülgen, Türk mitolojisinin en tartışmasız 1-A (Dış-Evren) tanrılarından biridir.`
  },
  {
    name: 'Umay Ana',
    series: 'Altay & Türk Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: 'Low 1-C',
    power_score: 8,
    intelligence_score: 9,
    speed_score: 8,
    durability_score: 9,
    influence_score: 10,
    description: `1. Yaşam, Doğum ve Bereketin İlahi Kaynağı (Cosmic Motherhood & Life Force)
Gerekçe: Orhun Yazıtları'ndan itibaren Türk mitolojisinde kadınların, çocukların ve hayvan yavrularının koruyucusu, yeryüzüne kut ve can bahşeden en yüce ana tanrıçadır.
Açıklama: Canlıların doğum anında bedenlerine can (kut/tin) üfler ve ruh bağını mühürler; varoluşsal yaşam enerjisinin kavramsal idarecisidir.

2. Ak Kanatlı Işık Formu ve Boyutlararası Tezahür (Astral Avian Manifestation)
Gerekçe: Göklerden bembeyaz bir kuğu veya üç boynuzlu beyaz elbiseli nurani bir kadın suretinde yere iner; gök ile yer arasında serbestçe intikal eder.
Açıklama: Maddesel sınırlamalara tabi değildir; saf ışık ve şefkat enerjisinden müteşekkildir.

3. Alkarısı ve Kötü Ruhları Defetme Otoritesi (Chthonic Spirit Nullification)
Gerekçe: Loğusalara ve bebeklere saldıran en tehlikeli yeraltı ifriti Alkarısı'nı (Al Ruhu) gümüş asası ve ilahi aurasıyla anında felç edip kovar.
Açıklama: Karanlık ve habis enerjileri nötralize eden mutlak bir arındırma gücüne sahiptir.

4. Süt Gölü ve Yaşam Ağacı Bağlantısı (Lake of Milk & Celestial Nourishment)
Gerekçe: Göğün üst katlarındaki Süt Gölü'nden getirdiği hayat damlalarıyla çocukları besler; soyun ebediyen devamını temin eder.
Açıklama: Ruhani yenilenme ve biyolojik tükenmezlik bahşeder.

5. Low 1-C Powerscaling Temellendirmesi (Low 1-C Cosmological Justification)
Gerekçe: Göksel katmanlardan 3 boyutlu yeryüzüne müdahale edebilen, yaşam kavramını ontolojik olarak yöneten ve göksel hiyerarşide Ülgen'in yanında anılan ilahi varlık olması.
Açıklama: Biyolojik ölümlülüğün ve zamanın üzerinde bulunması, ruhani koruma alanının tüm Türk soylarını kapsayan boyutsal genişliği sebebiyle Low 1-C aralığında değerlendirilir.`
  },
  {
    name: 'Kızagan Tengri',
    series: 'Altay & Türk Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: '1-A',
    power_score: 10,
    intelligence_score: 8,
    speed_score: 9,
    durability_score: 10,
    influence_score: 9,
    description: `1. 9. Gök Katının Hakimi ve Savaş Tanrısı (God of War & Conquest)
Gerekçe: Altay Türklerinin inancında göğün 9. katında yaşayan, ordulara zafer, savaşçılara cesaret ve yenilmezlik bahşeden kudretli savaş ilahıdır.
Açıklama: Savaş meydanlarındaki tüm şiddet, stratejik hamle ve muharebe enerjisi onun kozmik aurasından beslenir; mağlup edilemez bir yıkım gücüne sahiptir.

2. Al At ve Kızıl Asa (Celestial War Arsenal)
Gerekçe: Kızıl renkli savaş atı üzerinde, elinde göktaşlarından dövülmüş kırmızı bir asa veya kılıçla tasvir edilir; vuruşu dağları yerinden oynatır.
Açıklama: Fiziksel sınırların ötesinde kinetik ve kozmik darbe kuvveti üretir; düşman hatlarını tek bir ilahi hamleyle dağıtır.

3. Savaşçı Ruhunun (Kut) Muhafazası (Martial Invulnerability Bestowal)
Gerekçe: Kendisine kurban sunan alp ve bahadırların bedenini zırh gibi sarar; kılıçların ve okların onları delmesini engeller.
Açıklama: Taraftarlarına kavramsal dayanıklılık ve acı hissetmeme yeteneği bahşeder.

4. 1-A Powerscaling Temellendirmesi (1-A Justification)
Gerekçe: 9. gök katında uzay-zaman sürekliliklerinin üzerinde yer alması, Ülgen'in kudretli oğullarından biri olarak kozmik savaş prensibini yönetmesi.
Açıklama: Kavramsal düzeyde savaşı, fethi ve mutlak fiziki kuvveti temsil etmesi sebebiyle 1-A (Outerverse) hiyerarşisinde yer alır.`
  },
  {
    name: 'Mergen Tengri',
    series: 'Altay & Türk Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: '1-A',
    power_score: 9,
    intelligence_score: 10,
    speed_score: 10,
    durability_score: 9,
    influence_score: 9,
    description: `1. 7. Gök Katının Hakimi ve İlahi Akıl/Bilgelik Tanrısı (God of Wisdom & Omniscience)
Gerekçe: Altay panteonunda göğün 7. katında ikamet eden, her şeyi bilen, gören ve derin felsefi aklı temsil eden bilgelik tanrısıdır.
Açıklama: Evrendeki tüm sırları, yaratılışın matematiksel dengesini ve geçmiş-gelecek olay örgülerini eksiksiz idrak eder (Zeka: 10/10).

2. Karanlığı Delen İlahi Yay ve Ok (Arrow of Absolute Piercing)
Gerekçe: Elindeki beyaz yay ve okla cehaleti, yalanı ve karanlık büyüleri vurarak yok eder; oku hiçbir engel tanımaz.
Açıklama: İllüzyonları, boyutsal kalkanları ve zaman tuzaklarını tek bir atışla delip geçen mutlak isabet yeteneğine sahiptir.

3. Ülgen'in Baş Danışmanı ve Kozmik Stratejist (Supreme Cosmic Architect)
Gerekçe: Yaratılış ve yönetim süreçlerinde Ülgen'e akıl veren, kozmosun yasalarını tanzim eden baş stratejisttir.
Açıklama: Karşı tarafın tüm zihinsel planlarını anında öngörerek boşa çıkarır.

4. 1-A Powerscaling Temellendirmesi (1-A Justification)
Gerekçe: 7. gök katının aşkınlığında bulunması ve yaratılmış bilginin kaynağı olan kavramsal aklı temsil etmesi.
Açıklama: Uzay-zaman sınırlarının ötesindeki evrensel zeka boyutu sebebiyle 1-A kademesinde değerlendirilir.`
  },
  {
    name: 'Gün Ana (Kün Ana)',
    series: 'Altay & Türk Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: 'Low 2-C',
    power_score: 8,
    intelligence_score: 8,
    speed_score: 9,
    durability_score: 8,
    influence_score: 9,
    description: `1. Güneşin ve Yaşam Işığının İlahi Hükümdarı (Goddess of the Sun & Radiant Energy)
Gerekçe: Göğün 7. katında yaşayan, yeryüzüne sıcaklık, hayat ve aydınlık bahşeden, karanlığı kovup yaşamı başlatan yüce güneş tanrıçasıdır.
Açıklama: Milyonlarca derecelik saf plazma ve kozmik ışık enerjisini yönlendirir; tek bir ışık demetiyle karanlık orduları küle çevirir.

2. Gezegensel Biyosferin Yaşam Kaynağı (Biospheric Sustenance)
Gerekçe: Bitkilerin yeşermesi, mevsimlerin döngüsü ve canlıların yaşaması onun lütfuna bağlıdır.
Açıklama: Tüm bir gezegenin biyolojik ve iklimsel dengesini kontrol eder.

3. Low 2-C Powerscaling Temellendirmesi (Low 2-C Justification)
Gerekçe: Güneş sisteminin ve uzay-zaman döngüsünün ışık kaynağı olarak kozmik boyuttaki etkisi.
Açıklama: Gök katmanlarındaki ilahi statüsü ve gezegensel enerji hacmiyle Low 2-C düzeyindedir.`
  },
  {
    name: 'Ay Ata',
    series: 'Altay & Türk Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: 'Low 2-C',
    power_score: 8,
    intelligence_score: 8,
    speed_score: 8,
    durability_score: 8,
    influence_score: 9,
    description: `1. Gecenin, Zaman Döngülerinin ve Ayın Hakimi (God of the Moon & Temporal Cycles)
Gerekçe: Göğün 6. katında ikamet eden, gece karanlığında insanlara yol gösteren, gelgitleri ve ay takvimini yöneten bilge ay tanrısıdır.
Açıklama: Karanlıkta kalan varlıkları gözetir, gece vaktinin gizemli enerjilerini ve zaman döngülerini tanzim eder.

2. Gelgit ve Kozmik Çekim Manipülasyonu (Tidal & Gravitational Dominion)
Gerekçe: Okyanusların kabarmasını, suların çekilmesini ve Dünya'nın gece dengesini kontrol eder.
Açıklama: Yerçekimsel ve boyutsal süzülme kuvvetleriyle devasa kütleleri hareket ettirir.

3. Low 2-C Powerscaling Temellendirmesi (Low 2-C Justification)
Gerekçe: 6. gök katındaki ilahi varlığı ve gezegensel uzay-zaman döngülerini aydınlatma yetkisi.
Açıklama: Kozmik hiyerarşide Gün Ana ile birlikte yeryüzünün göksel dengesini sağlar.`
  }
];

async function insertGods() {
  console.log('Inserting Turkic Mythology Deities...');
  for (const god of TURKIC_GODS) {
    const payload = {
      ...god,
      image_url: '',
      status: 'published'
    };

    const { data: existing } = await supabase.from('characters').select('id').eq('name', god.name).maybeSingle();
    if (existing) {
      const { error } = await supabase.from('characters').update(payload).eq('id', existing.id);
      if (error) console.error(`Error updating ${god.name}:`, error);
      else console.log(`  ✅ Updated: ${god.name} (${god.tier})`);
    } else {
      const { error } = await supabase.from('characters').insert([payload]);
      if (error) console.error(`Error inserting ${god.name}:`, error);
      else console.log(`  🎉 Inserted: ${god.name} (${god.tier})`);
    }
  }
}

insertGods();
