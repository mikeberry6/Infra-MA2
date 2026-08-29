# PortCo proposal — WideOpenWest, Inc.

- Task: 219 (ledger:0219:wideopenwest-inc:2debcc76)
- As of: 2026-08-29
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: d18288bd15cfe6753324538cfa4d2ff8453a164da9d9aebdf0f4c9c432759e68
- Production snapshot SHA-256: 4cc2ec48e8c6a2f8e33c18ab8e9625a47ee1500ab95ecc5931ad8c4a78f98e48
- Current company snapshot SHA-256: f7e77716cc85a4c388a366ae47def25240a7c008887e7199a0d460e77717f180
- After-image SHA-256: 2ec90d84bfb55e1917346f053e4964c449b98bd7fa94d6cbcd04d1e0c89b4043

## Recommendation

Keep one WideOpenWest record and correct the closed take-private ownership. DigitalBridge Partners III owns approximately 63% and Crestview III owns approximately 37% of Bandit Parent's limited-partner interests, with equal general-partner control, following the December 31, 2025 close. Preserve Crestview's 2015-2025 pre-take-private period separately, exclude InfraBridge, and do not convert the still-pending upstream SoftBank acquisition of DigitalBridge into a direct WOW owner change.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Crestview Partners | — | Crestview III investment funds | Approximately 35% at entry; approximately 37% immediately before the take-private | 2015 | 2025 | REALIZED |
| Crestview Partners | — | Crestview III investment funds via Bandit Parent, LP | Approximately 37% of Bandit Parent, LP limited-partner interests | 2025 | — | CLOSED_ACTIVE |
| DigitalBridge | DigitalBridge Fund III | Bandit Parent, LP via Bandit HoldCo, Inc. and Bandit MidCo, Inc. | Approximately 63% of Bandit Parent, LP limited-partner interests | 2025 | — | CLOSED_ACTIVE |

## Source holdings

- 036-digitalbridge:holding:017:wideopenwest-wow

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

- [Post-close ownership and holding chain](https://dms.psc.sc.gov/Attachments/Matter/97a30d91-be2e-4b65-802e-146d80e00088) — Crestview III holds approximately 37% and has equal GP control, DigitalBridge Partners III holds approximately 63% of Bandit Parent's LP interests
- [Transaction announcement and rollover](https://www.digitalbridge.com/news/2025-08-11-wideopenwest-wow-inc-to-be-taken-private-by-digitalbridge-group-inc-and-crestview-partners-in-15-billion-transaction) — Crestview rolled its existing investment into the new ownership structure, DigitalBridge and Crestview announced the transaction on August 11, 2025
- [Current manager attribution](https://www.digitalbridge.com/portfolio/wow) — DigitalBridge currently lists WOW as a portfolio investment
- [Legal closing](https://www.sec.gov/Archives/edgar/data/1701051/000110465925125421/tm2534163d1_8k.htm) — The take-private closed on December 31, 2025, WOW survived as a private company
- [Operating profile](https://www.wowway.com/experience/about) — The network passes nearly two million homes and businesses, WOW provides broadband services across 19 markets

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
