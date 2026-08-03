# PortCo reconciliation foundation

This directory defines the fail-closed artifact contracts and application
workflow used to recover the manager census, reconcile it against production
and evaluated seed snapshots, and apply only an individually approved change.
Every command is read-only or dry-run by default; the apply path requires its
explicit write token and all release gates described below.

Core invariants:

- Every artifact is a strict, versioned JSON shape with a reproducible SHA-256.
- The canonical ledger covers each recovered holding, production company, and
  evaluated seed company exactly once.
- Company-key matches are candidates only; they never authorize a merge.
- An approval binds the proposal, production snapshot, current company
  snapshot, and exact after-image.
- An apply receipt can be finalized only from an approved proposal and proves
  identical database and seed after-images.
- The manifest permits at most one research, approval, apply, or verification
  task in flight.

The deterministic Markdown renderers are local review views. JSON remains the
machine-readable source of truth.

## Read-only baseline snapshots

`snapshot-cli.ts` creates the two immutable baselines consumed by the ledger.
It never falls back from the requested production database to seed data.

Production access is fail-closed: the connection URL must come from an
environment variable, the expected host and database must be supplied
independently, and the transaction starts with PostgreSQL `SET TRANSACTION READ
ONLY` under repeatable-read isolation. The artifact stores only a caller-chosen
target label and a SHA-256 of host, port, and database. Usernames, passwords,
and the connection URL are never written to the artifact or normal output.

The production read captures every Company row and exact per-company counts for
ownership periods, pending ownership transactions, milestones, management
roles, citations, and canonical redirects. Each family is cross-checked against
its whole-table count inside the same transaction, so a partial relation read
fails instead of producing a snapshot.

Before the pending-transaction migration is installed, production snapshotting
fails by default. `--legacy-schema` is the only opt-in compatibility path: the
CLI first confirms through PostgreSQL catalog feature detection that the
`PendingOwnershipTransaction` table is actually absent, then records zero for
that relation. If the table exists, real pending-transaction counts are still
queried and cross-checked even when the flag is present. Use a target label such
as `production-readonly-legacy`; a legacy snapshot is rejected unless the label
visibly contains `legacy`, keeping that limitation inside the hashed artifact.

The seed read imports `prisma/seed-data/companies.ts`, which evaluates the base
seed and `approved-portco-after-images.json` overlay before hashing. It models
the seed runner's exact relation deduplication and records approved canonical
redirects. It performs no seed or database mutation.
The current seed format has no evidence-complete pending-transaction array, so
its pending-transaction count is explicitly zero; owner `transactionState`
alone is not promoted into a durable transaction.

Create both baselines atomically in a new run directory:

```sh
PORTCO_PRODUCTION_DATABASE_URL='<secret connection URL>' \
npx tsx scripts/portco-reconciliation/snapshot-cli.ts both \
  --as-of=2026-08-03 \
  --run-dir=audits/portco-reconciliation/2026-08-03/snapshots \
  --database-url-env=PORTCO_PRODUCTION_DATABASE_URL \
  --database-target-label=production-readonly \
  --expected-host='<independently verified host>' \
  --expected-database='<independently verified database>'
```

For one source, use `production --output=<new-file.json>` or
`seed --output=<new-file.json>`. Output files and run directories must not
already exist; snapshots are written through same-filesystem staging and never
silently overwritten. `--as-of` is required and must be a real calendar date.

Signed but unclosed ownership changes live in the company after-image as
`pendingOwnershipTransactions`, separate from legal ownership periods. This
keeps the incumbent owner active, prevents an incoming buyer from appearing as
a closed owner, and makes the later closing or termination an explicit,
individually approved `RESOLVE_PENDING_TRANSACTION` action.

Legacy before-images may contain milestones or management roles whose source
association was never stored by the original schema, so their nested
`evidenceUrls` may be empty during Phase 1 preservation. New or changed facts
still require proposal evidence; the separate scorecard research schema
requires direct source IDs for every enriched milestone and executive.

## Superseding census reconciliation inputs

The historical accepted census JSON remains immutable. The first recovered
wrapper intentionally omitted the accepted result's `repoOnlyRecords`; use the
v2 input builder to create a new, hash-bound derivative rather than editing
those wrappers or the 100 accepted results:

```sh
npm run portco:reconciliation:inputs -- \
  --accepted-dir audits/portfolio-census/2026-07-28 \
  --recovered-dir audits/portfolio-census/2026-07-28/recovered-inputs \
  --recovery-report audits/portfolio-census/2026-07-28/recovery-report.json \
  --manager-universe scripts/research/manager-universe.json \
  --output-dir audits/portfolio-census/2026-07-28/reconciliation-inputs-v2 \
  --generated-at 2026-08-03T16:00:00.000Z
```

The command is atomic and refuses to overwrite its output. It verifies each
accepted JSON byte hash and accepted-response hash, preserves all 202 repo-only
judgments with deterministic manager-scoped IDs, assigns deterministic lineage
IDs to all 484 excluded candidates, and asserts the fixed 100-manager aggregate
before publishing its manifest.

Ledger v2 keeps one row per repo-only judgment but never treats it as automatic
merge authority. Exact repo matches are folded into the canonical company's
single proposal task: `PROPOSED_RETIRE` adds an ownership-period retirement
review without realizing the company, and `MATCHED_ELSEWHERE` adds an explicit
consolidation review. `OUT_OF_SCOPE`, `NEEDS_REVIEW`, and
`UNVERIFIED_EXISTING` remain blocked review questions. A repo-only identity
with no exact snapshot match gets a separate non-mutation review task. Every
repo-only source ID appears in the queue exactly once, while exclusions remain
audit lineage only and cannot create a write by themselves.

## Approved application

`apply-cli.ts` defaults to a read-only dry run. It verifies the proposal,
approval, production snapshot, current full-company image, and database target
before returning a mutation plan. It can stage the approved seed after-image
without touching the database:

```sh
npm run portco:reconciliation:apply -- \
  --proposal=<proposal.json> \
  --approval=<approval.json> \
  --production-snapshot=<production-snapshot.json> \
  --proposal-sha256=<proposal hash> \
  --approval-sha256=<approval hash> \
  --snapshot-sha256=<snapshot hash> \
  --stage-seed
```

Production application is intentionally a second step. The exact staged seed
artifact must first be reviewed, committed, and pushed. The production command
then additionally requires the explicit `APPLY_APPROVED_PORTCO_CHANGE` token,
an independently pinned database target, the protected approval hash, a new
receipt path, and the public detail API URL. It executes through the project's
serializable transaction wrapper, writes the revision and audit event, verifies
the exact Prisma after-image, and verifies the render-critical public API
projection before a receipt can be created. Never set the protected production
approval environment value before the user has approved both the exact company
proposal and the production schema/data write.

Production writes run only through
`.github/workflows/portco-reconciliation-apply.yml` from protected `main` after
the matching release is serving the canonical production URL. The workflow
binds the merged pull request, required build, deployed SHA, committed proposal,
approval, production snapshot, and seed overlay; proves a clean migration state;
runs a fresh dry run; and then performs one hash-bound transaction under the
protected `production` environment. Its receipt and verification reports are
retained as workflow evidence. Do not run the production apply from a feature
branch or an unverified local checkout.
