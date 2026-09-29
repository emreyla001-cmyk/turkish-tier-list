'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import TierBadge from './TierBadge';

const TABS = [
  ['day', 'Gün'], ['week', 'Hafta'], ['month', 'Ay'], ['all', 'Tüm Zamanlar'],
];

export default function PopularCharacters() {
  const [period, setPeriod] = useState('week');
  const [list, setList] = useState(null);

  useEffect(() => {
    let alive = true;
    supabase.rpc('popular_characters', { period, lim: 5 }).then(({ data }) => {
      if (alive) setList(data || []);
    });
    return () => { alive = false; };
  }, [period]);

  return (
    <section className="section">
      <div className="section-head">
        <h2>Popüler Karakterler</h2>
        <p>Görüntülenme ve yorumlara göre sıralanır.</p>
      </div>
      <div className="period-tabs">
        {TABS.map(([key, label]) => (
          <button key={key} className={`ptab${period === key ? ' active' : ''}`} onClick={() => setPeriod(key)}>{label}</button>
        ))}
      </div>
      {list === null ? (
        <p style={{ color: 'var(--text-dim)', marginTop: '14px' }}>Yükleniyor...</p>
      ) : list.length === 0 ? (
        <p style={{ color: 'var(--text-dim)', marginTop: '14px' }}>Bu dönemde henüz veri yok.</p>
      ) : (
        <div className="pop-list">
          {list.map((c, i) => (
            <a key={c.id} href={`/karakter/${c.id}`} className="pop-row">
              <span className="pop-rank">{i + 1}</span>
              <span className="pop-thumb">{c.image_url ? <img src={c.image_url} alt={c.name} /> : '🎭'}</span>
              <span className="pop-info">
                <span className="pop-name">{c.name}</span>
                <span className="pop-series">{c.series || 'Yapım bilgisi yakında'}</span>
              </span>
              <TierBadge tier={c.tier} />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
