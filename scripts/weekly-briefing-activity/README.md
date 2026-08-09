# Weekly briefing activity audit

This workflow classifies weekly-briefing transactions as either direct fund
activity or portfolio-company activity without changing the production schema.
The version-controlled run for an edition lives at
`audits/weekly-briefing-activity/<edition>/`.

## Publication contract

The seed, archived email cards, production snapshot, and relevant Git history
are frozen and hashed before review. Every candidate receives a universe
disposition. Every included record must have a current first approval, and
only a verified risk exception receives an independent second approval.
Changing a reviewed party, acting entity, announcement date, source, ownership
fact, sector, region, transaction structure, or second-review risk changes the
reviewed-input hash and makes the approval stale.

No command writes by default. Add `--write` only after reviewing its dry-run
summary. Email rendering has the stricter `--write` gate: the manifest must be
approved, contain no unresolved included records, pass every reconciliation
check, and still match all frozen input hashes.

## Commands

From the repository root:

```sh
npm run weekly:activity:snapshot -- --edition 2026-08-07
npm run weekly:activity:snapshot -- --edition 2026-08-07 --write

npm run weekly:activity:reconcile -- --edition 2026-08-07
npm run weekly:activity:reconcile -- --edition 2026-08-07 --write

# Historical/reproducibility command. The committed August 7 audit has already
# been migrated; the source-state lock intentionally refuses a second run.
npm run weekly:activity:migrate-v2 -- --edition 2026-08-07 \
  --generated-at 2026-08-09T21:15:00Z
npm run weekly:activity:migrate-v2 -- --edition 2026-08-07 \
  --generated-at 2026-08-09T21:15:00Z --write

npm run weekly:activity:packets -- --edition 2026-08-07
npm run weekly:activity:packets -- --edition 2026-08-07 --write

# After a human completes one packet's .review.json file:
npm run weekly:activity:review -- --edition 2026-08-07 \
  --decision audits/weekly-briefing-activity/2026-08-07/reviews/first/first-001.review.json
npm run weekly:activity:review -- --edition 2026-08-07 \
  --decision audits/weekly-briefing-activity/2026-08-07/reviews/first/first-001.review.json --write

# Generate the independent queue only after all first reviews are current:
npm run weekly:activity:packets -- --edition 2026-08-07 --stage second

npm run weekly:activity:validate -- --edition 2026-08-07
npm run weekly:activity:approve -- --edition 2026-08-07 \
  --approval audits/weekly-briefing-activity/2026-08-07/publication-approval.json
npm run weekly:activity:render -- --edition 2026-08-07
npm run weekly:activity:render -- --edition 2026-08-07 --write

# Run only after Outlook copy/paste and send-to-self QA is recorded:
npm run weekly:activity:advance -- --edition 2026-08-07 \
  --qa audits/weekly-briefing-activity/2026-08-07/outlook-qa-approval.json
npm run weekly:activity:advance -- --edition 2026-08-07 \
  --qa audits/weekly-briefing-activity/2026-08-07/outlook-qa-approval.json --write
```

