# Production Release and Recovery Runbook

## Safety model

InfraSight releases are exact-SHA, schema-first, and promotion-based:

1. A pull request validates additive migrations and compatible application code against an isolated Neon branch and a Vercel Preview deployment.
2. After merge, the release SHA must be the current protected `main` head and the GitHub Actions `build` check from the `github-actions` app must have succeeded for that exact SHA.
3. Vercel builds that `main` commit as a staged **production** deployment with production configuration but without assigning the production domains.
4. A reviewed v2 manifest binds the current production application SHA, exact applied production migration baseline, release SHA, migration paths, and committed migration-blob hashes. The application and migration baselines are independently required to be ancestors of the release; neither is assumed to precede the other because schema-first staging can advance the migration ledger while the prior application remains active. Only additive DDL may be staged during that interval.
5. Citation, ownership-link, seller-disclosure, and duplicate-company backlogs are handled separately through explicit Research decisions and audited remediation. A schema migration never invents citations or seller treatment, selects canonical survivors, repairs editorial links, or publishes records.
6. Production promotion requires clean schema, data, source, pipeline, deployment-identity, and smoke gates. Promoting the staged production deployment does not rebuild it.
7. The prior deployment and additive schema remain compatible for immediate application rollback.

Merging `main` may create a Vercel production build, but automatic production-domain assignment must stay disabled. Never use a feature branch as Vercel's production branch and never promote a Preview deployment as the normal release candidate.

## One-time setup

- Create the GitHub `Production` environment with a required Engineering or Operations reviewer and self-review prevention. Set its deployment-branch policy to **Selected branches and tags**, with `main` as the only entry; an in-workflow ref guard alone cannot protect secrets from modified workflow code on a caller-selected branch. Disable administrator bypass where the plan permits.
- Protect `main` against direct pushes, force-pushes, and deletion. Require pull requests, resolved conversations, and the `build` status context.
- Confirm the GitHub branch API reports `main` as protected; production workflows fail closed if it does not.
- Configure every secret and exact host/database/project variable listed in [operations.md](./operations.md), including `VERCEL_PROJECT_ID` and the protected canonical `PRODUCTION_URL`.
- Create a Vercel **Protection Bypass for Automation** secret for the project and store the same value only as the GitHub `Production` environment secret `VERCEL_AUTOMATION_BYPASS_SECRET`. Candidate smoke tests send it as a same-origin header, reject cross-origin redirects, and never place it in a URL or retained report.
- Create an isolated Neon validation branch from a recent production snapshot. Configure its direct URL as `MIGRATION_DATABASE_URL`, its exact host as `MIGRATION_DATABASE_HOST`, and its database name as `MIGRATION_DATABASE_NAME`. Never point any of these validation values at production.
- Configure Vercel Preview with the validation database and preview-only NextAuth credentials.
- Enable Vercel's **Automatically expose System Environment Variables** setting and verify a Preview exposes `VERCEL_DEPLOYMENT_ID` during both build and runtime. If that setting is unavailable, configure a unique `DATA_CACHE_NAMESPACE` per deployment in both contexts.
- Set `NEXT_PUBLIC_SITE_URL` to the canonical origin in Production and the intended non-production origin in Preview so Open Graph and Twitter metadata do not resolve against the fallback host.
- Configure `main` as Vercel's sole production branch, use Node 24, and disable automatic production-domain assignment so successful `main` builds remain staged until promotion.
- Confirm Vercel retains the prior known-good deployment and record how to identify it without guessing.

## Pull-request validation

1. Open a pull request containing one coherent phase. Do not combine framework upgrades, schema changes, and major UI work.
2. Review every migration as additive. `DROP`, data mutation, destructive type conversion, table replacement, and column alteration are outside the normal staging workflow.
3. Wait for the complete pull-request **Release Gate**, including exact committed-blob migration auditing, isolated database migration, source/canonical-data reports, authenticated Playwright, axe, responsive, and visual checks.
4. When source, canonical-company, ownership-link, or seller-treatment coverage blocks validation, download the reviewer-neutral company-merge, ownership-link, Fund primary-source, deal seller-disclosure, and primary-citation approval templates. A failing gate is expected until Research supplies evidence-backed decisions; do not weaken the gate.
5. Review the migration manifest, source-coverage report, duplicate-company and ownership-link reports, weekly-email verification, production dependency audit, and Playwright artifacts.
6. Exercise anonymous browse/search/filter/sort/pagination/deep-link flows and authenticated admin/import-preview/export authorization flows on the Vercel Preview. For each administrative list, verify the fixed 25-row `?page=N` navigation, malformed/out-of-range normalization, and browser back/forward behavior. Do not commit an import solely for smoke testing.

