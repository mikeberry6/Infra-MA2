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
  hours are pruned opportunistically.
- Apply `20260729210000_auth_hardening` before promoting the application code.
  The credential path fails closed if its throttle table is unavailable.
- Prefer `npm run admin:create` for credential rotation. Direct SQL password
  changes do not advance Prisma's `updatedAt`; if emergency SQL is unavoidable,
  also rotate `NEXTAUTH_SECRET` and redeploy to revoke all sessions.
