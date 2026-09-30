'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import AdminGuard from '../../components/AdminGuard';
import { frameStyle, nameColorStyle, resolveBackground } from '../../components/cosmetics';

// Temel Mağaza Kataloğu
const BASE_CATALOG = [
  { id: 'avatar_gif_permit', kind: 'special_permit', name: 'Hareketli GIF Avatar Hakkı (30 Gün)', price: 30000, value: 'permit_avatar', vip_only: false, active: true },
  { id: 'profile_bg_permit', kind: 'special_permit', name: 'Hareketli Profil Arka Planı (30 Gün)', price: 30000, value: 'permit_bg', vip_only: false, active: true },
  
  // Çerçeveler
  { id: 'frame_gold', kind: 'frame', name: 'Altın Çerçeve', price: 2000, value: 'linear-gradient(135deg,#f4d35e,#e6b325)', vip_only: false, active: true },
  { id: 'frame_sapphire', kind: 'frame', name: 'Safir Çerçeve', price: 2500, value: 'linear-gradient(135deg,#5b8ce6,#1f3a8a)', vip_only: false, active: true },
  { id: 'frame_emerald', kind: 'frame', name: 'Zümrüt Çerçeve', price: 2500, value: 'linear-gradient(135deg,#6fbf73,#1f6b3a)', vip_only: false, active: true },
  { id: 'frame_ruby', kind: 'frame', name: 'Yakut Çerçeve', price: 2000, value: 'linear-gradient(135deg,#e6455b,#8a1f2d)', vip_only: false, active: true },
  { id: 'frame_cosmic', kind: 'frame', name: 'Kozmik Çerçeve', price: 6000, value: 'linear-gradient(135deg,#9b59e6,#e6455b,#5b8ce6)', vip_only: true, active: true },
  { id: 'frame_cyber_pulse', kind: 'frame', name: 'Siber Nabız (Cyber Pulse)', price: 7500, value: 'frame_cyber_pulse', vip_only: false, active: true },
  { id: 'frame_dragon_fire', kind: 'frame', name: 'Ejderha Ateşi (Dragon Fire)', price: 8500, value: 'frame_dragon_fire', vip_only: false, active: true },
  { id: 'frame_obsidian', kind: 'frame', name: 'Obsidyen Zırh', price: 4000, value: 'frame_obsidian', vip_only: false, active: true },
  { id: 'frame_tengri_aura', kind: 'frame', name: 'Tengri Aurası', price: 9000, value: 'frame_tengri_aura', vip_only: false, active: true },
  { id: 'frame_neon_matrix', kind: 'frame', name: 'Matrix Kod Akışı', price: 5000, value: 'frame_neon_matrix', vip_only: false, active: true },

  // İsim Renkleri
  { id: 'nc_gold', kind: 'name_color', name: 'Altın İsim', price: 1000, value: '#e6b325', vip_only: false, active: true },
  { id: 'nc_ruby', kind: 'name_color', name: 'Yakut İsim', price: 1000, value: '#e6455b', vip_only: false, active: true },
  { id: 'nc_azure', kind: 'name_color', name: 'Gök Mavisi İsim', price: 1000, value: '#5b8ce6', vip_only: false, active: true },
  { id: 'nc_emerald', kind: 'name_color', name: 'Zümrüt İsim', price: 1000, value: '#6fbf73', vip_only: false, active: true },
  { id: 'nc_rainbow', kind: 'name_color', name: 'Gökkuşağı İsim (VIP)', price: 4000, value: 'linear-gradient(90deg,#e6455b,#e68a25,#e6c825,#6fbf73,#5b8ce6,#9b59e6)', vip_only: true, active: true },
  { id: 'nc_flame', kind: 'name_color', name: 'Alev Dalgası (Hareketli)', price: 4500, value: 'nc_flame', vip_only: false, active: true },
  { id: 'nc_cyber_cyan', kind: 'name_color', name: 'Siber Camgöbeği (Hareketli)', price: 5000, value: 'nc_cyber_cyan', vip_only: false, active: true },
  { id: 'nc_plasma', kind: 'name_color', name: 'Plazma Moru (Hareketli)', price: 5000, value: 'nc_plasma', vip_only: false, active: true },
  { id: 'nc_toxic', kind: 'name_color', name: 'Zehir Yeşili (Hareketli)', price: 4500, value: 'nc_toxic', vip_only: false, active: true },

  // Profil Arka Planları
  { id: 'bg_aurora', kind: 'background', name: 'Aurora Arka Planı', price: 1500, value: 'linear-gradient(135deg,#1b1f2a,#2a1f45,#12203a)', vip_only: false, active: true },
  { id: 'bg_sunset', kind: 'background', name: 'Gün Batımı Arka Planı', price: 1500, value: 'linear-gradient(135deg,#3a1f2a,#6b2d1f,#2a1210)', vip_only: false, active: true },
  { id: 'bg_forest', kind: 'background', name: 'Orman Arka Planı', price: 1500, value: 'linear-gradient(135deg,#12251a,#1f3a2a,#0d1a12)', vip_only: false, active: true },
  { id: 'bg_cosmic', kind: 'background', name: 'Kozmik Arka Plan (VIP)', price: 5000, value: 'linear-gradient(135deg,#1a0d2e,#3a1055,#0d0d2e)', vip_only: true, active: true },
  { id: 'bg_cyber_neon', kind: 'background', name: 'Siber Şehir Neonu', price: 4500, value: 'bg_cyber_neon', vip_only: false, active: true },
  { id: 'bg_tengri_gold', kind: 'background', name: 'Tengri Altını', price: 6000, value: 'bg_tengri_gold', vip_only: false, active: true },
  { id: 'bg_blood_moon', kind: 'background', name: 'Kanlı Ay Teması', price: 5500, value: 'bg_blood_moon', vip_only: false, active: true },
  { id: 'bg_matrix', kind: 'background', name: 'Matrix Kod Teması', price: 4000, value: 'bg_matrix', vip_only: false, active: true },
  { id: 'bg_void', kind: 'background', name: 'Kozmik Hiçlik (Void)', price: 5000, value: 'bg_void', vip_only: false, active: true },
];

function MagazaManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [filter, setFilter] = useState('all');
  const [savingId, setSavingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { data: dbItems } = await supabase.from('shop_items').select('*').order('sort');
      const itemMap = new Map();
      BASE_CATALOG.forEach((it) => itemMap.set(it.id, { ...it }));

      (dbItems || []).forEach((dbIt) => {
        const existing = itemMap.get(dbIt.id);
        itemMap.set(dbIt.id, {
          ...existing,
          ...dbIt,
          price: dbIt.price !== undefined ? dbIt.price : existing?.price,
          vip_only: dbIt.vip_only !== undefined ? dbIt.vip_only : existing?.vip_only,
          active: dbIt.active !== undefined ? dbIt.active : (existing?.active ?? true),
        });
      });

      setItems(Array.from(itemMap.values()));
    } catch (err) {
      console.error('Mağaza eşyaları yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  async function saveItem(item) {
    setSavingId(item.id);
    setMsg(null);
    try {
      const payload = {
        id: item.id,
        kind: item.kind,
        name: item.name,
        price: Number(item.price),
        value: item.value,
        vip_only: !!item.vip_only,
        active: item.active !== false,
      };

      const { error } = await supabase.from('shop_items').upsert(payload);
      if (error) throw error;

      setMsg({ text: `"${item.name}" başarıyla güncellendi! Yeni fiyat: ${Number(item.price).toLocaleString('tr-TR')} Tier Parası.`, type: 'success' });
    } catch (err) {
      setMsg({ text: `Kayıt hatası: ${err.message || err}`, type: 'error' });
    } finally {
      setSavingId(null);
    }
  }

  const filteredItems = filter === 'all' ? items : items.filter((i) => i.kind === filter);

  return (
    <div className="wrap" style={{ paddingBottom: '70px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🛍️</span> Mağaza & Fiyat Yönetimi
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '.9rem', margin: '4px 0 0' }}>
            Kozmetik ürünlerin ve özel GIF haklarının altın fiyatlarını doğrudan değiştirin.
          </p>
        </div>
        <a href="/admin" className="btn btn-ghost" style={{ fontSize: '.85rem' }}>
          ← Admin Paneline Dön
        </a>
      </div>

      {msg && (
        <div
          className="card"
          style={{
            marginBottom: '18px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: msg.type === 'error' ? 'rgba(230,69,91,.15)' : 'rgba(111,191,115,.15)',
            border: `1px solid ${msg.type === 'error' ? '#e6455b' : '#6fbf73'}`,
            color: msg.type === 'error' ? '#e6455b' : '#6fbf73',
            fontWeight: 700,
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Kategori Filtresi */}
      <div className="filter-tabs" style={{ marginBottom: '20px' }}>
        <button type="button" className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          Tümü ({items.length})
        </button>
        <button type="button" className={`filter-tab ${filter === 'special_permit' ? 'active' : ''}`} onClick={() => setFilter('special_permit')}>
          Özel Haklar (GIF)
        </button>
        <button type="button" className={`filter-tab ${filter === 'frame' ? 'active' : ''}`} onClick={() => setFilter('frame')}>
          Çerçeveler
        </button>
        <button type="button" className={`filter-tab ${filter === 'name_color' ? 'active' : ''}`} onClick={() => setFilter('name_color')}>
          İsim Renkleri
        </button>
        <button type="button" className={`filter-tab ${filter === 'background' ? 'active' : ''}`} onClick={() => setFilter('background')}>
          Arka Planlar
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>Eşyalar yükleniyor...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '14px 16px' }}>Önizleme</th>
                  <th style={{ padding: '14px 16px' }}>Eşya Adı</th>
                  <th style={{ padding: '14px 16px' }}>Kategori</th>
                  <th style={{ padding: '14px 16px', minWidth: '160px' }}>Fiyat (Tier Parası 🪙)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>Sadece VIP</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>Satışta (Aktif)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((it) => {
                  const isSaving = savingId === it.id;
                  return (
                    <tr key={it.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      {/* Önizleme */}
                      <td style={{ padding: '12px 16px', width: '60px' }}>
                        {it.kind === 'frame' && (
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', ...frameStyle(it.value) }} />
                        )}
                        {it.kind === 'background' && (
                          <div style={{ width: '50px', height: '28px', borderRadius: '6px', background: resolveBackground(it.value) || it.value }} />
                        )}
                        {it.kind === 'name_color' && (
                          <span style={{ ...nameColorStyle(it.value), fontSize: '1rem' }}>Örnek</span>
                        )}
                        {it.kind === 'special_permit' && (
                          <span style={{ fontSize: '1.6rem' }}>{it.id === 'avatar_gif_permit' ? '🎞️' : '🖼️'}</span>
                        )}
                      </td>

                      {/* İsim */}
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="text"
                          value={it.name}
                          onChange={(e) => handleChange(it.id, 'name', e.target.value)}
                          style={{
                            background: 'transparent',
                            border: '1px solid transparent',
                            color: 'var(--text)',
                            fontWeight: 700,
                            padding: '4px 6px',
                            borderRadius: '6px',
                            width: '100%',
                          }}
                          onFocus={(e) => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.background = 'var(--bg-2)'; }}
                          onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent'; }}
                        />
                        <div style={{ fontSize: '.75rem', color: 'var(--text-dim)', paddingLeft: '6px' }}>id: {it.id}</div>
                      </td>

                      {/* Kategori */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-dim)', fontSize: '.82rem' }}>
                        {it.kind === 'special_permit' ? 'Özel Hak (30 Gün)' : it.kind === 'frame' ? 'Çerçeve' : it.kind === 'name_color' ? 'İsim Rengi' : 'Arka Plan'}
                      </td>

                      {/* Fiyat Input */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#fef08a' }}>🪙</span>
                          <input
                            type="number"
                            value={it.price}
                            onChange={(e) => handleChange(it.id, 'price', e.target.value)}
                            style={{
                              width: '110px',
                              background: 'var(--bg-2)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              color: '#fef08a',
                              fontWeight: 800,
                              fontSize: '.95rem',
                            }}
                          />
                        </div>
                      </td>

                      {/* Sadece VIP */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={!!it.vip_only}
                          onChange={(e) => handleChange(it.id, 'vip_only', e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </td>

                      {/* Aktiflik */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={it.active !== false}
                          onChange={(e) => handleChange(it.id, 'active', e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </td>

                      {/* Kaydet Butonu */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn"
                          style={{ padding: '6px 14px', fontSize: '.82rem' }}
                          onClick={() => saveItem(it)}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminMagazaPage() {
  return (
    <AdminGuard>
      <MagazaManager />
    </AdminGuard>
  );
}
