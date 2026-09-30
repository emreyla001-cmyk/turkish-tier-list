const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wgqwizwyftdoxizhrljg.supabase.co', 'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz');

async function run() {
  const { data } = await supabase.from('characters').select('id, name, series, tier, image_url, description').order('name');
  const noImg = data.filter(c => !c.image_url || !c.image_url.trim());
  console.log('Total characters without image:', noImg.length);
  noImg.forEach((c, i) => {
    console.log(`[${String(i + 1).padStart(2, '0')}] ${c.name.padEnd(30)} | ${(c.series || '').padEnd(25)} | Tier: ${c.tier}`);
  });
}

run();
