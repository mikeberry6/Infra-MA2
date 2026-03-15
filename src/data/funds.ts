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
): Fund {
  return {
    id,
    managerName,
    fundName,
    ticker: null,
    description: "",
    size,
    sizeUsdMm,
    vintage,
    strategies: [strategy],
    structure: status === "Evergreen" ? "Evergreen" as FundStructure : "Closed-End" as FundStructure,
    status,
    sectors: [],
    regions: [],
    portfolioCompanies: PORTFOLIO_DATA[id] ?? [],
  };
}

// ─── Fund Data ───────────────────────────────────────────────

export const funds: Fund[] = [
  // 3i Group
  f("FUND-001", "3i Group", "3i Infrastructure plc", "2007", "£3.8B", 4940, "Core-Plus", "Evergreen"),
  f("FUND-002", "3i Group", "3i North American Infrastructure Fund", "2022", "$739M", 739, "Core-Plus", "Deploying"),

  // Acadia Infrastructure Capital
  f("FUND-003", "Acadia Infrastructure Capital", "Acadia Infrastructure Capital LP", "2023", "$107M+", 107, "Value-Add", "Deploying"),
  f("FUND-004", "Acadia Infrastructure Capital", "Climate and Communities Investment Coalition", "2024", "$9.0B", 9000, "Core-Plus", "Deploying"),

  // Actis
  f("FUND-005", "Actis", "Actis Energy 6", "2025", "$6.0B", 6000, "Value-Add", "Deploying"),
  f("FUND-006", "Actis", "Actis Long Life Infrastructure Fund 2 (ALLIF2)", "2025", "$1.7B", 1700, "Core-Plus", "Deploying"),
  f("FUND-007", "Actis", "Actis Asia Climate Transition Fund", "2024", "$560M", 560, "Value-Add", "Deploying"),

  // Allianz Global Investors
  f("FUND-008", "Allianz Global Investors", "Allianz European Infrastructure Fund II (AEIF II)", "2021", "€880M+", 968, "Core", "Deploying"),

  // Amber Infrastructure
  f("FUND-009", "Amber Infrastructure", "International Public Partnerships (INPP)", "2006", "£3.0B+", 3900, "Core", "Evergreen"),
  f("FUND-010", "Amber Infrastructure", "US Solar Fund plc (USF)", "2019", "~$250M", 250, "Core", "Evergreen"),
  f("FUND-011", "Amber Infrastructure", "Amber & Partners Infrastructure New Zealand Fund", "2025", "Undisclosed", null, "Core-Plus", "Evergreen"),
  f("FUND-012", "Amber Infrastructure", "The Green New Deal Fund (GNDF)", "2021", "£18M", 23, "Value-Add", "Deploying"),
  f("FUND-013", "Amber Infrastructure", "Three Seas Initiative Investment Fund (3SIIF)", "2019", "€1.0B+", 1100, "Core-Plus", "Deploying"),

  // Ancala Partners
  f("FUND-014", "Ancala Partners", "Ancala Infrastructure Fund III", "2022", "€1.4B", 1540, "Core-Plus", "Deploying"),

  // Antin Infrastructure Partners
  f("FUND-015", "Antin Infrastructure Partners", "Flagship Fund V", "2022", "€10.2B", 11220, "Value-Add", "Deploying"),
  f("FUND-016", "Antin Infrastructure Partners", "Mid Cap Fund I", "2021", "€2.2B", 2420, "Value-Add", "Deploying"),
  f("FUND-017", "Antin Infrastructure Partners", "NextGen Fund I", "2021", "€1.2B", 1320, "Value-Add", "Deploying"),

  // Apollo Global Management
  f("FUND-018", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund III", "2022", "$2.4B", 2400, "Value-Add", "Deploying"),
  f("FUND-019", "Apollo Global Management", "Apollo Core Infrastructure Fund", "2022", "Undisclosed", null, "Core", "Deploying"),
  f("FUND-020", "Apollo Global Management", "Apollo Infrastructure Company LLC (AIC)", "2023", "~$1.7B", 1700, "Core-Plus", "Evergreen"),
  f("FUND-021", "Apollo Global Management", "Apollo Clean Transition Equity Partners II", "2023", "$411M+", 411, "Value-Add", "Deploying"),
  f("FUND-022", "Apollo Global Management", "Apollo Clean Transition Equity ELTIF", "2023", "Undisclosed", null, "Value-Add", "Evergreen"),

  // Ara Partners
  f("FUND-023", "Ara Partners", "Ara Infrastructure Fund I", "2022", "$800M", 800, "Value-Add", "Deploying"),
  f("FUND-024", "Ara Partners", "Ara Energy Decarbonization Fund I", "2024", "$1.5B", 1500, "Value-Add", "Deploying"),

  // ArcLight Capital
  f("FUND-025", "ArcLight Capital", "ArcLight Infrastructure Partners Fund VIII", "2023", "$3.0B", 3000, "Value-Add", "Deploying"),
  f("FUND-026", "ArcLight Capital", "ArcLight Power Infrastructure Partners", "2024", "$250M", 250, "Value-Add", "Deploying"),

  // Ardian
  f("FUND-027", "Ardian", "Ardian Infrastructure Fund VI", "2023", "€11.5B", 12650, "Core-Plus", "Deploying"),
  f("FUND-028", "Ardian", "Ardian Americas Infrastructure Fund V", "2022", "$2.1B", 2100, "Core-Plus", "Deploying"),
  f("FUND-029", "Ardian", "Ardian Clean Energy Evergreen Fund (ACEEF)", "2022", "€1.0B", 1100, "Core-Plus", "Evergreen"),

  // Ares Management
  f("FUND-030", "Ares Management", "Ares Climate Infrastructure Partners II", "2023", "$3.0B", 3000, "Value-Add", "Deploying"),
  f("FUND-031", "Ares Management", "Ares Japan DC Partners I (JDC I)", "2025", "$2.4B", 2400, "Value-Add", "Deploying"),
  f("FUND-032", "Ares Management", "Ares Core Infrastructure Fund (ACI)", "2024", "$3.9B", 3900, "Core", "Evergreen"),

  // Argo Infrastructure Partners
  f("FUND-033", "Argo Infrastructure Partners", "Argo Infrastructure Partners Series 4", "2024", "Undisclosed", null, "Core", "Deploying"),

  // Astatine Investment Partners
  f("FUND-034", "Astatine Investment Partners", "Astatine Infrastructure Fund IV", "2020", "$586M", 586, "Core-Plus", "Deploying"),

  // Asterion Industrial Partners
  f("FUND-035", "Asterion Industrial Partners", "Asterion Industrial Infra Fund III", "2024", "€3.4B", 3740, "Value-Add", "Deploying"),

  // Axium Infrastructure
  f("FUND-036", "Axium Infrastructure", "Axium Infrastructure Canada II L.P.", "2012", "C$1.14B+", 844, "Core", "Evergreen"),
  f("FUND-037", "Axium Infrastructure", "AxInfra US L.P.", "2013", "$3.53B", 3530, "Core", "Evergreen"),
  f("FUND-038", "Axium Infrastructure", "AxInfra US II L.P.", "2020", "$1.11B", 1110, "Core", "Evergreen"),
  f("FUND-039", "Axium Infrastructure", "AxInfra US III L.P.", "2021", "$1.78B", 1780, "Core", "Evergreen"),
  f("FUND-040", "Axium Infrastructure", "Axium Infrastructure NA IV L.P.", "2023", "$1.35B", 1350, "Core", "Evergreen"),
  f("FUND-041", "Axium Infrastructure", "Axium European Infrastructure Fund", "2022", "Undisclosed", null, "Core", "Evergreen"),

  // Basalt Infrastructure Partners
  f("FUND-042", "Basalt Infrastructure Partners", "Basalt Infrastructure Partners IV", "2023", "$4.0B", 4000, "Value-Add", "Deploying"),
  f("FUND-043", "Basalt Infrastructure Partners", "Basalt Infrastructure Partners V", "2025", "Undisclosed", null, "Value-Add", "Raising"),

  // Bernhard Capital Partners
  f("FUND-044", "Bernhard Capital Partners", "BCP Fund III", "2022", "$1.5B", 1500, "Value-Add", "Deploying"),
  f("FUND-045", "Bernhard Capital Partners", "BCP Infrastructure Fund II", "2024", "Undisclosed", null, "Core-Plus", "Deploying"),

  // BlackRock
  f("FUND-046", "BlackRock", "BlackRock Global Infrastructure Fund IV", "2022", "$6.1B", 6100, "Core-Plus", "Deploying"),
  f("FUND-047", "BlackRock", "BlackRock Global Renewable Power Fund IV (GRP IV)", "2023", "$7.0B", 7000, "Core-Plus", "Deploying"),
  f("FUND-048", "BlackRock", "BlackRock Evergreen Infra Partners Fund", "2022", "$1.0B+", 1000, "Core", "Evergreen"),

  // BlackRock (GIP)
  f("FUND-049", "BlackRock (GIP)", "Global Infrastructure Partners V (GIP V)", "2022", "$25.2B", 25200, "Core-Plus", "Deploying"),
  f("FUND-050", "BlackRock (GIP)", "GIP Mid-Market Fund V", "2025", "$7.0B", 7000, "Value-Add", "Deploying"),
  f("FUND-051", "BlackRock (GIP)", "GIP Emerging Markets Fund II", "2025", "$5.0B", 5000, "Value-Add", "Raising"),
  f("FUND-052", "BlackRock (GIP)", "GIP Australia Fund II", "2024", "A$4.0B", 2640, "Core-Plus", "Deploying"),
  f("FUND-053", "BlackRock (GIP)", "Global Infrastructure Partners Core Fund", "2022", "$5.0B", 5000, "Core", "Evergreen"),
  f("FUND-054", "BlackRock (GIP)", "AI Infrastructure Partnership (AIP)", "2024", "$30.0B", 30000, "Value-Add", "Deploying"),

  // Blackstone
  f("FUND-055", "Blackstone", "Blackstone Infrastructure Partners (BIP)", "2017", "~$51.0B", 51000, "Core-Plus", "Evergreen"),
  f("FUND-056", "Blackstone", "Blackstone Energy Transition Partners V", "2025", "Undisclosed", null, "Value-Add", "Raising"),
  f("FUND-057", "Blackstone", "Blackstone Energy Transition Partners IV", "2022", "$5.6B", 5600, "Value-Add", "Deploying"),

  // Brookfield Asset Management
  f("FUND-058", "Brookfield Asset Management", "Brookfield Infrastructure Fund V (BIF V)", "2022", "$30.0B", 30000, "Value-Add", "Deploying"),
  f("FUND-059", "Brookfield Asset Management", "Brookfield Super-Core Infrastructure Partners", "2018", "$15.5B", 15500, "Core", "Evergreen"),
  f("FUND-060", "Brookfield Asset Management", "Brookfield Global Transition Fund II (BGTF II)", "2024", "$23.5B", 23500, "Value-Add", "Deploying"),
  f("FUND-061", "Brookfield Asset Management", "Brookfield Catalytic Transition Fund", "2023", "$5.0B", 5000, "Value-Add", "Deploying"),
  f("FUND-062", "Brookfield Asset Management", "Brookfield Infrastructure Solutions (BISS I)", "2024", "$1.0B", 1000, "Value-Add", "Deploying"),
  f("FUND-063", "Brookfield Asset Management", "Brookfield Infrastructure Income Fund (BII)", "2023", "Undisclosed", null, "Core", "Evergreen"),

  // Carlyle Infrastructure
  f("FUND-064", "Carlyle Infrastructure", "Carlyle Global Infrastructure Opportunity Fund II", "2024", "$3.0B", 3000, "Value-Add", "Deploying"),
  f("FUND-065", "Carlyle Infrastructure", "Carlyle Renewable & Sustainable Energy Fund II", "2022", "$2.0B", 2000, "Value-Add", "Deploying"),

  // CBRE Investment Management
  f("FUND-066", "CBRE Investment Management", "CBRE Musselshell Infrastructure Investments", "2022", "$100M", 100, "Core-Plus", "Deploying"),

  // CIM Group
  f("FUND-067", "CIM Group", "CIM Infrastructure Fund III", "2021", "$1.76B", 1760, "Value-Add", "Deploying"),

  // Copenhagen Infrastructure Partners
  f("FUND-068", "Copenhagen Infrastructure Partners", "Copenhagen Infrastructure V (CI V)", "2023", "€12.0B", 13200, "Core-Plus", "Deploying"),
  f("FUND-069", "Copenhagen Infrastructure Partners", "CI Advanced Bioenergy Fund I (CI ABF I)", "2022", "€750M", 825, "Value-Add", "Deploying"),
  f("FUND-070", "Copenhagen Infrastructure Partners", "CI Advanced Bioenergy Fund II (CI ABF II)", "2025", "€1.5B", 1650, "Value-Add", "Raising"),

  // Cube Infrastructure Managers
  f("FUND-071", "Cube Infrastructure Managers", "Cube Infrastructure Fund III", "2021", "€1.35B", 1485, "Core-Plus", "Deploying"),
  f("FUND-072", "Cube Infrastructure Managers", "Cube Infrastructure Fund IV", "2025", "€1.5B", 1650, "Core-Plus", "Raising"),

  // CVC DIF
  f("FUND-073", "CVC DIF", "CVC DIF Infrastructure VIII", "2025", "€6.0B", 6600, "Core-Plus", "Raising"),
  f("FUND-074", "CVC DIF", "CVC DIF Value-Add IV", "2025", "€2.0B", 2200, "Value-Add", "Raising"),
  f("FUND-075", "CVC DIF", "DIF Infrastructure VII", "2022", "€4.40B", 4840, "Core", "Deploying"),
  f("FUND-076", "CVC DIF", "DIF Core-Plus Infrastructure Fund III (CIF III)", "2022", "€1.60B", 1760, "Core-Plus", "Deploying"),

  // DigitalBridge
  f("FUND-077", "DigitalBridge", "DigitalBridge Partners III", "2023", "$7.2B", 7200, "Value-Add", "Deploying"),
  f("FUND-078", "DigitalBridge", "DigitalBridge Strategic Asset Fund", "2022", "Undisclosed", null, "Core", "Evergreen"),
  f("FUND-079", "DigitalBridge", "DigitalBridge Emerging Market Digital Infrastructure", "2021", "Undisclosed", null, "Value-Add", "Deploying"),
  f("FUND-080", "DigitalBridge", "InfraBridge Global Infrastructure Fund III (GIF III)", "2023", "Undisclosed", null, "Value-Add", "Deploying"),

  // DWS Infrastructure
  f("FUND-081", "DWS Infrastructure", "Pan-European Infrastructure Fund IV", "2024", "€4.0B", 4400, "Core-Plus", "Deploying"),
  f("FUND-082", "DWS Infrastructure", "Sustainable Growth Infrastructure Fund", "2022", "Undisclosed", null, "Value-Add", "Deploying"),
  f("FUND-083", "DWS Infrastructure", "DWS Infrastruktur Europa", "2023", "€452M", 497, "Core", "Evergreen"),

  // EIG Global Energy Partners
  f("FUND-084", "EIG Global Energy Partners", "EIG Energy Fund XVIII", "2022", "$3.0B", 3000, "Value-Add", "Deploying"),

  // Ember Infrastructure
  f("FUND-085", "Ember Infrastructure", "Ember Infrastructure Fund II", "2024", "$831M", 831, "Value-Add", "Deploying"),

  // EnCap Investments
  f("FUND-086", "EnCap Investments", "EnCap Flatrock Midstream Fund V", "2023", "$1.0B", 1000, "Value-Add", "Deploying"),
  f("FUND-087", "EnCap Investments", "EnCap Energy Transition Fund II", "2023", "$1.5B", 1500, "Value-Add", "Deploying"),
  f("FUND-088", "EnCap Investments", "EnCap Energy Transition Fund III", "2025", "Undisclosed", null, "Value-Add", "Deploying"),

  // Energy Capital Partners
  f("FUND-089", "Energy Capital Partners", "Energy Capital Partners VI", "2024", "$5.0B", 5000, "Value-Add", "Deploying"),
  f("FUND-090", "Energy Capital Partners", "ECP Energy Transition Opportunities Fund", "2023", "Undisclosed", null, "Value-Add", "Deploying"),

  // Energy Infrastructure Partners
  f("FUND-091", "Energy Infrastructure Partners", "EIP I (Swiss Energy Infrastructure)", "2014", "CHF 1.7B+", 1904, "Core", "Evergreen"),
  f("FUND-092", "Energy Infrastructure Partners", "EIP III (Global Energy Transition Infrastructure)", "2022", "€1.5B", 1650, "Core-Plus", "Deploying"),

  // EQT Infrastructure
  f("FUND-093", "EQT Infrastructure", "EQT Infrastructure VI", "2023", "€21.5B", 23650, "Value-Add", "Deploying"),
  f("FUND-094", "EQT Infrastructure", "EQT Active Core Infrastructure I", "2022", "€2.9B", 3190, "Core", "Deploying"),
  f("FUND-095", "EQT Infrastructure", "EQT Transition Infrastructure", "2024", "€5.0B", 5500, "Value-Add", "Deploying"),

  // Equitix
  f("FUND-096", "Equitix", "Equitix Fund VII", "2024", "£1.5B", 1950, "Core", "Deploying"),
  f("FUND-097", "Equitix", "Equitix Euro Infrastructure Fund II", "2021", "€1.4B", 1540, "Core-Plus", "Deploying"),
  f("FUND-098", "Equitix", "Equitix UK Electricity Storage Fund", "2023", "£150M", 195, "Core-Plus", "Deploying"),

  // Fengate Asset Management
  f("FUND-099", "Fengate Asset Management", "Fengate Infrastructure Fund IV", "2021", "$1.1B", 1100, "Value-Add", "Deploying"),
  f("FUND-100", "Fengate Asset Management", "Fengate Infrastructure Yield Fund", "2019", "$1.22B", 1220, "Core", "Evergreen"),

  // Generate Capital
  f("FUND-101", "Generate Capital", "Generate Capital (Permanent Capital Vehicle)", "2014", ">$14.0B", 14000, "Core-Plus", "Evergreen"),
  f("FUND-102", "Generate Capital", "Generate Capital Sustainable Infrastructure Fund", "2024", "$1.5B", 1500, "Value-Add", "Deploying"),

  // Goldman Sachs Asset Management
  f("FUND-103", "Goldman Sachs Asset Management", "West Street Infrastructure Partners V (WSIP V)", "2025", "$4.0B", 4000, "Value-Add", "Raising"),
  f("FUND-104", "Goldman Sachs Asset Management", "West Street Infrastructure Partners IV (WSIP IV)", "2023", "$4.0B", 4000, "Value-Add", "Deploying"),
  f("FUND-105", "Goldman Sachs Asset Management", "West Street Private Infrastructure Fund (G-INFRA)", "2023", "Undisclosed", null, "Core-Plus", "Evergreen"),

  // Harbert Management Corp
  f("FUND-106", "Harbert Management Corp", "Harbert Infrastructure Fund VI", "2022", "$905M", 905, "Value-Add", "Deploying"),

  // Harrison Street
  f("FUND-107", "Harrison Street", "Harrison Street Social Infrastructure Fund", "2018", "$5.2B+", 5200, "Core-Plus", "Evergreen"),
  f("FUND-108", "Harrison Street", "Harrison Street Energy Transition Fund", "2023", "$750M", 750, "Value-Add", "Deploying"),
  f("FUND-109", "Harrison Street", "Harrison Street Digital Fund", "2024", "$600M", 600, "Value-Add", "Deploying"),

  // H.I.G. Capital
  f("FUND-110", "H.I.G. Capital", "H.I.G. Infrastructure Partners Fund I", "2022", "$1.3B", 1300, "Value-Add", "Deploying"),

  // I Squared Capital
  f("FUND-111", "I Squared Capital", "ISQ Global Infrastructure Fund IV", "2024", "$15.0B", 15000, "Value-Add", "Deploying"),
  f("FUND-112", "I Squared Capital", "ISQ Energy Transition Infrastructure Fund", "2023", "$2.0B", 2000, "Value-Add", "Deploying"),

  // iCON Infrastructure
  f("FUND-113", "iCON Infrastructure", "iCON Infrastructure Partners VII", "2024", "$3.7B", 3700, "Core-Plus", "Deploying"),

  // IFM Investors
  f("FUND-114", "IFM Investors", "IFM Global Infrastructure Fund (GIF)", "2004", ">$73.0B", 73000, "Core", "Evergreen"),
  f("FUND-115", "IFM Investors", "IFM Australian Infrastructure Fund (AIF)", "1995", "~$8.7B", 8700, "Core", "Evergreen"),
  f("FUND-116", "IFM Investors", "IFM Net Zero Infrastructure Fund (NZIF)", "2022", "$3.0B", 3000, "Core-Plus", "Evergreen"),
  f("FUND-117", "IFM Investors", "IFM Global Value Add Infrastructure Fund", "2025", "$3.0B", 3000, "Value-Add", "Deploying"),

  // Igneo Infrastructure Partners
  f("FUND-118", "Igneo Infrastructure Partners", "European Diversified Infrastructure Fund III (EDIF III)", "2020", "€5.3B", 5830, "Core-Plus", "Deploying"),
  f("FUND-119", "Igneo Infrastructure Partners", "European Diversified Infrastructure Fund IV (EDIF IV)", "2025", "€4.0B", 4400, "Core-Plus", "Raising"),
  f("FUND-120", "Igneo Infrastructure Partners", "Global Diversified Infrastructure Fund (GDIF)", "N/A", "~$7.5B", 7500, "Core-Plus", "Evergreen"),
  f("FUND-121", "Igneo Infrastructure Partners", "North American Diversified Infrastructure Fund (NADIF)", "2024", "$1.0B", 1000, "Core-Plus", "Evergreen"),
  f("FUND-122", "Igneo Infrastructure Partners", "Australian Diversified Infrastructure Fund (ADIF)", "2003", "A$1.0B+", 660, "Core-Plus", "Evergreen"),

  // InfraRed Capital Partners
  f("FUND-123", "InfraRed Capital Partners", "InfraRed Infrastructure Fund VI", "2022", "$1.0B+", 1000, "Value-Add", "Deploying"),
  f("FUND-124", "InfraRed Capital Partners", "InfraRed Infrastructure Fund VII", "2025", "$1.5B", 1500, "Value-Add", "Raising"),
  f("FUND-125", "InfraRed Capital Partners", "HICL Infrastructure PLC", "2006", "~£3.0B", 3900, "Core", "Evergreen"),
  f("FUND-126", "InfraRed Capital Partners", "The Renewables Infrastructure Group (TRIG)", "2013", "~£1.9B", 2470, "Core-Plus", "Evergreen"),
  f("FUND-127", "InfraRed Capital Partners", "North American Core Income Energy Transition Fund", "2023", "$900M", 900, "Core-Plus", "Evergreen"),

  // InfraVia Capital Partners
  f("FUND-128", "InfraVia Capital Partners", "InfraVia European Fund VI", "2024", "€8.0B", 8800, "Core-Plus", "Deploying"),

  // Infratil
  f("FUND-129", "Infratil", "Infratil Limited", "1994", "$12.2B", 12200, "Core-Plus", "Evergreen"),

  // J.P. Morgan Asset Management
  f("FUND-130", "J.P. Morgan Asset Management", "Infrastructure Investments Fund (IIF)", "2006", "~$40.0B", 40000, "Core", "Evergreen"),
  f("FUND-131", "J.P. Morgan Asset Management", "Global Transport Income Fund (GTIF)", "2018", "$4.1B", 4100, "Core-Plus", "Evergreen"),

  // Kimmeridge Energy
  f("FUND-132", "Kimmeridge Energy", "Kimmeridge Carbon Solutions Fund II", "2024", "Undisclosed", null, "Value-Add", "Deploying"),

  // KKR
  f("FUND-133", "KKR", "KKR Global Infrastructure Investors V", "2023", "$20.0B", 20000, "Value-Add", "Deploying"),
  f("FUND-134", "KKR", "KKR Asia Pacific Infrastructure Investors II", "2023", "$6.4B", 6400, "Value-Add", "Deploying"),
  f("FUND-135", "KKR", "KKR Asia Pacific Infrastructure Investors III", "2025", ">$6.4B", 6400, "Value-Add", "Deploying"),
  f("FUND-136", "KKR", "Diversified Core Infra Fund (DCIF)", "2020", "~$11.0B+", 11000, "Core", "Evergreen"),
  f("FUND-137", "KKR", "Global Climate Transition Fund", "2023", "$7.0B", 7000, "Value-Add", "Deploying"),
  f("FUND-138", "KKR", "Asia Climate Fund", "2024", "$1.0B", 1000, "Value-Add", "Deploying"),
  f("FUND-139", "KKR", "KKR Infrastructure Fund (K-INFRA)", "2023", "Undisclosed", null, "Core-Plus", "Evergreen"),

  // Macquarie Asset Management
  f("FUND-140", "Macquarie Asset Management", "Macquarie European Infrastructure Fund 7 (MEIF 7)", "2024", "€8.0B", 8800, "Core-Plus", "Deploying"),
  f("FUND-141", "Macquarie Asset Management", "Macquarie Infrastructure Partners VI (MIP VI)", "2024", "$6.8B", 6800, "Core-Plus", "Deploying"),
  f("FUND-142", "Macquarie Asset Management", "Macquarie Infrastructure Partners VII (MIP VII)", "2025", "$7.0B", 7000, "Core-Plus", "Deploying"),
  f("FUND-143", "Macquarie Asset Management", "Macquarie Asia-Pacific Infrastructure Fund 3 (MAIF 3)", "2022", "$4.2B", 4200, "Core-Plus", "Deploying"),
  f("FUND-144", "Macquarie Asset Management", "Macquarie Asia-Pacific Infrastructure Fund 4 (MAIF 4)", "2024", "Undisclosed", null, "Core-Plus", "Deploying"),
  f("FUND-145", "Macquarie Asset Management", "Macquarie Super Core Infrastructure Fund (MSCIF)", "2018", "€12.6B", 13860, "Core", "Evergreen"),
  f("FUND-146", "Macquarie Asset Management", "Macquarie Global Infrastructure Fund (MGIF)", "2021", "$3.0B", 3000, "Core", "Evergreen"),
  f("FUND-147", "Macquarie Asset Management", "Macquarie Green Energy Transition Solutions (MGETS)", "2022", "$2.4B", 2400, "Value-Add", "Deploying"),
  f("FUND-148", "Macquarie Asset Management", "Macquarie Green Energy and Climate Opportunities Fund", "2024", "Undisclosed", null, "Core-Plus", "Evergreen"),
  f("FUND-149", "Macquarie Asset Management", "Macquarie Private Infrastructure Fund (MPIF)", "2021", "$897.1M", 897, "Core-Plus", "Evergreen"),
  f("FUND-150", "Macquarie Asset Management", "Macquarie Energy Transition Infrastructure Fund (METI)", "2024", "$1.0B", 1000, "Value-Add", "Deploying"),

  // MEAG
  f("FUND-151", "MEAG", "MEAG European Infrastructure One SCSp (MEIO)", "2022", "€600M", 660, "Core-Plus", "Deploying"),
  f("FUND-152", "MEAG", "MEAG Volante DC Investor SCSp", "2025", "Undisclosed", null, "Core-Plus", "Deploying"),

  // Meridiam
  f("FUND-153", "Meridiam", "Meridiam Sustainable Infrastructure Europe IV", "2021", "€2.3B", 2530, "Value-Add", "Deploying"),
  f("FUND-154", "Meridiam", "Meridiam Infrastructure North America IV", "2023", "$1.8B", 1800, "Value-Add", "Deploying"),
  f("FUND-155", "Meridiam", "Meridiam Sustainable Infrastructure Europe V", "2025", "€3.0B", 3300, "Value-Add", "Raising"),
  f("FUND-156", "Meridiam", "Meridiam Infrastructure Agri Transition", "2025", "€500M", 550, "Value-Add", "Deploying"),
  f("FUND-157", "Meridiam", "Meridiam Infrastructure Africa Fund II (MIAF II)", "2021", "€750M", 825, "Value-Add", "Deploying"),
  f("FUND-158", "Meridiam", "The Urban Resilience Fund (TURF)", "2021", "€350M", 385, "Value-Add", "Deploying"),

  // Mirova
  f("FUND-159", "Mirova", "Mirova Energy Transition 6 (MET6)", "2023", "€2.0B", 2200, "Value-Add", "Deploying"),

  // Morgan Stanley Infrastructure
  f("FUND-160", "Morgan Stanley Infrastructure", "North Haven Infrastructure Partners IV", "2022", "$4.1B", 4100, "Value-Add", "Deploying"),

  // Northleaf Capital Partners
  f("FUND-161", "Northleaf Capital Partners", "Northleaf Infrastructure Capital Partners IV (NICP IV)", "2023", "$2.6B", 2600, "Core-Plus", "Deploying"),
  f("FUND-162", "Northleaf Capital Partners", "Northleaf Essential Infrastructure Fund (NEIF)", "2021", "$800M", 800, "Core", "Evergreen"),

  // NOVA Infrastructure
  f("FUND-163", "NOVA Infrastructure", "NOVA Infrastructure Fund II", "2024", "$1.0B", 1000, "Value-Add", "Deploying"),

  // Nuveen Infrastructure
  f("FUND-164", "Nuveen Infrastructure", "Nuveen Clean Energy Strategy IV", "2021", "€1.9B", 2090, "Value-Add", "Deploying"),
  f("FUND-165", "Nuveen Infrastructure", "Nuveen European Core Renewable Infrastructure (NECRI)", "2022", "€700M", 770, "Core", "Evergreen"),

  // Oaktree Capital
  f("FUND-166", "Oaktree Capital", "Oaktree Power Opportunities Fund VII", "2024", "$2.5B", 2500, "Value-Add", "Deploying"),
  f("FUND-167", "Oaktree Capital", "Oaktree Transportation Infrastructure Capital Partners", "2022", "$3.0B", 3000, "Core-Plus", "Evergreen"),

  // Partners Group
  f("FUND-168", "Partners Group", "Partners Group Direct Infrastructure IV", "2023", "Undisclosed", null, "Value-Add", "Deploying"),
  f("FUND-169", "Partners Group", "Partners Group Next Generation Infrastructure Programs", "2019", "$1.0B", 1000, "Core-Plus", "Evergreen"),

  // Patria Investments
  f("FUND-170", "Patria Investments", "Patria Infrastructure Fund V", "2023", "$2.9B", 2900, "Value-Add", "Deploying"),
  f("FUND-171", "Patria Investments", "Patria Infrastructure Core Fund (PIER)", "2021", "~$1.0B", 1000, "Core", "Evergreen"),

  // Patrizia
  f("FUND-172", "Patrizia", "Patrizia European Infrastructure Fund III", "2023", "€1.5B", 1650, "Core-Plus", "Raising"),
  f("FUND-173", "Patrizia", "APAC Sustainable Infrastructure Fund (A-SIF)", "2022", "$130M", 130, "Value-Add", "Deploying"),
  f("FUND-174", "Patrizia", "Emerging Asia Sustainable Infrastructure Fund (ESIF)", "2025", "$500M", 500, "Value-Add", "Deploying"),
  f("FUND-175", "Patrizia", "PATRIZIA Infrastructure Invest ELTIF", "2024", "Undisclosed", null, "Core-Plus", "Evergreen"),
  f("FUND-176", "Patrizia", "PATRIZIA Low Carbon Core Infrastructure Fund", "2019", "Undisclosed", null, "Core", "Evergreen"),

  // PSP Investments
  f("FUND-177", "PSP Investments", "Canada Growth Fund", "2023", "C$15.0B", 11100, "Value-Add", "Deploying"),

  // QIC Global Infrastructure
  f("FUND-178", "QIC Global Infrastructure", "QIC Global Infrastructure Fund II (QGIF II)", "2023", "US$2.0B", 2000, "Core-Plus", "Deploying"),
  f("FUND-179", "QIC Global Infrastructure", "QIC Infrastructure Portfolio (QIP)", "2006", "Undisclosed", null, "Core", "Evergreen"),
  f("FUND-180", "QIC Global Infrastructure", "Queensland Critical Minerals and Battery Technology Fund", "2023", "A$100M", 66, "Value-Add", "Deploying"),

  // Quinbrook Infrastructure
  f("FUND-181", "Quinbrook Infrastructure", "Quinbrook Net Zero Power Fund", "2021", "$3.0B", 3000, "Value-Add", "Deploying"),
  f("FUND-182", "Quinbrook Infrastructure", "Quinbrook Renewables Impact Fund II", "2024", "£500M", 650, "Value-Add", "Raising"),
  f("FUND-183", "Quinbrook Infrastructure", "Quinbrook Critical Resources Strategy", "2024", "Undisclosed", null, "Value-Add", "Deploying"),

  // Ridgewood Infrastructure
  f("FUND-184", "Ridgewood Infrastructure", "Ridgewood Water & Strategic Infrastructure Fund II", "2022", "US$1.2B", 1200, "Value-Add", "Deploying"),

  // Schroders Greencoat
  f("FUND-185", "Schroders Greencoat", "Greencoat UK Wind PLC", "2013", "£3.5B+", 4550, "Core", "Evergreen"),
  f("FUND-186", "Schroders Greencoat", "Greencoat Renewables PLC", "2017", "€1.2B+", 1320, "Core", "Evergreen"),
  f("FUND-187", "Schroders Greencoat", "Greencoat Renewable Income LP (GRI)", "2020", "£1.35B", 1755, "Core-Plus", "Deploying"),
  f("FUND-188", "Schroders Greencoat", "Schroders Capital Semi-Liquid Global Energy Infrastructure", "2023", "€2.5B+", 2750, "Core-Plus", "Evergreen"),
  f("FUND-189", "Schroders Greencoat", "Schroders Greencoat Global Renewables+ LTAF", "2024", "Undisclosed", null, "Core-Plus", "Deploying"),
  f("FUND-190", "Schroders Greencoat", "Greencoat Cornwall Gardens LP", "2022", "Undisclosed", null, "Core", "Deploying"),
  f("FUND-191", "Schroders Greencoat", "Schroders Greencoat Wessex Gardens", "2023", "£330M", 429, "Core", "Deploying"),

  // Stonepeak
  f("FUND-192", "Stonepeak", "Stonepeak Infrastructure Fund V", "2023", "$15.0B", 15000, "Value-Add", "Raising"),
  f("FUND-193", "Stonepeak", "Stonepeak Global Renewables Fund II", "2024", "$5.0B", 5000, "Core-Plus", "Raising"),
  f("FUND-194", "Stonepeak", "Stonepeak Asia Infrastructure Fund II", "2024", "$4.0B", 4000, "Value-Add", "Raising"),
  f("FUND-195", "Stonepeak", "Stonepeak Opportunities Fund", "2022", "$3.15B", 3150, "Value-Add", "Deploying"),
  f("FUND-196", "Stonepeak", "Stonepeak Opportunities Fund II", "2024", "~$3.0B", 3000, "Value-Add", "Raising"),
  f("FUND-197", "Stonepeak", "Stonepeak Core Fund", "2021", "$3.1B+", 3100, "Core", "Evergreen"),

  // Swiss Life Asset Managers
  f("FUND-198", "Swiss Life Asset Managers", "Swiss Life Funds (LUX) Global Infrastructure Opportunities IV", "2024", "€2.5B", 2750, "Core-Plus", "Raising"),
  f("FUND-199", "Swiss Life Asset Managers", "Swiss Life Funds (LUX) ESG Global Infrastructure Opportunities Growth II", "2023", "€750M", 825, "Value-Add", "Deploying"),
  f("FUND-200", "Swiss Life Asset Managers", "Fontavis ESG Renewable Infrastructure Fund II", "2022", "€750M", 825, "Core-Plus", "Deploying"),
  f("FUND-201", "Swiss Life Asset Managers", "Clean Energy Infrastructure Switzerland 3 (CEIS 3)", "2022", "CHF 1.0B+", 1120, "Core-Plus", "Deploying"),

  // Tallvine
  f("FUND-202", "Tallvine", "Tallvine Middle Market Infrastructure Fund I", "2024", "$1.5B", 1500, "Value-Add", "Raising"),

  // Temasek
  f("FUND-203", "Temasek", "GenZero", "2022", "SGD 5.0B", 3750, "Value-Add", "Evergreen"),

  // Tiger Infrastructure Partners
  f("FUND-204", "Tiger Infrastructure Partners", "Tiger Infrastructure Partners Fund IV", "2023", "$1.5B", 1500, "Value-Add", "Raising"),

  // TPG
  f("FUND-205", "TPG", "TPG Rise Climate II", "2023", "$10.0B", 10000, "Value-Add", "Deploying"),
  f("FUND-206", "TPG", "TPG Rise Climate Transition Infrastructure (TRC TI)", "2024", "$6.0B", 6000, "Core-Plus", "Raising"),
  f("FUND-207", "TPG", "TPG Rise Climate Global South Initiative", "2024", "$2.5B", 2500, "Value-Add", "Raising"),
  f("FUND-208", "TPG", "TPG Peppertree Capital Fund X", "2023", "$2.04B", 2040, "Value-Add", "Deploying"),

  // True Green Capital
  f("FUND-209", "True Green Capital", "True Green Capital Fund IV", "2022", "$661M", 661, "Value-Add", "Deploying"),
  f("FUND-210", "True Green Capital", "True Green Capital Fund V", "2025", "$500M+", 500, "Value-Add", "Raising"),

  // Vauban Infrastructure Partners
  f("FUND-211", "Vauban Infrastructure Partners", "Core Infrastructure Fund IV (CIF IV)", "2024", "€2.2B", 2420, "Core", "Deploying"),
  f("FUND-212", "Vauban Infrastructure Partners", "Core Infrastructure Fund V (CIF V)", "2025", "€2.5B – €3.0B", 2750, "Core", "Raising"),
  f("FUND-213", "Vauban Infrastructure Partners", "Value Add Transition Infrastructure Fund III (VATIF III)", "2025", "€1.0B", 1100, "Value-Add", "Raising"),

  // Vision Ridge Partners
  f("FUND-214", "Vision Ridge Partners", "Sustainable Asset Fund IV (SAF IV)", "2024", "$2.4B", 2400, "Value-Add", "Deploying"),

  // Wafra
  f("FUND-215", "Wafra", "Wafra Real Assets & Infrastructure Fund II", "2022", "Undisclosed", null, "Core-Plus", "Deploying"),
  f("FUND-216", "Wafra", "Wafra Real Assets & Infrastructure Platform (SMA)", "1985", "Undisclosed", null, "Core", "Evergreen"),

  // Wren House Infrastructure
  f("FUND-217", "Wren House Infrastructure", "Wren House Infrastructure (Captive Platform)", "2013", "$10.0B+", 10000, "Core", "Evergreen"),

  // ── Sovereign Wealth Funds, Pension Funds & Other Institutional Investors ──

  // ADIA (Abu Dhabi Investment Authority)
  f("FUND-218", "ADIA (Abu Dhabi Investment Authority)", "ADIA Direct Infrastructure", "Evergreen", "N/A", null, "Core", "Evergreen"),

  // Ancala Partners
  f("FUND-219", "Ancala Partners", "Ancala Essential Growth Infrastructure Fund", "2023", "£551M", 700, "Growth", "Deploying"),

  // APG Asset Management
  f("FUND-220", "APG Asset Management", "APG Direct Infrastructure Pool", "Evergreen", ">€33B", 36000, "Core", "Evergreen"),

  // Apollo Global Management
  f("FUND-221", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund II", "2022", "$2.54B", 2540, "Value-Add", "Deploying"),

  // BCI (British Columbia Investment Management Corp)
  f("FUND-222", "BCI (British Columbia Investment Management Corp)", "BCI Infrastructure & Renewable Resources Program", "2005", "~C$28B", 21000, "Core", "Evergreen"),

  // Charlesbank Capital Partners
  f("FUND-223", "Charlesbank Capital Partners", "Charlesbank Technology Opportunities Fund", "2020", "~$5B", 5000, "Growth", "Deploying"),

  // AustralianSuper
  f("FUND-224", "AustralianSuper", "AustralianSuper Infrastructure Portfolio", "Evergreen", ">$30B", 30000, "Core", "Evergreen"),

  // CPP Investments
  f("FUND-225", "CPP Investments", "CPP Investments Infrastructure", "Evergreen", "~$60B", 60000, "Core", "Evergreen"),

  // IMCO
  f("FUND-226", "IMCO", "IMCO Infrastructure Fund", "Evergreen", "~$10B", 10000, "Core", "Evergreen"),

  // Mubadala Investment Company
  f("FUND-227", "Mubadala Investment Company", "Mubadala Infrastructure", "Evergreen", "~$30B", 30000, "Core", "Evergreen"),

  // OMERS Infrastructure
  f("FUND-228", "OMERS Infrastructure", "OMERS Infrastructure Fund", "Evergreen", "~$30B", 30000, "Core", "Evergreen"),

  // Ontario Teachers' Pension Plan
  f("FUND-229", "Ontario Teachers' Pension Plan", "OTPP Infrastructure & Natural Resources", "Evergreen", "~$30B", 30000, "Core", "Evergreen"),

  // Pantheon Ventures
  f("FUND-230", "Pantheon Ventures", "Pantheon Infrastructure Fund", "Various", "~$5B", 5000, "Core-Plus", "Deploying"),

  // Ridgemont Equity Partners
  f("FUND-231", "Ridgemont Equity Partners", "Ridgemont Infrastructure Fund", "Various", "~$2B", 2000, "Value-Add", "Deploying"),

  // Riverstone Holdings
  f("FUND-232", "Riverstone Holdings", "Riverstone Holdings Fund", "Various", "~$8B", 8000, "Value-Add", "Deploying"),

  // Sixth Street
  f("FUND-233", "Sixth Street", "Sixth Street Infrastructure Fund", "Various", "~$5B", 5000, "Value-Add", "Deploying"),

  // StepStone Group
  f("FUND-234", "StepStone Group", "StepStone Infrastructure Fund", "Various", "~$5B", 5000, "Core-Plus", "Deploying"),

  // UBS Asset Management
  f("FUND-235", "UBS Asset Management", "UBS Infrastructure Fund", "Various", "~$5B", 5000, "Core", "Deploying"),

  // GIC
  f("FUND-236", "GIC", "GIC Infrastructure", "Evergreen", ">$50B", 50000, "Core", "Evergreen"),
];
