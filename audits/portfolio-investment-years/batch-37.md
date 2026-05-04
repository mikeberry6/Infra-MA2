# Batch 37 — Unflagged Owner-Row Confirmation

Started: 2026-05-02 22:29 ET / 2026-05-03 02:29 UTC.

## Audit Baseline

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T02:29:54.199Z
- Company records: 1,171
- Owner-company rows: 1,311
- Flagged rows: 20

This batch begins the unflagged owner-row confirmation queue from `master.csv`. The remaining flagged rows have already been searched and documented as unresolved; this phase checks rows that currently pass the audit but still require company-by-company, owner-by-owner public-source verification.

## Reviewed Companies / Owners

### Amwaste LLC — 3i Infrastructure

- Stored owner year: 2023
- Stored top-level year: 2023
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: 3i's official portfolio page lists Amwaste as a current infrastructure holding with year invested 2023. Waste Dive directly reports that the 3i investment closed in July 2023 and funded Amwaste's expansion/disposal-asset acquisition activity. The same-year financing milestone already aligned with the stored year.
- Implemented changes: relabeled the 3i portfolio page as `Investment date source — 3i Infrastructure — Amwaste LLC` and the Waste Dive article as `Close date source — 3i Infrastructure — Amwaste LLC`.
- Sources:
  - `https://www.3i.com/infrastructure/our-portfolio/amwaste/`
  - `https://www.wastedive.com/news/amwaste-chip-russell-3i-north-american-infrastructure-investment/690067/`

### EC Waste — 3i Infrastructure

- Stored owner year: 2021
- Stored top-level year: 2021
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: 3i's December 1, 2021 release states that it had closed a majority investment in EC Waste. EC Waste's own post also states that 3i and management closed a majority investment. The stored 2021 year and same-year acquisition milestone are correct.
- Implemented changes: replaced the generic 3i portfolio source with the primary 3i close announcement and labeled it `Close date source — 3i Infrastructure — EC Waste`.
- Sources:
  - `https://www.3i.com/media/news/2021/3i-partners-with-ec-waste-to-support-the-company-s-growth/`
  - `https://www.ecwaste.com/post/ec-waste-management-team-and-3i-become-majority-shareholders-of-the-company`

### Regional Rail, LLC — 3i Infrastructure

- Stored owner year: 2019
- Stored top-level year: 2019
- Decision: unchanged; high-conviction confirmation.
- Date basis: investment-date disclosure, with announcement fallback also in the same year.
- Rationale: 3i announced the agreement to invest in Regional Rail on April 1, 2019. A later 3i release states that 3i invested in Regional Rail in July 2019, confirming the stored year and distinguishing the initial platform investment from later Regional Rail bolt-ons.
- Implemented changes: revised the July 2019 milestone to say 3i invested in Regional Rail after announcing its agreement to acquire the company, changed the category to `Acquisition`, and added labeled announcement/investment-date source evidence.
- Sources:
  - `https://www.3i.com/media/news/2019/3i-agrees-to-invest-in-regional-rail-to-support-growth/`
  - `https://www.3i.com/media/news/2019/regional-rail-expands-its-geographic-footprint-through-acquisition-of-pinsly-railroad-company-s-florida-operations/`
  - `https://www.3i.com/infrastructure/our-portfolio/regional-rail/`

### Smarte Carte International Holdings, Inc. — 3i Infrastructure

- Stored owner year: 2017
- Stored top-level year: 2017
- Decision: unchanged; high-conviction confirmation.
- Date basis: announcement fallback.
- Rationale: 3i announced on October 16, 2017 that it had agreed to invest alongside management in Smarte Carte, and 3i's current portfolio page lists year invested 2017. No separate close date was located in the reviewed public sources, so the announcement year remains the correct fallback.
- Implemented changes: none; the row already included an aligned 2017 milestone and a labeled announcement-date source.
- Sources:
  - `https://www.3i.com/media/news/2017/investment-in-smarte-carte/`
  - `https://www.3i.com/infrastructure/our-portfolio/smarte-carte/`

### JVR Energy Park — Acadia Infrastructure Capital

- Stored owner year: 2025
- Stored top-level year: 2025
- Decision: unchanged; high-conviction confirmation.
- Date basis: financial close.
- Rationale: BayWa r.e. announced on December 9, 2025 that it had closed financing for JVR Energy Park and that Acadia invested preferred equity alongside Wafra. The stored owner and top-level years, same-year financing milestone, and labeled close-date source were already aligned.
- Implemented changes: none.
- Source:
  - `https://www.prnewswire.com/news-releases/baywa-re-secures-416m-funding-for-jvr-energy-park-expected-to-be-operational-in-fall-2026-302636735.html`

### Peregrine Energy Storage Project — Acadia Infrastructure Capital

- Stored owner year: 2025
- Stored top-level year: 2025
- Decision: unchanged; high-conviction confirmation.
- Date basis: financial close.
- Rationale: Arevon announced on February 25, 2025 that it had completed a $258 million financing package for Peregrine, including a preferred-equity commitment structured and sourced by Acadia. This confirms 2025 for Acadia's original project investment.
- Implemented changes: consolidated the same-year financing milestones into an owner-specific February 25, 2025 milestone and relabeled the Arevon announcement as `Close date source — Acadia Infrastructure Capital — Peregrine Energy Storage Project`.
- Sources:
  - `https://arevonenergy.com/news/releases/arevon-announces-258-million-of-financial-commitments-for-its-peregrine-energy-storage-project/`
  - `https://arevonenergy.com/news/releases/arevon-commences-operations-at-its-200-megawatt-peregrine-energy-storage-project-in-san-diego/`

### Project Soho — Acadia Infrastructure Capital

- Stored owner year: 2025
- Stored top-level year: 2025
- Decision: unchanged; high-conviction confirmation.
- Date basis: financial close.
- Rationale: Greenflash announced on October 7, 2025 that it had closed debt financing, preferred equity, and a tax-credit sale for Project Soho, and identified Acadia as a preferred-equity investor alongside Wafra. The stored 2025 year remains correct.
- Implemented changes: consolidated the same-year financing milestones into an owner-specific October 7, 2025 milestone and relabeled the Business Wire announcement as `Close date source — Acadia Infrastructure Capital — Project Soho`.
- Source:
  - `https://www.businesswire.com/news/home/20251007100315/en/Greenflash-Infrastructure-Closes-Innovative-Debt-Financing-Preferred-Equity-and-Sale-of-Tax-Credits-for-400MW-800MWh-ERCOT-Battery-Storage-Project`

### Stillhouse Solar Project — Acadia Infrastructure Capital

- Stored owner year: 2024
- Stored top-level year: 2024
- Decision: unchanged; high-conviction confirmation.
- Date basis: announcement fallback.
- Rationale: Matrix Renewables announced on December 3, 2024 that it secured financing for Stillhouse and that Acadia sourced preferred equity. The reviewed sources did not disclose a separate close date for Acadia's preferred-equity participation, so the 2024 announcement year remains the correct fallback. Matrix's 2023 acquisition from OCI is sponsor history and does not drive Acadia's investment year.
- Implemented changes: consolidated the December 2024 financing milestones into an owner-specific December 3, 2024 milestone and relabeled the source as `Announcement date source — Acadia Infrastructure Capital — Stillhouse Solar Project`.
- Sources:
  - `https://matrixrenewables.com/press-releases/matrix-renewables-secures-commitments-from-microsoft-and-mufg-led-lender-consortium-for-210mwac-solar-project-in-bell-county-texas/`
  - `https://matrixrenewables.com/press-releases/matrix-renewables-announces-acquisition-of-stillhouse-solar-project-from-oci-solar-power/`

### Catalyze — Actis

- Stored owner year: 2023
- Stored top-level year: 2023
- Decision: unchanged; high-conviction confirmation.
- Date basis: announcement fallback.
- Rationale: Actis announced on February 28, 2023 that it would acquire a co-control stake in Catalyze and partner with EnCap. No separate public close date was located in the reviewed materials, so the announcement year remains the correct fallback for the Actis owner row and the top-level displayed year.
- Implemented changes: none for Actis; the row already included an aligned 2023 financing milestone and labeled Actis announcement-date source.
- Source:
  - `https://www.act.is/2023/02/28/actis-and-encap-invest-in-us-solar-platform-catalyze/`

### Catalyze — EnCap Investments

- Stored owner year: 2019
- Stored top-level year: 2023
- Decision: unchanged; high-conviction confirmation.
- Date basis: investment-date disclosure.
- Rationale: Catalyze's Actis announcement states that Catalyze partnered with EnCap in 2019, while EnCap's own current portfolio page lists Catalyze with initial investment 2019. This supports a separate EnCap owner year and explains why it differs from the Actis/top-level displayed year.
- Implemented changes: relabeled the EnCap portfolio page as `Investment date source — EnCap Investments — Catalyze`.
- Sources:
  - `https://www.act.is/2023/02/28/actis-and-encap-invest-in-us-solar-platform-catalyze/`
  - `https://www.encapinvestments.com/about/energy-transition/portfolio/current/catalyze`

### TERRANOVA — Actis

- Stored owner year: 2025
- Stored top-level year: 2025
- Decision: unchanged; high-conviction confirmation.
- Date basis: announcement/platform-launch fallback.
- Rationale: Actis announced on December 2, 2025 that TERRANOVA, a new hyperscale data-center platform established by Actis, had officially launched in Latin America with a stated investment plan. No separate close date exists for this platform launch in reviewed public sources.
- Implemented changes: none; same-year milestone and labeled announcement-date source already aligned.
- Sources:
  - `https://www.act.is/2025/12/02/actis-launches-new-latin-american-hyperscale-data-center-platform-terranova-to-accelerate-latin-americas-digital-expansion/`
  - `https://www.datacenterdynamics.com/en/news/terranova-launches-in-mexico-with-its-first-data-center-campus/`

### Valia Energía — Actis

- Stored owner year: 2022
- Stored top-level year: 2022
- Decision: unchanged; high-conviction confirmation.
- Date basis: investment-date disclosure.
- Rationale: Actis' Valia portfolio page lists investment date November 2022, and the company materials identify Actis' creation of the platform through the MT Falcon acquisition before the later EVM Energia expansion. The 2023 EVM acquisition and 2024 bond financing do not reset the investment year.
- Implemented changes: none; same-year acquisition milestone and labeled investment-date source already aligned.
- Source:
  - `https://www.act.is/about-us/portfolio/valia-energia/`

### Alpha Generation, LLC — ADIA Infrastructure

- Stored owner year: 2025
- Stored top-level year: 2025
- Decision: unchanged; high-conviction confirmation.
- Date basis: announcement fallback.
- Rationale: ArcLight announced on January 13, 2025 that a wholly owned subsidiary of ADIA agreed to make a $500 million minority investment in AlphaGen. The release states the investment remained subject to regulatory approvals and was expected to close in the first half of 2025; no separate public close notice was located in this review, so 2025 remains the announcement fallback.
- Implemented changes: relabeled the ArcLight/PR Newswire announcement as `Announcement date source — ADIA Infrastructure — Alpha Generation, LLC`.
- Source:
  - `https://www.prnewswire.com/news-releases/arclight-announces-500mm-investment-by-a-wholly-owned-subsidiary-of-adia-in-11-gw-alphagen-power-infrastructure-platform-302348464.html`

### Arevon Energy, Inc. — ADIA Infrastructure

- Stored owner year: 2021
- Stored top-level year: 2021
- Decision: unchanged; high-conviction confirmation.
- Date basis: announcement/platform-launch fallback.
- Rationale: Arevon announced on August 17, 2021 that the company launched through the combination of Capital Dynamics' U.S. clean-energy infrastructure team and Arevon Asset Management and was 100% owned by an investor group including APG, CalSTRS, and a wholly owned subsidiary of ADIA. The same announcement said regulatory closing was expected by early 2022, but no separate close notice was located; the 2021 launch/announcement year remains the best public basis.
- Implemented changes: relabeled the announcement as `Announcement date source — ADIA Infrastructure — Arevon Energy, Inc.`.
- Source:
  - `https://www.prnewswire.com/news-releases/arevon-energy-inc-formed-through-combination-of-capital-dynamics-us-clean-energy-infrastructure-team-members-and-arevon-asset-management-301356809.html`

### Arevon Energy, Inc. — APG Infrastructure

- Stored owner year: 2021
- Stored top-level year: 2021
- Decision: unchanged; high-conviction confirmation.
- Date basis: announcement/platform-launch fallback.
- Rationale: The same August 17, 2021 Arevon launch announcement identifies APG as part of the 100% owner group. No separate public close notice was located, so the stored 2021 year remains correct under the announcement-fallback rule.
- Implemented changes: added a separate owner-specific source label, `Announcement date source — APG Infrastructure — Arevon Energy, Inc.`, using the same primary announcement.
- Source:
  - `https://www.prnewswire.com/news-releases/arevon-energy-inc-formed-through-combination-of-capital-dynamics-us-clean-energy-infrastructure-team-members-and-arevon-asset-management-301356809.html`

### Chicago Parking Meters, LLC — MSIP, ADIA Infrastructure, and Allianz Global Investors

- Stored owner years: 2009 for all three owners
- Stored top-level year: 2009
- Decision: unchanged; high-conviction confirmation.
- Date basis: financial close.
- Rationale: Metropolitan Planning Council's concession analysis states that the Chicago parking meter transaction closed in February 2009 and that the concessionaire was then owned by a consortium of Morgan Stanley, Allianz Capital Partners, and ADIA. The existing milestone and owner-specific close-date source labels align with all three owner rows.
- Implemented changes: none.
- Source:
  - `https://metroplanning.org/projects/innovative-infrastructure-delivery-chicago-parking-meter-analysis/`

### FirstEnergy Transmission, LLC — ADIA Infrastructure

- Stored owner year: 2024
- Stored top-level year: 2024
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: FirstEnergy announced on March 25, 2024 that it completed the previously disclosed sale of an additional 30% FET ownership interest to Brookfield. Public regulatory/clearance sources already document ADIA's indirect passive economic interest in the Brookfield structure used for that follow-on investment, so 2024 remains correct for ADIA.
- Implemented changes: none; same-year acquisition milestone and labeled close/interest-confirmation sources already aligned.
- Source:
  - `https://www.firstenergycorp.com/newsroom/news_articles/fe-closes-on-fe-transmission-interest-sale.html`

### FirstEnergy Transmission, LLC — Brookfield Asset Management

- Stored owner year: 2022
- Stored top-level year: 2024
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: FirstEnergy announced on May 31, 2022 that Brookfield Super-Core Infrastructure Partners completed the initial 19.9% FET acquisition. The later 2024 follow-on stake increase supports the ADIA/top-level row but does not reset Brookfield's original owner-entry year.
- Implemented changes: none; same-year milestone and labeled close-date source already aligned.
- Source:
  - `https://www.firstenergycorp.com/newsroom/news_articles/firstenergy-completes-minority-interest-sale-in-transmission-bus.html`

### Landmark Dividend LLC — ADIA Infrastructure

- Stored owner year: 2024
- Stored top-level year: 2024
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: DigitalBridge announced on April 2, 2024 that a wholly owned ADIA subsidiary completed the acquisition of a 40% stake in Landmark Dividend. The 2023 announcement remains signing history and the 2024 close drives the owner year.
- Implemented changes: none; same-year acquisition milestone and labeled close-date source already aligned.
- Source:
  - `https://ir.digitalbridge.com/news-releases/news-release-details/adia-completes-acquisition-40-stake-landmark-dividend-alongside/`

### Landmark Dividend LLC — DigitalBridge

- Stored owner year: 2021
- Stored top-level year: 2024
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: DigitalBridge/Digital Colony completed the acquisition of Landmark Dividend in June 2021; ADIA's 2024 acquisition of a 40% stake is a later co-owner entry and does not reset DigitalBridge's original year.
- Implemented changes: none; same-year milestone and labeled source already aligned.
- Source:
  - `https://www.nasdaq.com/press-release/digital-colony-completes-acquisition-of-landmark-dividend-llc-2021-06-02`

### AES Clean Energy — AIMCo

- Stored owner year: 2020
- Stored top-level year: 2020
- Decision: unchanged; high-conviction confirmation for the named AES Clean Energy platform.
- Date basis: announcement/platform-formation fallback.
- Rationale: AIMCo announced on November 17, 2020 that AES and AIMCo agreed to merge sPower with AES' U.S. clean-energy business to form the AES Clean Energy platform. The source also notes AIMCo's earlier 2017 sPower investment, but the database row is the named AES Clean Energy platform formed by the 2020 merger, so the 2020 platform-formation year remains appropriate.
- Implemented changes: none; same-year financing milestone and labeled AIMCo announcement-date source already aligned.
- Source:
  - `https://www.aimco.ca/insights/aes-and-aimco-to-form-leading-renewables-platform`

### Boldyn Networks — AIMCo

- Stored owner year: 2024
- Stored top-level year: 2024
- Decision: unchanged; documented as uncertain.
- Date basis: public disclosure year only.
- Rationale: AIMCo's March 6, 2024 release confirms AIMCo as a 10% minority shareholder and describes a follow-on commitment to Boldyn, but it does not disclose AIMCo's original entry date. Because no clearer owner-entry evidence was located in this segment, the database was left unchanged.
- Evidence needed: AIMCo/CPP Investments original Boldyn investment notice, shareholder-transfer notice, or fund/annual-report disclosure identifying AIMCo's initial acquisition date.
- Sources reviewed:
  - `https://www.aimco.ca/insights/boldyn-networks-investment`
  - `https://www.cppinvestments.com/newsroom/cpp-investments-aimco-and-manulife-im-increase-commitment-to-boldyn-networks-to-support-continued-growth-in-the-u-s/`

### Cando Rail & Terminals — AIMCo

- Stored owner year: 2022
- Stored top-level year: 2022
- Decision: unchanged; high-conviction confirmation.
- Date basis: announcement fallback.
- Rationale: AIMCo announced on July 20, 2022 that it had signed a definitive agreement to acquire 100% of Cando Rail & Terminals from TorQuest Partners and Cando employees. No separate public close notice was located, so 2022 remains the announcement-fallback year.
- Implemented changes: updated the milestone wording/date to the definitive-agreement announcement and relabeled the AIMCo source as `Announcement date source — AIMCo — Cando Rail & Terminals`.
- Source:
  - `https://www.aimco.ca/insights/cando-rail-and-terminals-acquisition`

### Castle Rock Ridge II Wind Farm — AIMCo

- Stored owner year: 2018
- Stored top-level year: 2018
- Decision: unchanged; high-conviction confirmation.
- Date basis: announcement fallback.
- Rationale: Enel's February 7, 2018 announcement states that it signed an agreement with AIMCo to sell a 49% stake in Riverview and Castle Rock Ridge II, with closing expected when the projects reached commercial operation. No separate close notice for AIMCo's stake was located, so the announcement year remains the correct fallback.
- Implemented changes: none; source label was already owner-specific.
- Source:
  - `https://www.enel.com/content/dam/enel-common/press/en/2018---febr/EGP%20Alberta%20BSO%20ENG.pdf`

### Coastal GasLink Pipeline Project — AIMCo

- Stored owner year: 2020
- Stored top-level year: 2020
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: Coastal GasLink/TC Energy announced on May 25, 2020 that TC Energy had completed the sale of a 65% equity interest in Coastal GasLink to KKR and AIMCo, following the December 2019 agreement. The 2020 close drives the investment year.
- Implemented changes: added `Close date source — AIMCo — Coastal GasLink Pipeline Project`.
- Sources:
  - `https://www.coastalgaslink.com/whats-new/news-stories/2020/tc-energy-completes-partial-monetization-and-project-financing-transactions-for-coastal-gaslink/`
  - `https://www.coastalgaslink.com/whats-new/news-stories/2019/Partial-Monetization-of-CGL-Announced/`

### Howard Energy Partners — AIMCo

- Previous stored owner year: 2022
- Previous top-level year: 2022
- Corrected owner year: 2017
- Corrected top-level year: 2017
- Decision: changed; high-conviction correction.
- Date basis: investment-date disclosure from AIMCo.
- Rationale: AIMCo's November 8, 2022 release states that AIMCo acquired an initial 28% stake in Howard Energy Partners in early 2017 and later acquired Astatine's stake, increasing its ownership to 87%. The 2022 stake increase is a follow-on transaction and must not drive the original investment year.
- Implemented changes: changed top-level and owner `investmentYear` from 2022 to 2017; updated the description; added a 2017 AIMCo acquisition milestone; changed the 2022 event to a follow-on acquisition milestone; relabeled the AIMCo source as `Investment date source — AIMCo — Howard Energy Partners`.
- Source:
  - `https://www.aimco.ca/insights/expanded-ownership-howard-energy-partners`

### Northern Courier Pipeline — AIMCo

- Stored owner year: 2019
- Stored top-level year: 2019
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: AIMCo announced the acquisition agreement in May 2019, and Torys' transaction page states that the acquisition closed on July 19, 2019. The stored 2019 year remains correct, with the close date now driving the milestone.
- Implemented changes: updated the milestone to July 19, 2019 close-date wording and relabeled Torys as `Close date source — AIMCo — Northern Courier Pipeline`.
- Sources:
  - `https://www.aimco.ca/insights/investment-in-northern-courier-pipeline`
  - `https://www.torys.com/work/2019/05/41cdfb27-f894-4c11-9357-fba42a8e4a76`

### Puget Energy / Puget Sound Energy — AIMCo

- Stored owner year: 2009
- Stored top-level year: 2009
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: Puget Energy's SEC filing states that the Puget Holdings merger closed on February 6, 2009, and AIMCo's later PSE release confirms that AIMCo held a position since 2009. AIMCo's 2018 stake increase does not reset the investment year.
- Implemented changes: changed the milestone to a February 6, 2009 acquisition event and added/labeled SEC close-date evidence plus AIMCo investment-date evidence.
- Sources:
  - `https://www.sec.gov/Archives/edgar/data/81100/000119312509027209/d8k.htm`
  - `https://www.aimco.ca/insights/aimco-increases-stake-in-puget-sound-energy`

### Riverview Wind Farm — AIMCo

- Stored owner year: 2018
- Stored top-level year: 2018
- Decision: unchanged; high-conviction confirmation.
- Date basis: announcement fallback.
- Rationale: Enel's February 7, 2018 announcement states that it signed an agreement with AIMCo to sell 49% stakes in Riverview and Castle Rock Ridge II. No separate close notice was located in this segment, so the 2018 announcement year remains the correct fallback.
- Implemented changes: replaced the generic Enel source with the direct Enel PDF and relabeled it `Announcement date source — AIMCo — Riverview Wind Farm`.
- Source:
  - `https://www.enel.com/content/dam/enel-common/press/en/2018---febr/EGP%20Alberta%20BSO%20ENG.pdf`

### TriSummit Utilities — AIMCo

- Stored owner year: 2020
- Stored top-level year: 2020
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: TriSummit reports that PSP Investments and Alberta Teachers' Retirement Fund completed the AltaGas Canada acquisition on March 31, 2020; TriSummit disclosures identify AIMCo as manager of ATRF's interest. The same-year acquisition milestone and labeled close-date source are already aligned.
- Implemented changes: none.
- Source:
  - `https://trisummit.ca/index.php/newsroom/news-2023/227-nvestmentsandompletecquisitionofltaasa20200331093900`

### Broadview Wind Farm — Allianz Global Investors

- Stored owner year: 2017
- Stored top-level year: 2017
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: Allianz Capital Partners' May 2017 release states that Allianz and Capital One completed a tax-equity investment in Broadview. Pattern's earlier acquisition of the project is sponsor history and does not reset Allianz's tax-equity investment date.
- Implemented changes: none; close-date source was already labeled.
- Source:
  - `https://www.allianz.com/content/dam/onemarketing/azcom/Allianz_com/migration/media/press/document/ACP_Cap_One_EN.pdf`

### Colbeck's Corner Wind Farm — Allianz Global Investors

- Stored owner year: 2016
- Stored top-level year: 2016
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: E.ON, Allianz Capital Partners, and State Street announced on May 25, 2016 that they closed tax-equity financing for Colbeck's Corner in exchange for partial interests. The stored 2016 year and same-year financing milestone remain correct.
- Implemented changes: relabeled the PR Newswire source as `Close date source — Allianz Global Investors — Colbeck's Corner Wind Farm`.
- Source:
  - `https://www.prnewswire.com/news-releases/eon-climate--renewables-allianz-capital-partners-and-state-street-corporation-close-colbecks-corner-llc-tax-equity-financing-300274548.html`

### Galloway 2 Solar Project — Allianz Global Investors

- Stored owner year: 2022
- Stored top-level year: 2022
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: Avantus announced on November 3/4, 2022 that it completed the sale of Galloway 2 to Allianz Capital Partners, while Avantus retained a minority stake. The 2022 close date drives the investment year.
- Implemented changes: relabeled the Avantus source as `Close date source — Allianz Global Investors — Galloway 2 Solar Project`.
- Source:
  - `https://avantus.com/news/avantus-and-allianz-capital-partners-announce-completion-of-sale-for-galloway-2-solar-project`

### Great Western Wind Farm — Allianz Global Investors

- Stored owner year: 2017
- Stored top-level year: 2017
- Decision: unchanged; high-conviction confirmation.
- Date basis: investment-date disclosure.
- Rationale: Allianz Capital Partners' February 2, 2017 PDF states that Allianz and MUFG invested tax equity in Great Western. The later Alliant Energy acquisition of a 50% stake is a separate sponsor-side ownership event and does not reset Allianz's investment year.
- Implemented changes: replaced the generic Allianz link with the direct PDF and labeled it `Investment date source — Allianz Global Investors — Great Western Wind Farm`.
- Source:
  - `https://www.allianz.com/content/dam/onemarketing/azcom/Allianz_com/migration/media/press/document/ACP_Great_Western-EN.pdf`

### Kelly Creek Wind Project — Allianz Global Investors

- Stored owner year: 2017
- Stored top-level year: 2017
- Decision: unchanged; high-conviction confirmation.
- Date basis: investment-date disclosure.
- Rationale: Allianz Capital Partners' January 17, 2017 release states that Allianz invested tax equity in the Kelly Creek wind project as sole tax-equity partner. Commercial operation in December 2016 predates Allianz's investment and does not drive the owner row.
- Implemented changes: relabeled the Allianz PDF as `Investment date source — Allianz Global Investors — Kelly Creek Wind Project`.
- Source:
  - `https://www.allianzcapitalpartners.com/-/media/allianzgi/globalagi/acp/documents/news/2017/acp-press-release-kelly-creek.pdf`

### Lotus Solar Farm — Allianz Global Investors

- Stored owner year: 2019
- Stored top-level year: 2019
- Decision: unchanged; high-conviction confirmation.
- Date basis: announcement fallback.
- Rationale: 8minute announced in September 2019 that it sold the equity interests in Lotus Solar Farm to Allianz Global Investors. Later 2020 commercial operation is an operating milestone and does not reset the acquisition year.
- Implemented changes: relabeled the Business Wire source as `Announcement date source — Allianz Global Investors — Lotus Solar Farm`.
- Sources:
  - `https://www.businesswire.com/news/home/20190910005984/en/8minute-Solar-Energy-and-Allianz-Global-Investors-Announce-First-Major-U.S.-Acquisition`
  - `https://www.nsenergybusiness.com/news/8minute-solar-lotus-solar-farm/`

### Red Dirt Wind Project — Allianz Global Investors

- Stored owner year: 2017
- Stored top-level year: 2017
- Decision: unchanged; high-conviction confirmation.
- Date basis: announcement fallback.
- Rationale: Enel announced on August 17, 2017 that MUFG and Allianz Renewable Energy Partners of America signed a tax-equity agreement for 100% of Red Dirt's Class B interests. Public sources indicate funding would close after commercial operation, but no separate public close date was located here, so 2017 remains the announcement-fallback year.
- Implemented changes: changed the August 2017 milestone category from `Other` to `Financing`, added the exact date, and relabeled the Enel source as `Announcement date source — Allianz Global Investors — Red Dirt Wind Project`.
- Source:
  - `https://www.enel.com/media/explore/search-press-releases/press/2017/08/enel-signs-tax-equity-agreement-for-300-mw-red-dirt-wind-project-in-the-usa`

### Stella Wind Farm — Allianz Global Investors

- Stored owner year: 2018
- Stored top-level year: 2018
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: E.ON announced in January 2019 that Stella achieved commercial operation and closing of tax equity in December 2018, with Allianz Capital Partners providing tax-equity financing for a partial interest. The stored 2018 year is correct.
- Implemented changes: relabeled the PR Newswire source as `Close date source — Allianz Global Investors — Stella Wind Farm`.
- Source:
  - `https://www.prnewswire.com/news-releases/eon-achieves-successful-commercial-operation-and-tax-equity-financing-for-stella-wind-farm-300782909.html`

## Amber Infrastructure Cluster

### Circle Power / Michigan Renewables Rows — Amber Infrastructure

- Reviewed rows: 7 Mile Pit Solar, Circle Power Renewables, Groveland Mine Solar, and Scotia Wind.
- Stored owner years: 2021 for each row.
- Stored top-level years: 2021 for each row.
- Decision: unchanged; high-conviction confirmation using announcement/platform-launch fallback.
- Rationale: Amber and Circle Power announced the launch of Circle Power Renewables on May 27, 2021. The release identifies Scotia Wind as the first project and states that the joint venture had secured development rights to Groveland Mine Solar and 7 Mile Pit Solar. Michigan DNR and project materials support project history but do not predate Amber's platform-entry for the current owner row.
- Implemented changes: changed the launch milestones to `Financing`, added May 27, 2021 where useful, and relabeled the PR Newswire source as owner-specific announcement-date evidence for each row.
- Source:
  - `https://www.prnewswire.com/news-releases/amber-infrastructure-and-circle-power-launch-circle-power-renewables-301301112.html`

### Amber / Hunt P3 and Utility Rows — Amber Infrastructure

- Reviewed rows: Biddeford Lincoln Garage & RiverWalk, City Light & Power, City of San Marcos Public Services Complex, and Travis County Civil and Family Courts Facility.
- Stored years: Biddeford 2020; City Light & Power 2020; San Marcos 2020; Travis County 2019.
- Decision: unchanged; high-conviction confirmation.
- Date basis: financial close or acquisition close.
- Rationale: Public releases support Amber/Hunt financial close for Biddeford and San Marcos, acquisition of a majority stake in City Light & Power in 2020, and Travis County financial close in 2019. Later openings or operating milestones do not reset investment years.
- Implemented changes: relabeled Biddeford, City Light & Power, and San Marcos sources as close-date evidence; changed Biddeford and San Marcos investment milestones to `Financing`.
- Sources:
  - `https://www.prnewswire.com/news-releases/amber-achieves-financial-close-of-biddeford-lincoln-garage--riverwalk-biddeford-me-301109865.html`
  - `https://www.amberinfrastructure.com/news/press-releases/2020/amber-and-hunt-acquire-a-majority-stake-in-city-light-power/`
  - `https://www.amberinfrastructure.com/news/press-releases/2020/amber-closes-financing-for-public-services-complex-in-san-marcos-texas/`
  - `https://www.infrapppworld.com/update/fc-for-courthouse-p3-project-in-travis-county`

### Amber / INPP Social Infrastructure Rows — Amber Infrastructure

- Reviewed rows: Alberta Schools Alternative Procurement I and Durham Region Courthouse.
- Stored years: Alberta Schools 2008; Durham Region Courthouse 2007.
- Decision: unchanged; high-conviction confirmation.
- Date basis: close / financial close.
- Rationale: Existing Investegate and Infrastructure Ontario evidence supports the original financial-close/acquisition years. Later INPP additional investments and ongoing Amber management do not reset the original project investment year.
- Implemented changes: none; existing same-year milestones and labeled close/announcement sources were already adequate.
- Sources:
  - `https://www.investegate.co.uk/announcement/rns/international-public-partnerships-ltd---inpp/additional-investment-in-alberta-schools/3501487`
  - `https://www.investegate.info/announcement/rns/international-public-partnerships-ltd---inpp/durham-courthouse-canada/807340`

### US Solar Fund Rows — Amber Infrastructure

- Reviewed rows: Euryalus Solar Portfolio, Granite Solar Portfolio, Heelstone Solar Portfolio, Milford Solar Project, and Olympos Solar Portfolio.
- Stored years: Euryalus 2020; Granite 2020; Heelstone 2020; Milford 2019; Olympos 2019.
- Decision: unchanged; high-conviction confirmation.
- Date basis: acquisition close / acquisition-and-financing disclosure.
- Rationale: US Solar Fund portfolio materials identify the original portfolio acquisitions in the stored years. Amber became investment manager to US Solar Fund in 2023, but that manager appointment does not reset the underlying fund/project acquisition years.
- Implemented changes: none in this segment; existing close-date/investment-manager source labeling remained sufficient.
- Sources:
  - `https://www.ussolarfund.co.uk/portfolio/acquisition-five`
  - `https://www.ussolarfund.co.uk/portfolio/granite`
  - `https://www.ussolarfund.co.uk/portfolio/acquisition-four`
  - `https://www.ussolarfund.co.uk/portfolio/milford-solar-plant`
  - `https://www.ussolarfund.co.uk/portfolio/olympos`
  - `https://www.amberinfrastructure.com/news-and-insights/press-releases/amber-appointed-us-solar-fund-plc-investment-manager/`

### Green Impact Partnership Rows — Amber Infrastructure

- Reviewed rows: Future Energy Park, GreenGas Colorado, and Iowa RNG.
- Stored owner years: 2023 for each row.
- Stored top-level years: 2023 for each row.
- Decision: unchanged; high-conviction announcement fallback.
- Rationale: Green Impact Partners announced on February 21, 2023 that it selected Amber as strategic partner across GreenGas Colorado, Iowa RNG, and Future Energy Park, representing a 50% project-level equity interest in each facility. The release anticipated GreenGas closing around February 23, 2023 but did not provide a separate public close notice for all three rows; 2023 remains correct under either announcement or anticipated close.
- Implemented changes: relabeled Green Impact/American Biogas Council sources as owner-specific announcement-date evidence for the relevant rows.
- Sources:
  - `https://www.greenipi.com/newsroom/green-impact-partners-announces-545-million-partnering-agreement/`
  - `https://americanbiogascouncil.org/green-impact-partners-announces-545-million-partnering-agreement/`

### Maine International Cold Storage Facility — Amber Infrastructure

- Stored owner year: 2022
- Stored top-level year: 2022
- Decision: unchanged; high-conviction confirmation.
- Date basis: investment/execution milestone.
- Rationale: Hunt/TFI public materials state the project moved into execution in 2022 after the ground lease cleared the path to break ground. Later operator selection and operations milestones do not reset the year.
- Implemented changes: none; source was already labeled `Investment date source — Amber Infrastructure — Maine International Cold Storage Facility`.
- Source:
  - `https://www.huntcompanies.com/news/groundbreaking-announcement-for-state-of-the-art-cold-storage-facility-on-portland-waterfront`

## Ancala Partners Cluster

### Noventa Energy Partners — Ancala Partners

- Stored owner year: 2023
- Stored top-level year: 2023
- Decision: unchanged; high-conviction confirmation.
- Date basis: close/acquisition disclosure.
- Rationale: Ancala's April 3, 2023 release states that it acquired a majority interest in Noventa on behalf of Ancala Infrastructure Fund III. The Canada Infrastructure Bank commitment later in April is project financing support and does not reset Ancala's acquisition year.
- Implemented changes: updated the investment milestone to April 3, 2023 and relabeled the Ancala release as `Close date source — Ancala Partners — Noventa Energy Partners`.
- Source:
  - `https://ancala.com/ancala-partners-acquires-decarbonised-heating-and-cooling-provider-noventa/`

