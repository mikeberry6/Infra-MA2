# InfraSight Operations Handbook

## Service inventory

| Service | Production resource |
| --- | --- |
| GitHub | `mikeberry6/Infra-MA2` |
| Vercel | team `mberry`, project `infra-ma-2` |
| Application | `https://infra-ma-2.vercel.app/Infra-MA2` |
| Database | Neon/Postgres, production endpoint held only in protected secrets |

The application keeps the `/Infra-MA2` base path. `main` is the protected default branch and the only branch Vercel may track for production builds. Automatic production-domain assignment must remain disabled so merging code cannot race schema deployment.

Use Node 24.x, npm 11.x, and `package-lock.json` exclusively. Do not commit pnpm workspace files or a second lockfile unless a separately reviewed package-manager migration authorizes them.
The committed `.npmrc` enables `engine-strict`, so installs fail instead of silently proceeding on an unsupported runtime.

## Required configuration

No workflow should infer a database target from a generic URL. `scripts/assert-database-target.ts` requires an exact approved host and database plus at least one forbidden opposite-environment host before any migration or pipeline write.

### GitHub Actions secrets

| Name | Scope | Purpose |
| --- | --- | --- |
| `MIGRATION_DATABASE_URL` | CI only | Direct, branch-scoped connection string for an isolated Neon validation branch |
| `E2E_ADMIN_EMAIL` | CI only | Administrator on the isolated validation branch |
| `E2E_ADMIN_PASSWORD` | CI only | Strong, unique validation password; never use a production credential |
| `DATABASE_URL` | production workflows | Production pooled connection string |
| `PRODUCTION_MIGRATION_DATABASE_URL` | protected production environment | Direct production connection used only by schema staging |
| `VERCEL_TOKEN` | production environment | Token limited to the InfraSight Vercel project/team |
| `FRED_API_KEY`, `EIA_API_KEY`, `SAM_API_KEY` | pipeline workflows | Required dashboard provider API credentials |
| `SEC_USER_AGENT` | pipeline workflows | Required SEC identity string with a monitored contact email |
| `APIFY_TOKEN` | default-branch research dispatch | LinkedIn research candidate collection |

### GitHub Actions variables

| Name | Value |
| --- | --- |
| `MIGRATION_DATABASE_HOST` | Exact hostname parsed from `MIGRATION_DATABASE_URL` |
| `MIGRATION_DATABASE_NAME` | Exact database name parsed from `MIGRATION_DATABASE_URL` |
| `PRODUCTION_DATABASE_HOST` | Exact hostname parsed from production `DATABASE_URL` |
| `PRODUCTION_DATABASE_NAME` | Exact production database name required by unattended write workflows |
| `PRODUCTION_MIGRATION_DATABASE_HOST` | Exact hostname parsed from `PRODUCTION_MIGRATION_DATABASE_URL` |
| `VERCEL_SCOPE` | `mberry` |
| `VERCEL_TEAM_ID` | Optional immutable `team_...` identifier for team-owned projects; leave unset for a personal-account project |
| `VERCEL_PROJECT_ID` | Immutable Vercel project ID for `infra-ma-2` (for example, `prj_...`), not the display name |
| `PRODUCTION_URL` | Protected canonical origin `https://infra-ma-2.vercel.app`; never accept this from a workflow dispatcher |
| `SEC_WATCHLIST_CIKS` | Optional comma-separated `CIK:Name` SEC dashboard watchlist override |
| `DASHBOARD_WRITES_ENABLED` | Explicitly `false` during production schema staging and every dashboard cutover apply/rollback; `true` only after the post-cutover all-source dry-run artifact passes review |

The validation and both production host variables must differ where Neon uses distinct pooled/direct endpoints; validation guards deny both production hosts. Every mutation workflow requires an exact database name as well as its expected host. `DATABASE_URL` is a repository Actions secret because unattended schedules require it. Keep `PRODUCTION_MIGRATION_DATABASE_URL` and `VERCEL_TOKEN` in the GitHub `production` environment with a required reviewer. Never expose production secrets to pull-request jobs.

Vercel Preview must use the validation database and preview-only NextAuth settings. Vercel Production must use the production database, canonical `NEXTAUTH_URL`, and a separate `NEXTAUTH_SECRET`. Preview and production must not share writable database credentials.

## Release gate

`.github/workflows/deploy.yml` has three jobs:

