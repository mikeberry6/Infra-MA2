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

// ─── Portfolio Company Interface ─────────────────────────────

export interface PortfolioCompany {
  name: string;
  sector: FundSector;
  subsector?: string;
  region: FundRegion;
  country: string;
  description?: string;
}

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
  portfolioCompanies: PortfolioCompany[];
}

// Flattened portfolio company with parent fund/manager context
export interface PortfolioCompanyWithContext extends PortfolioCompany {
  fundId: string;
  fundName: string;
  managerName: string;
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

// ─── Portfolio Company Utilities ─────────────────────────────

export function getAllPortfolioCompanies(fundList: Fund[]): PortfolioCompanyWithContext[] {
  const results: PortfolioCompanyWithContext[] = [];
  for (const fund of fundList) {
    for (const pc of fund.portfolioCompanies) {
      results.push({
        ...pc,
        fundId: fund.id,
        fundName: fund.fundName,
        managerName: fund.managerName,
      });
    }
  }
  return results;
}

export function getUniqueCountries(companies: PortfolioCompanyWithContext[]): string[] {
  return Array.from(new Set(companies.map((c) => c.country))).sort();
}

export function getUniqueSubsectors(companies: PortfolioCompanyWithContext[]): string[] {
  return Array.from(new Set(companies.map((c) => c.subsector).filter(Boolean) as string[])).sort();
}

export function getUniqueManagers(companies: PortfolioCompanyWithContext[]): string[] {
  return Array.from(new Set(companies.map((c) => c.managerName))).sort();
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
    portfolioCompanies: [
      { name: "Belfast City Airport", sector: "Transportation", subsector: "Airports", region: "Europe", country: "United Kingdom", description: "Regional airport serving Belfast and Northern Ireland." },
      { name: "DNS:NET", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Germany", description: "German fiber-optic internet and telecommunications provider." },
      { name: "ESVAGT", sector: "Transportation", subsector: "Offshore Marine Services", region: "Europe", country: "Denmark", description: "Offshore support vessel operator serving wind and oil & gas sectors." },
      { name: "Global Cloud Xchange (FLAG)", sector: "Communications", subsector: "Subsea Cables", region: "Global", country: "India", description: "Subsea cable and managed network services operator." },
      { name: "Future Biogas", sector: "Renewables / Energy Transition", subsector: "Biogas", region: "Europe", country: "United Kingdom", description: "Operator of anaerobic digestion biogas plants across the UK." },
      { name: "Herambiente", sector: "Waste / Environmental Services", subsector: "Waste-to-Energy", region: "Europe", country: "Italy", description: "Italy's largest waste management and waste-to-energy operator." },
      { name: "Infinis", sector: "Renewables / Energy Transition", subsector: "Landfill Gas", region: "Europe", country: "United Kingdom", description: "UK's largest generator of electricity from captured landfill methane." },
      { name: "Ionisos", sector: "Social Infrastructure", subsector: "Sterilization Services", region: "Europe", country: "France", description: "Provider of ionization and sterilization services for medical devices and food." },
      { name: "Joulz", sector: "Utilities", subsector: "Energy Infrastructure Services", region: "Europe", country: "Netherlands", description: "Dutch energy infrastructure services company." },
      { name: "Oystercatcher", sector: "Midstream / Energy", subsector: "Tank Storage", region: "Europe", country: "Netherlands", description: "Tank terminal holding company with storage assets across Europe and Asia." },
      { name: "SRL Traffic Systems", sector: "Transportation", subsector: "Traffic Management", region: "Europe", country: "United Kingdom", description: "Leading UK provider of temporary and permanent traffic management solutions." },
      { name: "Tampnet", sector: "Communications", subsector: "Offshore Telecoms", region: "Europe", country: "Norway", description: "Provider of high-capacity offshore telecommunications in the North Sea." },
      { name: "TCR", sector: "Transportation", subsector: "Ground Support Equipment", region: "Europe", country: "Belgium", description: "Leading global provider of ground support equipment leasing to airlines and airports." },
    ],
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
    portfolioCompanies: [
      { name: "Amwaste", sector: "Waste / Environmental Services", subsector: "Waste Collection", region: "North America", country: "United States", description: "Regional solid waste collection and disposal company." },
      { name: "EC Waste", sector: "Waste / Environmental Services", subsector: "Waste Collection", region: "North America", country: "United States", description: "Environmental waste services platform." },
      { name: "Regional Rail", sector: "Transportation", subsector: "Rail", region: "North America", country: "United States", description: "Short-line and regional railroad operator." },
      { name: "Smarte Carte", sector: "Transportation", subsector: "Airport & Travel Services", region: "North America", country: "United States", description: "Provider of self-serve vending and luggage cart services at airports and transit hubs." },
    ],
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
    portfolioCompanies: [
      { name: "ESP Utilities Group", sector: "Utilities", subsector: "Gas & Electric Distribution", region: "Europe", country: "United Kingdom", description: "Independent gas transporter and electricity distributor in the UK." },
    ],
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
    portfolioCompanies: [
      { name: "JVR Energy Park", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "Large-scale solar and energy storage development project." },
      { name: "Peregrine Energy Storage", sector: "Renewables / Energy Transition", subsector: "Battery Storage", region: "North America", country: "United States", description: "Utility-scale battery energy storage system." },
      { name: "Pivot Energy Portfolio", sector: "Renewables / Energy Transition", subsector: "Community Solar", region: "North America", country: "United States", description: "Community and commercial solar project portfolio." },
      { name: "Project Soho", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "Utility-scale solar development project." },
      { name: "Stillhouse Solar Project", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "Utility-scale solar generation facility." },
    ],
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
    portfolioCompanies: [
      { name: "JVR Energy Park", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "Large-scale solar and energy storage development project." },
      { name: "Peregrine Energy Storage", sector: "Renewables / Energy Transition", subsector: "Battery Storage", region: "North America", country: "United States", description: "Utility-scale battery energy storage system." },
      { name: "Pivot Energy Portfolio", sector: "Renewables / Energy Transition", subsector: "Community Solar", region: "North America", country: "United States", description: "Community and commercial solar project portfolio." },
      { name: "Project Soho", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "Utility-scale solar development project." },
      { name: "Stillhouse Solar Project", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "Utility-scale solar generation facility." },
    ],
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
    portfolioCompanies: [
      { name: "Athena Renewable Energy", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Middle East & Africa", country: "South Africa", description: "Renewable energy platform in Southern Africa." },
      { name: "Oman Green Hydrogen Project", sector: "Renewables / Energy Transition", subsector: "Green Hydrogen", region: "Middle East & Africa", country: "Oman", description: "Large-scale green hydrogen production facility." },
      { name: "Orygen", sector: "Renewables / Energy Transition", subsector: "Green Hydrogen", region: "Middle East & Africa", country: "Egypt", description: "Green hydrogen and ammonia project in Egypt." },
      { name: "Stride Climate Investments", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Asia-Pacific", country: "India", description: "Indian climate infrastructure investment platform." },
      { name: "Terra Solar", sector: "Renewables / Energy Transition", subsector: "Solar", region: "Asia-Pacific", country: "Philippines", description: "Large-scale solar development platform in the Philippines." },
      { name: "Valia Energía", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Latin America", country: "Brazil", description: "Brazilian renewable energy platform." },
    ],
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
    portfolioCompanies: [
      { name: "Argo Energy", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Latin America", country: "Brazil", description: "Integrated renewable energy platform in Brazil." },
      { name: "BluPine Energy", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Asia-Pacific", country: "India", description: "Indian renewable energy independent power producer." },
      { name: "Bridgin Power", sector: "Power Generation", subsector: "Gas-to-Power", region: "Middle East & Africa", country: "Senegal", description: "Gas-to-power platform across West Africa." },
      { name: "Catalyze", sector: "Renewables / Energy Transition", subsector: "Distributed Energy", region: "Asia-Pacific", country: "India", description: "Distributed energy solutions platform in India." },
      { name: "Levanta Renewables", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Asia-Pacific", country: "Australia", description: "Australian renewable energy development platform." },
      { name: "MTerra Solar", sector: "Renewables / Energy Transition", subsector: "Solar", region: "Latin America", country: "Brazil", description: "Solar energy developer in Brazil." },
      { name: "Nozomi Energy", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Asia-Pacific", country: "Japan", description: "Japanese renewable energy platform." },
      { name: "Rezolv Energy", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Europe", country: "Romania", description: "Central and Eastern European renewables platform." },
      { name: "Yellow Door Energy", sector: "Renewables / Energy Transition", subsector: "Distributed Solar", region: "Middle East & Africa", country: "UAE", description: "Distributed solar and energy solutions in the Middle East and Africa." },
    ],
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
    portfolioCompanies: [
      { name: "800 Super Holdings", sector: "Waste / Environmental Services", subsector: "Waste Management", region: "Asia-Pacific", country: "Singapore", description: "Environmental services and waste management company in Singapore." },
      { name: "Barghest Building Performance (bbp)", sector: "Utilities", subsector: "Energy Efficiency", region: "Asia-Pacific", country: "Singapore", description: "Building energy efficiency and cooling-as-a-service platform." },
      { name: "BGPL", sector: "Utilities", subsector: "Gas Distribution", region: "Asia-Pacific", country: "India", description: "City gas distribution company in India." },
      { name: "Chayora", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Asia-Pacific", country: "China", description: "Hyperscale data center platform in China." },
      { name: "Colombian Toll Road Portfolio", sector: "Transportation", subsector: "Toll Roads", region: "Latin America", country: "Colombia", description: "Portfolio of toll road concessions in Colombia." },
      { name: "Emicool", sector: "Utilities", subsector: "District Cooling", region: "Middle East & Africa", country: "UAE", description: "District cooling provider in Dubai." },
      { name: "HRZ Transmissoras", sector: "Utilities", subsector: "Electricity Transmission", region: "Latin America", country: "Brazil", description: "High-voltage electricity transmission line operator in Brazil." },
      { name: "NXT Infra", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "India", description: "Indian road infrastructure platform." },
      { name: "Skyline", sector: "Digital Infrastructure", subsector: "Towers", region: "Asia-Pacific", country: "Philippines", description: "Telecommunications tower platform in the Philippines." },
      { name: "Uludag Energy", sector: "Utilities", subsector: "Electricity Distribution", region: "Europe", country: "Turkey", description: "Electricity distribution company in northwest Turkey." },
      { name: "ConnectisTower", sector: "Digital Infrastructure", subsector: "Towers", region: "Middle East & Africa", country: "DRC", description: "Telecommunications tower company in the Democratic Republic of Congo." },
      { name: "Epoch Digital", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Asia-Pacific", country: "Indonesia", description: "Data center platform in Indonesia." },
      { name: "NextStream", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Middle East & Africa", country: "South Africa", description: "Fiber broadband and last-mile connectivity platform." },
      { name: "Rack Centre", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Middle East & Africa", country: "Nigeria", description: "Tier III data center facility in Lagos, Nigeria." },
      { name: "Swiftnet", sector: "Digital Infrastructure", subsector: "Towers", region: "Middle East & Africa", country: "South Africa", description: "Telecommunications tower and rooftop infrastructure company." },
      { name: "TERRANOVA", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Latin America", country: "Chile", description: "Renewable energy platform in Chile." },
    ],
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
    portfolioCompanies: [
      { name: "Argo Energy", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Latin America", country: "Brazil", description: "Integrated renewable energy platform in Brazil." },
      { name: "Terra Solar", sector: "Renewables / Energy Transition", subsector: "Solar", region: "Asia-Pacific", country: "Philippines", description: "Large-scale solar development platform in the Philippines." },
    ],
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
      { name: "Aligned Data Centers", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "Hyperscale and enterprise data center platform across the US." },
      { name: "AlphaGen", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "North America", country: "United States", description: "Clean energy generation platform." },
      { name: "Anglian Water Group", sector: "Utilities", subsector: "Water & Wastewater", region: "Europe", country: "United Kingdom", description: "One of the largest water and wastewater companies in England and Wales." },
      { name: "Arevon Energy", sector: "Renewables / Energy Transition", subsector: "Solar & Storage", region: "North America", country: "United States", description: "Major US renewable energy operator with solar and storage assets." },
      { name: "Cellnex Telecom", sector: "Communications", subsector: "Towers", region: "Europe", country: "Spain", description: "Europe's largest independent telecommunications tower operator." },
      { name: "Cube Highways", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "India", description: "Indian road and highway infrastructure platform." },
      { name: "EdgeConneX", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Global", country: "United States", description: "Global edge data center and hyperscale platform." },
      { name: "EdgePoint Infrastructure", sector: "Communications", subsector: "Towers", region: "Europe", country: "United Kingdom", description: "UK wireless infrastructure and tower company." },
      { name: "Equis Development", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Asia-Pacific", country: "Singapore", description: "Asia-Pacific renewable energy development platform." },
      { name: "FiberCop", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Italy", description: "Italian national fiber broadband network operator." },
      { name: "Gatwick Airport", sector: "Transportation", subsector: "Airports", region: "Europe", country: "United Kingdom", description: "London's second busiest airport." },
      { name: "GLP", sector: "Logistics", subsector: "Logistics Real Estate", region: "Asia-Pacific", country: "Singapore", description: "Major global logistics and data center platform." },
      { name: "GMR Airports", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "India", description: "Airport operator including Delhi and Hyderabad airports." },
      { name: "Greenko Energy Holdings", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Asia-Pacific", country: "India", description: "Leading Indian renewable energy company with wind, solar, and hydro assets." },
      { name: "Jio Digital Fiber", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Asia-Pacific", country: "India", description: "Fiber broadband infrastructure arm of Reliance Jio." },
      { name: "Kemble Water Holdings (Thames Water)", sector: "Utilities", subsector: "Water & Wastewater", region: "Europe", country: "United Kingdom", description: "Holding company of Thames Water, the UK's largest water and wastewater provider." },
      { name: "Landmark Dividend LLC", sector: "Communications", subsector: "Ground Leases", region: "North America", country: "United States", description: "Acquires and manages ground leases beneath cell towers, billboards, and renewable energy assets." },
      { name: "Malaysia Airports Holdings Berhad (MAHB)", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "Malaysia", description: "Operator of 39 airports across Malaysia and Istanbul Sabiha Gokcen Airport." },
      { name: "NetCo SRL", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Italy", description: "Telecom Italia's fixed-line network infrastructure company." },
      { name: "Open Fiber", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Italy", description: "Italian FTTH wholesale fiber broadband network." },
      { name: "Queensland Motorways", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "Australia", description: "Toll motorway network in Brisbane, Australia." },
      { name: "ReNew Power", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Asia-Pacific", country: "India", description: "One of India's largest renewable energy independent power producers." },
      { name: "Scotia Gas Networks (SGN)", sector: "Utilities", subsector: "Gas Distribution", region: "Europe", country: "United Kingdom", description: "Major UK gas distribution network serving Scotland and southern England." },
      { name: "Sempra Infrastructure Partners", sector: "Midstream / Energy", subsector: "LNG & Pipelines", region: "North America", country: "United States", description: "LNG export, pipelines, and energy infrastructure in North America." },
      { name: "Sumatra Toll Roads", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "Indonesia", description: "Toll road concessions across Sumatra, Indonesia." },
      { name: "Sydney Airport", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "Australia", description: "Australia's busiest airport." },
      { name: "Terna Energy", sector: "Renewables / Energy Transition", subsector: "Wind & Solar", region: "Europe", country: "Greece", description: "Leading Greek renewable energy producer." },
      { name: "Trans-Java Toll Roads", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "Indonesia", description: "Toll road network across Java, Indonesia." },
      { name: "Transgrid", sector: "Utilities", subsector: "Electricity Transmission", region: "Asia-Pacific", country: "Australia", description: "Operator of the high-voltage electricity transmission network in New South Wales." },
      { name: "Vantage Data Centers APAC", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Asia-Pacific", country: "Japan", description: "Asia-Pacific hyperscale data center platform." },
      { name: "VTG", sector: "Transportation", subsector: "Rail Freight", region: "Europe", country: "Germany", description: "Europe's largest private railcar leasing and rail logistics company." },
      { name: "VTTI", sector: "Midstream / Energy", subsector: "Tank Storage", region: "Global", country: "Netherlands", description: "Global energy storage terminal operator." },
      { name: "WestConnex", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "Australia", description: "Major motorway network in Sydney, Australia." },
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
      { name: "Affinity Water", sector: "Water", subsector: "Water Supply", region: "Europe", country: "United Kingdom", description: "Largest water-only supplier in the UK, serving 3.6 million customers." },
      { name: "Autostrade per l'Italia (ASPI)", sector: "Transportation", subsector: "Toll Roads", region: "Europe", country: "Italy", description: "Italy's largest motorway operator managing ~3,000 km of toll roads." },
      { name: "ATC Europe", sector: "Communications", subsector: "Towers", region: "Europe", country: "France", description: "European tower portfolio of American Tower Corporation." },
      { name: "Cadent Gas", sector: "Utilities", subsector: "Gas Distribution", region: "Europe", country: "United Kingdom", description: "UK's largest gas distribution network operator." },
      { name: "Chicago Parking Meters", sector: "Transportation", subsector: "Parking", region: "North America", country: "United States", description: "75-year concession to operate 36,000 parking meters in Chicago." },
      { name: "Colchester Garrison", sector: "Social Infrastructure", subsector: "Military Housing", region: "Europe", country: "United Kingdom", description: "PFI project delivering military accommodation at Colchester Garrison." },
      { name: "Dargikowo and Karlino (ENERTRAG)", sector: "Renewables / Energy Transition", subsector: "Wind", region: "Europe", country: "Poland", description: "Onshore wind farms in Poland operated by ENERTRAG." },
      { name: "Delgaz Grid", sector: "Utilities", subsector: "Gas & Electric Distribution", region: "Europe", country: "Romania", description: "Gas and electricity distribution network in Romania." },
      { name: "Elenia", sector: "Utilities", subsector: "Electricity Distribution", region: "Europe", country: "Finland", description: "Second-largest electricity distribution company in Finland." },
      { name: "Floene (formerly GGND)", sector: "Utilities", subsector: "Gas Distribution", region: "Europe", country: "Portugal", description: "Portuguese natural gas distribution network operator." },
      { name: "Fuella AS", sector: "Renewables / Energy Transition", subsector: "Biofuels", region: "Europe", country: "Norway", description: "Norwegian biofuels and green fuels platform." },
      { name: "Gas Connect Austria (GCA)", sector: "Midstream / Energy", subsector: "Gas Transmission", region: "Europe", country: "Austria", description: "Austria's high-pressure gas transmission system operator." },
      { name: "Gassled", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "Europe", country: "Norway", description: "Joint venture owning most of Norway's offshore gas pipeline infrastructure." },
      { name: "GasNet", sector: "Utilities", subsector: "Gas Distribution", region: "Europe", country: "Czech Republic", description: "Largest gas distribution network in the Czech Republic." },
      { name: "He Dreiht", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "Europe", country: "Germany", description: "960 MW offshore wind farm in the German North Sea." },
      { name: "IndInfravit Trust", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "India", description: "Indian infrastructure investment trust holding road concessions." },
      { name: "Kyon Energy Storage Portfolio", sector: "Renewables / Energy Transition", subsector: "Battery Storage", region: "Europe", country: "Germany", description: "Utility-scale battery energy storage portfolio in Germany." },
      { name: "Nedgia", sector: "Utilities", subsector: "Gas Distribution", region: "Europe", country: "Spain", description: "Major Spanish gas distribution company (Naturgy subsidiary)." },
      { name: "NET4GAS", sector: "Midstream / Energy", subsector: "Gas Transmission", region: "Europe", country: "Czech Republic", description: "Operator of the Czech Republic's gas transmission system." },
      { name: "NeuConnect", sector: "Utilities", subsector: "Interconnectors", region: "Europe", country: "United Kingdom", description: "First electricity interconnector between the UK and Germany." },
      { name: "NÖGIG", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Austria", description: "Fiber broadband network in Lower Austria." },
      { name: "Northrail", sector: "Transportation", subsector: "Rolling Stock Leasing", region: "Europe", country: "Germany", description: "Locomotive leasing company in Europe." },
      { name: "Northstar", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Europe", country: "Netherlands", description: "Data center platform in Europe." },
      { name: "oeGIG", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Austria", description: "Austrian open-access fiber broadband network." },
      { name: "Porterbrook", sector: "Transportation", subsector: "Rolling Stock Leasing", region: "Europe", country: "United Kingdom", description: "One of the UK's three major rolling stock leasing companies." },
      { name: "Queenspoint Platforms", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Europe", country: "Netherlands", description: "European data center development platform." },
      { name: "Ren-Gas", sector: "Renewables / Energy Transition", subsector: "Green Hydrogen", region: "Europe", country: "Finland", description: "Finnish power-to-gas and green hydrogen developer." },
      { name: "Tank & Rast", sector: "Transportation", subsector: "Motorway Services", region: "Europe", country: "Germany", description: "Dominant German motorway service area operator with ~400 locations." },
      { name: "Thames Tideway Tunnel", sector: "Water", subsector: "Wastewater", region: "Europe", country: "United Kingdom", description: "25 km super sewer tunnel under the River Thames to prevent sewage overflow." },
      { name: "Unsere Grüne Glasfaser (UGG)", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Germany", description: "Rural fiber broadband deployment JV in Germany." },
      { name: "XpFibre", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "France", description: "Major French FTTH fiber broadband network operator." },
      { name: "Yondr Group", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Global", country: "United Kingdom", description: "Global hyperscale data center developer and operator." },
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
      { name: "Cadent Gas", sector: "Utilities", subsector: "Gas Distribution", region: "Europe", country: "United Kingdom", description: "UK's largest gas distribution network operator." },
      { name: "Thames Tideway Tunnel", sector: "Water", subsector: "Wastewater", region: "Europe", country: "United Kingdom", description: "25 km super sewer under the River Thames." },
      { name: "Angel Trains", sector: "Transportation", subsector: "Rolling Stock Leasing", region: "Europe", country: "United Kingdom", description: "UK rolling stock leasing company." },
      { name: "Diabolo Rail Link", sector: "Transportation", subsector: "Rail", region: "Europe", country: "Belgium", description: "Rail link connecting Brussels Airport to the Belgian national rail network." },
      { name: "Gold Coast Light Rail", sector: "Transportation", subsector: "Light Rail", region: "Asia-Pacific", country: "Australia", description: "Light rail transit system on Australia's Gold Coast." },
      { name: "Reliance Rail", sector: "Transportation", subsector: "Rolling Stock Leasing", region: "Asia-Pacific", country: "Australia", description: "PPP providing rolling stock for Sydney's suburban rail network." },
      { name: "Building Schools for the Future (BSF) Portfolios", sector: "Social Infrastructure", subsector: "Education PPP", region: "Europe", country: "United Kingdom", description: "Portfolio of PFI school construction and maintenance projects across the UK." },
      { name: "UK Offshore Transmission Owners (OFTOs)", sector: "Utilities", subsector: "Electricity Transmission", region: "Europe", country: "United Kingdom", description: "Offshore electricity transmission links connecting wind farms to the grid." },
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
    portfolioCompanies: [
      { name: "Cargounit", sector: "Transportation", subsector: "Rolling Stock Leasing", region: "Europe", country: "Poland", description: "Largest independent locomotive lessor in Central and Eastern Europe." },
      { name: "Enery", sector: "Renewables / Energy Transition", subsector: "Solar & Wind", region: "Europe", country: "Austria", description: "Central European renewable energy IPP (solar and wind)." },
      { name: "Greenergy Data Centers", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Europe", country: "Estonia", description: "Data center platform in the Baltics." },
      { name: "BMF Port Burgas", sector: "Logistics", subsector: "Ports", region: "Europe", country: "Bulgaria", description: "Port terminal operator at Burgas, Bulgaria's largest Black Sea port." },
      { name: "R.Power Renewables", sector: "Renewables / Energy Transition", subsector: "Solar", region: "Europe", country: "Poland", description: "Polish solar energy developer and IPP." },
    ],
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
    portfolioCompanies: [
      { name: "USF Solar Portfolio", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "41 operating utility-scale solar projects across California, North Carolina, Oregon, and Utah." },
    ],
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
    portfolioCompanies: [
      { name: "Avincis", sector: "Transportation", subsector: "Aviation Services", region: "Europe", country: "Spain", description: "Global helicopter and fixed-wing operator for emergency, offshore, and government services." },
      { name: "Fjord Base", sector: "Logistics", subsector: "Supply Base", region: "Europe", country: "Norway", description: "Offshore supply base operator in Norway." },
      { name: "Noventa", sector: "Renewables / Energy Transition", subsector: "Hydro", region: "Europe", country: "Switzerland", description: "Small-scale hydropower generation platform across the Alps." },
      { name: "Hausheld Group", sector: "Utilities", subsector: "Energy Services", region: "Europe", country: "Germany", description: "German energy services and smart metering company." },
      { name: "Solandeo", sector: "Renewables / Energy Transition", subsector: "Solar", region: "Europe", country: "Germany", description: "German solar energy development platform." },
    ],
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
    portfolioCompanies: [
      { name: "Portsmouth Water", sector: "Water", subsector: "Water Supply", region: "Europe", country: "United Kingdom", description: "Water-only company serving 330,000 customers in Hampshire." },
      { name: "Biogen", sector: "Renewables / Energy Transition", subsector: "Biogas", region: "Europe", country: "United Kingdom", description: "Anaerobic digestion and food waste recycling company." },
      { name: "Leep Utilities", sector: "Utilities", subsector: "Multi-Utility", region: "Europe", country: "United Kingdom", description: "Independent multi-utility provider for gas, water, electricity, and fiber networks." },
    ],
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
    portfolioCompanies: [
      { name: "Augean", sector: "Waste / Environmental Services", subsector: "Hazardous Waste", region: "Europe", country: "United Kingdom", description: "Specialist hazardous waste management and treatment company." },
      { name: "Hector Rail", sector: "Transportation", subsector: "Rail Freight", region: "Europe", country: "Sweden", description: "Independent rail freight and locomotive operator in Scandinavia and Germany." },
      { name: "HS Orka", sector: "Renewables / Energy Transition", subsector: "Geothermal", region: "Europe", country: "Iceland", description: "Geothermal and hydroelectric power company in Iceland." },
      { name: "Islands Energy Group", sector: "Utilities", subsector: "Multi-Utility", region: "Europe", country: "United Kingdom", description: "Energy and utility services provider for Scottish islands." },
      { name: "Liverpool John Lennon Airport", sector: "Transportation", subsector: "Airports", region: "Europe", country: "United Kingdom", description: "Regional airport serving Liverpool and northwest England." },
      { name: "Magnon Green Energy", sector: "Renewables / Energy Transition", subsector: "Biomass", region: "Europe", country: "Spain", description: "Biomass energy production platform in Spain." },
    ],
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
    portfolioCompanies: [
      { name: "Consilium Safety Group", sector: "Social Infrastructure", subsector: "Fire Safety Systems", region: "Europe", country: "Sweden", description: "Global provider of fire detection and maritime safety systems." },
      { name: "Portakabin", sector: "Social Infrastructure", subsector: "Modular Buildings", region: "Europe", country: "United Kingdom", description: "Leading modular building and portable accommodation provider." },
      { name: "Proxima", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Europe", country: "France", description: "French renewable energy platform." },
      { name: "Blue Elephant Energy", sector: "Renewables / Energy Transition", subsector: "Solar & Wind", region: "Europe", country: "Germany", description: "European solar and onshore wind independent power producer." },
      { name: "Opdenergy", sector: "Renewables / Energy Transition", subsector: "Solar & Wind", region: "Global", country: "Spain", description: "Global renewable energy developer active in Europe, Americas, and Asia." },
      { name: "NorthC Datacenters", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Europe", country: "Netherlands", description: "Dutch colocation data center platform." },
    ],
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
    portfolioCompanies: [
      { name: "Aquavista", sector: "Social Infrastructure", subsector: "Holiday Parks", region: "Europe", country: "United Kingdom", description: "UK residential holiday park and leisure accommodation platform." },
      { name: "Excellence Imagerie", sector: "Social Infrastructure", subsector: "Medical Imaging", region: "Europe", country: "France", description: "French medical imaging center platform." },
      { name: "Pulsant", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Europe", country: "United Kingdom", description: "UK colocation and edge data center platform." },
      { name: "Swiftair", sector: "Transportation", subsector: "Air Cargo", region: "Europe", country: "Spain", description: "Spanish cargo and charter airline operator." },
      { name: "Lake State Railway Company (LSRC)", sector: "Transportation", subsector: "Rail", region: "North America", country: "United States", description: "Short-line railroad operator in Michigan." },
      { name: "Empire Access", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "Rural fiber broadband provider in upstate New York." },
    ],
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
    portfolioCompanies: [
      { name: "GTL Leasing", sector: "Transportation", subsector: "Trailer Leasing", region: "Europe", country: "United Kingdom", description: "European trailer and tanker leasing platform." },
      { name: "Matawan", sector: "Waste / Environmental Services", subsector: "Waste Management", region: "Europe", country: "France", description: "French waste management and environmental services platform." },
      { name: "Pearl", sector: "Renewables / Energy Transition", subsector: "Distributed Energy", region: "North America", country: "United States", description: "US distributed energy and sustainability solutions provider." },
      { name: "Power Dot", sector: "Transportation", subsector: "EV Charging", region: "Europe", country: "Portugal", description: "European electric vehicle charging network operator." },
      { name: "RAW Charging", sector: "Transportation", subsector: "EV Charging", region: "Europe", country: "United Kingdom", description: "UK and European EV charging infrastructure company." },
      { name: "SNRG", sector: "Renewables / Energy Transition", subsector: "Solar", region: "Europe", country: "United Kingdom", description: "UK rooftop solar and energy solutions provider." },
    ],
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
      { name: "TenneT Germany", sector: "Utilities", subsector: "Electricity Transmission", region: "Europe", country: "Germany", description: "High-voltage electricity transmission system operator in Germany." },
      { name: "Return (BESS platform)", sector: "Renewables / Energy Transition", subsector: "Battery Storage", region: "Europe", country: "Netherlands", description: "Battery energy storage system platform." },
      { name: "Octopus Australia OASIS", sector: "Renewables / Energy Transition", subsector: "Solar & Storage", region: "Asia-Pacific", country: "Australia", description: "Australian renewable energy and storage platform." },
      { name: "Noordzeker", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "Europe", country: "Netherlands", description: "Dutch offshore wind development platform." },
      { name: "SkyNRG", sector: "Renewables / Energy Transition", subsector: "Sustainable Aviation Fuel", region: "Europe", country: "Netherlands", description: "Global leader in sustainable aviation fuel production." },
      { name: "Stockholm Exergi", sector: "Utilities", subsector: "District Heating", region: "Europe", country: "Sweden", description: "Stockholm's district heating and cooling provider." },
      { name: "Interparking", sector: "Transportation", subsector: "Parking", region: "Europe", country: "Belgium", description: "Major European parking operator across multiple countries." },
      { name: "Saba Infraestructuras", sector: "Transportation", subsector: "Parking", region: "Europe", country: "Spain", description: "Leading international parking operator in Europe and Latin America." },
      { name: "Italo / NTV", sector: "Transportation", subsector: "High-Speed Rail", region: "Europe", country: "Italy", description: "Italy's private high-speed rail operator." },
      { name: "Brisa", sector: "Transportation", subsector: "Toll Roads", region: "Europe", country: "Portugal", description: "Portugal's largest toll road concessionaire." },
      { name: "Brussels Airport", sector: "Transportation", subsector: "Airports", region: "Europe", country: "Belgium", description: "Belgium's main international airport." },
      { name: "Mer (EV Charging)", sector: "Transportation", subsector: "EV Charging", region: "Europe", country: "Norway", description: "European electric vehicle charging network." },
      { name: "Open Fiber", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Italy", description: "Italian FTTH wholesale fiber broadband network." },
      { name: "Nexera", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Poland", description: "Polish open-access fiber broadband operator." },
      { name: "HICL UK Seed Portfolio", sector: "Social Infrastructure", subsector: "PPP/PFI", region: "Europe", country: "United Kingdom", description: "Portfolio of UK social infrastructure PPP/PFI assets." },
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
    portfolioCompanies: [
      { name: "GFL Environmental Services", sector: "Waste / Environmental Services", subsector: "Waste Collection", region: "North America", country: "Canada", description: "One of North America's largest diversified environmental services companies." },
      { name: "Hyperoptic", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "United Kingdom", description: "UK's largest gigabit-speed full-fiber broadband provider." },
      { name: "Modern Aviation", sector: "Transportation", subsector: "Aviation Services", region: "North America", country: "United States", description: "Fixed base operator (FBO) providing aviation fueling and services." },
      { name: "Stack Infrastructure", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "Hyperscale data center platform across the US." },
    ],
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
    portfolioCompanies: [
      { name: "Parallel Infrastructure", sector: "Communications", subsector: "Towers", region: "North America", country: "United States", description: "Wireless tower and infrastructure company." },
      { name: "Energos Infrastructure", sector: "Midstream / Energy", subsector: "LNG", region: "Global", country: "Norway", description: "Floating LNG infrastructure platform." },
      { name: "Primafrio", sector: "Transportation", subsector: "Logistics", region: "Europe", country: "Spain", description: "Temperature-controlled road freight and logistics operator." },
      { name: "Infrastructure Networks / INET", sector: "Communications", subsector: "Fiber Networks", region: "North America", country: "United States", description: "US fiber-to-the-home and rural broadband provider." },
      { name: "US Wind", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "North America", country: "United States", description: "Offshore wind developer in the US Atlantic." },
    ],
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
    portfolioCompanies: [
      { name: "Purmo Group", sector: "Renewables / Energy Transition", subsector: "Heating & Cooling", region: "Europe", country: "Finland", description: "European sustainable indoor climate solutions and heating technology company." },
      { name: "TotalEnergies Texas Solar & BESS Portfolio", sector: "Renewables / Energy Transition", subsector: "Solar & Storage", region: "North America", country: "United States", description: "Large-scale solar and battery energy storage portfolio in Texas." },
      { name: "Johnson Controls (OpenBlue JV)", sector: "Renewables / Energy Transition", subsector: "Building Automation", region: "North America", country: "United States", description: "JV focused on building decarbonization and smart building solutions." },
    ],
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
    portfolioCompanies: [
      { name: "Tosca Holdco", sector: "Social Infrastructure", subsector: "Essential Services", region: "North America", country: "United States", description: "Platform holding essential infrastructure service businesses." },
    ],
  },
];
