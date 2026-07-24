# InfraSight Operations Handbook

Direct production mutation through Prisma Studio or ad hoc SQL is prohibited. Production changes must use audited application actions or a protected, hash-bound workflow so review evidence, release identity, and the resulting mutation remain attributable.

## Service inventory

| Service | Production resource |
| --- | --- |
| GitHub | `mikeberry6/Infra-MA2` |
| Vercel | team `mberry`, project `infra-ma-2` |
| Application | `https://infra-ma-2.vercel.app/Infra-MA2` |
| Database | Neon/Postgres, production endpoint held only in protected secrets |

The application keeps the `/Infra-MA2` base path. `main` is the protected default branch and the only branch Vercel may track for production builds. Automatic production-domain assignment must remain disabled so merging code cannot race schema deployment.

Use Node 24.x, npm 11.x, and `package-lock.json` exclusively. Do not commit pnpm workspace files or a second lockfile unless a separately reviewed package-manager migration authorizes them.
The committed `.npmrc` enables `engine-strict`, so installs fail instead of silently proceeding on an unsupported runtime.

## Required configuration

No workflow should infer a database target from a generic URL. `scripts/assert-database-target.ts` requires an exact approved host and database plus at least one forbidden opposite-environment host before any migration or pipeline write.

### GitHub Actions secrets

| Name | Scope | Purpose |
| --- | --- | --- |
| `MIGRATION_DATABASE_URL` | CI only | Direct, branch-scoped connection string for an isolated Neon validation branch |
| `E2E_ADMIN_EMAIL` | CI only | Administrator on the isolated validation branch |
| `E2E_ADMIN_PASSWORD` | CI only | Strong, unique validation password; never use a production credential |
| `PREVIEW_DATABASE_URL`, `PREVIEW_MIGRATION_DATABASE_URL` | protected `preview-bootstrap` environment | Pooled and direct credentials for the same sanitized, non-production Preview database |
| `PREVIEW_FRED_API_KEY`, `PREVIEW_EIA_API_KEY`, `PREVIEW_SAM_API_KEY`, `PREVIEW_SEC_USER_AGENT` | protected `preview-bootstrap` environment | Preview-only names for the dashboard provider configuration used by the reviewed bootstrap |
| `PREVIEW_NEON_API_KEY` | protected `preview-bootstrap` environment | Control-plane credential scoped only to the non-production Preview Neon project and used only for identity reads |
| `PREVIEW_VERCEL_TOKEN` | protected `preview-bootstrap` environment | Project/team-limited Vercel API token used only to prove the supplied immutable deployment is an exact-SHA Preview target |
| `DATABASE_URL` | production workflows | Production pooled connection string |
| `PRODUCTION_MIGRATION_DATABASE_URL` | protected production environment | Direct production connection used only by schema staging |
| `VERCEL_TOKEN` | production environment | Token limited to the InfraSight Vercel project/team |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | protected production environment | Vercel automation-bypass secret used only as a same-origin request header while smoke-testing immutable deployment URLs |
| `FRED_API_KEY`, `EIA_API_KEY`, `SAM_API_KEY` | pipeline workflows | Required dashboard provider API credentials |
| `SEC_USER_AGENT` | pipeline workflows | Required SEC identity string with a monitored contact email |
| `APIFY_TOKEN` | default-branch research dispatch | LinkedIn research candidate collection |
| `NEON_RECOVERY_API_KEY` | protected `Recovery` and automated `RecoveryCleanup` environments | Project-scoped control-plane credential for temporary branches in the non-production Neon project only |

### GitHub Actions variables

| Name | Value |
| --- | --- |
| `MIGRATION_DATABASE_HOST` | Exact hostname parsed from `MIGRATION_DATABASE_URL` |
| `MIGRATION_DATABASE_NAME` | Exact database name parsed from `MIGRATION_DATABASE_URL` |
| `DASHBOARD_MIGRATION_DATABASE_HOST` | Exact long-lived dashboard-migration validation hostname; Preview and recovery guards use it only as a forbidden target |
| `PREVIEW_DATABASE_HOST` | Exact pooled hostname parsed from `PREVIEW_DATABASE_URL` |
| `PREVIEW_DATABASE_NAME` | Exact database name shared by both protected Preview URLs |
| `PREVIEW_MIGRATION_DATABASE_HOST` | Exact direct hostname parsed from `PREVIEW_MIGRATION_DATABASE_URL`; must differ from Preview pooled and both production hosts |
| `PREVIEW_NEON_PROJECT_ID` | Exact non-production Neon project containing the approved Preview database |
| `PREVIEW_NEON_BRANCH_ID` | Exact ready, non-default Neon branch used by the immutable Preview deployment |
| `PREVIEW_NEON_ENDPOINT_ID` | Exact read-write endpoint on `PREVIEW_NEON_BRANCH_ID` whose host is `PREVIEW_MIGRATION_DATABASE_HOST` |
| `PRODUCTION_DATABASE_HOST` | Exact hostname parsed from production `DATABASE_URL` |
| `PRODUCTION_DATABASE_NAME` | Exact production database name required by unattended write workflows |
| `PRODUCTION_MIGRATION_DATABASE_HOST` | Exact hostname parsed from `PRODUCTION_MIGRATION_DATABASE_URL` |
| `VERCEL_TEAM_ID` | Required immutable `team_...` identifier for the owning Vercel team |
| `VERCEL_PROJECT_ID` | Immutable Vercel project ID for `infra-ma-2` (for example, `prj_...`), not the display name |
| `VERCEL_PROJECT_NAME` | Exact Vercel project slug `infra-ma-2` used by trusted Preview event verification |
| `VERCEL_SCOPE` | Exact immutable deployment-host scope `mberry` used by trusted Preview event verification |
| `PRODUCTION_URL` | Protected canonical origin `https://infra-ma-2.vercel.app`; never accept this from a workflow dispatcher |
| `SEC_WATCHLIST_CIKS` | Optional comma-separated `CIK:Name` SEC dashboard watchlist override |
| `DASHBOARD_WRITES_ENABLED` | Explicitly `false` during production schema staging and every dashboard cutover apply/rollback; `true` only after the post-cutover all-source dry-run artifact passes review |
| `NEON_RECOVERY_PROJECT_ID` | Exact non-production Neon project that owns the isolated validation branch |
| `NEON_PRODUCTION_PROJECT_ID` | Independently sourced production Neon project ID; recovery and janitor workflows reject equality with `NEON_RECOVERY_PROJECT_ID` |
| `NEON_VALIDATION_BRANCH_ID` | Exact non-default Neon branch ID corresponding to `MIGRATION_DATABASE_URL` |