1. `quality` runs locked installation, Prisma generation/validation, lint, typecheck, all Vitest tests, offline portfolio and weekly-email validation, production dependency audit, and a production build.
2. `validation` serializes access to the isolated Neon branch, proves the database target, deploys migrations, checks both migration status and schema drift, verifies data/source integrity, builds against the migrated schema, creates a validation-only administrator, and runs Playwright journeys, axe checks, responsive checks, keyboard behavior, and visual baselines. Migration logs and browser failure media are retained for 30 days.
3. `build` is the stable branch-protection context. It succeeds only if both preceding jobs succeed.

The Release Gate runs only for pull requests targeting `main` and pushes to `main`. It does not expose a same-named required check through feature-branch pushes or manual dispatch. Require `build` on `main`, one approving review, resolved conversations, linear history, and no force-pushes or deletion. A clean checkout must pass; local untracked files are never an input to CI.

The migration gate accepts only newly added `prisma/migrations/*/migration.sql` files between the event base and release. It normalizes aliases to full commit SHAs, rejects mutation or transforming DDL, reads SQL from the release commit rather than the working tree, and hashes the policy plus ordered committed blobs into the manifest. Foreign-key `ON DELETE`/`ON UPDATE` actions inside a new additive constraint are permitted; standalone data mutation is not.

The validation database guard requires `MIGRATION_DATABASE_HOST` and `MIGRATION_DATABASE_NAME` and denies both production endpoints. Before strict source/canonical gates can fail, CI writes reviewer-neutral all-status company-merge, ownership-to-fund-link, Fund primary-source, deal seller-disclosure, and citation templates. If fixed reviewed files exist at `audits/approvals/company-merges.json`, `audits/approvals/ownership-fund-links.json`, `audits/approvals/fund-primary-sources.json`, `audits/approvals/deal-seller-disclosures.json`, and `audits/approvals/primary-citations.json`, CI hashes and applies them only to the isolated validation database, in that order, before strict checks. Reruns are idempotent and require the exact prior audit for an already-applied decision.

Use staged review passes when merges can change ownership or citation candidates: commit the reviewed company file first, let validation apply it and regenerate the ownership-link and citation templates, then review and commit those post-merge files. Deal seller treatment is independent of company merging, but its immutable snapshot must still match the current deal, participants, and source evidence. Do not approve a stale template. Ownership-link remediation can only link an exact normalized vehicle name to a reviewed fund or remove a stale fund link; it never changes the vehicle label or underlying ownership assertion. Seller-disclosure remediation never infers a seller or absence classification and updates only `sellerDisclosureStatus` and `sellerDisclosureReason`. This process allows the gate to become green without weakening it; production still requires the protected manual remediation workflow.

Run the local portion before pushing:

```bash
npm ci
npm run db:generate
npm run db:validate
npm run lint
npm run typecheck
npm test
npm run validate-portfolios
npm run validate-weekly-email
npm run audit:prod
npm run build
npm run check:bundle-budget
```

Database and authenticated browser checks require the isolated branch and therefore run in GitHub Actions or an equivalently configured local environment. `npm run doctor` checks local GitHub/Vercel access and common configuration names.

Administrative deal, fund, company, user, source, audit, and dashboard-signal review lists use a fixed 25-row server-side page. The current page is addressable as `?page=N`; missing or malformed values resolve to page 1, and values beyond the result set resolve to the last available page. Confirm previous/next navigation and browser back/forward behavior during authenticated preview testing; pagination does not alter the existing role guard.

## Protected production release

Production schema staging, reviewed data remediation, promotion, rollback, and every scheduled or on-demand data-pipeline run are serialized by the repository-wide `production-release` concurrency group. Production mutation workflows are additionally protected by the GitHub `production` environment.

