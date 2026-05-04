# Context-Window Execution Plan

Purpose: keep the portfolio investment-year review running smoothly even when Codex context compacts or a new thread is required.

## Non-Negotiable Reality

Codex cannot remove the model context-window limit from inside a thread. The fix is operational: never let the thread be the source of truth. The source of truth for progress, decisions, evidence, and the next queue must live in repository files that can be reopened after any reset.

## Durable State Files

- `continuation-state.md`: current audit status, active queue position, restart protocol, and next firm cluster.
- `batch-XX.md`: human-readable evidence notes for each reviewed batch.
- `master.csv`: full owner-company queue produced by `npm run audit:portfolio-years`.
- `flagged.csv`: current flagged queue produced by the audit.
- `findings.json`: machine-readable audit output for scripted lookups.
- `summary.md`: latest audit counts and priority summary.
- `context-window-execution-plan.md`: this runbook.

If context is lost, resume by reading only these files first:

1. `continuation-state.md`
2. Latest `batch-XX.md`
3. `summary.md`
4. `flagged.csv`
5. The next small slice of `master.csv`

Do not reconstruct progress from chat history.

## Execution Unit

Use firm clusters as the unit of work. Each cluster should be small enough to fit comfortably in a fresh context window:

- Target: 4-12 owner-company rows per cluster.
- Maximum: 20 owner-company rows before a checkpoint, even if the firm has more rows.
- For large firms, split by line range or sector.
- Keep only the active company blocks and source snippets in working context.

## Checkpoint Cycle

For every cluster:

1. Read the next rows from `master.csv`.
2. Inspect only the matching company blocks in `prisma/seed-data/companies.ts`.
3. Search/open public sources directly.
4. Decide owner-by-owner:
   - change only when evidence is clear;
   - leave unchanged and document uncertainty when evidence is weak;
   - do not rely on snippets.
5. Apply data edits, if any.
6. Run `npm run audit:portfolio-years`.
7. Append decisions to the current `batch-XX.md`.
8. Update `continuation-state.md` with:
   - latest audit timestamp;
   - flagged count;
   - completed cluster;
   - exact next cluster.

This checkpoint must happen before moving to the next cluster.

## Context Budget Rules

- Do not paste long source text into chat.
- Do not keep more than one cluster in active reasoning memory.
- Do not summarize every prior batch in chat; rely on batch files.
- Use compact commentary updates.
- Store all durable decisions in files immediately after the audit rerun.
- If a source is long, record URL, date basis, decision, and rationale in the batch note rather than copying source prose.

## Restart Protocol

When a new thread starts or context compacts:

1. Open `continuation-state.md`.
2. Open the latest `summary.md`.
3. Open the latest `batch-XX.md` tail.
4. Open the next cluster from `master.csv`.
5. Continue from the saved queue without re-reviewing completed clusters unless the saved state says a cluster was incomplete.

The first response after restart should be concise:

> I reloaded the durable state. Latest audit: [rows] rows, [flagged] flagged. Last completed cluster: [firm]. Resuming with [next firm/rows].

## Batch Note Standard

Every batch note must include:

- reviewed company/owner rows;
- stored year and top-level year;
- implemented changes;
- unchanged high-conviction confirmations;
- unresolved/no-edit cases;
- date basis: close, financial close, completion, effective date, or announcement fallback;
- source URLs;
- rationale;
- post-batch audit result.

## Data-Edit Standard

For each implemented change:

- update `owners[].investmentYear`;
- update top-level `investmentYear` only for the primary displayed owner;
- add or adjust a same-year investment milestone;
- ensure milestone category is `Acquisition` for stake/control purchases or `Financing` for equity/growth/financial-close events;
- add a clearly labeled source:
  - `Close date source — [Owner] — [Company]`
  - `Investment date source — [Owner] — [Company]`
  - `Announcement date source — [Owner] — [Company]`

## Validation Cadence

- After every cluster: `npm run audit:portfolio-years`.
- After every 3-5 clusters: review `summary.md` and `flagged.csv` for unexpected new flags.
- Before final reporting:
  - `npm run audit:portfolio-years`
  - `npm run validate-portfolios`
  - If `validate-portfolios` fails due to sandbox IPC issues, run the equivalent direct Node validation path and document the limitation.

## Failure Handling

If context window failure happens again:

- do not restart the database review;
- do not ask the user for guidance;
- reload durable state files;
- continue from the next saved cluster;
- if a cluster was mid-review and not checkpointed, restart only that cluster.

## Current Queue Policy

The remaining 20 flagged rows are already reviewed and documented as unresolved unless later public evidence is found. Continue the full-database verification through unflagged rows in `master.csv`, using firm clusters and checkpointing every cluster.

