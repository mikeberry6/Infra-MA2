# Phase 2 Data Trust Release Runbook

## Release contract

Phase 2 is an additive, schema-first release layered on the completed Phase 1 baseline. It introduces operational run history, authenticated mutation auditing, canonical company redirects, reviewed source/disclosure fields, publication gates, bounded dashboard/news automation, and weekly-email validation.

It adds exactly these migrations after `20260722220000_auth_throttle`:

1. `20260722221000_data_trust_foundations`
2. `20260722222000_primary_citations`
3. `20260722223000_deal_seller_disclosure`
4. `20260722224000_fund_primary_source`

No migration deletes or renames a table, column, enum member, index, or constraint. Application rollback leaves all additive fields and tables in place.

This release does not authorize Research decisions. Generated reports and templates are evidence or proposals only; they never constitute citation selection, seller treatment, Fund-source designation, ownership correction, weekly publication, or canonical-merge approval.

## Required configuration

Create a fresh Phase 2-only Neon validation branch from the Phase 1 schema. Configure these at repository or organization scope because the pull-request gate does not attach the `production` environment:

- secret `PHASE2_MIGRATION_DATABASE_URL`;
- variables `PHASE2_MIGRATION_DATABASE_HOST` and `PHASE2_MIGRATION_DATABASE_NAME`;
- variables `PRODUCTION_DATABASE_HOST` and `PRODUCTION_MIGRATION_DATABASE_HOST` as forbidden validation targets.

Do not reuse the Phase 1-only branch or a later-phase integration branch.

Configure these secrets for the workflows that target production:

| Secret | Required scope | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Repository or organization | Pooled production connection used by scheduled pipelines, verification, and promotion. Scheduled jobs do not attach the `production` environment. |
| `PRODUCTION_MIGRATION_DATABASE_URL` | `production` environment | Direct production connection used only by schema staging and protected remediation. |
| `FRED_API_KEY`, `EIA_API_KEY`, `SAM_API_KEY` | Repository or organization | Official dashboard-provider credentials used by scheduled pipelines. |
| `SEC_USER_AGENT` | Repository or organization | Monitored application/contact identity required by scheduled SEC requests. |
| `VERCEL_TOKEN` | `production` environment | Token limited to the InfraSight Vercel team/project. |

Configure these repository or protected-environment variables:

| Variable | Required scope | Purpose |
| --- | --- | --- |
| `PRODUCTION_DATABASE_HOST`, `PRODUCTION_MIGRATION_DATABASE_HOST`, `PRODUCTION_DATABASE_NAME` | Repository or organization | Exact pooled/direct production target identities. Production jobs also forbid the Phase 2 validation host and the opposite production endpoint. |
| `DASHBOARD_WRITES_ENABLED` | Repository or organization | Keep `false` throughout schema staging and any dashboard cutover; set `true` only after the all-source audit is reviewed. |
| `PHASE2_PIPELINES_ENABLED` | Repository or organization | Global fail-closed gate for every hosted Phase 2 pipeline. Set `false` before merging Phase 2, keep it false through schema staging, and set `true` only after the additive schema and pipeline configuration are verified. |
| `SEC_WATCHLIST_CIKS` | Repository or organization | Optional comma-separated SEC watchlist consumed by the dashboard pipeline. |
| `VERCEL_PROJECT_ID`, `VERCEL_SCOPE`, `VERCEL_TEAM_ID` | `production` environment | Immutable Vercel project and team identity used for deployment inspection, smoke testing, promotion, and rollback. |
| `PRODUCTION_URL` | `production` environment | Canonical origin only: `https://infra-ma-2.vercel.app`. Do not include `/Infra-MA2`, a trailing path, query, or fragment. |

The public application URL is `https://infra-ma-2.vercel.app/Infra-MA2`; it is the canonical origin plus the retained base path and is not the value stored in `PRODUCTION_URL`. GitHub supplies `github.token` and `github.repository_id` to the protected workflows; do not create a custom GitHub token or repository-ID variable for them.