- `scripts/verify-release-provenance.ts` requires the checkout and fetched `origin/main` to equal the requested full SHA, confirms through GitHub that `main` is protected and still points to that exact SHA, and accepts only a successful `build` check produced by the `github-actions` app.
- **Stage Production Schema** binds two independently verified baselines: the SHA of the application currently serving the protected canonical production origin and the SHA whose migration names and checksums exactly match production's successfully applied migration ledger. Both must independently be ancestors of the release; the migration baseline may be newer than the still-live application after an earlier schema-first stage. The workflow requires `DASHBOARD_WRITES_ENABLED=false`, verifies the live Vercel project, repository, scope, and Git SHA, rechecks the live app and migration ledger immediately before writing, applies additive migrations, and proves the post-write ledger exactly matches the release. It emits reviewer-neutral, migration-timestamp-bound dashboard methodology and legacy-signal manifests but never applies them. Citation, Fund primary-source, duplicate, ownership-link, seller-disclosure, and dashboard outputs are backlog evidence, not implicit approval.
- **Review or Remediate Release Data** separates reports from mutations. Apply and rollback operations require a committed `audits/approvals/*.json` artifact, its exact SHA-256, protected-environment approval, exact database/release/reviewer/reason targeting, and one explicit operation at a time. Dashboard cutover apply and rollback additionally require `DASHBOARD_WRITES_ENABLED=false`; they preserve `updatedAt`, verify every deterministic row precondition, record an `AuditEvent` in the same serializable transaction, and permit rollback only while the reviewed post-apply rows still match exactly.
- **Promote Production Release** accepts only a ready staged production deployment supplied by its immutable Vercel URL, whose target is `production`, project and scope match protected configuration, GitHub source SHA and repository ID match the release, and health reports its 12-character prefix. It requires clean schema/data/source/pipeline gates, rechecks exact protected-main and candidate provenance immediately before promotion, and promotes the verified deployment ID rather than a mutable alias.

Keep `main` frozen from final manifest review through promotion except for the reviewed approval commits required by this process. Each such commit becomes the new eligible release: regenerate the manifest, wait for its exact-SHA gate and staged production build, and restage. If its migration tree is unchanged, use the previously staged commit as the verified migration baseline; independent ancestry checks allow the stage workflow to prove the current ledger and perform a no-op deploy while the older production application remains active. A Vercel Preview is for pre-merge validation only. With automatic domain assignment disabled, the Git-integrated `main` build is a staged production deployment using production environment values; promoting it changes domains without rebuilding.

## Scheduled and on-demand pipelines

`.github/workflows/data-pipelines.yml` uses production-target guards, the same repository-wide `production-release` lock as staging/remediation/promotion/rollback, bounded timeouts, and retries only when output indicates a transient network/provider error. Scheduled and on-demand jobs must receive the pooled `PRODUCTION_DATABASE_HOST` as the expected endpoint and the distinct `PRODUCTION_MIGRATION_DATABASE_HOST` as an explicit forbidden endpoint; dashboard and news mutation entry points repeat that check before constructing Prisma or recording a `PipelineRun`.

On-demand runs use the repository-dispatch API, never `workflow_dispatch`. GitHub therefore loads the workflow from the protected default branch, and the workflow independently requires the `repository_dispatch` event, `refs/heads/main`, and an exact triggering SHA before any job can receive production credentials. Each downstream job checks out `refs/heads/main` and re-verifies that same authenticated SHA. A dispatch cannot select an arbitrary branch or historical release commit: during a release window, protected `main` must still equal the frozen release SHA or Operations must stop and repeat release preparation.

An authenticated Operations owner can dispatch the four allowlisted data-pipeline operations with these copy-safe commands:

```bash
gh api --method POST repos/mikeberry6/Infra-MA2/dispatches \
  --field event_type=run-data-pipeline \
  --field 'client_payload[pipeline]=dashboard'

gh api --method POST repos/mikeberry6/Infra-MA2/dispatches \
  --field event_type=run-data-pipeline \
  --field 'client_payload[pipeline]=news'

gh api --method POST repos/mikeberry6/Infra-MA2/dispatches \
  --field event_type=run-data-pipeline \
  --field 'client_payload[pipeline]=verify'

gh api --method POST repos/mikeberry6/Infra-MA2/dispatches \
  --field event_type=run-data-pipeline \
  --field 'client_payload[pipeline]=source-audit'
```

Dashboard writes are fail-closed. Configure `FRED_API_KEY`, `EIA_API_KEY`, `SAM_API_KEY`, and `SEC_USER_AGENT`. Before production schema staging, set `DASHBOARD_WRITES_ENABLED=false`; the stage workflow and dashboard cutover apply/rollback operations reject unset or true values. Keep it false until all reviewed cutovers finish, then use the approved repository dispatch to run the `source-audit` pipeline from the current protected `main`. That job runs every dashboard provider in read-only dry-run mode and retains both its log and JSON summary. Operations must confirm that every configured source completed, required metrics are current, representative values agree with the linked official pages, and no credential or source-contract warning remains. Only then may Operations set `DASHBOARD_WRITES_ENABLED=true`, dispatch a live dashboard synchronization from that same protected-main revision, and proceed to promotion; production promotion and scheduled synchronization reject missing credentials or an unapproved write flag. Return the flag to false after any dry-run/live-sync failure or provider-integrity incident. `SEC_WATCHLIST_CIKS` is optional and does not replace the required SEC user agent.

