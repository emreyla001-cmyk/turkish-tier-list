const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wgqwizwyftdoxizhrljg.supabase.co', 'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz');

async function checkDuplicates() {
  const { data } = await supabase.from('characters').select('id, name, series, tier, image_url, description').order('name');
  console.log('Total characters:', data.length);
  data.forEach((c, i) => {
    console.log(`[${String(i + 1).padStart(2, '0')}] ${c.name.padEnd(32)} | ${(c.series || '').padEnd(28)} | ${c.tier.padEnd(8)} | ${c.image_url ? 'IMG' : '---'}`);
  });
}

checkDuplicates();
