'use client';

import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

// Giriş yapmış kullanıcı sayfa açıkken dakikada bir sunucuya haber verir (günlük giriş ve vakit XP'si için)
export default function Heartbeat() {
  useEffect(() => {
    let timer;
    let active = false;
    const ping = () => {
      if (document.visibilityState === 'visible') {
        try { supabase.rpc('heartbeat').catch(() => {}); } catch {}
      }
    };
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      active = true;
      ping();
      timer = setInterval(ping, 60000);
    });
    const onVisible = () => { if (active) ping(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return null;
}
