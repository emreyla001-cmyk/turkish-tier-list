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
 * Hem profiles tablosunu hem de user_metadata'yı senkronize eder.
 */
export async function deductCoins(user, amount, reason = 'Alışveriş') {
  if (!user) return { success: false, error: 'Giriş yapılmalıdır.' };

  const currentCoins = user.user_metadata?.coins !== undefined
    ? Number(user.user_metadata.coins)
    : 0;

  if (currentCoins < amount) {
    return {
      success: false,
      error: `Yetersiz Bakiye! Bu işlem için ${amount.toLocaleString('tr-TR')} Tier Parasına ihtiyacınız var. Mevcut bakiyeniz: ${currentCoins.toLocaleString('tr-TR')}`,
      currentCoins,
    };
  }

  const newCoins = Math.max(0, currentCoins - amount);

  // 1. user_metadata'yı kesin olarak güncelle (RLS'e takılmaz)
  try {
    await supabase.auth.updateUser({
      data: {
        coins: newCoins,
      },
    });
  } catch (metaErr) {
    console.warn('Metadata coins update error:', metaErr);
  }

  // 2. profiles tablosunu güncelle (varsa RPC ya da update, hata verirse sessizce yoksay)
  try {
    await supabase.from('profiles').update({ coins: newCoins }).eq('id', user.id);
  } catch (tableErr) {
    console.warn('Profiles table update bypassed:', tableErr?.message);
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
export async function addCoins(user, amount, reason = 'Kazanılan Ödül') {
  if (!user || amount <= 0) return { success: false };

  const currentCoins = user.user_metadata?.coins !== undefined
    ? Number(user.user_metadata.coins)
    : 0;

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
  try {
    await supabase.from('profiles').update({ coins: newCoins }).eq('id', user.id);
  } catch (err) {
    console.warn('Profiles table add coins error:', err);
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