### Phoenix Rail — Ancala Partners

- Stored owner year: 2025
- Stored top-level year: 2025
- Decision: unchanged; high-conviction confirmation.
- Date basis: close/acquisition disclosure.
- Rationale: Ancala's January 28, 2025 release states that Ancala formed Phoenix Rail with the completed acquisition of Lehigh Valley Rail Management. The platform formation and first acquisition are the same owner-entry event for the named business.
- Implemented changes: consolidated the platform-formation/acquisition milestone into a January 28, 2025 acquisition event and relabeled the Ancala release as `Close date source — Ancala Partners — Phoenix Rail`.
- Source:
  - `https://ancala.com/ancala-forms-short-line-rail-platform/`

### Valentra — Ancala Partners

- Stored owner year: 2025
- Stored top-level year: 2025
- Decision: unchanged; high-conviction confirmation.
- Date basis: close/acquisition disclosure.
- Rationale: Ancala's December 4, 2025 release states that Ancala acquired Hexion's U.S. Gulf Coast formalin infrastructure business and formed Valentra. Transaction-adviser financing materials are supporting context and do not change the acquisition date.
- Implemented changes: updated the milestone to December 4, 2025 and relabeled the Ancala release as `Close date source — Ancala Partners — Valentra`.
- Source:
  - `https://ancala.com/ancala-acquires-portfolio-of-critical-chemical-pipeline-infrastructure-on-the-us-gulf-coast/`

## Post-Batch Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T03:05:20.668Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count did not change because this segment focused on unflagged confirmations and source-label tightening.

## Antin Infrastructure Partners Cluster

### Empire Access — Antin Infrastructure Partners

- Stored owner year: 2023
- Stored top-level year: 2023
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: Antin announced the Empire Access and North Penn investment in November 2022 and the transaction was completed on January 17, 2023. The 2023 owner and top-level investment years remain correct because the close year governs over the earlier announcement year.
- Implemented changes: updated the investment milestone to January 17, 2023 and added a separate owner-specific close-date source label.
- Sources:
  - `https://www.antin-ip.com/media/our-news/antin-to-invest-in-empire-access-and-north-penn-leading-fiber-to-the-home-broadband-providers-in-new-york-and-pennsylvania`
  - `https://www.businesswire.com/news/home/20230117005177/en/Antin-completes-acquisition-of-Empire-Access-and-North-Penn-leading-fiber-to-the-home-broadband-providers-in-New-York-and-Pennsylvania`

### FirstLight Fiber — Antin Infrastructure Partners

- Stored owner year: 2018
- Stored top-level year: 2018
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: Antin completed the acquisition of FirstLight from Oak Hill in July 2018. The stored investment year correctly reflects Antin's original investment in the named business.
- Implemented changes: relabeled the PR Newswire release as `Close date source — Antin Infrastructure Partners — FirstLight Fiber`.
- Source:
  - `https://www.prnewswire.com/news-releases/antin-infrastructure-partners-completes-acquisition-of-firstlight-300686268.html`

### GTL Leasing — Antin Infrastructure Partners

- Stored owner year: 2024
- Stored top-level year: 2024
- Decision: unchanged; high-conviction confirmation using announcement fallback.
- Date basis: announcement fallback.
- Rationale: Antin publicly announced on June 20, 2024 that it agreed to acquire a majority stake in GTL Leasing through NextGen Fund I. A later closing notice was not identified in reviewed public sources, so the announcement year remains the correct fallback.
- Implemented changes: changed the same-year investment milestone to an acquisition event and relabeled the Antin release as `Announcement date source — Antin Infrastructure Partners — GTL Leasing`.
- Source:
  - `https://www.antin-ip.com/media/our-news/antin-agrees-to-invest-in-gtl-leasing-the-leading-lessor-of-hydrogen-midstream-equipment-in-north-america`

### Lake State Railway Company — Antin Infrastructure Partners

- Stored owner year: 2022
- Stored top-level year: 2022
- Decision: unchanged; high-conviction confirmation.
- Date basis: investment/close disclosure.
- Rationale: Antin's March 8, 2022 release states that Lake State Railway received a strategic investment from Antin Infrastructure Partners. No later Lake State operating or volume updates reset the owner-entry year.
- Implemented changes: updated the milestone date to March 8, 2022 and relabeled the Antin release as `Investment date source — Antin Infrastructure Partners — Lake State Railway Company`.
- Source:
  - `https://www.antin-ip.com/media/our-news/lake-state-railway-leading-regional-freight-railroad-has-received-strategic`

### Vicinity Energy — Antin Infrastructure Partners

- Stored owner year: 2019
- Stored top-level year: 2019
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: Veolia disclosed completion of the sale of its U.S. district energy assets to Antin on December 30, 2019. The 2020 Vicinity brand launch is an operating/rebrand milestone and does not reset Antin's original investment year.
- Implemented changes: updated the milestone date to December 30, 2019 and relabeled the Veolia release as `Close date source — Antin Infrastructure Partners — Vicinity Energy`.
- Source:
  - `https://www.veolia.com/en/our-media/press-releases/veolia-completes-sale-its-district-energy-assets-united-states-usd-125`

### Vigor Marine Group — Antin Infrastructure Partners

- Stored owner year: 2026
- Stored top-level year: 2026
- Decision: unchanged; high-conviction confirmation using announcement fallback.
- Date basis: announcement fallback.
- Rationale: Vigor announced on February 4, 2026 that Antin agreed to acquire Vigor Marine Group from an affiliate of Lone Star Funds, with closing still subject to regulatory approvals in the reviewed public materials. No completion notice was identified, so the announced agreement year is retained as the fallback.
- Implemented changes: none; the existing milestone and source label already identified the Antin announcement.
- Source:
  - `https://www.vigormarine.com/news-press/antin-to-acquire-vigor-marine-group`

## Post-Antin Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T03:07:46.961Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count did not change because the remaining flags are unresolved carry-forward items and this segment focused on unflagged confirmations/source-label tightening.

## APG Infrastructure / Argo Infrastructure Partners Cluster

### Astoria Project Partners Holdings LLC — APG Infrastructure

- Stored owner year: 2020
- Stored top-level year: 2020
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: APG announced the Astoria Energy I/II acquisition agreement in January 2020 and the APG-led buyer consortium closed in July 2020. The July 2020 close year supports the stored APG and top-level investment years.
- Implemented changes: relabeled the APG announcement and GlobeNewswire close releases as owner-specific evidence and changed the close milestone to `Acquisition`.
- Sources:
  - `https://apg.nl/en/publication/equity-consortium-agrees-to-acquire-stakes-in-new-york-s-astoria-energy-facilities/`
  - `https://www.globenewswire.com/news-release/2020/07/01/2056467/0/en/Equity-consortium-closes-acquisition-of-stakes-in-New-York-s-Astoria-Energy-facilities.html`

### Cross-Sound Cable Company, LLC — Argo Infrastructure Partners / APG Infrastructure

- Stored owner years: Argo 2015; APG 2015.
- Stored top-level year: 2015.
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: Public transaction reporting states that AIA Energy North America, managed by Argo and backed by APG and CalSTRS, completed the Cross-Sound Cable acquisition in August 2015. The same 2015 close supports both owner rows.
- Implemented changes: updated the investment milestone to August 25, 2015, removed duplicate acquisition/history milestones, and added separate close-date source labels for Argo and APG.
- Sources:
  - `https://www.marketscreener.com/quote/stock/BROOKFIELD-INFRASTRUCTURE-807081/news/Argo-Infrastructure-Alliance-Energy-North-America-a-fund-managed-by-Argo-Infrastructure-Partners-co-38266585/`
  - `https://ippjournal.com/news/argo-infrastructure-partners-completes-acquisition-of-transmission-asset-in-new-york`

### Doral Renewables LLC — APG Infrastructure

- Stored owner year: 2024
- Stored top-level year: 2024
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: Doral announced APG's minority equity investment in June 2024 and announced closing on September 13, 2024. The close year matches the stored owner and top-level years.
- Implemented changes: added exact close-date milestone and relabeled the June and September GlobeNewswire releases as APG-specific announcement and close evidence.
- Sources:
  - `https://www.globenewswire.com/news-release/2024/06/24/2902871/0/en/Doral-Renewables-LLC-Announces-400-Million-Equity-Investment-from-APG.html`
  - `https://www.globenewswire.com/news-release/2024/09/13/2945843/0/en/Doral-Renewables-LLC-Announces-Closing-of-400-Million-Equity-Investment-from-APG.html`

### Gemini Solar + Storage — APG Infrastructure / Quinbrook

- Stored owner years: APG 2022; Quinbrook 2024.
- Stored top-level year: 2022.
- Decision: unchanged; high-conviction confirmation.
- Date basis: APG announcement/investment disclosure; Quinbrook continuation-fund close.
- Rationale: Quinbrook and Primergy announced APG's agreement to acquire a 49% Gemini stake in 2022. Quinbrook's Valley of Fire fund separately acquired the remaining 51% interest in Gemini in April 2024. The owner-year mismatch is intentional and owner-specific, not a data error.
- Implemented changes: none in this segment.
- Sources:
  - `https://www.quinbrook.com/news-insights/quinbrook-and-primergy-solar-partner-with-apg-on-gemini-solar-storage-project/`
  - `https://www.quinbrook.com/news-insights/quinbrook-closes-600m-solarstorage-continuation-fund/`

### Hudson Transmission Project — APG Infrastructure / Argo Infrastructure Partners

- Stored owner years: APG 2019; Argo 2019.
- Stored top-level year: 2019.
- Decision: unchanged; high-conviction confirmation.
- Date basis: investment/effective ownership disclosure.
- Rationale: Ares EIF and Starwood signed the sale agreement in September 2018, but a later Oregon public filing states that principal equity ownership of Hudson was acquired by Argo in early 2019 on behalf of institutional investors including APG. The 2018 signing milestone remains historical and does not drive the investment year.
- Implemented changes: revised the 2018 signing milestone so it is not treated as the owner-entry year, revised the 2019 owner-entry milestone, and added separate owner-specific investment-date source labels for Argo and APG.
- Sources:
  - `https://www.lotusinfrastructure.com/news/lotus-to-sell-hudson-transmission-line-to-argo/`
  - `https://www.oregon.gov/energy/facilities-safety/facilities/Facilities%20library/2026-02-27-CRTAPPDoc01-02-pASC-Organizational-Expertise-Exhibit.pdf`

### Transportation Concessions — APG Infrastructure / Meridiam

- Reviewed rows: I-66 Express Mobility Partners, LBJ Express, LBJ Infrastructure Group, and North Tarrant Express.
- Stored years: I-66 2017; LBJ Express Meridiam/APG rows 2010; LBJ Infrastructure Group 2010; North Tarrant Express APG 2017.
- Decision: unchanged; high-conviction confirmation.
- Date basis: financial close or current-ownership disclosure.
- Rationale: FHWA project profiles identify the relevant equity investors and financial-close dates for I-66 and LBJ. For North Tarrant, FHWA identifies APG as part of current ownership as of September 2017 after the original pension-fund stake sale; public evidence reviewed did not support using the original 2009 project financial close for APG because APG was not in the ownership group at that close.
- Implemented changes: none in this segment; existing source labels and milestones remained adequate.
- Sources:
  - `https://www.fhwa.dot.gov/ipd/project_profiles/va_transform_66.aspx`
  - `https://www.fhwa.dot.gov/ipd/project_profiles/tx_lbj_express.aspx`
  - `https://www.fhwa.dot.gov/ipd/project_profiles/tx_north_tarrant.aspx`

### Pattern Energy Group LP — APG Infrastructure

- Stored owner year: 2025
- Stored top-level year: 2025
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date.
- Rationale: Pattern announced that the APG- and ART-headed consortium closed on Riverstone's equity stake on June 9, 2025 and became an owner alongside CPP Investments and management.
- Implemented changes: none; existing milestone and labeled close source were already adequate.
- Source:
  - `https://patternenergy.com/pattern-energy-announces-closing-of-equity-investment-from-consortium-headed-by-apg-and-art/`

### SiFi Networks America Limited — APG Infrastructure

- Prior stored owner year: 2019
- Prior stored top-level year: 2019
- Corrected owner year: 2021
- Corrected top-level year: 2021
- Decision: changed; high-conviction correction.
- Date basis: investment/signing disclosure.
- Rationale: The 2019 item was a project-level Smart City Infrastructure Fund/Fullerton FiberCity deployment. The named company stake is disclosed in SiFi's September 7, 2021 release, which states that APG signed an agreement to acquire a 16.7% direct stake in SiFi Networks America and establish a U.S. fiber joint venture. Because the row is for SiFi Networks America Limited, not the Fullerton project, 2021 is the correct owner-entry year.
- Implemented changes: changed top-level and owner `investmentYear` from 2019 to 2021, added an aligned 2021 acquisition milestone, preserved the 2019/2020 project history as non-investment context, and added `Investment date source — APG Infrastructure — SiFi Networks America Limited`.
- Sources:
  - `https://sifinetworks.com/corporate/apgs-stake-in-sifi-networks-bring-10gig-citywide-fiber-networks/`
  - `https://apg.nl/en/publication/apg-investment-connects-1-million-american-households-to-fiber-optics/`
  - `https://www.smartcityinfrafund.com/whitehelm-capital-finalises-deal-with-sifi-networks-to-fund-fibercity/`

### Southern Power / Southern Power Solar Portfolio — APG Infrastructure

- Reviewed rows: Southern Power and Southern Power solar portfolio.
- Stored years: 2023 for both rows.
- Decision: Southern Power solar portfolio unchanged; high-conviction confirmation. Southern Power corporate row left unchanged but treated as an entity-definition uncertainty.
- Date basis: close date for the solar portfolio.
- Rationale: Public APG/BusinessWire evidence supports APG's 2023 acquisition of Global Atlantic's 33% minority interest in the Southern Power-managed solar portfolio. The separate Southern Power row remains unchanged because public sources reviewed do not show APG acquiring a direct corporate stake in Southern Power itself; the evidence points to the portfolio-level row.
- Implemented changes: relabeled the solar portfolio APG and BusinessWire releases as investment/close evidence. No edit was made to the Southern Power corporate row.
- Sources:
  - `https://assetmanagement.apg.nl/publications/apg-boosts-commitment-to-energy-transition-with-major-us-solar-investment/`
  - `https://www.businesswire.com/news/home/20231114814709/en/Global-Atlantic-Sells-Stake-in-26-Solar-Facilities-to-APG`

### Corning / LAZ Platform Rows — Argo Infrastructure Partners

- Reviewed rows: Corning Natural Gas Holding Corp., FleetLogix, INDIGO Park Canada, LAZ Parking, and Leatherstocking Gas Company.
- Stored years: Corning 2022; FleetLogix 2025; INDIGO Park Canada 2025; LAZ Parking 2021; Leatherstocking Gas 2022.
- Decision: unchanged; high-conviction confirmation.
- Date basis: close date for Corning, FleetLogix, INDIGO, and Leatherstocking; announcement/investment fallback for LAZ Parking.
- Rationale: Argo completed the Corning acquisition in July 2022; Leatherstocking sits under Corning. LAZ announced Argo's long-term preferred investment in December 2021. LAZ, as an Argo-backed platform, completed majority acquisitions of FleetLogix in April 2025 and INDIGO Park Canada in July 2025, so those named bolt-on rows correctly use their own acquisition years rather than LAZ's 2021 platform investment year.
- Implemented changes: relabeled Corning, FleetLogix, and INDIGO investment-date evidence and removed duplicate FleetLogix/INDIGO acquisition milestones.
- Sources:
  - `https://www.globenewswire.com/news-release/2022/07/06/2475377/0/en/Corning-Natural-Gas-Holding-Corporation-Acquired-by-Argo-Infrastructure-Partners-LP.html`
  - `https://www.lazparking.com/our-company/about/news/2022/01/03/laz-parking-announces-a-long-term-investment-from-argo-infrastructure-partners`
  - `https://www.lazparking.com/our-company/about/news/2025/04/22/laz-parking-acquires-majority-interest-in-fleet-management-staffing-services-provider-fleetlogix`
  - `https://www.lazparking.com/our-company/about/news/2025/07/01/laz-parking-acquires-majority-stake-in-indigo-park-canada`

## Post-APG/Argo Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T03:13:44.471Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The audit briefly rose while SiFi/Hudson historical milestones were still being interpreted as earlier owner-entry signals; milestone wording/categories were corrected so only the actual owner-entry years drive the audit.

## Apollo Global Management Cluster

### Reviewed Companies / Owners

- Arthur Kill Terminal — Apollo Global Management — stored year 2021 — unchanged.
- Broad Reach Power — Apollo Global Management — stored year 2021 — unchanged.
- Bullrock Energy Ventures — Apollo Global Management — stored year 2025 — unchanged.
- Caledonia Generating LLC — Apollo Global Management — stored year 2018 — unchanged.
- Capital Power U.S. Natural Gas JV — Apollo Global Management — stored year 2025 — unchanged.
- Eagle Creek Renewable Energy — Apollo Global Management — stored year 2025 — unchanged.
- FirstDigital Telecom, LLC — Apollo Global Management — stored year 2021 — unchanged.
- GFL Environmental Services — Apollo Global Management — stored year 2025 — unchanged.
- Great Bay Renewables — Apollo Global Management — stored year 2020 — unchanged.
- IonicBlue — Apollo Global Management — stored year 2021 — unchanged.
- Modern Aviation — Apollo Global Management stored year 2023; Tiger stored year 2018 — unchanged.
- NextEra Energy Partners 2.5 GW JV — Apollo Global Management — stored year 2021 — unchanged.
- Nokomis Energy — Apollo Global Management via Great Bay Renewables — stored year 2024 — unchanged.
- Stream Data Centers (SDC) — Apollo Global Management — stored year 2025 — unchanged.
- Summit Ridge Energy — Apollo Global Management — stored year 2022 — unchanged.
- The State Group — Apollo Global Management — stored year 2024 — unchanged.
- TotalEnergies Texas Solar & BESS — Apollo Global Management — stored year 2024 — unchanged.
- US Wind — Apollo Global Management — stored year 2020 — unchanged.
- Valor Compute Infrastructure (VCI) — Apollo Global Management — stored year 2026 — unchanged.

### Implemented Changes

- Relabeled investment-date evidence for Arthur Kill Terminal, Broad Reach Power, Bullrock Energy Ventures, Eagle Creek Renewable Energy, FirstDigital Telecom, GFL Environmental Services, Great Bay Renewables, IonicBlue, Modern Aviation, NextEra Energy Partners 2.5 GW JV, Stream Data Centers, Summit Ridge Energy, The State Group, TotalEnergies Texas Solar & BESS, and US Wind.
- Bullrock Energy Ventures: updated the Apollo JV milestone to April 23, 2025 and category `Financing`.
- Capital Power U.S. Natural Gas JV: kept the 2025 announcement fallback, changed the equity-commitment milestone to `Financing`, and kept the operator/future-acquisition context as `Other`.
- GFL Environmental Services: updated the close milestone to March 3, 2025 with category `Acquisition` and labeled separate Apollo announcement and close evidence.
- Great Bay Renewables: updated the Apollo/Altius JV milestone to October 13, 2020 with category `Financing`.
- IonicBlue: updated the joint-venture formation milestone to August 12, 2021 with category `Financing`.
- Modern Aviation: retained Apollo's 2023 announcement-fallback year, changed the Apollo milestone wording to "announced a definitive agreement," added Tiger's 2018 owner-specific investment evidence, and removed a duplicate Apollo milestone that implied a completed close without a public close notice.
- NextEra Energy Partners 2.5 GW JV: added the December 29, 2021 Apollo first-close milestone with category `Financing` and labeled separate announcement and close evidence.
- Stream Data Centers: updated the Apollo close milestone to November 3, 2025 with category `Acquisition` and labeled separate announcement and close evidence.
- Summit Ridge Energy: added the 2022 Apollo strategic-investment source as owner-specific investment-date evidence so the 2022 stored year is supported by the original Apollo investment rather than the later 2025 JV.
- The State Group: updated the Apollo acquisition milestone to November 18, 2024 with category `Acquisition`.
- TotalEnergies Texas Solar & BESS: retained 2024 as announcement fallback and labeled Apollo and TotalEnergies agreement sources separately.
- US Wind: relabeled Apollo's 2020 structured investment release as owner-specific investment-date evidence.

### High-Conviction Confirmations

- Arthur Kill Terminal: date basis is announcement fallback. Apollo announced in July 2021 that Apollo-managed funds had secured the exclusive right to invest alongside Atlantic Offshore Terminals. No public completion notice was identified; the stored 2021 year remains the best supported public year.
- Broad Reach Power: date basis is announcement fallback. Apollo announced in November 2021 that its funds would acquire a 50% stake from EnCap Energy Transition; no later public close date was identified in reviewed primary materials.
- Bullrock Energy Ventures: date basis is announcement fallback. Apollo and Bullrock announced a $220 million community solar joint venture on April 23, 2025.
- Caledonia Generating LLC: date basis is regulatory filing / announcement fallback. The Federal Register notice identifies a FERC filing by Caledonia Generating and Apollo Global Management with a filed date of October 11, 2018.
- Capital Power U.S. Natural Gas JV: date basis is announcement/MOU fallback. Capital Power announced on December 1, 2025 that it and Apollo-managed funds signed an MOU for a U.S. gas generation investment partnership.
- Eagle Creek Renewable Energy: date basis is announcement fallback. Apollo announced in October 2025 that its funds agreed to acquire Eagle Creek, with closing targeted for Q1 2026; searches for a public completion notice did not identify one.
- FirstDigital Telecom: date basis is investment announcement. Apollo announced a $200 million preferred-equity investment in July 2021.
- GFL Environmental Services: date basis is close date. GFL completed the sale of its Environmental Services business to Apollo-managed funds and BC Partners on March 3, 2025.
- Great Bay Renewables: date basis is announcement/investment fallback. Apollo and Altius announced the Great Bay Renewables joint venture on October 13, 2020.
- IonicBlue: date basis is announcement fallback. Johnson Controls and Apollo announced the formation of the energy-services joint venture on August 12, 2021.
- Modern Aviation: date basis is announcement fallback for Apollo; Tiger initial investment date for Tiger. Apollo's November 2, 2023 release discloses a definitive agreement and expected year-end close, but no public completion notice was identified. Tiger's portfolio page identifies 2018 as its initial investment.
- NextEra Energy Partners 2.5 GW JV: date basis is close date. Apollo announced the $824 million portfolio financing in October 2021 and made a first close on December 29, 2021.
- Nokomis Energy: date basis is investment announcement. Great Bay Renewables, jointly controlled by Altius and Apollo-affiliated funds, announced the $30 million Nokomis investment on June 27, 2024.
- Stream Data Centers: date basis is close date. Apollo announced the SDC acquisition agreement on August 6, 2025 and completed the acquisition on November 3, 2025.
- Summit Ridge Energy: date basis is investment announcement. Apollo announced a $175 million strategic investment in Summit Ridge Energy on July 13, 2022; the 2025 commercial-solar JV is later activity and does not reset the year.
- The State Group: date basis is acquisition/investment announcement. Apollo announced on November 18, 2024 that its funds had acquired a majority stake from Blue Wolf.
- TotalEnergies Texas Solar & BESS: date basis is announcement fallback. Apollo and TotalEnergies announced on December 4, 2024 that Apollo-managed funds agreed to acquire/signed an agreement for a 50% stake; public searches did not identify a separate completion notice.
- US Wind: date basis is investment announcement. Apollo announced on August 14, 2020 that its infrastructure funds made a structured investment in US Wind.
- Valor Compute Infrastructure: date basis is investment/capital-solution announcement. Apollo announced the $3.5 billion VCI/xAI capital solution in January 2026.

### Sources

- `https://ir.apollo.com/news-events/press-releases/detail/80/apollo-funds-and-atlantic-offshore-terminals-enter`
- `https://ir.apollo.com/news-events/press-releases/detail/47/apollo-funds-to-acquire-50-stake-in-broad-reach-power-from`
- `https://www.apollo.com/insights-news/pressreleases/2025/04/apollo-funds-form-220-million-community-solar-joint-venture-with-bullrock-energy-ventures-3066360`
- `https://www.federalregister.gov/documents/2018/10/18/2018-22713/combined-notice-of-filings-1`
- `https://www.capitalpower.com/media/media_releases/capital-power-and-apollo-funds-sign-mou-to-form-investment-partnership-for-us-natural-gas-generation/`
- `https://ir.apollo.com/news-events/press-releases/detail/583/apollo-funds-to-acquire-eagle-creek-renewable-energy-one`
- `https://ir.apollo.com/news-events/press-releases/detail/76/apollo-infrastructure-funds-invest-200-million-in`
- `https://investors.gflenv.com/English/news/news-details/2025/GFL-Environmental-Inc.-Completes-the-Sale-of-its-Environmental-Services-Business-Valued-at-8.0-Billion/default.aspx`
- `https://ir.apollo.com/news-events/press-releases/detail/532/gfl-environmental-inc-announces-agreement-to-sell`
- `https://ir.apollo.com/news-events/press-releases/detail/131/apollo-infrastructure-funds-and-altius-renewable-royalties`
- `https://www.apollo.com/insights-news/pressreleases/2021/08/johnson-controls-and-apollo-infrastructure-join-forces-to-pursue-innovative-sustainability-and-energy-efficiency-services-for-commercial-buildings-120245561`
- `https://www.apollo.com/insights-news/pressreleases/2023/11/apollo-infrastructure-funds-acquire-majority-stake-in-modern-aviation-2772854`
- `https://www.tigerinfrastructure.com/portfolio/Modern-Aviation`
- `https://www.apollo.com/insights-news/pressreleases/2021/10/apollo-funds-to-invest-824-million-supporting-nextera-energy-partners-acquisition-of-50-interest-in-2-5-gw-renewable-energy-portfolio-130509600`
- `https://ir.apollo.com/news-events/press-releases/detail/40/apollo-funds-announce-first-close-of-816-million`
- `https://www.greatbayroyalties.com/news/nokomis-investment/`
- `https://www.streamdatacenters.com/news/apollo-funds-to-acquire-majority-stake-in-stream-data-centers/`
- `https://www.streamdatacenters.com/news/apollo-funds-complete-acquisition-of-stream-data-centers/`
- `https://www.apollo.com/wealth/insights-news/pressreleases/2022/07/apollo-funds-announce-175-million-strategic-investment-in-summit-ridge-energy-a-leading-owner-operator-of-community-solar-121512414`
- `https://ir.apollo.com/news-events/press-releases/detail/526/apollo-funds-acquire-majority-stake-in-the-state-group-a`
- `https://ir.apollo.com/news-events/press-releases/detail/528/apollo-funds-acquire-50-stake-in-2-gw-texas-solar-and-bess`
- `https://totalenergies.com/news/press-releases/integrated-power-renewables-totalenergies-implements-its-strategy-capital`
- `https://ir.apollo.com/news-events/press-releases/detail/135/apollo-infrastructure-funds-announce-strategic-investment`
- `https://www.apollo.com/insights-news/pressreleases/2026/01/apollo-backs-5-4-billion-valor-and-xai-data-center-compute-infrastructure-transaction-with-3-5-billion-capital-solution-3214463`

### Unresolved Cases

- None added in this Apollo segment. Eagle Creek, Modern Aviation, and TotalEnergies Texas Solar & BESS remain unchanged as announcement-fallback cases because no public close/completion notice was identified in reviewed sources.

## Post-Apollo Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T03:21:16.382Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count did not change; the segment tightened owner-specific labels, milestone categories, and source alignment for unflagged Apollo rows without disturbing the unresolved carry-forward queue.

## Remaining Argo Infrastructure Partners Cluster

### Reviewed Companies / Owners

- Oneta Energy Center — Argo Infrastructure Partners — stored year 2019 — unchanged.
- Pearl/Ruby Solar Portfolio — Argo Infrastructure Partners — stored year 2019 — unchanged.
- Pueblo Airport Generating Station — Argo Infrastructure Partners — stored year 2016 — unchanged.
- Smoky Mountain Hydro — Argo Infrastructure Partners — stored year 2023 — unchanged.
- TierPoint — Argo Infrastructure Partners — stored year 2022 — unchanged.
- US Water Systems — Argo Infrastructure Partners — stored year 2017 — unchanged.
- Astro Solar portfolio — Argo Infrastructure Partners — stored year 2021 — unchanged.
- Bayonne water and wastewater concession — Argo Infrastructure Partners — stored year 2017 — unchanged.
- Black Hills Colorado IPP — Argo Infrastructure Partners — stored year 2016 — unchanged.
- Carville Energy Center — Argo Infrastructure Partners — stored year 2019 — unchanged.
- Freight Ninja — Argo Infrastructure Partners / LAZ Parking — stored year 2025 — unchanged.
- Hawaiʻi Gas — APG Infrastructure and Argo Infrastructure Partners — stored year 2022 for both owner rows — unchanged.
- International Parking Management — Argo Infrastructure Partners / LAZ Parking — stored year 2024 — unchanged.
- Isle Gas — Argo Infrastructure Partners — stored year 2025 — unchanged.
- Middletown Water Joint Venture LLC — Argo Infrastructure Partners — stored year 2017 — unchanged.
- Mobile Energy LLC — Argo Infrastructure Partners — stored year 2021 — unresolved, unchanged.
- Oneta Power — Argo Infrastructure Partners — stored year 2019 — unchanged.
- Pearl / Ruby solar portfolio — Argo Infrastructure Partners — stored year 2019 — unchanged.
- Smoky Mountain hydropower portfolio — Argo Infrastructure Partners — stored year 2023 — unchanged.
- Thule Energy Storage — Argo Infrastructure Partners — stored year 2018 — unchanged.
- Waihonu Solar Farm — Argo Infrastructure Partners — stored year 2022 — unchanged.

### Implemented Changes

- Oneta Energy Center: updated the Argo acquisition milestone to August 15, 2019 with category `Acquisition` and labeled LS Power's release as `Announcement date source — Argo Infrastructure Partners — Oneta Energy Center`.
- Pearl/Ruby Solar Portfolio: updated the investment milestone to February 5, 2019 with category `Financing` and labeled the PR Newswire/Marathon evidence as owner-specific investment-date evidence.
- Pueblo Airport Generating Station: changed the April 14, 2016 owner-entry milestone to category `Acquisition` and added the SEC quarterly report as `Close date source — Argo Infrastructure Partners — Pueblo Airport Generating Station`.
- Smoky Mountain Hydro: updated the acquisition milestone to March 17, 2023 and added MergerLinks close-date evidence plus White & Case regulatory-approval context.
- TierPoint: updated the close milestone to February 28, 2022 with category `Financing`, removed a duplicate close milestone, and labeled TierPoint's release as owner-specific close-date evidence.
- US Water Systems: changed the 2017 owner-entry milestone to `Acquisition` and added SUEZ's annual report as owner-specific investment-date evidence.
- Astro Solar portfolio: changed the owner-entry milestone to August 19, 2021, based on Marathon Capital's closing announcement, and labeled it `Close date source — Argo Infrastructure Partners — Astro Solar portfolio`.
- Bayonne water and wastewater concession: changed the 2017 Argo owner-entry milestone to `Acquisition` and added SUEZ's annual report as owner-specific investment-date evidence.
- Carville Energy Center: replaced the later/divestiture-weighted transaction milestone with an August 15, 2019 Argo acquisition announcement milestone and labeled LS Power's release as owner-specific announcement evidence. Because LS Power's primary release says closing was expected in Q4 2019 but no separate public close date was found, 2019 remains announcement fallback.
- Middletown Water Joint Venture LLC: changed the 2017 Argo owner-entry milestone to `Acquisition` and added SUEZ's annual report as owner-specific investment-date evidence.
- Oneta Power: updated the transaction milestone to August 15, 2019 and labeled LS Power's release as owner-specific announcement evidence.
- Pearl / Ruby solar portfolio: updated the owner-entry milestone to February 5, 2019 with category `Financing` and labeled the PR Newswire/Marathon source as owner-specific investment-date evidence.
- Smoky Mountain hydropower portfolio: updated the acquisition milestone to March 17, 2023 and added White & Case regulatory-approval context while retaining the MergerLinks close-date source.
- Waihonu Solar Farm: added Hawaiʻi Gas's July 21, 2022 closing release as `Close date source — Argo Infrastructure Partners — Waihonu Solar Farm` because the release states that assets including Waihonu were acquired by Argo.

### High-Conviction Confirmations

- Black Hills Colorado IPP and Pueblo Airport Generating Station: date basis is close date. Black Hills SEC reporting supports the April 14, 2016 closing of the 49.9% member equity sale to AIA Energy North America, an Argo platform.
- Freight Ninja: date basis is close/acquisition announcement. LAZ's May 6, 2025 release supports the named bolt-on row's 2025 year; LAZ's earlier 2021 Argo investment does not drive the Freight Ninja row.
- Hawaiʻi Gas and Waihonu Solar Farm: date basis is close date. Hawaiʻi Gas's July 21, 2022 release states that ownership transferred to an Argo affiliate after Hawaiʻi PUC approval and that assets including Waihonu were acquired by Argo.
- International Parking Management: date basis is close/acquisition announcement. LAZ's April 5, 2024 release supports the named bolt-on row's 2024 year.
- Isle Gas: date basis is announcement fallback. UGI announced a definitive agreement for AmeriGas's Hawaii propane storage and supply assets on June 20, 2025; no public close notice was identified.
- Thule Energy Storage: date basis is investment announcement. Ice Energy announced long-term funding from Argo in June 2018, and later restructuring milestones do not reset the original Argo investment year.

### Unresolved Cases

- Mobile Energy LLC — Argo Infrastructure Partners — stored owner/top-level year 2021 — suspected year 2021.
- Sources reviewed: Mobile Chamber profile, GridInfo Hog Bayou profile, GEM Hog Bayou profile, Duquesne Light FERC affiliate postings identifying Mobile Energy as an Argo affiliate, and law-firm biographies referencing Argo's acquisition of the holding company owning Hog Bayou from an LS Power portfolio company.
- Why unresolved: reviewed public sources confirm current Argo association and describe the transaction generally, but no primary or reliable secondary public source located in this segment provides a date, signing date, closing date, or announcement date for Argo's original acquisition of Mobile Energy/Hog Bayou.
- Evidence needed to resolve: a buyer/seller press release, FERC authorization, SEC/financing document, project-company notice, or advisor transaction note that includes the transaction date or closing/announcement date.

### Sources

