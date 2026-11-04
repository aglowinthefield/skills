---
name: walk
description: Walk a list of action items one at a time instead of dumping it. Use when a reply would end in several action items, findings, or decisions, when the user says "walk these", or when they ask what got deferred or forgotten from earlier walks.
---

A **walk** turns a list of action items into a **ledger** and steps through it one item per turn, so nothing is lost in a scroll of bullets. Every item ends with an **outcome**: done, forked, deferred, or dropped.

## When to walk

- **4+ action items:** walk without asking.
- **2–3 action items:** give the list, then end with "Walk these?"
- **"Just list"** from the user skips the walk for that reply.

Findings the user only reads (no decision, no action) are not action items; list them plainly.

## Files

All state lives under `~/.agents/walk/` (create on first use), shared across harnesses:

- `backlog.md`: open deferred items, one `##` entry each, holding the date, source (session/repo), the item, and enough context to pick it up cold. Remove an entry when a later walk resolves it.
- `ledgers/<YYYY-MM-DD>-<slug>.md`: one file per walk, written at step 1 and updated after every outcome. The live ledger is the source of truth for position, so a long detour or a context compaction never loses the walk.
- `preferences.md`: the user's **escalation mode** (see Fork), plus any other standing walk preferences they state.

## Steps

### 1. Open the ledger

Read `backlog.md`. If it has open entries, say how many and ask: walk them first, after this ledger, or skip.

Then show the ledger once: a numbered list, one line per item, in dependency order, then impact. The user may reorder, merge, split, or cut before the walk starts. Write the ledger file.

**Done when:** the ledger file exists and the user has accepted the order.

### 2. Walk each item

One item per turn. Each turn shows:

1. The ledger strip: `✅1 Name · ✅2 Name · **3 Name** ← current · 4 Name`, so position is always visible.
2. `**Item N of M: <question or action>**`, then two or three lines of context: what it is and what rides on it.
3. Lettered options, recommended first and marked **(recommended)**. Always include the four outcomes where they fit: do now, fork, defer, drop. Free-text answers are always welcome.

Use the harness's structured-choice tool (`clarify`, `AskUserQuestion`) when it works; fall back to lettered options in chat when it fails or is absent.

Record the outcome in one line at the top of the next turn ("Recorded for item 3: …"), update the ledger file, and move on. Combined answers ("A and C") and amended answers ("A, but…") are recorded as stated, not forced into one option.

Outcomes:

- **Do now:** handle it inline, then return to the ledger at the next item. Re-show the strip on return.
- **Fork:** hand it off so the walk keeps moving. Small, self-contained items (a lookup, a quick investigation) go to a background subagent; its result lands back in the ledger when it returns. Larger work (ships code, outlives the session) follows the user's **escalation mode** from `preferences.md`. If none is set, ask once ("How should I escalate bigger work: an issue tracker, a task board, a TODO file, something else?"), save the answer to `preferences.md`, and reuse it silently after.
- **Defer:** append an entry to `backlog.md` with pickup context.
- **Drop:** record the reason in the ledger.

**Done when:** every ledger item has an outcome.

### 3. Close out

Reply with the final ledger: each item, its outcome, and a link or path wherever one exists (subagent result, card, issue, PR, backlog entry). Mark the ledger file closed.

## Recall

When the user asks what got deferred, dropped, or forgotten ("what did we forget from the CI walk?"), search `backlog.md` and `ledgers/`, answer with the matching items and their outcomes, and offer to walk any of them as a new ledger.
