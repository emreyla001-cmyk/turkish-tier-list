/**
 * Gamification Utilities & Anti-Cheat Safeguards
 * Adapted from OmniRoute's battle-tested gamification engine.
 */

const MAX_XP_PER_MINUTE = 1500;
const rollingWindows = new Map();

/**
 * Validates whether an XP gain is within normal human gameplay boundaries.
 * Prevents client-side loops, race conditions, or script tampering from inflating XP.
 *
 * @param {string} userId - User identifier
 * @param {number} amount - Amount of XP to be awarded
 * @returns {{ allowed: boolean, adjustedAmount: number, reason?: string }}
 */
export function validateXpGain(userId, amount) {
  const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
  if (safeAmount === 0) return { allowed: true, adjustedAmount: 0 };

  const now = Date.now();
  const windowMs = 60 * 1000;

  let userLog = rollingWindows.get(userId) || [];
  // Prune entries older than 60 seconds
  userLog = userLog.filter((entry) => now - entry.timestamp < windowMs);

  const currentWindowXp = userLog.reduce((sum, entry) => sum + entry.amount, 0);

  if (currentWindowXp + safeAmount > MAX_XP_PER_MINUTE) {
    const allowedQuota = Math.max(0, MAX_XP_PER_MINUTE - currentWindowXp);
    rollingWindows.set(userId, userLog);
    return {
      allowed: allowedQuota > 0,
      adjustedAmount: allowedQuota,
      reason: `Hız limiti aşıldı (Azami ${MAX_XP_PER_MINUTE} XP/dk). Kalan kota: ${allowedQuota} XP.`
    };
  }

  userLog.push({ timestamp: now, amount: safeAmount });
  rollingWindows.set(userId, userLog);

  return { allowed: true, adjustedAmount: safeAmount };
}

/**
 * Calculates bonus rewards based on daily active streak.
 *
 * @param {number} streakDays - Consecutive login days
 * @returns {{ bonusCoins: number, bonusXp: number, multiplier: number }}
 */
export function calculateStreakRewards(streakDays = 1) {
  const safeStreak = Math.max(1, Math.min(30, Number(streakDays) || 1));
  const multiplier = 1 + Math.min(1.5, (safeStreak - 1) * 0.1); // up to 2.5x multiplier

  const bonusCoins = Math.floor(25 * multiplier);
  const bonusXp = Math.floor(15 * multiplier);

  return {
    bonusCoins,
    bonusXp,
    multiplier: Number(multiplier.toFixed(2))
  };
}

/**
 * Level title & badge tier thresholds
 */
export function getLevelRankInfo(level = 1) {
  const lvl = Math.max(1, Number(level) || 1);
  if (lvl >= 75) return { title: 'Efsane', tier: 'diamond', color: '#b9f2ff' };
  if (lvl >= 50) return { title: 'Şampiyon', tier: 'platinum', color: '#00d2ff' };
  if (lvl >= 25) return { title: 'Usta', tier: 'gold', color: '#ffd700' };
  if (lvl >= 10) return { title: 'Gezgin', tier: 'silver', color: '#c0c0c0' };
  return { title: 'Çırak', tier: 'bronze', color: '#cd7f32' };
}
