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

No workflow should infer a database target from a generic URL. `scripts/assert-database-target.ts` compares the URL host with an explicitly approved, non-secret host variable before any migration or pipeline write.

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
| `APIFY_TOKEN` | manual research workflow | LinkedIn research candidate collection |

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

The validation database guard requires `MIGRATION_DATABASE_HOST` and `MIGRATION_DATABASE_NAME` and denies both production endpoints. Before strict source/canonical gates can fail, CI writes reviewer-neutral all-status company-merge, ownership-to-fund-link, and citation templates. If fixed reviewed files exist at `audits/approvals/company-merges.json`, `audits/approvals/ownership-fund-links.json`, and `audits/approvals/primary-citations.json`, CI hashes and applies them only to the isolated validation database, in that order, before strict checks. Reruns are idempotent.

Use staged review passes when merges can change ownership or citation candidates: commit the reviewed company file first, let validation apply it and regenerate the ownership-link and citation templates, then review and commit those post-merge files. Do not approve a stale pre-merge template. Ownership-link remediation can only link an exact normalized vehicle name to a reviewed fund or remove a stale fund link; it never changes the vehicle label or underlying ownership assertion. This process allows the gate to become green without weakening it; production still requires the protected manual remediation workflow.

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

## Protected production release

Production schema staging, reviewed data remediation, promotion, rollback, and every scheduled/manual data-pipeline run are serialized by the repository-wide `production-release` concurrency group. Production mutation workflows are additionally protected by the GitHub `production` environment.

- `scripts/verify-release-provenance.ts` requires the checkout and fetched `origin/main` to equal the requested full SHA, confirms through GitHub that `main` is protected and still points to that exact SHA, and accepts only a successful `build` check produced by the `github-actions` app.
- **Stage Production Schema** binds two independently verified baselines: the SHA of the application currently serving the protected canonical production origin and the SHA whose migration names and checksums exactly match production's successfully applied migration ledger. Both must independently be ancestors of the release; the migration baseline may be newer than the still-live application after an earlier schema-first stage. The workflow requires `DASHBOARD_WRITES_ENABLED=false`, verifies the live Vercel project, repository, scope, and Git SHA, rechecks the live app and migration ledger immediately before writing, applies additive migrations, and proves the post-write ledger exactly matches the release. It emits reviewer-neutral, migration-timestamp-bound dashboard methodology and legacy-signal manifests but never applies them. Citation, duplicate, ownership-link, and dashboard outputs are backlog evidence, not implicit approval.
- **Review or Remediate Release Data** separates reports from mutations. Apply and rollback operations require a committed `audits/approvals/*.json` artifact, its exact SHA-256, protected-environment approval, exact database/release/reviewer/reason targeting, and one explicit operation at a time. Dashboard cutover apply and rollback additionally require `DASHBOARD_WRITES_ENABLED=false`; they preserve `updatedAt`, verify every deterministic row precondition, record an `AuditEvent` in the same serializable transaction, and permit rollback only while the reviewed post-apply rows still match exactly.
- **Promote Production Release** accepts only a ready staged production deployment supplied by its immutable Vercel URL, whose target is `production`, project and scope match protected configuration, GitHub source SHA and repository ID match the release, and health reports its 12-character prefix. It requires clean schema/data/source/pipeline gates, rechecks exact protected-main and candidate provenance immediately before promotion, and promotes the verified deployment ID rather than a mutable alias.

Keep `main` frozen from final manifest review through promotion except for the reviewed approval commits required by this process. Each such commit becomes the new eligible release: regenerate the manifest, wait for its exact-SHA gate and staged production build, and restage. If its migration tree is unchanged, use the previously staged commit as the verified migration baseline; independent ancestry checks allow the stage workflow to prove the current ledger and perform a no-op deploy while the older production application remains active. A Vercel Preview is for pre-merge validation only. With automatic domain assignment disabled, the Git-integrated `main` build is a staged production deployment using production environment values; promoting it changes domains without rebuilding.

## Scheduled pipelines

`.github/workflows/data-pipelines.yml` uses production-target guards, the same repository-wide `production-release` lock as staging/remediation/promotion/rollback, bounded timeouts, and retries only when output indicates a transient network/provider error. Scheduled jobs must receive the pooled `PRODUCTION_DATABASE_HOST` as the expected endpoint and the distinct `PRODUCTION_MIGRATION_DATABASE_HOST` as an explicit forbidden endpoint; dashboard and news mutation entry points repeat that check before constructing Prisma or recording a `PipelineRun`.

