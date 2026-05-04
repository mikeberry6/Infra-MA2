# Batch 25 - Ardian, Ares, Argo, Astatine, Axium Cleanup

Run date: 2026-05-02

## Reviewed Companies / Owners

- Clermont - Ardian
- Meade Pipeline Co. LLC - Ares Management
- Prime Data Centers - Ares Management
- Black Hills Colorado IPP - Argo Infrastructure Partners
- Hawaiʻi Gas - Argo Infrastructure Partners and APG Infrastructure
- Smoky Mountain hydropower portfolio - Argo Infrastructure Partners
- Thule Energy Storage - Argo Infrastructure Partners
- PECO Pallet - Astatine Investment Partners
- Twin Parking Holdings - Astatine Investment Partners
- DataBank - AustralianSuper, Swiss Life, DigitalBridge, IMCO
- Arbour Heights - Axium Infrastructure
- Aurora Solar Portfolio - Axium Infrastructure
- Autopistas Metropolitanas de Puerto Rico (Metropistas) - Axium Infrastructure

## Implemented Changes

### Clermont - Ardian

- Stored owner/top-level year: 2024
- Decision: kept 2024.
- Date basis: announcement fallback.
- Rationale: Ardian announced on March 25, 2024 that Ardian and Indigo Group created Clermont as a new Canadian venture to invest in parking assets. No separate public close date was found.
- Data changes: changed the Clermont formation milestone to `"Financing"` and added a labeled Ardian announcement-date source.
- Source: https://www.ardian.com/news-insights/press-releases/indigo-group-and-ardian-create-clermont-new-venture-accelerate-growth

### Meade Pipeline Co. LLC - Ares Management

- Stored owner/top-level year: 2025
- Decision: kept 2025.
- Date basis: announced-as-acquired close wording.
- Rationale: Ares announced on September 29, 2025 that Ares Infrastructure Opportunities funds had acquired 100% of Meade Pipeline from XPLR Infrastructure. Sidley separately described the matter as Ares' acquisition.
- Data changes: changed the Ares milestone to `"Acquisition"`, used the precise September 29, 2025 date, and added a labeled close-date source.
- Sources:
  - https://ir.aresmgmt.com/news/ares-management-acquires-meade-pipeline-to-enhance-energy-infrastructure-portfolio/dcd45edc-42e0-48c5-bfc3-cb04de0bad4b
  - https://www.nasdaq.com/press-release/ares-management-acquires-meade-pipeline-enhance-energy-infrastructure-portfolio-2025
  - https://www.sidley.com/en/newslanding/newsannouncements/2025/09/sidley-represents-ares-management-in-its-us%241-billion-acquisition-of-meade-pipeline-co-llc

### Prime Data Centers - Ares Management

- Stored owner/top-level year: 2025
- Decision: kept 2025.
- Date basis: regulatory clearance / investment-date fallback.
- Rationale: The European Commission decision dated March 18, 2025 states that Ares, Macquarie, and Data Realty Group would acquire joint control over Prime Data Centers. No public completion date was found in the reviewed sources.
- Data changes: changed the same-year milestone to `"Acquisition"`, dated it March 18, 2025, and added a labeled investment-date source.
- Source: https://ec.europa.eu/competition/mergers/cases1/202512/M_11843_10567975_126_3.pdf

### Black Hills Colorado IPP - Argo Infrastructure Partners

- Stored owner/top-level year: 2016
- Decision: kept 2016.
- Date basis: close date.
- Rationale: Black Hills' June 30, 2016 Form 10-Q states that Black Hills Electric Generation sold a 49.9% noncontrolling interest in Black Hills Colorado IPP to AIA Energy North America LLC on April 14, 2016. Earlier February 2016 materials were announcement evidence only.
- Data changes: added labeled announcement and close-date sources and changed the 2031 tolling milestone date to a non-future `"Contract term"` label so it does not appear to be a pending investment event.
- Sources:
  - https://www.sec.gov/Archives/edgar/data/1130464/000113046416000173/form8-ksgpurchasecompletion.htm
  - https://www.sec.gov/Archives/edgar/data/1130464/000113046416000209/bkh10qq22016.htm

### Hawaiʻi Gas - Argo Infrastructure Partners

