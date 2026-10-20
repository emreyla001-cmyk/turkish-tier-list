const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wgqwizwyftdoxizhrljg.supabase.co', 'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz');

async function checkPairs() {
  const { data } = await supabase.from('characters').select('id, name, series, tier, image_url, description').order('name');
  
  // Group by series
  const bySeries = {};
  data.forEach(c => {
    const s = (c.series || 'Diğer').trim();
    if (!bySeries[s]) bySeries[s] = [];
    bySeries[s].push(c);
  });

  console.log('=== CHARACTERS BY SERIES ===');
  for (const [s, list] of Object.entries(bySeries)) {
    if (list.length > 1) {
      console.log(`\n[Series: "${s}"] (${list.length} characters):`);
      list.forEach(c => {
        console.log(`  - [${c.id.slice(0, 8)}] ${(c.name || '').padEnd(30)} | Tier: ${(c.tier || '').padEnd(8)} | Img: ${c.image_url ? 'YES' : 'NO'}`);
      });
    }
  }
}

checkPairs();
