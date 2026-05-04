# Batch 20 — BlackRock, Blackstone, Brookfield, and CC&L follow-up

Run date: 2026-05-02

## Scope

Reviewed the in-progress high-priority group from the prior batch:

- Gigapower — BlackRock
- Onyx Renewables — Blackstone
- Metergy Solutions — Brookfield Asset Management
- Service Experts — Brookfield Asset Management
- White River Hydro Project — CC&L

## Implemented Changes

### Gigapower — BlackRock

- Stored owner year: 2023
- Decision: kept 2023.
- Date basis: close date.
- Rationale: AT&T and BlackRock signed the definitive agreement on Dec. 23, 2022, but AT&T's launch release states that AT&T and BlackRock closed the joint venture to form Gigapower on May 11, 2023. The close year is therefore 2023.
- Data changes:
  - Reworded the 2022 milestone as a definitive-agreement event.
  - Reworded the 2023 milestone as the close/launch event.
  - Set both investment-related milestone categories to `"Financing"`.
  - Relabeled the AT&T launch release as `Close date source — BlackRock — Gigapower`.
  - Relabeled the Business Wire agreement release as `Announcement date source — BlackRock — Gigapower`.
- Sources:
  - https://about.att.com/story/2023/gigapower.html
  - https://www.businesswire.com/news/home/20221223005039/en/ATT-and-BlackRock-to-Form-Gigapower-Joint-Venture-A-Wholesale-Fiber-Services-Provider

### Metergy Solutions — Brookfield Asset Management

- Stored owner year: 2018
- Decision: kept 2018.
- Date basis: close date.
- Rationale: Brookfield Infrastructure completed its C$4.3 billion acquisition of Enercare on Oct. 16, 2018. The release identifies Enercare as including the Service Experts brands and the largest non-utility submeter provider business, supporting the 2018 Brookfield investment year for the submetering platform later branded Metergy.
- Data changes:
  - Added an Oct. 16, 2018 Brookfield acquisition milestone.
  - Added `Close date source — Brookfield Asset Management — Metergy Solutions`.
- Source:
  - https://bip.brookfield.com/press-releases/bip/brookfield-infrastructure-completes-c43-billion-acquisition-enercare-inc

### Service Experts — Brookfield Asset Management

- Stored owner year: 2018
- Decision: kept 2018.
- Date basis: close date.
- Rationale: Brookfield Infrastructure completed its acquisition of Enercare on Oct. 16, 2018, and the completion release specifically identifies Enercare as including the Service Experts brands.
- Data changes:
  - Added an Oct. 16, 2018 Brookfield acquisition milestone.
  - Added `Close date source — Brookfield Asset Management — Service Experts`.
- Source:
  - https://bip.brookfield.com/press-releases/bip/brookfield-infrastructure-completes-c43-billion-acquisition-enercare-inc

### White River Hydro Project — CC&L

- Previous stored owner year: 2024
- Corrected owner year: 2019
- Corrected top-level year: 2019
- Date basis: initial investment date.
- Rationale: CC&L Infrastructure's project page identifies March 2019 as the initial investment date for White River Hydro. The stored 2024 year reflected current listing/background materials rather than the original investment.
- Data changes:
  - Updated top-level `investmentYear` from 2024 to 2019.
  - Updated `owners[].investmentYear` from 2024 to 2019.
  - Relabeled the CC&L project page as `Investment date source — CC&L — White River Hydro Project`.
  - Changed the non-investment operating milestone category from `"Acquisition"` to `"Other"`.
- Sources:
  - https://cclinfrastructure.cclgroup.com/cases/white-river-hydro-project/
  - https://cclinfrastructure.cclgroup.com/our-investments/portfolio-overview/
  - https://www.owwa.ca/white-river-hydroelectric-project

## Unchanged High-Conviction Confirmations

### Onyx Renewables — Blackstone

- Stored owner year: 2014
- Decision: kept 2014.
- Date basis: announcement/formation source; no separate close date found.
- Rationale: Blackstone's Oct. 21, 2014 release announced its partnership to create Onyx Renewable Partners and states that Onyx would be owned by funds managed by Blackstone. The 2020/2021 SDCL transaction was a later partial sale/joint venture in which Blackstone retained a 50% stake, so it does not reset Blackstone's original investment year.
- Data changes:
  - Added `Investment date source — Blackstone — Onyx Renewables`.
- Sources:
  - https://www.blackstone.com/news/press/blackstone-teams-with-former-solops-management-team-to-fund-utility-scale-renewables-development-company/
  - https://www.milbank.com/en/news/milbank-advises-blackstone-and-onyx-renewable-partners-on-sale-and-joint-venture-with-sdcl.html

## Unresolved Cases

- None in this batch. Onyx remains audit-flagged for later-close language because the audit cannot distinguish Blackstone's original 2014 formation from the later 2021 SDCL partial sale, but the reviewed evidence supports leaving the stored Blackstone year unchanged.

## Audit Notes

- Extended the audit script's firm-name matching so acronym-only owners such as `CC&L` are recognized in milestone text. This removed false-positive firm-attribution flags without changing the investment-year evidence standard.
- Post-batch audit command: `npm run audit:portfolio-years`
- Post-batch result: 1,314 owner-company rows; 388 flagged rows remaining.
- Priority split after batch: 12 critical, 100 high, 254 medium, 22 low.