- `https://www.lspower.com/news/ls-power-announces-sale-of-carville-and-oneta-projects-to-argo-infrastructure-partners/`
- `https://www.prnewswire.com/news-releases/marathon-capital-announces-argos-investment-in-a-114-mw-distributed-solar-portfolio-300790298.html`
- `https://www.sec.gov/Archives/edgar/data/1130464/000113046416000209/bkh10qq22016.htm`
- `https://app.mergerlinks.com/transactions/2023-03-17-brookfield-378mw-us-hydroelectric-portfolio/service-providers`
- `https://www.whitecase.com/insight-alert/summary-ferc-meeting-agenda-january-2024`
- `https://www.tierpoint.com/news/tierpoint-closes-500-million-investment-from-argo-infrastructure-partners/`
- `https://www.suez-asia.com/-/media/suez-global/files/publication/annual-report/document-de-reference-2018-en.pdf`
- `https://marathoncapital.com/news-events/marathon-capital-advises-carval-investors-on-sale-of-operating-c-i-solar-portfolio-to-argo`
- `https://www.lazparking.com/our-company/about/news/2025/05/06/laz-parking-acquires-majority-interest-in-freight-ninja`
- `https://www.hawaiigas.com/posts/acquisition-of-hawai-i-gas-paves-way-for-clean-energy-transformation`
- `https://www.lazparking.com/our-company/about/news/2024/04/05/laz-parking-purchases-seattle-based-international-parking-management-inc.-%28ipm%29`
- `https://ugi.gcs-web.com/news-releases/news-release-details/amerigas-propane-enters-definitive-agreement-divest-hawaii/`
- `https://www.globenewswire.com/news-release/2018/06/26/1529722/0/en/Ice-Energy-Announces-Long-Term-Funding-Agreement-with-Argo-Infrastructure-Partners.html`
- `https://my.mobilechamber.com/chambermemberdirectory/Details/mobile-energy-hog-bayou-2503285`
- `https://www.gridinfo.com/plant/hog-bayou-energy-center/55241`
- `https://www.gem.wiki/Hog_Bayou_energy_center`
- `https://www.sidley.com/en/people/s/samos-jr-mario`

## Post-Remaining-Argo Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T03:28:00.754Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count did not change. The remaining Argo work tightened date-basis milestones and owner-specific source labels for high-conviction rows; Mobile Energy remains unchanged as an unresolved date-evidence case.

## Ara Partners Cluster

### Reviewed Companies / Owners

- Centric Fiber — Ara Partners — stored year 2025 — unchanged.
- Gate City Power — Ara Partners — stored year 2026 — unchanged.
- Gate City Renewable Fuels — Ara Partners — stored year 2026 — unchanged.
- Lincoln Terminal Holdings — Ara Partners — stored year 2022 — unchanged.
- USD Clean Fuels — Ara Partners — stored year 2024 — unchanged.

### Implemented Changes

- Centric Fiber: updated the owner-entry milestone to November 19, 2025 with category `Acquisition` and labeled Ara's release as `Close date source — Ara Partners — Centric Fiber`.
- Gate City Power and Gate City Renewable Fuels: updated the acquisition-agreement milestones to March 11, 2026 and aligned categories to `Acquisition`. These remain announcement-fallback rows because the public releases describe an agreement/expected closing, not a completed close.
- Lincoln Terminal Holdings: updated the owner-entry milestone to November 15, 2022 with category `Acquisition` and labeled Ara's release as `Close date source — Ara Partners — Lincoln Terminal Holdings`.
- USD Clean Fuels: updated the owner-entry milestone to January 2, 2024 with category `Acquisition` and labeled Ara's release as `Close date source — Ara Partners — USD Clean Fuels`.

### High-Conviction Confirmations

- Centric Fiber: date basis is close date. Ara's November 19, 2025 release states Ara completed the acquisition of a majority controlling stake.
- Gate City Power and Gate City Renewable Fuels: date basis is announcement fallback. Ara Energy announced the acquisition agreement on March 11, 2026; no public completion notice was identified in this segment.
- Lincoln Terminal Holdings: date basis is close/investment disclosure. Ara's November 15, 2022 release supports Ara's majority ownership interest and first infrastructure-strategy investment.
- USD Clean Fuels: date basis is close/investment disclosure. Ara's January 2, 2024 release supports the majority-interest acquisition.

### Sources

- `https://www.arapartners.com/news/ara-partners-acquires-centric-fiber/`
- `https://www.prnewswire.com/news-releases/ara-partners-acquires-centric-fiber-a-fast-growing-fiber-to-the-home-platform-in-north-america-302619478.html`
- `https://www.arapartners.com/news/ara-energy-to-acquire-gate-city-power-gate-city-renewable-fuels-and-interest-in-jet-retail-network-for-875-million/`
- `https://www.prnewswire.com/news-releases/ara-energy-to-acquire-gate-city-power-gate-city-renewable-fuels-and-interest-in-jet-retail-network-for-875-million-302709985.html`
- `https://www.arapartners.com/news/ara-partners-acquires-majority-interest-in-lincoln-terminals/`
- `https://www.prnewswire.com/news-releases/ara-partners-acquires-majority-interest-in-lincoln-terminals-301677908.html`
- `https://www.prnewswire.co.uk/news-releases/ara-partners-acquires-majority-interest-in-usd-clean-fuels-302024250.html`

## ArcLight Capital Partners Cluster

### Reviewed Companies / Owners

- Advanced Power — ArcLight Capital Partners — stored year 2025 — unchanged.
- Alpha Generation (AlphaGen) — ArcLight Capital Partners — stored year 2024 — unchanged.
- Catalyst Old River Hydroelectric — ArcLight Capital Partners — stored year 2011 — unchanged.
- Eastern Generation — ArcLight Capital Partners — stored year 2015 — unchanged.
- Elevate Renewables — ArcLight Capital Partners — stored year 2022 — unchanged.
- Generation Bridge — ArcLight Capital Partners — stored year 2021 — unchanged.
- Gulf Coast Express Pipeline (GCX) — ArcLight Capital Partners — stored year 2025 — unchanged.
- Haynesville Gas Gathering System — ArcLight Capital Partners — stored year 2022 — unchanged.
- Infinigen Renewables — ArcLight Capital Partners — stored year 2021 — unchanged.
- Inspiration Mobility Group — ArcLight Capital Partners — stored year 2021 — unchanged.
- Invenergy AMPCI Thermal Power — ArcLight Capital Partners / DigitalBridge / InfraBridge — stored years 2026 / 2018 / 2018 — unchanged.
- Kleen Energy Systems — ArcLight Capital Partners — stored year 2023 — unchanged.
- Lordstown Energy Center — ArcLight Capital Partners — stored year 2024 — unchanged.
- Middletown Energy Center — ArcLight Capital Partners — stored year 2025 — unchanged.
- Natural Gas Pipeline Co. of America — ArcLight Capital Partners — stored year 2021 — unchanged.
- Naugatuck Avenue Storage — ArcLight Capital Partners — stored year 2025 — unresolved, unchanged.
- Parkway Generation — ArcLight Capital Partners — stored year 2022 — unchanged.
- Phoenix Renewables — ArcLight Capital Partners — stored year 2024 — unresolved, unchanged.
- Prospect Power — ArcLight Capital Partners via Elevate Renewables — stored year 2026 — unchanged.
- REC Solar — ArcLight Capital Partners — stored year 2023 — unchanged.
- Sequitur Renewables — ArcLight Capital Partners — stored year 2022 — unchanged.
- SkyVest Renewables — ArcLight Capital Partners — stored year 2024 — unchanged.
- Takanock, LLC — ArcLight Capital Partners — stored year 2025 — unchanged.
- Third Coast Infrastructure — J.P. Morgan Asset Management / ArcLight Capital Partners — stored years 2021 / 2019 — unchanged.
- Thunderbird Renewables — ArcLight Capital Partners — stored year 2024 — unresolved, unchanged.
- Two Rivers Storage — ArcLight Capital Partners — stored year 2026 — unresolved, unchanged.
- Zeem Solutions — ArcLight Capital Partners — stored year 2022 — unchanged.

### Implemented Changes

- Advanced Power: updated the investment milestone to July 24, 2025 with category `Acquisition` and labeled the PR Newswire release as owner-specific investment evidence.
- Catalyst Old River Hydroelectric: added ArcLight's continuation-fund release as owner-specific evidence for the original 2011 Fund V interest in Sidney Murray and changed the same-year milestone to `Acquisition`.
- Eastern Generation: updated the acquisition milestone to December 23, 2015 and labeled ArcLight's completion release as close-date evidence.
- Elevate Renewables: changed the 2022 ArcLight formation milestone to `Financing` and labeled the 2023 release, which states ArcLight formed Elevate in 2022, as investment-date evidence.
- GCX: updated the close milestone to February 3, 2025, changed the category to `Acquisition`, and labeled the ArcLight release as close-date evidence.
- Haynesville Gas Gathering System: updated the announcement milestone to March 22, 2022, changed the category to `Acquisition`, and labeled the ArcLight release as announcement evidence.
- Infinigen Renewables, Inspiration Mobility Group, Takanock, and Zeem Solutions: added exact public release dates and owner-specific investment-date labels.
- Kleen Energy Systems: updated the close milestone to November 6, 2023, changed the category to `Acquisition`, and labeled the ArcLight release as close-date evidence.
- Lordstown Energy Center: retained 2024 as announcement fallback, changed the February 20, 2024 milestone to `Acquisition`, labeled the ArcLight release as announcement evidence, and removed the unsupported September 2024 close milestone because no public completion source was found in this segment.
- Middletown Energy Center: updated the announcement milestone to July 10, 2025 with category `Acquisition` and labeled the ArcLight release as announcement evidence.
- Natural Gas Pipeline Co. of America: updated the original ArcLight investment milestone to March 8, 2021 with category `Acquisition`, added SEC close-date evidence for the 2021 Kinder Morgan/Brookfield sale, and preserved the 2025 ArcLight release as follow-on acquisition context.
- Prospect Power: updated the close/acquisition milestone to January 15, 2026 with category `Acquisition` and labeled the BusinessWire release as close-date evidence.
- Sequitur Renewables: corrected the 2022 milestone to announcement-fallback wording because the August 1, 2022 primary release was an agreement, not a close notice; changed the source label from close-date to announcement-date evidence.
- SkyVest Renewables: updated the launch and concurrent wind-farm acquisition milestones to July 29, 2024, with `Financing` for the capital commitment and `Acquisition` for the wind-farm close, and labeled the ArcLight release as investment-date evidence.
- Third Coast Infrastructure: added owner-specific close-date evidence for ArcLight's July 23, 2019 completion of the American Midstream take-private and changed the ArcLight milestone to `Acquisition`.

### High-Conviction Confirmations

- AlphaGen: date basis is announcement/platform formation. ArcLight's January 10, 2024 release supports the ArcLight-owned platform formation.
- Generation Bridge and Parkway Generation: date basis is close date. ArcLight's releases support the December 2021 Generation Bridge close and February 18, 2022 Parkway close.
- Invenergy AMPCI Thermal Power: date basis is announcement fallback for ArcLight's 2026 pending acquisition; DigitalBridge/InfraBridge rows remain separate 2018 owner entries tied to the original joint-venture formation.
- REC Solar: date basis is close date. Duke Energy's October 4, 2023 release supports the sale of the commercial distributed generation portfolio, including REC Solar, to an ArcLight-managed fund.

### Unresolved Cases

- Naugatuck Avenue Storage — ArcLight Capital Partners — stored owner/top-level year 2025 — suspected year 2025.
- Sources reviewed: ArcLight home/investments pages, Interconnection.fyi project record, Cleanview project record, and public searches for Jupiter Power / ArcLight / Naugatuck acquisition evidence.
- Why unresolved: reviewed public sources identify the project and general ArcLight context but do not provide a primary or reliable secondary date-bearing acquisition source for ArcLight's owner entry into the named project.
- Evidence needed to resolve: buyer/seller release, regulatory approval, project-company notice, advisor transaction note, or financing/filing evidence stating the acquisition/investment date.

- Phoenix Renewables — ArcLight Capital Partners — stored owner/top-level year 2024 — suspected year 2024.
- Sources reviewed: ArcLight portfolio-services page, ArcLight investments page, and ArcLight's July 29, 2024 SkyVest launch release.
- Why unresolved: public ArcLight materials identify Phoenix as an initial Fund VIII portfolio managed through SkyVest, but the reviewed public sources do not disclose a separate acquisition/investment date for the named Phoenix portfolio.
- Evidence needed to resolve: Fund VIII portfolio transaction notice, acquisition release, or investment table with a date of investment for Phoenix Renewables.

- Thunderbird Renewables — ArcLight Capital Partners — stored owner/top-level year 2024 — suspected year 2024.
- Sources reviewed: ArcLight portfolio-services page, ArcLight investments page, and ArcLight's July 29, 2024 SkyVest launch release.
- Why unresolved: public ArcLight materials identify Thunderbird as an initial Fund VIII portfolio managed through SkyVest, but the reviewed public sources do not disclose a separate acquisition/investment date for the named Thunderbird portfolio.
- Evidence needed to resolve: Fund VIII portfolio transaction notice, acquisition release, or investment table with a date of investment for Thunderbird Renewables.

- Two Rivers Storage — ArcLight Capital Partners — stored owner/top-level year 2026 — suspected year 2026.
- Sources reviewed: New Jersey BPU project-selection notice, Elevate/PR Newswire project-selection release, ROI-NJ coverage, and searches for ArcLight/Elevate owner-entry evidence.
- Why unresolved: reviewed sources support Elevate/ArcLight association and the 2026 project-selection milestone, but they do not prove the date when ArcLight first invested in or acquired the named project company.
- Evidence needed to resolve: project acquisition release, development-company formation/investment notice, financial-close documentation, or regulatory filing with owner-entry date.

### Sources

- `https://www.prnewswire.com/news-releases/arclight-acquires-advanced-power-a-leading-power-infrastructure-developer-302512542.html`
- `https://www.prnewswire.com/news-releases/arclight-creates-alphagen-to-manage-one-of-the-largest-power-infrastructure-portfolios-in-the-united-states-302031341.html`
- `https://www.prnewswire.com/news-releases/arclight-announces-successful-closing-of-renewable-infrastructure-continuation-fund-301328260.html`
- `https://www.prnewswire.com/news-releases/arclight-capital-partners-announces-completion-of-eastern-generations-acquisition-of-a-power-asset-portfolio-from-tenaska-300196879.html`
- `https://www.prnewswire.com/news-releases/arclight-makes-150-million-commitment-to-elevate-renewables-301734222.html`
- `https://www.prnewswire.com/news-releases/arclight-closes-acquisition-of-4-9gw-power-generation-portfolio-from-nrg-energy-301437923.html`
- `https://www.prnewswire.com/news-releases/arclight-announces-865-million-acquisition-of-strategic-pipeline-interest-302365746.html`
- `https://www.prnewswire.com/news-releases/arclight-to-acquire-haynesville-gas-gathering-system-301508310.html`
- `https://www.prnewswire.com/news-releases/arclight-launches-infinigen-renewables-platform-301447102.html`
- `https://inspirationmobility.com/news/inspiration-launches-as-first-purpose-built-ev-solutions-company-announces-200m-commitment-and-fleet-partnership-with-revel`
- `https://www.prnewswire.com/news-releases/arclight-completes-acquisition-of-ownership-interest-in-kleen-energy-systems-301978649.html`
- `https://www.prnewswire.com/news-releases/affiliate-of-arclight-to-acquire-lordstown-energy-center-302065400.html`
- `https://www.macquarie.com/au/en/about/news/2024/macquarie-infrastructure-partners-iii-announces-sale-of-lordstown-energy-center.html`
- `https://www.prnewswire.com/news-releases/arclight-to-acquire-middletown-energy-center-302501772.html`
- `https://www.sec.gov/Archives/edgar/data/1506307/000150630723000023/kmi-20221231.htm`
- `https://www.prnewswire.com/news-releases/arclight-acquires-interest-in-natural-gas-pipeline-company-of-america-one-of-the-largest-natural-gas-infrastructure-assets-in-north-america-302453172.html`
- `https://www.businesswire.com/news/home/20260115405115/en/Elevate-Acquires-Prospect-Power-Storage-a-150-MW-Battery-Asset-in-Northern-Virginia`
- `https://www.prnewswire.com/news-releases/swift-current-energy-executes-sale-of-prospect-power-to-elevate-302661837.html`
- `https://investors.duke-energy.com/news/news-details/2023/Duke-Energy-completes-sale-of-commercial-distributed-generation-portfolio-including-REC-Solar-to-ArcLight/default.aspx`
- `https://www.prnewswire.com/news-releases/arclight-to-acquire-operating-pjm-windfarms-301596749.html`
- `https://www.prnewswire.com/news-releases/arclight-announces-operating-focused-renewables-initiative-and-new-wind-investment-302207994.html`
- `https://www.digitalbridge.com/news/2025-06-25-takanock-secures-500-million-commitment-from-arclight-and-digitalbridge`
- `https://www.prnewswire.com/news-releases/american-midstream-announces-completion-of-merger-300889399.html`
- `https://www.globenewswire.com/news-release/2022/07/06/2475140/0/en/Zeem-Solutions-EV-Fleet-as-a-Service-Provider-Secures-50-Million-Capital-Investment-from-Affiliates-of-ArcLight-Capital-Partners-Announces-Strategic-Partnership-with-LAZ-Parking-Re.html`
- `https://arclight.com/portfolio-services/`
- `https://arclight.com/investments/`
- `https://www.nj.gov/bpu/newsroom/2026/approved/20260305.html`
- `https://www.prnewswire.com/news-releases/new-jersey-bpu-selects-elevates-garden-state-reliability-battery-storage-project-to-improve-affordability-and-address-regional-power-shortage-302714749.html`

## Post-Ara/ArcLight Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T03:37:57.601Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count did not change. Ara and ArcLight edits tightened source labels, milestone wording, exact dates, and categories. Naugatuck Avenue Storage, Phoenix Renewables, Thunderbird Renewables, and Two Rivers Storage remain unchanged pending clearer date-bearing owner-entry evidence.

## Ardian Cluster

### Reviewed Companies / Owners

- AFCO — Ardian — stored year 2025 — unchanged.
- CampusParc — Ardian — stored year 2024 — unchanged.
- Clermont — Ardian — stored year 2024 — unchanged.
- Dauntless Energy — Ardian — stored year 2018 — unchanged.
- Maple Leaf — Ardian — stored year 2020 — unchanged.
- MXT Holdings — Ardian — stored year 2023 — unchanged.
- Unison Site Management — Ardian — corrected from 2017 to 2021.

### Implemented Changes

- AFCO: labeled Ardian's February 19, 2025 agreement announcement as `Announcement date source — Ardian — AFCO`. No close notice was identified in this segment, so the 2025 year remains announcement fallback.
- CampusParc: updated the owner-entry milestone to June 10, 2024 and labeled Ardian's release as close-date evidence for the 100% stake acquisition from QIC-managed funds.
- Clermont: updated the joint-venture creation milestone to March 25, 2024; the category was already `Financing` and the source label was already owner-specific.
- Dauntless Energy: updated the Skyline predecessor-platform milestone to March 5, 2018, split platform formation and first Whirlwind wind-farm acquisition into `Financing` and `Acquisition`, and labeled Ardian's release as investment-date evidence.
- Maple Leaf: updated the Ardian/Enel X battery-storage partnership milestones to September 14, 2020, changed the launch milestone to `Financing`, and labeled Ardian's release as investment-date evidence.
- MXT Holdings: updated the owner-entry milestone to October 30, 2023 based on Ardian's portfolio investment date, labeled Ardian's transaction announcement separately from the portfolio investment-date source, and left the stored year unchanged.
- Unison Site Management: changed top-level and owner `investmentYear` from 2017 to 2021, updated the description, replaced the unsupported 2017 strategic-investment milestone with a November 1, 2021 Ardian investment milestone, and added owner-specific investment-date evidence from Ardian's portfolio page.

### High-Conviction Confirmations

- AFCO: date basis is announcement fallback. Ardian announced an agreement on February 19, 2025 and said closing remained subject to regulatory approvals.
- CampusParc: date basis is close/investment disclosure. Ardian's June 10, 2024 release supports the 100% stake acquisition.
- Clermont: date basis is announcement/platform formation. Ardian and Indigo announced the joint venture on March 25, 2024.
- Dauntless Energy: date basis is platform formation and first acquisition. Ardian's March 5, 2018 release supports the original Skyline Renewables platform launch that later became part of the Dauntless Energy platform.
- Maple Leaf: date basis is investment/partnership launch. Ardian and Enel X announced the Ontario battery-storage partnership and the 80/20 ownership split on September 14, 2020.
- MXT Holdings: date basis is primary portfolio investment date. Ardian announced the transaction in September 2023 and lists MXT as an infrastructure investment dated October 30, 2023.
- Unison Site Management: date basis is primary portfolio investment date. Ardian's portfolio page lists Unison with a November 1, 2021 date; the 2022 AAIF V release corroborates the fund transaction acquiring Unison.

### Sources

- `https://www.ardian.com/news-insights/press-releases/ardian-signs-agreement-acquisition-goldman-sachs-alternatives-stake`
- `https://www.ardian.com/news-insights/press-releases/ardian-acquires-100-stake-campusparc-concessionaire-ohio-state`
- `https://www.ardian.com/news-insights/press-releases/indigo-group-and-ardian-create-clermont-new-venture-accelerate-growth`
- `https://www.group-indigo.com/wp-content/uploads/2024/03/20240318-Press-release-Clermont.pdf`
- `https://www.ardian.com/press-releases/ardian-infrastructure-partners-tph-create-skyline-renewables-and-acquires-60mw-wind`
- `https://www.ardian.com/press-releases/enel-x-and-ardian-infrastructure-launch-battery-storage-partnership-canada`
- `https://corporate.enel.it/en/media/explore-press-releases/press/2020/09/enel-x-and-ardian-infrastructure-launch-battery-storage-partnership-in-canada`
- `https://www.ardian.com/news-insights/press-releases/ardian-acquires-50-stake-mxt-holdings-leading-mexican`
- `https://www.ardian.com/expertise/real-assets/infrastructure/investments?nid=3350`
- `https://www.ardian.com/press-releases/ardian-closes-its-second-generation-americas-infrastructure-fund-us21bn`
- `https://www.ardian.com/expertise/our-portfolio?field_business_unit_eref=&field_category_eref=&field_country_eref=&field_sector_eref=&form_build_id=form-EnQ40isInQDSgOpSoLFAGqD3v4kHQD3xaQKXxdp_jKI&form_id=all_investments_filter_form&held_exited=held&keyword=&op=Search&page=19&year_from=&year_to=`

## Post-Ardian Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T03:42:06.845Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count did not change. The year distribution moved one row from 2017 to 2021 due to the Unison correction.

## Ares Management Cluster

### Reviewed Companies / Owners

- Ada Infrastructure — Ares Management — stored year 2025 — unchanged.
- Apex Clean Energy — Ares Management — stored year 2021 — unchanged.
- Atlas Crane Service — Ares Management — stored year 2022 — unchanged.
- Birdsboro Power LLC — Ares Management — stored year 2017 — unchanged.
- Bluepeak — Ares Management — stored year 2024 — unchanged.
- Burnham RNG — Ares Management — stored year 2023 — unchanged.
- Current Trucking — Ares Management — stored year 2023 — unchanged.
- EDPR United States renewables portfolio — Ares Management — stored year 2025 — unchanged.
- ENGIE United States renewables partnership portfolio — Ares Management — stored year 2024 — unchanged.
- Meade Pipeline Co. LLC — Ares Management — stored year 2025 — unchanged.
- Northampton Generating Company L.P. — Ares Management — stored year 2015 — unchanged.
- Prime Data Centers — Ares Management — stored year 2025 — unchanged.
- RENEW Energy Partners — Ares Management — stored year 2020 — unchanged.
- Sagepoint Energy — Ares Management — stored year 2025 — unchanged.
- SB Energy — Ares Management — stored year 2022 — unchanged.
- Spruance Operating Services LLC — Ares Management — stored year 2015 — unchanged.
- Tango Holdings LLC — Ares Management — stored year 2025 — unchanged.
- Underline Infrastructure — Ares Management — stored year 2022 — unchanged.
- DSD Renewables — Ares Management secondary owner row — stored year 2022 — unchanged.

### Implemented Changes

- Ada Infrastructure: updated the GCP International close milestone to March 1, 2025 and added Ares' close release as `Close date source — Ares Management — Ada Infrastructure`.
- Apex Clean Energy: updated the Ares close milestone to November 17, 2021 and labeled Apex's release as close-date evidence.
- Atlas Crane Service: updated the Ares milestone to August 22, 2022 with category `Acquisition` and labeled the BusinessWire release as close-date evidence.
- Birdsboro Power LLC: added a March 1, 2017 Ares EIF investment milestone with category `Financing` and owner-specific investment-date evidence; kept later Tokyo Gas and Kyushu co-investor transactions as context.
- Bluepeak: updated the Ares strategic-investment milestone to February 29, 2024 with category `Financing` and labeled Bluepeak's release as investment-date evidence.
- Burnham RNG: updated the Ares acquisition milestone to December 4, 2023 and labeled Burnham's PR Newswire release as close-date evidence.
- Current Trucking: updated the Ares controlling-interest milestone to February 27, 2023 with category `Acquisition` and labeled Current's release as close-date evidence.
- EDPR United States renewables portfolio: updated the close milestone to October 3, 2025 with category `Acquisition` and labeled EDPR's close notice as close-date evidence.
- ENGIE United States renewables partnership portfolio: replaced expansion-only source reliance with ENGIE's September 12, 2024 initial partnership close source, updated the milestone to that date, and preserved later expansions as context.
- Sagepoint Energy: updated the platform formation and Ares majority-owner milestones to March 5, 2025, changed the formation milestone to `Financing`, and labeled the BusinessWire release as investment-date evidence.
- SB Energy: updated the Ares strategic-equity milestone to March 7, 2022 with category `Financing` and labeled SB Energy's release as investment-date evidence.
- Tango Holdings LLC: updated the JV formation, initial portfolio, and 80/20 ownership milestones to July 28, 2025, changed the formation milestone to `Financing`, and labeled the BusinessWire release as investment-date evidence.
- Underline Infrastructure: updated the Ares investment milestone to September 20, 2022 with category `Financing` and labeled Underline's release as investment-date evidence.

### High-Conviction Confirmations

- Meade Pipeline Co. LLC: date basis is acquisition disclosure. Ares' September 29, 2025 release states that Ares funds acquired 100% of Meade from XPLR Infrastructure.
- Prime Data Centers: date basis is European Commission clearance / acquisition-of-joint-control notice. The March 2025 EC materials support Ares acquiring joint control of Prime with Macquarie and Data Realty Group.
- RENEW Energy Partners: date basis is announcement fallback. RENEW's August 3, 2020 release states that RENEW and Ares funds would acquire a portfolio of contracted energy-efficiency and distributed-power projects; no separate public close notice was identified in this segment.
- DSD Renewables Ares row: date basis is preferred-equity investment announcement. DSD's March 3, 2022 release supports the Ares secondary-owner row and does not alter BlackRock's 2019 primary owner year.
- Northampton Generating Company and Spruance Operating Services: unchanged as Ares-managed legacy EIF assets. Ares' January 1, 2015 close of the Energy Investors Funds acquisition is the public basis currently supporting the 2015 Ares association; no clearer asset-level Ares entry source was identified in this segment.

### Sources

- `https://www.aresmgmt.com/news-views/ares-management-corporation-completes-acquisition-gcp-international`
- `https://www.apexcleanenergy.com/news/ares-management-and-apex-clean-energy-close-majority-stake-acquisition/`
- `https://www.businesswire.com/news/home/20220822005740/en/Atlas-Crane-Service-Acquired-by-Ares-Management`
- `https://www.nsenergybusiness.com/news/newsares-eif-closes-investment-in-488mw-birdsboro-power-plant-in-pennsylvania-us-010317-5752530/`
- `https://mybluepeak.com/strategic-investment-ares-management/`
- `https://www.prnewswire.com/news-releases/burnham-rng-is-acquired-by-ares-management-302004716.html`
- `https://www.currenttrucking.com/press-releases-2`
- `https://www.edpr-investors.com/en/investor-information/market-notifications/edpr-closes-asset-rotation-deal-16-gw-portfolio-us`
- `https://www.engie-na.com/engie-enters-a-partnership-with-ares-management-for-a-2-7-gw-portfolio-of-renewables-and-storage-assets-in-the-u-s`
- `https://ir.aresmgmt.com/news/ares-management-acquires-meade-pipeline-to-enhance-energy-infrastructure-portfolio/dcd45edc-42e0-48c5-bfc3-cb04de0bad4b`
- `https://www.sidley.com/en/newslanding/newsannouncements/2025/09/sidley-represents-ares-management-in-its-us%241-billion-acquisition-of-meade-pipeline-co-llc`
- `https://www.aresmgmt.com/news-views/ares-management-lp-closes-acquisition-energy-investors-funds`
- `https://ec.europa.eu/competition/mergers/cases1/202512/M_11843_10567975_126_3.pdf`
- `https://renewep.com/renew-and-ares-infrastructure-and-power-to-provide-energy-efficiency-infrastructure-projects-to-customers/`
- `https://www.businesswire.com/news/home/20250305067453/en/Dynamic-Renewables-BC-Organics-and-National-Organics-Combine-to-Form-Sagepoint-Energy-a-Leader-in-Renewable-Waste-to-Energy-Solutions`
- `https://sbenergy.com/strategic-equity-investment-from-ares-management/`
- `https://www.businesswire.com/news/home/20250728365772/en/Ares-Management-Establishes-Joint-Venture-With-Savion-to-Invest-in-U.S.-Solar-Power-Generation`
- `https://www.underline.com/post/underline-receives-new-investment-for-infrastructure-to-connect-communities`
- `https://dsdrenewables.com/press-release/dsd-secures-200m-preferred-equity-investment-from-ares-management-press-release/`

## Post-Ares Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T03:45:48.080Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count did not change. Ares edits tightened date basis and source labels across primary and secondary Ares owner rows without changing stored investment years.

## Astatine Investment Partners Cluster

### Reviewed Companies / Owners

- BTR — Astatine Investment Partners — stored year 2021 — unchanged.
- Everfast Fiber Networks — Astatine Investment Partners — stored year 2022 — unchanged.
- Maurepas Pipeline — Astatine Investment Partners — stored year 2018 — unchanged.
- McKeil Marine — Astatine Investment Partners — stored year 2023 — unchanged.
- PECO Pallet — Astatine Investment Partners — stored year 2020 — unchanged.
- Twin Parking Holdings — Astatine Investment Partners — stored year 2024 — unresolved and unchanged.

### Implemented Changes

- BTR: updated the owner-entry milestone to September 30, 2021, changed it to `Acquisition`, and added Cassels' closing notice as `Close date source — Astatine Investment Partners — BTR`. The later 2024 Lincoln International recapitalization source was preserved but relabeled as recapitalization context so it does not drive the investment year.
- Everfast Fiber Networks: changed the December 2022 Astatine acquisition/platform milestone from `Other` to `Acquisition` and labeled Bank Street's transaction page as close-date evidence.
- Maurepas Pipeline: changed the August 20, 2018 49% interest acquisition milestone from `Other` to `Acquisition` and labeled Astatine's release as investment-date evidence.
- McKeil Marine: labeled Astatine's November 3, 2023 release as close-date evidence for the Astatine acquisition from TorQuest.

### High-Conviction Confirmations

- BTR: date basis is close date. Cassels states the Alinda/Astatine predecessor acquisition of Big Truck Rental completed on September 30, 2021; the 2024 Lincoln International item is a recapitalization and was not used to reset the year.
- Everfast Fiber Networks: date basis is close/acquisition disclosure. Bank Street states Astatine acquired the Kansas City assets of Consolidated Communications in December 2022 and established Everfast Fiber Networks.
- Maurepas Pipeline: date basis is announcement/investment disclosure. Astatine announced Alinda's acquisition of a 49% interest in Maurepas Pipeline on August 20, 2018; no separate close notice was identified in this segment.
- McKeil Marine: date basis is acquisition disclosure. Astatine's release states Astatine acquired McKeil Marine from TorQuest Partners on November 3, 2023.
- PECO Pallet: date basis is close date. PECO announced the Alinda/USS agreement on October 5, 2020, and Holland & Knight identifies the joint acquisition closing on October 9, 2020.

### Unresolved

- Twin Parking Holdings — Astatine Investment Partners — stored year 2024 — suspected year 2024. Reviewed Astatine's Twin Parking profile, investment listing, and about pages, plus earlier public searches. The public pages confirm Astatine ownership but do not disclose a date-bearing acquisition, close, signing, or investment event. A buyer/seller release, filing, advisor note, or Astatine investment table with an investment date would be needed to resolve the row. The database remains unchanged.

### Sources

- `https://cassels.com/rep_work/alinda-capital-partners-acquires-big-truck-rental-and-0962667-b-c-ltd/`
- `https://bigtruckrental.com/history/`
- `https://astatineip.com/investment/btr/`
- `https://www.lincolninternational.com/transactions/astatine-investment-partners-has-recapitalized-big-truck-rental/`
- `https://www.bankstreet.com/transactions/astatine-investment-partners-has-acquired-the-kansas-city-assets-of-consolidated-communications-establishing-a-new-fiber-to-the-premises-platform-everfast-fiber-networks/`
- `https://astatineip.com/2018/08/20/alinda-acquires-49-interest-in-maurepas-pipeline/`
- `https://astatineip.com/2023/11/03/astatine-investment-partners-to-acquire-mckeil-marine/`
- `https://www.pecopallet.com/press-release/acquisition-2020-10-5/`
- `https://www.hklaw.com/en/news/pressreleases/2020/10/holland-and-knight-advises-on-joint-acquisition-of-peco-pallet`
- `https://astatineip.com/investment/twin-parking-holdings/`

## Post-Astatine Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T03:47:55.293Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count did not change. Astatine edits tightened date basis, milestone categories, and source labels while leaving unresolved Twin Parking unchanged.

## AustralianSuper Cluster

### Reviewed Companies / Owners

- Chesapeake toll road network — AustralianSuper — corrected from 2020 to 2021.
- DataBank — AustralianSuper — stored year 2024 — unchanged.
- Generate Capital — AustralianSuper secondary owner row — stored year 2021 — unchanged.
- Buckeye Partners — AustralianSuper secondary owner row — stored year 2019 — unchanged.

### Implemented Changes

- Chesapeake toll road network: changed top-level and owner `investmentYear` from 2020 to 2021 because Transurban's later public reporting shows the Chesapeake partnership sale completed on March 31, 2021. Updated the description, changed the same-year investment milestone to a 2021 `Acquisition`, preserved the December 2020 announcement as historical context, and added `Close date source — AustralianSuper — Chesapeake toll road network`.
- DataBank: kept AustralianSuper's 2024 year as announcement fallback, but relabeled the DataBank and AustralianSuper sources as `Announcement date source — AustralianSuper — DataBank` because the primary October 15, 2024 release said the transaction was expected to close later and no clean primary close notice was identified in this segment.

### High-Conviction Confirmations

- Generate Capital: date basis is close/equity-raise disclosure. Generate's July 19, 2021 release states the company raised $2 billion in corporate equity, led by existing investors AustralianSuper and QIC, with new investment from Harbert Management Corporation and others.
- Buckeye Partners: date basis is IFM acquisition close for the underlying take-private, with AustralianSuper participation through IFM documented by secondary AustralianSuper interview coverage. IFM's November 1, 2019 closing release supports the year for the acquisition, while the AustralianSuper-specific public evidence does not disclose a separate co-investment close date that would change the stored 2019 year.

### Sources

