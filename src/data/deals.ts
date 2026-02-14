export type DealSector = "Transportation" | "Power & ET" | "Midstream" | "Utilities" | "Environmental" | "Digital" | "Social";

export type DealRegion = "North America" | "Europe" | "Asia-Pacific" | "Middle East & Africa" | "Latin America";

export type DealCategory =
  | "Acquisition (Buyout)"
  | "Acquisition (Majority Stake)"
  | "Acquisition (Minority Stake)"
  | "Sale (Buyout)"
  | "Sale (Majority Stake)"
  | "Sale (Minority Stake)"
  | "Platform Launch"
  | "IPO"
  | "Joint Venture";

export type DealStatus = "Announced" | "Closed" | "Pending Regulatory Approval" | "Terminated";

export interface Deal {
  id: string;
  title: string;
  buyer: string;
  seller: string;
  sector: DealSector;
  subsector: string;
  region: DealRegion;
  category: DealCategory[];
  date: string;
  description: string;
  targetDescription: string;
  sourceName: string;
  sourceUrl: string;

  // Deal Economics
  enterpriseValue: string | null;
  equityValue: string | null;
  stake: string | null;
  status: DealStatus;
  closingDate: string | null;

  // Advisors
  financialAdvisorBuyer: string[] | null;
  financialAdvisorSeller: string[] | null;
  legalAdvisorBuyer: string[] | null;
  legalAdvisorSeller: string[] | null;

  // Asset Detail
  country: string;
  assetScale: string | null;
  valuationMultiple: string | null;
  fundVehicle: string | null;

  // Press Release Detail
  keyHighlights: string[] | null;
}

