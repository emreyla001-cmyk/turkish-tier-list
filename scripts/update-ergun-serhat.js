const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabase = createClient('https://wgqwizwyftdoxizhrljg.supabase.co', 'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz');

async function updateErgun() {
  const filePath = 'C:/Users/EMRE/.gemini/antigravity/brain/b90bd7de-8c65-42cf-a0c3-d62c0bbde8af/.user_uploaded/media_1790697905159.webp';
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = 'ergun-plak-serhat-kilic-' + Date.now() + '.webp';
  
  const { data, error } = await supabase.storage.from('character-media').upload(fileName, fileBuffer, {
    contentType: 'image/webp',
    upsert: true
  });
  
  if (error) {
    console.error('Upload error:', error);
    return;
  }
  
  const { data: pubData } = supabase.storage.from('character-media').getPublicUrl(fileName);
  console.log('Public URL:', pubData.publicUrl);

  const newDesc = `1. Retorik Cambazlığı ve İkna Kabiliyeti (Charisma & Persuasion)
📌 Gerekçe: Çınaraltı mahallesinde en karmaşık aşk krizlerini, borç meselelerini ve esnaf kavgalarını etkileyici konuşmaları ve edebiyatıyla çözer.
🔍 Açıklama: Standart insan sınırında (Tier 10-B) zihinsel ve sosyal etkiye sahiptir; insanları kelimelerle manipüle etme yeteneği yüksektir.

2. Müzik Hafızası ve Kültürel Arşiv (Encyclopedic Music Knowledge)
📌 Gerekçe: Dönemin yerli ve yabancı tüm plaklarını, şarkı sözlerini ve sanatçı biyografilerini ezbere bilir.
🔍 Açıklama: Kültürel bilgi birikimi ve arşivcilik zekası üst düzeydedir.

3. Hızlı Kaçış ve Mahalle Çevikliği (Evasion)
📌 Gerekçe: Fehmi Bey veya Ahmet'in gazabından kurtulmak için dükkanının arka kapısından veya ara sokaklardan anında sıvışır.
🔍 Açıklama: Fiziksel çatışmalardan tamamen kaçınan, diplomatik veya kaçış odaklı bir hayatta kalma tarzı vardır.

4. Saygıyla Anıyoruz: Serhat Kılıç (1975 – 2026)
📌 Gerekçe: Ergun Plak karakterine benzersiz enerjisi, dillere destan renkli gömlekleri ve samimi oyunculuğuyla can veren usta tiyatro ve sinema sanatçımız Serhat Kılıç, Türk televizyon tarihinin en sevilen figürlerinden birini yaratmıştır.
🔍 Açıklama: 2026 yılında ebediyete uğurladığımız kıymetli sanatçımızı sonsuz saygı, sevgi ve rahmetle anıyoruz. 🕊️🎗️`;

  const { error: upErr } = await supabase.from('characters').update({
    image_url: pubData.publicUrl,
    description: newDesc,
    status: 'published'
  }).eq('id', 'fa15ebfa-6909-4c6b-b8c4-4a9241374d07');

  if (upErr) {
    console.error('Update error:', upErr);
  } else {
    console.log('Successfully updated Ergun Plak with Serhat Kılıç tribute and image!');
  }
}

updateErgun();
