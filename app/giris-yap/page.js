'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function GirisYapPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [mfa, setMfa] = useState(null); // { factorId } iki adımlı doğrulama beklerken
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Giriş yapılıyor...');

    let email = identifier.trim();
    if (!email.includes('@')) {
      const { data } = await supabase.rpc('email_for_login', { identifier: email });
      if (!data) { setStatus('Kullanıcı adı/e-posta veya şifre hatalı.'); return; }
      email = data;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(
        error.message.toLowerCase().includes('email not confirmed')
          ? 'E-postanı henüz doğrulamamışsın. Gelen kutundaki linke tıkla.'
          : 'Kullanıcı adı/e-posta veya şifre hatalı.'
      );
      return;
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
      const { data: f } = await supabase.auth.mfa.listFactors();
      const factor = f?.totp?.[0];
      if (factor) {
        setMfa({ factorId: factor.id });
        setStatus('Doğrulama uygulamandaki 6 haneli kodu gir.');
        return;
      }
    }
    window.location.href = '/';
  }

  async function handleMfa(e) {
    e.preventDefault();
    const { data: ch, error } = await supabase.auth.mfa.challenge({ factorId: mfa.factorId });
    if (error) { setStatus(error.message); return; }
    const { error: err2 } = await supabase.auth.mfa.verify({ factorId: mfa.factorId, challengeId: ch.id, code: code.trim() });
    if (err2) { setStatus('Kod hatalı, tekrar dene.'); return; }
    window.location.href = '/';
  }

  async function cancelMfa() {
    await supabase.auth.signOut();
    setMfa(null); setCode(''); setStatus(null);
  }

  return (
    <div className="wrap">
      <div className="auth-card">
        <h1 style={{ fontSize: '1.4rem', textAlign: 'center' }}>Giriş Yap</h1>

        {!mfa ? (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Kullanıcı Adı veya E-posta</label>
              <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoComplete="username" />
            </div>
            <div className="field">
              <label>Şifre</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <button className="btn" type="submit" style={{ width: '100%' }}>Giriş Yap</button>
          </form>
        ) : (
          <form onSubmit={handleMfa}>
            <div className="field">
              <label>Doğrulama Kodu</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" required autoFocus autoComplete="one-time-code" />
            </div>
            <button className="btn" type="submit" style={{ width: '100%' }}>Doğrula</button>
            <button className="btn btn-ghost" type="button" onClick={cancelMfa} style={{ width: '100%', marginTop: '10px' }}>Vazgeç</button>
          </form>
        )}

        {status && <p style={{ marginTop: '14px', color: 'var(--text-dim)', fontSize: '.85rem' }}>{status}</p>}
        {!mfa && (
          <p style={{ marginTop: '14px', fontSize: '.85rem', color: 'var(--text-dim)' }}>
            Hesabın yok mu? <a href="/kayit-ol" style={{ color: 'var(--accent)' }}>Kayıt ol</a>
          </p>
        )}
      </div>
    </div>
  );
}