- `https://www.australiansuper.com/-/media/australian-super/files/about-us/media-releases/australiansuper-acquisition-of-stake-in-chesapeake-toll-roads.pdf`
- `https://www.transurban.com/content/dam/transurban-pdfs/02/news/20201216-North-America-Press-Release.pdf`
- `https://www.transurban.com/content/dam/investor-centre/01/FY22-Appendix4E.pdf`
- `https://www.databank.com/resources/press-releases/databank-announces-2-0-billion-equity-raise-led-by-1-5-billion-investment-from-australiansuper/`
- `https://www.databank.com/resources/press-releases/databank-completes-first-phase-of-major-recapitalization/`
- `https://www.digitalbridge.com/news/2025-01-30-digitalbridge-announces-participation-in-databank-financing`
- `https://www.businesswire.com/news/home/20210719005233/en/Generate-Closes-%242-Billion-Equity-Raise-from-Global-Institutional-Investors-to-Accelerate-and-Scale-Sustainable-Infrastructure-and-Climate-Solutions`
- `https://www.ifminvestors.com/en-au/news-and-insights/media-centre/ifm-investors-completes-acquisition-of-buckeye-partners-l.p`
- `https://www.buckeye.com/press-releases/bpl-agrees-to-be-acquired-by-ifm-investors-for-41-50-per-common-unit`
- `https://i3-invest.com/2021/06/ports-surprise-during-the-pandemic/`

## Post-AustralianSuper Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T03:51:55.820Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count did not change. The year distribution moved one row from 2020 to 2021 due to the Chesapeake close-date correction.

## Axium Infrastructure Cluster

### Reviewed Companies / Owners

- 527 Renewables Holdings LLC — Axium Infrastructure — stored year 2022 — unchanged.
- AgeCare Facilities Portfolio — Axium Infrastructure — stored year 2020 — unchanged.
- Anthony Henday Drive Southeast — Axium Infrastructure — stored year 2010 — unchanged.
- Arbour Heights — Axium Infrastructure — stored year 2019 — unchanged.
- Aspire at West Campus — Axium Infrastructure — stored year 2019 — unchanged.
- Aurora Solar Portfolio — Axium Infrastructure — stored year 2022 — unchanged.
- Axium Great Plains Wind LLC — Axium Infrastructure — stored year 2016 — unchanged.
- BlueWave — Axium Infrastructure — stored year 2022 — unchanged.
- Cascade Power Project — Axium Infrastructure — stored year 2020 — unchanged.
- Cedar Point II Wind Project — Axium Infrastructure — stored year 2024 — unchanged.
- CHUM Research Centre (CRCHUM) — Axium Infrastructure — stored year 2013 — unchanged.
- Copper Crossing Solar Ranch — Axium Infrastructure — stored year 2019 — unchanged.
- CPV Three Rivers Energy Center — Axium Infrastructure — stored year 2020 — unchanged.
- Crimson Storage — Axium Infrastructure — stored year 2021 — unchanged.
- Denfield Power Portfolio — Axium Infrastructure — stored year 2021 — unchanged.
- Dry Lake II Wind Farm — Axium Infrastructure — stored year 2019 — unchanged.
- EDPR U.S. Wind Portfolio — Axium Infrastructure — stored year 2016 — unchanged.
- Edwards Sanborn 1A — Axium Infrastructure — stored year 2022 — unchanged.
- Edwards Sanborn 1A & 1B — Axium Infrastructure — stored year 2022 — unchanged.
- Etobicoke General Hospital Phase 1 Patient Tower — Axium Infrastructure — stored year 2016 — unchanged.
- Georgetown Cogeneration Facility — Axium Infrastructure — stored year 2022 — unchanged.
- Grand Valley III Wind Project — Axium Infrastructure — stored year 2023 — unchanged.
- Jimmie Creek Hydroelectric Project — Axium Infrastructure — stored year 2014 — unchanged.
- K2 Wind Facility — Axium Infrastructure — stored year 2016 — unchanged.
- Kings Mountain Energy Center — Axium Infrastructure — stored year 2017 — unchanged.
- Longwood Medical Area Energy System — Axium Infrastructure — stored year 2018 — unchanged.
- Mass Ave Housing Partners — Axium Infrastructure — stored year 2022 — unchanged.
- Metropistas — Axium Infrastructure — stored year 2016 — unchanged.
- Northwest British Columbia Hydroelectric Facilities — Axium Infrastructure — stored year 2018 — unchanged.
- Ohio State Energy Partners — Axium Infrastructure — stored year 2017 — unchanged.
- Optima Living Joint Ventures — Axium Infrastructure — stored year 2020 — unchanged.
- Port Dover & Nanticoke Wind Project — Axium Infrastructure — stored year 2024 — unchanged.
- PUC Transmission LP — Axium Infrastructure — stored year 2024 — unchanged.
- Quality Wind Project — Axium Infrastructure — stored year 2024 — unchanged.
- RET North American Solar Portfolio — Axium Infrastructure — stored year 2016 — unchanged.
- Revera Joint Venture — Axium Infrastructure — stored year 2018 — unchanged.
- Sea-to-Sky Highway — Axium Infrastructure — stored year 2010 — unchanged.
- Slate Creek Wind Project — Axium Infrastructure — stored year 2016 — unchanged.
- Sorel-Tracy Detention Centre — Axium Infrastructure — stored year 2013 — unchanged.
- Swiftsure Housing Partners (Broadview at Vanderbilt) — Axium Infrastructure — stored year 2021 — unchanged.
- Travers Solar Project — Axium Infrastructure — stored year 2023 — unchanged.
- Upper Peninsula Power Company (UPPCO) — Axium Infrastructure — stored year 2021 — unchanged.
- Wind Energy Transmission Texas, LLC (WETT) — Axium Infrastructure — stored year 2020 — unchanged.

### Implemented Changes

- No Axium owner `investmentYear` values were changed. Public evidence supported the stored years.
- 527 Renewables, Aspire, Axium Great Plains, BlueWave, Cedar Point II, Denfield, EDPR U.S. Wind, K2, Kings Mountain, Longwood, Northwest British Columbia Hydro, Port Dover & Nanticoke, Quality Wind, Revera JV, UPPCO, and WETT: changed same-year owner-entry milestones from generic `Other` to `Acquisition` where source language supports acquired, completed, closed, or finalized acquisition/investment of an equity interest.
- AgeCare, CPV Three Rivers, Etobicoke, Jimmie Creek, Ohio State, and Sorel-Tracy: changed or confirmed same-year owner-entry milestones as `Financing` where evidence relates to a financial close, concession, partnership, or equity/PPP investment rather than a conventional purchase of control.
- Anthony Henday: replaced the previously incorrect Hornet PDF source with the Axium Sea-to-Sky / Anthony Henday December 2010 acquisition PDF and labeled it as close-date evidence.
- Crimson Storage: corrected the owner-entry milestone from September 17, 2021 to September 8, 2021 based on Recurrent Energy's majority-sale close release, preserved the Axium 2022 operating update as context, and added close-date evidence.
- Edwards Sanborn 1A and Edwards Sanborn 1A & 1B: tied the initial 2022 year to Terra-Gen's Phase 1A Axium investment disclosure and preserved the later 2024 Phase 1B investment as a follow-on event that does not reset the original owner-entry year.
- Port Dover & Nanticoke and Quality Wind: kept 2024 but made the December 20, 2024 close milestone the investment-year support; the November 27, 2024 agreement announcement remains context.
- RET North American Solar Portfolio, Grand Valley III, Jimmie Creek, K2, Kings Mountain, Longwood, Northwest British Columbia Hydro, Ohio State, Revera JV, Sorel-Tracy, Travers, UPPCO, and WETT: added or adjusted owner-specific source labels using the required investment-date evidence format.

### High-Conviction Confirmations

- 527 Renewables: date basis is acquisition disclosure. Axium announced acquisition of the diversified renewable-energy portfolio on February 2, 2022.
- AgeCare: date basis is announcement fallback. Axium's January 2020 release supports the seniors-housing investment, with no separate close date identified in this segment.
- Anthony Henday and Sea-to-Sky: date basis is close/acquisition disclosure. Axium's December 2010 PDF supports the acquisition of economic interests in the concession rights.
- Aspire: date basis is acquisition disclosure. Axium's October 3, 2019 release supports the investment in the University of Iowa student-housing project.
- Cascade, CPV Three Rivers, Etobicoke, Ohio State, Mass Ave, Sorel-Tracy, and Swiftsure: date basis is financial close or concession/PPP agreement evidence; all stored years remain aligned to the owner-entry event, not later operations.
- Copper Crossing and Dry Lake II: date basis is 2019 acquisition agreement / portfolio acquisition evidence from Avangrid/Axium for the operating Arizona wind and solar projects; no year change.
- Crimson Storage: date basis is close date. Recurrent Energy's September 8, 2021 release supports the majority sale to Axium-managed funds.
- Grand Valley III: date basis is investment/acquisition disclosure. Axium's March 1, 2023 release states an Axium-managed fund acquired a 75% interest.
- Jimmie Creek: date basis is completed partnership agreement. Axium's April 24, 2014 release states Alterra and Fiera Axium completed the partnership agreement and identifies Axium's 49% interest.
- K2: date basis is close date. Axium's August 9, 2016 release states the Axium/ATRF/Manulife consortium completed acquisition of Samsung's one-third interest; the 2018 remaining-interest acquisition is later add-on context.
- Kings Mountain: date basis is close date. Axium's March 16, 2017 release states Axium closed acquisition of equity interests including KMEC.
- Longwood: date basis is close date. Axium's April 3, 2018 release states ENGIE and Axium completed the acquisition through Longwood Energy Partners.
- Northwest British Columbia Hydro: date basis is close date for the initial 35% interest on June 22, 2018; the December 13, 2018 additional 55% agreement remains follow-on context.
- Port Dover & Nanticoke and Quality Wind: date basis is close date. Axium's December 20, 2024 release states Axium-managed funds and NS Pension finalized the 49% portfolio acquisition.
- PUC Transmission: date basis is announcement fallback. Axium's September 25, 2024 release states it acquired an 80% equity interest in transmission facilities to be built; no separate close notice was identified in this segment.
- RET North American Solar: date basis is close/completion disclosure. PR Newswire states Axium completed the acquisition on November 21, 2016.
- Revera Joint Venture: date basis is close date. Axium's April 30, 2018 release states Revera and Axium completed the joint venture transaction for 32 long-term care homes.
- Travers: date basis is investment/acquisition disclosure. Axium's January 24, 2023 PDF states an Axium-managed fund acquired the operating Travers Solar Project.
- UPPCO: date basis is close date. Axium's June 4, 2021 release states completion of the 100% acquisition from Basalt.
- WETT: date basis is owner investment disclosure. Axium's 2025 additional-interest release states Axium initially invested in WETT in July 2020; the 2025 purchase is a follow-on and was not used to reset the year.

### Unresolved

- None in this Axium segment. CVC DIF co-owner rows on Cascade and Etobicoke were not treated as Axium confirmations and remain for the CVC DIF owner-specific review cluster.

### Sources

- `https://www.axiuminfra.com/2022/02/02/february-2-2022-axium-infrastructure-acquires-a-diversified-portfolio-of-renewable-energy-assets/?lang=en`
- `https://www.axiuminfra.com/wp-content/uploads/2016/12/EN_FieraAxiumInfrastructureCanadaLP_ProjectZapple_Nov302010.pdf`
- `https://www.axiuminfra.com/2019/10/08/october-3-axium-acquires-graduate-student-housing-project-on-university-of-iowa-campus/?lang=en`
- `https://www.axiuminfra.com/2022/05/12/may-12-2022-bluewave-acquired-by-axium-infrastructure-to-accelerate-growth-in-solar-and-energy-storage-development/?lang=en`
- `https://www.axiuminfra.com/2019/09/17/september-17-2019-avangrid-renewables-agrees-to-sell-50-interest-in-two-operating-wind-and-solar-projects-in-arizona-to-axium-infrastructure/?lang=en`
- `https://recurrentenergy.com/archives/8245`
- `https://terra-gen.com/axium-infrastructure-invests-in-phase-1-of-edwards-sanborn-solar-storage-facility/`
- `https://terra-gen.com/axium-infrastructure-invests-in-phase-1b-of-the-edwards-sanborn-solar-storage-facility/`
- `https://www.axiuminfra.com/2023/03/01/march-1-2023-axium-infrastructure-acquires-75-equity-interest-in-40-mw-operational-wind-project/?lang=en`
- `https://www.axiuminfra.com/2014/04/24/april-24-2014-alterra-power-and-fiera-axium-announce-partnership-for-jimmie-creek-hydro-project/?lang=en`
- `https://www.axiuminfra.com/2016/08/09/august-9-2016-consortium-composed-of-axium-infrastructure-alberta-teachers-retirement-fund-board-and-manulife-financial-corporation-completes-acquisiton-of-interest-in-270-mw-wind-facili/?lang=en`
- `https://www.axiuminfra.com/2017/03/16/march-16-2017-axium-infrastructure-closes-acquisition-of-equity-interests-in-natural-gas-power-generation-portfolio-from-capital-dynamics/?lang=en`
- `https://www.axiuminfra.com/2018/04/03/april-3-2018-engie-and-axium-acquire-energy-system-serving-six-harvard-affiliated-medical-institutions-in-the-longwood-medical-area-in-boston/?lang=en`
- `https://www.umassba.org/sites/umassba.net/files/financial-documents/FINAL-UMBA-FS-FY22.pdf`
- `https://www.axiuminfra.com/2018/06/22/june-22-2018-consortium-composed-of-axium-infrastructure-and-manulife-financial-corporation-completes-acquisition-of-interest-in-303-mw-hydro-facilities-from-altagas/?lang=en`
- `https://www.axiuminfra.com/2018/12/13/december-13-2018-consortium-composed-of-axium-infrastructure-and-manulife-financial-corporation-to-acquire-additional-55-interest-in-303-mw-hydro-facilities-from-altagas/?lang=en`
- `https://www.axiuminfra.com/2017/04/10/april-7-2017-engie-and-axium-secure-50-year-comprehensive-energy-management-contract-with-the-ohio-state-university/?lang=en`
- `https://www.axiuminfra.com/2024/09/25/september-25-2024-axium-infrastructure-acquires-80-equity-interest-in-regulated-transmission-facilities-to-be-built-in-ontario/?lang=en`
- `https://www.axiuminfra.com/2024/12/23/december-20-2024-axium-infrastructure-finalizes-the-acquisition-of-an-equity-interest-in-two-operational-wind-projects/?lang=en`
- `https://www.prnewswire.com/news-releases/axium-infrastructure-completes-acquisiton-of-north-american-solar-portfolio-602288275.html`
- `https://www.axiuminfra.com/2018/04/30/april-30-2018-revera-and-axium-infrastructure-form-a-joint-venture-to-share-ownership-of-32-long-term-care-homes/?lang=en`
- `https://www.axiuminfra.com/wp-content/uploads/2016/12/EN_Sorel-Tracy-Detention-Centre-news-Fiera-Axium-EN.pdf`
- `https://www.axiuminfra.com/wp-content/uploads/2023/01/Axium_Travers-Solar-Acquisition_1.24.2023.pdf`
- `https://www.axiuminfra.com/2021/07/01/june-4-2021-axium-infrastructure-completes-the-acquisition-of-regulated-electric-utility-provider-in-michigans-upper-peninsula/?lang=en`
- `https://www.axiuminfra.com/2025/05/13/march-24-2025-axium-infrastructure-acquires-additional-interest-in-regulated-electric-transmission-provider-in-texas/?lang=en`

## Post-Axium Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T04:00:15.747Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count did not change. Axium edits tightened same-year milestone categories, source labels, and one Crimson close date while preserving stored owner/top-level investment years.

## Basalt Infrastructure Partners Cluster

### Reviewed Companies / Owners

- EnviroSpark — Basalt Infrastructure Partners — stored year 2024 — unchanged.
- Fatbeam — Basalt Infrastructure Partners — stored year 2023 — unchanged.
- Fortbrand — Basalt Infrastructure Partners — stored year 2023 — unchanged.
- Go Lime — Basalt Infrastructure Partners — stored year 2025 — unchanged.
- Habitat Solar — Basalt Infrastructure Partners — stored year 2020 — unchanged.
- Helios Power — Basalt Infrastructure Partners — stored year 2019 — unchanged.
- OnSite Partners — Basalt Infrastructure Partners — stored year 2024 — unchanged.
- Skyway Towers — Basalt Infrastructure Partners — stored year 2022 — unchanged.
- Xpress Natural Gas — Basalt Infrastructure Partners — stored year 2021 — unchanged.

### Implemented Changes

- EnviroSpark: corrected the investment milestone from May 14, 2024 to May 2, 2024, changed the category to `Financing`, and labeled the PR Newswire release as `Investment date source — Basalt Infrastructure Partners — EnviroSpark`.
- Fatbeam: replaced the unsupported August 14, 2023 acquisition milestone with Basalt's March 27, 2023 agreement announcement fallback, kept the 2023 year unchanged, and added owner-specific announcement-date evidence.
- Fortbrand: labeled Basalt's September 7, 2023 acquisition release as investment-date evidence; the stored year and milestone already aligned.
- Go Lime: changed the generic 2025 transaction milestone to December 17, 2025, changed the category to `Acquisition`, and added Basalt's public acquisition disclosure as owner-specific investment-date evidence while preserving the DC Advisory transaction source as context.
- Habitat Solar: updated the investment milestone to October 29, 2020 and `Acquisition`, added close-date evidence from MarketScreener / S&P Capital IQ, and kept the 2020 stored year unchanged.
- OnSite Partners: added AEP's September 30, 2024 sale-completion release as close-date evidence; the stored year and close milestone already aligned.
- Skyway Towers: changed the May 2022 Basalt acquisition milestone from `Other` to `Acquisition` and labeled the Skyway transaction PDF as investment-date evidence.
- Xpress Natural Gas: changed the February 1, 2021 definitive-agreement milestone from `Other` to `Acquisition` and labeled the BusinessWire release as announcement-date evidence.

### High-Conviction Confirmations

- EnviroSpark: date basis is investment announcement. The company announced a $50 million Basalt investment on the May 2024 PR Newswire release; no close-date reset was needed.
- Fatbeam: date basis is announcement fallback. Basalt's March 27, 2023 release states Basalt IV agreed to acquire Fatbeam and that closing was expected in Q2 2023; no primary close notice was identified in this segment.
- Fortbrand: date basis is acquisition disclosure. Basalt's September 7, 2023 release states funds advised by Basalt acquired Fortbrand from Wincove.
- Go Lime: date basis is investment/acquisition disclosure. Basalt's public posting and news list identify the acquisition of Go Lime and Simply Green assets on December 17, 2025; no separate more granular close evidence was identified in this segment.
- Habitat Solar: date basis is close date. MarketScreener / S&P Capital IQ states Basalt III and IGS Solar completed the acquisition of the residential solar portfolio on October 29, 2020 and that Habitat Solar was the newly created entity.
- Helios Power: date basis is announcement/platform launch. Soltage and Basalt announced the Helios funding vehicle on July 18, 2019; no separate close evidence was identified and the stored 2019 year remains appropriate.
- OnSite Partners: date basis is close date. AEP completed the sale of OnSite Partners to Basalt-advised funds on September 30, 2024.
- Skyway Towers: date basis is investment/acquisition disclosure. Skyway's transaction PDF supports Basalt III acquiring Skyway Towers from Tinicum in May 2022.
- Xpress Natural Gas: date basis is announcement fallback. BusinessWire states Basalt III entered into a definitive agreement to acquire XNG on February 1, 2021 and that completion remained subject to closing conditions; no primary close notice was identified in this segment.

### Unresolved

- None in this Basalt segment. Where close evidence was unavailable for Fatbeam and Xpress Natural Gas, announcement fallback remained sufficient to confirm the stored year.

### Sources

- `https://www.prnewswire.com/news-releases/ev-charging-company-envirospark-secures-50-million-investment-from-basalt-infrastructure-partners-302134720.html`
- `https://www.basaltinfra.com/2023/03/27/basalt-infrastructure-partners-enters-into-agreement-to-acquire-fatbeam/`
- `https://www.fatbeamfiber.com/media-news/fatbeam-is-growing`
- `https://www.basaltinfra.com/2023/09/07/basalt-infrastructure-partners-acquires-fortbrand-from-wincove-private-holdings/`
- `https://www.linkedin.com/posts/basalt-infrastructure-partners_basalt-is-delighted-to-announce-that-funds-activity-7407062350589218816-ceKW`
- `https://www.dcadvisory.com/news-deals-insights/deal-announcements/dc-advisory-advises-basalt-infrastructure-partners-on-its-parallel-acquisition-and-subsequent-merger-of-go-lime-and-simply-green-home-services/`
- `https://www.marketscreener.com/quote/stock/ARES-MANAGEMENT-CORPORATI-50061101/news/Basalt-III-managed-by-Basalt-Infrastructure-Partners-LLP-and-IGS-Solar-LLC-acquired-unknown-stake-i-33649345/`
- `https://www.prnewswire.com/news-releases/soltage-and-basalt-launch-helios-power-to-deploy-200-mw-of-solar-in-the-us-300887583.html`
- `https://www.aep.com/news/releases/read/9796/AEP-Completes-Sale-of-AEP-OnSite-Partners/`
- `https://onsitepartners.com/news/onsite-partners-llc-announces-acquisition-by-basalt-infrastructure-partners/`
- `https://skywaytowers.com/docs/BasaltSkyway.pdf`
- `https://www.businesswire.com/news/home/20210201005803/en/Basalt-to-Acquire-Xpress-Natural-Gas`

## Post-Basalt Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T04:04:37.590Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count did not change. Basalt edits tightened milestone categories, source labels, and same-year date precision while preserving stored owner/top-level investment years.

## BCI Cluster

### Reviewed Companies / Owners

- Ag Partners Capital — BCI — stored year 2021 — unchanged.
- Caddo Sustainable Timberlands LP — BCI — stored year 2022 — unchanged.
- Cleco Corporation — BCI — stored year 2016 — unchanged.
- Connaught Oil and Gas — BCI — stored year 2025 — unchanged; unresolved.
- Corex Resources Ltd. — BCI — stored year 2025 — unchanged; unresolved.
- Corix Infrastructure — BCI — stored year 2006 — unchanged.
- GCT Global Container Terminals Inc. — BCI — stored year 2018 — unchanged.
- InTransit BC — BCI — stored year 2005 — unchanged.
- InTransit BC — CDPQ — stored year 2005 — unchanged; adjacent co-owner confirmation.
- Monterey Mushrooms — BCI — stored year 2025 — unchanged.
- Mosaic Forest Management — BCI — stored year 2018 — unchanged.
- Nexus Water Group — BCI — stored year 2024 — unchanged.
- Nexus Water Group — J.P. Morgan Asset Management — stored year 2024 — unchanged; adjacent co-owner confirmation.
- Northview Energy — BCI — stored year 2026 — unchanged.
- Northview Energy — Brookfield Asset Management — stored year 2026 — unchanged; adjacent co-owner confirmation.
- Teays River Investments — BCI — stored year 2021 — unchanged.

### Implemented Changes

- Caddo Sustainable Timberlands LP: changed the February 14, 2022 creation milestone from `Other` to `Financing` and labeled BCI's platform-creation release as `Investment date source — BCI — Caddo Sustainable Timberlands LP`.
- Cleco Corporation: changed the October 20, 2014 agreement milestone and April 13, 2016 completion milestone to `Acquisition`, and labeled the Cleco agreement and completion releases as BCI-specific announcement and close-date evidence.
- GCT Global Container Terminals Inc.: aligned the BCI owner-entry milestones to the June 7, 2018 Ontario Teachers announcement fallback and labeled the Ontario Teachers release as `Announcement date source — BCI — GCT Global Container Terminals Inc.`.
- Mosaic Forest Management: changed the 2018 Mosaic platform launch milestone to `Financing` because the public evidence supports formation of the jointly owned timberland platform rather than a later bolt-on event.
- Northview Energy: changed the March 3, 2026 platform launch milestone to `Financing` and added separate announcement-date source labels for BCI and Brookfield Asset Management. The release states the formal launch remained subject to approvals and customary closing conditions, so the 2026 year remains an announcement fallback until a close/effective notice is public.
- Teays River Investments: changed the 2021 BCI renewable-resources investment milestone to `Financing` and labeled BCI's public renewable-resources discussion as owner-specific investment-date evidence.

### High-Conviction Confirmations

- Ag Partners Capital: date basis is platform establishment disclosure. BCI's renewable-resources article states Ag Partners Capital was established in 2021 by BCI alongside farmland investors and operators.
- Caddo Sustainable Timberlands LP: date basis is investment/platform creation. BCI announced on February 14, 2022 that BCI and BTG Pactual Timberland Investment Group created Caddo Sustainable Timberlands LP.
- Cleco Corporation: date basis is close date. Cleco announced on April 13, 2016 that the North American investor group led by Macquarie Infrastructure and Real Assets and BCI completed the acquisition.
- Corix Infrastructure: date basis is historical BCI acquisition / owner-entry disclosure already present in the database. No evidence found in this segment supported replacing the stored 2006 year with the later 2012 Corix Utilities transaction.
- GCT Global Container Terminals Inc.: date basis is announcement fallback. Ontario Teachers announced on June 7, 2018 that IFM and BCI entered into a transaction to join Teachers as equity partners, with BCI acquiring 25%; no separate close notice was identified in this segment.
- InTransit BC: date basis is financial-close / concession close evidence already labeled in the data for both BCI and CDPQ; no change was needed.
- Monterey Mushrooms: date basis is 2025 transaction / regulatory disclosure fallback. Public materials support BCI and Paine Schwartz joint control in 2025, but no separate close notice was identified in this segment.
- Mosaic Forest Management: date basis is platform launch. Public evidence supports the 2018 launch of Mosaic as a timberland company involving BCI/PSP/AIMCo-affiliated ownership interests.
- Nexus Water Group: date basis is close date. Public close evidence supports the April 1, 2024 Nexus transaction for BCI and J.P. Morgan Asset Management.
- Northview Energy: date basis is announcement fallback. Brookfield's March 3, 2026 release announced the BCI, Norges Bank Investment Management, and Brookfield platform launch but also stated the official launch was subject to required approvals and customary closing conditions.
- Teays River Investments: date basis is BCI investment disclosure. BCI publicly described increasing its investment with Teays River in 2021.

### Unresolved

- Connaught Oil and Gas — BCI — stored year 2025 — suspected year unknown. Sources reviewed: Energy Voice coverage of Connaught asset sales, Shift Action / The Narwhal 2025 pension-climate reporting, and a BDO court document. These sources identify BCI as an investor or provide company background, but do not disclose BCI's original investment, close, effective, or announcement date. Evidence needed: BCI, Connaught, seller, filing, or court disclosure naming BCI's original investment date in Connaught.
- Corex Resources Ltd. — BCI — stored year 2025 — suspected year unknown. Sources reviewed: Corex company site, Newswire CDPQ disposition release, Shift Action / The Narwhal 2025 pension-climate reporting. The sources identify Corex and prior shareholder activity but do not establish BCI's original investment date. Evidence needed: BCI, Corex, seller, filing, or transaction notice disclosing BCI's owner-entry date.

### Sources

- `https://www.bci.ca/owen-martin-a-global-partnership-approach-in-renewable-resources/`
- `https://www.bci.ca/btg-pactual-timberland-investment-group-and-bci-create-caddo-sustainable-timberlands-lp-with-772000-acres-in-east-texas/`
- `https://www.cleco.com/media/press-releases/detail/2014/10/20/cleco-enters-agreement-to-be-acquired-by-north-american-investor-group-led-by-macquarie-infrastructure-and-real-assets-and-british-columbia-investment-management-corporation`
- `https://www.cleco.com/media/press-releases/detail/2016/04/13/north-american-led-investor-group-completes-acquisition-of-cleco`
- `https://www.otpp.com/en-ca/about-us/news-and-insights/2018/ifm-investors-and-bci-to-join-ontario-teachers-as-equity-partners-in-gct-global-container-terminals-inc-/`
- `https://bep.brookfield.com/press-releases/bep/bci-norges-bank-investment-management-and-brookfield-partner-launch-northview`
- `https://www.energyvoice.com/markets/energy-finance/564385/canadas-connaught-sells-out-of-uk-gas-field-to-bullish-reabold/`
- `https://thenarwhal.ca/wp-content/uploads/2026/02/Shift-Action-2025-Pension-Climate-Report-Card.pdf`
- `https://www.shiftaction.ca/s/Shift-2025-Canadian-Pension-Climate-Report-Card-Summary.pdf`
- `https://www.bdo.ca/getmedia/c62f2d6e-61f0-4295-be46-9075326a9562/Application-for-Limited-Discharge-Nov-27-2020118164121-1.pdf`
- `https://corexresources.ca/`
- `https://www.newswire.ca/news-releases/corex-resources-ltd-announces-disposition-by-cdpq-of-corex-share-position-800716220.html`

## Post-BCI Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T04:08:03.259Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count did not change. BCI edits tightened source labels and same-year investment milestone categories while preserving stored owner/top-level years; Connaught Oil and Gas and Corex Resources remain unchanged due to missing owner-entry evidence.

## Bernhard Capital Partners / CleanCapital Adjacent Cluster

### Reviewed Companies / Owners

- ClearCurrent — Bernhard Capital Partners — stored year 2021 — unchanged.
- Delta Utilities — Bernhard Capital Partners — stored year 2025 — unchanged.
- Elevation — Bernhard Capital Partners — stored year 2022 — unchanged; date-basis uncertainty documented.
- Green Meadow Sustainable Solutions — Bernhard Capital Partners — stored year 2020 — unchanged.
- National Water Infrastructure — Bernhard Capital Partners — stored year 2020 — unchanged.
- New Mexico Gas Company — Bernhard Capital Partners — stored year 2024 — unchanged; announcement fallback because BCP still lists the deal as pending regulatory approval.
- CleanCapital Holdings, LLC — Manulife — stored/top-level year 2021 — unchanged.
- CleanCapital Holdings, LLC — BlackRock — corrected from 2018 to 2019.

### Implemented Changes

- ClearCurrent: kept the 2021 owner/top-level year, changed the same-year owner-entry milestone from `Other` to `Financing`, and labeled Bernhard Capital's portfolio page as `Investment date source — Bernhard Capital Partners — ClearCurrent`.
- Elevation: kept the 2022 owner/top-level year, corrected the Series B milestone to March 23, 2022, corrected the Bernhard follow-on convertible-note milestone to September 25, 2023, and labeled Elevation's Series B close release as close-date evidence.
- Green Meadow Sustainable Solutions: kept the 2020 owner/top-level year, changed the same-year BCP investment milestone to `Financing`, and labeled Bernhard Capital's portfolio page as investment-date evidence.
- National Water Infrastructure: kept the 2020 owner/top-level year, changed the same-year BCP investment milestone to `Financing`, and labeled Bernhard Capital's portfolio page as investment-date evidence.
- New Mexico Gas Company: kept 2024 as announcement fallback, changed the August 5, 2024 sale-agreement milestone to `Acquisition`, and labeled Bernhard Capital's Emera sale announcement as owner-specific announcement-date evidence. Bernhard's own portfolio page still describes the investment date as pending regulatory approval and status as announced/not closed.
- CleanCapital Holdings, LLC: changed BlackRock's owner `investmentYear` from 2018 to 2019 because CleanCapital's April 2, 2019 release is the first clear firm-level BlackRock investment evidence. The 2018 BlackRock relationship was preserved as historical asset-acquisition partnership context and no longer drives the owner year. The top-level `investmentYear` remained 2021 because Manulife is the primary displayed owner. Added separate investment-date source labels for Manulife and BlackRock.

### High-Conviction Confirmations

- ClearCurrent: date basis is investment-date disclosure from Bernhard Capital's portfolio page, which lists investment date 2021.
- Delta Utilities: date basis is close date. Bernhard Capital's April 1, 2025 release states BCP-backed Delta Utilities completed the CenterPoint gas-utility acquisition; the July 1, 2025 Entergy acquisition is a later expansion and does not reset the original owner-entry year.
- Green Meadow Sustainable Solutions: date basis is investment-date disclosure from Bernhard Capital's portfolio page, which lists investment date 2020.
- National Water Infrastructure: date basis is investment-date disclosure from Bernhard Capital's portfolio page, which lists investment date 2020.
- New Mexico Gas Company: date basis is announcement fallback. Emera and Bernhard announced the sale agreement on August 5, 2024, while New Mexico Gas Company's public page states the sale requires regulatory approval and Bernhard's portfolio page lists the status as announced/not closed.
- CleanCapital / Manulife: date basis is investment announcement. CleanCapital's April 20, 2021 release announced a corporate investment from Manulife Investment Management and a $300 million commitment.
- CleanCapital / BlackRock: date basis is investment announcement. CleanCapital's April 2, 2019 release announced a new investment in the firm from BlackRock Renewable Power Group funds; the November 2018 BlackRock relationship was an asset-acquisition partnership involving a 46.9 MW solar portfolio, not the owner-entry date for CleanCapital Holdings, LLC.

### Unresolved

- Elevation — Bernhard Capital Partners — stored year 2022 — suspected possible year 2021. Sources reviewed: Elevation's March 23, 2022 Series B close release, Bernhard Capital's Elevation portfolio page, and Elevation's September 25, 2023 convertible-note release. The company release clearly states the March 2022 Series B close was led by Bernhard Capital and the 2023 release describes prior Bernhard investments in March 2022 and March 2023; Bernhard's portfolio page lists investment date 2021 but does not identify an event or close date. Because public evidence conflicts, the owner/top-level year was left unchanged. Evidence needed: Bernhard or Elevation disclosure explaining the 2021 investment date or identifying a Bernhard-led 2021 financing/close.

### Sources

- `https://www.bernhardcapital.com/portfolio-items/clearcurrent/`
- `https://www.bernhardcapital.com/bcp-backed-delta-utilities-completes-acquisition-of-centerpoint-energys-natural-gas-distribution-businesses-in-louisiana-and-mississippi/`
- `https://www.bernhardcapital.com/bcp-backed-delta-utilities-completes-acquisition-of-entergys-natural-gas-distribution-businesses-in-new-orleans-and-east-baton-rouge-parish/`
- `https://poweredbyelevation.com/post/elevation-secures-series-b-investment-to-bring-clean-energy-to-renters/`
- `https://www.bernhardcapital.com/portfolio-items/elevation/`
- `https://www.prnewswire.com/news-releases/elevation-announces-20-million-convertible-note-investment-from-bernhard-capital-partners-301937424.html`
- `https://www.bernhardcapital.com/portfolio-items/green-meadow-sustainable-solutions/`
- `https://www.bernhardcapital.com/portfolio-items/national-water-infrastructure/`
- `https://www.bernhardcapital.com/portfolio-items/new-mexico-gas-company/`
- `https://www.bernhardcapital.com/emera-announces-sale-of-new-mexico-gas-company-to-bcp/`
- `https://www.nmgco.com/en/bcp_purchase`
- `https://cleancapital.com/resources/cleancapital-and-blackrock-announce-new-partnership-to-drive-capital-into-distributed-clean-energy-markets/`
- `https://cleancapital.com/resources/cleancapital-announces-new-investment-from-blackrocks-renewable-power-group/`
- `https://cleancapital.com/resources/cleancapital-secures-300-million-commitment-from-manulife-investment-management-acquires-63-megawatts-of-operating-solar-projects/`

## Post-Bernhard / CleanCapital Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T04:12:43.652Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count returned to the carry-forward 20. CleanCapital shifted one owner row from 2018 to 2019; the displayed/top-level 2021 year remains aligned with primary owner Manulife.

## BlackRock Cluster

### Reviewed Companies / Owners

