# PortCo proposal — Transportation Equipment Network

- Task: 298 (ledger:0298:transportation-equipment-network:8eb51003)
- As of: 2026-09-01
- Actions: CORRECT_COMPANY, ADD_OWNER, MERGE_COMPANIES
- Proposal SHA-256: 20a66677d8ee544dd1ad0284920d73f31e5d44dfdc9e85cfb723b366ff72f446
- Production snapshot SHA-256: 49ba42eb90fb8fa84aae5c79d031517b843e3c9958e2e92509da7c6cf79e58d5
- Current company snapshot SHA-256: ccbce788fba2dcbdbdcbc6d0c0e9f607049fdaaf3cf2b0ca4b14670e7afbd4bf
- After-image SHA-256: 11b633d319ce3e23a9e17c172a2f2b1640e51e65bc8099ba467cf2025a3004ca

## Recommendation

Retain the existing production company as the sole canonical Transportation Equipment Network record, retire the duplicate parenthetical seed identity, and correct the platform's ownership and history. Direct manager evidence establishes that I Squared began building the platform by acquiring Star Leasing through Fund II in March 2021, then brought Mubadala, QIA and other co-investors into TEN in July 2024. Meketa identifies TEN as a current MIFAX co-investment, and an SEC filing discloses a separate 6.29% Series II common-stock interest as of March 31, 2026. Exact percentages and vehicles for the other current owners are not publicly disclosed, so no equal ownership is inferred.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| I Squared Capital | — | ISQ Global Infrastructure Fund II | Lead sponsor; exact current percentage not publicly disclosed | 2021 | — | CLOSED_ACTIVE |
| I Squared Capital | — | ISQ Open Infrastructure Company LLC—Series II | 6.29% indirect common-stock interest at March 31, 2026 | 2025 | — | CLOSED_ACTIVE |
| Meketa Capital | — | Meketa Infrastructure Fund (MIFAX) | Exact percentage not publicly disclosed | 2024 | — | CLOSED_ACTIVE |
| Mubadala | — | — | Exact percentage not publicly disclosed | 2024 | — | CLOSED_ACTIVE |
| QIA | — | — | Exact percentage not publicly disclosed | 2024 | — | CLOSED_ACTIVE |

## Source holdings

- 053-i-squared-capital:holding:001:transportation-equipment-network
- 070-mubadala:holding:004:transportation-equipment-network

## Retired company records

- None

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| — | — | — | None |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| ledger:0494:transportation-equipment-network-ten:c5e0a020 | Transportation Equipment Network (TEN) | United States / Canada | a3f88b225eb2da40f8a5c305631a98631d8b78c4224056e2691108385ee7c144 | a3f88b225eb2da40f8a5c305631a98631d8b78c4224056e2691108385ee7c144 |

## Evidence

- [Canonical identity, current co-owners and 2024 recapitalization](https://isquaredcapital.com/news/i-squared-announces-new-shareholders-in-transportation-equipment-network-ten-the-leading-north-american-full-service-trailer-lessor/) — Mubadala and QIA invested alongside I Squared and other co-investors, TEN became the single platform identity effective July 1, 2024, The business is a North American asset-owning trailer lessor
- [Meketa current co-investment evidence](https://meketacapital.com/co-investments) — Meketa Infrastructure Fund lists TEN as a co-investment
- [Initial I Squared entry and Fund II attribution](https://www.businesswire.com/news/home/20210324005278/en/I-Squared-Capital-Acquires-Star-Leasing-A-Leading-Trailer-Lessor-in-the-United-States) — ISQ Global Infrastructure Fund II acquired employee-owned Star Leasing on March 24, 2021
- [Series II current ownership evidence](https://www.sec.gov/Archives/edgar/data/2059924/000121390026057486/ea0290488-10q_isqopen.htm) — ISQ Open Infrastructure Company Series II held an indirect 6.29% common-stock interest in TEN at March 31, 2026

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
