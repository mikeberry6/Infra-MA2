// ─── Fund Types ──────────────────────────────────────────────

export type FundStrategy =
  | "Core"
  | "Core-Plus"
  | "Value-Add"
  | "Opportunistic"
  | "Growth"
  | "Credit / Debt"
  | "Fund-of-Funds"
  | "Secondaries"
  | "Co-Investments";

export type FundSector =
  | "Transportation"
  | "Utilities"
  | "Digital Infrastructure"
  | "Renewables / Energy Transition"
  | "Waste / Environmental Services"
  | "Power Generation"
  | "Midstream / Energy"
  | "Social Infrastructure"
  | "Communications"
  | "Logistics"
  | "Water";

export type FundRegion =
  | "North America"
  | "Europe"
  | "Asia-Pacific"
  | "Latin America"
  | "Middle East & Africa"
  | "Global";

export type FundStructure =
  | "Open-End"
  | "Closed-End"
  | "Permanent Capital"
  | "Evergreen";

export type FundSizeRange =
  | "< $500M"
  | "$500M – $1B"
  | "$1B – $5B"
  | "$5B – $10B"
  | "$10B+";

// ─── Fund Interface ──────────────────────────────────────────

export interface Fund {
  id: string;
  managerName: string;
  fundName: string;
  ticker: string | null;
  description: string;
  size: string;
  sizeUsdMm: number | null;
  vintage: string;
  strategies: FundStrategy[];
  structure: FundStructure;
  sectors: FundSector[];
  regions: FundRegion[];
  portfolioCompanies: string[];
}

// ─── Filter Constants ────────────────────────────────────────

export const FUND_STRATEGIES: FundStrategy[] = [
  "Core",
  "Core-Plus",
  "Value-Add",
  "Opportunistic",
  "Growth",
  "Credit / Debt",
  "Fund-of-Funds",
  "Secondaries",
  "Co-Investments",
];

export const FUND_SECTORS: FundSector[] = [
  "Transportation",
  "Utilities",
  "Digital Infrastructure",
  "Renewables / Energy Transition",
  "Waste / Environmental Services",
  "Power Generation",
  "Midstream / Energy",
  "Social Infrastructure",
  "Communications",
  "Logistics",
  "Water",
];

export const FUND_REGIONS: FundRegion[] = [
  "North America",
  "Europe",
  "Asia-Pacific",
  "Latin America",
  "Middle East & Africa",
  "Global",
];

export const FUND_STRUCTURES: FundStructure[] = [
  "Open-End",
  "Closed-End",
  "Permanent Capital",
  "Evergreen",
];

export const FUND_SIZE_RANGES: FundSizeRange[] = [
  "< $500M",
  "$500M – $1B",
  "$1B – $5B",
  "$5B – $10B",
  "$10B+",
];

// ─── Color Helpers ───────────────────────────────────────────

const STRATEGY_COLORS: Record<FundStrategy, string> = {
  "Core": "#10b981",
  "Core-Plus": "#06b6d4",
  "Value-Add": "#3b82f6",
  "Opportunistic": "#f59e0b",
  "Growth": "#8b5cf6",
  "Credit / Debt": "#ec4899",
  "Fund-of-Funds": "#a78bfa",
  "Secondaries": "#f97316",
  "Co-Investments": "#14b8a6",
};

const FUND_SECTOR_COLORS: Record<FundSector, string> = {
  "Transportation": "#3b82f6",
  "Utilities": "#10b981",
  "Digital Infrastructure": "#8b5cf6",
  "Renewables / Energy Transition": "#06b6d4",
  "Waste / Environmental Services": "#84cc16",
  "Power Generation": "#f59e0b",
  "Midstream / Energy": "#ef4444",
  "Social Infrastructure": "#ec4899",
  "Communications": "#6366f1",
  "Logistics": "#f97316",
  "Water": "#0ea5e9",
};