Snapshotting a live database is read-only. Supply `DATABASE_URL` (or load the
repository's normal local environment) when taking that snapshot. The frozen
production JSON is then used by reconciliation and CI; those later commands do
not require database access.

## Review rules

- A fund, advised vehicle, co-investment vehicle, or non-operating acquisition
  SPV acting as principal is `DIRECT_FUND`.
- An already-owned operating company or platform acting without a directly
  transacting fund vehicle is `PORTFOLIO_COMPANY`.
- Fund acquisitions, exits, secondaries, follow-on equity, fund-level JVs, and
  sponsor secondary IPO sales are direct.
- Later bolt-ons, asset sales, and JVs executed by an operating portfolio
  company are portfolio-company activity.
- A new platform formed with an inseparable seed acquisition is direct.
- A primary-only portfolio-company IPO or capital raise is portfolio-company
  activity unless the fund sells or invests.
- A mixed direct/portfolio transaction counts once as direct while retaining
  all side-level attributions.

Words such as `bolt-on`, `platform`, and `via` create review candidates. They do
not approve a classification, and the absence of those words never defaults a
record to direct. Likewise, labels such as JV, platform formation, IPO,
recapitalization, sale, or exit never create a second-review requirement by
themselves. Applied to common edge cases:

- A fund exit is Direct; an operating portfolio company's asset sale is
  Portfolio-company activity. The word `sale` alone proves neither.
- Fund-level JVs, recaps, and secondary IPO sales are Direct. Operating-company
  JVs, recaps, and primary-only raises are Portfolio-company activity when the
  fund itself neither sells nor invests.

Second review is required only for a structured, evidence-backed exception:

- conflicting non-actor transaction facts;
- conflicting legal-actor attribution;
- uncertain ownership timing;
- actual simultaneous fund-vehicle and operating-company participation; or
- one announcement containing legally distinct bundled transactions.

Conflict and ownership-timing exceptions require two distinct, individually
qualified sources; duplicate entries for one URL do not count twice. Every
principal actor must cite qualified transaction-and-party evidence. The second
reviewer must be different from the first reviewer and must reopen the evidence.

One named human may approve a 20–25-record first-review packet as an
evidence-backed batch only after opening every record's evidence. Each decision
still carries its own reviewed record, immutable input hash, and substantive
record-specific note; omissions, duplicate decisions, stale hashes, and empty
notes fail closed. The second-review count remains provisional until first
review is complete and contains only verified exceptions.

Each packet decision identifies its immutable `baseRecordId` and contains an
`outputs` array. Keep one identity-preserving output for ordinary records. If a
first reviewer verifies that one bundled announcement contains multiple
legally distinct transactions, replace that output with one record per legal
transaction using unique `splitSuffix` values. Every split remains bound to the
original legacy ID, retains the bundled-announcement flag, and requires an
independent second review. Second review can never add, remove, or rename split
records.

The V2 policy is itself a hashed frozen input. The guarded August 7 migration
accepts only the known untouched V1 manifest, empty approval state, pristine 17
review templates, exact frozen universe hashes, unchanged July 31 email, and
the approved-edition index that still ends at July 31. It preserves the
original non-chart baseline and records PR #419 in a self-hashed amendment that
proves the chart block stayed byte-identical. It never changes either public
email or advances the approved-edition index.

The migrated candidate records retain their original August 8 candidate and
source-retrieval timestamps. `candidate-v2` identifies the normalized V2
record shape and risk model; the manifest's August 9 timestamp records when the
policy migration itself was applied.

## Weekly cutover

The approved-edition index controls the default `/weekly-briefing` redirect.
An HTML file alone cannot advance that route. For a new issue, curate scope,
acting entity, and evidence during the weekly process; unresolved records block
chart rendering and index advancement.

The renderer changes only the delimited YTD chart block. It verifies the hash
of all non-chart email content first, keeps total bar magnitude relative to the
leading row, and uses Outlook-compatible nested presentation tables for the
purple direct and gold portfolio segments.

Rendering and route advancement are intentionally separate. This leaves room
for the required Outlook desktop copy/paste and send-to-self check after the
exact chart HTML is written but before the Weekly Briefing button advances.

After rendering, copy `outlook-qa-approval.template.json` to
`outlook-qa-approval.json` in the same audit directory. Bind it to the exact
edition, approved `manifestSha256`, full rendered-email SHA-256, and protected
non-chart SHA-256 emitted by the render dry run. A named human reviewer must set
every attestation to `true` only after checking 320px, 375px, 600px, and desktop
rendering, Outlook desktop copy/paste, and an Outlook desktop send-to-self test.
Placeholder and automated/AI reviewer identities are rejected.

`advance` requires that exact file through `--qa`. It re-renders the charts
from the approved manifest and requires the current email bytes to equal the
deterministic output before it validates QA. The approved-edition index records
the QA artifact path and file hash, and route dependency validation repeats the
manifest render comparison and QA provenance checks. Editing the email,
manifest, non-chart copy, or QA artifact after approval therefore fails closed.
