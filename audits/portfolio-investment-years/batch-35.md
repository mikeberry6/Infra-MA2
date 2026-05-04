# Batch 35 — Priority Owner-Year Review

Run date: 2026-05-02

## Audit Movement

- Starting point from the prior batch baseline: 1,311 owner-company rows; 280 flagged rows.
- Ending audit after this batch: 1,311 owner-company rows; 264 flagged rows.
- Ending priority counts: 11 critical, 6 high, 226 medium, 21 low.
- Validation: `npm run validate-portfolios` was blocked by a local `tsx` IPC permission error in this sandbox, so the same validator logic was run directly with Node. Result: 0 structural errors, 2,442 existing warnings.

## Implemented Changes

### Corix Infrastructure — BCI

- Changed BCI and top-level investment year from 2012 to 2006.
- Date basis: original investment / control event.
- Rationale: Corix restructuring materials state that BCI affiliates first acquired shares of Terasen Utility Services, predecessor to Corix Multi-Utility Services, in 2006; 2012 was a later additional share acquisition and should not reset the investment year.
- Updated milestone: 2006 BCI affiliate acquisition, category `Acquisition`.
- Source: `https://myutility.nexuswatergroup.com/docs/default-source/communities/communities-common/application---corix-restructuring-and-business-combination-transactions.pdf?sfvrsn=1c2b6b5d_2`

### Pine Gate Renewables — Generate Capital

- Kept Generate's 2022 investment year and strengthened the 2022 milestone/category.
- Date basis: announcement fallback / strategic growth capital commitment.
- Rationale: Generate announced a US$500 million strategic growth capital and asset-financing commitment in 2022; the 2024 financing round was a later follow-on and should not drive the original investment year.
- Updated milestone: 2022 Generate commitment, category `Financing`.
- Source: `https://www.businesswire.com/news/home/20220623005332/en/Generate-Capital-Provides-Pine-Gate-Renewables-with-%24500-Million-in-Strategic-Growth-Capital-and-Asset-Financing-to-Expand-Utility-Scale-Solar`

### NextDecade Corporation — Mubadala

- Kept Mubadala's 2019 investment year and added a same-year investment milestone and labeled sources.
- Date basis: announcement fallback plus share-registration follow-up.
- Rationale: NextDecade announced Mubadala's US$50 million private-placement investment in 2019; later Rio Grande LNG project-financing events are follow-ons.
- Sources:
  - `https://investors.next-decade.com/news-releases/news-release-details/nextdecade-announces-us50-million-investment-mubadala`
  - `https://investors.next-decade.com/news-releases/news-release-details/nextdecade-registers-shares-previously-issued-mubadala`

### Bandwidth Infrastructure Group / BIG Fiber — SDC

- Changed both SDC rows from 2019 to 2020.
- Date basis: secondary investment date evidence; close date not publicly found.
- Rationale: public coverage supports the business getting started in 2019, but SDC's minority investment occurred in late 2020. The startup year should not be used as SDC's owner investment year.
- Updated milestones: 2019 startup context retained as `Other`; Oct. 2020 SDC minority investment added as `Financing`.
- Sources:
  - `https://www.fierce-network.com/telecom/bandwidth-pitches-its-dark-fiber-alternative-big-name-rivals-3-key-markets`
  - `https://www.privsource.com/acquisitions/telecommunications/2020`

### Altius Renewable Royalties Corp. — Northampton

- Kept Northampton's 2024 investment year and aligned milestones/categories.
- Date basis: arrangement completion.
- Rationale: Northampton affiliate Royal Aggregator LP completed the ARR arrangement in December 2024; the September 2024 milestone is agreement/signing context.
- Sources:
  - `https://www.arr.energy/news/altius-renewable-royalties-corp-announces-completion-of-plan-of-arrangement-with-northampton`
  - `https://www.altiusminerals.com/news-releases/news-release-details/altius-renewable-royalties-corp-enters-arrangement-agreement`

### Alabama Fiber Networks — Meridiam

