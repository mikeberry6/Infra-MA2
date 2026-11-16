# Evidence-backed news pipeline

## Architecture and project conventions

- Infra-MA2 is a Next.js 15 App Router application. Public pages use Prisma-backed view models. The public News Feed is at `/news`. It historically reads published `NewsItem` and `NewsMention` rows and uses the existing news cache tag.
- The PostgreSQL schema uses canonical `Company`, `Organization`, `Fund`, and `Deal` IDs. `Organization.types` distinguishes fund managers and financial or legal advisers, and `Alias`, company aliases, and company redirects support canonical identity. Published fund and deal links use their existing legacy IDs. Deal counts use published deals and their original announcement dates. Ownership and fund attribution have separate records.
- Ordinary app reads use the shared Prisma client with the Neon HTTP adapter for remote databases. Interactive transactions use the existing PrismaPg serializable transaction helper. Admin pages and server actions use the existing NextAuth identity checks, and decisions write the existing actor-linked audit log.
- GitHub Actions already runs the nightly news scanner, and `PipelineRun` records pipeline health. The evidence pipeline adds a PostgreSQL work ledger and attempt history. GitHub Actions and local CLI invocations use the same worker. When the evidence review cutover is active, the legacy scanner reports discovery activity and existing public legacy records stay visible.
- Follow `AGENTS.md`, `docs/operations.md`, and `scripts/research/full-universe-protocol.md`. Apply additive migrations on an isolated database for validation. Production schema or curated data updates use the protected release path.

## First milestone — Evidence intake and editorial review

1. Configure the approved SEC EDGAR TXNM Energy pilot for staging. Allow public primary Form 8-K and 8-K/A HTML for CIK `0001108426`. The source policy records the approved retention, processing, and publication fields. The firm may be named without an attributable specific fund vehicle. Synthetic multi-story newsletters are for local or staging fixtures.
2. Keep separate identifiers for delivery, source document, immutable content version, story range, processing job, development and transaction thread. Record corrections and later disclosures as evidence or event revisions. A recap can support a prior event without becoming a new acquisition.
3. Capture and screen the filing, extract claims, and match candidates through Prisma. Use the exact approved model settings for each attempt. The admin screen shows cited passages, claims, matches, classification, a proposed deal change when applicable, and draft copy.
4. In the existing admin account, open `/admin/news-evidence` and review the draft. Confirm the appropriate thread, prior development or legacy item if applicable. Approve, edit, or reject. After approval, check `/news` and confirm only reviewed copy and permitted source metadata are exposed.

### Local and staging configuration

