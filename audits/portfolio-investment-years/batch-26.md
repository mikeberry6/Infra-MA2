# Batch 26 - Axium, BCI/CDPQ, Blackstone, Carlyle, CC&L, Renewa

Run date: 2026-05-02

Audit status after batch:
- Rows reviewed by audit: 1,314 owner-company rows
- Flagged rows: 331
- Priority split: 12 critical, 70 high, 228 medium, 21 low
- Command: `npm run audit:portfolio-years`

## Implemented Changes

### Optima Living Joint Ventures - Axium Infrastructure
- Decision: kept Axium owner year and top-level year at 2020.
- Date basis: announcement fallback.
- Change: reclassified the 2022 Hamlets portfolio addition as an expansion so it does not read as Axium's initial investment.
- Source reviewed: https://www.axiuminfra.com/wp-content/uploads/2020/11/Website-Release_Project-Gibraltar_Axium_en_v01-1.pdf
- Rationale: Axium's November 24, 2020 release says Axium entered a joint venture with Optima and owned a 90% equity interest. The 2022 bed/community acquisition was a later platform expansion.

### InTransit BC - BCI and CDPQ
- Decision: kept BCI at 2005; corrected CDPQ owner year from 2021 to 2005.
- Date basis: close date.
- Change: added owner-specific close-date source labels for BCI and CDPQ; changed the future milestone date label to "Concession term"; reworded later CDPQ ownership references as portfolio-reporting background.
- Sources reviewed:
  - https://www.lexpert.ca/big-deals/ravco-intransit-bc-and-the-gvta-enter-into-p3/345743
  - https://thecdm.ca/partners/industry/intransit-bc
  - https://cdpqinfra.com/sites/cdpqinfrad8/files/2021-10/03-CDPQI-AAM-EN_notice_to_market.pdf
- Rationale: Lexpert reports the Canada Line concession closed on July 29, 2005 and that InTransit BC raised equity from SNC, bcIMC-managed entities, and CDPQ. The 2021 CDPQ material is a portfolio reference, not the original investment.

### Onyx Renewables - Blackstone
- Decision: kept Blackstone owner year and top-level year at 2014.
- Date basis: announcement fallback.
- Change: reworded the 2021 SDCL co-owner event so it remains historical but no longer looks like Blackstone's initial investment close.
- Sources reviewed:
  - https://www.blackstone.com/news/press/blackstone-teams-with-former-solops-management-team-to-fund-utility-scale-renewables-development-company/
  - https://www.onyxrenewables.com/company
- Rationale: Blackstone announced the creation of Onyx Renewable Partners in October 2014; SDCL's 2021 entry was a later co-investor transaction.

### Cardinal Renewables - Carlyle Infrastructure
- Decision: kept Carlyle owner year and top-level year at 2020.
- Date basis: investment/acquisition date.
- Change: added a January 24, 2020 financing milestone and relabeled Carlyle's case study as investment-date evidence; reworded the 2019 reference as pre-launch background.
- Source reviewed: https://www.carlyle.com/esg/cardinal-renewables
- Rationale: Carlyle's case study lists Cardinal Renewables' acquisition date as January 24, 2020. The 2019 $100 million commitment reference is background and does not override the disclosed acquisition date.

### Crescent Midstream - Carlyle Infrastructure
- Decision: kept Carlyle owner year and top-level year at 2019.
- Date basis: announcement fallback.
- Change: added a same-year milestone for Carlyle's strategic equity investment in Crimson Midstream, the predecessor platform to Crescent Midstream, and added an announcement-date source label.
- Sources reviewed:
  - https://www.crimsonmidstream.com/media/the-carlyle-group
  - https://crescentmidstream.com/
- Rationale: Crimson's January 14, 2019 release says Carlyle made a strategic equity investment through Carlyle Global Infrastructure Opportunity Fund. Crescent public materials state the Crescent name was unveiled in 2021, so the 2019 Crimson investment is the best public evidence for the current platform's original Carlyle entry.

### Alberta Midland Rail Terminal - CC&L
- Decision: kept CC&L owner year and top-level year at 2022.
- Date basis: investment date from owner case study.
- Change: labeled the CC&L case study as investment-date evidence and reworded the 2025 private-placement financing milestone so it cannot reset the investment year.
- Sources reviewed:
  - https://cclinfrastructure.cclgroup.com/cases/alberta-midland-rail-terminal/
  - https://cclinfrastructure.cclgroup.com/insight/connor-clark-lunn-infrastructure-and-alpenglow-rail-announce-closing-of-280-million-private-placement-financing/
- Rationale: CC&L's case study lists October 2022 as the initial investment date. The December 2025 financing was a later debt financing for the rail platform.

### Redbed Plains Wind Farm - CC&L
- Decision: corrected top-level and CC&L owner year from 2024 to 2020.
- Date basis: investment date from owner case study, supported by announcement fallback.
- Change: added a December 2020 initial-investment milestone, changed the 2024 active-listing milestone to non-transactional background, and labeled the CC&L case study as investment-date evidence.
- Sources reviewed:
  - https://cclinfrastructure.cclgroup.com/cases/redbed-plains-wind-farm/
  - https://www.edp.com/en/north-america/na/media/edpr-announces-700m-sell-down-deal-wind-and-solar-portfolio
