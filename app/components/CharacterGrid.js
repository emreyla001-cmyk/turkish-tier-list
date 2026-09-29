'use client';

import { useMemo, useState } from 'react';
import TierBadge from './TierBadge';
import { tierRank, tierNumber, GROUPS } from './tiers';

export default function CharacterGrid({ characters }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('new');
  const [group, setGroup] = useState('all');
  const [cat, setCat] = useState('all');

  const groups = useMemo(() => {
    const set = new Set();
    characters.forEach((c) => {
      const n = tierNumber(c.tier);
      if (n !== null) set.add(n);
    });
    return [...set].sort((a, b) => b - a);
  }, [characters]);

  const categories = useMemo(() => {
    const set = new Set();
    characters.forEach((c) => { if (c.category) set.add(c.category); });
    return [...set].sort((a, b) => a.localeCompare(b, 'tr'));
  }, [characters]);

  const isNew = (c) => c.created_at && (Date.now() - new Date(c.created_at).getTime()) < 7 * 24 * 3600 * 1000;

  const list = useMemo(() => {
    const query = q.trim().toLocaleLowerCase('tr');
    let items = characters.filter((c) => {
      if (query && !`${c.name} ${c.series || ''}`.toLocaleLowerCase('tr').includes(query)) return false;
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
    return items;
  }, [characters, q, sort, group, cat]);

  return (
    <div>
      {characters.length >= 4 && (
        <div className="toolbar">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Karakter veya yapım ara..." />
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="all">Tüm tier'lar</option>
            {groups.map((n) => (
              <option key={n} value={String(n)}>Tier {n} · {GROUPS[n]?.[0]}</option>
            ))}
          </select>
          {categories.length > 1 && (
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="all">Tüm türler</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">En yeniler</option>
            <option value="strong">Güçlüden zayıfa</option>
            <option value="weak">Zayıftan güçlüye</option>
            <option value="name">İsme göre (A-Z)</option>
          </select>
        </div>
      )}

      {list.length === 0 ? (
        <div className="empty">Aramana uyan karakter bulunamadı.</div>
      ) : (
        <div className="grid">
          {list.map((c) => (
            <a key={c.id} href={`/karakter/${c.id}`} className="card char-card">
              <div className="thumb">
                {c.image_url ? <img src={c.image_url} alt={c.name} /> : '🎭'}
                {isNew(c) && <span className="new-badge">Yeni</span>}
              </div>
              <h3>{c.name}</h3>
              <p>{c.series || 'Yapım bilgisi yakında'}</p>
              <div className="row">
                {c.category ? <span className="tag">{c.category}</span> : <span />}
                <TierBadge tier={c.tier} />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
