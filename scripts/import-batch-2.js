const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wgqwizwyftdoxizhrljg.supabase.co',
  'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz'
);

async function uploadImageFromUrl(url, filename) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!res.ok) {
      console.warn(`Fetch image failed for ${filename}: ${res.status}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const { error } = await supabase.storage.from('character-media').upload(filename, buffer, {
      contentType: res.headers.get('content-type') || 'image/jpeg',
      upsert: true
    });
    if (error) {
      console.warn(`Storage upload error for ${filename}:`, error.message);
      return null;
    }
    const { data } = supabase.storage.from('character-media').getPublicUrl(filename);
    return data.publicUrl;
  } catch (err) {
    console.warn(`Upload exception for ${filename}:`, err.message);
    return null;
  }
}

const BATCH_2 = [
  {
    name: 'Ramiz Karaeski',
    series: 'Ezel',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 5,
    intelligence_score: 9,
    speed_score: 4,
    durability_score: 6,
    influence_score: 10,
    imageUrl: 'https://im.haberturk.com/2020/09/28/ver1601287413/2816827_810x458.jpg',
    storageName: 'ramiz-karaeski.jpg',
    description: `1. Yeraltı Dünyası Otoritesi ve Mutlak Nüfuz (Underworld Kingpin & Absolute Influence)
Gerekçe: İstanbul yeraltı dünyasının en kudretli ve saygı duyulan 'Dayı' figürüdür. Tek bir kelimesiyle mafya ailelerini hizaya sokabilir, cezaevlerini ve emniyet koridorlarını yönlendirebilir.
Açıklama: Sosyal ve psikolojik etki puanı zirvededir (Influence: 10/10). Kurduğu istihbarat ağı ve sadık fedaileri sayesinde doğrudan fiziksel çatışmaya girmeden düşmanlarının imparatorluklarını çökertebilir.

2. Gençlik Yılları ve Sokak Dövüşü Ustalığı (Street Brawling & Cold-Blooded Combat)
Gerekçe: Gençlik döneminde İstanbul kabadayılarını tek tek alt etmiş, bıçak ve yumruk kavgalarında birden fazla silahlı hasmı dize getirmiştir.
Açıklama: Zirve İnsan (Peak Human / 9-C) sınıfında yakın dövüş kabiliyetine ve yüksek acı eşiğine sahiptir.

3. Üst Düzey Satranç Zekası ve Manipülasyon (Mastermind Strategist & Psychological Warfare)
Gerekçe: Yıllar süren intikam planını ilmek ilmek dokumuş, Kenan Birkan gibi devasa bir karteli adım adım köşeye sıkıştırmıştır.
Açıklama: Düşmanlarının psikolojisini, zaaflarını ve sonraki adımlarını aylar öncesinden öngören dahi seviyesinde bir stratejisttir (Intelligence: 9/10).

4. Efsanevi Racon ve Korku Aurası (Intimidation & Aura)
Gerekçe: Karşısındaki en gözü kara katiller dahi onun huzurunda silah çekmeye cesaret edemez. Okuduğu şiirler ve kıssalar bile düşmanlarının psikolojisini yerle bir etmeye yeterlidir.
Açıklama: Karizmatik varlığı ve ölüm karşısındaki vakur duruşu, onu Türk kurgu evreninin en etkili figürlerinden biri yapar.`
  },
  {
    name: 'Maraz Ali',
    series: 'Adanalı',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 8,
    intelligence_score: 8,
    speed_score: 8,
    durability_score: 7,
    influence_score: 8,
    imageUrl: 'https://im.showtv.com.tr/5/6265/maraz-ali-mehmet-akif-alakurt-500x500.png',
    storageName: 'maraz-ali.jpg',
    description: `1. İnsanüstü Yakın Dövüş ve Akrobasi (Superhuman Martial Arts & Wall Level AP)
Gerekçe: Onlarca silahlı çete üyesini, mafya korumasını ve özel tim görevlisini aynı anda silahsızlandırarak tekme ve yumruk darbeleriyle metrelerce öteye fırlatabilir.
Açıklama: Tek bir yumruk veya döner tekme darbesiyle kalın ahşap mobilyaları, kapıları ve duvar kaplamalarını kırabilir. Vuruş gücü Duvar Seviyesi (Wall level / 9-B) sınıfındadır.

2. Kurşunlardan Sıyrılma ve Akrobatik Refleksler (Peak Human+ Agility & Bullet Evasion)
Gerekçe: Otomatik silahlardan çıkan mermilerden taklalar atarak, duvardan sekerek ve ters taklalarla kaçabilme yeteneğine sahiptir.
Açıklama: Çevikliği ve tepki hızı standart bir olimpik jimnastikçinin çok ötesindedir. Dikey duvarlara tırmanabilir ve yüksek katlardan hasar almadan atlayabilir.

3. Üst Düzey Çete Liderliği ve Soygun Zekası (Tactical Genius & Master Thief)
Gerekçe: Türkiye'nin en iyi korunan bankalarını, kasalarını ve zırhlı araçlarını polise tek bir iz dahi bırakmadan dakikalar içinde soyabilen kusursuz planlar yapar.
Açıklama: Taktik zekası ve teknolojik donanımı sayesinde emniyet teşkilatını defalarca ters köşeye yatırmıştır.

4. Sadık Köpeği 'Rıfkı' ile Taktiksel Savaş (K-9 Synchronized Combat)
Gerekçe: Sadık köpeği Rıfkı ile tek bir göz veya el hareketiyle iletişim kurar; düşmanları arkadan kıstırarak etkisiz hale getirirler.
Açıklama: Dövüş alanında çevre unsurlarını ve köpeğini kusursuz bir silah gibi kullanarak tek kişilik bir ordu gibi hareket eder.`
  },
  {
    name: 'Tepegöz',
    series: 'Dede Korkut Hikayeleri',
    category: 'Mitoloji / Efsane',
    tier: '8-C',
    power_score: 9,
    intelligence_score: 3,
    speed_score: 5,
    durability_score: 9,
    influence_score: 8,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tepeg%C3%B6z_-_Dede_Korkut.jpg/800px-Tepeg%C3%B6z_-_Dede_Korkut.jpg',
    storageName: 'tepegoz.jpg',
    description: `1. Dev Cüssesi ve Devasa Fiziksel Yıkım (Building Level Physical Might / 8-C)
Gerekçe: Dede Korkut anlatılarında dağ boyunda bir dev olarak tasvir edilir. Koca koca kayaları elinde fındık gibi ezer, koca meşe ağaçlarını kökünden sökerek silah gibi savurur.
Açıklama: Bir ordu dolusu Oğuz yiğidini tek bir kol savuruşuyla un ufak edebilir, kaleleri ve köyleri tek başına yerle bir edebilir (Bina Seviyesi / 8-C AP).

2. Büyülü / İlahi Zırh: Kılıç ve Ok İşlemezlik (Invulnerability / Impenetrable Skin)
Gerekçe: Anası peri kızı olduğu için vücudu büyülü bir dokunulmazlığa sahiptir; Oğuzların attığı demir oklar, vurdukları çelik kılıçlar ve kargılar derisinde sekip kırılır.
Açıklama: Tek bir zayıf noktası hariç (alnının ortasındaki tek gözü) hiçbir konvansiyonel silahla yaralanamaz. Bu durum ona olağanüstü bir dayanıklılık (Durability: 9/10) kazandırır.

3. İnsanüstü İştah ve Terör Aurası (Man-Eating Terror & Demonic Presence)
Gerekçe: Günde yüzlerce koyun ve iki insan kurban edilmeden doymaz; Oğuz ilinin tamamını haraca bağlamış ve koca bir milleti çaresiz bırakmıştır.
Açıklama: Karşılaştığı her canlının zihnine dehşet salan ilkel ve durdurulamaz bir doğa felaketi gibi hareket eder.

4. Tek Zayıflık ve Yenilgi (Single Vulnerability)
Gerekçe: Basat tarafından kızgın demir şişle kör edildikten sonra gücünü kaybetmiş ve kendi kılıcıyla başı kesilmiştir.
Açıklama: Zekasının düşük olması (Intelligence: 3/10) ve tek gözünün hassasiyeti, stratejik savaşçılar karşısındaki yegane açık noktasıdır.`
  },
  {
    name: 'Kral Şakir',
    series: 'Kral Şakir',
    category: 'Çizgi Roman / Animasyon',
    tier: '8-C',
    power_score: 6,
    intelligence_score: 7,
    speed_score: 6,
    durability_score: 9,
    influence_score: 7,
    imageUrl: 'https://im.haberturk.com/2019/10/04/ver1570177727/2527962_810x458.jpg',
    storageName: 'kral-sakir.jpg',
    description: `1. Çizgi Film Fiziği ve Hayal Gücü Dayanıklılığı (Toon Force / High Durability)
Gerekçe: Patlayan bombalardan, uzaydan düşmelerden, devasa dinozor veya uzaylı saldırılarından sadece üstü başı kömür karası olarak tek parça halinde ayağa kalkabilir.
Açıklama: Klasik 'Toon Force' kurallarına tabi olduğu için fiziksel hasar toleransı gerçek dünya sınırlarını aşar. Ezilse, yassılsa veya havaya uçsa dahi saniyeler içinde eski haline döner (Durability: 9/10).

2. Çılgın Bilim Envanteri ve Boyutlararası Cihazlar (Sci-Fi Arsenal & Gadgets)
Gerekçe: Bilim adamı Mirket'in icat ettiği ışınlanma makineleri, zaman portalları, boyut küçültücüler ve uzay roketlerini kullanarak dünyayı ve galaksiyi kurtarmıştır.
Açıklama: Teknolojik ekipman desteğiyle şehirleri tehdit eden canavarları ve uzaylı istilalarını durdurabilecek yıkım potansiyeline sahiptir (Bina Seviyesi 8-C).

3. Yaratıcı Problem Çözme ve Çocuk Kahramanlığı (Creative Problem Solving)
Gerekçe: Karşılaştığı her absürt kozmik krizde arkadaşlarını organize ederek beklenmedik stratejiler üretir.
Açıklama: Saf zeka ve iyimserliği, devasa karanlık güçlere karşı çizgi roman evreninde en büyük silahıdır.`
  },
  {
    name: 'Fil Necati',
    series: 'Kral Şakir',
    category: 'Çizgi Roman / Animasyon',
    tier: '8-B',
    power_score: 8,
    intelligence_score: 4,
    speed_score: 4,
    durability_score: 10,
    influence_score: 8,
    imageUrl: 'https://im.haberturk.com/2021/04/09/ver1617961205/3034567_810x458.jpg',
    storageName: 'fil-necati.jpg',
    description: `1. Sınırsız Oburluk ve Madde Tüketimi (Matter Ingestion & Bottomless Stomach)
Gerekçe: Metal nesneleri, zehirli maddeleri, devasa heykelleri, hatta gerçekliği bozan anomalileri bile bir oturuşta mideye indirebilir ve sindirebilir.
Açıklama: Midesi adeta bir kara delik gibi çalışır; kurgusal evrendeki en tehlikeli nesneleri veya lanetli yiyecekleri yok edebilme kapasitesine sahiptir.

2. Kusursuz Çizgi Film Ölümsüzlüğü (Peak Toon Force & Durability)
Gerekçe: Kafasına göktaşı düşse, uzay boşluğunda kalsa, volkanın içine atılsa bile yalnızca 'acaba dürüm var mı?' diyerek kalkıp yürümeye devam eder.
Açıklama: Dayanıklılık puanı 10/10'dur. Fizik kurallarını tamamen yıkan vurdumduymazlığı sayesinde evrendeki en güçlü saldırıları bile komedi unsuru olarak savuşturur (Büyük Bina Seviyesi / 8-B dayanıklılık).

3. Boyutlararası Şans ve Kaos Manipülasyonu (Probability Manipulation / Dumb Luck)
Gerekçe: Yanlışlıkla bastığı bir düğmeyle uzay gemilerini kurtarır, sakarlıklarıyla galaktik istilacıları alt üst eder.
Açıklama: Tamamen kaos temelli bir dövüş biçimine sahiptir; plan yapmadan sadece kendi absürt doğasıyla en güçlü düşmanları dize getirebilir.`
  },
  {
    name: 'Tozkoparan İskender',
    series: 'Tozkoparan İskender',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 7,
    intelligence_score: 7,
    speed_score: 7,
    durability_score: 7,
    influence_score: 7,
    imageUrl: 'https://im.haberturk.com/2021/01/03/ver1609673946/2924510_810x458.jpg',
    storageName: 'tozkoparan-iskender.jpg',
    description: `1. Efsanevi Okçuluk Ustalığı ve Kusursuz İsabet (Master Marksman / Enhanced Aim)
Gerekçe: Türk tarihinin en büyük kemankeşlerinden olan İskender, tarihte kırılamamış menzil rekorlarına imza atmış bir dehadır.
Açıklama: Gözleri bağlıyken bile rüzgarı ve hedefin sesini dinleyerek kilometrelerce öteden bir madeni parayı vurabilecek insanüstü isabet kabiliyetine sahiptir.

2. Zaman Yolculuğu ve Tarihsel Uyum (Time Travel & Adaptability)
Gerekçe: Geçmişten günümüze zaman portalı aracılığıyla gelmiş; modern teknolojileri, akıllı cihazları ve günümüz savaş taktiklerini hızla öğrenmiştir.
Açıklama: Farklı çağların dövüş disiplinlerini harmanlayabilen yüksek uyum zekasına sahiptir.

3. Doğa Güçleriyle Senkronizasyon (Nature & Wind Sensing)
Gerekçe: Yayını gerdiğinde havanın akışını, yerçekimini ve atmosferik basıncı hissederek okuna olağanüstü kinetik enerji kazandırır.
Açıklama: Fırlattığı özel oklar kalın demir kalkanları ve tuğla duvarları delip geçebilir (Duvar Seviyesi 9-B).`
  },
  {
    name: 'Tosun Paşa',
    series: 'Tosun Paşa',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 6,
    intelligence_score: 4,
    speed_score: 5,
    durability_score: 7,
    influence_score: 9,
    imageUrl: 'https://im.showtv.com.tr/5/6264/tosun-pasa-kemal-sunal-500x500.png',
    storageName: 'tosun-pasa.jpg',
    description: `1. Hakiki Paşa Otoritesi ve Sahte Kimlik Manipülasyonu (Social Influence & Authority)
Gerekçe: Tellioğulları ve Seferoğulları aileleri arasındaki Yeşilvadi çatışmasında İskenderiye Valisi Hakiki Tosun Paşa kılığına girerek tüm bölgenin askeri ve idari gücünü tek başına yönetmiştir.
Açıklama: Emrindeki orduyu ve paşa forsunu kullanarak çatışan tarafları tek bir fermanla dize getirebilecek devasa bir sosyal nüfuz (Influence: 9/10) üretmiştir.

2. Sakarlık ve Şans Sayesinde Dövüş Üstünlüğü (Accidental Combat & Dumb Luck)
Gerekçe: Kılıç kullanmayı bilmemesine rağmen sakarlıkları, ters savuruşları ve tesadüfleriyle profesyonel fedaileri ve güreşçileri şaşırtarak saf dışı bırakabilmiştir.
Açıklama: Standart bir insan olsa da karşı tarafın onun ne yapacağını kestirememesi savaş alanında absürt bir savunma avantajı sağlar (9-C seviye).

3. Güçlü İrade ve Hayatta Kalma Güdüsü (Survival Drive)
Gerekçe: Gerçek Tosun Paşa'nın gelişiyle patlak veren kaostan sağ çıkmayı başarmış; Yeşilvadi gibi ölümcül bir bölgeyi zekası ve şansıyla alt etmiştir.
Açıklama: Kemal Sunal tiplemelerinin klasik halk zekasını ve şans faktörünü barındırır.`
  },
  {
    name: 'Keloğlan',
    series: 'Keloğlan Masalları',
    category: 'Çizgi Roman / Animasyon',
    tier: '9-B',
    power_score: 5,
    intelligence_score: 9,
    speed_score: 6,
    durability_score: 6,
    influence_score: 8,
    imageUrl: 'https://im.haberturk.com/2018/09/07/ver1536324838/2135067_810x458.jpg',
    storageName: 'keloglan.jpg',
    description: `1. Anadolu Masal Zekası ve Kurnazlık (Folk Wisdom & Cunning / Trickster Archetype)
Gerekçe: Karşılaştığı devleri, cadıları, haramileri ve zalim vezirleri saf görünüşünün ardındaki parlak kurnazlığıyla birbirine düşürerek alt etmiştir.
Açıklama: Dahi seviyesinde manipülasyon yeteneği (Intelligence: 9/10). Güç ile çözülemeyen krizleri tek bir bilmece veya akıl oyunuyla çözer.

2. Büyülü Nesnelere Erişim ve İttifaklar (Magical Artifacts & Fairy Alliances)
Gerekçe: Anka Kuşu, peri kızları, konuşan hayvanlar ve devlerle dostluk kurabilmiş; sihirli kemer, görünmezlik şapkası ve hız çizmeleri gibi eşyaları kullanmıştır.
Açıklama: Büyülü envanteri sayesinde sıradan bir köy çocuğundan bina ve kasaba seviyesindeki tehlikeleri defeden bir kahramana dönüşür.

3. Devlerle Mücadele ve Canavar Avcılığı (Giant Slayer Feats)
Gerekçe: Kendi cüssesinden yirmi kat büyük devleri fiziksel güç yerine yerçekimini ve kendi ağırlıklarını kullanarak uçurumlardan yuvarlamıştır.
Açıklama: Dövüş zekası sayesinde kendisinden çok daha üst tier'daki varlıkları saf dışı bırakabilmektedir (9-B zafer skalası).`
  },
  {
    name: 'Hakan: Muhafız',
    series: 'Hakan: Muhafız (The Protector)',
    category: 'Dizi / Film',
    tier: '9-A',
    power_score: 8,
    intelligence_score: 7,
    speed_score: 8,
    durability_score: 8,
    influence_score: 7,
    imageUrl: 'https://im.haberturk.com/2018/12/14/ver1544795240/2260662_810x458.jpg',
    storageName: 'hakan-muhafiz.jpg',
    description: `1. Tılsımlı Gömlek: Mutlak Zırh ve İnsanüstü Güç (The Talismanic Shirt / Small Building Level AP)
Gerekçe: Tılsımlı Muhafız gömleğini giydiğinde kurşun geçirmez hale gelir, patlamalardan sıyrıksız kurtulur ve insanüstü vuruş gücü kazanır.
Açıklama: Kalın beton duvarları ve çelik kapıları tek yumrukta parçalayabilir. Vuruş gücü ve dayanıklılığı Küçük Bina Seviyesi (Small Building / 9-A) sınıfına yükselir.

2. Tılsımlı Hançer: Ölümsüzleri Yok Etme Gücü (The Dagger / Immortality Negation)
Gerekçe: İstanbul'u yok etmeye ant içmiş kadim Ölümsüzler sadece bu hançerle öldürülebilir.
Açıklama: Kavramsal düzeyde ölümsüzlük ve yenilenme (Regeneration Negation) yeteneğini iptal ederek bin yıllık varlıkları ebediyen yok eder.

3. Sadık Olanlar Tarafından Eğitilmiş Dövüş Refleksleri (Elite Hand-to-Hand & Reflexes)
Gerekçe: Kadim muhafız dövüş teknikleri ve modern sokak dövüşü birleşimiyle eğitilmiş; çok sayıda silahlı suikastçıyı saniyeler içinde etkisiz hale getirmiştir.
Açıklama: Hız ve refleksleri insan zirvesinin ötesindedir (Speed: 8/10).`
  },
  {
    name: 'Ertuğrul Bey',
    series: 'Diriliş: Ertuğrul',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 8,
    intelligence_score: 8,
    speed_score: 7,
    durability_score: 8,
    influence_score: 10,
    imageUrl: 'https://im.haberturk.com/2019/05/29/ver1559159938/2479427_810x458.jpg',
    storageName: 'ertugrul-bey.jpg',
    description: `1. Usta Kılıç ve Savaş Meydanı Hükümdarlığı (Master Swordsman / Battle Field Combat)
Gerekçe: Tapınakçı şövalyeleri, Moğol noyanları ve Bizans komutanlarıyla girdiği yüzlerce teke tek dövüşten zaferle çıkmıştır.
Açıklama: Çift kılıç, kalkan ve yay kullanımında çağının en büyük savaşçılarından biridir. Vuruş gücü ve kılıç kesişi zırhları ve kalkanları parçalayabilecek kinetik enerji üretir (Duvar Seviyesi 9-B).

2. Demir İrade ve Efsanevi Dayanıklılık (Iron Will & Superhuman Stamina)
Gerekçe: Moğolların elinde gördüğü ağır işkencelere, çivilenen ellerine ve zehirlenmelere rağmen ayağa kalkarak obasını kurtarmıştır.
Açıklama: Ağrı eşiği ve fiziksel dirayeti zirve insan sınırındadır (Durability: 8/10).

3. Devlet Kuran Liderlik ve Jeopolitik Deha (Grand Strategist & Founding Influence)
Gerekçe: Anadolu Selçuklu, Moğol ve Bizans üçgeninde kabile devleti kurmuş; cihan imparatorluğu Osmanlı'nın temellerini atmıştır.
Açıklama: Sosyal ve askeri etki puanı en üst seviyededir (Influence: 10/10).`
  }
];

