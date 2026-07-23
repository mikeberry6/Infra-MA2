# Infra-MA2

Next.js + Prisma application for infrastructure M&A, portfolio company, fund, and public news monitoring.

The supported local and CI baseline is Node 24.x with npm 11.x. Use `npm ci` for clean installs and keep `package-lock.json` as the sole package-manager lockfile. See [the operations handbook](docs/operations.md) for service configuration and monitoring, and [the release runbook](docs/release-runbook.md) for exact-SHA schema staging, promotion, rollback, and recovery.

## Daily News Monitoring

Production news scanning runs only through the protected **Data Pipelines** GitHub Actions workflow described in [news-scan-automation.md](docs/news-scan-automation.md). Do not run a second workstation production schedule.

For adapter development against an explicitly guarded development or isolated validation database, run a dry scan first:

```bash
npm run news:scan:dry-run
```

Only after the target guard and dry-run evidence pass may a non-production operator run the importer:

```bash
TARGET_DATABASE=validation \
EXPECTED_DATABASE_HOST=... \
EXPECTED_DATABASE_NAME=... \
FORBIDDEN_DATABASE_HOST=... \
DATABASE_URL=... \
npm run news:scan
```

Both commands scan published portfolio companies, fund managers, and funds from Prisma. The scanner crawls only bounded public surfaces: official websites, stored source URLs, `sitemap.xml`, and common news or press paths. It respects `robots.txt`, applies per-origin delays, skips direct LinkedIn crawling, and only records LinkedIn URLs found on public pages.

Results are written to `NewsItem` and `NewsMention` records and displayed on `/news`. The feed is a review queue; the scanner does not create deals.

The run summary is always written to:

```bash
tmp/news-scan-summary.json
```

Useful limits:

```bash
NEWS_SCAN_CONCURRENCY=3
NEWS_SCAN_DELAY_MS=900
NEWS_SCAN_MAX_CRAWL_DELAY_MS=30000
NEWS_SCAN_MAX_PAGES=750
NEWS_SCAN_MAX_PAGES_PER_SITE=6
NEWS_SCAN_MAX_TARGETS=25
NEWS_SCAN_SINCE_DAYS=7
NEWS_SCAN_SEARCH_ENABLED=true
NEWS_SCAN_SEARCH_MAX_QUERIES_PER_ENTITY=3
NEWS_SCAN_SEARCH_MAX_RESULTS_PER_ENTITY=5
NEWS_SCAN_SEARCH_CONCURRENCY=1
NEWS_SCAN_SEARCH_DELAY_MS=500
```

You can also pass equivalent flags, for example:

```bash
npm run news:scan:dry-run -- --max-targets=25 --max-pages=100
```

For a seven-day non-production dry-run window:

```bash
npm run news:scan:dry-run -- --since-days=7
```

The scanner now has two discovery phases:

- source crawl: tracked company, manager, and fund websites plus discovered public pages
- public news search: exact-name public-news API queries for each tracked company, manager, and fund

If a site advertises a `robots.txt` crawl-delay above `NEWS_SCAN_MAX_CRAWL_DELAY_MS`, follow-up pages from that origin are skipped rather than fetched too soon or allowed to stall the whole run.

For a bounded, rotating non-production news-search screen without the slower source-site crawl:

```bash
npm run news:scan:dry-run -- --since-days=7 --skip-source-crawl --search-max-results-per-entity=5
```

For targeted scanner QA, use `--target` one or more times or as a comma-separated list:

```bash
npm run news:scan:dry-run -- --skip-source-crawl --since-days=7 --target=IAC --search-max-queries-per-entity=5
```

## Daily M&A Conditions Dashboard

The `/dashboard` route displays a daily infrastructure M&A conditions dashboard with a Prisma-backed cache. It is decision support, not a trading system: the UI labels whether observations are live, cached, manual, stale, unavailable, or require review.

Production synchronization runs only through the protected **Data Pipelines** workflow after its reviewed all-source dry run and `DASHBOARD_WRITES_ENABLED` gate. For provider development against a guarded non-production database, run a dry sync first:

```bash
npm run dashboard:sync:dry-run
```

Only after the target guard and dry-run evidence pass may a non-production operator run a cache upsert:

```bash
TARGET_DATABASE=validation \
EXPECTED_DATABASE_HOST=... \
EXPECTED_DATABASE_NAME=... \
FORBIDDEN_DATABASE_HOST=... \
DATABASE_URL=... \
npm run dashboard:sync
```

Dashboard commands write summaries to:

```bash
tmp/dashboard-sync-summary.json
tmp/dashboard-verify-summary.json
```

Verify the catalog, empty-state view model, and database table availability:

```bash
npm run dashboard:verify
```

Current working providers:

- U.S. Treasury XML: nominal CMT rates, 2s10s, 5s30s, 10Y TIPS real yield, and implied 10Y breakeven inflation
- FRED API: SOFR and averages, credit spreads, VIX, S&P 500, selected commodities, GDP, inflation, construction, employment, wages, and claims
- EIA API v2: Lower 48 demand, net generation, interchange, gas storage, gasoline inventories, and crude inventories excluding SPR
- USAspending.gov public API: infrastructure-keyword award activity and top returned awards
- Federal Register public API: infrastructure-related notices/rules
- SAM.gov public opportunities API: de-duplicated infrastructure title matches
- SEC EDGAR submissions API: configurable CIK watchlist for transaction-related filings
- InfraSight deal database: trailing 30-day published deal-flow count

Provider configuration:

- `FRED_API_KEY`, `EIA_API_KEY`, and `SAM_API_KEY` enable their respective free official APIs.
- `SEC_USER_AGENT` must identify the application and include a monitored contact email.
- `SEC_WATCHLIST_CIKS` optionally replaces the default public-infrastructure and hyperscaler watchlist using comma-separated `CIK:Name` entries.
- Scheduled writes require a reviewed all-source dry-run and the repository variable `DASHBOARD_WRITES_ENABLED=true`; leave it unset or false during initial validation or a source-integrity incident.
- Quantitative observations publish after validation. Federal Register documents, USAspending awards, SAM opportunities, and SEC filings remain pending until approved at `/admin/dashboard-signals`.

The checked-in source registry controls active metrics, exact series/facets, units, transforms, publication lag, staleness, and review mode. Unsourced metrics remain `ROADMAP` records and are hidden from the public dashboard. Provider failures preserve the last official observation and never substitute sample data.
