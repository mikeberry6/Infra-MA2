# News Scan Daily Automation

This repo's News Feed scanner persists review-queue records only to `NewsItem` and `NewsMention`.

## Daily command

Run this command at the end of each day:

```sh
cd /Users/mikeberry6/Infra-MA2 && npm run news:scan -- --since-days=2 --max-pages=5000
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
- Runs `/opt/homebrew/bin/npm run news:scan -- --since-days=2 --max-pages=5000`.
- Writes stdout to `tmp/news-scan.log`.
- Writes stderr to `tmp/news-scan-error.log`.
- Relies on `scripts/news-scan.ts` loading `.env` from the repo via `dotenv/config`.

Do not load the plist automatically without explicit approval.

Before loading it manually, verify:

```sh
cd /Users/mikeberry6/Infra-MA2
mkdir -p tmp
npm run news:scan:dry-run -- --since-days=2 --max-pages=5000
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
