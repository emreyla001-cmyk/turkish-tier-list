# Turkish Tier List — AI Agent & Pair Programming Guidelines

> **Single Source of Truth**: All operational guidelines, architecture rules, and conventions for AI assistants working on this repository live in this file.

---

## 1. Project Overview & Architecture

- **Stack**: Next.js 14 (App Router), React 18, Tailwind CSS, Supabase (PostgreSQL, Auth, Realtime).
- **Core Domain**: Turkish Pop-Culture & Anime Tier List, Gacha Card Battler, Community Rankings, Clan Battles, Shop & Cosmetics.
- **Key Modules**:
  - `app/lib/wallet.js`: 3-layer synchronized Coin & XP engine (`user_metadata` + `localStorage` + `profiles` DB).
  - `app/components/cosmetics.js`: Animated avatar frames, animated name glows, profile background cosmetics.
  - `app/components/UserBadge.js`: Dynamic role badges, level calculation (`levelFromXp`, `xpForLevel`), and user flair.
  - `app/magaza/page.js`: Coin shop for booster packs, animated frames, animated name tags, and profile backdrops.
  - `app/kart-oyunu/`: Turn-based card battler game modes (`savas`, `deste-olustur`, `kartlarim`).

---

## 2. Cardinal Hard Rules (Adapted from OmniRoute & Production Experience)

### Rule 1: Zero Phantom / Fake Data
- **Never inject synthetic or mock users, clans, votes, or activities** into live database tables or shared application state.
- Features must be tested with authentic user sessions or clean local unit tests, cleaning up any test fixtures immediately.

### Rule 2: Multi-Agent Cross-Session Safety (Never `git stash`)
- **NEVER run `git stash` or `git stash pop` in any agent or subagent session.**
- Git stash operates on the **shared repository object store** and silently clobbers or resurrects uncommitted work from parallel sessions.
- To compare with base: `git show origin/main:<path>` or `git diff HEAD -- <path>`.

### Rule 3: Build Verification Gate
- Before committing any modification, always execute `npm run build`.
- All routes (currently 39/39) must compile cleanly with 0 TypeScript/ESLint fatal errors.

### Rule 4: Gacha & Economy Progression Mechanics
- **UR (Ultra Rare)** cards must remain elite and challenging to obtain; they must not be handed out freely to prevent game dominance.
- **SSR (Super Super Rare)** should appear balanced across multiple pack openings (e.g., approximately 1 in 2–3 packs), maintaining excitement.
- Economy rewards must create a dynamic loop: generous opportunities to earn coins via gameplay, matched with high-desirability cosmetic and card sinks.

### Rule 5: 3-Layer Persistence for Wallet & XP
- Any XP or Coin mutation must update:
  1. Supabase `auth.updateUser({ data: { xp, coins } })`
  2. Browser `localStorage` cache for instantaneous client feedback
  3. `profiles` table in Supabase
  4. Global event dispatch: `window.dispatchEvent(new CustomEvent('xp-updated'))` and `'coins-updated'`

### Rule 6: ReDoS-Safe Regular Expressions
- All regexes matching user-supplied strings must be strictly bounded (e.g. `{1,64}`) to prevent catastrophic backtracking.

---

## 3. Discovered Skills in `.agents/skills`

The following specialized skills are available to this workspace:
- **`omniroute-compression`**: Token compression heuristics (RTK, Caveman, stacked pipelines).
- **`omniroute-resilience-routing`**: AI Gateway patterns, circuit breakers, and zero-downtime provider failovers.
- **`gamification-engine`**: Polynomial XP curves ($100 \times n^{1.5}$), streak retention, and anti-cheat rate limiting.
- **`agent-discipline-guardrails`**: Multi-agent cross-session discipline and repository hygiene.
