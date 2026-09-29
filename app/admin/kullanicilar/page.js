'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import AdminGuard from '../../components/AdminGuard';
import UserBadge, { ROLES } from '../../components/UserBadge';

function timeLeft(iso) {
  if (!iso) return null;
  const ms = new Date(iso) - new Date();
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  return h >= 24 ? `${Math.floor(h / 24)} gün` : `${h} sa`;
}

function Users() {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState(null);
  const [open, setOpen] = useState(null); // genişletilmiş kullanıcı id'si
  const [amount, setAmount] = useState('1000');
  const [bulkAmount, setBulkAmount] = useState('1000');
  const [muteMin, setMuteMin] = useState('60');
  const [banMin, setBanMin] = useState('1440');
  const [banReason, setBanReason] = useState('');
  const [rightDays, setRightDays] = useState('7');
  const [lastBatch, setLastBatch] = useState(null);

  async function load() {
    const [{ data: us }, { data: it }] = await Promise.all([
      supabase.from('profiles').select('id, username, role, xp, coins, vip_until, muted_until, banned_until, ban_reason').order('created_at', { ascending: true }),
      supabase.from('shop_items').select('id, name, kind').order('sort'),
    ]);
    setUsers(us || []);
    setItems(it || []);
  }
  useEffect(() => { load(); }, []);

  async function run(fn, okText) {
    setMsg(null);
    const { error } = await fn();
    setMsg(error ? error.message : okText);
    load();
  }

  const changeRole = (id, role) => run(() => supabase.rpc('set_user_role', { target: id, new_role: role }), 'Rol güncellendi.');
  const giveCoins = (id) => run(() => supabase.rpc('grant_coins', { target: id, amount: Number(amount), reason: 'Admin: elle verildi' }), `${amount} tier parası verildi.`);
  const takeCoins = (id) => run(() => supabase.rpc('grant_coins', { target: id, amount: -Number(amount), reason: 'Admin: elle alındı' }), `${amount} tier parası geri alındı.`);
  const mute = (id) => run(() => supabase.rpc('moderate_user', { target: id, action: 'mute', minutes: Number(muteMin) }), 'Kullanıcı susturuldu.');
  const unmute = (id) => run(() => supabase.rpc('moderate_user', { target: id, action: 'unmute' }), 'Susturma kaldırıldı.');
  const ban = (id) => run(() => supabase.rpc('moderate_user', { target: id, action: 'ban', minutes: Number(banMin), reason: banReason || null }), 'Kullanıcı yasaklandı.');
  const unban = (id) => run(() => supabase.rpc('moderate_user', { target: id, action: 'unban' }), 'Yasak kaldırıldı.');
  const giveRight = (id, kind) => run(() => supabase.rpc('grant_right', { target: id, kind, days: Number(rightDays) }), 'Hak tanımlandı.');
  const giveItem = (id, item) => run(() => supabase.rpc('gift_item', { target: id, item }), 'Ürün hediye edildi.');

  async function giveAll() {
    setMsg(null);
    const { data, error } = await supabase.rpc('grant_coins_all', { amount: Number(bulkAmount), reason: 'Admin: herkese dağıtım' });
    if (error) { setMsg(error.message); return; }
    setLastBatch(data);
    setMsg(`Herkese ${bulkAmount} tier parası dağıtıldı. İstersen aşağıdan geri alabilirsin.`);
    load();
  }
  async function undoLastBatch() {
    if (!lastBatch) return;
    setMsg(null);
    const { error } = await supabase.rpc('revoke_batch', { bid: lastBatch });
    setMsg(error ? error.message : 'Son toplu dağıtım geri alındı.');
    setLastBatch(null);
    load();
  }

  return (
    <div className="wrap">
      <h1>Kullanıcılar</h1>
      {msg && <p style={{ color: 'var(--accent)' }}>{msg}</p>}

      <div className="card">
        <h3>Herkese Tier Parası Dağıt</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
          <input type="number" value={bulkAmount} onChange={(e) => setBulkAmount(e.target.value)} style={{ width: '140px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '9px 11px', color: 'var(--text)' }} />
          <button className="btn" onClick={giveAll}>Herkese Ver</button>
          {lastBatch && <button className="btn btn-ghost" onClick={undoLastBatch}>Son Dağıtımı Geri Al</button>}
        </div>
      </div>

      <div className="card" style={{ marginTop: '14px' }}>
        {users.map((u) => {
          const isOpen = open === u.id;
          return (
            <div key={u.id} style={{ borderBottom: '1px solid var(--border)', padding: '14px 0' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="who" style={{ minWidth: '110px' }}>{u.username}</span>
                <UserBadge role={u.role} xp={u.xp} />
                <span className="tag">🪙 {u.coins}</span>
                {u.banned_until && new Date(u.banned_until) > new Date() && <span className="tag" style={{ borderColor: 'var(--accent-2)', color: 'var(--accent-2)' }}>Yasaklı · {timeLeft(u.banned_until)}</span>}
                {u.muted_until && new Date(u.muted_until) > new Date() && <span className="tag" style={{ borderColor: 'var(--b)', color: 'var(--b)' }}>Susturulmuş · {timeLeft(u.muted_until)}</span>}
                <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} style={{ marginLeft: 'auto', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 10px', color: 'var(--text)' }}>
                  {Object.entries(ROLES).map(([key, [icon, label]]) => <option key={key} value={key}>{icon} {label}</option>)}
                </select>
                <button className="btn btn-ghost" onClick={() => setOpen(isOpen ? null : u.id)}>{isOpen ? 'Kapat' : 'Yönet'}</button>
              </div>

              {isOpen && (
                <div className="user-panel">
                  <div className="up-block">
                    <label>Tier Parası</label>
                    <div className="up-row">
                      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                      <button className="btn" onClick={() => giveCoins(u.id)}>Ver</button>
                      <button className="btn btn-ghost" onClick={() => takeCoins(u.id)}>Geri Al</button>
                    </div>
                  </div>

                  <div className="up-block">
                    <label>Susturma</label>
                    <div className="up-row">
                      <input type="number" value={muteMin} onChange={(e) => setMuteMin(e.target.value)} placeholder="dakika" />
                      <button className="btn" onClick={() => mute(u.id)}>Sustur</button>
                      <button className="btn btn-ghost" onClick={() => unmute(u.id)}>Kaldır</button>
                    </div>
                  </div>

                  <div className="up-block">
                    <label>Yasaklama</label>
                    <div className="up-row">
                      <input type="number" value={banMin} onChange={(e) => setBanMin(e.target.value)} placeholder="dakika" />
                      <input value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="sebep (isteğe bağlı)" style={{ flex: 1 }} />
                      <button className="btn" onClick={() => ban(u.id)}>Yasakla</button>
                      <button className="btn btn-ghost" onClick={() => unban(u.id)}>Kaldır</button>
                    </div>
                  </div>

                  <div className="up-block">
                    <label>Geçici Hak (VIP / Renkli İsim / Hareketli Avatar)</label>
                    <div className="up-row">
                      <input type="number" value={rightDays} onChange={(e) => setRightDays(e.target.value)} placeholder="gün" />
                      <button className="btn btn-ghost" onClick={() => giveRight(u.id, 'vip')}>VIP Ver</button>
                      <button className="btn btn-ghost" onClick={() => giveRight(u.id, 'name_color')}>Renkli İsim Ver</button>
                      <button className="btn btn-ghost" onClick={() => giveRight(u.id, 'avatar_gif')}>Hareketli Avatar Ver</button>
                    </div>
                  </div>

                  <div className="up-block">
                    <label>Kozmetik Hediye Et</label>
                    <div className="up-row" style={{ flexWrap: 'wrap' }}>
                      {items.map((it) => (
                        <button key={it.id} className="btn btn-ghost" onClick={() => giveItem(u.id, it.id)}>{it.name}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminGuard>
      <Users />
    </AdminGuard>
  );
}