- Stored Argo owner/top-level year: 2022
- Decision: kept 2022.
- Date basis: close date.
- Rationale: Hawaiʻi Gas announced on July 21, 2022 that ownership transferred to an Argo affiliate after Hawaiʻi PUC approval. The July 2021 release remains announcement evidence only.
- Data changes: added a labeled Argo close-date source. The APG owner row was not changed because public sources reviewed did not clearly tie APG/AIA Montana to Hawaiʻi Gas.
- Sources:
  - https://www.hawaiigas.com/posts/hawaii-gas-to-be-acquired-by-argo-infrastructure-partners
  - https://www.hawaiigas.com/posts/acquisition-of-hawai-i-gas-paves-way-for-clean-energy-transformation

### PECO Pallet - Astatine Investment Partners

- Stored owner/top-level year: 2020
- Decision: kept 2020.
- Date basis: close date.
- Rationale: PECO announced the Alinda/USS definitive agreement on October 5, 2020, and Holland & Knight states the acquisition closed on October 9, 2020. Alinda is Astatine's predecessor branding for this investment history.
- Data changes: changed the PECO acquisition milestones to `"Acquisition"`, explicitly named Astatine predecessor Alinda, and added labeled announcement and close-date sources.
- Sources:
  - https://www.pecopallet.com/press-release/acquisition-2020-10-5/
  - https://www.hklaw.com/en/news/pressreleases/2020/10/holland-and-knight-advises-on-joint-acquisition-of-peco-pallet

### Arbour Heights - Axium Infrastructure

- Stored owner/top-level year: 2019
- Decision: kept 2019.
- Date basis: close date.
- Rationale: Axium's July 3, 2019 release says the Revera-Axium joint venture closed the acquisition of Arbour Heights. The earlier 2017/2018 Revera-Axium platform events are background and should not drive the investment year for the separately listed Arbour Heights row.
- Data changes: reworded earlier platform history as background, changed the July 3, 2019 Arbour Heights milestone to `"Acquisition"`, and added a labeled close-date source.
- Source: https://www.axiuminfra.com/2019/07/03/july-3-2019-joint-venture-of-revera-inc-and-axium-infrastructure-expands-with-acquisition-of-arbour-heights-long-term-care-home-in-kingston-ontario/?lang=en

### Aurora Solar Portfolio - Axium Infrastructure

- Stored owner/top-level year: 2020
- Corrected owner/top-level year: 2019
- Date basis: close date.
- Rationale: Axium completed the acquisition of its initial 50% equity interest in the Aurora Solar portfolio from Mitsubishi on February 28, 2019. The 2020 Osaka Gas transaction was a follow-on purchase of the remaining 50% and should not reset the original Axium investment year.
- Data changes: changed top-level and owner `investmentYear` from 2020 to 2019, changed the 2019 milestone to `"Acquisition"`, and added a labeled close-date source.
- Source: https://www.axiuminfra.com/2019/03/01/february-28-2019-axium-infrastructure-acquires-50-equity-interest-in-a-101-mw-dc-solar-portfolio-located-in-ontario/?lang=en

## Unchanged High-Conviction Confirmations

### Smoky Mountain hydropower portfolio - Argo Infrastructure Partners

- Stored owner/top-level year: 2023
- Decision: kept 2023.
- Date basis: investment/regulatory evidence reviewed.
- Rationale: Public materials reviewed identify Smoky Mountain Holdings as a joint venture between Argo and Brookfield. A White & Case FERC agenda summary states that the transaction by which an Argo affiliate would acquire 50% of Brookfield Smoky Mountain Holdings received FERC approval on February 7, 2023. The 2012 Brookfield acquisition is historical platform ownership and does not reset Argo's 2023 investment year.
- Sources:
  - https://www.whitecase.com/insight-alert/summary-ferc-meeting-agenda-january-2024
  - https://www.businesswire.com/news/home/20250814980122/en/Smoky-Mountain-Holdings-LLC-Closes-Landmark-%24435-Million-Financing

### DataBank - Swiss Life

