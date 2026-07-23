# News scan operations

The canonical production scheduler is the **Data Pipelines** GitHub Actions workflow. It runs the news scanner from the exact protected `main` revision every day at 23:30 UTC with one shared, non-cancelling production lock.

The former workstation `launchd` schedule has been removed. Do not run a second local production schedule: overlapping scans would weaken the bounded-run, provenance, and retained-evidence contracts.

Before enabling the hosted schedule, verify that the old service label is not still loaded:

```sh
launchctl print "gui/$(id -u)/com.mikeberry6.infra-ma2.news-scan"
```

If it exists, an authorized operator must run `launchctl bootout "gui/$(id -u)/com.mikeberry6.infra-ma2.news-scan"` and then repeat the print command until it returns not found. Deleting the plist from the repository does not unload a previously bootstrapped service. Record the host, operator, time, and result in the program release record.

## Scheduled contract

The workflow:

- pins one UTC `NEWS_SCAN_AS_OF` and rotation date across every retry;
- permits at most three bounded attempts;
- caps each attempt at 200 targets and 750 pages;
- writes one `PipelineRun` lifecycle record per attempt, then collapses retries into one logical `refreshWindow` for scheduled-window reliability; provider/source coverage remains separate from qualifying-item counts;
- uploads `news-scan-summary.json` and `news-reliability.json` for 30 days;
- requires a successful run within 36 hours and at least 95% successful scheduled runs over the rolling 30-day window;
- fails when provider failure coverage exceeds 25%; and
- never creates or publishes Deals or portfolio companies.

A successful scan with no qualifying items is a valid empty result. A pending scan, failed scan, provider-coverage failure, and filters excluding available items remain distinct public states.

## Approved on-demand run

Use the `run-data-pipeline` repository dispatch event with `client_payload.pipeline=news`. Repository dispatch executes workflow code from the default branch; the workflow then proves the checked-out `main` SHA before receiving production credentials.

Do not add a credentialed `workflow_dispatch` or accept a caller-selected ref. Do not invoke the production scanner from a developer workstation.

## Non-production dry run

For adapter development only, use a guarded development or isolated validation database and the same production bounds:

```sh
TARGET_DATABASE=validation \
EXPECTED_DATABASE_HOST=... \
EXPECTED_DATABASE_NAME=... \
FORBIDDEN_DATABASE_HOST=... \
DATABASE_URL=... \
npm run news:scan:dry-run -- --max-targets=200 --max-pages=750
```

Never use production connection values for this command. The dry run does not replace the hosted pipeline evidence.

## Editorial and source guardrails

- Respect `robots.txt` and the scanner's public-network/SSRF protections.
- Do not scrape LinkedIn directly; retain only LinkedIn URLs discovered on public pages.
- Keep imported news in its review workflow. Automation may propose records but cannot publish Deals or portfolio companies.
- Inspect both qualifying-item counts and attempted-provider coverage. Zero items does not prove that upstream scanning succeeded.
- On failure, leave existing public records intact, inspect the retained artifact, correct the provider or credential contract, and rerun through the approved dispatch.
- Escalate an unresolved freshness breach or repeated provider failure to Operations and Engineering; do not substitute sample content.
