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
npm audit --audit-level=high
npm run audit:prod
npm run build
npm run check:bundle-budget
```

`npm run doctor` checks local GitHub/Vercel auth, env names, typecheck, and tests.

## Production Notes

- `.nvmrc`, `.node-version`, package engines, GitHub Actions, and Vercel use Node 24.x; npm 11 is the only package manager.
- Admin, import, and export routes require NextAuth roles.
- Database writes should go through explicit scripts or admin actions, never ad hoc manual edits without a logged command path.
- Hosted data caches require a unique `VERCEL_DEPLOYMENT_ID` or a non-sensitive `DATA_CACHE_NAMESPACE`; do not use database URLs, branch credentials, or user-provided text in that namespace. A local production server must be started with an explicit value, for example `DATA_CACHE_NAMESPACE=local-smoke-1 npm run start`; Playwright supplies a run-scoped value automatically.
- Vercel operator preflight: confirm the project setting **Automatically expose System Environment Variables** is enabled so `VERCEL_DEPLOYMENT_ID` exists at build and runtime. If that setting is intentionally disabled, configure a unique, non-sensitive `DATA_CACHE_NAMESPACE` for every deployment at both build and runtime before release.

## Health, logs, analytics, and performance

- `/api/health` exposes only six top-level fields: `status`, `version`, `generatedAt`, `database`, `pipelines`, and `generationTimeMs`. It returns 503 for database/schema failure or a breached critical-pipeline freshness contract. It does not expose providers, connection details, exceptions, or configuration.
- Server operations emit one allowlisted JSON envelope with route or task, fixed operation name, duration, status, a server-owned request/task ID, and a fixed error classification/message when applicable. Never add request bodies, query/search values, destination URLs, imported rows, credentials, tokens, record labels, or raw exceptions.
- Automatic Web Analytics pageviews and Speed Insights vitals are public-route only. The client boundary drops login/admin events (including base-path routes) and removes query strings and fragments from every forwarded public URL and route label; custom product events remain fixed-name, payload-minimized interactions.
- The global `Referrer-Policy: strict-origin` prevents public search/filter/drawer query state from reaching same-origin observability script requests in the HTTP `Referer` header before client-side event filters can run.
- Custom Analytics events record only the approved interaction names and fixed coarse properties; Speed Insights supplies real-user Core Web Vitals. Neither integration authorizes cookies, identity enrichment, record names, search terms, filter values, or private route data.
- Monitor route error rate, database latency, provider latency, pipeline failures, and p75 LCP/INP/CLS. Targets remain LCP below 2.5 seconds, INP below 200 ms, CLS below 0.1, and public first-load JavaScript at or below 150 KB gzip per enforced route.
- Use the response `x-request-id` to correlate Vercel logs during an incident. Follow [incident-response.md](./incident-response.md); preserve request IDs and timestamps, never sensitive payloads.

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
- Follow [release-runbook.md](./release-runbook.md) for the combined Phase 1
  baseline and Phase 2 data-trust schema staging, reviewed remediation,
  pipeline cutover, promotion, and recovery.
- Treat [news-scan-automation.md](./news-scan-automation.md) as the canonical news scheduler contract;
  workstation scheduling is intentionally unsupported.
- Track dependency decisions in [dependency-exceptions.md](./dependency-exceptions.md).
