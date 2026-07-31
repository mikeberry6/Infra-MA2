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

export type FundStatus = "Evergreen" | "Financial Close" | "Raising";

export type FundSizeBasis =
  | "TARGET"
  | "AMOUNT_SOLD"
  | "FIRST_CLOSE"
  | "FINAL_CLOSE"
  | "AUM"
  | "COMMITMENTS";

export type FundSector =
  | "Power & ET"
  | "Utilities"
  | "Digital"
  | "Midstream"
  | "Transportation"
  | "Social Infra";

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

// ─── Portfolio Company Interfaces ────────────────────────────

export interface PortfolioFinancials {
  enterpriseValue?: string;
  enterpriseValueUsdMm?: number;
  equityValue?: string;
  equityValueUsdMm?: number;
  revenue?: string;
  revenueUsdMm?: number;
  ebitda?: string;
  ebitdaUsdMm?: number;
  acquisitionYear?: number;
  acquisitionMultiple?: string;
  ownershipStake?: string;
  asOfDate?: string;
}

export interface PortfolioCompany {
  name: string;
  sector: FundSector;
  subsector?: string;
  region: FundRegion;
  country: string;
  description?: string;
  coInvestors?: string[];
  sourceUrls?: string[];
  financials?: PortfolioFinancials;
}

// ─── Fund Interface ──────────────────────────────────────────

export interface Fund {
  id: string;
  managerName: string;
  fundName: string;
  ticker: string | null;
  investmentStrategy: string;
  sourceUrls: string[];
  size: string;
  sizeUsdMm: number | null;
  sizeNativeCurrency?: string | null;
  sizeNativeAmount?: string | null;
  sizeBasis?: FundSizeBasis | null;
  sizeAsOf?: string | null;
  sizeUsdFxRate?: string | null;
  sizeUsdFxDate?: string | null;
  vintage: string;
  strategies: FundStrategy[];
  structure: FundStructure;
  status: FundStatus;
  sectors: FundSector[];
  regions: FundRegion[];
  portfolioCompanies: PortfolioCompany[];
  strategyUrl: string;
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
  "Financial Close",
  "Raising",
];

export const FUND_SECTORS: FundSector[] = [
  "Power & ET",
  "Utilities",
  "Digital",
  "Midstream",
  "Transportation",
  "Social Infra",
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
  "Financial Close": "#3b82f6",
  "Raising": "#f59e0b",
};

const FUND_SECTOR_COLORS: Record<FundSector, string> = {
  "Power & ET": "#f59e0b",
  "Utilities": "#06b6d4",
  "Digital": "#3b82f6",
  "Midstream": "#f97316",
  "Transportation": "#8b5cf6",
  "Social Infra": "#ec4899",
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

export function getStrategyColor(strategy: string): string {
  return STRATEGY_COLORS[strategy as FundStrategy] ?? "#a1a1aa";
}

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status as FundStatus] ?? "#a1a1aa";
}

export function getFundSectorColor(sector: string): string {
  return FUND_SECTOR_COLORS[sector as FundSector] ?? "#a1a1aa";
}

export function getFundRegionColor(region: string): string {
  return FUND_REGION_COLORS[region as FundRegion] ?? "#a1a1aa";
}

export function getStructureColor(structure: string): string {
  return STRUCTURE_COLORS[structure as FundStructure] ?? "#a1a1aa";
}

export function getSizeRangeColor(): string {
  return "#a78bfa";
}

// ─── Size Range Filter Logic ─────────────────────────────────

export function matchesSizeRange(sizeUsdMm: number | null, range: string): boolean {
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

export function groupFundsByManager<T extends { managerName: string }>(fundList: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
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

export function getFundStats(fundList: { managerName: string; sizeUsdMm: number | null }[]) {
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

// ─── Version-Controlled Fund Manifest ───────────────────────

import fundManifest from "./funds.manifest.json" with { type: "json" };

// The JSON manifest is the reviewed desired-state and disaster-recovery record.
// Prisma remains the operational source used by the application.
export const funds: Fund[] = fundManifest.funds as Fund[];

// ─── Build-Time Data Validation ─────────────────────────────

function normalizeFundIdentity(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function validateFundData(): string[] {
  const errors: string[] = [];
  const idSet = new Set<string>();
  const identitySet = new Set<string>();

  if (fundManifest.schemaVersion !== 1) {
    errors.push(`Unsupported fund manifest schema version: ${fundManifest.schemaVersion}`);
  }

  for (const fund of funds) {
    if (idSet.has(fund.id)) errors.push(`Duplicate ID: ${fund.id}`);
    idSet.add(fund.id);

    const identity = `${normalizeFundIdentity(fund.managerName)}::${normalizeFundIdentity(fund.fundName)}`;
    if (identitySet.has(identity)) errors.push(`Duplicate normalized identity: ${fund.managerName} / ${fund.fundName}`);
    identitySet.add(identity);

    if (!fund.managerName) errors.push(`${fund.id}: missing managerName`);
    if (!fund.fundName) errors.push(`${fund.id}: missing fundName`);
    // The strict refresh audit reports legacy "Raising" placeholders as a
    // baseline reconciliation blocker. Keep the general seed validator
    // backward-compatible until those records are reviewed individually.
    if (!fund.vintage || !(fund.vintage === "Evergreen" || fund.vintage === "Raising" || /^\d{4}$/.test(fund.vintage))) {
      errors.push(`${fund.id}: invalid vintage ${fund.vintage}`);
    }
    if (fund.strategies.length === 0) errors.push(`${fund.id}: no strategies`);
    if (fund.sizeUsdMm !== null && (!Number.isFinite(fund.sizeUsdMm) || fund.sizeUsdMm < 0)) {
      errors.push(`${fund.id}: sizeUsdMm must be nonnegative`);
    }
    if (!fund.investmentStrategy) errors.push(`${fund.id} (${fund.fundName}): missing investmentStrategy`);

    if (fund.strategyUrl && !fund.strategyUrl.startsWith("https://")) {
      errors.push(`${fund.id} (${fund.fundName}): strategyUrl must use HTTPS: ${fund.strategyUrl}`);
    }
    for (const url of fund.sourceUrls) {
      if (!url.startsWith("https://")) {
        errors.push(`${fund.id} (${fund.fundName}): sourceUrl must use HTTPS: ${url}`);
      }
    }
  }

  return errors;
}