async function run() {
  console.log('🚀 Batch 2 ekleniyor...');
  for (const item of BATCH_2) {
    console.log(`\n⏳ İşleniyor: ${item.name}...`);
    
    // Fotoğrafı storage'a yükle
    let finalImageUrl = `https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media/${item.storageName}`;
    const uploaded = await uploadImageFromUrl(item.imageUrl, item.storageName);
    if (uploaded) {
      finalImageUrl = uploaded;
      console.log(`  📷 Fotoğraf yüklendi: ${finalImageUrl}`);
    } else {
      console.log(`  ⚠️ Fotoğraf varsayılan URL ile devam: ${finalImageUrl}`);
    }

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
      image_url: finalImageUrl,
      status: 'published'
    };

    // Varsa güncelle, yoksa ekle
    const { data: existing } = await supabase.from('characters').select('id').eq('name', item.name).maybeSingle();
    if (existing) {
      const { error } = await supabase.from('characters').update(payload).eq('id', existing.id);
      if (error) console.error(`  ❌ Güncelleme hatası: ${error.message}`);
      else console.log(`  ✅ Güncellendi: ${item.name}`);
    } else {
      const { error } = await supabase.from('characters').insert([payload]);
      if (error) console.error(`  ❌ Ekleme hatası: ${error.message}`);
      else console.log(`  🎉 Yeni eklendi: ${item.name}`);
    }
  }
  console.log('\n🏁 Batch 2 tamamlandı!');
}

run();
