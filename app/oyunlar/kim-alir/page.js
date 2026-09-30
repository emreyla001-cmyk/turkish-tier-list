'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import TierBadge from '../../components/TierBadge';
import { tierRank } from '../../components/tiers';

export default function KimAlirPage() {
  const [config, setConfig] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [char1, setChar1] = useState(null);
  const [char2, setChar2] = useState(null);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const TOTAL_ROUNDS = 10;

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const { data: { user: u } } = await supabase.auth.getUser();
        setUser(u || null);

        const [cfgRes, { data: chars }] = await Promise.all([
          fetch('/api/events').then((r) => r.json()),
          supabase
            .from('characters')
            .select('id, name, series, tier, category, power_score, speed_score, intelligence_score, durability_score, image_url')
            .eq('status', 'published'),
        ]);

        setConfig(cfgRes);
        const list = (chars || []).filter((c) => c.image_url);
        setCharacters(list);

        if (list.length >= 2) {
          nextDuel(list, 0);
        }
      } catch (err) {
        console.error('Quiz başlatılamadı:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  function getWinner(c1, c2) {
    if (!c1 || !c2) return null;
    const r1 = tierRank(c1.tier);
    const r2 = tierRank(c2.tier);
    if (r1 > r2) return c1;
    if (r2 > r1) return c2;
    // Tie breaker on power_score
    const p1 = Number(c1.power_score) || 0;
    const p2 = Number(c2.power_score) || 0;
    if (p1 >= p2) return c1;
    return c2;
  }

  function nextDuel(list = characters, nextRoundNum = round + 1) {
    if (nextRoundNum >= TOTAL_ROUNDS) {
      setFinished(true);
      return;
    }

    // İki farklı rastgele karakter seç
    const i1 = Math.floor(Math.random() * list.length);
    let i2 = Math.floor(Math.random() * list.length);
    while (i2 === i1 && list.length > 1) {
      i2 = Math.floor(Math.random() * list.length);
    }

    setChar1(list[i1]);
    setChar2(list[i2]);
    setSelected(null);
    setRevealed(false);
    setRound(nextRoundNum);
  }

  async function handleChoice(chosenChar) {
    if (revealed || finished) return;
    setSelected(chosenChar.id);
    setRevealed(true);

    const winner = getWinner(char1, char2);
    const isCorrect = chosenChar.id === winner.id;
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      nextDuel(characters, round + 1);
    }, 2400);
  }

  useEffect(() => {
    if (finished && user && !rewardClaimed) {
      setRewardClaimed(true);
      const base = config?.kim_alir_odul || 750;
      // Skora göre orantılı ödül
      const earnedCoins = Math.round((base * (score / TOTAL_ROUNDS)));
      const finalCoins = config?.cift_odul ? earnedCoins * 2 : earnedCoins;
      const finalXp = config?.cift_odul ? 700 : 350;

      supabase.from('profiles').select('coins, xp').eq('id', user.id).maybeSingle().then(({ data: p }) => {
        if (p) {
          supabase.from('profiles').update({
            coins: (p.coins || 0) + finalCoins,
            xp: (p.xp || 0) + finalXp,
          }).eq('id', user.id);
        }
      });
    }
  }, [finished]);

  if (loading) return <div className="wrap empty">VS Düelloları hazırlanıyor...</div>;

  if (config && config.kim_alir === false) {
    return (
      <div className="wrap" style={{ maxWidth: '600px', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2>Bu Etkinlik Şu An Kapalı</h2>
        <p style={{ color: 'var(--text-dim)', margin: '10px 0 20px' }}>
          Kim Alır? VS Quiz etkinliği yönetici tarafından geçici olarak durdurulmuştur.
        </p>
        <a href="/oyunlar" className="btn btn-ghost">← Mini Oyunlar Merkezine Dön</a>
      </div>
    );
  }

  const winner = getWinner(char1, char2);

  function getShareText() {
    return `Turkish Tier List - Kim Alır? ⚔️\n10 Düellodan ${score} Tanesini Doğru Bildim! 🔥\nSen ne kadar tanıyorsun? Kıyasla:\nhttps://turkishtierlist.com/oyunlar/kim-alir`;
  }

  function handleCopyShare() {
    navigator.clipboard.writeText(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="wrap" style={{ maxWidth: '820px', paddingBottom: '70px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span className="tag" style={{ background: 'rgba(230, 69, 91, 0.15)', color: 'var(--accent)', fontWeight: 800 }}>
          HIZLI DÜELLO QUİZİ
        </span>
        <h1 style={{ fontSize: '2rem', margin: '8px 0 4px' }}>⚔️ Kim Alır?</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '.92rem', margin: 0 }}>
          Hangisi daha güçlü? Tarafını seç, istatistikleri gör ve seriyi tamamla!
        </p>
      </div>

      {/* İlerleme & Skor Bandı */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          marginBottom: '24px',
        }}
      >
        <div>
          <span style={{ fontSize: '.84rem', color: 'var(--text-dim)' }}>Düello: </span>
          <strong style={{ fontSize: '1.1rem' }}>{Math.min(round + 1, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}</strong>
        </div>
        <div>
          <span style={{ fontSize: '.84rem', color: 'var(--text-dim)' }}>Skor: </span>
          <strong style={{ fontSize: '1.1rem', color: '#6fbf73' }}>{score} Doğru</strong>
        </div>
      </div>

      {/* OYUN BİTİŞ KARTI */}
      {finished ? (
        <div
          className="card"
          style={{
            padding: '36px 24px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(230, 179, 37, 0.1), rgba(0, 240, 255, 0.05))',
            border: '2px solid var(--accent)',
            borderRadius: '20px',
          }}
        >
          <div style={{ fontSize: '3.5rem' }}>🏆</div>
          <h2 style={{ fontSize: '1.8rem', margin: '10px 0 6px' }}>Düello Serisi Tamamlandı!</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text)', margin: '0 0 16px' }}>
            Toplam Skorun: <strong style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>{score} / {TOTAL_ROUNDS}</strong>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <span className="coin-pill">🪙 +{Math.round((config?.kim_alir_odul || 750) * (score / TOTAL_ROUNDS))} Tier Parası</span>
            <span className="tag" style={{ background: 'var(--accent)', color: '#111', fontWeight: 800 }}>⚡ +350 XP</span>
          </div>

          {/* Viral Paylaşım */}
          {config?.viral_paylasim !== false && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <button
                type="button"
                className="btn"
                onClick={handleCopyShare}
                style={{ background: '#00f0ff', color: '#111', fontWeight: 800 }}
              >
                {copied ? '✓ Skor Kopyalandı!' : '📋 Skorunu Kopyala'}
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText())}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{ borderColor: '#25D366', color: '#25D366' }}
              >
                💬 WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{ borderColor: '#1DA1F2', color: '#1DA1F2' }}
              >
                🐦 X (Twitter)
              </a>
            </div>
          )}

          <div>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setScore(0);
                setRound(0);
                setFinished(false);
                setRewardClaimed(false);
                nextDuel(characters, 0);
              }}
              style={{ padding: '10px 24px', fontWeight: 800 }}
            >
              🔄 Yeniden Oyna
            </button>
          </div>
        </div>
      ) : (
        /* DÜELLO ALANI */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center' }}>
          {/* 1. KARAKTER */}
          <div
            className="card"
            onClick={() => handleChoice(char1)}
            style={{
              padding: '20px',
              textAlign: 'center',
              cursor: revealed ? 'default' : 'pointer',
              transition: 'all .25s ease',
              border: revealed
                ? winner?.id === char1?.id
                  ? '3px solid #6fbf73'
                  : '1px solid #e6455b'
                : selected === char1?.id
                ? '2px solid var(--accent)'
                : '1px solid var(--border)',
              background: revealed && winner?.id === char1?.id ? 'rgba(111, 191, 115, 0.15)' : undefined,
              boxShadow: revealed && winner?.id === char1?.id ? '0 0 30px rgba(111, 191, 115, 0.3)' : undefined,
            }}
          >
            <div style={{ width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', background: '#0a0d14' }}>
              <img
                src={char1?.image_url}
                alt={char1?.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem' }}>{char1?.name}</h3>
            <p style={{ margin: '0 0 10px', fontSize: '.84rem', color: 'var(--text-dim)' }}>{char1?.series}</p>

            {revealed ? (
              <div style={{ animation: 'modalIn .2s ease-out' }}>
                <div style={{ margin: '8px 0' }}><TierBadge tier={char1?.tier} /></div>
                <div style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--accent)' }}>
                  Güç Puanı: {char1?.power_score || 50}
                </div>
                {winner?.id === char1?.id && (
                  <div style={{ marginTop: '8px', color: '#8ce99a', fontWeight: 800, fontSize: '1rem' }}>
                    👑 KAZANIR
                  </div>
                )}
              </div>
            ) : (
              <button type="button" className="btn" style={{ width: '100%', marginTop: '6px' }}>
                Bunu Seç
              </button>
            )}
          </div>

          {/* ORTADAKİ VS SİMGESİ */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                color: '#111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.2rem',
                boxShadow: '0 0 20px var(--accent-glow)',
              }}
            >
              VS
            </div>
          </div>

          {/* 2. KARAKTER */}
          <div
            className="card"
            onClick={() => handleChoice(char2)}
            style={{
              padding: '20px',
              textAlign: 'center',
              cursor: revealed ? 'default' : 'pointer',
              transition: 'all .25s ease',
              border: revealed
                ? winner?.id === char2?.id
                  ? '3px solid #6fbf73'
                  : '1px solid #e6455b'
                : selected === char2?.id
                ? '2px solid var(--accent)'
                : '1px solid var(--border)',
              background: revealed && winner?.id === char2?.id ? 'rgba(111, 191, 115, 0.15)' : undefined,
              boxShadow: revealed && winner?.id === char2?.id ? '0 0 30px rgba(111, 191, 115, 0.3)' : undefined,
            }}
          >
            <div style={{ width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', background: '#0a0d14' }}>
              <img
                src={char2?.image_url}
                alt={char2?.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem' }}>{char2?.name}</h3>
            <p style={{ margin: '0 0 10px', fontSize: '.84rem', color: 'var(--text-dim)' }}>{char2?.series}</p>

            {revealed ? (
              <div style={{ animation: 'modalIn .2s ease-out' }}>
                <div style={{ margin: '8px 0' }}><TierBadge tier={char2?.tier} /></div>
                <div style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--accent)' }}>
                  Güç Puanı: {char2?.power_score || 50}
                </div>
                {winner?.id === char2?.id && (
                  <div style={{ marginTop: '8px', color: '#8ce99a', fontWeight: 800, fontSize: '1rem' }}>
                    👑 KAZANIR
                  </div>
                )}
              </div>
            ) : (
              <button type="button" className="btn" style={{ width: '100%', marginTop: '6px' }}>
                Bunu Seç
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