export const deals: Deal[] = [
  // ─── 1. Actis ──────────────────────────────────────────────
  {
    id: "INF-2026-001",
    title: "Actis acquires 100% stake in Vindhyachal Expressway from Kalpataru",
    buyer: "Actis",
    seller: "Kalpataru Projects International Limited",
    sector: "Transportation",
    subsector: "Roads",
    region: "Asia-Pacific",
    category: ["Acquisition (Buyout)"],
    date: "2026-01-16T08:00:00Z",
    description:
      "Actis announced the acquisition of a 100% stake in the Vindhyachal Expressway in India from Kalpataru Projects International Limited for an enterprise value of ~₹775 crore.",
    targetDescription:
      "Vindhyachal Expressway Private Limited (VEPL), a road infrastructure asset in India.",
    sourceName: "Actis",
    sourceUrl: "https://www.bseindia.com/xml-data/corpfiling/AttachLive/be947c62-f3c2-4bc9-bf0f-6dc6c57fe073.pdf",
    enterpriseValue: "~₹775 crore (~$90M)",
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: ["Equirus Capital"],
    legalAdvisorBuyer: ["Anangram Partners"],
    legalAdvisorSeller: ["Khaitan & Co"],
    country: "India",
    assetScale: "89.3 km four-lane highway",
    valuationMultiple: null,
    fundVehicle: "Actis Long Life Infrastructure Fund",
    keyHighlights: [
      "89.3 km four-lane road connecting Rewa to Hanumana on NH-7, operating under a DBFOT toll concession awarded by MPRDC with 20+ years residual life",
      "Traffic grew at 6% CAGR between FY2018-2024; toll collections rose 12.7% YoY to ₹70.6 crore in first nine months of FY2025",
      "Definitive agreements signed October 2024, transaction closed January 2026",
      "Part of KPIL's strategy to dispose non-core assets (road contributed just ~0.43% of FY24 consolidated revenue) and redeploy capital into core EPC business",
    ],
  },
  // ─── 2. ADIA ───────────────────────────────────────────────
  {
    id: "INF-2026-002",
    title: "ADIA acquires ~3.17% stake in Helios Towers via secondary placing",
    buyer: "Abu Dhabi Investment Authority (ADIA)",
    seller: "ATP (Danish Pension Fund)",
    sector: "Digital",
    subsector: "Telecom Towers",
    region: "Middle East & Africa",
    category: ["Acquisition (Minority Stake)"],
    date: "2026-01-09T08:00:00Z",
    description:
      "ADIA acquired a ~3.17% stake (33.3 million shares) in Helios Towers via a secondary placing from Danish pension fund ATP.",
    targetDescription:
      "Helios Towers, a leading independent telecommunications tower company in Africa and the Middle East.",
    sourceName: "ADIA",
    sourceUrl: "https://www.investegate.co.uk/announcement/rns/helios-towers--htws/proposed-secondary-placing-in-helios-towers-plc/8559982",
    enterpriseValue: null,
    equityValue: null,
    stake: "~3.17% (33.3M shares)",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: ["BofA Securities"],
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United Kingdom",
    assetScale: "~14,515 towers across Africa & Middle East",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "ATP sold ~50.6 million shares at 94p/share (~10% discount to prior close), raising ~£48 million; ADIA purchased ~33.3 million of those shares",
      "Helios Towers operates ~14,515 tower sites across nine countries (eight in Africa, one in Oman) with tenancy ratio of 2.11x",
      "Contracted future revenues of $5.3 billion with average remaining contract life of 6.9 years",
      "2025 guided adjusted EBITDA of $460-470 million; net leverage reduced to 3.6x from 4.2x prior year",
    ],
  },
  // ─── 3. Allianz Global Investors ──────────────────────────
  {
    id: "INF-2026-003",
    title: "Allianz acquires 20.25% stake in Îles d'Yeu et Noirmoutier Offshore Wind Farm",
    buyer: "Allianz Global Investors",
    seller: "Ocean Winds",
    sector: "Power & ET",
    subsector: "Offshore Wind",
    region: "Europe",
    category: ["Acquisition (Minority Stake)"],
    date: "2026-01-22T08:00:00Z",
    description:
      "Allianz acquired a 20.25% minority stake in this 496 MW French offshore wind farm (currently under construction) from Ocean Winds.",
    targetDescription:
      "Îles d'Yeu et Noirmoutier, a 496 MW offshore wind farm off the coast of Vendée, France, currently under construction.",
    sourceName: "Allianz GI",
    sourceUrl: "https://www.allianzgi.com/en/press-centre/media/press-releases/20260122-allianz-invests-in-the-500mw-french-offshore-wind-farm-iles-dyeu-et-noirmoutier",
    enterpriseValue: "~€2.5 billion (total project investment)",
    equityValue: "€200 million",
    stake: "20.25%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "France",
    assetScale: "~500 MW (61 x Siemens Gamesa 8.2 MW turbines)",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "61 Siemens Gamesa 8.2 MW turbines located 11 km off Île d'Yeu and 16 km from Noirmoutier, producing ~1,900 GWh annually (enough for ~800,000 people)",
      "20-year fixed inflation-linked feed-in tariff; began generating electricity June 2025 with full commissioning expected Q1 2026",
      "Post-transaction ownership: Ocean Winds 40%, Sumitomo 29.5%, Allianz 20.25%, Banque des Territoires 9.75%, Vendée Énergie 0.5%",
      "Allianz's third direct offshore wind investment (after Netherlands and Germany) and first in France; active in French renewables since 2008",
    ],
  },
  // ─── 4. Antin Infrastructure Partners ─────────────────────
  {
    id: "INF-2026-004",
    title: "Antin acquires majority stake in Emsere from Gryphion",
    buyer: "Antin Infrastructure Partners",
    seller: "Gryphion",
    sector: "Social",
    subsector: "Healthcare Logistics",
    region: "Europe",
    category: ["Acquisition (Majority Stake)"],
    date: "2026-01-08T08:00:00Z",
    description:
      "Antin announced the acquisition of a majority stake in Emsere, a provider of mission-critical logistics for medical clinical trials, from Gryphion via its Mid Cap Fund I.",
    targetDescription:
      "Emsere, a provider of mission-critical logistics and equipment services for medical clinical trials.",
    sourceName: "Antin",
    sourceUrl: "https://www.businesswire.com/news/home/20260107074378/en/Antin-to-Acquire-Emsere-a-Global-Leader-in-Clinical-Trial-Equipment-Infrastructure",
    enterpriseValue: null,
    equityValue: null,
    stake: "Majority",
    status: "Announced",
    closingDate: "Q1 2026",
    financialAdvisorBuyer: ["Macquarie"],
    financialAdvisorSeller: ["Moelis & Company"],
    legalAdvisorBuyer: ["Loyens & Loeff"],
    legalAdvisorSeller: ["DLA Piper"],
    country: "Netherlands",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: "Antin Mid Cap Fund I (€2.2B)",
    keyHighlights: [
      "8th investment by Antin's €2.2 billion Mid Cap Fund I",
      "Emsere (formerly MediCapital Rent) manages 13,000+ pieces of medical equipment, delivering to 100+ countries",
      "Serves 6 of the top 10 global pharmaceutical companies and 7 of the top 10 CROs",
      "CEO Patrice Gerard and senior management reinvesting alongside Antin",
      "Strategic agreement with Clario for ophthalmic medical imaging in clinical trials",
    ],
  },
  // ─── 5. APG Infrastructure ────────────────────────────────
  {
    id: "INF-2026-005",
    title: "APG sells 10% equity stake in Exolum to Banca March / Stoneshield consortium",
    buyer: "Banca March / Stoneshield Capital",
    seller: "APG Infrastructure",
    sector: "Midstream",
    subsector: "Storage & Logistics",
    region: "Europe",
    category: ["Sale (Minority Stake)"],
    date: "2026-01-20T08:00:00Z",
    description:
      "APG announced the sale of its 10% equity stake in Exolum to a consortium led by Banca March and Stoneshield Capital.",
    targetDescription:
      "Exolum (formerly CLH), a European leader in liquid bulk storage and logistics infrastructure.",
    sourceName: "APG",
    sourceUrl: "https://assetmanagement.apg.nl/publications/apg-has-sold-its-10-stake-in-exolum-to-a-consortium-led-by-banca-march-and-stoneshield-capital/",
    enterpriseValue: null,
    equityValue: null,
    stake: "10%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: ["Jefferies", "Macquarie Capital"],
    legalAdvisorBuyer: ["Uria Menendez"],
    legalAdvisorSeller: ["Clifford Chance"],
    country: "Spain",
    assetScale: "4,000 km pipelines, 39 facilities, 8M m³ storage",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Exolum (formerly CLH, founded 1927) manages 4,000 km of pipelines, 39 facilities, and 8 million cubic meters of storage capacity in Spain with operations across 10 regions globally",
      "Post-transaction ownership: CVC 25%, OMERS 24.77%, KKR 20%, Crédit Agricole 10%, WSIB 10%, Banca March 5%, Stoneshield Capital 5%",
      "Banca March acquired 5% via co-investment vehicle with its clients; Stoneshield Capital (founded by Juan Pepa and Felipe Morenes) acquired the remaining 5%",
      "APG had been a shareholder since 2017; KKR purchased Macquarie Asset Management's 20% stake in 2025",
    ],
  },
  // ─── 6. Ara Partners ──────────────────────────────────────
  {
    id: "INF-2026-006",
    title: "Ara Partners leads growth funding round for Divert, Inc.",
    buyer: "Ara Partners",
    seller: "Divert, Inc.",
    sector: "Environmental",
    subsector: "Waste-to-Energy / Circular Economy",
    region: "North America",
    category: ["Acquisition (Minority Stake)"],
    date: "2026-01-20T09:00:00Z",
    description:
      "Ara Partners participated in a Series B/C equivalent growth funding round for portfolio company Divert, Inc. to scale facilities in Washington and North Carolina.",
    targetDescription:
      "Divert, Inc., an impact technology company converting wasted food into renewable natural gas.",
    sourceName: "Ara Partners",
    sourceUrl: "https://www.businesswire.com/news/home/20260120452855/en/Divert-Inc.-Secures-Funding-to-Scale-Infrastructure-Addressing-the-Wasted-Food-Crisis-in-North-America",
    enterpriseValue: null,
    equityValue: null,
    stake: "Minority (Growth Round)",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Funding led by Wittington Investments (Weston family investment arm); builds on prior $100M growth equity round led by Ara Partners with GIC and Ontario Power Generation",
      "Accelerates buildout of facilities in Longview, WA (100,000 tons/year capacity) and Lexington, NC (28-acre site), both expected operational later in 2026",
      "Uses anaerobic digestion to convert unsold food into carbon-negative RNG, soil amendment, and fertilizer; already operates a 100,000 tons/year facility in Turlock, CA",
      "Targeting 30 facilities by 2031 to handle 5% of all U.S. wasted food; also secured a $1 billion infrastructure development agreement with Enbridge Inc.",
    ],
  },
  // ─── 7. Ares Management ───────────────────────────────────
  {
    id: "INF-2026-007",
    title: "Ares expands partnership with ENGIE, acquires stake in 730 MW US renewables portfolio",
    buyer: "Ares Management",
    seller: "ENGIE North America",
    sector: "Power & ET",
    subsector: "Wind & Solar",
    region: "North America",
    category: ["Acquisition (Minority Stake)"],
    date: "2026-01-13T08:00:00Z",
    description:
      "Ares expanded its partnership with ENGIE by acquiring an equity stake in a 730 MW portfolio of wind and solar assets in the US (ERCOT market).",
    targetDescription:
      "A 730 MW portfolio of wind and solar assets in the US ERCOT market operated by ENGIE North America.",
    sourceName: "Ares Management",
    sourceUrl: "https://www.prnewswire.com/news-releases/engie-and-ares-partnership-further-expands-with-addition-of-730-mw-portfolio-of-new-us-solar-and-wind-assets-302659666.html",
    enterpriseValue: null,
    equityValue: null,
    stake: "Minority",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: "730 MW (wind & solar)",
    valuationMultiple: null,
    fundVehicle: "Ares Climate Infrastructure Partners",
    keyHighlights: [
      "Expands total ENGIE/Ares partnership to 4.3 GW of U.S. solar, wind, and storage assets",
      "All 730 MW assets already operational on the ERCOT grid in Texas",
      "ENGIE retains controlling share and continues to operate and manage the portfolio",
      "ENGIE invests $10 billion+ annually on energy transition globally, targeting 95 GW renewables by 2030",
    ],
  },
  // ─── 8. Asterion Industrial Partners ──────────────────────
  {
    id: "INF-2026-008",
    title: "Asterion commits €1.5 billion to scale ABIO biomethane platform",
    buyer: "Asterion Industrial Partners",
    seller: "Asterion Bioenergy (ABIO)",
    sector: "Environmental",
    subsector: "Biomethane / Energy Transition",
    region: "Europe",
    category: ["Platform Launch"],
    date: "2026-01-14T08:00:00Z",
    description:
      "Asterion committed €1.5 billion (including €800 million in equity) to scale its ABIO platform, targeting 20 operational biomethane plants by the end of 2026.",
    targetDescription:
      "Asterion Bioenergy (ABIO), an integrated pan-European biomethane production and distribution platform.",
    sourceName: "Asterion",
    sourceUrl: "https://www.asterionindustrial.com/asterion-to-invest-e1-5-bn-into-european-biomethane/",
    enterpriseValue: "€1.5 billion",
    equityValue: "€800 million",
    stake: "100% (Platform)",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Spain",
    assetScale: "20 biomethane plants (target), ~3 TWh production",
    valuationMultiple: null,
    fundVehicle: "Asterion Industrial Infra Fund III (€3.4B)",
    keyHighlights: [
      "€800M equity split equally between Fund III (€400M) and LP co-investment (€400M), plus project-level debt to total €1.5B commitment",
      "Six plants operational with six more under construction; nearly ten transactions completed (greenfield, acquisitions, conversions) targeting ~3 TWh production within 3-4 years",
      "Operates across five European markets: Iberia (FiveBioenergy), Italy (Fiamma Verde), Benelux (Byont), Germany (Byont DE), and UK (Pinta Energy)",
      "Fully integrated circular economy model converting agricultural residues into biomethane, captured CO₂ for industrial use, and digestate as natural fertilizer",
      "Fund III closed at €3.4B (exceeding €3.2B target); ABIO is a flagship investment alongside minority stake in Dunkerque LNG, 49% in 2i Aeroporti, and Revalue Energies",
    ],
  },
  // ─── 9. Brookfield Infrastructure Partners ────────────────
  {
    id: "INF-2026-009",
    title: "BIP to sell Brazilian electricity transmission concession for ~$150M",
    buyer: "Undisclosed Buyer",
    seller: "Brookfield Infrastructure Partners (BIP)",
    sector: "Utilities",
    subsector: "Power Transmission / Utilities",
    region: "Latin America",
    category: ["Sale (Buyout)"],
    date: "2026-01-29T08:00:00Z",
    description:
      "BIP agreed to sell the largest of its four Brazilian electricity transmission concessions (1,200 km) for approximately $150 million in net proceeds.",
    targetDescription:
      "A 1,200 km Brazilian electricity transmission concession, the largest in BIP's portfolio of four concessions.",
    sourceName: "Brookfield",
    sourceUrl: "https://bip.brookfield.com/press-releases/bip/brookfield-infrastructure-reports-solid-2025-year-end-results-declares-17th",
    enterpriseValue: "~$150 million (net proceeds)",
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: "H1 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Brazil",
    assetScale: "1,200 km transmission line",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Transaction generates an IRR of 45% and 8.5x multiple of invested capital, crystallizing exceptional returns on an infrastructure concession",
      "Following this sale, BIP will have divested six of its nine original Brazilian transmission concessions",
      "Concession was fully commissioned as of Q2 2024; closing anticipated Q1 2026",
      "Part of BIP's record capital recycling year — raised $3.1B in asset sale proceeds in 2025, targeting $3B additional in 2026",
    ],
  },
  // ─── 10. Brookfield Renewable Partners ────────────────────
  {
    id: "INF-2026-010",
    title: "BEP to sell two-thirds stake in US wind and solar portfolio for ~$860M",
    buyer: "Undisclosed Buyer",
    seller: "Brookfield Renewable Partners (BEP)",
    sector: "Power & ET",
    subsector: "Renewable Energy (Wind & Solar)",
    region: "North America",
    category: ["Sale (Majority Stake)"],
    date: "2026-01-30T08:00:00Z",
    description:
      "BEP announced an agreement to sell a two-thirds stake in a utility-scale portfolio of operating wind and solar projects in the US for ~$860 million in gross proceeds.",
    targetDescription:
      "A utility-scale portfolio of operating wind and solar projects in the United States.",
    sourceName: "Brookfield",
    sourceUrl: "https://www.globenewswire.com/news-release/2026/01/30/3229438/0/en/Brookfield-Renewable-Reports-Strong-2025-Results-and-Announces-5-Distribution-Increase.html",
    enterpriseValue: "~$860 million (gross proceeds)",
    equityValue: null,
    stake: "~66.7%",
    status: "Announced",
    closingDate: "H1 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Selling a two-thirds stake for ~$860M gross proceeds (~$210M net to BEP), with closing expected H1 2026",
      "BEP actively progressing sale of remaining one-third stake; framework agreement with same buyers provides for future sale of up to $1.5B of additional assets",
      "Part of BEP's 2025 asset recycling program that generated $4.5B aggregate proceeds ($1.3B net to BEP) at returns above the high end of targets",
      "BEP reported FFO of $2.01/unit for 2025 (+10% YoY), announced 17th consecutive annual distribution increase of 5%, and ended year with $4.6B available liquidity",
    ],
  },
  // ─── 11. CDPQ ─────────────────────────────────────────────
  {
    id: "INF-2026-011",
    title: "CDPQ sells ~11% block of Cogeco Communications shares for C$229M",
    buyer: "Public Market",
    seller: "CDPQ",
    sector: "Digital",
    subsector: "Broadband / Telecom",
    region: "North America",
    category: ["Sale (Minority Stake)"],
    date: "2026-01-26T08:00:00Z",
    description:
      "CDPQ announced the sale of an ~11% block of shares in Cogeco for C$229 million, while retaining its position as the largest holder of subordinate shares.",
    targetDescription:
      "Cogeco Communications Inc., a Canadian broadband and telecommunications company.",
    sourceName: "CDPQ",
    sourceUrl: "https://www.newswire.ca/news-releases/la-caisse-to-sell-part-of-its-stake-in-cogeco-communications-883137758.html",
    enterpriseValue: "C$229 million",
    equityValue: null,
    stake: "~11%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: ["BMO Capital Markets"],
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Canada",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Selling ~11% of subordinate voting shares at C$67.45/share for ~C$229M; characterized as periodic portfolio rebalancing",
      "La Caisse remains largest holder of subordinate shares post-transaction; Cogeco serves 1.6 million residential and business customers in Canada and the US",
      "La Caisse first invested in Cogeco in 2013 (C$50M loan), contributed C$315M toward MetroCast acquisition in 2017, and purchased Rogers' stake for C$350M in 2023",
      "Sale proceeds to be redeployed into Quebec-based companies per La Caisse's mandate",
    ],
  },
  // ─── 12. CIP – Fengmiao I ────────────────────────────────
  {
    id: "INF-2026-012",
    title: "CIP divests 10% equity stake in 495 MW Fengmiao I offshore wind project to MOL",
    buyer: "Mitsui O.S.K. Lines",
    seller: "Copenhagen Infrastructure Partners (CIP)",
    sector: "Power & ET",
    subsector: "Offshore Wind",
    region: "Asia-Pacific",
    category: ["Sale (Minority Stake)"],
    date: "2026-01-30T09:00:00Z",
    description:
      "CIP agreed to divest a 10% equity stake in the 495 MW Fengmiao I project to Mitsui O.S.K. Lines.",
    targetDescription:
      "Fengmiao I, a 495 MW offshore wind farm project in Taiwan.",
    sourceName: "CIP",
    sourceUrl: "https://www.globenewswire.com/news-release/2025/05/09/3077962/0/en/Copenhagen-Infrastructure-Partners-divests-10-stake-in-Fengmiao-I.html",
    enterpriseValue: null,
    equityValue: null,
    stake: "10%",
    status: "Closed",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: ["BNP Paribas"],
    legalAdvisorBuyer: null,
    legalAdvisorSeller: ["White & Case"],
    country: "Taiwan",
    assetScale: "495 MW (33 x Vestas V236-15.0 MW)",
    valuationMultiple: null,
    fundVehicle: "Copenhagen Infrastructure V",
    keyHighlights: [
      "33 Vestas V236-15.0 MW turbines; first phase of larger 1,800 MW three-phase initiative off Taichung County, Taiwan",
      "MOL invested ~JPY 25 billion (~US$172.6M) for the 10% stake to gain construction-phase offshore wind experience",
      "Project secured ~TWD 103 billion (~US$3.1B) financing from 27 banks and four export credit agencies; financial close March 2025",
      "All 495 MW fully contracted through long-term PPAs with six local and international energy users; equivalent to ~650,000 Taiwanese households",
    ],
  },
  // ─── 13. CIP – Coalburn 2 ────────────────────────────────
  {
    id: "INF-2026-013",
    title: "CIP divests 50% stake in Coalburn 2 battery storage to AIP Management",
    buyer: "AIP Management",
    seller: "Copenhagen Infrastructure Partners (CIP)",
    sector: "Power & ET",
    subsector: "Battery Energy Storage",
    region: "Europe",
    category: ["Sale (Majority Stake)", "Acquisition (Majority Stake)"],
    date: "2026-01-30T10:00:00Z",
    description:
      "CIP agreed to divest a 50% stake in the Coalburn 2 battery energy storage system in Scotland to AIP Management.",
    targetDescription:
      "Coalburn 2, a battery energy storage system (BESS) located in Scotland.",
    sourceName: "CIP",
    sourceUrl: "https://www.globenewswire.com/news-release/2025/10/15/3166846/0/en/Copenhagen-Infrastructure-Partners-divests-50-of-Coalburn-2-to-AIP-Management.html",
    enterpriseValue: null,
    equityValue: null,
    stake: "50%",
    status: "Closed",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United Kingdom",
    assetScale: "500 MW / 1,000 MWh BESS",
    valuationMultiple: null,
    fundVehicle: "Copenhagen Infrastructure Energy Transition Fund I",
    keyHighlights: [
      "500 MW / 1,000 MWh (2-hour duration) lithium-ion BESS on a 22-hectare former opencast coal mine in South Lanarkshire — among Europe's largest battery storage facilities",
      "Revenue underpinned by 10-year optimization agreement with SSE and 15-year capacity market agreement providing stable return foundation",
      "5 blocks of 100 MW each using ~450 SolBank 3.0 battery containers; FID taken December 2024, commissioning scheduled for 2027",
      "AIP Management (60% owned by Storebrand, €8B+ infrastructure AUM) acquiring 50% as part of its UK BESS portfolio strategy",
      "One of three CIP/Alcemi transmission-connected BESS assets under construction in Scotland with collective capacity of 1.5 GW / 3 GWh",
    ],
  },
  // ─── 14. CVC DIF – iPark ─────────────────────────────────
  {
    id: "INF-2026-014",
    title: "CVC DIF acquires iPark, leading Iberian parking platform, from Elliott",
    buyer: "CVC DIF",
    seller: "Elliott Investment Management",
    sector: "Transportation",
    subsector: "Parking Infrastructure",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-01-08T09:00:00Z",
    description:
      "CVC DIF agreed to acquire iPark, a leading Iberian parking platform with 30,000+ spaces, from Elliott Investment Management.",
    targetDescription:
      "iPark, a leading operator of off-street parking concessions in Spain and Portugal with over 30,000 spaces.",
    sourceName: "CVC",
    sourceUrl: "https://www.cvc.com/media/news/2026/cvc-dif-to-acquire-leading-iberian-parking-infrastructure-platform-ipark-from-elliott-investment-management/",
    enterpriseValue: "~€300 million",
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: "H1 2026",
    financialAdvisorBuyer: ["RBC Capital Markets"],
    financialAdvisorSeller: ["DC Advisory"],
    legalAdvisorBuyer: ["Uria & Menendez"],
    legalAdvisorSeller: ["Eversheds"],
    country: "Spain",
    assetScale: "30,000+ parking spaces",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "80+ parking facilities primarily in urban centers, hospitals, and transport hubs across Spain and Portugal",
      "Long-term concession contracts with high-visibility cash flows",
      "CVC DIF won competitive process over other bidders including parking operator Indigo",
      "Investment via DIF Infrastructure VIII, a closed-end fund targeting €6 billion",
      "CEO Juan Manuel Mogarra and team to continue leading iPark's buy-and-build growth strategy",
    ],
  },
  // ─── 15. CVC DIF – Celeste ────────────────────────────────
  {
    id: "INF-2026-015",
    title: "CVC DIF enters exclusive negotiations to acquire ~88% of Celeste from InfraVia",
    buyer: "CVC DIF",
    seller: "InfraVia Capital Partners",
    sector: "Digital",
    subsector: "Fiber & Cloud",
    region: "Europe",
    category: ["Acquisition (Majority Stake)", "Sale (Majority Stake)"],
    date: "2026-01-14T08:00:00Z",
    description:
      "CVC DIF entered exclusive negotiations to acquire a majority stake (~88%) in Celeste, a French B2B fiber operator, from InfraVia Capital Partners.",
    targetDescription:
      "Celeste, a French B2B fiber and cloud infrastructure operator.",
    sourceName: "CVC",
    sourceUrl: "https://www.cvc.com/media/news/2026/cvc-dif-has-entered-exclusive-negotiations-to-acquire-a-significant-majority-stake-in-celeste/",
    enterpriseValue: null,
    equityValue: null,
    stake: "~88%",
    status: "Announced",
    closingDate: "H1 2026",
    financialAdvisorBuyer: ["Oddo BHF"],
    financialAdvisorSeller: null,
    legalAdvisorBuyer: ["De Pardieu"],
    legalAdvisorSeller: null,
    country: "France",
    assetScale: "13,600 km fiber, 6 data centers, 20,000+ business customers",
    valuationMultiple: null,
    fundVehicle: "DIF Value-Add IV",
    keyHighlights: [
      "First investment from CVC DIF's Value-Add IV fund; acquiring ~88% from InfraVia with founder/CEO Nicolas Aubé reinvesting in a significant minority stake",
      "Celeste (founded 2001) serves 20,000+ businesses and 3,000 municipalities in France and Switzerland via 13,600 km of proprietary fiber and six data centers",
      "Integrated platform covering connectivity, hosting/cloud, and cybersecurity services for B2B customers",
      "CVC DIF (formerly DIF Capital Partners, Netherlands, founded 2005) manages €18B (~US$20.9B) in infrastructure AUM",
      "Completion expected Q1 2026 subject to French employee representative body consultation and customary conditions",
    ],
  },
  // ─── 16. EnCap Investments ────────────────────────────────
  {
    id: "INF-2026-016",
    title: "EnCap launches Quantica Infrastructure for US data center development",
    buyer: "EnCap Investments",
    seller: "N/A (Platform Launch)",
    sector: "Digital",
    subsector: "Data Centers",
    region: "North America",
    category: ["Platform Launch"],
    date: "2026-01-19T08:00:00Z",
    description:
      "EnCap launched Quantica Infrastructure to develop \"shovel-ready\" data center sites in the US.",
    targetDescription:
      "Quantica Infrastructure, a new platform focused on developing shovel-ready data center sites in the United States.",
    sourceName: "EnCap",
    sourceUrl: "https://www.encapinvestments.com/news/encap-investments-lp-launches-quantica-infrastructure-deliver-integrated-ai-and-hyperscale",
    enterpriseValue: null,
    equityValue: null,
    stake: "100% (Platform)",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: "500 MW Phase I, expanding to 1 GW",
    valuationMultiple: null,
    fundVehicle: "EnCap Investments (Energy Transition)",
    keyHighlights: [
      "CEO John Chesser, formerly CFO of Talen Energy (which developed and sold its PA data center project to Amazon); leadership team has developed 15+ GW of energy projects across 22 US states",
      "First project in Montana: Phase I of 500 MW with phased growth to 1 GW; initial electric service as early as 2026, reaching 500 MW by 2030",
      "EnCap has raised ~US$47 billion in private capital since 1988; Quantica delivers 'shovel-ready' sites integrating renewables, grid power, and network connectivity",
      "NorthWestern Energy actively working with Quantica to optimize transmission infrastructure and generation resources",
    ],
  },
  // ─── 17. Energy Capital Partners ──────────────────────────
  {
    id: "INF-2026-017",
    title: "ECP agrees to sell Cornerstone portfolio to Talen Energy for $3.45 billion",
    buyer: "Talen Energy",
    seller: "Energy Capital Partners (ECP)",
    sector: "Power & ET",
    subsector: "Power Generation",
    region: "North America",
    category: ["Sale (Buyout)"],
    date: "2026-01-15T08:00:00Z",
    description:
      "ECP agreed to sell the Cornerstone portfolio to Talen Energy for $3.45 billion.",
    targetDescription:
      "The Cornerstone portfolio comprising the Waterford and Darby natural gas power generation plants.",
    sourceName: "ECP",
    sourceUrl: "https://www.bridgepointgroup.com/about-us/news-and-insights/press-releases/2026/energy-capital-partners-ecp-agrees-to-sell-cornerstone-to-talen-energy",
    enterpriseValue: "$3.45 billion",
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: "H2 2026",
    financialAdvisorBuyer: ["J.P. Morgan"],
    financialAdvisorSeller: ["Goldman Sachs"],
    legalAdvisorBuyer: ["Latham & Watkins"],
    legalAdvisorSeller: ["Kirkland & Ellis"],
    country: "United States",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Portfolio comprises the Waterford and Darby natural gas power generation plants",
      "Talen Energy acquiring assets to expand its power generation capacity",
      "One of the largest US power generation portfolio transactions in 2026",
    ],
  },
  // ─── 18. Equitix – UK Portfolio ───────────────────────────
  {
    id: "INF-2026-018",
    title: "Equitix acquires stakes in 10 UK infrastructure assets from Balfour Beatty",
    buyer: "Equitix",
    seller: "Balfour Beatty",
    sector: "Utilities",
    subsector: "Transmission, Lighting, Roads",
    region: "Europe",
    category: ["Acquisition (Minority Stake)"],
    date: "2026-01-06T08:00:00Z",
    description:
      "Equitix announced the acquisition of stakes in 10 UK assets (OFTOs, PFI lighting, roads) from Balfour Beatty. The deal was signed/completed in Dec 2025 but announced in Jan 2026.",
    targetDescription:
      "A diversified portfolio of 10 UK infrastructure assets including offshore transmission owners (OFTOs), PFI lighting, and road concessions.",
    sourceName: "Equitix",
    sourceUrl: "https://www.balfourbeatty.com/media-centre/latest/balfour-beatty-completes-disposal-of-ten-infrastructure-investments-assets/",
    enterpriseValue: null,
    equityValue: null,
    stake: "Various stakes in 10 assets",
    status: "Closed",
    closingDate: "December 2025",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: ["Rothschild & Co"],
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United Kingdom",
    assetScale: "10 assets (OFTOs, PFI, roads)",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Combined proceeds of £87 million for 10 assets, generating £7 million gain on disposals — exceeding Balfour Beatty Directors' valuation as of June 2025",
      "Portfolio comprises three OFTOs (including connection for RWE's 576 MW Gwynt y Môr offshore wind), five street lighting PFIs, one biomass plant, and one road concession",
      "Part of Balfour Beatty's strategy to optimize value through disposal of operational assets while investing in new opportunities",
      "Equitix (founded 2007) is an active UK mid-market infrastructure investor; closed second European infrastructure fund with €1.4B commitments in 2025",
    ],
  },
  // ─── 19. Equitix – Italian Solar ──────────────────────────
  {
    id: "INF-2026-019",
    title: "Equitix increases stake in ACEA solar partnership to 90%",
    buyer: "Equitix",
    seller: "ACEA",
    sector: "Power & ET",
    subsector: "Solar",
    region: "Europe",
    category: ["Acquisition (Majority Stake)"],
    date: "2026-01-13T08:00:00Z",
    description:
      "Equitix announced it increased its stake in its partnership with ACEA to 90% and funded the acquisition of additional solar assets.",
    targetDescription:
      "A portfolio of photovoltaic solar plants in Italy operated through a joint venture with ACEA.",
    sourceName: "Equitix",
    sourceUrl: "https://irei.com/news/equitix-expands-clean-energy-partnership-with-italys-acea/",
    enterpriseValue: null,
    equityValue: null,
    stake: "90%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: ["L&B Partners"],
    financialAdvisorSeller: null,
    legalAdvisorBuyer: ["Legance"],
    legalAdvisorSeller: null,
    country: "Italy",
    assetScale: "144 MWp total (including 40 MW acquired from ACEA)",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Equitix increased stake from 60% to 90% in AE Sun Capital Srl (JV with Acea Produzione); concurrently acquired EASolar Srl (three PV plants in Sicily and Lazio, 40 MW)",
      "Total portfolio now 144 MWp of installed solar capacity across Italy; original 60% JV formed March 2022 for €220 million",
      "ACEA retains 10% plus long-term O&M and asset management contracts; committed to purchase electricity under long-term PPAs from new-build plants",
      "AE Sun Capital holds an option to access a pipeline of up to ~500 MW of PV plants under development by ACEA",
    ],
  },
  // ─── 20. GIP – Rio Grande LNG ─────────────────────────────
  {
    id: "INF-2026-020",
    title: "GIP sells 7.6% equity interest in Rio Grande LNG Trains 4 & 5",
    buyer: "Abu Dhabi Royal Family Investment Vehicle",
    seller: "Global Infrastructure Partners (GIP)",
    sector: "Midstream",
    subsector: "LNG",
    region: "North America",
    category: ["Sale (Minority Stake)"],
    date: "2026-01-27T08:00:00Z",
    description:
      "GIP agreed to sell a 7.6% equity interest in Trains 4 and 5 of the Rio Grande LNG export project to an investment vehicle of the Abu Dhabi ruling family.",
    targetDescription:
      "Trains 4 and 5 of the Rio Grande LNG export project in Texas.",
    sourceName: "GIP",
    sourceUrl: "https://www.thenationalnews.com/business/energy/2026/01/26/abu-dhabis-xrg-raises-stake-in-rio-grande-lng-project-in-texas/",
    enterpriseValue: null,
    equityValue: null,
    stake: "7.6%",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: "Trains 4 & 5 (~12 mtpa combined)",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "XRG (ADNOC's international lower-carbon energy investment arm, launched Nov 2024 with EV exceeding US$150B) exercised options for the additional 7.6% stake from GIP/BlackRock",
      "Builds on XRG's initial 11.7% stake in Trains 1-3; ADNOC Trading also secured 20-year LNG offtake agreement for 1.9 mtpa from Train 4",
      "Trains 4 and 5 each have ~6 mtpa capacity; NextDecade took positive FID on Train 4 in September 2025, issuing full NTP to Bechtel Energy",
      "Currently employs 5,000+ construction workers; Phase 1 on track for 2027 start-up; other partners include GIC and Mubadala",
    ],
  },
  // ─── 21. I Squared – Ramudden ─────────────────────────────
  {
    id: "INF-2026-021",
    title: "I Squared Capital acquires Ramudden Global from Triton Partners",
    buyer: "I Squared Capital",
    seller: "Triton Partners",
    sector: "Transportation",
    subsector: "Transport Safety",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-01-07T08:00:00Z",
    description:
      "I Squared reached an agreement to acquire Ramudden Global, a provider of temporary traffic management services, from Triton Partners.",
    targetDescription:
      "Ramudden Global, a leading provider of temporary traffic management and work zone safety services.",
    sourceName: "I Squared Capital",
    sourceUrl: "https://isquaredcapital.com/cpt_news/i-squared-capital-acquires-ramudden-global-a-leader-in-traffic-management-and-infrastructure-safety/",
    enterpriseValue: "~€2.5 billion",
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: "H1 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: ["Goldman Sachs", "Deutsche Bank"],
    legalAdvisorBuyer: ["Skadden, Arps, Slate, Meagher & Flom"],
    legalAdvisorSeller: null,
    country: "Sweden",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: "ISQ Global Infrastructure Fund III",
    keyHighlights: [
      "190+ depots across 13 countries in Europe and North America with 5,000+ employees",
      "Annual turnover exceeds €1 billion, grown from ~€280 million at formation in 2017-2018",
      "66+ add-on acquisitions completed under Triton ownership",
      "2024 acquisition of RSG International created first pan-Atlantic traffic management platform",
      "Triton retains option to re-invest up to 20% of the equity",
    ],
  },
  // ─── 22. I Squared – ANZA Power ──────────────────────────
  {
    id: "INF-2026-022",
    title: "I Squared launches ANZA Power with $300M equity commitment for ANZ renewables",
    buyer: "I Squared Capital",
    seller: "N/A (Platform Launch)",
    sector: "Power & ET",
    subsector: "Renewable Energy (IPP)",
    region: "Asia-Pacific",
    category: ["Platform Launch"],
    date: "2026-01-15T09:00:00Z",
    description:
      "I Squared launched ANZA Power with a $300 million equity commitment to develop solar, wind, and storage assets in Australia and New Zealand.",
    targetDescription:
      "ANZA Power, a new independent power producer platform targeting solar, wind, and storage in Australia and New Zealand.",
    sourceName: "I Squared Capital",
    sourceUrl: "https://www.businesswire.com/news/home/20260115746889/en/I-Squared-Capital-Launches-ANZA-Power-with-USD-$300-Million-Commitment-to-Deliver-Reliable-Clean-Energy-in-Australia-and-New-Zealand",
    enterpriseValue: null,
    equityValue: "$300 million (equity commitment)",
    stake: "100% (Platform)",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Australia",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: "ISQ Growth Markets Infrastructure Fund II",
    keyHighlights: [
      "Acquired 1.4 GW solar development pipeline and 3.4 GWh+ battery storage pipeline from Bison Energy",
      "80 MWac / 320 MWh solar hybrid plants in Victoria and NSW secured by 20-year agreements with Tier 1 hyperscale customer",
      "300 MW / 1,200 MWh Sheffield battery system (Tasmania) and 200 MW / 800 MWh Albury battery (NSW)",
      "New Zealand pipeline includes 30 MW Somerton, 100 MW Norwood, and 70 MW Highfield solar farms",
      "Additional 80 MW of renewable assets targeting construction start in H1 2026",
    ],
  },
  // ─── 23. I Squared – Radiant Energy Solutions ─────────────
  {
    id: "INF-2026-023",
    title: "I Squared launches Radiant Energy Solutions for Middle East distributed renewables",
    buyer: "I Squared Capital",
    seller: "N/A (Platform Launch)",
    sector: "Power & ET",
    subsector: "Distributed Energy",
    region: "Middle East & Africa",
    category: ["Platform Launch"],
    date: "2026-01-22T09:00:00Z",
    description:
      "I Squared launched Radiant Energy Solutions to target distributed renewables in the Middle East, seeded with the acquisition of FAS Renewables and Zahra Energy.",
    targetDescription:
      "Radiant Energy Solutions, a distributed renewable energy platform in the Middle East seeded with FAS Renewables and Zahra Energy.",
    sourceName: "I Squared Capital",
    sourceUrl: "https://www.businesswire.com/news/home/20260121714056/en/I-Squared-Announces-Launch-of-Radiant-Energy-Solutions",
    enterpriseValue: null,
    equityValue: null,
    stake: "100% (Platform)",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: ["Latham & Watkins"],
    legalAdvisorSeller: null,
    country: "United Arab Emirates",
    assetScale: "100+ MWp secured pipeline, targeting 1 GW+",
    valuationMultiple: null,
    fundVehicle: "ISQ Global Infrastructure Fund III",
    keyHighlights: [
      "Seeded with acquisition of FAS Renewables and subsidiary Zahra Energy (Saudi-based distributed solar) with 100+ MWp of secured projects under long-term contracted PPAs, including with Cenomi Centers",
      "I Squared committed US$150 million to support growth, targeting 1+ GW of behind-the-meter renewables, storage, and energy transition solutions across the GCC",
      "ISQ Global Infrastructure Fund III closed at $15.5B in April 2022; expanding regional presence with Abu Dhabi office and planned Riyadh office",
      "Joins I Squared's global renewables portfolio exceeding 10,000 MW; platform-building strategy to scale via bolt-on acquisitions across solar, storage, and C&I customers",
    ],
  },
  // ─── 24. KKR – GTR ────────────────────────────────────────
  {
    id: "INF-2026-024",
    title: "KKR commits additional $1.5 billion to Global Technical Realty data center platform",
    buyer: "KKR",
    seller: "Global Technical Realty (GTR)",
    sector: "Digital",
    subsector: "Data Centers",
    region: "Europe",
    category: ["Acquisition (Minority Stake)"],
    date: "2026-01-07T08:00:00Z",
    description:
      "KKR announced an additional $1.5 billion equity commitment to GTR to accelerate its European data center development pipeline.",
    targetDescription:
      "Global Technical Realty (GTR), a build-to-suit data center platform operating across key European markets.",
    sourceName: "KKR",
    sourceUrl: "https://www.businesswire.com/news/home/20260107040486/en/KKR-and-Oak-Hill-Capital-Commit-Nearly-$2-Billion-to-Leading-European-Data-Center-Platform-Global-Technical-Realty",
    enterpriseValue: null,
    equityValue: "$1.5 billion (KKR commitment); ~$2B total with Oak Hill Capital",
    stake: "Minority (co-investment)",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: ["Simpson Thacher & Bartlett"],
    legalAdvisorSeller: null,
    country: "Germany",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: "KKR Global Infrastructure Investors IV",
    keyHighlights: [
      "Total KKR commitment now $2.5 billion (original $1B in 2020 + additional $1.5B)",
      "Oak Hill Capital contributing ~$400 million as new co-investor",
      "Founded by Franek Sodzawiczny, who previously built and sold Sentrum (~$1B to Digital Realty) and Zenium ($442M to CyrusOne)",
      "Slough (UK) campus: 40.5 MW IT load upon completion; 94+ MW under development across Europe",
      "Part of KKR's ~$34 billion digital infrastructure portfolio across 155+ facilities",
    ],
  },
  // ─── 25. Patrizia ─────────────────────────────────────────
  {
    id: "INF-2026-025",
    title: "Kinland (Patrizia) acquires 49 Nordic preschool properties for ~€170M",
    buyer: "Patrizia (via Kinland)",
    seller: "Undisclosed Sellers",
    sector: "Social",
    subsector: "Preschool & Care Properties",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-01-13T08:00:00Z",
    description:
      "Kinland, managed by Patrizia, announced the acquisition of a portfolio of 49 preschool properties across the Nordics for ~€170 million.",
    targetDescription:
      "A portfolio of 49 preschool and care properties located across the Nordic countries.",
    sourceName: "Patrizia",
    sourceUrl: "https://www.patrizia.ag/en/news-detail/patrizias-kinland-adds-49-social-infrastructure-assets-in-eur-170m-nordic-bolt-on-programme",
    enterpriseValue: "~€170 million",
    equityValue: null,
    stake: "100%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Sweden",
    assetScale: "421 total properties serving ~34,000 people",
    valuationMultiple: null,
    fundVehicle: "Kinland (managed by Patrizia)",
    keyHighlights: [
      "Bolt-on of 49 properties grew Kinland portfolio from 372 to 421 properties serving ~34,000 people; Swedish footprint more than doubled from 15 to 34 properties",
      "Assets primarily in Greater Stockholm and Greater Helsinki with long-term triple-net leases of up to 15 years with government-backed care service operators",
      "Kinland secured ~€900 million in refinancing (NOK and EUR tranches) via substantially oversubscribed senior debt transaction in September 2025",
      "Since Patrizia's 2019 acquisition, Kinland's asset base has grown by over 115%; bolt-ons underscore Nordic social infrastructure demand driven by urbanisation",
    ],
  },
  // ─── 26. Quinbrook ────────────────────────────────────────
  {
    id: "INF-2026-026",
    title: "Quinbrook sells Flexitricity to Drax Group for ~£42 million",
    buyer: "Drax Group",
    seller: "Quinbrook Infrastructure Partners",
    sector: "Power & ET",
    subsector: "Virtual Power Plant / Energy Transition",
    region: "Europe",
    category: ["Sale (Buyout)"],
    date: "2026-01-21T08:00:00Z",
    description:
      "Quinbrook announced the sale of Flexitricity, a UK flexible power aggregator, to Drax Group for ~£42 million.",
    targetDescription:
      "Flexitricity, a UK-based flexible power aggregator and virtual power plant operator.",
    sourceName: "Quinbrook",
    sourceUrl: "https://finance.yahoo.com/news/quinbrook-sells-flexitricity-drax-071200531.html",
    enterpriseValue: "~£42 million",
    equityValue: null,
    stake: "100%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: ["Jefferies"],
    legalAdvisorBuyer: null,
    legalAdvisorSeller: ["DLA Piper"],
    country: "United Kingdom",
    assetScale: "~1.3 GW distributed flexible capacity",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "~£42M total proceeds (£36M EV plus ~£6M net working capital/cash adjustment); Quinbrook originally acquired Flexitricity in 2020 for £15.2M, implying ~2.8x gross MOIC",
      "Under Quinbrook's ownership, contracted portfolio more than doubled from 540 MW to ~1.3 GW of distributed capacity (BESS, demand response, flexible generation)",
      "Proprietary AI/ML-enabled controls platform managing 900+ MW of operational assets across wholesale, balancing, and ancillary markets",
      "Drax intends to use Flexitricity to accelerate development of a GW-scale BESS pipeline; Velox Power (Quinbrook's flexible generation business) excluded from sale",
    ],
  },
  // ─── 27. Ridgewood Infrastructure ─────────────────────────
  {
    id: "INF-2026-027",
    title: "Ridgewood sells APP Jet Center to Bain Capital",
    buyer: "Bain Capital",
    seller: "Ridgewood Infrastructure",
    sector: "Transportation",
    subsector: "Aviation (FBO)",
    region: "North America",
    category: ["Sale (Buyout)"],
    date: "2026-01-27T09:00:00Z",
    description:
      "Ridgewood agreed to sell APP Jet Center, an operator of Fixed-Base Operators (FBOs) at US airports, to Bain Capital.",
    targetDescription:
      "APP Jet Center, an operator of Fixed-Base Operators (FBOs) providing aviation services at US airports.",
    sourceName: "Ridgewood",
    sourceUrl: "https://www.baincapital.com/news/bain-capital-enters-fixed-base-operator-sector-acquisition-app-jet-center",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "5 FBO locations: Opa-locka (South FL), Dulles (DC), Centennial (Denver), San Jose & second Bay Area location",
      "Mark Johnstone, former CEO of Signature Aviation, to lead the business",
      "Focus on capacity-constrained airports where new FBO development is restricted",
      "Joint investment by Bain Capital Real Estate and Bain Capital Special Situations",
      "Intended as foundation for broader FBO platform via selective add-on acquisitions",
    ],
  },
  // ─── 28. Schroders Greencoat ──────────────────────────────
  {
    id: "INF-2026-028",
    title: "Schroders Greencoat acquires 110 MWp UK solar portfolio from METLEN",
    buyer: "Schroders Greencoat",
    seller: "METLEN Energy & Metals",
    sector: "Power & ET",
    subsector: "Solar",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-01-22T10:00:00Z",
    description:
      "Schroders Greencoat announced the acquisition of three operational solar farms in the UK from METLEN Energy & Metals.",
    targetDescription:
      "A portfolio of three operational solar farms in the UK totaling 110 MWp.",
    sourceName: "Schroders Greencoat",
    sourceUrl: "https://www.schroders.com/en/global/individual/media-centre/schroders-greencoat-expands-uk-solar-portfolio-with-110mwp-acquisition-from-metlen-energy-metals/",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United Kingdom",
    assetScale: "110 MWp (3 solar farms)",
    valuationMultiple: null,
    fundVehicle: "Greencoat Solar",
    keyHighlights: [
      "Three operational solar farms: Gorse Lane (Lincolnshire), Defford (Worcestershire), and Watnall (Nottinghamshire), powering ~41,300 homes/year",
      "Farms benefit from corporate PPA signed April 2022 between METLEN/Centrica and Vodafone UK, providing long-term contracted revenue",
      "Reinforces Schroders Greencoat's position as largest manager of operating ground-mount solar farms in the UK with ~1.9 GWp total managed portfolio",
      "Led to a second, larger deal in February 2026: 283 MWp portfolio of seven UK solar projects from METLEN with Vodafone and Engie offtake",
    ],
  },
  // ─── 29. Stonepeak ────────────────────────────────────────
  {
    id: "INF-2026-029",
    title: "Stonepeak invests $2.4B for 25% stake in CMA CGM port terminal JV",
    buyer: "Stonepeak",
    seller: "CMA CGM",
    sector: "Transportation",
    subsector: "Ports",
    region: "North America",
    category: ["Joint Venture"],
    date: "2026-01-28T08:00:00Z",
    description:
      "Stonepeak announced a $2.4 billion investment for a 25% stake in a new platform holding 10 key container terminals globally.",
    targetDescription:
      "United Ports LLC, a new platform holding 10 key container terminals globally in partnership with CMA CGM.",
    sourceName: "Stonepeak",
    sourceUrl: "https://stonepeak.com/news/cma-cgm-and-stonepeak-announce-groundbreaking-terminal-joint-venture-united-ports-llc",
    enterpriseValue: "~$9.6 billion (implied JV valuation)",
    equityValue: "$2.4 billion (Stonepeak for 25%)",
    stake: "25%",
    status: "Announced",
    closingDate: "H1 2026",
    financialAdvisorBuyer: ["Morgan Stanley"],
    financialAdvisorSeller: ["Rothschild & Co"],
    legalAdvisorBuyer: ["Simpson Thacher & Bartlett"],
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: "10 container terminals globally",
    valuationMultiple: null,
    fundVehicle: "Stonepeak Infrastructure Fund V",
    keyHighlights: [
      "10 terminals: Fenix (LA), Port Liberty (NY), Santos (Brazil), Valencia, Bilbao, Algeciras, Guadalquivir (Spain), Nhava Sheva (India), Kaohsiung (Taiwan), Gemalink (Vietnam)",
      "CMA CGM retains 75% ownership and full operational control; Stonepeak option to contribute additional $3.6B for future terminals",
      "CMA CGM reinvesting $2.4B proceeds into core shipping and logistics",
      "CMA CGM directly controls 41 terminals, plus 21 via Terminal Link JV with China Merchants Port",
      "Subject to antitrust and foreign direct investment regulatory approvals",
    ],
  },
  // ─── 30. Tiger Infrastructure Partners ────────────────────
  {
    id: "INF-2026-030",
    title: "Tiger-backed Qwello wins Copenhagen EV charging tender, enters Danish market",
    buyer: "Tiger Infrastructure Partners (via Qwello)",
    seller: "N/A (Platform Launch)",
    sector: "Transportation",
    subsector: "EV Charging",
    region: "Europe",
    category: ["Platform Launch"],
    date: "2026-01-22T08:00:00Z",
    description:
      "Tiger-backed Qwello announced its entry into the Danish market after winning a tender from the City of Copenhagen to deploy EV charging infrastructure.",
    targetDescription:
      "Qwello's expansion into the Danish EV charging market via a City of Copenhagen tender.",
    sourceName: "Tiger Infrastructure",
    sourceUrl: "https://qwello.eu/news/qwello-enters-the-danish-market-after-winning-a-contested-tender-in-copenhagen/",
    enterpriseValue: null,
    equityValue: null,
    stake: "N/A (Tender win)",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Denmark",
    assetScale: "140 AC charging stations (Copenhagen)",
    valuationMultiple: null,
    fundVehicle: "Tiger Infrastructure Partners Fund III ($1.3B)",
    keyHighlights: [
      "Won two contracts in contested public tender to install and operate up to 140 public AC charging stations across multiple Copenhagen districts",
      "Deploying next-gen CP22 model: dual-connector (Type 2), 7-inch screen, 40x30 cm footprint designed for dense urban residential areas",
      "Fully privately-financed, subsidy-free model enabling municipalities to scale EV charging without public investment",
      "Qwello now operates 16,000+ charge points across Germany, Netherlands, Sweden, UK, France, Spain, Poland, and Denmark",
      "Tiger Infrastructure invested €50 million in Qwello in 2021; Fund III raised $1.3B at hard cap",
    ],
  },
  // ─── 31. CIP – Ørsted Onshore Europe ────────────────────
  {
    id: "INF-2026-031",
    title: "CIP agrees to acquire 578 MW Ørsted onshore wind/solar portfolio across UK, Germany, and Spain",
    buyer: "Copenhagen Infrastructure Partners (CIP)",
    seller: "Ørsted",
    sector: "Power & ET",
    subsector: "Onshore Wind & Solar",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-02-03T08:00:00Z",
    description:
      "Copenhagen Infrastructure Partners (CIP) agreed to acquire a 578 MW operating wind and solar portfolio along with a development pipeline across the UK, Germany, and Spain from Ørsted's onshore European business.",
    targetDescription:
      "Ørsted Onshore Europe, a 578 MW operating wind and solar portfolio with development pipeline across the UK, Germany, and Spain.",
    sourceName: "CIP",
    sourceUrl: "https://cipartners.dk/2026/02/03/cip-acquires-orsted-onshore-europe/",
    enterpriseValue: "€1.44 billion (DKK 10.7B / ~US$1.7B)",
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: "Q2 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: ["Evercore"],
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United Kingdom",
    assetScale: "578 MW operating + 248 MW under construction + multi-GW pipeline",
    valuationMultiple: null,
    fundVehicle: "Copenhagen Infrastructure V (€12B / US$14B)",
    keyHighlights: [
      "Acquiring Ørsted's entire European onshore business for €1.44B (DKK 10.7B); 578 MW operating, 248 MW under construction, plus multi-GW development pipeline across Ireland, UK, Germany, and Spain",
      "CI V reached final close March 2025 raising €12B (US$14B), exceeding target, with ~€24B total potential commitment capacity",
      "Business to operate as independent entity under new brand with Cork remaining as European headquarters post-close",
      "Part of Ørsted's cornerstone divestment programme (alongside 50% Hornsea 3 to Apollo and 55% Changhua 2 to Cathay Life), bringing total signed proceeds to ~DKK 46B vs DKK 35B target",
    ],
  },
  // ─── 32. Antin – Vigor Marine Group ─────────────────────
  {
    id: "INF-2026-032",
    title: "Antin signs definitive agreement to acquire Vigor Marine Group from Lone Star Funds",
    buyer: "Antin Infrastructure Partners",
    seller: "Lone Star Funds",
    sector: "Transportation",
    subsector: "Maritime / Shipyards",
    region: "North America",
    category: ["Acquisition (Buyout)"],
    date: "2026-02-04T08:00:00Z",
    description:
      "Antin Infrastructure Partners signed a definitive agreement to acquire Vigor Marine Group, a critical maritime infrastructure provider operating shipyards and drydocks, from Lone Star Funds.",
    targetDescription:
      "Vigor Marine Group, a critical maritime infrastructure provider operating shipyards and drydocks in the United States.",
    sourceName: "Antin",
    sourceUrl: "https://www.antin-ip.com/news/2026/antin-to-acquire-vigor-marine-group/",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: "H1 2026",
    financialAdvisorBuyer: ["J.P. Morgan"],
    financialAdvisorSeller: ["Evercore", "Macquarie Capital"],
    legalAdvisorBuyer: ["Latham & Watkins", "Milbank"],
    legalAdvisorSeller: ["Kirkland & Ellis"],
    country: "United States",
    assetScale: "6 drydocks, 29 berths, ~$1B revenue (2024)",
    valuationMultiple: null,
    fundVehicle: "Antin Infrastructure Partners Fund V ($11.8B)",
    keyHighlights: [
      "Leading U.S. maritime MRO and fabrication provider based in Portland, OR, operating shipyard facilities in Seattle, Vancouver (WA), San Diego, and Norfolk with 6 drydocks and 29 berths",
      "Generated nearly $1 billion in revenue in 2024 with ~2,700 employees; seventh investment by Antin's $11.8B Flagship Fund V",
      "Under Lone Star Funds' ownership, consolidated five separate entities under single brand and invested $170M+ in facility improvements and technology upgrades",
      "CEO Francesco Valente and management team to remain; Antin plans to expand capacity across all five locations to meet increasing U.S. naval and defense demand",
      "Antin manages over €33 billion in AUM across Flagship, Mid Cap, and NextGen strategies",
    ],
  },
  // ─── 33. ECP & KKR – AI Infrastructure Platform (JV) ───
  {
    id: "INF-2026-033",
    title: "ECP and KKR announce $50B partnership and JV for hyperscale data center campus in Texas",
    buyer: "Energy Capital Partners & KKR",
    seller: "N/A (Joint Venture)",
    sector: "Digital",
    subsector: "Data Centers",
    region: "North America",
    category: ["Joint Venture"],
    date: "2026-02-04T09:00:00Z",
    description:
      "Energy Capital Partners and KKR announced a $50 billion strategic partnership and launched a Joint Venture to develop a hyperscale data center campus in Texas for AI infrastructure.",
    targetDescription:
      "AI Infrastructure Platform, a Joint Venture to develop a hyperscale data center campus in Texas.",
    sourceName: "ECP / KKR",
    sourceUrl: "https://www.ecpartners.com/news/2026/ecp-kkr-announce-ai-infrastructure-partnership/",
    enterpriseValue: "$50 billion (total partnership commitment)",
    equityValue: null,
    stake: "Joint Venture",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: "Hyperscale data center campus",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "$50 billion strategic partnership for AI infrastructure development",
      "Initial JV to develop a hyperscale data center campus in Texas",
      "Combines ECP's energy expertise with KKR's digital infrastructure track record",
    ],
  },
  // ─── 34. DWS Infrastructure – Open Hub Med ──────────────
  {
    id: "INF-2026-034",
    title: "DWS Infrastructure acquires Open Hub Med carrier-neutral data center in Palermo",
    buyer: "DWS Infrastructure (via Mediterra)",
    seller: "Open Hub Med",
    sector: "Digital",
    subsector: "Data Centers",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-02-04T10:00:00Z",
    description:
      "DWS Infrastructure, via its portfolio company Mediterra, acquired Open Hub Med, a carrier-neutral data center hub located in Palermo, Sicily.",
    targetDescription:
      "Open Hub Med, a carrier-neutral data center hub located in Palermo, Sicily.",
    sourceName: "DWS",
    sourceUrl: "https://www.dws.com/news/2026/dws-infrastructure-acquires-open-hub-med/",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Closed",
    closingDate: "February 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Italy",
    assetScale: "2 MW (expandable to 4 MW), 1,000 sqm (expandable to 4,000 sqm)",
    valuationMultiple: null,
    fundVehicle: "Pan-European Infrastructure III (DWS)",
    keyHighlights: [
      "2 MW, 1,000 sqm carrier-neutral data center in Carini near Palermo, expandable to 4 MW and 4,000 sqm with secured additional space and power",
      "Less than 1 km from coast with proximity to major submarine cable landings — strategic hub for Europe-Africa-Asia data traffic",
      "Acquired by Mediterra DataCenters (backed by PEIF III / DWS); second Italian operation after Cloud Europe (Tier IV DC in Rome) acquired July 2024",
      "Originally launched ~2017 by consortium including Equinix Italia, Fastweb, Italtel, Retelit, MIX, and SuperNAP Italia, providing established tenant/connectivity ecosystem",
    ],
  },
  // ─── 35. Schroders Greencoat – UK Solar Portfolio ───────
  {
    id: "INF-2026-035",
    title: "Schroders Greencoat agrees to acquire 283 MW UK solar PV portfolio from METLEN",
    buyer: "Schroders Greencoat",
    seller: "METLEN Energy & Metals",
    sector: "Power & ET",
    subsector: "Solar",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-02-04T11:00:00Z",
    description:
      "Schroders Greencoat entered an agreement to acquire 283 MW of solar PV assets, both operational and under construction, from METLEN Energy & Metals in the UK.",
    targetDescription:
      "A portfolio of 283 MW solar PV assets (operational and under construction) in the United Kingdom.",
    sourceName: "Schroders Greencoat",
    sourceUrl: "https://www.schroders.com/en/global/individual/media-centre/schroders-greencoat-acquires-283mw-uk-solar-portfolio/",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: "H1 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: ["Akereos Capital"],
    legalAdvisorBuyer: null,
    legalAdvisorSeller: ["Pinsent Masons"],
    country: "United Kingdom",
    assetScale: "283 MWp (143 MW operational + 140 MW under construction)",
    valuationMultiple: null,
    fundVehicle: "Greencoat Solar",
    keyHighlights: [
      "Seven solar projects across England and Scotland: 143 MW operational/mechanically complete and 140 MW under construction with expected COD within Q2 2026",
      "Long-term power purchase agreements with Vodafone and Engie providing high revenue visibility and cash flow stability",
      "Second transaction between Schroders Greencoat and METLEN following the ~110 MWp UK solar deal in 2024, deepening bilateral relationship",
      "Schroders Greencoat manages ~£9.7 billion and 430+ renewable infrastructure assets exceeding 7.4 GW net generation capacity globally",
    ],
  },
  // ─── 36. KKR & Singtel – STT GDC ───────────────────────
  {
    id: "INF-2026-036",
    title: "KKR and Singtel enter definitive agreements to acquire 82% controlling stake in STT GDC",
    buyer: "KKR & Singtel",
    seller: "ST Telemedia Global Data Centres (STT GDC)",
    sector: "Digital",
    subsector: "Data Centers",
    region: "Asia-Pacific",
    category: ["Acquisition (Majority Stake)"],
    date: "2026-02-04T12:00:00Z",
    description:
      "KKR and Singtel entered definitive agreements to acquire a controlling 82% stake in ST Telemedia Global Data Centres (STT GDC), a global data center platform.",
    targetDescription:
      "ST Telemedia Global Data Centres (STT GDC), a global data center platform.",
    sourceName: "KKR / Singtel",
    sourceUrl: "https://www.kkr.com/news/2026/kkr-singtel-acquire-stt-gdc/",
    enterpriseValue: "S$13.8 billion (~US$10.9B)",
    equityValue: "S$6.6 billion (~US$5.2B) for 82%",
    stake: "82%",
    status: "Announced",
    closingDate: "H2 2026",
    financialAdvisorBuyer: ["Citi", "Bank of America"],
    financialAdvisorSeller: ["J.P. Morgan"],
    legalAdvisorBuyer: ["Simpson Thacher & Bartlett"],
    legalAdvisorSeller: null,
    country: "Singapore",
    assetScale: "~100 data centers, 12 markets, 2.3 GW design capacity",
    valuationMultiple: null,
    fundVehicle: "KKR Global Infrastructure Investors IV",
    keyHighlights: [
      "S$6.6B (~US$5.2B) in two equal cash tranches for remaining 82% from ST Telemedia (Temasek subsidiary); EV of S$13.8B (~US$10.9B) — Southeast Asia's largest DC deal ever",
      "Post-completion: KKR 75%, Singtel 25%; builds on initial S$1.75B minority investment in June 2024 and KKR's $800M stake in Singtel's Nxera DC business (2023)",
      "~100 data centers across 12 markets in Asia Pacific and UK/Europe with 2.3 GW design capacity, serving hyperscalers and enterprise customers",
      "Consortium secured US$5B in debt facilities for acquisition and future capex; Singtel cash contribution is US$740M",
    ],
  },
  // ─── 37. Igneo – Vault Digital Infrastructure (Altum) ──
  {
    id: "INF-2026-038",
    title: "Igneo acquires Vault Digital Infrastructure (Altum) US data center platform",
    buyer: "Igneo Infrastructure Partners",
    seller: "CVC DIF & Northleaf Capital",
    sector: "Digital",
    subsector: "Data Centers",
    region: "North America",
    category: ["Acquisition (Buyout)", "Sale (Buyout)"],
    date: "2026-02-05T08:00:00Z",
    description:
      "Igneo Infrastructure Partners announced the acquisition of Vault Digital Infrastructure (Altum), a US data center platform, from CVC DIF and Northleaf Capital.",
    targetDescription:
      "Vault Digital Infrastructure (Altum), a US data center platform.",
    sourceName: "Igneo",
    sourceUrl: "https://www.igneoip.com/news/2026/igneo-acquires-vault-digital-infrastructure/",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: ["Gibson Dunn"],
    legalAdvisorSeller: ["Akin Gump"],
    country: "United States",
    assetScale: "75 MW, ~750,000 sq ft, 7 data centers",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Seven colocation/enterprise data centers totaling 75 MW and ~750,000 sq ft in Phoenix, Richardson (TX), Santa Clara, Charlotte, Clarksville (VA), Hazelwood (MO), and Indianapolis",
      "CVC DIF and Northleaf each held 49% (Landmark Dividend 2%); JV created in 2018 and grew from single facility into scaled platform",
      "Rebranded as Altum Digital Infrastructure, led by CEO Timothy Doherty and COO Chris Kent; plans to scale capacity within 18 months",
      "Igneo Infrastructure Partners (direct infrastructure business of First Sentier Investors) manages ~$23B in AUM; all locations characterized by low vacancy and high barriers to entry",
    ],
  },
  // ─── 39. Pilot Fiber – ExteNet Enterprise Fiber ─────────
  {
    id: "INF-2026-039",
    title: "Pilot Fiber agrees to acquire ExteNet Systems enterprise fiber business",
    buyer: "Pilot Fiber",
    seller: "ExteNet Systems",
    sector: "Digital",
    subsector: "Fiber",
    region: "North America",
    category: ["Acquisition (Buyout)"],
    date: "2026-02-05T09:00:00Z",
    description:
      "Pilot Fiber agreed to acquire the metro-focused enterprise fiber business unit carved out from ExteNet Systems.",
    targetDescription:
      "ExteNet Systems enterprise fiber business, a metro-focused enterprise fiber unit.",
    sourceName: "Pilot Fiber",
    sourceUrl: "https://www.pilotfiber.com/news/2026/pilot-fiber-acquires-extenet-enterprise-fiber/",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: ["Bank Street Group"],
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: "300+ miles fiber, 3,500+ businesses, 1,000+ buildings",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Carve-out of enterprise fiber from ExteNet Systems (owned by DigitalBridge and Stonepeak); ExteNet retains core distributed networks, small-cell, and mobility businesses",
      "Acquired assets include Hudson Fiber Network (purpose-built fiber connecting Manhattan to NJ via Hudson River crossing for financial services) and Axiom Fiber Network (high-capacity dark fiber between NYC data centers)",
      "Serves ~200 enterprise, carrier, and institutional customers across financial services, healthcare, media, and higher education",
      "Expands Pilot Fiber's footprint into New Jersey and adds 20+ additional data centers to its network; Pilot owns 300+ miles of fiber throughout NYC serving 3,500+ businesses",
    ],
  },
  // ─── 40. Macquarie – Energy Assets Group (EAG) ─────────
  {
    id: "INF-2026-040",
    title: "Macquarie agrees to acquire 100% of Energy Assets Group, UK utility and metering provider",
    buyer: "Macquarie Asset Management",
    seller: "Asterion Industrial Partners / EDF Invest / Swiss Life",
    sector: "Utilities",
    subsector: "Utility Metering",
    region: "Europe",
    category: ["Acquisition (Buyout)", "Sale (Buyout)"],
    date: "2026-02-05T10:00:00Z",
    description:
      "Macquarie Asset Management agreed to acquire a 100% stake in Energy Assets Group (EAG), a UK vertical utility and metering infrastructure provider.",
    targetDescription:
      "Energy Assets Group (EAG), a UK vertical utility and metering infrastructure provider.",
    sourceName: "Macquarie",
    sourceUrl: "https://www.macquarie.com/news/2026/macquarie-acquires-energy-assets-group/",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United Kingdom",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: "Macquarie Asset Management Infrastructure",
    keyHighlights: [
      "Acquiring 100% from consortium of Asterion Industrial Partners (controller), EDF Invest, and Swiss Life Asset Managers, who purchased EAG in June 2020 from Alinda/Hermes for ~$648M",
      "EAG is the largest independent provider of Industrial & Commercial gas metering services in the UK, headquartered in Livingston, Scotland",
      "Stable, long-term contractual revenue from creditworthy counterparties; provides integrated multi-utility metering services and management",
      "Complements Macquarie's UK smart metering strategy following May 2025 acquisition of Iberdrola's UK smart meter portfolio (2.7M meters) for ~£900M",
      "Macquarie has operated in UK 35+ years, investing and arranging £65B+ in UK infrastructure including stakes in National Gas and Cadent Gas",
    ],
  },
  // ─── 41. Macquarie – Last Mile Infrastructure ──────────
  {
    id: "INF-2026-041",
    title: "Macquarie enters binding agreement to acquire remaining 50% of Last Mile Infrastructure",
    buyer: "Macquarie Asset Management",
    seller: "Infracapital (M&G)",
    sector: "Utilities",
    subsector: "Multi-Utility Connections",
    region: "Europe",
    category: ["Acquisition (Buyout)", "Sale (Majority Stake)"],
    date: "2026-02-05T11:00:00Z",
    description:
      "Macquarie Asset Management entered a binding agreement to acquire the remaining 50% stake in Last Mile Infrastructure, a UK multi-utility connections provider.",
    targetDescription:
      "Last Mile Infrastructure, a UK multi-utility connections provider.",
    sourceName: "Macquarie",
    sourceUrl: "https://www.macquarie.com/news/2026/macquarie-acquires-last-mile-infrastructure/",
    enterpriseValue: null,
    equityValue: null,
    stake: "50% (remaining stake)",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United Kingdom",
    assetScale: "930,000 connections + 725,000 order book",
    valuationMultiple: null,
    fundVehicle: "Macquarie European Infrastructure Fund 7",
    keyHighlights: [
      "MAM acquiring additional 50% from Infracapital (M&G's infrastructure PE arm) for full 100% ownership; initial 50% acquired in 2023 via MEIF 7",
      "Connections base grown from 675,000 to 930,000 electricity, gas, water, and wastewater connections since 2023 partnership, with ~725,000 additional in order book",
      "Under Infracapital ownership (since 2018), grew from regional electricity/gas provider to UK-wide multi-utility business, quadrupling live connections; 800 employees",
      "Supports UK Government target to build 1.5 million new homes by 2029 — designs, installs, owns, and operates last-mile utility connections including smart meters",
      "Macquarie Capital previously owned Last Mile (as 'Energetics') between 2013-2018, giving deep institutional familiarity with the asset",
    ],
  },
  // ─── 42. TPG Rise Climate – Sabre Industries ───────────
  {
    id: "INF-2026-042",
    title: "TPG Rise Climate signs definitive agreements to acquire majority stake in Sabre Industries",
    buyer: "TPG Rise Climate",
    seller: "Blackstone Energy Transition Partners",
    sector: "Power & ET",
    subsector: "Power Transmission & Wireless Towers",
    region: "North America",
    category: ["Acquisition (Majority Stake)", "Sale (Majority Stake)"],
    date: "2026-02-06T08:00:00Z",
    description:
      "TPG Rise Climate signed definitive agreements to acquire a majority stake in Sabre Industries, a manufacturer of power transmission structures and wireless towers.",
    targetDescription:
      "Sabre Industries, a manufacturer of power transmission structures and wireless towers.",
    sourceName: "TPG",
    sourceUrl: "https://www.tpg.com/news/2026/tpg-rise-climate-acquires-sabre-industries/",
    enterpriseValue: "~$3.5 billion",
    equityValue: null,
    stake: "Majority",
    status: "Announced",
    closingDate: "Q2 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: ["Harris Williams", "Jefferies", "Wells Fargo"],
    legalAdvisorBuyer: ["Latham & Watkins", "Kirkland & Ellis"],
    legalAdvisorSeller: ["Vinson & Elkins"],
    country: "United States",
    assetScale: "2.3M+ sq ft manufacturing, ~2,800 employees",
    valuationMultiple: null,
    fundVehicle: "TPG Rise Climate Fund",
    keyHighlights: [
      "Valued at $3.5 billion; TPG Rise Climate acquiring from Blackstone Energy Transition Partners (invested 2021), which retains a significant minority stake",
      "Founded 1977, headquartered in Alvarado, TX; designs, engineers, and manufactures electrical T&D structures, wireless/telecom towers, and integrated electrical enclosures",
      "~2,800 employees and 2.3M+ sq ft of domestic manufacturing; utility business (largest segment) supports grid modernization and reliability",
      "Positioned at intersection of energy transition, AI/data center, and 5G megatrends — enclosures increasingly used for large-scale data center projects",
    ],
  },
  // ─── 43. I Squared Capital – Delaware Basin Residue ────
  {
    id: "INF-2026-043",
    title: "I Squared Capital agrees to acquire 90% interest in Delaware Basin Residue from WhiteWater",
    buyer: "I Squared Capital",
    seller: "WhiteWater",
    sector: "Midstream",
    subsector: "Gas Gathering & Processing",
    region: "North America",
    category: ["Acquisition (Majority Stake)"],
    date: "2026-02-08T08:00:00Z",
    description:
      "I Squared Capital agreed to acquire a 90% interest in Delaware Basin Residue LLC (DBR) from WhiteWater, involving pipeline infrastructure connecting the Permian Basin to the Waha Hub.",
    targetDescription:
      "Delaware Basin Residue LLC (DBR), a midstream pipeline infrastructure platform connecting the Permian Basin to the Waha Hub.",
    sourceName: "Proximo Infra",
    sourceUrl: "https://www.proximoinfra.com/news/62419/i-squared-signs-on-dbr-acquisition-debt",
    enterpriseValue: null,
    equityValue: null,
    stake: "90%",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: "Permian Basin to Waha Hub pipeline system",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Acquiring 90% interest in DBR from WhiteWater, a major midstream operator in the Permian Basin",
      "Pipeline infrastructure connects the prolific Delaware Basin to the Waha Hub, a key natural gas trading point in West Texas",
      "Permian Basin remains the most active U.S. production basin, driving continued demand for residue gas takeaway capacity",
    ],
  },
  // ─── 44. 3i Infrastructure – Centrica Energy Solutions ─
  {
    id: "INF-2026-044",
    title: "3i Infrastructure's Joulz completes acquisition of Centrica Energy Solutions in Italy and Netherlands",
    buyer: "3i Infrastructure (via Joulz)",
    seller: "Centrica",
    sector: "Power & ET",
    subsector: "Energy Solutions",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-02-09T08:00:00Z",
    description:
      "3i Infrastructure portfolio company Joulz completed the acquisition of Centrica's energy solutions businesses in Italy and the Netherlands, expanding its European energy infrastructure platform.",
    targetDescription:
      "Centrica Energy Solutions, the energy solutions businesses of Centrica operating in Italy and the Netherlands.",
    sourceName: "Centrica",
    sourceUrl: "https://www.centrica.com/media-centre/news/2026/sale-of-european-energy-solutions-businesses-and-panoramic-power/",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Closed",
    closingDate: "February 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Italy / Netherlands",
    assetScale: "Energy solutions operations across Italy and the Netherlands",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Bolt-on acquisition by Joulz, a 3i Infrastructure portfolio company focused on energy infrastructure services",
      "Expands Joulz's European footprint into Italy and the Netherlands through Centrica's established energy solutions operations",
      "Aligns with 3i Infrastructure's strategy of building scale in essential energy infrastructure platforms",
    ],
  },
  // ─── 45. InfraBridge & Equitix – Truespeed ─────────────
  {
    id: "INF-2026-046",
    title: "Freedom Fibre merges with Truespeed to create 412,000-premise fiber platform",
    buyer: "InfraBridge / Equitix (via Freedom Fibre)",
    seller: "Truespeed",
    sector: "Digital",
    subsector: "Fiber Broadband",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-02-11T08:00:00Z",
    description:
      "Freedom Fibre, backed by InfraBridge and Equitix, merged with Truespeed to create a combined fiber broadband platform passing 412,000 premises across the UK.",
    targetDescription:
      "Truespeed, a UK-based fiber broadband provider, merged with Freedom Fibre to create a combined platform.",
    sourceName: "Freedom Fibre",
    sourceUrl: "https://www.freedomfibre.com/post/freedom-fibre-and-truespeed-announce-intention-to-merge",
    enterpriseValue: null,
    equityValue: null,
    stake: "100% (merger)",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United Kingdom",
    assetScale: "412,000 premises passed (combined)",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Strategic merger between Freedom Fibre (backed by InfraBridge and Equitix) and Truespeed, creating a scaled UK fiber platform",
      "Combined entity passes 412,000 premises, significantly increasing competitive positioning in underserved UK broadband markets",
      "Consolidation play in the fragmented UK alt-net sector, following a wave of fiber M&A activity",
    ],
  },
  // ─── 47. Blackstone & EQT – Urbaser ────────────────────
  {
    id: "INF-2026-047",
    title: "Blackstone and EQT jointly acquire Urbaser from Platinum Equity for ~$6.6 billion",
    buyer: "Blackstone / EQT",
    seller: "Platinum Equity",
    sector: "Environmental",
    subsector: "Waste Management",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-02-12T08:00:00Z",
    description:
      "Blackstone and EQT jointly acquired Urbaser, a Spain-based global waste management leader, from Platinum Equity for approximately $6.6 billion.",
    targetDescription:
      "Urbaser, a Spain-headquartered global leader in waste management and environmental services.",
    sourceName: "Blackstone",
    sourceUrl: "https://www.blackstone.com/news/press/blackstone-infrastructure-and-eqt-to-acquire-urbaser/",
    enterpriseValue: "~$6.6 billion",
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Spain",
    assetScale: "Global waste management platform",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Joint acquisition by Blackstone and EQT of Urbaser from Platinum Equity at an enterprise value of approximately $6.6 billion",
      "Urbaser is a Spain-headquartered global leader in waste management, environmental services, and water treatment",
      "One of the largest environmental infrastructure transactions in recent years, reflecting strong investor appetite for essential waste services",
      "Platinum Equity acquired Urbaser in 2020; the exit represents a significant return on a complex cross-border carve-out",
    ],
  },
  // ─── 48. Temasek – CleanMax ────────────────────────────
  {
    id: "INF-2026-048",
    title: "Temasek leads ~$142M pre-IPO investment in CleanMax for 6.79% stake",
    buyer: "Temasek",
    seller: "CleanMax (primary issuance)",
    sector: "Power & ET",
    subsector: "Renewable Energy (C&I Solar)",
    region: "Asia-Pacific",
    category: ["Acquisition (Minority Stake)"],
    date: "2026-02-12T09:00:00Z",
    description:
      "Temasek invested approximately ₹760 crore as part of a $142 million pre-IPO funding round for a 6.79% stake in CleanMax, India's largest commercial and industrial renewable energy provider.",
    targetDescription:
      "CleanMax, India's largest commercial and industrial (C&I) renewable energy provider.",
    sourceName: "SolarQuarter",
    sourceUrl: "https://solarquarter.com/2026/02/09/cleanmax-enviro-nears-%E2%82%B91500-cr-pre-ipo-round-with-temasek-backing/",
    enterpriseValue: null,
    equityValue: "~$142M (total round)",
    stake: "6.79%",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "India",
    assetScale: "India's largest C&I renewable energy platform",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Pre-IPO growth investment of ~₹760 crore (~$142M total round with co-investors) for a 6.79% stake in CleanMax",
      "CleanMax is India's largest commercial and industrial (C&I) renewable energy provider, serving corporates with on-site and off-site solar solutions",
      "Investment positions Temasek ahead of CleanMax's anticipated public listing, reflecting conviction in India's C&I clean energy transition",
    ],
  },
  // ─── 49. I Squared Capital / CPP Investments – Inkia Energy ─
  {
    id: "INF-2026-049",
    title: "CPP Investments acquires 50% of Inkia Energy from I Squared Capital at $3.4B TEV",
    buyer: "CPP Investments",
    seller: "I Squared Capital",
    sector: "Power & ET",
    subsector: "Power Generation",
    region: "Latin America",
    category: ["Sale (Majority Stake)", "Acquisition (Majority Stake)"],
    date: "2026-02-12T10:00:00Z",
    description:
      "CPP Investments signed a definitive agreement to acquire a 50% stake in Inkia Energy at a total enterprise value of $3.4 billion. I Squared Capital rolled the remaining 50% into a new GP-led continuation vehicle.",
    targetDescription:
      "Inkia Energy, a Peruvian power generation platform with diversified generation assets across Latin America.",
    sourceName: "CPP Investments (Newswire)",
    sourceUrl: "https://www.newswire.ca/news-releases/cpp-investments-to-invest-in-inkia-alongside-i-squared-capital-811136352.html",
    enterpriseValue: "$3.4 billion",
    equityValue: null,
    stake: "50% (sold to CPP) / 50% (rolled into continuation vehicle)",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Peru",
    assetScale: "Diversified Latin American power generation portfolio",
    valuationMultiple: null,
    fundVehicle: "I Squared Capital Continuation Vehicle",
    keyHighlights: [
      "CPP Investments acquiring a 50% stake in Inkia Energy from I Squared Capital at a total enterprise value of $3.4 billion",
      "I Squared Capital rolled the remaining 50% into a new GP-led continuation vehicle, maintaining exposure while providing liquidity to existing fund investors",
      "Inkia Energy is one of the largest independent power producers in Peru with a diversified generation portfolio across Latin America",
    ],
  },
  // ─── 51. InfraRed (TRIG) – Fig Power ──────────────────
  {
    id: "INF-2026-051",
    title: "InfraRed's TRIG acquires 100% of Fig Power and its 1.7 GW UK battery development pipeline",
    buyer: "InfraRed Capital Partners (via TRIG)",
    seller: "Fig Power",
    sector: "Power & ET",
    subsector: "Battery Storage",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-02-12T12:00:00Z",
    description:
      "The Renewables Infrastructure Group (TRIG), managed by InfraRed Capital Partners, acquired 100% of Fig Power, a battery storage developer with a 1.7 GW UK development pipeline.",
    targetDescription:
      "Fig Power, a UK-based battery storage developer with a 1.7 GW development pipeline.",
    sourceName: "TRIG",
    sourceUrl: "https://www.trig-ltd.com/news-media/news/trig-acquires-fig-power-a-uk-energy-projects-developer/",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United Kingdom",
    assetScale: "1.7 GW UK battery storage development pipeline",
    valuationMultiple: null,
    fundVehicle: "The Renewables Infrastructure Group (TRIG)",
    keyHighlights: [
      "TRIG (managed by InfraRed) acquired 100% of Fig Power, gaining access to a substantial 1.7 GW UK battery energy storage development pipeline",
      "Battery storage is a key enabler for the UK's renewable energy transition, providing grid flexibility and balancing services",
      "Acquisition reflects growing infrastructure investor appetite for development-stage battery storage platforms ahead of the UK's 2035 clean power target",
    ],
  },
  // ─── 52. CVC (CVC DIF) – American Roads ───────────────
  {
    id: "INF-2026-052",
    title: "CVC DIF agrees to sell American Roads toll bridge and tunnel platform to John Laing Group",
    buyer: "John Laing Group",
    seller: "CVC (CVC DIF)",
    sector: "Transportation",
    subsector: "Toll Roads & Bridges",
    region: "North America",
    category: ["Sale (Buyout)", "Acquisition (Buyout)"],
    date: "2026-02-13T08:00:00Z",
    description:
      "CVC DIF agreed to sell American Roads, a toll bridge and tunnel platform including the Detroit-Windsor Tunnel, to John Laing Group in a full divestiture.",
    targetDescription:
      "American Roads, a toll bridge and tunnel platform including the Detroit-Windsor Tunnel connecting the United States and Canada.",
    sourceName: "CVC",
    sourceUrl: "https://www.cvc.com/media/news/2026/cvc-dif-agrees-sale-of-american-roads-to-john-laing/",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: "Toll bridge and tunnel portfolio including Detroit-Windsor Tunnel",
    valuationMultiple: null,
    fundVehicle: "CVC DIF",
    keyHighlights: [
      "Full divestiture by CVC DIF of the American Roads platform, including the iconic Detroit-Windsor Tunnel connecting Detroit, MI to Windsor, Ontario",
      "John Laing Group, a leading international infrastructure investor, acquires the toll bridge and tunnel portfolio",
      "The Detroit-Windsor Tunnel is one of only two vehicular border crossings between the U.S. and Canada at Detroit, handling significant cross-border traffic",
    ],
  },
  // ─── 50. DWS Infrastructure / Infracapital – Corelink Rail ────
  {
    id: "INF-2026-050",
    title: "DWS Infrastructure and Infracapital sell Corelink Rail Infrastructure to Porterbrook",
    buyer: "Porterbrook",
    seller: "DWS Infrastructure / Infracapital",
    sector: "Transportation",
    subsector: "Rolling Stock Leasing",
    region: "Europe",
    category: ["Sale (Buyout)"],
    date: "2026-01-08T10:00:00Z",
    description:
      "DWS Infrastructure and Infracapital sold 100% of Corelink Rail Infrastructure, a rolling stock lessor, to Porterbrook.",
    targetDescription:
      "Corelink Rail Infrastructure, a rolling stock leasing company.",
    sourceName: "DWS Infrastructure",
    sourceUrl: "https://www.railwaygazette.com/uk/porterbrook-acquires-corelink-multiple-units/70232.article",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United Kingdom",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Full exit by DWS Infrastructure and Infracapital of Corelink Rail Infrastructure, a rolling stock leasing platform",
      "Acquired by Porterbrook, one of the UK's three major rolling stock companies (ROSCOs)",
    ],
  },
  // ─── 53. Tiger Infrastructure – 11:11 Systems / Ntirety ──────
  {
    id: "INF-2026-053",
    title: "Tiger-backed 11:11 Systems acquires Ntirety managed cloud and security platform",
    buyer: "Tiger Infrastructure Partners (via 11:11 Systems)",
    seller: "Ntirety",
    sector: "Digital",
    subsector: "Managed Cloud & Security",
    region: "North America",
    category: ["Acquisition (Buyout)"],
    date: "2026-01-08T11:00:00Z",
    description:
      "Tiger Infrastructure's portfolio company 11:11 Systems acquired Ntirety, a managed cloud and security services provider.",
    targetDescription:
      "Ntirety, a managed cloud and security services provider.",
    sourceName: "Tiger Infrastructure Partners",
    sourceUrl: "https://www.businesswire.com/news/home/20260108600465/en/1111-Systems-Successfully-Completes-Acquisition-of-Ntirety",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "11:11 Systems (backed by Tiger Infrastructure Partners) acquires Ntirety to expand managed cloud and security capabilities",
      "Bolsters 11:11 Systems' position as a comprehensive managed infrastructure and security platform",
    ],
  },
  // ─── 54. CPP Investments – Cordelio Power ─────────────────────
  {
    id: "INF-2026-054",
    title: "CPP Investments exits Cordelio Power, acquired by Pattern Energy",
    buyer: "Pattern Energy",
    seller: "CPP Investments",
    sector: "Power & ET",
    subsector: "Renewable Energy",
    region: "North America",
    category: ["Sale (Buyout)"],
    date: "2026-01-09T09:00:00Z",
    description:
      "CPP Investments exited its ownership of Cordelio Power, a 1,550+ MW renewable energy platform, which was acquired by Pattern Energy.",
    targetDescription:
      "Cordelio Power, a 1,550+ MW renewable energy platform across North America.",
    sourceName: "CPP Investments",
    sourceUrl: "https://patternenergy.com/pattern-energy-announces-agreement-to-acquire-cordelio-power/",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Canada",
    assetScale: "1,550+ MW renewable energy",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "CPP Investments fully exited Cordelio Power, a diversified renewable energy platform with 1,550+ MW of capacity",
      "Pattern Energy acquired the platform, expanding its North American renewables portfolio",
    ],
  },
  // ─── 55. Ardian – Furukraft Wind Farm ─────────────────────────
  {
    id: "INF-2026-055",
    title: "Ardian acquires 62 MW Furukraft wind farm in Sweden from ERG",
    buyer: "Ardian",
    seller: "ERG",
    sector: "Power & ET",
    subsector: "Onshore Wind",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-01-20T10:00:00Z",
    description:
      "Ardian, via its Clean Energy Evergreen Fund (Enordic Evergreen), acquired the 62 MW Furukraft wind farm in Sweden from ERG, with a long-term PPA.",
    targetDescription:
      "Furukraft, a 62 MW onshore wind farm located in Sweden.",
    sourceName: "Ardian",
    sourceUrl: "https://globallegalchronicle.com/post-227343/",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Sweden",
    assetScale: "62 MW onshore wind",
    valuationMultiple: null,
    fundVehicle: "Ardian Clean Energy Evergreen Fund (Enordic Evergreen)",
    keyHighlights: [
      "Acquisition of the 62 MW Furukraft wind farm in Sweden from ERG via Ardian's Clean Energy Evergreen Fund / Enordic Evergreen vehicle",
      "Secured with a long-term power purchase agreement providing stable contracted revenue",
    ],
  },
  // ─── 56. InfraVia – Prosolia Energy / EDP Solar ───────────────
  {
    id: "INF-2026-056",
    title: "InfraVia's Prosolia Energy acquires 229 MW Spanish solar portfolio from EDP Renováveis",
    buyer: "InfraVia Capital Partners (via Prosolia Energy)",
    seller: "EDP Renováveis",
    sector: "Power & ET",
    subsector: "Solar",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-01-20T11:00:00Z",
    description:
      "InfraVia's portfolio company Prosolia Energy acquired a 229 MW operational solar portfolio in Spain from EDP Renováveis.",
    targetDescription:
      "A 229 MW operational solar portfolio located in Spain.",
    sourceName: "InfraVia Capital Partners",
    sourceUrl: "https://edp.com/en/about-us/edp-completes-asset-rotation-deal-190-mwac-229-mwdc-solar-portfolio-spain",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Spain",
    assetScale: "229 MW operational solar",
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "Prosolia Energy (backed by InfraVia Capital Partners) acquired a 229 MW operational solar portfolio in Spain from EDP Renováveis",
      "Expands Prosolia's European solar platform with fully operational Spanish assets",
    ],
  },
  // ─── 57. DigitalBridge – Vantage Data Centers APAC ────────────
  {
    id: "INF-2026-057",
    title: "DigitalBridge sells minority stake in Vantage Data Centers APAC to Aware Super",
    buyer: "Aware Super",
    seller: "DigitalBridge",
    sector: "Digital",
    subsector: "Data Centers",
    region: "Asia-Pacific",
    category: ["Sale (Minority Stake)"],
    date: "2026-01-22T11:00:00Z",
    description:
      "DigitalBridge sold a minority stake in Vantage Data Centers' Asia-Pacific operations to Aware Super for $300 million.",
    targetDescription:
      "Vantage Data Centers APAC, the Asia-Pacific operations of Vantage Data Centers.",
    sourceName: "DigitalBridge",
    sourceUrl: "https://www.digitalbridge.com/news/2026-01-20-aware-super-extends-digital-infrastructure-footprint-with-us-300-million-apac-data-centre-business-investment",
    enterpriseValue: null,
    equityValue: "$300 million",
    stake: "Minority",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Australia",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "DigitalBridge sold a minority stake in Vantage Data Centers' APAC platform to Aware Super for $300 million",
      "Aware Super is Australia's largest industry superannuation fund, increasing its infrastructure exposure through data center investments",
    ],
  },
  // ─── 58. DWS Infrastructure – Norwegian Travel ───────────────
  {
    id: "INF-2026-058",
    title: "DWS Infrastructure acquires Norwegian Travel gondola and rail operations from Longship",
    buyer: "DWS Infrastructure",
    seller: "Longship",
    sector: "Transportation",
    subsector: "Tourism Infrastructure",
    region: "Europe",
    category: ["Acquisition (Buyout)"],
    date: "2026-01-23T08:00:00Z",
    description:
      "DWS Infrastructure acquired Norwegian Travel, a gondola and rail operations platform, from Longship.",
    targetDescription:
      "Norwegian Travel, a gondola and scenic rail operations platform in Norway.",
    sourceName: "DWS Infrastructure",
    sourceUrl: "https://www.longship.no/en/investment/norwegian-travel/",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "Norway",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "DWS Infrastructure acquired Norwegian Travel's gondola and scenic rail operations from Longship",
      "Tourism infrastructure platform providing essential transport services in Norway",
    ],
  },
  // ─── 59. Igneo – US Signal / Aurora Data Center ──────────────
  {
    id: "INF-2026-059",
    title: "Igneo's US Signal acquires Aurora, IL data center for edge and cloud expansion",
    buyer: "Igneo Infrastructure Partners (via US Signal)",
    seller: "Undisclosed Seller",
    sector: "Digital",
    subsector: "Data Centers",
    region: "North America",
    category: ["Acquisition (Buyout)"],
    date: "2026-01-30T11:00:00Z",
    description:
      "Igneo Infrastructure Partners' portfolio company US Signal acquired a data center in Aurora, Illinois for edge and cloud expansion.",
    targetDescription:
      "A data center located in Aurora, Illinois.",
    sourceName: "Igneo Infrastructure Partners",
    sourceUrl: "https://www.prnewswire.com/news-releases/us-signal-expands-data-center-footprint-with-acquisition-of-new-facility-in-aurora-il-launches-immediate-capacity-and-cloud-investment-302674607.html",
    enterpriseValue: null,
    equityValue: null,
    stake: "100%",
    status: "Closed",
    closingDate: "January 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "US Signal (backed by Igneo Infrastructure Partners) acquired a data center in Aurora, IL to expand edge and cloud capabilities",
      "Strengthens US Signal's Midwest data center footprint and connectivity platform",
    ],
  },
  // ─── 60. GIC – IndiGrid Infrastructure Trust ─────────────────
  {
    id: "INF-2026-060",
    title: "GIC sells 7.36% stake in IndiGrid Infrastructure Trust via OFS",
    buyer: "Public Market",
    seller: "GIC",
    sector: "Power & ET",
    subsector: "Power Transmission",
    region: "Asia-Pacific",
    category: ["Sale (Minority Stake)"],
    date: "2026-02-06T08:00:00Z",
    description:
      "GIC sold a 7.36% stake in IndiGrid Infrastructure Trust via an offer for sale (OFS) on Indian exchanges.",
    targetDescription:
      "IndiGrid Infrastructure Trust, an Indian infrastructure investment trust focused on power transmission assets.",
    sourceName: "GIC",
    sourceUrl: "https://solarquarter.com/2026/02/06/government-of-singapore-expands-indigrid-invit-divestment-to-7-36-stake-via-oversubscription-option/",
    enterpriseValue: null,
    equityValue: null,
    stake: "7.36%",
    status: "Closed",
    closingDate: "February 2026",
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "India",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [
      "GIC disposed of a 7.36% stake in IndiGrid Infrastructure Trust via an offer for sale (OFS) on Indian stock exchanges",
      "IndiGrid is India's first infrastructure investment trust (InvIT), focused on power transmission assets",
    ],
  },
];