- Kept Meridiam's 2023 investment year and replaced vague earlier investment signals with FCC approval/consummation evidence.
- Date basis: close/consummation.
- Rationale: BroadLife-to-Yellowhammer transfer was approved in June 2023 and consummated on September 15, 2023; earlier 2022 planning activity should not drive the year.
- Sources:
  - `https://docs.fcc.gov/public/attachments/DA-23-926A1_Rcd.pdf`
  - `https://docs.fcc.gov/public/attachments/DA-23-473A1.pdf`

### Memphis Fiber Networks — Meridiam

- Kept Meridiam's 2023 investment year and clarified 2022 procurement context.
- Date basis: announcement/partnership fallback.
- Rationale: 2022 materials support procurement/preferred-bidder activity, while 2023 public reporting ties the project to Meridiam/Blue Suede Networks.
- Sources:
  - `https://communitynetworks.org/content/memphis-launches-700-million-plan-expand-fiber-access`
  - `https://www.benton.org/newsletter/daily-digest-562024-elliott-rosenworcel`

### Laguna Water Supply — Meridiam

- Changed Meridiam and top-level investment year from 2026 to 2022.
- Date basis: acquisition completion.
- Rationale: Meridiam's asset disclosure states that acquisition of the Laguna Water Supply portfolio was completed on December 16, 2022; the 2026 listing reflected active portfolio status, not the investment date.
- Updated milestone: Dec. 16, 2022 Meridiam completed acquisition, category `Acquisition`.
- Source: `https://www.meridiam.com/assets/laguna-water-supply/`

### Aurora Sustainable Lands — EIG Global Energy Partners

- Changed EIG and top-level investment year from 2022 to 2021.
- Date basis: platform establishment / equity joint venture.
- Rationale: Aurora states that the platform was established in 2021 as a joint venture between Anew Climate and an equity-investor group led by Oak Hill Advisors and including EIG; the 2022 TFG acquisition is a later platform acquisition.
- Updated milestone: 2021 EIG-including equity JV formation, category `Financing`; 2022 TFG acquisition retained as historical acquisition context.
- Sources:
  - `https://aurorasustainablelands.com/about/`
  - `https://aurorasustainablelands.com/news/tfg-acquisition/`

### Compass Datacenters — OTPP

- Kept OTPP's 2017 investment year and added owner-specific source labeling.
- Date basis: announcement fallback.
- Rationale: RedBird and Ontario Teachers' announced their initial investment in Compass on January 12, 2017; the 2023 Brookfield/OTPP transaction was a follow-on/ownership restructuring, not OTPP's original investment.
- Sources:
  - `https://www.otpp.com/en-ca/about-us/news-and-insights/2017/redbird-capital-partners-ontario-teachers-pension-plan-and-management-announce-investment-in-compass-datacenters/`
  - `https://www.otpp.com/en-ca/about-us/news-and-insights/2023/brookfield-infrastructure-and-ontario-teachers--to-acquire-compass-datacenters-from-redbird-capital-partners-and-azrieli-group/`

### Ports America — CPP Investments

- Changed CPP Investments owner year from 2022 to 2014; top-level year left unchanged because CPP is not the primary displayed owner.
- Date basis: original minority-investment disclosure.
- Rationale: CPP's 2021 announcement says CPP was an existing minority investor in Ports America since 2014 and later moved to full ownership; the later ownership expansion should not reset CPP's original investment year.
- Source: `https://www.prnewswire.com/news-releases/cpp-investments-to-acquire-ports-america-interest-from-oaktree-301387716.html`

### Neoen S.A. — Temasek

- Kept Temasek's 2025 investment year and made the 2025 close evidence owner-specific.
- Date basis: tender-offer completion.
- Rationale: Neoen/Brookfield offer-results materials identify Aranda Investments, controlled by Temasek, as part of the concert parties through Brookfield Renewable Holdings; Temasek's own 2025 review also describes partnering with Brookfield on Neoen.
- Sources:
  - `https://neoen.com/app/uploads/2025/03/Brookfield-x-Neoen-Offer-Results-20250319.pdf`
  - `https://www.temasek.com.sg/en/news-and-resources/news-room/speeches/2025/temasek-review-2025-media-briefing`

## Audit Tooling Changes

