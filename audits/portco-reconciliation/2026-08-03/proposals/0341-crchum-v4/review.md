# PortCo proposal — CRCHUM

- Task: 341 (ledger:0341:crchum:38aca414)
- As of: 2026-09-01
- Actions: CORRECT_COMPANY, ADD_OWNER, MERGE_COMPANIES
- Proposal SHA-256: fe3225fb6240d973e9bffbcbb58e23313b02c585555b7c5032b7ba9295e0213f
- Production snapshot SHA-256: a79ec15b9b42da5d16c30b89f2645515a97252832e1ea4f3e1bf1e937a27563e
- Current company snapshot SHA-256: 132cb4ee814ef3aa372fdad43a60aee3a451ebca40115ea7eaf7f6f68b541bc6
- After-image SHA-256: 2527723ad3e39f1f83088c81b4947b370bf4199b1e9cae4c11f3d0cb7cef0ded

## Recommendation

Consolidate all three production labels for the same Accès Recherche Montréal social-infrastructure PPP into one Centre de recherche du CHUM (CRCHUM) company. Preserve Axium and Meridiam as current owners, QIC as a former 19.6% owner after its September 2023 sale to Meridiam, and retain the distinct main CHUM hospital PPP outside this record.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Axium Infrastructure | — | Fiera Axium Recherche s.e.c. / Axium Recherche L.P. | 60% at the 2010 close; current exact percentage not publicly disclosed | 2010 | — | CLOSED_ACTIVE |
| Meridiam | — | Meridiam Infrastructure Canada Finance ULC / Accès Recherche Montréal L.P. | 40% at the 2010 close; acquired QIC's 19.6% in September 2023; current exact percentage not publicly disclosed | 2010 | — | CLOSED_ACTIVE |
| QIC | — | QIC CRCHUM Trust | 19.6% | 2012 | 2023 | REALIZED |

## Source holdings

- 067-meridiam:holding:003:crchum

## Retired company records

- cmrxpj7rh00lbivhecb0tu96n
- cmrxpjl630160ivhex0vonvz0

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpmdwq04szivhew6xtvfd9 | cmrxpmd4304rzivhett2z2d4k | Both milestones describe Meridiam's May 2010 financial close for the same Accès Recherche Montréal PPP. |
| OWNERSHIP_PERIOD | cmrxpk7fq025aivheljn5eboh | cmrxpk7ar0251ivhe2d8g3bhi | The English-label record's Meridiam period is the same continuous 2010 ownership period retained on the canonical CRCHUM company. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Current Axium portfolio evidence for continuing ownership of the CRCHUM research-center PPP.](https://www.axiuminfra.com/portfolio-assets/?lang=en&portfolio_category=89) — current Axium ownership, single asset boundary
- [Public ProjectCo evidence for Accès Recherche Montréal, the 2010 ownership structure and the research-center PPP boundary.](https://www.chumontreal.qc.ca/sites/default/files/inline-files/Annexe%2003%20-%20Renseignements%20sur%20ProjetCo.pdf) — Axium and Meridiam 2010 ownership, PPP boundary, canonical project identity
- [Current Meridiam portfolio evidence tying the English name to the same operating CRCHUM asset.](https://www.meridiam.com/assets/montreal-university-hospital-research-center-crchum-canada/) — current Meridiam ownership, duplicate identity, operating status
- [Former-owner evidence for QIC's 19.6% interest, 2012 entry and September 2023 exit.](https://www.qic.com/Investment-Capabilities/Infrastructure/Global-Portfolio/Montreal-Hospital-Research-Centre) — 19.6% stake, 2023 exit, QIC former ownership

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