- Rationale: CC&L's case study lists December 2020 as the initial investment date. EDPR's September 2, 2020 announcement supports the portfolio sell-down including Redbed Plains.

### VIP Rail - CC&L
- Decision: kept CC&L owner year and top-level year at 2019.
- Date basis: announcement fallback / owner case-study investment date.
- Change: labeled the CC&L case study and 2019 announcement as investment-date evidence; reworded prior-owner and later bolt-on/financing milestones so they do not drive CC&L's original investment year.
- Sources reviewed:
  - https://cclinfrastructure.cclgroup.com/cases/vip-rail/
  - https://www.newswire.ca/news-releases/connor-clark-amp-lunn-infrastructure-announces-strategic-rail-partnership-with-alpenglow-rail-and-acquires-canadian-rail-business-816917802.html
- Rationale: CC&L's case study lists September 2019 as the initial investment date. The September 10, 2019 announcement says CC&L formed the Alpenglow partnership and acquired VIP Rail. The 2017 prior-owner event and 2022 Alberta Midland addition are not CC&L's initial VIP Rail investment.

### Renewa - QIC and CDPQ
- Decision: corrected QIC owner year from 2025 to 2022; kept CDPQ owner year and top-level year at 2025.
- Date basis: QIC acquisition year and CDPQ investment announcement.
- Change: reordered owners so CDPQ remains the primary displayed owner; added owner-specific investment-date source labels; updated CDPQ milestone wording to name CDPQ/La Caisse.
- Sources reviewed:
  - https://www.qic.com/Investment-Capabilities/Infrastructure/Global-Portfolio/Renewa
  - https://www.qic.com/News-and-Insights/US-land-under-infrastructure-company-Renewa
  - https://www.lacaisse.com/en/news/pressreleases/caisse-invests-us200-million-qic-backed-renewa-accelerate-funding-land-under
- Rationale: QIC's portfolio and case-study materials disclose Renewa as acquired in 2022 on behalf of a managed client. La Caisse/CDPQ announced its US$200 million primary equity commitment on July 15, 2025.

## Unchanged / High-Conviction Confirmations

- Rt. Hon. Herb Gray Parkway P3 project - CC&L: kept 2022. The same-year milestone says CC&L and Desjardins completed the majority-interest acquisition in August 2022. The earlier 2011 financial close was project-construction history, not CC&L's investment.
- BCI - InTransit BC: kept 2005. Lexpert supports July 29, 2005 financial close and bcIMC-managed equity participation.
- Blackstone - Onyx Renewables: kept 2014. Blackstone's own release supports formation/ownership of Onyx in 2014.

## Unresolved / No Data Change

### Corix Infrastructure - BCI
- Stored year: 2012.
- Suspected years: 2006 or 2012.
- Sources reviewed:
  - https://myutility.nexuswatergroup.com/docs/default-source/communities/communities-common/application---corix-restructuring-and-business-combination-transactions.pdf?sfvrsn=1c2b6b5d_2
  - https://www.bci.ca/wp-content/uploads/2020/10/BCI-Investment-Inventory-2021-Infrastructure-Renewable-Resources.pdf
- Why unresolved: public materials indicate BCI affiliates first acquired shares in Terasen Utility Services, later Corix Multi-Utility Services, in 2006, and acquired CAI Capital's Corix interest in 2012. The current database row is Corix Infrastructure, and the evidence reviewed does not clearly resolve whether the named business's owner-entry year should be 2006 or the 2012 effective-control transaction.
- Evidence needed: a primary BCI/Corix source tying the current Corix Infrastructure platform directly to the original 2006 investment or stating that 2012 is the original investment date for the named platform.

### Holtwood and Safe Harbor Hydroelectric Facilities - Brookfield Asset Management
- Stored year: 2016.
- Suspected years: 2014 or 2016.
- Sources reviewed:
  - https://bep.brookfield.com/press-releases/bep/brookfield-renewable-completes-safe-harbor-acquisition
  - https://www.prnewswire.com/news-releases/talen-energy-completes-sale-of-pennsylvania-hydroelectric-plants-300244898.html
  - https://bep.brookfield.com/press-releases/bep/brookfield-renewable-acquire-292-mw-hydroelectric-portfolio-pennsylvania
- Why unresolved: Brookfield completed the Safe Harbor acquisition in 2014 and completed the Holtwood/Lake Wallenpaupack acquisition in 2016. The database row is a combined Holtwood and Safe Harbor entry tied to later Brookfield/Google hydro materials. Public evidence supports both component dates, but does not clearly define whether the combined row's investment year should be the first component investment or the year Brookfield owned the combined hydro grouping.
- Evidence needed: a primary Brookfield source defining the combined Holtwood/Safe Harbor portfolio as an investment with a specific original investment date.

## Audit Tooling

- Added generic ownership-vehicle stopwords to prevent descriptive phrases from being treated as owner identifiers: `acquire`, `acquired`, `acquiring`, `alongside`, `and`, `backed`, `not`, `disclosed`, `undisclosed`, `partnered`, `partnership`, `with`, and project-consortium counterparties that were producing false owner matches in non-owner project history.