- Tightened owner-token matching in `scripts/audit-portfolio-investment-years.ts` to reduce false positives from company names and generic ownership-vehicle words.
- Added stopwords for cases such as `compass`, `puget`, `ports`, `america`, `memphis`, and generic terms such as `via`, `publicly`, `last`.
- Prevented acronym fallback tokens from being used when the acronym itself is a stopword.
- Rationale: several high-priority false positives were caused by ownership vehicles containing the portfolio company name rather than owner-identifying text.

## Unchanged High-Conviction Confirmations

### Sempra Infrastructure Partners, LP — CPP Investments

- Stored year: 2025.
- Date basis: announcement fallback.
- Rationale: CPP announced a definitive agreement in September 2025; reviewed sources do not show a completed CPP closing yet. Earlier KKR, ADIA, and Mubadala events are separate owner investments and do not set CPP's owner year.
- Source reviewed: `https://www.cppinvestments.com/newsroom/cpp-investments-to-acquire-stake-in-sempra-infrastructure-partners/`

### Puget Sound Energy — Macquarie Asset Management / OTPP / OMERS

- Stored years: Macquarie 2022, OTPP 2022, OMERS 2018.
- Date basis: close date for Macquarie/OTPP; announcement/investment evidence for OMERS.
- Rationale: Macquarie-led 2009 take-private history relates to an earlier ownership chain and predecessor MIP interests; the current Macquarie Asset Management and OTPP stake acquisition closed in 2022. OMERS entered in 2018.
- Sources reviewed:
  - `https://www.macquarie.com/us/en/about/news/2022/macquarie-asset-management-and-ontario-teachers-complete-acquisition-of-stake-in-puget-holdings.html`
  - `https://www.omers.com/news/omers-infrastructure-announces-investment-in-puget-sound-energy`
  - `https://www.aimco.ca/insights/aimco-increases-stake-in-puget-sound-energy`

## Unresolved / No Edit

### Twin Parking Holdings — Astatine Investment Partners

- Stored year: 2024.
- Suspected year: not determined.
- Sources reviewed:
  - `https://astatineip.com/investment/twin-parking-holdings/`
  - `https://astatineip.com/investments/`
- Why unresolved: Astatine discloses the asset but not an acquisition, close, or announcement date.
- Evidence needed: buyer/seller announcement, filing, or transaction notice identifying Astatine's acquisition date.

### Holtwood and Safe Harbor Hydroelectric Facilities — Brookfield Asset Management

- Stored year: 2016.
- Suspected year: mixed asset dates, 2014 for Safe Harbor and 2016 for Holtwood.
- Sources reviewed:
  - `https://bep.brookfield.com/press-releases/bep/brookfield-renewable-completes-safe-harbor-acquisition`
  - `https://bam.brookfield.com/press-releases/brookfield-and-google-sign-hydro-framework-agreement-deliver-3000-mw-homegrown`
- Why unresolved: the row combines two assets with different Brookfield acquisition dates. Changing the row to either 2014 or 2016 would misstate one asset.
- Evidence needed: project/company-level disclosure proving a single combined holding date or a data model split into separate asset rows.

### Copenhagen Infrastructure Partners — Candela Renewables Portfolio

- Stored year: missing.
- Suspected year: 2025 for at least one transferred former Candela project, but not the full portfolio.
- Sources reviewed:
  - `https://www.candelarenewables.com/`
  - `https://www.naturgy.com/en/press-release/naturgy-enters-the-united-states-with-the-purchase-of-a-renewable-company-specialized-in-solar-and-energy-storage/`
  - `https://psc.ky.gov/order_vault/Orders_2026/202500064_03192026.pdf`
- Why unresolved: public records tie at least one project entity to CI V but do not disclose CIP's original investment date into the full named portfolio.
- Evidence needed: CIP or project filing showing acquisition/transfer date for the portfolio as listed.

### Copenhagen Infrastructure Partners — Energy Storage

- Stored year: missing.
- Suspected year: not determined.
- Sources reviewed:
  - `https://www.cip.com/funds/flagship-funds/`
  - `https://www.cip.com/media/oljjxc22/cip-annual-report-2024.pdf`
  - `https://www.cip.com/media/qe1ljfnt/copenhagen-infrastructure-v-eur-blocker-feeder-scsp-2025-periodic-disclosure.pdf?rnd=134188218845870000`
