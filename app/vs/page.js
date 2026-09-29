'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import TierBadge from '../components/TierBadge';
import StatRadar from '../components/StatRadar';

export default function VersusPage() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [id1, setId1] = useState('');
  const [id2, setId2] = useState('');
  const [votes, setVotes] = useState({ left: 0, right: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [userChoice, setUserChoice] = useState(null);

  const duelKey = id1 && id2 ? `duel_${id1}_vs_${id2}` : null;

  useEffect(() => {
    supabase
      .from('characters')
      .select('*')
      .eq('status', 'published')
      .order('name', { ascending: true })
      .then(({ data }) => {
        const list = data || [];
        setCharacters(list);
        if (list.length >= 2) {
          setId1(list[0].id);
          setId2(list[1].id);
        } else if (list.length === 1) {
          setId1(list[0].id);
        }
        setLoading(false);
      });
  }, []);

  const c1 = characters.find((c) => c.id === id1);
  const c2 = characters.find((c) => c.id === id2);

  const statLabels = [
    { key: 'power_score', label: 'Güç' },
    { key: 'intelligence_score', label: 'Zeka' },
    { key: 'speed_score', label: 'Hız' },
    { key: 'durability_score', label: 'Dayanıklılık' },
    { key: 'influence_score', label: 'Etki' },
  ];

  const c1Stats = statLabels.map((s) => ({
    label: s.label,
    val: c1 ? c1[s.key] : 5,
  }));

  const c2Stats = statLabels.map((s) => ({
    label: s.label,
    val: c2 ? c2[s.key] : 5,
  }));

  useEffect(() => {
    if (!duelKey) return;
    try {
      const savedChoice = localStorage.getItem(duelKey);
      if (savedChoice) {
        setHasVoted(true);
        setUserChoice(savedChoice);
      } else {
        setHasVoted(false);
        setUserChoice(null);
      }
      const savedVotes = localStorage.getItem(`${duelKey}_counts`);
      if (savedVotes) {
        setVotes(JSON.parse(savedVotes));
      } else {
        setVotes({ left: 0, right: 0 });
      }
    } catch {
      // localStorage erişim güvenliği
    }
  }, [duelKey]);

  function handleVote(choice) {
    if (hasVoted) return;
    const nextVotes = {
      left: choice === 'left' ? votes.left + 1 : votes.left,
      right: choice === 'right' ? votes.right + 1 : votes.right,
    };
    setVotes(nextVotes);
    setHasVoted(true);
    setUserChoice(choice);
    if (duelKey) {
      try {
        localStorage.setItem(duelKey, choice);
        localStorage.setItem(`${duelKey}_counts`, JSON.stringify(nextVotes));
      } catch {
        // ignore
      }
    }
  }

  const total = votes.left + votes.right;
  const leftPct = total > 0 ? Math.round((votes.left / total) * 100) : 0;
  const rightPct = total > 0 ? 100 - leftPct : 0;

  if (loading) {
    return <div className="wrap empty">VS Arenası yükleniyor...</div>;
  }

  return (
    <div className="wrap" style={{ paddingBottom: '60px' }}>
      <div className="section-head text-center" style={{ marginTop: '24px' }}>
        <span className="kicker kicker-red">⚔️ VS ARENASI</span>
        <h1>Karakter Kıyaslama & Düello</h1>
        <p>İki karakter seç, güç analizlerini ve scaling verilerini yan yana karşılaştır!</p>
      </div>

      {/* Karakter Seçici Araç Çubuğu */}
      <div className="vs-selector-bar card">
        <div className="field" style={{ flex: 1, margin: 0 }}>
          <label>1. Dövüşçü</label>
          <select value={id1} onChange={(e) => setId1(e.target.value)}>
            {characters.map((c) => (
              <option key={c.id} value={c.id} disabled={c.id === id2}>
                {c.name} ({c.series || 'Kurgu'}) — {c.tier || 'Tier ?'}
              </option>
            ))}
          </select>
        </div>

        <div className="vs-badge-small">VS</div>

        <div className="field" style={{ flex: 1, margin: 0 }}>
          <label>2. Dövüşçü</label>
          <select value={id2} onChange={(e) => setId2(e.target.value)}>
            {characters.map((c) => (
              <option key={c.id} value={c.id} disabled={c.id === id1}>
                {c.name} ({c.series || 'Kurgu'}) — {c.tier || 'Tier ?'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {c1 && c2 && (
        <>
          {/* Karşılaşma Vitrini */}
          <div className="versus-box" style={{ marginTop: '24px' }}>
            {/* Sol Karakter */}
            <div className={`versus-fighter left ${userChoice === 'left' ? 'voted' : ''}`}>
              <div className="fighter-poster">
                {c1.image_url ? (
                  <img src={c1.image_url} alt={c1.name} />
                ) : (
                  <div className="poster-fallback">🎭</div>
                )}
                <div className="fighter-tier"><TierBadge tier={c1.tier} /></div>
              </div>
              <div className="fighter-meta">
                <h2>{c1.name}</h2>
                <span className="fighter-series">{c1.series || 'Yapım bilinmiyor'}</span>
                <p style={{ fontSize: '.85rem', color: 'var(--text-dim)', margin: '8px 0' }}>
                  {c1.category || 'Kategori belirtilmedi'}
                </p>
                <button
                  type="button"
                  className={`btn btn-vote-left ${hasVoted && userChoice === 'left' ? 'active' : ''}`}
                  onClick={() => handleVote('left')}
                  disabled={hasVoted}
                >
                  {hasVoted ? (userChoice === 'left' ? '✓ Oyunuz Burada' : `${leftPct}%`) : 'Bence Bu Alır'}
                </button>
              </div>
            </div>

            {/* Orta VS & Oylama Barı */}
            <div className="versus-divider">
              <div className="vs-emblem">VS</div>
              {hasVoted && total > 0 ? (
                <div className="vs-vote-bar">
                  <div className="vs-bar-track">
                    <div className="vs-bar-fill-left" style={{ width: `${leftPct}%` }} />
                    <div className="vs-bar-fill-right" style={{ width: `${rightPct}%` }} />
                  </div>
                  <div className="vs-bar-labels">
                    <span className="left-pct">%{leftPct} ({votes.left} oy)</span>
                    <span className="right-pct">%{rightPct} ({votes.right} oy)</span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  Sonuçları görmek için oy ver
                </div>
              )}
            </div>

            {/* Sağ Karakter */}
            <div className={`versus-fighter right ${userChoice === 'right' ? 'voted' : ''}`}>
              <div className="fighter-poster">
                {c2.image_url ? (
                  <img src={c2.image_url} alt={c2.name} />
                ) : (
                  <div className="poster-fallback">🎭</div>
                )}
                <div className="fighter-tier"><TierBadge tier={c2.tier} /></div>
              </div>
              <div className="fighter-meta">
                <h2>{c2.name}</h2>
                <span className="fighter-series">{c2.series || 'Yapım bilinmiyor'}</span>
                <p style={{ fontSize: '.85rem', color: 'var(--text-dim)', margin: '8px 0' }}>
                  {c2.category || 'Kategori belirtilmedi'}
                </p>
                <button
                  type="button"
                  className={`btn btn-vote-right ${hasVoted && userChoice === 'right' ? 'active' : ''}`}
                  onClick={() => handleVote('right')}
                  disabled={hasVoted}
                >
                  {hasVoted ? (userChoice === 'right' ? '✓ Oyunuz Burada' : `${rightPct}%`) : 'Bence Bu Alır'}
                </button>
              </div>
            </div>
          </div>

          {/* İkili Radar Grafiği */}
          <div className="grid-2-col" style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="card text-center">
              <h3>{c1.name} — Stat Radarı</h3>
              <StatRadar stats={c1Stats} size={250} />
            </div>
            <div className="card text-center">
              <h3>{c2.name} — Stat Radarı</h3>
              <StatRadar stats={c2Stats} size={250} />
            </div>
          </div>

          {/* Birebir Değer Karşılaştırma Tablosu */}
          <div className="card" style={{ marginTop: '24px' }}>
            <h3>Detaylı Stat Karşılaştırması</h3>
            <div className="vs-table">
              {statLabels.map(({ key, label }) => {
                const v1 = Number(c1[key]) || 0;
                const v2 = Number(c2[key]) || 0;
                const diff = v1 - v2;

                return (
                  <div className="vs-table-row" key={key}>
                    <div className={`vs-table-val left ${diff > 0 ? 'winner' : ''}`}>
                      <strong>{v1}/10</strong>
                      {diff > 0 && <span className="diff-tag">+{diff}</span>}
                    </div>
                    <div className="vs-table-metric">
                      <div className="metric-label">{label}</div>
                      <div className="vs-metric-bar">
                        <div
                          className="metric-fill-left"
                          style={{ width: `${(v1 / 10) * 100}%` }}
                        />
                        <div
                          className="metric-fill-right"
                          style={{ width: `${(v2 / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className={`vs-table-val right ${diff < 0 ? 'winner' : ''}`}>
                      {diff < 0 && <span className="diff-tag">+{Math.abs(diff)}</span>}
                      <strong>{v2}/10</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