| Pipeline | Schedule | Contract |
| --- | --- | --- |
| Dashboard synchronization | Weekdays at 07:30 America/New_York (DST-safe dual UTC schedule) | Latest success within 30 hours; rolling 30-day success at least 95%; failed/skipped provider rate at most 25%; no critical provider may miss two consecutive refreshes |
| News scan | Daily at 23:30 UTC | Job-pinned 200-entity rotating window (current cycle at most eight days) with a 750-page budget and cycle-plus-two-day lookback; latest success within 36 hours; rolling 30-day success at least 95%; real failed fetch/query rate at most 25%; incomplete required-seed windows fail closed |
| Database/email verification | Sundays at 12:00 UTC | Weekly email and links valid; publication/source gates complete; dashboard/news freshness intact |
| Dependency/source audit | First day monthly at 08:00 America/New_York | No high/critical production advisories; dashboard source contracts and freshness, database citations, company-source coverage, duplicates, and portfolio checks reviewed |

`scripts/verify-pipeline-health.ts` groups retry attempts by the DST-safe Eastern `refreshWindow`, prorates expected run counts from the first recorded run up to a 30-day window, catches stalled attempts, and writes non-sensitive JSON evidence. Its report is `collecting` while operational checks pass but fewer than the required observation days have elapsed, `healthy` only when both operational checks and the complete observation window pass, and `unhealthy` when an operational check fails. `operationallyHealthy` therefore may be true while `healthy` and `exitCriterionMet` remain false. Routine pipeline and verification jobs continue evaluating freshness and failure thresholds during collection; production promotion adds `--require-full-window` for both critical pipelines and fails until the full 30-day window is complete. Never claim the 95% program exit criterion from a prorated or collecting report.

Production promotion checks dashboard freshness against the canonical weekday 07:30 America/New_York schedule, so a Friday success remains current through the weekend and becomes overdue at Monday's scheduled boundary. Other callers retain an explicit maximum-age contract. A successful scan with zero qualifying news items remains valid; source/provider failure is measured separately. News coverage counts real upstream page-fetch and search-query attempts, not the number of companies, funds, or managers being tracked. Dashboard coverage counts only latest `SUCCESS` runs as fully covered; a `PARTIAL` run remains visible with allowlisted missing/stale required-metric IDs and is not silently counted as success.

The nightly news selection is canonicalized by entity type/ID and rotated by a UTC date pinned once before the retry wrapper after any explicit `--target` filter. The default 200-target window completes the current universe in no more than eight days and is stable even when a retry crosses midnight. Candidate acceptance uses the same pinned as-of timestamp, and the effective lookback is always at least the full cycle plus two days. Full/eligible/selected counts, offset, window and cycle metadata, effective lookback, plus initial/discovered/deferred crawl-budget evidence are stored in the summary artifact and `PipelineRun.metadata`. Official site/current-news seeds are round-robined ahead of historical citation URLs. Intentional deferral within this declared bounded contract is transparent but is not a provider failure; missing required seeds, zero attempts, legacy incomplete page-cap records, and real upstream failures above 25% remain unhealthy.

Diagnostic collection is deliberately non-short-circuiting after installation succeeds. News reliability verification runs even when the scan command fails, weekly database/source and pipeline checks aggregate their independent exit codes, and the monthly dependency and database/source audits still execute if the live provider dry run fails. Evidence uploads use `always()` so a primary failure does not erase the summaries needed to diagnose it; the job still exits non-zero when any required check fails.

GitHub Actions failure notifications are the primary alert channel until a dedicated paging integration is approved. The Operations owner must keep notifications enabled for the repository and review a failed dashboard job the same business day. A critical-source failure is escalated to Research, which owns the source contract; two consecutive missed refresh windows, an unresolved freshness breach, or a validation/range failure also requires an incident record under `docs/incidents/` and Engineering review. Preserve the last validated cache throughout the incident, set `DASHBOARD_WRITES_ENABLED=false` if source integrity is uncertain, and re-enable writes only after a clean read-only all-source dry-run and reviewed evidence.

