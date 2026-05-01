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
