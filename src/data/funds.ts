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

// ─── Fund Manifest (160 funds) ──────────────────────────────
// FUND-001: 3i Infrastructure plc (3i Group)
// FUND-002: 3i North American Infrastructure Fund (3i Group)
// FUND-003: ADIA Direct Infrastructure (Abu Dhabi Investment Authority)
// FUND-004: Climate and Communities Investment Coalition (Acadia / Microsoft)
// FUND-005: Acadia Infrastructure Capital LP (Acadia Infrastructure Capital)
// FUND-006: International Public Partnerships (INPP) (Amber Infrastructure Group)
// FUND-007: Ancala Infrastructure Fund III (Ancala Partners)
// FUND-008: Flagship Fund V (Antin Infrastructure Partners)
// FUND-009: Mid Cap Fund I (Antin Infrastructure Partners)
// FUND-010: NextGen Fund I (Antin Infrastructure Partners)
// FUND-011: APG Direct Infrastructure Pool (APG Asset Management)
// FUND-012: Argo Infrastructure Partners Series 4 (Apollo / Argo)
// FUND-013: Apollo Infrastructure Opportunities Fund III (Apollo Global Management)
// FUND-014: Apollo Core Infrastructure Fund (Apollo Global Management)
// FUND-015: Apollo Infrastructure Company LLC (AIC) (Apollo Global Management)
// FUND-016: Apollo Clean Transition Equity Partners II (Apollo Global Management)
// FUND-017: Apollo Clean Transition Equity ELTIF (Apollo Global Management)
// FUND-018: Apollo Infrastructure Opportunities Fund II (Apollo Global Management)
// FUND-019: Ara Infrastructure Fund I (Ara Partners)
// FUND-020: Ara Energy Decarbonization Fund I (Ara Partners)
// FUND-021: ArcLight Infrastructure Partners Fund VIII (ArcLight Capital Partners)
// FUND-022: ArcLight Power Infrastructure Partners (ArcLight Capital Partners)
// FUND-023: Ardian Infrastructure Fund VI (Ardian)
// FUND-024: Ardian Americas Infrastructure Fund V (Ardian)
// FUND-025: Ardian Clean Energy Evergreen Fund (ACEEF) (Ardian)
// FUND-026: Ares Climate Infrastructure Partners II (Ares Management)
// FUND-027: Ares Core Infrastructure Fund (ACI) (Ares Management)
// FUND-028: Astatine Infrastructure Fund IV (Astatine Investment Partners)
// FUND-029: Australian Super Infrastructure Portfolio (AustralianSuper)
// FUND-030: Basalt Infrastructure Partners IV (Basalt Infrastructure Partners)
// FUND-031: Basalt Infrastructure Partners V (Basalt Infrastructure Partners)
// FUND-032: BCP Infrastructure Fund II (Bernhard Capital Partners)
// FUND-033: BlackRock Global Infrastructure Fund IV (BlackRock)
// FUND-034: BlackRock Global Renewable Power Fund IV (GRP IV) (BlackRock)
// FUND-035: BlackRock Evergreen Infra Partners Fund (BlackRock)
// FUND-036: Blackstone Infrastructure Partners (BIP) (Blackstone)
// FUND-037: Blackstone Energy Transition Partners IV (Blackstone)
// FUND-038: BCI Infrastructure & Renewable Resources Program (BCI)
// FUND-039: Brookfield Infrastructure Fund V (BIF V) (Brookfield)
// FUND-040: Brookfield Super-Core Infrastructure Partners (Brookfield)
// FUND-041: Brookfield Global Transition Fund II (BGTF II) (Brookfield)
// FUND-042: Brookfield Infrastructure Solutions (BISS I) (Brookfield)
// FUND-043: Brookfield Infrastructure Income Fund (BII) (Brookfield)
// FUND-044: Canada Growth Fund (Canada Development Investment Corporation)
// FUND-045: Carlyle Global Infrastructure Opportunity Fund II (Carlyle Group)
// FUND-046: Carlyle Renewable & Sustainable Energy Fund II (Carlyle Group)
// FUND-047: CBRE Musselshell Infrastructure Investments (CBRE Caledon)
// FUND-048: CIM Infrastructure Fund III (CIM Group)
// FUND-049: Copenhagen Infrastructure V (CI V) (Copenhagen Infrastructure Partners)
// FUND-050: CI Advanced Bioenergy Fund I (CI ABF I) (Copenhagen Infrastructure Partners)
// FUND-051: CI Advanced Bioenergy Fund II (CI ABF II) (Copenhagen Infrastructure Partners)
// FUND-052: CPP Investments Infrastructure (CPP Investments)
// FUND-053: CVC DIF Infrastructure VIII (CVC DIF)
// FUND-054: CVC DIF Value-Add IV (CVC DIF)
// FUND-055: DIF Infrastructure VII (CVC DIF)
// FUND-056: DIF Core-Plus Infrastructure Fund III (CIF III) (CVC DIF)
// FUND-057: DigitalBridge Partners III (DigitalBridge)
// FUND-058: DigitalBridge Strategic Asset Fund (DigitalBridge)
// FUND-059: Duration Transportation Infrastructure Capital Partners (Duration Capital)
// FUND-060: Ember Infrastructure Fund II (Ember Infrastructure Management)
// FUND-061: EnCap Flatrock Midstream Fund V (EnCap Investments)
// FUND-062: EnCap Energy Transition Fund II (EnCap Investments)
// FUND-063: EnCap Energy Transition Fund III (EnCap Investments)
// FUND-064: Energy Capital Partners VI (Energy Capital Partners)
// FUND-065: ECP Energy Transition Opportunities Fund (Energy Capital Partners)
// FUND-066: EIP III (Global Energy Transition Infrastructure) (Energy Infrastructure Partners)
// FUND-067: EQT Infrastructure VI (EQT)
// FUND-068: EQT Active Core Infrastructure I (EQT)
// FUND-069: EQT Transition Infrastructure (EQT)
// FUND-070: Fengate Infrastructure Fund IV (Fengate Asset Management)
// FUND-071: Fengate Infrastructure Yield Fund (Fengate Asset Management)
// FUND-072: Generate Capital Sustainable Infrastructure Fund (Generate Capital)
// FUND-073: Generate Capital (Permanent Capital Vehicle) (Generate Capital)
// FUND-074: GIC Infrastructure (GIC)
// FUND-075: AI Infrastructure Partnership (AIP) (GIP/MGX/Microsoft)
// FUND-076: Global Infrastructure Partners V (GIP V) (Global Infrastructure Partners / BlackRock)
// FUND-077: GIP Mid-Market Fund V (Global Infrastructure Partners / BlackRock)
// FUND-078: Global Infrastructure Partners Core Fund (Global Infrastructure Partners / BlackRock)
// FUND-079: West Street Infrastructure Partners V (WSIP V) (Goldman Sachs Alternatives)
// FUND-080: West Street Infrastructure Partners IV (WSIP IV) (Goldman Sachs Alternatives)
// FUND-081: West Street Private Infrastructure Fund (G-INFRA) (Goldman Sachs Alternatives)
// FUND-082: H.I.G. Infrastructure Partners Fund I (H.I.G. Capital)
// FUND-083: Harbert Infrastructure Fund VI (Harbert Management Corporation)
// FUND-084: Harrison Street Social Infrastructure Fund (Harrison Street)
// FUND-085: Harrison Street Energy Transition Fund (Harrison Street)
// FUND-086: Harrison Street Digital Fund (Harrison Street)
// FUND-087: ISQ Global Infrastructure Fund IV (I Squared Capital)
// FUND-088: ISQ Energy Transition Infrastructure Fund (I Squared Capital)
// FUND-089: iCON Infrastructure Partners VII (ICON Infrastructure)
// FUND-090: IFM Global Infrastructure Fund (GIF) (IFM Investors)
// FUND-091: IFM Net Zero Infrastructure Fund (NZIF) (IFM Investors)
// FUND-092: IFM Global Value Add Infrastructure Fund (IFM Investors)
// FUND-093: North American Diversified Infrastructure Fund (NADIF) (Igneo / First Sentier)
// FUND-094: Global Diversified Infrastructure Fund (GDIF) (Igneo / First Sentier)
// FUND-095: InfraBridge Global Infrastructure Fund III (GIF III) (InfraBridge / DigitalBridge)
// FUND-096: InfraRed Infrastructure Fund VI (InfraRed Capital Partners)
// FUND-097: InfraRed Infrastructure Fund VII (InfraRed Capital Partners)
// FUND-098: HICL Infrastructure PLC (InfraRed Capital Partners)
// FUND-099: North American Core Income Energy Transition Fund (InfraRed Capital Partners)
// FUND-100: InfraVia European Fund VI (InfraVia Capital Partners)
// FUND-101: IMCO Infrastructure Fund (IMCO)
// FUND-102: Infrastructure Investments Fund (IIF) (J.P. Morgan Asset Management)
// FUND-103: Global Transport Income Fund (GTIF) (J.P. Morgan Asset Management)
// FUND-104: Kimmeridge Carbon Solutions Fund II (Kimmeridge)
// FUND-105: KKR Global Infrastructure Investors V (KKR)
// FUND-106: Diversified Core Infra Fund (DCIF) (KKR)
// FUND-107: Global Climate Transition Fund (KKR)
// FUND-108: KKR Infrastructure Fund (K-INFRA) (KKR)
// FUND-109: Wren House Infrastructure (Captive Platform) (Kuwait Investment Authority)
// FUND-110: Macquarie Energy Transition Infrastructure Fund (METI) (Macquarie Asset Management)
// FUND-111: Macquarie Infrastructure Partners VI (MIP VI) (Macquarie Asset Management)
// FUND-112: Macquarie Infrastructure Partners VII (MIP VII) (Macquarie Asset Management)
// FUND-113: Macquarie Global Infrastructure Fund (MGIF) (Macquarie Asset Management)
// FUND-114: Macquarie Green Energy Transition Solutions (MGETS) (Macquarie Asset Management)
// FUND-115: Macquarie Green Energy and Climate Opportunities Fund (Macquarie Asset Management)
// FUND-116: Meridiam Infrastructure North America IV (MINA IV) (Meridiam)
// FUND-117: Mirova Energy Transition 6 (MET6) (Mirova)
// FUND-118: North Haven Infrastructure Partners IV (Morgan Stanley Investment Management)
// FUND-119: Infratil Limited (Morrison & Co.)
// FUND-120: Mubadala Infrastructure (Real Assets) (Mubadala Investment Company)
// FUND-121: Northleaf Infrastructure Capital Partners IV (NICP IV) (Northleaf Capital Partners)
// FUND-122: Northleaf Essential Infrastructure Fund (NEIF) (Northleaf Capital Partners)
// FUND-123: NOVA Infrastructure Fund II (NOVA Infrastructure)
// FUND-124: Nuveen Clean Energy Strategy IV (Nuveen / Glennmont Partners)
// FUND-125: OMERS Infrastructure Fund (OMERS)
// FUND-126: OTPP Infrastructure & Natural Resources (Ontario Teachers' Pension Plan)
// FUND-127: Partners Group Direct Infrastructure IV (Partners Group)
// FUND-128: Partners Group Next Generation Infrastructure Programs (Partners Group)
// FUND-129: Patria Infrastructure Fund V (Patria Investments)
// FUND-130: QIC Global Infrastructure Fund II (QGIF II) (QIC)
// FUND-131: QIC Infrastructure Portfolio (QIP) (QIC)
// FUND-132: Quinbrook Net Zero Power Fund (Quinbrook Infrastructure Partners)
// FUND-133: Ridgewood Water & Strategic Infrastructure Fund II (Ridgewood Infrastructure)
// FUND-134: Schroders Capital Semi-Liquid Global Energy Infrastructure (Schroders Capital)
// FUND-135: Schroders Greencoat Global Renewables+ LTAF (Schroders Greencoat)
// FUND-136: Stonepeak Infrastructure Fund V (Stonepeak)
// FUND-137: Stonepeak Global Renewables Fund II (Stonepeak)
// FUND-138: Stonepeak Opportunities Fund (Stonepeak)
// FUND-139: Stonepeak Opportunities Fund II (Stonepeak)
// FUND-140: Stonepeak Core Fund (Stonepeak)
// FUND-141: Swiss Life Funds (LUX) Global Infrastructure Opportunities IV (Swiss Life Asset Managers)
// FUND-142: Swiss Life Funds (LUX) ESG Global Infrastructure Opportunities Growth II (Swiss Life AM)
// FUND-143: Fontavis ESG Renewable Infrastructure Fund II (Swiss Life AM / Fontavis)
// FUND-144: Tallvine Middle Market Infrastructure Fund I (Tallvine Partners)
// FUND-145: Tiger Infrastructure Partners Fund IV (Tiger Infrastructure Partners)
// FUND-146: TPG Rise Climate II (TPG)
// FUND-147: TPG Rise Climate Transition Infrastructure (TRC TI) (TPG)
// FUND-148: TPG Peppertree Capital Fund X (TPG / Peppertree Capital)
// FUND-149: True Green Capital Fund IV (True Green Capital Management)
// FUND-150: True Green Capital Fund V (True Green Capital Management)
// FUND-151: Core Infrastructure Fund IV (CIF IV) (Vauban Infrastructure Partners)
// FUND-152: Core Infrastructure Fund V (CIF V) (Vauban Infrastructure Partners)
// FUND-153: Sustainable Asset Fund IV (SAF IV) (Vision Ridge Partners)
// FUND-154: Wafra Real Assets & Infrastructure Fund II (Wafra Inc.)
// FUND-155: Wafra Real Assets & Infrastructure Platform (SMA) (Wafra Inc.)
// FUND-157: Axium Infrastructure Canada II L.P. (Axium Infrastructure)
// FUND-158: AxInfra US L.P. (Axium Infrastructure)
// FUND-161: AxInfra US II L.P. (Axium Infrastructure)
// FUND-164: AxInfra US III L.P. (Axium Infrastructure)
// FUND-166: Axium Infrastructure NA IV L.P. (Axium Infrastructure)
// ─── End Manifest ──────────────────────────────────────────

