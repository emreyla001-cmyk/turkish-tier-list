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
  const [uploading, setUploading] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const scoreFields = ['power_score', 'intelligence_score', 'speed_score', 'durability_score', 'influence_score'];
  const scoreLabels = {
    power_score: 'Güç',
    intelligence_score: 'Zeka',
    speed_score: 'Hız',
    durability_score: 'Dayanıklılık',
    influence_score: 'Etki / Nüfuz',
  };

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ALLOWED = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
    const ext = ALLOWED[file.type];
    if (!ext) {
      setStatus('Sadece PNG, JPG, WEBP veya GIF yükleyebilirsin.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus('Görsel en fazla 5 MB olabilir.');
      return;
    }
    setUploading(true);
    setStatus('Görsel yükleniyor...');
    const slug = (form.name || 'karakter').toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const filename = `${slug}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('character-media').upload(filename, file, { contentType: file.type, upsert: true });
    if (error) {
      setStatus('Yükleme hatası: ' + (error.message || 'Bilinmeyen hata'));
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('character-media').getPublicUrl(filename);
    set('image_url', data?.publicUrl || '');
    setStatus('✅ Görsel yüklendi ve URL otomatik dolduruldu.');
    setUploading(false);
  }

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
    setStatus('✅ Kaydedildi.');
    if (!characterId) window.location.href = '/admin/karakterler';
  }

  async function handleDelete() {
    if (!confirm('Bu karakteri silmek istediğine emin misin?')) return;
    await supabase.from('characters').delete().eq('id', characterId);
    window.location.href = '/admin/karakterler';
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '11px 13px',
    color: 'var(--text)',
    fontSize: '.95rem',
    boxSizing: 'border-box',
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '620px' }}>
      {/* ─── Temel Bilgiler ─── */}
      <div className="field"><label>İsim *</label><input style={inputStyle} value={form.name} onChange={(e) => set('name', e.target.value)} required /></div>
      <div className="field"><label>Kaynak (dizi, film, kitap, mitoloji, çizgi roman...)</label><input style={inputStyle} value={form.series} onChange={(e) => set('series', e.target.value)} /></div>
      <div className="field">
        <label>Kategori</label>
        <input list="category-list" style={inputStyle} value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="Listeden seç ya da kendin yaz" />
        <datalist id="category-list">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
      </div>

      {/* ─── Tier ─── */}
      <div className="field">
        <label>Tier</label>
        <select style={inputStyle} value={form.tier} onChange={(e) => set('tier', e.target.value)}>
          <option value="">Belirlenmedi</option>
          {TIERS.map((t) => <option key={t.id} value={t.id}>{t.id} — {t.name}</option>)}
        </select>
      </div>

      {/* ─── Stat Skorları ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {scoreFields.map((f) => (
          <div className="field" key={f} style={{ margin: 0 }}>
            <label style={{ fontSize: '.8rem' }}>{scoreLabels[f]} (0-10)</label>
            <input type="number" min="0" max="10" style={inputStyle} value={form[f]} onChange={(e) => set(f, e.target.value)} />
          </div>
        ))}
      </div>

      {/* ─── Açıklama / Scaling ─── */}
      <div className="field" style={{ marginTop: '16px' }}>
        <label>Scaling Açıklaması (Gerekçe & Feats)</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={12}
          placeholder={`1. Güç Adı (Wall Level AP)\nGerekçe: ...\nAçıklama: ...\n\n2. ...\nGerekçe: ...\nAçıklama: ...`}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
        />
      </div>

      {/* ─── Görsel Yükleme ─── */}
      <div className="field">
        <label>Görsel — Storage'dan Yükle</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label
            style={{
              display: 'inline-block', padding: '10px 18px', borderRadius: '10px',
              background: 'linear-gradient(135deg,#6366f1,#a21caf)', color: '#fff',
              cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '.9rem', fontWeight: 600,
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? '⏳ Yükleniyor...' : '📷 Fotoğraf Seç & Yükle'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
          </label>
          {form.image_url && (
            <img src={form.image_url} alt="önizleme" style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--border)' }} />
          )}
        </div>
        <input
          style={{ ...inputStyle, marginTop: '8px', fontSize: '.82rem', color: 'var(--text-dim)' }}
          value={form.image_url}
          onChange={(e) => set('image_url', e.target.value)}
          placeholder="Veya manuel URL yapıştır: https://..."
        />
      </div>

      {/* ─── Video URL ─── */}
      <div className="field">
        <label>Video URL (isteğe bağlı)</label>
        <input style={inputStyle} value={form.video_url} onChange={(e) => set('video_url', e.target.value)} />
      </div>

      {/* ─── Durum ─── */}
      <div className="field">
        <label>Durum</label>
        <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inputStyle}>
          <option value="draft">Taslak (yayınlanmaz)</option>
          <option value="published">Yayında</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
        <button className="btn" type="submit" style={{ flex: 1 }}>💾 Kaydet</button>
        {characterId && (
          <button type="button" onClick={handleDelete}
            style={{ background: 'transparent', border: '1px solid #e6455b', color: '#e6455b', borderRadius: '10px', padding: '10px 18px', cursor: 'pointer', fontWeight: 600 }}>
            🗑 Sil
          </button>
        )}
      </div>
      {status && <p style={{ marginTop: '12px', color: status.startsWith('✅') ? '#6fbf73' : 'var(--text-dim)', fontSize: '.88rem' }}>{status}</p>}
    </form>
  );
}
