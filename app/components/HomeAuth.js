'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

function useUser() {
  const [user, setUser] = useState(undefined); // undefined = henüz bilinmiyor
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
  }, []);
  return user;
}

export function CtaBand() {
  const user = useUser();
  return (
    <div className="cta-band">
      <h2>Favori karakterin listede yok mu?</h2>
      {user ? (
        <>
          <p>Bir karakter öner, editör ekibi incelesin. Uygun bulunan karakterler sıralamaya eklenir.</p>
          <a href="/karakter-oner" className="btn">Karakter Öner</a>
        </>
      ) : (
        <>
          <p>Ücretsiz kayıt ol, önerini gönder. İncelemeden geçen karakterler sıralamaya eklenir.</p>
          <a href="/kayit-ol" className="btn" style={{ visibility: user === undefined ? 'hidden' : 'visible' }}>Ücretsiz Kayıt Ol</a>
        </>
      )}
    </div>
  );
}

export function EmptyNote() {
  const user = useUser();
  if (user) return <>Beklerken <a href="/karakter-oner">sevdiğin bir karakteri önerebilirsin</a>.</>;
  return <>Beklerken <a href="/kayit-ol">kayıt olup</a> sevdiğin bir karakteri önerebilirsin.</>;
}
