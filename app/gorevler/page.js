'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { levelFromXp, xpForLevel } from '../components/UserBadge';

export default function GorevlerPage() {
  const [user, setUser] = useState(undefined);
  const [xp, setXp] = useState(0);
  const [stats, setStats] = useState(null);
  const [quests, setQuests] = useState([]);
  const [achs, setAchs] = useState([]);
  const [earned, setEarned] = useState(new Set());
  const [msg, setMsg] = useState(null);

  async function load() {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u || null);
    if (!u) return;
    await supabase.rpc('heartbeat'); // günü yeniler, giriş görevini işler
    const [p, s, q, a, ua] = await Promise.all([
      supabase.from('profiles').select('xp').eq('id', u.id).maybeSingle(),
      supabase.from('user_stats').select('*').eq('user_id', u.id).maybeSingle(),
      supabase.from('quest_defs').select('*').order('sort'),
      supabase.from('achievements').select('*').order('sort'),
      supabase.from('user_achievements').select('achievement_id').eq('user_id', u.id),
    ]);
    setXp(p.data?.xp || 0);
    setStats(s.data);
    setQuests(q.data || []);
    setAchs(a.data || []);
    setEarned(new Set((ua.data || []).map((r) => r.achievement_id)));
  }
  useEffect(() => { load(); }, []);

  async function claim(id) {
    setMsg(null);
    const { data, error } = await supabase.rpc('claim_quest', { quest: id });
    setMsg(error ? error.message : `+${data} XP kazandın!`);
    load();
  }

  if (user === undefined) return <div className="wrap empty">Yükleniyor...</div>;
  if (!user) return <div className="wrap empty">Görevleri görmek için <a href="/giris-yap">giriş yapmalısın</a>.</div>;

  const s = stats || {};
  const claimed = s.claimed || [];
  const level = levelFromXp(xp);
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const pct = Math.min(100, Math.round(((xp - cur) / (next - cur)) * 100));
  const others = quests.filter((q) => q.metric !== 'all');

  const progressOf = (q) => {
    if (q.metric === 'all') return { val: others.filter((o) => claimed.includes(o.id)).length, target: others.length };
    return { val: s[q.metric] || 0, target: q.target };
  };
  const achValue = (a) => (a.metric === 'level' ? level : s[a.metric] || 0);

  return (
    <div className="wrap" style={{ maxWidth: '760px' }}>
      <h1>Görevler ve Başarılar</h1>

      <div className="card">
        <div className="profile-head" style={{ justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0 }}>Seviye {level}</h3>
            <p style={{ marginTop: '2px' }}>{xp} XP · sonraki seviyeye {next - xp} XP</p>
          </div>
          <div className="streak">🔥 {s.streak || 0} günlük seri</div>
        </div>
        <div className="xp-track"><div className="xp-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      <section className="section" style={{ paddingTop: '30px' }}>
        <div className="section-head">
          <h2>Günlük Görevler</h2>
          <p>Görevler her gün gece yarısı (Türkiye saati) yenilenir.</p>
        </div>
        {msg && <p style={{ color: 'var(--accent)', marginTop: '10px' }}>{msg}</p>}
        <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
          {quests.map((q) => {
            const { val, target } = progressOf(q);
            const done = val >= target;
            const isClaimed = claimed.includes(q.id);
            return (
              <div className="card quest" key={q.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="quest-title">{q.title} <span className="tag">+{q.reward_xp} XP</span></div>
                  <p>{q.description}</p>
                  <div className="bar-track" style={{ marginTop: '10px' }}>
                    <div className="bar-fill" style={{ width: `${target ? Math.min(100, (val / target) * 100) : 0}%` }} />
                  </div>
                  <p style={{ marginTop: '4px', fontSize: '.78rem' }}>{Math.min(val, target)} / {target}</p>
                </div>
                {isClaimed ? (
                  <span className="quest-done">✓ Alındı</span>
                ) : (
                  <button className="btn" disabled={!done} onClick={() => claim(q.id)} style={{ opacity: done ? 1 : 0.4 }}>Ödülü Al</button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="section" style={{ paddingTop: '34px' }}>
        <div className="section-head">
          <h2>Başarılar</h2>
          <p>{earned.size} / {achs.length} başarı kazanıldı. Başarılar otomatik açılır ve XP kazandırır.</p>
        </div>
        <div className="ach-grid">
          {achs.map((a) => {
            const got = earned.has(a.id);
            const val = Math.min(achValue(a), a.threshold);
            return (
              <div className={`card ach${got ? '' : ' locked'}`} key={a.id}>
                <div className="ach-icon">{a.icon}</div>
                <h3>{a.name}</h3>
                <p>{a.description}</p>
                <p style={{ marginTop: '8px', fontSize: '.78rem' }}>
                  {got ? `Kazanıldı · +${a.reward_xp} XP` : `${val} / ${a.threshold} · +${a.reward_xp} XP`}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
