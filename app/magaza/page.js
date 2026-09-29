'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { frameStyle, nameColorStyle } from '../components/cosmetics';

const KIND_LABEL = { frame: 'Avatar Çerçeveleri', background: 'Profil Arka Planları', name_color: 'İsim Renkleri', avatar_gif_permit: 'Özel Haklar' };
const KIND_ORDER = ['frame', 'name_color', 'background', 'avatar_gif_permit'];

export default function MagazaPage() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [owned, setOwned] = useState(new Set());
  const [msg, setMsg] = useState(null);

  async function load() {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u || null);
    const { data: shop } = await supabase.from('shop_items').select('*').order('sort');
    setItems(shop || []);
    if (u) {
      const [{ data: p }, { data: inv }] = await Promise.all([
        supabase.from('profiles').select('coins, vip_until').eq('id', u.id).maybeSingle(),
        supabase.from('user_inventory').select('item_id').eq('user_id', u.id),
      ]);
      setProfile(p);
      setOwned(new Set((inv || []).map((r) => r.item_id)));
    }
  }
  useEffect(() => { load(); }, []);

  async function buy(item) {
    setMsg(null);
    const { error } = await supabase.rpc('buy_item', { item: item.id });
    setMsg(error ? error.message : `"${item.name}" satın alındı!`);
    load();
  }

  async function equip(item) {
    setMsg(null);
    const { error } = await supabase.rpc('equip_item', { p_kind: item.kind, p_item: item.id });
    setMsg(error ? error.message : `"${item.name}" kullanılıyor.`);
    load();
  }

  const isVip = profile?.vip_until && new Date(profile.vip_until) > new Date();

  if (user === undefined) return <div className="wrap empty">Yükleniyor...</div>;
  if (!user) return <div className="wrap empty">Mağazayı görmek için <a href="/giris-yap">giriş yapmalısın</a>.</div>;

  return (
    <div className="wrap">
      <div className="shop-head">
        <h1>Mağaza</h1>
        <div className="coin-pill">🪙 {profile?.coins ?? 0}</div>
      </div>
      <p>Tier parası biriktirerek <a href="/gorevler">görevler</a> ve <a href="/cekilis">günlük çekiliş</a> ile kazanılır.</p>
      {msg && <p style={{ color: 'var(--accent)' }}>{msg}</p>}

      {KIND_ORDER.map((kind) => {
        const list = items.filter((i) => i.kind === kind);
        if (list.length === 0) return null;
        return (
          <section className="section" key={kind}>
            <div className="section-head"><h2>{KIND_LABEL[kind]}</h2></div>
            <div className="grid">
              {list.map((it) => {
                const has = owned.has(it.id);
                const tempAccess = it.kind === 'name_color' && isVip === false && profile?.name_color_until && new Date(profile.name_color_until) > new Date();
                const canUse = has || tempAccess;
                return (
                  <div className="card shop-item" key={it.id}>
                    <div className="shop-preview">
                      {kind === 'frame' && <span className="frame-demo" style={frameStyle(it.value)} />}
                      {kind === 'background' && <span className="bg-demo" style={{ background: it.value }} />}
                      {kind === 'name_color' && <span style={{ ...nameColorStyle(it.value), fontSize: '1.3rem' }}>Nezha</span>}
                      {kind === 'avatar_gif_permit' && <span style={{ fontSize: '2rem' }}>🎞️</span>}
                    </div>
                    <h3>{it.name} {it.vip_only && <span className="tag" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>VIP</span>}</h3>
                    <p>{it.price.toLocaleString('tr-TR')} tier parası · {it.sold_count} satıldı</p>
                    {canUse ? (
                      <button className="btn btn-ghost" onClick={() => equip(it)} disabled={it.kind !== 'name_color' && !has}>Kullan</button>
                    ) : (
                      <button className="btn" onClick={() => buy(it)}>Satın Al</button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
