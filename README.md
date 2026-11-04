# skills

Agent skills by aglowinthefield, in plain [Agent Skills](https://agentskills.io) format. They work in Claude Code, Codex, Pi, Hermes, and any agent that reads `SKILL.md`.

| Skill | What it does |
| --- | --- |
| [`nitpick`](skills/nitpick/SKILL.md) | Loads a page or component into a hot-reloading preview, then treats each message as one small design tweak, one commit per tweak. |
| [`walk`](skills/walk/SKILL.md) | Walks a list of action items one at a time instead of ending a reply with nine bullets. Each item ends as do now, fork, defer, or drop. |
| [`ykwim`](skills/ykwim/SKILL.md) | End a request with "ykwim?" and the agent restates what it thinks you mean, lists ambiguities with a recommended answer for each, and waits for your go-ahead. |
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
for s in nitpick walk wrap-up ykwim; do ln -s ~/code/skills/skills/$s ~/.agents/skills/$s; done
```

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
