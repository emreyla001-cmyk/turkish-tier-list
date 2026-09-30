'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { frameStyle, nameColorStyle, resolveBackground, resolveFrame, resolveNameColor } from '../components/cosmetics';
import { Avatar, NameTag } from '../components/UserBadge';

const KIND_LABEL = {
  special_permit: '⚡ Özel Haklar (GIF & Arka Plan)',
  frame: 'Avatar Çerçeveleri',
  name_color: 'İsim Renkleri',
  background: 'Profil Arka Planları',
};
const KIND_ORDER = ['special_permit', 'frame', 'name_color', 'background'];

// Mağaza Eşya Kataloğu (Yeni eklenenler ve 30 Günlük Özel Haklar)
const CATALOG_ITEMS = [
  // Özel 30 Günlük Haklar (30.000 Altın)
  {
    id: 'avatar_gif_permit',
    kind: 'special_permit',
    name: 'Hareketli GIF Avatar Hakkı (30 Gün)',
    price: 30000,
    value: 'permit_avatar',
    description: 'Profilinde hareketli GIF formatında avatar yükleyebilmeni ve sergileyebilmeni sağlar. 30 gün geçerlidir.',
    vip_only: false,
    duration_days: 30,
    sort: 1,
  },
  {
    id: 'profile_bg_permit',
    kind: 'special_permit',
    name: 'Hareketli Profil Arka Planı (30 Gün)',
    price: 30000,
    value: 'permit_bg',
    description: 'Profil sayfana özel hareketli GIF formatında arka plan yükleyebilmeni sağlar. 30 gün geçerlidir.',
    vip_only: false,
    duration_days: 30,
    sort: 2,
  },

  // Çerçeveler
  {
    id: 'frame_gold',
    kind: 'frame',
    name: 'Altın Çerçeve',
    price: 2000,
    value: 'linear-gradient(135deg,#f4d35e,#e6b325)',
    description: 'Klasik parlak altın kaplama çerçeve.',
    vip_only: false,
    sort: 10,
  },
  {
    id: 'frame_sapphire',
    kind: 'frame',
    name: 'Safir Çerçeve',
    price: 2500,
    value: 'linear-gradient(135deg,#5b8ce6,#1f3a8a)',
    description: 'Derin okyanus mavisi safir çerçeve.',
    vip_only: false,
    sort: 11,
  },
  {
    id: 'frame_emerald',
    kind: 'frame',
    name: 'Zümrüt Çerçeve',
    price: 2500,
    value: 'linear-gradient(135deg,#6fbf73,#1f6b3a)',
    description: 'Zümrüt yeşili asil çerçeve.',
    vip_only: false,
    sort: 12,
  },
  {
    id: 'frame_ruby',
    kind: 'frame',
    name: 'Yakut Çerçeve',
    price: 2000,
    value: 'linear-gradient(135deg,#e6455b,#8a1f2d)',
    description: 'Kırmızı yakut taşı kaplaması.',
    vip_only: false,
    sort: 13,
  },
  {
    id: 'frame_cosmic',
    kind: 'frame',
    name: 'Kozmik Çerçeve',
    price: 6000,
    value: 'linear-gradient(135deg,#9b59e6,#e6455b,#5b8ce6)',
    description: 'Galaktik enerji yayan çok renkli kozmik çerçeve.',
    vip_only: true,
    sort: 14,
  },
  {
    id: 'frame_cyber_pulse',
    kind: 'frame',
    name: 'Siber Nabız (Cyber Pulse)',
    price: 7500,
    value: 'frame_cyber_pulse',
    description: 'Neon mavi ve mor ışık akışıyla parlayan hareketli siber çerçeve.',
    vip_only: false,
    sort: 15,
  },
  {
    id: 'frame_dragon_fire',
    kind: 'frame',
    name: 'Ejderha Ateşi (Dragon Fire)',
    price: 8500,
    value: 'frame_dragon_fire',
    description: 'Alev kırmızısı ve lav sarısı hareketli plazma çerçeve.',
    vip_only: false,
    sort: 16,
  },
  {
    id: 'frame_obsidian',
    kind: 'frame',
    name: 'Obsidyen Zırh',
    price: 4000,
    value: 'frame_obsidian',
    description: 'Karanlık mat çelik ve obsidyen zırh kaplama.',
    vip_only: false,
    sort: 17,
  },
  {
    id: 'frame_tengri_aura',
    kind: 'frame',
    name: 'Tengri Aurası',
    price: 9000,
    value: 'frame_tengri_aura',
    description: 'Eski Türk mitolojisinden ilahi altın ışıltılı kutsal hale.',
    vip_only: false,
    sort: 18,
  },
  {
    id: 'frame_neon_matrix',
    kind: 'frame',
    name: 'Matrix Kod Akışı',
    price: 5000,
    value: 'frame_neon_matrix',
    description: 'Yeşil dijital veri ve siber kod çerçevesi.',
    vip_only: false,
    sort: 19,
  },

  // İsim Renkleri
  {
    id: 'nc_gold',
    kind: 'name_color',
    name: 'Altın İsim',
    price: 1000,
    value: '#e6b325',
    description: 'Sarı altın ışıltısı.',
    vip_only: false,
    sort: 30,
  },
  {
    id: 'nc_ruby',
    kind: 'name_color',
    name: 'Yakut İsim',
    price: 1000,
    value: '#e6455b',
    description: 'Canlı yakut kırmızısı.',
    vip_only: false,
    sort: 31,
  },
  {
    id: 'nc_azure',
    kind: 'name_color',
    name: 'Gök Mavisi İsim',
    price: 1000,
    value: '#5b8ce6',
    description: 'Gök mavisi tonu.',
    vip_only: false,
    sort: 32,
  },
  {
    id: 'nc_emerald',
    kind: 'name_color',
    name: 'Zümrüt İsim',
    price: 1000,
    value: '#6fbf73',
    description: 'Zümrüt yeşili tonu.',
    vip_only: false,
    sort: 33,
  },
  {
    id: 'nc_rainbow',
    kind: 'name_color',
    name: 'Gökkuşağı İsim (VIP)',
    price: 4000,
    value: 'linear-gradient(90deg,#e6455b,#e68a25,#e6c825,#6fbf73,#5b8ce6,#9b59e6)',
    description: 'Kayan gökkuşağı animasyonlu renk.',
    vip_only: true,
    sort: 34,
  },
  {
    id: 'nc_flame',
    kind: 'name_color',
    name: 'Alev Dalgası (Hareketli)',
    price: 4500,
    value: 'linear-gradient(90deg,#ff4500,#ff8c00,#ffd700,#ff4500)',
    description: 'Canlı akan ateş ve lav renk geçişi.',
    vip_only: false,
    sort: 35,
  },
  {
    id: 'nc_cyber_cyan',
    kind: 'name_color',
    name: 'Siber Camgöbeği (Hareketli)',
    price: 5000,
    value: 'linear-gradient(90deg,#00f0ff,#7000ff,#00f0ff)',
    description: 'Işıltılı elektrik ve neon siber akış.',
    vip_only: false,
    sort: 36,
  },
  {
    id: 'nc_plasma',
    kind: 'name_color',
    name: 'Plazma Moru (Hareketli)',
    price: 5000,
    value: 'linear-gradient(90deg,#d946ef,#8b5cf6,#ec4899,#d946ef)',
    description: 'Göz alıcı mor ve pembe kozmik enerji dalgası.',
    vip_only: false,
    sort: 37,
  },
  {
    id: 'nc_toxic',
    kind: 'name_color',
    name: 'Zehir Yeşili (Hareketli)',
    price: 4500,
    value: 'linear-gradient(90deg,#10b981,#84cc16,#22c55e,#10b981)',
    description: 'Toksik yeşil neon parıltı.',
    vip_only: false,
    sort: 38,
  },

  // Profil Arka Planları
  {
    id: 'bg_aurora',
    kind: 'background',
    name: 'Aurora Arka Planı',
    price: 1500,
    value: 'linear-gradient(135deg,#1b1f2a,#2a1f45,#12203a)',
    description: 'Kuzey ışıkları gecesi.',
    vip_only: false,
    sort: 50,
  },
  {
    id: 'bg_sunset',
    kind: 'background',
    name: 'Gün Batımı Arka Planı',
    price: 1500,
    value: 'linear-gradient(135deg,#3a1f2a,#6b2d1f,#2a1210)',
    description: 'Akşam kızıllığı tonları.',
    vip_only: false,
    sort: 51,
  },
  {
    id: 'bg_forest',
    kind: 'background',
    name: 'Orman Arka Planı',
    price: 1500,
    value: 'linear-gradient(135deg,#12251a,#1f3a2a,#0d1a12)',
    description: 'Gece ormanı sükuneti.',
    vip_only: false,
    sort: 52,
  },
  {
    id: 'bg_cosmic',
    kind: 'background',
    name: 'Kozmik Arka Plan (VIP)',
    price: 5000,
    value: 'linear-gradient(135deg,#1a0d2e,#3a1055,#0d0d2e)',
    description: 'Derin uzay ve nebula atmosferi.',
    vip_only: true,
    sort: 53,
  },
  {
    id: 'bg_cyber_neon',
    kind: 'background',
    name: 'Siber Şehir Neonu',
    price: 4500,
    value: 'linear-gradient(135deg,#0a0e1a,#1a103c,#002b36,#0a0e1a)',
    description: 'Gece siberpunk şehri atmosferi ve neon degrade.',
    vip_only: false,
    sort: 54,
  },
  {
    id: 'bg_tengri_gold',
    kind: 'background',
    name: 'Tengri Altını',
    price: 6000,
    value: 'linear-gradient(135deg,#1f1a0a,#3a2d0d,#5c4714,#1a1608)',
    description: 'Karanlık ve altın karışımı asil bozkır tonları.',
    vip_only: false,
    sort: 55,
  },
  {
    id: 'bg_blood_moon',
    kind: 'background',
    name: 'Kanlı Ay Teması',
    price: 5500,
    value: 'linear-gradient(135deg,#200508,#450a10,#681119,#150305)',
    description: 'Koyu bordo ve kan kırmızısı mistik atmosfer.',
    vip_only: false,
    sort: 56,
  },
  {
    id: 'bg_matrix',
    kind: 'background',
    name: 'Matrix Kod Teması',
    price: 4000,
    value: 'linear-gradient(135deg,#031408,#082810,#051e0c,#020d05)',
    description: 'Siber dünyanın karanlık ve yeşil derinliği.',
    vip_only: false,
    sort: 57,
  },
  {
    id: 'bg_void',
    kind: 'background',
    name: 'Kozmik Hiçlik (Void)',
    price: 5000,
    value: 'linear-gradient(135deg,#050508,#0c0818,#160b2b,#050508)',
    description: 'Karanlık yıldızlararası derin boşluk.',
    vip_only: false,
    sort: 58,
  },
];

