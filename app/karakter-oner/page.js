'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { TIERS } from '../components/tiers';
import { CATEGORIES } from '../components/categories';

const STATS = [
  ['power', 'Güç'], ['intelligence', 'Zeka'], ['speed', 'Hız'], ['durability', 'Dayanıklılık'], ['influence', 'Etki'],
];

const empty = {
  name: '', category: '', series: '', tier: '', scaling: '', evidence: '', image_url: '',
  power: '', intelligence: '', speed: '', durability: '', influence: '', confirm: false,
};

export default function KarakterOnerPage() {
  const [user, setUser] = useState(undefined);
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
  }, []);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.confirm) { setStatus('Lütfen karakterin gerçek ve bilinen bir eserde ya da mitolojide yer aldığını onayla.'); return; }
    setBusy(true);
    setStatus(null);

    const num = (v) => (v === '' ? null : Number(v));
    const { error } = await supabase.from('character_submissions').insert({
      proposed_name: form.name.trim(),
      proposed_category: form.category,
      proposed_series: form.series.trim(),
      proposed_tier: form.tier || null,
      proposed_scaling: form.scaling.trim(),
      evidence: form.evidence.trim() || null,
      image_url: form.image_url.trim() || null,
      proposed_power: num(form.power),
      proposed_intelligence: num(form.intelligence),
      proposed_speed: num(form.speed),
      proposed_durability: num(form.durability),
      proposed_influence: num(form.influence),
      submitted_by: user.id,
    });
    setBusy(false);

    if (error) { setStatus('Öneri gönderilemedi: ' + error.message); return; }
    setStatus('Öneri gönderildi! Editör ekibi inceledikten sonra uygun bulunursa sitede yayınlanacak.');
    setForm(empty);
  }

  if (user === undefined) return <div className="wrap empty">Yükleniyor...</div>;

  if (!user) {
    return (
      <div className="wrap empty">
        Karakter önerebilmek için önce <a href="/giris-yap">giriş yapman</a> ya da <a href="/kayit-ol">kayıt olman</a> gerekiyor.
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="auth-card" style={{ maxWidth: '620px' }}>
        <h1 style={{ fontSize: '1.4rem' }}>Karakter Öner</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '.88rem' }}>
          Dizi, film, kitap, roman, çizgi roman, Türk mitolojisi, destan ya da masal... Karakter gerçek ve bilinen bir esere ait olmalı. Gönderdiğin öneri editör onayından geçtikten sonra yayınlanır.
        </p>

        {/* Katkıcı Ödülü Bilgilendirme Kutusu */}
        <div
          style={{
            margin: '14px 0 20px',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.05))',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '2rem' }}>🌟</span>
          <div>
            <strong style={{ color: '#f59e0b', fontSize: '.92rem' }}>Katkıcı Ödül Programı:</strong>
            <p style={{ margin: '2px 0 0', fontSize: '.82rem', color: 'var(--text-dim)' }}>
              Önerdiğin karakter incelenip onaylandığında profiline kalıcı <span style={{ color: '#f59e0b', fontWeight: 700 }}>"🌟 Evren Katkıcısı"</span> rozeti, <strong style={{ color: '#fef08a' }}>1.000 Tier Parası</strong> ve <strong style={{ color: '#86efac' }}>500 XP</strong> otomatik tanımlanır!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Karakter Adı *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} required maxLength={80} />
          </div>
          <div className="field">
            <label>Kaynak Türü *</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} required>
              <option value="">Seç...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Kaynak Adı * (dizi, film, kitap ya da mitoloji/destan adı)</label>
            <input value={form.series} onChange={(e) => set('series', e.target.value)} required maxLength={120} />
          </div>
          <div className="field">
            <label>Önerdiğin Tier (isteğe bağlı)</label>
            <select value={form.tier} onChange={(e) => set('tier', e.target.value)}>
              <option value="">Emin değilim</option>
              {TIERS.map((t) => <option key={t.id} value={t.id}>{t.id} — {t.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Önerdiğin Güç Değerleri, 0-10 (isteğe bağlı)</label>
            <div className="score-grid">
              {STATS.map(([key, label]) => (
                <input key={key} type="number" min="0" max="10" placeholder={label} value={form[key]} onChange={(e) => set(key, e.target.value)} />
              ))}
            </div>
          </div>

          <div className="field">
            <label>Scaling Gerekçen * (neden bu seviyede?)</label>
            <textarea value={form.scaling} onChange={(e) => set('scaling', e.target.value)} required minLength={20} maxLength={2000} rows={5} />
          </div>
          <div className="field">
            <label>Kaynak Sahne / Bölüm / Sayfa (isteğe bağlı)</label>
            <textarea value={form.evidence} onChange={(e) => set('evidence', e.target.value)} maxLength={1000} rows={3} placeholder="Örnek: 2. sezon 5. bölüm, ..." />
          </div>
          <div className="field">
            <label>Görsel Bağlantısı (isteğe bağlı)</label>
            <input type="url" value={form.image_url} onChange={(e) => set('image_url', e.target.value)} placeholder="https://..." />
          </div>

          <label className="check" style={{ marginBottom: '16px' }}>
            <input type="checkbox" checked={form.confirm} onChange={(e) => set('confirm', e.target.checked)} />
            <span>Bu karakter gerçek ve bilinen bir eserde ya da mitolojide yer alıyor; kendi uydurduğum bir karakter değil.</span>
          </label>

          <button className="btn" type="submit" disabled={busy} style={{ width: '100%' }}>{busy ? 'Gönderiliyor...' : 'Öneriyi Gönder'}</button>
        </form>
        {status && <p style={{ marginTop: '14px', color: 'var(--text-dim)', fontSize: '.88rem' }}>{status}</p>}
      </div>
    </div>
  );
}