- Conexon — BlackRock — stored year 2023 — unchanged.
- DSD Renewables — BlackRock — stored/top-level year 2019 — unchanged.
- DSD Renewables — Ares Management — stored year 2022 — unchanged; adjacent co-owner confirmation carried from the Ares review.
- Electrada — BlackRock — stored year 2021 — unchanged.
- Environmental 360 Solutions — BlackRock — stored year 2023 — unchanged.
- Excelsior U.S. Solar & Storage Portfolio — BlackRock — stored year 2024 — unchanged.
- Gigapower — BlackRock — stored year 2023 — unchanged.
- Harquahala Generation Company — BlackRock — stored year 2024 — unchanged.
- Indian Energy — BlackRock — stored year 2023 — unchanged.
- Jupiter Power — BlackRock — stored year 2022 — unchanged.
- Lighthouse — BlackRock — stored year 2023 — unchanged.
- National Renewable Solutions — BlackRock — stored year 2021 — unchanged.
- Portland Natural Gas Transmission System — BlackRock — stored/top-level year 2024 — unchanged.
- Portland Natural Gas Transmission System — MSIP — stored year 2024 — unchanged; adjacent co-owner confirmation.
- Recurrent Energy — BlackRock — stored year 2024 — unchanged.
- STRATOS — BlackRock — stored year 2023 — unchanged.
- Vopak Industrial Infrastructure Americas — BlackRock — stored year 2020 — unchanged.

### Implemented Changes

- Conexon: added BlackRock Impact Opportunities and TAP Advisors as owner-specific BlackRock investment-date / announcement evidence for the December 2023 investment disclosure.
- DSD Renewables: changed the 2019 BlackRock owner-entry milestones from generic `Other` to `Financing` and labeled DSD's history page as `Investment date source — BlackRock — DSD Renewables`.
- Electrada: labeled the company source that references BlackRock leading the 2021 Series B as `Investment date source — BlackRock — Electrada`.
- Environmental 360 Solutions: corrected the BlackRock close milestone from February 1, 2023 to February 16, 2023 and labeled the company closing release as close-date evidence.
- Excelsior U.S. Solar & Storage Portfolio: changed the March 12, 2024 sale milestone to `Acquisition` and labeled Excelsior's sale release as BlackRock investment-date evidence.
- Jupiter Power: corrected the unsupported May 10, 2022 milestone to the November 15, 2022 EnCap sale agreement announcement, changed it to `Acquisition`, and labeled it as BlackRock announcement-date evidence. No clean close notice was identified in this segment.
- Lighthouse: labeled BlackRock's November 15, 2023 definitive-documentation release as announcement-date evidence.
- National Renewable Solutions: corrected the BlackRock acquisition milestone from July 6, 2021 to August 18, 2021, changed it to `Acquisition`, and labeled the NRS PDF as BlackRock investment-date evidence.
- Portland Natural Gas Transmission System: replaced the generic August 2024 completion milestone with the August 15, 2024 TC Energy close date, added `MSIP` to owner-entry milestone wording for audit attribution, and added separate close-date source labels for BlackRock and MSIP. Morgan Stanley's portfolio page was also labeled as MSIP investment-date evidence.
- Recurrent Energy: changed the January 8, 2024 commitment and October 3, 2024 final closing milestones to `Financing` and labeled Recurrent's close release as BlackRock close-date evidence.
- STRATOS: corrected the BlackRock / Occidental joint-venture milestone from August 15, 2023 to November 7, 2023 and labeled the 1PointFive release as BlackRock announcement-date evidence.
- Vopak Industrial Infrastructure Americas: labeled the September 2020 Vopak / BlackRock announcement source as BlackRock announcement-date evidence while preserving the December 2, 2020 close source.

### High-Conviction Confirmations

- Conexon: date basis is announcement/investment disclosure. TAP Advisors lists the Conexon investment from BlackRock-managed funds in December 2023; BlackRock Impact Opportunities also identifies Conexon as a strategy-in-action portfolio company.
- DSD Renewables: date basis is investment/platform launch disclosure. DSD history states a 2019 partnership with BlackRock Real Assets in which BlackRock became majority investor; BlackRock's 2020 remaining-interest purchase is a follow-on and does not reset the owner year.
- Electrada: date basis is company disclosure. Electrada's 2023 article states the 2023 funding was BlackRock's second tranche and that BlackRock led Electrada's $20 million Series B in 2021.
- Environmental 360 Solutions: date basis is close date. E360S announced on February 16, 2023 that BlackRock Alternatives closed acquisition of a majority interest.
- Excelsior U.S. Solar & Storage Portfolio: date basis is acquisition/investment disclosure. Excelsior announced on March 12, 2024 that it sold the 38-project solar and solar-plus-storage portfolio to BlackRock's Evergreen Infrastructure fund.
- Gigapower: date basis is close date. AT&T announced on May 11, 2023 that AT&T and BlackRock closed the Gigapower joint venture.
- Harquahala Generation Company: date basis is close date. Capital Power announced on February 16, 2024 that a 50/50 partnership with a BlackRock Diversified Infrastructure affiliate closed the Harquahala acquisition.
- Indian Energy: date basis is BlackRock portfolio disclosure. BlackRock Impact Opportunities identifies Indian Energy as a 2023 portfolio investment; no more precise close notice was identified in this segment.
- Jupiter Power: date basis is announcement fallback. EnCap announced on November 15, 2022 that BlackRock agreed to acquire Jupiter and expected the transaction to close in late 2022; no primary close release was identified.
- Lighthouse: date basis is announcement fallback. BlackRock announced on November 15, 2023 that Evergreen Infrastructure had signed definitive documentation to acquire Lighthouse subject to closing conditions.
- National Renewable Solutions: date basis is acquisition/investment disclosure. NRS announced on August 18, 2021 that BlackRock had acquired 100% of the company.
- Portland Natural Gas Transmission System: date basis is close date. TC Energy announced the successful completion of the sale on August 15, 2024, and the March announcement identified BlackRock and MSIP as buyers.
- Recurrent Energy: date basis is final close date. Recurrent Energy announced on October 3, 2024 that BlackRock's $500 million investment had reached final closing and represented 20% of fully diluted shares.
- STRATOS: date basis is announcement fallback. 1PointFive / Occidental announced on November 7, 2023 that BlackRock signed a definitive agreement to form the STRATOS joint venture; no separate close notice was identified in this segment.
- Vopak Industrial Infrastructure Americas: date basis is close date. Vopak announced on December 2, 2020 that Vopak and BlackRock's GEPIF successfully completed the acquisition of three Dow terminals.

### Unresolved

- None in this BlackRock segment. Where close evidence was not publicly available for Jupiter Power, Lighthouse, and STRATOS, announcement fallback remained sufficient to support the stored year.

### Sources

- `https://www.tapadvisors.com/selected-tap-advisors-transactions`
- `https://www.blackrock.com/us/individual/investment-ideas/alternative-investments/blackrock-impact-opportunities`
- `https://dsdrenewables.com/overview/the-history-of-dsd/`
- `https://electrada.com/news/blackrock-ev-charging-expansion/`
- `https://e360s.ca/our-media/environmental-360-solutions-inc-announces-closing-of-acquisition-by-blackrock-alternatives/`
- `https://excelsiorcapital.com/news-insights/excelsior-energy-capital-sells-sub-portfolio-of-solar-and-solar-plus-storage-assets-to-blackrock/`
- `https://about.att.com/story/2023/gigapower.html`
- `https://www.capitalpower.com/media/media_releases/capital-power-completes-acquisition-of-the-1092-mw-harquahala-natural-gas-generation-facility-in-arizona/`
- `https://www.jupiterpower.io/post/encap-investments-sells-jupiter-power-to-blackrock`
- `https://www.businesswire.com/news/home/20231115151975/en/BlackRocks-Evergreen-Infrastructure-Fund-Partners-with-European-Institutional-Investors-to-Invest-in-Energy-Transition-and-Energy-Security`
- `https://natrs.com/wp-content/uploads/2022/04/BlackRockAcquiresNRS_PressRelease_Final.pdf`
- `https://www.tcenergy.com/announcements/2024/2024-03-04-tc-energy-announces-sale-of-portland-natural-gas-transmission-system/`
- `https://www.tcenergy.com/announcements/2024/2024-08-15-tc-energy-completes-the-sale-of-portland-natural-gas-transmission-system/`
- `https://www.morganstanley.com/im/en-ie/intermediary-investor/companies/portland-natural-gas-transmission-system.html`
- `https://recurrentenergy.com/recurrent-energy-announces-closing-of-500-million-investment-from-blackrock/`
- `https://www.1pointfive.com/news/occidental-and-blackrock-form-joint-venture-to-develop-stratos`
- `https://www.vopak.com/newsroom/news/vopak-and-blackrocks-gepif-successfully-completed-acquisition-three-industrial`

## Post-BlackRock Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T04:16:45.708Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. BlackRock edits corrected source labels, same-year milestone categories, and date precision without changing BlackRock top-level years in this cluster.

## Blackstone Cluster — Sub-Cluster 1

### Reviewed Companies / Owners

- Accel International — Blackstone — stored year 2025 — unchanged; unresolved date support.
- Advanced Cooling Technologies (ACT) — Blackstone — stored/top-level year 2026 — unchanged.
- Alliance Technical Group — Blackstone — stored/top-level year 2026 — unchanged.
- Arlington Industries — Blackstone — stored/top-level year 2026 — unchanged.
- Atlantic Power Transmission LLC — Blackstone — stored/top-level year 2021 — unchanged.
- Aypa Power — Blackstone — stored/top-level year 2020 — unchanged.
- Cheniere Energy Partners, L.P. — Blackstone — stored/top-level year 2020 — unchanged.

### Implemented Changes

- Advanced Cooling Technologies (ACT): changed the March 11, 2026 Blackstone majority-stake agreement milestone from `Other` to `Acquisition` and labeled Blackstone's release as `Announcement date source — Blackstone — Advanced Cooling Technologies (ACT)`.
- Alliance Technical Group: kept the January 6, 2026 owner/top-level year and relabeled Blackstone's release from generic investment evidence to `Close date source — Blackstone — Alliance Technical Group` because the release states Blackstone had acquired ATG.
- Arlington Industries: changed the January 26, 2026 Blackstone definitive-agreement milestone from `Other` to `Acquisition` and labeled Blackstone's release as `Announcement date source — Blackstone — Arlington Industries`.
- Atlantic Power Transmission LLC: added a same-year 2021 `Financing` milestone for Blackstone Infrastructure helping launch APT, relabeled the April 27, 2022 Blackstone release as owner-entry evidence, changed the December 1, 2021 bid milestone back to an operating announcement, and corrected the workforce-commitment milestone date to April 27, 2022.
- Aypa Power: changed the Blackstone owner-entry milestone from generic 2020 wording to the March 4, 2020 completed acquisition of NRStor C&I, changed the category to `Acquisition`, and added Blackstone close-date evidence plus the Aypa relaunch source connecting NRStor C&I to Aypa Power.

### High-Conviction Confirmations

- Advanced Cooling Technologies (ACT): date basis is announcement fallback. Blackstone and ACT announced on March 11, 2026 that Blackstone-managed funds entered a definitive agreement to acquire a majority stake; no public close notice was found in this segment, and the release said closing was expected in Q2 2026.
- Alliance Technical Group: date basis is close date. Blackstone's January 6, 2026 release states Blackstone-affiliated funds had acquired Alliance Technical Group.
- Arlington Industries: date basis is announcement fallback. Blackstone announced on January 26, 2026 that Blackstone Energy Transition Partners-managed funds entered a definitive agreement to acquire Arlington; searches did not identify a public completion notice as of May 3, 2026.
- Atlantic Power Transmission LLC: date basis is launch/investment-date disclosure. Blackstone's April 27, 2022 APT release says Blackstone Infrastructure helped launch Atlantic Power Transmission in 2021; the December 1, 2021 bid release also identifies APT as a Blackstone portfolio company.
- Aypa Power: date basis is close date. Blackstone announced on March 4, 2020 that Blackstone Energy Partners-managed funds completed the acquisition of NRStor C&I; Aypa's August 4, 2020 release states NRStor C&I relaunched as Aypa Power following the Blackstone acquisition.
- Cheniere Energy Partners, L.P.: date basis is close date for the current Blackstone Infrastructure Partners owner row. Blackstone announced on September 24, 2020 that BEP closed the sale of its approximately 42% Cheniere Energy Partners stake to Brookfield Infrastructure and Blackstone Infrastructure Partners; BEP's earlier 2012 Cheniere investment does not drive the current owner row.

### Unresolved

- Accel International — Blackstone — stored year 2025 — no change. Sources reviewed include Blackstone Energy Transition Partners portfolio materials and Blackstone people pages that identify Accel as a BEP investment / board role, plus web searches for Accel and Blackstone date evidence. These sources confirm Blackstone involvement but do not disclose a public announcement, signing, close, or original investment date for Accel. Evidence needed: Blackstone, Accel, seller, financing, or filing source disclosing Blackstone's original investment date.

### Sources

- `https://www.blackstone.com/our-businesses/blackstone-energy-transition-partners/`
- `https://www.blackstone.com/the-firm/our-people/`
- `https://www.blackstone.com/people/david-foley/`
- `https://www.blackstone.com/news/press/blackstone-energy-transition-partners-announces-agreement-to-acquire-majority-stake-in-advanced-cooling-technologies/`
- `https://www.accc.gov.au/public-registers/mergers-and-acquisitions-registers/acquisitions-register/blackstone-advanced-cooling-technologies`
- `https://www.blackstone.com/news/press/blackstone-energy-transition-partners-announces-acquisition-of-alliance-technical-group/`
- `https://www.blackstone.com/news/press/blackstone-announces-agreement-to-acquire-arlington-industries/`
- `https://www.blackstone.com/news/press/atlantic-power-transmission-llc-a-blackstone-infrastructure-partners-portfolio-company-announces-bid-for-new-jersey-offshore-wind-transmission-project/`
- `https://www.blackstone.com/news/press/atlantic-power-transmission-llc-a-blackstone-infrastructure-partners-portfolio-company-announces-50-million-commitment-to-new-jersey-workforce-development/`
- `https://www.blackstone.com/news/press/blackstone-acquires-battery-energy-storage-pioneer-nrstor-c-i/`
- `https://www.aypa.com/nrstor-ci-relaunches-as-aypa-power-continues-to-lead-deployment-of-energy-storage-and-hybrid-renewables-across-north-america/`
- `https://www.blackstone.com/news/press/blackstone-energy-partners-closes-sale-of-42-stake-in-cheniere-energy-partners-l-p/`

## Post-Blackstone Sub-Cluster 1 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T12:57:23.419Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. The first Blackstone sub-cluster preserved stored owner/top-level years while tightening source labels, acquisition categories, and APT/Aypa date precision.

## Blackstone Cluster — Sub-Cluster 2

### Reviewed Companies / Owners

- Enverus — Blackstone — stored/top-level year 2025 — unchanged.
- Geosyntec Consultants — Blackstone — stored/top-level year 2022 — unchanged.
- Hill Top Energy Center — Blackstone — stored/top-level year 2025 — unchanged.
- Invenergy — Blackstone — stored/top-level year 2022 — unchanged.
- Kindle Energy — Blackstone — stored/top-level year 2015 — unchanged.
- Kinetik Holdings Inc. — Blackstone — stored/top-level year 2017 — unchanged.

### Implemented Changes

- Enverus: changed the August 6, 2025 Blackstone definitive-agreement milestone from `Other` to `Acquisition` and labeled the source as `Announcement date source — Blackstone — Enverus`.
- Geosyntec Consultants: changed the May 10, 2022 Blackstone majority-investment milestone from `Other` to `Acquisition` because the source describes a majority stake/control investment, and labeled the source as owner-specific announcement-date evidence.
- Invenergy: corrected the January 7, 2022 owner-entry milestone from unsupported close language to announcement / definitive-agreement wording; relabeled the source as `Announcement date source — Blackstone — Invenergy`; and reworded the June 21, 2023 Blackstone capital event as a follow-on investment announcement so it remains historical context and does not imply a reset of Blackstone's original owner-entry year.
- Kinetik Holdings Inc.: added a June 2017 close milestone for Blackstone's acquisition of EagleClaw Midstream Ventures, Kinetik's predecessor platform, and added Kinetik/EagleClaw close-date evidence. The April 17, 2017 Blackstone announcement remains as earlier signing evidence.

### High-Conviction Confirmations

- Enverus: date basis is announcement fallback. Blackstone announced on August 6, 2025 that Blackstone-affiliated private equity funds entered a definitive agreement to acquire Enverus from Hellman & Friedman and Genstar; searches did not identify a public close notice as of May 3, 2026.
- Geosyntec Consultants: date basis is announcement fallback. Blackstone and Geosyntec announced on May 10, 2022 that Blackstone Energy Partners agreed to make a majority investment; no separate close notice was identified in this segment.
- Hill Top Energy Center: date basis is announcement fallback. Blackstone announced on September 15, 2025 that Blackstone Energy Transition Partners-affiliated funds entered a definitive agreement to acquire Hill Top from Ardian; no public close source was identified in this segment.
- Invenergy: date basis is announcement fallback for Blackstone Infrastructure Partners' original owner row. Blackstone/Invenergy announced a definitive agreement for the approximately $3 billion equity investment on January 7, 2022; later 2023 sources describe a $1 billion follow-on investment and explicitly build on Blackstone's initial nearly $3 billion investment in 2021 and 2022, so the later event does not reset the owner-entry year.
- Kindle Energy: date basis is investment/founding disclosure. Kindle's Ohio legislative testimony states that Kindle Energy was founded in 2015 as a Blackstone portfolio company.
- Kinetik Holdings Inc.: date basis is close date for the predecessor platform. Blackstone announced the EagleClaw acquisition agreement on April 17, 2017, and EagleClaw/Kinetik's November 2, 2018 release references the closing of Blackstone's EagleClaw acquisition in June 2017.

### Unresolved

- None in this sub-cluster. Enverus, Geosyntec, Hill Top, and Invenergy remain announcement-fallback rows where no public close evidence was identified, but the stored year is supported by clear public transaction announcements.

### Sources

- `https://www.blackstone.com/news/press/blackstone-announces-agreement-to-acquire-enverus/`
- `https://www.blackstone.com/news/press/blackstone-energy-partners-announces-majority-investment-in-geosyntec-leading-global-provider-of-environmental-engineering-design-and-consulting-services/`
- `https://geosyntec.com/news/item/7811-geosyntec-grows-client-service-capabilities-with-major-investment-from-blackstone-energy-partners`
- `https://www.blackstone.com/news/press/blackstone-announces-agreement-to-acquire-hill-top-energy-center-in-western-pennsylvania-for-nearly-1-billion/`
- `https://www.ardian.com/news-insights/press-releases/ardian-announces-sale-hill-top-energy-center-blackstone`
- `https://www.blackstone.com/news/press/invenergy-announces-approximately-3-billion-investment-from-blackstone-infrastructure-partners-to-accelerate-renewable-development-activities/`
- `https://invenergy.com/news/invenergy-announces-approximately-3-billion-investment-from-blackstone-infrastructure-partners-to-accelerate-renewable-development-activities`
- `https://invenergy.com/news/invenergy-announces-1-billion-follow-on-investment-from-blackstone-infrastructure-partners`
- `https://search-prod.lis.state.oh.us/api/v2/general_assembly_136/committees/cmte_h_energy_1/meetings/cmte_h_energy_1_2025-03-19-0300_239/testimony/4530/uploaded-doc/`
- `https://www.blackstone.com/news/press/blackstone-energy-partners-to-acquire-eagleclaw-midstream-ventures/`
- `https://ir.kinetik.com/news/news-details/2018/EagleClaw-Midstream-Blackstone-Energy-Partners-and-I-Squared-Capital-Announce-the-Formation-of-a-Leading-Delaware-Basin-Midstream-Partnership-and-the-Concurrent-Acquisitions-of-Caprock-Midstream-and-Pinnacle-Midstream-by-EagleClaw/default.aspx`

## Post-Blackstone Sub-Cluster 2 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T13:01:28.170Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count returned to the carry-forward 20 after rewording Invenergy's 2023 Blackstone follow-on as historical follow-on context rather than owner-entry close evidence. Stored Blackstone owner/top-level years were unchanged.

## Blackstone Cluster — Sub-Cluster 3

### Reviewed Companies / Owners

- Lancium — Blackstone — stored/top-level year 2024 — unchanged.
- Legence — Blackstone — stored/top-level year 2020 — unchanged.
- MacLean Power Systems — Blackstone — stored/top-level year 2026 — unchanged.
- Magnolia Power Generating Station — Blackstone — stored/top-level year 2021 — unchanged.
- Northern Indiana Public Service Company LLC — Blackstone — stored/top-level year 2024 — unchanged.
- Onyx Renewables — Blackstone — stored/top-level year 2014 — unchanged.

### Implemented Changes

- Lancium: kept the 2024 owner/top-level year, changed the same-year Blackstone-backed investment milestone from `Other` to `Financing`, and added a close-date source label based on public reporting that Blackstone recently closed an equity stake in Lancium in 2024. No primary Blackstone or Lancium release was identified in this segment.
- Legence: corrected the description from a 2022 Blackstone acquisition to the 2020 Therma Holdings acquisition and 2022 Legence rebrand; changed the November 2020 announcement and Q4 2020 close milestones to `Acquisition`; relabeled the Blackstone announcement source; added legal-advisor close support for Q4 2020; and corrected the IPO milestone from 2026 to the September 15, 2025 IPO close with category `IPO`.
- Magnolia Power Generating Station: corrected the completion announcement milestone date from February 25, 2026 to February 26, 2026 while preserving 2021 as the Blackstone / Kindle development-start year.
- Onyx Renewables: refined the same-year Blackstone formation milestone from generic 2014 to October 21, 2014 using Blackstone's formation announcement.

### High-Conviction Confirmations

- Lancium: date basis is public secondary close reporting. Bloomberg, as summarized by Data Center Dynamics, reported on November 21/25, 2024 that Blackstone had recently closed an equity stake in Lancium. Because no primary owner/company announcement was located, the year was left unchanged and the note records secondary-source reliance.
- Legence: date basis is Q4 2020 close support for the predecessor platform. Blackstone announced the Therma acquisition on November 9, 2020 with expected Q4 close; Kirkland later described its representation of Blackstone in the initial Therma acquisition in Q4 2020; Blackstone's 2022 brand article connects Therma to Legence. The IPO was separately corrected to September 15, 2025 using Legence's closing release.
- MacLean Power Systems: date basis is close date. MacLean announced on March 4, 2026 that MacLean Power Systems and Power Grid Components completed the merger and Blackstone-affiliated funds became majority owner of the combined company.
- Magnolia Power Generating Station: date basis is investment/development disclosure. Blackstone's February 26, 2026 completion release says Blackstone, through Kindle Energy, started developing Magnolia Power in 2021; commercial operation in 2026 does not reset the owner-entry year.
- Northern Indiana Public Service Company LLC: date basis is close date. NiSource announced on January 2, 2024 that it completed the issuance/sale of a 19.9% indirect equity interest in NIPSCO to a Blackstone Infrastructure affiliate.
- Onyx Renewables: date basis is formation/investment announcement. Blackstone announced on October 21, 2014 that it created Onyx Renewable Partners, owned by funds managed by Blackstone on behalf of private equity investors.

### Unresolved

- Lancium — Blackstone — stored year 2024 — no primary Blackstone/Lancium close or investment announcement was located in this segment. The stored year remains supported by public Bloomberg/DCD reporting, but stronger evidence would be a Blackstone, Lancium, adviser, or filing source confirming the original Blackstone equity investment date.

### Sources

- `https://www.datacenterdynamics.com/en/news/blackstone-invests-500-million-in-lancium-report/`
- `https://www.bloomberg.com/news/articles/2024-11-21/blackstone-invests-500-million-in-lancium-ai-buildout`
- `https://www.blackstone.com/news/press/blackstone-to-acquire-therma-holdings-llc-a-leading-provider-of-mechanical-electrical-and-energy-efficiency-services/`
- `https://www.kirkland.com/news/press-release/2021/07/kirkland-advises-therma-on-cmta-building-systems`
- `https://www.blackstone.com/insights/article/from-therma-holdings-to-legence/`
- `https://www.wearelegence.com/news/legence-announces-closing-of-initial-public-offering-and-partial-exercise-of-overallotment-option`
- `https://www.macleanpower.com/maclean-power-systems-and-power-grid-components-complete`
- `https://www.blackstone.com/news/press/maclean-power-systems-and-power-grid-components-join-forces-to-form-leading-supplier-of-engineered-components-and-solutions-for-utility-infrastructure/`
- `https://www.businesswire.com/news/home/20260225463871/en/Blackstone-Energy-Transition-Partners-Announces-Completion-of-694MW-Magnolia-Power-Generating-Station-in-Louisiana`
- `https://www.nisource.com/news/article/nisource-inc.-completes-nipsco-minority-equity-interest-transaction`
- `https://www.blackstone.com/news/press/blackstone-teams-with-former-solops-management-team-to-fund-utility-scale-renewables-development-company/`

## Post-Blackstone Sub-Cluster 3 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T13:06:57.809Z
- Result: 1,311 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Stored Blackstone owner/top-level years were unchanged; edits were limited to categories, source labels, Legence historical description/IPO date, and date precision for Magnolia/Onyx.

## Blackstone Cluster — Sub-Cluster 4

### Reviewed Companies / Owners

- Potomac Energy Center — Blackstone — stored/top-level year 2025 — unchanged.
- PPL / Blackstone Power JV — Blackstone — stored/top-level year 2025 — unchanged.
- QTS Data Centers — Blackstone — stored/top-level year 2021 — unchanged.
- Rover Pipeline — Blackstone/Ares — updated current primary owner to Ares Management with 2026 owner/top-level year; retained Blackstone as realized historical owner with 2017 investment year and 2026 exit year.
- Sabre Industries — Blackstone — stored/top-level year 2021 — unchanged.
- Safe Harbor Marinas — Blackstone — stored/top-level year 2025 — unchanged.

### Implemented Changes

- Potomac Energy Center: corrected the Blackstone announcement milestone from January 14, 2025 to January 24, 2025, changed the announcement and August 5, 2025 close milestones to `Acquisition`, and added owner-specific announcement/close source labels.
- PPL / Blackstone Power JV: kept the 2025 owner/top-level year, changed the JV formation milestone to `Financing`, corrected the description to show PPL's 51% / Blackstone Infrastructure's 49% ownership split, removed the stale note that percentages were undisclosed, and labeled the PPL release as Blackstone investment-date evidence.
- QTS Data Centers: changed the 2013 public-listing milestone to `IPO`, changed the June 7, 2021 announcement and August 31, 2021 close milestones to `Acquisition`, and added Blackstone's close-date release.
- Rover Pipeline: changed the active primary owner from Blackstone to Ares Management because Ares acquired Blackstone's 32.4% stake on April 29, 2026. Added Ares as an active 2026 owner row, retained Blackstone as a realized owner row with 2017 investment year and 2026 exit year, updated the top-level investment year to 2026, and added Blackstone/Ares close-date source labels plus a new Ares same-year acquisition milestone.
- Sabre Industries: replaced the generic 2021 Blackstone acquisition milestone with April 13, 2021 announcement and April 2021 close milestones, both `Acquisition`, and added Blackstone announcement, S&P/MarketScreener close, and Blackstone 2026 first-invested source labels.
- Safe Harbor Marinas: corrected the close date from May 1, 2025 to April 30, 2025, changed the announcement and close milestones to `Acquisition`, updated the description, and added Blackstone's close-date release.

### High-Conviction Confirmations

- Potomac Energy Center: date basis is close date. Blackstone announced the acquisition agreement on January 24, 2025, and Houlihan Lokey's transaction page states the sale to Blackstone closed on August 5, 2025.
- PPL / Blackstone Power JV: date basis is announcement/investment disclosure. PPL announced on July 15, 2025 that PPL and Blackstone Infrastructure had formed the JV, with PPL owning 51% and Blackstone Infrastructure owning 49%; no later financial-close source was identified in this segment.
- QTS Data Centers: date basis is close date. Blackstone and QTS announced on August 31, 2021 that Blackstone Infrastructure Partners, BREIT, and Blackstone Property Partners affiliates completed the QTS acquisition.
- Rover Pipeline: date basis is current-owner close date for Ares and historical-owner close date for Blackstone. Energy Transfer announced Blackstone's Rover stake purchase on July 31, 2017 and closed the sale on October 31, 2017. Ares announced on April 29, 2026 that it acquired a 32.4% Rover stake from Blackstone, so Ares is now the current primary owner row while Blackstone is retained as a realized historical owner.
- Sabre Industries: date basis is 2021 close support. Blackstone announced the agreement to acquire Sabre on April 13, 2021; public S&P/MarketScreener transaction data reports completion in April 2021; and Blackstone's 2026 TPG sale announcement says Blackstone first invested in Sabre in 2021.
- Safe Harbor Marinas: date basis is close date. Blackstone announced on April 30, 2025 that Blackstone Infrastructure completed the Safe Harbor acquisition.

### Unresolved

- None in this sub-cluster. Sabre's exact close day remains available only through secondary S&P/MarketScreener transaction data in this segment, but the owner/top-level year is supported by Blackstone's 2021 announcement and 2026 first-invested disclosure.

### Sources

- `https://www.blackstone.com/news/press/blackstone-energy-transition-partners-to-acquire-potomac-energy-center/`
- `https://hl.com/about-us/transactions/potomac-energy-center-blackstone/`
- `https://investors.pplweb.com/2025-07-15-PPL-Corporation-and-Blackstone-Infrastructure-create-joint-venture-to-build-natural-gas-generation-in-Pennsylvania-in-support-of-data-center-development`
- `https://www.blackstone.com/news/press/blackstone-to-invest-more-than-25-billion-in-pennsylvanias-digital-and-energy-infrastructure-plus-catalyze-an-additional-60-billion-investment/`
- `https://www.blackstone.com/news/press/qts-realty-trust-to-be-acquired-by-blackstone-funds-in-10-billion-transaction/`
- `https://www.blackstone.com/news/press/blackstone-funds-complete-acquisition-of-qts-realty-trust/`
- `https://ir.energytransfer.com/news-releases/news-release-details/energy-transfer-announces-sale-3244-stake-entity-rover-pipeline`
- `https://ir.energytransfer.com/news-releases/news-release-details/energy-transfer-announces-closing-previously-announced-sale-3244`
- `https://www.blackstone.com/news/press/ares-acquires-stake-in-rover-pipeline-from-blackstone-energy-transition-partners-to-serve-growing-energy-demand-centers-across-north-america/`
- `https://www.blackstone.com/news/press/blackstone-to-acquire-sabre-industries-inc-a-leading-energy-and-telecom-infrastructure-provider/`
- `https://www.marketscreener.com/quote/stock/BLACKSTONE-INC-60951400/news/Leadership-Team-and-Employees-of-Sabre-and-The-Blackstone-Group-Inc-NYSE-BX-completed-the-acquisi-40661125/`
- `https://www.blackstone.com/news/press/tpg-to-acquire-majority-stake-in-sabre-industries-from-blackstone-energy-transition-partners/`
- `https://www.blackstone.com/news/press/blackstone-infrastructure-to-acquire-safe-harbor-marinas-in-5-65b-transaction/`
- `https://www.blackstone.com/news/press/blackstone-infrastructure-completes-acquisition-of-safe-harbor/`

## Post-Blackstone Sub-Cluster 4 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T13:11:47.269Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: Owner-row count increased by one because Rover Pipeline now has an active Ares owner row and a realized Blackstone historical owner row. The flagged count stayed at the carry-forward 20.

## Blackstone Cluster — Sub-Cluster 5

### Reviewed Companies / Owners

- Shermco Industries — Blackstone — stored/top-level year 2025 — unchanged.
- Transmission Developers Inc. / Champlain Hudson Power Express — Blackstone — stored/top-level year 2010 — unchanged.
- Trystar — Blackstone — stored/top-level year 2024 — unchanged.
- TXNM Energy — Blackstone — stored/top-level year 2025 — unchanged.
- Viridon — Blackstone — stored/top-level year 2023 — unchanged.
- Western LNG — Blackstone — stored/top-level year 2024 — unchanged.
- Westwood Professional Services — Blackstone — stored/top-level year 2024 — unchanged.
- Wolf Summit Energy — Blackstone — stored/top-level year 2025 — unchanged.
- Xpansiv — Blackstone — stored/top-level year 2022 — unchanged.

### Implemented Changes

- Shermco Industries: kept the 2025 owner/top-level year, changed the August 21, 2025 announcement milestone to `Acquisition`, added the October 27, 2025 close milestone, updated the description to reference the October 2025 close, and added Gryphon's close-date source label.
- Trystar: replaced the generic August 2024 Blackstone entry with a July 16, 2024 definitive-agreement milestone and an August 6, 2024 close milestone, both `Acquisition`; preserved the September 2024 Salient bolt-on as historical context; and added owner-specific announcement/close source labels.
- Viridon: added a Blackstone investment-date source label to the company page describing Viridon as sponsored by Blackstone-affiliated funds. No more precise public launch or funding date was identified in this segment.
- Western LNG: changed the December 30, 2024 private-placement milestone to `Financing` and relabeled Latham's transaction note as Blackstone close-date evidence.
- Westwood Professional Services: changed the August 7, 2024 majority-investment milestone to `Acquisition` and relabeled Blackstone's release as the owner-specific announcement-date source.
- Wolf Summit Energy: changed the November 13, 2025 Blackstone investment milestone to `Financing` and relabeled Blackstone's release as the owner-specific investment-date source.
- Xpansiv: relabeled Blackstone's July 6, 2022 release as the owner-specific investment-date source.

### High-Conviction Confirmations

- Shermco Industries: date basis is close date. Gryphon announced on October 27, 2025 that it completed the sale of Shermco to Blackstone, after the August 21, 2025 announcement.
- Transmission Developers Inc. / Champlain Hudson Power Express: date basis is announcement/investment disclosure. Blackstone's February 23, 2010 CHPE announcement identified Blackstone as the lead investor in Transmission Developers. Later CHPE development and construction milestones do not reset the owner-entry year.
- Trystar: date basis is close date. Blackstone announced the Trystar acquisition agreement on July 16, 2024, and Houlihan Lokey states that the transaction closed on August 6, 2024. The later Salient transaction is a bolt-on and does not reset Trystar's Blackstone owner-entry year.
- TXNM Energy: date basis remains 2025 investment/announcement evidence. TXNM announced the Blackstone take-private agreement on May 19, 2025 and later reported that Q2 2025 equity issuance included $400 million issued to Blackstone Infrastructure affiliates; the full acquisition was still expected to close in the second half of 2026, so no 2026 reset was made.
- Viridon: date basis is sponsor/platform disclosure. Viridon public materials state that the platform is sponsored by funds affiliated with Blackstone and the stored launch year remains 2023; no more precise investment date was located.
- Western LNG: date basis is close date. Western LNG announced on January 14, 2025 that it completed the Blackstone-anchored private placement on December 30, 2024, and Latham confirms Blackstone's role in the equity investment.
- Westwood Professional Services: date basis is announcement fallback. Blackstone announced on August 7, 2024 that affiliated funds agreed to make a majority investment in Westwood; no separate close notice was identified in this segment.
- Wolf Summit Energy: date basis is final-investment/investment disclosure. Blackstone announced on November 13, 2025 that it was making a $1.2 billion investment to build Wolf Summit and said the prior week's FID provided financing for the project.
- Xpansiv: date basis is investment announcement. Blackstone announced on July 6, 2022 that funds managed by Blackstone Energy Partners committed $400 million to lead a strategic investment in Xpansiv.

