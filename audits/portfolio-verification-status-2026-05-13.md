# Portfolio Verification Status - 2026-05-13

## Objective

Confirm the investment dates and ownership details for every portfolio company in the portfolio-company seed database.

## Data Reviewed

- Company seed data: `prisma/seed-data/companies.ts`.
- Fund seed data: `prisma/seed-data/funds.ts`.
- Investment-year audit output: `audits/portfolio-investment-years/master.csv`.
- Current-owner fund audit output: `audits/portfolio-current-owner-fund-verification-2026-05-13.csv`.
- Supplemental active-owner source file: `portfolio_companies_active_web.json`.

## Current Verification Coverage

| Area | Result |
| --- | ---: |
| Portfolio company records | 1,169 |
| Investment-year owner-company rows audited | 1,325 |
| Active current-owner rows audited | 1,318 |
| Active current-owner rows with evidence URLs | 1,318 |
| Structural validation errors | 0 |

## Investment-Date Result

The investment-year audit ran successfully on 2026-05-13T21:10:24.896Z and produced 1,325 owner-company rows.

| Priority | Rows |
| --- | ---: |
| Critical | 0 |
| High | 2 |
| Medium | 6 |
| Low | 7 |
| None | 1,310 |

No critical missing-year rows remain.

The two high-priority rows are both DigitalBridge / Vantage Data Centers caveats. They reflect distinct current Vantage exposures recorded under the same consolidated scorecard: the 2017 core platform acquisition, the 2020 Vantage SDC stabilized-asset transaction, and the 2024 equity round led by DigitalBridge and Silver Lake. They are documented multi-entry ownership situations rather than missing-date defects.

## Current-Ownership Result

The current-owner fund audit ran successfully on 2026-05-13 and produced 1,318 active owner rows.

| Result status | Rows |
| --- | ---: |
| Verified fund | 239 |
| Verified fund - missing from funds list | 353 |
| Disclosed but generic | 137 |
| n.a. | 589 |
| Needs user review | 0 |

All active current-owner rows have evidence URLs and classify into verified fund, verified fund missing from the local funds list, disclosed generic vehicle, or `n.a.`. No active current-owner rows require manual review.

## Latest Seed Corrections

- Added investment-year evidence for the remaining missing rows: Sunrise Renewables, Sunstone Power, Trenton Biogas, EnviraPAC Monticello, Palmetto, Ecosave, OnTrac, Chester County Hyperscale Data Center, Back Bay Solar, Rocky Mountain Midstream, Twin Parking Holdings, and Tower Investments I.
- Corrected Tract from unsupported Manulife ownership to Tract Capital Management, added 2022 platform-launch / financing evidence, and kept the ownership vehicle as `n.a.` because no distinct fund vehicle or ownership percentage is publicly disclosed.
- Removed T-Mobile from i3 Broadband active owners because the 50/50 JV with Wren House is still pending, with close expected in 2H 2026; the transaction remains as a pending milestone only.
- Tightened same-year investment milestone wording for Sempra / Mubadala, Vantage / GCM Grosvenor, and VEMO / Vision Ridge so the audit reflects the already-supported source trail.

## Validation

- `npm run audit:portfolio-years` passed and regenerated the investment-year audit outputs.
- `node --experimental-strip-types scripts/audit-current-owner-funds.ts` passed and regenerated the 2026-05-13 current-owner audit outputs.
- `npm run validate-portfolios` passed with 0 errors and 1,940 warnings.

## Completion Assessment

The seed database is audited for portfolio-company investment dates and current ownership details. There are no missing investment years, no active current-owner manual-review rows, and no structural validation errors.

Remaining follow-up work is data-model cleanup, not a blocker for the verification objective: 353 verified fund vehicles do not exactly match `prisma/seed-data/funds.ts`, 137 rows use generic disclosures, and the live Prisma investment-year sync still needs a duplicate-owner policy for Vantage Data Centers / DigitalBridge before it can be used safely.
