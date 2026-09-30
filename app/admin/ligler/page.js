'use client';

import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';

export default function AdminLiglerPacks() {
  const [config, setConfig] = useState({ leagues: [], packs: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch('/api/leagues')
      .then((res) => res.json())
      .then((data) => {
        setConfig(data || { leagues: [], packs: [] });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  function handleLeagueChange(index, field, value) {
    const updated = [...config.leagues];
    updated[index] = {
      ...updated[index],
      [field]: field.includes('Trophies') ? Number(value) : value,
    };
    setConfig({ ...config, leagues: updated });
  }

  function handlePackChange(index, field, value) {
    const updated = [...config.packs];
    updated[index] = {
      ...updated[index],
      [field]: field === 'price' ? Number(value) : value,
    };
    setConfig({ ...config, packs: updated });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error('Kaydedilemedi');
      setMsg({ type: 'success', text: '✅ Lig isimleri ve kart paketleri başarıyla güncellendi!' });
    } catch (err) {
      setMsg({ type: 'error', text: `❌ Hata: ${err.message}` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminGuard>
      <div className="wrap" style={{ maxWidth: '1000px', paddingBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 10px' }}>
          <div>
            <a href="/admin" style={{ fontSize: '.85rem', color: 'var(--text-dim)' }}>
              ← Admin Paneline Dön
            </a>
            <h1 style={{ margin: '6px 0 0' }}>🏆 Ligler & Kart Paketleri Yönetimi</h1>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn"
            style={{
              padding: '12px 28px',
              fontSize: '1rem',
              fontWeight: 800,
              background: 'var(--accent)',
              color: '#111',
            }}
          >
            {saving ? 'Kaydediliyor...' : '💾 Değişiklikleri Kaydet'}
          </button>
        </div>

        {msg && (
          <div
            className="card"
            style={{
              padding: '12px 18px',
              marginBottom: '20px',
              borderRadius: '8px',
              background: msg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${msg.type === 'success' ? '#22c55e' : '#ef4444'}`,
              color: msg.type === 'success' ? '#22c55e' : '#ef4444',
              fontWeight: 700,
            }}
          >
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className="card">Yükleniyor...</div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* 🏆 LİGLER BÖLÜMÜ */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>🏆</span>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Kupa Ligleri & Rütbe İsimleri</h2>
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '.9rem', marginBottom: '20px' }}>
                Kullanıcıların kart arenasında kazandığı/kaybettiği kupalara göre yükseleceği lig isimlerini ve kupa aralıklarını buradan dilediğin gibi değiştirebilirsin.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {config.leagues.map((league, idx) => (
                  <div
                    key={league.id || idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 140px 140px 100px',
                      gap: '12px',
                      alignItems: 'center',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: `1px solid ${league.color || 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                        İkon
                      </label>
                      <input
                        type="text"
                        value={league.icon || ''}
                        onChange={(e) => handleLeagueChange(idx, 'icon', e.target.value)}
                        style={{ width: '100%', textAlign: 'center', fontSize: '1.2rem', padding: '6px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                        Lig Adı
                      </label>
                      <input
                        type="text"
                        value={league.name || ''}
                        onChange={(e) => handleLeagueChange(idx, 'name', e.target.value)}
                        style={{ width: '100%', fontWeight: 700, padding: '8px 12px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                        Min Kupa
                      </label>
                      <input
                        type="number"
                        value={league.minTrophies}
                        onChange={(e) => handleLeagueChange(idx, 'minTrophies', e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                        Maks Kupa
                      </label>
                      <input
                        type="number"
                        value={league.maxTrophies}
                        onChange={(e) => handleLeagueChange(idx, 'maxTrophies', e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                        Renk Kodu
                      </label>
                      <input
                        type="color"
                        value={league.color || '#eab308'}
                        onChange={(e) => handleLeagueChange(idx, 'color', e.target.value)}
                        style={{ width: '100%', height: '38px', padding: '0', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 📦 KART PAKETLERİ VE FİYAT YÖNETİMİ */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>📦</span>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>FUT Tarzı Kart Paketleri & Fiyatları</h2>
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '.9rem', marginBottom: '20px' }}>
                Kart mağazasında satılan paketlerin isimlerini, altın (Tier Parası) fiyatlarını ve açıklamalarını düzenle.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {config.packs.map((pack, idx) => (
                  <div
                    key={pack.id || idx}
                    className="card"
                    style={{
                      padding: '18px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="text"
                        value={pack.icon || ''}
                        onChange={(e) => handlePackChange(idx, 'icon', e.target.value)}
                        style={{ width: '50px', textAlign: 'center', fontSize: '1.3rem', padding: '6px' }}
                      />
                      <input
                        type="text"
                        value={pack.name || ''}
                        onChange={(e) => handlePackChange(idx, 'name', e.target.value)}
                        style={{ flex: 1, fontWeight: 700, padding: '8px 10px' }}
                        placeholder="Paket Adı"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                        Fiyat (Tier Parası)
                      </label>
                      <input
                        type="number"
                        value={pack.price}
                        onChange={(e) => handlePackChange(idx, 'price', e.target.value)}
                        style={{ width: '100%', fontWeight: 800, color: '#fef08a', padding: '8px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                        Açıklama
                      </label>
                      <textarea
                        rows={2}
                        value={pack.desc || ''}
                        onChange={(e) => handlePackChange(idx, 'desc', e.target.value)}
                        style={{ width: '100%', fontSize: '.85rem', padding: '6px 8px' }}
                      />
                    </div>

                    <div style={{ fontSize: '.75rem', color: 'var(--text-dim)' }}>
                      İçerilen Tier'lar: {pack.tierFilter?.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn"
                style={{
                  padding: '14px 36px',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  background: 'var(--accent)',
                  color: '#111',
                }}
              >
                {saving ? 'Kaydediliyor...' : '💾 Tüm Ayarları Kaydet'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminGuard>
  );
}