const FUND_REGION_COLORS: Record<FundRegion, string> = {
  "North America": "#3b82f6",
  "Europe": "#10b981",
  "Asia-Pacific": "#f59e0b",
  "Latin America": "#8b5cf6",
  "Middle East & Africa": "#ec4899",
  "Global": "#06b6d4",
};

const STRUCTURE_COLORS: Record<FundStructure, string> = {
  "Open-End": "#10b981",
  "Closed-End": "#3b82f6",
  "Permanent Capital": "#f59e0b",
  "Evergreen": "#06b6d4",
};

export function getStrategyColor(strategy: FundStrategy): string {
  return STRATEGY_COLORS[strategy] ?? "#a1a1aa";
}

export function getFundSectorColor(sector: FundSector): string {
  return FUND_SECTOR_COLORS[sector] ?? "#a1a1aa";
}

export function getFundRegionColor(region: FundRegion): string {
  return FUND_REGION_COLORS[region] ?? "#a1a1aa";
}

export function getStructureColor(structure: FundStructure): string {
  return STRUCTURE_COLORS[structure] ?? "#a1a1aa";
}

export function getSizeRangeColor(): string {
  return "#a78bfa";
}

// ─── Size Range Filter Logic ─────────────────────────────────

export function matchesSizeRange(sizeUsdMm: number | null, range: FundSizeRange): boolean {
  if (sizeUsdMm === null) return true; // Unknown size always passes
  switch (range) {
    case "< $500M": return sizeUsdMm < 500;
    case "$500M – $1B": return sizeUsdMm >= 500 && sizeUsdMm < 1000;
    case "$1B – $5B": return sizeUsdMm >= 1000 && sizeUsdMm < 5000;
    case "$5B – $10B": return sizeUsdMm >= 5000 && sizeUsdMm < 10000;
    case "$10B+": return sizeUsdMm >= 10000;
    default: return true;
  }
}

// ─── Utility Functions ───────────────────────────────────────

export function groupFundsByManager(fundList: Fund[]): Map<string, Fund[]> {
  const map = new Map<string, Fund[]>();
  for (const fund of fundList) {
    const existing = map.get(fund.managerName);
    if (existing) {
      existing.push(fund);
    } else {
      map.set(fund.managerName, [fund]);
    }
  }
  return map;
}

export function getFundStats(fundList: Fund[]) {
  const managerSet = new Set(fundList.map((f) => f.managerName));
  const totalAum = fundList.reduce((sum, f) => sum + (f.sizeUsdMm ?? 0), 0);
  return {
    managers: managerSet.size,
    funds: fundList.length,
    totalAumBn: Math.round(totalAum / 100) / 10, // in billions, one decimal
  };
}

// ─── Fund Data ───────────────────────────────────────────────

