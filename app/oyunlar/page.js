'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { getDailyPlays, MAX_DAILY_PLAYS } from '../lib/dailyLimit';

export default function OyunlarHubPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bilmecePlays, setBilmecePlays] = useState(0);
  const [kimAlirPlays, setKimAlirPlays] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const bPlays = getDailyPlays(user, 'bilmece');
        const kPlays = getDailyPlays(user, 'kim_alir');
        setBilmecePlays(bPlays);
        setKimAlirPlays(kPlays);

        const res = await fetch('/api/events');
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const isDouble = !!config?.cift_odul;

  return (
    <div className="wrap" style={{ maxWidth: '860px', paddingBottom: '70px' }}>
      <div style={{ marginTop: '20px', marginBottom: '24px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🎮</span> Mini Oyunlar & Topluluk Etkinlikleri
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '.95rem', margin: '6px 0 0' }}>
          Türk kurgu karakterleri bilginizi sınayın, arkadaşlarınıza meydan okuyun ve her gün ekstra Tier Parası kazanın!
        </p>
      </div>

      {/* 2X Etkinlik Bandı */}
      {isDouble && (
        <div
          className="card"
          style={{
            marginBottom: '24px',
            padding: '16px 22px',
            background: 'linear-gradient(135deg, rgba(254, 240, 138, 0.15), rgba(234, 179, 8, 0.05))',
            border: '1px solid #fef08a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2rem' }}>🌟</span>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#fef08a' }}>2X ÇİFT ÖDÜL ETKİNLİĞİ AKTİF!</strong>
              <p style={{ margin: '2px 0 0', fontSize: '.84rem', color: 'var(--text-dim)' }}>
                Tüm mini oyunlardan kazanılan Tier Parası ve XP iki katına çıkarıldı.
              </p>
            </div>
          </div>
          <span className="tag" style={{ background: '#fef08a', color: '#111', fontWeight: 800 }}>
            AKTİF ETKİNLİK
          </span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>Etkinlikler yükleniyor...</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* 1. OYUN KARTI: Karakter Bilmece */}
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '24px',
              position: 'relative',
              borderColor: config?.karakter_bilmece ? 'var(--accent)' : 'var(--border)',
              opacity: config?.karakter_bilmece ? 1 : 0.6,
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '2.5rem' }}>🧩</span>
                <span
                  className="tag"
                  style={{
                    background: config?.karakter_bilmece ? 'rgba(111, 191, 115, 0.2)' : 'rgba(230, 69, 91, 0.2)',
                    color: config?.karakter_bilmece ? '#8ce99a' : '#ff4d6d',
                    fontWeight: 800,
                  }}
                >
                  {config?.karakter_bilmece ? '✓ YAYINDA' : '🔒 KAPALI'}
                </span>
              </div>

              <h2 style={{ fontSize: '1.3rem', margin: '0 0 8px' }}>Günün Karakterini Bil (Karakterle)</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '.88rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                Wordle tarzı tahmin oyunu! Dizi, kategori, tier ve güç göstergelerini takip ederek günün gizli Türk karakterini en az denemede bulmaya çalış.
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <span className="coin-pill" style={{ fontSize: '.8rem' }}>
                  🪙 {isDouble ? (config?.bilmece_odul || 500) * 2 : (config?.bilmece_odul || 500)} Tier Parası
                </span>
                <span className="tag" style={{ fontSize: '.8rem' }}>⚡ 250 XP</span>
                <span className="tag" style={{ fontSize: '.8rem', color: bilmecePlays >= MAX_DAILY_PLAYS ? '#ef4444' : '#fef08a' }}>
                  🎮 Günlük Hak: {Math.max(0, MAX_DAILY_PLAYS - bilmecePlays)} / {MAX_DAILY_PLAYS}
                </span>
              </div>
            </div>

            {config?.karakter_bilmece ? (
              bilmecePlays >= MAX_DAILY_PLAYS ? (
                <button type="button" className="btn btn-ghost" disabled style={{ width: '100%', color: '#ef4444' }}>
                  ⏳ Bugünkü 5 Hak Doldu (5/5)
                </button>
              ) : (
                <a href="/oyunlar/karakter-bilmece" className="btn" style={{ width: '100%', textAlign: 'center', fontWeight: 800 }}>
                  🎮 Şimdi Oyna →
                </a>
              )
            ) : (
              <button type="button" className="btn btn-ghost" disabled style={{ width: '100%' }}>
                🔒 Etkinlik Geçici Olarak Kapalı
              </button>
            )}
          </div>

          {/* 2. OYUN KARTI: Kim Alır? */}
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '24px',
              position: 'relative',
              borderColor: config?.kim_alir ? 'var(--accent)' : 'var(--border)',
              opacity: config?.kim_alir ? 1 : 0.6,
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '2.5rem' }}>⚔️</span>
                <span
                  className="tag"
                  style={{
                    background: config?.kim_alir ? 'rgba(111, 191, 115, 0.2)' : 'rgba(230, 69, 91, 0.2)',
                    color: config?.kim_alir ? '#8ce99a' : '#ff4d6d',
                    fontWeight: 800,
                  }}
                >
                  {config?.kim_alir ? '✓ YAYINDA' : '🔒 KAPALI'}
                </span>
              </div>

              <h2 style={{ fontSize: '1.3rem', margin: '0 0 8px' }}>Kim Alır? (Hızlı VS Quiz)</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '.88rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                İki Türk karakter karşı karşıya gelse kim alır? 10 saniyelik seri kıyaslama turuyla tier ve güç bilgini test et, seriyi tamamla!
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <span className="coin-pill" style={{ fontSize: '.8rem' }}>
                  🪙 {isDouble ? (config?.kim_alir_odul || 750) * 2 : (config?.kim_alir_odul || 750)} Tier Parası
                </span>
                <span className="tag" style={{ fontSize: '.8rem' }}>⚡ 350 XP</span>
                <span className="tag" style={{ fontSize: '.8rem', color: kimAlirPlays >= MAX_DAILY_PLAYS ? '#ef4444' : '#fef08a' }}>
                  🎮 Günlük Hak: {Math.max(0, MAX_DAILY_PLAYS - kimAlirPlays)} / {MAX_DAILY_PLAYS}
                </span>
              </div>
            </div>

            {config?.kim_alir ? (
              kimAlirPlays >= MAX_DAILY_PLAYS ? (
                <button type="button" className="btn btn-ghost" disabled style={{ width: '100%', color: '#ef4444' }}>
                  ⏳ Bugünkü 5 Hak Doldu (5/5)
                </button>
              ) : (
                <a href="/oyunlar/kim-alir" className="btn" style={{ width: '100%', textAlign: 'center', fontWeight: 800 }}>
                  ⚔️ Düelloya Başla →
                </a>
              )
            ) : (
              <button type="button" className="btn btn-ghost" disabled style={{ width: '100%' }}>
                🔒 Etkinlik Geçici Olarak Kapalı
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
