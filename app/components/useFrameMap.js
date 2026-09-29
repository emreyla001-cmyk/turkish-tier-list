'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { KNOWN_BACKGROUNDS, KNOWN_FRAMES, KNOWN_NAME_COLORS } from './cosmetics';

// Modül düzeyinde önbellek: ürün id -> CSS değeri
let cache = {
  ...KNOWN_FRAMES,
  ...KNOWN_BACKGROUNDS,
  ...KNOWN_NAME_COLORS,
};

export function useFrameMap() {
  const [map, setMap] = useState(cache);

  useEffect(() => {
    supabase
      .from('shop_items')
      .select('id, value, kind')
      .then(({ data }) => {
        if (data && data.length > 0) {
          const m = { ...cache };
          data.forEach((it) => {
            m[it.id] = it.value;
            m[it.value] = it.value; // Çift taraflı eşleme
          });
          cache = m;
          setMap(m);
        }
      });
  }, []);

  return map;
}

export const useCosmeticsMap = useFrameMap;
