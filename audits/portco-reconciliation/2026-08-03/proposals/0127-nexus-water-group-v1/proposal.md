# PortCo proposal — Nexus Water Group

- Task: 127 (ledger:0127:nexus-water-group:287d18eb)
- As of: 2026-08-23
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: 31d24e373962ed55b43dd57a226cdaae9d90a488ccb16d790fed82a7f42b0956
- Production snapshot SHA-256: 9cf674ebe0b65d5af92120bc16e00ba1058dbc7ecb120e127795fe387085b414
- Current company snapshot SHA-256: 3aa3d93a11ebc140f6e12f97104e0acef18386fe1602bd24ff4cbb5c8e50ea0c
- After-image SHA-256: cbf84decfa0ab31709362b5afd3af545333c2bb120e58153c2e2410e5591efe8

## Recommendation

Correct the existing record to the legal name Nexus Water Group, Inc. and preserve it as the single regulated water and wastewater platform. The verified 50% BCI / 50% SWMAC structure and SWMAC's 75% IIF / 25% Bazos split produce current indirect interests of 50.0% for BCI, 37.5% for J.P. Morgan Asset Management's IIF and 12.5% for the MEAG-managed Munich Re vehicle. The 2026 dispositions are subsidiary asset sales and do not change platform ownership.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| BCI | Infrastructure & Renewable Resources | Corix Infrastructure Inc. affiliate holdings | 50.0% | 2024 | — | CLOSED_ACTIVE |
| J.P. Morgan Asset Management | Infrastructure Investments Fund (IIF) | IIF Subway Investment LP / SWMAC Holdco | 37.5% indirect | 2024 | — | CLOSED_ACTIVE |
| MEAG | — | Bazos CIV, L.P. / SWMAC Holdco (Munich Re capital managed by MEAG) | 12.5% indirect | 2024 | — | CLOSED_ACTIVE |

## Source holdings

- 021-bci:holding:006:nexus-water-group
- 062-j-p-morgan-asset-management:holding:005:nexus-water-group
- 066-meag:holding:005:nexus-water-group

## Retired company records

- None

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| — | — | — | None |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Regulatory ownership structure](https://docs.cpuc.ca.gov/PublishedDocs/Efile/G000/M498/K678/498678388.PDF) — BCI-side and SWMAC-side interests each equal 50%, IIF and Bazos hold 75% and 25% of the SWMAC side
- [IIF and MEAG-managed ownership chain](https://tpucdockets.tn.gov/archive/filings/2022/2200114c.pdf) — Bazos is indirectly owned by Munich Re and managed by MEAG, J.P. Morgan's IIF vehicle and Bazos are the two SWMAC owners
- [Current BCI ownership](https://www.bci.ca/wp-content/uploads/2026/07/BCI-IRR-Program-FS-2025.pdf) — BCI held 50.0% of Nexus Water Group at December 31, 2025, The investment remains within BCI's Infrastructure & Renewable Resources program

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
