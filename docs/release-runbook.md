# Phase 1 Release and Recovery Runbook

## Release contract

Phase 1 standardizes Node 24/npm 11, patches the current Next.js/NextAuth/Prisma stack, adds durable authentication throttling, removes seeded credentials, and introduces one additive `AuthThrottle` table. It does not contain later-phase data-trust models, editorial backfills, product redesign, analytics, health endpoints, or framework-major upgrades.

Releases are pull-request based, schema-first, and reversible at the application layer. Additive migrations remain in place during an application rollback, so both the candidate and the prior deployment must be compatible with the new table.

## One-time repository and platform setup

1. Keep `main` as the protected default branch. Disallow direct pushes, force pushes, and branch deletion; require pull requests, resolved conversations, `build`, and the isolated migration-validation check.
2. Configure Vercel to use Node 24 and retain `/Infra-MA2` as the base path. Preview must use a separate Neon branch and separate NextAuth secret from Production.
3. Configure GitHub variables/secrets used by `.github/workflows/deploy.yml`: `MIGRATION_DATABASE_URL`, `MIGRATION_DATABASE_HOST`, `MIGRATION_DATABASE_NAME`, `PRODUCTION_DATABASE_HOST`, and `PRODUCTION_MIGRATION_DATABASE_HOST`.
4. Keep a previous known-good Vercel deployment available. Confirm the production environment on the staging, promotion, and rollback workflows requires an independent reviewer and prevents self-review where supported.

## Pull-request validation

The required Release Gate uses Node 24 and npm 11 to run:

- `npm ci`;
- additive migration auditing;
- Prisma generation and schema validation;
- lint, typecheck, unit/integration tests, and offline reference-data validation;
- complete and production dependency audits;
- a production build;
- migration deploy, status, and zero-drift checks against the isolated Neon branch.

Do not weaken or bypass the migration job when secrets are missing. Fix the environment configuration and rerun it.

## Production sequence

1. Freeze the approved `main` SHA and copy `docs/release-record-template.md` into the release record location.
2. Create a fresh Neon restore branch and record its identifier and timestamp.
3. Record the currently serving application SHA and immutable Vercel deployment ID.
4. Review the additive migration manifest from CI. Confirm the only Phase 1 migration creates `AuthThrottle` and its index.
5. Use the protected schema-staging workflow to apply the reviewed migration. Confirm `prisma migrate status` and schema drift are clean.
6. Smoke-test the immutable candidate under `/Infra-MA2`, including anonymous public browsing, login, five rejected login attempts, the temporary generic lock response, administrator access, denied unauthorized imports, and ADMIN/ANALYST export access.
7. Promote the exact immutable candidate through the protected production workflow. Do not rebuild or promote a mutable alias.
8. Repeat the smoke checks on the canonical production URL.
9. Bootstrap or rotate the administrator only with `npm run admin:create`, then rotate `NEXTAUTH_SECRET`. Record completion but never secret values. Rotation invalidates old privileged sessions through the User `updatedAt` snapshot.

## Rollback

The rollback changes the Vercel deployment assigned to production; it does not remove the additive table.

1. Identify the previously verified immutable deployment and its full source SHA from release records, not from a mutable alias.
2. Dispatch **Roll Back Production** from protected `main`, provide the deployment reference and SHA, and type `ROLLBACK`.
3. Approve the protected production environment. The workflow verifies project/repository/SHA identity and smoke-tests the candidate before changing production.
4. The workflow rolls back by verified deployment ID, then verifies and smoke-tests the canonical production alias.
5. Download and retain the 90-day rollback artifact. Record elapsed recovery time and any failure in the release record.

If the prior application cannot operate with the additive schema, stop and restore from the recorded Neon branch only under the database recovery procedure. Never improvise a destructive migration during an incident.

## Required drill

Before Phase 1 exits, Operations must execute a protected-environment rollback drill using a non-production Vercel project or an approved low-risk production window, then record the artifact and recovery time. Code review and local tests validate the workflow contract but do not substitute for this operator-controlled drill.
