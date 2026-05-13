# Portfolio Investment-Year Continuation State

Last updated: 2026-05-13 after rerunning the investment-year and current-owner fund audits.

## Active Data Flow

- Active seed data source: `prisma/seed-data/companies.ts`.
- Fund reference data: `prisma/seed-data/funds.ts`.
- Portfolio page data path: `/portfolio` -> `src/app/portfolio/page.tsx` -> `getAllCompanies()` -> Prisma data seeded from `prisma/seed.ts`.
- Investment-year audit command: `npm run audit:portfolio-years`.
- Current-owner fund audit command: `node --experimental-strip-types scripts/audit-current-owner-funds.ts`.
- Investment-year outputs: `audits/portfolio-investment-years/summary.md`, `flagged.csv`, `master.csv`, `findings.json`.
- Current-owner outputs: `audits/portfolio-current-owner-fund-verification-2026-05-13.md` and `.csv`.

## Current Audit State

- Company records: 1,169.
- Owner-company rows in investment-year audit: 1,325.
- Current investment-year flagged rows: 15.
- Latest investment-year audit timestamp: 2026-05-13T21:10:24.896Z.
- Active owner records in current-owner fund audit: 1,318.
- Current-owner rows with evidence URLs: 1,318.
- Current-owner rows requiring manual review: 0.

## Execution Rule

Continue owner-by-owner if future rows are added. Change `investmentYear` only where public disclosure clearly supports the current owner's original investment in the named business. Prefer close/completion/effective/financial-close year; use announcement/signing year only when no close date is available. If evidence is unclear, leave data unchanged and document unresolved.

For current ownership vehicles, only replace `ownershipVehicle` when the public source clearly identifies the exact fund, account, strategy, or ownership structure for the active owner. Use `n.a.` when no distinct vehicle is publicly disclosed. Keep generic owner descriptions separate from named fund vehicles.

## May 13 Seed Corrections

- GCT Global Container Terminals Inc.: added 2007 Ontario Teachers' evidence, reordered current owners so BCI aligns with the displayed top-level owner, and retained the public 37.5% Ontario Teachers' / 37.5% IFM / 25% BCI disclosure.
- Boralex Inc.: reordered current owners so Brookfield aligns with the displayed top-level owner for the 2026 take-private announcement.
- Vertical Bridge: corrected the KKR 2026 ownership vehicle to KKR's core infrastructure strategy and aligned the KKR milestone date to April 22, 2026.
- Pembina Gas Infrastructure Inc.: corrected the Apollo 2026 pending acquisition milestone to April 23, 2026 and clarified that Apollo-managed funds agreed to acquire KKR's 40% interest, expected to close by the end of Q2 2026.
- Puget Sound Energy: added PGGM's 2018 investment year, 10% stake evidence, source, and milestone detail.
- Extenet: added company, Stonepeak, Manulife, and rebrand sources to clear the missing-source condition.
- Cleaned milestone wording that caused false-positive owner attribution, including Puget Energy / Puget Sound Energy, Vigor Marine Group, Cleco Corporation, Cleco Corporate Holdings, Boralex, Vantage Data Centers, and duplicate GCT records.
- JVR Energy Park: aligned the top-level investment year to Acadia's 2025 preferred-equity financing.
- Aligned Data Centers: aligned the top-level investment year to Macquarie's 2018 initial investment and kept the AIP/MGX/GIP sale as pending until closing is confirmed.
- Supervia Poniente: set Macquarie's investment year to 2022 and normalized the vehicle to Macquarie Infrastructure Partners V based on public Macquarie transaction commentary.
- Flamingo Crossings Village: set Swiss Life's investment year to June 9, 2023 and added the disclosed Swiss Life GIO III Holding S.à r.l. vehicle.
- Homer: set Vision Ridge's investment year to 2011 based on the public Rockefeller Brothers Fund case study identifying Homer as a Vision Ridge portfolio company established by RRG.
- Sunrise Renewables: added 2022 investment-year support from Kentucky PSC corporate-control filings while keeping `ownershipVehicle: "n.a."` because the public platform-level fund vehicle is not disclosed.
- Sunstone Power: added 2023 investment-year support from public platform/founding and Strategic Energy backing evidence.
- Trenton Biogas: added 2020 investment-year support from Equilibrium's 2020 sustainability report identifying the Water-Waste-Energy partnership.
- EnviraPAC Monticello: added 2021 investment-year support from Generate-linked management and public company evidence.
- Palmetto: added 2022 investment-year support from the Series C financing announcement and I Squared portfolio evidence.
- Ecosave: added 2021 investment-year support from public Ridgewood acquisition / majority-ownership evidence.
- OnTrac: added 2021 investment-year support from Oaktree/LaserShip-OnTrac combination evidence.
- Chester County Hyperscale Data Center: added 2024 first-public Harrison Street / 1547 relationship evidence, with source caveats retained because project-level ownership terms are not fully disclosed.
- Back Bay Solar, LLC: added 2024 first-public Manulife portfolio evidence while noting that the original Manulife entry date is not publicly disclosed.
- Rocky Mountain Midstream: added 2020 investment-year support from Manulife / Equator Principles evidence.
- Twin Parking Holdings: added 2026 first-public Astatine current-portfolio evidence while noting that the acquisition date and ownership split are not public.
- Tower Investments I: added 2026 first-public Grain current-portfolio evidence.
- Tract: removed one duplicate identical Manulife owner row, replaced the unsupported Manulife owner with Tract Capital Management, added 2022 platform-launch / financing evidence, and kept `ownershipVehicle: "n.a."` because no distinct fund vehicle or ownership percentage is publicly disclosed.
- i3 Broadband: removed T-Mobile from the active owners list because the 50/50 JV with Wren House remains pending, with closing expected in 2H 2026; the pending transaction remains as a milestone only.
- Sempra Infrastructure, Vantage Data Centers, and VEMO: tightened milestone wording so the same-year investment evidence names the relevant owner or fund vehicle where the source trail already supported the row.

