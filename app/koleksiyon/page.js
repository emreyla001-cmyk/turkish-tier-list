'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import TierBadge from '../components/TierBadge';
import { TrophyIcon, CrownIcon, ShieldIcon, SwordsIcon } from '../components/CyberIcons';
import { getCardRarity } from '../lib/cardRarity';

export default function KoleksiyonAlbumPage() {
  const [characters, setCharacters] = useState([]);
  const [unlockedCardIds, setUnlockedCardIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');

  useEffect(() => {
    async function loadCollectionData() {
      setLoading(true);
      const { data: chars } = await supabase
        .from('characters')
        .select('id, name, series, tier, category, image_url, power_score')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      setCharacters(chars || []);

      const { data: userRes } = await supabase.auth.getUser();
      if (userRes?.user) {
        const u = userRes.user;
        const { data: profile } = await supabase
          .from('profiles')
          .select('inventory')
          .eq('id', u.id)
          .maybeSingle();

        const inv = profile?.inventory || u.user_metadata?.inventory || [];
        setUnlockedCardIds(inv);
      }
      setLoading(false);
    }
    loadCollectionData();
  }, []);

  const totalCount = characters.length;
  const unlockedCount = useMemo(() => {
    return characters.filter((c) => unlockedCardIds.includes(c.id)).length;
  }, [characters, unlockedCardIds]);

  const completionPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const categories = useMemo(() => {
    const set = new Set();
    characters.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return [...set].sort((a, b) => a.localeCompare(b, 'tr'));
  }, [characters]);

  const filteredCharacters = useMemo(() => {
    if (selectedCat === 'all') return characters;
    return characters.filter((c) => c.category === selectedCat);
  }, [characters, selectedCat]);

  return (
    <div className="wrap" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      {/* Koleksiyon Başlık & İlerleme Paneli */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.35)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '28px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 800, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '6px' }}>
              <TrophyIcon size={18} /> Karakter Koleksiyon Albümü
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>
              Pokedex & Albüm Tamamlama
            </h1>
            <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: '.95rem' }}>
              Çektiğiniz veya açtığınız tüm karakter kartları profilinizde sergilenir.
            </p>
          </div>

          <div style={{ textAlign: 'right', minWidth: '220px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent)' }}>
              %{completionPct}
            </div>
            <div style={{ fontSize: '.84rem', color: 'var(--text-dim)', fontWeight: 700 }}>
              {unlockedCount} / {totalCount} Karakter Açıldı
            </div>
          </div>
        </div>

        {/* İlerleme Çubuğu */}
        <div style={{ marginTop: '20px', height: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            height: '100%',
            width: `${completionPct}%`,
            background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #f59e0b)',
            borderRadius: '10px',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.6)',
            transition: 'width .6s ease'
          }} />
        </div>
      </section>

      {/* Kategori Filtre Butonları */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          className={`modern-tab-pill ${selectedCat === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCat('all')}
        >
          Tüm Evrenler ({characters.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`modern-tab-pill ${selectedCat === cat ? 'active' : ''}`}
            onClick={() => setSelectedCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Karakter Kart Albüm Izgarası */}
      {loading ? (
        <div className="empty">Koleksiyon albümü yükleniyor...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
          {filteredCharacters.map((c) => {
            const isUnlocked = unlockedCardIds.includes(c.id);
            const rarity = getCardRarity(c.tier);

            return (
              <div
                key={c.id}
                className="poster-card"
                style={{
                  opacity: isUnlocked ? 1 : 0.45,
                  filter: isUnlocked ? 'none' : 'grayscale(0.9) brightness(0.7)',
                  border: isUnlocked ? `1px solid ${rarity.color}66` : '1px solid var(--border)',
                  position: 'relative'
                }}
              >
                <div className="poster-media">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} loading="lazy" />
                  ) : (
                    <div className="poster-fallback-inner">🎭</div>
                  )}

                  <div className="poster-tier-float">
                    <TierBadge tier={c.tier} />
                  </div>

                  {!isUnlocked && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.6)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 4,
                      gap: '4px'
                    }}>
                      <span style={{ fontSize: '1.8rem' }}>🔒</span>
                      <span style={{ fontSize: '.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' }}>KİLİTLİ</span>
                    </div>
                  )}
                </div>

                <div className="poster-details">
                  <h4 style={{ fontSize: '.9rem', fontWeight: 800, margin: '0 0 2px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name}
                  </h4>
                  <p style={{ fontSize: '.74rem', color: 'var(--text-dim)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.series || 'Kurgu'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
