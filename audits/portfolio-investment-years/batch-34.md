# Portfolio Investment-Year Verification — Batch 34

Run date: 2026-05-02

Post-batch audit:
- Command: `npm run audit:portfolio-years`
- Rows: 1,311 owner-company rows
- Flagged rows: 280

## Reviewed Companies / Owners

### CoreSite — Stonepeak
- Decision: updated wording/source labels; investment year remains 2022.
- Date basis: close date. CoreSite's October 27, 2022 release says Stonepeak's initial $2.5 billion investment closed in August 2022 and the October upsize closed on October 20, 2022.
- Implemented changes:
  - Added an August 2022 financing milestone for Stonepeak's completed initial investment.
  - Reworded American Tower's 2021 CoreSite acquisition as pre-Stonepeak background.
  - Relabeled sources as announcement and close-date evidence.
- Sources:
  - https://stonepeak.com/news/american-tower-partners-with-stonepeak-in-u-s-data-center-business
  - https://www.coresite.com/news/stonepeak-upsizes-invesment-in-american-towers-data-center-business
- Rationale: Stonepeak's original entry into the CoreSite/American Tower U.S. data-center business was in 2022; American Tower's 2021 CoreSite acquisition is background and should not drive Stonepeak's investment year.

### LOGISTEC — Stonepeak
- Decision: updated milestone attribution/source labels; investment year remains 2024.
- Date basis: close date. Stonepeak's January 9, 2024 release states Blue Wolf completed the LOGISTEC acquisition in partnership with Stonepeak.
- Implemented changes:
  - Reworded the January 2024 close milestone to name Stonepeak and Blue Wolf.
  - Changed the 2023 agreement milestone to Acquisition.
  - Relabeled Stonepeak/LOGISTEC close sources.
- Sources:
  - https://stonepeak.com/news/blue-wolf-capital-finalizes-acquisition-of-logistec-corporation-in-partnership-with-stonepeak
  - https://www.logistec.com/en_ca/news/blue-wolf-capital-partners-finalizes-acquisition-of-logistec-corporation-in-partnership-with-stonepeak/
- Rationale: the 2023 agreement is historical announcement evidence; the 2024 close supports the stored investment year.

### Ørsted U.S. Onshore Wind Portfolio Partnership — Stonepeak
- Decision: updated close milestone/source label; investment year remains 2024.
- Date basis: close date. Stonepeak's 2025 awards release says it completed the acquisition of an 80% interest in the four-project U.S. onshore wind portfolio during 2024.
- Implemented changes:
  - Added a 2024 acquisition milestone for the completed Stonepeak acquisition.
  - Reclassified the 2025 awards-materials reference as Other so it does not imply a 2025 investment year.
  - Relabeled the Stonepeak awards release as close-date evidence.
- Sources:
  - https://stonepeak.com/news/orsted-divests-share-of-four-us-onshore-wind-farms-to-stonepeak
  - https://stonepeak.com/news/stonepeak-wins-three-infrastructure-investor-awards-for-2024
- Rationale: announcement was in March 2024 and later Stonepeak disclosure supports completion during 2024.

### Repsol U.S. Renewables Portfolio — Stonepeak
- Decision: updated source label and background milestone wording; investment year remains 2025.
- Date basis: announcement fallback. Repsol announced on April 29, 2025 that Stonepeak agreed to acquire a 46.3% stake; the release expected closing in Q3 2025, and no inspected source disclosed a completion date.
- Implemented changes:
  - Relabeled the Repsol release as announcement-date evidence.
  - Reworded Jicarilla/Frye operating-history milestones so they are not treated as Stonepeak investment events.
- Sources:
  - https://www.repsol.com/en/press-room/press-releases/2025/repsol-allies--stonepeak-solar-storage-portfolio-first-us-renewables-partnership/index.cshtml
- Rationale: clear 2025 agreement evidence exists, but no close date was found in the reviewed sources.

### Astound Broadband — Stonepeak
- Decision: unchanged high-conviction confirmation.
- Date basis: close date. Astound's release supports the August 2021 closing of Stonepeak's acquisition.
- Implemented changes:
  - No data change; audit parser now recognizes "announced the closing" as close evidence.
