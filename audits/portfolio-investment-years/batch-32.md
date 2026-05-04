# Portfolio Investment-Year Verification — Batch 32

Date: 2026-05-02

Audit after batch:
- Rows reviewed by audit: 1,312 owner-company rows
- Remaining flagged rows: 297

## Implemented Changes

### Kalaeloa Partners, L.P. — Harbert Management Corp (Harbert Infra / Gulf Pacific)
- Stored year before/after: 2023 / 2023
- Date basis: close date
- Change: Reclassified the July 31, 2023 sale milestone as `Acquisition`, relabeled the PSEG source as `Close date source — Harbert Management Corp (Harbert Infra / Gulf Pacific) — Kalaeloa Partners, L.P.`, and reworded the 1997 historical milestone so it documents plant operations rather than implying current-owner entry.
- Sources reviewed:
  - https://nj.pseg.com/newsroom/newsrelease368
  - https://www.ililani.media/2025/03/kalaeloa-partners-owner-acquires.html
- Rationale: PSEG’s release states that its 50% sale to Harbert Infrastructure Fund VI was completed as of July 31, 2023. Earlier plant history is not the current Harbert fund’s investment date.

### Duquesne University Forbes Avenue Student Housing — Harrison Street
- Stored year before/after: 2022 / 2022
- Date basis: announcement fallback
- Change: Relabeled the Harrison Street source as `Announcement date source — Harrison Street — Duquesne University Forbes Avenue Student Housing` and reworded the 2018 Brottier Hall background milestone to avoid conflating a broader campus partnership with the Forbes Avenue project investment.
- Sources reviewed:
  - https://harrisonst.com/duquesne-university-announces-new-student-apartment-building-in-partnership-with-harrison-street-and-radnor-property-group/
  - https://www.duq.edu/about/news/articles/2022/12/duquesne-university-announces-new-student-apartment-building-on-forbes-avenue.php
- Rationale: The reviewed disclosures announce the Forbes Avenue project on Dec. 22, 2022 and identify it as the third campus project. No public close date was found in the reviewed sources, so announcement fallback remains appropriate.

### Yusen Terminals LLC — Macquarie Asset Management
- Stored year before/after: 2014 / 2015
- Date basis: close date
- Change: Updated the top-level and owner investment years to 2015, added a Feb. 2015 Macquarie/MIP III acquisition milestone, and added `Close date source — Macquarie Asset Management — Yusen Terminals LLC`.
- Sources reviewed:
  - https://www.marketscreener.com/quote/stock/NIPPON-YUSEN-KABUSHIKI-KA-6491189/news/Macquarie-Infrastructure-Partners-Inc-through-its-fund-Macquarie-Infrastructure-Partners-III-comple-38456438/
  - https://www.macquarie.com/my/en/about/news/2023/macquarie-infrastructure-partners-iii-completes-sales-of-ceres-terminals.html
  - https://www.one-line.com/en/news/one-strengthens-global-presence-terminal-acquisitions-us-west-coast-and-rotterdam
- Rationale: Public transaction reporting states that MIP III completed its 49% acquisition of NYK Ports, the holding company for Yusen Terminals, in February 2015. The stored 2014 year reflected the agreement/signing year and was replaced with the completion year.

### Portfolio Audit Script
- Change: Added generic ownership-vehicle terms `portfolio`, `real`, and `risk` to the audit stopword list.
- Rationale: These words caused false owner matches in multi-owner records, especially Generate Capital / AustralianSuper, where an earlier QIC-specific milestone was incorrectly treated as an AustralianSuper signal because the owner vehicle included generic portfolio wording.

## Unchanged High-Conviction Confirmations

### Generate Capital — AustralianSuper
- Stored year before/after: 2021 / 2021
- Date basis: close date
- Sources reviewed:
  - https://www.businesswire.com/news/home/20210719005233/en/Generate-Closes-%242-Billion-Equity-Raise-from-Global-Institutional-Investors-to-Accelerate-and-Scale-Sustainable-Infrastructure-and-Climate-Solutions
  - https://www.harbert.net/assets/press-releases/harbert-infrastructure-generate-press-release-july-19-2021.pdf
- Rationale: Generate’s July 19, 2021 closing announcement identifies AustralianSuper as an existing investor that led the $2 billion equity raise with QIC. The earlier 2019 milestone belongs to QIC’s separate investment-date disclosure, not AustralianSuper’s current reviewed row.

## Unresolved Cases

### Chester County Hyperscale Data Center — Harrison Street
- Current stored year: missing
- Suspected year: 2022 if Harrison Street participated at land acquisition, but not publicly verified.
- Sources reviewed:
  - https://www.datacenterdynamics.com/en/news/1547-csr-planning-2-million-sq-ft-150mw-campus-outside-philadelphia-pennsylvania/
  - https://www.datacenterdynamics.com/en/news/1547-csr-seeks-to-raise-250m-for-data-center-fund-report/
  - https://www.1547realty.com/resource/fifteenfortyseven-critical-systems-realty-unveils-details-on-its-hyperscale-data-center-development-project-in-pennsylvania/
  - https://www.businesswire.com/news/home/20240116194541/en/fifteenfortyseven-Critical-Systems-Realty-Unveils-Details-on-its-Hyperscale-Data-Center-Development-Project-in-Pennsylvania
- Why unresolved: The public record reviewed identifies 1547 and Green Fig as the 2022 land acquirers and development partners. It shows a broader Harrison Street / 1547 relationship, but not a clear Harrison Street project-level investment date into the Chester County campus.
- Evidence needed: A Harrison Street, 1547, fund, filing, or project document confirming when Harrison Street invested in or acquired an interest in the Chester County project.
