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
  strategyUrl: string;
  rationale: string;
  sourceUrls: string[];
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
  overrides?: Partial<Pick<Fund, "description" | "sectors" | "regions" | "strategies" | "structure" | "ticker" | "strategyUrl" | "rationale" | "sourceUrls">>,
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
    strategyUrl: overrides?.strategyUrl ?? "",
    rationale: overrides?.rationale ?? "",
    sourceUrls: overrides?.sourceUrls ?? [],
  };
}

// ─── Fund Data ───────────────────────────────────────────────

export const funds: Fund[] = [
  // ── 3i Group ──────────────────────────────────────────────
  f("FUND-001", "3i Group", "3i Infrastructure plc", "2007", "£3.8B", 4940, "Core-Plus", "Evergreen", {
    description: "London-listed (FTSE 250) core-plus infrastructure company managed by 3i Investments plc, investing in a concentrated portfolio of mid-market economic infrastructure businesses. Portfolio value of approximately £3.8 billion with £466M available liquidity. Focuses on structural growth markets across digital, transport, utilities, and energy transition. Active management approach emphasizing growth capex within portfolio companies and accretive realizations — recent exits include TCR (sold for ~£1B, March 2026) and Valorem (€310M net proceeds, 21% gross IRR). Capital raised through public equity markets with FY25 dividend ~2.5x covered by net income.",
    sectors: ["Digital Infrastructure", "Transportation", "Utilities", "Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Europe", "North America", "Asia-Pacific"],
    structure: "Listed / Evergreen",
    ticker: "3IN.L",
    strategyUrl: "https://www.3i-infrastructure.com/investors",
    rationale: "Qualifies as an active listed evergreen investment vehicle equipped with permanent capital to directly acquire Core-Plus infrastructure equity assets in North America.",
    sourceUrls: ["https://www.3i.com/infrastructure/our-funds/", "https://www.3i-infrastructure.com/about-us/investment-manager/investment-policy/"],
  }),
  f("FUND-002", "3i Group", "3i North American Infrastructure Fund", "2022", "$739M", 739, "Core-Plus", "Deploying", {
    description: "Inaugural dedicated North American fund from 3i, targeting mid-market core-plus infrastructure across four key verticals: digital infrastructure (cell towers, fiber), transportation (airport services), environmental services (waste management), and communications. Final close of $739M in December 2023; currently managing ~$1B of assets and 75% invested as of March 2024. Notable transactions include Shared Tower (Canada's leading carrier-neutral comms developer — tower portfolio tripled during hold, sold to Northleaf in Feb 2025 for the fund's first exit), EC Waste (largest integrated solid waste company in Puerto Rico), AmWaste (300,000+ customers weekly across Alabama, Georgia, Louisiana), and Smarte Carte (operating in 300+ airports globally).",
    sectors: ["Digital Infrastructure", "Transportation", "Waste / Environmental Services", "Communications"],
    regions: ["North America"],
    strategyUrl: "https://www.3i.com/infrastructure/our-funds",
    rationale: "Traditional closed-end fund actively making direct infrastructure equity investments exclusively in the North American market.",
    sourceUrls: ["https://www.3i.com/media/fkcntktr/infrastructure_business_review.pdf", "https://www.3i.com/media/news/2025/3i-announces-sale-of-its-investment-in-shared-tower/"],
  }),

  // ── Acadia Infrastructure Capital ─────────────────────────
  f("FUND-003", "Acadia Infrastructure Capital", "Acadia Infrastructure Capital LP", "2023", "$107.4M", 107, "Value-Add", "Deploying", {
    description: "SEC-registered investment adviser (CRD #326032) focused on driving the US energy transition through strategic mid-market deployment of common equity, structured equity, and tax credit transfers. Addresses the equity funding gap created by the Inflation Reduction Act in a market expected to attract $2 trillion over the next decade. Notable investments include JVR Energy Park (San Diego, 90 MWac solar + 70 MWac/280 MWh battery storage, $416M funding) and a 210 MW Texas solar farm with Matrix Renewables. Leadership includes Tim Short (Founder, 20+ years energy/infrastructure), Michael Hamilton (ex-KKR, Capital Dynamics, BlackRock), and Oleg Shamovsky (Partner, 10 years building KKR's European infrastructure business).",
    sectors: ["Renewables / Energy Transition", "Utilities", "Social Infrastructure"],
    regions: ["North America"],
    strategyUrl: "https://www.prnewswire.com/news-releases/acadia-infrastructure-capital-launches-investment-platform-to-accelerate-us-energy-transition-301987696.html",
    rationale: "Active RIA management platform structured to deploy bespoke direct infrastructure equity in North America.",
    sourceUrls: ["https://radientanalytics.com/firm/adv/acadia-infrastructure-capital-lp-326032", "https://www.acadiainfrastructure.com/team", "https://www.acadiainfrastructure.com/about"],
  }),
  // Source: https://www.prnewswire.com/news-releases/acadia-infrastructure-capital-launches-climate-and-communities-investment-coalition-with-microsoft-302328219.html | https://esgnews.com/microsoft-acadia-launch-climate-investment-coalition-backing-9b-in-renewable-projects/
  f("FUND-004", "Acadia Infrastructure Capital", "Climate and Communities Investment Coalition", "2024", "$9.0B", 9000, "Core-Plus", "Deploying", {
    description: "Large-scale coalition mobilizing capital for climate infrastructure in disadvantaged communities, investing across clean energy, transportation, and water infrastructure.\nPortfolio:\nRenewables / Energy Transition: JVR Energy Park (Solar), Peregrine Energy Storage (Battery Storage), Pivot Energy Portfolio (Community Solar), Project Soho (Solar), Stillhouse Solar Project (Solar)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Water", "Social Infrastructure"],
    regions: ["North America"],
    strategyUrl: "https://www.prnewswire.com/news-releases/acadia-infrastructure-capital-launches-climate-and-communities-investment-coalition-with-microsoft-302328219.html",
  }),

  // Actis
  // Source: https://disclosures.ifc.org/project-detail/SII/51757/actis-energy-6 | https://pe-insights.com/actis-collects-6bn-for-energy-infrastructure-fund/
  f("FUND-005", "Actis", "Actis Energy 6", "2025", "$6.0B", 6000, "Value-Add", "Deploying", {
    description: "Flagship energy fund investing in power generation, renewable energy, and energy transition assets across high-growth emerging markets in Africa, Asia, and Latin America.\nPortfolio:\nPower Generation: Bridgin Power (Gas-to-Power)\nRenewables / Energy Transition: Argo Energy (Renewables Platform), Athena Renewable Energy (Renewables Platform), BluPine Energy (Renewables Platform), Catalyze (Distributed Energy), Levanta Renewables (Renewables Platform), MTerra Solar (Solar), Nozomi Energy (Renewables Platform), Oman Green Hydrogen Project (Green Hydrogen), Orygen (Green Hydrogen), Rezolv Energy (Renewables Platform), Stride Climate Investments (Renewables Platform), Valia Energía (Renewables Platform), Yellow Door Energy (Distributed Solar)",
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["Asia-Pacific", "Latin America", "Middle East & Africa"],
    strategyUrl: "https://disclosures.ifc.org/project-detail/SII/51757/actis-energy-6",
  }),
  // Source: https://www.act.is/2025/05/13/actis-raises-us1-7-billion-for-second-long-life-infrastructure-fund/ | https://www.esgtoday.com/actis-raises-1-7-billion-for-brownfield-infrastructure-investment-fund/
  f("FUND-006", "Actis", "Actis Long Life Infrastructure Fund 2 (ALLIF2)", "2025", "$1.7B", 1700, "Core-Plus", "Deploying", {
    description: "Core-plus fund targeting long-life, contracted infrastructure assets in emerging markets, focusing on energy, utilities, and digital infrastructure with predictable cash flows.\nPortfolio:\nDigital Infrastructure: Chayora (Data Centers), ConnectisTower (Towers), Epoch Digital (Data Centers), NextStream (Fiber Networks), Rack Centre (Data Centers), Skyline (Towers), Swiftnet (Towers)\nRenewables / Energy Transition: TERRANOVA (Renewables Platform)\nTransportation: Colombian Toll Road Portfolio (Toll Roads), NXT Infra (Toll Roads)\nUtilities: Barghest Building Performance (bbp) (Energy Efficiency), BGPL (Gas Distribution), Emicool (District Cooling), HRZ Transmissoras (Electricity Transmission), Uludag Energy (Electricity Distribution)\nWaste / Environmental Services: 800 Super Holdings (Waste Management)",
    sectors: ["Utilities", "Digital Infrastructure", "Power Generation"],
    regions: ["Asia-Pacific", "Latin America", "Middle East & Africa"],
    strategyUrl: "https://www.act.is/2025/05/13/actis-raises-us1-7-billion-for-second-long-life-infrastructure-fund",
  }),
  // Source: https://www.act.is/2024/11/11/hong-kong-monetary-authority-anchors-actis-asia-climate-strategy-to-support-decarbonisation-in-asia/ | https://www.aiib.org/en/projects/details/2024/approved/Multicountry-Actis-Asia-Climate-Transition-Fund.html
  f("FUND-007", "Actis", "Actis Asia Climate Transition Fund", "2024", "$560M", 560, "Value-Add", "Deploying", {
    description: "SFDR Article 9 climate transition fund investing in renewable energy infrastructure, energy solutions, and sustainable transportation across Asia-Pacific emerging markets.\nPortfolio:\nRenewables / Energy Transition: Argo Energy (Renewables Platform), Terra Solar (Solar)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Power Generation"],
    regions: ["Asia-Pacific"],
    strategyUrl: "https://www.act.is/2024/11/11/hong-kong-monetary-authority-anchors-actis-asia-climate-strategy-to-support-decarbonisation-in-asia",
  }),

  // Allianz Global Investors
  // Source: https://www.allianzcapitalpartners.com/en/media/news/032422-allianz-european-infrastructure-fund-ii-holds-first-close-at-eur-880mn | https://realassets.ipe.com/news/allianz-raises-initial-880m-for-latest-european-infrastructure-fund/10058816.article
  f("FUND-008", "Allianz Global Investors", "Allianz European Infrastructure Fund II (AEIF II)", "2021", "€880M+", 968, "Core", "Deploying", {
    description: "Core infrastructure fund targeting brownfield essential services assets in Europe, including transportation, digital infrastructure, utilities, and renewables with regulated or contracted revenues.\nPortfolio:\nCommunications: ATC Europe (Towers)\nDigital Infrastructure: NÖGIG (Fiber Networks), Northstar (Data Centers), oeGIG (Fiber Networks), Queenspoint Platforms (Data Centers), Unsere Grüne Glasfaser (UGG) (Fiber Networks), XpFibre (Fiber Networks), Yondr Group (Data Centers)\nMidstream / Energy: Gas Connect Austria (GCA) (Gas Transmission), Gassled (Gas Pipelines), NET4GAS (Gas Transmission)\nRenewables / Energy Transition: Dargikowo and Karlino (ENERTRAG) (Wind), Fuella AS (Biofuels), He Dreiht (Offshore Wind), Kyon Energy Storage Portfolio (Battery Storage), Ren-Gas (Green Hydrogen)\nSocial Infrastructure: Colchester Garrison (Military Housing)\nTransportation: Autostrade per l'Italia (ASPI) (Toll Roads), Chicago Parking Meters (Parking), IndInfravit Trust (Toll Roads), Metro de Barcelona Line 9 (Queenspoint) (Rail / Metro), Northrail (Rolling Stock Leasing), Porterbrook (Rolling Stock Leasing), Tank & Rast (Motorway Services)\nUtilities: Cadent Gas (Gas Distribution), Delgaz Grid (Gas & Electric Distribution), Elenia (Electricity Distribution), Floene (formerly GGND) (Gas Distribution), GasNet (Gas Distribution), Nedgia (Gas Distribution), NeuConnect (Interconnectors)\nWater: Affinity Water (Water Supply), Thames Tideway Tunnel (Wastewater)",
    sectors: ["Transportation", "Digital Infrastructure", "Utilities", "Renewables / Energy Transition"],
    regions: ["Europe"],
    strategyUrl: "https://www.allianzcapitalpartners.com/en/media/news/032422-allianz-european-infrastructure-fund-ii-holds-first-close-at-eur-880mn",
  }),

  // Amber Infrastructure
  // Source: https://www.internationalpublicpartnerships.com/ | https://www.amberinfrastructure.com/our-funds/international-public-partnerships/
  f("FUND-009", "Amber Infrastructure", "International Public Partnerships (INPP)", "2006", "£3.0B+", 3900, "Core", "Evergreen", {
    description: "FTSE 250-listed infrastructure investment company targeting availability-based and regulated public infrastructure assets globally, including schools, hospitals, transport, and utility networks.\nPortfolio:\nDigital Infrastructure: Community Fibre (Fiber Networks), iseek (Data Centers), toob (Fiber Networks), YourDC (Data Centers)\nLogistics: Maine International Cold Storage Facility (Cold Storage)\nPower Generation: Sizewell C (Nuclear)\nRenewables / Energy Transition: Groveland Mine Solar (Solar)\nSocial Infrastructure: Building Schools for the Future (BSF) Portfolios (Education PPP), Dublin Criminal Courts (Courts PPP), Durham Region Courthouse (Courts PPP), Family Housing for Service Personnel (Military Housing), New Zealand Schools (Education PPP), Police Headquarters South-East Hesse (Government PPP), Royal Children's Hospital (Healthcare PPP), Wakatipu High School (Education PPP)\nTransportation: Angel Trains (Rolling Stock Leasing), BeNEX (Rail), Diabolo Rail Link (Rail), Gold Coast Light Rail (Light Rail), RailFirst (Rolling Stock Leasing), Reliance Rail (Rolling Stock Leasing)\nUtilities: Barrow OFTO (Electricity Transmission), Beatrice OFTO (Electricity Transmission), Cadent Gas (Gas Distribution), City Light & Power (Electricity Distribution), East Anglia One OFTO (Electricity Transmission), Lincs OFTO (Electricity Transmission), Moray East OFTO (Electricity Transmission), Ormonde OFTO (Electricity Transmission), UK Offshore Transmission Owners (OFTOs) (Electricity Transmission)\nWater: Thames Tideway Tunnel (Wastewater)",
    sectors: ["Social Infrastructure", "Transportation", "Utilities", "Digital Infrastructure"],
    regions: ["Europe", "North America", "Asia-Pacific"],
    structure: "Listed / Evergreen",
    ticker: "INPP.L",
    strategyUrl: "https://www.amberinfrastructure.com/our-funds/international-public-partnerships",
  }),
  // Source: https://www.amberinfrastructure.com/funds/us-solar-fund-plc/ | https://www.ussolarfund.co.uk/sites/default/files/usf_annual_report_2024_pres_vfinal.pdf
  f("FUND-010", "Amber Infrastructure", "US Solar Fund plc (USF)", "2019", "~$250M", 250, "Core", "Evergreen", {
    description: "London-listed closed-end investment company investing in a diversified portfolio of operational solar power assets in the United States with long-term power purchase agreements.\nPortfolio:\nRenewables / Energy Transition: USF Solar Portfolio (Solar)",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America"],
    structure: "Listed / Evergreen",
    ticker: "USF.L",
    strategyUrl: "https://www.amberinfrastructure.com/funds/us-solar-fund-plc",
  }),
  // Source: https://www.amberinfrastructure.com/news/press-releases/2022/amber-advised-fund-acquires-five-new-zealand-infrastructure-assets-from-morrison-co/ | https://www.infrastructureinvestor.com/amber-infrastructure-buys-morrison-co-assets-to-enter-nz-market/
  f("FUND-011", "Amber Infrastructure", "Amber & Partners Infrastructure New Zealand Fund", "2025", "Undisclosed", null, "Core-Plus", "Evergreen", {
    description: "Open-end fund investing in social infrastructure PPP assets in New Zealand, including schools, student accommodation, and correctional facilities.",
    sectors: ["Social Infrastructure"],
    regions: ["Asia-Pacific"],
    structure: "Open-End",
    strategyUrl: "https://www.amberinfrastructure.com/news/press-releases/2022/amber-advised-fund-acquires-five-new-zealand-infrastructure-assets-from-morrison-co",
  }),
  // Source: https://www.amberinfrastructure.com/our-funds/the-green-new-deal-fund/ | https://www.localgov.co.uk/Combined-authority-launches-18m-fund-to-boost-green-investment-/53357
  f("FUND-012", "Amber Infrastructure", "The Green New Deal Fund (GNDF)", "2021", "£18M", 23, "Value-Add", "Deploying", {
    description: "Impact-focused fund catalyzing green infrastructure investment in Northeast England, funding community energy schemes, EV charging, building retrofits, and small-scale renewables.",
    sectors: ["Renewables / Energy Transition", "Transportation"],
    regions: ["Europe"],
    structure: "Closed-End",
    strategyUrl: "https://www.amberinfrastructure.com/our-funds/the-green-new-deal-fund",
  }),
  // Source: https://3siif.eu/ | https://www.amberinfrastructure.com/our-funds/three-seas-initiative-investment-fund/
  f("FUND-013", "Amber Infrastructure", "Three Seas Initiative Investment Fund (3SIIF)", "2019", "€1.0B+", 1100, "Core-Plus", "Deploying", {
    description: "Geopolitically-driven infrastructure fund investing in energy, transportation, and digital infrastructure connecting Central and Eastern European countries between the Baltic, Adriatic, and Black Seas.\nPortfolio:\nDigital Infrastructure: Greenergy Data Centers (Data Centers)\nLogistics: BMF Port Burgas (Ports)\nRenewables / Energy Transition: Enery (Solar & Wind), R.Power Renewables (Solar)\nTransportation: Cargounit (Rolling Stock Leasing)",
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Europe"],
    strategyUrl: "https://www.amberinfrastructure.com/our-funds/three-seas-initiative-investment-fund",
  }),

  // Ancala Partners
  // Source: https://ancala.com/ancala-announces-final-close-of-third-flagship-infrastructure-fund/ | https://www.infrastructureinvestor.com/ancalas-third-flagship-closes-oversubscribed-on-e1-4bn-exclusive/
  f("FUND-014", "Ancala Partners", "Ancala Infrastructure Fund III", "2022", "€1.4B", 1540, "Core-Plus", "Deploying", {
    description: "Mid-market core-plus infrastructure fund investing in essential infrastructure businesses across the UK and Europe, including renewable energy, transport, utilities, water, and the circular economy.\nPortfolio:\nCommunications: TorLoc Towers (Towers)\nLogistics: Fjord Base (Supply Base)\nMidstream / Energy: SAGE (Ancala Midstream) (Gas Pipelines), Valentra (Chemical Pipelines)\nRenewables / Energy Transition: Croatian Biomass Platform (Biomass), HS Orka (Geothermal), Magnon Green Energy (Biomass), Noventa (Hydro), Orites (Onshore Wind), Solandeo (Solar)\nSocial Infrastructure: Iris Care Group (Healthcare)\nTransportation: Avincis (Aviation Services), Hector Rail (Rail Freight), Liverpool Airport (Airports), Phoenix Rail (Short-Line Rail)\nUtilities: Hausheld Group (Energy Services), Islands Energy Group (Multi-Utility)\nWaste / Environmental Services: MUCH Gruppe (Waste Management)\nWater: Ancala Water Services (Water Supply)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities", "Water", "Waste / Environmental Services"],
    regions: ["Europe"],
    strategyUrl: "https://ancala.com/ancala-announces-final-close-of-third-flagship-infrastructure-fund",
  }),

  // Antin Infrastructure Partners
  // Source: https://www.antin-ip.com/media/our-news/antin-infrastructure-partners-closes-flagship-fund-v-above-e10-billion-target | https://www.businesswire.com/news/home/20241218148128/en/Antin-Infrastructure-Partners-Closes-Flagship-Fund-V-Above-%E2%82%AC10-Billion-Target
  f("FUND-015", "Antin Infrastructure Partners", "Flagship Fund V", "2022", "€10.2B", 11220, "Value-Add", "Deploying", {
    description: "Antin's largest flagship fund targeting controlling equity investments in established infrastructure businesses across energy & environment, digital, transport, and social infrastructure in Europe and North America.\nPortfolio:\nDigital Infrastructure: NorthC Datacenters (Data Centers)\nRenewables / Energy Transition: Blue Elephant Energy (Solar & Wind), Opdenergy (Solar & Wind)\nSocial Infrastructure: Consilium Safety Group (Fire Safety Systems), Portakabin (Modular Buildings)\nTransportation: Proxima (Velvet) (High-Speed Rail), Vigor Marine Group (Marine Services)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Social Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.antin-ip.com/media/our-news/antin-infrastructure-partners-closes-flagship-fund-v-above-e10-billion-target",
  }),
  // Source: https://www.antin-ip.com/media/our-news/antin-infrastructure-partners-closes-inaugural-mid-cap-fund-e22-billion-hard-cap | https://pitchbook.com/news/articles/antin-infrastructure-secures-10b-for-latest-flagship-fund
  f("FUND-016", "Antin Infrastructure Partners", "Mid Cap Fund I", "2021", "€2.2B", 2420, "Value-Add", "Deploying", {
    description: "Antin's inaugural mid-cap strategy targeting smaller infrastructure opportunities across energy & environment, digital, transport, and social sectors in Europe and North America.\nPortfolio:\nDigital Infrastructure: Empire Access (Fiber Networks), Pulsant (Data Centers)\nTransportation: Aquavista (Marinas), Lake State Railway Company (LSRC) (Rail), Swiftair (Air Cargo)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Social Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.antin-ip.com/media/our-news/antin-infrastructure-partners-closes-inaugural-mid-cap-fund-e22-billion-hard-cap",
  }),
  // Source: https://www.antin-ip.com/media/our-news/antin-holds-final-close-on-inaugural-nextgen-fund-at-e1-2-billion-target | https://www.businesswire.com/news/home/20231129664042/en/Antin-holds-final-close-on-inaugural-NextGen-fund-at-%E2%82%AC1.2-billion-target
  f("FUND-017", "Antin Infrastructure Partners", "NextGen Fund I", "2021", "€1.2B", 1320, "Value-Add", "Deploying", {
    description: "Growth-oriented fund targeting next-generation digital and energy transition infrastructure, including fiber, data centers, EV charging, and distributed energy in Europe.\nPortfolio:\nRenewables / Energy Transition: Pearl (Distributed Energy), SNRG (Solar)\nTransportation: GTL Leasing (Hydrogen Equipment Leasing), Matawan (Smart Mobility), Power Dot (EV Charging), RAW Charging (EV Charging)",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Communications"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Growth"],
    strategyUrl: "https://www.antin-ip.com/media/our-news/antin-holds-final-close-on-inaugural-nextgen-fund-at-e1-2-billion-target",
  }),

  // Apollo Global Management
  // Source: https://www.apollo.com/strategies/asset-management/real-assets/infrastructure | https://pitchbook.com/profiles/fund/22588-93F
  f("FUND-018", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund III", "2022", "$2.4B", 2400, "Value-Add", "Deploying", {
    description: "Mid-market value-add infrastructure fund making control-oriented equity investments in communications, power & renewables, transportation, and corporate carveouts in the US and Europe.\nPortfolio:\nDigital Infrastructure: FirstDigital Telecom (Fiber Networks), Hyperoptic (Fiber Networks), Intel Fab 34 JV (Semiconductor Fab), Stack Infrastructure (Data Centers), STACK Infrastructure Europe (Data Centers), Stream Data Centers (Data Centers), TierPoint (Data Centers), Yondr Group (Data Centers)\nMidstream / Energy: Trans Adriatic Pipeline (TAP) (Gas Pipelines)\nPower Generation: Caledonia Generating LLC (Gas-to-Power)\nRenewables / Energy Transition: Apterra Infrastructure Capital (Renewables Platform), Great Bay Renewables (Renewables Finance), Ionic Blue (Johnson Controls JV) (Building Automation), NextEra Energy Partners Renewable Portfolio (Wind & Solar), Summit Ridge Energy (Community Solar), WEC Energy Group Renewable Portfolio (Wind & Solar)\nTransportation: Freedom CNG (CNG Fueling), Modern Aviation (Aviation Services)\nUtilities: Corning Natural Gas Corporation (Gas Distribution), Cross-Sound Cable Company (Interconnectors), Duquesne Light Company (Electricity Distribution), Hudson Transmission Partners (Electricity Transmission), The State Group (Energy Services)\nWaste / Environmental Services: GFL Environmental Services (Waste Collection)",
    sectors: ["Communications", "Power Generation", "Renewables / Energy Transition", "Transportation", "Digital Infrastructure"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.infrastructureinvestor.com/apollo-reaches-2-4bn-final-close-on-third-infra-fund-exclusive/",
  }),
  // Source: https://www.apollo.com/strategies/asset-management/real-assets/infrastructure | N/A -- could not find a specific fund by this exact name
  f("FUND-019", "Apollo Global Management", "Apollo Core Infrastructure Fund", "2022", "Undisclosed", null, "Core", "Deploying", {
    description: "Core infrastructure fund targeting essential assets with contracted or regulated revenue streams in utilities, renewables, and digital infrastructure across developed markets.",
    sectors: ["Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["North America", "Europe"],
    structure: "Open-End",
    strategyUrl: "https://www.apollo.com/strategies/asset-management/real-assets/infrastructure",
  }),
  // Source: https://www.apollo.com/wealth/strategies/products/apollo-infrastructure-company | https://www.sec.gov/Archives/edgar/data/1971381/000119312525068918/d888030d10k.htm
  f("FUND-020", "Apollo Global Management", "Apollo Infrastructure Company LLC (AIC)", "2023", "~$1.7B", 1700, "Core-Plus", "Evergreen", {
    description: "Perpetual-life operating company investing in energy transition, communications and digital infrastructure, and transportation & logistics assets globally.\nPortfolio:\nSocial Infrastructure: Tosca Holdco (Essential Services)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Communications", "Transportation", "Logistics"],
    regions: ["North America", "Europe"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.apollo.com/wealth/strategies/products/apollo-infrastructure-company",
  }),
  // Source: https://www.apollo.com/insights-news/pressreleases/2023/04/apollo-launches-clean-transition-capital-strategy-to-support-firmwide-target-to-deploy-50-billion-by-2027-2654978 | https://pitchbook.com/profiles/fund/24869-17F
  f("FUND-021", "Apollo Global Management", "Apollo Clean Transition Equity Partners II", "2023", "$411M+", 411, "Value-Add", "Deploying", {
    description: "Climate-focused fund investing in clean energy equity and infrastructure assets supporting the energy transition, including solar, wind, storage, and grid modernization.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.apollo.com/insights-news/pressreleases/2023/04/apollo-launches-clean-transition-capital-strategy-to-support-firmwide-target-to-deploy-50-billion-by-2027-2654978",
  }),
  // Source: https://www.apollo.com/insights-news/pressreleases/2023/12/apollo-adds-eltif-to-wealth-product-platform-following-cssf-regulatory-approval-2793573 | https://pitchbook.com/profiles/fund/26010-64F
  f("FUND-022", "Apollo Global Management", "Apollo Clean Transition Equity ELTIF", "2023", "Undisclosed", null, "Value-Add", "Evergreen", {
    description: "European Long-Term Investment Fund providing retail and institutional investors access to clean energy transition infrastructure across Europe.\nPortfolio:\nRenewables / Energy Transition: Ionic Blue (Johnson Controls JV) (Building Automation), Purmo Group (Heating & Cooling), TotalEnergies Texas Solar & BESS Portfolio (Solar & Storage)",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe"],
    strategyUrl: "https://www.apollo.com/insights-news/pressreleases/2023/12/apollo-adds-eltif-to-wealth-product-platform-following-cssf-regulatory-approval-2793573",
  }),

  // Ara Partners
  // Source: https://www.arapartners.com/news/ara-partners-reaches-final-close-for-inaugural-infrastructure-fund-surpassing-target/ | https://www.esgtoday.com/ara-partners-raises-800-million-to-invest-in-mid-market-decarbonization-infrastructure-providers/
  f("FUND-023", "Ara Partners", "Ara Infrastructure Fund I", "2022", "$800M", 800, "Value-Add", "Deploying", {
    description: "Industrial decarbonization fund investing in companies and projects that reduce carbon emissions across energy-intensive sectors including chemicals, building materials, and industrial processes.",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.arapartners.com/news/ara-partners-reaches-final-close-for-inaugural-infrastructure-fund-surpassing-target",
  }),
  // Source: https://www.arapartners.com/ | https://www.infrastructureinvestor.com/ara-partners-eyes-up-to-1-5bn-for-new-energy-fund-exclusive/
  f("FUND-024", "Ara Partners", "Ara Energy Decarbonization Fund I", "2024", "$1.5B", 1500, "Value-Add", "Deploying", {
    description: "Successor fund scaling industrial decarbonization investments in hard-to-abate sectors, targeting energy efficiency, circular economy, and low-carbon manufacturing infrastructure.\nPortfolio:\nDigital Infrastructure: Centric Fiber (Fiber Networks)\nMidstream / Energy: Lincoln Terminal (Tank Storage)\nRenewables / Energy Transition: Anesco (Solar & Storage), Fluitron (Hydrogen Equipment), USD Clean Fuels (Biofuels)\nWaste / Environmental Services: CycleØ (Recycling), Divert (Food Waste), Natural World Products (NWP) (Biomaterials)",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.arapartners.com/what-we-do/strategies/infrastructure",
  }),

  // ArcLight Capital
  // Source: https://arclight.com/ | https://pitchbook.com/profiles/fund/24871-06F
  f("FUND-025", "ArcLight Capital", "ArcLight Infrastructure Partners Fund VIII", "2023", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "Value-add energy infrastructure fund investing in North American power generation, midstream, and renewable energy assets with operational improvement opportunities.\nPortfolio:\nMidstream / Energy: Gulf Coast Express (GCX) (Gas Pipelines), Natural Gas Pipeline Company of America (NGPL) (Gas Pipelines), Naugatuck Avenue Storage (Gas Storage)\nPower Generation: Advanced Power (Gas-to-Power), Alpha Generation (AlphaGen) (Gas-to-Power), Eastern Generation (Gas-to-Power), Generation Bridge (Gas-to-Power), Griffith Energy (Gas-to-Power), Kleen Energy Systems (Gas-to-Power), Lordstown Energy Center (Gas-to-Power), Middletown Energy Center (Gas-to-Power), Parkway Generation (Gas-to-Power), Takanock (Gas-to-Power)\nRenewables / Energy Transition: Elevate Renewables (Wind & Solar), Infinigen Renewables (Wind), REC Solar (Solar), SkyVest Renewables (Wind), Swift Current Energy (Solar & Storage), Thunderbird Renewables (Wind)",
    sectors: ["Power Generation", "Midstream / Energy", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://irei.com/news/arclight-infrastructure-partners-fund-viii-nears-3b-fundraising-goal",
  }),
  // Source: https://arclight.com/ | https://pitchbook.com/profiles/fund/27828-01F
  f("FUND-026", "ArcLight Capital", "ArcLight Power Infrastructure Partners", "2024", "$250M", 250, "Value-Add", "Deploying", {
    description: "Focused power infrastructure fund investing in small-to-mid-scale generation assets including natural gas, battery storage, and distributed energy resources in North America.",
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://arclight.com/focus/",
  }),

  // Ardian
  // Source: https://www.ardian.com/news-insights/press-releases/ardian-raises-20bn-power-essential-european-infrastructure | https://www.infrastructureinvestor.com/ardian-closes-fund-vi-on-e11-5bn-hard-cap/
  f("FUND-027", "Ardian", "Ardian Infrastructure Fund VI", "2023", "€11.5B", 12650, "Core-Plus", "Deploying", {
    description: "Flagship core-plus infrastructure fund targeting essential mid-market assets in energy, transport, telecom, and social infrastructure across Europe and the Americas.\nPortfolio:\nCommunications: INWIT (Towers), Unison (Towers)\nDigital Infrastructure: 3NEW / 4NEW (Fiber Networks), Adamo (Fiber Networks), Míla (Fiber Networks), MXT Holdings (Data Centers), Verne (Data Centers)\nMidstream / Energy: Géosel (Oil Storage)\nPower Generation: Verlat Energy (Gas-to-Power)\nRenewables / Energy Transition: Akuo (Renewables Platform), Andberg Vind (Wind), GreenYellow (Distributed Solar), Hamnefjell Vinkraft (Wind), Honkajoki Wind Park (Wind), InEnergy Solar Italy (Solar), Novasol Invest La Isla (Solar), Skyline Renewables (Wind), Tolve Windfarms Holding (Wind)\nSocial Infrastructure: ICQ Holding (Healthcare)\nTransportation: AFCO (Aviation Services), Ascendi (Toll Roads), ASTM (Toll Roads), Ataca and Pantac (Toll Roads), CampusParc (Parking), Clermont (Toll Roads), Heathrow Airport (Airports), LISEA (High-Speed Rail), Maple Leaf (Toll Roads), Milione SpA / Save SpA (Airports), SPMR (Rail), Tacna and Panamericana (Toll Roads), UNITe (EV Charging), Vespucio Norte Express & Túnel San Cristóbal (Toll Roads), Wintics (Smart Mobility)\nUtilities: CGE Palea Arsa (Water & Wastewater), Energia & Servizi (Energy Services), EWE (Multi-Utility), Nevel (District Heating)\nWaste / Environmental Services: Attero (Waste-to-Energy)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Communications", "Social Infrastructure", "Utilities"],
    regions: ["Europe", "North America", "Latin America"],
    strategyUrl: "https://www.ardian.com/news-insights/press-releases/ardian-raises-20bn-power-essential-european-infrastructure",
  }),
  // Source: https://www.ardian.com/press-releases/ardian-closes-its-second-generation-americas-infrastructure-fund-us21bn | https://pitchbook.com/profiles/fund/18278-74F
  f("FUND-028", "Ardian", "Ardian Americas Infrastructure Fund V", "2022", "$2.1B", 2100, "Core-Plus", "Deploying", {
    description: "Americas-focused infrastructure fund investing in mid-market essential services including energy, transportation, and digital infrastructure in North and Latin America.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Digital Infrastructure", "Utilities"],
    regions: ["North America", "Latin America"],
    strategyUrl: "https://www.ardian.com/press-releases/ardian-closes-its-second-generation-americas-infrastructure-fund-us21bn",
  }),
  // Source: https://www.ardian.com/press-releases/ardian-launches-first-open-ended-fund-dedicated-energy-transition | https://www.ardian.com/news-insights/press-releases/ardian-clean-energy-evergreen-fund-aceef-investing-french-renewable
  f("FUND-029", "Ardian", "Ardian Clean Energy Evergreen Fund (ACEEF)", "2022", "€1.0B", 1100, "Core-Plus", "Evergreen", {
    description: "Open-end evergreen fund investing in operational renewable energy assets across Europe, targeting onshore wind, solar PV, and battery storage with long-term contracted revenues.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Open-End",
    strategyUrl: "https://www.ardian.com/press-releases/ardian-launches-first-open-ended-fund-dedicated-energy-transition",
  }),

  // Ares Management
  // Source: https://www.aresmgmt.com/our-business/infrastructure-opportunities | https://pitchbook.com/profiles/fund/24186-70F
  f("FUND-030", "Ares Management", "Ares Climate Infrastructure Partners II", "2023", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "Climate infrastructure fund investing in renewable energy, energy efficiency, electrification, and decarbonization assets across North America and Europe.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.aresmgmt.com/our-business/infrastructure-opportunities",
  }),
  // Source: https://ir.aresmgmt.com/news/ares-management-closes-inaugural-usdollar24-billion-data-center-development-fund-in-japan/85038cd3-7064-4168-8f1d-36aff20d1030 | https://www.businesswire.com/news/home/20250611308330/en/Ares-Management-Closes-Inaugural-US$2.4-Billion-Data-Center-Development-Fund-in-Japan
  f("FUND-031", "Ares Management", "Ares Japan DC Partners I (JDC I)", "2025", "$2.4B", 2400, "Value-Add", "Deploying", {
    description: "Dedicated data center fund investing in the development and operation of hyperscale and enterprise data center campuses across Japan.",
    sectors: ["Digital Infrastructure"],
    regions: ["Asia-Pacific"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://ir.aresmgmt.com/news/ares-management-closes-inaugural-usdollar24-billion-data-center-development-fund-in-japan/85038cd3-7064-4168-8f1d-36aff20d1030",
  }),
  // Source: https://www.areswms.com/solutions/aci | https://www.sec.gov/Archives/edgar/data/2031750/000162828025025587/aci-20250331.htm
  f("FUND-032", "Ares Management", "Ares Core Infrastructure Fund (ACI)", "2024", "$3.9B", 3900, "Core", "Evergreen", {
    description: "Open-end core infrastructure fund targeting essential assets with stable, contracted cash flows across transportation, utilities, and digital infrastructure globally.\nPortfolio:\nDigital Infrastructure: Bluepeak (Fiber Networks), Prime Data Centers (Data Centers), Underline (Fiber Networks)\nMidstream / Energy: Meade Pipeline Co. (Gas Pipelines)\nRenewables / Energy Transition: Apex Clean Energy (Wind & Solar), Distributed Solar Development (DSD) (Community Solar), Dynamic Renewables (Biogas), EDP Renováveis (EDPR) US Portfolio (Wind & Solar), ENGIE US Renewables Portfolio (Wind & Solar), Tango Holdings (Renewables Platform)\nTransportation: Atlas Crane Service (Equipment Services), Current Trucking (Logistics)",
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    structure: "Open-End",
    strategyUrl: "https://www.areswms.com/solutions/aci",
  }),

  // Argo Infrastructure Partners
  // Source: https://www.argoip.com/ | https://pitchbook.com/profiles/company/111249-55
  f("FUND-033", "Argo Infrastructure Partners", "Argo Infrastructure Partners Series 4", "2024", "Undisclosed", null, "Core", "Deploying", {
    description: "Core infrastructure fund targeting contracted and regulated essential services assets in North America, focusing on utilities, water, and transportation.\nPortfolio:\nDigital Infrastructure: TierPoint (Data Centers)\nPower Generation: Black Hills Colorado IPP (Gas-to-Power), Carville Energy Center (Gas-to-Power), Oneta Energy Center (Gas-to-Power)\nRenewables / Energy Transition: Onyx Renewable Partners (Solar), Smoky Mountain Hydro (Hydro)\nTransportation: FleetLogix (Fleet Management), Freight Ninja (Logistics), LAZ Parking (Parking)\nUtilities: Corning Natural Gas (Gas Distribution), Cross-Sound Cable (Interconnectors), Hawaiʻi Gas (Gas Distribution), Hudson Transmission Partners (Electricity Transmission)\nWater: Bayonne Water (Water & Wastewater), Middletown Water (Water Supply)",
    sectors: ["Utilities", "Water", "Transportation"],
    regions: ["North America"],
    strategyUrl: "https://ir.apollo.com/news-events/press-releases/detail/533/apollo-to-acquire-argo-infrastructure-partners",
  }),

  // Astatine Investment Partners
  // Source: https://astatineip.com/infrastructure/ | https://pitchbook.com/profiles/fund/18186-76F
  f("FUND-034", "Astatine Investment Partners", "Astatine Infrastructure Fund IV", "2020", "$586M", 586, "Core-Plus", "Deploying", {
    description: "Mid-market infrastructure fund investing in essential services businesses across North America and Europe, with a focus on energy, environmental services, and transportation.\nPortfolio:\nDigital Infrastructure: Everfast Fiber Networks (Fiber Networks), Glide Group (Fiber Networks)\nLogistics: PECO Pallet (Pallet Pooling)\nTransportation: ACL Airshop (Aviation Services), BTR (Big Truck Rental) (Truck Leasing), Kelling Group (Logistics), McKeil Marine (Marine Services), Twin Parking Holdings (Parking)\nWaste / Environmental Services: NRG Riverside (Waste-to-Energy)",
    sectors: ["Utilities", "Waste / Environmental Services", "Transportation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://astatineip.com/infrastructure",
  }),

  // Asterion Industrial Partners
  // Source: https://www.asterionindustrial.com/asterion-completes-e3-4-billion-final-close-for-fund-iii-beating-target-despite-challenging-environment/ | https://www.infrastructureinvestor.com/asterion-closes-third-flagship-on-e3-4bn/
  f("FUND-035", "Asterion Industrial Partners", "Asterion Industrial Infra Fund III", "2024", "€3.4B", 3740, "Value-Add", "Deploying", {
    description: "Southern European-focused fund investing in industrial infrastructure including telecoms towers, fiber networks, energy, and environmental services with operational transformation.\nPortfolio:\nDigital Infrastructure: MS3 Networks (Fiber Networks), National Broadband Ireland (NBI) (Fiber Networks), Olin Group / Olivenet (Fiber Networks), Retelit / Irideos (Fiber Networks)\nMidstream / Energy: Dunkerque LNG (LNG)\nRenewables / Energy Transition: ABIO (Asterion Bioenergy) (Biogas), AMP Clean Energy (Biomass), Clubö (Heating & Cooling), Revalue Energies (Solar), Samso (Renewables Platform), Total Energies Greece Renewables JV (Wind & Solar)\nTransportation: 2i Aeroporti (Airports), Asterion Aircraft Leasing Platform (Bluelease) (Aircraft Leasing)\nUtilities: Axion / Lineox (Gas Distribution), Compagnie Electrique de Bretagne (Electricity Distribution)\nWaste / Environmental Services: Grupo SSG (Waste Management)",
    sectors: ["Communications", "Digital Infrastructure", "Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Europe"],
    strategyUrl: "https://www.asterionindustrial.com/asterion-completes-e3-4-billion-final-close-for-fund-iii-beating-target-despite-challenging-environment",
  }),

  // Axium Infrastructure
  // Source: https://www.axiuminfra.com/?lang=en | https://pitchbook.com/profiles/fund/13710-16F
  f("FUND-036", "Axium Infrastructure", "Axium Infrastructure Canada II L.P.", "2012", "C$1.14B+", 844, "Core", "Evergreen", {
    description: "Core infrastructure fund investing in contracted and regulated Canadian infrastructure assets including PPP projects, renewable energy, and social infrastructure.",
    sectors: ["Social Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.fieracapital.com/en/press-releases/press-release-122520",
  }),
  // Source: https://www.axiuminfra.com/?lang=en | https://whalewisdom.com/filer/fiera-axium-infrastructure-us-lp
  f("FUND-037", "Axium Infrastructure", "AxInfra US L.P.", "2013", "$3.53B", 3530, "Core", "Evergreen", {
    description: "Open-end core infrastructure fund investing in contracted US infrastructure assets including solar, wind, social infrastructure, and water/wastewater facilities.",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure", "Water"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.prnewswire.com/news-releases/axium-infrastructure-appoints-head-of-us-subsidiary-and-changes-name-523877321.html",
  }),
  // Source: https://www.axiuminfra.com/?lang=en | https://aum13f.com/fund/axinfra-us-ii-lp
  f("FUND-038", "Axium Infrastructure", "AxInfra US II L.P.", "2020", "$1.11B", 1110, "Core", "Evergreen", {
    description: "Continuation of Axium's US core infrastructure strategy, investing in contracted renewable energy and social infrastructure projects with long-term predictable cash flows.",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://adviserinfo.sec.gov/firm/summary/168164",
  }),
  // Source: https://www.axiuminfra.com/?lang=en | https://privatefunddata.com/private-funds/axinfra-us-iii-lp/
  f("FUND-039", "Axium Infrastructure", "AxInfra US III L.P.", "2021", "$1.78B", 1780, "Core", "Evergreen", {
    description: "Third US-focused open-end fund targeting core infrastructure assets with availability-based or contracted revenues in renewables and essential public services.",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure", "Water"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://realassets.ipe.com/news/crptf-targets-200m-for-infrastructure-in-debut-investment-with-axium/10072329.article",
  }),
  // Source: https://www.axiuminfra.com/?lang=en | https://formds.com/issuers/axium-infrastructure-na-iv-lp
  f("FUND-040", "Axium Infrastructure", "Axium Infrastructure NA IV L.P.", "2023", "$1.35B", 1350, "Core", "Evergreen", {
    description: "North American open-end core infrastructure fund investing in contracted renewable energy, social infrastructure, and essential services with inflation-linked revenues.",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure", "Utilities"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.axiuminfra.com/wp-content/uploads/2025/06/2024-SFDR-Website-Disclosure-EN-vF.pdf",
  }),
  // Source: https://www.axiuminfra.com/?lang=en | https://www.axiuminfra.com/wp-content/uploads/2025/06/2024-SFDR-Website-Disclosure-EN-vF.pdf
  f("FUND-041", "Axium Infrastructure", "Axium European Infrastructure Fund", "2022", "Undisclosed", null, "Core", "Evergreen", {
    description: "First European vehicle extending Axium's core infrastructure approach to contracted and regulated assets across Western Europe, targeting renewables and social infrastructure.\nPortfolio:\nPower Generation: Brooklyn Navy Yard Cogeneration (Cogeneration), Cascade Power Project (Gas-to-Power), CPV Three Rivers (Gas-to-Power)\nRenewables / Energy Transition: Axium Great Plains Wind LLC (Wind), BlueWave (Community Solar), Cedar Point II Wind Project (Wind), Constellation Renewables Partners (Renewables Platform), Copper Crossing Solar Facility (Solar), Crimson Storage (Battery Storage), Dry Lake II Wind Farm (Wind), Edwards Sanborn 1A & 1B (Solar & Storage), Grand Valley III Wind Farm (Wind), K2 Wind (Wind), Port Dover and Nanticoke Wind Project (Wind), Quality Wind Project (Wind), Travers Solar (Solar), Vents du Kempt Wind (Wind)\nSocial Infrastructure: AgeCare UK / Optima Living JV (Senior Living), CHUM Research Centre PPP (Healthcare PPP), UMass Amherst Housing PPP (Student Housing), Vanderbilt Student Housing PPP (Student Housing)\nTransportation: 407 ETR (Blue Jay Road Limited) (Toll Roads), Northwest Parkway (Toll Roads)\nUtilities: Georgetown University Utility System (District Energy), PUC Transmission LP (Electricity Transmission), The Ohio State University Utility System (District Energy), Upper Peninsula Power Company (UPPCO) (Electricity Distribution), Wind Energy Transmission Texas (WETT) (Electricity Transmission)",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["Europe"],
    structure: "Open-End",
    strategyUrl: "https://www.axiuminfra.com/2022/09/01/september-1-2022-axium-infrastructure-opens-london-office/?lang=en",
  }),

  // Basalt Infrastructure Partners
  // Source: https://www.basaltinfra.com/ | https://pitchbook.com/profiles/fund/22534-21F
  f("FUND-042", "Basalt Infrastructure Partners", "Basalt Infrastructure Partners IV", "2023", "$4.0B", 4000, "Value-Add", "Deploying", {
    description: "Mid-market value-add fund targeting essential infrastructure businesses in OECD countries across transportation, utilities, energy, and digital sectors with active management.\nPortfolio:\nCommunications: Manx Telecom (Telecoms), Skyway Towers (Towers)\nDigital Infrastructure: Altnet Partners / FullFibre (Zzoomm) (Fiber Networks), Connect Fibre (bn:t and SOCO) (Fiber Networks), Fatbeam (Fiber Networks), Goetel (Fiber Networks), OnSite Partners (Data Centers)\nMidstream / Energy: Freyja LNG (LNG), Vanadis LNG (LNG), Xpress Natural Gas (XNG) (CNG/LNG Distribution)\nPower Generation: Helios Power (Gas-to-Power)\nRenewables / Energy Transition: Go Lime (Simply Green) (Green Fuels), Habitat Solar (Solar)\nTransportation: Caronte & Tourist (Ferries), EnviroSpark (EV Charging), Fortbrand Services (Airport Ground Services), Nobina (Bus Services), Unilode Aviation Solutions (Aviation Services), Wightlink (Ferries)\nUtilities: Circle Infra Partners (Industrial Infrastructure), Iris (Water & Wastewater)\nWaste / Environmental Services: Chemco Ireland (Hazardous Waste), JR Richards & Sons (Waste Collection), Reconor (Waste Management)",
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://pe-insights.com/basalt-infrastructure-partners-announces-closing-of-a-2-75bn-infrastructure-equity-fund/",
  }),
  // Source: https://www.basaltinfra.com/ | https://realassets.ipe.com/news/basalt-infrastructure-fund-secures-200m-from-south-carolina-retirement/10135680.article
  f("FUND-043", "Basalt Infrastructure Partners", "Basalt Infrastructure Partners V", "2025", "Undisclosed", null, "Value-Add", "Raising", {
    description: "Successor fund continuing Basalt's mid-market strategy investing in essential infrastructure businesses across transportation, utilities, and energy in developed markets.",
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://realassets.ipe.com/news/basalt-infrastructure-fund-secures-200m-from-south-carolina-retirement/10135680.article",
  }),

  // Bernhard Capital Partners
  // Source: https://www.bernhardcapital.com/ | https://pitchbook.com/profiles/fund/21217-24F
  f("FUND-044", "Bernhard Capital Partners", "BCP Fund III", "2022", "$1.5B", 1500, "Value-Add", "Deploying", {
    description: "Services-focused infrastructure fund investing in essential infrastructure services companies across utilities, power, and industrial end-markets in North America.",
    sectors: ["Utilities", "Power Generation", "Waste / Environmental Services"],
    regions: ["North America"],
    strategyUrl: "https://www.prnewswire.com/news-releases/bernhard-capital-partners-closes-second-fund-above-target-at-1-2-billion-300790391.html",
  }),
  // Source: https://www.bernhardcapital.com/ | https://pitchbook.com/profiles/fund/27305-92F
  f("FUND-045", "Bernhard Capital Partners", "BCP Infrastructure Fund II", "2024", "Undisclosed", null, "Core-Plus", "Deploying", {
    description: "Core-plus fund targeting essential infrastructure assets and services companies in the utility, power, and environmental services sectors across North America.\nPortfolio:\nMidstream / Energy: Epic Piping (Pipe Fabrication)\nPower Generation: Allied Power (Power Plant Services), Elevation (Power Services)\nRenewables / Energy Transition: Optimum Energy (Energy Efficiency)\nTransportation: RailWorks (Rail Infrastructure Services)\nUtilities: Delta Utilities (Water & Wastewater Utility), New Mexico Gas Company (Gas Distribution)\nWaste / Environmental Services: Green Meadow Sustainable Solutions (Biosolids Management)\nWater: ClearCurrent (Water Treatment), National Water Infrastructure (Water Infrastructure Services)",
    sectors: ["Utilities", "Power Generation", "Waste / Environmental Services"],
    regions: ["North America"],
    strategyUrl: "https://www.bernhardcapital.com/bernhard-capital-partners-closes-inaugural-energy-services-fund/",
  }),

  // BlackRock
  // Source: https://www.blackrock.com/corporate/newsroom/press-releases/article/corporate-one/press-releases/blackRock-agrees-to-acquire-global-infrastructure-partners | https://pitchbook.com/profiles/fund/21685-24F
  f("FUND-046", "BlackRock", "BlackRock Global Infrastructure Fund IV", "2022", "$6.1B", 6100, "Core-Plus", "Deploying", {
    description: "Global diversified infrastructure fund investing in transportation, energy, utilities, and digital infrastructure across developed and select emerging markets.\nPortfolio:\nDigital Infrastructure: Gigapower (Fiber Networks), True IDC (Data Centers)\nMidstream / Energy: Kellas Midstream (Gas Processing)\nRenewables / Energy Transition: Akaysha Energy (Battery Storage), DSD Renewables (Community Solar), Jupiter Power (Battery Storage), Recurrent Energy (Solar & Storage), Vanguard Renewables (Biogas)\nTransportation: GasLog (LNG Shipping)\nUtilities: Calisen (Smart Metering)\nWaste / Environmental Services: Biffa (Waste Management)",
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Global"],
    strategyUrl: "https://www.businesswire.com/news/home/20221024005921/en/BlackRock-Global-Infrastructure-Fund-IV-Raises-US4.5-Billion-at-First-Close",
  }),
  // Source: https://www.infrastructureinvestor.com/blackrocks-global-renewable-power-fund-returns-to-market-with-7bn-target/ | https://pitchbook.com/profiles/fund/24793-39F
  f("FUND-047", "BlackRock", "BlackRock Global Renewable Power Fund IV (GRP IV)", "2023", "$1.35B", 1350, "Core-Plus", "Raising", {
    description: "Dedicated renewable power fund investing in onshore and offshore wind, solar PV, battery storage, and green hydrogen projects globally.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    strategies: ["Core-Plus", "Greenfield"],
    strategyUrl: "https://www.infrastructureinvestor.com/blackrocks-global-renewable-power-fund-returns-to-market-with-7bn-target",
  }),
  // Source: https://www.businesswire.com/news/home/20231115151975/en/BlackRocks-Evergreen-Infrastructure-Fund-Partners-with-European-Institutional-Investors-to-Invest-in-Energy-Transition-and-Energy-Security | https://pitchbook.com/profiles/fund/26064-46F
  f("FUND-048", "BlackRock", "BlackRock Evergreen Infra Partners Fund", "2022", "$1.0B+", 1000, "Core", "Evergreen", {
    description: "Open-end evergreen vehicle providing perpetual capital for core infrastructure investments in essential assets with stable, long-duration contracted cash flows.",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.businesswire.com/news/home/20231115151975/en/BlackRocks-Evergreen-Infrastructure-Fund-Partners-with-European-Institutional-Investors-to-Invest-in-Energy-Transition-and-Energy-Security",
  }),

  // BlackRock (GIP)
  // Source: https://www.infrastructureinvestor.com/gip-closes-fund-v-on-25-2-billion-exclusive/ | https://pitchbook.com/profiles/fund/20842-12F
  f("FUND-049", "BlackRock (GIP)", "Global Infrastructure Partners V (GIP V)", "2022", "$25.2B", 25200, "Core-Plus", "Deploying", {
    description: "Flagship large-cap infrastructure fund investing in transportation, energy, digital infrastructure, and water/waste across global markets with operational value creation.",
    sectors: ["Transportation", "Power Generation", "Digital Infrastructure", "Water", "Midstream / Energy"],
    regions: ["Global"],
    strategyUrl: "https://www.infrastructureinvestor.com/gip-closes-fund-v-on-25-2-billion-exclusive",
  }),
  // Source: https://www.infrastructureinvestor.com/gip-to-seek-7bn-for-rebranded-mid-market-fund-exclusive/ | https://www.blackrock.com/corporate/newsroom/press-releases/article/corporate-one/press-releases/blackrock-completes-acquisition-of-global-infrastructure-partners
  f("FUND-050", "BlackRock (GIP)", "GIP Mid-Market Fund V", "2025", "$7.0B", 7000, "Value-Add", "Deploying", {
    description: "Mid-market infrastructure fund targeting smaller essential infrastructure assets across energy, transport, and digital sectors globally with hands-on operational improvement.\nPortfolio:\nCommunications: Ascend Telecom Infrastructure (Towers), Vantage Towers AG (Towers)\nDigital Infrastructure: Aligned Data Centers (Data Centers), CyrusOne (Data Centers)\nMidstream / Energy: ADNOC Gas Pipelines (Pipelines), Gladstone LNG Project (LNG), Hess Midstream Partners (Gathering & Processing), Jafurah Midstream Gas Company (Gas Processing), Pluto Train 2 (LNG), QCLNG Common Facilities (LNG), Rio Grande LNG (LNG), Ruby Pipeline (Pipelines), TransitGas (Gas Transmission)\nPower Generation: Channelview Cogeneration (Cogeneration), Saavi Energía (Gas-to-Power)\nRenewables / Energy Transition: ACS Renewables (Wind & Solar), Atlas Renewable Energy (Solar), Bluepoint Wind (Offshore Wind), Borkum Riffgrund 2 (Offshore Wind), Clearway Energy Group (Diversified Renewables), Eni CCUS Holding (Carbon Capture), Eolian (Wind), Gode Wind 1 (Offshore Wind), Hornsea 1 (Offshore Wind), Skyborn Renewables (Offshore Wind), Vena Energy (Wind & Solar)\nTransportation: Edinburgh Airport (Airports), Gatwick Airport (Airports), Great Yarmouth Port (Ports), Italo (NTV) (Rail), Malaysia Airports Holdings Berhad (Airports), Peel Ports (Ports), Signature Aviation (FBO / Aviation), Sydney Airport (Airports), TCR Group (Airport Ground Equipment), Terminal Investment Limited (Ports), Tramarsa (Ports)\nUtilities: AES Corporation (Electric Utilities), Naturgy Energy Group (Gas & Electric Utilities), Scotia Gas Networks (SGN) (Gas Distribution), SUEZ Group (Water & Waste)",
    sectors: ["Transportation", "Power Generation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    strategyUrl: "https://www.infrastructureinvestor.com/gip-to-seek-7bn-for-rebranded-mid-market-fund-exclusive",
  }),
  // Source: https://www.global-infra.com/ | https://www.infrastructureinvestor.com/gip-seeks-more-than-6bn-for-emerging-markets/
  f("FUND-051", "BlackRock (GIP)", "GIP Emerging Markets Fund II", "2025", "$5.0B", 5000, "Value-Add", "Raising", {
    description: "Emerging markets infrastructure fund investing in energy, transportation, and digital assets in high-growth developing economies across Asia, Latin America, and the Middle East.",
    sectors: ["Power Generation", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Asia-Pacific", "Latin America", "Middle East & Africa"],
    strategyUrl: "https://www.infrastructureinvestor.com/gip-seeks-more-than-6bn-for-emerging-markets",
  }),
  // Source: https://www.global-infra.com/news/gip-australia-fund-ii-announces-a4-0-billion-final-closing/ | https://www.businesswire.com/news/home/20240409033295/en/GIP-Australia-Fund-II-Announces-A%244.0-Billion-Final-Closing
  f("FUND-052", "BlackRock (GIP)", "GIP Australia Fund II", "2024", "A$4.0B", 2640, "Core-Plus", "Deploying", {
    description: "Australia-focused infrastructure fund targeting essential assets in transportation, energy, and digital infrastructure with long-term contracted or regulated revenue streams.",
    sectors: ["Transportation", "Power Generation", "Digital Infrastructure"],
    regions: ["Asia-Pacific"],
    strategyUrl: "https://www.global-infra.com/news/gip-australia-fund-ii-announces-a4-0-billion-final-closing",
  }),
  // Source: https://www.global-infra.com/ | https://pitchbook.com/profiles/fund/23624-02F
  f("FUND-053", "BlackRock (GIP)", "Global Infrastructure Partners Core Fund", "2022", "$5.0B", 5000, "Core", "Evergreen", {
    description: "Open-end core fund targeting essential infrastructure assets with regulated or contracted revenues providing stable, inflation-linked returns across global developed markets.",
    sectors: ["Transportation", "Utilities", "Power Generation", "Digital Infrastructure"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.global-infra.com/news/blackrock-completes-acquisition-of-global-infrastructure-partners/",
  }),
  // Source: https://www.blackrock.com/corporate/newsroom/press-releases/article/corporate-one/press-releases/ai-infrastructure-partnership | https://ir.blackrock.com/news-and-events/press-releases/press-releases-details/2025/BlackRock-Global-Infrastructure-Partners-Microsoft-and-MGX-Welcome-NVIDIA-and-xAI-to-the-AI-Infrastructure-Partnership-to-Drive-Investment-in-Data-Centers-and-Enabling-Infrastructure/default.aspx
  f("FUND-054", "BlackRock (GIP)", "AI Infrastructure Partnership (AIP)", "2024", "$30.0B", 30000, "Value-Add", "Deploying", {
    description: "Mega-scale partnership developing AI-enabling data center and power infrastructure globally, co-investing with leading technology companies to build next-generation compute capacity.",
    sectors: ["Digital Infrastructure", "Power Generation"],
    regions: ["Global"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://www.blackrock.com/corporate/newsroom/press-releases/article/corporate-one/press-releases/ai-infrastructure-partnership",
  }),

  // Blackstone
  // Source: https://www.blackstone.com/our-businesses/infrastructure/ | https://pitchbook.com/profiles/fund/15978-34F
  f("FUND-055", "Blackstone", "Blackstone Infrastructure Partners (BIP)", "2017", "~$51.0B", 51000, "Core-Plus", "Evergreen", {
    description: "Open-ended permanent capital vehicle investing in large-scale infrastructure assets across energy, transportation, digital, and water/waste sectors, applying an operationally intensive buy-and-hold approach.\nPortfolio:\nDigital Infrastructure: AirTrunk (Data Centers), QTS Data Centers (Data Centers), Symphony Infrastructure Partners (Fiber Networks)\nMidstream / Energy: Cheniere Energy Partners (LNG Export), Neysa (Gas Processing), Port Arthur LNG Phase 2 (LNG Export), Tallgrass Energy (Gas Pipelines)\nRenewables / Energy Transition: Invenergy Renewables (Renewables Platform)\nTransportation: AGS Airports (Airports), Applegreen (Motorway Services), Autostrade per l'Italia (Mundys) (Toll Roads), Carrix / SSA Marine (Port Terminals), Safe Harbor Marinas (Marinas)\nUtilities: Atlantic Power Transmission LLC (Electricity Transmission), FirstEnergy (Electric Utility), NiSource (NIPSCO) (Gas & Electric Utility)\nWaste / Environmental Services: Urbaser (Waste Management)",
    sectors: ["Power Generation", "Transportation", "Digital Infrastructure", "Water", "Renewables / Energy Transition", "Utilities", "Midstream / Energy", "Communications"],
    regions: ["North America", "Europe"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.blackstone.com/news/press/blackstone-infrastructure-partners-closes-on-14bn-in-commitments-in-its-inaugural-fundraising-phase/",
  }),
  // Source: https://www.blackstone.com/our-businesses/blackstone-energy-transition-partners/ | N/A — no cross-reference found
  f("FUND-056", "Blackstone", "Blackstone Energy Transition Partners V", "2025", "Undisclosed", null, "Value-Add", "Raising", {
    description: "Latest vintage of Blackstone's energy transition series, investing in renewable energy, battery storage, grid infrastructure, and decarbonization assets globally.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    strategyUrl: "https://www.blackstone.com/our-businesses/blackstone-energy-transition-partners",
  }),
  // Source: https://www.blackstone.com/news/press/blackstone-announces-5-6-billion-final-close-for-blackstone-energy-transition-partners-iv-at-hard-cap/ | https://pitchbook.com/profiles/fund/21794-41F
  f("FUND-057", "Blackstone", "Blackstone Energy Transition Partners IV", "2022", "$5.6B", 5600, "Value-Add", "Deploying", {
    description: "Value-add fund investing in the global energy transition including renewable power generation, storage, and critical grid infrastructure assets.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    strategyUrl: "https://www.blackstone.com/news/press/blackstone-announces-5-6-billion-final-close-for-blackstone-energy-transition-partners-iv-at-hard-cap",
  }),

  // Brookfield Asset Management
  // Source: https://bam.brookfield.com/press-releases/brookfield-raises-record-30-billion-flagship-infrastructure-strategy | https://pitchbook.com/profiles/fund/20945-44F
  f("FUND-058", "Brookfield Asset Management", "Brookfield Infrastructure Fund V (BIF V)", "2022", "$30.0B", 30000, "Value-Add", "Deploying", {
    description: "World's largest closed-end private infrastructure fund targeting high-quality essential assets driven by digitalization, decarbonization, and deglobalization themes globally.",
    sectors: ["Utilities", "Transportation", "Midstream / Energy", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    strategyUrl: "https://bam.brookfield.com/press-releases/brookfield-raises-record-30-billion-flagship-infrastructure-strategy",
  }),
  // Source: https://www.brookfield.com/our-businesses/infrastructure | https://pitchbook.com/profiles/fund/16563-16F
  f("FUND-059", "Brookfield Asset Management", "Brookfield Super-Core Infrastructure Partners", "2018", "$15.5B", 15500, "Core", "Evergreen", {
    description: "Open-end super-core fund targeting the highest-quality regulated and contracted infrastructure assets with utility-like returns in transportation, utilities, and renewables.\nPortfolio:\nCommunications: TDF (Broadcast Infrastructure)\nDigital Infrastructure: Compass Datacenters (Data Centers), Cyxtera (Evoque) (Data Centers), Data4 (Data Centers), GD Towers (Towers), Hotwire Communications (Fiber Networks), Intel Semiconductor Fab JV (Semiconductor Fab), Valokuitunen (Fiber Networks), Wireless Infrastructure Group (WIG) (Towers)\nLogistics: Triton International (Container Leasing)\nMidstream / Energy: Inter Pipeline (Pipelines & Petrochemicals), Lodi Gas Storage (Gas Storage), Natural Gas Pipeline Company of America (Gas Pipelines), NorthRiver Midstream (Gas Processing), Nova Transportadora do Sudeste (NTS) (Gas Pipelines), Pipeline Infrastructure (Gas Pipelines), Rockpoint Gas Storage (Gas Storage), Warwick Gas Storage (Gas Storage)\nPower Generation: Holtwood (Hydroelectric), Westinghouse Electric (Nuclear Services)\nRenewables / Energy Transition: Deriva Energy (Renewables Platform), Neoen (Solar, Wind & Storage), Northview Energy (Solar & Storage), OnPath Energy (Offshore Wind), Scout Clean Energy (Wind & Solar), Thermondo (Heat Pumps), Urban Grid (Solar), X-ELIO (Solar)\nTransportation: Arteris (Toll Roads), Genesee & Wyoming (Short-Line Rail), Rutas de Lima (Toll Roads), VLI (Rail & Port Logistics)\nUtilities: AusNet Services (Electricity & Gas Distribution), BOXT Ltd (Home Energy Services), BUUK Infrastructure (Multi-Utility Networks), Enercare (Home Services), FirstEnergy Transmission (FET) (Electricity Transmission), Metergy Solutions (Smart Metering), Trans Bay Cable (Electricity Transmission), Vanti S.A. ESP (Gas Distribution)",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.brookfield.com/our-businesses/infrastructure",
  }),
  // Source: https://bam.brookfield.com/press-releases/brookfield-raises-20-billion-record-transition-fund | https://www.esgtoday.com/brookfield-raises-20-billion-for-largest-ever-energy-transition-fund/
  f("FUND-060", "Brookfield Asset Management", "Brookfield Global Transition Fund II (BGTF II)", "2024", "$23.5B", 23500, "Value-Add", "Deploying", {
    description: "World's largest energy transition fund investing in clean energy, carbon capture, sustainable fuels, and decarbonization of carbon-intensive industries globally.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Midstream / Energy"],
    regions: ["Global"],
    strategyUrl: "https://bam.brookfield.com/press-releases/brookfield-raises-20-billion-record-transition-fund",
  }),
  // Source: https://bam.brookfield.com/press-releases/brookfield-opens-fundraising-catalytic-transition-fund-anchor-commitment-alterra | https://pitchbook.com/profiles/fund/25873-48F
  f("FUND-061", "Brookfield Asset Management", "Brookfield Catalytic Transition Fund", "2023", "$5.0B", 5000, "Value-Add", "Deploying", {
    description: "Blended-finance fund deploying concessional and commercial capital for clean energy and transition infrastructure in emerging and developing economies.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Asia-Pacific", "Latin America", "Middle East & Africa"],
    strategyUrl: "https://bam.brookfield.com/press-releases/brookfield-opens-fundraising-catalytic-transition-fund-anchor-commitment-alterra",
  }),
  // Source: https://bam.brookfield.com/press-releases/brookfield-closes-infrastructure-structured-solutions-fund | https://www.nasdaq.com/articles/brookfield-asset-management-closes-inaugural-1-billion-infrastructure-structured-solutions
  f("FUND-062", "Brookfield Asset Management", "Brookfield Infrastructure Solutions (BISS I)", "2024", "$1.0B", 1000, "Value-Add", "Deploying", {
    description: "Infrastructure solutions fund investing in mid-market data center, fiber, and digital infrastructure development projects in partnership with technology companies.",
    sectors: ["Digital Infrastructure"],
    regions: ["North America", "Europe"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://bam.brookfield.com/press-releases/brookfield-closes-infrastructure-structured-solutions-fund",
  }),
  // Source: https://privatewealth.brookfield.com/fund/brookfield-infrastructure-income-fund-inc | https://www.sec.gov/Archives/edgar/data/1955857/000110465924033049/tm247262d4_ncsr.htm
  f("FUND-063", "Brookfield Asset Management", "Brookfield Infrastructure Income Fund (BII)", "2023", "Undisclosed", null, "Core", "Evergreen", {
    description: "Open-end income-focused fund targeting high-quality infrastructure debt and equity investments providing stable, yield-oriented returns from essential assets.",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
    strategies: ["Core", "Credit / Debt"],
    strategyUrl: "https://privatewealth.brookfield.com/fund/brookfield-infrastructure-income-fund-inc",
  }),

  // Carlyle Infrastructure
  // Source: https://www.carlyle.com/our-firm/global-private-equity/global-infrastructure | https://pitchbook.com/profiles/fund/15933-43F (Fund I profile — Fund II not yet on PitchBook)
  f("FUND-064", "Carlyle Infrastructure", "Carlyle Global Infrastructure Opportunity Fund II", "2024", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "Value-add fund targeting middle-market essential infrastructure businesses across OECD markets, with a focus on building and scaling platforms in transportation, digital, renewables, and midstream energy.\nPortfolio:\nDigital Infrastructure: ark data centers (formerly Involta) (Data Centers), Tillman Infrastructure (Towers), Wyyerd Fiber Group (Fiber Networks)\nMidstream / Energy: Crescent Midstream (Marine Terminals)\nPower Generation: Revera Energy (Flexible Generation), Telis Energy (Gas-Fired Power)\nRenewables / Energy Transition: AlphaStruxure (Energy-as-a-Service), Amp Energy (Renewables Platform), Aspen Power (Community Solar), Copia Power (Solar & Storage), Fermata Energy (Vehicle-to-Grid), NineDot Energy (Battery Storage)\nTransportation: London Southend Airport (Airports), New Terminal One (JFK Airport) (Airport Terminals)",
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition", "Midstream / Energy", "Logistics"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.carlyle.com/our-firm/global-private-equity/global-infrastructure",
  }),
  // Source: https://www.carlyle.com/renewable-sustainable-energy | https://pitchbook.com/profiles/fund/21804-13F
  f("FUND-065", "Carlyle Infrastructure", "Carlyle Renewable & Sustainable Energy Fund II", "2022", "$1.19B", 1190, "Value-Add", "Deploying", {
    description: "Dedicated clean energy fund investing in solar, wind, storage, and other renewable energy assets and platforms in North America and Europe.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.carlyle.com/renewable-sustainable-energy",
  }),

  // CBRE Investment Management
  // Source: https://www.cbreim.com/strategies-and-solutions/investment/private-infrastructure | https://www.formds.com/issuers/cbre-musselshell-infrastructure-investments-lp
  f("FUND-066", "CBRE Investment Management", "CBRE Musselshell Infrastructure Investments", "2022", "$100M", 100, "Core-Plus", "Deploying", {
    description: "Niche infrastructure fund targeting small-to-mid-scale essential infrastructure investments in North America with a focus on energy and utility assets.\nPortfolio:\nDigital Infrastructure: Accelerate Infrastructure Opportunities (Infrastructure Platform), CitySwitch (Data Centers), Gateway Fiber (Fiber Networks), Vantage Data Centers (Stabilized Portfolio) (Data Centers), WANRack (Fiber Networks)\nRenewables / Energy Transition: ClearGen Holdings (Distributed Generation), Geonova (Geothermal)\nTransportation: Connect Bus (Bus Services), Norled AS (Ferry Services)",
    sectors: ["Utilities", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.cbreim.com/strategies-and-solutions/investment/private-infrastructure",
  }),

  // CIM Group
  // Source: https://www.cimgroup.com/our-platforms/infrastructure | https://pitchbook.com/profiles/fund/21118-06F
  f("FUND-067", "CIM Group", "CIM Infrastructure Fund III", "2021", "$1.76B", 1760, "Value-Add", "Deploying", {
    description: "Value-add fund investing in assets supporting the optimization, sustainability, and digitalization of infrastructure underpinning North American communities, including renewables, waste-to-value, and data centers.\nPortfolio:\nDigital Infrastructure: Novva Data Centers (Data Centers)\nPower Generation: Westlands Electric Power Company (Solar & Storage)\nRenewables / Energy Transition: Aquamarine Solar Project (Solar), Ecoppia (Solar Robotics), SolarBank JV (Community Solar), Terreva Renewables (Renewables Platform)\nWaste / Environmental Services: Bolder Industries (Tire Recycling)\nWater: Antelope Valley Water Bank (Water Storage)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Waste / Environmental Services", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
    strategyUrl: "https://www.cimgroup.com/our-platforms/infrastructure",
  }),

  // Copenhagen Infrastructure Partners
  // Source: https://www.cip.com/funds/flagship-funds/ | https://www.globenewswire.com/news-release/2025/03/14/3042746/0/en/Copenhagen-Infrastructure-Partners-fifth-flagship-fund-exceeds-target-of-EUR-12-billion.html
  f("FUND-068", "Copenhagen Infrastructure Partners", "Copenhagen Infrastructure V (CI V)", "2023", "€12.0B", 13200, "Core-Plus", "Deploying", {
    description: "Flagship renewable energy fund investing in large-scale offshore wind, onshore wind, solar PV, and Power-to-X projects globally with greenfield development capabilities.\nPortfolio:\nRenewables / Energy Transition: 7SeasMed (Offshore Wind), Alcemi (Green Hydrogen), BKV dCarbon Ventures JV (Carbon Capture), Catalina (Offshore Wind), Changfang & Xidao (Offshore Wind), Chile HNH (Green Hydrogen), CIP Fund Solutions (Platform), CIP Molecule Technologies (Green Hydrogen), CIP Terra Technologies (Onshore Renewables), Copenhagen Offshore Partners (COP) (Offshore Wind), Energy Island (VindØ) (Offshore Wind), Fengmiao (Offshore Wind), Fighting Jays (Onshore Wind), Fjord (Offshore Wind), Greasewood (Solar), Haesong 1 & 3 (Offshore Wind), Haewoori 1, 2, 3 (Offshore Wind), Hokkaido (Offshore Wind), Horizon New Energy (Solar), Høst (Biomass / Biogas), Hydrogen Island (BrintØ) (Green Hydrogen), Ichnusa Wind Power (Onshore Wind), Iverson (Onshore Wind), Jeonnam 1, 2, 3 (Offshore Wind), Liberty Renewables (Onshore Renewables), Madoqua (Green Hydrogen), Misae (Green Hydrogen), Mitchell (Onshore Wind), Monegros (Solar), Mulilo (Onshore Renewables), Murchison (Onshore Renewables), NISA and Bore Array (Offshore Wind), Northwich Biogas Plant (Biomass / Biogas), Nurax (Onshore Wind), Ørsted European Onshore Business (Onshore Renewables), Ossian Floating Offshore Wind Farm (Offshore Wind), Pentland Floating Offshore Wind Farm (Offshore Wind), Poseidon (Offshore Wind), Sage (Onshore Wind), St. Charles (Biomass / Biogas), Star of the South (Offshore Wind), Sunfire (Green Hydrogen), Taean (Offshore Wind), Taiwan New Sites (Offshore Wind), Tønder Biogas (Biomass / Biogas), Tyrrhenian (Offshore Wind), Unicus (Onshore Renewables), Vineyard Northeast (Offshore Wind), Vineyard Wind 1 (Offshore Wind), Zeevonk (Offshore Wind), Zhong Neng (Offshore Wind)",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    strategies: ["Core-Plus", "Greenfield"],
    strategyUrl: "https://www.cip.com/funds/flagship-funds",
  }),
  // Source: https://www.cip.com/funds/advanced-bioenergy-funds/ | https://www.globenewswire.com/news-release/2023/10/16/2760294/0/en/Copenhagen-Infrastructure-Partners-reaches-final-close-of-EUR-2-billion-for-two-new-funds.html
  f("FUND-069", "Copenhagen Infrastructure Partners", "CI Advanced Bioenergy Fund I (CI ABF I)", "2022", "€750M", 825, "Value-Add", "Deploying", {
    description: "Specialized fund investing in next-generation bioenergy infrastructure including biogas, biomethane, and sustainable aviation fuel production facilities.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe", "North America"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://www.globenewswire.com/news-release/2023/10/16/2760294/0/en/Copenhagen-Infrastructure-Partners-reaches-final-close-of-EUR-2-billion-for-two-new-funds.html",
  }),
  // Source: https://www.cip.com/funds/advanced-bioenergy-funds/ | https://en.wikipedia.org/wiki/Copenhagen_Infrastructure_Partners
  f("FUND-070", "Copenhagen Infrastructure Partners", "CI Advanced Bioenergy Fund II (CI ABF II)", "2025", "€1.5B", 1650, "Value-Add", "Raising", {
    description: "Successor bioenergy fund scaling investments in biomethane, e-fuels, and sustainable aviation fuel infrastructure across Europe and North America.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe", "North America"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://www.cip.com/funds/advanced-bioenergy-funds",
  }),

  // Cube Infrastructure Managers
  // Source: https://www.cubeinfrastructure.com/news/cube-infrastructure-managers-closes-cube-infrastructure-fund-iii-at-e1-35-billion/ | https://irei.com/news/cube-infrastructure-fund-iii-closes-with-e1-35b/
  f("FUND-071", "Cube Infrastructure Managers", "Cube Infrastructure Fund III", "2021", "€1.35B", 1485, "Core-Plus", "Deploying", {
    description: "European mid-market fund investing in essential infrastructure in public transport, fiber/telecom networks, and renewable energy with long-term contracted revenues.\nPortfolio:\nDigital Infrastructure: Asteo Red Neutra (Fiber Networks), ClioFiber (Fiber Networks), CubIKS GmbH (Fiber Networks), dstelecom (Fiber Networks), Fibernet (Fiber Networks), firstcolo (Data Centers), G.Network (Fiber Networks), Glesys (Data Centers), Heliot (IoT Networks), Rede Aberta (Fiber Networks), RUNE Crow (Fiber Networks), RUNE Enia (Fiber Networks), Unifiber (Fiber Networks)\nPower Generation: Cogeninfra (Cogeneration)\nRenewables / Energy Transition: GRECO (Solar), Green Energy Platform (Solar), Norsk Vannkraft (Hydropower), Varanger Kraftvind (Onshore Wind)\nTransportation: Bergkvara (Mekka Traffic) (Traffic Services), CFTR (Rail), Dispam (Bus Services), Kople (EV Charging), Métropolis (EV Charging), Müller Transporte (Rail Freight), Osprey (EV Charging), Stations-e (EV Charging)\nUtilities: ENETIQA (District Heating)\nWaste / Environmental Services: RiverRidge (Waste Management), Sepur (Waste Collection), Verdis (Waste Collection)",
    sectors: ["Transportation", "Communications", "Renewables / Energy Transition"],
    regions: ["Europe"],
    strategyUrl: "https://www.cubeinfrastructure.com/news/cube-infrastructure-managers-closes-cube-infrastructure-fund-iii-at-e1-35-billion",
  }),
  // Source: https://www.cubeinfrastructure.com/ | https://www.infrastructureinvestor.com/the-pipeline-cube-targets-e1-5bn-cpp-returns-to-fund-commitments-cip-gets-uk-state-backing/
  f("FUND-072", "Cube Infrastructure Managers", "Cube Infrastructure Fund IV", "2025", "€1.5B", 1650, "Core-Plus", "Raising", {
    description: "Successor fund continuing Cube's European mid-market strategy across public transport operators, fiber networks, and energy transition infrastructure.",
    sectors: ["Transportation", "Communications", "Renewables / Energy Transition"],
    regions: ["Europe"],
    strategyUrl: "https://www.cubeinfrastructure.com/about-us",
  }),

  // CVC DIF
  // Source: https://www.cvcdif.com/infrastructure/strategies | https://www.pa.gov/content/dam/copapwp-pagov/en/psers/documents/board3/resolutions/2025/2025-58%20pserb%20resolution%20dif%20infrastructure%20fund%20viii%20scsp.pdf
  f("FUND-073", "CVC DIF", "CVC DIF Infrastructure VIII", "2025", "€6.0B", 6600, "Core-Plus", "Raising", {
    description: "Flagship core-plus fund investing in essential European infrastructure across energy, transportation, telecom, and social infrastructure with contracted cash flows.\nPortfolio:\nCommunications: Manx Telecom Group (Telecoms)\nDigital Infrastructure: Celeste (Fiber Networks)\nMidstream / Energy: Exolum (Pipelines & Storage)\nRenewables / Energy Transition: BALANCE (Biogas), Gabriela Project (Solar & Battery Storage), Low Carbon (Solar & Wind)\nTransportation: iPark (Parking)\nUtilities: CARMA Corp (Submetering), JW Water Holdings (Water & Wastewater), Public Power Corporation (PPC) (Electric Utilities)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Communications", "Social Infrastructure"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.cvcdif.com/infrastructure/strategies",
  }),
  // Source: https://www.cvcdif.com/infrastructure/strategies | https://realassets.ipe.com/news/new-jersey-doi-mulls-300m-commitment-to-cvc-dif-strategies/10131978.article
  f("FUND-074", "CVC DIF", "CVC DIF Value-Add IV", "2025", "€2.0B", 2200, "Value-Add", "Raising", {
    description: "Value-add fund targeting infrastructure businesses requiring active management and operational improvement in energy transition, digital, and transport sectors.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["Europe"],
    strategyUrl: "https://www.nj.gov/treasury/doinvest/pdf/AlternativeInvestments/RealAsset/DIF_Infrastructure_VIII_SCSp.pdf",
  }),
  // Source: https://www.cvcdif.com/news-insights/dif-capital-partners-raises-eur-68-billion-for-its-latest-infrastructure-funds | https://pitchbook.com/profiles/fund/22326-94F
  f("FUND-075", "CVC DIF", "DIF Infrastructure VII", "2022", "€4.40B", 4840, "Core", "Deploying", {
    description: "Core infrastructure fund investing in contracted and regulated essential assets in European energy, PPP/social infrastructure, and telecom with availability-based revenues.\nPortfolio:\nCommunications: Airtower Networks (Towers)\nDigital Infrastructure: ielo (Fiber Networks), metrofibre (Fiber Networks), RFNOW (Fiber Networks), ruhrfibre (Fiber Networks), TDF Fibre (Fiber Networks), Tonaquint Data Centers (Data Centers), Valoo (Fiber Networks)\nRenewables / Energy Transition: Alight (Solar), Diverso Energy (Geothermal), Enso Green Holdings (Solar & Wind), Field Energy (Battery Storage), GS Power Partners (Distributed Solar), Novar (Solar), Ottoway Portfolio Holdings (Solar), Qair (Wind & Solar)\nSocial Infrastructure: Bankside House (Student Housing), North and South Schools PPP (Education)\nTransportation: Cross River Rail PPP (Rail), Fjord1 (Ferries), Rail First (Rail)\nUtilities: Bernhard, LLC (Energy Services), Loimua (District Heating), PAL Cooling Holding (District Cooling), Pinnacle Power (District Heating)\nWaste / Environmental Services: Adam Ecotech (Environmental Services), Dublin Waste-to-Energy (Waste-to-Energy)",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure", "Communications", "Transportation", "Utilities", "Water"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.cvcdif.com/news-insights/dif-capital-partners-raises-eur-68-billion-for-its-latest-infrastructure-funds",
  }),
  // Source: https://www.cvcdif.com/news-insights/dif-capital-partners-raises-eur-68-billion-for-its-latest-infrastructure-funds | https://pitchbook.com/profiles/fund/23029-21F
  f("FUND-076", "CVC DIF", "DIF Core-Plus Infrastructure Fund III (CIF III)", "2022", "€1.60B", 1760, "Core-Plus", "Deploying", {
    description: "Core-plus fund targeting medium-risk infrastructure assets in energy transition, digital, and transportation with a mix of contracted and merchant revenue exposure.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["Europe"],
    strategyUrl: "https://www.cvcdif.com/news-insights/dif-capital-partners-raises-eur-68-billion-for-its-latest-infrastructure-funds",
  }),

  // DigitalBridge
  // Source: https://www.digitalbridge.com/news/2025-11-18-digitalbridge-announces-total-commitments-of-117-billion-in-fund-and-related-fund-lp-co-investment-commitments-for-digitalbridge-partners-iii | https://ir.digitalbridge.com/news-releases/news-release-details/digitalbridge-announces-total-commitments-117-billion-fund-and
  f("FUND-077", "DigitalBridge", "DigitalBridge Partners III", "2023", "$7.2B", 7200, "Value-Add", "Deploying", {
    description: "Flagship digital infrastructure fund investing in data centers, cell towers, fiber networks, and edge computing infrastructure globally.\nPortfolio:\nCommunications: Andean Telecom Partners (ATP) (Towers), Boingo Wireless (Wi-Fi / DAS), Digita Oy (Broadcast / Towers), EdgePoint Infrastructure (Towers), Freshwave Group (Small Cells / DAS), GD Towers (Towers), Highline do Brasil (Towers), JTOWER (Towers), Landmark Dividend (Ground Leases), Mexico Telecom Partners (Towers), Vertical Bridge (Towers)\nDigital Infrastructure: AIMS (Data Centers), Aptum Technologies (Data Centers), AtlasEdge (Edge Data Centers), Beanfield Metroconnect (Fiber Networks), DataBank (Data Centers), Fibernow (Fiber Networks), Mundo Pacifico (Fiber Networks), Netomnia (Fiber Networks), Orange Barrel Media (Digital Signage), Scala Data Centers (Data Centers), Switch (Data Centers), Vantage Data Centers (APAC) (Data Centers), Vantage Data Centers (EMEA) (Data Centers), Vantage Data Centers (North America) (Data Centers), Vantage SDC (Data Centers), Xenith IG (Data Centers), Yondr Group (Data Centers), Zayo Group Holdings (Fiber Networks)",
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["Global"],
    strategyUrl: "https://www.digitalbridge.com/news/2025-11-18-digitalbridge-announces-total-commitments-of-117-billion-in-fund-and-related-fund-lp-co-investment-commitments-for-digitalbridge-partners-iii",
  }),
  // Source: https://www.digitalbridge.com/business | https://pitchbook.com/profiles/fund/21711-88F
  f("FUND-078", "DigitalBridge", "DigitalBridge Strategic Asset Fund", "2022", "Undisclosed", null, "Core", "Evergreen", {
    description: "Long-hold core digital infrastructure fund targeting stabilized, cash-flowing data centers and fiber networks with contracted revenue streams.",
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.digitalbridge.com/business",
  }),
  // Source: https://www.digitalbridge.com/business | https://www.aiib.org/en/projects/details/2023/approved/Multicountry-DigitalBridge-Emerging-Market-Digital-Infrastructure-Fund.html
  f("FUND-079", "DigitalBridge", "DigitalBridge Emerging Market Digital Infrastructure", "2021", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Fund investing in digital infrastructure across emerging markets including cell towers, fiber, and data centers in Africa, Asia, and Latin America.",
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["Asia-Pacific", "Latin America", "Middle East & Africa"],
    strategyUrl: "https://www.aiib.org/en/projects/details/2023/approved/Multicountry-DigitalBridge-Emerging-Market-Digital-Infrastructure-Fund.html",
  }),
  // Source: https://www.infrabridge.com/ | https://ir.digitalbridge.com/static-files/e40385bc-2520-41a2-97f8-dd9fae2201ca
  f("FUND-080", "DigitalBridge", "InfraBridge Global Infrastructure Fund III (GIF III)", "2023", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Mid-market fund targeting digital and traditional infrastructure across emerging markets, including towers, fiber, transportation, and energy assets.\nPortfolio:\nCommunications: Telecom Infrastructure Partners (TIP) (Towers)\nDigital Infrastructure: Expedient (Data Centers), Freedom Fibre / VX Fiber (Fiber Networks)\nPower Generation: Invenergy AMPCI Thermal Power (Gas-to-Power)\nSocial Infrastructure: Achieve Together (Specialist Care)\nTransportation: Australia Pacific Airports Corporation (APAC) (Airports), ConGlobal (Intermodal Services), Leeds Bradford Airport (Airports), London Luton Airport (Airports), Newcastle International Airport (Airports), ZeMobility (EV Fleet Solutions)",
    sectors: ["Digital Infrastructure", "Communications", "Transportation", "Power Generation"],
    regions: ["Asia-Pacific", "Middle East & Africa"],
    strategyUrl: "https://www.digitalbridge.com/news/2023-02-02-digitalbridge-completes-acquisition-of-amp-capital-global-infrastructure-equity-investment-management-business",
  }),

  // DWS Infrastructure
  // Source: https://www.dws.com/en-fi/capabilities/alternatives/infrastructure/ | https://pitchbook.com/profiles/fund/25965-19F
  f("FUND-081", "DWS Infrastructure", "Pan-European Infrastructure Fund IV", "2024", "€4.0B", 4400, "Core-Plus", "Deploying", {
    description: "Core-plus fund investing in mid-market essential European infrastructure across transportation, energy, digital, and environmental services with active asset management.\nPortfolio:\nDigital Infrastructure: Deutsche GigaNetz (Fiber Networks), NorthC Datacenters (Data Centers)\nRenewables / Energy Transition: Cleanwatts (Energy Communities), Maaselänkangas Wind Farm (Onshore Wind), Weltec Holding GmbH (Biogas)\nSocial Infrastructure: Ergéa Group (Medipass) (Healthcare)\nTransportation: Grandi Stazioni Retail (Rail Stations), Hansea (Bus / Coach), SAVE (Airports), Stagecoach Group (Bus Services), Streem (fka Ermewa) (Rail Freight)",
    sectors: ["Transportation", "Renewables / Energy Transition", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe"],
    strategyUrl: "https://www.dws.com/en-fi/capabilities/alternatives/infrastructure",
  }),
  // Source: https://www.dws.com/en-pt/capabilities/alternatives/infrastructure/ | https://globalfinreg.com/en/lookup/DWS-SUSTAINABLE-GROWTH-INFRASTRUCTURE-FUND-SCSP-SICAV-RAIF/Luxembourg/213800FUPIPPMJ6N9L77
  f("FUND-082", "DWS Infrastructure", "Sustainable Growth Infrastructure Fund", "2022", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Growth-oriented fund targeting next-generation sustainable infrastructure in energy transition, digitalization, and environmental services across Europe.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Growth"],
    strategyUrl: "https://www.dws.com/en-pt/capabilities/alternatives/infrastructure",
  }),
  // Source: https://realassets.dws.com/offene-infrastrukturfonds/de000dwse114-dws-infrastruktur-europa-ic/ | https://pitchbook.com/profiles/fund/23661-55F
  f("FUND-083", "DWS Infrastructure", "DWS Infrastruktur Europa", "2023", "€452M", 497, "Core", "Evergreen", {
    description: "Open-end European core infrastructure fund for German institutional investors, targeting regulated utilities, contracted renewables, and social infrastructure.",
    sectors: ["Utilities", "Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["Europe"],
    structure: "Open-End",
    strategyUrl: "https://realassets.dws.com/offene-infrastrukturfonds/de000dwse114-dws-infrastruktur-europa-ic",
  }),

  // EIG Global Energy Partners
  // Source: https://eigpartners.com/ | https://pitchbook.com/profiles/fund/20922-85F
  f("FUND-084", "EIG Global Energy Partners", "EIG Energy Fund XVIII", "2022", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "Energy infrastructure fund investing across the energy value chain including LNG, midstream, power generation, and energy transition assets globally.\nPortfolio:\nMidstream / Energy: Aethon Energy (Natural Gas E&P), GNL Quintero (LNG), MidOcean Energy (LNG), Ocyan (Offshore Services), Transportadora de Gas del Peru (TGP) (Pipelines)\nRenewables / Energy Transition: Avantus (Solar), Bioenergy Infrastructure Group (Biomass / Biogas), Cerro Dominador (Concentrated Solar), Fidra Energy (Offshore Wind), HIF Global (Green Fuels), Industrial Sun (Solar), Prosolia Energy (Solar), SunLight General Capital (Solar)\nTransportation: Prumo Logistica (Ports)",
    sectors: ["Midstream / Energy", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global"],
    strategyUrl: "https://eigpartners.com/eig-holds-final-closing-of-energy-fund-xvi-6-billion-raised-in-latest-eig-flagship-energy-fund/",
  }),

  // Ember Infrastructure
  // Source: https://ember-infra.com/ | https://pitchbook.com/profiles/fund/24516-82F
  f("FUND-085", "Ember Infrastructure", "Ember Infrastructure Fund II", "2024", "$831M", 831, "Value-Add", "Deploying", {
    description: "Middle-market platform delivering capital solutions to businesses that reduce carbon intensity and enhance resource efficiency across energy, water, waste, and industrial infrastructure.\nPortfolio:\nRenewables / Energy Transition: Caban Systems (Battery Storage), ReGenerate Energy (Biogas), SunShare (Community Solar)\nUtilities: Ground/Water Treatment & Technology (GWTT) (Water Treatment), H2O Innovation (Water Treatment), Lama Sistemas de Filtrado (Water Filtration), Low Impact Development Technologies (Stormwater Management), OnSyte Performance (Water & Wastewater)\nWaste / Environmental Services: Advanced Recycling Technologies (Recycling), Earthwise Environmental Solutions (Environmental Services)",
    sectors: ["Renewables / Energy Transition", "Water", "Waste / Environmental Services", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://ember-infra.com/portfolio",
  }),

  // EnCap Investments
  // Source: https://www.efmidstream.com/ | https://pitchbook.com/profiles/fund/22113-37F
  f("FUND-086", "EnCap Investments", "EnCap Flatrock Midstream Fund V", "2023", "$1.0B", 1000, "Value-Add", "Deploying", {
    description: "Midstream-focused fund investing in natural gas gathering, processing, and transportation infrastructure serving North American shale basins.",
    sectors: ["Midstream / Energy"],
    regions: ["North America"],
    strategyUrl: "https://www.efmidstream.com/about",
  }),
  // Source: https://encapinvestments.com/news/encap-energy-transition-closes-15-billion-energy-transition-fund-ii | https://pitchbook.com/profiles/fund/21788-02F
  f("FUND-087", "EnCap Investments", "EnCap Energy Transition Fund II", "2023", "$1.5B", 1500, "Value-Add", "Deploying", {
    description: "Energy transition fund investing in renewable power, battery storage, renewable fuels, and carbon management infrastructure across North America.\nPortfolio:\nDigital Infrastructure: Quantica Infrastructure (Data Center Infrastructure)\nRenewables / Energy Transition: Aither Systems (Energy Management), Arbor Renewable Gas (RNG), Bildmore Clean Energy (Solar), Catalyze (Solar), Linea Energy (Wind), Parliament Energy (Wind & Solar), PowerTransitions (Solar), SolarProponent (Solar)",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://encapinvestments.com/news/encap-energy-transition-closes-15-billion-energy-transition-fund-ii",
  }),
  // Source: https://www.encapinvestments.com/about/energy-transition | No cross-reference found — Fund III does not appear in any public sources
  f("FUND-088", "EnCap Investments", "EnCap Energy Transition Fund III", "2025", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Latest energy transition vehicle continuing investments in clean power, storage, and decarbonization infrastructure across North American markets.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.encapinvestments.com/about/energy-transition",
  }),

  // Energy Capital Partners
  // Source: https://www.ecpgp.com/ | https://www.dakota.com/fundraising-news/report-energy-capital-partners-targets-5b-for-sixth-flagship-fund
  f("FUND-089", "Energy Capital Partners", "Energy Capital Partners VI", "2024", "$5.0B", 5000, "Value-Add", "Deploying", {
    description: "Large-cap energy infrastructure fund investing in power generation, renewables, energy storage, and grid infrastructure across North America.\nPortfolio:\nCommunications: Shenandoah Telecommunications (Shentel) (Fiber & Broadband)\nDigital Infrastructure: CyrusOne JV (Bosque Campus) (Data Centers)\nMidstream / Energy: Grain LNG (LNG)\nPower Generation: Cornerstone Generation (Gas-to-Power), Next Wave Energy Partners (Gas-to-Power), PROENERGY (Gas Turbines)\nRenewables / Energy Transition: Atlantica Sustainable Infrastructure (Diversified Renewables), Avolta Renewable Holdings (Wind & Solar), Braya Renewable Fuels (Renewable Fuels), Convergent Energy and Power (Battery Storage), DataWatt (Behind-the-Meter Solar), Harvestone Low Carbon Partners (Renewable Fuels), New Leaf Energy (Solar), Pivot Energy (Community Solar), Reflectance Energy (Solar), Triple Oak Power (Wind)\nUtilities: Green Infrastructure Partners (Infrastructure Services)\nWaste / Environmental Services: Biffa (Waste Management), Gopher Resource (Battery Recycling), Restaurant Technologies (Used Oil Recycling)",
    sectors: ["Power Generation", "Renewables / Energy Transition", "Utilities"],
    regions: ["North America"],
    strategyUrl: "https://www.ecpgp.com/about/news-and-insights/press-releases/2024/energy-capital-partners-ecp-completes-67-billion-fundraise",
  }),
  // Source: https://www.ecpgp.com/ | https://pitchbook.com/profiles/fund/19478-89F
  f("FUND-090", "Energy Capital Partners", "ECP Energy Transition Opportunities Fund", "2023", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Dedicated energy transition fund targeting renewable energy, storage, grid modernization, and electrification infrastructure investments in North America.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["North America"],
    strategyUrl: "https://www.esgtoday.com/energy-capital-partners-raises-6-7-billion-for-energy-transition-infrastructure-fund/",
  }),

  // Energy Infrastructure Partners
  // Source: https://energy-infrastructure-partners.com/investor-offering/swiss-energy-infrastructure/ | https://www.sustainablefinance.ch/en/members-partners/member-profiles/energy-infrastructure-partners-ag.html
  f("FUND-091", "Energy Infrastructure Partners", "EIP I (Swiss Energy Infrastructure)", "2014", "CHF 1.7B+", 1904, "Core", "Evergreen", {
    description: "Core infrastructure fund investing in Swiss and European hydropower, grid infrastructure, and regulated energy utilities with long-term concession-based revenues.\nPortfolio:\nMidstream / Energy: Fluxys (Gas Transmission), Transitgas (Gas Transmission)\nPower Generation: Alpiq (Hydropower & Trading)\nRenewables / Energy Transition: Arkona (Offshore Wind), BayWa r.e. (Wind & Solar), Boralex France (Wind & Solar), Electra (EV Charging), Mirror (Solar), Nysäter (Onshore Wind), Plenitude (Diversified Renewables), Repsol Renewables (Wind & Solar), Sunscreen (Solar), Wikinger (Offshore Wind)\nUtilities: Swissgrid (Electricity Transmission)",
    sectors: ["Power Generation", "Utilities", "Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Open-End",
    strategyUrl: "https://energy-infrastructure-partners.com/investor-offering/swiss-energy-infrastructure",
  }),
  // Source: https://energy-infrastructure-partners.com/with-funding-of-eur-1bn-energy-infrastructure-partners-holds-first-close-of-its-energy-transition-infrastructure-fund/ | https://pitchbook.com/profiles/fund/24388-03F
  f("FUND-092", "Energy Infrastructure Partners", "EIP III (Global Energy Transition Infrastructure)", "2022", "€1.5B", 1650, "Core-Plus", "Deploying", {
    description: "Global energy transition fund investing in renewable energy, grid infrastructure, and energy storage assets supporting decarbonization across Europe and select global markets.",
    sectors: ["Renewables / Energy Transition", "Utilities", "Power Generation"],
    regions: ["Europe", "Global"],
    strategyUrl: "https://energy-infrastructure-partners.com/with-funding-of-eur-1bn-energy-infrastructure-partners-holds-first-close-of-its-energy-transition-infrastructure-fund",
  }),

  // EQT Infrastructure
  // Source: https://eqtgroup.com/about/current-portfolio/funds/eqt-infrastructure-vi | https://pitchbook.com/profiles/fund/22288-78F
  f("FUND-093", "EQT Infrastructure", "EQT Infrastructure VI", "2023", "€21.5B", 23650, "Value-Add", "Deploying", {
    description: "Largest-ever European infrastructure fund making control-oriented value-add investments in digital, energy/environmental, transport/logistics, and social infrastructure across Europe, North America, and Asia-Pacific.\nPortfolio:\nDigital Infrastructure: DELTA Fiber (Fiber Networks), Deutsche Glasfaser (Fiber Networks), EdgeConneX (Data Centers), GlobalConnect (Fiber Networks), Lumos Fiber (Fiber Networks), Segra (Fiber Networks), Zayo (Fiber Networks)\nRenewables / Energy Transition: Cypress Creek Renewables (Solar), Madison Energy Infrastructure (Solar), O2 Power (Wind & Solar), OX2 (Wind & Solar), Scale Microgrids (Microgrids), Statera (Battery Storage), Tion Renewables (Wind & Solar), Zelestra (Solar)\nSocial Infrastructure: Ariston Education (Education), Colisee (Healthcare), Evidia (Healthcare), Icon Group (Healthcare), Levande (Senior Living), Metlifecare (Senior Living), Parques Reunidos (Leisure Parks), SK Shieldus (Security Services), Trescal (Calibration Services), Universidad Europea (Education)\nTransportation: Constellation Cold Logistics (Cold Storage), Eagle Railcar Services (Rail Services), First Student (School Bus), InstaVolt (EV Charging), Lazer Logistics (Yard Management), Nordic Ferry Infrastructure (Ferries), Ocea Group (Maritime)\nUtilities: AES (Electric Utilities), Calisen Group (Smart Metering), Osmose Utilities Services (Utility Services), Radius (Smart Metering), SAUR (Water & Wastewater), Seven Seas Water Group (Water Desalination), Yorkshire Water (Kelda Holdings) (Water & Wastewater)\nWaste / Environmental Services: Arcwood Environmental (Wood Waste Recycling), Cirba Solutions (Battery Recycling), Encyclis (Waste-to-Energy), Rena (KJ Environment) (Industrial Cleaning), Reworld (Waste-to-Energy), Urbaser (Waste Management)",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Logistics", "Social Infrastructure", "Waste / Environmental Services"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://eqtgroup.com/about/current-portfolio/funds/eqt-infrastructure-vi",
  }),
  // Source: https://eqtgroup.com/infrastructure/eqt-active-core-infrastructure | https://pitchbook.com/profiles/fund/21572-83F
  f("FUND-094", "EQT Infrastructure", "EQT Active Core Infrastructure I", "2022", "€2.9B", 3190, "Core", "Deploying", {
    description: "Long-hold core infrastructure fund targeting essential regulated and contracted assets in utilities, renewables, and transport across Europe with active ownership.",
    sectors: ["Utilities", "Renewables / Energy Transition", "Transportation"],
    regions: ["Europe"],
    strategyUrl: "https://eqtgroup.com/infrastructure/eqt-active-core-infrastructure",
  }),
  // Source: https://eqtgroup.com/infrastructure/eqt-transition-infrastructure | https://www.infrastructureinvestor.com/eqt-launches-new-energy-transition-fund/
  f("FUND-095", "EQT Infrastructure", "EQT Transition Infrastructure", "2024", "€5.0B", 5500, "Value-Add", "Deploying", {
    description: "Dedicated energy transition fund investing in renewable energy platforms, grid infrastructure, energy storage, and industrial decarbonization across Europe.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Utilities"],
    regions: ["Europe"],
    strategyUrl: "https://eqtgroup.com/infrastructure/eqt-transition-infrastructure",
  }),

  // Equitix
  // Source: https://equitix.com/strategy/ | https://find-and-update.company-information.service.gov.uk/company/LP022752
  f("FUND-096", "Equitix", "Equitix Fund VII", "2024", "£1.5B", 1950, "Core", "Deploying", {
    description: "Core infrastructure fund investing in UK PPP/PFI social infrastructure including schools, hospitals, courts, and essential public facilities with availability-based revenues.\nPortfolio:\nDigital Infrastructure: Local Connect (Fiber Networks), Oman Tech Infrastructure SAOC (Data Centers), Telecom Castilla La Mancha (Fiber Networks)\nRenewables / Energy Transition: Andion (Biogas), Baseload Capital (Geothermal), Beatrice Offshore Windfarm (Offshore Wind), Bio Capital (Biogas), Bio Energy Base (BEE) (Biogas), Cornerstone (Solar), Cowdown Solar (Solar), Eelpower Energy (Battery Storage), Enpal (Rooftop Solar), Eskilstuna Bio-LNG plant (Bio-LNG), Gode Wind 1 (Offshore Wind), Greater Gabbard OFTO (Offshore Transmission), Hornsea One (Offshore Wind), Seagreen Phase 1 (Offshore Wind), Sheringham Shoal Offshore Wind Farm (Offshore Wind), Spanish Hybridisation Portfolio (Solar & Storage), Triton Knoll (Offshore Wind), Ventus Investments (Onshore Wind)\nSocial Infrastructure: Balfour Beatty OFTO and PPP Portfolio (PPP/PFI), Capital Hospitals Limited (Healthcare), Equitix Proton Cancer Centre (Healthcare), Forth Health Ltd (Healthcare), PJ Healthcare Support (Healthcare), Royal Papworth Hospital (Healthcare)\nTransportation: Agility Trains East (Rolling Stock), Agility Trains West (Rolling Stock), Air Tanker (Aviation), Aurora Infrastructure OY (Ports), Crossrail (Rail), High Speed 1 (Rail), M25 (Toll Roads)\nUtilities: Calisen (Smart Metering), Crail Meters Limited (Smart Metering), Dalmuir Waste Water Treatment (Water & Wastewater), Grain Connect (Gas Interconnector), Great Britain and Ireland Interconnector (Electricity Interconnector)\nWaste / Environmental Services: Viridor Energy (Waste-to-Energy)",
    sectors: ["Social Infrastructure", "Utilities"],
    regions: ["Europe"],
    strategyUrl: "https://equitix.com/strategy",
  }),
  // Source: https://equitix.com/news/equitix-announces-final-close-of-its-second-european-infrastructure-vintage-closing-at-e1-4bn/ | https://pitchbook.com/profiles/fund/23126-05F
  f("FUND-097", "Equitix", "Equitix Euro Infrastructure Fund II", "2021", "€1.4B", 1540, "Core-Plus", "Deploying", {
    description: "European core-plus fund investing in essential infrastructure across energy transition, digital, and social sectors with contracted revenue profiles in Continental Europe.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure"],
    regions: ["Europe"],
    strategyUrl: "https://equitix.com/news/equitix-announces-final-close-of-its-second-european-infrastructure-vintage-closing-at-e1-4bn",
  }),
  // Source: https://equitix.com/news/equitix-and-ukib-announce-partnership/ | https://pitchbook.com/profiles/fund/23788-18F
  f("FUND-098", "Equitix", "Equitix UK Electricity Storage Fund", "2023", "£150M", 195, "Core-Plus", "Deploying", {
    description: "Specialist fund investing in battery energy storage systems across the UK, providing grid balancing services and frequency response to support renewable energy integration.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe"],
    strategyUrl: "https://equitix.com/news/equitix-and-ukib-announce-partnership",
  }),

  // Fengate Asset Management
  // Source: https://fengate.com/news/fengate-announces-final-close-of-us1-1-billion-flagship-infrastructure-fund-above-target | https://pitchbook.com/profiles/fund/23698-36F
  f("FUND-099", "Fengate Asset Management", "Fengate Infrastructure Fund IV", "2021", "$1.1B", 1100, "Value-Add", "Deploying", {
    description: "North American mid-market fund investing as a control investor with a developer mindset in energy transition, digital, social, and transportation infrastructure.\nPortfolio:\nDigital Infrastructure: eStruxture Data Centers (Data Centers)\nPower Generation: Central Utility Block (Cogeneration), Freeport Energy Center (Gas-to-Power), Morris Cogeneration Facility (Cogeneration), Texas Cogeneration Facility (Dow Freeport site) (Cogeneration)\nRenewables / Energy Transition: Alpha Omega Power / Vertus Energy Storage (Battery Storage), Ironclad Energy Ventures (Solar & Storage), Prairie Switch Wind project (Onshore Wind)\nSocial Infrastructure: Alberta P3 Schools Bundle 5 (Education), Clackamas County Circuit Courthouse (Civic), Fengate-MedCraft Portfolio (Healthcare), Fengate-Montecito Medical Portfolio (Healthcare), Lambton College Residence (Student Housing), New Perspective Portfolio (Senior Housing), Oakville Trafalgar Memorial Hospital (Healthcare), Prince George's County Public Schools (Education), The Peter Gilgan Mississauga Hospital (Healthcare)\nTransportation: Edmonton Valley Line LRT - Southeast (Light Rail), John F. Kennedy International Airport Terminal 6 (Airports)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure", "Transportation"],
    regions: ["North America"],
    strategyUrl: "https://fengate.com/news/fengate-announces-final-close-of-us1-1-billion-flagship-infrastructure-fund-above-target",
  }),
  // Source: https://fengate.com/infrastructure | https://pitchbook.com/profiles/fund/23697-28F
  f("FUND-100", "Fengate Asset Management", "Fengate Infrastructure Yield Fund", "2019", "$1.22B", 1220, "Core", "Evergreen", {
    description: "Core open-ended fund providing stable income through investments in operational North American infrastructure assets across energy transition, digital, social, and transportation sectors.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure", "Transportation"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://fengate.com/infrastructure",
  }),

  // Generate Capital
  // Source: https://generatecapital.com/ | https://www.prnewswire.com/news-releases/generate-capital-raises-over-1-billion-to-expand-infrastructure-credit-solutions-302607095.html
  f("FUND-101", "Generate Capital", "Generate Capital (Permanent Capital Vehicle)", "2014", ">$14.0B", 14000, "Core-Plus", "Evergreen", {
    description: "Permanent capital platform investing in sustainable infrastructure across distributed energy, water, waste, transportation, and agriculture with a focus on resource efficiency.\nPortfolio:\nRenewables / Energy Transition: Ambient Fuels (Clean Fuels), Amp Americas (Renewable Natural Gas), Cultivate Power (Community Solar), Enfinity Global (Solar), esVolta (Battery Storage), Nexamp (Community Solar), Pacific Steel Group (Green Steel), Plug Power (Project/SPV Level) (Green Hydrogen), Ubiquity (Ubiquity Management) (Distributed Energy), Viridis Initiative (Carbon Capture)\nTransportation: Clean Bus Solutions (Electric Buses)\nUtilities: GrowUp Farms (Vertical Farming)\nWaste / Environmental Services: Generate Upcycle (Recycling)",
    sectors: ["Renewables / Energy Transition", "Water", "Waste / Environmental Services", "Transportation"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.cnbc.com/2021/07/19/generate-capital-raises-2-billion-for-sustainable-infrastructure-investments.html",
  }),
  // Source: https://generatecapital.com/ | https://www.esgtoday.com/generate-capital-raises-1-5-billion-for-sustainable-infrastructure-investments/
  f("FUND-102", "Generate Capital", "Generate Capital Sustainable Infrastructure Fund", "2024", "$1.5B", 1500, "Value-Add", "Deploying", {
    description: "Growth fund targeting emerging sustainable infrastructure technologies including community solar, battery storage, water treatment, and circular economy assets.",
    sectors: ["Renewables / Energy Transition", "Water", "Waste / Environmental Services"],
    regions: ["North America"],
    strategyUrl: "https://www.esgtoday.com/generate-capital-raises-1-5-billion-for-sustainable-infrastructure-investments",
  }),

  // Goldman Sachs Asset Management
  // Source: https://am.gs.com/en-kw/institutions/news/press-release/2023/goldman-sachs-asset-management-raises-4-billion-for-west-street-infrastructure-partners-iv | https://ionanalytics.com/insights/infralogic/goldman-sachs-west-street-v-fundraise-gains-traction/
  f("FUND-103", "Goldman Sachs Asset Management", "West Street Infrastructure Partners V (WSIP V)", "2025", "$4.0B", 4000, "Value-Add", "Raising", {
    description: "Value-add infrastructure fund investing in energy, transportation, digital, and utility infrastructure across North America, Europe, and select Asia-Pacific markets.",
    sectors: ["Power Generation", "Transportation", "Digital Infrastructure", "Utilities"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://am.gs.com/en-us/advisors/products/infrastructure",
  }),
  // Source: https://am.gs.com/en-kw/institutions/news/press-release/2023/goldman-sachs-asset-management-raises-4-billion-for-west-street-infrastructure-partners-iv | https://www.preqin.com/news/goldman-sachs-hits-4bn-target-for-west-street-infrastructure-fund
  f("FUND-104", "Goldman Sachs Asset Management", "West Street Infrastructure Partners IV (WSIP IV)", "2023", "$4.0B", 4000, "Value-Add", "Deploying", {
    description: "Value-add fund targeting mid-to-large-cap infrastructure businesses in energy, transport, and digital sectors with operational improvement opportunities.\nPortfolio:\nDigital Infrastructure: CityFibre (Fiber Networks), Elea Digital (Data Centers), Global Compute Infrastructure (Data Centers), ImOn Communications (Fiber & Broadband), Melita Ltd (Fiber & Broadband)\nMidstream / Energy: HES International (Bulk Terminals)\nRenewables / Energy Transition: BrightNight (Hybrid Renewables), GridStor (Battery Storage), Synthica Energy (RNG), Verdalia Bioenergy (Biomass)\nSocial Infrastructure: Adapteo (Modular Buildings)\nTransportation: Frøy ASA (Maritime Services)\nUtilities: Atlas-SSI (Water Management Equipment)\nWaste / Environmental Services: Liquid Environmental Solutions (Liquid Waste), Synagro Technologies (Biosolids)",
    sectors: ["Power Generation", "Transportation", "Digital Infrastructure", "Utilities"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://am.gs.com/en-us/advisors/news/press-release/2023/goldman-sachs-asset-management-raises-4-billion-for-west-street-infrastructure-partners-iv",
  }),
  // Source: https://www.channel-gsam.com.au/infrastructure/home | https://eqtgroup.com/infrastructure (N/A — no independent cross-reference found for this specific vehicle)
  f("FUND-105", "Goldman Sachs Asset Management", "West Street Private Infrastructure Fund (G-INFRA)", "2023", "Undisclosed", null, "Core-Plus", "Evergreen", {
    description: "Open-end evergreen fund providing private wealth clients access to core-plus infrastructure investments across essential services in developed markets.",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.channel-gsam.com.au/infrastructure/home",
  }),

  // Harbert Management Corp
  // Source: https://harbert.net/investment-strategies/infrastructure | https://www.globenewswire.com/news-release/2022/10/06/2529666/0/en/Harbert-Infrastructure-Fund-VI-LP-Announces-Final-Close.html
  f("FUND-106", "Harbert Management Corp", "Harbert Infrastructure Fund VI", "2022", "$905M", 905, "Value-Add", "Deploying", {
    description: "Mid-market value-add fund investing in essential US infrastructure businesses including power, utilities, transportation, and environmental services with operational improvement.\nPortfolio:\nPower Generation: AL Sandersville Holdings (Gas-to-Power), Astoria Energy I & II (Gas-to-Power), Calhoun Energy Center (Gas-to-Power), Goodwell (Gas-to-Power), Gulf Pacific Power (Gas-to-Power), Hamakua Energy Plant (Biomass Power), Kalaeloa Partners LP (Gas-to-Power), Northern Star Generation (Gas-to-Power), Origin (Gas-to-Power), Rocky Ridge (Gas-to-Power), Thunderhead Energy Solutions (Gas-to-Power), Washington County Power (Gas-to-Power)\nRenewables / Energy Transition: D. E. Shaw Renewable Investments (DESRI) (Solar & Storage), Desert Sunlight (Solar), EGPNA Renewable Energy Holdings (Wind & Solar), Generate Capital (Diversified Clean Energy), Gulf Plains Wind (Onshore Wind), Prairie Rose (Onshore Wind), Rocky Caney Wind (Onshore Wind)",
    sectors: ["Power Generation", "Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["North America"],
    strategyUrl: "https://harbert.net/investment-strategies/infrastructure",
  }),

  // Harrison Street
  // Source: https://harrisonst.com/infrastructure/ | https://pitchbook.com/profiles/fund/16558-93F
  f("FUND-107", "Harrison Street", "Harrison Street Social Infrastructure Fund", "2018", "$5.2B+", 5200, "Core-Plus", "Evergreen", {
    description: "Open-end fund investing in demographic-driven social infrastructure including student housing, senior living, medical facilities, and life science properties across North America.\nPortfolio:\nDigital Infrastructure: DRFortress (Data Centers), PowerHouse Data Centers (Data Centers), Union Station Data Center (Data Centers)\nRenewables / Energy Transition: Ecoplexus Solar Portfolio (Solar), Soltage JV (Solar)\nSocial Infrastructure: Appalachian State Innovation District (University P3), ASU P3 Student Housing JV (Student Housing), IIT Campus Central Power Systems (P3) (University P3), Michigan State University P3 (University P3), Pittock Block (Civic), Simon Fraser University P3 (University P3), Univ. of Chicago Woodlawn P3 (University P3), Wells Building (Civic), WPI Utility System (P3) (University P3)\nUtilities: CoolCo (Cincinnati District Energy) (District Energy)",
    sectors: ["Social Infrastructure"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://harrisonst.com/infrastructure",
  }),
  // Source: https://www.infrastructureinvestor.com/harrison-street-to-launch-750m-energy-transition-fund-exclusive/ | https://www.harrisonst.com/strategy/infrastructure/
  f("FUND-108", "Harrison Street", "Harrison Street Energy Transition Fund", "2023", "$750M", 750, "Value-Add", "Deploying", {
    description: "Fund targeting distributed energy and sustainability infrastructure serving institutional real estate including on-site solar, storage, microgrids, and energy efficiency.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/harrison-street-to-launch-750m-energy-transition-fund-exclusive",
  }),
  // Source: https://www.datacenterdynamics.com/en/news/harrison-street-raises-600m-for-data-center-fund/ | https://www.commercialsearch.com/news/harrison-street-raises-600m-for-digital-asset-investment/
  f("FUND-109", "Harrison Street", "Harrison Street Digital Fund", "2024", "$600M", 600, "Value-Add", "Deploying", {
    description: "Dedicated digital infrastructure fund investing in edge data centers, fiber networks, and connectivity infrastructure serving education, healthcare, and government institutions.",
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America"],
    strategyUrl: "https://www.datacenterdynamics.com/en/news/harrison-street-raises-600m-for-data-center-fund",
  }),

  // H.I.G. Capital
  // Source: https://hig.com/news/h-i-g-capital-raises-1-3-billion-for-infrastructure-fund/ | https://pitchbook.com/profiles/fund/19115-20F
  f("FUND-110", "H.I.G. Capital", "H.I.G. Infrastructure Partners Fund I", "2022", "$1.3B", 1300, "Value-Add", "Deploying", {
    description: "Inaugural infrastructure fund targeting mid-market essential services businesses in utilities, transportation, and environmental services across North America and Europe.\nPortfolio:\nCommunications: Tower Engineering Professionals (Tower Services)\nDigital Infrastructure: PolarDC (Data Centers)\nPower Generation: Trail Ridge Power (Gas-to-Power)\nRenewables / Energy Transition: Greenflash Infrastructure (Battery Storage), Northern Biogas (Biogas)\nTransportation: North America Central School Bus (School Bus)\nWaste / Environmental Services: ARC (Waste Management), Best Trash (Waste Collection), Fluo Group Oy (Waste Management)",
    sectors: ["Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://hig.com/news/h-i-g-capital-raises-1-3-billion-for-infrastructure-fund",
  }),

  // I Squared Capital
  // Source: https://isquaredcapital.com/strategies/ | https://www.pa.gov/content/dam/copapwp-pagov/en/psers/documents/board3/resolutions/2025/2025.21%20pserb%20resolution%20i%20squared%20global%20infrastructure%20fund%20iv.pdf
  f("FUND-111", "I Squared Capital", "ISQ Global Infrastructure Fund IV", "2024", "$15.0B", 15000, "Value-Add", "Deploying", {
    description: "Large-cap global infrastructure fund investing in utilities, energy, transportation, digital infrastructure, and environmental services with active management and platform building.\nPortfolio:\nCommunications: Tarana Wireless (Fixed Wireless)\nDigital Infrastructure: 1NCE (IoT Connectivity), BDx (Big Data Exchange) (Data Centers), EXA Infrastructure (Subsea & Terrestrial Fiber), Ezee Fiber (Fiber Networks), HGC Global Communications (Fiber & Data Centers), Infofabrica Holdings (Data Centers), KIO Networks (Data Centers), Lightstorm (Fiber Networks), nLighten (Edge Data Centers), Oxya (Data Centers), Unifiber by AsiaNet (Fiber Networks)\nMidstream / Energy: AG&P Gas (LNG Distribution), Philippine Coastal Storage (Oil Storage), Rubis Terminal (Bulk Liquid Storage), Whiptail Midstream (Gathering & Processing), Whistler Pipeline (Pipelines), Zenith Energy Terminal (Terminals & Storage)\nPower Generation: Absolute Energy (Gas-to-Power), Aggreko (Temporary Power), Atlantic Power (Diversified Power), Conrad Energy (Flexible Power), Inkia Energy (Power Generation), Priority Power Management (Distributed Power), RPower (Power Generation)\nRenewables / Energy Transition: ANZA Power (Solar & Storage), Berde Renewables (Wind & Solar), Clean Energy Fuels Australia (RNG), FAS Renewables (Solar), Global Energy Storage (Battery Storage), GridPoint (Energy Management), Hexa Renewables (Solar), HTEC (Hydrogen), Novel Energy Solutions (Solar & Storage), Octa (Onshore Wind), Órigo Energia (Solar), Radiant Energy Solutions (Solar)\nSocial Infrastructure: Domidep (Senior Care), Formera Senior Care (Senior Care), Vitanas (Senior Care)\nTransportation: Arriva (Bus & Rail), Cube Cold Europe (Cold Storage), Cube Highways (Toll Roads), Nassau Cruise Ports (Cruise Ports), Ramudden Global (Traffic Management), Rentco (Equipment Leasing), SPRB Group (Maritime), Summit School Services (School Bus), TEN (Transportation Equipment Network) (Container Leasing), TIP Group (Trailer Leasing), WOW Logistics (Cold Storage)\nUtilities: Energia Group (Electric & Gas Utilities), Polaris Smart Meter (Smart Metering)\nWaste / Environmental Services: Enva (Waste Management), Liberty Tire Recycling (Tire Recycling), Soilco (Organic Waste), VLS Environmental Solutions (Liquid Waste)",
    sectors: ["Utilities", "Power Generation", "Transportation", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["Global"],
    strategyUrl: "https://isquaredcapital.com/strategies",
  }),
  // Source: https://isquaredcapital.com/strategies/ | https://www.infrastructureinvestor.com/i-squared-set-to-launch-2bn-energy-transition-fund-exclusive/
  f("FUND-112", "I Squared Capital", "ISQ Energy Transition Infrastructure Fund", "2023", "$2.0B", 2000, "Value-Add", "Deploying", {
    description: "Dedicated energy transition fund investing in renewable energy, energy storage, grid infrastructure, and clean transportation globally.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Transportation"],
    regions: ["Global"],
    strategyUrl: "https://isquaredcapital.com/cpt_news/i-squared-to-invest-200-million-for-last-mile-electric-grid-infrastructure-in-the-uk",
  }),

  // iCON Infrastructure
  // Source: https://iconinfrastructure.com/ | https://pitchbook.com/profiles/fund/27717-76F
  f("FUND-113", "iCON Infrastructure", "iCON Infrastructure Partners VII", "2024", "$3.7B", 3700, "Core-Plus", "Deploying", {
    description: "Mid-market core-plus fund targeting essential infrastructure businesses in utilities, transportation, and environmental services across North America, Europe, and Australasia.\nPortfolio:\nCommunications: TruVista Telecommunications (Telecoms)\nDigital Infrastructure: BornFiber (Fiber Networks), Dobson Fiber (Fiber Networks), GIM Glasfaser Infrastruktur (Fiber Networks), Northern Access GmbH (Fiber Networks), Nua (Fiber Networks), Sonnet (Fiber Networks), SYLTEL (Fiber Networks)\nLogistics: Gruppo Spinelli (Port Logistics), Service Terminal Rotterdam (Ports & Terminals), Verbrugge International (Ports & Terminals)\nPower Generation: Capstone Infrastructure (Diversified Power)\nRenewables / Energy Transition: Enoé (Solar), Green Recovery Projects (Diversified Renewables), H2air (Wind), Rothes CoRDe (Biomass), Wind Estate (Wind)\nSocial Infrastructure: Alliance Medical Group (Healthcare Imaging), Choice Care Group (Specialist Care), Meinhardt Group (Engineering Services), Mercurius Health (Healthcare), Vanguard Healthcare Solutions (Healthcare), Vista Services (Facilities Management)\nTransportation: Bardonecchia Ski (Leisure Infrastructure), Cruise Terminals International (Ports), GMP (Générale de Manutention Portuaire) (Ports), Iowa Interstate Railroad (Short-Line Rail), Sestrieres (Motorway Services)\nUtilities: EGEA (Multi-Utility), firmus energy (Gas Distribution), GridLink (Interconnectors), Manicargas (Gas Distribution), Sonorgás (Gas Distribution), Stockholm Gas (Gas Distribution), UPL (Utility Pipeline Ltd) (Gas Distribution), USG (Multi-Utility)\nWaste / Environmental Services: Eco Eridania (Hazardous Waste), Meinhardt Städtereinigung (Waste Collection), Sommers Waste Solutions (Waste Management)\nWater: SESW (Sutton and East Surrey Water) (Water Utility)",
    sectors: ["Utilities", "Transportation", "Waste / Environmental Services", "Renewables / Energy Transition"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategyUrl: "https://www.friedfrank.com/news-and-insights/icon-infrastructure-closes-latest-3-7b-fund-12555",
  }),

  // IFM Investors
  // Source: https://www.ifminvestors.com/investment-capabilities/infrastructure | https://pitchbook.com/profiles/fund/13416-94F
  f("FUND-114", "IFM Investors", "IFM Global Infrastructure Fund (GIF)", "2004", ">$73.0B", 73000, "Core", "Evergreen", {
    description: "The world's largest open-end core infrastructure fund investing in essential, monopoly-like infrastructure assets with strong market positions, predictable regulatory environments, and high barriers to entry across developed markets.\nPortfolio:\nCommunications: Arqiva (Broadcast & Towers)\nDigital Infrastructure: GlasfaserPlus (Fiber Networks), Green Group AG (Data Centers), Switch Inc. (Data Centers)\nMidstream / Energy: Buckeye Partners (Pipelines & Terminals), Colonial Pipeline (Pipelines), Freeport LNG (LNG), VTTI (Terminals & Storage)\nRenewables / Energy Transition: ERG (Wind & Solar), Fu-Gen BESS (Battery Storage), GreenGas (Biogas), Mobius Renewables (Renewable Natural Gas), Nala Renewables (Wind & Solar)\nSocial Infrastructure: Curtin University Accommodation (Student Housing)\nTransportation: Adelaide Airport (Airports), Air Rail (Ground Support Equipment), Aleatica (Toll Roads), Atlas Arteria (Toll Roads), Baltic Hub (DCT Gdansk) (Ports), Brisbane Airport (Airports), Darwin Airport (NT Airports) (Airports), GCT Global Container Terminals (Ports), Indiana Toll Road (Toll Roads), M6toll (Toll Roads), Malta Airport (Airports), Manchester Airports Group (Airports), Melbourne Airport (Airports), Mersin International Port (Ports), NSW Ports (Ports), Perth Airport (Airports), Port of Brisbane (Ports), Southern Cross Station (Rail Stations), Sydney Airport (Airports), Vienna Airport (Airports)\nUtilities: Anglian Water (Water & Wastewater), Ausgrid (Electricity Distribution), Duquesne Light (Electric Utilities), Enwave Energy (District Energy), FCC Aqualia (Water & Wastewater), Naturgy (Gas & Electric Utilities), Veolia Energia Polska (District Heating), Wyuna Water (Water)",
    sectors: ["Transportation", "Utilities", "Midstream / Energy", "Communications"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    structure: "Open-End",
    strategyUrl: "https://www.ifminvestors.com/capabilities/infrastructure/our-strategies",
  }),
  // Source: https://www.ifminvestors.com/en-au/capabilities/infrastructure/ | https://pitchbook.com/profiles/fund/13795-66F
  f("FUND-115", "IFM Investors", "IFM Australian Infrastructure Fund (AIF)", "1995", "~$8.7B", 8700, "Core", "Evergreen", {
    description: "Australia's longest-running infrastructure fund investing in essential domestic assets including airports, ports, toll roads, regulated utilities, and telecommunications infrastructure.",
    sectors: ["Transportation", "Utilities", "Communications"],
    regions: ["Asia-Pacific"],
    structure: "Open-End",
    strategyUrl: "https://www.ifminvestors.com/en-au/capabilities/infrastructure",
  }),
  // Source: https://www.ifminvestors.com/investment-capabilities/infrastructure | https://pitchbook.com/profiles/fund/20910-97F
  f("FUND-116", "IFM Investors", "IFM Net Zero Infrastructure Fund (NZIF)", "2022", "$3.0B", 3000, "Core-Plus", "Evergreen", {
    description: "Open-end fund targeting essential infrastructure assets that accelerate the transition to a net-zero emissions economy, including renewables, energy storage, EV charging, hydrogen, and alternative fuels.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Midstream / Energy"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.ifminvestors.com/news-and-insights/media-centre/ifm-net-zero-infrastructure-fund-completes-greengas-acquisition-marking-next-era-of-growth-for-renewable-energy-company/",
  }),
  // Source: https://www.ifminvestors.com/investment-capabilities/infrastructure | https://ionanalytics.com/insights/infralogic/ifm-prepares-first-global-value-add-infra-fund/
  f("FUND-117", "IFM Investors", "IFM Global Value Add Infrastructure Fund", "2025", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "First value-add fund from IFM targeting infrastructure businesses requiring active management and operational improvement in energy transition, digital, and transport sectors.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["Global"],
    strategyUrl: "https://www.ifminvestors.com/news-and-insights/thought-leadership/the-infrastructure-growth-engine-creating-tomorrows-core-infrastructure-today",
  }),

  // Igneo Infrastructure Partners
  // Source: https://www.igneoip.com/europe/en/institutional/news-and-insights/press/igneo-closes-edif-iii-above-hard-cap.html | https://inforcapital.com/funds/european-diversified-infrastructure-fund-iii-edif-iii/
  f("FUND-118", "Igneo Infrastructure Partners", "European Diversified Infrastructure Fund III (EDIF III)", "2020", "€5.3B", 5830, "Core-Plus", "Deploying", {
    description: "Third vintage closed-end fund targeting European mid-market, sustainable economic infrastructure assets across energy, transportation, utility, telecommunications, and environmental sectors.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities", "Communications", "Waste / Environmental Services"],
    regions: ["Europe"],
    strategyUrl: "https://www.igneoip.com/europe/en/institutional/news-and-insights/press/igneo-closes-edif-iii-above-hard-cap.html",
  }),
  // Source: https://www.igneoip.com/europe/en/institutional/news-and-insights/press.html | https://www.infrastructureinvestor.com/igneo-eyes-launch-of-fourth-european-infra-fund-exclusive/
  f("FUND-119", "Igneo Infrastructure Partners", "European Diversified Infrastructure Fund IV (EDIF IV)", "2025", "€4.0B", 4400, "Core-Plus", "Raising", {
    description: "Fourth vintage of Igneo's flagship European infrastructure series, continuing the strategy of investing in mid-market, sustainable economic infrastructure across energy, transport, utility, and telecom sectors.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities", "Communications", "Waste / Environmental Services"],
    regions: ["Europe"],
    strategyUrl: "https://www.igneoip.com/europe/en/institutional/news-and-insights/press.html",
  }),
  // Source: https://www.igneoip.com/europe/en/institutional/news-and-insights/press.html | https://pitchbook.com/profiles/fund/20836-99F
  f("FUND-120", "Igneo Infrastructure Partners", "Global Diversified Infrastructure Fund (GDIF)", "N/A", "~$7.5B", 7500, "Core-Plus", "Evergreen", {
    description: "Open-end global infrastructure fund investing in mid-market infrastructure businesses across waste, water, renewables, transportation, and digital sectors with a long-term sustainable value creation approach.\nPortfolio:\nDigital Infrastructure: Tuatahi First Fibre (Fiber Networks), US Signal (Data Centers & Fiber), Vault Digital Infrastructure (Data Centers), Westconnect (Fiber Networks)\nMidstream / Energy: Evos (Storage & Terminals), Höegh Evi (LNG FSRU), Navigator Terminals (Bulk Liquid Storage), Quantem (Bulk Liquid Storage)\nRenewables / Energy Transition: Atmos Renewables (Solar), CleanPeak Energy (CPE Renewable) (Solar & Storage), ENSO (Solar), Finerge (Wind), Indigo Generation (Solar), Soltage (Solar), Terra-Gen (Wind & Solar)\nTransportation: Auto-estrada do Algarve Via do Infante (AAVI) (Toll Roads), Auto-Estradas do Douro Litoral (AEDL) (Toll Roads), Auto-estradas Norte Litoral (AENL) (Toll Roads), Brisbane Airport (Airports), Infinity Aviation Group (Aviation Services), International Parking Group (Parking), Patriot Rail (Short-Line Rail), Scandlines (Ferries), Strait Link (Ferries)\nUtilities: City Green Light (Street Lighting), DAH Group (District Heating), MVV Energie (District Energy), Nordion Energi (District Heating), Utilitas (District Heating)\nWaste / Environmental Services: B+T Group (Waste Management), enfinium (Waste-to-Energy), Integrated Waste Services (IWS) (Waste Management), Waste Management New Zealand (Waste Management)\nWater: coNEXA (Water Infrastructure)",
    sectors: ["Waste / Environmental Services", "Water", "Renewables / Energy Transition", "Transportation", "Digital Infrastructure"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.igneoip.com/australia/en/institutional/news-and-insights/press/igneo-invests-in-recycle-central-group.html",
  }),
  // Source: https://www.igneoip.com/europe/en/institutional/our-offering/north-american-middle-market-infrastructure.html | https://pitchbook.com/profiles/fund/25885-27F
  f("FUND-121", "Igneo Infrastructure Partners", "North American Diversified Infrastructure Fund (NADIF)", "2024", "$1.0B", 1000, "Core-Plus", "Evergreen", {
    description: "Open-end fund targeting mid-market essential infrastructure assets in North America across utilities, renewables, transportation, and social infrastructure.",
    sectors: ["Utilities", "Renewables / Energy Transition", "Transportation"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.igneoip.com/europe/en/institutional/our-offering/north-american-middle-market-infrastructure.html",
  }),
  // Source: https://www.igneoip.com/ | https://ionanalytics.com/insights/infralogic/igneo-targets-tripling-size-of-overhauled-australasia-fund/
  f("FUND-122", "Igneo Infrastructure Partners", "Australian Diversified Infrastructure Fund (ADIF)", "2003", "A$1.0B+", 660, "Core-Plus", "Evergreen", {
    description: "Rebranded open-end fund (formerly WIIF) targeting majority stakes in Australian and New Zealand mid-market infrastructure companies across digital, energy, waste, and water sectors.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Waste / Environmental Services", "Water"],
    regions: ["Asia-Pacific"],
    structure: "Open-End",
    strategyUrl: "https://www.igneoip.com/australia/en/institutional/our-offering/assets.html",
  }),

  // InfraRed Capital Partners
  // Source: https://www.ircp.com/news/infrared-capital-partners-announces-1-billion-close-for-sixth-value-add-fund/ | https://pitchbook.com/profiles/fund/20606-77F
  f("FUND-123", "InfraRed Capital Partners", "InfraRed Infrastructure Fund VI", "2022", "$1.0B+", 1000, "Value-Add", "Deploying", {
    description: "Value-add fund investing in mid-market infrastructure across energy transition, digital, and social sectors in Europe, North America, and Asia-Pacific.\nPortfolio:\nDigital Infrastructure: Altitude Infra (Fiber Networks), Deutsche GigaNetz (Fiber Networks), LiveOak Fiber (Fiber Networks), Nexspace (Data Centers), NxN Data Centers (Data Centers), ProLink Infrastructure (Fiber Networks), Rogers Communications Data Centres (Data Centers)\nRenewables / Energy Transition: Beatrice Offshore Wind (Offshore Wind), Brazos Wind Farm (Onshore Wind), Drax Battery Storage (Battery Storage), East Anglia One (Offshore Wind), Fortysouth (Wind), Galloper OFTO (Offshore Transmission), Grönhult (Onshore Wind), Hawtree (Solar), Hornsea II OFTO (Offshore Transmission), Hornsea One (Offshore Wind), Iron Star Wind Project (Onshore Wind), Jolt Energy (EV Charging), Madison Fields Solar Farm (Solar), Merkur Offshore (Offshore Wind), Nordic Onshore (Onshore Wind), Priddy Wind Project (Onshore Wind), Valdesolar (Solar)\nSocial Infrastructure: Allenby & Connaught MoD Accommodation (Military Housing), Brighton Children's Hospital (Healthcare), Central Middlesex Hospital (Healthcare), Cork School Of Music (Education), Croydon Schools (Education), Dorset Fire & Rescue (Emergency Services), Edinburgh Schools (Education), Exeter Crown & County Court (Civic), Lewisham Hospital (Healthcare), Metropolitan Police Specialist Training Centre (Public Safety), Northwood MoD Headquarters (Military), Paris-Saclay University (Education), Southmead Hospital (Healthcare), Zaanstad Penitentiary (Justice)\nTransportation: A249 Road (Roads), A63 Motorway (Toll Roads), A9 Road (Roads), B247 Road (Roads), Blankenburg Tunnel (Tunnels), Cross London Trains (Rolling Stock), Gulenskyss (Ferries), High Speed 1 (HS1 Limited) (Rail), Hullo Ferries (Ferries), Tyne Pass (Tunnels)\nUtilities: Affinity Water (Water), Texas Nevada Transmission (Electricity Transmission)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure"],
    regions: ["Europe", "North America", "Asia-Pacific"],
    strategyUrl: "https://www.ircp.com/news/infrared-capital-partners-announces-1-billion-close-for-sixth-value-add-fund",
  }),
  // Source: https://www.ircp.com/ | https://ionanalytics.com/insights/infralogic/infrared-readies-usd-1-5bn-seventh-infra-fund/
  f("FUND-124", "InfraRed Capital Partners", "InfraRed Infrastructure Fund VII", "2025", "$1.5B", 1500, "Value-Add", "Raising", {
    description: "Successor value-add fund continuing InfraRed's strategy in energy transition, digital infrastructure, and essential services across global developed markets.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure"],
    regions: ["Europe", "North America", "Asia-Pacific"],
    strategyUrl: "https://www.weil.com/articles/weil-advises-infrared-capital-partners-on-fundraising-of-1-billion-infrared-infrastructure-fund-vi",
  }),
  // Source: https://www.hicl.com/ | https://www.ircp.com/who-we-are/hicl-trig/
  f("FUND-125", "InfraRed Capital Partners", "HICL Infrastructure PLC", "2006", "~£3.0B", 3900, "Core", "Evergreen", {
    description: "London-listed core infrastructure investment company targeting PPP/PFI social infrastructure, regulated assets, and demand-based infrastructure with predictable cash flows.",
    sectors: ["Social Infrastructure", "Utilities", "Transportation"],
    regions: ["Europe", "North America"],
    structure: "Listed / Evergreen",
    ticker: "HICL.L",
    strategyUrl: "https://www.hicl.com/about-hicl/company-overview",
  }),
  // Source: https://www.trig-ltd.com/about-us/ | https://en.wikipedia.org/wiki/The_Renewables_Infrastructure_Group
  f("FUND-126", "InfraRed Capital Partners", "The Renewables Infrastructure Group (TRIG)", "2013", "~£1.9B", 2470, "Core-Plus", "Evergreen", {
    description: "FTSE 250 listed closed-ended investment company providing long-term stable dividends from a diversified portfolio of operational wind farms, solar parks, and battery storage across the UK and Europe.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Listed / Closed-End",
    ticker: "TRIG.L",
    strategyUrl: "https://www.trig-ltd.com/about-us",
  }),
  // Source: https://www.ircp.com/ | Could not find a dedicated cross-reference URL. No PitchBook, Preqin, or SEC filing was found for this specific fund name.
  f("FUND-127", "InfraRed Capital Partners", "North American Core Income Energy Transition Fund", "2023", "$900M", 900, "Core-Plus", "Evergreen", {
    description: "Open-end fund targeting operational renewable energy assets in North America with contracted revenues, focusing on solar, wind, and battery storage.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.prnewswire.com/news-releases/sun-life-completes-majority-acquisition-of-infrared-capital-partners-301086822.html",
  }),

  // InfraVia Capital Partners
  // Source: https://infraviacapital.com/ | https://pitchbook.com/profiles/fund/26044-39F
  f("FUND-128", "InfraVia Capital Partners", "InfraVia European Fund VI", "2024", "€8.0B", 8800, "Core-Plus", "Deploying", {
    description: "Flagship European mid-market fund investing in digital infrastructure, energy transition, transportation, and healthcare infrastructure with active value creation.\nPortfolio:\nDigital Infrastructure: Celeste (Fiber & Cloud), Fibre Networks Ireland (Fiber Networks), IFT (Investissement Fibre Territoires) (Fiber Networks), Netomnia (Fiber Networks), nexfibre (Fiber Networks), OpCore (Data Centers), PSO (Polski Światłowód Otwarty) (Fiber Networks)\nMidstream / Energy: Molgas (LNG Distribution)\nRenewables / Energy Transition: Aurora (Solar), EDP Renováveis Solar Portfolio (Solar), Giga Storage (Battery Storage), Green Utility (Solar), Kyotherm (Geothermal / Biomass), Podini Group PV Portfolio (Solar), Prosolia Energy (Solar), Soparsol (Solar), Treblade (Onshore Wind)\nSocial Infrastructure: CareChoice (Senior Care), Grandir (Childcare), Mater Private Network (Healthcare), Quartz Healthcare (Healthcare), Sandaya (Outdoor Hospitality), Univet (Veterinary)\nTransportation: Autostrada Wielkopolska (A2) (Toll Roads), LDA (Louis Dreyfus Armateurs) (Maritime), Nexrail (Rail Leasing), Tramlink (Light Rail)\nUtilities: Heygaz (Gas Distribution)\nWaste / Environmental Services: Blue Phoenix (Waste Recycling)",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["Europe"],
    strategyUrl: "https://infraviacapital.com/infravia-closes-its-new-infrastructure-fund-at-e5bn-hard-cap",
  }),

  // Infratil
  // Source: https://infratil.com/ | https://en.wikipedia.org/wiki/Infratil
  f("FUND-129", "Infratil", "Infratil Limited", "1994", "$12.2B", 12200, "Core-Plus", "Evergreen", {
    description: "NZX and ASX-listed infrastructure investment company with a portfolio spanning renewable energy, digital infrastructure, airports, and healthcare across Australasia and globally.\nPortfolio:\nCommunications: One NZ (Telecoms)\nDigital Infrastructure: CDC Data Centres (Data Centers), Console Connect (Network-as-a-Service), Kao Data (Data Centers)\nRenewables / Energy Transition: Fortysouth (Wind), Galileo (Green Hydrogen), Gurīn Energy (Wind & Solar), Longroad Energy (Wind & Solar), Mint Renewables (Solar)\nSocial Infrastructure: Qscan Group (Medical Imaging), RHCNZ Medical Imaging (Medical Imaging)\nTransportation: Wellington International Airport (Airports)\nUtilities: Contact Energy (Electricity Generation & Retail)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Social Infrastructure"],
    regions: ["Asia-Pacific", "North America", "Europe"],
    structure: "Listed / Evergreen",
    ticker: "IFT.NZ",
    strategyUrl: "https://infratil.com/for-investors",
  }),

  // J.P. Morgan Asset Management
  // Source: https://am.jpmorgan.com/us/en/asset-management/adv/funds/alternatives/infrastructure/ | https://pitchbook.com/profiles/fund/13152-43F
  f("FUND-130", "J.P. Morgan Asset Management", "Infrastructure Investments Fund (IIF)", "2006", "~$40.0B", 40000, "Core", "Evergreen", {
    description: "One of the world's largest open-end core infrastructure funds, acquiring mature infrastructure assets with stable cash flows, monopolistic frameworks, and long-term contracts across energy, water, and transportation in OECD countries.\nPortfolio:\nMidstream / Energy: BWC Terminals (Bulk Liquid Storage), Enstor Gas (Gas Storage), Koole Terminals (Bulk Liquid Storage), North Sea Midstream Partners (Gas Processing)\nRenewables / Energy Transition: Nadara (Renantis / Ventient) (Onshore Wind), Onward Energy (Wind), Sonnedix (Solar)\nTransportation: Beacon Rail (Rail Leasing), Nieuport Aviation (FBO / Aviation), North Queensland Airports (Airports), Umove (Bus Services)\nUtilities: Adven Group (Värmevärden) (District Heating), El Paso Electric (Electric Utilities), GETEC Group (Energy Services), Nexus Water Group (Water & Wastewater), Nortegas (Gas Distribution), South Jersey Industries (Gas Distribution), Summit Utilities (Gas Distribution)",
    sectors: ["Utilities", "Transportation", "Midstream / Energy", "Water"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    structure: "Open-End",
    strategyUrl: "https://am.jpmorgan.com/us/en/asset-management/adv/funds/alternatives/infrastructure",
  }),
  // Source: https://am.jpmorgan.com/us/en/asset-management/adv/funds/alternatives/infrastructure/ | https://pitchbook.com/profiles/fund/16687-45F
  f("FUND-131", "J.P. Morgan Asset Management", "Global Transport Income Fund (GTIF)", "2018", "$4.1B", 4100, "Core-Plus", "Evergreen", {
    description: "Specialist open-end transport fund investing in airports, seaports, rail, toll roads, and logistics infrastructure globally with long-term contracted or regulated revenues.",
    sectors: ["Transportation", "Logistics"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://am.jpmorgan.com/us/en/asset-management/adv/funds/alternatives/infrastructure",
  }),

  // Kimmeridge Energy
  // Source: https://kimmeridge.com/ | https://pitchbook.com/profiles/fund/19844-74F (this is Fund I only)
  f("FUND-132", "Kimmeridge Energy", "Kimmeridge Carbon Solutions Fund II", "2024", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Carbon management fund investing in carbon capture, utilization, and sequestration infrastructure, as well as emissions reduction technology across North America.\nPortfolio:\nMidstream / Energy: Caturus (Oil & Gas E&P), Commonwealth LNG (LNG)\nRenewables / Energy Transition: 38 Degrees North (Distributed Generation), Chestnut Carbon (Carbon Offset)",
    sectors: ["Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["North America"],
    strategyUrl: "https://kimmeridge.com/select-investments",
  }),

  // KKR
  // Source: https://www.kkr.com/invest/infrastructure | https://pitchbook.com/profiles/fund/23764-06F
  f("FUND-133", "KKR", "KKR Global Infrastructure Investors V", "2023", "$20.0B", 20000, "Value-Add", "Deploying", {
    description: "Flagship large-cap infrastructure fund investing in transportation, energy, digital infrastructure, and utilities across global markets with thematic operational improvement.\nPortfolio:\nCommunications: Pinnacle Towers (Towers), Telxius (Towers & Subsea Cable), Vantage Towers (Towers)\nDigital Infrastructure: Contabo (Cloud & Hosting), CyrusOne (Data Centers), FiberCop (NetCo) (Fiber Networks), Global Technical Realty (Data Centers), Gulf Data Hub (Data Centers), Hyperoptic (Fiber Networks), Metronet (Fiber Networks), ONNET Chile (Fiber Networks), ONNET Colombia (Fiber Networks), Open Dutch Fiber (Fiber Networks), Reintel (Fiber Networks), Telenor Fiber (Fiber Networks)\nMidstream / Energy: ADNOC Oil Pipelines (Pipelines), Central Tank Terminal (Storage), Coastal GasLink (Pipelines), Colonial Pipeline (Pipelines), Crescent Energy (Oil & Gas E&P), Genesis Energy (Pipelines & Marine), Port Arthur LNG (LNG), Rocky Mountain Midstream (Gathering & Processing), Sempra Infrastructure (LNG & Utilities)\nPower Generation: ContourGlobal (Diversified Power), First Gen (Power Generation)\nRenewables / Energy Transition: Acciona Energía Internacional (Wind & Solar), Albioma (Biomass & Solar), Aster Renewable Energy (Solar), Avantus (Solar), CarbonCount Holdings (Carbon Credits), Cordia Energy (Solar), Encavis (Solar & Wind), Greenvolt (Biomass & Solar), Hero Future Energies (Wind & Solar), Ignis JV (Solar & Storage), Serentica Renewables (Wind & Solar), Virescent Infrastructure (Solar), Zenobē (Battery Storage & EV)\nSocial Infrastructure: John Laing (PPP/PFI)\nTransportation: Altitude Aircraft Leasing (Aircraft Leasing), Highways Infrastructure Trust (Toll Roads), Ocean Yield (Maritime Leasing), Q-Park (Parking), Queensland Airports (Airports), Refresco (Beverage Logistics), Ritchies Transport (Bus Services)\nUtilities: AEP Transmission (Stake) (Electricity Transmission), Axius Water (Water & Wastewater), Calisen (Smart Metering), Flow Control Group (Utility Services), IndiGrid (Electricity Transmission), Smart Metering Systems (SMS) (Smart Metering), Spark Infrastructure (Electricity Distribution)\nWaste / Environmental Services: A-Gas (Refrigerant Management), Viridor (Waste-to-Energy)",
    sectors: ["Transportation", "Power Generation", "Digital Infrastructure", "Utilities", "Renewables / Energy Transition"],
    regions: ["Global"],
    strategyUrl: "https://www.kkr.com/invest/infrastructure",
  }),
  // Source: https://media.kkr.com/rss-feed/news-release/?news_id=e3f0f55a-55a0-453a-88ab-10e33254581a | https://pitchbook.com/profiles/fund/21440-62F
  f("FUND-134", "KKR", "KKR Asia Pacific Infrastructure Investors II", "2023", "$6.4B", 6400, "Value-Add", "Deploying", {
    description: "Asia-Pacific infrastructure fund investing in transportation, energy, utilities, and digital infrastructure across developed and emerging Asian markets.",
    sectors: ["Transportation", "Power Generation", "Utilities", "Digital Infrastructure"],
    regions: ["Asia-Pacific"],
    strategyUrl: "https://media.kkr.com/rss-feed/news-release/?news_id=e3f0f55a-55a0-453a-88ab-10e33254581a",
  }),
  // Source: https://www.kkr.com/invest/infrastructure | https://pitchbook.com/profiles/fund/27909-01F
  f("FUND-135", "KKR", "KKR Asia Pacific Infrastructure Investors III", "2025", ">$6.4B", 6400, "Value-Add", "Raising", {
    description: "Successor Asia-Pacific fund continuing KKR's strategy in essential infrastructure across transport, energy, digital, and utilities in the region.",
    sectors: ["Transportation", "Power Generation", "Utilities", "Digital Infrastructure"],
    regions: ["Asia-Pacific"],
    strategyUrl: "https://www.infrastructureinvestor.com/kkr-aims-for-record-haul-for-third-pan-asia-infra-fund",
  }),
  // Source: https://kseries.kkr.com/infrastructure/ | https://pitchbook.com/profiles/fund/18247-15F
  f("FUND-136", "KKR", "Diversified Core Infra Fund (DCIF)", "2020", "~$11.0B+", 11000, "Core", "Evergreen", {
    description: "Open-end core infrastructure fund acquiring mature brownfield assets with stable, regulated or contracted cash flows across energy, transport, telecom, water, and utilities, primarily sourced on a proprietary basis in OECD markets.",
    sectors: ["Utilities", "Transportation", "Communications", "Midstream / Energy", "Water"],
    regions: ["North America", "Europe"],
    structure: "Open-End",
    strategyUrl: "https://kseries.kkr.com/infrastructure",
  }),
  // Source: https://www.kkr.com/invest/infrastructure | https://pitchbook.com/profiles/fund/24809-95F
  f("FUND-137", "KKR", "Global Climate Transition Fund", "2023", "$7.0B", 7000, "Value-Add", "Deploying", {
    description: "Climate-focused fund investing in renewable energy, energy storage, grid modernization, and clean transportation infrastructure across global markets.",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Transportation"],
    regions: ["Global"],
    strategyUrl: "https://media.kkr.com/rss-feed/news-release?news_id=2cbf963d-a998-46fc-bcc7-fe1f3cce97a9",
  }),
  // Source: https://www.kkr.com/invest/infrastructure | https://pitchbook.com/profiles/fund/25504-39F
  f("FUND-138", "KKR", "Asia Climate Fund", "2024", "$1.0B", 1000, "Value-Add", "Deploying", {
    description: "Asia-focused climate fund investing in renewable energy, clean transportation, and energy transition infrastructure across emerging and developed Asian markets.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Power Generation"],
    regions: ["Asia-Pacific"],
    strategyUrl: "https://esgnews.com/kkr-commits-335-million-to-cleanpeak-energy-in-first-asia-pacific-climate-investment",
  }),
  // Source: https://kseries.kkr.com/kif/ | https://kseries.kkr.com/kif/information/
  f("FUND-139", "KKR", "KKR Infrastructure Fund (K-INFRA)", "2023", "Undisclosed", null, "Core-Plus", "Evergreen", {
    description: "Semi-liquid evergreen fund providing private wealth clients access to KKR's core-plus infrastructure strategy across diversified essential services globally.",
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
    strategies: ["Core-Plus", "Retail Act '40"],
    strategyUrl: "https://kseries.kkr.com/kif",
  }),

  // Macquarie Asset Management
  // Source: https://www.macquarie.com/ch/en/about/news/2024/macquarie-european-infrastructure-fund-7-reaches-8-billion-of-investor-commitments.html | https://pitchbook.com/profiles/fund/20670-58F
  f("FUND-140", "Macquarie Asset Management", "Macquarie European Infrastructure Fund 7 (MEIF 7)", "2024", "€8.0B", 8800, "Core-Plus", "Deploying", {
    description: "Flagship European fund investing in mid-market infrastructure across utilities, transportation, digital, and renewable energy with active asset management.",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Europe"],
    strategyUrl: "https://www.macquarie.com/ch/en/about/news/2024/macquarie-european-infrastructure-fund-7-reaches-8-billion-of-investor-commitments.html",
  }),
  // Source: https://www.macquarie.com/us/en/about/news/2025/macquarie-asset-management-closes-macquarie-infrastructure-partners-vi.html | https://pitchbook.com/profiles/fund/20810-53F
  f("FUND-141", "Macquarie Asset Management", "Macquarie Infrastructure Partners VI (MIP VI)", "2024", "$6.8B", 6800, "Core-Plus", "Deploying", {
    description: "Americas-focused fund investing in essential infrastructure including utilities, transportation, digital, and environmental services with active operational improvement.\nPortfolio:\nCommunications: 2degrees (Telecoms), Altafiber (Cincinnati Bell) (Fiber & Broadband), Bersama Digital Infrastructure (Towers), Diamond Infrastructure Solutions (Towers), Hawaiian Telcom (Fiber & Broadband), KCOM (Fiber & Broadband), PhilTower (Towers)\nDigital Infrastructure: Aligned Data Centers (Data Centers), Applied Digital (Data Centers), CloudExtel (Data Centers), Hanam Data Center (Data Centers), KevlinX (Data Centers), Mereo Networks (Fiber Networks), Onivia (Fiber Networks), Open Fiber (Fiber Networks), Prime Data Centers (Data Centers), SwyftFiber (Fiber Networks), TDC NET (Fiber & Broadband), VIRTUS Data Centres (Data Centers), Vocus Group (Fiber & Data Centers), Voneus (Fiber Networks)\nMidstream / Energy: HES International (Bulk Terminals)\nRenewables / Energy Transition: Arcadia Power (Clean Energy Platform), Aula Energy (Solar), Blueleaf Energy (Solar), Broadhelm Renewables (Wind), Calibrant Energy (Distributed Energy), Cero Generation (Solar), Corio Generation (Offshore Wind), Cyrq Energy (Geothermal), DESRI (Solar & Storage), Eku Energy (Battery Storage), Five Estuaries (Offshore Wind), Green Investment Group (GIG) (Platform), Gwynt y Môr (Offshore Wind), Island Green Power (Solar), Linea Energy (Wind), Lynn and Inner Dowsing (Offshore Wind), Outer Dowsing (Offshore Wind), Reden Solar (Solar), Rhyl Flats (Offshore Wind), Sheringham Shoal (Offshore Wind), SkyNRG (Sustainable Aviation Fuel), Treaty Oak Clean Energy (Wind & Solar), Ventos de São Zacarias (Wind), Verkor (Battery Manufacturing), Vertelo (EV Charging)\nTransportation: Ashoka Concessions (Toll Roads), Autoroutes Paris-Rhin-Rhône (APRR) (Toll Roads), Best in Parking (Parking), Birmingham Airport (Airports), Bristol Airport (Airports), Ceres Terminals (Ports), Farnborough Airport (Airports), Hobart Airport (Airports), London City Airport (Airports), Long Beach Container Terminal (Ports), Macquarie AirFinance (Aircraft Leasing), Maher Terminals (Ports), Montreal Metropolitan Airport (Airports), Perth Airport (Airports), Reef (Parking & Mobility), Roadchef (Motorway Services), Roadis (Toll Roads), TraPac Terminals (Ports), Warnow Tunnel (Toll Roads)\nUtilities: Cadent Gas (Gas Distribution), CEZ Group Romania (Electric & Gas), Cleco Corporation (Electric Utilities), Energy Assets Group (Smart Metering), EP Infrastructure (Gas & Electric), Icosa Water (Last Mile Infra) (Water), National Gas Transmission (Gas Transmission), Open Grid Europe (Gas Transmission), Puget Sound Energy (Electric & Gas Utilities), Viesgo (Electric Distribution)\nWaste / Environmental Services: Beauparc (Waste Management), Biffa (Waste Management), Bingo Industries (Waste Management), Coastal Waste & Recycling (Waste Management)",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["North America"],
    strategyUrl: "https://www.macquarie.com/us/en/about/news/2025/macquarie-asset-management-closes-macquarie-infrastructure-partners-vi.html",
  }),
  // Source: https://www.infrastructureinvestor.com/macquarie-launches-latest-americas-infra-fund-targeting-7bn-exclusive/ | No PitchBook or other cross-reference URL found yet — fund was just launched in late 2025.
  f("FUND-142", "Macquarie Asset Management", "Macquarie Infrastructure Partners VII (MIP VII)", "2025", "$7.0B", 7000, "Core-Plus", "Deploying", {
    description: "Successor Americas infrastructure fund continuing MIP's strategy of investing in essential mid-market infrastructure businesses with operational value creation.",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["North America"],
    strategyUrl: "https://www.infrastructureinvestor.com/macquarie-launches-latest-americas-infra-fund-targeting-7bn-exclusive",
  }),
  // Source: https://www.macquarie.com/au/en/about/news/2022/macquarie-asset-management-closes-third-asia-pacific-regional-infrastructure-fund-with-over-us4-2-billion-in-commitments.html | https://pitchbook.com/profiles/fund/18068-23F
  f("FUND-143", "Macquarie Asset Management", "Macquarie Asia-Pacific Infrastructure Fund 3 (MAIF 3)", "2022", "$4.2B", 4200, "Core-Plus", "Deploying", {
    description: "Asia-Pacific infrastructure fund targeting mid-market essential services in utilities, transportation, and digital infrastructure across developed and emerging Asia.",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Asia-Pacific"],
    strategyUrl: "https://www.macquarie.com/au/en/about/news/2022/macquarie-asset-management-closes-third-asia-pacific-regional-infrastructure-fund-with-over-us4-2-billion-in-commitments.html",
  }),
  // Source: https://www.macquarie.com/us/en/about/company/macquarie-asset-management/institutional-investor/insights/pathways/asia-pacific-infrastructure.html | https://pitchbook.com/profiles/fund/24557-77F
  f("FUND-144", "Macquarie Asset Management", "Macquarie Asia-Pacific Infrastructure Fund 4 (MAIF 4)", "2024", "Undisclosed", null, "Core-Plus", "Deploying", {
    description: "Successor Asia-Pacific fund continuing MAIF's strategy across essential infrastructure in utilities, transport, digital, and energy transition in the region.",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Asia-Pacific"],
    strategyUrl: "https://www.macquarie.com/us/en/about/company/macquarie-asset-management/institutional-investor/insights/pathways/asia-pacific-infrastructure.html",
  }),
  // Source: https://www.macquarie.com/us/en/about/news/2022/fundraising-for-macquarie-super-core-infrastructure-strategy-reaches-12-6-billion-euros.html | https://pitchbook.com/profiles/fund/16129-90F
  f("FUND-145", "Macquarie Asset Management", "Macquarie Super Core Infrastructure Fund (MSCIF)", "2018", "€12.6B", 13860, "Core", "Evergreen", {
    description: "Open-end super-core fund investing in the highest-quality regulated and contracted infrastructure in Europe, targeting utilities, transport, and renewables with utility-like returns.",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Open-End",
    strategyUrl: "https://www.macquarie.com/us/en/about/news/2022/fundraising-for-macquarie-super-core-infrastructure-strategy-reaches-12-6-billion-euros.html",
  }),
  // Source: https://www.macquarie.com/us/en/about/news/2024/macquarie-green-energy-and-climate-opportunities-fund-acquires-portfolio-of-six-investments.html (referenced in DESRI investment announcement) | https://pitchbook.com/profiles/fund/14138-83F
  f("FUND-146", "Macquarie Asset Management", "Macquarie Global Infrastructure Fund (MGIF)", "2021", "$3.0B", 3000, "Core", "Evergreen", {
    description: "Open-end global core infrastructure fund for institutional investors, targeting regulated and contracted essential infrastructure assets worldwide.",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.macquarie.com/us/en/about/company/macquarie-asset-management/general-public/capabilities/Infrastructure.html",
  }),
  // Source: https://www.macquarie.com/us/en/about/news/2025/macquarie-asset-management-reaches-us3-billion-close-of-green-energy-transition-solutions-fund-and-co-investment-commitment.html | https://pitchbook.com/profiles/fund/25578-37F (if available for MGETS)
  f("FUND-147", "Macquarie Asset Management", "Macquarie Green Energy Transition Solutions (MGETS)", "2022", "$2.4B", 2400, "Value-Add", "Deploying", {
    description: "Dedicated green energy fund investing in renewable energy development, battery storage, and grid-scale clean energy projects globally with greenfield capabilities.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://www.macquarie.com/us/en/about/news/2025/macquarie-asset-management-reaches-us3-billion-close-of-green-energy-transition-solutions-fund-and-co-investment-commitment.html",
  }),
  // Source: https://www.macquarie.com/us/en/about/news/2024/macquarie-green-energy-and-climate-opportunities-fund-acquires-portfolio-of-six-investments.html | https://pitchbook.com/profiles/fund/25578-37F
  f("FUND-148", "Macquarie Asset Management", "Macquarie Green Energy and Climate Opportunities Fund", "2024", "Undisclosed", null, "Core-Plus", "Evergreen", {
    description: "Open-end fund investing in operational renewable energy and climate infrastructure assets providing stable income with positive environmental impact.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.macquarie.com/us/en/about/news/2024/macquarie-green-energy-and-climate-opportunities-fund-acquires-portfolio-of-six-investments.html",
  }),
  // Source: https://www.macquarie.com/au/en/about/company/macquarie-asset-management/financial-advisor/investments/managed-funds-and-active-etfs/unlisted-infrastructure/macquarie-private-infrastructure-fund.html | No independent cross-reference found — fund AUM was not independently verified.
  f("FUND-149", "Macquarie Asset Management", "Macquarie Private Infrastructure Fund (MPIF)", "2021", "$897.1M", 897, "Core-Plus", "Evergreen", {
    description: "Semi-liquid infrastructure fund providing wealth management clients access to Macquarie's core-plus infrastructure strategy across global essential services.",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.macquarie.com/au/en/about/company/macquarie-asset-management/financial-advisor/investments/managed-funds-and-active-etfs/unlisted-infrastructure/macquarie-private-infrastructure-fund.html",
  }),
  // Source: https://www.macquarie.com/au/en/about/company/macquarie-asset-management/macquarie-energy-transition-infrastructure-fund.html | https://pitchbook.com/profiles/fund/28207-63F
  f("FUND-150", "Macquarie Asset Management", "Macquarie Energy Transition Infrastructure Fund (METI)", "2024", "$1.0B", 1000, "Value-Add", "Deploying", {
    description: "Energy transition fund targeting renewable energy, storage, and grid infrastructure investments supporting decarbonization across developed markets.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.macquarie.com/au/en/about/company/macquarie-asset-management/macquarie-energy-transition-infrastructure-fund.html",
  }),

  // MEAG
  // Source: https://www.meag.com/de/investieren/institutionelle-kunden/meio.html | https://www.hal-privatbank.com/asset-servicing/fondsportal/detail/meag-european-infrastructure-one-scsp-sicav-raif-class-a-lu2506068852
  f("FUND-151", "MEAG", "MEAG European Infrastructure One SCSp (MEIO)", "2022", "€600M", 660, "Core-Plus", "Deploying", {
    description: "Munich Re's asset manager investing in mid-market European infrastructure across energy, transportation, and digital sectors with focus on inflation-linked returns.\nPortfolio:\nCommunications: Austrian TowerCo (Cellnex Austria) (Towers), GD Towers (Towers), TowerPoint Infrastructure Partners (Towers)\nDigital Infrastructure: Live Oak Fiber (Fiber Networks), Vantage Data Centers EMEA (Data Centers)\nPower Generation: Astoria Energy I and II (Gas-to-Power)\nRenewables / Energy Transition: Höxter Battery Park (Battery Storage), Longroad Energy Holdings (Wind & Solar), Maverick 6 Solar-plus-Storage (Solar & Storage), Maverick 7 Solar Project (Solar), Metelen Battery Park (Battery Storage), Stor-Skälsjön Wind Farm (Onshore Wind)\nSocial Infrastructure: Parmaco (Modular Buildings)\nTransportation: Barcelona Metro Line 9 (Metro), Cross London Trains Limited (Rolling Stock), Indigo Group (Parking), Interpark (Parking), Siemens Mireo (Elektronetz Nord-Magdeburg) (Rolling Stock), Stadler FLIRT Akku (Mittelthüringesches Akkunetz) (Rolling Stock)\nUtilities: Proxiserve (Energy Services), SouthWest Water Company (Water & Wastewater)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Digital Infrastructure"],
    regions: ["Europe"],
    strategyUrl: "https://www.meag.com/de/investieren/institutionelle-kunden/meio.html",
  }),
  // Source: https://www.meag.com/en/inform/34340.html | https://www.linklaters.com/en/about-us/news-and-deals/deals/2025/december/linklaters-advises-meag-on-the-launch-of-a-european-data-centre-fund
  f("FUND-152", "MEAG", "MEAG Volante DC Investor SCSp", "2025", "Undisclosed", null, "Core-Plus", "Deploying", {
    description: "Dedicated data center fund investing in hyperscale and colocation data center infrastructure across European markets to meet growing AI and cloud demand.",
    sectors: ["Digital Infrastructure"],
    regions: ["Europe"],
    strategies: ["Core-Plus", "Greenfield"],
    strategyUrl: "https://www.meag.com/en/inform/34340.html",
  }),

  // Meridiam
  // Source: https://www.meridiam.com/news/meridiam-successfully-raises-over-6-billion-e5-billion-of-new-capital-to-fuel-future-sustainable-and-impact-investments/ | https://pitchbook.com/profiles/fund/18503-20F
  f("FUND-153", "Meridiam", "Meridiam Sustainable Infrastructure Europe IV", "2021", "€2.3B", 2530, "Value-Add", "Deploying", {
    description: "Long-term European infrastructure fund investing in greenfield and brownfield projects across transportation, energy transition, and social infrastructure over 25-year holding periods.",
    sectors: ["Transportation", "Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://www.meridiam.com/news/meridiam-successfully-raises-over-6-billion-e5-billion-of-new-capital-to-fuel-future-sustainable-and-impact-investments",
  }),
  // Source: https://www.meridiam.com/news/meridiam-successfully-closes-mina-iv-its-flagship-north-america-infrastructure-fund-raising-more-than-1-8-billion/ | https://pitchbook.com/profiles/fund/24122-98F
  f("FUND-154", "Meridiam", "Meridiam Infrastructure North America IV", "2023", "$1.8B", 1800, "Value-Add", "Deploying", {
    description: "North American fund targeting long-term infrastructure development including renewable energy, transportation, and social infrastructure with public-private partnership expertise.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://www.meridiam.com/news/meridiam-successfully-closes-mina-iv-its-flagship-north-america-infrastructure-fund-raising-more-than-1-8-billion",
  }),
  // Source: https://www.meridiam.com/our-impact/investment-approach/ | https://www.infrastructureinvestor.com/meridiam-eyes-up-to-e3bn-for-latest-european-fund-exclusive/
  f("FUND-155", "Meridiam", "Meridiam Sustainable Infrastructure Europe V", "2025", "€3.0B", 3300, "Value-Add", "Raising", {
    description: "Successor European fund continuing Meridiam's long-term sustainable infrastructure strategy in transport, energy, and social infrastructure with ESG-first approach.",
    sectors: ["Transportation", "Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://www.eib.org/en/projects/pipelines/all/20260008",
  }),
  // Source: https://www.meridiam.com/our-impact/investment-approach/ | https://www.infrastructureinvestor.com/meridiam-eyes-up-to-e3bn-for-latest-european-fund-exclusive/
  f("FUND-156", "Meridiam", "Meridiam Infrastructure Agri Transition", "2025", "€100M", 110, "Value-Add", "Raising", {
    description: "Maiden agricultural transition fund investing in sustainable agriculture and food system infrastructure in Europe, supporting the ecological transition through biogas, regenerative farming, and food value chain projects.\nPortfolio:\nDigital Infrastructure: Raxio Data Centre (Data Centers)\nRenewables / Energy Transition: Agrimaine Biogas Cogeneration (Biogas), Biokala Biomass (Biomass), BTE Renewables (Kipeto & Siruai) (Wind), Evergaz / BMP (Biogas), IWell / Iwell (Battery Storage), Kael (Solar), Kahone (Solar), Kinguele Aval Hydroelectric Plant (Hydropower), Mayenne Biogas Plant (Biogas), Rift Valley Energy (Geothermal), Senergy (Solar), Suez Wind Energy (Wind), Ten Merina (Solar), Wagabox Biogas (Biogas)\nSocial Infrastructure: Acciona Hospitals & Roads Portfolio (Healthcare & Roads), Barcelona Law School Extension (Education), Bursa Hospital (Healthcare), CRCHUM (Healthcare), Espoo Schools (Education), Felix Bulnes Hospital (Healthcare), Fulcrum LIFT (Healthcare), Long Beach Courthouse (Civic), Rennes Hospital (Healthcare), Saint-Quentin-en-Yvelines Velodrome (Sports), Treichville University Hospital (Healthcare), University of Hertfordshire (Education), Welsh Education Partnership (Education)\nTransportation: A2 Motorway (Toll Roads), A5 Highway (Austria) (Toll Roads), A5 Motorway (Germany) (Toll Roads), A66 Highway (Spain) (Toll Roads), A7 Highway South (Germany) (Toll Roads), Allego (EV Charging), Ausol Highway I & II (Toll Roads), Conrac Solutions (Airport Services), D4 Highway (Toll Roads), Florence Tramway (Light Rail), Isle of Wight Roads (Roads), L2 Project Marseille (Roads), LaGuardia Terminal B (Airports), Limerick Tunnel (Tunnels), M8 Highway (Toll Roads), Miami Monorail (Light Rail), Nairobi-Nakuru Highway (Toll Roads), Nîmes-Montpellier Bypass (CNM) (Rail), Norscut Highway (Toll Roads), North Tarrant Express Highway (Toll Roads), Nottingham Tramway (Light Rail), Nouakchott Port (Ports), Ouagadougou Donsin Airport (Airports), Port of Miami Tunnel (Tunnels), Presidio Parkway (Toll Roads), Purple Line Light Rail (Light Rail), Queen Alia International Airport (Airports), R1 Motorway (Toll Roads), Reno-Tahoe Airport Conrac (Airport Services), SETRAG (Rail), Société Autoroutière du Gabon (Toll Roads), Sofia Airport (Airports), SR400 Express Lanes (Toll Roads), Tours-Bordeaux High Speed Rail (Lisea) (Rail), Transgabonaise Road (Roads)\nUtilities: Aqaba Water Desalination (Water Desalination), Great Sea Interconnector (Electricity Interconnector), SUEZ (Water & Waste), University of Iowa Utilities (District Energy)\nWaste / Environmental Services: Gipuzkoa Waste to Energy Plant (Waste-to-Energy), Olstyn WTE Project (Waste-to-Energy)",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://www.meridiam.com/our-impact/investment-approach",
  }),
  // Source: https://www.meridiam.com/news/meridiam-successfully-raises-over-6-billion-e5-billion-of-new-capital-to-fuel-future-sustainable-and-impact-investments/ | https://www.proparco.fr/en/carte-des-projets/miaf-ii
  f("FUND-157", "Meridiam", "Meridiam Infrastructure Africa Fund II (MIAF II)", "2021", "€750M", 825, "Value-Add", "Deploying", {
    description: "Africa-focused fund investing in essential infrastructure development including renewable energy, transportation, water, and social infrastructure across Sub-Saharan Africa.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Water", "Social Infrastructure"],
    regions: ["Middle East & Africa"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://www.bii.co.uk/en/our-impact/fund/meridiam-infrastructure-africa-parallel-fund-ii-slp-miapf-ii",
  }),
  // Source: https://www.meridiam.com/assets/sustainable-and-resilient-cities-of-tomorrow/ | https://www.eib.org/en/projects/all/20200085
  f("FUND-158", "Meridiam", "The Urban Resilience Fund (TURF)", "2021", "€350M", 385, "Value-Add", "Deploying", {
    description: "Impact fund investing in climate-resilient urban infrastructure in developing cities, targeting water systems, flood protection, waste management, and green mobility.",
    sectors: ["Water", "Waste / Environmental Services", "Transportation", "Social Infrastructure"],
    regions: ["Middle East & Africa", "Asia-Pacific", "Latin America"],
    strategyUrl: "https://www.meridiam.com/assets/sustainable-and-resilient-cities-of-tomorrow",
  }),

  // Mirova
  // Source: https://www.mirova.com/en/news/Mirova-targets-2-billion-its-sixth-strategy-dedicated-energy-transition-infrastructure | https://www.mirova.com/en/news/met6-reaches-over-one-billion-second-close
  f("FUND-159", "Mirova", "Mirova Energy Transition 6 (MET6)", "2023", "€2.0B", 2200, "Value-Add", "Deploying", {
    description: "European renewable energy fund investing in onshore wind, solar PV, and battery storage projects across Europe with greenfield development and construction capabilities.\nPortfolio:\nDigital Infrastructure: Axione (Fiber Networks)\nRenewables / Energy Transition: Arkolia Energies (Solar), Baltic Storage Platform (BSP) (Battery Storage), Bright (Solar), Corsica Sole (Solar & Storage), d.light (Off-Grid Solar), Dexter Energy (Energy Trading), ecoligo (Solar), Italian Renewable Platform s.r.l. (Solar & Wind), JUWI Greek PV Portfolio (Clover) (Solar), Mahon Solar PV and Storage (Solar & Storage), Revfin (EV Finance), Solveo Energies (Solar), Sunly (Wind & Solar), Swedish Onshore Wind Parks (Fågelås, Dållebo, Boarp) (Onshore Wind)\nSocial Infrastructure: Aton per il Progetto (Healthcare), Gran Hospital Can Misses (Healthcare), Son Espases Hospital (Healthcare), Veneta Sanitaria Finanza di Progetto S.p.A. (Healthcare)\nTransportation: ARC Ride (Electric Mobility), Driveco (EV Charging), GreenWay Holding (EV Charging), Indigo Group (Parking), Metro de Malaga (Metro), Neot e-motion (EV Charging), Via Expresso (Toll Roads), ViaLitoral (Toll Roads), Zunder (EV Charging)\nUtilities: Loiste (Electric Utilities), Oslofjord Varme / Hafslund Oslo Celsio (District Heating), Proxiserve (Energy Services)",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://www.mirova.com/en/news/Mirova-targets-2-billion-its-sixth-strategy-dedicated-energy-transition-infrastructure",
  }),

  // Morgan Stanley Infrastructure
  // Source: https://www.morganstanley.com/press-releases/msim-closes-fourth-global-infrastructure-fund | https://www.morganstanley.com/im/en-us/individual-investor/about-us/newsroom/press-release/msim-closes-fourth-global-ingrastructure-fund-at-4B.html
  f("FUND-160", "Morgan Stanley Infrastructure", "North Haven Infrastructure Partners IV", "2022", "$4.1B", 4100, "Value-Add", "Deploying", {
    description: "Value-add fund targeting mid-market essential infrastructure in energy, transportation, utilities, and environmental services across North America and Western Europe.\nPortfolio:\nDigital Infrastructure: FastFiber (Fiber Networks), Flexential (Data Centers), Lightpath (Fiber Networks), Rapidue Technologies (Smart City), Tele Columbus AG (Fiber & Cable), UltraEdge (Edge Infrastructure)\nMidstream / Energy: Brazos Midstream (Gathering & Processing), Portland Natural Gas Transmission System (Pipelines)\nPower Generation: Bayonne Energy Center (Gas-to-Power)\nRenewables / Energy Transition: Crowley Wind (Onshore Wind), PNE (Wind & Solar), Suminter India Organics (Sustainable Agriculture), Torch Clean Energy (Wind & Solar)\nSocial Infrastructure: Athulya Assisted Living (Senior Care), HealthMap Diagnostics (Healthcare), SpecialtyCare (Healthcare)\nTransportation: Magenta EV Solutions (EV Charging), Onslow Iron Road Trust (Haul Roads), Salcef Group (Rail Services), StraitNZ (Ferries), The Pasha Group (Ports & Logistics)\nUtilities: Seven Seas Water (Water Desalination), Valoriza (Water & Waste)\nWaste / Environmental Services: Augean (Hazardous Waste)",
    sectors: ["Power Generation", "Transportation", "Utilities", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.morganstanley.com/press-releases/msim-closes-fourth-global-infrastructure-fund",
  }),

  // Northleaf Capital Partners
  // Source: https://www.northleafcapital.com/news/northleaf-hits-hard-cap-final-close-its-us26-billion-infrastructure-fund | https://www.kirkland.com/news/press-release/2025/05/kirkland-represents-northleaf-capital-partners-on-infrastructure-fund
  f("FUND-161", "Northleaf Capital Partners", "Northleaf Infrastructure Capital Partners IV (NICP IV)", "2023", "$2.6B", 2600, "Core-Plus", "Deploying", {
    description: "Mid-market infrastructure fund targeting essential services in utilities, transportation, digital infrastructure, and renewables across North America and Western Europe.",
    sectors: ["Utilities", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.northleafcapital.com/news/northleaf-hits-hard-cap-final-close-its-us26-billion-infrastructure-fund",
  }),
  // Source: https://www.northleafcapital.com/infrastructure | https://www.kirkland.com/news/press-release/2021/11/kirkland-advises-northleaf-on-infra-fund
  f("FUND-162", "Northleaf Capital Partners", "Northleaf Essential Infrastructure Fund (NEIF)", "2021", "$800M", 800, "Core", "Evergreen", {
    description: "Open-end core fund investing in essential, contracted infrastructure assets with stable cash flows in utilities, transportation, and social infrastructure across North America.\nPortfolio:\nCommunications: Shared Tower (Towers)\nDigital Infrastructure: Quickline Communications (Fiber & Broadband), Tillman Fiber (Fiber Networks)\nMidstream / Energy: Douglas Terminals (Bulk Liquid Storage), Navigator Terminals (Bulk Liquid Storage), Odfjell Terminals (Chemical Storage), Quantem (Bulk Liquid Storage)\nRenewables / Energy Transition: AMAROK (Wind), Canadian Breaks (Wind), Cotton Plains Portfolio (Wind), Fortysouth (Wind), Lal Lal Wind Farms (Wind), Puna Geothermal Venture (Geothermal)\nSocial Infrastructure: Maple PPP Portfolio (PPP/PFI)\nTransportation: Combined Cargo Terminals (Ports), CSV (Maritime), EVPassport (EV Charging), Millennium Parking Garages (Parking), Pocahontas Parkway (Toll Roads), Thames Clippers (River Transport)\nUtilities: Provident Energy Management Inc. (Energy Management), WASH Multifamily Holdings Inc. (Laundry Services)",
    sectors: ["Utilities", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
    structure: "Open-End",
    strategyUrl: "https://www.northleafcapital.com/infrastructure",
  }),

  // NOVA Infrastructure
  // Source: https://www.novainfrastructure.com | https://pitchbook.com/profiles/fund/24080-95F
  f("FUND-163", "NOVA Infrastructure", "NOVA Infrastructure Fund II", "2024", "$1.0B", 1000, "Value-Add", "Deploying", {
    description: "Mid-market fund investing in essential North American infrastructure services businesses in power, utilities, environmental services, and transportation.\nPortfolio:\nCommunications: Xchange Telecom (Skywire) (Fixed Wireless)\nDigital Infrastructure: DartPoints (Edge Data Centers), telMAX Inc. (Fiber Networks)\nRenewables / Energy Transition: Nopetro Renewables / Nopetro Energy (RNG & CNG), UGE International (Community Solar)\nTransportation: A&R Bulk-Pak (Bulk Logistics), Ascension FBO Network (FBO / Aviation), Harbor Logistics (Port Logistics)",
    sectors: ["Power Generation", "Utilities", "Waste / Environmental Services", "Transportation"],
    regions: ["North America"],
    strategyUrl: "https://www.novainfrastructure.com/investments-index",
  }),

  // Nuveen Infrastructure
  // Source: https://www.glennmont.com/ | https://www.ijglobal.com/articles/184329/nuveen-closes-clean-energy-fund-at-19bn
  f("FUND-164", "Nuveen Infrastructure", "Nuveen Clean Energy Strategy IV", "2021", "€1.9B", 2090, "Value-Add", "Deploying", {
    description: "European clean energy fund investing in onshore wind, solar PV, and battery storage projects with greenfield development and operational capabilities.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://renews.biz/94693/nuveen-closes-fourth-clean-energy-strategy",
  }),
  // Source: https://www.glennmont.com/glennmont-and-mn-launch-e700m-evergreen-strategy-to-invest-in-renewable-energy/ | https://pitchbook.com/profiles/fund/22433-23F
  f("FUND-165", "Nuveen Infrastructure", "Nuveen European Core Renewable Infrastructure (NECRI)", "2022", "€700M", 770, "Core", "Evergreen", {
    description: "Open-end core fund investing in operational European renewable energy assets with contracted revenues, targeting onshore wind and solar farms.\nPortfolio:\nDigital Infrastructure: Arcadian Infracom 1, LLC (Fiber Networks), BNZ (Data Centers), CleanArc Data Centers (Data Centers), DataBank (Data Centers)\nRenewables / Energy Transition: American BESS 1 (Battery Storage), American Solar 1 (Solar), Dutch Wind 1 (Onshore Wind), Finnish BESS 1 (Ainola) (Battery Storage), German Wind 1, 2, 3, 4, 5 (Onshore Wind), Italian and Spanish Solar 1 (Solar), Italian BESS 1, 2 (Battery Storage), Italian Solar 1, 2, 3 (Solar), Italian Wind 1, 2, 3, 4 (Onshore Wind), South Korean Solar 1, 2, 3 (Solar), Southern European Solar 1, 2 (Solar), Spanish Solar 1, 2 (Solar), Spanish Wind 1, 2 (Onshore Wind), Sweden Wind 1 (Onshore Wind), Verdian Power (Wind)\nTransportation: I-595 Express, LLC (Toll Roads), Mersey Gateway Bridge (Toll Roads)",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Open-End",
    strategyUrl: "https://www.glennmont.com/glennmont-and-mn-launch-e700m-evergreen-strategy-to-invest-in-renewable-energy",
  }),

  // Oaktree Capital
  // Source: https://www.oaktreecapital.com/portfolio-companies/infrastructure-investing | https://pitchbook.com/profiles/fund/25587-01F
  f("FUND-166", "Oaktree Capital", "Oaktree Power Opportunities Fund VII", "2024", "$2.5B", 2500, "Value-Add", "Deploying", {
    description: "Value-add fund investing in companies providing essential products and services to electric power, natural gas, water, wastewater, and utility infrastructure in North America and Europe, capitalizing on decarbonization and electrification trends.",
    sectors: ["Utilities", "Power Generation", "Renewables / Energy Transition", "Water"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.oaktreecapital.com/portfolio-companies/infrastructure-investing",
  }),

  // Duration Capital Partners (spun out from Oaktree Capital, July 2024)
  // Source: https://durationcapitalpartners.com/ | https://www.infrastructureinvestor.com/oaktrees-transport-team-spins-out-to-become-duration-capital/
  f("FUND-167", "Duration Capital Partners", "Duration Transportation Infrastructure Capital Partners", "2017", "$1.1B", 1100, "Value-Add", "Deploying", {
    description: "Long-term transportation infrastructure fund spun out from Oaktree Capital in 2024, investing in essential businesses serving the aviation, ports, and railroad sectors across North America with a focus on operational excellence.",
    sectors: ["Transportation", "Logistics"],
    regions: ["North America"],
    strategyUrl: "https://www.prnewswire.com/news-releases/duration-capital-partners-completes-spin-out-from-oaktree-as-an-industry-leading-long-term-transportation-infrastructure-investment-platform-302193139.html",
  }),
  // Source: https://durationcapitalpartners.com/ | https://www.infrastructureinvestor.com/oaktrees-transport-team-spins-out-to-become-duration-capital/
  f("FUND-235", "Duration Capital Partners", "Duration Transportation Infrastructure Capital Partners Fund II", "2022", "$3.0B", 3000, "Core-Plus", "Deploying", {
    description: "Successor transportation infrastructure fund continuing Duration's strategy of investing in essential aviation, ports, and railroad businesses across North America, transferred during the 2024 spin-out from Oaktree Capital.",
    sectors: ["Transportation", "Logistics"],
    regions: ["North America"],
    strategyUrl: "https://www.prnewswire.com/news-releases/duration-capital-partners-completes-spin-out-from-oaktree-as-an-industry-leading-long-term-transportation-infrastructure-investment-platform-302193139.html",
  }),

  // Partners Group
  // Source: https://www.partnersgroup.com/en/our-investments/infrastructure | https://pitchbook.com/profiles/fund/24207-85F
  f("FUND-168", "Partners Group", "Partners Group Direct Infrastructure IV", "2023", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Global direct infrastructure fund investing in mid-market essential infrastructure businesses across energy, transportation, digital, and utilities with platform building.\nPortfolio:\nDigital Infrastructure: EdgeCore Digital Infrastructure (Data Centers), Eolo (Fixed Wireless / Fiber), GreenSquareDC (Data Centers), Unity Digital Infrastructure (Data Centers)\nRenewables / Energy Transition: Budderfly (Energy Efficiency), Dimension Renewable Energy (Community Solar), Esentia Energy Development (Wind & Solar), Exus Renewables North America (Wind & Solar), Life Cycle Power (Battery Storage), PowerTransitions (Solar), Sunsure Energy (Solar)\nTransportation: Milestone Equipment Holdings (Transportation Equipment Leasing)\nUtilities: Gren (District Heating), USIC (United States Infrastructure Corp) (Utility Locating)",
    sectors: ["Power Generation", "Transportation", "Digital Infrastructure", "Utilities"],
    regions: ["Global"],
    strategyUrl: "https://www.partnersgroup.com/en/our-investments/infrastructure",
  }),
  // Source: https://www.partnersgroup.com/en/news-and-views/press-releases/corporate-news/detail?news_id=35550643-444b-49c8-9f72-1502c2e822a6 | https://pitchbook.com/profiles/fund/25454-35F
  f("FUND-169", "Partners Group", "Partners Group Next Generation Infrastructure Programs", "2019", "$1.0B", 1000, "Core-Plus", "Evergreen", {
    description: "Evergreen fund targeting next-generation infrastructure themes including digital infrastructure, energy transition, and sustainable transportation globally.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation"],
    regions: ["Global"],
    strategyUrl: "https://www.partnersgroup.com/en/news-and-views/press-releases/corporate-news/detail?news_id=35550643-444b-49c8-9f72-1502c2e822a6",
  }),

  // Patria Investments
  // Source: https://www.patria.com/infraestructure/ | https://www.aiib.org/en/projects/details/2024/approved/Multicountry-Patria-Infrastructure-Fund-V.html
  f("FUND-170", "Patria Investments", "Patria Infrastructure Fund V", "2023", "$2.9B", 2900, "Value-Add", "Deploying", {
    description: "Largest infrastructure fund in Latin America, investing across toll roads, data centers, water desalination, renewable energy, and electric mobility in Brazil, Colombia, and Chile.\nPortfolio:\nCommunications: Winity Telecom (Towers)\nDigital Infrastructure: Omnia (Data Centers)\nRenewables / Energy Transition: Atlas Renewable Energy (Solar & Wind), Essentia Energia (Solar & Wind)\nTransportation: Concesión Pacífico Tres (Toll Roads), Eixo SP (Toll Roads), Entrevias (Toll Roads), Malla Vial del Valle (Rutas del Valle) (Toll Roads), Puerta de Oro (Toll Roads), Santa-Mocoa-Neiva (Ruta al Sur) (Toll Roads), Via Araucária (Toll Roads)",
    sectors: ["Transportation", "Digital Infrastructure", "Water", "Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Latin America"],
    strategyUrl: "https://www.patria.com/infraestructure",
  }),
  // Source: https://www.pier11.com.br/o-fundo/historico-do-fundo/ | https://ir.patria.com/news-releases/news-release-details/patria-announces-closing-its-first-core-infrastructure-fund/
  f("FUND-171", "Patria Investments", "Patria Infrastructure Core Fund (PIER)", "2021", "~$1.0B", 1000, "Core", "Evergreen", {
    description: "Brazilian-listed core infrastructure fund on B3, focused on yield-generating operational power generation and transmission assets in Brazil with long-term contracted revenues.",
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["Latin America"],
    structure: "Listed / Evergreen",
    ticker: "PIER11",
    strategyUrl: "https://www.pier11.com.br/o-fundo/historico-do-fundo",
  }),

  // Patrizia
  // Source: https://www.patrizia.ag/en/investments/real-estate/infrastructure | https://pitchbook.com/profiles/fund/24374-71F
  f("FUND-172", "Patrizia", "Patrizia European Infrastructure Fund III", "2023", "€1.5B", 1650, "Core-Plus", "Raising", {
    description: "European core-plus infrastructure fund targeting mid-cap investments in energy transition, digital infrastructure, social infrastructure, green mobility, and environmental services.\nPortfolio:\nDigital Infrastructure: Atlantico (Subsea Cable), Connexin (Fiber & IoT), SiFi Networks (FiberCity) (Fiber Networks)\nMidstream / Energy: Vopak Terminal Eemshaven (LNG & Chemicals)\nRenewables / Energy Transition: Biomet (Biogas), Buskowitz Energy (Solar), SAREN Energy (Solar), Sustainable Energy Infrastructure (SEI) (Solar & Wind)\nSocial Infrastructure: Kinland (Senior Living)\nTransportation: Parkwise (Parking)\nUtilities: Ecotermica Servizi (District Heating), Kaer (District Cooling), Kvitebjørn Varme (District Heating), Ottima (Energy Services), Selettra (Energy Services), YES Group (Energy Services)\nWaste / Environmental Services: Greenthesis (Waste Management)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure", "Transportation", "Waste / Environmental Services"],
    regions: ["Europe"],
    strategyUrl: "https://www.patrizia.ag/en/investments/real-estate/infrastructure",
  }),
  // Source: https://www.patrizia.ag/en/news-detail/patrizia-and-mitsui-launch-new-flagship-strategy-for-sustainable-infrastructure-investments-in-apac-after-achieving-first-close-of-usd-110-million/ | https://www.patrizia.ag/en/news-detail/patrizia-closes-debut-investment-for-a-sif-with-initial-aud-70-million-australian-renewables-deal/
  f("FUND-173", "Patrizia", "APAC Sustainable Infrastructure Fund (A-SIF)", "2022", "$130M", 130, "Value-Add", "Deploying", {
    description: "PATRIZIA and Mitsui's flagship strategy for sustainable mid-market infrastructure in developed Asia-Pacific markets, targeting energy, digital, social, and mobility assets.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure", "Transportation"],
    regions: ["Asia-Pacific"],
    strategyUrl: "https://www.patrizia.ag/en/news-detail/patrizia-and-mitsui-launch-new-flagship-strategy-for-sustainable-infrastructure-investments-in-apac-after-achieving-first-close-of-usd-110-million",
  }),
  // Source: https://www.eib.org/en/projects/all/20240940 | https://www.infrastructureinvestor.com/patrizia-and-mitsui-pivot-to-emerging-asia-with-300m-climate-fund-exclusive/
  f("FUND-174", "Patrizia", "Emerging Asia Sustainable Infrastructure Fund (ESIF)", "2025", "$300M", 300, "Value-Add", "Deploying", {
    description: "Climate-focused fund targeting greenfield sustainable infrastructure in emerging Asian markets including Malaysia, Philippines, Thailand, Vietnam, Indonesia, and India, with EIB as cornerstone investor.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure"],
    regions: ["Asia-Pacific"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://www.eib.org/en/projects/all/20240940",
  }),
  // Source: https://eltif.patrizia.ag/en/ | https://www.patrizia.ag/en/news-detail/patrizia-and-universal-investment-tap-into-surging-demand-for-infrastructure-with-launch-of-first-eltif
  f("FUND-175", "Patrizia", "PATRIZIA Infrastructure Invest ELTIF", "2024", "Undisclosed", null, "Core-Plus", "Evergreen", {
    description: "First European Long-Term Investment Fund targeting private and professional investors, investing in infrastructure equity and debt across digital, energy transition, urban mobility, and social infrastructure.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["Europe", "Global"],
    strategyUrl: "https://www.patrizia.ag/en/news-detail/patrizia-and-universal-investment-tap-into-surging-demand-for-infrastructure-with-launch-of-first-eltif",
  }),
  // Source: https://www.fidante.com/eu/investment-managers/patrizia | https://citywire.com/funds-insider/fund/patrizia-low-carbon-core-infrastructure-fund-class-a-usd-inc/c592806
  f("FUND-176", "Patrizia", "PATRIZIA Low Carbon Core Infrastructure Fund", "2019", "Undisclosed", null, "Core", "Evergreen", {
    description: "Listed open-end fund investing in infrastructure and utility companies that can maintain earnings as economies transition to net zero, excluding companies with 10%+ fossil fuel revenue.",
    sectors: ["Utilities", "Water", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.fidante.com/eu/investment-managers/patrizia",
  }),

  // PSP Investments
  // Source: https://www.cgf-fcc.ca/en/ | https://www.investpsp.com/en/news/public-sector-pension-investment-board-announces-new-chief-investment-officer-and-new-president-and-chief-executive-officer-canada-growth-fund-investment-management/
  f("FUND-177", "PSP Investments", "Canada Growth Fund", "2023", "C$15.0B", 11100, "Value-Add", "Deploying", {
    description: "C$15B independent investment vehicle managed by PSP Investments, investing to unlock private capital for decarbonization, clean technology scale-up, and low-carbon supply chain development across Canada.\nPortfolio:\nCommunications: Radius Global Infrastructure (Ground Leases)\nDigital Infrastructure: Network FiberCo (Ziply Fiber) (Fiber Networks)\nRenewables / Energy Transition: Cubico Sustainable Investments (Wind & Solar), FirstLight Power (inc. Hydromega) (Hydropower), NeXtWind (Onshore Wind)\nTransportation: 407 ETR (Toll Roads), AGS Airports (Airports), Angel Trains (Rolling Stock), AviAlliance (Airports), Forth Ports (Ports), ROADIS (Toll Roads)\nUtilities: AEP Transmission Companies (Electricity Transmission), Spark Infrastructure (Electricity Distribution)",
    sectors: ["Renewables / Energy Transition", "Midstream / Energy", "Power Generation"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategies: ["Value-Add", "Growth"],
    strategyUrl: "https://www.newswire.ca/news-releases/canada-growth-fund-announces-first-investment-845337645.html",
  }),

  // QIC Global Infrastructure
  // Source: https://www.qic.com/Investment-Capabilities/Infrastructure | https://www.cefc.com.au/media/media-release/cefc-backs-new-qic-infrastructure-investment-to-accelerate-energy-transition/
  f("FUND-178", "QIC Global Infrastructure", "QIC Global Infrastructure Fund II (QGIF II)", "2023", "US$2.0B", 2000, "Core-Plus", "Deploying", {
    description: "Second flagship infrastructure equity fund with ~70% allocated to Australian energy transition investments including renewables, smart metering, and transport decarbonization.\nPortfolio:\nMidstream / Energy: Epic Energy (Pipelines), Lochard Energy (Gas Storage)\nPower Generation: Pacific Energy (Remote Power)\nRenewables / Energy Transition: Generate Capital (Diversified Clean Energy), Renewa (Wind & Solar), Tilt Renewables (Wind)\nSocial Infrastructure: Evolution Healthcare (Healthcare), Nexus Hospitals (Healthcare), Titles Queensland (Land Registry)\nTransportation: Brisbane Airport (Airports), Brussels Airport (Airports), ConnectEast Group (EastLink) (Toll Roads), Hobart International Airport (Airports), Northwestern Roads Group (Toll Roads), Port of Brisbane (Ports), Port of Melbourne (Ports), Sea Swift (Maritime Logistics)\nUtilities: Bluecurrent (Vector Metering) (Smart Metering), CenTrio (District Energy), Powerco (Electricity & Gas Distribution), Thames Water (Water & Wastewater)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities"],
    regions: ["Asia-Pacific", "Global"],
    strategyUrl: "https://www.cefc.com.au/media/media-release/cefc-backs-new-qic-infrastructure-investment-to-accelerate-energy-transition",
  }),
  // Source: https://www.qic.com/Investment-Capabilities/Infrastructure | https://en.wikipedia.org/wiki/Queensland_Investment_Corporation
  f("FUND-179", "QIC Global Infrastructure", "QIC Infrastructure Portfolio (QIP)", "2006", "Undisclosed", null, "Core", "Evergreen", {
    description: "Open-end core infrastructure portfolio for Australian institutional investors, targeting regulated and contracted essential infrastructure globally.\nPortfolio:\nDigital Infrastructure: American Tower Corporation Europe (ATC Europe) (Towers), Connexa (Towers), Terrion (Data Centers), Vertical Bridge (Towers)\nLogistics: QSL International (Supply Chain Services)\nMidstream / Energy: Southern Star Central Gas Pipeline (Gas Pipelines), Transportadora Associada de Gás S.A. (Gas Pipelines)\nPower Generation: Apraava Energy (Diversified Power), Sizewell C (Nuclear)\nRenewables / Energy Transition: Albioma SA (Biomass & Solar), Boralex (Wind & Solar), Edify Energy (Solar & Storage), Grand Changhua 1 (Offshore Wind), HY2GEN (Green Hydrogen), Innergex Renewable Energy (Hydro, Wind & Solar), Invenergy Renewables (Renewables Platform), London Array (Offshore Wind), Renewa (Wind & Solar), Shizen Energy (Solar & Wind), Velto Renewables (Q-Energy) (Solar & Wind)\nSocial Infrastructure: Colisée (Healthcare Facilities), Plenary Americas (PPP / P3)\nTransportation: Akiem (Rolling Stock Leasing), Cadence (Alto High-Speed Rail) (High-Speed Rail), DP World JV (UAE) (Ports), DP World Maspion East Java (Ports), Eurostar (High-Speed Rail), InTransit BC (Canada Line) (Rail Transit), Keolis (Public Transit), Port of Brisbane (Ports), Réseau express métropolitain (REM) (Automated Light Metro), Student Transportation of America (School Bus Services), Sydney Metro (Metro Rail), TramCité (Light Rail)\nUtilities: AES Indiana (Electric Utility), Énergir (Gas Distribution), TransGrid (Electricity Transmission)",
    sectors: ["Transportation", "Utilities", "Power Generation"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.qic.com/Investment-Capabilities/Infrastructure",
  }),
  // Source: https://www.qic.com/About-QIC/State-Investments/Queensland-Critical-Minerals-and-Battery-Technology-Fund | https://statements.qld.gov.au/statements/98057
  f("FUND-180", "QIC Global Infrastructure", "Queensland Critical Minerals and Battery Technology Fund", "2023", "A$100M", 66, "Value-Add", "Deploying", {
    description: "Queensland government fund providing venture/growth capital to businesses across the critical minerals and battery technology supply chain, from mining to advanced materials processing.",
    sectors: ["Midstream / Energy", "Renewables / Energy Transition"],
    regions: ["Asia-Pacific"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.qic.com/About-QIC/State-Investments/Queensland-Critical-Minerals-and-Battery-Technology-Fund",
  }),

  // Quinbrook Infrastructure
  // Source: https://www.quinbrook.com/news-insights/quinbrook-exceeds-target-for-net-zero-power-strategy-raising-usd-3-billion-in-capital-commitments/ | https://www.preqin.com/data/profile/fund-manager/quinbrook-infrastructure-partners/205386
  f("FUND-181", "Quinbrook Infrastructure", "Quinbrook Net Zero Power Fund", "2021", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "Dedicated net-zero power fund investing in renewable energy, battery storage, and grid-scale clean power generation projects across the US, UK, and Australia.\nPortfolio:\nDigital Infrastructure: Rowan Digital Infrastructure (Data Centers)\nPower Generation: Aegis Energy (Gas-to-Power), Velox Power (Gas-to-Power)\nRenewables / Energy Transition: Cape Byron Power (Biomass), Cleve Hill Solar + Storage (Solar & Storage), Elemental Clean Fuels (Renewable Fuels), Gemini Solar + Storage (Solar & Storage), GlidePath Power Solutions (Battery Storage), Habitat Energy (Battery Storage), Junction City Biomethane (RNG), Mallard Pass Solar Farm (Solar), Northern Quartz Campus (Materials / Silicon Production), Primergy Solar (Solar & Storage), PurposeEnergy (Biogas), Supernode (Battery Storage), Uskmouth (Biomass Conversion)\nUtilities: Synchronous Condensers Portfolio (Grid Stability)",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://www.quinbrook.com/news-insights/quinbrook-exceeds-target-for-net-zero-power-strategy-raising-usd-3-billion-in-capital-commitments",
  }),
  // Source: https://www.quinbrook.com/news-insights/quinbrook-oversubscribed-for-renewables-impact-fund/ | https://onlineservices.glasgow.gov.uk/councillorsandcommittees/viewSelectedDocument.asp?c=P62AFQDN8181UTDXT1
  f("FUND-182", "Quinbrook Infrastructure", "Quinbrook Renewables Impact Fund II", "2024", "£500M", 650, "Value-Add", "Raising", {
    description: "UK-focused impact fund investing in renewable energy, battery storage, and community energy projects with measurable environmental and social benefits.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe"],
    strategyUrl: "https://www.quinbrook.com/news-insights/quinbrook-oversubscribed-for-renewables-impact-fund",
  }),
  // Source: https://www.quinbrook.com/capabilities-sectors/critical-resources/ | https://www.quinbrook.com/capabilities-sectors/
  f("FUND-183", "Quinbrook Infrastructure", "Quinbrook Critical Resources Strategy", "2024", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Strategy targeting critical mineral and resource infrastructure supporting the energy transition, including battery materials, grid components, and supply chain infrastructure.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America", "Asia-Pacific"],
    strategyUrl: "https://www.quinbrook.com/capabilities-sectors/critical-resources",
  }),

  // Ridgewood Infrastructure
  // Source: https://ridgewoodinfrastructure.com/ridgewood-infrastructure-announced-1-2-billion-final-close-for-fund-ii-significantly-surpassing-its-target/ | https://pitchbook.com/profiles/fund/21962-26F
  f("FUND-184", "Ridgewood Infrastructure", "Ridgewood Water & Strategic Infrastructure Fund II", "2022", "US$1.2B", 1200, "Value-Add", "Deploying", {
    description: "Specialist water infrastructure fund investing in water and wastewater utilities, water treatment, and related essential infrastructure across North America.\nPortfolio:\nMidstream / Energy: The Dupuy Group (Storage)\nRenewables / Energy Transition: MN8 Energy (Solar)\nTransportation: APP Jet Center (FBO / Aviation), Carolina Marine Terminal (Ports), Nassau Marine Terminal (Ports), Sierra Railroad Company (Short-Line Rail), Valley Cold (Cold Storage)\nUtilities: Ecosave (Energy Services), Prospect Lake Clean Water Center (Water Treatment), Undine (Water & Wastewater)\nWaste / Environmental Services: Environmental Infrastructure Partners (Environmental Services), Waste Resource Management (WRM) (Waste Management)",
    sectors: ["Water", "Utilities"],
    regions: ["North America"],
    strategyUrl: "https://ridgewoodinfrastructure.com/ridgewood-infrastructure-announced-1-2-billion-final-close-for-fund-ii-significantly-surpassing-its-target",
  }),

  // Schroders Greencoat
  // Source: https://www.greencoat-ukwind.com/ | https://www.schroderscapital.com/en/global/professional/capabilities/infrastructure/schrodersgreencoat/uk-wind/
  f("FUND-185", "Schroders Greencoat", "Greencoat UK Wind PLC", "2013", "£3.5B+", 4550, "Core", "Evergreen", {
    description: "London-listed investment trust focused exclusively on operating UK onshore and offshore wind farms, providing yield-oriented returns from long-term power purchase agreements.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Listed / Evergreen",
    ticker: "UKW.L",
    strategyUrl: "https://www.schroderscapital.com/en/global/professional/capabilities/infrastructure/schrodersgreencoat/uk-wind",
  }),
  // Source: https://www.greencoat-renewables.com/ | https://www.schroderscapital.com/en/global/professional/capabilities/infrastructure/schrodersgreencoat/europe/
  f("FUND-186", "Schroders Greencoat", "Greencoat Renewables PLC", "2017", "€1.2B+", 1320, "Core", "Evergreen", {
    description: "Dublin and London-listed investment company investing in operating European wind and solar assets, with a focus on Ireland and continental Europe.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Listed / Evergreen",
    ticker: "GRN.IR",
    strategyUrl: "https://www.schroderscapital.com/en/global/professional/capabilities/infrastructure/schrodersgreencoat/europe",
  }),
  // Source: https://www.schroderscapital.com/en/global/professional/media-centre/schroders-greencoat-secures-170-million-commitment-from-environment-agency-pension-fund/ | https://www.preqin.com/data/profile/fund-manager/schroders-greencoat/107183
  f("FUND-187", "Schroders Greencoat", "Greencoat Renewable Income LP (GRI)", "2020", "£1.35B", 1755, "Core-Plus", "Deploying", {
    description: "Unlisted fund investing in a diversified portfolio of operational renewable energy assets across the UK and Europe including wind, solar, and biomass.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    strategyUrl: "https://www.schroderscapital.com/en/global/professional/media-centre/schroders-greencoat-secures-170-million-commitment-from-environment-agency-pension-fund",
  }),
  // Source: https://www.schroders.com/en-gb/uk/intermediary/funds-and-strategies/schroders-capital-semi-liquid-global-energy-infrastructure/ | https://docs.fundconnect.com/GetDocument.aspx?clientid=i1g0xyvk-ztaq-jdr2-cm3y-0sshe4ukztmc&Isin=LU2710740858&lang=en-GB&type=Semi-Annual+Report&save=False
  f("FUND-188", "Schroders Greencoat", "Schroders Capital Semi-Liquid Global Energy Infrastructure", "2023", "€2.5B+", 2750, "Core-Plus", "Evergreen", {
    description: "Semi-liquid open-end fund providing institutional and wealth investors access to global clean energy infrastructure including wind, solar, hydro, and biomass assets.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.schroders.com/en-gb/uk/intermediary/funds-and-strategies/schroders-capital-semi-liquid-global-energy-infrastructure",
  }),
  // Source: https://www.schroders.com/en-gb/uk/institutional/funds-and-strategies/renewables-plus/ | https://www.schroderscapital.com/en/global/professional/media-centre/schroders-capital-launches-uk-s-first-renewables-and-energy-transition-infrastructure-dedicated-long-term-asset-fund/
  f("FUND-189", "Schroders Greencoat", "Schroders Greencoat Global Renewables+ LTAF", "2024", "Undisclosed", null, "Core-Plus", "Deploying", {
    description: "UK Long-Term Asset Fund providing DC pension schemes access to operational renewable energy infrastructure globally, targeting wind, solar, and storage assets.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.schroders.com/en-gb/uk/institutional/funds-and-strategies/renewables-plus",
  }),
  // Source: https://www.schroderscapital.com/en/global/professional/capabilities/infrastructure/schrodersgreencoat/ | https://www.brunelpensionpartnership.org/2024/01/26/brunel-clients-schroders-greencoat-solar-investment/
  f("FUND-190", "Schroders Greencoat", "Greencoat Cornwall Gardens LP", "2022", "Undisclosed", null, "Core", "Deploying", {
    description: "Unlisted fund investing in operational UK renewable energy infrastructure, targeting wind and solar assets with long-term contracted or subsidized revenues.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    strategyUrl: "https://www.schroderscapital.com/en/global/professional/capabilities/infrastructure/schrodersgreencoat",
  }),
  // Source: https://www.wiltshirepensionfund.org.uk/article/8199/100m-commitment-to-South-West-renewables | https://www.schroderscapital.com/en/global/professional/capabilities/infrastructure/schrodersgreencoat/
  f("FUND-191", "Schroders Greencoat", "Schroders Greencoat Wessex Gardens", "2023", "£330M", 429, "Core", "Deploying", {
    description: "Fund investing in UK operational renewable energy assets with focus on solar PV and onshore wind, targeting core returns with stable contracted cash flows.\nPortfolio:\nRenewables / Energy Transition: Andershaw Wind Farm (Onshore Wind), Bicker Fen Wind Farm (Onshore Wind), Bin Mountain Wind Farm (Onshore Wind), Bishopthorpe Wind Farm (Onshore Wind), Braes of Doune Wind Farm (Onshore Wind), Bring Energy (Onshore Wind), Brockaghboy Wind Farm (Onshore Wind), Burbo Bank Extension (Offshore Wind), Carcant Wind Farm (Onshore Wind), Carlton Power (Battery Storage), Church Hill Wind Farm (Onshore Wind), Clyde Wind Farm (Onshore Wind), Corriegarth Wind Farm (Onshore Wind), Crighshane Wind Farm (Onshore Wind), Dalquhandy Wind Farm (Onshore Wind), Deeping St Nicholas (Solar), Douglas West Wind Farm (Onshore Wind), Drogheda Energy Park (Wind), Greencoat Renewables PLC (Wind), Greencoat UK Wind PLC (Wind), ISG Renewables (Solar), JERA Nex US Solar Portfolio (Solar), Low Carbon Greenhouses (Geothermal), METLEN UK Solar Portfolio (Solar), Repsol Spanish Renewable Portfolio (Wind & Solar), Toucan Energy Portfolio (Solar), West of Duddon Sands (Offshore Wind)",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    strategyUrl: "https://www.wiltshirepensionfund.org.uk/article/8199/100m-commitment-to-South-West-renewables",
  }),

  // Stonepeak
  // Source: https://stonepeak.com/investments/infrastructure | https://pitchbook.com/profiles/fund/24383-62F
  f("FUND-192", "Stonepeak", "Stonepeak Infrastructure Fund V", "2023", "$15.0B", 15000, "Value-Add", "Raising", {
    description: "Fifth-generation flagship fund targeting investments in digital infrastructure, energy and energy transition, transportation and logistics, and social infrastructure primarily in North America.\nPortfolio:\nCommunications: Cellnex Nordics (Towers), GTA (TeleGuam) (Telecoms), Intrado (Communications Technology), Philippines Tower JVCo (Towers)\nDigital Infrastructure: Astound Broadband (Fiber & Broadband), Cirion Technologies (Data Centers & Fiber), Cologix (Data Centers), CoreSite (Data Centers), DELTA Fiber (Fiber Networks), Digital Edge (Data Centers), Equalbase (Data Centers), euNetworks (Fiber Networks), Omni Fiber (Fiber Networks), Princeton Digital Group (Data Centers), Xplore (Fiber & Broadband)\nLogistics: IFCO Group (Reusable Packaging), LOGISTEC (Marine Services), Rinchem (Chemical Logistics), Stonepeak Infrastructure Logistics (Infrastructure Logistics)\nMidstream / Energy: IOR (Oilfield Services), KAPS (Pipelines), Longview Infrastructure (Water Midstream), Louisiana LNG (LNG), Paradigm Energy Partners (Water Midstream), Pelican Pipeline (Pipelines)\nRenewables / Energy Transition: AGP Sustainable Real Assets (Diversified), Coastal Virginia Offshore Wind (Offshore Wind), Joule Terra (Solar), Kingdom Energy Storage (Battery Storage), Maas Energy Works (Biogas), NorthStar Renewable Power (Solar), Peak Energy (Battery Storage), Repsol U.S. Renewables (Wind & Solar), Stonepeak Island Transition (Energy Transition), Synera Renewable Energy (Solar), TerraWind Renewables (Wind)\nSocial Infrastructure: Akumin (Healthcare Imaging), Arvida (Senior Living), Inspired Education Group (Education)\nTransportation: ATSG (Air Cargo), Dupré Logistics (Logistics), Emergent Cold LatAm (Cold Storage), Lineage Logistics (Cold Storage), Seapeak / Stonepeak Marine (LNG & Marine), Stonepeak Aviation Platform (Aircraft Leasing), Textainer (Container Leasing), TRAC Intermodal (Chassis Leasing), UNITED PORTS LLC (Ports)\nUtilities: Aura Holdings (Energy Services), Carlsbad Desalination Plant (Water Desalination), Lestari Cooling Energy (District Cooling), Montera Infrastructure (Utility Services)",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Logistics", "Utilities"],
    regions: ["North America"],
    strategyUrl: "https://inforcapital.com/funds/stonepeak-infrastructure-fund-v",
  }),
  // Source: https://stonepeak.com/ | https://pitchbook.com/profiles/fund/25534-54F
  f("FUND-193", "Stonepeak", "Stonepeak Global Renewables Fund II", "2024", "$5.0B", 5000, "Core-Plus", "Raising", {
    description: "Dedicated global renewables fund investing in wind, solar, battery storage, and green hydrogen projects with development and operational capabilities.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    strategies: ["Core-Plus", "Greenfield"],
    strategyUrl: "https://www.infrastructureinvestor.com/stonepeak-to-target-5bn-for-second-renewables-fund-exclusive",
  }),
  // Source: https://stonepeak.com/news/stonepeak-closes-asia-infrastructure-fund-with-3-3-billion-of-commitments | https://pitchbook.com/profiles/fund/29020-24F (note: this is the PitchBook for Fund II, not Fund I)
  f("FUND-194", "Stonepeak", "Stonepeak Asia Infrastructure Fund II", "2024", "$4.0B", 4000, "Value-Add", "Raising", {
    description: "Second Asia-focused fund investing in digital infrastructure, energy, transportation, logistics, and cold storage in developed East Asia, Southeast Asia, and India.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Logistics"],
    regions: ["Asia-Pacific"],
    strategyUrl: "https://stonepeak.com/news/stonepeak-closes-asia-infrastructure-fund-with-3-3-billion-of-commitments",
  }),
  // Source: https://stonepeak.com/news/stonepeak-closes-opportunities-fund-with-3-15-billion-of-commitments | https://pitchbook.com/profiles/fund/22877-47F
  f("FUND-195", "Stonepeak", "Stonepeak Opportunities Fund", "2022", "$3.15B", 3150, "Value-Add", "Deploying", {
    description: "Mid-market opportunities fund targeting core-plus and value-add infrastructure investments including control positions and structured capital solutions in communications, transport/logistics, and energy transition.",
    sectors: ["Communications", "Transportation", "Logistics", "Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://stonepeak.com/news/stonepeak-closes-opportunities-fund-with-3-15-billion-of-commitments",
  }),
  // Source: https://formds.com/issuers/stonepeak-opportunities-fund-ii-lp | https://pitchbook.com/profiles/fund/29020-24F
  f("FUND-196", "Stonepeak", "Stonepeak Opportunities Fund II", "2024", "~$3.0B", 3000, "Value-Add", "Raising", {
    description: "Successor mid-market infrastructure fund continuing Stonepeak's strategy of targeting core-plus and value-add opportunities in communications, transport/logistics, and energy transition.",
    sectors: ["Communications", "Transportation", "Logistics", "Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://formds.com/issuers/stonepeak-opportunities-fund-ii-lp",
  }),
  // Source: https://stonepeak.com/investments/infrastructure | https://pitchbook.com/profiles/fund/21806-65F
  f("FUND-197", "Stonepeak", "Stonepeak Core Fund", "2021", "$3.1B+", 3100, "Core", "Evergreen", {
    description: "Open-ended core infrastructure fund with $3.7B+ AUM, targeting developed-market assets with long-term inflation-linked revenue streams across digital infrastructure, transportation/logistics, and energy transition.",
    sectors: ["Digital Infrastructure", "Transportation", "Logistics", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://inforcapital.com/funds/stonepeak-core-fund",
  }),

  // Swiss Life Asset Managers
  // Source: https://www.swisslife-am.com/en/home/media/news/corporate/company-news/2024/0704-gio-4.html | https://realassets.ipe.com/news/swiss-life-seeks-25bn-for-latest-global-core-plus-infrastructure-fund/10074430.article
  f("FUND-198", "Swiss Life Asset Managers", "Swiss Life Funds (LUX) Global Infrastructure Opportunities IV", "2024", "€2.5B", 2750, "Core-Plus", "Raising", {
    description: "Global core-plus infrastructure fund investing in essential mid-market assets across energy, transportation, digital, and social infrastructure in developed markets.\nPortfolio:\nCommunications: Cellnex Switzerland (Towers), GD Towers (Towers)\nDigital Infrastructure: Altitude Infrastructure THD (Fiber Networks), DataBank (Data Centers), Lyntia Networks (Fiber Networks), RAD-x (Fiber Networks), Vantage Data Centers EMEA (Data Centers)\nRenewables / Energy Transition: BCP Battery Holding (Battery Storage), Borssele III & IV (Offshore Wind), Drone Hill Wind Farm (Onshore Wind), HydePoint (Green Hydrogen), Molise PV Solar (Solar), North Ammonia (Green Ammonia), Powy (Battery Storage), Seagust (Offshore Wind), Vergia (Renewables Platform)\nSocial Infrastructure: Colegios Educare (Education), Condecta AG (Modular Construction), Infrareal GmbH (Campus Infrastructure)\nTransportation: Aves One AG (Rolling Stock Leasing), Brisa (Toll Roads), JFK New Terminal One (Airports), Lusoponte (Toll Roads), Wascosa Holding AG (Rail Leasing)\nUtilities: Amprion (Electricity Transmission), Nortegas (Gas Distribution), Thames Tideway Tunnel (TTT) (Water & Wastewater)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Digital Infrastructure", "Social Infrastructure"],
    regions: ["Europe", "North America"],
    strategyUrl: "https://www.swisslife-am.com/en/home/media/news/corporate/company-news/2024/0704-gio-4.html",
  }),
  // Source: https://www.swisslife-am.com/en/home/media/news/switzerland/institutional/2023/0502-infrastructure-fund.html | https://ch.swisslife-am.com/en/home/media/news/switzerland/institutional/2023/1208-gio-growth-II.html
  f("FUND-199", "Swiss Life Asset Managers", "Swiss Life Funds (LUX) ESG Global Infrastructure Opportunities Growth II", "2023", "€750M", 825, "Value-Add", "Deploying", {
    description: "Growth-oriented ESG infrastructure fund targeting smaller infrastructure businesses in energy transition, digital, and environmental services with high-growth potential.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
    strategies: ["Value-Add", "Growth"],
    strategyUrl: "https://www.swisslife-am.com/en/home/media/news/switzerland/institutional/2023/0502-infrastructure-fund.html",
  }),
  // Source: https://www.swisslife-am.com/en/home/media/news/switzerland/institutional/22/0829_forte_II.html | https://pitchbook.com/profiles/fund/22263-13F
  f("FUND-200", "Swiss Life Asset Managers", "Fontavis ESG Renewable Infrastructure Fund II", "2022", "€750M", 825, "Core-Plus", "Deploying", {
    description: "European renewable energy fund investing in onshore wind, solar PV, and hydropower projects with a strong ESG framework and development-to-core approach.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe"],
    strategyUrl: "https://www.swisslife-am.com/en/home/media/news/switzerland/institutional/22/0829_forte_II.html",
  }),
  // Source: https://www.swisslife-am.com/en/home/media/news/switzerland/institutional/22/1129-clean-energy-infrustructure.html | https://pitchbook.com/profiles/fund/24412-69F
  f("FUND-201", "Swiss Life Asset Managers", "Clean Energy Infrastructure Switzerland 3 (CEIS 3)", "2022", "CHF 1.0B+", 1120, "Core-Plus", "Deploying", {
    description: "Largest closed-end infrastructure vehicle in Switzerland, co-managed with UBS, investing in hydropower, solar, biomass, e-mobility, and district heating infrastructure supporting Switzerland's energy transition.",
    sectors: ["Renewables / Energy Transition", "Utilities", "Power Generation"],
    regions: ["Europe"],
    strategyUrl: "https://www.swisslife-am.com/en/home/media/news/switzerland/institutional/22/1129-clean-energy-infrustructure.html",
  }),

  // Tallvine
  // Source: https://www.tallvinepartners.com/ | https://pitchbook.com/profiles/fund/25865-92F
  f("FUND-202", "Tallvine", "Tallvine Middle Market Infrastructure Fund I", "2024", "$1.5B", 1500, "Value-Add", "Raising", {
    description: "Debut fund from I Squared Capital spinout targeting operationally intensive, value-add investments in lower middle-market infrastructure across North America, with platforms in small-craft aviation, marine services, and data centers.\nPortfolio:\nDigital Infrastructure: TRG Datacenters (Data Centers)\nTransportation: Donjon Marine Co., LLC (Maritime Services), Velocity FBO Network (Odyssey Aviation / BTR Jet) (FBO / Aviation)",
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America"],
    strategyUrl: "https://www.themiddlemarket.com/news-analysis/tallvine-raising-1-5b-for-debut-fund-as-infra-spinouts-gather-pace",
  }),

  // Temasek
  // Source: https://genzero.co/ | https://www.temasek.com.sg/en/news-and-resources/news-room/news/2022/temasek-launches-genzero-aimed-at-accelerating-decarbonisation-globally
  f("FUND-203", "Temasek", "GenZero", "2022", "SGD 5.0B", 3750, "Value-Add", "Evergreen", {
    description: "Temasek's dedicated decarbonization investment platform deploying capital into early-stage and growth climate technologies, clean energy, and sustainable solutions globally.\nPortfolio:\nCommunications: Singtel (Telecoms)\nDigital Infrastructure: ST Telemedia (Data Centers)\nPower Generation: Westinghouse (Nuclear)\nRenewables / Energy Transition: Commonwealth Fusion Systems (Fusion Energy), Eavor (Geothermal), Electric Hydrogen (Green Hydrogen), Neoen (Wind & Solar), Svante (Carbon Capture)\nTransportation: Keppel Ltd (Ports & Logistics), PSA International (Ports), SATS Ltd (Airport Services), Seatrium (Maritime Engineering), SMRT Corporation (Rail & Bus)\nUtilities: Sembcorp Industries (Energy & Water), SP Group (Electricity & Gas)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Waste / Environmental Services"],
    regions: ["Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://genzero.co/portfolio",
  }),

  // Tiger Infrastructure Partners
  // Source: https://www.tigerinfrastructure.com/strategy | https://pitchbook.com/profiles/fund/24513-04F
  f("FUND-204", "Tiger Infrastructure Partners", "Tiger Infrastructure Partners Fund IV", "2023", "$1.5B", 1500, "Value-Add", "Raising", {
    description: "Mid-market value-add fund investing in digital infrastructure, energy, and transportation assets across North America and Europe with hands-on platform building.\nPortfolio:\nDigital Infrastructure: 11:11 Systems (Cloud & Data Centers), Crosslake Fibre (Subsea Fiber), Digital Sense Hosting (Data Centers), Ntirety (Managed Hosting), Stellium Datacenters (Data Centers), Strategic Venue Partners (Venue Connectivity), Voneus (Fiber Networks)\nPower Generation: Danskammer Energy (Gas-to-Power), Forsa Energy (Gas-to-Power), Unison Energy (Distributed Power)\nRenewables / Energy Transition: Summit Brazil Renewables (Wind & Solar), Summit Carbon Solutions (Carbon Capture)\nSocial Infrastructure: EMED Group (Healthcare)\nTransportation: International Aerospace Coatings (IAC) (Aviation Services), MNC Transportation (Bus Services), Modern Aviation (FBO / Aviation), NorthLink Aviation (Aviation Services), Qwello (EV Charging)\nUtilities: ELM Utility Services (Utility Services), Granite Comfort (HVAC)\nWaste / Environmental Services: Bolder Industries (Tire Recycling), Raptor Waste Solutions (Waste Management)",
    sectors: ["Digital Infrastructure", "Power Generation", "Transportation"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.tigerinfrastructure.com/strategy",
  }),

  // TPG
  // Source: https://www.tpg.com/platforms/impact/rise-climate | https://pitchbook.com/profiles/fund/24821-29F
  f("FUND-205", "TPG", "TPG Rise Climate II", "2023", "$10.0B", 10000, "Value-Add", "Deploying", {
    description: "Flagship climate fund investing in clean energy, decarbonization, and sustainable solutions companies globally, targeting both infrastructure and growth equity.\nPortfolio:\nCommunications: Blue Sky Towers (Towers), Connected Infra Group (Towers), Everest Infrastructure Partners (Towers), Sabre Industries (Tower Manufacturing), Vertel Pty (Telecoms)\nDigital Infrastructure: Tata Consultancy Services (AI Data Centers) (Data Centers)\nMidstream / Energy: AmSpec (Inspection & Testing), Kinetic (Environmental Services)\nRenewables / Energy Transition: Altus Power (Solar), Anew Climate (Carbon Markets), Aurora Energy Research (Energy Analytics), Form Energy (Long-Duration Storage), Gridserve (Solar & EV Charging), Intersect Power (Solar & Storage), Matrix Renewables (Solar), MIRATECH (Emissions Control), Monolith (Clean Hydrogen), Nextracker (Solar Trackers)\nTransportation: BETA Technologies (Electric Aviation)\nUtilities: Pike Corporation (Utility Services), Techem (Energy Services)\nWaste / Environmental Services: SICIT Group S.p.A. (Circular Economy)",
    sectors: ["Renewables / Energy Transition", "Power Generation", "Transportation"],
    regions: ["Global"],
    strategyUrl: "https://www.tpg.com/platforms/impact/rise-climate",
  }),
  // Source: https://www.tpg.com/platforms/impact/rise-climate | https://pitchbook.com/profiles/fund/26716-06F
  f("FUND-206", "TPG", "TPG Rise Climate Transition Infrastructure (TRC TI)", "2024", "$2.0B", 2030, "Core-Plus", "Raising", {
    description: "Core-plus fund targeting operational and contracted clean energy infrastructure assets including solar, wind, storage, and grid infrastructure globally.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    strategyUrl: "https://www.tpg.com/news-and-insights/the-transition-infrastructure-opportunity-jim-coulter-and-scott-lebovitz-on-the-next-era-of-climate-investing",
  }),
  // Source: https://www.tpg.com/news-and-insights/tpg-announces-progress-for-global-south-initiative-anchored-by-alterra | https://www.aiib.org/en/projects/details/2026/approved/multicounty-tpg-rise-climate-global-south-initiative-fund.html
  f("FUND-207", "TPG", "TPG Rise Climate Global South Initiative", "2024", "$2.5B", 2500, "Value-Add", "Raising", {
    description: "Emerging markets climate fund investing in renewable energy, clean transportation, and sustainable infrastructure in developing economies across Asia, Africa, and Latin America.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Power Generation"],
    regions: ["Asia-Pacific", "Middle East & Africa", "Latin America"],
    strategyUrl: "https://www.tpg.com/news-and-insights/tpg-announces-progress-for-global-south-initiative-anchored-by-alterra",
  }),
  // Source: https://www.peppertreecapital.com/ | https://pitchbook.com/profiles/fund/24766-39F
  f("FUND-208", "TPG", "TPG Peppertree Capital Fund X", "2023", "$2.04B", 2040, "Value-Add", "Deploying", {
    description: "Specialized digital infrastructure fund investing in wireless communications towers, fiber networks, spectrum assets, small cells, and distributed antenna systems across the United States.",
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America"],
    strategyUrl: "https://realassets.ipe.com/news/peppertree-capital-raises-11bn-for-digital-infrastructure-fund/10070683.article",
  }),

  // True Green Capital
  // Source: https://truegreencapital.com/ | https://pitchbook.com/profiles/fund/17941-06F
  f("FUND-209", "True Green Capital", "True Green Capital Fund IV", "2022", "$661M", 661, "Value-Add", "Deploying", {
    description: "Renewable energy infrastructure fund investing in distributed commercial and industrial (C&I) solar, batteries, and microgrids across the US, UK, and EU with over 600 MW of operating distributed solar.\nPortfolio:\nRenewables / Energy Transition: Charbone Hydrogene (Green Hydrogen), Clean Energy Capital (CEC) (Solar), CleanChoice Energy (Community Solar), Ecofin US Renewables Portfolio (64MW) (Solar), Faradae SAS (Solar)",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://www.prnewswire.com/news-releases/true-green-capital-management-closes-fourth-fund-at-over-650-million-exceeding-its-500-million-target-301561227.html",
  }),
  // Source: https://truegreencapital.com/ | https://companiesbio.com/CIK-0002055378-company-true-green-capital-fund-v-l-p-info.html (SEC EDGAR CIK)
  f("FUND-210", "True Green Capital", "True Green Capital Fund V", "2025", "$500M+", 500, "Value-Add", "Raising", {
    description: "Successor fund continuing True Green's distributed C&I solar strategy, expanding into community solar and battery storage across the US and Europe.",
    sectors: ["Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    strategies: ["Value-Add", "Greenfield"],
    strategyUrl: "https://realassets.ipe.com/news/virginia-retirement-invests-100m-in-true-green-infrastructure-fund/10130119.article",
  }),

  // Vauban Infrastructure Partners
  // Source: https://vauban-ip.com/en | https://pitchbook.com/profiles/fund/20368-99F
  f("FUND-211", "Vauban Infrastructure Partners", "Core Infrastructure Fund IV (CIF IV)", "2024", "€2.2B", 2420, "Core", "Deploying", {
    description: "European core infrastructure fund investing in regulated and contracted essential assets in transportation, utilities, social infrastructure, and digital with long-term visibility.\nPortfolio:\nCommunications: Cellnex Austrian Tower Business (Towers), Towerlink France SAS (Towers)\nDigital Infrastructure: Bluevia (Fiber Networks), Borealis Data Center (Data Centers), Vauban Infra Fibre (VIF) / Axione (Fiber Networks)\nRenewables / Energy Transition: BIOSYNERGY (Biogas), Cartier Energy (Wind), Green Create Wijster B.V. (Biogas)\nSocial Infrastructure: Arema (Velodrome of Marseille) (Sports), Progeni S.P.A (Healthcare)\nTransportation: Boreal (Ferries & Bus), Cedinsa Concesionaria (Toll Roads), Core Infrastructure Rail (Aves One/Wascosa) (Rail Leasing), Indigo Group (Parking), Lusoponte (Toll Roads), Metro de Malaga (Metro), Port Adhoc Group (Marinas), Snow Lion (EV Charging)\nUtilities: Coriance (District Heating), Loiste Oy (Electricity Distribution), Oslofjord Varme AS (District Heating), Proxiserve (Energy Services)\nWaste / Environmental Services: Paprec (Waste Management)",
    sectors: ["Transportation", "Utilities", "Social Infrastructure", "Digital Infrastructure"],
    regions: ["Europe"],
    strategyUrl: "https://realassets.ipe.com/news/vauban-infrastructure-raises-25bn-for-third-core-fund-beats-target/10053818.article",
  }),
  // Source: https://vauban-ip.com/en | https://www.preqin.com/data/profile/fund-manager/vauban-infrastructure-partners/363284
  f("FUND-212", "Vauban Infrastructure Partners", "Core Infrastructure Fund V (CIF V)", "2025", "€2.5B – €3.0B", 2750, "Core", "Raising", {
    description: "Successor core fund continuing Vauban's strategy of investing in essential European infrastructure with availability-based or regulated revenue profiles.",
    sectors: ["Transportation", "Utilities", "Social Infrastructure", "Digital Infrastructure"],
    regions: ["Europe"],
    strategyUrl: "https://www.im.natixis.com/en-intl/about/investment-managers-and-capabilities/vauban-infrastructure-partners",
  }),
  // Source: https://vauban-ip.com/en | https://www.infrastructureinvestor.com/vauban-launches-e1bn-value-add-infra-strategy-exclusive/
  f("FUND-213", "Vauban Infrastructure Partners", "Value Add Transition Infrastructure Fund III (VATIF III)", "2025", "€1.0B", 1100, "Value-Add", "Raising", {
    description: "Value-add fund targeting energy transition infrastructure in Europe including renewable energy, grid modernization, and green mobility with development capabilities.",
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities"],
    regions: ["Europe"],
    strategyUrl: "https://www.infrastructureinvestor.com/vauban-launches-e1bn-value-add-infra-strategy-exclusive/",
  }),

  // Vision Ridge Partners
  // Source: https://vision-ridge.com/ | https://www.businesswire.com/news/home/20260211626032/en/Vision-Ridge-Partners-Raises-$2.4-Billion-for-Flagship-Sustainable-Real-Assets-Strategy
  f("FUND-214", "Vision Ridge Partners", "Sustainable Asset Fund IV (SAF IV)", "2024", "$2.4B", 2400, "Value-Add", "Deploying", {
    description: "Sustainable real assets fund investing in utility-scale battery storage, clean mobility platforms, electric utilities, and agricultural decarbonization infrastructure globally, targeting 15-20% net IRR.\nPortfolio:\nRenewables / Energy Transition: Earthrise Energy (Solar), GSSG Chikuden (Battery Storage), Guzman Energy (Clean Energy Retail), Homer (Energy Analytics), Pelican Energy TCI (Solar), Sparkfund (Energy-as-a-Service), VisionRNG (RNG)\nTransportation: TeraWatt Infrastructure (EV Charging), VEMO (EV Fleet), YMX Logistics (Logistics)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Power Generation"],
    regions: ["Global"],
    strategyUrl: "https://www.businesswire.com/news/home/20260211626032/en/Vision-Ridge-Partners-Raises-2.4-Billion-for-Flagship-Sustainable-Real-Assets-Strategy",
  }),

  // Wafra
  // Source: https://www.wafra.com/our-strategies/real-assets/ | https://www.datocapital.bm/companies/Wafra-Real-Assets-&-Infrastructure-Fund-II-Lp.html
  f("FUND-215", "Wafra", "Wafra Real Assets & Infrastructure Fund II", "2022", "Undisclosed", null, "Core-Plus", "Deploying", {
    description: "Kuwait-backed infrastructure fund investing in aviation, digital infrastructure, marine/shipping, solar and battery storage, and logistics assets globally.\nPortfolio:\nDigital Infrastructure: Beyond Data Centers (Data Centers), Vantage Data Centers (Data Centers)\nMidstream / Energy: Crescent Louisiana Midstream (Gathering & Processing)\nPower Generation: Lackawanna Energy Center (Gas-to-Power)\nRenewables / Energy Transition: Greenflash Infrastructure (Battery Storage), Mission Clean Energy (Solar & Storage), NineDot Energy (Battery Storage)\nTransportation: American Inland Marine Holdings (Maritime), Aquila Air Capital (Aircraft Leasing), Ascension FBO Network (FBO / Aviation), Contract Leasing Corporation (CLC) (Trailer Leasing), Hawthorne Global Aviation Services (FBO / Aviation), Signal Rail Holdings (Short-Line Rail), SKY Leasing (Aircraft Leasing), Suntex Marinas (Marinas), The Hinckley Company (Marinas)\nUtilities: Intermountain Infrastructure Group (Utility Services)",
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition", "Logistics"],
    regions: ["Global"],
    strategyUrl: "https://www.wafra.com/our-strategies/real-assets",
  }),
  // Source: https://www.wafra.com/our-strategies/real-assets/ | https://adviserinfo.sec.gov/firm/summary/108673
  f("FUND-216", "Wafra", "Wafra Real Assets & Infrastructure Platform (SMA)", "1985", "Undisclosed", null, "Core", "Evergreen", {
    description: "Separately managed account platform providing permanent capital infrastructure exposure across aviation, digital infrastructure, shipping, renewable energy, and logistics for Kuwait's Public Institution for Social Security.",
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition", "Logistics"],
    regions: ["Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.wafra.com/our-strategies/real-assets",
  }),

  // Wren House Infrastructure
  // Source: https://wrenhouseinfra.com/our-firm/ | https://www.preqin.com/data/profile/fund-manager/wren-house-infrastructure/432051
  f("FUND-217", "Wren House Infrastructure", "Wren House Infrastructure (Captive Platform)", "2013", "$10.0B+", 10000, "Core", "Evergreen", {
    description: "London-based captive infrastructure arm of Kuwait Investment Authority investing globally in airports, ports, water utilities, energy generation and transmission, midstream, and digital infrastructure with long-term hold mandates.\nPortfolio:\nCommunications: Phoenix Tower International (PTI) (Towers)\nDigital Infrastructure: i3 Broadband (Fiber Networks), QTS Northern Virginia Data Centers JV (Data Centers)\nMidstream / Energy: North Sea Midstream Partners (Gas Processing)\nPower Generation: Global Power Generation (GPG) (Power Generation)\nRenewables / Energy Transition: Zorlu Enerji (Diversified Energy)\nSocial Infrastructure: Almaviva Santé (Healthcare), Voyage Care (Specialist Care)\nTransportation: Associated British Ports (ABP) (Ports), Direct ChassisLink Inc. (DCLI) (Chassis Leasing), Electrip (EV Charging), Groupe Petit Forestier (Refrigerated Vehicle Leasing), London City Airport (LCY) (Airports), SeaCube Container Leasing (Container Leasing)",
    sectors: ["Transportation", "Utilities", "Power Generation", "Digital Infrastructure", "Midstream / Energy", "Water"],
    regions: ["Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.whinfra.com/our-firm",
  }),

  // ── Sovereign Wealth Funds, Pension Funds & Other Institutional Investors ──

  // ADIA (Abu Dhabi Investment Authority)
  // Source: https://www.adia.ae/en/investments | https://www.swfinstitute.org/profile/598cdaa50124e9fd2d05a79b
  f("FUND-218", "ADIA (Abu Dhabi Investment Authority)", "ADIA Direct Infrastructure", "Evergreen", "N/A", null, "Core", "Evergreen", {
    description: "Abu Dhabi sovereign wealth fund's dedicated infrastructure department investing directly across four core sectors: utilities, energy, transport, and digital, supporting approximately 22 GW of renewable energy projects globally.\nPortfolio:\nCommunications: Cellnex Telecom (Towers), EdgePoint Infrastructure (Towers), Landmark Dividend LLC (Ground Leases)\nDigital Infrastructure: Aligned Data Centers (Data Centers), EdgeConneX (Data Centers), FiberCop (Fiber Networks), Jio Digital Fiber (Fiber Networks), NetCo SRL (Fiber Networks), Open Fiber (Fiber Networks), Vantage Data Centers APAC (Data Centers)\nLogistics: GLP (Logistics Real Estate)\nMidstream / Energy: Sempra Infrastructure Partners (LNG & Pipelines), VTTI (Tank Storage)\nRenewables / Energy Transition: AlphaGen (Renewables Platform), Arevon Energy (Solar & Storage), Equis Development (Renewables Platform), Greenko Energy Holdings (Renewables Platform), ReNew Power (Renewables Platform), Terna Energy (Wind & Solar)\nTransportation: Cube Highways (Toll Roads), Gatwick Airport (Airports), GMR Airports (Airports), Malaysia Airports Holdings Berhad (MAHB) (Airports), Queensland Motorways (Toll Roads), Sumatra Toll Roads (Toll Roads), Sydney Airport (Airports), Trans-Java Toll Roads (Toll Roads), VTG (Rail Freight), WestConnex (Toll Roads)\nUtilities: Anglian Water Group (Water & Wastewater), Kemble Water Holdings (Thames Water) (Water & Wastewater), Scotia Gas Networks (SGN) (Gas Distribution), Transgrid (Electricity Transmission)",
    sectors: ["Utilities", "Midstream / Energy", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.adia.ae/en/investments",
  }),

  // Ancala Partners
  // Source: https://ancala.com/ancala-announces-551m-growth-fund-to-increase-support-for-portfolio-companies-focused-on-the-energy-transition/ | https://find-and-update.company-information.service.gov.uk/company/LP022980
  f("FUND-219", "Ancala Partners", "Ancala Essential Growth Infrastructure Fund", "2023", "£551M", 700, "Growth", "Deploying", {
    description: "Continuation-style growth fund providing expansion capital to existing Ancala portfolio companies including Portsmouth Water, Biogen (biogas/gas-to-grid), and Leep Utilities (last-mile utility networks) in the UK.\nPortfolio:\nRenewables / Energy Transition: Biogen (Biogas)\nUtilities: Leep Utilities (Multi-Utility)\nWater: Portsmouth Water (Water Supply)",
    sectors: ["Water", "Renewables / Energy Transition", "Utilities"],
    regions: ["Europe"],
    strategyUrl: "https://ancala.com/ancala-announces-551m-growth-fund-to-increase-support-for-portfolio-companies-focused-on-the-energy-transition",
  }),

  // APG Asset Management
  // Source: https://assetmanagement.apg.nl/infrastructure/ | https://hub.ipe.com/asset-manager/ubs-asset-management-infrastructure/424889.supplier
  f("FUND-220", "APG Asset Management", "APG Direct Infrastructure Pool", "Evergreen", ">€33B", 36000, "Core", "Evergreen", {
    description: "Dutch pension fund manager's direct infrastructure investment program, one of the world's largest, investing in utilities, energy, and transportation assets globally.\nPortfolio:\nDigital Infrastructure: Conterra Networks (Fiber Networks), euNetworks (Fiber Networks), Glaspoort (Fiber Networks), Nexera (Fiber Networks), Open Fiber (Fiber Networks), Smart City Infrastructure Fund (SCIF) (Smart Cities), Voyage Holdings (Vocus) (Fiber Networks)\nLogistics: Peel Ports Group (Ports)\nPower Generation: Astoria Energy I and II (Gas-to-Power)\nRenewables / Energy Transition: Doral Renewables (Solar), Gemini (Offshore Wind), Groendus (Solar & Wind), Merkur Offshore Wind (Offshore Wind), Noordzeker (Offshore Wind), Octopus Australia OASIS (Solar & Storage), Pattern Energy (Wind & Solar), Return (BESS platform) (Battery Storage), SkyNRG (Sustainable Aviation Fuel), Småkraft (Hydro), Vasa Vind (Wind)\nSocial Infrastructure: HICL UK Social Infrastructure Portfolio (PPP/PFI)\nTransportation: Brisa (Toll Roads), Brussels Airport (Airports), Driveco (EV Charging), Interparking (Parking), Italo / NTV (High-Speed Rail), Itinere Infraestructuras (Toll Roads), Mer (EV Charging) (EV Charging), Saba Infraestructuras (Parking), Trans Java Toll Road (Toll Roads), Trans Sumatra Toll Road (Toll Roads)\nUtilities: Ausgrid (Electricity Distribution), Celeo Redes (Electricity Transmission), Kenter (Smart Metering), Stockholm Exergi (District Heating), TenneT Germany (Electricity Transmission)",
    sectors: ["Utilities", "Power Generation", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://assetmanagement.apg.nl/infrastructure",
  }),

  // Apollo Global Management
  // Source: https://www.apollo.com/insights-news/pressreleases/2022/01/apollo-closes-second-dedicated-infrastructure-fund-with-more-than-2-5-billion-in-capital-commitments-130444186 | https://pitchbook.com/profiles/fund/17581-42F
  f("FUND-221", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund II", "2022", "$2.54B", 2540, "Value-Add", "Deploying", {
    description: "Value-add infrastructure fund investing in complex, capital-intensive energy, power, and utility assets across North America and Europe with operational turnaround capabilities.\nPortfolio:\nCommunications: Infrastructure Networks / INET (Fiber Networks), Parallel Infrastructure (Towers)\nMidstream / Energy: Energos Infrastructure (LNG)\nRenewables / Energy Transition: US Wind (Offshore Wind)\nTransportation: Primafrio (Logistics)",
    sectors: ["Power Generation", "Utilities", "Midstream / Energy"],
    regions: ["North America", "Europe"],
    strategyUrl: "https://www.apollo.com/insights-news/pressreleases/2022/01/apollo-closes-second-dedicated-infrastructure-fund-with-more-than-2-5-billion-in-capital-commitments-130444186",
  }),

  // BCI (British Columbia Investment Management Corp)
  // Source: https://www.bci.ca/investments-performance/portfolio/infrastructure-renewable-resources/ | https://www.bci.ca/breaking-new-ground-bci-irrs-milestone-year-in-2025/
  f("FUND-222", "BCI (British Columbia Investment Management Corp)", "BCI Infrastructure & Renewable Resources Program", "2005", "~C$32B", 32000, "Core", "Evergreen", {
    description: "Canadian pension fund's infrastructure platform investing directly in essential assets across utilities, transportation, renewable energy, and timber/agriculture globally.\nPortfolio:\nDigital Infrastructure: Frontier Towers (Towers), Rakuten Mobile (Infra JV) (Mobile Network), Summit Digitel (Data Infrastructure Trust) (Towers)\nLogistics: Linx Cargo Care Group (Intermodal Logistics)\nMidstream / Energy: Exolum (CLH) (Fuel Storage & Transport), Nova Transportadora do Sudeste (NTS) (Gas Pipelines), Open Grid Europe (OGE) (Gas Transmission)\nPower Generation: Isagen SA (Hydroelectric)\nRenewables / Energy Transition: Eku Energy (Battery Storage), Northview Energy (Solar & Storage), Reden Solar (Solar)\nSocial Infrastructure: BBGI Global Infrastructure S.A. (PPP / PFI)\nTransportation: Arteris (Toll Roads), Cube Highways Trust (Toll Roads), Dalrymple Bay Coal Terminal (Port Terminal), Pacific National (Rail Freight), Patrick Terminals (Port Terminal)\nUtilities: Cleco Partners LP (Electric Utility), Corix Infrastructure Inc. (Water & Gas Distribution), Endeavour Energy (Electricity Distribution), National Gas (Gas Transmission), Puget Sound Energy (Electric & Gas Utility), Transelec (Electricity Transmission), Trencap LP (Energir) (Gas Distribution)\nWaste / Environmental Services: Renewi PLC (Waste Management)\nWater: Thames Water (Water & Wastewater Utility)",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.bci.ca/investments-performance/portfolio/infrastructure-renewable-resources",
  }),


  // AustralianSuper
  // Source: https://www.australiansuper.com/investments/what-we-invest-in | https://www.australiansuper.com/global-investors/capabilities
  f("FUND-224", "AustralianSuper", "AustralianSuper Infrastructure Portfolio", "Evergreen", ">$30B", 30000, "Core", "Evergreen", {
    description: "Australia's largest pension fund's direct infrastructure program investing in essential assets globally including airports, toll roads, utilities, and renewable energy.\nPortfolio:\nDigital Infrastructure: Cirion Technologies (Data Centers), DataBank (Data Centers), Indara Digital Infrastructure (Towers), Vantage Data Centers EMEA (Data Centers)\nLogistics: Moorebank Intermodal Precinct (Intermodal), NSW Ports (Ports), Peel Ports (Ports)\nRenewables / Energy Transition: Generate Capital (Sustainable Infrastructure)\nTransportation: Perth Airport (Airports), Sydney Airport (Airports), Transurban Chesapeake (Toll Roads), Transurban Queensland (Toll Roads), WestConnex (Toll Roads)\nUtilities: Ausgrid (Electricity Distribution)",
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.australiansuper.com/investments/what-we-invest-in",
  }),

  // CPP Investments
  // Source: https://www.cppinvestments.com/newsroom/cpp-investments-net-assets-total-714-4-billion-at-2025-fiscal-year-end/ | https://en.wikipedia.org/wiki/CPP_Investments
  f("FUND-225", "CPP Investments", "CPP Investments Infrastructure", "Evergreen", "~$60B", 60000, "Core", "Evergreen", {
    description: "Canada Pension Plan's infrastructure program, one of the world's largest direct investors, targeting essential utilities, transportation, energy, and renewables globally.\nPortfolio:\nDigital Infrastructure: AirTrunk (Data Centers), atNorth (Data Centers)\nMidstream / Energy: California Resources Corporation (Aera Energy) (Oil & Gas), Caturus Energy (Oil & Gas), Civitas Resources (Oil & Gas), Nephin Energy (Natural Gas), Sempra Infrastructure Partners (LNG), South Bow Energy (Pipelines), Tallgrass Energy (Pipelines), Teine Energy (Oil & Gas), Wolf Midstream (Pipelines)\nPower Generation: AlphaGen (Gas-to-Power), Inkia Energy (Power Generation), VoltaGrid (Distributed Power)\nRenewables / Energy Transition: Cordelio Power (Wind & Solar), Fécamp Offshore Wind Farm (Offshore Wind), Maple Power (Offshore Wind), Pattern Energy (Wind & Solar), Power2X (Green Hydrogen), Renewable Power Capital (RPC) (Wind & Solar), Reventus Power (Wind & Solar)\nTransportation: 407 ETR (Toll Roads), Arco Norte (Toll Roads), Associated British Ports (ABP) (Ports), Groupe ADP (Aéroports de Paris) (Airports), IDEAL (Toll Roads), IndInfravit Trust (Toll Roads), National Highways Infra Trust (NHIT) (Toll Roads), Pacifico Sur (Toll Roads), Ports America Group (Ports), Transurban Chesapeake (Toll Roads)\nUtilities: Allete (Electric Utilities), Anglian Water Group (Water & Wastewater), Floen (Gas Distribution), Iguá Saneamento S.A. (Water & Wastewater), Transelec (Electricity Transmission)",
    sectors: ["Utilities", "Transportation", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.cppinvestments.com/newsroom/cpp-investments-net-assets-total-714-4-billion-at-2025-fiscal-year-end",
  }),

  // IMCO
  // Source: https://www.imcoinvest.com/asset-classes/infrastructure.html | https://globalswf.com/fund/IMCO
  f("FUND-226", "IMCO", "IMCO Infrastructure Fund", "Evergreen", "~$10B", 10000, "Core", "Evergreen", {
    description: "Ontario municipal employees' investment manager's infrastructure program investing in essential assets across transportation, utilities, and energy in developed markets.\nPortfolio:\nCommunications: Cellnex Nordics (Towers)\nDigital Infrastructure: DataBank (Data Centers), euNetworks (Fiber Networks), Scala Data Centers (Data Centers)\nMidstream / Energy: Exolum (Pipelines & Storage)\nRenewables / Energy Transition: Algoma Hydro (Hydropower), Bioenergy Infrastructure Group (BIG) (Biomass / Biogas), NeXtWind Capital (Onshore Wind), Northvolt (Battery Manufacturing), Pulse Clean Energy (Battery Storage)\nUtilities: AusNet Services (Electricity Transmission)",
    sectors: ["Transportation", "Utilities", "Power Generation"],
    regions: ["North America", "Europe"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.imcoinvest.com/asset-classes/infrastructure.html",
  }),

  // Mubadala Investment Company
  // Source: https://www.mubadala.com/en/what-we-do/our-portfolio | https://ionanalytics.com/insights/infralogic/mubadalas-push-into-infrastructure-is-just-getting-started/
  f("FUND-227", "Mubadala Investment Company", "Mubadala Infrastructure", "Evergreen", "~$30B", 30000, "Core", "Evergreen", {
    description: "Abu Dhabi sovereign investor's infrastructure platform investing in utilities, digital infrastructure, power generation, and renewable energy across global markets.\nPortfolio:\nDigital Infrastructure: Aligned Data Centers (Data Centers), CityFibre (Fiber Networks), GlobalConnect (Fiber & Data Centers), Jio Platforms (Digital Services), Princeton Digital Group (PDG) (Data Centers), Yondr Group (Data Centers)\nMidstream / Energy: Dolphin Energy (Gas Pipelines), Enagás (Gas Transmission), Rio Grande LNG / NextDecade (LNG), Saudi Aramco Oil Pipelines (Pipelines), Sempra Infrastructure Partners (LNG & Utilities)\nPower Generation: Al Rusail Power (RPC) (Gas-to-Power), SMN Baraka Power Company (Nuclear), SMN Powerholding Company (Power Generation)\nRenewables / Energy Transition: Masdar (Diversified Renewables), PAG Renewable Energy Platform (Wind & Solar), Rezolv Energy (Wind & Solar), Skyborn Renewables (Offshore Wind), Tata Power Renewables (Wind & Solar), ZENOBE (Battery Storage & EV)\nTransportation: AirFirst (Aviation Services), CUBE HIGHWAYS (Toll Roads), Hafeet Rail (Rail), Porto Sudeste (Ports), Rota das Bandeiras (Toll Roads), Terminal Investment Limited (Ports), Transportation Equipment Network (TEN) (Container Leasing)\nUtilities: TABREED (District Cooling)",
    sectors: ["Utilities", "Digital Infrastructure", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.mubadala.com/en/what-we-do/our-portfolio",
  }),

  // OMERS Infrastructure
  // Source: https://www.omersinfrastructure.com/ | https://www.omersinfrastructure.com/about-us
  f("FUND-228", "OMERS Infrastructure", "OMERS Infrastructure Fund", "Evergreen", "~C$39B", 28000, "Core", "Evergreen", {
    description: "Ontario municipal employees' pension fund's infrastructure platform investing directly in essential infrastructure assets globally, including utilities, transportation, and energy.\nPortfolio:\nDigital Infrastructure: Beanfield (Fiber Networks), Deutsche Glasfaser (Fiber Networks), Teranet (Land Registry), Waveconn (Fiber Networks), XPFibre (Fiber Networks)\nMidstream / Energy: Exolum (Pipelines & Storage)\nPower Generation: Bruce Power (Nuclear)\nRenewables / Energy Transition: Azure Power (Solar), FRV Australia (Solar), Groendus (Wind & Solar), Interise Trust (Diversified Renewables), Leeward Renewable Energy (Wind & Solar), Navisun (Solar)\nSocial Infrastructure: amedes (Healthcare), Northstar New Jersey Lottery (Lottery)\nTransportation: Associated British Ports (Ports), Bangalore International Airport (Airports), Direct ChassisLink Inc. (Chassis Leasing), Grandi Stazioni Retail (Rail Stations), Port of Melbourne (Ports), Tank & Rast (Motorway Services), VTG (Rail Freight)\nUtilities: Alectra (Electricity Distribution), Ellevio (Electricity Distribution), Kenter (Smart Metering), Oncor (Electricity Transmission), Puget Sound Energy (Electric & Gas Utilities), Thames Water (Water & Wastewater), Transgrid (Electricity Transmission)",
    sectors: ["Utilities", "Transportation", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.omersinfrastructure.com/investments",
  }),

  // Ontario Teachers' Pension Plan
  // Source: https://www.otpp.com/en-ca/investments/our-investments/infrastructure-and-natural-resources/infrastructure/ | https://en.wikipedia.org/wiki/Ontario_Teachers%27_Pension_Plan
  f("FUND-229", "Ontario Teachers' Pension Plan", "OTPP Infrastructure & Natural Resources", "Evergreen", "~C$43B", 31000, "Core", "Evergreen", {
    description: "Canadian pension fund's direct infrastructure investment program targeting large-scale essential assets in utilities, energy, transportation, and water globally.\nPortfolio:\nCommunications: Connexa (Towers)\nDigital Infrastructure: Compass Datacenters (Data Centers)\nMidstream / Energy: Aethon Energy (Natural Gas E&P)\nRenewables / Energy Transition: ACES Delta (Green Hydrogen), Azure Power (Solar), Corio Generation (Offshore Wind), Cubico Sustainable Investments (Wind & Solar), Equis Development (Diversified Renewables), Mahindra Susten (Solar), Sevana Bioenergy (Biomass)\nTransportation: Chicago Skyway (Toll Roads), Global Container Terminals (GCT) (Ports), IDEAL (Toll Roads), National Highways Infra Trust (NHIT) (Toll Roads)\nUtilities: Caruna (Electricity Distribution), Enwave Energy Corporation (District Energy), Evoltz (Electricity Transmission), Puget Sound Energy (PSE) (Electric & Gas Utilities), Scotia Gas Networks Ltd (SGN) (Gas Distribution), Spark Infrastructure (Electricity Distribution)",
    sectors: ["Utilities", "Power Generation", "Transportation", "Water"],
    regions: ["Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.otpp.com/en-ca/investments/our-investments/infrastructure-and-natural-resources/infrastructure",
  }),

  // Pantheon Ventures
  // Source: https://www.pantheoninfrastructure.com/ | https://www.pantheon.com/news/pantheon-completes-largest-ever-fundraise-with-5-3bn-close-of-secondaries-focused-infrastructure-program/
  f("FUND-230", "Pantheon Ventures", "Pantheon Infrastructure Fund", "Various", "~$5B", 5000, "Core-Plus", "Deploying", {
    description: "London-listed closed-end investment company providing access to a globally diversified portfolio of infrastructure co-investments across digital, power, renewables, transport, and social infrastructure.\nPortfolio:\nCommunications: GD Towers (Towers), Vertical Bridge (Towers)\nDigital Infrastructure: CyrusOne (Data Centers), Delta Fiber (Fiber Networks), GlobalConnect (Fiber & Data Centers), National Broadband Ireland (Fiber Networks), Nexspace (Data Centers), ProLink Infrastructure (Fiber Networks), Vantage Data Centers (Data Centers)\nRenewables / Energy Transition: Cartier Energy (Wind), Zenobē (Battery Storage & EV)\nTransportation: Primafrio (Cold Chain Logistics)\nUtilities: Fudura (Energy Services), National Gas (Gas Transmission)",
    sectors: ["Digital Infrastructure", "Power Generation", "Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["Global"],
    structure: "Listed / Closed-End",
    ticker: "PINT.L",
    strategies: ["Core-Plus", "Co-Investments"],
    strategyUrl: "https://www.pantheoninfrastructure.com/about-us/overview-and-investment-strategy",
  }),


  // Riverstone Holdings
  // Source: https://www.riverstonellc.com/en/home/ | https://en.wikipedia.org/wiki/Riverstone_Holdings
  f("FUND-232", "Riverstone Holdings", "Riverstone Renewable Energy Infrastructure Funds", "Various", "~$4B", 4000, "Value-Add", "Deploying", {
    description: "Energy-focused PE firm's dedicated renewable energy infrastructure vehicles (REIF I & II, ~$4.1B combined) within a broader ~$41B multi-fund platform spanning energy and power.\nPortfolio:\nMidstream / Energy: EPIC Propane Pipeline (Pipelines), ILX FCV (Oil & Gas), IMTT (Terminals & Storage), Max Midstream (Terminals), Teton Range (Oil & Gas)\nRenewables / Energy Transition: A2 Renovables (Solar), Abaco FCV (Solar), Clean Energy Fuels Corp (RNG & CNG), Energia Real (Solar), RIC Energy (Solar), SkySense (Solar), White River Renewables (Hydropower)\nTransportation: VEMO (EV Fleet)\nUtilities: Seawolf Water Resources (Water)",
    sectors: ["Power Generation", "Midstream / Energy", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
    strategyUrl: "https://www.riverstonellc.com/en/home",
  }),

  // Sixth Street
  // Source: https://sixthstreet.com/energy-renewables-infrastructure/ | https://en.wikipedia.org/wiki/Sixth_Street_Partners
  f("FUND-233", "Sixth Street", "Sixth Street Energy, Renewables & Infrastructure", "Various", "~$80B (firm-wide)", 5000, "Value-Add", "Deploying", {
    description: "Multi-strategy $80B investment firm; infrastructure is one of nine platforms (no separately disclosed AUM). Active in power, midstream, renewables, social infrastructure, and data centers with 6+ GW of renewable power invested.\nPortfolio:\nDigital Infrastructure: Blue Stream Fiber (Fiber Networks), EdgeConneX (Data Centers)\nMidstream / Energy: Antero Resources Royalty (Royalties), bp Onshore Midstream Assets (Gathering & Processing), Caliche Development Partners (Oil & Gas)\nPower Generation: Enipower (Gas-to-Power), Sorgenia (Gas-to-Power)\nRenewables / Energy Transition: Spanish Solar PV Portfolio (Solar), US Energy Logistics Wind & Solar (Wind & Solar)",
    sectors: ["Power Generation", "Renewables / Energy Transition", "Midstream / Energy", "Social Infrastructure", "Digital Infrastructure"],
    regions: ["Global"],
    strategies: ["Value-Add", "Credit / Debt"],
    strategyUrl: "https://sixthstreet.com/energy-renewables-infrastructure",
  }),

  // StepStone Group
  // Source: https://www.stepstonegroup.com/what-we-do/asset-classes/infrastructure/ | https://shareholders.stepstonegroup.com/news-releases/news-release-details/stepstone-group-closes-inaugural-infrastructure-co-investment
  f("FUND-234", "StepStone Group", "StepStone Infrastructure Platform", "Various", "~$27B", 27000, "Core-Plus", "Deploying", {
    description: "Infrastructure fund-of-funds, secondaries, and co-investment platform (~$27B infrastructure AUM within $199B firm-wide) providing diversified exposure to global infrastructure across strategies and sectors.\nPortfolio:\nDigital Infrastructure: KKR Devonshire Co-Invest L.P. (Co-Investment SPV), KKR Optics Co-Invest Blocker L.P. (Co-Investment SPV), Verrus (Data Centers)\nMidstream / Energy: Buckeye Partners (Pipelines & Terminals), Stonepeak Ace Holdings LP (Energy Infrastructure)\nRenewables / Energy Transition: Australian Battery Storage Project (Battery Storage), Blue Road Capital PV II, L.P. (Solar), Eco-Stor (Battery Storage), ECP V (California Co-Invest), LP (Co-Investment SPV), Era Blade Continuation Fund Parallel Lp (Wind), NIC Battery Acquisition LP (Battery Storage), Peggy Aggregator, LLC (Co-Investment SPV), rPlus Energies (Solar & Storage), Sandbrook rPlus Co-Invest II LP (Solar & Storage), Walker Aggregator LP (Renewables Platform)\nTransportation: Brussels Airport (Airports), Mundys (Toll Roads), Triton International (Container Leasing)",
    sectors: ["Transportation", "Utilities", "Power Generation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    strategies: ["Core-Plus", "Fund-of-Funds", "Secondaries", "Co-Investments"],
    strategyUrl: "https://www.stepstonegroup.com/what-we-do/asset-classes/infrastructure",
  }),

  // UBS Asset Management
  // Source: https://www.ubs.com/global/en/assetmanagement/capabilities/infrastructure.html | https://hub.ipe.com/asset-manager/ubs-asset-management-infrastructure/424889.supplier
  f("FUND-235", "UBS Asset Management", "UBS Infrastructure Fund", "Various", "~$5B", 5000, "Core", "Deploying", {
    description: "Open-end global infrastructure equity strategy investing in core/core-plus operational infrastructure assets across OECD countries in utilities, energy transition, telecommunications, transportation, and social infrastructure.\nPortfolio:\nDigital Infrastructure: Altitude Infrastructure (Fiber Networks), Datum Datacentres (Data Centers), FiberLight (Fiber Networks), Lefdal Mine Datacenter (Data Centers), Lünecom Kommunikationslösungen (Fiber Networks), Northern Fibre Holding (Fiber Networks), sewikom (Fiber Networks)\nPower Generation: Northern Star Generation (Gas-to-Power)\nRenewables / Energy Transition: Black Mountain Energy Storage Projects (Battery Storage), Captona BESS Portfolio (Battery Storage), Econergy Portfolio (Solar & Wind), Phoenix Wind Repower (Wind Repowering), Spinning Spur II (Onshore Wind)\nUtilities: Gascan (Gas Distribution), Southern Water (Water & Wastewater)\nWaste / Environmental Services: Saubermacher (Waste Management)",
    sectors: ["Utilities", "Renewables / Energy Transition", "Communications", "Transportation", "Social Infrastructure"],
    regions: ["Global"],
    structure: "Open-End",
    strategyUrl: "https://www.ubs.com/global/en/assetmanagement/capabilities/infrastructure.html",
  }),

  // GIC
  // Source: https://www.gic.com.sg/our-portfolio/ | https://en.wikipedia.org/wiki/GIC_(sovereign_wealth_fund)
  f("FUND-236", "GIC", "GIC Infrastructure", "Evergreen", ">$50B", 50000, "Core", "Evergreen", {
    description: "Singapore sovereign wealth fund's infrastructure program investing directly in utilities, digital infrastructure (including data center JVs), energy, and transport globally, with approximately $800 billion total fund AUM.\nPortfolio:\nCommunications: GD Towers (Towers), Telxius Towers (Towers)\nDigital Infrastructure: CETIN Group (Telecom Infrastructure), CyrusOne (Data Centers), Equinix xScale Data Centres (Data Centers), Global Switch (Data Centers), Jio Platforms (Digital Services), Metronode (Data Centers), Searchlight Fiber Alliance (Fiber Networks), Summit Digitel (Reliance Jio Towers) (Towers), Virtus Data Centres (Data Centers)\nLogistics: IndoSpace (Industrial & Logistics Parks)\nMidstream / Energy: APT Pipelines (APA Group) (Gas Pipelines), Channel Infrastructure (Fuel Infrastructure), Puma Energy (Fuel Distribution), Sempra Infrastructure (LNG), Teréga (TIGF) (Gas Transmission & Storage)\nRenewables / Energy Transition: ACEN (AC Energy) (Renewables Platform), CelsiusTech (Vianode) (Battery Materials), EDP Renovaveis (Renewables Platform), Equis Energy (Diversified Renewables), Greenko Group (Diversified Renewables), InterContinental Energy (Green Hydrogen), Stegra (H2 Green Steel) (Green Steel / Hydrogen), Storegga (Carbon Capture & Storage), Vena Energy (Solar & Wind)\nTransportation: IFM (Melbourne Airport) (Airports), IRB Infrastructure Trust (Toll Roads), London Gatwick Airport (Airports), London Heathrow Airport (Airports), Red de Carreteras de Occidente (RCO) (Toll Roads), SATS Ltd (Airport Services), Southern Cross Airports (Sydney) (Airports)\nUtilities: Ausgrid (Electricity Distribution), Duke Energy Indiana (Electric Utility), Genus Power Smart Metering Platform (Smart Metering), ITC Holdings Corp (Transmission), National Gas Transmission (Gas Transmission), Sterlite Power Transmission JV (Transmission)\nWaste / Environmental Services: Climeworks (Carbon Capture)\nWater: Aegea (Water & Wastewater), Suez (now Veolia Environment) (Water & Waste)",
    sectors: ["Digital Infrastructure", "Utilities", "Transportation", "Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["Global"],
    structure: "Permanent Capital",
    strategyUrl: "https://www.gic.com.sg/our-portfolio",
  }),
];

// ─── Build-Time URL Validation ──────────────────────────────

// Legitimate duplicate URLs: press releases covering multiple funds simultaneously
const ALLOWED_DUPLICATE_URLS = new Set([
  // CVC DIF dual-fund close announcement covers both CIF IV and CIF V
  "https://www.cvcdif.com/news-insights/dif-capital-partners-raises-eur-68-billion-for-its-latest-infrastructure-funds",
  // Duration Capital / Oaktree spin-out covers both Transport Fund and successor
  "https://www.prnewswire.com/news-releases/duration-capital-partners-completes-spin-out-from-oaktree-as-an-industry-leading-long-term-transportation-infrastructure-investment-platform-302193139.html",
  // Apollo broad infrastructure strategy page covers multiple flagship vehicles
  "https://www.apollo.com/strategies/asset-management/real-assets/infrastructure",
  // Wafra real assets page covers both commingled fund and SMA platform
  "https://www.wafra.com/our-strategies/real-assets",
  // JP Morgan infrastructure strategy page covers both IIF and GTIF (no dedicated GTIF page exists)
  "https://am.jpmorgan.com/us/en/asset-management/adv/funds/alternatives/infrastructure",
]);

function validateFundUrls(): void {
  const errors: string[] = [];
  const urlToFunds = new Map<string, string[]>();

  for (const fund of funds) {
    // Check empty
    if (!fund.strategyUrl) {
      errors.push(`${fund.id} (${fund.fundName}): missing strategyUrl`);
      continue;
    }
    // Check https
    if (!fund.strategyUrl.startsWith("https://")) {
      errors.push(`${fund.id} (${fund.fundName}): URL must use HTTPS: ${fund.strategyUrl}`);
    }
    // Check bare homepage (domain with no meaningful path)
    try {
      const url = new URL(fund.strategyUrl);
      const pathSegments = url.pathname.split("/").filter((s) => s.length > 0);
      const isBareLangPath =
        pathSegments.length <= 1 &&
        (!pathSegments[0] || /^[a-z]{2}(-[a-z]{2})?$/.test(pathSegments[0]));
      if ((pathSegments.length === 0 || isBareLangPath) && !url.search) {
        errors.push(
          `${fund.id} (${fund.fundName}): bare homepage URL not allowed: ${fund.strategyUrl}`,
        );
      }
    } catch {
      errors.push(`${fund.id} (${fund.fundName}): invalid URL: ${fund.strategyUrl}`);
    }
    // Track duplicates
    const existing = urlToFunds.get(fund.strategyUrl) || [];
    existing.push(`${fund.id} (${fund.fundName})`);
    urlToFunds.set(fund.strategyUrl, existing);
  }

  // Check duplicates
  urlToFunds.forEach((fundIds, url) => {
    if (fundIds.length > 1 && !ALLOWED_DUPLICATE_URLS.has(url)) {
      errors.push(`Duplicate URL across funds [${fundIds.join(", ")}]: ${url}`);
    }
  });

  if (errors.length > 0) {
    console.error(`Fund URL validation failed (${errors.length} issue(s)):\n${errors.join("\n")}`);
  }
}

validateFundUrls();
