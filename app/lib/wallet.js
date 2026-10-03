import { supabase } from '../../lib/supabaseClient';
import { validateXpGain } from './gamificationUtils';

/**
 * Kullanıcının güncel bakiyesini user_metadata ve profiles senkronizasyonunu gözeterek döndürür.
 */
export function getEffectiveCoins(user, profile) {
  // Tek dogruluk kaynagi: public.profiles.coins (sunucu kontrolunde).
  // user_metadata.coins ARTIK OKUNMAZ. Supabase kullanicinin kendi
  // metadata'sini serbestce yazmasina izin verir; okunmasi hile vektoruydu.
  const profRaw = profile?.coins;
  if (profRaw === undefined || profRaw === null) return 0;
  const n = Number(profRaw);
  return isNaN(n) ? 0 : n;
}

/**
 * Güvenli ve Kusursuz Bakiye Düşümü (RLS Güvenlikli & Metadata Fallback)
 * user parametresi hem nesne (user) hem de string (user.id) olarak gelebilir.
 */
export async function deductCoins(userOrId, amount, currentCoinsFallback = null) {
  if (!userOrId) return { success: false, error: 'Giriş yapılmalıdır.' };

  // Harcama SUNUCUDA dogrulanir (public.spend_coins): atomik UPDATE,
  // yetersiz bakiye veritabaninda engellenir. Istemcideki bakiye
  // bilgisi guvenilmez oldugu icin karar buraya birakilir.
  const { data, error } = await supabase.rpc('spend_coins', {
    p_amount: Math.round(Number(amount)),
    p_reason: 'purchase',
  });

  if (error) {
    // 23514 = yetersiz bakiye (CHECK violation), fonksiyon icinden firlatildi.
    const yetersiz = error.code === '23514';
    const msg = yetersiz
      ? `Yetersiz Bakiye! Bu işlem için ${Number(amount).toLocaleString('tr-TR')} Tier Parasına ihtiyacınız var.`
      : error.message || 'Bakiye düşürülemedi.';
    return { success: false, error: msg, currentCoins: null };
  }

  const newCoins = Number(data);

  // 3. UI genelinde anlık bakiye yenilemesi fırlat
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('coins-updated', { detail: { coins: newCoins } }));
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: { coins: newCoins } }));
  }

  return {
    success: true,
    newCoins,
  };
}

/**
 * Güvenli Bakiye Ekleme (Ödüller, Görevler, İadeler)
 */
export async function addCoins(userOrId, amount, currentCoinsFallback = null) {
  if (!userOrId || amount <= 0) return { success: false };

  // Bakiye artik SUNUCUDA hesaplaniyor (public.reward_coins).
  // Istemci yalnizca miktar ve sebep gonderir; geri kalan bakiyeyi
  // veritabani dondurur. Boylece hatalar sessizce yutulmaz.
  const { data, error } = await supabase.rpc('reward_coins', {
    p_amount: Math.round(Number(amount)),
    p_reason: 'game_reward',
  });

  if (error) {
    console.error('addCoins basarisiz:', error);
    return { success: false, error: error.message || 'Odul verilemedi.' };
  }

  const newCoins = Number(data);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('coins-updated', { detail: { coins: newCoins } }));
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: { coins: newCoins } }));
  }

  return {
    success: true,
    newCoins,
  };
}

/**
 * Kullanıcının güncel seviye XP'sini user_metadata, profiles ve localStorage senkronizasyonuyla döndürür.
 * Hiçbir kazanılan XP kaybolmaz (en yüksek ve geçerli değer esas alınır).
 */
export function getEffectiveXP(user, profile) {
  const profileXp = profile?.xp !== undefined ? Number(profile.xp) : null;
  const localXp = typeof window !== 'undefined' && user?.id
    ? Number(localStorage.getItem(`user_xp_${user.id}`))
    : null;

  // user_metadata.xp ARTIK OKUNMUYOR (hile vektoru: kullanici metadata'yi
  // serbestce yazabiliyor). Tek dogruluk kaynagi: public.profiles.xp
  // localXp yalnizca sayfa yenileme arasi gecici gosterim icin tutulur.
  const validValues = [profileXp, localXp].filter((v) => v !== null && !isNaN(v) && v >= 0);
  if (validValues.length === 0) return 0;
  return Math.max(...validValues);
}

/**
 * Güvenli ve Kesintisiz Seviye XP Ekleme (user_metadata, localStorage, profiles ve global state)
 */
export async function addXP(userOrId, amount, currentXpFallback = null) {
  if (!userOrId || amount <= 0) return { success: false, newXp: 0 };

  let userObj = typeof userOrId === 'object' ? userOrId : null;
  let userId = typeof userOrId === 'string' ? userOrId : userOrId?.id;

  if (!userObj) {
    try {
      const { data } = await supabase.auth.getUser();
      userObj = data?.user || null;
      if (!userId && userObj) userId = userObj.id;
    } catch {}
  }

  let currentXp = getEffectiveXP(userObj, null);
  if (currentXpFallback !== null && !isNaN(Number(currentXpFallback))) {
    currentXp = Math.max(currentXp, Number(currentXpFallback));
  }

  const validation = validateXpGain(userId || 'anon', amount);
  if (!validation.allowed || validation.adjustedAmount <= 0) {
    console.warn('XP validation blocked or capped:', validation.reason);
    return { success: false, newXp: currentXp, reason: validation.reason };
  }

  const grantedAmount = validation.adjustedAmount;

  // XP artik SUNUCUDA hesaplaniyor (public.reward_xp): VIP carpani ve
  // toplam deger veritabaninda uygulanir, istemci tahmin etmez.
  const { data, error } = await supabase.rpc('reward_xp', {
    p_amount: Math.round(Number(grantedAmount)),
  });

  if (error) {
    console.error('addXP basarisiz:', error);
    return { success: false, newXp: currentXp, reason: error.message };
  }

  const newXp = Number(data);

  // Tarayici localStorage yedegi (sayfa yenileme arasi gecici gosterim)
  if (typeof window !== 'undefined' && userId) {
    localStorage.setItem(`user_xp_${userId}`, String(newXp));
  }

  // Global UI eventlerini atesle (Profil, HeaderNav, Gorevler aninda yenilenir)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('xp-updated', { detail: { xp: newXp } }));
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: { xp: newXp } }));
  }

  return {
    success: true,
    newXp,
  };
}
