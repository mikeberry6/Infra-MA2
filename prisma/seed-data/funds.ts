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
  "Financial Close": "#3b82f6",
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

// ─── Helper to create fund entries ──────────────────────────

// Portfolio data now lives in src/data/portcos/ (PortCo Database)

function f(
  id: string,
  managerName: string,
  fundName: string,
  vintage: string,
  size: string,
  sizeUsdMm: number | null,
  strategy: FundStrategy,
  status: FundStatus,
  overrides?: Partial<Pick<Fund, "investmentStrategy" | "sourceUrls" | "sectors" | "regions" | "strategies" | "structure" | "ticker" | "strategyUrl">>,
): Fund {
  return {
    id,
    managerName,
    fundName,
    ticker: overrides?.ticker ?? null,
    investmentStrategy: overrides?.investmentStrategy ?? "",
    sourceUrls: overrides?.sourceUrls ?? [],
    size,
    sizeUsdMm,
    vintage,
    strategies: overrides?.strategies ?? [strategy],
    structure: overrides?.structure ?? (status === "Evergreen" ? "Evergreen" as FundStructure : "Closed-End" as FundStructure),
    status,
    sectors: overrides?.sectors ?? [],
    regions: overrides?.regions ?? [],
    portfolioCompanies: [],
    strategyUrl: overrides?.strategyUrl ?? "",
  };
}

// ─── Fund Manifest (149 funds) ──────────────────────────────
// ─── End Manifest ──────────────────────────────────────────

