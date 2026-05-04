# Batch 23 — APG / Meridiam transport and Pattern follow-up

Run date: 2026-05-02

## Scope

Reviewed:

- Cross-Sound Cable Company, LLC — APG Infrastructure
- Gemini Solar + Storage — APG Infrastructure / Quinbrook
- I-66 Express Mobility Partners, LLC — APG Infrastructure
- LBJ Express — Meridiam / APG Infrastructure
- LBJ Infrastructure Group, LLC — APG Infrastructure
- North Tarrant Express — APG Infrastructure
- Pattern Energy Group LP — APG Infrastructure

## Implemented Changes

### Cross-Sound Cable Company, LLC — APG Infrastructure

- Stored owner year: 2015
- Decision: kept 2015.
- Date basis: close date.
- Rationale: Transaction reporting states Argo's AIA Energy North America vehicle completed the acquisition in August 2015 and identifies APG among the institutional investors backing the AIA Energy platform.
- Data changes: reworded 2015 milestone to identify APG; added `Close date source — APG Infrastructure — Cross-Sound Cable Company, LLC`.
- Source: https://www.infrapppworld.com/update/argo-infrastructure-partners-completes-acquisition-of-transmission-asset-in-new-york

### I-66 Express Mobility Partners, LLC — APG Infrastructure

- Stored owner year: 2017
- Decision: kept 2017.
- Date basis: financial close.
- Rationale: FHWA states financial close occurred on Nov. 9, 2017 and lists APG Group as an equity member of I-66 Express Mobility Partners.
- Data changes: updated milestone wording to name APG and added a labeled close-date source.
- Source: https://www.fhwa.dot.gov/ipd/project_profiles/va_transform_66.aspx

### LBJ Express — Meridiam / APG Infrastructure

- Stored owner years: 2010 for Meridiam and APG.
- Decision: kept 2010.
- Date basis: financial close.
- Rationale: FHWA identifies Meridiam Infrastructure and APG Investments among LBJ Infrastructure Group's private partners and states financial close occurred in June 2010.
- Data changes: updated the same-year financial-close milestone to name Meridiam and APG; added separate close-date labels for Meridiam and APG.
- Source: https://www.fhwa.dot.gov/ipd/project_profiles/tx_lbj_express.aspx

### LBJ Infrastructure Group, LLC — APG Infrastructure

- Stored owner year: 2010
- Decision: kept 2010.
- Date basis: financial close.
- Rationale: Same LBJ concession evidence supports APG's 2010 investment in the concession company.
- Data changes: updated same-year financial-close milestone to name APG, Meridiam, and Cintra; added labeled close-date source.
- Source: https://www.fhwa.dot.gov/ipd/project_profiles/tx_lbj_express.aspx

### North Tarrant Express — APG Infrastructure

- Previous stored owner/top-level year: 2009
- Corrected owner/top-level year: 2017
- Date basis: investment-date fallback from FHWA current-ownership disclosure.
- Rationale: FHWA identifies Cintra, Meridiam, and Dallas Police and Fire Pension System as owners at the 2009 financial close. The same FHWA profile lists APG Group in current ownership as of September 2017 after the original pension-fund stake was sold to the concession partners. Public sources reviewed did not support APG as a 2009 owner.
- Data changes: updated top-level and owner `investmentYear` to 2017; updated description; added a Sept. 2017 APG ownership milestone; relabeled FHWA source as investment-date evidence.
- Source: https://www.fhwa.dot.gov/ipd/project_profiles/tx_north_tarrant.aspx

### Pattern Energy Group LP — APG Infrastructure

- Stored owner/top-level year: 2025
- Decision: kept 2025.
- Date basis: close date.
- Rationale: Pattern announced in December 2024 that an APG/ART-headed consortium would acquire Riverstone's equity stake, and announced closing on June 9, 2025. CPP's 2020 take-private and Pattern's 2023 SunZia project financing are separate historical events and do not evidence APG ownership.
- Data changes: removed CPP from APG's owner-vehicle label to avoid conflating CPP's separate 2020 ownership with APG's 2025 investment; reworded close milestone; added APG announcement and close source labels.
- Sources:
  - https://patternenergy.com/pattern-energy-announces-equity-investment-from-consortium-headed-by-apg-and-art/
  - https://patternenergy.com/pattern-energy-announces-closing-of-equity-investment-from-consortium-headed-by-apg-and-art/

## Unchanged High-Conviction Confirmation With Residual Audit Flag

### Gemini Solar + Storage — Quinbrook / APG Infrastructure

- Stored APG year: 2022
- Stored Quinbrook Valley of Fire year: 2024
- Decision: kept both years.
- Date basis: APG close/announcement in 2022; Valley of Fire continuation-fund close in 2024.
- Rationale: Quinbrook's 2024 release states the Valley of Fire continuation fund acquired 51% of Gemini from LCPF and other equity holders. The audit still flags this row because Quinbrook and Primergy also closed Gemini's 2022 project financing, but that financing does not prove the Valley of Fire fund acquired its 51% stake before 2024. The top-level year remains 2022 because APG is the primary displayed owner.
- Data changes: added owner-specific close-date labels for APG and Quinbrook; reworded the 2024 Quinbrook milestone as a completed continuation-fund acquisition.
- Sources:
  - https://www.quinbrook.com/news-insights/quinbrook-and-primergy-solar-partner-with-apg-on-gemini-solar-storage-project/
  - https://www.quinbrook.com/news-insights/quinbrook-closes-600m-solarstorage-continuation-fund/

## Unresolved Cases

- None in this batch.

## Audit Notes

- Post-batch audit command: `npm run audit:portfolio-years`
- Post-batch result: 1,314 owner-company rows; 366 flagged rows remaining.
- Priority split after batch: 12 critical, 93 high, 240 medium, 21 low.
