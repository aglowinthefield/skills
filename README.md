# skills

Agent skills by aglowinthefield, in plain [Agent Skills](https://agentskills.io) format. They work in Claude Code, Codex, Pi, Hermes, and any agent that reads `SKILL.md`.

| Skill | What it does |
| --- | --- |
| [`data-hygiene`](skills/data-hygiene/SKILL.md) | Hunts stored data that breaks a rule the code assumes (unfinished backfills, rules defined twice, writes that skip the normalizer, collation traps, stale readers, identity twins), measures each on real data, and drafts one issue per finding. |
| [`design-audit`](skills/design-audit/SKILL.md) | Audits an existing app against house-style and its DESIGN.md, fixes each finding as its own commit, and serves a before/after review page (side by side, slider, pixel diff, dark and light) where you keep or drop each fix. |
| [`house-style`](skills/house-style/SKILL.md) | Tom's taste for every UI: colour as meaning, dark and light, dense tools, motion that smooths, text that informs. Ships a font library, a colour guide drawn from the editor-theme tradition (Compline, Everforest, Gruvbox, Base16), a contrast checker, the DESIGN.md routine for each repo, and a shared help layout for terminal CLIs. |
| [`nitpick`](skills/nitpick/SKILL.md) | Loads a page or component into a hot-reloading preview, then treats each message as one small design tweak, one commit per tweak. |
| [`paprika`](skills/paprika/SKILL.md) | Reads recipes, ingredients, meal plans, menus, the grocery list, and the pantry from the local Paprika Recipe Manager library on macOS. A read-only SQL script adds plain views over Paprika's Core Data tables and stops with a clear error if an app update changes them. |
| [`walk`](skills/walk/SKILL.md) | Walks a list of action items one at a time instead of ending a reply with nine bullets. Each item ends as do now, fork, defer, or drop. |
| [`ykwim`](skills/ykwim/SKILL.md) | End a request with "ykwim?" and the agent restates what it thinks you mean, lists ambiguities with a recommended answer for each, and waits for your go-ahead. |
| [`vault-report`](skills/vault-report/SKILL.md) | Exports a Tailwind + Mermaid HTML report into an Obsidian vault as themed notes, one per section plus an index. vault-writing uses it for reports. |
| [`vault-writing`](skills/vault-writing/SKILL.md) | Writes Obsidian vault notes picture-first: diagrams for processes, architectures, boundaries and flaws, with a checker that enforces a prose budget and renders every Mermaid block in Obsidian. |
| [`wrap-up`](skills/wrap-up/SKILL.md) | Before you close a session, sweeps it for loose ends (unpushed work, open decisions, facts worth saving) and asks which to finish, export, or drop. Run it as `/wrap-up`. |

## Install

To install every skill:

```bash
npx skills add aglowinthefield/skills -g
```

To install one skill:

```bash
npx skills add aglowinthefield/skills -g --skill walk
```

Or clone and symlink:

```bash
git clone git@github.com:aglowinthefield/skills.git ~/code/skills
for s in data-hygiene design-audit house-style nitpick paprika vault-report vault-writing walk wrap-up ykwim; do ln -s ~/code/skills/skills/$s ~/.agents/skills/$s; done
```

## nitpick

Say "/nitpick <thing>" or "design pass on X". The agent finds the files for a page, component, route, or stylesheet, and starts a preview with hot reload. With no target, it uses the whole project.

It picks the first surface that works: the repo's dev server, an existing Storybook story, a throwaway scratch route, a static file under a reload server, or edit and screenshot. Work happens in a separate worktree.

After that, each message is one small tweak, such as "more padding" or "the gray is too warm". The agent makes the smallest edit, commits it, and replies with the `file:line` and the before and after values. "undo" or "back N" reverts tweaks, and "compare" shows the diff. "done" stops the server and squashes the commits.

## walk

When a reply would end in several action items, the agent turns them into a ledger and asks about one item per turn:

- Do now: the agent handles it inline, then returns to the ledger.
- Fork: small items go to a background subagent. Bigger work goes wherever you escalate work, such as an issue tracker or a TODO file. The agent asks once and remembers.
- Defer: the agent writes it to a backlog with enough context to pick it up cold.
- Drop: the agent records it as dropped, with a reason.

Each turn shows a progress strip (`✅1 · ✅2 · **3** ← current · 4`) and lettered options with a recommendation, so you can answer with one letter.

With 4 or more items the agent walks them without asking. With 2 or 3 it asks "Walk these?" Saying "just list" skips the walk, and "What did we forget from the last walk?" searches the backlog and past ledgers.

State lives outside any repo, in `~/.agents/walk/`:

- `backlog.md` holds open deferred items. A new walk mentions them at the start.
- `ledgers/<date>-<slug>.md` holds one file per walk, updated as you go.
- `preferences.md` records where bigger forks go and other standing preferences.

walk is v0. Expect changes.

## vault-writing

The agent uses it whenever it writes a note in an Obsidian vault. The note leads with the answer and one overview diagram. Each section that describes how something runs, connects, or fails opens with a Mermaid diagram, with flaws marked in red and numbered so the prose can point at them. Reports the reader reviews go out as themed HTML through vault-report. Notes the reader edits stay native Markdown.

`scripts/check-note.mjs` enforces the rules. It flags any section with more than 150 words of prose and no picture, and any table cell over 20 words. It renders every Mermaid block in the running Obsidian app and reports parse errors and diagrams too wide for a pane. A section can opt out with `%% text-only: <reason> %%`.

For a before and after, see [references/example.md](skills/vault-writing/references/example.md). It takes a prose-heavy note about a made-up export job and redraws it section by section as a flowchart, a cleaned-up table, a state diagram, a bar chart, and a decision table with a quadrant chart. GitHub renders the diagrams.

The vault path and the Silk folder layout are specific to my setup. Change them in `SKILL.md` for yours.

## vault-report

Write a report as one HTML page with stock Tailwind classes and `<pre class="mermaid">` diagrams, then run `scripts/vault-report.mjs` on it. Each `data-note` section becomes its own note, and the rest becomes the index. Diagrams render to static SVG, and every colour is mapped by meaning (red, green, amber, neutral) onto your Obsidian theme. A shared CSS snippet keeps the notes themed when you switch themes.

It needs Node, Chrome or Playwright's Chromium, and network access for Mermaid. The first run installs Tailwind 3 into `~/.cache/vault-report`. The palette prefers the Compline theme's variables and falls back to Obsidian's own.

## wrap-up

Run `/wrap-up` before you close a session. The agent goes back through the conversation and checks each loose end against current state:

- Unfinished work, including questions nobody answered and background tasks still running.
- Unshipped state: uncommitted changes, unpushed commits, worktrees, draft PRs, and servers or containers it started.
- Decisions it handed to you.
- Earlier claims that turned out wrong.
- Knowledge the next session needs, with a suggested home such as memory, the issue tracker, or a repo doc.

It lists the items as finish now, export, or safe to drop, and asks which to act on. Commits, pushes, posts, and deletions still need your say-so. It ends with a tally of where everything went. The skill only runs when you invoke it.

## ykwim

End a request with "ykwim?", "you know what I mean?", "kwim?" or similar. The agent does no work yet. It restates the request in a sentence or two, lists anything ambiguous with a recommended answer for each, and waits. You can reply "yes" or "1 yes, 2 no, do X". It starts only after you confirm.