- Why unresolved: the row appears to aggregate a storage theme/project portfolio rather than a single company, with multiple possible project-level dates.
- Evidence needed: portfolio-level disclosure defining the named holding and initial acquisition/financial-close date.

### Copenhagen Infrastructure Partners — Sunrise Renewables

- Stored year: missing.
- Suspected year: 2025, but not high-conviction.
- Sources reviewed:
  - `https://psc.ky.gov/pscecf/2024-00406/tosterloh%40sturgillturner.com/01292025030138/2_KSB_Lost_City_Application.pdf`
  - `https://psc.ky.gov/pscecf/2024-00406/tosterloh%40sturgillturner.com/01292025030138/2A_Lost_City_Attachment_A_Corporate_Information.pdf`
- Why unresolved: filings identify CI V Sunrise entities and CIP development processes but do not clearly disclose the platform's original investment date.
- Evidence needed: formation/acquisition document for the Sunrise platform or a CIP announcement.

### Copenhagen Infrastructure Partners — Sunstone Power

- Stored year: missing.
- Suspected year: 2025, but not high-conviction.
- Sources reviewed:
  - `https://strategicenergy.eu/the-companies-behind-mexicos-award-of-3-3-gw-of-renewables-and-1-2-gw-of-battery-storage/`
  - `https://mexicobusiness.news/energy/news/20-generation-projects-advance-mexico`
  - `https://www.bnamericas.com/en/news/us2bn-solar-projects-in-mexico-reach-power-purchase-deal-with-cfe`
- Why unresolved: public coverage identifies a CIP-backed developer and project awards, but not CIP's original investment date into Sunstone.
- Evidence needed: CIP/platform announcement or corporate filing identifying the original equity investment.

### Trenton Biogas — Equilibrium

- Stored year: 2017.
- Suspected year: not determined.
- Sources reviewed:
  - `https://trentonbiogas.com/`
  - `https://www.trentonrenewables.com/about-us`
  - `https://americanbiogascouncil.org/large-scale-food-waste-digestion-in-new-jersey-with-trenton-biogas/`
  - `https://www.osti.gov/biblio/1362262`
- Why unresolved: sources describe project development, operations, and capacity but do not clearly disclose Equilibrium's owner-specific investment date.
- Evidence needed: Equilibrium investment announcement, project-finance close notice, or ownership filing.

### Cambrian Innovation Water Asset SPVs — Generate Capital

- Stored year: missing.
- Suspected year: 2019, but not high-conviction.
- Sources reviewed:
  - `https://www.mintz.com/industries-practices/case-studies/mintz-helps-cambrian-innovation-generate-capital`
  - `https://cambrianinnovation.com/news/cambrian-and-ing-announce-150-million-facility`
  - `https://cambrianinnovation.com/news/cambrian-a-leader-in-wastewater-treatment-water-reuse-and-energy-recovery-as-a-service-is-acquired-by-and-receives-200-million-growth-equity-commitment-from-pennybacker`
- Why unresolved: public sources show Generate as a financing/project partner but not a clear SPV-level investment/close date.
- Evidence needed: Generate/Cambrian SPV financing close or project ownership disclosure.

### Tower Investments I — Grain

- Stored year: missing.
- Suspected year: not determined.
- Sources reviewed:
  - `https://graingp.com/investments/`
  - `https://graingp.com/`
- Why unresolved: Grain lists the portfolio but does not disclose original acquisition date.
- Evidence needed: transaction announcement, tower portfolio purchase filing, or seller disclosure.

### Chester County Hyperscale Data Center — Harrison Street

- Stored year: missing.
- Suspected year: not determined.
- Sources reviewed:
  - `https://www.datacenterdynamics.com/en/news/1547-csr-planning-2-million-sq-ft-150mw-campus-outside-philadelphia-pennsylvania/`
  - `https://www.datacenterdynamics.com/en/news/1547-csr-seeks-to-raise-250m-for-data-center-fund-report/`
  - `https://baxtel.com/data-center/1547-chester-county-pa`
  - `https://www.eastwhiteland.org/news_detail_T2_R162.php`
