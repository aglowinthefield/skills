# Philosophy

How Tom builds software: each principle is a rule, its reason, and the decisions it has already made in his projects. Read it before a design decision, such as a new module, a seam between projects, a loop, a schema change, a test strategy or where something runs.

This page is the why. The how lives in skills, and this page links to them without restating them: `codebase-design` for modules, `house-style` for interfaces and CLIs, `clear-voice` for writing, and the global `AGENTS.md` for worktrees, landing and gated actions.

## Seams

**Projects run alone.** Each project works without any other one installed. Swapping or dropping a project then breaks nothing else.
- Unconscious Development runs tasks through its `session` runner when Alice isn't installed.
- Alice runs cards with or without UD's specs.

**Projects meet through files, CLIs and JSON schemas.** No shared library and no runtime dependency crosses a seam. A plain file or command outlives any framework, and any agent can read it.
- UD's only dependencies are Markdown and scripts (its three global rules).
- UD creates Alice cards through `alice create --key`, not an import.

**A contract has one home, a version and fixtures.** The other side keeps a vendored copy with a check that it still matches. A shape defined twice drifts.
- The Task, TaskState and Verdict schemas live in `unconscious-development/docs/contract/`, and Alice vendors them.

**Inside a project, a dependency must do real work.** SQLite or React earn their place. A ten-line helper doesn't.
- UD has no dependencies at all.
- Alice depends on SQLite for its board and on React for its UI.

## People and agents

**People approve intent and landing.** Everything between belongs to the factory. A person's attention is the scarcest resource, so it goes where judgement matters.
- UD: you approve the spec and the merge, nothing in between.
- Alice: you move a card to Ready and press Approve.

**Work skips a person only with explicit criteria and a loop guard.** "It seemed small" is never the criterion.
- Alice repairs PR conflicts automatically, at most 3 times per card.
- Alice sends failing CI back to the agent, at most 3 times per PR.

**Code does what code can, and a model only judges.** Use the smallest model that can make the call, have it return structured output, and let code act on it. Code is free, deterministic and testable.
- UD's `questions` uses a small model only to read a reply, and code puts the answer in place.
- Alice's reviewer returns a JSON verdict, and its PR comments are templates.

**A fresh agent can read the repo.** `AGENTS.md` holds rules and commands, and `CONTEXT.md` holds the domain's terms. Write an ADR only once a decision has been reversed or argued over.
- halfnotes defines entity, release group, note and listen in `CONTEXT.md`.
- Every project has an `AGENTS.md`.

## Depth

**Deepen before you widen.** This applies at three levels. A shallow surface spreads knowledge thin, while a deep one keeps it in one place you can drill into.
- Product: open the card you already have to see an agent's attempt, review and cost. Don't add a new view. Alice is built this way.
- Code: few deep modules over many shallow ones. See `codebase-design`.
- Tools: tweak the current system before adopting a new one, as in the "Systems" rule in the global `AGENTS.md`.

## Verification

**Test behaviour from the outside.** Prefer end-to-end, boundary, integration and smoke tests that describe what the system does. Unit tests are for pure functions whose cases multiply: parsers, validators, calculations.

Holistic tests survive refactors and say what matters. A wall of unit tests burns CPU and pins the implementation in place.
- Alice tests its UI through Playwright and its server through its HTTP API.
- Alice unit-tests its reviewer verdict parser, which has many malformed-input cases.

**Lifecycles are named state machines.** A lifecycle with more than two phases, or a phase that crosses an await, timer, retry or another owner, is an enum of states with one transition function, not flags and status strings. Its rules, what must never happen and what must eventually happen, are written apart from the code. A lifecycle with concurrent callers or retries has those rules model-checked before a fix is trusted. A two-phase flag with one owner stays a flag.
- coda's `WantedState` owns every value of `wanted.state`, records each transition with a reason, and a test proves every state is reachable.
- mu's `StartPhase.derive` decides why a start isn't heard yet from one pure rule instead of loading and buffering flags.

