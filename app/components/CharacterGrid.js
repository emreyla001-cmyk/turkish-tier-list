'use client';

import { useMemo, useState } from 'react';
import TierBadge from './TierBadge';
import { MemorialPosterBadge } from './MemorialBadge';
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
    return [...set].sort((a, b) => a - b);
  }, [characters]);

  // Kategoriler ve her kategorideki karakter sayısı
  const categoryStats = useMemo(() => {
    const counts = { all: characters.length };
    characters.forEach((c) => {
      if (c.category) {
        counts[c.category] = (counts[c.category] || 0) + 1;
      }
    });
    return counts;
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

  // Kategori ikonları eşlemesi
  function getCategoryIcon(cName) {
    if (!cName || cName === 'all') return '🌟';
    if (cName.includes('Mitoloji')) return '🐺';
    if (cName.includes('Dizi') || cName.includes('Film')) return '🎬';
    if (cName.includes('Çizgi') || cName.includes('Animasyon')) return '🎨';
    if (cName.includes('Edebiyat') || cName.includes('Kitap')) return '📖';
    return '⚡';
  }

  return (
    <div className="char-section-wrap" id="karakterler">
      {/* Modern Kategori ve Tier Sekmeleri */}
      <div className="modern-filter-container">
        {/* Üst Sekmeler: Evren & Kategori */}
        <div className="modern-tabs-header-row">
          <div className="modern-tabs-row">
            <button
              type="button"
              className={`modern-tab-pill ${cat === 'all' ? 'active' : ''}`}
              onClick={() => setCat('all')}
            >
              <span>🌟</span>
              <span>Tüm Evrenler</span>
              <span className="modern-tab-badge">{characters.length}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`modern-tab-pill ${cat === c ? 'active' : ''}`}
                onClick={() => setCat(c)}
              >
                <span>{getCategoryIcon(c)}</span>
                <span>{c}</span>
                <span className="modern-tab-badge">{categoryStats[c] || 0}</span>
              </button>
            ))}
          </div>

          <div style={{ fontSize: '.84rem', color: 'var(--text-dim)', fontWeight: 700, whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--accent)' }}>{list.length}</span> Karakter Listeleniyor
          </div>
        </div>

        {/* Hızlı Tier Filtre Hapları */}
        <div className="tier-pills-row">
          <button
            type="button"
            className={`tier-pill-btn ${group === 'all' ? 'active' : ''}`}
            onClick={() => setGroup('all')}
          >
            ⚡ Tüm Seviyeler
          </button>
          {groups.map((n) => (
            <button
              key={n}
              type="button"
              className={`tier-pill-btn ${group === String(n) ? 'active' : ''}`}
              onClick={() => setGroup(group === String(n) ? 'all' : String(n))}
            >
              Tier {n} · {GROUPS[n]?.[0] || `Kademe ${n}`}
            </button>
          ))}
        </div>

        {/* Canlı Arama ve Sıralama Çubuğu */}
        <div className="char-toolbar">
          <div className="toolbar-search">
            <span className="search-icon-inline">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="İsim, yapım veya güç ara..."
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
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="strong">⚡ En Güçlüden Zayıfa (Tier)</option>
              <option value="weak">🍃 En Zayıftan Güçlüye (Tier)</option>
              <option value="new">✨ En Yeniler</option>
              <option value="name">🔤 İsme Göre (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3:4 Dikey Poster Izgarası */}
      {list.length === 0 ? (
        <div className="empty">
          <p>Aramana veya seçtiğin filtrelere uyan karakter bulunamadı.</p>
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
                  <MemorialPosterBadge characterName={c.name} seriesName={c.series} />
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
