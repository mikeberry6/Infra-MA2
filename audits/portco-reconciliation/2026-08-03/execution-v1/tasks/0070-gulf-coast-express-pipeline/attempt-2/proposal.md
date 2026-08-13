# PortCo proposal — Gulf Coast Express Pipeline

- Task: 70 (ledger:0070:gulf-coast-express-pipeline:5147d87a)
- As of: 2026-08-13
- Actions: CORRECT_COMPANY, ADD_OWNER, MERGE_COMPANIES
- Proposal SHA-256: 351959298d59bf4d85f584db7e7e4e72a9e71290b1ffae6e5f64d28ee5ab97cf
- Production snapshot SHA-256: 30d5035534b9fad19609b4dcb5ed70f7e49df3e2a2c1f1c0ef6b542e5175b5ad
- Current company snapshot SHA-256: 1e717e46d25a602669058eadfabc7dd53a83cc23e8310cabdd7e5f0cd971ee15
- After-image SHA-256: 2c56febce729547c41b99e88aa0f9ae8d9c729f8d78966c635faf53109802687

## Recommendation

Resolve Gulf Coast Express Pipeline, Gulf Coast Express Pipeline (GCX), Gulf Coast Express Pipeline LLC and Gulf Coast Express Pipeline LLC (GCX) as one legal operating company rather than separate platforms, while preserving the existing canonical production record and redirect. Correct the ownership ledger to Kinder Morgan's 34% operated interest and ArcLight-managed vehicles' aggregate 66% interest, comprising the 25% Targa tranche acquired in 2022, the 16% Kinetik tranche acquired in 2024 and the 25% Phillips 66 tranche acquired in 2025. ArcLight's ESG reporting attributes GCX to Fund VII, the Kinetik purchase agreement identifies AL GCX Co-Invest, L.P. and related acquisition entities, and current rating and transaction materials identify the 2025 tranche through AL GCX Fund VIII Holdings LLC. Retain Mubadala as a current co-investor because Mubadala lists GCX as a current real-assets holding and ArcLight identified Mubadala as its partner in the 2025 acquisition, but classify its undisclosed interest as nested within ArcLight's 2025 tranche and therefore not additive to the 100% ownership total. Add Kinder Morgan as the current 34% corporate co-owner and operator. Replace duplicate or weak milestone copy with distinct, sourced ownership and operating events while preserving every historical relation ID. GCX remains an active, approximately 500-mile Texas natural-gas transmission system with 2.59 Bcf/d of capacity following its June 2026 expansion. Current manager and operator materials show continuing ownership, and no GCX-specific sale or pending exit was identified through August 13, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| ArcLight Capital Partners | ArcLight Energy Partners Fund VII, L.P. | AL GCX Holdings LLC | 25% | 2022 | — | CLOSED_ACTIVE |
| ArcLight Capital Partners | — | AL GCX Co-Invest, L.P. (via GCX Pipeline, LLC and AL GCX Holdings LLC) | 16% | 2024 | — | CLOSED_ACTIVE |
| ArcLight Capital Partners | — | AL GCX Fund VIII Holdings LLC | 25% | 2025 | — | CLOSED_ACTIVE |
| Kinder Morgan, Inc. | — | Kinder Morgan Texas Pipeline LLC | 34% | 2017 | — | CLOSED_ACTIVE |
| Mubadala | — | Co-investment within ArcLight-led 2025 GCX acquisition (legal vehicle not publicly disclosed) | Not publicly disclosed; included within ArcLight's 25% 2025 GCX tranche and not additive to ArcLight-managed aggregate ownership | 2025 | — | CLOSED_ACTIVE |

## Source holdings

- 012-arclight-capital:holding:006:gulf-coast-express-pipeline

## Retired company records

- None

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| — | — | — | None |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| ledger:0479:gulf-coast-express-pipeline-gcx:80ffe67c | Gulf Coast Express Pipeline (GCX) | United States | 5a675a4a5cf898586bd42772d0042d5839cc86f035c30c0b248c0366f341f47b | 5a675a4a5cf898586bd42772d0042d5839cc86f035c30c0b248c0366f341f47b |
| ledger:0480:gulf-coast-express-pipeline-llc:9e2ebb7a | Gulf Coast Express Pipeline LLC | United States | bdb63318e8faf66cf2d7521c31793486018739cc3da68e8c1ae955e8b2f3c0bc | bdb63318e8faf66cf2d7521c31793486018739cc3da68e8c1ae955e8b2f3c0bc |

## Evidence

