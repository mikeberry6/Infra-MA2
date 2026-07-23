# Phase 4 Performance and Observability Runbook

## Release contract

Phase 4 reduces the public list payloads, loads published record detail on demand,
adds bounded session caches, exposes a minimal health contract, adds privacy-bounded
product telemetry and structured server logs, and enforces browser and bundle gates.
It does not authorize a framework-major upgrade, a production data mutation, or a
production alias change. Next.js 16/React 19 remains a separate release after a
successful 30-day production dwell.

## Required protected configuration

- Keep the Phase 2 validation values exact: `PHASE2_MIGRATION_DATABASE_URL`,
  `PHASE2_MIGRATION_DATABASE_HOST`, `PHASE2_MIGRATION_DATABASE_NAME`,
  `PRODUCTION_DATABASE_HOST`, and `PRODUCTION_MIGRATION_DATABASE_HOST`.
- Vercel must expose the exact 40-character deployment SHA through
  `VERCEL_GIT_COMMIT_SHA`. Local or non-Vercel validation may use `RELEASE_SHA`.
  A missing, shortened, padded, uppercase, or otherwise invalid SHA makes health
  unhealthy; an invalid primary Vercel SHA never falls back to another value.
- `DATA_CACHE_NAMESPACE`, when explicitly configured, must be an opaque,
  non-sensitive identifier. Never place a URL, credential, branch connection
  string, customer name, or query in this value.

## Pull-request gate

The static job builds the application and rejects any `/tracker`, `/funds`, or
`/portfolio` first-load JavaScript payload above 150,000 gzip bytes. The isolated
validation job applies additive migrations, runs publication/data-trust checks,
builds against the validation branch, installs Chromium, and runs the responsive,
drawer, URL-state, health-contract, and automated WCAG A/AA browser journeys.

Browser startup fails before the server launches unless `E2E_DATABASE_URL` matches
the exact expected validation host and database and differs from every configured
production host. Browser validation must use Playwright's local server; remote
preview URLs are not permitted for database-backed runs.

Committed visual regressions cover the deterministic empty-search application
shell at 320, 390, 768, 1280, and 1440 pixels, including visible copy,
typography, layout, surfaces, borders, responsive breakpoints, and palette.
Snapshot-only CSS disables animation, carets, transitions, and scrollbars; it
does not hide text or replace application content. Update these PNGs only with
an intentional UI review; never generate populated database goldens from
production data.

## Vercel activation

An authorized Vercel project operator must enable both Web Analytics and Speed
Insights for `mberry/infra-ma-2`, then redeploy the exact approved SHA. Record the
operator, time, deployment ID, and screenshots or project audit evidence in the
release record. Enabling a dashboard without redeploying does not complete this
step.

The application strips query strings and fragments from telemetry URLs and reduces
all dynamic administration paths to `/Infra-MA2/admin`. Product events accept only
the finite names and finite categorical properties in `src/lib/analytics-contract.ts`.
Do not add record identifiers, company/fund/deal names, search text, source URLs,
import rows, email addresses, callback URLs, or arbitrary metadata.

## Health and smoke contract

`GET /Infra-MA2/api/health` is dynamic and `no-store`. It returns only release
version, database state, critical dashboard/news pipeline state and timestamps,
generation time, and overall status. It returns `503` when release identity is
invalid, the database is unavailable or schema-incomplete, a critical pipeline has
never succeeded, the latest run failed, freshness is breached, a run has stalled
for more than three hours, or news source coverage fails its contract.

Candidate and promotion smoke checks require the endpoint to return `200`, report
`healthy`, connect to the database, and match the full release SHA exactly. Emergency
rollback retains the explicit health bypass because the last known-good deployment
may predate this endpoint; immutable deployment identity and public-route smoke
checks remain mandatory. Only that explicit rollback mode accepts the established
pre-Phase-4 Fund/PortCo row accessibility markers; candidate and forward-promotion
checks require the new entity-specific row markers. The core database checks also require each stable database
heading to be present and the `Data unavailable` fallback to be absent, so a caught
query failure cannot pass merely because the page returned HTTP 200.

Candidate creation records the exact canonical application SHA and immutable
deployment ID before the build, confirms the same ID still owns the alias afterward,
and emits `promotion-baseline.json`. Promotion requires both baseline values and
re-inspects the canonical alias immediately before `vercel promote`; any intervening
same-SHA redeploy, alias move, or different release fails closed.

## Alerts and 30-day acceptance

Configure Vercel Observability alerts for:

- any health endpoint `503` or critical pipeline failure;
- public/API 5xx rate and route-duration regression;
- database connectivity/latency regression;
- external-provider latency and failure rate;
- mobile and desktop p75 LCP at or above 2.5 seconds;
- p75 INP at or above 200 milliseconds;
- p75 CLS at or above 0.1.

Retain 30 days of evidence before declaring Phase 4 operationally complete. The
record must show at least 95% successful scheduled pipeline runs, the three Core Web
Vitals targets on both mobile and desktop where sample size is sufficient, no public
route above the bundle budget, and reviewed alert delivery. Low-traffic metrics must
be marked insufficient rather than inferred as passing.

## Structured-log privacy

Server logs contain only an allow-listed route, operation, duration, HTTP status,
fresh request UUID, and optional finite error class. Never log request URLs, query
strings, callback paths, auth material, exception text, imported row contents,
record names, database URLs, or provider response bodies. Middleware replaces every
inbound request ID rather than trusting or echoing caller-controlled text.
