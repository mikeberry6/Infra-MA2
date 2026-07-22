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
npm run typecheck
npm test
npm run db:validate
npm run validate-portfolios
npm run validate-weekly-email
npm run audit:prod
npm run db:verify
npm run build
```

`npm run doctor` checks local GitHub/Vercel auth, env names, typecheck, and tests.

## Production Notes

- Vercel is configured for Node 24.x.
- GitHub Actions should match that runtime.
- Admin, import, and export routes require NextAuth roles.
- Database writes should go through explicit scripts or admin actions, never ad hoc manual edits without a logged command path.

## Runtime and Package Policy

- Node 24.x and npm 11.x are the only supported runtime and package-manager line.
- `package-lock.json` is authoritative. Do not commit a second lockfile or pnpm workspace metadata unless the repository is deliberately migrated in a reviewed change.
- CI uses `npm ci`; local dependency changes must use npm and commit the resulting lockfile.
- Production dependency audits must have no unaccepted critical or high advisories. Any dev-only exception needs its package path, exploitability assessment, owner, and review date in the release record.

### Time-bounded development-only audit exceptions

The production tree has zero known vulnerabilities (`npm run audit:prod`). The following findings are confined to local lint, test, or workbook tooling and are not bundled into or invoked by the production application. Engineering owns these exceptions and must review them by **2026-08-21** or sooner when an upstream fix is available.

| Package path | Severity | Exploitability in this repository | Owner | Review date |
| --- | --- | --- | --- | --- |
| `eslint` / `eslint-config-next` → `minimatch` → `brace-expansion` | High | Local lint inputs only; no untrusted runtime glob processing | Engineering | 2026-08-21 |
| `eslint` → `js-yaml` | High | ESLint configuration parsing in CI/local development only | Engineering | 2026-08-21 |
| `exceljs` → `tmp` / `uuid` / `archiver` → `brace-expansion` | High/Moderate | Explicit offline workbook scripts only; never imported by application routes | Engineering | 2026-08-21 |
| `jsdom` → `undici` | High | Test environment only; tests do not expose an HTTP service | Engineering | 2026-08-21 |
| `vitest` / `@vitejs/plugin-react` → `vite` | High | Test runner and transform server in trusted CI/local environments only | Engineering | 2026-08-21 |

## Additive Migration Rollout

1. Create a Neon branch from the current production database and expose it to CI as `MIGRATION_DATABASE_URL`.
2. Run `npm run db:validate`, `npx prisma migrate status`, tests, and a Vercel preview against that branch.
3. Apply additive schema migrations before deploying application code that reads the new fields or tables.
4. Backfill in a separate, restartable command and verify counts plus citation coverage.
5. Do not remove old columns or duplicate company rows until backups, merge reports, and `CompanyRedirect` mappings are verified.

## Rollback and Recovery

- Keep each phase in an independent deployment. If application health regresses, use Vercel Deployments to promote the previous known-good deployment.
- Additive migrations remain in place during an application rollback; prior code must continue to tolerate the added tables and nullable fields.
- Before company merges or destructive cleanup, capture a Neon restore point/branch and export the merge report. Recovery is performed by promoting the untouched branch or replaying the export, never by an ad hoc reverse edit.
- After rollback, verify `/api/health`, `/tracker`, `/funds`, `/portfolio`, `/news`, admin login, and export authorization.

## Secrets and Administrator Bootstrap

- Ordinary seeding never creates an administrator. Run `ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create` from a trusted environment.
- Use a unique password of at least 14 characters. Rotate the production admin credential and `NEXTAUTH_SECRET` after deploying the new bootstrap path.
- Never print credentials, tokens, imported row contents, or private query data in logs or workflow artifacts.

## Artifact Retention

- Pipeline summaries in `tmp/` are ephemeral and GitHub workflow artifacts retain them for 30 days.
- Versioned research, audits, and historical weekly briefings are retained unless their owner explicitly approves archival.
- Unclassified worktree artifacts are preserved. Move them only after ownership and retention are recorded.
