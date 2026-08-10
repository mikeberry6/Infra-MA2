# first-002 — first review

Cutoff: 2026-08-07
Records: 24
Packet hash: `940657642569ecfda3ff2893d1af65e159cdf2407c23bc95ca0435da31f24f94`

Open every transaction and ownership source for every decision in this packet. Verify the universe disposition, parties, date, sector, region, transaction structure, acting principal, sponsor lineage, and authoritative scope. The bold recommended scope is the evidence-derived proposal under review; the original automation candidate is shown only for lineage and is not an approval.

Use the matching `.worksheet.json` file for the normal compact workflow. For each record, set `evidenceOpened` to `true`, choose `ACCEPT_RECOMMENDATION` or `EDITED_RECORD`, and add a substantive record-specific note. Replace the reviewer and timestamp placeholders and set every human-attestation value to `true`. The review command compiles the compact worksheet against this immutable packet and then routes it through the existing full review validator. The matching `.review.json` remains available for advanced edits and legal-transaction splits.

One named human may approve this evidence-backed batch only after opening every record's evidence. Only verified risk exceptions will be queued separately for second review.

## Packet summary

| ID | Target | **Recommended scope** | Original automation candidate *(not approval)* | Disposition | Second-review risks |
| --- | --- | --- | --- | --- | --- |
| INF-2026-182 | SiFi Networks America LLC | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-039 | Exolum | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| WB-2026-07-10-001 | Great Bay Renewables | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-08-07-011 | Maverick Water Group | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-125 | TAKKION | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-183 | Pembina Gas Infrastructure (PGI) | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-213 | Noble Environmental | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-030 | Utility Global | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-166 | Sedron Technologies | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-113 | Gate City Power / Gate City Renewable Fuels / JET | **DIRECT_FUND** | PORTFOLIO_COMPANY | KEEP | ACTUAL_MIXED_DIRECT_PORTFOLIO, BUNDLED_LEGAL_TRANSACTIONS |
| INF-2026-027 | Prospect Power | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-119 | Invenergy AMPCI Thermal Power (IATP) | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-03-017 | Volta Data Centres | **DIRECT_FUND** | DIRECT_FUND | KEEP | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| INF-2026-204 | TrueNoord | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-019 | Furukraft Wind Farm | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-05-16-005 | 132 MW Saxony Onshore Wind Portfolio | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-05-23-005 | 76 MWp Uruguay Solar Portfolio | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-007 | 730 MW US Solar & Wind Portfolio | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-133 | Plenitude (Eni) | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-202 | Rover Pipeline | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-10-011 | Sabey Data Center Properties | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-31-001 | California Solar & BESS Portfolio | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-198 | UGI PA Electric Utility | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-10-005 | NuGen C&I Solar Portfolio | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |

## Record worksheets

