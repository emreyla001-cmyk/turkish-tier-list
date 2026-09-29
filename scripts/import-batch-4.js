const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
for (let l of env.split('\n')) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
}

const supabase = createClient(url, key);

const BATCH_4 = [
  {
    name: 'Behmut',
    series: 'Türk & Doğu Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: 'Low 2-C',
    power_score: 10,
    intelligence_score: 5,
    speed_score: 6,
    durability_score: 10,
    influence_score: 8,
    description: `1. Kozmik Taşıyıcı ve Evrenin Temeli (Cosmic Foundation & Mass Suspension)
📌 Gerekçe: Kadim Türk, Altay ve Doğu kozmolojisinde Dünya'nın üzerinde durduğu devasa boynuzlu kozmik öküz/balık varlığıdır; boynuzunun tek bir hareketiyle yeryüzünde depremler meydana gelir.
🔍 Açıklama: Bir gezegenin veya uzay-zaman düzleminin ağırlığını üzerinde taşıyabilecek makro-kozmik fiziki kudrete sahiptir (Low 2-C Seviyesi).

2. Tektonik ve Okyanusal Manipülasyon (Tectonic & Abyssal Cataclysm)
📌 Gerekçe: Kozmik okyanusların derinliklerinde yüzer; kuyruğunu vurduğunda tufanlar, boynuzunu oynattığında kıtasal kırılmalar oluşur.
🔍 Açıklama: Yeryüzü kabuğunu yerinden oynatabilecek tektonik enerji açığa çıkarır.

3. Makro-Kozmik Dayanıklılık (Planetary & Dimensional Durability)
📌 Gerekçe: Varlığı sıradan fiziksel silahlara veya atmosferik etkilere tabi değildir; kainatın alt katmanında varlığını ezelden beri sürdürür.
🔍 Açıklama: Gezegensel kütlelerin baskısına ve uzay boşluğunun sonsuz basıncına tam direnç gösterir.`
  },
  {
    name: 'Zebani',
    series: 'Dini & Metafizik Kurgu',
    category: 'Mitoloji / Efsane',
    tier: '8-B',
    power_score: 8,
    intelligence_score: 6,
    speed_score: 6,
    durability_score: 8,
    influence_score: 7,
    description: `1. Cehennem Azabı ve Ateş Otoritesi (Hellfire & Torment Mastery)
📌 Gerekçe: Gayya kuyularında ve cehennem katmanlarında günahkarlara azap etmekle vazifeli, acımasız ve boyun eğmez metafizik muhafızlardır.
🔍 Açıklama: Sıradan ateşten katbekat sıcak olan cehennem alevlerini ve erimiş madenleri silah olarak kullanır; hedefin ruhuna ve cismine aynı anda azap verir.

2. Devasa Demir Gürzler ve Fiziksel Yıkım Gücü (Heavy Demonic Weaponry)
📌 Gerekçe: Efsanelerde ve metinlerde dağları ufalayabilecek ağırlıkta demir tokmaklar ve gürzler savurdukları rivayet edilir.
🔍 Açıklama: Vurduğu tek bir darbe ile büyük taş yapıları ve şehir bloklarını yerle bir edebilecek kinetik darbe gücüne (Tier 8-B) sahiptir.

3. Metafizik Direnç ve Duygusal Bağışıklık (Intangible & Emotional Immunity)
📌 Gerekçe: Merhamet, acıma veya korku gibi insani duygulardan tamamen yoksundur; dünyevi hiçbir silah (kurşun, bomba) ruhani bedenini yok edemez.
🔍 Açıklama: Sadece ilahi emirlere itaat eder; fiziksel hasarlar karşısında sarsılmaz bir metafizik mukavemete sahiptir.`
  },
  {
    name: 'Mesut Güneri',
    series: 'Arka Sokaklar',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 4,
    intelligence_score: 6,
    speed_score: 4,
    durability_score: 6,
    influence_score: 5,
    description: `1. Özel Harekât Taktik ve Sokak Dövüşü Ustalığı (Special Forces Combat)
📌 Gerekçe: Yıllarca terörle mücadelede özel harekât polisi olarak dağlarda görev yapmış, ardından İstanbul sokaklarında en azılı mafya ve suç şebekelerini çökertmiştir.
🔍 Açıklama: Yakın dövüşte orantısız güç, kaba kuvvet ve doğaçlama nesneler (odun, levye, sandalye) kullanarak birden fazla silahlı saldırganı aynı anda etkisiz hale getirir.

2. İnanılmaz Acı Toleransı ve Ölümden Dönme İradesi (Superhuman Pain Endurance)
📌 Gerekçe: Dizi boyunca onlarca kez vurulmuş, bıçaklanmış, rehin alınmış ve ağır işkencelerden geçmiş, her seferinde hayatta kalarak görevine geri dönmüştür.
🔍 Açıklama: Zirve insan sınırında fiziksel dayanıklılık ve psikolojik inat gösterir; kritik organ yaralanmalarında dahi savaşmaya devam eder.

3. Keskin Nişancılık ve Baskın Taktikleri (Tactical Marksmanship)
📌 Gerekçe: Tabanca, pompalı tüfek ve taarruz tüfekleriyle yüksek isabet oranına sahiptir; kriz anlarında soğukkanlılıkla hedefi tek atışta etkisiz kılar.
🔍 Açıklama: Sokak seviyesi (Tier 9-C) taktik çatışmalarda en tecrübeli kanun adamlarından biridir.`
  },
  {
    name: 'Uzun İhsan Efendi',
    series: 'Puslu Kıtalar Atlası',
    category: 'Edebiyat / Kitap',
    tier: 'High 1-A',
    power_score: 10,
    intelligence_score: 10,
    speed_score: 7,
    durability_score: 10,
    influence_score: 10,
    description: `1. Ontolojik Düş Gücü ve Evrensel Yaratım (Ontological Solipsism & Dream Creation)
📌 Gerekçe: İhsan Oktay Anar'ın başyapıtında Descartes'ın 'Düşünüyorum öyleyse varım' önermesini 'Düşlüyorum, öyleyse düşlediğim her şey var' seviyesine çıkararak tüm Kostantiniyye'yi ve romandaki evreni yatağında uyurken zihninde var eder.
🔍 Açıklama: Düşünce yoluyla tüm evreni, karakterlerin kaderini ve olayların akışını sıfırdan kurgular; fiziksel dünyanın ötesinde ontolojik yaratıcı konumundadır (High 1-A).

2. Puslu Kıtalar Atlası ve Üst-Anlatı Hakimiyeti (Narrative & Meta-Fiction Anchor)
📌 Gerekçe: Bünyamin'in ve romandaki tüm figürlerin yaşadığı maceralar, Uzun İhsan Efendi'nin yazdığı ve zihninde canlandırdığı atlasın sayfalarından ibarettir.
🔍 Açıklama: Kurguyu içeriden değil, varoluşsal bir üst boyuttan manipüle eder; kurgusal hiyerarşide roman evrenini kuşatan metafizik zihindir.

3. Şurup-ı Cihan ve Beden Dışı Seyahat (Astral Projection & Total Clairvoyance)
📌 Gerekçe: Hazırladığı özel uyku iksiriyle bedenini uyutup zihnini yeryüzünün en ücra köşelerinde dolaştırır; görmediği coğrafyaların haritasını santim santim çizer.
🔍 Açıklama: Zihinsel algısı hiçbir sınır, duvar veya mesafe tanımaz (Omniscience Sezgisi).`
  },
  {
    name: 'TheQu',
    series: 'TheQu Evreni',
    category: 'Çizgi Roman / Animasyon',
    tier: '9-A',
    power_score: 6,
    intelligence_score: 7,
    speed_score: 6,
    durability_score: 6,
    influence_score: 5,
    description: `1. Çizgi Dizi Fiziği ve Kaçış Akrobasisi (Cartoon Physics & Agility)
📌 Gerekçe: İnternet animasyon serilerinde absürt kovalamacalardan, tuzaklardan ve yüksekten düşmelerden asgari hasarla kurtulur.
🔍 Açıklama: Karikatürize edilmiş gövde yapısı sayesinde fizik kurallarını esneterek anlık hızlanmalar ve çevik manevralar sergiler.

2. Doğaçlama Tuzaklar ve Teknolojik Düzenekler (Improvised Gadgets & Traps)
📌 Gerekçe: Karşılaştığı tehlikeleri kaba kuvvetle değil, çevredeki malzemeleri birleştirerek kurduğu yaratıcı düzeneklerle bertaraf eder.
🔍 Açıklama: Küçük bina seviyesindeki (9-A) patlamalara ve mekanik tuzaklara zekasıyla yön verebilir.

3. Hızlı Reaksiyon ve Mizahi Zeka (Comic Reaction Speed)
📌 Gerekçe: Beklenmedik saldırılara karşı anında tepki verir, düşmanlarını alaycı zekasıyla manipüle edip hataya zorlar.
🔍 Açıklama: Animasyon mantığıyla çalışan refleksleri insan reflekslerinin oldukça üzerindedir.`
  },
  {
    name: 'Ak Sakallı Dede',
    series: 'Türk Mitolojisi & Masallar',
    category: 'Mitoloji / Efsane',
    tier: '2-B',
    power_score: 9,
    intelligence_score: 10,
    speed_score: 8,
    durability_score: 9,
    influence_score: 10,
    description: `1. İlahi Rehberlik ve Gaipten Yardım (Divine Intercession & Epiphany)
📌 Gerekçe: Türk masallarında ve destanlarında darda kalan kahramanların (Manas, Köroğlu, Battal Gazi) rüyalarında veya en çaresiz anlarında ak sakalıyla aniden belirir.
🔍 Açıklama: Kahramanlara tılsımlı kılıçlar, elmalar veya kerametler hediye ederek kader çizgisini baştan yazar; zaman ve mekanla kısıtlanamaz (Tier 2-B).

2. Ak Dualar ve Kader Mühürleme Kudreti (Blessed Word & Fate Bestowal)
📌 Gerekçe: Ağzından çıkan hayır duası orduları zafere ulaştırır, bedduası ise zalim sarayları yerle yeksan eder.
🔍 Açıklama: Gök Tanrı'nın veya ilahi kudretin dünyadaki saf tezahürüdür; kavramsal kader üzerinde müdahale hakkı bulunur.

3. Zamansızlık ve Ebedi Ruhani Varlık (Immortality & Non-Physical Entity)
📌 Gerekçe: Yüzyıllardır tüm Türk boylarının destanlarında aynı bilge surette yer alır; yaşlanmaz, hastalanmaz ve fiziksel silahlarla öldürülemez.
🔍 Açıklama: Maddi dünyaya bağlı olmayan kutsal bir kılavuz ruhtur.`
  },
  {
    name: 'Osman Hoca',
    series: 'Dabbe Evreni',
    category: 'Dizi / Film',
    tier: '9-A',
    power_score: 6,
    intelligence_score: 8,
    speed_score: 4,
    durability_score: 6,
    influence_score: 6,
    description: `1. Havas İlmi ve Cin Kabilelerini Mühürleme (Exorcism & Havas Mastery)
📌 Gerekçe: Dabbe ve korku serilerinde en tehlikeli cin kabilelerini (Marid, İfrit, Cuhenna) kadim tılsımlar, dualar ve kurşun dökme ritüelleriyle defetmiştir.
🔍 Açıklama: Metafizik enerji dalgalarını yönlendirerek cinlerin yarattığı telekinetik baskıyı ve eşya fırlatmalarını bastırır; metafizik savunma kalkanı oluşturur (Tier 9-A).

2. İllüzyon Kırma ve Hakikati Görme (Illusion Piercing & Clairvoyance)
📌 Gerekçe: Şeytani varlıkların kurbanların zihnine soktuğu halüsinasyonları ve büyüleri tek bir nefesiyle bozar.
🔍 Açıklama: Manevi sezgileri sayesinde varlıkların hangi odada, bedende veya eşyada saklandığını tespit eder.

3. Yüksek Ruhani İrade ve Korkusuzluk (Unshakable Spiritual Will)
📌 Gerekçe: Sıradan insanları delirten paranormal olaylar ve dehşet verici suretler karşısında soğukkanlılığını yitirmeden ayetleri okumaya devam eder.
🔍 Açıklama: Zihinsel ele geçirilmeye (possession) karşı mutlak bir manevi mukavemete sahiptir.`
  },
  {
    name: 'Süper Türk',
    series: 'Süper Türk',
    category: 'Dizi / Film',
    tier: '8-C',
    power_score: 7,
    intelligence_score: 4,
    speed_score: 7,
    durability_score: 8,
    influence_score: 5,
    description: `1. Uzaylı Fizyolojisi ve Bina Seviyesinde Kuvvet (Alien Physiology & Brute Force)
📌 Gerekçe: Bebekken uzay gemisiyle Türkiye'ye düşen ve bir köyde büyüyen Ekrem, yerçekimine ve fizik kurallarına meydan okuyan insanüstü güce sahiptir.
🔍 Açıklama: Arabaları tek eliyle kaldırıp fırlatabilir, beton kolonları yumruklarıyla un ufak edebilir (Bina Seviyesi - Tier 8-C).

2. Süpersonik Uçuş ve Atmosferik Hareket (Flight & Enhanced Speed)
📌 Gerekçe: Dilediği an gökyüzüne fırlayarak şehirler arasında uçabilir; tehlike altındaki insanlara anında yetişir.
🔍 Açıklama: Ses hızına yakın hızlarda manevra yapabilir, gökyüzünde serbestçe süzülebilir.

3. Kurşun Geçirmez Gövde ve Yüksek Dayanıklılık (Bulletproof Durability)
📌 Gerekçe: Ağır makineli tüfek mermileri göğsünden seker; patlamalar ve yüksekten düşmeler ona zarar veremez.
🔍 Açıklama: Vücut dokusu çelikten daha yoğun olup kaba kuvvet darbelerine karşı üst düzey mukavemet gösterir.`
  },
  {
    name: 'Fındık Sabri',
    series: 'Recep İvedik Evreni',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 3,
    intelligence_score: 3,
    speed_score: 4,
    durability_score: 4,
    influence_score: 3,
    description: `1. Agresif Sokak Boksu ve Kavgacılık (Street Brawling)
📌 Gerekçe: Mahalle ve spor salonu ortamlarında gözü kara, kural tanımayan saldırgan bir dövüş tarzına sahiptir.
🔍 Açıklama: Ani kafa ve yumruk darbeleriyle rakiplerini gafil avlamaya çalışır; sokak seviyesi (9-C) bir kavgacıdır.

2. Komedi Evreni Acı Toleransı (Comedic Pain Resilience)
📌 Gerekçe: Şiddetli darbelere ve ezilmelere maruz kalsa da karikatürize komedi mantığıyla kısa sürede ayağa kalkar.
🔍 Açıklama: Sıradan insandan biraz daha yüksek fiziksel darbeye maruz kalma kapasitesi vardır.

3. Psikolojik Tehdit ve Şamata (Intimidation & Bluster)
📌 Gerekçe: Yüksek sesle bağırarak ve tehditler savurarak rakiplerini yıldırmaya odaklanır.
🔍 Açıklama: Dövüşten önce gözdağı vererek psikolojik üstünlük kurmayı hedefler.`
  },
  {
    name: 'Kemal Kükreyen',
    series: 'Kemal Sunal Filmleri',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 4,
    intelligence_score: 6,
    speed_score: 4,
    durability_score: 4,
    influence_score: 7,
    description: `1. Yeraltı Mafya Otoritesi ve Silahlı Çete Yönetimi (Underworld Syndicate Leader)
📌 Gerekçe: Korkusuz Korkak ve klasik Türk sineması mafya dünyasında onlarca silahlı fedaiyi yöneten, racon kesen acımasız bir yeraltı babasıdır.
🔍 Açıklama: Şehirdeki işletmeleri haraca bağlar, suikast emirleri verir ve düşmanlarına karşı organize silahlı baskınlar düzenler (Tier 9-C).

2. Gaddar Karakter ve Korkutma Gücü (Intimidation & Cruelty)
📌 Gerekçe: Adı geçtiğinde rakiplerinin dizlerini titreten bir şöhrete sahiptir; acımasız infaz yöntemleriyle tanınır.
🔍 Açıklama: Rakiplerini psikolojik baskıyla teslim olmaya zorlar.

3. Ateşli Silah ve Suikast Taktikleri (Firearm Usage)
📌 Gerekçe: Tabancasını çekmekten ve doğrudan çatışmaya girmekten çekinmez; kabadayı geleneklerine göre silah kullanır.
🔍 Açıklama: Sokak seviyesindeki mafya hesaplaşmalarında liderlik kabiliyetine sahiptir.`
  },
  {
    name: 'Akıncı Hicabi',
    series: 'Kertenkele',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 5,
    intelligence_score: 6,
    speed_score: 6,
    durability_score: 6,
    influence_score: 6,
    description: `1. Akıncı Mirası ve Zırhlı Sokak Adaleti (Vigilante Combat & Armor)
📌 Gerekçe: Kertenkele'nin yolundan giderek Osmanlı Akıncı geleneğini modern İstanbul sokaklarında canlandırmış, suç çetelerine karşı tek başına savaş açmıştır.
🔍 Açıklama: Özel koruyucu zırhı ve miğferiyle tabanca mermilerine ve bıçaklı saldırılara karşı yüksek direnç gösterir; yakın dövüşte duvar çatlatacak tekmeler savurur (Tier 9-B).

2. Cop ve Yakın Dövüş Sanatları Ustalığı (Martial Arts & Baton Mastery)
📌 Gerekçe: Aldığı yoğun dövüş eğitimiyle aynı anda 10-15 silahlı ve bıçaklı gangsteri copuyla yere serer.
🔍 Açıklama: Akrobatik taklalar, tekme darbeleri ve savunma manevralarıyla suçluları etkisiz hale getirir.

3. Yüksek İnanç ve Adalet Motivasyonu (Moral Fortitude)
📌 Gerekçe: Mahallesini ve mazlumları korumak uğruna canını ortaya koyar; hiçbir tehdit veya pusu karşısında geri adım atmaz.
🔍 Açıklama: Sarsılmaz bir iradeye ve yüksek fiziksel kondisyona sahiptir.`
  },
  {
    name: 'İnek Şaban',
    series: 'Kemal Sunal Evreni',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 3,
    intelligence_score: 5,
    speed_score: 4,
    durability_score: 7,
    influence_score: 7,
    description: `1. Mutlak Şans Manipülasyonu ve Talihe Hükmetme (Absolute Comedic Luck & Causality Defiance)
📌 Gerekçe: Hababam Sınıfı'ndan Şaban Oğlu Şaban'a kadar en ölümcül tuzaklardan, patlayan bombalardan ve mafya kurşunlarından hiçbir yara almadan şans eseri sıyrılır.
🔍 Açıklama: Olayların doğal akışını absürt bir biçimde lehine çeviren doğaüstü bir şans aurasına sahiptir; düşmanları kendi kazdıkları kuyuya düşer.

2. Çizgi Dizi Seviyesinde Fiziksel Dayanıklılık (Toon Force Durability)
📌 Gerekçe: Kafasına inen tencereler, yüksekten yuvarlanmalar ve ağır dayaklar karşısında sadece sersemler, kalıcı hiçbir fiziksel hasar almaz.
🔍 Açıklama: Komedi evreninin getirdiği elastik dayanıklılık sayesinde ölümcül darbeleri mizahi bir sıyrıkla atlatır (Tier 9-C).

3. Safdil Zeka ve Kaos Yaratan Doğaçlama (Unpredictable Chaos & Fool's Wisdom)
📌 Gerekçe: Saflığı ve absürt mantığı sayesinde en dahi hırsızları, hafiyeleri ve dolandırıcıları farkında bile olmadan alt eder.
🔍 Açıklama: Karşı tarafın planlarını öngörülemez davranışlarıyla tamamen çökertir.`
  }
];

async function insert() {
  console.log('Inserting Batch 4 (12 characters)...');
  for (const c of BATCH_4) {
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
