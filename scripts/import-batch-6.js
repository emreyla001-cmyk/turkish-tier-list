const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
for (let l of env.split('\n')) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
}

const supabase = createClient(url, key);

const BATCH_6 = [
  {
    name: 'Gulyabani',
    series: 'Türk Korku & Edebiyatı',
    category: 'Mitoloji / Efsane',
    tier: '9-B',
    power_score: 5,
    intelligence_score: 5,
    speed_score: 4,
    durability_score: 6,
    influence_score: 6,
    description: `1. Devasa Boyut ve Doğaüstü Korku Aurası (Supernatural Dread & Size)
📌 Gerekçe: Hüseyin Rahmi Gürpınar romanı ve Ertem Eğilmez sinema uyarlamasında geceleri konakları basan, boyu ağaçlara ulaşan, tüylü ve devasa pençeli bir hortlak/cin efsanesidir.
🔍 Açıklama: Görüldüğü anda insanları dehşete düşürerek felç eder; kapıları ve pencereleri tek vuruşta parçalayacak kaba kuvvete sahiptir (Tier 9-B).

2. Çevresel Korku ve Gece Manipülasyonu (Nocturnal Presence & Stealth)
📌 Gerekçe: Gecenin zifiri karanlığında, sisler ve garip ulumalar eşliğinde aniden ortaya çıkar.
🔍 Açıklama: Geniş arazilerde sessizce hareket ederek hedeflerini köşeye sıkıştırır.

3. Fiziksel Direnç ve Efsanevi Dayanıklılık (Cryptid Physiology)
📌 Gerekçe: Üzerine atılan taşlar, sopalar ve sıradan saldırılar kalın kürkü ve iri cüssesi karşısında etkisiz kalır.
🔍 Açıklama: Halk masallarında ve edebiyatta ölümsüz bir çöl/gece yaratığı olarak anılır.`
  },
  {
    name: 'Wizard Yılmaz',
    series: 'G.O.R.A. Evreni',
    category: 'Dizi / Film',
    tier: '8-C',
    power_score: 6,
    intelligence_score: 8,
    speed_score: 5,
    durability_score: 6,
    influence_score: 6,
    description: `1. Uzay Teknolojisi ve İllüzyon Cihazları (Holographic Reality & Gadgets)
📌 Gerekçe: G.O.R.A. gezegeninde gelişmiş uzay cihazlarını sihirbazlık numaraları gibi sergiler; yerçekimini manipüle eder ve optik yanılsamalar oluşturur.
🔍 Açıklama: İleri bilim ve gösteri sanatını harmanlayarak düşmanlarının algısını tamamen bozar (Tier 8-C).

2. Enerji Silahları ve Plazma Deşarjı (Plasma Blast)
📌 Gerekçe: Asasından ve bilekliğinden çıkardığı lazer ışınlarıyla metal kapıları eritir ve güvenlik droidlerini devre dışı bırakır.
🔍 Açıklama: Bina içi çatışmalarda teknolojik üstünlük kurar.

3. Kurnaz Sahne Zekası ve Dikkat Dağıtma (Stage Craft & Deception)
📌 Gerekçe: Sahne illüzyonisti refleksiyle gardiyanları gafil avlar; imkansız görünen kilitli hücrelerden kaçar.
🔍 Açıklama: Yüksek doğaçlama ve zihinsel çevikliğe sahiptir.`
  },
  {
    name: 'Hamati',
    series: 'Keloğlan Masalları',
    category: 'Çizgi Roman / Animasyon',
    tier: '8-C',
    power_score: 8,
    intelligence_score: 4,
    speed_score: 5,
    durability_score: 8,
    influence_score: 6,
    description: `1. Devasa Taş Yarma Kuvveti (Titan Strength & Crushing Force)
📌 Gerekçe: Keloğlan Masalları'nda devasa cüssesiyle kaya bloklarını tek yumrukla parçalayan, ağaçları kökünden söken güçlü bir savaşçıdır.
🔍 Açıklama: Vurduğu darbeler küçük binaları ve surları yıkabilecek şok dalgaları üretir (Bina Seviyesi - Tier 8-C).

2. Yüksek Kinetik Darbe Emilimi (Dense Skeletal Frame)
📌 Gerekçe: Üzerine düşen kayalardan ve kılıç darbelerinden neredeyse hiç hasar almaz; derisi zırh kadar kalındır.
🔍 Açıklama: Ağır kaba kuvvet saldırılarına karşı üst düzey dayanıklılık sergiler.

3. Alan Savunması ve Boğuşma (Crowd Control)
📌 Gerekçe: Kollarıyla birden fazla muhafızı aynı anda savurup metrelerce fırlatabilir.
🔍 Açıklama: Yakın mesafe ezici güçte meydan hakimiyeti kurar.`
  },
  {
    name: 'Emiray',
    series: 'Emiray',
    category: 'Çizgi Roman / Animasyon',
    tier: '9-B',
    power_score: 5,
    intelligence_score: 8,
    speed_score: 6,
    durability_score: 6,
    influence_score: 6,
    description: `1. Zamanda Yolculuk ve Boyut Kristali (Time Leaping Artifact)
📌 Gerekçe: Kadim Türk tarihine ve fantastik evrenlere geçiş yapabilen gizemli bir zaman küresine/pusulaya sahiptir.
🔍 Açıklama: Geçmiş ile günümüz arasında geçiş yaparak olayların seyrini değiştirebilir (Tier 9-B).

2. Kadim Kılıç Sanatı ve Taktik Akrobasi (Ancient Swordsmanship & Agility)
📌 Gerekçe: Antik savaşçılardan aldığı eğitimle kılıç, kalkan ve yay kullanımında ustalaşmıştır.
🔍 Açıklama: Çevikliği ve akrobatik sıçrayışlarıyla tuzakları aşar, zırhlı düşmanları etkisiz kılar.

3. Mitolojik Şifre Çözme Zekası (Puzzle Solving & Intellect)
📌 Gerekçe: Antik harabelerdeki mekanik bulmacaları, kadim kitabeleri ve gizli tuzakları kısa sürede çözer.
🔍 Açıklama: Tarih, mantık ve strateji kabiliyeti yaşının çok üzerindedir.`
  },
  {
    name: 'Deli Dumrul',
    series: 'Dede Korkut Destanları',
    category: 'Edebiyat / Kitap',
    tier: '9-A',
    power_score: 7,
    intelligence_score: 5,
    speed_score: 6,
    durability_score: 7,
    influence_score: 8,
    description: `1. Destansı Yiğitlik ve Azrail'e Kılıç Çekme Cüreti (God-Defying Audacity & Brawn)
📌 Gerekçe: Dede Korkut anlatılarında kuru çayın üzerine köprü kurup geçenden 33 akçe, geçmeyenden döve döve 40 akçe alan, ölüm meleği Azrail'e dahi kılıç çekip meydan okuyan korkusuz bir Oğuz bahadırıdır.
🔍 Açıklama: İnsanüstü fiziksel kuvvete sahiptir; savurduğu kılıçla taş sütunları ikiye bölebilir, vuruşları küçük bina seviyesinde (Tier 9-A) kinetik sarsıntı yaratır.

2. Yalınkılıç Meydan Muharebesi Ustalığı (Epic Broadsword Mastery)
📌 Gerekçe: Altmış arşınlık devasa mızrakları ve ağır kılıçları tek eliyle savurur; karşısına çıkan hiçbir savaşçı önünde duramaz.
🔍 Açıklama: Bozkır savaş geleneklerinin en vahşi ve dizginlenemez savaşçılarındandır.

3. Sarsılmaz Nefis ve Efsanevi İnat (Unbreakable Will & Defiance)
📌 Gerekçe: Doğaüstü güçler ve ilahi gazap karşısında dahi diz çökmez; canını kurtarmak yerine savaşmayı seçen destansı bir gurura sahiptir.
🔍 Açıklama: Psikolojik korkuya ve metafizik dehşete karşı tam direnç gösterir.`
  },
  {
    name: 'Buzlar Kraliçesi İbyda',
    series: 'Keloğlan Masalları',
    category: 'Çizgi Roman / Animasyon',
    tier: '8-B',
    power_score: 8,
    intelligence_score: 7,
    speed_score: 6,
    durability_score: 8,
    influence_score: 8,
    description: `1. Mutlak Sıfır ve Buzul Krallığı Büyüsü (Absolute Cryokinesis & Frost Domain)
📌 Gerekçe: Bütün bir şehri, nehirleri ve kaleleri dakikalar içinde devasa buz kütlelerine çevirebilir; çevresindeki sıcaklığı dondurucu seviyelere düşürür.
🔍 Açıklama: Şehir bloğu ölçeğinde (Tier 8-B) alan dondurma ve kriyokinetik yıkım gücüne sahiptir.

2. Buz Golemleri ve Savunma Kristalleri (Ice Golems & Crystalline Shields)
📌 Gerekçe: Saf buzdan kırılmaz golemler, kuleler ve dev mızraklar inşa ederek ordulara karşı savunma hattı kurar.
🔍 Açıklama: Saldırıları kristal kalkanlarla yansıtıp karşı taarruza geçer.

3. Buz Tahtı Dokunulmazlığı ve Soğuk Bağışıklığı (Cryo-Regeneration & Immunity)
📌 Gerekçe: Kendi buz sarayında bulunduğu sürece donma veya fiziksel yaralanmalardan etkilenmez; hasar gören bedenini buz kristalleriyle onarır.
🔍 Açıklama: Soğuk tabanlı element manipülasyonunda zirve seviyededir.`
  },
  {
    name: 'Metruk',
    series: 'Türk Korku Sineması',
    category: 'Dizi / Film',
    tier: '9-A',
    power_score: 6,
    intelligence_score: 6,
    speed_score: 7,
    durability_score: 7,
    influence_score: 7,
    description: `1. Poltergeist Telekinezisi ve Ev Yıkma Gücü (Violent Telekinesis & Poltergeist)
📌 Gerekçe: Musallat olduğu terk edilmiş konaklarda mobilyaları, taş duvarları ve ağır demir kapıları havaya uçurarak fırlatır.
🔍 Açıklama: Küçük bina seviyesinde (Tier 9-A) ani telekinetik fırtınalar kopararak kurbanları ezer.

2. Zihinsel Halüsinasyon ve Paranoya Yayma (Psychological Hallucination)
📌 Gerekçe: Mekana giren insanların algılarını bozarak birbirlerini canavar gibi görmelerini sağlar; akıl sağlığını hızla çökertir.
🔍 Açıklama: İnsanları deliliğe sürükleyen zihinsel bir metafizik virüs gibi yayılır.

3. Görünmezlik ve Maddesel Olmayan Form (Intangibility & Invisibility)
📌 Gerekçe: Sıradan gözle görülemez; kameralarda sadece gölge ve parazit olarak belirir.
🔍 Açıklama: Fiziksel darbeler veya ateşli silahlar soyut metafizik formuna temas edemez.`
  },
  {
    name: 'Beşinci Boyut Şeytan (İblis)',
    series: 'Beşinci Boyut',
    category: 'Dizi / Film',
    tier: '2-B',
    power_score: 9,
    intelligence_score: 10,
    speed_score: 9,
    durability_score: 9,
    influence_score: 10,
    description: `1. Kozmik Vesvese ve İrade Manipülasyonu (Universal Temptation & Corruptive Will)
📌 Gerekçe: Hızır'ın ebedi kozmik zıttıdır; Samanyolu TV metafizik evreninde insanların kalplerine ve zihinlerine doğrudan nüfuz ederek onları cinayete, ihanete ve günaha teşvik eder.
🔍 Açıklama: Mekan ve zaman sınırlarına bağlı olmaksızın milyarlarca insan bilincine aynı anda vesvese fısıldayabilir (Kavramsal Çoklu Evren Manipülasyonu - Tier 2-B).

2. Boyutlararası Şekil Değiştirme ve Suret Alma (Avatar Projection & Shapeshifting)
📌 Gerekçe: Zengin bir iş adamı, çekici bir yabancı veya yakın bir dost kılığında tecelli edebilir; 5. boyut ile 3. boyut arasında serbestçe geçiş yapar.
🔍 Açıklama: İnsanların en zayıf arzularını somutlaştırarak gerçekliği bir kabusa çevirir.

3. Soyut Kötülük Varlığı ve Fiziksel Dokunulmazlık (Abstract Evil & Non-Corporeal Immortality)
📌 Gerekçe: Dünyevi hiçbir güç veya silah onu yaralayamaz; ancak samimi bir dua veya tövbe ile geri püskürtülebilir.
🔍 Açıklama: Kötülük kavramı var oldukça yok edilemez metafizik bir ilkedir.`
  },
  {
    name: 'Hades',
    series: 'Selena',
    category: 'Dizi / Film',
    tier: '3-A',
    power_score: 9,
    intelligence_score: 8,
    speed_score: 8,
    durability_score: 8,
    influence_score: 9,
    description: `1. Yeraltı Dünyasının Hakimi ve Cehennem Ateşi (Lord of Underworld & Hellfire)
📌 Gerekçe: Selena evreninde yerin altındaki karanlık boyutun efendisidir; ellerinden fırlattığı cehennem lavları ve alev dalgalarıyla büyücüleri küle çevirebilir.
🔍 Açıklama: Ütopya'nın kozmik dengesini sarsacak evrensel ölçekte (Tier 3-A) karanlık büyü gücüne sahiptir.

2. Ruhları Hapsetme ve Sonsuz İşkence (Soul Trapping & Damnation)
📌 Gerekçe: İnsanların ve perilerin ruhlarını yeraltı zindanlarına zincirleyebilir; hiçbir büyü bu zincirleri kolayca kıramaz.
🔍 Açıklama: Metafizik ruh manipülasyonu ve boyut hapsetme yeteneğinde uzmandır.

3. Selena ve Şoker'e Denk Karanlık Statü (Cosmic Deity Parity)
📌 Gerekçe: Güç seviyesi olarak Selena ve Şoker ile doğrudan boy ölçüşebilir; sadece Yüce Honos'un mutlak kanunlarına boyun eğer.
🔍 Açıklama: Evrensel hiyerarşide en tehlikeli baş kötülerden biridir.`
  },
  {
    name: 'Drakula',
    series: 'Yeşilçam Korku Külliyatı',
    category: 'Dizi / Film',
    tier: '9-A',
    power_score: 6,
    intelligence_score: 8,
    speed_score: 7,
    durability_score: 7,
    influence_score: 7,
    description: `1. Vampirik İnsanüstü Güç ve Duvarda Yürüme (Vampiric Strength & Wall-Crawling)
📌 Gerekçe: 1953 yapımı 'Drakula İstanbul'da' filminde demir parmaklıkları büken, dik duvarlara örümcek gibi tırmanan ve kurbanlarını tek hamlede kaldıran efsanevi kan emicidir.
🔍 Açıklama: Küçük bina seviyesinde (Tier 9-A) kaba kuvvete ve fizik yasalarını büken tırmanma yeteneğine sahiptir.

2. Hipnoz ve Zihinsel Esaret (Hypnotic Gaze & Domination)
📌 Gerekçe: Gözlerinin içine bakan kurbanlarını anında trans haline geçirerek emirlerine itaat ettirir.
🔍 Açıklama: İradeyi felç eden doğaüstü bir telepatik etkiye sahiptir.

3. Sis ve Yarasaya Dönüşme (Mist & Bat Shapeshifting)
📌 Gerekçe: Kilitli pencerelerden ve anahtar deliklerinden sis olarak sızabilir; geceleyin yarasa suretinde uçar.
🔍 Açıklama: Fiziksel engelleri aşma ve hızlı kaçış konusunda vampirik avantajlara sahiptir.`
  },
  {
    name: 'Yeniçeri',
    series: 'Tarihi Aksiyon Kurgusu',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 5,
    intelligence_score: 6,
    speed_score: 5,
    durability_score: 6,
    influence_score: 6,
    description: `1. Ocak Eğitimi ve Pala/Kalkan Ustalığı (Elite Janissary Combat)
📌 Gerekçe: Osmanlı'nın profesyonel elit piyadesi olarak çocukluktan itibaren ağır silah, güreş ve kılıç eğitimi almıştır; savurduğu kavisli pala ile çelik zırhları yarar.
🔍 Açıklama: Duvar seviyesinde (Tier 9-B) vuruş kuvvetine ve mükemmel askeri disipline sahiptir.

2. Meydan Muharebesi ve Çelik İrade (Battlefield Formation & Morale)
📌 Gerekçe: Mehter marşı eşliğinde düşman hatlarına hücum eder; 'Kazan Kaldırma' geleneğiyle padişahları dahi titreten kolektif bir güce sahiptir.
🔍 Açıklama: Ağır yaralara rağmen safları terk etmeyen sarsılmaz bir muharebe dayanıklılığı sergiler.

3. Fitilli Tüfek ve Menzilli Yay Hakimiyeti (Early Firearms & Archery)
📌 Gerekçe: Fitilli tüfekleri ve Türk kompozit yaylarını yüksek isabetle kullanarak düşman süvarilerini menzilde biçer.
🔍 Açıklama: Hem yakın hem uzak muharebede taktik uzmanlığa sahiptir.`
  },
  {
    name: 'Dodo',
    series: 'Kral Şakir',
    category: 'Çizgi Roman / Animasyon',
    tier: '8-C',
    power_score: 5,
    intelligence_score: 5,
    speed_score: 6,
    durability_score: 8,
    influence_score: 5,
    description: `1. Zamanda Sıçrama ve Nesli Tükenmez İnat (Extinction Defiance & Time Glitch)
📌 Gerekçe: Nesli tükenmiş bir dodo kuşu olmasına rağmen çizgi dizi evreninde zaman portallarından fırlayarak maceralara dahil olur.
🔍 Açıklama: Çizgi dizi Toon Force fiziği sayesinde zamanda kırılmalar yaratan komik olayların merkezinde yer alır (Tier 8-C).

2. Çizgi Film Toon Force Dayanıklılığı (Cartoon Invulnerability)
📌 Gerekçe: Dinozor ayakları altında ezilse, meteor çarpsa veya yüksek uçurumlardan düşse bile bir akordeon gibi yaylanıp ayağa kalkar.
🔍 Açıklama: Ölümcül fiziksel travmalara karşı tam çizgi film bağışıklığı vardır.

3. Komik Kaos ve Hızlı Koşu (Absurd Agility)
📌 Gerekçe: Panik anında arkasında toz bulutu bırakacak hızda koşturur; sakarlıklarıyla canavarların dengesini bozar.
🔍 Açıklama: Öngörülemez hareketleriyle rakiplerini şaşırtır.`
  }
];

async function insert() {
  console.log('Inserting Batch 6 (12 characters)...');
  for (const c of BATCH_6) {
    const payload = {
      ...c,
      image_url: '',
      status: 'published'
    };
    const { data: existing } = await supabase.from('characters').select('id').eq('name', c.name).maybeSingle();
    if (existing) {
      const { error } = await supabase.from('characters').update(payload).eq('id', existing.id);
      if (error) console.error(`Error updating ${c.name}:`, error);
      else console.log(`  ✅ Güncellendi: ${c.name} (${c.tier})`);
    } else {
      const { error } = await supabase.from('characters').insert([payload]);
      if (error) console.error(`Error inserting ${c.name}:`, error);
      else console.log(`  🎉 Yeni eklendi: ${c.name} (${c.tier})`);
    }
  }
}

insert();
