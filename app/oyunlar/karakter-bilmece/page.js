'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import TierBadge from '../../components/TierBadge';
import { Avatar } from '../../components/UserBadge';
import { getDailyPlays, incrementDailyPlay, MAX_DAILY_PLAYS } from '../../lib/dailyLimit';

export default function KarakterBilmecePage() {
  const [config, setConfig] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [targetChar, setTargetChar] = useState(null);
  const [search, setSearch] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [won, setWon] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [dailyPlays, setDailyPlays] = useState(0);

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
            .select('id, name, series, tier, category, power_score, image_url')
            .eq('status', 'published'),
        ]);

        const plays = getDailyPlays(u, 'bilmece');
        setDailyPlays(plays);

        setConfig(cfgRes);
        const list = chars || [];
        setCharacters(list);

        if (list.length > 0) {
          // Günün karakterini deterministik olarak günün tarihine göre seç
          const today = new Date().toISOString().slice(0, 10);
          let hash = 0;
          for (let i = 0; i < today.length; i++) hash = (hash << 5) - hash + today.charCodeAt(i);
          const idx = Math.abs(hash) % list.length;
          setTargetChar(list[idx]);
        }
      } catch (err) {
        console.error('Karakter bilmece başlatılamadı:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) return <div className="wrap empty">Bilmece yükleniyor...</div>;

  if (config && config.karakter_bilmece === false) {
    return (
      <div className="wrap" style={{ maxWidth: '600px', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2>Bu Etkinlik Şu An Kapalı</h2>
        <p style={{ color: 'var(--text-dim)', margin: '10px 0 20px' }}>
          Günün Karakterini Bil etkinliği yönetici tarafından geçici olarak durdurulmuştur.
        </p>
        <a href="/oyunlar" className="btn btn-ghost">← Mini Oyunlar Merkezine Dön</a>
      </div>
    );
  }

  if (dailyPlays >= MAX_DAILY_PLAYS && !won) {
    return (
      <div className="wrap" style={{ maxWidth: '600px', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>⏳</div>
        <h2 style={{ color: 'var(--accent)' }}>Bugünkü Oyun Hakkın Doldu!</h2>
        <p style={{ color: 'var(--text-dim)', margin: '12px 0 24px', lineHeight: 1.6 }}>
          Para ve XP kasma açığını önlemek amacıyla mini oyunlar günde en fazla <strong>5 kez</strong> oynanabilir.
          Bugünkü 5 hakkını ({dailyPlays}/{MAX_DAILY_PLAYS}) kullandın. Yarın saat 00:00&apos;da yeni hakların tanımlanacak!
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a href="/oyunlar" className="btn btn-ghost">← Mini Oyunlar Menüsü</a>
          <a href="/kart-oyunu" className="btn">🃏 Kart Arenasında Savaş</a>
        </div>
      </div>
    );
  }

  function handleGuess(char) {
    if (!char || won || guesses.some((g) => g.id === char.id)) return;
    const newGuesses = [char, ...guesses];
    setGuesses(newGuesses);
    setSearch('');

    if (char.id === targetChar.id) {
      setWon(true);
      claimReward(newGuesses.length);
    }
  }

  async function claimReward(attempts) {
    if (!user || rewardClaimed) return;
    setRewardClaimed(true);

    if (dailyPlays < MAX_DAILY_PLAYS) {
      incrementDailyPlay(supabase, user, 'bilmece').then((newCount) => {
        setDailyPlays(newCount);
      });

      const baseReward = config?.bilmece_odul || 500;
      const finalCoins = config?.cift_odul ? baseReward * 2 : baseReward;
      const finalXp = config?.cift_odul ? 500 : 250;

      try {
        const { data: p } = await supabase.from('profiles').select('coins, xp').eq('id', user.id).maybeSingle();
        if (p) {
          await supabase.from('profiles').update({
            coins: (p.coins || 0) + finalCoins,
            xp: (p.xp || 0) + finalXp,
          }).eq('id', user.id);
        }
      } catch (e) {
        console.error('Ödül verilemedi:', e);
      }
    }
  }

  const filteredSearch = search.trim().length > 0
    ? characters.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) &&
        !guesses.some((g) => g.id === c.id)
      ).slice(0, 6)
    : [];

  // Viral emoji skor metni
  function getShareText() {
    const today = new Date().toLocaleDateString('tr-TR');
    let emojiGrid = '';
    guesses.forEach((g) => {
      const sameSeries = g.series === targetChar?.series ? '🟩' : '🟥';
      const sameCat = g.category === targetChar?.category ? '🟩' : '🟥';
      const sameTier = g.tier === targetChar?.tier ? '🟩' : '🟨';
      emojiGrid += `${sameSeries}${sameCat}${sameTier}\n`;
    });

    return `Turkish Tier List - Günün Karakteri 🧠 (${today})\n${guesses.length} Denemede Buldum!\n\n${emojiGrid}\nSen de bil: https://turkishtierlist.com/oyunlar/karakter-bilmece`;
  }

  function handleCopyShare() {
    const text = getShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="wrap" style={{ maxWidth: '820px', paddingBottom: '70px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span className="tag" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent)', fontWeight: 800 }}>
            GÜNLÜK VİRAL BİLMECE
          </span>
          <span className="tag" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#fef08a', fontWeight: 800 }}>
            🎮 Kalan Günlük Hak: {Math.max(0, MAX_DAILY_PLAYS - dailyPlays)} / {MAX_DAILY_PLAYS}
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', margin: '8px 0 6px' }}>🧩 Günün Karakterini Bil</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '.92rem', margin: 0 }}>
          Dizi, kategori ve güç göstergelerini takip ederek gizli karakteri en az denemede tahmin et.
        </p>
      </div>

      {/* Kazandın Kutlaması & Viral Paylaşım */}
      {won && (
        <div
          className="card"
          style={{
            marginBottom: '24px',
            padding: '24px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(111, 191, 115, 0.15), rgba(31, 107, 58, 0.05))',
            border: '2px solid #6fbf73',
            boxShadow: '0 0 30px rgba(111, 191, 115, 0.2)',
            borderRadius: '16px',
            animation: 'modalIn .25s ease-out',
          }}
        >
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <h2 style={{ color: '#8ce99a', margin: '4px 0 8px' }}>Tebrikler, Doğru Bildin!</h2>
          <p style={{ fontSize: '1.05rem', margin: '0 0 16px' }}>
            Gizli karakter: <strong>{targetChar?.name}</strong> ({targetChar?.series}) · <strong>{guesses.length}</strong> denemede buldun!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <span className="coin-pill">🪙 +{config?.cift_odul ? (config?.bilmece_odul || 500) * 2 : (config?.bilmece_odul || 500)} Tier Parası</span>
            <span className="tag" style={{ background: 'var(--accent)', color: '#111', fontWeight: 800 }}>⚡ +{config?.cift_odul ? 500 : 250} XP</span>
          </div>

          {/* Viral Paylaşım Butonları */}
          {config?.viral_paylasim !== false && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn"
                onClick={handleCopyShare}
                style={{ background: '#00f0ff', color: '#111', fontWeight: 800 }}
              >
                {copied ? '✓ Skor Kopyalandı!' : '📋 Skorumu Kopyala'}
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText())}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{ borderColor: '#25D366', color: '#25D366' }}
              >
                💬 WhatsApp'ta Paylaş
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{ borderColor: '#1DA1F2', color: '#1DA1F2' }}
              >
                🐦 X (Twitter)'da Paylaş
              </a>
            </div>
          )}
        </div>
      )}

      {/* Arama / Tahmin Kutusu */}
      {!won && (
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Bir karakter adı yazmaya başla (ör. Polat, Ezel, Tarkan)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 18px',
              fontSize: '1rem',
              background: 'var(--bg-2)',
              border: '2px solid var(--border)',
              borderRadius: '14px',
              color: 'var(--text)',
              outline: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            }}
          />

          {filteredSearch.length > 0 && (
            <div
              className="card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                zIndex: 30,
                padding: '6px',
                background: '#121624',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
              }}
            >
              {filteredSearch.map((char) => (
                <div
                  key={char.id}
                  onClick={() => handleGuess(char)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Avatar url={char.image_url} name={char.name} size={36} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '.95rem' }}>{char.name}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--text-dim)' }}>{char.series} · {char.category || 'Kurgu'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tahmin Tablosu & Karşılaştırma Akışı */}
      {guesses.length > 0 && (
        <div style={{ display: 'grid', gap: '10px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(140px, 1.4fr) repeat(4, 1fr)',
              gap: '8px',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '.82rem',
              color: 'var(--text-dim)',
              padding: '0 8px',
            }}
          >
            <div style={{ textAlign: 'left' }}>Karakter</div>
            <div>Dizi / Evren</div>
            <div>Kategori</div>
            <div>Tier</div>
            <div>Güç Puanı</div>
          </div>

          {guesses.map((g) => {
            const isTarget = g.id === targetChar?.id;
            const sameSeries = g.series === targetChar?.series;
            const sameCategory = g.category === targetChar?.category;
            const sameTier = g.tier === targetChar?.tier;
            const pDiff = (Number(targetChar?.power_score) || 0) - (Number(g.power_score) || 0);

            return (
              <div
                key={g.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(140px, 1.4fr) repeat(4, 1fr)',
                  gap: '8px',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: isTarget ? 'rgba(111, 191, 115, 0.2)' : 'var(--bg-2)',
                  border: `1px solid ${isTarget ? '#6fbf73' : 'var(--border)'}`,
                  fontSize: '.88rem',
                }}
              >
                {/* Karakter Bilgisi */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <Avatar url={g.image_url} name={g.name} size={36} />
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 800 }}>
                    {g.name}
                  </div>
                </div>

                {/* Dizi */}
                <div
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    background: sameSeries ? '#1f6b3a' : '#8a1f2d',
                    color: '#fff',
                    fontWeight: 700,
                    textAlign: 'center',
                    fontSize: '.82rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={g.series}
                >
                  {g.series || '-'}
                </div>

                {/* Kategori */}
                <div
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    background: sameCategory ? '#1f6b3a' : '#8a1f2d',
                    color: '#fff',
                    fontWeight: 700,
                    textAlign: 'center',
                    fontSize: '.82rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {g.category || 'Genel'}
                </div>

                {/* Tier */}
                <div
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    background: sameTier ? '#1f6b3a' : '#8a1f2d',
                    color: '#fff',
                    fontWeight: 700,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <TierBadge tier={g.tier} />
                </div>

                {/* Güç Skoru */}
                <div
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    background: pDiff === 0 ? '#1f6b3a' : '#2d3748',
                    color: pDiff === 0 ? '#8ce99a' : '#fff',
                    fontWeight: 800,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{g.power_score || 50}</span>
                  {pDiff > 0 && <span title="Gizli karakter daha güçlü!" style={{ color: '#fef08a' }}>▲</span>}
                  {pDiff < 0 && <span title="Gizli karakter daha zayıf!" style={{ color: '#ff4d6d' }}>▼</span>}
                  {pDiff === 0 && <span>✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
