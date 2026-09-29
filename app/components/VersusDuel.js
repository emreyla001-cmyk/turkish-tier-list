'use client';

import { useEffect, useState } from 'react';
import TierBadge from './TierBadge';

export default function VersusDuel({ characters = [] }) {
  // En az 2 karakter yoksa render etme
  if (!characters || characters.length < 2) return null;

  // İki varsayılan karakter seç (veya ilk 2 karakter)
  const c1 = characters[0];
  const c2 = characters[1];

  const duelKey = `duel_${c1.id}_vs_${c2.id}`;

  const [votes, setVotes] = useState({ left: 34, right: 28 });
  const [hasVoted, setHasVoted] = useState(false);
  const [userChoice, setUserChoice] = useState(null);

  useEffect(() => {
    try {
      const savedChoice = localStorage.getItem(duelKey);
      if (savedChoice) {
        setHasVoted(true);
        setUserChoice(savedChoice);
      }
      const savedVotes = localStorage.getItem(`${duelKey}_counts`);
      if (savedVotes) {
        setVotes(JSON.parse(savedVotes));
      }
    } catch {
      // localStorage erişim hatası güvenliği
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
    try {
      localStorage.setItem(duelKey, choice);
      localStorage.setItem(`${duelKey}_counts`, JSON.stringify(nextVotes));
    } catch {
      // ignore
    }
  }

  const total = votes.left + votes.right;
  const leftPct = Math.round((votes.left / total) * 100);
  const rightPct = 100 - leftPct;

  return (
    <section className="section versus-section">
      <div className="section-head text-center">
        <span className="kicker kicker-red">⚡ Günün Karşılaşması</span>
        <h2>Kim Alır? Topluluk Düellosu</h2>
        <p>İki efsane karşı karşıya gelirse galip kim olur? Oyunu ver, sonucu gör.</p>
      </div>

      <div className="versus-box">
        {/* Sol Karakter */}
        <div className={`versus-fighter left ${userChoice === 'left' ? 'voted' : ''}`}>
          <div className="fighter-poster">
            {c1.image_url ? (
              <img src={c1.image_url} alt={c1.name} />
            ) : (
              <div className="poster-fallback">🎭</div>
            )}
            <div className="fighter-tier">
              <TierBadge tier={c1.tier} />
            </div>
          </div>
          <div className="fighter-meta">
            <h3>{c1.name}</h3>
            <span className="fighter-series">{c1.series || 'Kurgu'}</span>
            <div className="fighter-stat-mini">
              <span>⚡ Güç: {c1.power_score ?? '?'}/10</span>
              <span>🧠 Zeka: {c1.intelligence_score ?? '?'}/10</span>
            </div>
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

        {/* Ortadaki VS Amblemi ve Canlı Bar */}
        <div className="versus-divider">
          <div className="vs-emblem">VS</div>
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
              <TierBadge tier={c2.tier} />
            </div>
          </div>
          <div className="fighter-meta">
            <h3>{c2.name}</h3>
            <span className="fighter-series">{c2.series || 'Kurgu'}</span>
            <div className="fighter-stat-mini">
              <span>⚡ Güç: {c2.power_score ?? '?'}/10</span>
              <span>🧠 Zeka: {c2.intelligence_score ?? '?'}/10</span>
            </div>
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

      <div className="text-center" style={{ marginTop: '22px' }}>
        <a href="/vs" className="btn btn-ghost">
          ⚔️ Kendi Karakter Karşılaştırmanı Yap →
        </a>
      </div>
    </section>
  );
}
