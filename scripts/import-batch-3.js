const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wgqwizwyftdoxizhrljg.supabase.co',
  'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz'
);

const BATCH_3 = [
  {
    name: 'Şoker',
    series: 'Selena',
    category: 'Dizi / Film',
    tier: '3-A',
    power_score: 8,
    intelligence_score: 8,
    speed_score: 8,
    durability_score: 8,
    influence_score: 8,
    description: `1. Karanlık Madde ve Kozmik Büyü Manipülasyonu (Dark Cosmic Magic & Reality Warping)
Gerekçe: Ütopya gezegeninin karanlık büyücüsü olarak Selena'nın zıttı tüm güçlere sahiptir. Nesneleri ve insanları dilediği varlığa dönüştürebilir (Transmutasyon), hayvanlarla konuşabilir ve çevre gerçekliğini zahmetsizce manipüle eder.
Açıklama: Evrensel ölçekteki büyü güçleri Selena ile denk mücadele edebilmesini sağlar. Kozmik büyü kudreti Tier 3-A sınırındadır.

2. Mekandan Bağımsız Belirme ve Işınlanma (Teleportation & Spatial Leaping)
Gerekçe: Adı anıldığında ya da kötülük arzusu doğduğunda anında ses hızının ve mekanın ötesinde belirebilir; dilediği mekanda sisler içinde kaybolabilir.
Açıklama: 3 boyutlu engelleri ve kilitli kapıları tamamen anlamsız kılan boyutsal hareket kabiliyetine sahiptir.

3. İllüzyon, Şekil Değiştirme ve Zihin Çelme (Mind Manipulation & Shapeshifting)
Gerekçe: İnsanların en derin kıskançlık ve zaaflarını sezerek onların kılığına girebilir; yalanlar ve hipnozla insanları birbirine düşürebilir.
Açıklama: Psikolojik manipülasyon ve şekil değiştirme yeteneği onu sinsi ve tahmin edilemez bir baş düşman yapar.

4. Zayıflık ve İyilik Enerjisine Karşı Hassasiyet (Vulnerability to Purity)
Gerekçe: Yüce Honos'un kanunlarına tabidir ve saf sevgi, dostluk enerjisi (Selena'nın dokunuşu) karşısında büyüleri bozulup geri çekilmek zorunda kalır.
Açıklama: Kozmik seviyede olsa da ahlaki hiyerarşide Yüce Honos'un altındadır.`
  },
  {
    name: 'Yüce Honos',
    series: 'Selena',
    category: 'Dizi / Film',
    tier: '2-B',
    power_score: 10,
    intelligence_score: 10,
    speed_score: 10,
    durability_score: 10,
    influence_score: 10,
    description: `1. Ütopya Evreninin Yüce Yargıcı ve Mutlak Hüküm (Cosmic Judge & Supreme Authority)
Gerekçe: Hem iyilik perisi Selena'nın hem de karanlık güç Şoker'in üzerindeki en yüksek ilahi makamdır. İyilik ve kötülük arasındaki dengenin mutlak koruyucusudur.
Açıklama: Tüm peri ve büyücü ırkının güçlerini tek bir sözüyle iptal edebilir veya geri alabilir. Evrensel hiyerarşide tartışmasız en üst mevkidedir (Tier 2-B).

2. Kanun Koyma ve Güç İptali (Power Nullification & Absolute Law)
Gerekçe: Selena veya Şoker kuralları çiğnediğinde onları Ütopya Mahkemesi'nde yargılayıp güçlerini dondurabilir, cezalandırabilir ve boyut hapsine gönderebilir.
Açıklama: Karşı konulamaz kavramsal otoriteye sahiptir; emirleri tüm kozmos sakinleri için bağlayıcıdır.

3. Zamansızlık ve Her Yerde Bulunma Sezgisi (Omnipresence Aura & Nigh-Omniscience)
Gerekçe: Evrenin neresinde olursa olsun Selena veya Şoker'in yaptığı her eylemi anında görür ve bilir; hiçbir yalan veya gizli plan ondan saklanamaz.
Açıklama: Bilgi işleme ve sezgi kapasitesi evrensel ölçektedir (Intelligence: 10/10).`
  },
  {
    name: 'Bilgecan Dede',
    series: 'Keloğlan Masalları',
    category: 'Çizgi Roman / Animasyon',
    tier: '8-C',
    power_score: 4,
    intelligence_score: 10,
    speed_score: 3,
    durability_score: 5,
    influence_score: 8,
    description: `1. Kadim Bilgelik, İlim ve İksir Ustalığı (Master Alchemist & Supreme Scholar)
Gerekçe: Masal dünyasının en bilge şahsiyetidir; kadim kitapları, antik dilleri, şifalı bitkileri ve büyülü iksir formüllerini kusursuz bilir.
Açıklama: Zeka skoru 10/10'dur. Hazırladığı iksirler boy büyütebilir, görünmezlik sağlayabilir veya canavarları uyutabilir.

2. Teknolojik ve Büyülü İcatlar (Magical Inventions & Dimensional Relics)
Gerekçe: Uçan makineler, koruyucu küreler, canavar tuzakları ve zaman/mekan portallarını açan anahtarlar icat etmiştir.
Açıklama: İcatları sayesinde köyü ve masal evrenini devlerin, cadıların ve Kara Vezir'in ordularına karşı tek başına savunabilir (Bina Seviyesi 8-C koruma gücü).

3. Kriz Çözücü Akıl Hocası (Strategic Mentor)
Gerekçe: Keloğlan ve arkadaşlarının karşılaştığı her çıkmazda doğru rehberliği yaparak felaketleri önler.
Açıklama: Doğrudan fiziksel kavgaya girmese de entelektüel gücüyle orduları durdurabilecek stratejik bir güç çoğaltıcıdır.`
  },
  {
    name: 'Turgut Alp',
    series: 'Diriliş: Ertuğrul',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 9,
    intelligence_score: 7,
    speed_score: 7,
    durability_score: 8,
    influence_score: 8,
    description: `1. İkonik Çift Taraflı Ağır Balta Ustalığı (Master Axeman & Wall Level AP)
Gerekçe: Tek vuruşta kalın meşe kalkanları, zırhlı Moğol ve Haçlı şövalyelerini ortadan ikiye ayırabilecek devasa bir kinetik vurucu güce sahiptir.
Açıklama: Ham fiziksel kuvveti ve balta tekniği sıradan insanların biyolojik sınırlarının çok üzerindedir (Duvar Seviyesi 9-B vuruş gücü).

2. İnsanüstü Vahşi Savaş Hırsı ve Dayanıklılık (Berserker Rage & Superhuman Stamina)
Gerekçe: Vücuduna saplanan kılıçlara ve oklara aldırmadan baltasını savurmaya devam eder; Tapınakçıların zindanlarında uygulanan ağır zihin kontrolü ve uyuşturucu işkencelerini demir iradesiyle kırmıştır.
Açıklama: Acı eşiği ve fiziksel dirayeti zirvededir (Durability: 8/10).

3. Meydan Muharebesi Liderliği (Vanguard Commander)
Gerekçe: Ertuğrul Bey'in en güvendiği akıncı başıdır; yüzlerce kişilik düşman saflarını tek başına yarıp komutanları devirmiştir.
Açıklama: Yakın dövüşte Türk kurgu evreninin en ölümcül balta savaşçısıdır.`
  },
  {
    name: 'Dede Korkut',
    series: 'Dede Korkut Hikayeleri',
    category: 'Mitoloji / Efsane',
    tier: '2-B',
    power_score: 6,
    intelligence_score: 10,
    speed_score: 5,
    durability_score: 7,
    influence_score: 10,
    description: `1. Kader Mührü ve İsim Verme Kudreti (Name Bestowal & Reality Binding)
Gerekçe: Oğuz yiğitlerine hak ettikleri isimleri verendir (Boğaç Han, Bamsı Beyrek vb.). Verdiği her isim kişinin kaderini, soyunu ve gelecekteki kahramanlığını belirler.
Açıklama: Sözün büyüsel gücüne (Söz büyüsü) sahiptir; duaları kabul olur, bedduaları düşmanı helak eder (Kavramsal Kader Otoritesi).

2. Boyutlararası Gezgin ve Ebedi Anlatıcı (Narrative Anchor & Eternal Sage)
Gerekçe: Zamandan ve mekandan bağımsız olarak her efsanenin başında ve sonunda kopuzuyla belirir; Oğuz beylerinin en çözümsüz krizlerini çözer.
Açıklama: Türk mitolojik hafızasının ve kozmik bilincinin cisimleşmiş halidir; fiziki ölüme tabi değildir.

3. Tanrı Katından İlham ve Geleceği Görme (Divination & Prophecy)
Gerekçe: Gelecekte olacak olayları, devletlerin akıbetini ve kahramanların sonunu gaipten haber verir.
Açıklama: Bilgeliği ve sezgisi ilahi kaynaklıdır (Intelligence: 10/10).`
  },
  {
    name: 'Şahmeran',
    series: 'Anadolu Efsaneleri',
    category: 'Mitoloji / Efsane',
    tier: '8-B',
    power_score: 8,
    intelligence_score: 10,
    speed_score: 7,
    durability_score: 7,
    influence_score: 9,
    description: `1. Yılanların Şahı ve Yeraltı Hükümdarlığı (Queen of Serpents & Subterranean Dominion)
Gerekçe: Yarı insan yarı yılan formundaki efsanevi varlıktır; yeraltındaki tüm yılan kavimlerine mutlak olarak hükmeder.
Açıklama: Tek bir tıslamasıyla milyonlarca zehirli yılanı yüzeye çıkarıp şehirleri istila ettirebilecek bir orduya hükmeder.

2. Ebedi Tıp Bilgisi ve Şifa / Ölüm İksiri (Absolute Alchemy & Panacea)
Gerekçe: Lokman Hekim'e tüm tabiatın ve otların sırlarını öğreten varlıktır. Gövdesinin suyu şifa verirken, kuyruğu anında öldüren mutlak bir zehirdir.
Açıklama: Yaşam ve ölüm arasındaki biyolojik sırları tamamen kontrol eder (Zeka: 10/10).

3. İnsanüstü Bilgelik ve Zihin Okuma (Telepathy & Ancient Knowledge)
Gerekçe: Kendisine yaklaşan her insanın kalbindeki iyi ve kötü niyeti anında sezer; yalan söylenemez bir basirete sahiptir.
Açıklama: Kadim çağlardan beri yaşayan efsanevi bir koruyucudur.`
  },
  {
    name: 'İskender Büyük',
    series: 'Kurtlar Vadisi Pusu',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 7,
    intelligence_score: 9,
    speed_score: 6,
    durability_score: 8,
    influence_score: 9,
    description: `1. Derin Devlet Aklı ve Askeri Operasyon Dehası (Deep State Strategist & Black Ops Genius)
Gerekçe: Türkiye'nin en karanlık terör ve istihbarat operasyonlarını yönetmiş, devlet kademelerini ve gladyo yapılanmalarını kendi çıkarları doğrultusunda manipüle etmiştir.
Açıklama: Stratejik öngörüsü, acımasızlığı ve bürokratik nüfuzu Polat Alemdar'ı en çok zorlayan baş düşman seviyesindedir (Zeka: 9/10, Etki: 9/10).

2. Zirve Askeri Fiziksel Kuvvet ve Yakın Dövüş (Veteran Military Combat & Pain Threshold)
Gerekçe: Ağır darbelere, işkencelere ve hastalıklara rağmen ayakta kalmış; yakın dövüşte eğitimli ajanları tek eliyle boğarak etkisiz hale getirmiştir.
Açıklama: Duvar Seviyesi (9-B) vuruş gücüne ve çelik gibi bir fiziksel dirence sahiptir.

3. Korku ve Terör Otoritesi (Ruthless Intimidation Aura)
Gerekçe: Karşısındaki bakanları, generalleri ve mafya liderlerini tek bir tehditkar bakışıyla dize getirmiştir.
Açıklama: Psikolojik baskı kurma ve düşmanını felç etme konusunda Türk televizyon tarihinin en ikonik kötülerindendir.`
  },
  {
    name: 'Arif Işık',
    series: 'G.O.R.A. / A.R.O.G',
    category: 'Dizi / Film',
    tier: '8-C',
    power_score: 6,
    intelligence_score: 9,
    speed_score: 6,
    durability_score: 8,
    influence_score: 8,
    description: `1. Türk Esnaf Zekası ve Uzaylı Teknolojisini Hackleme (Street Hustle Genius & Alien Tech Mastery)
Gerekçe: G.O.R.A. gezegeninin bin yıllık gelişmiş uzay teknolojisini, kupa sistemini ve lazer silahlarını birkaç gün içinde çözüp kendi lehine kullanmıştır.
Açıklama: Pratik zekası ve adaptasyon kabiliyeti galaksiler arası seviyededir. Düşmanın kendi teknolojisini ona karşı çevirerek koca bir gezegen diktatörlüğünü (Komutan Logar) devirmiştir (Zeka: 9/10).

2. Çizgi Dışı Dayanıklılık ve Hayatta Kalma Güdüsü (High Durability & Comic Resilience)
Gerekçe: Uzaylı robot muhafızların darbelerinden, taş devrinde dinozor saldırılarından ve ateş toplarından sıyrıksız kurtulmuştur.
Açıklama: Beklenmedik durumlarda gösterdiği fiziksel direnç onu Bina Seviyesi (8-C) tehditlere karşı ayakta tutar.

3. Dört Elementi Birleştirme (Elemental Mastery - G.O.R.A.)
Gerekçe: Ateş, Su, Toprak ve Tahta (!) elementlerini bir araya getirerek gezegeni yok edecek olan alev topunu uzay boşluğunda yok etmiştir.
Açıklama: İmkansız durumları şans, esnaf kurnazlığı ve cesaretle zafere dönüştüren halk kahramanı arketipidir.`
  },
  {
    name: 'Bez Bebek Nana',
    series: 'Bez Bebek',
    category: 'Dizi / Film',
    tier: '8-B',
    power_score: 7,
    intelligence_score: 7,
    speed_score: 8,
    durability_score: 8,
    influence_score: 8,
    description: `1. Oyuncaklar Ülkesi Büyüsü ve Gerçeklik Bükme (Toyland Magic & Transformation)
Gerekçe: 100. yaş gününde insan olma hakkı kazanan bez bebek. Sihirli parmak hareketiyle nesneleri havada uçurabilir, cansız eşyaları canlandırabilir ve insanların hafızasını silebilir.
Açıklama: Madde ve zihin üzerindeki büyü gücü kasaba/bina ölçeğindedir (Tier 8-B).

2. İnsan ve Bebek Formu Arasında Geçiş (Form Shifting & Damage Negation)
Gerekçe: Tehlike anında veya gece olduğunda bez bebek formuna geri dönebilir.
Açıklama: Bez bebek formundayken fiziksel kemik kırılması veya biyolojik ölüm gibi insani hasarlara karşı tamamen bağışıktır.

3. Şoker Benzeri Karanlık Büyücülerle Mücadele (Anti-Dark Magic Mastery)
Gerekçe: Oyuncaklar ülkesinin zalim kraliçesi ve kötü büyücülerin dünyaya yaymaya çalıştığı lanetleri peri güçleriyle defetmiştir.
Açıklama: Büyüsel savunma kalkanları ve arındırma ışınları üretebilir.`
  },
  {
    name: 'Nasreddin Hoca',
    series: 'Anadolu Efsaneleri',
    category: 'Mitoloji / Efsane',
    tier: '2-B',
    power_score: 5,
    intelligence_score: 10,
    speed_score: 5,
    durability_score: 7,
    influence_score: 10,
    description: `1. Mantık Kurallarını Yıkan Meta-Felsefe (Conceptual Logic Warping & Folk Wisdom)
Gerekçe: 'Göle maya çalmak', 'Parayı veren düdüğü çalar', 'Kazan doğurdu' gibi fıkralarında fizik ve mantık kurallarını ironik bir bilgelikle bükerek gerçekliği sorgulatır.
Açıklama: Düşünce ve kavram boyutunda mantık paradoksları üreterek en kudretli hükümdarları (Timurlenk) ve zalimleri tek bir cümleyle dize getirir (Zeka: 10/10).

2. Evrensel Kültürel Kalıcılık ve Dokunulmazlık (Narrative Immortality & Archetype)
Gerekçe: Yüzyıllardır Balkanlardan Orta Asya'ya kadar tüm doğu dünyasının kolektif bilincinde yaşamaktadır; fiziksel olarak yok edilemez bir kültürel figürdür.
Açıklama: Kavramsal varlığı onu fiziksel hasarların tamamen ötesine taşır (Tier 2-B).

3. Sadık Eşeği ile Kozmik Paradokslar (Paradoxical Mobility)
Gerekçe: Eşeğe ters binerek arkasını görme, geçmiş ve geleceği aynı anda hicvetme yeteneğine sahiptir.
Açıklama: Dünyanın yükünü mizahla hafifleten ilahi bir akıl hocası konumundadır.`
  }
];

async function run() {
  console.log('🚀 Batch 3 ekleniyor (10 Karakter)...');
  for (const item of BATCH_3) {
    const payload = {
      name: item.name,
      series: item.series,
      category: item.category,
      tier: item.tier,
      power_score: item.power_score,
      intelligence_score: item.intelligence_score,
      speed_score: item.speed_score,
      durability_score: item.durability_score,
      influence_score: item.influence_score,
      description: item.description,
      image_url: '', // Kullanıcı kendisi yüksek kaliteli yüz fotoğrafını yükleyecek
      status: 'published'
    };

    const { data: existing } = await supabase.from('characters').select('id').eq('name', item.name).maybeSingle();
    if (existing) {
      await supabase.from('characters').update(payload).eq('id', existing.id);
      console.log(`  ✅ Güncellendi: ${item.name}`);
    } else {
      await supabase.from('characters').insert([payload]);
      console.log(`  🎉 Yeni eklendi: ${item.name}`);
    }
  }
  console.log('\n🏁 Batch 3 başarıyla veritabanına işlendi!');
}

run();
