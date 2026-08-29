# PortCo proposal — EdgeConneX

- Task: 235 (ledger:0235:edgeconnex:0ea39b90)
- As of: 2026-08-29
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: 6e7035288911ca92799f9d5367d3b1816d29c1b9a3be695e3e587815f1238e25
- Production snapshot SHA-256: 6450eb3d0682bf21e3b034e46ac2c4022c9e71dfab291aa98ded4604470a5841
- Current company snapshot SHA-256: 00bd424d541a6161ddb27c63fd3927aad6d21f416fd5c8ec0da69c8068f18543
- After-image SHA-256: c4f7b27d043604b0e0f1479e51f5785a5c95a7fe4060b3ef2395c6e3ff4fdee6

## Recommendation

Correct EdgeConneX's ownership and milestone history without creating duplicate platform records. Direct sources establish EQT Infrastructure as the continuing largest shareholder group, Sixth Street-managed funds as a current minority owner from 2024, Providence as the former seller group, and Liberty Global as a former minority holder that fully exited on June 29, 2026. CPP Investments funded EQT's broader AI infrastructure strategy but is not separately evidenced as a direct EdgeConneX shareholder, so it is not added. Sites, campuses, AdaniConneX and Chayora remain outside the canonical company boundary.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| EQT Infrastructure | — | EQT Infrastructure IV | Initial EQT acquisition vehicle; exact current percentage not publicly disclosed | 2020 | — | CLOSED_ACTIVE |
| EQT Infrastructure | — | EQT Infrastructure V | Co-investment alongside EQT Infrastructure IV; exact percentage not publicly disclosed | 2021 | — | CLOSED_ACTIVE |
| EQT Infrastructure | EQT AI Infrastructure Strategy | — | Minority interest acquired from EQT Infrastructure IV and V; exact percentage not publicly disclosed | 2026 | — | CLOSED_ACTIVE |
| Liberty Global | — | Herndon Topco LP / McNair Topco LP | Former weighted 3.3% interest | — | 2026 | REALIZED |
| Sixth Street | — | Sixth Street-managed funds; exact vehicles not publicly disclosed | Minority; exact percentage not publicly disclosed | 2024 | — | CLOSED_ACTIVE |

## Source holdings

- 043-eqt-infrastructure:holding:006:edgeconnex
- 088-sixth-street:holding:004:edgeconnex

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

- [2026 EQT fund recapitalization](https://eqtgroup.com/news/eqt-ab-publ-half-year-report-2026-2026-07-17) — EQT AI Infrastructure acquired a minority stake from EQT Infrastructure IV and V, EQT remained the largest shareholder group
- [Current Sixth Street minority ownership](https://sixthstreet.com/investment_announce/eqt-welcomes-sixth-street-as-strategic-investor-in-edgeconnex/) — Sixth Street-managed funds invested in EdgeConneX, The interest was acquired from EQT Infrastructure IV and V
- [EQT acquisition closing and former seller](https://www.prnewswire.com/news-releases/edgeconnex-announces-completion-of-its-acquisition-by-eqt-infrastructure-301167475.html) — EQT Infrastructure completed the acquisition on November 5, 2020, The acquired company was held by a Providence-led investor group
- [Liberty Global exit](https://www.sec.gov/Archives/edgar/data/1570585/000157058526000109/lbtya-20260630.htm) — Liberty Global fully disposed of its EdgeConneX-related interest on June 29, 2026

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