The validation and both production host variables must differ where Neon uses distinct pooled/direct endpoints; validation guards deny both production hosts. The validation branch must also live in a Neon project distinct from the independently configured production project. Every mutation workflow requires an exact database name as well as its expected host. `DATABASE_URL` is a repository Actions secret because unattended schedules require it. Keep `PRODUCTION_MIGRATION_DATABASE_URL`, `VERCEL_TOKEN`, and `VERCEL_AUTOMATION_BYPASS_SECRET` in the GitHub `Production` environment with a required reviewer, self-review prevention, and a custom deployment-branch policy whose only entry is `main`.

Configure the separate `Recovery` environment with the same main-only/reviewer protections, `NEON_RECOVERY_API_KEY`, `NEON_RECOVERY_PROJECT_ID`, `NEON_PRODUCTION_PROJECT_ID`, and `NEON_VALIDATION_BRANCH_ID`; its API identity must be scoped to the non-production project. Configure `RecoveryCleanup` as main-only with only the same non-production API key and those three variables. It intentionally has no reviewer pause so the hourly janitor remains available after a runner loss; the janitor has no database credential and can delete only exact annotated recovery branches at least two hours old. Both workflows reject equal recovery/production project IDs. The recovery exercise reuses the existing validation URL/host/database and all three forbidden-host variables, creates no Vercel deployment, scopes control-plane/validation credentials only to steps that need them, and uploads no private state or raw database logs. The in-workflow ref check is defense in depth; the environment policy prevents caller-selected feature-branch code from receiving secrets. Never expose production or recovery secrets to pull-request jobs.

The release gate contains one narrowly scoped compatibility bridge for the isolated validation database. The six already-applied pre-restaging migrations are retained byte-for-byte, while their seven later restaged names are explicit `SELECT 1` compatibility aliases. If the reused validation branch contains the complete retired lineage, the bridge requires exact legacy checksums and zero diff from `prisma/schema.prisma`. It recognizes only the known zero-step failed `20260722220000_auth_throttle` attempt and asks Prisma itself to mark that row rolled back before normal `migrate deploy`, `migrate status`, and post-deploy drift verification continue. It refuses partial, unknown, checksum-mismatched, applied-step, or schema-divergent history, writes `validation-migration-lineage.json`, and cannot run unless `TARGET_DATABASE=validation`, the exact host/database guard, and `--apply` are all present. It never updates or deletes Prisma migration rows directly and is never used by production staging.

Vercel Preview must use a schema-only or explicitly sanitized database branch containing no production rows and preview-only NextAuth settings. Vercel Production must use the production database, canonical `NEXTAUTH_URL`, a separate `NEXTAUTH_SECRET`, and `NEXT_PUBLIC_SITE_URL=https://infra-ma-2.vercel.app` for canonical social metadata. In NextAuth v4, `NEXTAUTH_URL` is the complete auth API endpoint, including the retained base path: `https://infra-ma-2.vercel.app/Infra-MA2/api/auth` in production and the equivalent preview origin in Preview. Preview and production must not share writable database credentials.

Keep the Vercel Neon integration connection scoped to Production only. Neon Free does not support protected branches, and an ordinary child of the unprotected production branch both copies production rows and inherits matching role passwords. Rotating that child's role password establishes credential separation but does not remove the copied production data, so it is not an eligible Preview target. Automatic production-parent Preview branches remain disabled. A safe Preview is schema-only or derives from an explicitly reviewed sanitized non-production source, and uses branch-specific credentials proved unable to authenticate to production. Do not treat candidate-controlled code or a host denylist as either the credential or data-isolation boundary.

Preview migrations are additionally gated by `PREVIEW_DATABASE_MIGRATIONS_ENABLED`. Unset or exact `false` skips all migration commands and runs only the normal application build. Exact `true` is rejected outside Vercel Preview and, in Preview, requires matching pooled/direct Neon endpoints with TLS, expected project/repository/Neon/database identifiers, and all four long-lived host denylist values: `PRODUCTION_DATABASE_HOST`, `PRODUCTION_MIGRATION_DATABASE_HOST`, `MIGRATION_DATABASE_HOST`, and `DASHBOARD_MIGRATION_DATABASE_HOST`. The guarded build uses the direct URL only for `prisma migrate deploy`, status, and drift checks, retains the pooled URL for the application build, and never prints credentials. Keep Vercel's checked-in Build Command as `npm run vercel-build`.

### Protected Preview dashboard bootstrap

Configure a GitHub environment named `preview-bootstrap` with a required independent Engineering or Operations reviewer, self-review prevention, and a custom deployment-branch policy whose only entry is `main`. Store only the branch-scoped, non-production credentials `PREVIEW_DATABASE_URL`, `PREVIEW_MIGRATION_DATABASE_URL`, `PREVIEW_FRED_API_KEY`, `PREVIEW_EIA_API_KEY`, `PREVIEW_SAM_API_KEY`, `PREVIEW_SEC_USER_AGENT`, `PREVIEW_NEON_API_KEY`, and `PREVIEW_VERCEL_TOKEN` there. Limit the Vercel token to read access for the exact InfraSight project/team. Grant the Neon key the narrowest available access scoped only to `PREVIEW_NEON_PROJECT_ID`; the workflow uses it only for control-plane GET requests. That project ID must differ from the independently maintained `NEON_PRODUCTION_PROJECT_ID`. Configure the exact non-default branch and read-write endpoint IDs in `PREVIEW_NEON_BRANCH_ID` and `PREVIEW_NEON_ENDPOINT_ID`. The workflow queries Neon directly and rejects a default/unready branch, a mismatched endpoint or host, and any Preview/production project-ID equality.