export const funds: Fund[] = [
  // ── 3i Group ──────────────────────────────────────────────
  f("FUND-001", "3i Group", "3i Infrastructure plc", "2007", "£3.8B", 4940, "Core-Plus", "Evergreen", {
    investmentStrategy: "London-listed, FTSE 250 evergreen investment company targeting mid-market core-plus infrastructure equity in utilities, transportation, digital (towers, data centres, fibre), and social infrastructure. Seeks controlling or significant minority positions in businesses benefiting from megatrends such as the energy transition and digitalisation, primarily across the UK and Western Europe, with a target total return of 8–10% per annum. Portfolio includes Tampnet (offshore telecoms), Belfast City Airport, and Infinis (landfill gas-to-energy).",
    sourceUrls: ["https://www.3i.com/infrastructure/our-funds/", "https://www.3i-infrastructure.com/about-us/investment-manager/investment-policy/"],
    sectors: ["Digital Infrastructure", "Transportation", "Utilities", "Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Europe", "North America", "Asia-Pacific"],
    structure: "Listed / Evergreen",
    ticker: "3IN.L",
    strategyUrl: "https://www.3i-infrastructure.com/about-us/investment-manager/investment-policy/",
  }),
  f("FUND-002", "3i Group", "3i North American Infrastructure Fund", "2022", "$739M", 739, "Core-Plus", "Financial Close", {
    investmentStrategy: "Closed-end mid-market core-plus fund targeting equity investments exclusively in North American infrastructure across transportation, waste management, and essential services. Applies an active, theme-driven asset management approach — identifying megatrends such as the energy transition, digitalisation, and demographic change — and pursues bolt-on acquisitions alongside direct platform investments. Portfolio includes Regional Rail, Smarte Carte (airport services), and waste management platforms Amwaste and EC Waste.",
    sourceUrls: ["https://www.3i.com/media/fkcntktr/infrastructure_business_review.pdf", "https://www.3i.com/media/news/2025/3i-announces-sale-of-its-investment-in-shared-tower/"],
    sectors: ["Digital Infrastructure", "Transportation", "Waste / Environmental Services", "Communications"],
    regions: ["North America"],
    strategyUrl: "https://www.3i.com/media/fkcntktr/infrastructure_business_review.pdf",
  }),

  // ── Abu Dhabi Investment Authority (ADIA) ─────────────────
  f("FUND-003", "Abu Dhabi Investment Authority (ADIA)", "ADIA Direct Infrastructure", "2007", "$47.6B", 47600, "Core", "Evergreen", {
    investmentStrategy: "Sovereign wealth vehicle deploying long-term direct capital into infrastructure globally across four core verticals: transportation, digital infrastructure, utilities, and energy (including a growing renewable energy portfolio). Typically takes minority equity stakes alongside experienced partners, with a focus on developed markets complemented by increasing exposure to high-growth emerging economies. Notable holdings include NSW Ports (Australia), Gatwick Airport, and major utility and transport assets across OECD markets.",
    sourceUrls: ["https://www.adia.ae/en/investments/infrastructure", "https://www.infrastructureinvestor.com/global-investor-ranking/", "https://www.nswports.com.au/about-nsw-ports", "https://www.adia.ae/en/investments"],
    sectors: ["Transportation", "Utilities", "Power Generation", "Digital Infrastructure"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.adia.ae/en/investments/infrastructure",
  }),

  // ── Acadia Infrastructure Capital ─────────────────────────
  f("FUND-004", "Acadia Infrastructure Capital", "Climate and Communities Investment Coalition", "2024", "$9.0B", 9000, "Value-Add", "Financial Close", {
    investmentStrategy: "US-focused investment coalition anchored by Microsoft, targeting the development of 5 GW of mid-market renewable energy projects — beginning with utility-scale solar — that deliver both clean energy procurement and measurable community and environmental justice benefits. Deploys structured and tax equity instruments alongside traditional equity into projects supported by the Sustain Our Future Foundation. Also targets battery storage and community energy projects in disadvantaged communities.",
    sourceUrls: ["https://carboncredits.com/microsofts-9-billion-power-move-revolutionizing-u-s-clean-energy-and-communities/", "https://www.sustainourfuture.org/news-updates"],
    sectors: ["Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://carboncredits.com/microsofts-9-billion-power-move-revolutionizing-u-s-clean-energy-and-communities/",
  }),
  f("FUND-005", "Acadia Infrastructure Capital", "Acadia Infrastructure Capital LP", "2023", "$107.4M", 107, "Value-Add", "Financial Close", {
    investmentStrategy: "US-focused specialist manager deploying tax credits, structured equity, and hybrid capital into mid-market clean energy and decarbonization infrastructure projects across North America, with an emphasis on proven energy transition assets including renewable generation and storage. Applies bespoke product structuring — including alternatives to traditional IRA-driven tax equity — to serve projects underserved by conventional capital. Investments include JVR Energy Park, Peregrine Energy Storage, Pivot Energy (community solar), and Stillhouse Solar Project.",
    sourceUrls: ["https://radientanalytics.com/firm/adv/acadia-infrastructure-capital-lp-326032", "https://www.acadiainfrastructure.com/team", "https://www.acadiainfrastructure.com/about"],
    sectors: ["Renewables / Energy Transition", "Utilities"],
    regions: ["North America"],
    strategyUrl: "https://www.acadiainfrastructure.com/about",
  }),

  // ── Amber Infrastructure Group ────────────────────────────
  f("FUND-006", "Amber Infrastructure Group", "International Public Partnerships (INPP)", "2006", "£2.6B", 3380, "Core", "Evergreen", {
    investmentStrategy: "London Stock Exchange-listed core infrastructure investment company investing in a diversified portfolio of over 140 operational and construction-phase public infrastructure assets across the UK, Australia, Europe, and North America. Targets PPP/PFI projects and public-facing regulated assets — including gas distribution, education, healthcare, digital, transport, and nuclear — generating long-term, availability-based or regulated revenues with high inflation linkage.",
    sourceUrls: ["https://www.internationalpublicpartnerships.com/media/ydhbl4op/inpp-2023-fy-factsheet-vf.pdf", "https://www.edisongroup.com/research/responsible-growing-and-protected/BM-2225/"],
    sectors: ["Social Infrastructure", "Utilities", "Transportation"],
    regions: ["Europe", "North America", "Asia-Pacific"],
    structure: "Listed / Evergreen",
    ticker: "INPP.L",
    strategyUrl: "https://www.internationalpublicpartnerships.com/media/ydhbl4op/inpp-2023-fy-factsheet-vf.pdf",
  }),

  // ── Ancala Partners ───────────────────────────────────────
  f("FUND-007", "Ancala Partners", "Ancala Infrastructure Fund III", "2022", "€1.4B", 1540, "Value-Add", "Financial Close", {
    investmentStrategy: "Mid-market, core-to-core-plus European infrastructure fund targeting bilateral, off-market acquisitions in essential sectors including renewable energy and the energy transition, transport, utilities, and the circular economy. Emphasises downside protection, inflation linkage, and strong cash yield alongside active asset management to drive sustainable value creation, with a primary geographic focus on Western Europe.",
    sourceUrls: ["https://ancala.com/ancala-announces-final-close-of-third-flagship-infrastructure-fund/", "https://irei.com/news/texas-trs-commits-124m-to-infrastructure-in-august/"],
    sectors: ["Utilities", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://ancala.com/ancala-announces-final-close-of-third-flagship-infrastructure-fund/",
  }),

  // ── Antin Infrastructure Partners ─────────────────────────
  f("FUND-008", "Antin Infrastructure Partners", "Flagship Fund V", "2022", "€10.2B", 11220, "Value-Add", "Financial Close", {
    investmentStrategy: "Large-cap infrastructure fund targeting controlling equity stakes in energy and environment, digital infrastructure, transport, and social infrastructure businesses across Europe and North America. Writes cheques of €600 million to over €1 billion per investment and pursues buy-and-build growth strategies, with a significantly expanded North American LP base.",
    sourceUrls: ["https://www.antin-ip.com/media/our-news/antin-infrastructure-partners-closes-flagship-fund-v-above-e10-billion-target"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.antin-ip.com/media/our-news/antin-infrastructure-partners-closes-flagship-fund-v-above-e10-billion-target",
  }),
  f("FUND-009", "Antin Infrastructure Partners", "Mid Cap Fund I", "2021", "€2.2B", 2420, "Value-Add", "Financial Close", {
    investmentStrategy: "Mid-cap fund targeting smaller and mid-sized infrastructure companies across energy and environment, digital/telecom, transport, and social sectors in Europe and North America, with individual investments typically ranging from €50M to €300M. Capitalises on the underserved mid-cap segment of the infrastructure market vacated by larger managers.",
    sourceUrls: ["https://www.goodwinlaw.com/en/news-and-events/news/2021/07/07_01-goodwin-advises-antin-infrastructure", "https://pitchbook.com/profiles/fund/18601-12F", "https://www.antin-ip.com/media/our-news/swiftair-european-leader-in-outsourced-express-airfreight-welcomes-antin-to-accelerate-its-growth"],
    sectors: ["Digital Infrastructure", "Waste / Environmental Services", "Transportation"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.goodwinlaw.com/en/news-and-events/news/2021/07/07_01-goodwin-advises-antin-infrastructure",
  }),
  f("FUND-010", "Antin Infrastructure Partners", "NextGen Fund I", "2021", "€1.2B", 1320, "Opportunistic", "Financial Close", {
    investmentStrategy: "Opportunistic, growth-oriented fund targeting businesses with proven models and technologies that require substantial capital to scale into the next generation of infrastructure, investing across energy transition, digital transition, sustainable mobility, and social sectors in Europe and North America. Seeks mid-teen returns from assets with infrastructure-like characteristics such as long-term public sector contracts and high barriers to entry.",
    sourceUrls: ["https://www.businesswire.com/news/home/20240306210403/en/Antin-Strong-Financial-Performance-in-2023-Net-Income-up-60", "https://www.antin-ip.com/media/our-news/antin-plans-to-take-a-majority-stake-in-matawan-a-leading-smart-mobility-platform", "https://ionanalytics.com/insights/infralogic/antin-pushes-infra-boundaries-with-transport-software-investment/"],
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.businesswire.com/news/home/20240306210403/en/Antin-Strong-Financial-Performance-in-2023-Net-Income-up-60",
  }),

  // ── APG Asset Management ──────────────────────────────────
  f("FUND-011", "APG Asset Management", "APG Direct Infrastructure Pool", "2004", "€32B", 35200, "Core-Plus", "Evergreen", {
    investmentStrategy: "Europe’s largest pension investor deploying long-duration capital directly into global unlisted infrastructure across five strategic themes: decarbonised mobility and transport, clean and connected renewable power, digital infrastructure, circular economy, and quality of life assets. Invests through a bespoke asset management approach, increasingly expanding into Asia-Pacific alongside its established European and North American base, often co-investing collaboratively with other large pension partners. Notable holdings include Brisa (Portuguese motorways) and stakes in major European utilities.",
    sourceUrls: ["https://assetmanagement.apg.nl/infrastructure/", "https://apg.nl/media/oyim14yz/201013-brisa-closing.pdf"],
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Global", "North America", "Europe"],
    structure: "Permanent Capital",
    strategyUrl: "https://assetmanagement.apg.nl/infrastructure/",
  }),

  // ── Apollo (Argo Infrastructure Partners) ─────────────────
  f("FUND-012", "Apollo Global Management", "Argo Infrastructure Partners Series 4", "2024", "$6.0B", 6000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Core and core-plus mid-market North American infrastructure fund targeting essential services assets across digital infrastructure, renewable energy, transportation, and utilities across the US and Canada. Long-term, responsible investment philosophy focuses on assets that provide essential services to communities over long operational lives, building a portfolio including data centre, parking, utility gas, and environmental services platforms. Apollo acquired Argo in 2024 to expand its infrastructure capabilities across power, utilities, and energy transition.",
    sourceUrls: ["https://ir.apollo.com/news-events/press-releases/detail/533/apollo-to-acquire-argo-infrastructure-partners"],
    sectors: ["Utilities", "Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://ir.apollo.com/news-events/press-releases/detail/533/apollo-to-acquire-argo-infrastructure-partners",
  }),
  f("FUND-013", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund III", "2023", "$2.5B", 2500, "Value-Add", "Financial Close", {
    investmentStrategy: "Mid-market value-add infrastructure fund targeting control-oriented acquisitions, corporate carve-outs, and structured solutions across communications, power and renewables, transportation, and digital infrastructure in North America and Europe. Leverages Apollo’s integrated capital markets capabilities to source complexity-driven deals at attractive entry points.",
    sourceUrls: ["https://ionanalytics.com/insights/uncategory/apollo-nears-flagship-infra-fund-close-below-target/", "https://www.infrastructureinvestor.com/apollo-bulks-up-capabilities-with-argo-infrastructure-partners-acquisition/"],
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["North America"],
    strategyUrl: "https://ionanalytics.com/insights/uncategory/apollo-nears-flagship-infra-fund-close-below-target/",
  }),
  f("FUND-014", "Apollo Global Management", "Apollo Core Infrastructure Fund", "2021", "$389.2M", 389, "Core", "Financial Close", {
    investmentStrategy: "Core infrastructure vehicle targeting assets with stable, long-term contracted cash flows and predictable income — primarily in digital infrastructure, energy transition, power/utilities, and transportation/logistics. Leverages Apollo’s full origination platform, including direct debt capabilities and operational asset management resources.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/23399-11F", "https://capedge.com/company/1398053/apollo-management-lp"],
    sectors: ["Utilities", "Transportation", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://pitchbook.com/profiles/fund/23399-11F",
  }),
  f("FUND-015", "Apollo Global Management", "Apollo Infrastructure Company LLC (AIC)", "2023", "$1.7B", 1700, "Core-Plus", "Evergreen", {
    investmentStrategy: "Perpetual-capital operating company structured to be a long-term owner, operator, and capital provider to infrastructure assets globally, seeking a combination of current income and capital appreciation across digital infrastructure, energy transition, transportation, and sustainable living subsectors. Taps Apollo’s integrated platform — including proprietary deal flow and credit origination — to execute control-oriented acquisitions and carve-outs. Structured as a non-traded vehicle for wealth investors.",
    sourceUrls: ["https://www.apollo.com/wealth/strategies/products/apollo-infrastructure-company", "https://www.sec.gov/Archives/edgar/data/1971381/000119312525068918/d888030d10k.htm"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    strategyUrl: "https://www.apollo.com/wealth/strategies/products/apollo-infrastructure-company",
  }),
  f("FUND-016", "Apollo Global Management", "Apollo Clean Transition Equity Partners II", "2023", "$411M", 411, "Opportunistic", "Financial Close", {
    investmentStrategy: "Dedicated closed-end fund investing in companies and projects at the core of the energy transition and industrial decarbonization, including energy transition infrastructure, sustainable mobility, sustainable resource use, and sustainable real estate globally. Part of Apollo’s broader Clean Transition Capital platform targeting $50B in climate capital deployment.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/24869-17F"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://pitchbook.com/profiles/fund/24869-17F",
  }),
  f("FUND-017", "Apollo Global Management", "Apollo Clean Transition Equity ELTIF", "2023", "Undisclosed", null, "Opportunistic", "Financial Close", {
    investmentStrategy: "Luxembourg-domiciled ELTIF designed to offer European wealth investors access to private equity opportunities in clean energy transition and sustainable industrial transformation, mirroring the strategy of Apollo’s Clean Transition Equity Partners series. Distributed via bank and wealth management networks across Europe through an ELTIF 2.0-compliant vehicle, including through UniCredit.",
    sourceUrls: ["https://ir.apollo.com/news-events/press-releases/detail/483/apollo-adds-eltif-to-wealth-product-platform-following-cssf", "https://www.unicreditgroup.eu/en/press-media/press-releases/2024/january/unicredit-to-offer-apollo-clean-transition-equity-eltif-to-wealt.html", "https://www.scopeexplorer.com/en/details/apollo-clean-transition-equity-eltif/149638"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://ir.apollo.com/news-events/press-releases/detail/483/apollo-adds-eltif-to-wealth-product-platform-following-cssf",
  }),
  f("FUND-018", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund II", "2020", "$2.54B", 2540, "Value-Add", "Financial Close", {
    investmentStrategy: "Mid-market value-add infrastructure fund targeting control acquisitions, carve-outs, and structured solutions across communications/digital, power and renewables (including offshore wind, energy storage, and solar), and transportation in North America and Europe. Built a portfolio spanning fibre telecom, renewable royalties, utility-scale offshore wind, and battery energy storage.",
    sourceUrls: ["https://ir.apollo.com/news-events/press-releases/detail/38/apollo-closes-second-dedicated-infrastructure-fund-with"],
    sectors: ["Renewables / Energy Transition", "Utilities", "Transportation"],
    regions: ["North America"],
    strategyUrl: "https://ir.apollo.com/news-events/press-releases/detail/38/apollo-closes-second-dedicated-infrastructure-fund-with",
  }),
  // ── Ara Partners ───────────────────────────────────────────
  f("FUND-019", "Ara Partners", "Ara Infrastructure Fund I", "2022", "$800M", 800, "Value-Add", "Financial Close", {
    investmentStrategy: "Inaugural infrastructure fund targeting mid-market assets focused on the decarbonization of the industrial economy across North America and Europe, investing in the development, re-purposing, and optimization of infrastructure in sectors including industrial and manufacturing, chemicals, logistics, fuels, and waste management. Targets assets often overlooked by larger-cap and conventional renewables managers, with a mandate to deliver 60%+ greenhouse gas emissions reductions at the asset level.",
    sourceUrls: ["https://www.prnewswire.com/news-releases/ara-partners-reaches-final-close-for-inaugural-infrastructure-fund-surpassing-target-302443285.html"],
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.prnewswire.com/news-releases/ara-partners-reaches-final-close-for-inaugural-infrastructure-fund-surpassing-target-302443285.html",
  }),
  f("FUND-020", "Ara Partners", "Ara Energy Decarbonization Fund I", "2024", "$725M", 725, "Value-Add", "Financial Close", {
    investmentStrategy: "Strategy launched in partnership with HF Capital targeting the acquisition, optimization, and decarbonization of conventional energy assets across North America — specifically in thermal power generation, merchant biofuels production, and retail energy distribution. Applies Ara’s proven industrial decarbonization methods to hard-to-abate conventional energy infrastructure such as ethanol plants and natural gas power generation.",
    sourceUrls: ["https://www.prnewswire.com/news-releases/ara-partners-launches-new-strategy-to-decarbonize-conventional-energy-value-chain-in-partnership-with-hf-capital-302248969.html"],
    sectors: ["Midstream / Energy", "Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.prnewswire.com/news-releases/ara-partners-launches-new-strategy-to-decarbonize-conventional-energy-value-chain-in-partnership-with-hf-capital-302248969.html",
  }),

  // ── ArcLight Capital Partners ─────────────────────────────
  f("FUND-021", "ArcLight Capital Partners", "ArcLight Infrastructure Partners Fund VIII", "2023", "$3.0B", 3000, "Opportunistic", "Raising", {
    investmentStrategy: "Value-add, middle-market infrastructure fund targeting power generation, renewable energy, battery storage, and strategic gas infrastructure in North America, capitalising on the tightening power market driven by data centre growth and electrification. Operationally intensive investment approach supported by in-house strategic, technical, and commercial specialists focusing on repurposing, repositioning, and optimising hard assets.",
    sourceUrls: ["https://irei.com/news/arclight-infrastructure-partners-fund-viii-nears-3b-fundraising-goal/", "https://pitchbook.com/profiles/fund/24871-06F"],
    sectors: ["Power Generation", "Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["North America"],
    strategyUrl: "https://irei.com/news/arclight-infrastructure-partners-fund-viii-nears-3b-fundraising-goal/",
  }),
  f("FUND-022", "ArcLight Capital Partners", "ArcLight Power Infrastructure Partners", "2024", "$250M", 250, "Opportunistic", "Financial Close", {
    investmentStrategy: "Middle-market, operationally intensive fund focused on electric power generation, renewable energy (wind, solar, hydro, battery storage), strategic gas transmission and storage, and transformative electrification infrastructure across North America. Leverages ArcLight’s 20+ year track record of owning and managing over 65 GW of power assets, with a growing emphasis on assets enabling the data centre and electrification megatrends.",
    sourceUrls: ["https://radientanalytics.com/firm/adv/arclight-capital-partners-llc-161228", "https://pitchbook.com/profiles/fund/27828-01F"],
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://radientanalytics.com/firm/adv/arclight-capital-partners-llc-161228",
  }),

  // ── Ardian ────────────────────────────────────────────────
  f("FUND-023", "Ardian", "Ardian Infrastructure Fund VI", "2023", "€13.5B", 14850, "Core-Plus", "Financial Close", {
    investmentStrategy: "Record-setting core-plus European infrastructure fund (part of a €20B platform including co-investments) targeting essential infrastructure across three verticals — energy (renewable power and utilities), transport (including major airports), and digital infrastructure (data centres and fibre) — primarily in Europe. Pursues large, capital-intensive platform acquisitions with a value creation discipline rooted in operational improvement.",
    sourceUrls: ["https://pulse2.com/ardian-20-billion-raised-for-flagship-infrastructure-platform/", "https://inforcapital.com/funds/ardian-infrastructure-fund-vi-aif-vi/"],
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://pulse2.com/ardian-20-billion-raised-for-flagship-infrastructure-platform/",
  }),
  f("FUND-024", "Ardian", "Ardian Americas Infrastructure Fund V", "2022", "$2.1B", 2100, "Core-Plus", "Financial Close", {
    investmentStrategy: "Core-plus, Article 9 fund targeting high-quality mid-market essential infrastructure assets across the US and other OECD Americas markets in three sectors: telecommunications, transportation, and energy transition. Ardian’s second-generation Americas vehicle, significantly oversubscribed versus its hard cap.",
    sourceUrls: ["https://www.ardian.com/press-releases/ardian-closes-its-second-generation-americas-infrastructure-fund-us21bn", "https://pitchbook.com/profiles/fund/18278-74F"],
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.ardian.com/press-releases/ardian-closes-its-second-generation-americas-infrastructure-fund-us21bn",
  }),
  f("FUND-025", "Ardian", "Ardian Clean Energy Evergreen Fund (ACEEF)", "2022", "€1.0B", 1100, "Core-Plus", "Evergreen", {
    investmentStrategy: "Open-ended, Article 9 evergreen fund investing in highly contracted brownfield renewable energy assets — primarily operational wind, solar, hydro, biogas, biomass, and battery energy storage systems — with a focus on Europe. Targets established generation technologies under incentive tariffs or long-term PPAs, optimising asset performance through Ardian’s proprietary OPTA data analytics platform. Recently expanded into the Nordic renewables market.",
    sourceUrls: ["https://www.ardian.com/news-insights/press-releases/ardian-clean-energy-evergreen-fund-aceef-expands-nordics-portfolio", "https://www.fundscouter.com/funds/ardian/ardian-clean-energy-evergreen-fund"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://www.ardian.com/news-insights/press-releases/ardian-clean-energy-evergreen-fund-aceef-expands-nordics-portfolio",
  }),

  // ── Ares Management ───────────────────────────────────────
  f("FUND-026", "Ares Management", "Ares Climate Infrastructure Partners II", "2023", "$3.0B", 3000, "Value-Add", "Raising", {
    investmentStrategy: "Value-add infrastructure fund deploying flexible capital — across equity, preferred equity, and structured debt — into assets and companies accelerating the transition to a low-carbon economy, with a focus on renewable energy, energy storage, resource efficiency, vehicle electrification, and transmission. Invests across the capital structure in essential infrastructure assets with stable cash flow profiles. Passed $1.3 billion in commitments as of latest reporting.",
    sourceUrls: ["https://www.newprivatemarkets.com/in-brief-ares-passes-1-3bn-for-second-climate-infra-fundraise/", "https://www.infrastructureinvestor.com/the-pipeline-ares-reaches-1-3bn-infranodes-new-partner-kkr-and-psps-2-8bn-transmission-play/", "https://pitchbook.com/profiles/fund/24186-70F"],
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.newprivatemarkets.com/in-brief-ares-passes-1-3bn-for-second-climate-infra-fundraise/",
  }),
  f("FUND-027", "Ares Management", "Ares Core Infrastructure Fund (ACI)", "2024", "$3.9B", 3900, "Core", "Evergreen", {
    investmentStrategy: "Perpetual, semi-liquid core infrastructure vehicle targeting operating assets with high cash flow predictability, long-term contracted revenues with creditworthy counterparties, and income-oriented returns, primarily across digital infrastructure (data centres, fibre), energy transition, utilities/power, and transportation. Provides both controlling and non-controlling equity positions, targeting assets with resilient, inflation-hedged cash flows.",
    sourceUrls: ["https://www.areswms.com/solutions/aci", "https://www.heronfinance.com/private-infrastructure", "https://www.areswms.com.au/our-funds/ares-core-infrastructure-fund-aci-aut/"],
    sectors: ["Utilities", "Transportation", "Power Generation"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.areswms.com/solutions/aci",
  }),

  // ── Astatine Investment Partners ──────────────────────────
  f("FUND-028", "Astatine Investment Partners", "Astatine Infrastructure Fund IV", "2022", "$586M", 586, "Core-Plus", "Financial Close", {
    investmentStrategy: "Mid-market, core-plus infrastructure fund targeting equity investments primarily in North America and Europe across digital (fibre broadband), transportation, utility-related, and essential services subsectors, with a focus on assets offering long-term contracted cash flows, inflation linkage, and strong income yield. Formerly Alinda Capital Partners’ mid-market strategy (rebranded 2022), applying a private equity–style, operationally engaged approach. Notable holdings include Kansas City fiber network.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/18186-76F", "https://astatineip.com/2022/03/03/fund-iv-signs-definitive-agreement-to-acquire-kansas-city-fiber-network/", "https://www.private-equitynews.com/news/alinda-capital-partners-rebrands-its-mid-market-infrastructure-strategy-to-astatine-investment-partners/"],
    sectors: ["Digital Infrastructure", "Utilities", "Communications"],
    regions: ["North America"],
    strategyUrl: "https://astatineip.com/2022/03/03/fund-iv-signs-definitive-agreement-to-acquire-kansas-city-fiber-network/",
  }),

  // ── AustralianSuper ───────────────────────────────────────
  f("FUND-029", "AustralianSuper", "Australian Super Infrastructure Portfolio", "N/A", "$75.0B", 75000, "Core-Plus", "Evergreen", {
    investmentStrategy: "Large-scale direct investment program in unlisted infrastructure across transport, digital infrastructure, ports, and utilities, operating across Australia, the UK, and North America with a core-plus risk profile and a long-term, internally managed ownership approach. Increasingly supplements direct deals with commitments to value-add fund managers to access segments less suited to internal origination. Recently expanded US private equity team with senior hires to accelerate direct deployment.",
    sourceUrls: ["https://www.infrastructureinvestor.com/australiansuper-loosens-direct-investment-model-to-consider-more-infra-fund-commitments-exclusive/", "https://www.prnewswire.com/news-releases/australiansuper-expands-us-private-equity-team-with-senior-hire-302511523.html"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.infrastructureinvestor.com/australiansuper-loosens-direct-investment-model-to-consider-more-infra-fund-commitments-exclusive/",
  }),

  // ── Basalt Infrastructure Partners ────────────────────────
  f("FUND-030", "Basalt Infrastructure Partners", "Basalt Infrastructure Partners IV", "2022", "$4.0B", 4000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Mid-market equity investments in utilities, power and renewables, transport, and digital/communications infrastructure across North America and Western Europe, targeting a core-plus risk profile with a differentiated deal-sourcing approach and active asset management to drive operational improvement. Colliers is a strategic investor in the platform.",
    sourceUrls: ["https://www.ijglobal.com/Widget/Download/168818?home=2"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure"],
    regions: ["North America"],
    strategyUrl: "https://www.ijglobal.com/Widget/Download/168818?home=2",
  }),
  f("FUND-031", "Basalt Infrastructure Partners", "Basalt Infrastructure Partners V", "2025", "Undisclosed", null, "Core-Plus", "Raising", {
    investmentStrategy: "Continues Basalt’s transatlantic mid-market strategy, targeting core-plus and value-add equity investments across power and renewables, utilities, transport, and digital/communications infrastructure in North America and Western Europe. Applies the same operationally intensive approach as its predecessors, seeking assets with contracted or regulated revenues alongside selective value creation opportunities.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/29059-75F", "https://corporate.colliers.com/news/news-details/2022/Colliers-to-invest-in-leading-infrastructure-investment-firm-01-24-2022/default.aspx", "https://www.sec.gov/Archives/edgar/data/2099775/000209977525000001/xslFormDX01/primary_doc.xml"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure"],
    regions: ["North America"],
    strategyUrl: "https://pitchbook.com/profiles/fund/29059-75F",
  }),
  // ── Bernhard Capital Partners ───────────────────────────────
  f("FUND-032", "Bernhard Capital Partners", "BCP Infrastructure Fund II", "2024", "$75M+", 75, "Value-Add", "Raising", {
    investmentStrategy: "North American value-add infrastructure fund focused on energy services companies spanning the midstream, downstream, and power verticals, with investments typically sized between $75–150M. Employs a buy-and-build strategy, leveraging deep operational expertise inherited from the firm’s roots in engineering, procurement, and construction to acquire and scale service businesses across the energy infrastructure supply chain. Louisiana Teachers’ Retirement System among committed LPs.",
    sourceUrls: ["https://www.realfin.com/fund/31373/bcp-infrastructure-fund-ii", "https://www.dakota.com/hubfs/Dakota%20July%202025%20Pension%20Brief.pdf", "https://www.connectmoney.com/stories/louisiana-teachers-retirement-system-commits-200m-to-private-markets/"],
    sectors: ["Utilities", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.realfin.com/fund/31373/bcp-infrastructure-fund-ii",
  }),

  // ── BlackRock ─────────────────────────────────────────────
  f("FUND-033", "BlackRock", "BlackRock Global Infrastructure Fund IV", "2022", "$6.1B", 6100, "Core-Plus", "Financial Close", {
    investmentStrategy: "Diversified global core-plus infrastructure fund guided by the themes of decarbonization, decentralization, and digitalization, with investments across energy and environmental, low-carbon power, regulated utilities, transportation and logistics, and digital infrastructure. Targets a net IRR of approximately 10%, drawing on long-term contracted cash flows and a global institutional investor base. Raised $4.5 billion at first close before reaching $6.1 billion final close.",
    sourceUrls: ["https://www.infrastructureinvestor.com/gip-to-seek-7bn-for-rebranded-mid-market-fund-exclusive/", "https://www.businesswire.com/news/home/20221024005921/en/BlackRock-Global-Infrastructure-Fund-IV-Raises-US%244.5-Billion-at-First-Close"],
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://www.businesswire.com/news/home/20221024005921/en/BlackRock-Global-Infrastructure-Fund-IV-Raises-US%244.5-Billion-at-First-Close",
  }),
  f("FUND-034", "BlackRock", "BlackRock Global Renewable Power Fund IV (GRP IV)", "2023", "$7.0B", 7000, "Core-Plus", "Raising", {
    investmentStrategy: "Core-plus, impact-oriented fund targeting equity investments in renewable power and clean energy infrastructure — principally wind, solar, battery storage, and grid assets — across OECD markets globally, classified as Article 9 under EU SFDR. Seeks risk diversification across geographies, technologies, and regulatory regimes.",
    sourceUrls: ["https://media.infrastructureinvestor.com/uploads/2025/11/Infrastructure-America-2025-final.pdf", "https://www.stblaw.com/about-us/news/view/2024/01/24/blackrock-s-global-renewable-power-fund-to-acquire-shares-in-recurrent-energy", "https://www.fondsinfo.be/en/articles/952365-blackrock-launches-fundraise-for-global-renewable-power-fund-iv-grp-iv"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global", "North America"],
    strategyUrl: "https://www.stblaw.com/about-us/news/view/2024/01/24/blackrock-s-global-renewable-power-fund-to-acquire-shares-in-recurrent-energy",
  }),
  f("FUND-035", "BlackRock", "BlackRock Evergreen Infra Partners Fund", "2022", "$1.0B", 1000, "Core", "Evergreen", {
    investmentStrategy: "Perpetual, open-ended core infrastructure strategy focused on energy transition, energy security, digital infrastructure, and sustainable mobility, with an initial emphasis on Western Europe expanding to North America. Targets stable, inflation-linked contracted returns by investing in long-duration core assets across renewable energy, gas storage, telecommunications, and sustainable transportation. Secured $1 billion from European investors at initial close.",
    sourceUrls: ["https://esgnews.com/blackrocks-evergreen-infrastructure-fund-secures-1-billion-from-european-investors/"],
    sectors: ["Utilities", "Transportation", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://esgnews.com/blackrocks-evergreen-infrastructure-fund-secures-1-billion-from-european-investors/",
  }),

  // ── Blackstone ────────────────────────────────────────────
  f("FUND-036", "Blackstone", "Blackstone Infrastructure Partners (BIP)", "2017", "$53.0B", 53000, "Core-Plus", "Evergreen", {
    investmentStrategy: "Large-scale, open-ended core-plus infrastructure vehicle investing primarily in North America (70%+) across energy, transportation, digital infrastructure, and water and waste, with selective European exposure. Pursues essential, high-barrier assets with long-term contracted or regulated cash flows, building significant positions in data centers, cell towers, toll roads, and marine terminals through both control and partnership transactions. Portfolio includes Carrix (largest NA marine terminal operator), Invenergy (top US renewables developer), QTS Realty Trust (data centers), Phoenix Tower International, and AirTrunk, generating 17% net annual returns since inception.",
    sourceUrls: ["https://www.infrastructureinvestor.com/the-pipeline-eqt-vi-nears-target-blackstones-data-centres-success-australiansupers-us-data-centre-splash/", "https://www.pa.gov/content/dam/copapwp-pagov/en/psers/documents/board3/resolutions/2018/res02.pdf", "https://www.txnmenergy.com/~/media/Files/P/PNM-Resources/rates-and-filings/2025%20Blackstone%20Infrastructure/PNM/Application/25-00-2025-08-25-PNM-Direct%20Testimony%20and%20Exhibits%20of%20Sebastien%20Sherman.pdf"],
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Midstream / Energy", "Utilities"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    structure: "Open-End",
    strategyUrl: "https://www.pa.gov/content/dam/copapwp-pagov/en/psers/documents/board3/resolutions/2018/res02.pdf",
  }),
  f("FUND-037", "Blackstone", "Blackstone Energy Transition Partners IV", "2022", "$5.6B", 5600, "Opportunistic", "Financial Close", {
    investmentStrategy: "Global energy transition private equity fund investing across the full decarbonization value chain — including grid infrastructure, transmission equipment, power generation, energy software, data center power access, and thermal management — with a particular concentration in North America. Backs management teams with flexible capital to help energy companies grow, targeting businesses well-positioned to benefit from long-term power demand growth driven by AI, electrification, and the energy transition. Closed at hard cap of $5.6 billion, representing one of the largest dedicated energy transition vehicles.",
    sourceUrls: ["https://www.blackstone.com/news/press/blackstone-announces-5-6-billion-final-close-for-blackstone-energy-transition-partners-iv-at-hard-cap/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.blackstone.com/news/press/blackstone-announces-5-6-billion-final-close-for-blackstone-energy-transition-partners-iv-at-hard-cap/",
  }),

  // ── British Columbia Investment Management Corporation (BCI) ───
  f("FUND-038", "British Columbia Investment Management Corporation (BCI)", "BCI Infrastructure & Renewable Resources Program", "2005", "C$32.2B", 23500, "Core", "Evergreen", {
    investmentStrategy: "Large, globally diversified direct investment platform targeting core infrastructure assets with high barriers to entry, stable cash flows, and long holding periods typically exceeding 20 years, with subsectors spanning utilities, renewable energy, digital infrastructure, transport, agriculture, and timberlands. Invests primarily through direct ownership and co-investments across developed markets, with growing exposure to energy transition and circular economy assets. Manages over C$32 billion in infrastructure and renewable resources for British Columbia public sector pension plans.",
    sourceUrls: ["https://www.bci.ca/investments/infrastructure-renewable-resources/overview/"],
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.bci.ca/investments/infrastructure-renewable-resources/overview/",
  }),

  // ── Brookfield Asset Management ───────────────────────────
  f("FUND-039", "Brookfield Asset Management", "Brookfield Infrastructure Fund V (BIF V)", "2022", "$30.0B", 30000, "Value-Add", "Financial Close", {
    investmentStrategy: "Closed-ended flagship infrastructure equity fund pursuing large-scale, high-quality essential assets globally, with investment themes centered on digitalization (data centers, telecom towers), decarbonization (renewable energy), and deglobalization (transport and logistics). Targets core-plus to value-add returns through active asset management and control-oriented ownership across diversified infrastructure sectors. The world’s largest closed-ended private infrastructure fund, backed by ~200 LPs including NY State Common Retirement Fund ($300M commitment), having deployed ~40% of its capital.",
    sourceUrls: ["https://bam.brookfield.com/press-releases/brookfield-raises-record-30-billion-flagship-infrastructure-strategy"],
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition", "Utilities"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://bam.brookfield.com/press-releases/brookfield-raises-record-30-billion-flagship-infrastructure-strategy",
  }),
  f("FUND-040", "Brookfield Asset Management", "Brookfield Super-Core Infrastructure Partners", "2018", "$13.2B", 13200, "Core", "Evergreen", {
    investmentStrategy: "Large open-ended, perpetual-life core infrastructure fund targeting assets in utilities, energy, transportation, and communications that provide essential services with long-duration, inflation-linked contracted or regulated revenues. Designed to deliver lower but highly stable returns compared to Brookfield’s closed-ended flagship funds, investing globally with a strong emphasis on OECD markets.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/16563-16F", "https://www.sec.gov/Archives/edgar/data/1937926/000162828026013098/bam-20251231.htm"],
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://pitchbook.com/profiles/fund/16563-16F",
  }),
  f("FUND-041", "Brookfield Asset Management", "Brookfield Global Transition Fund II (BGTF II)", "2023", "$20.0B", 20000, "Value-Add", "Financial Close", {
    investmentStrategy: "The world's largest dedicated clean energy transition fund, targeting equity investments across renewable power expansion (wind, solar, hydro), corporate decarbonization, carbon capture and storage, nuclear, battery storage, and grid modernization across North America, South America, Europe, and Asia Pacific. Focuses on accelerating the global shift to a net-zero economy by backing established platforms and transforming carbon-intensive businesses.",
    sourceUrls: ["https://bam.brookfield.com/press-releases/brookfield-raises-20-billion-record-transition-fund", "https://www.connectmoney.com/stories/brookfield-closes-20b-global-energy-transition-fund-ii-setting-new-record/"],
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["Global", "North America"],
    strategyUrl: "https://bam.brookfield.com/press-releases/brookfield-raises-20-billion-record-transition-fund",
  }),
  f("FUND-042", "Brookfield Asset Management", "Brookfield Infrastructure Solutions (BISS I)", "2024", "$1.0B", 1000, "Opportunistic", "Financial Close", {
    investmentStrategy: "Debut middle-market infrastructure fund providing structured and common equity capital to sponsors, developers, and corporates across Brookfield's areas of greatest operational expertise, including renewable energy and in-building wireless infrastructure. Blends attributes of infrastructure debt and equity to offer flexible, solutions-oriented capital at the smaller end of the market.",
    sourceUrls: ["https://bam.brookfield.com/press-releases/brookfield-closes-infrastructure-structured-solutions-fund"],
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
    strategyUrl: "https://bam.brookfield.com/press-releases/brookfield-closes-infrastructure-structured-solutions-fund",
  }),
  f("FUND-043", "Brookfield Asset Management", "Brookfield Infrastructure Income Fund (BII)", "2023", "$5.1B", 5100, "Core-Plus", "Evergreen", {
    investmentStrategy: "Evergreen, semi-liquid vehicle designed for private wealth investors, providing exposure to a diversified blend of private infrastructure equity and debt across renewable power and transition, data infrastructure, utilities, transport, and midstream globally. Targets 7-9% net returns split between current income and capital appreciation, with monthly subscriptions, monthly distributions, and quarterly share repurchase liquidity.",
    sourceUrls: ["https://privatewealth.brookfield.com/sites/default/files/funds/tender-offer-funds/brookfield-infrastructure-income-fund-flyer.pdf", "https://privatewealth.brookfield.com/fund/brookfield-infrastructure-income-fund-inc"],
    sectors: ["Utilities", "Transportation", "Midstream / Energy", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
    strategyUrl: "https://privatewealth.brookfield.com/fund/brookfield-infrastructure-income-fund-inc",
  }),
  // ── Canada Development Investment Corporation ──────────────
  f("FUND-044", "Canada Development Investment Corporation", "Canada Growth Fund", "2022", "C$15.0B", 11100, "Value-Add", "Evergreen", {
    investmentStrategy: "Canadian government-backed investment vehicle that catalyzes private capital into clean economy projects in Canada, using concessional instruments such as carbon contracts for difference, equity, and other risk-absorbing tools to improve project economics. Targets carbon capture and storage, clean hydrogen, renewable power, transportation electrification, and industrial decarbonization.",
    sourceUrls: ["https://www.budget.canada.ca/fes-eea/2022/doc/gf-fc-en.pdf", "https://www.cgf-fcc.ca/en/who-we-are/", "https://www.cgf-fcc.ca/en/"],
    sectors: ["Renewables / Energy Transition", "Utilities", "Transportation"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.cgf-fcc.ca/en/who-we-are/",
  }),

  // ── Carlyle Group ─────────────────────────────────────────
  f("FUND-045", "Carlyle Group", "Carlyle Global Infrastructure Opportunity Fund II", "2024", "$3.0B", 3000, "Opportunistic", "Raising", {
    investmentStrategy: "Opportunistic infrastructure equity fund targeting essential assets across transportation and logistics, digital infrastructure, and renewables in North America and other OECD markets. Applies Carlyle's value creation approach from private equity to infrastructure — investing across development, construction, and growth stages — with a focus on contracted revenues, inflation protection, and active management to drive EBITDA expansion. Notable LP commitments include Texas TRS ($200M).",
    sourceUrls: ["https://www.privateequitywire.co.uk/carlyle-targets-over-3bn-for-new-infrastructure-fund/", "https://pe-insights.com/carlyle-eyes-over-3bn-for-new-infrastructure-fund-amid-growing-investor-interest/", "https://pitchbook.com/profiles/fund/27355-60F", "https://irei.com/news/texas-trs-slates-200m-to-carlyle-global-infrastructure-opportunity-fund-ii/"],
    sectors: ["Power Generation", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["North America", "Global"],
    strategyUrl: "https://www.privateequitywire.co.uk/carlyle-targets-over-3bn-for-new-infrastructure-fund/",
  }),
  f("FUND-046", "Carlyle Group", "Carlyle Renewable & Sustainable Energy Fund II", "2022", "$1.6B", 1600, "Value-Add", "Financial Close", {
    investmentStrategy: "Global value-add infrastructure fund focused on clean energy, targeting solar, wind, battery storage, green hydrogen, and related cleantech across North America, Europe, and Australia, with per-investment commitments typically between $75–250M. Pursues both development-stage and operating renewable assets through platform creation and growth equity. Notable LPs include NY Common Retirement Fund.",
    sourceUrls: ["https://www.buyoutsinsider.com/carlyles-second-renewables-fund-tops-1bn-with-help-of-new-york-common/", "https://www.osc.ny.gov/press/releases/2024/08/dinapoli-ny-pension-fund-reaches-climate-agreements-five-portfolio-companies", "https://www.boston.gov/sites/default/files/file/2023/07/2023%C2%A006%C2%A0Investment%20Performance%20Report.pdf"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.buyoutsinsider.com/carlyles-second-renewables-fund-tops-1bn-with-help-of-new-york-common/",
  }),

  // ── CBRE Caledon ──────────────────────────────────────────
  f("FUND-047", "CBRE Caledon", "CBRE Musselshell Infrastructure Investments", "2022", "$235M", 235, "Opportunistic", "Financial Close", {
    investmentStrategy: "Mid-market, core and core-plus infrastructure fund targeting diversified OECD-market investments across renewable energy, transportation, digital infrastructure, social infrastructure, and utilities. Constructs diversified portfolios through direct and indirect investments, seeking consistent inflation-linked cash flows from assets with monopolistic characteristics and high barriers to entry. Structured as a customized SMA for the Montana Board of Investments.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/22373-92F", "https://irei.com/news/montana-boi-commits-135m-to-cbre-musselshell-infrastructure-investments/", "https://www.dakota.com/resources/blog/consultant-led-private-infrastructure-allocations-from-q4-2025"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure"],
    regions: ["North America", "Global"],
    strategyUrl: "https://irei.com/news/montana-boi-commits-135m-to-cbre-musselshell-infrastructure-investments/",
  }),

  // ── CIM Group ─────────────────────────────────────────────
  f("FUND-048", "CIM Group", "CIM Infrastructure Fund III", "2021", "$1.76B", 1760, "Value-Add", "Financial Close", {
    investmentStrategy: "Value-add infrastructure fund targeting opportunities exclusively in North America across three high-conviction subsectors — digital infrastructure (data centers, fiber, wireless towers), renewable energy and storage, and waste and water management — through active ownership and operational improvement. Draws on CIM Group's integrated platform as an owner, operator, and developer to originate and manage assets benefiting from AI-driven data growth and the energy transition.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/21118-06F", "https://www.pa.gov/content/dam/copapwp-pagov/en/psers/documents/board3/resolutions/2022/cim%20infrastructure%20fund%20iii%20-%20public%20im.pdf"],
    sectors: ["Digital Infrastructure", "Transportation", "Waste / Environmental Services"],
    regions: ["North America"],
    strategyUrl: "https://pitchbook.com/profiles/fund/21118-06F",
  }),

  // ── Copenhagen Infrastructure Partners ────────────────────
  f("FUND-049", "Copenhagen Infrastructure Partners", "Copenhagen Infrastructure V (CI V)", "2023", "€12.0B", 13200, "Value-Add", "Financial Close", {
    investmentStrategy: "Large-scale greenfield renewable energy fund investing early-stage in offshore wind, onshore wind, solar PV, and battery storage across low-risk OECD markets in Western Europe, North America, and Asia Pacific. Captures a greenfield development premium by entering projects at early development, significantly de-risking and optimizing them prior to construction, applying CIP's industrial value-creation model. CIP is one of the world's largest dedicated energy infrastructure fund managers.",
    sourceUrls: ["https://www.cip.com/funds/flagship-funds/", "https://outside.vermont.gov/dept/VPIC/Shared%20Documents/VPIC%20Website/Meetings/VPIC%20General%20Meetings/Meeting%20Materials/2023/12-12-2023/2023-12%20CIP%20V%20Strategy%20Summary_v1%20(Redacted).pdf"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://www.cip.com/funds/flagship-funds/",
  }),
  f("FUND-050", "Copenhagen Infrastructure Partners", "CI Advanced Bioenergy Fund I (CI ABF I)", "2022", "€750M", 825, "Value-Add", "Financial Close", {
    investmentStrategy: "Greenfield bioenergy fund investing in advanced bioenergy infrastructure producing biomethane, bio-LNG, and second-generation biofuels from sustainable organic waste feedstocks across Europe and North America. Targets the decarbonization of hard-to-abate sectors including shipping, aviation, and heavy industry, with exposure to sustainable aviation fuel infrastructure. Classified as Article 9 (dark green) under EU SFDR.",
    sourceUrls: ["https://www.cip.com/funds/"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.cip.com/funds/",
  }),
  f("FUND-051", "Copenhagen Infrastructure Partners", "CI Advanced Bioenergy Fund II (CI ABF II)", "2025", "€1.5B", 1650, "Value-Add", "Raising", {
    investmentStrategy: "Successor fund continuing the strategy of CI ABF I, making greenfield equity investments in advanced bioenergy infrastructure — producing biomethane, bio-LNG, and advanced biofuels from sustainable organic waste feedstocks — primarily across Europe and North America. Leverages the seed portfolio and operational capabilities built through ABF I to decarbonize hard-to-abate sectors.",
    sourceUrls: ["https://www.cip.com/funds/"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.cip.com/funds/",
  }),

  // ── CPP Investments ───────────────────────────────────────
  f("FUND-052", "CPP Investments", "CPP Investments Infrastructure", "1999", "C$780.7B", 577700, "Core", "Evergreen", {
    investmentStrategy: "Deploys large-scale direct capital globally across utilities, renewable and conventional energy, transportation networks, midstream assets, and digital infrastructure, with a long-term ownership horizon and a preference for significant ownership stakes that enable active governance. Operates across developed and emerging markets through direct investments, co-investments, and fund commitments, with global offices supporting on-the-ground origination. CPP manages the Canada Pension Plan fund and is among the most active direct infrastructure investors globally.",
    sourceUrls: ["https://www.cppinvestments.com/newsroom/cpp-investments-net-assets-total-780-7-billion-at-third-quarter-fiscal-2026/", "https://www.cppinvestments.com/the-fund/investment-programs/investment-real-assets/", "https://en.wikipedia.org/wiki/CPP_Investments"],
    sectors: ["Transportation", "Utilities", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    structure: "Permanent Capital",
    strategies: ["Core", "Core-Plus"],
    strategyUrl: "https://www.cppinvestments.com/the-fund/investment-programs/investment-real-assets/",
  }),

  // ── CVC DIF ───────────────────────────────────────────────
  f("FUND-053", "CVC DIF", "CVC DIF Infrastructure VIII", "2025", "€6.0B", 6600, "Core-Plus", "Raising", {
    investmentStrategy: "Flagship core and core-plus mid-market infrastructure equity fund targeting essential assets in energy transition, digital infrastructure, transport, and utilities across Europe, North America, and Australia. Employs a 'build-to-core' approach, acquiring and operating assets with long-term contract cover that provide downside protection and stable yield, while capturing additional value from development pipelines and operational improvements. Multiple US state pension boards (NJ, PA) have approved commitments.",
    sourceUrls: ["https://www.nj.gov/treasury/doinvest/pdf/AlternativeInvestments/RealAsset/DIF_Infrastructure_VIII_SCSp.pdf", "https://www.pa.gov/content/dam/copapwp-pagov/en/psers/documents/board3/resolutions/2025/2025-58%20pserb%20resolution%20dif%20infrastructure%20fund%20viii%20scsp.pdf", "https://inforcapital.com/funds/dif-infrastructure-viii/"],
    sectors: ["Utilities", "Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://inforcapital.com/funds/dif-infrastructure-viii/",
  }),
  f("FUND-054", "CVC DIF", "CVC DIF Value-Add IV", "2024", "€2.0B", 2200, "Value-Add", "Raising", {
    investmentStrategy: "Pursues a 'buy-and-build' strategy targeting growth-oriented mid-market infrastructure companies — particularly in digital infrastructure, energy transition, sustainable transportation, and healthcare — primarily across Europe and North America. Focuses on businesses with strong competitive positions and significant growth potential through pipeline development, business line expansion, and platform aggregation.",
    sourceUrls: ["https://www.nj.gov/treasury/doinvest/pdf/AlternativeInvestments/RealAsset/DIF_Infrastructure_VIII_SCSp.pdf"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://www.nj.gov/treasury/doinvest/pdf/AlternativeInvestments/RealAsset/DIF_Infrastructure_VIII_SCSp.pdf",
  }),
  f("FUND-055", "CVC DIF", "DIF Infrastructure VII", "2022", "€4.4B", 4840, "Core", "Financial Close", {
    investmentStrategy: "Core and core-plus infrastructure equity fund targeting essential assets in PPP/concessions, renewable energy, broader energy transition, and utilities across Europe, North America, and Oceania. Combines brownfield and selective greenfield investment to generate long-term, inflation-linked contracted or regulated cash flows, with active value enhancement through cost optimization, debt refinancing, and asset combination strategies. DIF raised €6.8 billion across its two infrastructure funds in the same vintage, exceeding targets.",
    sourceUrls: ["https://www.preqin.net.cn/news/dif-capital-partners-beats-targets-after-raising-eur6-8bn-for-two-infrastructure-funds", "https://pitchbook.com/profiles/fund/22326-94F"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.preqin.net.cn/news/dif-capital-partners-beats-targets-after-raising-eur6-8bn-for-two-infrastructure-funds",
  }),
  f("FUND-056", "CVC DIF", "DIF Core-Plus Infrastructure Fund III (CIF III)", "2022", "€1.6B", 1760, "Core-Plus", "Financial Close", {
    investmentStrategy: "Small-to-mid-cap core-plus infrastructure equity fund targeting digital infrastructure (data centers, fiber networks), energy transition, and sustainable transportation across Europe and North America, with deals typically sized between €30–150M. Pursues both operational and greenfield assets in sectors benefiting from decarbonization and digitalization megatrends, complementing DIF's flagship core vehicle as part of a dual-fund strategy.",
    sourceUrls: ["https://www.preqin.net.cn/news/dif-capital-partners-beats-targets-after-raising-eur6-8bn-for-two-infrastructure-funds", "https://www.ccpc.ie/business/mergers-acquisitions/merger-notifications/m-22-053-dif-talbot-group/"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.preqin.net.cn/news/dif-capital-partners-beats-targets-after-raising-eur6-8bn-for-two-infrastructure-funds",
  }),
  // ── DigitalBridge ──────────────────────────────────────────
  f("FUND-057", "DigitalBridge", "DigitalBridge Partners III", "2022", "$7.2B", 7200, "Value-Add", "Financial Close", {
    investmentStrategy: "Value-add digital infrastructure fund targeting cell towers, data centers (including hyperscale and AI-enabling facilities), fiber networks, small cells, and edge infrastructure, primarily across North America, Europe, and Asia-Pacific. Applies an operator-driven model — leveraging deep platform expertise in building and scaling digital infrastructure businesses — to create value through proprietary sourcing and active asset management. Closed at $7.2 billion with $11.7 billion including co-investments.",
    sourceUrls: ["https://www.infrastructureinvestor.com/digitalbridge-closes-third-flagship-on-7-2bn/", "https://inforcapital.com/funds/digitalbridge-partners-iii/", "https://ionanalytics.com/insights/infralogic/digitalbridge-fund-nears-final-close-slightly-below-target/"],
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://www.infrastructureinvestor.com/digitalbridge-closes-third-flagship-on-7-2bn/",
  }),
  f("FUND-058", "DigitalBridge", "DigitalBridge Strategic Asset Fund", "2023", "$300M", 300, "Core", "Evergreen", {
    investmentStrategy: "Opportunistic vehicle targeting high-conviction equity and credit opportunities across the digital ecosystem including data centers, fiber, satellite broadband, and cloud infrastructure. Complements DigitalBridge's flagship value-add fund series by allowing selective deployment into specific digital infrastructure assets where operating network and sector relationships provide proprietary sourcing advantage.",
    sourceUrls: ["https://ionanalytics.com/insights/infralogic/digitalbridge-fund-nears-final-close-slightly-below-target/", "https://ir.digitalbridge.com/node/12376/html"],
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America", "Global"],
    strategyUrl: "https://ir.digitalbridge.com/node/12376/html",
  }),

  // ── Duration Capital ──────────────────────────────────────
  f("FUND-059", "Duration Capital Partners", "Duration Transportation Infrastructure Capital Partners", "2022", "$780M", 780, "Core-Plus", "Evergreen", {
    investmentStrategy: "Value-add/opportunistic strategy focused exclusively on North American transportation infrastructure, targeting airports, railroads, ports, terminals, and aviation support businesses. Builds platform companies through buy-and-build acquisitions and organic growth, partnering closely with management teams to drive operational improvements and long-term value creation across essential transportation networks. Notable LP commitments include Michigan Retirement System ($100M).",
    sourceUrls: ["https://irei.com/news/michigan-retirement-system-commits-100m-to-duration-transportation-infrastructure-capital-partners/", "https://pitchbook.com/profiles/fund/21718-54F"],
    sectors: ["Transportation"],
    regions: ["North America"],
    strategyUrl: "https://irei.com/news/michigan-retirement-system-commits-100m-to-duration-transportation-infrastructure-capital-partners/",
  }),

  // ── Ember Infrastructure Management ───────────────────────
  f("FUND-060", "Ember Infrastructure Management", "Ember Infrastructure Fund II", "2023", "$831M", 831, "Opportunistic", "Financial Close", {
    investmentStrategy: "Middle-market opportunistic infrastructure fund targeting U.S. and Canadian businesses across energy transition, distributed generation, energy efficiency, water and wastewater, and waste management. Focuses on climate solutions with proven technologies and commercially viable models, pursuing privately sourced or bilaterally negotiated investments in companies occupying a capital gap between traditional PE and large-scale infrastructure.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/24516-82F", "https://inforcapital.com/funds/ember-infrastructure-fund-ii/", "https://assets.bbhub.io/professional/sites/41/Bloomberg-Infrastructure-Energy-Annual-Report-EOY-2025.pdf"],
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["North America"],
    strategyUrl: "https://inforcapital.com/funds/ember-infrastructure-fund-ii/",
  }),

  // ── EnCap Investments ─────────────────────────────────────
  f("FUND-061", "EnCap Investments", "EnCap Flatrock Midstream Fund V", "2024", "$1.0B", 1000, "Value-Add", "Financial Close", {
    investmentStrategy: "Deploys venture-style growth capital into early-stage North American midstream companies focused on natural gas gathering, treating, processing, and transportation infrastructure. Builds platforms by backing management teams with well-defined business plans, advancing capital incrementally as each business matures, with selective exposure to adjacent energy transition themes including renewable natural gas and hydrogen.",
    sourceUrls: ["https://www.encapinvestments.com/about/midstream", "https://www.privateequityinternational.com/institution-profiles/encap-flatrock-midstream.html", "https://www.encapinvestments.com/about/our-story"],
    sectors: ["Midstream / Energy"],
    regions: ["North America"],
    strategyUrl: "https://www.encapinvestments.com/about/midstream",
  }),
  f("FUND-062", "EnCap Investments", "EnCap Energy Transition Fund II", "2022", "$1.5B", 1500, "Value-Add", "Financial Close", {
    investmentStrategy: "Growth equity fund targeting utility-scale renewable power (solar, wind, and battery storage), low-carbon fuels (renewable natural gas, hydrogen, SAF), and carbon management businesses across North America. Backs experienced management teams developing or operating projects with proven renewable technologies, deploying equity checks of $50–400M per company, capitalizing on IRA clean energy incentives. Notable LPs include Oregon Public Employees' Fund.",
    sourceUrls: ["https://encapinvestments.com/news/encap-energy-transition-closes-15-billion-energy-transition-fund-ii", "https://www.infrastructureinvestor.com/opf-invests-in-a-new-energy-infrastructure-fund/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://encapinvestments.com/news/encap-energy-transition-closes-15-billion-energy-transition-fund-ii",
  }),
  f("FUND-063", "EnCap Investments", "EnCap Energy Transition Fund III", "2025", "Undisclosed", null, "Value-Add", "Raising", {
    investmentStrategy: "Continues the predecessor fund's growth equity strategy of partnering with experienced management teams to develop, build, and operate low-carbon power, clean fuels, and carbon management platforms across North America. Building on over $2.7B managed across the prior fund series, targets proven technology investments in utility-scale renewables, storage, renewable natural gas, and adjacent decarbonization infrastructure.",
    sourceUrls: ["https://www.realfin.com/fund/36105/encap-energy-transition-fund-iii", "https://www.privateequityinternational.com/institution-profiles/encap-investments.html"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.realfin.com/fund/36105/encap-energy-transition-fund-iii",
  }),

  // ── Energy Capital Partners (ECP) ─────────────────────────
  f("FUND-064", "Energy Capital Partners", "Energy Capital Partners VI", "2024", "$5.0B", 5000, "Core-Plus", "Raising", {
    investmentStrategy: "Value-add buyout fund targeting control investments in power generation, renewable energy and storage, and critical sustainability and decarbonization infrastructure across North America. Focuses on transforming and scaling companies in high-demand sectors — including gas-fired power, renewables, and grid reliability services — at a time when electrification from AI data centers, EVs, and industrial onshoring is driving unprecedented electricity demand growth. ECP returned $5.5 billion to investors in 2025 across its prior funds.",
    sourceUrls: ["https://www.privateequitywire.co.uk/energy-capital-partners-returns-5-5bn-to-investors-in-2025/", "https://pitchbook.com/profiles/fund/27050-50F", "https://www.bridgepointgroup.com/content/dam/bridgepoint/corporate2022/documents/financial-information/results_reports_presentations/2025/bridgepoint-interim-results-2025-presentation.pdf.downloadasset.pdf"],
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.privateequitywire.co.uk/energy-capital-partners-returns-5-5bn-to-investors-in-2025/",
  }),
  f("FUND-065", "Energy Capital Partners", "ECP Energy Transition Opportunities Fund", "2021", "$500M", 500, "Opportunistic", "Financial Close", {
    investmentStrategy: "Focused private equity vehicle targeting energy and clean technology investments, primarily in power generation, renewable energy, battery storage, and decarbonization infrastructure across North America, deploying control-oriented, value-add capital into a concentrated portfolio of 10–15 companies. Builds on ECP's three-decade track record investing through multiple energy cycles. Portfolio includes Anza, a solar/storage procurement platform spun out from Borrego.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/19478-89F", "https://radientanalytics.com/firm/adv/ecp-155020", "https://www.businesswire.com/news/home/20230516005316/en/Anza-Completes-Separation-from-Borrego-and-Receives-New-Investment-from-Energy-Capital-Partners-Led-Consortium-to-Transform-Solar-and-Storage-Procurement"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://pitchbook.com/profiles/fund/19478-89F",
  }),

  // ── Energy Infrastructure Partners (EIP) ──────────────────
  f("FUND-066", "Energy Infrastructure Partners", "EIP III (Global Energy Transition Infrastructure)", "2022", "€4.0B", 4400, "Core-Plus", "Financial Close", {
    investmentStrategy: "Targets large-scale, system-critical energy infrastructure — including carbon-free power generation (renewables), energy transmission (grids and networks), and energy storage — across developed economies in Europe and the Americas. Takes long-duration equity stakes alongside strategic industrial partners such as major European utilities, targeting stable and visible long-term cash flows aligned with asset economic lifetimes. Held first close at €1 billion.",
    sourceUrls: ["https://energy-infrastructure-partners.com/wp-content/uploads/2023/11/With-funding-of-EUR-1bn-EIP-holds-first-close-of-its-energy-transition-infrastructure-fund.pdf"],
    sectors: ["Renewables / Energy Transition", "Utilities", "Power Generation"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://energy-infrastructure-partners.com/wp-content/uploads/2023/11/With-funding-of-EUR-1bn-EIP-holds-first-close-of-its-energy-transition-infrastructure-fund.pdf",
  }),

  // ── EQT ───────────────────────────────────────────────────
  f("FUND-067", "EQT", "EQT Infrastructure VI", "2023", "€21.5B", 23650, "Value-Add", "Financial Close", {
    investmentStrategy: "EQT's flagship value-add infrastructure fund — raising €21.5B at hard cap, making it the largest European-headquartered infrastructure fund ever — targeting essential-service businesses across digital infrastructure, energy transition and decarbonization, resource efficiency, transport and logistics, and social infrastructure in Europe, North America, and Asia-Pacific. Applies a hands-on industrial ownership model with more than 600 industrial advisors to accelerate operational improvements, digitalization, and sustainability transformation.",
    sourceUrls: ["https://eqtgroup.com/news/eqt-infrastructure-vi-holds-final-close-at-its-hard-cap-raising-eur-215-billion-in-total-commitments-2025-03-28"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Waste / Environmental Services", "Transportation"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://eqtgroup.com/news/eqt-infrastructure-vi-holds-final-close-at-its-hard-cap-raising-eur-215-billion-in-total-commitments-2025-03-28",
  }),
  f("FUND-068", "EQT", "EQT Active Core Infrastructure I", "2022", "$3.2B", 3200, "Core", "Evergreen", {
    investmentStrategy: "Applies EQT's active ownership approach to core infrastructure assets in Europe and North America, targeting longer-hold investments in essential-service businesses with strong downside protection through regulation, long-term contracts, stable cash yields, and inflation linkage. Invests across digital, energy, transport, and social infrastructure themes with a focus on setting tailored decarbonization plans for each portfolio company.",
    sourceUrls: ["https://eqtgroup.com/news/eqt-active-core-infrastructure-fund-holds-final-close-2024-09-24", "https://eqtgroup.com/infrastructure/eqt-active-core-infrastructure", "https://www.alphaspread.com/security/sto/eqt/investor-relations/earnings-call/q3-2025"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure"],
    regions: ["North America", "Europe"],
    structure: "Open-End",
    strategyUrl: "https://eqtgroup.com/infrastructure/eqt-active-core-infrastructure",
  }),
  f("FUND-069", "EQT", "EQT Transition Infrastructure", "2024", "€4.0B", 4400, "Value-Add", "Raising", {
    investmentStrategy: "Dedicated energy transition strategy investing globally across Europe, North America, and Asia-Pacific in businesses enabling the shift to a low-carbon and circular economy, with particular emphasis on battery energy storage, distributed energy (including microgrids), and other proven but undercapitalized clean energy subsectors. Applies EQT's industrial value creation playbook to scale transition infrastructure companies with strong secular tailwinds.",
    sourceUrls: ["https://eqtgroup.com/infrastructure/eqt-transition-infrastructure", "https://www.infrastructureinvestor.com/fubon-life-insurance-makes-e65m-commitment-to-eqt-infrastructure-fund/"],
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://eqtgroup.com/infrastructure/eqt-transition-infrastructure",
  }),
  // ── Fengate Asset Management ───────────────────────────────
  f("FUND-070", "Fengate Asset Management", "Fengate Infrastructure Fund IV", "2021", "$1.1B", 1100, "Value-Add", "Financial Close", {
    investmentStrategy: "Core-plus and value-add fund targeting mid-market North American infrastructure across social, transportation, energy transition, and digital sectors, with assets in both the U.S. and Canada. Originates deals through long-standing relationships with design-build contractors, project developers, and government procurement agencies, actively managing investments to protect and enhance equity returns. Closed above its US$1.1 billion target.",
    sourceUrls: ["https://www.globenewswire.com/news-release/2025/01/23/3014203/0/en/Fengate-announces-final-close-of-US-1-1-billion-flagship-infrastructure-fund-above-target.html"],
    sectors: ["Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
    strategies: ["Core-Plus", "Value-Add"],
    strategyUrl: "https://www.globenewswire.com/news-release/2025/01/23/3014203/0/en/Fengate-announces-final-close-of-US-1-1-billion-flagship-infrastructure-fund-above-target.html",
  }),
  f("FUND-071", "Fengate Asset Management", "Fengate Infrastructure Yield Fund", "2019", "C$1.2B+", 888, "Core", "Evergreen", {
    investmentStrategy: "Core infrastructure vehicle focused on long-term, contracted cash flows from essential North American assets, with investments spanning wireless communications tower portfolios (partnering with TowerCom across 4G/5G infrastructure) and social infrastructure including healthcare facilities. Designed to deliver stable, predictable, inflation-linked distributions to institutional investors.",
    sourceUrls: ["https://gowlingwlg.com/en/people/alan-james", "https://fengate.com/news/fengate-expands-its-portfolio-of-u-s-wireless-communications-towers-with-new-acquisition", "https://fengate.com/news/fengate-asset-management-announces-financial-close-on-two-u-s-healthcare-facilities"],
    sectors: ["Communications", "Social Infrastructure", "Utilities"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://fengate.com/news/fengate-expands-its-portfolio-of-u-s-wireless-communications-towers-with-new-acquisition",
  }),

  // ── Generate Capital ──────────────────────────────────────
  f("FUND-072", "Generate Capital", "Generate Capital Sustainable Infrastructure Fund", "2014", "$1.5B", 1500, "Value-Add", "Evergreen", {
    investmentStrategy: "Invests in sustainable resource infrastructure across North America and Europe, spanning renewable power (solar, fuel cells, green hydrogen), sustainable mobility (EV charging, electric and hydrogen fleets), water and waste (biogas, RNG, anaerobic digesters, recycling), and sustainable cities. Operates as a one-stop-shop owner, operator, and financier with an Infrastructure-as-a-Service model serving municipalities, school districts, universities, and commercial customers.",
    sourceUrls: ["https://www.esgtoday.com/generate-capital-raises-1-5-billion-for-sustainable-infrastructure-investments/", "https://globalfintechseries.com/fintech/generate-capital-closed-capital-raise-with-1-5-billion/"],
    sectors: ["Renewables / Energy Transition", "Transportation", "Water"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategies: ["Value-Add", "Opportunistic"],
    strategyUrl: "https://www.esgtoday.com/generate-capital-raises-1-5-billion-for-sustainable-infrastructure-investments/",
  }),
  f("FUND-073", "Generate Capital", "Generate Capital (Permanent Capital Vehicle)", "2014", "$10.0B+", 10000, "Value-Add", "Evergreen", {
    investmentStrategy: "Permanent capital vehicle deploying equity and infrastructure credit on a long-duration, open-ended basis into sustainable resource infrastructure across six sectors — power, mobility, waste, water, agriculture, and industrial decarbonization — with a growing emphasis on middle-market infrastructure lending. Structures bespoke financing solutions for sectors including green steel, data center power, thermal storage, and community solar. Recently raised over $1 billion to expand infrastructure credit solutions.",
    sourceUrls: ["https://www.esgtoday.com/generate-capital-raises-1-5-billion-for-sustainable-infrastructure-investments/", "https://mcj.vc/inevitable-podcast/scott-jacobs", "https://www.prnewswire.com/news-releases/generate-capital-raises-over-1-billion-to-expand-infrastructure-credit-solutions-302607095.html"],
    sectors: ["Renewables / Energy Transition", "Transportation", "Water", "Waste / Environmental Services"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.prnewswire.com/news-releases/generate-capital-raises-over-1-billion-to-expand-infrastructure-credit-solutions-302607095.html",
  }),

  // ── GIC ───────────────────────────────────────────────────
  f("FUND-074", "GIC", "GIC Infrastructure", "1981", "$744B", 744000, "Core", "Evergreen", {
    investmentStrategy: "Large-scale, long-duration direct investing strategy spanning the capital structure — equity and non-investment grade credit, across private and public markets — targeting essential-service assets with resilient cash flows including gas and electricity networks, renewables, digital infrastructure (data centers), water utilities, airports, seaports, and highways globally. Operates through a dedicated 70-person team across Singapore, London, New York, and São Paulo, integrating ESG throughout the investment lifecycle. Recent investments include a stake in Reworld (waste-to-energy) alongside EQT.",
    sourceUrls: ["https://www.gic.com.sg/thinkspace/investment-strategies/infrastructure-a-resilient-strategy-in-uncertain-times/", "https://www.privateequityinternational.com/side-letter-gics-allocation-uplift/", "https://eqtgroup.com/news/eqt-broadens-reworld-investor-base-welcoming-gic-as-strategic-investor-2024-10-02/"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    structure: "Permanent Capital",
    strategies: ["Core", "Core-Plus"],
    strategyUrl: "https://www.gic.com.sg/thinkspace/investment-strategies/infrastructure-a-resilient-strategy-in-uncertain-times/",
  }),

  // ── GIP/MGX/Microsoft ─────────────────────────────────────
  f("FUND-075", "Global Infrastructure Partners (BlackRock)", "AI Infrastructure Partnership (AIP)", "2024", "$30.0B", 12500, "Value-Add", "Evergreen", {
    investmentStrategy: "Strategic co-investment platform co-founded by BlackRock/GIP, Microsoft, MGX, NVIDIA, xAI, and sovereign partners, targeting large-scale AI-enabling infrastructure — primarily hyperscale data centers and the power and energy infrastructure required to support them — with a primary focus on the United States. Aims to mobilize up to $30B in private equity and $100B in total investment capacity, deploying at the intersection of AI technology and hard infrastructure. Has raised $12.5 billion to date and is acquiring all equity in Aligned Data Centers.",
    sourceUrls: ["https://www.infrastructureinvestor.com/the-pipeline-gip-reaches-12-5bn-on-ai-fund-stonepeaks-ir-lead-down-under-kkr-forms-15bn-offshore-jv/", "https://ir.blackrock.com/news-and-events/press-releases/press-releases-details/2025/BlackRock-Global-Infrastructure-Partners-Microsoft-and-MGX-Welcome-NVIDIA-and-xAI-to-the-AI-Infrastructure-Partnership-to-Drive-Investment-in-Data-Centers-and-Enabling-Infrastructure/default.aspx", "https://www.global-infra.com/news/ai-infrastructure-partnership-aip-mgx-and-blackrocks-global-infrastructure-partners-gip-to-acquire-all-equity-in-aligned-data-centers/"],
    sectors: ["Digital Infrastructure", "Power Generation", "Utilities"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://ir.blackrock.com/news-and-events/press-releases/press-releases-details/2025/BlackRock-Global-Infrastructure-Partners-Microsoft-and-MGX-Welcome-NVIDIA-and-xAI-to-the-AI-Infrastructure-Partnership-to-Drive-Investment-in-Data-Centers-and-Enabling-Infrastructure/default.aspx",
  }),

  // ── Global Infrastructure Partners (BlackRock) ────────────
  f("FUND-076", "Global Infrastructure Partners (BlackRock)", "Global Infrastructure Partners V (GIP V)", "2022", "$25.2B", 25200, "Core-Plus", "Financial Close", {
    investmentStrategy: "GIP's largest-ever flagship fund pursuing a core-plus infrastructure strategy targeting essential assets across energy, transportation, digital infrastructure, water, and waste in North America, Europe, Australia, and selectively Asia-Pacific. Targets gross returns of 15–20% and a 5–7% cash yield through equity investments of $1–3B per transaction, with a disciplined focus on proprietary origination and the global energy transition. Portfolio highlights include Columbia Pipelines (40% stake), Rio Grande LNG, Allete (US utility), and Hutchison Ports, with over 40 portfolio companies generating $75+ billion in annual revenue.",
    sourceUrls: ["https://inforcapital.com/funds/global-infrastructure-partners-v-gip-fund-v/"],
    sectors: ["Transportation", "Utilities", "Power Generation", "Digital Infrastructure", "Midstream / Energy"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://inforcapital.com/funds/global-infrastructure-partners-v-gip-fund-v/",
  }),
  f("FUND-077", "Global Infrastructure Partners (BlackRock)", "GIP Mid-Market Fund V", "2025", "$7.0B", 7000, "Value-Add", "Raising", {
    investmentStrategy: "Core-plus, global mid-market infrastructure fund succeeding BlackRock's Global Infrastructure Fund IV series, focusing on high-quality essential businesses with long-term contracted cash flows across energy, transport, digital infrastructure, water, and waste. Capitalizes on mid-market opportunities where GIP's sector expertise and active ownership drive substantial value creation, with a strong orientation toward energy transition and decarbonization themes.",
    sourceUrls: ["https://www.infrastructureinvestor.com/gip-to-seek-7bn-for-rebranded-mid-market-fund-exclusive", "https://pitchbook.com/profiles/fund/28343-44F"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
    strategyUrl: "https://www.infrastructureinvestor.com/gip-to-seek-7bn-for-rebranded-mid-market-fund-exclusive",
  }),
  f("FUND-078", "Global Infrastructure Partners (BlackRock)", "Global Infrastructure Partners Core Fund", "2022", "$5.0B", 5000, "Core", "Raising", {
    investmentStrategy: "Dedicated core infrastructure vehicle targeting essential-service assets globally across GIP's primary sectors — energy, transportation, digital, water, and waste — with a focus on stable, long-duration cash flows, low-to-moderate risk, and inflation protection. Leverages GIP's proprietary deal origination, deep sector relationships, and operational capabilities within the broader BlackRock infrastructure platform.",
    sourceUrls: ["https://www.sib.wa.gov/docs/meetings/board/22_1215final.pdf", "https://pitchbook.com/profiles/fund/23624-02F"],
    sectors: ["Utilities", "Transportation", "Power Generation"],
    regions: ["North America", "Global"],
    strategyUrl: "https://www.sib.wa.gov/docs/meetings/board/22_1215final.pdf",
  }),

  // ── Goldman Sachs Alternatives ────────────────────────────
  f("FUND-079", "Goldman Sachs Alternatives", "West Street Infrastructure Partners V (WSIP V)", "2024", "$4.0B", 4000, "Value-Add", "Raising", {
    investmentStrategy: "Fifth flagship closed-end infrastructure fund targeting core-plus and value-add opportunities across energy transition, digital infrastructure, transport and logistics, and social infrastructure primarily in Europe and North America. Applies Goldman Sachs's industrial value creation playbook — including the Value Accelerator — to mid-market operating businesses with long-term, defensive cash flows, targeting net IRRs of approximately 13%.",
    sourceUrls: ["https://ionanalytics.com/insights/infralogic/goldman-sachs-west-street-v-fundraise-gains-traction/"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America", "Global"],
    strategies: ["Core-Plus", "Value-Add"],
    strategyUrl: "https://ionanalytics.com/insights/infralogic/goldman-sachs-west-street-v-fundraise-gains-traction/",
  }),
  f("FUND-080", "Goldman Sachs Alternatives", "West Street Infrastructure Partners IV (WSIP IV)", "2021", "$4.0B", 4000, "Value-Add", "Financial Close", {
    investmentStrategy: "Global value-add, mid-market fund investing across energy transition (biomethane, battery storage), digital infrastructure (fiber broadband), transport and logistics, and social infrastructure in Europe and North America. Invests primarily in operating businesses with defensive long-term cash flows, deploying active ownership and the Goldman Sachs Value Accelerator platform to drive operational improvements and ESG progress.",
    sourceUrls: ["https://am.gs.com/en-gb/advisors/news/press-release/2023/goldman-sachs-asset-management-raises-4-billion-for-west-street-infrastructure-partners-iv"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America", "Global"],
    strategyUrl: "https://am.gs.com/en-gb/advisors/news/press-release/2023/goldman-sachs-asset-management-raises-4-billion-for-west-street-infrastructure-partners-iv",
  }),
  f("FUND-081", "Goldman Sachs Alternatives", "West Street Private Infrastructure Fund (G-INFRA)", "2025", "$300M", 300, "Value-Add", "Evergreen", {
    investmentStrategy: "Open-ended, evergreen infrastructure vehicle offering private wealth investors access to directly originated core-plus and value-add mid-market infrastructure alongside Goldman Sachs's institutional flagship strategies, with additional exposure to infrastructure secondaries and liquid assets. Targets the same four thematic pillars — energy transition, digital infrastructure, transport and logistics, and the circular economy — with monthly subscriptions and quarterly distributions.",
    sourceUrls: ["https://am.gs.com/en-be/advisors/news/press-release/2025/g-infra-launch", "https://cdn.prod.website-files.com/665f05e4b0db845a831c93c0/68a7ce1cc0f71718b31114d6_West%20Street%20Private%20Infrastructure%20Fund%20(AUD)%20Class%20A%20-%20June%202025.pdf", "https://cdn.prod.website-files.com/665f05e4b0db845a831c93c0/694b643224eb1c73eade638e_West%20Street%20Private%20Infrastructure%20Fund%20(AUD)%20Class%20A%20-%20October%202025.pdf"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["Global", "North America"],
    strategies: ["Core-Plus", "Value-Add"],
    strategyUrl: "https://am.gs.com/en-be/advisors/news/press-release/2025/g-infra-launch",
  }),
  // ── H.I.G. Capital ─────────────────────────────────────────
  f("FUND-082", "H.I.G. Capital", "H.I.G. Infrastructure Partners Fund I", "2021", "$1.3B", 1300, "Value-Add", "Financial Close", {
    investmentStrategy: "Targets middle-market infrastructure equity investments across energy (clean and renewable), transportation, and telecommunications in North America and Europe, applying a value-add and core-plus approach that leverages H.I.G.'s operational expertise to reposition and grow assets. Pursues control-oriented stakes in 12–15 companies with a strong orientation toward low-carbon and sustainable infrastructure.",
    sourceUrls: ["https://hig.com/news/h-i-g-capital-raises-1-3-billion-for-infrastructure-fund/"],
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities"],
    regions: ["North America", "Europe"],
    strategies: ["Core-Plus", "Value-Add"],
    strategyUrl: "https://hig.com/news/h-i-g-capital-raises-1-3-billion-for-infrastructure-fund/",
  }),

  // ── Harbert Management Corporation ────────────────────────
  f("FUND-083", "Harbert Management Corporation", "Harbert Infrastructure Fund VI", "2019", "$905M", 905, "Core-Plus", "Financial Close", {
    investmentStrategy: "Lower-middle-market fund focused on power and energy infrastructure assets in North America, targeting contracted cash flows across renewable energy, dispatchable generation, and distributed generation. Applies an active asset management approach capitalizing on the decarbonization and electrification transition underway in U.S. power markets.",
    sourceUrls: ["https://www.globenewswire.com/news-release/2022/10/06/2529666/0/en/Harbert-Infrastructure-Fund-VI-LP-Announces-Final-Close.html"],
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.globenewswire.com/news-release/2022/10/06/2529666/0/en/Harbert-Infrastructure-Fund-VI-LP-Announces-Final-Close.html",
  }),

  // ── Harrison Street ───────────────────────────────────────
  f("FUND-084", "Harrison Street", "Harrison Street Social Infrastructure Fund", "2018", "$2.45B", 2450, "Core-Plus", "Evergreen", {
    investmentStrategy: "Open-ended core infrastructure vehicle targeting highly structured investments in critical assets serving universities, health systems, and government entities, including campus housing, renewable energy, district energy systems, and P3 buildings. Focuses on the lower-to-middle market in North America with long-term contracted revenues (typically 10–45 year weighted average durations), targeting gross returns of 8–10%.",
    sourceUrls: ["https://www.sec.gov/Archives/edgar/data/1744140/000174414023000002/xslFormDX01/primary_doc.xml", "https://www.harrisonst.com/wp-content/uploads/2020/05/HSRE_ESG-Impact_2019.pdf", "https://irei.com/news/harrison-street-launches-open-end-social-infrastructure-fund/"],
    sectors: ["Social Infrastructure"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://irei.com/news/harrison-street-launches-open-end-social-infrastructure-fund/",
  }),
  f("FUND-085", "Harrison Street", "Harrison Street Energy Transition Fund", "2023", "$750M", 750, "Value-Add", "Raising", {
    investmentStrategy: "Closed-end vehicle targeting clean and renewable energy infrastructure in North America, building on Harrison Street's social infrastructure franchise with a focus on decarbonization-driven opportunities such as solar, storage, and other clean energy assets in the lower-to-mid-market energy transition space.",
    sourceUrls: ["https://www.infrastructureinvestor.com/harrison-street-to-launch-750m-energy-transition-fund-exclusive/"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/harrison-street-to-launch-750m-energy-transition-fund-exclusive/",
  }),
  f("FUND-086", "Harrison Street", "Harrison Street Digital Fund", "2024", "$600M", 600, "Value-Add", "Financial Close", {
    investmentStrategy: "Focuses exclusively on digital infrastructure development in U.S. markets, deploying capital into data center campuses, powered shells, colocation facilities, carrier hotels, and dark fiber networks. Takes a primary development orientation — targeting new builds with hyperscale and enterprise tenants — leveraging five operating partnerships to access the full digital ecosystem.",
    sourceUrls: ["https://harrisonst.com/harrison-street-closes-600-million-for-digital-asset-investments/"],
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America"],
    strategyUrl: "https://harrisonst.com/harrison-street-closes-600-million-for-digital-asset-investments/",
  }),

  // ── I Squared Capital ─────────────────────────────────────
  f("FUND-087", "I Squared Capital", "ISQ Global Infrastructure Fund IV", "2024", "$15.0B", 15000, "Value-Add", "Raising", {
    investmentStrategy: "Global value-add strategy targeting middle-market infrastructure assets across power and utilities, digital, transport and logistics, social, and environmental infrastructure, with a primary focus on OECD markets and up to 25% in select growth economies. Deploys capital through build-and-scale platform roll-ups and larger opportunistic acquisitions, growing small platforms into scaled infrastructure businesses. Notable LP commitments include ATRS ($75M).",
    sourceUrls: ["https://www.infrastructureinvestor.com/atrs-commits-75m-to-infrastructure/"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Utilities"],
    regions: ["Global", "North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/atrs-commits-75m-to-infrastructure/",
  }),
  f("FUND-088", "I Squared Capital", "ISQ Energy Transition Infrastructure Fund", "2023", "$719M", 719, "Value-Add", "Financial Close", {
    investmentStrategy: "Dedicated SFDR Article 9 vehicle focused on accelerating the shift to renewable and low-carbon energy, investing in mid-sized platform companies across renewables generation, battery storage, grid stability, clean fuels (including renewable diesel and SAF), distributed generation, and electrification of transport, primarily in North America and Europe. Recent activity includes the acquisition of Oregon's premier renewable fuels terminal.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/23895-19F", "https://www.fundrock-lis.com/media/a2njuroq/isq-etf-sfdr-level-2-article-9-website-disclosures_weil.pdf", "https://www.businesswire.com/news/home/20251216019924/en/I-Squared-Capital-Accelerates-U.S.-Energy-Transition-with-Acquisition-of-Oregons-Premier-Renewable-Fuels-Terminal"],
    sectors: ["Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.businesswire.com/news/home/20251216019924/en/I-Squared-Capital-Accelerates-U.S.-Energy-Transition-with-Acquisition-of-Oregons-Premier-Renewable-Fuels-Terminal",
  }),

  // ── ICON Infrastructure ───────────────────────────────────
  f("FUND-089", "ICON Infrastructure", "iCON Infrastructure Partners VII", "2025", "$3.7B", 3700, "Core-Plus", "Financial Close", {
    investmentStrategy: "Core-to-core-plus fund targeting privately held, mid-market infrastructure businesses in Europe and North America across transport, utilities, telecoms, energy and environment, and social infrastructure, with added emphasis on renewable energy and waste management. Targets approximately 15 brownfield transactions over 6–10 year hold periods, combining active asset management with board-level governance, targeting low double-digit net IRRs.",
    sourceUrls: ["https://iconinfrastructure.com/", "https://inforcapital.com/funds/icon-infrastructure-partners-vii-icon-vii/"],
    sectors: ["Utilities", "Digital Infrastructure", "Transportation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://inforcapital.com/funds/icon-infrastructure-partners-vii-icon-vii/",
  }),

  // ── IFM Investors ─────────────────────────────────────────
  f("FUND-090", "IFM Investors", "IFM Global Infrastructure Fund (GIF)", "2004", "$73.6B", 73600, "Core", "Evergreen", {
    investmentStrategy: "Large open-ended core infrastructure fund investing in essential, monopoly-like assets with strong market positions, high barriers to entry, and predictable cash flows in OECD developed markets — principally North America, the UK and Europe, and Australia. Focused on transportation, energy midstream, communications, and utilities, pursuing a long-term hold-and-manage strategy with opportunistic exits. US portfolio includes Indiana Toll Road ($5.7B acquisition), Buckeye Partners ($10.3B — 5,000+ miles of pipeline, 130M barrels storage), Colonial Pipeline, Freeport LNG, Swift Current Energy, and Switch (data centers).",
    sourceUrls: ["https://outside.vermont.gov/dept/VPIC/Shared%20Documents/VPIC%20Website/Meetings/VPIC%20General%20Meetings/Meeting%20Materials/2022/09-27-2022/2022-09%20IFM%20GIF%20Recommendation%20vF%20(Redacted).pdf", "https://pitchbook.com/profiles/fund/13416-94F"],
    sectors: ["Transportation", "Utilities", "Midstream / Energy", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    structure: "Open-End",
    strategyUrl: "https://outside.vermont.gov/dept/VPIC/Shared%20Documents/VPIC%20Website/Meetings/VPIC%20General%20Meetings/Meeting%20Materials/2022/09-27-2022/2022-09%20IFM%20GIF%20Recommendation%20vF%20(Redacted).pdf",
  }),
  f("FUND-091", "IFM Investors", "IFM Net Zero Infrastructure Fund (NZIF)", "2022", "$3.0B", 3000, "Core-Plus", "Evergreen", {
    investmentStrategy: "Open-ended core infrastructure fund investing in assets that directly accelerate the global energy transition, targeting renewable energy, low-carbon fuels (including renewable natural gas), climate tech, and cleantech infrastructure globally. Invests up to $500M per opportunity and prioritizes assets with measurable real-world emissions reduction impact. Portfolio includes GreenGas, a US renewable natural gas developer and operator.",
    sourceUrls: ["https://sfrhctf.org/wp-content/uploads/2023/05/Private-Market-Spacing-Study-V2.pdf", "https://www.ifminvestors.com/news-and-insights/media-centre/ifm-net-zero-infrastructure-fund-completes-greengas-acquisition-marking-next-era-of-growth-for-renewable-energy-company/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Global"],
    strategyUrl: "https://www.ifminvestors.com/news-and-insights/media-centre/ifm-net-zero-infrastructure-fund-completes-greengas-acquisition-marking-next-era-of-growth-for-renewable-energy-company/",
  }),
  f("FUND-092", "IFM Investors", "IFM Global Value Add Infrastructure Fund", "2025", "$2.5B", 2500, "Value-Add", "Raising", {
    investmentStrategy: "IFM's first dedicated move beyond its traditional core mandate, targeting mid-market and growth-stage infrastructure assets at the intersection of infrastructure and private equity across global markets, with particular focus on digitalization, decarbonization, and deglobalization themes. Pursues buy-and-build, operational improvement, and platform consolidation in sectors such as digital infrastructure, grid modernization, and energy transition.",
    sourceUrls: ["https://ionanalytics.com/insights/infralogic/ifm-prepares-first-global-value-add-infra-fund/"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    strategyUrl: "https://ionanalytics.com/insights/infralogic/ifm-prepares-first-global-value-add-infra-fund/",
  }),
  // ── Igneo Infrastructure Partners (First Sentier) ──────────
  f("FUND-093", "Igneo Infrastructure Partners", "North American Diversified Infrastructure Fund (NADIF)", "2024", "$1.0B", 1000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Closed-end, core-plus vehicle targeting mid-market infrastructure companies in the United States and Canada across commercial transportation, energy, communications, and networking sectors. Applies Igneo's established proactive asset management approach — securing lead or sole ownership positions to drive operational value creation — as the firm's dedicated North American regional strategy. Notable LP commitments include Texas ERS ($100M); debuted with an aviation infrastructure acquisition.",
    sourceUrls: ["https://irei.com/news/texas-ers-pours-100m-into-igneo-chambers-energy-funds/", "https://www.infrastructureinvestordeals.com/deals/igneo-makes-debut-north-american-strategy-investment-with-aviation-acquisition"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure"],
    regions: ["North America"],
    strategyUrl: "https://irei.com/news/texas-ers-pours-100m-into-igneo-chambers-energy-funds/",
  }),
  f("FUND-094", "Igneo Infrastructure Partners", "Global Diversified Infrastructure Fund (GDIF)", "2007", "$7.5B+", 7500, "Core", "Evergreen", {
    investmentStrategy: "Open-ended, core-plus vehicle investing in high-quality, mature, mid-market infrastructure companies across OECD countries in the UK, Europe, North America, and Australia/New Zealand, targeting renewables, digital infrastructure, waste management, water utilities, and transportation. Typically holds controlling or lead positions for the long term — some in excess of 25 years — creating value through proactive asset management and ESG integration. Recent investments include Recycle Central Group.",
    sourceUrls: ["https://www.infrastructureinvestor.com/gilchrist-igneo-a-clean-sheet-of-paper-in-terms-of-opportunity/", "https://www.land.nd.gov/sites/www/files/documents/Board%20Agenda%20Packets/1%20-%2010%20-%20October%2028%202021%20Full%20Agenda%20Packet.pdf", "https://www.igneoip.com/australia/en/institutional/news-and-insights/press/igneo-invests-in-recycle-central-group.html"],
    sectors: ["Transportation", "Utilities", "Waste / Environmental Services"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    structure: "Open-End",
    strategyUrl: "https://www.infrastructureinvestor.com/gilchrist-igneo-a-clean-sheet-of-paper-in-terms-of-opportunity/",
  }),

  // ── InfraBridge (DigitalBridge) ───────────────────────────
  f("FUND-095", "InfraBridge", "InfraBridge Global Infrastructure Fund III (GIF III)", "2022", "$4.75B", 4750, "Value-Add", "Financial Close", {
    investmentStrategy: "Targets the value-add, mid-market infrastructure segment in North America and Europe, focusing on transportation and logistics, digital infrastructure (including fiber, towers, and data centers), and energy transition. Applies private-equity-style rigor to asset management and operational improvement, continuing the strategy established under AMP Capital before rebranding to InfraBridge.",
    sourceUrls: ["https://dgtlinfra.com/digitalbridge-amp-international-infrastructure-equity/"],
    sectors: ["Digital Infrastructure", "Transportation", "Utilities"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://dgtlinfra.com/digitalbridge-amp-international-infrastructure-equity/",
  }),

  // ── InfraRed Capital Partners ─────────────────────────────
  f("FUND-096", "InfraRed Capital Partners", "InfraRed Infrastructure Fund VI", "2022", "$1.0B+", 1000, "Value-Add", "Financial Close", {
    investmentStrategy: "Value-add strategy in the lower mid-market across North America and Western Europe, targeting essential infrastructure in energy transition, digital, and transport sectors at early to growth stages, with an emphasis on creating and de-risking assets into cash-generating platforms. Typically invests $100–200M per company, working closely with management teams through active asset management.",
    sourceUrls: ["https://www.ircp.com/news/infrared-capital-partners-announces-1-billion-close-for-sixth-value-add-fund/", "https://www.infrastructureinvestor.com/infrared-in-1bn-final-close-for-sixth-flagship-exclusive/"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.ircp.com/news/infrared-capital-partners-announces-1-billion-close-for-sixth-value-add-fund/",
  }),
  f("FUND-097", "InfraRed Capital Partners", "InfraRed Infrastructure Fund VII", "2025", "$1.5B", 1500, "Value-Add", "Raising", {
    investmentStrategy: "Continues InfraRed's lower-mid-market value-add strategy targeting essential infrastructure across OECD markets in North America and Western Europe, with a focus on transport, energy transition, digital infrastructure, and social infrastructure. Each investment typically ranges between $100–200M, deploying active development and construction expertise alongside in-house asset management.",
    sourceUrls: ["https://irei.com/news/infrared-seeks-1-5b-for-seventh-value-add-infrastructure-fund/", "https://ionanalytics.com/insights/infralogic/infrared-readies-usd-1-5bn-seventh-infra-fund/", "https://www.infrastructureinvestor.com/the-pipeline-infravia-reaches-e5bn-infra-steadies-omers-ship-equitix-leads-500m-storage-push/"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://irei.com/news/infrared-seeks-1-5b-for-seventh-value-add-infrastructure-fund/",
  }),
  f("FUND-098", "InfraRed Capital Partners", "HICL Infrastructure PLC", "2006", "£3.0B", 3900, "Core", "Evergreen", {
    investmentStrategy: "London-listed, open-ended core infrastructure investment company focused primarily on PPP/PFI projects, regulated assets (electricity and gas networks, water utilities), and demand-based transport concessions across the UK (~66% of portfolio), with additional exposure in Europe, North America, and Australia. Targets stable, inflation-linked income from a diversified portfolio of over 100 essential assets at the lower end of the infrastructure risk spectrum.",
    sourceUrls: ["https://www.dcfmodeling.com/blogs/history/hicll-history-mission-ownership", "https://www.ircp.com/news/hicl-infrastructure-plc-move-domicile/"],
    sectors: ["Social Infrastructure", "Utilities", "Transportation"],
    regions: ["Global", "North America", "Europe"],
    structure: "Listed / Evergreen",
    ticker: "HICL.L",
    strategyUrl: "https://www.ircp.com/news/hicl-infrastructure-plc-move-domicile/",
  }),
  f("FUND-099", "InfraRed Capital Partners", "North American Core Income Energy Transition Fund", "2023", "$900M", 900, "Core", "Evergreen", {
    investmentStrategy: "Core income strategy targeting contracted, decarbonization-oriented renewable energy infrastructure in North America, seeded with $400M from Sun Life and launched following InfraRed's partnership with SLC Management. Focuses on operational wind and solar generation assets, applying InfraRed's renewable energy expertise to generate stable, income-producing returns from the clean energy transition.",
    sourceUrls: ["https://www.infrastructureinvestor.com/infrared-in-1bn-final-close-for-sixth-flagship-exclusive/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/infrared-in-1bn-final-close-for-sixth-flagship-exclusive/",
  }),

  // ── InfraVia Capital Partners ─────────────────────────────
  f("FUND-100", "InfraVia Capital Partners", "InfraVia European Fund VI", "2023", "€8.0B", 8800, "Value-Add", "Financial Close", {
    investmentStrategy: "Core-plus fund targeting mid-market infrastructure companies across Europe in energy and the energy transition, digital infrastructure, mobility, and social infrastructure, combining resilient contracted cash flows with active value creation. Closed at its €8B hard cap — the largest in the firm's history — reflecting strong demand for InfraVia's differentiated European mid-market approach. Notable LP commitments include LACERA.",
    sourceUrls: ["https://www.infrastructureinvestor.com/infravia-raises-e8bn-for-latest-european-infra-fund-exclusive/", "https://www.lacera.gov/sites/default/files/assets/documents/board/2024/BOI/2024-11-13-boi_agnd.pdf"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["Europe", "North America"],
    strategies: ["Core-Plus", "Value-Add"],
    strategyUrl: "https://www.infrastructureinvestor.com/infravia-raises-e8bn-for-latest-european-infra-fund-exclusive/",
  }),

  // ── IMCO ──────────────────────────────────────────────────
  f("FUND-101", "Investment Management Corporation of Ontario (IMCO)", "IMCO Infrastructure Fund", "2016", "C$11.3B", 8249, "Core-Plus", "Evergreen", {
    investmentStrategy: "Direct infrastructure portfolio targeting global core and core-plus assets across digital infrastructure (data centers, fiber, towers), regulated utilities (including electrification-linked networks), and clean energy transition, with geographic diversification spanning North America, the UK and Europe, and Latin America. Pursues both direct investments and fund co-investments, prioritizing high-quality businesses with strong contracted cash flows and barriers to entry.",
    sourceUrls: ["https://www.imcoinvest.com/news/imco-annual-report-2024.html", "https://www.top1000funds.com/asset_owner/investment-management-corporation-of-ontario-imco/", "https://www.top1000funds.com/2025/07/imco-reconsiders-us-exposure-as-geopolitical-landscape-shifts/", "https://www.imcoinvest.com/articles/strategic-approach-to-digitalization-and-connectivity.html"],
    sectors: ["Digital Infrastructure", "Transportation", "Utilities", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.imcoinvest.com/news/imco-annual-report-2024.html",
  }),

  // ── J.P. Morgan Asset Management ──────────────────────────
  f("FUND-102", "J.P. Morgan Asset Management", "Infrastructure Investments Fund (IIF)", "2007", "$41.0B", 41000, "Core", "Evergreen", {
    investmentStrategy: "Large open-ended core and core-plus infrastructure fund targeting essential service companies in energy, water, and transportation with predictable contracted or regulated cash flows, primarily in the United States, Western Europe, and Australia. Pursues control or majority positions across 20+ companies and 800+ assets, targeting net returns of 8–12% and annual cash yield of 5–7%, with a platform-building approach that aggregates middle-market assets outside competitive auctions.",
    sourceUrls: ["https://www.cincinnati-oh.gov/sites/retirement/assets/Committee%20Meetings/Investment/Packet/2025/Investment-Packet-5-1-25.pdf"],
    sectors: ["Utilities", "Transportation", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe"],
    structure: "Open-End",
    strategyUrl: "https://www.cincinnati-oh.gov/sites/retirement/assets/Committee%20Meetings/Investment/Packet/2025/Investment-Packet-5-1-25.pdf",
  }),
  f("FUND-103", "J.P. Morgan Asset Management", "Global Transport Income Fund (GTIF)", "2017", "$4.07B", 4070, "Core", "Evergreen", {
    investmentStrategy: "Income-oriented infrastructure fund focused on generating current income from assets and businesses across global transportation industries, investing through a master fund structure targeting diversified exposure to the transport sector across geographies including airports, toll roads, ports, and rail assets.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/16687-45F", "https://am.jpmorgan.com/content/dam/jpm-am-aem/emea/gb/en/regulatory/annual-and-half-year-reports/global-core-real-ar-2023.pdf", "https://www.formds.com/issuers/global-transport-income-fund-master-partnership-scsp"],
    sectors: ["Transportation"],
    regions: ["Global", "North America", "Europe"],
    structure: "Open-End",
    strategyUrl: "https://am.jpmorgan.com/content/dam/jpm-am-aem/emea/gb/en/regulatory/annual-and-half-year-reports/global-core-real-ar-2023.pdf",
  }),
  // ── Kimmeridge ─────────────────────────────────────────────
  f("FUND-104", "Kimmeridge", "Kimmeridge Carbon Solutions Fund II", "2024", "Undisclosed", null, "Opportunistic", "Financial Close", {
    investmentStrategy: "Buyout-style fund investing in the decarbonization segment of the North American energy sector, targeting carbon capture and storage (CCUS) projects, carbon markets (including forest carbon offsets), clean fuels, and integrated natural gas infrastructure with certified low-emission credentials. Leverages Kimmeridge's subsurface geotechnical expertise and land aggregation capabilities to develop large-scale CCUS initiatives. Partners with Storegga on CCUS projects and has interests in LNG infrastructure.",
    sourceUrls: ["https://disclosurequest.com/results?search_form%5Bcik%5D=0002035811", "https://www.prnewswire.com/news-releases/kimmeridge-carbon-solutions-and-storegga-partner-to-advance-ccus-projects-301999822.html", "https://www.energy.gov/sites/default/files/2024-10/Commonwealth%20LNG%20LLC%20%28Docket%20No.%2019-134%29%20-%20Supplement%20to%20Notice%20of%20Change%20in%20Control%20and%20Amendment%20to%20Pending%20Application.pdf"],
    sectors: ["Midstream / Energy", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.prnewswire.com/news-releases/kimmeridge-carbon-solutions-and-storegga-partner-to-advance-ccus-projects-301999822.html",
  }),

  // ── KKR ───────────────────────────────────────────────────
  f("FUND-105", "KKR", "KKR Global Infrastructure Investors V", "2024", "$20.0B", 15000, "Value-Add", "Raising", {
    investmentStrategy: "Large-cap global value-add infrastructure fund targeting assets with entrenched customer bases, contractual and regulatory protections, and strong growth potential across the themes of decarbonization, digitalization, and deconsolidation. Invests across a broad range of infrastructure sectors in developed markets, applying KKR's operational expertise and platform-scale relationships. Notable investments include Metronet (US fiber broadband, JV with T-Mobile across 300+ communities in 19 states) and Telecom Italia Netco (Italy's national fiber network).",
    sourceUrls: ["https://www.artrs.gov/board/documents/CY2024/2024-06-12/BOT_Packet.pdf", "https://www.nhrs.org/docs/default-source/iic-public-materials/iic-public-materials---december-2025.pdf?sfvrsn=856013b4_3"],
    sectors: ["Digital Infrastructure", "Transportation", "Renewables / Energy Transition", "Utilities"],
    regions: ["North America", "Europe", "Global"],
    strategyUrl: "https://www.artrs.gov/board/documents/CY2024/2024-06-12/BOT_Packet.pdf",
  }),
  f("FUND-106", "KKR", "Diversified Core Infra Fund (DCIF)", "2020", "$11.8B", 11800, "Core", "Evergreen", {
    investmentStrategy: "Open-ended core infrastructure fund targeting mature, brownfield assets with stable contracted or regulated revenue streams across energy, transportation, telecommunications, water, and utilities in OECD developed markets. Pursues long-term buy-and-hold positions with investment tickets of $250–750M, targeting net IRRs of 7–9%, and sources the majority of deals on a proprietary, non-auction basis. Notable LP commitments include MainePERS ($125M).",
    sourceUrls: ["https://www.infrastructureinvestor.com/mainepers-commits-125m-to-infrastructure/", "https://www.arkleg.state.ar.us/Home/FTPDocument?path=%2FAssembly%2FMeeting+Attachments%2F000%2F27500%2FExhibit+H.06.a+-+ATRS+-+ATRS+Submission+of+1211+Items.pdf"],
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.infrastructureinvestor.com/mainepers-commits-125m-to-infrastructure/",
  }),
  f("FUND-107", "KKR", "Global Climate Transition Fund", "2023", "$7.0B", 7000, "Opportunistic", "Raising", {
    investmentStrategy: "Dedicated climate infrastructure vehicle targeting high-growth energy transition assets across renewables, battery storage, transportation electrification, green hydrogen, and decarbonization of existing power and industrial infrastructure in North America, Western Europe, and Asia-Pacific. Carries a 12-year lifespan and targets high-teens gross IRRs through investments of $300–750M per transaction.",
    sourceUrls: ["https://www.newprivatemarkets.com/in-brief-kkr-invests-in-australian-energy-transition-platform/", "https://ionanalytics.com/insights/infralogic/kkrs-global-climate-fund-nears-usd-3bn-initial-close/", "https://pitchbook.com/profiles/fund/24809-95F"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global", "North America"],
    strategyUrl: "https://ionanalytics.com/insights/infralogic/kkrs-global-climate-fund-nears-usd-3bn-initial-close/",
  }),
  f("FUND-108", "KKR", "KKR Infrastructure Fund (K-INFRA)", "2022", "$5.33B", 5330, "Core-Plus", "Evergreen", {
    investmentStrategy: "Non-traded, perpetual-life infrastructure vehicle designed to provide eligible individual investors with access to KKR's institutional infrastructure platform, allocating approximately 85% of assets to KKR's global infrastructure investments across telecommunications, energy transition, utilities, midstream, transportation, and waste. Forms joint ventures alongside KKR institutional vehicles, targeting both current income and capital appreciation with inflation protection.",
    sourceUrls: ["https://fintel.io/doc/sec-kkr-infrastructure-conglomerate-llc-1948056-10q-2025-november-14-20406-5830", "https://www.kinfra.com/"],
    sectors: ["Utilities", "Digital Infrastructure", "Transportation", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.kinfra.com/",
  }),

  // ── Kuwait Investment Authority (KIA) ─────────────────────
  f("FUND-109", "Kuwait Investment Authority (KIA)", "Wren House Infrastructure (Captive Platform)", "2013", "$5.0B", 5000, "Core", "Evergreen", {
    investmentStrategy: "Kuwait Investment Authority's wholly-owned captive infrastructure manager deploying capital globally across transport, energy, utilities, digital infrastructure (including fibre, towers, and data centres), and social infrastructure with a long-term, hold-oriented mandate. Targets core and core-plus assets primarily in Europe and North America, evolving toward a more active value-creation and asset-rotation approach. Portfolio includes QTS Realty Trust data center JV and North Sea Midstream Partners.",
    sourceUrls: ["https://www.macquarie.com/au/en/about/news/2018/mira-and-wren-house-divest-part-of-viesgos-portfolio-to-repsol-for-750-million.html", "https://www.whinfra.com/qts-realty-trust-and-wren-house-successfully-complete-joint-venture-for-three-northern-virginia-data-centers-2/", "https://www.prnewswire.com/news-releases/wren-house-to-acquire-north-sea-midstream-partners-limited-from-arclight-300684909.html"],
    sectors: ["Utilities", "Digital Infrastructure", "Midstream / Energy"],
    regions: ["Global", "North America", "Europe"],
    structure: "Permanent Capital",
    strategies: ["Core", "Core-Plus"],
    strategyUrl: "https://www.whinfra.com/qts-realty-trust-and-wren-house-successfully-complete-joint-venture-for-three-northern-virginia-data-centers-2/",
  }),

  // ── Macquarie Asset Management ────────────────────────────
  f("FUND-110", "Macquarie Asset Management", "Macquarie Energy Transition Infrastructure Fund (METI)", "2024", "$653.6M", 654, "Core-Plus", "Evergreen", {
    investmentStrategy: "Open-ended, core-plus private infrastructure fund targeting the energy transition sector across OECD countries, with an initial focus on decarbonizing the electricity sector through mature, deployable technologies. Subsectors include energy storage, distributed energy, renewable fuels, clean transportation, carbon capture, and circular economy solutions.",
    sourceUrls: ["https://www.macquarie.com/assets/macq/mam/au/performance-report/macquarie-energy-transition-infrastructure-performance-report.pdf", "https://www.macquarie.com/assets/macq/mam/au/flyer/macquarie-energy-transition-infrastructure-fund-asset-flyer.pdf", "https://pitchbook.com/profiles/fund/28207-63F"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.macquarie.com/assets/macq/mam/au/flyer/macquarie-energy-transition-infrastructure-fund-asset-flyer.pdf",
  }),
  f("FUND-111", "Macquarie Asset Management", "Macquarie Infrastructure Partners VI (MIP VI)", "2022", "$8.0B", 8000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Core-plus, closed-end fund targeting mid-market infrastructure assets across the Americas, seeking net IRRs of 10–12% and annual cash yields of 4–6%. Focuses on essential, contracted assets with high barriers to entry across transportation, digital infrastructure, utilities, energy, waste, and social infrastructure, deploying equity tickets of $50–125M per investment with an active ownership model.",
    sourceUrls: ["https://www.macquarie.com/au/en/about/news/2025/macquarie-asset-management-closes-macquarie-infrastructure-partners-vi.html", "https://inforcapital.com/funds/macquarie-infrastructure-partners-vi/"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure"],
    regions: ["North America"],
    strategyUrl: "https://www.macquarie.com/au/en/about/news/2025/macquarie-asset-management-closes-macquarie-infrastructure-partners-vi.html",
  }),
  f("FUND-112", "Macquarie Asset Management", "Macquarie Infrastructure Partners VII (MIP VII)", "2025", "$7.0B", 7000, "Core-Plus", "Raising", {
    investmentStrategy: "Latest fund in Macquarie's Americas-focused, core-plus infrastructure series targeting essential, contracted mid-market assets across transportation, digital infrastructure, utilities, energy, and waste sectors in the Americas. Builds on a track record spanning more than 22 years of investing in the region with an active ownership approach.",
    sourceUrls: ["https://www.infrastructureinvestor.com/macquarie-launches-latest-americas-infra-fund-targeting-7bn-exclusive/", "https://www.infrastructureinvestor.com/funds-in-market/"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/macquarie-launches-latest-americas-infra-fund-targeting-7bn-exclusive/",
  }),
  f("FUND-113", "Macquarie Asset Management", "Macquarie Global Infrastructure Fund (MGIF)", "2021", "$4.0B", 3000, "Core", "Evergreen", {
    investmentStrategy: "Open-ended, core-plus private infrastructure fund with a global mandate, deploying capital across energy and transport assets in Europe and the United States. Targets essential infrastructure across energy and utilities, renewables, transportation, and digital sectors, offering diversified exposure with inflation-linked, income-generating characteristics through a perpetual-capital structure.",
    sourceUrls: ["https://www.infrastructureinvestor.com/macquarie-secures-3bn-for-new-open-end-core-fund-exclusive/", "https://www.frontieradvisors.com.au/wp-content/uploads/2022/10/Market-Insights-RAT-quarterly-Q3-2022-Fundraising.pdf"],
    sectors: ["Utilities", "Transportation", "Power Generation"],
    regions: ["Global", "North America"],
    structure: "Open-End",
    strategyUrl: "https://www.infrastructureinvestor.com/macquarie-secures-3bn-for-new-open-end-core-fund-exclusive/",
  }),
  f("FUND-114", "Macquarie Asset Management", "Macquarie Green Energy Transition Solutions (MGETS)", "2022", "$3.0B+", 3000, "Value-Add", "Financial Close", {
    investmentStrategy: "Macquarie's first dedicated energy transition fund targeting opportunities beyond mature renewables, investing in companies that apply proven technologies to decarbonize energy sectors globally. Targets six subsectors — energy storage, distributed energy, renewable fuels, clean transportation, carbon capture, and circular economy — with a globally diversified portfolio spanning EMEA, APAC, and the Americas.",
    sourceUrls: ["https://www.macquarie.com/au/en/about/news/2025/macquarie-asset-management-reaches-us3-billion-close-of-green-energy-transition-solutions-fund-and-co-investment-commitment.html", "https://www.infrastructureinvestor.com/macquarie-closes-mgets-fund-oversubscribed-on-2-4bn/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global", "North America"],
    strategyUrl: "https://www.macquarie.com/au/en/about/news/2025/macquarie-asset-management-reaches-us3-billion-close-of-green-energy-transition-solutions-fund-and-co-investment-commitment.html",
  }),
  f("FUND-115", "Macquarie Asset Management", "Macquarie Green Energy and Climate Opportunities Fund", "2023", "$1.14B", 1140, "Core-Plus", "Evergreen", {
    investmentStrategy: "Open-ended, opportunistic fund providing diversified exposure to large-scale renewable energy and natural climate solutions across OECD markets, with investments spanning solar, wind, energy storage, and natural climate solutions. Targets equity investments across multiple asset lifecycle stages — development, construction, and operations — spanning the Americas, Asia-Pacific, and Europe.",
    sourceUrls: ["https://www.macquarie.com/au/en/about/news/2024/macquarie-green-energy-and-climate-opportunities-fund-acquires-portfolio-of-six-investments.html", "https://pitchbook.com/profiles/fund/25578-37F"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    structure: "Open-End",
    strategyUrl: "https://www.macquarie.com/au/en/about/news/2024/macquarie-green-energy-and-climate-opportunities-fund-acquires-portfolio-of-six-investments.html",
  }),
  // ── Meridiam ───────────────────────────────────────────────
  f("FUND-116", "Meridiam", "Meridiam Infrastructure North America IV (MINA IV)", "2024", "$1.8B", 1800, "Value-Add", "Financial Close", {
    investmentStrategy: "Long-term, greenfield-first infrastructure fund focused on public-private partnership (PPP) projects in the United States and Canada, targeting transportation (roads, bridges, express lanes, transit), social infrastructure (schools, healthcare), environmental services, and low-carbon energy solutions. Employs a 25-year hold period aligned with concession durations, emphasizing contracted revenue streams and measurable sustainability outcomes.",
    sourceUrls: ["https://www.businesswire.com/news/home/20251002014398/en/Meridiam-Successfully-Closes-MINA-IV-Its-Flagship-North-America-Infrastructure-Fund-Raising-More-Than-%241.8-Billion", "https://data.treasury.ri.gov/dataset/5df8d940-feaf-4ab5-9713-4e746753beb0/resource/dd81494e-7749-4c75-a843-94eb0e16d7dc/download/1a-meridiam-infrastructure-north-america-iv-staff-memo-final.pdf"],
    sectors: ["Transportation", "Social Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.businesswire.com/news/home/20251002014398/en/Meridiam-Successfully-Closes-MINA-IV-Its-Flagship-North-America-Infrastructure-Fund-Raising-More-Than-%241.8-Billion",
  }),

  // ── Mirova ────────────────────────────────────────────────
  f("FUND-117", "Mirova", "Mirova Energy Transition 6 (MET6)", "2023", "€2.0B", 2200, "Core-Plus", "Raising", {
    investmentStrategy: "Infrastructure fund investing in greenfield, brownfield, and corporate energy transition assets with a primary focus on Europe and selective exposure to other OECD markets. Target subsectors span onshore and offshore wind, solar PV, hydropower, energy storage, energy efficiency, low-carbon electric mobility, and hydrogen, financing projects through their full lifecycle to generate stable, inflation-linked cash flows.",
    sourceUrls: ["https://www.im.natixis.com/en-gb/about/investment-manager-news/2025/mirova-energy-transition-6-fund-reaches-1-2-Billion-euro-at-second-close", "https://www.esgtoday.com/mirova-raises-1-4-billion-for-flagship-energy-transition-fund/", "https://pitchbook.com/profiles/fund/24431-95F", "https://www.mirova.com/sites/default/files/2023-10/Press%20release_Mirova%20Energy%20Transition%206_EN.pdf"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.im.natixis.com/en-gb/about/investment-manager-news/2025/mirova-energy-transition-6-fund-reaches-1-2-Billion-euro-at-second-close",
  }),

  // ── Morgan Stanley Investment Management ──────────────────
  f("FUND-118", "Morgan Stanley Investment Management", "North Haven Infrastructure Partners IV", "2022", "$4.1B", 4100, "Value-Add", "Financial Close", {
    investmentStrategy: "Value-add global infrastructure fund investing in essential assets that provide public goods and services with long useful lives and stable, inflation-linked cash flows. Targets transportation, digital infrastructure, energy transition (with a preference for renewables), and utilities, primarily in North America and OECD countries, with active asset management to drive value creation.",
    sourceUrls: ["https://www.morganstanley.com/im/en-us/individual-investor/insights/press-release/msim-closes-fourth-global-ingrastructure-fund-at-4B.html", "https://www.themiddlemarket.com/news-analysis/why-morgan-stanley-missed-the-6b-mark-on-its-fourth-infra-vintage"],
    sectors: ["Utilities", "Digital Infrastructure", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://www.morganstanley.com/im/en-us/individual-investor/insights/press-release/msim-closes-fourth-global-ingrastructure-fund-at-4B.html",
  }),

  // ── Morrison & Co. ────────────────────────────────────────
  f("FUND-119", "Morrison & Co.", "Infratil Limited", "1994", "NZ$19.0B", 11780, "Core-Plus", "Evergreen", {
    investmentStrategy: "Publicly listed, permanent-capital infrastructure investor targeting long-term annual after-tax shareholder returns of 11–15% across digital infrastructure, renewable energy, and healthcare assets in New Zealand, Australia, Europe, Asia, and the United States. Portfolio heavily weighted toward data centres (notably CDC Data Centres) and renewable energy developers, reflecting a deliberate pivot toward digitalization and decarbonization growth themes.",
    sourceUrls: ["https://infratil.com/for-investors/annual-reports/interim-report-2025/", "https://www.perplexity.ai/finance/IFT.NZ/history", "https://discountingcashflows.com/company/IFT.NZ/overview/", "https://www.annualreports.com/Company/infratil"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["Global", "North America", "Asia-Pacific"],
    structure: "Listed / Evergreen",
    ticker: "IFT.NZ",
    strategyUrl: "https://infratil.com/for-investors/annual-reports/interim-report-2025/",
  }),

  // ── Mubadala Investment Company ───────────────────────────
  f("FUND-120", "Mubadala Investment Company", "Mubadala Infrastructure (Real Assets)", "2008", "AED 1.2T", 326700, "Core-Plus", "Evergreen", {
    investmentStrategy: "Sovereign investor deploying capital across six high-conviction sectors: energy transition, digital infrastructure (data centres, fibre, towers), transport, power and utilities, industrial infrastructure, and sustainable assets. Operates through direct investments, co-investments, and GP partnerships across North America, Europe, the Middle East, and increasingly Asia, targeting capital-intensive assets with predictable, long-term cash flows. US office established for direct North American investment.",
    sourceUrls: ["https://www.mubadala.com/en/news/mubadala-investment-company-reports-2024-financial-results", "https://www.mubadala.com/en/who-we-are/our-structure", "https://www.mubadala.com/us"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["Global", "North America", "Middle East & Africa"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.mubadala.com/en/who-we-are/our-structure",
  }),

  // ── Northleaf Capital Partners ────────────────────────────
  f("FUND-121", "Northleaf Capital Partners", "Northleaf Infrastructure Capital Partners IV (NICP IV)", "2023", "$2.6B", 2600, "Core-Plus", "Financial Close", {
    investmentStrategy: "Core-plus, closed-end fund targeting control investments in contracted, mid-market infrastructure assets primarily in North America, with selective exposure to Western Europe and Australia. Focuses on renewable energy, digital infrastructure (fibre, towers, data centres), transportation (including rail), and outsourced services, deploying average equity tickets of approximately $250M per deal. Hit hard cap at $2.6 billion final close and was recognized in Infrastructure Investor's 2025 annual review.",
    sourceUrls: ["https://www.businesswire.com/news/home/20250508377063/en/Northleaf-Hits-Hard-Cap-with-Final-Close-of-its-US%242.6-Billion-Infrastructure-Fund", "https://pitchbook.com/profiles/fund/23058-19F", "https://www.northleafcapital.com/news/northleaf-recognized-infrastructure-investors-2025-annual-review"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.businesswire.com/news/home/20250508377063/en/Northleaf-Hits-Hard-Cap-with-Final-Close-of-its-US%242.6-Billion-Infrastructure-Fund",
  }),
  f("FUND-122", "Northleaf Capital Partners", "Northleaf Essential Infrastructure Fund (NEIF)", "2021", "$800M", 800, "Core", "Evergreen", {
    investmentStrategy: "Open-ended, core infrastructure vehicle targeting mature, mid-market infrastructure assets with contracted and regulated revenue frameworks, emphasizing stable long-term cash flows and lower risk profiles. Provides diversification across geography and subsector, primarily in North America, with a focus on renewable energy and digital infrastructure, while offering enhanced liquidity options relative to traditional closed-end structures.",
    sourceUrls: ["https://www.torys.com/work/2021/11/bf8cb41e-38a3-4b2c-947d-2792fc424d7b"],
    sectors: ["Utilities", "Transportation"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.torys.com/work/2021/11/bf8cb41e-38a3-4b2c-947d-2792fc424d7b",
  }),

  // ── NOVA Infrastructure ───────────────────────────────────
  f("FUND-123", "NOVA Infrastructure", "NOVA Infrastructure Fund II", "2024", "$991M", 991, "Value-Add", "Financial Close", {
    investmentStrategy: "Value-add, middle market infrastructure fund focused exclusively on North America, targeting the environmental services, transportation, energy/energy transition, and communications sectors. Pairs downside protection typical of infrastructure assets with operationally focused value creation — sourcing bespoke opportunities, driving operational improvements, and executing build-and-scale strategies across lower mid-market platform companies. Investments include taking UGE International private and other clean energy infrastructure platforms.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/24080-95F", "https://ugei.com/nova-completes-purchase-of-uge-international/", "https://www.pehub.com/nova-infrastructure-to-take-uge-international-private/"],
    sectors: ["Renewables / Energy Transition", "Utilities"],
    regions: ["North America"],
    strategyUrl: "https://ugei.com/nova-completes-purchase-of-uge-international/",
  }),

  // ── Nuveen (Glennmont Partners) ───────────────────────────
  f("FUND-124", "Nuveen", "Nuveen Clean Energy Strategy IV", "2021", "€1.9B", 2090, "Value-Add", "Financial Close", {
    investmentStrategy: "Core-plus, global clean energy equity strategy investing across onshore wind, offshore wind, solar PV, bioenergy, hydropower, and battery energy storage systems, with assets spanning Europe, North America, and Asia Pacific. Targets operational and ready-to-build assets as well as development-stage platforms, pursuing inflation-linked income streams under an SFDR Article 9 classification. Managed by Nuveen/Glennmont and doubled in size from previous vintage at final close.",
    sourceUrls: ["https://www.infrastructureinvestor.com/the-pipeline-macquaries-fundraising-hopes-usss-thames-regret-stonepeaks-1-2bn-care-entry/", "https://www.nuveen.com/global/insights/news/2024/nuveen-infrastructure-clean-energy-strategy-iv-doubles-in-size-by-final-close-from-previous-vintage"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.nuveen.com/global/insights/news/2024/nuveen-infrastructure-clean-energy-strategy-iv-doubles-in-size-by-final-close-from-previous-vintage",
  }),

  // ── OMERS ─────────────────────────────────────────────────
  f("FUND-125", "OMERS", "OMERS Infrastructure Fund", "1999", "C$40.9B", 29857, "Core", "Evergreen", {
    investmentStrategy: "Direct infrastructure investment program managing approximately C$38.8B across large-scale, core assets in energy, digital, transportation, and government-regulated services in North America, Europe, and Asia Pacific. Favors long-term, active stewardship of majority-controlled assets with stable, defensive cash flows — increasingly oriented around five thematic pillars: energy transition, mobility, connections, community, and natural systems. One of Canada's largest pension plans with extensive direct infrastructure holdings.",
    sourceUrls: ["https://www.omersinfrastructure.com/", "https://www.omersinfrastructure.com/history", "https://www.privateequityinternational.com/institution-profiles/omers-infrastructure.html"],
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["North America", "Europe", "Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.omersinfrastructure.com/",
  }),

  // ── Ontario Teachers' Pension Plan (OTPP) ─────────────────
  f("FUND-126", "Ontario Teachers' Pension Plan (OTPP)", "OTPP Infrastructure & Natural Resources", "2001", "C$47.0B", 34310, "Core", "Evergreen", {
    investmentStrategy: "Targets high-quality, core and core-plus assets that provide critical services to society — spanning airports, container terminals, power generation, electricity and gas transmission and distribution, water and wastewater systems — across Europe, Latin America, North America, and Asia Pacific. Seeks majority or co-controlling stakes with active governance, emphasizes inflation-protected cash flows, and includes a dedicated focus on green assets enabling the low-carbon transition.",
    sourceUrls: ["https://www.otpp.com/en-ca/investments/our-investments/infrastructure-and-natural-resources/", "https://www.infrastructureinvestor.com/otpp-stepping-back-but-not-retreating-from-infra/"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.otpp.com/en-ca/investments/our-investments/infrastructure-and-natural-resources/",
  }),

  // ── Partners Group ────────────────────────────────────────
  f("FUND-127", "Partners Group", "Partners Group Direct Infrastructure IV", "2023", "$8.0B", 8000, "Value-Add", "Financial Close", {
    investmentStrategy: "Value-add, global direct infrastructure fund pursuing Partners Group's transformational investing approach across three thematic 'giga themes': Decarbonization & Sustainability (clean power, low-carbon fuels, water, circular economy), New Living (new mobility, social infrastructure, critical supply chain), and Digitization & Automation (data transmission and storage). Emphasizes platform-building and hands-on operational engagement.",
    sourceUrls: ["https://inforcapital.com/funds/partners-group-direct-infrastructure-iv/", "https://www.infrastructureinvestor.com/the-pipeline-gip-reaches-12-5bn-on-ai-fund-stonepeaks-ir-lead-down-under-kkr-forms-15bn-offshore-jv/"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://inforcapital.com/funds/partners-group-direct-infrastructure-iv/",
  }),
  f("FUND-128", "Partners Group", "Partners Group Next Generation Infrastructure Programs", "2024", "$1.0B", 1000, "Value-Add", "Evergreen", {
    investmentStrategy: "Open-ended, evergreen infrastructure vehicle targeting private wealth and institutional investors, investing 60% in direct infrastructure assets and 30% in infrastructure secondaries alongside Partners Group's flagship closed-end programs. Deploys capital across the same next-generation thematic framework — Decarbonization & Sustainability, New Living, and Digitization & Automation — with monthly subscriptions and quarterly liquidity features.",
    sourceUrls: ["https://www.partnersgroup.com/en/news-and-views/press-releases/corporate-news/detail?news_id=35550643-444b-49c8-9f72-1502c2e822a6"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America", "Global"],
    strategyUrl: "https://www.partnersgroup.com/en/news-and-views/press-releases/corporate-news/detail?news_id=35550643-444b-49c8-9f72-1502c2e822a6",
  }),

  // ── Patria Investments ────────────────────────────────────
  f("FUND-129", "Patria Investments", "Patria Infrastructure Fund V", "2023", "$2.9B", 2900, "Value-Add", "Financial Close", {
    investmentStrategy: "The largest infrastructure fund dedicated to Latin America, targeting equity investments across power and energy, logistics and transportation, digital infrastructure, and environmental services — with Brazil as the primary market and meaningful exposure to Colombia and Chile. Builds platform companies and pursues growth-oriented acquisitions addressing structural bottlenecks in the region, with thematic focus on renewable energy, toll roads, data centers, water desalination, and privatized sanitation. IFC Ontario LP among committed investors.",
    sourceUrls: ["https://www.tipranks.com/news/company-announcements/patria-investments-earnings-call-strong-growth-and-optimism", "https://disclosures.ifc.org/project-detail/SII/49578/pi-fund-v-ontario-l-p", "https://inforcapital.com/funds/patria-infrastructure-fund-v/"],
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition"],
    regions: ["Latin America", "North America"],
    strategyUrl: "https://inforcapital.com/funds/patria-infrastructure-fund-v/",
  }),
  // ── QIC ────────────────────────────────────────────────────
  f("FUND-130", "QIC", "QIC Global Infrastructure Fund II (QGIF II)", "2023", "$2.0B", 2000, "Core-Plus", "Raising", {
    investmentStrategy: "Core-plus infrastructure fund with approximately 70% allocated to Australia's energy transition value chain — encompassing renewables, grid infrastructure, smart metering, and transport decarbonization — and the remainder deployed across OECD markets including the US and Europe. Thematically driven and sector-centric, targeting energy and transport assets in the $50–200M equity check range with binding science-based emissions reduction targets.",
    sourceUrls: ["https://ionanalytics.com/insights/infralogic/qic-cuts-target-for-latest-flagship-infra-fund/", "https://pitchbook.com/profiles/fund/24768-10F", "https://ionanalytics.com/insights/infralogic/qic-nears-first-close-of-usd-3bn-infra-fund/"],
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global", "North America", "Asia-Pacific"],
    strategyUrl: "https://ionanalytics.com/insights/infralogic/qic-cuts-target-for-latest-flagship-infra-fund/",
  }),
  f("FUND-131", "QIC", "QIC Infrastructure Portfolio (QIP)", "N/A", "A$2.0B", 1320, "Core", "Evergreen", {
    investmentStrategy: "Flagship balance-sheet infrastructure portfolio managing over A$41B across approximately 21 direct assets in five OECD countries — spanning transport, energy and utilities, and social/PPP sectors — including Brussels Airport, Port of Melbourne, district energy platform CenTrio, and Tilt Renewables. Pursues a thematic, sector-centric approach emphasizing energy transition, decarbonization, and distributed infrastructure.",
    sourceUrls: ["https://live.peievents.com/infrastructure-investor-australia-forum/speakers/peter-https-wwwaberdeeninvestmentscom-en-kr-investor", "https://www.qic.com/News-and-Insights/CenTrio-Accelerating-the-US-energy-transition-with-costeffective-and-sustainable-solutions"],
    sectors: ["Utilities", "Renewables / Energy Transition"],
    regions: ["North America", "Asia-Pacific"],
    structure: "Open-End",
    strategyUrl: "https://www.qic.com/News-and-Insights/CenTrio-Accelerating-the-US-energy-transition-with-costeffective-and-sustainable-solutions",
  }),

  // ── Quinbrook Infrastructure Partners ─────────────────────
  f("FUND-132", "Quinbrook Infrastructure Partners", "Quinbrook Net Zero Power Fund", "2021", "$3.0B", 3000, "Value-Add", "Financial Close", {
    investmentStrategy: "Value-add energy transition fund pursuing a multi-thematic strategy spanning large-scale solar and battery storage, sustainable infrastructure for hyperscale data center customers, renewable fuels production, synchronous condensers for grid stability, and contracted battery storage — deployed across the US, UK, and Australia. Combines new asset creation with platform-building, targeting higher returns than traditional core renewables by moving early into prospective sub-sectors. Exceeded its $3 billion target, with REST committing A$1 billion.",
    sourceUrls: ["https://www.quinbrook.com/news-insights/quinbrook-exceeds-target-for-net-zero-power-strategy-raising-usd-3-billion-in-capital-commitments/", "https://democracy.islington.gov.uk/documents/s42931/Appendix%201-%20Apex%20-%20Islington%20Q2%202025.pdf", "https://www.infrastructureinvestor.com/rest-commits-a1bn-to-quinbrook-infrastructure-partners/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Asia-Pacific"],
    strategyUrl: "https://www.quinbrook.com/news-insights/quinbrook-exceeds-target-for-net-zero-power-strategy-raising-usd-3-billion-in-capital-commitments/",
  }),

  // ── Ridgewood Infrastructure ──────────────────────────────
  f("FUND-133", "Ridgewood Infrastructure", "Ridgewood Water & Strategic Infrastructure Fund II", "2022", "$1.2B", 1200, "Value-Add", "Financial Close", {
    investmentStrategy: "Lower middle market, US-focused infrastructure fund concentrating on essential infrastructure businesses in water, utilities, energy/renewables, transportation, and communications. Emphasizes operational value creation — scaling, professionalizing, and enhancing the strategic positioning of portfolio companies — with a particular strength in water public-private partnerships and large-scale concession agreements through a buy-and-build approach. Closed in January 2025, significantly surpassing its target.",
    sourceUrls: ["https://ridgewoodinfrastructure.com/ridgewood-infrastructure-announced-1-2-billion-final-close-for-fund-ii-significantly-surpassing-its-target/", "https://ionanalytics.com/insights/infralogic/ridgewood-infrastructure-fund-ii-surpassed-target/"],
    sectors: ["Water", "Utilities", "Waste / Environmental Services"],
    regions: ["North America"],
    strategyUrl: "https://ridgewoodinfrastructure.com/ridgewood-infrastructure-announced-1-2-billion-final-close-for-fund-ii-significantly-surpassing-its-target/",
  }),

  // ── Schroders Capital ─────────────────────────────────────
  f("FUND-134", "Schroders Capital", "Schroders Capital Semi-Liquid Global Energy Infrastructure", "2023", "$281.3M", 281, "Value-Add", "Evergreen", {
    investmentStrategy: "SFDR Article 9, impact-driven open-ended fund targeting net returns above 10% per annum by investing in a globally diversified portfolio of renewable and energy transition-aligned infrastructure assets across wind, solar, battery storage, clean hydrogen, district heating, power grids, and charging infrastructure. Managed by Schroders Greencoat with a semi-liquid structure offering monthly subscriptions and quarterly redemptions.",
    sourceUrls: ["https://www.schroders.com/en-ch/ch/professional/fund-centre/?language=en&location=ch&channel=professional&clientId=schdr&clientVersion=v1&externalId=SCHDR_F00001I3F2&r=%2Ffund%2FSCHDR_F00001I3F2%2F&fundName=Schroders-Capital-Semi-Liquid-Global-Energy-Infrastructure-E-Accumulation-USD", "https://www.schroders.com/en-gb/uk/intermediary/funds-and-strategies/schroders-capital-semi-liquid-global-energy-infrastructure/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global", "North America", "Europe"],
    structure: "Open-End",
    strategyUrl: "https://www.schroders.com/en-gb/uk/intermediary/funds-and-strategies/schroders-capital-semi-liquid-global-energy-infrastructure/",
  }),

  // ── Schroders Greencoat ───────────────────────────────────
  f("FUND-135", "Schroders Greencoat", "Schroders Greencoat Global Renewables+ LTAF", "2024", "£450M", 585, "Core-Plus", "Evergreen", {
    investmentStrategy: "UK's first Long-Term Asset Fund (LTAF) dedicated exclusively to renewable energy and energy transition infrastructure, investing in wind, solar, green hydrogen, district heating, and energy storage assets across the UK, US, continental Europe, and other OECD countries. Managed by Schroders Greencoat, spanning operational assets through development-stage platforms, structured for UK DC pension funds seeking inflation-linked, long-dated income. WTW Lifesight is among strategic investors.",
    sourceUrls: ["https://www.schroders.com/en-gb/uk/institutional/funds-and-strategies/renewables-plus/", "https://www.wtwco.com/en-gb/news/2025/08/lifesight-announces-strategic-investment-in-schroders-greencoats-renewables-ltaf", "https://www.schroders.com/en-gb/uk/institutional/funds-and-strategies/investing-in-ltafs/"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe"],
    structure: "Open-End",
    strategyUrl: "https://www.schroders.com/en-gb/uk/institutional/funds-and-strategies/renewables-plus/",
  }),

  // ── Stonepeak ─────────────────────────────────────────────
  f("FUND-136", "Stonepeak", "Stonepeak Infrastructure Fund V", "2023", "$15.0B", 15000, "Core-Plus", "Raising", {
    investmentStrategy: "Large-scale, core-plus infrastructure fund investing thematically across digital infrastructure (data centers, fiber, towers, broadband), energy and energy transition (renewables, battery storage, bridge fuels), transport and logistics (cold storage, intermodal, aviation), and social infrastructure — primarily in North America. Emphasizes durable essential-service assets with long-term tailwinds and active operational engagement. Raised $7.29 billion from 98 investors, with notable commitments including $350M from Oregon State Treasury and $300M from NY State Common. Investments include the Ørsted US wind portfolio (957 MW), Repsol solar/storage (777 MW in TX/NM), Louisiana LNG (40% stake), Castrol (65% stake at $10.1B EV), and Cologix.",
    sourceUrls: ["https://www.infrastructureinvestor.com/wsib-commits-300m-to-infrastructure/"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Midstream / Energy", "Transportation"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/wsib-commits-300m-to-infrastructure/",
  }),
  f("FUND-137", "Stonepeak", "Stonepeak Global Renewables Fund II", "2024", "$5.0B", 5000, "Value-Add", "Raising", {
    investmentStrategy: "Value-add/opportunistic renewables fund targeting development-stage and newbuild solar and wind assets in developed OECD markets, particularly North America and Asia. Also pursues opportunistic energy transition opportunities across renewable generation, low-carbon fuels, emerging technologies, and hard-to-abate sector transformation, leveraging Stonepeak's approximately 13 GW of renewables capacity. CalSTRS anchored the transition pool with a $450M commitment, and the fund is doubling its maiden effort target.",
    sourceUrls: ["https://www.privateequity.fund/post/stonepeak-aims-for-5-billion-in-second-renewable-fund-doubling-maiden-effort", "https://www.infrastructureinvestor.com/calstrs-anchors-stonepeak-transition-pool-with-450m-exclusive/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Asia-Pacific"],
    strategyUrl: "https://www.privateequity.fund/post/stonepeak-aims-for-5-billion-in-second-renewable-fund-doubling-maiden-effort",
  }),
  f("FUND-138", "Stonepeak", "Stonepeak Opportunities Fund", "2022", "$3.15B", 3150, "Value-Add", "Financial Close", {
    investmentStrategy: "Middle market, core-plus to value-add infrastructure fund targeting control investments and structured capital solutions across communications, transport and logistics, and energy transition in North America and Europe. Differentiates through off-the-run deal sourcing, bespoke structuring in complex situations, and operational expertise.",
    sourceUrls: ["https://stonepeak.com/news/stonepeak-closes-opportunities-fund-with-3-15-billion-of-commitments"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America"],
    strategies: ["Core-Plus", "Value-Add"],
    strategyUrl: "https://stonepeak.com/news/stonepeak-closes-opportunities-fund-with-3-15-billion-of-commitments",
  }),
  f("FUND-139", "Stonepeak", "Stonepeak Opportunities Fund II", "2024", "$4.0B", 4000, "Value-Add", "Raising", {
    investmentStrategy: "Successor to Stonepeak's middle market opportunities vehicle, continuing the value-add strategy of targeting mid-market infrastructure across digital infrastructure, transport and logistics, and energy transition in North America and Europe. Applies Stonepeak's thematic sourcing and complex structuring capabilities to control and structured capital deals where operational improvement drives returns above the core spectrum. Louisiana Teachers committed $50M and Seattle City Pension also committed.",
    sourceUrls: ["https://irei.com/news/louisiana-teachers-invests-50m-in-stonepeak-opportunities-fund-ii/", "https://www.infrastructureinvestor.com/seattle-city-pension-wants-more-outperforming-infra-commits-to-stonepeak-fund/", "https://www.seattle.gov/documents/Departments/Retirement/Board/Minutes%2C%20Investment%20Committee/IC_Minutes_2026_01.pdf"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://irei.com/news/louisiana-teachers-invests-50m-in-stonepeak-opportunities-fund-ii/",
  }),
  f("FUND-140", "Stonepeak", "Stonepeak Core Fund", "2022", "$5.0B", 5000, "Core", "Evergreen", {
    investmentStrategy: "Open-ended, perpetual infrastructure vehicle targeting core assets across developed markets globally — including North America, Europe, Australia, and New Zealand — with a focus on cash yield and long-term, inflation-linked revenues. Invests across digital infrastructure (data centers, fiber, towers), energy and energy transition, and transport and logistics through both brownfield and select greenfield opportunities.",
    sourceUrls: ["https://inforcapital.com/funds/stonepeak-core-fund/"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure"],
    regions: ["North America", "Global"],
    structure: "Open-End",
    strategyUrl: "https://inforcapital.com/funds/stonepeak-core-fund/",
  }),

  // ── Swiss Life Asset Managers ─────────────────────────────
  f("FUND-141", "Swiss Life Asset Managers", "Swiss Life Funds (LUX) Global Infrastructure Opportunities IV", "2024", "€2.5B", 2750, "Core", "Raising", {
    investmentStrategy: "Core/core-plus, closed-end fund targeting long-term direct control investments in mid-market infrastructure companies across OECD countries, primarily Europe and North America, in transportation, renewable energy, utilities, and digital infrastructure. Selects assets for mature, low-volatility cash flows with growth potential, favoring regulated assets, concession contracts, PPPs, and index-linked revenues under an SFDR Article 8 classification.",
    sourceUrls: ["https://uk.swisslife-am.com/content/dam/slamuk/news/media-release-gio-iv"],
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Europe", "North America"],
    strategies: ["Core", "Core-Plus"],
    strategyUrl: "https://uk.swisslife-am.com/content/dam/slamuk/news/media-release-gio-iv",
  }),
  f("FUND-142", "Swiss Life Asset Managers", "Swiss Life Funds (LUX) ESG Global Infrastructure Opportunities Growth II", "2023", "€750M", 825, "Value-Add", "Financial Close", {
    investmentStrategy: "Value-add infrastructure fund targeting control and co-control investments in small-to-mid-market European and North American assets across digitalization, decarbonization, and urban mobility themes. Exploits secular mega-trends including the circular economy, aging populations, and new logistics chains — with active investments in telecom infrastructure, diagnostic imaging platforms, and green energy — under an SFDR Article 8 framework.",
    sourceUrls: ["https://www.infrastructureinvestor.com/swiss-life-am-nears-final-close-for-value-add-and-renewables-funds-exclusive/", "https://www.swisslife-am.com/en/home/media/news/switzerland/institutional/2023/0502-infrastructure-fund.html"],
    sectors: ["Renewables / Energy Transition", "Utilities"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/swiss-life-am-nears-final-close-for-value-add-and-renewables-funds-exclusive/",
  }),
  f("FUND-143", "Swiss Life Asset Managers", "Fontavis ESG Renewable Infrastructure Fund II", "2022", "€750M", 825, "Core-Plus", "Financial Close", {
    investmentStrategy: "Global renewable energy infrastructure fund targeting investments in unlisted wind, solar, hydro, biomass, storage, and renewable fuels assets concentrated in OECD countries across Europe, North America, Asia Pacific, and beyond. Managed by Swiss Life Asset Managers' dedicated Fontavis renewables team, building diversified clean energy portfolios through long-standing relationships with project developers, classified as SFDR Article 8.",
    sourceUrls: ["https://pe-insights.com/swiss-life-asset-managers-launches-second-renewable-energy-fund-with-e750m-target/"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://pe-insights.com/swiss-life-asset-managers-launches-second-renewable-energy-fund-with-e750m-target/",
  }),
  // ── Tallvine Partners ──────────────────────────────────────
  f("FUND-144", "Tallvine Partners", "Tallvine Middle Market Infrastructure Fund I", "2024", "$1.5B", 1500, "Value-Add", "Raising", {
    investmentStrategy: "Value-add debut fund targeting operationally geared, middle market infrastructure in North America across energy and utilities, transportation and logistics, and communications. Founded by former I Squared Capital executives, Tallvine targets smaller, less competitive transactions with attractive entry multiples, building platforms in small-craft aviation (Velocity FBO), marine services (Donjon Marine), and data centers (TRG Datacenters).",
    sourceUrls: ["https://www.themiddlemarket.com/news-analysis/tallvine-raising-1-5b-for-debut-fund-as-infra-spinouts-gather-pace", "https://pitchbook.com/profiles/fund/25865-92F", "https://www.formds.com/issuers/tallvine-middle-market-infrastructure-fund-i-lp"],
    sectors: ["Utilities", "Digital Infrastructure", "Transportation"],
    regions: ["North America"],
    strategyUrl: "https://www.themiddlemarket.com/news-analysis/tallvine-raising-1-5b-for-debut-fund-as-infra-spinouts-gather-pace",
  }),

  // ── Tiger Infrastructure Partners ─────────────────────────
  f("FUND-145", "Tiger Infrastructure Partners", "Tiger Infrastructure Partners Fund IV", "2023", "$781.6M", 782, "Value-Add", "Financial Close", {
    investmentStrategy: "Value-add, middle market infrastructure fund writing $75–200M equity checks in digital infrastructure, energy transition, and transportation assets primarily in North America and Europe, seeking both majority control and minority stakes with aligned partners. Applies a private equity operational skill-set to develop, scale, and professionalize infrastructure businesses in a segment increasingly underserved by larger managers.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/24513-04F", "https://radientanalytics.com/firm/adv/tiger-infrastructure-partners-lp-161551"],
    sectors: ["Transportation", "Waste / Environmental Services", "Digital Infrastructure"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://pitchbook.com/profiles/fund/24513-04F",
  }),

  // ── TPG ───────────────────────────────────────────────────
  f("FUND-146", "TPG", "TPG Rise Climate II", "2023", "$8.0B", 8000, "Value-Add", "Raising", {
    investmentStrategy: "Global climate-focused private equity fund investing across growth equity and value-add deal archetypes in clean energy, decarbonized transport, greening industrials, sustainable fuels, and carbon management — concentrated approximately 70% in OECD markets with opportunistic non-OECD exposure. Pursues majority control deals, carve-outs, and growth equity to scale commercially viable businesses that generate measurable greenhouse gas reductions. Passed $6 billion in commitments, with Alterra committing US$1.5 billion including for the Global South Initiative.",
    sourceUrls: ["https://www.newprivatemarkets.com/in-brief-tpg-passes-6bn-for-rise-climate-ii/", "https://www.tpg.com/news-and-insights/alterra-commits-us1-5-billion-to-tpg-rise-climates-us10-billion-next-generation-private-equity-funds-including-new-global-south-initiative-and-tpg-rise-climate-ii", "https://www.buyoutsinsider.com/tpg-sets-8bn-target-10bn-cap-for-sophomore-climate-fund/"],
    sectors: ["Renewables / Energy Transition", "Power Generation", "Transportation"],
    regions: ["Global", "North America"],
    strategyUrl: "https://www.newprivatemarkets.com/in-brief-tpg-passes-6bn-for-rise-climate-ii/",
  }),
  f("FUND-147", "TPG", "TPG Rise Climate Transition Infrastructure (TRC TI)", "2023", "$2.0B+", 2000, "Value-Add", "Financial Close", {
    investmentStrategy: "Infrastructure value-add fund focused on energy transition assets — including renewable energy platforms requiring additional growth capital, green mobility fleets (buses, rail, trucks), and waste/environmental services — across developed markets globally. Sits within TPG Rise Climate's multi-capital-stack approach, scaling platforms that reduce emissions in hard-to-decarbonize sectors.",
    sourceUrls: ["https://dallasinnovates.com/tpg-appoints-partner-head-of-infrastructure-for-tpg-rise-climate/", "https://www.buyoutsinsider.com/tpg-sets-8bn-target-10bn-cap-for-sophomore-climate-fund/", "https://www.sec.gov/Archives/edgar/data/1880661/000188066125000014/tpg-20241231.htm", "https://www.paulhastings.com/news/paul-hastings-acts-as-counsel-on-esg-advisory-work-for-tpg-rise-climate-transition-infrastructure"],
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["Global", "North America"],
    strategyUrl: "https://dallasinnovates.com/tpg-appoints-partner-head-of-infrastructure-for-tpg-rise-climate/",
  }),
  f("FUND-148", "TPG", "TPG Peppertree Capital Fund X", "2023", "$1.5B", 1500, "Value-Add", "Raising", {
    investmentStrategy: "Growth equity fund investing in wireless communication towers, spectrum licenses, fiber networks, distributed antenna systems, small cells, and adjacent digital assets across North America and key international markets. Founded on the conviction that surging global data demand will persistently outstrip wireless network capacity, with flexible check sizes targeting tower developers and communication infrastructure operators. TPG acquired Peppertree Capital to expand its digital infrastructure capabilities.",
    sourceUrls: ["https://www.alternativeswatch.com/2025/05/06/tpg-acquisition-digital-infrastructure-investment-firm-peppertree/"],
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America"],
    strategyUrl: "https://www.alternativeswatch.com/2025/05/06/tpg-acquisition-digital-infrastructure-investment-firm-peppertree/",
  }),

  // ── True Green Capital Management ─────────────────────────
  f("FUND-149", "True Green Capital Management", "True Green Capital Fund IV", "2022", "$660.9M", 661, "Core-Plus", "Financial Close", {
    investmentStrategy: "Renewable energy infrastructure fund focused on sub-utility scale, distributed commercial and industrial solar, battery storage, and microgrids in the US, UK, and EU. Combines direct operational capabilities in construction and asset management with long-term, fixed-price PPAs with creditworthy counterparties, targeting approximately 18 US states and select European markets. Exceeded its $500 million target to close at over $650 million.",
    sourceUrls: ["https://www.prnewswire.com/news-releases/true-green-capital-management-closes-fourth-fund-at-over-650-million-exceeding-its-500-million-target-301561227.html"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.prnewswire.com/news-releases/true-green-capital-management-closes-fourth-fund-at-over-650-million-exceeding-its-500-million-target-301561227.html",
  }),
  f("FUND-150", "True Green Capital Management", "True Green Capital Fund V", "2025", "$1.0B", 1000, "Core-Plus", "Raising", {
    investmentStrategy: "Continuation of True Green Capital's distributed solar and clean energy strategy — targeting commercial and industrial solar, battery storage, and community solar across the US, UK, and Europe — with expanded platform ambitions including clean energy retail (gen-tailer) and strategic equipment partnerships. Extends the firm's presence as a specialized operator-investor in the sub-utility scale renewable power segment. VRS committed $100M.",
    sourceUrls: ["https://realassets.ipe.com/jon-peterson/3272.contributor?page=12", "https://www.infrastructureinvestor.com/vrs-commits-100m-to-true-green-capital/"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/vrs-commits-100m-to-true-green-capital/",
  }),

  // ── Vauban Infrastructure Partners ────────────────────────
  f("FUND-151", "Vauban Infrastructure Partners", "Core Infrastructure Fund IV (CIF IV)", "2021", "€2.2B", 2420, "Core", "Financial Close", {
    investmentStrategy: "Core infrastructure fund targeting predominantly brownfield, mid-market assets in Europe across mobility, energy transition, social infrastructure, and digital infrastructure, with an expanded geographic footprint into North America. Pursues long-term, yield-driven control investments in essential infrastructure that delivers critical services — from biomethane production and district energy to energy services and transport concessions — with emphasis on sustainable value creation. Acquired a leading US district energy platform.",
    sourceUrls: ["https://vauban-ip.com/en/about-us", "https://www.prnewswire.com/news-releases/vauban-infrastructure-partners-announces-the-closing-of-the-acquisition-of-a-leading-district-energy-platform-located-in-the-united-states-301552231.html"],
    sectors: ["Utilities", "Transportation", "Social Infrastructure"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.prnewswire.com/news-releases/vauban-infrastructure-partners-announces-the-closing-of-the-acquisition-of-a-leading-district-energy-platform-located-in-the-united-states-301552231.html",
  }),
  f("FUND-152", "Vauban Infrastructure Partners", "Core Infrastructure Fund V (CIF V)", "2025", "€2.75B", 3025, "Core", "Raising", {
    investmentStrategy: "Successor to Vauban's fourth core fund, continuing the firm's brownfield, mid-market European core infrastructure strategy across mobility, energy transition, digital infrastructure, and social sectors, with an updated mandate pursuing strategic expansion into North America. Maintains Vauban's long-term, yield-oriented, control-focused approach to essential infrastructure assets, managed by the same team that has collectively raised over €9B across eight funds. Investcorp SCG recently acquired a stake in the platform.",
    sourceUrls: ["https://www.infrastructureinvestor.com/us-bank-regs-prompt-vauban-to-sell-stake-to-investcorps-scg/"],
    sectors: ["Utilities", "Transportation", "Social Infrastructure"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/us-bank-regs-prompt-vauban-to-sell-stake-to-investcorps-scg/",
  }),

  // ── Vision Ridge Partners ─────────────────────────────────
  f("FUND-153", "Vision Ridge Partners", "Sustainable Asset Fund IV (SAF IV)", "2023", "$2.4B", 2400, "Value-Add", "Financial Close", {
    investmentStrategy: "Value-add sustainable real assets fund targeting 10–14 direct equity investments in energy infrastructure and renewables, transportation, and agriculture/agribusiness — sectors representing over 80% of global greenhouse gas emissions. Seeks a target net IRR of 15–20% by acquiring, actively managing, and building complex sustainable assets (including renewable power, energy storage, water infrastructure, clean mobility platforms, and aquaculture) and positioning them for eventual sale to larger infrastructure buyers.",
    sourceUrls: ["https://www.infrastructureinvestor.com/the-opportunity-set-remains-quite-compelling-says-vision-ridge-ceo-as-saf-iv-closes-on-2-4bn/", "https://inforcapital.com/funds/vision-ridge-partners-sustainable-asset-fund-iv/"],
    sectors: ["Renewables / Energy Transition", "Transportation", "Water"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/the-opportunity-set-remains-quite-compelling-says-vision-ridge-ceo-as-saf-iv-closes-on-2-4bn/",
  }),

  // ── Wafra Inc. ────────────────────────────────────────────
  f("FUND-154", "Wafra Inc.", "Wafra Real Assets & Infrastructure Fund II", "2021", "Undisclosed", null, "Value-Add", "Financial Close", {
    investmentStrategy: "Multi-strategy real assets fund investing across aviation, digital infrastructure, shipping, and renewable energy through both equity and debt instruments in North America and globally. Embraces deal complexity and uses bespoke structuring — often alongside sovereign and pension co-investors — to enhance risk-adjusted returns across utility-scale solar and storage, general aviation FBOs, and intermodal logistics. Part of Wafra's $28 billion platform, with investments including telecom and long-haul fiber networks.",
    sourceUrls: ["https://docs.fcc.gov/public/attachments/DA-23-949A1.pdf", "https://www.prnewswire.com/news-releases/wafra-completes-minority-investment-in-ardian-302619350.html", "https://www.wafra.com/our-strategies/real-assets/"],
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America"],
    strategyUrl: "https://www.wafra.com/our-strategies/real-assets/",
  }),
  f("FUND-155", "Wafra Inc.", "Wafra Real Assets & Infrastructure Platform (SMA)", "2014", "$3.0B", 3000, "Value-Add", "Evergreen", {
    investmentStrategy: "Separately managed account accessing Wafra's multi-sector opportunity set — spanning aviation, digital infrastructure, shipping, and renewable energy — on a customized basis for institutional LPs. Draws on Wafra's network of strategic partnerships with leading alternative managers (including stakes in Ardian) and its ability to execute at speed and scale as both lead investor and co-investor alongside sovereign and pension fund partners.",
    sourceUrls: ["https://www.westportalpha.com/", "https://www.wafra.com/our-strategies/real-assets/"],
    sectors: ["Digital Infrastructure", "Communications", "Utilities"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.wafra.com/our-strategies/real-assets/",
  }),

  // ── Axium Infrastructure ────────────────────────────────
  f("FUND-157", "Axium Infrastructure", "Axium Infrastructure Canada II L.P.", "2012", "C$891M", 660, "Core", "Evergreen", {
    investmentStrategy: "Targets core Canadian infrastructure under long-term contract, regulated frameworks, or concession-based structures, targeting a net IRR of 7–9% with 3–5% cash yield. Formerly Fiera Axium Infrastructure Canada II L.P., this fund is part of the broader AxInfra NA II platform alongside AxInfra US II. Sectors include renewable power (wind and solar), social PPP assets (correctional facilities, long-term care homes), and regulated transportation, with strict single-asset concentration limits.",
    sourceUrls: ["https://www.axiuminfra.com/wp-content/uploads/2016/12/EN_Recurrent-Fiera-Axium-news-release-EN.pdf", "https://www.axiuminfra.com/wp-content/uploads/2024/12/Axium_News-Release_Quality-and-PDN-Wind-Projects-closing_Vf.pdf"],
    sectors: ["Renewables / Energy Transition", "Social Infrastructure", "Transportation", "Utilities"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.axiuminfra.com/wp-content/uploads/2024/12/Axium_News-Release_Quality-and-PDN-Wind-Projects-closing_Vf.pdf",
  }),
  f("FUND-158", "Axium Infrastructure", "AxInfra US L.P.", "2013", "Undisclosed", null, "Core", "Evergreen", {
    investmentStrategy: "Axium's original US infrastructure fund (formerly Fiera Axium Infrastructure US L.P.), targeting mid-market core US infrastructure assets across renewable energy (wind, solar), network utilities, electric transmission, and essential transportation. Operates as an open-ended evergreen vehicle with no fixed term, co-investing alongside operating partners and targeting net returns of 7–9% with 3–5% current cash yield.",
    sourceUrls: ["https://www.axiuminfra.com/wp-content/uploads/2016/12/EN_FAI-EDPR-Wheat-Field-News-Release-2013-09-10-EN.pdf", "https://www.axiuminfra.com/wp-content/uploads/2024/12/Axium_News-Release_Quality-and-PDN-Wind-Projects-closing_Vf.pdf"],
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.axiuminfra.com/wp-content/uploads/2016/12/EN_FAI-EDPR-Wheat-Field-News-Release-2013-09-10-EN.pdf",
  }),
  f("FUND-161", "Axium Infrastructure", "AxInfra US II L.P.", "2017", "$7.1B", 7100, "Core", "Evergreen", {
    investmentStrategy: "Primary US-denominated vehicle within the $7.1B AxInfra NA II platform alongside Axium Infrastructure Canada II L.P., investing in core North American infrastructure assets (96% US, 4% Canada) with a diversified portfolio of 250+ individual assets across renewable power (39%), network utilities (34%), transportation (13%), conventional power (9%), and social infrastructure (5%). Targets net IRR of 7–9% with 3–5% cash yield, with concentration limits of no more than 20% of commitments or $75M per single asset. Notable LP commitments include Kansas PERS ($100M) and Connecticut CRPTF ($150M).",
    sourceUrls: ["https://www.infrastructureinvestor.com/axium-infrastructure-outlines-plan-for-first-co-investment-fund/", "https://www.sec.gov/Archives/edgar/data/1716753/000171675320000001/xslFormDX01/primary_doc.xml"],
    sectors: ["Renewables / Energy Transition", "Utilities", "Transportation", "Social Infrastructure", "Power Generation"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.infrastructureinvestor.com/axium-infrastructure-outlines-plan-for-first-co-investment-fund/",
  }),
  f("FUND-164", "Axium Infrastructure", "AxInfra US III L.P.", "2021", "$114M", 114, "Core", "Financial Close", {
    investmentStrategy: "Third-generation US open-ended core infrastructure fund registered with the SEC in 2021, channeling LP capital into the master US infrastructure portfolio (AIUS LP) for exposure to 250+ operational North American infrastructure assets. Targets core US infrastructure across renewable energy, network utilities, transportation, and social infrastructure, with 100% of capital deployed into the US country-level fund. Investments are made in operational assets under long-term contracts with creditworthy counterparties, targeting net IRR of 7–9% with a 3–5% cash yield component. Article 8 SFDR-compliant.",
    sourceUrls: ["https://www.sec.gov/Archives/edgar/data/1884031/000188403121000001/0001884031-21-000001-index.html", "https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BDEBFA23A-6D6A-4C97-B954-059077F511D1%7D"],
    sectors: ["Renewables / Energy Transition", "Utilities", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.sec.gov/Archives/edgar/data/1884031/000188403121000001/0001884031-21-000001-index.html",
  }),
  f("FUND-166", "Axium Infrastructure", "Axium Infrastructure NA IV L.P.", "2016", "$1.35B", 1350, "Core", "Evergreen", {
    investmentStrategy: "Multi-LP pooled vehicle managed by Axium Infrastructure Inc. from Montreal, investing in core North American energy, transportation, and social infrastructure assets, emphasizing operational brownfield assets under long-term contract, regulated frameworks, or concession structures. Open-ended evergreen vehicle with no fixed term, Article 8 SFDR-compliant, with investments in energy generation, transmission, and essential services across the US and Canada.",
    sourceUrls: ["https://www.sec.gov/Archives/edgar/data/1671710/000167171019000001/xslFormDX01/primary_doc.xml", "https://www.axiuminfra.com/wp-content/uploads/2023/06/Principal-Adverse-Impact-Statement-EN.pdf"],
    sectors: ["Renewables / Energy Transition", "Utilities", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.axiuminfra.com/wp-content/uploads/2023/06/Principal-Adverse-Impact-Statement-EN.pdf",
  }),
];

// ─── Build-Time Data Validation ─────────────────────────────

function validateFundData(): void {
  const errors: string[] = [];
  const idSet = new Set<string>();
  const EXPECTED_COUNT = 160;

  for (const fund of funds) {
    // Unique IDs
    if (idSet.has(fund.id)) errors.push(`Duplicate ID: ${fund.id}`);
    idSet.add(fund.id);

    // Required fields
    if (!fund.managerName) errors.push(`${fund.id}: missing managerName`);
    if (!fund.fundName) errors.push(`${fund.id}: missing fundName`);
    if (!fund.vintage) errors.push(`${fund.id}: missing vintage`);
    if (fund.strategies.length === 0) errors.push(`${fund.id}: no strategies`);

    // Source URLs present
    if (fund.sourceUrls.length === 0) errors.push(`${fund.id} (${fund.fundName}): no sourceUrls`);

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

  if (errors.length > 0) {
    console.error(`Fund data validation failed (${errors.length} issue(s)):\n${errors.join("\n")}`);
  }
}

validateFundData();
