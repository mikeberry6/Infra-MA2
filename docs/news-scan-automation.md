# News Scan Daily Automation

This repo's News Feed scanner persists review-queue records only to `NewsItem` and `NewsMention`.

## Daily command

Run this command at the end of each day:

```sh
cd /Users/mikeberry6/Infra-MA2 && npm run news:scan -- --max-targets=200 --max-pages=750
```

The scanner derives its daily lookback from the selected universe: the full rotation length plus a two-day retry/late-posting margin. An explicit `--since-days=N` is a minimum only and is raised automatically when it would leave a rotation coverage gap. The scanner performs both source-site crawling and exact-name public-news search by default, so the daily job screens tracked companies, fund managers, and funds even when their own websites do not expose recent news pages.

The scheduled contract intentionally selects 200 canonical entities per UTC service day. At the current roughly 1,434-entity scale, that produces a complete rotation in no more than eight days while keeping the crawl within its reviewed 750-page/90-minute Actions budget. Selection is sorted by entity type and database ID, then rotated by a workflow-pinned service date. Scheduled runs subtract six hours, so the 23:30 cron remains on its intended day when runner startup is delayed through 05:59 UTC; an on-demand dispatch uses its actual UTC day. Every retry in one Actions job receives the same `NEWS_SCAN_ROTATION_DATE` and `NEWS_SCAN_AS_OF`, adjacent scheduled jobs advance to the next window, and every eligible entity appears once per cycle (apart from the small wrap overlap when the universe is not divisible by 200). `--target` filtering is applied before rotation. Use `--max-targets=N` or `NEWS_SCAN_MAX_TARGETS=N` for an explicit bounded override; do not change the scheduled value without reviewing both runtime and page-budget evidence.

Within a selected window, one usable URL per entity is treated as the required coverage seed. Per-entity URLs are canonicalized before selection. Remaining official website and common current-news paths are scheduled in a deterministic round-robin before historical citation URLs. Seventy percent of the page budget is allocated to deterministic initial seeds and the balance is reserved for current article links discovered from those pages.

`tmp/news-scan-summary.json` and the corresponding `PipelineRun.metadata` record include the full and target-filtered universe sizes, selected count, pinned UTC selection/as-of values, effective lookback, offset, window/cycle values, initial and deferred seed counts, discovered/deferred queue counts, and the real successful/failed upstream-attempt totals. Intentional bounded deferral is reported as `intentionalDeferral`/`configuredBudgetExhausted` and does not by itself fail the run. `cappedByMaxPages` is reserved for an incomplete required-seed window and remains fail-closed, including on legacy records. Zero attempts or a real fetch/query failure rate above 25% also fails the run.

For an ad hoc full-universe news-search screen without the slower source-site crawl:

```sh
cd /Users/mikeberry6/Infra-MA2 && npm run news:scan -- --since-days=7 --max-targets=10000 --skip-source-crawl --search-max-results-per-entity=5
```

The deliberately high ad hoc override above selects the entire eligible universe. It is not the scheduled contract and may take substantially longer than one nightly run.

## launchd template

A local launchd plist template is available at:

```text
docs/com.mikeberry6.infra-ma2.news-scan.plist
```

The template:

- Runs daily at 7:30 PM local Mac time.
- Uses `/Users/mikeberry6/Infra-MA2` as `WorkingDirectory`.
- Runs `/opt/homebrew/bin/npm run news:scan -- --max-targets=200 --max-pages=750`.
- Writes stdout to `tmp/news-scan.log`.
- Writes stderr to `tmp/news-scan-error.log`.
- Relies on `scripts/news-scan.ts` loading `.env` from the repo via `dotenv/config`.

Do not load the plist automatically without explicit approval.

Before loading it manually, verify:

```sh
cd /Users/mikeberry6/Infra-MA2
mkdir -p tmp
npm run news:scan:dry-run -- --max-targets=200 --max-pages=750
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
- Route every source, robots, and public-news request through the pinned public-network fetch boundary. It rejects credentials, local/private/reserved DNS answers, DNS rebinding, unsafe redirects, HTTPS downgrade, oversized bodies, and excessive redirect hops.
- Respect robots.txt.
- If a provider or site fails, continue the scan and inspect `tmp/news-scan-summary.json`.
- Do not create new deals from the scanner.
- Treat `/news` as a review queue; imported items still need editorial review.
- The Next.js `/news` page may take up to 5 minutes to reflect new records if route caching is active.
