# InfraSight 90-Day Program — Implementation Status

**Updated:** 2026-07-23

**Branch:** `codex/infra-90-day-completion`

**Pull request:** [#223](https://github.com/mikeberry6/Infra-MA2/pull/223), draft and unmerged

## Executive status

The four-phase Next.js 15 implementation is present on the integration branch and remains deliberately unpromoted. The repository implementation covers the planned runtime/security baseline, data-trust models and workflows, product/UX cleanup, list/detail architecture, health/observability controls, release safety, and test expansion.

The program is not production-complete. Research decisions, a functional current-branch Vercel Preview environment, protected production approval, schema/data rollout, human accessibility attestation, database restore evidence, and the 30-day reliability/Core Web Vitals window remain outside the code-only completion boundary.

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

## Latest exact hosted evidence

[Release Gate run 30000617641](https://github.com/mikeberry6/Infra-MA2/actions/runs/30000617641) evaluated source head `7ed3947a77969ac84e4e6df8fe04d917148fe9fc`.

- Static job `89184680848` passed the locked install, additive migration/history audits, Prisma generation/validation, lint, both typechecks, **178 files / 1,219 tests**, offline portfolio and weekly-email validation, complete and production dependency audits, Next.js production build, and all three bundle budgets.
- Validation job `89184681004` passed target/lineage/migration/drift controls, real transaction-persistence checks, migrated-database build, five visual scenarios, 45 primary browser scenarios, four sensitive-credential scenarios, five top-level database-failure scenarios, one provider-failure scenario, and both evidence secret scanners.
- All **60 distinct Playwright scenarios** passed their intended partitions. The job remained red only because the strict editorial publication gate correctly rejected unresolved Research records.
- The exact immutable Preview was [infra-ma-2-l0cdlzcqy-mberry.vercel.app](https://infra-ma-2-l0cdlzcqy-mberry.vercel.app). Vercel built it successfully, but application data failed closed because that integration branch has no functional branch-scoped Preview database/auth configuration.
- The earlier isolated E2E credential artifact incident is closed: the credential was rotated, the affected artifact was deleted, and current scanners pass. No production credential was involved.

The final audit and interaction-hardening slice must receive its own exact-head hosted run after commit and push. PR #223 is the authoritative location for that subsequent run and commit identity.

## Current external configuration evidence

- GitHub repository variables `VERCEL_PROJECT_ID`, `VERCEL_PROJECT_NAME`, and `VERCEL_SCOPE` are configured.
- Vercel has a Preview-only GitHub Actions Trusted Source for `mikeberry6/Infra-MA2@main`, workflow `preview-smoke.yml`, and audience `https://vercel.com/infrasight-preview-smoke`.
- Vercel system environment variables are enabled.
- Vercel automatic custom-domain assignment is disabled. The production alias remains bound to the unchanged ready deployment; promotion now independently verifies this staged-promotion setting before it can mutate production.
- The current integration branch has no matching branch-scoped `DATABASE_URL`, `NEXTAUTH_URL`, or `NEXTAUTH_SECRET`; its Preview therefore cannot satisfy the new healthy-runtime smoke until Operations supplies an isolated validation configuration.
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

- Configure an isolated, current-branch Vercel Preview database and preview-only NextAuth values; then execute the trusted OIDC smoke.
- Merge/bootstrap the default-branch Preview workflow, redeploy the exact bootstrap PR head, rerun `preview-smoke-lineage`, and add `preview-smoke` to branch protection.
- Complete Research review and commit only evidence-backed, hash-bound approvals.
- Add an independent Engineering or Operations approver to the GitHub `Production` environment.
- Stage the additive schema, apply only approved remediations, validate production-like journeys, rotate the production administrator credential and `NEXTAUTH_SECRET`, and promote through protected workflows.
- Complete manual keyboard-only, WCAG 2.2 AA, and representative screen-reader attestation.
- Complete a non-production Neon restore exercise. Application rollback evidence does not substitute for database recovery evidence.

### Time-bound

- Accumulate a complete 30-day production observation window before claiming at least 95% pipeline reliability or p75 Core Web Vitals.
- Upgrade Next.js 16/React 19 in a separate branch only after that stable window. Defer Tailwind 4 until the framework release is stable.

## Completion statement

The planned repository implementation is substantially complete and locally/hosted validated to the evidence above. The program is not production-complete and must not be represented as such until the explicit Research, Preview, protected-release, recovery, accessibility, telemetry, and elapsed-time gates close.