- Why unresolved: public sources discuss 1547/Green Fig and project development, but do not clearly disclose Harrison Street's project-level investment date.
- Evidence needed: Harrison Street/1547 transaction disclosure or project ownership filing.

### Caturus — Kimmeridge

- Stored year: 2025.
- Suspected year: unresolved between 2024 and 2025.
- Sources reviewed:
  - `https://caturus.com/news/kimmeridge-closes-strategic-equity-investment-from-mubadala-energy-and-rebrands-integrated-natural-gas-platform-as-caturus`
  - `https://commonwealthlng.com/mubadala-energy-enters-major-u-s-upstream-gas-and-lng-operation-with-kimmeridge/`
  - `https://www.energy.gov/sites/default/files/2025-09/Commonwealth%20LNG%20Supplement%20to%20Sept.%205%202025%20Notice%20of%20Change%20in%20Control.pdf`
- Why unresolved: 2025 clearly marks the SoTex-to-Caturus rebrand and Mubadala investment, while Kimmeridge's Commonwealth control investment occurred in 2024 and SoTex existed before the rebrand. Public sources reviewed do not clearly establish Kimmeridge's original investment date into the integrated named platform.
- Evidence needed: Kimmeridge/SoTex formation or original platform capitalization disclosure.

### Tract — Manulife

- Stored year: missing for two owner rows.
- Suspected year: not determined.
- Sources reviewed:
  - `https://www.tract.com/`
  - `https://www.tract.com/who-we-are/`
  - `https://www.datacenterdynamics.com/en/news/tracts-grant-van-rooyen-launches-new-data-center-developer-fleet-dc/`
- Why unresolved: Tract materials disclose operating footprint and land acquisitions but not Manulife's owner-specific investment date.
- Evidence needed: Manulife/Tract investment announcement, funding close, or ownership filing.

### Gulf Coast Express Pipeline LLC — Mubadala

- Stored year: missing.
- Suspected year: not determined.
- Sources reviewed:
  - `https://www.kindermorgan.com/operations/natural-gas/gulf-coast-express-pipeline`
  - `https://www.arclight.com/news/arclight-completes-acquisition-of-gulf-coast-express-pipeline-stake-from-phillips-66/`
  - `https://www.spglobal.com/commodityinsights/en/market-insights/latest-news/natural-gas/011325-arclight-to-buy-additional-gulf-coast-express-stake-phillips-66-says`
- Why unresolved: sources identify Kinder Morgan and ArcLight interests but do not disclose Mubadala's current stake or original investment date.
- Evidence needed: Mubadala portfolio disclosure, pipeline ownership filing, or transaction source naming Mubadala.

### OnTrac — Oaktree / Duration

- Stored year: missing.
- Suspected year: not determined.
- Sources reviewed:
  - `https://www.ontrac.com/about/`
  - `https://www.ontrac.com/lasership-and-ontrac-unveil-new-name-and-brand-identity/`
  - `https://www.american-securities.com/en/news/press-releases/lasership-and-ontrac-logistics-to-combine-forming-the-first-pure-play-and-nationwide-e-commerce-last-mile-delivery-network`
  - `https://durationcapitalpartners.com/`
- Why unresolved: public materials disclose the LaserShip/OnTrac combination and Duration's transportation platform, but no clear Oaktree/Duration ownership or investment date for OnTrac.
- Evidence needed: Oaktree/Duration portfolio disclosure or transaction filing naming OnTrac.

### Ports America — Oaktree / Duration

- Stored year: 2023.
- Suspected year: after November 2021, exact year not clear.
- Sources reviewed:
  - `https://www.oaktreecapital.com/insights/insight-commentary/market-commentary/sustainability-in-action-ports-america`
  - `https://www.prnewswire.com/news-releases/cpp-investments-to-acquire-ports-america-interest-from-oaktree-301387716.html`
- Why unresolved: Oaktree states that it sold Ports America to CPP in November 2021 and has since reinvested as a minority owner, but it does not disclose the reinvestment closing date. The 2023 case-study date alone is not sufficient to set the investment year.
- Evidence needed: minority reinvestment closing notice or fund/holding disclosure with effective date.
