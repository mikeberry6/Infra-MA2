# PortCo proposal — JW Water Holdings

- Task: 206 (ledger:0206:jw-water-holdings:fc8ebab0)
- As of: 2026-08-29
- Actions: CORRECT_COMPANY, MERGE_COMPANIES
- Proposal SHA-256: 8a20de5694747ab3bcba360d7610d753cdda5baa173262fb755c0de7fe0519c0
- Production snapshot SHA-256: e73857cf073c70847450357b2c61f20c5e14db82c3ac3da75d37b43045c74e59
- Current company snapshot SHA-256: 23d9f76aa2e0dd3c76064beb9fd893e6a25e39437522c90eeeeb57efdaa0dc83
- After-image SHA-256: 2c6ec9abe17b35ee356733dd9f4dd5592387750ebd74c3afa7185661e42b3465

## Recommendation

Merge the Robson Utilities Portfolio and Robson Communities Utilities / Pima Utility records into JW Water Holdings because direct sponsor, company and regulatory sources establish one manager-level CVC DIF platform. Preserve Pima and Robson operating history as child-utility and acquisition-cohort milestones, retain one DIF Infrastructure VII ownership period, retire the duplicate production and seed identities, and treat later utility consolidations as internal reorganizations rather than manager-level ownership changes.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| CVC DIF | DIF Infrastructure VII | — | — | 2024 | — | CLOSED_ACTIVE |

## Source holdings

- 034-cvc:holding:014:jw-water-holdings
- 035-dif:holding:014:jw-water-holdings

## Retired company records

- cmrxpjd0s00tiivheuomhxk0o
- cmrxpjd2w00tmivhewaupms5e

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxplf8m03nuivhepbdtvo7e | cmrxplf3u03nqivhe08x7rqh0 | Both milestones describe the combined Arizona utility platform's scale at the 2024 acquisition. |
| MILESTONE | cmrxplf9303nvivheuc6ppmtr | cmrxplf4f03nrivhesuiayyk0 | Both milestones describe CVC DIF's November 2024 acquisition of JW Water and the Robson utility portfolio through DIF Infrastructure VII. |
| MILESTONE | cmrxplfjq03oaivhelyurbvv3 | cmrxplf3u03nqivhe08x7rqh0 | Both milestones describe the combined Arizona utility platform's scale at the 2024 acquisition. |
| MILESTONE | cmrxplfka03obivhekkecyd32 | cmrxplf4f03nrivhesuiayyk0 | Both milestones describe CVC DIF's November 2024 acquisition of the Robson utilities through DIF Infrastructure VII. |
| OWNERSHIP_PERIOD | cmrxpjyib01rgivhevk92xk8v | cmrxpjyht01rfivheqr8qfsdl | The Robson portfolio row carries the same CVC DIF ownership through DIF Infrastructure VII as the canonical JW Water platform. |
| OWNERSHIP_PERIOD | cmrxpjyks01rkivhehaofx67s | cmrxpjyht01rfivheqr8qfsdl | The Pima and Robson row carries the same CVC DIF ownership through DIF Infrastructure VII as the canonical JW Water platform. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| ledger:0482:jw-water-holdings-incl-robson-utilities:9fae287b | JW Water Holdings (incl. Robson Utilities) | United States | f91c5693b0c91c72bf616c21bb2ab066374b85d7150ac4c6bb254593fe896257 | f91c5693b0c91c72bf616c21bb2ab066374b85d7150ac4c6bb254593fe896257 |

## Evidence

- [Current identity and operating footprint](https://jwwater.com/) — JW Water presents the integrated utility roster as one operating platform, The platform serves more than 50,000 customers in Arizona
- [Pima subsidiary boundary](https://jwwater.com/pima/wp-content/uploads/sites/12/2026/03/Pima-Rate-Case-FAQ.pdf) — Pima became a wholly owned JW Water Holdings subsidiary on November 20, 2024, The proposed Pima entity split is an internal utility reorganization
- [Regulatory ownership confirmation](https://www.azcc.gov/news/home/2025/11/21/november-19--2025-open-meeting-highlights) — The Arizona Corporation Commission identified JW Water Holdings as owner of the 18-utility group
- [Ownership, fund attribution and platform boundary](https://www.cvc.com/media/news/2024/2024-11-21-cvc-dif-acquires-a-portfolio-of-us-regulated-water-and-wastewater-utilities/) — DIF Infrastructure VII completed the JW Water and eight-utility Robson acquisitions, The combined acquisitions serve more than 50,000 Arizona customers

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
