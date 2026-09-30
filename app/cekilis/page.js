'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import SpinWheel from '../components/SpinWheel';
import { addCoins, addXP } from '../lib/wallet';

function nextResetLabel() {
  const now = new Date();
  const tr = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
  const next = new Date(tr);
  next.setHours(9, 0, 0, 0);
  if (tr >= next) next.setDate(next.getDate() + 1);
  const diffMs = next - tr;
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  return `${h} sa ${m} dk sonra (09:00, TR saati)`;
}

const FALLBACK_REWARDS = [
  { id: 'avatar_gif_30d', label: '30 Günlük GIF Avatar', icon: '👑', weight: 2, sort: 1 },
  { id: 'profile_bg_30d', label: '30 Günlük GIF Arka Plan', icon: '🖼️', weight: 2, sort: 2 },
  { id: 'avatar_gif_7d', label: '7 Günlük GIF Avatar', icon: '🎞️', weight: 5, sort: 3 },
  { id: 'profile_bg_7d', label: '7 Günlük GIF Arka Plan', icon: '✨', weight: 5, sort: 4 },
  { id: 'coins_2500', label: '2.500 Tier Parası', icon: '💎', weight: 6, sort: 5 },
  { id: 'coins_1000', label: '1.000 Tier Parası', icon: '💰', weight: 15, sort: 6 },
  { id: 'coins_500', label: '500 Tier Parası', icon: '🪙', weight: 30, sort: 7 },
  { id: 'xp_250', label: '250 XP', icon: '⚡', weight: 25, sort: 8 },
  { id: 'xp_500', label: '500 XP', icon: '🚀', weight: 10, sort: 9 },
];

function pickWeightedReward(rewardsList) {
  const totalWeight = rewardsList.reduce((sum, r) => sum + (Number(r.weight) || 1), 0);
  let random = Math.random() * totalWeight;
  for (const r of rewardsList) {
    const weight = Number(r.weight) || 1;
    if (random < weight) {
      return r.id;
    }
    random -= weight;
  }
  return rewardsList[0]?.id;
}

