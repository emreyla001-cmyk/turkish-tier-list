const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
for (let l of env.split('\n')) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
}

const supabase = createClient(url, key);

const MYTHOLOGY_CHARACTERS = [
  {
    name: 'Gök Tengri (Kök Tengri)',
    series: 'Türk Mitolojisi & Tengricilik',
    category: 'Mitoloji / Efsane',
    tier: 'Tier 0',
    power_score: 10,
    intelligence_score: 10,
    speed_score: 10,
    durability_score: 10,
    influence_score: 10,
    description: `1. Mutlak Varlık ve Şekilsiz Aşkınlık (Formless Omnipresence & Absolute Reality)
Gerekçe: Orhun Yazıtları'nda (Kül Tigin ve Bilge Kağan abideleri) "Üze Kök Tengri, asra yagız yer kılındukda, ekin ara kişi oglı kılınmış" (Üstte mavi gök, altta yağız yer kılındığında, ikisi arasında insanoğlu yaratılmış) ifadesiyle kainatın ve tüm varoluşun tek ve ezeli kurucusu olarak zikredilir.
Açıklama: Gök Tengri, insan veya hayvan suretinde tecessüm etmeyen, hiçbir put veya tapınakla sınırlandırılamayan, sonsuz gök kubbe ile sembolize edilen mutlak ve şekilsiz ilahi zattır. Varlığı mekan ve zamandan tamamen münezzehtir (Tier 0 / Aşkın Yaratıcı).

2. Kozmogonik Kaynak ve Tüm Hiyerarşilerin Üstü (Source of Cosmological Hierarchy)
Gerekçe: Kayra Han, Ülgen, Erlik ve diğer tüm tanrısal varlıklar onun tecellileri, oğulları veya kozmik görevlileri mesabesindedir.
Açıklama: Tüm 17 gök katı, 9 yeraltı katmanı, ruhlar alemi ve fiziki evren onun iradesinin (Buyruk) bir sonucudur. Hiyerarşik olarak hiçbir varlık onun üzerine konulamaz veya onunla kıyaslanamaz.

3. Mutlak İrade ve Kut Bahşetme Otoritesi (Sovereign Mandate & Bestowal of Kut)
Gerekçe: Kağanların tahta çıkması, devletlerin kurulması ve orduların zaferi sadece "Tengri yarlıkaduk üçün" (Tengri buyurduğu için) gerçekleşir. Tengri yüz çevirdiğinde imparatorluklar çöker, felaketler baş gösterir.
Açıklama: Evrendeki tüm siyasi, fiziki ve ahlaki nedenselliğin nihai karar vericisidir; onun iradesine karşı durabilecek hiçbir güç veya kader yoktur.

4. Ebedi ve Zamansız Varoluş (Acausality & Eternal Transcendence)
Gerekçe: Başlangıcı ve sonu olmayan tek varlıktır; evren yok olsa dahi Tengri baki kalır.
Açıklama: Doğrusal zamanın, entropinin ve boyutların ötesindedir; tüm zaman dilimleri onun huzurunda tek bir 'an'dan ibarettir.

5. Sonsuz Göksel Işık ve Yaşamın Koruyucusu (Universal Life & Cosmic Sustenance)
Gerekçe: Güneşin doğuşu, yağmurun yağışı, toprağın yeşermesi ve canlıların nefes alması onun lütfuna bağlıdır; adalet ve törenin mutlak koruyucusudur.
Açıklama: Evrensel dengenin (Töre) bozulmasına izin vermez; zalimleri cezalandırır, mazlumlara güç verir.

6. Şamanik Kozmolojideki Nihai Hedef (Ultimate Zenith of Shamanic Ascent)
Gerekçe: Kamlar (şamanlar) ayinlerinde göğün en yüksek katlarına kadar çıksalar dahi Tengri'nin zatına ulaşamazlar; onun azameti idrak ve algı sınırlarını aşar.
Açıklama: Bilgi ve varlık açısından ulaşılamaz, mutlak aşkın bir zirvedir (Zeka: 10/10).

7. Fiziksel ve Metafiziksel Dokunulmazlık (Absolute Immunity & Omnipotence)
Gerekçe: Şekli, maddesi veya zayıflığı bulunmayan sonsuz bir bilinçtir; evrendeki hiçbir büyü, silah veya kozmik patlama ona tesir edemez.
Açıklama: Varlığı varoluşun kendisiyle eşdeğer olduğu için ontolojik olarak yok edilmesi imkansızdır.

8. Tier 0 (Boundless / Sınırsız) Powerscaling Temellendirmesi (Tier 0 Justification)
Gerekçe: Türk-Altay kozmolojisinin tüm boyut katmanlarını, tanrılarını ve uzay-zaman sürekliliklerini yaratan, hiçbir mantıksal veya fiziksel çerçeveye hapsedilemeyen ezeli ve ebedi Yüce Varlık olması.
Açıklama: Modern powerscaling sisteminde sistemin tüm temellerini aşan, öncesi ve dengi bulunmayan nihai yaratıcı prensipler Tier 0 (Boundless) olarak sınıflandırılır. Gök Tengri, Türk düşünce dünyasının bu zirvedeki mutlak varlığıdır.`
  },
  {
    name: 'Gökbörü (Kök Börü)',
    series: 'Türk Destanları & Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: '8-B',
    power_score: 8,
    intelligence_score: 8,
    speed_score: 9,
    durability_score: 8,
    influence_score: 10,
    description: `1. Gökten İnen Işık ve Kutsal Yol Göstericilik (Celestial Guide & Light Manifestation)
📌 Gerekçe: Ergenekon, Türeyiş ve Oğuz Kağan destanlarında gökten mavi bir ışık hüzmesi içinde inerek darda kalan Türk ordularına yol gösteren, dağları deldiren ve zafer müjdeleyen kutlu bozkurttur.
🔍 Açıklama: Sıradan bir hayvan değildir; göksel bir ışıktan bedenlenmiştir ve orduları yönlendirecek ilahi bir stratejik zekaya sahiptir (Tier 8-B).

2. Doğaüstü Hız, Çeviklik ve Hilal Taktiği (Supersonic Mobility & Pack Mastery)
📌 Gerekçe: Rüzgardan ve fırtınadan daha hızlı koşar; kurt sürüsü stratejisi (Turan/Hilal Taktiği) düşman ordularını çevreleyip imha etmenin ilham kaynağıdır.
🔍 Açıklama: Savaş meydanlarında ses hızını aşan manevralar yapar, pençeleri ve çenesiyle zırhlı süvari birliklerini darmadağın eder.

3. Kutsal Kut Enerjisi ve Manevi Zırh (Aura of Victory & Invincibility)
📌 Gerekçe: Gökbörü'nün uluması dost birliklere korkusuzluk ve savaş azmi aşılar, düşman saflarına ise dehşet salar; bayraklarda kurt başı taşınması bu manevi korumanın simgesidir.
🔍 Açıklama: Yakın çevresindeki savaşçılara kavramsal cesaret ve direnç bahşeder.`
  },
  {
    name: 'Asena (Aşina)',
    series: 'Türk Destanları & Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: '8-C',
    power_score: 7,
    intelligence_score: 8,
    speed_score: 8,
    durability_score: 8,
    influence_score: 10,
    description: `1. Soyun Koruyucusu ve Türeyiş Anası (Mother of the Ashina Clan & Genesis)
📌 Gerekçe: Çin ve Türk kaynaklarındaki Bozkurt efsanesinde, tüm kavmi katledilen ve kolları-bacakları kesilerek bataklığa atılan 10 yaşındaki yaralı Türk çocuğunu kurtarıp emziren ve Göktürk soyunun atası olan dişi kurttur.
🔍 Açıklama: Türk milletinin tarih sahnesinden silinmesini engelleyen, soyu yeniden var eden kutsal bir koruyucu ruhtur.

2. Dağları Aşan Kaçış ve Gizli Vadi Hakimiyeti (Mystic Sanctuary & Terrain Mastery)
📌 Gerekçe: Düşman kralların suikastçilerinden kaçarak Turfan'ın sarp dağlarındaki gizli ve bereketli mağara ovasına sığınmış, orada 10 erkek çocuk doğurmuştur.
🔍 Açıklama: Aşılmaz kayalıkları tırmanma, izini kaybettirme ve düşman takipçilerini gafil avlama konusunda doğaüstü sezgilere sahiptir (Tier 8-C).

3. Efsanevi Dayanıklılık ve Anne Şefkati Kalkanı (Maternal Shield & Resilience)
📌 Gerekçe: Düşman askerlerinin bile karşısında silah bırakıp saygı duyduğu kutsal bir heybete sahiptir; zorlu kış şartlarında yaralı çocuğu etle besleyerek hayatta tutmuştur.
🔍 Açıklama: Yüksek fiziksel direnç ve kutsal ana aurasıyla çevrelenmiştir.`
  },
  {
    name: 'Tulpar',
    series: 'Türk Destanları & Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: '8-C',
    power_score: 7,
    intelligence_score: 7,
    speed_score: 10,
    durability_score: 8,
    influence_score: 8,
    description: `1. Rüzgardan Hızlı Kanatlar ve Atmosferik Uçuş (Supersonic Flight & Winged Steed)
📌 Gerekçe: Manas ve Alpamış destanlarında bahadırların bindiği, kanatlarını sadece karanlıkta açarak uçurumlardan ve denizlerden atlayan, rüzgar hızını aşan efsanevi kanatlı attır.
🔍 Açıklama: Gökyüzünde ses hızının ötesinde manevralar yapabilir; binicisini savaş alanlarından anında tahliye eder veya düşman hatlarının ardına indirir (Tier 8-C).

2. Görünmez Kanatlar ve Mistik Mahremiyet (Invisibility of Celestial Wings)
📌 Gerekçe: Başkurt inanışlarına göre Tulpar'ın kanatlarını hiçbir ölümlü göremez; kanatları görülürse kaybolacağına ve uçamayacağına inanılır.
🔍 Açıklama: Kanatları fiziksel değil ışıktan müteşekkildir; sadece zorlu engelleri aşarken boyutsal bir sıçrama ile tezahür eder.

3. Tanrı Vergisi Sadakat ve Kutsal Sezgi (Divine Loyalty & Intuition)
📌 Gerekçe: Kumuk atasözünde 'Tulpar dünyanın bir başka köşesinde olsa da kendi sürüsünü ve sahibini bulur' denir; sahibinin nerede olduğunu telepatik bir bağla hisseder.
🔍 Açıklama: Pusu ve tehlikeleri önceden sezerek binicisini uçurumlardan ve tuzaklardan korur.`
  },
  {
    name: 'Bürküt (Merküt / Ak Anka)',
    series: 'Altay & Türk Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: '8-A',
    power_score: 9,
    intelligence_score: 8,
    speed_score: 9,
    durability_score: 9,
    influence_score: 8,
    description: `1. Güneşi ve Ayı Örten Devasa Kanatlar (Titan Celestial Eagle & Eclipse Wings)
📌 Gerekçe: Radloff'un kam dualarında 'Sol kanadı ayı örter, sağ kanadı güneşi... Tırnakları bakırdan, gagası buzdan' şeklinde tasvir edilen aslan gövdeli, devasa gök kartalıdır.
🔍 Açıklama: Kanatlarını açtığında gökyüzünü karartan devasa kütleye sahiptir; vurduğu tek bir kanat darbesiyle kasırgalar koparır ve çoklu şehir bloklarını (Tier 8-A) etkisi altına alır.

2. Bakır Tırnaklar ve Buzdan Gaga (Copper Talons & Glacial Beak)
📌 Gerekçe: Bakırdan pençeleriyle dağ kayalarını kavrayıp fırlatabilir, kalın zırhları ve kaleleri paramparça eder.
🔍 Açıklama: Kinetik delme ve ezme gücü kale surlarını çökertecek seviyededir.

3. Göğe Çıkan Şamanların Kılavuzu (Guide of the Celestial Ascent)
📌 Gerekçe: Ayinlerde göğe yükselen kamların ruhuna ilk üç gök katı boyunca yol gösteren ve onları karanlık ruhların saldırısından koruyan kutsal kılavuz kuştur.
🔍 Açıklama: Boyutsal katmanlar arasında seyahat edebilen ve metafizik saldırıları savuşturan kutsal koruma kalkanına sahiptir.`
  },
  {
    name: 'Gezer Han (Abay Geser)',
    series: 'Türk & Moğol Destanları',
    category: 'Mitoloji / Efsane',
    tier: '8-B',
    power_score: 8,
    intelligence_score: 8,
    speed_score: 8,
    durability_score: 9,
    influence_score: 9,
    description: `1. Göksel Akıncı Hakan ve İblis Avcısı (Heaven-Sent Warlord & Demon Slayer)
📌 Gerekçe: Tanrılar tarafından yeryüzündeki kötülükleri, devleri ve canavarları temizlemek için dünyaya gönderilen, babasız doğan mucizevi destan kahramanıdır.
🔍 Açıklama: Yeryüzünü istila eden devasa iblis ordularını tek başına kılıçtan geçirmiştir; darbe gücü şehir bloğu seviyesindeki (Tier 8-B) kaleleri yıkabilir.

2. Yeraltına İniş ve Diriliş Kudreti (Chthonic Descent & Resurrection)
📌 Gerekçe: Halkını kurtarmak için yeraltının karanlık diyarlarına inmiş, ölüp yeniden dirilerek düşmanlarını alt etmeyi başarmıştır.
🔍 Açıklama: Ölüm diyarlarından geri dönebilen ve ölümcül büyülere karşı direnç gösteren mucizevi bir ruhsal bünyeye sahiptir.

3. Doğaüstü Okçuluk ve Yay Hakimiyeti (Master of Divine Archery)
📌 Gerekçe: Adı atıcılıktaki nişan işareti 'Gez'den gelir; fırlattığı oklar dağların arkasındaki hedefleri şaşmadan delip geçer.
🔍 Açıklama: Kilometrelerce uzaktaki devasa canavarların zayıf noktalarını tek bir atışla vurabilir.`
  },
  {
    name: 'Yer-Su Ruhları',
    series: 'Altay & Türk Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: '8-C',
    power_score: 7,
    intelligence_score: 7,
    speed_score: 7,
    durability_score: 8,
    influence_score: 8,
    description: `1. Tabiatın ve Su Kaynaklarının Kutsal Muhafızları (Guardians of Earth and Water)
📌 Gerekçe: Dağların, pınarların, ırmakların, göllerin ve ormanların içinde yaşayan, tabiatın can damarlarını koruyan kutsal doğa ruhlarıdır.
🔍 Açıklama: Çevre ekosistemini anında manipüle edebilir; ırmakları taşırabilir, toprak kaymaları yaratabilir ve su kaynaklarını kurutabilir (Bina Seviyesi - Tier 8-C).

2. Töreye Saygısızlığı Cezalandırma ve Sel Felaketleri (Environmental Retribution)
📌 Gerekçe: Doğayı kirleten, ormanları tahrip eden veya sulara saygısızlık yapan insanları hastalıklar ve su felaketleriyle cezalandırırlar.
🔍 Açıklama: Doğa elementlerini bir silah olarak kullanarak toplu yıkım dalgaları oluştururlar.

3. Maddesel Olmayan Doğa Varlığı (Elemental Intangibility)
📌 Gerekçe: Suyun akışında ve toprağın kokusunda tecelli ederler; doğrudan fiziksel bir bedenleri olmadığından silahlardan etkilenmezler.
🔍 Açıklama: Sadece tabiata saygı ve manevi ritüellerle yatıştırılabilirler.`
  },
  {
    name: 'Alp Eren (Atalar Ruhu)',
    series: 'Türk Destanları & Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: '9-A',
    power_score: 6,
    intelligence_score: 8,
    speed_score: 7,
    durability_score: 7,
    influence_score: 9,
    description: `1. Ataların Koruyucu Ruhu ve Töre Bekçiliği (Ancestral Spirit of the Alperens)
📌 Gerekçe: Türk kültüründe ebediyete göçmüş ulu kahramanların ve erenlerin ruhlarıdır; töreye uyan ve milletini koruyan bahadırların rüyalarına girerek gaipten taktik ve cesaret fısıldarlar.
🔍 Açıklama: Savaşçılara manevi kalkan oluşturur, pusu anlarında erken uyarı sağlar ve ruhani güç katar (Tier 9-A).

2. Bozkır Savaşçısına Kut ve Yenilmezlik İradesi Aşılaması (Martial Morale Projection)
📌 Gerekçe: Savaş meydanlarında tek bir askerin gözünü kırpmadan yüzlerce düşmana hücum etmesini sağlayan destansı cesaretin kaynağıdır.
🔍 Açıklama: Toplu panik ve korku hissini yok eden güçlü bir manevi aura yayarlar.

3. Zamansız Varlık ve Kurt Suretinde Rehberlik (Spectral Transmutation)
📌 Gerekçe: Bazen rüzgar, bazen de bir derviş veya ak saçlı ihtiyar suretinde belirerek kritik dönemeçlerde kılavuzluk ederler.
🔍 Açıklama: Fiziksel bedenleri olmayıp ruhani boyut ile maddi dünya arasında köprü vazifesi görürler.`
  }
];

async function insertAll() {
  console.log('Inserting Mythology Article & Image Characters...');
  for (const c of MYTHOLOGY_CHARACTERS) {
    const payload = {
      ...c,
      image_url: '',
      status: 'published'
    };
    const { data: existing } = await supabase.from('characters').select('id').eq('name', c.name).maybeSingle();
    if (existing) {
      const { error } = await supabase.from('characters').update(payload).eq('id', existing.id);
      if (error) console.error(`Error updating ${c.name}:`, error);
      else console.log(`  ✅ Updated: ${c.name} (${c.tier})`);
    } else {
      const { error } = await supabase.from('characters').insert([payload]);
      if (error) console.error(`Error inserting ${c.name}:`, error);
      else console.log(`  🎉 Inserted: ${c.name} (${c.tier})`);
    }
  }
}

insertAll();
