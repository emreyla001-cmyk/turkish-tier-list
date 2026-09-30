'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { frameStyle, nameColorStyle, resolveBackground, resolveFrame, resolveNameColor } from '../components/cosmetics';
import { Avatar, NameTag } from '../components/UserBadge';
import { deductCoins, getEffectiveCoins, getEffectiveXP, addXP } from '../lib/wallet';
import { CoinIcon, CrownIcon, EnergyIcon, ShieldIcon, FireIcon } from '../components/CyberIcons';
import TierBadge from '../components/TierBadge';
import { GACHA_PACKS, drawCardsFromPack } from '../lib/gachaEngine';
import { cardAudio } from '../lib/cardAudio';
import { getCardRarity, getStarInfo } from '../lib/cardRarity';

const KIND_LABEL = {
  packs: '🃏 Tier Kart Paketleri (Gacha)',
  special_permit: '⚡ Özel Haklar (GIF & Arka Plan)',
  frame: '🖼️ Hareketli Avatar Çerçeveleri',
  name_color: '🎨 İsim Renkleri & Efektler',
  background: '🌄 Profil Arka Planları',
};
const KIND_ORDER = ['packs', 'special_permit', 'frame', 'name_color', 'background'];

// Genişletilmiş Mağaza Kataloğu (360° Dönen Hareketli Çerçeveler, Canlı Arkaplanlar, Hareketli İsimler)
const CATALOG_ITEMS = [
  // 1. Özel 30 Günlük Haklar (30.000 Altın)
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

  // 2. Çerçeveler (360° Dönen Hareketli & Klasik Çerçeveler)
  {
    id: 'frame_cyber_pulse',
    kind: 'frame',
    name: 'Siber Nabız (Cyber Pulse)',
    price: 7500,
    value: 'frame_cyber_pulse',
    description: 'Neon mavi ve mor lazer akışıyla 360° kesintisiz dönen ve parlayan hareketli siber çerçeve.',
    vip_only: false,
    is_animated: true,
    sort: 10,
  },
  {
    id: 'frame_dragon_fire',
    kind: 'frame',
    name: 'Ejderha Ateşi (Dragon Fire)',
    price: 8500,
    value: 'frame_dragon_fire',
    description: 'Alev kırmızısı ve akkor sarı plazma ışığıyla 360° dönen ve lav aurası yayan çerçeve.',
    vip_only: false,
    is_animated: true,
    sort: 11,
  },
  {
    id: 'frame_tengri_aura',
    kind: 'frame',
    name: 'Tengri Aurası',
    price: 9000,
    value: 'frame_tengri_aura',
    description: 'Eski Türk mitolojisinden ilahi altın ışıltısıyla dönen kutsal gök tanrısı halesi.',
    vip_only: false,
    is_animated: true,
    sort: 12,
  },
  {
    id: 'frame_thunder_storm',
    kind: 'frame',
    name: 'Fırtına Şimşeği (Thunder Storm)',
    price: 8000,
    value: 'frame_thunder_storm',
    description: 'Elektrik sarısı ve fırtına mavisi 360° hızla çakan yıldırımlarla dönen elektrik çerçevesi.',
    vip_only: false,
    is_animated: true,
    sort: 13,
  },
  {
    id: 'frame_void_abyss',
    kind: 'frame',
    name: 'Hiçlik Boşluğu (Void Abyss)',
    price: 7000,
    value: 'frame_void_abyss',
    description: 'Karanlık mor ve neon fuşya kozmik çekim aurasıyla dönen boyutsal yarık.',
    vip_only: false,
    is_animated: true,
    sort: 14,
  },
  {
    id: 'frame_frost_bite',
    kind: 'frame',
    name: 'Buzul Kristali (Frost Bite)',
    price: 6000,
    value: 'frame_frost_bite',
    description: 'Kutup mavisi donmuş buz kristalleri ve beyaz ayaz parıltısıyla dönen buzul çerçeve.',
    vip_only: false,
    is_animated: true,
    sort: 15,
  },
  {
    id: 'frame_blood_eclipse',
    kind: 'frame',
    name: 'Kanlı Tutulma (Blood Eclipse)',
    price: 9500,
    value: 'frame_blood_eclipse',
    description: 'Koyu bordo ve kan alevi gibi 360° dönen ve kırmızı aura yayan mistik tutulma.',
    vip_only: false,
    is_animated: true,
    sort: 16,
  },
  {
    id: 'frame_samurai_gold',
    kind: 'frame',
    name: 'Samuray Onuru & Altın Varak',
    price: 8500,
    value: 'frame_samurai_gold',
    description: 'Koyu kırmızı ve saf altın varak işlemeli savaşçı aurasıyla dönen asil çerçeve.',
    vip_only: false,
    is_animated: true,
    sort: 17,
  },
  {
    id: 'frame_hologram_prism',
    kind: 'frame',
    name: 'Sonsuzluk Prizması (Holo Prism)',
    price: 12000,
    value: 'frame_hologram_prism',
    description: 'Tüm renk tayfını 360° yansıtan ve parlayan 3D holografik prizma çerçeve.',
    vip_only: true,
    is_animated: true,
    sort: 18,
  },
  {
    id: 'frame_neon_matrix',
    kind: 'frame',
    name: 'Matrix Kod Akışı',
    price: 5000,
    value: 'frame_neon_matrix',
    description: 'Yeşil dijital veri ve siber kod akışıyla 360° dönen terminal çerçevesi.',
    vip_only: false,
    is_animated: true,
    sort: 19,
  },
  {
    id: 'frame_emerald_serpent',
    kind: 'frame',
    name: 'Zümrüt Ejder Pulu',
    price: 6500,
    value: 'frame_emerald_serpent',
    description: 'Pırlanta parlaklığında zümrüt yeşili ejder aurasıyla dönen mistik çerçeve.',
    vip_only: false,
    is_animated: true,
    sort: 20,
  },
  {
    id: 'frame_celestial_star',
    kind: 'frame',
    name: 'Kozmik Süpernova',
    price: 10000,
    value: 'frame_celestial_star',
    description: 'Yıldız patlaması beyazı ve derin mor süpernova aurasıyla dönen galaktik halka.',
    vip_only: false,
    is_animated: true,
    sort: 21,
  },
  {
    id: 'frame_phoenix_sun',
    kind: 'frame',
    name: 'Anka Güneşi (Phoenix Sun)',
    price: 9000,
    value: 'frame_phoenix_sun',
    description: 'Küllerinden doğan Anka kuşunun kızıl güneş ışınlarıyla 360° dönen alev çemberi.',
    vip_only: false,
    is_animated: true,
    sort: 22,
  },
  {
    id: 'frame_galaxy_rift',
    kind: 'frame',
    name: 'Galaksi Yarığı (Galaxy Rift)',
    price: 11000,
    value: 'frame_galaxy_rift',
    description: 'Sonsuz uzay boşluğunda pembe, mor ve mavi yıldız tozlarıyla parlayan dönen portal.',
    vip_only: false,
    is_animated: true,
    sort: 23,
  },
  {
    id: 'frame_dark_matter',
    kind: 'frame',
    name: 'Karanlık Madde (Dark Matter)',
    price: 8500,
    value: 'frame_dark_matter',
    description: 'Işığı yutan karanlık madde ve koyu fuşya yerçekimi dalgasıyla dönen kara delik.',
    vip_only: false,
    is_animated: true,
    sort: 24,
  },
  {
    id: 'frame_radioactive',
    kind: 'frame',
    name: 'Radyoaktif Plazma',
    price: 7000,
    value: 'frame_radioactive',
    description: 'Nükleer yeşil ve plazma sarısı reaktör enerjisiyle hızla dönen radyoaktif çerçeve.',
    vip_only: false,
    is_animated: true,
    sort: 25,
  },
  {
    id: 'frame_gold',
    kind: 'frame',
    name: 'Altın Çerçeve (Klasik)',
    price: 2000,
    value: 'frame_gold',
    description: 'Klasik parlak altın kaplama çerçeve.',
    vip_only: false,
    sort: 26,
  },
  {
    id: 'frame_sapphire',
    kind: 'frame',
    name: 'Safir Çerçeve (Klasik)',
    price: 2500,
    value: 'frame_sapphire',
    description: 'Derin okyanus mavisi safir çerçeve.',
    vip_only: false,
    sort: 27,
  },
  {
    id: 'frame_emerald',
    kind: 'frame',
    name: 'Zümrüt Çerçeve (Klasik)',
    price: 2500,
    value: 'frame_emerald',
    description: 'Zümrüt yeşili asil çerçeve.',
    vip_only: false,
    sort: 28,
  },
  {
    id: 'frame_ruby',
    kind: 'frame',
    name: 'Yakut Çerçeve (Klasik)',
    price: 2000,
    value: 'frame_ruby',
    description: 'Kırmızı yakut taşı kaplaması.',
    vip_only: false,
    sort: 29,
  },
  {
    id: 'frame_obsidian',
    kind: 'frame',
    name: 'Obsidyen Zırh (Klasik)',
    price: 4000,
    value: 'frame_obsidian',
    description: 'Karanlık mat çelik ve obsidyen zırh kaplama.',
    vip_only: false,
    sort: 30,
  },

  // 3. İsim Renkleri & Hareketli Efektler
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
  {
    id: 'nc_gold_shimmer',
    kind: 'name_color',
    name: 'Altın Varak Parıltısı (Hareketli)',
    price: 5000,
    value: 'nc_gold_shimmer',
    description: 'Saf 24 ayar altın parçacıkları gibi ışıldayan degrade.',
    vip_only: false,
    sort: 39,
  },
  {
    id: 'nc_blood_pulse',
    kind: 'name_color',
    name: 'Kan Kırmızısı Nabız (Hareketli)',
    price: 5500,
    value: 'nc_blood_pulse',
    description: 'Karanlık kan kırmızısı ritmik dalga.',
    vip_only: false,
    sort: 40,
  },
  {
    id: 'nc_ice_frost',
    kind: 'name_color',
    name: 'Buzul Ayazı (Hareketli)',
    price: 4500,
    value: 'nc_ice_frost',
    description: 'Donmuş buz kristalleri ve gök mavisi parıltı.',
    vip_only: false,
    sort: 41,
  },
  {
    id: 'nc_solar_flare',
    kind: 'name_color',
    name: 'Güneş Patlaması (Hareketli)',
    price: 6000,
    value: 'nc_solar_flare',
    description: 'Akkor sarı ve güneş turuncusu patlama efekti.',
    vip_only: false,
    sort: 42,
  },
  {
    id: 'nc_void_nebula',
    kind: 'name_color',
    name: 'Hiçlik Nebulası (Hareketli)',
    price: 7500,
    value: 'nc_void_nebula',
    description: 'Derin uzay moru ve yıldız tozu dalgalanması.',
    vip_only: false,
    sort: 43,
  },
  {
    id: 'nc_matrix_green',
    kind: 'name_color',
    name: 'Matrix Terminali (Hareketli)',
    price: 5000,
    value: 'nc_matrix_green',
    description: 'Yeşil siber veri terminali renk geçişi.',
    vip_only: false,
    sort: 44,
  },
  {
    id: 'nc_cherry_blossom',
    kind: 'name_color',
    name: 'Sakura Çiçeği (Hareketli)',
    price: 4000,
    value: 'nc_cherry_blossom',
    description: 'Japon bahar kiraz çiçeği pembe tonları.',
    vip_only: false,
    sort: 45,
  },

  // 4. Profil Arka Planları (Canlı & Sinematik Arka Planlar)
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
    value: 'bg_cyber_neon',
    description: 'Gece siberpunk şehri atmosferi ve neon degrade.',
    vip_only: false,
    sort: 54,
  },
  {
    id: 'bg_tengri_gold',
    kind: 'background',
    name: 'Tengri Altını',
    price: 6000,
    value: 'bg_tengri_gold',
    description: 'Karanlık ve altın karışımı asil bozkır tonları.',
    vip_only: false,
    sort: 55,
  },
  {
    id: 'bg_blood_moon',
    kind: 'background',
    name: 'Kanlı Ay Teması',
    price: 5500,
    value: 'bg_blood_moon',
    description: 'Koyu bordo ve kan kırmızısı mistik atmosfer.',
    vip_only: false,
    sort: 56,
  },
  {
    id: 'bg_matrix',
    kind: 'background',
    name: 'Matrix Kod Teması',
    price: 4000,
    value: 'bg_matrix',
    description: 'Siber dünyanın karanlık ve yeşil derinliği.',
    vip_only: false,
    sort: 57,
  },
  {
    id: 'bg_void',
    kind: 'background',
    name: 'Kozmik Hiçlik (Void)',
    price: 5000,
    value: 'bg_void',
    description: 'Karanlık yıldızlararası derin boşluk.',
    vip_only: false,
    sort: 58,
  },
  {
    id: 'bg_synthwave',
    kind: 'background',
    name: '80ler Synthwave Izgarası',
    price: 4000,
    value: 'bg_synthwave',
    description: 'Retro fütüristik mor ve neon pembe ızgara manzarası.',
    vip_only: false,
    sort: 59,
  },
  {
    id: 'bg_aurora_borealis',
    kind: 'background',
    name: 'Dans Eden Kuzey Işıkları',
    price: 5000,
    value: 'bg_aurora_borealis',
    description: 'Yeşil ve turkuaz kutup ışıkları dalgalanması.',
    vip_only: false,
    sort: 60,
  },
  {
    id: 'bg_magma_core',
    kind: 'background',
    name: 'Dünya Çekirdeği & Magma',
    price: 5500,
    value: 'bg_magma_core',
    description: 'Derin yeraltı lav kanalları ve kızgın volkanik taşlar.',
    vip_only: false,
    sort: 61,
  },
  {
    id: 'bg_galaxy_cluster',
    kind: 'background',
    name: 'Galaksi Kümesi & Süpernova',
    price: 7500,
    value: 'bg_galaxy_cluster',
    description: 'Milyonlarca yıldız ve süpernova ışıltısı barındıran derin uzay.',
    vip_only: false,
    sort: 62,
  },
  {
    id: 'bg_zen_bamboo',
    kind: 'background',
    name: 'Sisli Zen Bambu Bahçesi',
    price: 3500,
    value: 'bg_zen_bamboo',
    description: 'Dingin yeşil bambu ormanı ve tapınak sükuneti.',
    vip_only: false,
    sort: 63,
  },
  {
    id: 'bg_cyber_grid',
    kind: 'background',
    name: 'Tron Siber Izgara',
    price: 4500,
    value: 'bg_cyber_grid',
    description: 'Sonsuz mavi neon dijital zemin.',
    vip_only: false,
    sort: 64,
  },
  {
    id: 'bg_crimson_nebula',
    kind: 'background',
    name: 'Bordo Yıldız Beşiği',
    price: 6000,
    value: 'bg_crimson_nebula',
    description: 'Karanlık uzayda doğan bordo renkli yıldız nebulası.',
    vip_only: false,
    sort: 65,
  },
];

