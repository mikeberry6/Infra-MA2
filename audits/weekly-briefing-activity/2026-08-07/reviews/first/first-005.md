# first-005 — first review

Cutoff: 2026-08-07
Records: 24
Packet hash: `50ca5c932f01ef622d83600c7d7dc18489b838d6c91ea80e00cf43d1920926b8`

Open every transaction and ownership source for every decision in this packet. Verify the universe disposition, parties, date, sector, region, transaction structure, acting principal, sponsor lineage, and authoritative scope. The bold recommended scope is the evidence-derived proposal under review; the original automation candidate is shown only for lineage and is not an approval.

Use the matching `.worksheet.json` file for the normal compact workflow. For each record, set `evidenceOpened` to `true`, choose `ACCEPT_RECOMMENDATION` or `EDITED_RECORD`, and add a substantive record-specific note. Replace the reviewer and timestamp placeholders and set every human-attestation value to `true`. The review command compiles the compact worksheet against this immutable packet and then routes it through the existing full review validator. The matching `.review.json` remains available for advanced edits and legal-transaction splits.

One named human may approve this evidence-backed batch only after opening every record's evidence. Only verified risk exceptions will be queued separately for second review.

## Packet summary

| ID | Target | **Recommended scope** | Original automation candidate *(not approval)* | Disposition | Second-review risks |
| --- | --- | --- | --- | --- | --- |
| INF-2026-062 | ATC Europe | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-170 | Insplorion Hydrogen Sensor Business | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-06-27-009 | Integmar Marine Technologies | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | RECLASSIFY | None |
| INF-2026-026 | Ørsted European Onshore Business | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-193 | Perigus Energy | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-05-16-002 | North Star Renewable Energy Platform | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-06-13-004 | Devilla BESS Project | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-03-009 | Cobirgy biogas plant | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-176 | Cordelio Power’s 6GW Joint Venture Interest | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-013 | Cordelio Power | **DIRECT_FUND** | PORTFOLIO_COMPANY | KEEP | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| INF-2026-087 | atNorth | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-05-02-007 | NEXTDC | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-06-20-008 | CtrlS Datacenters | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-03-010 | EQT AI Infrastructure / EdgeConneX | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-31-020 | Tarchon Interconnector | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-157 | Three 5MW biomass plants in Croatia | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-067 | G.Network | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-152 | 24H Frost | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-07-24-002 | Cubico–CFE Mexico JV | **PORTFOLIO_COMPANY** | DIRECT_FUND | KEEP | None |
| INF-2026-050 | iPark | **DIRECT_FUND** | DIRECT_FUND | RECLASSIFY | None |
| INF-2026-064 | Celeste | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-044 | American Roads | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-146 | A63 Motorway | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-03-006 | Klara Renewables | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |

## Record worksheets

