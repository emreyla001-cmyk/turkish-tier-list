---
name: omniroute-compression
description: Token compression and context optimization engine inspired by OmniRoute (RTK, Caveman, stacked pipelines, and MCP filters). Use when processing large terminal/build logs, chat histories, or when needing to compress prompt tokens by 60–90% without losing semantics or critical debugging frames.
---

# OmniRoute Token Compression & Context Optimization

This skill provides token compression strategies derived from OmniRoute's production gateway architecture. It enables coding agents and applications to reduce token payloads by 60–95%, saving costs, preventing context window overflow, and accelerating response latency.

---

## 1. Compression Engine Overview

| Engine | Best For | Mechanics | Typical Savings |
|---|---|---|---|
| **RTK (Runtime Toolkit)** | Terminal, build logs, test runs, git diffs, stack traces | Strips ANSI escape codes, collapses identical/repetitive log lines, prunes successful test verbosity, retains error frames & stack traces | **60–90%** |
| **Caveman** | Natural language, user prompts, assistant messages, conversation histories | Eliminates conversational fluff, redundant stop words, excessive markdown formatting, and verbose preamble while retaining facts and instructions | **40–60%** |
| **Stacked (`RTK -> Caveman`)** | Mixed developer sessions with both code/command outputs and multi-turn conversations | Runs technical command logs through RTK first, then processes prose through Caveman | **75–95%** |
| **MCP / Accessibility Filter** | Browser DOM trees, Playwright/Puppeteer snapshots, accessibility trees | Collapses repetitive sibling UI nodes (≥30 repeats) and hard-caps massive DOM representations with navigational markers | **60–80%** |

---

## 2. RTK (Command Output Compression) Heuristics

When capturing or returning command output (e.g. `npm test`, `git status`, `docker build`):

1. **ANSI Code Stripping**:
   Strip all `\x1b\[[0-9;]*[a-zA-Z]` sequences to eliminate invisible color and cursor metadata tokens.
2. **Repetitive Progress Collapse**:
   Turn progressive spinner or download percentages (`[==>   ] 20%`, `[====> ] 40%`) into a single final line (`[======] 100% (collapsed 48 frames)`).
3. **Test Suite Trimming**:
   - For passing test suites, collapse thousands of `PASS src/...` lines into a single summary line: `PASS 42 suites, 312 tests passed (4.2s)`.
   - For failing tests, preserve the failure assertion, diff snippet, and the top 5 stack trace frames; drop node internal stack frames (`node:internal/*`, `node_modules/*`).
4. **Git Status & Diff Compaction**:
   - Collapse untracked file lists beyond 20 entries into `... and 45 more untracked files`.
   - Strip unchanged diff context lines exceeding 3 lines above/below modifications.

---

## 3. Caveman (Prompt & Context Compression) Heuristics

Caveman operates in four distinct intensity tiers:

- **Lite**: Trims greeting boilerplate ("Hello, I hope you are having a great day..."), trailing politeness, and duplicate instructions. 100% loss-free.
- **Standard (Default)**: Normalizes whitespace, compacts markdown tables into delimiter-separated text, eliminates redundant role introductions, and consolidates system instructions.
- **Aggressive**: Strips narrative transitions, converts full paragraphs into bulleted key-value pairs, and deduplicates repeated context across multi-turn messages.
- **Ultra (Context Recovery)**: Emergency compaction when approaching context limits. Retains only active tasks, critical constraints, file paths, and current errors.

---

## 4. MCP Accessibility & Large Payload Filter

When working with DOM tools or MCP browser agents:
- **Sibling Node Collapse**: If an element contains repeated list items or table rows exceeding threshold $N$ (default: 30), keep the first 3 and the last 1, inserting `<!-- collapsed N-4 identical items -->`.
- **Text Length Hard Cap**: Cap individual text payload strings at 50,000 characters, returning a truncated slice with instructions on how to query specific subtrees.

---

## 5. Implementation Quick Reference (Node.js / JS)

```javascript
// ANSI Stripper
export function stripAnsi(str) {
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

// RTK Log Collapser
export function compressLogOutput(rawText, maxLines = 80) {
  const clean = stripAnsi(rawText);
  const lines = clean.split('\n');
  if (lines.length <= maxLines) return clean;

  const head = lines.slice(0, 20);
  const tail = lines.slice(-maxLines + 20);
  return [
    ...head,
    `\n--- [RTK Compressed: ${lines.length - maxLines} repetitive lines collapsed] ---\n`,
    ...tail
  ].join('\n');
}
```
