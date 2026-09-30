---
name: gamification-engine
description: Complete gamification architecture derived from OmniRoute (polynomial XP curves, level titles, streak retention, declarative badges, and server-side anti-cheat anomaly detection). Use when designing or tuning progression systems, badges, streaks, leaderboards, or player retention loops.
---

# Complete Gamification & Progression Engine

This skill encapsulates the mathematical models, player retention mechanisms, and anti-cheat validations from OmniRoute's gamification suite.

---

## 1. XP Curve & Level Progression Mathematics

OmniRoute uses a pure-function polynomial progression curve rather than flat linear or steep exponential steps:

### Delta XP Formula (XP to advance from Level $n-1$ to $n$)
$$\Delta\text{XP}(n) = \lfloor 100 \times n^{1.5} \rfloor \quad (n \ge 2)$$

- Level 1 $\to$ 2: $100 \times 2^{1.5} \approx 282\text{ XP}$
- Level 9 $\to$ 10: $100 \times 10^{1.5} \approx 3,162\text{ XP}$
- Level 49 $\to$ 50: $100 \times 50^{1.5} \approx 35,355\text{ XP}$

### Cumulative XP Thresholds
$$\text{TotalXP}(N) = \sum_{i=2}^{N} \Delta\text{XP}(i)$$

### Inverse Level Calculation (Fast Approximation with Boundary Reconcile)
$$\text{level}_{\text{est}} = \max\left(1, \left\lfloor \left(\frac{\text{totalXP} \times 2.5}{100}\right)^{0.4} \right\rfloor\right)$$

---

## 2. Level Titles & Badge Tiers

| Level Range | Title | Tier | Theme / Accent Color |
|---|---|---|---|
| **1 – 10** | Beginner (Çırak) | Bronze | `#cd7f32` (Bakır / Bronz) |
| **11 – 25** | Explorer (Gezgin) | Silver | `#c0c0c0` (Gümüş) |
| **26 – 50** | Expert (Usta) | Gold | `#ffd700` (Altın) |
| **51 – 75** | Master (Şampiyon) | Platinum | `#00d2ff` (Platin & Buzul) |
| **76+** | Legend (Efsane) | Diamond | `#b9f2ff` / Holographic (Elmas & Kozmik) |

---

## 3. Daily Streaks & Retention Multipliers

Streaks encourage continuous daily return without punitive demotivation:

1. **Streak Window**: A daily login counts if made between $00:00$ and $23:59$ UTC (or local midnight).
2. **Streak Bonus Calculation**:
   $$\text{XP}_{\text{bonus}} = \text{base\_login} + \min(10, \text{streak\_days}) \times \text{multiplier}$$
3. **Streak Freeze / Grace Period**: Allow users 1 missed day per 14 days without resetting their streak to 0.

---

## 4. Anti-Cheat & Velocity Validation

To prevent client-side script tampering or automated XP spamming:

1. **Rolling Rate Limit Window**:
   - Limit: Maximum $1,000\text{ XP}$ per $60\text{-second}$ window.
   - Any client action requesting XP that pushes the rolling sum over the cap is clamped and logged.
2. **Anomaly Velocity Detection ($Z$-Score)**:
   - Calculate hourly user average $\mu$ and standard deviation $\sigma$.
   - Flag accounts with $Z = \frac{\text{hourly\_xp} - \mu}{\sigma} > 3.0$ for admin review before awarding competitive rewards.

---

## 5. Declarative Badge Evaluation Pattern

```javascript
export const BADGE_DEFINITIONS = [
  {
    id: "first_blood",
    name: "İlk Zafer",
    description: "İlk kart savaşı zaferini kazan",
    rarity: "common",
    criteria: { type: "win_count", mode: "savas", threshold: 1 }
  },
  {
    id: "streak_master",
    name: "Yenilmez Seri",
    description: "Üst üste 7 gün giriş yap",
    rarity: "rare",
    criteria: { type: "streak", threshold: 7 }
  },
  {
    id: "collector_whale",
    name: "Koleksiyon Hakimi",
    description: "50 farklı karakter kartına sahip ol",
    rarity: "legendary",
    criteria: { type: "card_count", threshold: 50 }
  }
];

export function evaluateBadges(userStats, unlockedBadgeIds = []) {
  const newlyUnlocked = [];
  for (const badge of BADGE_DEFINITIONS) {
    if (unlockedBadgeIds.includes(badge.id)) continue;
    const { type, threshold, mode } = badge.criteria;
    let satisfied = false;
    if (type === "win_count") satisfied = (userStats.wins?.[mode] || 0) >= threshold;
    if (type === "streak") satisfied = (userStats.currentStreak || 0) >= threshold;
    if (type === "card_count") satisfied = (userStats.uniqueCards || 0) >= threshold;
    if (satisfied) newlyUnlocked.push(badge);
  }
  return newlyUnlocked;
}
```
