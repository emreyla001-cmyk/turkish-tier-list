'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { TIERS } from './tiers';
import { CATEGORIES } from './categories';

const emptyForm = {
  name: '', series: '', category: '', tier: '',
  power_score: '', intelligence_score: '', speed_score: '', durability_score: '', influence_score: '',
  description: '', image_url: '', video_url: '', status: 'draft',
};

export default function CharacterForm({ characterId, initial }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [status, setStatus] = useState(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const scoreFields = ['power_score', 'intelligence_score', 'speed_score', 'durability_score', 'influence_score'];

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');

    const payload = { ...form };
    scoreFields.forEach((f) => { payload[f] = payload[f] === '' ? null : Number(payload[f]); });

    let error;
    if (characterId) {
      ({ error } = await supabase.from('characters').update(payload).eq('id', characterId));
    } else {
      ({ error } = await supabase.from('characters').insert(payload));
    }

    if (error) { setStatus(error.message); return; }
    setStatus('Kaydedildi.');
    if (!characterId) window.location.href = '/admin/karakterler';
  }

  async function handleDelete() {
    if (!confirm('Bu karakteri silmek istediğine emin misin?')) return;
    await supabase.from('characters').delete().eq('id', characterId);
    window.location.href = '/admin/karakterler';
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '520px' }}>
      <div className="field"><label>İsim</label><input value={form.name} onChange={(e) => set('name', e.target.value)} required /></div>
      <div className="field"><label>Kaynak (dizi, film, kitap, mitoloji, çizgi roman...)</label><input value={form.series} onChange={(e) => set('series', e.target.value)} /></div>
      <div className="field"><label>Kategori</label><input list="category-list" value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="Listeden seç ya da kendin yaz" />
        <datalist id="category-list">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist></div>
      <div className="field">
        <label>Tier</label>
        <select value={form.tier} onChange={(e) => set('tier', e.target.value)}>
          <option value="">Belirlenmedi</option>
          {TIERS.map((t) => <option key={t.id} value={t.id}>{t.id} — {t.name}</option>)}
        </select>
      </div>

      {scoreFields.map((f) => (
        <div className="field" key={f}>
          <label>{f.replace('_score', '')}</label>
          <input type="number" min="0" max="10" value={form[f]} onChange={(e) => set(f, e.target.value)} />
        </div>
      ))}

      <div className="field"><label>Açıklama / Scaling Gerekçesi</label><input value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
      <div className="field"><label>Görsel URL (Storage'a yükledikten sonra buraya yapıştır)</label><input value={form.image_url} onChange={(e) => set('image_url', e.target.value)} /></div>
      <div className="field"><label>Video URL</label><input value={form.video_url} onChange={(e) => set('video_url', e.target.value)} /></div>

      <div className="field">
        <label>Durum</label>
        <select value={form.status} onChange={(e) => set('status', e.target.value)} style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 13px', color: 'var(--text)' }}>
          <option value="draft">Taslak (yayınlanmaz)</option>
          <option value="published">Yayında</option>
        </select>
      </div>

      <button className="btn" type="submit">Kaydet</button>
      {characterId && <button type="button" onClick={handleDelete} style={{ marginLeft: '10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px 16px' }}>Sil</button>}
      {status && <p style={{ marginTop: '12px', color: 'var(--text-dim)', fontSize: '.85rem' }}>{status}</p>}
    </form>
  );
}
