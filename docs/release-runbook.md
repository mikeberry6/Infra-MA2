# Production Release and Recovery Runbook

## Safety model

InfraSight releases are exact-SHA, schema-first, and promotion-based:

1. A pull request validates additive migrations and compatible application code against an isolated Neon branch and a Vercel Preview deployment.
2. After merge, the release SHA must be the current protected `main` head and the GitHub Actions `build` check from the `github-actions` app must have succeeded for that exact SHA.
3. Vercel builds that `main` commit as a staged **production** deployment with production configuration but without assigning the production domains.
4. A reviewed manifest binds the current production application SHA, release SHA, migration paths, and committed migration-blob hashes. Only additive DDL may be staged while the prior application remains active.
5. Citation and duplicate-company backlogs are handled separately through explicit Research decisions and audited remediation. A schema migration never invents citations, selects canonical survivors, or publishes records.
6. Production promotion requires clean schema, data, source, pipeline, deployment-identity, and smoke gates. Promoting the staged production deployment does not rebuild it.
7. The prior deployment and additive schema remain compatible for immediate application rollback.

Merging `main` may create a Vercel production build, but automatic production-domain assignment must stay disabled. Never use a feature branch as Vercel's production branch and never promote a Preview deployment as the normal release candidate.

## One-time setup

- Create the GitHub `production` environment with a required Engineering or Operations reviewer; disable self-review and administrator bypass where the plan permits.
- Protect `main` against direct pushes, force-pushes, and deletion. Require pull requests, resolved conversations, and the `build` status context.
- Confirm the GitHub branch API reports `main` as protected; production workflows fail closed if it does not.
- Configure every secret and exact host/database/project variable listed in [operations.md](./operations.md), including `VERCEL_PROJECT_ID`.
- Create an isolated Neon validation branch from a recent production snapshot. Never point `MIGRATION_DATABASE_URL` at production.
- Configure Vercel Preview with the validation database and preview-only NextAuth credentials.
- Configure `main` as Vercel's sole production branch, use Node 24, and disable automatic production-domain assignment so successful `main` builds remain staged until promotion.
- Confirm Vercel retains the prior known-good deployment and record how to identify it without guessing.

## Pull-request validation

1. Open a pull request containing one coherent phase. Do not combine framework upgrades, schema changes, and major UI work.
2. Review every migration as additive. `DROP`, data mutation, destructive type conversion, table replacement, and column alteration are outside the normal staging workflow.
3. Wait for the complete pull-request **Release Gate**, including exact committed-blob migration auditing, isolated database migration, source/canonical-data reports, authenticated Playwright, axe, responsive, and visual checks.
4. When source coverage blocks validation, download the reviewer-neutral primary-citation approval template. A failing gate is expected until Research supplies evidence-backed decisions; do not weaken the gate.
5. Review the migration manifest, source-coverage report, duplicate-company report, weekly-email verification, production dependency audit, and Playwright artifacts.
6. Exercise anonymous browse/search/filter/sort/pagination/deep-link flows and authenticated admin/import-preview/export authorization flows on the Vercel Preview. Do not commit an import solely for smoke testing.

The Preview proves the pull request against non-production configuration. It is not the deployment later promoted to production.

## Exact release preparation

1. Merge only after the pull-request gate succeeds. Pause additional `main` merges for the release window.
2. Wait for the `main` push **Release Gate**. Record the full SHA; it must remain the current protected `main` head through schema staging and promotion.
3. Identify the full SHA of the application currently serving production. This is `production_base_sha`; do not substitute a migration name, branch name, or assumed deploy time.
4. From a clean checkout of the release SHA, generate the additive manifest:

   ```bash
   node --experimental-strip-types scripts/audit-additive-migrations.ts \
     --base-sha=<production-base-sha> \
     --release-sha=<release-sha> \
     --output=tmp/release-preparation/migration-manifest.json
   ```

   The script normalizes both revisions to full commits and reads every migration from the release commit, not the working tree. Review the base/release SHAs, ordered migration paths, blob hashes, policy, and manifest SHA-256.
5. Confirm Vercel created a ready staged production deployment for the exact release SHA. Record its immutable deployment URL. Do not use an automatically aliased URL or a Preview candidate.
6. Record the release SHA, current production SHA, manifest hash, CI run, validation Neon branch, staged deployment URL, restore branch, and prior deployment in a copy of [release-record-template.md](./release-record-template.md).

If `main` advances, stop. The old SHA is no longer eligible: rerun the `main` gate, regenerate/review the manifest, and use the new staged production deployment.

## Reviewed citation and duplicate remediation

Publication gates intentionally remain closed while published records lack an explicit primary citation or a public duplicate cluster remains.

The isolated validation gate uses a deliberate two-pass review when both kinds of backlog exist:

1. A blocked validation run emits neutral company and citation templates before the strict gates fail.
2. Research reviews the all-status company template first, chooses each canonical survivor, confirms ownership/citation relationships, and requires a `CompanyRedirect` for every retired public ID. Commit the exact result as `audits/approvals/company-merges.json` through review.
3. On the next validation run, CI computes that committed file's SHA-256 and applies it only to the isolated validation branch. The apply is snapshot-bound and idempotent. CI then generates a post-merge citation template if `audits/approvals/primary-citations.json` is absent.
4. Discard any citation template generated before company merges that changed a candidate entity. Research verifies the post-merge evidence and selects each primary citation explicitly. Candidate ordering is not a recommendation and must never become an automatic first-citation rule.
5. Commit the reviewed citation file as `audits/approvals/primary-citations.json`. The next validation run applies company merges first and citations second, then requires complete sources and a clean published duplicate scope.

