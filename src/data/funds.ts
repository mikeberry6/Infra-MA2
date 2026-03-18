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
  overrides?: Partial<Pick<Fund, "description" | "investmentStrategy" | "sourceUrls" | "sectors" | "regions" | "strategies" | "structure" | "ticker" | "strategyUrl">>,
): Fund {
  return {
    id,
    managerName,
    fundName,
    ticker: overrides?.ticker ?? null,
    description: overrides?.description ?? "",
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
    portfolioCompanies: PORTFOLIO_DATA[id] ?? [],
    strategyUrl: overrides?.strategyUrl ?? "",
  };
}

// ─── Fund Manifest (155 funds) ──────────────────────────────
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
// ─── End Manifest ──────────────────────────────────────────

export const funds: Fund[] = [
  // ── 3i Group ──────────────────────────────────────────────
  f("FUND-001", "3i Group", "3i Infrastructure plc", "2007", "£3.8B", 4940, "Core-Plus", "Evergreen", {
    description: "London-listed evergreen investment vehicle with permanent capital, directly acquiring core-plus infrastructure equity assets. The portfolio spans digital infrastructure, transport, utilities, and energy transition across Europe and North America, including assets such as Tampnet (offshore telecoms), Belfast City Airport, and Infinis (landfill gas-to-energy).",
    investmentStrategy: "London-listed, FTSE 250 evergreen investment company targeting mid-market core-plus infrastructure equity in utilities, transportation, digital (towers, data centres, fibre), and social infrastructure. Seeks controlling or significant minority positions in businesses benefiting from megatrends such as the energy transition and digitalisation, primarily across the UK and Western Europe, with a target total return of 8–10% per annum.",
    sourceUrls: ["https://www.3i.com/infrastructure/our-funds/", "https://www.3i-infrastructure.com/about-us/investment-manager/investment-policy/"],
    sectors: ["Digital Infrastructure", "Transportation", "Utilities", "Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Europe", "North America", "Asia-Pacific"],
    structure: "Listed / Evergreen",
    ticker: "3IN.L",
    strategyUrl: "https://www.3i-infrastructure.com/about-us/investment-manager/investment-policy/",
  }),
  f("FUND-002", "3i Group", "3i North American Infrastructure Fund", "2022", "$739M", 739, "Core-Plus", "Deploying", {
    description: "Traditional closed-end fund actively making direct infrastructure equity investments exclusively in the North American market. Portfolio includes Regional Rail, Smarte Carte (airport services), and waste management platforms Amwaste and EC Waste.",
    investmentStrategy: "Closed-end mid-market core-plus fund targeting equity investments exclusively in North American infrastructure across transportation, waste management, and essential services. Applies an active, theme-driven asset management approach — identifying megatrends such as the energy transition, digitalisation, and demographic change — and pursues bolt-on acquisitions alongside direct platform investments.",
    sourceUrls: ["https://www.3i.com/media/fkcntktr/infrastructure_business_review.pdf", "https://www.3i.com/media/news/2025/3i-announces-sale-of-its-investment-in-shared-tower/"],
    sectors: ["Digital Infrastructure", "Transportation", "Waste / Environmental Services", "Communications"],
    regions: ["North America"],
    strategyUrl: "https://www.3i.com/media/fkcntktr/infrastructure_business_review.pdf",
  }),

  // ── Abu Dhabi Investment Authority (ADIA) ─────────────────
  f("FUND-003", "Abu Dhabi Investment Authority (ADIA)", "ADIA Direct Infrastructure", "2007", "$47.6B", 47600, "Core", "Evergreen", {
    description: "Massive evergreen captive platform with the mandate and capital to acquire direct infrastructure equity globally, including North America. ADIA's infrastructure portfolio includes stakes in NSW Ports (Australia), Gatwick Airport, and major utility and transport assets across OECD markets.",
    investmentStrategy: "Sovereign wealth vehicle deploying long-term direct capital into infrastructure globally across four core verticals: transportation, digital infrastructure, utilities, and energy (including a growing renewable energy portfolio). Typically takes minority equity stakes alongside experienced partners, with a focus on developed markets complemented by increasing exposure to high-growth emerging economies.",
    sourceUrls: ["https://www.adia.ae/en/investments/infrastructure", "https://www.infrastructureinvestor.com/global-investor-ranking/", "https://www.nswports.com.au/about-nsw-ports", "https://www.adia.ae/en/investments"],
    sectors: ["Transportation", "Utilities", "Power Generation", "Digital Infrastructure"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.adia.ae/en/investments/infrastructure",
  }),

  // ── Acadia Infrastructure Capital ─────────────────────────
  f("FUND-004", "Acadia Infrastructure Capital", "Climate and Communities Investment Coalition", "2024", "$9.0B", 9000, "Value-Add", "Deploying", {
    description: "Permanent captive platform anchored by Microsoft corporate capital, deploying equity directly into new U.S. renewable energy developments in disadvantaged communities. Targets solar, battery storage, and community energy projects.",
    investmentStrategy: "US-focused investment coalition anchored by Microsoft, targeting the development of 5 GW of mid-market renewable energy projects — beginning with utility-scale solar — that deliver both clean energy procurement and measurable community and environmental justice benefits. Deploys structured and tax equity instruments alongside traditional equity into projects supported by the Sustain Our Future Foundation.",
    sourceUrls: ["https://carboncredits.com/microsofts-9-billion-power-move-revolutionizing-u-s-clean-energy-and-communities/", "https://www.sustainourfuture.org/news-updates"],
    sectors: ["Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://carboncredits.com/microsofts-9-billion-power-move-revolutionizing-u-s-clean-energy-and-communities/",
  }),
  f("FUND-005", "Acadia Infrastructure Capital", "Acadia Infrastructure Capital LP", "2023", "$107.4M", 107, "Value-Add", "Deploying", {
    description: "Active RIA management platform structured to deploy bespoke direct infrastructure equity in North America. Investments include JVR Energy Park, Peregrine Energy Storage, Pivot Energy (community solar), and Stillhouse Solar Project.",
    investmentStrategy: "US-focused specialist manager deploying tax credits, structured equity, and hybrid capital into mid-market clean energy and decarbonization infrastructure projects across North America, with an emphasis on proven energy transition assets including renewable generation and storage. Applies bespoke product structuring — including alternatives to traditional IRA-driven tax equity — to serve projects underserved by conventional capital.",
    sourceUrls: ["https://radientanalytics.com/firm/adv/acadia-infrastructure-capital-lp-326032", "https://www.acadiainfrastructure.com/team", "https://www.acadiainfrastructure.com/about"],
    sectors: ["Renewables / Energy Transition", "Utilities"],
    regions: ["North America"],
    strategyUrl: "https://www.acadiainfrastructure.com/about",
  }),

  // ── Amber Infrastructure Group ────────────────────────────
  f("FUND-006", "Amber Infrastructure Group", "International Public Partnerships (INPP)", "2006", "£2.6B", 3380, "Core", "Evergreen", {
    description: "Active evergreen, publicly listed investment company managed by Amber, acquiring long-term core infrastructure equity across OECD markets including North America. The portfolio spans PPP/PFI social infrastructure, regulated utilities, and transmission assets.",
    investmentStrategy: "London Stock Exchange-listed core infrastructure investment company investing in a diversified portfolio of over 140 operational and construction-phase public infrastructure assets across the UK, Australia, Europe, and North America. Targets PPP/PFI projects and public-facing regulated assets — including gas distribution, education, healthcare, digital, transport, and nuclear — generating long-term, availability-based or regulated revenues with high inflation linkage.",
    sourceUrls: ["https://www.internationalpublicpartnerships.com/media/ydhbl4op/inpp-2023-fy-factsheet-vf.pdf", "https://www.edisongroup.com/research/responsible-growing-and-protected/BM-2225/"],
    sectors: ["Social Infrastructure", "Utilities", "Transportation"],
    regions: ["Europe", "North America", "Asia-Pacific"],
    structure: "Listed / Evergreen",
    ticker: "INPP.L",
    strategyUrl: "https://www.internationalpublicpartnerships.com/media/ydhbl4op/inpp-2023-fy-factsheet-vf.pdf",
  }),

  // ── Ancala Partners ───────────────────────────────────────
  f("FUND-007", "Ancala Partners", "Ancala Infrastructure Fund III", "2022", "€1.4B", 1540, "Value-Add", "Deploying", {
    description: "Active 2022-vintage infrastructure equity fund targeting mid-market value-add investments across Europe and North America. Focuses on essential services infrastructure including utilities, digital, and environmental services.",
    investmentStrategy: "Mid-market, core-to-core-plus European infrastructure fund targeting bilateral, off-market acquisitions in essential sectors including renewable energy and the energy transition, transport, utilities, and the circular economy. Emphasises downside protection, inflation linkage, and strong cash yield alongside active asset management to drive sustainable value creation, with a primary geographic focus on Western Europe.",
    sourceUrls: ["https://ancala.com/ancala-announces-final-close-of-third-flagship-infrastructure-fund/", "https://irei.com/news/texas-trs-commits-124m-to-infrastructure-in-august/"],
    sectors: ["Utilities", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://ancala.com/ancala-announces-final-close-of-third-flagship-infrastructure-fund/",
  }),

  // ── Antin Infrastructure Partners ─────────────────────────
  f("FUND-008", "Antin Infrastructure Partners", "Flagship Fund V", "2022", "€10.2B", 11220, "Value-Add", "Deploying", {
    description: "Active mega-cap closed-ended fund with a strict mandate for value-add infrastructure equity acquisitions in Europe and North America. Antin focuses on mid-market assets in digital, energy transition, transport, and social infrastructure sectors.",
    investmentStrategy: "Large-cap infrastructure fund targeting controlling equity stakes in energy and environment, digital infrastructure, transport, and social infrastructure businesses across Europe and North America. Writes cheques of €600 million to over €1 billion per investment and pursues buy-and-build growth strategies, with a significantly expanded North American LP base.",
    sourceUrls: ["https://www.antin-ip.com/media/our-news/antin-infrastructure-partners-closes-flagship-fund-v-above-e10-billion-target"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.antin-ip.com/media/our-news/antin-infrastructure-partners-closes-flagship-fund-v-above-e10-billion-target",
  }),
  f("FUND-009", "Antin Infrastructure Partners", "Mid Cap Fund I", "2021", "€2.2B", 2420, "Value-Add", "Deploying", {
    description: "Active 2021-vintage closed-end fund dedicated to executing value-add infrastructure equity buyouts in the middle market across Europe and North America. Targets digital and environmental infrastructure platforms.",
    investmentStrategy: "Mid-cap fund targeting smaller and mid-sized infrastructure companies across energy and environment, digital/telecom, transport, and social sectors in Europe and North America, with individual investments typically ranging from €50M to €300M. Capitalises on the underserved mid-cap segment of the infrastructure market vacated by larger managers.",
    sourceUrls: ["https://www.goodwinlaw.com/en/news-and-events/news/2021/07/07_01-goodwin-advises-antin-infrastructure", "https://pitchbook.com/profiles/fund/18601-12F", "https://www.antin-ip.com/media/our-news/swiftair-european-leader-in-outsourced-express-airfreight-welcomes-antin-to-accelerate-its-growth"],
    sectors: ["Digital Infrastructure", "Waste / Environmental Services", "Transportation"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.goodwinlaw.com/en/news-and-events/news/2021/07/07_01-goodwin-advises-antin-infrastructure",
  }),
  f("FUND-010", "Antin Infrastructure Partners", "NextGen Fund I", "2021", "€1.2B", 1320, "Opportunistic", "Deploying", {
    description: "Active 2021-vintage opportunistic infrastructure fund focused on scaling up next-generation energy and digital transition assets in North America and Europe. Investments include smart mobility platforms and energy transition infrastructure.",
    investmentStrategy: "Opportunistic, growth-oriented fund targeting businesses with proven models and technologies that require substantial capital to scale into the next generation of infrastructure, investing across energy transition, digital transition, sustainable mobility, and social sectors in Europe and North America. Seeks mid-teen returns from assets with infrastructure-like characteristics such as long-term public sector contracts and high barriers to entry.",
    sourceUrls: ["https://www.businesswire.com/news/home/20240306210403/en/Antin-Strong-Financial-Performance-in-2023-Net-Income-up-60", "https://www.antin-ip.com/media/our-news/antin-plans-to-take-a-majority-stake-in-matawan-a-leading-smart-mobility-platform", "https://ionanalytics.com/insights/infralogic/antin-pushes-infra-boundaries-with-transport-software-investment/"],
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.businesswire.com/news/home/20240306210403/en/Antin-Strong-Financial-Performance-in-2023-Net-Income-up-60",
  }),

  // ── APG Asset Management ──────────────────────────────────
  f("FUND-011", "APG Asset Management", "APG Direct Infrastructure Pool", "2004", "€32B", 35200, "Core-Plus", "Evergreen", {
    description: "APG's infrastructure arm is an active, open-ended captive pension platform deploying significant direct equity into core and core-plus essential infrastructure assets globally, including North America. Notable holdings include Brisa (Portuguese motorways) and stakes in major European utilities.",
    investmentStrategy: "Europe's largest pension investor deploying long-duration capital directly into global unlisted infrastructure across five strategic themes: decarbonised mobility and transport, clean and connected renewable power, digital infrastructure, circular economy, and quality of life assets. Invests through a bespoke asset management approach, increasingly expanding into Asia-Pacific alongside its established European and North American base, often co-investing collaboratively with other large pension partners.",
    sourceUrls: ["https://assetmanagement.apg.nl/infrastructure/", "https://apg.nl/media/oyim14yz/201013-brisa-closing.pdf"],
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Global", "North America", "Europe"],
    structure: "Permanent Capital",
    strategyUrl: "https://assetmanagement.apg.nl/infrastructure/",
  }),

  // ── Apollo (Argo Infrastructure Partners) ─────────────────
  f("FUND-012", "Apollo Global Management", "Argo Infrastructure Partners Series 4", "2024", "$6.0B", 6000, "Core-Plus", "Deploying", {
    description: "Argo is an active GP running multiple closed-end series targeting North American utilities and renewables via a core/core-plus equity strategy. Apollo acquired Argo in 2024 to expand its infrastructure capabilities across power, utilities, and energy transition.",
    investmentStrategy: "Core and core-plus mid-market North American infrastructure fund targeting essential services assets across digital infrastructure, renewable energy, transportation, and utilities across the US and Canada. Long-term, responsible investment philosophy focuses on assets that provide essential services to communities over long operational lives, building a portfolio including data centre, parking, utility gas, and environmental services platforms.",
    sourceUrls: ["https://ir.apollo.com/news-events/press-releases/detail/533/apollo-to-acquire-argo-infrastructure-partners"],
    sectors: ["Utilities", "Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://ir.apollo.com/news-events/press-releases/detail/533/apollo-to-acquire-argo-infrastructure-partners",
  }),
  f("FUND-013", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund III", "2023", "$2.5B", 2500, "Value-Add", "Deploying", {
    description: "AIOF III is an active traditional closed-end fund making direct infrastructure equity acquisitions across North America. Apollo's infrastructure franchise targets value-add opportunities in energy, transport, and digital assets.",
    investmentStrategy: "Mid-market value-add infrastructure fund targeting control-oriented acquisitions, corporate carve-outs, and structured solutions across communications, power and renewables, transportation, and digital infrastructure in North America and Europe. Leverages Apollo's integrated capital markets capabilities to source complexity-driven deals at attractive entry points.",
    sourceUrls: ["https://ionanalytics.com/insights/uncategory/apollo-nears-flagship-infra-fund-close-below-target/", "https://www.infrastructureinvestor.com/apollo-bulks-up-capabilities-with-argo-infrastructure-partners-acquisition/"],
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["North America"],
    strategyUrl: "https://ionanalytics.com/insights/uncategory/apollo-nears-flagship-infra-fund-close-below-target/",
  }),
  f("FUND-014", "Apollo Global Management", "Apollo Core Infrastructure Fund", "2021", "$389.2M", 389, "Core", "Deploying", {
    description: "Active 2021/2022-vintage core infrastructure fund targeting direct infrastructure equity investments with stable, long-duration cash flows.",
    investmentStrategy: "Core infrastructure vehicle targeting assets with stable, long-term contracted cash flows and predictable income — primarily in digital infrastructure, energy transition, power/utilities, and transportation/logistics. Leverages Apollo's full origination platform, including direct debt capabilities and operational asset management resources.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/23399-11F", "https://capedge.com/company/1398053/apollo-management-lp"],
    sectors: ["Utilities", "Transportation", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://pitchbook.com/profiles/fund/23399-11F",
  }),
  f("FUND-015", "Apollo Global Management", "Apollo Infrastructure Company LLC (AIC)", "2023", "$1.7B", 1700, "Core-Plus", "Evergreen", {
    description: "AIC is an open-ended, evergreen operating company offering wealth investors access to a platform of direct infrastructure equity acquisitions globally, including North America. Structured as a non-traded vehicle targeting stable income and capital appreciation.",
    investmentStrategy: "Perpetual-capital operating company structured to be a long-term owner, operator, and capital provider to infrastructure assets globally, seeking a combination of current income and capital appreciation across digital infrastructure, energy transition, transportation, and sustainable living subsectors. Taps Apollo's integrated platform — including proprietary deal flow and credit origination — to execute control-oriented acquisitions and carve-outs.",
    sourceUrls: ["https://www.apollo.com/wealth/strategies/products/apollo-infrastructure-company", "https://www.sec.gov/Archives/edgar/data/1971381/000119312525068918/d888030d10k.htm"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    strategyUrl: "https://www.apollo.com/wealth/strategies/products/apollo-infrastructure-company",
  }),
  f("FUND-016", "Apollo Global Management", "Apollo Clean Transition Equity Partners II", "2023", "$411M", 411, "Opportunistic", "Deploying", {
    description: "Active 2023-vintage fund focused on energy transition and clean infrastructure opportunistic/buyout deals. Targets decarbonization platforms and renewable energy assets.",
    investmentStrategy: "Dedicated closed-end fund investing in companies and projects at the core of the energy transition and industrial decarbonization, including energy transition infrastructure, sustainable mobility, sustainable resource use, and sustainable real estate globally. Part of Apollo's broader Clean Transition Capital platform targeting $50B in climate capital deployment.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/24869-17F"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://pitchbook.com/profiles/fund/24869-17F",
  }),
  f("FUND-017", "Apollo Global Management", "Apollo Clean Transition Equity ELTIF", "2023", "Undisclosed", null, "Opportunistic", "Deploying", {
    description: "Closed-end European wealth product providing direct exposure to Apollo's global (US-heavy) clean transition infrastructure and private equity capability. Distributed through UniCredit and other European wealth channels.",
    investmentStrategy: "Luxembourg-domiciled ELTIF designed to offer European wealth investors access to private equity opportunities in clean energy transition and sustainable industrial transformation, mirroring the strategy of Apollo's Clean Transition Equity Partners series. Distributed via bank and wealth management networks across Europe through an ELTIF 2.0-compliant vehicle.",
    sourceUrls: ["https://ir.apollo.com/news-events/press-releases/detail/483/apollo-adds-eltif-to-wealth-product-platform-following-cssf", "https://www.unicreditgroup.eu/en/press-media/press-releases/2024/january/unicredit-to-offer-apollo-clean-transition-equity-eltif-to-wealt.html", "https://www.scopeexplorer.com/en/details/apollo-clean-transition-equity-eltif/149638"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://ir.apollo.com/news-events/press-releases/detail/483/apollo-adds-eltif-to-wealth-product-platform-following-cssf",
  }),
  f("FUND-018", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund II", "2020", "$2.54B", 2540, "Value-Add", "Deploying", {
    description: "Closed-ended infrastructure value-add fund that successfully closed in 2022 targeting North America. AIOF II focuses on value-add infrastructure equity with an emphasis on energy transition and essential services.",
    investmentStrategy: "Mid-market value-add infrastructure fund targeting control acquisitions, carve-outs, and structured solutions across communications/digital, power and renewables (including offshore wind, energy storage, and solar), and transportation in North America and Europe. Built a portfolio spanning fibre telecom, renewable royalties, utility-scale offshore wind, and battery energy storage.",
    sourceUrls: ["https://ir.apollo.com/news-events/press-releases/detail/38/apollo-closes-second-dedicated-infrastructure-fund-with"],
    sectors: ["Renewables / Energy Transition", "Utilities", "Transportation"],
    regions: ["North America"],
    strategyUrl: "https://ir.apollo.com/news-events/press-releases/detail/38/apollo-closes-second-dedicated-infrastructure-fund-with",
  }),
  // ── Ara Partners ───────────────────────────────────────────
  f("FUND-019", "Ara Partners", "Ara Infrastructure Fund I", "2022", "$800M", 800, "Value-Add", "Deploying", {
    description: "Active traditional closed-end infrastructure equity fund targeting North America and Europe. Focuses on industrial decarbonization, sustainable materials, and climate solutions infrastructure.",
    investmentStrategy: "Inaugural infrastructure fund targeting mid-market assets focused on the decarbonization of the industrial economy across North America and Europe, investing in the development, re-purposing, and optimization of infrastructure in sectors including industrial and manufacturing, chemicals, logistics, fuels, and waste management. Targets assets often overlooked by larger-cap and conventional renewables managers, with a mandate to deliver 60%+ greenhouse gas emissions reductions at the asset level.",
    sourceUrls: ["https://www.prnewswire.com/news-releases/ara-partners-reaches-final-close-for-inaugural-infrastructure-fund-surpassing-target-302443285.html"],
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.prnewswire.com/news-releases/ara-partners-reaches-final-close-for-inaugural-infrastructure-fund-surpassing-target-302443285.html",
  }),
  f("FUND-020", "Ara Partners", "Ara Energy Decarbonization Fund I", "2024", "$725M", 725, "Value-Add", "Deploying", {
    description: "Newly formed 2024 active strategy acquiring and retrofitting traditional energy infrastructure in North America. Partners with HF Capital to target assets across the conventional energy value chain for decarbonization.",
    investmentStrategy: "Strategy launched in partnership with HF Capital targeting the acquisition, optimization, and decarbonization of conventional energy assets across North America — specifically in thermal power generation, merchant biofuels production, and retail energy distribution. Applies Ara's proven industrial decarbonization methods to hard-to-abate conventional energy infrastructure such as ethanol plants and natural gas power generation.",
    sourceUrls: ["https://www.prnewswire.com/news-releases/ara-partners-launches-new-strategy-to-decarbonize-conventional-energy-value-chain-in-partnership-with-hf-capital-302248969.html"],
    sectors: ["Midstream / Energy", "Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.prnewswire.com/news-releases/ara-partners-launches-new-strategy-to-decarbonize-conventional-energy-value-chain-in-partnership-with-hf-capital-302248969.html",
  }),

  // ── ArcLight Capital Partners ─────────────────────────────
  f("FUND-021", "ArcLight Capital Partners", "ArcLight Infrastructure Partners Fund VIII", "2023", "$3.0B", 3000, "Opportunistic", "Raising", {
    description: "Active 2023-vintage closed-end infrastructure equity fund with a pure focus on North American hard assets. ArcLight targets power generation, renewables, midstream energy, and related infrastructure.",
    investmentStrategy: "Value-add, middle-market infrastructure fund targeting power generation, renewable energy, battery storage, and strategic gas infrastructure in North America, capitalising on the tightening power market driven by data centre growth and electrification. Operationally intensive investment approach supported by in-house strategic, technical, and commercial specialists focusing on repurposing, repositioning, and optimising hard assets.",
    sourceUrls: ["https://irei.com/news/arclight-infrastructure-partners-fund-viii-nears-3b-fundraising-goal/", "https://pitchbook.com/profiles/fund/24871-06F"],
    sectors: ["Power Generation", "Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["North America"],
    strategyUrl: "https://irei.com/news/arclight-infrastructure-partners-fund-viii-nears-3b-fundraising-goal/",
  }),
  f("FUND-022", "ArcLight Capital Partners", "ArcLight Power Infrastructure Partners", "2024", "$250M", 250, "Opportunistic", "Deploying", {
    description: "Active 2024 infrastructure equity vehicle under ArcLight targeting North American energy and power deals. Focuses on smaller-scale power generation and energy infrastructure opportunities.",
    investmentStrategy: "Middle-market, operationally intensive fund focused on electric power generation, renewable energy (wind, solar, hydro, battery storage), strategic gas transmission and storage, and transformative electrification infrastructure across North America. Leverages ArcLight's 20+ year track record of owning and managing over 65 GW of power assets, with a growing emphasis on assets enabling the data centre and electrification megatrends.",
    sourceUrls: ["https://radientanalytics.com/firm/adv/arclight-capital-partners-llc-161228", "https://pitchbook.com/profiles/fund/27828-01F"],
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://radientanalytics.com/firm/adv/arclight-capital-partners-llc-161228",
  }),

  // ── Ardian ────────────────────────────────────────────────
  f("FUND-023", "Ardian", "Ardian Infrastructure Fund VI", "2023", "€13.5B", 14850, "Core-Plus", "Deploying", {
    description: "Active core-plus infrastructure equity fund that permits direct asset acquisitions in North America and Europe. Part of Ardian's flagship infrastructure platform that has raised over €20 billion across multiple vintages.",
    investmentStrategy: "Record-setting core-plus European infrastructure fund (part of a €20B platform including co-investments) targeting essential infrastructure across three verticals — energy (renewable power and utilities), transport (including major airports), and digital infrastructure (data centres and fibre) — primarily in Europe. Pursues large, capital-intensive platform acquisitions with a value creation discipline rooted in operational improvement.",
    sourceUrls: ["https://pulse2.com/ardian-20-billion-raised-for-flagship-infrastructure-platform/", "https://inforcapital.com/funds/ardian-infrastructure-fund-vi-aif-vi/"],
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://pulse2.com/ardian-20-billion-raised-for-flagship-infrastructure-platform/",
  }),
  f("FUND-024", "Ardian", "Ardian Americas Infrastructure Fund V", "2022", "$2.1B", 2100, "Core-Plus", "Deploying", {
    description: "Closed-end fund dedicated exclusively to acquiring core-plus infrastructure equity in North America. Second-generation Americas fund building on Ardian's established North American infrastructure portfolio.",
    investmentStrategy: "Core-plus, Article 9 fund targeting high-quality mid-market essential infrastructure assets across the US and other OECD Americas markets in three sectors: telecommunications, transportation, and energy transition. Ardian's second-generation Americas vehicle, significantly oversubscribed versus its hard cap.",
    sourceUrls: ["https://www.ardian.com/press-releases/ardian-closes-its-second-generation-americas-infrastructure-fund-us21bn", "https://pitchbook.com/profiles/fund/18278-74F"],
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.ardian.com/press-releases/ardian-closes-its-second-generation-americas-infrastructure-fund-us21bn",
  }),
  f("FUND-025", "Ardian", "Ardian Clean Energy Evergreen Fund (ACEEF)", "2022", "€1.0B", 1100, "Core-Plus", "Evergreen", {
    description: "Active, perpetual capital (evergreen) vehicle making core and core-plus renewable energy equity investments globally, including the Americas. Recently expanded into the Nordic renewables market.",
    investmentStrategy: "Open-ended, Article 9 evergreen fund investing in highly contracted brownfield renewable energy assets — primarily operational wind, solar, hydro, biogas, biomass, and battery energy storage systems — with a focus on Europe. Targets established generation technologies under incentive tariffs or long-term PPAs, optimising asset performance through Ardian's proprietary OPTA data analytics platform.",
    sourceUrls: ["https://www.ardian.com/news-insights/press-releases/ardian-clean-energy-evergreen-fund-aceef-expands-nordics-portfolio", "https://www.fundscouter.com/funds/ardian/ardian-clean-energy-evergreen-fund"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://www.ardian.com/news-insights/press-releases/ardian-clean-energy-evergreen-fund-aceef-expands-nordics-portfolio",
  }),

  // ── Ares Management ───────────────────────────────────────
  f("FUND-026", "Ares Management", "Ares Climate Infrastructure Partners II", "2023", "$3.0B", 3000, "Value-Add", "Raising", {
    description: "Active 2023-vintage closed-end fund targeting direct value-add climate infrastructure equity acquisitions, prominently featuring the US market. Passed $1.3 billion in commitments as of latest reporting.",
    investmentStrategy: "Value-add infrastructure fund deploying flexible capital — across equity, preferred equity, and structured debt — into assets and companies accelerating the transition to a low-carbon economy, with a focus on renewable energy, energy storage, resource efficiency, vehicle electrification, and transmission. Invests across the capital structure in essential infrastructure assets with stable cash flow profiles.",
    sourceUrls: ["https://www.newprivatemarkets.com/in-brief-ares-passes-1-3bn-for-second-climate-infra-fundraise/", "https://www.infrastructureinvestor.com/the-pipeline-ares-reaches-1-3bn-infranodes-new-partner-kkr-and-psps-2-8bn-transmission-play/", "https://pitchbook.com/profiles/fund/24186-70F"],
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.newprivatemarkets.com/in-brief-ares-passes-1-3bn-for-second-climate-infra-fundraise/",
  }),
  f("FUND-027", "Ares Management", "Ares Core Infrastructure Fund (ACI)", "2024", "$3.9B", 3900, "Core", "Evergreen", {
    description: "ACI is an active, open-ended (evergreen) BDC platform buying core infrastructure equity strictly focused on North America. Targets long-duration, essential services infrastructure generating stable cash yields.",
    investmentStrategy: "Perpetual, semi-liquid core infrastructure vehicle targeting operating assets with high cash flow predictability, long-term contracted revenues with creditworthy counterparties, and income-oriented returns, primarily across digital infrastructure (data centres, fibre), energy transition, utilities/power, and transportation. Provides both controlling and non-controlling equity positions, targeting assets with resilient, inflation-hedged cash flows.",
    sourceUrls: ["https://www.areswms.com/solutions/aci", "https://www.heronfinance.com/private-infrastructure", "https://www.areswms.com.au/our-funds/ares-core-infrastructure-fund-aci-aut/"],
    sectors: ["Utilities", "Transportation", "Power Generation"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.areswms.com/solutions/aci",
  }),

  // ── Astatine Investment Partners ──────────────────────────
  f("FUND-028", "Astatine Investment Partners", "Astatine Infrastructure Fund IV", "2022", "$586M", 586, "Core-Plus", "Deploying", {
    description: "Active mid-cap North American core-plus infrastructure equity fund executing corporate carve-outs. Formerly Alinda Capital Partners' mid-market strategy, rebranded to Astatine. Investments include Kansas City fiber network.",
    investmentStrategy: "Mid-market, core-plus infrastructure fund targeting equity investments primarily in North America and Europe across digital (fibre broadband), transportation, utility-related, and essential services subsectors, with a focus on assets offering long-term contracted cash flows, inflation linkage, and strong income yield. Formerly Alinda Capital Partners' mid-market strategy (rebranded 2022), applying a private equity–style, operationally engaged approach.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/18186-76F", "https://astatineip.com/2022/03/03/fund-iv-signs-definitive-agreement-to-acquire-kansas-city-fiber-network/", "https://www.private-equitynews.com/news/alinda-capital-partners-rebrands-its-mid-market-infrastructure-strategy-to-astatine-investment-partners/"],
    sectors: ["Digital Infrastructure", "Utilities", "Communications"],
    regions: ["North America"],
    strategyUrl: "https://astatineip.com/2022/03/03/fund-iv-signs-definitive-agreement-to-acquire-kansas-city-fiber-network/",
  }),

  // ── AustralianSuper ───────────────────────────────────────
  f("FUND-029", "AustralianSuper", "Australian Super Infrastructure Portfolio", "N/A", "$75.0B", 75000, "Core-Plus", "Evergreen", {
    description: "Captive direct investment platform actively executing large-scale unlisted infrastructure equity acquisitions in North America as an evergreen pool of capital. Recently expanded US private equity team with senior hires to accelerate direct deployment.",
    investmentStrategy: "Large-scale direct investment program in unlisted infrastructure across transport, digital infrastructure, ports, and utilities, operating across Australia, the UK, and North America with a core-plus risk profile and a long-term, internally managed ownership approach. Increasingly supplements direct deals with commitments to value-add fund managers to access segments less suited to internal origination.",
    sourceUrls: ["https://www.infrastructureinvestor.com/australiansuper-loosens-direct-investment-model-to-consider-more-infra-fund-commitments-exclusive/", "https://www.prnewswire.com/news-releases/australiansuper-expands-us-private-equity-team-with-senior-hire-302511523.html"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.infrastructureinvestor.com/australiansuper-loosens-direct-investment-model-to-consider-more-infra-fund-commitments-exclusive/",
  }),

  // ── Basalt Infrastructure Partners ────────────────────────
  f("FUND-030", "Basalt Infrastructure Partners", "Basalt Infrastructure Partners IV", "2022", "$4.0B", 4000, "Core-Plus", "Deploying", {
    description: "Recently closed, North America-targeted direct infrastructure equity fund. Basalt focuses on mid-market core-plus infrastructure with Colliers as a strategic investor in the platform.",
    investmentStrategy: "Mid-market equity investments in utilities, power and renewables, transport, and digital/communications infrastructure across North America and Western Europe, targeting a core-plus risk profile with a differentiated deal-sourcing approach and active asset management to drive operational improvement.",
    sourceUrls: ["https://www.ijglobal.com/Widget/Download/168818?home=2"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure"],
    regions: ["North America"],
    strategyUrl: "https://www.ijglobal.com/Widget/Download/168818?home=2",
  }),
  f("FUND-031", "Basalt Infrastructure Partners", "Basalt Infrastructure Partners V", "2025", "Undisclosed", null, "Core-Plus", "Raising", {
    description: "Eligible active fund targeting mid-market direct infrastructure equity in North America. Successor to the successful Fund IV, currently in fundraising.",
    investmentStrategy: "Continues Basalt's transatlantic mid-market strategy, targeting core-plus and value-add equity investments across power and renewables, utilities, transport, and digital/communications infrastructure in North America and Western Europe. Applies the same operationally intensive approach as its predecessors, seeking assets with contracted or regulated revenues alongside selective value creation opportunities.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/29059-75F", "https://corporate.colliers.com/news/news-details/2022/Colliers-to-invest-in-leading-infrastructure-investment-firm-01-24-2022/default.aspx", "https://www.sec.gov/Archives/edgar/data/2099775/000209977525000001/xslFormDX01/primary_doc.xml"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure"],
    regions: ["North America"],
    strategyUrl: "https://pitchbook.com/profiles/fund/29059-75F",
  }),
  // ── Bernhard Capital Partners ───────────────────────────────
  f("FUND-032", "Bernhard Capital Partners", "BCP Infrastructure Fund II", "2024", "$75M+", 75, "Value-Add", "Raising", {
    description: "Active 2024 vintage infrastructure fund focused on direct acquisitions of middle-market utilities and energy transition assets in the U.S. Louisiana Teachers' Retirement System among committed LPs.",
    investmentStrategy: "North American value-add infrastructure fund focused on energy services companies spanning the midstream, downstream, and power verticals, with investments typically sized between $75–150M. Employs a buy-and-build strategy, leveraging deep operational expertise inherited from the firm's roots in engineering, procurement, and construction to acquire and scale service businesses across the energy infrastructure supply chain.",
    sourceUrls: ["https://www.realfin.com/fund/31373/bcp-infrastructure-fund-ii", "https://www.dakota.com/hubfs/Dakota%20July%202025%20Pension%20Brief.pdf", "https://www.connectmoney.com/stories/louisiana-teachers-retirement-system-commits-200m-to-private-markets/"],
    sectors: ["Utilities", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.realfin.com/fund/31373/bcp-infrastructure-fund-ii",
  }),

  // ── BlackRock ─────────────────────────────────────────────
  f("FUND-033", "BlackRock", "BlackRock Global Infrastructure Fund IV", "2022", "$6.1B", 6100, "Core-Plus", "Deploying", {
    description: "Active mega-cap global infrastructure equity fund managed by BlackRock that actively deploys capital in North America. Raised $4.5 billion at first close before reaching $6.1 billion final close.",
    investmentStrategy: "Diversified global core-plus infrastructure fund guided by the themes of decarbonization, decentralization, and digitalization, with investments across energy and environmental, low-carbon power, regulated utilities, transportation and logistics, and digital infrastructure. Targets a net IRR of approximately 10%, drawing on long-term contracted cash flows and a global institutional investor base.",
    sourceUrls: ["https://www.infrastructureinvestor.com/gip-to-seek-7bn-for-rebranded-mid-market-fund-exclusive/", "https://www.businesswire.com/news/home/20221024005921/en/BlackRock-Global-Infrastructure-Fund-IV-Raises-US%244.5-Billion-at-First-Close"],
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://www.businesswire.com/news/home/20221024005921/en/BlackRock-Global-Infrastructure-Fund-IV-Raises-US%244.5-Billion-at-First-Close",
  }),
  f("FUND-034", "BlackRock", "BlackRock Global Renewable Power Fund IV (GRP IV)", "2023", "$7.0B", 7000, "Core-Plus", "Raising", {
    description: "Active global renewable energy infrastructure equity fund deploying into the Americas. GRP IV invests in solar, wind, and battery storage assets at scale across OECD markets.",
    investmentStrategy: "Core-plus, impact-oriented fund targeting equity investments in renewable power and clean energy infrastructure — principally wind, solar, battery storage, and grid assets — across OECD markets globally, classified as Article 9 under EU SFDR. Seeks risk diversification across geographies, technologies, and regulatory regimes.",
    sourceUrls: ["https://media.infrastructureinvestor.com/uploads/2025/11/Infrastructure-America-2025-final.pdf", "https://www.stblaw.com/about-us/news/view/2024/01/24/blackrock-s-global-renewable-power-fund-to-acquire-shares-in-recurrent-energy", "https://www.fondsinfo.be/en/articles/952365-blackrock-launches-fundraise-for-global-renewable-power-fund-iv-grp-iv"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global", "North America"],
    strategyUrl: "https://www.stblaw.com/about-us/news/view/2024/01/24/blackrock-s-global-renewable-power-fund-to-acquire-shares-in-recurrent-energy",
  }),
  f("FUND-035", "BlackRock", "BlackRock Evergreen Infra Partners Fund", "2022", "$1.0B", 1000, "Core", "Evergreen", {
    description: "Active evergreen structure making direct core infrastructure equity investments in North America. Secured $1 billion from European investors at initial close.",
    investmentStrategy: "Perpetual, open-ended core infrastructure strategy focused on energy transition, energy security, digital infrastructure, and sustainable mobility, with an initial emphasis on Western Europe expanding to North America. Targets stable, inflation-linked contracted returns by investing in long-duration core assets across renewable energy, gas storage, telecommunications, and sustainable transportation.",
    sourceUrls: ["https://esgnews.com/blackrocks-evergreen-infrastructure-fund-secures-1-billion-from-european-investors/"],
    sectors: ["Utilities", "Transportation", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://esgnews.com/blackrocks-evergreen-infrastructure-fund-secures-1-billion-from-european-investors/",
  }),

  // ── Blackstone ────────────────────────────────────────────
  f("FUND-036", "Blackstone", "Blackstone Infrastructure Partners (BIP)", "2017", "$53.0B", 53000, "Core-Plus", "Evergreen", {
    description: "BIP is Blackstone's flagship open-ended infrastructure equity vehicle targeting direct infrastructure assets with a strong primary mandate for North America. Portfolio includes Carrix (largest NA marine terminal operator), Invenergy (top US renewables developer), QTS Realty Trust (data centers), Phoenix Tower International, and AirTrunk. The fund has generated 17% net annual returns since inception.",
    investmentStrategy: "Large-scale, open-ended core-plus infrastructure vehicle investing primarily in North America (70%+) across energy, transportation, digital infrastructure, and water and waste, with selective European exposure. Pursues essential, high-barrier assets with long-term contracted or regulated cash flows, building significant positions in data centers, cell towers, toll roads, and marine terminals through both control and partnership transactions.",
    sourceUrls: ["https://www.infrastructureinvestor.com/the-pipeline-eqt-vi-nears-target-blackstones-data-centres-success-australiansupers-us-data-centre-splash/", "https://www.pa.gov/content/dam/copapwp-pagov/en/psers/documents/board3/resolutions/2018/res02.pdf", "https://www.txnmenergy.com/~/media/Files/P/PNM-Resources/rates-and-filings/2025%20Blackstone%20Infrastructure/PNM/Application/25-00-2025-08-25-PNM-Direct%20Testimony%20and%20Exhibits%20of%20Sebastien%20Sherman.pdf"],
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition", "Power Generation", "Midstream / Energy", "Utilities"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    structure: "Open-End",
    strategyUrl: "https://www.pa.gov/content/dam/copapwp-pagov/en/psers/documents/board3/resolutions/2018/res02.pdf",
  }),
  f("FUND-037", "Blackstone", "Blackstone Energy Transition Partners IV", "2022", "$5.6B", 5600, "Opportunistic", "Deploying", {
    description: "BETP IV successfully executes massive energy transition buyouts with direct equity infrastructure, holding a heavy North American portfolio. Closed at hard cap of $5.6 billion, representing one of the largest dedicated energy transition vehicles.",
    investmentStrategy: "Global energy transition private equity fund investing across the full decarbonization value chain — including grid infrastructure, transmission equipment, power generation, energy software, data center power access, and thermal management — with a particular concentration in North America. Backs management teams with flexible capital to help energy companies grow, targeting businesses well-positioned to benefit from long-term power demand growth driven by AI, electrification, and the energy transition.",
    sourceUrls: ["https://www.blackstone.com/news/press/blackstone-announces-5-6-billion-final-close-for-blackstone-energy-transition-partners-iv-at-hard-cap/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.blackstone.com/news/press/blackstone-announces-5-6-billion-final-close-for-blackstone-energy-transition-partners-iv-at-hard-cap/",
  }),

  // ── British Columbia Investment Management Corporation (BCI) ───
  f("FUND-038", "British Columbia Investment Management Corporation (BCI)", "BCI Infrastructure & Renewable Resources Program", "2005", "C$32.2B", 23500, "Core", "Evergreen", {
    description: "BCI's internal infrastructure arm functions as a captive open-ended platform making direct core equity investments in North America. Manages over C$32 billion in infrastructure and renewable resources for British Columbia public sector pension plans.",
    investmentStrategy: "Large, globally diversified direct investment platform targeting core infrastructure assets with high barriers to entry, stable cash flows, and long holding periods typically exceeding 20 years, with subsectors spanning utilities, renewable energy, digital infrastructure, transport, agriculture, and timberlands. Invests primarily through direct ownership and co-investments across developed markets, with growing exposure to energy transition and circular economy assets.",
    sourceUrls: ["https://www.bci.ca/investments/infrastructure-renewable-resources/overview/"],
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.bci.ca/investments/infrastructure-renewable-resources/overview/",
  }),

  // ── Brookfield Asset Management ───────────────────────────
  f("FUND-039", "Brookfield Asset Management", "Brookfield Infrastructure Fund V (BIF V)", "2022", "$30.0B", 30000, "Value-Add", "Deploying", {
    description: "Active, heavily capitalized North America-inclusive global flagship fund actively deploying equity into direct infrastructure acquisitions. BIF V is the world's largest closed-ended private infrastructure fund, having already deployed ~40% of its capital across renewables, transport, data centers, and telecom towers. Backed by ~200 LPs including NY State Common Retirement Fund ($300M commitment). Focused on digitalization, decarbonization, and deglobalization themes.",
    investmentStrategy: "Closed-ended flagship infrastructure equity fund pursuing large-scale, high-quality essential assets globally, with investment themes centered on digitalization (data centers, telecom towers), decarbonization (renewable energy), and deglobalization (transport and logistics). Targets core-plus to value-add returns through active asset management and control-oriented ownership across diversified infrastructure sectors.",
    sourceUrls: ["https://bam.brookfield.com/press-releases/brookfield-raises-record-30-billion-flagship-infrastructure-strategy"],
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition", "Utilities"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://bam.brookfield.com/press-releases/brookfield-raises-record-30-billion-flagship-infrastructure-strategy",
  }),
  f("FUND-040", "Brookfield Asset Management", "Brookfield Super-Core Infrastructure Partners", "2018", "$13.2B", 13200, "Core", "Evergreen", {
    description: "Actively raising evergreen core infrastructure vehicle investing across developed markets including North America. Targets essential, contracted infrastructure assets generating stable, long-duration cash yields.",
    investmentStrategy: "Large open-ended, perpetual-life core infrastructure fund targeting assets in utilities, energy, transportation, and communications that provide essential services with long-duration, inflation-linked contracted or regulated revenues. Designed to deliver lower but highly stable returns compared to Brookfield's closed-ended flagship funds, investing globally with a strong emphasis on OECD markets.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/16563-16F", "https://www.sec.gov/Archives/edgar/data/1937926/000162828026013098/bam-20251231.htm"],
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://pitchbook.com/profiles/fund/16563-16F",
  }),
  f("FUND-041", "Brookfield Asset Management", "Brookfield Global Transition Fund II (BGTF II)", "2023", "$20.0B", 20000, "Value-Add", "Deploying", {
    description: "BGTF II executes large-scale direct equity acquisitions related to decarbonization across North America and globally. Set a new record as the largest dedicated transition fund, targeting clean energy, electrification, and sustainable industrial infrastructure.",
    investmentStrategy: "The world's largest dedicated clean energy transition fund, targeting equity investments across renewable power expansion (wind, solar, hydro), corporate decarbonization, carbon capture and storage, nuclear, battery storage, and grid modernization across North America, South America, Europe, and Asia Pacific. Focuses on accelerating the global shift to a net-zero economy by backing established platforms and transforming carbon-intensive businesses.",
    sourceUrls: ["https://bam.brookfield.com/press-releases/brookfield-raises-20-billion-record-transition-fund", "https://www.connectmoney.com/stories/brookfield-closes-20b-global-energy-transition-fund-ii-setting-new-record/"],
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["Global", "North America"],
    strategyUrl: "https://bam.brookfield.com/press-releases/brookfield-raises-20-billion-record-transition-fund",
  }),
  f("FUND-042", "Brookfield Asset Management", "Brookfield Infrastructure Solutions (BISS I)", "2024", "$1.0B", 1000, "Opportunistic", "Deploying", {
    description: "Newly raised closed-end vehicle providing opportunistic structured and common equity exclusively to mid-market infrastructure projects in North America and globally.",
    investmentStrategy: "Debut middle-market infrastructure fund providing structured and common equity capital to sponsors, developers, and corporates across Brookfield's areas of greatest operational expertise, including renewable energy and in-building wireless infrastructure. Blends attributes of infrastructure debt and equity to offer flexible, solutions-oriented capital at the smaller end of the market.",
    sourceUrls: ["https://bam.brookfield.com/press-releases/brookfield-closes-infrastructure-structured-solutions-fund"],
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
    strategyUrl: "https://bam.brookfield.com/press-releases/brookfield-closes-infrastructure-structured-solutions-fund",
  }),
  f("FUND-043", "Brookfield Asset Management", "Brookfield Infrastructure Income Fund (BII)", "2023", "$5.1B", 5100, "Core-Plus", "Evergreen", {
    description: "BII is an active, open-ended infrastructure income fund heavily weighted toward direct equity ownership of infrastructure assets in North America. Distributed through private wealth channels, targeting 7-9% net returns with quarterly income distributions.",
    investmentStrategy: "Evergreen, semi-liquid vehicle designed for private wealth investors, providing exposure to a diversified blend of private infrastructure equity and debt across renewable power and transition, data infrastructure, utilities, transport, and midstream globally. Targets total returns split between current income and capital appreciation, with monthly subscriptions, monthly distributions, and quarterly share repurchase liquidity.",
    sourceUrls: ["https://privatewealth.brookfield.com/sites/default/files/funds/tender-offer-funds/brookfield-infrastructure-income-fund-flyer.pdf", "https://privatewealth.brookfield.com/fund/brookfield-infrastructure-income-fund-inc"],
    sectors: ["Utilities", "Transportation", "Midstream / Energy", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
    strategyUrl: "https://privatewealth.brookfield.com/fund/brookfield-infrastructure-income-fund-inc",
  }),
  // ── Canada Development Investment Corporation ──────────────
  f("FUND-044", "Canada Development Investment Corporation", "Canada Growth Fund", "2022", "C$15.0B", 11100, "Value-Add", "Evergreen", {
    description: "Active, permanent-capital investment vehicle making direct infrastructure equity investments explicitly focused on the North American (Canadian) market. Established by the Canadian federal government to attract private capital into building Canada's clean economy.",
    investmentStrategy: "Canadian government-backed investment vehicle that catalyzes private capital into clean economy projects in Canada, using concessional instruments such as carbon contracts for difference, equity, and other risk-absorbing tools to improve project economics. Targets carbon capture and storage, clean hydrogen, renewable power, transportation electrification, and industrial decarbonization.",
    sourceUrls: ["https://www.budget.canada.ca/fes-eea/2022/doc/gf-fc-en.pdf", "https://www.cgf-fcc.ca/en/who-we-are/", "https://www.cgf-fcc.ca/en/"],
    sectors: ["Renewables / Energy Transition", "Utilities", "Transportation"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.cgf-fcc.ca/en/who-we-are/",
  }),

  // ── Carlyle Group ─────────────────────────────────────────
  f("FUND-045", "Carlyle Group", "Carlyle Global Infrastructure Opportunity Fund II", "2024", "$3.0B", 3000, "Opportunistic", "Raising", {
    description: "A targeted opportunistic infrastructure equity fund with an aggressive footprint in North American asset acquisition. Texas TRS committed $200M. Carlyle targets power, renewables, and digital infrastructure globally.",
    investmentStrategy: "Opportunistic infrastructure equity fund targeting essential assets across transportation and logistics, digital infrastructure, and renewables in North America and other OECD markets. Applies Carlyle's value creation approach from private equity to infrastructure — investing across development, construction, and growth stages — with a focus on contracted revenues, inflation protection, and active management to drive EBITDA expansion.",
    sourceUrls: ["https://www.privateequitywire.co.uk/carlyle-targets-over-3bn-for-new-infrastructure-fund/", "https://pe-insights.com/carlyle-eyes-over-3bn-for-new-infrastructure-fund-amid-growing-investor-interest/", "https://pitchbook.com/profiles/fund/27355-60F", "https://irei.com/news/texas-trs-slates-200m-to-carlyle-global-infrastructure-opportunity-fund-ii/"],
    sectors: ["Power Generation", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["North America", "Global"],
    strategyUrl: "https://www.privateequitywire.co.uk/carlyle-targets-over-3bn-for-new-infrastructure-fund/",
  }),
  f("FUND-046", "Carlyle Group", "Carlyle Renewable & Sustainable Energy Fund II", "2022", "$1.6B", 1600, "Value-Add", "Deploying", {
    description: "Active 2022-vintage closed-end fund making direct equity value-add infrastructure investments in North America. NY Common Retirement Fund among major LPs. Focuses on renewable energy and sustainable infrastructure projects.",
    investmentStrategy: "Global value-add infrastructure fund focused on clean energy, targeting solar, wind, battery storage, green hydrogen, and related cleantech across North America, Europe, and Australia, with per-investment commitments typically between $75–250M. Pursues both development-stage and operating renewable assets through platform creation and growth equity.",
    sourceUrls: ["https://www.buyoutsinsider.com/carlyles-second-renewables-fund-tops-1bn-with-help-of-new-york-common/", "https://www.osc.ny.gov/press/releases/2024/08/dinapoli-ny-pension-fund-reaches-climate-agreements-five-portfolio-companies", "https://www.boston.gov/sites/default/files/file/2023/07/2023%C2%A006%C2%A0Investment%20Performance%20Report.pdf"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.buyoutsinsider.com/carlyles-second-renewables-fund-tops-1bn-with-help-of-new-york-common/",
  }),

  // ── CBRE Caledon ──────────────────────────────────────────
  f("FUND-047", "CBRE Caledon", "CBRE Musselshell Infrastructure Investments", "2022", "$235M", 235, "Opportunistic", "Deploying", {
    description: "Active customized opportunistic infrastructure SMA formed in 2022 for the Montana Board of Investments with a global/North American mandate. Consultant-led infrastructure allocation vehicle.",
    investmentStrategy: "Mid-market, core and core-plus infrastructure fund targeting diversified OECD-market investments across renewable energy, transportation, digital infrastructure, social infrastructure, and utilities. Constructs diversified portfolios through direct and indirect investments, seeking consistent inflation-linked cash flows from assets with monopolistic characteristics and high barriers to entry.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/22373-92F", "https://irei.com/news/montana-boi-commits-135m-to-cbre-musselshell-infrastructure-investments/", "https://www.dakota.com/resources/blog/consultant-led-private-infrastructure-allocations-from-q4-2025"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure"],
    regions: ["North America", "Global"],
    strategyUrl: "https://irei.com/news/montana-boi-commits-135m-to-cbre-musselshell-infrastructure-investments/",
  }),

  // ── CIM Group ─────────────────────────────────────────────
  f("FUND-048", "CIM Group", "CIM Infrastructure Fund III", "2021", "$1.76B", 1760, "Value-Add", "Deploying", {
    description: "Active value-add closed-end infrastructure equity fund targeting middle-market assets strictly in North America. CIM Group focuses on real assets across digital, transport, and environmental infrastructure in the US.",
    investmentStrategy: "Value-add infrastructure fund targeting opportunities exclusively in North America across three high-conviction subsectors — digital infrastructure (data centers, fiber, wireless towers), renewable energy and storage, and waste and water management — through active ownership and operational improvement. Draws on CIM Group's integrated platform as an owner, operator, and developer to originate and manage assets benefiting from AI-driven data growth and the energy transition.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/21118-06F", "https://www.pa.gov/content/dam/copapwp-pagov/en/psers/documents/board3/resolutions/2022/cim%20infrastructure%20fund%20iii%20-%20public%20im.pdf"],
    sectors: ["Digital Infrastructure", "Transportation", "Waste / Environmental Services"],
    regions: ["North America"],
    strategyUrl: "https://pitchbook.com/profiles/fund/21118-06F",
  }),

  // ── Copenhagen Infrastructure Partners ────────────────────
  f("FUND-049", "Copenhagen Infrastructure Partners", "Copenhagen Infrastructure V (CI V)", "2023", "€12.0B", 13200, "Value-Add", "Deploying", {
    description: "Active flagship vehicle undertaking direct equity and greenfield energy infrastructure acquisitions across North America, Europe, and APAC. CIP is one of the world's largest dedicated energy infrastructure fund managers.",
    investmentStrategy: "Large-scale greenfield renewable energy fund investing early-stage in offshore wind, onshore wind, solar PV, and battery storage across low-risk OECD markets in Western Europe, North America, and Asia Pacific. Captures a greenfield development premium by entering projects at early development, significantly de-risking and optimizing them prior to construction, applying CIP's industrial value-creation model.",
    sourceUrls: ["https://www.cip.com/funds/flagship-funds/", "https://outside.vermont.gov/dept/VPIC/Shared%20Documents/VPIC%20Website/Meetings/VPIC%20General%20Meetings/Meeting%20Materials/2023/12-12-2023/2023-12%20CIP%20V%20Strategy%20Summary_v1%20(Redacted).pdf"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://www.cip.com/funds/flagship-funds/",
  }),
  f("FUND-050", "Copenhagen Infrastructure Partners", "CI Advanced Bioenergy Fund I (CI ABF I)", "2022", "€750M", 825, "Value-Add", "Deploying", {
    description: "Vehicle explicitly deploying capital into advanced bioenergy direct equity projects within North America and Europe. Targets next-generation biofuels and sustainable aviation fuel infrastructure.",
    investmentStrategy: "Greenfield bioenergy fund investing in advanced bioenergy infrastructure producing biomethane, bio-LNG, and second-generation biofuels from sustainable organic waste feedstocks across Europe and North America. Targets the decarbonization of hard-to-abate sectors including shipping, aviation, and heavy industry, classified as Article 9 (dark green) under EU SFDR.",
    sourceUrls: ["https://www.cip.com/funds/"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.cip.com/funds/",
  }),
  f("FUND-051", "Copenhagen Infrastructure Partners", "CI Advanced Bioenergy Fund II (CI ABF II)", "2025", "€1.5B", 1650, "Value-Add", "Raising", {
    description: "Active successor fund (Vintage 2025) raising capital to make direct infrastructure equity investments in North America and Europe. Builds on ABF I's track record in advanced bioenergy and sustainable fuels.",
    investmentStrategy: "Successor fund continuing the strategy of CI ABF I, making greenfield equity investments in advanced bioenergy infrastructure — producing biomethane, bio-LNG, and advanced biofuels from sustainable organic waste feedstocks — primarily across Europe and North America. Leverages the seed portfolio and operational capabilities built through ABF I to decarbonize hard-to-abate sectors.",
    sourceUrls: ["https://www.cip.com/funds/"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.cip.com/funds/",
  }),

  // ── CPP Investments ───────────────────────────────────────
  f("FUND-052", "CPP Investments", "CPP Investments Infrastructure", "1999", "C$780.7B", 577700, "Core", "Evergreen", {
    description: "A permanent captive evergreen platform conducting large-scale direct core infrastructure equity acquisitions globally, including heavy deployment in North America. CPP manages the Canada Pension Plan fund and has been among the most active direct infrastructure investors globally.",
    investmentStrategy: "Deploys large-scale direct capital globally across utilities, renewable and conventional energy, transportation networks, midstream assets, and digital infrastructure, with a long-term ownership horizon and a preference for significant ownership stakes that enable active governance. Operates across developed and emerging markets through direct investments, co-investments, and fund commitments, with global offices supporting on-the-ground origination.",
    sourceUrls: ["https://www.cppinvestments.com/newsroom/cpp-investments-net-assets-total-780-7-billion-at-third-quarter-fiscal-2026/", "https://www.cppinvestments.com/the-fund/investment-programs/investment-real-assets/", "https://en.wikipedia.org/wiki/CPP_Investments"],
    sectors: ["Transportation", "Utilities", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    structure: "Permanent Capital",
    strategies: ["Core", "Core-Plus"],
    strategyUrl: "https://www.cppinvestments.com/the-fund/investment-programs/investment-real-assets/",
  }),

  // ── CVC DIF ───────────────────────────────────────────────
  f("FUND-053", "CVC DIF", "CVC DIF Infrastructure VIII", "2025", "€6.0B", 6600, "Core-Plus", "Raising", {
    description: "Active 2025-vintage flagship infrastructure equity fund cleared to deploy core-plus capital across North America and Europe. Multiple US state pension boards (NJ, PA) have approved commitments to this vehicle.",
    investmentStrategy: "Flagship core and core-plus mid-market infrastructure equity fund targeting essential assets in energy transition, digital infrastructure, transport, and utilities across Europe, North America, and Australia. Employs a 'build-to-core' approach, acquiring and operating assets with long-term contract cover that provide downside protection and stable yield, while capturing additional value from development pipelines and operational improvements.",
    sourceUrls: ["https://www.nj.gov/treasury/doinvest/pdf/AlternativeInvestments/RealAsset/DIF_Infrastructure_VIII_SCSp.pdf", "https://www.pa.gov/content/dam/copapwp-pagov/en/psers/documents/board3/resolutions/2025/2025-58%20pserb%20resolution%20dif%20infrastructure%20fund%20viii%20scsp.pdf", "https://inforcapital.com/funds/dif-infrastructure-viii/"],
    sectors: ["Utilities", "Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://inforcapital.com/funds/dif-infrastructure-viii/",
  }),
  f("FUND-054", "CVC DIF", "CVC DIF Value-Add IV", "2024", "€2.0B", 2200, "Value-Add", "Raising", {
    description: "Active, recently launched value-add infrastructure equity fund with a global mandate that includes North American exposure. Targets higher-return infrastructure platforms requiring operational improvement.",
    investmentStrategy: "Pursues a 'buy-and-build' strategy targeting growth-oriented mid-market infrastructure companies — particularly in digital infrastructure, energy transition, sustainable transportation, and healthcare — primarily across Europe and North America. Focuses on businesses with strong competitive positions and significant growth potential through pipeline development, business line expansion, and platform aggregation.",
    sourceUrls: ["https://www.nj.gov/treasury/doinvest/pdf/AlternativeInvestments/RealAsset/DIF_Infrastructure_VIII_SCSp.pdf"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://www.nj.gov/treasury/doinvest/pdf/AlternativeInvestments/RealAsset/DIF_Infrastructure_VIII_SCSp.pdf",
  }),
  f("FUND-055", "CVC DIF", "DIF Infrastructure VII", "2022", "€4.4B", 4840, "Core", "Deploying", {
    description: "Active, recently closed flagship core infrastructure equity fund pursuing North American assets. DIF beat its target and raised €6.8 billion across its two infrastructure funds in the same vintage.",
    investmentStrategy: "Core and core-plus infrastructure equity fund targeting essential assets in PPP/concessions, renewable energy, broader energy transition, and utilities across Europe, North America, and Oceania. Combines brownfield and selective greenfield investment to generate long-term, inflation-linked contracted or regulated cash flows, with active value enhancement through cost optimization, debt refinancing, and asset combination strategies.",
    sourceUrls: ["https://www.preqin.net.cn/news/dif-capital-partners-beats-targets-after-raising-eur6-8bn-for-two-infrastructure-funds", "https://pitchbook.com/profiles/fund/22326-94F"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.preqin.net.cn/news/dif-capital-partners-beats-targets-after-raising-eur6-8bn-for-two-infrastructure-funds",
  }),
  f("FUND-056", "CVC DIF", "DIF Core-Plus Infrastructure Fund III (CIF III)", "2022", "€1.6B", 1760, "Core-Plus", "Deploying", {
    description: "Active, traditional closed-end core-plus vehicle with capital to deploy into equity infrastructure across North America and Europe. Part of DIF's dual-fund strategy alongside the flagship core vehicle.",
    investmentStrategy: "Small-to-mid-cap core-plus infrastructure equity fund targeting digital infrastructure (data centers, fiber networks), energy transition, and sustainable transportation across Europe and North America, with deals typically sized between €30–150M. Pursues both operational and greenfield assets in sectors benefiting from decarbonization and digitalization megatrends.",
    sourceUrls: ["https://www.preqin.net.cn/news/dif-capital-partners-beats-targets-after-raising-eur6-8bn-for-two-infrastructure-funds", "https://www.ccpc.ie/business/mergers-acquisitions/merger-notifications/m-22-053-dif-talbot-group/"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.preqin.net.cn/news/dif-capital-partners-beats-targets-after-raising-eur6-8bn-for-two-infrastructure-funds",
  }),
  // ── DigitalBridge ──────────────────────────────────────────
  f("FUND-057", "DigitalBridge", "DigitalBridge Partners III", "2022", "$7.2B", 7200, "Value-Add", "Deploying", {
    description: "Verified as a recently closed flagship value-add digital infrastructure fund with a major focus on North American equity. Closed at $7.2 billion with $11.7 billion including co-investments, targeting data centers, fiber, and cell towers.",
    investmentStrategy: "Verified as a recently closed flagship value-add digital infrastructure fund with a major focus on North American equity.",
    sourceUrls: ["https://www.infrastructureinvestor.com/digitalbridge-closes-third-flagship-on-7-2bn/", "https://inforcapital.com/funds/digitalbridge-partners-iii/", "https://ionanalytics.com/insights/infralogic/digitalbridge-fund-nears-final-close-slightly-below-target/"],
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://www.infrastructureinvestor.com/digitalbridge-closes-third-flagship-on-7-2bn/",
  }),
  f("FUND-058", "DigitalBridge", "DigitalBridge Strategic Asset Fund", "2023", "$300M", 300, "Core", "Evergreen", {
    description: "Active evergreen vehicle structured for long-term core digital infrastructure equity acquisitions. Provides permanent capital for DigitalBridge's most stable digital infrastructure holdings.",
    investmentStrategy: "Active evergreen vehicle structured for long-term core digital infrastructure equity acquisitions.",
    sourceUrls: ["https://ionanalytics.com/insights/infralogic/digitalbridge-fund-nears-final-close-slightly-below-target/", "https://ir.digitalbridge.com/node/12376/html"],
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America", "Global"],
    strategyUrl: "https://ir.digitalbridge.com/node/12376/html",
  }),

  // ── Duration Capital ──────────────────────────────────────
  f("FUND-059", "Duration Capital Partners", "Duration Transportation Infrastructure Capital Partners", "2022", "$780M", 780, "Core-Plus", "Evergreen", {
    description: "Active evergreen vehicle dedicated exclusively to buying transportation equity in North America. Michigan Retirement System committed $100M. Focuses on airports, toll roads, and mobility infrastructure with long-duration cash flows.",
    investmentStrategy: "Meets all criteria as an active evergreen vehicle dedicated exclusively to buying transportation equity in North America.",
    sourceUrls: ["https://irei.com/news/michigan-retirement-system-commits-100m-to-duration-transportation-infrastructure-capital-partners/", "https://pitchbook.com/profiles/fund/21718-54F"],
    sectors: ["Transportation"],
    regions: ["North America"],
    strategyUrl: "https://irei.com/news/michigan-retirement-system-commits-100m-to-duration-transportation-infrastructure-capital-partners/",
  }),

  // ── Ember Infrastructure Management ───────────────────────
  f("FUND-060", "Ember Infrastructure Management", "Ember Infrastructure Fund II", "2023", "$831M", 831, "Opportunistic", "Deploying", {
    description: "Active infrastructure equity fund targeting North American middle-market sustainability and energy transition assets. Focuses on waste-to-energy, renewable fuels, and environmental services platforms.",
    investmentStrategy: "Active infrastructure equity fund targeting North American middle-market sustainability and energy transition assets.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/24516-82F", "https://inforcapital.com/funds/ember-infrastructure-fund-ii/", "https://assets.bbhub.io/professional/sites/41/Bloomberg-Infrastructure-Energy-Annual-Report-EOY-2025.pdf"],
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["North America"],
    strategyUrl: "https://inforcapital.com/funds/ember-infrastructure-fund-ii/",
  }),

  // ── EnCap Investments ─────────────────────────────────────
  f("FUND-061", "EnCap Investments", "EnCap Flatrock Midstream Fund V", "2024", "$1.0B", 1000, "Value-Add", "Deploying", {
    description: "Active, closed-end growth equity infrastructure fund focused purely on the North American midstream energy market. EnCap Flatrock targets pipeline, gathering, processing, and transportation assets.",
    investmentStrategy: "Meets all criteria as an active, closed-end growth equity infrastructure fund focused purely on the North American midstream energy market.",
    sourceUrls: ["https://www.encapinvestments.com/about/midstream", "https://www.privateequityinternational.com/institution-profiles/encap-flatrock-midstream.html", "https://www.encapinvestments.com/about/our-story"],
    sectors: ["Midstream / Energy"],
    regions: ["North America"],
    strategyUrl: "https://www.encapinvestments.com/about/midstream",
  }),
  f("FUND-062", "EnCap Investments", "EnCap Energy Transition Fund II", "2022", "$1.5B", 1500, "Value-Add", "Deploying", {
    description: "Active, closed-end equity fund deploying growth capital into energy transition and renewable generation infrastructure in North America. Supported by Oregon Public Employees' Fund.",
    investmentStrategy: "Active, closed-end equity fund deploying growth capital into energy transition and renewable generation infrastructure in North America.",
    sourceUrls: ["https://encapinvestments.com/news/encap-energy-transition-closes-15-billion-energy-transition-fund-ii", "https://www.infrastructureinvestor.com/opf-invests-in-a-new-energy-infrastructure-fund/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://encapinvestments.com/news/encap-energy-transition-closes-15-billion-energy-transition-fund-ii",
  }),
  f("FUND-063", "EnCap Investments", "EnCap Energy Transition Fund III", "2025", "Undisclosed", null, "Value-Add", "Raising", {
    description: "Active successor fund to EnCap's energy transition series, providing infrastructure growth equity across North America. Currently in market raising capital.",
    investmentStrategy: "Active successor fund to EnCap's energy transition series, providing infrastructure growth equity across North America.",
    sourceUrls: ["https://www.realfin.com/fund/36105/encap-energy-transition-fund-iii", "https://www.privateequityinternational.com/institution-profiles/encap-investments.html"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.realfin.com/fund/36105/encap-energy-transition-fund-iii",
  }),

  // ── Energy Capital Partners (ECP) ─────────────────────────
  f("FUND-064", "Energy Capital Partners", "Energy Capital Partners VI", "2024", "$5.0B", 5000, "Core-Plus", "Raising", {
    description: "ECP's flagship core-plus infrastructure fund targeting North American energy, renewables, and decarbonization generation assets. Returned $5.5 billion to investors in 2025, signaling strong deployment track record.",
    investmentStrategy: "ECP's flagship core-plus infrastructure fund targeting North American energy, renewables, and decarbonization generation assets.",
    sourceUrls: ["https://www.privateequitywire.co.uk/energy-capital-partners-returns-5-5bn-to-investors-in-2025/", "https://pitchbook.com/profiles/fund/27050-50F", "https://www.bridgepointgroup.com/content/dam/bridgepoint/corporate2022/documents/financial-information/results_reports_presentations/2025/bridgepoint-interim-results-2025-presentation.pdf.downloadasset.pdf"],
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.privateequitywire.co.uk/energy-capital-partners-returns-5-5bn-to-investors-in-2025/",
  }),
  f("FUND-065", "Energy Capital Partners", "ECP Energy Transition Opportunities Fund", "2021", "$500M", 500, "Opportunistic", "Deploying", {
    description: "Active ECP private equity vehicle dedicated to opportunistic infrastructure investments and decarbonization platforms in North America. Investments include Anza (solar/storage procurement platform) spun out from Borrego.",
    investmentStrategy: "Active ECP private equity vehicle dedicated to opportunistic infrastructure investments and decarbonization platforms in North America.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/19478-89F", "https://radientanalytics.com/firm/adv/ecp-155020", "https://www.businesswire.com/news/home/20230516005316/en/Anza-Completes-Separation-from-Borrego-and-Receives-New-Investment-from-Energy-Capital-Partners-Led-Consortium-to-Transform-Solar-and-Storage-Procurement"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://pitchbook.com/profiles/fund/19478-89F",
  }),

  // ── Energy Infrastructure Partners (EIP) ──────────────────
  f("FUND-066", "Energy Infrastructure Partners", "EIP III (Global Energy Transition Infrastructure)", "2022", "€4.0B", 4400, "Core-Plus", "Deploying", {
    description: "Fund meets all criteria as an active global OECD infrastructure equity vehicle that targets North America as part of its developed economies mandate. Held first close at €1 billion for energy transition infrastructure.",
    investmentStrategy: "Fund meets all criteria as an active global OECD infrastructure equity vehicle that targets North America as part of its developed economies mandate.",
    sourceUrls: ["https://energy-infrastructure-partners.com/wp-content/uploads/2023/11/With-funding-of-EUR-1bn-EIP-holds-first-close-of-its-energy-transition-infrastructure-fund.pdf"],
    sectors: ["Renewables / Energy Transition", "Utilities", "Power Generation"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://energy-infrastructure-partners.com/wp-content/uploads/2023/11/With-funding-of-EUR-1bn-EIP-holds-first-close-of-its-energy-transition-infrastructure-fund.pdf",
  }),

  // ── EQT ───────────────────────────────────────────────────
  f("FUND-067", "EQT", "EQT Infrastructure VI", "2023", "€21.5B", 23650, "Value-Add", "Deploying", {
    description: "EQT's latest flagship infrastructure vehicle, raising €21.5 billion at hard cap — the largest European-headquartered infrastructure fund ever. Targets value-add infrastructure across digital, energy transition, environmental services, and transport in Europe and North America.",
    investmentStrategy: "EQT's latest flagship infrastructure vehicle meets all inclusion criteria given its active status, dedicated North American purview, and value-add equity strategy.",
    sourceUrls: ["https://eqtgroup.com/news/eqt-infrastructure-vi-holds-final-close-at-its-hard-cap-raising-eur-215-billion-in-total-commitments-2025-03-28"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Waste / Environmental Services", "Transportation"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://eqtgroup.com/news/eqt-infrastructure-vi-holds-final-close-at-its-hard-cap-raising-eur-215-billion-in-total-commitments-2025-03-28",
  }),
  f("FUND-068", "EQT", "EQT Active Core Infrastructure I", "2022", "$3.2B", 3200, "Core", "Evergreen", {
    description: "Recently closed core infrastructure fund from EQT with a hybrid/open-ended structure actively deploying capital in North America. Targets essential infrastructure with stable, long-duration cash flows.",
    investmentStrategy: "Recently closed core infrastructure fund from EQT with a hybrid/open-ended structure actively deploying capital in North America.",
    sourceUrls: ["https://eqtgroup.com/news/eqt-active-core-infrastructure-fund-holds-final-close-2024-09-24", "https://eqtgroup.com/infrastructure/eqt-active-core-infrastructure", "https://www.alphaspread.com/security/sto/eqt/investor-relations/earnings-call/q3-2025"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure"],
    regions: ["North America", "Europe"],
    structure: "Open-End",
    strategyUrl: "https://eqtgroup.com/infrastructure/eqt-active-core-infrastructure",
  }),
  f("FUND-069", "EQT", "EQT Transition Infrastructure", "2024", "€4.0B", 4400, "Value-Add", "Raising", {
    description: "Active fund executing equity investments to scale energy transition infrastructure across North America and other developed regions. Targets decarbonization platforms, renewables, and grid modernization.",
    investmentStrategy: "Active fund executing equity investments to scale energy transition infrastructure across North America and other developed regions.",
    sourceUrls: ["https://eqtgroup.com/infrastructure/eqt-transition-infrastructure", "https://www.infrastructureinvestor.com/fubon-life-insurance-makes-e65m-commitment-to-eqt-infrastructure-fund/"],
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://eqtgroup.com/infrastructure/eqt-transition-infrastructure",
  }),
  // ── Fengate Asset Management ───────────────────────────────
  f("FUND-070", "Fengate Asset Management", "Fengate Infrastructure Fund IV", "2021", "$1.1B", 1100, "Value-Add", "Deploying", {
    description: "Fully qualifies as an active, newly closed North American core-plus and value-add infrastructure equity vehicle. Closed above US$1.1 billion target. Fengate targets mid-market infrastructure across energy, transport, and social sectors.",
    investmentStrategy: "Fully qualifies as an active, newly closed North American Core-Plus and Value-Add infrastructure equity vehicle.",
    sourceUrls: ["https://www.globenewswire.com/news-release/2025/01/23/3014203/0/en/Fengate-announces-final-close-of-US-1-1-billion-flagship-infrastructure-fund-above-target.html"],
    sectors: ["Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
    strategies: ["Core-Plus", "Value-Add"],
    strategyUrl: "https://www.globenewswire.com/news-release/2025/01/23/3014203/0/en/Fengate-announces-final-close-of-US-1-1-billion-flagship-infrastructure-fund-above-target.html",
  }),
  f("FUND-071", "Fengate Asset Management", "Fengate Infrastructure Yield Fund", "2019", "C$1.2B+", 888, "Core", "Evergreen", {
    description: "Active, open-ended (evergreen) core infrastructure yield fund acquiring direct equity assets throughout North America. Portfolio includes US wireless communications towers and healthcare facilities.",
    investmentStrategy: "Active, open-ended (evergreen) core infrastructure yield fund acquiring direct equity assets throughout North America.",
    sourceUrls: ["https://gowlingwlg.com/en/people/alan-james", "https://fengate.com/news/fengate-expands-its-portfolio-of-u-s-wireless-communications-towers-with-new-acquisition", "https://fengate.com/news/fengate-asset-management-announces-financial-close-on-two-u-s-healthcare-facilities"],
    sectors: ["Communications", "Social Infrastructure", "Utilities"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://fengate.com/news/fengate-expands-its-portfolio-of-u-s-wireless-communications-towers-with-new-acquisition",
  }),

  // ── Generate Capital ──────────────────────────────────────
  f("FUND-072", "Generate Capital", "Generate Capital Sustainable Infrastructure Fund", "2014", "$1.5B", 1500, "Value-Add", "Evergreen", {
    description: "Active, permanent capital vehicle (evergreen) heavily deploying equity into North American clean energy, mobility, and sustainable infrastructure. Latest raise brought in $1.5 billion for continued expansion.",
    investmentStrategy: "Active, permanent capital vehicle (evergreen) heavily deploying equity into North American clean energy, mobility, and sustainable infrastructure.",
    sourceUrls: ["https://www.esgtoday.com/generate-capital-raises-1-5-billion-for-sustainable-infrastructure-investments/", "https://globalfintechseries.com/fintech/generate-capital-closed-capital-raise-with-1-5-billion/"],
    sectors: ["Renewables / Energy Transition", "Transportation", "Water"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategies: ["Value-Add", "Opportunistic"],
    strategyUrl: "https://www.esgtoday.com/generate-capital-raises-1-5-billion-for-sustainable-infrastructure-investments/",
  }),
  f("FUND-073", "Generate Capital", "Generate Capital (Permanent Capital Vehicle)", "2014", "$10.0B+", 10000, "Value-Add", "Evergreen", {
    description: "Massive permanent capital/evergreen firm that actively acquires, builds, and manages direct infrastructure equity assets natively across North America. Recently raised over $1 billion for infrastructure credit solutions, expanding its sustainable infrastructure platform.",
    investmentStrategy: "Massive permanent capital/evergreen firm that actively acquires, builds, and manages direct infrastructure equity assets natively across North America.",
    sourceUrls: ["https://www.esgtoday.com/generate-capital-raises-1-5-billion-for-sustainable-infrastructure-investments/", "https://mcj.vc/inevitable-podcast/scott-jacobs", "https://www.prnewswire.com/news-releases/generate-capital-raises-over-1-billion-to-expand-infrastructure-credit-solutions-302607095.html"],
    sectors: ["Renewables / Energy Transition", "Transportation", "Water", "Waste / Environmental Services"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.prnewswire.com/news-releases/generate-capital-raises-over-1-billion-to-expand-infrastructure-credit-solutions-302607095.html",
  }),

  // ── GIC ───────────────────────────────────────────────────
  f("FUND-074", "GIC", "GIC Infrastructure", "1981", "$744B", 744000, "Core", "Evergreen", {
    description: "Captive direct-investing arm of Singapore's sovereign wealth fund with a clear mandate and track record of acquiring core North American infrastructure equity. Recently increased infrastructure allocation and invested alongside EQT in Reworld (waste-to-energy).",
    investmentStrategy: "Captive direct-investing arm of a global SWF with a clear mandate and track record of acquiring Core North American infrastructure equity.",
    sourceUrls: ["https://www.gic.com.sg/thinkspace/investment-strategies/infrastructure-a-resilient-strategy-in-uncertain-times/", "https://www.privateequityinternational.com/side-letter-gics-allocation-uplift/", "https://eqtgroup.com/news/eqt-broadens-reworld-investor-base-welcoming-gic-as-strategic-investor-2024-10-02/"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    structure: "Permanent Capital",
    strategies: ["Core", "Core-Plus"],
    strategyUrl: "https://www.gic.com.sg/thinkspace/investment-strategies/infrastructure-a-resilient-strategy-in-uncertain-times/",
  }),

  // ── GIP/MGX/Microsoft ─────────────────────────────────────
  f("FUND-075", "Global Infrastructure Partners (BlackRock)", "AI Infrastructure Partnership (AIP)", "2024", "$30.0B", 12500, "Value-Add", "Evergreen", {
    description: "Active, open-ended direct investment infrastructure partnership specifically designed to acquire and build U.S. data centers and energy grid elements. Partnership between GIP (BlackRock), MGX, and Microsoft, with NVIDIA and xAI as additional partners. Raised $12.5 billion toward $30 billion target. Recently acquiring all equity in Aligned Data Centers.",
    investmentStrategy: "Qualifies as an active, open-ended (\"evergreen\") direct investment infrastructure partnership specifically designed to acquire and build U.S. data centers and energy grid elements.",
    sourceUrls: ["https://www.infrastructureinvestor.com/the-pipeline-gip-reaches-12-5bn-on-ai-fund-stonepeaks-ir-lead-down-under-kkr-forms-15bn-offshore-jv/", "https://ir.blackrock.com/news-and-events/press-releases/press-releases-details/2025/BlackRock-Global-Infrastructure-Partners-Microsoft-and-MGX-Welcome-NVIDIA-and-xAI-to-the-AI-Infrastructure-Partnership-to-Drive-Investment-in-Data-Centers-and-Enabling-Infrastructure/default.aspx", "https://www.global-infra.com/news/ai-infrastructure-partnership-aip-mgx-and-blackrocks-global-infrastructure-partners-gip-to-acquire-all-equity-in-aligned-data-centers/"],
    sectors: ["Digital Infrastructure", "Power Generation", "Utilities"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://ir.blackrock.com/news-and-events/press-releases/press-releases-details/2025/BlackRock-Global-Infrastructure-Partners-Microsoft-and-MGX-Welcome-NVIDIA-and-xAI-to-the-AI-Infrastructure-Partnership-to-Drive-Investment-in-Data-Centers-and-Enabling-Infrastructure/default.aspx",
  }),

  // ── Global Infrastructure Partners (BlackRock) ────────────
  f("FUND-076", "Global Infrastructure Partners (BlackRock)", "Global Infrastructure Partners V (GIP V)", "2022", "$25.2B", 25200, "Core-Plus", "Deploying", {
    description: "Fully verified active mega-cap global infrastructure equity fund that strongly targets North America. Deploys $1-3B equity checks with 15-20% gross return targets. Portfolio highlights include Columbia Pipelines (40% stake), Rio Grande LNG, Allete (US utility), and Hutchison Ports. Over 40 portfolio companies generating $75+ billion in annual revenue.",
    investmentStrategy: "Fully verified active mega-cap global infrastructure equity fund that strongly targets North America.",
    sourceUrls: ["https://inforcapital.com/funds/global-infrastructure-partners-v-gip-fund-v/"],
    sectors: ["Transportation", "Utilities", "Power Generation", "Digital Infrastructure", "Midstream / Energy"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://inforcapital.com/funds/global-infrastructure-partners-v-gip-fund-v/",
  }),
  f("FUND-077", "Global Infrastructure Partners (BlackRock)", "GIP Mid-Market Fund V", "2025", "$7.0B", 7000, "Value-Add", "Raising", {
    description: "Active North America/Global focused equity fund under BlackRock/GIP targeting mid-market scale assets. Rebranded following BlackRock's acquisition of GIP in October 2024.",
    investmentStrategy: "Qualifies as an active North America/Global focused equity fund under BlackRock/GIP targeting mid-market scale assets.",
    sourceUrls: ["https://www.infrastructureinvestor.com/gip-to-seek-7bn-for-rebranded-mid-market-fund-exclusive", "https://pitchbook.com/profiles/fund/28343-44F"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
    strategyUrl: "https://www.infrastructureinvestor.com/gip-to-seek-7bn-for-rebranded-mid-market-fund-exclusive",
  }),
  f("FUND-078", "Global Infrastructure Partners (BlackRock)", "Global Infrastructure Partners Core Fund", "2022", "$5.0B", 5000, "Core", "Raising", {
    description: "Active core-focused infrastructure equity fund with geographic coverage of North America. Targets long-duration, contracted assets with stable cash yields.",
    investmentStrategy: "Qualifies as an active core-focused infrastructure equity fund with geographic coverage of North America.",
    sourceUrls: ["https://www.sib.wa.gov/docs/meetings/board/22_1215final.pdf", "https://pitchbook.com/profiles/fund/23624-02F"],
    sectors: ["Utilities", "Transportation", "Power Generation"],
    regions: ["North America", "Global"],
    strategyUrl: "https://www.sib.wa.gov/docs/meetings/board/22_1215final.pdf",
  }),

  // ── Goldman Sachs Alternatives ────────────────────────────
  f("FUND-079", "Goldman Sachs Alternatives", "West Street Infrastructure Partners V (WSIP V)", "2024", "$4.0B", 4000, "Value-Add", "Raising", {
    description: "Active, flagship closed-end infrastructure equity fund with an explicit mandate to invest across North America. Goldman Sachs targets mid-market infrastructure platforms across digital, energy, and transport sectors.",
    investmentStrategy: "Active, flagship closed-end infrastructure equity fund with an explicit mandate to invest across North America.",
    sourceUrls: ["https://ionanalytics.com/insights/infralogic/goldman-sachs-west-street-v-fundraise-gains-traction/"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America", "Global"],
    strategies: ["Core-Plus", "Value-Add"],
    strategyUrl: "https://ionanalytics.com/insights/infralogic/goldman-sachs-west-street-v-fundraise-gains-traction/",
  }),
  f("FUND-080", "Goldman Sachs Alternatives", "West Street Infrastructure Partners IV (WSIP IV)", "2021", "$4.0B", 4000, "Value-Add", "Deploying", {
    description: "A 2023-vintage global closed-end infrastructure fund actively acquiring value-add infrastructure platforms across North America. Raised $4 billion for direct equity investments in infrastructure assets.",
    investmentStrategy: "A 2023-vintage global closed-end infrastructure fund actively acquiring value-add infrastructure platforms across North America.",
    sourceUrls: ["https://am.gs.com/en-gb/advisors/news/press-release/2023/goldman-sachs-asset-management-raises-4-billion-for-west-street-infrastructure-partners-iv"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America", "Global"],
    strategyUrl: "https://am.gs.com/en-gb/advisors/news/press-release/2023/goldman-sachs-asset-management-raises-4-billion-for-west-street-infrastructure-partners-iv",
  }),
  f("FUND-081", "Goldman Sachs Alternatives", "West Street Private Infrastructure Fund (G-INFRA)", "2025", "$300M", 300, "Value-Add", "Evergreen", {
    description: "A recently launched evergreen fund vehicle actively acquiring mid-market infrastructure equity globally, including the US, aimed at private wealth clients. Part of Goldman Sachs' expanding alternatives distribution to wealth channels.",
    investmentStrategy: "A recently launched evergreen fund vehicle actively acquiring mid-market infrastructure equity globally, including the US, aimed at private wealth clients.",
    sourceUrls: ["https://am.gs.com/en-be/advisors/news/press-release/2025/g-infra-launch", "https://cdn.prod.website-files.com/665f05e4b0db845a831c93c0/68a7ce1cc0f71718b31114d6_West%20Street%20Private%20Infrastructure%20Fund%20(AUD)%20Class%20A%20-%20June%202025.pdf", "https://cdn.prod.website-files.com/665f05e4b0db845a831c93c0/694b643224eb1c73eade638e_West%20Street%20Private%20Infrastructure%20Fund%20(AUD)%20Class%20A%20-%20October%202025.pdf"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["Global", "North America"],
    strategies: ["Core-Plus", "Value-Add"],
    strategyUrl: "https://am.gs.com/en-be/advisors/news/press-release/2025/g-infra-launch",
  }),
  // ── H.I.G. Capital ─────────────────────────────────────────
  f("FUND-082", "H.I.G. Capital", "H.I.G. Infrastructure Partners Fund I", "2021", "$1.3B", 1300, "Value-Add", "Deploying", {
    description: "A 2024-vintage dedicated private equity infrastructure fund actively targeting NA/EU middle-market assets. Raised $1.3 billion for infrastructure investments spanning energy, transport, and environmental services.",
    investmentStrategy: "Targets middle-market infrastructure equity investments across energy (clean and renewable), transportation, and telecommunications in North America and Europe, applying a value-add and core-plus approach that leverages H.I.G.'s operational expertise to reposition and grow assets. Pursues control-oriented stakes in 12–15 companies with a strong orientation toward low-carbon and sustainable infrastructure.",
    sourceUrls: ["https://hig.com/news/h-i-g-capital-raises-1-3-billion-for-infrastructure-fund/"],
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities"],
    regions: ["North America", "Europe"],
    strategies: ["Core-Plus", "Value-Add"],
    strategyUrl: "https://hig.com/news/h-i-g-capital-raises-1-3-billion-for-infrastructure-fund/",
  }),

  // ── Harbert Management Corporation ────────────────────────
  f("FUND-083", "Harbert Management Corporation", "Harbert Infrastructure Fund VI", "2019", "$905M", 905, "Core-Plus", "Deploying", {
    description: "Classic closed-end primary infrastructure equity fund strictly focused on North American power generation and renewables. Closed at $905M, targeting operational power and energy assets.",
    investmentStrategy: "Lower-middle-market fund focused on power and energy infrastructure assets in North America, targeting contracted cash flows across renewable energy, dispatchable generation, and distributed generation. Applies an active asset management approach capitalizing on the decarbonization and electrification transition underway in U.S. power markets.",
    sourceUrls: ["https://www.globenewswire.com/news-release/2022/10/06/2529666/0/en/Harbert-Infrastructure-Fund-VI-LP-Announces-Final-Close.html"],
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.globenewswire.com/news-release/2022/10/06/2529666/0/en/Harbert-Infrastructure-Fund-VI-LP-Announces-Final-Close.html",
  }),

  // ── Harrison Street ───────────────────────────────────────
  f("FUND-084", "Harrison Street", "Harrison Street Social Infrastructure Fund", "2018", "$2.45B", 2450, "Core-Plus", "Evergreen", {
    description: "An active, open-ended/evergreen vehicle focused on public-private partnership (P3) infrastructure equity across North America. Targets education, healthcare, and government services infrastructure.",
    investmentStrategy: "Open-ended core infrastructure vehicle targeting highly structured investments in critical assets serving universities, health systems, and government entities, including campus housing, renewable energy, district energy systems, and P3 buildings. Focuses on the lower-to-middle market in North America with long-term contracted revenues (typically 10–45 year weighted average durations), targeting gross returns of 8–10%.",
    sourceUrls: ["https://www.sec.gov/Archives/edgar/data/1744140/000174414023000002/xslFormDX01/primary_doc.xml", "https://www.harrisonst.com/wp-content/uploads/2020/05/HSRE_ESG-Impact_2019.pdf", "https://irei.com/news/harrison-street-launches-open-end-social-infrastructure-fund/"],
    sectors: ["Social Infrastructure"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://irei.com/news/harrison-street-launches-open-end-social-infrastructure-fund/",
  }),
  f("FUND-085", "Harrison Street", "Harrison Street Energy Transition Fund", "2023", "$750M", 750, "Value-Add", "Raising", {
    description: "Primary closed-ended fund established in 2023 targeting value-add energy transition and renewable asset equity in North America.",
    investmentStrategy: "Closed-end vehicle targeting clean and renewable energy infrastructure in North America, building on Harrison Street's social infrastructure franchise with a focus on decarbonization-driven opportunities such as solar, storage, and other clean energy assets in the lower-to-mid-market energy transition space.",
    sourceUrls: ["https://www.infrastructureinvestor.com/harrison-street-to-launch-750m-energy-transition-fund-exclusive/"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/harrison-street-to-launch-750m-energy-transition-fund-exclusive/",
  }),
  f("FUND-086", "Harrison Street", "Harrison Street Digital Fund", "2024", "$600M", 600, "Value-Add", "Deploying", {
    description: "Newly closed dedicated digital infrastructure fund acquiring North American data center and telecommunications equity. Raised $600 million for data center and connectivity investments.",
    investmentStrategy: "Focuses exclusively on digital infrastructure development in U.S. markets, deploying capital into data center campuses, powered shells, colocation facilities, carrier hotels, and dark fiber networks. Takes a primary development orientation — targeting new builds with hyperscale and enterprise tenants — leveraging five operating partnerships to access the full digital ecosystem.",
    sourceUrls: ["https://harrisonst.com/harrison-street-closes-600-million-for-digital-asset-investments/"],
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America"],
    strategyUrl: "https://harrisonst.com/harrison-street-closes-600-million-for-digital-asset-investments/",
  }),

  // ── I Squared Capital ─────────────────────────────────────
  f("FUND-087", "I Squared Capital", "ISQ Global Infrastructure Fund IV", "2024", "$15.0B", 15000, "Value-Add", "Raising", {
    description: "Active global infrastructure equity fund targeting value-add investments across North America. ATRS committed $75M. One of the largest infrastructure funds globally targeting digital, energy, and transport assets.",
    investmentStrategy: "Global value-add strategy targeting middle-market infrastructure assets across power and utilities, digital, transport and logistics, social, and environmental infrastructure, with a primary focus on OECD markets and up to 25% in select growth economies. Deploys capital through build-and-scale platform roll-ups and larger opportunistic acquisitions, growing small platforms into scaled infrastructure businesses.",
    sourceUrls: ["https://www.infrastructureinvestor.com/atrs-commits-75m-to-infrastructure/"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Utilities"],
    regions: ["Global", "North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/atrs-commits-75m-to-infrastructure/",
  }),
  f("FUND-088", "I Squared Capital", "ISQ Energy Transition Infrastructure Fund", "2023", "$719M", 719, "Value-Add", "Deploying", {
    description: "An active, dedicated energy transition equity vehicle making controlling investments in OECD countries including the US. SFDR Article 9 fund. Recently acquired Oregon's premier renewable fuels terminal.",
    investmentStrategy: "Dedicated SFDR Article 9 vehicle focused on accelerating the shift to renewable and low-carbon energy, investing in mid-sized platform companies across renewables generation, battery storage, grid stability, clean fuels (including renewable diesel and SAF), distributed generation, and electrification of transport, primarily in North America and Europe.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/23895-19F", "https://www.fundrock-lis.com/media/a2njuroq/isq-etf-sfdr-level-2-article-9-website-disclosures_weil.pdf", "https://www.businesswire.com/news/home/20251216019924/en/I-Squared-Capital-Accelerates-U.S.-Energy-Transition-with-Acquisition-of-Oregons-Premier-Renewable-Fuels-Terminal"],
    sectors: ["Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.businesswire.com/news/home/20251216019924/en/I-Squared-Capital-Accelerates-U.S.-Energy-Transition-with-Acquisition-of-Oregons-Premier-Renewable-Fuels-Terminal",
  }),

  // ── ICON Infrastructure ───────────────────────────────────
  f("FUND-089", "ICON Infrastructure", "iCON Infrastructure Partners VII", "2025", "$3.7B", 3700, "Core-Plus", "Deploying", {
    description: "ICON VII is a recently closed, active mid-market core-plus fund focusing on North American and European infrastructure equity. Targets essential services infrastructure across utilities, digital, and transport.",
    investmentStrategy: "Core-to-core-plus fund targeting privately held, mid-market infrastructure businesses in Europe and North America across transport, utilities, telecoms, energy and environment, and social infrastructure, with added emphasis on renewable energy and waste management. Targets approximately 15 brownfield transactions over 6–10 year hold periods, combining active asset management with board-level governance, targeting low double-digit net IRRs.",
    sourceUrls: ["https://iconinfrastructure.com/", "https://inforcapital.com/funds/icon-infrastructure-partners-vii-icon-vii/"],
    sectors: ["Utilities", "Digital Infrastructure", "Transportation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://inforcapital.com/funds/icon-infrastructure-partners-vii-icon-vii/",
  }),

  // ── IFM Investors ─────────────────────────────────────────
  f("FUND-090", "IFM Investors", "IFM Global Infrastructure Fund (GIF)", "2004", "$73.6B", 73600, "Core", "Evergreen", {
    description: "IFM's massive global flagship core equity platform, heavily active in the North American infrastructure space. Manages $73.6B for 812 institutional investors. US portfolio includes Indiana Toll Road ($5.7B acquisition), Buckeye Partners ($10.3B — 5,000+ miles of pipeline, 130M barrels storage), Colonial Pipeline, Freeport LNG, Swift Current Energy, and Switch (data centers).",
    investmentStrategy: "Large open-ended core infrastructure fund investing in essential, monopoly-like assets with strong market positions, high barriers to entry, and predictable cash flows in OECD developed markets — principally North America, the UK and Europe, and Australia. Focused on transportation, energy midstream, communications, and utilities, pursuing a long-term hold-and-manage strategy with opportunistic exits.",
    sourceUrls: ["https://outside.vermont.gov/dept/VPIC/Shared%20Documents/VPIC%20Website/Meetings/VPIC%20General%20Meetings/Meeting%20Materials/2022/09-27-2022/2022-09%20IFM%20GIF%20Recommendation%20vF%20(Redacted).pdf", "https://pitchbook.com/profiles/fund/13416-94F"],
    sectors: ["Transportation", "Utilities", "Midstream / Energy", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    structure: "Open-End",
    strategyUrl: "https://outside.vermont.gov/dept/VPIC/Shared%20Documents/VPIC%20Website/Meetings/VPIC%20General%20Meetings/Meeting%20Materials/2022/09-27-2022/2022-09%20IFM%20GIF%20Recommendation%20vF%20(Redacted).pdf",
  }),
  f("FUND-091", "IFM Investors", "IFM Net Zero Infrastructure Fund (NZIF)", "2022", "$3.0B", 3000, "Core-Plus", "Evergreen", {
    description: "Active, evergreen infrastructure equity platform driving the energy transition across North America. Recently completed acquisition of GreenGas, a US renewable natural gas developer and operator.",
    investmentStrategy: "Open-ended core infrastructure fund investing in assets that directly accelerate the global energy transition, targeting renewable energy, low-carbon fuels (including renewable natural gas), climate tech, and cleantech infrastructure globally. Invests up to $500M per opportunity and prioritizes assets with measurable real-world emissions reduction impact.",
    sourceUrls: ["https://sfrhctf.org/wp-content/uploads/2023/05/Private-Market-Spacing-Study-V2.pdf", "https://www.ifminvestors.com/news-and-insights/media-centre/ifm-net-zero-infrastructure-fund-completes-greengas-acquisition-marking-next-era-of-growth-for-renewable-energy-company/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Global"],
    strategyUrl: "https://www.ifminvestors.com/news-and-insights/media-centre/ifm-net-zero-infrastructure-fund-completes-greengas-acquisition-marking-next-era-of-growth-for-renewable-energy-company/",
  }),
  f("FUND-092", "IFM Investors", "IFM Global Value Add Infrastructure Fund", "2025", "$2.5B", 2500, "Value-Add", "Raising", {
    description: "Newly active global fund pursuing higher-yielding value-add infrastructure equity, bringing its deployment purview over North America. IFM's first dedicated value-add vehicle.",
    investmentStrategy: "IFM's first dedicated move beyond its traditional core mandate, targeting mid-market and growth-stage infrastructure assets at the intersection of infrastructure and private equity across global markets, with particular focus on digitalization, decarbonization, and deglobalization themes. Pursues buy-and-build, operational improvement, and platform consolidation in sectors such as digital infrastructure, grid modernization, and energy transition.",
    sourceUrls: ["https://ionanalytics.com/insights/infralogic/ifm-prepares-first-global-value-add-infra-fund/"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    strategyUrl: "https://ionanalytics.com/insights/infralogic/ifm-prepares-first-global-value-add-infra-fund/",
  }),
  // ── Igneo Infrastructure Partners (First Sentier) ──────────
  f("FUND-093", "Igneo Infrastructure Partners", "North American Diversified Infrastructure Fund (NADIF)", "2024", "$1.0B", 1000, "Core-Plus", "Deploying", {
    description: "NADIF is a recently launched, active closed-end core-plus infrastructure equity fund managed by Igneo specifically dedicated to the North American market. Texas ERS committed $100M. Debuted with an aviation infrastructure acquisition.",
    investmentStrategy: "Closed-end, core-plus vehicle targeting mid-market infrastructure companies in the United States and Canada across commercial transportation, energy, communications, and networking sectors. Applies Igneo's established proactive asset management approach — securing lead or sole ownership positions to drive operational value creation — as the firm's dedicated North American regional strategy.",
    sourceUrls: ["https://irei.com/news/texas-ers-pours-100m-into-igneo-chambers-energy-funds/", "https://www.infrastructureinvestordeals.com/deals/igneo-makes-debut-north-american-strategy-investment-with-aviation-acquisition"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure"],
    regions: ["North America"],
    strategyUrl: "https://irei.com/news/texas-ers-pours-100m-into-igneo-chambers-energy-funds/",
  }),
  f("FUND-094", "Igneo Infrastructure Partners", "Global Diversified Infrastructure Fund (GDIF)", "2007", "$7.5B+", 7500, "Core", "Evergreen", {
    description: "GDIF is a robust, open-ended global core infrastructure equity fund proactively building its presence across North American asset operations. Manages $7.5B+ across utilities, transport, and essential services. Recently invested in Recycle Central Group.",
    investmentStrategy: "Open-ended, core-plus vehicle investing in high-quality, mature, mid-market infrastructure companies across OECD countries in the UK, Europe, North America, and Australia/New Zealand, targeting renewables, digital infrastructure, waste management, water utilities, and transportation. Typically holds controlling or lead positions for the long term — some in excess of 25 years — creating value through proactive asset management and ESG integration.",
    sourceUrls: ["https://www.infrastructureinvestor.com/gilchrist-igneo-a-clean-sheet-of-paper-in-terms-of-opportunity/", "https://www.land.nd.gov/sites/www/files/documents/Board%20Agenda%20Packets/1%20-%2010%20-%20October%2028%202021%20Full%20Agenda%20Packet.pdf", "https://www.igneoip.com/australia/en/institutional/news-and-insights/press/igneo-invests-in-recycle-central-group.html"],
    sectors: ["Transportation", "Utilities", "Waste / Environmental Services"],
    regions: ["Global", "North America", "Europe", "Asia-Pacific"],
    structure: "Open-End",
    strategyUrl: "https://www.infrastructureinvestor.com/gilchrist-igneo-a-clean-sheet-of-paper-in-terms-of-opportunity/",
  }),

  // ── InfraBridge (DigitalBridge) ───────────────────────────
  f("FUND-095", "InfraBridge", "InfraBridge Global Infrastructure Fund III (GIF III)", "2022", "$4.75B", 4750, "Value-Add", "Deploying", {
    description: "An active mid-market value-add infrastructure strategy targeting North America that was recently integrated into the InfraBridge platform under DigitalBridge's AMP International franchise.",
    investmentStrategy: "Targets the value-add, mid-market infrastructure segment in North America and Europe, focusing on transportation and logistics, digital infrastructure (including fiber, towers, and data centers), and energy transition. Applies private-equity-style rigor to asset management and operational improvement, continuing the strategy established under AMP Capital before rebranding to InfraBridge.",
    sourceUrls: ["https://dgtlinfra.com/digitalbridge-amp-international-infrastructure-equity/"],
    sectors: ["Digital Infrastructure", "Transportation", "Utilities"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://dgtlinfra.com/digitalbridge-amp-international-infrastructure-equity/",
  }),

  // ── InfraRed Capital Partners ─────────────────────────────
  f("FUND-096", "InfraRed Capital Partners", "InfraRed Infrastructure Fund VI", "2022", "$1.0B+", 1000, "Value-Add", "Deploying", {
    description: "Active closed-end fund targeting value-add mid-market infrastructure equity in North America and Western Europe. Reached $1 billion final close for sixth flagship vehicle.",
    investmentStrategy: "Value-add strategy in the lower mid-market across North America and Western Europe, targeting essential infrastructure in energy transition, digital, and transport sectors at early to growth stages, with an emphasis on creating and de-risking assets into cash-generating platforms. Typically invests $100–200M per company, working closely with management teams through active asset management.",
    sourceUrls: ["https://www.ircp.com/news/infrared-capital-partners-announces-1-billion-close-for-sixth-value-add-fund/", "https://www.infrastructureinvestor.com/infrared-in-1bn-final-close-for-sixth-flagship-exclusive/"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.ircp.com/news/infrared-capital-partners-announces-1-billion-close-for-sixth-value-add-fund/",
  }),
  f("FUND-097", "InfraRed Capital Partners", "InfraRed Infrastructure Fund VII", "2025", "$1.5B", 1500, "Value-Add", "Raising", {
    description: "Active successor fund currently raising capital to make direct value-add infrastructure equity investments in North America. Targets $1.5 billion for mid-market infrastructure.",
    investmentStrategy: "Continues InfraRed's lower-mid-market value-add strategy targeting essential infrastructure across OECD markets in North America and Western Europe, with a focus on transport, energy transition, digital infrastructure, and social infrastructure. Each investment typically ranges between $100–200M, deploying active development and construction expertise alongside in-house asset management.",
    sourceUrls: ["https://irei.com/news/infrared-seeks-1-5b-for-seventh-value-add-infrastructure-fund/", "https://ionanalytics.com/insights/infralogic/infrared-readies-usd-1-5bn-seventh-infra-fund/", "https://www.infrastructureinvestor.com/the-pipeline-infravia-reaches-e5bn-infra-steadies-omers-ship-equitix-leads-500m-storage-push/"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://irei.com/news/infrared-seeks-1-5b-for-seventh-value-add-infrastructure-fund/",
  }),
  f("FUND-098", "InfraRed Capital Partners", "HICL Infrastructure PLC", "2006", "£3.0B", 3900, "Core", "Evergreen", {
    description: "HICL is an actively managed, publicly listed permanent capital infrastructure vehicle that acquires core infrastructure equity globally, including in North America. Managed by InfraRed, recently moved domicile.",
    investmentStrategy: "London-listed, open-ended core infrastructure investment company focused primarily on PPP/PFI projects, regulated assets (electricity and gas networks, water utilities), and demand-based transport concessions across the UK (~66% of portfolio), with additional exposure in Europe, North America, and Australia. Targets stable, inflation-linked income from a diversified portfolio of over 100 essential assets at the lower end of the infrastructure risk spectrum.",
    sourceUrls: ["https://www.dcfmodeling.com/blogs/history/hicll-history-mission-ownership", "https://www.ircp.com/news/hicl-infrastructure-plc-move-domicile/"],
    sectors: ["Social Infrastructure", "Utilities", "Transportation"],
    regions: ["Global", "North America", "Europe"],
    structure: "Listed / Evergreen",
    ticker: "HICL.L",
    strategyUrl: "https://www.ircp.com/news/hicl-infrastructure-plc-move-domicile/",
  }),
  f("FUND-099", "InfraRed Capital Partners", "North American Core Income Energy Transition Fund", "2023", "$900M", 900, "Core", "Evergreen", {
    description: "Active evergreen platform explicitly dedicated to acquiring core income-producing North American energy transition equity. Targets operational renewable and clean energy assets with contracted revenues.",
    investmentStrategy: "Core income strategy targeting contracted, decarbonization-oriented renewable energy infrastructure in North America, seeded with $400M from Sun Life and launched following InfraRed's partnership with SLC Management. Focuses on operational wind and solar generation assets, applying InfraRed's renewable energy expertise to generate stable, income-producing returns from the clean energy transition.",
    sourceUrls: ["https://www.infrastructureinvestor.com/infrared-in-1bn-final-close-for-sixth-flagship-exclusive/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/infrared-in-1bn-final-close-for-sixth-flagship-exclusive/",
  }),

  // ── InfraVia Capital Partners ─────────────────────────────
  f("FUND-100", "InfraVia Capital Partners", "InfraVia European Fund VI", "2023", "€8.0B", 8800, "Value-Add", "Deploying", {
    description: "Despite the European branding, official US LP board memos confirm the fund is legally mandated to invest in infrastructure across both Europe and North America. LACERA committed to the fund.",
    investmentStrategy: "Core-plus fund targeting mid-market infrastructure companies across Europe in energy and the energy transition, digital infrastructure, mobility, and social infrastructure, combining resilient contracted cash flows with active value creation. Closed at its €8B hard cap — the largest in the firm's history — reflecting strong demand for InfraVia's differentiated European mid-market approach.",
    sourceUrls: ["https://www.infrastructureinvestor.com/infravia-raises-e8bn-for-latest-european-infra-fund-exclusive/", "https://www.lacera.gov/sites/default/files/assets/documents/board/2024/BOI/2024-11-13-boi_agnd.pdf"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["Europe", "North America"],
    strategies: ["Core-Plus", "Value-Add"],
    strategyUrl: "https://www.infrastructureinvestor.com/infravia-raises-e8bn-for-latest-european-infra-fund-exclusive/",
  }),

  // ── IMCO ──────────────────────────────────────────────────
  f("FUND-101", "Investment Management Corporation of Ontario (IMCO)", "IMCO Infrastructure Fund", "2016", "C$11.3B", 8249, "Core-Plus", "Evergreen", {
    description: "Active captive permanent capital platform making direct infrastructure equity investments primarily in North America. C$11.3 billion infrastructure portfolio as of 2024. Strategic focus on digitalization and connectivity infrastructure.",
    investmentStrategy: "Direct infrastructure portfolio targeting global core and core-plus assets across digital infrastructure (data centers, fiber, towers), regulated utilities (including electrification-linked networks), and clean energy transition, with geographic diversification spanning North America, the UK and Europe, and Latin America. Pursues both direct investments and fund co-investments, prioritizing high-quality businesses with strong contracted cash flows and barriers to entry.",
    sourceUrls: ["https://www.imcoinvest.com/news/imco-annual-report-2024.html", "https://www.top1000funds.com/asset_owner/investment-management-corporation-of-ontario-imco/", "https://www.top1000funds.com/2025/07/imco-reconsiders-us-exposure-as-geopolitical-landscape-shifts/", "https://www.imcoinvest.com/articles/strategic-approach-to-digitalization-and-connectivity.html"],
    sectors: ["Digital Infrastructure", "Transportation", "Utilities", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.imcoinvest.com/news/imco-annual-report-2024.html",
  }),

  // ── J.P. Morgan Asset Management ──────────────────────────
  f("FUND-102", "J.P. Morgan Asset Management", "Infrastructure Investments Fund (IIF)", "2007", "$41.0B", 41000, "Core", "Evergreen", {
    description: "An active, mature open-ended infrastructure equity fund heavily deployed across North American utility, transport, and energy sectors. One of the largest core infrastructure funds globally with $41 billion in assets.",
    investmentStrategy: "Large open-ended core and core-plus infrastructure fund targeting essential service companies in energy, water, and transportation with predictable contracted or regulated cash flows, primarily in the United States, Western Europe, and Australia. Pursues control or majority positions across 20+ companies and 800+ assets, targeting net returns of 8–12% and annual cash yield of 5–7%, with a platform-building approach that aggregates middle-market assets outside competitive auctions.",
    sourceUrls: ["https://www.cincinnati-oh.gov/sites/retirement/assets/Committee%20Meetings/Investment/Packet/2025/Investment-Packet-5-1-25.pdf"],
    sectors: ["Utilities", "Transportation", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe"],
    structure: "Open-End",
    strategyUrl: "https://www.cincinnati-oh.gov/sites/retirement/assets/Committee%20Meetings/Investment/Packet/2025/Investment-Packet-5-1-25.pdf",
  }),
  f("FUND-103", "J.P. Morgan Asset Management", "Global Transport Income Fund (GTIF)", "2017", "$4.07B", 4070, "Core", "Evergreen", {
    description: "Specialized core open-ended real asset fund driving direct equity investments into transportation infrastructure networks globally. Targets airports, toll roads, ports, and rail assets.",
    investmentStrategy: "Income-oriented infrastructure fund focused on generating current income from assets and businesses across global transportation industries, investing through a master fund structure targeting diversified exposure to the transport sector across geographies including airports, toll roads, ports, and rail assets.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/16687-45F", "https://am.jpmorgan.com/content/dam/jpm-am-aem/emea/gb/en/regulatory/annual-and-half-year-reports/global-core-real-ar-2023.pdf", "https://www.formds.com/issuers/global-transport-income-fund-master-partnership-scsp"],
    sectors: ["Transportation"],
    regions: ["Global", "North America", "Europe"],
    structure: "Open-End",
    strategyUrl: "https://am.jpmorgan.com/content/dam/jpm-am-aem/emea/gb/en/regulatory/annual-and-half-year-reports/global-core-real-ar-2023.pdf",
  }),
  // ── Kimmeridge ─────────────────────────────────────────────
  f("FUND-104", "Kimmeridge", "Kimmeridge Carbon Solutions Fund II", "2024", "Undisclosed", null, "Opportunistic", "Deploying", {
    description: "Kimmeridge's newest vehicle targeting direct placements into U.S.-based decarbonization assets and energy transition infrastructure projects. Partners with Storegga on CCUS projects and has interests in LNG infrastructure.",
    investmentStrategy: "Buyout-style fund investing in the decarbonization segment of the North American energy sector, targeting carbon capture and storage (CCUS) projects, carbon markets (including forest carbon offsets), clean fuels, and integrated natural gas infrastructure with certified low-emission credentials. Leverages Kimmeridge's subsurface geotechnical expertise and land aggregation capabilities to develop large-scale CCUS initiatives.",
    sourceUrls: ["https://disclosurequest.com/results?search_form%5Bcik%5D=0002035811", "https://www.prnewswire.com/news-releases/kimmeridge-carbon-solutions-and-storegga-partner-to-advance-ccus-projects-301999822.html", "https://www.energy.gov/sites/default/files/2024-10/Commonwealth%20LNG%20LLC%20%28Docket%20No.%2019-134%29%20-%20Supplement%20to%20Notice%20of%20Change%20in%20Control%20and%20Amendment%20to%20Pending%20Application.pdf"],
    sectors: ["Midstream / Energy", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.prnewswire.com/news-releases/kimmeridge-carbon-solutions-and-storegga-partner-to-advance-ccus-projects-301999822.html",
  }),

  // ── KKR ───────────────────────────────────────────────────
  f("FUND-105", "KKR", "KKR Global Infrastructure Investors V", "2024", "$20.0B", 15000, "Value-Add", "Raising", {
    description: "KKR's massive, active flagship fund making control/co-control value-add infrastructure investments across North America and Europe. Has raised $15 billion toward $20 billion target with ~$31 billion committed to digital infrastructure. Notable investments include Metronet (US fiber broadband, JV with T-Mobile across 300+ communities in 19 states) and Telecom Italia Netco (Italy's national fiber network).",
    investmentStrategy: "Large-cap global value-add infrastructure fund targeting assets with entrenched customer bases, contractual and regulatory protections, and strong growth potential across the themes of decarbonization, digitalization, and deconsolidation. Invests across a broad range of infrastructure sectors in developed markets, applying KKR's operational expertise and platform-scale relationships.",
    sourceUrls: ["https://www.artrs.gov/board/documents/CY2024/2024-06-12/BOT_Packet.pdf", "https://www.nhrs.org/docs/default-source/iic-public-materials/iic-public-materials---december-2025.pdf?sfvrsn=856013b4_3"],
    sectors: ["Digital Infrastructure", "Transportation", "Renewables / Energy Transition", "Utilities"],
    regions: ["North America", "Europe", "Global"],
    strategyUrl: "https://www.artrs.gov/board/documents/CY2024/2024-06-12/BOT_Packet.pdf",
  }),
  f("FUND-106", "KKR", "Diversified Core Infra Fund (DCIF)", "2020", "$11.8B", 11800, "Core", "Evergreen", {
    description: "An active perpetual vehicle by KKR structured specifically to hold long-term core/yield-bearing infrastructure equity assets globally including North America. MainePERS committed $125M.",
    investmentStrategy: "Open-ended core infrastructure fund targeting mature, brownfield assets with stable contracted or regulated revenue streams across energy, transportation, telecommunications, water, and utilities in OECD developed markets. Pursues long-term buy-and-hold positions with investment tickets of $250–750M, targeting net IRRs of 7–9%, and sources the majority of deals on a proprietary, non-auction basis.",
    sourceUrls: ["https://www.infrastructureinvestor.com/mainepers-commits-125m-to-infrastructure/", "https://www.arkleg.state.ar.us/Home/FTPDocument?path=%2FAssembly%2FMeeting+Attachments%2F000%2F27500%2FExhibit+H.06.a+-+ATRS+-+ATRS+Submission+of+1211+Items.pdf"],
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.infrastructureinvestor.com/mainepers-commits-125m-to-infrastructure/",
  }),
  f("FUND-107", "KKR", "Global Climate Transition Fund", "2023", "$7.0B", 7000, "Opportunistic", "Raising", {
    description: "Active KKR fund executing direct investments globally to bridge the climate transition funding gap, including massive mandates within North America. Nearing $3 billion initial close.",
    investmentStrategy: "Dedicated climate infrastructure vehicle targeting high-growth energy transition assets across renewables, battery storage, transportation electrification, green hydrogen, and decarbonization of existing power and industrial infrastructure in North America, Western Europe, and Asia-Pacific. Carries a 12-year lifespan and targets high-teens gross IRRs through investments of $300–750M per transaction.",
    sourceUrls: ["https://www.newprivatemarkets.com/in-brief-kkr-invests-in-australian-energy-transition-platform/", "https://ionanalytics.com/insights/infralogic/kkrs-global-climate-fund-nears-usd-3bn-initial-close/", "https://pitchbook.com/profiles/fund/24809-95F"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global", "North America"],
    strategyUrl: "https://ionanalytics.com/insights/infralogic/kkrs-global-climate-fund-nears-usd-3bn-initial-close/",
  }),
  f("FUND-108", "KKR", "KKR Infrastructure Fund (K-INFRA)", "2022", "$5.33B", 5330, "Core-Plus", "Evergreen", {
    description: "Valid active perpetual entity created specifically for wealth channel distribution to feed KKR's North American and global operating infrastructure platform. Non-traded vehicle providing quarterly liquidity.",
    investmentStrategy: "Non-traded, perpetual-life infrastructure vehicle designed to provide eligible individual investors with access to KKR's institutional infrastructure platform, allocating approximately 85% of assets to KKR's global infrastructure investments across telecommunications, energy transition, utilities, midstream, transportation, and waste. Forms joint ventures alongside KKR institutional vehicles, targeting both current income and capital appreciation with inflation protection.",
    sourceUrls: ["https://fintel.io/doc/sec-kkr-infrastructure-conglomerate-llc-1948056-10q-2025-november-14-20406-5830", "https://www.kinfra.com/"],
    sectors: ["Utilities", "Digital Infrastructure", "Transportation", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.kinfra.com/",
  }),

  // ── Kuwait Investment Authority (KIA) ─────────────────────
  f("FUND-109", "Kuwait Investment Authority (KIA)", "Wren House Infrastructure (Captive Platform)", "2013", "$5.0B", 5000, "Core", "Evergreen", {
    description: "Active, evergreen captive platform acting as the sovereign wealth direct-investment arm for core/core-plus infrastructure equity across North America. Portfolio includes QTS Realty Trust data center JV, North Sea Midstream Partners, and European utility/energy assets.",
    investmentStrategy: "Kuwait Investment Authority's wholly-owned captive infrastructure manager deploying capital globally across transport, energy, utilities, digital infrastructure (including fibre, towers, and data centres), and social infrastructure with a long-term, hold-oriented mandate. Targets core and core-plus assets primarily in Europe and North America, evolving toward a more active value-creation and asset-rotation approach.",
    sourceUrls: ["https://www.macquarie.com/au/en/about/news/2018/mira-and-wren-house-divest-part-of-viesgos-portfolio-to-repsol-for-750-million.html", "https://www.whinfra.com/qts-realty-trust-and-wren-house-successfully-complete-joint-venture-for-three-northern-virginia-data-centers-2/", "https://www.prnewswire.com/news-releases/wren-house-to-acquire-north-sea-midstream-partners-limited-from-arclight-300684909.html"],
    sectors: ["Utilities", "Digital Infrastructure", "Midstream / Energy"],
    regions: ["Global", "North America", "Europe"],
    structure: "Permanent Capital",
    strategies: ["Core", "Core-Plus"],
    strategyUrl: "https://www.whinfra.com/qts-realty-trust-and-wren-house-successfully-complete-joint-venture-for-three-northern-virginia-data-centers-2/",
  }),

  // ── Macquarie Asset Management ────────────────────────────
  f("FUND-110", "Macquarie Asset Management", "Macquarie Energy Transition Infrastructure Fund (METI)", "2024", "$653.6M", 654, "Core-Plus", "Evergreen", {
    description: "Active, open-ended infrastructure equity fund that makes direct acquisitions in North American energy transition platforms. Targets operational renewable energy and clean power assets.",
    investmentStrategy: "Open-ended, core-plus private infrastructure fund targeting the energy transition sector across OECD countries, with an initial focus on decarbonizing the electricity sector through mature, deployable technologies. Subsectors include energy storage, distributed energy, renewable fuels, clean transportation, carbon capture, and circular economy solutions.",
    sourceUrls: ["https://www.macquarie.com/assets/macq/mam/au/performance-report/macquarie-energy-transition-infrastructure-performance-report.pdf", "https://www.macquarie.com/assets/macq/mam/au/flyer/macquarie-energy-transition-infrastructure-fund-asset-flyer.pdf", "https://pitchbook.com/profiles/fund/28207-63F"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.macquarie.com/assets/macq/mam/au/flyer/macquarie-energy-transition-infrastructure-fund-asset-flyer.pdf",
  }),
  f("FUND-111", "Macquarie Asset Management", "Macquarie Infrastructure Partners VI (MIP VI)", "2022", "$8.0B", 8000, "Core-Plus", "Deploying", {
    description: "Active, Americas-focused core-plus infrastructure equity fund heavily deployed in North America. One of Macquarie's flagship vehicles targeting utilities, transport, and digital infrastructure.",
    investmentStrategy: "Core-plus, closed-end fund targeting mid-market infrastructure assets across the Americas, seeking net IRRs of 10–12% and annual cash yields of 4–6%. Focuses on essential, contracted assets with high barriers to entry across transportation, digital infrastructure, utilities, energy, waste, and social infrastructure, deploying equity tickets of $50–125M per investment with an active ownership model.",
    sourceUrls: ["https://www.macquarie.com/au/en/about/news/2025/macquarie-asset-management-closes-macquarie-infrastructure-partners-vi.html", "https://inforcapital.com/funds/macquarie-infrastructure-partners-vi/"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure"],
    regions: ["North America"],
    strategyUrl: "https://www.macquarie.com/au/en/about/news/2025/macquarie-asset-management-closes-macquarie-infrastructure-partners-vi.html",
  }),
  f("FUND-112", "Macquarie Asset Management", "Macquarie Infrastructure Partners VII (MIP VII)", "2025", "$7.0B", 7000, "Core-Plus", "Raising", {
    description: "Recently launched active follow-on to Macquarie's flagship Americas infrastructure equity fund series. Targeting $7 billion for North American infrastructure.",
    investmentStrategy: "Latest fund in Macquarie's Americas-focused, core-plus infrastructure series targeting essential, contracted mid-market assets across transportation, digital infrastructure, utilities, energy, and waste sectors in the Americas. Builds on a track record spanning more than 22 years of investing in the region with an active ownership approach.",
    sourceUrls: ["https://www.infrastructureinvestor.com/macquarie-launches-latest-americas-infra-fund-targeting-7bn-exclusive/", "https://www.infrastructureinvestor.com/funds-in-market/"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/macquarie-launches-latest-americas-infra-fund-targeting-7bn-exclusive/",
  }),
  f("FUND-113", "Macquarie Asset Management", "Macquarie Global Infrastructure Fund (MGIF)", "2021", "$4.0B", 3000, "Core", "Evergreen", {
    description: "Global, open-ended infrastructure equity fund actively acquiring core assets directly in North America. Secured $3 billion in commitments for the new open-end core strategy.",
    investmentStrategy: "Open-ended, core-plus private infrastructure fund with a global mandate, deploying capital across energy and transport assets in Europe and the United States. Targets essential infrastructure across energy and utilities, renewables, transportation, and digital sectors, offering diversified exposure with inflation-linked, income-generating characteristics through a perpetual-capital structure.",
    sourceUrls: ["https://www.infrastructureinvestor.com/macquarie-secures-3bn-for-new-open-end-core-fund-exclusive/", "https://www.frontieradvisors.com.au/wp-content/uploads/2022/10/Market-Insights-RAT-quarterly-Q3-2022-Fundraising.pdf"],
    sectors: ["Utilities", "Transportation", "Power Generation"],
    regions: ["Global", "North America"],
    structure: "Open-End",
    strategyUrl: "https://www.infrastructureinvestor.com/macquarie-secures-3bn-for-new-open-end-core-fund-exclusive/",
  }),
  f("FUND-114", "Macquarie Asset Management", "Macquarie Green Energy Transition Solutions (MGETS)", "2022", "$3.0B+", 3000, "Value-Add", "Deploying", {
    description: "Recently closed active fund acquiring direct equity stakes in growth-stage/value-add energy transition platforms globally, including the US. Closed oversubscribed at $2.4 billion before reaching $3 billion with co-investments.",
    investmentStrategy: "Macquarie's first dedicated energy transition fund targeting opportunities beyond mature renewables, investing in companies that apply proven technologies to decarbonize energy sectors globally. Targets six subsectors — energy storage, distributed energy, renewable fuels, clean transportation, carbon capture, and circular economy — with a globally diversified portfolio spanning EMEA, APAC, and the Americas.",
    sourceUrls: ["https://www.macquarie.com/au/en/about/news/2025/macquarie-asset-management-reaches-us3-billion-close-of-green-energy-transition-solutions-fund-and-co-investment-commitment.html", "https://www.infrastructureinvestor.com/macquarie-closes-mgets-fund-oversubscribed-on-2-4bn/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global", "North America"],
    strategyUrl: "https://www.macquarie.com/au/en/about/news/2025/macquarie-asset-management-reaches-us3-billion-close-of-green-energy-transition-solutions-fund-and-co-investment-commitment.html",
  }),
  f("FUND-115", "Macquarie Asset Management", "Macquarie Green Energy and Climate Opportunities Fund", "2023", "$1.14B", 1140, "Core-Plus", "Evergreen", {
    description: "Active, open-ended global vehicle that directly acquires mature green energy platforms and operates across geographies including the Americas. Recently acquired a portfolio of six diversified green energy investments.",
    investmentStrategy: "Open-ended, opportunistic fund providing diversified exposure to large-scale renewable energy and natural climate solutions across OECD markets, with investments spanning solar, wind, energy storage, and natural climate solutions. Targets equity investments across multiple asset lifecycle stages — development, construction, and operations — spanning the Americas, Asia-Pacific, and Europe.",
    sourceUrls: ["https://www.macquarie.com/au/en/about/news/2024/macquarie-green-energy-and-climate-opportunities-fund-acquires-portfolio-of-six-investments.html", "https://pitchbook.com/profiles/fund/25578-37F"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    structure: "Open-End",
    strategyUrl: "https://www.macquarie.com/au/en/about/news/2024/macquarie-green-energy-and-climate-opportunities-fund-acquires-portfolio-of-six-investments.html",
  }),
  // ── Meridiam ───────────────────────────────────────────────
  f("FUND-116", "Meridiam", "Meridiam Infrastructure North America IV (MINA IV)", "2024", "$1.8B", 1800, "Value-Add", "Deploying", {
    description: "MINA IV is an active, closed-end infrastructure equity fund geographically dedicated to developing and acquiring assets in North America. Successfully closed raising more than $1.8 billion.",
    investmentStrategy: "Long-term, greenfield-first infrastructure fund focused on public-private partnership (PPP) projects in the United States and Canada, targeting transportation (roads, bridges, express lanes, transit), social infrastructure (schools, healthcare), environmental services, and low-carbon energy solutions. Employs a 25-year hold period aligned with concession durations, emphasizing contracted revenue streams and measurable sustainability outcomes.",
    sourceUrls: ["https://www.businesswire.com/news/home/20251002014398/en/Meridiam-Successfully-Closes-MINA-IV-Its-Flagship-North-America-Infrastructure-Fund-Raising-More-Than-%241.8-Billion", "https://data.treasury.ri.gov/dataset/5df8d940-feaf-4ab5-9713-4e746753beb0/resource/dd81494e-7749-4c75-a843-94eb0e16d7dc/download/1a-meridiam-infrastructure-north-america-iv-staff-memo-final.pdf"],
    sectors: ["Transportation", "Social Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.businesswire.com/news/home/20251002014398/en/Meridiam-Successfully-Closes-MINA-IV-Its-Flagship-North-America-Infrastructure-Fund-Raising-More-Than-%241.8-Billion",
  }),

  // ── Mirova ────────────────────────────────────────────────
  f("FUND-117", "Mirova", "Mirova Energy Transition 6 (MET6)", "2023", "€2.0B", 2200, "Core-Plus", "Raising", {
    description: "Active 2023-vintage energy transition infrastructure equity fund making direct acquisitions across OECD markets, inclusive of North America. Reached €1.2 billion at second close and targeting €2 billion final close.",
    investmentStrategy: "Infrastructure fund investing in greenfield, brownfield, and corporate energy transition assets with a primary focus on Europe and selective exposure to other OECD markets. Target subsectors span onshore and offshore wind, solar PV, hydropower, energy storage, energy efficiency, low-carbon electric mobility, and hydrogen, financing projects through their full lifecycle to generate stable, inflation-linked cash flows.",
    sourceUrls: ["https://www.im.natixis.com/en-gb/about/investment-manager-news/2025/mirova-energy-transition-6-fund-reaches-1-2-Billion-euro-at-second-close", "https://www.esgtoday.com/mirova-raises-1-4-billion-for-flagship-energy-transition-fund/", "https://pitchbook.com/profiles/fund/24431-95F", "https://www.mirova.com/sites/default/files/2023-10/Press%20release_Mirova%20Energy%20Transition%206_EN.pdf"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.im.natixis.com/en-gb/about/investment-manager-news/2025/mirova-energy-transition-6-fund-reaches-1-2-Billion-euro-at-second-close",
  }),

  // ── Morgan Stanley Investment Management ──────────────────
  f("FUND-118", "Morgan Stanley Investment Management", "North Haven Infrastructure Partners IV", "2022", "$4.1B", 4100, "Value-Add", "Deploying", {
    description: "Active, recent-vintage global infrastructure fund actively targeting value-add equity acquisitions globally, inclusive of North America. Closed at $4.1 billion, slightly below its $6 billion target.",
    investmentStrategy: "Value-add global infrastructure fund investing in essential assets that provide public goods and services with long useful lives and stable, inflation-linked cash flows. Targets transportation, digital infrastructure, energy transition (with a preference for renewables), and utilities, primarily in North America and OECD countries, with active asset management to drive value creation.",
    sourceUrls: ["https://www.morganstanley.com/im/en-us/individual-investor/insights/press-release/msim-closes-fourth-global-ingrastructure-fund-at-4B.html", "https://www.themiddlemarket.com/news-analysis/why-morgan-stanley-missed-the-6b-mark-on-its-fourth-infra-vintage"],
    sectors: ["Utilities", "Digital Infrastructure", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://www.morganstanley.com/im/en-us/individual-investor/insights/press-release/msim-closes-fourth-global-ingrastructure-fund-at-4B.html",
  }),

  // ── Morrison & Co. ────────────────────────────────────────
  f("FUND-119", "Morrison & Co.", "Infratil Limited", "1994", "NZ$19.0B", 11780, "Core-Plus", "Evergreen", {
    description: "Infratil is a massive permanent capital infrastructure company (PLC) that actively develops and acquires growth-oriented core-plus infrastructure platforms globally, including across North America. Listed on NZX with investments spanning digital, renewables, and healthcare infrastructure.",
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
    description: "The entity operates as the direct and active captive infrastructure arm of Abu Dhabi's sovereign wealth fund, deploying into North American infrastructure equity. AED 1.2 trillion firm AUM across all strategies. US office established for direct North American investment.",
    investmentStrategy: "Sovereign investor deploying capital across six high-conviction sectors: energy transition, digital infrastructure (data centres, fibre, towers), transport, power and utilities, industrial infrastructure, and sustainable assets. Operates through direct investments, co-investments, and GP partnerships across North America, Europe, the Middle East, and increasingly Asia, targeting capital-intensive assets with predictable, long-term cash flows.",
    sourceUrls: ["https://www.mubadala.com/en/news/mubadala-investment-company-reports-2024-financial-results", "https://www.mubadala.com/en/who-we-are/our-structure", "https://www.mubadala.com/us"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["Global", "North America", "Middle East & Africa"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.mubadala.com/en/who-we-are/our-structure",
  }),

  // ── Northleaf Capital Partners ────────────────────────────
  f("FUND-121", "Northleaf Capital Partners", "Northleaf Infrastructure Capital Partners IV (NICP IV)", "2023", "$2.6B", 2600, "Core-Plus", "Deploying", {
    description: "Active, recently closed middle-market fund focused explicitly on North American infrastructure equity. Hit hard cap at $2.6 billion final close. Recognized in Infrastructure Investor's 2025 annual review.",
    investmentStrategy: "Core-plus, closed-end fund targeting control investments in contracted, mid-market infrastructure assets primarily in North America, with selective exposure to Western Europe and Australia. Focuses on renewable energy, digital infrastructure (fibre, towers, data centres), transportation (including rail), and outsourced services, deploying average equity tickets of approximately $250M per deal.",
    sourceUrls: ["https://www.businesswire.com/news/home/20250508377063/en/Northleaf-Hits-Hard-Cap-with-Final-Close-of-its-US%242.6-Billion-Infrastructure-Fund", "https://pitchbook.com/profiles/fund/23058-19F", "https://www.northleafcapital.com/news/northleaf-recognized-infrastructure-investors-2025-annual-review"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.businesswire.com/news/home/20250508377063/en/Northleaf-Hits-Hard-Cap-with-Final-Close-of-its-US%242.6-Billion-Infrastructure-Fund",
  }),
  f("FUND-122", "Northleaf Capital Partners", "Northleaf Essential Infrastructure Fund (NEIF)", "2021", "$800M", 800, "Core", "Evergreen", {
    description: "Functions as Northleaf's active core open-ended vehicle structured to acquire stable infrastructure equity across its mandate. Targets essential services with contracted or regulated revenues.",
    investmentStrategy: "Open-ended, core infrastructure vehicle targeting mature, mid-market infrastructure assets with contracted and regulated revenue frameworks, emphasizing stable long-term cash flows and lower risk profiles. Provides diversification across geography and subsector, primarily in North America, with a focus on renewable energy and digital infrastructure, while offering enhanced liquidity options relative to traditional closed-end structures.",
    sourceUrls: ["https://www.torys.com/work/2021/11/bf8cb41e-38a3-4b2c-947d-2792fc424d7b"],
    sectors: ["Utilities", "Transportation"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.torys.com/work/2021/11/bf8cb41e-38a3-4b2c-947d-2792fc424d7b",
  }),

  // ── NOVA Infrastructure ───────────────────────────────────
  f("FUND-123", "NOVA Infrastructure", "NOVA Infrastructure Fund II", "2024", "$991M", 991, "Value-Add", "Deploying", {
    description: "Active, dedicated North American middle-market value-add infrastructure equity fund. Investments include taking UGE International private and other clean energy infrastructure platforms.",
    investmentStrategy: "Fits the criteria optimally as a highly active, dedicated North American middle-market value-add infrastructure equity fund.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/24080-95F", "https://ugei.com/nova-completes-purchase-of-uge-international/", "https://www.pehub.com/nova-infrastructure-to-take-uge-international-private/"],
    sectors: ["Renewables / Energy Transition", "Utilities"],
    regions: ["North America"],
    strategyUrl: "https://ugei.com/nova-completes-purchase-of-uge-international/",
  }),

  // ── Nuveen (Glennmont Partners) ───────────────────────────
  f("FUND-124", "Nuveen", "Nuveen Clean Energy Strategy IV", "2021", "€1.9B", 2090, "Value-Add", "Deploying", {
    description: "Managed by Nuveen/Glennmont, this active global renewables vehicle explicitly acquires operational and developmental clean energy assets inside the United States. Doubled in size from previous vintage at final close.",
    investmentStrategy: "Managed by Nuveen/Glennmont, this active global renewables vehicle explicitly acquires operational and developmental clean energy assets inside the United States.",
    sourceUrls: ["https://www.infrastructureinvestor.com/the-pipeline-macquaries-fundraising-hopes-usss-thames-regret-stonepeaks-1-2bn-care-entry/", "https://www.nuveen.com/global/insights/news/2024/nuveen-infrastructure-clean-energy-strategy-iv-doubles-in-size-by-final-close-from-previous-vintage"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.nuveen.com/global/insights/news/2024/nuveen-infrastructure-clean-energy-strategy-iv-doubles-in-size-by-final-close-from-previous-vintage",
  }),

  // ── OMERS ─────────────────────────────────────────────────
  f("FUND-125", "OMERS", "OMERS Infrastructure Fund", "1999", "C$40.9B", 29857, "Core", "Evergreen", {
    description: "OMERS qualifies as a massive evergreen pension-captive direct investment arm targeting core infrastructure equity assets across North America. One of Canada's largest pension plans with extensive direct infrastructure holdings.",
    investmentStrategy: "OMERS qualifies as a massive evergreen pension-captive direct investment arm targeting core infrastructure equity assets across North America.",
    sourceUrls: ["https://www.omersinfrastructure.com/", "https://www.omersinfrastructure.com/history", "https://www.privateequityinternational.com/institution-profiles/omers-infrastructure.html"],
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["North America", "Europe", "Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.omersinfrastructure.com/",
  }),

  // ── Ontario Teachers' Pension Plan (OTPP) ─────────────────
  f("FUND-126", "Ontario Teachers' Pension Plan (OTPP)", "OTPP Infrastructure & Natural Resources", "2001", "C$47.0B", 34310, "Core", "Evergreen", {
    description: "Perpetual, captive direct investment arm for the Ontario Teachers' Pension Plan actively owning and acquiring North American core infrastructure. C$47 billion allocation spanning ports, utilities, and essential services globally.",
    investmentStrategy: "It strictly qualifies as a perpetual, captive direct investment arm for the Ontario Teachers' Pension Plan actively owning and acquiring North American core infrastructure.",
    sourceUrls: ["https://www.otpp.com/en-ca/investments/our-investments/infrastructure-and-natural-resources/", "https://www.infrastructureinvestor.com/otpp-stepping-back-but-not-retreating-from-infra/"],
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global", "North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.otpp.com/en-ca/investments/our-investments/infrastructure-and-natural-resources/",
  }),

  // ── Partners Group ────────────────────────────────────────
  f("FUND-127", "Partners Group", "Partners Group Direct Infrastructure IV", "2023", "$8.0B", 8000, "Value-Add", "Deploying", {
    description: "Active, closed-end direct infrastructure equity fund with a global mandate inclusive of North American investments. Targeting $8 billion for direct equity acquisitions in infrastructure platforms.",
    investmentStrategy: "Meets all inclusion criteria as a traditional, active, closed-end direct infrastructure equity fund with a global mandate inclusive of North American investments.",
    sourceUrls: ["https://inforcapital.com/funds/partners-group-direct-infrastructure-iv/", "https://www.infrastructureinvestor.com/the-pipeline-gip-reaches-12-5bn-on-ai-fund-stonepeaks-ir-lead-down-under-kkr-forms-15bn-offshore-jv/"],
    sectors: ["Utilities", "Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["Global", "North America", "Europe"],
    strategyUrl: "https://inforcapital.com/funds/partners-group-direct-infrastructure-iv/",
  }),
  f("FUND-128", "Partners Group", "Partners Group Next Generation Infrastructure Programs", "2024", "$1.0B", 1000, "Value-Add", "Evergreen", {
    description: "Active evergreen platform making direct value-add infrastructure equity investments with a dedicated North American footprint. Targets next-generation digital, energy, and mobility infrastructure.",
    investmentStrategy: "Fits the protocol perfectly as an active evergreen platform making direct value-add infrastructure equity investments with a dedicated North American footprint.",
    sourceUrls: ["https://www.partnersgroup.com/en/news-and-views/press-releases/corporate-news/detail?news_id=35550643-444b-49c8-9f72-1502c2e822a6"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America", "Global"],
    strategyUrl: "https://www.partnersgroup.com/en/news-and-views/press-releases/corporate-news/detail?news_id=35550643-444b-49c8-9f72-1502c2e822a6",
  }),

  // ── Patria Investments ────────────────────────────────────
  f("FUND-129", "Patria Investments", "Patria Infrastructure Fund V", "2023", "$2.9B", 2900, "Value-Add", "Deploying", {
    description: "Pan-Latin American mandate that explicitly includes Mexico (a North American country), qualifying as an active direct equity acquirer in North America. IFC Ontario LP among committed investors.",
    investmentStrategy: "Because its pan-Latin American mandate explicitly includes Mexico (a North American country), it avoids the strict geographic exclusion and qualifies as an active direct equity acquirer.",
    sourceUrls: ["https://www.tipranks.com/news/company-announcements/patria-investments-earnings-call-strong-growth-and-optimism", "https://disclosures.ifc.org/project-detail/SII/49578/pi-fund-v-ontario-l-p", "https://inforcapital.com/funds/patria-infrastructure-fund-v/"],
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition"],
    regions: ["Latin America", "North America"],
    strategyUrl: "https://inforcapital.com/funds/patria-infrastructure-fund-v/",
  }),
  // ── QIC ────────────────────────────────────────────────────
  f("FUND-130", "QIC", "QIC Global Infrastructure Fund II (QGIF II)", "2023", "$2.0B", 2000, "Core-Plus", "Raising", {
    description: "Recently launched active infrastructure equity fund with an explicit geographic allocation allowing deployment into the US. Nearing first close as QIC builds its global infrastructure platform.",
    investmentStrategy: "Passes all criteria as a recently launched active infrastructure equity fund with an explicit geographic allocation allowing deployment into the US.",
    sourceUrls: ["https://ionanalytics.com/insights/infralogic/qic-cuts-target-for-latest-flagship-infra-fund/", "https://pitchbook.com/profiles/fund/24768-10F", "https://ionanalytics.com/insights/infralogic/qic-nears-first-close-of-usd-3bn-infra-fund/"],
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global", "North America", "Asia-Pacific"],
    strategyUrl: "https://ionanalytics.com/insights/infralogic/qic-cuts-target-for-latest-flagship-infra-fund/",
  }),
  f("FUND-131", "QIC", "QIC Infrastructure Portfolio (QIP)", "N/A", "A$2.0B", 1320, "Core", "Evergreen", {
    description: "Open-ended/evergreen core infrastructure fund managed by QIC that actively holds and manages direct equity assets in the US market. CenTrio platform accelerates US energy transition with cost-effective sustainable solutions.",
    investmentStrategy: "It is an open-ended/evergreen core infrastructure fund managed by QIC that actively holds and manages direct equity assets in the US market.",
    sourceUrls: ["https://live.peievents.com/infrastructure-investor-australia-forum/speakers/peter-https-wwwaberdeeninvestmentscom-en-kr-investor", "https://www.qic.com/News-and-Insights/CenTrio-Accelerating-the-US-energy-transition-with-costeffective-and-sustainable-solutions"],
    sectors: ["Utilities", "Renewables / Energy Transition"],
    regions: ["North America", "Asia-Pacific"],
    structure: "Open-End",
    strategyUrl: "https://www.qic.com/News-and-Insights/CenTrio-Accelerating-the-US-energy-transition-with-costeffective-and-sustainable-solutions",
  }),

  // ── Quinbrook Infrastructure Partners ─────────────────────
  f("FUND-132", "Quinbrook Infrastructure Partners", "Quinbrook Net Zero Power Fund", "2021", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "Active 2021-vintage closed-end fund making high-growth value-add direct equity development investments into US and global renewables/energy transition projects. Exceeded $3 billion target. REST committed A$1 billion.",
    investmentStrategy: "It is an active 2021-vintage closed-end fund making high-growth (Value-Add) direct equity development investments into US and global renewables/energy transition projects.",
    sourceUrls: ["https://www.quinbrook.com/news-insights/quinbrook-exceeds-target-for-net-zero-power-strategy-raising-usd-3-billion-in-capital-commitments/", "https://democracy.islington.gov.uk/documents/s42931/Appendix%201-%20Apex%20-%20Islington%20Q2%202025.pdf", "https://www.infrastructureinvestor.com/rest-commits-a1bn-to-quinbrook-infrastructure-partners/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Asia-Pacific"],
    strategyUrl: "https://www.quinbrook.com/news-insights/quinbrook-exceeds-target-for-net-zero-power-strategy-raising-usd-3-billion-in-capital-commitments/",
  }),

  // ── Ridgewood Infrastructure ──────────────────────────────
  f("FUND-133", "Ridgewood Infrastructure", "Ridgewood Water & Strategic Infrastructure Fund II", "2022", "$1.2B", 1200, "Value-Add", "Deploying", {
    description: "Recently closed (Jan 2025) pure-play infrastructure equity fund operating squarely in the North American lower middle market. Significantly surpassed its target, focusing on water, wastewater, and essential environmental infrastructure.",
    investmentStrategy: "A recently closed (Jan 2025) pure-play infrastructure equity fund operating squarely in the North American lower middle market.",
    sourceUrls: ["https://ridgewoodinfrastructure.com/ridgewood-infrastructure-announced-1-2-billion-final-close-for-fund-ii-significantly-surpassing-its-target/", "https://ionanalytics.com/insights/infralogic/ridgewood-infrastructure-fund-ii-surpassed-target/"],
    sectors: ["Water", "Utilities", "Waste / Environmental Services"],
    regions: ["North America"],
    strategyUrl: "https://ridgewoodinfrastructure.com/ridgewood-infrastructure-announced-1-2-billion-final-close-for-fund-ii-significantly-surpassing-its-target/",
  }),

  // ── Schroders Capital ─────────────────────────────────────
  f("FUND-134", "Schroders Capital", "Schroders Capital Semi-Liquid Global Energy Infrastructure", "2023", "$281.3M", 281, "Value-Add", "Evergreen", {
    description: "Active, global (including North America) open-ended infrastructure equity fund making direct investments in energy transition assets. Semi-liquid structure for wealth investors.",
    investmentStrategy: "An active, global (including North America) open-ended infrastructure equity fund making direct investments in energy transition assets.",
    sourceUrls: ["https://www.schroders.com/en-ch/ch/professional/fund-centre/?language=en&location=ch&channel=professional&clientId=schdr&clientVersion=v1&externalId=SCHDR_F00001I3F2&r=%2Ffund%2FSCHDR_F00001I3F2%2F&fundName=Schroders-Capital-Semi-Liquid-Global-Energy-Infrastructure-E-Accumulation-USD", "https://www.schroders.com/en-gb/uk/intermediary/funds-and-strategies/schroders-capital-semi-liquid-global-energy-infrastructure/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global", "North America", "Europe"],
    structure: "Open-End",
    strategyUrl: "https://www.schroders.com/en-gb/uk/intermediary/funds-and-strategies/schroders-capital-semi-liquid-global-energy-infrastructure/",
  }),

  // ── Schroders Greencoat ───────────────────────────────────
  f("FUND-135", "Schroders Greencoat", "Schroders Greencoat Global Renewables+ LTAF", "2024", "£450M", 585, "Core-Plus", "Evergreen", {
    description: "Active, open-ended LTAF actively purchasing direct energy infrastructure equity globally, explicitly including the US. WTW Lifesight among strategic investors. Targets operational renewable energy assets.",
    investmentStrategy: "It is an active, open-ended LTAF actively purchasing direct energy infrastructure equity globally, explicitly including the US.",
    sourceUrls: ["https://www.schroders.com/en-gb/uk/institutional/funds-and-strategies/renewables-plus/", "https://www.wtwco.com/en-gb/news/2025/08/lifesight-announces-strategic-investment-in-schroders-greencoats-renewables-ltaf", "https://www.schroders.com/en-gb/uk/institutional/funds-and-strategies/investing-in-ltafs/"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["Global", "North America", "Europe"],
    structure: "Open-End",
    strategyUrl: "https://www.schroders.com/en-gb/uk/institutional/funds-and-strategies/renewables-plus/",
  }),

  // ── Stonepeak ─────────────────────────────────────────────
  f("FUND-136", "Stonepeak", "Stonepeak Infrastructure Fund V", "2023", "$15.0B", 15000, "Core-Plus", "Raising", {
    description: "North American dedicated, closed-end flagship direct infrastructure equity fund. Raised $7.29 billion from 98 investors as of latest reporting, with notable $350M from Oregon State Treasury and $300M from NY State Common. Investments include Ørsted US wind portfolio (957 MW), Repsol solar/storage (777 MW in TX/NM), Louisiana LNG (40% stake), Castrol (65% stake at $10.1B EV), and Cologix (leading NA interconnection platform).",
    investmentStrategy: "Follows all inclusion criteria as a North American dedicated, closed-end flagship direct infrastructure equity fund.",
    sourceUrls: ["https://www.infrastructureinvestor.com/wsib-commits-300m-to-infrastructure/"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Midstream / Energy", "Transportation"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/wsib-commits-300m-to-infrastructure/",
  }),
  f("FUND-137", "Stonepeak", "Stonepeak Global Renewables Fund II", "2024", "$5.0B", 5000, "Value-Add", "Raising", {
    description: "Active, closed-end renewables infrastructure equity fund making direct investments in the US and Asia. CalSTRS anchored the transition pool with $450M commitment. Doubling maiden effort target.",
    investmentStrategy: "It is an active, closed-end renewables infrastructure equity fund making direct investments in the US and Asia.",
    sourceUrls: ["https://www.privateequity.fund/post/stonepeak-aims-for-5-billion-in-second-renewable-fund-doubling-maiden-effort", "https://www.infrastructureinvestor.com/calstrs-anchors-stonepeak-transition-pool-with-450m-exclusive/"],
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Asia-Pacific"],
    strategyUrl: "https://www.privateequity.fund/post/stonepeak-aims-for-5-billion-in-second-renewable-fund-doubling-maiden-effort",
  }),
  f("FUND-138", "Stonepeak", "Stonepeak Opportunities Fund", "2022", "$3.15B", 3150, "Value-Add", "Deploying", {
    description: "Recently closed mid-market infrastructure equity fund with a direct mandate for North America. Closed at $3.15 billion of commitments targeting high-growth infrastructure opportunities.",
    investmentStrategy: "Included because it is a recently closed mid-market infrastructure equity fund with a direct mandate for North America.",
    sourceUrls: ["https://stonepeak.com/news/stonepeak-closes-opportunities-fund-with-3-15-billion-of-commitments"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America"],
    strategies: ["Core-Plus", "Value-Add"],
    strategyUrl: "https://stonepeak.com/news/stonepeak-closes-opportunities-fund-with-3-15-billion-of-commitments",
  }),
  f("FUND-139", "Stonepeak", "Stonepeak Opportunities Fund II", "2024", "$4.0B", 4000, "Value-Add", "Raising", {
    description: "Active successor vehicle in Stonepeak's mid-market strategy, raising capital for North American and European equity investments. Louisiana Teachers committed $50M; Seattle City Pension committed.",
    investmentStrategy: "Included because it is the active successor vehicle in Stonepeak's mid-market strategy, raising capital for North American and European equity investments.",
    sourceUrls: ["https://irei.com/news/louisiana-teachers-invests-50m-in-stonepeak-opportunities-fund-ii/", "https://www.infrastructureinvestor.com/seattle-city-pension-wants-more-outperforming-infra-commits-to-stonepeak-fund/", "https://www.seattle.gov/documents/Departments/Retirement/Board/Minutes%2C%20Investment%20Committee/IC_Minutes_2026_01.pdf"],
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://irei.com/news/louisiana-teachers-invests-50m-in-stonepeak-opportunities-fund-ii/",
  }),
  f("FUND-140", "Stonepeak", "Stonepeak Core Fund", "2022", "$5.0B", 5000, "Core", "Evergreen", {
    description: "Permanent-capital/open-ended vehicle buying core infrastructure assets in North America and other developed OECD markets. Targets stable, essential infrastructure with long-duration cash yields.",
    investmentStrategy: "Included as it is a permanent-capital/open-ended vehicle buying core infrastructure assets in North America and other developed OECD markets.",
    sourceUrls: ["https://inforcapital.com/funds/stonepeak-core-fund/"],
    sectors: ["Utilities", "Transportation", "Digital Infrastructure"],
    regions: ["North America", "Global"],
    structure: "Open-End",
    strategyUrl: "https://inforcapital.com/funds/stonepeak-core-fund/",
  }),

  // ── Swiss Life Asset Managers ─────────────────────────────
  f("FUND-141", "Swiss Life Asset Managers", "Swiss Life Funds (LUX) Global Infrastructure Opportunities IV", "2024", "€2.5B", 2750, "Core", "Raising", {
    description: "Actively fundraising to deploy core/core-plus capital into direct mid-market infrastructure in Europe and North America. Targets essential, contracted infrastructure assets.",
    investmentStrategy: "Included because it is actively fundraising to deploy core/core-plus capital into direct mid-market infrastructure in Europe and North America.",
    sourceUrls: ["https://uk.swisslife-am.com/content/dam/slamuk/news/media-release-gio-iv"],
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Europe", "North America"],
    strategies: ["Core", "Core-Plus"],
    strategyUrl: "https://uk.swisslife-am.com/content/dam/slamuk/news/media-release-gio-iv",
  }),
  f("FUND-142", "Swiss Life Asset Managers", "Swiss Life Funds (LUX) ESG Global Infrastructure Opportunities Growth II", "2023", "€750M", 825, "Value-Add", "Deploying", {
    description: "Active value-add infrastructure fund purchasing direct assets in North America and Europe. Nearing final close for value-add and renewables strategies.",
    investmentStrategy: "Included as an active value-add infrastructure fund purchasing direct assets in North America and Europe.",
    sourceUrls: ["https://www.infrastructureinvestor.com/swiss-life-am-nears-final-close-for-value-add-and-renewables-funds-exclusive/", "https://www.swisslife-am.com/en/home/media/news/switzerland/institutional/2023/0502-infrastructure-fund.html"],
    sectors: ["Renewables / Energy Transition", "Utilities"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/swiss-life-am-nears-final-close-for-value-add-and-renewables-funds-exclusive/",
  }),
  f("FUND-143", "Swiss Life Asset Managers", "Fontavis ESG Renewable Infrastructure Fund II", "2022", "€750M", 825, "Core-Plus", "Deploying", {
    description: "Active global renewables fund mandated to deploy direct equity into OECD geographies, including North America. Part of Swiss Life's Fontavis renewable infrastructure platform.",
    investmentStrategy: "Included as an active global renewables fund mandated to deploy direct equity into OECD geographies, including North America.",
    sourceUrls: ["https://pe-insights.com/swiss-life-asset-managers-launches-second-renewable-energy-fund-with-e750m-target/"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://pe-insights.com/swiss-life-asset-managers-launches-second-renewable-energy-fund-with-e750m-target/",
  }),
  // ── Tallvine Partners ──────────────────────────────────────
  f("FUND-144", "Tallvine Partners", "Tallvine Middle Market Infrastructure Fund I", "2024", "$1.5B", 1500, "Value-Add", "Raising", {
    description: "Active, recently launched fund targeting direct control/value-add infrastructure investments exclusively in North America. Debut fund from a new infrastructure-focused GP.",
    investmentStrategy: "Included because it is an active, recently launched fund targeting direct control/value-add infrastructure investments exclusively in North America.",
    sourceUrls: ["https://www.themiddlemarket.com/news-analysis/tallvine-raising-1-5b-for-debut-fund-as-infra-spinouts-gather-pace", "https://pitchbook.com/profiles/fund/25865-92F", "https://www.formds.com/issuers/tallvine-middle-market-infrastructure-fund-i-lp"],
    sectors: ["Utilities", "Digital Infrastructure", "Transportation"],
    regions: ["North America"],
    strategyUrl: "https://www.themiddlemarket.com/news-analysis/tallvine-raising-1-5b-for-debut-fund-as-infra-spinouts-gather-pace",
  }),

  // ── Tiger Infrastructure Partners ─────────────────────────
  f("FUND-145", "Tiger Infrastructure Partners", "Tiger Infrastructure Partners Fund IV", "2023", "$781.6M", 782, "Value-Add", "Deploying", {
    description: "Active 2023-vintage mid-market value-add infrastructure fund explicitly targeting direct equity investments in North America and Europe. Focuses on transport, environmental, and digital infrastructure.",
    investmentStrategy: "It is an active 2023-vintage mid-market value-add infrastructure fund explicitly targeting direct equity investments in North America and Europe.",
    sourceUrls: ["https://pitchbook.com/profiles/fund/24513-04F", "https://radientanalytics.com/firm/adv/tiger-infrastructure-partners-lp-161551"],
    sectors: ["Transportation", "Waste / Environmental Services", "Digital Infrastructure"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://pitchbook.com/profiles/fund/24513-04F",
  }),

  // ── TPG ───────────────────────────────────────────────────
  f("FUND-146", "TPG", "TPG Rise Climate II", "2023", "$8.0B", 8000, "Value-Add", "Raising", {
    description: "A multi-billion dollar active private and infrastructure equity vehicle targeting climate transition assets globally, including North America. Passed $6 billion in commitments. Alterra committed US$1.5 billion including for Global South Initiative.",
    investmentStrategy: "A multi-billion dollar active private and infrastructure equity vehicle targeting climate transition assets globally, including North America.",
    sourceUrls: ["https://www.newprivatemarkets.com/in-brief-tpg-passes-6bn-for-rise-climate-ii/", "https://www.tpg.com/news-and-insights/alterra-commits-us1-5-billion-to-tpg-rise-climates-us10-billion-next-generation-private-equity-funds-including-new-global-south-initiative-and-tpg-rise-climate-ii", "https://www.buyoutsinsider.com/tpg-sets-8bn-target-10bn-cap-for-sophomore-climate-fund/"],
    sectors: ["Renewables / Energy Transition", "Power Generation", "Transportation"],
    regions: ["Global", "North America"],
    strategyUrl: "https://www.newprivatemarkets.com/in-brief-tpg-passes-6bn-for-rise-climate-ii/",
  }),
  f("FUND-147", "TPG", "TPG Rise Climate Transition Infrastructure (TRC TI)", "2023", "$2.0B+", 2000, "Value-Add", "Deploying", {
    description: "TPG's dedicated active transition infrastructure equity fund deploying capital into heavy assets globally, including a strong presence in the US. Appointed dedicated partner as Head of Infrastructure.",
    investmentStrategy: "It is TPG's dedicated active transition infrastructure equity fund deploying capital into heavy assets globally, including a strong presence in the US.",
    sourceUrls: ["https://dallasinnovates.com/tpg-appoints-partner-head-of-infrastructure-for-tpg-rise-climate/", "https://www.buyoutsinsider.com/tpg-sets-8bn-target-10bn-cap-for-sophomore-climate-fund/", "https://www.sec.gov/Archives/edgar/data/1880661/000188066125000014/tpg-20241231.htm", "https://www.paulhastings.com/news/paul-hastings-acts-as-counsel-on-esg-advisory-work-for-tpg-rise-climate-transition-infrastructure"],
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["Global", "North America"],
    strategyUrl: "https://dallasinnovates.com/tpg-appoints-partner-head-of-infrastructure-for-tpg-rise-climate/",
  }),
  f("FUND-148", "TPG", "TPG Peppertree Capital Fund X", "2023", "$1.5B", 1500, "Value-Add", "Raising", {
    description: "Fund actively raises and acquires direct hard assets in U.S. digital infrastructure. TPG acquired Peppertree Capital, a digital infrastructure investment firm, to expand its capabilities.",
    investmentStrategy: "Fund actively raises and acquires direct hard assets in U.S. digital infrastructure.",
    sourceUrls: ["https://www.alternativeswatch.com/2025/05/06/tpg-acquisition-digital-infrastructure-investment-firm-peppertree/"],
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America"],
    strategyUrl: "https://www.alternativeswatch.com/2025/05/06/tpg-acquisition-digital-infrastructure-investment-firm-peppertree/",
  }),

  // ── True Green Capital Management ─────────────────────────
  f("FUND-149", "True Green Capital Management", "True Green Capital Fund IV", "2022", "$660.9M", 661, "Core-Plus", "Deploying", {
    description: "Active closed-end clean energy infrastructure fund dedicated to North American and European solar assets. Exceeded its $500 million target to close at over $650 million.",
    investmentStrategy: "An active closed-end clean energy infrastructure fund dedicated to North American and European solar assets.",
    sourceUrls: ["https://www.prnewswire.com/news-releases/true-green-capital-management-closes-fourth-fund-at-over-650-million-exceeding-its-500-million-target-301561227.html"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.prnewswire.com/news-releases/true-green-capital-management-closes-fourth-fund-at-over-650-million-exceeding-its-500-million-target-301561227.html",
  }),
  f("FUND-150", "True Green Capital Management", "True Green Capital Fund V", "2025", "$1.0B", 1000, "Core-Plus", "Raising", {
    description: "Active, currently raising NA-focused core-plus renewable infrastructure equity fund. VRS committed $100M. Builds on Fund IV's track record in distributed solar and clean energy.",
    investmentStrategy: "An active, currently raising NA-focused core-plus renewable infrastructure equity fund.",
    sourceUrls: ["https://realassets.ipe.com/jon-peterson/3272.contributor?page=12", "https://www.infrastructureinvestor.com/vrs-commits-100m-to-true-green-capital/"],
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/vrs-commits-100m-to-true-green-capital/",
  }),

  // ── Vauban Infrastructure Partners ────────────────────────
  f("FUND-151", "Vauban Infrastructure Partners", "Core Infrastructure Fund IV (CIF IV)", "2021", "€2.2B", 2420, "Core", "Deploying", {
    description: "Massive active core infrastructure fund making direct equity investments, which has explicitly expanded its geographic target footprint to acquire operating platforms in North America. Acquired a leading US district energy platform.",
    investmentStrategy: "A massive active core infrastructure fund making direct equity investments, which has explicitly expanded its geographic target footprint to acquire operating platforms in North America.",
    sourceUrls: ["https://vauban-ip.com/en/about-us", "https://www.prnewswire.com/news-releases/vauban-infrastructure-partners-announces-the-closing-of-the-acquisition-of-a-leading-district-energy-platform-located-in-the-united-states-301552231.html"],
    sectors: ["Utilities", "Transportation", "Social Infrastructure"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.prnewswire.com/news-releases/vauban-infrastructure-partners-announces-the-closing-of-the-acquisition-of-a-leading-district-energy-platform-located-in-the-united-states-301552231.html",
  }),
  f("FUND-152", "Vauban Infrastructure Partners", "Core Infrastructure Fund V (CIF V)", "2025", "€2.75B", 3025, "Core", "Raising", {
    description: "The next active generation of Vauban's flagship CIF strategy, operating under an updated mandate that specifically pursues strategic asset expansion into North America. Investcorp SCG recently acquired a stake in the platform.",
    investmentStrategy: "The next active generation of Vauban's flagship CIF strategy, operating under an updated mandate that specifically pursues strategic asset expansion into North America.",
    sourceUrls: ["https://www.infrastructureinvestor.com/us-bank-regs-prompt-vauban-to-sell-stake-to-investcorps-scg/"],
    sectors: ["Utilities", "Transportation", "Social Infrastructure"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/us-bank-regs-prompt-vauban-to-sell-stake-to-investcorps-scg/",
  }),

  // ── Vision Ridge Partners ─────────────────────────────────
  f("FUND-153", "Vision Ridge Partners", "Sustainable Asset Fund IV (SAF IV)", "2023", "$2.4B", 2400, "Value-Add", "Deploying", {
    description: "SAF IV is a verified, closed-end direct infrastructure equity vehicle focused on value-add energy and sustainability acquisitions primarily within the North American market. The CEO noted the 'opportunity set remains quite compelling.'",
    investmentStrategy: "SAF IV is a verified, closed-end direct infrastructure equity vehicle focused on value-add energy and sustainability acquisitions primarily within the North American market.",
    sourceUrls: ["https://www.infrastructureinvestor.com/the-opportunity-set-remains-quite-compelling-says-vision-ridge-ceo-as-saf-iv-closes-on-2-4bn/", "https://inforcapital.com/funds/vision-ridge-partners-sustainable-asset-fund-iv/"],
    sectors: ["Renewables / Energy Transition", "Transportation", "Water"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/the-opportunity-set-remains-quite-compelling-says-vision-ridge-ceo-as-saf-iv-closes-on-2-4bn/",
  }),

  // ── Wafra Inc. ────────────────────────────────────────────
  f("FUND-154", "Wafra Inc.", "Wafra Real Assets & Infrastructure Fund II", "2021", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Active closed-end investment vehicle used by Wafra to execute direct, value-add North American infrastructure buyouts, such as telecom and long-haul fiber networks. Part of Wafra's $28 billion platform. Recently completed minority investment in Ardian.",
    investmentStrategy: "It is an active closed-end investment vehicle systematically used by Wafra to execute direct, value-add North American infrastructure buyouts, such as telecom and long-haul fiber networks.",
    sourceUrls: ["https://docs.fcc.gov/public/attachments/DA-23-949A1.pdf", "https://www.prnewswire.com/news-releases/wafra-completes-minority-investment-in-ardian-302619350.html", "https://www.wafra.com/our-strategies/real-assets/"],
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America"],
    strategyUrl: "https://www.wafra.com/our-strategies/real-assets/",
  }),
  f("FUND-155", "Wafra Inc.", "Wafra Real Assets & Infrastructure Platform (SMA)", "2014", "$3.0B", 3000, "Value-Add", "Evergreen", {
    description: "Wafra's Real Assets & Infrastructure initiative leverages an active captive platform format — executing through flexible SMAs — to continuously deploy capital into North American infrastructure. $3 billion in commitments across the real assets platform.",
    investmentStrategy: "Wafra's Real Assets & Infrastructure initiative leverages an active captive platform format—executing through flexible SMAs—to continuously deploy capital into North American infrastructure.",
    sourceUrls: ["https://www.westportalpha.com/", "https://www.wafra.com/our-strategies/real-assets/"],
    sectors: ["Digital Infrastructure", "Communications", "Utilities"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.wafra.com/our-strategies/real-assets/",
  }),
];

// ─── Build-Time Data Validation ─────────────────────────────

function validateFundData(): void {
  const errors: string[] = [];
  const idSet = new Set<string>();
  const EXPECTED_COUNT = 155;

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
