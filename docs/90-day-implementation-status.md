# InfraSight 90-Day Program — Implementation Status

**Updated:** 2026-07-22

**Posture:** stabilized Next 15 repository implementation is substantially complete; isolated validation, production rollout, elapsed telemetry, and the separately gated modernization release remain open.

## Implemented in the repository

- Node 24/npm 11 policy, patched supported framework/auth/Prisma lines, locked npm installation, and a zero-high/critical production dependency gate.
- Fixed seed credentials removed; explicit administrator bootstrap, durable login throttling, callback validation, security headers, and role guards added.
- Additive operational schema foundations (`PipelineRun`, `AuditEvent`, `CompanyRedirect`, `AuthThrottle`, `lastVerifiedAt`) and migration files added.
- Dashboard/news/import/weekly synchronization instrumentation, public freshness states, scheduled workflows, retry bounds, source/provider thresholds, rolling reliability reports, and retained run artifacts added.
- Publication/source gates, reviewer-neutral citation and ownership-link remediation, audited mutation foundations, reviewed duplicate-merge/redirect tooling, and source-coverage reporting added. No migration or release step auto-designates a primary citation, canonical survivor, or ownership vehicle.
- Database metrics/rankings, 25-row initial pages, shareable URL state, mobile filter sheets, accessible drawers, canonical `/tracker`, grouped search, preview/confirm imports, list/detail payload separation, detail APIs, health endpoint, analytics, and structured health logging added.
- Unit/integration tests, Playwright anonymous/authentication checks, axe checks, keyboard/focus checks, responsive overflow checks, and visual baselines are present.
- Protected-branch release aggregation, isolated migration/data/browser gate, reviewed data-remediation workflow, schema-first production promotion, rollback workflow, and release/incident/governance documentation are present. Production operations and data pipelines share one non-cancelling lock; staging and dashboard cutovers require an explicit dashboard-write freeze. Third-party workflow actions are immutable-SHA pinned to current Node 24 runtimes.
- Release provenance is fail-closed in code: the requested SHA must equal the protected `main` head, its `build` check must be a successful GitHub Actions check for that exact SHA, migration manifests hash committed release blobs, and promotion validates the staged production deployment's Vercel project/target/Git SHA before changing domains.
- The application includes Web Analytics and Speed Insights. Vercel is verified to track `main` on Node 24 with automatic production-domain assignment disabled.

## Verified locally

- Node 24 production build, lint, typecheck, Vitest suite, offline data validation, weekly-email validation, and production dependency audit have passed during implementation. A database-free local Playwright run passed the ten non-database public checks, skipped two credential-dependent authentication checks, and correctly could not complete 24 database-backed journeys; the full browser/axe/visual gate therefore remains unproved until the isolated migrated branch is configured.
- Public database route first-load JavaScript remains below the 150 KB objective in the current build.
- Local checks do not prove production database migration safety, authenticated end-to-end behavior on a migrated branch, 30-day reliability, real-user Core Web Vitals, credential rotation, or recovery readiness.
- The 2026-07-22 schema/application mismatch was recovered through a verified application rollback; the incident record explicitly distinguishes that from the still-pending database restore exercise.

## Verified external controls on 2026-07-22

- GitHub reports `main` as the protected default branch with strict required `build` status, one approving review, administrator enforcement, and force-push/deletion protection.
- Vercel project `infra-ma-2` reports production branch `main`, Node `24.x`, an explicit `npm ci` install command, `autoAssignCustomDomains=false`, and enabled Web Analytics/Speed Insights. The immutable project and scope identifiers are configured in the GitHub `Production` environment.
- GitHub repository allowlist metadata records the production pooled host, direct migration host, and database name. `DASHBOARD_WRITES_ENABLED=false` is explicit; no production pipeline write was enabled.
- The most recent Draft PR #223 head exercised by the hosted Release Gate, `d0095e1772ec68bbac21c2612b42c651dfa16ff9`, passed the complete static quality/test/audit/build job and Vercel deployment check in [Release Gate run 29953206620](https://github.com/mikeberry6/Infra-MA2/actions/runs/29953206620). The suite contained 108 Vitest files and 656 tests; the production build kept tracker, funds, and portfolio first-load JavaScript below 150 KB.
- The same run proved the disposable validation database target, applied the additive migration set, verified migration status and zero schema drift, and generated neutral remediation artifacts. It then failed closed at the strict publication gate: 352 published deals and 1,191 published companies lack a selected primary citation; 21 duplicate-company clusters, four stale ownership-to-fund links, and five missing July 3 weekly records remain. The citation template has 1,543 items, 18,649 candidates, and 17 zero-candidate items.
- Validation artifacts `quality-evidence-29953206620` and `validation-evidence-29953206620` are retained for 30 days. Because the strict data gate failed, validation administrator creation, the database-backed build, and 43 Playwright journeys were correctly skipped.
- The Vercel preview for that head succeeded but redirects unauthenticated requests to Vercel SSO. The currently promoted legacy production deployment remains untouched; no production migration, data remediation, credential rotation, or promotion occurred.
- The GitHub `Production` environment now names `mikeberry6` as a required reviewer, but self-review prevention is not enabled. This does not satisfy the program's independent Engineering/Operations production approval requirement.

