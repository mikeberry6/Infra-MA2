# PortCo proposal — Wind Facility

- Task: 316 (ledger:0316:wind-facility:66fa043e)
- As of: 2026-09-01
- Actions: CORRECT_COMPANY, ADD_OWNER, RETRACT_ERRONEOUS_OWNERSHIP
- Proposal SHA-256: 15fff5a2061419170d536386d649257257cdc692f0531745dedf2188fbea9636
- Production snapshot SHA-256: 955401b12669dcf28f41d4566ded781b29e557214e8b420b0466b48ee5a4d7ea
- Current company snapshot SHA-256: 42ea74cf8bdfe91191da9decee2899da24a4fdfea1c1711d4abd44ef8a74df77
- After-image SHA-256: aa10204505a93fa34c4c5c0fd021819f5012fd5ed9cc6937f57d63eac09cc538

## Recommendation

Resolve the generic Wind Facility placeholder as Mesteño Wind Project and replace its unsupported InfraRed Infrastructure Fund VI attribution with the regulatory ownership chain. Texas PUCT records establish a May 29, 2024 closing through Mesteno Aggregator LLC, owned 3.48% directly by InfraRed Energy Transition Fund A LP and 96.52% indirectly by InfraRed Energy Transition Fund B LP through Mesteno HoldCo LLC. InfraRed announced the acquisition from Duke Energy on May 30, 2024. No later owner exit or signed ownership change was identified through September 1, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| InfraRed Capital Partners | — | InfraRed Energy Transition Fund A LP → Mesteno Aggregator LLC | 3.48% direct | 2024 | — | CLOSED_ACTIVE |
| InfraRed Capital Partners | — | InfraRed Energy Transition Fund B LP → Mesteno HoldCo LLC → Mesteno Aggregator LLC | 96.52% indirect | 2024 | — | CLOSED_ACTIVE |

## Source holdings

- 059-infrared-capital-partners:holding:010:wind-facility

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

- [Legal identity, closing and exact Fund A/B ownership chain](https://interchange.puc.texas.gov/Documents/56766_1_1406189.PDF) — Fund A owns 3.48% directly and Fund B owns 96.52% indirectly through Mesteno HoldCo LLC, Mesteno Aggregator LLC acquired the project on May 29, 2024, Mesteno Windpower, LLC is the project company
- [Current regulatory continuity](https://interchange.puc.texas.gov/Documents/59131_64_1590666.PDF) — The Mesteño legal entities and Fund A/B chain remain reflected in 2026 regulatory records
- [Buyer announcement, seller, geography, capacity and financing](https://www.ircp.com/news/infrared-announces-acquisition-of-texas-onshore-wind-farm/) — InfraRed acquired the operational south Texas wind farm from Duke Energy, The acquisition used all-cash equity without leverage or tax equity, The asset has approximately 202 MW of capacity and commenced operations in 2019

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
