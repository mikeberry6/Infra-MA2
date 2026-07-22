# InfraSight 90-Day Program — Implementation Status

**Updated:** 2026-07-22

**Posture:** stabilized Next 15 repository implementation complete; isolated validation, production rollout, elapsed telemetry, and the separately gated modernization release remain open.

## Implemented in the repository

- Node 24/npm 11 policy, patched supported framework/auth/Prisma lines, locked npm installation, and a zero-high/critical production dependency gate.
- Fixed seed credentials removed; explicit administrator bootstrap, durable login throttling, callback validation, security headers, and role guards added.
- Additive operational schema foundations (`PipelineRun`, `AuditEvent`, `CompanyRedirect`, `AuthThrottle`, `lastVerifiedAt`) and migration files added.
- Dashboard/news/import/weekly synchronization instrumentation, public freshness states, scheduled workflows, retry bounds, source/provider thresholds, rolling reliability reports, and retained run artifacts added.
- Publication/source gates, reviewer-neutral citation remediation, audited mutation foundations, reviewed duplicate-merge/redirect tooling, and source-coverage reporting added. No migration or release step auto-designates a primary citation or canonical survivor.
- Database metrics/rankings, 25-row initial pages, shareable URL state, mobile filter sheets, accessible drawers, canonical `/tracker`, grouped search, preview/confirm imports, list/detail payload separation, detail APIs, health endpoint, analytics, and structured health logging added.
- Unit/integration tests, Playwright anonymous/authentication checks, axe checks, keyboard/focus checks, responsive overflow checks, and visual baselines are present.
- Protected-branch release aggregation, isolated migration/data/browser gate, reviewed data-remediation workflow, schema-first production promotion, rollback workflow, and release/incident/governance documentation are present. Third-party workflow actions are immutable-SHA pinned to current Node 24 runtimes.
- Release provenance is fail-closed in code: the requested SHA must equal the protected `main` head, its `build` check must be a successful GitHub Actions check for that exact SHA, migration manifests hash committed release blobs, and promotion validates the staged production deployment's Vercel project/target/Git SHA before changing domains.
- The application includes Web Analytics and Speed Insights. Vercel is verified to track `main` on Node 24 with automatic production-domain assignment disabled.

## Verified locally

- Node 24 production build, lint, typecheck, Vitest suite, offline data validation, weekly-email validation, production dependency audit, and public Playwright/axe/visual checks have passed during implementation.
- Public database route first-load JavaScript remains below the 150 KB objective in the current build.
- Local checks do not prove production database migration safety, authenticated end-to-end behavior on a migrated branch, 30-day reliability, real-user Core Web Vitals, credential rotation, or recovery readiness.
- The 2026-07-22 schema/application mismatch was recovered through a verified application rollback; the incident record explicitly distinguishes that from the still-pending database restore exercise.

## Verified external controls on 2026-07-22

- GitHub reports `main` as the protected default branch with strict required `build` status, one approving review, administrator enforcement, and force-push/deletion protection.
- Vercel project `infra-ma-2` reports production branch `main`, Node `24.x`, `autoAssignCustomDomains=false`, and enabled Web Analytics/Speed Insights. The immutable project and scope identifiers are configured in the GitHub `Production` environment.
- GitHub repository allowlist metadata now records the production pooled host, direct migration host, and database name. `DASHBOARD_WRITES_ENABLED=false` is explicit; no production pipeline write was enabled.
- Draft PR #223 implementation commit `8703b15832893a87b4b4a35c9d77625543ef628d` passed the complete static quality/build job and Vercel deployment check. Its isolated validation job failed before installation or database access because the validation URL, validation host/name, and validation-only administrator credentials were absent. The failed preflight retained a non-sensitive evidence artifact; documentation-only descendants must pass the same gate.
- The protected Preview for that exact SHA returns HTTP 200 for the public route smoke set and permanently redirects `/Infra-MA2` to `/Infra-MA2/tracker`. Its health endpoint correctly returns HTTP 503 with the exact release prefix, `database=connected`, and `schema=not-ready`; this is evidence that additive production schema has not been staged, not a releasable health result.
- The currently promoted legacy production deployment continues to return HTTP 200 for tracker, funds, portfolio, news, search, earnings, and login. It does not contain the new health endpoint, as expected after the verified rollback.
- Vercel metadata currently represents database and NextAuth variables as shared entries targeting Production, Preview, and Development. Preview is SSO-protected, but it is not an isolated validation environment and must not be used for authenticated or mutating acceptance tests.
- The GitHub `Production` environment currently has no required-reviewer protection rule and permits administrator bypass. Only one repository collaborator is available, so independent production approval cannot be configured without adding an authorized second reviewer or team.

## Blocking staged validation

1. Add an authorized independent Engineering or Operations reviewer/team, then require that reviewer on the GitHub `Production` environment, prevent self-review, and disable administrator bypass. Protected-`main` controls are verified, but repository code cannot preserve external settings by itself.
2. Complete Neon identity linking and identify the explicit production parent branch used for disposable validation clones.
3. Configure `NEON_API_KEY`, `NEON_PROJECT_ID`, `NEON_VALIDATION_PARENT_BRANCH`, `MIGRATION_DATABASE_URL`, `MIGRATION_DATABASE_HOST`, `MIGRATION_DATABASE_NAME`, optional `MIGRATION_DATABASE_ROLE`, and validation-only administrator secrets in GitHub. The production host/database allowlist values are already configured; mutation workflows must continue verifying both hostname and database name.
4. Replace the shared Vercel Preview database and NextAuth entries with validation-branch and preview-only values. Production branch, Node policy, automatic-domain assignment, `VERCEL_SCOPE`, and immutable `VERCEL_PROJECT_ID` are already verified/configured.
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
