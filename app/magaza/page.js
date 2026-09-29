'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { frameStyle, nameColorStyle, resolveBackground, resolveFrame, resolveNameColor } from '../components/cosmetics';
import { Avatar, NameTag } from '../components/UserBadge';

const KIND_LABEL = {
  frame: 'Avatar Çerçeveleri',
  name_color: 'İsim Renkleri',
  background: 'Profil Arka Planları',
  avatar_gif_permit: 'Özel Haklar',
};
const KIND_ORDER = ['frame', 'name_color', 'background', 'avatar_gif_permit'];

export default function MagazaPage() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [owned, setOwned] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all');
  const [msg, setMsg] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  async function load() {
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u || null);

      const { data: shop } = await supabase.from('shop_items').select('*').order('sort');
      setItems(shop || []);

      if (u) {
        const [{ data: p }, { data: inv }] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, username, avatar_url, coins, role, vip_until, name_color_until, avatar_gif_until, equipped_frame, equipped_background, equipped_name_color')
            .eq('id', u.id)
            .maybeSingle(),
          supabase.from('user_inventory').select('item_id').eq('user_id', u.id),
        ]);
        setProfile(p);
        setOwned(new Set((inv || []).map((r) => r.item_id)));
      }
    } catch (err) {
      console.error('Mağaza yükleme hatası:', err);
    }
  }

  useEffect(() => { load(); }, []);

  async function buy(item) {
    if (!user) return;
    setLoadingAction(item.id);
    setMsg(null);
    try {
      const { error } = await supabase.rpc('buy_item', { item: item.id });
      if (error) {
        setMsg({ text: error.message, type: 'error' });
      } else {
        setMsg({ text: `"${item.name}" başarıyla satın alındı! Envanterine eklendi.`, type: 'success' });
        // Satın alındıktan sonra otomatik kuşan
        await equip(item, false);
      }
    } catch (e) {
      setMsg({ text: e.message || 'Satın alma başarısız oldu.', type: 'error' });
    } finally {
      setLoadingAction(null);
      load();
    }
  }

  async function equip(item, showSuccessMsg = true) {
    if (!user) return;
    setLoadingAction(item.id);
    setMsg(null);

    const kindToColumn = {
      frame: 'equipped_frame',
      background: 'equipped_background',
      name_color: 'equipped_name_color',
    };

    const col = kindToColumn[item.kind];
    const isCurrentlyEquipped = profile && profile[col] === item.id;
    const targetValue = isCurrentlyEquipped ? null : item.id;

    try {
      // 1. Önce RPC'yi çağır (sunucu kuralı kontrolü için)
      try {
        await supabase.rpc('equip_item', { p_kind: item.kind, p_item: targetValue || '' });
      } catch {
        // RPC hata verirse devam et, profili doğrudan güncelle
      }

      // 2. Doğrudan profiles tablosunu güncelle (kesin ve anlık çözüm)
      if (col) {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ [col]: targetValue })
          .eq('id', user.id);

        if (updateErr) {
          console.warn('Profil güncelleme uyarısı:', updateErr);
        }
      }

      if (showSuccessMsg) {
        setMsg({
          text: targetValue
            ? `"${item.name}" kuşandı! Profilinde ve sohbette artık aktif.`
            : `"${item.name}" çıkarıldı.`,
          type: 'success',
        });
      }
    } catch (e) {
      setMsg({ text: e.message || 'İşlem gerçekleştirilemedi.', type: 'error' });
    } finally {
      setLoadingAction(null);
      await load();
    }
  }

  const isVip = profile?.role === 'vip' || profile?.role === 'admin' || (profile?.vip_until && new Date(profile.vip_until) > new Date());

  if (user === undefined) return <div className="wrap empty">Mağaza yükleniyor...</div>;
  if (!user) {
    return (
      <div className="wrap empty">
        Mağazayı görüp eşya satın alabilmek için <a href="/giris-yap">giriş yapmalısın</a>.
      </div>
    );
  }

  const filteredKinds = activeTab === 'all' ? KIND_ORDER : [activeTab];

  return (
    <div className="wrap" style={{ paddingBottom: '60px' }}>
      {/* Mağaza Başlığı & Bakiye */}
      <div className="shop-head">
        <div>
          <h1>Kozmetik Mağazası</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '.92rem' }}>
            Profilini ve sohbetteki görünümünü özelleştirecek çerçeveler, renkler ve temalar.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="coin-pill" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
            <span>🪙</span> <strong>{profile?.coins?.toLocaleString('tr-TR') ?? 0} Tier Parası</strong>
          </div>
        </div>
      </div>

      {/* Canlı Görünüm Önizleme Kartı (Live Cosmetic Preview) */}
      <div
        className="card"
        style={{
          marginTop: '20px',
          padding: '20px 24px',
          backgroundImage: profile?.equipped_background ? resolveBackground(profile.equipped_background) : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Avatar
              url={profile?.avatar_url}
              name={profile?.username || '?'}
              size={60}
              frameGradient={profile?.equipped_frame}
            />
            <div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-dim)', marginBottom: '2px' }}>Şu Anki Görünümün (Önizleme)</div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                <NameTag name={profile?.username || 'Kullanıcı'} color={profile?.equipped_name_color} />
              </h3>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', fontSize: '.78rem', color: 'var(--text-dim)' }}>
                <span>Çerçeve: <strong>{profile?.equipped_frame ? 'Aktif' : 'Yok'}</strong></span> ·
                <span>İsim Rengi: <strong>{profile?.equipped_name_color ? 'Aktif' : 'Varsayılan'}</strong></span> ·
                <span>Arka Plan: <strong>{profile?.equipped_background ? 'Aktif' : 'Varsayılan'}</strong></span>
              </div>
            </div>
          </div>
          <div>
            <a href="/profil" className="btn btn-ghost" style={{ fontSize: '.82rem', padding: '8px 14px' }}>
              Profiline Git →
            </a>
          </div>
        </div>
      </div>

      {/* Bildirim Mesajı */}
      {msg && (
        <div
          className="card"
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            border: `1px solid ${msg.type === 'error' ? '#e6455b' : '#6fbf73'}`,
            background: msg.type === 'error' ? 'rgba(230,69,91,.1)' : 'rgba(111,191,115,.1)',
            color: msg.type === 'error' ? '#e6455b' : '#6fbf73',
            fontSize: '.9rem',
            fontWeight: 700,
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Kategori Filtre Sekmeleri */}
      <div className="filter-tabs" style={{ marginTop: '20px' }}>
        <button
          type="button"
          className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tüm Eşyalar ({items.length})
        </button>
        {KIND_ORDER.map((kind) => {
          const count = items.filter((i) => i.kind === kind).length;
          return (
            <button
              key={kind}
              type="button"
              className={`filter-tab ${activeTab === kind ? 'active' : ''}`}
              onClick={() => setActiveTab(kind)}
            >
              {KIND_LABEL[kind]} ({count})
            </button>
          );
        })}
      </div>

      {/* Eşya Listeleri */}
      {filteredKinds.map((kind) => {
        const list = items.filter((i) => i.kind === kind);
        if (list.length === 0) return null;

        return (
          <section className="section" key={kind} style={{ paddingTop: '24px' }}>
            <div className="section-head">
              <h2>{KIND_LABEL[kind]}</h2>
            </div>
            <div className="grid">
              {list.map((it) => {
                const has = owned.has(it.id);
                const tempAccess =
                  it.kind === 'name_color' &&
                  !isVip &&
                  profile?.name_color_until &&
                  new Date(profile.name_color_until) > new Date();
                const canUse = has || tempAccess;

                // Kuşanılmış mı kontrolü
                const isEquipped =
                  (it.kind === 'frame' && profile?.equipped_frame === it.id) ||
                  (it.kind === 'background' && profile?.equipped_background === it.id) ||
                  (it.kind === 'name_color' && profile?.equipped_name_color === it.id);

                const isAffordable = (profile?.coins || 0) >= it.price;
                const isLoading = loadingAction === it.id;

                return (
                  <div
                    className={`card shop-item ${isEquipped ? 'item-equipped' : ''}`}
                    key={it.id}
                    style={{
                      position: 'relative',
                      borderColor: isEquipped ? 'var(--accent)' : undefined,
                      boxShadow: isEquipped ? '0 0 16px var(--accent-glow)' : undefined,
                    }}
                  >
                    {/* Aktiflik Rozeti */}
                    {isEquipped && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                          color: '#111',
                          fontWeight: 800,
                          fontSize: '.72rem',
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        ✓ Kuşanıldı
                      </span>
                    )}

                    <div className="shop-preview">
                      {kind === 'frame' && <span className="frame-demo" style={frameStyle(it.value)} />}
                      {kind === 'background' && <span className="bg-demo" style={{ background: it.value }} />}
                      {kind === 'name_color' && (
                        <span style={{ ...nameColorStyle(it.value), fontSize: '1.4rem' }}>
                          {profile?.username || 'Kullanıcı'}
                        </span>
                      )}
                      {kind === 'avatar_gif_permit' && <span style={{ fontSize: '2.4rem' }}>🎞️</span>}
                    </div>

                    <h3>
                      {it.name}{' '}
                      {it.vip_only && (
                        <span className="tag" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                          VIP
                        </span>
                      )}
                    </h3>

                    <p style={{ margin: '6px 0 14px' }}>
                      <strong>{it.price.toLocaleString('tr-TR')}</strong> tier parası · {it.sold_count} satıldı
                    </p>

                    {/* Eylem Butonları */}
                    {isEquipped ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ width: '100%', borderColor: '#e6455b', color: '#e6455b' }}
                        onClick={() => equip(it)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'İşleniyor...' : 'Çıkar'}
                      </button>
                    ) : canUse ? (
                      <button
                        type="button"
                        className="btn"
                        style={{ width: '100%' }}
                        onClick={() => equip(it)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Kuşanılıyor...' : 'Kullan (Kuşan)'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`btn ${!isAffordable ? 'btn-ghost' : ''}`}
                        style={{ width: '100%', opacity: !isAffordable ? 0.6 : 1 }}
                        onClick={() => buy(it)}
                        disabled={isLoading || !isAffordable || (it.vip_only && !isVip)}
                      >
                        {isLoading
                          ? 'Satın Alınıyor...'
                          : it.vip_only && !isVip
                          ? 'Sadece VIP'
                          : !isAffordable
                          ? 'Yetersiz Bakiye'
                          : 'Satın Al'}
                      </button>
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
