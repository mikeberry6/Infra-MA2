export type DealSector = "Transportation" | "Power & ET" | "Midstream" | "Utilities" | "Environmental" | "Digital" | "Social";

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
    category: "Acquisition (Buyout)",
    date: "2026-01-16T08:00:00Z",
    description:
      "Actis announced the acquisition of a 100% stake in the Vindhyachal Expressway in India from Kalpataru Projects International Limited for an enterprise value of ~₹775 crore.",
    targetDescription:
      "Vindhyachal Expressway Private Limited (VEPL), a road infrastructure asset in India.",
    sourceName: "Actis",
    sourceUrl: "https://www.act.is/news-insights/",
  },
  // ─── 2. ADIA ───────────────────────────────────────────────
  {
    id: "INF-2026-002",
    title: "ADIA acquires ~3.17% stake in Helios Towers via secondary placing",
    buyer: "Abu Dhabi Investment Authority (ADIA)",
    seller: "ATP (Danish Pension Fund)",
    sector: "Digital",
    subsector: "Telecom Towers",
    category: "Acquisition (Minority Stake)",
    date: "2026-01-09T08:00:00Z",
    description:
      "ADIA acquired a ~3.17% stake (33.3 million shares) in Helios Towers via a secondary placing from Danish pension fund ATP.",
    targetDescription:
      "Helios Towers, a leading independent telecommunications tower company in Africa and the Middle East.",
    sourceName: "ADIA",
    sourceUrl: "https://www.adia.ae/en/media",
  },
  // ─── 3. Allianz Global Investors ──────────────────────────
  {
    id: "INF-2026-003",
    title: "Allianz acquires 20.25% stake in Îles d'Yeu et Noirmoutier Offshore Wind Farm",
    buyer: "Allianz Global Investors",
    seller: "Ocean Winds",
    sector: "Power & ET",
    subsector: "Offshore Wind",
    category: "Acquisition (Minority Stake)",
    date: "2026-01-22T08:00:00Z",
    description:
      "Allianz acquired a 20.25% minority stake in this 496 MW French offshore wind farm (currently under construction) from Ocean Winds.",
    targetDescription:
      "Îles d'Yeu et Noirmoutier, a 496 MW offshore wind farm off the coast of Vendée, France, currently under construction.",
    sourceName: "Allianz GI",
    sourceUrl: "https://www.allianzgi.com/en/press-centre/media/press-releases",
  },
  // ─── 4. Antin Infrastructure Partners ─────────────────────
  {
    id: "INF-2026-004",
    title: "Antin acquires majority stake in Emsere from Gryphion",
    buyer: "Antin Infrastructure Partners",
    seller: "Gryphion",
    sector: "Social",
    subsector: "Healthcare Logistics",
    category: "Acquisition (Majority Stake)",
    date: "2026-01-08T08:00:00Z",
    description:
      "Antin announced the acquisition of a majority stake in Emsere, a provider of mission-critical logistics for medical clinical trials, from Gryphion via its Mid Cap Fund I.",
    targetDescription:
      "Emsere, a provider of mission-critical logistics and equipment services for medical clinical trials.",
    sourceName: "Antin",
    sourceUrl: "https://www.antin-ip.com/media/our-news",
  },
  // ─── 5. APG Infrastructure ────────────────────────────────
  {
    id: "INF-2026-005",
    title: "APG sells 10% equity stake in Exolum to Banca March / Stoneshield consortium",
    buyer: "Banca March / Stoneshield Capital",
    seller: "APG Infrastructure",
    sector: "Midstream",
    subsector: "Storage & Logistics",
    category: "Sale (Minority Stake)",
    date: "2026-01-20T08:00:00Z",
    description:
      "APG announced the sale of its 10% equity stake in Exolum to a consortium led by Banca March and Stoneshield Capital.",
    targetDescription:
      "Exolum (formerly CLH), a European leader in liquid bulk storage and logistics infrastructure.",
    sourceName: "APG",
    sourceUrl: "https://assetmanagement.apg.nl/en/news/",
  },
  // ─── 6. Ara Partners ──────────────────────────────────────
  {
    id: "INF-2026-006",
    title: "Ara Partners leads growth funding round for Divert, Inc.",
    buyer: "Ara Partners",
    seller: "Divert, Inc.",
    sector: "Environmental",
    subsector: "Waste-to-Energy / Circular Economy",
    category: "Acquisition (Minority Stake)",
    date: "2026-01-20T09:00:00Z",
    description:
      "Ara Partners participated in a Series B/C equivalent growth funding round for portfolio company Divert, Inc. to scale facilities in Washington and North Carolina.",
    targetDescription:
      "Divert, Inc., an impact technology company converting wasted food into renewable natural gas.",
    sourceName: "Ara Partners",
    sourceUrl: "https://www.arapartners.com/news-insights/",
  },
  // ─── 7. Ares Management ───────────────────────────────────
  {
    id: "INF-2026-007",
    title: "Ares expands partnership with ENGIE, acquires stake in 730 MW US renewables portfolio",
    buyer: "Ares Management",
    seller: "ENGIE North America",
    sector: "Power & ET",
    subsector: "Wind & Solar",
    category: "Acquisition (Minority Stake)",
    date: "2026-01-13T08:00:00Z",
    description:
      "Ares expanded its partnership with ENGIE by acquiring an equity stake in a 730 MW portfolio of wind and solar assets in the US (ERCOT market).",
    targetDescription:
      "A 730 MW portfolio of wind and solar assets in the US ERCOT market operated by ENGIE North America.",
    sourceName: "Ares Management",
    sourceUrl: "https://www.aresmgmt.com/news",
  },
  // ─── 8. Asterion Industrial Partners ──────────────────────
  {
    id: "INF-2026-008",
    title: "Asterion commits €1.5 billion to scale ABIO biomethane platform",
    buyer: "Asterion Industrial Partners",
    seller: "Asterion Bioenergy (ABIO)",
    sector: "Environmental",
    subsector: "Biomethane / Energy Transition",
    category: "Platform Launch",
    date: "2026-01-14T08:00:00Z",
    description:
      "Asterion committed €1.5 billion (including €800 million in equity) to scale its ABIO platform, targeting 20 operational biomethane plants by the end of 2026.",
    targetDescription:
      "Asterion Bioenergy (ABIO), an integrated pan-European biomethane production and distribution platform.",
    sourceName: "Asterion",
    sourceUrl: "https://www.asterionindustrial.com/news-insights/",
  },
  // ─── 9. Brookfield Infrastructure Partners ────────────────
  {
    id: "INF-2026-009",
    title: "BIP to sell Brazilian electricity transmission concession for ~$150M",
    buyer: "Undisclosed Buyer",
    seller: "Brookfield Infrastructure Partners (BIP)",
    sector: "Utilities",
    subsector: "Power Transmission / Utilities",
    category: "Sale (Buyout)",
    date: "2026-01-29T08:00:00Z",
    description:
      "BIP agreed to sell the largest of its four Brazilian electricity transmission concessions (1,200 km) for approximately $150 million in net proceeds.",
    targetDescription:
      "A 1,200 km Brazilian electricity transmission concession, the largest in BIP's portfolio of four concessions.",
    sourceName: "Brookfield",
    sourceUrl: "https://bip.brookfield.com/press-releases",
  },
  // ─── 10. Brookfield Renewable Partners ────────────────────
  {
    id: "INF-2026-010",
    title: "BEP to sell two-thirds stake in US wind and solar portfolio for ~$860M",
    buyer: "Undisclosed Buyer",
    seller: "Brookfield Renewable Partners (BEP)",
    sector: "Power & ET",
    subsector: "Renewable Energy (Wind & Solar)",
    category: "Sale (Majority Stake)",
    date: "2026-01-30T08:00:00Z",
    description:
      "BEP announced an agreement to sell a two-thirds stake in a utility-scale portfolio of operating wind and solar projects in the US for ~$860 million in gross proceeds.",
    targetDescription:
      "A utility-scale portfolio of operating wind and solar projects in the United States.",
    sourceName: "Brookfield",
    sourceUrl: "https://bep.brookfield.com/press-releases",
  },
  // ─── 11. CDPQ ─────────────────────────────────────────────
  {
    id: "INF-2026-011",
    title: "CDPQ sells ~11% block of Cogeco Communications shares for C$229M",
    buyer: "Public Market",
    seller: "CDPQ",
    sector: "Digital",
    subsector: "Broadband / Telecom",
    category: "Sale (Minority Stake)",
    date: "2026-01-26T08:00:00Z",
    description:
      "CDPQ announced the sale of an ~11% block of shares in Cogeco for C$229 million, while retaining its position as the largest holder of subordinate shares.",
    targetDescription:
      "Cogeco Communications Inc., a Canadian broadband and telecommunications company.",
    sourceName: "CDPQ",
    sourceUrl: "https://www.cdpq.com/en/news",
  },
  // ─── 12. CIP – Fengmiao I ────────────────────────────────
  {
    id: "INF-2026-012",
    title: "CIP divests 10% equity stake in 495 MW Fengmiao I offshore wind project to MOL",
    buyer: "Mitsui O.S.K. Lines",
    seller: "Copenhagen Infrastructure Partners (CIP)",
    sector: "Power & ET",
    subsector: "Offshore Wind",
    category: "Sale (Minority Stake)",
    date: "2026-01-30T09:00:00Z",
    description:
      "CIP agreed to divest a 10% equity stake in the 495 MW Fengmiao I project to Mitsui O.S.K. Lines.",
    targetDescription:
      "Fengmiao I, a 495 MW offshore wind farm project in Taiwan.",
    sourceName: "CIP",
    sourceUrl: "https://cip.com/news/",
  },
  // ─── 13. CIP – Coalburn 2 ────────────────────────────────
  {
    id: "INF-2026-013",
    title: "CIP divests 50% stake in Coalburn 2 battery storage to AIP Management",
    buyer: "AIP Management",
    seller: "Copenhagen Infrastructure Partners (CIP)",
    sector: "Power & ET",
    subsector: "Battery Energy Storage",
    category: "Sale (Majority Stake)",
    date: "2026-01-30T10:00:00Z",
    description:
      "CIP agreed to divest a 50% stake in the Coalburn 2 battery energy storage system in Scotland to AIP Management.",
    targetDescription:
      "Coalburn 2, a battery energy storage system (BESS) located in Scotland.",
    sourceName: "CIP",
    sourceUrl: "https://cip.com/news/",
  },
  // ─── 14. CVC DIF – iPark ─────────────────────────────────
  {
    id: "INF-2026-014",
    title: "CVC DIF acquires iPark, leading Iberian parking platform, from Elliott",
    buyer: "CVC DIF",
    seller: "Elliott Investment Management",
    sector: "Transportation",
    subsector: "Parking Infrastructure",
    category: "Acquisition (Buyout)",
    date: "2026-01-08T09:00:00Z",
    description:
      "CVC DIF agreed to acquire iPark, a leading Iberian parking platform with 30,000+ spaces, from Elliott Investment Management.",
    targetDescription:
      "iPark, a leading operator of off-street parking concessions in Spain and Portugal with over 30,000 spaces.",
    sourceName: "CVC",
    sourceUrl: "https://www.cvc.com/media/news/",
  },
  // ─── 15. CVC DIF – Celeste ────────────────────────────────
  {
    id: "INF-2026-015",
    title: "CVC DIF enters exclusive negotiations to acquire ~88% of Celeste from InfraVia",
    buyer: "CVC DIF",
    seller: "InfraVia Capital Partners",
    sector: "Digital",
    subsector: "Fiber & Cloud",
    category: "Acquisition (Majority Stake)",
    date: "2026-01-14T08:00:00Z",
    description:
      "CVC DIF entered exclusive negotiations to acquire a majority stake (~88%) in Celeste, a French B2B fiber operator, from InfraVia Capital Partners.",
    targetDescription:
      "Celeste, a French B2B fiber and cloud infrastructure operator.",
    sourceName: "CVC",
    sourceUrl: "https://www.cvc.com/media/news/",
  },
  // ─── 16. EnCap Investments ────────────────────────────────
  {
    id: "INF-2026-016",
    title: "EnCap launches Quantica Infrastructure for US data center development",
    buyer: "EnCap Investments",
    seller: "N/A (Platform Launch)",
    sector: "Digital",
    subsector: "Data Centers",
    category: "Platform Launch",
    date: "2026-01-19T08:00:00Z",
    description:
      "EnCap launched Quantica Infrastructure to develop \"shovel-ready\" data center sites in the US.",
    targetDescription:
      "Quantica Infrastructure, a new platform focused on developing shovel-ready data center sites in the United States.",
    sourceName: "EnCap",
    sourceUrl: "https://www.encapinvestments.com/news",
  },
  // ─── 17. Energy Capital Partners ──────────────────────────
  {
    id: "INF-2026-017",
    title: "ECP agrees to sell Cornerstone portfolio to Talen Energy for $3.45 billion",
    buyer: "Talen Energy",
    seller: "Energy Capital Partners (ECP)",
    sector: "Power & ET",
    subsector: "Power Generation",
    category: "Sale (Buyout)",
    date: "2026-01-15T08:00:00Z",
    description:
      "ECP agreed to sell the Cornerstone portfolio to Talen Energy for $3.45 billion.",
    targetDescription:
      "The Cornerstone portfolio comprising the Waterford and Darby natural gas power generation plants.",
    sourceName: "ECP",
    sourceUrl: "https://www.ecp.com/news",
  },
  // ─── 18. Equitix – UK Portfolio ───────────────────────────
  {
    id: "INF-2026-018",
    title: "Equitix acquires stakes in 10 UK infrastructure assets from Balfour Beatty",
    buyer: "Equitix",
    seller: "Balfour Beatty",
    sector: "Utilities",
    subsector: "Transmission, Lighting, Roads",
    category: "Acquisition (Minority Stake)",
    date: "2026-01-06T08:00:00Z",
    description:
      "Equitix announced the acquisition of stakes in 10 UK assets (OFTOs, PFI lighting, roads) from Balfour Beatty. The deal was signed/completed in Dec 2025 but announced in Jan 2026.",
    targetDescription:
      "A diversified portfolio of 10 UK infrastructure assets including offshore transmission owners (OFTOs), PFI lighting, and road concessions.",
    sourceName: "Equitix",
    sourceUrl: "https://equitix.com/news-insight/",
  },
  // ─── 19. Equitix – Italian Solar ──────────────────────────
  {
    id: "INF-2026-019",
    title: "Equitix increases stake in ACEA solar partnership to 90%",
    buyer: "Equitix",
    seller: "ACEA",
    sector: "Power & ET",
    subsector: "Solar",
    category: "Acquisition (Majority Stake)",
    date: "2026-01-13T08:00:00Z",
    description:
      "Equitix announced it increased its stake in its partnership with ACEA to 90% and funded the acquisition of additional solar assets.",
    targetDescription:
      "A portfolio of photovoltaic solar plants in Italy operated through a joint venture with ACEA.",
    sourceName: "Equitix",
    sourceUrl: "https://equitix.com/news-insight/",
  },
  // ─── 20. GIP – Rio Grande LNG ─────────────────────────────
  {
    id: "INF-2026-020",
    title: "GIP sells 7.6% equity interest in Rio Grande LNG Trains 4 & 5",
    buyer: "Abu Dhabi Royal Family Investment Vehicle",
    seller: "Global Infrastructure Partners (GIP)",
    sector: "Midstream",
    subsector: "LNG",
    category: "Sale (Minority Stake)",
    date: "2026-01-27T08:00:00Z",
    description:
      "GIP agreed to sell a 7.6% equity interest in Trains 4 and 5 of the Rio Grande LNG export project to an investment vehicle of the Abu Dhabi ruling family.",
    targetDescription:
      "Trains 4 and 5 of the Rio Grande LNG export project in Texas.",
    sourceName: "GIP",
    sourceUrl: "https://www.global-infra.com/news",
  },
  // ─── 21. I Squared – Ramudden ─────────────────────────────
  {
    id: "INF-2026-021",
    title: "I Squared Capital acquires Ramudden Global from Triton Partners",
    buyer: "I Squared Capital",
    seller: "Triton Partners",
    sector: "Transportation",
    subsector: "Transport Safety",
    category: "Acquisition (Buyout)",
    date: "2026-01-07T08:00:00Z",
    description:
      "I Squared reached an agreement to acquire Ramudden Global, a provider of temporary traffic management services, from Triton Partners.",
    targetDescription:
      "Ramudden Global, a leading provider of temporary traffic management and work zone safety services.",
    sourceName: "I Squared Capital",
    sourceUrl: "https://isquaredcapital.com/news/",
  },
  // ─── 22. I Squared – ANZA Power ──────────────────────────
  {
    id: "INF-2026-022",
    title: "I Squared launches ANZA Power with $300M equity commitment for ANZ renewables",
    buyer: "I Squared Capital",
    seller: "N/A (Platform Launch)",
    sector: "Power & ET",
    subsector: "Renewable Energy (IPP)",
    category: "Platform Launch",
    date: "2026-01-15T09:00:00Z",
    description:
      "I Squared launched ANZA Power with a $300 million equity commitment to develop solar, wind, and storage assets in Australia and New Zealand.",
    targetDescription:
      "ANZA Power, a new independent power producer platform targeting solar, wind, and storage in Australia and New Zealand.",
    sourceName: "I Squared Capital",
    sourceUrl: "https://isquaredcapital.com/news/",
  },
  // ─── 23. I Squared – Radiant Energy Solutions ─────────────
  {
    id: "INF-2026-023",
    title: "I Squared launches Radiant Energy Solutions for Middle East distributed renewables",
    buyer: "I Squared Capital",
    seller: "N/A (Platform Launch)",
    sector: "Power & ET",
    subsector: "Distributed Energy",
    category: "Platform Launch",
    date: "2026-01-22T09:00:00Z",
    description:
      "I Squared launched Radiant Energy Solutions to target distributed renewables in the Middle East, seeded with the acquisition of FAS Renewables and Zahra Energy.",
    targetDescription:
      "Radiant Energy Solutions, a distributed renewable energy platform in the Middle East seeded with FAS Renewables and Zahra Energy.",
    sourceName: "I Squared Capital",
    sourceUrl: "https://isquaredcapital.com/news/",
  },
  // ─── 24. KKR – GTR ────────────────────────────────────────
  {
    id: "INF-2026-024",
    title: "KKR commits additional $1.5 billion to Global Technical Realty data center platform",
    buyer: "KKR",
    seller: "Global Technical Realty (GTR)",
    sector: "Digital",
    subsector: "Data Centers",
    category: "Acquisition (Minority Stake)",
    date: "2026-01-07T08:00:00Z",
    description:
      "KKR announced an additional $1.5 billion equity commitment to GTR to accelerate its European data center development pipeline.",
    targetDescription:
      "Global Technical Realty (GTR), a build-to-suit data center platform operating across key European markets.",
    sourceName: "KKR",
    sourceUrl: "https://media.kkr.com/",
  },
  // ─── 25. Patrizia ─────────────────────────────────────────
  {
    id: "INF-2026-025",
    title: "Kinland (Patrizia) acquires 49 Nordic preschool properties for ~€170M",
    buyer: "Patrizia (via Kinland)",
    seller: "Undisclosed Sellers",
    sector: "Social",
    subsector: "Preschool & Care Properties",
    category: "Acquisition (Buyout)",
    date: "2026-01-13T08:00:00Z",
    description:
      "Kinland, managed by Patrizia, announced the acquisition of a portfolio of 49 preschool properties across the Nordics for ~€170 million.",
    targetDescription:
      "A portfolio of 49 preschool and care properties located across the Nordic countries.",
    sourceName: "Patrizia",
    sourceUrl: "https://www.patrizia.ag/en/news-events/",
  },
  // ─── 26. Quinbrook ────────────────────────────────────────
  {
    id: "INF-2026-026",
    title: "Quinbrook sells Flexitricity to Drax Group for ~£42 million",
    buyer: "Drax Group",
    seller: "Quinbrook Infrastructure Partners",
    sector: "Power & ET",
    subsector: "Virtual Power Plant / Energy Transition",
    category: "Sale (Buyout)",
    date: "2026-01-21T08:00:00Z",
    description:
      "Quinbrook announced the sale of Flexitricity, a UK flexible power aggregator, to Drax Group for ~£42 million.",
    targetDescription:
      "Flexitricity, a UK-based flexible power aggregator and virtual power plant operator.",
    sourceName: "Quinbrook",
    sourceUrl: "https://www.quinbrook.com/news-insights/",
  },
  // ─── 27. Ridgewood Infrastructure ─────────────────────────
  {
    id: "INF-2026-027",
    title: "Ridgewood sells APP Jet Center to Bain Capital",
    buyer: "Bain Capital",
    seller: "Ridgewood Infrastructure",
    sector: "Transportation",
    subsector: "Aviation (FBO)",
    category: "Sale (Buyout)",
    date: "2026-01-27T09:00:00Z",
    description:
      "Ridgewood agreed to sell APP Jet Center, an operator of Fixed-Base Operators (FBOs) at US airports, to Bain Capital.",
    targetDescription:
      "APP Jet Center, an operator of Fixed-Base Operators (FBOs) providing aviation services at US airports.",
    sourceName: "Ridgewood",
    sourceUrl: "https://ridgewoodinfrastructure.com/news/",
  },
  // ─── 28. Schroders Greencoat ──────────────────────────────
  {
    id: "INF-2026-028",
    title: "Schroders Greencoat acquires 110 MWp UK solar portfolio from METLEN",
    buyer: "Schroders Greencoat",
    seller: "METLEN Energy & Metals",
    sector: "Power & ET",
    subsector: "Solar",
    category: "Acquisition (Buyout)",
    date: "2026-01-22T10:00:00Z",
    description:
      "Schroders Greencoat announced the acquisition of three operational solar farms in the UK from METLEN Energy & Metals.",
    targetDescription:
      "A portfolio of three operational solar farms in the UK totaling 110 MWp.",
    sourceName: "Schroders Greencoat",
    sourceUrl: "https://www.schrodersgreencoat.com/news/",
  },
  // ─── 29. Stonepeak ────────────────────────────────────────
  {
    id: "INF-2026-029",
    title: "Stonepeak invests $2.4B for 25% stake in CMA CGM port terminal JV",
    buyer: "Stonepeak",
    seller: "CMA CGM",
    sector: "Transportation",
    subsector: "Ports",
    category: "Joint Venture",
    date: "2026-01-28T08:00:00Z",
    description:
      "Stonepeak announced a $2.4 billion investment for a 25% stake in a new platform holding 10 key container terminals globally.",
    targetDescription:
      "United Ports LLC, a new platform holding 10 key container terminals globally in partnership with CMA CGM.",
    sourceName: "Stonepeak",
    sourceUrl: "https://stonepeak.com/category/press-releases",
  },
  // ─── 30. Tiger Infrastructure Partners ────────────────────
  {
    id: "INF-2026-030",
    title: "Tiger-backed Qwello wins Copenhagen EV charging tender, enters Danish market",
    buyer: "Tiger Infrastructure Partners (via Qwello)",
    seller: "N/A (Platform Launch)",
    sector: "Transportation",
    subsector: "EV Charging",
    category: "Platform Launch",
    date: "2026-01-22T08:00:00Z",
    description:
      "Tiger-backed Qwello announced its entry into the Danish market after winning a tender from the City of Copenhagen to deploy EV charging infrastructure.",
    targetDescription:
      "Qwello's expansion into the Danish EV charging market via a City of Copenhagen tender.",
    sourceName: "Tiger Infrastructure",
    sourceUrl: "https://www.tigerinfrastructure.com/news/",
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