### Unresolved

- Viridon — Blackstone — stored year 2023 — public sources support Blackstone sponsorship and the platform's 2023 launch year, but no primary source was located with an exact launch, commitment, or close date.
- Westwood Professional Services — Blackstone — stored year 2024 — clear Blackstone announcement evidence exists, but no public close source was identified in this segment.

### Sources

- `https://www.gryphon-inv.com/news/gryphon-investors-completes-1-6-billion-sale-of-shermco-to-blackstone/`
- `https://www.reuters.com/legal/transactional/gryphon-sell-shermco-blackstone-about-16-billion-2025-08-21/`
- `https://www.blackstone.com/news/press/alternative-clean-power-transmission-project-announced/`
- `https://www.blackstone.com/news/press/blackstone-to-acquire-trystar-premier-provider-of-backup-power-solutions/`
- `https://hl.com/about-us/transactions/trystar-goldner-hawn-blackstone/`
- `https://www.williamblair.com/News/Blackstone-and-Salient-and-Trystar-Transaction`
- `https://www.txnmenergy.com/investors/acquisition.aspx`
- `https://www.prnewswire.com/news-releases/txnm-energy-reports-second-quarter-2025-results-302519323.html`
- `https://www.reuters.com/legal/transactional/txnm-energy-gets-ferc-approval-115-billion-blackstone-deal-2026-02-20/`
- `https://viridon.com/about`
- `https://www.westernlng.com/news/significant-investment-in-western-lng-funds-ksi-lisims-lng-and-prgt-projects-to-fid`
- `https://www.lw.com/en/news/latham-watkins-advises-blackstone-on-equity-investment-in-western-lng`
- `https://www.blackstone.com/news/press/blackstone-energy-transition-partners-announces-majority-investment-in-westwood-professional-services-inc/`
- `https://www.blackstone.com/news/press/blackstone-energy-transition-partners-announces-1-2-billion-investment-to-build-first-ever-natural-gas-power-generation-facility-in-west-virginia/`
- `https://www.blackstone.com/news/press/blackstone-announces-400-million-investment-in-xpansiv-the-leading-global-carbon-and-environmental-commodities-exchange-platform/`

## Post-Blackstone Sub-Cluster 5 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T13:17:09.374Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Stored Blackstone owner/top-level years were unchanged; edits were limited to source labels, milestone precision, and milestone categories.

## Blackstone Cluster — Sub-Cluster 6 Later Rows

### Reviewed Companies / Owners

- Hotwire Communications — Blackstone realized owner row — stored owner year 2021 and exit year 2025 — unchanged.
- Tallgrass Energy — Blackstone owner row — stored/top-level year 2019 — top-level display corrected from GIC to Blackstone.
- Phoenix Tower International — Blackstone owner row — owner year 2022 — top-level display corrected from Manulife 2018 to Blackstone 2022; realized Manulife row retained with 2018 investment year and 2022 exit year.

### Implemented Changes

- Hotwire Communications: kept Blackstone's 2021 realized owner year and 2025 exit year; removed the stale duplicate August 5, 2021 Blackstone announcement milestone; changed the June 13, 2025 Brookfield agreement to acquire Blackstone's stake and the September 3, 2025 Brookfield control disclosure to `Acquisition` milestones.
- Tallgrass Energy: corrected the top-level displayed `investmentFirm` and `ownershipVehicle` from GIC minority-investor values to Blackstone / Blackstone Infrastructure Partners, preserving the 2019 top-level year; relabeled Blackstone's January 31, 2019 release as the announcement-date source while retaining the March 11, 2019 close-date source.
- Phoenix Tower International: corrected the top-level displayed firm and vehicle from realized Manulife to active Blackstone / Blackstone Infrastructure Partners; updated top-level `investmentYear` from 2018 to 2022; changed the Blackstone milestone to the January 18, 2022 completed purchase of a 35% stake from Manulife; removed the inaccurate July 11, 2022 duplicate milestone; relabeled Blackstone/PTI sources as close-date evidence; added `exitYear: 2022` to Manulife's realized owner row; and reordered owners so active Blackstone is the primary owner row.

### High-Conviction Confirmations

- Hotwire Communications: date basis for Blackstone is announcement fallback. Blackstone announced its investment in Hotwire on April 29, 2021. Hotwire announced on June 13, 2025 that Brookfield had entered a definitive agreement to acquire Blackstone's stake, and Brookfield later disclosed control of Hotwire effective September 3, 2025, supporting the realized Blackstone exit year without changing Blackstone's original owner-entry year.
- Tallgrass Energy: date basis is close date. Blackstone announced the controlling-interest acquisition on January 31, 2019 and announced the close on March 11, 2019. The close release states Blackstone Infrastructure Partners affiliates acquired the general partner and approximately 44% economic interest, with GIC and Enagás as minority investors, so Blackstone is the appropriate primary display owner.
- Phoenix Tower International: date basis is close/current investment disclosure. Blackstone and PTI announced on January 18/20, 2022 that Blackstone Infrastructure Partners funds had purchased a 35% PTI stake from Manulife Investment Management. PTI later stated that Grain and BlackRock joined Blackstone as investors, Wren House described PTI as majority owned by Blackstone-led funds, and current PTI materials list Blackstone among the investor group. This supports Blackstone as the primary current owner row and Manulife as a realized historical owner.

### Unresolved

- None in this sub-cluster. Hotwire has no separate public Blackstone close notice in the reviewed sources, so its Blackstone owner-entry year remains based on the April 29, 2021 investment announcement.

### Sources

- `https://www.blackstone.com/news/press/blackstone-announces-investment-in-hotwire-communications-in-partnership-with-founders/`
- `https://hotwirecommunications.com/in-the-news/hotwire-communications-announces-strategic-investment-by-brookfield-infrastructure-new-york-and-fort-lauderdale`
- `https://bip.brookfield.com/sites/bip-brookfield-ir/files/Brookfield-BIP-IR-V2/2025/Q3/bip-q3-2025-6k.pdf`
- `https://www.blackstone.com/news/press/blackstone-infrastructure-partners-to-acquire-tallgrass-energy/`
- `https://www.blackstone.com/news/press/blackstone-infrastructure-partners-closes-purchase-of-controlling-interest-in-tallgrass-energy/`
- `https://www.blackstone.com/news/press/blackstone-infrastructure-partners-acquires-stake-in-phoenix-tower-international/`
- `https://www.phoenixintnl.com/news/blackstone-infrastructure-partners-acquires-stake-in-phoenix-tower-international`
- `https://www.phoenixintnl.com/news/phoenix-tower-international-announces-investment-from-grain-management-and-blackrock-to-continue-global-expansion-1`
- `https://www.phoenixintnl.com/news/wren-house-invests-in-phoenix-tower-international`
- `https://www.phoenixintnl.com/locations`

## Post-Blackstone Sub-Cluster 6 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T13:22:40.679Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count returned to the carry-forward 20 after reordering Phoenix Tower International's owners so active Blackstone is the primary owner row and realized Manulife remains historical.

## Blue Owl Cluster

### Reviewed Companies / Owners

- Beale Infrastructure — Blue Owl — stored/top-level year 2024 — unchanged.
- Dark Fiber and Infrastructure, LLC — Blue Owl — updated stored/top-level year from 2020 to 2025.
- Gigabit Fiber, LLC — Blue Owl — stored/top-level year 2025 — unchanged.
- RadiusDC — Blue Owl — stored/top-level year 2025 — unchanged.
- South Reach Networks — Blue Owl — stored/top-level year 2025 — unchanged.
- STACK Infrastructure — Blue Owl — stored/top-level year 2025 — unchanged.

### Implemented Changes

- Dark Fiber and Infrastructure, LLC: corrected the active Blue Owl owner/top-level year from IPI Partners' 2020 investment year to Blue Owl's January 6, 2025 entry through the IPI Partners business acquisition; preserved the 2020 IPI majority-investment history; added a same-year Blue Owl acquisition milestone; updated the description; and added owner-specific close-date source labeling.
- Gigabit Fiber, LLC: kept the 2025 Blue Owl owner/top-level year, changed the majority-investment milestone to `Acquisition`, changed the management-retention note to `Other`, and relabeled the Gigabit Fiber release as Blue Owl close-date evidence.
- South Reach Networks: kept the 2025 Blue Owl owner/top-level year and tightened the July 15, 2025 same-year milestone to state that Blue Owl completed the acquisition.

### High-Conviction Confirmations

- Beale Infrastructure: date basis is launch/investment disclosure. Business Wire states that Beale's November 2025 appointments followed the company's 2024 platform launch and identifies Beale as a portfolio company of funds managed by Blue Owl; Blue Owl materials identify Beale as a wholly owned/controlled captive operating company.
- Dark Fiber and Infrastructure, LLC: date basis is close date for the current Blue Owl owner row. DF&I announced a majority investment from IPI Partners on June 16, 2020, but Blue Owl completed its acquisition of IPI Partners' business on January 6, 2025. Because the active owner row is Blue Owl rather than IPI, the owner-entry year was corrected to 2025.
- Gigabit Fiber, LLC: date basis is close date. Gigabit Fiber announced on September 15, 2025 that it had received a majority investment from a fund managed by Blue Owl's Digital Infrastructure strategy, and the release refers to the period following the close of the investment.
- RadiusDC: date basis is close date. Blue Owl completed its acquisition of IPI Partners' business on January 6, 2025, bringing RadiusDC into Blue Owl's digital infrastructure strategy; later RadiusDC acquisitions do not reset Blue Owl's owner-entry year.
- South Reach Networks: date basis is close date. South Reach announced on July 15, 2025 that it had been acquired by a Blue Owl Digital Infrastructure-managed fund and described post-close leadership plans.
- STACK Infrastructure: date basis is close date. Blue Owl completed its acquisition of IPI Partners' business on January 6, 2025, bringing STACK into Blue Owl's digital infrastructure strategy; later project financings and campus announcements do not reset the owner-entry year.

### Unresolved

- Beale Infrastructure — Blue Owl — stored year 2024 — public sources support Blue Owl-backed 2024 platform launch and current Blue Owl portfolio ownership, but no exact launch date or transaction close date was found in this segment.

### Sources

- `https://bealeinfra.com/about/`
- `https://www.businesswire.com/news/home/20251124189221/en/Beale-Infrastructure-Expands-Leadership-Team-and-Accelerates-Buildout-of-North-American-Digital-Infrastructure-Platform`
- `https://wealth.blueowl.com/solutions/investment-strategy-real-assets-digital-infrastructure`
- `https://darkfiberinfra.com/dfi-accounces-strategic-growth-investment/`
- `https://www.prnewswire.com/news-releases/dfi-announces-strategic-growth-investment-in-response-to-growing-demand-for-high-capacity-connectivity-solutions-301077623.html`
- `https://gigabitfiber.com/gigabit-fiber-announces-majority-investment-from-funds-managed-by-blue-owls-digital-infrastructure-strategy/`
- `https://www.blueowl.com/news/blue-owl-capital-completes-acquisition-ipi-partners-business`
- `https://srnetworks.net/south-reach-networks-acquired-by-blue-owl-digital-infrastructure/`

## Post-Blue Owl Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T13:25:43.758Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Year distribution shifted one owner row from 2020 to 2025 because DF&I now reflects Blue Owl's 2025 acquisition of IPI Partners' business rather than IPI's original 2020 majority investment.

## Brookfield Asset Management Cluster — Sub-Cluster 1

### Reviewed Companies / Owners

- 5C Group / Hypertec Cloud — Brookfield Asset Management — stored/top-level year 2025 — unchanged.
- California Bioenergy — Brookfield Asset Management — stored/top-level year 2022 — unchanged.
- Carbon TerraVault — Brookfield Asset Management — stored/top-level year 2022 — unchanged.
- Centersquare — Brookfield Asset Management — stored/top-level year 2024 — unchanged.
- Colonial Enterprises, Inc. — Brookfield Asset Management — stored/top-level year 2025 — unchanged.

### Implemented Changes

- 5C Group / Hypertec Cloud: corrected the Brookfield capital-commitment milestone date from July 24, 2025 to the official July 23, 2025 company announcement, changed the milestone to `Financing`, and added an owner-specific investment-date source label.
- California Bioenergy: changed the December 22, 2022 Brookfield funding partnership milestone to `Financing` and relabeled the American Biogas Council/CalBio release as Brookfield investment-date evidence.
- Carbon TerraVault: corrected the joint-venture milestone from August 31, 2022 to CRC's August 3, 2022 formation announcement, changed the milestone to `Financing`, and added CRC's original Brookfield JV release as owner-specific investment-date evidence.
- Centersquare: kept the January 16, 2024 acquisition milestone and added Data Center Dynamics' completion report as the Brookfield close-date source.
- Colonial Enterprises, Inc.: changed the April 3, 2025 agreement and July 31, 2025 completion milestones to `Acquisition`, relabeled Brookfield's announcement source, and added Brookfield Infrastructure's SEC subsequent-events disclosure as close-date evidence.

### High-Conviction Confirmations

- 5C Group / Hypertec Cloud: date basis is investment/announcement evidence. 5C announced on July 23, 2025 that it had secured $835 million of capital, including equity financing led by Brookfield Asset Management through its Infrastructure Structured Solutions strategy.
- California Bioenergy: date basis is investment/announcement evidence. CalBio announced on December 22, 2022 a funding partnership of up to $500 million with Brookfield Renewable and its institutional partners, pursued through Brookfield Global Transition Fund I.
- Carbon TerraVault: date basis is JV formation/investment announcement. CRC announced on August 3, 2022 the formation of the Brookfield Renewable carbon-management JV, with Brookfield committing an initial $500 million for jointly approved CCS projects through BGTF.
- Centersquare: date basis is close date. Data Center Dynamics reported on January 16, 2024 that Brookfield completed the Cyxtera acquisition and would merge the assets with Evoque; the later Centersquare brand launch is not a new owner-entry event.
- Colonial Enterprises, Inc.: date basis is close date. Brookfield announced the agreement on April 3, 2025, and its Q2 2025 subsequent-events disclosure states that Brookfield Infrastructure and institutional partners completed the Colonial acquisition on July 31, 2025.

### Unresolved

- None in this sub-cluster. 5C, California Bioenergy, and Carbon TerraVault remain announcement/investment-date basis because no later public close date was identified in this segment, but the stored years are directly supported by public investment/JV releases.

### Sources

- `https://5c.ai/news/5c-group-secures-835-million-of-capital-from-brookfield-and-deutsche-bank`
- `https://americanbiogascouncil.org/california-bioenergy-and-brookfield-renewable-form-strategic-partnership-to-develop-renewable-natural-gas-projects/`
- `https://www.crc.com/news-releases/news-release-details/california-resources-corporation-announces-formation-california`
- `https://www.businesswire.com/news/home/20240402208146/en/EVOQUE-CYXTERA-Is-Now-Centersquare`
- `https://www.datacenterdynamics.com/en/news/brookfield-cyxtera-evoque-colocation/`
- `https://bip.brookfield.com/press-releases/bip/brookfield-infrastructure-announces-acquisition-colonial-enterprises`
- `https://www.prnewswire.com/news-releases/shell-completes-sale-of-interest-in-colonial-enterprises-inc-to-brookfield-subsidiary-302518964.html`
- `https://www.sec.gov/Archives/edgar/data/1406234/000162828025038498/R29.htm`

## Post-Brookfield Sub-Cluster 1 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T13:29:50.102Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Stored Brookfield owner/top-level years were unchanged; edits were limited to milestone dates, milestone categories, source labels, and adding close/investment source evidence.

## Brookfield Asset Management Cluster — Sub-Cluster 2

### Reviewed Companies / Owners

- Cove Point LNG, LP — Brookfield Asset Management — stored/top-level year 2019 — unchanged.
- Deriva Energy — Brookfield Asset Management — stored/top-level year 2023 — unchanged.
- Duke Energy Florida — Brookfield Asset Management — stored/top-level year 2026 — unchanged.
- Enercare Inc. — Brookfield Asset Management — stored/top-level year 2018 — unchanged.
- Entropy Inc. — Brookfield Asset Management — stored/top-level year 2022 — unchanged.

### Implemented Changes

- Deriva Energy: changed the June 12, 2023 Brookfield sale announcement milestone to `Acquisition` and relabeled Deriva's October 25, 2023 rebrand/close release as Brookfield close-date evidence.
- Duke Energy Florida: changed the August 5, 2025 Brookfield partnership announcement and March 3, 2026 initial closing milestones to `Financing`, relabeled Duke's announcement source, and replaced the secondary SEC wrapper with Duke's direct SEC filing as Brookfield close-date evidence.
- Enercare Inc.: changed the Brookfield agreement and completion milestones to `Acquisition`, corrected the completion milestone to the October 16, 2018 Brookfield completion announcement date, and added owner-specific announcement/close source labels.
- Entropy Inc.: changed the March 28, 2022 Brookfield investment-agreement milestone to `Financing` and added Entropy's original PDF release as Brookfield investment-date evidence.

### High-Conviction Confirmations

- Cove Point LNG, LP: date basis is close date. Dominion announced on December 20, 2019 that it completed the transfer of a 25% non-controlling Cove Point equity interest to Brookfield Super-Core Infrastructure Partners. The later 2023 Berkshire Hathaway Energy transaction did not change Brookfield's original owner-entry year.
- Deriva Energy: date basis is close date. Deriva stated that Duke Energy's commercial renewables business was acquired by Brookfield in a transaction announced June 12, 2023 and completed October 25, 2023; the rebrand is the same close event, not a reset.
- Duke Energy Florida: date basis is close date. Duke announced the staged Brookfield Super-Core Infrastructure investment on August 5, 2025, and Duke's March 3, 2026 Form 8-K states the first closing was consummated that day for a 9.2% Florida Progress interest.
- Enercare Inc.: date basis is close date. Brookfield announced the Enercare acquisition agreement in August 2018 and announced completion of the plan of arrangement on October 16, 2018.
- Entropy Inc.: date basis is investment agreement / announcement evidence. Entropy announced on March 28, 2022 that Brookfield Renewable would invest through a hybrid security via Brookfield Global Transition Fund I, with committed capital drawn for eligible CCS projects.

### Unresolved

- None in this sub-cluster. Entropy remains announcement/investment-date basis because the reviewed public materials describe a committed hybrid-security investment agreement and drawdown mechanics, not a separate later close date.

### Sources

- `https://investors.dominionenergy.com/news/press-release-details/2019/Dominion-Energy-Completes-Equity-Recapitalization-of-Cove-Point/default.aspx`
- `https://derivaenergy.com/duke-energy-renewables-rebrands-as-deriva-energy-under-brookfield-ownership/`
- `https://investors.duke-energy.com/news/news-details/2025/Duke-Energy-partners-with-Brookfield-to-secure-investment-in-Duke-Energy-Florida-expands-capital-plan-to-87-billion/default.aspx`
- `https://www.sec.gov/Archives/edgar/data/37637/000110465926022610/tm267351d1_8k.htm`
- `https://bip.brookfield.com/press-releases/bip/enercare-inc-be-acquired-brookfield-infrastructure-c43-billion-transaction`
- `https://bip.brookfield.com/press-releases/bip/brookfield-infrastructure-completes-c43-billion-acquisition-enercare-inc`
- `https://assets-global.website-files.com/64e61c8741db7617c22cc2eb/654ac17c04e81fef1340e4ba_2022.03.28-Entropy-Announcement.pdf`

## Post-Brookfield Sub-Cluster 2 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T13:32:31.588Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Stored Brookfield owner/top-level years were unchanged; edits were limited to milestone categories, source labels, one Enercare completion date refinement, and replacing one secondary Duke source with the direct SEC close filing.

## Brookfield Asset Management Cluster — Sub-Cluster 3

### Reviewed Companies / Owners

- Evolugen — Brookfield Asset Management — stored/top-level year 1999 — unchanged.
- GATX / Wells Fargo Rail Joint Venture — Brookfield Asset Management — stored/top-level year 2026 — unchanged.
- Genesee & Wyoming Inc. — Brookfield Asset Management — stored/top-level year 2019 — unchanged.
- Genesee & Wyoming Inc. — GIC owner rows — stored owner years 2019 — unchanged.

### Implemented Changes

- GATX / Wells Fargo Rail Joint Venture: corrected the announcement milestone from September 30, 2025 to May 29, 2025, changed it to `Acquisition`, added Wells Fargo's announcement source, and updated the description/milestone to reflect the final close disclosure of approximately 101,000 railcars and the initial GATX 30% / Brookfield 70% joint-venture ownership split.
- Genesee & Wyoming Inc.: changed the July 1, 2019 announcement and December 30, 2019 completion milestones to `Acquisition`, removed duplicate acquisition milestones, and relabeled the Brookfield, G&W, and GIC sources as owner-specific announcement/close evidence.

### High-Conviction Confirmations

- Evolugen: date basis remains company-history / investment evidence. Evolugen's history page says Brookfield Renewable's Canadian heritage traces to earlier Brascan hydro operations and that the business was established in Gatineau in 1999 with three Lièvre River facilities. No clearer transaction close date was identified, so the stored 1999 year remains unchanged.
- GATX / Wells Fargo Rail Joint Venture: date basis is close date. Wells Fargo announced the definitive agreement on May 29, 2025; GATX announced on January 5, 2026 that the acquisition successfully closed on January 1, 2026; and GATX's SEC filing confirms the January 1 close, 30% GATX / 70% Brookfield JV ownership, and Brookfield's direct acquisition of the finance lease portfolio.
- Genesee & Wyoming Inc. / Brookfield: date basis is close date. Brookfield and GIC announced the acquisition agreement on July 1, 2019, and G&W announced completion of the sale to affiliates of Brookfield Infrastructure and GIC on December 30, 2019.
- Genesee & Wyoming Inc. / GIC: date basis is close date. GIC's July 1, 2019 release confirms the co-sponsor role in the acquisition agreement, and the same December 30, 2019 G&W close release supports GIC's owner-entry year for both GIC owner rows.

### Unresolved

- Evolugen — Brookfield Asset Management — stored year 1999 — public company history supports the 1999 establishment of the named Canadian renewable business, but no transactional close/source document beyond the history page was located in this segment.

### Sources

- `https://evolugen.com/history/`
- `https://newsroom.wf.com/news-releases/news-details/2025/Wells-Fargo-Enters-into-Agreement-to-Sell-Rail-Equipment-Assets/default.aspx`
- `https://www.businesswire.com/news/home/20260105254734/en/GATX-Corporation-and-Brookfield-Infrastructure-Complete-Acquisition-of-Wells-Fargos-Rail-Assets`
- `https://www.sec.gov/Archives/edgar/data/40211/000004021126000024/gatx-20260101.htm`
- `https://bip.brookfield.com/press-releases/bip/genesee-wyoming-inc-be-acquired-brookfield-infrastructure-and-gic-84-billion`
- `https://media.gwrr.com/press-releases/news-details/2019/Genesee--Wyoming-Announces-Completion-of-Sale-to-Brookfield-Infrastructure-and-GIC/default.aspx`
- `https://www.gic.com.sg/newsroom/news/gic-and-brookfield-infrastructure-to-acquire-genesee-wyoming/`

## Post-Brookfield Sub-Cluster 3 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T13:35:38.453Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Stored owner/top-level years were unchanged; edits were limited to GATX announcement/date and ownership detail, Genesee milestone de-duplication/categories, and source labels.

## Brookfield Asset Management Cluster — Sub-Cluster 4

### Reviewed Companies / Owners

- Geronimo Power — Brookfield Asset Management — stored/top-level year 2025 — unchanged.
- Holtwood and Safe Harbor Hydroelectric Facilities — Brookfield Asset Management — stored/top-level year 2014 — unchanged.
- HomeServe North America — Brookfield Asset Management — stored/top-level year 2023 — unchanged.
- Hotwire Communications — Brookfield Asset Management — stored/top-level year 2025 — unchanged.
- Intel Arizona Joint Venture — Brookfield Asset Management — stored/top-level year 2022 — unchanged.

### Implemented Changes

- Geronimo Power: changed the Brookfield owner-entry milestone from a generic 2025 `Other` entry to a May 30, 2025 `Acquisition` milestone tied to National Grid's completion release; added owner-specific announcement and close-date source labels.
- Holtwood and Safe Harbor Hydroelectric Facilities: corrected the remaining Safe Harbor announcement date from May 7, 2014 to May 15, 2014; changed Safe Harbor and Holtwood purchase-related milestones to `Acquisition`; added owner-specific announcement/close source labels for the Safe Harbor initial interest, remaining Safe Harbor interest, and Holtwood acquisition.
- HomeServe North America: changed the May 19, 2022 Brookfield offer milestone to `Acquisition`, refined the close milestone to January 4, 2023, and added owner-specific announcement/close source labels.
- Intel Arizona Joint Venture: changed the August 23, 2022 Brookfield/Intel definitive-agreement milestone to `Financing`, added a Q4 2022 close milestone from Intel's 2022 Form 10-K, updated the description to reflect the close, and added owner-specific announcement/close source labels.

### High-Conviction Confirmations

- Geronimo Power: date basis is close date. National Grid announced on February 24, 2025 that it agreed to sell National Grid Renewables to Brookfield Asset Management and institutional partners including Brookfield Renewable Partners, then announced completion of the sale on May 30, 2025. The Geronimo Power rebrand was announced the same day after Brookfield's acquisition.
- Holtwood and Safe Harbor Hydroelectric Facilities: date basis remains close date for Brookfield's original entry into the facilities platform. Brookfield Renewable completed the initial 33% Safe Harbor interest acquisition on March 28, 2014, agreed to acquire the remaining Safe Harbor interest on May 15, 2014, and completed that remaining-interest acquisition on August 8, 2014. The later Holtwood/Lake Wallenpaupack agreement on October 8, 2015 and close on April 1, 2016 were follow-on hydro additions and do not reset the original Brookfield investment year for the row.
- HomeServe North America: date basis is close/effective date. HomeServe's scheme-effective announcement states that Brookfield's Bidco agreed the recommended cash offer on May 19, 2022 and that the scheme became effective on January 4, 2023, with all HomeServe share capital then owned by Bidco.
- Hotwire Communications: date basis is close/control disclosure. The row already carries Brookfield's 2025 owner/top-level year, with the June 13, 2025 Brookfield strategic-investment announcement and Brookfield's later September 3, 2025 control disclosure supporting the stored year. No new data changes were needed in this sub-cluster.
- Intel Arizona Joint Venture: date basis is close date by year. Brookfield and Intel announced the definitive agreement on August 23, 2022, and Intel's 2022 Form 10-K states that the Brookfield transaction closed in Q4 2022, forming Arizona Fab LLC with Intel owning 51% and Brookfield owning 49%. No exact close day was identified, but the stored 2022 year is high-conviction.

### Unresolved

- None in this sub-cluster. Intel's exact close day was not public in the reviewed sources, but the Q4 2022 close disclosure is sufficient for the year.

### Sources

- `https://www.nationalgrid.com/media-centre/press-releases/sale-national-grid-renewables`
- `https://www.nationalgrid.com/media-centre/press-releases/completion-of-sale-of-national-grid-renewables`
- `https://geronimopower.com/press-release/national-grid-renewables-to-move-forward-as-geronimo-power/`
- `https://bep.brookfield.com/press-releases/bep/brookfield-renewable-completes-us-hydro-acquisition`
- `https://bep.brookfield.com/press-releases/bep/brookfield-renewable-acquires-remaining-interest-417-mw-safe-harbor`
- `https://www.globenewswire.com/news-release/2014/08/08/1371874/0/en/Brookfield-Renewable-Completes-Safe-Harbor-Acquisition.html`
- `https://bep.brookfield.com/press-releases/bep/brookfield-renewable-acquire-292-mw-hydroelectric-portfolio-pennsylvania`
- `https://www.prnewswire.com/news-releases/talen-energy-completes-sale-of-pennsylvania-hydroelectric-plants-300244898.html`
- `https://www.homeservegroup.com/media/hakp200s/18-05-2022-equity-commitment-letter-bif-iv.pdf`
- `https://www.homeservegroup.com/media/aushw3ru/scheme-of-arrangement-becomes-effective-4-jan-23.pdf`
- `https://hotwirecommunications.com/in-the-news/hotwire-communications-announces-strategic-investment-by-brookfield-infrastructure-new-york-and-fort-lauderdale`
- `https://bip.brookfield.com/sites/bip-brookfield-ir/files/Brookfield-BIP-IR-V2/2025/Q3/bip-q3-2025-6k.pdf`
- `https://bip.brookfield.com/press-releases/bip/brookfield-infrastructure-signs-definitive-agreement-intel`
- `https://www.intc.com/news-events/press-releases/detail/1568/intel-advances-smart-capital-introduces-first-of-its-kind`
- `https://www.sec.gov/Archives/edgar/data/50863/000005086323000006/intc-20221231.htm`

## Post-Brookfield Sub-Cluster 4 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T14:08:56.231Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Stored owner/top-level years were unchanged; edits were limited to milestone dates/categories, Intel's close-year evidence milestone, descriptive close language, and source labels.

## Brookfield Asset Management Cluster — Sub-Cluster 5

### Reviewed Companies / Owners

- Inter Pipeline Ltd. — Brookfield Asset Management — stored/top-level year 2021 — unchanged.
- Luminace — Brookfield Asset Management — stored/top-level year 2021 — unchanged.
- Luminace — Temasek — stored owner year 2025 — unchanged.
- Metergy Solutions — Brookfield Asset Management — stored/top-level year 2018 — unchanged.
- NorthRiver Midstream Inc. — Brookfield Asset Management — stored/top-level year 2019 — changed to 2018.
- Ontario Wind — Brookfield Asset Management — stored/top-level year 2022 — unchanged.
- Origis Energy — Brookfield Asset Management — stored/top-level year 2025 — unchanged.
- Origis Energy — Antin Infrastructure Partners — stored owner year 2021 — unchanged.

### Implemented Changes

- Inter Pipeline Ltd.: corrected the Brookfield increased-offer milestone from June 1, 2021 to June 2, 2021, changed the offer and completion milestones to `Acquisition`, and added owner-specific announcement/close source labels.
- Luminace: refined the EU merger-review milestone to October 23, 2025 and relabeled the Temasek and EU review sources as owner-specific investment/regulatory evidence.
- NorthRiver Midstream Inc.: corrected the Brookfield owner-entry and top-level investment year from 2019 to 2018, based on the October 1, 2018 close of the provincially regulated portion of Enbridge's Canadian gas gathering and processing business; added aligned 2018 announcement and close milestones plus owner-specific source labels, while preserving the December 31, 2019 final federal close and platform naming history.
- Ontario Wind: changed the November 2022 Brookfield investment milestone to `Acquisition` and relabeled the Brookfield Infrastructure Income Fund annual report as investment-date evidence.
- Origis Energy: changed the Brookfield strategic investment milestone to `Financing`, aligned Antin's 2021 majority-stake history as `Acquisition`, and relabeled Brookfield/Antin source evidence by owner.

### High-Conviction Confirmations

- Inter Pipeline Ltd.: date basis is close date. Brookfield Infrastructure announced completion of its strategic acquisition of Inter Pipeline on October 28, 2021, supporting the stored 2021 owner/top-level year.
- Luminace / Brookfield: date basis remains 2021 platform formation/investment evidence. Luminace's July 21, 2021 brand-launch release identified the business as a Brookfield Renewable company formed through Brookfield-sponsored distributed-generation businesses.
- Luminace / Temasek: date basis remains 2025 investment/regulatory evidence. Temasek materials discuss the Luminace transaction in 2025, and European Commission materials dated October 23, 2025 identify Brookfield and Temasek as acquiring joint control. No exact public close date was identified.
- Metergy Solutions: date basis is close date. Brookfield Infrastructure completed the Enercare acquisition on October 16, 2018, including the submetering platform later branded Metergy Solutions.
- NorthRiver Midstream Inc.: date basis is the original close into the named business predecessor. Brookfield announced the Enbridge western Canadian midstream acquisition on July 4, 2018 and closed the provincially regulated portion on October 1, 2018; the December 31, 2019 federally regulated portion and NorthRiver naming did not reset Brookfield's original owner-entry year.
- Ontario Wind: date basis is fund investment/acquisition reporting. Brookfield Infrastructure Income Fund materials identify the Ontario Wind private renewable-power investment as acquired in November 2022.
- Origis Energy / Brookfield: date basis is investment announcement. Origis announced on January 15, 2025 that Brookfield and Antin were making a strategic investment of more than $1 billion, welcoming Brookfield as a new significant investor.
- Origis Energy / Antin: date basis remains 2021 announcement/history evidence. Antin announced a definitive agreement to become majority shareholder on October 18, 2021, and Origis history materials identify Antin as majority shareholder with a multi-billion-dollar capital injection in 2021. No separate public close date was identified.

### Unresolved

- Luminace — Temasek — stored year 2025 — exact close day not found; 2025 joint-control/investment evidence supports the year.
- Ontario Wind — Brookfield Asset Management — stored year 2022 — Brookfield fund materials identify a November 2022 acquisition, but no underlying asset transaction release was located.
- Origis Energy — Antin Infrastructure Partners — stored year 2021 — no public close date found; announcement/history evidence supports the year.

### Sources

- `https://interpipeline.com/news-releases/brookfield-infrastructure-closes-strategic-acquisition-of-inter-pipeline/`
- `https://bip.brookfield.com/press-releases/bip/brookfield-infrastructure-announces-intention-launch-superior-revised-cash-and`
- `https://www.globenewswire.com/news-release/2021/07/21/2266346/0/en/luminace-a-leading-provider-of-decarbonization-as-a-service-solutions-in-north-america-announces-brand-launch.html`
- `https://www.temasek.com.sg/en/news-and-resources/stories/future/building-for-resilience-a-strategic-approach-to-long-term-growth`
- `https://op.europa.eu/en/publication-detail/-/publication/09fff9b3-b64e-11f0-b37f-01aa75ed71a1/language-en`
- `https://bip.brookfield.com/press-releases/bip/brookfield-infrastructure-completes-c43-billion-acquisition-enercare-inc`
- `https://bip.brookfield.com/press-releases/bip/brookfield-infrastructure-acquire-western-canadian-midstream-business`
- `https://bip.brookfield.com/press-releases/bip/enbridge-and-brookfield-infrastructure-announce-closing-provincially-regulated`
- `https://www.enbridge.com/media-center/news/details?id=123605&lang=en`
- `https://www.nrm.ca/2019/12/31/news-release-3/`
- `https://privatewealth.brookfield.com/sites/default/files/funds/tender-offer-funds/financial-reports/brookfield-infrastructure-income-fund-annual-report.pdf`
- `https://origisenergy.com/insights/origis-energy-secures-1-billion-strategic-investment-from-brookfield-and-antin/`
- `https://origisenergy.com/about-us/our-history/`
- `https://www.antin-ip.com/media/our-news/antin-infrastructure-partners-become-majority-shareholder-origis-energy-leading-us`

## Post-Brookfield Sub-Cluster 5 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T14:14:53.218Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. NorthRiver's owner/top-level year correction from 2019 to 2018 did not add any new audit flags; other edits were limited to milestone dates/categories, source labels, and descriptive date-basis language.

## Brookfield Asset Management Cluster — Sub-Cluster 6

### Reviewed Companies / Owners

