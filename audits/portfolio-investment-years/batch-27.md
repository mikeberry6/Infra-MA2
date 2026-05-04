# Batch 27 - Copenhagen Infrastructure Partners Priority Rows

Run date: 2026-05-02

Audit status after batch:
- Rows reviewed by audit: 1,313 owner-company rows
- Flagged rows: 330
- Priority split: 13 critical, 68 high, 228 medium, 21 low
- Command: `npm run audit:portfolio-years`

Note: the owner-row count decreased by one because the unsupported Copenhagen Infrastructure Partners owner row was removed from Golden State Wind after primary sources showed the project is owned by Ocean Winds and CPP Investments, not CIP.

## Implemented Changes

### Misae Solar Park - Copenhagen Infrastructure Partners
- Decision: corrected top-level and owner investment year from 2017 to 2018.
- Date basis: acquisition date from project/company source.
- Change: added a July 2018 acquisition milestone and relabeled the project source as investment-date evidence.
- Sources reviewed:
  - https://www.misaesolar.com/misae-solar-park
  - https://www.cip.com/approach/our-projects/misae/
- Rationale: the Misae project page states that the asset was acquired by Copenhagen Infrastructure Partners in July 2018. The prior 2017 year appears to have been pulled from Sage or broader early-solar portfolio history, not from Misae's acquisition date.

### Sage Solar PV Park - Copenhagen Infrastructure Partners
- Decision: kept top-level and owner investment year at 2017.
- Date basis: acquisition date from public secondary source where primary date disclosure was not available.
- Change: added an April 2017 acquisition milestone and an investment-date source label.
- Sources reviewed:
  - https://pv-magazine-usa.com/2020/06/18/denmarks-cip-reaches-first-close-for-6-billion-renewable-infrastructure-fund-the-worlds-largest/
  - https://www.cip.com/approach/our-projects/misae/
  - https://www.pensiondanmark.com/en/investments/strategy-for-private-markets/misae-og-sage/
- Rationale: public reporting states that CIP acquired Sage from a local developer in April 2017 as part of a larger portfolio. CIP and investor materials support Sage as part of the early U.S. solar investments, but do not provide a more precise primary close date.

### Golden State Wind - CPP Investments
- Decision: kept CPP Investments top-level and owner investment year at 2022; removed unsupported Copenhagen Infrastructure Partners owner row.
- Date basis: lease award / announcement fallback.
- Change: removed the CIP owner row and added an owner-labeled announcement-date source for CPP Investments.
- Sources reviewed:
  - https://goldenstatewind.com/golden-state-wind-a-joint-venture-of-ocean-winds-and-cpp-investments-wins-2-gw-california-wind-energy-lease/
  - https://www.boem.gov/renewable-energy/state-activities/golden-state-wind-llc-ocs-p-0564
  - https://edp.com/en/investors/investor-information/market-notifications/ocean-winds-awarded-lease-area-develop-2-gw
- Rationale: Golden State Wind's own release states the project is a newly formed joint venture of Ocean Winds and CPP Investments, with each maintaining a 50% investment. BOEM identifies Golden State Wind LLC as the lease winner. No source reviewed identified Copenhagen Infrastructure Partners as an owner.

### Sunstone Power - Copenhagen Infrastructure Partners
- Decision: did not set an investment year.
- Date basis: unresolved.
- Change: changed the future-dated milestone label from "Expected 2028" to "Target operations" so expected operating timing is not treated as an investment-date candidate.
- Sources reviewed:
  - https://mx.linkedin.com/company/sunstone-power
  - https://strategicenergy.eu/the-companies-behind-mexicos-award-of-3-3-gw-of-renewables-and-1-2-gw-of-battery-storage/
  - https://mexicobusiness.news/energy/news/20-generation-projects-advance-mexico
  - https://www.bnamericas.com/en/news/us2bn-solar-projects-in-mexico-reach-power-purchase-deal-with-cfe
- Rationale: public sources identify Sunstone as CIP-backed but do not clearly disclose when CIP first invested in or formed the named platform.

## Unresolved / No Data Change

### Candela Renewables Portfolio - Copenhagen Infrastructure Partners
- Stored year: missing.
- Suspected year: 2026 for at least one project-transfer transaction, but not for the full named portfolio.
- Sources reviewed:
  - https://www.naturgy.com/en/press-release/naturgy-enters-the-united-states-with-the-purchase-of-a-renewable-company-specialized-in-solar-and-energy-storage/
  - https://psc.ky.gov/order_vault/Orders_2026/202500064_03192026.pdf
- Why unresolved: Naturgy completed its Candela/Hamel transaction in 2021, while Kentucky PSC materials show a 2026 transfer of Summer Shade Solar and 10 other projects from Naturgy Candela DevCo to CI V Activate TopCo. The database row is named "Candela Renewables Portfolio" and describes a broader Candela development business/portfolio, not just the 11-project CI V transfer.
- Evidence needed: a primary CIP, Candela, Naturgy, or regulatory source identifying the current CIP-owned named portfolio and its closing/completion date.

### Energy Storage - Copenhagen Infrastructure Partners
- Stored year: missing.
- Suspected years: 2020, 2024, or 2025 depending on project component.
- Sources reviewed:
  - https://www.cip.com/about-cip/
  - https://www.cip.com/funds/flagship-funds/
  - https://www.cip.com/media/oljjxc22/cip-annual-report-2024.pdf
  - https://www.cip.com/media/qe1ljfnt/copenhagen-infrastructure-v-eur-blocker-feeder-scsp-2025-periodic-disclosure.pdf?rnd=134188218845870000
- Why unresolved: the row is a portfolio theme rather than a single named company or project. CIP disclosures identify several storage investments with different acquisition dates, including pumped-storage projects and battery projects, but no single original investment year for a company named "Energy Storage."
- Evidence needed: a primary CIP source defining the row as a discrete portfolio company/business with one original investment date.

### Sunrise Renewables - Copenhagen Infrastructure Partners
- Stored year: missing.
- Suspected year: 2025.
- Sources reviewed:
  - https://psc.ky.gov/pscecf/2024-00406/tosterloh%40sturgillturner.com/01292025030138/2_KSB_Lost_City_Application.pdf
  - https://psc.ky.gov/pscecf/2024-00406/tosterloh%40sturgillturner.com/01292025030138/2A_Lost_City_Attachment_A_Corporate_Information.pdf
  - https://psc.ky.gov/pscecf/2024-00406/tosterloh%40sturgillturner.com/03212025051535/01_Response_to_KSB_RFI-1.pdf
  - https://psc.ky.gov/pscecf/2024-00406/tosterloh%40sturgillturner.com/06062025050850/Lost_City_Witness_List.pdf
- Why unresolved: Kentucky filings identify CI V Sunrise Renewables entities and CIP development processes/personnel, but do not clearly disclose formation, investment, acquisition, or closing date for a separate platform named Sunrise Renewables.
- Evidence needed: a primary CIP or Sunrise source stating when CIP formed or invested in the platform.

### Sunstone Power - Copenhagen Infrastructure Partners
- Stored year: missing.
- Suspected year: 2025, but evidence is only operating/development status.
- Sources reviewed: listed above under implemented milestone cleanup.
- Why unresolved: public sources identify Sunstone as CIP-backed and active in Mexico's new renewable-project awards, but do not disclose the original CIP investment date.
- Evidence needed: a CIP, Sunstone, regulatory, or transaction source stating the date CIP first invested in or formed Sunstone Power.