The Preview proves the pull request against non-production configuration. It is not the deployment later promoted to production.

## Exact release preparation

1. Merge only after the pull-request gate succeeds. Pause additional `main` merges for the release window.
2. Wait for the `main` push **Release Gate**. Record the full SHA; it must remain the current protected `main` head for each production dispatch. A later committed approval creates a new eligible release only after its own exact-SHA gate and preparation pass.
3. Identify the full SHA of the application currently serving production. This is `production_app_sha`; resolve it from immutable deployment metadata rather than a branch name or assumed deploy time.
4. Identify `migration_base_sha`: the full commit whose `prisma/migrations` names and SHA-256 checksums exactly match the successfully applied production migration ledger. From a clean checkout of the release SHA, prove that baseline read-only and generate the additive manifest:

   ```bash
   DATABASE_URL=<direct-production-url> \
   EXPECTED_DATABASE_HOST=<direct-production-host> \
   EXPECTED_DATABASE_NAME=<production-database-name> \
   FORBIDDEN_DATABASE_HOST=<validation-database-host> \
     sh -c 'node --experimental-strip-types scripts/assert-database-target.ts && \
       node --experimental-strip-types scripts/verify-migration-baseline.ts \
       --base-sha=<migration-base-sha> \
       --output=tmp/release-preparation/migration-baseline.json'

   node --experimental-strip-types scripts/audit-additive-migrations.ts \
     --base-sha=<migration-base-sha> \
     --production-app-sha=<production-app-sha> \
     --release-sha=<release-sha> \
     --output=tmp/release-preparation/migration-manifest.json
   ```

   The baseline verifier rejects missing, extra, duplicate, or checksum-mismatched migrations. The manifest script normalizes both revisions to full commits and reads every new migration from the release commit, not the working tree. Review the application SHA, migration baseline/release SHAs, ordered migration paths, blob hashes, policy, and manifest SHA-256.
5. Confirm Vercel created a ready staged production deployment for the exact release SHA. Record its immutable deployment URL. Do not use an automatically aliased URL or a Preview candidate.
6. Record the release SHA, current production application SHA, verified migration-baseline SHA, manifest hash, CI run, validation Neon branch, staged deployment URL, restore branch, and prior deployment in a copy of [release-record-template.md](./release-record-template.md).

If `main` advances, stop. The old SHA is no longer eligible: rerun the `main` gate, regenerate/review the manifest, and use the new staged production deployment. If schema was already staged and the migration tree is unchanged, use the successfully staged commit as `migration_base_sha`; the staging workflow independently proves both that baseline and the still-live application are ancestors of the new release, verifies the ledger, and performs a no-op migration deploy.

## Reviewed citation, Fund source, ownership-link, seller-disclosure, and duplicate remediation

Publication gates intentionally remain closed while published deals or companies lack an explicit primary citation, a published Fund lacks an explicitly reviewed HTTP(S) `primarySourceUrl`, a published deal lacks reviewed seller treatment, a public duplicate cluster remains, or an ownership period has a broken, stale, or missing exact fund link.

The isolated validation gate uses deliberate staged review when these backlogs coexist:

1. A blocked validation run emits neutral company, ownership-link, Fund primary-source, seller-disclosure, and citation templates before the strict gates fail.
2. Research reviews the all-status company template first, chooses each canonical survivor, confirms ownership/citation relationships, and requires a `CompanyRedirect` for every retired public ID. Commit the exact result as `audits/approvals/company-merges.json` through review.
3. On the next validation run, CI computes that committed file's SHA-256 and applies it only to the isolated validation branch. The apply is snapshot-bound and idempotent. CI then generates post-merge ownership-link and citation templates, plus the independent current Fund primary-source and seller-disclosure templates, when their committed approvals are absent.
4. Discard any ownership-link or citation template generated before company merges that changed a candidate entity. Research verifies each link correction and primary citation explicitly. An ownership approval may only unlink a stale fund ID or link the vehicle to an exact normalized fund-name match; it cannot rewrite ownership metadata. Citation candidate ordering is not a recommendation and must never become an automatic first-citation rule. For each Fund item, Research must choose an exact HTTP(S) URL already listed in the neutral candidates drawn from `sourceUrls` and `strategyUrl`; lexical URL order is not a recommendation. Correct missing or invalid supporting evidence through the editorial workflow and regenerate instead of inventing or auto-selecting a URL in the approval.
5. Review every seller-free deal independently. If its evidence identifies a seller, add the seller through the editorial interface and regenerate the report. Otherwise choose only `NOT_DISCLOSED` or `NOT_APPLICABLE`, provide an evidence-based reason of at least 10 characters, and commit the exact result as `audits/approvals/deal-seller-disclosures.json`. The generated file never chooses a status or reason.
6. Commit reviewed decisions as `audits/approvals/ownership-fund-links.json`, `audits/approvals/fund-primary-sources.json`, `audits/approvals/deal-seller-disclosures.json`, and `audits/approvals/primary-citations.json`. The next validation run applies company merges, ownership links, Fund primary sources, seller treatments, and citations in that order, then requires complete sources, reviewed seller treatment, valid ownership linkage, and a clean published duplicate scope.