function isFutureDate(dateVal) {
  if (!dateVal) return false;
  try {
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) && d.getTime() > Date.now();
  } catch {
    return false;
  }
}

function getRemainingTimeText(untilDate) {
  if (!untilDate) return null;
  const target = new Date(untilDate).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return 'Süresi Doldu';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days} gün ${hours} saat`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} saat ${mins} dk`;
}

export default function MagazaPage() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [owned, setOwned] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all');
  const [msg, setMsg] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  // Canlı Önizleme Geçici Durumu
  const [previewFrame, setPreviewFrame] = useState(null);
  const [previewBg, setPreviewBg] = useState(null);
  const [previewNameColor, setPreviewNameColor] = useState(null);

  async function load() {
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u || null);

      // Veritabanındaki eşyaları ve statik kataloğu birleştir
      let dbItems = [];
      try {
        const { data: shop } = await supabase.from('shop_items').select('*').order('sort');
        dbItems = shop || [];
      } catch (err) {
        console.warn('DB shop_items okunamadı, katalog kullanılıyor:', err);
      }

      // Catalog listesini DB listesiyle harmanla (id bazında tekilleştir)
      const mergedMap = new Map();
      CATALOG_ITEMS.forEach((it) => mergedMap.set(it.id, it));
      dbItems.forEach((it) => {
        const existing = mergedMap.get(it.id);
        // avatar_gif_permit için 30.000 altınlık 30 günlük kuralını koru
        if (it.id === 'avatar_gif_permit') {
          mergedMap.set(it.id, {
            ...existing,
            ...it,
            name: 'Hareketli GIF Avatar Hakkı (30 Gün)',
            price: 30000,
            kind: 'special_permit',
            vip_only: false,
          });
        } else {
          mergedMap.set(it.id, { ...existing, ...it });
        }
      });

      const mergedList = Array.from(mergedMap.values()).sort((a, b) => (a.sort || 99) - (b.sort || 99));
      setItems(mergedList);

      if (u) {
        const [{ data: p }, { data: inv }] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, username, avatar_url, coins, role, vip_until, name_color_until, avatar_gif_until, equipped_frame, equipped_background, equipped_name_color, profile_bg_url')
            .eq('id', u.id)
            .maybeSingle(),
          supabase.from('user_inventory').select('item_id').eq('user_id', u.id),
        ]);

        const metaOwned = Array.isArray(u.user_metadata?.owned_items) ? u.user_metadata.owned_items : [];
        const invSet = new Set([...(inv || []).map((r) => r.item_id), ...metaOwned]);

        const prof = p || {
          id: u.id,
          username: u.user_metadata?.username || u.email?.split('@')[0] || 'Kullanıcı',
          avatar_url: u.user_metadata?.avatar_url || null,
          coins: 0,
          role: 'user',
        };

        // User metadata'daki profile_bg_until ve avatar_gif_until değerlerini de yedekle
        if (u.user_metadata?.profile_bg_until) {
          prof.profile_bg_until = u.user_metadata.profile_bg_until;
        }
        if (u.user_metadata?.avatar_gif_until && !prof.avatar_gif_until) {
          prof.avatar_gif_until = u.user_metadata.avatar_gif_until;
        }

        setProfile(prof);
        setOwned(invSet);
      }
    } catch (err) {
      console.error('Mağaza yükleme hatası:', err);
    }
  }

  useEffect(() => { load(); }, []);

  const isVip =
    profile?.role === 'vip' ||
    profile?.role === 'admin' ||
    profile?.role === 'moderator' ||
    isFutureDate(profile?.vip_until);

  // 30 Günlük Özel Hak Satın Alma (Hareketli Avatar veya Arka Plan)
  async function buySpecialPermit(item) {
    if (!user || !profile) return;
    setLoadingAction(item.id);
    setMsg(null);

    if (isVip) {
      setMsg({
        text: '👑 VIP üye olduğun için hareketli avatar ve hareketli arka plan hakları hesabında süresiz ve ücretsiz olarak aktiftir!',
        type: 'success',
      });
      setLoadingAction(null);
      return;
    }

    if ((profile.coins || 0) < item.price) {
      setMsg({
        text: `Yetersiz bakiye! Bu hak için ${item.price.toLocaleString('tr-TR')} altına ihtiyacın var. Mevcut bakiyen: ${(profile.coins || 0).toLocaleString('tr-TR')}`,
        type: 'error',
      });
      setLoadingAction(null);
      return;
    }

    try {
      const nowMs = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const newCoins = (profile.coins || 0) - item.price;

      if (item.id === 'avatar_gif_permit') {
        const curExp = isFutureDate(profile.avatar_gif_until)
          ? new Date(profile.avatar_gif_until).getTime()
          : nowMs;
        const newExpDate = new Date(curExp + thirtyDaysMs).toISOString();

        // 1. profiles tablosu
        await supabase.from('profiles').update({ coins: newCoins, avatar_gif_until: newExpDate }).eq('id', user.id);
        // 2. auth metadata
        await supabase.auth.updateUser({ data: { avatar_gif_until: newExpDate } });

        setMsg({
          text: `🎉 Tebrikler! 30 Günlük Hareketli GIF Avatar hakkı hesabına eklendi. (Kalan Süre: ${getRemainingTimeText(newExpDate)})`,
          type: 'success',
        });
      } else if (item.id === 'profile_bg_permit') {
        const curExp = isFutureDate(profile.profile_bg_until)
          ? new Date(profile.profile_bg_until).getTime()
          : nowMs;
        const newExpDate = new Date(curExp + thirtyDaysMs).toISOString();

        // 1. profiles tablosu (hata verirse yoksay)
        try {
          await supabase.from('profiles').update({ coins: newCoins, profile_bg_until: newExpDate }).eq('id', user.id);
        } catch {
          await supabase.from('profiles').update({ coins: newCoins }).eq('id', user.id);
        }
        // 2. auth metadata
        await supabase.auth.updateUser({ data: { profile_bg_until: newExpDate } });

        setMsg({
          text: `🎉 Tebrikler! 30 Günlük Hareketli Profil Arka Planı hakkı hesabına eklendi. (Kalan Süre: ${getRemainingTimeText(newExpDate)})`,
          type: 'success',
        });
      }
    } catch (err) {
      setMsg({ text: `Satın alma hatası: ${err.message || err}`, type: 'error' });
    } finally {
      setLoadingAction(null);
      await load();
    }
  }

  // Standart Kozmetik Eşya Satın Alma
  async function buy(item) {
    if (!user || !profile) return;
    if (item.kind === 'special_permit') {
      return buySpecialPermit(item);
    }

    setLoadingAction(item.id);
    setMsg(null);

    if (item.vip_only && !isVip) {
      setMsg({ text: 'Bu eşya yalnızca VIP üyelere özeldir.', type: 'error' });
      setLoadingAction(null);
      return;
    }

    if ((profile.coins || 0) < item.price) {
      setMsg({ text: 'Yetersiz bakiye.', type: 'error' });
      setLoadingAction(null);
      return;
    }

    try {
      let rpcSucceeded = false;
      // 1. Önce veritabanı RPC fonksiyonunu dene
      try {
        const { error: rpcErr } = await supabase.rpc('buy_item', { item: item.id });
        if (!rpcErr) rpcSucceeded = true;
      } catch {}

      // 2. RPC başaramadıysa doğrudan bakiye ve envanter güncelle
      if (!rpcSucceeded) {
        const newCoins = (profile.coins || 0) - item.price;
        await supabase.from('profiles').update({ coins: newCoins }).eq('id', user.id);

        try {
          await supabase.from('user_inventory').insert({ user_id: user.id, item_id: item.id });
        } catch {}

        const prevOwned = Array.isArray(user.user_metadata?.owned_items) ? user.user_metadata.owned_items : [];
        if (!prevOwned.includes(item.id)) {
          await supabase.auth.updateUser({ data: { owned_items: [...prevOwned, item.id] } });
        }
      }

      setMsg({ text: `"${item.name}" başarıyla satın alındı ve envanterine eklendi!`, type: 'success' });
      // Otomatik kuşan
      await equip(item, false);
    } catch (e) {
      setMsg({ text: e.message || 'Satın alma başarısız oldu.', type: 'error' });
    } finally {
      setLoadingAction(null);
      await load();
    }
  }

  // Kuşan veya Çıkar
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
    if (!col) {
      setLoadingAction(null);
      return;
    }

    const isCurrentlyEquipped = profile && profile[col] === item.id;
    const targetValue = isCurrentlyEquipped ? null : item.id;

    try {
      try {
        await supabase.rpc('equip_item', { p_kind: item.kind, p_item: targetValue || '' });
      } catch {}

      await supabase.from('profiles').update({ [col]: targetValue }).eq('id', user.id);

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

  // Önizleme ayarla / sıfırla
  function handlePreview(item) {
    if (item.kind === 'frame') {
      setPreviewFrame(previewFrame === item.id ? null : item.id);
    } else if (item.kind === 'background') {
      setPreviewBg(previewBg === item.id ? null : item.id);
    } else if (item.kind === 'name_color') {
      setPreviewNameColor(previewNameColor === item.id ? null : item.id);
    }
  }

  function resetPreview() {
    setPreviewFrame(null);
    setPreviewBg(null);
    setPreviewNameColor(null);
  }

  if (user === undefined) return <div className="wrap empty">Mağaza yükleniyor...</div>;
  if (!user) {
    return (
      <div className="wrap empty">
        Mağazayı görüp eşya satın alabilmek için <a href="/giris-yap">giriş yapmalısın</a>.
      </div>
    );
  }

  const filteredKinds = activeTab === 'all' ? KIND_ORDER : [activeTab];

  // Aktif veya Önizlemedeki Görünüm
  const displayFrame = previewFrame || profile?.equipped_frame;
  const displayBg = previewBg || profile?.equipped_background;
  const displayNameColor = previewNameColor || profile?.equipped_name_color;
  const isPreviewing = previewFrame !== null || previewBg !== null || previewNameColor !== null;

  const avatarGifRemaining = isVip ? 'Sınırsız (VIP)' : getRemainingTimeText(profile?.avatar_gif_until);
  const profileBgRemaining = isVip ? 'Sınırsız (VIP)' : getRemainingTimeText(profile?.profile_bg_until);

  return (
    <div className="wrap" style={{ paddingBottom: '70px' }}>
      {/* Mağaza Başlığı & Bakiye */}
      <div className="shop-head" style={{ marginTop: '20px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🛍️</span> Kozmetik & Ayrıcalık Mağazası
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-dim)', fontSize: '.94rem' }}>
            Profilini ve sohbetteki duruşunu özelleştirecek hareketli çerçeveler, parlayan renkler ve özel GIF izinleri.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="coin-pill" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
            <span>🪙</span> <strong>{(profile?.coins || 0).toLocaleString('tr-TR')} Tier Parası</strong>
          </div>
        </div>
      </div>

      {/* Canlı Görünüm & Deneme Kabini (Live Cosmetic Preview) */}
      <div
        className="card"
        style={{
          marginTop: '22px',
          padding: '24px 28px',
          backgroundImage: displayBg ? resolveBackground(displayBg) : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: isPreviewing ? '2px solid var(--accent)' : '1px solid var(--border)',
          boxShadow: isPreviewing ? '0 0 24px rgba(0, 240, 255, 0.2)' : 'none',
          transition: 'all .3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <Avatar
              url={profile?.avatar_url}
              name={profile?.username || '?'}
              size={64}
              frameGradient={displayFrame}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '.8rem', color: isPreviewing ? 'var(--accent)' : 'var(--text-dim)', fontWeight: 700 }}>
                  {isPreviewing ? '🧪 Canlı Deneme Önizlemesi' : '👤 Şu Anki Görünümün'}
                </span>
                {isPreviewing && (
                  <span className="tag" style={{ background: 'var(--accent)', color: '#111', fontSize: '.7rem', fontWeight: 800 }}>
                    ÖNİZLEME MODU
                  </span>
                )}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.35rem' }}>
                <NameTag name={profile?.username || 'Kullanıcı'} color={displayNameColor} />
              </h3>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', fontSize: '.8rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                <span>Çerçeve: <strong>{displayFrame ? 'Seçili' : 'Yok'}</strong></span> ·
                <span>İsim Rengi: <strong>{displayNameColor ? 'Seçili' : 'Varsayılan'}</strong></span> ·
                <span>Arka Plan: <strong>{displayBg ? 'Seçili' : 'Varsayılan'}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isPreviewing && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={resetPreview}
                style={{ fontSize: '.82rem', padding: '8px 14px', borderColor: '#e6455b', color: '#e6455b' }}
              >
                ✕ Önizlemeyi Sıfırla
              </button>
            )}
            <a href="/profil" className="btn btn-ghost" style={{ fontSize: '.82rem', padding: '8px 14px' }}>
              Profilime Git →
            </a>
          </div>
        </div>
      </div>

      {/* Özel Haklar Durum Kartı (30 Günlük GIF Hakları ve VIP Durumu) */}
      <div
        className="card"
        style={{
          marginTop: '16px',
          padding: '16px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '.88rem' }}>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>🎞️ GIF Avatar Durumu: </span>
            <strong style={{ color: avatarGifRemaining && avatarGifRemaining !== 'Süresi Doldu' ? '#6fbf73' : '#e68a25' }}>
              {avatarGifRemaining ? `Aktif (${avatarGifRemaining})` : 'Kilitli'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>🖼️ GIF Arka Plan Durumu: </span>
            <strong style={{ color: profileBgRemaining && profileBgRemaining !== 'Süresi Doldu' ? '#6fbf73' : '#e68a25' }}>
              {profileBgRemaining ? `Aktif (${profileBgRemaining})` : 'Kilitli'}
            </strong>
          </div>
        </div>
        {isVip && (
          <span className="tag" style={{ background: 'linear-gradient(135deg,#f4d35e,#e6b325)', color: '#111', fontWeight: 800 }}>
            👑 VIP: Sınırsız Hak Tanımlı
          </span>
        )}
      </div>

      {/* Bildirim Mesajı */}
      {msg && (
        <div
          className="card"
          style={{
            marginTop: '16px',
            padding: '14px 18px',
            border: `1px solid ${msg.type === 'error' ? '#e6455b' : '#6fbf73'}`,
            background: msg.type === 'error' ? 'rgba(230,69,91,.1)' : 'rgba(111,191,115,.1)',
            color: msg.type === 'error' ? '#e6455b' : '#6fbf73',
            fontSize: '.92rem',
            fontWeight: 700,
            borderRadius: '10px',
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Kategori Filtre Sekmeleri */}
      <div className="filter-tabs" style={{ marginTop: '24px' }}>
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
          <section className="section" key={kind} style={{ paddingTop: '28px' }}>
            <div className="section-head">
              <h2>{KIND_LABEL[kind]}</h2>
            </div>
            <div className="grid">
              {list.map((it) => {
                const isSpecial = it.kind === 'special_permit';
                const has = owned.has(it.id);
                const isEquipped =
                  (it.kind === 'frame' && profile?.equipped_frame === it.id) ||
                  (it.kind === 'background' && profile?.equipped_background === it.id) ||
                  (it.kind === 'name_color' && profile?.equipped_name_color === it.id);

                const isAffordable = (profile?.coins || 0) >= it.price;
                const isLoading = loadingAction === it.id;

                // Özel Hak Kontrolü
                let specialActive = false;
                let specialRemaining = null;
                if (it.id === 'avatar_gif_permit') {
                  specialActive = isVip || isFutureDate(profile?.avatar_gif_until);
                  specialRemaining = avatarGifRemaining;
                } else if (it.id === 'profile_bg_permit') {
                  specialActive = isVip || isFutureDate(profile?.profile_bg_until);
                  specialRemaining = profileBgRemaining;
                }

                // Önizlemede mi kontrolü
                const isCurrentPreview =
                  (it.kind === 'frame' && previewFrame === it.id) ||
                  (it.kind === 'background' && previewBg === it.id) ||
                  (it.kind === 'name_color' && previewNameColor === it.id);

                return (
                  <div
                    className={`card shop-item ${isEquipped ? 'item-equipped' : ''}`}
                    key={it.id}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderColor: isEquipped ? 'var(--accent)' : isCurrentPreview ? 'var(--accent-2)' : undefined,
                      boxShadow: isEquipped ? '0 0 16px var(--accent-glow)' : undefined,
                    }}
                  >
                    {/* Aktiflik / Kuşanma Rozetleri */}
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
                          zIndex: 2,
                        }}
                      >
                        ✓ Kuşanıldı
                      </span>
                    )}

                    {specialActive && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'linear-gradient(135deg, #6fbf73, #1f6b3a)',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '.72rem',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          zIndex: 2,
                        }}
                      >
                        ⚡ Aktif ({specialRemaining})
                      </span>
                    )}

                    <div>
                      {/* Önizleme Alanı */}
                      <div className="shop-preview" style={{ position: 'relative' }}>
                        {it.kind === 'frame' && <span className="frame-demo" style={frameStyle(it.value)} />}
                        {it.kind === 'background' && (
                          <span
                            className="bg-demo"
                            style={{ background: resolveBackground(it.value) || it.value }}
                          />
                        )}
                        {it.kind === 'name_color' && (
                          <span style={{ ...nameColorStyle(it.value), fontSize: '1.4rem' }}>
                            {profile?.username || 'Kullanıcı'}
                          </span>
                        )}
                        {it.kind === 'special_permit' && (
                          <span style={{ fontSize: '2.8rem' }}>
                            {it.id === 'avatar_gif_permit' ? '🎞️' : '🖼️'}
                          </span>
                        )}
                      </div>

                      {/* Başlık ve Bilgiler */}
                      <h3 style={{ marginTop: '12px', fontSize: '1.1rem' }}>
                        {it.name}{' '}
                        {it.vip_only && (
                          <span className="tag" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                            VIP
                          </span>
                        )}
                      </h3>

                      <p style={{ margin: '6px 0 10px', fontSize: '.85rem', color: 'var(--text-dim)', minHeight: '36px' }}>
                        {it.description}
                      </p>

                      <p style={{ margin: '0 0 16px', fontSize: '.95rem' }}>
                        <strong>{it.price.toLocaleString('tr-TR')}</strong> tier parası
                        {it.duration_days ? ` · ${it.duration_days} Günlük` : ''}
                      </p>
                    </div>

                    {/* Aksiyon Butonları */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Canlı Dene Butonu (Kozmetikler İçin) */}
                      {!isSpecial && (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{
                            width: '100%',
                            fontSize: '.8rem',
                            padding: '6px',
                            borderColor: isCurrentPreview ? 'var(--accent)' : 'var(--border)',
                            color: isCurrentPreview ? 'var(--accent)' : 'inherit',
                          }}
                          onClick={() => handlePreview(it)}
                        >
                          {isCurrentPreview ? '✕ Önizlemeyi Bırak' : '👁️ Üzerinde Dene'}
                        </button>
                      )}

                      {/* Satın Alma / Kuşanma Butonları */}
                      {isSpecial ? (
                        <button
                          type="button"
                          className={`btn ${!isAffordable && !isVip ? 'btn-ghost' : ''}`}
                          style={{ width: '100%' }}
                          onClick={() => buy(it)}
                          disabled={isLoading || (!isAffordable && !isVip)}
                        >
                          {isLoading
                            ? 'İşleniyor...'
                            : isVip
                            ? '👑 VIP ile Sınırsız Aktif'
                            : specialActive
                            ? '+30 Gün Daha Uzat (30.000 🪙)'
                            : !isAffordable
                            ? 'Yetersiz Bakiye (30.000 🪙)'
                            : '30 Gün Satın Al (30.000 🪙)'}
                        </button>
                      ) : isEquipped ? (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ width: '100%', borderColor: '#e6455b', color: '#e6455b' }}
                          onClick={() => equip(it)}
                          disabled={isLoading}
                        >
                          {isLoading ? 'İşleniyor...' : 'Çıkar'}
                        </button>
                      ) : has ? (
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
