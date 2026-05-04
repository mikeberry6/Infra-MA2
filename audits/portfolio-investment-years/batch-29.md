# Batch 29 - 3i, Allianz, EnCap, Equitix, Fengate

Run date: 2026-05-02

Audit status after batch:
- Rows reviewed by audit: 1,313 owner-company rows
- Flagged rows: 315
- Priority split: 12 critical, 54 high, 228 medium, 21 low
- Command: `npm run audit:portfolio-years`

## Implemented Changes

### Smarte Carte International Holdings, Inc. - 3i Infrastructure
- Decision: corrected the top-level investment year from 2018 to 2017; owner year remained 2017.
- Date basis: announcement fallback.
- Change: aligned top-level year with the primary displayed owner and relabeled the 3i announcement as owner-specific investment-date evidence.
- Source reviewed: https://www.3i.com/media/news/2017/investment-in-smarte-carte/
- Rationale: 3i Infrastructure announced its investment in Smarte Carte on October 16, 2017. The 2018 Smarte Carte Aviation Mobility acquisition/refinancing was later portfolio activity and should not drive the primary investment year.

### Broadview Wind Farm - Allianz Global Investors
- Decision: corrected the top-level investment year from 2018 to 2017; owner year remained 2017.
- Date basis: close date.
- Change: aligned top-level year with the primary displayed owner and relabeled the Allianz/Capital One PDF as close-date evidence.
- Source reviewed: https://www.allianz.com/content/dam/onemarketing/azcom/Allianz_com/migration/media/press/document/ACP_Cap_One_EN.pdf
- Rationale: Allianz Capital Partners and Capital One announced the closing of a tax-equity investment in Broadview in May 2017. The stored 2018 top-level year was not supported by the reviewed investment-date evidence.

### Aspen Midstream II - EnCap Investments
- Decision: kept top-level and owner investment year at 2025.
- Date basis: announcement fallback.
- Change: reclassified the 2017 Aspen I history as legacy background and labeled the 2025 Aspen II equity commitment announcement as investment-date evidence.
- Source reviewed: https://www.encapinvestments.com/news/aspen-midstream-secures-equity-commitment-encap-flatrock-midstream-formation-aspen-ii
- Rationale: EnCap disclosed on September 9, 2025 that Aspen Midstream secured an equity commitment from EnCap Flatrock for the formation of Aspen II. The 2017 Aspen I launch involved the same management team but was not the current owner's original investment in the named Aspen II row.

### North Carolina Solar - Equitix
- Decision: kept top-level and owner investment year at 2021.
- Date basis: close/effective date.
- Change: reworded the 2018 Cypress Creek project-transfer milestone as prior-owner background and added an Equitix close-date source label.
- Sources reviewed:
  - https://www.laing.com/portfolio/north-carolina-solar-us/
  - https://www.laing.com/assets/Insights/jl_sustainability_report_2021.pdf
  - https://data.fca.org.uk/artefacts/NSM/RNS/4118829.html
- Rationale: John Laing's 2021 reporting states the group was acquired by KKR in September 2021 and Equitix acquired a 50% shareholding in the existing asset portfolio immediately following completion. The official RNS states the scheme became effective on September 22, 2021. The 2018 project acquisitions predated Equitix's current ownership vehicle and should remain background.

### Freeport Energy Center - Fengate Asset Management
- Decision: kept top-level and owner investment year at 2020.
- Date basis: financial close.
- Change: reclassified the 2007 operating milestone and the 2024 companion-asset reference as non-investment background; relabeled Fengate's 2020 release as close-date evidence.
- Source reviewed: https://fengate.com/news/fengate-acquires-freeport-energy-center-from-calpine
- Rationale: Fengate announced on October 21, 2020 that it achieved financial close on the acquisition of Freeport Energy Center from Calpine. The facility's 2007 commercial operation date and later Freeport Power activity do not reset the investment year.

### Morris Cogeneration Facility - Fengate Asset Management
- Decision: kept top-level and owner investment year at 2023.
- Date basis: financial close.
- Change: reworded the 2022 Fengate/Ironclad relationship milestone as background, changed the December 2023 investment milestone category to Acquisition, and relabeled Fengate's close release.
- Source reviewed: https://fengate.com/news/fengate-reaches-financial-close-on-177-megawatt-cogeneration-facility-near-chicago-expanding-its-energy-transition-portfolio
- Rationale: Fengate announced on December 19, 2023 that it acquired Morris Cogeneration from Atlantic Power and Utilities. The 2022 Fengate/Ironclad operating relationship was not the acquisition of the named facility.

### Vertus Battery Storage - Fengate Asset Management
- Decision: kept top-level and owner investment year at 2025.
- Date basis: financial close.
- Change: reworded the 2023 Fengate/AOP development relationship milestone as background, added Fengate to the 2025 financial-close milestone, and relabeled the close source.
- Source reviewed: https://fengate.com/news/fengate-and-alpha-omega-power-achieve-financial-close-on-400mwh-battery-storage-project-in-texas
- Rationale: Fengate and Alpha Omega Power announced the closing of tax equity, construction debt, and term debt for Vertus on September 25, 2025, and Fengate stated it managed the investment for Fengate Infrastructure Fund IV. The 2023 development relationship should not drive the project investment year.

## Unchanged High-Conviction Confirmations

### Edgewater Midstream - EnCap Investments
- Decision: kept top-level and owner investment year at 2020.
- Date basis: announcement fallback.
- Sources reviewed:
  - https://www.efmidstream.com/news/edgewater-midstream-announces-commitment-encap-flatrock
  - https://www.edgewatermidstream.com/news-resources/edgewater-midstream-closes-acquisition-refined-products-logistics-assets-shell
  - https://www.shell.us/about-us/news-and-insights/media/2024-media-releases/shell-completes-sale-sinco-pipeline-system-colex-terminal-to-edgewater-midstream.html
- Rationale: EnCap Flatrock's January 7, 2020 initial equity commitment is the current owner's original investment evidence. The 2024 Shell Sinco/Colex transaction is a later platform acquisition.

## Unresolved / No Data Change

### Trenton Biogas - Equilibrium
- Stored year: 2017.
- Suspected year: 2017, but public ownership evidence remains incomplete.
- Sources reviewed:
  - https://trentonbiogas.com/
  - https://www.trentonrenewables.com/about-us
  - https://chptap.ornl.gov/profile/367/TrentonBiogas-Project_Profile.pdf
  - https://americanbiogascouncil.org/large-scale-food-waste-digestion-in-new-jersey-with-trenton-biogas/
- Why unresolved: the reviewed public sources describe the facility, technology, and operating timeline but do not clearly disclose Equilibrium's original investment date into the named Trenton Biogas project or current equity ownership structure.
- Evidence needed: a primary Equilibrium, Trenton Biogas/Trenton Renewables, project-finance, or regulatory source identifying Equilibrium as owner/investor and disclosing the original investment, acquisition, or financial-close date.
