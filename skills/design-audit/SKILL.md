---
name: design-audit
description: Audit an existing app's UI against house-style and its DESIGN.md, fix each finding as its own commit, and review before/after screenshots side by side before keeping any. Use when asked for a design audit, a design review of an existing project, or to bring a repo in line with house-style.
---

# Design audit

An audit finds where a running app departs from its rules, fixes each finding in its own commit, and lets Tom keep or drop each fix after comparing screenshots. Nothing lands until he has chosen.

Scripts live in `<skill-dir>/scripts` and run with Node. Audit files go in `.design-audit/` inside the audit worktree; add `.design-audit/` to the repo's `.git/info/exclude` so it never shows up in git.

## 1. Set up

1. Load `house-style` and read the repo's `DESIGN.md` if it has one. Read `web-design-guidelines`' `references/command.md` for accessibility and mechanics.
2. Create the worktree: `git worktree add .worktrees/design-audit-<date> -b design-audit/<date> main`. Every command below runs there.
3. Start the app the way `nitpick` setup does: the repo's dev server first. Desktop apps (Tauri, Electron) are audited through the same UI in a browser. Run the server in the background with its output in a log file.
4. Pick the scope. With a target (a route, a component, "the sidebar"), audit that. Without one, list the app's screens and take up to 8, the ones Tom uses most first.
5. Write `.design-audit/screens.json`:

```json
{
  "baseUrl": "http://127.0.0.1:5173",
  "viewports": [{ "name": "desktop", "width": 1440, "height": 900 }],
  "modes": {
    "dark": { "colorScheme": "dark" },
    "light": { "colorScheme": "light", "init": "localStorage.setItem('theme','light')" }
  },
  "screens": [
    { "name": "board", "path": "/", "waitFor": "main" },
    { "name": "card-dialog", "path": "/", "waitFor": "main", "setup": "document.querySelector('[data-card]').click()", "after": "[role=dialog]" }
  ]
}
```

Use `init` when the app keeps its theme in storage instead of following the system. When the theme comes from the server, add a mode `setup` that sets it after load (for example `"setup": "document.documentElement.dataset.theme='light'"`), and check the light screenshots really are light. Add a `{ "name": "phone", "width": 390, "height": 844 }` viewport only for surfaces that run on phones, and limit it per screen with `"viewports": ["phone"]`.

The set-up step is done when `node <skill-dir>/scripts/capture.mjs .design-audit/screens.json .design-audit/shots/base` exits 0 and you have looked at every screenshot it wrote.

## 2. Find

Look at each base screenshot and read the code behind it. A finding is one departure from a named rule, with:

- `rule`: the rule it breaks, cited by source (`house-style: colour is meaning`, `DESIGN.md: 11px minimum`, `web-design-guidelines: focus states`)
- `where`: `file:line`
- `why`: one sentence on what the user sees
- the fix you intend

A repo with no `DESIGN.md` gets that as finding 1: write it with house-style's DESIGN.md routine. Order the rest by how much Tom would notice, and keep each finding small enough to judge from one screenshot pair. Where a rule and the repo's `DESIGN.md` disagree on purpose (a recorded exception), it is not a finding.

## 3. Fix and capture

For each finding, in order:

1. Make the change and commit it alone: `design-audit: <finding title>`.
2. Capture: `node <skill-dir>/scripts/capture.mjs .design-audit/screens.json .design-audit/shots/<id>`. Wait for the dev server to finish rebuilding first (watch its log).
3. Look at the new screenshots. If the fix did not land or broke something else, amend the commit and capture again.

Then write `.design-audit/findings.json`:

```json
{
  "repo": "bakery",
  "base": "<sha of main>",
  "findings": [
    { "id": "f1", "title": "Raise 10px labels to 11px", "rule": "DESIGN.md: 11px minimum", "why": "Lane counts are hard to read in compact density.", "commit": "<sha>", "screens": ["board"] }
  ]
}
```

Each finding is compared against the state just before it: `base` for the first, the previous finding's shots after that. `screens` limits which screenshots its review shows.

## 4. Review with Tom

1. Start the review page in the background: `node <skill-dir>/scripts/compare.mjs .design-audit --port 4870`, and open the URL it prints. When the audit runs on mochi, Tom reviews from another device over Tailscale, so serve it on the tailnet address instead: `--host $(tailscale ip -4)`, and give him `http://mochi:4870/`. Use `share-preview` for anyone outside the tailnet.
2. Tell Tom how many findings there are and that the page has side-by-side, slider and diff views (diff shows only the pixels that changed). Then wait for him to say he is done.
3. Read `.design-audit/choices.json`. A note on a finding is a request: change that fix, amend its commit, capture again, and ask him to review that finding again.

Review is done when `choices.json` exists, its `savedAt` is newer than every capture, and every note has been answered.

## 5. Land and record

1. Create the landing branch from `main` and cherry-pick the kept commits in order. Resolve conflicts from a dropped dependency by hand, and tell Tom if a kept fix needed a dropped one.
2. Run the repo's checks, then land it the way the repo lands work (straight to `main`, or a PR).
3. Write a short vault note with `vault-writing`: scope, each finding with its rule, kept or dropped, and the landed commits. Leave screenshots out; the commits carry the change.
4. Stop the review server and the dev server, then remove the worktree.
