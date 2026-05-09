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

// ─── Helper to create fund entries ──────────────────────────

// Portfolio data now lives in src/data/portcos/ (PortCo Database)

const MANAGER_SOURCE_URLS: Record<string, string[]> = {
  "3i Group": ["https://www.3i-infrastructure.com/"],
  "Abu Dhabi Investment Authority (ADIA)": ["https://www.adia.ae/en/investments/infrastructure"],
  "AIMCo": ["https://www.aimco.ca/what-we-do/asset-classes/infrastructure-renewable-resources/"],
  "Amber Infrastructure Group": ["https://www.internationalpublicpartnerships.com/"],
  "Ancala Partners": ["https://www.ancala.com/"],
  "Antin Infrastructure Partners": ["https://www.antin-ip.com/"],
  "APG Asset Management": ["https://assetmanagement.apg.nl/infrastructure/"],
  "Apollo Global Management": ["https://www.apollo.com/strategies/asset-management/real-assets/infrastructure"],
  "Ara Partners": ["https://www.arapartners.com/what-we-do/strategies/infrastructure/"],
  "ArcLight Capital Partners": ["https://www.arclight.com/"],
  "Ardian": ["https://www.ardian.com/infrastructure"],
  "Ares Management": ["https://www.aresmgmt.com/our-business/infrastructure"],
  "Argo Infrastructure Partners": ["https://www.argoip.com/"],
  "Astatine Investment Partners": ["https://www.astatineip.com/"],
  "AustralianSuper": ["https://www.australiansuper.com/global-investors/capabilities/portfolio-asset-class-capabilities"],
  "Axium Infrastructure": ["https://axiuminfra.com/"],
  "Basalt Infrastructure Partners": ["https://www.basaltinfra.com/"],
  "BCI": ["https://www.bci.ca/investments/infrastructure-renewable-resources/"],
  "Bernhard Capital Partners": ["https://www.bernhardcapital.com/"],
  "BlackRock": ["https://www.blackrock.com/institutions/en-us/strategies/alternatives/infrastructure"],
  "BlackRock (GIP)": ["https://www.global-infra.com/"],
  "Blackstone": ["https://www.blackstone.com/our-businesses/infrastructure/"],
  "Blue Owl Capital": ["https://www.blueowl.com/real-assets"],
  "Brookfield": ["https://www.brookfield.com/our-businesses/infrastructure"],
  "Carlyle Group": ["https://www.carlyle.com/our-business/global-investment-solutions/infrastructure"],
  "CBRE Investment Management": ["https://www.cbreim.com/strategies-and-solutions/investment/private-infrastructure"],
  "CIM Group": ["https://www.cimgroup.com/investment-platforms/infrastructure"],
  "Connor, Clark & Lunn": ["https://cclprivatecapital.com/"],
  "Copenhagen Infrastructure Partners": ["https://www.cip.com/"],
  "CPP Investments": ["https://www.cppinvestments.com/the-fund/our-investments/real-assets/infrastructure/"],
  "CVC DIF": ["https://www.cvcdif.com/"],
  "DigitalBridge": ["https://www.digitalbridge.com/"],
  "Duration Capital Partners": ["https://durationcapital.com/"],
  "DWS": ["https://www.dws.com/en-gb/capabilities/alternatives/infrastructure/"],
  "EIG": ["https://www.eigpartners.com/"],
  "Ember Infrastructure Management": ["https://www.ember-infra.com/"],
  "Energy Capital Partners": ["https://www.ecpgp.com/about/"],
  "Energy Infrastructure Partners": ["https://www.energy-infrastructure-partners.com/"],
  "EQT": ["https://eqtgroup.com/en/infrastructure"],
  "Equilibrium": ["https://eq-cap.com/"],
  "Fengate Asset Management": ["https://fengate.com/infrastructure/"],
  "Fiera Infrastructure": ["https://www.fierainfrastructure.com/"],
  "GCM Grosvenor": ["https://www.gcmgrosvenor.com/investment-strategies/infrastructure/"],
  "Generate Capital": ["https://generatecapital.com/"],
  "GIC": ["https://www.gic.com.sg/what-we-do/investment-groups/infrastructure/"],
  "Goldman Sachs Alternatives": ["https://am.gs.com/en-us/advisors/products/infrastructure"],
  "Grain Management": ["https://grainmanagement.com/"],
  "H.I.G. Capital": ["https://higinfrastructure.com/"],
  "Harbert Management Corporation": ["https://www.harbert.net/investment-strategies/infrastructure/"],
  "Harrison Street": ["https://harrisonst.com/infrastructure/"],
  "I Squared Capital": ["https://isquaredcapital.com/"],
  "iCON Infrastructure": ["https://www.iconinfrastructure.com/"],
  "IFM Investors": ["https://www.ifminvestors.com/capabilities/know-how/"],
  "Igneo Infrastructure Partners": ["https://www.igneoip.com/"],
  "InfraBridge": ["https://www.infrabridge.com/"],
  "InfraRed Capital Partners": ["https://www.ircp.com/investments/"],
  "Instar Asset Management": ["https://instarinvest.com/"],
  "J.P. Morgan Asset Management": ["https://am.jpmorgan.com/us/en/asset-management/adv/funds/alternatives/infrastructure/"],
  "KKR": ["https://www.kkr.com/businesses/infrastructure"],
  "Kuwait Investment Authority (KIA)": ["https://www.wrenhouseinfra.com/"],
  "La Caisse de dépôt (CDPQ)": ["https://www.cdpq.com/en/investments/infrastructure"],
  "Macquarie Asset Management": ["https://www.macquarie.com/us/en/about/company/macquarie-asset-management/institutional-investor/capabilities/Infrastructure.html"],
  "Manulife Investment Management": ["https://www.manulifeim.com/institutional/global/en/strategies/private-markets/infrastructure"],
  "Meridiam": ["https://www.meridiam.com/"],
  "Morgan Stanley Infrastructure Partners": ["https://www.morganstanley.com/im/en-us/institutional-investor/about-us/investment-teams/real-assets/private-infrastructure-team.html"],
  "Morrison & Co": ["https://morrisonglobal.com/"],
  "Mubadala Investment Company": ["https://www.mubadala.com/en/what-we-do/investments/real-estate-infrastructure"],
  "Northampton Capital": ["https://www.northamptonllc.com/"],
  "Northleaf Capital Partners": ["https://www.northleafcapital.com/infrastructure/"],
  "OMERS Infrastructure": ["https://www.omersinfrastructure.com/"],
  "Ontario Teachers' Pension Plan": ["https://www.otpp.com/en-ca/investments/our-investments/infrastructure-and-natural-resources/"],
  "Partners Group": ["https://www.partnersgroup.com/en/our-investments/infrastructure"],
  "Qatar Investment Authority (QIA)": ["https://www.qia.qa/"],
  "QIC": ["https://www.qic.com/investment-capabilities/infrastructure"],
  "Quinbrook Infrastructure Partners": ["https://www.quinbrook.com/"],
  "Ridgewood Infrastructure": ["https://ridgewoodinfrastructure.com/"],
  "Sandbrook Capital": ["https://sandbrook.com/"],
  "SDC Capital Partners": ["https://sdccapitalpartners.com/"],
  "Searchlight Capital Partners": ["https://www.searchlightcap.com/"],
  "Stonepeak": ["https://stonepeak.com/"],
  "Swiss Life Asset Managers": ["https://www.swisslife-am.com/en/home/funds-invest/asset-classes/infrastructure.html"],
  "Tallvine Partners": ["https://www.tallvinepartners.com/"],
  "Temasek": ["https://www.temasek.com.sg/en/our-investments"],
  "Tiger Infrastructure Partners": ["https://www.tigerinfrastructure.com/"],
  "TPG": ["https://www.tpg.com/platforms/impact/rise-climate"],
  "Ullico": ["https://www.ullico.com/products/ullico-infrastructure-fund/"],
  "Vauban Infrastructure Partners": ["https://vauban-ip.com/en/about-us"],
  "Vision Ridge Partners": ["https://vision-ridge.com/"],
};

