# Batch 30 - AIMCo, Argo, Axium, Generate, Grain

Run date: 2026-05-02

Audit status after batch:
- Rows reviewed by audit: 1,312 owner-company rows
- Flagged rows: 306
- Priority split: 11 critical, 46 high, 228 medium, 21 low
- Command: `npm run audit:portfolio-years`

## Implemented Changes

### Castle Rock Ridge II Wind Farm - AIMCo
- Decision: corrected top-level investment year from 2017 to 2018; owner year remained 2018.
- Date basis: announcement fallback.
- Change: converted the February 2018 sale milestone to an AIMCo acquisition milestone and relabeled the Enel PDF as owner-specific announcement evidence.
- Sources reviewed:
  - https://www.enel.com/content/dam/enel-common/press/en/2018---febr/EGP%20Alberta%20BSO%20ENG.pdf
  - https://www.aimco.ca/insights/aimco-partnership-with-enel-green-power
- Rationale: Enel signed the partnership agreement with AIMCo on February 7, 2018 and expected closing later, but no reviewed public source disclosed the close date. The top-level year now aligns with the primary AIMCo owner row.

### Gemini Solar + Storage - APG Infrastructure and Quinbrook
- Decision: kept APG's primary displayed owner year at 2022 and Quinbrook Valley of Fire Fund owner year at 2024; removed a duplicative active Quinbrook owner row that reflected prior majority ownership rather than the current Valley of Fire fund ownership.
- Date basis: APG announcement fallback; Quinbrook Valley of Fire close date.
- Change: relabeled APG's source as announcement-date evidence, retained the 2024 Quinbrook close source, and reworded a 2022 debt/tax-equity financing milestone so it does not drive the Valley of Fire owner year.
- Sources reviewed:
  - https://www.quinbrook.com/news-insights/quinbrook-and-primergy-solar-partner-with-apg-on-gemini-solar-storage-project/
  - https://www.quinbrook.com/news-insights/quinbrook-closes-600m-solarstorage-continuation-fund/
  - https://www.quinbrook.com/portfolio/gemini/
- Rationale: APG agreed to acquire 49% in October 2022. Quinbrook disclosed on April 4, 2024 that the Valley of Fire Fund acquired 51% of Gemini from LCPF and other equity holders. The pre-continuation majority-ownership row was not a separate current owner.

### Smoky Mountain hydropower portfolio - Argo Infrastructure Partners
- Decision: kept top-level and owner investment year at 2023.
- Date basis: close date from secondary transaction source where primary close disclosure was not found.
- Change: reworded the 2012 Brookfield history as prior-owner background and added an owner-specific close-date source label for Argo's 2023 50% acquisition.
- Sources reviewed:
  - https://app.mergerlinks.com/transactions/2023-03-17-brookfield-378mw-us-hydroelectric-portfolio/service-providers
  - https://www.businesswire.com/news/home/20250814980122/en/Smoky-Mountain-Holdings-LLC-Closes-Landmark-%24435-Million-Financing
  - https://www.waterpowermagazine.com/news/tva-signs-10-year-ppa-with-argo-and-brookfields-smoky-mountain-hydro-facilities/
- Rationale: Argo's current ownership began with the 2023 acquisition of a 50% interest in the Brookfield hydro portfolio. Brookfield's 2012 Tapoco acquisition predates Argo and should remain historical background only.

### Thule Energy Storage - Argo Infrastructure Partners
- Decision: corrected top-level and owner investment year from 2020 to 2018.
- Date basis: investment/funding announcement.
- Change: recast the June 2018 Argo/Ice Energy funding agreement as the investment milestone, relabeled the source, and aligned owner/top-level years.
- Sources reviewed:
  - https://www.globenewswire.com/news-release/2018/06/26/1529722/0/en/Ice-Energy-Announces-Long-Term-Funding-Agreement-with-Argo-Infrastructure-Partners.html
  - https://docs.cpuc.ca.gov/PublishedDocs/Efile/G000/M345/K698/345698025.PDF
- Rationale: Ice Energy announced a major Argo funding agreement in June 2018, and the 2020 CPUC filing states Ice Bear SPV #1 was acquired by its current owners in June 2018. The 2020 filing is evidence of ownership, not the original investment date.

### Autopistas Metropolitanas de Puerto Rico (Metropistas) - Axium Infrastructure
- Decision: kept top-level and owner investment year at 2020.
- Date basis: close date.
- Change: added an April 2020 Axium acquisition milestone and a close-date source label.
- Source reviewed: https://www.winston.com/en/insights-news/proximo-americas-deals-of-the-year-2020
- Rationale: Winston & Strawn states Axium agreed to acquire a 19.6% indirect interest in Metropistas from Ullico and that the transaction closed in April 2020.

