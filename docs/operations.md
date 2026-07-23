# Operations

Direct production mutation through Prisma Studio or ad hoc SQL is prohibited. Production changes must use the audited application actions or a protected, hash-bound remediation workflow so the mutation and its review evidence remain transactionally attributable.

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

Use Node 24 and npm 11. A clean checkout should pass:

```bash
npm ci
npm run db:generate
npm run db:validate
npm run lint
npm run typecheck
npm run typecheck:scripts
npm test
npm run validate-portfolios
npm run validate-weekly-email
npm audit --audit-level=high
npm run audit:prod
npm run build
npm run check:bundle-budget
```

Database-backed browser tests run only with the allow-listed Phase 2 validation
branch described in [phase-4-observability-runbook.md](./phase-4-observability-runbook.md).
They intentionally refuse a remote application URL or an unverified database target.

`npm run doctor` checks local GitHub/Vercel auth, env names, typecheck, and tests.

## Production Notes

- `.nvmrc`, `.node-version`, package engines, GitHub Actions, and Vercel use Node 24.x; npm 11 is the only package manager.
- Admin, import, and export routes require NextAuth roles.
- Database writes should go through explicit scripts or admin actions, never ad hoc manual edits without a logged command path.

## Authentication bootstrap and rotation

Ordinary seeding never creates an administrator. Create or rotate an account only against an explicitly approved database target:

```bash
ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... \
TARGET_DATABASE=development RELEASE_SHA=<full-reviewed-sha> \
MUTATION_REVIEWED_BY=... MUTATION_REASON=... \
EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
FORBIDDEN_DATABASE_HOST=... npm run admin:create
```

Use `TARGET_DATABASE=validation` or `production` only for an explicitly reviewed target and supply the exact protected release SHA. The command records bootstrap/rotation, operator/reviewer identity, reason, release, and target atomically with the user change; it never records the password or hash. The password must contain at least 14 characters, upper- and lowercase letters, a number, and a symbol. Production `NEXTAUTH_URL` must include the retained base path and complete auth endpoint, for example `https://infra-ma-2.vercel.app/Infra-MA2/api/auth`.

Ordinary database seeding requires the same exact host/database guard plus `TARGET_DATABASE=development` or `TARGET_DATABASE=validation`; production seeding is rejected.

Rotate the production administrator password and `NEXTAUTH_SECRET` after the Phase 1 deployment. Record completion without recording values.

## Retention and recovery

- Versioned research, historical weekly emails, migrations, and release records are retained.
- `tmp/`, reports, traces, and local agent worktrees are ephemeral and ignored.
- Preserve unclassified dirty-worktree artifacts until ownership and retention are explicit; never mass-delete them.
- Follow [release-runbook.md](./release-runbook.md) for the Phase 1 baseline and
  [phase-2-release-runbook.md](./phase-2-release-runbook.md) for data-trust schema staging,
  reviewed remediation, pipeline cutover, promotion, and recovery.
- Treat [news-scan-automation.md](./news-scan-automation.md) as the canonical news scheduler contract;
  workstation scheduling is intentionally unsupported.
- Track dependency decisions in [dependency-exceptions.md](./dependency-exceptions.md).
- Follow [phase-4-observability-runbook.md](./phase-4-observability-runbook.md) for the
  health contract, isolated browser gate, Vercel telemetry activation, alert setup,
  real-user performance acceptance, and exact-SHA smoke checks.
