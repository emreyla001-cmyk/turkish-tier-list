const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wgqwizwyftdoxizhrljg.supabase.co', 'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz');

async function auditRemaining() {
  const { data } = await supabase.from('characters').select('id, name, series, tier, image_url, description').order('name');
  console.log(`Current Total: ${data.length} characters\n`);

  const withImg = data.filter(c => c.image_url && c.image_url.trim());
  const withoutImg = data.filter(c => !c.image_url || !c.image_url.trim());

  console.log(`=== CHARACTERS WITHOUT PHOTO (${withoutImg.length}) ===`);
  withoutImg.forEach((c, i) => {
    console.log(`[${String(i + 1).padStart(2, '0')}] [ID: ${c.id.slice(0, 8)}] ${c.name.padEnd(30)} | ${(c.series || '').padEnd(25)} | Tier: ${c.tier}`);
  });

  console.log(`\n=== CHARACTERS WITH PHOTO (${withImg.length}) ===`);
  withImg.forEach((c, i) => {
    console.log(`[${String(i + 1).padStart(2, '0')}] [ID: ${c.id.slice(0, 8)}] ${c.name.padEnd(30)} | ${(c.series || '').padEnd(25)} | Tier: ${c.tier}`);
  });
}

auditRemaining();
