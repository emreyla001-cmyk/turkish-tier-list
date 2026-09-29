const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
for (let l of env.split('\n')) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
}

const supabase = createClient(url, key);

async function fix() {
  console.log('1. Fixing duplicate Hades -> Şoker...');
  // 7eb564c9-9a82-490a-b05f-a292007f194e is Şoker
  const { error: sError } = await supabase.from('characters').update({
    name: 'Şoker',
    series: 'Selena',
    category: 'Dizi / Film',
    tier: '3-A',
    description: `1. Karanlık Madde ve Kozmik Büyü Manipülasyonu (Dark Cosmic Magic & Reality Warping)
📌 Gerekçe: Ütopya gezegeninin karanlık büyücüsü olarak Selena'nın zıttı tüm güçlere sahiptir. Nesneleri ve insanları dilediği varlığa dönüştürebilir (Transmutasyon), hayvanlarla konuşabilir ve çevre gerçekliğini zahmetsizce manipüle eder.
🔍 Açıklama: Evrensel ölçekteki büyü güçleri Selena ile denk mücadele edebilmesini sağlar. Kozmik büyü kudreti Tier 3-A sınırındadır.

2. Mekandan Bağımsız Belirme ve Işınlanma (Teleportation & Spatial Leaping)
📌 Gerekçe: Adı anıldığında ya da kötülük arzusu doğduğunda anında ses hızının ve mekanın ötesinde belirebilir; dilediği mekanda sisler içinde kaybolabilir.
🔍 Açıklama: 3 boyutlu engelleri ve kilitli kapıları tamamen anlamsız kılan boyutsal hareket kabiliyetine sahiptir.

3. İllüzyon, Şekil Değiştirme ve Zihin Çelme (Mind Manipulation & Shapeshifting)
📌 Gerekçe: İnsanların en derin kıskançlık ve zaaflarını sezerek onların kılığına girebilir; yalanlar ve hipnozla insanları birbirine düşürebilir.
🔍 Açıklama: Psikolojik manipülasyon ve şekil değiştirme yeteneği onu sinsi ve tahmin edilemez bir baş düşman yapar.

4. Zayıflık ve İyilik Enerjisine Karşı Hassasiyet (Vulnerability to Purity)
📌 Gerekçe: Yüce Honos'un kanunlarına tabidir ve saf sevgi, dostluk enerjisi (Selena'nın dokunuşu) karşısında büyüleri bozulup geri çekilmek zorunda kalır.
🔍 Açıklama: Kozmik seviyede olsa da ahlaki hiyerarşide Yüce Honos'un altındadır.`
  }).eq('id', '7eb564c9-9a82-490a-b05f-a292007f194e');
  
  if (sError) console.error('Error fixing Şoker:', sError);
  else console.log('✅ Şoker restored successfully!');

  console.log('2. Fixing Behmut (Cille Evreni)...');
  const { error: bError } = await supabase.from('characters').update({
    series: 'Cille',
    category: 'Çizgi Roman / Animasyon',
    tier: '8-B',
    power_score: 9,
    intelligence_score: 6,
    speed_score: 5,
    durability_score: 9,
    influence_score: 8,
    description: `1. 12 Kutsal Efsanevi Cille'nin Zirvesi (Supreme Legendary Cille)
📌 Gerekçe: TRT Çocuk'un 'Cille' çizgi dizisinde kadim zamanlardan beri var olan, 12 efsanevi cille arasında en kudretlisi ve su/yer dengesinin en yüce yaratığıdır; Kayra'nın kadim kutsal cillesidir.
🔍 Açıklama: Sıradan ve dev cillelerin fersah fersah ötesinde bir varoluş enerjisine sahiptir; uyandığı anda tüm arenayı ve çevresindeki dağlık vadiyi sarsar (Tier 8-B).

2. Sismik Şok Dalgaları ve Su/Toprak Manipülasyonu (Tectonic Shockwaves & Geokinesis)
📌 Gerekçe: Dev cüssesini yere vurduğunda veya boynuzlarıyla hücum ettiğinde yeryüzünü yarar, fay hatlarını tetikler ve devasa taş kütlelerini savurur.
🔍 Açıklama: Vurduğu tek bir darbe kaleleri ve şehir bloklarını un ufak edebilecek kinetik patlama enerjisine sahiptir.

3. Aşılmaz Zırh ve Kadim Dayanıklılık (Colossal Armor & Invulnerability)
📌 Gerekçe: Sıradan cillelerin enerji patlamaları, ateş topları ve kesici saldırıları Behmut'un kalın kabuğunda ve derisinde çizik dahi bırakamaz.
🔍 Açıklama: Efsanevi formuna ulaştığında şehir bloğu seviyesindeki yıkıcı büyü ve fiziksel darbelere karşı tam direnç gösterir.`
  }).eq('name', 'Behmut');

  if (bError) console.error('Error fixing Behmut:', bError);
  else console.log('✅ Behmut fixed to Cille universe with Tier 8-B!');

  console.log('3. Fixing Alşimist (Cille Evreni)...');
  const { error: aError } = await supabase.from('characters').update({
    series: 'Cille',
    category: 'Çizgi Roman / Animasyon',
    tier: '8-C',
    power_score: 7,
    intelligence_score: 8,
    speed_score: 7,
    durability_score: 7,
    influence_score: 7,
    description: `1. 12 Efsanevi Kutsal Cille'den Su Grubu Muhafızı (Legendary Water Cille)
📌 Gerekçe: Cille dizisinde 12 kutsal cilleden biri olup öküz başlı balık formundadır; kadim su tapınaklarının ve cille ustalarının en gizemli yaratıklarındandır.
🔍 Açıklama: Su elementini yüksek basınçlı akıntılar ve enerji dalgaları halinde yönlendirerek binaları yıkabilecek kuvvet uygular (Tier 8-C).

2. Zaman ve Hız Yavaşlatma Yeteneği (Temporal Slow & Stat Dampening)
📌 Gerekçe: Arenadaki rakiplerinin hareket hızını, reflekslerini ve saldırı ivmesini kadim su aurasıyla ciddi oranda yavaşlatır.
🔍 Açıklama: Karşı tarafın manevra kabiliyetini kırarak üst düzey taktik kontrol sağlar.

3. Mistik Su Zırhı ve Çevik Yüzüş (Hydraulic Armor & Evasion)
📌 Gerekçe: Sıvı formu sayesinde fiziksel darbeleri sönümler, su akıntıları içinde yüksek hızda hareket ederek karşı taarruzlara geçer.
🔍 Açıklama: Hem savunma hem hız parametrelerinde elit bir efsanevi cilledir.`
  }).eq('name', 'Alşimist');

  if (aError) console.error('Error fixing Alşimist:', aError);
  else console.log('✅ Alşimist fixed to Cille universe with Tier 8-C!');
}

fix();