- [Current ArcLight portfolio status and exit search](https://arclight.com/investments/) — ArcLight currently lists GCX as an unrealized Strategic Gas investment with a 2022 investment date
- [Fund attribution and infrastructure-strategy basis](https://arclight.com/wp-content/uploads/2025/10/2025-ArcLight-ESG-Report.pdf) — ArcLight's 2025 ESG report lists GCX as a Strategic Gas investment of Fund VII
- [Phillips 66 sale announcement, stake, value and platform boundary](https://investor.phillips66.com/financial-information/news-releases/news-release-details/2024/Phillips-66-announces-agreement-to-sell-interest-in-Gulf-Coast-Express/default.aspx) — Phillips 66 agreed on December 16, 2024 to sell the entity owning its 25% GCX interest to an ArcLight affiliate for $865 million, Phillips 66 described GCX as an approximately 500-mile Texas pipeline
- [Original final investment decision, project scope and founding ownership](https://ir.kindermorgan.com/news/news-details/2017/Kinder-Morgan-DCP-Midstream-and-Targa-Resources-Announce-Final-Investment-Decision-on-Gulf-Coast-Express-Pipeline-Project/default.aspx) — The joint venture reached final investment decision on December 21, 2017, The project was backed by long-term binding transportation agreements
- [Original commercial-service date and contracted capacity](https://ir.kindermorgan.com/news/news-details/2019/Gulf-Coast-Express-Pipeline-Placed-in-Service-Ahead-of-Schedule/default.aspx) — GCX entered full commercial service on September 25, 2019, The pipeline was fully subscribed under long-term contracts
- [Altus option exercise and historical ownership change](https://ir.kindermorgan.com/news/news-details/2019/Kinder-Morgan-Declares-020-Dividend-and-Announces-Results-for-Fourth-Quarter-of-2018/default.aspx) — Altus Midstream exercised its option in December 2018 to acquire 15% of GCX, Kinder Morgan then held 35%, while DCP and Targa each held 25%
- [Expansion final investment decision](https://ir.kindermorgan.com/news/news-details/2024/Kinder-Morgan-Reports-Third-Quarter-2024-Financial-Results/default.aspx) — GCX reached final investment decision on August 30, 2024 for an approximately $455 million expansion, The project was designed to add 570 MMcf/d under binding long-term transportation agreements
- [Expansion closing milestone and current system capacity](https://ir.kindermorgan.com/news/news-details/2026/Kinder-Morgan-Reports-Second-Quarter-2026-Financial-Results/default.aspx) — The GCX expansion entered service on June 23, 2026, The expansion increased total system capacity to approximately 2.59 Bcf/d
- [ArcLight's 2024 acquisition close, stake and consideration](https://ir.kinetik.com/news/news-details/2024/Kinetik-Completes-Divestiture-of-Its-Equity-Interest-in-Gulf-Coast-Express-Pipeline/default.aspx) — Consideration was $510 million upfront plus a $30 million deferred payment, Kinetik completed the transfer of its 16% GCX interest to an ArcLight affiliate on June 4, 2024
- [Current ownership, operator, asset profile, geography and scale](https://www.kindermorgan.com/Operations/Natural-Gas/Index) — ArcLight is identified as the other equity holder, GCX is approximately 500 miles long with approximately 2.59 Bcf/d of capacity, Kinder Morgan currently owns 34% of GCX and operates the pipeline
- [Mubadala co-investor attribution in ArcLight's 2025 acquisition](https://www.linkedin.com/posts/arclight-capital-partners_infrastructure-datacenters-naturalgas-activity-7297604147405602816-xeoy) — ArcLight identified Mubadala as its partner in acquiring an interest in GCX in 2025
- [Current Mubadala holding and infrastructure classification](https://www.mubadala.com/en/what-we-do/gulf-coast-express) — Mubadala currently lists Gulf Coast Express as a U.S. infrastructure and real-assets investment
- [ArcLight's public completion announcement for the 2025 tranche](https://www.prnewswire.com/news-releases/arclight-announces-865-million-acquisition-of-strategic-pipeline-interest-302365746.html) — ArcLight publicly announced completion of its $865 million acquisition of a further 25% GCX interest on February 3, 2025
- [ArcLight's initial acquisition, stake, close date, value and infrastructure-strategy basis](https://www.prnewswire.com/news-releases/arclight-completes-acquisition-of-a-25-interest-in-the-gulf-coast-express-pipeline-301549622.html) — ArcLight completed its acquisition of Targa's 25% GCX interest on May 17, 2022, ArcLight described GCX as critical midstream infrastructure underpinned by long-term committed contracts, The purchase price was $857 million
- [Exact closing date and seller cash proceeds for ArcLight's 2025 tranche](https://www.sec.gov/Archives/edgar/data/1534701/000119312525075331/d909520dars.pdf) — Phillips 66 reported $853 million of cash proceeds, Phillips 66 sold its 25% GCX interest on January 30, 2025
- [Legal acquisition entities for ArcLight's 2024 tranche](https://www.sec.gov/Archives/edgar/data/1692787/000119312524137234/d829012dex102.htm) — The acquired interest was 16% of Gulf Coast Express Pipeline LLC, The agreement identifies GCX Pipeline, LLC as buyer, AL GCX Holdings LLC as borrower and AL GCX Co-Invest, L.P. as buyer parent
- [ArcLight aggregate ownership and 2025 acquisition-vehicle corroboration](https://www.spglobal.com/commodityinsights/en/market-insights/latest-news/natural-gas/011325-arclight-to-buy-additional-gulf-coast-express-stake-phillips-66-says) — ArcLight-managed interests aggregate 66% after the Phillips 66 acquisition while Kinder Morgan retains 34%, The 2025 acquisition tranche is associated with AL GCX Fund VIII Holdings LLC

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