Configure a second Vercel Trusted Source for the bootstrap workflow. Restrict it to GitHub Actions repository `mikeberry6/Infra-MA2`, branch `main`, workflow `.github/workflows/bootstrap-preview-dashboard.yml`, GitHub environment `preview-bootstrap`, custom audience `https://vercel.com/infrasight-preview-bootstrap`, and the Vercel Preview environment only. Require the repository, protected branch, workflow-ref, environment-subject, and custom-audience claims rather than trusting a caller-provided URL. Do not reuse the `preview-smoke` audience. Keep Vercel Deployment Protection enabled on the immutable deployment with no path exception for `/Infra-MA2/api/health`. The workflow proves that the health path is protected by requiring either Vercel's direct HTTP 401 response or its tightly validated authentication redirect; it then requires an OIDC-authenticated request to reach the application. This proves protection enforcement on the health path, not the exact project-wide protection-plan label. The workflow independently queries Vercel's API and requires the logical Preview target (represented as `null` by the current deployment API schema), exact project/repository/SHA, ready state, and the same immutable hostname. Separate pre-write and post-write jobs mint independent short-lived OIDC tokens immediately before their reads so a long provider run cannot reuse an expired credential. They never accept a branch alias or production domain.

Configure `PREVIEW_DATABASE_HOST`, `PREVIEW_DATABASE_NAME`, and the distinct direct `PREVIEW_MIGRATION_DATABASE_HOST` as environment variables. `MIGRATION_DATABASE_HOST`, `DASHBOARD_MIGRATION_DATABASE_HOST`, `PRODUCTION_DATABASE_HOST`, and `PRODUCTION_MIGRATION_DATABASE_HOST` are mandatory denylist inputs. The pooled and direct URLs must be the `-pooler` and direct host for one Neon endpoint and must have the same database, username, password, and normalized port. The username must be 8–256 bytes and the password 14–512 bytes; both must use only canonical, unescaped `A–Z`, `a–z`, `0–9`, `.`, `_`, and `-` characters. Whitespace, control characters, percent-escaped credentials, invalid encoding, and unbounded values fail before any connection or artifact scan. Regenerate the branch role credential if an existing password does not meet this log-masking contract. The URLs must identify the same schema-current, sanitized Preview database used by the immutable Vercel deployment and must be independently unable to authenticate to long-lived validation, dashboard-migration, or production endpoints. Do not use a production-derived branch with copied rows or shared role credentials.

After `.github/workflows/bootstrap-preview-dashboard.yml` exists on protected `main`, dispatch the one-time bootstrap from an authenticated operator shell:

```bash
release_sha="$(gh api "repos/mikeberry6/Infra-MA2/branches/main" --jq '.commit.sha')"
preview_deployment_url="https://infra-ma-2-<immutable-deployment-token>-mberry.vercel.app"
preview_git_sha="<40-character Git SHA recorded on that Vercel deployment>"
gh api --method POST \
  -H "Accept: application/vnd.github+json" \
  "repos/mikeberry6/Infra-MA2/dispatches" \
  -f event_type=bootstrap-preview-dashboard \
  -F 'client_payload[confirmation]=BOOTSTRAP_PREVIEW_DASHBOARD' \
  -F "client_payload[release_sha]=$release_sha" \
  -F "client_payload[preview_deployment_url]=$preview_deployment_url" \
  -F "client_payload[preview_git_sha]=$preview_git_sha"
```

The workflow creates three sequential `preview-bootstrap` environment approval pauses; approving the first does not approve jobs that have not yet reached the environment gate. For the preflight request, match the unprivileged job summary's protected-main SHA, immutable URL, and Preview Git SHA to the reviewed release evidence. Approve the synchronization request only after the preflight job and its `runtime-before` evidence packet succeed for that same run and tuple. Approve the postflight request only after the synchronization job and its exact PipelineRun proof/time evidence succeed, again checking the same run and tuple. Reject any unexpected job name, run attempt, SHA, or URL instead of approving through the queue.

Before any environment secret is referenced, the unprivileged job validates and prints the three bounded identity values, binds the dispatch to the triggering and checked-out `main` SHA, and proves the Preview commit has the same Git tree. The three protected jobs then separate authority: the preflight and postflight jobs can mint Vercel OIDC identities but never install packages or receive database/provider credentials; the synchronization job can receive only the non-production database/provider credentials and has no `id-token: write` permission. Both runtime jobs re-prove the exact Vercel deployment through the API before minting their token and prove that Deployment Protection is enforced on the health path.

The preflight accepts an HTTP 200 healthy state. It also permits a retryable HTTP 503 only when `NEWS_SCAN` is passing and `DASHBOARD_SYNC` is `never-run`, `failed`, `stale`, or `stalled`, with a valid or consistently absent prior success proof/time pair. An actively `running` dashboard attempt is not retryable; Operations must allow it to finish or cross the existing stalled threshold before redispatching. This prevents concurrent writes while avoiding permanent lockout after a failed run or runner loss.

Before writing, the workflow records the immutable deployment's prior dashboard completion time, installs the locked dependencies without OIDC authority, registers full and component-level GitHub log masks for both Preview database URLs, proves the exact pooled/direct connection identity, verifies the distinct Neon project/branch/endpoint through the control plane, maps the Preview target to the existing non-production `TARGET_DATABASE=validation` authorization, keeps `DASHBOARD_WRITES_ENABLED=false`, requires a clean Prisma migration ledger and zero schema diff, and runs every dashboard provider in dry-run mode. Live synchronization can start only after that dry run succeeds; complete-source verification follows. The live summary is bound to exact GitHub execution provenance and carries a one-way SHA-256 proof of the precise successful `PipelineRun` plus the exact persisted completion time. A freshly minted postflight OIDC health read must return HTTP 200 from the same immutable deployment and expose that exact proof/time pair, not merely a newer run. This deployment-to-database challenge is required in addition to hostname and variable checks.

Each protected job creates a separate bounded evidence packet containing only its sanitized health, provenance, external-identity, synchronization, or outcome records; raw headers, raw command logs, tokens, and scan reports are not artifacts. Each fixed-schema outcome manifest is written before the final credential scan, and its evidence tree is not mutated afterward. The applicable final scan includes decoded, percent/form-encoded, JSON-escaped, and base64 database credential components. Upload occurs only after that post-manifest scan passes; a valid `result: "failed"` packet may still be retained for diagnosis, but never authorizes approval. Approval requires all three protected jobs to succeed and these checks against their separately downloaded artifacts:

```bash
evidence_dir="$(mktemp -d)"
for packet in runtime-before bootstrap runtime-after; do
  gh run download <run-id> \
    --repo mikeberry6/Infra-MA2 \
    --name "preview-dashboard-${packet}-<run-id>-<attempt>" \
    --dir "$evidence_dir/$packet"
done
jq -e '.result == "success" and ([.steps[]] | all(. == "success"))' \
  "$evidence_dir/runtime-before/outcome.json"
jq -e '.result == "success" and ([.steps[]] | all(. == "success"))' \
  "$evidence_dir/bootstrap/outcome.json"
jq -e '.result == "success" and ([.steps[]] | all(. == "success"))' \
  "$evidence_dir/runtime-after/outcome.json"
```

An artifact may be retained after a failed job only when that job's post-manifest secret scan itself passed. Its manifest intentionally reports `result: "failed"` and is diagnostic evidence, never bootstrap approval. Require successful `runtime-before`, `bootstrap`, and `runtime-after` packets before redeploying the exact Preview candidate and accepting the trusted `preview-smoke` health result. This bootstrap is not scheduled and does not satisfy the production 30-day reliability window.

The Preview smoke uses no long-lived Vercel bypass secret. Configure one Vercel Trusted Source for GitHub Actions, restricted to repository `mikeberry6/Infra-MA2`, branch `main`, workflow `preview-smoke.yml`, custom audience `https://vercel.com/infrasight-preview-smoke`, and the Preview environment only. `.github/workflows/preview-smoke.yml` is loaded from protected `main`, validates the Vercel GitHub App sender, repository ID, project ID/name, non-production ref, full candidate SHA, successful state, and immutable deployment hostname before requesting a short-lived OIDC token. It executes only trusted default-branch smoke tooling, rejects cross-origin redirects, requires the full health contract, scans retained evidence for the token, and publishes `preview-smoke` success only after the evidence upload succeeds. Cancellation leaves a pending or failed status, never a success.

Normal merge, squash, and rebase operations do not preserve the PR Preview SHA. `.github/workflows/preview-smoke-lineage.yml` therefore runs on the exact `main` push and accepts the Preview only when the associated merged PR head has the same Git tree as the release, its newest `preview-smoke` status succeeded, and that status is bound to the successful trusted `repository_dispatch` workflow run. Production schema, remediation, and promotion workflows require both the exact-SHA `build` check and the exact-main `preview-smoke-lineage` check. This proves code-tree equivalence without pretending a Preview deployment was itself a production candidate.

Public query caches are additionally scoped by a non-sensitive deployment identity. In Vercel project settings, enable **Automatically expose System Environment Variables** so `VERCEL_DEPLOYMENT_ID` is available during both build and runtime. If that cannot be enabled, set a unique `DATA_CACHE_NAMESPACE` for every deployment at both build and runtime. Local or reusable-build validation may use a safe label such as `validation-branch`. Never place a connection string, hostname containing credentials, token, or other secret in this value. Any process that reuses one built application against a different database must use a different namespace so persisted Next data-cache entries cannot cross targets.

## Release gate

`.github/workflows/deploy.yml` has three jobs:

1. `quality` runs locked installation, Prisma generation/validation, lint, application typecheck, operational-script/Prisma TypeScript typecheck, all Vitest tests, offline portfolio and weekly-email validation, both production-only and complete dependency audits, a production build, and the public JavaScript bundle budget.
2. `validation` serializes access to the isolated Neon branch, proves the database target, deploys migrations, checks both migration status and schema drift, verifies data/source integrity, builds against the migrated schema, creates a validation-only administrator, and runs Playwright journeys, axe checks, responsive checks, keyboard behavior, and visual baselines. Migration logs and browser failure media are retained for 30 days. Specs that enter an administrator password run separately with tracing and the HTML reporter disabled because both formats retain filled values. Before upload, fail-closed scanners independently check validation and browser evidence—including raw, JSON-escaped, URI/base64, trace-ZIP, and embedded HTML-report-ZIP representations—against the protected validation credential. Each artifact class uploads only after its own scan passes. If sensitive evidence is ever retained, rotate the validation-only credential immediately and delete only the affected artifact while preserving separate aggregate evidence.
3. `build` is the stable branch-protection context. It succeeds only if both preceding jobs succeed.

The Release Gate runs only for pull requests targeting `main` and pushes to `main`. It does not expose a same-named required check through feature-branch pushes or manual dispatch. After the trusted Preview workflow exists on `main` and has produced its first real status, require both `build` and `preview-smoke` on pull requests, one approving review, resolved conversations, linear history, and no force-pushes or deletion. Do not add `preview-smoke` before the workflow is active: `repository_dispatch` workflows are loaded only from the default branch, so doing so would deadlock the bootstrap merge. A clean checkout must pass; local untracked files are never an input to CI.

For the one-time bootstrap, merge only the reviewed workflow while production mutation remains blocked. Configure a functional branch-scoped Preview database and auth environment, redeploy the exact bootstrap PR head after the workflow is present on `main`, wait for `preview-smoke`, and rerun the failed `preview-smoke-lineage` main job. Then add `preview-smoke` to branch protection. Never waive the exact-tree lineage check to release the bootstrap revision.

The migration gate accepts only newly added `prisma/migrations/*/migration.sql` files between the event base and release. It normalizes aliases to full commit SHAs, rejects mutation or transforming DDL, reads SQL from the release commit rather than the working tree, and hashes the policy plus ordered committed blobs into the manifest. Foreign-key `ON DELETE`/`ON UPDATE` actions inside a new additive constraint are permitted; standalone data mutation is not.

The validation database guard requires `MIGRATION_DATABASE_HOST` and `MIGRATION_DATABASE_NAME` and denies both production endpoints. Before strict source/canonical gates can fail, CI writes reviewer-neutral all-status company-merge, ownership-to-fund-link, Fund primary-source, deal seller-disclosure, and citation templates. If fixed reviewed files exist at `audits/approvals/company-merges.json`, `audits/approvals/ownership-fund-links.json`, `audits/approvals/fund-primary-sources.json`, `audits/approvals/deal-seller-disclosures.json`, and `audits/approvals/primary-citations.json`, CI hashes and applies them only to the isolated validation database, in that order, before strict checks. Reruns are idempotent and require the exact prior audit for an already-applied decision.