Scheduled news runs treat `NEWS_SCAN_ROTATION_DATE` as a service date: subtracting six hours binds a delayed 23:30 UTC cron execution to its intended day through 05:59 UTC instead of duplicating the next day's window. On-demand dispatches use their actual UTC date.

Pipeline artifacts are retained for 30 days; monthly audit and production release evidence are retained for 90 days. Artifacts must never contain tokens, credentials, imported row contents, or private query data.

The LinkedIn candidate collector is also on-demand through the repository-dispatch API. It executes only `refs/heads/main`, verifies that the checkout matches the triggering default-branch SHA before exposing `APIFY_TOKEN`, uploads review candidates only, and never commits, publishes, or modifies a protected branch:

```bash
gh api --method POST repos/mikeberry6/Infra-MA2/dispatches \
  --field event_type=collect-linkedin-candidates
```

## Publication and source gates

`scripts/source-coverage-report.ts` reports published deals and companies with an explicitly designated primary citation, published Funds with an explicitly reviewed HTTP(S) `primarySourceUrl`, and the `lastVerifiedAt` backlog. Supporting `sourceUrls` and `strategyUrl` values do not satisfy the Fund gate and are never promoted automatically. Release and scheduled verification require 100% source presence. Candidate citation order is deliberately neutral: Research must verify the evidence and name the primary citation explicitly. Never infer a primary source from array, creation, or identifier order.

`npm run db:duplicates:verify` separately fails while any normalized duplicate cluster remains in the published public scope. Citation designation, Fund primary-source designation, company merging, ownership-to-fund-link repair, and missing-seller treatment are reviewed remediation operations, never migration backfills. Generate a report under `tmp/`, review and commit the exact canonical approval JSON, record its SHA-256, create a restore branch before production writes, apply one decision set, and rerun the strict gates. The Fund template contains every published Fund whose designation is absent or invalid, lists only credential-free HTTP(S) candidates from supporting `sourceUrls` and `strategyUrl` in neutral lexical order, and leaves `selectedPrimarySourceUrl` null. A Fund without a selectable candidate requires an editorial evidence correction and a regenerated template. The seller report includes only published deals that have no `SELLER` participant and still fail `hasReviewedSellerTreatment`; it leaves both decision fields null and never treats citation or participant ordering as a recommendation.

Use `npm run db:fund-primary-sources:report -- --output=tmp/fund-primary-source-approval-template.json` for the read-only Fund packet. Research fills every exact candidate selection and commits the immutable result at `audits/approvals/fund-primary-sources.json`. Protected automation invokes `npm run db:fund-primary-sources:apply -- --apply --approval-file=audits/approvals/fund-primary-sources.json --expected-sha256=<exact-digest>` with the required target, release, matching reviewer, and reason context. It verifies the approval bytes at that release SHA, exact Fund ID/legacy ID/status/`updatedAt`/candidate preconditions, uses one serializable transaction, and records an `AuditEvent`. Exact replays are no-ops only when the prior hash-bound audit and resulting `updatedAt` still match. Do not run the apply command directly against production and do not clear a valid designation as rollback; corrections require a newly generated and reviewed forward approval.

Use `npm run db:seller-disclosures:report -- --output=tmp/deal-seller-disclosure-approval-template.json` for the read-only packet. After review and commit at the canonical path, protected automation invokes `npm run db:seller-disclosures:apply -- --apply --approval-file=audits/approvals/deal-seller-disclosures.json --expected-sha256=<exact-digest>` with the required target/release/reviewer/reason environment. Do not run the apply command directly against production.

Company consolidation remains a reviewed operation. Verify every canonical survivor, relationship transfer, and `CompanyRedirect` before applying a merge. Do not use automated view-layer deduplication as evidence that database cleanup is complete.

## Credentials and logging

Ordinary seeding never creates an administrator. Bootstrap or rotate one only in a trusted environment:

```bash
ADMIN_EMAIL=... ADMIN_PASSWORD=... \
EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
FORBIDDEN_DATABASE_HOST=... npm run admin:create
```

Use a unique password of at least 14 characters with upper/lowercase, number, and symbol. Rotate the production administrator credential and `NEXTAUTH_SECRET` after the bootstrap release; record completion without recording either value.

