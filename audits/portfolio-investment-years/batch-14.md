# Batch 14 - Investment-Year Review

Audit after batch: 1,314 owner-company rows; 446 flagged rows remaining (15 critical, 129 high, 282 medium, 20 low).

## Implemented changes

### DataBank - IMCO
- Stored year before review: missing.
- Implemented year: 2022.
- Date basis: investment-date disclosure.
- Evidence reviewed:
  - https://www.imcoinvest.com/articles/strategic-approach-to-digitalization-and-connectivity.html
- Rationale: IMCO states that it has invested in DataBank since 2022. The database now records IMCO's owner-level `investmentYear` as 2022, keeps AustralianSuper as the primary displayed 2024 owner, and updates the 2022 recapitalization milestone to identify IMCO.

### Nexus Water Group - J.P. Morgan Asset Management
- Stored year before review: missing.
- Implemented year: 2024.
- Date basis: close/completion date.
- Evidence reviewed:
  - https://app.mergerlinks.com/transactions/2022-08-29-corix-infrastructure-water-and-wastewater-businesses/service-providers
  - https://nexuswatergroup.com/2024/04/02/nexus-water-group-press-release/
- Rationale: Public deal coverage identifies JP Morgan-backed SouthWest Water as completing its merger with BCI-backed Corix water/wastewater businesses to create Nexus Water Group, with completion shown in April 2024. The milestone now identifies both BCI and J.P. Morgan Asset Management/IIF.

### Valley Cold Storage & Transportation - Ridgewood
- Stored year before review: 2026 on one owner row and missing on the duplicate row.
- Implemented year: 2024 for both Ridgewood owner rows.
- Date basis: acquisition/investment announcement date; no separate close date found.
- Evidence reviewed:
  - https://ridgewoodinfrastructure.com/ridgewood-infrastructure-announces-acquisition-of-valley-cold/
- Rationale: Ridgewood announced its investment in Valley Cold on December 3, 2024. The 2026 portfolio-listing milestone was not the original investment and was reclassified as an operating/current-portfolio item.

### Cityside Networks - SDC
- Stored year before review: 2026 on one duplicate owner row.
- Implemented year: 2023.
- Date basis: announcement date.
- Evidence reviewed:
  - https://www.prnewswire.com/news-releases/cityside-networks-announces-partnership-with-sdc-capital-partners-301755026.html
- Rationale: Cityside announced on February 23, 2023 that funds managed by SDC acquired a majority interest. Both SDC owner rows now align to 2023 and the investment milestone identifies the SDC event.

### Velocity FBO Network - Tallvine
- Stored year before review: missing on one duplicate owner row.
- Implemented year: 2025.
- Date basis: acquisition/platform-launch disclosure.
- Evidence reviewed:
  - https://via.ritzau.dk/pressemeddelelse/14244238/tallvine-launches-north-america-fixed-based-operator-platform-with-odyssey-aviations-us-assets-as-inaugural-acquisition?lang=en&publisherId=90456
- Rationale: Tallvine announced the launch of its North America FBO platform with Odyssey Aviation's U.S. assets as the inaugural acquisition in January 2025. Both Tallvine owner rows now align to 2025.

### BTR Jet Center - Tallvine
- Stored year before review: 2026.
- Implemented data change: no year change; tightened milestone and source label.
- Date basis: acquisition announcement date.
- Evidence reviewed:
  - https://www.businesswire.com/news/home/20260213283848/en/Tallvine-Backed-Velocity-FBO-Network-Expands-with-Acquisition-of-BTR-Jet-Center
- Rationale: The row is a separately listed bolt-on business. The relevant investment year remains 2026, when Tallvine-backed Velocity FBO Network acquired BTR Jet Center. The milestone and source label now explicitly identify Tallvine.

### Havasu Air Center - Tallvine
- Stored year before review: 2025.
- Implemented data change: no year change; tightened milestone and source label.
- Date basis: acquisition announcement date.
- Evidence reviewed:
  - https://www.businesswire.com/news/home/20251001812038/en/Tallvine-Backed-Velocity-FBO-Network-Expands-with-Acquisition-of-Havasu-Air-Centers-Fixed-Base-Operator-Assets
- Rationale: The row is a separately listed bolt-on business. The relevant investment year remains 2025, when Tallvine-backed Velocity FBO Network acquired Havasu Air Center's FBO assets. The milestone and source label now explicitly identify Tallvine.

## Unchanged high-conviction confirmations

### DataBank - Swiss Life
- Stored year: 2022.
- Date basis: 2022 announcement and recapitalization close.
- Evidence reviewed:
  - https://fr.swisslife-am.com/en/home/news/france/corporate/company-news/2022/0617_databank.html
  - https://www.databank.com/resources/press-releases/databank-completes-first-phase-of-major-recapitalization/
- Rationale: Swiss Life's owner-specific 2022 investment year remains correct. The audit still flags this row because the primary displayed owner is AustralianSuper with a separate 2024 investment year; that is an expected multi-owner difference rather than a reason to overwrite Swiss Life.

## Unresolved cases

- None newly unresolved in this batch.
