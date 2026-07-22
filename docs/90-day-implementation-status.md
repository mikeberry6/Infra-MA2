# InfraSight 90-Day Program — Implementation Status

**Updated:** 2026-07-22

**Posture:** substantial implementation complete; staged validation and production rollout remain open.

## Implemented in the repository

- Node 24/npm 11 policy, patched supported framework/auth/Prisma lines, locked npm installation, and a zero-high/critical production dependency gate.
- Fixed seed credentials removed; explicit administrator bootstrap, durable login throttling, callback validation, security headers, and role guards added.
- Additive operational schema foundations (`PipelineRun`, `AuditEvent`, `CompanyRedirect`, `AuthThrottle`, `lastVerifiedAt`) and migration files added.
- Dashboard/news/import/weekly synchronization instrumentation, public freshness states, scheduled workflows, retry bounds, source/provider thresholds, rolling reliability reports, and retained run artifacts added.
- Publication/source gates, reviewer-neutral citation remediation, audited mutation foundations, reviewed duplicate-merge/redirect tooling, and source-coverage reporting added. No migration or release step auto-designates a primary citation or canonical survivor.
- Database metrics/rankings, 25-row initial pages, shareable URL state, mobile filter sheets, accessible drawers, canonical `/tracker`, grouped search, preview/confirm imports, list/detail payload separation, detail APIs, health endpoint, analytics, and structured health logging added.
- Unit/integration tests, Playwright anonymous/authentication checks, axe checks, keyboard/focus checks, responsive overflow checks, and visual baselines are present.
- Protected-branch release aggregation, isolated migration/data/browser gate, reviewed data-remediation workflow, schema-first production promotion, rollback workflow, and release/incident/governance documentation are present.
- Release provenance is fail-closed in code: the requested SHA must equal the protected `main` head, its `build` check must be a successful GitHub Actions check for that exact SHA, migration manifests hash committed release blobs, and promotion validates the staged production deployment's Vercel project/target/Git SHA before changing domains.
- The application includes Web Analytics and Speed Insights. Repository controls require Vercel to track `main` on Node 24 with automatic production-domain assignment disabled; that external setting still requires staged verification below.

## Verified locally

- Node 24 production build, lint, typecheck, Vitest suite, offline data validation, weekly-email validation, production dependency audit, and public Playwright/axe/visual checks have passed during implementation.
- Public database route first-load JavaScript remains below the 150 KB objective in the current build.
- Local checks do not prove production database migration safety, authenticated end-to-end behavior on a migrated branch, 30-day reliability, real-user Core Web Vitals, credential rotation, or recovery readiness.
- The 2026-07-22 schema/application mismatch was recovered through a verified application rollback; the incident record explicitly distinguishes that from the still-pending database restore exercise.

## Blocking staged validation

1. Reconfirm that protected `main` still requires the exact `build` context and that the GitHub `production` environment still enforces the intended reviewer, self-review, and bypass settings. Confirm the GitHub branch API reports protection before release; repository code cannot preserve external settings by itself.
2. Complete Neon identity linking and identify the explicit production parent branch used for disposable validation clones.
3. Configure `NEON_API_KEY`, `NEON_PROJECT_ID`, `NEON_VALIDATION_PARENT_BRANCH`, `MIGRATION_DATABASE_HOST`, `MIGRATION_DATABASE_NAME`, optional `MIGRATION_DATABASE_ROLE`, `PRODUCTION_DATABASE_HOST`, `PRODUCTION_MIGRATION_DATABASE_HOST`, `PRODUCTION_DATABASE_NAME`, and validation-only administrator secrets in GitHub. Mutation workflows must verify both hostname and database name.
4. Scope Vercel Preview to the validation branch with preview-only NextAuth values. Configure `VERCEL_SCOPE` and immutable `VERCEL_PROJECT_ID`; confirm `main` is the production branch, Node 24 is selected, and automatic production-domain assignment is disabled.
5. Run the complete pull-request and merged-`main` Release Gates against the isolated branch. Review the exact committed-blob migration manifest and evidence artifacts.
6. Resolve canonical company clusters and published-source gaps through the two-pass validation review: commit the all-status `company-merges.json` decision first, regenerate citation candidates after validation merges, then commit `primary-citations.json`. Both are hash/snapshot-bound and reviewed; do not fabricate citations, infer the first source, automate survivor selection, or place remediation in a schema migration.
7. Exercise the authenticated draft/review/publish/import-preview/export journeys on Preview and retain evidence.

## Blocking production completion

- Merge all reviewed remediation approvals first, freeze `main`, record the exact current protected-main SHA and current production base SHA, review the additive manifest hash, and identify the matching staged production deployment.
- Create and record a Neon production restore branch, stage additive schema, apply only explicit reviewed citation/company decisions, rerun strict source/canonical-data gates, and then execute protected promotion.
- Prove the staged Vercel candidate has target `production`, the configured immutable project ID, exact release Git SHA, and no automatic domain assignment. A Preview deployment is not the normal promotion candidate.
- Verify health, public/admin journeys, audit creation, provider freshness, and authorization on the canonical URL.
- Rotate the production administrator credential and `NEXTAUTH_SECRET` through secure channels.
- Complete and record an application rollback and database restore exercise.
- Accumulate at least 30 days of pipeline and real-user performance telemetry before claiming the 95% reliability or p75 Core Web Vitals objectives.
- Decide whether to purchase Vercel Pro custom-event reporting. The allowlisted high-value event calls are implemented, but the current Hobby analytics tier reports page traffic only and explicitly excludes custom events; no paid upgrade was authorized.
- Complete Research-approved citation decisions, duplicate merges with redirects, and the `lastVerifiedAt` review backlog without rewriting historical weekly editions.

## Intentionally deferred

Next.js 16/React 19 remains a separate modernization release after a stable 30-day Next 15 operating window. It must not include schema migrations or major UI changes. Tailwind 4 remains later still.

The parallel fund-refresh skill, proposal/evidence schema, research artifacts, and apply/rollback workflows are excluded from this clean 90-day release. They require their own reviewed branch, validation record, and rollout decision; their presence in the shared worktree is not evidence that this program implemented or approved them.

The program is not complete merely because code exists. Completion requires the external configuration, reviewed data work, protected release, rotations, recovery exercise, and elapsed reliability/performance evidence above.