If no company merges are approved, Research may proceed directly with the current citation template. Never edit an approval artifact after review; a changed decision requires a regenerated template and new reviewed commit.

For production, run **Review or Remediate Release Data** one operation at a time against the exact protected-main release. Supply the committed path and exact reviewed hash, retain the evidence, and rerun read-only reports after each operation. Before any production apply, create or confirm a current Neon restore branch. The operation must prove both the approved host and database name and reject stale snapshots or a mismatched approval hash.

If adding an approval file advances `main`, that commit becomes a new release SHA. Repeat exact release preparation and schema staging; do not promote the older SHA. Data remediation is a controlled production change, not part of `prisma migrate deploy`.

## Production schema staging and promotion

1. Announce the release window; pause manual imports/publication and keep `main` frozen.
2. Confirm dashboard and news pipelines are healthy and no pipeline/import is running.
3. Create a Neon production restore branch immediately before the first production write; record its ID and timestamp.
4. Run **Stage Production Schema** with:

   - the exact current protected-main `release_sha`;
   - the current promoted `production_base_sha`;
   - the reviewed `migration_manifest_sha256`;
   - confirmation `STAGE`.

5. Approve the protected `production` environment. The workflow rechecks exact protected-main provenance immediately before writing, proves the production host and database name, applies only the release's additive migration history, checks status/drift, and records citation/duplicate backlogs without auto-remediating them.
6. Complete any approved citation/company remediation described above. Re-run reports until source coverage is complete and published duplicate clusters are clean.
7. Manually dispatch dashboard and news pipelines from the exact release SHA. Wait for both to succeed and review provider/source threshold artifacts.
8. Run **Promote Production Release** with the exact release SHA, its staged production deployment URL, the canonical production URL, and confirmation `PROMOTE`; approve the protected environment.

The promotion workflow requires all of the following before changing domains:

- the release still equals the current protected `main` head and exact-SHA `build` succeeded from GitHub Actions;
- the candidate is ready, has Vercel target `production`, belongs to `VERCEL_PROJECT_ID`, and carries the exact `githubCommitSha`;
- candidate `/api/health` reports the release's exact 12-character SHA prefix;
- production host and database name match the allowlist, migration status is clean, and schema drift is zero;
- database verification, explicit primary-source coverage, canonical-company, dashboard completeness, and rolling pipeline gates pass.

The workflow rechecks protected-main provenance immediately before `vercel promote`, promotes the already-built staged production deployment, and smoke-tests the canonical URL. If schema staging fails after an additive migration, the old application remains active; investigate and fix forward before promotion.

## Post-release verification

Within 15 minutes:

- Confirm `/api/health` is HTTP 200, reports the expected 12-character release prefix, database connectivity, and healthy critical pipelines.
- Confirm `/tracker`, `/funds`, `/portfolio`, `/news`, `/dashboard`, `/search`, `/earnings`, and `/login` load under `/Infra-MA2`.
- Confirm `/` resolves permanently to `/tracker` and anonymous export remains 403.
- Sign in as an administrator, inspect the audit log, preview (but do not commit) a small import, and verify a permitted analyst/admin export.
- Check Vercel route errors, database latency, provider latency, and Core Web Vitals for regressions.
- Resume publication/imports and attach the 90-day release evidence to the release record.

After the bootstrap/security release, rotate the production administrator credential and `NEXTAUTH_SECRET`; sign in again after rotation. Record only completion time and operator, never values.

## Application rollback

Use rollback when the application regresses and the prior application is compatible with the additive schema.

1. Stop imports/publication and capture the incident start time, current SHA, and failing request IDs.
2. Select the prior verified Vercel deployment recorded in the release record.
3. Run **Roll Back Production** with confirmation `ROLLBACK`. Use `full` smoke policy normally. `public-only` is a documented break-glass option for a legacy target without `/api/health` or the canonical root redirect.
4. Verify canonical routes, login, audit log, and authorization manually.
5. Do not reverse additive migrations. Fix forward in a new pull request.

If the rollback workflow is unavailable, an authorized Operations owner may run:

```bash
vercel rollback <known-good-deployment-id-or-url> --yes
```

Record the command, operator, deployment ID, and verification evidence. Never guess the deployment target.

## Database recovery

Database recovery is distinct from application rollback and requires Engineering plus Operations approval.

1. Block all application writes and scheduled pipelines.
2. Preserve the affected branch and export audit/pipeline evidence.
3. Compare the incident timestamp with the pre-release restore branch and Neon point-in-time recovery window.
4. Restore to a new Neon branch first; run migration status, `db:verify`, source coverage, and critical user journeys against it.
5. Switch production credentials only after validation and two-person approval.
6. Retain the old production branch read-only until reconciliation and postmortem finish.

Never repair broad corruption through ad hoc row edits or destructive reverse migrations.

## Quarterly recovery exercise

Once per quarter, Operations creates a temporary restore branch, Engineering deploys the current application against it, Research verifies representative deal/fund/company records and citations, and the team runs rollback against a non-production alias. Record recovery point, recovery time, discrepancies, and follow-up owners. An actual tested production rollback may satisfy the deployment portion, but not the database-restore portion.
