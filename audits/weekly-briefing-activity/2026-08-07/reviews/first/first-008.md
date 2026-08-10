# first-008 — first review

Cutoff: 2026-08-07
Records: 24
Packet hash: `d5cfda79757142c8c22bf152744ecbf9d6a88afc65322d153068d1f00b8748a1`

Open every transaction and ownership source for every decision in this packet. Verify the universe disposition, parties, date, sector, region, transaction structure, acting principal, sponsor lineage, and authoritative scope. The bold recommended scope is the evidence-derived proposal under review; the original automation candidate is shown only for lineage and is not an approval.

Use the matching `.worksheet.json` file for the normal compact workflow. For each record, set `evidenceOpened` to `true`, choose `ACCEPT_RECOMMENDATION` or `EDITED_RECORD`, and add a substantive record-specific note. Replace the reviewer and timestamp placeholders and set every human-attestation value to `true`. The review command compiles the compact worksheet against this immutable packet and then routes it through the existing full review validator. The matching `.review.json` remains available for advanced edits and legal-transaction splits.

One named human may approve this evidence-backed batch only after opening every record's evidence. Only verified risk exceptions will be queued separately for second review.

## Packet summary

| ID | Target | **Recommended scope** | Original automation candidate *(not approval)* | Disposition | Second-review risks |
| --- | --- | --- | --- | --- | --- |
| INF-2026-086 | Masdar Portuguese Wind Portfolio | **PORTFOLIO_COMPANY** | UNRESOLVED | KEEP | None |
| INF-2026-061 | Prince George's County Schools P3 | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-06-06-003 | Enderby Battery Storage Project | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-07-24-005 | Burton Wold & Winscales Moor Wind Farms | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| INF-2026-078 | Truespeed & Freedom Fibre | **PORTFOLIO_COMPANY** | DIRECT_FUND | KEEP | None |
| WB-2026-06-20-009 | Transcend Towers Infrastructure | **PORTFOLIO_COMPANY** | PORTFOLIO_COMPANY | KEEP | None |
| WB-2026-06-06-006 | GS Power Community Solar Portfolio | **DIRECT_FUND** | DIRECT_FUND | KEEP | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| INF-2026-181 | Spectrotel & AireSpring | **DIRECT_FUND** | DIRECT_FUND | KEEP | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| INF-2026-139 | Equinox Growers Greenhouse Facility | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-195 | 104 MW Community Solar Portfolio | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-05-16-012 | Seraya Partners Fund I Interest | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-124 | Kelda Holdings (Yorkshire Water) | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-184 | Teréga S.A.S. | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-199 | Seven Brazilian Transmission Assets | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-03-024 | Genus Power Infrastructures | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-098 | AES Corporation | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-109 | TCR | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-189 | Saavi Energía & Grupo México Power Assets | **DIRECT_FUND** | DIRECT_FUND | RECLASSIFY | None |
| INF-2026-040 | Rio Grande LNG Trains 4 & 5 | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| INF-2026-215 | 187 MW Taiwan Solar Portfolio | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |
| WB-2026-07-17-002 | Summit Ridge Energy | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| WB-2026-07-31-010 | Yondr Slough Campus | **DIRECT_FUND** | DIRECT_FUND | KEEP | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| WB-2026-06-06-011 | Delfin FLNG 1 | **DIRECT_FUND** | UNRESOLVED | KEEP | None |
| INF-2026-116 | Nighthawk Energy Storage Project | **DIRECT_FUND** | DIRECT_FUND | KEEP | None |

## Record worksheets

