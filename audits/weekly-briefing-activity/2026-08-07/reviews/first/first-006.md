# first-006 — first review

Cutoff: 2026-08-07
Records: 24
Packet hash: `f337113adfc6ac277a2a9614aeb8e785f7402a564bbe3113dcdca35ffc35542a`

Open every transaction and ownership source for every decision in this packet. Verify the universe disposition, parties, date, sector, region, transaction structure, acting principal, sponsor lineage, and authoritative scope. The bold recommended scope is the evidence-derived proposal under review; the original automation candidate is shown only for lineage and is not an approval.

Use the matching `.worksheet.json` file for the normal compact workflow. For each record, set `evidenceOpened` to `true`, choose `ACCEPT_RECOMMENDATION` or `EDITED_RECORD`, and add a substantive record-specific note. Replace the reviewer and timestamp placeholders and set every human-attestation value to `true`. The review command compiles the compact worksheet against this immutable packet and then routes it through the existing full review validator. The matching `.review.json` remains available for advanced edits and legal-transaction splits.

One named human may approve this evidence-backed batch only after opening every record's evidence. Only verified risk exceptions will be queued separately for second review.

## Packet summary

| ID | Target | **Recommended scope** | Original automation candidate *(not approval)* | Disposition | Second-review risks |
| --- | --- | --- | --- | --- | --- |
| WB-2026-07-17-007 | EcoEridania | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-06-13-005 | Illinois Community Solar Portfolio | **PORTFOLIO_COMPANY** | UNRESOLVED | KEEP | None |
| INF-2026-117 | Steel River Solar and Storage Project | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-05-23-008 | Lexington Data Center Campus | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-162 | DataBank / Goodman Los Angeles JV (32 MW) | **PORTFOLIO_COMPANY** | DIRECT_FUND | KEEP | None |
| INF-2026-188 | Spire Mississippi | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-015 | Duffy BESS Project | **PORTFOLIO_COMPANY** | UNRESOLVED | KEEP | None |
| WB-2026-08-07-004 | Verdant Energy / Aura Power | **DIRECT_FUND** | DIRECT_FUND | KEEP | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| WB-2026-06-13-011 | Ansan Data Center Site / SEL5 | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-085 | 83MW Indian Solar Energy Projects | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-016 | EQUANS Infra & Mobility | **DIRECT_FUND** | DIRECT_FUND | RECLASSIFY | None |
| INF-2026-159 | Selected Data Center Assets from NEC Corporation | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-05-16-009 | Equans Infra & Mobility / Velian | **DIRECT_FUND** | DIRECT_FUND | MERGE_DUPLICATE | None |
| WB-2026-07-03-014 | Nippon Gateway Infrastructure | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-122 | Dandelion Partnership | **PORTFOLIO_COMPANY** | DIRECT_FUND | KEEP | None |
| INF-2026-107 | Maaselänkangas Onshore Wind Farm | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-048 | Corelink Rail Infrastructure | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-081 | Cleanwatts | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-051 | Norwegian Travel Assets | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-114 | TPI Composites (Wind Blade Manufacturing) | **DIRECT_FUND** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-090 | Skellefteå Data Center Site | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-05-23-006 | Stoneworthy BESS Project | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-07-03-003 | Dion BESS | **PORTFOLIO_COMPANY** | DIRECT_FUND | KEEP | None |
| INF-2026-178 | FPH2’s Los Angeles County Renewable Hydrogen Project | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |

## Record worksheets

