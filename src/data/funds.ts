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
  | "Co-Investments"
  | "Greenfield"
  | "Retail Act '40";

export type FundStatus = "Evergreen" | "Deploying" | "Raising";

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
  | "Evergreen"
  | "Listed / Evergreen"
  | "Listed / Closed-End";

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
  coInvestors?: string[];
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
  status: FundStatus;
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
  "Retail Act '40",
];

export const FUND_STATUSES: FundStatus[] = [
  "Evergreen",
  "Deploying",
  "Raising",
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
  "Listed / Evergreen",
  "Listed / Closed-End",
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
  "Greenfield": "#22c55e",
  "Retail Act '40": "#ef4444",
};

const STATUS_COLORS: Record<FundStatus, string> = {
  "Evergreen": "#10b981",
  "Deploying": "#3b82f6",
  "Raising": "#f59e0b",
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
  "Listed / Evergreen": "#0ea5e9",
  "Listed / Closed-End": "#6366f1",
};

export function getStrategyColor(strategy: FundStrategy): string {
  return STRATEGY_COLORS[strategy] ?? "#a1a1aa";
}

export function getStatusColor(status: FundStatus): string {
  return STATUS_COLORS[status] ?? "#a1a1aa";
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

// ─── Helper to create fund entries ──────────────────────────

import { PORTFOLIO_DATA } from "./portfolios";

function f(
  id: string,
  managerName: string,
  fundName: string,
  vintage: string,
  size: string,
  sizeUsdMm: number | null,
  strategy: FundStrategy,
  status: FundStatus,
  overrides?: Partial<Pick<Fund, "description" | "sectors" | "regions" | "strategies" | "structure" | "ticker">>,
): Fund {
  return {
    id,
    managerName,
    fundName,
    ticker: overrides?.ticker ?? null,
    description: overrides?.description ?? "",
    size,
    sizeUsdMm,
    vintage,
    strategies: overrides?.strategies ?? [strategy],
    structure: overrides?.structure ?? (status === "Evergreen" ? "Evergreen" as FundStructure : "Closed-End" as FundStructure),
    status,
    sectors: overrides?.sectors ?? [],
    regions: overrides?.regions ?? [],
    portfolioCompanies: PORTFOLIO_DATA[id] ?? [],
  };
}

// ─── Fund Data ───────────────────────────────────────────────

export const funds: Fund[] = [
  // 3i Group
  f("FUND-001", "3i Group", "3i Infrastructure plc", "2007", "£3.8B", 4940, "Core-Plus", "Evergreen", {
    description: "London-listed core-plus infrastructure company investing in mid-market economic infrastructure businesses across Europe, with a focused portfolio spanning digital, transport, utilities, and energy transition assets.",
    sectors: ["Digital Infrastructure", "Transportation", "Utilities", "Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Europe", "North America", "Asia-Pacific"],
    structure: "Listed / Evergreen",
    ticker: "3IN.L",
  }),
  f("FUND-002", "3i Group", "3i North American Infrastructure Fund", "2022", "$739M", 739, "Core-Plus", "Deploying", {
    description: "Inaugural North American fund targeting mid-market core-plus infrastructure opportunities across digital, transport, environmental services, and communications in the US and Canada.",
    sectors: ["Digital Infrastructure", "Transportation", "Waste / Environmental Services", "Communications"],
    regions: ["North America"],
  }),

  // Acadia Infrastructure Capital
  f("FUND-003", "Acadia Infrastructure Capital", "Acadia Infrastructure Capital LP", "2023", "$107M+", 107, "Value-Add", "Deploying", {
    description: "Emerging manager focused on climate-aligned infrastructure investments in underserved US communities, targeting clean energy and environmental resilience projects.",
    sectors: ["Renewables / Energy Transition", "Utilities", "Social Infrastructure"],
    regions: ["North America"],
  }),
  f("FUND-004", "Acadia Infrastructure Capital", "Climate and Communities Investment Coalition", "2024", "$9.0B", 9000, "Core-Plus", "Deploying", {
    description: "Large-scale coalition mobilizing capital for climate infrastructure in disadvantaged communities, investing across clean energy, transportation, and water infrastructure.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Water", "Social Infrastructure"],
    regions: ["North America"],
  }),

  // Actis
  f("FUND-005", "Actis", "Actis Energy 6", "2025", "$6.0B", 6000, "Value-Add", "Deploying", {
    description: "Flagship energy fund investing in power generation, renewable energy, and energy transition assets across high-growth emerging markets in Africa, Asia, and Latin America.",
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["Asia-Pacific", "Latin America", "Middle East & Africa"],
  }),
  f("FUND-006", "Actis", "Actis Long Life Infrastructure Fund 2 (ALLIF2)", "2025", "$1.7B", 1700, "Core-Plus", "Deploying", {
    description: "Core-plus fund targeting long-life, contracted infrastructure assets in emerging markets, focusing on energy, utilities, and digital infrastructure with predictable cash flows.",
    sectors: ["Utilities", "Digital Infrastructure", "Power Generation"],
    regions: ["Asia-Pacific", "Latin America", "Middle East & Africa"],
  }),
  f("FUND-007", "Actis", "Actis Asia Climate Transition Fund", "2024", "$560M", 560, "Value-Add", "Deploying", {
    description: "SFDR Article 9 climate transition fund investing in renewable energy infrastructure, energy solutions, and sustainable transportation across Asia-Pacific emerging markets.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Power Generation"],
    regions: ["Asia-Pacific"],
  }),

  // Allianz Global Investors
  f("FUND-008", "Allianz Global Investors", "Allianz European Infrastructure Fund II (AEIF II)", "2021", "€880M+", 968, "Core", "Deploying", {
    description: "Core infrastructure fund targeting brownfield essential services assets in Europe, including transportation, digital infrastructure, utilities, and renewables with regulated or contracted revenues.",
    sectors: ["Transportation", "Digital Infrastructure", "Utilities", "Renewables / Energy Transition"],
    regions: ["Europe"],
  }),

  // Amber Infrastructure
  f("FUND-009", "Amber Infrastructure", "International Public Partnerships (INPP)", "2006", "£3.0B+", 3900, "Core", "Evergreen", {
    description: "FTSE 250-listed infrastructure investment company targeting availability-based and regulated public infrastructure assets globally, including schools, hospitals, transport, and utility networks.",
    sectors: ["Social Infrastructure", "Transportation", "Utilities", "Digital Infrastructure"],
    regions: ["Europe", "North America", "Asia-Pacific"],
    structure: "Listed / Evergreen",
    ticker: "INPP.L",
  }),
  f("FUND-010", "Amber Infrastructure", "US Solar Fund plc (USF)", "2019", "~$250M", 250, "Core", "Evergreen", {
    description: "London-listed closed-end investment company investing in a diversified portfolio of operational solar power assets in the United States with long-term power purchase agreements.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America"],
    structure: "Listed / Evergreen",
    ticker: "USF.L",
  }),
  f("FUND-011", "Amber Infrastructure", "Amber & Partners Infrastructure New Zealand Fund", "2025", "Undisclosed", null, "Core-Plus", "Evergreen", {
    description: "Open-end fund investing in social infrastructure PPP assets in New Zealand, including schools, student accommodation, and correctional facilities.",
    sectors: ["Social Infrastructure"],
    regions: ["Asia-Pacific"],
    structure: "Open-End",
  }),
  f("FUND-012", "Amber Infrastructure", "The Green New Deal Fund (GNDF)", "2021", "£18M", 23, "Value-Add", "Deploying", {
    description: "Impact-focused fund catalyzing green infrastructure investment in Northeast England, funding community energy schemes, EV charging, building retrofits, and small-scale renewables.",
    sectors: ["Renewables / Energy Transition", "Transportation"],
    regions: ["Europe"],
    structure: "Closed-End",
  }),
  f("FUND-013", "Amber Infrastructure", "Three Seas Initiative Investment Fund (3SIIF)", "2019", "€1.0B+", 1100, "Core-Plus", "Deploying", {
    description: "Geopolitically-driven infrastructure fund investing in energy, transportation, and digital infrastructure connecting Central and Eastern European countries between the Baltic, Adriatic, and Black Seas.",
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Europe"],
  }),

  // Ancala Partners
  f("FUND-014", "Ancala Partners", "Ancala Infrastructure Fund III", "2022", "€1.4B", 1540, "Core-Plus", "Deploying", {
    description: "Mid-market core-plus infrastructure fund investing in essential infrastructure businesses across the UK and Europe, including renewable energy, transport, utilities, water, and the circular economy.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities", "Water", "Waste / Environmental Services"],
    regions: ["Europe"],
  }),

  // Antin Infrastructure Partners
  f("FUND-015", "Antin Infrastructure Partners", "Flagship Fund V", "2022", "€10.2B", 11220, "Value-Add", "Deploying", {
    description: "Antin's largest flagship fund targeting controlling equity investments in established infrastructure businesses across energy & environment, digital, transport, and social infrastructure in Europe and North America.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Social Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-016", "Antin Infrastructure Partners", "Mid Cap Fund I", "2021", "€2.2B", 2420, "Value-Add", "Deploying", {
    description: "Antin's inaugural mid-cap strategy targeting smaller infrastructure opportunities across energy & environment, digital, transport, and social sectors in Europe and North America.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Social Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-017", "Antin Infrastructure Partners", "NextGen Fund I", "2021", "€1.2B", 1320, "Value-Add", "Deploying", {
    description: "Growth-oriented fund targeting next-generation digital and energy transition infrastructure, including fiber, data centers, EV charging, and distributed energy in Europe.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Communications"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Growth"],
  }),

  // Apollo Global Management
  f("FUND-018", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund III", "2022", "$2.4B", 2400, "Value-Add", "Deploying", {
    description: "Mid-market value-add infrastructure fund making control-oriented equity investments in communications, power & renewables, transportation, and corporate carveouts in the US and Europe.",
    sectors: ["Communications", "Power Generation", "Renewables / Energy Transition", "Transportation", "Digital Infrastructure"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-019", "Apollo Global Management", "Apollo Core Infrastructure Fund", "2022", "Undisclosed", null, "Core", "Deploying", {
    description: "Core infrastructure fund targeting essential assets with contracted or regulated revenue streams in utilities, renewables, and digital infrastructure across developed markets.",
    sectors: ["Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["North America", "Europe"],
    structure: "Open-End",
  }),
  f("FUND-020", "Apollo Global Management", "Apollo Infrastructure Company LLC (AIC)", "2023", "~$1.7B", 1700, "Core-Plus", "Evergreen", {
    description: "Perpetual-life operating company investing in energy transition, communications and digital infrastructure, and transportation & logistics assets globally.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Communications", "Transportation", "Logistics"],
    regions: ["North America", "Europe"],
    structure: "Permanent Capital",
  }),
  f("FUND-021", "Apollo Global Management", "Apollo Clean Transition Equity Partners II", "2023", "$411M+", 411, "Value-Add", "Deploying", {
    description: "Climate-focused fund investing in clean energy equity and infrastructure assets supporting the energy transition, including solar, wind, storage, and grid modernization.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-022", "Apollo Global Management", "Apollo Clean Transition Equity ELTIF", "2023", "Undisclosed", null, "Value-Add", "Evergreen", {
    description: "European Long-Term Investment Fund providing retail and institutional investors access to clean energy transition infrastructure across Europe.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe"],
  }),

  // Ara Partners
  f("FUND-023", "Ara Partners", "Ara Infrastructure Fund I", "2022", "$800M", 800, "Value-Add", "Deploying", {
    description: "Industrial decarbonization fund investing in companies and projects that reduce carbon emissions across energy-intensive sectors including chemicals, building materials, and industrial processes.",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services", "Power Generation"],
    regions: ["North America"],
  }),
  f("FUND-024", "Ara Partners", "Ara Energy Decarbonization Fund I", "2024", "$1.5B", 1500, "Value-Add", "Deploying", {
    description: "Successor fund scaling industrial decarbonization investments in hard-to-abate sectors, targeting energy efficiency, circular economy, and low-carbon manufacturing infrastructure.",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services", "Power Generation"],
    regions: ["North America"],
  }),

  // ArcLight Capital
  f("FUND-025", "ArcLight Capital", "ArcLight Infrastructure Partners Fund VIII", "2023", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "Value-add energy infrastructure fund investing in North American power generation, midstream, and renewable energy assets with operational improvement opportunities.",
    sectors: ["Power Generation", "Midstream / Energy", "Renewables / Energy Transition"],
    regions: ["North America"],
  }),
  f("FUND-026", "ArcLight Capital", "ArcLight Power Infrastructure Partners", "2024", "$250M", 250, "Value-Add", "Deploying", {
    description: "Focused power infrastructure fund investing in small-to-mid-scale generation assets including natural gas, battery storage, and distributed energy resources in North America.",
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["North America"],
  }),

  // Ardian
  f("FUND-027", "Ardian", "Ardian Infrastructure Fund VI", "2023", "€11.5B", 12650, "Core-Plus", "Deploying", {
    description: "Flagship core-plus infrastructure fund targeting essential mid-market assets in energy, transport, telecom, and social infrastructure across Europe and the Americas.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Communications", "Social Infrastructure", "Utilities"],
    regions: ["Europe", "North America", "Latin America"],
  }),
  f("FUND-028", "Ardian", "Ardian Americas Infrastructure Fund V", "2022", "$2.1B", 2100, "Core-Plus", "Deploying", {
    description: "Americas-focused infrastructure fund investing in mid-market essential services including energy, transportation, and digital infrastructure in North and Latin America.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Digital Infrastructure", "Utilities"],
    regions: ["North America", "Latin America"],
  }),
  f("FUND-029", "Ardian", "Ardian Clean Energy Evergreen Fund (ACEEF)", "2022", "€1.0B", 1100, "Core-Plus", "Evergreen", {
    description: "Open-end evergreen fund investing in operational renewable energy assets across Europe, targeting onshore wind, solar PV, and battery storage with long-term contracted revenues.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Open-End",
  }),

  // Ares Management
  f("FUND-030", "Ares Management", "Ares Climate Infrastructure Partners II", "2023", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "Climate infrastructure fund investing in renewable energy, energy efficiency, electrification, and decarbonization assets across North America and Europe.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-031", "Ares Management", "Ares Japan DC Partners I (JDC I)", "2025", "$2.4B", 2400, "Value-Add", "Deploying", {
    description: "Dedicated data center fund investing in the development and operation of hyperscale and enterprise data center campuses across Japan.",
    sectors: ["Digital Infrastructure"],
    regions: ["Asia-Pacific"],
    strategies: ["Value-Add", "Greenfield"],
  }),
  f("FUND-032", "Ares Management", "Ares Core Infrastructure Fund (ACI)", "2024", "$3.9B", 3900, "Core", "Evergreen", {
    description: "Open-end core infrastructure fund targeting essential assets with stable, contracted cash flows across transportation, utilities, and digital infrastructure globally.",
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    structure: "Open-End",
  }),

  // Argo Infrastructure Partners
  f("FUND-033", "Argo Infrastructure Partners", "Argo Infrastructure Partners Series 4", "2024", "Undisclosed", null, "Core", "Deploying", {
    description: "Core infrastructure fund targeting contracted and regulated essential services assets in North America, focusing on utilities, water, and transportation.",
    sectors: ["Utilities", "Water", "Transportation"],
    regions: ["North America"],
  }),

  // Astatine Investment Partners
  f("FUND-034", "Astatine Investment Partners", "Astatine Infrastructure Fund IV", "2020", "$586M", 586, "Core-Plus", "Deploying", {
    description: "Mid-market infrastructure fund investing in essential services businesses across North America and Europe, with a focus on energy, environmental services, and transportation.",
    sectors: ["Utilities", "Waste / Environmental Services", "Transportation"],
    regions: ["North America", "Europe"],
  }),

  // Asterion Industrial Partners
  f("FUND-035", "Asterion Industrial Partners", "Asterion Industrial Infra Fund III", "2024", "€3.4B", 3740, "Value-Add", "Deploying", {
    description: "Southern European-focused fund investing in industrial infrastructure including telecoms towers, fiber networks, energy, and environmental services with operational transformation.",
    sectors: ["Communications", "Digital Infrastructure", "Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Europe"],
  }),

  // Axium Infrastructure
  f("FUND-036", "Axium Infrastructure", "Axium Infrastructure Canada II L.P.", "2012", "C$1.14B+", 844, "Core", "Evergreen", {
    description: "Core infrastructure fund investing in contracted and regulated Canadian infrastructure assets including PPP projects, renewable energy, and social infrastructure.",
    sectors: ["Social Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America"],
    structure: "Open-End",
  }),
  f("FUND-037", "Axium Infrastructure", "AxInfra US L.P.", "2013", "$3.53B", 3530, "Core", "Evergreen", {
    description: "Open-end core infrastructure fund investing in contracted US infrastructure assets including solar, wind, social infrastructure, and water/wastewater facilities.",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure", "Water"],
    regions: ["North America"],
    structure: "Open-End",
  }),
  f("FUND-038", "Axium Infrastructure", "AxInfra US II L.P.", "2020", "$1.11B", 1110, "Core", "Evergreen", {
    description: "Continuation of Axium's US core infrastructure strategy, investing in contracted renewable energy and social infrastructure projects with long-term predictable cash flows.",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["North America"],
    structure: "Open-End",
  }),
  f("FUND-039", "Axium Infrastructure", "AxInfra US III L.P.", "2021", "$1.78B", 1780, "Core", "Evergreen", {
    description: "Third US-focused open-end fund targeting core infrastructure assets with availability-based or contracted revenues in renewables and essential public services.",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure", "Water"],
    regions: ["North America"],
    structure: "Open-End",
  }),
  f("FUND-040", "Axium Infrastructure", "Axium Infrastructure NA IV L.P.", "2023", "$1.35B", 1350, "Core", "Evergreen", {
    description: "North American open-end core infrastructure fund investing in contracted renewable energy, social infrastructure, and essential services with inflation-linked revenues.",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure", "Utilities"],
    regions: ["North America"],
    structure: "Open-End",
  }),
  f("FUND-041", "Axium Infrastructure", "Axium European Infrastructure Fund", "2022", "Undisclosed", null, "Core", "Evergreen", {
    description: "First European vehicle extending Axium's core infrastructure approach to contracted and regulated assets across Western Europe, targeting renewables and social infrastructure.",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["Europe"],
    structure: "Open-End",
  }),

  // Basalt Infrastructure Partners
  f("FUND-042", "Basalt Infrastructure Partners", "Basalt Infrastructure Partners IV", "2023", "$4.0B", 4000, "Value-Add", "Deploying", {
    description: "Mid-market value-add fund targeting essential infrastructure businesses in OECD countries across transportation, utilities, energy, and digital sectors with active management.",
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["North America", "Europe", "Asia-Pacific"],
  }),
  f("FUND-043", "Basalt Infrastructure Partners", "Basalt Infrastructure Partners V", "2025", "Undisclosed", null, "Value-Add", "Raising", {
    description: "Successor fund continuing Basalt's mid-market strategy investing in essential infrastructure businesses across transportation, utilities, and energy in developed markets.",
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["North America", "Europe", "Asia-Pacific"],
  }),

  // Bernhard Capital Partners
  f("FUND-044", "Bernhard Capital Partners", "BCP Fund III", "2022", "$1.5B", 1500, "Value-Add", "Deploying", {
    description: "Services-focused infrastructure fund investing in essential infrastructure services companies across utilities, power, and industrial end-markets in North America.",
    sectors: ["Utilities", "Power Generation", "Waste / Environmental Services"],
    regions: ["North America"],
  }),
  f("FUND-045", "Bernhard Capital Partners", "BCP Infrastructure Fund II", "2024", "Undisclosed", null, "Core-Plus", "Deploying", {
    description: "Core-plus fund targeting essential infrastructure assets and services companies in the utility, power, and environmental services sectors across North America.",
    sectors: ["Utilities", "Power Generation", "Waste / Environmental Services"],
    regions: ["North America"],
  }),

  // BlackRock
  f("FUND-046", "BlackRock", "BlackRock Global Infrastructure Fund IV", "2022", "$6.1B", 6100, "Core-Plus", "Deploying", {
    description: "Global diversified infrastructure fund investing in transportation, energy, utilities, and digital infrastructure across developed and select emerging markets.",
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Global"],
  }),
  f("FUND-047", "BlackRock", "BlackRock Global Renewable Power Fund IV (GRP IV)", "2023", "$7.0B", 7000, "Core-Plus", "Deploying", {
    description: "Dedicated renewable power fund investing in onshore and offshore wind, solar PV, battery storage, and green hydrogen projects globally.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    strategies: ["Core-Plus", "Greenfield"],
  }),
  f("FUND-048", "BlackRock", "BlackRock Evergreen Infra Partners Fund", "2022", "$1.0B+", 1000, "Core", "Evergreen", {
    description: "Open-end evergreen vehicle providing perpetual capital for core infrastructure investments in essential assets with stable, long-duration contracted cash flows.",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
  }),

  // BlackRock (GIP)
  f("FUND-049", "BlackRock (GIP)", "Global Infrastructure Partners V (GIP V)", "2022", "$25.2B", 25200, "Core-Plus", "Deploying", {
    description: "Flagship large-cap infrastructure fund investing in transportation, energy, digital infrastructure, and water/waste across global markets with operational value creation.",
    sectors: ["Transportation", "Power Generation", "Digital Infrastructure", "Water", "Midstream / Energy"],
    regions: ["Global"],
  }),
  f("FUND-050", "BlackRock (GIP)", "GIP Mid-Market Fund V", "2025", "$7.0B", 7000, "Value-Add", "Deploying", {
    description: "Mid-market infrastructure fund targeting smaller essential infrastructure assets across energy, transport, and digital sectors globally with hands-on operational improvement.",
    sectors: ["Transportation", "Power Generation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
  }),
  f("FUND-051", "BlackRock (GIP)", "GIP Emerging Markets Fund II", "2025", "$5.0B", 5000, "Value-Add", "Raising", {
    description: "Emerging markets infrastructure fund investing in energy, transportation, and digital assets in high-growth developing economies across Asia, Latin America, and the Middle East.",
    sectors: ["Power Generation", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Asia-Pacific", "Latin America", "Middle East & Africa"],
  }),
  f("FUND-052", "BlackRock (GIP)", "GIP Australia Fund II", "2024", "A$4.0B", 2640, "Core-Plus", "Deploying", {
    description: "Australia-focused infrastructure fund targeting essential assets in transportation, energy, and digital infrastructure with long-term contracted or regulated revenue streams.",
    sectors: ["Transportation", "Power Generation", "Digital Infrastructure"],
    regions: ["Asia-Pacific"],
  }),
  f("FUND-053", "BlackRock (GIP)", "Global Infrastructure Partners Core Fund", "2022", "$5.0B", 5000, "Core", "Evergreen", {
    description: "Open-end core fund targeting essential infrastructure assets with regulated or contracted revenues providing stable, inflation-linked returns across global developed markets.",
    sectors: ["Transportation", "Utilities", "Power Generation", "Digital Infrastructure"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-054", "BlackRock (GIP)", "AI Infrastructure Partnership (AIP)", "2024", "$30.0B", 30000, "Value-Add", "Deploying", {
    description: "Mega-scale partnership developing AI-enabling data center and power infrastructure globally, co-investing with leading technology companies to build next-generation compute capacity.",
    sectors: ["Digital Infrastructure", "Power Generation"],
    regions: ["Global"],
    strategies: ["Value-Add", "Greenfield"],
  }),

  // Blackstone
  f("FUND-055", "Blackstone", "Blackstone Infrastructure Partners (BIP)", "2017", "~$51.0B", 51000, "Core-Plus", "Evergreen", {
    description: "Permanent capital platform investing in large-scale core-plus infrastructure assets across energy, transportation, digital, and water/waste sectors globally.",
    sectors: ["Power Generation", "Transportation", "Digital Infrastructure", "Water", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),
  f("FUND-056", "Blackstone", "Blackstone Energy Transition Partners V", "2025", "Undisclosed", null, "Value-Add", "Raising", {
    description: "Latest vintage of Blackstone's energy transition series, investing in renewable energy, battery storage, grid infrastructure, and decarbonization assets globally.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
  }),
  f("FUND-057", "Blackstone", "Blackstone Energy Transition Partners IV", "2022", "$5.6B", 5600, "Value-Add", "Deploying", {
    description: "Value-add fund investing in the global energy transition including renewable power generation, storage, and critical grid infrastructure assets.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
  }),

  // Brookfield Asset Management
  f("FUND-058", "Brookfield Asset Management", "Brookfield Infrastructure Fund V (BIF V)", "2022", "$30.0B", 30000, "Value-Add", "Deploying", {
    description: "Flagship value-add fund investing in large-scale infrastructure businesses across utilities, transportation, midstream, and data infrastructure globally.",
    sectors: ["Utilities", "Transportation", "Midstream / Energy", "Digital Infrastructure"],
    regions: ["Global"],
  }),
  f("FUND-059", "Brookfield Asset Management", "Brookfield Super-Core Infrastructure Partners", "2018", "$15.5B", 15500, "Core", "Evergreen", {
    description: "Open-end super-core fund targeting the highest-quality regulated and contracted infrastructure assets with utility-like returns in transportation, utilities, and renewables.",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-060", "Brookfield Asset Management", "Brookfield Global Transition Fund II (BGTF II)", "2024", "$23.5B", 23500, "Value-Add", "Deploying", {
    description: "World's largest energy transition fund investing in clean energy, carbon capture, sustainable fuels, and decarbonization of carbon-intensive industries globally.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Midstream / Energy"],
    regions: ["Global"],
  }),
  f("FUND-061", "Brookfield Asset Management", "Brookfield Catalytic Transition Fund", "2023", "$5.0B", 5000, "Value-Add", "Deploying", {
    description: "Blended-finance fund deploying concessional and commercial capital for clean energy and transition infrastructure in emerging and developing economies.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Asia-Pacific", "Latin America", "Middle East & Africa"],
  }),
  f("FUND-062", "Brookfield Asset Management", "Brookfield Infrastructure Solutions (BISS I)", "2024", "$1.0B", 1000, "Value-Add", "Deploying", {
    description: "Infrastructure solutions fund investing in mid-market data center, fiber, and digital infrastructure development projects in partnership with technology companies.",
    sectors: ["Digital Infrastructure"],
    regions: ["North America", "Europe"],
    strategies: ["Value-Add", "Greenfield"],
  }),
  f("FUND-063", "Brookfield Asset Management", "Brookfield Infrastructure Income Fund (BII)", "2023", "Undisclosed", null, "Core", "Evergreen", {
    description: "Open-end income-focused fund targeting high-quality infrastructure debt and equity investments providing stable, yield-oriented returns from essential assets.",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
    strategies: ["Core", "Credit / Debt"],
  }),

  // Carlyle Infrastructure
  f("FUND-064", "Carlyle Infrastructure", "Carlyle Global Infrastructure Opportunity Fund II", "2024", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "Value-add fund targeting mid-market infrastructure businesses in energy, power, renewables, and transport across North America and Europe with active operational management.",
    sectors: ["Power Generation", "Renewables / Energy Transition", "Transportation", "Utilities"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-065", "Carlyle Infrastructure", "Carlyle Renewable & Sustainable Energy Fund II", "2022", "$2.0B", 2000, "Value-Add", "Deploying", {
    description: "Dedicated clean energy fund investing in solar, wind, storage, and other renewable energy assets and platforms in North America and Europe.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe"],
  }),

  // CBRE Investment Management
  f("FUND-066", "CBRE Investment Management", "CBRE Musselshell Infrastructure Investments", "2022", "$100M", 100, "Core-Plus", "Deploying", {
    description: "Niche infrastructure fund targeting small-to-mid-scale essential infrastructure investments in North America with a focus on energy and utility assets.",
    sectors: ["Utilities", "Power Generation"],
    regions: ["North America"],
  }),

  // CIM Group
  f("FUND-067", "CIM Group", "CIM Infrastructure Fund III", "2021", "$1.76B", 1760, "Value-Add", "Deploying", {
    description: "Value-add fund investing in digital infrastructure, renewable energy, and transportation assets across North America with hands-on development capabilities.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America"],
  }),

  // Copenhagen Infrastructure Partners
  f("FUND-068", "Copenhagen Infrastructure Partners", "Copenhagen Infrastructure V (CI V)", "2023", "€12.0B", 13200, "Core-Plus", "Deploying", {
    description: "Flagship renewable energy fund investing in large-scale offshore wind, onshore wind, solar PV, and Power-to-X projects globally with greenfield development capabilities.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    strategies: ["Core-Plus", "Greenfield"],
  }),
  f("FUND-069", "Copenhagen Infrastructure Partners", "CI Advanced Bioenergy Fund I (CI ABF I)", "2022", "€750M", 825, "Value-Add", "Deploying", {
    description: "Specialized fund investing in next-generation bioenergy infrastructure including biogas, biomethane, and sustainable aviation fuel production facilities.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe", "North America"],
    strategies: ["Value-Add", "Greenfield"],
  }),
  f("FUND-070", "Copenhagen Infrastructure Partners", "CI Advanced Bioenergy Fund II (CI ABF II)", "2025", "€1.5B", 1650, "Value-Add", "Raising", {
    description: "Successor bioenergy fund scaling investments in biomethane, e-fuels, and sustainable aviation fuel infrastructure across Europe and North America.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe", "North America"],
    strategies: ["Value-Add", "Greenfield"],
  }),

  // Cube Infrastructure Managers
  f("FUND-071", "Cube Infrastructure Managers", "Cube Infrastructure Fund III", "2021", "€1.35B", 1485, "Core-Plus", "Deploying", {
    description: "European mid-market fund investing in essential infrastructure in public transport, fiber/telecom networks, and renewable energy with long-term contracted revenues.",
    sectors: ["Transportation", "Communications", "Renewables / Energy Transition"],
    regions: ["Europe"],
  }),
  f("FUND-072", "Cube Infrastructure Managers", "Cube Infrastructure Fund IV", "2025", "€1.5B", 1650, "Core-Plus", "Raising", {
    description: "Successor fund continuing Cube's European mid-market strategy across public transport operators, fiber networks, and energy transition infrastructure.",
    sectors: ["Transportation", "Communications", "Renewables / Energy Transition"],
    regions: ["Europe"],
  }),

  // CVC DIF
  f("FUND-073", "CVC DIF", "CVC DIF Infrastructure VIII", "2025", "€6.0B", 6600, "Core-Plus", "Raising", {
    description: "Flagship core-plus fund investing in essential European infrastructure across energy, transportation, telecom, and social infrastructure with contracted cash flows.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Communications", "Social Infrastructure"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-074", "CVC DIF", "CVC DIF Value-Add IV", "2025", "€2.0B", 2200, "Value-Add", "Raising", {
    description: "Value-add fund targeting infrastructure businesses requiring active management and operational improvement in energy transition, digital, and transport sectors.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["Europe"],
  }),
  f("FUND-075", "CVC DIF", "DIF Infrastructure VII", "2022", "€4.40B", 4840, "Core", "Deploying", {
    description: "Core infrastructure fund investing in contracted and regulated essential assets in European energy, PPP/social infrastructure, and telecom with availability-based revenues.",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure", "Communications", "Transportation"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-076", "CVC DIF", "DIF Core-Plus Infrastructure Fund III (CIF III)", "2022", "€1.60B", 1760, "Core-Plus", "Deploying", {
    description: "Core-plus fund targeting medium-risk infrastructure assets in energy transition, digital, and transportation with a mix of contracted and merchant revenue exposure.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["Europe"],
  }),

  // DigitalBridge
  f("FUND-077", "DigitalBridge", "DigitalBridge Partners III", "2023", "$7.2B", 7200, "Value-Add", "Deploying", {
    description: "Flagship digital infrastructure fund investing in data centers, cell towers, fiber networks, and edge computing infrastructure globally.",
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["Global"],
  }),
  f("FUND-078", "DigitalBridge", "DigitalBridge Strategic Asset Fund", "2022", "Undisclosed", null, "Core", "Evergreen", {
    description: "Long-hold core digital infrastructure fund targeting stabilized, cash-flowing data centers and fiber networks with contracted revenue streams.",
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-079", "DigitalBridge", "DigitalBridge Emerging Market Digital Infrastructure", "2021", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Fund investing in digital infrastructure across emerging markets including cell towers, fiber, and data centers in Africa, Asia, and Latin America.",
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["Asia-Pacific", "Latin America", "Middle East & Africa"],
  }),
  f("FUND-080", "DigitalBridge", "InfraBridge Global Infrastructure Fund III (GIF III)", "2023", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Mid-market fund targeting digital and traditional infrastructure across emerging markets, including towers, fiber, transportation, and energy assets.",
    sectors: ["Digital Infrastructure", "Communications", "Transportation", "Power Generation"],
    regions: ["Asia-Pacific", "Middle East & Africa"],
  }),

  // DWS Infrastructure
  f("FUND-081", "DWS Infrastructure", "Pan-European Infrastructure Fund IV", "2024", "€4.0B", 4400, "Core-Plus", "Deploying", {
    description: "Core-plus fund investing in mid-market essential European infrastructure across transportation, energy, digital, and environmental services with active asset management.",
    sectors: ["Transportation", "Renewables / Energy Transition", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe"],
  }),
  f("FUND-082", "DWS Infrastructure", "Sustainable Growth Infrastructure Fund", "2022", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Growth-oriented fund targeting next-generation sustainable infrastructure in energy transition, digitalization, and environmental services across Europe.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Growth"],
  }),
  f("FUND-083", "DWS Infrastructure", "DWS Infrastruktur Europa", "2023", "€452M", 497, "Core", "Evergreen", {
    description: "Open-end European core infrastructure fund for German institutional investors, targeting regulated utilities, contracted renewables, and social infrastructure.",
    sectors: ["Utilities", "Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["Europe"],
    structure: "Open-End",
  }),

  // EIG Global Energy Partners
  f("FUND-084", "EIG Global Energy Partners", "EIG Energy Fund XVIII", "2022", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "Energy infrastructure fund investing across the energy value chain including LNG, midstream, power generation, and energy transition assets globally.",
    sectors: ["Midstream / Energy", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global"],
  }),

  // Ember Infrastructure
  f("FUND-085", "Ember Infrastructure", "Ember Infrastructure Fund II", "2024", "$831M", 831, "Value-Add", "Deploying", {
    description: "Mid-market fund investing in essential North American infrastructure services businesses across utilities, environmental services, and transportation.",
    sectors: ["Utilities", "Waste / Environmental Services", "Transportation"],
    regions: ["North America"],
  }),

  // EnCap Investments
  f("FUND-086", "EnCap Investments", "EnCap Flatrock Midstream Fund V", "2023", "$1.0B", 1000, "Value-Add", "Deploying", {
    description: "Midstream-focused fund investing in natural gas gathering, processing, and transportation infrastructure serving North American shale basins.",
    sectors: ["Midstream / Energy"],
    regions: ["North America"],
  }),
  f("FUND-087", "EnCap Investments", "EnCap Energy Transition Fund II", "2023", "$1.5B", 1500, "Value-Add", "Deploying", {
    description: "Energy transition fund investing in renewable power, battery storage, renewable fuels, and carbon management infrastructure across North America.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
  }),
  f("FUND-088", "EnCap Investments", "EnCap Energy Transition Fund III", "2025", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Latest energy transition vehicle continuing investments in clean power, storage, and decarbonization infrastructure across North American markets.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
  }),

  // Energy Capital Partners
  f("FUND-089", "Energy Capital Partners", "Energy Capital Partners VI", "2024", "$5.0B", 5000, "Value-Add", "Deploying", {
    description: "Large-cap energy infrastructure fund investing in power generation, renewables, energy storage, and grid infrastructure across North America.",
    sectors: ["Power Generation", "Renewables / Energy Transition", "Utilities"],
    regions: ["North America"],
  }),
  f("FUND-090", "Energy Capital Partners", "ECP Energy Transition Opportunities Fund", "2023", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Dedicated energy transition fund targeting renewable energy, storage, grid modernization, and electrification infrastructure investments in North America.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["North America"],
  }),

  // Energy Infrastructure Partners
  f("FUND-091", "Energy Infrastructure Partners", "EIP I (Swiss Energy Infrastructure)", "2014", "CHF 1.7B+", 1904, "Core", "Evergreen", {
    description: "Core infrastructure fund investing in Swiss and European hydropower, grid infrastructure, and regulated energy utilities with long-term concession-based revenues.",
    sectors: ["Power Generation", "Utilities", "Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Open-End",
  }),
  f("FUND-092", "Energy Infrastructure Partners", "EIP III (Global Energy Transition Infrastructure)", "2022", "€1.5B", 1650, "Core-Plus", "Deploying", {
    description: "Global energy transition fund investing in renewable energy, grid infrastructure, and energy storage assets supporting decarbonization across Europe and select global markets.",
    sectors: ["Renewables / Energy Transition", "Utilities", "Power Generation"],
    regions: ["Europe", "Global"],
  }),

  // EQT Infrastructure
  f("FUND-093", "EQT Infrastructure", "EQT Infrastructure VI", "2023", "€21.5B", 23650, "Value-Add", "Deploying", {
    description: "Flagship large-cap infrastructure fund investing in digital infrastructure, energy, transportation, and social infrastructure with thematic operational improvement in Europe and North America.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-094", "EQT Infrastructure", "EQT Active Core Infrastructure I", "2022", "€2.9B", 3190, "Core", "Deploying", {
    description: "Long-hold core infrastructure fund targeting essential regulated and contracted assets in utilities, renewables, and transport across Europe with active ownership.",
    sectors: ["Utilities", "Renewables / Energy Transition", "Transportation"],
    regions: ["Europe"],
  }),
  f("FUND-095", "EQT Infrastructure", "EQT Transition Infrastructure", "2024", "€5.0B", 5500, "Value-Add", "Deploying", {
    description: "Dedicated energy transition fund investing in renewable energy platforms, grid infrastructure, energy storage, and industrial decarbonization across Europe.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["Europe"],
  }),

  // Equitix
  f("FUND-096", "Equitix", "Equitix Fund VII", "2024", "£1.5B", 1950, "Core", "Deploying", {
    description: "Core infrastructure fund investing in UK PPP/PFI social infrastructure including schools, hospitals, courts, and essential public facilities with availability-based revenues.",
    sectors: ["Social Infrastructure", "Utilities"],
    regions: ["Europe"],
  }),
  f("FUND-097", "Equitix", "Equitix Euro Infrastructure Fund II", "2021", "€1.4B", 1540, "Core-Plus", "Deploying", {
    description: "European core-plus fund investing in essential infrastructure across energy transition, digital, and social sectors with contracted revenue profiles in Continental Europe.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure"],
    regions: ["Europe"],
  }),
  f("FUND-098", "Equitix", "Equitix UK Electricity Storage Fund", "2023", "£150M", 195, "Core-Plus", "Deploying", {
    description: "Specialist fund investing in battery energy storage systems across the UK, providing grid balancing services and frequency response to support renewable energy integration.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe"],
  }),

  // Fengate Asset Management
  f("FUND-099", "Fengate Asset Management", "Fengate Infrastructure Fund IV", "2021", "$1.1B", 1100, "Value-Add", "Deploying", {
    description: "Canadian mid-market infrastructure fund investing in renewable energy, social infrastructure, and essential services across North America with development capabilities.",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure", "Utilities"],
    regions: ["North America"],
  }),
  f("FUND-100", "Fengate Asset Management", "Fengate Infrastructure Yield Fund", "2019", "$1.22B", 1220, "Core", "Evergreen", {
    description: "Open-end yield-focused fund investing in operating Canadian and North American infrastructure assets with contracted revenues including renewables and PPP social infrastructure.",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["North America"],
    structure: "Open-End",
  }),

  // Generate Capital
  f("FUND-101", "Generate Capital", "Generate Capital (Permanent Capital Vehicle)", "2014", ">$14.0B", 14000, "Core-Plus", "Evergreen", {
    description: "Permanent capital platform investing in sustainable infrastructure across distributed energy, water, waste, transportation, and agriculture with a focus on resource efficiency.",
    sectors: ["Renewables / Energy Transition", "Water", "Waste / Environmental Services", "Transportation"],
    regions: ["North America"],
    structure: "Permanent Capital",
  }),
  f("FUND-102", "Generate Capital", "Generate Capital Sustainable Infrastructure Fund", "2024", "$1.5B", 1500, "Value-Add", "Deploying", {
    description: "Growth fund targeting emerging sustainable infrastructure technologies including community solar, battery storage, water treatment, and circular economy assets.",
    sectors: ["Renewables / Energy Transition", "Water", "Waste / Environmental Services"],
    regions: ["North America"],
  }),

  // Goldman Sachs Asset Management
  f("FUND-103", "Goldman Sachs Asset Management", "West Street Infrastructure Partners V (WSIP V)", "2025", "$4.0B", 4000, "Value-Add", "Raising", {
    description: "Value-add infrastructure fund investing in energy, transportation, digital, and utility infrastructure across North America, Europe, and select Asia-Pacific markets.",
    sectors: ["Power Generation", "Transportation", "Digital Infrastructure", "Utilities"],
    regions: ["North America", "Europe", "Asia-Pacific"],
  }),
  f("FUND-104", "Goldman Sachs Asset Management", "West Street Infrastructure Partners IV (WSIP IV)", "2023", "$4.0B", 4000, "Value-Add", "Deploying", {
    description: "Value-add fund targeting mid-to-large-cap infrastructure businesses in energy, transport, and digital sectors with operational improvement opportunities.",
    sectors: ["Power Generation", "Transportation", "Digital Infrastructure", "Utilities"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-105", "Goldman Sachs Asset Management", "West Street Private Infrastructure Fund (G-INFRA)", "2023", "Undisclosed", null, "Core-Plus", "Evergreen", {
    description: "Open-end evergreen fund providing private wealth clients access to core-plus infrastructure investments across essential services in developed markets.",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
  }),

  // Harbert Management Corp
  f("FUND-106", "Harbert Management Corp", "Harbert Infrastructure Fund VI", "2022", "$905M", 905, "Value-Add", "Deploying", {
    description: "Mid-market value-add fund investing in essential US infrastructure businesses including power, utilities, transportation, and environmental services with operational improvement.",
    sectors: ["Power Generation", "Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["North America"],
  }),

  // Harrison Street
  f("FUND-107", "Harrison Street", "Harrison Street Social Infrastructure Fund", "2018", "$5.2B+", 5200, "Core-Plus", "Evergreen", {
    description: "Open-end fund investing in demographic-driven social infrastructure including student housing, senior living, medical facilities, and life science properties across North America.",
    sectors: ["Social Infrastructure"],
    regions: ["North America"],
    structure: "Open-End",
  }),
  f("FUND-108", "Harrison Street", "Harrison Street Energy Transition Fund", "2023", "$750M", 750, "Value-Add", "Deploying", {
    description: "Fund targeting distributed energy and sustainability infrastructure serving institutional real estate including on-site solar, storage, microgrids, and energy efficiency.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
  }),
  f("FUND-109", "Harrison Street", "Harrison Street Digital Fund", "2024", "$600M", 600, "Value-Add", "Deploying", {
    description: "Dedicated digital infrastructure fund investing in edge data centers, fiber networks, and connectivity infrastructure serving education, healthcare, and government institutions.",
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America"],
  }),

  // H.I.G. Capital
  f("FUND-110", "H.I.G. Capital", "H.I.G. Infrastructure Partners Fund I", "2022", "$1.3B", 1300, "Value-Add", "Deploying", {
    description: "Inaugural infrastructure fund targeting mid-market essential services businesses in utilities, transportation, and environmental services across North America and Europe.",
    sectors: ["Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
  }),

  // I Squared Capital
  f("FUND-111", "I Squared Capital", "ISQ Global Infrastructure Fund IV", "2024", "$15.0B", 15000, "Value-Add", "Deploying", {
    description: "Large-cap global infrastructure fund investing in utilities, energy, transportation, digital infrastructure, and environmental services with active management and platform building.",
    sectors: ["Utilities", "Power Generation", "Transportation", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["Global"],
  }),
  f("FUND-112", "I Squared Capital", "ISQ Energy Transition Infrastructure Fund", "2023", "$2.0B", 2000, "Value-Add", "Deploying", {
    description: "Dedicated energy transition fund investing in renewable energy, energy storage, grid infrastructure, and clean transportation globally.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Transportation"],
    regions: ["Global"],
  }),

  // iCON Infrastructure
  f("FUND-113", "iCON Infrastructure", "iCON Infrastructure Partners VII", "2024", "$3.7B", 3700, "Core-Plus", "Deploying", {
    description: "Mid-market core-plus fund targeting essential infrastructure businesses in utilities, transportation, and environmental services across North America, Europe, and Australasia.",
    sectors: ["Utilities", "Transportation", "Waste / Environmental Services", "Renewables / Energy Transition"],
    regions: ["North America", "Europe", "Asia-Pacific"],
  }),

  // IFM Investors
  f("FUND-114", "IFM Investors", "IFM Global Infrastructure Fund (GIF)", "2004", ">$73.0B", 73000, "Core", "Evergreen", {
    description: "The world's largest open-end core infrastructure fund investing in essential, monopoly-like infrastructure assets with strong market positions, predictable regulatory environments, and high barriers to entry across developed markets.",
    sectors: ["Transportation", "Utilities", "Midstream / Energy", "Communications"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    structure: "Open-End",
  }),
  f("FUND-115", "IFM Investors", "IFM Australian Infrastructure Fund (AIF)", "1995", "~$8.7B", 8700, "Core", "Evergreen", {
    description: "Australia's longest-running infrastructure fund investing in essential domestic assets including airports, ports, toll roads, regulated utilities, and telecommunications infrastructure.",
    sectors: ["Transportation", "Utilities", "Communications"],
    regions: ["Asia-Pacific"],
    structure: "Open-End",
  }),
  f("FUND-116", "IFM Investors", "IFM Net Zero Infrastructure Fund (NZIF)", "2022", "$3.0B", 3000, "Core-Plus", "Evergreen", {
    description: "Open-end fund targeting essential infrastructure assets that accelerate the transition to a net-zero emissions economy, including renewables, energy storage, EV charging, hydrogen, and alternative fuels.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Midstream / Energy"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-117", "IFM Investors", "IFM Global Value Add Infrastructure Fund", "2025", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "First value-add fund from IFM targeting infrastructure businesses requiring active management and operational improvement in energy transition, digital, and transport sectors.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["Global"],
  }),

  // Igneo Infrastructure Partners
  f("FUND-118", "Igneo Infrastructure Partners", "European Diversified Infrastructure Fund III (EDIF III)", "2020", "€5.3B", 5830, "Core-Plus", "Deploying", {
    description: "Third vintage closed-end fund targeting European mid-market, sustainable economic infrastructure assets across energy, transportation, utility, telecommunications, and environmental sectors.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities", "Communications", "Waste / Environmental Services"],
    regions: ["Europe"],
  }),
  f("FUND-119", "Igneo Infrastructure Partners", "European Diversified Infrastructure Fund IV (EDIF IV)", "2025", "€4.0B", 4400, "Core-Plus", "Raising", {
    description: "Fourth vintage of Igneo's flagship European infrastructure series, continuing the strategy of investing in mid-market, sustainable economic infrastructure across energy, transport, utility, and telecom sectors.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities", "Communications", "Waste / Environmental Services"],
    regions: ["Europe"],
  }),
  f("FUND-120", "Igneo Infrastructure Partners", "Global Diversified Infrastructure Fund (GDIF)", "N/A", "~$7.5B", 7500, "Core-Plus", "Evergreen", {
    description: "Open-end global infrastructure fund investing in mid-market infrastructure businesses across waste, water, renewables, transportation, and digital sectors with a long-term sustainable value creation approach.",
    sectors: ["Waste / Environmental Services", "Water", "Renewables / Energy Transition", "Transportation", "Digital Infrastructure"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-121", "Igneo Infrastructure Partners", "North American Diversified Infrastructure Fund (NADIF)", "2024", "$1.0B", 1000, "Core-Plus", "Evergreen", {
    description: "Open-end fund targeting mid-market essential infrastructure assets in North America across utilities, renewables, transportation, and social infrastructure.",
    sectors: ["Utilities", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America"],
    structure: "Open-End",
  }),
  f("FUND-122", "Igneo Infrastructure Partners", "Australian Diversified Infrastructure Fund (ADIF)", "2003", "A$1.0B+", 660, "Core-Plus", "Evergreen", {
    description: "Rebranded open-end fund (formerly WIIF) targeting majority stakes in Australian and New Zealand mid-market infrastructure companies across digital, energy, waste, and water sectors.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Waste / Environmental Services", "Water"],
    regions: ["Asia-Pacific"],
    structure: "Open-End",
  }),

  // InfraRed Capital Partners
  f("FUND-123", "InfraRed Capital Partners", "InfraRed Infrastructure Fund VI", "2022", "$1.0B+", 1000, "Value-Add", "Deploying", {
    description: "Value-add fund investing in mid-market infrastructure across energy transition, digital, and social sectors in Europe, North America, and Asia-Pacific.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure"],
    regions: ["Europe", "North America", "Asia-Pacific"],
  }),
  f("FUND-124", "InfraRed Capital Partners", "InfraRed Infrastructure Fund VII", "2025", "$1.5B", 1500, "Value-Add", "Raising", {
    description: "Successor value-add fund continuing InfraRed's strategy in energy transition, digital infrastructure, and essential services across global developed markets.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure"],
    regions: ["Europe", "North America", "Asia-Pacific"],
  }),
  f("FUND-125", "InfraRed Capital Partners", "HICL Infrastructure PLC", "2006", "~£3.0B", 3900, "Core", "Evergreen", {
    description: "London-listed core infrastructure investment company targeting PPP/PFI social infrastructure, regulated assets, and demand-based infrastructure with predictable cash flows.",
    sectors: ["Social Infrastructure", "Utilities", "Transportation"],
    regions: ["Europe", "North America"],
    structure: "Listed / Evergreen",
    ticker: "HICL.L",
  }),
  f("FUND-126", "InfraRed Capital Partners", "The Renewables Infrastructure Group (TRIG)", "2013", "~£1.9B", 2470, "Core-Plus", "Evergreen", {
    description: "FTSE 250 listed closed-ended investment company providing long-term stable dividends from a diversified portfolio of operational wind farms, solar parks, and battery storage across the UK and Europe.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Listed / Closed-End",
    ticker: "TRIG.L",
  }),
  f("FUND-127", "InfraRed Capital Partners", "North American Core Income Energy Transition Fund", "2023", "$900M", 900, "Core-Plus", "Evergreen", {
    description: "Open-end fund targeting operational renewable energy assets in North America with contracted revenues, focusing on solar, wind, and battery storage.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America"],
    structure: "Open-End",
  }),

  // InfraVia Capital Partners
  f("FUND-128", "InfraVia Capital Partners", "InfraVia European Fund VI", "2024", "€8.0B", 8800, "Core-Plus", "Deploying", {
    description: "Flagship European mid-market fund investing in digital infrastructure, energy transition, transportation, and healthcare infrastructure with active value creation.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["Europe"],
  }),

  // Infratil
  f("FUND-129", "Infratil", "Infratil Limited", "1994", "$12.2B", 12200, "Core-Plus", "Evergreen", {
    description: "NZX and ASX-listed infrastructure investment company with a portfolio spanning renewable energy, digital infrastructure, airports, and healthcare across Australasia and globally.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Social Infrastructure"],
    regions: ["Asia-Pacific", "North America", "Europe"],
    structure: "Listed / Evergreen",
    ticker: "IFT.NZ",
  }),

  // J.P. Morgan Asset Management
  f("FUND-130", "J.P. Morgan Asset Management", "Infrastructure Investments Fund (IIF)", "2006", "~$40.0B", 40000, "Core", "Evergreen", {
    description: "One of the world's largest open-end core infrastructure funds, acquiring mature infrastructure assets with stable cash flows, monopolistic frameworks, and long-term contracts across energy, water, and transportation in OECD countries.",
    sectors: ["Utilities", "Transportation", "Midstream / Energy", "Water"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    structure: "Open-End",
  }),
  f("FUND-131", "J.P. Morgan Asset Management", "Global Transport Income Fund (GTIF)", "2018", "$4.1B", 4100, "Core-Plus", "Evergreen", {
    description: "Specialist open-end transport fund investing in airports, seaports, rail, toll roads, and logistics infrastructure globally with long-term contracted or regulated revenues.",
    sectors: ["Transportation", "Logistics"],
    regions: ["Global"],
    structure: "Open-End",
  }),

  // Kimmeridge Energy
  f("FUND-132", "Kimmeridge Energy", "Kimmeridge Carbon Solutions Fund II", "2024", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Carbon management fund investing in carbon capture, utilization, and sequestration infrastructure, as well as emissions reduction technology across North America.",
    sectors: ["Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["North America"],
  }),

  // KKR
  f("FUND-133", "KKR", "KKR Global Infrastructure Investors V", "2023", "$20.0B", 20000, "Value-Add", "Deploying", {
    description: "Flagship large-cap infrastructure fund investing in transportation, energy, digital infrastructure, and utilities across global markets with thematic operational improvement.",
    sectors: ["Transportation", "Power Generation", "Digital Infrastructure", "Utilities", "Renewables / Energy Transition"],
    regions: ["Global"],
  }),
  f("FUND-134", "KKR", "KKR Asia Pacific Infrastructure Investors II", "2023", "$6.4B", 6400, "Value-Add", "Deploying", {
    description: "Asia-Pacific infrastructure fund investing in transportation, energy, utilities, and digital infrastructure across developed and emerging Asian markets.",
    sectors: ["Transportation", "Power Generation", "Utilities", "Digital Infrastructure"],
    regions: ["Asia-Pacific"],
  }),
  f("FUND-135", "KKR", "KKR Asia Pacific Infrastructure Investors III", "2025", ">$6.4B", 6400, "Value-Add", "Deploying", {
    description: "Successor Asia-Pacific fund continuing KKR's strategy in essential infrastructure across transport, energy, digital, and utilities in the region.",
    sectors: ["Transportation", "Power Generation", "Utilities", "Digital Infrastructure"],
    regions: ["Asia-Pacific"],
  }),
  f("FUND-136", "KKR", "Diversified Core Infra Fund (DCIF)", "2020", "~$11.0B+", 11000, "Core", "Evergreen", {
    description: "Open-end core infrastructure fund acquiring mature brownfield assets with stable, regulated or contracted cash flows across energy, transport, telecom, water, and utilities, primarily sourced on a proprietary basis in OECD markets.",
    sectors: ["Utilities", "Transportation", "Communications", "Midstream / Energy", "Water"],
    regions: ["North America", "Europe"],
    structure: "Open-End",
  }),
  f("FUND-137", "KKR", "Global Climate Transition Fund", "2023", "$7.0B", 7000, "Value-Add", "Deploying", {
    description: "Climate-focused fund investing in renewable energy, energy storage, grid modernization, and clean transportation infrastructure across global markets.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Transportation"],
    regions: ["Global"],
  }),
  f("FUND-138", "KKR", "Asia Climate Fund", "2024", "$1.0B", 1000, "Value-Add", "Deploying", {
    description: "Asia-focused climate fund investing in renewable energy, clean transportation, and energy transition infrastructure across emerging and developed Asian markets.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Power Generation"],
    regions: ["Asia-Pacific"],
  }),
  f("FUND-139", "KKR", "KKR Infrastructure Fund (K-INFRA)", "2023", "Undisclosed", null, "Core-Plus", "Evergreen", {
    description: "Semi-liquid evergreen fund providing private wealth clients access to KKR's core-plus infrastructure strategy across diversified essential services globally.",
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
    strategies: ["Core-Plus", "Retail Act '40"],
  }),

  // Macquarie Asset Management
  f("FUND-140", "Macquarie Asset Management", "Macquarie European Infrastructure Fund 7 (MEIF 7)", "2024", "€8.0B", 8800, "Core-Plus", "Deploying", {
    description: "Flagship European fund investing in mid-market infrastructure across utilities, transportation, digital, and renewable energy with active asset management.",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Europe"],
  }),
  f("FUND-141", "Macquarie Asset Management", "Macquarie Infrastructure Partners VI (MIP VI)", "2024", "$6.8B", 6800, "Core-Plus", "Deploying", {
    description: "Americas-focused fund investing in essential infrastructure including utilities, transportation, digital, and environmental services with active operational improvement.",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["North America"],
  }),
  f("FUND-142", "Macquarie Asset Management", "Macquarie Infrastructure Partners VII (MIP VII)", "2025", "$7.0B", 7000, "Core-Plus", "Deploying", {
    description: "Successor Americas infrastructure fund continuing MIP's strategy of investing in essential mid-market infrastructure businesses with operational value creation.",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["North America"],
  }),
  f("FUND-143", "Macquarie Asset Management", "Macquarie Asia-Pacific Infrastructure Fund 3 (MAIF 3)", "2022", "$4.2B", 4200, "Core-Plus", "Deploying", {
    description: "Asia-Pacific infrastructure fund targeting mid-market essential services in utilities, transportation, and digital infrastructure across developed and emerging Asia.",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Asia-Pacific"],
  }),
  f("FUND-144", "Macquarie Asset Management", "Macquarie Asia-Pacific Infrastructure Fund 4 (MAIF 4)", "2024", "Undisclosed", null, "Core-Plus", "Deploying", {
    description: "Successor Asia-Pacific fund continuing MAIF's strategy across essential infrastructure in utilities, transport, digital, and energy transition in the region.",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Asia-Pacific"],
  }),
  f("FUND-145", "Macquarie Asset Management", "Macquarie Super Core Infrastructure Fund (MSCIF)", "2018", "€12.6B", 13860, "Core", "Evergreen", {
    description: "Open-end super-core fund investing in the highest-quality regulated and contracted infrastructure in Europe, targeting utilities, transport, and renewables with utility-like returns.",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Open-End",
  }),
  f("FUND-146", "Macquarie Asset Management", "Macquarie Global Infrastructure Fund (MGIF)", "2021", "$3.0B", 3000, "Core", "Evergreen", {
    description: "Open-end global core infrastructure fund for institutional investors, targeting regulated and contracted essential infrastructure assets worldwide.",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-147", "Macquarie Asset Management", "Macquarie Green Energy Transition Solutions (MGETS)", "2022", "$2.4B", 2400, "Value-Add", "Deploying", {
    description: "Dedicated green energy fund investing in renewable energy development, battery storage, and grid-scale clean energy projects globally with greenfield capabilities.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    strategies: ["Value-Add", "Greenfield"],
  }),
  f("FUND-148", "Macquarie Asset Management", "Macquarie Green Energy and Climate Opportunities Fund", "2024", "Undisclosed", null, "Core-Plus", "Evergreen", {
    description: "Open-end fund investing in operational renewable energy and climate infrastructure assets providing stable income with positive environmental impact.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-149", "Macquarie Asset Management", "Macquarie Private Infrastructure Fund (MPIF)", "2021", "$897.1M", 897, "Core-Plus", "Evergreen", {
    description: "Semi-liquid infrastructure fund providing wealth management clients access to Macquarie's core-plus infrastructure strategy across global essential services.",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-150", "Macquarie Asset Management", "Macquarie Energy Transition Infrastructure Fund (METI)", "2024", "$1.0B", 1000, "Value-Add", "Deploying", {
    description: "Energy transition fund targeting renewable energy, storage, and grid infrastructure investments supporting decarbonization across developed markets.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe"],
  }),

  // MEAG
  f("FUND-151", "MEAG", "MEAG European Infrastructure One SCSp (MEIO)", "2022", "€600M", 660, "Core-Plus", "Deploying", {
    description: "Munich Re's asset manager investing in mid-market European infrastructure across energy, transportation, and digital sectors with focus on inflation-linked returns.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Digital Infrastructure"],
    regions: ["Europe"],
  }),
  f("FUND-152", "MEAG", "MEAG Volante DC Investor SCSp", "2025", "Undisclosed", null, "Core-Plus", "Deploying", {
    description: "Dedicated data center fund investing in hyperscale and colocation data center infrastructure across European markets to meet growing AI and cloud demand.",
    sectors: ["Digital Infrastructure"],
    regions: ["Europe"],
    strategies: ["Core-Plus", "Greenfield"],
  }),

  // Meridiam
  f("FUND-153", "Meridiam", "Meridiam Sustainable Infrastructure Europe IV", "2021", "€2.3B", 2530, "Value-Add", "Deploying", {
    description: "Long-term European infrastructure fund investing in greenfield and brownfield projects across transportation, energy transition, and social infrastructure over 25-year holding periods.",
    sectors: ["Transportation", "Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Greenfield"],
  }),
  f("FUND-154", "Meridiam", "Meridiam Infrastructure North America IV", "2023", "$1.8B", 1800, "Value-Add", "Deploying", {
    description: "North American fund targeting long-term infrastructure development including renewable energy, transportation, and social infrastructure with public-private partnership expertise.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
    strategies: ["Value-Add", "Greenfield"],
  }),
  f("FUND-155", "Meridiam", "Meridiam Sustainable Infrastructure Europe V", "2025", "€3.0B", 3300, "Value-Add", "Raising", {
    description: "Successor European fund continuing Meridiam's long-term sustainable infrastructure strategy in transport, energy, and social infrastructure with ESG-first approach.",
    sectors: ["Transportation", "Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Greenfield"],
  }),
  f("FUND-156", "Meridiam", "Meridiam Infrastructure Agri Transition", "2025", "€500M", 550, "Value-Add", "Deploying", {
    description: "Specialist fund investing in agricultural infrastructure supporting the food system transition, including cold chain logistics, water efficiency, and sustainable farming infrastructure.",
    sectors: ["Water", "Logistics", "Social Infrastructure"],
    regions: ["Europe"],
  }),
  f("FUND-157", "Meridiam", "Meridiam Infrastructure Africa Fund II (MIAF II)", "2021", "€750M", 825, "Value-Add", "Deploying", {
    description: "Africa-focused fund investing in essential infrastructure development including renewable energy, transportation, water, and social infrastructure across Sub-Saharan Africa.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Water", "Social Infrastructure"],
    regions: ["Middle East & Africa"],
    strategies: ["Value-Add", "Greenfield"],
  }),
  f("FUND-158", "Meridiam", "The Urban Resilience Fund (TURF)", "2021", "€350M", 385, "Value-Add", "Deploying", {
    description: "Impact fund investing in climate-resilient urban infrastructure in developing cities, targeting water systems, flood protection, waste management, and green mobility.",
    sectors: ["Water", "Waste / Environmental Services", "Transportation", "Social Infrastructure"],
    regions: ["Middle East & Africa", "Asia-Pacific", "Latin America"],
  }),

  // Mirova
  f("FUND-159", "Mirova", "Mirova Energy Transition 6 (MET6)", "2023", "€2.0B", 2200, "Value-Add", "Deploying", {
    description: "European renewable energy fund investing in onshore wind, solar PV, and battery storage projects across Europe with greenfield development and construction capabilities.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Greenfield"],
  }),

  // Morgan Stanley Infrastructure
  f("FUND-160", "Morgan Stanley Infrastructure", "North Haven Infrastructure Partners IV", "2022", "$4.1B", 4100, "Value-Add", "Deploying", {
    description: "Value-add fund targeting mid-market essential infrastructure in energy, transportation, utilities, and environmental services across North America and Western Europe.",
    sectors: ["Power Generation", "Transportation", "Utilities", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
  }),

  // Northleaf Capital Partners
  f("FUND-161", "Northleaf Capital Partners", "Northleaf Infrastructure Capital Partners IV (NICP IV)", "2023", "$2.6B", 2600, "Core-Plus", "Deploying", {
    description: "Mid-market infrastructure fund targeting essential services in utilities, transportation, digital infrastructure, and renewables across North America and Western Europe.",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-162", "Northleaf Capital Partners", "Northleaf Essential Infrastructure Fund (NEIF)", "2021", "$800M", 800, "Core", "Evergreen", {
    description: "Open-end core fund investing in essential, contracted infrastructure assets with stable cash flows in utilities, transportation, and social infrastructure across North America.",
    sectors: ["Utilities", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
    structure: "Open-End",
  }),

  // NOVA Infrastructure
  f("FUND-163", "NOVA Infrastructure", "NOVA Infrastructure Fund II", "2024", "$1.0B", 1000, "Value-Add", "Deploying", {
    description: "Mid-market fund investing in essential North American infrastructure services businesses in power, utilities, environmental services, and transportation.",
    sectors: ["Power Generation", "Utilities", "Waste / Environmental Services", "Transportation"],
    regions: ["North America"],
  }),

  // Nuveen Infrastructure
  f("FUND-164", "Nuveen Infrastructure", "Nuveen Clean Energy Strategy IV", "2021", "€1.9B", 2090, "Value-Add", "Deploying", {
    description: "European clean energy fund investing in onshore wind, solar PV, and battery storage projects with greenfield development and operational capabilities.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Greenfield"],
  }),
  f("FUND-165", "Nuveen Infrastructure", "Nuveen European Core Renewable Infrastructure (NECRI)", "2022", "€700M", 770, "Core", "Evergreen", {
    description: "Open-end core fund investing in operational European renewable energy assets with contracted revenues, targeting onshore wind and solar farms.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Open-End",
  }),

  // Oaktree Capital
  f("FUND-166", "Oaktree Capital", "Oaktree Power Opportunities Fund VII", "2024", "$2.5B", 2500, "Value-Add", "Deploying", {
    description: "Value-add fund investing in power generation, renewable energy, and energy storage assets across North America with turnaround and development capabilities.",
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["North America"],
  }),
  f("FUND-167", "Oaktree Capital", "Oaktree Transportation Infrastructure Capital Partners", "2022", "$3.0B", 3000, "Core-Plus", "Evergreen", {
    description: "Permanent capital vehicle investing in essential transportation infrastructure including airports, ports, rail, and logistics assets globally with long-term holding periods.",
    sectors: ["Transportation", "Logistics"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Partners Group
  f("FUND-168", "Partners Group", "Partners Group Direct Infrastructure IV", "2023", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Global direct infrastructure fund investing in mid-market essential infrastructure businesses across energy, transportation, digital, and utilities with platform building.",
    sectors: ["Power Generation", "Transportation", "Digital Infrastructure", "Utilities"],
    regions: ["Global"],
  }),
  f("FUND-169", "Partners Group", "Partners Group Next Generation Infrastructure Programs", "2019", "$1.0B", 1000, "Core-Plus", "Evergreen", {
    description: "Evergreen fund targeting next-generation infrastructure themes including digital infrastructure, energy transition, and sustainable transportation globally.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["Global"],
  }),

  // Patria Investments
  f("FUND-170", "Patria Investments", "Patria Infrastructure Fund V", "2023", "$2.9B", 2900, "Value-Add", "Deploying", {
    description: "Latin America-focused infrastructure fund investing in energy, transportation, logistics, and utilities across Brazil and other key Latin American markets.",
    sectors: ["Power Generation", "Transportation", "Logistics", "Utilities"],
    regions: ["Latin America"],
  }),
  f("FUND-171", "Patria Investments", "Patria Infrastructure Core Fund (PIER)", "2021", "~$1.0B", 1000, "Core", "Evergreen", {
    description: "Open-end core infrastructure fund targeting contracted and regulated Latin American infrastructure assets in energy, transportation, and utilities with stable yields.",
    sectors: ["Power Generation", "Transportation", "Utilities"],
    regions: ["Latin America"],
    structure: "Open-End",
  }),

  // Patrizia
  f("FUND-172", "Patrizia", "Patrizia European Infrastructure Fund III", "2023", "€1.5B", 1650, "Core-Plus", "Raising", {
    description: "European core-plus infrastructure fund targeting mid-market essential assets in digital infrastructure, energy transition, and social infrastructure.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["Europe"],
  }),
  f("FUND-173", "Patrizia", "APAC Sustainable Infrastructure Fund (A-SIF)", "2022", "$130M", 130, "Value-Add", "Deploying", {
    description: "Asia-Pacific sustainable infrastructure fund investing in renewable energy and energy transition projects across developed and emerging Asian markets.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Asia-Pacific"],
  }),
  f("FUND-174", "Patrizia", "Emerging Asia Sustainable Infrastructure Fund (ESIF)", "2025", "$500M", 500, "Value-Add", "Deploying", {
    description: "Emerging Asia fund targeting sustainable infrastructure investments in renewable energy, clean water, and social infrastructure across Southeast Asia and India.",
    sectors: ["Renewables / Energy Transition", "Water", "Social Infrastructure"],
    regions: ["Asia-Pacific"],
  }),
  f("FUND-175", "Patrizia", "PATRIZIA Infrastructure Invest ELTIF", "2024", "Undisclosed", null, "Core-Plus", "Evergreen", {
    description: "European Long-Term Investment Fund providing retail investors access to core-plus infrastructure investments in digital, energy transition, and social infrastructure.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["Europe"],
  }),
  f("FUND-176", "Patrizia", "PATRIZIA Low Carbon Core Infrastructure Fund", "2019", "Undisclosed", null, "Core", "Evergreen", {
    description: "Core infrastructure fund investing in low-carbon and climate-aligned European infrastructure including renewable energy, grid infrastructure, and clean transportation.",
    sectors: ["Renewables / Energy Transition", "Utilities", "Transportation"],
    regions: ["Europe"],
    structure: "Open-End",
  }),

  // PSP Investments
  f("FUND-177", "PSP Investments", "Canada Growth Fund", "2023", "C$15.0B", 11100, "Value-Add", "Deploying", {
    description: "Federal government-backed investment vehicle catalyzing private capital into Canadian clean economy projects including clean energy, critical minerals, and low-carbon infrastructure.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Transportation"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategies: ["Value-Add", "Growth"],
  }),

  // QIC Global Infrastructure
  f("FUND-178", "QIC Global Infrastructure", "QIC Global Infrastructure Fund II (QGIF II)", "2023", "US$2.0B", 2000, "Core-Plus", "Deploying", {
    description: "Global infrastructure fund managed by Queensland's sovereign wealth fund, investing in essential transportation, utilities, and energy assets in developed markets.",
    sectors: ["Transportation", "Utilities", "Power Generation"],
    regions: ["Global"],
  }),
  f("FUND-179", "QIC Global Infrastructure", "QIC Infrastructure Portfolio (QIP)", "2006", "Undisclosed", null, "Core", "Evergreen", {
    description: "Open-end core infrastructure portfolio for Australian institutional investors, targeting regulated and contracted essential infrastructure globally.",
    sectors: ["Transportation", "Utilities", "Power Generation"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-180", "QIC Global Infrastructure", "Queensland Critical Minerals and Battery Technology Fund", "2023", "A$100M", 66, "Value-Add", "Deploying", {
    description: "Queensland government-backed fund investing in critical minerals mining, processing, and battery technology supply chain infrastructure.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Asia-Pacific"],
  }),

  // Quinbrook Infrastructure
  f("FUND-181", "Quinbrook Infrastructure", "Quinbrook Net Zero Power Fund", "2021", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "Dedicated net-zero power fund investing in renewable energy, battery storage, and grid-scale clean power generation projects across the US, UK, and Australia.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategies: ["Value-Add", "Greenfield"],
  }),
  f("FUND-182", "Quinbrook Infrastructure", "Quinbrook Renewables Impact Fund II", "2024", "£500M", 650, "Value-Add", "Raising", {
    description: "UK-focused impact fund investing in renewable energy, battery storage, and community energy projects with measurable environmental and social benefits.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe"],
  }),
  f("FUND-183", "Quinbrook Infrastructure", "Quinbrook Critical Resources Strategy", "2024", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Strategy targeting critical mineral and resource infrastructure supporting the energy transition, including battery materials, grid components, and supply chain infrastructure.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America", "Asia-Pacific"],
  }),

  // Ridgewood Infrastructure
  f("FUND-184", "Ridgewood Infrastructure", "Ridgewood Water & Strategic Infrastructure Fund II", "2022", "US$1.2B", 1200, "Value-Add", "Deploying", {
    description: "Specialist water infrastructure fund investing in water and wastewater utilities, water treatment, and related essential infrastructure across North America.",
    sectors: ["Water", "Utilities"],
    regions: ["North America"],
  }),

  // Schroders Greencoat
  f("FUND-185", "Schroders Greencoat", "Greencoat UK Wind PLC", "2013", "£3.5B+", 4550, "Core", "Evergreen", {
    description: "London-listed investment trust focused exclusively on operating UK onshore and offshore wind farms, providing yield-oriented returns from long-term power purchase agreements.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Listed / Evergreen",
    ticker: "UKW.L",
  }),
  f("FUND-186", "Schroders Greencoat", "Greencoat Renewables PLC", "2017", "€1.2B+", 1320, "Core", "Evergreen", {
    description: "Dublin and London-listed investment company investing in operating European wind and solar assets, with a focus on Ireland and continental Europe.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Listed / Evergreen",
    ticker: "GRN.IR",
  }),
  f("FUND-187", "Schroders Greencoat", "Greencoat Renewable Income LP (GRI)", "2020", "£1.35B", 1755, "Core-Plus", "Deploying", {
    description: "Unlisted fund investing in a diversified portfolio of operational renewable energy assets across the UK and Europe including wind, solar, and biomass.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
  }),
  f("FUND-188", "Schroders Greencoat", "Schroders Capital Semi-Liquid Global Energy Infrastructure", "2023", "€2.5B+", 2750, "Core-Plus", "Evergreen", {
    description: "Semi-liquid open-end fund providing institutional and wealth investors access to global clean energy infrastructure including wind, solar, hydro, and biomass assets.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-189", "Schroders Greencoat", "Schroders Greencoat Global Renewables+ LTAF", "2024", "Undisclosed", null, "Core-Plus", "Deploying", {
    description: "UK Long-Term Asset Fund providing DC pension schemes access to operational renewable energy infrastructure globally, targeting wind, solar, and storage assets.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-190", "Schroders Greencoat", "Greencoat Cornwall Gardens LP", "2022", "Undisclosed", null, "Core", "Deploying", {
    description: "Unlisted fund investing in operational UK renewable energy infrastructure, targeting wind and solar assets with long-term contracted or subsidized revenues.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
  }),
  f("FUND-191", "Schroders Greencoat", "Schroders Greencoat Wessex Gardens", "2023", "£330M", 429, "Core", "Deploying", {
    description: "Fund investing in UK operational renewable energy assets with focus on solar PV and onshore wind, targeting core returns with stable contracted cash flows.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
  }),

  // Stonepeak
  f("FUND-192", "Stonepeak", "Stonepeak Infrastructure Fund V", "2023", "$15.0B", 15000, "Value-Add", "Raising", {
    description: "Large-cap value-add fund investing in essential infrastructure across digital, energy and power, transportation, and water/waste sectors in North America and globally.",
    sectors: ["Digital Infrastructure", "Power Generation", "Transportation", "Water", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
  }),
  f("FUND-193", "Stonepeak", "Stonepeak Global Renewables Fund II", "2024", "$5.0B", 5000, "Core-Plus", "Raising", {
    description: "Dedicated global renewables fund investing in wind, solar, battery storage, and green hydrogen projects with development and operational capabilities.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    strategies: ["Core-Plus", "Greenfield"],
  }),
  f("FUND-194", "Stonepeak", "Stonepeak Asia Infrastructure Fund II", "2024", "$4.0B", 4000, "Value-Add", "Raising", {
    description: "Asia-Pacific infrastructure fund investing in digital, energy, transportation, and utilities assets across developed and emerging Asian markets.",
    sectors: ["Digital Infrastructure", "Power Generation", "Transportation", "Utilities"],
    regions: ["Asia-Pacific"],
  }),
  f("FUND-195", "Stonepeak", "Stonepeak Opportunities Fund", "2022", "$3.15B", 3150, "Value-Add", "Deploying", {
    description: "Opportunistic fund targeting complex infrastructure situations including distressed assets, special situations, and structured capital solutions across North America.",
    sectors: ["Power Generation", "Digital Infrastructure", "Transportation", "Midstream / Energy"],
    regions: ["North America"],
    strategies: ["Value-Add", "Opportunistic"],
  }),
  f("FUND-196", "Stonepeak", "Stonepeak Opportunities Fund II", "2024", "~$3.0B", 3000, "Value-Add", "Raising", {
    description: "Successor opportunistic fund continuing Stonepeak's strategy of investing in complex, special situation infrastructure opportunities across energy, digital, and transport.",
    sectors: ["Power Generation", "Digital Infrastructure", "Transportation"],
    regions: ["North America"],
    strategies: ["Value-Add", "Opportunistic"],
  }),
  f("FUND-197", "Stonepeak", "Stonepeak Core Fund", "2021", "$3.1B+", 3100, "Core", "Evergreen", {
    description: "Open-end core fund targeting essential infrastructure with long-term contracted or regulated revenue streams in digital, energy, and transportation assets.",
    sectors: ["Digital Infrastructure", "Power Generation", "Transportation", "Utilities"],
    regions: ["North America"],
    structure: "Open-End",
  }),

  // Swiss Life Asset Managers
  f("FUND-198", "Swiss Life Asset Managers", "Swiss Life Funds (LUX) Global Infrastructure Opportunities IV", "2024", "€2.5B", 2750, "Core-Plus", "Raising", {
    description: "Global core-plus infrastructure fund investing in essential mid-market assets across energy, transportation, digital, and social infrastructure in developed markets.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Digital Infrastructure", "Social Infrastructure"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-199", "Swiss Life Asset Managers", "Swiss Life Funds (LUX) ESG Global Infrastructure Opportunities Growth II", "2023", "€750M", 825, "Value-Add", "Deploying", {
    description: "Growth-oriented ESG infrastructure fund targeting smaller infrastructure businesses in energy transition, digital, and environmental services with high-growth potential.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
    strategies: ["Value-Add", "Growth"],
  }),
  f("FUND-200", "Swiss Life Asset Managers", "Fontavis ESG Renewable Infrastructure Fund II", "2022", "€750M", 825, "Core-Plus", "Deploying", {
    description: "European renewable energy fund investing in onshore wind, solar PV, and hydropower projects with a strong ESG framework and development-to-core approach.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe"],
  }),
  f("FUND-201", "Swiss Life Asset Managers", "Clean Energy Infrastructure Switzerland 3 (CEIS 3)", "2022", "CHF 1.0B+", 1120, "Core-Plus", "Deploying", {
    description: "Largest closed-end infrastructure vehicle in Switzerland, co-managed with UBS, investing in hydropower, solar, biomass, e-mobility, and district heating infrastructure supporting Switzerland's energy transition.",
    sectors: ["Renewables / Energy Transition", "Utilities", "Power Generation"],
    regions: ["Europe"],
  }),

  // Tallvine
  f("FUND-202", "Tallvine", "Tallvine Middle Market Infrastructure Fund I", "2024", "$1.5B", 1500, "Value-Add", "Raising", {
    description: "Debut fund from I Squared Capital spinout targeting operationally intensive, value-add investments in lower middle-market infrastructure across North America, with platforms in small-craft aviation, marine services, and data centers.",
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America"],
  }),

  // Temasek
  f("FUND-203", "Temasek", "GenZero", "2022", "SGD 5.0B", 3750, "Value-Add", "Evergreen", {
    description: "Temasek's dedicated decarbonization investment platform deploying capital into early-stage and growth climate technologies, clean energy, and sustainable solutions globally.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Waste / Environmental Services"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Tiger Infrastructure Partners
  f("FUND-204", "Tiger Infrastructure Partners", "Tiger Infrastructure Partners Fund IV", "2023", "$1.5B", 1500, "Value-Add", "Raising", {
    description: "Mid-market value-add fund investing in digital infrastructure, energy, and transportation assets across North America and Europe with hands-on platform building.",
    sectors: ["Digital Infrastructure", "Power Generation", "Transportation"],
    regions: ["North America", "Europe"],
  }),

  // TPG
  f("FUND-205", "TPG", "TPG Rise Climate II", "2023", "$10.0B", 10000, "Value-Add", "Deploying", {
    description: "Flagship climate fund investing in clean energy, decarbonization, and sustainable solutions companies globally, targeting both infrastructure and growth equity.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Transportation"],
    regions: ["Global"],
  }),
  f("FUND-206", "TPG", "TPG Rise Climate Transition Infrastructure (TRC TI)", "2024", "$6.0B", 6000, "Core-Plus", "Raising", {
    description: "Core-plus fund targeting operational and contracted clean energy infrastructure assets including solar, wind, storage, and grid infrastructure globally.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
  }),
  f("FUND-207", "TPG", "TPG Rise Climate Global South Initiative", "2024", "$2.5B", 2500, "Value-Add", "Raising", {
    description: "Emerging markets climate fund investing in renewable energy, clean transportation, and sustainable infrastructure in developing economies across Asia, Africa, and Latin America.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Power Generation"],
    regions: ["Asia-Pacific", "Middle East & Africa", "Latin America"],
  }),
  f("FUND-208", "TPG", "TPG Peppertree Capital Fund X", "2023", "$2.04B", 2040, "Value-Add", "Deploying", {
    description: "Specialized digital infrastructure fund investing in wireless communications towers, fiber networks, spectrum assets, small cells, and distributed antenna systems across the United States.",
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America"],
  }),

  // True Green Capital
  f("FUND-209", "True Green Capital", "True Green Capital Fund IV", "2022", "$661M", 661, "Value-Add", "Deploying", {
    description: "Renewable energy infrastructure fund investing in distributed commercial and industrial (C&I) solar, batteries, and microgrids across the US, UK, and EU with over 600 MW of operating distributed solar.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategies: ["Value-Add", "Greenfield"],
  }),
  f("FUND-210", "True Green Capital", "True Green Capital Fund V", "2025", "$500M+", 500, "Value-Add", "Raising", {
    description: "Successor fund continuing True Green's distributed C&I solar strategy, expanding into community solar and battery storage across the US and Europe.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategies: ["Value-Add", "Greenfield"],
  }),

  // Vauban Infrastructure Partners
  f("FUND-211", "Vauban Infrastructure Partners", "Core Infrastructure Fund IV (CIF IV)", "2024", "€2.2B", 2420, "Core", "Deploying", {
    description: "European core infrastructure fund investing in regulated and contracted essential assets in transportation, utilities, social infrastructure, and digital with long-term visibility.",
    sectors: ["Transportation", "Utilities", "Social Infrastructure", "Digital Infrastructure"],
    regions: ["Europe"],
  }),
  f("FUND-212", "Vauban Infrastructure Partners", "Core Infrastructure Fund V (CIF V)", "2025", "€2.5B – €3.0B", 2750, "Core", "Raising", {
    description: "Successor core fund continuing Vauban's strategy of investing in essential European infrastructure with availability-based or regulated revenue profiles.",
    sectors: ["Transportation", "Utilities", "Social Infrastructure", "Digital Infrastructure"],
    regions: ["Europe"],
  }),
  f("FUND-213", "Vauban Infrastructure Partners", "Value Add Transition Infrastructure Fund III (VATIF III)", "2025", "€1.0B", 1100, "Value-Add", "Raising", {
    description: "Value-add fund targeting energy transition infrastructure in Europe including renewable energy, grid modernization, and green mobility with development capabilities.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities"],
    regions: ["Europe"],
  }),

  // Vision Ridge Partners
  f("FUND-214", "Vision Ridge Partners", "Sustainable Asset Fund IV (SAF IV)", "2024", "$2.4B", 2400, "Value-Add", "Deploying", {
    description: "Sustainable real assets fund investing in utility-scale battery storage, clean mobility platforms, electric utilities, and agricultural decarbonization infrastructure globally, targeting 15-20% net IRR.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Power Generation"],
    regions: ["Global"],
  }),

  // Wafra
  f("FUND-215", "Wafra", "Wafra Real Assets & Infrastructure Fund II", "2022", "Undisclosed", null, "Core-Plus", "Deploying", {
    description: "Kuwait-backed infrastructure fund investing in aviation, digital infrastructure, marine/shipping, solar and battery storage, and logistics assets globally.",
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition", "Logistics"],
    regions: ["Global"],
  }),
  f("FUND-216", "Wafra", "Wafra Real Assets & Infrastructure Platform (SMA)", "1985", "Undisclosed", null, "Core", "Evergreen", {
    description: "Separately managed account platform providing permanent capital infrastructure exposure across aviation, digital infrastructure, shipping, renewable energy, and logistics for Kuwait's Public Institution for Social Security.",
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition", "Logistics"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Wren House Infrastructure
  f("FUND-217", "Wren House Infrastructure", "Wren House Infrastructure (Captive Platform)", "2013", "$10.0B+", 10000, "Core", "Evergreen", {
    description: "London-based captive infrastructure arm of Kuwait Investment Authority investing globally in airports, ports, water utilities, energy generation and transmission, midstream, and digital infrastructure with long-term hold mandates.",
    sectors: ["Transportation", "Utilities", "Power Generation", "Digital Infrastructure", "Midstream / Energy", "Water"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Sovereign Wealth Funds, Pension Funds & Other Institutional Investors ──

  // ADIA (Abu Dhabi Investment Authority)
  f("FUND-218", "ADIA (Abu Dhabi Investment Authority)", "ADIA Direct Infrastructure", "Evergreen", "N/A", null, "Core", "Evergreen", {
    description: "Abu Dhabi sovereign wealth fund's dedicated infrastructure department investing directly across four core sectors: utilities, energy, transport, and digital, supporting approximately 22 GW of renewable energy projects globally.",
    sectors: ["Utilities", "Midstream / Energy", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Ancala Partners
  f("FUND-219", "Ancala Partners", "Ancala Essential Growth Infrastructure Fund", "2023", "£551M", 700, "Growth", "Deploying", {
    description: "Continuation-style growth fund providing expansion capital to existing Ancala portfolio companies including Portsmouth Water, Biogen (biogas/gas-to-grid), and Leep Utilities (last-mile utility networks) in the UK.",
    sectors: ["Water", "Renewables / Energy Transition", "Utilities"],
    regions: ["Europe"],
  }),

  // APG Asset Management
  f("FUND-220", "APG Asset Management", "APG Direct Infrastructure Pool", "Evergreen", ">€33B", 36000, "Core", "Evergreen", {
    description: "Dutch pension fund manager's direct infrastructure investment program, one of the world's largest, investing in utilities, energy, and transportation assets globally.",
    sectors: ["Utilities", "Power Generation", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Apollo Global Management
  f("FUND-221", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund II", "2022", "$2.54B", 2540, "Value-Add", "Deploying", {
    description: "Value-add infrastructure fund investing in complex, capital-intensive energy, power, and utility assets across North America and Europe with operational turnaround capabilities.",
    sectors: ["Power Generation", "Utilities", "Midstream / Energy"],
    regions: ["North America", "Europe"],
  }),

  // BCI (British Columbia Investment Management Corp)
  f("FUND-222", "BCI (British Columbia Investment Management Corp)", "BCI Infrastructure & Renewable Resources Program", "2005", "~C$28B", 21000, "Core", "Evergreen", {
    description: "Canadian pension fund's infrastructure platform investing directly in essential assets across utilities, transportation, renewable energy, and timber/agriculture globally.",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Charlesbank Capital Partners
  f("FUND-223", "Charlesbank Capital Partners", "Charlesbank Technology Opportunities Fund", "2020", "~$5B", 5000, "Growth", "Deploying", {
    description: "Growth equity fund investing in technology-enabled infrastructure services including data centers, fiber, and managed IT services across North America.",
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America"],
  }),

  // AustralianSuper
  f("FUND-224", "AustralianSuper", "AustralianSuper Infrastructure Portfolio", "Evergreen", ">$30B", 30000, "Core", "Evergreen", {
    description: "Australia's largest pension fund's direct infrastructure program investing in essential assets globally including airports, toll roads, utilities, and renewable energy.",
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // CPP Investments
  f("FUND-225", "CPP Investments", "CPP Investments Infrastructure", "Evergreen", "~$60B", 60000, "Core", "Evergreen", {
    description: "Canada Pension Plan's infrastructure program, one of the world's largest direct investors, targeting essential utilities, transportation, energy, and renewables globally.",
    sectors: ["Utilities", "Transportation", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // IMCO
  f("FUND-226", "IMCO", "IMCO Infrastructure Fund", "Evergreen", "~$10B", 10000, "Core", "Evergreen", {
    description: "Ontario municipal employees' investment manager's infrastructure program investing in essential assets across transportation, utilities, and energy in developed markets.",
    sectors: ["Transportation", "Utilities", "Power Generation"],
    regions: ["North America", "Europe"],
    structure: "Permanent Capital",
  }),

  // Mubadala Investment Company
  f("FUND-227", "Mubadala Investment Company", "Mubadala Infrastructure", "Evergreen", "~$30B", 30000, "Core", "Evergreen", {
    description: "Abu Dhabi sovereign investor's infrastructure platform investing in utilities, digital infrastructure, power generation, and renewable energy across global markets.",
    sectors: ["Utilities", "Digital Infrastructure", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // OMERS Infrastructure
  f("FUND-228", "OMERS Infrastructure", "OMERS Infrastructure Fund", "Evergreen", "~$30B", 30000, "Core", "Evergreen", {
    description: "Ontario municipal employees' pension fund's infrastructure platform investing directly in essential infrastructure assets globally, including utilities, transportation, and energy.",
    sectors: ["Utilities", "Transportation", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Ontario Teachers' Pension Plan
  f("FUND-229", "Ontario Teachers' Pension Plan", "OTPP Infrastructure & Natural Resources", "Evergreen", "~$30B", 30000, "Core", "Evergreen", {
    description: "Canadian pension fund's direct infrastructure investment program targeting large-scale essential assets in utilities, energy, transportation, and water globally.",
    sectors: ["Utilities", "Power Generation", "Transportation", "Water"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Pantheon Ventures
  f("FUND-230", "Pantheon Ventures", "Pantheon Infrastructure Fund", "Various", "~$5B", 5000, "Core-Plus", "Deploying", {
    description: "London-listed closed-end investment company providing access to a globally diversified portfolio of infrastructure co-investments across digital, power, renewables, transport, and social infrastructure.",
    sectors: ["Digital Infrastructure", "Power Generation", "Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["Global"],
    structure: "Listed / Closed-End",
    ticker: "PINT.L",
    strategies: ["Core-Plus", "Co-Investments"],
  }),

  // Ridgemont Equity Partners
  f("FUND-231", "Ridgemont Equity Partners", "Ridgemont Infrastructure Fund", "Various", "~$2B", 2000, "Value-Add", "Deploying", {
    description: "Mid-market fund investing in essential infrastructure services companies in North America across power, utilities, and environmental services with operational improvement.",
    sectors: ["Power Generation", "Utilities", "Waste / Environmental Services"],
    regions: ["North America"],
  }),

  // Riverstone Holdings
  f("FUND-232", "Riverstone Holdings", "Riverstone Holdings Fund", "Various", "~$8B", 8000, "Value-Add", "Deploying", {
    description: "Energy-focused private equity firm investing in power generation, midstream, renewable energy, and energy transition infrastructure across North America and globally.",
    sectors: ["Power Generation", "Midstream / Energy", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
  }),

  // Sixth Street
  f("FUND-233", "Sixth Street", "Sixth Street Infrastructure Fund", "Various", "~$5B", 5000, "Value-Add", "Deploying", {
    description: "Global investment firm providing flexible capital across infrastructure, energy, and renewables sectors, with over 6 GW of renewable power invested and active in power, midstream, social infrastructure, and data centers.",
    sectors: ["Power Generation", "Renewables / Energy Transition", "Midstream / Energy", "Social Infrastructure", "Digital Infrastructure"],
    regions: ["Global"],
    strategies: ["Value-Add", "Credit / Debt"],
  }),

  // StepStone Group
  f("FUND-234", "StepStone Group", "StepStone Infrastructure Fund", "Various", "~$5B", 5000, "Core-Plus", "Deploying", {
    description: "Infrastructure fund-of-funds, secondaries, and co-investment platform providing diversified exposure to global infrastructure across strategies and sectors.",
    sectors: ["Transportation", "Utilities", "Power Generation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    strategies: ["Core-Plus", "Fund-of-Funds", "Secondaries", "Co-Investments"],
  }),

  // UBS Asset Management
  f("FUND-235", "UBS Asset Management", "UBS Infrastructure Fund", "Various", "~$5B", 5000, "Core", "Deploying", {
    description: "Open-end global infrastructure equity strategy investing in core/core-plus operational infrastructure assets across OECD countries in utilities, energy transition, telecommunications, transportation, and social infrastructure.",
    sectors: ["Utilities", "Renewables / Energy Transition", "Communications", "Transportation", "Social Infrastructure"],
    regions: ["Global"],
    structure: "Open-End",
  }),

  // GIC
  f("FUND-236", "GIC", "GIC Infrastructure", "Evergreen", ">$50B", 50000, "Core", "Evergreen", {
    description: "Singapore sovereign wealth fund's infrastructure program investing directly in utilities, digital infrastructure (including data center JVs), energy, and transport globally, with approximately $800 billion total fund AUM.",
    sectors: ["Digital Infrastructure", "Utilities", "Transportation", "Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),
];
