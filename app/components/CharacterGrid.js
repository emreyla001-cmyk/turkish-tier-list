'use client';

import { useMemo, useState } from 'react';
import TierBadge from './TierBadge';
import { tierRank, tierNumber } from './tiers';

export default function CharacterGrid({ characters = [] }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('strong'); // Varsayılan en güçlüden zayıfa
  const [tierGroup, setTierGroup] = useState('all');
  const [cat, setCat] = useState('all');

  const categories = useMemo(() => {
    const set = new Set();
    characters.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return [...set].sort((a, b) => a.localeCompare(b, 'tr'));
  }, [characters]);

  const isNew = (c) =>
    c.created_at &&
    Date.now() - new Date(c.created_at).getTime() < 7 * 24 * 3600 * 1000;

  // Hızlı Tier Kademesi Gruplaması
  const filterByTierGroup = (tier, groupKey) => {
    if (groupKey === 'all') return true;
    const num = tierNumber(tier);
    if (num === null) return groupKey === 'other';
    if (groupKey === 'godly') return num >= 0 && num <= 2;
    if (groupKey === 'super') return num >= 3 && num <= 6;
    if (groupKey === 'peak') return num >= 7 && num <= 9;
    if (groupKey === 'human') return num >= 10;
    return true;
  };

  const list = useMemo(() => {
    const query = q.trim().toLocaleLowerCase('tr');
    let items = characters.filter((c) => {
      if (
        query &&
        !`${c.name} ${c.series || ''} ${c.category || ''}`
          .toLocaleLowerCase('tr')
          .includes(query)
      ) {
        return false;
      }
      if (!filterByTierGroup(c.tier, tierGroup)) return false;
      if (cat !== 'all' && c.category !== cat) return false;
      return true;
    });

    // Sıralama
    const cmpTier = (dir) => (a, b) => {
      const ra = tierRank(a.tier);
      const rb = tierRank(b.tier);
      if (ra < 0 && rb < 0) return 0;
      if (ra < 0) return 1;
      if (rb < 0) return -1;
      return dir * (rb - ra);
    };

    if (sort === 'strong') items = [...items].sort(cmpTier(1));
    if (sort === 'weak') items = [...items].sort(cmpTier(-1));
    if (sort === 'power') items = [...items].sort((a, b) => (b.power_score || 0) - (a.power_score || 0));
    if (sort === 'intel') items = [...items].sort((a, b) => (b.intelligence_score || 0) - (a.intelligence_score || 0));
    if (sort === 'name') items = [...items].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    if (sort === 'new') {
      items = [...items].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }

    return items;
  }, [characters, q, sort, tierGroup, cat]);

  return (
    <div className="char-section-wrap">
      {/* Üst Sekmeler / Hızlı Tier Filtreleri */}
      <div className="filter-tabs">
        <button
          type="button"
          className={`filter-tab ${tierGroup === 'all' ? 'active' : ''}`}
          onClick={() => setTierGroup('all')}
        >
          Tüm Karakterler
        </button>
        <button
          type="button"
          className={`filter-tab ${tierGroup === 'godly' ? 'active' : ''}`}
          onClick={() => setTierGroup('godly')}
        >
          🌌 Tanrısal / Kozmik (Tier 0-2)
        </button>
        <button
          type="button"
          className={`filter-tab ${tierGroup === 'super' ? 'active' : ''}`}
          onClick={() => setTierGroup('super')}
        >
          🔥 Doğaüstü / Büyü (Tier 3-6)
        </button>
        <button
          type="button"
          className={`filter-tab ${tierGroup === 'peak' ? 'active' : ''}`}
          onClick={() => setTierGroup('peak')}
        >
          ⚔️ Dövüşçü / Zirve (Tier 7-9)
        </button>
        <button
          type="button"
          className={`filter-tab ${tierGroup === 'human' ? 'active' : ''}`}
          onClick={() => setTierGroup('human')}
        >
          👤 İnsan Düzeyi (Tier 10)
        </button>
      </div>

      {/* Arama & Sıralama Çubuğu */}
      <div className="char-toolbar">
        <div className="toolbar-search">
          <span className="search-icon-inline">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="İsim, yapım veya kategori ara..."
          />
          {q && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setQ('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="toolbar-filters">
          {categories.length > 1 && (
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="all">Tüm Kategoriler</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="strong">En Güçlüden Zayıfa (Tier)</option>
            <option value="power">Güç Puanına Göre (10-1)</option>
            <option value="intel">Zeka Puanına Göre (10-1)</option>
            <option value="new">En Yeniler</option>
            <option value="name">İsme Göre (A-Z)</option>
            <option value="weak">Zayıftan Güçlüye</option>
          </select>
        </div>
      </div>

      {/* Karakter Kartları Izgarası (3:4 Poster Düzeni) */}
      {list.length === 0 ? (
        <div className="empty">
          <p>Arama veya filtre kriterlerine uyan karakter bulunamadı.</p>
          {(q || tierGroup !== 'all' || cat !== 'all') && (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: '12px' }}
              onClick={() => {
                setQ('');
                setTierGroup('all');
                setCat('all');
              }}
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      ) : (
        <div className="poster-grid">
          {list.map((c) => (
            <a key={c.id} href={`/karakter/${c.id}`} className="poster-card">
              <div className="poster-media">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} loading="lazy" />
                ) : (
                  <div className="poster-fallback-inner">🎭</div>
                )}

                {/* Sol Üst: Seri / Kategori */}
                <div className="poster-badges-top-left">
                  {isNew(c) && <span className="poster-new-tag">YENİ</span>}
                  {c.category && <span className="poster-cat-tag">{c.category}</span>}
                </div>

                {/* Sağ Üst: Tier Rozeti */}
                <div className="poster-tier-float">
                  <TierBadge tier={c.tier} />
                </div>

                {/* Hover Stat Önizlemesi */}
                <div className="poster-hover-stats">
                  <span>⚡ {c.power_score ?? '?'}/10 Güç</span>
                  <span>🧠 {c.intelligence_score ?? '?'}/10 Zeka</span>
                </div>

                {/* Alt Karartma Gradyanı */}
                <div className="poster-shade" />
              </div>

              {/* Kart Bilgileri */}
              <div className="poster-details">
                <h3 className="poster-name">{c.name}</h3>
                <p className="poster-series">{c.series || 'Kurgusal Evren'}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