## Remaining Investment-Year Flags

The latest audit has 15 flagged rows: 0 critical missing-year rows, 2 high-priority caveat rows, 6 medium rows, and 7 low rows.

No critical missing-year rows remain.

High-priority caveat rows are not automatic data defects; they are multi-entry ownership situations that the heuristic intentionally surfaces:

- DigitalBridge - Vantage Data Centers, 2020 and 2024 rows: earlier 2017 DigitalBridge signal coexists with later platform and equity-round entries.

The medium rows are audit hygiene caveats: five active assets have future-dated operating/concession milestones after the static May 2026 audit date, and SunZia / CDPQ has an indirect same-year attribution caveat. The low rows are weak-attribution rows where public disclosure supports an owner/date but does not provide a cleaner transaction close statement.

## Current-Owner Fund Audit State

Latest current-owner result counts:

- Verified fund: 239.
- Verified fund - missing from funds list: 353.
- Disclosed but generic: 137.
- n.a.: 589.
- Needs user review: 0.

The current-owner audit no longer has any `Needs user review` rows. All active owner rows have evidence URLs and classify into verified fund, verified fund missing from the local funds list, disclosed generic vehicle, or `n.a.`.

The `Verified fund - missing from funds list` bucket means the active ownership vehicle was verified from public evidence but does not exactly match a `fundName` in `prisma/seed-data/funds.ts`. These are data-model follow-ups for fund-list additions or aliases, not necessarily portfolio-company errors.

## Completion Status

The May 3 completion state is stale. New or changed portfolio rows expanded the investment-year audit from 1,312 to 1,325 owner-company rows.

Current status is audited with documented evidence and caveats. There are no missing investment-year rows, no current-owner rows requiring manual review, and no structural validation errors in the portfolio seed data. Remaining flagged rows are documented audit caveats rather than unresolved missing-date or current-owner blockers.

## Next Recommended Work

1. Review the 353 `Verified fund - missing from funds list` rows and decide whether to add funds, add aliases, or intentionally leave strategy badges unavailable.
2. Review the 137 `Disclosed but generic` rows and decide whether generic account/client-pool language should remain visible or become `n.a.`.
3. If the T-Mobile / i3 Broadband transaction closes in 2H 2026, add T-Mobile back as an active owner with the close date and 50% JV stake evidence.
4. After any seed edits, rerun `npm run audit:portfolio-years`, `node --experimental-strip-types scripts/audit-current-owner-funds.ts`, and `npm run validate-portfolios`.
5. If live Prisma data needs to reflect seed `investmentYear` changes, run `scripts/sync-portfolio-investment-years.ts` with the configured `DATABASE_URL`; note that this sync only covers ownership-period years, not sources or milestones.

## Live DB Sync Note

The 2026-05-13 dry run of `npx tsx scripts/sync-portfolio-investment-years.ts` did not apply updates. It stopped on duplicate same-company/same-firm desired-year conflicts for Vantage Data Centers / DigitalBridge: 2017 vs 2020 vs 2024. Resolve the duplicate-owner sync policy before using that script to propagate seed years to live Prisma data.
