'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import SpinWheel from '../components/SpinWheel';

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
    const { data: per } = await supabase.rpc('spin_period');
    const [{ data: s }, { data: stats }, { data: rw }] = await Promise.all([
      supabase.from('daily_spins').select('*').eq('user_id', u.id).eq('period', per).maybeSingle(),
      supabase.from('user_stats').select('claimed').eq('user_id', u.id).maybeSingle(),
      supabase.from('spin_rewards').select('*').order('sort'),
    ]);
    setSpin(s || { spin1_reward: null, spin2_reward: null });
    setBonusReady(!!stats?.claimed?.includes('bonus'));
    setRewards(rw || []);
  }
  useEffect(() => { load(); }, []);

  async function doSpin(which) {
    setMsg(null);
    const { data, error } = await supabase.rpc('claim_daily_spin', { which });
    if (error) { setMsg(error.message); return null; }
    return data;
  }

  async function afterSpin(which, rewardId) {
    if (!rewardId) return;
    const r = rewards.find((x) => x.id === rewardId);
    setTimeout(() => {
      setMsg(r ? `${r.icon} Kazandın: ${r.label}!` : 'Ödül kazandın!');
      load();
    }, 3200);
  }

  if (user === undefined) return <div className="wrap empty">Yükleniyor...</div>;
  if (!user) return <div className="wrap empty">Çekilişe katılmak için <a href="/giris-yap">giriş yapmalısın</a>.</div>;

  return (
    <div className="wrap" style={{ maxWidth: '760px' }}>
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
        <div className="section-head"><h2>Olası Ödüller</h2></div>
        <div className="grid">
          {rewards.map((r) => (
            <div className="card" key={r.id} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem' }}>{r.icon}</div>
              <p style={{ marginTop: '6px', fontWeight: 700 }}>{r.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