### 1. `INF-2026-086` — Masdar Portuguese Wind Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Exus Renewables (OPERATING_PLATFORM; BUYER) |
| Sponsor lineage | Partners Group → Exus Renewables (INDIRECT_OWNER) |
| Date / sector / region | 2026-02-28 · Power & ET · Europe · Portugal |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | Exus Renewables signed the acquisition itself. Masdar describes Exus as an integrated energy platform, and prior primary evidence establishes it as a Partners Group-backed platform that builds, owns, and operates renewable assets; no Partners Group fund vehicle is a transaction party. |
| Disposition rationale | KEEP: the previously uncited Masdar record now has recovered transaction evidence in the frozen audit inputs. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [masdar.ae](https://masdar.ae/en/news/newsroom/exus-renewables-to-acquire-stake-in-masdars-portuguese-wind-portfolio). Seller's transaction announcement for the remaining uncited seed-only record.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [exusrenewables](https://www.exusrenewables.com/news/partners-group-to-invest-in-exus). Exus states that Partners Group invested before the Portuguese wind transaction to transform Exus into a platform that builds, owns, and operates renewable assets while continuing its asset-management operations.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 2. `INF-2026-061` — Prince George's County Schools P3

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Fengate Asset Management (FUND; SELLER) |
| Sponsor lineage | Fengate Asset Management → Fengate Asset Management (ADVISER) |
| Date / sector / region | 2026-02-03 · Social Infra · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Infralogic](https://ionanalytics.com/insights/infralogic/fengate-negotiates-sale-of-school-conrac-p3s). Fengate Asset Management announced the divestiture of its interest in the Prince George's County Schools P3 project in Maryland. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; Infralogic's contemporaneous report identifies the parties and transaction terms used to classify Prince George's County Schools P3.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 3. `WB-2026-06-06-003` — Enderby Battery Storage Project

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Fidra Energy (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | EIG Global Energy Partners → Fidra Energy (INDIRECT_OWNER) |
| Date / sector / region | 2026-06-05 · Power & ET · Europe · United Kingdom |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Fidra Energy was an already-owned operating company/platform on 2026-06-05 and acted as the transaction buyer/investor. EIG Global Energy Partners is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Fidraenergy](https://fidraenergy.com/fidra-energy-accelerates-uk-growth-with-acquisition-of-1gw-enderby-battery-storage-project-from-innova). EIG-backed Fidra Energy acquired the Enderby battery storage project from Innova. The Leicestershire project is expected to deliver up to 1,025 MW once operational and increases Fidra's UK BESS pipeline to more than 4 GW.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 4. `WB-2026-07-24-005` — Burton Wold & Winscales Moor Wind Farms

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Forsa Energy (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | Tiger Infrastructure → Forsa Energy (INDIRECT_OWNER) |
| Date / sector / region | 2026-07-24 · Power & ET · Europe · United Kingdom |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Forsa Energy was an already-owned operating company/platform on 2026-07-24 and acted as the transaction buyer/investor. Tiger Infrastructure is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Forsaenergy](https://forsaenergy.com/news-database/forsa-energy-expands-portfolio-with-acquisition-of-operational-wind-assets). Tiger Infrastructure-backed Forsa Energy acquired the operational Burton Wold and Winscales Moor wind farms from GCP Infra for approximately £11 million. The 17-turbine portfolio totals approximately 26.5 MW and expands Forsa’s UK independent-power-producer platform to 324.5 MW.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 5. `INF-2026-078` — Truespeed & Freedom Fibre

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Freedom Fibre / Truespeed (OPERATING_PORTFOLIO_COMPANY; JOINT_VENTURE) |
| Sponsor lineage | InfraBridge / Equitix → Freedom Fibre / Truespeed (INDIRECT_OWNER) |
| Date / sector / region | 2026-02-11 · Digital · Europe · United Kingdom |
| Transaction structure | JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | The primary source supports an operating-company merger and sponsor support, not legal fund participation. Sponsor branding cannot create a mixed risk. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Freedom Fibre](https://freedomfibre.com/post/freedom-fibre-and-truespeed-announce-intention-to-merge). InfraBridge and Equitix announced the merger of their portfolio companies Truespeed and Freedom Fibre to create a combined UK fiber broadband platform.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [freedomfibre](https://www.freedomfibre.com/post/freedom-fibre-and-truespeed-announce-intention-to-merge). The merger release identifies Aviva Investors, InfraBridge, and Equitix as supporting investors.
- **PRIMARY · OWNERSHIP** — [infrabridge](https://www.infrabridge.com/news/2023-12-20-infrabridge-and-equitix-combine-uk-altnets-vx-fiber-and-freedom-fibre). InfraBridge's earlier primary release establishes its and Equitix's ownership relationship to Freedom Fibre.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 6. `WB-2026-06-20-009` — Transcend Towers Infrastructure

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **PORTFOLIO_COMPANY** |
| Original automation candidate *(research prompt; not approval)* | PORTFOLIO_COMPANY |
| Recommended disposition | **KEEP** |
| Acting entity | Frontier Towers / Transcend Towers Infrastructure (OPERATING_PORTFOLIO_COMPANY; BUYER) |
| Sponsor lineage | BCI → Frontier Towers / Transcend Towers Infrastructure (INDIRECT_OWNER) |
| Date / sector / region | 2026-06-19 · Digital · Asia-Pacific · Philippines |
| Transaction structure | ACQUISITION / BOLT_ON |
| Independent second-review risks | None |
| Scope rationale | Frontier Towers / Transcend Towers Infrastructure was an already-owned operating company/platform on 2026-06-19 and acted as the transaction buyer/investor. BCI is ownership lineage and was not disclosed as directly buying, selling or investing in this transaction; classify PORTFOLIO_COMPANY. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [Frontiertowersphilippines](https://frontiertowersphilippines.com/news/frontier-completes-acquisition-of-american-towers-philippine-tower-portfolio). BCI-backed Frontier Towers completed its acquisition of American Tower's Philippine tower portfolio through Transcend Towers Infrastructure. The transaction adds approximately 400 towers and expands Frontier's nationwide footprint to more than 6,500 sites.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 7. `WB-2026-06-06-006` — GS Power Community Solar Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Funds managed by AB CarVal (FUND; INVESTOR) |
| Sponsor lineage | Funds managed by AB CarVal → Funds managed by AB CarVal (ADVISER) |
| Date / sector / region | 2026-06-03 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / CAPITAL_RAISE |
| Independent second-review risks | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| Scope rationale | AB CarVal-managed funds are the direct tax-equity investor and GS Power is the operating recipient/project sponsor. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Gspowerpartners](https://gspowerpartners.com/gs-power-partners-secures-51m-tax-equity-financing-for-41-mw-community-solar-portfolio). CVC DIF-backed GS Power Partners secured $51mm of tax equity financing for a 41 MWdc community solar portfolio across New York, Maryland, and Illinois. The portfolio-company financing close adds equity capital to distributed solar infrastructure within DIF Infrastructure VII lineage.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [gspowerpartners](https://gspowerpartners.com/gs-power-partners-secures-51m-tax-equity-financing-for-41-mw-community-solar-portfolio/). The release identifies GS Power as CVC DIF-backed and AB CarVal-managed funds as the new investor.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 8. `INF-2026-181` — Spectrotel & AireSpring

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Funds managed by Charlesbank Capital Partners (FUND; INVESTOR) |
| Sponsor lineage | Funds managed by Charlesbank Capital Partners → Funds managed by Charlesbank Capital Partners (ADVISER) |
| Date / sector / region | 2026-04-23 · Digital · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| Scope rationale | Charlesbank-managed funds make a new investment, Grain reinvests, and Spectrotel concurrently combines with AireSpring. The fund and operating-company participation is explicit and simultaneous. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [PR Newswire](https://prnewswire.com/news-releases/grain-management-announces-strategic-transaction-to-scale-spectrotel-through-partnership-with-charlesbank-and-combination-with-airespring-302752196.html). Charlesbank will make a new strategic investment in Grain Management portfolio company Spectrotel, with Grain reinvesting alongside, and concurrently combine the company with AireSpring to form a leading managed network services platform. The Lonstein family, AireSpring’s founders, will remain significant minority investors; together the two businesses combine Spectrotel’s distributed enterprise reach with AireSpring’s global connectivity and managed services capabilities.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [prnewswire](https://www.prnewswire.com/news-releases/grain-management-announces-strategic-transaction-to-scale-spectrotel-through-partnership-with-charlesbank-and-combination-with-airespring-302752196.html). The release identifies Spectrotel as Grain's existing portfolio company and the investors' post-transaction roles.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 9. `INF-2026-139` — Equinox Growers Greenhouse Facility

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Generate Capital (FUND; SELLER) |
| Sponsor lineage | Generate Capital → Generate Capital (ADVISER) |
| Date / sector / region | 2026-03-24 · Social Infra · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Generate Capital](https://generatecapital.com/generate-capital-announces-sale-of-equinox-growers-greenhouse-facility-to-taylor-farms). Generate Capital announced the sale of its Equinox Growers greenhouse facility to Taylor Farms.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 10. `INF-2026-195` — 104 MW Community Solar Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Generate Capital (FUND; BUYER) |
| Sponsor lineage | Generate Capital → Generate Capital (ADVISER) |
| Date / sector / region | 2026-04-29 · Power & ET · North America · United States |
| Transaction structure | JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [GlobeNewswire](https://globenewswire.com/news-release/2026/04/29/3283723/0/en/monarch-private-capital-and-generate-capital-announce-104-mw-energy-investment-portfolio.html). Generate Capital and Monarch Private Capital closed a joint equity investment in a 104 MW community solar portfolio spanning more than 15 projects. The projects are expected to commence operations in the second and third quarters of 2026 and generate approximately $200mm of investment tax credits while expanding local clean power supply.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 11. `WB-2026-05-16-012` — Seraya Partners Fund I Interest

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | GenZero (ADVISED_VEHICLE; BUYER) |
| Sponsor lineage | GenZero → GenZero (ADVISER) |
| Date / sector / region | 2026-05-22 · Digital · Asia-Pacific · Asia-Pacific |
| Transaction structure | ACQUISITION / SECONDARY_SALE |
| Independent second-review risks | None |
| Scope rationale | GenZero is the non-operating investment principal acquiring a fund interest in a secondary transaction, which is direct fund activity. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Genzero](https://genzero.co/genzero-acquires-stake-in-seraya-partners-fund-i-through-secondary-transaction). GenZero states that it acquired a secondary interest in Seraya Partners Fund I from the Asian Infrastructure Investment Bank.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 12. `INF-2026-124` — Kelda Holdings (Yorkshire Water)

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | GIC (FUND; BUYER) |
| Sponsor lineage | EQT Infrastructure → GIC (ADVISER); GIC → GIC (ADVISER) |
| Date / sector / region | 2026-03-12 · Utilities · Europe · United Kingdom |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [EQT Group](https://eqtgroup.com/news/eqt-to-invest-in-kelda-holdings-the-parent-company-of-yorkshire-water-2026-03-09). EQT Active Core Infrastructure agreed to acquire a 42% shareholding in Kelda Holdings, the parent company of Yorkshire Water, which provides essential water and wastewater services to approximately 5.5 million customers across over two million homes and 140,000 businesses in the UK. The transaction sees DWS Infrastructure and Corsair Capital exit their minority positions while GIC increases its stake to 42% and TCorp to 16%, positioning the new shareholder group to support a GBP 8.3bn investment program between 2025 and 2030. EQT has also committed to contributing further equity to strengthen the balance sheet.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 13. `INF-2026-184` — Teréga S.A.S.

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | GIC (FUND; SELLER) |
| Sponsor lineage | GIC → GIC (ADVISER) |
| Date / sector / region | 2026-04-22 · Midstream · Europe · France |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [TradingView / Reuters](https://tradingview.com/news/reuters.com,2026:newsml_L8N414060:0-enagas-buys-31-5-stake-in-french-grid-operator-terega-for-573-million-euros). Spanish gas TSO Enagás agreed to acquire GIC’s 31.5% stake in French operator Teréga for €573mm, with closing expected during 2026 subject to French and Spanish regulatory approvals. Teréga operates approximately 5,100 km of gas transmission pipelines and two underground storage facilities in southwestern France, representing roughly 16% of the national transmission network and 27% of French storage capacity. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; TradingView / Reuters's contemporaneous report identifies the parties and transaction terms used to classify Teréga S.A.S..

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 14. `INF-2026-199` — Seven Brazilian Transmission Assets

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | GIC (FUND; BUYER) |
| Sponsor lineage | GIC → GIC (ADVISER) |
| Date / sector / region | 2026-04-30 · Utilities · Latin America · Brazil |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [GIC](https://gic.com.sg/newsroom/all/neoenergia-strengthens-partnership-with-gic-through-third-agreement-in-transmission). GIC and Neoenergia expanded their Brazilian transmission partnership through a R$2.4bn transaction involving a 49% stake in seven transmission assets. The agreement strengthens the platform’s regulated transmission footprint, which is expected to include 16 assets totaling approximately 6,710 km of lines after completion.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 15. `WB-2026-07-03-024` — Genus Power Infrastructures

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | GIC (FUND; SELLER) |
| Sponsor lineage | GIC → GIC (ADVISER) |
| Date / sector / region | 2026-07-03 · Utilities · Asia-Pacific · India |
| Transaction structure | ACQUISITION / SALE / SECONDARY_SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **RELIABLE_SECONDARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Businesstoday](https://businesstoday.in/markets/stocks/story/madhusudan-kela-buys-stake-in-genus-power-via-block-deal-more-details-540166-2026-07-01). GIC sold an 11.03% equity stake in Genus Power Infrastructures through an open-market block transaction. Genus supplies smart-metering and utility digitalization infrastructure, making the sale a secondary equity rotation in the power distribution value chain. **Fallback rationale:** No accessible issuer, regulator, or transaction-adviser release was located in the frozen research set; Businesstoday's contemporaneous report identifies the parties and transaction terms used to classify Genus Power Infrastructures.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 16. `INF-2026-098` — AES Corporation

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | GIP (FUND; BUYER) |
| Sponsor lineage | EQT Infrastructure → GIP (ADVISER); GIP → GIP (ADVISER) |
| Date / sector / region | 2026-03-02 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [PR Newswire](https://prnewswire.com/news-releases/consortium-led-by-global-infrastructure-partners-and-eqt-agrees-to-acquire-aes-302700916.html). EQT Infrastructure and Global Infrastructure Partners (GIP), a BlackRock company, jointly agreed to acquire AES Corporation in a take-private transaction. AES is a diversified power generation and utility company operating across multiple markets globally with significant renewable energy and conventional power assets.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 17. `INF-2026-109` — TCR

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | GIP (FUND; BUYER) |
| Sponsor lineage | GIP → GIP (ADVISER) |
| Date / sector / region | 2026-03-05 · Transportation · Europe · Belgium |
| Transaction structure | ACQUISITION / SALE / SECONDARY_SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Business Wire](https://businesswire.com/news/home/20260305285233/en/Global-Infrastructure-Partners-Agrees-to-Acquire-TCR). Global Infrastructure Partners (GIP), a BlackRock company, acquired a 71% controlling stake in TCR from 3i Infrastructure in a secondary buyout. TCR is a leading provider of ground support equipment (GSE) leasing and management services to the global aviation industry, operating across major airports worldwide.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 18. `INF-2026-189` — Saavi Energía & Grupo México Power Assets

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **RECLASSIFY** |
| Acting entity | GIP (FUND; BUYER) |
| Sponsor lineage | GIP → GIP (ADVISER) |
| Date / sector / region | 2026-04-30 · Power & ET · North America · Mexico |
| Transaction structure | ACQUISITION / JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | Mexico maps to North America. The frozen seed's Latin America value is a known geography-parser error already normalized in the review manifest. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [PR Newswire](https://prnewswire.com/news-releases/saavi-energia-announces-the-agreement-signed-by-global-infrastructure-partners-gip-to-combine-power-generation-assets-with-those-of-grupo-mexico-sab-de-cv-302754442.html). Global Infrastructure Partners, part of BlackRock, entered into a definitive agreement to combine its Saavi Energía portfolio company with Grupo México’s power generation assets. The resulting platform will have 4,510 MW of combined output and an approximately 5,000 MW project pipeline, with Grupo México owning 70% and GIP retaining a 30% minority stake.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [prnewswire](https://www.prnewswire.com/news-releases/saavi-energia-announces-the-agreement-signed-by-global-infrastructure-partners-gip-to-combine-power-generation-assets-with-those-of-grupo-mexico-sab-de-cv-302754442.html). GIP or affiliates agreed with Grupo Mexico to combine their power assets; Grupo Mexico will own 70% and GIP 30%.
- **PRIMARY · OWNERSHIP** — [prnewswire](https://www.prnewswire.com/news-releases/actis-sells-saavi-energia-a-leading-independent-power-generator-in-mexico-to-global-infrastrucutre-partners-301359559.html). GIP's primary release records its acquisition of Saavi before the 2026 combination.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 19. `INF-2026-040` — Rio Grande LNG Trains 4 & 5

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | GIP (BlackRock) (FUND; SELLER) |
| Sponsor lineage | GIP (BlackRock) → GIP (BlackRock) (ADVISER) |
| Date / sector / region | 2026-01-26 · Midstream · North America · United States |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [XRG](https://xrg.com/en/news/XRG-to-Increase-Stake-in-Rio-Grande-LNG). GIP (BlackRock) announced the divestiture of a 7.6% stake in Rio Grande LNG Trains 4 & 5 in Texas.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 20. `INF-2026-215` — 187 MW Taiwan Solar Portfolio

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | GIP (BlackRock) (FUND; SELLER) |
| Sponsor lineage | GIP (BlackRock) → GIP (BlackRock) (ADVISER) |
| Date / sector / region | 2026-05-12 · Power & ET · Asia-Pacific · Taiwan |
| Transaction structure | ACQUISITION / SALE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [PR Newswire](https://prnewswire.com/apac/news-releases/jv-energy-to-acquire-187mw-operational-solar-portfolio-in-taiwan-from-blackrock-302769813.html). J&V Energy agreed to acquire a 187 MW operational solar portfolio in Taiwan from a fund managed by Global Infrastructure Partners, part of BlackRock. The operating portfolio expands J&V Energy's renewable power platform in Taiwan.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 21. `WB-2026-07-17-002` — Summit Ridge Energy

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | GIP Mid-Market Funds (FUND; BUYER) |
| Sponsor lineage | Global Infrastructure Partners → GIP Mid-Market Funds (ADVISER) |
| Date / sector / region | 2026-07-17 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION |
| Independent second-review risks | None |
| Scope rationale | The GIP Mid-Market Funds agreed to acquire the controlling Summit Ridge Energy interest as principal. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [GlobeNewswire](https://globenewswire.com/news-release/2026/07/14/3326975/0/en/global-infrastructure-partners-agrees-to-acquire-summit-ridge-energy.html). GIP Mid-Market Funds agreed to acquire a majority and controlling interest in Summit Ridge Energy. The U.S. commercial solar and storage platform owns and operates more than 275 facilities serving over 60,000 businesses, homes and municipalities.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 22. `WB-2026-07-31-010` — Yondr Slough Campus

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | GLIL Infrastructure LLP (FUND; BUYER) |
| Sponsor lineage | GLIL Infrastructure LLP → GLIL Infrastructure LLP (ADVISER) |
| Date / sector / region | 2026-07-30 · Digital · Europe · United Kingdom |
| Transaction structure | JOINT_VENTURE |
| Independent second-review risks | ACTUAL_MIXED_DIRECT_PORTFOLIO |
| Scope rationale | GLIL is expressly identified as the investment-fund buyer and Yondr as the operating seller that retains a minority stake and operating responsibility. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [Yondrgroup](https://yondrgroup.com/newsroom/press-release/yondr-partners-with-glil-infrastructure-on-uk-hyperscale-data-center-campus). La Caisse- and DigitalBridge-owned Yondr brought GLIL Infrastructure into its Slough data-center campus through an investment in two operational buildings. The buildings represent more than 60 MW within the campus’ greater-than-100 MW footprint.
- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE, OWNERSHIP** — [yondrgroup](https://www.yondrgroup.com/newsroom/press-release/yondr-partners-with-glil-infrastructure-on-uk-hyperscale-data-center-campus/). The primary release establishes GLIL's fund status and Yondr's retained ownership/operating role.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 23. `WB-2026-06-06-011` — Delfin FLNG 1

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | UNRESOLVED |
| Recommended disposition | **KEEP** |
| Acting entity | Global Infrastructure Partners-led investment group (ADVISED_VEHICLE; INVESTOR) |
| Sponsor lineage | Global Infrastructure Partners → Global Infrastructure Partners-led investment group (ADVISER) |
| Date / sector / region | 2026-06-05 · Midstream · North America · United States |
| Transaction structure | JOINT_VENTURE |
| Independent second-review risks | None |
| Scope rationale | A GIP-led investment group commits equity as principal at FID, making the transaction direct fund investment activity. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [GlobeNewswire](https://globenewswire.com/news-release/2026/06/03/3306350/0/en/delfin-midstream-announces-5-billion-final-investment-decision-for-first-flng-vessel.html). Delfin states that, concurrently with the $5bn FID, an investor group led by GIP agreed to invest equity alongside Vitol and other partners in Delfin FLNG 1.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.

### 24. `INF-2026-116` — Nighthawk Energy Storage Project

| Review field | Evidence-derived value |
| --- | --- |
| **Recommended scope** | **DIRECT_FUND** |
| Original automation candidate *(research prompt; not approval)* | DIRECT_FUND |
| Recommended disposition | **KEEP** |
| Acting entity | Goldman Sachs Alternatives (FUND; BUYER) |
| Sponsor lineage | Goldman Sachs Alternatives → Goldman Sachs Alternatives (ADVISER) |
| Date / sector / region | 2026-03-10 · Power & ET · North America · United States |
| Transaction structure | ACQUISITION / CAPITAL_RAISE |
| Independent second-review risks | None |
| Scope rationale | A fund, advised investment vehicle, co-investment vehicle, or qualifying non-operating acquisition vehicle is evidenced as a transaction principal; actor-first V2 therefore classifies the record as Direct. |
| Disposition rationale | The frozen source evidence and archive/seed crosswalk support a distinct in-scope 2026 infrastructure transaction. Exact URL/target and repeated-party review found no evidence that this record is a duplicate of another included identity. |

Evidence to open:

- **PRIMARY · TRANSACTION, PARTIES, ANNOUNCEMENT_DATE, SECTOR, REGION, TRANSACTION_STRUCTURE** — [PR Newswire](https://prnewswire.com/news-releases/arevon-closes-920-million-in-financing-for-its-1-200-megawatt-hour-nighthawk-energy-storage-project-in-california-302710346.html). Goldman Sachs Alternatives committed a $169mm preferred equity investment in Arevon Energy's 300 MW / 1,200 MWh Nighthawk Energy Storage Project in Poway, California, as part of a broader $920mm financing package. The total financing comprises a $482mm debt facility led by CIBC, the Goldman Sachs preferred equity tranche structured to simplify tax credit monetization, and a $268mm tax credit transfer commitment. The lithium iron phosphate battery facility will provide resource adequacy capacity to PG&E under a long-term contract and is expected to become operational later in 2026.

Reviewer checklist:

- [ ] Opened every evidence locator above.
- [ ] Verified disposition, parties, date, sector, region, structure, acting entity, sponsor lineage, and scope.
- [ ] Recorded `ACCEPT_RECOMMENDATION` or an explicit `EDITED_RECORD` in the matching compact worksheet.
- [ ] Added a substantive, record-specific note.
