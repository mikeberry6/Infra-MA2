# PortCo proposal — TraPac LLC

- Task: 332 (ledger:0332:trapac-llc:57512da4)
- As of: 2026-09-01
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: 4590840c323276499b33bf2b370fa70c1bd4601e2b406b6a6ef26a5ace98ab9a
- Production snapshot SHA-256: 72a33d54b826efde01a5d0359897c1cfde9f062dc397dd3a1bbd5f69248d2d6e
- Current company snapshot SHA-256: 2d2b09e9a672041727db7b1ff18f26ee532e6fcbaf3e139ffcea0c5f296999fa
- After-image SHA-256: 9fddd1a170c978e81e754c7c5cf48aa72b53a211b4c781716a388ff49eef704e

## Recommendation

Correct TraPac to its legal name and complete its ownership history. Mitsui O.S.K. Lines repurchased Brookfield's 49% interest in 2022, then Ocean Network Express closed a 51% acquisition on November 2, 2023 and Macquarie Infrastructure Partners VI closed a 49% acquisition on November 1, 2023. The two current owners exercise joint control. TraPac Jacksonville transferred separately to Ceres in 2022 and is not part of this Los Angeles/Oakland platform.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Brookfield Asset Management | — | BIF II TP Aggregator (Delaware), L.P. | 49% indirect interest | 2014 | 2022 | REALIZED |
| Macquarie Asset Management | Macquarie Infrastructure Partners VI | Skipjack Terminal Holdings, L.P. / Skipjack (ECI) Holdings, LLC | 49% | 2023 | — | CLOSED_ACTIVE |
| Mitsui O.S.K. Lines | — | International Transportation, Inc. / TraPac Holdings, LLC | 100% initially; 51% with Brookfield; 100% after the 2022 repurchase | 1985 | 2023 | REALIZED |
| Ocean Network Express | — | United Pacific Ports B (UK) Ltd. | 51% | 2023 | — | CLOSED_ACTIVE |

## Source holdings

- 065-macquarie-asset-management:holding:025:trapac-llc

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

- [Joint-control and 51/49 ownership evidence.](https://ec.europa.eu/competition/mergers/cases1/202316/M_11056_9135914_48_3.pdf) — ONE and Macquarie obtained joint control of TraPac., The aggregate current ownership split is 51% ONE and 49% Macquarie.
- [Exact 2023 acquisition closing dates.](https://ir.mol.co.jp/en/ir/stock/gms/main/05/teaserItems1/018/linkList/01/link/notice24.pdf) — Macquarie's 49% acquisition closed on November 1, 2023., ONE's 51% acquisition closed on November 2, 2023.
- [Current ownership, legal vehicles and operating-platform boundary.](https://portoflosangeles.org/commission/agenda-archive-and-videos/agendas/2023/05252023-special-agenda) — ONE and Macquarie acquired aggregate 51% and 49% interests., The ownership transfers did not alter the Los Angeles operating permit or platform boundary.
- [Former Brookfield ownership evidence.](https://www.mol.co.jp/en/pr/2014/14002.html) — Brookfield acquired a 49% indirect interest in 2014., Mitsui O.S.K. Lines retained the other 51% during that period.

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
