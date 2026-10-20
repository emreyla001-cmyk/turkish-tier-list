const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wgqwizwyftdoxizhrljg.supabase.co', 'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz');

async function insertNiyazi() {
  const charData = {
    name: 'Niyazi',
    series: 'Seksenler',
    category: 'Dizi',
    tier: '10-B',
    power_score: 3,
    intelligence_score: 6,
    speed_score: 5,
    durability_score: 6,
    influence_score: 7,
    image_url: 'https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media/niyazi-vural-celik-1790698022123.webp',
    status: 'published',
    description: `1. Artistlik ve Teatral Özgüven (Theatrical Charisma & Persona)
📌 Gerekçe: Çınaraltı mahallesinde kendini Yeşilçam jönü ve büyük bir sinema aktörü ("Artist Niyazi") olarak tanımlar; gündelik sıradan olaylara bile sinematik tiradlar, abartılı jestler ve artistik pozlarla yaklaşır.
🔍 Açıklama: Yüksek özgüveni, renkli giyim tarzı ve teatral hitabetiyle mahalle sakinlerinin dikkatini anında çeker (Tier 10-B).

2. İnatçı Kararlılık ve Mahalle Dinamikleri (Tenacity & Melodramatic Resilience)
📌 Gerekçe: Ergun Plak ile girdiği rekabette, Nazlı'ya olan aşkında ve sokaktaki münakaşalarda gururundan ve artistliğinden asla ödün vermez.
🔍 Açıklama: Fiziksel bir dövüşçü olmamasına rağmen, komedi dünyasının sunduğu hafif slapstick dayanıklılığı ve sarsılmaz gururuyla her durumdan başı dik çıkmaya çalışır.

3. Saygıyla Anıyoruz: Vural Çelik (1973 – 2024)
📌 Gerekçe: Bu karaktere hayat veren değerli tiyatro ve dizi oyuncusu Vural Çelik, hem "Seksenler" dizisindeki Artist Niyazi hem de "Avrupa Yakası"ndaki efsanevi Kubilay Peynircioğlu ve Gülenay rolleriyle milyonların kalbinde taht kurmuştur.
🔍 Açıklama: Ekim 2024'te ebediyete uğurladığımız kıymetli sanatçımızı sonsuz saygı, sevgi ve rahmetle anıyoruz. 🕊️🎗️`
  };

  const { data, error } = await supabase.from('characters').insert([charData]).select();
  if (error) console.error('Insert error:', error);
  else console.log('Successfully inserted Niyazi:', data[0].id, data[0].name);
}

insertNiyazi();
