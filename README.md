# Infra-MA2

Next.js + Prisma application for infrastructure M&A, portfolio company, fund, and public news monitoring.

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
NEWS_SCAN_MAX_PAGES=750
NEWS_SCAN_MAX_PAGES_PER_SITE=6
NEWS_SCAN_MAX_TARGETS=25
```

You can also pass equivalent flags, for example:

```bash
npm run news:scan:dry-run -- --max-targets=25 --max-pages=100
```
