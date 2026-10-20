import { supabase } from '../../lib/supabaseClient';

export const MAX_STAMINA = 10;
export const REFILL_RATE_MS = 60 * 60 * 1000; // 1 saatte 1 enerji
export const POTION_COST = 300; // 300 Tier Parası = +5 Enerji
export const POTION_REFILL = 5;

/**
 * Kullanıcının mevcut enerjisini zaman aşımına göre hesaplar ve döndürür.
 */
export function getStamina(user) {
  if (!user) {
    return {
      current: MAX_STAMINA,
      max: MAX_STAMINA,
      nextRefillMs: 0,
    };
  }

  const data = user.user_metadata?.stamina_data;
  const now = Date.now();

  if (!data || typeof data.current !== 'number') {
    return {
      current: MAX_STAMINA,
      max: MAX_STAMINA,
      nextRefillMs: 0,
    };
  }

  let current = data.current;
  const lastRefill = data.lastRefill || now;

  if (current < MAX_STAMINA) {
    const elapsed = now - lastRefill;
    const recovered = Math.floor(elapsed / REFILL_RATE_MS);
    if (recovered > 0) {
      current = Math.min(MAX_STAMINA, current + recovered);
    }
    const remainder = elapsed % REFILL_RATE_MS;
    const nextRefillMs = current < MAX_STAMINA ? REFILL_RATE_MS - remainder : 0;
    return {
      current,
      max: MAX_STAMINA,
      nextRefillMs,
    };
  }

  return {
    current: MAX_STAMINA,
    max: MAX_STAMINA,
    nextRefillMs: 0,
  };
}

/**
 * Kullanıcı maç yaparken veya mini oyun oynarken enerji tüketir.
 */
export async function consumeStamina(user, amount = 1) {
  if (!user) return { success: true, current: MAX_STAMINA };

  const currentStatus = getStamina(user);
  if (currentStatus.current < amount) {
    return {
      success: false,
      current: currentStatus.current,
      error: 'Yetersiz Enerji! Saat başı 1 enerji yenilenir veya Enerji İksiri alabilirsin.',
    };
  }

  const newCurrent = Math.max(0, currentStatus.current - amount);
  const now = Date.now();

  const newData = {
    current: newCurrent,
    lastRefill: currentStatus.current === MAX_STAMINA ? now : (user.user_metadata?.stamina_data?.lastRefill || now),
  };

  try {
    await supabase.auth.updateUser({
      data: {
        stamina_data: newData,
      },
    });
  } catch (err) {
    console.error('Stamina consume save error:', err);
  }

  return {
    success: true,
    current: newCurrent,
  };
}

/**
 * Enerji İksiri Satın Alma (+5 Enerji)
 */
export async function buyStaminaPotion(user, currentCoins) {
  if (!user) return { success: false, error: 'Giriş yapılmalı' };
  if (currentCoins < POTION_COST) {
    return { success: false, error: `Yetersiz bakiye! İksir için ${POTION_COST} Tier Parası gerekir.` };
  }

  const currentStatus = getStamina(user);
  const newCurrent = Math.min(MAX_STAMINA, currentStatus.current + POTION_REFILL);
  const newCoins = currentCoins - POTION_COST;

  try {
    await supabase.auth.updateUser({
      data: {
        coins: newCoins,
        stamina_data: {
          current: newCurrent,
          lastRefill: Date.now(),
        },
      },
    });

    try {
      await supabase.from('profiles').update({ coins: newCoins }).eq('id', user.id);
    } catch {}

    return {
      success: true,
      current: newCurrent,
      newCoins,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