- Rockpoint Gas Storage — Brookfield Asset Management — stored/top-level year 2016 — unchanged.
- Scout Clean Energy — Brookfield Asset Management — stored/top-level year 2022 — unchanged.
- Service Experts — Brookfield Asset Management — stored/top-level year 2018 — unchanged.
- SH 130 Concession Company — Brookfield Asset Management — stored/top-level year 2024 — unchanged.
- Smoky Mountain Hydroelectric Facilities — Brookfield Asset Management — stored/top-level year 2012 — unchanged.
- Standard Solar — Brookfield Asset Management — stored/top-level year 2022 — unchanged.
- TerraForm Power — Brookfield Asset Management — stored/top-level year 2017 — unchanged.
- Trans Bay Cable LLC — Brookfield Asset Management — stored/top-level year 2026 — unchanged.
- Urban Grid — Brookfield Asset Management — stored/top-level year 2022 — unchanged.
- Westinghouse Electric Company — Brookfield Asset Management — stored/top-level year 2023 — unchanged.

### Implemented Changes

- Rockpoint Gas Storage: refined Brookfield's acquisition milestone from July 2016 to July 19, 2016 based on Brookfield Infrastructure's SEC-filed interim report, changed the Niska agreement milestone to `Acquisition`, and added an owner-specific close-date source label.
- Smoky Mountain Hydroelectric Facilities: changed the November 15, 2012 former-Alcoa hydro purchase milestone to `Acquisition` and relabeled the LIHI certification-history page as Brookfield close-date evidence.
- Standard Solar: changed the September 29, 2022 milestone to an `Acquisition` close milestone and relabeled Standard Solar's Brookfield release as owner-specific close-date evidence.
- TerraForm Power: changed the March 7, 2017 Brookfield control/sponsorship announcement milestone to `Acquisition`.
- Westinghouse Electric Company: changed the October 11, 2022 Brookfield/Cameco agreement milestone to `Acquisition`, and relabeled the Cameco close and Brookfield announcement sources as owner-specific evidence.

### High-Conviction Confirmations

- Rockpoint Gas Storage: date basis is close date. Brookfield Infrastructure's Q3 2016 interim report states that on July 19, 2016 it acquired an effective 40% interest in Niska Gas Storage through a Brookfield-sponsored partnership; Rockpoint's own materials describe the platform as established in 2016.
- Scout Clean Energy: date basis is close date. Scout announced the Brookfield acquisition agreement on September 29, 2022 and announced finalization of the acquisition from Quinbrook on December 16, 2022.
- Service Experts: date basis is close date. Brookfield Infrastructure completed its acquisition of Enercare on October 16, 2018, including the Service Experts home-services platform.
- SH 130 Concession Company: date basis remains Brookfield fund investment reporting. Brookfield Infrastructure Income Fund holdings materials identify the U.S. Toll Road / SH 130 investment as acquired in December 2024.
- Smoky Mountain Hydroelectric Facilities: date basis is close/sale date. LIHI's certification history states that Alcoa sold the Tapoco Project to Brookfield Smoky Mountain Hydropower LLC on November 15, 2012 and that the project was renamed Smoky Mountain Hydro. The later Brookfield Infrastructure Income Fund March 2023 exposure does not reset Brookfield's original firm-level investment year.
- Standard Solar: date basis is close date. Standard Solar's September 29, 2022 Brookfield release states that Brookfield announced the closing of the Standard Solar acquisition that day.
- TerraForm Power: date basis is close date. Brookfield announced the controlling-stake/sponsorship transaction on March 7, 2017, and TerraForm Power announced the merger and sponsorship transaction closed on October 16, 2017 with Brookfield and institutional partners holding 51%.
- Trans Bay Cable LLC: date basis remains 2026 regulatory approval evidence. CPUC granted authority on February 5, 2026 for California Transmission Company L.P., a Brookfield Corporation subsidiary, to acquire a 50% indirect ownership interest; no separate public close date was identified in this segment.
- Urban Grid: date basis is acquisition announcement / same-day acquisition evidence. Brookfield Renewable announced on January 26, 2022 that it had acquired Urban Grid for $650 million.
- Westinghouse Electric Company: date basis is close date. Cameco announced on November 7, 2023 that the acquisition of Westinghouse in partnership with Brookfield closed that day, with Brookfield owning 51% and Cameco 49%.

### Unresolved

- Trans Bay Cable LLC — Brookfield Asset Management — stored year 2026 — public CPUC materials disclose a July 6, 2025 purchase agreement and February 5, 2026 regulatory approval; a Trans Bay Cable standards-of-conduct disclosure dated February 23, 2026 said the transaction was expected to close in the first half of 2026. No public close date was located, so the row remains unchanged pending clearer closing evidence.
- SH 130 Concession Company — Brookfield Asset Management — stored year 2024 — Brookfield fund holdings identify December 2024 as the acquisition month, but no underlying deal close release was located.

### Sources

- `https://www.sec.gov/Archives/edgar/data/1406234/000119312516762020/d271243dex991.htm`
- `https://www.rockpointgs.com/Home/AboutUs`
- `https://www.scoutcleanenergy.com/news/scout-clean-energy-acquired-by-brookfields`
- `https://www.scoutcleanenergy.com/scout-clean-energy-acquisition-by-brookfield-renewables-finalized/`
- `https://bip.brookfield.com/press-releases/bip/brookfield-infrastructure-completes-c43-billion-acquisition-enercare-inc`
- `https://privatewealth.brookfield.com/sites/default/files/funds/tender-offer-funds/corporate-governance/brookfield-infrastructure-income-fund-holdings-q3.pdf`
- `https://lowimpacthydro.org/lihi-certificate-18-smoky-mountain-project-north-carolina/`
- `https://standardsolar.com/news/brookfield-to-invest-up-to-2-billion-in-scout-clean-energy-and-standard-solar/`
- `https://bn.brookfield.com/press-releases/brookfield-acquire-controlling-stake-and-assume-sponsorship-terraform-power`
- `https://www.terraform.com/news-press/terraform-power-closes-merger-and-sponsorship-transaction/`
- `https://docs.cpuc.ca.gov/PublishedDocs/Published/G000/M598/K254/598254957.PDF`
- `https://www.transbaycable.com/content/dam/tbc/us/en/pdf/2026/Potential_Merger_Partners.pdf`
- `https://bep.brookfield.com/press-releases/bepc/brookfield-renewable-acquires-premier-renewable-developer-urban-grid-adding`
- `https://www.cameco.com/media/news/cameco-and-brookfield-complete-acquisition-of-westinghouse-electric-company`
- `https://bep.brookfield.com/press-releases/bep/cameco-and-brookfield-renewable-form-strategic-partnership-acquire-westinghouse`

## Post-Brookfield Sub-Cluster 6 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T14:18:55.900Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Stored owner/top-level years were unchanged; edits were limited to milestone dates/categories and owner-specific source labels.

## Carlyle Infrastructure Cluster — Sub-Cluster 1

### Reviewed Companies / Owners

- Acadia Renewable Energy — Carlyle Infrastructure — stored/top-level year 2020 — unchanged.
- AlphaStruxure — Carlyle Infrastructure — stored/top-level year 2019 — unchanged.
- Amp Energy — Carlyle Infrastructure — stored/top-level year 2021 — unchanged.
- ARK Data Centers — Carlyle Infrastructure — stored/top-level year 2022 — unchanged.
- Aspen Power — Carlyle Infrastructure — stored/top-level year 2022 — unchanged.
- CAG Holdings / The New Terminal One at JFK — Carlyle Infrastructure — stored/top-level year 2019 — unchanged.
- Cardinal Renewables — Carlyle Infrastructure — stored/top-level year 2020 — unchanged.

### Implemented Changes

- Amp Energy: changed the January 6, 2021 Carlyle commitment milestone to `Financing`, refined the event text to the $374 million strategic growth investment commitment, and relabeled the Carlyle release as owner-specific investment-date evidence.
- ARK Data Centers: changed the December 22, 2021 Carlyle/Involta agreement milestone to `Acquisition` and added Carlyle's announcement release as owner-specific announcement evidence, while retaining the February 1, 2022 close evidence.
- Aspen Power: changed the November 3, 2022 Carlyle investment milestone to `Financing` and relabeled the Carlyle release as owner-specific investment-date evidence.
- CAG Holdings / The New Terminal One at JFK: replaced the November 21, 2019 CAG platform milestone with a September 19, 2019 official Carlyle source identifying CAG Holdings as a Carlyle Global Infrastructure Opportunity Fund portfolio company and dedicated U.S.-based airport infrastructure platform; relabeled the source as owner-specific investment-date evidence.

### High-Conviction Confirmations

- Acadia Renewable Energy: date basis is announcement/signing evidence. Carlyle announced on August 25, 2020 that it had acquired a Maine solar-development portfolio through newly established affiliate Acadia Renewable Energy, with equity capital committed by Carlyle's Renewable & Sustainable Energy Fund.
- AlphaStruxure: date basis is announcement/platform launch evidence. Carlyle and Schneider Electric announced the AlphaStruxure joint venture on April 12, 2019; no separate public close date was identified.
- Amp Energy: date basis is investment announcement. Carlyle announced on January 6, 2021 a $374 million strategic growth investment commitment to Amp Energy, with equity capital from the Global Infrastructure Opportunity Fund and Renewable & Sustainable Energy Fund.
- ARK Data Centers: date basis is close date. Carlyle agreed to acquire Involta on December 22, 2021, and ARK/Involta announced on February 1, 2022 that funds managed by Carlyle had completed the acquisition.
- Aspen Power: date basis is investment announcement. Aspen announced on November 3, 2022 a $350 million investment from funds managed by Carlyle and, separately, Aspen's acquisition of Safari Energy.
- CAG Holdings / The New Terminal One at JFK: date basis is platform/investment evidence. Carlyle's September 19, 2019 release identifies CAG Holdings as a portfolio company of the Carlyle Global Infrastructure Opportunity Fund; later New Terminal One financial close in 2022 did not reset Carlyle's original CAG platform investment year.
- Cardinal Renewables: date basis is Carlyle portfolio acquisition-date evidence. Carlyle's Cardinal Renewables case study lists acquisition date 1/24/2020 and describes the RSEF-backed commitment to partner with Alchemy Renewable Energy.

### Unresolved

- Acadia Renewable Energy — Carlyle Infrastructure — stored year 2020 — no separate public close date located beyond Carlyle's acquisition announcement.
- AlphaStruxure — Carlyle Infrastructure — stored year 2019 — no separate public close date located beyond the joint-venture launch announcement.
- Amp Energy — Carlyle Infrastructure — stored year 2021 — no separate public close date located beyond Carlyle's strategic growth investment commitment.
- CAG Holdings / The New Terminal One at JFK — Carlyle Infrastructure — stored year 2019 — no exact capital-close date found for Carlyle's original CAG platform investment.

### Sources

- `https://www.carlyle.com/media-room/news-release-archive/carlyle-group-partner-bnrg-largest-solar-portfolio-under`
- `https://www.carlyle.com/media-room/news-release-archive/carlyle-group-and-schneider-electric-extend-partnership-develop`
- `https://www.carlyle.com/media-room/news-release-archive/carlyle-makes-commitment-to-amp-energy`
- `https://www.carlyle.com/media-room/news-release-archive/carlyle-acquire-expand-data-center-company-involta`
- `https://www.arkdna.com/about/news/carlyle-s-acquisition-of-hybrid-cloud-data-center-provider-ark-closes/`
- `https://www.carlyle.com/media-room/news-release-archive/aspen-power-partners-announces-350-million-investment-from-carlyle-to-fuel-growth-and-acquisition-strategy`
- `https://www.carlyle.com/media-room/news-release-archive/dr-gerrard-p-bushell-named-executive-chair-new-terminal-one`
- `https://www.carlyle.com/impact/cardinal-renewables`
- `https://alchemyenergy.com/carlyle-partners-with-alchemy/`

## Post-Carlyle Sub-Cluster 1 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T14:21:57.846Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Stored owner/top-level years were unchanged; edits were limited to milestone categories, CAG's more direct 2019 portfolio-company evidence, and owner-specific source labels.

## Carlyle Infrastructure Cluster — Sub-Cluster 2

### Reviewed Companies / Owners

- Copia Power — Carlyle Infrastructure — stored/top-level year 2021 — unchanged.
- Crescent Midstream — Carlyle Infrastructure — stored/top-level year 2019 — unchanged.
- Fermata Energy — Carlyle Infrastructure — stored/top-level year 2022 — unchanged.
- Tillman Infrastructure — Carlyle Infrastructure — stored/top-level year 2022 — unchanged.
- Wyyerd Fiber — Carlyle Infrastructure — stored/top-level year 2021 — unchanged.
- NineDot Energy — Carlyle Infrastructure — stored owner year 2024 — changed to 2021; top-level and primary Manulife owner year 2024 unchanged.

### Implemented Changes

- Copia Power: refined the same-year Carlyle milestone to March 2021 and relabeled the Copia history page as owner-specific investment-date evidence.
- Crescent Midstream: relabeled the Crimson/Carlyle source as owner-specific investment-date evidence for Carlyle's 2019 strategic equity investment in the predecessor platform.
- Fermata Energy: changed the January 14, 2022 Carlyle-led Series A milestone to `Financing` and replaced the source with Carlyle's investment announcement.
- Tillman Infrastructure: changed the August 10, 2022 Carlyle commitment milestone to `Financing` and relabeled the Carlyle source as owner-specific investment-date evidence.
- Wyyerd Fiber: changed the 2021 Carlyle owner-entry milestone to `Acquisition`, clarified that Carlyle acquired Wyyerd Group, and added owner-specific investment-date evidence.
- NineDot Energy: corrected Carlyle Infrastructure's owner-specific investment year from 2024 to 2021 based on the January 2024 financing release identifying Carlyle's initial investment as December 2021; added an aligned December 2021 Carlyle financing milestone and owner-specific source labels. The primary Manulife row and top-level display remain 2024 because Manulife led and entered through the January 10, 2024 equity financing.

### High-Conviction Confirmations

- Copia Power: date basis is investment/platform-launch evidence. Copia's history states that in March 2021 Carlyle invested in Birch Infrastructure and simultaneously launched Copia Power.
- Crescent Midstream: date basis is investment announcement. Crimson Midstream announced on January 14, 2019 that Carlyle Infrastructure made a strategic equity investment in the predecessor business.
- Fermata Energy: date basis is investment announcement. Carlyle announced on January 14, 2022 complementary growth investments in Fermata Energy and NineDot Energy, supporting the stored 2022 Carlyle owner/top-level year for Fermata.
- Tillman Infrastructure: date basis is investment commitment announcement. Carlyle announced on August 10, 2022 that it committed up to $1 billion to support Tillman Infrastructure's U.S. tower growth.
- Wyyerd Fiber: date basis is 2021 acquisition disclosure. Carlyle's later Involta acquisition release states that Carlyle had acquired Wyyerd Group earlier in 2021; no exact close date was identified.
- NineDot Energy / Carlyle Infrastructure: date basis is initial-investment disclosure. NineDot's January 10, 2024 financing release states that Carlyle committed additional capital following its initial investment from December 2021; this supports changing Carlyle's owner row to 2021.
- NineDot Energy / Manulife: date basis remains 2024 investment announcement. The same January 10, 2024 release states that Manulife Investment Management led the $225 million equity financing with a $135 million commitment and concurrently acquired an equity interest.

### Unresolved

- Copia Power — Carlyle Infrastructure — stored year 2021 — no exact March 2021 investment day found; company history supports the year.
- Wyyerd Fiber — Carlyle Infrastructure — stored year 2021 — no exact 2021 close date found; Carlyle's own later disclosure supports the acquisition year.
- NineDot Energy — Carlyle Infrastructure — corrected owner year 2021 — no exact December 2021 investment day found; NineDot's later financing release supports the month and year.

### Sources

- `https://www.copiapower.com/history`
- `https://www.crimsonmidstream.com/media/the-carlyle-group`
- `https://www.carlyle.com/media-room/news-release-archive/carlyle-commits-over-100-million-battery-storage-electric-vehicle-infrastructure-energy-transition`
- `https://www.carlyle.com/media-room/news-release-archive/carlyle-partners-with-tillman-global-holdings-commits-up-to-1-billion-to-accelerate-investments-in-us-towers`
- `https://www.carlyle.com/media-room/news-release-archive/carlyle-acquire-expand-data-center-company-involta`
- `https://www.businesswire.com/news/home/20240110676731/en/NineDot-Energy-Raises-%24225-Million-in-Equity-Financing-to-Build-and-Operate-Distributed-Battery-Energy-Storage-Projects`

## Post-Carlyle Sub-Cluster 2 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T14:27:38.701Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20 after the NineDot secondary-owner correction. Year distribution shifted one owner row from 2024 to 2021; remaining flags are the documented unresolved carry-forward rows.

## CBRE Investment Management Cluster

### Reviewed Companies / Owners

- Accelerate Infrastructure Opportunities — CBRE Investment Management — stored/top-level year 2022 — unchanged.
- CitySwitch — CBRE Investment Management — stored/top-level year 2021 — unchanged.
- ClearGen Holdings — CBRE Investment Management — stored/top-level year 2025 — unchanged.
- ENGIE Battery Storage Portfolio — CBRE Investment Management — stored/top-level year 2025 — unchanged.
- Forum Mobility — CBRE Investment Management — stored/top-level year 2023 — unchanged.
- Gateway Fiber — CBRE Investment Management — stored/top-level year 2023 — unchanged.
- Vantage Data Centers Stabilized North America Portfolio — CBRE Investment Management / CBRE Caledon — stored/top-level year 2020 — unchanged.
- WANRack — CBRE Investment Management / CBRE Caledon — stored/top-level year 2021 — unchanged.
- Generate Capital — CBRE Investment Management / CBRE Caledon secondary owner row — stored owner year 2021 — unchanged.

### Implemented Changes

- CitySwitch: refined the same-year CBRE milestone to September 14, 2021 and changed it to `Acquisition`; relabeled the CitySwitch investor page as owner-specific investment-date evidence; rephrased a later debt-capital update so it is not misread as a later owner-entry close.
- ENGIE Battery Storage Portfolio: changed the May 15, 2025 CBRE/ENGIE portfolio partnership milestone to `Acquisition`, clarified that CBRE IM invested while ENGIE retained control, and relabeled the ENGIE release as owner-specific investment-date evidence.
- Forum Mobility: relabeled the January 17, 2023 $400 million joint venture / $15 million Series A source as owner-specific close-date evidence and replaced the inaccessible Forum news URL with the public PR Newswire release.
- Gateway Fiber: refined the close milestone to February 19, 2023 based on Gateway's closing/new-partnership announcement, added owner-specific announcement and close source labels, and retained the January 27, 2023 definitive-agreement milestone.
- Vantage Data Centers Stabilized North America Portfolio: replaced the generic 2020 CBRE Caledon investor milestone with a July 23, 2020 `Acquisition` close milestone from CBRE Caledon's completion release and added owner-specific announcement/close source labels.
- WANRack: refined the same-year milestone to the July 2, 2021 close after regulatory approvals, changed it to `Acquisition`, and relabeled the WANRack release as owner-specific close-date evidence.

### High-Conviction Confirmations

- Accelerate Infrastructure Opportunities: date basis is launch/investment-history evidence. CBRE IM's October 29, 2024 release states that Accelerate and CBRE IM joined forces in December 2022 to launch the infrastructure site acquisition strategy, supporting the stored 2022 year.
- CitySwitch: date basis is acquisition/investment evidence. CitySwitch's investor page states that in 2021 CBRE IM made a significant strategic acquisition and follow-on financial commitment; CitySwitch's own news index dates the CBRE Caledon investment announcement to September 14, 2021. No public close date separate from the announcement was located.
- ClearGen Holdings: date basis is acquisition announcement. CBRE IM announced on August 21, 2025 that it acquired ClearGen Holdings; no later close release was located.
- ENGIE Battery Storage Portfolio: date basis is investment/portfolio-sale announcement. ENGIE announced on May 15, 2025 that it entered a partnership with funds managed by CBRE IM on a 2.4 GW battery portfolio, describing it as a completed sale while retaining control and operations.
- Forum Mobility: date basis is close date. Forum announced on January 17, 2023 the closing of a $15 million Series A and a new $400 million joint venture, both led by a CBRE IM-sponsored fund.
- Gateway Fiber: date basis is close/new-partnership announcement. CBRE IM signed the definitive agreement on January 27, 2023; Gateway's February 19, 2023 release announced the new CBRE IM partnership and the end of the prior Crosstimbers investment relationship.
- Vantage Data Centers Stabilized North America Portfolio: date basis is close date. CBRE Caledon's July 23, 2020 release states it acquired a significant minority stake in the newly formed platform containing 12 stabilized Vantage Data Centers assets and completed the investment alongside the Colony-led investor group.
- WANRack: date basis is close date. WANRack announced on July 2, 2021 that CBRE Caledon completed the acquisition after regulatory approvals.
- Generate Capital / CBRE Investment Management: date basis is close/equity-raise disclosure. Generate's July 19, 2021 release states it raised $2 billion in corporate equity from institutional investors including new investment from CBRE Caledon, supporting the stored CBRE owner year.

### Unresolved

- CitySwitch — CBRE Investment Management — stored year 2021 — no separate public close date found; current-owner page and same-day acquisition announcement support the year.
- ClearGen Holdings — CBRE Investment Management — stored year 2025 — no separate public close date found beyond CBRE IM's acquisition announcement.
- ENGIE Battery Storage Portfolio — CBRE Investment Management — stored year 2025 — public materials describe the transaction as completed/entered on May 15, 2025 but do not disclose detailed ownership percentages.
- Gateway Fiber — CBRE Investment Management — stored year 2023 — February 19, 2023 new-partnership/closing evidence supports the year; no separate legal close certificate was found.

### Sources

- `https://www.cbreim.com/press-releases/accelerate-and-cbreim-launch-partnership-to-acquire-infrastructure-ground-leases`
- `https://www.cbreim.com/press-releases/accelerate-infrastructure-opportunities-raises-630-million-from-cbre-im`
- `https://www.cityswitch.com/investors`
- `https://www.cityswitch.com/news-research`
- `https://www.cbreim.com/press-releases/cbre-im-accelerates-scale-of-clean-energy-infrastructure-strategy-with-acquisition-of-cleargen`
- `https://www.engie-na.com/engie-cbre-battery-storage-partnership/`
- `https://www.prnewswire.com/news-releases/forum-mobility-and-cbre-investment-management-announce-400-million-joint-venture-and-15-million-series-a-targeting-equitable-electrification-of-heavy-duty-port-transit-301721528.html`
- `https://www.bankstreet.com/transactions/gatewayfiber-a-portfolio-company-of-crosstimbers-capital-group-has-entered-into-a-definitive-agreement-to-be-acquired-by-cbre-investment-management/`
- `https://www.bankstreet.com/app/uploads/2025/10/2023-02-19_cbre_investment_management_gateway_fiber_closing_press_release.pdf`
- `https://vantage-dc.com/news/colony-capital-and-vantage-data-centers-to-form-strategic-partnership-to-advance-data-center-growth/`
- `https://ir.digitalbridge.com/node/9926/html`
- `https://www.cbrecaledon.com/wp-content/uploads/2020/07/Vantage-Data-Centers-Investment-Press-Release.pdf`
- `https://www.wanrack.com/news/blog-post-one-nt6jb-ns5wd-42tsj`
- `https://www.businesswire.com/news/home/20210719005233/en/Generate-Closes-%242-Billion-Equity-Raise-from-Global-Institutional-Investors-to-Accelerate-and-Scale-Sustainable-Infrastructure-and-Climate-Solutions`

## Post-CBRE Investment Management Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T14:32:15.294Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Stored owner/top-level years were unchanged; edits were limited to transaction categories, dates, source labels, and audit-safe wording for a later CitySwitch debt-capital update.

## CC&L Cluster — Sub-Cluster 1

### Reviewed Companies / Owners

- Adelaide Wind — CC&L — stored/top-level year 2025 — unchanged.
- Alberta Midland Rail Terminal — CC&L — stored/top-level year 2022 — unchanged.
- Armow Wind Farm — CC&L — stored/top-level year 2025 — changed to 2024.
- Bear Creek Hydro Project — CC&L — stored/top-level year 2019 — unchanged.
- Bornish Wind — CC&L — stored/top-level year 2025 — unchanged.
- Goshen Wind — CC&L — stored/top-level year 2025 — unchanged.
- Grand Renewable Solar Project — CC&L — stored/top-level year 2013 — unchanged.
- Grand Renewable Wind Farm — CC&L — stored/top-level year 2025 — changed to 2024.

### Implemented Changes

- Adelaide Wind: refined the September 29, 2025 CC&L / NextEra 49% interest milestone to `Acquisition` and relabeled the CC&L release as owner-specific investment-date evidence.
- Armow Wind Farm: corrected the owner and top-level investment year from 2025 to 2024 based on CC&L's case page listing December 2024 as the initial investment date; added an aligned December 2024 acquisition milestone and retained the January 7, 2025 public announcement as a separate follow-on milestone/source.
- Bear Creek Hydro Project: relabeled the CC&L case page as owner-specific investment-date evidence for the March 2019 initial investment date.
- Bornish Wind: refined the September 29, 2025 CC&L / NextEra 49% interest milestone to `Acquisition` and relabeled the CC&L release as owner-specific investment-date evidence.
- Goshen Wind: refined the September 29, 2025 CC&L / NextEra 49% interest milestone to `Acquisition` and relabeled the CC&L release as owner-specific investment-date evidence.
- Grand Renewable Solar Project: aligned the description and same-year milestone to CC&L's June 2013 partnership/investment evidence and relabeled the CC&L case page as owner-specific investment-date evidence.
- Grand Renewable Wind Farm: corrected the owner and top-level investment year from 2025 to 2024 based on CC&L's case page listing December 2024 as the initial investment date; added an aligned December 2024 acquisition milestone and retained the January 7, 2025 public announcement as a separate follow-on milestone/source.

### High-Conviction Confirmations

- Adelaide Wind / Bornish Wind / Goshen Wind: date basis is announcement evidence. CC&L announced on September 29, 2025 that it acquired 49% interests in the three Ontario wind assets from NextEra Energy Resources, while NextEra retained 51%; no separate public close date was identified.
- Alberta Midland Rail Terminal: date basis is investment/acquisition evidence. CC&L's case page and related Alpenglow/CC&L materials support CC&L's 2022 entry into the Alberta Midland Rail Terminal platform; later 2025 private-placement financing did not reset the owner-entry year.
- Armow Wind Farm: date basis is initial-investment evidence. CC&L's case page lists December 2024 as the initial investment date, while the January 2025 Torys matter/public reporting captured the later announcement of CC&L's acquisition from Pattern Energy.
- Bear Creek Hydro Project: date basis is initial-investment evidence. CC&L's case page lists March 2019 as the initial investment date.
- Grand Renewable Solar Project: date basis is initial-investment/partnership evidence. CC&L's case page lists June 2013 as the initial investment date and the public completion release identifies Samsung Renewable Energy, CC&L, and Six Nations of the Grand River as the project partners.
- Grand Renewable Wind Farm: date basis is initial-investment evidence. CC&L's case page lists December 2024 as the initial investment date, while the January 2025 Torys matter/public reporting captured the later announcement of CC&L's acquisition from Pattern Energy.

### Unresolved

- Adelaide Wind — CC&L — stored year 2025 — no separate public close date found beyond the September 29, 2025 acquisition announcement.
- Bornish Wind — CC&L — stored year 2025 — no separate public close date found beyond the September 29, 2025 acquisition announcement.
- Goshen Wind — CC&L — stored year 2025 — no separate public close date found beyond the September 29, 2025 acquisition announcement.
- Armow Wind Farm — CC&L — corrected year 2024 — no exact December 2024 investment day found; CC&L's own case page supports the month and year.
- Grand Renewable Wind Farm — CC&L — corrected year 2024 — no exact December 2024 investment day found; CC&L's own case page supports the month and year.

### Sources

- `https://cclinfrastructure.cclgroup.com/insight/news-ccl-infrastructure-expands-renewable-energy-portfolio-to-nearly-2-4-gw-with-investment-in-three-ontario-wind-assets/`
- `https://www.prnewswire.com/news-releases/connor-clark--lunn-infrastructure-expands-renewable-energy-portfolio-to-nearly-2-4-gw-with-investment-in-three-ontario-wind-assets-302568577.html`
- `https://www.torys.com/work/2025/09/5dcd8f8a-edac-4c8d-8758-de74938c0751`
- `https://cclinfrastructure.cclgroup.com/cases/alberta-midland-rail-terminal/`
- `https://cclinfrastructure.cclgroup.com/insight/connor-clark-lunn-infrastructure-and-alpenglow-rail-announce-closing-of-280-million-private-placement-financing`
- `https://cclinfrastructure.cclgroup.com/cases/armow-wind-farm/`
- `https://www.torys.com/work/2025/01/dad6af40-bc42-44ca-9ce4-c7ed2cb7bf8e`
- `https://cclinfrastructure.cclgroup.com/cases/bear-creek-hydro-project/`
- `https://cclinfrastructure.cclgroup.com/cases/grand-renewable-solar-project/`
- `https://www.newswire.ca/news-releases/samsung-connor-clark--lunn-and-six-nations-announce-completion-of-largest-solar-project-in-canada-517796721.html`
- `https://cclinfrastructure.cclgroup.com/cases/grand-renewable-wind-farm/`

## Post-CC&L Sub-Cluster 1 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T14:35:49.725Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Year distribution shifted two owner rows from 2025 to 2024 after the Armow Wind Farm and Grand Renewable Wind Farm corrections.

## CC&L Cluster — Sub-Cluster 2

### Reviewed Companies / Owners

- Harrison Hydro Project — CC&L — stored/top-level year 2007 — unchanged.
- Hog Creek Wind Farm — CC&L — stored/top-level year 2020 — unchanged.
- Hunter Creek Hydro Project — CC&L — stored/top-level year 2016 — unchanged.
- Hy Stor Energy — CC&L — stored/top-level year 2021 — unchanged.
- Kingston Solar Project — CC&L — stored/top-level year 2014 — unchanged.
- Landmark Student Transportation — CC&L — stored/top-level year 2022 — unchanged.
- Long Lake Hydro Project — CC&L — stored/top-level year 2019 — unchanged.

### Implemented Changes

- Harrison Hydro Project: relabeled the CC&L case page as owner-specific investment-date evidence and corrected the description to state the January 2007 initial investment date rather than saying the investment date was not disclosed.
- Hog Creek Wind Farm: added the EDPR September 2, 2020 announcement and December 28, 2020 completion sources; changed the same-year transaction milestones to `Acquisition`; refined the ownership vehicle to the public 80% interest / EDPR-retained-20% structure; and aligned the description to the December 2020 close evidence.
- Hunter Creek Hydro Project: relabeled the CC&L case page as owner-specific investment-date evidence and corrected the description to state the June 2016 initial investment date rather than saying the investment date was not disclosed.
- Hy Stor Energy: added a June 2021 initial-investment milestone from CC&L's case page and retained the October 19, 2021 partnership announcement as a separate same-year announcement milestone/source.
- Kingston Solar Project: relabeled the CC&L case page as owner-specific investment-date evidence for the July 2014 initial investment date.
- Landmark Student Transportation: changed the January 20, 2022 majority-interest transaction milestone to `Acquisition`, removed the duplicate generic 2022 investment milestone, and added owner-specific investment-date and announcement-date source labels.
- Long Lake Hydro Project: relabeled the CC&L case page as owner-specific investment-date evidence and corrected the description to state the March 2019 initial investment date rather than saying the investment date was not disclosed.

### High-Conviction Confirmations

- Harrison Hydro Project: date basis is initial-investment evidence. CC&L's case page lists January 2007 as the initial investment date and identifies the project as acquired at construction stage.
- Hog Creek Wind Farm: date basis is close date. EDPR announced on September 2, 2020 that it signed a sale-and-purchase agreement with CC&L Infrastructure for an 80% equity shareholding in a U.S. wind and solar portfolio including Hog Creek, and EDP announced completion of the portfolio sale on December 28, 2020.
- Hunter Creek Hydro Project: date basis is initial-investment evidence. CC&L's case page lists June 2016 as the initial investment date.
- Hy Stor Energy: date basis is initial-investment evidence. CC&L's case page lists June 2021 as the initial investment date; CC&L later publicly announced the strategic partnership on October 19, 2021.
- Kingston Solar Project: date basis is initial-investment evidence. CC&L's case page lists July 2014 as the initial investment date and states that CC&L and Samsung Renewable Energy began construction in 2014.
- Landmark Student Transportation: date basis is announcement evidence. CC&L's case page lists January 2022 as the initial investment date and CC&L announced on January 20, 2022 that it acquired a majority interest in Landmark.
- Long Lake Hydro Project: date basis is initial-investment evidence. CC&L's case page lists March 2019 as the initial investment date.

### Unresolved

- Harrison Hydro Project — CC&L — stored year 2007 — no exact January 2007 investment day found; CC&L's own case page supports the month and year.
- Hunter Creek Hydro Project — CC&L — stored year 2016 — no exact June 2016 investment day found; CC&L's own case page supports the month and year.
- Hy Stor Energy — CC&L — stored year 2021 — no exact June 2021 initial-investment day found; CC&L's own case page supports the month and year.
- Kingston Solar Project — CC&L — stored year 2014 — no exact July 2014 investment day found; CC&L's own case page supports the month and year.
- Landmark Student Transportation — CC&L — stored year 2022 — no separate public close date found beyond CC&L's January 20, 2022 majority-interest announcement.
- Long Lake Hydro Project — CC&L — stored year 2019 — no exact March 2019 investment day found; CC&L's own case page supports the month and year.

### Sources

- `https://cclinfrastructure.cclgroup.com/cases/harrison-hydro-project/`
- `https://cclinfrastructure.cclgroup.com/cases/hog-creek-wind-farm/`
- `https://edp.com/en/north-america/na/media/edpr-announces-700m-sell-down-deal-wind-and-solar-portfolio`
- `https://www.edp.com/en/investors/investor-information/market-notifications/edp-concludes-07-billion-sell-down-deal-wind-and-solar-portfolio-north-america`
- `https://cclinfrastructure.cclgroup.com/cases/hunter-creek-hydro-project/`
- `https://cclinfrastructure.cclgroup.com/cases/hy-stor-energy/`
- `https://cclinfrastructure.cclgroup.com/insight/connor-clark-lunn-infrastructure-establishes-partnership-with-hy-stor-energy-to-develop-commercialize-and-operate-a-portfolio-of-green-hydrogen-projects/`
- `https://cclinfrastructure.cclgroup.com/cases/kingston-solar-project/`
- `https://cclinfrastructure.cclgroup.com/cases/landmark-student-transportation/`
- `https://cclinfrastructure.cclgroup.com/insight/connor-clark-lunn-infrastructure-announces-investment-in-landmark-student-transportation/`
- `https://cclinfrastructure.cclgroup.com/cases/long-lake-hydro-project/`

## Post-CC&L Sub-Cluster 2 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T14:40:54.261Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Stored owner/top-level years were unchanged; edits were limited to source labels, transaction categories, Hog Creek ownership/close-source alignment, and Hy Stor's June 2021 initial-investment milestone.

## CC&L Cluster — Sub-Cluster 3

### Reviewed Companies / Owners

- Meadow Lake V Wind Farm — CC&L — stored/top-level year 2020 — unchanged.
- North Island Hospitals Project — CC&L — stored/top-level year 2014 — unchanged.
- Northside Student Housing Community — CC&L — stored/top-level year 2025 — unchanged.
- Quilt Block Wind Farm — CC&L — stored/top-level year 2021 — changed to 2020.
- Rainy River Solar Project — CC&L — stored/top-level year 2014 — unchanged.
- Redbed Plains Wind Farm — CC&L — stored/top-level year 2020 — unchanged.

