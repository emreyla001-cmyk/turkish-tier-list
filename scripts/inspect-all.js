const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wgqwizwyftdoxizhrljg.supabase.co', 'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz');

async function inspect() {
  const { data } = await supabase.from('characters').select('id, name, series, category, tier, image_url, description').order('name');
  data.slice(0, 48).forEach((c, idx) => {
    const summary = (c.description || '').replace(/\n/g, ' ').slice(0, 140);
    console.log(`#${String(idx + 1).padStart(2, '0')} [${c.id.slice(0, 8)}] Name: "${c.name}" | Series: "${c.series}" | Tier: ${c.tier} | Img: ${c.image_url ? 'YES' : 'NO'}`);
    console.log(`   Desc: ${summary}...`);
  });
}

inspect();
