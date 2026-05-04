# Batch 19 - Investment-Year Review

Audit after batch: 1,314 owner-company rows; 418 flagged rows remaining (12 critical, 101 high, 283 medium, 22 low).

## Implemented changes

### Cardinal Midstream Partners - EnCap Investments
- Stored year before review: 2026.
- Implemented year: 2022 for the EnCap owner row and top-level `investmentYear`.
- Date basis: investment announcement / capital commitment.
- Evidence reviewed:
  - https://www.encapinvestments.com/news/industry-veterans-form-cardinal-midstream-partners-secure-initial-300-million-capital
- Rationale: EnCap disclosed on April 21, 2022 that Cardinal secured an initial $300 million capital commitment from EnCap Flatrock. Later portfolio-current references and Cardinal's 2023 Medallion bolt-on do not reset the investment year.

### Clearfork Midstream - EnCap Investments
- Stored year before review: 2026.
- Implemented year: 2022 for the EnCap owner row and top-level `investmentYear`.
- Date basis: investment announcement / capital commitment.
- Evidence reviewed:
  - https://www.encapinvestments.com/news/clearfork-midstream-acquire-azure-midstream-energy-secures-initial-capital-commitment-encap
  - https://clearforkmidstream.com/news/clearfork-midstream-acquires-azure-midstream-energy
- Rationale: EnCap disclosed on January 18, 2022 that Clearfork secured its initial EnCap Flatrock commitment and entered into the Azure acquisition agreement. No later 2026 event was identified as the original investment.

### Moda Midstream II - EnCap Investments
- Stored year before review: 2026.
- Implemented year: 2024 for the EnCap owner row and top-level `investmentYear`.
- Date basis: investment announcement / equity commitment.
- Evidence reviewed:
  - https://www.modamidstream.com/news/moda-midstream-ii-announces-equity-commitment-encap-flatrock-midstream
- Rationale: Moda II was formed in late 2023, but the EnCap Flatrock equity commitment was publicly announced on March 20, 2024. The stored 2026 year reflected current portfolio status rather than original investment timing.

### Vecino Energy - EnCap Investments
- Stored year before review: 2026.
- Implemented year: 2022 for the EnCap owner row and top-level `investmentYear`.
- Date basis: investment announcement / equity commitment.
- Evidence reviewed:
  - https://www.encapinvestments.com/news/vecino-energy-receives-200-million-equity-commitment-encap-flatrock-midstream
- Rationale: EnCap disclosed on July 19, 2022 that Vecino secured a $200 million equity commitment from EnCap Flatrock. Later project activity did not change the original investment year.

### Amadeus Wind Project - Fengate Asset Management
- Stored year before review: 2026.
- Implemented year: 2020 for the Fengate owner row and top-level `investmentYear`.
- Date basis: financial close / acquisition close.
- Evidence reviewed:
  - https://fengate.com/news/fengate-announces-structured-equity-investment-in-250-megawatt-wind-project
  - https://www.baywa-re.com/en/news/baywa-re-completes-construction-of-250-mw-wind-farm
- Rationale: Fengate announced financial close on its acquisition of a majority interest on December 21, 2020, and BayWa confirmed project completion, financial close, and Fengate's cash equity position the same day.

### Georgetown Inpatient Rehabilitation Facility - Fengate Asset Management
- Stored year before review: 2026.
- Implemented year: 2024 for the Fengate owner row and top-level `investmentYear`.
- Date basis: financial close.
- Evidence reviewed:
  - https://fengate.com/news/fengate-asset-management-announces-financial-close-on-two-u-s-healthcare-facilities
- Rationale: Fengate announced financial close on the acquisition of the Georgetown and Tavares inpatient rehabilitation facilities on November 5, 2024.

### JFK Terminal 6 Redevelopment - Fengate Asset Management
- Stored year before review: 2026.
- Implemented year: 2020 for the Fengate owner row and top-level `investmentYear`.
- Date basis: initial investment date.
- Evidence reviewed:
  - https://fengate.com/investments/jfk-terminal-6-redevelopment
- Rationale: Fengate's investment page identifies the initial investment as November 2020 and states Fengate is an equity partner in JFK Millennium Partners. Later construction and bond-financing milestones do not reset the investment date.

### Summit School Services - I Squared Capital
- Stored year before review: 2026.
- Implemented year: 2025 for the I Squared owner row and top-level `investmentYear`.
- Date basis: close date.
- Evidence reviewed:
  - https://isquaredcapital.com/cpt_news/i-squared-capital-acquires-national-express-school-nexs-to-support-growth-in-north-america/
  - https://www.mobicogroup.com/media/news-releases/2025/completion-of-north-america-school-bus-sale/
  - https://isquaredcapital.com/cpt_invest/national-express/
- Rationale: I Squared announced the acquisition agreement on April 25, 2025. Mobico disclosed that the transaction closed on July 14, 2025, and I Squared listed the resulting Summit School Services platform on July 16, 2025.