Use staged review passes when merges can change ownership or citation candidates: commit the reviewed company file first, let validation apply it and regenerate the ownership-link and citation templates, then review and commit those post-merge files. Deal seller treatment is independent of company merging, but its immutable snapshot must still match the current deal, participants, and source evidence. Do not approve a stale template. Ownership-link remediation can only link an exact normalized vehicle name to a reviewed fund or remove a stale fund link; it never changes the vehicle label or underlying ownership assertion. Seller-disclosure remediation never infers a seller or absence classification and updates only `sellerDisclosureStatus` and `sellerDisclosureReason`. This process allows the gate to become green without weakening it; production still requires the protected manual remediation workflow.

The primary-citation artifact also includes a smaller semantic review worksheet generated from the exact neutral template bytes. It combines candidates only when source ID, label, URL, type, purpose, evidence label, and current-primary state are exactly equal, retains every opaque citation ID in the group, orders groups by an opaque hash, and leaves every `selectedGroupKey` null. Its `sourceTemplateSha256` binds the worksheet to the byte-exact source packet. Records with no candidate remain present and cannot be compiled; Research must add accepted evidence through the editorial workflow and regenerate. Generate the same worksheet locally with:

```bash
npm run db:citations:worksheet -- \
  --template=tmp/primary-citation-approval-template.json \
  --output=tmp/primary-citation-review-worksheet.json
```

Research may set only top-level `reviewedBy` and `reviewedAt` plus one listed `selectedGroupKey` per item. After review, compile against the unchanged source template:

```bash
npm run db:citations:compile-review -- \
  --template=tmp/primary-citation-approval-template.json \
  --worksheet=tmp/primary-citation-review-worksheet.json \
  --output=tmp/primary-citation-reviewed-approval.json
```

The compiler re-derives the complete worksheet, rejects template drift, structural edits, missing selections, and unknown groups, then preserves the original candidate arrays while resolving an exact-equivalent group to its lexically smallest opaque member ID. This is an operational mapping among semantically identical candidates, not a source recommendation. Both commands are read-only with respect to the database, write only new JSON files under ignored `tmp/`, and never create a canonical approval. Inspect the compiled bytes, commit the reviewed result deliberately to `audits/approvals/primary-citations.json`, and record its printed SHA-256 before protected validation. Use `--include-exact-url-index` on both the worksheet and compile commands only when the larger cross-record page-reuse index is useful. The compiler flag independently binds that worksheet variant; adding or removing the index after generation is rejected, and the index never infers source quality.

Run the local portion before pushing:

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

Database and authenticated browser checks require the isolated branch and therefore run in GitHub Actions or an equivalently configured local environment. `npm run doctor` checks local GitHub/Vercel access and common configuration names.

Administrative deal, fund, company, user, source, audit, and dashboard-signal review lists use a fixed 25-row server-side page. The current page is addressable as `?page=N`; missing or malformed values resolve to page 1, and values beyond the result set resolve to the last available page. Confirm previous/next navigation and browser back/forward behavior during authenticated preview testing; pagination does not alter the existing role guard.

## Protected production release

Production schema staging, reviewed data remediation, promotion, rollback, and every scheduled or on-demand data-pipeline run are serialized by the repository-wide `production-release` concurrency group. Production mutation workflows are additionally protected by the GitHub `production` environment.

- `scripts/verify-release-provenance.ts` requires the checkout and fetched `origin/main` to equal the requested full SHA, confirms through GitHub that `main` is protected and still points to that exact SHA, and accepts only the latest successful `build` and `preview-smoke-lineage` checks produced by the GitHub Actions app. Each check ID must equal the job ID in its GitHub URL, and the corresponding successful workflow run must have the exact release SHA, `main` branch, repository, event, and allowlisted workflow path.
- `scripts/verify-rollback-provenance.ts` requires rollback tooling to equal fetched protected `main`, proves the requested rollback SHA is an ancestor of that head, and accepts only a successful exact-SHA `build` check produced by the `github-actions` app before any Vercel mutation.
- **Stage Production Schema** binds two independently verified baselines: the SHA of the application currently serving the protected canonical production origin and the SHA whose migration names and checksums exactly match production's successfully applied migration ledger. Both must independently be ancestors of the release; the migration baseline may be newer than the still-live application after an earlier schema-first stage. The workflow requires `DASHBOARD_WRITES_ENABLED=false`, verifies the live Vercel project, repository, scope, and Git SHA, rechecks the live app and migration ledger immediately before writing, applies additive migrations, and proves the post-write ledger exactly matches the release. It emits reviewer-neutral, migration-timestamp-bound dashboard methodology and legacy-signal manifests but never applies them. Citation, Fund primary-source, duplicate, ownership-link, seller-disclosure, and dashboard outputs are backlog evidence, not implicit approval.
- **Review or Remediate Release Data** separates reports from mutations. Apply and rollback operations require a committed `audits/approvals/*.json` artifact, its exact SHA-256, protected-environment approval, exact database/release/reviewer/reason targeting, and one explicit operation at a time. Dashboard cutover apply and rollback additionally require `DASHBOARD_WRITES_ENABLED=false`; they preserve `updatedAt`, verify every deterministic row precondition, record an `AuditEvent` in the same serializable transaction, and permit rollback only while the reviewed post-apply rows still match exactly.
- **Promote Production Release** accepts only a ready staged production deployment supplied by its immutable Vercel URL, whose target is `production`, project and scope match protected configuration, GitHub source SHA and repository ID match the release, and health reports its 12-character prefix. It requires clean schema/data/source/pipeline gates, rechecks exact protected-main and candidate provenance immediately before promotion, and promotes the verified deployment ID rather than a mutable alias.