Dashboard writes are fail-closed. Configure `FRED_API_KEY`, `EIA_API_KEY`, `SAM_API_KEY`, and `SEC_USER_AGENT`. Before production schema staging, set `DASHBOARD_WRITES_ENABLED=false`; the stage workflow and dashboard cutover apply/rollback operations reject unset or true values. Keep it false until all reviewed cutovers finish, then manually dispatch the `source-audit` pipeline. That job runs every dashboard provider in read-only dry-run mode and retains both its log and JSON summary. Operations must confirm that every configured source completed, required metrics are current, representative values agree with the linked official pages, and no credential or source-contract warning remains. Only then may Operations set `DASHBOARD_WRITES_ENABLED=true`, run a manual live dashboard synchronization, and proceed to promotion; production promotion and scheduled synchronization reject missing credentials or an unapproved write flag. Return the flag to false after any dry-run/live-sync failure or provider-integrity incident. `SEC_WATCHLIST_CIKS` is optional and does not replace the required SEC user agent.

| Pipeline | Schedule | Contract |
| --- | --- | --- |
| Dashboard synchronization | Weekdays at 07:30 America/New_York (DST-safe dual UTC schedule) | Latest success within 30 hours; rolling 30-day success at least 95%; failed/skipped provider rate at most 25%; no critical provider may miss two consecutive refreshes |
| News scan | Daily at 23:30 UTC | Latest success within 36 hours; rolling 30-day success at least 95%; failed fetch/query rate at most 25%; page cap must not be exhausted |
| Database/email verification | Sundays at 12:00 UTC | Weekly email and links valid; publication/source gates complete; dashboard/news freshness intact |
| Dependency/source audit | First day monthly at 08:00 America/New_York | No high/critical production advisories; dashboard source contracts and freshness, database citations, company-source coverage, duplicates, and portfolio checks reviewed |

`scripts/verify-pipeline-health.ts` groups retry attempts by the DST-safe Eastern `refreshWindow`, prorates expected window coverage from the first recorded run up to a 30-day window, catches stalled attempts, and writes non-sensitive JSON evidence. Production promotion checks dashboard freshness against the canonical weekday 07:30 America/New_York schedule, so a Friday success remains current through the weekend and becomes overdue at Monday's scheduled boundary. Other callers retain an explicit maximum-age contract. A successful scan with zero qualifying news items remains valid; source/provider failure is measured separately.

GitHub Actions failure notifications are the primary alert channel until a dedicated paging integration is approved. The Operations owner must keep notifications enabled for the repository and review a failed dashboard job the same business day. A critical-source failure is escalated to Research, which owns the source contract; two consecutive missed refresh windows, an unresolved freshness breach, or a validation/range failure also requires an incident record under `docs/incidents/` and Engineering review. Preserve the last validated cache throughout the incident, set `DASHBOARD_WRITES_ENABLED=false` if source integrity is uncertain, and re-enable writes only after a clean read-only all-source dry-run and reviewed evidence.

Pipeline artifacts are retained for 30 days; monthly audit and production release evidence are retained for 90 days. Artifacts must never contain tokens, credentials, imported row contents, or private query data.

The manual LinkedIn workflow uploads review candidates only. It has read-only repository permission and never commits, publishes, or modifies a protected branch.

## Publication and source gates

`scripts/source-coverage-report.ts` reports published deals and companies with an explicitly designated primary citation, published funds with either a source URL or strategy URL, and the `lastVerifiedAt` backlog. Release and scheduled verification require 100% source presence. Candidate citation order is deliberately neutral: Research must verify the evidence and name the primary citation explicitly. Never infer a primary source from array, creation, or identifier order.

`npm run db:duplicates:verify` separately fails while any normalized duplicate cluster remains in the published public scope. Citation designation, company merging, and ownership-to-fund-link repair are reviewed remediation operations, never migration backfills. Generate a report, review and commit the exact approval JSON, record its SHA-256, create a restore branch before production writes, apply one decision set, and rerun the strict gates.

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

Legacy maintenance apply modes are also fail-closed. In addition to the exact host/database guard, they require the reviewed lowercase `RELEASE_SHA`, `MUTATION_REVIEWED_BY`, and `MUTATION_REASON`, and they emit an `AuditEvent` in the same transaction or record a durable start/completion pair. Ownership-correction apply runs additionally require `--expected-sha256=<reviewed input digest>`. Dry-run/report modes do not write and do not require reviewer metadata. Prefer the gated admin import and reviewed remediation workflows whenever they cover the operation.

Runtime request and task logs use one allowlisted JSON envelope: request or task ID, route or task, operation, duration, status, and a fixed sanitized error classification/message when applicable. Server pages and actions reuse the middleware `x-request-id` when a Next request context exists; standalone jobs generate a task ID. The logger strips query strings and rejects unsafe labels; it never serializes raw errors, stacks, request bodies, database arguments, imported rows, credentials, tokens, email addresses, or private query terms. `PipelineRun.errorSummary` and provider-level dashboard errors use the same safe classifier, retaining only a category and, when available, an allowlisted HTTP/system/database code. Review artifacts may separately contain approved public entity IDs and aggregate counts when their documented purpose requires them.

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
