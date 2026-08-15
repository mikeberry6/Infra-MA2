# PortCo proposal — Third Coast Infrastructure (CV)

- Task: 85 (ledger:0085:third-coast-infrastructure-cv:56f00f29)
- As of: 2026-08-15
- Actions: CORRECT_COMPANY, ADD_OWNER, RETIRE_OWNERSHIP
- Proposal SHA-256: 64b527745b4b04cd4df6d5cf75575cfe9d87d96bddb822366704a0857aa35578
- Production snapshot SHA-256: ba13ba43b6765a71ae8bbbb31757ccb4572817757b1092a6771120d634d47de7
- Current company snapshot SHA-256: 9c7738fc9ed4e5a73342744cd69b822cc808aa831e16c550bf17f1b3a9fe1feb
- After-image SHA-256: 8beaf75e69eac02bc6933df1f054fb6818ddbccbfc67099e17812832013c8477

## Recommendation

Correct the existing Third Coast Infrastructure record in place and map ArcLight's census label Third Coast Infrastructure (CV) to that canonical company. ArcLight's current portfolio distinguishes Third Coast CV as Current from legacy Third Coast Midstream as Realized, while its January 2023 continuation-fund release states that ArcLight 3C SPV, L.P. acquired an ArcLight Energy Partners Fund V, L.P. affiliate's remaining 25.1% interest in Third Coast Super Holdings, LLC in July 2022. The existing undifferentiated active ArcLight period beginning in 2019 must therefore become a realized Fund V period ending in 2022, followed by a new active ArcLight 3C SPV period beginning in 2022. Current company, manager and institutional evidence supports preserving J.P. Morgan Asset Management / Infrastructure Investments Fund (IIF) as an active co-owner from 2021, but the approximately 50% disclosed in the 2021 transaction applied to subsidiary Lighthouse Super Holdings, LLC and must not be stored as an exact parent-platform stake. Third Coast Super Holdings, Third Coast Infrastructure, the legacy Third Coast Midstream / American Midstream business, Lighthouse and individual infrastructure assets remain one manager-level platform boundary. No later platform sale, sponsor exit or signed pending ownership transaction was identified through August 15, 2026. ArcLight 3C SPV is stored as the factual vehicle with a null fund link because no matching production Fund row exists; this avoids inventing a dependency while preserving the researched vehicle identity.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| ArcLight Capital Partners | ArcLight Energy Partners Fund V, L.P. | — | 25.1% immediately before the July 2022 continuation-vehicle transfer | 2019 | 2022 | REALIZED |
| ArcLight Capital Partners | — | ArcLight 3C SPV, L.P. | 25.1% at July 2022 entry; exact current stake not publicly disclosed | 2022 | — | CLOSED_ACTIVE |
| J.P. Morgan Asset Management | Infrastructure Investments Fund (IIF) | — | Significant minority; exact current parent-platform stake not publicly disclosed | 2021 | — | CLOSED_ACTIVE |

## Source holdings

- 012-arclight-capital:holding:016:third-coast-infrastructure-cv

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

- [ArcLight manager-level transaction exclusion](https://am.gs.com/en-us/advisors/news/press-release/2026/arclight-capital-partners) — The 2026 Petershill transaction concerns a non-control interest in the ArcLight management company, The manager-level transaction does not transfer Third Coast equity
- [Current ArcLight portfolio status, continuation-vehicle identity and exit check](https://arclight.com/investments) — ArcLight lists Third Coast CV as Current, ArcLight lists legacy Third Coast Midstream as Realized, The CV label is an ArcLight investment label for the existing Third Coast platform
- [Parent, operating-company, ownership and geographic boundary](https://arclight.com/wp-content/uploads/2022/09/Third-Coast-Sustainability-Report.pdf) — An IIF affiliate made a significant minority investment in the parent in the second quarter of 2021, Third Coast Infrastructure, LLC is the operating identity under Third Coast Super Holdings, LLC, Third Coast is Houston-based and operates Gulf Coast and Gulf of Mexico midstream infrastructure
- [Current ArcLight 3C SPV status](https://reports.adviserinfo.sec.gov/reports/ADV/161228/PDF/161228.pdf) — ArcLight 3C SPV remains listed as an advised private fund with positive gross asset value, ArcLight Capital Partners, LLC filed the Form ADV on July 1, 2026
- [Current institutional corroboration of IIF ownership](https://www.mendocinocounty.gov/home/showpublisheddocument/76565/639089991377570000) — A March 18, 2026 institutional report identifies Third Coast as an IIF company
- [ArcLight Fund V platform entry](https://www.prnewswire.com/news-releases/american-midstream-announces-completion-of-merger-300889399.html) — ArcLight Energy Partners Fund V affiliates completed the American Midstream take-private on July 23, 2019
- [ArcLight continuation-vehicle transfer, stake and date](https://www.prnewswire.com/news-releases/arclight-announces-closing-of-407-million-continuation-fund-for-third-coast-301727616.html) — ArcLight 3C SPV, L.P. is a continuation fund for Third Coast, The initial close and acquisition occurred in July 2022, The vehicle acquired Fund V's remaining 25.1% of Third Coast Super Holdings, LLC
- [Asset-level transaction boundary](https://www.prnewswire.com/news-releases/third-coast-acquires-interest-in-deepwater-perdido-platform-from-arclight-301870603.html) — The July 2023 Perdido transaction was an asset-level acquisition by a Third Coast subsidiary, The transaction was not a sale of the canonical Third Coast PortCo
- [Predecessor formation and operating history](https://www.sec.gov/Archives/edgar/data/1513965/000119312519188517/d730607ddefm14c.htm) — The American Midstream predecessor was formed in August 2009, The predecessor operated a diversified midstream portfolio
- [Predecessor identity conversion](https://www.sec.gov/Archives/edgar/data/1513965/000119312519199793/d778127d8k.htm) — American Midstream Partners converted to Third Coast Midstream, LLC effective July 23, 2019, The legacy and current names belong within one canonical platform history
- [ArcLight 3C SPV regulatory identity and 2022 formation evidence](https://www.sec.gov/Archives/edgar/data/1940107/000194010722000001/xslFormDX01/primary_doc.xml) — The first-sale date is not treated as the exact PortCo closing date, The fund offering's first sale occurred in July 2022, The regulatory issuer name is ArcLight 3C SPV, L.P.
- [Current J.P. Morgan-advised ownership evidence](https://www.third-coast.com/copy-of-board-of-directors) — A J.P. Morgan Asset Management Infrastructure Investments Group principal advises an investment vehicle that owns Third Coast, The principal represents that vehicle's shareholders on Third Coast's current board
- [Subsequent-exit search](https://www.third-coast.com/news-and-announcements) — Current company announcements through May 2026 concern operations, leasing and debt rather than a platform equity transfer
- [J.P. Morgan/IIF transaction closing and stake-scope limitation](https://www.third-coast.com/post/third-coast-midstream-completes-sale-of-significant-minority-interest) — The Lighthouse percentage is not an exact current percentage of the canonical parent platform, The approximately 50% disclosed interest applied to Lighthouse Super Holdings, LLC, The minority transaction closed June 7, 2021
- [Current parent/opco relationship, active operations and disclosed scale](https://www.third-coast.com/post/third-coast-term-loan-b-announcement) — The company remained operational and financed in May 2026, The disclosed platform included approximately 1,900 pipeline miles, one gas processing plant and interests in four floating production systems, Third Coast Super Holdings wholly owns Third Coast Infrastructure, LLC

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
