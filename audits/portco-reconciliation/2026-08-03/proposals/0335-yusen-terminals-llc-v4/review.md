# PortCo proposal — Yusen Terminals LLC

- Task: 335 (ledger:0335:yusen-terminals-llc:b7587254)
- As of: 2026-09-01
- Actions: CORRECT_COMPANY, ADD_OWNER, RETIRE_OWNERSHIP
- Proposal SHA-256: db98134b1529530d5b0d7ba1378fdd8054d5e3275a0ade04eb1b5a300854ac8a
- Production snapshot SHA-256: 1f10ea7fba27431e4be99ed291db027c9589cb7452ce038ad9571aea0efaacfc
- Current company snapshot SHA-256: b637a6e9ab3d9f3b6ed21da62d6146970811e8400392440286c702b4166e454f
- After-image SHA-256: 60d1d314305ada8c471d153b40a51d0f7a736c7ab0109966d230457c805d692b

## Recommendation

Correct Yusen Terminals' ownership history without treating Ocean Network Express' 2023 purchase as Macquarie's exit. ONE closed the acquisition of NYK's 51% interest on November 6, 2023 while Macquarie Infrastructure Partners III retained 49%. Transaction counsel later disclosed a separate US$550 million sale of Macquarie's 49% Bluefin interest, and YTI's current company-controlled profile identifies the business as wholly owned by ONE. The exact later buyer vehicle and closing date are not publicly disclosed, so the database records the verified realized state without inventing a date.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Macquarie Asset Management | Macquarie Infrastructure Partners III | MIP III Bluefin A HoldCo LLC / MIP III (ECI) AIV, L.P. | 49% of NYK Ports LLC | 2015 | — | REALIZED |
| Nippon Yusen Kabushiki Kaisha | — | NYK Group Americas / NYK Energy Transport (USA), Inc. | 100% before 2015; 51% from 2015 to 2023 | 1991 | 2023 | REALIZED |
| Ocean Network Express | — | Undisclosed ONE subsidiary / NYK Ports LLC | 100% through NYK Ports LLC | 2023 | — | CLOSED_ACTIVE |

## Source holdings

- None

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

- [Legal ownership chain and 2023 transaction structure.](https://cityclerk.lacity.org/onlinedocs/2014/14-0094-S2_misc_100_8-18-23.pdf) — Macquarie's Bluefin vehicle retained the separate 49% interest after ONE's acquisition., ONE acquired NYK's 51% interest in NYK Ports LLC, the parent of Yusen Terminals.
- [Independent regulatory evidence for the 2023 ownership transition.](https://ec.europa.eu/competition/mergers/cases1/202314/M_11006_9088659_52_3.pdf) — The European Commission reviewed ONE's purchase from NYK Energy Transport., The transaction initially established ONE and Macquarie joint control.
- [Macquarie exit evidence.](https://www.gibsondunn.com/practice/transportation-and-space/) — Transaction counsel discloses a later US$550 million sale of Bluefin's 49% interest., Transaction counsel identifies Bluefin as the Macquarie vehicle that held the 49% interest.
- [Current ownership and operating-status evidence.](https://www.linkedin.com/company/yusen-terminals) — The company remains an active marine-terminal operator at the Port of Los Angeles., Yusen Terminals identifies itself as wholly owned by Ocean Network Express.
- [ONE acquisition closing evidence.](https://www.one-line.com/en/news/one-strengthens-global-presence-terminal-acquisitions-us-west-coast-and-rotterdam) — ONE announced completion of the Yusen Terminals acquisition on November 6, 2023., The completed transaction concerned NYK's 51% interest rather than Macquarie's 49% interest.

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
