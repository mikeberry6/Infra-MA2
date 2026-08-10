# first-015 — first review

Cutoff: 2026-08-07
Records: 23
Packet hash: `cc7590f8d53a634f3d1cb87f0f7a263fb898ed78db5d1ef78325c233c1804575`

Open every transaction and ownership source for every decision in this packet. Verify the universe disposition, parties, date, sector, region, transaction structure, acting principal, sponsor lineage, and authoritative scope. The bold recommended scope is the evidence-derived proposal under review; the original automation candidate is shown only for lineage and is not an approval.

Use the matching `.worksheet.json` file for the normal compact workflow. For each record, set `evidenceOpened` to `true`, choose `ACCEPT_RECOMMENDATION` or `EDITED_RECORD`, and add a substantive record-specific note. Replace the reviewer and timestamp placeholders and set every human-attestation value to `true`. The review command compiles the compact worksheet against this immutable packet and then routes it through the existing full review validator. The matching `.review.json` remains available for advanced edits and legal-transaction splits.

One named human may approve this evidence-backed batch only after opening every record's evidence. Only verified risk exceptions will be queued separately for second review.

## Packet summary

| ID | Target | **Recommended scope** | Original automation candidate *(not approval)* | Disposition | Second-review risks |
| --- | --- | --- | --- | --- | --- |
| INF-2026-100 | Arqiva | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-115 | Arqiva | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-03-023 | InstaVolt Iberian EV charging business | **PORTFOLIO_COMPANY** | DIRECT_FUND | KEEP | None |
| INF-2026-177 | Alliance Energy Group Portfolio | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-07-03-001 | Roseton Generating Facility | **PORTFOLIO_COMPANY** | DIRECT_FUND | KEEP | None |
| WB-2026-07-10-016 | MidOcean Energy | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| WB-2026-05-16-003 | FirstLight U.S. Clean-Power Portfolio | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| WB-2026-07-17-003 | Formosa 2 Offshore Wind Farm | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-022 | Kalfresh Bioenergy Facility | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-31-018 | Epic Energy | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-018 | Flexitricity | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-31-003 | U.S. Distributed Solar Portfolio | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-08-07-008 | Massachusetts Central Railroad / Wildwood Reload | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-045 | APP Jet Center | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-120 | Sierra Railroad Company | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-06-13-008 | Dauntless Air | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-05-23-009 | Naturgy Energy Group | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-080 | Reload | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-06-27-005 | Yarnton BESS | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| WB-2026-05-16-007 | APF Energy | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-005 | 283 MW UK Solar PV Portfolio | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| WB-2026-07-03-015 | Kao Data | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-121 | Central Valley Ag Transport (CVAT) | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | BUNDLED_LEGAL_TRANSACTIONS |

## Record worksheets

