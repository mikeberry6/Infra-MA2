# Phase 1–3 Release and Recovery Runbook

## Release contract

Phase 1 standardizes Node 24/npm 11, patches the current Next.js/NextAuth/Prisma stack, adds durable authentication throttling, and removes seeded credentials. Phase 2 adds additive data-trust fields and the `PipelineRun`, `AuditEvent`, and `CompanyRedirect` models; explicit primary-citation, seller-disclosure, and Fund primary-source fields; reviewed remediation commands; and bounded dashboard/news/weekly validation workflows. Phase 3 adds signed, one-use import previews; URL-addressable public databases; 25-row pagination; responsive filter sheets; accessible drawers and administration; ranked cross-database search; and Playwright, axe, keyboard, responsive, and five-width visual gates.

This release does not contain deal or Fund detail APIs, the Phase 4 detail-cache architecture, health endpoints, analytics, structured request observability, bundle/performance budgets, or framework-major upgrades.

Releases are pull-request based, schema-first, and reversible at the application layer. Additive migrations remain in place during an application rollback, so both the candidate and the prior deployment must be compatible with the new table.

## One-time repository and platform setup

1. Keep `main` as the protected default branch. Disallow direct pushes, force pushes, and branch deletion; require pull requests, resolved conversations, `build`, and the isolated migration-validation check.
2. Configure Vercel to use Node 24 and retain `/Infra-MA2` as the base path. Preview must use a separate Neon branch and separate NextAuth secret from Production.
3. Create isolated Neon validation branches for the applicable release contracts below. Do not use Production, a shared development database, or one phase's validation branch for another phase.
4. Keep a previous known-good Vercel deployment available. Confirm the production environment on the staging, promotion, and rollback workflows requires an independent reviewer and prevents self-review where supported.

## Validation database variable contracts

The variable names are intentionally distinct because they address different workflows and migration baselines:

- A Phase 1-only release gate uses the `PHASE1_MIGRATION_DATABASE_URL` secret and the `PHASE1_MIGRATION_DATABASE_HOST` and `PHASE1_MIGRATION_DATABASE_NAME` variables. Its Neon branch must contain the Phase 1 baseline only.
- The current Phase 3 pull-request Release Gate deliberately continues to use the isolated Phase 2 Neon branch contract: the `PHASE2_MIGRATION_DATABASE_URL` secret and the `PHASE2_MIGRATION_DATABASE_HOST` and `PHASE2_MIGRATION_DATABASE_NAME` variables. It also requires `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` secrets for authenticated browser journeys. Configure `PRODUCTION_DATABASE_HOST` and `PRODUCTION_MIGRATION_DATABASE_HOST` so the validation target can reject both production endpoints. CI maps the same isolated URL to `DATABASE_URL` and `E2E_DATABASE_URL`, sets `TARGET_DATABASE=validation`, and generates a run-specific `NEXTAUTH_SECRET`; no checked-in or shared secret is used.
- The Phase 2 **Review or Remediate Release Data** workflow uses the `MIGRATION_DATABASE_URL` secret and the `MIGRATION_DATABASE_HOST` and `MIGRATION_DATABASE_NAME` variables for its `validation` target. It maps those values to internal `VALIDATION_DATABASE_*` names and keeps the separate `PRODUCTION_MIGRATION_DATABASE_*` contract for an explicitly selected production target.

Do not alias Phase 1, Phase 2 Release Gate, or Phase 2 remediation names to one another. Each workflow must receive the exact protected secret and variables it declares.

## Pull-request validation

The required Release Gate uses Node 24 and npm 11 to run:

- `npm ci`;
- additive migration auditing;
- Prisma generation and schema validation;
- lint, typecheck, unit/integration tests, and offline reference-data validation;
- operational-script typecheck, historical-weekly-email audit, and current weekly-email validation;
- complete and production dependency audits;
- a production build;
- migration deploy, status, and zero-drift checks against the isolated Neon branch;
- neutral remediation-template generation and strict publication/source/canonical-company gates;
- a clean-fixture five-width visual baseline gate before authenticated mutations;
- anonymous and authenticated Playwright journeys, axe checks, keyboard/focus checks, reduced-motion coverage, and responsive/no-overflow coverage;
- post-journey fixture cleanup and browser/visual evidence upload before fail-closed enforcement.

Do not weaken or bypass the migration job when secrets are missing. Fix the environment configuration and rerun it.

## Production sequence

1. Freeze the approved `main` SHA and copy `docs/release-record-template.md` into the release record location.
2. Create a fresh Neon restore branch and record its identifier and timestamp.
3. Record the currently serving application SHA and immutable Vercel deployment ID.
4. Review the additive migration manifest from CI. Confirm the ordered chain retains `20260722220000_auth_throttle`, then adds the Phase 2 trust foundation, non-mutating citation gate, primary-citation indexes, seller-disclosure fields, and Fund primary-source field, followed only by the Phase 3 `ImportPreview` token table. The trust migration must not recreate `AuthThrottle`, and `CompanyRedirect.retiredId` must remain an opaque identifier rather than a foreign key.
5. Use the protected schema-staging workflow to apply the reviewed migrations. Confirm `prisma migrate status` and schema drift are clean.
6. Generate neutral company-merge, ownership-link, Fund-source, seller-disclosure, and citation review templates. Apply a remediation only when its tracked approval file, exact SHA-256, named reviewer, mutation reason, and release SHA are present. Never infer approvals from a report.
7. Run database verification, strict source coverage, and canonical-company checks on the isolated branch. A missing approval or incomplete publication gate remains a release blocker; do not weaken the check.
8. Smoke-test the immutable candidate under `/Infra-MA2`, including root redirection; shareable browse/search/filter/sort/pagination/drawer URLs; mobile filter sheets; keyboard focus restoration; public database freshness/provenance states; dashboard/news successful-empty and failure states; login throttling; two-step import preview/confirmation; denied unauthorized imports; and ADMIN/ANALYST export access.
9. Promote the exact immutable candidate through the protected production workflow. Do not rebuild or promote a mutable alias.
10. Repeat the smoke checks on the canonical production URL and verify the scheduled pipeline workflows remain fail-closed until their production variables are explicitly enabled.
11. Bootstrap or rotate the administrator only with `npm run admin:create`, then rotate `NEXTAUTH_SECRET`. Record completion but never secret values. Rotation invalidates old privileged sessions through the User `updatedAt` snapshot.

## Rollback

The rollback changes the Vercel deployment assigned to production; it does not remove the additive table.

1. Identify the previously verified immutable deployment and its full source SHA from release records, not from a mutable alias.
2. Dispatch **Roll Back Production** from protected `main`, provide the deployment reference and SHA, and type `ROLLBACK`.
3. Approve the protected production environment. The workflow verifies project/repository/SHA identity and smoke-tests the candidate before changing production.
4. The workflow rolls back by verified deployment ID, then verifies and smoke-tests the canonical production alias.
5. Download and retain the 90-day rollback artifact. Record elapsed recovery time and any failure in the release record.

If the prior application cannot operate with the additive schema, stop and restore from the recorded Neon branch only under the database recovery procedure. Never improvise a destructive migration during an incident.

## Required drill

Before Phase 3 exits, Operations must execute a protected-environment rollback drill using a non-production Vercel project or an approved low-risk production window, then record the artifact and recovery time. Code review and local tests validate the workflow contract but do not substitute for this operator-controlled drill.
