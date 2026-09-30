import { supabase } from '../../lib/supabaseClient';

/**
 * Kullanıcının güncel bakiyesini user_metadata ve profiles senkronizasyonunu gözeterek döndürür.
 */
export function getEffectiveCoins(user, profile) {
  if (user?.user_metadata?.coins !== undefined) {
    return Number(user.user_metadata.coins);
  }
  return Number(profile?.coins || 0);
}

/**
 * Güvenli ve Kusursuz Bakiye Düşümü (RLS Güvenlikli & Metadata Fallback)
 * user parametresi hem nesne (user) hem de string (user.id) olarak gelebilir.
 */
export async function deductCoins(userOrId, amount, currentCoinsFallback = null) {
  if (!userOrId) return { success: false, error: 'Giriş yapılmalıdır.' };

  let userObj = typeof userOrId === 'object' ? userOrId : null;
  let userId = typeof userOrId === 'string' ? userOrId : userOrId?.id;

  if (!userObj) {
    try {
      const { data } = await supabase.auth.getUser();
      userObj = data?.user || null;
      if (!userId && userObj) userId = userObj.id;
    } catch {}
  }

  // Mevcut bakiye: user_metadata -> currentCoinsFallback -> profiles tablosu
  let currentCoins = 0;
  if (userObj?.user_metadata?.coins !== undefined) {
    currentCoins = Number(userObj.user_metadata.coins);
  } else if (currentCoinsFallback !== null && !isNaN(Number(currentCoinsFallback))) {
    currentCoins = Number(currentCoinsFallback);
  } else if (userId) {
    try {
      const { data: p } = await supabase.from('profiles').select('coins').eq('id', userId).maybeSingle();
      if (p?.coins !== undefined) currentCoins = Number(p.coins);
    } catch {}
  }

  if (currentCoins < amount) {
    return {
      success: false,
      error: `Yetersiz Bakiye! Bu işlem için ${amount.toLocaleString('tr-TR')} Tier Parasına ihtiyacınız var. Mevcut bakiyeniz: ${currentCoins.toLocaleString('tr-TR')}`,
      currentCoins,
    };
  }

  const newCoins = Math.max(0, currentCoins - amount);

  // 1. user_metadata'yı güncelle
  try {
    await supabase.auth.updateUser({
      data: {
        coins: newCoins,
      },
    });
  } catch (metaErr) {
    console.warn('Metadata coins update error:', metaErr);
  }

  // 2. profiles tablosunu güncelle
  if (userId) {
    try {
      await supabase.from('profiles').update({ coins: newCoins }).eq('id', userId);
    } catch (tableErr) {
      console.warn('Profiles table update bypassed:', tableErr?.message);
    }
  }

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

  let userObj = typeof userOrId === 'object' ? userOrId : null;
  let userId = typeof userOrId === 'string' ? userOrId : userOrId?.id;

  if (!userObj) {
    try {
      const { data } = await supabase.auth.getUser();
      userObj = data?.user || null;
      if (!userId && userObj) userId = userObj.id;
    } catch {}
  }

  let currentCoins = 0;
  if (userObj?.user_metadata?.coins !== undefined) {
    currentCoins = Number(userObj.user_metadata.coins);
  } else if (currentCoinsFallback !== null && !isNaN(Number(currentCoinsFallback))) {
    currentCoins = Number(currentCoinsFallback);
  } else if (userId) {
    try {
      const { data: p } = await supabase.from('profiles').select('coins').eq('id', userId).maybeSingle();
      if (p?.coins !== undefined) currentCoins = Number(p.coins);
    } catch {}
  }

  const newCoins = currentCoins + amount;

  // 1. Metadata güncelle
  try {
    await supabase.auth.updateUser({
      data: {
        coins: newCoins,
      },
    });
  } catch (err) {
    console.warn('Metadata add coins error:', err);
  }

  // 2. profiles tablosu
  if (userId) {
    try {
      await supabase.from('profiles').update({ coins: newCoins }).eq('id', userId);
    } catch (err) {
      console.warn('Profiles table add coins error:', err);
    }
  }

  // 3. Event fırlat
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('coins-updated', { detail: { coins: newCoins } }));
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: { coins: newCoins } }));
  }

  return {
    success: true,
    newCoins,
  };
}
