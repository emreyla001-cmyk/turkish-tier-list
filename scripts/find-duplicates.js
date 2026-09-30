const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wgqwizwyftdoxizhrljg.supabase.co', 'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz');

async function checkAll() {
  const { data, error } = await supabase.from('characters').select('id, name, series, category, tier, image_url, description, created_at').order('name');
  if (error) {
    console.error('Error fetching characters:', error);
    return;
  }
  console.log('Total characters in database:', data.length);

  // 1. Duplicate image URLs
  const imageMap = {};
  data.forEach(c => {
    if (c.image_url && c.image_url.trim()) {
      const url = c.image_url.trim();
      if (!imageMap[url]) imageMap[url] = [];
      imageMap[url].push(c);
    }
  });

  console.log('\n=== 1. SAME IMAGE URLS (POTENTIAL DUPLICATES) ===');
  let dupImgFound = false;
  for (const [url, chars] of Object.entries(imageMap)) {
    if (chars.length > 1) {
      dupImgFound = true;
      console.log('\nImage URL:', url);
      chars.forEach(c => console.log(`  [ID: ${c.id}] "${c.name}" | Series: "${c.series}" | Tier: ${c.tier}`));
    }
  }
  if (!dupImgFound) console.log('None found.');

  // 2. Duplicate or near-identical descriptions
  const descMap = {};
  data.forEach(c => {
    if (c.description) {
      // Normalize whitespace and look at first 80 characters
      const norm = c.description.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, '').slice(0, 60);
      if (norm.length > 10) {
        if (!descMap[norm]) descMap[norm] = [];
        descMap[norm].push(c);
      }
    }
  });

  console.log('\n=== 2. IDENTICAL / NEAR-IDENTICAL DESCRIPTIONS ===');
  let dupDescFound = false;
  for (const [norm, chars] of Object.entries(descMap)) {
    if (chars.length > 1) {
      dupDescFound = true;
      console.log('\nDesc prefix:', norm.slice(0, 30) + '...');
      chars.forEach(c => console.log(`  [ID: ${c.id}] "${c.name}" | Series: "${c.series}" | Tier: ${c.tier} | Img: ${c.image_url ? 'Yes' : 'No'}`));
    }
  }
  if (!dupDescFound) console.log('None found.');

  // 3. Print all characters cleanly for human semantic check
  console.log('\n=== 3. ALL CHARACTERS (TOTAL: ' + data.length + ') ===');
  data.forEach((c, i) => {
    const hasImg = c.image_url && c.image_url.trim() ? '🖼️ YES' : '❌ NO ';
    console.log(`${String(i + 1).padStart(3, ' ')}. [${c.id.slice(0, 8)}] ${(c.name || '').padEnd(30)} | ${(c.series || '').padEnd(25)} | Tier: ${(c.tier || '').padEnd(8)} | Img: ${hasImg}`);
  });
}

checkAll();
