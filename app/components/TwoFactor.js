'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function TwoFactor() {
  const [factor, setFactor] = useState(null);
  const [enroll, setEnroll] = useState(null);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  const [supported, setSupported] = useState(true);

  async function load() {
    try {
      if (!supabase?.auth?.mfa?.listFactors) {
        setSupported(false);
        return;
      }
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        setSupported(false);
        return;
      }
      setFactor(data?.totp?.[0] || null);
    } catch {
      setSupported(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function start() {
    try {
      setMsg(null);
      const { data: all } = await supabase.auth.mfa.listFactors();
      for (const f of all?.all || []) {
        if (f.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Turkish Tier List ${Date.now()}` });
      if (error) { setMsg(error.message); return; }
      setEnroll({ id: data.id, qr: data?.totp?.qr_code, secret: data?.totp?.secret });
    } catch (e) {
      setMsg(e.message || 'MFA başlatılamadı.');
    }
  }

  async function verifyCode(factorId) {
    try {
      const { data: ch, error } = await supabase.auth.mfa.challenge({ factorId });
      if (error) return error.message;
      const { error: err2 } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code: code.trim() });
      return err2 ? 'Kod hatalı, tekrar dene.' : null;
    } catch (e) {
      return e.message || 'Doğrulama başarısız.';
    }
  }

  async function confirmEnroll(e) {
    e.preventDefault();
    const problem = await verifyCode(enroll.id);
    if (problem) { setMsg(problem); return; }
    setEnroll(null); setCode('');
    setMsg('İki adımlı doğrulama açıldı. Bundan sonra girişte uygulamadaki kodu gireceksin.');
    load();
  }

  async function disable(e) {
    e.preventDefault();
    const problem = await verifyCode(factor.id);
    if (problem) { setMsg(problem); return; }
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    setCode('');
    setMsg(error ? error.message : 'İki adımlı doğrulama kapatıldı.');
    load();
  }

  if (!supported) return null;

  return (
    <div className="card" style={{ marginTop: '14px' }}>
      <h3>İki Adımlı Doğrulama {factor && <span className="tag">Açık</span>}</h3>
      <p>Hesabının çalınmasına karşı ek koruma. Girişte, telefonundaki doğrulama uygulamasının (Google Authenticator, Microsoft Authenticator, Authy gibi) 6 haneli kodu da istenir.</p>

      {!factor && !enroll && (
        <button type="button" className="btn" style={{ marginTop: '12px' }} onClick={start}>Etkinleştir</button>
      )}

      {enroll && (
        <form onSubmit={confirmEnroll} style={{ marginTop: '14px' }}>
          <p>1) Doğrulama uygulamanda yeni hesap ekle ve bu QR kodu okut:</p>
          {enroll.qr && <img src={enroll.qr} alt="QR kod" className="qr" />}
          <p style={{ fontSize: '.8rem' }}>Okutamıyorsan bu anahtarı elle gir: <code>{enroll.secret}</code></p>
          <p style={{ marginTop: '10px' }}>2) Uygulamanın gösterdiği 6 haneli kodu yaz:</p>
          <div className="field" style={{ marginTop: '8px' }}>
            <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" required />
          </div>
          <button className="btn" type="submit">Doğrula ve Aç</button>
        </form>
      )}

      {factor && (
        <form onSubmit={disable} style={{ marginTop: '14px' }}>
          <p>Kapatmak için uygulamadaki güncel kodu gir:</p>
          <div className="field" style={{ marginTop: '8px' }}>
            <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" required />
          </div>
          <button className="btn btn-ghost" type="submit">Kapat</button>
        </form>
      )}

      {msg && <p style={{ marginTop: '10px', color: 'var(--text-dim)', fontSize: '.85rem' }}>{msg}</p>}
    </div>
  );
}
