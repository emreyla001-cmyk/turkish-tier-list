import React from 'react';
import { SwordsIcon, ShieldIcon, CrownIcon, TrophyIcon } from '../components/CyberIcons';

export const metadata = {
  title: 'Hakkında · Turkish Tier List',
  description: 'Türk kurgu ve medya evreninin en kapsamlı güç sıralaması, güç derecelendirme (tiering) sistemi ve topluluk platformu.',
};

export default function HakkindaPage() {
  return (
    <div className="wrap" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Hero Banner */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '24px',
        padding: '40px 32px',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '18px', background: 'rgba(6, 182, 212, 0.15)', marginBottom: '16px' }}>
          <TrophyIcon size={40} />
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 12px' }}>
          Turkish Tier List Hakkında
        </h1>
        <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
          Türk dizi, film, mitoloji, edebiyat ve çizgi roman evrenlerinin en kapsamlı güç sıralaması, 
          birebir düello arenas ve topluluk tabanlı güç derecelendirme (tiering) platformu.
        </p>
      </section>

      {/* Vizyon ve Temel Özellikler Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--accent)', marginBottom: '12px' }}><SwordsIcon size={28} /></div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px' }}>Otonom VS Arenası</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '.9rem', margin: 0 }}>
            Karakterlerin güç, zeka, hız ve dayanıklılık değerlerini kıyaslayın; topluluk oylamalarına katılarak tarafınızı seçin.
          </p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ color: '#8b5cf6', marginBottom: '12px' }}><ShieldIcon size={28} /></div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px' }}>VS Battles Tiering Standartları</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '.9rem', margin: 0 }}>
            Sıralamalarımız uluslararası VS Battles Wiki güç kademelerine (10-B Sıradan İnsan'dan 1-A Kozmik Güçlere kadar) göre tarafsızca analiz edilir.
          </p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ color: '#f59e0b', marginBottom: '12px' }}><CrownIcon size={28} /></div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px' }}>Klanlar & Gamification</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '.9rem', margin: 0 }}>
            Kendi klanınızı kurun, günlük görevlerle Tier Parası toplayın, kozmetik mağazasından unvan ve özel çerçeveler kazanın.
          </p>
        </div>
      </div>

      {/* Adil Kullanım Beyanı */}
      <section className="card" style={{ padding: '28px', borderLeft: '4px solid var(--accent)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px' }}>
          📜 Telif & Adil Kullanım (Fair Use) Beyanı
        </h3>
        <p style={{ fontSize: '.9rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.6 }}>
          Turkish Tier List platformunda yer alan tüm karakter analizleri, eleştirel güç derecelendirmesi (tiering), parodi ve mizah amacıyla sunulmaktadır. 
          Karakterlerin ve yapımların tüm ticari marka hakları ilgili yapımcı şirketlere ve hak sahiplerine aittir. 
          Sitemizdeki fotoğraflar stilize kaplamalar ve parodi/analiz görselleri kapsamında değerlendirilmektedir.
        </p>
      </section>
    </div>
  );
}