### 1. `INF-2026-100` — Arqiva

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Polus Capital Management (ADVISED_VEHICLE; BUYER) |
| Sponsor lineage | Polus Capital Management → Polus Capital Management (ADVISER); Macquarie Asset Management → Polus Capital Management (ADVISER) |
| Date / sector / region | 2026-03-02 · Digital · Europe · United Kingdom |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Broadband TV News](https://broadbandtvnews.com/2026/03/02/polus-to-buy-26-54-stake-in-arqiva-from-macquarie). Macquarie Asset Management divested a minority stake in Arqiva, the UK's sole national provider of terrestrial television and radio broadcast infrastructure. Arqiva operates the transmission network delivering Freeview, DAB digital radio, and mobile connectivity services across the United Kingdom. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; Broadband TV News's contemporaneous report identifies the parties and transaction terms used to classify Arqiva.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 2. `INF-2026-115` — Arqiva

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Polus Capital Management (ADVISED_VEHICLE; BUYER) |
| Sponsor lineage | Polus Capital Management → Polus Capital Management (ADVISER); IFM Investors → Polus Capital Management (ADVISER) |
| Date / sector / region | 2026-03-09 · Digital · Europe · United Kingdom |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Investegate](https://investegate.co.uk/announcement/rns/arqiva-financing-plc--20ca/shareholder-transaction-update-/9472750). Funds managed by IFM Investors agreed to divest their 14.84% minority stake in Arqiva, the UK's leading broadcast and telecommunications infrastructure operator, to Polus Capital Management for GBP 8.9mm. The sale follows Polus's earlier acquisition of Macquarie Asset Management's 26.54% stake, bringing Polus's combined equity interest in Arqiva to 41.38%. Arqiva's revenue base is underpinned by long-term, RPI-linked contracts with investment-grade counterparties including the BBC and major mobile network operators.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 3. `WB-2026-07-03-023` — InstaVolt Iberian EV charging business

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Powerdot (OPERATING_PORTFOLIO_COMPANY; SELLER) |
| Sponsor lineage | Antin Infrastructure Partners → Powerdot (INDIRECT_OWNER); EQT Infrastructure → Powerdot (INDIRECT_OWNER) |
| Date / sector / region | 2026-07-03 · Transportation · Europe · Spain / Portugal |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | InstaVolt sold its Iberian operations to operating EV-charging company Powerdot. InstaVolt's source calls EQT a supporting shareholder, while Powerdot separately identifies Antin as an existing investor. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Instavolt](https://instavolt.co.uk/news/instavolt-agrees-sale-of-spanish-and-portuguese-businesses-to-powerdot-to-accelerate-uk-and-ireland-growth-strategy). Antin-backed Powerdot agreed to acquire InstaVolt's Spanish and Portuguese operations from EQT-backed InstaVolt. The divestiture transfers the Iberian charging network and related employees to a regional EV infrastructure platform.
- **PRIMARY · OWNERSHIP** — [powerdot](https://powerdot.eu/en/about-us). Use the cited contemporaneous transaction/ownership statement to document date-valid sponsor lineage; confirm legal entity name during human review.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 4. `INF-2026-177` — Alliance Energy Group Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | PowerTransitions (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Partners Group → PowerTransitions (INDIRECT_OWNER) |
| Date / sector / region | 2026-04-21 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | PowerTransitions was an already-owned operating company/platform on 2026-04-21 and acted as the transaction buyer/investor. Partners Group is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Business Wire](https://businesswire.com/news/home/20260421669080/en/PowerTransitions-to-Enter-New-York-Market-with-Acquisition-of-323-MW-of-Operating-Power-Generation-Assets). PowerTransitions agreed to acquire a five-plant, 323 MW portfolio — comprising the Batavia, Hillburn, Massena, Shoemaker and Sterling assets — along with associated pipeline infrastructure from Alliance Energy Group, marking the Partners Group-backed platform’s entry into the New York market. The transaction will lift PowerTransitions’ total operating fleet to roughly 550 MW across seven stations supplying multiple NYISO zones.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 5. `WB-2026-07-03-001` — Roseton Generating Facility

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | PowerTransitions (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Partners Group → PowerTransitions (INDIRECT_OWNER) |
| Date / sector / region | 2026-07-03 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | PowerTransitions, an already-owned operating power platform, agreed to acquire Roseton as an add-on; Partners Group is sponsor lineage rather than the buyer. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Power Transitions](https://power-transitions.com/news-and-insights/roseton-acquisition). Partners Group-backed PowerTransitions agreed to acquire the 1,242 MW Roseton Generating Facility in New York. The add-on expands the platform's operating power-generation footprint in a capacity-constrained U.S. market.
- **PRIMARY · OWNERSHIP** — [power-transitions](https://www.power-transitions.com/news/). Use the cited contemporaneous transaction/ownership statement to document date-valid sponsor lineage; confirm legal entity name during human review.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 6. `WB-2026-07-10-016` — MidOcean Energy

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Private Department of Sheikh Mohammed bin Khalid Al Nahyan (ADVISED_VEHICLE; INVESTOR) |
| Sponsor lineage | Private Department of Sheikh Mohammed bin Khalid Al Nahyan → Private Department of Sheikh Mohammed bin Khalid Al Nahyan (ADVISER) |
| Date / sector / region | 2026-07-10 · Midstream · North America · North America / Global |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | The Private Department, an Abu Dhabi investment and asset-management platform, committed US$1.13bn to MidOcean as principal. EIG manages MidOcean and entered a parallel strategic partnership but is not the investor in the disclosed capital transaction. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Business Wire](https://businesswire.com/news/home/20260707259928/en). The Private Department of Sheikh Mohammed bin Khalid Al Nahyan committed US$1.13 billion to MidOcean Energy, the global LNG company formed and managed by EIG. The investment expands MidOcean’s institutional shareholder base and supports the platform’s LNG growth strategy.
- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [lngindustry](https://www.lngindustry.com/liquid-natural-gas/08072026/private-department-of-sheikh-mohammed-bin-khalid-al-nahyan-invests-in-midocean-energy/). The report reproduces the parties' announcement that the Private Department committed US$1.13bn to MidOcean, while EIG and the Private Department separately formed a strategic partnership. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; lngindustry's contemporaneous report identifies the parties and transaction terms used to classify MidOcean Energy.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 7. `WB-2026-05-16-003` — FirstLight U.S. Clean-Power Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | PSP Investments (FUND; SELLER) |
| Sponsor lineage | PSP Investments → PSP Investments (ADVISER) |
| Date / sector / region | 2026-05-22 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | PSP Investments itself is the selling institutional fund principal in the portfolio divestiture, so this is a direct fund exit. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Investpsp](https://investpsp.com/en/news/psp-investments-announces-sale-of-firstlights-us-portfolio-to-hull-street-energy). PSP Investments states that it agreed to sell FirstLight's U.S. operating portfolio to Hull Street Energy while retaining the Canadian platform.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 8. `WB-2026-07-17-003` — Formosa 2 Offshore Wind Farm

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | PSP Investments (FUND; BUYER) |
| Sponsor lineage | PSP Investments → PSP Investments (ADVISER) |
| Date / sector / region | 2026-07-17 · Power & ET · Asia-Pacific · Taiwan |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | PSP Investments is a direct institutional co-acquirer of Formosa 2 and will share joint control with JERA Nex bp. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Eur Lex](https://eur-lex.europa.eu/legal-content/EN/TXT?uri=OJ%3AC_202603887). PSP Investments and JERA Nex bp will acquire joint control of Formosa 2 through a purchase of shares, according to an EU merger notice published July 16. The operating Taiwanese offshore wind farm has 376 MW of capacity.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 9. `INF-2026-022` — Kalfresh Bioenergy Facility

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | QIC (FUND; BUYER) |
| Sponsor lineage | QIC → QIC (ADVISER); Wollemi Capital → QIC (ADVISER) |
| Date / sector / region | 2026-02-18 · Social Infra · Asia-Pacific · Australia |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Kalfresh](https://kalfresh.com.au/80m-backing-for-paddock-to-power-precinct). QIC and Wollemi Capital co-invested A$80mm in the Kalfresh Bioenergy Facility, a waste-to-energy project in Australia.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 10. `WB-2026-07-31-018` — Epic Energy

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | QIC (FUND; SELLER) |
| Sponsor lineage | MSIP → QIC (ADVISER); QIC → QIC (ADVISER) |
| Date / sector / region | 2026-07-31 · Midstream · Asia-Pacific · Australia |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Morganstanley](https://morganstanley.com/im/en-be/intermediary-investor/insights/press-release/msip-to-acquire-epic-energy.html). MSIP agreed to acquire Epic Energy from QIC Infrastructure. The transaction transfers an established Australian gas-pipeline and energy-infrastructure operator with a 50-year operating history; financial terms were not disclosed.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 11. `INF-2026-018` — Flexitricity

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Quinbrook Infrastructure Partners (FUND; SELLER) |
| Sponsor lineage | Quinbrook Infrastructure Partners → Quinbrook Infrastructure Partners (ADVISER) |
| Date / sector / region | 2026-01-21 · Power & ET · Europe · United Kingdom |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Quinbrook](https://quinbrook.com/news-insights/quinbrook-sells-flexitricity-to-drax). Quinbrook Infrastructure Partners announced the divestiture of Flexitricity Limited, a demand response and energy services company in the UK.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 12. `WB-2026-07-31-003` — U.S. Distributed Solar Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | REC Power (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | ArcLight → REC Power (INDIRECT_OWNER) |
| Date / sector / region | 2026-07-31 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | REC Power was an already-owned operating company/platform on 2026-07-31 and acted as the transaction buyer/investor. ArcLight is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Recpower](https://recpower.com/about/news/adapture-renewables-and-rec-power-announce-completion-of-transaction-for-68-mw-operating-dg-solar-portfolio). ArcLight-backed REC Power completed the acquisition of 15 operating distributed-generation solar projects totaling 68 MW from Adapture Renewables. The portfolio broadens REC Power’s contracted operating base across U.S. power markets.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 13. `WB-2026-08-07-008` — Massachusetts Central Railroad / Wildwood Reload

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Regional Rail (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | 3i → Regional Rail (INDIRECT_OWNER) |
| Date / sector / region | 2026-08-07 · Transportation · North America · Massachusetts, United States |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Regional Rail was an already-owned operating company/platform on 2026-08-07 and acted as the transaction buyer/investor. 3i is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [3i](https://3i.com/media/news/2026/regional-rail-expands-northeast-network-with-the-acquisition-of-the-massachusetts-central-railroad). 3i-backed Regional Rail acquired the 28-mile Massachusetts Central Railroad and Wildwood Reload’s warehousing and transloading operations. The bolt-on extends a network that now reaches 18 railroads across 10 U.S. states and two Canadian provinces.
- **PRIMARY · OWNERSHIP** — [3i](https://www.3i.com/media/news/2019/3i-agrees-to-invest-in-regional-rail-to-support-growth/). 3i announced its Regional Rail investment before the bolt-on.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 14. `INF-2026-045` — APP Jet Center

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Ridgewood Infrastructure (FUND; SELLER) |
| Sponsor lineage | Ridgewood Infrastructure → Ridgewood Infrastructure (ADVISER) |
| Date / sector / region | 2026-01-27 · Transportation · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Bain Capital](https://baincapital.com/news/bain-capital-enters-fixed-base-operator-sector-acquisition-app-jet-center). Ridgewood Infrastructure announced the divestiture of APP Jet Center, a fixed-base operator (FBO) platform.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 15. `INF-2026-120` — Sierra Railroad Company

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Ridgewood Infrastructure (FUND; BUYER) |
| Sponsor lineage | Ridgewood Infrastructure → Ridgewood Infrastructure (ADVISER) |
| Date / sector / region | 2026-03-11 · Transportation · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [PR Newswire](https://prnewswire.com/news-releases/ridgewood-infrastructure-acquires-sierra-railroad-company-302708445.html). Ridgewood Infrastructure acquired a controlling interest in Sierra Railroad Company, a California-based shortline rail platform providing freight rail, switching, storage, and transloading services across approximately 130 miles of track. Founded in 1897, Sierra's network is strategically positioned near major agricultural and dairy production regions, key West Coast ports, and major industrial centers, with interconnections to both Union Pacific and BNSF Class I networks. The platform also includes Railpower, Inc., which owns the only FRA-approved hydrogen-powered locomotive in the U.S.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 16. `WB-2026-06-13-008` — Dauntless Air

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Ridgewood Infrastructure (FUND; BUYER) |
| Sponsor lineage | Ridgewood Infrastructure → Ridgewood Infrastructure (ADVISER) |
| Date / sector / region | 2026-06-12 · Social Infra · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [PR Newswire](https://prnewswire.com/news-releases/ridgewood-infrastructure-acquires-dauntless-air-premier-provider-of-emergency-management-infrastructure-302795749.html). Ridgewood Infrastructure acquired Dauntless Air, a provider of emergency-management infrastructure for wildfire response. The business supports aerial firefighting and mission-critical public-safety operations across North America.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 17. `WB-2026-05-23-009` — Naturgy Energy Group

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Rioja Acquisition S.a r.l. (NON_OPERATING_ACQUISITION_SPV; SELLER) |
| Sponsor lineage | CVC → Rioja Acquisition S.a r.l. (ADVISER) |
| Date / sector / region | 2026-05-29 · Utilities · Europe · Spain |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | CVC's non-operating holding SPV is the legal seller in a sponsor exit, making the event direct fund activity. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Reuters](https://reuters.com/legal/transactional/cvc-sells-138-stake-spains-naturgy-worth-around-4-billion-2026-05-26). Reuters reports that CVC sold its entire 13.8% Naturgy stake through an accelerated bookbuild and related derivative settlement. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; Reuters's contemporaneous report identifies the parties and transaction terms used to classify Naturgy Energy Group.
- **REGULATORY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [cnmv](https://www.cnmv.es/webservices/verdocumento/ver?t=%7Bf2424f22-e48f-4e52-8366-33ef3bb8ea3c%7D). The CNMV filing names Rioja Acquisition as seller, confirms the placement of 11.08% and derivative settlement, and states that Rioja disposed of its entire 13.80% Naturgy stake.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 18. `INF-2026-080` — Reload

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Scale Microgrids (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | EQT Infrastructure → Scale Microgrids (INDIRECT_OWNER) |
| Date / sector / region | 2026-02-28 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Scale Microgrids was an already-owned operating company/platform on 2026-02-28 and acted as the transaction buyer/investor. EQT Infrastructure is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [businesswire.com](https://www.businesswire.com/news/home/20260223451115/en/Scale-Acquires-Reload-to-Accelerate-Power-Delivery-for-the-Next-Generation-of-Data-Centers). Company transaction announcement syndicated by Business Wire; archive link was a placeholder.
- **PRIMARY · OWNERSHIP** — [eqtgroup](https://eqtgroup.com/news/eqt-to-acquire-distributed-energy-company-scale-microgrids). EQT announced its acquisition of Scale Microgrids before the transaction.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 19. `WB-2026-06-27-005` — Yarnton BESS

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Schroders Greencoat / Wessex Gardens renewable infrastructure fund (FUND; BUYER) |
| Sponsor lineage | Schroders Greencoat → Schroders Greencoat / Wessex Gardens renewable infrastructure fund (ADVISER); Wessex Gardens → Schroders Greencoat / Wessex Gardens renewable infrastructure fund (ADVISER) |
| Date / sector / region | 2026-06-26 · Power & ET · Europe · United Kingdom |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | The named renewable infrastructure fund acquired Yarnton BESS directly. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Rivingtonenergy](https://rivingtonenergy.co.uk/2026/06/rivington-energy-announces-sale-of-oxfordshire-battery-energy-storage-system). A Schroders Greencoat / Wessex Gardens renewable infrastructure fund acquired the 50 MW Yarnton battery energy storage system in Oxfordshire from Rivington Energy. The transaction adds a grid-scale storage asset in a constrained UK power market.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 20. `WB-2026-05-16-007` — APF Energy

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Schroders Greencoat global strategy and semi-liquid funds (FUND; BUYER) |
| Sponsor lineage | Schroders Greencoat → Schroders Greencoat global strategy and semi-liquid funds (ADVISER) |
| Date / sector / region | 2026-05-22 · Power & ET · Europe · Netherlands |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | Schroders Greencoat investment funds are the acquisition principals and SWEN's fund is exiting, making the transaction direct fund activity on both sides. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Swen Cp](https://swen-cp.fr/en/blog/2026/05/19/first-exit-of-swift-2-schroders-capital-acquires-apf-energy). Seller SWEN states that Schroders Greencoat acquired 100% of APF Energy from SWEN's impact strategy and APF BV.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 21. `INF-2026-005` — 283 MW UK Solar PV Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Schroders Greencoat-managed acquisition vehicle (ADVISED_VEHICLE; BUYER) |
| Sponsor lineage | Schroders Greencoat → Schroders Greencoat-managed acquisition vehicle (ADVISER) |
| Date / sector / region | 2026-02-04 · Power & ET · Europe · United Kingdom |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | The disclosed principal is the Schroders Greencoat-managed capital acquiring the UK solar portfolio; no operating portfolio company is identified as the buyer. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Inspenet](https://inspenet.com/en/noticias/metlen-agrees-to-sell-283-mw-of-solar-power-to-schroders-greencoat-in-the-uk). Schroders Greencoat acquired a 283 MW solar PV portfolio in the United Kingdom.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 22. `WB-2026-07-03-015` — Kao Data

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Siemens Financial Services digital-infrastructure equity portfolio (ADVISED_VEHICLE; INVESTOR) |
| Sponsor lineage | Siemens Financial Services → Siemens Financial Services digital-infrastructure equity portfolio (ADVISER) |
| Date / sector / region | 2026-07-03 · Digital · Europe · United Kingdom |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | Siemens Financial Services invested in Kao Data through its institutional digital-infrastructure equity portfolio. A financial-investment vehicle is the principal, so the investment is direct even if the shares were newly issued by Kao. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Bebeez](https://bebeez.eu/2026/07/02/siemens-financial-invests-in-uk-data-center-operator-kao-data). Siemens Financial Services made a minority equity investment in Kao Data, the UK data-center platform backed by Infratil and Legal & General. The capital supports expansion of Kao's high-performance computing and AI-ready campus footprint.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [linkedin](https://www.linkedin.com/posts/siemens-financial-services_datacenters-equityinvestment-digitalinfrastructure-activity-7478160553102790658--c3O). Siemens Financial Services describes the Kao Data stake as an addition to its digital-infrastructure equity portfolio and says it invested alongside Legal & General; it does not describe Infratil as a seller.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 23. `INF-2026-121` — Central Valley Ag Transport (CVAT)

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Sierra Railroad Company (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Ridgewood Infrastructure → Sierra Railroad Company (INDIRECT_OWNER) |
| Date / sector / region | 2026-03-11 · Transportation · North America · United States |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | BUNDLED_LEGAL_TRANSACTIONS |
| Scope rationale | One primary announcement covers Ridgewood's acquisition of control of Sierra and Sierra's simultaneous acquisition of CVAT. The two acquisitions are legally distinct and already map to separate legacy records. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [PR Newswire](https://prnewswire.com/news-releases/ridgewood-infrastructure-acquires-sierra-railroad-company-302708445.html). Simultaneously with Ridgewood's acquisition of Sierra Railroad, Sierra acquired Central Valley Ag Transport, an agricultural products transload facility owner and operator serving customers along Sierra's rail network. The bolt-on vertically integrates agricultural transload capabilities essential to California's dairy and broader agricultural industry, enabling efficient movement of feed and agricultural products while deepening customer relationships and increasing rail utilization.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [prnewswire](https://www.prnewswire.com/news-releases/ridgewood-infrastructure-acquires-sierra-railroad-company-302708445.html). The same source establishes Sierra as the CVAT buyer and Ridgewood's simultaneous new control of Sierra.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.
