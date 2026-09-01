# PortCo proposal — Coastal GasLink Pipeline

- Task: 321 (ledger:0321:coastal-gaslink-pipeline:b82e2db4)
- As of: 2026-09-01
- Actions: CORRECT_COMPANY, ADD_OWNER, ADD_PENDING_TRANSACTION, MERGE_COMPANIES
- Proposal SHA-256: d69e8a4768fb3cd51eb75527f6ff3e8d4b89404ff72d7cbff1d63db3f9f42c5d
- Production snapshot SHA-256: 7dc615bffa129dcfc75abc0cade3df04cf40de39fed41b4c48961f9dd36e43a6
- Current company snapshot SHA-256: 38ba2a688ac8a1720990f6d3e6e62d60e1c0d46704a0c265165750a12069ccd9
- After-image SHA-256: 45c3297d4e0040ab01fcde523e37b3060fdd2e938cc1032c712e90d1831077e0

## Recommendation

Maintain one canonical Coastal GasLink Pipeline record and retire the duplicate seed identity. Preserve TC Energy's current 35% interest and the combined 65% KKR/AIMCo interest without inventing the private KKR/AIMCo split. Record the Indigenous equity option as signed pending incoming because no legal closing was identified.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| AIMCo | AIMCo Direct Infrastructure Investment | n.a. | Part of combined 65% KKR/AIMCo interest; individual split not publicly disclosed | 2020 | — | CLOSED_ACTIVE |
| KKR | K-INFRA | n.a. | Part of combined 65% KKR/AIMCo interest; individual split not publicly disclosed | 2020 | — | CLOSED_ACTIVE |
| TC Energy Corporation | — | Coastal GasLink Pipeline Limited Partnership | 35% | 2012 | — | CLOSED_ACTIVE |

## Source holdings

- 064-kkr:holding:006:coastal-gaslink-pipeline

## Retired company records

- None

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| — | — | — | None |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| ledger:0473:coastal-gaslink-pipeline-project:816af47c | Coastal GasLink Pipeline Project | Canada | e23ae52e7e4b5aaee5e3d6d067a7fb84c7f60fd378c8cd0291e856e08649ab0e | e23ae52e7e4b5aaee5e3d6d067a7fb84c7f60fd378c8cd0291e856e08649ab0e |

## Evidence

- [Canonical identity and ownership split](https://www.tcenergy.com/announcements/2019/2019-12-26tc-energy-announces-the-partial-monetization-of-the-coastal-gaslink-pipeline-project/) — KKR and AIMCo acquired a combined 65%, One Coastal GasLink Pipeline asset, TC Energy retained 35%
- [Pending Indigenous equity option](https://www.tcenergy.com/announcements/2022/2022-03-09-tc-energy-signs-equity-option-agreements-with-indigenous-communities-across-the-coastal-gaslink-project-corridor/) — No legal closing date disclosed, Potential incoming interest of up to 10%, Signed equity option agreements
- [Legal closing](https://www.tcenergy.com/siteassets/pdfs/investors/reports-and-filings/annual-and-quarterly-reports/2020/tc-2020-q2-quarterly-report.pdf) — The combined 65% sale closed in May 2020
- [Current ownership and exit search](https://www.tcenergy.com/siteassets/pdfs/investors/reports-and-filings/annual-and-quarterly-reports/2026/tce-2026-q2-quarterly-report.pdf) — No completed owner exit was reported, TC Energy retained its current investment

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