Keep `main` frozen from final manifest review through promotion except for the reviewed approval commits required by this process. Each such commit becomes the new eligible release: regenerate the manifest, wait for its exact-SHA gate and staged production build, and restage. If its migration tree is unchanged, use the previously staged commit as the verified migration baseline; independent ancestry checks allow the stage workflow to prove the current ledger and perform a no-op deploy while the older production application remains active. A Vercel Preview is for pre-merge validation only. With automatic domain assignment disabled, the Git-integrated `main` build is a staged production deployment using production environment values; promoting it changes domains without rebuilding.

## Scheduled and on-demand pipelines

`.github/workflows/data-pipelines.yml` uses production-target guards, the same repository-wide `production-release` lock as staging/remediation/promotion/rollback, bounded timeouts, and retries only when output indicates a transient network/provider error. Scheduled and on-demand jobs must receive the pooled `PRODUCTION_DATABASE_HOST` as the expected endpoint and the distinct `PRODUCTION_MIGRATION_DATABASE_HOST` as an explicit forbidden endpoint; dashboard and news mutation entry points repeat that check before constructing Prisma or recording a `PipelineRun`.

On-demand runs use the repository-dispatch API, never `workflow_dispatch`. GitHub therefore loads the workflow from the protected default branch, and the workflow independently requires the `repository_dispatch` event, `refs/heads/main`, and an exact triggering SHA before any job can receive production credentials. Each downstream job checks out `refs/heads/main` and re-verifies that same authenticated SHA. A dispatch cannot select an arbitrary branch or historical release commit: during a release window, protected `main` must still equal the frozen release SHA or Operations must stop and repeat release preparation.

An authenticated Operations owner can dispatch the four allowlisted data-pipeline operations with these copy-safe commands:

```bash
gh api --method POST repos/mikeberry6/Infra-MA2/dispatches \
  --field event_type=run-data-pipeline \
  --field 'client_payload[pipeline]=dashboard'

gh api --method POST repos/mikeberry6/Infra-MA2/dispatches \
  --field event_type=run-data-pipeline \
  --field 'client_payload[pipeline]=news'

gh api --method POST repos/mikeberry6/Infra-MA2/dispatches \
  --field event_type=run-data-pipeline \
  --field 'client_payload[pipeline]=verify'

gh api --method POST repos/mikeberry6/Infra-MA2/dispatches \
  --field event_type=run-data-pipeline \
  --field 'client_payload[pipeline]=source-audit'
```

Dashboard writes are fail-closed. Configure `FRED_API_KEY`, `EIA_API_KEY`, `SAM_API_KEY`, and `SEC_USER_AGENT`. Before production schema staging, set `DASHBOARD_WRITES_ENABLED=false`; the stage workflow and dashboard cutover apply/rollback operations reject unset or true values. Keep it false until all reviewed cutovers finish, then use the approved repository dispatch to run the `source-audit` pipeline from the current protected `main`. That job runs every dashboard provider in read-only dry-run mode and retains both its log and JSON summary. Operations must confirm that every configured source completed, required metrics are current, representative values agree with the linked official pages, and no credential or source-contract warning remains. Only then may Operations set `DASHBOARD_WRITES_ENABLED=true`, dispatch a live dashboard synchronization from that same protected-main revision, and proceed to promotion; production promotion and scheduled synchronization reject missing credentials or an unapproved write flag. Return the flag to false after any dry-run/live-sync failure or provider-integrity incident. `SEC_WATCHLIST_CIKS` is optional and does not replace the required SEC user agent.

| Pipeline | Schedule | Contract |
| --- | --- | --- |
| Dashboard synchronization | Weekdays at 07:30 America/New_York (DST-safe dual UTC schedule) | Latest success within 30 hours; rolling 30-day success at least 95%; failed/skipped provider rate at most 25%; no critical provider may miss two consecutive refreshes |
| News scan | Daily at 23:30 UTC | Job-pinned 200-entity rotating window (current cycle at most eight days) with a 750-page budget and cycle-plus-two-day lookback; latest success within 36 hours; rolling 30-day success at least 95%; real failed fetch/query rate at most 25%; incomplete required-seed windows fail closed |
| Database/email verification | Sundays at 12:00 UTC | Weekly email and links valid; publication/source gates complete; dashboard/news freshness intact |
| Dependency/source audit | First day monthly at 08:00 America/New_York | No high/critical production advisories; dashboard source contracts and freshness, database citations, company-source coverage, duplicates, and portfolio checks reviewed |
| Recovery branch janitor | Hourly at minute 17 UTC | Main-only, non-production project only; delete exact annotated recovery branches after two hours, restored child first; fail visibly on any reserved-prefix identity anomaly |

`scripts/verify-pipeline-health.ts` groups retry attempts by `refreshWindow`, enumerates the exact elapsed weekday/Eastern dashboard slots or daily/UTC news slots, and calculates reliability as successful slots divided by all assessed scheduled slots. A missing scheduled slot remains in the denominator; an unexpected weekend or on-demand window is listed separately and cannot raise the numerator. A current non-stalled `RUNNING` slot remains visible but is not assessed as a historical failure, while a stalled attempt fails the operational contract. The bounded JSON ledger records every expected slot as succeeded, failed, running, or missing and retains only sanitized GitHub run ID, run attempt, event name, and exact SHA provenance—never provider payloads.

The report is `collecting` while operational checks pass but fewer than the required observation days have elapsed, `healthy` only when both operational checks and the complete observation window pass, and `unhealthy` when an operational check fails. `operationallyHealthy` therefore may be true while `healthy` and `exitCriterionMet` remain false. Routine pipeline and verification jobs continue evaluating freshness and failure thresholds during collection; production promotion adds `--require-full-window` for both critical pipelines and fails until the full 30-day window is complete. Never claim the 95% program exit criterion from a partial or collecting report.

Production promotion checks dashboard freshness against the canonical weekday 07:30 America/New_York schedule, so a Friday success remains current through the weekend and becomes overdue at Monday's scheduled boundary. Other callers retain an explicit maximum-age contract. A successful scan with zero qualifying news items remains valid; source/provider failure is measured separately. News coverage counts real upstream page-fetch and search-query attempts, not the number of companies, funds, or managers being tracked. Dashboard coverage counts only latest `SUCCESS` runs as fully covered; a `PARTIAL` run remains visible with allowlisted missing/stale required-metric IDs and is not silently counted as success.