### 1. `INF-2026-182` — SiFi Networks America LLC

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | APG Asset Management (FUND; BUYER) |
| Sponsor lineage | APG Asset Management → APG Asset Management (ADVISER) |
| Date / sector / region | 2026-04-22 · Digital · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [County Times](https://countytimes.co.uk/news/26050380.mike-harris-firm-sifi-networks-america-sold-new-owners). Patrizia’s Smart City Infrastructure Fund — a partnership with Dutch pension investor APG — took over SiFi Networks America from co-founder Mike Harris’s Ubuntu Business Holdings, consolidating the FiberCity platform under its existing infrastructure backers. SiFi designs, builds and operates open-access municipal fiber networks across the US under its FiberCity model, with active deployments spanning California, Wisconsin and other markets. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; County Times's contemporaneous report identifies the parties and transaction terms used to classify SiFi Networks America LLC.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 2. `INF-2026-039` — Exolum

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | APG-managed infrastructure vehicle (FUND; SELLER) |
| Sponsor lineage | APG → APG-managed infrastructure vehicle (ADVISER) |
| Date / sector / region | 2026-01-20 · Midstream · Europe · Spain |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | APG sold its 10% investment in Exolum; a fund/institutional-owner exit is direct activity. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [APG](https://assetmanagement.apg.nl/publications/apg-has-sold-its-10-stake-in-exolum-to-a-consortium-led-by-banca-march-and-stoneshield-capital). APG Infrastructure announced the divestiture of its 10% equity stake in Exolum, a European liquid bulk storage and logistics company.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 3. `WB-2026-07-10-001` — Great Bay Renewables

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Apollo (FUND; SELLER) |
| Sponsor lineage | Apollo → Apollo (ADVISER) |
| Date / sector / region | 2026-07-10 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Altiusminerals](https://altiusminerals.com/_resources/press-releases/nr-20260710.pdf). Apollo Infrastructure Funds signed an agreement to sell their 50% membership interests in Great Bay Renewables to Northampton Capital Partners for approximately US$390 million. The divestiture transfers Apollo's stake in the renewable-energy royalty platform.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 4. `WB-2026-08-07-011` — Maverick Water Group

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Apollo (FUND; BUYER) |
| Sponsor lineage | Apollo → Apollo (ADVISER) |
| Date / sector / region | 2026-08-07 · Utilities · North America · Texas, United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Apollo](https://apollo.com/insights-news/pressreleases/2026/08/apollo-funds-acquire-maverick-water-group-3337935). Apollo-managed funds acquired Maverick Water Group from Crosstimbers-managed funds, with management retaining a minority stake. Maverick develops, owns and operates long-term contracted non-potable water systems for communities, data centers and industrial customers across Texas.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 5. `INF-2026-125` — TAKKION

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Apollo Global Management (FUND; SELLER) |
| Sponsor lineage | Apollo Global Management → Apollo Global Management (ADVISER) |
| Date / sector / region | 2026-03-13 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [GlobeNewsWire](https://globenewswire.com/news-release/2026/03/09/3251689/0/en/Siris-Agrees-to-Acquire-a-Majority-Stake-in-TAKKION-from-Apollo-Funds.html). Siris agreed to acquire a majority stake in TAKKION from funds managed by Apollo Global Management. TAKKION, founded in 2019 and headquartered in Centennial, Colorado, is the premier integrated logistics, O&M, and technical services provider to the renewable energy industry, comprising Transportation Partners & Logistics, Global Specialized Services, RENEW Energy, and Airway Services (approximately $600mm revenue in 2025). Siris plans to expand TAKKION's service offerings across wind, solar, battery, and transmission sectors.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 6. `INF-2026-183` — Pembina Gas Infrastructure (PGI)

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Apollo Global Management (FUND; BUYER) |
| Sponsor lineage | Apollo Global Management → Apollo Global Management (ADVISER); KKR → Apollo Global Management (ADVISER) |
| Date / sector / region | 2026-04-20 · Midstream · North America · Canada |
| Transaction structure | ACQUISITION / SALE / JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Apollo](https://apollo.com/insights-news/pressreleases/2026/04/apollo-funds-to-acquire-40-interest-in-pembina-gas-infrastructure-3279810). Apollo-managed funds agreed to acquire KKR’s 40% interest in Pembina Gas Infrastructure, with Pembina Pipeline retaining its 60% stake and existing governance unchanged; the deal is expected to close by the end of Q2 2026. PGI — formed as a JV between Pembina and KKR in 2022 — operates roughly 5 Bcf/d of processing capacity across 23 plants, ~3,900 km of gathering pipelines and ~330,000 bpd of NGL extraction serving Montney and Duvernay producers in Alberta and British Columbia.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 7. `INF-2026-213` — Noble Environmental

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Apollo Global Management (FUND; BUYER) |
| Sponsor lineage | Apollo Global Management → Apollo Global Management (ADVISER) |
| Date / sector / region | 2026-05-12 · Social Infra · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Apollo Global Management](https://ir.apollo.com/news-events/press-releases/detail/625/apollo-funds-acquire-majority-stake-in-noble-environmental). Apollo-managed funds acquired a majority interest in Noble Environmental, a vertically integrated waste-management platform headquartered in Pittsburgh. Noble provides waste collection, hauling, transfer and disposal services and operates renewable natural gas facilities at landfill gas locations.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 8. `INF-2026-030` — Utility Global

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Ara Partners (FUND; BUYER) |
| Sponsor lineage | Ara Partners → Ara Partners (ADVISER); APG Asset Management → Ara Partners (ADVISER) |
| Date / sector / region | 2026-02-17 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / CAPITAL_RAISE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Utility Global](https://utilityglobal.com/utility-global-announces-100-million-first-close-of-series-d-financing-to-deploy-its-economic-industrial-decarbonization-platform-globally). Ara Partners and APG Asset Management co-led a description: 00mm first close of Utility Global's Series D financing to deploy its economic industrial decarbonization platform globally.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 9. `INF-2026-166` — Sedron Technologies

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Ara Partners (FUND; BUYER) |
| Sponsor lineage | Ara Partners → Ara Partners (ADVISER) |
| Date / sector / region | 2026-04-08 · Social Infra · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Ara Partners](https://arapartners.com/news/ara-partners-announces-up-to-500-million-investment-in-sedron-to-scale-waste-upcycling-technology). Ara committed up to $500mm to Sedron Technologies to scale infrastructure that converts wastewater and organic waste streams into reusable resources and clean electricity. The investment reflects continuing sponsor interest in circular infrastructure platforms with both environmental services and energy outputs.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 10. `INF-2026-113` — Gate City Power / Gate City Renewable Fuels / JET

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Ara-managed funds and co-investment vehicles (CO_INVESTMENT_VEHICLE; INVESTOR) |
| Sponsor lineage | Ara-managed funds and co-investment vehicles → Ara-managed funds and co-investment vehicles (ADVISER) |
| Date / sector / region | 2026-03-11 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | ACTUAL_MIXED_DIRECT_PORTFOLIO, BUNDLED_LEGAL_TRANSACTIONS |
| Scope rationale | Ara Energy is the operating buyer, identified Ara-managed funds/co-investment vehicles provide acquisition equity, and Ara Infrastructure participates in the JET acquisition. The release expressly describes multiple transactions covering Gate City Power, Gate City Renewable Fuels, and a JET interest. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [PR Newswire](https://prnewswire.com/news-releases/ara-energy-to-acquire-gate-city-power-gate-city-renewable-fuels-and-interest-in-jet-retail-network-for-875-million-302709985.html). Ara Energy, a portfolio platform of Ara Partners, agreed to acquire Gate City Power, Gate City Renewable Fuels, and an interest in the JET retail network from HF Capital for approximately $875mm. Gate City Power owns thermal generation assets totaling approximately 2.2 GW across NYISO and ISO-NE, while Gate City Renewable Fuels comprises U.S. ethanol production assets; the JET retail network will be acquired in partnership with Ara Infrastructure.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [prnewswire](https://www.prnewswire.com/news-releases/ara-energy-to-acquire-gate-city-power-gate-city-renewable-fuels-and-interest-in-jet-retail-network-for-875-million-302709954.html). The contemporaneous primary source establishes the Ara entities' roles and fund lineage.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 11. `INF-2026-027` — Prospect Power

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | ArcLight Capital (FUND; BUYER) |
| Sponsor lineage | ArcLight Capital → ArcLight Capital (ADVISER); IFM → ArcLight Capital (ADVISER) |
| Date / sector / region | 2026-01-15 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Business Wire](https://businesswire.com/news/home/20260115405115/en/Elevate-Acquires-Prospect-Power-Storage-a-150-MW-Battery-Asset-in-Northern-Virginia). ArcLight Capital acquired the Prospect Power 150 MW battery energy storage system from IFM.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 12. `INF-2026-119` — Invenergy AMPCI Thermal Power (IATP)

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | ArcLight Capital (FUND; BUYER) |
| Sponsor lineage | ArcLight Capital → ArcLight Capital (ADVISER); InfraBridge (DigitalBridge) → ArcLight Capital (ADVISER) |
| Date / sector / region | 2026-03-11 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Business Wire](https://businesswire.com/news/home/20260311462798/en/ArcLight-to-Acquire-InfraBridges-50-Stake-in-5.4-GW-Power-Portfolio). ArcLight Capital Partners signed a definitive agreement to acquire InfraBridge's (DigitalBridge) 50% stake in Invenergy AMPCI Thermal Power, a diversified portfolio of 11 power infrastructure assets totaling approximately 5.4 GW of generation capacity across seven North American markets. Invenergy will retain its existing ownership interest and continue managing operations of the portfolio, which includes highly efficient combined-cycle facilities such as Grays Harbor (WA), Nelson (IL), Lackawanna (PA), and St. Clair (ON).

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 13. `WB-2026-07-03-017` — Volta Data Centres

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Arcus European Infrastructure Fund 4 (FUND; BUYER) |
| Sponsor lineage | Arcus European Infrastructure Fund 4 → Arcus European Infrastructure Fund 4 (ADVISER) |
| Date / sector / region | 2026-07-02 · Digital · Europe · United Kingdom |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| Scope rationale | The named buyer is Arcus European Infrastructure Fund 4 and the disclosed seller is operating platform Verne. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Verne](https://verne.co/news/news-arcus-and-verne-announce-agreement-for-arcus-to-acquire-volta-data-centres). Arcus European Infrastructure Fund 4 entered a definitive agreement to acquire Volta from Verne.
- **PRIMARY · OWNERSHIP** — [verne](https://verne.co/about-us/sustainability). Verne's corporate history records Ardian's 2024 acquisition and its 2026 Volta divestment.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 14. `INF-2026-204` — TrueNoord

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Arcus Infrastructure Partners-managed vehicle (ADVISED_VEHICLE; BUYER) |
| Sponsor lineage | Arcus Infrastructure Partners → Arcus Infrastructure Partners-managed vehicle (ADVISER) |
| Date / sector / region | 2026-04-30 · Transportation · Europe · Global |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | Arcus's advised investment vehicle is the principal buyer of the majority stake, so the acquisition is direct fund activity. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [TrueNoord](https://truenoord.com/truord-announces-new-majority-investor-as-it-accelerates-growth-strategy). TrueNoord states that Arcus Infrastructure Partners entered definitive documentation to acquire about 74%, while Freshstream reinvests and prior fund investors exit.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 15. `INF-2026-019` — Furukraft Wind Farm

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Ardian (FUND; BUYER) |
| Sponsor lineage | Ardian → Ardian (ADVISER) |
| Date / sector / region | 2026-01-20 · Power & ET · Europe · Sweden |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Energy Global](https://energyglobal.com/wind/21012026/ardian-acquires-62-mw-furukraft-wind-farm-from-erg). Ardian announced the acquisition of the 62 MW Furukraft Wind Farm in Sweden from ERG. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; Energy Global's contemporaneous report identifies the parties and transaction terms used to classify Furukraft Wind Farm.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 16. `WB-2026-05-16-005` — 132 MW Saxony Onshore Wind Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Ardian (FUND; BUYER) |
| Sponsor lineage | Ardian → Ardian (ADVISER) |
| Date / sector / region | 2026-05-22 · Power & ET · Europe · Germany |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Ardian](https://ardian.com/news-insights/press-releases/ardian-clean-energy-evergreen-fund-aceef-enters-german-renewables). Ardian Clean Energy Evergreen Fund acquired a greenfield onshore wind project portfolio in Saxony totaling 132 MW once constructed. The deal is ACEEF's first German investment and anchors a broader renewables platform in Europe's largest renewable-energy market.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 17. `WB-2026-05-23-005` — 76 MWp Uruguay Solar Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Ardian (FUND; BUYER) |
| Sponsor lineage | Ardian → Ardian (ADVISER) |
| Date / sector / region | 2026-05-29 · Power & ET · Latin America · Uruguay |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Ardian](https://ardian.com/news-insights/press-releases/ardian-clean-energy-evergreen-fund-aceef-enters-uruguayan-renewables). Ardian Clean Energy Evergreen Fund acquired two operating solar PV plants in Uruguay with a combined capacity of 76 MWp. The assets mark ACEEF’s entry into Uruguay and expand Ardian’s Latin American renewable-power footprint, with AGR-AM managing the portfolio.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 18. `INF-2026-007` — 730 MW US Solar & Wind Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Ares Management (FUND; BUYER) |
| Sponsor lineage | Ares Management → Ares Management (ADVISER) |
| Date / sector / region | 2026-01-13 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [ENGIE North America](https://engie-na.com/engie-expands-ares-partnership-730mw-renewables). Ares Management acquired a minority stake in a 730 MW portfolio of solar and wind assets in the United States.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 19. `INF-2026-133` — Plenitude (Eni)

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Ares Management (FUND; BUYER) |
| Sponsor lineage | Ares Management → Ares Management (ADVISER) |
| Date / sector / region | 2026-03-19 · Power & ET · Europe · Italy |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Eni](https://eni.com/en-IT/media/press-release/2026/03/eni-deconsolidates-plenitude-through-shareholding-reorganization.html). Eni announced a ~€1.5bn capital increase for Plenitude, with at least €1bn from Ares Management, as part of a shareholding reorganization to deconsolidate the renewables and retail energy platform.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 20. `INF-2026-202` — Rover Pipeline

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Ares Management (FUND; BUYER) |
| Sponsor lineage | Ares Management → Ares Management (ADVISER); Blackstone → Ares Management (ADVISER) |
| Date / sector / region | 2026-04-29 · Midstream · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Blackstone](https://blackstone.com/news/press/ares-acquires-stake-in-rover-pipeline-from-blackstone-energy-transition-partners-to-serve-growing-energy-demand-centers-across-north-america). Ares Infrastructure Opportunities acquired a 32.4% minority equity stake in the Rover Pipeline from funds managed by Blackstone Energy Transition Partners. The 700-mile transmission pipeline provides 3.425 Bcf/d of Appalachian Basin takeaway capacity to Midwest demand centers and remains substantially contracted under long-term agreements.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 21. `WB-2026-07-10-011` — Sabey Data Center Properties

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Ares Management (FUND; BUYER) |
| Sponsor lineage | Ares Management → Ares Management (ADVISER) |
| Date / sector / region | 2026-07-10 · Digital · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [GlobeNewswire](https://globenewswire.com/news-release/2026/07/08/3324085/0/en/sabey-data-center-properties-welcomes-strategic-investment-from-ares-strengthening-platform-for-continued-growth.html). Ares Secondaries funds made a minority equity investment in Sabey Data Center Properties. The U.S. platform spans six energized campuses with approximately 251 MW of operating capacity and more than four million square feet of mission-critical space.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 22. `WB-2026-07-31-001` — California Solar & BESS Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Ares-managed infrastructure vehicle (ADVISED_VEHICLE; BUYER) |
| Sponsor lineage | Ares → Ares-managed infrastructure vehicle (ADVISER) |
| Date / sector / region | 2026-07-31 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | Ares-managed capital agreed to acquire the 80% California solar-and-storage portfolio interest directly. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Edpr Investors](https://edpr-investors.com/en/investor-information/market-notifications/edpr-signs-asset-rotation-deal-384-mw-solar-and-storage). Ares agreed to acquire an 80% common-equity interest in a California portfolio totaling 384 MW, comprising 200 MW of solar and 184 MW of battery storage. EDPR reported an approximately US$800mm enterprise value and US$450mm of expected proceeds.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 23. `INF-2026-198` — UGI PA Electric Utility

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Argo Infrastructure Partners (FUND; BUYER) |
| Sponsor lineage | Argo Infrastructure Partners → Argo Infrastructure Partners (ADVISER) |
| Date / sector / region | 2026-04-29 · Utilities · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [UGI Utilities](https://ugi.reportablenews.com/pr/ugi-utilities-and-argo-infrastructure-partners-reach-agreement-on-purchase-and-sale-of-ugi-s-pa-electric-utility). Argo Infrastructure Partners reached a definitive agreement to acquire UGI Utilities’ Electric Division for approximately $470mm. The regulated electric utility operates roughly 2,700 miles of transmission and distribution lines and 14 substations in Pennsylvania’s Luzerne and Wyoming counties, representing Argo’s fourth utility investment in the state.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 24. `WB-2026-07-10-005` — NuGen C&I Solar Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Argo Infrastructure Partners (FUND; BUYER) |
| Sponsor lineage | Argo Infrastructure Partners → Argo Infrastructure Partners (ADVISER) |
| Date / sector / region | 2026-07-10 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [PR Newswire](https://prnewswire.com/news-releases/argo-infrastructure-partners-acquires-solar-portfolio-from-and-establishes-new-partnership-with-owner-developer-nugen-302822094.html). Argo acquired eight operating commercial and industrial solar sites from NuGen, including six in Massachusetts and two in New Jersey. The add-on expands Argo's distributed-solar platform to 196 sites and approximately 270 MW of operating capacity.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.