### Implemented Changes

- Meadow Lake V Wind Farm: added the EDPR September 2, 2020 announcement and December 28, 2020 completion sources; changed the same-year transaction milestones to `Acquisition`; refined the ownership vehicle to the public 80% interest / EDPR-retained-20% structure; and aligned the description to the December 2020 close evidence.
- North Island Hospitals Project: refined the same-year financial-close milestones to July 2 and July 3, 2014, explicitly naming the CC&L affiliate in the Tandem Health Partners consortium; relabeled the CC&L case page and public financial-close sources as owner-specific investment/close evidence.
- Northside Student Housing Community: refined the CC&L / Bestinver majority-interest acquisition milestone to January 13, 2025 and added owner-specific announcement-date labels for the CC&L and PR Newswire releases.
- Quilt Block Wind Farm: corrected the owner and top-level investment year from 2021 to 2020 based on CC&L's case page listing December 2020 as the initial investment date and EDPR's December 28, 2020 completion notice for the wind assets in the U.S. portfolio; aligned ownership vehicle, description, milestones, and source labels.
- Rainy River Solar Project: relabeled the CC&L case page and financing announcement as owner-specific investment/announcement evidence.
- Redbed Plains Wind Farm: added the EDPR December 28, 2020 completion source; refined the ownership vehicle to the public 80% interest / EDPR-retained-20% structure; and aligned the December 2020 milestone to the close date.

### High-Conviction Confirmations

- Meadow Lake V Wind Farm: date basis is close date. CC&L's case page lists December 2020 as the initial investment date, and EDPR/EDP announced completion of the 80% portfolio sale to CC&L on December 28, 2020.
- North Island Hospitals Project: date basis is financial close. CC&L's case page lists June 2014 as the initial investment date, and the public project/company releases identify July 2014 financial close with CC&L-affiliated investors in the Tandem Health Partners team.
- Northside Student Housing Community: date basis is acquisition announcement. CC&L and Bestinver announced on January 13, 2025 that they acquired a majority interest in Northside, with Balfour Beatty retaining a minority stake.
- Quilt Block Wind Farm: date basis is close date. CC&L's case page lists December 2020 as the initial investment date, and EDPR/EDP announced completion of the 80% portfolio sale to CC&L on December 28, 2020; the prior 2021 stored year was not supported for this wind asset.
- Rainy River Solar Project: date basis is financing/investment announcement. CC&L's case page lists May 2014 as the initial investment date and the May 2014 public release announced financing with Rainy River First Nations, CC&L, and Terrma Capital.
- Redbed Plains Wind Farm: date basis is close date. CC&L's case page lists December 2020 as the initial investment date, and EDPR/EDP announced completion of the 80% portfolio sale to CC&L on December 28, 2020.

### Unresolved

- Northside Student Housing Community — CC&L — stored year 2025 — no separate public close date found beyond the January 13, 2025 majority-interest acquisition announcement.
- Rainy River Solar Project — CC&L — stored year 2014 — no separate public close date found beyond the May 2014 financing announcement and CC&L's May 2014 initial-investment case page evidence.

### Sources

- `https://cclinfrastructure.cclgroup.com/cases/meadow-lake-v-wind-farm/`
- `https://edp.com/en/north-america/na/media/edpr-announces-700m-sell-down-deal-wind-and-solar-portfolio`
- `https://www.edp.com/en/investors/investor-information/market-notifications/edp-concludes-07-billion-sell-down-deal-wind-and-solar-portfolio-north-america`
- `https://cclinfrastructure.cclgroup.com/cases/north-island-hospitals-project/`
- `https://news.gov.bc.ca/releases/2014FIN0023-000901`
- `https://www.balfourbeatty.com/media-centre/latest/balfour-beatty-reaches-financial-close-on-north-island-hospitals-project-in-canada/`
- `https://cclinfrastructure.cclgroup.com/insight/news-connor-clark-lunn-infrastructure-and-bestinver-infra-acquire-majority-stake-in-northside-student-housing/`
- `https://www.prnewswire.com/news-releases/connor-clark--lunn-infrastructure-and-bestinver-infra-acquire-majority-stake-in-northside-student-housing-302349284.html`
- `https://cclinfrastructure.cclgroup.com/cases/quilt-block-wind-farm/`
- `https://cclinfrastructure.cclgroup.com/cases/rainy-river-solar-project/`
- `https://www.newswire.ca/news-releases/rainy-river-first-nations-connor-clark--lunn-and-terrma-capital-announce-financing-for-25-mw-solar-project-514289271.html`
- `https://cclinfrastructure.cclgroup.com/cases/redbed-plains-wind-farm/`

## Post-CC&L Sub-Cluster 3 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T14:46:40.322Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count returned to the carry-forward 20 after audit-safe North Island wording. Year distribution shifted one owner row from 2021 to 2020 after correcting Quilt Block Wind Farm.

## CC&L Cluster — Sub-Cluster 4

### Reviewed Companies / Owners

- Regina Bypass P3 Project — CC&L — stored/top-level year 2015 — unchanged.
- Riverstart Solar Project — CC&L — stored/top-level year 2020 — changed to 2021.
- Rt. Hon. Herb Gray Parkway P3 project — CC&L — stored/top-level year 2022 — unchanged.
- Sakwi Creek Hydro Project — CC&L — stored/top-level year 2013 — unchanged.
- Sharp Hills Wind Farm — CC&L — stored/top-level year 2024 — unchanged.
- South Fraser Perimeter Road P3 Project — CC&L — stored/top-level year 2016 — unchanged.
- Southgate Solar Project — CC&L — stored/top-level year 2015 — unchanged.
- Southwest Calgary Ring Road P3 Project — CC&L — stored/top-level year 2016 — unchanged.

### Implemented Changes

- Riverstart Solar Project: corrected the owner and top-level investment year from 2020 to 2021 based on CC&L's case page listing December 2021 as the initial investment date and EDPR's December 30, 2021 Riverstart completion notice; aligned ownership vehicle, same-year acquisition milestone, and source labels.
- Rt. Hon. Herb Gray Parkway P3 project: relabeled the Infrastructure Finance & Investment completion report as owner-specific close-date evidence.
- Sakwi Creek Hydro Project: relabeled the CC&L case page as owner-specific investment-date evidence.
- Sharp Hills Wind Farm: refined the close milestone to April 19, 2024, changed it to `Acquisition`, and relabeled the CC&L announcement/close releases as owner-specific sources.
- South Fraser Perimeter Road P3 Project: relabeled the CC&L case page as owner-specific investment-date evidence and changed a later portfolio-listing milestone from `Financing` to `Other`.
- Southgate Solar Project: relabeled the CC&L case page as owner-specific investment-date evidence.
- Southwest Calgary Ring Road P3 Project: relabeled the project-agreement release as owner-specific agreement-date evidence and changed a later portfolio-listing milestone from `Financing` to `Other`.

### High-Conviction Confirmations

- Regina Bypass P3 Project: date basis is initial-investment evidence. CC&L's case page lists August 2015 as the initial investment date for the construction-stage P3.
- Riverstart Solar Project: date basis is close date. CC&L's case page lists December 2021 as the initial investment date, and EDPR announced on December 30, 2021 completion of the Riverstart sale to CC&L Infrastructure. The September 2020 sale-and-purchase agreement was an earlier signing/forward-purchase signal and does not control the investment year.
- Rt. Hon. Herb Gray Parkway P3 project: date basis is close date. Public reporting dated August 2, 2022 states CC&L Infrastructure and Desjardins completed the acquisition of a majority stake in the concession.
- Sakwi Creek Hydro Project: date basis is initial-investment evidence. CC&L's case page lists September 2013 as the initial investment date.
- Sharp Hills Wind Farm: date basis is close date. CC&L announced on February 14, 2024 that it agreed to acquire an 80% stake, and announced completion on April 19, 2024.
- South Fraser Perimeter Road P3 Project: date basis is initial-investment evidence. CC&L's case page lists December 2016 as the initial investment date.
- Southgate Solar Project: date basis is investment/construction evidence. CC&L's case page states that CC&L invested in construction of the project in 2015.
- Southwest Calgary Ring Road P3 Project: date basis is initial-investment evidence. CC&L's case page lists August 2016 as the initial investment date, and the public project agreement was signed in September 2016.

### Unresolved

- Regina Bypass P3 Project — CC&L — stored year 2015 — no exact August 2015 investment day found; CC&L's own case page supports the month and year.
- Sakwi Creek Hydro Project — CC&L — stored year 2013 — no exact September 2013 investment day found; CC&L's own case page supports the month and year.
- South Fraser Perimeter Road P3 Project — CC&L — stored year 2016 — no exact December 2016 investment day found; CC&L's own case page supports the month and year.
- Southgate Solar Project — CC&L — stored year 2015 — no exact 2015 investment date found beyond CC&L's own construction-investment case page.
- Southwest Calgary Ring Road P3 Project — CC&L — stored year 2016 — no exact August 2016 investment day found; CC&L's own case page supports the month and year.

### Sources

- `https://cclinfrastructure.cclgroup.com/cases/regina-bypass-p3-project/`
- `https://cclinfrastructure.cclgroup.com/cases/riverstart-solar-project/`
- `https://www.edpr-investors.com/en/media/news/edpr-informs-about-completion-asset-rotation-deal`
- `https://cclinfrastructure.cclgroup.com/insight/connor-clark-lunn-infrastructure-announces-commencement-of-operations-and-closing-of-us87-million-debt-financing-for-200-mw-riverstart-solar-project/`
- `https://www.infrapppworld.com/update/ccl-infrastructure-and-desjardins-global-completes-acquisition-of-herb-gray-parkway`
- `https://cclinfrastructure.cclgroup.com/cases/sakwi-creek-hydro-project/`
- `https://cclinfrastructure.cclgroup.com/insight/news-infra-ccl-infrastructure-to-expand-renewable-energy-portfolio-with-investment-in-297-megawatt-alberta-wind-farm/`
- `https://cclinfrastructure.cclgroup.com/insight/news-ccl-infrastructure-exceeds-1-8-gw-of-clean-energy-capacity-with-closing-of-alberta-wind-farm-investment/`
- `https://cclinfrastructure.cclgroup.com/cases/south-fraser-perimeter-road-p3-project/`
- `https://cclinfrastructure.cclgroup.com/what-we-do/southgate-solar-project-case-study/`
- `https://cclinfrastructure.cclgroup.com/cases/southwest-calgary-ring-road-p3-project/`
- `https://www.prnewswire.com/news-releases/meridiam-mountain-view-partners-consortium-sign-with-alberta-for-southwest-calgary-ring-road-300329141.html`

## Post-CC&L Sub-Cluster 4 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T14:49:28.174Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Year distribution shifted one owner row from 2020 to 2021 after correcting Riverstart Solar Project.

## CC&L Cluster — Sub-Cluster 5

### Reviewed Companies / Owners

- Trio Creek Hydro Project — CC&L — stored/top-level year 2019 — unchanged.
- Twin City Transportation — CC&L — stored/top-level year 2024 — unchanged.
- USA Rail Terminals — CC&L — stored/top-level year 2020 — unchanged.
- VIP Rail — CC&L — stored/top-level year 2019 — unchanged.
- White River Hydro Project — CC&L — stored/top-level year 2019 — unchanged.
- Windsor Solar Project — CC&L — stored/top-level year 2015 — unchanged.

### Implemented Changes

- Trio Creek Hydro Project: refined the June 6, 2019 closing milestone to an owner-named `Acquisition` milestone and added owner-specific investment, announcement, and close-date source labels.
- Twin City Transportation: relabeled the CC&L 2024 annual-growth release as owner-specific investment-date evidence.
- USA Rail Terminals: changed the July 2020 initial-investment milestone from `Financing` to `Acquisition` and relabeled the CC&L case page plus PR Newswire announcement as owner-specific investment/announcement evidence.
- Windsor Solar Project: refined the same-year investment milestone to November 2015 and relabeled the CC&L case page as owner-specific investment-date evidence.

### High-Conviction Confirmations

- Trio Creek Hydro Project: date basis is close date. CC&L's case page lists September 2018 as the initial investment/agreement timing, but CC&L's June 6, 2019 release states it completed the majority-interest acquisition and related C$197 million financing; stored year 2019 remains appropriate under the close-date preference.
- Twin City Transportation: date basis is investment/acquisition disclosure. CC&L's 2024 growth release identifies Twin City Transportation as an add-on acquisition under Landmark Student Transportation; stored year 2024 remains appropriate.
- USA Rail Terminals: date basis is initial-investment evidence. CC&L's case page lists July 2020 as the initial investment date, and the August 10, 2020 PR Newswire release announced the Alpenglow Rail / CC&L acquisition; stored year 2020 remains appropriate.
- VIP Rail: date basis is acquisition announcement. CC&L's September 2019 release announced the strategic Alpenglow partnership and VIP Rail acquisition; stored year 2019 remains appropriate.
- White River Hydro Project: date basis is initial-investment evidence. CC&L's case page lists March 2019 as the initial investment date; stored year 2019 remains appropriate.
- Windsor Solar Project: date basis is construction-investment evidence. CC&L's case page lists November 2015 as the initial investment date; stored year 2015 remains appropriate.

### Unresolved

- Twin City Transportation — CC&L — stored year 2024 — no exact 2024 close/investment date found; CC&L's 2024 annual-growth release supports the year.
- USA Rail Terminals — CC&L — stored year 2020 — no exact July 2020 investment day or separate close date found; CC&L's case page supports month/year and PR Newswire supports the August 2020 acquisition announcement.
- VIP Rail — CC&L — stored year 2019 — no separate close date found beyond the September 2019 partnership/acquisition announcement.
- White River Hydro Project — CC&L — stored year 2019 — no exact March 2019 investment day found; CC&L's case page supports the month and year.
- Windsor Solar Project — CC&L — stored year 2015 — no exact November 2015 investment day found; CC&L's case page supports the month and year.

### Sources

- `https://cclinfrastructure.cclgroup.com/cases/trio-creek-hydro-project/`
- `https://www.newswire.ca/news-releases/connor-clark--lunn-infrastructure-enters-agreement-to-acquire-majority-interests-in-bremner--trio-creek-hydro-projects-695034861.html`
- `https://www.newswire.ca/news-releases/connor-clark-amp-lunn-infrastructure-acquires-b-c-hydro-projects-and-announces-197-million-bank-financing-836451523.html`
- `https://cclinfrastructure.cclgroup.com/insight/news-infra-ccl-infrastructure-achieves-record-growth-in-2024/`
- `https://cclinfrastructure.cclgroup.com/cases/usa-rail-terminals/`
- `https://www.prnewswire.com/news-releases/alpenglow-rail-and-ccl-infrastructure-expand-rail-portfolio-with-acquisition-of-usa-rail-terminals-301106753.html`
- `https://cclinfrastructure.cclgroup.com/cases/vip-rail/`
- `https://www.newswire.ca/news-releases/connor-clark-amp-lunn-infrastructure-announces-strategic-rail-partnership-with-alpenglow-rail-and-acquires-canadian-rail-business-816917802.html`
- `https://cclinfrastructure.cclgroup.com/cases/white-river-hydro-project/`
- `https://cclinfrastructure.cclgroup.com/cases/windsor-solar-project/`

## Post-CC&L Sub-Cluster 5 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T14:53:27.448Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Full CC&L cluster is now reviewed through Windsor Solar Project; next queue resumes with CDPQ at A25 Concession.

## CDPQ Cluster — Sub-Cluster 1

### Reviewed Companies / Owners

- A25 Concession — CDPQ — stored/top-level year 2023 — unchanged.
- AES Indiana — CDPQ — stored/top-level year 2015 — unchanged.
- AES Ohio — CDPQ — stored/top-level year 2025 — unchanged.
- Alto — CDPQ — stored/top-level year 2025 — unchanged.
- DP World Canada — CDPQ — stored/top-level year 2016 — changed to 2017.
- Enel Green Power Mexico — CDPQ — stored/top-level year 2017 — changed to 2018.

### Implemented Changes

- A25 Concession: changed the announcement and close milestones to `Acquisition`, refined the February 28, 2023 close wording, and relabeled the CDPQ and McCarthy sources as owner-specific announcement/close evidence.
- AES Indiana: refined the same-year milestone to February 11, 2015 based on IPALCO's 2015 10-K, changed the milestone to `Acquisition`, and added owner-specific investment-date source labeling.
- AES Ohio: refined the close milestone to April 4, 2025 based on DPL/AES Ohio SEC disclosure, changed the announcement and close milestones to `Acquisition`, and relabeled sources as owner-specific announcement/close evidence.
- DP World Canada: corrected the owner and top-level investment year from 2016 to 2017 because the Canadian terminal stake transaction closed in January 2017 after the December 2016 announcement; added a same-year close milestone, relabeled sources, and corrected the Fraser Surrey Docks historical acquisition milestone from 2016 to February 24, 2020.
- Enel Green Power Mexico: corrected the owner and top-level investment year from 2017 to 2018 because Enel's official release says the CDPQ / CKD IM transaction closed on September 28, 2018 after the October 2017 agreement; added a same-year close milestone, changed the transaction milestones to `Acquisition`, and refined ownership vehicle wording to identify CDPQ's 40.8% stake within the 80% buyer group.

### High-Conviction Confirmations

- A25 Concession: date basis is close date. CDPQ announced the agreement on February 6, 2023, and transaction counsel reported completion on February 28, 2023; stored year 2023 remains appropriate.
- AES Indiana: date basis is initial investment date. IPALCO's 2015 10-K states that CDPQ purchased its initial IPALCO interests on February 11, 2015; stored year 2015 remains appropriate.
- AES Ohio: date basis is close date. AES/CDPQ announced the transaction on September 17, 2024, and DPL SEC filings state the closings occurred on April 4, 2025; stored year 2025 remains appropriate.
- Alto: date basis is development-contract signing. CDPQ Infra's March 21, 2025 release states Alto and the CDPQ Infra-led Cadence team signed the development contract; stored year 2025 remains appropriate.
- DP World Canada: date basis is close date. DP World/CDPQ announced the platform and Canadian terminal stake sale on December 2, 2016, while public close reporting places the Canadian terminal stake transaction in January 2017; the stored year now follows the close year.
- Enel Green Power Mexico: date basis is close date. CDPQ/CKD IM announced the Mexican renewable-portfolio acquisition on October 9, 2017, and Enel's official September 28, 2018 release states the sale closed; the stored year now follows the close year.

### Unresolved

- DP World Canada — CDPQ — corrected year 2017 — public sources consistently support January 2017 closing, but exact close-day disclosures vary across secondary/legal/reporting sources; month/year is high-conviction.
- Alto — CDPQ — stored year 2025 — public materials identify Cadence selection and development-contract signing, but detailed consortium ownership percentages are not disclosed.

### Sources

- `https://www.lacaisse.com/en/news/pressreleases/cdpq-acquires-50-montreals-a25-concession-transurban`
- `https://www.mccarthy.ca/en/experience/cdpq-acquires-a-50-interest-in-the-a25-concession-from-transurban-for-c-355m`
- `https://www.sec.gov/Archives/edgar/data/728391/000072839116000035/ipalco10k20151231.htm`
- `https://www.lacaisse.com/en/news/pressreleases/aes-announces-strategic-partnership-cdpq-support-aes-ohios-robust-growth-plans`
- `https://www.sec.gov/Archives/edgar/data/787250/000078725025000039/dpl-20250930.htm`
- `https://prod.cdpqinfra.com/en/news/pressreleases/toronto-quebec-city-high-speed-rail-first-major-milestone-reached`
- `https://www.dpworld.com/en/news/dp-world-and-cdpq-expand-global-investment-platform-to-us82-billion`
- `https://www.offshore-energy.biz/cdpq-acquires-stake-in-dp-worlds-canadian-terminals/`
- `https://www.dpworld.com/en/news/dp-world-acquires-fraser-surrey-docks`
- `https://www.prnewswire.com/news-releases/cdpq-and-ckd-im-acquire-mexican-wind-and-solar-assets-of-enel-green-power-for-a-total-capacity-of-1712-mw-650083693.html`
- `https://www.enelgreenpower.com/megamenu/media/press/2018/09/enel-closes-sale-of-majority-stake-in-18-gw-of-renewables-in-mexico-retains-plant-management`

## Post-CDPQ Sub-Cluster 1 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T14:57:53.310Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Year distribution shifted one owner row from 2016 to 2017 for DP World Canada and one owner row from 2017 to 2018 for Enel Green Power Mexico.

## CDPQ Cluster — Sub-Cluster 2

### Reviewed Companies / Owners

- Énergir — CDPQ — stored/top-level year 2004 — unchanged.
- ICA Operadora de Vías Terrestres, S.A.P.I. de C.V. — CDPQ — stored/top-level year 2015 — unchanged.
- Indiana Toll Road — CDPQ — stored/top-level year 2021 — unchanged.
- Indiana Toll Road — IFM Investors — stored owner year 2021 — changed to 2015.
- Innergex Renewable Energy — CDPQ — stored/top-level year 2025 — unchanged.
- Invenergy Renewables LLC — CDPQ — stored/top-level year 2013 — unchanged.
- Plenary Americas — CDPQ — stored/top-level year 2020 — unchanged.

### Implemented Changes

- Énergir: refined the initial investment milestone to June 30, 2004 based on the CDPQ-led Capital Infragaz / Noverco acquisition, changed the transaction milestones to `Acquisition`, and added owner-specific investment/announcement/close source labels.
- ICA OVT: refined the June 19, 2015 milestone wording to completion language and relabeled the source as owner-specific close-date evidence.
- Indiana Toll Road: corrected the IFM Investors owner row from 2021 to 2015 based on IFM's May 2015 completion of its 100% ITRCC acquisition; kept the displayed CDPQ/top-level year at 2021 because CDPQ is the primary displayed owner and entered through the 15% stake acquisition from IFM; added separate IFM and CDPQ investment-date source labels.
- Innergex Renewable Energy: changed announcement and close milestones to `Acquisition`, relabeled sources as owner-specific announcement/close evidence, and refined the ownership vehicle from a nominal 100% CDPQ stake to a La Caisse-led privatization structure because public materials reference post-closing syndication.
- Invenergy Renewables LLC: refined the 2013 milestone to say CDPQ initially invested in wind farms operated by Invenergy Renewables LLC, changed it to `Financing`, changed the 2018 majority-stake milestone to `Acquisition`, and relabeled the Invenergy release as owner-specific investment-date evidence.
- Plenary Americas: added a March 2020 close-month milestone from transaction-counsel evidence and relabeled sources as owner-specific announcement/close evidence.

### High-Conviction Confirmations

- Énergir: date basis is investment/close evidence. Lexpert reports the CDPQ-led Capital Infragaz acquisition of 50.38% of Noverco completed on June 30, 2004; CDPQ's later releases also state its first Énergir investment dates to 2004.
- ICA OVT: date basis is close date. ICA and CDPQ announced completion of the ICA OVT platform transaction on June 19, 2015; stored year 2015 remains appropriate.
- Indiana Toll Road — CDPQ: date basis is acquisition announcement/completion language. IFM and CDPQ announced on April 19, 2021 that CDPQ had acquired a 15% interest from IFM; top-level year 2021 remains appropriate for the displayed CDPQ owner.
- Indiana Toll Road — IFM Investors: date basis is close date. IFM announced completion of IFM Global Infrastructure Fund's acquisition of 100% of ITRCC in May 2015; the owner row now reflects IFM's original investment year instead of CDPQ's later entry year.
- Innergex Renewable Energy: date basis is close date. Innergex/La Caisse announced the definitive agreement on February 25, 2025 and completed the acquisition on July 21, 2025; stored year 2025 remains appropriate.
- Invenergy Renewables LLC: date basis is initial investment evidence. Invenergy's 2018 release says CDPQ initially invested in 2013 in wind farms operated by Invenergy Renewables LLC, acquired a direct stake the following year, and later increased to 52.4%; stored year 2013 remains appropriate because the initial Invenergy Renewables business exposure is public, while the direct-company stake nuance is documented.
- Plenary Americas: date basis is close month. Plenary/CDPQ announced the acquisition on March 12, 2020 and transaction counsel reports the acquisition closed in March 2020; stored year 2020 remains appropriate.

### Unresolved

- Invenergy Renewables LLC — CDPQ — stored year 2013 — public evidence distinguishes CDPQ's 2013 investment in wind farms operated by Invenergy Renewables LLC from its following-year direct stake in the company; because the 2013 exposure is explicitly tied to the named business and no day/month is public, the year was left unchanged.
- Plenary Americas — CDPQ — stored year 2020 — no exact close day found beyond March 2020 transaction-counsel close-month evidence.

### Sources

- `https://www.lexpert.ca/big-deals/capital-infragaz-acquires-5038-per-cent-of-noverco/345019`
- `https://www.lacaisse.com/en/news/pressreleases/cdpq-increases-its-majority-stake-energir`
- `https://www.lacaisse.com/en/news/pressreleases/cdpq-increases-its-stake-energir-making-company-entirely-quebec-owned`
- `https://www.newswire.ca/news-releases/ica-and-cdpq-complete-ps-3014-million-transaction-to-create-ica-ovt-an-operational-platform-dedicated-to-transport-projects-in-mexico-517964061.html`
- `https://www.ifminvestors.com/news-and-insights/media-centre/ifm-investors-completes-acquisition-of-indiana-toll-road-concession-company/`
- `https://www.lacaisse.com/en/news/pressreleases/ifm-investors-partners-cdpq-indiana-toll-road`
- `https://www.innergex.com/en/media/innergex-enters-into-definitive-agreement-to-be-acquired-by-cdpq-for-13-75-per-share`
- `https://www.innergex.com/en/media/la-caisse-completes-acquisition-of-innergex`
- `https://www.lacaisse.com/en/news/pressreleases/caisse-finalizes-acquisition-innergex-mobilizes-group-investors-support-its-long`
- `https://invenergy.com/news/invenergy-strengthens-its-diversified-clean-energy-platform-through-new-equity-transactions-with-cdpq-and-amp-capital`
- `https://www.prnewswire.com/news-releases/cdpq-acquires-significant-additional-stake-in-invenergy-renewables-llc-300652610.html`
- `https://plenary.com/americas/news/cdpq-acquires-plenary-americas`
- `https://www.fasken.com/en/experience/2020/03/caisse-de-depot-et-placement-du-quebec-acquires-plenary-americas`

## Post-CDPQ Sub-Cluster 2 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T15:02:01.651Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Year distribution shifted one owner row from 2021 to 2015 after correcting the Indiana Toll Road IFM Investors co-owner row; the secondary-owner display-year difference count increased by one as expected.

## CDPQ Cluster — Sub-Cluster 3

### Reviewed Companies / Owners

- Renewa — CDPQ — stored/top-level year 2025 — unchanged.
- Renewa — QIC — stored owner year 2022 — unchanged.
- Réseau express métropolitain — CDPQ — stored/top-level year 2018 — unchanged.

### Implemented Changes

- Renewa: consolidated duplicate 2022 and July 2025 milestones, refined the July 15, 2025 CDPQ milestone to the primary-equity commitment language, and kept separate same-year evidence for QIC's 2022 acquisition and CDPQ's 2025 investment.
- Réseau express métropolitain: separated the February 2018 contract-award/project-launch milestone, the April 12, 2018 construction-start/contract-finalization milestone, and the August 22, 2018 project-financing-completion milestone; relabeled sources as CDPQ-specific investment, construction-start, and financial-close evidence.

### High-Conviction Confirmations

- Renewa — CDPQ: date basis is investment announcement. QIC/Renewa/La Caisse announced on July 15, 2025 that La Caisse made a US$200 million primary equity commitment and acquired a stake in Renewa; stored year 2025 remains appropriate.
- Renewa — QIC: date basis is initial acquisition evidence. QIC's portfolio and case-study materials identify Renewa as acquired in 2022 on behalf of a managed client; stored owner year 2022 remains appropriate.
- Réseau express métropolitain: date basis is project launch / construction / financing evidence. CDPQ Infra launched the project with winning consortia in February 2018, officially started construction in April 2018, and completed project financing with CIB in August 2018; stored year 2018 remains appropriate.

### Unresolved

- Renewa — CDPQ — stored year 2025 — no public current ownership percentage found for CDPQ's post-investment stake.
- Renewa — QIC — stored year 2022 — no exact 2022 acquisition day/month found; QIC's own materials support the year.

### Sources

- `https://www.qic.com/Investment-Capabilities/Infrastructure/Global-Portfolio/Renewa`
- `https://www.qic.com/News-and-Insights/US-land-under-infrastructure-company-Renewa`
- `https://www.renewa.com/la-caisse-invests-200m-qic-backed-renewa-clean-energy/`
- `https://www.qic.com/News-and-Insights/La-Caisse-invests-US%24200-million-in-QIC-backed-Renewa`
- `https://cdpqinfra.com/en/reseau-express-metropolitain-project-officially-launches`
- `https://www.newswire.ca/news-releases/construction-of-the-reseau-express-metropolitain-has-officially-started-679551913.html`
- `https://cdpqinfra.com/en/canada-infrastructure-bank-invests-r%C3%A9seau-express-m%C3%A9tropolitain-project-128-billion-15-year-loan`

## Post-CDPQ Sub-Cluster 3 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T15:04:23.781Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. No investment-year distribution changes were made in this sub-cluster.

## CDPQ Cluster — Sub-Cluster 4

### Reviewed Companies / Owners

- Southern Star Central Gas Pipeline — CDPQ — stored/top-level year 2015 — unchanged.
- Student Transportation of America and Canada — CDPQ — stored/top-level year 2004 — unchanged.
- SunZia Wind and Transmission — CDPQ — stored/top-level year 2023 — unchanged.
- TramCité — CDPQ — stored/top-level year 2025 — changed to 2024.
- Vertical Bridge — CDPQ — stored/top-level year 2019 — unchanged.
- Vertical Bridge — DigitalBridge — stored owner year 2014 — unchanged.

### Implemented Changes

- Southern Star Central Gas Pipeline: removed the unsupported generic 2015 close milestone, changed the same-year milestone to the May 1, 2015 CDPQ / GE Energy Financial Services acquisition announcement, changed it to `Acquisition`, and added owner-specific announcement/sale-agreement source labels.
- Student Transportation of America and Canada: changed the 2004 CDPQ initial-investment milestone to `Financing`, added February 28, 2018 definitive-agreement and April 27, 2018 take-private closing milestones as later `Acquisition` events, and added owner-specific investment-date and close-date source labels.
- SunZia Wind and Transmission: kept the stored CDPQ year unchanged, relabeled the Pattern financing and CDPQ holding sources, and left the remaining attribution flag unresolved because public evidence reviewed still does not clearly prove CDPQ's owner-entry date.
- TramCité: corrected the CDPQ owner and top-level investment year from 2025 to 2024 based on CDPQ Infra's December 19, 2024 procurement notice following the implementation agreement with the Government of Québec; added a same-year `Financing` milestone and refreshed later qualified-consortia/preferred-bidder milestones and source labels.
- Vertical Bridge: kept CDPQ and DigitalBridge years unchanged, retained CDPQ's April 2, 2019 acquisition-announcement milestone, and replaced the DigitalBridge investment-date source with Vertical Bridge's November 11, 2014 capital-raise release identifying Digital Bridge as an existing investor that increased its commitment.

### High-Conviction Confirmations

- Southern Star Central Gas Pipeline: date basis is announcement/sale-agreement fallback. CDPQ announced its partnership with GE Energy Financial Services to acquire Southern Star on May 1, 2015, and Morgan Stanley announced the sale the same day; no separate close date was found.
- Student Transportation of America and Canada: date basis is CDPQ's first-investment statement. CDPQ's company portrait says it made its first investment in Student Transportation in 2004; the April 27, 2018 take-private closing is preserved as a later transaction and does not reset the owner-entry year.
- SunZia Wind and Transmission: date basis remains unresolved. Pattern's December 27, 2023 project financing close supports the project year, and CDPQ's 2024 additional-information disclosure identifies SunZia-related holdings, but no clear public source ties CDPQ specifically to the 2023 financing close.
- TramCité: date basis is agreement/procurement launch. CDPQ Infra's December 19, 2024 release says the procurement notice followed the implementation agreement with the Government of Québec, supporting 2024 as CDPQ Infra's original project-entry year instead of the later 2025 procurement activity.
- Vertical Bridge — CDPQ: date basis is announcement fallback. CDPQ announced the 30% stake acquisition on April 2, 2019; no separate close date was found.
- Vertical Bridge — DigitalBridge: date basis is initial-investment evidence. Vertical Bridge's November 11, 2014 release identifies Digital Bridge as an existing investor increasing its commitment in the second-round capital raise; the 2021 controlling-stake acquisition is a later ownership increase and does not reset the original investment year.

### Unresolved

- Southern Star Central Gas Pipeline — CDPQ — stored year 2015 — no separate close date found beyond May 1, 2015 announcement/sale-agreement evidence.
- SunZia Wind and Transmission — CDPQ — stored year 2023 — remains one of the carry-forward medium flags because public sources reviewed do not clearly name CDPQ in the 2023 financing milestone or disclose CDPQ's original owner-entry date.
- Vertical Bridge — CDPQ — stored year 2019 — no separate close date found beyond the April 2, 2019 acquisition announcement.

### Sources

- `https://www.prnewswire.com/news-releases/la-caisse-enters-partnership-to-acquire-southern-star-central-corp-517672801.html`
- `https://www.morganstanley.com/press-releases/morgan-stanley-infrastructure-announces-sale-of-southern-star-central-corp_ce2c81f4-7b97-454a-a663-e0c41d9c71e4`
- `https://www.lacaisse.com/en/news/articles/3-factors-have-made-student-transportation-third-largest-school-transportation-player`
- `https://www.torys.com/work/2018/02/student-transportation-acquired-by-a-group-of-investors-led-by-cdpq`
- `https://patternenergy.com/pattern-energy-closes-11-billion-financing-of-largest-clean-energy-infrastructure-project-in-u-s-history/`
- `https://www.lacaisse.com/sites/default/files/medias/pdf/en/ra/2024_cdpq_add_information.pdf`
- `https://cdpqinfra.com/en/news/pressreleases/cdpq-infra-launches-a-procurement-notice-for-the-tramcite-project`
- `https://www.newswire.ca/news-releases/tramcite-takes-an-important-step-forward-with-the-announcement-of-the-qualified-consortia-for-two-major-contracts-834300933.html`
- `https://cdpqinfra.com/en/news/pressreleases/tramcite-announces-selected-consortia-for-the-civil-and-systems-contracts`
- `https://www.prnewswire.com/news-releases/cdpq-to-acquire-30-stake-in-us-wireless-infrastructure-leader-vertical-bridge-300822891.html`
- `https://www.verticalbridge.com/press-releases/vertical-bridge-holdings-completes-second-round-capital-raise-equity-commitments-now-total-750-million`

## Post-CDPQ Sub-Cluster 4 Audit

- Command: `npm run audit:portfolio-years`
- Run at: 2026-05-03T15:21:52.447Z
- Result: 1,312 owner-company rows; 20 flagged rows remain.
- Note: The flagged count stayed at the carry-forward 20. Year distribution shifted one owner row from 2025 to 2024 after correcting TramCité; next queue resumes with CIM Group at 400 Paul Avenue Data Center.
