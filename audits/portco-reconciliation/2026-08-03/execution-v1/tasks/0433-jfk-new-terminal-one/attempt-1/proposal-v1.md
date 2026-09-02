# PortCo proposal — JFK New Terminal One

- Task: 433 (ledger:0433:jfk-new-terminal-one:759db377)
- As of: 2026-09-02
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: 9f266567147bbbde0ad1f51078ef6c2ddbcff626b15bac9e7491664c289d5e89
- Production snapshot SHA-256: a6a82fcfc7377c8cd27b7f2ba7311bc5e23c3c23ffa5039b35a37581ed984613
- Current company snapshot SHA-256: 186648e1cb92f4e316af7ca27d0454c8c8e58f49999f843b34249fcc3be2686f
- After-image SHA-256: 1cd8440018c00c65cd9005a7ee72fa9850ece6ff578b8fee22e264aecd7eae16

## Recommendation

Keep one canonical JFK New Terminal One asset and correct its ownership hierarchy. Current direct sponsor ownership is Ferrovial 49%, JLC Infrastructure 30%, Ullico 19% and Carlyle 2%. Swiss Life Asset Managers' disclosed 0.4% look-through interest is held via JLC Terminal One Co-Invest L.P. inside JLC's 30% block and is not additive to the 100% sponsor cap table.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Ferrovial | — | Mars NTO LLC | 49% direct sponsor interest | 2022 | — | CLOSED_ACTIVE |
| JLC Infrastructure | — | — | 30% direct sponsor interest | 2022 | — | CLOSED_ACTIVE |
| Swiss Life Asset Managers | — | JLC Terminal One Co-Invest L.P. | 0.4% look-through interest within JLC Infrastructure's 30% sponsor block; not additive | 2022 | — | CLOSED_ACTIVE |
| The Carlyle Group | — | CGI Phoenix Aggregator, L.P. / Mars NTO LLC | 2% direct sponsor interest after partial sale | 2022 | — | CLOSED_ACTIVE |
| Ullico | — | Ullico Infrastructure Fund | 19% direct sponsor interest | 2022 | — | CLOSED_ACTIVE |

## Source holdings

- 091-swiss-life-asset-managers:holding:001:jfk-new-terminal-one

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

- [Exact Swiss Life co-investment vehicle.](https://ch.swisslife-am.com/content/dam/slam/documents_publications/investment_foundation/en/f/efactsheets_30092025.pdf) — The investment is held through JLC Terminal One Co-Invest L.P.
- [Swiss Life current look-through ownership and entry timing.](https://ch.swisslife-am.com/content/dam/slam/documents_publications/investment_foundation/en/r/e_ast_qb_01_2026_igchf.pdf) — Swiss Life reports a 0.4% look-through interest, The investment entered in November 2022
- [Financial close, concession and consortium evidence.](https://www.carlyle.com/media-room/news-release-archive/carlyle-together-with-the-consortium-building-new-terminal-one-at-jfk-airport) — The project is one terminal concession rather than separate vehicle-level PortCos, The revised lease and sponsor financing closed in June 2022
- [Primary current sponsor ownership and asset evidence.](https://www.sec.gov/Archives/edgar/data/1468522/000162828026032618/ferrovial-factbook2026_s.htm) — The current sponsor cap table is Ferrovial 49%, JLC 30%, Ullico 19% and Carlyle 2%, The terminal concession and project remain active

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