### Zenith Energy Terminal Portland - I Squared Capital
- Stored year before review: 2026.
- Implemented year: 2025 for the I Squared owner row and top-level `investmentYear`.
- Date basis: announcement fallback; no close date was identified in reviewed public sources.
- Evidence reviewed:
  - https://isquaredcapital.com/cpt_news/i-squared-capital-accelerates-u-s-energy-transition-with-acquisition-of-oregons-premier-renewable-fuels-terminal/
  - https://www.biobased-diesel.com/post/i-squared-capital-to-acquire-zenith-energy-terminal-in-portland-oregon
- Rationale: I Squared announced a definitive agreement to acquire 100% of the terminal on December 16, 2025, subject to closing conditions. No completion notice was found, so the row uses the announcement year under the fallback rule.

### Cotton Plains Portfolio - Northleaf
- Stored year before review: 2026.
- Implemented year: 2016 for the Northleaf owner row and top-level `investmentYear`.
- Date basis: close/completed transaction.
- Evidence reviewed:
  - https://www.apexcleanenergy.com/news/apex-completes-transaction-enabling-u-s-armys-largest-renewable-energy-ppa/
- Rationale: Apex announced on July 14, 2016 that it completed the sale of a majority ownership stake in the 217 MW portfolio to Northleaf, and stated that related project financing and tax-equity transactions closed the same day.

### Maple PPP Portfolio - Northleaf
- Stored year before review: 2026.
- Implemented year: 2014 for the Northleaf owner row and top-level `investmentYear`.
- Date basis: Northleaf investment-date disclosure.
- Evidence reviewed:
  - https://www.northleafcapital.com/infrastructure-investments?page=2
  - https://www.pehub.com/3431984/
  - https://www.sec.gov/Archives/edgar/data/1007286/000110465922052411/a22-11456_1ex99dp.htm
- Rationale: Northleaf's infrastructure investment page identifies Maple PPP Portfolio as an active investment with investment date December 2014.

### Junction City Biomethane - Quinbrook
- Stored year before review: 2026.
- Implemented year: 2025 for the Quinbrook owner row and top-level `investmentYear`.
- Date basis: portfolio acquisition disclosure.
- Evidence reviewed:
  - https://www.quinbrook.com/portfolio/junction-city-biomethane/
- Rationale: Quinbrook's portfolio page states the facility was acquired in 2025 and lists 2025 as the year acquired. The facility's 2021 commercial operation pre-dated Quinbrook ownership.

### American Natural - Tiger
- Stored year before review: 2026.
- Implemented year: 2015 for the Tiger owner row and top-level `investmentYear`.
- Date basis: investment close.
- Evidence reviewed:
  - https://www.tigerinfrastructure.com/portfolio/American-Natural
  - https://www.tigerinfrastructure.com/documents/FG/tigerNew/news/379342_Tiger_Infrastructure_Invests_in_American_Natural.pdf
- Rationale: Tiger's current portfolio page lists the initial investment as 2015, and Tiger's May 28, 2015 PDF announced the closing of its investment in the American Natural parent platform.

### Danskammer Energy - Tiger
- Stored year before review: 2026.
- Implemented year: 2017 for the Tiger owner row and top-level `investmentYear`.
- Date basis: close date.
- Evidence reviewed:
  - https://www.tigerinfrastructure.com/documents/FG/tigerNew/news/582611_Danskammer_Press_Release_-_2017_09_14.pdf
  - https://www.tigerinfrastructure.com/documents/FG/tigerNew/news/585120_153_-_Danskammer_Press_Release_at_Closing_12-27-17_Final.pdf
- Rationale: Tiger signed the acquisition agreement in September 2017 and announced closing on December 27, 2017.

### Summit Carbon Solutions - Tiger
- Stored year before review: 2026 for the Tiger owner row; top-level year remains 2022 for primary displayed owner TPG.
- Implemented year: 2021 for Tiger owner row only.
- Date basis: announcement fallback; no separate close date was identified in reviewed public sources.
- Evidence reviewed:
  - https://www.tigerinfrastructure.com/documents/FG/tigerNew/news/611388_SCS_Press_Release___Tiger___2021_04_20.pdf
  - https://www.prnewswire.com/news-releases/summit-carbon-solutions-announces-investment-from-tiger-infrastructure-partners-301517587.html
- Rationale: Tiger announced an agreement to invest on April 20, 2021. A later April 2022 Summit release described Tiger as an original founding investor and announced an additional commitment, so the 2022 TPG year remains top-level while Tiger's owner-specific year moves to 2021.

## Unchanged high-conviction confirmations

### Indigo Generation - Igneo Infrastructure Partners
- Stored year before review: 2026.
- Implemented year change: none.
- Date basis: close date.
- Evidence reviewed:
  - https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-acquires-indigo-generation.html
  - https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-announce-closing-of-indigo-acquisition.html
- Rationale: Igneo announced the acquisition agreement on November 11, 2025 and announced completion on February 3, 2026. The stored 2026 investment year is correct; the milestone categories and source labels were updated to make the close-date basis clear.

## Unresolved cases

No new unresolved cases were added in this batch. The 12 critical unresolved missing-year rows remain unchanged.
