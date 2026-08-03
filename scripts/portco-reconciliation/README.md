# PortCo reconciliation foundation

This directory defines the fail-closed artifact contracts and application
workflow used to recover the manager census, reconcile it against production
and evaluated seed snapshots, and apply only a validated, hash-bound change.
Every command is read-only or dry-run by default; the apply path requires its
explicit write token and all release safeguards described below.

Core invariants:

- Every artifact is a strict, versioned JSON shape with a reproducible SHA-256.
- The canonical ledger covers each recovered holding, production company, and
  evaluated seed company exactly once.
- Company-key matches are candidates only; they never authorize a merge.
- An approval binds the proposal, production snapshot, current company
  snapshot, and exact after-image.
- An apply receipt can be finalized only from an approved proposal and proves
  identical database and seed after-images.
- The manifest permits at most one research, release, apply, or verification
  task in flight.

The deterministic Markdown renderers are local review views. JSON remains the
machine-readable source of truth.

## Sequential execution manifest

The ledger-run manifest and proposal index are immutable planning artifacts.
`execution-control-cli.ts` derives a separate, hash-bound execution manifest
that records operational progress without editing either source. The execution
state machine is:

```text
PENDING -> ACTIVE -> PROPOSED -> AWAITING_APPROVAL -> RELEASING
        -> APPLYING -> VERIFYING -> COMPLETED
```

`VERIFIED_NO_CHANGE`, `EXCLUDED`, `DEFERRED`, and `SUPERSEDED` are resolved
terminal outcomes. `FAILED` and `BLOCKED` are hard stops: the same task must be
retried to `ACTIVE` or explicitly moved to `DEFERRED`; they never permit a later
company to start. All active/research/release/apply states count as in flight,
and both the library and file-locking CLI enforce concurrency of exactly one.

Initialize a derived run and inspect its next task:

```sh
npm run portco:reconciliation:control -- init \
  --source-manifest=audits/portco-reconciliation/2026-08-03/ledger-run-v4-repo-only/manifest.json \
  --proposal-index=audits/portco-reconciliation/2026-08-03/ledger-run-v4-repo-only/proposal-index.json \
  --output=audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json \
  --created-at=2026-08-03T16:30:00.000Z

npm run portco:reconciliation:control -- status \
  --manifest=audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json

npm run portco:reconciliation:control -- next \
  --manifest=audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json \
  --activate \
  --at=2026-08-03T16:31:00.000Z
```

Before drafting a proposal, capture a fresh production baseline plus the exact
target company, evaluated seed entry, ownership, pending transaction, fund,
organization, citation, redirect, and company-revision dependencies. The
database URL is read only from the named environment variable, its host and
database are independently pinned, and all production queries run in
repeatable-read, database-enforced read-only transactions:

```sh
PORTCO_PRODUCTION_DATABASE_URL='<secret>' \
npm run portco:reconciliation:control -- snapshot \
  --manifest=audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json \
  --as-of=2026-08-03 \
  --production-output=audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0002-ec-waste/production-snapshot.json \
  --output=audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0002-ec-waste/task-snapshot.json \
  --context-output=audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0002-ec-waste/context.json \
  --database-url-env=PORTCO_PRODUCTION_DATABASE_URL \
  --database-target-label=production-readonly \
  --expected-host='<independently verified host>' \
  --expected-database='<independently verified database>'
```

The proposal binds the production baseline and full company before-image. When
the proposal is recorded, the execution manifest additionally locks the task
snapshot artifact and its target/dependency state digest. Release and apply
transitions require the expected lock hash and a freshly recaptured task
snapshot with the same state digest. Capture time and the newly serialized
production artifact may change; target, seed, database revision, or dependency
changes fail as stale.

Generate a deterministic proposal from the locked task context and a narrow
research decision specification. The generator accepts scalar company-field,
ownership-period, and milestone patches (or a complete after-image), rejects
unknown relation IDs and unresolved mutating proposals, and writes new files
exclusively so an existing proposal cannot be overwritten:

```sh
npm run portco:reconciliation:proposal -- \
  --context=<task-context.json> \
  --spec=<research-decision.json> \
  --json=<new-proposal.json> \
  --markdown=<new-proposal.md>
```

