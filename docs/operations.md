# Operations

## External Access

This repository is connected to:

- GitHub: `mikeberry6/Infra-MA2`
- Vercel project: `mberry/infra-ma-2`
- Production URL: `https://infra-ma-2.vercel.app/Infra-MA2`

The local workspace should be linked with:

```bash
vercel link --yes --project infra-ma-2
vercel env pull .env.local
gh auth status -h github.com
```

Do not commit `.vercel/` or `.env.local`.

## Standard Verification

The required routine gate mirrors CI:

```bash
npm run db:seed:validate
npm run typecheck
npm test
npm run build
```

Also run `npm run lint` for JavaScript or TypeScript changes,
`npm run validate-portfolios` when portfolio seed content changes, and
`npm run db:verify` only when the task intentionally validates a selected,
populated database. UI, copy, workflow, and other schema-free changes do not
require live database verification.

`npm run doctor` checks local GitHub/Vercel auth, env names, typecheck, and tests.

## Release Lanes

### Routine code and content

An explicit user instruction to ship, push, deploy, or publish a scoped change
authorizes the complete routine release sequence:

1. Create a branch from current `main`, commit the scoped change, and push it.
2. Open a pull request targeting `main` and enable squash auto-merge.
3. Let the single required pull-request `build` check complete. Superseded runs
   for the same pull request are cancelled automatically.
4. GitHub squash-merges automatically after the required build passes and all
   actionable conversations are resolved. Vercel's Git integration deploys the
   resulting `main` SHA to Production; do not dispatch a separate promotion job.
5. Confirm the GitHub Production deployment references the merged SHA, then run
   the public smoke test:

   ```bash
   node scripts/release-smoke.mjs \
     --base-url=https://infra-ma-2.vercel.app \
     --skip-health \
     --allow-legacy-root
   ```

   If a newer `main` deployment supersedes the requested SHA before the check
   completes, verify that the active production SHA descends from the requested
   merge, then smoke-test the active deployment.

Feature-branch pushes do not run CI on their own. The automatic post-merge
`main` build is retained as exact-SHA provenance for protected schema and data
workflows; it requires no operator action and is not a second promotion gate.

There is no `Promote Code-Only Release` workflow. Merging a routine change to
`main` is the production promotion.

### Schema and production data

Operator-initiated changes that write production schema or curated production
data remain on the protected migration or mutation path. Use the applicable
workflow from protected `main`, retain database-target and migration-lineage
checks, and wait for the single `production` environment approval before its
write. Routine UI, copy, editorial, and schema-free application changes must
not use this lane. Scheduled bounded pipelines retain their existing automatic
admission, target verification, and write guards; they are not release-lane
approvals.

Rollback remains a protected operation. If Vercel deploys successfully but the
canonical smoke test fails, use **Roll Back Dashboard Release** with a verified
deployment and SHA; additive migrations remain in place.

## Production Notes

- Vercel is configured for Node 24.x.
- GitHub Actions should match that runtime.
- Admin, import, and export routes require NextAuth roles.
- Database writes should go through explicit scripts or admin actions, never ad hoc manual edits without a logged command path.

## Production-Safe Database Seeding

Database seeding is a bootstrap operation for a local database or an isolated
Neon validation branch. It is never an application-update mechanism and cannot
be run against production.

The default command is a database-free dry run:

```bash
npm run db:seed
```

It validates deals, funds, companies, enum mappings, dates, identifiers,
publication-source state, and logical row counts. It prints a SHA-256
fingerprint of the exact seed manifest. No database URL is required, no Prisma
client is created, and no writes are attempted. The same validation runs in the
required CI build:

```bash
npm run db:seed:validate
```

Applying the seed requires the deliberately named command plus all of these
controls:

- `SEED_TARGET=local` for a loopback PostgreSQL server, or
  `SEED_TARGET=neon-validation` for an isolated Neon endpoint.
- `SEED_CONFIRM=SEED-NON-PRODUCTION` exactly.
- `DATABASE_URL`, `EXPECTED_DATABASE_HOST`, and
  `EXPECTED_DATABASE_NAME` identifying the same target.
- At least one `FORBIDDEN_DATABASE_HOST` identifying the current production
  endpoint. A second production alias can be supplied through
  `FORBIDDEN_DATABASE_HOST_2`.

Example for a local disposable database:

```bash
# Replace this value with the actual current production database hostname.
SEED_TARGET=local \
SEED_CONFIRM=SEED-NON-PRODUCTION \
EXPECTED_DATABASE_HOST=127.0.0.1 \
EXPECTED_DATABASE_NAME=infrasight_seed \
FORBIDDEN_DATABASE_HOST=ep-production.example.neon.tech \
DATABASE_URL=postgresql://seed_user:password@127.0.0.1:5432/infrasight_seed \
npm run db:seed:apply
```

The apply command rejects production runtime environments, system databases,
arbitrary remote PostgreSQL hosts, target mismatches, known production
endpoints, and both pooled and direct aliases of a forbidden Neon endpoint.
Connection-string query parameters that could override the approved host,
port, credentials, or database are also rejected.
These checks finish before the Prisma adapter, client, or write runner is
loaded.

The runner is additive: existing reviewed fund fields and company milestones
are preserved, and repeat runs do not intentionally duplicate people, roles,
milestones, or citations. An unexpected database error fails the command
instead of being silently reported as a successful seed. Because this is a
large restartable bootstrap rather than one long transaction, use only a
disposable or recoverable non-production target.
`SEED_TARGET=local` means a real local database; do not use it with an SSH
tunnel or proxy that forwards loopback traffic to production.

`npm run db:verify` remains a separate, read-only verification of a populated
database and therefore still requires an explicitly selected database.

## Administrative Authentication

- Privileged JWTs have an eight-hour absolute lifetime. Deploying the
  versioned-session format invalidates older 30-day tokens and requires a new
  login.
- Every admin page, server action, import, and export re-reads the current
  `User` row. Deleting a user, changing a role, or rotating a password through
  `npm run admin:create` invalidates the older session snapshot immediately.
- Five failed attempts for either the account or client-IP HMAC bucket within
  15 minutes create a 15-minute lock. Responses remain the same generic denial
  for an unknown account, bad password, or active lock.
- Throttle keys are HMAC pseudonyms derived from `NEXTAUTH_SECRET`; raw email
  addresses and IP addresses are not stored. Failed-login rows older than 24
  hours are pruned opportunistically, at most once per hour after a successful
  prune in each application process, with a five-minute failure backoff. Window
  and lock timestamps use the database clock.
- Vercel's protected `x-vercel-forwarded-for` value supplies the IP bucket.
  Outside Vercel, set `TRUST_PROXY_HEADERS=true` only when a trusted edge proxy
  strips and rewrites `X-Forwarded-For`; otherwise throttling remains
  account-based and ignores the spoofable header.
- Apply `20260729210000_auth_hardening` before promoting the application code.
  The credential path fails closed if its throttle table is unavailable.
- Prefer `npm run admin:create` for credential rotation. Direct SQL password
  changes do not advance Prisma's `updatedAt`; if emergency SQL is unavoidable,
  also rotate `NEXTAUTH_SECRET` and redeploy to revoke all sessions.