const FUND_SOURCE_URLS: Record<string, string[]> = {
  "FUND-001": [
    "https://www.3i-infrastructure.com/investors/results-reports-presentations/annual-report-2025/",
    "https://www.3i.com/infrastructure/our-funds/",
  ],
  "FUND-002": ["https://www.3i.com/infrastructure/our-funds/"],
  "FUND-005": ["https://www.internationalpublicpartnerships.com/"],
  "FUND-006": ["https://ancala.com/ancala-announces-final-close-of-third-flagship-infrastructure-fund/"],
  "FUND-007": ["https://www.antin-ip.com/media/our-news/antin-infrastructure-partners-closes-flagship-fund-v-above-e10-billion-target"],
  "FUND-008": ["https://www.antin-ip.com/media/our-news/antin-infrastructure-partners-closes-inaugural-mid-cap-fund-e22-billion-hard-cap"],
  "FUND-009": ["https://www.antin-ip.com/media/our-news/antin-holds-final-close-on-inaugural-nextgen-fund-at-e1-2-billion-target"],
  "FUND-011": ["https://www.apollo.com/wealth/strategies/products/apollo-infrastructure-company"],
  "FUND-012": ["https://www.apollo.com/institutional/insights-news/pressreleases/2023/04/apollo-launches-clean-transition-capital-strategy-to-support-firmwide-target-to-deploy-50-billion-by-2027-2654978"],
  "FUND-013": ["https://www.sec.gov/Archives/edgar/data/2002112/000095014224002977/xslFormDX01/primary_doc.xml"],
  "FUND-014": ["https://www.sec.gov/Archives/edgar/data/1961489/000095014225001711/xslFormDX01/primary_doc.xml"],
  "FUND-015": ["https://www.prnewswire.com/news-releases/ara-partners-closes-over-3-billion-of-new-capital-commitments-302013579.html"],
  "FUND-016": ["https://www.arapartners.com/what-we-do/strategies/energy/"],
  "FUND-017": ["https://www.arapartners.com/news/ara-partners-reaches-final-close-for-inaugural-infrastructure-fund-surpassing-target/"],
  "FUND-018": ["https://www.prnewswire.com/news-releases/arclight-announces-final-fund-viii-close-of-3-9-billion-302734967.html"],
  "FUND-019": ["https://www.ardian.com/press-releases/ardian-closes-its-second-generation-americas-infrastructure-fund-us21bn"],
  "FUND-020": ["https://www.ardian.com/news-insights/press-releases/ardian-raises-20bn-power-essential-european-infrastructure"],
  "FUND-021": ["https://www.areswms.com/solutions/aci"],
  "FUND-022": ["https://www.sec.gov/Archives/edgar/data/1970645/000092963824004318/xslFormDX01/primary_doc.xml"],
  "FUND-023": ["https://www.apollo.com/institutional/insights-news/pressreleases/2025/01/apollo-to-acquire-argo-infrastructure-partners-3008446"],
  "FUND-024": ["https://astatineip.com/2020/06/10/alinda-fund-iii-has-strong-gain-on-first-exit/"],
  "FUND-025": ["https://www.sec.gov/Archives/edgar/data/1831477/000183147720000001/xslFormDX01/primary_doc.xml"],
  "FUND-028": ["https://www.basaltinfra.com/wp-content/uploads/2026/01/Public-Full-Transparency-Report-Basalt-Infrastructure-Partners-2.pdf"],
  "FUND-029": ["https://find-and-update.company-information.service.gov.uk/company/LP024280"],
  "FUND-031": ["https://www.sec.gov/Archives/edgar/data/1936264/000193626423000001/xslFormDX01/primary_doc.xml"],
  "FUND-032": ["https://www.businesswire.com/news/home/20221024005921/en/BlackRock-Global-Infrastructure-Fund-IV-Raises-US%244.5-Billion-at-First-Close"],
  "FUND-033": ["https://www.sec.gov/Archives/edgar/data/2003071/000204912525000006/xslFormDX01/primary_doc.xml"],
  "FUND-034": ["https://www.global-infra.com/about/"],
  "FUND-035": ["https://www.sec.gov/Archives/edgar/data/2077639/000207763925000001/xslFormDX01/primary_doc.xml"],
  "FUND-036": ["https://www.sec.gov/Archives/edgar/data/1950567/000195056725000002/xslFormDX01/primary_doc.xml"],
  "FUND-037": ["https://www.sec.gov/Archives/edgar/data/2087294/000208729425000001/xslFormDX01/primary_doc.xml"],
  "FUND-038": ["https://www.blackrock.com/corporate/newsroom/press-releases/article/corporate-one/press-releases/blackrock-global-infrastructure-partners-microsoft-and-mgx-launch-new-ai"],
  "FUND-039": ["https://www.sec.gov/Archives/edgar/data/1735632/000173563225000001/xslFormDX01/primary_doc.xml"],
  "FUND-040": ["https://www.blackstone.com/fund/blackstone-infrastructure-strategies-eltif-bxinfra/"],
  "FUND-041": ["https://www.blackstone.com/news/press/blackstone-announces-5-6-billion-final-close-for-blackstone-energy-transition-partners-iv-at-hard-cap/"],
  "FUND-042": ["https://www.sec.gov/Archives/edgar/data/2112720/000211272026000001/xslFormDX01/primary_doc.xml"],
  "FUND-043": ["https://ir.blueowl.com/Investors/news/news-details/2025/Blue-Owl-Capital-Announces-7-Billion-Final-Close-for-Digital-Infrastructure-Fund/default.aspx"],
  "FUND-044": ["https://bam.brookfield.com/press-releases/brookfield-launches-100-billion-ai-infrastructure-program"],
  "FUND-045": ["https://bam.brookfield.com/press-releases/brookfield-raises-20-billion-record-transition-fund"],
  "FUND-046": ["https://bam.brookfield.com/press-releases/brookfield-raises-record-30-billion-flagship-infrastructure-strategy"],
  "FUND-047": ["https://privatewealth.brookfield.com/fund/brookfield-infrastructure-income-fund-0"],
  "FUND-048": ["https://www.globenewswire.com/news-release/2025/03/11/3040401/0/en/Brookfield-Closes-Infrastructure-Structured-Solutions-Fund.html"],
  "FUND-049": ["https://www.sec.gov/Archives/edgar/data/1470924/000146064610000002/xslFormDX01/primary_doc.xml"],
  "FUND-050": ["https://www.sec.gov/Archives/edgar/data/1742013/000174201325000002/xslFormDX01/primary_doc.xml"],
  "FUND-051": ["https://www.carlyle.com/media-room/news-release-archive/carlyle-group-raises-22-billion-global-infrastructure-opportunity"],
  "FUND-052": ["https://www.sec.gov/Archives/edgar/data/2075288/000207528825000001/xslFormDX01/primary_doc.xml"],
  "FUND-053": ["https://www.sec.gov/Archives/edgar/data/1933884/000193388423000002/xslFormDX01/primary_doc.xml"],
  "FUND-054": ["https://www.cbreim.com/strategies-and-solutions/investment/private-infrastructure"],
  "FUND-055": ["https://www.sec.gov/Archives/edgar/data/1900624/000190062423000003/xslFormDX01/primary_doc.xml"],
  "FUND-056": ["https://www.cip.com/funds/flagship-funds/"],
  "FUND-057": ["https://cclinfrastructure.cclgroup.com/"],
  "FUND-059": ["https://www.cvcdif.com/news-insights/dif-capital-partners-raises-eur-68-billion-for-its-latest-infrastructure-funds"],
  "FUND-060": ["https://www.cvcdif.com/news-insights/dif-capital-partners-raises-eur-68-billion-for-its-latest-infrastructure-funds"],
  "FUND-061": [
    "https://www.pa.gov/content/dam/copapwp-pagov/en/psers/documents/board3/resolutions/2025/2025-58%20pserb%20resolution%20dif%20infrastructure%20fund%20viii%20scsp.pdf",
    "https://nj.gov/njbonds/treasury/doinvest/pdf/AlternativeInvestments/RealAsset/DIF_Infrastructure_VIII_SCSp.pdf",
    "https://www.cvc.com/media/news/2026/full-year-2025-activity-update/",
  ],
  "FUND-062": ["https://www.cvc.com/media/news/2026/full-year-2025-activity-update/"],
  "FUND-063": ["https://www.digitalbridge.com/press"],
  "FUND-064": ["https://durationcapital.com/"],
  "FUND-065": [
    "https://www.eib.org/en/products/equity/funds/pan-european-infrastructure-3",
    "https://www.dws.com/AssetDownload/Index?assetGuid=0612b36b-92ef-428c-9981-9c75ed30a267&consumer=E-Library",
  ],
  "FUND-066": ["https://www.ecpgp.com/about/news-and-insights/press-releases/2024/energy-capital-partners-ecp-completes-67-billion-fundraise"],
  "FUND-068": ["https://www.sec.gov/Archives/edgar/data/1712778/000171277818000003/xslFormDX01/primary_doc.xml"],
  "FUND-069": ["https://energy-infrastructure-partners.com/products/"],
  "FUND-070": ["https://www.sec.gov/Archives/edgar/data/1991445/000199144525000002/xslFormDX01/primary_doc.xml"],
  "FUND-071": ["https://eqtgroup.com/news/eqt-active-core-infrastructure-fund-holds-final-close-2024-09-24"],
  "FUND-072": ["https://eqtgroup.com/news/eqt-ab-publ-q1-annoucement-2026-2026-04-22"],
  "FUND-073": ["https://eqtgroup.com/news/eqt-infrastructure-vi-holds-final-close-at-its-hard-cap-raising-eur-215-billion-in-total-commitments-2025-03-28"],
  "FUND-074": [
    "https://eqtgroup.com/infrastructure/eqt-transition-infrastructure",
    "https://eqtgroup.com/news/eqt-introduces-the-eqt-transition-infrastructure-strategy-with-the-acquisition-of-energy-storage-system-developer-and-operator-ju-niz-energy",
  ],
  "FUND-075": [
    "https://www.dbj.jp/en/topics/dbj_news/2020/html/20201119_202978.html",
    "https://eq-cap.com/development-bank-of-japan-invests-in-equilibrium-capitals-controlled-environment-foods-fund-ii/",
  ],
  "FUND-076": ["https://fengate.com/news/fengate-announces-final-close-of-us1-1-billion-flagship-infrastructure-fund-above-target"],
  "FUND-077": ["https://fengate.com/news/fengate-announces-final-close-of-us1-1-billion-flagship-infrastructure-fund-above-target"],
  "FUND-078": ["https://www.fierainfrastructure.com/wp-content/uploads/default/20240529/assetco-successfully-completes-exit-from-infrastructure-asset-management-business-en.pdf"],
  "FUND-079": ["https://www.fierainfrastructure.com/en/strategies/eaglecrest-infrastructure/"],
  "FUND-080": ["https://www.gcmgrosvenor.com/2025/04/22/gcm-grosvenor-announces-1-3-billion-final-close-for-infrastructure-advantage-fund-ii-a-nearly-50-increase-over-its-predecessor-fund/"],
  "FUND-081": ["https://generatecapital.com/"],
  "FUND-083": ["https://graingp.com/about/"],
  "FUND-084": ["https://www.sec.gov/Archives/edgar/data/1984790/000095014224001965/xslFormDX01/primary_doc.xml"],
  "FUND-085": ["https://am.gs.com/en-int/institutions/news/press-release/2025/g-infra-launch"],
  "FUND-086": ["https://am.gs.com/en-int/advisors/news/press-release/2023/Goldman-Sachs-Asset-Management-Completes-Final-Close-of-Horizon-Environment-and-Climate-Solutions-I"],
  "FUND-087": ["https://am.gs.com/en-us/advisors/news/press-release/2023/goldman-sachs-asset-management-raises-4-billion-for-west-street-infrastructure-partners-iv"],
  "FUND-088": ["https://www.sec.gov/Archives/edgar/data/2081965/000208196525000001/xslFormDX01/primary_doc.xml"],
  "FUND-089": ["https://higinfrastructure.com/news/h-i-g-capital-raises-1-3-billion-for-infrastructure-fund/"],
  "FUND-090": ["https://www.globenewswire.com/news-release/2022/10/06/2529666/0/en/harbert-infrastructure-fund-vi-lp-announces-final-close.html"],
  "FUND-091": ["https://www.sec.gov/Archives/edgar/data/2080982/000208098225000001/xslFormDX01/primary_doc.xml"],
  "FUND-092": [
    "https://www.sec.gov/Archives/edgar/data/1744138/000174413825000002/xslFormDX08/primary_doc.xml",
    "https://www.sec.gov/Archives/edgar/data/1744140/000174414024000001/xslFormDX01/primary_doc.xml",
  ],
  "FUND-093": ["https://isquaredcapital.com/cpt_news/i-squared-capital-accelerates-u-s-energy-transition-with-acquisition-of-oregons-premier-renewable-fuels-terminal/"],
  "FUND-094": [
    "https://www.pa.gov/content/dam/copapwp-pagov/en/psers/documents/board3/resolutions/2025/2025.21%20pserb%20resolution%20i%20squared%20global%20infrastructure%20fund%20iv.pdf",
    "https://www.sec.gov/Archives/edgar/data/2049770/000204977025000002/xslFormDX01/primary_doc.xml",
  ],
  "FUND-095": ["https://www.iconinfrastructure.com/"],
  "FUND-096": ["https://www.ifminvestors.com/capabilities/know-how/"],
  "FUND-097": [
    "https://www.ifminvestors.com/capabilities/know-how/",
    "https://www.green.ch/en/about-green/who-we-are/ifm-investors",
  ],
  "FUND-098": ["https://www.igneoip.com/australia/en/institutional/news-and-insights/press/igneo-refinances-green-tranche-credit-facility.html"],
  "FUND-099": ["https://www.sec.gov/Archives/edgar/data/2036260/000203626025000003/xslFormDX01/primary_doc.xml"],
  "FUND-100": [
    "https://www.infrabridge.com/",
    "https://www.infrabridge.com/news/2023-02-03-digitalbridge-completes-acquisition-of-amp-capital-global-infrastructure-equity-investment-management-business",
  ],
  "FUND-101": ["https://www.ircp.com/who-we-are/"],
  "FUND-102": ["https://www.hicl.com/"],
  "FUND-103": [
    "https://www.sec.gov/Archives/edgar/data/2107530/000210753026000001/xslFormDX01/primary_doc.xml",
    "https://www.sec.gov/Archives/edgar/data/1967019/000196701925000002/xslFormDX01/primary_doc.xml",
  ],
  "FUND-104": ["https://www.nasdaq.com/press-release/south-jersey-industries-inc.-enters-into-agreement-to-be-acquired-by-the"],
  "FUND-105": [
    "https://kseries.kkr.com/infrastructure/",
    "https://www.sec.gov/Archives/edgar/data/1933581/000193358126000001/xslFormDX01/primary_doc.xml",
  ],
  "FUND-106": ["https://www.sec.gov/Archives/edgar/data/2015282/000201528325000005/xslFormDX01/primary_doc.xml"],
  "FUND-107": [
    "https://www.sec.gov/Archives/edgar/data/2022923/000202292324000002/xslFormDX01/primary_doc.xml",
    "https://www.sec.gov/Archives/edgar/data/2022923/000202292325000001/xslFormDX01/primary_doc.xml",
  ],
  "FUND-108": ["https://kseries.kkr.com/infrastructure/"],
  "FUND-109": ["https://www.wrenhouseinfra.com/"],
  "FUND-111": ["https://www.macquarie.com/au/en/about/company/macquarie-asset-management/financial-advisor/investments/unlisted-infrastructure.html"],
  "FUND-112": ["https://www.greeninvestmentgroup.com/en/news/2024/macquarie-green-energy-and-climate-opportunities-fund-acquires-p.html"],
  "FUND-113": ["https://www.macquarie.com/ph/en/about/news/2025/macquarie-asset-management-reaches-us3-billion-close-of-green-energy-transition-solutions-fund-and-co-investment-commitment.html"],
  "FUND-114": ["https://www.macquarie.com/au/en/about/company/macquarie-asset-management/financial-advisor/investments/unlisted-infrastructure.html"],
  "FUND-115": ["https://www.businesswire.com/news/home/20250617787003/en/Macquarie-Asset-Management-Closes-Macquarie-Infrastructure-Partners-VI-With-Over-%24US8-Billion-of-Total-Fund-and-Co-Investment-Commitments"],
  "FUND-116": ["https://www.sec.gov/Archives/edgar/data/2123130/000212313026000001/xslFormDX01/primary_doc.xml"],
  "FUND-117": ["https://www.prnewswire.com/news-releases/manulife-investment-managements-infrastructure-fund-iii-reaches-us-5-5-billion-in-an-oversubscribed-close-302578671.html"],
  "FUND-118": ["https://www.meridiam.com/news/meridiam-successfully-closes-mina-iv-its-flagship-north-america-infrastructure-fund-raising-more-than-1-8-billion/"],
  "FUND-119": ["https://www.morganstanley.com/press-releases/msim-closes-fourth-global-infrastructure-fund"],
  "FUND-120": ["https://infratil.com/"],
  "FUND-121": ["https://morrisonglobal.com/"],
  "FUND-122": ["https://morrisonglobal.com/sites/mn/assets/Form-21-3_Explanatory-Document_B.pdf"],
  "FUND-124": [
    "https://www.sec.gov/Archives/edgar/data/2043231/000204323125000002/xslFormDX01/primary_doc.xml",
    "https://www.sec.gov/Archives/edgar/data/2043228/000204322825000002/xslFormDX01/primary_doc.xml",
  ],
  "FUND-125": ["https://www.kirkland.com/news/press-release/2021/11/kirkland-advises-northleaf-on-infra-fund"],
  "FUND-126": ["https://www.northleafcapital.com/news/northleaf-hits-hard-cap-final-close-its-us26-billion-infrastructure-fund"],
  "FUND-130": ["https://www.cefc.com.au/media/media-release/cefc-backs-new-qic-infrastructure-investment-to-accelerate-energy-transition/"],
  "FUND-131": ["https://www.quinbrook.com/news-insights/quinbrook-exceeds-target-for-net-zero-power-strategy-raising-usd-3-billion-in-capital-commitments/"],
  "FUND-132": ["https://www.prnewswire.com/news-releases/ridgewood-infrastructure-announced-1-2-billion-final-close-for-fund-ii-significantly-surpassing-its-target-302352437.html"],
  "FUND-133": ["https://www.sec.gov/Archives/edgar/data/2075494/000206508925000001/xslFormDX01/primary_doc.xml"],
  "FUND-134": ["https://www.sec.gov/Archives/edgar/data/2005226/000200522624000001/xslFormDX01/primary_doc.xml"],
  "FUND-135": [
    "https://www.gic.com.sg/thinkspace/emerging-markets/infrastructure-a-resilient-strategy-in-uncertain-times/",
    "https://searchlightcap.com/news/mainstream-fiber-networks-plans-rapid-expansion-with-strategic-investment-from-searchlight-capital-partners/",
  ],
  "FUND-136": ["https://www.sec.gov/Archives/edgar/data/2074413/000207441325000001/xslFormDX01/primary_doc.xml"],
  "FUND-137": ["https://www.sec.gov/Archives/edgar/data/2003495/000200349525000001/xslFormDX01/primary_doc.xml"],
  "FUND-138": ["https://www.sec.gov/Archives/edgar/data/2030457/000203045726000001/xslFormDX01/primary_doc.xml"],
  "FUND-139": ["https://www.sec.gov/Archives/edgar/data/2098508/000209850825000001/xslFormDX01/primary_doc.xml"],
  "FUND-140": ["https://www.swisslife-am.com/en/home/media/news/switzerland/institutional/2023/0502-infrastructure-fund.html"],
  "FUND-141": ["https://www.swisslife-am.com/en/home/media/news/corporate/company-news/2024/0704-gio-4.html"],
  "FUND-142": ["https://www.sec.gov/Archives/edgar/data/2017078/000201707825000003/xslFormDX01/primary_doc.xml"],
  "FUND-144": ["https://www.sec.gov/Archives/edgar/data/1995540/000199554025000003/xslFormDX01/primary_doc.xml"],
  "FUND-145": [
    "https://www.sec.gov/Archives/edgar/data/1985097/000198509724000001/xslFormDX01/primary_doc.xml",
    "https://www.sec.gov/Archives/edgar/data/1880661/000188066126000011/tpg-20251231.htm",
  ],
  "FUND-146": [
    "https://www.tpg.com/platforms/impact/rise-climate",
    "https://www.sec.gov/Archives/edgar/data/2014691/000201469126000001/xslFormDX01/primary_doc.xml",
    "https://www.sec.gov/Archives/edgar/data/1880661/000188066126000033/tpg-20260331.htm",
  ],
  "FUND-147": ["https://www.ullico.com/products/ullico-infrastructure-fund/"],
  "FUND-148": ["https://vauban-ip.com/en/about-us"],
  "FUND-149": ["https://www.streetinsider.com/Business%2BWire/Vision%2BRidge%2BPartners%2BRaises%2B~%242.4%2BBillion%2Bfor%2BFlagship%2BSustainable%2BReal%2BAssets%2BStrategy/25980007.html"],
  "FUND-150": ["https://www.sec.gov/Archives/edgar/data/1971296/000197129625000002/xslFormDX01/primary_doc.xml"],
};