### 1. `INF-2026-062` — ATC Europe

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Commerz Real / AllianzGI managed investment vehicles (ADVISED_VEHICLE; BUYER) |
| Sponsor lineage | Commerz Real → Commerz Real / AllianzGI managed investment vehicles (ADVISER); Allianz Global Investors → Commerz Real / AllianzGI managed investment vehicles (ADVISER) |
| Date / sector / region | 2026-02-18 · Digital · Europe · Europe |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | The Commerz Real and AllianzGI investment vehicles acquired the ATC Europe interest as principals. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [IPE Real Assets](https://realassets.ipe.com/news/commerz-real-invests-in-atc-europe-telecom-towers-via-allianz-partnership/10135239.article). Commerz Real, in partnership with Allianz Global Investors, acquired a minority stake in ATC Europe from Allianz insurance companies.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 2. `INF-2026-170` — Insplorion Hydrogen Sensor Business

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Consilium Safety Group (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Antin Infrastructure Partners → Consilium Safety Group (INDIRECT_OWNER) |
| Date / sector / region | 2026-04-15 · Power & ET · Europe · Europe |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Consilium Safety Group was an already-owned operating company/platform on 2026-04-15 and acted as the transaction buyer/investor. Antin Infrastructure Partners is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Consilium Safety Group](https://consiliumsafety.com/en/consilium-safety-group-reinforces-its-industry-leadership-through-acquisition-of-insplorions-hydrogen-sensor-technology-business). Consilium Safety Group, a portfolio company of Antin Infrastructure Partners, acquired Insplorion’s hydrogen sensor technology business, including related intellectual property and physical assets for advanced hydrogen detection sensors.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 3. `WB-2026-06-27-009` — Integmar Marine Technologies

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **RECLASSIFY** |
| Acting entity | Consilium Safety Group (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Antin Infrastructure Partners → Consilium Safety Group (INDIRECT_OWNER) |
| Date / sector / region | 2026-06-26 · Transportation · Europe · Türkiye |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Consilium Safety Group was an already-owned operating company/platform on 2026-06-26 and acted as the transaction buyer/investor. Antin Infrastructure Partners is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | Türkiye maps to Europe. The frozen seed's North America value is a geography-parser fallback already normalized in the review manifest. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Consiliumsafety](https://consiliumsafety.com/en/consilium-safety-group-further-expands-its-presence-in-turkiye-by-acquiring-integmar-marine-technologies-inc). Antin-backed Consilium Safety Group acquired Integmar Marine Technologies, expanding its presence in Türkiye and its marine safety technology offering. Consilium was acquired by an Antin Flagship Fund V affiliate, bringing the bolt-on into an infrastructure-backed safety platform.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 4. `INF-2026-026` — Ørsted European Onshore Business

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Copenhagen Infrastructure Partners (FUND; BUYER) |
| Sponsor lineage | Copenhagen Infrastructure Partners → Copenhagen Infrastructure Partners (ADVISER) |
| Date / sector / region | 2026-02-02 · Power & ET · Europe · Denmark |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Ørsted](https://orsted.com/en/media/news/2026/02/orsted-signs-agreement-with-cip-to-divest-its-euro-1477764911). Copenhagen Infrastructure Partners announced the 100% platform buyout of Ørsted's European onshore renewable energy business.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 5. `INF-2026-193` — Perigus Energy

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Copenhagen Infrastructure Partners (FUND; BUYER) |
| Sponsor lineage | Copenhagen Infrastructure Partners → Copenhagen Infrastructure Partners (ADVISER) |
| Date / sector / region | 2026-04-30 · Power & ET · Europe · Europe |
| Transaction structure | ACQUISITION / PLATFORM_FORMATION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [GlobeNewswire](https://globenewswire.com/news-release/2026/04/30/3285338/0/en/Copenhagen-Infrastructure-Partners-completes-acquisition-of-%C3%98rsted-s-European-onshore-platform-and-launches-Perigus-Energy.html). Copenhagen Infrastructure Partners completed its acquisition of Ørsted’s European onshore business through CI V and launched the platform as Perigus Energy. The company operates across Ireland, Germany, the UK, and Spain with 826 MW of installed and under-construction capacity and a multi-GW pipeline spanning wind, solar, and battery storage.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 6. `WB-2026-05-16-002` — North Star Renewable Energy Platform

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Copenhagen Infrastructure Partners (FUND; BUYER) |
| Sponsor lineage | Copenhagen Infrastructure Partners → Copenhagen Infrastructure Partners (ADVISER) |
| Date / sector / region | 2026-05-22 · Power & ET · Asia-Pacific · India |
| Transaction structure | PLATFORM_FORMATION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **INSTITUTIONAL · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Orrick](https://www.orrick.com/en/News/2026/05/Copenhagen-Infrastructure-Partners-and-British-International-Investment-Launch-300M-North-Star). PV Magazine is secondary. Orrick's transaction page corroborates parties and commitments; retain a substantive fallback explanation if no party announcement is available.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 7. `WB-2026-06-13-004` — Devilla BESS Project

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Copenhagen Infrastructure Partners (FUND; SELLER) |
| Sponsor lineage | Copenhagen Infrastructure Partners → Copenhagen Infrastructure Partners (ADVISER) |
| Date / sector / region | 2026-06-12 · Power & ET · Europe · United Kingdom |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [GlobeNewswire](https://globenewswire.com/news-release/2026/06/08/3307793/0/en/copenhagen-infrastructure-partners-partially-divests-500mw-devilla-bess-project-to-scottish-national-investment-bank-and-nuclear-liabilities-fund.html). CIP agreed to sell minority stakes in the 500 MW Devilla battery energy storage project to Scottish National Investment Bank and Nuclear Liabilities Fund. CIP remains the majority owner through Copenhagen Infrastructure IV while recycling capital into a large-scale UK storage project.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 8. `WB-2026-07-03-009` — Cobirgy biogas plant

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Copenhagen Infrastructure Partners (FUND; BUYER) |
| Sponsor lineage | Copenhagen Infrastructure Partners → Copenhagen Infrastructure Partners (ADVISER) |
| Date / sector / region | 2026-07-03 · Power & ET · Europe · Spain |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [GlobeNewswire](https://globenewswire.com/news-release/2026/06/30/3319426/0/en/Copenhagen-Infrastructure-Partners-takes-FID-on-large-scale-biogas-plant-in-Spain.html). Copenhagen Infrastructure Partners took FID on Cobirgy through Advanced Bioenergy Fund I. The project adds large-scale Spanish biomethane and biogas infrastructure to CIP's energy-transition portfolio.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 9. `INF-2026-176` — Cordelio Power’s 6GW Joint Venture Interest

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Cordelio Power (OPERATING_PORTFOLIO_COMPANY; SELLER) |
| Sponsor lineage | CPP Investments → Cordelio Power (INDIRECT_OWNER) |
| Date / sector / region | 2026-04-22 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / SALE / JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | This is an operating-company sale of a JV interest. The JV and exit labels do not create a V2 exception, and ownership timing is resolved by the completed Pattern acquisition source. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [PR Newswire](https://prnewswire.com/news-releases/brightnight-acquires-cordelio-powers-joint-venture-interest-adds-6-gw-to-its-independently-controlled-project-portfolio-302747628.html). BrightNight bought out JV partner Cordelio Power’s interest in 6 GW of US solar and storage development projects, taking full ownership and control of the assets and leaving four operating/construction-stage projects within the legacy JV. The transaction follows BrightNight’s recent $850mm corporate credit facility close and reinforces the AI-focused IPP’s western US footprint; Cordelio is the renewables platform owned by CPP Investments.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [brightnightpower](https://brightnightpower.com/about-us/news-insights/brightnight-acquires-cordelio-powers-joint-venture-interest-adds-6-gw-to-its-independently-controlled-project-portfolio/). BrightNight acquired Cordelio's interest in a 6 GW development portfolio.
- **PRIMARY · OWNERSHIP** — [cordeliopower](https://cordeliopower.com/pattern_energy_announces_completion_of_acquisition_of_cordelio_power/). Pattern completed its acquisition of Cordelio on April 2, before the April 21 JV-interest sale.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 10. `INF-2026-013` — Cordelio Power

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | CPP Investments (FUND; SELLER) |
| Sponsor lineage | CPP Investments → CPP Investments (ADVISER) |
| Date / sector / region | 2026-01-06 · Power & ET · North America · Canada |
| Transaction structure | ACQUISITION |
| Independent second-review risks | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| Scope rationale | Pattern is the operating acquirer while CPP Investments is the fund seller and receives Pattern equity, increasing its Pattern ownership. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [McCarthy Tétrault](https://mccarthy.ca/en/experience/cordelio-power-enters-into-definitive-agreement-in-connection-with-its-sale-to-pattern-energy-group). CPP Investments, through Pattern Energy, announced a platform merger with Cordelio Power to create a combined renewable energy platform.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [patternenergy](https://patternenergy.com/pattern-energy-announces-agreement-to-acquire-cordelio-power/). The release identifies Cordelio as wholly owned by CPP and CPP as Pattern's majority shareholder.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 11. `INF-2026-087` — atNorth

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | CPP Investments (FUND; BUYER) |
| Sponsor lineage | CPP Investments → CPP Investments (ADVISER); Partners Group → CPP Investments (ADVISER) |
| Date / sector / region | 2026-02-28 · Digital · Europe · Iceland |
| Transaction structure | ACQUISITION / SALE / CAPITAL_RAISE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [investor.equinix.com](https://investor.equinix.com/news-events/press-releases/detail/1099/cpp-investments-and-equinix-to-acquire-atnorth-for-us4). Buyer's investor-relations transaction announcement; archive link was a placeholder.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 12. `WB-2026-05-02-007` — NEXTDC

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | CPP Investments (FUND; BUYER) |
| Sponsor lineage | CPP Investments → CPP Investments (ADVISER) |
| Date / sector / region | 2026-05-08 · Digital · Asia-Pacific · Australia |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Marketindex](https://marketindex.com.au/asx/nxt/announcements/becoming-a-substantial-holder-2A1670726). CPP Investments disclosed a substantial holding in NEXTDC Limited, Australia’s listed data-center operator, representing 36,750,320 ordinary shares and 5.09% voting power. The position follows NEXTDC’s recent equity issuance and capital plan to support accelerated data-center development. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; Marketindex's contemporaneous report identifies the parties and transaction terms used to classify NEXTDC.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 13. `WB-2026-06-20-008` — CtrlS Datacenters

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | CPP Investments (FUND; BUYER) |
| Sponsor lineage | CPP Investments → CPP Investments (ADVISER) |
| Date / sector / region | 2026-06-19 · Digital · Asia-Pacific · India |
| Transaction structure | JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Cppinvestments](https://cppinvestments.com/newsroom/cpp-investments-commits-c1-billion-to-ctrls-data-centre-partnership-in-india). CPP Investments committed up to C$1bn to CtrlS Datacenters, including INR 40bn, or approximately C$588mm, to acquire an 8.2% stake in the company. The partnership also includes a 48% CPP Investments interest in a new platform to develop hyperscale data center campuses across India.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 14. `WB-2026-07-03-010` — EQT AI Infrastructure / EdgeConneX

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | CPP Investments (FUND; BUYER) |
| Sponsor lineage | CPP Investments → CPP Investments (ADVISER) |
| Date / sector / region | 2026-07-03 · Digital · North America · Global |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Newswire](https://newswire.ca/news-releases/cpp-investments-partners-with-eqt-to-support-global-digital-infrastructure-growth-826226428.html). CPP Investments closed a US$1.75bn investment alongside EQT to support global digital infrastructure growth led by EdgeConneX. The transaction provides scaled equity backing for AI-driven data-center expansion.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 15. `WB-2026-07-31-020` — Tarchon Interconnector

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | CPP Investments (FUND; BUYER) |
| Sponsor lineage | CPP Investments → CPP Investments (ADVISER); Copenhagen Infrastructure Partners → CPP Investments (ADVISER) |
| Date / sector / region | 2026-07-31 · Utilities · Europe · United Kingdom / Germany |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Investor](https://investor.eliagroup.eu/en/newsroom/2026/07/20260729_elia-cpp-investments-tarchon). CPP Investments agreed to commit approximately C$1bn for a majority interest in Tarchon, a proposed 1.4 GW electricity interconnector between the United Kingdom and Germany. WindGrid will hold a 25% look-through minority interest, and Copenhagen Infrastructure V, managed by CIP, is the seller.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 16. `INF-2026-157` — Three 5MW biomass plants in Croatia

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Croatian Biomass Platform (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Ancala Partners → Croatian Biomass Platform (INDIRECT_OWNER) |
| Date / sector / region | 2026-04-02 · Power & ET · Europe · Croatia |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Croatian Biomass Platform was an already-owned operating company/platform on 2026-04-02 and acted as the transaction buyer/investor. Ancala Partners is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Ancala Partners](https://ancala.com/ancalas-croatian-biomass-platform-acquires-three-plants). Ancala’s Croatian Biomass Platform acquired three 5MW biomass plants from The Sherif Group, more than doubling renewable generation capacity to 25MW. The five-site platform now generates approximately 200,000 MWh annually, equivalent to powering more than 45,000 homes, with the newly acquired plants backed by long-term feed-in tariffs and biomass supply agreements.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 17. `INF-2026-067` — G.Network

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Cube Infrastructure Managers vehicle (FUND; SELLER) |
| Sponsor lineage | Cube Infrastructure Managers → Cube Infrastructure Managers vehicle (ADVISER) |
| Date / sector / region | 2026-01-05 · Digital · Europe · United Kingdom |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | Cube disposed of its ownership interest in G.Network, making the event a fund exit. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [ThinkBroadband](https://thinkbroadband.com/news/alt-net-g-network-sold-to-debt-specialist-fitzwalter-capital). Cube Infrastructure Managers announced the divestiture of its stake in G.Network, a London-based fiber broadband company.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 18. `INF-2026-152` — 24H Frost

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | CubeCold (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | I Squared Capital → CubeCold (INDIRECT_OWNER) |
| Date / sector / region | 2026-04-01 · Transportation · Europe · France |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | CubeCold was an already-owned operating company/platform on 2026-04-01 and acted as the transaction buyer/investor. I Squared Capital is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [CubeCold](https://cubecold.com/cubecold-enters-the-french-cold-storage-market-with-the-acquisition-of-24h-frost). CubeCold entered the French market through the acquisition of 24H Frost, adding a fully automated cold-storage facility in the port of Loon-Plage, Dunkirk. The site offers more than 12,000 frozen pallet positions, and the acquisition expands CubeCold’s network to over 700,000 pallet spaces across six European markets.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 19. `WB-2026-07-24-002` — Cubico–CFE Mexico JV

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Cubico Sustainable Investments (OPERATING_PORTFOLIO_COMPANY; JOINT_VENTURE) |
| Sponsor lineage | Ontario Teachers' Pension Plan → Cubico Sustainable Investments (INDIRECT_OWNER); PSP Investments → Cubico Sustainable Investments (INDIRECT_OWNER) |
| Date / sector / region | 2026-07-24 · Power & ET · North America · Mexico |
| Transaction structure | JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | Cubico itself signed the 25-year CFE JV and is a renewable-energy operating/development platform. Its owners are disclosed only as ownership lineage. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Cubicoinvest](https://cubicoinvest.com/news/cubico-cfe-sign-landmark-partnership-to-deliver-578-mwac-of-projects-and-close-to-us1-billion-of-investment). Ontario Teachers- and PSP-owned Cubico signed a 25-year joint venture agreement with CFE covering five renewable projects totaling 578 MWac plus 175.7 MW / 500 MWh of battery storage. The partnership is expected to unlock nearly US$1 billion of investment across Tamaulipas, Nuevo León, Campeche and the Yucatán Peninsula.
- **PRIMARY · OWNERSHIP** — [cubicoinvest](https://www.cubicoinvest.com/). Use the cited contemporaneous transaction/ownership statement to document date-valid sponsor lineage; confirm legal entity name during human review.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 20. `INF-2026-050` — iPark

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **RECLASSIFY** |
| Acting entity | CVC DIF (FUND; BUYER) |
| Sponsor lineage | CVC DIF → CVC DIF (ADVISER) |
| Date / sector / region | 2026-01-08 · Transportation · Europe · Spain / Portugal |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | CVC's primary announcement calls iPark an Iberian parking-infrastructure platform. The frozen seed's United Kingdom country is unsupported; Europe remains the correct region. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [CVC](https://cvc.com/media/news/2026/cvc-dif-to-acquire-leading-iberian-parking-infrastructure-platform-ipark-from-elliott-investment-management). CVC DIF announced the platform acquisition of iPark, a parking infrastructure company in the United Kingdom.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 21. `INF-2026-064` — Celeste

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | CVC DIF (FUND; BUYER) |
| Sponsor lineage | CVC DIF → CVC DIF (ADVISER); InfraVia → CVC DIF (ADVISER) |
| Date / sector / region | 2026-01-14 · Digital · Europe · France |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [CVC](https://cvc.com/media/news/2026/cvc-dif-has-entered-exclusive-negotiations-to-acquire-a-significant-majority-stake-in-celeste). CVC DIF announced the acquisition of an 88% stake in Celeste, a French fiber and telecom company, from InfraVia.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 22. `INF-2026-044` — American Roads

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | CVC DIF (FUND; SELLER) |
| Sponsor lineage | CVC DIF → CVC DIF (ADVISER) |
| Date / sector / region | 2026-02-13 · Transportation · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [ENR](https://enr.com/articles/62530-john-laing-to-acquire-american-roads-signaling-durable-demand-for-us-toll-assets). CVC DIF announced the divestiture of American Roads, a toll road operating platform in the United States. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; ENR's contemporaneous report identifies the parties and transaction terms used to classify American Roads.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 23. `INF-2026-146` — A63 Motorway

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | CVC DIF (FUND; SELLER) |
| Sponsor lineage | HICL Infrastructure → CVC DIF (ADVISER); CVC DIF → CVC DIF (ADVISER) |
| Date / sector / region | 2026-03-26 · Transportation · Europe · France |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Mundys](https://mundys.com/en/press-release/mundys-abertis-completes-acquisition-of-100-stake-in-france-s-a63-motorway). Abertis acquired the remaining 49% of the A63 motorway in France from HICL Infrastructure, CVC DIF, and NGE Autoroutes, taking full ownership of the 104 km concession.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 24. `WB-2026-07-03-006` — Klara Renewables

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | CVC DIF (FUND; SELLER) |
| Sponsor lineage | CVC DIF → CVC DIF (ADVISER) |
| Date / sector / region | 2026-07-03 · Power & ET · Europe · Poland |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Act](https://act.is/2026/07/02/actis-acquires-klara-renewables-from-cvc-dif-and-launches-a-new-renewable-energy-platform-in-poland). Actis agreed to acquire Klara Renewables from CVC DIF, launching a Polish renewables platform anchored by 171 MW of operating onshore wind assets. The portfolio also carries solar PV and battery-storage hybridization potential.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.
