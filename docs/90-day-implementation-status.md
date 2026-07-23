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
- Weekly-email network validation covers every unique HTTP(S) anchor, de-duplicates fragment variants, prioritizes editorial Sources when the cap binds, retains Source-specific diagnostics, and keeps malformed URLs, concurrency, per-link timeout, total-budget, and link-cap behavior deterministic.

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
- A protected, main-only Neon PITR exercise now requires independently distinct recovery/production Neon project IDs, provisions only temporary children of the allowlisted non-production validation branch, restores from an exact pre-mutation WAL LSN, verifies schema/data/application fidelity locally, scopes credentials per step, scans retained evidence, and performs annotation-bound cleanup. A separate hourly main-only janitor removes exact annotated branches older than two hours after runner loss. Neither workflow can run until its narrowly scoped environments and non-production credential are configured.
- Next.js 16/React 19 and Tailwind 4 remain intentionally separate, time-bound upgrades after a stable 30-day Next.js 15 production window.

## Latest code-bearing hosted evidence

[Release Gate run 30044300170](https://github.com/mikeberry6/Infra-MA2/actions/runs/30044300170) evaluated exact source head `37901907e4c99a5d6b192184b1f5031308e83075` and pull-request merge revision `8f9975b6c33ea6bfc42f3aaafe8306042c6aadc3`.

- The static job passed the locked install, additive migration/history audits, Prisma generation/validation, lint, both typechecks, **184 test files / 1,400 tests**, offline portfolio and weekly-email validation, complete and production dependency audits with zero vulnerabilities, the Next.js production build, and all three bundle budgets. This run includes the reviewed `find-my-way` 9.7.0 transitive override that closes GHSA-c96f-x56v-gq3h without a forced audit rewrite, plus deterministic all-anchor, Source-prioritized weekly-email link validation. The measured first-load bundles were 131.3 kB for `/tracker`, 130.1 kB for `/funds`, and 129.9 kB for `/portfolio`, each below the 150 kB limit.
- The isolated validation job passed **35 deterministic visual baselines**, **49 public browser/accessibility scenarios**, **5 authenticated mutation/accessibility scenarios**, **6 top-level database-failure/retry scenarios**, and **1 external-provider-failure scenario**. Seven credential-dependent cases were deliberately excluded from the public partition and passed in the authenticated partition where applicable. Migration deploy/status/drift, real news-persistence transactions, real dashboard persistence, and both retained-artifact secret gates also passed. The dashboard verifier proved the exact validation-target guard, two fixture providers, nine observations, one pending signal, two completed pipeline attempts, idempotent replay, transaction rollback, disconnection, and pre/post-state preservation. The secret gates scanned 22 validation files and 112 browser files with no matches. The job failed only at the final strict editorial publication aggregate, which correctly rejected the unresolved Research records enumerated below.
- The retained artifacts bind this evidence to the run through 2026-08-22: quality artifact `8578570652` (`sha256:de54d80014dd36e1e80d90d2bdcea499f9e0d52e9ae5fea1830cdb0bf9391be9`), validation artifact `8578590962` (`sha256:1e5268ac522304c5826cd984d454b5296b2708fbdc866698bed65e1708dc22cb`), and Playwright artifact `8578591433` (`sha256:4c3c572d037eb022742b0fd98ca61d2de21cc288add4b2eba340badf6d84a23e`).
- The exact immutable Preview is [infra-ma-2-390cwaief-mberry.vercel.app](https://infra-ma-2-390cwaief-mberry.vercel.app), deployment `dpl_HN1URFb2xQCRmbomVt2dixqfqYxP`; the branch alias is [infra-ma-2-git-codex-infra-90-day-completion-mberry.vercel.app](https://infra-ma-2-git-codex-infra-90-day-completion-mberry.vercel.app). Vercel reports it ready, Preview-targeted, built from the exact source head with Node 24.x and `npm ci`; the install found zero vulnerabilities. Its guarded no-op migration deploy, migration status, schema drift check, and application build passed against the clean Preview database. An authenticated immutable-deployment smoke returned HTTP 200 for `/tracker` with the expected security headers. `GET /api/health` returned release version `37901907e4c9`, a connected database, and healthy `NEWS_SCAN`; it intentionally returned HTTP 503 only because `DASHBOARD_SYNC` remains `never-run`. The production alias remains bound to unchanged ready deployment `dpl_5AArwEa4GDsjpcGNVNf6prWQyT5a`.
- The pinned live news bootstrap scanned rotating window 3 of 9, comprising 200 of 1,622 entities, 659 fetched pages, 91 failed fetches, 597 successful search queries, no deferred required seed URLs, and no page-cap breach. It persisted 6 items and 18 mentions. Independent reliability verification reports `collecting`, 100% success across the currently observed runs, a 6.76% source-issue rate, and `operationallyHealthy: true`; the 30-day exit criterion is not yet met. The public News page exposes the successful run, `1,256/1,347` source attempts, the rotating-window metadata, six items under `All`, and an explicit filter-exclusion state under the default `Today` window.
- The earlier isolated E2E credential artifact incident is closed: the credential was rotated, the affected artifact was deleted, and current scanners pass. No production credential was involved.

Together, this exact-head Release Gate and immutable Preview cover the final audit, interaction hardening, fresh-seed verifier, Preview migration guard, external-pipeline cache invalidation, real dashboard persistence, exact schedule-accounting, Neon PITR control plane, and durable recovery-janitor slice. PR #223 remains the authoritative commit/run record.

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
- The GitHub `Recovery` and `RecoveryCleanup` environments and their `NEON_RECOVERY_API_KEY`, `NEON_RECOVERY_PROJECT_ID`, independently sourced `NEON_PRODUCTION_PROJECT_ID`, and `NEON_VALIDATION_BRANCH_ID` are not configured. The checked-in exercise and janitor therefore remain non-runnable and have made no Neon API or database call.
- Web Analytics is integrated on public routes, but no production traffic sample currently supports a KPI claim.
- Speed Insights was enabled on 2026-07-22. At the 2026-07-23T18:49:23Z verification point, the Vercel project API reported `hasData: false`; collection is configured, but no Core Web Vitals result may yet be claimed. The verified Vercel billing plan is Hobby, whose Speed Insights reporting window is seven days, so it cannot produce the required 30-day p75 evidence. A reviewed Pro-or-higher upgrade or an approved privacy-compatible RUM sink is required before that observation window can begin.
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

Exact normalized duplicate keys and non-HTTP source URLs were both zero. The citation template contains 1,543 rows. Of those, the current pre-merge template has 17 rows with no candidate citation: 16 Deals require source research through the editorial workflow, while the Extenet Company row is also part of a pending canonical merge cluster. The remaining candidate ordering is deliberately neutral and is not a recommendation. These counts are review workload, not authorization to infer or apply decisions.

The immutable template digests, readiness breakdown, required review order, canonical approval paths, and acceptance evidence are recorded in the [2026-07-23 Research remediation handoff](./research-remediation-handoff-2026-07-23.md).

## Remaining blockers

### External or operator-controlled

- Merge/bootstrap the default-branch Preview workflow and bootstrap `DASHBOARD_SYNC` only through reviewed default-branch code and the protected Preview environment.
- Redeploy the exact bootstrap PR head, require health 200 and trusted `preview-smoke` on that immutable deployment, rerun `preview-smoke-lineage`, and then add `preview-smoke` to branch protection.
- Complete Research review and commit only evidence-backed, hash-bound approvals.
- Add an independent Engineering or Operations approver to the GitHub `Production` environment.
- Stage the additive schema, apply only approved remediations, validate production-like journeys, rotate the production administrator credential and `NEXTAUTH_SECRET`, and promote through protected workflows.
- Complete manual keyboard-only, WCAG 2.2 AA, and representative screen-reader attestation.
- Configure the independently reviewed, main-only GitHub `Recovery` environment and the narrow automated `RecoveryCleanup` environment with a project-scoped non-production Neon API identity and a separately sourced production project ID. Verify the janitor, then run and retain the protected PITR exercise. Application rollback or local mocks do not substitute for database recovery evidence.
- Approve either a Vercel plan with at least 30 days of Speed Insights history or a privacy-compatible RUM sink; do not claim that the current Hobby dashboard can retain the required window.

### Time-bound

- Accumulate a complete 30-day production observation window before claiming at least 95% pipeline reliability. After the approved performance-evidence capability is active, separately accumulate a complete 30-day Production mobile/desktop p75 Core Web Vitals window.
- Upgrade Next.js 16/React 19 in a separate branch only after that stable window. Defer Tailwind 4 until the framework release is stable.

## Completion statement

The planned repository implementation is substantially complete and locally/hosted validated to the evidence above. The program is not production-complete and must not be represented as such until the Research, pipeline-fresh Preview, trusted `preview-smoke`, protected-release, recovery, accessibility, telemetry, and elapsed-time gates close.
