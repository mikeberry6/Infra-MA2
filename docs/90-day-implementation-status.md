# InfraSight 90-Day Program — Implementation Status

**Updated:** 2026-07-23

**Branch:** `codex/infra-90-day-completion`

**Pull request:** [#223](https://github.com/mikeberry6/Infra-MA2/pull/223), draft and unmerged

## Executive status

The four-phase Next.js 15 implementation is present on the integration branch and remains deliberately unpromoted. The repository implementation covers the planned runtime/security baseline, data-trust models and workflows, product/UX cleanup, list/detail architecture, health/observability controls, release safety, and test expansion.

The program is not production-complete. The current-branch Vercel Preview runtime is database-backed and functional, and its health contract fails closed as designed. The live `NEWS_SCAN` bootstrap completed successfully and is classified operationally healthy; the post-merge `DASHBOARD_SYNC` bootstrap and trusted OIDC smoke remain open. Research decisions, protected production approval, production schema/data rollout, human accessibility attestation, database restore evidence, and the 30-day reliability/Core Web Vitals window also remain outside the code-only completion boundary.

## Clean phase stack

| Phase | Pull request | Exact phase head |
| --- | --- | --- |
| Phase 1 — runtime, security, and CI | [#227](https://github.com/mikeberry6/Infra-MA2/pull/227) | `d57c148b96d05de39deb33507da48eab7cfdb825` |
| Phase 2 — data trust and operations | [#231](https://github.com/mikeberry6/Infra-MA2/pull/231) | `e39fd8c807c4d853865677b333c0d02c83c99c14` |
| Phase 3 — product and UX cleanup | [#232](https://github.com/mikeberry6/Infra-MA2/pull/232) | `91143e6c68886db41403fc764128f41f5be2b60d` |
| Phase 4 — performance, observability, and release safety | [#233](https://github.com/mikeberry6/Infra-MA2/pull/233) | `9a6f9bcb67f67fbd13f7b6f09e04e2e1574588a9` |

The phase trees were reconciled in two-parent integration commit `f97ca6122eae2061cd26adc84c54e50ebc18e0a4`. Subsequent integration safeguards and audit repairs are recorded in the history of PR #223.

## Implemented repository scope

### Phase 1 — stabilize and secure

- Node 24 and npm 11 are the sole runtime/package-manager policy.
- Next.js 15.5.21, NextAuth 4.24.15, and Prisma 7.9 are pinned as a compatible patched set.
- Complete and production-only dependency audits report zero vulnerabilities.
- Ordinary seeding creates no administrator. The guarded `admin:create` command requires runtime credentials and an exact non-production/production target contract.
- Durable authentication throttling, same-origin callback validation, security headers, role guards, and secret-safe evidence handling are implemented.
- `main` is protected and pull-request based. The release gate covers install, schema, lint, both typechecks, tests, offline validation, audits, build, bundle budgets, migrated-database checks, browser journeys, accessibility automation, and visual baselines.

### Phase 2 — data trust and operations

- `PipelineRun`, `AuditEvent`, `CompanyRedirect`, and `lastVerifiedAt` are implemented through additive migrations.
- Dashboard, news, weekly sync, imports, publication, archival, and administrative mutations use durable run/audit records.
- Scheduled pipelines have bounded concurrency, retries, freshness/coverage thresholds, and retained non-sensitive evidence.
- Publication/source/canonical-company gates fail closed and emit reviewer-neutral approval templates.
- Company merges, citations, Fund primary sources, seller treatment, ownership-to-Fund links, and dashboard methodology remain hash-bound reviewed remediations rather than automated editorial choices.
- News item/mention writes and weekly proposals are transaction-bounded, replay-safe, and covered for rollback, retry, partial-failure accounting, exact replay, and ambiguous identity rejection.

### Phase 3 — product and UX cleanup

- Four database metrics, market rankings above results, 25-row pagination, canonical `/tracker`, and URL-addressable search/filter/sort/page/focus state are implemented.
- Mobile Funds and PortCos now join Deals in direct browser coverage proving every filter is keyboard-reachable through the bottom sheet without horizontal overflow.
- Drawers implement labelled modal semantics, focus containment/restoration, Escape, background locking, lazy detail loading, and retry/error states.
- Search ranking, grouping, empty guidance, direct drawer links, route-specific loading states, and database navigation hierarchy are implemented.
- Admin forms use shared light-system components. Imports require a preview, explicit confirmation, 500-row caps, idempotent transactions, error downloads, and audit links.

### Phase 4 — performance, observability, and release safety

- Minimal list-item/detail types, three consistent detail APIs, session detail caching/invalidation, and the fail-closed six-field health endpoint are implemented.
- Public route bundles remain below 150 kB gzip and initial result pages contain at most 25 rows.
- Public-only Vercel Web Analytics/Speed Insights integration, seven bounded product events, structured safe logs, provider timing, and drawer-shell performance measurement are implemented.
- Schema staging, reviewed remediation, exact-SHA promotion, immutable deployment verification, rollback, and restore guidance are separated and fail closed.
- A trusted Vercel Preview smoke uses a default-branch workflow, GitHub OIDC Trusted Source, immutable deployment/event verification, full health/runtime smoke, token scanning, and explicit final status.
- Post-merge Preview lineage proves the previewed PR head and protected-main release have the same Git tree and binds the status to the successful trusted workflow and SHA-bearing artifact before production workflows can proceed.
- Next.js 16/React 19 and Tailwind 4 remain intentionally separate, time-bound upgrades after a stable 30-day Next.js 15 production window.

## Latest code-bearing hosted evidence

[Release Gate run 30030155221](https://github.com/mikeberry6/Infra-MA2/actions/runs/30030155221) evaluated exact source head `b07a52e23153ec67943c3d7860b6d6ac1751eac0`.

- The static job passed the locked install, additive migration/history audits, Prisma generation/validation, lint, both typechecks, offline portfolio and weekly-email validation, complete and production dependency audits, Next.js production build, and all three bundle budgets.
- The validation job passed the engineering controls and all **62 Playwright scenarios** in their intended partitions. Browser, visual, top-level database-failure, external-provider-failure, news-persistence, and both retained-artifact secret gates passed. The validation job failed only at the strict editorial publication gate, which correctly rejected the unresolved Research records enumerated below.
- The exact immutable Preview is [infra-ma-2-2s62axllj-mberry.vercel.app](https://infra-ma-2-2s62axllj-mberry.vercel.app), deployment `dpl_Bzf3RGbkZaUxjXL9c3tiBbn8qmgB`. Its guarded no-op migration deploy, migration status, schema drift check, and application build passed. Hosted checks confirmed the database-backed public routes, detail APIs, authentication boundaries, and security headers. `GET /api/health` reports a connected database and healthy `NEWS_SCAN`; it intentionally returns HTTP 503 only because `DASHBOARD_SYNC` remains `never-run`.
- The pinned live news bootstrap scanned rotating window 3 of 9, comprising 200 of 1,622 entities, 659 fetched pages, 91 failed fetches, 597 successful search queries, no deferred required seed URLs, and no page-cap breach. It persisted 6 items and 18 mentions. Independent reliability verification reports `collecting`, 100% success across the currently observed runs, a 6.76% source-issue rate, and `operationallyHealthy: true`; the 30-day exit criterion is not yet met. The public News page exposes the successful run, `1,256/1,347` source attempts, the rotating-window metadata, six items under `All`, and an explicit filter-exclusion state under the default `Today` window.
- The earlier isolated E2E credential artifact incident is closed: the credential was rotated, the affected artifact was deleted, and current scanners pass. No production credential was involved.

Together, this exact-head Release Gate and immutable Preview cover the final audit, interaction-hardening, fresh-seed verifier, Preview migration guard, and external-pipeline news-cache invalidation slice. PR #223 remains the authoritative commit/run record.

## Current external configuration evidence

- GitHub repository variables `VERCEL_PROJECT_ID`, `VERCEL_PROJECT_NAME`, and `VERCEL_SCOPE` are configured.
- Vercel has a Preview-only GitHub Actions Trusted Source for `mikeberry6/Infra-MA2@main`, workflow `preview-smoke.yml`, and audience `https://vercel.com/infrasight-preview-smoke`.
- Vercel system environment variables are enabled.
- Vercel automatic custom-domain assignment is disabled. The production alias remains bound to the unchanged ready deployment; promotion now independently verifies this staged-promotion setting before it can mutate production.
- The Vercel Neon integration is restricted to Production only; generated production database variables are absent from Preview and Development, and automatic deployment-branch actions are disabled.
- A schema-originated candidate exists as `preview-codex-infra-90-day-clean` (branch `br-sparkling-firefly-ambnknjv`; pooled host `ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech`; direct host `ep-soft-feather-am7a9o9j.c-5.us-east-1.aws.neon.tech`). Its migration ledger, migration status, and schema drift check are current; it was initialized exclusively from version-controlled seed data, and ordinary seeding created no users. Its branch-only credential was proved unable to authenticate to production. Strict Research verification still reports the review-gated citation/publication, seller, fund-source, ownership-link, historical weekly, and duplicate-company decisions described below.
- The ineligible production-copy child was deleted without ever being deployed. Branch-scoped Vercel pooled/direct variables now reference the clean candidate, and the stable Preview alias is used for branch-specific auth and public-site origins.
- `PREVIEW_DATABASE_MIGRATIONS_ENABLED` is `true` only for `codex/infra-90-day-completion`; the exact immutable Preview executed the guarded no-op migration deployment, migration status, schema drift check, and application build successfully against the clean candidate.
- The GitHub `Production` environment prevents self-review and administrator bypass, and permits deployment only from `main`. Its sole named reviewer is still the repository owner, so production intentionally remains blocked until an independent Engineering or Operations reviewer is assigned.
- Web Analytics is enabled but showed zero visitors/page views for the observed seven-day production window.
- Speed Insights is collecting: `/tracker` showed four production desktop data points and a route score of 100. This proves collection, not the 30-day p75 target.
- The Vercel Hobby plan does not expose custom Web Analytics events. The seven event emitters exist, but event-dashboard KPI verification requires a reviewed plan upgrade or another approved privacy-compatible sink.
- `main` currently requires `build`. Add `preview-smoke` only after the workflow is present on the default branch and has produced its first legitimate status; adding it earlier would deadlock bootstrap.

## Exact unresolved Research gate

The latest hosted validation reported:

- 352 Deals missing required citation/publication decisions
- 1,191 Companies missing required citation/publication decisions
- 150 Funds missing required primary-source/completeness decisions
- 194 Deals requiring seller-disclosure review
- 4 ownership-to-Fund link decisions
- 5 missing weekly-deal decisions
- 21 fuzzy duplicate-company candidate clusters

Exact normalized duplicate keys and non-HTTP source URLs were both zero. The citation template contains 1,543 rows. These counts are review workload, not authorization to infer or apply decisions.

## Remaining blockers

### External or operator-controlled

- Merge/bootstrap the default-branch Preview workflow and bootstrap `DASHBOARD_SYNC` only through reviewed default-branch code and the protected Preview environment.
- Redeploy the exact bootstrap PR head, require health 200 and trusted `preview-smoke` on that immutable deployment, rerun `preview-smoke-lineage`, and then add `preview-smoke` to branch protection.
- Complete Research review and commit only evidence-backed, hash-bound approvals.
- Add an independent Engineering or Operations approver to the GitHub `Production` environment.
- Stage the additive schema, apply only approved remediations, validate production-like journeys, rotate the production administrator credential and `NEXTAUTH_SECRET`, and promote through protected workflows.
- Complete manual keyboard-only, WCAG 2.2 AA, and representative screen-reader attestation.
- Complete a non-production Neon restore exercise. Application rollback evidence does not substitute for database recovery evidence.

### Time-bound

- Accumulate a complete 30-day production observation window before claiming at least 95% pipeline reliability or p75 Core Web Vitals.
- Upgrade Next.js 16/React 19 in a separate branch only after that stable window. Defer Tailwind 4 until the framework release is stable.

## Completion statement

The planned repository implementation is substantially complete and locally/hosted validated to the evidence above. The program is not production-complete and must not be represented as such until the Research, pipeline-fresh Preview, trusted `preview-smoke`, protected-release, recovery, accessibility, telemetry, and elapsed-time gates close.
