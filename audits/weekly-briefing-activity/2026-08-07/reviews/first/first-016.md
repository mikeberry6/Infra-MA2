# first-016 — first review

Cutoff: 2026-08-07
Records: 23
Packet hash: `8ebb36998aed4927315780d10416c61092983ba36753a53abd6bc0d19c9a6029`

Open every transaction and ownership source for every decision in this packet. Verify the universe disposition, parties, date, sector, region, transaction structure, acting principal, sponsor lineage, and authoritative scope. The bold recommended scope is the evidence-derived proposal under review; the original automation candidate is shown only for lineage and is not an approval.

Use the matching `.worksheet.json` file for the normal compact workflow. For each record, set `evidenceOpened` to `true`, choose `ACCEPT_RECOMMENDATION` or `EDITED_RECORD`, and add a substantive record-specific note. Replace the reviewer and timestamp placeholders and set every human-attestation value to `true`. The review command compiles the compact worksheet against this immutable packet and then routes it through the existing full review validator. The matching `.review.json` remains available for advanced edits and legal-transaction splits.

One named human may approve this evidence-backed batch only after opening every record's evidence. Only verified risk exceptions will be queued separately for second review.

## Packet summary

| ID | Target | **Recommended scope** | Original automation candidate *(not approval)* | Disposition | Second-review risks |
| --- | --- | --- | --- | --- | --- |
| INF-2026-187 | Park Properties Housing Association (PPHA) | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| WB-2026-06-20-011 | Pinnacle Gas Services | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| WB-2026-05-02-003 | Nordergründe Offshore Wind Farm | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-06-27-004 | Gennaker offshore wind project | **PORTFOLIO_COMPANY** | DIRECT_FUND | KEEP | None |
| WB-2026-07-03-007 | Nordergrunde offshore wind farm | **PORTFOLIO_COMPANY** | UNRESOLVED | MERGE_DUPLICATE | None |
| INF-2026-144 | Akira Portfolio (6 Italian Solar PV Plants) | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-07-17-004 | Tuscania BESS Portfolio | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-186 | F3 Marina | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-128 | 48.4 MW Community Solar Portfolio (NM) | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-163 | Hemel Hempstead Data Center | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-054 | United Ports | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-097 | Aura Holdings | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-123 | GFiber / Astound Broadband | **DIRECT_FUND** | DIRECT_FUND | KEEP | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| INF-2026-142 | Lestari Cooling Energy Sdn. Bhd. | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-185 | Southern Marinas | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-196 | Cleco Group | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-206 | BMO Transportation and Vendor Finance | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-05-23-010 | Estia Health | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-06-13-014 | Anwim / MOYA Fuel Station Network | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-06-20-010 | KAPS Pipeline System | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-10-012 | Northern Fiber Holding | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-06-20-004 | Kinship Marina Ventura | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-06-27-011 | Amprion indirect stake | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |

## Record worksheets

