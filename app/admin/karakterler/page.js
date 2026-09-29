'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import AdminGuard from '../../components/AdminGuard';

export const WHEEL_CHARACTERS_BATCH_1 = [
  {
    name: 'Battal Gazi',
    series: 'Battal Gazi Destanı',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 5,
    intelligence_score: 6,
    speed_score: 6,
    durability_score: 7,
    influence_score: 8,
    description: `1. İnsanüstü Fiziksel Güç ve Yıkım Kapasitesi (Superhuman Physical Strength & Wall Level Striking)
Gerekçe: Battal Gazi, kale surlarını, kalın meşe ve demir kapıları tek bir tekme veya omuz darbesiyle kırıp içeri girebilir; devasa kaya bloklarını düşmanlarına fırlatabilir.
Açıklama: Sıradan bir insanın sınırlarını aşan kas gücüne sahiptir. Çarpışmalarda zırhlı Bizans şövalyelerini kalkanlarıyla birlikte metrelerce uzağa fırlatabilir, kalın mermer sütunları kırabilir. Bu durum onu doğrudan Duvar Seviyesi (9-B) vuruş gücüne konumlandırır.

2. İnsanüstü Akrobasi ve Sıçrama Yeteneği (Superhuman Agility & Leap Feats)
Gerekçe: Onlarca metre yükseklikteki kale burçlarından, uçurumlardan ve surlardan hiçbir hasar almadan aşağı atlayabilir; trambolin veya kaldıraç etkisi olmadan tek sıçrayışta 5-6 metre yükseklikteki at sırtına veya sur duvarına çıkabilir.
Açıklama: Yerçekimi kurallarını zorlayan akrobatik becerilere sahiptir. Havadayken yön değiştirebilir, aynı anda birden fazla düşmana döner tekme atabilir ve havada kılıç savurabilir.

3. Refleks ve Ok Savurma Hızı (Subsonic Reaction & Projectile Deflection)
Gerekçe: Kendisine yakın mesafeden atılan okları kılıcıyla havada ikiye bölebilir veya çıplak eliyle yakalayabilir.
Açıklama: Yaydan fırlayan okların hızını (ortalama 60-80 m/s) algılayıp tepki verebilecek ve kılıcıyla havada yakalayabilecek insanüstü refleks hızına (Subsonic Reaction) sahiptir. Çatışmalarda 10-15 okçu aynı anda ateş etse dahi kılıcını döndürerek kalkan benzeri bir savunma bariyeri oluşturur.

4. Aşırı Dayanıklılık ve Acı Eşiği (Extreme Pain Tolerance & Durability)
Gerekçe: Vücuduna saplanan kılıç, hançer ve oklara rağmen bilincini kaybetmeden savaşmaya devam eder; zindanlarda günlerce süren ağır işkencelerden sonra dahi zincirlerini kırabilir.
Açıklama: Ağır kan kaybı, zehirli oklar ve yanık yaraları altında bile fiziksel gücünü kaybetmez. Birçok filminde gözleri kör edilmişken dahi sadece ses duyusuyla düşmanlarını tek tek avlamıştır.

5. Tek Kişilik Ordu ve Askeri Deha (One-Man Army & Master Swordsman)
Gerekçe: Yüzlerce askerden oluşan Bizans ordusunu tek başına yarıp kaleleri tek başına düşürebilir.
Açıklama: Kılıç, mızrak, yay ve gürz kullanımında mutlak ustalık. Karşılaştığı her türlü savaş sanatını anında çözen taktiksel savaş zekası (Battle IQ).`,
    image_url: 'https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media/battal-gazi.jpg',
    status: 'published',
  },
  {
    name: 'Kertenkele (Ziya / Ayyıldızlı Adam)',
    series: 'Kertenkele',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 4,
    intelligence_score: 8,
    speed_score: 7,
    durability_score: 5,
    influence_score: 6,
    description: `1. Üstün Parkur, Tırmanma ve Çatı Akrobasisi (Wall-Crawling & Master Parkour)
Gerekçe: 'Kertenkele' lakabını aldığı gibi, en pürüzsüz dikey duvarlara, gökdelen dış cephelerine ve yüksek çatılara ekipmansız tırmanabilir.
Açıklama: İmkansız dar açılardan tutunarak binalar arasında uçarcasına atlayabilir. Onlarca metre yükseklikten takla atarak hasarsız yere iniş yapabilme yeteneğine sahiptir.

2. Kurşunlardan Sıyrılma ve Akrobatik Kaçış (Acrobatic Bullet Dodging / Subsonic Reflexes)
Gerekçe: Otomatik silahlarla taranırken akrobatik hareketlerle mermilerden sıyrılabilir (aim-dodging ve yakın mesafe refleksleri).
Açıklama: Çevresindeki tehlikeleri önceden sezebilen olağanüstü durumsal farkındalığa ve refleks hızına sahiptir. Polis ve mafya tarafından çevrelendiğinde dahi saniyeler içinde kalabalığın arasından kaybolabilir.

3. Kılık Değiştirme ve Zeka / Aldatma (Master of Disguise & Deception / High Battle IQ)
Gerekçe: İmam (Ziya Hoca), din adamı, komiser, mafya lideri veya güvenlik görevlisi kılığına girerek en yüksek güvenlikli tesisleri ve zekaları kandırabilir.
Açıklama: İleri düzey psikolojik manipülasyon, hızlı analitik düşünme ve doğaçlama taktik üretme kabiliyeti. Düşmanlarının planlarını önceden sezerek onları kendi kurduğu tuzaklara düşürür.

4. Akıncı / Ayyıldızlı Adam Güç Gösterisi (Street Fighter to Wall Level Striking)
Gerekçe: Maskeli kahraman kimliğine büründüğünde organize suç örgütlerini, elit paralı askerleri ve suç çetelerini silahsız yakın dövüşle tek başına etkisiz hale getirir.
Açıklama: Vuruşları kemikleri ve ahşap yapıları kırabilecek güçtedir. Ağır metal eşyaları fırlatabilir ve birden fazla silahlı düşmanı aynı anda silahsızlandırabilir.`,
    image_url: 'https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media/kertenkele.jpg',
    status: 'published',
  },
  {
    name: 'Yamaç Koçovalı',
    series: 'Çukur',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 3,
    intelligence_score: 7,
    speed_score: 5,
    durability_score: 5,
    influence_score: 8,
    description: `1. Taktiksel Çatışma ve Ateşli Silah Ustalığı (Combat Marksmanship & Gun-Kata)
Gerekçe: Çift tabanca ve otomatik silahlarla yakın ve orta mesafede onlarca silahlı düşmanı tek başına etkisiz hale getirebilir.
Açıklama: Çatışma anında çevreyi, siperleri ve mermi açılarını kusursuz hesaplar. Hareket halindeyken ve dönerken bile hedefi ıskalamayan yüksek nişancılık reflekslerine sahiptir.

2. Sokak Dövüşü ve Akrobatik Yakın Muharebe (Street Fighting & Close Quarters Combat)
Gerekçe: Fiziksel olarak kendisinden çok daha iri yarı korumaları, dövüş kulübü savaşçılarını ve sokak çetelerini çıplak elle yere serebilir.
Açıklama: Klasik boks, güreş ve sokak kavgasını birleştiren hızlı ve beklenmedik darbeler vurur. Bıçaklı saldırganlara karşı silahsızlandırma tekniklerinde ustadır.

3. Aşırı Acı Toleransı ve Hayatta Kalma Direnci (Pain Tolerance & Survival Drive)
Gerekçe: Çok sayıda kurşun yarası, bıçak darbesi, patlama şoku ve haftalarca süren ağır psikolojik ve fiziksel travmalardan sonra dahi ayağa kalkabilmiştir.
Açıklama: Vücudunda çok sayıda kurşun yarasıyla çatışmaya devam ettiği sahneler mevcuttur. Adrenalin patlaması yaşadığında acıyı tamamen yok sayarak saldırganın üzerine yürür.

4. Liderlik, Karizma ve Çukur Nüfuzu (Charisma & Clan Influence)
Gerekçe: Çukur mahallesinin ve arkasındaki binlerce insanın mutlak bağlılığını yönetebilir.
Açıklama: İstanbul yeraltı dünyasındaki en güçlü baronlara (Erneteler, Karakuzular, Çağatay Erdenet) karşı kurnaz stratejiler kurmuş, psikolojik savaş yöntemleriyle düşmanlarını içeriden çökertmiştir.`,
    image_url: 'https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media/yamac-kocovali.jpg',
    status: 'published',
  },
  {
    name: 'Kordon Celil',
    series: 'Şefkat Tepe',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 4,
    intelligence_score: 6,
    speed_score: 5,
    durability_score: 6,
    influence_score: 7,
    description: `1. Askeri Eğitim ve Ağır Silah Ustalığı (Special Forces Mastery & Weapon Proficiency)
Gerekçe: Özel Harekat timinin en tecrübeli üyelerinden biridir; Bixi, roketatar, keskin nişancı tüfeği ve el bombaları dahil her türlü askeri envanteri kusursuz kullanır.
Açıklama: Dağ ve kırsal çatışmalarda düşman mevzilerini tek başına susturabilir. Yüzlerce terörist tarafından kuşatıldığında dahi soğukkanlılığını koruyarak taktiksel çıkış yolları bulur.

2. Dağda Hayatta Kalma ve Zorlu Doğa Direnci (Wilderness Survival & Conditioning)
Gerekçe: Eksi derecelerdeki dağ koşullarında günlerce aç ve susuz hayatta kalabilir, karda ve çamurda saatlerce pusu atabilir.
Açıklama: Vücut kondisyonu ve fiziksel direnci standart bir askerin çok üzerindedir. Ağır teçhizatla kilometrelerce koşabilir ve zorlu arazide yorulmaksızın savaşabilir.

3. Sert Yakın Dövüş ve Bıçak Muharebesi (Close Quarters Brutality)
Gerekçe: Askeri yakın savunma ve komando bıçağı tekniklerinde ölümcül düzeydedir.
Açıklama: Düşmanlarını doğrudan etkisiz hale getiren acımasız ve doğrudan hamleler yapar. Fiziksel darbeleri insan kemiklerini kırabilecek sertliktedir.

4. İşkence Dayanıklılığı ve Sarsılmaz İrade (Torture Resistance & Iron Will)
Gerekçe: Düşman eline geçtiğinde uygulanan elektroşok, ağır dayak ve psikolojik işkencelere rağmen hiçbir sır vermemiş, ilk fırsatta zincirlerini kırıp kaçmayı başarmıştır.
Açıklama: Korku eşiği neredeyse sıfırdır. Ölüm tehdidi altındayken dahi düşmanına meydan okuyabilen bir psikolojik dirence sahiptir.`,
    image_url: 'https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media/kordon-celil.jpg',
    status: 'published',
  },
  {
    name: 'Polat Alemdar',
    series: 'Kurtlar Vadisi',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 4,
    intelligence_score: 9,
    speed_score: 5,
    durability_score: 7,
    influence_score: 10,
    description: `1. Üstün Stratejik Deha ve İstihbarat Aklı (Mastermind / Grand Strategy & High Battle IQ)
Gerekçe: Mafya konseylerini, gladyo hücrelerini, küresel örgütleri ve uluslararası istihbarat teşkilatlarını (KGT, Tapınakçılar, CIA) satranç tahtası gibi yöneterek alt etmiştir.
Açıklama: Düşmanının 10 hamle sonrasını görebilen analitik bir beyne sahiptir. Kılık değiştirme, psikolojik harp, algı operasyonları ve devlet yönetimini etkileyen krizleri tek başına yönetir.

2. Keskin Nişancılık, Silah Ustalığı ve Suikast Becerisi (Peak Marksmanship & Combat Mastery)
Gerekçe: Hareket halindeki araçlardan nokta atışları yapabilir; tabanca, uzun namlulu tüfek, roketatar ve patlayıcı düzeneklerini en üst profesyonellikte kullanır.
Açıklama: Çatışma anında hedef şaşırmayan reflekslere sahiptir. Aynı anda birden fazla silahlı keskin nişancıyı saniyeler içinde etkisiz hale getirebilir.

3. Efsanevi Dayanıklılık ve Hayatta Kalma Başarımı (Superhuman-like Resilience & Durability)
Gerekçe: Vücuduna yüzlerce kurşun, şarapnel ve bıçak darbesi almış; helikopter kazasından, denizaltı patlamasından, bombalı saldırılardan ve doğrudan roket atışlarından sağ çıkmıştır.
Açıklama: Kalp ameliyatı esnasında anestezisiz operasyonlara dayanmış, aylarca süren hücre hapsi ve işkencelerden sonra dahi zihinsel berraklığını kaybetmemiştir. Patlama şok dalgalarına karşı gösterdiği direnç onu fiziksel dayanıklılıkta Duvar Seviyesi (9-B) eşiğine taşır.

4. Devasa Sosyopolitik Etki ve Güç Dengesi (Omnipresent Mafia & State Influence)
Gerekçe: Türkiye ve Ortadoğu coğrafyasındaki silah dengelerini, mafya konseylerini ve devletin derin mekanizmalarını tek bir emriyle harekete geçirebilir.
Açıklama: Arkasındaki sadık ekibi (Memati, Abdülhey, Erhan, Cahit) ve devlet istihbaratıyla tüm kurgu evreninin en yüksek 'Etki' (Influence) skoruna (10/10) sahip karakteridir.`,
    image_url: 'https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media/polat-alemdar.jpg',
    status: 'published',
  },
  {
    name: 'Erlik Han',
    series: 'Türk Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: '1-A',
    power_score: 10,
    intelligence_score: 9,
    speed_score: 9,
    durability_score: 10,
    influence_score: 10,
    description: `1. Yeraltı Dünyasının ve Tamu'nun Mutlak Hükümdarı (Supreme Lord of the Underworld / Tamu)
Gerekçe: Altay yaratılış kozmolojisinde yeraltının 9 veya 14 katının tamamı Erlik Han'ın mutlak egemenliği altındadır.
Açıklama: Yeraltı dünyası sadece fiziksel bir mağara veya çukur değildir; canlıların bedenlerinden ayrılan ruhların hapsedildiği, zaman ve mekanın 3 boyutlu evrenden farklı işlediği metafiziksel bir alemdir. Erlik Han bu alemin yaratıcısı ve mutlak hakimidir.

2. Ölüm, Hastalık ve Karanlığın Kaynağı (Embodiment of Death, Darkness & Corruption)
Gerekçe: İnsanlığa ölümü, kötülüğü, karanlığı ve salgın hastalıkları getiren ilahi güç olarak konumlandırılır.
Açıklama: Erlik Han, evrensel dengede Kayra Han'ın yaratıcı ve aydınlık kutbuna karşıt olarak var olan kozmik karanlığın kaynağıdır. Canlıların kaderine hastalıklar, kötülükler ve ölüm yoluyla doğrudan müdahale edebilir (Kavramsal Manipülasyon).

3. Canavarların ve Yeraltı Ordularının Yaratıcısı (Creation of Monstrous & Demonic Entities)
Gerekçe: Yeraltı dünyasında yaşayan devasa yılanlar, canavarlar ve şeytani varlıklar (Körmösler) Erlik Han tarafından yaratılmıştır.
Açıklama: Maddesel ve ruhani formda varlıkları yoktan var etme, onlara can verme ve kendi iradesiyle yönetme gücüne sahiptir.

4. Kozmolojik Aşkınlık ve Kayra Han İle Olan Hiyerarşisi (High Dimensional & Outerverse Scaling)
Gerekçe: Kayra Han tarafından yaratılmış olmasına rağmen, yaratılmış tüm evren katmanlarının, gök katlarının ve fiziki alemlerin üzerinde yer alan primordial (kadim) bir varlıktır.
Açıklama: Altay mitolojisinde hiçbir ölümlü veya sıradan tanrısal varlık Erlik Han'a zarar veremez. O yalnızca Kayra Han'ın ilahi emriyle sınırlandırılabilir. Fiziksel varoluş düzlemlerini aşan ruhani ve kavramsal yapısı sebebiyle Powerscaling standartlarında 1-A / Dış-evren seviyesinde değerlendirilir.`,
    image_url: 'https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media/erlik-han.jpg',
    status: 'published',
  },
  {
    name: 'Azrail (Küçük Kıyamet)',
    series: 'Küçük Kıyamet',
    category: 'Dizi / Film',
    tier: '2-B',
    power_score: 9,
    intelligence_score: 10,
    speed_score: 10,
    durability_score: 10,
    influence_score: 10,
    description: `1. Zamanı ve Mekanı Mutlak Durdurma (Absolute Time Stop & Spacetime Mastery)
Gerekçe: Ölüm anı geldiğinde tüm evrendeki fiziksel hareketi, zaman akışını, araçları, düşen nesneleri ve insanları tek bir saniye bile geçmeden tamamen dondurur.
Açıklama: Üç ve dört boyutlu uzay-zaman sürekliliğine tamamen hakimdir. Olayların akışını durdurup hedef kişiyle dondurulmuş zaman içerisinde konuşabilir, kaderin kaçınılmaz hükmünü bildirir.

2. Metafiziksel Ruh Kabzı ve Boyutlararası Aşkınlık (Soul Manipulation & Dimension Crossing)
Gerekçe: İnsanların ruhlarını fiziksel bedenlerinden tereyağından kıl çeker gibi ayırabilir; fiziksel hiçbir engel (çelik kapılar, derin sığınaklar, mesafeler) onu durduramaz.
Açıklama: Saf metafiziksel ve ilahi bir varlıktır. İnsan yapımı veya evrensel hiçbir fiziksel kuvvet (nükleer patlamalar, kurşunlar, kara delikler) ona etki edemez.

3. Mutlak Bilgi ve Kader İcrası (Omniscience regarding Mortal Fate & Inevitability)
Gerekçe: Her canlının nerede, ne zaman, hangi saniyede öleceğini kesin olarak bilir; onun geldiği an ölüm kaçınılmazdır.
Açıklama: İnsanların sakladığı tüm günahları, sırlar ve pişmanlıkları zihinlerinden okur. Hedefine yaklaşan kaderi ve ahiret vizyonlarını göstererek gerçekliği zihinsel ve boyutsal olarak büker.

4. Çoklu Evren Ölçeğinde Varlık (Cosmic / Multiversal Authority - Tier 2-B)
Gerekçe: Sonsuz sayıda bireyin ve paralel yaşamın ölüm anını eşzamanlı olarak yönetebilen ilahi bir vazifeli konumundadır.
Açıklama: 'Beşinci Boyut' ve 'Küçük Kıyamet' evrenlerinde Hızır ve Haberci Medet ile aynı kozmolojik hiyerarşide yer alır ve fiziksel sınırların ötesinde Tier 2-B olarak ölçeklenir.`,
    image_url: 'https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media/azrail-kucuk-kiyamet.jpg',
    status: 'published',
  },
  {
    name: 'Selena',
    series: 'Selena',
    category: 'Dizi / Film',
    tier: '3-A',
    power_score: 8,
    intelligence_score: 8,
    speed_score: 9,
    durability_score: 8,
    influence_score: 9,
    description: `1. Zaman Manipülasyonu ve Dondurma (Universal Time Manipulation / Time Stop)
Gerekçe: Parmak şıklatması veya zihinsel komutla dünyadaki tüm zaman akışını durdurabilir; bu süre zarfında olayların gidişatını dilediği gibi değiştirir.
Açıklama: Zaman durduğunda insanlar, araçlar ve doğa olayları heykel gibi kalır. Selena bu donmuş zaman içerisinde serbestçe hareket edebilir, cisimlerin yerini değiştirebilir ve zamanı tekrar başlattığında yeni bir gerçeklik yaratabilir.

2. Madde Dönüştürme ve Gerçekliği Bükme (Matter Transmutation & Reality Warping)
Gerekçe: Herhangi bir nesneyi, canlıyı veya maddeyi tamamen farklı bir şeye dönüştürebilir (örneğin insanları eşyaya, taşları altına, yiyecekleri farklı maddelere dönüştürme).
Açıklama: Atomik ve moleküler düzeyin ötesinde kavramsal olarak maddeye hükmeder. Yoktan nesneler var edebilir, ortamın yerçekimini ve hava durumunu anında değiştirebilir.

3. Anlık Işınlanma ve Ses Ötesi Belirme (Teleportation & Summoning Response)
Gerekçe: 'Selena, Selena, Selena' diye el ele tutuşup çağrıldığında gezegenler arası mesafeden (Ütopya gezegeninden Dünya'ya) saniyenin kesirlerinde anında belirebilir.
Açıklama: Uzay-zaman sürekliliğini aşarak anlık teleportasyon yapar. Boyutlar arası geçiş kapıları açabilir ve insanları başka mekanlara ışınlayabilir.

4. Zihin Okuma, Hafıza Silme ve İllüzyon (Mind Reading, Memory Alteration & Illusions)
Gerekçe: İnsanların ve kötü güçlerin zihinlerinden geçen düşünceleri kelimesi kelimesine okuyabilir; tehlikeli olayları insanların hafızasından tamamen silebilir.
Açıklama: Hades gibi karanlık varlıkların büyülerini bozabilir, koruma kalkanları oluşturabilir ve insanları görünmez kılabilir. Sahip olduğu evrensel sihir yetenekleriyle Evren Seviyesi (Tier 3-A) büyü gücüne sahiptir.`,
    image_url: 'https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media/selena.jpg',
    status: 'published',
  },
  {
    name: 'Tarkan',
    series: 'Tarkan Efsanesi',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 5,
    intelligence_score: 7,
    speed_score: 6,
    durability_score: 6,
    influence_score: 8,
    description: `1. İnsanüstü Vahşi Çeviklik ve Akrobasi (Superhuman Agility & Reflexes)
Gerekçe: Bir kurt tarafından büyütülmüş olması sebebiyle vahşi doğanın tüm çevikliğine sahiptir; kayalıklardan, ağaçlardan ve surlardan esnekçe atlayabilir.
Açıklama: İnsan duyularının ötesinde koku alma ve işitme reflekslerine sahiptir. Pusuya düşürülmesi imkansızdır; karanlıkta bile düşmanlarının yerini sezebilir.

2. Zindan Demirlerini Bükme ve Fiziksel Kuvvet (Wall Level Feats / Iron Bending)
Gerekçe: Hapsedildiği zindanların kalın demir parmaklıklarını çıplak elleriyle eğip bükerek kaçabilir; devasa kaya parçalarını yuvarlayabilir.
Açıklama: Standart bir insanın çok üzerindeki kas kuvvetiyle zırhlı Viking ve Roma askerlerini savurabilir, kalın ahşap kapıları kırabilir (Duvar Seviyesi vuruş gücü).

3. Canavarlarla Savaş ve Boyut Dışı Varlıklarla Mücadele (Monster Slaying & Giant Beast Combat)
Gerekçe: Devasa mağara ahtapotu (Dev Ahtapot sahnesi), devler ve vahşi yırtıcılarla tek başına kılıç ve hançeriyle savaşarak onları alt etmiştir.
Açıklama: Kendi cüssesinden onlarca kat büyük yaratıkların zayıf noktalarını anında tespit eden dövüş zekasına (Battle IQ) sahiptir.

4. Sadık Kurt İle Senkronize Savaş (Symbiotic Combat with 'Kurt')
Gerekçe: Sadık kurdu Kurt ile telepatik düzeyde bir bağ ile anlaşır; düşmanları iki koldan şaşırtarak parçalarlar.
Açıklama: Kurt hem bir gözcü hem de ölümcül bir silah gibi çalışır. Tarkan'ın kılıç ustalığı ve kurdun hızı birleştiğinde tüm ordulara karşı tek başına direnebilen bir ikili oluştururlar.`,
    image_url: 'https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media/tarkan.jpg',
    status: 'published',
  },
  {
    name: 'Komutan Logar',
    series: 'G.O.R.A.',
    category: 'Dizi / Film',
    tier: '8-C',
    power_score: 4,
    intelligence_score: 7,
    speed_score: 4,
    durability_score: 5,
    influence_score: 8,
    description: `1. G.O.R.A. Gezegeni İleri Teknolojisi ve Lazer Silahları (Advanced Alien Arsenal & Weaponry)
Gerekçe: G.O.R.A. gezegeni Güvenlik Komutanı olarak yüksek teknolojili plazma ve lazer silahlarına, robotik muhafızlara ve gelişmiş uzay gemilerine sahiptir.
Açıklama: Kullandığı lazer ve enerji silahları kalın metal zırhları, duvarları ve binaları saniyeler içinde eritebilir veya patlatabilir (Bina Seviyesi 8-C yıkım potansiyeli).

2. Holografik Kılık Değiştirme ve Zihin Kontrol Cihazları (Holographic Disguise & Mind Tech)
Gerekçe: Yüzük ve kol cihazları aracılığıyla dilediği kişinin görüntüsüne ve sesine anında bürünebilir (Kupa benzeri cihazlar).
Açıklama: İleri teknolojiyle tasarlanmış aldatma cihazları sayesinde gezegen yönetimini manipüle edebilecek entrikalar kurmuştur.

3. Uzay Filosu ve Taktiksel Komuta Gücü (Fleet Command & Orbital Assets)
Gerekçe: G.O.R.A. uzay üssünün savunma filolarını, uzay gemilerini ve gezegenler arası askeri teçhizatı komuta eder.
Açıklama: Emrindeki askeri birlikler ve uzay gemileri bir şehri veya gezegen yüzeyindeki üsleri uzaydan bombalayabilecek kapasitededir.

4. Bencil ve Acımasız Taktiksel Zeka (Ruthless Cunning & Survival Drive)
Gerekçe: Kendi çıkarları için darbe planlayabilecek, gezegenin en kutsal emanetlerini çalabilecek kadar gözü kara ve entrikacı bir askeri zekaya sahiptir.
Açıklama: Fiziksel olarak sıradan bir insansı uzaylı olsa da, teknolojik donanımı ve emrindeki filoyla kurgu evreninin en tehlikeli teknolojik liderlerinden biridir.`,
    image_url: 'https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media/komutan-logar.jpg',
    status: 'published',
  },
];

