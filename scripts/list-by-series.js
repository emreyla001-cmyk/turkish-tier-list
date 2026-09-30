const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wgqwizwyftdoxizhrljg.supabase.co', 'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz');

async function list() {
  const { data } = await supabase.from('characters').select('id, name, series, category, tier, image_url, description').order('series');
  data.forEach((c, i) => {
    console.log(`${String(i + 1).padStart(2, '0')}. [${c.id.slice(0, 8)}] Series: "${(c.series || '').trim()}" | Name: "${c.name}" | Tier: ${c.tier} | Img: ${c.image_url ? 'YES' : 'NO'}`);
  });
}

list();