If no company merges are approved, Research may proceed directly with the current ownership-link, Fund primary-source, seller-disclosure, and citation templates. Never edit an approval artifact after review; a changed decision requires a regenerated template and new reviewed commit.

For production, run **Review or Remediate Release Data** one operation at a time against the exact protected-main release. Supply the committed path and exact reviewed hash, retain the evidence, and rerun read-only reports after each operation. Before any production apply, create or confirm a current Neon restore branch. The operation must prove both the approved host and database name and reject stale snapshots or a mismatched approval hash.

If adding an approval file advances `main`, that commit becomes a new release SHA. Repeat exact release preparation and schema staging; do not promote the older SHA. When the approval-only commit does not add migrations, use the previously staged schema commit as the verified migration baseline and review the resulting empty migration delta. Data remediation remains a controlled production change, not part of `prisma migrate deploy`.

## Production schema staging and promotion

1. Announce the release window; pause manual imports/publication and keep `main` frozen.
2. Confirm dashboard and news pipelines are healthy and no pipeline/import is running. Set the protected `DASHBOARD_WRITES_ENABLED` variable to the literal `false` before staging. All data-pipeline and production-release workflows share the `production-release` lock, so wait for the lock to clear and leave the flag false through every dashboard cutover apply or rollback.
3. Create a Neon production restore branch immediately before the first production write; record its ID and timestamp.
4. Run **Stage Production Schema** with:

   - the exact current protected-main `release_sha`;
   - the current promoted `production_app_sha`;
   - the verified applied `migration_base_sha`;
   - the reviewed `migration_manifest_sha256`;
   - confirmation `STAGE`.

5. Approve the protected `production` environment. The workflow reads the canonical origin from protected `PRODUCTION_URL`, requires its live deployment's protected scope, project, GitHub source SHA, and repository ID to match, independently requires both the reviewed migration baseline and production application to be ancestors of the release, and rechecks exact protected-main provenance plus the live app and migration ledger immediately before writing. It also requires `DASHBOARD_WRITES_ENABLED=false`, proves the production host and database name, applies only the release's additive migration history, verifies the resulting migration checksums exactly match the release, checks status/drift, and records citation, Fund primary-source, duplicate, ownership-link, seller-disclosure, and dashboard-cutover backlogs without auto-remediating them.
6. Review and commit any dashboard methodology or legacy-signal manifest. The approval commit is a new release SHA: rerun the exact-SHA gate and preparation, use the staged schema commit as the migration baseline when the migration tree is unchanged, and run the no-op schema-stage verification for that SHA. Then dispatch its explicit apply operation through **Review or Remediate Release Data** while `DASHBOARD_WRITES_ENABLED` is still exactly `false`. Supply the exact file SHA-256, matching reviewer identity, and mutation reason. Use the corresponding rollback operation only with that same committed dashboard manifest, the flag still false, and every post-apply row still matching. Complete any approved citation/company/ownership-link/Fund-primary-source/seller-disclosure remediation and rerun reports until all gates are clean. Fund primary-source designation follows the same forward-only reviewed correction model as citations and ownership links; clearing a designation would reopen the strict publication gate and is not an automated rollback operation.
7. Keep the write flag false and confirm that the protected `main` head still equals the frozen release SHA. On-demand production pipelines use `repository_dispatch`, which executes only the protected default-branch workflow; callers choose an allowlisted pipeline, not a branch or SHA. Dispatch the read-only source audit with:

   ```bash
   frozen_release_sha='<40-character-frozen-release-sha>'
   test "$(gh api repos/mikeberry6/Infra-MA2/git/ref/heads/main --jq '.object.sha')" = "$frozen_release_sha" || {
     echo "protected main no longer equals the frozen release SHA" >&2
     exit 1
   }

   gh api --method POST repos/mikeberry6/Infra-MA2/dispatches \
     --field event_type=run-data-pipeline \
     --field 'client_payload[pipeline]=source-audit'
   ```

   Review the all-source dry-run artifact. Only after it passes may Operations set `DASHBOARD_WRITES_ENABLED=true`. Reconfirm that protected `main` still equals the frozen release SHA, then dispatch dashboard synchronization and news scanning:

   ```bash
   gh api --method POST repos/mikeberry6/Infra-MA2/dispatches \
     --field event_type=run-data-pipeline \
     --field 'client_payload[pipeline]=dashboard'

   gh api --method POST repos/mikeberry6/Infra-MA2/dispatches \
     --field event_type=run-data-pipeline \
     --field 'client_payload[pipeline]=news'
   ```

   The workflow rejects any event other than the schedule or approved repository dispatch, authenticates `refs/heads/main` and its triggering SHA before any credential-bearing step, and rechecks that every job uses that same revision. Wait for both live runs to succeed and review their provider/source threshold artifacts. If `main` advances, refreeze and repeat release preparation; if the dry run or live synchronization fails, restore the write flag to false and stop.
