'use client';

import { useEffect, useState } from 'react';
import AdminGuard from '../../components/AdminGuard';

export default function AdminEtkinliklerPage() {
  const [config, setConfig] = useState({
    karakter_bilmece: true,
    kim_alir: true,
    cift_odul: false,
    viral_paylasim: true,
    bilmece_odul: 500,
    kim_alir_odul: 750,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Etkinlik ayarları yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(newConfig = config) {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setMsg({ text: '🎉 Etkinlik ve mini oyun ayarları anında güncellendi!', type: 'success' });
      } else {
        throw new Error(data.error || 'Kaydedilemedi');
      }
    } catch (err) {
      setMsg({ text: `Hata: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  const toggleSwitch = (key) => {
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    handleSave(updated);
  };

  return (
    <AdminGuard>
      <div className="wrap" style={{ maxWidth: '800px', paddingBottom: '70px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🎮</span> Etkinlikler & Mini Oyunlar Yönetimi
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '.92rem', margin: '4px 0 0' }}>
              Sitedeki mini oyunları, viral özellikleri ve çift ödül etkinliklerini dilediğin an aç veya kapat.
            </p>
          </div>
          <a href="/admin" className="btn btn-ghost" style={{ fontSize: '.85rem' }}>
            ← Admin Paneli
          </a>
        </div>

        {msg && (
          <div
            className="card"
            style={{
              marginBottom: '20px',
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

        {loading ? (
          <div className="card" style={{ padding: '30px', textAlign: 'center' }}>Etkinlik ayarları yükleniyor...</div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* 1. OYUN: Karakter Bilmece */}
            <div
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderLeft: `4px solid ${config.karakter_bilmece ? '#6fbf73' : 'var(--border)'}`,
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🧩</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Günün Karakterini Bil (Wordle / Karakterle)</h3>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '.84rem' }}>
                      Viral tahmin oyunu. Oyuncular dizisi, gücü ve kategorisine göre gizli karakteri bulur.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px' }}>
                  <span style={{ fontSize: '.82rem', color: 'var(--text-dim)' }}>Ödül Miktarı:</span>
                  <input
                    type="number"
                    value={config.bilmece_odul}
                    onChange={(e) => setConfig({ ...config, bilmece_odul: Number(e.target.value) })}
                    style={{ width: '90px', padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-2)', border: '1px solid var(--border)', color: '#fef08a', fontWeight: 800 }}
                  />
                  <span style={{ fontSize: '.8rem', color: '#fef08a' }}>🪙 Tier Parası</span>
                  <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.75rem' }} onClick={() => handleSave()}>Kaydet</button>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleSwitch('karakter_bilmece')}
                  disabled={saving}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontWeight: 800,
                    fontSize: '.9rem',
                    cursor: 'pointer',
                    background: config.karakter_bilmece ? '#6fbf73' : 'var(--bg-2)',
                    color: config.karakter_bilmece ? '#111' : 'var(--text-dim)',
                    border: config.karakter_bilmece ? 'none' : '1px solid var(--border)',
                    transition: 'all .2s',
                  }}
                >
                  {config.karakter_bilmece ? '✓ AÇIK (Yayında)' : '✕ KAPALI'}
                </button>
              </div>
            </div>

            {/* 2. OYUN: Kim Alır? (Hızlı VS Quiz) */}
            <div
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderLeft: `4px solid ${config.kim_alir ? '#6fbf73' : 'var(--border)'}`,
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.8rem' }}>⚔️</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Kim Alır? (Hızlı VS Düello Quizi)</h3>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '.84rem' }}>
                      10 saniyelik seri kıyaslama oyunu. İki karakterden hangisinin daha güçlü olduğunu bilme.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px' }}>
                  <span style={{ fontSize: '.82rem', color: 'var(--text-dim)' }}>Ödül Miktarı:</span>
                  <input
                    type="number"
                    value={config.kim_alir_odul}
                    onChange={(e) => setConfig({ ...config, kim_alir_odul: Number(e.target.value) })}
                    style={{ width: '90px', padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-2)', border: '1px solid var(--border)', color: '#fef08a', fontWeight: 800 }}
                  />
                  <span style={{ fontSize: '.8rem', color: '#fef08a' }}>🪙 Tier Parası</span>
                  <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '.75rem' }} onClick={() => handleSave()}>Kaydet</button>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleSwitch('kim_alir')}
                  disabled={saving}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontWeight: 800,
                    fontSize: '.9rem',
                    cursor: 'pointer',
                    background: config.kim_alir ? '#6fbf73' : 'var(--bg-2)',
                    color: config.kim_alir ? '#111' : 'var(--text-dim)',
                    border: config.kim_alir ? 'none' : '1px solid var(--border)',
                    transition: 'all .2s',
                  }}
                >
                  {config.kim_alir ? '✓ AÇIK (Yayında)' : '✕ KAPALI'}
                </button>
              </div>
            </div>

            {/* 3. ETKİNLİK: Çift Altın & XP Hafta Sonu */}
            <div
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderLeft: `4px solid ${config.cift_odul ? '#fef08a' : 'var(--border)'}`,
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🌟</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>2X Çift Ödül Etkinliği (Altın & XP Çarpanı)</h3>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '.84rem' }}>
                      Açıldığında sitedeki tüm oyunlar, görevler ve çekilişler 2 katı altın ve XP verir.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleSwitch('cift_odul')}
                  disabled={saving}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontWeight: 800,
                    fontSize: '.9rem',
                    cursor: 'pointer',
                    background: config.cift_odul ? 'linear-gradient(135deg, #fef08a, #eab308)' : 'var(--bg-2)',
                    color: config.cift_odul ? '#111' : 'var(--text-dim)',
                    border: config.cift_odul ? 'none' : '1px solid var(--border)',
                    transition: 'all .2s',
                  }}
                >
                  {config.cift_odul ? '🔥 2X ETKİNLİĞİ AKTİF' : '✕ KAPALI'}
                </button>
              </div>
            </div>

            {/* 4. VİRAL: Skor ve Kart Paylaşımı */}
            <div
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderLeft: `4px solid ${config.viral_paylasim ? '#00f0ff' : 'var(--border)'}`,
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.8rem' }}>📱</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Viral Skor & Sosyal Medya Paylaşım Butonları</h3>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '.84rem' }}>
                      Oyun sonlarında WhatsApp, Twitter ve Instagram'a tek tıkla kopyalanabilir emoji skor kartı.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleSwitch('viral_paylasim')}
                  disabled={saving}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontWeight: 800,
                    fontSize: '.9rem',
                    cursor: 'pointer',
                    background: config.viral_paylasim ? '#00f0ff' : 'var(--bg-2)',
                    color: config.viral_paylasim ? '#111' : 'var(--text-dim)',
                    border: config.viral_paylasim ? 'none' : '1px solid var(--border)',
                    transition: 'all .2s',
                  }}
                >
                  {config.viral_paylasim ? '✓ AÇIK' : '✕ KAPALI'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