// Helper to get sector color
export function getSectorColor(sector: DealSector): string {
  switch (sector) {
    case "Transportation":
      return "#8b5cf6";
    case "Power & ET":
      return "#f59e0b";
    case "Midstream":
      return "#f97316";
    case "Utilities":
      return "#06b6d4";
    case "Environmental":
      return "#10b981";
    case "Digital":
      return "#3b82f6";
    case "Social":
      return "#ec4899";
    default:
      return "#a1a1aa";
  }
}

// Helper to get category badge color
export function getCategoryColor(category: DealCategory): string {
  if (category.startsWith("Acquisition")) return "#3b82f6";
  if (category.startsWith("Sale")) return "#f59e0b";
  if (category === "Platform Launch") return "#06b6d4";
  if (category === "IPO") return "#10b981";
  if (category === "Joint Venture") return "#06b6d4";
  return "#a1a1aa";
}

// Helper to get region color
export function getRegionColor(region: DealRegion): string {
  switch (region) {
    case "North America":
      return "#3b82f6";
    case "Europe":
      return "#8b5cf6";
    case "Asia-Pacific":
      return "#f59e0b";
    case "Middle East & Africa":
      return "#10b981";
    case "Latin America":
      return "#ec4899";
    default:
      return "#a1a1aa";
  }
}

