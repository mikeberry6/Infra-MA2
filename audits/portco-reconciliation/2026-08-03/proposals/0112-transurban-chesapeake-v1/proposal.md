# PortCo proposal — Transurban Chesapeake

- Task: 112 (ledger:0112:transurban-chesapeake:f0caf605)
- As of: 2026-08-18
- Actions: CORRECT_COMPANY, MERGE_COMPANIES
- Proposal SHA-256: 4e3e25913c076724c60bfd127c51b360c5a49d4723f3b6d5a01614290098680a
- Production snapshot SHA-256: 94288b28a97f61207090ddb57fad077ea46f325733f5f15e93a90686f734f27c
- Current company snapshot SHA-256: 9a2a05a0dda86e1a91a729f5c2fdc2b738d9948423acd841bc0f4be51b91790e
- After-image SHA-256: 93c2c1e23c9e785cfa65e848183bf1f841d4259ce99c0036c55bfce414123423

## Recommendation

Transurban Chesapeake and Chesapeake toll road network are duplicate records for the same Transurban Chesapeake LLC manager-level concession platform. Direct Transurban, AustralianSuper and CPP Investments evidence establishes a current cap table of Transurban 50%, AustralianSuper 25%, CPP Investments 15% and UniSuper 10%. This proposal preserves the existing AustralianSuper and CPP ownership-period identities, moves the AustralianSuper period onto the canonical company through the reviewed production merge, corrects both disclosed stakes, replaces the unsupported 2020 founding year and geographic headquarters with unavailable values, and records Northern Virginia as the operating footprint in the description. The 495, 95 and 395 Express Lanes, FredEx and 495 NEXT remain components rather than separate PortCos. No platform sale, secondary transfer or signed pending exit was found through August 18, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| AustralianSuper | AustralianSuper Infrastructure Portfolio | — | 25% | 2021 | — | CLOSED_ACTIVE |
| CPP Investments | — | Real Assets (Infrastructure) | 15% | 2021 | — | CLOSED_ACTIVE |

## Source holdings

- 018-australian-super:holding:003:transurban-chesapeake
- 032-cpp-investments:holding:018:transurban-chesapeake

## Retired company records

- cmrxpj7kc00kyivhewp6psi4d

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpkqfv02tyivhea6amsc1n | cmrxpldhb03luivheapdz2z4s | Both rows record the December 2020 Chesapeake partner-sale announcements; the canonical milestone preserves the separate CPP Investments and AustralianSuper announcement dates and stakes. |
| MILESTONE | cmrxpkqgf02tzivhe824zz489 | cmrxpldhv03lvivhemokuvy7r | Both rows record the March 31, 2021 legal close of the same 50% Chesapeake partner sale; retain one canonical close milestone and distinguish its April 1 reporting effective date. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [AustralianSuper ownership announcement and disclosed stake](https://www.australiansuper.com/-/media/australian-super/files/about-us/media-releases/australiansuper-acquisition-of-stake-in-chesapeake-toll-roads.pdf) — AustralianSuper announced its agreement to acquire a 25% interest on December 17, 2020, the announcement identified CPP Investments at 15%, UniSuper at 10% and Transurban at 50%
- [Current AustralianSuper portfolio evidence and duplicate-name resolution](https://www.australiansuper.com/global-investors/who-we-are/north-america) — AustralianSuper continued to list the Chesapeake toll road network as a 25% North American holding at December 31, 2025, Chesapeake toll road network is an alias for the same Greater Washington platform
- [CPP Investments ownership announcement and infrastructure-strategy basis](https://www.cppinvestments.com/wp-content/uploads/2020/12/cpp-investments-transurban-chesapeake-december-16-2020-v2.pdf) — CPP Investments announced a 15% interest on December 16, 2020, CPP Investments made the investment through its infrastructure mandate, the investment covered the 495, 95 and 395 Express Lanes platform
- [Official operating website, services model and 395 Express Lanes history](https://www.expresslanes.com/about) — the 395 Express Lanes opened in 2019, the official operating site describes the Transurban and VDOT express-lanes model
- [Legal identity, partner-sale closing date and original ownership structure](https://www.transurban.com/content/dam/investor-centre/01/FY21-ResultsPresentation.pdf) — the 50% partner sale closed on March 31, 2021 and became effective for reporting on April 1, 2021, the legal platform name is Transurban Chesapeake LLC, the post-close cap table was Transurban 50%, AustralianSuper 25%, CPP Investments 15% and UniSuper 10%
- [Subsequent financing and exit check](https://www.transurban.com/content/dam/investor-centre/01/FY25-ResultsPresentation.pdf) — the March 2025 Chesapeake bank debt facility was financing rather than an equity transfer, the reported platform boundary and cap table remained unchanged
- [Current cap table, canonical platform boundary, operating scale and concession terms](https://www.transurban.com/content/dam/investor-centre/01/FY26-ResultsPresentation.pdf) — AustralianSuper owns 25% and CPP Investments owns 15% of Transurban Chesapeake at June 30, 2026, Transurban Chesapeake owns the entities operating the 495, 95 and 395 Express Lanes, including the Fredericksburg Extension, the 495 concession covers 26.5 kilometres and the 95/395/FredEx concession covers 79 kilometres, both through December 2087
- [Fredericksburg Extension opening](https://www.vdot.virginia.gov/news-events/news/statewide/governor-glenn-youngkin-celebrates-opening-of-95-express-lanes-fredericksburg-extension.php) — the 10-mile 95 Express Lanes Fredericksburg Extension opened to mainline traffic on August 17, 2023

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
