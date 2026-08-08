# PortCo proposal — Southern Power solar portfolio

- Task: 44 (ledger:0044:southern-power-solar-portfolio:e23910f6)
- As of: 2026-08-08
- Actions: CORRECT_COMPANY, MERGE_COMPANIES
- Proposal SHA-256: bc042d302e608c3296c81f2aca0233599dc7039fc22b20ec6d965cb6a81b88de
- Production snapshot SHA-256: 31958468b2e3529655faa7775cb6fa2ea52f47b76bee0a786a527ddf3d3a3f9a
- Current company snapshot SHA-256: e3214528feec9acef2d8960c2749b8106dd9b2c0371b4963a3b70dab26232f8b
- After-image SHA-256: 066d5e2255320a822df9e2d92279357732c40c1f7e7519ced44eb72026ba64e6

## Recommendation

Correct the canonical holding to SP Solar Holdings I, LP, the Delaware limited partnership identified in Southern Power's SEC filings, and retain Southern Power solar and storage portfolio as a public-facing alias. APG did not acquire Southern Power Company; it acquired the 33% passive limited-partner interest in SP Solar from Global Atlantic in November 2023 through Scarlet Renewables LLC. Southern Power remains the 67% majority owner, general partner through wholly owned subsidiaries, and operating controller. APG Asset Management US's March 25, 2026 Form ADV continues to list Scarlet Renewables LLC as an APG-managed infrastructure private fund, and Southern Company's June 30, 2026 filing continues to report the same 67%/33% partnership economics. No APG exit, transfer, or pending sale was found through August 8, 2026. Retire the separate Southern Power repository row because it is an erroneous APG-attributed parent-level PortCo record, not because Southern Power Company and SP Solar are the same legal entity. The resulting technical redirect preserves old repository links only; Southern Power is deliberately excluded from the canonical alias list. Preserve the two unique parent-context milestones, explicitly consolidate the duplicate ownership and milestone rows, retain legacy historical facts, add direct current ownership and identity evidence, and remove duplicate or irrelevant citations. The November 14, 2023 date is the completed-sale disclosure date; no separate legal closing date is inferred in this phase-one schema.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| APG Asset Management | — | Scarlet Renewables LLC | 33% | 2023 | — | CLOSED_ACTIVE |

## Source holdings

- 009-apg-infrastructure:holding:015:southern-power-solar-portfolio

## Retired company records

- cmrxpj5jp00hvivheqg0t2csf

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpkhzr02jwivhep50d550s | cmrxpki5c02k1ivhe1jvll98v | Both rows record Southern Power's May 2018 agreement to sell the 33% portfolio interest to Global Atlantic. |
| MILESTONE | cmrxpki2o02jxivhejy1kt9xj | cmrxpki5v02k2ivhe5h69pepy | Both rows record Southern Power's 2021 battery-storage additions at portfolio solar facilities. |
| MILESTONE | cmrxpki3o02jzivhel4gpiaqw | cmrxpki6w02k4ivhe1ti0wh62 | Both rows record APG's November 2023 acquisition of Global Atlantic's minority portfolio interest. |
| OWNERSHIP_PERIOD | cmrxpjqkm01enivhepveg9jir | cmrxpjql301eoivhe386yx8e4 | Both rows represent APG's November 2023 acquisition of the same 33% limited-partner interest; retain the portfolio-bound period and correct its stake and Scarlet Renewables vehicle. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [APG's primary announcement that it acquired the 33% minority interest from Global Atlantic while Southern Power remained majority owner and operator.](https://assetmanagement.apg.nl/publications/apg-boosts-commitment-to-energy-transition-with-major-us-solar-investment/) — CURRENT_OWNERSHIP, INFRASTRUCTURE_STRATEGY, INVESTMENT_DATE, STAKE
- [APG Asset Management US's March 25, 2026 Form ADV identifying Scarlet Renewables LLC as an APG-managed infrastructure private fund.](https://reports.adviserinfo.sec.gov/reports/ADV/160795/PDF/160795.pdf) — CURRENT_OWNERSHIP, EXIT_SEARCH, VEHICLE
- [Seller announcement confirming the completed transfer to APG and the November 14, 2023 completion-disclosure date.](https://www.businesswire.com/news/home/20231114814709/en/Global-Atlantic-Sells-Stake-in-26-Solar-Facilities-to-APG) — CURRENT_OWNERSHIP, INVESTMENT_DATE, SELLER, TRANSACTION_STATE
- [Southern Power's SEC filing establishing the exact SP Solar Holdings I, LP legal identity, Scarlet Renewables LLC buyer vehicle, original 33% sale, and Southern Power's retained 67% control.](https://www.sec.gov/Archives/edgar/data/1160661/000116066118000004/spcjuno8-k52018.htm) — IDENTITY, OWNERSHIP_HISTORY, PLATFORM_BOUNDARY, STAKE, VEHICLE
- [Southern Company's latest available quarterly filing confirming SP Solar's continuing operations, Southern Power's 67% interest, the limited partner's 33% economics, and Southern Power's control through June 30, 2026.](https://www.sec.gov/Archives/edgar/data/92122/000009212226000054/so-20260630.htm) — CURRENT_OWNERSHIP, CURRENT_STATUS, EXIT_SEARCH, IDENTITY, STAKE
- [Southern Power's primary description of the original 26-facility partnership transaction and its general-partner operating role.](https://www.southerncompany.com/newsroom/financials/southern-power-to-sell-minority-interest-in-solar.html) — OPERATIONS_ASSETS, OWNERSHIP_HISTORY, PLATFORM_BOUNDARY
- [Southern Power fact sheet supporting the retained September 2023 Millers Branch parent-context milestone.](https://www.southernpowercompany.com/content/dam/southernpower/pdfs/fact-sheets/MillersBranch2_Solar_Facility_factsheet_FINAL2.pdf) — MILESTONE_EVENT, OPERATIONS_ASSETS
- [Current Southern Power operating page describing its solar fleet, current operating geography, and third-party co-ownership footprint.](https://www.southernpowercompany.com/our-projects/solar.html) — CURRENT_STATUS, GEOGRAPHY, OPERATIONS_ASSETS

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
