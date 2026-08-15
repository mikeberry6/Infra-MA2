# PortCo proposal — Sequitur

- Task: 84 (ledger:0084:sequitur:dadaff66)
- As of: 2026-08-15
- Actions: CORRECT_COMPANY
- Proposal SHA-256: 2631f5388204b4c0de09197b4f8605f2f7c11bbdacb4705423bf4d7fed775c7c
- Production snapshot SHA-256: aa90c425373ba5d7d2d09d89c6fee80e63742c1856a43987cbec4dadacc4bec8
- Current company snapshot SHA-256: a509f3086dad203c77088848cf65e0f60643bb71989ae522c1acc9c0a37d30c5
- After-image SHA-256: 01ba422955a92d13a3563345475dcda6f6dda0df815af919035c5e586ef064c6

## Recommendation

Correct the existing Sequitur Renewables record in place and map ArcLight's short census label Sequitur to that canonical company. ArcLight and company transaction materials identify Sequitur as Sequitur Renewables, LLC, so a new company would be duplicative. ArcLight's current portfolio still lists Sequitur as current, ArcLight's 2025 ESG report and direct GLEIF records attribute the company to ArcLight Energy Partners Fund VII, L.P., and no Sequitur-level exit or signed pending sale was identified through August 15, 2026. The initial five-project 185 MW PJM wind acquisition closed in October 2022; FERC and the PJM Market Monitor differ by one day, so only month precision is persisted. ArcLight's numeric platform stake, immediate legal holding vehicle, and operating headquarters are not publicly disclosed and remain null. The individual wind farms and Diablo Wind are assets beneath the one manager-level platform.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| ArcLight Capital Partners | ArcLight Energy Partners Fund VII, L.P. | — | — | 2022 | — | CLOSED_ACTIVE |

## Source holdings

- 012-arclight-capital:holding:015:sequitur

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

- [Canonical legal identity and formation](https://api.gleif.org/api/v1/lei-records/254900IHCZT8GGFOZW95) — Boston is a registered c/o ArcLight address rather than a proven operating headquarters, The active Delaware entity was created June 27, 2022, The legal name is Sequitur Renewables, LLC
- [Current Fund VII relationship](https://api.gleif.org/api/v1/lei-records/254900IHCZT8GGFOZW95/ultimate-parent-relationship) — An active ultimate-parent consolidation relationship with Fund VII began June 27, 2022, The relationship does not disclose an immediate legal vehicle or numeric stake
- [Exact fund legal identity](https://api.gleif.org/api/v1/lei-records/549300LD7O6QR7ZLUB34) — The fund entity is active, The legal fund name is ArcLight Energy Partners Fund VII, L.P.
- [Current manager portfolio status, short-name identity and exit check](https://arclight.com/investments/) — ArcLight lists Sequitur as a Current renewable investment, No ArcLight exit or pending Sequitur sale is shown, The manager uses the Sequitur short name
- [Fund attribution and infrastructure-strategy basis](https://arclight.com/wp-content/uploads/2025/10/2025-ArcLight-ESG-Report.pdf) — ArcLight attributes Sequitur to Fund VII, Sequitur is identified as a renewable infrastructure investment, The report defines Fund VII as ArcLight Energy Partners Fund VII, L.P.
- [Regulatory closing and asset evidence](https://mbrweb.ferc.gov/SearchMBRAssetAppendix/AssetAppendixDetails?AssetAppendixId=7715) — FERC reports subsequent consummation on October 31, 2022, The page identifies the initial operating wind assets, Together with the conflicting PJM date, the source supports October 2022 month precision
- [Current official identity and operating profile](https://sequiturrenewables.com/) — The company is a U.S. operating-wind platform, The official display name is Sequitur Renewables, The official website remained active through the verification date
- [Independent closing-date corroboration and conflict control](https://www.monitoringanalytics.com/reports/PJM_State_of_the_Market/2022/2022-som-pjm-sec3.pdf) — The PJM Market Monitor reports completion on October 30, 2022, Together with the conflicting FERC date, the source supports October 2022 month precision
- [Initial signed acquisition, platform establishment, geography and scale](https://www.prnewswire.com/news-releases/arclight-to-acquire-operating-pjm-windfarms-301596749.html) — ArcLight announced the acquisition agreement on August 1, 2022, Five operating Pennsylvania and West Virginia wind farms totaled 185 MW, The transaction established the Sequitur platform and remained subject to closing conditions
- [Canonical identity and California bolt-on boundary](https://www.prnewswire.com/news-releases/arclights-sequitur-platform-to-acquire-operating-california-wind-farm-301825282.html) — The acquisition was an addition to the existing Sequitur platform, The announcement identifies Sequitur Renewables, LLC as Sequitur, The operating California wind farm had been acquired by May 16, 2023

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
