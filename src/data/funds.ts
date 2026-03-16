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
    description: "London-listed core-plus infrastructure company investing in mid-market economic infrastructure businesses across Europe, with a focused portfolio spanning digital, transport, utilities, and energy transition assets. Portfolio: Transportation: Belfast City Airport (Airports), ESVAGT (Offshore Marine Services), SRL Traffic Systems (Traffic Management), TCR (Ground Support Equipment); Communications: Global Cloud Xchange (FLAG) (Subsea Cables), Tampnet (Offshore Telecoms); Renewables / Energy Transition: Future Biogas (Biogas), Infinis (Landfill Gas); Utilities: ESP Utilities Group (Gas & Electric Distribution), Joulz (Energy Infrastructure Services); Digital Infrastructure: DNS:NET (Fiber Networks); Midstream / Energy: Oystercatcher (Tank Storage); Social Infrastructure: Ionisos (Sterilization Services); Waste / Environmental Services: Herambiente (Waste-to-Energy)",
    sectors: ["Digital Infrastructure", "Transportation", "Utilities", "Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Europe", "North America", "Asia-Pacific"],
    structure: "Listed / Evergreen",
    ticker: "3IN.L",
  }),
  f("FUND-002", "3i Group", "3i North American Infrastructure Fund", "2022", "$739M", 739, "Core-Plus", "Deploying", {
    description: "Inaugural North American fund targeting mid-market core-plus infrastructure opportunities across digital, transport, environmental services, and communications in the US and Canada. Portfolio: Transportation: Regional Rail (Rail), Smarte Carte (Airport & Travel Services); Waste / Environmental Services: Amwaste (Waste Collection), EC Waste (Waste Collection)",
    sectors: ["Digital Infrastructure", "Transportation", "Waste / Environmental Services", "Communications"],
    regions: ["North America"],
  }),

  // Acadia Infrastructure Capital
  f("FUND-003", "Acadia Infrastructure Capital", "Acadia Infrastructure Capital LP", "2023", "$107M+", 107, "Value-Add", "Deploying", {
    description: "Emerging manager focused on climate-aligned infrastructure investments in underserved US communities, targeting clean energy and environmental resilience projects. Portfolio: Renewables / Energy Transition: JVR Energy Park (Solar), Peregrine Energy Storage (Battery Storage), Pivot Energy Portfolio (Community Solar), Project Soho (Solar), Stillhouse Solar Project (Solar)",
    sectors: ["Renewables / Energy Transition", "Utilities", "Social Infrastructure"],
    regions: ["North America"],
  }),
  f("FUND-004", "Acadia Infrastructure Capital", "Climate and Communities Investment Coalition", "2024", "$9.0B", 9000, "Core-Plus", "Deploying", {
    description: "Large-scale coalition mobilizing capital for climate infrastructure in disadvantaged communities, investing across clean energy, transportation, and water infrastructure. Portfolio: Renewables / Energy Transition: JVR Energy Park (Solar), Peregrine Energy Storage (Battery Storage), Pivot Energy Portfolio (Community Solar), Project Soho (Solar), Stillhouse Solar Project (Solar)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Water", "Social Infrastructure"],
    regions: ["North America"],
  }),

  // Actis
  f("FUND-005", "Actis", "Actis Energy 6", "2025", "$6.0B", 6000, "Value-Add", "Deploying", {
    description: "Flagship energy fund investing in power generation, renewable energy, and energy transition assets across high-growth emerging markets in Africa, Asia, and Latin America. Portfolio: Renewables / Energy Transition: Argo Energy (Renewables Platform), Athena Renewable Energy (Renewables Platform), BluPine Energy (Renewables Platform), Catalyze (Distributed Energy), Levanta Renewables (Renewables Platform), MTerra Solar (Solar), Nozomi Energy (Renewables Platform), Oman Green Hydrogen Project (Green Hydrogen), Orygen (Green Hydrogen), Rezolv Energy (Renewables Platform), Stride Climate Investments (Renewables Platform), Valia Energía (Renewables Platform), Yellow Door Energy (Distributed Solar); Power Generation: Bridgin Power (Gas-to-Power)",
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["Asia-Pacific", "Latin America", "Middle East & Africa"],
  }),
  f("FUND-006", "Actis", "Actis Long Life Infrastructure Fund 2 (ALLIF2)", "2025", "$1.7B", 1700, "Core-Plus", "Deploying", {
    description: "Core-plus fund targeting long-life, contracted infrastructure assets in emerging markets, focusing on energy, utilities, and digital infrastructure with predictable cash flows. Portfolio: Digital Infrastructure: Chayora (Data Centers), ConnectisTower (Towers), Epoch Digital (Data Centers), NextStream (Fiber Networks), Rack Centre (Data Centers), Skyline (Towers), Swiftnet (Towers); Utilities: Barghest Building Performance (bbp) (Energy Efficiency), BGPL (Gas Distribution), Emicool (District Cooling), HRZ Transmissoras (Electricity Transmission), Uludag Energy (Electricity Distribution); Transportation: Colombian Toll Road Portfolio (Toll Roads), NXT Infra (Toll Roads); Renewables / Energy Transition: TERRANOVA (Renewables Platform); Waste / Environmental Services: 800 Super Holdings (Waste Management)",
    sectors: ["Utilities", "Digital Infrastructure", "Power Generation"],
    regions: ["Asia-Pacific", "Latin America", "Middle East & Africa"],
  }),
  f("FUND-007", "Actis", "Actis Asia Climate Transition Fund", "2024", "$560M", 560, "Value-Add", "Deploying", {
    description: "SFDR Article 9 climate transition fund investing in renewable energy infrastructure, energy solutions, and sustainable transportation across Asia-Pacific emerging markets. Portfolio: Renewables / Energy Transition: Argo Energy (Renewables Platform), Terra Solar (Solar)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Power Generation"],
    regions: ["Asia-Pacific"],
  }),

  // Allianz Global Investors
  f("FUND-008", "Allianz Global Investors", "Allianz European Infrastructure Fund II (AEIF II)", "2021", "€880M+", 968, "Core", "Deploying", {
    description: "Core infrastructure fund targeting brownfield essential services assets in Europe, including transportation, digital infrastructure, utilities, and renewables with regulated or contracted revenues. Portfolio: Digital Infrastructure: NÖGIG (Fiber Networks), Northstar (Data Centers), oeGIG (Fiber Networks), Queenspoint Platforms (Data Centers), Unsere Grüne Glasfaser (UGG) (Fiber Networks), XpFibre (Fiber Networks), Yondr Group (Data Centers); Transportation: Autostrade per l'Italia (ASPI) (Toll Roads), Chicago Parking Meters (Parking), IndInfravit Trust (Toll Roads), Metro de Barcelona Line 9 (Queenspoint) (Rail / Metro), Northrail (Rolling Stock Leasing), Porterbrook (Rolling Stock Leasing), Tank & Rast (Motorway Services); Utilities: Cadent Gas (Gas Distribution), Delgaz Grid (Gas & Electric Distribution), Elenia (Electricity Distribution), Floene (formerly GGND) (Gas Distribution), GasNet (Gas Distribution), Nedgia (Gas Distribution), NeuConnect (Interconnectors); Renewables / Energy Transition: Dargikowo and Karlino (ENERTRAG) (Wind), Fuella AS (Biofuels), He Dreiht (Offshore Wind), Kyon Energy Storage Portfolio (Battery Storage), Ren-Gas (Green Hydrogen); Midstream / Energy: Gas Connect Austria (GCA) (Gas Transmission), Gassled (Gas Pipelines), NET4GAS (Gas Transmission); Water: Affinity Water (Water Supply), Thames Tideway Tunnel (Wastewater); Communications: ATC Europe (Towers); Social Infrastructure: Colchester Garrison (Military Housing)",
    sectors: ["Transportation", "Digital Infrastructure", "Utilities", "Renewables / Energy Transition"],
    regions: ["Europe"],
  }),

  // Amber Infrastructure
  f("FUND-009", "Amber Infrastructure", "International Public Partnerships (INPP)", "2006", "£3.0B+", 3900, "Core", "Evergreen", {
    description: "FTSE 250-listed infrastructure investment company targeting availability-based and regulated public infrastructure assets globally, including schools, hospitals, transport, and utility networks. Portfolio: Utilities: Barrow OFTO (Electricity Transmission), Beatrice OFTO (Electricity Transmission), Cadent Gas (Gas Distribution), City Light & Power (Electricity Distribution), East Anglia One OFTO (Electricity Transmission), Lincs OFTO (Electricity Transmission), Moray East OFTO (Electricity Transmission), Ormonde OFTO (Electricity Transmission), UK Offshore Transmission Owners (OFTOs) (Electricity Transmission); Social Infrastructure: Building Schools for the Future (BSF) Portfolios (Education PPP), Dublin Criminal Courts (Courts PPP), Durham Region Courthouse (Courts PPP), Family Housing for Service Personnel (Military Housing), New Zealand Schools (Education PPP), Police Headquarters South-East Hesse (Government PPP), Royal Children's Hospital (Healthcare PPP), Wakatipu High School (Education PPP); Transportation: Angel Trains (Rolling Stock Leasing), BeNEX (Rail), Diabolo Rail Link (Rail), Gold Coast Light Rail (Light Rail), RailFirst (Rolling Stock Leasing), Reliance Rail (Rolling Stock Leasing); Digital Infrastructure: Community Fibre (Fiber Networks), iseek (Data Centers), toob (Fiber Networks), YourDC (Data Centers); Logistics: Maine International Cold Storage Facility (Cold Storage); Power Generation: Sizewell C (Nuclear); Renewables / Energy Transition: Groveland Mine Solar (Solar); Water: Thames Tideway Tunnel (Wastewater)",
    sectors: ["Social Infrastructure", "Transportation", "Utilities", "Digital Infrastructure"],
    regions: ["Europe", "North America", "Asia-Pacific"],
    structure: "Listed / Evergreen",
    ticker: "INPP.L",
  }),
  f("FUND-010", "Amber Infrastructure", "US Solar Fund plc (USF)", "2019", "~$250M", 250, "Core", "Evergreen", {
    description: "London-listed closed-end investment company investing in a diversified portfolio of operational solar power assets in the United States with long-term power purchase agreements. Portfolio: Renewables / Energy Transition: USF Solar Portfolio (Solar)",
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
    description: "Geopolitically-driven infrastructure fund investing in energy, transportation, and digital infrastructure connecting Central and Eastern European countries between the Baltic, Adriatic, and Black Seas. Portfolio: Renewables / Energy Transition: Enery (Solar & Wind), R.Power Renewables (Solar); Digital Infrastructure: Greenergy Data Centers (Data Centers); Logistics: BMF Port Burgas (Ports); Transportation: Cargounit (Rolling Stock Leasing)",
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Europe"],
  }),

  // Ancala Partners
  f("FUND-014", "Ancala Partners", "Ancala Infrastructure Fund III", "2022", "€1.4B", 1540, "Core-Plus", "Deploying", {
    description: "Mid-market core-plus infrastructure fund investing in essential infrastructure businesses across the UK and Europe, including renewable energy, transport, utilities, water, and the circular economy. Portfolio: Renewables / Energy Transition: Croatian Biomass Platform (Biomass), HS Orka (Geothermal), Magnon Green Energy (Biomass), Noventa (Hydro), Orites (Onshore Wind), Solandeo (Solar); Transportation: Avincis (Aviation Services), Hector Rail (Rail Freight), Liverpool Airport (Airports), Phoenix Rail (Short-Line Rail); Midstream / Energy: SAGE (Ancala Midstream) (Gas Pipelines), Valentra (Chemical Pipelines); Utilities: Hausheld Group (Energy Services), Islands Energy Group (Multi-Utility); Communications: TorLoc Towers (Towers); Logistics: Fjord Base (Supply Base); Social Infrastructure: Iris Care Group (Healthcare); Waste / Environmental Services: MUCH Gruppe (Waste Management); Water: Ancala Water Services (Water Supply)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities", "Water", "Waste / Environmental Services"],
    regions: ["Europe"],
  }),

  // Antin Infrastructure Partners
  f("FUND-015", "Antin Infrastructure Partners", "Flagship Fund V", "2022", "€10.2B", 11220, "Value-Add", "Deploying", {
    description: "Antin's largest flagship fund targeting controlling equity investments in established infrastructure businesses across energy & environment, digital, transport, and social infrastructure in Europe and North America. Portfolio: Renewables / Energy Transition: Blue Elephant Energy (Solar & Wind), Opdenergy (Solar & Wind); Social Infrastructure: Consilium Safety Group (Fire Safety Systems), Portakabin (Modular Buildings); Transportation: Proxima (Velvet) (High-Speed Rail), Vigor Marine Group (Marine Services); Digital Infrastructure: NorthC Datacenters (Data Centers)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Social Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-016", "Antin Infrastructure Partners", "Mid Cap Fund I", "2021", "€2.2B", 2420, "Value-Add", "Deploying", {
    description: "Antin's inaugural mid-cap strategy targeting smaller infrastructure opportunities across energy & environment, digital, transport, and social sectors in Europe and North America. Portfolio: Transportation: Aquavista (Marinas), Lake State Railway Company (LSRC) (Rail), Swiftair (Air Cargo); Digital Infrastructure: Empire Access (Fiber Networks), Pulsant (Data Centers)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Social Infrastructure", "Waste / Environmental Services"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-017", "Antin Infrastructure Partners", "NextGen Fund I", "2021", "€1.2B", 1320, "Value-Add", "Deploying", {
    description: "Growth-oriented fund targeting next-generation digital and energy transition infrastructure, including fiber, data centers, EV charging, and distributed energy in Europe. Portfolio: Transportation: GTL Leasing (Hydrogen Equipment Leasing), Matawan (Smart Mobility), Power Dot (EV Charging), RAW Charging (EV Charging); Renewables / Energy Transition: Pearl (Distributed Energy), SNRG (Solar)",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Communications"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Growth"],
  }),

  // Apollo Global Management
  f("FUND-018", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund III", "2022", "$2.4B", 2400, "Value-Add", "Deploying", {
    description: "Mid-market value-add infrastructure fund making control-oriented equity investments in communications, power & renewables, transportation, and corporate carveouts in the US and Europe. Portfolio: Digital Infrastructure: FirstDigital Telecom (Fiber Networks), Hyperoptic (Fiber Networks), Intel Fab 34 JV (Semiconductor Fab), Stack Infrastructure (Data Centers), STACK Infrastructure Europe (Data Centers), Stream Data Centers (Data Centers), TierPoint (Data Centers), Yondr Group (Data Centers); Renewables / Energy Transition: Apterra Infrastructure Capital (Renewables Platform), Great Bay Renewables (Renewables Finance), Ionic Blue (Johnson Controls JV) (Building Automation), NextEra Energy Partners Renewable Portfolio (Wind & Solar), Summit Ridge Energy (Community Solar), WEC Energy Group Renewable Portfolio (Wind & Solar); Utilities: Corning Natural Gas Corporation (Gas Distribution), Cross-Sound Cable Company (Interconnectors), Duquesne Light Company (Electricity Distribution), Hudson Transmission Partners (Electricity Transmission), The State Group (Energy Services); Transportation: Freedom CNG (CNG Fueling), Modern Aviation (Aviation Services); Midstream / Energy: Trans Adriatic Pipeline (TAP) (Gas Pipelines); Power Generation: Caledonia Generating LLC (Gas-to-Power); Waste / Environmental Services: GFL Environmental Services (Waste Collection)",
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
    description: "Perpetual-life operating company investing in energy transition, communications and digital infrastructure, and transportation & logistics assets globally. Portfolio: Social Infrastructure: Tosca Holdco (Essential Services)",
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
    description: "European Long-Term Investment Fund providing retail and institutional investors access to clean energy transition infrastructure across Europe. Portfolio: Renewables / Energy Transition: Ionic Blue (Johnson Controls JV) (Building Automation), Purmo Group (Heating & Cooling), TotalEnergies Texas Solar & BESS Portfolio (Solar & Storage)",
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
    description: "Successor fund scaling industrial decarbonization investments in hard-to-abate sectors, targeting energy efficiency, circular economy, and low-carbon manufacturing infrastructure. Portfolio: Renewables / Energy Transition: Anesco (Solar & Storage), Fluitron (Hydrogen Equipment), USD Clean Fuels (Biofuels); Waste / Environmental Services: CycleØ (Recycling), Divert (Food Waste), Natural World Products (NWP) (Biomaterials); Digital Infrastructure: Centric Fiber (Fiber Networks); Midstream / Energy: Lincoln Terminal (Tank Storage)",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services", "Power Generation"],
    regions: ["North America"],
  }),

  // ArcLight Capital
  f("FUND-025", "ArcLight Capital", "ArcLight Infrastructure Partners Fund VIII", "2023", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "Value-add energy infrastructure fund investing in North American power generation, midstream, and renewable energy assets with operational improvement opportunities. Portfolio: Power Generation: Advanced Power (Gas-to-Power), Alpha Generation (AlphaGen) (Gas-to-Power), Eastern Generation (Gas-to-Power), Generation Bridge (Gas-to-Power), Griffith Energy (Gas-to-Power), Kleen Energy Systems (Gas-to-Power), Lordstown Energy Center (Gas-to-Power), Middletown Energy Center (Gas-to-Power), Parkway Generation (Gas-to-Power), Takanock (Gas-to-Power); Renewables / Energy Transition: Elevate Renewables (Wind & Solar), Infinigen Renewables (Wind), REC Solar (Solar), SkyVest Renewables (Wind), Swift Current Energy (Solar & Storage), Thunderbird Renewables (Wind); Midstream / Energy: Gulf Coast Express (GCX) (Gas Pipelines), Natural Gas Pipeline Company of America (NGPL) (Gas Pipelines), Naugatuck Avenue Storage (Gas Storage)",
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
    description: "Flagship core-plus infrastructure fund targeting essential mid-market assets in energy, transport, telecom, and social infrastructure across Europe and the Americas. Portfolio: Transportation: AFCO (Aviation Services), Ascendi (Toll Roads), ASTM (Toll Roads), Ataca and Pantac (Toll Roads), CampusParc (Parking), Clermont (Toll Roads), Heathrow Airport (Airports), LISEA (High-Speed Rail), Maple Leaf (Toll Roads), Milione SpA / Save SpA (Airports), SPMR (Rail), Tacna and Panamericana (Toll Roads), UNITe (EV Charging), Vespucio Norte Express & Túnel San Cristóbal (Toll Roads), Wintics (Smart Mobility); Renewables / Energy Transition: Akuo (Renewables Platform), Andberg Vind (Wind), GreenYellow (Distributed Solar), Hamnefjell Vinkraft (Wind), Honkajoki Wind Park (Wind), InEnergy Solar Italy (Solar), Novasol Invest La Isla (Solar), Skyline Renewables (Wind), Tolve Windfarms Holding (Wind); Digital Infrastructure: 3NEW / 4NEW (Fiber Networks), Adamo (Fiber Networks), Míla (Fiber Networks), MXT Holdings (Data Centers), Verne (Data Centers); Utilities: CGE Palea Arsa (Water & Wastewater), Energia & Servizi (Energy Services), EWE (Multi-Utility), Nevel (District Heating); Communications: INWIT (Towers), Unison (Towers); Midstream / Energy: Géosel (Oil Storage); Power Generation: Verlat Energy (Gas-to-Power); Social Infrastructure: ICQ Holding (Healthcare); Waste / Environmental Services: Attero (Waste-to-Energy)",
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
    description: "Open-end core infrastructure fund targeting essential assets with stable, contracted cash flows across transportation, utilities, and digital infrastructure globally. Portfolio: Renewables / Energy Transition: Apex Clean Energy (Wind & Solar), Distributed Solar Development (DSD) (Community Solar), Dynamic Renewables (Biogas), EDP Renováveis (EDPR) US Portfolio (Wind & Solar), ENGIE US Renewables Portfolio (Wind & Solar), Tango Holdings (Renewables Platform); Digital Infrastructure: Bluepeak (Fiber Networks), Prime Data Centers (Data Centers), Underline (Fiber Networks); Transportation: Atlas Crane Service (Equipment Services), Current Trucking (Logistics); Midstream / Energy: Meade Pipeline Co. (Gas Pipelines)",
    sectors: ["Transportation", "Utilities", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
    structure: "Open-End",
  }),

  // Argo Infrastructure Partners
  f("FUND-033", "Argo Infrastructure Partners", "Argo Infrastructure Partners Series 4", "2024", "Undisclosed", null, "Core", "Deploying", {
    description: "Core infrastructure fund targeting contracted and regulated essential services assets in North America, focusing on utilities, water, and transportation. Portfolio: Utilities: Corning Natural Gas (Gas Distribution), Cross-Sound Cable (Interconnectors), Hawaiʻi Gas (Gas Distribution), Hudson Transmission Partners (Electricity Transmission); Power Generation: Black Hills Colorado IPP (Gas-to-Power), Carville Energy Center (Gas-to-Power), Oneta Energy Center (Gas-to-Power); Transportation: FleetLogix (Fleet Management), Freight Ninja (Logistics), LAZ Parking (Parking); Renewables / Energy Transition: Onyx Renewable Partners (Solar), Smoky Mountain Hydro (Hydro); Water: Bayonne Water (Water & Wastewater), Middletown Water (Water Supply); Digital Infrastructure: TierPoint (Data Centers)",
    sectors: ["Utilities", "Water", "Transportation"],
    regions: ["North America"],
  }),

  // Astatine Investment Partners
  f("FUND-034", "Astatine Investment Partners", "Astatine Infrastructure Fund IV", "2020", "$586M", 586, "Core-Plus", "Deploying", {
    description: "Mid-market infrastructure fund investing in essential services businesses across North America and Europe, with a focus on energy, environmental services, and transportation. Portfolio: Transportation: ACL Airshop (Aviation Services), BTR (Big Truck Rental) (Truck Leasing), Kelling Group (Logistics), McKeil Marine (Marine Services), Twin Parking Holdings (Parking); Digital Infrastructure: Everfast Fiber Networks (Fiber Networks), Glide Group (Fiber Networks); Logistics: PECO Pallet (Pallet Pooling); Waste / Environmental Services: NRG Riverside (Waste-to-Energy)",
    sectors: ["Utilities", "Waste / Environmental Services", "Transportation"],
    regions: ["North America", "Europe"],
  }),

  // Asterion Industrial Partners
  f("FUND-035", "Asterion Industrial Partners", "Asterion Industrial Infra Fund III", "2024", "€3.4B", 3740, "Value-Add", "Deploying", {
    description: "Southern European-focused fund investing in industrial infrastructure including telecoms towers, fiber networks, energy, and environmental services with operational transformation. Portfolio: Renewables / Energy Transition: ABIO (Asterion Bioenergy) (Biogas), AMP Clean Energy (Biomass), Clubö (Heating & Cooling), Revalue Energies (Solar), Samso (Renewables Platform), Total Energies Greece Renewables JV (Wind & Solar); Digital Infrastructure: MS3 Networks (Fiber Networks), National Broadband Ireland (NBI) (Fiber Networks), Olin Group / Olivenet (Fiber Networks), Retelit / Irideos (Fiber Networks); Transportation: 2i Aeroporti (Airports), Asterion Aircraft Leasing Platform (Bluelease) (Aircraft Leasing); Utilities: Axion / Lineox (Gas Distribution), Compagnie Electrique de Bretagne (Electricity Distribution); Midstream / Energy: Dunkerque LNG (LNG); Waste / Environmental Services: Grupo SSG (Waste Management)",
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
    description: "First European vehicle extending Axium's core infrastructure approach to contracted and regulated assets across Western Europe, targeting renewables and social infrastructure. Portfolio: Renewables / Energy Transition: Axium Great Plains Wind LLC (Wind), BlueWave (Community Solar), Cedar Point II Wind Project (Wind), Constellation Renewables Partners (Renewables Platform), Copper Crossing Solar Facility (Solar), Crimson Storage (Battery Storage), Dry Lake II Wind Farm (Wind), Edwards Sanborn 1A & 1B (Solar & Storage), Grand Valley III Wind Farm (Wind), K2 Wind (Wind), Port Dover and Nanticoke Wind Project (Wind), Quality Wind Project (Wind), Travers Solar (Solar), Vents du Kempt Wind (Wind); Utilities: Georgetown University Utility System (District Energy), PUC Transmission LP (Electricity Transmission), The Ohio State University Utility System (District Energy), Upper Peninsula Power Company (UPPCO) (Electricity Distribution), Wind Energy Transmission Texas (WETT) (Electricity Transmission); Social Infrastructure: AgeCare UK / Optima Living JV (Senior Living), CHUM Research Centre PPP (Healthcare PPP), UMass Amherst Housing PPP (Student Housing), Vanderbilt Student Housing PPP (Student Housing); Power Generation: Brooklyn Navy Yard Cogeneration (Cogeneration), Cascade Power Project (Gas-to-Power), CPV Three Rivers (Gas-to-Power); Transportation: 407 ETR (Blue Jay Road Limited) (Toll Roads), Northwest Parkway (Toll Roads)",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure"],
    regions: ["Europe"],
    structure: "Open-End",
  }),

  // Basalt Infrastructure Partners
  f("FUND-042", "Basalt Infrastructure Partners", "Basalt Infrastructure Partners IV", "2023", "$4.0B", 4000, "Value-Add", "Deploying", {
    description: "Mid-market value-add fund targeting essential infrastructure businesses in OECD countries across transportation, utilities, energy, and digital sectors with active management. Portfolio: Transportation: Caronte & Tourist (Ferries), EnviroSpark (EV Charging), Fortbrand Services (Airport Ground Services), Nobina (Bus Services), Unilode Aviation Solutions (Aviation Services), Wightlink (Ferries); Digital Infrastructure: Altnet Partners / FullFibre (Zzoomm) (Fiber Networks), Connect Fibre (bn:t and SOCO) (Fiber Networks), Fatbeam (Fiber Networks), Goetel (Fiber Networks), OnSite Partners (Data Centers); Midstream / Energy: Freyja LNG (LNG), Vanadis LNG (LNG), Xpress Natural Gas (XNG) (CNG/LNG Distribution); Waste / Environmental Services: Chemco Ireland (Hazardous Waste), JR Richards & Sons (Waste Collection), Reconor (Waste Management); Communications: Manx Telecom (Telecoms), Skyway Towers (Towers); Renewables / Energy Transition: Go Lime (Simply Green) (Green Fuels), Habitat Solar (Solar); Utilities: Circle Infra Partners (Industrial Infrastructure), Iris (Water & Wastewater); Power Generation: Helios Power (Gas-to-Power)",
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
    description: "Core-plus fund targeting essential infrastructure assets and services companies in the utility, power, and environmental services sectors across North America. Portfolio: Power Generation: Allied Power (Power Plant Services), Elevation (Power Services); Utilities: Delta Utilities (Water & Wastewater Utility), New Mexico Gas Company (Gas Distribution); Water: ClearCurrent (Water Treatment), National Water Infrastructure (Water Infrastructure Services); Midstream / Energy: Epic Piping (Pipe Fabrication); Renewables / Energy Transition: Optimum Energy (Energy Efficiency); Transportation: RailWorks (Rail Infrastructure Services); Waste / Environmental Services: Green Meadow Sustainable Solutions (Biosolids Management)",
    sectors: ["Utilities", "Power Generation", "Waste / Environmental Services"],
    regions: ["North America"],
  }),

  // BlackRock
  f("FUND-046", "BlackRock", "BlackRock Global Infrastructure Fund IV", "2022", "$6.1B", 6100, "Core-Plus", "Deploying", {
    description: "Global diversified infrastructure fund investing in transportation, energy, utilities, and digital infrastructure across developed and select emerging markets. Portfolio: Renewables / Energy Transition: Akaysha Energy (Battery Storage), DSD Renewables (Community Solar), Jupiter Power (Battery Storage), Recurrent Energy (Solar & Storage), Vanguard Renewables (Biogas); Digital Infrastructure: Gigapower (Fiber Networks), True IDC (Data Centers); Midstream / Energy: Kellas Midstream (Gas Processing); Transportation: GasLog (LNG Shipping); Utilities: Calisen (Smart Metering); Waste / Environmental Services: Biffa (Waste Management)",
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
    description: "Mid-market infrastructure fund targeting smaller essential infrastructure assets across energy, transport, and digital sectors globally with hands-on operational improvement. Portfolio: Renewables / Energy Transition: ACS Renewables (Wind & Solar), Atlas Renewable Energy (Solar), Bluepoint Wind (Offshore Wind), Borkum Riffgrund 2 (Offshore Wind), Clearway Energy Group (Diversified Renewables), Eni CCUS Holding (Carbon Capture), Eolian (Wind), Gode Wind 1 (Offshore Wind), Hornsea 1 (Offshore Wind), Skyborn Renewables (Offshore Wind), Vena Energy (Wind & Solar); Transportation: Edinburgh Airport (Airports), Gatwick Airport (Airports), Great Yarmouth Port (Ports), Italo (NTV) (Rail), Malaysia Airports Holdings Berhad (Airports), Peel Ports (Ports), Signature Aviation (FBO / Aviation), Sydney Airport (Airports), TCR Group (Airport Ground Equipment), Terminal Investment Limited (Ports), Tramarsa (Ports); Midstream / Energy: ADNOC Gas Pipelines (Pipelines), Gladstone LNG Project (LNG), Hess Midstream Partners (Gathering & Processing), Jafurah Midstream Gas Company (Gas Processing), Pluto Train 2 (LNG), QCLNG Common Facilities (LNG), Rio Grande LNG (LNG), Ruby Pipeline (Pipelines), TransitGas (Gas Transmission); Utilities: AES Corporation (Electric Utilities), Naturgy Energy Group (Gas & Electric Utilities), Scotia Gas Networks (SGN) (Gas Distribution), SUEZ Group (Water & Waste); Communications: Ascend Telecom Infrastructure (Towers), Vantage Towers AG (Towers); Digital Infrastructure: Aligned Data Centers (Data Centers), CyrusOne (Data Centers); Power Generation: Channelview Cogeneration (Cogeneration), Saavi Energía (Gas-to-Power)",
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
    description: "Open-ended permanent capital vehicle investing in large-scale infrastructure assets across energy, transportation, digital, and water/waste sectors, applying an operationally intensive buy-and-hold approach. Portfolio: Transportation: AGS Airports (Airports), Applegreen (Motorway Services), Autostrade per l'Italia (Mundys) (Toll Roads), Carrix / SSA Marine (Port Terminals), Safe Harbor Marinas (Marinas); Midstream / Energy: Cheniere Energy Partners (LNG Export), Neysa (Gas Processing), Port Arthur LNG Phase 2 (LNG Export), Tallgrass Energy (Gas Pipelines); Digital Infrastructure: AirTrunk (Data Centers), QTS Data Centers (Data Centers), Symphony Infrastructure Partners (Fiber Networks); Utilities: Atlantic Power Transmission LLC (Electricity Transmission), FirstEnergy (Electric Utility), NiSource (NIPSCO) (Gas & Electric Utility); Renewables / Energy Transition: Invenergy Renewables (Renewables Platform); Waste / Environmental Services: Urbaser (Waste Management)",
    sectors: ["Power Generation", "Transportation", "Digital Infrastructure", "Water", "Renewables / Energy Transition", "Utilities", "Midstream / Energy", "Communications"],
    regions: ["North America", "Europe"],
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
    description: "World's largest closed-end private infrastructure fund targeting high-quality essential assets driven by digitalization, decarbonization, and deglobalization themes globally.",
    sectors: ["Utilities", "Transportation", "Midstream / Energy", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
  }),
  f("FUND-059", "Brookfield Asset Management", "Brookfield Super-Core Infrastructure Partners", "2018", "$15.5B", 15500, "Core", "Evergreen", {
    description: "Open-end super-core fund targeting the highest-quality regulated and contracted infrastructure assets with utility-like returns in transportation, utilities, and renewables. Portfolio: Digital Infrastructure: Compass Datacenters (Data Centers), Cyxtera (Evoque) (Data Centers), Data4 (Data Centers), GD Towers (Towers), Hotwire Communications (Fiber Networks), Intel Semiconductor Fab JV (Semiconductor Fab), Valokuitunen (Fiber Networks), Wireless Infrastructure Group (WIG) (Towers); Midstream / Energy: Inter Pipeline (Pipelines & Petrochemicals), Lodi Gas Storage (Gas Storage), Natural Gas Pipeline Company of America (Gas Pipelines), NorthRiver Midstream (Gas Processing), Nova Transportadora do Sudeste (NTS) (Gas Pipelines), Pipeline Infrastructure (Gas Pipelines), Rockpoint Gas Storage (Gas Storage), Warwick Gas Storage (Gas Storage); Renewables / Energy Transition: Deriva Energy (Renewables Platform), Neoen (Solar, Wind & Storage), Northview Energy (Solar & Storage), OnPath Energy (Offshore Wind), Scout Clean Energy (Wind & Solar), Thermondo (Heat Pumps), Urban Grid (Solar), X-ELIO (Solar); Utilities: AusNet Services (Electricity & Gas Distribution), BOXT Ltd (Home Energy Services), BUUK Infrastructure (Multi-Utility Networks), Enercare (Home Services), FirstEnergy Transmission (FET) (Electricity Transmission), Metergy Solutions (Smart Metering), Trans Bay Cable (Electricity Transmission), Vanti S.A. ESP (Gas Distribution); Transportation: Arteris (Toll Roads), Genesee & Wyoming (Short-Line Rail), Rutas de Lima (Toll Roads), VLI (Rail & Port Logistics); Power Generation: Holtwood (Hydroelectric), Westinghouse Electric (Nuclear Services); Communications: TDF (Broadcast Infrastructure); Logistics: Triton International (Container Leasing)",
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
    description: "Value-add fund targeting middle-market essential infrastructure businesses across OECD markets, with a focus on building and scaling platforms in transportation, digital, renewables, and midstream energy. Portfolio: Renewables / Energy Transition: AlphaStruxure (Energy-as-a-Service), Amp Energy (Renewables Platform), Aspen Power (Community Solar), Copia Power (Solar & Storage), Fermata Energy (Vehicle-to-Grid), NineDot Energy (Battery Storage); Digital Infrastructure: ark data centers (formerly Involta) (Data Centers), Tillman Infrastructure (Towers), Wyyerd Fiber Group (Fiber Networks); Power Generation: Revera Energy (Flexible Generation), Telis Energy (Gas-Fired Power); Transportation: London Southend Airport (Airports), New Terminal One (JFK Airport) (Airport Terminals); Midstream / Energy: Crescent Midstream (Marine Terminals)",
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition", "Midstream / Energy", "Logistics"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-065", "Carlyle Infrastructure", "Carlyle Renewable & Sustainable Energy Fund II", "2022", "$2.0B", 2000, "Value-Add", "Deploying", {
    description: "Dedicated clean energy fund investing in solar, wind, storage, and other renewable energy assets and platforms in North America and Europe.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["North America", "Europe"],
  }),

  // CBRE Investment Management
  f("FUND-066", "CBRE Investment Management", "CBRE Musselshell Infrastructure Investments", "2022", "$100M", 100, "Core-Plus", "Deploying", {
    description: "Niche infrastructure fund targeting small-to-mid-scale essential infrastructure investments in North America with a focus on energy and utility assets. Portfolio: Digital Infrastructure: Accelerate Infrastructure Opportunities (Infrastructure Platform), CitySwitch (Data Centers), Gateway Fiber (Fiber Networks), Vantage Data Centers (Stabilized Portfolio) (Data Centers), WANRack (Fiber Networks); Renewables / Energy Transition: ClearGen Holdings (Distributed Generation), Geonova (Geothermal); Transportation: Connect Bus (Bus Services), Norled AS (Ferry Services)",
    sectors: ["Utilities", "Power Generation"],
    regions: ["North America"],
  }),

  // CIM Group
  f("FUND-067", "CIM Group", "CIM Infrastructure Fund III", "2021", "$1.76B", 1760, "Value-Add", "Deploying", {
    description: "Value-add fund investing in assets supporting the optimization, sustainability, and digitalization of infrastructure underpinning North American communities, including renewables, waste-to-value, and data centers. Portfolio: Renewables / Energy Transition: Aquamarine Solar Project (Solar), Ecoppia (Solar Robotics), SolarBank JV (Community Solar), Terreva Renewables (Renewables Platform); Digital Infrastructure: Novva Data Centers (Data Centers); Power Generation: Westlands Electric Power Company (Solar & Storage); Waste / Environmental Services: Bolder Industries (Tire Recycling); Water: Antelope Valley Water Bank (Water Storage)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Waste / Environmental Services", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
  }),

  // Copenhagen Infrastructure Partners
  f("FUND-068", "Copenhagen Infrastructure Partners", "Copenhagen Infrastructure V (CI V)", "2023", "€12.0B", 13200, "Core-Plus", "Deploying", {
    description: "Flagship renewable energy fund investing in large-scale offshore wind, onshore wind, solar PV, and Power-to-X projects globally with greenfield development capabilities. Portfolio: Renewables / Energy Transition: 7SeasMed (Offshore Wind), Alcemi (Green Hydrogen), BKV dCarbon Ventures JV (Carbon Capture), Catalina (Offshore Wind), Changfang & Xidao (Offshore Wind), Chile HNH (Green Hydrogen), CIP Fund Solutions (Platform), CIP Molecule Technologies (Green Hydrogen), CIP Terra Technologies (Onshore Renewables), Copenhagen Offshore Partners (COP) (Offshore Wind), Energy Island (VindØ) (Offshore Wind), Fengmiao (Offshore Wind), Fighting Jays (Onshore Wind), Fjord (Offshore Wind), Greasewood (Solar), Haesong 1 & 3 (Offshore Wind), Haewoori 1, 2, 3 (Offshore Wind), Hokkaido (Offshore Wind), Horizon New Energy (Solar), Høst (Biomass / Biogas), Hydrogen Island (BrintØ) (Green Hydrogen), Ichnusa Wind Power (Onshore Wind), Iverson (Onshore Wind), Jeonnam 1, 2, 3 (Offshore Wind), Liberty Renewables (Onshore Renewables), Madoqua (Green Hydrogen), Misae (Green Hydrogen), Mitchell (Onshore Wind), Monegros (Solar), Mulilo (Onshore Renewables), Murchison (Onshore Renewables), NISA and Bore Array (Offshore Wind), Northwich Biogas Plant (Biomass / Biogas), Nurax (Onshore Wind), Ørsted European Onshore Business (Onshore Renewables), Ossian Floating Offshore Wind Farm (Offshore Wind), Pentland Floating Offshore Wind Farm (Offshore Wind), Poseidon (Offshore Wind), Sage (Onshore Wind), St. Charles (Biomass / Biogas), Star of the South (Offshore Wind), Sunfire (Green Hydrogen), Taean (Offshore Wind), Taiwan New Sites (Offshore Wind), Tønder Biogas (Biomass / Biogas), Tyrrhenian (Offshore Wind), Unicus (Onshore Renewables), Vineyard Northeast (Offshore Wind), Vineyard Wind 1 (Offshore Wind), Zeevonk (Offshore Wind), Zhong Neng (Offshore Wind)",
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
    description: "European mid-market fund investing in essential infrastructure in public transport, fiber/telecom networks, and renewable energy with long-term contracted revenues. Portfolio: Digital Infrastructure: Asteo Red Neutra (Fiber Networks), ClioFiber (Fiber Networks), CubIKS GmbH (Fiber Networks), dstelecom (Fiber Networks), Fibernet (Fiber Networks), firstcolo (Data Centers), G.Network (Fiber Networks), Glesys (Data Centers), Heliot (IoT Networks), Rede Aberta (Fiber Networks), RUNE Crow (Fiber Networks), RUNE Enia (Fiber Networks), Unifiber (Fiber Networks); Transportation: Bergkvara (Mekka Traffic) (Traffic Services), CFTR (Rail), Dispam (Bus Services), Kople (EV Charging), Métropolis (EV Charging), Müller Transporte (Rail Freight), Osprey (EV Charging), Stations-e (EV Charging); Renewables / Energy Transition: GRECO (Solar), Green Energy Platform (Solar), Norsk Vannkraft (Hydropower), Varanger Kraftvind (Onshore Wind); Waste / Environmental Services: RiverRidge (Waste Management), Sepur (Waste Collection), Verdis (Waste Collection); Power Generation: Cogeninfra (Cogeneration); Utilities: ENETIQA (District Heating)",
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
    description: "Flagship core-plus fund investing in essential European infrastructure across energy, transportation, telecom, and social infrastructure with contracted cash flows. Portfolio: Renewables / Energy Transition: BALANCE (Biogas), Gabriela Project (Solar & Battery Storage), Low Carbon (Solar & Wind); Utilities: CARMA Corp (Submetering), JW Water Holdings (Water & Wastewater), Public Power Corporation (PPC) (Electric Utilities); Communications: Manx Telecom Group (Telecoms); Digital Infrastructure: Celeste (Fiber Networks); Midstream / Energy: Exolum (Pipelines & Storage); Transportation: iPark (Parking)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Communications", "Social Infrastructure"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-074", "CVC DIF", "CVC DIF Value-Add IV", "2025", "€2.0B", 2200, "Value-Add", "Raising", {
    description: "Value-add fund targeting infrastructure businesses requiring active management and operational improvement in energy transition, digital, and transport sectors.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["Europe"],
  }),
  f("FUND-075", "CVC DIF", "DIF Infrastructure VII", "2022", "€4.40B", 4840, "Core", "Deploying", {
    description: "Core infrastructure fund investing in contracted and regulated essential assets in European energy, PPP/social infrastructure, and telecom with availability-based revenues. Portfolio: Renewables / Energy Transition: Alight (Solar), Diverso Energy (Geothermal), Enso Green Holdings (Solar & Wind), Field Energy (Battery Storage), GS Power Partners (Distributed Solar), Novar (Solar), Ottoway Portfolio Holdings (Solar), Qair (Wind & Solar); Digital Infrastructure: ielo (Fiber Networks), metrofibre (Fiber Networks), RFNOW (Fiber Networks), ruhrfibre (Fiber Networks), TDF Fibre (Fiber Networks), Tonaquint Data Centers (Data Centers), Valoo (Fiber Networks); Utilities: Bernhard, LLC (Energy Services), Loimua (District Heating), PAL Cooling Holding (District Cooling), Pinnacle Power (District Heating); Transportation: Cross River Rail PPP (Rail), Fjord1 (Ferries), Rail First (Rail); Social Infrastructure: Bankside House (Student Housing), North and South Schools PPP (Education); Waste / Environmental Services: Adam Ecotech (Environmental Services), Dublin Waste-to-Energy (Waste-to-Energy); Communications: Airtower Networks (Towers)",
    sectors: ["Renewables / Energy Transition", "Social Infrastructure", "Communications", "Transportation", "Utilities", "Water"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-076", "CVC DIF", "DIF Core-Plus Infrastructure Fund III (CIF III)", "2022", "€1.60B", 1760, "Core-Plus", "Deploying", {
    description: "Core-plus fund targeting medium-risk infrastructure assets in energy transition, digital, and transportation with a mix of contracted and merchant revenue exposure.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation"],
    regions: ["Europe"],
  }),

  // DigitalBridge
  f("FUND-077", "DigitalBridge", "DigitalBridge Partners III", "2023", "$7.2B", 7200, "Value-Add", "Deploying", {
    description: "Flagship digital infrastructure fund investing in data centers, cell towers, fiber networks, and edge computing infrastructure globally. Portfolio: Digital Infrastructure: AIMS (Data Centers), Aptum Technologies (Data Centers), AtlasEdge (Edge Data Centers), Beanfield Metroconnect (Fiber Networks), DataBank (Data Centers), Fibernow (Fiber Networks), Mundo Pacifico (Fiber Networks), Netomnia (Fiber Networks), Orange Barrel Media (Digital Signage), Scala Data Centers (Data Centers), Switch (Data Centers), Vantage Data Centers (APAC) (Data Centers), Vantage Data Centers (EMEA) (Data Centers), Vantage Data Centers (North America) (Data Centers), Vantage SDC (Data Centers), Xenith IG (Data Centers), Yondr Group (Data Centers), Zayo Group Holdings (Fiber Networks); Communications: Andean Telecom Partners (ATP) (Towers), Boingo Wireless (Wi-Fi / DAS), Digita Oy (Broadcast / Towers), EdgePoint Infrastructure (Towers), Freshwave Group (Small Cells / DAS), GD Towers (Towers), Highline do Brasil (Towers), JTOWER (Towers), Landmark Dividend (Ground Leases), Mexico Telecom Partners (Towers), Vertical Bridge (Towers)",
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
    description: "Mid-market fund targeting digital and traditional infrastructure across emerging markets, including towers, fiber, transportation, and energy assets. Portfolio: Transportation: Australia Pacific Airports Corporation (APAC) (Airports), ConGlobal (Intermodal Services), Leeds Bradford Airport (Airports), London Luton Airport (Airports), Newcastle International Airport (Airports), ZeMobility (EV Fleet Solutions); Digital Infrastructure: Expedient (Data Centers), Freedom Fibre / VX Fiber (Fiber Networks); Communications: Telecom Infrastructure Partners (TIP) (Towers); Power Generation: Invenergy AMPCI Thermal Power (Gas-to-Power); Social Infrastructure: Achieve Together (Specialist Care)",
    sectors: ["Digital Infrastructure", "Communications", "Transportation", "Power Generation"],
    regions: ["Asia-Pacific", "Middle East & Africa"],
  }),

  // DWS Infrastructure
  f("FUND-081", "DWS Infrastructure", "Pan-European Infrastructure Fund IV", "2024", "€4.0B", 4400, "Core-Plus", "Deploying", {
    description: "Core-plus fund investing in mid-market essential European infrastructure across transportation, energy, digital, and environmental services with active asset management. Portfolio: Transportation: Grandi Stazioni Retail (Rail Stations), Hansea (Bus / Coach), SAVE (Airports), Stagecoach Group (Bus Services), Streem (fka Ermewa) (Rail Freight); Renewables / Energy Transition: Cleanwatts (Energy Communities), Maaselänkangas Wind Farm (Onshore Wind), Weltec Holding GmbH (Biogas); Digital Infrastructure: Deutsche GigaNetz (Fiber Networks), NorthC Datacenters (Data Centers); Social Infrastructure: Ergéa Group (Medipass) (Healthcare)",
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
    description: "Energy infrastructure fund investing across the energy value chain including LNG, midstream, power generation, and energy transition assets globally. Portfolio: Renewables / Energy Transition: Avantus (Solar), Bioenergy Infrastructure Group (Biomass / Biogas), Cerro Dominador (Concentrated Solar), Fidra Energy (Offshore Wind), HIF Global (Green Fuels), Industrial Sun (Solar), Prosolia Energy (Solar), SunLight General Capital (Solar); Midstream / Energy: Aethon Energy (Natural Gas E&P), GNL Quintero (LNG), MidOcean Energy (LNG), Ocyan (Offshore Services), Transportadora de Gas del Peru (TGP) (Pipelines); Transportation: Prumo Logistica (Ports)",
    sectors: ["Midstream / Energy", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global"],
  }),

  // Ember Infrastructure
  f("FUND-085", "Ember Infrastructure", "Ember Infrastructure Fund II", "2024", "$831M", 831, "Value-Add", "Deploying", {
    description: "Middle-market platform delivering capital solutions to businesses that reduce carbon intensity and enhance resource efficiency across energy, water, waste, and industrial infrastructure. Portfolio: Utilities: Ground/Water Treatment & Technology (GWTT) (Water Treatment), H2O Innovation (Water Treatment), Lama Sistemas de Filtrado (Water Filtration), Low Impact Development Technologies (Stormwater Management), OnSyte Performance (Water & Wastewater); Renewables / Energy Transition: Caban Systems (Battery Storage), ReGenerate Energy (Biogas), SunShare (Community Solar); Waste / Environmental Services: Advanced Recycling Technologies (Recycling), Earthwise Environmental Solutions (Environmental Services)",
    sectors: ["Renewables / Energy Transition", "Water", "Waste / Environmental Services", "Power Generation"],
    regions: ["North America"],
  }),

  // EnCap Investments
  f("FUND-086", "EnCap Investments", "EnCap Flatrock Midstream Fund V", "2023", "$1.0B", 1000, "Value-Add", "Deploying", {
    description: "Midstream-focused fund investing in natural gas gathering, processing, and transportation infrastructure serving North American shale basins.",
    sectors: ["Midstream / Energy"],
    regions: ["North America"],
  }),
  f("FUND-087", "EnCap Investments", "EnCap Energy Transition Fund II", "2023", "$1.5B", 1500, "Value-Add", "Deploying", {
    description: "Energy transition fund investing in renewable power, battery storage, renewable fuels, and carbon management infrastructure across North America. Portfolio: Renewables / Energy Transition: Aither Systems (Energy Management), Arbor Renewable Gas (RNG), Bildmore Clean Energy (Solar), Catalyze (Solar), Linea Energy (Wind), Parliament Energy (Wind & Solar), PowerTransitions (Solar), SolarProponent (Solar); Digital Infrastructure: Quantica Infrastructure (Data Center Infrastructure)",
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
    description: "Large-cap energy infrastructure fund investing in power generation, renewables, energy storage, and grid infrastructure across North America. Portfolio: Renewables / Energy Transition: Atlantica Sustainable Infrastructure (Diversified Renewables), Avolta Renewable Holdings (Wind & Solar), Braya Renewable Fuels (Renewable Fuels), Convergent Energy and Power (Battery Storage), DataWatt (Behind-the-Meter Solar), Harvestone Low Carbon Partners (Renewable Fuels), New Leaf Energy (Solar), Pivot Energy (Community Solar), Reflectance Energy (Solar), Triple Oak Power (Wind); Power Generation: Cornerstone Generation (Gas-to-Power), Next Wave Energy Partners (Gas-to-Power), PROENERGY (Gas Turbines); Waste / Environmental Services: Biffa (Waste Management), Gopher Resource (Battery Recycling), Restaurant Technologies (Used Oil Recycling); Communications: Shenandoah Telecommunications (Shentel) (Fiber & Broadband); Digital Infrastructure: CyrusOne JV (Bosque Campus) (Data Centers); Midstream / Energy: Grain LNG (LNG); Utilities: Green Infrastructure Partners (Infrastructure Services)",
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
    description: "Core infrastructure fund investing in Swiss and European hydropower, grid infrastructure, and regulated energy utilities with long-term concession-based revenues. Portfolio: Renewables / Energy Transition: Arkona (Offshore Wind), BayWa r.e. (Wind & Solar), Boralex France (Wind & Solar), Electra (EV Charging), Mirror (Solar), Nysäter (Onshore Wind), Plenitude (Diversified Renewables), Repsol Renewables (Wind & Solar), Sunscreen (Solar), Wikinger (Offshore Wind); Midstream / Energy: Fluxys (Gas Transmission), Transitgas (Gas Transmission); Power Generation: Alpiq (Hydropower & Trading); Utilities: Swissgrid (Electricity Transmission)",
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
    description: "Largest-ever European infrastructure fund making control-oriented value-add investments in digital, energy/environmental, transport/logistics, and social infrastructure across Europe, North America, and Asia-Pacific. Portfolio: Social Infrastructure: Ariston Education (Education), Colisee (Healthcare), Evidia (Healthcare), Icon Group (Healthcare), Levande (Senior Living), Metlifecare (Senior Living), Parques Reunidos (Leisure Parks), SK Shieldus (Security Services), Trescal (Calibration Services), Universidad Europea (Education); Renewables / Energy Transition: Cypress Creek Renewables (Solar), Madison Energy Infrastructure (Solar), O2 Power (Wind & Solar), OX2 (Wind & Solar), Scale Microgrids (Microgrids), Statera (Battery Storage), Tion Renewables (Wind & Solar), Zelestra (Solar); Digital Infrastructure: DELTA Fiber (Fiber Networks), Deutsche Glasfaser (Fiber Networks), EdgeConneX (Data Centers), GlobalConnect (Fiber Networks), Lumos Fiber (Fiber Networks), Segra (Fiber Networks), Zayo (Fiber Networks); Transportation: Constellation Cold Logistics (Cold Storage), Eagle Railcar Services (Rail Services), First Student (School Bus), InstaVolt (EV Charging), Lazer Logistics (Yard Management), Nordic Ferry Infrastructure (Ferries), Ocea Group (Maritime); Utilities: AES (Electric Utilities), Calisen Group (Smart Metering), Osmose Utilities Services (Utility Services), Radius (Smart Metering), SAUR (Water & Wastewater), Seven Seas Water Group (Water Desalination), Yorkshire Water (Kelda Holdings) (Water & Wastewater); Waste / Environmental Services: Arcwood Environmental (Wood Waste Recycling), Cirba Solutions (Battery Recycling), Encyclis (Waste-to-Energy), Rena (KJ Environment) (Industrial Cleaning), Reworld (Waste-to-Energy), Urbaser (Waste Management)",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Logistics", "Social Infrastructure", "Waste / Environmental Services"],
    regions: ["North America", "Europe", "Asia-Pacific"],
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
    description: "Core infrastructure fund investing in UK PPP/PFI social infrastructure including schools, hospitals, courts, and essential public facilities with availability-based revenues. Portfolio: Renewables / Energy Transition: Andion (Biogas), Baseload Capital (Geothermal), Beatrice Offshore Windfarm (Offshore Wind), Bio Capital (Biogas), Bio Energy Base (BEE) (Biogas), Cornerstone (Solar), Cowdown Solar (Solar), Eelpower Energy (Battery Storage), Enpal (Rooftop Solar), Eskilstuna Bio-LNG plant (Bio-LNG), Gode Wind 1 (Offshore Wind), Greater Gabbard OFTO (Offshore Transmission), Hornsea One (Offshore Wind), Seagreen Phase 1 (Offshore Wind), Sheringham Shoal Offshore Wind Farm (Offshore Wind), Spanish Hybridisation Portfolio (Solar & Storage), Triton Knoll (Offshore Wind), Ventus Investments (Onshore Wind); Transportation: Agility Trains East (Rolling Stock), Agility Trains West (Rolling Stock), Air Tanker (Aviation), Aurora Infrastructure OY (Ports), Crossrail (Rail), High Speed 1 (Rail), M25 (Toll Roads); Social Infrastructure: Balfour Beatty OFTO and PPP Portfolio (PPP/PFI), Capital Hospitals Limited (Healthcare), Equitix Proton Cancer Centre (Healthcare), Forth Health Ltd (Healthcare), PJ Healthcare Support (Healthcare), Royal Papworth Hospital (Healthcare); Utilities: Calisen (Smart Metering), Crail Meters Limited (Smart Metering), Dalmuir Waste Water Treatment (Water & Wastewater), Grain Connect (Gas Interconnector), Great Britain and Ireland Interconnector (Electricity Interconnector); Digital Infrastructure: Local Connect (Fiber Networks), Oman Tech Infrastructure SAOC (Data Centers), Telecom Castilla La Mancha (Fiber Networks); Waste / Environmental Services: Viridor Energy (Waste-to-Energy)",
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
    description: "North American mid-market fund investing as a control investor with a developer mindset in energy transition, digital, social, and transportation infrastructure. Portfolio: Social Infrastructure: Alberta P3 Schools Bundle 5 (Education), Clackamas County Circuit Courthouse (Civic), Fengate-MedCraft Portfolio (Healthcare), Fengate-Montecito Medical Portfolio (Healthcare), Lambton College Residence (Student Housing), New Perspective Portfolio (Senior Housing), Oakville Trafalgar Memorial Hospital (Healthcare), Prince George's County Public Schools (Education), The Peter Gilgan Mississauga Hospital (Healthcare); Power Generation: Central Utility Block (Cogeneration), Freeport Energy Center (Gas-to-Power), Morris Cogeneration Facility (Cogeneration), Texas Cogeneration Facility (Dow Freeport site) (Cogeneration); Renewables / Energy Transition: Alpha Omega Power / Vertus Energy Storage (Battery Storage), Ironclad Energy Ventures (Solar & Storage), Prairie Switch Wind project (Onshore Wind); Transportation: Edmonton Valley Line LRT - Southeast (Light Rail), John F. Kennedy International Airport Terminal 6 (Airports); Digital Infrastructure: eStruxture Data Centers (Data Centers)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure", "Transportation"],
    regions: ["North America"],
  }),
  f("FUND-100", "Fengate Asset Management", "Fengate Infrastructure Yield Fund", "2019", "$1.22B", 1220, "Core", "Evergreen", {
    description: "Core open-ended fund providing stable income through investments in operational North American infrastructure assets across energy transition, digital, social, and transportation sectors.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure", "Transportation"],
    regions: ["North America"],
    structure: "Open-End",
  }),

  // Generate Capital
  f("FUND-101", "Generate Capital", "Generate Capital (Permanent Capital Vehicle)", "2014", ">$14.0B", 14000, "Core-Plus", "Evergreen", {
    description: "Permanent capital platform investing in sustainable infrastructure across distributed energy, water, waste, transportation, and agriculture with a focus on resource efficiency. Portfolio: Renewables / Energy Transition: Ambient Fuels (Clean Fuels), Amp Americas (Renewable Natural Gas), Cultivate Power (Community Solar), Enfinity Global (Solar), esVolta (Battery Storage), Nexamp (Community Solar), Pacific Steel Group (Green Steel), Plug Power (Project/SPV Level) (Green Hydrogen), Ubiquity (Ubiquity Management) (Distributed Energy), Viridis Initiative (Carbon Capture); Transportation: Clean Bus Solutions (Electric Buses); Utilities: GrowUp Farms (Vertical Farming); Waste / Environmental Services: Generate Upcycle (Recycling)",
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
    description: "Value-add fund targeting mid-to-large-cap infrastructure businesses in energy, transport, and digital sectors with operational improvement opportunities. Portfolio: Digital Infrastructure: CityFibre (Fiber Networks), Elea Digital (Data Centers), Global Compute Infrastructure (Data Centers), ImOn Communications (Fiber & Broadband), Melita Ltd (Fiber & Broadband); Renewables / Energy Transition: BrightNight (Hybrid Renewables), GridStor (Battery Storage), Synthica Energy (RNG), Verdalia Bioenergy (Biomass); Waste / Environmental Services: Liquid Environmental Solutions (Liquid Waste), Synagro Technologies (Biosolids); Midstream / Energy: HES International (Bulk Terminals); Social Infrastructure: Adapteo (Modular Buildings); Transportation: Frøy ASA (Maritime Services); Utilities: Atlas-SSI (Water Management Equipment)",
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
    description: "Mid-market value-add fund investing in essential US infrastructure businesses including power, utilities, transportation, and environmental services with operational improvement. Portfolio: Power Generation: AL Sandersville Holdings (Gas-to-Power), Astoria Energy I & II (Gas-to-Power), Calhoun Energy Center (Gas-to-Power), Goodwell (Gas-to-Power), Gulf Pacific Power (Gas-to-Power), Hamakua Energy Plant (Biomass Power), Kalaeloa Partners LP (Gas-to-Power), Northern Star Generation (Gas-to-Power), Origin (Gas-to-Power), Rocky Ridge (Gas-to-Power), Thunderhead Energy Solutions (Gas-to-Power), Washington County Power (Gas-to-Power); Renewables / Energy Transition: D. E. Shaw Renewable Investments (DESRI) (Solar & Storage), Desert Sunlight (Solar), EGPNA Renewable Energy Holdings (Wind & Solar), Generate Capital (Diversified Clean Energy), Gulf Plains Wind (Onshore Wind), Prairie Rose (Onshore Wind), Rocky Caney Wind (Onshore Wind)",
    sectors: ["Power Generation", "Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["North America"],
  }),

  // Harrison Street
  f("FUND-107", "Harrison Street", "Harrison Street Social Infrastructure Fund", "2018", "$5.2B+", 5200, "Core-Plus", "Evergreen", {
    description: "Open-end fund investing in demographic-driven social infrastructure including student housing, senior living, medical facilities, and life science properties across North America. Portfolio: Social Infrastructure: Appalachian State Innovation District (University P3), ASU P3 Student Housing JV (Student Housing), IIT Campus Central Power Systems (P3) (University P3), Michigan State University P3 (University P3), Pittock Block (Civic), Simon Fraser University P3 (University P3), Univ. of Chicago Woodlawn P3 (University P3), Wells Building (Civic), WPI Utility System (P3) (University P3); Digital Infrastructure: DRFortress (Data Centers), PowerHouse Data Centers (Data Centers), Union Station Data Center (Data Centers); Renewables / Energy Transition: Ecoplexus Solar Portfolio (Solar), Soltage JV (Solar); Utilities: CoolCo (Cincinnati District Energy) (District Energy)",
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
    description: "Inaugural infrastructure fund targeting mid-market essential services businesses in utilities, transportation, and environmental services across North America and Europe. Portfolio: Waste / Environmental Services: ARC (Waste Management), Best Trash (Waste Collection), Fluo Group Oy (Waste Management); Renewables / Energy Transition: Greenflash Infrastructure (Battery Storage), Northern Biogas (Biogas); Communications: Tower Engineering Professionals (Tower Services); Digital Infrastructure: PolarDC (Data Centers); Power Generation: Trail Ridge Power (Gas-to-Power); Transportation: North America Central School Bus (School Bus)",
    sectors: ["Utilities", "Transportation", "Waste / Environmental Services"],
    regions: ["North America", "Europe"],
  }),

  // I Squared Capital
  f("FUND-111", "I Squared Capital", "ISQ Global Infrastructure Fund IV", "2024", "$15.0B", 15000, "Value-Add", "Deploying", {
    description: "Large-cap global infrastructure fund investing in utilities, energy, transportation, digital infrastructure, and environmental services with active management and platform building. Portfolio: Renewables / Energy Transition: ANZA Power (Solar & Storage), Berde Renewables (Wind & Solar), Clean Energy Fuels Australia (RNG), FAS Renewables (Solar), Global Energy Storage (Battery Storage), GridPoint (Energy Management), Hexa Renewables (Solar), HTEC (Hydrogen), Novel Energy Solutions (Solar & Storage), Octa (Onshore Wind), Órigo Energia (Solar), Radiant Energy Solutions (Solar); Digital Infrastructure: 1NCE (IoT Connectivity), BDx (Big Data Exchange) (Data Centers), EXA Infrastructure (Subsea & Terrestrial Fiber), Ezee Fiber (Fiber Networks), HGC Global Communications (Fiber & Data Centers), Infofabrica Holdings (Data Centers), KIO Networks (Data Centers), Lightstorm (Fiber Networks), nLighten (Edge Data Centers), Oxya (Data Centers), Unifiber by AsiaNet (Fiber Networks); Transportation: Arriva (Bus & Rail), Cube Cold Europe (Cold Storage), Cube Highways (Toll Roads), Nassau Cruise Ports (Cruise Ports), Ramudden Global (Traffic Management), Rentco (Equipment Leasing), SPRB Group (Maritime), Summit School Services (School Bus), TEN (Transportation Equipment Network) (Container Leasing), TIP Group (Trailer Leasing), WOW Logistics (Cold Storage); Power Generation: Absolute Energy (Gas-to-Power), Aggreko (Temporary Power), Atlantic Power (Diversified Power), Conrad Energy (Flexible Power), Inkia Energy (Power Generation), Priority Power Management (Distributed Power), RPower (Power Generation); Midstream / Energy: AG&P Gas (LNG Distribution), Philippine Coastal Storage (Oil Storage), Rubis Terminal (Bulk Liquid Storage), Whiptail Midstream (Gathering & Processing), Whistler Pipeline (Pipelines), Zenith Energy Terminal (Terminals & Storage); Waste / Environmental Services: Enva (Waste Management), Liberty Tire Recycling (Tire Recycling), Soilco (Organic Waste), VLS Environmental Solutions (Liquid Waste); Social Infrastructure: Domidep (Senior Care), Formera Senior Care (Senior Care), Vitanas (Senior Care); Utilities: Energia Group (Electric & Gas Utilities), Polaris Smart Meter (Smart Metering); Communications: Tarana Wireless (Fixed Wireless)",
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
    description: "Mid-market core-plus fund targeting essential infrastructure businesses in utilities, transportation, and environmental services across North America, Europe, and Australasia. Portfolio: Utilities: EGEA (Multi-Utility), firmus energy (Gas Distribution), GridLink (Interconnectors), Manicargas (Gas Distribution), Sonorgás (Gas Distribution), Stockholm Gas (Gas Distribution), UPL (Utility Pipeline Ltd) (Gas Distribution), USG (Multi-Utility); Digital Infrastructure: BornFiber (Fiber Networks), Dobson Fiber (Fiber Networks), GIM Glasfaser Infrastruktur (Fiber Networks), Northern Access GmbH (Fiber Networks), Nua (Fiber Networks), Sonnet (Fiber Networks), SYLTEL (Fiber Networks); Social Infrastructure: Alliance Medical Group (Healthcare Imaging), Choice Care Group (Specialist Care), Meinhardt Group (Engineering Services), Mercurius Health (Healthcare), Vanguard Healthcare Solutions (Healthcare), Vista Services (Facilities Management); Renewables / Energy Transition: Enoé (Solar), Green Recovery Projects (Diversified Renewables), H2air (Wind), Rothes CoRDe (Biomass), Wind Estate (Wind); Transportation: Bardonecchia Ski (Leisure Infrastructure), Cruise Terminals International (Ports), GMP (Générale de Manutention Portuaire) (Ports), Iowa Interstate Railroad (Short-Line Rail), Sestrieres (Motorway Services); Logistics: Gruppo Spinelli (Port Logistics), Service Terminal Rotterdam (Ports & Terminals), Verbrugge International (Ports & Terminals); Waste / Environmental Services: Eco Eridania (Hazardous Waste), Meinhardt Städtereinigung (Waste Collection), Sommers Waste Solutions (Waste Management); Communications: TruVista Telecommunications (Telecoms); Power Generation: Capstone Infrastructure (Diversified Power); Water: SESW (Sutton and East Surrey Water) (Water Utility)",
    sectors: ["Utilities", "Transportation", "Waste / Environmental Services", "Renewables / Energy Transition"],
    regions: ["North America", "Europe", "Asia-Pacific"],
  }),

  // IFM Investors
  f("FUND-114", "IFM Investors", "IFM Global Infrastructure Fund (GIF)", "2004", ">$73.0B", 73000, "Core", "Evergreen", {
    description: "The world's largest open-end core infrastructure fund investing in essential, monopoly-like infrastructure assets with strong market positions, predictable regulatory environments, and high barriers to entry across developed markets. Portfolio: Transportation: Adelaide Airport (Airports), Air Rail (Ground Support Equipment), Aleatica (Toll Roads), Atlas Arteria (Toll Roads), Baltic Hub (DCT Gdansk) (Ports), Brisbane Airport (Airports), Darwin Airport (NT Airports) (Airports), GCT Global Container Terminals (Ports), Indiana Toll Road (Toll Roads), M6toll (Toll Roads), Malta Airport (Airports), Manchester Airports Group (Airports), Melbourne Airport (Airports), Mersin International Port (Ports), NSW Ports (Ports), Perth Airport (Airports), Port of Brisbane (Ports), Southern Cross Station (Rail Stations), Sydney Airport (Airports), Vienna Airport (Airports); Utilities: Anglian Water (Water & Wastewater), Ausgrid (Electricity Distribution), Duquesne Light (Electric Utilities), Enwave Energy (District Energy), FCC Aqualia (Water & Wastewater), Naturgy (Gas & Electric Utilities), Veolia Energia Polska (District Heating), Wyuna Water (Water); Renewables / Energy Transition: ERG (Wind & Solar), Fu-Gen BESS (Battery Storage), GreenGas (Biogas), Mobius Renewables (Renewable Natural Gas), Nala Renewables (Wind & Solar); Midstream / Energy: Buckeye Partners (Pipelines & Terminals), Colonial Pipeline (Pipelines), Freeport LNG (LNG), VTTI (Terminals & Storage); Digital Infrastructure: GlasfaserPlus (Fiber Networks), Green Group AG (Data Centers), Switch Inc. (Data Centers); Communications: Arqiva (Broadcast & Towers); Social Infrastructure: Curtin University Accommodation (Student Housing)",
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
    description: "Open-end global infrastructure fund investing in mid-market infrastructure businesses across waste, water, renewables, transportation, and digital sectors with a long-term sustainable value creation approach. Portfolio: Transportation: Auto-estrada do Algarve Via do Infante (AAVI) (Toll Roads), Auto-Estradas do Douro Litoral (AEDL) (Toll Roads), Auto-estradas Norte Litoral (AENL) (Toll Roads), Brisbane Airport (Airports), Infinity Aviation Group (Aviation Services), International Parking Group (Parking), Patriot Rail (Short-Line Rail), Scandlines (Ferries), Strait Link (Ferries); Renewables / Energy Transition: Atmos Renewables (Solar), CleanPeak Energy (CPE Renewable) (Solar & Storage), ENSO (Solar), Finerge (Wind), Indigo Generation (Solar), Soltage (Solar), Terra-Gen (Wind & Solar); Utilities: City Green Light (Street Lighting), DAH Group (District Heating), MVV Energie (District Energy), Nordion Energi (District Heating), Utilitas (District Heating); Digital Infrastructure: Tuatahi First Fibre (Fiber Networks), US Signal (Data Centers & Fiber), Vault Digital Infrastructure (Data Centers), Westconnect (Fiber Networks); Midstream / Energy: Evos (Storage & Terminals), Höegh Evi (LNG FSRU), Navigator Terminals (Bulk Liquid Storage), Quantem (Bulk Liquid Storage); Waste / Environmental Services: B+T Group (Waste Management), enfinium (Waste-to-Energy), Integrated Waste Services (IWS) (Waste Management), Waste Management New Zealand (Waste Management); Water: coNEXA (Water Infrastructure)",
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
    description: "Value-add fund investing in mid-market infrastructure across energy transition, digital, and social sectors in Europe, North America, and Asia-Pacific. Portfolio: Renewables / Energy Transition: Beatrice Offshore Wind (Offshore Wind), Brazos Wind Farm (Onshore Wind), Drax Battery Storage (Battery Storage), East Anglia One (Offshore Wind), Fortysouth (Wind), Galloper OFTO (Offshore Transmission), Grönhult (Onshore Wind), Hawtree (Solar), Hornsea II OFTO (Offshore Transmission), Hornsea One (Offshore Wind), Iron Star Wind Project (Onshore Wind), Jolt Energy (EV Charging), Madison Fields Solar Farm (Solar), Merkur Offshore (Offshore Wind), Nordic Onshore (Onshore Wind), Priddy Wind Project (Onshore Wind), Valdesolar (Solar); Social Infrastructure: Allenby & Connaught MoD Accommodation (Military Housing), Brighton Children's Hospital (Healthcare), Central Middlesex Hospital (Healthcare), Cork School Of Music (Education), Croydon Schools (Education), Dorset Fire & Rescue (Emergency Services), Edinburgh Schools (Education), Exeter Crown & County Court (Civic), Lewisham Hospital (Healthcare), Metropolitan Police Specialist Training Centre (Public Safety), Northwood MoD Headquarters (Military), Paris-Saclay University (Education), Southmead Hospital (Healthcare), Zaanstad Penitentiary (Justice); Transportation: A249 Road (Roads), A63 Motorway (Toll Roads), A9 Road (Roads), B247 Road (Roads), Blankenburg Tunnel (Tunnels), Cross London Trains (Rolling Stock), Gulenskyss (Ferries), High Speed 1 (HS1 Limited) (Rail), Hullo Ferries (Ferries), Tyne Pass (Tunnels); Digital Infrastructure: Altitude Infra (Fiber Networks), Deutsche GigaNetz (Fiber Networks), LiveOak Fiber (Fiber Networks), Nexspace (Data Centers), NxN Data Centers (Data Centers), ProLink Infrastructure (Fiber Networks), Rogers Communications Data Centres (Data Centers); Utilities: Affinity Water (Water), Texas Nevada Transmission (Electricity Transmission)",
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
    description: "Flagship European mid-market fund investing in digital infrastructure, energy transition, transportation, and healthcare infrastructure with active value creation. Portfolio: Renewables / Energy Transition: Aurora (Solar), EDP Renováveis Solar Portfolio (Solar), Giga Storage (Battery Storage), Green Utility (Solar), Kyotherm (Geothermal / Biomass), Podini Group PV Portfolio (Solar), Prosolia Energy (Solar), Soparsol (Solar), Treblade (Onshore Wind); Digital Infrastructure: Celeste (Fiber & Cloud), Fibre Networks Ireland (Fiber Networks), IFT (Investissement Fibre Territoires) (Fiber Networks), Netomnia (Fiber Networks), nexfibre (Fiber Networks), OpCore (Data Centers), PSO (Polski Światłowód Otwarty) (Fiber Networks); Social Infrastructure: CareChoice (Senior Care), Grandir (Childcare), Mater Private Network (Healthcare), Quartz Healthcare (Healthcare), Sandaya (Outdoor Hospitality), Univet (Veterinary); Transportation: Autostrada Wielkopolska (A2) (Toll Roads), LDA (Louis Dreyfus Armateurs) (Maritime), Nexrail (Rail Leasing), Tramlink (Light Rail); Midstream / Energy: Molgas (LNG Distribution); Utilities: Heygaz (Gas Distribution); Waste / Environmental Services: Blue Phoenix (Waste Recycling)",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["Europe"],
  }),

  // Infratil
  f("FUND-129", "Infratil", "Infratil Limited", "1994", "$12.2B", 12200, "Core-Plus", "Evergreen", {
    description: "NZX and ASX-listed infrastructure investment company with a portfolio spanning renewable energy, digital infrastructure, airports, and healthcare across Australasia and globally. Portfolio: Renewables / Energy Transition: Fortysouth (Wind), Galileo (Green Hydrogen), Gurīn Energy (Wind & Solar), Longroad Energy (Wind & Solar), Mint Renewables (Solar); Digital Infrastructure: CDC Data Centres (Data Centers), Console Connect (Network-as-a-Service), Kao Data (Data Centers); Social Infrastructure: Qscan Group (Medical Imaging), RHCNZ Medical Imaging (Medical Imaging); Communications: One NZ (Telecoms); Transportation: Wellington International Airport (Airports); Utilities: Contact Energy (Electricity Generation & Retail)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Transportation", "Social Infrastructure"],
    regions: ["Asia-Pacific", "North America", "Europe"],
    structure: "Listed / Evergreen",
    ticker: "IFT.NZ",
  }),

  // J.P. Morgan Asset Management
  f("FUND-130", "J.P. Morgan Asset Management", "Infrastructure Investments Fund (IIF)", "2006", "~$40.0B", 40000, "Core", "Evergreen", {
    description: "One of the world's largest open-end core infrastructure funds, acquiring mature infrastructure assets with stable cash flows, monopolistic frameworks, and long-term contracts across energy, water, and transportation in OECD countries. Portfolio: Utilities: Adven Group (Värmevärden) (District Heating), El Paso Electric (Electric Utilities), GETEC Group (Energy Services), Nexus Water Group (Water & Wastewater), Nortegas (Gas Distribution), South Jersey Industries (Gas Distribution), Summit Utilities (Gas Distribution); Midstream / Energy: BWC Terminals (Bulk Liquid Storage), Enstor Gas (Gas Storage), Koole Terminals (Bulk Liquid Storage), North Sea Midstream Partners (Gas Processing); Transportation: Beacon Rail (Rail Leasing), Nieuport Aviation (FBO / Aviation), North Queensland Airports (Airports), Umove (Bus Services); Renewables / Energy Transition: Nadara (Renantis / Ventient) (Onshore Wind), Onward Energy (Wind), Sonnedix (Solar)",
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
    description: "Carbon management fund investing in carbon capture, utilization, and sequestration infrastructure, as well as emissions reduction technology across North America. Portfolio: Midstream / Energy: Caturus (Oil & Gas E&P), Commonwealth LNG (LNG); Renewables / Energy Transition: 38 Degrees North (Distributed Generation), Chestnut Carbon (Carbon Offset)",
    sectors: ["Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["North America"],
  }),

  // KKR
  f("FUND-133", "KKR", "KKR Global Infrastructure Investors V", "2023", "$20.0B", 20000, "Value-Add", "Deploying", {
    description: "Flagship large-cap infrastructure fund investing in transportation, energy, digital infrastructure, and utilities across global markets with thematic operational improvement. Portfolio: Renewables / Energy Transition: Acciona Energía Internacional (Wind & Solar), Albioma (Biomass & Solar), Aster Renewable Energy (Solar), Avantus (Solar), CarbonCount Holdings (Carbon Credits), Cordia Energy (Solar), Encavis (Solar & Wind), Greenvolt (Biomass & Solar), Hero Future Energies (Wind & Solar), Ignis JV (Solar & Storage), Serentica Renewables (Wind & Solar), Virescent Infrastructure (Solar), Zenobē (Battery Storage & EV); Digital Infrastructure: Contabo (Cloud & Hosting), CyrusOne (Data Centers), FiberCop (NetCo) (Fiber Networks), Global Technical Realty (Data Centers), Gulf Data Hub (Data Centers), Hyperoptic (Fiber Networks), Metronet (Fiber Networks), ONNET Chile (Fiber Networks), ONNET Colombia (Fiber Networks), Open Dutch Fiber (Fiber Networks), Reintel (Fiber Networks), Telenor Fiber (Fiber Networks); Midstream / Energy: ADNOC Oil Pipelines (Pipelines), Central Tank Terminal (Storage), Coastal GasLink (Pipelines), Colonial Pipeline (Pipelines), Crescent Energy (Oil & Gas E&P), Genesis Energy (Pipelines & Marine), Port Arthur LNG (LNG), Rocky Mountain Midstream (Gathering & Processing), Sempra Infrastructure (LNG & Utilities); Transportation: Altitude Aircraft Leasing (Aircraft Leasing), Highways Infrastructure Trust (Toll Roads), Ocean Yield (Maritime Leasing), Q-Park (Parking), Queensland Airports (Airports), Refresco (Beverage Logistics), Ritchies Transport (Bus Services); Utilities: AEP Transmission (Stake) (Electricity Transmission), Axius Water (Water & Wastewater), Calisen (Smart Metering), Flow Control Group (Utility Services), IndiGrid (Electricity Transmission), Smart Metering Systems (SMS) (Smart Metering), Spark Infrastructure (Electricity Distribution); Communications: Pinnacle Towers (Towers), Telxius (Towers & Subsea Cable), Vantage Towers (Towers); Power Generation: ContourGlobal (Diversified Power), First Gen (Power Generation); Waste / Environmental Services: A-Gas (Refrigerant Management), Viridor (Waste-to-Energy); Social Infrastructure: John Laing (PPP/PFI)",
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
    description: "Americas-focused fund investing in essential infrastructure including utilities, transportation, digital, and environmental services with active operational improvement. Portfolio: Renewables / Energy Transition: Arcadia Power (Clean Energy Platform), Aula Energy (Solar), Blueleaf Energy (Solar), Broadhelm Renewables (Wind), Calibrant Energy (Distributed Energy), Cero Generation (Solar), Corio Generation (Offshore Wind), Cyrq Energy (Geothermal), DESRI (Solar & Storage), Eku Energy (Battery Storage), Five Estuaries (Offshore Wind), Green Investment Group (GIG) (Platform), Gwynt y Môr (Offshore Wind), Island Green Power (Solar), Linea Energy (Wind), Lynn and Inner Dowsing (Offshore Wind), Outer Dowsing (Offshore Wind), Reden Solar (Solar), Rhyl Flats (Offshore Wind), Sheringham Shoal (Offshore Wind), SkyNRG (Sustainable Aviation Fuel), Treaty Oak Clean Energy (Wind & Solar), Ventos de São Zacarias (Wind), Verkor (Battery Manufacturing), Vertelo (EV Charging); Transportation: Ashoka Concessions (Toll Roads), Autoroutes Paris-Rhin-Rhône (APRR) (Toll Roads), Best in Parking (Parking), Birmingham Airport (Airports), Bristol Airport (Airports), Ceres Terminals (Ports), Farnborough Airport (Airports), Hobart Airport (Airports), London City Airport (Airports), Long Beach Container Terminal (Ports), Macquarie AirFinance (Aircraft Leasing), Maher Terminals (Ports), Montreal Metropolitan Airport (Airports), Perth Airport (Airports), Reef (Parking & Mobility), Roadchef (Motorway Services), Roadis (Toll Roads), TraPac Terminals (Ports), Warnow Tunnel (Toll Roads); Digital Infrastructure: Aligned Data Centers (Data Centers), Applied Digital (Data Centers), CloudExtel (Data Centers), Hanam Data Center (Data Centers), KevlinX (Data Centers), Mereo Networks (Fiber Networks), Onivia (Fiber Networks), Open Fiber (Fiber Networks), Prime Data Centers (Data Centers), SwyftFiber (Fiber Networks), TDC NET (Fiber & Broadband), VIRTUS Data Centres (Data Centers), Vocus Group (Fiber & Data Centers), Voneus (Fiber Networks); Utilities: Cadent Gas (Gas Distribution), CEZ Group Romania (Electric & Gas), Cleco Corporation (Electric Utilities), Energy Assets Group (Smart Metering), EP Infrastructure (Gas & Electric), Icosa Water (Last Mile Infra) (Water), National Gas Transmission (Gas Transmission), Open Grid Europe (Gas Transmission), Puget Sound Energy (Electric & Gas Utilities), Viesgo (Electric Distribution); Communications: 2degrees (Telecoms), Altafiber (Cincinnati Bell) (Fiber & Broadband), Bersama Digital Infrastructure (Towers), Diamond Infrastructure Solutions (Towers), Hawaiian Telcom (Fiber & Broadband), KCOM (Fiber & Broadband), PhilTower (Towers); Waste / Environmental Services: Beauparc (Waste Management), Biffa (Waste Management), Bingo Industries (Waste Management), Coastal Waste & Recycling (Waste Management); Midstream / Energy: HES International (Bulk Terminals)",
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
    description: "Munich Re's asset manager investing in mid-market European infrastructure across energy, transportation, and digital sectors with focus on inflation-linked returns. Portfolio: Renewables / Energy Transition: Höxter Battery Park (Battery Storage), Longroad Energy Holdings (Wind & Solar), Maverick 6 Solar-plus-Storage (Solar & Storage), Maverick 7 Solar Project (Solar), Metelen Battery Park (Battery Storage), Stor-Skälsjön Wind Farm (Onshore Wind); Transportation: Barcelona Metro Line 9 (Metro), Cross London Trains Limited (Rolling Stock), Indigo Group (Parking), Interpark (Parking), Siemens Mireo (Elektronetz Nord-Magdeburg) (Rolling Stock), Stadler FLIRT Akku (Mittelthüringesches Akkunetz) (Rolling Stock); Communications: Austrian TowerCo (Cellnex Austria) (Towers), GD Towers (Towers), TowerPoint Infrastructure Partners (Towers); Digital Infrastructure: Live Oak Fiber (Fiber Networks), Vantage Data Centers EMEA (Data Centers); Utilities: Proxiserve (Energy Services), SouthWest Water Company (Water & Wastewater); Power Generation: Astoria Energy I and II (Gas-to-Power); Social Infrastructure: Parmaco (Modular Buildings)",
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
    description: "Maiden agricultural transition fund investing in sustainable agriculture and food system infrastructure in Europe, supporting the ecological transition through biogas, regenerative farming, and food value chain projects. Portfolio: Transportation: A2 Motorway (Toll Roads), A5 Highway (Austria) (Toll Roads), A5 Motorway (Germany) (Toll Roads), A66 Highway (Spain) (Toll Roads), A7 Highway South (Germany) (Toll Roads), Allego (EV Charging), Ausol Highway I & II (Toll Roads), Conrac Solutions (Airport Services), D4 Highway (Toll Roads), Florence Tramway (Light Rail), Isle of Wight Roads (Roads), L2 Project Marseille (Roads), LaGuardia Terminal B (Airports), Limerick Tunnel (Tunnels), M8 Highway (Toll Roads), Miami Monorail (Light Rail), Nairobi-Nakuru Highway (Toll Roads), Nîmes-Montpellier Bypass (CNM) (Rail), Norscut Highway (Toll Roads), North Tarrant Express Highway (Toll Roads), Nottingham Tramway (Light Rail), Nouakchott Port (Ports), Ouagadougou Donsin Airport (Airports), Port of Miami Tunnel (Tunnels), Presidio Parkway (Toll Roads), Purple Line Light Rail (Light Rail), Queen Alia International Airport (Airports), R1 Motorway (Toll Roads), Reno-Tahoe Airport Conrac (Airport Services), SETRAG (Rail), Société Autoroutière du Gabon (Toll Roads), Sofia Airport (Airports), SR400 Express Lanes (Toll Roads), Tours-Bordeaux High Speed Rail (Lisea) (Rail), Transgabonaise Road (Roads); Renewables / Energy Transition: Agrimaine Biogas Cogeneration (Biogas), Biokala Biomass (Biomass), BTE Renewables (Kipeto & Siruai) (Wind), Evergaz / BMP (Biogas), IWell / Iwell (Battery Storage), Kael (Solar), Kahone (Solar), Kinguele Aval Hydroelectric Plant (Hydropower), Mayenne Biogas Plant (Biogas), Rift Valley Energy (Geothermal), Senergy (Solar), Suez Wind Energy (Wind), Ten Merina (Solar), Wagabox Biogas (Biogas); Social Infrastructure: Acciona Hospitals & Roads Portfolio (Healthcare & Roads), Barcelona Law School Extension (Education), Bursa Hospital (Healthcare), CRCHUM (Healthcare), Espoo Schools (Education), Felix Bulnes Hospital (Healthcare), Fulcrum LIFT (Healthcare), Long Beach Courthouse (Civic), Rennes Hospital (Healthcare), Saint-Quentin-en-Yvelines Velodrome (Sports), Treichville University Hospital (Healthcare), University of Hertfordshire (Education), Welsh Education Partnership (Education); Utilities: Aqaba Water Desalination (Water Desalination), Great Sea Interconnector (Electricity Interconnector), SUEZ (Water & Waste), University of Iowa Utilities (District Energy); Waste / Environmental Services: Gipuzkoa Waste to Energy Plant (Waste-to-Energy), Olstyn WTE Project (Waste-to-Energy); Digital Infrastructure: Raxio Data Centre (Data Centers)",
    sectors: ["Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Greenfield"],
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
    description: "European renewable energy fund investing in onshore wind, solar PV, and battery storage projects across Europe with greenfield development and construction capabilities. Portfolio: Renewables / Energy Transition: Arkolia Energies (Solar), Baltic Storage Platform (BSP) (Battery Storage), Bright (Solar), Corsica Sole (Solar & Storage), d.light (Off-Grid Solar), Dexter Energy (Energy Trading), ecoligo (Solar), Italian Renewable Platform s.r.l. (Solar & Wind), JUWI Greek PV Portfolio (Clover) (Solar), Mahon Solar PV and Storage (Solar & Storage), Revfin (EV Finance), Solveo Energies (Solar), Sunly (Wind & Solar), Swedish Onshore Wind Parks (Fågelås, Dållebo, Boarp) (Onshore Wind); Transportation: ARC Ride (Electric Mobility), Driveco (EV Charging), GreenWay Holding (EV Charging), Indigo Group (Parking), Metro de Malaga (Metro), Neot e-motion (EV Charging), Via Expresso (Toll Roads), ViaLitoral (Toll Roads), Zunder (EV Charging); Social Infrastructure: Aton per il Progetto (Healthcare), Gran Hospital Can Misses (Healthcare), Son Espases Hospital (Healthcare), Veneta Sanitaria Finanza di Progetto S.p.A. (Healthcare); Utilities: Loiste (Electric Utilities), Oslofjord Varme / Hafslund Oslo Celsio (District Heating), Proxiserve (Energy Services); Digital Infrastructure: Axione (Fiber Networks)",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Europe"],
    strategies: ["Value-Add", "Greenfield"],
  }),

  // Morgan Stanley Infrastructure
  f("FUND-160", "Morgan Stanley Infrastructure", "North Haven Infrastructure Partners IV", "2022", "$4.1B", 4100, "Value-Add", "Deploying", {
    description: "Value-add fund targeting mid-market essential infrastructure in energy, transportation, utilities, and environmental services across North America and Western Europe. Portfolio: Digital Infrastructure: FastFiber (Fiber Networks), Flexential (Data Centers), Lightpath (Fiber Networks), Rapidue Technologies (Smart City), Tele Columbus AG (Fiber & Cable), UltraEdge (Edge Infrastructure); Transportation: Magenta EV Solutions (EV Charging), Onslow Iron Road Trust (Haul Roads), Salcef Group (Rail Services), StraitNZ (Ferries), The Pasha Group (Ports & Logistics); Renewables / Energy Transition: Crowley Wind (Onshore Wind), PNE (Wind & Solar), Suminter India Organics (Sustainable Agriculture), Torch Clean Energy (Wind & Solar); Social Infrastructure: Athulya Assisted Living (Senior Care), HealthMap Diagnostics (Healthcare), SpecialtyCare (Healthcare); Midstream / Energy: Brazos Midstream (Gathering & Processing), Portland Natural Gas Transmission System (Pipelines); Utilities: Seven Seas Water (Water Desalination), Valoriza (Water & Waste); Power Generation: Bayonne Energy Center (Gas-to-Power); Waste / Environmental Services: Augean (Hazardous Waste)",
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
    description: "Open-end core fund investing in essential, contracted infrastructure assets with stable cash flows in utilities, transportation, and social infrastructure across North America. Portfolio: Renewables / Energy Transition: AMAROK (Wind), Canadian Breaks (Wind), Cotton Plains Portfolio (Wind), Fortysouth (Wind), Lal Lal Wind Farms (Wind), Puna Geothermal Venture (Geothermal); Transportation: Combined Cargo Terminals (Ports), CSV (Maritime), EVPassport (EV Charging), Millennium Parking Garages (Parking), Pocahontas Parkway (Toll Roads), Thames Clippers (River Transport); Midstream / Energy: Douglas Terminals (Bulk Liquid Storage), Navigator Terminals (Bulk Liquid Storage), Odfjell Terminals (Chemical Storage), Quantem (Bulk Liquid Storage); Digital Infrastructure: Quickline Communications (Fiber & Broadband), Tillman Fiber (Fiber Networks); Utilities: Provident Energy Management Inc. (Energy Management), WASH Multifamily Holdings Inc. (Laundry Services); Communications: Shared Tower (Towers); Social Infrastructure: Maple PPP Portfolio (PPP/PFI)",
    sectors: ["Utilities", "Transportation", "Social Infrastructure"],
    regions: ["North America"],
    structure: "Open-End",
  }),

  // NOVA Infrastructure
  f("FUND-163", "NOVA Infrastructure", "NOVA Infrastructure Fund II", "2024", "$1.0B", 1000, "Value-Add", "Deploying", {
    description: "Mid-market fund investing in essential North American infrastructure services businesses in power, utilities, environmental services, and transportation. Portfolio: Transportation: A&R Bulk-Pak (Bulk Logistics), Ascension FBO Network (FBO / Aviation), Harbor Logistics (Port Logistics); Digital Infrastructure: DartPoints (Edge Data Centers), telMAX Inc. (Fiber Networks); Renewables / Energy Transition: Nopetro Renewables / Nopetro Energy (RNG & CNG), UGE International (Community Solar); Communications: Xchange Telecom (Skywire) (Fixed Wireless)",
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
    description: "Open-end core fund investing in operational European renewable energy assets with contracted revenues, targeting onshore wind and solar farms. Portfolio: Renewables / Energy Transition: American BESS 1 (Battery Storage), American Solar 1 (Solar), Dutch Wind 1 (Onshore Wind), Finnish BESS 1 (Ainola) (Battery Storage), German Wind 1, 2, 3, 4, 5 (Onshore Wind), Italian and Spanish Solar 1 (Solar), Italian BESS 1, 2 (Battery Storage), Italian Solar 1, 2, 3 (Solar), Italian Wind 1, 2, 3, 4 (Onshore Wind), South Korean Solar 1, 2, 3 (Solar), Southern European Solar 1, 2 (Solar), Spanish Solar 1, 2 (Solar), Spanish Wind 1, 2 (Onshore Wind), Sweden Wind 1 (Onshore Wind), Verdian Power (Wind); Digital Infrastructure: Arcadian Infracom 1, LLC (Fiber Networks), BNZ (Data Centers), CleanArc Data Centers (Data Centers), DataBank (Data Centers); Transportation: I-595 Express, LLC (Toll Roads), Mersey Gateway Bridge (Toll Roads)",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
    structure: "Open-End",
  }),

  // Oaktree Capital
  f("FUND-166", "Oaktree Capital", "Oaktree Power Opportunities Fund VII", "2024", "$2.5B", 2500, "Value-Add", "Deploying", {
    description: "Value-add fund investing in companies providing essential products and services to electric power, natural gas, water, wastewater, and utility infrastructure in North America and Europe, capitalizing on decarbonization and electrification trends.",
    sectors: ["Utilities", "Power Generation", "Renewables / Energy Transition", "Water"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-167", "Oaktree Capital", "Oaktree Transportation Infrastructure Capital Partners", "2022", "$3.0B", 3000, "Core-Plus", "Evergreen", {
    description: "Permanent capital vehicle investing in essential transportation infrastructure including airports, ports, rail, and logistics assets globally with long-term holding periods.",
    sectors: ["Transportation", "Logistics"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Partners Group
  f("FUND-168", "Partners Group", "Partners Group Direct Infrastructure IV", "2023", "Undisclosed", null, "Value-Add", "Deploying", {
    description: "Global direct infrastructure fund investing in mid-market essential infrastructure businesses across energy, transportation, digital, and utilities with platform building. Portfolio: Renewables / Energy Transition: Budderfly (Energy Efficiency), Dimension Renewable Energy (Community Solar), Esentia Energy Development (Wind & Solar), Exus Renewables North America (Wind & Solar), Life Cycle Power (Battery Storage), PowerTransitions (Solar), Sunsure Energy (Solar); Digital Infrastructure: EdgeCore Digital Infrastructure (Data Centers), Eolo (Fixed Wireless / Fiber), GreenSquareDC (Data Centers), Unity Digital Infrastructure (Data Centers); Utilities: Gren (District Heating), USIC (United States Infrastructure Corp) (Utility Locating); Transportation: Milestone Equipment Holdings (Transportation Equipment Leasing)",
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
    description: "Largest infrastructure fund in Latin America, investing across toll roads, data centers, water desalination, renewable energy, and electric mobility in Brazil, Colombia, and Chile. Portfolio: Transportation: Concesión Pacífico Tres (Toll Roads), Eixo SP (Toll Roads), Entrevias (Toll Roads), Malla Vial del Valle (Rutas del Valle) (Toll Roads), Puerta de Oro (Toll Roads), Santa-Mocoa-Neiva (Ruta al Sur) (Toll Roads), Via Araucária (Toll Roads); Renewables / Energy Transition: Atlas Renewable Energy (Solar & Wind), Essentia Energia (Solar & Wind); Communications: Winity Telecom (Towers); Digital Infrastructure: Omnia (Data Centers)",
    sectors: ["Transportation", "Digital Infrastructure", "Water", "Renewables / Energy Transition", "Waste / Environmental Services"],
    regions: ["Latin America"],
  }),
  f("FUND-171", "Patria Investments", "Patria Infrastructure Core Fund (PIER)", "2021", "~$1.0B", 1000, "Core", "Evergreen", {
    description: "Brazilian-listed core infrastructure fund on B3, focused on yield-generating operational power generation and transmission assets in Brazil with long-term contracted revenues.",
    sectors: ["Power Generation", "Renewables / Energy Transition"],
    regions: ["Latin America"],
    structure: "Listed / Evergreen",
    ticker: "PIER11",
  }),

  // Patrizia
  f("FUND-172", "Patrizia", "Patrizia European Infrastructure Fund III", "2023", "€1.5B", 1650, "Core-Plus", "Raising", {
    description: "European core-plus infrastructure fund targeting mid-cap investments in energy transition, digital infrastructure, social infrastructure, green mobility, and environmental services. Portfolio: Utilities: Ecotermica Servizi (District Heating), Kaer (District Cooling), Kvitebjørn Varme (District Heating), Ottima (Energy Services), Selettra (Energy Services), YES Group (Energy Services); Renewables / Energy Transition: Biomet (Biogas), Buskowitz Energy (Solar), SAREN Energy (Solar), Sustainable Energy Infrastructure (SEI) (Solar & Wind); Digital Infrastructure: Atlantico (Subsea Cable), Connexin (Fiber & IoT), SiFi Networks (FiberCity) (Fiber Networks); Midstream / Energy: Vopak Terminal Eemshaven (LNG & Chemicals); Social Infrastructure: Kinland (Senior Living); Transportation: Parkwise (Parking); Waste / Environmental Services: Greenthesis (Waste Management)",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure", "Transportation", "Waste / Environmental Services"],
    regions: ["Europe"],
  }),
  f("FUND-173", "Patrizia", "APAC Sustainable Infrastructure Fund (A-SIF)", "2022", "$130M", 130, "Value-Add", "Deploying", {
    description: "PATRIZIA and Mitsui's flagship strategy for sustainable mid-market infrastructure in developed Asia-Pacific markets, targeting energy, digital, social, and mobility assets.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure", "Transportation"],
    regions: ["Asia-Pacific"],
  }),
  f("FUND-174", "Patrizia", "Emerging Asia Sustainable Infrastructure Fund (ESIF)", "2025", "$500M", 500, "Value-Add", "Deploying", {
    description: "Climate-focused fund targeting greenfield sustainable infrastructure in emerging Asian markets including Malaysia, Philippines, Thailand, Vietnam, Indonesia, and India, with EIB as cornerstone investor.",
    sectors: ["Renewables / Energy Transition", "Digital Infrastructure", "Social Infrastructure"],
    regions: ["Asia-Pacific"],
    strategies: ["Value-Add", "Greenfield"],
  }),
  f("FUND-175", "Patrizia", "PATRIZIA Infrastructure Invest ELTIF", "2024", "Undisclosed", null, "Core-Plus", "Evergreen", {
    description: "First European Long-Term Investment Fund targeting private and professional investors, investing in infrastructure equity and debt across digital, energy transition, urban mobility, and social infrastructure.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["Europe", "Global"],
  }),
  f("FUND-176", "Patrizia", "PATRIZIA Low Carbon Core Infrastructure Fund", "2019", "Undisclosed", null, "Core", "Evergreen", {
    description: "Listed open-end fund investing in infrastructure and utility companies that can maintain earnings as economies transition to net zero, excluding companies with 10%+ fossil fuel revenue.",
    sectors: ["Utilities", "Water", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
  }),

  // PSP Investments
  f("FUND-177", "PSP Investments", "Canada Growth Fund", "2023", "C$15.0B", 11100, "Value-Add", "Deploying", {
    description: "C$15B independent investment vehicle managed by PSP Investments, investing to unlock private capital for decarbonization, clean technology scale-up, and low-carbon supply chain development across Canada. Portfolio: Transportation: 407 ETR (Toll Roads), AGS Airports (Airports), Angel Trains (Rolling Stock), AviAlliance (Airports), Forth Ports (Ports), ROADIS (Toll Roads); Renewables / Energy Transition: Cubico Sustainable Investments (Wind & Solar), FirstLight Power (inc. Hydromega) (Hydropower), NeXtWind (Onshore Wind); Utilities: AEP Transmission Companies (Electricity Transmission), Spark Infrastructure (Electricity Distribution); Communications: Radius Global Infrastructure (Ground Leases); Digital Infrastructure: Network FiberCo (Ziply Fiber) (Fiber Networks)",
    sectors: ["Renewables / Energy Transition", "Midstream / Energy", "Power Generation"],
    regions: ["North America"],
    structure: "Permanent Capital",
    strategies: ["Value-Add", "Growth"],
  }),

  // QIC Global Infrastructure
  f("FUND-178", "QIC Global Infrastructure", "QIC Global Infrastructure Fund II (QGIF II)", "2023", "US$2.0B", 2000, "Core-Plus", "Deploying", {
    description: "Second flagship infrastructure equity fund with ~70% allocated to Australian energy transition investments including renewables, smart metering, and transport decarbonization. Portfolio: Transportation: Brisbane Airport (Airports), Brussels Airport (Airports), ConnectEast Group (EastLink) (Toll Roads), Hobart International Airport (Airports), Northwestern Roads Group (Toll Roads), Port of Brisbane (Ports), Port of Melbourne (Ports), Sea Swift (Maritime Logistics); Utilities: Bluecurrent (Vector Metering) (Smart Metering), CenTrio (District Energy), Powerco (Electricity & Gas Distribution), Thames Water (Water & Wastewater); Renewables / Energy Transition: Generate Capital (Diversified Clean Energy), Renewa (Wind & Solar), Tilt Renewables (Wind); Social Infrastructure: Evolution Healthcare (Healthcare), Nexus Hospitals (Healthcare), Titles Queensland (Land Registry); Midstream / Energy: Epic Energy (Pipelines), Lochard Energy (Gas Storage); Power Generation: Pacific Energy (Remote Power)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Utilities"],
    regions: ["Asia-Pacific", "Global"],
  }),
  f("FUND-179", "QIC Global Infrastructure", "QIC Infrastructure Portfolio (QIP)", "2006", "Undisclosed", null, "Core", "Evergreen", {
    description: "Open-end core infrastructure portfolio for Australian institutional investors, targeting regulated and contracted essential infrastructure globally. Portfolio: Transportation: Akiem (Rolling Stock Leasing), Cadence (Alto High-Speed Rail) (High-Speed Rail), DP World JV (UAE) (Ports), DP World Maspion East Java (Ports), Eurostar (High-Speed Rail), InTransit BC (Canada Line) (Rail Transit), Keolis (Public Transit), Port of Brisbane (Ports), Réseau express métropolitain (REM) (Automated Light Metro), Student Transportation of America (School Bus Services), Sydney Metro (Metro Rail), TramCité (Light Rail); Renewables / Energy Transition: Albioma SA (Biomass & Solar), Boralex (Wind & Solar), Edify Energy (Solar & Storage), Grand Changhua 1 (Offshore Wind), HY2GEN (Green Hydrogen), Innergex Renewable Energy (Hydro, Wind & Solar), Invenergy Renewables (Renewables Platform), London Array (Offshore Wind), Renewa (Wind & Solar), Shizen Energy (Solar & Wind), Velto Renewables (Q-Energy) (Solar & Wind); Digital Infrastructure: American Tower Corporation Europe (ATC Europe) (Towers), Connexa (Towers), Terrion (Data Centers), Vertical Bridge (Towers); Utilities: AES Indiana (Electric Utility), Énergir (Gas Distribution), TransGrid (Electricity Transmission); Midstream / Energy: Southern Star Central Gas Pipeline (Gas Pipelines), Transportadora Associada de Gás S.A. (Gas Pipelines); Power Generation: Apraava Energy (Diversified Power), Sizewell C (Nuclear); Social Infrastructure: Colisée (Healthcare Facilities), Plenary Americas (PPP / P3); Logistics: QSL International (Supply Chain Services)",
    sectors: ["Transportation", "Utilities", "Power Generation"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-180", "QIC Global Infrastructure", "Queensland Critical Minerals and Battery Technology Fund", "2023", "A$100M", 66, "Value-Add", "Deploying", {
    description: "Queensland government fund providing venture/growth capital to businesses across the critical minerals and battery technology supply chain, from mining to advanced materials processing.",
    sectors: ["Midstream / Energy", "Renewables / Energy Transition"],
    regions: ["Asia-Pacific"],
    structure: "Permanent Capital",
  }),

  // Quinbrook Infrastructure
  f("FUND-181", "Quinbrook Infrastructure", "Quinbrook Net Zero Power Fund", "2021", "$3.0B", 3000, "Value-Add", "Deploying", {
    description: "Dedicated net-zero power fund investing in renewable energy, battery storage, and grid-scale clean power generation projects across the US, UK, and Australia. Portfolio: Renewables / Energy Transition: Cape Byron Power (Biomass), Cleve Hill Solar + Storage (Solar & Storage), Elemental Clean Fuels (Renewable Fuels), Gemini Solar + Storage (Solar & Storage), GlidePath Power Solutions (Battery Storage), Habitat Energy (Battery Storage), Junction City Biomethane (RNG), Mallard Pass Solar Farm (Solar), Northern Quartz Campus (Materials / Silicon Production), Primergy Solar (Solar & Storage), PurposeEnergy (Biogas), Supernode (Battery Storage), Uskmouth (Biomass Conversion); Power Generation: Aegis Energy (Gas-to-Power), Velox Power (Gas-to-Power); Digital Infrastructure: Rowan Digital Infrastructure (Data Centers); Utilities: Synchronous Condensers Portfolio (Grid Stability)",
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
    description: "Specialist water infrastructure fund investing in water and wastewater utilities, water treatment, and related essential infrastructure across North America. Portfolio: Transportation: APP Jet Center (FBO / Aviation), Carolina Marine Terminal (Ports), Nassau Marine Terminal (Ports), Sierra Railroad Company (Short-Line Rail), Valley Cold (Cold Storage); Utilities: Ecosave (Energy Services), Prospect Lake Clean Water Center (Water Treatment), Undine (Water & Wastewater); Waste / Environmental Services: Environmental Infrastructure Partners (Environmental Services), Waste Resource Management (WRM) (Waste Management); Midstream / Energy: The Dupuy Group (Storage); Renewables / Energy Transition: MN8 Energy (Solar)",
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
    description: "Fund investing in UK operational renewable energy assets with focus on solar PV and onshore wind, targeting core returns with stable contracted cash flows. Portfolio: Renewables / Energy Transition: Andershaw Wind Farm (Onshore Wind), Bicker Fen Wind Farm (Onshore Wind), Bin Mountain Wind Farm (Onshore Wind), Bishopthorpe Wind Farm (Onshore Wind), Braes of Doune Wind Farm (Onshore Wind), Bring Energy (Onshore Wind), Brockaghboy Wind Farm (Onshore Wind), Burbo Bank Extension (Offshore Wind), Carcant Wind Farm (Onshore Wind), Carlton Power (Battery Storage), Church Hill Wind Farm (Onshore Wind), Clyde Wind Farm (Onshore Wind), Corriegarth Wind Farm (Onshore Wind), Crighshane Wind Farm (Onshore Wind), Dalquhandy Wind Farm (Onshore Wind), Deeping St Nicholas (Solar), Douglas West Wind Farm (Onshore Wind), Drogheda Energy Park (Wind), Greencoat Renewables PLC (Wind), Greencoat UK Wind PLC (Wind), ISG Renewables (Solar), JERA Nex US Solar Portfolio (Solar), Low Carbon Greenhouses (Geothermal), METLEN UK Solar Portfolio (Solar), Repsol Spanish Renewable Portfolio (Wind & Solar), Toucan Energy Portfolio (Solar), West of Duddon Sands (Offshore Wind)",
    sectors: ["Renewables / Energy Transition"],
    regions: ["Europe"],
  }),

  // Stonepeak
  f("FUND-192", "Stonepeak", "Stonepeak Infrastructure Fund V", "2023", "$15.0B", 15000, "Value-Add", "Raising", {
    description: "Fifth-generation flagship fund targeting investments in digital infrastructure, energy and energy transition, transportation and logistics, and social infrastructure primarily in North America. Portfolio: Digital Infrastructure: Astound Broadband (Fiber & Broadband), Cirion Technologies (Data Centers & Fiber), Cologix (Data Centers), CoreSite (Data Centers), DELTA Fiber (Fiber Networks), Digital Edge (Data Centers), Equalbase (Data Centers), euNetworks (Fiber Networks), Omni Fiber (Fiber Networks), Princeton Digital Group (Data Centers), Xplore (Fiber & Broadband); Renewables / Energy Transition: AGP Sustainable Real Assets (Diversified), Coastal Virginia Offshore Wind (Offshore Wind), Joule Terra (Solar), Kingdom Energy Storage (Battery Storage), Maas Energy Works (Biogas), NorthStar Renewable Power (Solar), Peak Energy (Battery Storage), Repsol U.S. Renewables (Wind & Solar), Stonepeak Island Transition (Energy Transition), Synera Renewable Energy (Solar), TerraWind Renewables (Wind); Transportation: ATSG (Air Cargo), Dupré Logistics (Logistics), Emergent Cold LatAm (Cold Storage), Lineage Logistics (Cold Storage), Seapeak / Stonepeak Marine (LNG & Marine), Stonepeak Aviation Platform (Aircraft Leasing), Textainer (Container Leasing), TRAC Intermodal (Chassis Leasing), UNITED PORTS LLC (Ports); Midstream / Energy: IOR (Oilfield Services), KAPS (Pipelines), Longview Infrastructure (Water Midstream), Louisiana LNG (LNG), Paradigm Energy Partners (Water Midstream), Pelican Pipeline (Pipelines); Communications: Cellnex Nordics (Towers), GTA (TeleGuam) (Telecoms), Intrado (Communications Technology), Philippines Tower JVCo (Towers); Logistics: IFCO Group (Reusable Packaging), LOGISTEC (Marine Services), Rinchem (Chemical Logistics), Stonepeak Infrastructure Logistics (Infrastructure Logistics); Utilities: Aura Holdings (Energy Services), Carlsbad Desalination Plant (Water Desalination), Lestari Cooling Energy (District Cooling), Montera Infrastructure (Utility Services); Social Infrastructure: Akumin (Healthcare Imaging), Arvida (Senior Living), Inspired Education Group (Education)",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Logistics", "Utilities"],
    regions: ["North America"],
  }),
  f("FUND-193", "Stonepeak", "Stonepeak Global Renewables Fund II", "2024", "$5.0B", 5000, "Core-Plus", "Raising", {
    description: "Dedicated global renewables fund investing in wind, solar, battery storage, and green hydrogen projects with development and operational capabilities.",
    sectors: ["Renewables / Energy Transition", "Power Generation"],
    regions: ["Global"],
    strategies: ["Core-Plus", "Greenfield"],
  }),
  f("FUND-194", "Stonepeak", "Stonepeak Asia Infrastructure Fund II", "2024", "$4.0B", 4000, "Value-Add", "Raising", {
    description: "Second Asia-focused fund investing in digital infrastructure, energy, transportation, logistics, and cold storage in developed East Asia, Southeast Asia, and India.",
    sectors: ["Digital Infrastructure", "Renewables / Energy Transition", "Transportation", "Logistics"],
    regions: ["Asia-Pacific"],
  }),
  f("FUND-195", "Stonepeak", "Stonepeak Opportunities Fund", "2022", "$3.15B", 3150, "Value-Add", "Deploying", {
    description: "Mid-market opportunities fund targeting core-plus and value-add infrastructure investments including control positions and structured capital solutions in communications, transport/logistics, and energy transition.",
    sectors: ["Communications", "Transportation", "Logistics", "Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-196", "Stonepeak", "Stonepeak Opportunities Fund II", "2024", "~$3.0B", 3000, "Value-Add", "Raising", {
    description: "Successor mid-market infrastructure fund continuing Stonepeak's strategy of targeting core-plus and value-add opportunities in communications, transport/logistics, and energy transition.",
    sectors: ["Communications", "Transportation", "Logistics", "Renewables / Energy Transition"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-197", "Stonepeak", "Stonepeak Core Fund", "2021", "$3.1B+", 3100, "Core", "Evergreen", {
    description: "Open-ended core infrastructure fund with $3.7B+ AUM, targeting developed-market assets with long-term inflation-linked revenue streams across digital infrastructure, transportation/logistics, and energy transition.",
    sectors: ["Digital Infrastructure", "Transportation", "Logistics", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Open-End",
  }),

  // Swiss Life Asset Managers
  f("FUND-198", "Swiss Life Asset Managers", "Swiss Life Funds (LUX) Global Infrastructure Opportunities IV", "2024", "€2.5B", 2750, "Core-Plus", "Raising", {
    description: "Global core-plus infrastructure fund investing in essential mid-market assets across energy, transportation, digital, and social infrastructure in developed markets. Portfolio: Renewables / Energy Transition: BCP Battery Holding (Battery Storage), Borssele III & IV (Offshore Wind), Drone Hill Wind Farm (Onshore Wind), HydePoint (Green Hydrogen), Molise PV Solar (Solar), North Ammonia (Green Ammonia), Powy (Battery Storage), Seagust (Offshore Wind), Vergia (Renewables Platform); Digital Infrastructure: Altitude Infrastructure THD (Fiber Networks), DataBank (Data Centers), Lyntia Networks (Fiber Networks), RAD-x (Fiber Networks), Vantage Data Centers EMEA (Data Centers); Transportation: Aves One AG (Rolling Stock Leasing), Brisa (Toll Roads), JFK New Terminal One (Airports), Lusoponte (Toll Roads), Wascosa Holding AG (Rail Leasing); Social Infrastructure: Colegios Educare (Education), Condecta AG (Modular Construction), Infrareal GmbH (Campus Infrastructure); Utilities: Amprion (Electricity Transmission), Nortegas (Gas Distribution), Thames Tideway Tunnel (TTT) (Water & Wastewater); Communications: Cellnex Switzerland (Towers), GD Towers (Towers)",
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
    description: "Debut fund from I Squared Capital spinout targeting operationally intensive, value-add investments in lower middle-market infrastructure across North America, with platforms in small-craft aviation, marine services, and data centers. Portfolio: Transportation: Donjon Marine Co., LLC (Maritime Services), Velocity FBO Network (Odyssey Aviation / BTR Jet) (FBO / Aviation); Digital Infrastructure: TRG Datacenters (Data Centers)",
    sectors: ["Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["North America"],
  }),

  // Temasek
  f("FUND-203", "Temasek", "GenZero", "2022", "SGD 5.0B", 3750, "Value-Add", "Evergreen", {
    description: "Temasek's dedicated decarbonization investment platform deploying capital into early-stage and growth climate technologies, clean energy, and sustainable solutions globally. Portfolio: Renewables / Energy Transition: Commonwealth Fusion Systems (Fusion Energy), Eavor (Geothermal), Electric Hydrogen (Green Hydrogen), Neoen (Wind & Solar), Svante (Carbon Capture); Transportation: Keppel Ltd (Ports & Logistics), PSA International (Ports), SATS Ltd (Airport Services), Seatrium (Maritime Engineering), SMRT Corporation (Rail & Bus); Utilities: Sembcorp Industries (Energy & Water), SP Group (Electricity & Gas); Communications: Singtel (Telecoms); Digital Infrastructure: ST Telemedia (Data Centers); Power Generation: Westinghouse (Nuclear)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Waste / Environmental Services"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Tiger Infrastructure Partners
  f("FUND-204", "Tiger Infrastructure Partners", "Tiger Infrastructure Partners Fund IV", "2023", "$1.5B", 1500, "Value-Add", "Raising", {
    description: "Mid-market value-add fund investing in digital infrastructure, energy, and transportation assets across North America and Europe with hands-on platform building. Portfolio: Digital Infrastructure: 11:11 Systems (Cloud & Data Centers), Crosslake Fibre (Subsea Fiber), Digital Sense Hosting (Data Centers), Ntirety (Managed Hosting), Stellium Datacenters (Data Centers), Strategic Venue Partners (Venue Connectivity), Voneus (Fiber Networks); Transportation: International Aerospace Coatings (IAC) (Aviation Services), MNC Transportation (Bus Services), Modern Aviation (FBO / Aviation), NorthLink Aviation (Aviation Services), Qwello (EV Charging); Power Generation: Danskammer Energy (Gas-to-Power), Forsa Energy (Gas-to-Power), Unison Energy (Distributed Power); Renewables / Energy Transition: Summit Brazil Renewables (Wind & Solar), Summit Carbon Solutions (Carbon Capture); Utilities: ELM Utility Services (Utility Services), Granite Comfort (HVAC); Waste / Environmental Services: Bolder Industries (Tire Recycling), Raptor Waste Solutions (Waste Management); Social Infrastructure: EMED Group (Healthcare)",
    sectors: ["Digital Infrastructure", "Power Generation", "Transportation"],
    regions: ["North America", "Europe"],
  }),

  // TPG
  f("FUND-205", "TPG", "TPG Rise Climate II", "2023", "$10.0B", 10000, "Value-Add", "Deploying", {
    description: "Flagship climate fund investing in clean energy, decarbonization, and sustainable solutions companies globally, targeting both infrastructure and growth equity. Portfolio: Renewables / Energy Transition: Altus Power (Solar), Anew Climate (Carbon Markets), Aurora Energy Research (Energy Analytics), Form Energy (Long-Duration Storage), Gridserve (Solar & EV Charging), Intersect Power (Solar & Storage), Matrix Renewables (Solar), MIRATECH (Emissions Control), Monolith (Clean Hydrogen), Nextracker (Solar Trackers); Communications: Blue Sky Towers (Towers), Connected Infra Group (Towers), Everest Infrastructure Partners (Towers), Sabre Industries (Tower Manufacturing), Vertel Pty (Telecoms); Midstream / Energy: AmSpec (Inspection & Testing), Kinetic (Environmental Services); Utilities: Pike Corporation (Utility Services), Techem (Energy Services); Digital Infrastructure: Tata Consultancy Services (AI Data Centers) (Data Centers); Transportation: BETA Technologies (Electric Aviation); Waste / Environmental Services: SICIT Group S.p.A. (Circular Economy)",
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
    description: "Renewable energy infrastructure fund investing in distributed commercial and industrial (C&I) solar, batteries, and microgrids across the US, UK, and EU with over 600 MW of operating distributed solar. Portfolio: Renewables / Energy Transition: Charbone Hydrogene (Green Hydrogen), Clean Energy Capital (CEC) (Solar), CleanChoice Energy (Community Solar), Ecofin US Renewables Portfolio (64MW) (Solar), Faradae SAS (Solar)",
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
    description: "European core infrastructure fund investing in regulated and contracted essential assets in transportation, utilities, social infrastructure, and digital with long-term visibility. Portfolio: Transportation: Boreal (Ferries & Bus), Cedinsa Concesionaria (Toll Roads), Core Infrastructure Rail (Aves One/Wascosa) (Rail Leasing), Indigo Group (Parking), Lusoponte (Toll Roads), Metro de Malaga (Metro), Port Adhoc Group (Marinas), Snow Lion (EV Charging); Utilities: Coriance (District Heating), Loiste Oy (Electricity Distribution), Oslofjord Varme AS (District Heating), Proxiserve (Energy Services); Digital Infrastructure: Bluevia (Fiber Networks), Borealis Data Center (Data Centers), Vauban Infra Fibre (VIF) / Axione (Fiber Networks); Renewables / Energy Transition: BIOSYNERGY (Biogas), Cartier Energy (Wind), Green Create Wijster B.V. (Biogas); Communications: Cellnex Austrian Tower Business (Towers), Towerlink France SAS (Towers); Social Infrastructure: Arema (Velodrome of Marseille) (Sports), Progeni S.P.A (Healthcare); Waste / Environmental Services: Paprec (Waste Management)",
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
    description: "Sustainable real assets fund investing in utility-scale battery storage, clean mobility platforms, electric utilities, and agricultural decarbonization infrastructure globally, targeting 15-20% net IRR. Portfolio: Renewables / Energy Transition: Earthrise Energy (Solar), GSSG Chikuden (Battery Storage), Guzman Energy (Clean Energy Retail), Homer (Energy Analytics), Pelican Energy TCI (Solar), Sparkfund (Energy-as-a-Service), VisionRNG (RNG); Transportation: TeraWatt Infrastructure (EV Charging), VEMO (EV Fleet), YMX Logistics (Logistics)",
    sectors: ["Renewables / Energy Transition", "Transportation", "Power Generation"],
    regions: ["Global"],
  }),

  // Wafra
  f("FUND-215", "Wafra", "Wafra Real Assets & Infrastructure Fund II", "2022", "Undisclosed", null, "Core-Plus", "Deploying", {
    description: "Kuwait-backed infrastructure fund investing in aviation, digital infrastructure, marine/shipping, solar and battery storage, and logistics assets globally. Portfolio: Transportation: American Inland Marine Holdings (Maritime), Aquila Air Capital (Aircraft Leasing), Ascension FBO Network (FBO / Aviation), Contract Leasing Corporation (CLC) (Trailer Leasing), Hawthorne Global Aviation Services (FBO / Aviation), Signal Rail Holdings (Short-Line Rail), SKY Leasing (Aircraft Leasing), Suntex Marinas (Marinas), The Hinckley Company (Marinas); Renewables / Energy Transition: Greenflash Infrastructure (Battery Storage), Mission Clean Energy (Solar & Storage), NineDot Energy (Battery Storage); Digital Infrastructure: Beyond Data Centers (Data Centers), Vantage Data Centers (Data Centers); Midstream / Energy: Crescent Louisiana Midstream (Gathering & Processing); Power Generation: Lackawanna Energy Center (Gas-to-Power); Utilities: Intermountain Infrastructure Group (Utility Services)",
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
    description: "London-based captive infrastructure arm of Kuwait Investment Authority investing globally in airports, ports, water utilities, energy generation and transmission, midstream, and digital infrastructure with long-term hold mandates. Portfolio: Transportation: Associated British Ports (ABP) (Ports), Direct ChassisLink Inc. (DCLI) (Chassis Leasing), Electrip (EV Charging), Groupe Petit Forestier (Refrigerated Vehicle Leasing), London City Airport (LCY) (Airports), SeaCube Container Leasing (Container Leasing); Digital Infrastructure: i3 Broadband (Fiber Networks), QTS Northern Virginia Data Centers JV (Data Centers); Social Infrastructure: Almaviva Santé (Healthcare), Voyage Care (Specialist Care); Communications: Phoenix Tower International (PTI) (Towers); Midstream / Energy: North Sea Midstream Partners (Gas Processing); Power Generation: Global Power Generation (GPG) (Power Generation); Renewables / Energy Transition: Zorlu Enerji (Diversified Energy)",
    sectors: ["Transportation", "Utilities", "Power Generation", "Digital Infrastructure", "Midstream / Energy", "Water"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Sovereign Wealth Funds, Pension Funds & Other Institutional Investors ──

  // ADIA (Abu Dhabi Investment Authority)
  f("FUND-218", "ADIA (Abu Dhabi Investment Authority)", "ADIA Direct Infrastructure", "Evergreen", "N/A", null, "Core", "Evergreen", {
    description: "Abu Dhabi sovereign wealth fund's dedicated infrastructure department investing directly across four core sectors: utilities, energy, transport, and digital, supporting approximately 22 GW of renewable energy projects globally. Portfolio: Transportation: Cube Highways (Toll Roads), Gatwick Airport (Airports), GMR Airports (Airports), Malaysia Airports Holdings Berhad (MAHB) (Airports), Queensland Motorways (Toll Roads), Sumatra Toll Roads (Toll Roads), Sydney Airport (Airports), Trans-Java Toll Roads (Toll Roads), VTG (Rail Freight), WestConnex (Toll Roads); Digital Infrastructure: Aligned Data Centers (Data Centers), EdgeConneX (Data Centers), FiberCop (Fiber Networks), Jio Digital Fiber (Fiber Networks), NetCo SRL (Fiber Networks), Open Fiber (Fiber Networks), Vantage Data Centers APAC (Data Centers); Renewables / Energy Transition: AlphaGen (Renewables Platform), Arevon Energy (Solar & Storage), Equis Development (Renewables Platform), Greenko Energy Holdings (Renewables Platform), ReNew Power (Renewables Platform), Terna Energy (Wind & Solar); Utilities: Anglian Water Group (Water & Wastewater), Kemble Water Holdings (Thames Water) (Water & Wastewater), Scotia Gas Networks (SGN) (Gas Distribution), Transgrid (Electricity Transmission); Communications: Cellnex Telecom (Towers), EdgePoint Infrastructure (Towers), Landmark Dividend LLC (Ground Leases); Midstream / Energy: Sempra Infrastructure Partners (LNG & Pipelines), VTTI (Tank Storage); Logistics: GLP (Logistics Real Estate)",
    sectors: ["Utilities", "Midstream / Energy", "Transportation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Ancala Partners
  f("FUND-219", "Ancala Partners", "Ancala Essential Growth Infrastructure Fund", "2023", "£551M", 700, "Growth", "Deploying", {
    description: "Continuation-style growth fund providing expansion capital to existing Ancala portfolio companies including Portsmouth Water, Biogen (biogas/gas-to-grid), and Leep Utilities (last-mile utility networks) in the UK. Portfolio: Renewables / Energy Transition: Biogen (Biogas); Utilities: Leep Utilities (Multi-Utility); Water: Portsmouth Water (Water Supply)",
    sectors: ["Water", "Renewables / Energy Transition", "Utilities"],
    regions: ["Europe"],
  }),

  // APG Asset Management
  f("FUND-220", "APG Asset Management", "APG Direct Infrastructure Pool", "Evergreen", ">€33B", 36000, "Core", "Evergreen", {
    description: "Dutch pension fund manager's direct infrastructure investment program, one of the world's largest, investing in utilities, energy, and transportation assets globally. Portfolio: Renewables / Energy Transition: Doral Renewables (Solar), Gemini (Offshore Wind), Groendus (Solar & Wind), Merkur Offshore Wind (Offshore Wind), Noordzeker (Offshore Wind), Octopus Australia OASIS (Solar & Storage), Pattern Energy (Wind & Solar), Return (BESS platform) (Battery Storage), SkyNRG (Sustainable Aviation Fuel), Småkraft (Hydro), Vasa Vind (Wind); Transportation: Brisa (Toll Roads), Brussels Airport (Airports), Driveco (EV Charging), Interparking (Parking), Italo / NTV (High-Speed Rail), Itinere Infraestructuras (Toll Roads), Mer (EV Charging) (EV Charging), Saba Infraestructuras (Parking), Trans Java Toll Road (Toll Roads), Trans Sumatra Toll Road (Toll Roads); Digital Infrastructure: Conterra Networks (Fiber Networks), euNetworks (Fiber Networks), Glaspoort (Fiber Networks), Nexera (Fiber Networks), Open Fiber (Fiber Networks), Smart City Infrastructure Fund (SCIF) (Smart Cities), Voyage Holdings (Vocus) (Fiber Networks); Utilities: Ausgrid (Electricity Distribution), Celeo Redes (Electricity Transmission), Kenter (Smart Metering), Stockholm Exergi (District Heating), TenneT Germany (Electricity Transmission); Logistics: Peel Ports Group (Ports); Power Generation: Astoria Energy I and II (Gas-to-Power); Social Infrastructure: HICL UK Social Infrastructure Portfolio (PPP/PFI)",
    sectors: ["Utilities", "Power Generation", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Apollo Global Management
  f("FUND-221", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund II", "2022", "$2.54B", 2540, "Value-Add", "Deploying", {
    description: "Value-add infrastructure fund investing in complex, capital-intensive energy, power, and utility assets across North America and Europe with operational turnaround capabilities. Portfolio: Communications: Infrastructure Networks / INET (Fiber Networks), Parallel Infrastructure (Towers); Midstream / Energy: Energos Infrastructure (LNG); Renewables / Energy Transition: US Wind (Offshore Wind); Transportation: Primafrio (Logistics)",
    sectors: ["Power Generation", "Utilities", "Midstream / Energy"],
    regions: ["North America", "Europe"],
  }),

  // BCI (British Columbia Investment Management Corp)
  f("FUND-222", "BCI (British Columbia Investment Management Corp)", "BCI Infrastructure & Renewable Resources Program", "2005", "~C$28B", 21000, "Core", "Evergreen", {
    description: "Canadian pension fund's infrastructure platform investing directly in essential assets across utilities, transportation, renewable energy, and timber/agriculture globally. Portfolio: Utilities: Cleco Partners LP (Electric Utility), Corix Infrastructure Inc. (Water & Gas Distribution), Endeavour Energy (Electricity Distribution), National Gas (Gas Transmission), Puget Sound Energy (Electric & Gas Utility), Transelec (Electricity Transmission), Trencap LP (Energir) (Gas Distribution); Transportation: Arteris (Toll Roads), Cube Highways Trust (Toll Roads), Dalrymple Bay Coal Terminal (Port Terminal), Pacific National (Rail Freight), Patrick Terminals (Port Terminal); Digital Infrastructure: Frontier Towers (Towers), Rakuten Mobile (Infra JV) (Mobile Network), Summit Digitel (Data Infrastructure Trust) (Towers); Midstream / Energy: Exolum (CLH) (Fuel Storage & Transport), Nova Transportadora do Sudeste (NTS) (Gas Pipelines), Open Grid Europe (OGE) (Gas Transmission); Renewables / Energy Transition: Eku Energy (Battery Storage), Northview Energy (Solar & Storage), Reden Solar (Solar); Logistics: Linx Cargo Care Group (Intermodal Logistics); Power Generation: Isagen SA (Hydroelectric); Social Infrastructure: BBGI Global Infrastructure S.A. (PPP / PFI); Waste / Environmental Services: Renewi PLC (Waste Management); Water: Thames Water (Water & Wastewater Utility)",
    sectors: ["Utilities", "Transportation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Charlesbank Capital Partners
  f("FUND-223", "Charlesbank Capital Partners", "Charlesbank Technology Opportunities Fund", "2020", "~$5B", 5000, "Growth", "Deploying", {
    description: "Growth equity fund investing in technology-enabled infrastructure services including data centers, fiber, and managed IT services across North America. Portfolio: Digital Infrastructure: Six Degrees (Managed IT & Cloud)",
    sectors: ["Digital Infrastructure", "Communications"],
    regions: ["North America"],
  }),

  // AustralianSuper
  f("FUND-224", "AustralianSuper", "AustralianSuper Infrastructure Portfolio", "Evergreen", ">$30B", 30000, "Core", "Evergreen", {
    description: "Australia's largest pension fund's direct infrastructure program investing in essential assets globally including airports, toll roads, utilities, and renewable energy. Portfolio: Transportation: Perth Airport (Airports), Sydney Airport (Airports), Transurban Chesapeake (Toll Roads), Transurban Queensland (Toll Roads), WestConnex (Toll Roads); Digital Infrastructure: Cirion Technologies (Data Centers), DataBank (Data Centers), Indara Digital Infrastructure (Towers), Vantage Data Centers EMEA (Data Centers); Logistics: Moorebank Intermodal Precinct (Intermodal), NSW Ports (Ports), Peel Ports (Ports); Renewables / Energy Transition: Generate Capital (Sustainable Infrastructure); Utilities: Ausgrid (Electricity Distribution)",
    sectors: ["Transportation", "Utilities", "Renewables / Energy Transition", "Digital Infrastructure"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // CPP Investments
  f("FUND-225", "CPP Investments", "CPP Investments Infrastructure", "Evergreen", "~$60B", 60000, "Core", "Evergreen", {
    description: "Canada Pension Plan's infrastructure program, one of the world's largest direct investors, targeting essential utilities, transportation, energy, and renewables globally. Portfolio: Transportation: 407 ETR (Toll Roads), Arco Norte (Toll Roads), Associated British Ports (ABP) (Ports), Groupe ADP (Aéroports de Paris) (Airports), IDEAL (Toll Roads), IndInfravit Trust (Toll Roads), National Highways Infra Trust (NHIT) (Toll Roads), Pacifico Sur (Toll Roads), Ports America Group (Ports), Transurban Chesapeake (Toll Roads); Midstream / Energy: California Resources Corporation (Aera Energy) (Oil & Gas), Caturus Energy (Oil & Gas), Civitas Resources (Oil & Gas), Nephin Energy (Natural Gas), Sempra Infrastructure Partners (LNG), South Bow Energy (Pipelines), Tallgrass Energy (Pipelines), Teine Energy (Oil & Gas), Wolf Midstream (Pipelines); Renewables / Energy Transition: Cordelio Power (Wind & Solar), Fécamp Offshore Wind Farm (Offshore Wind), Maple Power (Offshore Wind), Pattern Energy (Wind & Solar), Power2X (Green Hydrogen), Renewable Power Capital (RPC) (Wind & Solar), Reventus Power (Wind & Solar); Utilities: Allete (Electric Utilities), Anglian Water Group (Water & Wastewater), Floen (Gas Distribution), Iguá Saneamento S.A. (Water & Wastewater), Transelec (Electricity Transmission); Power Generation: AlphaGen (Gas-to-Power), Inkia Energy (Power Generation), VoltaGrid (Distributed Power); Digital Infrastructure: AirTrunk (Data Centers), atNorth (Data Centers)",
    sectors: ["Utilities", "Transportation", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // IMCO
  f("FUND-226", "IMCO", "IMCO Infrastructure Fund", "Evergreen", "~$10B", 10000, "Core", "Evergreen", {
    description: "Ontario municipal employees' investment manager's infrastructure program investing in essential assets across transportation, utilities, and energy in developed markets. Portfolio: Renewables / Energy Transition: Algoma Hydro (Hydropower), Bioenergy Infrastructure Group (BIG) (Biomass / Biogas), NeXtWind Capital (Onshore Wind), Northvolt (Battery Manufacturing), Pulse Clean Energy (Battery Storage); Digital Infrastructure: DataBank (Data Centers), euNetworks (Fiber Networks), Scala Data Centers (Data Centers); Communications: Cellnex Nordics (Towers); Midstream / Energy: Exolum (Pipelines & Storage); Utilities: AusNet Services (Electricity Transmission)",
    sectors: ["Transportation", "Utilities", "Power Generation"],
    regions: ["North America", "Europe"],
    structure: "Permanent Capital",
  }),

  // Mubadala Investment Company
  f("FUND-227", "Mubadala Investment Company", "Mubadala Infrastructure", "Evergreen", "~$30B", 30000, "Core", "Evergreen", {
    description: "Abu Dhabi sovereign investor's infrastructure platform investing in utilities, digital infrastructure, power generation, and renewable energy across global markets. Portfolio: Transportation: AirFirst (Aviation Services), CUBE HIGHWAYS (Toll Roads), Hafeet Rail (Rail), Porto Sudeste (Ports), Rota das Bandeiras (Toll Roads), Terminal Investment Limited (Ports), Transportation Equipment Network (TEN) (Container Leasing); Digital Infrastructure: Aligned Data Centers (Data Centers), CityFibre (Fiber Networks), GlobalConnect (Fiber & Data Centers), Jio Platforms (Digital Services), Princeton Digital Group (PDG) (Data Centers), Yondr Group (Data Centers); Renewables / Energy Transition: Masdar (Diversified Renewables), PAG Renewable Energy Platform (Wind & Solar), Rezolv Energy (Wind & Solar), Skyborn Renewables (Offshore Wind), Tata Power Renewables (Wind & Solar), ZENOBE (Battery Storage & EV); Midstream / Energy: Dolphin Energy (Gas Pipelines), Enagás (Gas Transmission), Rio Grande LNG / NextDecade (LNG), Saudi Aramco Oil Pipelines (Pipelines), Sempra Infrastructure Partners (LNG & Utilities); Power Generation: Al Rusail Power (RPC) (Gas-to-Power), SMN Baraka Power Company (Nuclear), SMN Powerholding Company (Power Generation); Utilities: TABREED (District Cooling)",
    sectors: ["Utilities", "Digital Infrastructure", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // OMERS Infrastructure
  f("FUND-228", "OMERS Infrastructure", "OMERS Infrastructure Fund", "Evergreen", "~$30B", 30000, "Core", "Evergreen", {
    description: "Ontario municipal employees' pension fund's infrastructure platform investing directly in essential infrastructure assets globally, including utilities, transportation, and energy. Portfolio: Transportation: Associated British Ports (Ports), Bangalore International Airport (Airports), Direct ChassisLink Inc. (Chassis Leasing), Grandi Stazioni Retail (Rail Stations), Port of Melbourne (Ports), Tank & Rast (Motorway Services), VTG (Rail Freight); Utilities: Alectra (Electricity Distribution), Ellevio (Electricity Distribution), Kenter (Smart Metering), Oncor (Electricity Transmission), Puget Sound Energy (Electric & Gas Utilities), Thames Water (Water & Wastewater), Transgrid (Electricity Transmission); Renewables / Energy Transition: Azure Power (Solar), FRV Australia (Solar), Groendus (Wind & Solar), Interise Trust (Diversified Renewables), Leeward Renewable Energy (Wind & Solar), Navisun (Solar); Digital Infrastructure: Beanfield (Fiber Networks), Deutsche Glasfaser (Fiber Networks), Teranet (Land Registry), Waveconn (Fiber Networks), XPFibre (Fiber Networks); Social Infrastructure: amedes (Healthcare), Northstar New Jersey Lottery (Lottery); Midstream / Energy: Exolum (Pipelines & Storage); Power Generation: Bruce Power (Nuclear)",
    sectors: ["Utilities", "Transportation", "Power Generation", "Renewables / Energy Transition"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Ontario Teachers' Pension Plan
  f("FUND-229", "Ontario Teachers' Pension Plan", "OTPP Infrastructure & Natural Resources", "Evergreen", "~$30B", 30000, "Core", "Evergreen", {
    description: "Canadian pension fund's direct infrastructure investment program targeting large-scale essential assets in utilities, energy, transportation, and water globally. Portfolio: Renewables / Energy Transition: ACES Delta (Green Hydrogen), Azure Power (Solar), Corio Generation (Offshore Wind), Cubico Sustainable Investments (Wind & Solar), Equis Development (Diversified Renewables), Mahindra Susten (Solar), Sevana Bioenergy (Biomass); Utilities: Caruna (Electricity Distribution), Enwave Energy Corporation (District Energy), Evoltz (Electricity Transmission), Puget Sound Energy (PSE) (Electric & Gas Utilities), Scotia Gas Networks Ltd (SGN) (Gas Distribution), Spark Infrastructure (Electricity Distribution); Transportation: Chicago Skyway (Toll Roads), Global Container Terminals (GCT) (Ports), IDEAL (Toll Roads), National Highways Infra Trust (NHIT) (Toll Roads); Communications: Connexa (Towers); Digital Infrastructure: Compass Datacenters (Data Centers); Midstream / Energy: Aethon Energy (Natural Gas E&P)",
    sectors: ["Utilities", "Power Generation", "Transportation", "Water"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // Pantheon Ventures
  f("FUND-230", "Pantheon Ventures", "Pantheon Infrastructure Fund", "Various", "~$5B", 5000, "Core-Plus", "Deploying", {
    description: "London-listed closed-end investment company providing access to a globally diversified portfolio of infrastructure co-investments across digital, power, renewables, transport, and social infrastructure. Portfolio: Digital Infrastructure: CyrusOne (Data Centers), Delta Fiber (Fiber Networks), GlobalConnect (Fiber & Data Centers), National Broadband Ireland (Fiber Networks), Nexspace (Data Centers), ProLink Infrastructure (Fiber Networks), Vantage Data Centers (Data Centers); Communications: GD Towers (Towers), Vertical Bridge (Towers); Renewables / Energy Transition: Cartier Energy (Wind), Zenobē (Battery Storage & EV); Utilities: Fudura (Energy Services), National Gas (Gas Transmission); Transportation: Primafrio (Cold Chain Logistics)",
    sectors: ["Digital Infrastructure", "Power Generation", "Renewables / Energy Transition", "Transportation", "Social Infrastructure"],
    regions: ["Global"],
    structure: "Listed / Closed-End",
    ticker: "PINT.L",
    strategies: ["Core-Plus", "Co-Investments"],
  }),

  // Ridgemont Equity Partners
  f("FUND-231", "Ridgemont Equity Partners", "Ridgemont Infrastructure Fund", "Various", "~$2B", 2000, "Value-Add", "Deploying", {
    description: "Mid-market fund investing in essential infrastructure services companies in North America across power, utilities, and environmental services with operational improvement. Portfolio: Transportation: Omni Logistics / Forward Air (Logistics), RoadOne IntermodaLogistics (Intermodal); Utilities: Crete United (HVAC & Energy Services), Sparus Holdings (Utility Services); Midstream / Energy: M6 Midstream (Gathering & Processing); Power Generation: National Power (Distributed Power); Waste / Environmental Services: Northstar Recycling Company (Recycling)",
    sectors: ["Power Generation", "Utilities", "Waste / Environmental Services"],
    regions: ["North America"],
  }),

  // Riverstone Holdings
  f("FUND-232", "Riverstone Holdings", "Riverstone Holdings Fund", "Various", "~$8B", 8000, "Value-Add", "Deploying", {
    description: "Energy-focused private equity firm investing in power generation, midstream, renewable energy, and energy transition infrastructure across North America and globally. Portfolio: Renewables / Energy Transition: A2 Renovables (Solar), Abaco FCV (Solar), Clean Energy Fuels Corp (RNG & CNG), Energia Real (Solar), RIC Energy (Solar), SkySense (Solar), White River Renewables (Hydropower); Midstream / Energy: EPIC Propane Pipeline (Pipelines), ILX FCV (Oil & Gas), IMTT (Terminals & Storage), Max Midstream (Terminals), Teton Range (Oil & Gas); Transportation: VEMO (EV Fleet); Utilities: Seawolf Water Resources (Water)",
    sectors: ["Power Generation", "Midstream / Energy", "Renewables / Energy Transition"],
    regions: ["North America", "Global"],
  }),

  // Sixth Street
  f("FUND-233", "Sixth Street", "Sixth Street Infrastructure Fund", "Various", "~$5B", 5000, "Value-Add", "Deploying", {
    description: "Global investment firm providing flexible capital across infrastructure, energy, and renewables sectors, with over 6 GW of renewable power invested and active in power, midstream, social infrastructure, and data centers. Portfolio: Midstream / Energy: Antero Resources Royalty (Royalties), bp Onshore Midstream Assets (Gathering & Processing), Caliche Development Partners (Oil & Gas); Digital Infrastructure: Blue Stream Fiber (Fiber Networks), EdgeConneX (Data Centers); Power Generation: Enipower (Gas-to-Power), Sorgenia (Gas-to-Power); Renewables / Energy Transition: Spanish Solar PV Portfolio (Solar), US Energy Logistics Wind & Solar (Wind & Solar)",
    sectors: ["Power Generation", "Renewables / Energy Transition", "Midstream / Energy", "Social Infrastructure", "Digital Infrastructure"],
    regions: ["Global"],
    strategies: ["Value-Add", "Credit / Debt"],
  }),

  // StepStone Group
  f("FUND-234", "StepStone Group", "StepStone Infrastructure Fund", "Various", "~$5B", 5000, "Core-Plus", "Deploying", {
    description: "Infrastructure fund-of-funds, secondaries, and co-investment platform providing diversified exposure to global infrastructure across strategies and sectors. Portfolio: Renewables / Energy Transition: Australian Battery Storage Project (Battery Storage), Blue Road Capital PV II, L.P. (Solar), Eco-Stor (Battery Storage), ECP V (California Co-Invest), LP (Co-Investment SPV), Era Blade Continuation Fund Parallel Lp (Wind), NIC Battery Acquisition LP (Battery Storage), Peggy Aggregator, LLC (Co-Investment SPV), rPlus Energies (Solar & Storage), Sandbrook rPlus Co-Invest II LP (Solar & Storage), Walker Aggregator LP (Renewables Platform); Digital Infrastructure: KKR Devonshire Co-Invest L.P. (Co-Investment SPV), KKR Optics Co-Invest Blocker L.P. (Co-Investment SPV), Verrus (Data Centers); Transportation: Brussels Airport (Airports), Mundys (Toll Roads), Triton International (Container Leasing); Midstream / Energy: Buckeye Partners (Pipelines & Terminals), Stonepeak Ace Holdings LP (Energy Infrastructure)",
    sectors: ["Transportation", "Utilities", "Power Generation", "Digital Infrastructure", "Renewables / Energy Transition"],
    regions: ["Global"],
    strategies: ["Core-Plus", "Fund-of-Funds", "Secondaries", "Co-Investments"],
  }),

  // UBS Asset Management
  f("FUND-235", "UBS Asset Management", "UBS Infrastructure Fund", "Various", "~$5B", 5000, "Core", "Deploying", {
    description: "Open-end global infrastructure equity strategy investing in core/core-plus operational infrastructure assets across OECD countries in utilities, energy transition, telecommunications, transportation, and social infrastructure. Portfolio: Digital Infrastructure: Altitude Infrastructure (Fiber Networks), Datum Datacentres (Data Centers), FiberLight (Fiber Networks), Lefdal Mine Datacenter (Data Centers), Lünecom Kommunikationslösungen (Fiber Networks), Northern Fibre Holding (Fiber Networks), sewikom (Fiber Networks); Renewables / Energy Transition: Black Mountain Energy Storage Projects (Battery Storage), Captona BESS Portfolio (Battery Storage), Econergy Portfolio (Solar & Wind), Phoenix Wind Repower (Wind Repowering), Spinning Spur II (Onshore Wind); Utilities: Gascan (Gas Distribution), Southern Water (Water & Wastewater); Power Generation: Northern Star Generation (Gas-to-Power); Waste / Environmental Services: Saubermacher (Waste Management)",
    sectors: ["Utilities", "Renewables / Energy Transition", "Communications", "Transportation", "Social Infrastructure"],
    regions: ["Global"],
    structure: "Open-End",
  }),

  // GIC
  f("FUND-236", "GIC", "GIC Infrastructure", "Evergreen", ">$50B", 50000, "Core", "Evergreen", {
    description: "Singapore sovereign wealth fund's infrastructure program investing directly in utilities, digital infrastructure (including data center JVs), energy, and transport globally, with approximately $800 billion total fund AUM. Portfolio: Digital Infrastructure: CETIN Group (Telecom Infrastructure), CyrusOne (Data Centers), Equinix xScale Data Centres (Data Centers), Global Switch (Data Centers), Jio Platforms (Digital Services), Metronode (Data Centers), Searchlight Fiber Alliance (Fiber Networks), Summit Digitel (Reliance Jio Towers) (Towers), Virtus Data Centres (Data Centers); Renewables / Energy Transition: ACEN (AC Energy) (Renewables Platform), CelsiusTech (Vianode) (Battery Materials), EDP Renovaveis (Renewables Platform), Equis Energy (Diversified Renewables), Greenko Group (Diversified Renewables), InterContinental Energy (Green Hydrogen), Stegra (H2 Green Steel) (Green Steel / Hydrogen), Storegga (Carbon Capture & Storage), Vena Energy (Solar & Wind); Transportation: IFM (Melbourne Airport) (Airports), IRB Infrastructure Trust (Toll Roads), London Gatwick Airport (Airports), London Heathrow Airport (Airports), Red de Carreteras de Occidente (RCO) (Toll Roads), SATS Ltd (Airport Services), Southern Cross Airports (Sydney) (Airports); Utilities: Ausgrid (Electricity Distribution), Duke Energy Indiana (Electric Utility), Genus Power Smart Metering Platform (Smart Metering), ITC Holdings Corp (Transmission), National Gas Transmission (Gas Transmission), Sterlite Power Transmission JV (Transmission); Midstream / Energy: APT Pipelines (APA Group) (Gas Pipelines), Channel Infrastructure (Fuel Infrastructure), Puma Energy (Fuel Distribution), Sempra Infrastructure (LNG), Teréga (TIGF) (Gas Transmission & Storage); Communications: GD Towers (Towers), Telxius Towers (Towers); Water: Aegea (Water & Wastewater), Suez (now Veolia Environment) (Water & Waste); Logistics: IndoSpace (Industrial & Logistics Parks); Waste / Environmental Services: Climeworks (Carbon Capture)",
    sectors: ["Digital Infrastructure", "Utilities", "Transportation", "Renewables / Energy Transition", "Midstream / Energy"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),
];
