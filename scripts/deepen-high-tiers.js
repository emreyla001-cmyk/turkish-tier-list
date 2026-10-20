const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
for (let l of env.split('\n')) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
}

const supabase = createClient(url, key);

const DETAILED_CHARACTERS = [
  {
    name: 'Erlik Han',
    tier: '1-A',
    description: `1. Primordial Karanlık ve Yaratılış Öncesi Varlık (Primordial Co-Existence)
Gerekçe: Altay ve Sibirya yaratılış destanlarında (özellikle Radloff ve Verbitskiy derlemelerinde) Erlik Han, evrenin ve yeryüzünün yaratılışından önce var olan sonsuz su üzerinde Kayra Han ile birlikte uçan ilk ve ezeli varlık olarak aktarılır.
Açıklama: Erlik Han, sonradan yaratılan bir varlık veya fiziksel bir yaratık değildir. Kozmosun kuruluşundan önceki primordial kaos döneminde mevcuttur; bu ontolojik konumu onu yaratılmış uzay-zaman sürekliliğinin başlangıcından önceye yerleştirir.

2. Yeraltı Dünyasının 9 Katlı Kozmolojik Hiyerarşisi (Sovereign of the 9 Chthonic Realms)
Gerekçe: Şamanist kozmolojide göğün 17 veya 9 katına mukabil, yerin altında da 9 katlı karanlık bir kozmik hiyerarşi bulunur ve Erlik Han bu 9 yeraltı katının mutlak tek hakimidir.
Açıklama: Erlik, 9. yeraltı katında parıltısız güneşin ve ayın bulunduğu, katran denizleri (Toybadım) ve demir sarayıyla çevrili ayrı bir ontolojik alem yönetir. Bu alan fiziksel dünyanın basit bir alt tabakası değil, varoluşsal olarak ayrı bir boyutsal uzamdır.

3. İnsanın Yaratılışındaki Kozmik Pay ve Biyolojik Kirlenme (Anthropogenesis & Soul Corruption)
Gerekçe: Yaratılış efsanesinde Kayra Han insanı çamurdan yaratıp ruh ararken, Erlik Han araya girerek insanın bedenine kendi soluğunu ve kusurlarını üfler.
Açıklama: Erlik Han yalnızca dışsal bir düşman değil, yaşayan tüm biyolojik insanların doğasındaki açgözlülük, öfke ve ölüm kavramının kurucu mimarlarından biridir. İnsan türünün ontolojik kaderine doğrudan kavramsal müdahalede bulunmuştur.

4. Ölüm, Entropi ve Ruh Tutuculuk Otoritesi (Conceptual Embodiment of Mortality & Entropy)
Gerekçe: Canlıların ömrü tükendiğinde ruhlarını (Süne/Sür) yeraltına çekmekle görevli ölüm elçileri (Körmözler) Erlik'in mutlak emrindedir; canlıların canını alma hakkı kozmik antlaşmalarla ona verilmiştir.
Açıklama: Erlik Han, Türk-Altay kozmolojisinde yok oluşun, biyolojik çürümenin ve ölümün kavramsal cisimleşmesidir. Kavramsal bir otoriteye sahip olduğu için fiziksel hasarlarla yok edilemez.

5. Sahte Gök Katları Yaratma Kudreti (Cosmic Counterfeiting & Parallel Creation)
Gerekçe: Destanlarda Erlik, Kayra Han'ın gök kubbesini kıskanarak kendi göğünü, kendi güneşini ve yıldızlarını yaratmış, bu sahte evren o kadar büyümüştür ki Kayra Han müdahale edip onu yıkmak zorunda kalmıştır.
Açıklama: Yoktan var etme ve paralel kozmik yapılar inşa etme gücüne sahiptir. Bir evren modelini taklit edip kendi ilahi mekanını kurabilmesi, kudretinin yerel bir varlığın fersah fersah ötesinde olduğunu kanıtlar.

6. Demir Kazık, Katran Denizi ve Kozmik Mekanlar (Chthonic Megastructure Mastery)
Gerekçe: Sarayının kapısında katran nehri akar ve üzerinden kıl kadar ince bir köprü geçer; yeraltı katmanlarındaki demir kazıklar kainatın alt dengesini tutar.
Açıklama: Makro-kozmik yapılar üzerinde egemenlik kurar; evrenin alt katmanlarındaki varoluşsal yerçekimini ve ruhlar hapishanesini tek başına sevk ve idare eder.

7. Kayra Han Tarafından Sürgün ve Dış-Evrensel Ayrışma (Cosmic Banishment & Outerversal Domain)
Gerekçe: Kayra Han ile giriştiği güç mücadelesi sonucunda yeryüzünden kovulmuş, yerin altındaki dipsiz karanlığa hapsedilmiştir; ancak orada bağımsız bir krallık kurmuştur.
Açıklama: Kayra Han'ın mutlak ilahi iradesine boyun eğmiş olsa da, evrenin zıtlık dengesini (iyi/kötü, aydınlık/karanlık) tamamlayan asli kurucu unsurdur. Kayra Han'ın varlığı aydınlığı temsil ederken Erlik karanlığın mutlak kutbudur.

8. Körmözler ve Karanlık Ruhlar Ordusu (Lord of Chthonic Legions)
Gerekçe: Dokuz oğlu ve dokuz kızı ile birlikte sayısız yeraltı ifriti ve canavarı onun emrinde hareket eder.
Açıklama: Evrenin görünmeyen metafizik dengesini sarsabilecek büyüklükte bir ruh ordusuna hükmeder; şamanların ayinlerinde en çok korkulan ve rüşvet verilen varlıktır.

9. Tier 1-A (Outerverse) Seviyesi İçin Kozmolojik Yorum (Tier 1-A Interpretive Argument)
Gerekçe: Yaratılış öncesinde var olması, 9 katlı aşkın yeraltı boyutunun mutlak kurucusu olması ve insanlığın ölüm kavramını ontolojik olarak yönetmesi.
Açıklama: Modern powerscaling sisteminde Tier 1-A (Dış-Evren), uzay-zaman sürekliliklerini, boyut sınırlarını ve fiziksel evren katmanlarını kavramsal olarak aşan varlıklar için kullanılır. Erlik Han, yaratılmış 3D/4D evrenin fizik kurallarına tabi olmaması, primordial varlığı ve kozmik zıtlık prensibinin kurucusu olması hasebiyle Türk kozmolojisinin 1-A kademesindeki en temel figürü olarak yorumlanır.`
  },
  {
    name: 'Uzun İhsan Efendi',
    tier: 'High 1-A',
    description: `1. Kartezyen Solipsizmin Ontolojik Aşımı (Transcendence of Solipsism)
Gerekçe: İhsan Oktay Anar'ın Puslu Kıtalar Atlası romanında René Descartes'ın (Rendekar) 'Cogito ergo sum' (Düşünüyorum, öyleyse varım) ilkesini radikal biçimde genişleterek 'Düşlüyorum, öyleyse düşlediğim her şey var' kozmolojisini inşa eder.
Açıklama: Uzun İhsan Efendi için dış dünya bağımsız bir fiziksel gerçeklik değil, doğrudan kendi zihninin ürettiği bir rüya ve yanılsamadır. Bu felsefi ve kurgusal temel, onu roman evreninin içinde bir karakter olmaktan çıkarıp, tüm varoluşu zihninde tutan mutlak bilinç konumuna taşır.

2. Evrenin Bir Düşten İbaret Oluşu (The Universe as a Mental Construct)
Gerekçe: Romanda anlatılan Kostantiniyye, Yeniçeriler, dervişler, padişahlar ve oğlu Bünyamin'in yaşadığı tüm serüvenler, Uzun İhsan Efendi'nin yatağında uyurken gördüğü bir düşten ibarettir.
Açıklama: Fiziksel evrenin tüm maddesi, uzay-zaman sürekliliği ve içerisindeki milyarlarca insanın kaderi, İhsan Efendi'nin zihinsel nöronlarının bir ürünüdür. Rüyadan uyandığı veya düş kurmayı bıraktığı anda tüm evren ontolojik olarak yokluğa karışır.

3. Üst-Anlatı ve Kurgusal Hiyerarşiyi Aşma (Meta-Narrative Dominance & Reality Overwrite)
Gerekçe: Uzun İhsan Efendi, romanın sonunda bizzat kendi yazdığı 'Puslu Kıtalar Atlası' kitabını oğlu Bünyamin'e bırakır; Bünyamin kitabı okuduğunda aslında babasının zihninde bir kurgu olduğunu ve yaşadığı her şeyin önceden yazıldığını idrak eder.
Açıklama: Kurgusal bir evrenin içindeki bir varlığın, o evrenin tamamını bir alt-düzlem (fictional layer) olarak üretmesi, powerscaling terminolojisinde 'Reality-Fiction Transcendence' (Gerçeklik-Kurgu Aşkınlığı) olarak tanımlanır.

4. Şurup-ı Cihan ve Beden Dışı Sonsuz Bilinç (Non-Corporeal Omnipresent Mind)
Gerekçe: Hazırladığı gizemli şurubu içerek bedenini uykuya yatırır; bilinci ise yeryüzünün, denizlerin ve göklerin üzerinde sınırsızca dolaşarak dünyanın henüz keşfedilmemiş kıtalarını haritalandırır.
Açıklama: Mekansal mesafeler, kapalı kapılar veya atmosferik engeller onun bilincini kısıtlayamaz; fiziksel bedenine hapsolmamış, mekansız bir zihinsel algı gücüne sahiptir.

5. Determinizm ve Kaderin Zihinsel İcrası (Cognitive Determinism & Authorial Fate)
Gerekçe: Romandaki tüm casusluk savaşları, Efrasiyab'ın oyunları ve cinayetler İhsan Efendi'nin atlasında harfiyen yer alır; karakterlerin yapacağı tercihler zaten onun düşünde belirlenmiştir.
Açıklama: Nedensellik yasaları (Causality) İhsan Efendi'yi bağlamaz; bilakis nedensellik onun rüyasının mantıksal örgüsünden türer.

6. Varlığın Yoklukla Eşdeğerliği Paradoksu (Void & Reality Paradox)
Gerekçe: 'Dünya bir düştür, evet ama düşleyen kim?' sorusuyla kendi varlığını dahi sorgulayarak varoluşun en derin metafizik paradokslarını çözer ve kabullenir.
Açıklama: Sonsuz geriye giden bilinç katmanlarının farkında olması, onu metafizik kavrayışta 10/10 mutlak zeka seviyesine ulaştırır.

7. High 1-A Kurgusal-Ontolojik Aşkınlık Yorumu (High 1-A Cosmological Justification)
Gerekçe: Uzun İhsan Efendi'nin roman içerisindeki konumu, tüm 3 boyutlu ve 4 boyutlu gerçekliği bir rüya simülasyonu olarak zihninde üretmesi ve bu gerçekliğin niteliksel olarak tamamen üzerinde bulunmasıdır.
Açıklama: Powerscaling sistemlerinde bir evreni, zamanı ve tüm boyutları salt bir 'düş / kurgu' olarak aşan ve onu yoktan vareden bilinçler High 1-A (Yüksek Dış-Evren) hiyerarşisinde değerlendirilir. Kayra Han'ın mitolojik yaratıcı aşkınlığına benzer şekilde, Uzun İhsan Efendi de edebi-felsefi düzlemde varoluş katmanlarını aşan Türk kurgusundaki en yüksek zihinsel otoritedir.`
  },
  {
    name: 'Karabasan',
    tier: 'Low 1-C',
    description: `1. Soyut Kabus Anatomisi ve 5. Boyut Düzlemi (5th-Dimensional Nightmare Topology)
Gerekçe: Samanyolu 'Beşinci Boyut' külliyatında ve Türk halk inanışlarında Karabasan, fiziksel maddeden ve biyolojik organlardan tamamen bağımsız, insanların uyku ile uyanıklık arasındaki eşik boyutunda var olan metafiziksel bir varlıktır.
Açıklama: Üç boyutlu uzayın fiziksel kanunlarına tabi değildir. Duvarlar, çelik kasalar veya mesafe sınırlamaları onun hareketini engelleyemez; 3D/4D uzay-zaman sürekliliğine dışarıdan, yüksek boyutsal bir koordinattan müdahale eder.

2. Kavramsal Vicdan Parazitliği ve Günah Enerjisi (Conceptual Guilt Parasitism)
Gerekçe: Gücü doğrudan hedefin taşıdığı suçluluk, ihanet, zulüm ve vicdan azabı gibi soyut ahlaki kavramlardan beslenir; kendini 'uykunun ve gafletin sonu' olarak tanımlar.
Açıklama: Bir düşmanın fiziksel kuvveti ne kadar devasa olursa olsun, ruhundaki ahlaki zafiyet ve vicdan yükü Karabasan için tükenmez bir enerji kaynağına dönüşür. Varlığı biyolojik değil kavramsal seviyede işler.

3. Boyutsal Çöküş ve Motor Sinir Felci Projeksiyonu (Multi-Dimensional Paralysis)
Gerekçe: Kurbanının üzerine çöktüğü anda hedefin 3 boyutlu dünyadaki hareket kabiliyetini, ses tellerini ve nefes alıp vermesini anında kilitler; kurban hiçbir fiziksel direnç gösteremez.
Açıklama: Uyguladığı basınç yerçekimsel değil, boyutsal bir ağırlıktır; kurbanın bilincini zaman-mekan algısının dışına iterek zihinsel bir karadelik içine hapseder.

4. Fiziksel Hasara Karşı Mutlak Bağışıklık (Total Intangibility & Non-Physical State)
Gerekçe: Ateşli silahlar, nükleer patlamalar veya kılıç darbeleri akışkan gölgesine temas dahi edemez; maddesel bir kütlesi yoktur.
Açıklama: Sadece metafiziksel ve ruhani araçlarla (dua, tövbe, vicdanın arınması) defedilebilir; bu durum ona fiziksel evren sınırları içinde tam bir yenilmezlik sağlar.

5. Low 1-C (Düşük Karmaşık Çoklu Evren) Powerscaling Temellendirmesi (Low 1-C Justification)
Gerekçe: 3 boyutlu uzay ve 4 boyutlu zaman akışını aşan, Beşinci Boyut mekaniğinde çalışan ve insan zihnini farklı bir boyutsal uzama çekebilen bir kabus antitesi olması.
Açıklama: Standart bir evren modelinden 1-2 boyutsal kademe daha yüksek bir düzlemden (5D) varlık göstererek ölümlülerin gerçekliğini manipüle etmesi, modern tiering sisteminde Low 1-C (5D Karmaşık Çoklu Evren) aralığında sınıflandırılmasına temel oluşturur.`
  }
];

async function update() {
  console.log('2-A ve üzeri karakterler derinleştiriliyor...');
  for (const item of DETAILED_CHARACTERS) {
    const { error } = await supabase.from('characters').update({
      description: item.description,
      tier: item.tier
    }).eq('name', item.name);

    if (error) {
      console.error(`Error updating ${item.name}:`, error);
    } else {
      console.log(`✅ ${item.name} (${item.tier}) Kayra Han standardında derinleştirildi!`);
    }
  }
}

update();
