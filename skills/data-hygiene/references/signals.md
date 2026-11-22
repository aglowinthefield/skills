# Signals

Each signal is a code shape that has found a real, measured instance of the class. A signal earns its place with a hit and loses it after 3 runs without one (counted in the private ledger). Examples below are scrubbed: no repo names, paths or exact counts from private work.

Queries are Postgres. Adapt the dialect, keep the shape: count violating rows and the denominator.

## S1. Coping with old rows

**Shape.** Comments like "until the backfill", "not yet backfilled", "rows written before", "legacy", "predate". `COALESCE(new_col, fallback)` or `new_col IS NULL OR …` over a column every current write sets. Dual reads: new field, else old field. A second lookup "for rows without X".

**Rule it implies.** Every row has `new_col` set the way current writes set it.

**Query.** `SELECT count(*) FILTER (WHERE new_col IS NULL), count(*) FROM t WHERE <rows the rule covers>;` Split by created date to show whether new rows still break it. If they do, it's S3, not S1.

**False positives.** NULL that means something on purpose ("never classified" is a state, not a gap). Then check every reader treats it as that state. One that reads "unclassified" as "clean" is a finding of its own.

**Example.** A related-items query looked tags up twice, by stored key and by raw text, because a third of rows predated the key. The backfill let the second lookup be deleted.

## S2. One rule, two definitions

**Shape.** The same normalization in app code and in a SQL template (lowercase, trim, slug, URL canonicalization, possessive stripping, hashing), or copies in two packages or clients. Its output is stored, or compared against stored values.

**Rule it implies.** Both definitions give the same result for every stored input.

**Query.** Compute both forms in SQL where you can, and count rows where they differ. Where you can't, run the app definition over a sample exported to a script, and say the n.

**False positives.** Copies that never meet, because one is display-only and nothing compares it with stored data.

**Example.** A URL dedupe key had five builders across upload, paste, import and forum paths. The same page became several records, each enriched by a paid API.

## S3. Bypassed writer

**Shape.** A column with a stamping or normalizing helper (`withX`, `normalizeX`, a typed writer). List every write to that column: ORM inserts and updates, raw SQL, scripts, data migrations. Any write that skips the helper is a candidate.

**Rule it implies.** Every row written satisfies what the helper guarantees.

**Query.** Count rows that break the guarantee, split by writer where a column tells you which (`source`, `createdBy`, a NULL that only the bypass leaves). If the count is 0, prove the bypass with a rolled-back write and keep it as latent.

**False positives.** A bypass that writes a value the helper would leave unchanged.

**Example.** A backfill script raw-inserted cost-ledger rows without the typed writer, leaving three quarters of one tier's rows without a start time.

## S4. Collation trap

**Shape.** `lower()`, `upper()`, `ILIKE` or a case-insensitive regex used for identity or matching (lookups, dedupe, joins, unique indexes on `lower(col)`), especially compared against a value folded in app code. Under the `C` collation, SQL folds ASCII only, while app runtimes fold Unicode.

**Rule it implies.** SQL's fold equals the app's fold for every stored value.

**Query.** `SELECT count(*) FILTER (WHERE lower(col) <> lower(col COLLATE "und-x-icu")), count(*) FROM t;`. Then group by the ICU fold, `HAVING count(DISTINCT lower(col)) > 1`, to find twins it already created.

**Fix note.** An explicit ICU collation on the result changes which indexes the comparison can use. Relabel it back (`… COLLATE "und-x-icu") COLLATE "default"`) and EXPLAIN the callers.

**False positives.** Columns forced to ASCII at write time: check the writer, then count non-ASCII rows.

**Example.** A tag key computed in SQL kept non-ASCII capitals while the app's key lowercased them, splitting about 0.2% of tags into twins.

## S5. Identity twins

**Shape.** Rows meant to be unique by a natural identity (normalized title and type, URL, content hash, external id, an R2/S3 key) with no unique constraint on that normalized form. Read-side dedupe (`DISTINCT ON`, "pick the lowest id", collapse-copies helpers) implies twins exist. Also check `ON CONFLICT DO NOTHING` whose target index no migration creates.

**Rule it implies.** One row per identity.

**Query.** `SELECT count(*) AS groups, sum(n - 1) AS extra FROM (SELECT identity, count(*) n FROM t GROUP BY 1 HAVING count(*) > 1) g;`. Then price the extras when each one triggered paid work. For conflict targets, read `pg_indexes` on production before trusting the schema file.

**False positives.** Twins by design, such as per-user copies of a shared object, when the design says so.

**Example.** Copies of one image saved by different users were separate records, each run through paid enrichment and only collapsed at read time.

## S6. Stale reader

**Shape.** A reader that filters on a literal value (`tier = 'x'`, `kind = 'old_name'`, a status) that writers renamed or stopped writing. Tests stay green because their fixtures seed the old value.

**Rule it implies.** Every value a reader filters on is still written.

**Query.** `SELECT value, min(created_at), max(created_at), count(*) FROM t GROUP BY 1 ORDER BY 3 DESC;` If the reader's value has a `max` before the writer change, its signal has gone silent.

**False positives.** A reader built only for historical rows, saying so.

**Example.** A confidence signal filtered on a tier name the pipeline had renamed eight weeks earlier. The admin page showed the signal as false for every new record, and four fixtures still seeded the old name.
