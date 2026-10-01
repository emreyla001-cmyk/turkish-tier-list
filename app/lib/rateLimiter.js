/**
 * APPLICATION-LEVEL SLIDING WINDOW RATE LIMITER
 * ---------------------------------------------
 * Enforces per-user / per-IP rate limits on sensitive endpoints:
 * - Chat / Flood prevention: Max 5 messages / 10 sec
 * - Raffle / Daily Claims: Max 2 claims / 60 sec
 * - Mutation Endpoints: Max 10 requests / 10 sec
 */

const rateLimitStore = new Map();

export function checkRateLimit(identifier, limit = 10, windowMs = 10000) {
  const now = Date.now();
  const userRecord = rateLimitStore.get(identifier) || [];
  
  // Filter out timestamps outside the sliding window
  const validTimestamps = userRecord.filter((timestamp) => now - timestamp < windowMs);

  if (validTimestamps.length >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: windowMs - (now - validTimestamps[0]),
    };
  }

  validTimestamps.push(now);
  rateLimitStore.set(identifier, validTimestamps);

  // Periodic cleanup to avoid memory leaks
  if (rateLimitStore.size > 5000) {
    for (const [key, timestamps] of rateLimitStore.entries()) {
      if (timestamps.length === 0 || now - timestamps[timestamps.length - 1] > windowMs) {
        rateLimitStore.delete(key);
      }
    }
  }

  return {
    allowed: true,
    remaining: limit - validTimestamps.length,
    resetMs: windowMs,
  };
}
