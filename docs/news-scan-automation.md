# News Scan Daily Automation

This repo's News Feed scanner persists public-news records only to `NewsItem` and `NewsMention`.

## GitHub Actions automation

`.github/workflows/news-pipeline.yml` runs nightly at 02:30 UTC. Scheduled runs update the public news feed but never create deals. Manual dispatches default to a read-only dry run and also offer an explicit live choice. For ad hoc discovery that should remain unpublished, pass `--review-only`; new items are then stored as `DRAFT`, while rescans preserve the editorial status of existing items.

The workflow:

- serializes scheduled and manual runs with a production news-pipeline concurrency lock;
- verifies the exact approved production database host and name immediately before live writes;
- limits targets, pages, links, per-site work, concurrency, and search results; direct-site crawling uses a stable mixed-entity 150-page nightly budget while public-news search covers every entity in the selected shard;
- retries only transient command failures, with three bounded attempts;
- fails visibly if neither crawl nor news search completes useful work;
- rotates deterministically across three entity shards, covering the full published universe every three nights with a four-day lookback;
- overlaps two public-news requests while preserving the same aggregate request pacing, so network latency does not consume the workflow budget;
- rejects low-confidence public-search matches and ambiguous short-name collisions before any live write;
- fails visibly if the per-run target cap would omit any entity from the selected shard;
- uploads `tmp/news-scan-summary.json` for 30 days, even after failure.

Live writes require the same existing protected database secret and target variables used by the production data workflows. Do not put database URLs in workflow inputs, variables, logs, or artifacts.

## Daily command

Run this command at the end of each day:

```sh
cd /Users/mikeberry6/Infra-MA2 && npm run news:scan -- --since-days=2 --max-pages=500
```

Use `--since-days=2` for the daily job so late-posted items are still picked up on the next run. The scanner performs both source-site crawling and exact-name public-news search by default, so the daily job screens tracked companies, fund managers, and funds even when their own websites do not expose recent news pages.

For an ad hoc full-universe news-search screen without the slower source-site crawl:

```sh
cd /Users/mikeberry6/Infra-MA2 && npm run news:scan -- --since-days=7 --skip-source-crawl --search-max-results-per-entity=5
```

## launchd template

A local launchd plist template is available at:

```text
docs/com.mikeberry6.infra-ma2.news-scan.plist
```

The template:

- Runs daily at 7:30 PM local Mac time.
- Uses `/Users/mikeberry6/Infra-MA2` as `WorkingDirectory`.
- Runs `/opt/homebrew/bin/npm run news:scan -- --review-only --since-days=2 --max-pages=500` so the optional local automation cannot publish without a separate editorial action.
- Writes stdout to `tmp/news-scan.log`.
- Writes stderr to `tmp/news-scan-error.log`.
- Relies on `scripts/news-scan.ts` loading `.env` from the repo via `dotenv/config`.

Do not load the plist automatically without explicit approval.

Before loading it manually, verify:

```sh
cd /Users/mikeberry6/Infra-MA2
mkdir -p tmp
npm run news:scan:dry-run -- --review-only --since-days=2 --max-pages=500
```

If approved later, it can be loaded with:

```sh
launchctl bootstrap "gui/$(id -u)" /Users/mikeberry6/Infra-MA2/docs/com.mikeberry6.infra-ma2.news-scan.plist
```

And unloaded with:

```sh
launchctl bootout "gui/$(id -u)" /Users/mikeberry6/Infra-MA2/docs/com.mikeberry6.infra-ma2.news-scan.plist
```

## Operating guardrails

- Do not scrape LinkedIn directly.
- Only capture LinkedIn URLs discovered from public pages.
- Respect robots.txt.
- If a provider or site fails, continue the scan and inspect `tmp/news-scan-summary.json`.
- Do not create new deals from the scanner.
- Treat `/news` as a review queue; imported items still need editorial review.
- The Next.js `/news` page may take up to 5 minutes to reflect new records if route caching is active.
