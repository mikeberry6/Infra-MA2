export type DealSector = "Energy" | "Digital" | "Transport" | "Social" | "Services";

export type DealCategory =
  | "Acquisition"
  | "Acquisition (Majority Stake)"
  | "Acquisition (Take-Private)"
  | "Acquisition (Asset Deal)"
  | "Minority Stake Acquisition"
  | "Minority Stake Acquisition (Additional Stake)"
  | "Minority Stake Acquisition (via JV)"
  | "Divestiture"
  | "Divestiture (Minority Stake)"
  | "Divestiture (Internal/Related Party)"
  | "Investment"
  | "Investment (Growth Capital)"
  | "Investment (Platform Commitment)"
  | "Partnership/JV";

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
  // ─── Energy & Power ───────────────────────────────────────
  {
    id: "INF-2026-001",
    title: "Allianz invests in the 500MW French offshore wind farm \u00eeles d\u2019Yeu et Noirmoutier",
    buyer: "Allianz Global Investors",
    seller: "Ocean Winds",
    sector: "Energy",
    subsector: "Renewables (Offshore Wind)",
    category: "Minority Stake Acquisition",
    date: "2026-01-22T08:00:00Z",
    description:
      "Allianz Global Investors acquires a 20.25% minority stake in a French offshore wind farm project from Ocean Winds.",
    targetDescription:
      "A 496 MW offshore wind farm located off the coast of Vend\u00e9e, France, currently under construction.",
    sourceName: "Allianz GI",
    sourceUrl: "https://www.allianzgi.com/en/press-centre/media/press-releases",
  },
  {
    id: "INF-2026-002",
    title: "Divert, Inc. Secures Funding to Scale Infrastructure Addressing the Wasted Food Crisis in North America",
    buyer: "Ara Partners",
    seller: "Divert, Inc.",
    sector: "Energy",
    subsector: "Waste-to-Energy / Circular Economy",
    category: "Investment (Growth Capital)",
    date: "2026-01-20T09:00:00Z",
    description:
      "Ara Partners leads a funding round to support the expansion of Divert\u2019s infrastructure facilities across North America.",
    targetDescription:
      "An impact technology company that converts wasted food into renewable natural gas and energy.",
    sourceName: "Ara Partners",
    sourceUrl: "https://www.arapartners.com/news-insights/",
  },
  {
    id: "INF-2026-003",
    title: "Asterion to invest \u20ac1.5 bn into European biomethane",
    buyer: "Asterion Industrial Partners",
    seller: "ABIO",
    sector: "Energy",
    subsector: "Renewables (Biomethane)",
    category: "Investment (Platform Commitment)",
    date: "2026-01-14T07:00:00Z",
    description:
      "Asterion commits \u20ac1.5 billion to accelerate the growth of ABIO, its pan-European biomethane platform.",
    targetDescription:
      "An integrated biomethane platform covering the entire value chain from production to distribution.",
    sourceName: "Asterion",
    sourceUrl: "https://www.asterionindustrial.com/news-insights/",
  },
  {
    id: "INF-2026-004",
    title: "Copenhagen Infrastructure Partners Acquires 1 GWh Battery Storage Project (Beehive) in Arizona",
    buyer: "Copenhagen Infrastructure Partners",
    seller: "Local Developer",
    sector: "Energy",
    subsector: "Energy Storage",
    category: "Acquisition",
    date: "2026-01-19T10:00:00Z",
    description:
      "CIP, through its Flagship Fund V, acquires the Beehive Battery Energy Storage System project from a local developer.",
    targetDescription:
      "A 1 GWh standalone battery energy storage system (BESS) located in Phoenix, Arizona.",
    sourceName: "CIP",
    sourceUrl: "https://cip.com/news/",
  },
  {
    id: "INF-2026-005",
    title: "Talen Energy Continues Portfolio Expansion with Acquisition of Additional High-Quality PJM Natural Gas Assets from Energy Capital Partners",
    buyer: "Talen Energy",
    seller: "Energy Capital Partners",
    sector: "Energy",
    subsector: "Power Generation (Gas)",
    category: "Divestiture (Internal/Related Party)",
    date: "2026-01-15T08:30:00Z",
    description:
      "Talen Energy acquires a portfolio of natural gas-fired generation assets located in PJM from its major shareholder, ECP.",
    targetDescription:
      "A portfolio of natural gas power generation facilities providing reliable capacity to the PJM market.",
    sourceName: "ECP",
    sourceUrl: "https://www.ecp.com/news",
  },
  {
    id: "INF-2026-006",
    title: "Energy Capital Partners (ECP) successfully closes sale of Symmetry Energy Solutions to NextEra Energy Resources",
    buyer: "NextEra Energy Resources",
    seller: "Energy Capital Partners",
    sector: "Energy",
    subsector: "Midstream / Gas Infrastructure",
    category: "Divestiture",
    date: "2026-01-09T11:00:00Z",
    description:
      "ECP completes the sale of its portfolio company, Symmetry Energy Solutions, to NextEra Energy Resources.",
    targetDescription:
      "A leading energy infrastructure company providing natural gas solutions and renewable natural gas services.",
    sourceName: "ECP",
    sourceUrl: "https://www.ecp.com/news",
  },
  {
    id: "INF-2026-007",
    title: "Energy Capital Partners (ECP) and Constellation complete Calpine Transaction",
    buyer: "Energy Capital Partners / Constellation",
    seller: "Calpine Corporation",
    sector: "Energy",
    subsector: "Power Generation",
    category: "Acquisition (Take-Private)",
    date: "2026-01-07T07:00:00Z",
    description:
      "The consortium led by ECP completes the acquisition and take-private of Calpine Corporation.",
    targetDescription:
      "America\u2019s largest generator of electricity from natural gas and geothermal resources.",
    sourceName: "ECP",
    sourceUrl: "https://www.ecp.com/news",
  },
  {
    id: "INF-2026-008",
    title: "Equitix strengthens position in Italy\u2019s solar market by increasing its stake in joint venture with ACEA",
    buyer: "Equitix",
    seller: "ACEA",
    sector: "Energy",
    subsector: "Renewables (Solar)",
    category: "Minority Stake Acquisition (Additional Stake)",
    date: "2026-01-13T09:30:00Z",
    description:
      "Equitix acquires an additional stake in its Italian solar partnership with utility company ACEA.",
    targetDescription:
      "A portfolio of photovoltaic solar plants located across Italy.",
    sourceName: "Equitix",
    sourceUrl: "https://equitix.com/news-insight/",
  },
  {
    id: "INF-2026-009",
    title: "KKR Announces Strategic Partnership With RWE to Realise UK Offshore Windfarms",
    buyer: "KKR",
    seller: "RWE",
    sector: "Energy",
    subsector: "Renewables (Offshore Wind)",
    category: "Partnership/JV",
    date: "2026-01-14T08:00:00Z",
    description:
      "KKR enters a strategic partnership to co-invest in and develop offshore wind projects in the UK alongside RWE.",
    targetDescription:
      "A pipeline of offshore wind farm developments in the United Kingdom.",
    sourceName: "KKR",
    sourceUrl: "https://media.kkr.com/",
  },
  {
    id: "INF-2026-010",
    title: "KKR and PSP Investments Acquire Minority Stake in Two American Electric Power Transmission Companies",
    buyer: "KKR / PSP Investments",
    seller: "American Electric Power (AEP)",
    sector: "Energy",
    subsector: "Utilities / Transmission",
    category: "Minority Stake Acquisition",
    date: "2026-01-09T10:00:00Z",
    description:
      "A consortium of KKR and PSP Investments acquires a minority equity interest in AEP\u2019s transmission subsidiaries.",
    targetDescription:
      "Regulated electricity transmission businesses serving customers in the US Midwest.",
    sourceName: "PSP Investments",
    sourceUrl: "https://www.investpsp.com/en/news/",
  },
  {
    id: "INF-2026-011",
    title: "Quinbrook sells Flexitricity to Drax",
    buyer: "Drax Group",
    seller: "Quinbrook Infrastructure Partners",
    sector: "Energy",
    subsector: "Energy Services / Grid Tech",
    category: "Divestiture",
    date: "2026-01-21T12:00:00Z",
    description:
      "Quinbrook completes the sale of Flexitricity to Drax Group.",
    targetDescription:
      "A demand response and flexible energy aggregator in the UK, managing a virtual power plant.",
    sourceName: "Quinbrook",
    sourceUrl: "https://www.quinbrook.com/news-insights/",
  },

  // ─── Digital Infrastructure ───────────────────────────────
  {
    id: "INF-2026-012",
    title: "CVC DIF has entered exclusive negotiations to acquire a significant majority stake in Celeste",
    buyer: "CVC DIF",
    seller: "InfraVia Capital Partners",
    sector: "Digital",
    subsector: "Fiber",
    category: "Acquisition (Majority Stake)",
    date: "2026-01-14T10:00:00Z",
    description:
      "CVC DIF enters exclusivity to acquire a majority stake in Celeste from InfraVia Capital Partners.",
    targetDescription:
      "A leading B2B fiber infrastructure operator in France providing high-speed connectivity to businesses.",
    sourceName: "CVC",
    sourceUrl: "https://www.cvc.com/media/news/",
  },
  {
    id: "INF-2026-013",
    title: "ACS Group and Global Infrastructure Partners Complete the Creation of Global Data Center Platform",
    buyer: "Global Infrastructure Partners / ACS Group",
    seller: "N/A (Platform Formation)",
    sector: "Digital",
    subsector: "Data Centers",
    category: "Partnership/JV",
    date: "2026-01-09T09:00:00Z",
    description:
      "GIP and ACS Group finalize the formation of a joint venture to develop and operate data centers globally.",
    targetDescription:
      "A new global platform focused on developing hyperscale data centers.",
    sourceName: "GIP",
    sourceUrl: "https://www.global-infra.com/news",
  },
  {
    id: "INF-2026-014",
    title: "KKR and Oak Hill Capital Commit Nearly $2 Billion to Leading European Data Center Platform Global Technical Realty",
    buyer: "KKR / Oak Hill Capital",
    seller: "Global Technical Realty",
    sector: "Digital",
    subsector: "Data Centers",
    category: "Investment",
    date: "2026-01-07T08:00:00Z",
    description:
      "KKR and Oak Hill Capital announce a new capital commitment to fund the expansion of Global Technical Realty.",
    targetDescription:
      "A build-to-suit data center platform operating across key European markets.",
    sourceName: "KKR",
    sourceUrl: "https://media.kkr.com/",
  },

  // ─── Transport & Logistics ────────────────────────────────
  {
    id: "INF-2026-015",
    title: "APG has sold its 10% stake in Exolum to a consortium led by Banca March and Stoneshield Capital",
    buyer: "Banca March / Stoneshield Capital",
    seller: "APG Infrastructure",
    sector: "Transport",
    subsector: "Liquid Logistics / Storage",
    category: "Divestiture (Minority Stake)",
    date: "2026-01-20T11:00:00Z",
    description:
      "APG divests its 10% shareholding in Exolum to a consortium of Spanish investors.",
    targetDescription:
      "A leading European logistics company for liquid bulk products, including refined oil and biofuels.",
    sourceName: "APG",
    sourceUrl: "https://assetmanagement.apg.nl/en/news/",
  },
  {
    id: "INF-2026-016",
    title: "CVC DIF to acquire leading Iberian parking infrastructure platform iPark from Elliott Investment Management",
    buyer: "CVC DIF",
    seller: "Elliott Investment Management",
    sector: "Transport",
    subsector: "Parking Infrastructure",
    category: "Acquisition",
    date: "2026-01-08T08:00:00Z",
    description:
      "CVC DIF agrees to acquire iPark from its current owner, Elliott Investment Management.",
    targetDescription:
      "A leading operator of off-street parking concessions in Spain and Portugal.",
    sourceName: "CVC",
    sourceUrl: "https://www.cvc.com/media/news/",
  },
  {
    id: "INF-2026-017",
    title: "Norwegian Travel sells gondola and rail operations to a European Infrastructure Fund managed by DWS",
    buyer: "DWS Infrastructure",
    seller: "Norwegian Travel",
    sector: "Transport",
    subsector: "Tourism / Rail",
    category: "Acquisition (Asset Deal)",
    date: "2026-01-23T07:30:00Z",
    description:
      "DWS acquires specific gondola and rail tourism assets from Norwegian Travel.",
    targetDescription:
      "Iconic transportation assets facilitating tourism in Norway, including gondolas and rail lines.",
    sourceName: "DWS",
    sourceUrl: "https://group.dws.com/press/",
  },
  {
    id: "INF-2026-018",
    title: "Equitix acquires a portfolio of OFTO and PPP assets from Balfour Beatty",
    buyer: "Equitix",
    seller: "Balfour Beatty",
    sector: "Transport",
    subsector: "Transmission / Social Infrastructure",
    category: "Acquisition",
    date: "2026-01-06T09:00:00Z",
    description:
      "Equitix purchases a portfolio of operational infrastructure assets from Balfour Beatty.",
    targetDescription:
      "A portfolio comprising Offshore Transmission Owner (OFTO) assets and Public-Private Partnership (PPP) concessions.",
    sourceName: "Equitix",
    sourceUrl: "https://equitix.com/news-insight/",
  },
  {
    id: "INF-2026-019",
    title: "Latham Advises Global Infrastructure Partners in Acquisition of 40% Stake in Aboitiz InfraCapital",
    buyer: "Global Infrastructure Partners",
    seller: "Aboitiz Group",
    sector: "Transport",
    subsector: "Airports / Water / Industrial",
    category: "Minority Stake Acquisition",
    date: "2026-01-05T10:00:00Z",
    description:
      "GIP acquires a significant minority stake in the infrastructure arm of the Philippines-based Aboitiz Group.",
    targetDescription:
      "The infrastructure subsidiary of Aboitiz Group, managing airports, water utilities, and economic estates.",
    sourceName: "GIP",
    sourceUrl: "https://www.global-infra.com/news",
  },
  {
    id: "INF-2026-020",
    title: "AviAlliance completes acquisition of AGS Airports",
    buyer: "PSP Investments (AviAlliance)",
    seller: "AGS Airports",
    sector: "Transport",
    subsector: "Airports",
    category: "Acquisition",
    date: "2026-01-28T08:00:00Z",
    description:
      "AviAlliance, a wholly-owned subsidiary of PSP Investments, closes the acquisition of AGS Airports.",
    targetDescription:
      "The owner and operator of Aberdeen, Glasgow, and Southampton airports in the United Kingdom.",
    sourceName: "PSP Investments",
    sourceUrl: "https://www.investpsp.com/en/news/",
  },
  {
    id: "INF-2026-021",
    title: "Bain Capital Enters Fixed-Base Operator Sector with Acquisition of APP Jet Center from Ridgewood Infrastructure",
    buyer: "Bain Capital",
    seller: "Ridgewood Infrastructure",
    sector: "Transport",
    subsector: "Aviation Services",
    category: "Divestiture",
    date: "2026-01-27T09:00:00Z",
    description:
      "Ridgewood Infrastructure sells its portfolio company, APP Jet Center, to Bain Capital.",
    targetDescription:
      "A fixed-base operator (FBO) network providing aviation infrastructure services in Washington D.C. and Florida.",
    sourceName: "Ridgewood",
    sourceUrl: "https://ridgewoodinfrastructure.com/news/",
  },
  {
    id: "INF-2026-022",
    title: "CMA CGM and Stonepeak Form $10 Billion Joint Venture for Port Terminals",
    buyer: "Stonepeak",
    seller: "CMA CGM",
    sector: "Transport",
    subsector: "Ports",
    category: "Minority Stake Acquisition (via JV)",
    date: "2026-01-28T10:30:00Z",
    description:
      "Stonepeak enters a strategic partnership with CMA CGM, investing $2.4 billion for a 25% stake in a port terminal platform.",
    targetDescription:
      "A portfolio of container terminals and port assets located in the United States.",
    sourceName: "Stonepeak",
    sourceUrl: "https://stonepeak.com/category/press-releases",
  },

  // ─── Social & Services ────────────────────────────────────
  {
    id: "INF-2026-023",
    title: "Antin to acquire Emsere, a global leader in clinical trial equipment infrastructure",
    buyer: "Antin Infrastructure Partners",
    seller: "Emsere",
    sector: "Social",
    subsector: "Healthcare Infrastructure Services",
    category: "Acquisition",
    date: "2026-01-08T10:00:00Z",
    description:
      "Antin enters into an agreement to acquire a majority stake in Emsere.",
    targetDescription:
      "A provider of equipment rental and logistics infrastructure services for clinical trials.",
    sourceName: "Antin",
    sourceUrl: "https://www.antin-ip.com/media/our-news",
  },
  {
    id: "INF-2026-024",
    title: "Blackstone Energy Transition Partners Announces Acquisition of Alliance Technical Group",
    buyer: "Blackstone",
    seller: "Morgan Stanley Capital Partners",
    sector: "Services",
    subsector: "Environmental Services",
    category: "Acquisition",
    date: "2026-01-06T08:30:00Z",
    description:
      "Blackstone Energy Transition Partners acquires Alliance Technical Group from Morgan Stanley Capital Partners.",
    targetDescription:
      "A provider of environmental testing, compliance, and monitoring services for critical infrastructure.",
    sourceName: "Blackstone",
    sourceUrl: "https://www.blackstone.com/news/press/",
  },
  {
    id: "INF-2026-025",
    title: "I Squared Capital Acquires Ramudden Global, a Leader in Traffic Management and Infrastructure Safety",
    buyer: "I Squared Capital",
    seller: "Triton Partners",
    sector: "Services",
    subsector: "Transport Services",
    category: "Acquisition",
    date: "2026-01-07T09:00:00Z",
    description:
      "I Squared Capital acquires Ramudden Global from Triton Partners.",
    targetDescription:
      "A provider of temporary traffic management and work zone safety services for critical infrastructure projects.",
    sourceName: "I Squared Capital",
    sourceUrl: "https://isquaredcapital.com/news/",
  },
];

// Helper to get sector color
export function getSectorColor(sector: DealSector): string {
  switch (sector) {
    case "Energy":
      return "#f59e0b";
    case "Digital":
      return "#3b82f6";
    case "Transport":
      return "#8b5cf6";
    case "Social":
      return "#ec4899";
    case "Services":
      return "#10b981";
    default:
      return "#a1a1aa";
  }
}

// Helper to get category badge color
export function getCategoryColor(category: DealCategory): string {
  if (category.startsWith("Acquisition")) return "#3b82f6";
  if (category.startsWith("Minority")) return "#8b5cf6";
  if (category.startsWith("Divestiture")) return "#f59e0b";
  if (category.startsWith("Investment")) return "#10b981";
  if (category.startsWith("Partnership")) return "#06b6d4";
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