export const funds: Fund[] = [
  // ── 3i Group ──────────────────────────────────────────────
  f("FUND-001", "3i Group", "3i Infrastructure plc", "Evergreen", "£3.8B", 4940, "Core-Plus", "Evergreen", {
    investmentStrategy: "London-listed evergreen core-plus vehicle investing in resilient economic infrastructure businesses across Europe and selectively elsewhere for long-term sustainable returns.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services", "Social Infrastructure"],
    regions: ["Europe"],
    structure: "Listed / Evergreen",
    ticker: "3IN.L",
  }),
  f("FUND-002", "3i Group", "3i NA Infrastructure Fund", "2022", "$739M", 739, "Core-Plus", "Financial Close", {
    investmentStrategy: "Inaugural North American mid-market infrastructure fund using 3i's core-plus/value-add approach; final close completed in December 2023.",
    sectors: ["Digital Infrastructure", "Transportation", "Waste / Environmental Services"],
    regions: ["North America"],
  }),

  // ── ADIA ──────────────────────────────────────────────────
  f("FUND-003", "Abu Dhabi Investment Authority (ADIA)", "ADIA Direct Infrastructure", "Evergreen", "—", null, "Core", "Evergreen", {
    investmentStrategy: "Evergreen direct infrastructure program making minority investments across transport, utilities, energy, and digital infrastructure, with a substantial renewables theme.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── AIMCo ─────────────────────────────────────────────────
  f("FUND-004", "AIMCo", "AIMCo Direct Infrastructure Investment", "Evergreen", ">C$100B", 74000, "Core", "Evergreen", {
    investmentStrategy: "Evergreen direct infrastructure program focused on essential-service utilities, power, and transport assets, with disclosed holdings spanning regulated networks, renewables, midstream, and transport.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Amber Infrastructure Group ────────────────────────────
  f("FUND-005", "Amber Infrastructure Group", "International Public Partnerships (INPP)", "Evergreen", "£3.0B", 3900, "Core", "Evergreen", {
    investmentStrategy: "Listed evergreen investor in public infrastructure seeking stable, inflation-linked returns; the observable book blends social PPPs with regulated utility, transport, wastewater and digital assets.",
    sectors: ["Power Generation", "Utilities", "Transportation", "Social Infrastructure", "Waste / Environmental Services", "Digital Infrastructure"],
    regions: ["Europe"],
    structure: "Listed / Evergreen",
    ticker: "INPP.L",
  }),

  // ── Ancala Partners ───────────────────────────────────────
  f("FUND-006", "Ancala Partners", "Ancala Infrastructure Fund III", "2022", "€1.4B", 1540, "Core-Plus", "Financial Close", {
    investmentStrategy: "Third flagship Ancala fund pursuing bilaterally sourced, downside-protected mid-market infrastructure across essential sectors, with active value creation rather than a narrow single-theme approach.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services", "Digital Infrastructure", "Social Infrastructure"],
    regions: ["Europe"],
  }),

  // ── Antin Infrastructure Partners ─────────────────────────
  f("FUND-007", "Antin Infrastructure Partners", "Antin Flagship Fund 5", "2022", "€10.2B", 11220, "Value-Add", "Financial Close", {
    investmentStrategy: "Large-ticket value-add fund investing in established infrastructure platforms across Europe and North America; typically writes ~€600m-€1bn+ equity checks.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services", "Social Infrastructure"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-008", "Antin Infrastructure Partners", "Antin Mid Cap Fund I", "2021", "€2.2B", 2420, "Value-Add", "Financial Close", {
    investmentStrategy: "Smaller-ticket version of Antin's flagship strategy, targeting established infrastructure companies in Europe and North America with ~€50m-€300m equity tickets.",
    sectors: ["Digital Infrastructure", "Transportation", "Social Infrastructure"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-009", "Antin Infrastructure Partners", "Antin NextGen Fund I", "2021", "€1.2B", 1320, "Opportunistic", "Financial Close", {
    investmentStrategy: "Next-generation infrastructure strategy backing scalable, sustainability-linked platforms and technologies across Europe and North America.",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services", "Transportation"],
    regions: ["Europe", "North America"],
  }),

  // ── APG Asset Management ──────────────────────────────────
  f("FUND-010", "APG Asset Management", "APG Direct Infrastructure Pool", "Evergreen", "€33.0B", 36300, "Core", "Evergreen", {
    investmentStrategy: "Closest public match is APG Infrastructure Pool 2020-2021 within APG's broader direct infrastructure program: a long-term global pool spanning multiple asset styles, sectors and regions, with major exposure to power, transport, social and digital themes.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Digital Infrastructure", "Transportation", "Social Infrastructure", "Midstream / Energy"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Apollo Global Management ──────────────────────────────
  f("FUND-011", "Apollo Global Management", "Apollo Infrastructure Company (AIC)", "Evergreen", "$1.7B", 1700, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Evergreen Apollo infrastructure vehicle pursuing income and appreciation through control acquisitions, financings and strategic investments across essential infrastructure sectors.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-012", "Apollo Global Management", "Apollo Clean Transition Equity Partners I", "2023", "$4.0B", 4000, "Opportunistic", "Financial Close", {
    investmentStrategy: "Apollo clean-transition equity strategy funding businesses tied to clean power, industrial decarbonization and other climate-enabling infrastructure themes.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Digital Infrastructure"],
    regions: ["Global"],
  }),
  f("FUND-013", "Apollo Global Management", "Apollo Clean Transition Equity Partners II", "2024", "[TBD]", null, "Opportunistic", "Raising", {
    investmentStrategy: "Successor Apollo clean-transition equity vehicle with the same broad remit across energy transition, industrial decarbonization and related enabling infrastructure.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Digital Infrastructure"],
    regions: ["Global"],
  }),
  f("FUND-014", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund III", "2023", "$2.4B", 2400, "Value-Add", "Financial Close", {
    investmentStrategy: "Mid-market Apollo infrastructure fund providing flexible capital across power, renewables, transport and digital infrastructure in North America and Europe.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
  }),

  // ── Ara Partners ──────────────────────────────────────────
  f("FUND-015", "Ara Partners", "Ara Fund III", "2023", "$2.8B", 2800, "Opportunistic", "Financial Close", {
    investmentStrategy: "Third Ara flagship private-equity fund focused on industrial decarbonization buyouts and growth investments rather than classic diversified infrastructure.",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-016", "Ara Partners", "Ara Energy Decarbonization Fund I", "2026", "$1.5B", 1500, "Value-Add", "Raising", {
    investmentStrategy: "Inaugural Ara Energy vehicle focused on acquiring operating conventional-energy assets and decarbonizing them through operational optimization, fuel transition and retrofit pathways.",
    sectors: ["Power Generation", "Utilities", "Renewables / Energy Transition", "Midstream / Energy", "Transportation"],
    regions: ["North America"],
  }),
  f("FUND-017", "Ara Partners", "Ara Infrastructure Fund I", "2025", "$800M", 800, "Value-Add", "Raising", {
    investmentStrategy: "Debut Ara infrastructure vehicle targeting mid-market industrial-decarbonization infrastructure by building or repurposing assets for the lower-carbon economy.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Midstream / Energy", "Waste / Environmental Services"],
    regions: ["North America"],
  }),

  // ── ArcLight Capital Partners ─────────────────────────────
  f("FUND-018", "ArcLight Capital Partners", "ArcLight Energy Partners Fund VIII", "2023", "$3.0B", 3000, "Opportunistic", "Financial Close", {
    investmentStrategy: "Current vehicle is publicly filed as ArcLight Infrastructure Partners Fund VIII-A/B, the successor flagship focused on electrification infrastructure through power, renewables, strategic gas and selective transformative assets.",
    sectors: ["Power Generation", "Utilities", "Renewables / Energy Transition", "Midstream / Energy", "Digital Infrastructure"],
    regions: ["North America"],
  }),

  // ── Ardian ────────────────────────────────────────────────
  f("FUND-019", "Ardian", "Ardian Americas Infrastructure Fund V (AAIF V)", "2022", "$2.1B", 2100, "Core-Plus", "Financial Close", {
    investmentStrategy: "Ardian's second-generation Americas mid-market essential-infrastructure fund, focused on telecom, transport and energy-transition assets across the US and other OECD American markets.",
    sectors: ["Digital Infrastructure", "Transportation", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy"],
    regions: ["North America"],
  }),
  f("FUND-020", "Ardian", "Ardian Infrastructure Fund VI", "2023", "€11.5B", 12650, "Core-Plus", "Financial Close", {
    investmentStrategy: "Ardian's flagship European infrastructure platform, continuing its long-running industrial approach across energy, transport and digital infrastructure.",
    sectors: ["Transportation", "Renewables / Energy Transition", "Power Generation", "Utilities", "Digital Infrastructure", "Midstream / Energy", "Waste / Environmental Services", "Social Infrastructure"],
    regions: ["Europe", "North America"],
  }),

  // ── Ares Management ───────────────────────────────────────
  f("FUND-021", "Ares Management", "Ares Core Infrastructure Fund (ACI)", "Evergreen", "$3.9B", 3900, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Evergreen core infrastructure income vehicle investing in long-contracted or rate-regulated assets, with disclosed exposure centered on renewables, power, pipelines/LNG and some telecom/digital holdings.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Digital Infrastructure"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-022", "Ares Management", "Ares Climate Infrastructure Partners II", "Raising", "[$3.0B]", 3000, "Opportunistic", "Raising", {
    investmentStrategy: "Successor Ares climate infrastructure fund providing flexible capital to renewable, storage, efficiency, electrification and transmission-oriented businesses, with selective digital-enablement exposure.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Digital Infrastructure"],
    regions: ["North America", "Europe"],
  }),

  // ── Argo Infrastructure Partners ──────────────────────────
  f("FUND-023", "Argo Infrastructure Partners", "Argo Series 3", "2021", "$2.0B", 2000, "Core", "Financial Close", {
    investmentStrategy: "Core-style Series 3 within Argo's essential mid-market platform, historically anchored in utilities, power, transmission and water and broadened over time into data centers and transportation.",
    sectors: ["Power Generation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Waste / Environmental Services"],
    regions: ["North America"],
  }),

  // ── Astatine Investment Partners ──────────────────────────
  f("FUND-024", "Astatine Investment Partners", "Alinda Infrastructure Fund III", "2018", "$1.0B", 1000, "Value-Add", "Financial Close", {
    investmentStrategy: "Mid-market infrastructure fund focused on North America and Europe within the broader Alinda/Astatine franchise, whose historical deployment centers on transport, utilities, digital and midstream assets.",
    sectors: ["Digital Infrastructure", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-025", "Astatine Investment Partners", "Alinda Infrastructure Fund IV", "2021", "$586M", 586, "Value-Add", "Financial Close", {
    investmentStrategy: "Continuation vehicle for Astatine's mid-market infrastructure strategy; official Fund IV disclosures explicitly target transportation and logistics, utility-related infrastructure and digital infrastructure.",
    sectors: ["Digital Infrastructure", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
  }),

  // ── AustralianSuper ───────────────────────────────────────
  f("FUND-026", "AustralianSuper", "AustralianSuper Infrastructure Portfolio", "Evergreen", ">$30.0B", 30000, "Core-Plus", "Evergreen", {
    investmentStrategy: "Evergreen pension infrastructure sleeve within AustralianSuper's Mid-Risk real-assets platform, using large direct stakes in unlisted assets; current disclosed holdings tilt to transport/logistics and digital infrastructure, with energy transition an explicit deployment theme.",
    sectors: ["Digital Infrastructure", "Transportation", "Power Generation", "Utilities"],
    regions: ["Global", "Asia-Pacific"],
    structure: "Permanent Capital",
  }),

  // ── Axium Infrastructure ──────────────────────────────────
  f("FUND-027", "Axium Infrastructure", "AxInfra Fund I-IV", "Evergreen", "$7.7B", 7700, "Core", "Evergreen", {
    investmentStrategy: "Core infrastructure series targeting brownfield and greenfield energy, transportation, and social assets in OECD markets, typically backed by long-term contracts, concessions, or regulated frameworks.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation", "Social Infrastructure"],
    regions: ["North America", "Europe"],
  }),

  // ── Basalt Infrastructure Partners ────────────────────────
  f("FUND-028", "Basalt Infrastructure Partners", "Basalt BIP IV", "2024", "$4.0B", 4000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Transatlantic mid-market infrastructure vehicle targeting power, telecom/digital, transport, and utilities in Western Europe and North America.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-029", "Basalt Infrastructure Partners", "Basalt BIP V", "Raising", "—", null, "Core-Plus", "Raising", {
    investmentStrategy: "Successor Basalt vehicle; public fund-specific docs are thin, but current Basalt materials continue to frame the series around mid-market utilities, power, transport, and digital infrastructure in North America and Europe.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
  }),

  // ── BCI ───────────────────────────────────────────────────
  f("FUND-030", "BCI", "BCI Infrastructure & Renewable Resource Program", "Evergreen", "~C$32B", 23680, "Core", "Evergreen", {
    investmentStrategy: "Open-ended core infrastructure and renewable-resources program seeking long-hold, governance-rich positions in essential-service assets globally, with current emphasis on utilities, transport, digital infrastructure, and energy-transition themes.",
    sectors: ["Power Generation", "Utilities", "Digital Infrastructure", "Transportation", "Renewables / Energy Transition", "Waste / Environmental Services", "Social Infrastructure"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Bernhard Capital Partners ─────────────────────────────
  f("FUND-031", "Bernhard Capital Partners", "BCP Fund III", "2022", "$1.5B", 1500, "Opportunistic", "Financial Close", {
    investmentStrategy: "Value-add services-and-infrastructure fund focused on critical utility and civic-infrastructure platforms; Fund III public disclosures center on architecture/engineering/consulting, energy optimization, institutional program management, and water/wastewater-related services.",
    sectors: ["Power Generation", "Utilities", "Waste / Environmental Services", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
  }),

  // ── BlackRock ─────────────────────────────────────────────
  f("FUND-032", "BlackRock", "BlackRock GIF IV", "2024", "$6.1B", 6100, "Core-Plus", "Financial Close", {
    investmentStrategy: "Fourth-vintage global diversified infrastructure fund targeting energy & environmental, low-carbon power, regulated utilities, transport/logistics, and digital infrastructure.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services"],
    regions: ["Global"],
  }),
  f("FUND-033", "BlackRock", "BlackRock Global Renewable Power Fund IV (GRP IV)", "2024", "[$7.0B]", 7000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Fourth-vintage climate infrastructure / renewable power fund focused on OECD wind, solar, batteries, and grid infrastructure, with lineage deployment overwhelmingly in clean-power platforms.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Global"],
  }),

  // ── BlackRock (GIP) ───────────────────────────────────────
  f("FUND-034", "BlackRock (GIP)", "GIP Core Fund", "Evergreen", "[$5.0B]", 5000, "Core", "Evergreen", {
    investmentStrategy: "OECD-focused core vehicle targeting income-oriented returns across GIP's core sectors, though public portfolio attribution is currently thin and visibly digital-led.",
    sectors: ["Digital Infrastructure", "Power Generation", "Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["Global"],
  }),
  f("FUND-035", "BlackRock (GIP)", "GIP Mid-Market Fund V", "2026", "[$7.0B]", 7000, "Core-Plus", "Raising", {
    investmentStrategy: "Rebranded successor to GIF IV / the GEPIF series; a differentiated core-plus mid-market strategy for essential, contracted infrastructure businesses that has broadened in mandate but remains historically energy-heavy in deployment.",
    sectors: ["Renewables / Energy Transition", "Midstream / Energy", "Power Generation", "Utilities", "Waste / Environmental Services", "Transportation"],
    regions: ["Global"],
  }),
  f("FUND-036", "BlackRock (GIP)", "GIP V", "2022", "$25.2B", 25200, "Core-Plus", "Financial Close", {
    investmentStrategy: "Fifth flagship global infrastructure fund pursuing GIP's core/core-plus OECD strategy across energy, transport, digital and water/waste, with decarbonization central to the thesis.",
    sectors: ["Renewables / Energy Transition", "Midstream / Energy", "Transportation", "Power Generation", "Utilities", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["Global"],
  }),
  f("FUND-037", "BlackRock (GIP)", "GIP Transition Fund", "2025", "[$10.0B]", 10000, "Value-Add", "Raising", {
    investmentStrategy: "Newly launched brown-to-green transition vehicle oriented to decarbonization, CCUS and transition-enabling infrastructure rather than a pure renewables sleeve.",
    sectors: ["Renewables / Energy Transition", "Midstream / Energy", "Power Generation", "Utilities"],
    regions: ["Global"],
  }),

  // ── Blackstone ────────────────────────────────────────────
  f("FUND-038", "Blackstone", "Blackstone AIP", "2026", "[$30.0B]", 30000, "Core-Plus", "Raising", {
    investmentStrategy: "Could not verify as a Blackstone-managed infrastructure fund; the row appears to match BlackRock/GIP's AI Infrastructure Partnership, which targets AI data centers and supporting power infrastructure.",
    sectors: ["Digital Infrastructure", "Power Generation", "Utilities"],
    regions: ["Global"],
  }),
  f("FUND-039", "Blackstone", "Blackstone Infrastructure Partners (BIP)", "Evergreen", "$77.0B", 77000, "Core-Plus", "Evergreen", {
    investmentStrategy: "Permanent-capital, multi-sector infrastructure vehicle with a long-term buy-and-hold approach; public deployment is concentrated in digital, transport, utilities/midstream, and some waste/environmental assets.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services"],
    regions: ["Global"],
    structure: "Listed / Evergreen",
  }),
  f("FUND-040", "Blackstone", "BXINFRA", "Evergreen", "$4.1B", 4100, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Perpetual, semiliquid retail infrastructure vehicle targeting Blackstone's Digital, Energy, and Transportation themes; early portfolio construction is currently centered on transport, digital, and pipeline energy, with Urbaser adding environmental services.",
    sectors: ["Digital Infrastructure", "Midstream / Energy", "Transportation", "Waste / Environmental Services"],
    regions: ["Global"],
    structure: "Open-End",
  }),

  f("FUND-041", "Blackstone", "Blackstone Energy Transition Partners IV (BETP IV)", "2025", "$5.6B", 5600, "Opportunistic", "Raising", {
    investmentStrategy: "Energy-focused private equity fund backing businesses across the energy-transition value chain, but with actual deployment spanning grid equipment, transmission, gas-fired reliability power, software, and environmental services as well as renewable enablers.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-042", "Blackstone", "Blackstone Energy Transition Partners V (BETP V)", "2026", "[TBD]", null, "Opportunistic", "Raising", {
    investmentStrategy: "In-market successor to BETP IV; no standalone portfolio is public yet, so the best read-through is the cited BETP platform and prior-series record, which points to electrification, grid reliability, power, and enabling services rather than renewables-only.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
  }),

  // ── Blue Owl ──────────────────────────────────────────────
  f("FUND-043", "Blue Owl Capital", "Blue Owl ODI III", "2024", "$7.0B", 7000, "Value-Add", "Financial Close", {
    investmentStrategy: "Pure-play digital infrastructure fund dedicated to data centers and related connectivity assets serving hyperscaler/AI/cloud demand, built on the acquired IPI Partners platform.",
    sectors: ["Digital Infrastructure"],
    regions: ["North America", "Europe"],
  }),

  // ── Brookfield ────────────────────────────────────────────
  f("FUND-044", "Brookfield", "Brookfield BAIF", "2025", "$10.0B", 10000, "Value-Add", "Raising", {
    investmentStrategy: "Treated as Brookfield's officially named BAIIF: an inaugural AI infrastructure fund investing across AI factories, power, compute, and adjacent assets across the AI value chain.",
    sectors: ["Digital Infrastructure", "Power Generation", "Utilities"],
    regions: ["Global"],
  }),
  f("FUND-045", "Brookfield", "Brookfield BGTF II", "2023", "$20.0B", 20000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Flagship transition fund investing across clean-energy buildout, sustainable solutions, and decarbonization of carbon-intensive businesses.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Waste / Environmental Services"],
    regions: ["Global"],
  }),
  f("FUND-046", "Brookfield", "Brookfield BIF V", "2022", "$28.0B", 28000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Flagship global infrastructure fund investing on a value basis through Brookfield's operations-oriented model; BIF V is explicitly positioned around digitalization, decarbonization, and deglobalization.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation"],
    regions: ["Global"],
  }),
  f("FUND-047", "Brookfield", "Brookfield BII", "Evergreen", "$5.1B", 5100, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Semi-liquid private-wealth fund seeking capital growth and income through private infrastructure equity and debt across Brookfield's platform sectors.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-048", "Brookfield", "Brookfield BISS", "2024", "$1.0B", 1000, "Value-Add", "Financial Close", {
    investmentStrategy: "Inaugural middle-market structured-solutions fund providing structured and common equity to sponsors, developers, and corporates in Brookfield's infrastructure sectors of expertise.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["Global"],
  }),
  f("FUND-049", "Brookfield", "Brookfield Americas Infrastructure Fund", "2010", "$2.7B", 2700, "Value-Add", "Financial Close", {
    investmentStrategy: "Americas infrastructure private equity / value-oriented infrastructure vehicle.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation"],
    regions: ["North America"],
  }),
  f("FUND-050", "Brookfield", "Brookfield Super-Core Infrastructure Partners", "Evergreen", "$13.2B", 13200, "Core", "Evergreen", {
    investmentStrategy: "Perpetual private-core infrastructure strategy for developed-market assets, marketed around yield, diversification, and inflation protection.",
    sectors: ["Power Generation", "Utilities"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Carlyle Group ─────────────────────────────────────────
  f("FUND-051", "Carlyle Group", "Carlyle CGI Fund I", "2019", "$2.2B", 2200, "Value-Add", "Financial Close", {
    investmentStrategy: "Inaugural OECD-focused value-add infrastructure fund targeting transport, energy/power and water infrastructure, with actual deployment spanning airports, crude logistics, water assets, towers and microgrids.",
    sectors: ["Transportation", "Midstream / Energy", "Waste / Environmental Services", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-052", "Carlyle Group", "Carlyle CGI Fund II", "2026", "TBD", null, "Value-Add", "Raising", {
    investmentStrategy: "Successor CGI vehicle under Carlyle's current four-vertical platform, emphasizing middle-market transport, digital, renewables and midstream opportunities in OECD markets.",
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-053", "Carlyle Group", "Carlyle CRSEF II", "2022", "$2.0B", 2000, "Value-Add", "Financial Close", {
    investmentStrategy: "Second dedicated Carlyle renewables vehicle focused on developed-market renewable and sustainable energy platforms across solar, wind, storage, EV charging and distributed-generation finance.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
  }),

  // ── CBRE ──────────────────────────────────────────────────
  f("FUND-054", "CBRE Investment Management", "CBRE GIF", "Evergreen", "$3.3B", 3300, "Core-Plus", "Evergreen", {
    investmentStrategy: "Evergreen global direct private infrastructure strategy targeting diversified core/core-plus OECD mid-market assets, with the verified public deal trail centered on digitalization and decarbonization themes.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
  }),

  // ── CIM Group ─────────────────────────────────────────────
  f("FUND-055", "CIM Group", "CIM Infrastructure Fund III", "2021", "$1.8B", 1800, "Value-Add", "Financial Close", {
    investmentStrategy: "North American value-add infrastructure fund targeting renewables, digital, waste/water, and transport/social infrastructure, with lineage deployment concentrated in data centers, solar/RNG and water/resource-efficiency assets.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Waste / Environmental Services", "Transportation"],
    regions: ["North America"],
  }),

  // ── Copenhagen Infrastructure Partners ────────────────────
  f("FUND-056", "Copenhagen Infrastructure Partners", "Copenhagen Infrastructure V (CI V)", "2023", "€12.0B", 13200, "Core-Plus", "Financial Close", {
    investmentStrategy: "Global flagship greenfield renewable-energy infrastructure fund focused on large-scale contracted or regulated clean-energy and system-integration assets in low-risk OECD markets.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["Global"],
  }),

  // ── Connor, Clark & Lunn ──────────────────────────────────
  f("FUND-057", "Connor, Clark & Lunn", "CCL Private Client Infrastructure Portfolio", "Evergreen", "~C$7.0B", 5180, "Core-Plus", "Evergreen", {
    investmentStrategy: "Evergreen direct middle-market infrastructure portfolio for private clients, with disclosed holdings dominated by renewables and meaningful transport/social exposure.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
  }),

  // ── CPP Investments ───────────────────────────────────────
  f("FUND-058", "CPP Investments", "CPP Investments Infrastructure", "Evergreen", "—", null, "Core-Plus", "Evergreen", {
    investmentStrategy: "Evergreen global direct infrastructure program inside CPP's Real Assets platform, deploying at scale across digital, transport, power/renewables, midstream and environmental-services assets.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── CVC DIF ───────────────────────────────────────────────
  f("FUND-059", "CVC DIF", "CVC DIF CIF III", "2022", "€1.6B", 1760, "Value-Add", "Financial Close", {
    investmentStrategy: "Legacy-CIF / current Value-Add growth infrastructure fund focused on buy-and-build platforms, especially in digital infrastructure, alongside transport and other growth infrastructure niches.",
    sectors: ["Digital Infrastructure", "Transportation", "Midstream / Energy", "Social Infrastructure"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-060", "CVC DIF", "CVC DIF Infrastructure VII", "2022", "€4.4B", 4840, "Core-Plus", "Financial Close", {
    investmentStrategy: "Core-plus flagship targeting contracted, downside-protected essential infrastructure across CVC DIF's mid-market platform, with yield plus longer-term value creation.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Waste / Environmental Services", "Power Generation", "Utilities"],
    regions: ["Europe", "North America"],
  }),

  f("FUND-061", "CVC DIF", "CVC DIF Infrastructure VIII", "2025", "[€8.0B]", 8800, "Core-Plus", "Raising", {
    investmentStrategy: "Successor core-plus vehicle using a build-to-core approach on diversified global infrastructure businesses with predictable revenues and development upside.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Waste / Environmental Services", "Power Generation", "Utilities"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-062", "CVC DIF", "CVC DIF Value-Add IV", "2024", "€2.0B", 2200, "Value-Add", "Financial Close", {
    investmentStrategy: "Rebranded successor to the CIF series pursuing diversified buy-and-build value-add infrastructure, but with public evidence pointing to a strongly digital-led lineage.",
    sectors: ["Digital Infrastructure", "Transportation", "Midstream / Energy", "Social Infrastructure"],
    regions: ["Europe", "North America"],
  }),

  // ── DigitalBridge ─────────────────────────────────────────
  f("FUND-063", "DigitalBridge", "DigitalBridge Fund III", "2024", "$7.2B", 7200, "Value-Add", "Financial Close", {
    investmentStrategy: "Third flagship value-add digital infrastructure fund scaling into hyperscale data centers, fiber, towers and related connectivity assets across DigitalBridge's five-vertical digital stack.",
    sectors: ["Digital Infrastructure"],
    regions: ["North America", "Europe", "Asia-Pacific"],
  }),

  // ── Duration Capital Partners ─────────────────────────────
  f("FUND-064", "Duration Capital Partners", "Duration Core-plus Infrastructure Fund", "2022", "~$3.0B", 3000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Specialized North American transportation infrastructure strategy, publicly aligned with the TICP vehicle and later the Duration spin-out, focused on essential aviation, ports, rail and logistics businesses.",
    sectors: ["Transportation"],
    regions: ["North America"],
  }),

  // ── DWS ───────────────────────────────────────────────────
  f("FUND-065", "DWS", "DWS PEIF III", "Raising", "€3.1B", 3410, "Value-Add", "Raising", {
    investmentStrategy: "Latest flagship DWS private infrastructure fund targeting long-term critical infrastructure in Europe and North America; lineage spans transport, utilities, digital, and social infrastructure.",
    sectors: ["Transportation", "Power Generation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["Europe", "North America"],
  }),

  // ── Energy Capital Partners ───────────────────────────────
  f("FUND-066", "Energy Capital Partners", "ECP Fund V", "2022", "$4.4B", 4400, "Opportunistic", "Financial Close", {
    investmentStrategy: "Fifth flagship ECP equity vehicle focused on value-add/control investments in electricity and sustainability infrastructure, especially conventional/renewable power, storage and decarbonization assets.",
    sectors: ["Power Generation", "Utilities", "Renewables / Energy Transition", "Waste / Environmental Services", "Midstream / Energy"],
    regions: ["North America"],
  }),
  f("FUND-067", "Energy Capital Partners", "ECP Fund VI", "2025", "$5.0B", 5000, "Opportunistic", "Raising", {
    investmentStrategy: "Successor flagship vehicle continuing ECP's value-added, primarily control strategy across renewable and conventional power generation, storage, environmental infrastructure, plus smaller biofuels/carbon-capture exposure.",
    sectors: ["Power Generation", "Utilities", "Renewables / Energy Transition", "Waste / Environmental Services", "Midstream / Energy"],
    regions: ["North America"],
  }),

  // ── EIG ───────────────────────────────────────────────────
  f("FUND-068", "EIG", "EIG Fund XVII", "2022", "[$3.0B]", 3000, "Opportunistic", "Financial Close", {
    investmentStrategy: "Global hybrid debt and structured-equity fund targeting debt and equity investments in energy and energy-related infrastructure projects and companies worldwide.",
    sectors: ["Midstream / Energy", "Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation"],
    regions: ["Global"],
  }),

  // ── Energy Infrastructure Partners ────────────────────────
  f("FUND-069", "Energy Infrastructure Partners", "EIP III", "Raising", "€4.0B", 4400, "Core-Plus", "Raising", {
    investmentStrategy: "Third-generation energy-only infrastructure strategy focused on system-critical OECD assets across transmission & distribution, storage & flexibility, and renewable energy.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy"],
    regions: ["Europe", "North America"],
  }),

  // ── Ember Infrastructure Management ───────────────────────
  f("FUND-070", "Ember Infrastructure Management", "Ember Infrastructure Fund II", "2023", "$0.8B", 800, "Opportunistic", "Financial Close", {
    investmentStrategy: "Middle-market infrastructure strategy targeting lower-carbon, resource-efficient and climate-resilient platforms, with real deployment split between environmental-resource systems and selected clean-energy assets.",
    sectors: ["Waste / Environmental Services", "Renewables / Energy Transition"],
    regions: ["North America"],
  }),

  // ── EQT ───────────────────────────────────────────────────
  f("FUND-071", "EQT", "EQT Active Core I", "Evergreen", "$3.2B", 3200, "Core", "Evergreen", {
    investmentStrategy: "Longer-hold core strategy focused on Europe and North America, centered on downside-protected essential-services infrastructure with stable yield, inflation protection, and low volatility.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-072", "EQT", "EQT AI Infrastructure", "2026", "[TBD]", null, "Value-Add", "Raising", {
    investmentStrategy: "Public evidence remains preliminary rather than a fully launched fund; the clearest current read-through is a prospective AI-enabling infrastructure strategy centered on data centers, fiber, and adjacent power needs.",
    sectors: ["Digital Infrastructure"],
    regions: ["Global"],
  }),
  f("FUND-073", "EQT", "EQT Infrastructure Fund VI", "2023", "€21.5B", 23650, "Value-Add", "Financial Close", {
    investmentStrategy: "Flagship EQT value-add infrastructure fund focused on essential-service infrastructure businesses with protected cash flows and thematic value creation across digital, energy/decarbonization, circularity, and social infrastructure.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services", "Social Infrastructure"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-074", "EQT", "EQT Transition Infrastructure", "2024", "[€5.0B]", 5500, "Opportunistic", "Raising", {
    investmentStrategy: "Scale-up strategy for businesses enabling decarbonization and climate resilience, especially clean energy and resource-efficient / circular-economy infrastructure.",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
  }),

  // ── Equilibrium ───────────────────────────────────────────
  f("FUND-075", "Equilibrium", "Equilibrium CEFF II", "2019", "$1.0B", 1000, "Opportunistic", "Financial Close", {
    investmentStrategy: "Controlled-environment food infrastructure strategy centered on advanced greenhouse and other CEA facilities designed to improve year-round supply, resilience and resource efficiency.",
    sectors: ["Waste / Environmental Services"],
    regions: ["North America"],
  }),

  // ── Fengate Asset Management ──────────────────────────────
  f("FUND-076", "Fengate Asset Management", "Fengate Infrastructure Fund IV", "2021", "$1.1B", 1100, "Core-Plus", "Financial Close", {
    investmentStrategy: "Fengate's flagship closed-ended North American core-plus/value-add fund, sourced through relationships with design-builders, operators, developers, and procurement channels; by Dec. 31, 2024 it had eight investments across social, transportation, energy transition, and digital infrastructure.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Social Infrastructure", "Transportation"],
    regions: ["North America"],
  }),
  f("FUND-077", "Fengate Asset Management", "Fengate Infrastructure Yield Fund", "Evergreen", "C$1.2B", 888, "Core", "Evergreen", {
    investmentStrategy: "Evergreen core/yield strategy inferred from Fengate's public launch history, manager remit, and deal flow; disclosed investments emphasize long-duration, contracted telecom-tower and social-infrastructure cash flows.",
    sectors: ["Digital Infrastructure", "Social Infrastructure"],
    regions: ["North America"],
  }),

  // ── Fiera Infrastructure ──────────────────────────────────
  f("FUND-078", "Fiera Infrastructure", "Fiera Digital Fund", "2024", "$0.6B", 600, "Opportunistic", "Financial Close", {
    investmentStrategy: "In 2024 Fiera assumed the adviser role for River and Mercantile Infrastructure Income Fund SCSp and renamed it Digital Infrastructure Capital Partners SCSp; legacy disclosures indicate a UK digital-transition thesis centered on fibre and wireless broadband infrastructure.",
    sectors: ["Digital Infrastructure"],
    regions: ["Europe"],
  }),
  f("FUND-079", "Fiera Infrastructure", "Fiera EagleCrest Infrastructure", "Evergreen", "C$2.8B", 2072, "Core-Plus", "Evergreen", {
    investmentStrategy: "Fiera's flagship open-end core/core-plus strategy targeting stable, predictable, contracted or regulated cash flows across OECD infrastructure subsectors, with a buy-and-manage approach and opportunistic exits.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Waste / Environmental Services", "Social Infrastructure", "Transportation"],
    regions: ["North America", "Europe"],
  }),

  // ── GCM Grosvenor ─────────────────────────────────────────
  f("FUND-080", "GCM Grosvenor", "GCM Grosvenor IAF II", "2023", "$1.3B", 1300, "Core-Plus", "Financial Close", {
    investmentStrategy: "Labor-aligned infrastructure strategy investing with organized-labor partnership across transportation, energy transition, and digital infrastructure.",
    sectors: ["Transportation", "Renewables / Energy Transition", "Digital Infrastructure", "Power Generation", "Utilities"],
    regions: ["North America"],
  }),

  // ── Generate Capital ──────────────────────────────────────
  f("FUND-081", "Generate Capital", "Generate Capital (Permanent Capital)", "Evergreen", "$10.0B", 10000, "Value-Add", "Evergreen", {
    investmentStrategy: "Permanent-capital sustainable infrastructure platform spanning power, mobility, waste, water, digital infrastructure, agriculture, and industrial decarbonization.",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services", "Digital Infrastructure", "Transportation", "Power Generation", "Utilities"],
    regions: ["North America"],
    structure: "Permanent Capital",
  }),

  // ── GIC ───────────────────────────────────────────────────
  f("FUND-082", "GIC", "GIC Infrastructure", "Evergreen", "—", null, "Core-Plus", "Evergreen", {
    investmentStrategy: "Global direct infrastructure program focused on cash-flow-visible private assets across utilities, renewables, communications, data centres, water, airports, seaports, and highways.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Grain Management ──────────────────────────────────────
  f("FUND-083", "Grain Management", "Grain GCOF III", "Raising", "$2.25B", 2250, "Opportunistic", "Raising", {
    investmentStrategy: "Specialist communications vehicle focused on mission-critical communications assets and broadband infrastructure companies; historical deployment is dominated by fiber, broadband, and adjacent telecom-network/service platforms.",
    sectors: ["Digital Infrastructure"],
    regions: ["North America"],
  }),
  f("FUND-084", "Grain Management", "Grain GCOF IV", "Raising", "[$4.0B]", 4000, "Opportunistic", "Raising", {
    investmentStrategy: "Successor Grain vehicle marketed for broadband, data center, and telecom-tower investments, fully consistent with Grain's broader digital-infrastructure specialization.",
    sectors: ["Digital Infrastructure"],
    regions: ["North America"],
  }),

  // ── Goldman Sachs Alternatives ────────────────────────────
  f("FUND-085", "Goldman Sachs Alternatives", "GS G-INFRA", "Evergreen", "$0.3B", 300, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Open-ended global infrastructure strategy for wealth clients, investing in mid-market core-plus/value-add private infrastructure plus secondaries and liquid assets alongside Goldman's flagship infrastructure platform.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Waste / Environmental Services"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-086", "Goldman Sachs Alternatives", "GS Horizon Climate I", "2021", "$1.6B", 1600, "Opportunistic", "Financial Close", {
    investmentStrategy: "Inaugural Goldman direct private-markets climate strategy; a global growth-oriented private equity fund focused on climate and environmental solutions across five themes rather than classic core infrastructure.",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Global"],
  }),
  f("FUND-087", "Goldman Sachs Alternatives", "GS WSIP IV", "2021", "$4.0B", 4000, "Value-Add", "Financial Close", {
    investmentStrategy: "Fourth flagship Goldman infrastructure vintage; Goldman markets it as a value-add, mid-market fund for critical operating businesses with defensive cash flows across energy transition, digital, transport/logistics and social infrastructure.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-088", "Goldman Sachs Alternatives", "GS WSIP V", "2024", "[$4.0B]", 4000, "Value-Add", "Raising", {
    investmentStrategy: "Fifth flagship Goldman infrastructure vehicle; Infralogic reported a $4bn target, Europe/North America focus and no disclosed investments yet, with the broader Goldman platform framed around energy transition, digital infrastructure, transport/logistics and circular economy.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
  }),

  // ── H.I.G. Capital ───────────────────────────────────────
  f("FUND-089", "H.I.G. Capital", "H.I.G. Infrastructure Partners Fund I", "2021", "$1.3B", 1300, "Value-Add", "Financial Close", {
    investmentStrategy: "Inaugural H.I.G. infrastructure vehicle pursuing control-oriented middle-market value-add/core-plus investments in North America and Europe, with a broad mandate beyond traditional TMT, power and transport.",
    sectors: ["Waste / Environmental Services", "Renewables / Energy Transition", "Transportation", "Digital Infrastructure"],
    regions: ["North America", "Europe"],
  }),

  // ── Harbert Management Corporation ────────────────────────
  f("FUND-090", "Harbert Management Corporation", "Harbert HIF VI", "2020", "$0.9B", 900, "Core-Plus", "Financial Close", {
    investmentStrategy: "North American power and renewable energy fund investing across renewable, dispatchable, and distributed generation with an emphasis on contracted cash flows and active asset management.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["North America"],
  }),
  f("FUND-091", "Harbert Management Corporation", "Harbert HIF VII", "Raising", "—", null, "Core-Plus", "Raising", {
    investmentStrategy: "Successor Harbert power vehicle; public disclosures indicate continuation of the same North American power strategy across renewable, dispatchable, and distributed generation.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["North America"],
  }),

  // ── Harrison Street ───────────────────────────────────────
  f("FUND-092", "Harrison Street", "Harrison Street Social Infrastructure Fund", "Evergreen", "$5.3B", 5300, "Core-Plus", "Evergreen", {
    investmentStrategy: "Essential-infrastructure strategy serving municipality, university, school, and hospital users through PPP campus assets, district energy, renewables, and fiber / digital infrastructure.",
    sectors: ["Social Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Digital Infrastructure"],
    regions: ["North America"],
  }),

  // ── I Squared Capital ────────────────────────────────────
  f("FUND-093", "I Squared Capital", "ISQ Energy Transition Infrastructure Fund", "2023", "—", null, "Value-Add", "Financial Close", {
    investmentStrategy: "Dedicated transition vehicle launched in 2023, targeting platform investments across clean-energy creation, storage, electrification, and related decarbonization infrastructure in North America and Europe.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-094", "I Squared Capital", "ISQ Global Infrastructure Fund IV", "2024", "[$15.0B]", 15000, "Value-Add", "Raising", {
    investmentStrategy: "Flagship global value-add infrastructure fund focused on diversified middle-market/platform scale-up investing across North America, Europe, and select growth markets.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services", "Social Infrastructure"],
    regions: ["North America", "Europe", "Asia-Pacific"],
  }),

  // ── iCON Infrastructure ──────────────────────────────────
  f("FUND-095", "iCON Infrastructure", "iCON Infrastructure Fund VII", "Raising", "$3.7B", 3700, "Core-Plus", "Raising", {
    investmentStrategy: "Seventh flagship iCON vehicle continuing a diversified mid-market infrastructure strategy across Europe and North America, explicitly spanning transport, utilities, telecoms, energy & environment and social infrastructure.",
    sectors: ["Digital Infrastructure", "Transportation", "Power Generation", "Utilities", "Midstream / Energy", "Renewables / Energy Transition", "Waste / Environmental Services", "Social Infrastructure"],
    regions: ["Europe", "North America"],
  }),

  // ── IFM Investors ─────────────────────────────────────────
  f("FUND-096", "IFM Investors", "IFM CETF", "Evergreen", "[TBD]", null, "Value-Add", "Evergreen", {
    investmentStrategy: "Open-ended energy-transition vehicle, publicly described as the renamed NZIF, targeting essential infrastructure that accelerates the shift to net zero across renewables, storage, grids, low-carbon fuels, and carbon capture.",
    sectors: ["Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["Global"],
  }),
  f("FUND-097", "IFM Investors", "IFM Global Infrastructure Fund (GIF)", "Evergreen", "$73.6B", 73600, "Core-Plus", "Evergreen", {
    investmentStrategy: "Open-ended global core infrastructure fund investing mainly in developed/OECD markets, with a hold-manage-reinvest model built around strong market-position assets and long-duration cash-yield plus capital-growth returns.",
    sectors: ["Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["Global"],
  }),

  // ── Igneo Infrastructure Partners ─────────────────────────
  f("FUND-098", "Igneo Infrastructure Partners", "Igneo GDIF", "Evergreen", "$7.5B", 7500, "Core-Plus", "Evergreen", {
    investmentStrategy: "Open-ended global income-oriented infrastructure vehicle; public GDIF-specific evidence is strongest in renewables plus water/waste platforms rather than a clearly proven digital/transport-heavy mix.",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services", "Power Generation", "Utilities"],
    regions: ["Global"],
  }),
  f("FUND-099", "Igneo Infrastructure Partners", "Igneo NADIF", "2024", "$1.0B", 1000, "Value-Add", "Financial Close", {
    investmentStrategy: "Closed-ended North American diversified infrastructure vehicle; public evidence shows a live portfolio across digital/connectivity, energy and transportation platforms in the lower middle market.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Power Generation", "Utilities"],
    regions: ["North America"],
  }),

  // ── InfraBridge ───────────────────────────────────────────
  f("FUND-100", "InfraBridge", "InfraBridge GIF III", "Raising", "$4.75B", 4750, "Value-Add", "Raising", {
    investmentStrategy: "Current InfraBridge strategy is a diversified middle-market platform focused on digital infrastructure, transport/logistics and energy transition, with an additional InfraHealth sleeve for care-related assets.",
    sectors: ["Digital Infrastructure", "Transportation", "Renewables / Energy Transition", "Power Generation", "Utilities", "Social Infrastructure"],
    regions: ["Global"],
  }),

  // ── InfraRed Capital Partners ─────────────────────────────
  f("FUND-101", "InfraRed Capital Partners", "InfraRed Fund VII", "2025", "[£1.5B]", 1950, "Value-Add", "Raising", {
    investmentStrategy: "Seventh flagship value-add fund targeting development-stage OECD infrastructure; lineage and current fundraising point to energy transition first, then digital/data and transport, with social infrastructure as a secondary sleeve.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Social Infrastructure"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-102", "InfraRed Capital Partners", "HICL Infrastructure PLC", "Evergreen", "£2.4B", 3120, "Core", "Evergreen", {
    investmentStrategy: "Listed perpetual core vehicle with a 100+ asset portfolio spanning transport, utilities, social and communications infrastructure and oriented to sustainable income plus capital growth.",
    sectors: ["Power Generation", "Utilities", "Transportation", "Digital Infrastructure", "Social Infrastructure"],
    regions: ["Europe", "North America"],
    structure: "Listed / Evergreen",
    ticker: "HICL.L",
  }),

  // ── Instar Asset Management ───────────────────────────────
  f("FUND-103", "Instar Asset Management", "Instar EIF Fund III", "2023", "[$1.5B]", 1500, "Value-Add", "Financial Close", {
    investmentStrategy: "EIF Fund III appears to continue Instar's North American essential-infrastructure strategy targeting scalable middle-market businesses in transportation/logistics, energy transition, environmental and utility-adjacent sectors.",
    sectors: ["Transportation", "Renewables / Energy Transition", "Waste / Environmental Services", "Digital Infrastructure", "Power Generation", "Utilities", "Midstream / Energy"],
    regions: ["North America"],
  }),

  // ── J.P. Morgan Asset Management ─────────────────────────
  f("FUND-104", "J.P. Morgan Asset Management", "J.P. Morgan IIF", "Evergreen", "$41.0B", 41000, "Core-Plus", "Evergreen", {
    investmentStrategy: "Open-ended, perpetual-life J.P. Morgan infrastructure fund seeking mature, regulated/contracted core/core-plus assets with stable cash flow and broad exposure across transportation, utilities, power and renewables.",
    sectors: ["Power Generation", "Utilities", "Midstream / Energy", "Renewables / Energy Transition", "Transportation"],
    regions: ["Global"],
  }),

  // ── KKR ───────────────────────────────────────────────────
  f("FUND-105", "KKR", "KKR DCIF", "Evergreen", "$11.8B", 11800, "Core", "Evergreen", {
    investmentStrategy: "Open-ended core infrastructure fund launched in 2020, targeting mature essential-service assets in developed OECD markets with regulated or contracted cash flows.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["Global"],
  }),
  f("FUND-106", "KKR", "KKR Global Climate Transition Fund", "Raising", "$7.0B", 7000, "Opportunistic", "Raising", {
    investmentStrategy: "Climate-transition infrastructure strategy launched in 2023 to back scalable decarbonization solutions across the physical economy; disclosed investments so far skew toward renewables/storage and transport electrification.",
    sectors: ["Renewables / Energy Transition", "Transportation"],
    regions: ["Global"],
  }),
  f("FUND-107", "KKR", "KKR Global Infrastructure Investors V", "2024", "[$20.0B]", 20000, "Value-Add", "Raising", {
    investmentStrategy: "Fifth flagship closed-end value-add global infrastructure fund focused on critical OECD-heavy assets across communications, renewables, midstream, transport, utilities, waste and social infrastructure.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services", "Social Infrastructure"],
    regions: ["Global"],
  }),
  f("FUND-108", "KKR", "K-INFRA", "Evergreen", "$5.3B", 5300, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Evergreen infrastructure holding company formed in 2022 with a broad mandate across digital, energy transition, transport, utilities, waste and social infrastructure, and a portfolio already spanning towers, fiber, data centers, renewables, midstream, airports and schools.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Social Infrastructure"],
    regions: ["Global"],
    structure: "Open-End",
  }),

  // ── Kuwait Investment Authority (KIA) ─────────────────────
  f("FUND-109", "Kuwait Investment Authority (KIA)", "Wren House Infrastructure", "Evergreen", "—", null, "Value-Add", "Evergreen", {
    investmentStrategy: "KIA's direct infrastructure arm builds a diversified OECD/global portfolio around energy transition, community, mobility and digital themes.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Social Infrastructure"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── La Caisse de dépôt et placement du Québec ─────────────
  f("FUND-110", "La Caisse de dépôt (CDPQ)", "CDPQ Infrastructure", "Evergreen", "C$75B", 55500, "Core", "Evergreen", {
    investmentStrategy: "Evergreen direct infrastructure program focused on tangible assets with stable long-term income across transport, power/renewables, public transit and, increasingly, telecom/data centres.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services", "Social Infrastructure"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Macquarie Asset Management ────────────────────────────
  f("FUND-111", "Macquarie Asset Management", "Macquarie Retail Infrastructure Fund", "Evergreen", "$1.1B", 1100, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Combined retail row covering METI's pure-play energy-transition strategy and MPIF's diversified global unlisted infrastructure access strategy.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-112", "Macquarie Asset Management", "Macquarie MGECO", "Evergreen", "[TBU]", null, "Core", "Evergreen", {
    investmentStrategy: "Core renewables/climate vehicle seeded with six solar, wind, storage and natural-climate-solutions investments, with initial deployment centered on solar, wind and batteries.",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Global"],
  }),
  f("FUND-113", "Macquarie Asset Management", "Macquarie MGETS", "2022", "$3.0B", 3000, "Opportunistic", "Financial Close", {
    investmentStrategy: "Dedicated transition-solutions fund beyond mature renewables, targeting storage, distributed energy, renewable fuels, clean transport, carbon capture and circular economy.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Waste / Environmental Services"],
    regions: ["Global"],
  }),
  f("FUND-114", "Macquarie Asset Management", "Macquarie MGIF", "Evergreen", "[$4.0B]", 4000, "Core", "Evergreen", {
    investmentStrategy: "Open-end global core infrastructure fund targeting energy/renewables, utilities, telecom and transportation, with early deployment reported across energy and transport in Europe and the US.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation"],
    regions: ["Global"],
  }),
  f("FUND-115", "Macquarie Asset Management", "Macquarie MIP VI", "2022", "$6.8B", 6800, "Core-Plus", "Financial Close", {
    investmentStrategy: "Latest vintage in Macquarie's Americas MIP series, continuing the platform's long-standing transport, digital, utilities/energy and waste playbook.",
    sectors: ["Digital Infrastructure", "Power Generation", "Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["North America"],
  }),
  f("FUND-116", "Macquarie Asset Management", "Macquarie MIP VII", "2025", "[$7.0B]", 7000, "Core-Plus", "Raising", {
    investmentStrategy: "Continuation fund for the MIP series; institutional media describes it as a core-plus vehicle for mid-market brownfield digital, transport, utilities, energy and waste assets.",
    sectors: ["Digital Infrastructure", "Power Generation", "Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["North America"],
  }),

  // ── Manulife Investment Management ────────────────────────
  f("FUND-117", "Manulife Investment Management", "Manulife MIF III", "2021", "$5.5B", 5500, "Core-Plus", "Financial Close", {
    investmentStrategy: "Third flagship North American mid-market core-plus vehicle; the lineage is most visibly concentrated in digital infrastructure, renewables/distributed energy and utilities.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
  }),

  // ── Meridiam ──────────────────────────────────────────────
  f("FUND-118", "Meridiam", "Meridiam MINA IV", "Raising", "$1.8B", 1800, "Core-Plus", "Raising", {
    investmentStrategy: "Fourth-generation North America Meridiam vehicle centered on critical public services and sustainable mobility, now broadened by fiber and water assets.",
    sectors: ["Digital Infrastructure", "Transportation", "Waste / Environmental Services", "Social Infrastructure"],
    regions: ["North America"],
  }),

  // ── Morgan Stanley ────────────────────────────────────────
  f("FUND-119", "Morgan Stanley Infrastructure Partners", "North Haven Infrastructure Partners IV", "2021", "$4.1B", 4100, "Value-Add", "Financial Close", {
    investmentStrategy: "Global/OECD infrastructure fund targeting inflation-linked assets in transport, digital, energy transition and utilities with active asset-management upside.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation"],
    regions: ["North America", "Europe"],
  }),

  // ── Morrison & Co ─────────────────────────────────────────
  f("FUND-120", "Morrison & Co", "Infratil", "Evergreen", "~$8.0B", 8000, "Core", "Evergreen", {
    investmentStrategy: "Listed evergreen infrastructure platform investing in renewables, digital infrastructure, healthcare and airports, with portfolio reality centered on connectivity, power transition and essential-service assets.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Social Infrastructure", "Transportation"],
    regions: ["Asia-Pacific", "North America", "Europe"],
    structure: "Listed / Evergreen",
  }),
  f("FUND-121", "Morrison & Co", "Morrison MIP", "Evergreen", ">$3.0B", 3000, "Core-Plus", "Evergreen", {
    investmentStrategy: "Open-ended core-plus infrastructure partnership targeting a high-quality, growth-exposed but defensive portfolio shaped by decarbonisation, climate adaptation and digital-infrastructure demand.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
  }),
  f("FUND-122", "Morrison & Co", "Morrison MVA II", "2025", "[$2.0B]", 2000, "Value-Add", "Raising", {
    investmentStrategy: "Global middle-market value-add fund targeting 8-12 investments across energy transition, digitisation/connectivity, mobility, aging-population and circular-economy themes.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Waste / Environmental Services", "Social Infrastructure"],
    regions: ["Global"],
  }),

  // ── Mubadala ──────────────────────────────────────────────
  f("FUND-123", "Mubadala Investment Company", "Mubadala Infrastructure", "Evergreen", "—", null, "Value-Add", "Evergreen", {
    investmentStrategy: "Scaling direct real-assets platform with highest conviction in digital infrastructure and energy transition, alongside power and transport.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Northampton Capital ───────────────────────────────────
  f("FUND-124", "Northampton Capital", "Northampton Flagship Fund Complex", "2024", "[$1.0B]", 1000, "Core-Plus", "Raising", {
    investmentStrategy: "Inaugural middle-market infrastructure complex focused on energy, digital and other critical infrastructure; early deployment is concentrated in data centers and renewable royalties.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America"],
  }),

  // ── Northleaf Capital Partners ────────────────────────────
  f("FUND-125", "Northleaf Capital Partners", "Northleaf NEIF", "Evergreen", ">$1.0B", 1000, "Core", "Evergreen", {
    investmentStrategy: "Evergreen open-end fund for mature mid-market infrastructure with stable cash flows, lower-risk profiles, and a portfolio that publicly appears centered on contracted digital, transport and energy-transition assets.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America"],
  }),
  f("FUND-126", "Northleaf Capital Partners", "Northleaf NICP IV", "2023", "$2.6B", 2600, "Core-Plus", "Financial Close", {
    investmentStrategy: "Northleaf's largest infrastructure vehicle; a control-oriented, contracted mid-market strategy mainly in North America, with actual deployment concentrated in digital, transport and energy-transition assets.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation"],
    regions: ["North America"],
  }),

  // ── OMERS ─────────────────────────────────────────────────
  f("FUND-127", "OMERS Infrastructure", "OMERS Infrastructure", "Evergreen", "C$33B", 24420, "Core-Plus", "Evergreen", {
    investmentStrategy: "Broad evergreen direct platform spanning energy, digital, transport and other government-regulated services, with a long current-and-realized portfolio history.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services", "Social Infrastructure"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── OTPP ──────────────────────────────────────────────────
  f("FUND-128", "Ontario Teachers' Pension Plan", "OTPP Infrastructure", "Evergreen", "C$32B", 23680, "Core", "Evergreen", {
    investmentStrategy: "Global core/core-plus essential-infrastructure platform across transport, utilities, water and renewables, now with a meaningful digital infrastructure sleeve.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── QIA ───────────────────────────────────────────────────
  f("FUND-129", "Qatar Investment Authority (QIA)", "QIA Infrastructure", "Evergreen", "—", null, "Core", "Evergreen", {
    investmentStrategy: "Core infrastructure platform centered on regulated utilities and gateway transport assets, with newer commitments in renewables and digital infrastructure.",
    sectors: ["Power Generation", "Utilities", "Transportation", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── QIC ───────────────────────────────────────────────────
  f("FUND-130", "QIC", "QIC QGIF II", "2023", "[$2.0B]", 2000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Thematic successor fund now concentrated on Australasian energy-transition infrastructure, while still sitting within QIC's broader diversified energy, transport and social infrastructure franchise.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation", "Social Infrastructure"],
    regions: ["Asia-Pacific"],
  }),

  // ── Quinbrook Infrastructure Partners ─────────────────────
  f("FUND-131", "Quinbrook Infrastructure Partners", "Quinbrook NZPF", "2021", "$3.0B", 3000, "Value-Add", "Financial Close", {
    investmentStrategy: "Value-add net-zero-power strategy focused on solar+storage, grid support, battery storage, renewable fuels and renewable-powered hyperscale data-center infrastructure.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["North America", "Europe", "Asia-Pacific"],
  }),

  // ── Ridgewood Infrastructure ──────────────────────────────
  f("FUND-132", "Ridgewood Infrastructure", "Ridgewood Water & Strategic Infrastructure Fund II", "2022", "$1.2B", 1200, "Opportunistic", "Financial Close", {
    investmentStrategy: "Lower-middle-market essential infrastructure strategy spanning water/wastewater, utilities, logistics/transport and selected energy-transition assets with active operational improvement.",
    sectors: ["Waste / Environmental Services", "Power Generation", "Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["North America"],
  }),

  // ── Sandbrook Capital ────────────────────────────────────
  f("FUND-133", "Sandbrook Capital", "Sandbrook Climate Infrastructure Fund II", "2025", "[$2.0B]", 2000, "Opportunistic", "Raising", {
    investmentStrategy: "Build-company climate strategy focused on clean power generation, transmission/storage, energy use and efficiency, grid resiliency and climate-enabling infrastructure, including clean-powered data-center platforms.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Digital Infrastructure"],
    regions: ["North America"],
  }),

  // ── SDC Capital Partners ──────────────────────────────────
  f("FUND-134", "SDC Capital Partners", "SDC Fund IV", "2022", "$2.1B", 2100, "Value-Add", "Financial Close", {
    investmentStrategy: "Pure-play digital infrastructure strategy across data centers, fiber, wireless, and cloud/IT platforms, with a development-heavy value-add orientation.",
    sectors: ["Digital Infrastructure"],
    regions: ["North America"],
  }),

  // ── Searchlight Capital Partners ──────────────────────────
  f("FUND-135", "Searchlight Capital Partners", "Searchlight Fiber Alliance", "Raising", "$1.5B", 1500, "Opportunistic", "Raising", {
    investmentStrategy: "Dedicated U.S. FTTH platform targeting underserved markets through utility/public-private partnerships and scalable next-generation fiber buildouts.",
    sectors: ["Digital Infrastructure"],
    regions: ["North America"],
  }),

  // ── Stonepeak ─────────────────────────────────────────────
  f("FUND-136", "Stonepeak", "Stonepeak Core Fund", "Evergreen", "~$6.0B", 6000, "Core", "Evergreen", {
    investmentStrategy: "Open-ended global/OECD core infrastructure fund targeting mature assets with cash yield and long-term inflation-linked revenues; publicly identifiable holdings to date are especially concentrated in towers/data centers and ports.",
    sectors: ["Digital Infrastructure", "Transportation", "Power Generation", "Utilities"],
    regions: ["Global"],
  }),
  f("FUND-137", "Stonepeak", "Stonepeak Fund V", "2023", "$15.0B", 15000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Fifth flagship Stonepeak diversified North American infrastructure strategy targeting high-barrier assets with durable cash flows; predecessor deployment shows recurring emphasis on digital/data, transport/logistics, and energy-related platforms.",
    sectors: ["Digital Infrastructure", "Midstream / Energy", "Transportation", "Power Generation", "Utilities"],
    regions: ["North America"],
  }),
  f("FUND-138", "Stonepeak", "Stonepeak Global Renewables Fund II", "2024", "[$5.0B]", 5000, "Core-Plus", "Raising", {
    investmentStrategy: "Follow-on Stonepeak renewables strategy focused on development/newbuild solar and wind in developed markets, with lineage spanning offshore wind, onshore wind, distributed solar, storage, RNG, and related energy-transition platforms.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Global"],
  }),
  f("FUND-139", "Stonepeak", "Stonepeak Opportunities Fund III", "2025", "[$4.0B]", 4000, "Opportunistic", "Raising", {
    investmentStrategy: "Public evidence aligns this 2025 current vehicle with Stonepeak Opportunities Fund II, the successor to the inaugural SOF I; strategy is a middle-market infrastructure / structured-capital sleeve focused on digital infrastructure, transport/logistics, and energy-related assets in North America and Europe.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation"],
    regions: ["North America", "Europe"],
  }),

  // ── Swiss Life Asset Managers ─────────────────────────────
  f("FUND-140", "Swiss Life Asset Managers", "SwissLife GIO Growth II", "2025", "[€1.0B]", 1100, "Value-Add", "Raising", {
    investmentStrategy: "Second Swiss Life value-add infrastructure fund, aimed at higher-growth unlisted assets where returns are driven by digitalisation, decarbonisation, mobility and operational value creation.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["Europe"],
  }),
  f("FUND-141", "Swiss Life Asset Managers", "SwissLife GIO IV", "2025", "[€2.5B]", 2750, "Core", "Raising", {
    investmentStrategy: "Fourth Swiss Life Core/Core+ fund, pursuing long-term brownfield-oriented direct infrastructure investments across OECD markets; the lineage reads as a diversified multi-sector core franchise rather than a narrow thematic sleeve.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation", "Social Infrastructure"],
    regions: ["Europe"],
  }),

  // ── Tallvine Partners ────────────────────────────────────
  f("FUND-142", "Tallvine Partners", "Tallvine Middle Market Infrastructure Fund I", "Raising", "—", null, "Value-Add", "Raising", {
    investmentStrategy: "Inaugural value-add middle-market infrastructure vehicle building North American platforms across transport/logistics, digital infrastructure, and eventually energy/utilities.",
    sectors: ["Transportation", "Digital Infrastructure"],
    regions: ["North America"],
  }),

  // ── Temasek ───────────────────────────────────────────────
  f("FUND-143", "Temasek", "Temasek Infrastructure", "Evergreen", "—", null, "Value-Add", "Evergreen", {
    investmentStrategy: "No named batch vehicle is disclosed; Temasek's official materials instead describe a direct/core-plus infrastructure program spanning digital enablers, energy transition/resilience, and ageing infrastructure through TPCs, partnerships, and funds.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation"],
    regions: ["Global", "Asia-Pacific"],
    structure: "Permanent Capital",
  }),

  // ── Tiger Infrastructure Partners ─────────────────────────
  f("FUND-144", "Tiger Infrastructure Partners", "Tiger Infrastructure Fund IV", "2024", "[$2.0B]", 2000, "Value-Add", "Raising", {
    investmentStrategy: "Latest fund in a lineage investing growth capital in essential-service infrastructure platforms across digital infrastructure, energy transition, and transportation.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
  }),

  // ── TPG ───────────────────────────────────────────────────
  f("FUND-145", "TPG", "TPG Peppertree Fund X", "2023", "$2.0B", 2000, "Opportunistic", "Financial Close", {
    investmentStrategy: "Specialized digital infrastructure strategy focused on wireless communications towers and adjacent communication assets such as fiber, DAS, spectrum, and rooftop rights.",
    sectors: ["Digital Infrastructure"],
    regions: ["North America"],
  }),
  f("FUND-146", "TPG", "TPG Rise Climate", "2025", "$6.6B", 6600, "Opportunistic", "Raising", {
    investmentStrategy: "Broad climate-solutions private-equity series within TPG Rise Climate, investing across clean power, electrification, industrial decarbonization, and circularity/environmental solutions, with some value-added infrastructure characteristics.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Waste / Environmental Services"],
    regions: ["Global"],
  }),

  // ── Ullico ────────────────────────────────────────────────
  f("FUND-147", "Ullico", "Ullico UIF", "Evergreen", "$2.0B", 2000, "Core", "Evergreen", {
    investmentStrategy: "North American essential-services infrastructure vehicle investing long term across utilities, transport, renewables, water and communications.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Midstream / Energy", "Transportation", "Waste / Environmental Services"],
    regions: ["North America"],
  }),

  // ── Vauban Infrastructure Partners ────────────────────────
  f("FUND-148", "Vauban Infrastructure Partners", "Vauban CIF IV", "2022", "€2.2B", 2420, "Core", "Financial Close", {
    investmentStrategy: "European core brownfield buy-and-hold fund focused on essential assets across digital, energy transition, mobility and social infrastructure.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation", "Social Infrastructure"],
    regions: ["Europe"],
  }),

  // ── Vision Ridge Partners ─────────────────────────────────
  f("FUND-149", "Vision Ridge Partners", "Vision Ridge SAF IV", "2023", "$2.4B", 2400, "Opportunistic", "Financial Close", {
    investmentStrategy: "Flagship sustainable real-assets strategy targeting the transition of energy, transportation and agriculture.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["North America"],
  }),
];

