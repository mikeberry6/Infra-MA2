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
      { name: "Barrow OFTO", sector: "Utilities", subsector: "Electricity Transmission", region: "Europe", country: "United Kingdom", description: "Offshore transmission link for Barrow offshore wind farm." },
      { name: "Beatrice OFTO", sector: "Utilities", subsector: "Electricity Transmission", region: "Europe", country: "United Kingdom", description: "Offshore transmission link for Beatrice offshore wind farm." },
      { name: "BeNEX", sector: "Transportation", subsector: "Rail", region: "Europe", country: "Germany", description: "German regional rail passenger services operator." },
      { name: "City Light & Power", sector: "Utilities", subsector: "Electricity Distribution", region: "North America", country: "United States", description: "US private electric utility services company." },
      { name: "Community Fibre", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "United Kingdom", description: "London-focused full-fiber broadband provider." },
      { name: "Dublin Criminal Courts", sector: "Social Infrastructure", subsector: "Courts PPP", region: "Europe", country: "Ireland", description: "PPP project delivering Dublin's criminal courts complex." },
      { name: "Durham Region Courthouse", sector: "Social Infrastructure", subsector: "Courts PPP", region: "North America", country: "Canada", description: "PPP project delivering courthouse in Durham Region, Ontario." },
      { name: "East Anglia One OFTO", sector: "Utilities", subsector: "Electricity Transmission", region: "Europe", country: "United Kingdom", description: "Offshore transmission for East Anglia One wind farm." },
      { name: "Family Housing for Service Personnel", sector: "Social Infrastructure", subsector: "Military Housing", region: "Europe", country: "United Kingdom", description: "PFI military housing project for UK armed forces." },
      { name: "Groveland Mine Solar", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "Solar project on former mine site." },
      { name: "iseek", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Asia-Pacific", country: "Australia", description: "Australian data center and cloud services provider." },
      { name: "Lincs OFTO", sector: "Utilities", subsector: "Electricity Transmission", region: "Europe", country: "United Kingdom", description: "Offshore transmission link for Lincs offshore wind farm." },
      { name: "Maine International Cold Storage Facility", sector: "Logistics", subsector: "Cold Storage", region: "North America", country: "United States", description: "Cold storage facility serving Maine's seafood and food industries." },
      { name: "Moray East OFTO", sector: "Utilities", subsector: "Electricity Transmission", region: "Europe", country: "United Kingdom", description: "Offshore transmission link for Moray East wind farm." },
      { name: "New Zealand Schools", sector: "Social Infrastructure", subsector: "Education PPP", region: "Asia-Pacific", country: "New Zealand", description: "PPP schools portfolio in New Zealand." },
      { name: "Ormonde OFTO", sector: "Utilities", subsector: "Electricity Transmission", region: "Europe", country: "United Kingdom", description: "Offshore transmission link for Ormonde wind farm." },
      { name: "Police Headquarters South-East Hesse", sector: "Social Infrastructure", subsector: "Government PPP", region: "Europe", country: "Germany", description: "PPP police headquarters project in Hesse, Germany." },
      { name: "RailFirst", sector: "Transportation", subsector: "Rolling Stock Leasing", region: "Asia-Pacific", country: "Australia", description: "Australian rail freight rolling stock lessor." },
      { name: "Royal Children's Hospital", sector: "Social Infrastructure", subsector: "Healthcare PPP", region: "Asia-Pacific", country: "Australia", description: "PPP hospital project in Melbourne, Australia." },
      { name: "Sizewell C", sector: "Power Generation", subsector: "Nuclear", region: "Europe", country: "United Kingdom", description: "Proposed nuclear power station in Suffolk, England." },
      { name: "toob", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "United Kingdom", description: "UK regional full-fiber broadband provider." },
      { name: "Wakatipu High School", sector: "Social Infrastructure", subsector: "Education PPP", region: "Asia-Pacific", country: "New Zealand", description: "PPP school project in Queenstown, New Zealand." },
      { name: "YourDC", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Asia-Pacific", country: "Australia", description: "Australian regional data center operator." },
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
      { name: "Ancala Water Services", sector: "Water", subsector: "Water Supply", region: "Europe", country: "United Kingdom", description: "UK water infrastructure platform." },
      { name: "Croatian Biomass Platform", sector: "Renewables / Energy Transition", subsector: "Biomass", region: "Europe", country: "Croatia", description: "Biomass energy production platform in Croatia." },
      { name: "Iris Care Group", sector: "Social Infrastructure", subsector: "Healthcare", region: "Europe", country: "Ireland", description: "Irish residential care provider for elderly and disability services." },
      { name: "MUCH Gruppe", sector: "Waste / Environmental Services", subsector: "Waste Management", region: "Europe", country: "Germany", description: "German waste management and recycling company." },
      { name: "Orites", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Europe", country: "Spain", description: "Spanish renewable energy platform." },
      { name: "Phoenix Rail", sector: "Transportation", subsector: "Rolling Stock Leasing", region: "Europe", country: "United Kingdom", description: "UK rail leasing and maintenance company." },
      { name: "SAGE (Ancala Midstream)", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "Europe", country: "United Kingdom", description: "North Sea gas pipeline and processing platform." },
      { name: "TorLoc Towers", sector: "Communications", subsector: "Towers", region: "Europe", country: "United Kingdom", description: "UK telecommunications tower platform." },
      { name: "Valentra", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Europe", country: "Spain", description: "Spanish renewable energy development platform." },
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
      { name: "Almaviva", sector: "Social Infrastructure", subsector: "Healthcare", region: "Europe", country: "France", description: "French elderly care home operator." },
      { name: "Babilou Family", sector: "Social Infrastructure", subsector: "Childcare", region: "Europe", country: "France", description: "European childcare and early education platform." },
      { name: "CityFibre", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "United Kingdom", description: "UK's largest independent full-fiber broadband platform." },
      { name: "Emsere", sector: "Waste / Environmental Services", subsector: "Waste Management", region: "Europe", country: "Spain", description: "Spanish waste management and environmental services company." },
      { name: "ERR - European Rail Rent", sector: "Transportation", subsector: "Rolling Stock Leasing", region: "Europe", country: "Belgium", description: "European freight wagon leasing platform." },
      { name: "Eurofiber", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Netherlands", description: "Dutch fiber network operator for business and government." },
      { name: "FirstLight Fiber", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "Northeast US fiber network provider." },
      { name: "Hippocrates", sector: "Social Infrastructure", subsector: "Healthcare", region: "Europe", country: "France", description: "French healthcare facility operator." },
      { name: "HOFI", sector: "Social Infrastructure", subsector: "Hospitality", region: "Europe", country: "Germany", description: "German hospitality and accommodation platform." },
      { name: "IDEX", sector: "Utilities", subsector: "District Heating", region: "Europe", country: "France", description: "French district heating and cooling network operator." },
      { name: "Indaqua", sector: "Water", subsector: "Water & Wastewater", region: "Europe", country: "Portugal", description: "Portuguese water and wastewater services company." },
      { name: "Infiniteria", sector: "Waste / Environmental Services", subsector: "Recycling", region: "Europe", country: "France", description: "French circular economy and recycling platform." },
      { name: "Inicea", sector: "Social Infrastructure", subsector: "Healthcare", region: "Europe", country: "France", description: "French post-acute care and rehabilitation clinics." },
      { name: "Kisimul", sector: "Social Infrastructure", subsector: "Specialist Care", region: "Europe", country: "United Kingdom", description: "UK specialist education and care provider." },
      { name: "LuxNetwork", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Luxembourg", description: "Luxembourg fiber and data connectivity provider." },
      { name: "Onoranze Funebri Bramati", sector: "Social Infrastructure", subsector: "Funeral Services", region: "Europe", country: "Italy", description: "Italian funeral services platform." },
      { name: "Origis Energy", sector: "Renewables / Energy Transition", subsector: "Solar & Storage", region: "North America", country: "United States", description: "US utility-scale solar and battery storage developer." },
      { name: "PearlX", sector: "Renewables / Energy Transition", subsector: "Distributed Energy", region: "North America", country: "United States", description: "US distributed energy and sustainability solutions." },
      { name: "Scandinavian Enviro Systems JV", sector: "Waste / Environmental Services", subsector: "Tire Recycling", region: "Europe", country: "Sweden", description: "Swedish tire recycling and circular economy venture." },
      { name: "Sølvtrans", sector: "Transportation", subsector: "Marine Services", region: "Europe", country: "Norway", description: "Norwegian wellboat operator for aquaculture industry." },
      { name: "Velvet (Proxima)", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Europe", country: "France", description: "French renewable energy platform." },
      { name: "Vicinity Energy", sector: "Utilities", subsector: "District Heating", region: "North America", country: "United States", description: "US district energy and steam provider." },
      { name: "Vigor Marine Group", sector: "Transportation", subsector: "Marine Services", region: "North America", country: "United States", description: "US marine services and shipyard operator." },
      { name: "Wildstone", sector: "Communications", subsector: "Outdoor Media", region: "Europe", country: "United Kingdom", description: "UK outdoor advertising and media infrastructure platform." },
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
      { name: "Astoria Energy I and II", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Natural gas-fired power plants in Queens, New York." },
      { name: "Ausgrid", sector: "Utilities", subsector: "Electricity Distribution", region: "Asia-Pacific", country: "Australia", description: "Largest electricity distribution network in Australia, serving Sydney." },
      { name: "Celeo Redes", sector: "Utilities", subsector: "Electricity Transmission", region: "Latin America", country: "Brazil", description: "Brazilian electricity transmission line operator." },
      { name: "Conterra Networks", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "US fiber and wireless infrastructure provider." },
      { name: "Doral Renewables", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "US utility-scale solar development platform." },
      { name: "Driveco", sector: "Transportation", subsector: "EV Charging", region: "Europe", country: "France", description: "French EV charging network operator." },
      { name: "euNetworks", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Germany", description: "European bandwidth and fiber infrastructure provider." },
      { name: "Gemini", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "Europe", country: "Netherlands", description: "600 MW offshore wind farm in the Dutch North Sea." },
      { name: "Glaspoort", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Netherlands", description: "Dutch fiber network JV between KPN and APG." },
      { name: "Groendus", sector: "Renewables / Energy Transition", subsector: "Solar & Wind", region: "Europe", country: "Netherlands", description: "Dutch renewable energy developer." },
      { name: "Itinere Infraestructuras", sector: "Transportation", subsector: "Toll Roads", region: "Europe", country: "Spain", description: "Spanish toll road concessionaire." },
      { name: "Kenter", sector: "Utilities", subsector: "Smart Metering", region: "Europe", country: "Netherlands", description: "Dutch smart metering and energy management services." },
      { name: "Merkur Offshore Wind", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "Europe", country: "Germany", description: "396 MW offshore wind farm in the German North Sea." },
      { name: "Pattern Energy", sector: "Renewables / Energy Transition", subsector: "Wind & Solar", region: "North America", country: "United States", description: "Major US wind and solar energy company." },
      { name: "Peel Ports Group", sector: "Logistics", subsector: "Ports", region: "Europe", country: "United Kingdom", description: "UK port operator including Liverpool and Manchester Ship Canal." },
      { name: "Smart City Infrastructure Fund (SCIF)", sector: "Digital Infrastructure", subsector: "Smart Cities", region: "Asia-Pacific", country: "Australia", description: "Australian smart city infrastructure platform." },
      { name: "Småkraft", sector: "Renewables / Energy Transition", subsector: "Hydro", region: "Europe", country: "Norway", description: "Norwegian small-scale hydropower company." },
      { name: "Trans Java Toll Road", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "Indonesia", description: "Toll road network across Java, Indonesia." },
      { name: "Trans Sumatra Toll Road", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "Indonesia", description: "Toll road network across Sumatra, Indonesia." },
      { name: "Vasa Vind", sector: "Renewables / Energy Transition", subsector: "Wind", region: "Europe", country: "Sweden", description: "Swedish onshore wind energy platform." },
      { name: "Voyage Holdings (Vocus)", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Asia-Pacific", country: "Australia", description: "Australian fiber and telecommunications provider." },
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
      { name: "Apterra Infrastructure Capital", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "North America", country: "United States", description: "Clean energy infrastructure investment platform." },
      { name: "Caledonia Generating LLC", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Natural gas-fired power generation facility." },
      { name: "Corning Natural Gas Corporation", sector: "Utilities", subsector: "Gas Distribution", region: "North America", country: "United States", description: "New York State natural gas distribution utility." },
      { name: "Cross-Sound Cable Company", sector: "Utilities", subsector: "Interconnectors", region: "North America", country: "United States", description: "Submarine power cable connecting Connecticut and Long Island." },
      { name: "Duquesne Light Company", sector: "Utilities", subsector: "Electricity Distribution", region: "North America", country: "United States", description: "Electric utility serving Pittsburgh, Pennsylvania." },
      { name: "FirstDigital Telecom", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "US fiber network and telecom provider." },
      { name: "Freedom CNG", sector: "Transportation", subsector: "CNG Fueling", region: "North America", country: "United States", description: "Compressed natural gas fueling station operator." },
      { name: "Great Bay Renewables", sector: "Renewables / Energy Transition", subsector: "Renewables Finance", region: "North America", country: "United States", description: "Renewable energy royalty and investment company." },
      { name: "Hudson Transmission Partners", sector: "Utilities", subsector: "Electricity Transmission", region: "North America", country: "United States", description: "Undersea power cable connecting New Jersey and New York." },
      { name: "Intel Fab 34 JV", sector: "Digital Infrastructure", subsector: "Semiconductor Fab", region: "Europe", country: "Ireland", description: "Joint venture for Intel's semiconductor fabrication facility." },
      { name: "Ionic Blue (Johnson Controls JV)", sector: "Renewables / Energy Transition", subsector: "Building Automation", region: "North America", country: "United States", description: "JV focused on building decarbonization and smart building solutions." },
      { name: "NextEra Energy Partners Renewable Portfolio", sector: "Renewables / Energy Transition", subsector: "Wind & Solar", region: "North America", country: "United States", description: "Portfolio of wind and solar assets from NextEra." },
      { name: "STACK Infrastructure Europe", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Europe", country: "Switzerland", description: "European data center platform." },
      { name: "Stream Data Centers", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "US data center developer and operator." },
      { name: "Summit Ridge Energy", sector: "Renewables / Energy Transition", subsector: "Community Solar", region: "North America", country: "United States", description: "Largest US community solar company." },
      { name: "The State Group", sector: "Utilities", subsector: "Energy Services", region: "North America", country: "Canada", description: "Canadian power and energy services company." },
      { name: "TierPoint", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "US colocation and multi-cloud data center platform." },
      { name: "Trans Adriatic Pipeline (TAP)", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "Europe", country: "Greece", description: "Natural gas pipeline from Turkey through Greece and Albania to Italy." },
      { name: "WEC Energy Group Renewable Portfolio", sector: "Renewables / Energy Transition", subsector: "Wind & Solar", region: "North America", country: "United States", description: "Portfolio of renewable energy assets from WEC Energy Group." },
      { name: "Yondr Group", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Global", country: "United Kingdom", description: "Global hyperscale data center developer." },
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

  // ═══════════════════════════════════════════════════════════
  // 21. BCI (British Columbia Investment Management Corp)
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-021a",
    managerName: "BCI (British Columbia Investment Management Corp)",
    fundName: "BCI Infrastructure & Renewable Resources Program",
    ticker: null,
    description:
      "BCI's direct infrastructure investment program manages one of Canada's largest public-sector infrastructure portfolios on behalf of British Columbia's public sector pension plans. The program targets core and core-plus infrastructure assets globally, with a focus on contracted or regulated cash flows across transportation, utilities, energy, and digital infrastructure.",
    size: "~C$28 Billion (Program AUM)",
    sizeUsdMm: 21000,
    vintage: "2005",
    strategies: ["Core", "Core-Plus"],
    structure: "Open-End",
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure", "Midstream / Energy", "Waste / Environmental Services", "Power Generation"],
    regions: ["North America", "Europe", "Asia-Pacific", "Latin America"],
    portfolioCompanies: [
      { name: "Arteris", sector: "Transportation", subsector: "Toll Roads", region: "Latin America", country: "Brazil", description: "One of Brazil's largest toll road concession operators." },
      { name: "BBGI Global Infrastructure S.A.", sector: "Social Infrastructure", subsector: "PPP / PFI", region: "Global", country: "Luxembourg", description: "Listed infrastructure investment company focused on social infrastructure PPP/PFI assets." },
      { name: "Cleco Partners LP", sector: "Utilities", subsector: "Electric Utility", region: "North America", country: "United States", description: "Regulated electric utility serving Louisiana customers." },
      { name: "Corix Infrastructure Inc.", sector: "Utilities", subsector: "Water & Gas Distribution", region: "North America", country: "Canada", description: "Canadian provider of water, wastewater, and energy utility services." },
      { name: "Cube Highways Trust", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "India", description: "Indian infrastructure investment trust focused on highway toll concessions." },
      { name: "Dalrymple Bay Coal Terminal", sector: "Transportation", subsector: "Port Terminal", region: "Asia-Pacific", country: "Australia", description: "One of the world's largest coal export terminals in Queensland, Australia." },
      { name: "Eku Energy", sector: "Renewables / Energy Transition", subsector: "Battery Storage", region: "Global", country: "Australia", description: "Global battery energy storage platform." },
      { name: "Endeavour Energy", sector: "Utilities", subsector: "Electricity Distribution", region: "Asia-Pacific", country: "Australia", description: "Major electricity distributor serving western Sydney and surrounding regions." },
      { name: "Exolum (CLH)", sector: "Midstream / Energy", subsector: "Fuel Storage & Transport", region: "Europe", country: "Spain", description: "Leading operator of refined petroleum product pipeline and storage networks." },
      { name: "Frontier Towers", sector: "Digital Infrastructure", subsector: "Towers", region: "Middle East & Africa", country: "Nigeria", description: "Independent telecommunications tower company operating in West Africa." },
      { name: "Isagen SA", sector: "Power Generation", subsector: "Hydroelectric", region: "Latin America", country: "Colombia", description: "Major Colombian hydroelectric power generation company." },
      { name: "Linx Cargo Care Group", sector: "Logistics", subsector: "Intermodal Logistics", region: "Asia-Pacific", country: "Australia", description: "Provider of intermodal terminal, container, and logistics services in Australia and New Zealand." },
      { name: "National Gas", sector: "Utilities", subsector: "Gas Transmission", region: "Europe", country: "United Kingdom", description: "Operator of the UK's gas transmission network (formerly National Grid Gas Transmission)." },
      { name: "Northview Energy", sector: "Renewables / Energy Transition", subsector: "Solar & Storage", region: "North America", country: "United States", description: "US-based solar and energy storage platform." },
      { name: "Nova Transportadora do Sudeste (NTS)", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "Latin America", country: "Brazil", description: "Largest natural gas pipeline network in southeastern Brazil." },
      { name: "Open Grid Europe (OGE)", sector: "Midstream / Energy", subsector: "Gas Transmission", region: "Europe", country: "Germany", description: "Germany's largest gas transmission system operator." },
      { name: "Pacific National", sector: "Transportation", subsector: "Rail Freight", region: "Asia-Pacific", country: "Australia", description: "Australia's largest private rail freight operator." },
      { name: "Patrick Terminals", sector: "Transportation", subsector: "Port Terminal", region: "Asia-Pacific", country: "Australia", description: "Major container terminal operator at Australian ports." },
      { name: "Puget Sound Energy", sector: "Utilities", subsector: "Electric & Gas Utility", region: "North America", country: "United States", description: "Washington state's largest electric and gas utility." },
      { name: "Rakuten Mobile (Infra JV)", sector: "Digital Infrastructure", subsector: "Mobile Network", region: "Asia-Pacific", country: "Japan", description: "Joint venture related to Rakuten Mobile's telecom infrastructure in Japan." },
      { name: "Reden Solar", sector: "Renewables / Energy Transition", subsector: "Solar", region: "Europe", country: "France", description: "European solar photovoltaic platform with operations in France, Spain, Portugal, and Greece." },
      { name: "Renewi PLC", sector: "Waste / Environmental Services", subsector: "Waste Management", region: "Europe", country: "Netherlands", description: "Leading waste-to-product company operating in the Benelux and UK." },
      { name: "Summit Digitel (Data Infrastructure Trust)", sector: "Digital Infrastructure", subsector: "Towers", region: "Asia-Pacific", country: "India", description: "India's largest tower infrastructure company, hosting telecom towers for Jio and other carriers." },
      { name: "Thames Water", sector: "Water", subsector: "Water & Wastewater Utility", region: "Europe", country: "United Kingdom", description: "The UK's largest water and wastewater services provider, serving Greater London and the Thames Valley." },
      { name: "Transelec", sector: "Utilities", subsector: "Electricity Transmission", region: "Latin America", country: "Chile", description: "Chile's largest electricity transmission company." },
      { name: "Trencap LP (Energir)", sector: "Utilities", subsector: "Gas Distribution", region: "North America", country: "Canada", description: "Holding company for Energir, Quebec's primary natural gas distribution utility." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 22. Bernhard Capital Partners
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-022a",
    managerName: "Bernhard Capital Partners",
    fundName: "Bernhard Capital Partners Infrastructure Fund",
    ticker: null,
    description:
      "A lower-middle-market private equity fund focused on essential infrastructure services across the United States, including utility services, industrial infrastructure, and environmental services. The firm leverages deep operational expertise in regulated and contracted infrastructure sectors.",
    size: "~$1 Billion (across funds)",
    sizeUsdMm: 1000,
    vintage: "2018",
    strategies: ["Value-Add", "Growth"],
    structure: "Closed-End",
    sectors: ["Utilities", "Power Generation", "Water", "Waste / Environmental Services", "Transportation"],
    regions: ["North America"],
    portfolioCompanies: [
      { name: "Allied Power", sector: "Power Generation", subsector: "Power Plant Services", region: "North America", country: "United States", description: "Provider of maintenance, outage, and construction services for power generation facilities." },
      { name: "ClearCurrent", sector: "Water", subsector: "Water Treatment", region: "North America", country: "United States", description: "Water and wastewater treatment solutions provider." },
      { name: "Delta Utilities", sector: "Utilities", subsector: "Water & Wastewater Utility", region: "North America", country: "United States", description: "Regulated water and wastewater utility serving communities in Mississippi." },
      { name: "Elevation", sector: "Power Generation", subsector: "Power Services", region: "North America", country: "United States", description: "Specialty services provider for power and industrial infrastructure." },
      { name: "Epic Piping", sector: "Midstream / Energy", subsector: "Pipe Fabrication", region: "North America", country: "United States", description: "Industrial pipe fabrication and modular assembly company serving energy and petrochemical sectors." },
      { name: "Green Meadow Sustainable Solutions", sector: "Waste / Environmental Services", subsector: "Biosolids Management", region: "North America", country: "United States", description: "Provider of biosolids management and sustainable soil solutions." },
      { name: "National Water Infrastructure", sector: "Water", subsector: "Water Infrastructure Services", region: "North America", country: "United States", description: "Provider of water infrastructure construction and rehabilitation services." },
      { name: "New Mexico Gas Company", sector: "Utilities", subsector: "Gas Distribution", region: "North America", country: "United States", description: "Regulated natural gas distribution utility serving New Mexico." },
      { name: "Optimum Energy", sector: "Renewables / Energy Transition", subsector: "Energy Efficiency", region: "North America", country: "United States", description: "Provider of HVAC optimization and energy efficiency solutions for commercial buildings." },
      { name: "RailWorks", sector: "Transportation", subsector: "Rail Infrastructure Services", region: "North America", country: "United States", description: "North America's leading provider of rail infrastructure services including track construction and maintenance." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 23. BlackRock
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-023a",
    managerName: "BlackRock",
    fundName: "BlackRock Global Infrastructure Platform",
    ticker: null,
    description:
      "BlackRock's diversified global infrastructure equity platform, one of the world's largest, deploying capital across the full risk-return spectrum from core to opportunistic through multiple fund vintages and mandates. The platform spans transportation, energy, digital infrastructure, renewables, and utilities globally.",
    size: "$50+ Billion (Platform AUM)",
    sizeUsdMm: 50000,
    vintage: "2012",
    strategies: ["Core", "Core-Plus", "Value-Add", "Opportunistic"],
    structure: "Open-End",
    sectors: ["Renewables / Energy Transition", "Transportation", "Midstream / Energy", "Digital Infrastructure", "Utilities", "Power Generation", "Logistics"],
    regions: ["North America", "Europe", "Asia-Pacific", "Latin America", "Middle East & Africa", "Global"],
    portfolioCompanies: [
      { name: "ACS Renewables", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Global", country: "Spain", description: "Renewable energy portfolio acquired from ACS Group spanning multiple geographies." },
      { name: "ADNOC Gas Pipelines", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "Middle East & Africa", country: "United Arab Emirates", description: "Minority stake in ADNOC's gas pipeline network in Abu Dhabi." },
      { name: "AES Corp", sector: "Power Generation", subsector: "Diversified Power", region: "Global", country: "United States", description: "Global power company with generation and distribution assets across multiple countries." },
      { name: "Akaysha Energy", sector: "Renewables / Energy Transition", subsector: "Battery Storage", region: "Asia-Pacific", country: "Australia", description: "Australian utility-scale battery energy storage developer and operator." },
      { name: "Aligned Data Centers", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "Hyperscale and enterprise colocation data center platform in the US." },
      { name: "Ascend Telecom Infrastructure", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Asia-Pacific", country: "India", description: "Indian data center platform providing colocation and hosting services." },
      { name: "Atlas Renewable Energy", sector: "Renewables / Energy Transition", subsector: "Solar & Wind", region: "Latin America", country: "Brazil", description: "Latin American renewable energy platform with solar and wind assets across Brazil, Chile, Mexico, and Uruguay." },
      { name: "Biffa", sector: "Waste / Environmental Services", subsector: "Waste Management", region: "Europe", country: "United Kingdom", description: "Leading UK integrated waste management company." },
      { name: "Bluepoint Wind", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "North America", country: "United States", description: "Offshore wind development project in the US Atlantic." },
      { name: "Borkum Riffgrund 2", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "Europe", country: "Germany", description: "Offshore wind farm in the German North Sea." },
      { name: "Calisen", sector: "Utilities", subsector: "Smart Metering", region: "Europe", country: "United Kingdom", description: "UK smart meter installation and management platform." },
      { name: "Channelview Cogeneration", sector: "Power Generation", subsector: "Cogeneration", region: "North America", country: "United States", description: "Natural gas-fired cogeneration facility in Texas." },
      { name: "Clearway Energy", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "North America", country: "United States", description: "One of the largest US renewable energy owners and operators with wind, solar, and storage assets." },
      { name: "DSD Renewables", sector: "Renewables / Energy Transition", subsector: "Community Solar", region: "North America", country: "United States", description: "US distributed and community solar developer and operator." },
      { name: "Eni CCUS Holding", sector: "Renewables / Energy Transition", subsector: "Carbon Capture", region: "Europe", country: "Italy", description: "Carbon capture, utilization, and storage joint venture with Eni." },
      { name: "Eolian", sector: "Renewables / Energy Transition", subsector: "Wind", region: "North America", country: "United States", description: "US wind energy platform." },
      { name: "GasLog", sector: "Transportation", subsector: "LNG Shipping", region: "Global", country: "Monaco", description: "International owner, operator, and manager of LNG carriers." },
      { name: "Gigapower", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "Joint venture with AT&T for fiber-to-the-home broadband deployment." },
      { name: "Jupiter Power", sector: "Renewables / Energy Transition", subsector: "Battery Storage", region: "North America", country: "United States", description: "Utility-scale battery energy storage developer and operator in Texas and across the US." },
      { name: "Kellas Midstream", sector: "Midstream / Energy", subsector: "Gas Processing", region: "Europe", country: "United Kingdom", description: "North Sea midstream gas processing and transportation platform." },
      { name: "Malaysia Airports Holdings Berhad", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "Malaysia", description: "Operator of airports across Malaysia including Kuala Lumpur International Airport." },
      { name: "Naturgy", sector: "Utilities", subsector: "Gas & Electric Utility", region: "Europe", country: "Spain", description: "Major Spanish integrated gas and electricity utility." },
      { name: "Peel Ports", sector: "Transportation", subsector: "Ports", region: "Europe", country: "United Kingdom", description: "Major UK port operator including the Port of Liverpool and Manchester Ship Canal." },
      { name: "Recurrent Energy", sector: "Renewables / Energy Transition", subsector: "Solar & Storage", region: "North America", country: "United States", description: "Utility-scale solar and energy storage developer, formerly Canadian Solar's US subsidiary." },
      { name: "Rio Grande LNG", sector: "Midstream / Energy", subsector: "LNG Export", region: "North America", country: "United States", description: "LNG export terminal development project in Brownsville, Texas." },
      { name: "SUEZ Group", sector: "Water", subsector: "Water & Waste Services", region: "Global", country: "France", description: "Global leader in water treatment and waste management services." },
      { name: "Signature Aviation", sector: "Transportation", subsector: "Aviation Services", region: "Global", country: "United Kingdom", description: "World's largest fixed base operator (FBO) network for business and private aviation." },
      { name: "Skyborn Renewables", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "Europe", country: "Germany", description: "Global offshore wind developer (formerly wpd offshore)." },
      { name: "Sydney Airport", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "Australia", description: "Australia's largest and busiest airport." },
      { name: "TCR", sector: "Transportation", subsector: "Ground Support Equipment", region: "Europe", country: "Belgium", description: "Global provider of ground support equipment leasing to airlines and airports." },
      { name: "Terminal Investment Limited", sector: "Transportation", subsector: "Port Terminals", region: "Global", country: "Switzerland", description: "Global container terminal operator with investments across multiple continents." },
      { name: "Tramarsa", sector: "Logistics", subsector: "Port Logistics", region: "Latin America", country: "Peru", description: "Peruvian port logistics and stevedoring services company." },
      { name: "True IDC", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Asia-Pacific", country: "Thailand", description: "Leading data center and cloud service provider in Thailand." },
      { name: "Vanguard Renewables", sector: "Renewables / Energy Transition", subsector: "Biogas", region: "North America", country: "United States", description: "US farm-powered biogas and renewable natural gas producer." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 24. Blackstone
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-024a",
    managerName: "Blackstone",
    fundName: "Blackstone Infrastructure Partners (BIP)",
    ticker: null,
    description:
      "Blackstone's flagship infrastructure equity platform, one of the largest in the alternative asset management industry. The platform pursues large-scale, control-oriented investments in transportation, energy, digital infrastructure, and water/waste across developed markets, combining Blackstone's operational expertise and scale advantages.",
    size: "$40+ Billion (Platform AUM)",
    sizeUsdMm: 40000,
    vintage: "2019",
    strategies: ["Core-Plus", "Value-Add", "Opportunistic"],
    structure: "Closed-End",
    sectors: ["Transportation", "Digital Infrastructure", "Midstream / Energy", "Utilities", "Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    portfolioCompanies: [
      { name: "AGS Airports", sector: "Transportation", subsector: "Airports", region: "Europe", country: "United Kingdom", description: "Operator of Aberdeen, Glasgow, and Southampton airports in the UK." },
      { name: "AirTrunk", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Asia-Pacific", country: "Australia", description: "Asia-Pacific's largest independent hyperscale data center platform with operations across Australia, Japan, Singapore, and Malaysia." },
      { name: "Applegreen", sector: "Transportation", subsector: "Motorway Services", region: "Europe", country: "Ireland", description: "Leading motorway service area and convenience retail operator in Ireland, UK, and US." },
      { name: "Atlantic Power Transmission LLC", sector: "Utilities", subsector: "Electricity Transmission", region: "North America", country: "United States", description: "High-voltage direct current transmission line developer." },
      { name: "Autostrade per l'Italia (Mundys)", sector: "Transportation", subsector: "Toll Roads", region: "Europe", country: "Italy", description: "Italy's largest toll motorway operator, part of the Mundys (formerly Atlantia) group." },
      { name: "Carrix / SSA Marine", sector: "Transportation", subsector: "Port Terminals", region: "North America", country: "United States", description: "One of the largest privately held marine terminal operators in the world." },
      { name: "Cheniere Energy Partners", sector: "Midstream / Energy", subsector: "LNG Export", region: "North America", country: "United States", description: "Major US LNG export terminal operator at Sabine Pass and Corpus Christi." },
      { name: "FirstEnergy", sector: "Utilities", subsector: "Electric Utility", region: "North America", country: "United States", description: "Major US electric utility holding company serving customers across the Midwest and Mid-Atlantic." },
      { name: "Invenergy Renewables", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "North America", country: "United States", description: "One of the largest privately held renewable energy companies in North America." },
      { name: "Neysa", sector: "Midstream / Energy", subsector: "Gas Processing", region: "North America", country: "United States", description: "Midstream gas processing and natural gas liquids platform." },
      { name: "NiSource (NIPSCO)", sector: "Utilities", subsector: "Gas & Electric Utility", region: "North America", country: "United States", description: "Regulated gas and electric utility operating primarily in Indiana." },
      { name: "Port Arthur LNG Phase 2", sector: "Midstream / Energy", subsector: "LNG Export", region: "North America", country: "United States", description: "Phase 2 expansion of the Port Arthur LNG export facility in Texas." },
      { name: "QTS Data Centers", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "Major US data center platform providing hyperscale, hybrid colocation, and managed hosting." },
      { name: "Sabre Industries", sector: "Utilities", subsector: "Transmission Structures", region: "North America", country: "United States", description: "Manufacturer of utility transmission and distribution structures, poles, and substations." },
      { name: "Safe Harbor Marinas", sector: "Transportation", subsector: "Marinas", region: "North America", country: "United States", description: "Largest owner and operator of marinas in the United States." },
      { name: "Symphony Infrastructure Partners", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Asia-Pacific", country: "India", description: "Indian digital infrastructure platform focused on fiber and connectivity." },
      { name: "Tallgrass Energy", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "North America", country: "United States", description: "Midstream energy company operating natural gas pipelines and processing facilities in the central US." },
      { name: "Urbaser", sector: "Waste / Environmental Services", subsector: "Waste Management", region: "Europe", country: "Spain", description: "Global environmental services company specializing in waste collection, treatment, and urban services." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 25. Brookfield Asset Management
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-025a",
    managerName: "Brookfield Asset Management",
    fundName: "Brookfield Infrastructure Partners & Super-Core Infrastructure Partners",
    ticker: "BIP / BIPC",
    description:
      "Brookfield's flagship infrastructure platform combining its publicly listed permanent capital vehicle (BIP/BIPC) and its institutional super-core fund. Together they form one of the world's largest and most diversified infrastructure portfolios, spanning utilities, transport, midstream, data, and renewables across every major continent.",
    size: "$100+ Billion (Infrastructure Platform AUM)",
    sizeUsdMm: 100000,
    vintage: "2008",
    strategies: ["Core", "Core-Plus", "Value-Add"],
    structure: "Permanent Capital",
    sectors: ["Utilities", "Transportation", "Midstream / Energy", "Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Logistics"],
    regions: ["North America", "Europe", "Asia-Pacific", "Latin America", "Global"],
    portfolioCompanies: [
      { name: "Arteris", sector: "Transportation", subsector: "Toll Roads", region: "Latin America", country: "Brazil", description: "One of Brazil's largest toll road concession operators." },
      { name: "AusNet Services", sector: "Utilities", subsector: "Electricity & Gas Distribution", region: "Asia-Pacific", country: "Australia", description: "Major Australian electricity transmission, electricity distribution, and gas distribution network operator in Victoria." },
      { name: "BOXT Ltd", sector: "Utilities", subsector: "Home Energy Services", region: "Europe", country: "United Kingdom", description: "UK online boiler installation and home energy services platform." },
      { name: "BUUK Infrastructure", sector: "Utilities", subsector: "Multi-Utility Networks", region: "Europe", country: "United Kingdom", description: "UK multi-utility infrastructure provider for new housing and commercial developments." },
      { name: "Compass Datacenters", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "Wholesale hyperscale data center developer and operator." },
      { name: "Cyxtera (Evoque)", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "Data center colocation and interconnection platform (rebranded as Evoque)." },
      { name: "Data4", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Europe", country: "France", description: "European data center operator with campuses in France, Italy, Spain, and Poland." },
      { name: "Deriva Energy", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "North America", country: "United States", description: "US renewable energy platform (formerly Duke Energy Renewables)." },
      { name: "Enercare", sector: "Utilities", subsector: "Home Services", region: "North America", country: "Canada", description: "Canadian home and commercial energy services provider including HVAC, water heaters, and plumbing." },
      { name: "FirstEnergy Transmission (FET)", sector: "Utilities", subsector: "Electricity Transmission", region: "North America", country: "United States", description: "High-voltage electricity transmission subsidiary of FirstEnergy serving the PJM region." },
      { name: "GD Towers", sector: "Digital Infrastructure", subsector: "Towers", region: "Europe", country: "Germany", description: "Deutsche Telekom's tower infrastructure company operating ~40,000 sites in Germany and Austria." },
      { name: "Genesee & Wyoming", sector: "Transportation", subsector: "Short-Line Rail", region: "North America", country: "United States", description: "One of the world's largest short-line and regional railroad operators." },
      { name: "Holtwood", sector: "Power Generation", subsector: "Hydroelectric", region: "North America", country: "United States", description: "Hydroelectric power generation facility on the Susquehanna River." },
      { name: "Hotwire Communications", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "Fiber-optic telecommunications provider for residential and commercial properties." },
      { name: "Intel Semiconductor Fab JV", sector: "Digital Infrastructure", subsector: "Semiconductor Fab", region: "North America", country: "United States", description: "Joint venture with Intel for semiconductor fabrication facility development." },
      { name: "Inter Pipeline", sector: "Midstream / Energy", subsector: "Pipelines & Petrochemicals", region: "North America", country: "Canada", description: "Major Canadian petroleum transportation, natural gas liquids processing, and petrochemicals company." },
      { name: "Lodi Gas Storage", sector: "Midstream / Energy", subsector: "Gas Storage", region: "North America", country: "United States", description: "Underground natural gas storage facility in California." },
      { name: "Metergy Solutions", sector: "Utilities", subsector: "Smart Metering", region: "North America", country: "Canada", description: "Canadian submetering and utility billing solutions provider." },
      { name: "Natural Gas Pipeline Company of America", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "North America", country: "United States", description: "Major interstate natural gas pipeline system spanning the US Gulf Coast to the Midwest." },
      { name: "Neoen", sector: "Renewables / Energy Transition", subsector: "Solar, Wind & Storage", region: "Global", country: "France", description: "Global independent renewable energy producer with solar, wind, and storage assets across multiple continents." },
      { name: "NorthRiver Midstream", sector: "Midstream / Energy", subsector: "Gas Processing", region: "North America", country: "Canada", description: "Western Canadian midstream gas gathering, processing, and transportation company." },
      { name: "Northview Energy", sector: "Renewables / Energy Transition", subsector: "Solar & Storage", region: "North America", country: "United States", description: "US-based solar and energy storage development platform." },
      { name: "Nova Transportadora do Sudeste (NTS)", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "Latin America", country: "Brazil", description: "Largest natural gas pipeline network in southeastern Brazil." },
      { name: "OnPath Energy", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "Europe", country: "United Kingdom", description: "UK offshore wind development platform." },
      { name: "Pipeline Infrastructure", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "Europe", country: "United Kingdom", description: "UK gas pipeline infrastructure operator." },
      { name: "Rockpoint Gas Storage", sector: "Midstream / Energy", subsector: "Gas Storage", region: "North America", country: "Canada", description: "Underground natural gas storage operator in Alberta, Canada." },
      { name: "Rutas de Lima", sector: "Transportation", subsector: "Toll Roads", region: "Latin America", country: "Peru", description: "Toll road concession operator serving Lima, Peru." },
      { name: "Scout Clean Energy", sector: "Renewables / Energy Transition", subsector: "Wind & Solar", region: "North America", country: "United States", description: "US utility-scale wind and solar developer and operator." },
      { name: "TDF", sector: "Communications", subsector: "Broadcast Infrastructure", region: "Europe", country: "France", description: "France's leading broadcast and telecommunications infrastructure operator." },
      { name: "Thermondo", sector: "Renewables / Energy Transition", subsector: "Heat Pumps", region: "Europe", country: "Germany", description: "German residential heating installation and energy transition platform." },
      { name: "Trans Bay Cable", sector: "Utilities", subsector: "Electricity Transmission", region: "North America", country: "United States", description: "Underwater high-voltage direct current transmission cable in San Francisco Bay." },
      { name: "Triton International", sector: "Logistics", subsector: "Container Leasing", region: "Global", country: "Bermuda", description: "World's largest intermodal shipping container lessor." },
      { name: "Urban Grid", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "US utility-scale solar and storage development company." },
      { name: "VLI", sector: "Transportation", subsector: "Rail & Port Logistics", region: "Latin America", country: "Brazil", description: "Brazilian integrated rail and port logistics company." },
      { name: "Valokuitunen", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Finland", description: "Finnish fiber-optic network operator serving rural and suburban areas." },
      { name: "Vanti S.A. ESP", sector: "Utilities", subsector: "Gas Distribution", region: "Latin America", country: "Colombia", description: "Colombia's largest natural gas distribution utility." },
      { name: "Warwick Gas Storage", sector: "Midstream / Energy", subsector: "Gas Storage", region: "Europe", country: "United Kingdom", description: "Underground natural gas storage facility in the UK." },
      { name: "Westinghouse Electric", sector: "Power Generation", subsector: "Nuclear Services", region: "Global", country: "United States", description: "Global nuclear power technology, fuel, and services company." },
      { name: "Wireless Infrastructure Group (WIG)", sector: "Digital Infrastructure", subsector: "Towers", region: "Europe", country: "United Kingdom", description: "UK independent wireless infrastructure provider operating towers and small cells." },
      { name: "X-ELIO", sector: "Renewables / Energy Transition", subsector: "Solar", region: "Global", country: "Spain", description: "Global solar photovoltaic developer and independent power producer." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 26. Carlyle Infrastructure
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-026a",
    managerName: "Carlyle Infrastructure",
    fundName: "Carlyle Global Infrastructure Opportunity Fund",
    ticker: null,
    description:
      "Carlyle's dedicated infrastructure equity fund targeting high-growth, value-add investments in energy, digital infrastructure, transportation, and power across North America and Europe. The platform emphasizes energy transition, data infrastructure, and contracted essential services.",
    size: "~$3.5 Billion (across fund vintages)",
    sizeUsdMm: 3500,
    vintage: "2022",
    strategies: ["Value-Add", "Growth"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Power Generation", "Midstream / Energy"],
    regions: ["North America", "Europe"],
    portfolioCompanies: [
      { name: "AlphaStruxure", sector: "Renewables / Energy Transition", subsector: "Energy-as-a-Service", region: "North America", country: "United States", description: "Joint venture with Schneider Electric providing energy-as-a-service and distributed energy solutions." },
      { name: "Amp Energy", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Global", country: "Canada", description: "Global renewable energy and battery storage platform with operations in North America, Asia, and Europe." },
      { name: "Aspen Power", sector: "Renewables / Energy Transition", subsector: "Community Solar", region: "North America", country: "United States", description: "US community and distributed solar platform." },
      { name: "Copia Power", sector: "Renewables / Energy Transition", subsector: "Solar & Storage", region: "North America", country: "United States", description: "Utility-scale solar and energy storage developer in the US." },
      { name: "Crescent Midstream", sector: "Midstream / Energy", subsector: "Marine Terminals", region: "North America", country: "United States", description: "Midstream company operating petroleum terminals and logistics infrastructure along the US Gulf Coast." },
      { name: "Fermata Energy", sector: "Renewables / Energy Transition", subsector: "Vehicle-to-Grid", region: "North America", country: "United States", description: "Pioneer in vehicle-to-everything (V2X) energy technology and bidirectional charging." },
      { name: "London Southend Airport", sector: "Transportation", subsector: "Airports", region: "Europe", country: "United Kingdom", description: "Regional airport serving London and southeast England." },
      { name: "New Terminal One (JFK Airport)", sector: "Transportation", subsector: "Airport Terminals", region: "North America", country: "United States", description: "Consortium developing the new international terminal at JFK Airport in New York." },
      { name: "NineDot Energy", sector: "Renewables / Energy Transition", subsector: "Battery Storage", region: "North America", country: "United States", description: "Urban battery energy storage developer focused on New York City and constrained markets." },
      { name: "Revera Energy", sector: "Power Generation", subsector: "Flexible Generation", region: "Europe", country: "United Kingdom", description: "UK flexible power generation and peaking plant platform." },
      { name: "Telis Energy", sector: "Power Generation", subsector: "Gas-Fired Power", region: "North America", country: "United States", description: "US natural gas-fired power generation platform." },
      { name: "Tillman Infrastructure", sector: "Digital Infrastructure", subsector: "Towers", region: "North America", country: "United States", description: "US wireless telecommunications tower company." },
      { name: "Wyyerd Fiber Group", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "US fiber-to-the-home broadband provider serving rural and underserved communities." },
      { name: "ark data centers (formerly Involta)", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "US data center and cloud solutions platform (rebranded from Involta to ark data centers)." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 27. CBRE Investment Management
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-027a",
    managerName: "CBRE Investment Management",
    fundName: "CBRE Infrastructure Strategy",
    ticker: null,
    description:
      "CBRE Investment Management's dedicated infrastructure equity platform investing in core and core-plus essential infrastructure assets. The strategy focuses on regulated, contracted, and concession-based businesses across transportation, digital infrastructure, utilities, and renewables in developed markets.",
    size: "~$4 Billion (Infrastructure AUM)",
    sizeUsdMm: 4000,
    vintage: "2018",
    strategies: ["Core", "Core-Plus"],
    structure: "Open-End",
    sectors: ["Digital Infrastructure", "Transportation", "Renewables / Energy Transition", "Utilities", "Communications"],
    regions: ["North America", "Europe"],
    portfolioCompanies: [
      { name: "Accelerate Infrastructure Opportunities", sector: "Digital Infrastructure", subsector: "Infrastructure Platform", region: "North America", country: "United States", description: "Digital and essential infrastructure investment platform." },
      { name: "CitySwitch", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Asia-Pacific", country: "Australia", description: "Australian data center and connectivity platform." },
      { name: "ClearGen Holdings", sector: "Renewables / Energy Transition", subsector: "Distributed Generation", region: "North America", country: "United States", description: "Distributed energy and clean generation platform." },
      { name: "Connect Bus", sector: "Transportation", subsector: "Bus Services", region: "Europe", country: "Norway", description: "Norwegian public bus transportation operator." },
      { name: "Gateway Fiber", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "US fiber-to-the-home broadband provider serving Midwest communities." },
      { name: "Geonova", sector: "Renewables / Energy Transition", subsector: "Geothermal", region: "Europe", country: "France", description: "Geothermal energy platform in France." },
      { name: "Norled AS", sector: "Transportation", subsector: "Ferry Services", region: "Europe", country: "Norway", description: "Major Norwegian ferry and express boat operator, pioneering electric and hydrogen vessels." },
      { name: "Vantage Data Centers (Stabilized Portfolio)", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "Stabilized hyperscale data center portfolio from Vantage's North American campuses." },
      { name: "WANRack", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "Provider of managed fiber and broadband infrastructure to school districts and municipalities." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 28. CDPQ
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-028a",
    managerName: "CDPQ",
    fundName: "CDPQ Infrastructure Portfolio",
    ticker: null,
    description:
      "Caisse de dépôt et placement du Québec's direct infrastructure investment portfolio, one of the largest among global pension funds. CDPQ invests across the full infrastructure spectrum including transportation, energy transition, digital infrastructure, and regulated utilities, with a distinctive willingness to develop and build greenfield projects such as the Réseau express métropolitain (REM) in Montreal.",
    size: "~C$50 Billion (Infrastructure Portfolio)",
    sizeUsdMm: 37000,
    vintage: "2000",
    strategies: ["Core", "Core-Plus", "Value-Add", "Growth"],
    structure: "Permanent Capital",
    sectors: ["Transportation", "Renewables / Energy Transition", "Digital Infrastructure", "Utilities", "Midstream / Energy", "Power Generation", "Social Infrastructure"],
    regions: ["North America", "Europe", "Asia-Pacific", "Latin America", "Middle East & Africa", "Global"],
    portfolioCompanies: [
      { name: "AES Indiana", sector: "Utilities", subsector: "Electric Utility", region: "North America", country: "United States", description: "Regulated electric utility serving Indianapolis and central Indiana." },
      { name: "Akiem", sector: "Transportation", subsector: "Rolling Stock Leasing", region: "Europe", country: "France", description: "Leading European locomotive and rolling stock leasing company." },
      { name: "Albioma SA", sector: "Renewables / Energy Transition", subsector: "Biomass & Solar", region: "Global", country: "France", description: "Independent power producer specializing in biomass and solar energy, primarily in French overseas territories." },
      { name: "American Tower Corporation Europe (ATC Europe)", sector: "Digital Infrastructure", subsector: "Towers", region: "Europe", country: "Spain", description: "European operations of American Tower, one of the world's largest wireless tower companies." },
      { name: "Apraava Energy", sector: "Power Generation", subsector: "Diversified Power", region: "Asia-Pacific", country: "India", description: "Indian power generation company (formerly CLP India) with thermal, wind, and solar assets." },
      { name: "Boralex", sector: "Renewables / Energy Transition", subsector: "Wind & Solar", region: "North America", country: "Canada", description: "Canadian renewable energy company with wind, solar, and hydroelectric assets in Canada, US, France, and UK." },
      { name: "Cadence (Alto High-Speed Rail)", sector: "Transportation", subsector: "High-Speed Rail", region: "North America", country: "United States", description: "Private high-speed rail project connecting major US cities." },
      { name: "Colisée", sector: "Social Infrastructure", subsector: "Healthcare Facilities", region: "Europe", country: "France", description: "European care home and healthcare services operator." },
      { name: "Connexa", sector: "Digital Infrastructure", subsector: "Towers", region: "Europe", country: "Spain", description: "European telecommunications tower platform." },
      { name: "DP World JV (UAE)", sector: "Transportation", subsector: "Ports", region: "Middle East & Africa", country: "United Arab Emirates", description: "Joint venture with DP World for port and logistics assets in the UAE." },
      { name: "DP World Maspion East Java", sector: "Transportation", subsector: "Ports", region: "Asia-Pacific", country: "Indonesia", description: "Port development joint venture with DP World in East Java, Indonesia." },
      { name: "Edify Energy", sector: "Renewables / Energy Transition", subsector: "Solar & Storage", region: "Asia-Pacific", country: "Australia", description: "Australian renewable energy developer with solar and battery storage projects." },
      { name: "Eurostar", sector: "Transportation", subsector: "High-Speed Rail", region: "Europe", country: "Belgium", description: "Cross-Channel high-speed rail operator connecting London to Paris, Brussels, and Amsterdam." },
      { name: "Grand Changhua 1", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "Asia-Pacific", country: "Taiwan", description: "Offshore wind farm project in the Taiwan Strait." },
      { name: "HY2GEN", sector: "Renewables / Energy Transition", subsector: "Green Hydrogen", region: "Europe", country: "Germany", description: "Developer of green hydrogen production facilities in Europe and North America." },
      { name: "InTransit BC (Canada Line)", sector: "Transportation", subsector: "Rail Transit", region: "North America", country: "Canada", description: "Concessionaire of the Canada Line rapid transit in Vancouver, British Columbia." },
      { name: "Innergex Renewable Energy", sector: "Renewables / Energy Transition", subsector: "Hydro, Wind & Solar", region: "North America", country: "Canada", description: "Canadian independent renewable power producer with hydro, wind, and solar assets." },
      { name: "Invenergy Renewables", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "North America", country: "United States", description: "One of the largest privately held renewable energy companies in North America." },
      { name: "Keolis", sector: "Transportation", subsector: "Public Transit", region: "Global", country: "France", description: "Major global public transportation operator managing bus, tram, metro, and rail services." },
      { name: "London Array", sector: "Renewables / Energy Transition", subsector: "Offshore Wind", region: "Europe", country: "United Kingdom", description: "One of the world's largest offshore wind farms, located in the outer Thames Estuary." },
      { name: "Plenary Americas", sector: "Social Infrastructure", subsector: "PPP / P3", region: "North America", country: "Canada", description: "Leading North American public-private partnership (P3) developer and investor." },
      { name: "Port of Brisbane", sector: "Transportation", subsector: "Ports", region: "Asia-Pacific", country: "Australia", description: "Major Australian port handling containers, bulk, and automotive cargo." },
      { name: "QSL International", sector: "Logistics", subsector: "Supply Chain Services", region: "Asia-Pacific", country: "Australia", description: "Australian sugar industry supply chain and logistics services provider." },
      { name: "Renewa", sector: "Renewables / Energy Transition", subsector: "Wind & Solar", region: "Asia-Pacific", country: "India", description: "Indian renewable energy platform with wind and solar assets." },
      { name: "Réseau express métropolitain (REM)", sector: "Transportation", subsector: "Automated Light Metro", region: "North America", country: "Canada", description: "Automated light metro system under construction in Greater Montreal, developed by CDPQ Infra." },
      { name: "Shizen Energy", sector: "Renewables / Energy Transition", subsector: "Solar & Wind", region: "Asia-Pacific", country: "Japan", description: "Japanese renewable energy developer and operator." },
      { name: "Sizewell C", sector: "Power Generation", subsector: "Nuclear", region: "Europe", country: "United Kingdom", description: "New nuclear power station project in Suffolk, England." },
      { name: "Southern Star Central Gas Pipeline", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "North America", country: "United States", description: "Interstate natural gas pipeline system serving the central United States." },
      { name: "Student Transportation of America", sector: "Transportation", subsector: "School Bus Services", region: "North America", country: "Canada", description: "Major school bus transportation provider across North America." },
      { name: "Sydney Metro", sector: "Transportation", subsector: "Metro Rail", region: "Asia-Pacific", country: "Australia", description: "PPP concession for Sydney's metro rail network operations and maintenance." },
      { name: "Terrion", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Latin America", country: "Brazil", description: "Brazilian data center platform." },
      { name: "TramCité", sector: "Transportation", subsector: "Light Rail", region: "North America", country: "Canada", description: "Light rail transit project in the Greater Montreal area." },
      { name: "TransGrid", sector: "Utilities", subsector: "Electricity Transmission", region: "Asia-Pacific", country: "Australia", description: "Operator of the high-voltage electricity transmission network in New South Wales, Australia." },
      { name: "Transportadora Associada de Gás S.A.", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "Latin America", country: "Brazil", description: "Major Brazilian natural gas transportation company." },
      { name: "Velto Renewables (Q-Energy)", sector: "Renewables / Energy Transition", subsector: "Solar & Wind", region: "Europe", country: "Spain", description: "European renewable energy platform (formerly Q-Energy) with solar and wind assets." },
      { name: "Vertical Bridge", sector: "Digital Infrastructure", subsector: "Towers", region: "North America", country: "United States", description: "Largest private owner and operator of wireless infrastructure in the United States." },
      { name: "Énergir", sector: "Utilities", subsector: "Gas Distribution", region: "North America", country: "Canada", description: "Quebec's primary natural gas distribution utility and renewable energy producer." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 29. Charlesbank Capital Partners
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-029a",
    managerName: "Charlesbank Capital Partners",
    fundName: "Charlesbank Technology Opportunities Fund",
    ticker: null,
    description:
      "Charlesbank's middle-market private equity platform with selective exposure to technology-enabled infrastructure services. The firm focuses on growth-oriented investments in technology, services, and communications sectors.",
    size: "~$5 Billion (Firm AUM)",
    sizeUsdMm: 5000,
    vintage: "2020",
    strategies: ["Growth", "Value-Add"],
    structure: "Closed-End",
    sectors: ["Digital Infrastructure"],
    regions: ["North America"],
    portfolioCompanies: [
      { name: "Six Degrees", sector: "Digital Infrastructure", subsector: "Managed IT & Cloud", region: "Europe", country: "United Kingdom", description: "UK managed cloud services, connectivity, and cybersecurity provider serving mid-market enterprises." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 30. CIM Group
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-030a",
    managerName: "CIM Group",
    fundName: "CIM Infrastructure & Energy Fund",
    ticker: null,
    description:
      "CIM Group's infrastructure and energy investment platform focused on essential infrastructure assets including renewable energy, water resources, digital infrastructure, and environmental services, primarily in the western United States. The firm brings a real assets orientation with deep expertise in project development and operations.",
    size: "~$2 Billion (Infrastructure Platform)",
    sizeUsdMm: 2000,
    vintage: "2019",
    strategies: ["Value-Add", "Opportunistic"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition", "Water", "Digital Infrastructure"],
    regions: ["North America"],
    portfolioCompanies: [
      { name: "Antelope Valley Water Bank", sector: "Water", subsector: "Water Storage", region: "North America", country: "United States", description: "Underground water banking and storage facility in California's Antelope Valley." },
      { name: "Aquamarine Solar Project", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "Utility-scale solar photovoltaic project." },
      { name: "Bolder Industries", sector: "Waste / Environmental Services", subsector: "Tire Recycling", region: "North America", country: "United States", description: "Sustainable materials company converting end-of-life tires into carbon black and oil." },
      { name: "Ecoppia", sector: "Renewables / Energy Transition", subsector: "Solar Robotics", region: "Global", country: "Israel", description: "Robotic solar panel cleaning technology company." },
      { name: "Novva Data Centers", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "Western US data center platform focused on sustainability and energy-efficient operations." },
      { name: "SolarBank JV", sector: "Renewables / Energy Transition", subsector: "Community Solar", region: "North America", country: "United States", description: "Community solar joint venture platform." },
      { name: "Terreva Renewables", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "North America", country: "United States", description: "Renewable energy development and investment platform." },
      { name: "Westlands Electric Power Company", sector: "Power Generation", subsector: "Solar & Storage", region: "North America", country: "United States", description: "Power company developing solar and battery storage projects in California's Central Valley." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 31. Ara Partners
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-031a",
    managerName: "Ara Partners",
    fundName: "Ara Partners Industrial Decarbonization Fund",
    ticker: null,
    description: "Ara Partners invests in lower middle-market industrial decarbonization businesses, focusing on companies that reduce industrial emissions through clean energy, circular economy, and resource efficiency solutions.",
    size: "~$1.5 Billion (across funds)",
    sizeUsdMm: 1500,
    vintage: "2022",
    strategies: ["Value-Add", "Growth"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Waste / Environmental Services", "Midstream / Energy"],
    regions: ["North America", "Europe"],
    portfolioCompanies: [
      { name: "Anesco", sector: "Renewables / Energy Transition", subsector: "Solar & Storage", region: "Europe", country: "United Kingdom", description: "UK solar, battery storage, and energy optimization company." },
      { name: "Centric Fiber", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "US fiber-to-the-home broadband provider." },
      { name: "CycleØ", sector: "Waste / Environmental Services", subsector: "Recycling", region: "Europe", country: "Norway", description: "Circular economy and industrial recycling platform." },
      { name: "Divert", sector: "Waste / Environmental Services", subsector: "Food Waste", region: "North America", country: "United States", description: "Food waste diversion and renewable energy company." },
      { name: "Fluitron", sector: "Renewables / Energy Transition", subsector: "Hydrogen Equipment", region: "North America", country: "United States", description: "Hydrogen compression and gas handling equipment manufacturer." },
      { name: "Lincoln Terminal", sector: "Midstream / Energy", subsector: "Tank Storage", region: "North America", country: "United States", description: "Bulk liquid storage terminal." },
      { name: "Natural World Products (NWP)", sector: "Waste / Environmental Services", subsector: "Biomaterials", region: "Europe", country: "United Kingdom", description: "Producer of sustainable peat-free growing media from recycled materials." },
      { name: "USD Clean Fuels", sector: "Renewables / Energy Transition", subsector: "Biofuels", region: "North America", country: "United States", description: "Clean fuels blending and distribution platform." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 32. ArcLight Capital
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-032a",
    managerName: "ArcLight Capital",
    fundName: "ArcLight Energy Partners Fund",
    ticker: null,
    description: "ArcLight Capital Partners is a leading energy infrastructure private equity firm investing across the full spectrum of power, renewables, midstream, and energy transition assets, primarily in North America.",
    size: "~$3 Billion (across funds)",
    sizeUsdMm: 3000,
    vintage: "Various",
    strategies: ["Value-Add", "Opportunistic"],
    structure: "Closed-End",
    sectors: ["Power Generation", "Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["North America"],
    portfolioCompanies: [
      { name: "Advanced Power", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Power plant developer and operator." },
      { name: "Alpha Generation (AlphaGen)", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Natural gas-fired power generation platform." },
      { name: "Eastern Generation", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Power generation company operating in the northeast US." },
      { name: "Elevate Renewables", sector: "Renewables / Energy Transition", subsector: "Wind & Solar", region: "North America", country: "United States", description: "Renewable energy development platform." },
      { name: "Generation Bridge", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Natural gas and renewable power platform." },
      { name: "Griffith Energy", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Natural gas power generation facility in Arizona." },
      { name: "Gulf Coast Express (GCX)", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "North America", country: "United States", description: "Natural gas pipeline from the Permian Basin to the Gulf Coast." },
      { name: "Infinigen Renewables", sector: "Renewables / Energy Transition", subsector: "Wind", region: "North America", country: "United States", description: "Wind energy generation company." },
      { name: "Kleen Energy Systems", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Combined cycle natural gas power plant in Connecticut." },
      { name: "Lordstown Energy Center", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Natural gas-fired power plant in Ohio." },
      { name: "Middletown Energy Center", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Combined cycle gas plant in Ohio." },
      { name: "Natural Gas Pipeline Company of America (NGPL)", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "North America", country: "United States", description: "Major interstate natural gas pipeline system." },
      { name: "Naugatuck Avenue Storage", sector: "Midstream / Energy", subsector: "Gas Storage", region: "North America", country: "United States", description: "Natural gas storage facility." },
      { name: "Parkway Generation", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Natural gas power generation platform." },
      { name: "REC Solar", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "Commercial solar developer and installer." },
      { name: "SkyVest Renewables", sector: "Renewables / Energy Transition", subsector: "Wind", region: "North America", country: "United States", description: "Wind energy generation company." },
      { name: "Swift Current Energy", sector: "Renewables / Energy Transition", subsector: "Solar & Storage", region: "North America", country: "United States", description: "Utility-scale solar and energy storage developer." },
      { name: "Takanock", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Power generation platform." },
      { name: "Thunderbird Renewables", sector: "Renewables / Energy Transition", subsector: "Wind", region: "North America", country: "United States", description: "Wind energy platform." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 33. Ardian
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-033a",
    managerName: "Ardian",
    fundName: "Ardian Infrastructure Fund",
    ticker: null,
    description: "Ardian is one of Europe's largest infrastructure investors, managing over €25 billion in infrastructure assets. The firm invests across core, core-plus, and value-add strategies in transportation, energy, utilities, and digital infrastructure across Europe and the Americas.",
    size: "€8+ Billion (Fund VI)",
    sizeUsdMm: 8700,
    vintage: "Various",
    strategies: ["Core", "Core-Plus", "Value-Add"],
    structure: "Closed-End",
    sectors: ["Transportation", "Renewables / Energy Transition", "Utilities", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe", "Latin America"],
    portfolioCompanies: [
      { name: "3NEW / 4NEW", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "France", description: "French fiber broadband network operator." },
      { name: "Adamo", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Spain", description: "Spanish fiber broadband provider." },
      { name: "AFCO", sector: "Transportation", subsector: "Aviation Services", region: "Europe", country: "France", description: "French airport and ground handling services." },
      { name: "Akuo", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Europe", country: "France", description: "French independent renewable energy producer." },
      { name: "Andberg Vind", sector: "Renewables / Energy Transition", subsector: "Wind", region: "Europe", country: "Norway", description: "Norwegian onshore wind energy company." },
      { name: "Ascendi", sector: "Transportation", subsector: "Toll Roads", region: "Europe", country: "Portugal", description: "Portuguese motorway operator." },
      { name: "ASTM", sector: "Transportation", subsector: "Toll Roads", region: "Europe", country: "Italy", description: "Italian motorway operator and infrastructure holding company." },
      { name: "Ataca and Pantac", sector: "Transportation", subsector: "Toll Roads", region: "Latin America", country: "Peru", description: "Peruvian toll road concessions." },
      { name: "Attero", sector: "Waste / Environmental Services", subsector: "Waste-to-Energy", region: "Europe", country: "Netherlands", description: "Dutch waste processing and energy recovery company." },
      { name: "CampusParc", sector: "Transportation", subsector: "Parking", region: "North America", country: "United States", description: "Ohio State University campus parking system." },
      { name: "CGE Palea Arsa", sector: "Utilities", subsector: "Water & Wastewater", region: "Europe", country: "Italy", description: "Italian water and wastewater services." },
      { name: "Clermont", sector: "Transportation", subsector: "Toll Roads", region: "Europe", country: "France", description: "French motorway concession." },
      { name: "Energia & Servizi", sector: "Utilities", subsector: "Energy Services", region: "Europe", country: "Italy", description: "Italian energy services company." },
      { name: "EWE", sector: "Utilities", subsector: "Multi-Utility", region: "Europe", country: "Germany", description: "German regional utility and energy company." },
      { name: "Géosel", sector: "Midstream / Energy", subsector: "Oil Storage", region: "Europe", country: "France", description: "French underground hydrocarbon storage facility operator." },
      { name: "GreenYellow", sector: "Renewables / Energy Transition", subsector: "Distributed Solar", region: "Global", country: "France", description: "Global distributed solar and energy efficiency company." },
      { name: "Hamnefjell Vinkraft", sector: "Renewables / Energy Transition", subsector: "Wind", region: "Europe", country: "Norway", description: "Norwegian wind farm." },
      { name: "Heathrow Airport", sector: "Transportation", subsector: "Airports", region: "Europe", country: "United Kingdom", description: "London's primary international airport, one of the world's busiest." },
      { name: "Honkajoki Wind Park", sector: "Renewables / Energy Transition", subsector: "Wind", region: "Europe", country: "Finland", description: "Finnish onshore wind farm." },
      { name: "ICQ Holding", sector: "Social Infrastructure", subsector: "Healthcare", region: "Europe", country: "France", description: "French medical imaging and diagnostics platform." },
      { name: "InEnergy Solar Italy", sector: "Renewables / Energy Transition", subsector: "Solar", region: "Europe", country: "Italy", description: "Italian solar energy platform." },
      { name: "INWIT", sector: "Communications", subsector: "Towers", region: "Europe", country: "Italy", description: "Italian telecommunications tower company." },
      { name: "LISEA", sector: "Transportation", subsector: "High-Speed Rail", region: "Europe", country: "France", description: "Tours-Bordeaux high-speed rail line concession." },
      { name: "Maple Leaf", sector: "Transportation", subsector: "Toll Roads", region: "North America", country: "Canada", description: "Canadian toll road infrastructure." },
      { name: "Míla", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Iceland", description: "Icelandic fiber and telecommunications infrastructure operator." },
      { name: "Milione SpA / Save SpA", sector: "Transportation", subsector: "Airports", region: "Europe", country: "Italy", description: "Venice Marco Polo Airport and other Italian airports operator." },
      { name: "MXT Holdings", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Europe", country: "France", description: "French data center platform." },
      { name: "Nevel", sector: "Utilities", subsector: "District Heating", region: "Europe", country: "Finland", description: "Finnish district heating and energy solutions company." },
      { name: "Novasol Invest La Isla", sector: "Renewables / Energy Transition", subsector: "Solar", region: "Europe", country: "Spain", description: "Spanish solar energy project." },
      { name: "Skyline Renewables", sector: "Renewables / Energy Transition", subsector: "Wind", region: "North America", country: "United States", description: "US wind energy platform." },
      { name: "SPMR", sector: "Transportation", subsector: "Rail", region: "Europe", country: "France", description: "French regional rail infrastructure." },
      { name: "Tacna and Panamericana", sector: "Transportation", subsector: "Toll Roads", region: "Latin America", country: "Peru", description: "Peruvian toll road concessions." },
      { name: "Tolve Windfarms Holding", sector: "Renewables / Energy Transition", subsector: "Wind", region: "Europe", country: "Italy", description: "Italian wind farm portfolio." },
      { name: "Unison", sector: "Communications", subsector: "Towers", region: "Asia-Pacific", country: "New Zealand", description: "New Zealand fiber and wireless infrastructure company." },
      { name: "UNITe", sector: "Transportation", subsector: "EV Charging", region: "Europe", country: "France", description: "French EV charging network." },
      { name: "Verlat Energy", sector: "Power Generation", subsector: "Gas-to-Power", region: "Europe", country: "Belgium", description: "Belgian energy company." },
      { name: "Verne", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Europe", country: "Iceland", description: "Icelandic data center powered by renewable energy." },
      { name: "Vespucio Norte Express & Túnel San Cristóbal", sector: "Transportation", subsector: "Toll Roads", region: "Latin America", country: "Chile", description: "Chilean urban motorway and tunnel concessions in Santiago." },
      { name: "Wintics", sector: "Transportation", subsector: "Smart Mobility", region: "Europe", country: "France", description: "French AI-powered video analytics for traffic and urban mobility." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 34. Ares Management
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-034a",
    managerName: "Ares Management",
    fundName: "Ares Infrastructure Opportunities Fund",
    ticker: null,
    description: "Ares Management's infrastructure platform invests in climate infrastructure and essential services, targeting renewable energy, digital infrastructure, and environmental services across North America.",
    size: "~$3 Billion (across infrastructure funds)",
    sizeUsdMm: 3000,
    vintage: "Various",
    strategies: ["Value-Add", "Growth"],
    structure: "Closed-End",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Waste / Environmental Services", "Transportation"],
    regions: ["North America", "Europe"],
    portfolioCompanies: [
      { name: "Apex Clean Energy", sector: "Renewables / Energy Transition", subsector: "Wind & Solar", region: "North America", country: "United States", description: "Major US renewable energy developer of wind, solar, and storage." },
      { name: "Atlas Crane Service", sector: "Transportation", subsector: "Equipment Services", region: "North America", country: "United States", description: "Crane and heavy equipment rental services." },
      { name: "Bluepeak", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "US fiber broadband provider focused on underserved markets." },
      { name: "Current Trucking", sector: "Transportation", subsector: "Logistics", region: "North America", country: "United States", description: "Trucking and logistics platform." },
      { name: "Distributed Solar Development (DSD)", sector: "Renewables / Energy Transition", subsector: "Community Solar", region: "North America", country: "United States", description: "Community solar developer owned by BlackRock/Ares." },
      { name: "Dynamic Renewables", sector: "Renewables / Energy Transition", subsector: "Biogas", region: "Europe", country: "United Kingdom", description: "UK anaerobic digestion and renewable energy company." },
      { name: "EDP Renováveis (EDPR) US Portfolio", sector: "Renewables / Energy Transition", subsector: "Wind & Solar", region: "North America", country: "United States", description: "Portfolio of US wind and solar assets from EDP Renováveis." },
      { name: "ENGIE US Renewables Portfolio", sector: "Renewables / Energy Transition", subsector: "Wind & Solar", region: "North America", country: "United States", description: "Portfolio of US renewable energy assets from ENGIE." },
      { name: "Meade Pipeline Co.", sector: "Midstream / Energy", subsector: "Gas Pipelines", region: "North America", country: "United States", description: "Natural gas pipeline in the Appalachian region." },
      { name: "Prime Data Centers", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "US data center development and operations platform." },
      { name: "Tango Holdings", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "North America", country: "United States", description: "Renewable energy holding company." },
      { name: "Underline", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "US fiber infrastructure and connectivity provider." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 35. Argo Infrastructure Partners
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-035a",
    managerName: "Argo Infrastructure Partners",
    fundName: "Argo Infrastructure Partners Fund",
    ticker: null,
    description: "Argo Infrastructure Partners is a US-focused infrastructure investment firm targeting essential services assets including power, water, transportation, and digital infrastructure.",
    size: "~$1.5 Billion",
    sizeUsdMm: 1500,
    vintage: "Various",
    strategies: ["Core-Plus", "Value-Add"],
    structure: "Closed-End",
    sectors: ["Utilities", "Power Generation", "Transportation", "Digital Infrastructure", "Water"],
    regions: ["North America"],
    portfolioCompanies: [
      { name: "Bayonne Water", sector: "Water", subsector: "Water & Wastewater", region: "North America", country: "United States", description: "Water utility concession in Bayonne, New Jersey." },
      { name: "Black Hills Colorado IPP", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Independent power production facility in Colorado." },
      { name: "Carville Energy Center", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Gas-fired power plant in Louisiana." },
      { name: "Corning Natural Gas", sector: "Utilities", subsector: "Gas Distribution", region: "North America", country: "United States", description: "Natural gas distribution utility in New York State." },
      { name: "Cross-Sound Cable", sector: "Utilities", subsector: "Interconnectors", region: "North America", country: "United States", description: "Submarine power cable connecting Connecticut and Long Island." },
      { name: "DQE Holdings (Duquesne Light Co)", sector: "Utilities", subsector: "Electricity Distribution", region: "North America", country: "United States", description: "Electric utility serving the Pittsburgh metropolitan area." },
      { name: "FleetLogix", sector: "Transportation", subsector: "Fleet Management", region: "North America", country: "United States", description: "Vehicle fleet management and leasing company." },
      { name: "Freight Ninja", sector: "Transportation", subsector: "Logistics", region: "North America", country: "United States", description: "Freight and logistics technology platform." },
      { name: "Hawaiʻi Gas", sector: "Utilities", subsector: "Gas Distribution", region: "North America", country: "United States", description: "Gas utility serving Hawaii." },
      { name: "Hudson Transmission Partners", sector: "Utilities", subsector: "Electricity Transmission", region: "North America", country: "United States", description: "Undersea power cable between New Jersey and Manhattan." },
      { name: "LAZ Parking", sector: "Transportation", subsector: "Parking", region: "North America", country: "United States", description: "One of the largest parking operators in the US." },
      { name: "Middletown Water", sector: "Water", subsector: "Water Supply", region: "North America", country: "United States", description: "Municipal water utility." },
      { name: "Oneta Energy Center", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Natural gas combined-cycle power plant in Oklahoma." },
      { name: "Onyx Renewable Partners", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "C&I and community solar platform." },
      { name: "Smoky Mountain Hydro", sector: "Renewables / Energy Transition", subsector: "Hydro", region: "North America", country: "United States", description: "Hydroelectric power facility." },
      { name: "TierPoint", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "Multi-cloud data center and IT services platform." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 36. Astatine Investment Partners
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-036a",
    managerName: "Astatine Investment Partners",
    fundName: "Astatine Infrastructure Fund",
    ticker: null,
    description: "Astatine Investment Partners targets lower middle-market infrastructure and infrastructure services businesses across North America and Europe, with a focus on critical supply chain, digital infrastructure, and environmental services.",
    size: "~$1 Billion",
    sizeUsdMm: 1000,
    vintage: "Various",
    strategies: ["Value-Add"],
    structure: "Closed-End",
    sectors: ["Transportation", "Digital Infrastructure", "Logistics", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
    portfolioCompanies: [
      { name: "ACL Airshop", sector: "Transportation", subsector: "Aviation Services", region: "Global", country: "United States", description: "Global air cargo ULD leasing and management company." },
      { name: "BTR (Big Truck Rental)", sector: "Transportation", subsector: "Truck Leasing", region: "North America", country: "United States", description: "Specialty truck rental and leasing company." },
      { name: "Everfast Fiber Networks", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "US fiber broadband infrastructure provider." },
      { name: "Glide Group", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "United Kingdom", description: "UK broadband and connectivity provider for multi-dwelling units." },
      { name: "Kelling Group", sector: "Transportation", subsector: "Logistics", region: "Europe", country: "United Kingdom", description: "UK logistics and supply chain services company." },
      { name: "McKeil Marine", sector: "Transportation", subsector: "Marine Services", region: "North America", country: "Canada", description: "Canadian marine transportation and tugboat services." },
      { name: "NRG Riverside", sector: "Waste / Environmental Services", subsector: "Waste-to-Energy", region: "Europe", country: "United Kingdom", description: "UK waste-to-energy and biomass operator." },
      { name: "PECO Pallet", sector: "Logistics", subsector: "Pallet Pooling", region: "North America", country: "United States", description: "Largest pallet rental company in the US." },
      { name: "Twin Parking Holdings", sector: "Transportation", subsector: "Parking", region: "North America", country: "United States", description: "Parking facility operator." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 37. Asterion Industrial Partners
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-037a",
    managerName: "Asterion Industrial Partners",
    fundName: "Asterion Industrial Infrastructure Fund",
    ticker: null,
    description: "Asterion is a Southern European infrastructure-focused private equity firm investing in large-scale industrial infrastructure including energy, telecoms, transportation, and environmental services, primarily in the Iberian Peninsula, Italy, and France.",
    size: "€2.6 Billion (Fund II)",
    sizeUsdMm: 2800,
    vintage: "Various",
    strategies: ["Value-Add"],
    structure: "Closed-End",
    sectors: ["Power Generation", "Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Utilities"],
    regions: ["Europe"],
    portfolioCompanies: [
      { name: "2i Aeroporti", sector: "Transportation", subsector: "Airports", region: "Europe", country: "Italy", description: "Italian airport holding company operating Bologna and Naples airports." },
      { name: "ABIO (Asterion Bioenergy)", sector: "Renewables / Energy Transition", subsector: "Biogas", region: "Europe", country: "Spain", description: "Spanish bioenergy platform." },
      { name: "AMP Clean Energy", sector: "Renewables / Energy Transition", subsector: "Biomass", region: "Europe", country: "United Kingdom", description: "UK clean energy company with biomass and heat networks." },
      { name: "Asterion Aircraft Leasing Platform (Bluelease)", sector: "Transportation", subsector: "Aircraft Leasing", region: "Europe", country: "Ireland", description: "Aircraft leasing platform." },
      { name: "Axion / Lineox", sector: "Utilities", subsector: "Gas Distribution", region: "Europe", country: "Spain", description: "Spanish industrial gas distribution company." },
      { name: "Clubö", sector: "Renewables / Energy Transition", subsector: "Heating & Cooling", region: "Europe", country: "France", description: "French heating and energy solutions platform." },
      { name: "Compagnie Electrique de Bretagne", sector: "Utilities", subsector: "Electricity Distribution", region: "Europe", country: "France", description: "French electricity distribution company." },
      { name: "Dunkerque LNG", sector: "Midstream / Energy", subsector: "LNG", region: "Europe", country: "France", description: "LNG import terminal in Dunkirk, France." },
      { name: "Energy Assets Group", sector: "Utilities", subsector: "Smart Metering", region: "Europe", country: "United Kingdom", description: "UK energy metering and data services company." },
      { name: "Grupo SSG", sector: "Waste / Environmental Services", subsector: "Waste Management", region: "Europe", country: "Spain", description: "Spanish environmental and waste management company." },
      { name: "MS3 Networks", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "United Kingdom", description: "UK fiber broadband provider in Yorkshire." },
      { name: "National Broadband Ireland (NBI)", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Ireland", description: "National broadband deployment for rural Ireland." },
      { name: "Olin Group / Olivenet", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Spain", description: "Spanish fiber telecommunications operator." },
      { name: "Retelit / Irideos", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Italy", description: "Italian fiber network and data center operator." },
      { name: "Revalue Energies", sector: "Renewables / Energy Transition", subsector: "Solar", region: "Europe", country: "Spain", description: "Spanish solar energy platform." },
      { name: "Samso", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "Europe", country: "Denmark", description: "Danish renewable energy island and platform." },
      { name: "STEAG", sector: "Power Generation", subsector: "Power Generation", region: "Europe", country: "Germany", description: "German power generation company transitioning to renewables." },
      { name: "Total Energies Greece Renewables JV", sector: "Renewables / Energy Transition", subsector: "Wind & Solar", region: "Europe", country: "Greece", description: "Greek renewables JV with TotalEnergies." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 38. Australian Super
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-038a",
    managerName: "Australian Super",
    fundName: "AustralianSuper Infrastructure Portfolio",
    ticker: null,
    description: "AustralianSuper is Australia's largest pension fund. Its infrastructure portfolio deploys proprietary pension capital directly into large-scale infrastructure assets globally, acting as a direct investor and co-investment partner.",
    size: ">$30 Billion (infrastructure allocation)",
    sizeUsdMm: 30000,
    vintage: "Evergreen",
    strategies: ["Core", "Core-Plus"],
    structure: "Open-End",
    sectors: ["Digital Infrastructure", "Transportation", "Utilities", "Renewables / Energy Transition", "Logistics"],
    regions: ["Asia-Pacific", "North America", "Europe"],
    portfolioCompanies: [
      { name: "Ausgrid", sector: "Utilities", subsector: "Electricity Distribution", region: "Asia-Pacific", country: "Australia", description: "Largest electricity distributor in Australia, serving Sydney." },
      { name: "Cirion Technologies", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Latin America", country: "United States", description: "Latin American data center and fiber platform." },
      { name: "DataBank", sector: "Digital Infrastructure", subsector: "Data Centers", region: "North America", country: "United States", description: "US enterprise data center platform." },
      { name: "Generate Capital", sector: "Renewables / Energy Transition", subsector: "Sustainable Infrastructure", region: "North America", country: "United States", description: "US sustainable infrastructure investment and operating platform." },
      { name: "Indara Digital Infrastructure", sector: "Digital Infrastructure", subsector: "Towers", region: "Asia-Pacific", country: "Australia", description: "Australian telecommunications tower company." },
      { name: "Moorebank Intermodal Precinct", sector: "Logistics", subsector: "Intermodal", region: "Asia-Pacific", country: "Australia", description: "Australia's largest intermodal logistics precinct in Sydney." },
      { name: "NSW Ports", sector: "Logistics", subsector: "Ports", region: "Asia-Pacific", country: "Australia", description: "Port operator for Port Botany and Port Kembla in New South Wales." },
      { name: "Peel Ports", sector: "Logistics", subsector: "Ports", region: "Europe", country: "United Kingdom", description: "UK port operator including Port of Liverpool." },
      { name: "Perth Airport", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "Australia", description: "Airport serving Perth, Western Australia." },
      { name: "Sydney Airport", sector: "Transportation", subsector: "Airports", region: "Asia-Pacific", country: "Australia", description: "Australia's busiest international airport." },
      { name: "Transurban Chesapeake", sector: "Transportation", subsector: "Toll Roads", region: "North America", country: "United States", description: "Toll roads in the Washington DC area." },
      { name: "Transurban Queensland", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "Australia", description: "Queensland toll road network." },
      { name: "Vantage Data Centers EMEA", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Europe", country: "United Kingdom", description: "European hyperscale data center platform." },
      { name: "WestConnex", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "Australia", description: "Major motorway network in Sydney." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 39. Axium Infrastructure
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-039a",
    managerName: "Axium Infrastructure",
    fundName: "Axium Infrastructure Fund",
    ticker: null,
    description: "Axium Infrastructure is a Canadian infrastructure investment manager focused on core and core-plus infrastructure assets in North America, with expertise in PPP/P3 projects, renewable energy, and essential services.",
    size: "~$8 Billion (AUM)",
    sizeUsdMm: 8000,
    vintage: "Various",
    strategies: ["Core", "Core-Plus"],
    structure: "Open-End",
    sectors: ["Renewables / Energy Transition", "Transportation", "Social Infrastructure", "Utilities", "Power Generation"],
    regions: ["North America"],
    portfolioCompanies: [
      { name: "407 ETR (Blue Jay Road Limited)", sector: "Transportation", subsector: "Toll Roads", region: "North America", country: "Canada", description: "Stake in the 407 Express Toll Route in Ontario." },
      { name: "AgeCare UK / Optima Living JV", sector: "Social Infrastructure", subsector: "Senior Living", region: "North America", country: "Canada", description: "Senior care and retirement living platform." },
      { name: "Axium Great Plains Wind LLC", sector: "Renewables / Energy Transition", subsector: "Wind", region: "North America", country: "United States", description: "Wind energy project in the Great Plains region." },
      { name: "BlueWave", sector: "Renewables / Energy Transition", subsector: "Community Solar", region: "North America", country: "United States", description: "US community solar developer." },
      { name: "Brooklyn Navy Yard Cogeneration", sector: "Power Generation", subsector: "Cogeneration", region: "North America", country: "United States", description: "Combined heat and power facility in Brooklyn." },
      { name: "Cascade Power Project", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "Canada", description: "Natural gas power plant in Alberta." },
      { name: "Cedar Point II Wind Project", sector: "Renewables / Energy Transition", subsector: "Wind", region: "North America", country: "Canada", description: "Ontario wind energy project." },
      { name: "CHUM Research Centre PPP", sector: "Social Infrastructure", subsector: "Healthcare PPP", region: "North America", country: "Canada", description: "PPP hospital research center in Montreal." },
      { name: "Constellation Renewables Partners", sector: "Renewables / Energy Transition", subsector: "Renewables Platform", region: "North America", country: "United States", description: "Renewable energy partnership platform." },
      { name: "Copper Crossing Solar Facility", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "United States", description: "Utility-scale solar facility in Arizona." },
      { name: "CPV Three Rivers", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "Natural gas combined-cycle power plant." },
      { name: "Crimson Storage", sector: "Renewables / Energy Transition", subsector: "Battery Storage", region: "North America", country: "United States", description: "Utility-scale battery storage in California." },
      { name: "Dry Lake II Wind Farm", sector: "Renewables / Energy Transition", subsector: "Wind", region: "North America", country: "United States", description: "Wind farm in Arizona." },
      { name: "Edwards Sanborn 1A & 1B", sector: "Renewables / Energy Transition", subsector: "Solar & Storage", region: "North America", country: "United States", description: "Solar and battery storage project in California." },
      { name: "Georgetown University Utility System", sector: "Utilities", subsector: "District Energy", region: "North America", country: "United States", description: "Campus energy utility for Georgetown University." },
      { name: "Grand Valley III Wind Farm", sector: "Renewables / Energy Transition", subsector: "Wind", region: "North America", country: "Canada", description: "Ontario wind energy project." },
      { name: "K2 Wind", sector: "Renewables / Energy Transition", subsector: "Wind", region: "North America", country: "Canada", description: "270 MW wind farm in Ontario." },
      { name: "Northwest Parkway", sector: "Transportation", subsector: "Toll Roads", region: "North America", country: "United States", description: "Toll road in the Denver metropolitan area." },
      { name: "Port Dover and Nanticoke Wind Project", sector: "Renewables / Energy Transition", subsector: "Wind", region: "North America", country: "Canada", description: "Ontario wind energy project." },
      { name: "PUC Transmission LP", sector: "Utilities", subsector: "Electricity Transmission", region: "North America", country: "Canada", description: "Electricity transmission in northern Ontario." },
      { name: "Quality Wind Project", sector: "Renewables / Energy Transition", subsector: "Wind", region: "North America", country: "Canada", description: "Wind farm in British Columbia." },
      { name: "The Ohio State University Utility System", sector: "Utilities", subsector: "District Energy", region: "North America", country: "United States", description: "Campus energy P3 concession for Ohio State University." },
      { name: "Travers Solar", sector: "Renewables / Energy Transition", subsector: "Solar", region: "North America", country: "Canada", description: "465 MW solar project in Alberta, one of Canada's largest." },
      { name: "UMass Amherst Housing PPP", sector: "Social Infrastructure", subsector: "Student Housing", region: "North America", country: "United States", description: "P3 student housing at University of Massachusetts Amherst." },
      { name: "Upper Peninsula Power Company (UPPCO)", sector: "Utilities", subsector: "Electricity Distribution", region: "North America", country: "United States", description: "Electric utility in Michigan's Upper Peninsula." },
      { name: "Vanderbilt Student Housing PPP", sector: "Social Infrastructure", subsector: "Student Housing", region: "North America", country: "United States", description: "P3 student housing at Vanderbilt University." },
      { name: "Vents du Kempt Wind", sector: "Renewables / Energy Transition", subsector: "Wind", region: "North America", country: "Canada", description: "Wind farm in Quebec." },
      { name: "Wind Energy Transmission Texas (WETT)", sector: "Utilities", subsector: "Electricity Transmission", region: "North America", country: "United States", description: "Transmission line connecting wind resources in West Texas." },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 40. Basalt Infrastructure Partners
  // ═══════════════════════════════════════════════════════════
  {
    id: "FUND-040a",
    managerName: "Basalt Infrastructure Partners",
    fundName: "Basalt Infrastructure Partners Fund",
    ticker: null,
    description: "Basalt Infrastructure Partners is a middle-market infrastructure investor targeting essential services, digital, environmental, and transportation assets across North America, Europe, and Australasia.",
    size: "~$3 Billion (across funds)",
    sizeUsdMm: 3000,
    vintage: "Various",
    strategies: ["Core-Plus", "Value-Add"],
    structure: "Closed-End",
    sectors: ["Digital Infrastructure", "Transportation", "Waste / Environmental Services", "Renewables / Energy Transition", "Utilities"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    portfolioCompanies: [
      { name: "Altnet Partners / FullFibre (Zzoomm)", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "United Kingdom", description: "UK fiber broadband provider." },
      { name: "Caronte & Tourist", sector: "Transportation", subsector: "Ferries", region: "Europe", country: "Italy", description: "Italian ferry operator connecting Sicily and mainland Italy." },
      { name: "Chemco Ireland", sector: "Waste / Environmental Services", subsector: "Hazardous Waste", region: "Europe", country: "Ireland", description: "Irish hazardous waste and environmental services company." },
      { name: "Circle Infra Partners", sector: "Transportation", subsector: "Toll Roads", region: "Asia-Pacific", country: "India", description: "Indian toll road infrastructure platform." },
      { name: "Connect Fibre (bn:t and SOCO)", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Germany", description: "German fiber broadband network operator." },
      { name: "EnviroSpark", sector: "Transportation", subsector: "EV Charging", region: "North America", country: "United States", description: "US EV charging infrastructure installer and operator." },
      { name: "Fatbeam", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "North America", country: "United States", description: "US fiber connectivity provider for enterprise and government." },
      { name: "Fortbrand Services", sector: "Transportation", subsector: "Airport Ground Services", region: "North America", country: "United States", description: "Airport ground handling and snow removal services." },
      { name: "Freyja LNG", sector: "Midstream / Energy", subsector: "LNG", region: "Europe", country: "Norway", description: "Norwegian LNG distribution company." },
      { name: "Go Lime (Simply Green)", sector: "Renewables / Energy Transition", subsector: "Green Fuels", region: "North America", country: "Canada", description: "Canadian clean fuel and lime production company." },
      { name: "Goetel", sector: "Digital Infrastructure", subsector: "Fiber Networks", region: "Europe", country: "Germany", description: "German regional fiber and telecommunications provider." },
      { name: "Habitat Solar", sector: "Renewables / Energy Transition", subsector: "Solar", region: "Europe", country: "Spain", description: "Spanish solar energy developer." },
      { name: "Helios Power", sector: "Power Generation", subsector: "Gas-to-Power", region: "North America", country: "United States", description: "US power generation company." },
      { name: "Iris", sector: "Utilities", subsector: "Water & Wastewater", region: "Europe", country: "France", description: "French water services company." },
      { name: "JR Richards & Sons", sector: "Waste / Environmental Services", subsector: "Waste Collection", region: "Asia-Pacific", country: "Australia", description: "Australian waste management and recycling company." },
      { name: "Manx Telecom", sector: "Communications", subsector: "Telecoms", region: "Europe", country: "Isle of Man", description: "Isle of Man telecommunications provider." },
      { name: "Nobina", sector: "Transportation", subsector: "Bus Services", region: "Europe", country: "Sweden", description: "Largest public bus operator in the Nordics." },
      { name: "OnSite Partners", sector: "Digital Infrastructure", subsector: "Data Centers", region: "Europe", country: "Netherlands", description: "European colocation data center platform." },
      { name: "Reconor", sector: "Waste / Environmental Services", subsector: "Waste Management", region: "Europe", country: "Denmark", description: "Danish waste management and recycling company." },
      { name: "Skyway Towers", sector: "Communications", subsector: "Towers", region: "North America", country: "United States", description: "US wireless tower infrastructure company." },
      { name: "Unilode Aviation Solutions", sector: "Transportation", subsector: "Aviation Services", region: "Global", country: "Switzerland", description: "Global aviation ULD management and repair services." },
      { name: "Vanadis LNG", sector: "Midstream / Energy", subsector: "LNG", region: "Europe", country: "Sweden", description: "Swedish small-scale LNG distribution." },
      { name: "Wightlink", sector: "Transportation", subsector: "Ferries", region: "Europe", country: "United Kingdom", description: "Ferry operator serving the Isle of Wight." },
      { name: "Xpress Natural Gas (XNG)", sector: "Midstream / Energy", subsector: "CNG/LNG Distribution", region: "North America", country: "United States", description: "Virtual natural gas pipeline provider." },
    ],
  },
];