- Sources:
  - https://www.astound.com/business/about/news/stonepeak-closes-acquisition-of-astound-broadband/
- Rationale: November 2020 was the agreement announcement; August 2021 is the correct Stonepeak investment year.

### Phoenix Tower International — Manulife / Wren House / Blackstone
- Decision: corrected Wren House owner year; Manulife and Blackstone years remain 2018 and 2022 respectively.
- Date basis:
  - Manulife: 2018 acquisition milestone retained as primary displayed owner basis.
  - Blackstone: January 2022 investment/acquisition announcement fallback.
  - Wren House: October 2022 investment announcement fallback.
- Implemented changes:
  - Wren House owner investment year changed from 2024 to 2022.
  - Blackstone 2022 stake purchase milestone category changed to Acquisition.
  - 2018 Manulife milestone reworded to avoid treating a prior seller as current-owner evidence.
  - 2024/2025/2026 continuation/investor-list milestones reclassified as Other where they did not represent original owner entry.
  - Added clearly labeled Wren House and Blackstone investment-date sources.
- Sources:
  - https://www.phoenixintnl.com/news/wren-house-invests-in-phoenix-tower-international
  - https://www.phoenixintnl.com/news/blackstone-infrastructure-partners-acquires-stake-in-phoenix-tower-international
  - https://www.blackstone.com/news/press/blackstone-infrastructure-partners-acquires-stake-in-phoenix-tower-international/
- Rationale: Wren House entered PTI in October 2022, not in the 2024 Grain/BlackRock financing. Top-level year remains 2018 because the displayed primary owner remains Manulife in the current row.

### Direct ChassisLink, Inc. — Wren House / OMERS
- Decision: corrected Wren House owner year; OMERS remains 2022.
- Date basis:
  - Wren House: announcement fallback plus Wren House portfolio investment date.
  - OMERS: close date. OMERS Infrastructure later disclosed that the consortium acquired DCLI in December 2022.
- Implemented changes:
  - Wren House owner investment year changed from 2026 to 2022.
  - Reordered owners so Wren House aligns with the displayed primary owner.
  - Reworded the December 2022 milestone as completed consortium acquisition.
  - Reclassified later fleet-addition and portfolio-reference milestones as Other.
  - Added clearly labeled Wren House and OMERS investment-date sources.
- Sources:
  - https://www.whinfra.com/gic-omers-infrastructure-and-wren-house-to-acquire-direct-chassislink-inc/
  - https://www.whinfra.com/our-portfolio/direct-chassislink-inc-dcli/
  - https://www.omers.com/news/gic-omers-infrastructure-and-wren-house-to-acquire-direct-chassislink-inc
  - https://www.omersinfrastructure.com/news/omers-wins-m-and-a-award-for-dcli-investment
- Rationale: Wren House's original DCLI investment was part of the 2022 consortium acquisition, not a 2026 portfolio update.

### Petit Forestier Group — Wren House
- Decision: updated wording/source attribution; investment year remains 2024.
- Date basis: close date where available. Wren House announced the minority-stake agreement in April 2024; MarketScreener reported completion in H1 2024.
- Implemented changes:
  - Reworded the 2007 Sofina milestone as historical background.
  - Simplified ownership vehicle wording so the prior seller does not drive investment-year matching.
- Sources:
  - https://www.whinfra.com/petit-forestier-group-strengthens-long-term-shareholder-base-with-investment-from-wren-house/
  - https://www.marketscreener.com/quote/stock/SOFINA-SA-5960/news/Wren-House-Infrastructure-Management-Limited-completed-the-acquisition-of-33-62-stake-in-Petit-Fore-49476326/
- Rationale: Wren House's current-owner investment was the 2024 minority-stake transaction; Sofina's 2007 entry is historical only.

## Audit Tooling Notes

- Adjusted audit tokenization to ignore generic ownership-vehicle terms and pure numeric tokens that were creating false owner matches from percentages and years.
- Updated close-date parsing so "announced the closing" counts as close evidence.

## Unresolved Cases

- None in this batch.