**Every behaviour change carries a test.**
- Alice's README requires a regression test for each changed behaviour.

**Tests wait on conditions, not the clock.** Wait on the actual condition, or drive fake timers. CI and agents run many workers at once, so a fixed sleep turns into a flaky test.
- Alice's UI tests wait with Playwright's `waitFor` and retrying assertions.
- Pi's `no-sleep` extension blocks bare sleeps.

**Tests are never the bottleneck.** When agents wait on the suite, merge or delete the slowest tests before adding machines.

**Tests and lint are not review.** Review checks the change against what was asked for.
- UD's Shadow returns a verdict per acceptance criterion.
- Alice's auto-review reads the card and the diff as well as the test results.

## Failure and cost

**Core work fails loudly, and courtesies fail softly.** A failed run, merge or migration stops and says why. A failed comment, reaction or notification logs and lets the work go on. Nothing fails silently.
- Alice's `commentOnPullRequest` and `acknowledge` log and never block the run.

**Every automated loop has a cap and a visible cost.** You can see the cost per unit of work: per card, per PR, per run. A runaway loop is a failure mode, so caps stay on.
- Alice's loop guards always apply, and every run records its token cost.
- Alice's sentinel stops after a set number of attempts on a PR and hands it to a person.

**Schema changes add, and destructive changes stand alone.** Additive changes run automatically. A drop, rewrite or backfill takes a backup, runs as its own named step, and has a check that proves it finished.
- Alice adds columns at startup.
- The `data-hygiene` skill finds backfills that never finished.

**Every unattended tool has `doctor`.** It says what is broken right now and how to fix it, and it's the first command an agent runs when something looks off.
- `alice doctor`.
- UD's `unconscious status`, which becomes `unconscious doctor`.

**Anything that runs while you aren't watching is observable.** That covers services and scheduled jobs alike. The minimum:
- Prometheus metrics on the project's real units of work.
- Structured logs that Loki can query.
- Dashboards and alert rules kept as code in the repo and pushed by a script.
- Alerts only on things you would act on.

A job reports when it last succeeded, how long it took and whether it failed.

`doctor` answers "is it set up right now". Dashboards answer "how has it behaved". Neither depends on the other.
- Alice serves `/metrics`, and the monitoring stack on mochi scrapes it into the `alice` dashboard.
- impression pushes its dashboard and alerts with `ops/grafana/push.sh`.
- halfnotes deploys kube-prometheus-stack in `infra/monitoring.ts`.

## Hosting and stack

**Self-host what only you use, and use managed hosting for what others use.** Personal tools run on mochi, local-first. Anything other people use, or that must stay up while mochi is down, runs managed.

Observability follows the same rule: mochi's Grafana for personal tools, Grafana Cloud for the rest. Something outside mochi checks that mochi is up.
- Alice and the MusicBrainz mirror behind halfnotes run on mochi.
- impression and bookspell run on Fly, and impression's dashboards are on Grafana Cloud.

**Pick the stack per platform, one language per layer.** Swift on Apple, Rust where speed or a single small binary matters, TypeScript for web and tooling.
- mu is Swift, coda and halfnotes are Rust, and Alice and UD are TypeScript.

**Ship through PRs where CI runs.** Push straight to `main` only in repos without CI. The PR is where CI and the review record meet. The mechanics are in the global `AGENTS.md`.

## Departures

A project may break a principle on purpose. It says so in a `## Departures` section of its `AGENTS.md`, naming the principle and the reason:

```markdown
## Departures

- Projects meet through files, CLIs and JSON schemas: the web app imports the API's generated client, because both ship in one deploy.
```

A departure that isn't written down is a bug, and a reviewer should flag it.

## Changing this page

A principle goes in only after it has decided something in at least two projects, and it lists those decisions. A principle nobody has cited in a year gets reviewed, and either gains a new example or leaves.