If an attempt fails or becomes blocked, retrying the same task clears its
volatile snapshot, proposal, approval, receipt, decision, and company-snapshot
references before a fresh attempt begins. Durable history remains in the
manifest; no artifact from a failed attempt can satisfy the new attempt.

For this run, the user's standing instruction removes the per-company approval
gate. Install the immutable authorization policy once, then use `auto-approve`
after every proposal validates and a fresh observed task snapshot proves that
the target and its dependencies have not changed. The command creates the same
hash-bound approval artifact required by the protected release and advances the
task to `RELEASING`; it refuses proposals with unresolved questions, missing
after-images, or stale state:

```sh
npm run portco:reconciliation:control -- install-policy \
  --manifest=audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json \
  --policy=audits/portco-reconciliation/2026-08-03/execution-v1/approval-policy.json \
  --at='<ISO-8601 timestamp>'

npm run portco:reconciliation:control -- auto-approve \
  --manifest=audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json \
  --proposal=audits/portco-reconciliation/2026-08-03/proposals/0002-ec-waste-v1/proposal.json \
  --output=audits/portco-reconciliation/2026-08-03/approvals/0002-ec-waste-v1.json \
  --reviewed-at='<ISO-8601 timestamp>' \
  --observed-task-snapshot='<fresh task-snapshot.json>' \
  --expected-task-snapshot-sha256='<locked task snapshot SHA-256>'
```

The legacy `decide` command remains available for explicitly manual runs and
for recording a reviewer-directed rejection or deferral, but it is not a gate
in the active automatically authorized run.

Historical successful writes are recovered only from the complete proposal,
approval, pre-write company snapshot, and apply receipt chain. Recovery verifies
the receipt's database, seed, and public-detail API results and stores its
transaction and durable `AuditEvent` identifiers. For example:

```sh
npm run portco:reconciliation:control -- recover \
  --manifest=audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json \
  --proposal=audits/portco-reconciliation/2026-08-03/proposals/0001-amwaste-llc-v4/proposal.json \
  --approval=audits/portco-reconciliation/2026-08-03/approvals/0001-amwaste-llc-v4.json \
  --company-snapshot=audits/portco-reconciliation/2026-08-03/company-snapshots/0001-amwaste-llc-production.json \
  --receipt='<downloaded protected-workflow apply-receipt.json>' \
  --receipt-location='https://github.com/mikeberry6/Infra-MA2/actions/runs/30827237947' \
  --workflow-run-url='https://github.com/mikeberry6/Infra-MA2/actions/runs/30827237947' \
  --at=2026-08-03T16:32:00.000Z
```

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
separately validated `RESOLVE_PENDING_TRANSACTION` action.

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

If a staged proposal fails before production application and a corrected
proposal for the exact same task is subsequently staged, remove only the old
entry with `--supersede-staged-seed`, supplying both proposal/approval pairs.
The command refuses cross-task replacement and proves that both immutable
entries are present and unchanged before rewriting the local seed overlay.

Production application is intentionally a second step. The exact staged seed
artifact must first be committed and pushed. The production command
then additionally requires the explicit `APPLY_APPROVED_PORTCO_CHANGE` token,
an independently pinned database target, the protected approval hash, a new
receipt path, and the public detail API URL. It executes through the project's
serializable transaction wrapper, writes the revision and audit event, verifies
the exact Prisma after-image, and verifies the render-critical public API
projection before a receipt can be created. The protected production approval
value is supplied only by the protected workflow after it verifies the standing
authorization, the exact proposal, the fresh snapshot, and the deployed release.

Production writes run only through
`.github/workflows/portco-reconciliation-apply.yml` from protected `main` after
the matching release is serving the canonical production URL. The workflow
binds the merged pull request, required build, deployed SHA, committed proposal,
approval, production snapshot, and seed overlay; proves a clean migration state;
runs a fresh dry run; and then performs one hash-bound transaction under the
protected `production` environment. Its receipt and verification reports are
retained as workflow evidence. Do not run the production apply from a feature
branch or an unverified local checkout.
