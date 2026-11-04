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