### 1. `WB-2026-07-17-007` — EcoEridania

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | CVC DIF (FUND; SELLER) |
| Sponsor lineage | CVC DIF → CVC DIF (ADVISER); iCON Infrastructure → CVC DIF (ADVISER) |
| Date / sector / region | 2026-07-17 · Social Infra · Europe · Italy |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Cvc](https://cvc.com/media/news/2026/cvc-dif-to-acquire-a-majority-stake-in-ecoeridania). CVC DIF agreed to acquire a majority stake in EcoEridania through DIF Infrastructure VIII, including the indirect purchase of iCON’s 75% interest. The integrated Italian waste platform served approximately 27,000 clients through 22 facilities and managed 1.3 million tons of waste in 2025.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 2. `WB-2026-06-13-005` — Illinois Community Solar Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Cypress Creek Energy (OPERATING_PLATFORM; SELLER) |
| Sponsor lineage | EQT Infrastructure → Cypress Creek Energy (INDIRECT_OWNER) |
| Date / sector / region | 2026-06-12 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | Cypress Creek, an already-owned operating EQT platform, is the asset seller; the announcement does not identify EQT Infrastructure V as a seller or investor in this portfolio rotation. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Business Wire](https://businesswire.com/news/home/20260608197151/en/38-Degrees-North-Acquires-104-MW-Community-Solar-Portfolio-in-Illinois-from-Cypress-Creek). The parties' announcement states that Cypress Creek sold the 104 MW Illinois community-solar portfolio to 38 Degrees North.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [eqtgroup](https://eqtgroup.com/about/current-portfolio/cypress-creek). EQT identifies Cypress Creek as an operating energy platform held by EQT Infrastructure V since 2021 that develops, owns, and operates generation and storage assets.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 3. `INF-2026-117` — Steel River Solar and Storage Project

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Cypress Creek Renewables / Swift Current Energy (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | EQT Infrastructure (Cypress buyer side) / IFM Investors (Swift Current seller side) → Cypress Creek Renewables / Swift Current Energy (INDIRECT_OWNER) |
| Date / sector / region | 2026-03-10 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | Both disclosed transaction principals are operating platforms. Multiple sponsor sides and the word exit do not create a V2 risk. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [PR Newswire](https://prnewswire.com/news-releases/cypress-creek-acquires-2-5-gw-solar-project-with-2-9-gwh-energy-storage-in-development-in-arkansas-from-swift-current-energy-302711078.html). Cypress Creek Renewables, a portfolio company of EQT Infrastructure, acquired the Steel River solar and storage project in Northeast Arkansas from Swift Current Energy (backed by IFM Investors). The facility combines 2,450 MWdc (1,500 MWac) of solar generation with 2,900 MWh (720 MW) of battery storage across three equal phases, making it one of the largest solar and energy storage projects in the United States. The project is expected to be placed in service in 2029.
- **PRIMARY · OWNERSHIP** — [ccrenew](https://ccrenew.com/news/welcome-eqt-to-the-cypress-creek-team/). Cypress Creek identifies EQT as its owner.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [prnewswire](https://www.prnewswire.com/news-releases/cypress-creek-acquires-2-5-gw-solar-project-with-2-9-gwh-energy-storage-in-development-in-arkansas-from-swift-current-energy-302711078.html). Cypress Creek acquired Steel River from Swift Current.
- **PRIMARY · OWNERSHIP** — [swiftcurrentenergy](https://swiftcurrentenergy.com/swift-current-energy-welcomes-three-new-board-members/). Swift Current identifies IFM-managed funds as its majority owner.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 4. `WB-2026-05-23-008` — Lexington Data Center Campus

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | DartPoints (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | NOVA Infrastructure → DartPoints (INDIRECT_OWNER) |
| Date / sector / region | 2026-05-29 · Digital · North America · United States |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | DartPoints was an already-owned operating company/platform on 2026-05-29 and acted as the transaction buyer/investor. NOVA Infrastructure is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Dartpoints](https://dartpoints.com/press/lexington-kentucky-data-center-acquisition). NOVA-backed DartPoints acquired a Lexington, Kentucky data center campus spanning approximately 343,000 square feet on 29.5 acres, including about 81,000 square feet of existing raised-floor data center space and an owned on-site substation. The campus has a 20-30 MW initial path and longer-term expansion potential to 70 MW for AI, neo-cloud, hyperscale, and enterprise workloads.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 5. `INF-2026-162` — DataBank / Goodman Los Angeles JV (32 MW)

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | DataBank (OPERATING_PORTFOLIO_COMPANY; JOINT_VENTURE) |
| Sponsor lineage | Swiss Life Asset Managers → DataBank (INDIRECT_OWNER); IMCO → DataBank (INDIRECT_OWNER); AustralianSuper → DataBank (INDIRECT_OWNER) |
| Date / sector / region | 2026-04-08 · Digital · North America · United States |
| Transaction structure | JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | The primary announcement says DataBank and Goodman formed the 50/50 development JV; it does not identify DataBank's infrastructure shareholders as transacting principals. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Goodman](https://goodman.com/investor-centre/announcements-media/2026/databank-and-goodman-group-partner-to-open-new-landmark-data-center-in-los-angeles). DataBank and Goodman formed a 50/50 joint venture to develop a 32 MW AI-ready data center in Vernon, California. The arrangement advances sponsor-backed digital infrastructure development in a supply-constrained Los Angeles market and adds to DataBank’s broader U.S. expansion pipeline.
- **PRIMARY · OWNERSHIP** — [databank](https://www.databank.com/about-us/). Use the cited contemporaneous transaction/ownership statement to document date-valid sponsor lineage; confirm legal entity name during human review.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 6. `INF-2026-188` — Spire Mississippi

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Delta Utilities (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Bernhard Capital Partners → Delta Utilities (INDIRECT_OWNER) |
| Date / sector / region | 2026-04-21 · Utilities · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | Delta Utilities was an already-owned operating company/platform on 2026-04-21 and acted as the transaction buyer/investor. Bernhard Capital Partners is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [PR Newswire](https://prnewswire.com/news-releases/spire-announces-sale-of-its-mississippi-natural-gas-business-to-delta-utilities-for-75-million-302749447.html). Bernhard-backed Delta Utilities agreed to acquire Spire’s Mississippi local distribution company for $75mm in cash — representing a 1.4x multiple of 2025 rate base — with closing targeted for fiscal Q1 2027 subject to Mississippi PSC approval. Spire Mississippi operates approximately 745 miles of distribution pipelines serving roughly 18,000 customers in south-central Mississippi including Hattiesburg; Spire will redeploy proceeds into infrastructure investments across its Alabama, Missouri and Tennessee gas utilities.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 7. `INF-2026-015` — Duffy BESS Project

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | DESRI (OPERATING_PLATFORM; INVESTOR) |
| Sponsor lineage | Macquarie Asset Management-managed funds → DESRI (INDIRECT_OWNER); D. E. Shaw group → DESRI (INDIRECT_OWNER) |
| Date / sector / region | 2026-02-18 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / CAPITAL_RAISE |
| Independent second-review risks | None |
| Scope rationale | DESRI itself signed and provided the preferred equity. Primary ownership evidence describes DESRI as a pre-existing Macquarie-backed renewable-energy company that develops, owns, and operates projects; no MAM fund vehicle is a party to this financing. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [PR Newswire](https://prnewswire.com/news-releases/desri-and-linea-announce-signing-of-preferred-equity-financing-for-duffy-bess-in-matagorda-county-tx-302691795.html). DESRI provided preferred equity financing to Linea Energy for the Duffy battery energy storage system project in Matagorda County, Texas.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [macquarie](https://www.macquarie.com/ae/en/about/news/2025/desri-and-macquarie-asset-management-announce-closing-of-an-investment-in-desri.html). Macquarie Asset Management states that several MAM-managed funds completed a significant minority investment in DESRI before the Duffy financing and describes DESRI as a renewable-energy company that develops, owns, and operates projects.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 8. `WB-2026-08-07-004` — Verdant Energy / Aura Power

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | DIF Infrastructure VII (FUND; INVESTOR) |
| Sponsor lineage | DIF Infrastructure VII → DIF Infrastructure VII (ADVISER) |
| Date / sector / region | 2026-08-06 · Power & ET · Europe · United Kingdom |
| Transaction structure | ACQUISITION |
| Independent second-review risks | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| Scope rationale | Verdant and Aura Power merge as operating companies while CVC DIF expressly makes its transaction investment through DIF Infrastructure VII. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Cvcdif](https://cvcdif.com/news-insights/verdant-energy-and-aura-power-merge-to-create-leading-uk-solar-and-battery-storage-platform). The release identifies Verdant as CVC DIF-backed, the DIF VII investment, and Aura's retained and exiting shareholders.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 9. `WB-2026-06-13-011` — Ansan Data Center Site / SEL5

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Digital Edge (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Stonepeak → Digital Edge (INDIRECT_OWNER) |
| Date / sector / region | 2026-06-12 · Digital · Asia-Pacific · South Korea |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Digital Edge was an already-owned operating company/platform on 2026-06-12 and acted as the transaction buyer/investor. Stonepeak is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [PR Newswire](https://prnewswire.com/apac/news-releases/digital-edge-secures-fully-powered-ansan-data-center-site-in-power-constrained-south-korea-advancing-expansion-302793521.html). Stonepeak-backed Digital Edge secured a fully powered land parcel in Ansan, South Korea for its planned SEL5 data center. The site supports a 60 MW development in a power-constrained market and expands Digital Edge’s Seoul-area data-center pipeline.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 10. `INF-2026-085` — 83MW Indian Solar Energy Projects

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Digital Edge India (OPERATING_PORTFOLIO_COMPANY; INVESTOR) |
| Sponsor lineage | Stonepeak → Digital Edge India (INDIRECT_OWNER) |
| Date / sector / region | 2026-02-28 · Power & ET · Asia-Pacific · India |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | The PPA and minority stake are integrated components of one captive-user energy arrangement. The record counts the equity activity; the PPA is ancillary rather than a separately included M&A transaction. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [digitaledgedc.com](https://www.digitaledgedc.com/cn/resources/newsroom/digital-edge-india-83mw-solar-ppa-recycled-water-data-center/). Acquirer's announcement confirming the PPA and minority equity stake; archive link was a placeholder.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [digitaledgedc](https://www.digitaledgedc.com/resources/newsroom/digital-edge-india-83mw-solar-ppa-recycled-water-data-center/). The transaction release identifies Digital Edge as Stonepeak-backed.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 11. `INF-2026-016` — EQUANS Infra & Mobility

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **RECLASSIFY** |
| Acting entity | DigitalBridge (FUND; BUYER) |
| Sponsor lineage | DigitalBridge → DigitalBridge (ADVISER) |
| Date / sector / region | 2026-01-27 · Transportation · Europe · Netherlands |
| Transaction structure | JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | EU Case M.12329 and the completion release identify Aberdeen and DigitalBridge as acquirers. The operating business is EV-charging/mobility infrastructure, so Transportation is the supported sector; the seed's Power/JV treatment is incorrect. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [EU Official Journal (Case M.12329)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML?uri=OJ%3AC_202600769). DigitalBridge acquired a joint venture stake in EQUANS Infra & Mobility B.V. in the Netherlands.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 12. `INF-2026-159` — Selected Data Center Assets from NEC Corporation

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | DigitalBridge (FUND; BUYER) |
| Sponsor lineage | DigitalBridge → DigitalBridge (ADVISER) |
| Date / sector / region | 2026-04-01 · Digital · Asia-Pacific · Japan |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [DigitalBridge](https://ir.digitalbridge.com/news-releases/news-release-details/digitalbridge-and-jexi-complete-acquisition-selected-data-center). DigitalBridge and JEXI completed the acquisition of selected NEC data-center assets in the Greater Tokyo and Kansai regions. The assets will operate as a new standalone platform, with NEC retained as anchor customer under contract as the business seeks to add third-party colocation demand.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 13. `WB-2026-05-16-009` — Equans Infra & Mobility / Velian

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **MERGE_DUPLICATE** |
| Acting entity | DigitalBridge (FUND; BUYER) |
| Sponsor lineage | DigitalBridge → DigitalBridge (ADVISER) |
| Date / sector / region | 2026-05-22 · Transportation · Europe · Netherlands |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The January EU merger notice and May completion/rebranding announcement describe the same Aberdeen Investments/DigitalBridge acquisition of Equans Infra & Mobility, subsequently named Velian. The May appearance is completion evidence, not a second legal transaction. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Ir](https://ir.digitalbridge.com/news-releases/news-release-details/aberdeen-investments-and-digitalbridge-acquire-equans-infra). A DigitalBridge-controlled vehicle and Aberdeen Investments acquired Equans' Dutch asset-based e-mobility activities, which will operate as Velian. The platform designs, finances, builds and operates public and private EV charging infrastructure for government, real estate and logistics customers in the Netherlands.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 14. `WB-2026-07-03-014` — Nippon Gateway Infrastructure

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | DigitalBridge (FUND; BUYER) |
| Sponsor lineage | DigitalBridge → DigitalBridge (ADVISER) |
| Date / sector / region | 2026-07-03 · Digital · Asia-Pacific · Japan |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Digitalbridge](https://digitalbridge.com/news/2026-07-01-digitalbridge-and-jexi-announce-formation-of-nippon-gateway-infrastructure-a-new-data-center-platform-in-japan). DigitalBridge and JEXI formed Nippon Gateway Infrastructure, a new Japanese colocation data-center platform. NGI launched with data-center assets acquired from NEC and is positioned for Japan's digital infrastructure demand.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 15. `INF-2026-122` — Dandelion Partnership

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Diverso Energy (OPERATING_PORTFOLIO_COMPANY; JOINT_VENTURE) |
| Sponsor lineage | CVC DIF → Diverso Energy (INDIRECT_OWNER) |
| Date / sector / region | 2026-03-12 · Power & ET · North America · United States |
| Transaction structure | JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | Diverso Energy, an already-owned CVC DIF portfolio company, announced and executed the Dandelion partnership; CVC DIF is identified only as ownership/capitalization context. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Newswire](https://newswire.ca/news-releases/diverso-energy-and-dandelion-energy-partner-to-accelerate-geothermal-deployment-across-u-s-housing-markets-841957958.html). Diverso Energy, backed by CVC DIF, announced a strategic partnership with Dandelion Energy to accelerate geothermal heat pump deployment across U.S. housing markets.
- **PRIMARY · OWNERSHIP** — [newswire](https://www.newswire.ca/news-releases/diverso-energy-and-dandelion-energy-partner-to-accelerate-geothermal-deployment-across-u-s-housing-markets-841957958.html). Use the cited contemporaneous transaction/ownership statement to document date-valid sponsor lineage; confirm legal entity name during human review.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 16. `INF-2026-107` — Maaselänkangas Onshore Wind Farm

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | DWS European infrastructure investment strategy (ADVISED_VEHICLE; BUYER) |
| Sponsor lineage | DWS Infrastructure → DWS European infrastructure investment strategy (ADVISER) |
| Date / sector / region | 2026-03-08 · Power & ET · Europe · Finland |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | DWS acquired the wind farm on behalf of its European infrastructure investment strategy, making the advised capital the principal. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [DWS](https://dws.com/en-gb/our-profile/media/media-releases/dws-strengthens-infrastructure-portfolio). DWS Group acquired the Maaselänkangas onshore wind farm in Oulainen, Finland from wpd Group on behalf of its European infrastructure investment strategy. The facility comprises seven Nordex turbines with 41.3 MW of installed capacity, has been operational since September 2024, and is expected to generate approximately 128.6 GWh of annual net energy output.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 17. `INF-2026-048` — Corelink Rail Infrastructure

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | DWS Infrastructure and Infracapital managed vehicles (FUND; SELLER) |
| Sponsor lineage | DWS Infrastructure → DWS Infrastructure and Infracapital managed vehicles (ADVISER); Infracapital → DWS Infrastructure and Infracapital managed vehicles (ADVISER) |
| Date / sector / region | 2026-01-08 · Transportation · Asia-Pacific · Australia |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | DWS and Infracapital sold their ownership of Corelink; the disposition is a fund exit rather than an asset sale by Corelink. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [DC Advisory](https://dcadvisory.com/news-deals-insights/deal-announcements/dc-advisory-advises-dws-and-infracapital-on-the-sale-of-corelink-rail-infrastructure-limited). DWS Infrastructure announced the divestiture of Corelink Rail Infrastructure Limited in Australia.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 18. `INF-2026-081` — Cleanwatts

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | DWS infrastructure investment strategy (ADVISED_VEHICLE; BUYER) |
| Sponsor lineage | DWS Infrastructure → DWS infrastructure investment strategy (ADVISER) |
| Date / sector / region | 2026-02-28 · Power & ET · Europe · Portugal |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | DWS acquired Cleanwatts and committed growth capital through its infrastructure investment strategy; the fund capital is the acquiring principal. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [verdane.com](https://verdane.com/verdane-realises-investment-in-cleanwatts/). Seller announcement confirming DWS ownership and committed capital; archive link was a placeholder.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 19. `INF-2026-051` — Norwegian Travel Assets

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | DWS Infrastructure-managed strategy (ADVISED_VEHICLE; BUYER) |
| Sponsor lineage | DWS Infrastructure → DWS Infrastructure-managed strategy (ADVISER) |
| Date / sector / region | 2026-01-23 · Transportation · Europe · Norway |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | DWS-managed infrastructure capital acquired the carved-out Norwegian travel assets directly. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Longship](https://longship.no/pressemelding/longship-fund-i-exits-norwegian-travels-gondola-and-rail-operations-to-leading-european-infrastructure-investor). DWS Infrastructure completed a carve-out acquisition of Norwegian travel infrastructure assets including gondola and rail operations.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 20. `INF-2026-114` — TPI Composites (Wind Blade Manufacturing)

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | ECP Blade Holdings (NON_OPERATING_ACQUISITION_SPV; BUYER) |
| Sponsor lineage | Energy Capital Partners → ECP Blade Holdings (ADVISER) |
| Date / sector / region | 2026-03-09 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / SALE / CAPITAL_RAISE |
| Independent second-review risks | None |
| Scope rationale | ECP Blade Holdings is disclosed only as the purchaser formed/used for the Section 363 acquisition, not as an already-owned operating platform. Treating the acquisition vehicle as a portfolio company would violate the acquisition-SPV rule; classify DIRECT_FUND. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Sahm Capital](https://sahmcapital.com/news/content/tpi-composites-signs-section-363-sale-deal-with-ecp-blade-holdings-for-usd-20-million-2026-03-09). Energy Capital Partners, through ECP Blade Holdings, agreed to acquire TPI Composites' global wind blade manufacturing and services operations via a Section 363 bankruptcy sale for $20mm in cash plus assumed liabilities. TPI, the only independent wind blade manufacturer with a global footprint, filed for Chapter 11 and secured $82.5mm in DIP financing as it navigates the restructuring process. The transaction is subject to bankruptcy court approval, Oaktree lender consent, and regulatory approvals, with a drop-dead date of June 30, 2026.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [sec](https://www.sec.gov/Archives/edgar/data/1455684/000119312526097651/d86867dex101.htm). The asset purchase agreement names ECP Blade Holdings LLC as buyer and the TPI entities as sellers.
- **PRIMARY · OWNERSHIP** — [globenewswire](https://www.globenewswire.com/news-release/2026/07/06/3322665/0/en/tpi-composites-successfully-emerges-from-chapter-11-under-new-ownership-reaffirms-long-term-commitment-to-wind-energy-field-services-and-blade-manufacturing.html). TPI's emergence announcement confirms Energy Capital Partners' new ownership following the transaction.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 21. `INF-2026-090` — Skellefteå Data Center Site

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | EdgeConneX (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | EQT Infrastructure → EdgeConneX (INDIRECT_OWNER) |
| Date / sector / region | 2026-02-28 · Digital · Europe · Sweden |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | EdgeConneX was an already-owned operating company/platform on 2026-02-28 and acted as the transaction buyer/investor. EQT Infrastructure is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [edgeconnex.com](https://www.edgeconnex.com/news/press-releases/edgeconnex-looks-to-enter-swedish-market-as-part-of-european-data-center-expansion-strategy/). Acquirer's announcement, also present in the reviewed company source data; archive link was a placeholder.
- **PRIMARY · OWNERSHIP** — [edgeconnex](https://www.edgeconnex.com/news/press-releases/eqt-infrastructure-to-acquire-leading-global-data-center-provider-edgeconnex/). EdgeConneX announced EQT Infrastructure’s acquisition before the transaction.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 22. `WB-2026-05-23-006` — Stoneworthy BESS Project

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Eelpower Energy (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Equitix → Eelpower Energy (INDIRECT_OWNER); Aware Super → Eelpower Energy (INDIRECT_OWNER); UK National Wealth Fund → Eelpower Energy (INDIRECT_OWNER) |
| Date / sector / region | 2026-05-29 · Power & ET · Europe · United Kingdom |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Eelpower Energy was an already-owned operating company/platform on 2026-05-29 and acted as the transaction buyer/investor. Equitix / Aware Super / UK National Wealth Fund is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Renewablesnow](https://renewablesnow.com/news/eelpower-energy-buys-50-mw-battery-project-from-res-1295446). Eelpower Energy, the Equitix-led battery-storage platform backed with Aware Super and the UK National Wealth Fund, acquired the 50 MW / 100 MWh Stoneworthy BESS project in Devon from RES. Construction is slated to begin in 2027, with commercial operations planned for 2028.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 23. `WB-2026-07-03-003` — Dion BESS

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Eku Energy (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Macquarie Asset Management-managed fund → Eku Energy (INDIRECT_OWNER); BCI → Eku Energy (INDIRECT_OWNER) |
| Date / sector / region | 2026-07-03 · Power & ET · Europe · Germany |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | Eku Energy acquired the Dion development rights as its German market entry; Eku's own site confirms it is an operating company jointly owned by a MAM-managed fund and BCI. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Ekuenergy](https://ekuenergy.com/en/news-and-blogs/news-germany-market-entry). Eku Energy announced its German market entry through acquisition and development rights for the 400 MW / 1,600 MWh Dion battery storage project in Lamspringe. Eku is owned by BCI and a Macquarie Asset Management-managed fund.
- **PRIMARY · OWNERSHIP** — [ekuenergy](https://www.ekuenergy.com/aus/about/eku). Use the cited contemporaneous transaction/ownership statement to document date-valid sponsor lineage; confirm legal entity name during human review.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 24. `INF-2026-178` — FPH2’s Los Angeles County Renewable Hydrogen Project

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Elemental Clean Fuels (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Quinbrook Infrastructure → Elemental Clean Fuels (INDIRECT_OWNER) |
| Date / sector / region | 2026-04-22 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / CAPITAL_RAISE / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Elemental Clean Fuels was an already-owned operating company/platform on 2026-04-22 and acted as the transaction buyer/investor. Quinbrook Infrastructure is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [PR Newswire](https://prnewswire.com/news-releases/fph2-expands-california-renewable-hydrogen-supply-partnerships-to-support-public-fleets-data-infrastructure-and-energy-resilience-302746086.html). Elemental Clean Fuels will acquire one of FPH2’s priority renewable hydrogen projects in Los Angeles County and lead its development, financing and construction as part of its growing North American clean fuels platform. The solar-powered electrolytic facility is designed to supply zero-emission hydrogen to data centers, microgrids, hydrogen-capable turbines, transit fleets and port operations; Elemental is backed by Quinbrook following a strategic transaction closed in late 2025.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.
