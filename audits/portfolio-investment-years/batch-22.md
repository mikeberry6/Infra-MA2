# Batch 22 — Amber Infrastructure flagged rows

Run date: 2026-05-02

## Scope

Reviewed all remaining Amber Infrastructure flagged rows:

- Alberta Schools Alternative Procurement I
- Durham Region Courthouse
- Euryalus Solar Portfolio
- Granite Solar Portfolio
- Heelstone Solar Portfolio
- Maine International Cold Storage Facility
- Milford Solar Project
- Olympos Solar Portfolio
- Travis County Civil and Family Courts Facility

## Implemented Changes

### US Solar Fund assets — Amber Infrastructure

Corrected the US Solar Fund portfolio rows where the stored 2023 year reflected Amber's appointment as USF investment manager rather than USF's original acquisition/financial close for the named asset. Under the investment-date rule, the manager appointment is a later management change and should not reset the asset investment year.

#### Euryalus Solar Portfolio

- Previous stored year: 2023
- Corrected owner/top-level year: 2020
- Date basis: close date.
- Rationale: US Solar Fund announced binding agreements in May 2020 and the row already reflected a June 2020 acquisition close. USF's page states the portfolio was commissioned in July 2020.
- Data changes: updated top-level and owner year to 2020; reworded the 2020 acquisition milestone to tie USF to current Amber management; changed Amber's Dec. 2023 manager appointment to `"Other"`; added labeled close-date source.
- Source: https://www.ussolarfund.co.uk/portfolio/acquisition-five

#### Granite Solar Portfolio

- Previous stored year: 2023
- Corrected owner/top-level year: 2020
- Date basis: close date.
- Rationale: US Solar Fund's portfolio page states USF acquired five projects on Jan. 2, 2020 and closed the remaining three on Jan. 13, 2020.
- Data changes: updated top-level and owner year to 2020; aligned 2020 acquisition milestone and labeled close-date source.
- Source: https://www.ussolarfund.co.uk/portfolio/granite

#### Heelstone Solar Portfolio

- Previous stored year: 2023
- Corrected owner/top-level year: 2020
- Date basis: close date.
- Rationale: USF materials and transaction reporting state USF acquired the 22-project Heelstone portfolio in March 2020. The later 2023 Amber manager appointment and 2023 tax-equity buyout do not reset the original asset investment year.
- Data changes: updated top-level and owner year to 2020; added USF acquisition-four source and labeled close-date source.
- Source: https://www.ussolarfund.co.uk/portfolio/acquisition-four

#### Milford Solar Project

- Previous stored year: 2023
- Corrected owner/top-level year: 2019
- Date basis: close date.
- Rationale: US Solar Fund states it closed the acquisition and financing of 100% of the cash equity interest in Milford Solar on Sept. 2, 2019. Commercial operation in 2020 and Amber's 2023 manager appointment are later events.
- Data changes: updated top-level and owner year to 2019; changed the investment milestone category to `"Acquisition"`; added labeled close-date source.
- Source: https://www.ussolarfund.co.uk/portfolio/milford-solar-plant

#### Olympos Solar Portfolio

- Previous stored year: 2023
- Corrected owner/top-level year: 2019
- Date basis: announcement / financial-close fallback.
- Rationale: US Solar Fund's portfolio page states USF announced the acquisition and financing on Dec. 23, 2019 and that construction began immediately after financial close. Public material reviewed supports 2019, not Amber's later 2023 management appointment.
- Data changes: updated top-level and owner year to 2019; aligned same-year acquisition milestone and labeled source.
- Source: https://www.ussolarfund.co.uk/portfolio/olympos

Management-change support for the USF rows:

- https://www.amberinfrastructure.com/news-and-insights/press-releases/amber-appointed-us-solar-fund-plc-investment-manager/
- https://www.amberinfrastructure.com/funds/us-solar-fund-plc/

### Alberta Schools Alternative Procurement I — Amber Infrastructure

- Stored owner/top-level year: 2008
- Decision: kept 2008.
- Date basis: financial close.
- Rationale: INPP/Babcock & Brown Public Partnerships materials state financial close on the original Alberta Schools investment occurred in September 2008. The 2013 additional stake acquisition was a follow-on and does not reset the original investment year.
- Data changes: reworded the same-year milestone to identify BBPP / INPP and current Amber advisement; changed category to `"Financing"`; added close and announcement source labels.
- Sources:
  - https://www.investegate.co.uk/announcement/rns/international-public-partnerships-ltd---inpp/additional-investment-in-alberta-schools/3501487
  - https://www.investegate.co.uk/announcement/rns/international-public-partnerships-ltd---inpp/alberta-schools-acquisition/1790414

### Durham Region Courthouse — Amber Infrastructure

- Stored owner/top-level year: 2007
- Decision: kept 2007.
- Date basis: financial close.
- Rationale: Infrastructure Ontario identifies financial close on Mar. 2, 2007, and INPP/Babcock & Brown Public Partnerships announced acquisition of 100% of the equity in Access Justice Durham on the same date.
- Data changes: reworded same-year investment milestone to identify BBPP / INPP and current Amber advisement; added close-date source labels.
- Sources:
  - https://www.investegate.info/announcement/rns/international-public-partnerships-ltd---inpp/durham-courthouse-canada/807340
  - https://www.infrastructureontario.ca/en/what-we-do/projectssearch/durham-region-courthouse/

### Maine International Cold Storage Facility — Amber Infrastructure

- Previous stored year: 2021
- Corrected owner/top-level year: 2022
- Date basis: ground-lease / execution event.
- Rationale: Public sources reviewed describe 2021 as a planning/consortium period. Hunt's Aug. 23, 2022 release states that signing of the 50-year ground lease between Maine Port Authority and Maine International Cold Storage Facility cleared the path to break ground, and identifies Amber as a developer with TFIC. This is the first clear project execution/investment event found.
- Data changes: updated top-level and owner year to 2022; corrected description and milestones from 2021 groundbreaking to the 2022 ground-lease/breakground basis; added labeled investment-date source.
- Source: https://www.huntcompanies.com/news/groundbreaking-announcement-for-state-of-the-art-cold-storage-facility-on-portland-waterfront

### Travis County Civil and Family Courts Facility — Amber Infrastructure

- Stored owner/top-level year: 2019
- Decision: kept 2019.
- Date basis: financial close.
- Rationale: Public transaction sources state the Hunt and Amber-led consortium reached financial close in April/May 2019; the 2018 Hunt release was selection/exclusive-negotiation evidence only.
- Data changes: reworded 2019 milestone to name Hunt and Amber; added close-date source labels.
- Sources:
  - https://www.huntcompanies.com/news/hunt-led-team-secures-project-for-the-new-courts-facility-in-travis-county-texas
  - https://www.infrapppworld.com/update/fc-for-courthouse-p3-project-in-travis-county
  - https://www.nortonrosefulbright.com/en/news/ce351501/norton-rose-fulbright-closes-public-private-partnership-deal-for-new-travis-county-courthouse

## Unresolved Cases

- None in this batch.

## Audit Notes

- Post-batch audit command: `npm run audit:portfolio-years`
- Post-batch result: 1,314 owner-company rows; 374 flagged rows remaining.
- Priority split after batch: 12 critical, 94 high, 247 medium, 21 low.
- All Amber Infrastructure rows are now clear of current audit flags.
