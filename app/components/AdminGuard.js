'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminGuard({ children }) {
  const [state, setState] = useState('loading');

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState('no-user'); return; }
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
      setState(profile?.is_admin ? 'admin' : 'not-admin');
    }
    check();
  }, []);

  if (state === 'loading') return <p className="wrap">Yükleniyor...</p>;
  if (state === 'no-user') return <div className="wrap empty">Bu sayfayı görmek için giriş yapmalısın.</div>;
  if (state === 'not-admin') return <div className="wrap empty">Bu sayfaya erişim yetkin yok.</div>;
  return children;
}
