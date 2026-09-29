'use client';

import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ViewLogger({ characterId }) {
  useEffect(() => {
    const key = `viewed:${characterId}`;
    const last = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - last > 60000) {
      supabase.rpc('log_character_view', { cid: characterId });
      sessionStorage.setItem(key, String(Date.now()));
    }
  }, [characterId]);
  return null;
}
