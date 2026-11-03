# Weekly briefing → Deal Database

This workflow imports curated published cards, never discovery candidates. Historical email files remain immutable. The frozen `weekly-briefing-canonical.json` preserves the existing seed universe and legacy IDs; adding an HTML issue no longer silently adds seed deals.

## Publication manifest

Run `npm run briefings:inventory` after finalizing an issue. Commit the resulting `audits/briefing-deals/archive.json` with the weekly HTML. Tests require it to match every published card, so later editorial changes require regeneration. New issue files should include `data-deal-id`, `data-announcement-date`, `data-region`, and `data-weekly-sector` / `data-weekly-count` attributes. Stable card IDs must survive reordering.

## Preview and individual review

Use Node 24 and npm 11. Run `npm run briefings:preview -- --env PATH --output tmp/briefing-deals/review.json` against the intended database. `--edition YYYY-MM-DD` scopes the review to one issue. `--transport http` supports read-only Neon snapshots when direct Postgres is unavailable; apply always uses a transactional Postgres connection and checks the snapshot again.

The proposal binds every card to its immutable archive content and database host/name. The companion report lists candidate IDs, their dates, sources and parties. A shared source URL is not sufficient evidence of transaction identity. All decisions start unapproved. A missing source, date, geography, category, status, or uncertain transaction identity requires research. Run `npm run briefings:sources` to capture primary-source metadata; metadata publication dates remain suggestions requiring verification of the actual announcement.

For every row set `approved: true`, `reviewer`, a substantive `evidence` note, `verifiedAnnouncementDate` (YYYY-MM-DD) and `verificationSourceUrl` only after user review. MATCH dates and sources must agree with the existing record; CREATE fields must agree with the verified evidence. Missing verification blocks publication. Choose:

- `MATCH`: set `canonicalId` to an existing published deal's legacy ID. Its richer fields remain untouched; conflicts requiring data edits must be resolved through the existing individual admin edit workflow and the preview regenerated.
- `CREATE`: set a stable canonical legacy ID and supply `data` following the existing deal import contract (title, target, buyer/seller, sector, subsector, region, category array, verified announcement date, overview, country, status and primary source). Preserve disclosed economics in their correct fields; prospective project scale is not enterprise value. Normalize fund names using the site's canonical aliases and update corporate exclusions when appropriate.
- `BLOCK`: unresolved. The entire selected issue cannot apply until every row is reviewed. Scope to another complete issue to proceed independently.

Repeated appearances use the same canonical ID. Use one `CREATE` payload consistently across appearances, or `MATCH` after that deal exists. Run `npm run briefings:validate -- --manifest FILE` to verify completeness and obtain the exact canonical manifest hash. Review the report, existing memberships, and proposed removals when replacing a corrected issue.

## Apply and release

The new migration creates only `BriefingIssue`, `BriefingDeal`, their foreign keys, and indexes. Validate it in an isolated database before requesting the protected production schema/data approval required by AGENTS.md. The application detects whether the additive tables exist and preserves the current deal view until they do. The protected apply job stages only this approved migration and records its checksum, without running unrelated pending migrations or cutovers. Do not run a full seed or the code-only promotion workflow.

Local apply requires `--target local` and localhost. Production apply requires the protected production job/approved operator environment, `EXPECTED_DATABASE_HOST`, `EXPECTED_DATABASE_NAME`, `FUND_REFRESH_REVALIDATE_TOKEN`, and the exact confirmation:

```
npm run briefings:apply -- --target production --confirmation APPLY-REVIEWED-BRIEFINGS --manifest FILE --expected-hash SHA256 --output RECEIPT
```

The existing internal revalidation endpoint invalidates all application data, including deals and counts. A preflight must pass before production writes. The transaction locks the importer, rejects stale snapshots, creates only reviewed new records, replaces memberships for reviewed issues, and stores the full approval manifest in `AuditEvent`. Identical manifests return their prior receipt; retry them to recover cache invalidation after a committed import. A changed manifest needs a fresh preview. The receipt is also written locally.

Release code through a scoped PR with the required build and Vercel automatic deployment. The application can deploy before the migration; issue choices appear after the protected schema and reviewed data apply. After the approved apply, verify per-issue membership counts and run `scripts/release-smoke.mjs` against the matching deployment. Test issue filtering on `/tracker?briefing=YYYY-MM-DD`, combined filters, exports as an authorized user, linked drawer dates, and `/weekly-briefing?edition=YYYY-MM-DD`.

## Current review status

The initial comparison is explicitly against the locally configured database, not the protected production target. On November 3, the owner explicitly approved all published briefings for production backfill and duplicate reconciliation; the approval is recorded in audits/briefing-deals/owner-approval-2026-11-03.json. Production matching must be refreshed using the production database before approval or apply. No production schema or records have been changed by this implementation. The `Reviewed Briefing Deal Import` workflow supports a read-only production preview on protected main, so production matching does not require downloading database credentials. Its apply job uses the protected production environment.