- Set `NEWS_PIPELINE_TARGET=staging` and use an isolated Neon branch or local PostgreSQL. The write guard requires `DATABASE_URL`, `EXPECTED_DATABASE_HOST`, `EXPECTED_DATABASE_NAME`, and `FORBIDDEN_DATABASE_HOST`. Use `FORBIDDEN_DATABASE_HOST_2` for a second production alias.
- Set `NEWS_EVIDENCE_ENABLED=true` on the local or staging app to enable the governed feed projection. In production the GitHub Actions repository variable of the same name governs the legacy cutover. Coordinate schema, app, and scheduler configuration in that order before activation.
- Set `OPENAI_API_KEY` for live processing and `SEC_USER_AGENT` to a project name and contact email for SEC access. On GitHub, save `OPENAI_API_KEY` under Settings → Environments → `staging` → Environment secrets. In the OpenAI staging project, create a restricted key with Write access to Responses. The default models are `gpt-6-luna` for screening and `gpt-6.1-sol` for extraction and ambiguous matching. The GitHub runner reads the existing `SEC_USER_AGENT` secret, with the corresponding variable as a fallback.
- The staged Actions runner uses `NEWS_STAGING_DATABASE_URL`, `NEWS_STAGING_DATABASE_HOST`, `NEWS_STAGING_DATABASE_NAME`, `PRODUCTION_DATABASE_HOST`, and optionally `PRODUCTION_DATABASE_HOST_UNPOOLED`. Enable the nightly staging poll with the repository variable `NEWS_EVIDENCE_STAGING_ENABLED=true`. It checks a 14-day overlap. For an older filing, dispatch by accession. The run summary and attempt ledger help triage retrying and failed jobs. A lost response after provider execution may require another billable call.
- Smoke-test an approved source with `npm run news:evidence -- capture-edgar --accession=0001108426-25-000048` and `npm run news:evidence -- process --limit=20`. Compare the draft with the filing before approval. The signing date is May 18, 2025, the filing date is May 19, 2025, and the US$61.25 amount is cash per share. A follow-up correction can be linked in review. Find this historical filing on the public feed with the **All** date filter.
- After correcting a terminal failure, enqueue a replay with `NEWS_PROCESSING_VERSION=2 npm run news:evidence -- reprocess --version-id=<version-id>` using a processing version that the source version has not run before. Prior attempts remain available. Prompt and schema versions are recorded separately. Load synthetic source fixtures with `npm run news:evidence -- load-fixtures`. The PostgreSQL integration tests use deterministic model responses and cover correction, multistory, recap, ambiguity, and retry cases.
- SEC public filing reuse and access policies are documented at [SEC webmaster FAQ](https://www.sec.gov/about/webmaster-frequently-asked-questions) and [EDGAR fair access](https://www.sec.gov/search-filings/edgar-search-assistance/accessing-edgar-data). The OpenAI adapter uses `store: false`; follow the source policy when sending content and account for the provider's [API data controls](https://developers.openai.com/api/docs/guides/your-data).

## Second milestone — Explicit deal apply

The supported apply action closes a matched existing deal, optionally filling an explicitly evidenced closing date. It requires the currently approved closing revision, exact claim references, and the record version captured by the proposal. Repeated application returns the original receipt. Missing values preserve existing fields, and a newer deal edit requires a refreshed proposal. A new deal or ownership change remains a preview. Leave `NEWS_DEAL_MUTATIONS_ENABLED` disabled until verified in staging, with the same explicit target settings as the CLI.

## Third milestone — Morning digest

The admin archive at `/admin/news-evidence/digest` records daily 6:15 a.m. Eastern editions, including weekends and empty editions. Set `NEWS_DIGEST_ENABLED=true` and `NEWS_DIGEST_START_DATE` after staging verifies ingestion, review, publication, and recovery. Run `npm run news:digest` for a manual catch-up on the configured target. The scheduler reconstructs due cutoffs in order, picks the latest eligible revision as of each cutoff, and reserves its material revision once. Material corrections surface as new entries. Copy-only edits reuse the preceding material revision. The existing weekly briefing remains independently curated.

## Milestone verification

The isolated migration applied the additive SQL to a baseline generated from the prior Prisma schema with existing deals and news already present. Schema comparison reported no drift. The migration lineage assumes a pre-existing database. With a disposable loopback `DATABASE_URL`, run the focused PostgreSQL suite with:

```sh
NEWS_TEST_DATABASE_URL="$DATABASE_URL" npm test -- --no-file-parallelism src/modules/news-evidence
```

| Milestone | Verified | Remaining step |
| --- | --- | --- |
| SEC intake and review | Verified deterministic replay on disposable PostgreSQL and live Luna screening and Sol extraction on an isolated Neon database. Chromium verified the authenticated review, one approved TXNM merger item in the anonymous feed, and the digest archive. The record fingerprint confirmed that the existing deal and news controls were preserved. | Verify the hosted staging feed and exercise the staging schedule. |
| Deal apply | PostgreSQL tests exercised stale-version rejection, repeat apply, a single audit receipt, preservation of omitted fields, and preservation of the existing deal ID and announcement date. | Enable the apply switch only on the verified staging target. |
| Morning digest | PostgreSQL tests exercised cutoff catch-up and carryover of a late approval. Unit tests covered both daylight-saving changes, copy edits, and material corrections. | Enable the staged 6:15 a.m. schedule after the live-model review workflow is verified. |
