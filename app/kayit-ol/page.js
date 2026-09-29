'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function KayitOlPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
      setStatus('Kullanıcı adı 3-20 karakter olmalı; sadece harf, rakam ve alt çizgi (_) kullanabilirsin.');
      return;
    }

    setStatus('Kontrol ediliyor...');

    const { data: available } = await supabase.rpc('username_available', { uname: username });
    if (available === false) {
      setStatus('Bu kullanıcı adı zaten alınmış, başka bir tane dene.');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus('Kayıt başarılı! E-postana gelen doğrulama linkine tıkla, sonra giriş yapabilirsin.');
  }

  return (
    <div className="wrap">
      <div className="auth-card">
        <h1 style={{ fontSize: '1.4rem', textAlign: 'center' }}>Hesap Oluştur</h1>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Kullanıcı Adı</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={20} />
          </div>
          <div className="field">
            <label>E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Şifre</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button className="btn" type="submit" style={{ width: '100%' }}>Kayıt Ol</button>
        </form>
        {status && <p style={{ marginTop: '14px', color: 'var(--text-dim)', fontSize: '.85rem' }}>{status}</p>}
        <p style={{ marginTop: '14px', fontSize: '.85rem', color: 'var(--text-dim)' }}>
          Zaten hesabın var mı? <a href="/giris-yap" style={{ color: 'var(--accent)' }}>Giriş yap</a>
        </p>
      </div>
    </div>
  );
}
