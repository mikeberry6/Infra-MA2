# PortCo proposal — Chief Power

- Task: 66 (ledger:0066:chief-power:131a35b6)
- As of: 2026-08-13
- Actions: CREATE_COMPANY
- Proposal SHA-256: 66fbded8031c6e09025c1d5a9328fdfd68ca0c88177461ebbcba41219a372184
- Production snapshot SHA-256: e9764340b10723ea956e8caffbad684bdf8dcaf9e8f2ae2b5599c62622a51d8b
- Current company snapshot SHA-256: New company
- After-image SHA-256: 403e288cf02201e34a712bbcade058ae924249d5848b56c78632a2bf8a2ffeec

## Recommendation

Create one canonical Chief Power platform record rather than separate records for its financing, holding-company and plant-owner subsidiaries. ArcLight Energy Partners Fund V formed the platform in 2014 to acquire partial interests in the Keystone and Conemaugh generating stations and added a separately financed tranche in 2019. A 2020 lender restructuring transferred control of the original Chief Power Finance tranche, but Fund V retained a small voting interest and the separately owned Chief Power Finance II tranche was expressly excluded. A 2024 FERC filing states that Fund V still indirectly owns greater than 10% voting interests in both II plant-owner entities, ArcLight's current investments page continues to label Chief Power current, and the platform continues to be asset-managed as an approximately 1,300 MW ownership position. No later ArcLight exit, signed sale or pending ownership change was identified through August 13, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| ArcLight Capital Partners | ArcLight Energy Partners Fund V, L.P. | Chief Power Finance, LLC (pre-restructuring controlling tranche) | 96.4% voting interest before the 2020 restructuring; underlying interests included 44.45% of Keystone and 35.11% of Conemaugh | 2014 | 2020 | REALIZED |
| ArcLight Capital Partners | ArcLight Energy Partners Fund V, L.P. | Chief Power Transfer Parent, LLC / Chief Power Finance, LLC residual tranche | Approximately 3% interest retained after the 2020 lender restructuring; exact economic percentage not publicly disclosed | 2014 | — | CLOSED_ACTIVE |
| ArcLight Capital Partners | ArcLight Energy Partners Fund V, L.P. | Chief Power Finance II, LLC | Greater than 10% voting interest in each of Chief Conemaugh Power II, LLC and Chief Keystone Power II, LLC; exact economic percentage not publicly disclosed | 2019 | — | CLOSED_ACTIVE |

## Source holdings

- 012-arclight-capital:holding:023:chief-power

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

- [Current portfolio status and infrastructure-strategy basis](https://arclight.com/investments/) — ArcLight identifies Chief Power as a current power investment
- [Current retained interest in the restructured original tranche](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7B909B109C-0000-C03B-9B29-CBFAE3D27AD9%7D&DocTitle=2026+Annual+Report+of+Cricket+Valley+Energy+Center%2C+LLC%2C+et+al.) — a 2026 regulatory filing describes ArcLight's approximately 3% interest in Chief Power JV
- [2020 lender restructuring and platform boundary](https://elibrary.ferc.gov/eLibrary/filelist?accession_Number=20200911-5213&optimized=false) — Chief Power Finance II and its II plant-owner subsidiaries were excluded from the transfer, Fund V retained less than 5% voting ownership after the restructuring, the restructuring transferred control of the original Chief Conemaugh Power and Chief Keystone Power interests to Chief Power Transfer Parent
- [Current operating platform and asset-management status](https://rpaadvisors.com/our-team/rich-divito/) — RPA identifies Chief Power as an approximately 1,300 MW ownership position in two operating western Pennsylvania coal-fired plants, RPA states that its executive has served as Chief Power's CEO and asset manager since the 2020 restructuring
- [Current ArcLight control, Fund V attribution and surviving II tranche](https://www.docketalarm.com/cases/FERC/ER19-2231-010/Chief_Conemaugh_Power_II_LLC/20241031-5380/) — the FERC filing states that ArcLight-managed Fund V indirectly owns greater than 10% voting interests in Chief Conemaugh Power II and Chief Keystone Power II, the II entities remain indirectly managed and controlled by ArcLight
- [2019 additional-tranche closing](https://www.monitoringanalytics.com/reports/PJM_State_of_the_Market/2019/2019-som-pjm-sec3.pdf) — PJM's market monitor records the September 30, 2019 transfer of PSEG's 22.84% Keystone and 22.5% Conemaugh interests to the Chief II entities associated with ArcLight
- [2014 acquisition closing and initial asset interests](https://www.sec.gov/Archives/edgar/data/9466/000119312515305153/d54970dex991.htm) — Exelon reported that it sold its Keystone and Conemaugh ownership interests as of December 31, 2014, the sold interests represented 41.98% of Keystone and 31.28% of Conemaugh

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