Keep the GitHub `production` environment independently reviewed and prevent self-review where supported. Never place database URLs, provider credentials, or Vercel tokens in repository variables, workflow inputs, artifacts, or release records.

## One-time control-plane transition

Complete and record these checks before the Phase 2 pull request is treated as releasable:

1. Keep the required GitHub status context exactly `build`. It is the stable aggregate job in **Release Gate** and fails unless both `quality` and `validation` succeed. Do not rename or bypass it. If branch protection still contains the deleted `Dashboard Validation / Validate dashboard migration and application` context, remove that stale context; do not add the two child jobs as substitutes for the aggregate.
2. Verify the retired workstation scheduler is not loaded before enabling the hosted news schedule:

   ```sh
   launchctl print "gui/$(id -u)/com.mikeberry6.infra-ma2.news-scan"
   ```

   If it exists, an authorized operator must unload it with `launchctl bootout "gui/$(id -u)/com.mikeberry6.infra-ma2.news-scan"`, then repeat `launchctl print` and require a not-found result. A read-only check on the current operator workstation returned not found on 2026-07-22; repeat the check at cutover and on any other host that previously ran the scheduler. Record the host, operator, time, and result; deleting the plist from Git does not unload an already bootstrapped service.
3. Preflight the protected Vercel production-candidate path so it creates a production-target build without assigning the canonical domain, and prove that merging to `main` does not auto-promote the Git deployment. Prove the behavior with a disposable candidate before the release window. The candidate must be `READY`, have `target=production`, use the immutable `*.vercel.app` deployment hostname, and match the protected project, team, GitHub repository ID, and full Git SHA. A pull-request preview has `target=preview` and cannot satisfy this contract. If a push to `main` or candidate creation would automatically move `infra-ma-2.vercel.app`, stop: the schema-first promotion, 30-day observation, and rollback controls are not ready.

Candidate creation must use the protected **Build Production Candidate** workflow from the exact protected-main SHA. It performs the preflighted production-target deployment without domain assignment, binds Git metadata, verifies immutable project/team/repository/SHA identity, and smoke-tests the candidate without moving the canonical alias. If it cannot prove deployment identity or the alias moves, stop and correct the Vercel staged-deployment control. Do not build the candidate from a developer workstation. The separate **Promote Production Release** workflow re-verifies and promotes that immutable candidate.

## Pull-request gate

The Phase 2 Release Gate must run from a clean checkout and pass:

- Node 24/npm 11 locked installation;
- additive migration and dated-weekly-email immutability audits;
- Prisma generation and schema validation;
- lint, typecheck, unit/integration tests, offline reference-data validation, weekly-email validation, production audit, and production build;
- migration deploy, migration status, and zero schema drift on the Phase 2-only Neon branch;
- reviewer-neutral remediation reports; and
- strict publication/data-integrity verification.

The strict gate remains red until the data decisions below are reviewed and applied. Do not bypass, soften, or relabel that result as a successful release.

## Research decision cycle

1. Run the read-only `report` operation against validation and retain its artifacts.
2. Research reviews exact records and sources. Use the templates under `audits/` and the schema in `audits/approvals/README.md`; do not infer decisions from array order or report suggestions.
3. Commit one minimal `audits/approvals/*.json` file containing the exact precondition hashes, reviewer identity, and decision scope. Record its SHA-256.
4. Rerun the Release Gate for the new commit. Approval files are executable release inputs and must receive the same review as code.
5. Dispatch **Review or Remediate Release Data** against validation for one operation at a time, supplying the full protected-main SHA, committed approval path, SHA-256, reviewer, reason, and `REMEDIATE` confirmation.
6. Rerun read-only reports and `db:verify`. Resolve conflicts through a new approval commit; never edit around a failed precondition.

Required review areas are primary Deal/company citations, Fund primary sources, seller-disclosure treatment, ownership-to-Fund links, current weekly publication, and canonical company survivors/redirects. The guarded weekly synchronization may create or update drafts only; every resulting Deal must still pass individual admin review and publication, outside the bulk remediation workflow.