## Blocking staged validation

1. Add an authorized independent Engineering or Operations reviewer/team, enable self-review prevention for the GitHub `Production` environment, and disable any applicable administrator bypass. Protected-`main` controls are verified, but repository code cannot enforce this external control.
2. Research reviews the 21 all-status company clusters first and commits only approved `company-merges.json` decisions. The Extenet source-gap row is part of cluster 9 and should be resolved through that reviewed merge rather than a redundant source backfill.
3. Rerun validation after merge decisions and discard the stale pre-merge citation and ownership templates. Research then reviews the freshly regenerated citation and ownership-link sets; the pre-merge citation template contained 1,543 items. Fifteen of its 16 zero-candidate deal rows now have authoritative candidate sources documented in `audits/primary-citation-source-gap-review-2026-07-22.md`; DTG Recycle still lacks a reliable public primary transaction source.
4. Review the five July 3 records individually using `audits/weekly-deal-publication-review-2026-07-03.md`. Do not modify the historical weekly email; apply only separately approved current database/seed corrections.
5. Commit exact hash-bound `ownership-fund-links.json` and post-merge `primary-citations.json` approvals, rerun the Release Gate until strict data verification passes, and retain the full 43-journey authenticated/browser/axe/visual evidence.

## Blocking production completion

- Merge reviewed citation/company/ownership-link approvals, freeze `main`, record the exact current protected-main SHA plus the independent production-application and applied-migration baselines, review the additive manifest hash, and identify the matching staged production deployment. Production dashboard manifests are generated only after schema staging; their reviewed approval commits require a new exact-SHA gate and a verified no-op restage when the migration tree is unchanged.
- Create and record a Neon production restore branch, set `DASHBOARD_WRITES_ENABLED=false`, stage additive schema, apply only explicit reviewed citation/company/ownership-link/dashboard decisions under the shared production lock, run and review an all-source dry run, re-enable writes, verify one live synchronization, rerun strict gates, and then execute protected promotion.
- Prove the staged Vercel candidate has target `production`, the configured immutable project ID, exact release Git SHA, and no automatic domain assignment. A Preview deployment is not the normal promotion candidate.
- Verify health, public/admin journeys, audit creation, provider freshness, and authorization on the canonical URL.
- Rotate the production administrator credential and `NEXTAUTH_SECRET` through secure channels.
- Complete and record an application rollback and database restore exercise.
- Accumulate at least 30 days of pipeline and real-user performance telemetry before claiming the 95% reliability or p75 Core Web Vitals objectives.
- Decide whether to purchase Vercel Pro custom-event reporting. The allowlisted high-value event calls are implemented, but the current Hobby analytics tier reports page traffic only and explicitly excludes custom events; no paid upgrade was authorized.
- Complete Research-approved citation decisions, ownership-link repairs, duplicate merges with redirects, five current weekly-record reviews, and the `lastVerifiedAt` backlog without rewriting historical weekly editions.

## Intentionally deferred

Next.js 16/React 19 remains a separate modernization release after a stable 30-day Next 15 operating window. It must not include schema migrations or major UI changes. Tailwind 4 remains later still.

The parallel fund-refresh skill, proposal/evidence schema, research artifacts, and apply/rollback workflows are excluded from this clean 90-day release. They require their own reviewed branch, validation record, and rollout decision; their presence in the shared worktree is not evidence that this program implemented or approved them.

The program is not complete merely because code exists. Completion requires the external configuration, reviewed data work, protected release, rotations, recovery exercise, and elapsed reliability/performance evidence above.
