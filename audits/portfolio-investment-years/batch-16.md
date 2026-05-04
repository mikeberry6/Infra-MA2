# Batch 16 - Investment-Year Review

Audit after batch: 1,314 owner-company rows; 436 flagged rows remaining (12 critical, 120 high, 282 medium, 22 low).

## Implemented changes

### intellirent - Sandbrook
- Stored year before review: 2026.
- Implemented year: 2025 for the Sandbrook owner row and top-level `investmentYear`.
- Date basis: announcement fallback; no separate close date was found in public sources.
- Evidence reviewed:
  - https://www.prnewswire.com/news-releases/sandbrook-capital-acquires-intellirent-a-market-leader-in-mission-critical-testing-equipment-solutions-for-power-and-infrastructure-markets-302380177.html
  - https://www.prnewswire.com/news-releases/electro-rent-sells-intellirent-302379715.html
  - https://sandbrook.com/portfolio/intellirent/
- Rationale: Sandbrook and Electro Rent announced the intellirent transaction in February 2025, with Electro Rent stating expected closing in Q1 2025. Because no completion notice was identified, 2025 is recorded on announcement fallback.

### United Utility Services, LLC - Sandbrook
- Stored year before review: 2025.
- Implemented year: 2026 for the Sandbrook owner row and top-level `investmentYear`.
- Date basis: close date.
- Evidence reviewed:
  - https://www.bernhardcapital.com/bcp-completes-sale-of-united-utility-services/
  - https://sandbrook.com/sandbrook-announces-acquisition-of-united-utility-services/
- Rationale: Sandbrook announced the agreement in December 2025, but Bernhard Capital disclosed completion of the sale on March 2, 2026. The database now uses the close year and keeps the 2025 announcement as historical context.

### Ashburn Data Center Development Site (300MW / 98 acres) - SDC
- Stored year before review: 2026.
- Implemented year: 2025 for the SDC owner row and top-level `investmentYear`.
- Date basis: acquisition reporting.
- Evidence reviewed:
  - https://www.datacenterdynamics.com/en/news/sdc-capital-partners-buys-97-acres-of-data-center-zoned-land-in-virginia-for-615-million/
  - https://sdccapitalpartners.com/investments/
- Rationale: Data Center Dynamics reported SDC's acquisition of approximately 97 acres in the Ashburn/Leesburg market in November 2025. Later SDC portfolio listing should not reset the investment year to 2026.

### Lyte Fiber - SDC
- Stored year before review: 2026.
- Implemented year: 2024 for the SDC owner row and top-level `investmentYear`.
- Date basis: announcement fallback.
- Evidence reviewed:
  - https://www.prnewswire.com/news-releases/lyte-fiber-to-launch-next-generation-fiber-internet-in-texas-and-beyond-302275856.html
  - https://sdccapitalpartners.com/investments/
- Rationale: Lyte announced its launch in partnership with SDC Capital Partners in October 2024. No later portfolio listing or operating update should drive the investment year.

### Belmont Innovation Campus / Ashburn 600MW campus - SDC
- Stored year before review: owner year 2026; top-level year 2021.
- Implemented year: 2022 for the SDC owner row and top-level `investmentYear`.
- Date basis: announcement/development filing fallback.
- Evidence reviewed:
  - https://www.datacenterdynamics.com/en/news/sdc-capital-partners-planning-data-center-campus-in-belmont-virginia/
  - https://www.datacenterdynamics.com/en/news/belmont-innovation-campus-gets-board-approval-from-loudoun-county-paves-way-for-13-million-sq-ft-data-center/
  - https://sdccapitalpartners.com/investments/
- Rationale: No parcel close date was identified, but October 2022 public reporting says SDC had filed the land-use application and owned seven parcels at the site. The later 2024 approval and 2026 portfolio listing are project-development milestones, not original investment events.

### Astound Broadband - Stonepeak
- Stored year before review: 2026.
- Implemented year: 2021 for the Stonepeak owner row and top-level `investmentYear`.
- Date basis: close date.
- Evidence reviewed:
  - https://www.astound.com/business/about/news/stonepeak-closes-acquisition-of-astound-broadband/
  - https://stonepeak.com/news/gfiber-and-stonepeaks-astound-to-combine-creating-a-leading-independent-broadband-provider
- Rationale: Stonepeak closed its acquisition of Astound in August 2021. The 2026 GFiber combination announcement is a later portfolio event and does not reset Stonepeak's original investment year.

### Dupré Logistics - Stonepeak
- Stored year before review: 2026.
- Implemented year: 2025 for the Stonepeak owner row and top-level `investmentYear`.
- Date basis: investment announcement fallback.
- Evidence reviewed:
  - https://stonepeak.com/news/stonepeak-partners-with-dupre-logistics
  - https://www.prnewswire.com/news-releases/rinchem-announces-combination-with-dupre-302671889.html
- Rationale: Stonepeak announced its partnership with Dupré in April 2025. The 2026 Rinchem/Dupré combination is a later Stonepeak-backed platform combination and should not reset the Dupré investment year.

### Longview Infrastructure - Stonepeak
- Stored year before review: owner year 2026; top-level year 2021.
- Implemented year: 2025 for the Stonepeak owner row and top-level `investmentYear`.
- Date basis: investment announcement fallback.
- Evidence reviewed:
  - https://stonepeak.com/news/stonepeak-to-provide-equity-commitment-to-longview-infrastructure
  - https://www.longviewinfra.com/about-us
- Rationale: Stonepeak announced the equity commitment to Longview in March 2025. The earlier 2021 top-level year and later 2026 owner year did not correspond to the disclosed Stonepeak investment in the named platform.

