'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function NavAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', data.user.id).maybeSingle();
        setIsAdmin(!!profile?.is_admin);
      }
    });
  }, []);

  async function handleLogout(e) {
    e.preventDefault();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (!user) return <a href="/giris-yap">Giriş Yap</a>;

  return (
    <>
      <a href="/magaza">Mağaza</a>
      <a href="/cekilis">Çekiliş</a>
      <a href="/gorevler">Görevler</a>
      <a href="/profil">Profil</a>
      {isAdmin && <a href="/admin">Admin</a>}
      <a href="#" onClick={handleLogout}>Çıkış Yap</a>
    </>
  );
}
