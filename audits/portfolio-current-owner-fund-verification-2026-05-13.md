# Current Owner Fund Verification Audit - 2026-05-13

## Scope And Reconciliation

This audit reviews active/current ownership periods from `prisma/seed-data/companies.ts`. It does not edit seed data, Prisma schema, migrations, UI code, or live database records.

| Check | Count |
| --- | ---: |
| Portfolio companies in seed data | 1169 |
| Active owner records extracted | 1318 |
| CSV audit rows produced | 1318 |
| Unique current owners / investment firms | 107 |
| Companies with multiple active owners | 117 |
| Rows with at least one evidence URL | 1318 |
| Rows without evidence URL | 0 |

## Result Counts

| Result status | Rows |
| --- | --- |
| Verified fund | 239 |
| Verified fund - missing from funds list | 353 |
| Disclosed but generic | 137 |
| n.a. | 589 |
| Needs user review | 0 |

## Confidence Counts

| Confidence | Rows |
| --- | --- |
| High | 1169 |
| Medium | 149 |
| Low | 0 |

## Proposed Action Buckets

| Action bucket | Rows |
| --- | --- |
| No action | 928 |
| Review fund-list add/alias | 353 |
| Review generic disclosure | 28 |
| Review ownershipVehicle replacement | 9 |

## Needs User Review Concentration

| Investment firm | Rows |
| --- | --- |

## Method Notes

- The working set is one row per active `owners[]` entry, with top-level owner fields used only as a fallback.
- Evidence URLs are drawn from company seed sources plus the matched local supplemental web-reference file `portfolio_companies_active_web.json` when it contains a matching company/owner detail.
- `n.a.` is used only when the matched ownership detail or current field indicates that no distinct fund was publicly disclosed, or when the field is ownership prose rather than a named vehicle.
- `Verified fund - missing from funds list` means the audit found a named fund/vehicle result that does not currently match `prisma/seed-data/funds.ts`.
- `Needs user review` rows were intentionally kept separate instead of being converted to `n.a.` when the source trail, owner match, or current-owner status was not strong enough.

## Recommended Follow-Up Batches

1. No `Needs user review` rows remain in the current-owner audit.
2. Review `Verified fund - missing from funds list` rows for fund-list additions or aliases so strategy badges can appear where appropriate.
3. Review `Disclosed but generic` rows and decide whether generic account/client-pool language should remain visible or become `n.a.`.
