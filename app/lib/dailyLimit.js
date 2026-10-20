export const MAX_DAILY_PLAYS = 5;

export function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getDailyPlays(user, gameKey) {
  const today = getTodayKey();
  let metaCount = 0;
  if (user?.user_metadata?.daily_mini_games?.date === today) {
    metaCount = user.user_metadata.daily_mini_games.counts?.[gameKey] || 0;
  }

  let localCount = 0;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`daily_plays_${gameKey}_${today}`);
      if (raw) localCount = parseInt(raw, 10) || 0;
    } catch {}
  }

  return Math.max(metaCount, localCount);
}

export async function incrementDailyPlay(supabase, user, gameKey) {
  const today = getTodayKey();
  const current = getDailyPlays(user, gameKey);
  const nextCount = current + 1;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`daily_plays_${gameKey}_${today}`, String(nextCount));
    } catch {}
  }

  if (user && supabase) {
    try {
      let meta = user.user_metadata?.daily_mini_games || {};
      if (meta.date !== today) {
        meta = { date: today, counts: {} };
      }
      meta.counts = { ...(meta.counts || {}), [gameKey]: nextCount };
      await supabase.auth.updateUser({
        data: { daily_mini_games: meta },
      });
    } catch (e) {
      console.error('Günlük oyun hakkı güncellenirken hata:', e);
    }
  }

  return nextCount;
}
