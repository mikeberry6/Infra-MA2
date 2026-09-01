# PortCo proposal — CenTrio

- Task: 390 (ledger:0390:centrio:1635b638)
- As of: 2026-09-01
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: 9c1fc95205302d0dc5fd496f238e15e097263965838484b914c5b12e1a4bc033
- Production snapshot SHA-256: 39fabdd64cd1e4a0797c59b98ba039c4c32a444429ae1c5453df0edcfd1a9f60
- Current company snapshot SHA-256: 69a1bbbf069997303f183d439f08aff5ff9b45250d92937732d9ca575af924fa
- After-image SHA-256: c68daf5feae5bba104088c32884244249a32d37fc5dc478d4e61b6f57fb05411

## Recommendation

Correct the existing CenTrio platform rather than add QIC Global Infrastructure as a third owner. QIC Global Infrastructure is the existing QIC manager lineage. The current sponsor aggregation is a QIC-managed 75% interest and Ullico Infrastructure Fund 25%; regulatory evidence attributes the QIC-managed interest to CalPERS/Golden Reef Trust at 60% and QGIF at 15%. Brookfield formerly owned 100% of the U.S. district-energy business and completed its exit on July 16, 2021. A July 2026 refinancing reconfirmed QIC and Ullico sponsorship and did not transfer equity, and no later sale or signed pending ownership transaction was identified through September 1, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Brookfield Asset Management | — | BIF II US District Energy Holdings LLC | 100% before sale | 2012 | 2021 | REALIZED |
| QIC | — | Golden Reef Trust and QGIF Raptor Aggregator 1 LP through Lowry Holdings | 75% managed interest (60% CalPERS/Golden Reef Trust; 15% QGIF) | 2021 | — | CLOSED_ACTIVE |
| Ullico | — | Ullico Infrastructure Fund; Ullico District Energy Blocked Holdco through Lowry Holdings | 25% | 2021 | — | CLOSED_ACTIVE |

## Source holdings

- 082-qic-global-infrastructure:holding:001:centrio

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

- [Brookfield ownership exit and closing](https://bip.brookfield.com/generation/pdf/document-file.pdf?path=%2Fpress-releases%2Fbip%2Fbrookfield-infrastructure-completes-sale-north-american-district-energy-business) — Brookfield completed the sale of its North American district-energy business on July 16, 2021, The sale transferred the entire U.S. business to the QIC/Ullico consortium
- [Current ownership percentages and acquisition vehicles](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7B8B6B5CAD-61FA-4314-9A9B-D126D98D1BE1%7D) — QIC-managed capital represents 75% through a 60% Golden Reef Trust interest and a 15% QGIF interest, Ullico Infrastructure Fund represents 25%
- [Latest sponsor and exit check](https://www.centrioenergy.com/news/centrio-successfully-completes-485-million-comprehensive-refinancing-to-support-long-term-growth/) — CenTrio remained backed by QIC and Ullico in July 2026, The disclosed transaction was a refinancing rather than an equity transfer
- [Current QIC portfolio status](https://www.qic.com/Investment-Capabilities/Infrastructure/Global-Portfolio/CenTrio) — QIC currently lists CenTrio as an infrastructure portfolio company, QIC discloses a 75% interest

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
