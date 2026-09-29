'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

let cache = null; // modül düzeyinde önbellek: ürün id -> CSS gradient (çerçeve + arka plan)

export function useFrameMap() {
  const [map, setMap] = useState(cache || {});
  useEffect(() => {
    if (cache) { setMap(cache); return; }
    supabase.from('shop_items').select('id, value').in('kind', ['frame', 'background']).then(({ data }) => {
      const m = {};
      (data || []).forEach((it) => { m[it.id] = it.value; });
      cache = m;
      setMap(m);
    });
  }, []);
  return map;
}
