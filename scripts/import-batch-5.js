const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
for (let l of env.split('\n')) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
}

const supabase = createClient(url, key);

const BATCH_5 = [
  {
    name: 'Davaro',
    series: 'Kemal Sunal Evreni',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 3,
    intelligence_score: 6,
    speed_score: 4,
    durability_score: 5,
    influence_score: 5,
    description: `1. Kan Davası Taktikleri ve Sahte Ölüm Kurnazlığı (Deception & Feigned Death)
📌 Gerekçe: Hırcı Ali ve Sülo ile olan ölümcül kan davasında, mezarda diri diri yatma ve sahte cenaze planlarıyla tüm köyü ve düşmanlarını parmağında oynatır.
🔍 Açıklama: Ölümcül pusulardan ve kan davalarından keskin zekası, kamuflajı ve tiyatro yeteneği sayesinde sıyrılır (Tier 9-C).

2. Çifte ve Tabanca Kullanımı (Marksmanship & Ambushes)
📌 Gerekçe: Dağlarda ve köy arazisinde av tüfeği ve tabancayla çatışmalara girer.
🔍 Açıklama: Siper alma ve panik anında isabet kaydetme konusunda kurnazca manevralar yapar.

3. Hayatta Kalma İnadı ve Yüksek Şans (Survival Instincts)
📌 Gerekçe: Eşkıya baskınları, hapis tehditleri ve kurşun yağmurlarından sağ salim çıkmayı başarır.
🔍 Açıklama: Beklenmedik koşullara anında adapte olabilen halk kahramanı reflekslerine sahiptir.`
  },
  {
    name: 'Vartolu Sadettin (Salih Koçovalı)',
    series: 'Çukur',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 4,
    intelligence_score: 7,
    speed_score: 5,
    durability_score: 6,
    influence_score: 8,
    description: `1. Sokak Çatışması ve İkili Tabanca Ustalığı (Dual-Wielding Gunmanship)
📌 Gerekçe: Çukur sokaklarında ve depolarda onlarca silahlı mafya fedaisini tek başına çapraz ateşe alarak biçmiştir.
🔍 Açıklama: Seri şarjör değişimi, siper geçişleri ve nokta atışı kabiliyetiyle sokak seviyesi (Tier 9-C) çatışmaların en tehlikeli aktörlerindendir.

2. Psikolojik Savaş ve Liderlik Karizması (Psychological Warfare & Menace)
📌 Gerekçe: 'Mihriban' türküsü eşliğinde düşmanlarının mekanını basarak korku salar; kendine sadık geniş bir çete ordusunu sevk ve idare eder.
🔍 Açıklama: Soğukkanlılığı ve beklenmedik taktik hamleleriyle rakiplerinin moralini sıfıra indirir.

3. Yüksek Acı Toleransı ve Yaralanma Direnci (Pain Suppression)
📌 Gerekçe: Dizi boyunca ağır kurşun yaralanmaları, bıçak darbeleri ve linç girişimlerine rağmen kısa sürede ayağa kalkmıştır.
🔍 Açıklama: İntikam arzusu ve aile bağıyla beslenen yüksek bir fiziksel dayanıklılığa sahiptir.`
  },
  {
    name: 'Ergun Plak',
    series: 'Seksenler',
    category: 'Dizi / Film',
    tier: '10-B',
    power_score: 2,
    intelligence_score: 6,
    speed_score: 3,
    durability_score: 3,
    influence_score: 5,
    description: `1. Retorik Cambazlığı ve İkna Kabiliyeti (Charisma & Persuasion)
📌 Gerekçe: Çınaraltı mahallesinde en karmaşık aşk krizlerini, borç meselelerini ve esnaf kavgalarını etkileyici konuşmaları ve edebiyatıyla çözer.
🔍 Açıklama: Standart insan sınırında (Tier 10-B) zihinsel ve sosyal etkiye sahiptir; insanları kelimelerle manipüle etme yeteneği yüksektir.

2. Müzik Hafızası ve Kültürel Arşiv (Encyclopedic Music Knowledge)
📌 Gerekçe: Dönemin yerli ve yabancı tüm plaklarını, şarkı sözlerini ve sanatçı biyografilerini ezbere bilir.
🔍 Açıklama: Kültürel bilgi birikimi ve arşivcilik zekası üst düzeydedir.

3. Hızlı Kaçış ve Mahalle Çevikliği (Evasion)
📌 Gerekçe: Fehmi Bey veya Ahmet'in gazabından kurtulmak için dükkanının arka kapısından veya ara sokaklardan anında sıvışır.
🔍 Açıklama: Fiziksel çatışmalardan tamamen kaçınan, diplomatik veya kaçış odaklı bir hayatta kalma tarzı vardır.`
  },
  {
    name: 'Akıncı Fatih',
    series: 'Akıncı',
    category: 'Dizi / Film',
    tier: '9-A',
    power_score: 6,
    intelligence_score: 8,
    speed_score: 6,
    durability_score: 7,
    influence_score: 7,
    description: `1. Yüksek Teknoloji Balistik Zırh ve Ekipman (Advanced Exosuit & Armor)
📌 Gerekçe: Özel alaşımlı zırhı ağır makineli tüfek mermilerine, şarapnellere ve yakın patlamalara karşı tam koruma sağlar; gece görüşü ve hedef takip sistemleri içerir.
🔍 Açıklama: Küçük bina seviyesindeki (9-A) patlamalardan sağ çıkar ve darbe enerjisini soğurur.

2. Kadim Akıncı Savaş Sanatı ve Kılıç Ustalığı (Ottoman Martial Arts & Swordsmanship)
📌 Gerekçe: Geleneksel kılıç, hançer ve okçuluk eğitimini modern taktik yakın dövüşle harmanlayarak uluslararası paralı asker birliklerini tek başına etkisiz hale getirir.
🔍 Açıklama: İnsanüstü refleksler ve kusursuz yakın dövüş tekniğiyle birden fazla zırhlı hedefi aynı anda alt eder.

3. Yüksek Hızlı Akıncı Motosikleti ve Hareket Kabiliyeti (Tactical Mobility)
📌 Gerekçe: Özel zırhlı motosikletiyle binalar arasından atlayabilir, dar sokaklarda ses hızına yakın manevralar yapabilir.
🔍 Açıklama: Şehir içinde yüksek taktik intikal ve kaçış avantajına sahiptir.`
  },
  {
    name: 'Çirkin Cadı',
    series: 'Keloğlan Masalları',
    category: 'Çizgi Roman / Animasyon',
    tier: '8-C',
    power_score: 7,
    intelligence_score: 7,
    speed_score: 6,
    durability_score: 6,
    influence_score: 7,
    description: `1. Dönüştürme Büyüsü ve İksir Simyası (Transmutation & Potions)
📌 Gerekçe: Kazanında kaynattığı zehirli iksirler ve büyü asasıyla insanları taşa, kurbağaya veya hayvanlara dönüştürebilir; dev saray kapılarını büyülü sözlerle eritebilir.
🔍 Açıklama: Madde yapısını büyüsel olarak değiştirir; bina ölçeğinde (Tier 8-C) çevresel yıkım yaratabilecek kara büyü enerjisi açığa çıkarır.

2. Uçan Süpürge ve Havadan Saldırı (Flight & Aerial Bombardment)
📌 Gerekçe: Sihirli süpürgesiyle gökyüzünde rüzgar hızında süzülür, dağların zirvesine saniyeler içinde ulaşır.
🔍 Açıklama: Düşmanlarına havadan zehirli gazlar, alev topları ve büyü yıldırımları yağdırır.

3. Kristal Küre ve Kehanet Algısı (Clairvoyance & Scrying)
📌 Gerekçe: Sihirli küresi sayesinde Keloğlan ve arkadaşlarının nerede olduğunu, Bilgecan Dede'nin hangi iksiri hazırladığını uzaktan izler.
🔍 Açıklama: Geniş alanlı casusluk ve uzaktan algılama yeteneğine sahiptir.`
  },
  {
    name: 'Sıran Kaya',
    series: 'Yeşilçam & Türk Sineması',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 5,
    intelligence_score: 4,
    speed_score: 4,
    durability_score: 6,
    influence_score: 5,
    description: `1. Kaya Gibi Gövde ve Yıkıcı Yumruk Gücü (Brute Force & Heavy Punches)
📌 Gerekçe: Cüssesi ve devasa kollarıyla vurduğu tek yumrukla ahşap masaları, tuğla duvarları parçalar ve rakiplerini metrelerce uzağa fırlatır.
🔍 Açıklama: Duvar seviyesinde (Tier 9-B) saf kaba kuvvete ve kemik kırıcı darbe gücüne sahiptir.

2. Darbe Emilimi ve Çelikten İskelet (Impact Absorption)
📌 Gerekçe: Kafasında kırılan şişeler, sandalyeler ve sopa darbeleri ona vız gelir; acıyı hissetmeden saldırıya devam eder.
🔍 Açıklama: Vücut kütlesi ve yoğun kas yapısı sayesinde kaba kuvvet darbelerine yüksek direnç gösterir.

3. Yakın Mesafe Boğuşma ve Meydan Dövüşü (Brawling & Grappling)
📌 Gerekçe: Meydan kavgalarında 5-10 kişiyi aynı anda havaya kaldırıp savurabilen bir cüsseye sahiptir.
🔍 Açıklama: Sokak ve han kavgalarında ezici bir fiziksel üstünlük kurar.`
  },
  {
    name: 'Karakaçan (Eşek)',
    series: 'Türk Halk Masalları',
    category: 'Çizgi Roman / Animasyon',
    tier: '9-C',
    power_score: 4,
    intelligence_score: 5,
    speed_score: 5,
    durability_score: 6,
    influence_score: 4,
    description: `1. Efsanevi Çifte Tekmesi ve Savunma Kinetiği (Devastating Donkey Kick)
📌 Gerekçe: Masallarda ve çizgi serilerde arkasından yaklaşan kurtları, eşkıyaları ve hırsızları tek bir çifte darbesiyle metrelerce havaya uçurur.
🔍 Açıklama: Arka bacak kaslarının kinetik patlaması insan kemiklerini kırabilecek ve tahta kapıları devirebilecek güçtedir (Tier 9-C).

2. Masalsı Dayanıklılık ve İnat Gücü (Legendary Endurance & Stubbornness)
📌 Gerekçe: Günlerce susuz ve aç dağ yollarını aşabilir, ağır yükleri yorulmadan taşır; yürümek istemediğinde hiçbir güç onu yerinden kıpırdatamaz.
🔍 Açıklama: Fiziksel yorgunluğa karşı doğaüstü bir mukavemete ve yerçekimine meydan okuyan bir dengeye sahiptir.

3. Tehlike Sezgisi ve Sadakat (Danger Intuition)
📌 Gerekçe: Uçurumlara, bataklıklara veya pusu kurulan patikalara adım atmaz; sahibini (Keloğlan / Hoca) yaklaşan tehlikelere karşı anırarak uyarır.
🔍 Açıklama: Keskin koku ve işitme duyularıyla doğal erken uyarı sistemidir.`
  },
  {
    name: 'Kubat 30 Şubat',
    series: 'Alemin Kıralı',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 4,
    intelligence_score: 3,
    speed_score: 4,
    durability_score: 5,
    influence_score: 5,
    description: `1. Kontrolsüz Öfke ve Komedi Şiddeti (Berserk Rage & Absurd Aggression)
📌 Gerekçe: En ufak bir lafa veya yanlış anlamaya anında parlayarak çevresindeki eşyaları, masaları ve kapıları kırıp döker.
🔍 Açıklama: Adrenalin patlaması anında acı hissetmeden saldırır; sokak seviyesi (Tier 9-C) yıkım gücüne ulaşır.

2. Komedi Evreni Cezalarından Sağ Çıkma (Comedic Resilience)
📌 Gerekçe: Eşi Nihale ve kayınvalidesi Asalet Hanım tarafından tava, merdane ve terliklerle dövülse de birkaç saniye sonra hiçbir yara almamış gibi ayağa kalkar.
🔍 Açıklama: Çizgi film benzeri fiziksel dayak kaldırma kapasitesine sahiptir.

3. Mahalle Tehdidi ve Gözdağı (Neighbourhood Intimidation)
📌 Gerekçe: Kendine has konuşması ve tehditkar tavırlarıyla mahalle esnafını ve komşularını sindirir.
🔍 Açıklama: Kaba kuvvet ve tehdit üzerine kurulu bir otoriteye sahiptir.`
  },
  {
    name: 'Alp Er Tunga (Barba Tunga)',
    series: 'Türk Destanları',
    category: 'Mitoloji / Efsane',
    tier: '8-C',
    power_score: 8,
    intelligence_score: 8,
    speed_score: 6,
    durability_score: 8,
    influence_score: 9,
    description: `1. Destansı Hakan Kudreti ve Ordu Yarma Gücü (Legendary Warlord Mastery)
📌 Gerekçe: Saka Türklerinin efsanevi hakanı, Firdevsi'nin Şehname'sinde 'Efrasiyab' adıyla anılan, İran ordularını defalarca hezimete uğratan dev savaşçıdır.
🔍 Açıklama: Tek bir kılıç savuruşuyla zırhlı süvari hatlarını yarar; vuruşları kale kapılarını sarsacak kinetik kuvvettedir (Bina Seviyesi - Tier 8-C).

2. Doğaüstü Kurt ve Pars Ruhunun Tezahürü (Totemic Beast Physiology)
📌 Gerekçe: Adı 'Alp' (yiğit), 'Er' (erkek) ve 'Tunga' (yırtıcı pars/kaplan) kelimelerinden gelir; yırtıcı bir parsın reflekslerine ve aslan yüreğine sahiptir.
🔍 Açıklama: Yorgunluk bilmeyen ciğer kapasitesi ve çelikten kas yapısıyla günlerce süren meydan muharebelerinde en önde çarpışır.

3. Stratejik Deha ve Bozkır Taktikleri (Grand Strategist)
📌 Gerekçe: Hilal taktiği ve sahte ricat manevralarını ustalıkla uygulayarak kendisinden katbekat kalabalık imparatorluk ordularını tuzağa düşürmüştür.
🔍 Açıklama: Bozkır askeri doktrininin kurucu dehasıdır.`
  },
  {
    name: 'Uzman Ağa',
    series: 'Yerli Aksiyon Kurgusu',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 4,
    intelligence_score: 6,
    speed_score: 4,
    durability_score: 5,
    influence_score: 7,
    description: `1. Bölgesel Aşiret Otoritesi ve Koruma Gücü (Feudal Clan Leader)
📌 Gerekçe: Yüzlerce silahlı adamı, geniş arazileri ve konakları kontrol eden, kanunların dahi çekindiği nüfuzlu bir yerel güç merkezidir.
🔍 Açıklama: Kendi bölgesinde tek bir emriyle sokakları kapatıp çatışma çıkarabilecek teşkilatlanmaya sahiptir (Tier 9-C).

2. Ağır Arazi Şartlarında Pusu ve Silah Hakimiyeti (Guerrilla Warfare)
📌 Gerekçe: Kalaşnikof ve tabancaları arazide ustalıkla kullanan muhafızlarıyla rakiplerine pusu kurar.
🔍 Açıklama: Bölge coğrafyasını santim santim bilerek savunma ve saldırı avantajı sağlar.

3. Racon Kesme ve Psikolojik Baskı (Bloodline Feud Leadership)
📌 Gerekçe: Masada düşmanlarının canını veya malını tek bir sözle alabilecek feodal mahkeme otoritesine sahiptir.
🔍 Açıklama: Geleneksel kabile adaleti ve silah gücünü harmanlar.`
  },
  {
    name: 'Alşimist',
    series: 'Keloğlan Masalları',
    category: 'Çizgi Roman / Animasyon',
    tier: '8-C',
    power_score: 7,
    intelligence_score: 8,
    speed_score: 5,
    durability_score: 6,
    influence_score: 6,
    description: `1. Element Simyası ve Madde Dönüşümü (Elemental Alchemy & Transmutation)
📌 Gerekçe: Antik formülleri kullanarak metalleri birbirine dönüştürür, patlayıcı barut tozları ve erimez zırh alaşımları imal eder.
🔍 Açıklama: Kimyasal reaksiyonları büyüsel simyayla birleştirerek binaları çökertebilecek patlamalar ve sis perdeleri oluşturur (Tier 8-C).

2. Mekanik ve Büyülü Düzenekler (Alchemical Mechanisms)
📌 Gerekçe: Laboratuvarında kurduğu hidrolik asansörler, otomatik tuzaklar ve basınçlı kimyasal silahlarla davetsiz misafirleri bertaraf eder.
🔍 Açıklama: Taktik tuzak ve alan kontrolünde üst düzey uzmanlığa sahiptir.

3. Zihinsel Analiz ve Formül Dehası (Scientific Intellect)
📌 Gerekçe: Bilgecan Dede'nin iksirlerinin kimyasal formülünü dakikalar içinde çözerek karşı panzehirler üretebilir.
🔍 Açıklama: Bilimsel kavrayış ve formülasyon zekası 8/10 seviyesindedir.`
  },
  {
    name: 'Lord Turoc',
    series: 'Keloğlan Masalları',
    category: 'Çizgi Roman / Animasyon',
    tier: '8-B',
    power_score: 8,
    intelligence_score: 8,
    speed_score: 7,
    durability_score: 8,
    influence_score: 8,
    description: `1. İleri Uzay Teknolojisi ve Enerji Topları (Advanced Plasma Weaponry)
📌 Gerekçe: Galaktik imparatorluk teknolojisine sahip uzay zırhı ve bastonundan yüksek yoğunluklu plazma patlamaları fırlatır; taş kaleleri ve şehir bloklarını yerle bir edebilir.
🔍 Açıklama: Şehir bloğu seviyesinde (Tier 8-B) doğrudan tahribat gücüne sahiptir.

2. Robotik Ordu Komutanlığı ve Hava Gemileri (Drone & Mech Armada)
📌 Gerekçe: Emrindeki mekanik robot orduları ve zırhlı hava filolarıyla köyleri ve şehirleri dakikalar içinde kuşatıp teslim alır.
🔍 Açıklama: Teknolojik kuşatma ve askeri işgal kapasitesi tüm krallığı tehdit eder.

3. Enerji Kalkanı ve Zırh Direnci (Forcefield & Exoskeleton)
📌 Gerekçe: Çevresinde oluşturduğu kuvvet alanı sayesinde gülle, ok ve kılıç darbeleri ona yaklaşamadan havada infilak eder.
🔍 Açıklama: Ağır kinetik ve patlayıcı hasarlara karşı neredeyse tam dokunulmazlık sağlar.`
  }
];

async function insert() {
  console.log('Inserting Batch 5 (12 characters)...');
  for (const c of BATCH_5) {
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
