const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wgqwizwyftdoxizhrljg.supabase.co', 'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz');

async function run() {
  const payload = {
    name: 'Süleyman Çakır',
    series: 'Kurtlar Vadisi',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 5,
    intelligence_score: 8,
    speed_score: 5,
    durability_score: 6,
    influence_score: 9,
    description: `1. Sokak Hakimiyeti ve Silahşorluk (Street Authority & Dual Pistol Marksmanship)
📌 Gerekçe: İstanbul yeraltı dünyasında 'Cerrahpaşalılar' dahil en tehlikeli organize suç örgütlerine tek başına kafa tutmuş, girdiği silahlı çatışmalardan zaferle çıkmıştır.
🔍 Açıklama: Çift tabanca kullanımı, seri tetik düşürme ve yakın mesafe sokak çatışmasında üstün bir yeteneğe sahiptir (Tier 9-C).

2. Karizma, Racon ve Teşkilat Liderliği (Mafia Hierarchy & Iron Will)
📌 Gerekçe: Kumarhaneler kralı ve İstanbul sefiri olarak yüzlerce fedaiyi, mafya ailesini ve yeraltı operasyonunu yönetmiştir.
🔍 Açıklama: Masada ve sokakta düşmanlarının üzerine kurduğu psikolojik üstünlük ve racon kültürüyle rakiplerini teslim alır.

3. Ağır Yara Dayanıklılığı ve Fedakarlık (Pain Tolerance & Survival)
📌 Gerekçe: Onlarca kurşun yarası almış, ölümle burun buruna geldiği pusulardan hayatta kalarak çıkmıştır.
🔍 Açıklama: İnatçı sokak dayanıklılığı ve acıya meydan okuyan fiziksel kondisyona sahiptir.`,
    image_url: '',
    status: 'published'
  };

  const { data, error } = await supabase.from('characters').update(payload).eq('name', 'Test Character').select();
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Successfully converted Test Character to Süleyman Çakır:', data[0].name);
  }
}

run();
