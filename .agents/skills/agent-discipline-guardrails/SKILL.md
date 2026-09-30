---
name: agent-discipline-guardrails
description: Battle-tested autonomous agent safety guardrails and discipline rules derived from OmniRoute's 23 Hard Rules. Use when coordinating multi-agent coding sessions, dispatching subagents, avoiding cross-session git state clobbering, preventing ReDoS vulnerabilities, and maintaining repository hygiene.
---

# Autonomous Agent Discipline & Guardrails

This skill codifies the battle-tested engineering guardrails refined over hundreds of multi-agent development cycles in OmniRoute.

---

## 1. Cross-Session Multi-Agent Safety (The Cardinal Git Rule)

> [!CAUTION]
> **NEVER `git stash` / `git stash pop` in any agent or subagent session.**

- **Why**: `git stash` operates on the **shared repository object store**, NOT on isolated working directories or worktrees. Stashing in one agent session silently corrupts, clobbers, or resurrects uncommitted work from parallel sessions or previous tasks.
- **Alternative**:
  - To inspect base ref code without stashing: `git show origin/main:<filepath>` or `git diff HEAD -- <filepath>`.
  - To revert a single file: `git checkout HEAD -- <filepath>`.
- **Subagent Rule**: Always include this prohibition when dispatching subagents that execute git commands.

---

## 2. ReDoS (Regular Expression Denial of Service) Prevention

All regular expressions matching untrusted user input, web streams, or variable-length tokens must avoid nested quantifiers (`(a+)+`) and unbounded wildcards:

- ❌ **Dangerous**: `/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/`
- ✅ **Safe (Bounded)**: `/^[a-zA-Z0-9_.+-]{1,64}@[a-zA-Z0-9-]{1,63}(?:\.[a-zA-Z0-9-]{1,63})+$/`
- **Rule**: Specify explicit bounds `{1,N}` on token extractors (e.g. IPv6, credit cards, user handles).

---

## 3. SSE (Server-Sent Events) Stream Snapshot Handling

When consuming or transforming streaming LLM chunks:
- Final chunk events (`event: done`, `finish_reason: "stop"`, or full snapshot completions) must be processed as standalone payloads.
- **Do not** append snapshot payloads to rolling delta buffers, or users will experience duplicate text at the end of streaming responses.

---

## 4. Resource & DB Handle Release in Tests

- When creating in-memory DB connections, mock servers, or file listeners during tests, register explicit teardown hooks:
  ```javascript
  afterAll(async () => {
    await db.close();
    await server.close();
  });
  ```
- Unclosed SQLite or WebSocket handles prevent the Node process from exiting cleanly and cause test timeouts.

---

## 5. Clean Workspace Discipline & Zero-Fake-Data

1. **No Phantom / Fake Injections**:
   - Never inject mock user accounts, bot clans, or simulated votes into live tables or shared state.
   - Test features with genuine user context or explicit sandboxes, and clean up test fixtures immediately.
2. **Build Verification Before Commit**:
   - Always run the production build verification (`npm run build` or equivalent) before committing changes to ensure zero route breakages or TypeScript errors.
3. **Atomic Commit Messages**:
   - Keep commits small, descriptive, and scoped to a single logical improvement.
