// Tüm 10 wheel karakterinin DB'deki açıklamalarını akademik formata güncelle
// Aynı zamanda image_url'leri de Supabase storage formatına çek
// Çalıştırma: node scripts/update-descriptions.js

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wgqwizwyftdoxizhrljg.supabase.co',
  'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz'
);

const BASE = 'https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media';

const UPDATES = [
  {
    name: 'Battal Gazi',
    tier: '9-B',
    power_score: 8,
    intelligence_score: 7,
    speed_score: 7,
    durability_score: 8,
    influence_score: 9,
    image_url: `${BASE}/battal-gazi.jpg`,
    description: `1. İnsanüstü Fiziksel Güç (Wall Level Attack Potency)
Gerekçe: Türk sinema tarihinin en ikonik kavgacısı olarak Battal Gazi, sahnelerde onlarca Bizans askerini art arda devirebilmekte; kalın ahşap kapıları ve duvarları omuz darbesiyle kırabilmekte; ağır zırhlı düşmanları tek yumrukta havaya uçurabilmektedir.
Açıklama: Standart bir insanın biyolojik eşiğinin çok ötesinde kinetik enerji üreten bu kas gücü, VS Battles Wiki Tier 9-B (Duvar Seviyesi) sınıflandırmasına tam olarak denk gelir.

2. İnsanüstü Çeviklik ve Akrobasi (Superhuman Agility / Peak Human+ Acrobatics)
Gerekçe: Yüksek kale surlarından ve ağır ahşap merdivenlerden sıçrayarak uzak mesafeye inebilmekte, devlet gece baskınlarında karanlıkta hiç zorlanmadan hareket edebilmektedir.
Açıklama: Sıradan bir insanın yapamayacağı mesafe ve yüksekliklerden inme kapasitesi, en düşük tahminde dahi Peak Human sınırını aşar ve 9-B aralığının üst bandına yaklaşır.

3. Savaş Zekası ve Taktiksel Üstünlük (High Combat IQ / Master Tactician)
Gerekçe: Tek başına kaleye sızdığı, düşman komutanlarını esir aldığı, Bizans ordusunun tuzaklarını pusu kurarak boşa çıkardığı sahneler; yüzyıllar boyunca sözlü gelenekte ve destanlarda aktarılmıştır.
Açıklama: Çok sayıda silahlı düşmana karşı tek bir kılıç ve vücuduyla zafer kazanabilmesi, Üst İnsan+ düzeyinde savaş deneyimine ve situasyonel farkındalığa işaret eder.

4. Karizmatik Liderlik ve Halk Üzerindeki Etki (Social Influence / Intimidation Aura)
Gerekçe: Hem dini hem de siyasi boyutta Anadolu Türk geleneğinin simgesi haline gelmiştir; yüzyıllar boyunca Türk destanları, romanlar, çizgi romanlar ve sayısız film ile dizide yaşamaya devam etmiştir.
Açıklama: Savaş dışı etki puanı tarihi ve kültürel yansımaları nedeniyle son derece yüksektir; bu onu Tier 9-B güç kapasitesinin yanında sosyal/narrative etki açısından da üst sıralara taşır.`,
  },
  {
    name: 'Kertenkele',
    searchName: 'Kertenkele',
    tier: '9-B',
    power_score: 7,
    intelligence_score: 9,
    speed_score: 8,
    durability_score: 7,
    influence_score: 8,
    image_url: `${BASE}/kertenkele.jpg`,
    description: `1. Ajan Seviyesi Dövüş Kapasitesi (Peak Human+ Combat)
Gerekçe: Özel harekat kökenli olan Kertenkele, eğitimli askerlere karşı elleriyle anında üstünlük kurabilmekte, silahsız kaldığında bile çevresindeki nesneleri silah olarak kullanan bir savaş zekasına sahiptir.
Açıklama: Özel kuvvetler düzeyinde yakın dövüş eğitimi ve refleksleri, onu standart insan sınırının üzerine çıkarır; zirve insan+ veya duvar seviyesi vuruş kapasitesine ulaşır (Tier 9-B bandı).

2. Gizlilik ve İnfiltrasyon Uzmanlığı (Master Infiltrator / Stealth Specialist)
Gerekçe: Dizi boyunca devlet tesislerine, korunaklı binalara ve düşman mevzilerine fark edilmeden sızan sahnelerin arka arkaya geldiği gösterilmiştir. Kimlik değiştirme ve iz bırakmama konusunda üst düzey beceriye sahiptir.
Açıklama: Bu beceri seti VS Battles anlamında doğrudan güç tırmanmasına katkıda bulunmasa da, savaş önce başlamadan düşmanı bitirme potansiyeliyle stratejik değerini çarpıcı biçimde artırır.

3. Silah Ustalığı ve Taktiksel Ateş Gücü (Advanced Weaponry & Firearm Proficiency)
Gerekçe: Tabanca, tüfek, bıçak ve patlayıcılarla aynı anda etkin biçimde kullanabilen Kertenkele, dizi boyunca birden fazla silahlı düşmanı kısa sürede etkisiz hale getirmiştir.
Açıklama: Modern ateşli silahların sağladığı yıkım potansiyeli, özellikle patlayıcılar kullanıldığında 9-B ve hatta 9-A sınırını zorlayabilir.

4. Yüksek Zeka ve Analitik Düşünce (High Intelligence / Strategic Analyst)
Gerekçe: Operasyonları sıfırdan kurgulayabilen, karmaşık kurumsal organizasyonları kısa sürede çözebilen ve siyasi planları tersine çevirebilen bir zihni yapısı vardır.
Açıklama: Savaş alanı dışında da karar alma hızı ve bilgi işlem kapasitesi onu olağanüstü seviye zekalı (High Intelligence) sınıfına yerleştirir.`,
  },
  {
    name: 'Yamaç Koçovalı',
    tier: '9-C',
    power_score: 7,
    intelligence_score: 6,
    speed_score: 7,
    durability_score: 7,
    influence_score: 8,
    image_url: `${BASE}/yamac-kocovali.jpg`,
    description: `1. İnsan Zirvesi Dövüş Kabiliyeti (Peak Human Combat)
Gerekçe: Efsane adlı uzun soluklu dizi boyunca Yamaç, çok sayıda profesyonel tetikçi ve eski asker ile baş başa kavga ederek galip çıkmış; yere yıkıldıktan sonra bile ayağa kalkarak savaşmaya devam etmiştir.
Açıklama: Israr kapasitesi ve savaş direnci olağandışı olsa da fiziksel gücü ve hızı Peak Human (zirve insan) sınırında seyreder; bu sınıflandırma onu Tier 9-C ile 9-B arasında konumlandırır.

2. Aşırı Dayanıklılık ve Ağrı Direnci (Superhuman Durability / Pain Tolerance)
Gerekçe: Birden fazla ateşli silah yarasına, ağır darp sahnelerine ve kritik yaralanmalara rağmen mücadeleye devam ettiği gösterilmiştir.
Açıklama: Standart bir insanın savaş dışı kalacağı yaralanmaları atlatabilmesi, dayanıklılık puanını 9-C'nin üst bandına taşır; bazı sahneler 9-B dayanıklılık yorumunu da destekler.

3. Sokak Zekası ve Liderlik (Street Smartness / Organizational Leader)
Gerekçe: Koçovalı ailesinin organizasyonunu yönetmiş, hem iç hem dış tehditlere karşı strateji geliştirmiş ve sadık bir ekip inşa etmiştir.
Açıklama: Karar alma hızı ve kolektif yönetim yeteneği onu standart bir sokak dövüşçüsünün çok ötesine geçirerek narratif etki açısından öne çıkarır.

4. Silah Yetkinliği (Firearm & Melee Weapon Proficiency)
Gerekçe: Hem ateşli silahlarla hem de yakın dövüş silahlarıyla yetkin biçimde savaşmıştır.
Açıklama: Pratik ateş gücü kapasitesi 9-B yıkım potansiyeline ulaşabilmekle birlikte, ham fiziksel eylemleri genellikle 9-C olarak değerlendirilir.`,
  },
  {
    name: 'Kordon Celil',
    tier: '9-C',
    power_score: 6,
    intelligence_score: 8,
    speed_score: 6,
    durability_score: 6,
    influence_score: 9,
    image_url: `${BASE}/kordon-celil.jpg`,
    description: `1. Otorite ve Korku Gücü (Authority & Fear-Based Influence)
Gerekçe: Çevre'nin en nüfuzlu isimlerinden biri olarak Kordon Celil, tek bir sözü veya bakışıyla bir odayı susturabilmekte ve silahlı kişileri geri adım attırabilmektedir.
Açıklama: Fiziksel gücü zirve insan civarında olsa da sosyal, organizasyonel ve psikolojik etkisiyle sahip olduğu gerçek tehdit kapasitesi çarpıcı biçimde artmaktadır.

2. Organize Güce Erişim (Access to Organized Power / Manpower)
Gerekçe: Emrindeki geniş ağ sayesinde silahlı adamları, bilgi kaynaklarını ve maddi kaynakları tek bir karar anında seferber edebilir.
Açıklama: Bu "güç çoğaltıcı" (force multiplier) kapasite, bire bir dövüş kapasitesinin çok ötesinde bir tehdit profili oluşturur.

3. Psikolojik Manipülasyon ve Kurnazlık (Psychological Manipulation & Cunning)
Gerekçe: Rakiplerini birbiriyle savaştırabilen, dedikodular ve yanlış bilgiyle ortamı manipüle edebilen üst düzey zihni bir yapısı vardır.
Açıklama: VS Battles anlamında savaş zekası değerlendirildiğinde, birincil tehdit kategorisi olarak akıl ve manipülasyon öne çıkar.

4. İnsan Zirvesi Yakın Dövüş (Peak Human Close Combat — Veteran)
Gerekçe: Hayatının büyük bölümünü sokaklarda geçiren Celil, elleriyle de etkili biçimde savaşabilmektedir.
Açıklama: Yaş ve deneyim birleşimi onu Peak Human sınıfında konumlandırır; ancak asıl tehdit doğrudan fiziksel kapasitesinden değil, kaynaklarından gelir.`,
  },
  {
    name: 'Polat Alemdar',
    tier: '9-B',
    power_score: 8,
    intelligence_score: 9,
    speed_score: 8,
    durability_score: 8,
    influence_score: 10,
    image_url: `${BASE}/polat-alemdar.jpg`,
    description: `1. Zirve İnsan+ Dövüş Kapasitesi (Peak Human+ / Low Wall Level Combat)
Gerekçe: Kurtlar Vadisi boyunca onlarca silahlı düşmanla tek başına savaşmış, profesyonel askeri ajanları elleriyle etkisiz hale getirmiş ve ağır yaralanmaları görmezden gelerek savaşmaya devam etmiştir.
Açıklama: Sergilenen dayanıklılık, hız ve güç birleşimi, standart Peak Human sınırını aşarak düşük Duvar Seviyesi (Low 9-B) yorumuna kapı aralamaktadır.

2. Taktiksel Dehası ve Operasyonel Planlama (Master Tactician & Operational Genius)
Gerekçe: İstihbarat operasyonlarını sıfırdan planlayan, devlet başkanı düzeyindeki isimlere ulaşan ve uluslararası komplolara tek başına meydan okuyan sahneler dizide defalarca gösterilmiştir.
Açıklama: Taktiksel öngörü ve anlık adaptasyon kapasitesi onu dizi evreni içindeki en zeki operatörler sınıfına yerleştirir.

3. Ateşli Silah Yetkinliği ve Gelişmiş Donanım (Advanced Weaponry Proficiency)
Gerekçe: Yüksek hassasiyetli tüfekler, patlayıcılar, bıçaklar ve özel silahlarla eşit derecede yetkin şekilde kullanabilmektedir.
Açıklama: Ateşli silah kapasitesi 9-B yıkım çıtasını rahatlıkla aşar; patlayıcı kullanıldığında 9-A sınırına yaklaşılabilir.

4. Uluslararası Nüfuz ve Korku Etkisi (Global Influence / Intimidation Aura)
Gerekçe: Türk sinemasının en bilinir ve en çok taklit edilen anti-kahraman figürü olarak Polat Alemdar, devlet içi çevreler ve uluslararası organizasyonlar tarafından tanınan bir isimdir.
Açıklama: Sosyal etki puanı, Türk kurgu evreninin tamamı içinde en yüksek değerlerden birine sahiptir; bu, narratif ölçekte bire bir dövüş kapasitesinin çok ötesinde bir tehdit profili oluşturur.`,
  },
  {
    name: 'Erlik Han',
    tier: '1-A',
    power_score: 10,
    intelligence_score: 10,
    speed_score: 10,
    durability_score: 10,
    influence_score: 10,
    image_url: `${BASE}/erlik-han.jpg`,
    description: `1. Yer Altı Dünyasının Mutlak Hükümdarı (Absolute Ruler of the Underworld)
Gerekçe: Altay ve Türk-Sibirya mitolojisinde Erlik Han, ölülerin ruhlarını muhafaza eden ve tüm yer altı varlıkları üzerinde mutlak otorite sahibi olan ilahi varlık olarak aktarılır.
Açıklama: Ölüm aleminin mutlak hakimi olarak Erlik Han, sıradan fiziksel güç kategorilerinin çok ötesine geçer; kozmolojik bir güç kaynağına sahiptir.

2. Ruh Çalma ve Ölüm Gücü (Soul Manipulation / Death Embodiment)
Gerekçe: Kaynaklara göre Erlik Han, ölmekte olan kişilerin ruhlarına el koyabilmekte ve onları yer altı dünyasına çekebilmektedir.
Açıklama: Ruh üzerindeki kontrol gücü, fiziksel savaş kapasitesinin tamamen dışına çıkarak meta-fiziksel bir etki alanı oluşturur.

3. Karanlık İlahi Varlıklar Üzerindeki Otorite (Command Over Dark Divinities)
Gerekçe: Erlik Han'ın emrinde kötü ruhlar (yabancı / albastı) olduğu aktarılmakta; bu varlıkları insanlığa salmak veya geri çekebilmek gibi güçlere sahip olduğu anlatılmaktadır.
Açıklama: Yüzlerce ilahi varlığı komuta edebilmek, onu ölçek açısından büyük ölçüde bireysel bir savaşçının üzerine taşıyan muazzam bir güç çoğaltıcıdır.

4. Gerçekliği Bozma Kapasitesi — Yeraltı Boyutu İçinde (Reality Manipulation — Underworld Domain)
Gerekçe: Mitolojik anlatılarda Erlik Han'ın yer altı evrenini tamamen kontrol ettiği ve burada doğa yasalarının onun iradesine tabi olduğu aktarılmaktadır.
Açıklama: Kendi egemenlik alanında fizik yaslarının ötesinde bir güce sahip olması, onu sıradan dünya yaslarıyla ölçülemeyen bir kategoriye yerleştirir; bu High 1-A ile 1-A arasında yorumlanabilir.

5. Ölümsüzlük ve Kozmik Kalıcılık (Immortality — Cosmic Permanence)
Gerekçe: Erlik Han, Altay kozmolojisinde insanlar ve diğer varlıklar için geçerli olan doğal ölüm döngüsünün dışındadır.
Açıklama: İlahi varlıklara özgü ölümsüzlük onu standart zarar kavramının dışına çıkarır; yalnızca eşdeğer kozmik düzeydeki varlıklar tarafından tehdit edilebilir.`,
  },
  {
    name: 'Azrail',
    searchName: 'Azrail',
    tier: '2-B',
    power_score: 10,
    intelligence_score: 9,
    speed_score: 10,
    durability_score: 10,
    influence_score: 10,
    image_url: `${BASE}/azrail-kucuk-kiyamet.jpg`,
    description: `1. Ölüm Meleği Kimliği ve Kozmik Statü (Death Angel Cosmic Status)
Gerekçe: Küçük Kıyamet dizisinde Azrail, klasik dini metinlerdeki ölüm meleği konseptini temel alarak tasarlanmıştır; tüm ölümlerin organizasyonundan sorumlu ilahi bir varlıktır.
Açıklama: Bu kozmik statü, Azrail'i basit güçlü-insan kategorisinin tamamen dışına çıkarır; ölüm mekanizması üzerindeki kontrolü gerçek anlamda evrensel ölçektedir.

2. Ruh Toplama ve Ölümün Kontrolü (Soul Harvesting / Death Manipulation)
Gerekçe: Dizi içindeki tüm ölüm olayları onun denetiminde gerçekleşir; zamanı gelmeyen birinin canını alamaz, ancak vakti gelen birini geri çeviremez.
Açıklama: Ölüm üzerindeki bu mutlak kontrol, her türlü fiziksel öldürme yönteminin ötesinde meta-kavramsal bir güç kategorisi oluşturur.

3. Mekandan ve Zamandan Bağımsız Hareket (Spatial / Temporal Independence)
Gerekçe: Dizi boyunca Azrail'in herhangi bir mekana anında ulaşabildiği, duvarlardan ve fiziksel engellerden geçebildiği gösterilmiştir.
Açıklama: Fiziksel mekânın sınırlamalarını aşan bu hareket kapasitesi, eğer kalıcı ve mutlak biçimde söz konusuysa, Sonsuz Hız (Infinite Speed) yorumuna kapı aralayabilir.

4. İlahi Dayanıklılık (Divine Durability / Conceptual Immunity)
Gerekçe: Dizi içinde Azrail'e fiziksel olarak zarar verildiğine dair herhangi bir kanıt bulunmamaktadır; varlığının soyut-ilahi boyutu onu bu tür saldırıların dışında tutar.
Açıklama: Kavramsal düzeyde ölümün kendisiyle özdeşleşmiş bir varlığın yok edilebilmesi için eşdeğer derecede kozmik bir güce ihtiyaç vardır.`,
  },
  {
    name: 'Selena',
    tier: '3-A',
    power_score: 9,
    intelligence_score: 9,
    speed_score: 9,
    durability_score: 9,
    influence_score: 10,
    image_url: `${BASE}/selena.jpg`,
    description: `1. Kozmik Güç ve Yıldız Enerji Kontrolü (Cosmic Power / Star Energy Control)
Gerekçe: Selena dizisinde başkarakter, yıldızların enerjisini bünyesinde barındıran ve bu enerjiyi saldırı, savunma ve iyileştirme amacıyla yönlendirebilen bir karakterdir.
Açıklama: Yıldız ölçeğindeki enerji kontrolü, VS Battles Wiki'de Tier 3-A (Evren Seviyesi) sınıfına denk gelir; gezegen ve galaksi seviyesindeki büyüklükleri doğrudan etkileyen bir güç kapsamıdır.

2. Kozmik Dayanıklılık (Cosmic Durability)
Gerekçe: Karakter, standart fiziksel saldırılara karşı bağışık olan ya da büyük ölçüde direnç gösteren bir koruyucu güç katmanına sahip olarak gösterilmiştir.
Açıklama: Kozmik enerji zırhı, 3-A dayanıklılık standardına uymakta; sıradan savaşçıların saldırılarının üstesinden gelecek biçimde işlev görür.

3. İlahî Hız (Massively Hypersonic+ / FTL Speed — Cosmic Context)
Gerekçe: Kozmik güç taşıyan karakterlerin tipik hız standardı, enerji kullandıkları sahnelerdeki görsel kanıtlarla birlikte ele alındığında, ışık hızı civarında veya üzerinde yorumlanmaktadır.
Açıklama: Yıldız enerjisi kullanan bir karakterin ışık benzeri reaksiyon hızına sahip olmaması kanonik tutarsızlık yaratacağından, hız puanı yüksek tutulmaktadır.

4. Enerji Yansıtma ve Manipülasyon (Energy Projection & Manipulation)
Gerekçe: Dizi boyunca enerji patlamaları, koruyucu alanlar ve iyileştirme ışınları kullanan sahneler gösterilmiştir.
Açıklama: Bu becerilerin dizi evrenindeki ölçeği, geniş alanlara yıkım vurabilecek kapasiteye işaret etmekte ve 3-A sınıflandırmasını desteklemektedir.`,
  },
  {
    name: 'Tarkan',
    tier: '9-B',
    power_score: 8,
    intelligence_score: 7,
    speed_score: 8,
    durability_score: 8,
    influence_score: 8,
    image_url: `${BASE}/tarkan.jpg`,
    description: `1. İnsanüstü Duyular ve Hayatta Kalma Güdüsü (Superhuman Senses & Survival Instinct)
Gerekçe: Çizgi roman ve film versiyonlarında Tarkan'ın olağanüstü koku alma ve işitme reflekslerine sahip olduğu, pusuya düşürülmesinin imkansız olduğu ve karanlıkta bile düşmanlarının yerini sezebileceği gösterilmiştir.
Açıklama: İnsan duyularının ötesinde bu algı kapasitesi, pratik savaşta onu öngörülmez ve sindiren bir hasma dönüştürür.

2. Zindan Demirlerini Bükme ve Fiziksel Kuvvet (Wall Level Feats / Iron Bending)
Gerekçe: Hapsedildiği zindanların kalın demir parmaklıklarını çıplak elleriyle eğip bükerek kaçabilir; devasa kaya parçalarını yuvarlayabilir.
Açıklama: Standart bir insanın çok üzerindeki kas kuvvetiyle zırhlı Viking ve Roma askerlerini savurabilir, kalın ahşap kapıları kırabilir (Duvar Seviyesi vuruş gücü).

3. Canavarlarla Savaş ve Boyut Dışı Varlıklarla Mücadele (Monster Slaying & Giant Beast Combat)
Gerekçe: Devasa mağara ahtapotu (Dev Ahtapot sahnesi), devler ve vahşi yırtıcılarla tek başına kılıç ve hançeriyle savaşarak onları alt etmiştir.
Açıklama: Kendi cüssesinden onlarca kat büyük yaratıkların zayıf noktalarını anında tespit eden dövüş zekasına (Battle IQ) sahiptir.

4. Sadık Kurt İle Senkronize Savaş (Symbiotic Combat with Kurt)
Gerekçe: Sadık kurdu Kurt ile telepatik düzeyde bir bağ ile anlaşır; düşmanları iki koldan şaşırtarak parçalarlar.
Açıklama: Kurt hem bir gözcü hem de ölümcül bir silah gibi çalışır. Tarkan'ın kılıç ustalığı ve kurdun hızı birleştiğinde tüm ordulara karşı tek başına direnebilen bir ikili oluştururlar.`,
  },
  {
    name: 'Komutan Logar',
    tier: '8-C',
    power_score: 6,
    intelligence_score: 8,
    speed_score: 5,
    durability_score: 5,
    influence_score: 8,
    image_url: `${BASE}/komutan-logar.jpg`,
    description: `1. G.O.R.A. Gezegeni İleri Teknolojisi ve Lazer Silahları (Advanced Alien Arsenal & Weaponry)
Gerekçe: G.O.R.A. gezegeni Güvenlik Komutanı olarak yüksek teknolojili plazma ve lazer silahlarına, robotik muhafızlara ve gelişmiş uzay gemilerine sahiptir.
Açıklama: Kullandığı lazer ve enerji silahları kalın metal zırhları, duvarları ve binaları saniyeler içinde eritebilir veya patlatabilir (Bina Seviyesi / 8-C yıkım potansiyeli).

2. Holografik Kılık Değiştirme ve Zihin Kontrol Cihazları (Holographic Disguise & Mind Tech)
Gerekçe: Yüzük ve kol cihazları aracılığıyla dilediği kişinin görüntüsüne ve sesine anında bürünebilir.
Açıklama: İleri teknolojiyle tasarlanmış aldatma cihazları sayesinde gezegen yönetimini manipüle edebilecek entrikalar kurmuştur.

3. Uzay Filosu ve Taktiksel Komuta Gücü (Fleet Command & Orbital Assets)
Gerekçe: G.O.R.A. uzay üssünün savunma filolarını, uzay gemilerini ve gezegenler arası askeri teçhizatı komuta eder.
Açıklama: Emrindeki askeri birlikler ve uzay gemileri bir şehri veya gezegen yüzeyindeki üsleri uzaydan bombalayabilecek kapasitededir.

4. Bencil ve Acımasız Taktiksel Zeka (Ruthless Cunning & Survival Drive)
Gerekçe: Kendi çıkarları için darbe planlayabilecek, gezegenin en kutsal emanetlerini çalabilecek kadar gözü kara ve entrikacı bir askeri zekaya sahiptir.
Açıklama: Fiziksel olarak sıradan bir insansı uzaylı olsa da, teknolojik donanımı ve emrindeki filoyla kurgu evreninin en tehlikeli teknolojik liderlerinden biridir.`,
  },
];