Canonical merge apply is deliberately non-destructive in Phase 2. It moves reviewed relations to the survivor and creates `CompanyRedirect`, but retains each retired `Company` row as a relationship-free compatibility tombstone. Phase 2 public queries and duplicate gates exclude redirected IDs, while the Phase 1 fallback still resolves those retained rows through its existing canonical-key grouping. Do not delete compatibility rows during this program; destructive cleanup requires a later, separately reviewed release after the Phase 1 rollback window has closed.

## Production sequence

1. Before merging, set both `PHASE2_PIPELINES_ENABLED=false` and `DASHBOARD_WRITES_ENABLED=false` and record their protected configuration. Merge only after Phase 1 is released and the Phase 2 PR targets protected `main`. A missing/false pipeline gate skips all Data Pipelines jobs, preventing newly merged Phase 2 code from touching the pre-Phase 2 production schema. Record the approved schema-stage SHA and copy the Phase 2 release-record template. The final promotion SHA is frozen after the reliability observation window below.
2. Record the currently serving application SHA, applied migration baseline, immutable Vercel deployment, validation Release Gate run, stable `build` check, scheduler-unload result, and staged-deployment preflight.
3. Set `DASHBOARD_WRITES_ENABLED=false`, wait for the shared `production-release` lock to clear, and create a fresh Neon restore branch immediately before writes.
4. Generate and independently review the additive migration manifest from the recorded production migration baseline to the schema-stage SHA. Confirm it contains only the four Phase 2 migrations and record the manifest SHA-256.
5. Dispatch **Stage Production Schema** from protected `main` with the exact release/application/migration SHAs, reviewed manifest hash, and `STAGE`. The prior application remains live while migrations are applied. Require migration status, checksum, and zero-drift evidence.
6. Dispatch the remediation workflow first in `report` mode against production. Compare the backlog with validation; no mutation occurs in report mode.
7. Apply each Research-approved production remediation except canonical company merges separately with its committed file and exact hash. Re-run the report after each operation. Keep the reviewed company-merge approval pending until the short pre-promotion maintenance window in step 13; the still-serving Phase 1 administration code does not enforce the Phase 2 merge-survivor lock. Never upload an uncommitted local approval or combine unrelated decisions.
8. Keep dashboard writes disabled through any reviewed methodology/signal cutover. Run the read-only all-source audit from protected `main` and inspect every provider, required metric, representative value, and source link.
9. Only after the additive schema is staged and all protected database/provider settings are verified, set `PHASE2_PIPELINES_ENABLED=true`. After the dashboard artifact passes, set `DASHBOARD_WRITES_ENABLED=true`, run one bounded dashboard synchronization and one bounded news scan, and verify `PipelineRun`, provider coverage, public freshness, and explicit empty/failure states.
10. Start a real 30-day observation window at the later of the first successful scheduled dashboard refresh and first successful scheduled news refresh after schema staging and cutover. Let the hosted schedules run normally for at least 30 continuous elapsed days; retries may share a `refreshWindow`, but synthetic rows, backdated runs, and one-time test executions do not satisfy this gate. Retain the scheduled run IDs and artifacts, weekly verification results, provider/source coverage, logical-window counts, failures, and retry disposition. The window must end with both pipelines operationally healthy, at least 95% successful logical scheduled windows, no unresolved freshness breach, and the production verifier passing `--require-full-window` for each pipeline.
11. After the observation window passes, freeze the final protected-`main` promotion SHA and rerun the complete Release Gate. If `main` changed after schema staging, record every intervening SHA. Regenerate the migration manifest and repeat schema staging for any additional additive migration; any destructive migration or incompatible application change requires a new release plan. The final SHA must remain the exact protected `main` head through candidate promotion.
12. Dispatch **Build Production Candidate** from protected `main` with the exact frozen SHA, the recorded currently serving application SHA, and `BUILD_CANDIDATE`. Require its immutable inspection and smoke artifacts plus matching before/after canonical-alias evidence proving the domain did not move. Run the remaining non-company candidate checks before entering the maintenance window.
13. Begin a short, explicitly announced company-administration freeze: no company edits, imports, ownership changes, publication, archival, or verification may run until promotion or rollback completes. Apply the exact reviewed canonical company-merge approval, then rerun the company report, `db:verify`, source coverage, search/news canonical-count checks, and representative old-ID deep links against both the still-serving Phase 1 application and the candidate. Require retained compatibility rows, redirects, and the Phase 2 survivor lock. If any check fails, stop, preserve the Phase 1 application, and resolve the data issue through a new approval; do not promote.
14. Complete the candidate smoke test under `/Infra-MA2`, including public database, dashboard, news, search, login, admin review/audit, import authorization, export roles, canonical survivor IDs, and retired deep links. Dispatch **Promote Production Release** with the immutable candidate and exact frozen SHA. The workflow must independently recheck schema, strict publication gates, both complete 30-day pipeline contracts, project/repository identity, and protected-main provenance before promotion.
15. Repeat smoke tests on the canonical URL, end the company-administration freeze, and retain schema, remediation, 30-day pipeline, promotion, and smoke evidence in the release record.

