'use client';

import { useMemo, useState } from 'react';
import TierBadge from './TierBadge';
import { tierRank, tierNumber, GROUPS } from './tiers';

export default function CharacterGrid({ characters = [] }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('strong');
  const [group, setGroup] = useState('all');
  const [cat, setCat] = useState('all');

  const groups = useMemo(() => {
    const set = new Set();
    characters.forEach((c) => {
      const n = tierNumber(c.tier);
      if (n !== null) set.add(n);
    });
    return [...set].sort((a, b) => a - b); // Tier 0, 1, 2... en güçlüden sırayla
  }, [characters]);

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
      if (group !== 'all' && String(tierNumber(c.tier)) !== group) return false;
      if (cat !== 'all' && c.category !== cat) return false;
      return true;
    });

    // Tier'ı belirlenmemiş karakterler her zaman sonda
    const cmp = (dir) => (a, b) => {
      const ra = tierRank(a.tier);
      const rb = tierRank(b.tier);
      if (ra < 0 && rb < 0) return 0;
      if (ra < 0) return 1;
      if (rb < 0) return -1;
      return dir * (rb - ra);
    };

    if (sort === 'strong') items = [...items].sort(cmp(1));
    if (sort === 'weak') items = [...items].sort(cmp(-1));
    if (sort === 'name') items = [...items].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    if (sort === 'new') {
      items = [...items].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }

    return items;
  }, [characters, q, sort, group, cat]);

  return (
    <div className="char-section-wrap">
      {/* Orijinal Tier Filtre Çubuğu */}
      <div className="char-toolbar">
        <div className="toolbar-search">
          <span className="search-icon-inline">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Karakter veya yapım ara..."
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
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="all">Tüm Tier&apos;lar</option>
            {groups.map((n) => (
              <option key={n} value={String(n)}>
                Tier {n} · {GROUPS[n]?.[0] || 'Seviye'}
              </option>
            ))}
          </select>

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
            <option value="strong">Güçlüden Zayıfa (Tier)</option>
            <option value="weak">Zayıftan Güçlüye (Tier)</option>
            <option value="new">En Yeniler</option>
            <option value="name">İsme Göre (A-Z)</option>
          </select>
        </div>
      </div>

      {/* 3:4 Dikey Poster Izgarası */}
      {list.length === 0 ? (
        <div className="empty">
          <p>Aramana veya filtrene uyan karakter bulunamadı.</p>
          {(q || group !== 'all' || cat !== 'all') && (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: '10px' }}
              onClick={() => {
                setQ('');
                setGroup('all');
                setCat('all');
              }}
            >
              Filtreleri Sıfırla
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

                {/* Sol Üst Rozetler */}
                <div className="poster-badges-top-left">
                  {isNew(c) && <span className="poster-new-tag">YENİ</span>}
                  {c.category && <span className="poster-cat-tag">{c.category}</span>}
                </div>

                {/* Sağ Üst Tier Rozeti */}
                <div className="poster-tier-float">
                  <TierBadge tier={c.tier} />
                </div>

                {/* Alt Karartma */}
                <div className="poster-shade" />
              </div>

              {/* Kart Bilgileri */}
              <div className="poster-details">
                <h3 className="poster-name">{c.name}</h3>
                <p className="poster-series">{c.series || 'Kurgu'}</p>
                <div className="row" style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="tag" style={{ fontSize: '.72rem' }}>{c.category || 'Genel'}</span>
                  <TierBadge tier={c.tier} />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