async function run() {
  console.log('🔄 Açıklamalar ve veriler güncelleniyor...\n');
  let ok = 0, fail = 0;

  for (const item of UPDATES) {
    const search = item.searchName || item.name;

    // Find by name (ilike)
    const { data: matches } = await supabase
      .from('characters')
      .select('id, name')
      .ilike('name', `%${search.split(' ')[0]}%`);

    if (!matches || matches.length === 0) {
      console.log(`⚠️  Bulunamadı: ${item.name}`);
      fail++;
      continue;
    }

    // Pick the best match
    const best = matches.find(m => m.name.toLowerCase().includes(search.toLowerCase().split(' ')[0].toLowerCase())) || matches[0];

    const payload = {
      description: item.description,
      tier: item.tier,
      power_score: item.power_score,
      intelligence_score: item.intelligence_score,
      speed_score: item.speed_score,
      durability_score: item.durability_score,
      influence_score: item.influence_score,
      image_url: item.image_url,
      status: 'published',
    };

    const { error } = await supabase.from('characters').update(payload).eq('id', best.id);

    if (error) {
      console.log(`❌ Hata (${best.name}): ${error.message}`);
      fail++;
    } else {
      console.log(`✅ Güncellendi: ${best.name} [${best.id}]`);
      ok++;
    }
  }

  console.log(`\n📊 Sonuç: ${ok} başarılı, ${fail} hatalı`);
}

run().catch(console.error);