8. Run **Promote Production Release** with the exact release SHA, its immutable staged production deployment URL (never an alias), and confirmation `PROMOTE`; approve the protected environment. Promotion requires the dashboard write flag to be true after the reviewed dry run and successful live synchronization.

The promotion workflow requires all of the following before changing domains:

- the release still equals the current protected `main` head and exact-SHA `build` succeeded from GitHub Actions;
- the candidate is ready, has Vercel target `production`, belongs to `VERCEL_PROJECT_ID`, and has matching GitHub source SHA, commit metadata, and immutable repository ID;
- candidate `/api/health` returns only the documented six-field top-level contract and reports the release's exact 12-character SHA prefix;
- production host and database name match the allowlist, migration status is clean, and schema drift is zero;
- database verification, explicit primary-source coverage, canonical-company, dashboard completeness, and rolling pipeline gates pass;
- both critical-pipeline reliability artifacts have a complete 30-day observation window and `exitCriterionMet=true`; a `collecting` artifact fails promotion through `--require-full-window` even when it is currently `operationallyHealthy`.

The workflow rechecks protected-main and immutable candidate provenance immediately before its team-scoped Vercel promotion request, promotes the verified deployment ID through the checked-in native API client, and smoke-tests the protected canonical URL. If schema staging fails after an additive migration, the old application remains active; investigate and fix forward before promotion.

## Post-release verification

Within 15 minutes:

- Confirm `/api/health` is HTTP 200, contains exactly `status`, `version`, `generatedAt`, `database`, `pipelines`, and `generationTimeMs` at the top level, reports the expected 12-character release prefix and database connectivity, and classifies both critical pipelines as healthy.
- Confirm `/tracker`, `/funds`, `/portfolio`, `/news`, `/dashboard`, `/search`, `/earnings`, and `/login` load under `/Infra-MA2`.
- Confirm `/` resolves permanently to `/tracker` and anonymous export remains 403.
- Sign in as an administrator, inspect the audit log, traverse a multi-page 25-row administrative list with back/forward navigation, preview (but do not commit) a small import, and verify a permitted analyst/admin export.
- Open uncached deal, fund, and company drawers and confirm the loading shell commits before delayed detail data; review the payload-free browser measurement against the 100 ms regression budget without treating one smoke result as p75 evidence.
- Check Vercel route errors, database latency, provider latency, and Core Web Vitals for regressions.
- Resume publication/imports and attach the 90-day release evidence to the release record.

After the bootstrap/security release, rotate the production administrator credential and `NEXTAUTH_SECRET`; sign in again after rotation. Record only completion time and operator, never values.

## Application rollback

Use rollback when the application regresses and the prior application is compatible with the additive schema.

1. Stop imports/publication and capture the incident start time, current SHA, and failing request IDs.
2. Select the prior verified Vercel deployment recorded in the release record.
3. Run **Roll Back Production** with the recorded deployment ID or immutable URL, its full Git SHA, and confirmation `ROLLBACK`. The workflow proves the target SHA is an ancestor of the current protected `main` head and has a successful exact-SHA GitHub Actions `build` check, verifies the immutable Vercel repository and SHA identity, then rolls back by deployment ID. Use `full` smoke policy normally. `public-only` is a documented break-glass option only for a previously gated legacy target without `/api/health` or the canonical root redirect; it does not bypass ancestry or build provenance.
4. Verify canonical routes, login, audit log, and authorization manually.
5. Do not reverse additive migrations. Fix forward in a new pull request.

If the rollback workflow is unavailable, an authorized Operations owner may run the same checked-in, team-scoped API client from a clean protected-main checkout:

```bash
VERCEL_TOKEN=<authorized-token> \
node --experimental-strip-types scripts/mutate-vercel-production.ts \
  --operation=rollback \
  --deployment-id=<known-good-deployment-id> \
  --project-id=<verified-project-id> \
  --team-id=<verified-team-id> \
  --production-url=https://infra-ma-2.vercel.app \
  --output=tmp/manual-rollback.json
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
