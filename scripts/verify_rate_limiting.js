/**
 * RATE LIMITING & FLOOD PREVENTION TEST
 * -------------------------------------
 * Verifies that sending requests beyond the rate limit (e.g. >10 requests in 10s)
 * triggers HTTP 429 Too Many Requests.
 */

const { checkRateLimit } = require('../app/lib/rateLimiter');

async function verifyRateLimiter() {
  console.log("=================================================");
  console.log("   RATE LIMITING & FLOOD PREVENTION AUDIT        ");
  console.log("=================================================\n");

  const testUserId = "user_spam_test_999";
  console.log(`[1] Sending 10 consecutive requests for ${testUserId} (Limit: 10/10s)...`);

  let allowedCount = 0;
  let blockedCount = 0;

  for (let i = 1; i <= 12; i++) {
    const res = checkRateLimit(testUserId, 10, 10000);
    if (res.allowed) {
      allowedCount++;
    } else {
      blockedCount++;
    }
  }

  console.log(`  Total Sent: 12 | Allowed: ${allowedCount} | Blocked (429 Rate Limit): ${blockedCount}`);
  const passed = allowedCount === 10 && blockedCount === 2;
  console.log("  => VERDICT:", passed ? "PASSED (11th and 12th requests blocked with Rate Limit)" : "FAILED");

  console.log("\n=================================================");
  console.log("        RATE LIMITING AUDIT COMPLETE             ");
  console.log("=================================================");
}

verifyRateLimiter();
