# first-003 — first review

Cutoff: 2026-08-07
Records: 24
Packet hash: `2f1fcaf204f33c249fcc47075460bc7f0c5b98ae2b7633876fe53cc214f1b158`

Open every transaction and ownership source for every decision in this packet. Verify the universe disposition, parties, date, sector, region, transaction structure, acting principal, sponsor lineage, and authoritative scope. The bold recommended scope is the evidence-derived proposal under review; the original automation candidate is shown only for lineage and is not an approval.

Use the matching `.worksheet.json` file for the normal compact workflow. For each record, set `evidenceOpened` to `true`, choose `ACCEPT_RECOMMENDATION` or `EDITED_RECORD`, and add a substantive record-specific note. Replace the reviewer and timestamp placeholders and set every human-attestation value to `true`. The review command compiles the compact worksheet against this immutable packet and then routes it through the existing full review validator. The matching `.review.json` remains available for advanced edits and legal-transaction splits.

One named human may approve this evidence-backed batch only after opening every record's evidence. Only verified risk exceptions will be queued separately for second review.

## Packet summary

| ID | Target | **Recommended scope** | Original automation candidate *(not approval)* | Disposition | Second-review risks |
| --- | --- | --- | --- | --- | --- |
| WB-2026-06-06-009 | LineoX | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-008 | ABIO | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-212 | Terrafame Sotkamo Electrical Grid Assets | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-075 | Skyline JV (Vantage Data Centers) | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-06-13-007 | Groupe Santé Sedna | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-137 | 174 MW Wind Portfolio (France) | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-209 | R.E.L.A.M. | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-08-07-014 | MBI | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-05-02-005 | BayWa r.e. Power Solutions | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-105 | Northview Energy | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-31-012 | Cube Highways Trust | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-006 | 381 MW Onshore Wind Portfolio | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-07-10-006 | Lemvig Biogas | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-101 | Naturgy Energy Group | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-31-008 | Meta El Paso Data Center Campus | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-041 | Alliance Technical Group | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-011 | Arlington Industries | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-042 | Urbaser | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-161 | Rowan Digital Infrastructure | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-190 | Eurowind Energy | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-06-06-004 | Mountain Peak / Canyon Peak Power | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-03-011 | Northern Virginia data centers | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-10-015 | Dresser Utility Solutions | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-31-016 | Kuwait Oil Pipeline Network | **DIRECT_FUND** | DIRECT_FUND | RECLASSIFY | None |

## Record worksheets

