const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const lines = env.split('\n');
let url = '', key = '';
for (let l of lines) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
}

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching characters:', error);
    return;
  }

  console.log('Total characters in DB:', data.length);
  const issues = [];

  for (const c of data) {
    const desc = c.description || '';
    const hasGerekce = desc.includes('Gerekçe:') || desc.includes('📌 Gerekçe:');
    const hasAciklama = desc.includes('Açıklama:') || desc.includes('🔍 Açıklama:');
    const pointsCount = (desc.match(/(?:^|\n)\d+\.\s+/g) || []).length;
    const isStorageImg = c.image_url && c.image_url.includes('character-media');

    console.log(`[ID ${c.id.toString().padEnd(2)}] ${c.name.padEnd(22)} | Tier: ${c.tier.padEnd(4)} | Pts: ${pointsCount.toString().padEnd(2)} | Len: ${desc.length.toString().padEnd(5)} | StorageImg: ${isStorageImg ? 'YES' : 'NO '} | URL: ${c.image_url ? c.image_url.substring(0, 60) + '...' : 'NONE'}`);

    if (pointsCount < 3) {
      issues.push(`${c.name}: Sadece ${pointsCount} madde var veya format eksik!`);
    }
    if (!hasGerekce || !hasAciklama) {
      issues.push(`${c.name}: 'Gerekçe:' veya 'Açıklama:' etiketleri eksik!`);
    }
  }

  console.log('\n--- DETECTED FORMAT / DEPTH ISSUES ---');
  if (issues.length === 0) {
    console.log('Tüm karakterler derinlik ve gerekçe/açıklama formatına uygun!');
  } else {
    issues.forEach(i => console.log('⚠️ ', i));
  }
}

run();
