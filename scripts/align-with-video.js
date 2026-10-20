const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
for (let l of env.split('\n')) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
}

const supabase = createClient(url, key);

async function run() {
  console.log('1. Fixing The Qu (All Tomorrows - C. M. Kosemen)...');
  // Update TheQu to The Qu with galactic tier 3-B
  const { error: quErr } = await supabase.from('characters').update({
    name: 'The Qu',
    series: 'All Tomorrows',
    category: 'Edebiyat / Kitap',
    tier: '3-B',
    power_score: 9,
    intelligence_score: 10,
    speed_score: 9,
    durability_score: 9,
    influence_score: 10,
    description: `1. Milyarlarca Yıllık Galaktik Hakimiyet ve Göçebe İmparatorluk (Galactic Nomadic Conquest)
📌 Gerekçe: Türk yazar ve çizer C. M. Kosemen'in 'All Tomorrows' adlı kült bilimkurgu eserinde, bir milyar yılı aşkın süredir uzayda dolaşan ve karşılaştığı tüm galaktik medeniyetleri fetheden tanrısal uzaylı türüdür.
🔍 Açıklama: Samanyolu ve komşu galaksileri kapsayan devasa armadaları ve yıldız sistemlerini yerinden oynatan teknolojisiyle Tier 3-B (Çoklu Galaksi Seviyesi) kudrete sahiptir.

2. Mutlak Genetik Manipülasyon ve Tür Dönüşümü (Bio-Engineering & Flesh Sculpting)
📌 Gerekçe: Yıldız İnsanları'nı (Star People) yenilgiye uğrattıktan sonra insan ırkını cezalandırmak amacıyla genetik kodlarını parçalamış ve onları Koloniyaller, Yılan İnsanlar, Körler gibi onlarca alt türe ve organik makinelere dönüştürmüştür.
🔍 Açıklama: Biyolojik hayatı bir heykeltıraş gibi yeniden biçimlendirebilen, hücresel ve genetik seviyede mutlak mühendislik yeteneğine sahiptir.

3. Nano-Teknolojik ve Gravitasyonel Silahlar (Nanotech & Gravity Inversion)
📌 Gerekçe: Yıldızları söndürebilen, gezegenlerin yörüngelerini değiştirebilen ve yerçekimi dalgalarını silah olarak kullanan uygarlık seviyesine sahiptir.
🔍 Açıklama: Gezegensel savunma sistemlerini dakikalar içinde aşarak gezegenleri devasa organik üretim çiftliklerine çevirir.`
  }).ilike('name', '%TheQu%');

  if (quErr) console.error('Error updating The Qu:', quErr);
  else console.log('✅ The Qu updated to All Tomorrows canon with Tier 3-B!');

  console.log('2. Adding Dudu Peri (Sihirli Annem)...');
  const duduPayload = {
    name: 'Dudu Peri',
    series: 'Sihirli Annem',
    category: 'Dizi / Film',
    tier: '8-B',
    power_score: 8,
    intelligence_score: 8,
    speed_score: 7,
    durability_score: 7,
    influence_score: 9,
    image_url: '',
    status: 'published',
    description: `1. Transmutasyon ve İnsanları Hayvana Dönüştürme (Transmutation & Hexing)
📌 Gerekçe: Sihirli Annem evreninde Periler Konseyi'nin eski kraliçesi olarak, eşi Taci'yi tek bir büyü sözüyle ömür boyu konuşan bir köpeğe dönüştürmüş, yüzlerce faninin hafızasını ve bedenini dilediği gibi değiştirmiştir.
🔍 Açıklama: Biyolojik maddeyi büyüsel olarak anında dönüştürme ve büyülerini geri döndürülemez kılma yeteneğinde uzmandır (Tier 8-B).

2. Çevresel Doğa ve Hava Durumu Manipülasyonu (Weather & Environmental Control)
📌 Gerekçe: Öfkelendiğinde veya canı istediğinde anında şimşekler çaktırabilir, evlerin içinde kar ve fırtına koparabilir, eşyaları telekinetik olarak havada savurabilir.
🔍 Açıklama: Şehir bloğu ölçeğinde büyü fırtınaları ve mekansal yanılsamalar yaratır.

3. Yüksek Boyutsal Peri Otoritesi ve Hafıza Silme (Mind Manipulation & Longevity)
📌 Gerekçe: Yüzlerce yıldır yaşayan kadim bir peri olup insanların zihinlerini dondurabilir, zamanı geçici olarak geri alabilir ve fanilerin algısını tamamen manipüle eder.
🔍 Açıklama: Ütopya ve Dünya arasındaki geçiş kapılarını serbestçe kullanır.`
  };

  const { data: existingDudu } = await supabase.from('characters').select('id').eq('name', 'Dudu Peri').maybeSingle();
  if (existingDudu) {
    await supabase.from('characters').update(duduPayload).eq('id', existingDudu.id);
    console.log('  ✅ Dudu Peri updated!');
  } else {
    await supabase.from('characters').insert([duduPayload]);
    console.log('  🎉 Dudu Peri inserted!');
  }
}

run();
