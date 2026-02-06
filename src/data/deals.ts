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

export interface Deal {
  id: string;
  title: string;
  buyer: string;
  seller: string;
  sector: DealSector;
  subsector: string;
  region: DealRegion;
  category: DealCategory;
  date: string;
  description: string;
  targetDescription: string;
  sourceName: string;
  sourceUrl: string;
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
    category: "Acquisition (Buyout)",
    date: "2026-01-16T08:00:00Z",
    description:
      "Actis announced the acquisition of a 100% stake in the Vindhyachal Expressway in India from Kalpataru Projects International Limited for an enterprise value of ~₹775 crore.",
    targetDescription:
      "Vindhyachal Expressway Private Limited (VEPL), a road infrastructure asset in India.",
    sourceName: "Actis",
    sourceUrl: "https://www.bseindia.com/xml-data/corpfiling/AttachLive/be947c62-f3c2-4bc9-bf0f-6dc6c57fe073.pdf",
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
    category: "Acquisition (Minority Stake)",
    date: "2026-01-09T08:00:00Z",
    description:
      "ADIA acquired a ~3.17% stake (33.3 million shares) in Helios Towers via a secondary placing from Danish pension fund ATP.",
    targetDescription:
      "Helios Towers, a leading independent telecommunications tower company in Africa and the Middle East.",
    sourceName: "ADIA",
    sourceUrl: "https://www.investegate.co.uk/announcement/rns/helios-towers--htws/proposed-secondary-placing-in-helios-towers-plc/8559982",
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
    category: "Acquisition (Minority Stake)",
    date: "2026-01-22T08:00:00Z",
    description:
      "Allianz acquired a 20.25% minority stake in this 496 MW French offshore wind farm (currently under construction) from Ocean Winds.",
    targetDescription:
      "Îles d'Yeu et Noirmoutier, a 496 MW offshore wind farm off the coast of Vendée, France, currently under construction.",
    sourceName: "Allianz GI",
    sourceUrl: "https://www.allianzgi.com/en/press-centre/media/press-releases/20260122-allianz-invests-in-the-500mw-french-offshore-wind-farm-iles-dyeu-et-noirmoutier",
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
    category: "Acquisition (Majority Stake)",
    date: "2026-01-08T08:00:00Z",
    description:
      "Antin announced the acquisition of a majority stake in Emsere, a provider of mission-critical logistics for medical clinical trials, from Gryphion via its Mid Cap Fund I.",
    targetDescription:
      "Emsere, a provider of mission-critical logistics and equipment services for medical clinical trials.",
    sourceName: "Antin",
    sourceUrl: "https://www.businesswire.com/news/home/20260107074378/en/Antin-to-Acquire-Emsere-a-Global-Leader-in-Clinical-Trial-Equipment-Infrastructure",
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
    category: "Sale (Minority Stake)",
    date: "2026-01-20T08:00:00Z",
    description:
      "APG announced the sale of its 10% equity stake in Exolum to a consortium led by Banca March and Stoneshield Capital.",
    targetDescription:
      "Exolum (formerly CLH), a European leader in liquid bulk storage and logistics infrastructure.",
    sourceName: "APG",
    sourceUrl: "https://assetmanagement.apg.nl/publications/apg-has-sold-its-10-stake-in-exolum-to-a-consortium-led-by-banca-march-and-stoneshield-capital/",
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
    category: "Acquisition (Minority Stake)",
    date: "2026-01-20T09:00:00Z",
    description:
      "Ara Partners participated in a Series B/C equivalent growth funding round for portfolio company Divert, Inc. to scale facilities in Washington and North Carolina.",
    targetDescription:
      "Divert, Inc., an impact technology company converting wasted food into renewable natural gas.",
    sourceName: "Ara Partners",
    sourceUrl: "https://www.businesswire.com/news/home/20260120452855/en/Divert-Inc.-Secures-Funding-to-Scale-Infrastructure-Addressing-the-Wasted-Food-Crisis-in-North-America",
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
    category: "Acquisition (Minority Stake)",
    date: "2026-01-13T08:00:00Z",
    description:
      "Ares expanded its partnership with ENGIE by acquiring an equity stake in a 730 MW portfolio of wind and solar assets in the US (ERCOT market).",
    targetDescription:
      "A 730 MW portfolio of wind and solar assets in the US ERCOT market operated by ENGIE North America.",
    sourceName: "Ares Management",
    sourceUrl: "https://www.prnewswire.com/news-releases/engie-and-ares-partnership-further-expands-with-addition-of-730-mw-portfolio-of-new-us-solar-and-wind-assets-302659666.html",
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
    category: "Platform Launch",
    date: "2026-01-14T08:00:00Z",
    description:
      "Asterion committed €1.5 billion (including €800 million in equity) to scale its ABIO platform, targeting 20 operational biomethane plants by the end of 2026.",
    targetDescription:
      "Asterion Bioenergy (ABIO), an integrated pan-European biomethane production and distribution platform.",
    sourceName: "Asterion",
    sourceUrl: "https://www.asterionindustrial.com/asterion-to-invest-e1-5-bn-into-european-biomethane/",
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
    category: "Sale (Buyout)",
    date: "2026-01-29T08:00:00Z",
    description:
      "BIP agreed to sell the largest of its four Brazilian electricity transmission concessions (1,200 km) for approximately $150 million in net proceeds.",
    targetDescription:
      "A 1,200 km Brazilian electricity transmission concession, the largest in BIP's portfolio of four concessions.",
    sourceName: "Brookfield",
    sourceUrl: "https://bip.brookfield.com/press-releases/bip/brookfield-infrastructure-reports-solid-2025-year-end-results-declares-17th",
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
    category: "Sale (Majority Stake)",
    date: "2026-01-30T08:00:00Z",
    description:
      "BEP announced an agreement to sell a two-thirds stake in a utility-scale portfolio of operating wind and solar projects in the US for ~$860 million in gross proceeds.",
    targetDescription:
      "A utility-scale portfolio of operating wind and solar projects in the United States.",
    sourceName: "Brookfield",
    sourceUrl: "https://www.globenewswire.com/news-release/2026/01/30/3229438/0/en/Brookfield-Renewable-Reports-Strong-2025-Results-and-Announces-5-Distribution-Increase.html",
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
    category: "Sale (Minority Stake)",
    date: "2026-01-26T08:00:00Z",
    description:
      "CDPQ announced the sale of an ~11% block of shares in Cogeco for C$229 million, while retaining its position as the largest holder of subordinate shares.",
    targetDescription:
      "Cogeco Communications Inc., a Canadian broadband and telecommunications company.",
    sourceName: "CDPQ",
    sourceUrl: "https://www.newswire.ca/news-releases/la-caisse-to-sell-part-of-its-stake-in-cogeco-communications-883137758.html",
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
    category: "Sale (Minority Stake)",
    date: "2026-01-30T09:00:00Z",
    description:
      "CIP agreed to divest a 10% equity stake in the 495 MW Fengmiao I project to Mitsui O.S.K. Lines.",
    targetDescription:
      "Fengmiao I, a 495 MW offshore wind farm project in Taiwan.",
    sourceName: "CIP",
    sourceUrl: "https://www.globenewswire.com/news-release/2025/05/09/3077962/0/en/Copenhagen-Infrastructure-Partners-divests-10-stake-in-Fengmiao-I.html",
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
    category: "Sale (Majority Stake)",
    date: "2026-01-30T10:00:00Z",
    description:
      "CIP agreed to divest a 50% stake in the Coalburn 2 battery energy storage system in Scotland to AIP Management.",
    targetDescription:
      "Coalburn 2, a battery energy storage system (BESS) located in Scotland.",
    sourceName: "CIP",
    sourceUrl: "https://www.globenewswire.com/news-release/2025/10/15/3166846/0/en/Copenhagen-Infrastructure-Partners-divests-50-of-Coalburn-2-to-AIP-Management.html",
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
    category: "Acquisition (Buyout)",
    date: "2026-01-08T09:00:00Z",
    description:
      "CVC DIF agreed to acquire iPark, a leading Iberian parking platform with 30,000+ spaces, from Elliott Investment Management.",
    targetDescription:
      "iPark, a leading operator of off-street parking concessions in Spain and Portugal with over 30,000 spaces.",
    sourceName: "CVC",
    sourceUrl: "https://www.cvc.com/media/news/2026/cvc-dif-to-acquire-leading-iberian-parking-infrastructure-platform-ipark-from-elliott-investment-management/",
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
    category: "Acquisition (Majority Stake)",
    date: "2026-01-14T08:00:00Z",
    description:
      "CVC DIF entered exclusive negotiations to acquire a majority stake (~88%) in Celeste, a French B2B fiber operator, from InfraVia Capital Partners.",
    targetDescription:
      "Celeste, a French B2B fiber and cloud infrastructure operator.",
    sourceName: "CVC",
    sourceUrl: "https://www.cvc.com/media/news/2026/cvc-dif-has-entered-exclusive-negotiations-to-acquire-a-significant-majority-stake-in-celeste/",
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
    category: "Platform Launch",
    date: "2026-01-19T08:00:00Z",
    description:
      "EnCap launched Quantica Infrastructure to develop \"shovel-ready\" data center sites in the US.",
    targetDescription:
      "Quantica Infrastructure, a new platform focused on developing shovel-ready data center sites in the United States.",
    sourceName: "EnCap",
    sourceUrl: "https://www.encapinvestments.com/news/encap-investments-lp-launches-quantica-infrastructure-deliver-integrated-ai-and-hyperscale",
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
    category: "Sale (Buyout)",
    date: "2026-01-15T08:00:00Z",
    description:
      "ECP agreed to sell the Cornerstone portfolio to Talen Energy for $3.45 billion.",
    targetDescription:
      "The Cornerstone portfolio comprising the Waterford and Darby natural gas power generation plants.",
    sourceName: "ECP",
    sourceUrl: "https://www.bridgepointgroup.com/about-us/news-and-insights/press-releases/2026/energy-capital-partners-ecp-agrees-to-sell-cornerstone-to-talen-energy",
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
    category: "Acquisition (Minority Stake)",
    date: "2026-01-06T08:00:00Z",
    description:
      "Equitix announced the acquisition of stakes in 10 UK assets (OFTOs, PFI lighting, roads) from Balfour Beatty. The deal was signed/completed in Dec 2025 but announced in Jan 2026.",
    targetDescription:
      "A diversified portfolio of 10 UK infrastructure assets including offshore transmission owners (OFTOs), PFI lighting, and road concessions.",
    sourceName: "Equitix",
    sourceUrl: "https://www.balfourbeatty.com/media-centre/latest/balfour-beatty-completes-disposal-of-ten-infrastructure-investments-assets/",
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
    category: "Acquisition (Majority Stake)",
    date: "2026-01-13T08:00:00Z",
    description:
      "Equitix announced it increased its stake in its partnership with ACEA to 90% and funded the acquisition of additional solar assets.",
    targetDescription:
      "A portfolio of photovoltaic solar plants in Italy operated through a joint venture with ACEA.",
    sourceName: "Equitix",
    sourceUrl: "https://irei.com/news/equitix-expands-clean-energy-partnership-with-italys-acea/",
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
    category: "Sale (Minority Stake)",
    date: "2026-01-27T08:00:00Z",
    description:
      "GIP agreed to sell a 7.6% equity interest in Trains 4 and 5 of the Rio Grande LNG export project to an investment vehicle of the Abu Dhabi ruling family.",
    targetDescription:
      "Trains 4 and 5 of the Rio Grande LNG export project in Texas.",
    sourceName: "GIP",
    sourceUrl: "https://www.thenationalnews.com/business/energy/2026/01/26/abu-dhabis-xrg-raises-stake-in-rio-grande-lng-project-in-texas/",
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
    category: "Acquisition (Buyout)",
    date: "2026-01-07T08:00:00Z",
    description:
      "I Squared reached an agreement to acquire Ramudden Global, a provider of temporary traffic management services, from Triton Partners.",
    targetDescription:
      "Ramudden Global, a leading provider of temporary traffic management and work zone safety services.",
    sourceName: "I Squared Capital",
    sourceUrl: "https://isquaredcapital.com/cpt_news/i-squared-capital-acquires-ramudden-global-a-leader-in-traffic-management-and-infrastructure-safety/",
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
    category: "Platform Launch",
    date: "2026-01-15T09:00:00Z",
    description:
      "I Squared launched ANZA Power with a $300 million equity commitment to develop solar, wind, and storage assets in Australia and New Zealand.",
    targetDescription:
      "ANZA Power, a new independent power producer platform targeting solar, wind, and storage in Australia and New Zealand.",
    sourceName: "I Squared Capital",
    sourceUrl: "https://www.businesswire.com/news/home/20260115746889/en/I-Squared-Capital-Launches-ANZA-Power-with-USD-$300-Million-Commitment-to-Deliver-Reliable-Clean-Energy-in-Australia-and-New-Zealand",
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
    category: "Platform Launch",
    date: "2026-01-22T09:00:00Z",
    description:
      "I Squared launched Radiant Energy Solutions to target distributed renewables in the Middle East, seeded with the acquisition of FAS Renewables and Zahra Energy.",
    targetDescription:
      "Radiant Energy Solutions, a distributed renewable energy platform in the Middle East seeded with FAS Renewables and Zahra Energy.",
    sourceName: "I Squared Capital",
    sourceUrl: "https://www.businesswire.com/news/home/20260121714056/en/I-Squared-Announces-Launch-of-Radiant-Energy-Solutions",
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
    category: "Acquisition (Minority Stake)",
    date: "2026-01-07T08:00:00Z",
    description:
      "KKR announced an additional $1.5 billion equity commitment to GTR to accelerate its European data center development pipeline.",
    targetDescription:
      "Global Technical Realty (GTR), a build-to-suit data center platform operating across key European markets.",
    sourceName: "KKR",
    sourceUrl: "https://www.businesswire.com/news/home/20260107040486/en/KKR-and-Oak-Hill-Capital-Commit-Nearly-$2-Billion-to-Leading-European-Data-Center-Platform-Global-Technical-Realty",
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
    category: "Acquisition (Buyout)",
    date: "2026-01-13T08:00:00Z",
    description:
      "Kinland, managed by Patrizia, announced the acquisition of a portfolio of 49 preschool properties across the Nordics for ~€170 million.",
    targetDescription:
      "A portfolio of 49 preschool and care properties located across the Nordic countries.",
    sourceName: "Patrizia",
    sourceUrl: "https://www.patrizia.ag/en/news-detail/patrizias-kinland-adds-49-social-infrastructure-assets-in-eur-170m-nordic-bolt-on-programme",
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
    category: "Sale (Buyout)",
    date: "2026-01-21T08:00:00Z",
    description:
      "Quinbrook announced the sale of Flexitricity, a UK flexible power aggregator, to Drax Group for ~£42 million.",
    targetDescription:
      "Flexitricity, a UK-based flexible power aggregator and virtual power plant operator.",
    sourceName: "Quinbrook",
    sourceUrl: "https://finance.yahoo.com/news/quinbrook-sells-flexitricity-drax-071200531.html",
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
    category: "Sale (Buyout)",
    date: "2026-01-27T09:00:00Z",
    description:
      "Ridgewood agreed to sell APP Jet Center, an operator of Fixed-Base Operators (FBOs) at US airports, to Bain Capital.",
    targetDescription:
      "APP Jet Center, an operator of Fixed-Base Operators (FBOs) providing aviation services at US airports.",
    sourceName: "Ridgewood",
    sourceUrl: "https://www.baincapital.com/news/bain-capital-enters-fixed-base-operator-sector-acquisition-app-jet-center",
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
    category: "Acquisition (Buyout)",
    date: "2026-01-22T10:00:00Z",
    description:
      "Schroders Greencoat announced the acquisition of three operational solar farms in the UK from METLEN Energy & Metals.",
    targetDescription:
      "A portfolio of three operational solar farms in the UK totaling 110 MWp.",
    sourceName: "Schroders Greencoat",
    sourceUrl: "https://www.schroders.com/en/global/individual/media-centre/schroders-greencoat-expands-uk-solar-portfolio-with-110mwp-acquisition-from-metlen-energy-metals/",
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
    category: "Joint Venture",
    date: "2026-01-28T08:00:00Z",
    description:
      "Stonepeak announced a $2.4 billion investment for a 25% stake in a new platform holding 10 key container terminals globally.",
    targetDescription:
      "United Ports LLC, a new platform holding 10 key container terminals globally in partnership with CMA CGM.",
    sourceName: "Stonepeak",
    sourceUrl: "https://stonepeak.com/news/cma-cgm-and-stonepeak-announce-groundbreaking-terminal-joint-venture-united-ports-llc",
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
    category: "Platform Launch",
    date: "2026-01-22T08:00:00Z",
    description:
      "Tiger-backed Qwello announced its entry into the Danish market after winning a tender from the City of Copenhagen to deploy EV charging infrastructure.",
    targetDescription:
      "Qwello's expansion into the Danish EV charging market via a City of Copenhagen tender.",
    sourceName: "Tiger Infrastructure",
    sourceUrl: "https://qwello.eu/news/qwello-enters-the-danish-market-after-winning-a-contested-tender-in-copenhagen/",
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
    category: "Acquisition (Buyout)",
    date: "2026-02-03T08:00:00Z",
    description:
      "Copenhagen Infrastructure Partners (CIP) agreed to acquire a 578 MW operating wind and solar portfolio along with a development pipeline across the UK, Germany, and Spain from Ørsted's onshore European business.",
    targetDescription:
      "Ørsted Onshore Europe, a 578 MW operating wind and solar portfolio with development pipeline across the UK, Germany, and Spain.",
    sourceName: "CIP",
    sourceUrl: "https://cipartners.dk/2026/02/03/cip-acquires-orsted-onshore-europe/",
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
    category: "Acquisition (Buyout)",
    date: "2026-02-04T08:00:00Z",
    description:
      "Antin Infrastructure Partners signed a definitive agreement to acquire Vigor Marine Group, a critical maritime infrastructure provider operating shipyards and drydocks, from Lone Star Funds.",
    targetDescription:
      "Vigor Marine Group, a critical maritime infrastructure provider operating shipyards and drydocks in the United States.",
    sourceName: "Antin",
    sourceUrl: "https://www.antin-ip.com/news/2026/antin-to-acquire-vigor-marine-group/",
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
    category: "Joint Venture",
    date: "2026-02-04T09:00:00Z",
    description:
      "Energy Capital Partners and KKR announced a $50 billion strategic partnership and launched a Joint Venture to develop a hyperscale data center campus in Texas for AI infrastructure.",
    targetDescription:
      "AI Infrastructure Platform, a Joint Venture to develop a hyperscale data center campus in Texas.",
    sourceName: "ECP / KKR",
    sourceUrl: "https://www.ecpartners.com/news/2026/ecp-kkr-announce-ai-infrastructure-partnership/",
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
    category: "Acquisition (Buyout)",
    date: "2026-02-04T10:00:00Z",
    description:
      "DWS Infrastructure, via its portfolio company Mediterra, acquired Open Hub Med, a carrier-neutral data center hub located in Palermo, Sicily.",
    targetDescription:
      "Open Hub Med, a carrier-neutral data center hub located in Palermo, Sicily.",
    sourceName: "DWS",
    sourceUrl: "https://www.dws.com/news/2026/dws-infrastructure-acquires-open-hub-med/",
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
    category: "Acquisition (Buyout)",
    date: "2026-02-04T11:00:00Z",
    description:
      "Schroders Greencoat entered an agreement to acquire 283 MW of solar PV assets, both operational and under construction, from METLEN Energy & Metals in the UK.",
    targetDescription:
      "A portfolio of 283 MW solar PV assets (operational and under construction) in the United Kingdom.",
    sourceName: "Schroders Greencoat",
    sourceUrl: "https://www.schroders.com/en/global/individual/media-centre/schroders-greencoat-acquires-283mw-uk-solar-portfolio/",
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
    category: "Acquisition (Majority Stake)",
    date: "2026-02-04T12:00:00Z",
    description:
      "KKR and Singtel entered definitive agreements to acquire a controlling 82% stake in ST Telemedia Global Data Centres (STT GDC), a global data center platform.",
    targetDescription:
      "ST Telemedia Global Data Centres (STT GDC), a global data center platform.",
    sourceName: "KKR / Singtel",
    sourceUrl: "https://www.kkr.com/news/2026/kkr-singtel-acquire-stt-gdc/",
  },
  // ─── 37. IFM Investors – Mobius Renewables ──────────────
  {
    id: "INF-2026-037",
    title: "IFM Investors launches Mobius Renewables platform for renewable natural gas development",
    buyer: "IFM Investors",
    seller: "N/A (Platform Launch)",
    sector: "Environmental",
    subsector: "Renewable Natural Gas",
    region: "North America",
    category: "Platform Launch",
    date: "2026-02-04T13:00:00Z",
    description:
      "IFM Investors announced the launch of Mobius Renewables, a new vertically integrated platform for renewable natural gas (RNG) development.",
    targetDescription:
      "Mobius Renewables, a new vertically integrated platform for renewable natural gas (RNG) development.",
    sourceName: "IFM Investors",
    sourceUrl: "https://www.ifminvestors.com/news/2026/ifm-launches-mobius-renewables/",
  },
  // ─── 38. Igneo – Vault Digital Infrastructure (Altum) ──
  {
    id: "INF-2026-038",
    title: "Igneo acquires Vault Digital Infrastructure (Altum) US data center platform",
    buyer: "Igneo Infrastructure Partners",
    seller: "CVC DIF & Northleaf Capital",
    sector: "Digital",
    subsector: "Data Centers",
    region: "North America",
    category: "Acquisition (Buyout)",
    date: "2026-02-05T08:00:00Z",
    description:
      "Igneo Infrastructure Partners announced the acquisition of Vault Digital Infrastructure (Altum), a US data center platform, from CVC DIF and Northleaf Capital.",
    targetDescription:
      "Vault Digital Infrastructure (Altum), a US data center platform.",
    sourceName: "Igneo",
    sourceUrl: "https://www.igneoip.com/news/2026/igneo-acquires-vault-digital-infrastructure/",
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
    category: "Acquisition (Buyout)",
    date: "2026-02-05T09:00:00Z",
    description:
      "Pilot Fiber agreed to acquire the metro-focused enterprise fiber business unit carved out from ExteNet Systems.",
    targetDescription:
      "ExteNet Systems enterprise fiber business, a metro-focused enterprise fiber unit.",
    sourceName: "Pilot Fiber",
    sourceUrl: "https://www.pilotfiber.com/news/2026/pilot-fiber-acquires-extenet-enterprise-fiber/",
  },
  // ─── 40. Macquarie – Energy Assets Group (EAG) ─────────
  {
    id: "INF-2026-040",
    title: "Macquarie agrees to acquire 100% of Energy Assets Group, UK utility and metering provider",
    buyer: "Macquarie Asset Management",
    seller: "Energy Assets Group (EAG)",
    sector: "Utilities",
    subsector: "Utility Metering",
    region: "Europe",
    category: "Acquisition (Buyout)",
    date: "2026-02-05T10:00:00Z",
    description:
      "Macquarie Asset Management agreed to acquire a 100% stake in Energy Assets Group (EAG), a UK vertical utility and metering infrastructure provider.",
    targetDescription:
      "Energy Assets Group (EAG), a UK vertical utility and metering infrastructure provider.",
    sourceName: "Macquarie",
    sourceUrl: "https://www.macquarie.com/news/2026/macquarie-acquires-energy-assets-group/",
  },
  // ─── 41. Macquarie – Last Mile Infrastructure ──────────
  {
    id: "INF-2026-041",
    title: "Macquarie enters binding agreement to acquire remaining 50% of Last Mile Infrastructure",
    buyer: "Macquarie Asset Management",
    seller: "Last Mile Infrastructure",
    sector: "Utilities",
    subsector: "Multi-Utility Connections",
    region: "Europe",
    category: "Acquisition (Buyout)",
    date: "2026-02-05T11:00:00Z",
    description:
      "Macquarie Asset Management entered a binding agreement to acquire the remaining 50% stake in Last Mile Infrastructure, a UK multi-utility connections provider.",
    targetDescription:
      "Last Mile Infrastructure, a UK multi-utility connections provider.",
    sourceName: "Macquarie",
    sourceUrl: "https://www.macquarie.com/news/2026/macquarie-acquires-last-mile-infrastructure/",
  },
  // ─── 42. TPG Rise Climate – Sabre Industries ───────────
  {
    id: "INF-2026-042",
    title: "TPG Rise Climate signs definitive agreements to acquire majority stake in Sabre Industries",
    buyer: "TPG Rise Climate",
    seller: "Sabre Industries",
    sector: "Power & ET",
    subsector: "Power Transmission & Wireless Towers",
    region: "North America",
    category: "Acquisition (Majority Stake)",
    date: "2026-02-06T08:00:00Z",
    description:
      "TPG Rise Climate signed definitive agreements to acquire a majority stake in Sabre Industries, a manufacturer of power transmission structures and wireless towers.",
    targetDescription:
      "Sabre Industries, a manufacturer of power transmission structures and wireless towers.",
    sourceName: "TPG",
    sourceUrl: "https://www.tpg.com/news/2026/tpg-rise-climate-acquires-sabre-industries/",
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
      const base = d.category.split(" (")[0];
      acc[base] = (acc[base] || 0) + 1;
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
