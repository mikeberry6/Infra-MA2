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
];