function CharacterList() {
  const [characters, setCharacters] = useState([]);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState(null);

  function load() {
    supabase
      .from('characters')
      .select('id, name, series, tier, status, image_url')
      .order('created_at', { ascending: false })
      .then(({ data }) => setCharacters(data || []));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSyncDetailedDescriptions() {
    if (!confirm('Çarktaki 10 karakterin scaling açıklamalarını akademik, detaylı ve uzun formata güncellemek istiyor musun?')) return;
    setImporting(true);
    setMsg('Açıklamalar ve veriler güncelleniyor...');

    try {
      let updatedCount = 0;
      for (const item of WHEEL_CHARACTERS_BATCH_1) {
        const { error } = await supabase
          .from('characters')
          .update({
            description: item.description,
            tier: item.tier,
            power_score: item.power_score,
            intelligence_score: item.intelligence_score,
            speed_score: item.speed_score,
            durability_score: item.durability_score,
            influence_score: item.influence_score,
            status: 'published',
          })
          .ilike('name', `%${item.name.split(' ')[0]}%`);

        if (!error) updatedCount++;
      }

      setMsg(`${updatedCount} karakterin detaylı scaling açıklamaları başarıyla güncellendi!`);
      load();
    } catch (err) {
      setMsg('Hata: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="wrap" style={{ paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Karakter Yönetimi</h1>
          <p style={{ color: 'var(--text-dim)', margin: '4px 0 0', fontSize: '.9rem' }}>
            Toplam <strong>{characters.length}</strong> karakter yayında/taslakta.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn"
            style={{ background: 'linear-gradient(135deg, #e6455b, #e6b325)', color: '#111' }}
            onClick={handleSyncDetailedDescriptions}
            disabled={importing}
          >
            {importing ? 'Güncelleniyor...' : '⚡ Detaylı Scaling Açıklamalarını Güncelle'}
          </button>
          <a href="/admin/karakterler/yeni" className="btn btn-ghost">
            + Yeni Karakter
          </a>
        </div>
      </div>

      {msg && (
        <div className="card" style={{ marginTop: '16px', borderColor: 'var(--accent)', color: 'var(--accent)', fontWeight: 700 }}>
          {msg}
        </div>
      )}

      <div className="grid" style={{ marginTop: '20px' }}>
        {characters.map((c) => (
          <a key={c.id} href={`/admin/karakterler/${c.id}`} className="card">
            <h3>{c.name}</h3>
            <p>{c.series || '—'} · <strong>{c.tier || 'Tier ?'}</strong></p>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="tag">{c.status === 'published' ? 'Yayında' : 'Taslak'}</span>
              {c.image_url ? (
                <span style={{ fontSize: '.75rem', color: '#6fbf73' }}>📷 Fotoğraf Var</span>
              ) : (
                <span style={{ fontSize: '.75rem', color: '#e6455b' }}>⚠️ Fotoğraf Yok</span>
              )}
            </div>
          </a>
        ))}
        {characters.length === 0 && <p style={{ color: 'var(--text-dim)' }}>Henüz karakter eklenmedi.</p>}
      </div>
    </div>
  );
}

export default function AdminCharactersPage() {
  return (
    <AdminGuard>
      <CharacterList />
    </AdminGuard>
  );
}