function uniqUrls(urls: string[]): string[] {
  return Array.from(new Set(urls.filter(Boolean)));
}

function getFundSourceUrls(id: string, managerName: string, sourceUrls: string[] = []): string[] {
  const directSources = uniqUrls([
    ...sourceUrls,
    ...(FUND_SOURCE_URLS[id] ?? []),
  ]);
  return directSources.length > 0 ? directSources : uniqUrls(MANAGER_SOURCE_URLS[managerName] ?? []);
}

function getStrategyUrl(managerName: string): string {
  return MANAGER_SOURCE_URLS[managerName]?.[0] ?? "";
}

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
    sourceUrls: getFundSourceUrls(id, managerName, overrides?.sourceUrls),
    size,
    sizeUsdMm,
    vintage,
    strategies: overrides?.strategies ?? [strategy],
    structure: overrides?.structure ?? (status === "Evergreen" ? "Evergreen" as FundStructure : "Closed-End" as FundStructure),
    status,
    sectors: overrides?.sectors ?? [],
    regions: overrides?.regions ?? [],
    portfolioCompanies: [],
    strategyUrl: overrides?.strategyUrl ?? getStrategyUrl(managerName),
  };
}

// ─── Fund Manifest (150 funds) ──────────────────────────────
// ─── End Manifest ──────────────────────────────────────────

