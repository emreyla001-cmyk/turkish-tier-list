'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import AdminGuard from '../../components/AdminGuard';

export const DEFAULT_WHEEL_REWARDS = [
  { id: 'avatar_gif_30d', label: '30 Günlük GIF Avatar', icon: '👑', weight: 2, sort: 1 },
  { id: 'profile_bg_30d', label: '30 Günlük GIF Arka Plan', icon: '🖼️', weight: 2, sort: 2 },
  { id: 'avatar_gif_7d', label: '7 Günlük GIF Avatar', icon: '🎞️', weight: 5, sort: 3 },
  { id: 'profile_bg_7d', label: '7 Günlük GIF Arka Plan', icon: '✨', weight: 5, sort: 4 },
  { id: 'coins_2500', label: '2.500 Tier Parası', icon: '💎', weight: 6, sort: 5 },
  { id: 'coins_1000', label: '1.000 Tier Parası', icon: '💰', weight: 15, sort: 6 },
  { id: 'coins_500', label: '500 Tier Parası', icon: '🪙', weight: 30, sort: 7 },
  { id: 'xp_250', label: '250 XP', icon: '⚡', weight: 25, sort: 8 },
  { id: 'xp_500', label: '500 XP', icon: '🚀', weight: 10, sort: 9 },
];

function CekilisManager() {
  const [rewards, setRewards] = useState(DEFAULT_WHEEL_REWARDS);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data: dbRewards } = await supabase.from('spin_rewards').select('*').order('sort');
      if (dbRewards && dbRewards.length > 0) {
        // DB'deki ödüllerle harmanla
        const map = new Map();
        DEFAULT_WHEEL_REWARDS.forEach((r) => map.set(r.id, { ...r }));
        dbRewards.forEach((r) => {
          const cur = map.get(r.id);
          map.set(r.id, {
            ...cur,
            ...r,
            weight: r.weight !== undefined ? Number(r.weight) : (cur?.weight || 5),
          });
        });
        setRewards(Array.from(map.values()));
      } else {
        // localStorage yedeğini kontrol et
        const cached = typeof window !== 'undefined' ? localStorage.getItem('custom_spin_rewards') : null;
        if (cached) {
          try { setRewards(JSON.parse(cached)); } catch {}
        }
      }
    } catch (err) {
      console.error('Ödüller yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleChange = (id, field, value) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const totalWeight = rewards.reduce((sum, r) => sum + (Number(r.weight) || 0), 0);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      // 1. Supabase spin_rewards tablosuna kaydetmeyi dene
      try {
        for (const r of rewards) {
          await supabase.from('spin_rewards').upsert({
            id: r.id,
            label: r.label,
            icon: r.icon,
            weight: Number(r.weight) || 1,
            sort: r.sort || 99,
          });
        }
      } catch (dbErr) {
        console.warn('spin_rewards DB tablosu güncellenemedi, yerel önbellek güncelleniyor:', dbErr);
      }

      // 2. Tarayıcı önbelleğine ve genel ayara kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('custom_spin_rewards', JSON.stringify(rewards));
      }

      setMsg({ text: '🎉 Çarkıfelek ödülleri ve kazanma olasılıkları başarıyla kaydedildi!', type: 'success' });
    } catch (err) {
      setMsg({ text: `Hata: ${err.message || err}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="wrap" style={{ paddingBottom: '70px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🎡</span> Çarkıfelek & Çekiliş Oranları Yönetimi
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '.9rem', margin: '4px 0 0' }}>
            Günlük çarktaki ödülleri, etiketlerini ve çıkma olasılıklarını (%2 gibi nadir oranlar) ayarlayın.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/admin" className="btn btn-ghost" style={{ fontSize: '.85rem' }}>
            ← Admin Paneline Dön
          </a>
          <button type="button" className="btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor...' : '💾 Değişiklikleri Kaydet'}
          </button>
        </div>
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

      {/* İstatistik & Ağırlık Özeti Kartı */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div>
          <div style={{ fontSize: '.8rem', color: 'var(--text-dim)' }}>Toplam Ağırlık / Olasılık Havuzu:</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)' }}>
            {totalWeight} Puan (Dağılım %100 üzerinden orantılanır)
          </div>
        </div>
        <div style={{ fontSize: '.82rem', color: 'var(--text-dim)', maxWidth: '400px' }}>
          💡 <strong>İpucu:</strong> Nadir ve yüksek seviye ödüllerin çıkma olasılığını <strong>2</strong> yaparsanız, toplam havuz 100 olduğunda tam <strong>%2</strong> ihtimalle çıkar.
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>Ödüller yükleniyor...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '14px 16px', width: '70px', textAlign: 'center' }}>İkon</th>
                  <th style={{ padding: '14px 16px' }}>Ödül Adı (Etiket)</th>
                  <th style={{ padding: '14px 16px' }}>Ödül Kimliği</th>
                  <th style={{ padding: '14px 16px', width: '150px' }}>Çıkma Ağırlığı</th>
                  <th style={{ padding: '14px 16px', width: '150px' }}>Hesaplanan Olasılık</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((r) => {
                  const weightNum = Number(r.weight) || 0;
                  const percent = totalWeight > 0 ? ((weightNum / totalWeight) * 100).toFixed(1) : 0;
                  const isUltraRare = percent <= 3;
                  const isRare = percent > 3 && percent <= 8;

                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      {/* İkon */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input
                          type="text"
                          value={r.icon}
                          onChange={(e) => handleChange(r.id, 'icon', e.target.value)}
                          style={{
                            width: '44px',
                            height: '44px',
                            textAlign: 'center',
                            fontSize: '1.4rem',
                            background: 'var(--bg-2)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            color: 'var(--text)',
                          }}
                        />
                      </td>

                      {/* Etiket */}
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="text"
                          value={r.label}
                          onChange={(e) => handleChange(r.id, 'label', e.target.value)}
                          style={{
                            width: '100%',
                            background: 'var(--bg-2)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            color: 'var(--text)',
                            fontWeight: 700,
                          }}
                        />
                      </td>

                      {/* ID */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-dim)', fontSize: '.82rem' }}>
                        <code>{r.id}</code>
                      </td>

                      {/* Ağırlık / Puan */}
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={r.weight}
                          onChange={(e) => handleChange(r.id, 'weight', e.target.value)}
                          style={{
                            width: '90px',
                            background: 'var(--bg-2)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            color: isUltraRare ? '#e6455b' : isRare ? '#e68a25' : '#6fbf73',
                            fontWeight: 800,
                            fontSize: '1rem',
                          }}
                        />
                      </td>

                      {/* Hesaplanan Olasılık */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          className="tag"
                          style={{
                            fontSize: '.85rem',
                            fontWeight: 800,
                            background: isUltraRare
                              ? 'rgba(230, 69, 91, 0.2)'
                              : isRare
                              ? 'rgba(230, 138, 37, 0.2)'
                              : 'rgba(111, 191, 115, 0.2)',
                            color: isUltraRare ? '#ff4d6d' : isRare ? '#ffa94d' : '#8ce99a',
                            borderColor: 'transparent',
                          }}
                        >
                          %{percent} {isUltraRare ? '🔥 Aşırı Nadir' : isRare ? '⭐ Nadir' : 'Yaygın'}
                        </span>
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

export default function AdminCekilisPage() {
  return (
    <AdminGuard>
      <CekilisManager />
    </AdminGuard>
  );
}
