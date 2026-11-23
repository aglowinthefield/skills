---
name: vault-writing
description: Write notes in the Obsidian vault picture-first. Processes, architectures, boundaries, flows and flaws get a diagram, and prose carries only what the picture can't. Use whenever you write or rewrite a note in $DEV_VAULT or another Obsidian vault (reports, audits, investigations, plans, architecture reviews, explainers, comparisons), whenever a write-up runs past a short reply, or when asked to make a note more visual.
---

# Vault writing

A vault note is read in a pane, often days later, by someone who wants the shape of the thing before the detail. Draw the shape. Use prose for the why, the evidence, and the caveats.

## Where notes go

- The vault is `$DEV_VAULT`, else `~/Documents/somewhere.garden` (`~/OneDrive/Documents/somewhere.garden` on Windows). Each project has a top-level folder. Silk work goes under `Silk/<topic>/` and other projects under `<project>/`. Name the file for its content (`CI scripts audit.md`). Never use `/tmp`, except for scratch data like query output and logs.
- The filename is the title. Never start a note with an H1. Begin with frontmatter, then the lead or an `##`.
- Frontmatter must be valid YAML. Write lists as `- item` lines. A wikilink is the whole value of its own property (`superseded-by: "[[Note]]"`), never mixed into prose.
- Set `status: needs-review` and `date: YYYY-MM-DD`. Tell the user the path, and wait for their review before acting on the note.
- Before overwriting a note, check it for the user's annotations (`rg -n '%%|\{>>' <note>`). Keep any you find, or ask.
- Prose follows clear-voice.

## Pick the format

| Note | Format |
| --- | --- |
| Audit, investigation, architecture review, comparison, explainer, or anything the reader reviews and doesn't edit | **vault-report HTML** (default) |
| Plan, spec, checklist, Now page, or a note the user edits or annotates inline | native Markdown |
| Short note (under ~400 words), or an append to an existing native note | native Markdown |

vault-report lets you put cards side by side, show before and after in columns, use coloured scorecards, and keep a legend next to its diagram. It costs about the same to write. Its notes are static HTML in source mode, so the user can't edit them comfortably and CriticMarkup comments don't work inside them. Read `~/.agents/skills/vault-report/SKILL.md` before writing one. A report without `data-note` sections exports as a single note. Keep the HTML source at `~/.cache/vault-writing/sources/<folder, with / as _>__<note name>.html` (two notes can share a name), so a later edit can change it and export again with `--force`. The export writes vault-report's own frontmatter, so put back any properties the old note had.

Both formats render the same Mermaid. Obsidian 1.15 parses every current diagram type, including `architecture-beta`, `block-beta`, `xychart-beta`, `sankey-beta`, `packet-beta`, and `radar-beta`.

## The rule: picture first

1. The note opens with a lead of one or two sentences: the answer, the decision, or the blocker. **One overview diagram** comes right after it, so the whole system or finding fits on the first screen.
2. Every section that describes how something runs, connects, fails, waits, or changes state opens with a diagram. The prose under it explains only what the diagram can't show.
3. Budget: a section with more than 150 words of prose and no diagram or image is a bug. Draw it, cut it, or fold the detail into a collapsed callout. If it really is text-only, such as a list of open questions, put `%% text-only: <reason> %%` (Markdown) or `<!-- text-only: <reason> -->` (HTML) under its heading. A diagram drawn in HTML boxes instead of Mermaid needs `data-visual` on its wrapper so the checker counts it. `scripts/check-note.mjs` enforces this.
4. A table cell holds a value, a name, or a short phrase of 20 words or fewer. A longer cell is prose, so move it out.
5. Methodology, sample sizes, and raw evidence go in a collapsed callout (`> [!info]- How this was measured`) or in `<details>` in HTML. The reader opens them on purpose.

## Choose the picture

| You're showing | Draw |
| --- | --- |
| A pipeline, a request path, or steps in order | `flowchart LR` |
| Who calls whom, waits, and on what | `sequenceDiagram`, with the waits as notes or `rect` blocks |
| Architecture and boundaries (process, runner, network, trust, team) | `flowchart` with one `subgraph` per boundary, or `architecture-beta` for infrastructure |
| A flaw, a failure, or a risk | The same diagram as the working system, with the broken edge or node marked `bad` and a numbered marker the prose refers to |
| A lifecycle or retries | `stateDiagram-v2` |
| Where time goes, or critical paths | `gantt` (as a timeline of one run) or a bar chart |
| Numbers across groups, or before and after | `xychart-beta` bars, or a small table |
| Where effort or cost flows | `sankey-beta` |
| Options against two criteria | `quadrantChart` |
| A decision or a proposal sequence | `flowchart TB` from the current state to each step, with each node naming what it unblocks |

Recipes and the theme-safe colour classes are in [references/diagrams.md](references/diagrams.md). Read it before drawing.

## Draw well

- One idea per diagram, with no more than about 12 nodes. Split anything bigger into an overview and a zoom.
- Label nodes with the real names from the code (`verify:pr`, `ci-heavy`), not generic roles. Label edges with the verb and the number: `awaits, 59 s p50`.
- Put numbers on the picture. A diagram that says "slow" is worse than one that says `36 s wait`.
- A subgraph title names the boundary: `GitHub runner (4 vCPU)`, not `Backend`.
- Colour by meaning only: red is a problem, green is what works or stays, amber is caution, and a dashed outline is outside our control. Leave everything else neutral.
- Mark a flaw where it happens. Put a numbered marker (`①`) on the node or edge, and start the matching paragraph with the same marker.
- Prefer `LR` for pipelines and `TB` for hierarchies and plans. If the checker says a diagram is too wide, switch the direction or split it.

## Native Markdown extras

- Callouts take the place of bold-label paragraphs. Use `> [!warning]` for risks, `> [!question] Decision` for calls the user makes, `> [!success]` for what to keep, and `> [!info]-` (collapsed) for methodology.
- Link sibling notes with `[[Note]]`, and code with GitHub permalinks.
- Leave inline HTML out of native notes. If you want layout, switch to vault-report.

## Check before you hand it over

```bash
node ~/.agents/skills/vault-writing/scripts/check-note.mjs <note.md | report.html>
```

The checker flags sections over the prose budget, long table cells, and every diagram that fails to render or is too wide for a pane (over 1,100 px, where its text shrinks). Markdown blocks render in the running Obsidian app. For vault-report, check the HTML source before export, then the exported note after, which catches wide rendered diagrams. The checker exits 1 on any hit. If Obsidian isn't running or its CLI is off, it skips rendering and says why. To see the note, use `obsidian-cli open` as the vault-report skill describes.

For before-and-after pairs of each kind of rewrite (pipeline, table, retry loop, trend, decision), see [references/example.md](references/example.md).
