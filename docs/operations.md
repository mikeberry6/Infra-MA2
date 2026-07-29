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

Run the local gate before pushing application changes:

```bash
npm run lint
npm test
npx tsc --noEmit
npm run db:seed:validate
npm run validate-portfolios
npm run db:verify
npm run build
```

`npm run doctor` checks local GitHub/Vercel auth, env names, typecheck, and tests.

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
