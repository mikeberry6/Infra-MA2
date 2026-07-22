# InfraSight Platform Update — Implementation Status

**Prepared:** 2026-07-21

**Release posture:** Code-complete for staged validation; production rollout intentionally pending.

## Implemented

- Standardized Node 24 and npm 11 across local version files, package metadata, CI, and operations documentation.
- Patched the supported Next.js 15, NextAuth 4, and Prisma 7 lines; the production dependency audit reports zero vulnerabilities.
- Removed seeded credentials, added a transactional administrator bootstrap command, added durable account/IP login throttling, hardened callback redirects, and configured application security headers.
- Added `PipelineRun`, `AuditEvent`, `CompanyRedirect`, `AuthThrottle`, and `lastVerifiedAt` schema foundations with additive migrations.
- Instrumented dashboard, news, weekly-deal, and bulk-import workflows; added scheduled, retry-bounded GitHub Actions and public freshness/availability states.
- Added reviewed publication gates, audit-log administration, a dry-run company merge path with permanent ID redirects, and a strict published-deal citation gate.
- Added four database metrics, moved rankings above results, reduced initial rows to 25, standardized URL state, implemented mobile filter sheets, and made drawers focus-safe and deep-linkable.
- Made `/tracker` canonical with a permanent root redirect; improved grouped cross-database search and direct record links.
- Added two-step import preview/confirmation, row-level error downloads, audit links, and 500-row limits.
- Split list/detail payloads, added normalized public detail endpoints, session detail caches, explicit detail failure states, a minimal health endpoint, structured server logging, Web Analytics, and Speed Insights.
- Added one production Open Graph/Twitter social card and wired it into global metadata without changing the in-product visual identity.
- Added weekly email validation and expanded the release gate for schema, lint, type, tests, seed quality, email quality, production audit, database integrity, and build checks.

## Verified Locally

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: 17 files and 171 tests passed.
- `npm run db:validate`: passed.
- `npm run validate-portfolios`: zero structural errors.
- `npm run validate-weekly-email`: latest issue passed with 13 deals, 5 sectors, and 13 sources.
- `npm run audit:prod`: zero vulnerabilities.
- `npm run build`: passed; public database routes are 125–129 KB first-load JavaScript.
- The 171-test suite and production build also passed under a pinned Node 24.18.0 runtime (the host shell itself remains provisioned with Node 25).
- Browser smoke testing passed at 320, 390, 768, 1280, and 1440 pixels with no body-level horizontal overflow. Mobile filters, URL pagination, grouped search, permanent redirect, drawer Escape handling, body scroll locking, and trigger-focus restoration were exercised.

## Required Release Sequence

1. Create a Neon validation branch and configure `MIGRATION_DATABASE_URL` in GitHub Actions.
2. Apply `20260722030000_platform_trust_foundations`, then `20260722031500_enforce_deal_citation_gate` on that branch.
3. Confirm that the second migration moves the 16 currently source-less published deals to `DRAFT`; it does not delete them.
4. Run the full CI gate against the validation branch. `npm run db:verify` must report zero published deals missing citations.
5. Run the duplicate-company audit and review every proposed canonical survivor. Only then run `scripts/merge-duplicate-companies.ts --apply`; the script creates redirects and audit events transactionally.
6. Deploy a Vercel preview, run anonymous/admin/export smoke tests, and confirm `/api/health` is healthy after successful dashboard and news runs.
7. Apply the additive migrations to production, deploy the compatible application, rotate the administrator credential and `NEXTAUTH_SECRET`, then execute the documented rollback drill.
8. Make `main` the protected default branch and require the CI gate on pull requests.

## Intentionally Not Performed

- No production database migration, credential rotation, account creation, deployment, provider synchronization, or company merge was executed from this workspace.
- No uncited transaction was assigned a fabricated source. Source-less published records remain unchanged until the reviewed migration is applied.
- Existing unclassified worktree artifacts, historical weekly editions, research outputs, and untracked pnpm metadata were preserved pending ownership/retention classification.
- Next.js 16, React 19, and Tailwind 4 remain deferred. The Next/React upgrade should begin only after this stabilized release has operated successfully and must remain separate from schema and major UI changes.

## Current Data-Gate Exception

The present database contains 16 published records with no citation (`INF-2026-080` through `INF-2026-095`). This is the only failing local release check. The migration changes only their editorial publication state to `DRAFT`; researchers can attach primary sources and republish each record through the audited admin workflow.