function isFutureDate(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() > Date.now();
}

function getRemainingTimeText(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Süresi Doldu';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} gün kaldı`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} saat ${mins} dk`;
}

export default function MagazaPage() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [items, setItems] = useState([]);
  const [owned, setOwned] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all');
  const [msg, setMsg] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  // Kart Paketi Açma Durumları
  const [openingPackId, setOpeningPackId] = useState(null);
  const [packResult, setPackResult] = useState(null);

  // Canlı Önizleme Geçici Durumu
  const [previewFrame, setPreviewFrame] = useState(null);
  const [previewBg, setPreviewBg] = useState(null);
  const [previewNameColor, setPreviewNameColor] = useState(null);

  async function load() {
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u || null);

      let dbItems = [];
      try {
        const { data: shop } = await supabase.from('shop_items').select('*').order('sort');
        dbItems = shop || [];
      } catch (err) {
        console.warn('DB shop_items okunamadı, katalog kullanılıyor:', err);
      }

      // Karakterleri de gacha motoru için getir
      const { data: chars } = await supabase
        .from('characters')
        .select('id, name, series, tier, category, power_score, speed_score, intelligence_score, durability_score, image_url')
        .eq('status', 'published');
      setCharacters(chars || []);

      const mergedMap = new Map();
      CATALOG_ITEMS.forEach((it) => mergedMap.set(it.id, it));
      dbItems.forEach((it) => {
        const existing = mergedMap.get(it.id);
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
            .select('id, username, avatar_url, coins, role, xp, vip_until, name_color_until, avatar_gif_until, equipped_frame, equipped_background, equipped_name_color, profile_bg_url')
            .eq('id', u.id)
            .maybeSingle(),
          supabase.from('user_inventory').select('item_id').eq('user_id', u.id),
        ]);

        const metaOwned = Array.isArray(u.user_metadata?.owned_items) ? u.user_metadata.owned_items : [];
        const localOwned = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(`user_owned_${u.id}`) || '[]') : [];
        const invSet = new Set([...(inv || []).map((r) => r.item_id), ...metaOwned, ...localOwned]);

        const localFrame = typeof window !== 'undefined' ? localStorage.getItem(`user_equipped_frame_${u.id}`) : null;
        const localBg = typeof window !== 'undefined' ? localStorage.getItem(`user_equipped_background_${u.id}`) : null;
        const localNameColor = typeof window !== 'undefined' ? localStorage.getItem(`user_equipped_name_color_${u.id}`) : null;

        const effectiveCoins = getEffectiveCoins(u, p);
        const effectiveXp = getEffectiveXP(u, p);
        const localBgUntil = typeof window !== 'undefined' ? localStorage.getItem(`user_profile_bg_until_${u.id}`) : null;
        const localGifUntil = typeof window !== 'undefined' ? localStorage.getItem(`user_avatar_gif_until_${u.id}`) : null;

        const prof = {
          ...(p || {}),
          id: u.id,
          username: p?.username || u.user_metadata?.username || u.email?.split('@')[0] || 'Kullanıcı',
          avatar_url: p?.avatar_url || u.user_metadata?.avatar_url || null,
          coins: effectiveCoins,
          xp: effectiveXp,
          role: p?.role || 'user',
          equipped_frame: p?.equipped_frame || u.user_metadata?.equipped_frame || localFrame || null,
          equipped_background: p?.equipped_background || u.user_metadata?.equipped_background || localBg || null,
          equipped_name_color: p?.equipped_name_color || u.user_metadata?.equipped_name_color || localNameColor || null,
          profile_bg_until: p?.profile_bg_until || u.user_metadata?.profile_bg_until || localBgUntil || null,
          avatar_gif_until: p?.avatar_gif_until || u.user_metadata?.avatar_gif_until || localGifUntil || null,
        };

        setProfile(prof);
        setOwned(invSet);
      }
    } catch (e) {
      console.error('Mağaza yüklenirken hata:', e);
    }
  }

  useEffect(() => {
    load();
    const handleSync = (e) => {
      if (e?.detail) {
        setProfile((prev) => {
          if (!prev) return prev;
          const next = { ...prev };
          if (e.detail.coins !== undefined) next.coins = e.detail.coins;
          if (e.detail.xp !== undefined) next.xp = e.detail.xp;
          if (e.detail.equipped_frame !== undefined) next.equipped_frame = e.detail.equipped_frame;
          if (e.detail.equipped_background !== undefined) next.equipped_background = e.detail.equipped_background;
          if (e.detail.equipped_name_color !== undefined) next.equipped_name_color = e.detail.equipped_name_color;
          if (e.detail.profile_bg_until !== undefined) next.profile_bg_until = e.detail.profile_bg_until;
          if (e.detail.avatar_gif_until !== undefined) next.avatar_gif_until = e.detail.avatar_gif_until;
          return next;
        });
      }
    };
    window.addEventListener('coins-updated', handleSync);
    window.addEventListener('xp-updated', handleSync);
    window.addEventListener('profile-updated', handleSync);
    window.addEventListener('cosmetics-updated', handleSync);
    return () => {
      window.removeEventListener('coins-updated', handleSync);
      window.removeEventListener('xp-updated', handleSync);
      window.removeEventListener('profile-updated', handleSync);
      window.removeEventListener('cosmetics-updated', handleSync);
    };
  }, []);

  const isVip = profile?.role === 'vip' || profile?.role === 'admin' || isFutureDate(profile?.vip_until);

  // 1. Kart Paketi Satın Alma & Açma (Gacha Engine)
  async function handleOpenPack(pack) {
    if (!user || !profile) {
      setMsg({ text: 'Paket açmak için giriş yapmalısın!', type: 'error' });
      return;
    }

    const currentCoins = profile.coins || 0;
    if (currentCoins < pack.price) {
      setMsg({ text: `Yetersiz bakiye! Bu paket için ${pack.price.toLocaleString('tr-TR')} Tier Parası gerekir.`, type: 'error' });
      return;
    }

    setOpeningPackId(pack.id);
    cardAudio.playWhoosh();
    try {
      const deductRes = await deductCoins(user, pack.price, currentCoins);
      if (!deductRes.success) {
        setMsg({ text: deductRes.error || 'Bakiye düşülemedi', type: 'error' });
        setOpeningPackId(null);
        return;
      }

      const metaCards = Array.isArray(user.user_metadata?.card_collection) ? user.user_metadata.card_collection : [];
      const metaUpgrades = (user.user_metadata?.card_upgrades && typeof user.user_metadata.card_upgrades === 'object')
        ? user.user_metadata.card_upgrades
        : {};
      const pityCount = Number(user.user_metadata?.gacha_pity) || 0;

      const result = drawCardsFromPack(pack, characters, pityCount, metaUpgrades, metaCards);

      const netCoins = deductRes.newCoins + result.cashback + result.refundTotal;
      const newCollection = Array.from(new Set([...metaCards, ...result.drawnCards.map((c) => c.id)]));
      const xpRes = await addXP(user, result.xpReward || 0, profile?.xp);
      const netXp = xpRes?.newXp || (Number(profile?.xp || 0) + (result.xpReward || 0));

      await supabase.auth.updateUser({
        data: {
          card_collection: newCollection,
          card_upgrades: result.updatedUpgrades,
          coins: netCoins,
          xp: netXp,
          gacha_pity: result.nextPity,
        },
      });

      try {
        await supabase.from('profiles').update({ coins: netCoins, xp: netXp }).eq('id', user.id);
      } catch {}

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coins-updated', { detail: { coins: netCoins } }));
        window.dispatchEvent(new CustomEvent('xp-updated', { detail: { xp: netXp } }));
      }

      setProfile((prev) => ({ ...prev, coins: netCoins, xp: netXp }));

      setTimeout(() => {
        setPackResult({ pack, ...result });
        setOpeningPackId(null);
        cardAudio.playPackOpening();
      }, 1000);
    } catch (err) {
      setMsg({ text: `Paket açılırken hata oluştu: ${err.message}`, type: 'error' });
      setOpeningPackId(null);
    }
  }

  // 2. Özel Hak Satın Alma (30 Günlük GIF Hakları)
  async function buySpecialPermit(item) {
    if (!user || !profile) return;
    setLoadingAction(item.id);
    setMsg(null);

    try {
      const currentCoins = profile.coins || 0;
      const deductRes = await deductCoins(user, item.price, currentCoins);
      if (!deductRes.success) {
        setMsg({ text: deductRes.error || 'Yetersiz bakiye!', type: 'error' });
        setLoadingAction(null);
        return;
      }

      const nowMs = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      if (item.id === 'avatar_gif_permit') {
        const curExp = isFutureDate(profile.avatar_gif_until)
          ? new Date(profile.avatar_gif_until).getTime()
          : nowMs;
        const newExpDate = new Date(curExp + thirtyDaysMs).toISOString();

        await supabase.auth.updateUser({ data: { avatar_gif_until: newExpDate } });
        try { await supabase.from('profiles').update({ avatar_gif_until: newExpDate }).eq('id', user.id); } catch {}
        if (typeof window !== 'undefined') {
          localStorage.setItem(`user_avatar_gif_until_${user.id}`, newExpDate);
          window.dispatchEvent(new CustomEvent('profile-updated', { detail: { avatar_gif_until: newExpDate, coins: deductRes.newCoins } }));
        }

        setProfile((prev) => ({ ...prev, avatar_gif_until: newExpDate, coins: deductRes.newCoins }));
        setMsg({
          text: `🎉 Tebrikler! 30 Günlük Hareketli GIF Avatar hakkı hesabına eklendi. (Kalan Süre: ${getRemainingTimeText(newExpDate)})`,
          type: 'success',
        });
      } else if (item.id === 'profile_bg_permit') {
        const curExp = isFutureDate(profile.profile_bg_until)
          ? new Date(profile.profile_bg_until).getTime()
          : nowMs;
        const newExpDate = new Date(curExp + thirtyDaysMs).toISOString();

        await supabase.auth.updateUser({ data: { profile_bg_until: newExpDate } });
        try { await supabase.from('profiles').update({ profile_bg_until: newExpDate }).eq('id', user.id); } catch {}
        if (typeof window !== 'undefined') {
          localStorage.setItem(`user_profile_bg_until_${user.id}`, newExpDate);
          window.dispatchEvent(new CustomEvent('profile-updated', { detail: { profile_bg_until: newExpDate, coins: deductRes.newCoins } }));
        }

        setProfile((prev) => ({ ...prev, profile_bg_until: newExpDate, coins: deductRes.newCoins }));
        setMsg({
          text: `🎉 Tebrikler! 30 Günlük Hareketli Profil Arka Planı hakkı hesabına eklendi. (Kalan Süre: ${getRemainingTimeText(newExpDate)})`,
          type: 'success',
        });
      }

      setProfile((prev) => ({ ...prev, coins: deductRes.newCoins }));
    } catch (err) {
      setMsg({ text: `Satın alma hatası: ${err.message || err}`, type: 'error' });
    } finally {
      setLoadingAction(null);
      await load();
    }
  }

  // 3. Standart Kozmetik Eşya Satın Alma
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

    try {
      const currentCoins = profile.coins || 0;
      const deductRes = await deductCoins(user, item.price, currentCoins);
      if (!deductRes.success) {
        setMsg({ text: deductRes.error || 'Yetersiz bakiye!', type: 'error' });
        setLoadingAction(null);
        return;
      }

      // Envanter tablosuna ekle
      try {
        await supabase.from('user_inventory').insert({ user_id: user.id, item_id: item.id });
      } catch {}

      // Metadata envanterine ekle
      const prevOwned = Array.isArray(user.user_metadata?.owned_items) ? user.user_metadata.owned_items : [];
      const updatedOwned = Array.from(new Set([...prevOwned, item.id]));
      await supabase.auth.updateUser({ data: { owned_items: updatedOwned } });

      // LocalStorage envanterine ekle
      if (typeof window !== 'undefined') {
        const localList = JSON.parse(localStorage.getItem(`user_owned_${user.id}`) || '[]');
        localStorage.setItem(`user_owned_${user.id}`, JSON.stringify(Array.from(new Set([...localList, item.id]))));
      }

      setOwned((prev) => new Set([...prev, item.id]));
      setProfile((prev) => ({ ...prev, coins: deductRes.newCoins }));
      setMsg({ text: `"${item.name}" başarıyla satın alındı ve otomatik kuşanıldı! 🎉`, type: 'success' });
      await equip(item, false, true);
    } catch (e) {
      setMsg({ text: e.message || 'Satın alma başarısız oldu.', type: 'error' });
    } finally {
      setLoadingAction(null);
      await load();
    }
  }

  // 4. Kuşan veya Çıkar
  async function equip(item, showSuccessMsg = true, forceEquip = false) {
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

    const isCurrentlyEquipped = (profile && profile[col] === item.id) || (user?.user_metadata?.[col] === item.id);
    const targetValue = forceEquip ? item.id : (isCurrentlyEquipped ? null : item.id);

    try {
      // 1. user_metadata'ya anında yaz
      await supabase.auth.updateUser({ data: { [col]: targetValue } });

      // 2. localStorage'a anında yaz
      if (typeof window !== 'undefined') {
        if (targetValue) {
          localStorage.setItem(`user_${col}_${user.id}`, targetValue);
        } else {
          localStorage.removeItem(`user_${col}_${user.id}`);
        }
      }

      // 3. profiles tablosuna da yaz
      try {
        await supabase.from('profiles').update({ [col]: targetValue }).eq('id', user.id);
      } catch (err) {
        console.warn('Profiles table update bypassed:', err);
      }

      // 4. RPC varsa dene
      try {
        await supabase.rpc('equip_item', { p_kind: item.kind, p_item: targetValue || '' });
      } catch {}

      // 5. State'i hemen güncelle
      setProfile((prev) => (prev ? { ...prev, [col]: targetValue } : prev));

      // 6. Global eventleri ateşle (HeaderNav ve tüm açık sekmeler anında güncellenir)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profile-updated', {
          detail: { [col]: targetValue, coins: profile?.coins }
        }));
        window.dispatchEvent(new CustomEvent('cosmetics-updated', {
          detail: { [col]: targetValue }
        }));
      }

      if (showSuccessMsg) {
        setMsg({
          text: targetValue
            ? `"${item.name}" kuşandı! Profilinde, sohbette ve sitede artık aktif. ✨`
            : `"${item.name}" çıkarıldı.`,
          type: 'success',
        });
      }
    } catch (e) {
      setMsg({ text: e.message || 'İşlem gerçekleştirilemedi.', type: 'error' });
    } finally {
      setLoadingAction(null);
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
  const displayAvatar = profile?.avatar_url;
  const isPreviewing = previewFrame !== null || previewBg !== null || previewNameColor !== null;

  const avatarGifRemaining = isVip ? 'Sınırsız (VIP)' : getRemainingTimeText(profile?.avatar_gif_until);
  const profileBgRemaining = isVip ? 'Sınırsız (VIP)' : getRemainingTimeText(profile?.profile_bg_until);

  return (
    <div className="wrap" style={{ paddingBottom: '70px' }}>
      {/* Mağaza Başlığı & Bakiye */}
      <div className="shop-head" style={{ marginTop: '20px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CrownIcon size={26} /> Kozmetik & Gacha Mağazası
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-dim)', fontSize: '.94rem' }}>
            Kart paketleri, 360° dönen hareketli çerçeveler, RGB isim efektleri ve sinematik arka planlar.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="coin-pill" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
            <CoinIcon size={22} /> <strong>{(profile?.coins || 0).toLocaleString('tr-TR')} Tier Parası</strong>
          </div>
        </div>
      </div>

      {/* Canlı Görünüm & Deneme Kabini (Live Cosmetic Preview) */}
      <div
        className="card"
        style={{
          marginTop: '22px',
          padding: '24px 28px',
          background: displayBg ? (resolveBackground(displayBg) || displayBg) : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: isPreviewing ? '2px solid var(--accent)' : '1px solid var(--border)',
          boxShadow: isPreviewing ? '0 0 24px rgba(0, 240, 255, 0.25)' : 'none',
          transition: 'all .3s ease',
        }}
      >
        {displayBg && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(8, 10, 18, 0.35) 0%, rgba(8, 10, 18, 0.8) 100%)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <Avatar
              url={displayAvatar}
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
          Tüm Vitrin ({items.length + GACHA_PACKS.length})
        </button>
        {KIND_ORDER.map((kind) => {
          const count = kind === 'packs' ? GACHA_PACKS.length : items.filter((i) => i.kind === kind).length;
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

      {/* KART PAKETLERİ (Gacha Bölümü) */}
      {(activeTab === 'all' || activeTab === 'packs') && (
        <section className="section" style={{ paddingTop: '28px' }}>
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🃏</span> Tier Kart Paketleri (Gacha Pazarı)
              </h2>
              <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '.88rem' }}>
                Güç seviyesi arttıkça çıkma oranı düşen gerçek gacha motoru! Her paket anında TP nakit iade ve XP kazandırır.
              </p>
            </div>
            <a href="/kart-oyunu" className="btn btn-ghost" style={{ fontSize: '.84rem' }}>
              Kart Arenası & Destem →
            </a>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px', marginTop: '16px' }}>
            {GACHA_PACKS.map((pack) => (
              <div
                key={pack.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '22px',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.5))',
                  border: openingPackId === pack.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '16px',
                  boxShadow: openingPackId === pack.id ? '0 0 25px rgba(0, 240, 255, 0.4)' : 'none',
                  transition: 'all .3s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <span className="tag" style={{ background: pack.badgeColor, color: '#000', fontWeight: 900, fontSize: '.75rem' }}>
                      {pack.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '3.2rem', marginBottom: '10px' }}>{pack.icon}</div>
                  <h3 style={{ fontSize: '1.15rem', margin: '0 0 6px', color: '#fff' }}>{pack.name}</h3>
                  <p style={{ fontSize: '.82rem', color: 'var(--text-dim)', minHeight: '44px', lineHeight: 1.4 }}>
                    {pack.desc}
                  </p>
                  <div style={{ fontSize: '.75rem', color: '#86efac', fontWeight: 700, margin: '6px 0 2px' }}>
                    🎁 +{pack.cashback.toLocaleString('tr-TR')} TP Nakit İade
                  </div>
                  <div style={{ fontSize: '.7rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '6px', margin: '8px 0' }}>
                    {pack.ratesText}
                  </div>
                  <div style={{ margin: '14px 0', fontSize: '1.25rem', fontWeight: 900, color: '#fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <CoinIcon size={20} /> {pack.price.toLocaleString('tr-TR')}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn"
                  style={{ width: '100%', fontWeight: 800, padding: '10px' }}
                  onClick={() => handleOpenPack(pack)}
                  disabled={openingPackId !== null}
                >
                  {openingPackId === pack.id ? 'Paket Yırtılıyor...' : `${pack.cardCount} Kart Aç`}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* KOZMETİK EŞYA LİSTELERİ */}
      {filteredKinds.filter((k) => k !== 'packs').map((kind) => {
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
                  (it.kind === 'name_color' && profile?.equipped_name_color === it.id) ||
                  (it.kind === 'avatar' && profile?.avatar_url === it.value);

                const isAffordable = (profile?.coins || 0) >= it.price;
                const isLoading = loadingAction === it.id;

                const specialActive =
                  (it.id === 'avatar_gif_permit' && (isVip || isFutureDate(profile?.avatar_gif_until))) ||
                  (it.id === 'profile_bg_permit' && (isVip || isFutureDate(profile?.profile_bg_until)));

                const specialRemaining =
                  it.id === 'avatar_gif_permit' ? avatarGifRemaining : profileBgRemaining;

                const isCurrentPreview =
                  (it.kind === 'frame' && previewFrame === it.id) ||
                  (it.kind === 'background' && previewBg === it.id) ||
                  (it.kind === 'name_color' && previewNameColor === it.id) ||
                  (it.kind === 'avatar' && previewAvatar === it.value);

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
                      <div className="shop-preview" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '74px' }}>
                        {it.kind === 'frame' && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                            <Avatar
                              size={56}
                              frameGradient={it.id}
                              url={profile?.avatar_url}
                              name={profile?.username || '?'}
                            />
                          </div>
                        )}
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
                      <h3 style={{ marginTop: '12px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {it.name}{' '}
                        {it.is_animated && (
                          <span className="tag" style={{ background: 'linear-gradient(135deg, #00f0ff, #7000ff)', color: '#fff', fontSize: '.68rem', fontWeight: 800, padding: '2px 6px' }}>
                            ✨ 360° HAREKETLİ
                          </span>
                        )}
                        {it.vip_only && (
                          <span className="tag" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                            VIP
                          </span>
                        )}
                      </h3>

                      <p style={{ margin: '6px 0 10px', fontSize: '.85rem', color: 'var(--text-dim)', minHeight: '36px' }}>
                        {it.description}
                      </p>

                      <p style={{ margin: '0 0 16px', fontSize: '.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CoinIcon size={15} /> <strong>{it.price.toLocaleString('tr-TR')}</strong> tier parası
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
                            ? '+30 Gün Daha Uzat (30.000 TP)'
                            : !isAffordable
                            ? 'Yetersiz Bakiye (30.000 TP)'
                            : '30 Gün Satın Al (30.000 TP)'}
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

      {/* PAKET AÇILIM MODALI (FUT Pack Opening Reveal) */}
      {packResult && (
        <div
          className="spotlight-overlay"
          style={{ zIndex: 100, alignItems: 'center' }}
          onClick={() => setPackResult(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '820px',
              width: '100%',
              padding: '30px',
              textAlign: 'center',
              background: '#0d111c',
              border: '2px solid var(--accent)',
              boxShadow: '0 0 50px rgba(0, 240, 255, 0.4)',
              borderRadius: '24px',
              animation: 'modalIn .25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {packResult.drawnCards.some((c) => {
              const r = getCardRarity(c.tier).code;
              return r === 'UR' || r === 'SSR';
            }) ? (
              <div style={{ marginBottom: '12px' }}>
                <span className="synergy-badge" style={{ fontSize: '.95rem', padding: '8px 20px', background: 'linear-gradient(135deg, #ff007f, #f59e0b)' }}>
                  🔥 EFSANEVİ KOZMİK WALKOUT! (SSR / UR DÜŞTÜ!) 🔥
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '3rem', marginBottom: '6px' }}>✨</div>
            )}
            <h2 style={{ fontSize: '1.8rem', color: 'var(--accent)', margin: '0 0 6px' }}>
              {packResult.pack.name} Açıldı!
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '20px', fontSize: '.88rem' }}>
              <span style={{ color: '#86efac', fontWeight: 800 }}>🪙 +{packResult.cashback.toLocaleString('tr-TR')} TP Nakit İade</span>
              {packResult.refundTotal > 0 && (
                <span style={{ color: '#fef08a', fontWeight: 800 }}>✨ +{packResult.refundTotal.toLocaleString('tr-TR')} TP Kopya Kart İadesi</span>
              )}
              <span style={{ color: '#a5b4fc', fontWeight: 800 }}>⚡ +{packResult.xpReward} XP</span>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              {packResult.drawnCards.map((c, idx) => {
                const rarity = getCardRarity(c.tier);
                const isHighTier = rarity.isHolo;
                const starInfo = getStarInfo(c.stars || 1, c.awakened || 0);
                return (
                  <div
                    key={`${c.id}-${idx}`}
                    className={`card ${isHighTier ? 'holo-foil-card' : ''}`}
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      background: 'var(--bg-2)',
                      border: isHighTier ? '2px solid var(--accent)' : '1px solid var(--border)',
                      borderRadius: '14px',
                      boxShadow: isHighTier ? '0 0 20px rgba(234, 179, 8, 0.4)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ background: rarity.badgeBg, color: '#fff', fontSize: '.68rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>
                        {rarity.code}
                      </span>
                      {c.isDuplicate ? (
                        c.refundGiven ? (
                          <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontSize: '.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                            🪙 +1.000 İade (MAX)
                          </span>
                        ) : (
                          <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fef08a', fontSize: '.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                            ✨ +1 Parça
                          </span>
                        )
                      ) : (
                        <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontSize: '.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                          🎉 YENİ!
                        </span>
                      )}
                    </div>

                    <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px', background: '#000' }}>
                      <img src={c.image_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <strong style={{ fontSize: '.9rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </strong>
                    <div style={{ margin: '4px 0' }}><TierBadge tier={c.tier} /></div>
                    <div style={{ fontSize: '.72rem', color: '#fef08a', marginBottom: '2px' }}>
                      {starInfo.starString}
                    </div>
                    <div style={{ fontSize: '.8rem', color: 'var(--accent)', fontWeight: 800 }}>
                      Güç: {Math.round((c.power_score || 50) * starInfo.multiplier)}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="btn"
              onClick={() => setPackResult(null)}
              style={{ padding: '10px 30px', fontWeight: 800 }}
            >
              ✓ Koleksiyona Ekle & Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