### 1. `WB-2026-06-06-009` — LineoX

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Asterion Industrial Infra Fund I (FUND; SELLER) |
| Sponsor lineage | Asterion Industrial Partners → Asterion Industrial Infra Fund I (ADVISER) |
| Date / sector / region | 2026-06-05 · Digital · Europe · Spain |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | The sources attribute the sale to Asterion's fund side and expressly exclude operating company Axion as a transaction participant, so this is a direct fund exit. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Telefonica](https://telefonica.com/en/communication-room/press-room/telefonica-reaches-agreement-to-acquire-rural-microwave-backhauling-platform-lineox-from-asterion). Telefonica states that it agreed to acquire LineoX from Asterion's investment perimeter.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [axion](https://www.axion.es/en/asterion-industrial-partners-reaches-agreement-to-sell-lineox-leading-rural-backhaul-platform-to-telefonica/). Axion states that Asterion reached the sale agreement and expressly says Axion continues operating normally and is not involved in the transaction.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 2. `INF-2026-008` — ABIO

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Asterion Industrial Partners (FUND; BUYER) |
| Sponsor lineage | Asterion Industrial Partners → Asterion Industrial Partners (ADVISER) |
| Date / sector / region | 2026-01-14 · Power & ET · Europe · Spain |
| Transaction structure | PLATFORM_FORMATION / CAPITAL_RAISE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Asterion Industrial Partners](https://asterionindustrial.com/asterion-to-invest-e1-5-bn-into-european-biomethane). Asterion Industrial Partners committed significant growth equity to scale its ABIO (Asterion Bioenergy) pan-European biomethane platform.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 3. `INF-2026-212` — Terrafame Sotkamo Electrical Grid Assets

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Aurora Infrastructure (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Equitix → Aurora Infrastructure (INDIRECT_OWNER) |
| Date / sector / region | 2026-05-12 · Utilities · Europe · Finland |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Aurora Infrastructure was an already-owned operating company/platform on 2026-05-12 and acted as the transaction buyer/investor. Equitix is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Aurora Infrastructure](https://aurorainfrastructure.com/news-insights/2026/05/aurora-infrastructure-to-acquire-terrafames-high-and-medium-voltage-electrical-grid-assets). Aurora Infrastructure entered into a strategic partnership with Terrafame by acquiring the high- and medium-voltage electrical grid assets at Terrafame's Sotkamo industrial site in Finland. The transaction is structured as a buy-and-lease-back arrangement supporting industrial-site power infrastructure.
- **PRIMARY · OWNERSHIP** — [aurorainfrastructure](https://aurorainfrastructure.com/news-insights/2026/05/aurora-infrastructure-to-acquire-terrafames-high-and-medium-voltage-electrical-grid-assets/). Aurora’s primary transaction release identifies the operating buyer and its Equitix majority ownership.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 4. `INF-2026-075` — Skyline JV (Vantage Data Centers)

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Aware Super (ADVISED_VEHICLE; BUYER) |
| Sponsor lineage | Aware Super → Aware Super (ADVISER); DigitalBridge → Aware Super (ADVISER) |
| Date / sector / region | 2026-01-20 · Digital · Asia-Pacific · United States |
| Transaction structure | ACQUISITION / SALE / JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [DigitalBridge](https://digitalbridge.com/news/2026-01-20-aware-super-extends-digital-infrastructure-footprint-with-us-300-million-apac-data-centre-business-investment). DigitalBridge announced the sale of a minority stake in the Skyline JV associated with Vantage Data Centers.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 5. `WB-2026-06-13-007` — Groupe Santé Sedna

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Axium Infrastructure (FUND; BUYER) |
| Sponsor lineage | Axium Infrastructure → Axium Infrastructure (ADVISER) |
| Date / sector / region | 2026-06-12 · Social Infra · North America · Canada |
| Transaction structure | JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [LinkedIn](https://linkedin.com/posts/ken-brooks_eycanada-eyparthenon-shapethefuturewithconfidence-activity-7470473843157929984-Sbp). An Axium-managed fund made a new equity investment in Groupe Santé Sedna, a Canadian healthcare and social-services platform. Advisor materials identified a June 11 closing, and the transaction was treated as in-period despite a prior Competition Bureau reference. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; LinkedIn's contemporaneous report identifies the parties and transaction terms used to classify Groupe Santé Sedna.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 6. `INF-2026-137` — 174 MW Wind Portfolio (France)

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Axium Infrastructure Europe (FUND; BUYER) |
| Sponsor lineage | Axium Infrastructure Europe → Axium Infrastructure Europe (ADVISER) |
| Date / sector / region | 2026-03-20 · Power & ET · Europe · France |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Axium Infrastructure](https://axiuminfra.com/2026/03/20/le-20-mars-2026-axium-infrastructure-europe-acquiert-une-participation-dans-un-portefeuille-eolien-en-exploitation-de-174-mw-en-france). Axium Infrastructure Europe acquired a 49.9% interest in a 174 MW operating wind portfolio in France from la Banque des Territoires.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 7. `INF-2026-209` — R.E.L.A.M.

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Basalt Infrastructure Partners (FUND; BUYER) |
| Sponsor lineage | Basalt Infrastructure Partners → Basalt Infrastructure Partners (ADVISER) |
| Date / sector / region | 2026-05-11 · Transportation · North America · United States / Canada |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Institutional Real Estate](https://irei.com/news/basalt-agrees-to-acquire-r-e-l-a-m-a-north-american-lessor-of-rail-infrastructure-equipment). Funds advised by Basalt Infrastructure Partners agreed to acquire R.E.L.A.M., a North American lessor of maintenance-of-way and hi-rail equipment, from Paceline Equity Partners. The company operates a scaled fleet of specialized rail maintenance assets serving railroads, contractors and other rail infrastructure operators. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; Institutional Real Estate's contemporaneous report identifies the parties and transaction terms used to classify R.E.L.A.M..

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 8. `WB-2026-08-07-014` — MBI

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Basalt Infrastructure Partners (FUND; BUYER) |
| Sponsor lineage | Basalt Infrastructure Partners → Basalt Infrastructure Partners (ADVISER) |
| Date / sector / region | 2026-08-07 · Social Infra · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Basaltinfra](https://basaltinfra.com/2026/08/03/basalt-acquires-mbi-the-leading-outsourced-waste-transportation-provider-in-north-america). Basalt-advised funds acquired MBI from Fortress-managed funds; Basalt announced the transaction on August 3 after its July 31 closing. MBI operates more than 5,000 long-lived specialized assets and serves waste operators and municipalities across more than 40 terminals nationwide.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 9. `WB-2026-05-02-005` — BayWa r.e. Power Solutions

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | BayWa r.e. AG / BayWa r.e. Power Solutions (OPERATING_PORTFOLIO_COMPANY; SELLER) |
| Sponsor lineage | Energy Infrastructure Partners (seller side) → BayWa r.e. AG / BayWa r.e. Power Solutions (INDIRECT_OWNER) |
| Date / sector / region | 2026-05-08 · Power & ET · Europe · Italy |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | The primary source unambiguously identifies an operating buyer and operating seller. Correcting party names and treating the event as an exit do not create a V2 risk. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Baywa Re](https://baywa-re.com/en/news/fervo-acquires-baywa-r-e-power-solutions). Fervo acquired BayWa r.e. Power Solutions from BayWa r.e. AG, an EIP-linked renewable-energy platform. The Verona-based business develops and builds rooftop and ground-mounted PV systems, storage systems, and integrated energy solutions for industrial customers, utilities, and IPPs, with more than 120 MWp installed and annual revenue exceeding €20mm.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [baywa-re](https://www.baywa-re.com/en/news/fervo-acquires-baywa-r-e-power-solutions). Fervo Group acquired BayWa r.e. Power Solutions from BayWa r.e. AG.
- **PRIMARY · OWNERSHIP** — [baywa-re](https://www.baywa-re.com/en/news/baywa-r-e-implements-comprehensive-financing-package). BayWa r.e.'s primary financing release identifies BayWa AG at 51% and EIP at 49%.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 10. `INF-2026-105` — Northview Energy

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | BCI (FUND; BUYER) |
| Sponsor lineage | BCI → BCI (ADVISER); NBIM → BCI (ADVISER); Brookfield → BCI (ADVISER) |
| Date / sector / region | 2026-03-03 · Power & ET · North America · North America |
| Transaction structure | JOINT_VENTURE / PLATFORM_FORMATION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [GlobeNewsWire](https://globenewswire.com/news-release/2026/03/03/3248185/0/en/BCI-Norges-Bank-Investment-Management-and-Brookfield-Partner-to-Launch-Northview-Energy.html). BCI, Norges Bank Investment Management (NBIM), and Brookfield launched Northview Energy, a renewable energy platform focused on North America.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 11. `WB-2026-07-31-012` — Cube Highways Trust

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | BCI (FUND; BUYER) |
| Sponsor lineage | ADIA Infrastructure → BCI (ADVISER); BCI → BCI (ADVISER); I Squared → BCI (ADVISER) |
| Date / sector / region | 2026-07-31 · Transportation · Asia-Pacific · India |
| Transaction structure | IPO |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Economictimes](https://economictimes.indiatimes.com/markets/stocks/news/cube-highways-trust-invit-debuts-with-2-premium-over-issue-price-of-rs-152/articleshow/132762831.cms). ADIA-, BCI- and I Squared-backed Cube Highways Trust began public trading following a ₹5,000 crore issue. The infrastructure investment trust owns 27 operational road assets and debuted with a reported market capitalization of ₹21,045 crore. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; Economictimes's contemporaneous report identifies the parties and transaction terms used to classify Cube Highways Trust.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 12. `INF-2026-006` — 381 MW Onshore Wind Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | BEE (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Antin Infrastructure Partners → BEE (INDIRECT_OWNER) |
| Date / sector / region | 2026-01-13 · Power & ET · Europe · Europe |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | BEE was an already-owned operating company/platform on 2026-01-13 and acted as the transaction buyer/investor. Antin Infrastructure Partners is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [White & Case](https://whitecase.com/news/press-release/white-case-advises-blue-elephant-energy-acquisition-381-mw-wind-portfolio). Antin Infrastructure Partners, through BEE, acquired a 381 MW onshore wind portfolio.
- **PRIMARY · OWNERSHIP** — [antin-ip](https://www.antin-ip.com/media/our-news/antin-to-become-new-majority-shareholder-in-blue-elephant-energy). Antin Flagship Fund V became BEE’s majority shareholder in 2022; BEE is described as an operating renewables platform.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 13. `WB-2026-07-10-006` — Lemvig Biogas

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | BioticNRG (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | APG → BioticNRG (INDIRECT_OWNER) |
| Date / sector / region | 2026-07-10 · Power & ET · North America · Denmark |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | BioticNRG was an already-owned operating company/platform on 2026-07-10 and acted as the transaction buyer/investor. APG is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Assetmanagement](https://assetmanagement.apg.nl/publications/apg-expands-bioticnrg-investment-with-first-european-acquisition). APG-backed BioticNRG acquired Lemvig Biogas, an industrial-scale Danish facility operating since 1992. BioticNRG plans to upgrade the plant to produce biomethane for injection into Denmark's gas grid.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 14. `INF-2026-101` — Naturgy Energy Group

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | BlackRock (FUND; SELLER) |
| Sponsor lineage | BlackRock → BlackRock (ADVISER); GIP (11.4% stake) → BlackRock (ADVISER) |
| Date / sector / region | 2026-03-02 · Utilities · Europe · Spain |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [US News](https://money.usnews.com/investing/news/articles/2026-03-02/blackrock-to-sell-its-11-4-stake-in-spanish-energy-firm-naturgy). Global Infrastructure Partners (GIP), a BlackRock company, divested its 11.4% minority stake in Naturgy Energy Group SA, the Spanish integrated utility. The sale was executed via the public market, reducing GIP's long-standing position in the Madrid-listed energy group. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; US News's contemporaneous report identifies the parties and transaction terms used to classify Naturgy Energy Group.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 15. `WB-2026-07-31-008` — Meta El Paso Data Center Campus

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | BlackRock (FUND; BUYER) |
| Sponsor lineage | BlackRock → BlackRock (ADVISER) |
| Date / sector / region | 2026-07-31 · Digital · North America · United States |
| Transaction structure | JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Investor](https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Announces-New-Strategic-Venture-with-BlackRock-to-Develop-Data-Center-in-El-Paso/default.aspx). Meta formed a strategic venture with a BlackRock-led investor group to develop a 1 GW data-center campus in El Paso, Texas. The investor group will own 80% of the approximately US$14bn project, providing direct capital for hyperscale digital infrastructure.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 16. `INF-2026-041` — Alliance Technical Group

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Blackstone (FUND; BUYER) |
| Sponsor lineage | Blackstone → Blackstone (ADVISER) |
| Date / sector / region | 2026-01-06 · Social Infra · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Blackstone](https://blackstone.com/news/press/blackstone-energy-transition-partners-announces-acquisition-of-alliance-technical-group). Blackstone announced the platform acquisition of Alliance Technical Group, an environmental services company.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 17. `INF-2026-011` — Arlington Industries

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Blackstone (FUND; BUYER) |
| Sponsor lineage | Blackstone → Blackstone (ADVISER) |
| Date / sector / region | 2026-01-26 · Power & ET · Europe · United Kingdom |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Blackstone](https://blackstone.com/news/press/blackstone-announces-agreement-to-acquire-arlington-industries). Blackstone announced the acquisition of Arlington Industries, an energy and infrastructure services platform.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 18. `INF-2026-042` — Urbaser

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Blackstone (FUND; BUYER) |
| Sponsor lineage | Blackstone → Blackstone (ADVISER); EQT Infrastructure → Blackstone (ADVISER) |
| Date / sector / region | 2026-02-12 · Social Infra · Europe · Spain |
| Transaction structure | ACQUISITION / JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Blackstone](https://blackstone.com/news/press/blackstone-infrastructure-and-eqt-to-acquire-urbaser). Blackstone and EQT Infrastructure announced a 50/50 platform buyout of Urbaser, a global waste management and environmental services company.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 19. `INF-2026-161` — Rowan Digital Infrastructure

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Blackstone (FUND; BUYER) |
| Sponsor lineage | Blackstone → Blackstone (ADVISER); Quinbrook Infrastructure → Blackstone (ADVISER) |
| Date / sector / region | 2026-04-07 · Digital · North America · United States |
| Transaction structure | ACQUISITION / SALE / RECAPITALIZATION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [PR Newswire](https://prnewswire.com/news-releases/rowan-digital-infrastructure-announces-strategic-recapitalization-302738729.html). Quinbrook announced a strategic recapitalization of Rowan Digital Infrastructure through the sale of a 49% significant minority stake to funds affiliated with Blackstone. The transaction monetizes part of Quinbrook’s ownership while retaining control, partnering with Blackstone to support Rowan’s next phase of growth and continued hyperscale data center expansion serving cloud and AI-driven demand.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 20. `INF-2026-190` — Eurowind Energy

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Blackstone (FUND; BUYER) |
| Sponsor lineage | Blackstone → Blackstone (ADVISER) |
| Date / sector / region | 2026-04-29 · Power & ET · Europe · Europe |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Blackstone](https://blackstone.com/news/press/blackstone-infrastructure-to-invest-up-to-e2-billion-in-leading-pan%E2%80%91european-renewables-developer-eurowind-energy). Funds managed by Blackstone Infrastructure entered into a definitive agreement to invest up to €2bn in Eurowind Energy, a pan-European renewables developer and independent power producer. The perpetual capital will support Eurowind’s onshore wind, solar, battery storage, and biogas development activity across 16 European markets.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 21. `WB-2026-06-06-004` — Mountain Peak / Canyon Peak Power

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Blackstone (FUND; SELLER) |
| Sponsor lineage | Blackstone → Blackstone (ADVISER) |
| Date / sector / region | 2026-06-05 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [GlobeNewswire](https://globenewswire.com/news-release/2026/06/03/3306398/0/en/transalta-announces-the-acquisition-of-two-fully-contracted-gas-assets-in-colorado-and-concurrent-350-million-bought-deal-offering-of-common-shares.html). TransAlta signed a purchase and sale agreement to acquire Mountain Peak Power and Canyon Peak Power from indirect subsidiaries of Blackstone. The transaction covers two fully contracted gas-fired peaking facilities in Colorado, adding dispatchable power capacity under existing contracts.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 22. `WB-2026-07-03-011` — Northern Virginia data centers

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Blackstone (FUND; SELLER) |
| Sponsor lineage | Blackstone → Blackstone (ADVISER) |
| Date / sector / region | 2026-07-03 · Digital · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Blackstone](https://blackstone.com/news/press/digital-realty-announces-purchase-of-blackstone-interest-in-three-northern-virginia-data-centers). Digital Realty agreed to purchase Blackstone-affiliated funds' blended 64% equity interest in three fully leased Northern Virginia data centers. The facilities represent 288 MW of IT capacity in the leading U.S. data-center market.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 23. `WB-2026-07-10-015` — Dresser Utility Solutions

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Blackstone (FUND; SELLER) |
| Sponsor lineage | Blackstone → Blackstone (ADVISER); First Reserve → Blackstone (ADVISER) |
| Date / sector / region | 2026-07-10 · Utilities · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Blackstone](https://blackstone.com/news/press/blackstone-energy-transition-partners-announces-agreement-to-acquire-dresser-utility-solutions-from-first-reserve). Funds managed by Blackstone Energy Transition Partners agreed to acquire Dresser Utility Solutions from First Reserve. The approximately 850-employee business supplies measurement, instrumentation and control products for natural-gas and water infrastructure globally; terms were not disclosed.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 24. `WB-2026-07-31-016` — Kuwait Oil Pipeline Network

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **RECLASSIFY** |
| Acting entity | Blackstone (FUND; BUYER) |
| Sponsor lineage | Blackstone → Blackstone (ADVISER); Brookfield → Blackstone (ADVISER); KKR → Blackstone (ADVISER) |
| Date / sector / region | 2026-07-31 · Midstream · Middle East & Africa · Kuwait |
| Transaction structure | JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | Kuwait maps to Middle East & Africa. The frozen seed's North America value is a geography-parser fallback already normalized in the review manifest. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Blackstone](https://blackstone.com/news/press/kuwait-oil-company-signs-us-16-0-billion-infrastructure-partnership-involving-its-crude-oil-pipeline-network-with-a-consortium-comprising-blackstone-brookfield-and-kkr). A Blackstone-, Brookfield- and KKR-led consortium agreed a US$16bn partnership over Kuwait Oil Company’s 13-pipeline, 320-kilometer crude-oil network. The investors will own 49% of a newly formed infrastructure company, generating US$7.85bn of proceeds for KOC while operations remain with the state producer.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.