export const funds: Fund[] = [
  // ═══════════════════════════════════════════════════════════
  // 1. 3i Group
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-001a",
    managerName: "3i Group",
    fundName: "3i Infrastructure plc",
    ticker: "3IN",
    description:
      "3i's flagship publicly listed infrastructure investment company. It acts as a permanent capital vehicle, actively managing a portfolio of mid-market economic infrastructure businesses, primarily in the UK and Europe, to provide shareholders with capital growth and steady dividend income.",
    size: "~£3.8 Billion (Market Cap) / >£3.5 Billion (GAV)",
    sizeUsdMm: 4800,
    vintage: "2007",
    strategies: ["Core-Plus", "Value-Add"],
    structure: "Closed-End",
    sectors: ["Utilities", "Communications", "Transportation", "Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Europe"],
    portfolioCompanies: ["DNS:NET", "ESVAGT", "Global Cloud Xchange (FLAG)", "Future Biogas", "Infinis", "Ionisos", "Joulz", "Oystercatcher", "SRL Traffic Systems", "Tampnet", "TCR"],
  },
  {
    id: "FUND-001b",
    managerName: "3i Group",
    fundName: "3i North American Infrastructure Fund",
    ticker: null,
    description:
      "A private institutional blind-pool fund dedicated to middle-market infrastructure investments across the United States and Canada, leveraging 3i's successful European core-plus operating playbook.",
    size: "$739 Million",
    sizeUsdMm: 739,
    vintage: "2023",
    strategies: ["Core-Plus", "Value-Add"],
    structure: "Closed-End",
    sectors: ["Waste / Environmental Services", "Transportation", "Utilities", "Renewables / Energy Transition"],
    regions: ["North America"],
    portfolioCompanies: ["Amwaste", "EC Waste", "Regional Rail", "Smarte Carte"],
  },
  {
    id: "FUND-001c",
    managerName: "3i Group",
    fundName: "3i Managed Infrastructure Acquisitions LP (3i MIA)",
    ticker: null,
    description:
      "A bespoke unlisted co-investment vehicle and managed account raised from a targeted group of institutional LPs specifically to hold, manage, and scale concentrated, long-term utility investments alongside 3i's balance sheet.",
    size: "~$900 Million (£698 Million commitment)",
    sizeUsdMm: 900,
    vintage: "2017",
    strategies: ["Core"],
    structure: "Closed-End",
    sectors: ["Utilities"],
    regions: ["Europe"],
    portfolioCompanies: ["ESP Utilities Group"],
  },

  // ═══════════════════════════════════════════════════════════
  // 2. Acadia Infrastructure Capital
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-002a",
    managerName: "Acadia Infrastructure Capital",
    fundName: "Climate and Communities Investment Coalition (CCIC)",
    ticker: null,
    description:
      "A massive corporate-led joint-venture coalition anchored by Microsoft. Acadia manages the deployment of this capital to facilitate 5 GW of U.S. renewable energy projects over five years.",
    size: "$9 Billion (Coalition capital commitment target)",
    sizeUsdMm: 9000,
    vintage: "2024",
    strategies: ["Growth"],
    structure: "Open-End",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America"],
    portfolioCompanies: ["JVR Energy Park", "Peregrine Energy Storage", "Pivot Energy Portfolio", "Project Soho", "Stillhouse Solar Project"],
  },
  {
    id: "FUND-002b",
    managerName: "Acadia Infrastructure Capital",
    fundName: "Acadia Separately Managed Accounts (SMAs)",
    ticker: null,
    description:
      "Deal-by-deal syndicated capital vehicles for institutional investors seeking direct, bespoke structured exposure to the North American energy transition alongside developers.",
    size: "Variable / Deal-dependent",
    sizeUsdMm: null,
    vintage: "2023",
    strategies: ["Credit / Debt"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America"],
    portfolioCompanies: ["JVR Energy Park", "Peregrine Energy Storage", "Pivot Energy Portfolio", "Project Soho", "Stillhouse Solar Project"],
  },

  // ═══════════════════════════════════════════════════════════
  // 3. Actis
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-003a",
    managerName: "Actis",
    fundName: "Actis Energy 6 (AE6)",
    ticker: null,
    description:
      "The firm's newest flagship energy transition fund, scaling regional independent power producers globally in growth and emerging markets.",
    size: "Targeting $6.0 Billion (Currently in market)",
    sizeUsdMm: 6000,
    vintage: "2024 / 2025",
    strategies: ["Value-Add"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    portfolioCompanies: ["Orygen", "Terra Solar", "Valia Energía"],
  },
  {
    id: "FUND-003b",
    managerName: "Actis",
    fundName: "Actis Energy 5 (AE5)",
    ticker: null,
    description:
      "The predecessor flagship global energy fund targeting the transition to sustainable energy across Latin America, Asia, and EMEA.",
    size: "$4.7 Billion (Plus $1.3 Billion co-investments)",
    sizeUsdMm: 6000,
    vintage: "2021",
    strategies: ["Value-Add"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Latin America", "Asia-Pacific", "Middle East & Africa"],
    portfolioCompanies: ["Argo Energy", "BluPine Energy", "Bridgin Power", "Catalyze", "Levanta Renewables", "Nozomi Energy", "Rezolv Energy", "Yellow Door Energy"],
  },
  {
    id: "FUND-003c",
    managerName: "Actis",
    fundName: "Actis Long Life Infrastructure Fund 2 (ALLIF 2)",
    ticker: null,
    description:
      "A core/core-plus yield-focused fund designed to acquire operational, brownfield infrastructure assets with stable, contracted cash flows, providing steady yield and downside protection over a long timeframe.",
    size: "$1.7 Billion",
    sizeUsdMm: 1700,
    vintage: "2024 / 2025",
    strategies: ["Core", "Core-Plus"],
    structure: "Closed-End",
    sectors: ["Transportation", "Digital Infrastructure", "Waste / Environmental Services", "Utilities"],
    regions: ["Global"],
    portfolioCompanies: ["800 Super Holdings", "Barghest Building Performance (bbp)", "Colombian Toll Road Portfolio", "Emicool", "NXT Infra", "Skyline", "Uludag Energy", "ConnectisTower", "Epoch Digital", "NextStream", "Rack Centre", "Swiftnet", "TERRANOVA"],
  },
  {
    id: "FUND-003d",
    managerName: "Actis",
    fundName: "Actis Asia Climate Transition Fund (AACT)",
    ticker: null,
    description:
      "A highly specialized, SFDR Article 9 classified fund explicitly dedicated to accelerating the climate transition strictly within the Asian region.",
    size: "$560 Million",
    sizeUsdMm: 560,
    vintage: "2024",
    strategies: ["Growth", "Value-Add"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition", "Transportation"],
    regions: ["Asia-Pacific"],
    portfolioCompanies: ["Argo Energy", "Terra Solar"],
  },

  // ═══════════════════════════════════════════════════════════
  // 4. ADIA (Abu Dhabi Investment Authority)
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-004a",
    managerName: "ADIA (Abu Dhabi Investment Authority)",
    fundName: "ADIA Direct Infrastructure / Proprietary Balance Sheet Capital",
    ticker: null,
    description:
      "As a sovereign wealth fund, ADIA does not raise commingled third-party funds. Its Infrastructure Department deploys proprietary sovereign wealth capital directly into landmark infrastructure platforms globally, acting as a direct investor, joint-venture partner, and massive LP to other funds.",
    size: "N/A (Tens of billions deployed in infrastructure)",
    sizeUsdMm: null,
    vintage: "Evergreen",
    strategies: ["Core", "Core-Plus", "Co-Investments"],
    structure: "Permanent Capital",
    sectors: ["Utilities", "Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Logistics"],
    regions: ["Global"],
    portfolioCompanies: [
      "Arevon Energy", "Cellnex Telecom", "Cube Highways", "EdgeConneX", "Equis Development",
      "FiberCop", "Gatwick Airport", "Open Fiber", "Scotia Gas Networks (SGN)",
      "Sempra Infrastructure Partners", "Sydney Airport", "Terna Energy", "Transgrid",
      "Vantage Data Centers APAC", "VTG", "VTTI", "WestConnex",
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 5. Allianz Global Investors (Allianz Capital Partners)
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-005a",
    managerName: "Allianz Global Investors",
    fundName: "Allianz European Infrastructure Fund Series (AEIF I & AEIF II)",
    ticker: null,
    description:
      "Allianz's flagship direct equity buy-and-hold strategy. These vehicles pool third-party institutional capital alongside Allianz's own massive insurance balance sheet to acquire essential infrastructure primarily in Europe.",
    size: "€860 Million (AEIF I) / ~€1 Billion+ (AEIF II)",
    sizeUsdMm: 2000,
    vintage: "2019 / 2022",
    strategies: ["Core", "Core-Plus"],
    structure: "Closed-End",
    sectors: ["Utilities", "Water", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Europe"],
    portfolioCompanies: [
      "Affinity Water", "Autostrade per l'Italia (ASPI)", "ATC Europe", "Cadent Gas",
      "Chicago Parking Meters", "Elenia", "Fuella AS", "Gassled", "GasNet", "He Dreiht",
      "IndInfravit Trust", "NET4GAS", "NeuConnect", "oeGIG", "Porterbrook",
      "Queenspoint Platforms", "Ren-Gas", "Tank & Rast", "Thames Tideway Tunnel",
      "Unsere Grüne Glasfaser (UGG)", "XpFibre", "Yondr Group",
    ],
  },
  {
    id: "FUND-005b",
    managerName: "Allianz Global Investors",
    fundName: "Allianz Global Diversified Infrastructure Equity Fund Series (AGDIEF I & AGDIEF II)",
    ticker: null,
    description:
      "An indirect, global multi-manager strategy that builds diversified portfolios via primary fund commitments to other GPs, secondary market purchases, and select direct co-investments.",
    size: "~€1.0 Billion (AGDIEF I) / ~€1.0 Billion (AGDIEF II)",
    sizeUsdMm: 2200,
    vintage: "2020 / 2022",
    strategies: ["Fund-of-Funds", "Secondaries", "Co-Investments"],
    structure: "Closed-End",
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Midstream / Energy"],
    regions: ["Global"],
    portfolioCompanies: [],
  },
  {
    id: "FUND-005c",
    managerName: "Allianz Global Investors",
    fundName: "Allianz Infrastructure Credit Opportunities Fund II (AICOF II)",
    ticker: null,
    description:
      "The firm's flagship private credit vehicle targeting the infrastructure sector, offering bespoke debt solutions to mid-market infrastructure corporates and projects (SFDR Article 8 fund).",
    size: ">€1.0 Billion",
    sizeUsdMm: 1100,
    vintage: "2023 / 2024",
    strategies: ["Credit / Debt"],
    structure: "Closed-End",
    sectors: ["Digital Infrastructure", "Transportation", "Renewables / Energy Transition"],
    regions: ["Europe"],
    portfolioCompanies: [],
  },
  {
    id: "FUND-005d",
    managerName: "Allianz Global Investors",
    fundName: "Allianz Asia Pacific Infrastructure Credit Fund",
    ticker: null,
    description:
      "A specialized debt fund targeting infrastructure and climate assets in emerging Asian markets.",
    size: "Undisclosed",
    sizeUsdMm: null,
    vintage: "2024",
    strategies: ["Credit / Debt"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["Asia-Pacific"],
    portfolioCompanies: [],
  },
  {
    id: "FUND-005e",
    managerName: "Allianz Global Investors",
    fundName: "Allianz Global Infrastructure ELTIF",
    ticker: null,
    description:
      "A semi-liquid retail and wealth management vehicle structured under the European Long-Term Investment Fund (ELTIF) framework, giving access to Allianz's institutional infrastructure pipelines.",
    size: "Scaling / Open-ended",
    sizeUsdMm: null,
    vintage: "2023 / 2024",
    strategies: ["Core", "Core-Plus", "Credit / Debt"],
    structure: "Open-End",
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    portfolioCompanies: [],
  },

  // ═══════════════════════════════════════════════════════════
  // 6. Amber Infrastructure Group
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-006a",
    managerName: "Amber Infrastructure Group",
    fundName: "International Public Partnerships (INPP)",
    ticker: "INPP",
    description:
      "Amber's flagship publicly listed infrastructure investment company. It acts as a permanent capital vehicle, providing shareholders with long-term, inflation-linked yields by investing globally in early-stage development and operational public-sector and essential infrastructure.",
    size: "~£2.5 Billion (Market Cap) / >£3.0 Billion (GAV)",
    sizeUsdMm: 3800,
    vintage: "2006",
    strategies: ["Core", "Core-Plus"],
    structure: "Closed-End",
    sectors: ["Social Infrastructure", "Transportation", "Utilities", "Digital Infrastructure"],
    regions: ["Europe", "Asia-Pacific"],
    portfolioCompanies: [
      "Cadent Gas", "Thames Tideway Tunnel", "Angel Trains", "Diabolo Rail Link",
      "Gold Coast Light Rail", "Reliance Rail", "Building Schools for the Future (BSF) Portfolios",
      "UK Offshore Transmission Owners (OFTOs)",
    ],
  },
  {
    id: "FUND-006b",
    managerName: "Amber Infrastructure Group",
    fundName: "Three Seas Initiative Investment Fund (3SIIF)",
    ticker: null,
    description:
      "A dedicated commercial fund for which Amber acts as the exclusive investment advisor. It is backed by regional development banks to target essential infrastructure deficits across the 12 EU member states in Central and Eastern Europe (CEE).",
    size: "€1.0+ Billion (Targeting €3.0–€5.0 Billion)",
    sizeUsdMm: 1100,
    vintage: "2020",
    strategies: ["Core-Plus", "Value-Add", "Growth"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition", "Transportation", "Digital Infrastructure", "Logistics"],
    regions: ["Europe"],
    portfolioCompanies: ["Cargounit", "Enery", "Greenergy Data Centers", "BMF Port Burgas", "R.Power Renewables"],
  },
  {
    id: "FUND-006c",
    managerName: "Amber Infrastructure Group",
    fundName: "US Solar Fund (USF)",
    ticker: "USF",
    description:
      "A publicly traded investment company managed by Amber that acquires and operates fully constructed utility-scale solar projects across the United States.",
    size: "~$200 Million (NAV)",
    sizeUsdMm: 200,
    vintage: "2019",
    strategies: ["Core"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America"],
    portfolioCompanies: ["41 operating solar projects across California, North Carolina, Oregon, and Utah"],
  },
  {
    id: "FUND-006d",
    managerName: "Amber Infrastructure Group",
    fundName: "Amber Dragon Ukraine Infrastructure Fund I (ADUIF)",
    ticker: null,
    description:
      "A newly launched, specialized infrastructure fund dedicated to Ukraine's recovery, backed by major development banks (EBRD, EIB, IFC) and managed in partnership with Dragon Capital.",
    size: "€350 Million Target (€200 Million First Close)",
    sizeUsdMm: 380,
    vintage: "2026",
    strategies: ["Growth", "Core-Plus"],
    structure: "Closed-End",
    sectors: ["Power Generation", "Transportation", "Digital Infrastructure", "Logistics"],
    regions: ["Europe"],
    portfolioCompanies: [],
  },

  // ═══════════════════════════════════════════════════════════
  // 7. Ancala Partners
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-007a",
    managerName: "Ancala Partners",
    fundName: "Ancala Infrastructure Fund III",
    ticker: null,
    description:
      "Ancala's latest flagship vehicle, which closed significantly oversubscribed. The fund targets mid-market European infrastructure businesses that require proactive operational improvement and heavy follow-on capital.",
    size: "€1.4 Billion",
    sizeUsdMm: 1500,
    vintage: "2024",
    strategies: ["Core-Plus", "Value-Add"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition", "Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["Europe"],
    portfolioCompanies: ["Avincis", "Fjord Base", "Noventa", "Hausheld Group", "Solandeo"],
  },
  {
    id: "FUND-007b",
    managerName: "Ancala Partners",
    fundName: "Ancala Essential Growth Infrastructure Fund",
    ticker: null,
    description:
      "A specialized continuation and growth vehicle created specifically to fund massive capital expenditure and acquisition plans for Ancala's highest-performing legacy portfolio companies.",
    size: "£551 Million",
    sizeUsdMm: 700,
    vintage: "2023",
    strategies: ["Growth"],
    structure: "Closed-End",
    sectors: ["Water", "Renewables / Energy Transition", "Utilities"],
    regions: ["Europe"],
    portfolioCompanies: ["Portsmouth Water", "Biogen", "Leep Utilities"],
  },
  {
    id: "FUND-007c",
    managerName: "Ancala Partners",
    fundName: "Ancala Infrastructure Fund II",
    ticker: null,
    description:
      "Ancala's fully deployed predecessor flagship fund targeting traditional mid-market infrastructure.",
    size: "€795 Million",
    sizeUsdMm: 870,
    vintage: "2020",
    strategies: ["Core-Plus", "Value-Add"],
    structure: "Closed-End",
    sectors: ["Transportation", "Utilities", "Waste / Environmental Services", "Renewables / Energy Transition"],
    regions: ["Europe"],
    portfolioCompanies: ["Augean", "Hector Rail", "HS Orka", "Islands Energy Group", "Liverpool John Lennon Airport", "Magnon Green Energy"],
  },

  // ═══════════════════════════════════════════════════════════
  // 8. Antin Infrastructure Partners
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-008a",
    managerName: "Antin Infrastructure Partners",
    fundName: "Antin Flagship Fund V",
    ticker: null,
    description:
      "Antin's primary large-cap infrastructure vehicle. It closed well above its target, making it the largest infrastructure fund raised globally to hold a final close in 2024. It targets mature platforms across Europe and North America requiring heavy value-add scaling.",
    size: "€10.2 Billion",
    sizeUsdMm: 11100,
    vintage: "2024",
    strategies: ["Value-Add"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Social Infrastructure"],
    regions: ["Europe", "North America"],
    portfolioCompanies: ["Consilium Safety Group", "Portakabin", "Proxima", "Blue Elephant Energy", "Opdenergy", "NorthC Datacenters"],
  },
  {
    id: "FUND-008b",
    managerName: "Antin Infrastructure Partners",
    fundName: "Antin Mid Cap Fund I",
    ticker: null,
    description:
      "A dedicated mid-market vehicle designed to apply Antin's proven value-add buyout playbook to smaller platforms with high growth potential before eventually scaling them for core buyers.",
    size: "€2.2 Billion",
    sizeUsdMm: 2400,
    vintage: "2021",
    strategies: ["Value-Add"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Social Infrastructure"],
    regions: ["Europe", "North America"],
    portfolioCompanies: ["Aquavista", "Excellence Imagerie", "Pulsant", "Swiftair", "Lake State Railway Company (LSRC)", "Empire Access"],
  },
  {
    id: "FUND-008c",
    managerName: "Antin Infrastructure Partners",
    fundName: "Antin NextGen Fund I",
    ticker: null,
    description:
      "A growth-infrastructure strategy targeting emerging, 'next-generation' asset classes that benefit from mega-trends like the energy transition and smart mobility, which sit slightly outside traditional asset-heavy infrastructure.",
    size: "€1.2 Billion",
    sizeUsdMm: 1300,
    vintage: "2023",
    strategies: ["Growth"],
    structure: "Closed-End",
    sectors: ["Transportation", "Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
    portfolioCompanies: ["GTL Leasing", "Matawan", "Pearl", "Power Dot", "RAW Charging", "SNRG"],
  },

  // ═══════════════════════════════════════════════════════════
  // 9. APG Asset Management
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-009a",
    managerName: "APG Asset Management",
    fundName: "APG Direct Infrastructure Pool (Proprietary Pension Capital)",
    ticker: null,
    description:
      "APG manages the pension assets of ABP (Europe's largest pension fund). It does not raise blind-pool third-party funds. Instead, it deploys capital directly from its massive proprietary balance sheet through internal infrastructure pools. APG acts as a cornerstone direct investor, taking massive minority stakes, co-controlling joint ventures, and leading direct syndications.",
    size: ">€33 Billion (Active infrastructure allocation)",
    sizeUsdMm: 36000,
    vintage: "Evergreen",
    strategies: ["Core", "Core-Plus", "Co-Investments"],
    structure: "Open-End",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Social Infrastructure", "Utilities"],
    regions: ["Global"],
    portfolioCompanies: [
      "TenneT Germany", "Return (BESS platform)", "Octopus Australia OASIS", "Noordzeker",
      "SkyNRG", "Stockholm Exergi", "Interparking", "Saba Infraestructuras",
      "Italo / NTV", "Brisa", "Brussels Airport", "Mer (EV Charging)",
      "Open Fiber", "Nexera", "HICL UK Seed Portfolio",
    ],
  },
  {
    id: "FUND-009b",
    managerName: "APG Asset Management",
    fundName: "APG Infrastructure Asset Owner Fund I & II (AOP)",
    ticker: null,
    description:
      "A co-investment programmatic vehicle established by APG to allow a select group of 'like-minded' sovereign and pension asset owners (such as Japan's GPIF and Swiss pension funds) to invest scale capital alongside APG's main infrastructure pool.",
    size: ">€1.0 Billion",
    sizeUsdMm: 1100,
    vintage: "2024",
    strategies: ["Co-Investments"],
    structure: "Closed-End",
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    portfolioCompanies: [],
  },

  // ═══════════════════════════════════════════════════════════
  // 10. Apollo Global Management
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-010a",
    managerName: "Apollo Global Management",
    fundName: "Apollo Infrastructure Opportunities Fund III (AIOF III)",
    ticker: null,
    description:
      "Apollo's flagship infrastructure equity fund. Fully integrated into the broader Apollo platform, it differentiates itself by combining traditional value-add buyouts with complex corporate carve-outs and bespoke structured capital solutions (e.g., preferred equity and convertibles) to provide downside protection.",
    size: "$2.4 Billion",
    sizeUsdMm: 2400,
    vintage: "2025",
    strategies: ["Value-Add", "Opportunistic"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Logistics"],
    regions: ["North America", "Europe"],
    portfolioCompanies: ["GFL Environmental Services", "Hyperoptic", "Modern Aviation", "Stack Infrastructure"],
  },
  {
    id: "FUND-010b",
    managerName: "Apollo Global Management",
    fundName: "Apollo Infrastructure Opportunities Fund II (AIOF II)",
    ticker: null,
    description:
      "The predecessor flagship vehicle focusing heavily on value-oriented acquisitions, telecom carve-outs, and renewable platforms across North America and Europe.",
    size: "$2.54 Billion",
    sizeUsdMm: 2540,
    vintage: "2021 / 2022",
    strategies: ["Value-Add", "Opportunistic"],
    structure: "Closed-End",
    sectors: ["Communications", "Power Generation", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America", "Europe"],
    portfolioCompanies: ["Parallel Infrastructure", "Energos Infrastructure", "Primafrio", "Infrastructure Networks / INET", "US Wind"],
  },
  {
    id: "FUND-010c",
    managerName: "Apollo Global Management",
    fundName: "Apollo Clean Transition Capital (ACT)",
    ticker: null,
    description:
      "Apollo's dedicated multi-pronged platform for the energy transition and industrial decarbonization. It comprises hybrid evergreen capital seeded by Apollo affiliates and dedicated private equity vehicles to finance the shift to low-carbon energy. Part of Apollo's broader firm-wide commitment to deploy $50 Billion into climate solutions by 2027.",
    size: "Multi-billion (Seeded with $4 Billion)",
    sizeUsdMm: 4000,
    vintage: "2023 / 2024",
    strategies: ["Value-Add", "Growth"],
    structure: "Evergreen",
    sectors: ["Renewables / Energy Transition", "Transportation"],
    regions: ["North America", "Europe"],
    portfolioCompanies: ["Purmo Group", "TotalEnergies Texas Solar & BESS Portfolio", "Johnson Controls (OpenBlue JV)"],
  },
  {
    id: "FUND-010d",
    managerName: "Apollo Global Management",
    fundName: "Apollo Infrastructure Company (AIC)",
    ticker: null,
    description:
      "A non-traded, semi-liquid infrastructure operating company designed primarily to give wealth management and high-net-worth investors access to Apollo's infrastructure pipeline.",
    size: "~$1.7 Billion (NAV)",
    sizeUsdMm: 1700,
    vintage: "2023",
    strategies: ["Core", "Core-Plus", "Credit / Debt"],
    structure: "Open-End",
    sectors: ["Power Generation", "Digital Infrastructure", "Social Infrastructure", "Transportation"],
    regions: ["North America"],
    portfolioCompanies: ["Tosca Holdco"],
  },
];