Database seeding is restricted to an explicitly named `development` or `validation` target. Before `npm run db:seed`, set `EXPECTED_DATABASE_HOST`, `EXPECTED_DATABASE_NAME`, at least one opposite-environment `FORBIDDEN_DATABASE_HOST`, and `TARGET_DATABASE`; the seed command refuses `TARGET_DATABASE=production`.

Legacy maintenance apply modes are also fail-closed. In addition to the exact host/database guard, they require the reviewed lowercase `RELEASE_SHA`, `MUTATION_REVIEWED_BY`, and `MUTATION_REASON`, and they emit an `AuditEvent` in the same transaction or record a durable start/completion pair. Reviewed remediation applies additionally require the exact committed approval path and `--expected-sha256=<reviewed input digest>`. Dry-run/report modes do not write and do not require reviewer metadata. Prefer the gated admin import and reviewed remediation workflows whenever they cover the operation.

Runtime request and task logs use one allowlisted JSON envelope: request or task ID, route or task, operation, duration, status, and a fixed sanitized error classification/message when applicable. Server pages and actions reuse the middleware `x-request-id` when a Next request context exists; standalone jobs generate a task ID. Public database, dashboard, and news routes record separate render and cached-data-load operations with the same request ID. Dashboard synchronization records each provider fetch as a `dashboard_provider` operation, and the news scanner separately times tracked-context loading, source crawling, and news search. These operation timings measure latency without serializing provider payloads.

The logger strips query strings and rejects unsafe labels; it never serializes raw errors, stacks, request bodies, database arguments, imported rows, credentials, tokens, email addresses, or private query terms. `PipelineRun.errorSummary` and provider-level dashboard errors use the same safe classifier, retaining only a category and, when available, an allowlisted HTTP/system/database code. Review artifacts may separately contain approved public entity IDs and aggregate counts when their documented purpose requires them.

Drawer shell timing is a browser-only, payload-free performance measurement named by entity kind (`deal`, `fund`, or `company`). It starts immediately before the selection state changes and stops in a layout effect when the shell commits, without waiting for lazy detail data. Only the latest mark/measure is retained. The 100 ms threshold is a regression budget asserted by Playwright, not a claim of production p75 performance and not an analytics event containing a record identifier.

## Health contract

`GET /api/health` exposes exactly six top-level fields: `status`, `version`, `generatedAt`, `database`, `pipelines`, and `generationTimeMs`. Each critical-pipeline item contains only its name, classified status, last-attempt time, and last-success time. The endpoint never returns schema checks, hostnames, database names, branch identifiers, credentials, or query details. It returns HTTP 503 when the database is unavailable, the additive operational schema is not ready, or a critical pipeline is not healthy (`never-run`, `failed`, or `stale`); callers must not treat a reachable 503 as healthy. On a Vercel release, `version` is the 12-character release prefix used by promotion provenance checks; an unversioned local process reports `local`.

## Dependency policy

Production dependencies must have zero unaccepted high or critical advisories. Do not run an unreviewed forced audit rewrite. Patch each path deliberately and record any development-only exception with package path, exploitability, owner, and review date.

The remaining development-only exception is reviewed by Engineering no later than **2026-08-22**:

| Package path | Severity | Why production is not exposed |
| --- | --- | --- |
| `exceljs@4.4.0` → `uuid@8.3.2` | Moderate | Offline workbook scripts only; ExcelJS calls UUID v4, while the advisory concerns caller-provided buffers in v3/v5/v6. |

See [dependency-exceptions.md](./dependency-exceptions.md) for the full path, exploitability review, and resolution trigger. All previously reported high-severity development paths were patched individually; the production tree has no advisories.

## Retention and workspace hygiene

- Keep versioned research, approved audits, historical weekly briefings, migrations, and release records.
- Keep workflow artifacts for the periods above, then let GitHub expire them automatically.
- Treat `tmp/`, Playwright reports, traces, and scan summaries as ephemeral.
- Preserve every unclassified worktree artifact until its owner and retention state are recorded. Never mass-delete a dirty worktree.
- Historical weekly email editions are immutable unless the user explicitly authorizes a historical correction.

Production schema staging and application promotion are separate protected workflows so the first `PipelineRun` migrations can land before the dashboard/news initialization runs. See [release-runbook.md](./release-runbook.md), [incident-response.md](./incident-response.md), [governance.md](./governance.md), and [release-record-template.md](./release-record-template.md) for controlled production changes and recovery.