export default function CekilisPage() {
  const [user, setUser] = useState(undefined);
  const [spin, setSpin] = useState(null);
  const [bonusReady, setBonusReady] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [msg, setMsg] = useState(null);
  const [spinning1, setSpinning1] = useState(false);
  const [spinning2, setSpinning2] = useState(false);

  async function load() {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u || null);
    if (!u) return;

    let finalRewards = FALLBACK_REWARDS;
    try {
      const { data: rw } = await supabase.from('spin_rewards').select('*').order('sort');
      if (rw && rw.length > 0) {
        finalRewards = rw;
      } else if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('custom_spin_rewards');
        if (cached) {
          try { finalRewards = JSON.parse(cached); } catch {}
        }
      }
    } catch {}

    setRewards(finalRewards);

    try {
      const { data: per } = await supabase.rpc('spin_period');
      const [{ data: s }, { data: stats }] = await Promise.all([
        supabase.from('daily_spins').select('*').eq('user_id', u.id).eq('period', per).maybeSingle(),
        supabase.from('user_stats').select('claimed').eq('user_id', u.id).maybeSingle(),
      ]);
      setSpin(s || { spin1_reward: null, spin2_reward: null });
      setBonusReady(!!stats?.claimed?.includes('bonus'));
    } catch (err) {
      console.warn('Spin verisi yüklenemedi:', err);
    }
  }
  useEffect(() => { load(); }, []);

  async function doSpin(which) {
    setMsg(null);
    let chosenRewardId = null;
    try {
      const { data, error } = await supabase.rpc('claim_daily_spin', { which });
      if (!error && data) {
        chosenRewardId = data;
      }
    } catch {}

    if (!chosenRewardId) {
      // Yönetici tarafından belirlenen %2 gibi ağırlıklara göre şans hesapla
      chosenRewardId = pickWeightedReward(rewards);
    }
    return chosenRewardId;
  }

  async function afterSpin(which, rewardId) {
    if (!rewardId) return;
    const r = rewards.find((x) => x.id === rewardId);
    setTimeout(async () => {
      setMsg(r ? `${r.icon} Kazandın: ${r.label}!` : 'Ödül kazandın!');
      // Eğer kazanılan ödül GIF avatar veya GIF arkaplan ise süreyi hemen tanımla
      const isAvatarGif = rewardId === 'avatar_gif_7d' || rewardId === 'avatar_gif_permit' || rewardId === 'avatar_gif_30d';
      const isBgGif = rewardId === 'profile_bg_7d' || rewardId === 'profile_bg_permit' || rewardId === 'profile_bg_30d';
      
      if (user && isAvatarGif) {
        const days = rewardId.includes('30') ? 30 : 7;
        const cur = user?.user_metadata?.avatar_gif_until && new Date(user.user_metadata.avatar_gif_until) > new Date()
          ? new Date(user.user_metadata.avatar_gif_until).getTime()
          : Date.now();
        const newUntil = new Date(cur + days * 24 * 60 * 60 * 1000).toISOString();
        try { await supabase.from('profiles').update({ avatar_gif_until: newUntil }).eq('id', user.id); } catch {}
        await supabase.auth.updateUser({ data: { avatar_gif_until: newUntil } });
      } else if (user && isBgGif) {
        const days = rewardId.includes('30') ? 30 : 7;
        const cur = user?.user_metadata?.profile_bg_until && new Date(user.user_metadata.profile_bg_until) > new Date()
          ? new Date(user.user_metadata.profile_bg_until).getTime()
          : Date.now();
        const newUntil = new Date(cur + days * 24 * 60 * 60 * 1000).toISOString();
        try { await supabase.from('profiles').update({ profile_bg_until: newUntil }).eq('id', user.id); } catch {}
        await supabase.auth.updateUser({ data: { profile_bg_until: newUntil } });
        if (typeof window !== 'undefined') {
          localStorage.setItem(`user_profile_bg_until_${user.id}`, newUntil);
          window.dispatchEvent(new CustomEvent('profile-updated', { detail: { profile_bg_until: newUntil } }));
        }
      } else if (user && rewardId.startsWith('coins_')) {
        const amt = Number(rewardId.split('_')[1]) || 500;
        try {
          await addCoins(user, amt);
        } catch {}
      } else if (user && rewardId.startsWith('xp_')) {
        const amt = Number(rewardId.split('_')[1]) || 250;
        try {
          await addXP(user, amt);
        } catch {}
      }

      load();
    }, 3200);
  }

  if (user === undefined) return <div className="wrap empty">Yükleniyor...</div>;
  if (!user) return <div className="wrap empty">Çekilişe katılmak için <a href="/giris-yap">giriş yapmalısın</a>.</div>;

  const totalWeight = rewards.reduce((sum, r) => sum + (Number(r.weight) || 1), 0);

  return (
    <div className="wrap" style={{ maxWidth: '820px', paddingBottom: '60px' }}>
      <h1>Günlük Çekiliş</h1>
      <p>Her gün 09:00'da (Türkiye saati) yeni bir çekiliş hakkın olur. Günün tüm görevlerini tamamlarsan ikinci bir çekiliş daha kazanırsın.</p>
      {msg && <p style={{ color: 'var(--accent)', fontWeight: 700 }}>{msg}</p>}

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card spin-card">
          <h3>1. Çekiliş</h3>
          {spin?.spin1_reward ? (
            <>
              <SpinWheel rewards={rewards} disabled onSpin={() => null} spinning={false} setSpinning={() => {}} />
              <p className="quest-done">✓ Bugün alındı</p>
            </>
          ) : rewards.length > 0 ? (
            <SpinWheel
              rewards={rewards}
              disabled={false}
              spinning={spinning1}
              setSpinning={setSpinning1}
              onSpin={async () => { const rid = await doSpin(1); afterSpin(1, rid); return rid; }}
            />
          ) : null}
        </div>
        <div className="card spin-card">
          <h3>2. Çekiliş</h3>
          {spin?.spin2_reward ? (
            <>
              <SpinWheel rewards={rewards} disabled onSpin={() => null} spinning={false} setSpinning={() => {}} />
              <p className="quest-done">✓ Bugün alındı</p>
            </>
          ) : !bonusReady ? (
            <a href="/gorevler" className="btn btn-ghost">Önce Görevleri Tamamla</a>
          ) : rewards.length > 0 ? (
            <SpinWheel
              rewards={rewards}
              disabled={false}
              spinning={spinning2}
              setSpinning={setSpinning2}
              onSpin={async () => { const rid = await doSpin(2); afterSpin(2, rid); return rid; }}
            />
          ) : null}
        </div>
      </div>

      <p style={{ marginTop: '16px', color: 'var(--text-dim)', fontSize: '.85rem' }}>Sonraki yenileme: {nextResetLabel()}</p>

      <section className="section">
        <div className="section-head">
          <h2>Olası Ödüller & Çıkma İhtimalleri</h2>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          {rewards.map((r) => {
            const w = Number(r.weight) || 1;
            const pct = totalWeight > 0 ? ((w / totalWeight) * 100).toFixed(1) : '0';
            const isUltraRare = Number(pct) <= 3;
            const isRare = Number(pct) > 3 && Number(pct) <= 8;

            return (
              <div
                className="card"
                key={r.id}
                style={{
                  textAlign: 'center',
                  position: 'relative',
                  padding: '16px 12px',
                  borderColor: isUltraRare ? '#e6455b' : isRare ? '#e68a25' : undefined,
                  boxShadow: isUltraRare ? '0 0 16px rgba(230, 69, 91, 0.2)' : undefined,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    fontSize: '.68rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '8px',
                    background: isUltraRare ? 'rgba(230, 69, 91, 0.2)' : isRare ? 'rgba(230, 138, 37, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: isUltraRare ? '#ff4d6d' : isRare ? '#ffa94d' : 'var(--text-dim)',
                  }}
                >
                  %{pct} {isUltraRare ? '🔥' : ''}
                </span>
                <div style={{ fontSize: '2.2rem', marginTop: '6px' }}>{r.icon}</div>
                <p style={{ marginTop: '8px', fontWeight: 700, fontSize: '.88rem' }}>{r.label}</p>
                {isUltraRare && (
                  <span style={{ fontSize: '.7rem', color: '#ff4d6d', fontWeight: 800 }}>Aşırı Nadir</span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