// ─── Build-Time Data Validation ─────────────────────────────

export function validateFundData(): string[] {
  const errors: string[] = [];
  const idSet = new Set<string>();
  const EXPECTED_COUNT = 149;

  for (const fund of funds) {
    // Unique IDs
    if (idSet.has(fund.id)) errors.push(`Duplicate ID: ${fund.id}`);
    idSet.add(fund.id);

    // Required fields
    if (!fund.managerName) errors.push(`${fund.id}: missing managerName`);
    if (!fund.fundName) errors.push(`${fund.id}: missing fundName`);
    if (!fund.vintage) errors.push(`${fund.id}: missing vintage`);
    if (fund.strategies.length === 0) errors.push(`${fund.id}: no strategies`);

    // Rationale present
    if (!fund.investmentStrategy) errors.push(`${fund.id} (${fund.fundName}): missing investmentStrategy`);

    // Strategy URL validation
    if (fund.strategyUrl && !fund.strategyUrl.startsWith("https://")) {
      errors.push(`${fund.id} (${fund.fundName}): strategyUrl must use HTTPS: ${fund.strategyUrl}`);
    }

    // Source URL HTTPS validation
    for (const url of fund.sourceUrls) {
      if (!url.startsWith("https://")) {
        errors.push(`${fund.id} (${fund.fundName}): sourceUrl must use HTTPS: ${url}`);
      }
    }
  }

  // Count check
  if (funds.length !== EXPECTED_COUNT) {
    errors.push(`Expected ${EXPECTED_COUNT} funds, got ${funds.length}`);
  }

  return errors;
}
