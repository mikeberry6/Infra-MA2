# Batch 15 - Investment-Year Review

Audit after batch: 1,314 owner-company rows; 444 flagged rows remaining (12 critical, 130 high, 282 medium, 20 low).

## Implemented changes

### FirstEnergy Transmission, LLC - ADIA Infrastructure
- Stored year before review: owner year missing; top-level year 2022.
- Implemented year: 2024 for the ADIA owner row and top-level `investmentYear`.
- Date basis: close date for the Brookfield follow-on FET transaction, with ADIA's indirect passive economic interest confirmed in public regulatory records.
- Evidence reviewed:
  - https://www.tradepractitioner.com/2024/02/cfius-brookfield-infrastructure-partners-lp-and-firstenergy-transmission-llc-2/
  - https://www.firstenergycorp.com/newsroom/news_articles/fe-closes-on-fe-transmission-interest-sale.html
  - https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7B00A61E9C-0000-C856-9EC0-AB998D2CF015%7D&DocTitle=Redacted+Black+Volt+B+2024+LLC+and+Black+Beacon+B+2024+LLC+-+2026+Annual+Report+%28PUBLIC+VERSION%29
- Rationale: Brookfield's initial 2022 FET close should not be used for ADIA. The public CFIUS summary identifies ADIA in the 2023/2024 Brookfield follow-on review, FirstEnergy confirms the follow-on sale closed March 25, 2024, and NY PSC reporting confirms ADIA's approximately 10% passive economic interest in FET. The milestone and sources now identify the ADIA-specific evidence.

### Trans Bay Cable LLC - Brookfield Asset Management
- Stored year before review: missing.
- Implemented year: 2026.
- Date basis: announcement/regulatory-approval fallback; no separate close date found.
- Evidence reviewed:
  - https://docs.cpuc.ca.gov/PublishedDocs/Published/G000/M598/K254/598254957.PDF
  - https://www.transbaycable.com/content/dam/tbc/us/en/pdf/2026/Potential_Merger_Partners.pdf
  - https://newsroom.nexteraenergy.com/2019-07-16-NextEra-Energy-Transmission-completes-acquisition-of-underwater-transmission-cable-system
- Rationale: NextEra acquired Trans Bay Cable in 2019, but the Brookfield row relates to the 2026 proposed transfer of a 50% indirect interest to Brookfield Corporation subsidiary California Transmission Company L.P. The CPUC approved that transfer on February 5, 2026. Because no closing disclosure was found, 2026 is recorded on an announcement/regulatory-approval fallback basis.

### Sempra Infrastructure Partners, LP - Mubadala
- Stored year before review: missing.
- Implemented year: 2021.
- Date basis: investment-date disclosure.
- Evidence reviewed:
  - https://www.mubadala.com/en/what-we-do/sempra-infrastructure-partners
- Rationale: Mubadala's own portfolio materials state that Mubadala invested in Sempra Infrastructure as part of a KKR-led consortium in 2021. The owner row now records 2021 and the milestone identifies the Mubadala-specific event. The top-level year remains aligned to the primary displayed CPP Investments row.

### Stillhouse Solar Project - Acadia Infrastructure Capital
- Stored year before review: top-level year had regressed to 2022; owner year was 2024.
- Implemented year: 2024 top-level alignment.
- Date basis: 2024 construction financing / preferred-equity disclosure.
- Evidence reviewed:
  - https://matrixrenewables.com/press-releases/matrix-renewables-secures-commitments-from-microsoft-and-mufg-led-lender-consortium-for-210mwac-solar-project-in-bell-county-texas/
- Rationale: Acadia's role was in the 2024 preferred-equity financing package, not Matrix's earlier project acquisition. The displayed top-level year now matches the Acadia owner row.

## QA corrections

### Valia Energía - Actis
- Restored top-level `investmentYear` to 2022 to match the Actis owner row after a regression surfaced in the audit.
- No new date basis was introduced in this batch; existing data already described Actis creating the platform in 2022.

## Unresolved critical cases remaining

### Candela Renewables Portfolio - Copenhagen Infrastructure Partners
- Stored year: missing.
- Suspected year: 2025 for at least one former Candela project transfer, but not the full portfolio.
- Sources reviewed:
  - https://www.candelarenewables.com/
  - https://www.candelarenewables.com/projects
  - https://www.naturgy.com/en/press-release/naturgy-enters-the-united-states-with-the-purchase-of-a-renewable-company-specialized-in-solar-and-energy-storage/
  - https://psc.ky.gov/order_vault/Orders_2026/202500064_03192026.pdf