## Rollback and recovery

Application rollback reassigns the verified prior Vercel deployment; it does not remove additive Phase 2 schema. Use only the protected rollback workflow and a recorded immutable deployment/SHA. Retained company compatibility rows are part of this rollback contract and must remain in place for the entire Phase 1 rollback horizon.

Dashboard cutover rollback is permitted only through an explicit supported rollback operation, the same committed manifest, and exact post-apply row preconditions while writes remain disabled. Citation, Fund-source, seller, ownership, weekly-publication, and canonical-merge corrections are forward-only reviewed data changes: correct an error with a new Research-approved, hash-bound change instead of improvised SQL.

For a schema or data-integrity incident:

1. disable dashboard writes and stop new promotions;
2. preserve application, migration, remediation, and pipeline artifacts;
3. roll the application back if the prior build remains schema-compatible;
4. use the recorded Neon restore branch only under the recovery owner and independent reviewer; and
5. create an incident record with affected records, exact SHAs, recovery time, and follow-up controls.

Never run destructive rollback SQL from GitHub Actions.

## Phase 1 compatibility sunset

Retired company rows and the shared release lock are release controls, not ordinary cleanup debt. Keep the relationship-free compatibility rows, their `CompanyRedirect` records, the `retiredId` foreign-key restriction, the prior Phase 1 deployment, and the `production-release` concurrency group intact while Phase 1 remains an approved rollback target.

Sunset requires a separate reviewed release after the rollback horizon closes. That release must record the owner and closure date, prove a Phase 2-or-later rollback candidate and recovery exercise, confirm no approved rollback uses Phase 1 query semantics, and inventory every retained retired ID and redirect. The reviewed transition must proceed in this order:

1. ship and verify the Phase 2-or-later application changes that remove the temporary merge-survivor administration lock without making retired IDs public or mutable;
2. take a fresh backup, then apply a new migration that removes the temporary `CompanyRedirect.retiredId` foreign key while preserving the scalar `retiredId -> companyId` redirect mapping;
3. delete only the enumerated relationship-free tombstone rows in a hash-bound, audited data operation;
4. verify every retired deep link still resolves to the canonical survivor, public/search/news counts remain canonical, and the rollback candidate passes; and
5. close the compatibility lock only after the evidence and recovery exercise are retained.

Do not delete a compatibility row with ad hoc SQL or weaken the current migration in place. The shared release concurrency lock may be changed only in the same separately reviewed operational transition after all replacement workflows prove equivalent serialization.

## Phase exit evidence

Phase 2 exits only when the isolated gate is green, every published Deal has a primary citation, no duplicate canonical cluster is public, every admin mutation creates an audit record, public dashboard/news provenance is meaningful, and scheduled pipelines sustain at least 95% successful runs over a real rolling 30-day window. A one-time test cannot satisfy the elapsed reliability criterion.
