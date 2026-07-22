# Infra-MA2

Next.js + Prisma application for infrastructure M&A, portfolio company, fund, and public news monitoring.

The supported local and CI baseline is Node 24.x with npm 11.x. Use `npm ci` for clean installs and keep `package-lock.json` as the sole package-manager lockfile. See `docs/operations.md` for migrations, rollback, administrator bootstrap, and artifact retention.

## Daily News Monitoring

Run a dry scan first:

```bash
npm run news:scan:dry-run
```

Run the importer:

```bash
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

For a seven-day import window:

```bash
npm run news:scan -- --since-days=7
```

The scanner now has two discovery phases:

- source crawl: tracked company, manager, and fund websites plus discovered public pages
- public news search: exact-name public-news API queries for each tracked company, manager, and fund

If a site advertises a `robots.txt` crawl-delay above `NEWS_SCAN_MAX_CRAWL_DELAY_MS`, follow-up pages from that origin are skipped rather than fetched too soon or allowed to stall the whole run.

For a full universe news-search screen without the slower source-site crawl:

```bash
npm run news:scan -- --since-days=7 --skip-source-crawl --search-max-results-per-entity=5
```

For targeted scanner QA, use `--target` one or more times or as a comma-separated list:

```bash
npm run news:scan:dry-run -- --skip-source-crawl --since-days=7 --target=IAC --search-max-queries-per-entity=5
```

## Daily M&A Conditions Dashboard

The `/dashboard` route displays a daily infrastructure M&A conditions dashboard with a Prisma-backed cache. It is decision support, not a trading system: the UI labels whether observations are live, cached, sample/manual, stale, unavailable, or require review.

Run a dry sync first:

```bash
npm run dashboard:sync:dry-run
```

Run the cache upsert:

```bash
npm run dashboard:sync
```

Dashboard commands write summaries to:

```bash
tmp/dashboard-sync-summary.json
tmp/dashboard-seed-sample-summary.json
tmp/dashboard-verify-summary.json
```

Bootstrap demo/sample rows only when a database has no dashboard cache yet:

```bash
npm run dashboard:seed-sample
```

Verify the catalog, sample view model, and database table availability:

```bash
npm run dashboard:verify
```

Current working providers:

- U.S. Treasury XML: nominal CMT rates, 2s10s, 5s30s, 10Y TIPS real yield, and implied 10Y breakeven inflation
- USAspending.gov public API: infrastructure-keyword award activity and top returned awards
- Federal Register public API: infrastructure-related notices/rules
- InfraSight deal database: trailing 30-day published deal-flow count

Optional providers and placeholders:

- `FRED_API_KEY`: enables FRED-based SOFR, SOFR averages, credit spreads, VIX, S&P 500, Henry Hub, WTI, Brent, and selected macro series
- `EIA_API_KEY`: reserved for EIA grid/load/storage/generation adapters
- `SAM_API_KEY`: reserved for SAM.gov procurement opportunities
- `SEC_USER_AGENT`: required before enabling SEC EDGAR watchlist polling
- `DASHBOARD_MANUAL_IMPORT_PATH`: reserved for analyst-curated or licensed CSV imports such as EMMA/MSRB, ISO/RTO prices, TSA/FHWA/AAR, FCC/NTIA, EPA ECHO, and public-comp watchlists

Sources that require keys, licensing, manual files, or additional field mapping are deliberately shown as skipped/placeholders instead of scraped. Do not use sample fallback rows for investment decisions.
