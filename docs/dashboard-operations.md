# Dashboard source operations

The `/dashboard` feed runs from official-source adapters at **07:30 America/New_York every weekday**. GitHub Actions schedules both possible UTC times and admits only the slot matching the current Eastern offset, so the cadence remains stable through daylight-saving changes.

## Protected configuration

Repository or `production` environment secrets:

- `DATABASE_URL` — pooled production connection used by the application and recurring sync.
- `PRODUCTION_MIGRATION_DATABASE_URL` — direct production connection used only by the protected schema-stage job.
- `DASHBOARD_MIGRATION_DATABASE_URL` — isolated Neon branch used only by the focused dashboard PR validation workflow.
- `FRED_API_KEY`, `EIA_API_KEY`, `SAM_API_KEY` — official provider credentials.
- `SEC_USER_AGENT` — a compliant product/contact identity, for example `InfraSight dashboard operations@example.com`.
- `VERCEL_TOKEN` — token limited to the InfraSight Vercel project.

Repository or `production` environment variables:

- `PRODUCTION_DATABASE_HOST`, `PRODUCTION_MIGRATION_DATABASE_HOST`, and `PRODUCTION_DATABASE_NAME`.
- `MIGRATION_DATABASE_HOST` and `DASHBOARD_MIGRATION_DATABASE_HOST` — isolated validation hosts; production jobs explicitly forbid both.
- `DASHBOARD_MIGRATION_DATABASE_NAME` — database name on the focused validation branch.
- `DASHBOARD_WRITES_ENABLED` — keep `false` until the initial all-source dry-run is reviewed.
- `SEC_WATCHLIST_CIKS` — optional comma-separated `CIK:Name` watchlist.
- `VERCEL_PROJECT_ID`, `VERCEL_SCOPE`, and `PRODUCTION_URL`. `PRODUCTION_URL` must equal `https://infra-ma-2.vercel.app`.

Keep the GitHub `production` environment protected by a required reviewer. Never put provider keys or database URLs in repository variables, workflow inputs, artifacts, or logs.

## First release

1. Merge the focused dashboard release to protected `main` after the `build` check passes.
2. Create a Neon restore branch from production immediately before any production schema write.
3. Generate the additive migration manifest locally from the production migration baseline:

   ```bash
   node --experimental-strip-types scripts/audit-additive-migrations.ts \
     --base-sha=<migration-base-sha> \
     --production-app-sha=<current-production-app-sha> \
     --release-sha=<main-release-sha> \
     --output=tmp/dashboard-migration-manifest.json
   ```

4. Review the manifest and dispatch **Stage Dashboard Schema** with its `manifestSha256`, the three exact SHAs, and confirmation `STAGE`.
5. Dispatch **Dashboard Data Pipeline** with `source-audit`. This is a live, read-only fetch from every configured source and deliberately does not require a populated dashboard.
6. Inspect the retained `dashboard-source-audit-*` artifact. Resolve every critical-source failure, malformed response, missing required metric, or stale release.
7. Set `DASHBOARD_WRITES_ENABLED=true`, then dispatch the `dashboard` pipeline once.
8. Inspect the sync and reliability artifact, then dispatch `verify`. Every visible metric must have valid, fresh official-source data; sample values are forbidden.
9. Build a production-target Vercel candidate without assigning the canonical alias. Dispatch **Promote Dashboard Release** with the immutable `*.vercel.app` deployment URL, exact `main` SHA, and confirmation `PROMOTE`.
10. Open `/admin/dashboard-signals`. Newly discovered filings, documents, awards, and opportunities remain `PENDING` until an analyst approves or rejects them. Do not bulk-approve qualitative signals.

The schema-stage job verifies protected-main provenance, the required GitHub Actions check, the reviewed additive-only manifest, the current Vercel production SHA, the exact Prisma migration ledger, and the database target. It repeats the Vercel, ledger, provenance, and target checks immediately before migration writes.

## Recurring operations

- **Weekdays at 07:30 Eastern:** fetch all sources with at most three bounded attempts. Objective observations publish only after schema, unit, range, date, and freshness validation. A failed provider leaves the last valid observation cached and marked stale.
- **Sunday:** require complete public data and evaluate the last 30 days of `DashboardSourceRun` records.
- **First day of each month at 08:00 Eastern:** perform an all-source live dry-run and retain evidence for 90 days.
- **Monthly:** confirm source terms, endpoints, owners, expected lag, staleness thresholds, and secrets against `source-registry.ts`.

Retries with the same Eastern date share one refresh window. Reliability uses the latest attempt for each source in that window, requires all critical sources, enforces a 95% rolling success rate, and fails after two consecutive missing or unhealthy critical-source windows. GitHub Actions failures are the operational alert; enable repository workflow-failure notifications for the dashboard owner and backup reviewer.

## Failure and recovery

- Leave `DASHBOARD_WRITES_ENABLED=false` if the initial source audit has not passed.
- For a provider failure, inspect `dashboard-sync-summary.json`; correct credentials or adapter behavior, rerun `source-audit`, then rerun `dashboard` with the same refresh date.
- For a freshness failure, do not insert sample data or approve stale observations. The public dashboard keeps the last validated cached value and exposes its stale state.
- For a bad application release, dispatch **Roll Back Dashboard Release** with a previously verified immutable deployment or deployment ID, its exact Git SHA, and confirmation `ROLLBACK`. Additive migrations remain in place.
- For a schema incident, stop writes immediately and use the pre-release Neon restore branch under the incident owner’s approval. Do not run destructive rollback SQL from GitHub Actions.

The rollout is considered stable after 30 days with at least 95% scheduled-window success, no unresolved critical-source freshness breach, and a documented source link for every public metric.