### 1. `INF-2026-187` — Park Properties Housing Association (PPHA)

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Sixth Street-managed investment vehicle (ADVISED_VEHICLE; INVESTOR) |
| Sponsor lineage | Sixth Street → Sixth Street-managed investment vehicle (ADVISER) |
| Date / sector / region | 2026-04-22 · Social Infra · Europe · United Kingdom |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | Sixth Street's advised investment capital is the principal equity investor in the partnership, so this is direct fund-level activity. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Sixth Street](https://sixthstreet.com/investment_announce/sixth-street-announces-strategic-partnership-with-hspg-and-park-properties-housing-association). Sixth Street states that its investment will provide the majority equity capital for the HSPG and PPHA affordable-housing partnership.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 2. `WB-2026-06-20-011` — Pinnacle Gas Services

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Sixth Street-managed investment vehicle (FUND; INVESTOR) |
| Sponsor lineage | Sixth Street → Sixth Street-managed investment vehicle (ADVISER) |
| Date / sector / region | 2026-06-19 · Midstream · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | Sixth Street invested US$600mm for the Pinnacle minority interest through managed institutional capital. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Sixthstreet](https://sixthstreet.com/investment_announce/comstock-announces-600-million-strategic-investment-by-sixth-street-in-pinnacle-gas-services). Sixth Street invested US$600mm for a 27% minority equity interest in Comstock Resources' midstream subsidiary Pinnacle Gas Services. Pinnacle owns and operates natural gas gathering and treating systems supporting Comstock's Western Haynesville development.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 3. `WB-2026-05-02-003` — Nordergründe Offshore Wind Farm

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Skyborn Renewables (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Global Infrastructure Partners → Skyborn Renewables (INDIRECT_OWNER) |
| Date / sector / region | 2026-05-08 · Power & ET · Europe · Germany |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Skyborn Renewables was an already-owned operating company/platform on 2026-05-08 and acted as the transaction buyer/investor. Global Infrastructure Partners is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Finanznachrichten](https://finanznachrichten.de/nachrichten-2026-05/68393100-laufende-fusionskontrollverfahren-skyborn-renewables-gmbh-hamburg-mittelbarer-erwerb-von-70-der-anteile-an-und-alleiniger-kontrolle-ueber-owp-norde-019.htm). Public merger-control disclosure showed Skyborn Renewables, a Global Infrastructure Partners portfolio company, seeking the indirect acquisition of a 70% stake and sole control of OWP Nordergründe GmbH & Co. KG. Nordergründe is an operating offshore wind project in Germany with 111 MW of capacity.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 4. `WB-2026-06-27-004` — Gennaker offshore wind project

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Skyborn Renewables (OPERATING_PORTFOLIO_COMPANY; SELLER) |
| Sponsor lineage | Global Infrastructure Partners → Skyborn Renewables (INDIRECT_OWNER); BlackRock → Skyborn Renewables (INDIRECT_OWNER) |
| Date / sector / region | 2026-06-26 · Power & ET · Europe · Germany |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | Skyborn agreed to sell a 25% project interest to Stadtwerke Muenchen; its announcement identifies GIP/BlackRock only as Skyborn's existing owner. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Skybornrenewables](https://skybornrenewables.com/articles/newsroom/Gennaker-SWM). Skyborn Renewables agreed to sell Stadtwerke München a 25% equity interest in the Gennaker offshore wind project. Skyborn is a GIP infrastructure portfolio company within BlackRock’s infrastructure platform, and Gennaker is positioned as a major German Baltic Sea offshore wind development.
- **PRIMARY · OWNERSHIP** — [skybornrenewables](https://www.skybornrenewables.com/articles/newsroom/Gennaker-SWM). Use the cited contemporaneous transaction/ownership statement to document date-valid sponsor lineage; confirm legal entity name during human review.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 5. `WB-2026-07-03-007` — Nordergrunde offshore wind farm

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **MERGE_DUPLICATE** |
| Acting entity | Skyborn Renewables (OPERATING_PLATFORM; BUYER) |
| Sponsor lineage | Global Infrastructure Partners → Skyborn Renewables (INDIRECT_OWNER) |
| Date / sector / region | 2026-07-03 · Power & ET · Europe · Germany |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | Skyborn Renewables itself agreed to buy the remaining Nordergrunde stake. The source identifies Skyborn as a pre-existing GIP-backed operating renewable platform; no GIP fund vehicle is a transaction party. |
| Disposition rationale | The May merger-control filing and July completion announcement describe the same purchase by Skyborn Renewables of the remaining 70% of Nordergründe, taking Skyborn from 30% to 100%. The July appearance is completion evidence, not a second legal transaction. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Eqs News](https://eqs-news.com/news/corporate/skyborn-takes-full-ownership-of-nordergrunde-offshore-wind-farm-in-germany/6ea519ce-5e1c-42c7-aeee-324d728bc0b0_en). GIP-backed Skyborn Renewables agreed to acquire the remaining 70% equity interest in the Nordergrunde offshore wind farm. The transaction gives Skyborn full ownership of the German operating asset and deepens its offshore wind platform.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 6. `INF-2026-144` — Akira Portfolio (6 Italian Solar PV Plants)

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Sonnedix (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | J.P. Morgan Asset Management → Sonnedix (INDIRECT_OWNER) |
| Date / sector / region | 2026-03-26 · Power & ET · Europe · Italy |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Sonnedix was an already-owned operating company/platform on 2026-03-26 and acted as the transaction buyer/investor. J.P. Morgan Asset Management is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Sonnedix](https://sonnedix.com/news/sonnedix-surpasses-1gw-of-operating-capacity-in-italy-with-acquisition-of-194mw-akira-portfolio). Sonnedix acquired the 194 MW Akira portfolio of six Italian solar PV plants from EOS Investment Management and Capital Dynamics, surpassing 1 GW of operating capacity in Italy.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 7. `WB-2026-07-17-004` — Tuscania BESS Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Sonnedix (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | J.P. Morgan Asset Management → Sonnedix (INDIRECT_OWNER) |
| Date / sector / region | 2026-07-17 · Power & ET · Europe · Italy |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Sonnedix was an already-owned operating company/platform on 2026-07-17 and acted as the transaction buyer/investor. J.P. Morgan Asset Management is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Sonnedix](https://sonnedix.com/news/sonnedix-bolsters-hybrid-capabilities-in-italy-with-acquisition-of-260mw-battery-storage-portfolio). J.P. Morgan Asset Management-backed Sonnedix acquired two adjacent standalone BESS projects in Tuscania from Sphera Energy. The 160 MW and 100 MW four-hour projects add 260 MW / 1,040 MWh to Sonnedix’s Italian portfolio.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 8. `INF-2026-186` — F3 Marina

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Southern Marinas (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Stonepeak → Southern Marinas (INDIRECT_OWNER) |
| Date / sector / region | 2026-04-22 · Transportation · North America · United States |
| Transaction structure | ACQUISITION / RECAPITALIZATION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | The F3 acquisition and Southern recapitalization were separately announced and separately keyed. The F3 record's scope is Portfolio-company under either same-day owner, so there is no unresolved ownership-timing exception. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Marina World](https://marinaworld.com/news/f3-marina-fort-lauderdale-sold-southern-marinas-florida). Southern Marinas acquired F3 Marina Fort Lauderdale on the same day as its Stonepeak recapitalization, adding the 59,000-square-foot facility to its portfolio in a deal facilitated by Colliers. Billed as the world’s tallest dry stack marina at 130 feet, F3 houses 254 vessels across six tiers and operates a first-of-its-kind automated overhead crane system that retrieves boats up to 47 feet in under five minutes — with roughly 90% of revenue derived from storage.
- **PRIMARY · OWNERSHIP** — [stonepeak](https://stonepeak.com/news/southern-marinas-announces-recapitalization-by-stonepeak). Stonepeak's primary release establishes the separate same-day Southern Marinas recapitalization.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [colliers](https://www.colliers.com/en/news/tampa-bay/colliers-facilitates-f3-marina-sale-to-southern-marinas-fort-lauderdale). Colliers identifies Southern Marinas as buyer of F3 Marina.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [marinaworld](https://www.marinaworld.com/news/f3-marina-fort-lauderdale-sold-southern-marinas-florida). Marina World reports the F3 sale and describes the Stonepeak recapitalization as a separate announcement.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 9. `INF-2026-128` — 48.4 MW Community Solar Portfolio (NM)

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Standard Solar (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Brookfield → Standard Solar (INDIRECT_OWNER) |
| Date / sector / region | 2026-03-16 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Standard Solar was an already-owned operating company/platform on 2026-03-16 and acted as the transaction buyer/investor. Brookfield is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [BusinessWire](https://businesswire.com/news/home/20260316627025/en/Pluma-Construction-ForeFront-Power-and-Standard-Solar-Bring-48.4-MW-Community-Solar-Portfolio-to-New-Mexico). Standard Solar, a Brookfield portfolio company, acquired a 48.4 MW community solar portfolio in New Mexico from Pluma Construction and ForeFront Power.
- **PRIMARY · OWNERSHIP** — [standardsolar](https://standardsolar.com/news/brookfield-to-invest-up-to-2-billion-in-scout-clean-energy-and-standard-solar/). Standard Solar announced Brookfield’s investment before the 2026 acquisition.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 10. `INF-2026-163` — Hemel Hempstead Data Center

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Stellanor (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | DWS Infrastructure → Stellanor (INDIRECT_OWNER) |
| Date / sector / region | 2026-04-07 · Digital · Europe · United Kingdom |
| Transaction structure | ACQUISITION / SALE / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Stellanor was an already-owned operating company/platform on 2026-04-07 and acted as the transaction buyer/investor. DWS Infrastructure is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [PR Newswire](https://prnewswire.co.uk/news-releases/stellanor-expands-to-11-facilities-with-acquisition-of-ai-ready-data-center-from-imagination-technologies-302736158.html). DWS, through portfolio company Stellanor, acquired a purpose-built data center in Hemel Hempstead from Imagination Technologies in a sale-and-service-back structure. The add-on expands Stellanor’s UK footprint while keeping the seller as a continuing service customer at the site.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 11. `INF-2026-054` — United Ports

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Stonepeak (FUND; BUYER) |
| Sponsor lineage | Stonepeak → Stonepeak (ADVISER) |
| Date / sector / region | 2026-01-28 · Transportation · Middle East & Africa · United Arab Emirates |
| Transaction structure | ACQUISITION / JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Stonepeak](https://stonepeak.com/news/cma-cgm-and-stonepeak-announce-groundbreaking-terminal-joint-venture-united-ports-llc). Stonepeak announced the acquisition of a 25% JV stake in United Ports LLC, a port operator in the Middle East.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 12. `INF-2026-097` — Aura Holdings

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Stonepeak (FUND; BUYER) |
| Sponsor lineage | Stonepeak → Stonepeak (ADVISER) |
| Date / sector / region | 2026-03-01 · Social Infra · Asia-Pacific · Australia |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Stonepeak](https://stonepeak.com/news/stonepeak-announces-investment-in-aura-holdings). Stonepeak made a platform equity investment in Aura Holdings, a vertically integrated retirement living developer and operator based in Brisbane, Australia. Aura develops medium to high-end retirement living communities on premium sites throughout South-East Queensland and Northern New South Wales, with a pipeline of 2,000+ apartments over five years across six operational villages.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 13. `INF-2026-123` — GFiber / Astound Broadband

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Stonepeak (FUND; INVESTOR) |
| Sponsor lineage | Stonepeak → Stonepeak (ADVISER) |
| Date / sector / region | 2026-03-11 · Digital · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| Scope rationale | The primary source states that GFiber and Stonepeak entered the combination agreement, Stonepeak will own the majority, and Stonepeak-backed Astound is the operating company being combined. This is more than sponsor branding. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Stonepeak](https://stonepeak.com/news/gfiber-and-stonepeaks-astound-to-combine-creating-a-leading-independent-broadband-provider). The release identifies Astound as Stonepeak's business and the combined company's post-close ownership.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 14. `INF-2026-142` — Lestari Cooling Energy Sdn. Bhd.

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Stonepeak (FUND; BUYER) |
| Sponsor lineage | Stonepeak → Stonepeak (ADVISER) |
| Date / sector / region | 2026-03-25 · Utilities · Asia-Pacific · Malaysia |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Stonepeak](https://stonepeak.com/news/lestari-cooling-energy-strengthens-platform-adding-kwap-as-an-investor). KJTS and Stonepeak added KWAP as an investor in Lestari Cooling Energy Sdn. Bhd., strengthening the Malaysian district cooling platform.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 15. `INF-2026-185` — Southern Marinas

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Stonepeak (FUND; BUYER) |
| Sponsor lineage | Stonepeak → Stonepeak (ADVISER) |
| Date / sector / region | 2026-04-22 · Transportation · North America · United States |
| Transaction structure | ACQUISITION / RECAPITALIZATION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Stonepeak](https://stonepeak.com/news/southern-marinas-announces-recapitalization-by-stonepeak). Stonepeak recapitalized Southern Marinas via a buyout of affiliates of KSL Capital Partners, with the transaction closing simultaneously with announcement; PJT Partners and Lazard advised the buy-side and sell-side respectively. Founded in 2018, Southern Marinas owns and operates 16 marinas across eight US states with more than 6,700 slips, complemented by fuel, boat rentals and service operations.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 16. `INF-2026-196` — Cleco Group

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Stonepeak (FUND; BUYER) |
| Sponsor lineage | Stonepeak → Stonepeak (ADVISER); Bernhard Capital Partners → Stonepeak (ADVISER); Macquarie Asset Management → Stonepeak (ADVISER); BCI → Stonepeak (ADVISER); Manulife Investment Management → Stonepeak (ADVISER) |
| Date / sector / region | 2026-04-30 · Utilities · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Stonepeak](https://stonepeak.com/news/stonepeak-and-bernhard-capital-partners-to-acquire-cleco). Stonepeak and Bernhard Capital Partners agreed to acquire Cleco Group from a consortium comprising Macquarie Asset Management, BCI, and Manulife Investment Management. Cleco is a regulated electric utility serving approximately 298,000 customers in Louisiana, with eight generating units totaling 2,676 MW of capacity.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 17. `INF-2026-206` — BMO Transportation and Vendor Finance

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Stonepeak (FUND; BUYER) |
| Sponsor lineage | Stonepeak → Stonepeak (ADVISER) |
| Date / sector / region | 2026-05-11 · Transportation · North America · United States / Canada |
| Transaction structure | ACQUISITION / CAPITAL_RAISE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Stonepeak](https://stonepeak.com/news/stonepeak-to-acquire-bmo-transportation-and-vendor-finance). Stonepeak reached an agreement to acquire BMO's Transportation Finance and Vendor Finance businesses, including related loan portfolios in the United States and Canada. BMO will reinvest for a 19.9% minority interest, while the platform continues to provide financing for trucks, trailers and other transportation and vendor equipment.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 18. `WB-2026-05-23-010` — Estia Health

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Stonepeak (FUND; BUYER) |
| Sponsor lineage | Stonepeak → Stonepeak (ADVISER) |
| Date / sector / region | 2026-05-29 · Social Infra · Asia-Pacific · Australia |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Stonepeak](https://stonepeak.com/news/stonepeak-led-consortium-to-acquire-estia-health). A Stonepeak-led consortium agreed to acquire a majority stake in Estia Health from Bain Capital, extending Stonepeak’s Volarae Living social-infrastructure platform in Australia and New Zealand. Estia is one of Australia’s largest residential aged-care operators, with more than 90 homes across four states and approximately 9,000 residents.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 19. `WB-2026-06-13-014` — Anwim / MOYA Fuel Station Network

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Stonepeak (FUND; BUYER) |
| Sponsor lineage | Stonepeak → Stonepeak (ADVISER) |
| Date / sector / region | 2026-06-12 · Midstream · Europe · Poland |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Stonepeak](https://stonepeak.com/news/stonepeak-and-energy-equation-partners-to-acquire-anwim). Stonepeak and Energy Equation Partners agreed to acquire Anwim, operator of the MOYA fuel station network in Poland. The transaction gives Stonepeak direct exposure to fuel distribution and logistics infrastructure with a national retail and wholesale platform.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 20. `WB-2026-06-20-010` — KAPS Pipeline System

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Stonepeak (FUND; SELLER) |
| Sponsor lineage | Stonepeak → Stonepeak (ADVISER) |
| Date / sector / region | 2026-06-19 · Midstream · North America · Canada |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Keyera](https://keyera.com/news-and-stories/news-releases/keyera-announces-acquisition-of-remaining-50-interest-in-kaps). Keyera acquired Stonepeak's remaining 50% non-operating interest in the KAPS Pipeline System for C$1.215bn. KAPS is a natural gas liquids pipeline system connecting Montney and Duvernay production to downstream markets, and Keyera now owns 100% of the asset.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 21. `WB-2026-07-10-012` — Northern Fiber Holding

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Strategic Fiber Networks (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | iCON Infrastructure → Strategic Fiber Networks (INDIRECT_OWNER) |
| Date / sector / region | 2026-07-10 · Digital · Europe · Germany |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Strategic Fiber Networks was an already-owned operating company/platform on 2026-07-10 and acted as the transaction buyer/investor. iCON Infrastructure is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Gleisslutz](https://gleisslutz.com/en/mandates-firm-news/gleiss-lutz-advises-icon-infrastructure-acquisition-northern-fiber-holding). iCON-backed Strategic Fiber Networks agreed to acquire Northern Fiber Holding in a share deal. Operating through the Lünecom and sewikom brands, Northern Fiber manages owned and leased networks serving rural and semi-urban communities across three German states.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 22. `WB-2026-06-20-004` — Kinship Marina Ventura

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Suntex Marinas (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Wafra → Suntex Marinas (INDIRECT_OWNER) |
| Date / sector / region | 2026-06-19 · Transportation · North America · United States |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Suntex Marinas was an already-owned operating company/platform on 2026-06-19 and acted as the transaction buyer/investor. Wafra is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Suntex](https://suntex.com/press-releases/suntex-marinas-expand-california-footprint-with-acquisition-of-kinship-marina-ventura). Wafra-backed Suntex Marinas acquired Kinship Marina in Ventura, California, expanding its West Coast marina footprint. The coastal asset adds wet slips, dry storage, on-site service partnerships, and access to the Channel Islands boating market.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 23. `WB-2026-06-27-011` — Amprion indirect stake

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Swiss Life Asset Managers (FUND; SELLER) |
| Sponsor lineage | Swiss Life Asset Managers → Swiss Life Asset Managers (ADVISER) |
| Date / sector / region | 2026-06-26 · Utilities · Europe · Germany |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Swisslife Am](https://swisslife-am.com/en/home/media/news/corporate/company-news/2026/0622-amprion.html). Swiss Life Asset Managers signed an agreement to sell an indirect stake in Amprion, one of Germany’s major electricity transmission system operators. The sale recycles capital from a regulated power transmission asset held through the manager’s infrastructure platform.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.