- Why unresolved: Public evidence shows Naturgy acquired a Candela portfolio in 2021 and later Kentucky filings identify transfer of at least one former Candela project to a CIP-managed entity, but the current ownership of the full named portfolio is not clearly disclosed.
- Evidence needed: CIP, Candela, Naturgy, or project-level filings disclosing CIP's acquisition or investment date for the named portfolio.

### Energy Storage - Copenhagen Infrastructure Partners
- Stored year: missing.
- Suspected year: none high-conviction for the generic row.
- Sources reviewed:
  - https://www.cip.com/funds/flagship-funds/
  - https://www.cip.com/media/oljjxc22/cip-annual-report-2024.pdf
  - https://www.cip.com/media/qe1ljfnt/copenhagen-infrastructure-v-eur-blocker-feeder-scsp-2025-periodic-disclosure.pdf?rnd=134188218845870000
- Why unresolved: The row appears to describe a theme or grouped storage portfolio rather than a standalone company; public disclosures identify individual storage projects with different investment dates.
- Evidence needed: A CIP disclosure defining the named "Energy Storage" portfolio and its first investment date.

### Sunrise Renewables - Copenhagen Infrastructure Partners
- Stored year: missing.
- Suspected year: 2025.
- Sources reviewed:
  - https://psc.ky.gov/pscecf/2024-00406/tosterloh%40sturgillturner.com/01292025030138/2_KSB_Lost_City_Application.pdf
  - https://psc.ky.gov/pscecf/2024-00406/tosterloh%40sturgillturner.com/01292025030138/2A_Lost_City_Attachment_A_Corporate_Information.pdf
  - https://psc.ky.gov/pscecf/2024-00406/tosterloh%40sturgillturner.com/03212025051535/01_Response_to_KSB_RFI-1.pdf
- Why unresolved: Regulatory filings tie Sunrise entities to CIP structures in 2025, but do not clearly disclose a platform acquisition, close, or original investment date.
- Evidence needed: A direct CIP/Sunrise/project-company disclosure with the formation or investment date.

### Sunstone Power - Copenhagen Infrastructure Partners
- Stored year: missing.
- Suspected year: 2025.
- Sources reviewed:
  - https://mx.linkedin.com/company/sunstone-power
  - https://strategicenergy.eu/the-companies-behind-mexicos-award-of-3-3-gw-of-renewables-and-1-2-gw-of-battery-storage/
  - https://mexicobusiness.news/energy/news/20-generation-projects-advance-mexico
  - https://www.bnamericas.com/en/news/us2bn-solar-projects-in-mexico-reach-power-purchase-deal-with-cfe
- Why unresolved: Sources identify Sunstone as CIP-backed and describe project permits, but do not establish when CIP first invested in the named platform.
- Evidence needed: CIP or Sunstone disclosure of the platform investment/formation date.

### Golden State Wind - Copenhagen Infrastructure Partners
- Stored year: missing.
- Suspected year: none.
- Sources reviewed:
  - https://www.cppinvestments.com/newsroom/golden-state-wind-a-joint-venture-of-ocean-winds-and-cpp-investments-wins-2-gw-california-wind-energy-lease/
  - https://www.oceanwinds.com/projects/golden-state-wind/
  - https://www.goldenstatewind.com/
  - https://www.globenewswire.com/news-release/2022/12/07/2569696/0/en/Copenhagen-Infrastructure-Partners-announced-as-provisional-winner-of-lease-area-in-California-offshore-auction.html
- Why unresolved: Public Golden State Wind materials identify Ocean Winds and CPP Investments/Reventus Power, not Copenhagen Infrastructure Partners. CIP won a separate California lease area, so no high-conviction CIP investment date exists for Golden State Wind.
- Evidence needed: A source showing CIP owns or invested in Golden State Wind, or a data-model correction if the CIP owner row is erroneous.

### Previously unresolved critical rows carried forward
- Cambrian Innovation Water Asset SPVs - Generate Capital: public sources confirm Generate as a financing/project partner but not an SPV-level original investment date.
- Tower Investments I - Grain: Grain lists the portfolio but does not disclose original acquisition date.
- Chester County Hyperscale Data Center - Harrison Street: sources show 1547/Green Fig project activity and Harrison Street platform relationship, but not project-level ownership date.
- Tract - Manulife: public sources do not clearly disclose Manulife's ownership or investment date for Tract.
- Gulf Coast Express Pipeline LLC - Mubadala: public sources reviewed do not disclose Mubadala's original investment into GCX.
- OnTrac - Oaktree / Duration: public sources reviewed do not disclose Oaktree/Duration's original investment date in the OnTrac platform.
