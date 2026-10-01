'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { TrophyIcon, ShieldIcon, EnergyIcon } from '../components/CyberIcons';

const CATEGORIES = [
  'Karakter Güçleri & Tier List Hataları',
  'Mini Oyunlar (Bilmece, Draft Duel, Kim Alır)',
  'Kart Arenası & Mağaza / Çekilişler',
  'Kullanıcı Profili & Kozmetikler',
  'Site Tasarımı & Mobil Uyum',
  'Diğer Öneri veya Şikayet',
];

export default function SikayetIstekPage() {
  const [user, setUser] = useState(undefined);
  const [type, setType] = useState('istek'); // 'istek' | 'sikayet'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState('normal'); // 'düşük' | 'normal' | 'yüksek' | 'kritik'
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [myTickets, setMyTickets] = useState([]);

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u || null);

      if (u) {
        // Kullanıcının mevcut istek/şikayet geçmişini yükle
        loadUserTickets(u);
      }
    }
    init();
  }, []);

  function loadUserTickets(u) {
    try {
      const localTickets = typeof window !== 'undefined' ? localStorage.getItem(`user_tickets_${u.id}`) : null;
      if (localTickets) {
        setMyTickets(JSON.parse(localTickets));
      }
    } catch {}
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setMsg({ type: 'error', text: 'Lütfen başlık ve detaylı açıklama alanlarını doldurun.' });
      return;
    }

    setSubmitting(true);
    setMsg(null);

    const newTicket = {
      id: 'ticket_' + Date.now(),
      type,
      title: title.trim(),
      category,
      priority,
      description: description.trim(),
      image_url: imageUrl.trim() || null,
      created_at: new Date().toISOString(),
      status: type === 'sikayet' ? 'otonom_incelemede' : 'iletildi',
      user_id: user?.id || 'anon',
    };

    // 1. Supabase veritabanına kaydetmeyi dene
    try {
      await supabase.from('feedback_submissions').insert([
        {
          user_id: user?.id,
          type: newTicket.type,
          title: newTicket.title,
          category: newTicket.category,
          priority: newTicket.priority,
          description: newTicket.description,
          image_url: newTicket.image_url,
          status: newTicket.status,
        },
      ]);
    } catch (err) {
      console.warn('DB feedback insert warning (fallback local storage active):', err);
    }

    // 2. Kullanıcı yerel durumuna & localStorage'a ekle
    const updatedTickets = [newTicket, ...myTickets];
    setMyTickets(updatedTickets);
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem(`user_tickets_${user.id}`, JSON.stringify(updatedTickets));
    }

    setSubmitting(false);
    setTitle('');
    setDescription('');
    setImageUrl('');

    if (type === 'sikayet') {
      setMsg({
        type: 'success',
        text: '⚠️ Şikayetiniz başarıyla alındı! Antigravity AI Kod Asistanı şikayetinizi inceleyecek. Haklı ve doğrulanan şikayetler geliştiriciye sormadan otonom olarak kod seviyesinde derhal düzeltilecektir!',
      });
    } else {
      setMsg({
        type: 'success',
        text: '💡 İstek/Öneriniz başarıyla kaydedildi! Yapay zeka asistanı tarafından derlenip geliştirici raporuna eklenecektir.',
      });
    }
  }

  if (user === undefined) return <div className="wrap empty">Yükleniyor...</div>;

  return (
    <div className="wrap" style={{ maxWidth: '900px', paddingTop: '30px', paddingBottom: '80px' }}>
      {/* Üst Başlık & Yetki Kuralları Bilgilendirme Paneli */}
      <section
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          borderRadius: '20px',
          padding: '28px',
          marginBottom: '28px',
          boxShadow: '0 16px 36px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '2.2rem' }}>📢</span>
          <div>
            <h1 style={{ fontSize: '1.8rem', margin: 0, color: '#fff', fontWeight: 900 }}>
              Şikayet & İstek Paneli
            </h1>
            <p style={{ color: 'var(--text-dim)', margin: '4px 0 0', fontSize: '.92rem' }}>
              Sitemizle ilgili geliştirmek istediğiniz fikirleri veya karşılaştığınız hataları buradan bildirin.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginTop: '20px' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '12px', padding: '14px' }}>
            <h4 style={{ color: 'var(--accent)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💡 Yeni İstek ve Öneriler
            </h4>
            <p style={{ fontSize: '.84rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>
              Yazdığınız tüm özellik istekleri ve yenilik önerileri kaydedilir ve geliştiriciye raporlanır.
            </p>
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '14px' }}>
            <h4 style={{ color: '#ff4d6d', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚡ Haklı Şikayetlerde Otonom Düzeltme
            </h4>
            <p style={{ fontSize: '.84rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>
              Haklı ve doğrulanan şikayetlerde AI Kod Asistanı geliştiriciye sormadan **kod seviyesinde direkt müdahale ve düzeltme yetkisine sahiptir**!
            </p>
          </div>
        </div>
      </section>

      {/* İstek / Şikayet Gönderme Formu */}
      <div className="card" style={{ padding: '28px', borderRadius: '20px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', margin: '0 0 20px', color: '#fff' }}>
          📝 Yeni Bildirim Oluştur
        </h2>

        {msg && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontWeight: 800,
              fontSize: '.9rem',
              background: msg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
              border: `1px solid ${msg.type === 'error' ? '#ef4444' : '#22c55e'}`,
              color: msg.type === 'error' ? '#ff4d6d' : '#86efac',
            }}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Tür Seçimi (İstek vs Şikayet) */}
          <div>
            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px' }}>
              Bildirim Türü
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setType('istek')}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontWeight: 800,
                  background: type === 'istek' ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'var(--bg-2)',
                  color: type === 'istek' ? '#fff' : 'var(--text-dim)',
                  border: type === 'istek' ? '2px solid #00f0ff' : '1px solid var(--border)',
                }}
              >
                💡 Yeni İstek / Öneri
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setType('sikayet')}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontWeight: 800,
                  background: type === 'sikayet' ? 'linear-gradient(135deg, #dc2626, #991b1b)' : 'var(--bg-2)',
                  color: type === 'sikayet' ? '#fff' : 'var(--text-dim)',
                  border: type === 'sikayet' ? '2px solid #ef4444' : '1px solid var(--border)',
                }}
              >
                ⚠️ Hata / Şikayet Bildirimi
              </button>
            </div>
          </div>

          {/* Başlık ve Kategori */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Konu / Başlık
              </label>
              <input
                type="text"
                placeholder={type === 'sikayet' ? 'Örn: Draft Duel 2. turda kart seçilmiyor' : 'Örn: Kart albümüne elmas birimi eklensin'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '6px' }}>
                İlgili Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text)',
                  outline: 'none',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Öncelik Derecesi ve İsteğe Bağlı Görsel URL */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Önem / Öncelik Derecesi
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text)',
                  outline: 'none',
                }}
              >
                <option value="düşük">🟢 Düşük - Acelesi Yok</option>
                <option value="normal">🟡 Normal - Genel İyileştirme</option>
                <option value="yüksek">🟠 Yüksek - Önemli Akış</option>
                <option value="kritik">🔴 Kritik - Oyunu / Sayfayı Kilitliyor</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Ekran Görüntüsü / Resim Bağlantısı (Opsiyonel)
              </label>
              <input
                type="url"
                placeholder="https://imgur.com/... veya resim linki"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Detaylı Açıklama Metni */}
          <div>
            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '6px' }}>
              Detaylı Açıklama / Şikayet Metni
            </label>
            <textarea
              rows={4}
              placeholder={
                type === 'sikayet'
                  ? 'Karşılaştığınız hatayı, ne zaman olduğunu ve hangi adımlarda yaşandığını açıklayın...'
                  : 'Görmek istediğiniz yeni özelliği, fikrinizi ve detaylarını paylaşın...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text)',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn"
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: 900,
              background: type === 'sikayet' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: type === 'sikayet' ? '0 0 20px rgba(239, 68, 68, 0.4)' : '0 0 20px rgba(245, 158, 11, 0.4)',
            }}
          >
            {submitting ? 'Gönderiliyor...' : type === 'sikayet' ? '⚠️ Şikayeti Gönder & Otonom İncelemeyi Başlat' : '💡 İsteği Gönder & Raporla'}
          </button>
        </form>
      </div>

      {/* Gönderilen Bildirimlerin Takibi */}
      {myTickets.length > 0 && (
        <div className="card" style={{ padding: '24px', borderRadius: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: '#fff' }}>
            📋 Gönderdiğin Bildirimler Geçmişi ({myTickets.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myTickets.map((t) => (
              <div
                key={t.id}
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="tag" style={{ background: t.type === 'sikayet' ? 'rgba(239,68,68,0.2)' : 'rgba(6,182,212,0.2)', color: t.type === 'sikayet' ? '#ff4d6d' : 'var(--accent)', fontWeight: 800 }}>
                      {t.type === 'sikayet' ? '⚠️ ŞİKAYET' : '💡 İSTEK'}
                    </span>
                    <span className="tag" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)', fontSize: '.76rem' }}>
                      {t.category}
                    </span>
                  </div>

                  <span className="tag" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#86efac', fontWeight: 800 }}>
                    {t.type === 'sikayet' ? '🛠️ Otonom Düzeltme İncelemesinde' : '📩 Geliştiriciye İletildi'}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 6px', fontSize: '1.02rem', color: '#fff' }}>{t.title}</h4>
                <p style={{ margin: 0, fontSize: '.88rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                  {t.description}
                </p>
                <div style={{ marginTop: '8px', fontSize: '.75rem', color: 'var(--text-dim)' }}>
                  Tarih: {new Date(t.created_at).toLocaleString('tr-TR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
