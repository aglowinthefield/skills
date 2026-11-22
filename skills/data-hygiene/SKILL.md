---
name: data-hygiene
description: Find stored data that breaks a rule the code assumes, measure how many rows break it on real data, and draft one issue per finding. Covers backfills that never finished, one rule defined twice (app code and SQL), writes that skip the normalizer, collation traps, readers filtering on a value writers stopped writing, and identity twins. Use when asked for a "data hygiene" audit, "where else does this happen", "sweep for siblings" after fixing a bug of this kind, or when a fix needed a backfill. Not for schema style, missing foreign keys, or index tuning.
---

# Data hygiene

One class of bug, hunted on purpose: **a rule about stored data that some rows or some code paths break, while other code quietly copes.** The coping code hides the gap, so nothing fails. Results are just slightly wrong, or paid for twice.

A finding has four parts. Without all four it isn't a finding:

1. **Rule.** One sentence about stored data: "every tag carries `key = normalize(text)`".
2. **Enforced.** The write paths that keep it (path:line).
3. **Broken.** The rows or write paths that don't (a measured count, or a path shown to write a bad row).
4. **Coping.** The read-side code that covers for the gap (path:line). This is usually what the fix deletes.

The audit changes nothing. It writes a report with draft issues, and the user picks which to file.

## Modes

- **Audit:** "data hygiene audit". Runs every signal over the whole repo.
- **Sweep:** "sweep for siblings of <rule>", run after fixing a bug of this class. Runs only the signals the fixed bug matched, plus the rule's own other copies. The `build` skill calls this when its task fixed one.

## 0. Load private state

The method is public; what it finds is not. Private state lives in the vault, never in this skill's folder:

- `$DEV_VAULT/Data hygiene/ledger.md`: hits per signal across every repo, and runs since each signal's last hit.
- `$DEV_VAULT/Data hygiene/repos/<repo>.md`: data access, database locale and collation, ORM and schema file, table owners (Personas or teams), patterns known to be harmless here, and where reports go. Keep it under 40 lines. On a repo's first run, write it at the end.

`$DEV_VAULT` falls back to `~/Documents/somewhere.garden`. Never write repo names, counts or paths from a private repo into this skill's files.

## 1. Find candidates

Read `references/signals.md`. Each signal gives its code shapes, the rule it implies, a query template, and known false positives. Run one read-only explorer per signal, in parallel when subagents are allowed. Every explorer reads the default branch (`git show origin/main:<path>`), never a dirty checkout. Each candidate it returns must carry:

- the rule, the enforcing writes, the coping code (path:line each)
- one counting query, read-only, against the real schema, with its denominator
- what users or the budget suffer

Skip anything the repo file or an open issue already covers, and say so in one line.

## 2. Measure

No candidate becomes an issue without a measurement. One measurer runs every query against real data:

- **Production read access** (a read-only fork, replica or snapshot): counts are `MEASURED`, with the source id and date.
- **Staging only:** counts go in the report labelled `STAGING` and never into a draft issue.
- **No access:** stop after step 1 and hand over the candidates with their queries.

Every query is read-only with a statement timeout, and returns aggregates only: counts, group counts, dates, a few example values that show the problem, never personal data. Prefer exact counts. A sampled count states its n.

A count of 0 drops the candidate, with one exception. A write path the code shows can write a bad row is **latent**, and it stays. Prove it with a rolled-back write or a db-test, and say which.

## 3. Rank

1. Wrong results users see. Safety and privacy come first.
2. What the gap costs: paid API spend in dollars, extra queries or lookups the coping code runs, latency.
3. Rows affected.

Put effort (S/M/L) beside the rank, never in it. Row count alone is the weakest reason a finding matters.

## 4. Report and drafts

Write one vault report following the vault-writing skill, in the folder the repo file names. It opens with the ranked findings in one picture. Then:

- **One card per finding:** rule, enforced, broken (count / denominator, `MEASURED`), coping, impact, effort, and the **guard level**: make it impossible (constraint, type, one shared definition), make CI catch it (db-test that seeds a violating row and fails), backfill plus guard, or a note. A backfill without a guard is never the recommendation. The rows go bad again.
- **Draft issues:** one per finding, ready for `gh issue create`. Each has the problem with its count, the rule as a proposed invariant for the owning domain, acceptance criteria, and the counting query as the after-deploy check, expected 0. A backfill becomes its own task in the plan, ordered before any task that deletes coping code.
- **Latent** findings, then a collapsed **checked, clean** list with each zero count, then a collapsed **how this was measured**.

Set `status: needs-review`, give the user the path, and wait.

## 5. Update the ledger

For each signal: add a hit line (repo, date, rule, count, ref) or increment its runs-since-hit. A signal that reaches **3 runs without a hit** across all repos is proposed for removal in the report. A new shape that produced a measured finding and fits no signal gets proposed as a new signal, scrubbed of private detail before it goes into `references/signals.md`.

## Don'ts

- Don't file issues, open PRs or write to any database. The report is the output.
- Don't count a finding from code reading alone. "Probably affects many rows" is a query you haven't run yet.
- Don't widen the class. Missing indexes, naming, unused columns and foreign keys belong to other audits.