### Stem Energy Storage Asset SPVs - Generate Capital
- Decision: corrected top-level and owner investment year from 2020 to 2016.
- Date basis: project-financing evidence.
- Change: added an August 2016 Generate project-financing milestone, relabeled the investment-date source, and aligned owner/top-level years.
- Sources reviewed:
  - https://www.energy-storage.news/stem-takes-project-funding-to-us350-million/
  - https://generatecapital.com/investment/
- Rationale: public reporting in August 2016 identified Generate Capital as Stem's primary project-financing provider, and Generate's own investment materials describe Stem SPVs. The later SCE/LCR program was not the first Generate-backed Stem SPV activity.

### Viridis Initiative - Generate Capital
- Decision: kept top-level and owner investment year at 2023.
- Date basis: joint venture launch / investment formation.
- Change: reworded the 2019 predecessor school-district project as background, changed the June 2023 Viridis launch milestone to Financing, and relabeled the McKinstry release as investment-date evidence.
- Source reviewed: https://www.mckinstry.com/news/generate-capital-and-mckinstry-launch-viridis-initiative-to-accelerate-decarbonization-of-institutional-buildings/
- Rationale: Viridis was formally launched as a Generate/McKinstry joint venture in 2023. The 2019 school-district work was a predecessor commercial relationship, not the current named venture's investment date.

### Network Wireless Solutions - Grain
- Decision: kept top-level and owner investment year at 2021.
- Date basis: close/completed acquisition wording.
- Change: relabeled Grain's June 2021 source as close-date evidence and reworded the later Gap Wireless acquisition so it is not treated as Grain's original investment into NWS.
- Source reviewed: https://graingp.com/news/grain-management-announces-acquisition-of-nws/
- Rationale: Grain announced on June 2, 2021 that it had acquired NWS. The 2022 Gap Wireless transaction was a later platform expansion.

### NewLevel - Grain
- Decision: kept top-level and owner investment year at 2017.
- Date basis: FCC auction acquisition evidence.
- Change: reworded the 2016 auction-entity formation as preparatory background, changed the 2017 NewLevel license acquisition milestone to Acquisition, and labeled Grain's portfolio page as investment-date evidence.
- Source reviewed: https://graingp.com/investments/
- Rationale: Grain states that NewLevel was formed to participate in the FCC 2016 incentive auction and that Grain acquired 26 spectrum licenses through that auction. The licenses emerged from the 2017 auction process; 2016 entity formation alone was not the investment into the spectrum portfolio.

## Unresolved / No Data Change

### Twin Parking Holdings - Astatine Investment Partners
- Stored year: 2024.
- Suspected year: unknown.
- Sources reviewed:
  - https://astatineip.com/investment/twin-parking-holdings/
  - https://astatineip.com/investments/
- Why unresolved: Astatine confirms current ownership and describes the three-garage Minneapolis platform, but the reviewed public pages do not disclose the acquisition, close, or announcement date.
- Evidence needed: an Astatine, seller, adviser, property-record, or financing source disclosing when Astatine acquired or formed Twin Parking Holdings.

### Cambrian Innovation Water Asset SPVs - Generate Capital
- Stored year: missing.
- Suspected year: 2015 or 2016, but evidence is not precise enough.
- Sources reviewed:
  - https://generatecapital.com/investment/
  - https://generatecapital.com/generate-capital-established-over-150-million-of-innovative-infrastructure-financing-programs-in-2015/
  - https://www.mintz.com/industries-practices/case-studies/mintz-helps-cambrian-innovation-generate-capital
  - https://cambrianinnovation.com/news/cambrian-innovation-launches-30m-fund-to-finance-distributed-clean-water-solutions
- Why unresolved: Generate's investment archive confirms a jointly owned Cambrian project-based SPV and a $15 million investment, but the reviewed sources do not clearly date Generate's original investment into the named SPV.
- Evidence needed: a Generate, Cambrian, financing, or legal source tying the Generate/Cambrian SPV to a specific close, commitment, or launch date.

### Tower Investments I - Grain
- Stored year: missing.
- Suspected year: unknown.
- Sources reviewed:
  - https://graingp.com/investments/
  - https://graingp.com/
  - https://www.linkedin.com/company/grain-management-llc/
- Why unresolved: Grain's portfolio page confirms the current Tower Investments I portfolio and its approximate tower count but does not disclose formation, acquisition, or close date.
- Evidence needed: a Grain, seller, tower transaction, FCC, or financing source disclosing when Grain first acquired or formed Tower Investments I.