// Utility: format date for display
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Utility: format time
export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Get aggregate stats
export function getDealStats() {
  const sectorCounts = deals.reduce(
    (acc, d) => {
      acc[d.sector] = (acc[d.sector] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topSector = Object.entries(sectorCounts).sort(
    ([, a], [, b]) => b - a,
  )[0];

  const categoryCounts = deals.reduce(
    (acc, d) => {
      for (const cat of d.category) {
        const base = cat.split(" (")[0];
        acc[base] = (acc[base] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const topCategory = Object.entries(categoryCounts).sort(
    ([, a], [, b]) => b - a,
  )[0];

  return {
    totalCount: deals.length,
    sectorCounts,
    topSector: topSector[0] as DealSector,
    topSectorCount: topSector[1],
    topCategory: topCategory[0],
    topCategoryCount: topCategory[1],
  };
}

// Get deals sorted by most recent
export function getRecentDeals(): Deal[] {
  return [...deals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

// Get deals from the past 7 days
export function getWeeklyDeals(): Deal[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return deals
    .filter((d) => new Date(d.date) >= weekAgo)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get region stats
export function getRegionStats() {
  const regionCounts = deals.reduce(
    (acc, d) => {
      acc[d.region] = (acc[d.region] || 0) + 1;
      return acc;
    },
    {} as Record<DealRegion, number>,
  );

  const sorted = Object.entries(regionCounts).sort(([, a], [, b]) => b - a);

  return {
    regionCounts,
    topRegion: sorted[0][0] as DealRegion,
    topRegionCount: sorted[0][1],
    topRegionShare: Math.round((sorted[0][1] / deals.length) * 100),
  };
}

// Generate market narrative based on stats
export function getMarketNarrative(): {
  headline: string;
  subtext: string;
  sentiment: "concentrated" | "leading" | "balanced";
} {
  const stats = getDealStats();
  const topSectorShare = (stats.topSectorCount / stats.totalCount) * 100;

  if (topSectorShare > 40) {
    return {
      headline: "is dominating",
      subtext: `commanding ${Math.round(topSectorShare)}% of all activity`,
      sentiment: "concentrated",
    };
  } else if (topSectorShare > 25) {
    return {
      headline: "is leading the market",
      subtext: `with ${stats.topSectorCount} deals this month`,
      sentiment: "leading",
    };
  } else {
    return {
      headline: "leads a diversified market",
      subtext: `across ${Object.keys(stats.sectorCounts).length} active sectors`,
      sentiment: "balanced",
    };
  }
}

// Get sector distribution sorted by count
export function getSectorDistribution(): Array<{
  sector: DealSector;
  count: number;
  percentage: number;
}> {
  const stats = getDealStats();
  return Object.entries(stats.sectorCounts)
    .map(([sector, count]) => ({
      sector: sector as DealSector,
      count,
      percentage: (count / stats.totalCount) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}