- Stored Swiss Life owner year: 2022
- Decision: kept 2022.
- Date basis: close date already in database.
- Rationale: Swiss Life's minority investment is separate from DigitalBridge's 2016 platform acquisition and AustralianSuper's 2024 equity raise. The audit false positive was caused by generic ownership-vehicle words such as "equity interest" and "investor consortium," not evidence that Swiss Life invested earlier.
- Data changes: no company data change. The audit script stopword list was tightened to suppress generic vehicle-token matches.
- Sources already in database:
  - https://fr.swisslife-am.com/en/home/news/france/corporate/company-news/2022/0617_databank.html
  - https://www.databank.com/resources/press-releases/databank-completes-first-phase-of-major-recapitalization/

## Unresolved Cases

### Hawaiʻi Gas - APG Infrastructure

- Current stored year: 2022
- Suspected year: 2022 if APG is indirectly invested through an Argo-managed vehicle, but not verified.
- Sources reviewed:
  - https://www.hawaiigas.com/posts/hawaii-gas-to-be-acquired-by-argo-infrastructure-partners
  - https://www.hawaiigas.com/posts/acquisition-of-hawai-i-gas-paves-way-for-clean-energy-transformation
  - https://www.duquesnelight.com/company/about/investors
- Why unresolved: Hawaiʻi Gas sources clearly support Argo's 2022 acquisition, but they do not clearly identify APG or AIA Montana as an owner of Hawaiʻi Gas. The Duquesne source ties AIA Montana to APG/CalSTRS in a different utility ownership structure, not Hawaiʻi Gas.
- Evidence needed: primary transaction or investor disclosure showing APG's ownership vehicle and original Hawaiʻi Gas investment date.

### Thule Energy Storage - Argo Infrastructure Partners

- Current stored year: 2020
- Suspected year: 2018, 2019, or 2020 depending on whether Argo's Ice Energy funding, Thule's acquisition of Ice Energy customer assets, or ACP Thule parentage is treated as the original current-owner investment.
- Sources reviewed:
  - https://www.globenewswire.com/news-release/2018/06/26/1529722/0/en/Ice-Energy-Announces-Long-Term-Funding-Agreement-with-Argo-Infrastructure-Partners.html
  - https://docs.cpuc.ca.gov/PublishedDocs/Efile/G000/M345/K698/345698025.PDF
  - https://www.energy-storage.news/ice-energy-acquired-thule-energy-storage-customer-assets-services-unaffected/
- Why unresolved: public materials show Argo funding Ice Energy in 2018, Thule buying customer assets in 2019, and ACP Thule/Argo parentage in 2020, but the sources reviewed do not cleanly establish the legal/current-owner acquisition date for the named Thule business.
- Evidence needed: acquisition agreement, bankruptcy asset-sale notice, CPUC ownership approval, or Argo/Thule release identifying when Argo-controlled Thule became the owner.

### Twin Parking Holdings - Astatine Investment Partners

- Current stored year: 2024
- Suspected year: unknown.
- Sources reviewed:
  - https://astatineip.com/investment/twin-parking-holdings/
  - https://astatineip.com/investments/
- Why unresolved: Astatine identifies Twin Parking Holdings as an active investment but does not disclose an acquisition date or original investment year in the reviewed public materials.
- Evidence needed: Astatine transaction announcement, property-level sale filing, lender document, or investor report disclosing the investment date.

### Autopistas Metropolitanas de Puerto Rico (Metropistas) - Axium Infrastructure

- Current stored year: 2020
- Suspected year: unknown.
- Sources reviewed:
  - https://www.axiuminfra.com/portfolio-assets/?lang=en
  - https://puertoricop3a.org/metropistas/
  - https://www.p3.pr.gov/highways-pr-22-pr-5/highways-pr-22-pr-5
  - https://www.metropistas.com/
- Why unresolved: public project and company pages describe the PR-22/PR-5 concession and current Metropistas role but do not disclose when Axium acquired its interest.
- Evidence needed: Axium acquisition announcement, concession ownership amendment, Puerto Rico P3 authority approval, or investor report showing Axium's acquisition date.

## Audit Script Note

- Added generic ownership-vehicle stopwords including `invest`, `equity`, `interest`, `stake`, `consortium`, `minority`, `majority`, `llc`, and `lp`. This reduced false earlier-investment matches caused by generic finance terms while preserving owner-name checks.

## Audit Notes

- Post-batch audit command: `npm run audit:portfolio-years`
- Post-batch result: 1,314 owner-company rows; 345 flagged rows remaining.
- Priority split after batch: 12 critical, 82 high, 230 medium, 21 low.