export const funds: Fund[] = [
  // ── 3i Group ──────────────────────────────────────────────
  f("FUND-001", "3i Group", "3i Infrastructure plc", "Evergreen", "£3.8B", 4940, "Core-Plus", "Evergreen", {
    investmentStrategy: "London-listed evergreen core-plus vehicle investing in resilient economic infrastructure businesses across Europe and selectively elsewhere for long-term sustainable returns.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Europe"],
    structure: "Listed / Evergreen",
    ticker: "3IN.L",
  }),
  f("FUND-002", "3i Group", "3i NA Infrastructure Fund", "2022", "$739M", 739, "Core-Plus", "Financial Close", {
    investmentStrategy: "Inaugural North American mid-market infrastructure fund using 3i's core-plus/value-add approach; final close completed in December 2023.",
    sectors: ["Digital", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),

  // ── ADIA ──────────────────────────────────────────────────
  f("FUND-003", "Abu Dhabi Investment Authority (ADIA)", "ADIA Direct Infrastructure", "Evergreen", "—", null, "Core", "Evergreen", {
    investmentStrategy: "Evergreen direct infrastructure program making minority investments across transport, utilities, energy, and digital infrastructure, with a substantial renewables theme.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── AIMCo ─────────────────────────────────────────────────
  f("FUND-004", "AIMCo", "AIMCo Direct Infrastructure Investment", "Evergreen", ">C$100B", 74000, "Core", "Evergreen", {
    investmentStrategy: "Evergreen direct infrastructure program focused on essential-service utilities, power, and transport assets, with disclosed holdings spanning regulated networks, renewables, midstream, and transport.",
    sectors: ["Power & ET", "Utilities", "Midstream", "Transportation"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Amber Infrastructure Group ────────────────────────────
  f("FUND-005", "Amber Infrastructure Group", "International Public Partnerships (INPP)", "Evergreen", "£3.0B", 3900, "Core", "Evergreen", {
    investmentStrategy: "Listed evergreen investor in public infrastructure seeking stable, inflation-linked returns; the observable book blends social PPPs with regulated utility, transport, wastewater and digital assets.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["Europe"],
    structure: "Listed / Evergreen",
    ticker: "INPP.L",
  }),

  // ── Ancala Partners ───────────────────────────────────────
  f("FUND-006", "Ancala Partners", "Ancala Infrastructure Fund III", "2022", "€1.4B", 1540, "Core-Plus", "Financial Close", {
    investmentStrategy: "Third flagship Ancala fund pursuing bilaterally sourced, downside-protected mid-market infrastructure across essential sectors, with active value creation rather than a narrow single-theme approach.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Europe"],
  }),

  // ── Antin Infrastructure Partners ─────────────────────────
  f("FUND-007", "Antin Infrastructure Partners", "Antin Flagship Fund 5", "2022", "€10.2B", 11220, "Value-Add", "Financial Close", {
    investmentStrategy: "Large-ticket value-add fund investing in established infrastructure platforms across Europe and North America; typically writes ~€600m-€1bn+ equity checks.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-008", "Antin Infrastructure Partners", "Antin Mid Cap Fund I", "2021", "€2.2B", 2420, "Value-Add", "Financial Close", {
    investmentStrategy: "Smaller-ticket version of Antin's flagship strategy, targeting established infrastructure companies in Europe and North America with ~€50m-€300m equity tickets.",
    sectors: ["Digital", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-009", "Antin Infrastructure Partners", "Antin NextGen Fund I", "2021", "€1.2B", 1320, "Opportunistic", "Financial Close", {
    investmentStrategy: "Next-generation infrastructure strategy backing scalable, sustainability-linked platforms and technologies across Europe and North America.",
    sectors: ["Power & ET", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
  }),

  // ── APG Asset Management ──────────────────────────────────
  f("FUND-010", "APG Asset Management", "APG Direct Infrastructure Pool", "Evergreen", "€33.0B", 36300, "Core", "Evergreen", {
    investmentStrategy: "Closest public match is APG Infrastructure Pool 2020-2021 within APG's broader direct infrastructure program: a long-term global pool spanning multiple asset styles, sectors and regions, with major exposure to power, transport, social and digital themes.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Apollo Global Management ──────────────────────────────
  f("FUND-011", "Apollo Global Management", "Apollo Infrastructure Company (AIC)", "Evergreen", "$1.7B", 1700, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Evergreen Apollo infrastructure vehicle pursuing income and appreciation through control acquisitions, financings and strategic investments across essential infrastructure sectors.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-012", "Apollo Global Management", "Apollo Clean Transition Equity Partners I", "2023", "$4.0B", 4000, "Opportunistic", "Financial Close", {
    investmentStrategy: "Apollo clean-transition equity strategy funding businesses tied to clean power, industrial decarbonization and other climate-enabling infrastructure themes.",
    sectors: ["Power & ET", "Utilities", "Digital"],
    regions: ["Global"],
  }),
  f("FUND-013", "Apollo Global Management", "Apollo Clean Transition Equity Partners II", "2024", "[TBD]", null, "Opportunistic", "Raising", {
    investmentStrategy: "Successor Apollo clean-transition equity vehicle with the same broad remit across energy transition, industrial decarbonization and related enabling infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital"],
    regions: ["Global"],
  }),
  f("FUND-014", "Apollo Global Management", "Apollo Infrastructure Opportunities Fund III", "2023", "$2.4B", 2400, "Value-Add", "Financial Close", {
    investmentStrategy: "Mid-market Apollo infrastructure fund providing flexible capital across power, renewables, transport and digital infrastructure in North America and Europe.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["North America", "Europe"],
  }),

  // ── Ara Partners ──────────────────────────────────────────
  f("FUND-015", "Ara Partners", "Ara Fund III", "2023", "$2.8B", 2800, "Opportunistic", "Financial Close", {
    investmentStrategy: "Third Ara flagship private-equity fund focused on industrial decarbonization buyouts and growth investments rather than classic diversified infrastructure.",
    sectors: ["Power & ET", "Social Infra"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-016", "Ara Partners", "Ara Energy Decarbonization Fund I", "2026", "$1.5B", 1500, "Value-Add", "Raising", {
    investmentStrategy: "Inaugural Ara Energy vehicle focused on acquiring operating conventional-energy assets and decarbonizing them through operational optimization, fuel transition and retrofit pathways.",
    sectors: ["Power & ET", "Utilities", "Midstream", "Transportation"],
    regions: ["North America"],
  }),
  f("FUND-017", "Ara Partners", "Ara Infrastructure Fund I", "2025", "$800M", 800, "Value-Add", "Financial Close", {
    investmentStrategy: "Debut Ara infrastructure vehicle that reached final close above target in May 2025, targeting mid-market industrial-decarbonization infrastructure by building or repurposing assets for the lower-carbon economy.",
    sectors: ["Power & ET", "Digital", "Midstream", "Social Infra"],
    regions: ["North America", "Europe"],
  }),

  // ── ArcLight Capital Partners ─────────────────────────────
  f("FUND-018", "ArcLight Capital Partners", "ArcLight Infrastructure Partners Fund VIII", "2026", "$3.9B", 3900, "Opportunistic", "Financial Close", {
    investmentStrategy: "Eighth flagship ArcLight infrastructure vehicle, which reached final close in April 2026 above its original $3.0B target and focuses on electrification infrastructure through power, renewables, strategic gas, storage, transmission, midstream and digital infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream"],
    regions: ["North America"],
  }),

  // ── Ardian ────────────────────────────────────────────────
  f("FUND-019", "Ardian", "Ardian Americas Infrastructure Fund V (AAIF V)", "2022", "$2.1B", 2100, "Core-Plus", "Financial Close", {
    investmentStrategy: "Ardian's second-generation Americas mid-market essential-infrastructure fund, focused on telecom, transport and energy-transition assets across the US and other OECD American markets.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation"],
    regions: ["North America"],
  }),
  f("FUND-020", "Ardian", "Ardian Infrastructure Fund VI", "2023", "€11.5B", 12650, "Core-Plus", "Financial Close", {
    investmentStrategy: "Ardian's flagship European infrastructure platform, continuing its long-running industrial approach across energy, transport and digital infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
  }),

  // ── Ares Management ───────────────────────────────────────
  f("FUND-021", "Ares Management", "Ares Core Infrastructure Fund (ACI)", "Evergreen", "$3.9B", 3900, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Evergreen core infrastructure income vehicle investing in long-contracted or rate-regulated assets, with disclosed exposure centered on renewables, power, pipelines/LNG and some telecom/digital holdings.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-022", "Ares Management", "Ares Climate Infrastructure Partners II", "Raising", "[$3.0B]", 3000, "Opportunistic", "Raising", {
    investmentStrategy: "Successor Ares climate infrastructure fund providing flexible capital to renewable, storage, efficiency, electrification and transmission-oriented businesses, with selective digital-enablement exposure.",
    sectors: ["Power & ET", "Utilities", "Digital"],
    regions: ["North America", "Europe"],
  }),

  // ── Argo Infrastructure Partners ──────────────────────────
  f("FUND-023", "Argo Infrastructure Partners", "Argo Series 3", "2021", "$2.0B", 2000, "Core", "Financial Close", {
    investmentStrategy: "Core-style Series 3 within Argo's essential mid-market platform, historically anchored in utilities, power, transmission and water and broadened over time into data centers and transportation.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),

  // ── Astatine Investment Partners ──────────────────────────
  f("FUND-024", "Astatine Investment Partners", "Alinda Infrastructure Fund III", "2018", "$1.0B", 1000, "Value-Add", "Financial Close", {
    investmentStrategy: "Mid-market infrastructure fund focused on North America and Europe within the broader Alinda/Astatine franchise, whose historical deployment centers on transport, utilities, digital and midstream assets.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-025", "Astatine Investment Partners", "Alinda Infrastructure Fund IV", "2021", "$586M", 586, "Value-Add", "Financial Close", {
    investmentStrategy: "Continuation vehicle for Astatine's mid-market infrastructure strategy; official Fund IV disclosures explicitly target transportation and logistics, utility-related infrastructure and digital infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["North America", "Europe"],
  }),

  // ── AustralianSuper ───────────────────────────────────────
  f("FUND-026", "AustralianSuper", "AustralianSuper Infrastructure Portfolio", "Evergreen", ">$30.0B", 30000, "Core-Plus", "Evergreen", {
    investmentStrategy: "Evergreen pension infrastructure sleeve within AustralianSuper's Mid-Risk real-assets platform, using large direct stakes in unlisted assets; current disclosed holdings tilt to transport/logistics and digital infrastructure, with energy transition an explicit deployment theme.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation"],
    regions: ["Global", "Asia-Pacific"],
    structure: "Permanent Capital",
  }),

  // ── Axium Infrastructure ──────────────────────────────────
  f("FUND-027", "Axium Infrastructure", "AxInfra Fund I-IV", "Evergreen", "[TBD]", null, "Core", "Evergreen", {
    investmentStrategy: "Core infrastructure series targeting brownfield and greenfield energy, transportation, and social assets in OECD markets, typically backed by long-term contracts, concessions, or regulated frameworks. Public manager materials support the strategy context, but this pass did not find a fund-specific source for aggregate size.",
    sectors: ["Power & ET", "Utilities", "Transportation", "Social Infra"],
    regions: ["North America", "Europe"],
  }),

  // ── Basalt Infrastructure Partners ────────────────────────
  f("FUND-028", "Basalt Infrastructure Partners", "Basalt BIP IV", "2024", "$4.0B", 4000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Transatlantic mid-market infrastructure vehicle targeting power, telecom/digital, transport, and utilities in Western Europe and North America.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-029", "Basalt Infrastructure Partners", "Basalt BIP V", "Raising", "—", null, "Core-Plus", "Raising", {
    investmentStrategy: "Successor Basalt vehicle; public fund-specific docs are thin, but current Basalt materials continue to frame the series around mid-market utilities, power, transport, and digital infrastructure in North America and Europe.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
  }),

  // ── BCI ───────────────────────────────────────────────────
  f("FUND-030", "BCI", "BCI Infrastructure & Renewable Resource Program", "Evergreen", "~C$32B", 23680, "Core", "Evergreen", {
    investmentStrategy: "Open-ended core infrastructure and renewable-resources program seeking long-hold, governance-rich positions in essential-service assets globally, with current emphasis on utilities, transport, digital infrastructure, and energy-transition themes.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Bernhard Capital Partners ─────────────────────────────
  f("FUND-031", "Bernhard Capital Partners", "BCP Fund III", "2022", "$1.5B", 1500, "Opportunistic", "Financial Close", {
    investmentStrategy: "Value-add services-and-infrastructure fund focused on critical utility and civic-infrastructure platforms; Fund III public disclosures center on architecture/engineering/consulting, energy optimization, institutional program management, and water/wastewater-related services.",
    sectors: ["Power & ET", "Utilities", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),

  // ── BlackRock ─────────────────────────────────────────────
  f("FUND-032", "BlackRock", "BlackRock GIF IV", "2024", "$6.1B", 6100, "Core-Plus", "Financial Close", {
    investmentStrategy: "Fourth-vintage global diversified infrastructure fund targeting energy & environmental, low-carbon power, regulated utilities, transport/logistics, and digital infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Global"],
  }),
  f("FUND-033", "BlackRock", "BlackRock Global Renewable Power Fund IV (GRP IV)", "2024", "[$7.0B]", 7000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Fourth-vintage climate infrastructure / renewable power fund focused on OECD wind, solar, batteries, and grid infrastructure, with lineage deployment overwhelmingly in clean-power platforms.",
    sectors: ["Power & ET"],
    regions: ["Global"],
  }),

  // ── BlackRock (GIP) ───────────────────────────────────────
  f("FUND-034", "BlackRock (GIP)", "GIP Core Fund", "Evergreen", "[$5.0B]", 5000, "Core", "Evergreen", {
    investmentStrategy: "OECD-focused core vehicle targeting income-oriented returns across GIP's core sectors, though public portfolio attribution is currently thin and visibly digital-led.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["Global"],
  }),
  f("FUND-035", "BlackRock (GIP)", "GIP Mid-Market Fund V", "2026", "[$7.0B]", 7000, "Core-Plus", "Raising", {
    investmentStrategy: "Rebranded successor to GIF IV / the GEPIF series; a differentiated core-plus mid-market strategy for essential, contracted infrastructure businesses that has broadened in mandate but remains historically energy-heavy in deployment.",
    sectors: ["Power & ET", "Utilities", "Midstream", "Transportation", "Social Infra"],
    regions: ["Global"],
  }),
  f("FUND-036", "BlackRock (GIP)", "GIP V", "2022", "$25.2B", 25200, "Core-Plus", "Financial Close", {
    investmentStrategy: "Fifth flagship global infrastructure fund pursuing GIP's core/core-plus OECD strategy across energy, transport, digital and water/waste, with decarbonization central to the thesis.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Global"],
  }),
  f("FUND-037", "BlackRock (GIP)", "GIP Transition Fund", "2025", "[$10.0B]", 10000, "Value-Add", "Raising", {
    investmentStrategy: "Newly launched brown-to-green transition vehicle oriented to decarbonization, CCUS and transition-enabling infrastructure rather than a pure renewables sleeve.",
    sectors: ["Power & ET", "Utilities", "Midstream"],
    regions: ["Global"],
  }),

  // ── Blackstone ────────────────────────────────────────────
  f("FUND-038", "BlackRock (GIP)", "Global AI Infrastructure Investment Partnership (GAIIP)", "2024", "[$30.0B]", 30000, "Core-Plus", "Raising", {
    investmentStrategy: "BlackRock/GIP-led partnership with Microsoft and MGX seeking to mobilize $30B of private equity capital over time, and up to $100B including debt, for AI data centers and supporting power infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital"],
    regions: ["Global"],
  }),
  f("FUND-039", "Blackstone", "Blackstone Infrastructure Partners (BIP)", "Evergreen", "$77.0B", 77000, "Core-Plus", "Evergreen", {
    investmentStrategy: "Permanent-capital, multi-sector infrastructure vehicle with a long-term buy-and-hold approach; public deployment is concentrated in digital, transport, utilities/midstream, and some waste/environmental assets.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),
  f("FUND-040", "Blackstone", "BXINFRA", "Evergreen", "$4.1B", 4100, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Perpetual, semiliquid retail infrastructure vehicle targeting Blackstone's Digital, Energy, and Transportation themes; early portfolio construction is currently centered on transport, digital, and pipeline energy, with Urbaser adding environmental services.",
    sectors: ["Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Global"],
    structure: "Open-End",
  }),

  f("FUND-041", "Blackstone", "Blackstone Energy Transition Partners IV (BETP IV)", "2025", "$5.6B", 5600, "Opportunistic", "Financial Close", {
    investmentStrategy: "Energy-focused private equity fund backing businesses across the energy-transition value chain, but with actual deployment spanning grid equipment, transmission, gas-fired reliability power, software, and environmental services as well as renewable enablers.",
    sectors: ["Power & ET", "Utilities", "Midstream", "Social Infra"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-042", "Blackstone", "Blackstone Energy Transition Partners V (BETP V)", "2026", "[TBD]", null, "Opportunistic", "Raising", {
    investmentStrategy: "In-market successor to BETP IV; no standalone portfolio is public yet, so the best read-through is the cited BETP platform and prior-series record, which points to electrification, grid reliability, power, and enabling services rather than renewables-only.",
    sectors: ["Power & ET", "Utilities", "Midstream", "Social Infra"],
    regions: ["North America", "Europe"],
  }),

  // ── Blue Owl ──────────────────────────────────────────────
  f("FUND-043", "Blue Owl Capital", "Blue Owl ODI III", "2024", "$7.0B", 7000, "Value-Add", "Financial Close", {
    investmentStrategy: "Pure-play digital infrastructure fund dedicated to data centers and related connectivity assets serving hyperscaler/AI/cloud demand, built on the acquired IPI Partners platform.",
    sectors: ["Digital"],
    regions: ["North America", "Europe"],
  }),

  // ── Brookfield ────────────────────────────────────────────
  f("FUND-044", "Brookfield", "Brookfield Artificial Intelligence Infrastructure Fund (BAIIF)", "2025", "[$10.0B]", 10000, "Value-Add", "Raising", {
    investmentStrategy: "Brookfield's AI infrastructure fund launched in November 2025 with a $10B equity target and $5B of initial commitments, investing across AI factories, behind-the-meter power, compute infrastructure and adjacent AI value-chain assets.",
    sectors: ["Power & ET", "Utilities", "Digital"],
    regions: ["Global"],
  }),
  f("FUND-045", "Brookfield", "Brookfield BGTF II", "2023", "$20.0B", 20000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Flagship transition fund investing across clean-energy buildout, sustainable solutions, and decarbonization of carbon-intensive businesses.",
    sectors: ["Power & ET", "Utilities", "Social Infra"],
    regions: ["Global"],
  }),
  f("FUND-046", "Brookfield", "Brookfield BIF V", "2022", "$28.0B", 28000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Flagship global infrastructure fund investing on a value basis through Brookfield's operations-oriented model; BIF V is explicitly positioned around digitalization, decarbonization, and deglobalization.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation"],
    regions: ["Global"],
  }),
  f("FUND-047", "Brookfield", "Brookfield BII", "Evergreen", "$5.1B", 5100, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Semi-liquid private-wealth fund seeking capital growth and income through private infrastructure equity and debt across Brookfield's platform sectors.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-048", "Brookfield", "Brookfield BISS", "2024", "$1.0B", 1000, "Value-Add", "Financial Close", {
    investmentStrategy: "Inaugural middle-market structured-solutions fund providing structured and common equity to sponsors, developers, and corporates in Brookfield's infrastructure sectors of expertise.",
    sectors: ["Power & ET", "Digital", "Transportation"],
    regions: ["Global"],
  }),
  f("FUND-049", "Brookfield", "Brookfield Americas Infrastructure Fund", "2010", "$2.7B", 2700, "Value-Add", "Financial Close", {
    investmentStrategy: "Americas infrastructure private equity / value-oriented infrastructure vehicle.",
    sectors: ["Power & ET", "Utilities", "Midstream", "Transportation"],
    regions: ["North America"],
  }),
  f("FUND-050", "Brookfield", "Brookfield Super-Core Infrastructure Partners", "Evergreen", "$13.2B", 13200, "Core", "Evergreen", {
    investmentStrategy: "Perpetual private-core infrastructure strategy for developed-market assets, marketed around yield, diversification, and inflation protection.",
    sectors: ["Power & ET", "Utilities"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Carlyle Group ─────────────────────────────────────────
  f("FUND-051", "Carlyle Group", "Carlyle CGI Fund I", "2019", "$2.2B", 2200, "Value-Add", "Financial Close", {
    investmentStrategy: "Inaugural OECD-focused value-add infrastructure fund targeting transport, energy/power and water infrastructure, with actual deployment spanning airports, crude logistics, water assets, towers and microgrids.",
    sectors: ["Power & ET", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-052", "Carlyle Group", "Carlyle CGI Fund II", "2026", "TBD", null, "Value-Add", "Raising", {
    investmentStrategy: "Successor CGI vehicle under Carlyle's current four-vertical platform, emphasizing middle-market transport, digital, renewables and midstream opportunities in OECD markets.",
    sectors: ["Power & ET", "Digital", "Midstream", "Transportation"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-053", "Carlyle Group", "Carlyle CRSEF II", "2022", "$2.0B", 2000, "Value-Add", "Financial Close", {
    investmentStrategy: "Second dedicated Carlyle renewables vehicle focused on developed-market renewable and sustainable energy platforms across solar, wind, storage, EV charging and distributed-generation finance.",
    sectors: ["Power & ET"],
    regions: ["North America", "Europe"],
  }),

  // ── CBRE ──────────────────────────────────────────────────
  f("FUND-054", "CBRE Investment Management", "CBRE GIF", "Evergreen", "$3.3B", 3300, "Core-Plus", "Evergreen", {
    investmentStrategy: "Evergreen global direct private infrastructure strategy targeting diversified core/core-plus OECD mid-market assets, with the verified public deal trail centered on digitalization and decarbonization themes.",
    sectors: ["Power & ET", "Digital"],
    regions: ["Global"],
  }),

  // ── CIM Group ─────────────────────────────────────────────
  f("FUND-055", "CIM Group", "CIM Infrastructure Fund III", "2021", "$1.8B", 1800, "Value-Add", "Financial Close", {
    investmentStrategy: "North American value-add infrastructure fund targeting renewables, digital, waste/water, and transport/social infrastructure, with lineage deployment concentrated in data centers, solar/RNG and water/resource-efficiency assets.",
    sectors: ["Power & ET", "Digital", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),

  // ── Copenhagen Infrastructure Partners ────────────────────
  f("FUND-056", "Copenhagen Infrastructure Partners", "Copenhagen Infrastructure V (CI V)", "2023", "€12.0B", 13200, "Core-Plus", "Financial Close", {
    investmentStrategy: "Global flagship greenfield renewable-energy infrastructure fund focused on large-scale contracted or regulated clean-energy and system-integration assets in low-risk OECD markets.",
    sectors: ["Power & ET", "Utilities"],
    regions: ["Global"],
  }),

  // ── Connor, Clark & Lunn ──────────────────────────────────
  f("FUND-057", "Connor, Clark & Lunn", "CCL Private Client Infrastructure Portfolio", "Evergreen", "~C$7.0B", 5180, "Core-Plus", "Evergreen", {
    investmentStrategy: "Evergreen direct middle-market infrastructure portfolio for private clients, with disclosed holdings dominated by renewables and meaningful transport/social exposure.",
    sectors: ["Power & ET", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),

  // ── CPP Investments ───────────────────────────────────────
  f("FUND-058", "CPP Investments", "CPP Investments Infrastructure", "Evergreen", "—", null, "Core-Plus", "Evergreen", {
    investmentStrategy: "Evergreen global direct infrastructure program inside CPP's Real Assets platform, deploying at scale across digital, transport, power/renewables, midstream and environmental-services assets.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── CVC DIF ───────────────────────────────────────────────
  f("FUND-059", "CVC DIF", "CVC DIF CIF III", "2022", "€1.6B", 1760, "Value-Add", "Financial Close", {
    investmentStrategy: "Legacy-CIF / current Value-Add growth infrastructure fund focused on buy-and-build platforms, especially in digital infrastructure, alongside transport and other growth infrastructure niches.",
    sectors: ["Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-060", "CVC DIF", "CVC DIF Infrastructure VII", "2022", "€4.4B", 4840, "Core-Plus", "Financial Close", {
    investmentStrategy: "Core-plus flagship targeting contracted, downside-protected essential infrastructure across CVC DIF's mid-market platform, with yield plus longer-term value creation.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
  }),

  f("FUND-061", "CVC DIF", "CVC DIF Infrastructure VIII", "2025", "[€6.0B]", 6600, "Core-Plus", "Raising", {
    investmentStrategy: "Successor core-plus vehicle targeting €6B of commitments for a diversified portfolio of roughly 20 positions, with public LP materials emphasizing renewable energy, utilities and transport across Europe and North America.",
    sectors: ["Power & ET", "Utilities", "Transportation"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-062", "CVC DIF", "CVC DIF Value-Add IV", "2025", "[€2.0B]", 2200, "Value-Add", "Raising", {
    investmentStrategy: "Activated successor to the CVC DIF value-add series, part of CVC's combined €8B DIF VIII / VA IV infrastructure fundraising target and focused on higher-growth mid-market infrastructure platforms.",
    sectors: ["Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
  }),

  // ── DigitalBridge ─────────────────────────────────────────
  f("FUND-063", "DigitalBridge", "DigitalBridge Fund III", "2024", "$7.2B", 7200, "Value-Add", "Financial Close", {
    investmentStrategy: "Third flagship value-add digital infrastructure fund scaling into hyperscale data centers, fiber, towers and related connectivity assets across DigitalBridge's five-vertical digital stack.",
    sectors: ["Digital"],
    regions: ["North America", "Europe", "Asia-Pacific"],
  }),

  // ── Duration Capital Partners ─────────────────────────────
  f("FUND-064", "Duration Capital Partners", "Duration Core-plus Infrastructure Fund", "2022", "~$3.0B", 3000, "Core-Plus", "Financial Close", {
    investmentStrategy: "Specialized North American transportation infrastructure strategy, publicly aligned with the TICP vehicle and later the Duration spin-out, focused on essential aviation, ports, rail and logistics businesses.",
    sectors: ["Transportation"],
    regions: ["North America"],
  }),

  // ── DWS ───────────────────────────────────────────────────
  f("FUND-065", "DWS", "DWS PEIF III", "2021", "€3.1B", 3410, "Value-Add", "Financial Close", {
    investmentStrategy: "Third flagship DWS Pan-European Infrastructure fund, which reached final close in June 2021 at approximately €3.1B and targets mature European infrastructure across transportation, power, utilities and digital infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
  }),

  // ── Energy Capital Partners ───────────────────────────────
  f("FUND-066", "Energy Capital Partners", "ECP Fund V", "2022", "$4.4B", 4400, "Opportunistic", "Financial Close", {
    investmentStrategy: "Fifth flagship ECP equity vehicle focused on value-add/control investments in electricity and sustainability infrastructure, especially conventional/renewable power, storage and decarbonization assets.",
    sectors: ["Power & ET", "Utilities", "Midstream", "Social Infra"],
    regions: ["North America"],
  }),
  f("FUND-067", "Energy Capital Partners", "ECP Fund VI", "2025", "[TBD]", null, "Opportunistic", "Raising", {
    investmentStrategy: "Successor flagship vehicle expected to continue ECP's value-added, primarily control strategy across renewable and conventional power generation, storage, environmental infrastructure, plus smaller biofuels/carbon-capture exposure. No fund-specific public primary source was found in this pass for size or fundraising status beyond manager-level strategy context.",
    sectors: ["Power & ET", "Utilities", "Midstream", "Social Infra"],
    regions: ["North America"],
  }),

  // ── EIG ───────────────────────────────────────────────────
  f("FUND-068", "EIG", "EIG Fund XVII", "2022", "[$3.0B]", 3000, "Opportunistic", "Financial Close", {
    investmentStrategy: "Global hybrid debt and structured-equity fund targeting debt and equity investments in energy and energy-related infrastructure projects and companies worldwide.",
    sectors: ["Power & ET", "Utilities", "Midstream", "Transportation"],
    regions: ["Global"],
  }),

  // ── Energy Infrastructure Partners ────────────────────────
  f("FUND-069", "Energy Infrastructure Partners", "EIP III", "2022", "€1.5B", 1650, "Core-Plus", "Raising", {
    investmentStrategy: "Third-generation EIP energy infrastructure product, disclosed by the manager as open with EUR 1.5B of AUM as of December 31, 2024 and focused on system-critical OECD assets across transmission and distribution, storage and flexibility, and renewable energy.",
    sectors: ["Power & ET", "Utilities", "Midstream"],
    regions: ["Europe", "North America"],
  }),

  // ── Ember Infrastructure Management ───────────────────────
  f("FUND-070", "Ember Infrastructure Management", "Ember Infrastructure Fund II", "2023", "$0.8B", 800, "Opportunistic", "Financial Close", {
    investmentStrategy: "Middle-market infrastructure strategy targeting lower-carbon, resource-efficient and climate-resilient platforms, with real deployment split between environmental-resource systems and selected clean-energy assets.",
    sectors: ["Power & ET", "Social Infra"],
    regions: ["North America"],
  }),

  // ── EQT ───────────────────────────────────────────────────
  f("FUND-071", "EQT", "EQT Active Core I", "Evergreen", "$3.2B", 3200, "Core", "Evergreen", {
    investmentStrategy: "Longer-hold core strategy focused on Europe and North America, centered on downside-protected essential-services infrastructure with stable yield, inflation protection, and low volatility.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-072", "EQT", "EQT AI Infrastructure Strategy", "2026", "[TBD]", null, "Value-Add", "Evergreen", {
    investmentStrategy: "Dedicated open-ended AI infrastructure strategy launched in 2026 and seeded by EQT Infrastructure portfolio company EdgeConneX, focused on building the foundation of the AI economy.",
    sectors: ["Power & ET", "Digital"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-073", "EQT", "EQT Infrastructure Fund VI", "2023", "€21.5B", 23650, "Value-Add", "Financial Close", {
    investmentStrategy: "Flagship EQT value-add infrastructure fund focused on essential-service infrastructure businesses with protected cash flows and thematic value creation across digital, energy/decarbonization, circularity, and social infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-074", "EQT", "EQT Transition Infrastructure", "2024", "[TBD]", null, "Opportunistic", "Raising", {
    investmentStrategy: "Scale-up transition infrastructure strategy introduced in 2024 for businesses enabling decarbonization and climate resilience; no primary public target-size disclosure was found, so size remains undisclosed.",
    sectors: ["Power & ET", "Social Infra"],
    regions: ["Europe", "North America", "Asia-Pacific"],
  }),

  // ── Equilibrium ───────────────────────────────────────────
  f("FUND-075", "Equilibrium", "Equilibrium CEFF II", "2019", "$1.0B", 1000, "Opportunistic", "Financial Close", {
    investmentStrategy: "Controlled-environment food infrastructure strategy centered on advanced greenhouse and other CEA facilities designed to improve year-round supply, resilience and resource efficiency.",
    sectors: ["Social Infra"],
    regions: ["North America"],
  }),

  // ── Fengate Asset Management ──────────────────────────────
  f("FUND-076", "Fengate Asset Management", "Fengate Infrastructure Fund IV", "2021", "$1.1B", 1100, "Core-Plus", "Financial Close", {
    investmentStrategy: "Fengate's flagship closed-ended North American core-plus/value-add fund, sourced through relationships with design-builders, operators, developers, and procurement channels; by Dec. 31, 2024 it had eight investments across social, transportation, energy transition, and digital infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),
  f("FUND-077", "Fengate Asset Management", "Fengate Infrastructure Yield Fund", "Evergreen", "C$1.2B", 888, "Core", "Evergreen", {
    investmentStrategy: "Evergreen core/yield strategy inferred from Fengate's public launch history, manager remit, and deal flow; disclosed investments emphasize long-duration, contracted telecom-tower and social-infrastructure cash flows.",
    sectors: ["Digital", "Social Infra"],
    regions: ["North America"],
  }),

  // ── Fiera Infrastructure ──────────────────────────────────
  f("FUND-078", "Fiera Infrastructure", "Fiera Digital Fund", "2024", "$0.6B", 600, "Opportunistic", "Financial Close", {
    investmentStrategy: "In 2024 Fiera assumed the adviser role for River and Mercantile Infrastructure Income Fund SCSp and renamed it Digital Infrastructure Capital Partners SCSp; legacy disclosures indicate a UK digital-transition thesis centered on fibre and wireless broadband infrastructure.",
    sectors: ["Digital"],
    regions: ["Europe"],
  }),
  f("FUND-079", "Fiera Infrastructure", "Fiera EagleCrest Infrastructure", "Evergreen", "C$2.8B", 2072, "Core-Plus", "Evergreen", {
    investmentStrategy: "Fiera's flagship open-end core/core-plus strategy targeting stable, predictable, contracted or regulated cash flows across OECD infrastructure subsectors, with a buy-and-manage approach and opportunistic exits.",
    sectors: ["Power & ET", "Digital", "Transportation", "Social Infra"],
    regions: ["North America", "Europe"],
  }),

  // ── GCM Grosvenor ─────────────────────────────────────────
  f("FUND-080", "GCM Grosvenor", "GCM Grosvenor IAF II", "2023", "$1.3B", 1300, "Core-Plus", "Financial Close", {
    investmentStrategy: "Labor-aligned infrastructure strategy investing with organized-labor partnership across transportation, energy transition, and digital infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation"],
    regions: ["North America"],
  }),

  // ── Generate Capital ──────────────────────────────────────
  f("FUND-081", "Generate Capital", "Generate Capital (Permanent Capital)", "Evergreen", "$10.0B", 10000, "Value-Add", "Evergreen", {
    investmentStrategy: "Permanent-capital sustainable infrastructure platform spanning power, mobility, waste, water, digital infrastructure, agriculture, and industrial decarbonization.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["North America"],
    structure: "Permanent Capital",
  }),

  // ── GIC ───────────────────────────────────────────────────
  f("FUND-082", "GIC", "GIC Infrastructure", "Evergreen", "—", null, "Core-Plus", "Evergreen", {
    investmentStrategy: "Global direct infrastructure program focused on cash-flow-visible private assets across utilities, renewables, communications, data centres, water, airports, seaports, and highways.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Grain Management ──────────────────────────────────────
  f("FUND-083", "Grain Management", "Grain GCOF III", "2021", "$2.25B", 2250, "Opportunistic", "Financial Close", {
    investmentStrategy: "Specialist communications vehicle that closed in April 2021 with $2.25B of commitments and focuses on mission-critical communications assets and broadband infrastructure companies, including fiber, broadband, and adjacent telecom-network/service platforms.",
    sectors: ["Digital"],
    regions: ["North America"],
  }),
  f("FUND-084", "Grain Management", "Grain GCOF IV", "Raising", "[$4.0B]", 4000, "Opportunistic", "Raising", {
    investmentStrategy: "Successor Grain vehicle marketed for broadband, data center, and telecom-tower investments, fully consistent with Grain's broader digital-infrastructure specialization.",
    sectors: ["Digital"],
    regions: ["North America"],
  }),

  // ── Goldman Sachs Alternatives ────────────────────────────
  f("FUND-085", "Goldman Sachs Alternatives", "GS G-INFRA", "Evergreen", "$0.3B", 300, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Open-ended global infrastructure strategy for wealth clients, investing in mid-market core-plus/value-add private infrastructure plus secondaries and liquid assets alongside Goldman's flagship infrastructure platform.",
    sectors: ["Power & ET", "Digital", "Transportation", "Social Infra"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-086", "Goldman Sachs Alternatives", "GS Horizon Climate I", "2021", "$1.6B", 1600, "Opportunistic", "Financial Close", {
    investmentStrategy: "Inaugural Goldman direct private-markets climate strategy; a global growth-oriented private equity fund focused on climate and environmental solutions across five themes rather than classic core infrastructure.",
    sectors: ["Power & ET", "Social Infra"],
    regions: ["Global"],
  }),
  f("FUND-087", "Goldman Sachs Alternatives", "GS WSIP IV", "2021", "$4.0B", 4000, "Value-Add", "Financial Close", {
    investmentStrategy: "Fourth flagship Goldman infrastructure vintage; Goldman markets it as a value-add, mid-market fund for critical operating businesses with defensive cash flows across energy transition, digital, transport/logistics and social infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-088", "Goldman Sachs Alternatives", "GS WSIP V", "2024", "[$4.0B]", 4000, "Value-Add", "Raising", {
    investmentStrategy: "Fifth flagship Goldman infrastructure vehicle; Infralogic reported a $4bn target, Europe/North America focus and no disclosed investments yet, with the broader Goldman platform framed around energy transition, digital infrastructure, transport/logistics and circular economy.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["North America", "Europe"],
  }),

  // ── H.I.G. Capital ───────────────────────────────────────
  f("FUND-089", "H.I.G. Capital", "H.I.G. Infrastructure Partners Fund I", "2021", "$1.3B", 1300, "Value-Add", "Financial Close", {
    investmentStrategy: "Inaugural H.I.G. infrastructure vehicle pursuing control-oriented middle-market value-add/core-plus investments in North America and Europe, with a broad mandate beyond traditional TMT, power and transport.",
    sectors: ["Power & ET", "Digital", "Transportation", "Social Infra"],
    regions: ["North America", "Europe"],
  }),

  // ── Harbert Management Corporation ────────────────────────
  f("FUND-090", "Harbert Management Corporation", "Harbert HIF VI", "2020", "$0.9B", 900, "Core-Plus", "Financial Close", {
    investmentStrategy: "North American power and renewable energy fund investing across renewable, dispatchable, and distributed generation with an emphasis on contracted cash flows and active asset management.",
    sectors: ["Power & ET", "Utilities"],
    regions: ["North America"],
  }),
  f("FUND-091", "Harbert Management Corporation", "Harbert HIF VII", "Raising", "—", null, "Core-Plus", "Raising", {
    investmentStrategy: "Successor Harbert power vehicle; public disclosures indicate continuation of the same North American power strategy across renewable, dispatchable, and distributed generation.",
    sectors: ["Power & ET", "Utilities"],
    regions: ["North America"],
  }),

  // ── Harrison Street ───────────────────────────────────────
  f("FUND-092", "Harrison Street", "Harrison Street Social Infrastructure Fund", "Evergreen", "$5.3B", 5300, "Core-Plus", "Evergreen", {
    investmentStrategy: "Essential-infrastructure strategy serving municipality, university, school, and hospital users through PPP campus assets, district energy, renewables, and fiber / digital infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Social Infra"],
    regions: ["North America"],
  }),

  // ── I Squared Capital ────────────────────────────────────
  f("FUND-093", "I Squared Capital", "ISQ Energy Transition Infrastructure Fund", "2023", "—", null, "Value-Add", "Financial Close", {
    investmentStrategy: "Dedicated transition vehicle launched in 2023, targeting platform investments across clean-energy creation, storage, electrification, and related decarbonization infrastructure in North America and Europe.",
    sectors: ["Power & ET", "Utilities", "Midstream"],
    regions: ["North America", "Europe"],
  }),
  f("FUND-094", "I Squared Capital", "ISQ Global Infrastructure Fund IV", "2024", "[$15.0B]", 15000, "Value-Add", "Raising", {
    investmentStrategy: "Flagship global value-add infrastructure fund focused on diversified middle-market/platform scale-up investing across North America, Europe, and select growth markets.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["North America", "Europe", "Asia-Pacific"],
  }),

  // ── iCON Infrastructure ──────────────────────────────────
  f("FUND-095", "iCON Infrastructure", "iCON Infrastructure Fund VII", "Raising", "$3.7B", 3700, "Core-Plus", "Raising", {
    investmentStrategy: "Seventh flagship iCON vehicle continuing a diversified mid-market infrastructure strategy across Europe and North America, explicitly spanning transport, utilities, telecoms, energy & environment and social infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
  }),

  // ── IFM Investors ─────────────────────────────────────────
  f("FUND-096", "IFM Investors", "IFM CETF", "Evergreen", "[TBD]", null, "Value-Add", "Evergreen", {
    investmentStrategy: "Open-ended energy-transition vehicle, publicly described as the renamed NZIF, targeting essential infrastructure that accelerates the shift to net zero across renewables, storage, grids, low-carbon fuels, and carbon capture.",
    sectors: ["Power & ET", "Midstream"],
    regions: ["Global"],
  }),
  f("FUND-097", "IFM Investors", "IFM Global Infrastructure Fund (GIF)", "Evergreen", "$73.6B", 73600, "Core-Plus", "Evergreen", {
    investmentStrategy: "Open-ended global core infrastructure fund investing mainly in developed/OECD markets, with a hold-manage-reinvest model built around strong market-position assets and long-duration cash-yield plus capital-growth returns.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Global"],
  }),

  // ── Igneo Infrastructure Partners ─────────────────────────
  f("FUND-098", "Igneo Infrastructure Partners", "Igneo GDIF", "Evergreen", "$7.5B", 7500, "Core-Plus", "Evergreen", {
    investmentStrategy: "Open-ended global income-oriented infrastructure vehicle; public GDIF-specific evidence is strongest in renewables plus water/waste platforms rather than a clearly proven digital/transport-heavy mix.",
    sectors: ["Power & ET", "Utilities", "Social Infra"],
    regions: ["Global"],
  }),
  f("FUND-099", "Igneo Infrastructure Partners", "Igneo NADIF", "2024", "$1.0B", 1000, "Value-Add", "Financial Close", {
    investmentStrategy: "Closed-ended North American diversified infrastructure vehicle; public evidence shows a live portfolio across digital/connectivity, energy and transportation platforms in the lower middle market.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation"],
    regions: ["North America"],
  }),

  // ── InfraBridge ───────────────────────────────────────────
  f("FUND-100", "InfraBridge", "InfraBridge GIF III", "Raising", "$4.75B", 4750, "Value-Add", "Raising", {
    investmentStrategy: "Current InfraBridge strategy is a diversified middle-market platform focused on digital infrastructure, transport/logistics and energy transition, with an additional InfraHealth sleeve for care-related assets.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["Global"],
  }),

  // ── InfraRed Capital Partners ─────────────────────────────
  f("FUND-101", "InfraRed Capital Partners", "InfraRed Fund VII", "2025", "[£1.5B]", 1950, "Value-Add", "Raising", {
    investmentStrategy: "Seventh flagship value-add fund targeting development-stage OECD infrastructure; lineage and current fundraising point to energy transition first, then digital/data and transport, with social infrastructure as a secondary sleeve.",
    sectors: ["Power & ET", "Digital", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
  }),
  f("FUND-102", "InfraRed Capital Partners", "HICL Infrastructure PLC", "Evergreen", "£2.4B", 3120, "Core", "Evergreen", {
    investmentStrategy: "Listed perpetual core vehicle with a 100+ asset portfolio spanning transport, utilities, social and communications infrastructure and oriented to sustainable income plus capital growth.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["Europe", "North America"],
    structure: "Listed / Evergreen",
    ticker: "HICL.L",
  }),

  // ── Instar Asset Management ───────────────────────────────
  f("FUND-103", "Instar Asset Management", "Instar EIF Fund III", "2023", "[$1.5B]", 1500, "Value-Add", "Financial Close", {
    investmentStrategy: "EIF Fund III appears to continue Instar's North American essential-infrastructure strategy targeting scalable middle-market businesses in transportation/logistics, energy transition, environmental and utility-adjacent sectors.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),

  // ── J.P. Morgan Asset Management ─────────────────────────
  f("FUND-104", "J.P. Morgan Asset Management", "J.P. Morgan IIF", "Evergreen", "$41.0B", 41000, "Core-Plus", "Evergreen", {
    investmentStrategy: "Open-ended, perpetual-life J.P. Morgan infrastructure fund seeking mature, regulated/contracted core/core-plus assets with stable cash flow and broad exposure across transportation, utilities, power and renewables.",
    sectors: ["Power & ET", "Utilities", "Midstream", "Transportation"],
    regions: ["Global"],
  }),

  // ── KKR ───────────────────────────────────────────────────
  f("FUND-105", "KKR", "KKR DCIF", "Evergreen", "$11.8B", 11800, "Core", "Evergreen", {
    investmentStrategy: "Open-ended core infrastructure fund launched in 2020, targeting mature essential-service assets in developed OECD markets with regulated or contracted cash flows.",
    sectors: ["Power & ET", "Utilities", "Digital"],
    regions: ["Global"],
  }),
  f("FUND-106", "KKR", "KKR Global Climate Transition Fund", "Raising", "$7.0B", 7000, "Opportunistic", "Raising", {
    investmentStrategy: "Climate-transition infrastructure strategy launched in 2023 to back scalable decarbonization solutions across the physical economy; disclosed investments so far skew toward renewables/storage and transport electrification.",
    sectors: ["Power & ET", "Transportation"],
    regions: ["Global"],
  }),
  f("FUND-107", "KKR", "KKR Global Infrastructure Investors V", "2024", "[$20.0B]", 20000, "Value-Add", "Raising", {
    investmentStrategy: "Fifth flagship closed-end value-add global infrastructure fund focused on critical OECD-heavy assets across communications, renewables, midstream, transport, utilities, waste and social infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Global"],
  }),
  f("FUND-108", "KKR", "K-INFRA", "Evergreen", "$5.3B", 5300, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Evergreen infrastructure holding company formed in 2022 with a broad mandate across digital, energy transition, transport, utilities, waste and social infrastructure, and a portfolio already spanning towers, fiber, data centers, renewables, midstream, airports and schools.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Global"],
    structure: "Open-End",
  }),

  // ── Kuwait Investment Authority (KIA) ─────────────────────
  f("FUND-109", "Kuwait Investment Authority (KIA)", "Wren House Infrastructure", "Evergreen", "—", null, "Value-Add", "Evergreen", {
    investmentStrategy: "KIA's direct infrastructure arm builds a diversified OECD/global portfolio around energy transition, community, mobility and digital themes.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── La Caisse de dépôt et placement du Québec ─────────────
  f("FUND-110", "La Caisse de dépôt (CDPQ)", "CDPQ Infrastructure", "Evergreen", "C$75B", 55500, "Core", "Evergreen", {
    investmentStrategy: "Evergreen direct infrastructure program focused on tangible assets with stable long-term income across transport, power/renewables, public transit and, increasingly, telecom/data centres.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Macquarie Asset Management ────────────────────────────
  f("FUND-111", "Macquarie Asset Management", "Macquarie Retail Infrastructure Fund", "Evergreen", "$1.1B", 1100, "Retail Act '40", "Evergreen", {
    investmentStrategy: "Combined retail row covering METI's pure-play energy-transition strategy and MPIF's diversified global unlisted infrastructure access strategy.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["Global"],
    structure: "Open-End",
  }),
  f("FUND-112", "Macquarie Asset Management", "Macquarie MGECO", "Evergreen", "[TBU]", null, "Core", "Evergreen", {
    investmentStrategy: "Core renewables/climate vehicle seeded with six solar, wind, storage and natural-climate-solutions investments, with initial deployment centered on solar, wind and batteries.",
    sectors: ["Power & ET", "Social Infra"],
    regions: ["Global"],
  }),
  f("FUND-113", "Macquarie Asset Management", "Macquarie MGETS", "2025", "$3.0B", 3000, "Opportunistic", "Financial Close", {
    investmentStrategy: "Dedicated transition-solutions fund beyond mature renewables, which reached final close in September 2025 with over $3B of fund and co-investment commitments and targets storage, distributed energy, renewable fuels, clean transport, carbon capture and circular economy.",
    sectors: ["Power & ET", "Transportation", "Social Infra"],
    regions: ["Global"],
  }),
  f("FUND-114", "Macquarie Asset Management", "Macquarie MGIF", "Evergreen", "[$4.0B]", 4000, "Core", "Evergreen", {
    investmentStrategy: "Open-end global core infrastructure fund targeting energy/renewables, utilities, telecom and transportation, with early deployment reported across energy and transport in Europe and the US.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation"],
    regions: ["Global"],
  }),
  f("FUND-115", "Macquarie Asset Management", "Macquarie MIP VI", "2022", "$6.8B", 6800, "Core-Plus", "Financial Close", {
    investmentStrategy: "Latest vintage in Macquarie's Americas MIP series, continuing the platform's long-standing transport, digital, utilities/energy and waste playbook.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),
  f("FUND-116", "Macquarie Asset Management", "Macquarie MIP VII", "2025", "[$7.0B]", 7000, "Core-Plus", "Raising", {
    investmentStrategy: "Continuation fund for the MIP series; institutional media describes it as a core-plus vehicle for mid-market brownfield digital, transport, utilities, energy and waste assets.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),

  // ── Manulife Investment Management ────────────────────────
  f("FUND-117", "Manulife Investment Management", "Manulife MIF III", "2025", "$5.5B", 5500, "Core-Plus", "Financial Close", {
    investmentStrategy: "Third flagship North American mid-market core-plus vehicle, which reached an oversubscribed final close in October 2025 at $5.5B and is visibly concentrated in digital infrastructure, renewables/distributed energy and utilities.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),

  // ── Meridiam ──────────────────────────────────────────────
  f("FUND-118", "Meridiam", "Meridiam MINA IV", "2025", "$1.8B", 1800, "Core-Plus", "Financial Close", {
    investmentStrategy: "Fourth-generation North America Meridiam vehicle that closed in October 2025 with more than $1.8B of commitments, centered on contracted infrastructure across energy, mobility and essential services, and supported by Meridiam's long-duration public-infrastructure model.",
    sectors: ["Digital", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),

  // ── Morgan Stanley ────────────────────────────────────────
  f("FUND-119", "Morgan Stanley Infrastructure Partners", "North Haven Infrastructure Partners IV", "2025", "$4.1B", 4100, "Value-Add", "Financial Close", {
    investmentStrategy: "Fourth Morgan Stanley Infrastructure Partners global infrastructure fund, which closed in March 2025 at $4.1B and targets inflation-linked assets in transportation, digital infrastructure, energy transition and utilities with active asset-management upside.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation"],
    regions: ["North America", "Europe"],
  }),

  // ── Morrison & Co ─────────────────────────────────────────
  f("FUND-120", "Morrison & Co", "Infratil", "Evergreen", "~$8.0B", 8000, "Core", "Evergreen", {
    investmentStrategy: "Listed evergreen infrastructure platform investing in renewables, digital infrastructure, healthcare and airports, with portfolio reality centered on connectivity, power transition and essential-service assets.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["Asia-Pacific", "North America", "Europe"],
    structure: "Listed / Evergreen",
  }),
  f("FUND-121", "Morrison & Co", "Morrison MIP", "Evergreen", ">$3.0B", 3000, "Core-Plus", "Evergreen", {
    investmentStrategy: "Open-ended core-plus infrastructure partnership targeting a high-quality, growth-exposed but defensive portfolio shaped by decarbonisation, climate adaptation and digital-infrastructure demand.",
    sectors: ["Power & ET", "Digital"],
    regions: ["Global"],
  }),
  f("FUND-122", "Morrison & Co", "Morrison MVA II", "2025", "[$2.0B]", 2000, "Value-Add", "Raising", {
    investmentStrategy: "Global middle-market value-add fund targeting 8-12 investments across energy transition, digitisation/connectivity, mobility, aging-population and circular-economy themes.",
    sectors: ["Power & ET", "Utilities", "Digital", "Social Infra"],
    regions: ["Global"],
  }),

  // ── Mubadala ──────────────────────────────────────────────
  f("FUND-123", "Mubadala Investment Company", "Mubadala Infrastructure", "Evergreen", "—", null, "Value-Add", "Evergreen", {
    investmentStrategy: "Scaling direct real-assets platform with highest conviction in digital infrastructure and energy transition, alongside power and transport.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Northampton Capital ───────────────────────────────────
  f("FUND-124", "Northampton Capital", "Northampton Flagship Fund Complex", "2024", "[$1.0B]", 1000, "Core-Plus", "Raising", {
    investmentStrategy: "Inaugural middle-market infrastructure complex focused on energy, digital and other critical infrastructure; early deployment is concentrated in data centers and renewable royalties.",
    sectors: ["Power & ET", "Digital"],
    regions: ["North America"],
  }),

  // ── Northleaf Capital Partners ────────────────────────────
  f("FUND-125", "Northleaf Capital Partners", "Northleaf NEIF", "Evergreen", ">$1.0B", 1000, "Core", "Evergreen", {
    investmentStrategy: "Evergreen open-end fund for mature mid-market infrastructure with stable cash flows, lower-risk profiles, and a portfolio that publicly appears centered on contracted digital, transport and energy-transition assets.",
    sectors: ["Power & ET", "Digital", "Transportation"],
    regions: ["North America"],
  }),
  f("FUND-126", "Northleaf Capital Partners", "Northleaf NICP IV", "2023", "$2.6B", 2600, "Core-Plus", "Financial Close", {
    investmentStrategy: "Northleaf's largest infrastructure vehicle; a control-oriented, contracted mid-market strategy mainly in North America, with actual deployment concentrated in digital, transport and energy-transition assets.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation"],
    regions: ["North America"],
  }),

  // ── OMERS ─────────────────────────────────────────────────
  f("FUND-127", "OMERS Infrastructure", "OMERS Infrastructure", "Evergreen", "C$33B", 24420, "Core-Plus", "Evergreen", {
    investmentStrategy: "Broad evergreen direct platform spanning energy, digital, transport and other government-regulated services, with a long current-and-realized portfolio history.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── OTPP ──────────────────────────────────────────────────
  f("FUND-128", "Ontario Teachers' Pension Plan", "OTPP Infrastructure", "Evergreen", "C$32B", 23680, "Core", "Evergreen", {
    investmentStrategy: "Global core/core-plus essential-infrastructure platform across transport, utilities, water and renewables, now with a meaningful digital infrastructure sleeve.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── Partners Group ────────────────────────────────────────
  f("FUND-150", "Partners Group", "Partners Group Direct Infrastructure Fund IV", "2023", "[$8.0B]", 8000, "Core-Plus", "Raising", {
    investmentStrategy: "Fourth-generation Partners Group direct infrastructure vehicle in fundraising, targeting next-generation infrastructure platforms with core-plus/value-add characteristics across decarbonization, digitization, new living and economic infrastructure themes.",
    sourceUrls: [
      "https://www.partnersgroup.com/news-and-views/press-releases/corporate-news/detail?news_id=35550643-444b-49c8-9f72-1502c2e822a6",
      "https://www.partnersgroup.com/~/media/Files/P/Partnersgroup/Universal/in-the-media/20240301-infrastructure-investor-esther-peiner-feb24.pdf",
      "https://irei.com/news/imrf-commits-up-to-25m-to-partners-group-direct-infrastructure-fund-iv/",
      "https://www.partnersgroup.com/news-and-views/press-releases/corporate-news/detail?news_id=b968937c-2e81-4691-984d-d8fdd68a0ad7",
    ],
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["North America", "Europe", "Asia-Pacific"],
    strategies: ["Core-Plus", "Value-Add"],
    structure: "Closed-End",
    strategyUrl: "https://www.partnersgroup.com/en/our-investments/infrastructure",
  }),

  // ── QIA ───────────────────────────────────────────────────
  f("FUND-129", "Qatar Investment Authority (QIA)", "QIA Infrastructure", "Evergreen", "—", null, "Core", "Evergreen", {
    investmentStrategy: "Core infrastructure platform centered on regulated utilities and gateway transport assets, with newer commitments in renewables and digital infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation"],
    regions: ["Global"],
    structure: "Permanent Capital",
  }),

  // ── QIC ───────────────────────────────────────────────────
  f("FUND-130", "QIC", "QIC QGIF II", "2023", "[TBD]", null, "Core-Plus", "Raising", {
    investmentStrategy: "Second QIC Global Infrastructure Fund. Public CEFC materials verify the QGIF II vehicle and a January 2026 CEFC commitment, but do not evidence a final close or official total fund size, so the database keeps size conservative.",
    sectors: ["Power & ET", "Utilities", "Transportation", "Social Infra"],
    regions: ["Asia-Pacific"],
  }),

  // ── Quinbrook Infrastructure Partners ─────────────────────
  f("FUND-131", "Quinbrook Infrastructure Partners", "Quinbrook Net Zero Power Fund (NZPF)", "2024", "$3.0B", 3000, "Value-Add", "Financial Close", {
    investmentStrategy: "Value-add net-zero-power strategy that held final close in August 2024 with USD 3B across the fund and co-investment vehicles, focused on solar+storage, grid support, battery storage, renewable fuels and renewable-powered hyperscale data-center infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Social Infra"],
    regions: ["North America", "Europe", "Asia-Pacific"],
  }),

  // ── Ridgewood Infrastructure ──────────────────────────────
  f("FUND-132", "Ridgewood Infrastructure", "Ridgewood Water & Strategic Infrastructure Fund II", "2025", "$1.2B", 1200, "Opportunistic", "Financial Close", {
    investmentStrategy: "Second Ridgewood lower-middle-market essential infrastructure fund, which reached final close in January 2025 at $1.2B and spans water/wastewater, utilities, logistics/transport and selected energy-transition assets with active operational improvement.",
    sectors: ["Power & ET", "Utilities", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),

  // ── Sandbrook Capital ────────────────────────────────────
  f("FUND-133", "Sandbrook Capital", "Sandbrook Climate Infrastructure Fund II", "2025", "[$2.0B]", 2000, "Opportunistic", "Raising", {
    investmentStrategy: "Build-company climate strategy focused on clean power generation, transmission/storage, energy use and efficiency, grid resiliency and climate-enabling infrastructure, including clean-powered data-center platforms.",
    sectors: ["Power & ET", "Utilities", "Digital"],
    regions: ["North America"],
  }),

  // ── SDC Capital Partners ──────────────────────────────────
  f("FUND-134", "SDC Capital Partners", "SDC Digital Infrastructure Opportunity Fund IV", "2024", "[TBD]", null, "Value-Add", "Raising", {
    investmentStrategy: "Pure-play digital infrastructure strategy across data centers, fiber, wireless, and cloud/IT platforms. Public SEC evidence verifies the Fund IV vehicle and fundraising, but no primary final-close or official size source was found in this pass.",
    sectors: ["Digital"],
    regions: ["North America"],
  }),

  // ── Searchlight Capital Partners ──────────────────────────
  f("FUND-135", "Searchlight Capital Partners", "Searchlight Fiber Alliance", "Raising", "$1.5B", 1500, "Opportunistic", "Raising", {
    investmentStrategy: "Dedicated U.S. FTTH platform targeting underserved markets through utility/public-private partnerships and scalable next-generation fiber buildouts.",
    sectors: ["Digital"],
    regions: ["North America"],
  }),

  // ── Stonepeak ─────────────────────────────────────────────
  f("FUND-136", "Stonepeak", "Stonepeak Core Fund", "Evergreen", "~$6.0B", 6000, "Core", "Evergreen", {
    investmentStrategy: "Open-ended global/OECD core infrastructure fund targeting mature assets with cash yield and long-term inflation-linked revenues; publicly identifiable holdings to date are especially concentrated in towers/data centers and ports.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation"],
    regions: ["Global"],
  }),
  f("FUND-137", "Stonepeak", "Stonepeak Fund V", "2023", "[TBD]", null, "Core-Plus", "Raising", {
    investmentStrategy: "Fifth flagship Stonepeak diversified North American infrastructure strategy targeting high-barrier assets with durable cash flows. Public SEC evidence verifies ongoing fundraising and disclosed roughly $7.3B sold as of the January 2025 amendment, but no primary final-close or official target-size source was found in this pass.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation"],
    regions: ["North America"],
  }),
  f("FUND-138", "Stonepeak", "Stonepeak Global Renewables Fund II", "2024", "[$5.0B]", 5000, "Core-Plus", "Raising", {
    investmentStrategy: "Follow-on Stonepeak renewables strategy focused on development/newbuild solar and wind in developed markets, with lineage spanning offshore wind, onshore wind, distributed solar, storage, RNG, and related energy-transition platforms.",
    sectors: ["Power & ET"],
    regions: ["Global"],
  }),
  f("FUND-139", "Stonepeak", "Stonepeak Opportunities Fund II", "2025", "[TBD]", null, "Opportunistic", "Raising", {
    investmentStrategy: "Public evidence aligns this 2025 current vehicle with Stonepeak Opportunities Fund II, the successor to the inaugural SOF I; strategy is a middle-market infrastructure / structured-capital sleeve focused on digital infrastructure, transport/logistics, and energy-related assets in North America and Europe.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation"],
    regions: ["North America", "Europe"],
  }),

  // ── Swiss Life Asset Managers ─────────────────────────────
  f("FUND-140", "Swiss Life Asset Managers", "SwissLife GIO Growth II", "2025", "[€1.0B]", 1100, "Value-Add", "Raising", {
    investmentStrategy: "Second Swiss Life value-add infrastructure fund, aimed at higher-growth unlisted assets where returns are driven by digitalisation, decarbonisation, mobility and operational value creation.",
    sectors: ["Power & ET", "Digital", "Transportation", "Social Infra"],
    regions: ["Europe"],
  }),
  f("FUND-141", "Swiss Life Asset Managers", "SwissLife GIO IV", "2025", "[€2.5B]", 2750, "Core", "Raising", {
    investmentStrategy: "Fourth Swiss Life Core/Core+ fund, pursuing long-term brownfield-oriented direct infrastructure investments across OECD markets; the lineage reads as a diversified multi-sector core franchise rather than a narrow thematic sleeve.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["Europe"],
  }),

  // ── Tallvine Partners ────────────────────────────────────
  f("FUND-142", "Tallvine Partners", "Tallvine Middle Market Infrastructure Fund I", "Raising", "—", null, "Value-Add", "Raising", {
    investmentStrategy: "Inaugural value-add middle-market infrastructure vehicle building North American platforms across transport/logistics, digital infrastructure, and eventually energy/utilities.",
    sectors: ["Digital", "Transportation"],
    regions: ["North America"],
  }),

  // ── Temasek ───────────────────────────────────────────────
  f("FUND-143", "Temasek", "Temasek Infrastructure", "Evergreen", "—", null, "Value-Add", "Evergreen", {
    investmentStrategy: "No named batch vehicle is disclosed; Temasek's official materials instead describe a direct/core-plus infrastructure program spanning digital enablers, energy transition/resilience, and ageing infrastructure through TPCs, partnerships, and funds.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation"],
    regions: ["Global", "Asia-Pacific"],
    structure: "Permanent Capital",
  }),

  // ── Tiger Infrastructure Partners ─────────────────────────
  f("FUND-144", "Tiger Infrastructure Partners", "Tiger Infrastructure Fund IV", "2024", "[$2.0B]", 2000, "Value-Add", "Raising", {
    investmentStrategy: "Latest fund in a lineage investing growth capital in essential-service infrastructure platforms across digital infrastructure, energy transition, and transportation.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["North America", "Europe"],
  }),

  // ── TPG ───────────────────────────────────────────────────
  f("FUND-145", "TPG", "TPG Peppertree Fund X", "2023", "$2.0B", 2000, "Opportunistic", "Financial Close", {
    investmentStrategy: "Specialized digital infrastructure strategy focused on wireless communications towers and adjacent communication assets such as fiber, DAS, spectrum, and rooftop rights.",
    sectors: ["Digital"],
    regions: ["North America"],
  }),
  f("FUND-146", "TPG", "TPG Rise Climate II", "2025", "$6.8B", 6773, "Opportunistic", "Raising", {
    investmentStrategy: "Second TPG Rise Climate fund, reported in TPG filings with approximately $6.8B committed by March 31, 2026; this row tracks the climate private-equity vehicle rather than the separate Rise Climate Transition Infrastructure product.",
    sectors: ["Power & ET", "Utilities", "Social Infra"],
    regions: ["Global"],
  }),

  // ── Ullico ────────────────────────────────────────────────
  f("FUND-147", "Ullico", "Ullico UIF", "Evergreen", "$6.7B", 6700, "Core", "Evergreen", {
    investmentStrategy: "North American open-ended essential-services infrastructure vehicle investing long term across utilities, transport, renewables, water and communications; official Ullico materials disclose $6.7B of fund AUM as of December 31, 2025.",
    sectors: ["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),

  // ── Vauban Infrastructure Partners ────────────────────────
  f("FUND-148", "Vauban Infrastructure Partners", "Vauban CIF IV", "2022", "€2.2B", 2420, "Core", "Financial Close", {
    investmentStrategy: "European core brownfield buy-and-hold fund focused on essential assets across digital, energy transition, mobility and social infrastructure.",
    sectors: ["Power & ET", "Utilities", "Digital", "Transportation", "Social Infra"],
    regions: ["Europe"],
  }),

  // ── Vision Ridge Partners ─────────────────────────────────
  f("FUND-149", "Vision Ridge Partners", "Vision Ridge Sustainable Asset Fund IV (SAF IV)", "2026", "$2.4B", 2400, "Opportunistic", "Financial Close", {
    investmentStrategy: "Flagship sustainable real-assets strategy that closed in February 2026 with approximately $2.4B across the fund and related vehicles, targeting the transition of energy, transportation and agriculture.",
    sectors: ["Power & ET", "Utilities", "Transportation", "Social Infra"],
    regions: ["North America"],
  }),
];

// ─── Build-Time Data Validation ─────────────────────────────

export function validateFundData(): string[] {
  const errors: string[] = [];
  const idSet = new Set<string>();
  const EXPECTED_COUNT = 150;

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
