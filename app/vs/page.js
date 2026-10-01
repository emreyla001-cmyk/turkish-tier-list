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

  // Yapay Zeka Hakem Simülasyonu State'leri
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [aiReport, setAiReport] = useState(null);
  const [simError, setSimError] = useState(null);
  const [blindMode, setBlindMode] = useState(false);

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
    setAiReport(null);
    setSimError(null);

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
    } catch {}
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
      } catch {}
    }
  }

  async function runAiSimulation() {
    if (!c1 || !c2 || simulating) return;
    setSimulating(true);
    setSimError(null);
    setAiReport(null);
    setSimStep(1);

    const timer1 = setTimeout(() => setSimStep(2), 700);
    const timer2 = setTimeout(() => setSimStep(3), 1400);

    try {
      const res = await fetch('/api/vs/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ c1, c2 }),
      });
      const data = await res.json();

      setTimeout(() => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        if (res.ok) {
          setAiReport(data);
        } else {
          setSimError(data.error || 'Simülasyon hesaplanamadı.');
        }
        setSimulating(false);
      }, 2100);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setSimError('Bağlantı hatası: ' + err.message);
      setSimulating(false);
    }
  }

  const total = votes.left + votes.right;
  const leftPct = total > 0 ? Math.round((votes.left / total) * 100) : 0;
  const rightPct = total > 0 ? 100 - leftPct : 0;

  if (loading) {
    return <div className="wrap empty">VS Arenası ve Hakem Botu Yükleniyor...</div>;
  }

  return (
    <div className="wrap" style={{ paddingBottom: '70px' }}>
      {/* Üst Banner & Kör Seçim Modu Geçişi */}
      <div className="section-head text-center" style={{ marginTop: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span className="kicker kicker-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>🤖</span> YAPAY ZEKA HAKEMLİ KARAKTER KARŞILAŞMASI
          </span>
          <button
            type="button"
            className={`btn ${blindMode ? 'btn-spotlight-primary' : 'btn-ghost'}`}
            style={{ fontSize: '.78rem', padding: '4px 12px', borderRadius: '20px' }}
            onClick={() => setBlindMode(!blindMode)}
          >
            {blindMode ? '👁️ Kör Seçim Modu Aktif (Tierler Gizli)' : '🙈 Kör Seçim Moduna Geç (Onyargısız Seçim)'}
          </button>
        </div>
        <h1 style={{ marginTop: '8px' }}>Karakter Kıyaslama & Yapay Zeka VS Simülatörü</h1>
        <p style={{ maxWidth: '680px', margin: '8px auto 0', color: 'var(--text-dim)' }}>
          İki dövüşçü seçin. Yapay zeka botumuz kaba kas gücünün yanı sıra <strong>ruhsal yetenekleri, mistik hax yetilerini ve kanonik feat'leri</strong> hesaba katarak zafer sonucunu anlatsın!
        </p>
      </div>

      {/* Karakter Seçici Araç Çubuğu */}
      <div className="vs-selector-bar card" style={{ padding: '20px', borderRadius: '16px' }}>
        <div className="field" style={{ flex: 1, margin: 0 }}>
          <label style={{ fontWeight: 700, color: 'var(--accent)' }}>🔴 1. Dövüşçü (Sol Köşe)</label>
          <select value={id1} onChange={(e) => setId1(e.target.value)}>
            {characters.map((c) => (
              <option key={c.id} value={c.id} disabled={c.id === id2}>
                {c.name} ({c.series || 'Kurgu'}) {blindMode && !hasVoted && !aiReport ? '' : `— ${c.tier || 'Tier ?'}`}
              </option>
            ))}
          </select>
        </div>

        <div className="vs-badge-small" style={{ background: 'linear-gradient(135deg, #e6455b, #9b59e6)', color: '#fff' }}>
          VS
        </div>

        <div className="field" style={{ flex: 1, margin: 0 }}>
          <label style={{ fontWeight: 700, color: '#00f0ff' }}>🔵 2. Dövüşçü (Sağ Köşe)</label>
          <select value={id2} onChange={(e) => setId2(e.target.value)}>
            {characters.map((c) => (
              <option key={c.id} value={c.id} disabled={c.id === id1}>
                {c.name} ({c.series || 'Kurgu'}) {blindMode && !hasVoted && !aiReport ? '' : `— ${c.tier || 'Tier ?'}`}
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
                <div className="fighter-tier">
                  {blindMode && !hasVoted && !aiReport ? (
                    <span className="tag" style={{ background: 'rgba(0,0,0,0.8)', color: '#fef08a', fontWeight: 800, border: '1px solid #fef08a' }}>
                      🙈 Tier Gizli
                    </span>
                  ) : (
                    <TierBadge tier={c1.tier} />
                  )}
                </div>
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
                  {hasVoted ? (userChoice === 'left' ? '✓ Topluluk Oyunuz' : `${leftPct}%`) : 'Benim Oyum Bu Karaktere'}
                </button>
              </div>
            </div>

            {/* Orta VS & Yapay Zeka Hakem Butonu */}
            <div className="versus-divider" style={{ gap: '16px' }}>
              <div className="vs-emblem">VS</div>

              <button
                type="button"
                className="btn btn-spotlight-primary"
                onClick={runAiSimulation}
                disabled={simulating}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 25px rgba(230, 179, 37, 0.4)',
                }}
              >
                <span>🤖</span>
                <span>{simulating ? 'Yapay Zeka Analiz Ediyor...' : 'Yapay Zeka Hakem Düellosunu Başlat'}</span>
              </button>

              {hasVoted && total > 0 && (
                <div className="vs-vote-bar" style={{ marginTop: '8px' }}>
                  <div className="vs-bar-track">
                    <div className="vs-bar-fill-left" style={{ width: `${leftPct}%` }} />
                    <div className="vs-bar-fill-right" style={{ width: `${rightPct}%` }} />
                  </div>
                  <div className="vs-bar-labels">
                    <span className="left-pct">Sol: %{leftPct} ({votes.left} oy)</span>
                    <span className="right-pct">Sağ: %{rightPct} ({votes.right} oy)</span>
                  </div>
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
                <div className="fighter-tier">
                  {blindMode && !hasVoted && !aiReport ? (
                    <span className="tag" style={{ background: 'rgba(0,0,0,0.8)', color: '#fef08a', fontWeight: 800, border: '1px solid #fef08a' }}>
                      🙈 Tier Gizli
                    </span>
                  ) : (
                    <TierBadge tier={c2.tier} />
                  )}
                </div>
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
                  {hasVoted ? (userChoice === 'right' ? '✓ Topluluk Oyunuz' : `${rightPct}%`) : 'Benim Oyum Bu Karaktere'}
                </button>
              </div>
            </div>
          </div>

          {/* SIMULATION LOADING PROGRESS BAR */}
          {simulating && (
            <div
              className="card text-center"
              style={{
                marginTop: '24px',
                padding: '24px',
                border: '1px solid var(--accent)',
                background: 'linear-gradient(135deg, rgba(20,25,40,0.95), rgba(10,13,20,0.98))',
              }}
            >
              <div style={{ fontSize: '2.4rem', animation: 'spin 2s linear infinite' }}>🤖</div>
              <h3 style={{ margin: '12px 0 6px', color: 'var(--accent)' }}>Yapay Zeka Hakemi Lore ve Stat Analizi Yapıyor</h3>
              <p style={{ fontSize: '.88rem', color: 'var(--text-dim)', margin: 0 }}>
                {simStep === 1 && '1/3: Karakter güç istatistikleri ve Tier seviyeleri taranıyor...'}
                {simStep === 2 && '2/3: Kanonik başarılar, lore zayıflıkları ve taktik üstünlükler kıyaslanıyor...'}
                {simStep === 3 && '3/3: Dövüş senaryosu oluşturuluyor ve hakem kararı hazırlanıyor...'}
              </p>
            </div>
          )}

          {simError && (
            <div className="card" style={{ marginTop: '24px', border: '1px solid #e6455b', color: '#e6455b' }}>
              <strong>Simülasyon Hatası:</strong> {simError}
            </div>
          )}

          {/* 📜 YAPAY ZEKA HAKEM RAPORU VE DÖVÜŞ SENARYOSU */}
          {aiReport && !simulating && (
            <div
              className="card"
              style={{
                marginTop: '28px',
                padding: '28px',
                border: '1px solid rgba(230, 179, 37, 0.5)',
                background: 'linear-gradient(135deg, rgba(20, 25, 45, 0.95), rgba(8, 10, 18, 0.98))',
                boxShadow: '0 0 35px rgba(230, 179, 37, 0.15)',
                borderRadius: '20px',
              }}
            >
              {/* Zafer Rozeti */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '2.5rem' }}>👑</span>
                  <div>
                    <span style={{ fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 800 }}>
                      Yapay Zeka Hakem Kararı
                    </span>
                    <h2 style={{ margin: '2px 0 0', color: '#fff', fontSize: '1.5rem' }}>
                      Zafer: <span style={{ color: '#86efac' }}>{aiReport.winner_name}</span> (%{aiReport.win_percentage} İhtimal)
                    </h2>
                  </div>
                </div>

                <div className="tag" style={{ background: 'rgba(134, 239, 172, 0.15)', color: '#86efac', borderColor: '#86efac', fontSize: '.88rem', padding: '6px 14px', fontWeight: 800 }}>
                  {aiReport.tier_comparison}
                </div>
              </div>

              {/* Güç Ölçekleme Özet */}
              <div style={{ margin: '20px 0' }}>
                <h4 style={{ color: 'var(--accent)', marginBottom: '6px' }}>⚡ Power Scaling & Hakem Değerlendirmesi</h4>
                <p style={{ fontSize: '.94rem', color: 'var(--text-light)', lineHeight: 1.6, margin: 0 }}>
                  {aiReport.scaling_summary}
                </p>
              </div>

              {/* Temel Üstünlük Alanları */}
              <div style={{ background: 'var(--bg-2)', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '.9rem', color: 'var(--text-dim)' }}>Kilit Üstünlük Faktörleri:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {aiReport.key_advantages.map((adv, idx) => (
                    <span key={idx} className="tag" style={{ background: 'rgba(230, 179, 37, 0.15)', color: 'var(--accent)', borderColor: 'rgba(230, 179, 37, 0.3)', fontWeight: 700 }}>
                      ✓ {adv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dövüş Aşamaları (Timeline) */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚔️</span> Dövüş Akışı & Adım Adım Senaryo
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {aiReport.fight_phases.map((phase, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'var(--bg-2)',
                        borderLeft: '4px solid var(--accent)',
                      }}
                    >
                      <strong style={{ color: 'var(--accent)', fontSize: '.92rem', display: 'block', marginBottom: '4px' }}>
                        {phase.phase}
                      </strong>
                      <p style={{ margin: 0, fontSize: '.88rem', color: 'var(--text-light)', lineHeight: 1.5 }}>
                        {phase.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lore & Kanıt Maddeleri */}
              <div style={{ background: 'rgba(9, 13, 22, 0.8)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 10px', color: '#a5b4fc', fontSize: '.95rem' }}>📜 Kanonik Lore Kanıtları & Başarımlar:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '.88rem', color: 'var(--text-dim)', display: 'grid', gap: '6px' }}>
                  {aiReport.lore_proofs.map((proof, idx) => (
                    <li key={idx}>{proof}</li>
                  ))}
                </ul>
              </div>

              {/* Karşı İstisnai Durum */}
              {aiReport.counter_condition && (
                <div style={{ marginTop: '14px', fontSize: '.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                  💡 <strong>İstisnai Senaryo:</strong> {aiReport.counter_condition}
                </div>
              )}
            </div>
          )}

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
