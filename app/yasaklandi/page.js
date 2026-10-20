'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function YasaklandiSayfasi() {
  const [banReason, setBanReason] = useState('Sistemde hile / güvenlik açığı istismarı teşebbüsü tespit edildi.');
  const [banTime, setBanTime] = useState('');
  const [banId, setBanId] = useState('');

  useEffect(() => {
    // URL parametrelerinden veya localStorage'dan gerekçeyi al
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlReason = params.get('reason');
      const localReason = localStorage.getItem('ttl_ban_reason');
      const localTime = localStorage.getItem('ttl_ban_time');

      if (urlReason) setBanReason(decodeURIComponent(urlReason));
      else if (localReason) setBanReason(localReason);

      setBanTime(localTime || new Date().toLocaleString('tr-TR'));
      setBanId(`TTL-SEC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

      // Kullanıcı oturumunu tamamen kapat
      supabase.auth.signOut().catch(() => {});
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '680px',
          width: '100%',
          textAlign: 'center',
          padding: '40px 30px',
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(25, 10, 15, 0.95), rgba(15, 5, 8, 0.98))',
          border: '2px solid #ef4444',
          boxShadow: '0 0 50px rgba(239, 68, 68, 0.35)',
        }}
      >
        <div style={{ fontSize: '4.5rem', marginBottom: '14px', animation: 'pulse 1.5s infinite' }}>
          ⛔
        </div>

        <div
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '20px',
            fontSize: '.82rem',
            fontWeight: 900,
            letterSpacing: '2px',
            marginBottom: '16px',
            textTransform: 'uppercase',
          }}
        >
          Güvenlik Kalkanı İhlali
        </div>

        <h1 style={{ fontSize: '2.1rem', margin: '0 0 12px', color: '#fff', fontWeight: 900 }}>
          HESABINIZ KALICI OLARAK YASAKLANDI
        </h1>

        <p style={{ color: '#fca5a5', fontSize: '1rem', lineHeight: '1.6', margin: '0 auto 24px', maxWidth: '520px' }}>
          Sistemde hile teşebbüsü, veri manipülasyonu veya güvenlik kurallarına aykırı yetkisiz işlem tespit edildiği için erişiminiz <strong>süresiz (PERMA-BAN)</strong> olarak engellenmiştir.
        </p>

        {/* Detay Kutusu */}
        <div
          style={{
            textAlign: 'left',
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginBottom: '24px',
            fontSize: '.88rem',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ color: '#ef4444', fontWeight: 800, marginBottom: '8px' }}>
            ⚠️ İHLAL RAPORU & CEZA BİLGİSİ:
          </div>
          <div style={{ color: '#ccc', marginBottom: '6px' }}>
            <span style={{ color: '#888' }}>Ceza Türü:</span> <strong style={{ color: '#ef4444' }}>Kalıcı İhraç (Permanent Ban)</strong>
          </div>
          <div style={{ color: '#ccc', marginBottom: '6px' }}>
            <span style={{ color: '#888' }}>Tespit Edilen İhlal:</span> {banReason}
          </div>
          <div style={{ color: '#ccc', marginBottom: '6px' }}>
            <span style={{ color: '#888' }}>Tarih / Saat:</span> {banTime}
          </div>
          <div style={{ color: '#ccc' }}>
            <span style={{ color: '#888' }}>Kayıt Referansı:</span> {banId}
          </div>
        </div>

        <div style={{ fontSize: '.82rem', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 24px' }}>
          Turkish Tier List güvenlik kalkanı, hile ve istismar girişimlerine karşı sıfır tolerans politikasıyla çalışır. Bu karar otomatik güvenlik kuralları tarafından verilmiştir ve geri alınamaz.
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a
            href="/"
            className="btn btn-ghost"
            style={{ padding: '10px 24px', fontSize: '.88rem', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
}
