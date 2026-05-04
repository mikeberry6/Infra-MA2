# Portfolio Investment-Year Continuation State

Last updated: 2026-05-03 19:25 ET / 2026-05-03 23:25 UTC.

## Active Data Flow

- Active data source: `prisma/seed-data/companies.ts`.
- Portfolio page data path: `/portfolio` -> `src/app/portfolio/page.tsx` -> `getAllCompanies()` -> Prisma data seeded from `prisma/seed.ts`.
- Audit command: `npm run audit:portfolio-years`.
- Audit outputs: `audits/portfolio-investment-years/summary.md`, `flagged.csv`, `master.csv`, `findings.json`.

## Current Audit State

- Company records: 1,171.
- Owner-company rows: 1,312.
- Current flagged rows: 19.
- Latest audit output timestamp: 2026-05-03T23:25:14.326Z.

## Execution Rule

Continue owner-by-owner if future rows are added. Change `investmentYear` only where public disclosure clearly supports the current owner's original investment in the named business. Prefer close/completion/effective/financial-close year; use announcement/signing year only when no close date is available. If evidence is unclear, leave data unchanged and document unresolved.

## Completion Status

- `master.csv` has been reviewed through the final owner-company row: Wren House / SeaCube Container Leasing.
- There is no active resume point in the current `master.csv`.
- Batch 38 now documents the continuation from CIM Group through Wren House, including the final resumed span from Harrison Street at AlohaNAP through SeaCube.
- The final resumed pass after Oaktree / Duration covered OMERS / OTPP / QIA / QIC, Quinbrook, Ridgewood / Sandbrook, SDC / Searchlight, Stonepeak, Swiss Life / Tallvine / Temasek, Tiger / TPG, Ullico, and Vauban / Vision Ridge / Wren House.

## High-Conviction Corrections In Final Resumed Span

- GCT Global Container Terminals: corrected the IFM Investors owner row from 2019 to 2018 based on IFM's December 2018 initial fund investment disclosure.
- Rowan Bauxite: corrected the top-level and both Quinbrook owner rows from 2025 to 2022 based on Quinbrook's project page listing 2022 as the year acquired.
- No investment-year changes were made for the Oaktree / Duration, Ridgewood / Sandbrook, SDC / Searchlight, Stonepeak, Swiss Life / Tallvine / Temasek, Tiger / TPG, Ullico, or Vauban / Vision Ridge / Wren House clusters.
- Source labels, milestone categories, and close / investment evidence were tightened across the completed clusters; see `batch-38.md` for source-by-source notes.
- Remaining-flag judgement pass: retained Teays River / BCI at 2021 and SunZia / CDPQ at 2023 as reasonable caveated years; changed the weaker portfolio-status-only dates to N/A by removing `investmentYear`.

## Remaining Flagged Rows

- Astatine Investment Partners - Twin Parking Holdings - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- BCI - Teays River Investments - 2021 - low - `weak_same_year_attribution`; retained as a reasonable caveated year.
- CDPQ - SunZia Wind and Transmission - 2023 - medium - `firm_not_named_in_same_year_milestone`; retained as a reasonable caveated year.
- Copenhagen Infrastructure Partners - Sunrise Renewables - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- Copenhagen Infrastructure Partners - Sunstone Power - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- Equilibrium - Trenton Biogas - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- Generate Capital - EnviraPAC Monticello - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- Grain - Tower Investments I - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- Harrison Street - Chester County Hyperscale Data Center - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- I Squared Capital - Palmetto - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- Macquarie Asset Management - Supervia Poniente - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- Manulife - Back Bay Solar, LLC - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- Manulife - Rocky Mountain Midstream - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- Manulife - Tract - duplicate owner rows N/A - critical - `missing_investment_year`; searched and documented unresolved.
- Oaktree / Duration - OnTrac - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- Ridgewood - Ecosave - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- Swiss Life - Flamingo Crossings Village - N/A - critical - `missing_investment_year`; searched and documented unresolved.
- Vision Ridge - Homer - N/A - critical - `missing_investment_year`; searched and documented unresolved.

## Batch Status

- Batch 36 and Batch 37 document earlier resolved / unchanged clusters and carry-forward unresolved rows.
- Batch 38 is the active completion batch for CIM Group through Wren House and should remain the primary detailed source for this review cycle.
- Final audit result: 1,312 owner-company rows, 19 flagged rows, latest run `2026-05-03T23:25:14.326Z`.
- PortCo database propagation completed with `scripts/sync-portfolio-investment-years.ts`: 540 live Prisma `OwnershipPeriod.investmentYear` rows updated, post-apply sync dry-run showed 0 remaining differences, and `npm run db:verify` passed.

## New Thread Handoff

Recommended handoff if context pressure appears again: start a fresh chat in `/Users/mikeberry6/Infra-MA2` and say: "Continue the portfolio investment-year verification using `audits/portfolio-investment-years/continuation-state.md` as the source of progress. The current `master.csv` has been reviewed through the final row, Wren House / SeaCube Container Leasing. Latest audit run is `2026-05-03T23:25:14.326Z` with 1,312 owner-company rows and 19 remaining flagged rows. Teays River / BCI and SunZia / CDPQ retain caveated years; the other remaining names are N/A because public evidence does not prove a defensible owner-entry year. If new portfolio rows have been added, resume owner-by-owner from the new rows; otherwise re-open `flagged.csv` only if new clear public evidence appears. Patch only high-conviction evidence-backed changes in `prisma/seed-data/companies.ts`, rerun `npm run audit:portfolio-years` after each firm cluster or sub-cluster, and update `batch-38.md` plus this continuation file."