The nightly news selection is canonicalized by entity type/ID and rotated by a UTC date pinned once before the retry wrapper after any explicit `--target` filter. The default 200-target window completes the current universe in no more than eight days and is stable even when a retry crosses midnight. Candidate acceptance uses the same pinned as-of timestamp, and the effective lookback is always at least the full cycle plus two days. Full/eligible/selected counts, offset, window and cycle metadata, effective lookback, plus initial/discovered/deferred crawl-budget evidence are stored in the summary artifact and `PipelineRun.metadata`. Official site/current-news seeds are round-robined ahead of historical citation URLs. Intentional deferral within this declared bounded contract is transparent but is not a provider failure; missing required seeds, zero attempts, legacy incomplete page-cap records, and real upstream failures above 25% remain unhealthy.

Diagnostic collection is deliberately non-short-circuiting after installation succeeds. News reliability verification runs even when the scan command fails, weekly database/source and pipeline checks aggregate their independent exit codes, and the monthly dependency and database/source audits still execute if the live provider dry run fails. Evidence uploads use `always()` so a primary failure does not erase the summaries needed to diagnose it; the job still exits non-zero when any required check fails.

GitHub Actions failure notifications are the primary alert channel until a dedicated paging integration is approved. The Operations owner must keep notifications enabled for the repository and review a failed dashboard job the same business day. A critical-source failure is escalated to Research, which owns the source contract; two consecutive missed refresh windows, an unresolved freshness breach, or a validation/range failure also requires an incident record under `docs/incidents/` and Engineering review. Preserve the last validated cache throughout the incident, set `DASHBOARD_WRITES_ENABLED=false` if source integrity is uncertain, and re-enable writes only after a clean read-only all-source dry-run and reviewed evidence.

Scheduled news runs treat `NEWS_SCAN_ROTATION_DATE` as a service date: subtracting six hours binds a delayed 23:30 UTC cron execution to its intended day through 05:59 UTC instead of duplicating the next day's window. On-demand dispatches use their actual UTC date.

Rolling pipeline and weekly-verification artifacts are retained for 60 days so the complete 30-day evidence chain remains available for review; monthly audit and production release evidence are retained for 90 days. Artifacts must never contain tokens, credentials, imported row contents, or private query data.

The LinkedIn candidate collector is also on-demand through the repository-dispatch API. It executes only `refs/heads/main`, verifies that the checkout matches the triggering default-branch SHA before exposing `APIFY_TOKEN`, uploads review candidates only, and never commits, publishes, or modifies a protected branch:

```bash
gh api --method POST repos/mikeberry6/Infra-MA2/dispatches \
  --field event_type=collect-linkedin-candidates
```

## Publication and source gates

`scripts/source-coverage-report.ts` reports published deals and companies with an explicitly designated primary citation, published Funds with an explicitly reviewed HTTP(S) `primarySourceUrl`, and the `lastVerifiedAt` backlog. Supporting `sourceUrls` and `strategyUrl` values do not satisfy the Fund gate and are never promoted automatically. Release and scheduled verification require 100% source presence. Candidate citation order is deliberately neutral: Research must verify the evidence and name the primary citation explicitly. Never infer a primary source from array, creation, or identifier order.

`npm run db:duplicates:verify` separately fails while any normalized duplicate cluster remains in the published public scope. Citation designation, Fund primary-source designation, company merging, ownership-to-fund-link repair, and missing-seller treatment are reviewed remediation operations, never migration backfills. Generate a report under `tmp/`, review and commit the exact canonical approval JSON, record its SHA-256, create a restore branch before production writes, apply one decision set, and rerun the strict gates. The Fund template contains every published Fund whose designation is absent or invalid, lists only credential-free HTTP(S) candidates from supporting `sourceUrls` and `strategyUrl` in neutral lexical order, and leaves `selectedPrimarySourceUrl` null. A Fund without a selectable candidate requires an editorial evidence correction and a regenerated template. The seller report includes only published deals that have no `SELLER` participant and still fail `hasReviewedSellerTreatment`; it leaves both decision fields null and never treats citation or participant ordering as a recommendation.

Use `npm run db:fund-primary-sources:report -- --output=tmp/fund-primary-source-approval-template.json` for the read-only Fund packet. Research fills every exact candidate selection and commits the immutable result at `audits/approvals/fund-primary-sources.json`. Protected automation invokes `npm run db:fund-primary-sources:apply -- --apply --approval-file=audits/approvals/fund-primary-sources.json --expected-sha256=<exact-digest>` with the required target, release, matching reviewer, and reason context. It verifies the approval bytes at that release SHA, exact Fund ID/legacy ID/status/`updatedAt`/candidate preconditions, uses one serializable transaction, and records an `AuditEvent`. Exact replays are no-ops only when the prior hash-bound audit and resulting `updatedAt` still match. Do not run the apply command directly against production and do not clear a valid designation as rollback; corrections require a newly generated and reviewed forward approval.

Use `npm run db:seller-disclosures:report -- --output=tmp/deal-seller-disclosure-approval-template.json` for the read-only packet. After review and commit at the canonical path, protected automation invokes `npm run db:seller-disclosures:apply -- --apply --approval-file=audits/approvals/deal-seller-disclosures.json --expected-sha256=<exact-digest>` with the required target/release/reviewer/reason environment. Do not run the apply command directly against production.

Company consolidation remains a reviewed operation. Verify every canonical survivor, relationship transfer, and `CompanyRedirect` before applying a merge. Do not use automated view-layer deduplication as evidence that database cleanup is complete.

## Credentials and logging

Ordinary seeding never creates an administrator. Bootstrap or rotate one only in a trusted environment:

```bash
ADMIN_EMAIL=... ADMIN_PASSWORD=... \
EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
FORBIDDEN_DATABASE_HOST=... npm run admin:create
```

Use a unique password of at least 14 characters with upper/lowercase, number, and symbol. Rotate the production administrator credential and `NEXTAUTH_SECRET` after the bootstrap release; record completion without recording either value.

Database seeding is restricted to an explicitly named `development` or `validation` target. Before `npm run db:seed`, set `EXPECTED_DATABASE_HOST`, `EXPECTED_DATABASE_NAME`, at least one opposite-environment `FORBIDDEN_DATABASE_HOST`, and `TARGET_DATABASE`; the seed command refuses `TARGET_DATABASE=production`.