### Montera Infrastructure - Stonepeak
- Stored year before review: owner year 2026; top-level year 2021.
- Implemented year: 2025 for the Stonepeak owner row and top-level `investmentYear`.
- Date basis: platform launch / equity commitment announcement fallback.
- Evidence reviewed:
  - https://stonepeak.com/news/stonepeak-launches-montera-infrastructure
  - https://www.datacenterdynamics.com/en/news/stonepeak-launches-hyperscale-data-center-platform-montera-infrastructure-with-15bn-commitment/
- Rationale: Stonepeak launched Montera with a $1.5 billion equity commitment in April 2025. The row now treats that launch commitment as the original investment event for the named platform.

### Stonepeak Infrastructure Logistics Platform - Stonepeak
- Stored year before review: 2026.
- Implemented year: 2021 for the Stonepeak owner row and top-level `investmentYear`.
- Date basis: Stonepeak portfolio investment-date disclosure.
- Evidence reviewed:
  - https://stonepeak.com/investments
  - https://stonepeak.com/investments/infrastructure/transport-logistics
  - https://stonepeak.com/news/stonepeak-acquires-six-building-logistics-portfolio-in-houston-texas
- Rationale: Stonepeak's investment materials identify the logistics platform's initial investment date as June 2021. Later Houston and Fort Worth acquisitions remain as portfolio expansion milestones and do not reset the platform year.

### Woodside Louisiana LNG - Stonepeak
- Stored year before review: 2026.
- Implemented year: 2025 for the Stonepeak owner row and top-level `investmentYear`.
- Date basis: close date.
- Evidence reviewed:
  - https://stonepeak.com/news/woodside-completes-louisiana-lng-sell-down-to-stonepeak
  - https://www.woodside.com/news/news-items/2025/06/louisiana-lng-stonepeak-closing
  - https://stonepeak.com/news/stonepeak-to-acquire-interest-in-woodsides-louisiana-lng
- Rationale: Woodside and Stonepeak disclosed closing of the 40% Louisiana LNG sell-down on June 24, 2025. The 2026 operating/project-status milestone should not drive the investment year.

## QA alignment fixes

### Vigor Marine Group - Antin Infrastructure Partners
- Top-level year realigned to 2026 to match the Antin owner row.
- Date basis: announcement fallback.
- Evidence reviewed:
  - https://www.vigormarine.com/news-press/antin-to-acquire-vigor-marine-group
- Rationale: Antin announced the agreement in February 2026 and reviewed sources still described the transaction as subject to approval. No 2025 investment event was identified.

### Valor Compute Infrastructure (VCI) - Apollo Global Management
- Top-level year realigned to 2026 to match the Apollo owner row.
- Date basis: investment announcement.
- Evidence reviewed:
  - https://www.apollo.com/insights-news/pressreleases/2026/01/apollo-backs-5-4-billion-valor-and-xai-data-center-compute-infrastructure-transaction-with-3-5-billion-capital-solution-3214463
- Rationale: Apollo's capital solution was announced in January 2026. A temporary top-level mismatch was corrected.

### Gate City Power - Ara Partners
- Top-level year realigned to 2026 and the same-year milestone/source were labeled as the Ara acquisition announcement.
- Date basis: announcement fallback.
- Evidence reviewed:
  - https://www.arapartners.com/news/ara-energy-to-acquire-gate-city-power-gate-city-renewable-fuels-and-interest-in-jet-retail-network-for-875-million/
- Rationale: Ara Energy announced the agreement to acquire Gate City Power in March 2026; no close notice was found in reviewed sources.

### Generation Bridge - ArcLight Capital Partners
- Top-level year realigned to 2021 and the source label was upgraded to a close-date label.
- Date basis: close date.
- Evidence reviewed:
  - https://www.prnewswire.com/news-releases/arclight-closes-acquisition-of-4-9gw-power-generation-portfolio-from-nrg-energy-301437923.html
- Rationale: ArcLight closed the Generation Bridge acquisition from NRG in December 2021; a later AlphaGen/platform reference should not reset the year.

## Unchanged high-conviction confirmations

### Astound Broadband - Stonepeak
- Remaining audit status: high `earlier_firm_investment_signal`.
- Rationale: the 2020 agreement announcement is earlier than the stored close year, but the investment-year rule prefers the August 2021 close date.

### Belmont Innovation Campus / Ashburn 600MW campus - SDC
- Remaining audit status: low `weak_same_year_attribution`.
- Rationale: the row remains mechanically weak because the company name is not publicly disclosed and the evidence is development-announcement based. The database was changed only because public reporting clearly identified SDC as planning and owning most parcels at the site in October 2022; a parcel close date would be needed for stronger precision.

## Unresolved cases

The 12 critical missing-year rows remain unresolved and unchanged:
- Candela Renewables Portfolio - Copenhagen Infrastructure Partners
- Energy Storage - Copenhagen Infrastructure Partners
- Sunrise Renewables - Copenhagen Infrastructure Partners
- Sunstone Power - Copenhagen Infrastructure Partners
- Golden State Wind - Copenhagen Infrastructure Partners
- Cambrian Innovation Water Asset SPVs - Generate Capital
- Tower Investments I - Grain
- Chester County Hyperscale Data Center - Harrison Street
- Tract - Manulife (two owner rows)
- Gulf Coast Express Pipeline LLC - Mubadala
- OnTrac - Oaktree / Duration

These were carried forward from batch 15 because reviewed public sources still do not disclose a high-conviction original investment date for the current owner and named company/asset.
