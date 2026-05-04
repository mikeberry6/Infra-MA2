# Batch 28 - CPP/OTPP, Stonepeak, ECP, Aurora

Run date: 2026-05-02

Audit status after batch:
- Rows reviewed by audit: 1,313 owner-company rows
- Flagged rows: 323
- Priority split: 13 critical, 61 high, 228 medium, 21 low
- Command: `npm run audit:portfolio-years`

## Implemented Changes

### IDEAL - CPP Investments
- Decision: kept CPP Investments owner year and top-level year at 2020.
- Date basis: close / settlement date.
- Change: reworded the 2018 Pacifico Sur background milestone so it does not read as CPP's original investment into IDEAL itself.
- Sources reviewed:
  - https://www.cppinvestments.com/newsroom/ideal-cpp-investments-and-ontario-teachers-complete-the-expansion-of-mexican-infrastructure-partnership/
  - https://www.cppinvestments.com/newsroom/ideal-cppib-ontario-teachers-mexican-infrastructure-partnership/
- Rationale: CPP's IDEAL share investment settled in April 2020. The 2016 and 2018 toll-road partnership events were earlier related-asset transactions, not CPP's investment into the IDEAL platform row.

### Pacifico Sur - CPP Investments and OTPP
- Decision: kept both owner years at 2018.
- Date basis: announcement fallback.
- Change: added OTPP abbreviation to the same-year milestone wording, reclassified a 2026 listing milestone as non-transactional background, and reworded the 2020 broader IDEAL milestone so it does not appear to be Pacifico Sur's close date.
- Sources reviewed:
  - https://www.cppinvestments.com/newsroom/ideal-cppib-and-ontario-teachers-expand-mexican-infrastructure-partnership-pacifico-sur-toll-road/
  - https://www.otpp.com/en-ca/about-us/news-and-insights/2018/ideal-cppib-and-ontario-teachers-expand-mexican-infrastructure-partnership-with-pacifico-sur-toll-road/
- Rationale: the public transaction announcement is dated October 2, 2018 and discloses Pacifico Sur ownership of 51% IDEAL, 29% CPP, and 20% Ontario Teachers'. No reviewed public source disclosed a later close date for Pacifico Sur itself.

### ExteNet Systems - Stonepeak
- Decision: corrected Stonepeak owner year from 2020 to 2015; top-level year remains Manulife's 2021 primary owner year.
- Date basis: announcement / recapitalization evidence.
- Change: reworded the 2015 Stonepeak milestone, added a Stonepeak investment-date source label, and updated the Stonepeak owner row.
- Source reviewed: https://www.prnewswire.com/news-releases/extenet-systems-announces-capital-restructuring-300117742.html
- Rationale: ExteNet's July 23, 2015 recapitalization announcement says Digital Bridge and Stonepeak committed or arranged more than $1 billion for the recapitalization and describes Stonepeak's investment in ExteNet. The 2020/2021 John Hancock/Manulife transaction was a later co-investor entry.

### Cornerstone Generation - ECP
- Decision: kept ECP owner year and top-level year at 2025.
- Date basis: ECP portfolio investment date.
- Change: added a July 2025 ECP investment milestone, changed the IURC approval milestone to non-transactional background, and labeled ECP's portfolio page as investment-date evidence.
- Source reviewed: https://www.ecpgp.com/equity/portfolio/cornerstone-generation
- Rationale: ECP's portfolio page lists Cornerstone Generation with "Date of investment July 2025." The September 2024 Lightstone agreement was the announcement stage, and the later Talen sale process must not reset ECP's entry date.

### New Leaf Energy - ECP
- Decision: kept ECP owner year and top-level year at 2022.
- Date basis: close/completion date.
- Change: replaced the generic 2022 founding milestone with a July 28, 2022 completed spin-off and sale milestone, removed misleading transaction language from the 1980 Borrego history milestone, and labeled the ECP/Borrego completion release as close-date evidence.
- Sources reviewed:
  - https://www.ecpgp.com/about/news-and-insights/press-releases/2022/borrego-completes-spin-off-and-sale-of-solar-and-energy-storage-development-business-to-ecp
  - https://www.newleafenergy.com/press/borrego-completes-sale-of-development-business-to-ecp
- Rationale: Borrego and ECP disclosed that the spin-off and sale of Borrego's development business to ECP was completed on July 28, 2022 and that the new business would operate as New Leaf Energy.

### Triple Oak Power - ECP
- Decision: kept ECP owner year and top-level year at 2024.
- Date basis: announcement fallback.
- Change: replaced the unsupported December 2023 acquisition milestone with the January 9, 2024 announcement, corrected description language, and labeled the Triple Oak release as announcement-date evidence.
- Source reviewed: https://tripleoakpower.com/triple-oak-power-continues-growth-trajectory-with-new-ownership/
- Rationale: Triple Oak's January 9, 2024 release says ECP announced that it had acquired Triple Oak from EnCap Energy Transition Fund I and co-investors. No reviewed public source supplied a 2023 close date, so the stored 2024 year remains the high-conviction public date.

## Unresolved / No Data Change

### Aurora Sustainable Lands - EIG Global Energy Partners
- Stored year: 2022.
- Suspected year: 2022, but EIG-specific evidence is incomplete.
- Sources reviewed:
  - https://aurorasustainablelands.com/news/tfg-acquisition/
  - https://aurorasustainablelands.com/news/bluesource-sustainable-forests-company-is-now-aurora-sustainable-lands/
  - https://www.globenewswire.com/news-release/2022/11/02/2546812/0/en/Anew-and-OHA-Led-Investor-Consortium-Acquire-1-7-Million-Acre-Timberland-Portfolio-to-Expand-Improved-Forestry-Management-for-Climate-Action.html
  - https://www.kirkland.com/news/press-release/2022/11/kirkland-advises-bssf-on-fca-from-tfg-and-cr
- Why unresolved: the 2022 acquisition was completed by Blue Source Sustainable Forests Company, a joint venture with OHA-led investor backing. Aurora's 2023 rebrand release later identifies Aurora as a joint venture between Anew and equity investors led by OHA, AB CarVal, EIG, GenZero and others, but the reviewed sources do not clearly state EIG's original investment date or whether EIG was in the 2022 closing group.
- Evidence needed: a primary Aurora, EIG, OHA, or transaction document naming EIG in the original 2022 investor consortium or otherwise disclosing EIG's initial investment date.