Legacy maintenance apply modes are also fail-closed. In addition to the exact host/database guard, they require the reviewed lowercase `RELEASE_SHA`, `MUTATION_REVIEWED_BY`, and `MUTATION_REASON`, and they emit an `AuditEvent` in the same transaction or record a durable start/completion pair. Reviewed remediation applies additionally require the exact committed approval path and `--expected-sha256=<reviewed input digest>`. Dry-run/report modes do not write and do not require reviewer metadata. Prefer the gated admin import and reviewed remediation workflows whenever they cover the operation.

Runtime request and task logs use one allowlisted JSON envelope: request or task ID, route or task, operation, duration, status, and a fixed sanitized error classification/message when applicable. Server pages and actions reuse the middleware `x-request-id` when a Next request context exists; standalone jobs generate a task ID. Public database, dashboard, and news routes record separate render and cached-data-load operations with the same request ID. Dashboard synchronization records each provider fetch as a `dashboard_provider` operation, and the news scanner separately times tracked-context loading, source crawling, and news search. These operation timings measure latency without serializing provider payloads.

The logger strips query strings and rejects unsafe labels; it never serializes raw errors, stacks, request bodies, database arguments, imported rows, credentials, tokens, email addresses, or private query terms. `PipelineRun.errorSummary` and provider-level dashboard errors use the same safe classifier, retaining only a category and, when available, an allowlisted HTTP/system/database code. Review artifacts may separately contain approved public entity IDs and aggregate counts when their documented purpose requires them.

Drawer shell timing is a browser-only, payload-free performance measurement named by entity kind (`deal`, `fund`, or `company`). It starts immediately before the selection state changes and stops in a layout effect when the shell commits, without waiting for lazy detail data. Only the latest mark/measure is retained. The 100 ms threshold is a regression budget asserted by Playwright, not a claim of production p75 performance and not an analytics event containing a record identifier.

## Vercel telemetry verification

Keep Web Analytics and Speed Insights enabled for the `infra-ma-2` project. The source integration alone is not operational evidence: after each production release, open both Vercel project dashboards, select Production, confirm they are no longer showing setup/onboarding, and record the observation period and sample count without exporting visitor-level data. Review route errors, database latency, critical pipeline failures, and external-provider latency in Vercel Observability weekly and during the 15-minute post-release check.

The application emits only the seven allowlisted product events: search submitted, filter applied, drawer opened, source link clicked, weekly email opened, research contact initiated, and authenticated export started. Event properties are bounded classifications and counts, never query text, record titles, email addresses, user IDs, source URLs, or credentials. Vercel Hobby does not expose custom Web Analytics events; if the project remains on Hobby, treat event-dashboard verification as blocked rather than claiming those events were collected. A reviewed plan upgrade or an approved privacy-compatible sink is required before custom-event KPIs can be operationally attested.

Core Web Vitals targets require a representative rolling production sample. A small number of route samples can prove that Speed Insights is receiving data but cannot establish p75 LCP, INP, or CLS. The verified project is currently on Vercel Hobby, whose Speed Insights reporting window is only seven days; Vercel documents a 30-day window for Pro and a 90-day window for Enterprise in its [Speed Insights limits](https://vercel.com/docs/speed-insights/limits-and-pricing). The 30-day exit criterion therefore cannot be evidenced from the current Hobby dashboard.

Before starting the performance observation window, obtain explicit approval either to upgrade the project to a Vercel plan with at least 30 days of Speed Insights history or to operate a separately reviewed, privacy-compatible real-user-monitoring sink with equivalent aggregate evidence. Do not infer approval from the code integration and do not export visitor-level data. For both mobile and desktop, record the production environment, release SHA/deployment, observation start/end, reporting-window capability, route scope, p75 LCP/INP/CLS values, units, sample counts, observation time, and reviewer. Keep the exit criterion open until all six device/metric combinations have a complete 30-day window and meet their thresholds.

## Health contract

`GET /api/health` is dynamic, explicitly non-cacheable, and exposes exactly six top-level fields: `status`, `version`, `generatedAt`, `database`, `pipelines`, and `generationTimeMs`. Each critical-pipeline item contains only its name, classified status, last-attempt time, last-success time, and `lastSuccessfulRunProof`: a namespaced SHA-256 proof of the exact persisted row ID. The raw row ID is never exposed. The endpoint never returns schema checks, hostnames, database names, branch identifiers, credentials, or query details. It returns HTTP 503 when the database is unavailable, the additive operational schema is not ready, or a critical pipeline is `never-run`, `failed`, `stale`, or `stalled`. A currently `running` pipeline passes only while it is within the schedule grace contract, has not exceeded the three-hour stall limit, and has a prior successful run; callers must not treat another reachable 503 as healthy. Malformed identities, impossible timestamps, or future-dated run timestamps do not count as freshness evidence. On a Vercel release, `version` is the 12-character release prefix used by promotion provenance checks; an unversioned local process reports `local`.

## Dependency policy

Production dependencies must have zero unaccepted high or critical advisories. Do not run an unreviewed forced audit rewrite. Patch each path deliberately and record any development-only exception with package path, exploitability, owner, and review date.

The current complete and production-only dependency trees have zero reported vulnerabilities. Patched transitive overrides and the zero-exception posture are recorded in [dependency-exceptions.md](./dependency-exceptions.md). Any future exception must be time-bounded and committed before it can be accepted by the release gate.

## Retention and workspace hygiene

- Keep versioned research, approved audits, historical weekly briefings, migrations, and release records.
- Keep workflow artifacts for the periods above, then let GitHub expire them automatically.
- Treat `tmp/`, Playwright reports, traces, and scan summaries as ephemeral.
- Preserve every unclassified worktree artifact until its owner and retention state are recorded. Never mass-delete a dirty worktree.
- Historical weekly email editions are immutable unless the user explicitly authorizes a historical correction.

Production schema staging and application promotion are separate protected workflows so the first `PipelineRun` migrations can land before the dashboard/news initialization runs. See [release-runbook.md](./release-runbook.md), [incident-response.md](./incident-response.md), [governance.md](./governance.md), and [release-record-template.md](./release-record-template.md) for controlled production changes and recovery.
