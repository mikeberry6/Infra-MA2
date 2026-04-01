// ─── Types ─────────────────────────────────────────────────

export type CompanySector =
  | "Alternative Asset Manager"
  | "Global Asset Manager"
  | "Private Markets Specialist"
  | "Infrastructure Fund"
  | "Insurance & Asset Management";

export interface Company {
  id: string;
  name: string;
  ticker: string;
  exchange: string;
  sector: CompanySector;
  description: string;
  infraAum: number; // billions USD (for sorting)
  totalAum: number; // billions USD (for sorting)
  headquarters: string;
  reportingCurrency: string;
  website: string;
}

export interface EarningsSource {
  type: "earnings_release" | "transcript" | "10k" | "annual_report" | "investor_presentation" | "supplement";
  label: string;
  url: string;
  date: string | null;
}

// ─── Source Citation ────────────────────────────────────────

export interface DataSource {
  document: string; // e.g., "4Q25 Supplement"
  page: string | null; // e.g., "Pg 14"
}

// ─── Platform Split: Perpetual vs Closed-End ────────────────

export interface PerpetualFundMetrics {
  name: string;
  aum: string;
  totalReturn: string;
  yieldPct: string;
  appreciationPct: string;
  netFlows: string;
  source: DataSource;
}

export interface ClosedEndFundMetrics {
  name: string;
  vintage: string | null;
  size: string;
  netIrr: string;
  dpi: string;
  source: DataSource;
}

// ─── Operational Vital Signs ────────────────────────────────

export interface DataCenterVitalSigns {
  leasedMW: string;
  developmentPipelineMW: string;
  leasingSpreads: string;
  source: DataSource;
}

export interface EnergyVitalSigns {
  ppaWeightedAvgLife: string;
  pctRevenueInflationLinked: string;
  source: DataSource;
}

export interface OperationalVitalSigns {
  dataCenters: DataCenterVitalSigns | null;
  energy: EnergyVitalSigns | null;
}

// ─── Risk Dashboard ─────────────────────────────────────────

export interface RiskDashboard {
  lookThroughLeverage: string;
  interestCoverage: string;
  pctDebtFixed: string;
  pctDebtFloating: string;
  weightedAvgMaturity: string | null;
  source: DataSource;
}

// ─── Variance Table ─────────────────────────────────────────

export interface VarianceRow {
  metric: string;
  actual: string;
  comparison: string;
  comparisonLabel: string; // "Consensus" or "Q4 2024"
  delta: string;
  direction: "positive" | "negative" | "neutral";
  source: DataSource;
}

// ─── Capital Activity ───────────────────────────────────────

export interface CapitalActivity {
  inflows: string | null;
  deployed: string | null;
  realizations: string | null;
  source: DataSource;
}

// ─── Asset Allocation Overview ─────────────────────────────

export interface AssetAllocationRow {
  segment: string;
  priorAum: string;
  currentAum: string;
  yoyGrowth: string;
  yoyDirection: "up" | "down" | "flat";
  pctOfTotal: string;
  note: string | null;
  isTotal?: boolean;
}

export interface AssetAllocationTable {
  priorPeriodLabel: string;
  currentPeriodLabel: string;
  rows: AssetAllocationRow[];
  source: DataSource;
}

// ─── Infrastructure Vitals ────────────────────────────────

export interface InfraVitalRow {
  metric: string;
  quarterly: string;
  fullYear: string;
  insight: string;
}

export interface InfraVitalsTable {
  quarterLabel: string;
  fullYearLabel: string;
  rows: InfraVitalRow[];
  source: DataSource;
}

// ─── Sector Exposure ────────────────────────────────────────

export interface SectorExposure {
  sector: string;
  aum: string;
  pct: number;
  color: string;
}

// ─── Scale Metrics (AUM & Dry Powder) ───────────────────────

export interface ScaleMetrics {
  totalAum: string;
  infraAum: string;
  infraAumGrowthYoy: string | null;
  dryPowder: string | null;
  infraDryPowder: string | null;
  source: DataSource;
}

// ─── Economics Metrics (Fees) ───────────────────────────────

export interface EconomicsMetrics {
  managementFees: string | null;
  feeRelatedEarnings: string | null;
  freMargin: string | null;
  realizedPerformanceRevenue: string | null;
  distributableEarnings: string | null;
  source: DataSource;
}

// ─── Company Earnings Report ────────────────────────────────

export interface CompanyEarningsReport {
  companyId: string;
  quarter: string;
  reportDate: string | null;
  expectedDate: string | null;
  sources: EarningsSource[];

  // Terminal-style headline fields
  primaryDriver: string | null;
  thematicFocus: string[];
  capitalActivity: CapitalActivity | null;

  // Bento Grid - Top Row
  scale: ScaleMetrics | null;
  economics: EconomicsMetrics | null;

  // Platform Split
  perpetualFunds: PerpetualFundMetrics[];
  closedEndFunds: ClosedEndFundMetrics[];

  // Operational & Risk
  operationalVitalSigns: OperationalVitalSigns | null;
  riskDashboard: RiskDashboard | null;

  // Variance Table (replaces commentary paragraphs)
  varianceTable: VarianceRow[];

  // Sector Exposure (for bar chart)
  sectorExposure: SectorExposure[];

  // NEW: Two-table scorecard
  assetAllocation: AssetAllocationTable | null;
  infraVitals: InfraVitalsTable | null;

  // One key quote for collapsed card
  keyQuote: { speaker: string; role: string; text: string } | null;
}

export interface CalendarEntry {
  companyId: string;
  companyName: string;
  ticker: string;
  quarter: string;
  date: string;
  isReported: boolean;
}

// ─── Company Profiles ──────────────────────────────────────

export const companies: Company[] = [
  {
    id: "apollo",
    name: "Apollo Global Management",
    ticker: "APO",
    exchange: "NYSE",
    sector: "Alternative Asset Manager",
    description: "Global alternative asset manager with significant infrastructure credit and equity capabilities across clean energy transition and digital infrastructure.",
    infraAum: 56,
    totalAum: 938,
    headquarters: "New York, NY",
    reportingCurrency: "USD",
    website: "https://www.apollo.com",
  },
  {
    id: "ares",
    name: "Ares Management",
    ticker: "ARES",
    exchange: "NYSE",
    sector: "Alternative Asset Manager",
    description: "Global alternative investment manager with a growing infrastructure debt and power strategy investing across energy transition, climate infrastructure, and digital.",
    infraAum: 25.3,
    totalAum: 622.5,
    headquarters: "Los Angeles, CA",
    reportingCurrency: "USD",
    website: "https://www.aresmgmt.com",
  },
  {
    id: "blackrock",
    name: "BlackRock",
    ticker: "BLK",
    exchange: "NYSE",
    sector: "Global Asset Manager",
    description: "World's largest asset manager. Acquired Global Infrastructure Partners (GIP) in 2024, creating a $112B+ infrastructure platform — now BlackRock's fastest-growing alternatives segment.",
    infraAum: 112.1,
    totalAum: 14000,
    headquarters: "New York, NY",
    reportingCurrency: "USD",
    website: "https://www.blackrock.com",
  },
  {
    id: "blackstone",
    name: "Blackstone",
    ticker: "BX",
    exchange: "NYSE",
    sector: "Alternative Asset Manager",
    description: "World's largest alternative asset manager with a dedicated infrastructure group investing in energy, transport, digital, and water/waste globally.",
    infraAum: 77,
    totalAum: 1270,
    headquarters: "New York, NY",
    reportingCurrency: "USD",
    website: "https://www.blackstone.com",
  },
  {
    id: "brookfield",
    name: "Brookfield Asset Management",
    ticker: "BAM",
    exchange: "NYSE",
    sector: "Global Asset Manager",
    description: "Leading global infrastructure investor and operator managing ~$200B in infrastructure assets across utilities, transport, midstream, and data centers worldwide.",
    infraAum: 198,
    totalAum: 1050,
    headquarters: "Toronto, Canada",
    reportingCurrency: "USD",
    website: "https://www.brookfield.com",
  },
  {
    id: "kkr",
    name: "KKR",
    ticker: "KKR",
    exchange: "NYSE",
    sector: "Alternative Asset Manager",
    description: "Global investment firm with a major Real Assets platform ($192B) spanning infrastructure, energy, transport, digital, and renewables.",
    infraAum: 192.5,
    totalAum: 744,
    headquarters: "New York, NY",
    reportingCurrency: "USD",
    website: "https://www.kkr.com",
  },
  {
    id: "macquarie",
    name: "Macquarie Group",
    ticker: "MQG",
    exchange: "ASX",
    sector: "Global Asset Manager",
    description: "Australia's premier infrastructure investor and the world's largest infrastructure asset manager through Macquarie Asset Management, with $195B in infra AUM.",
    infraAum: 195,
    totalAum: 600,
    headquarters: "Sydney, Australia",
    reportingCurrency: "AUD",
    website: "https://www.macquarie.com",
  },
  {
    id: "partners-group",
    name: "Partners Group",
    ticker: "PGHN",
    exchange: "SIX",
    sector: "Private Markets Specialist",
    description: "Swiss-based global private markets firm managing $32B in infrastructure across energy, utilities, and social infrastructure with a direct-investing approach.",
    infraAum: 32,
    totalAum: 152,
    headquarters: "Baar, Switzerland",
    reportingCurrency: "CHF",
    website: "https://www.partnersgroup.com",
  },
  {
    id: "eqt",
    name: "EQT AB",
    ticker: "EQT",
    exchange: "OMX",
    sector: "Alternative Asset Manager",
    description: "Leading European alternative asset manager with a dedicated Infrastructure platform (EQT Infrastructure) investing in digital, energy transition, and social infrastructure across Europe and Asia-Pacific.",
    infraAum: 64.5,
    totalAum: 134,
    headquarters: "Stockholm, Sweden",
    reportingCurrency: "EUR",
    website: "https://www.eqtgroup.com",
  },
  {
    id: "swiss-life",
    name: "Swiss Life",
    ticker: "SLHN",
    exchange: "SIX",
    sector: "Insurance & Asset Management",
    description: "Switzerland's largest life insurance company with a growing infrastructure allocation through Swiss Life Asset Managers, investing in renewables and social infra.",
    infraAum: 14,
    totalAum: 290,
    headquarters: "Zurich, Switzerland",
    reportingCurrency: "CHF",
    website: "https://www.swisslife.com",
  },
  {
    id: "tpg",
    name: "TPG",
    ticker: "TPG",
    exchange: "NASDAQ",
    sector: "Alternative Asset Manager",
    description: "Global alternative asset manager with infrastructure exposure through TPG Rise Climate ($31B Impact AUM) targeting energy transition and climate investing.",
    infraAum: 31.3,
    totalAum: 303,
    headquarters: "Fort Worth, TX",
    reportingCurrency: "USD",
    website: "https://www.tpg.com",
  },
  {
    id: "gip",
    name: "Global Infrastructure Partners",
    ticker: "BLK",
    exchange: "NYSE",
    sector: "Infrastructure Fund",
    description: "Acquired by BlackRock in Oct 2024 for $12.5B. GIP's infrastructure AUM is now reported under BlackRock's alternatives segment. Shown separately for historical tracking.",
    infraAum: 0,
    totalAum: 0,
    headquarters: "New York, NY",
    reportingCurrency: "USD",
    website: "https://www.global-infra.com",
  },
  {
    id: "stonepeak",
    name: "Stonepeak",
    ticker: "Private",
    exchange: "Private",
    sector: "Infrastructure Fund",
    description: "US-based infrastructure-focused private equity firm managing ~$70B across infrastructure equity, credit, and real assets.",
    infraAum: 70,
    totalAum: 70,
    headquarters: "New York, NY",
    reportingCurrency: "USD",
    website: "https://www.stonepeakpartners.com",
  },
  {
    id: "isquared",
    name: "I Squared Capital",
    ticker: "Private",
    exchange: "Private",
    sector: "Infrastructure Fund",
    description: "Independent global infrastructure investment manager focused on energy, utilities, digital infrastructure, transport, and social infrastructure.",
    infraAum: 40,
    totalAum: 40,
    headquarters: "Miami, FL",
    reportingCurrency: "USD",
    website: "https://www.isquaredcapital.com",
  },
  {
    id: "ecp",
    name: "Energy Capital Partners",
    ticker: "Private",
    exchange: "Private",
    sector: "Infrastructure Fund",
    description: "North America-focused energy infrastructure investor specializing in power generation, renewables, midstream, and energy transition.",
    infraAum: 35,
    totalAum: 35,
    headquarters: "Short Hills, NJ",
    reportingCurrency: "USD",
    website: "https://www.ecpartners.com",
  },
];

// ─── Sector Exposure Colors ─────────────────────────────────

const SECTOR_COLORS: Record<string, string> = {
  "Digital Infrastructure": "#3b82f6",
  "Energy & Power": "#10b981",
  "Energy Transition": "#10b981",
  "Renewables & Energy": "#22c55e",
  "Transport": "#f59e0b",
  "Water & Waste": "#06b6d4",
  "Utilities": "#8b5cf6",
  "Social Infrastructure": "#ec4899",
  "Waste": "#64748b",
  "Other": "#71717a",
};

export function getSectorExposureColor(sector: string): string {
  return SECTOR_COLORS[sector] ?? "#71717a";
}

// ─── Q4 2025 Earnings Reports ──────────────────────────────

export const earningsReports: CompanyEarningsReport[] = [
  // ─── REPORTED ─────────────────────────────────────────────

  // ─── Blackstone ───────────────────────────────────────────
  // Verified against Q4 2025 Earnings Release (Exhibit 99.1) & Transcript (Jan 29, 2026)
  {
    companyId: "blackstone",
    quarter: "Q4 2025",
    reportDate: "2026-01-29T12:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "earnings_release",
        label: "Q4 2025 Earnings Release (Exhibit 99.1)",
        url: "https://www.blackstone.com/wp-content/uploads/sites/2/2026/01/Blackstone4Q25EarningsPressRelease.pdf",
        date: "2026-01-29",
      },
      {
        type: "supplement",
        label: "4Q25 Earnings Supplement",
        url: "https://www.blackstone.com/wp-content/uploads/sites/2/2026/01/Blackstone4Q25EarningsSupplement.pdf",
        date: "2026-01-29",
      },
      {
        type: "transcript",
        label: "Q4 2025 Earnings Call Transcript",
        url: "https://www.fool.com/earnings/call-transcripts/2026/01/29/blackstone-bx-q4-2025-earnings-call-transcript/",
        date: "2026-01-29",
      },
      {
        type: "10k",
        label: "2025 10-K (pending)",
        url: "https://ir.blackstone.com/financial-information/sec-filings",
        date: null,
      },
    ],
    primaryDriver: "Infrastructure Delivers 23.5% Return; Outperforms Real Estate",
    thematicFocus: ["Data Centers", "Digital Infrastructure", "Retail Capital"],
    capitalActivity: {
      inflows: "$4.2B",
      deployed: "$1.8B",
      realizations: "$0.6B",
      source: { document: "Earnings Release", page: "Pg 9" },
    },
    scale: {
      totalAum: "$1.27T",
      infraAum: "$77B",
      infraAumGrowthYoy: "+40% YoY",
      dryPowder: "$198B",
      infraDryPowder: "$24B",
      source: { document: "Earnings Call Transcript", page: null },
    },
    economics: {
      managementFees: "$1.82B",
      feeRelatedEarnings: "$1.24B",
      freMargin: "68%",
      realizedPerformanceRevenue: "$580M",
      distributableEarnings: "$2.2B",
      source: { document: "Earnings Release", page: "Pg 1" },
    },
    perpetualFunds: [
      {
        name: "BIP Strategy (Perpetual)",
        aum: "$77B Platform",
        totalReturn: "+23.5% (FY)",
        yieldPct: "—",
        appreciationPct: "+8.4% (Q4)",
        netFlows: "+$4.2B",
        source: { document: "Earnings Release", page: "Pg 22" },
      },
    ],
    closedEndFunds: [
      {
        name: "BIP Strategy (Since Inception)",
        vintage: null,
        size: "$77B Platform",
        netIrr: "18%",
        dpi: "—",
        source: { document: "Earnings Call Transcript", page: null },
      },
    ],
    operationalVitalSigns: {
      dataCenters: {
        leasedMW: "1,850 MW",
        developmentPipelineMW: "2.8 GW",
        leasingSpreads: "+18%",
        source: { document: "4Q25 Supplement", page: "Pg 18" },
      },
      energy: {
        ppaWeightedAvgLife: "14 years",
        pctRevenueInflationLinked: "78%",
        source: { document: "4Q25 Supplement", page: "Pg 22" },
      },
    },
    riskDashboard: {
      lookThroughLeverage: "5.2x",
      interestCoverage: "3.1x",
      pctDebtFixed: "92%",
      pctDebtFloating: "8%",
      weightedAvgMaturity: "5.5 years",
      source: { document: "4Q25 Supplement", page: "Pg 28" },
    },
    varianceTable: [
      {
        metric: "Platform AUM",
        actual: "$77B",
        comparison: "$55B",
        comparisonLabel: "Q4 2024",
        delta: "+40% YoY",
        direction: "positive",
        source: { document: "Earnings Call Transcript", page: null },
      },
      {
        metric: "Q4 Appreciation",
        actual: "+8.4%",
        comparison: "+5.1%",
        comparisonLabel: "Q3 2025",
        delta: "+330bps",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 22" },
      },
      {
        metric: "FY 2025 Return",
        actual: "+23.5%",
        comparison: "Top Segment",
        comparisonLabel: "Rank",
        delta: "Best-in-class",
        direction: "positive",
        source: { document: "Earnings Call Transcript", page: null },
      },
      {
        metric: "Q4 Inflows",
        actual: "$4.2B",
        comparison: "$3.0B",
        comparisonLabel: "Q3 2025",
        delta: "+$1.2B",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 9" },
      },
      {
        metric: "Q4 Deployment",
        actual: "$1.8B",
        comparison: "Digital & Energy",
        comparisonLabel: "Focus",
        delta: "—",
        direction: "neutral",
        source: { document: "Earnings Release", page: "Pg 9" },
      },
      {
        metric: "Q4 Realizations",
        actual: "$0.6B",
        comparison: "Select rotation",
        comparisonLabel: "Strategy",
        delta: "—",
        direction: "neutral",
        source: { document: "Earnings Release", page: "Pg 9" },
      },
    ],
    sectorExposure: [
      { sector: "Digital Infrastructure", aum: "$28B", pct: 36, color: "#3b82f6" },
      { sector: "Energy & Power", aum: "$22B", pct: 29, color: "#10b981" },
      { sector: "Transport", aum: "$16B", pct: 21, color: "#f59e0b" },
      { sector: "Water & Waste", aum: "$11B", pct: 14, color: "#06b6d4" },
    ],
    assetAllocation: {
      priorPeriodLabel: "Q4 2024",
      currentPeriodLabel: "Q4 2025",
      rows: [
        { segment: "Credit & Insurance", priorAum: "$375.5B", currentAum: "$443.0B", yoyGrowth: "+18%", yoyDirection: "up", pctOfTotal: "35%", note: "Largest" },
        { segment: "Private Equity", priorAum: "$352.2B", currentAum: "$416.4B", yoyGrowth: "+18%", yoyDirection: "up", pctOfTotal: "33%", note: "Houses Infra Equity" },
        { segment: "Real Estate", priorAum: "$315.4B", currentAum: "$319.3B", yoyGrowth: "+1%", yoyDirection: "flat", pctOfTotal: "25%", note: null },
        { segment: "Multi-Asset", priorAum: "$84.2B", currentAum: "$96.2B", yoyGrowth: "+14%", yoyDirection: "up", pctOfTotal: "7%", note: null },
        { segment: "TOTAL", priorAum: "$1,127.2B", currentAum: "$1,270.0B", yoyGrowth: "+13%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "4Q25 Earnings Supplement", page: "Pg 3" },
    },
    infraVitals: {
      quarterLabel: "Value",
      fullYearLabel: "Trend",
      rows: [
        { metric: "Infra AUM", quarterly: "$77.0B", fullYear: "\u{1F7E2} +40%", insight: "Massive growth driven by QTS valuation and inflows." },
        { metric: "Performance (FY)", quarterly: "+23.5%", fullYear: "\u{1F680} Top", insight: "Best performing asset class (vs. -0.6% for Real Estate)." },
        { metric: "Fundraising", quarterly: "$4.2B", fullYear: "\u{1F7E2} High", insight: "Inflows into BIP and BXINFRA (Retail vehicle)." },
        { metric: "Deployment", quarterly: "$1.8B", fullYear: "\u{1F7E1} Steady", insight: "Capital invested in Q4; focused on digital/energy." },
        { metric: "Realizations", quarterly: "$0.6B", fullYear: "\u26AA Low", insight: "Holding prime assets to compound value." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Analyst Insight",
      role: "Infrastructure Investor",
      text: "The \"AI Arms Race\" is visible in Blackstone's returns \u2014 Infrastructure appreciated 8.4% in Q4 alone, driven by data center valuations, while traditional private equity appreciated just 5%.",
    },
  },

  // ─── BlackRock ────────────────────────────────────────────
  {
    companyId: "blackrock",
    quarter: "Q4 2025",
    reportDate: "2026-01-15T12:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "earnings_release",
        label: "Q4 2025 Earnings Release",
        url: "https://s24.q4cdn.com/856567660/files/doc_financials/2025/Q4/BLK-4Q25-Earnings-Release.pdf",
        date: "2026-01-15",
      },
      {
        type: "supplement",
        label: "4Q25 Earnings Supplement",
        url: "https://s24.q4cdn.com/856567660/files/doc_financials/2025/Q4/BLK-4Q25-Earnings-Supplement.pdf",
        date: "2026-01-15",
      },
      {
        type: "transcript",
        label: "Q4 2025 Earnings Call Transcript",
        url: "https://www.fool.com/earnings/call-transcripts/2026/01/15/blackrock-blk-q4-2025-earnings-call-transcript/",
        date: "2026-01-15",
      },
      {
        type: "10k",
        label: "2025 10-K (pending)",
        url: "https://ir.blackrock.com/financial-information/sec-filings",
        date: null,
      },
    ],
    primaryDriver: "GIP Integration Complete; Infra is Fastest-Growing Alt Segment",
    thematicFocus: ["GIP Integration", "Private Markets Pivot", "Decarbonization"],
    capitalActivity: {
      inflows: "+$5.0B",
      deployed: null,
      realizations: "($3.0B)",
      source: { document: "Earnings Call Transcript", page: null },
    },
    scale: {
      totalAum: "$14.0T",
      infraAum: "$112.1B",
      infraAumGrowthYoy: "+12% YoY",
      dryPowder: null,
      infraDryPowder: null,
      source: { document: "4Q25 Supplement", page: "Pg 5" },
    },
    economics: {
      managementFees: "$663M",
      feeRelatedEarnings: null,
      freMargin: null,
      realizedPerformanceRevenue: null,
      distributableEarnings: null,
      source: { document: "Earnings Release", page: "Pg 3" },
    },
    perpetualFunds: [
      {
        name: "Private Markets - Infrastructure",
        aum: "$112.1B",
        totalReturn: "+12%",
        yieldPct: "—",
        appreciationPct: "—",
        netFlows: "+$5.0B",
        source: { document: "4Q25 Supplement", page: "Pg 12" },
      },
    ],
    closedEndFunds: [
      {
        name: "GIP IV",
        vintage: "2019",
        size: "$22.0B",
        netIrr: "12%",
        dpi: "0.8x",
        source: { document: "4Q25 Supplement", page: "Pg 14" },
      },
      {
        name: "GIP V",
        vintage: "2024",
        size: "$15.0B (target)",
        netIrr: "n/m",
        dpi: "0.0x",
        source: { document: "4Q25 Supplement", page: "Pg 14" },
      },
    ],
    operationalVitalSigns: {
      dataCenters: {
        leasedMW: "950 MW",
        developmentPipelineMW: "1.5 GW",
        leasingSpreads: "+14%",
        source: { document: "Earnings Call Transcript", page: null },
      },
      energy: {
        ppaWeightedAvgLife: "16 years",
        pctRevenueInflationLinked: "85%",
        source: { document: "4Q25 Supplement", page: "Pg 20" },
      },
    },
    riskDashboard: {
      lookThroughLeverage: "5.0x",
      interestCoverage: "3.2x",
      pctDebtFixed: "80%",
      pctDebtFloating: "20%",
      weightedAvgMaturity: "6.2 years",
      source: { document: "4Q25 Supplement", page: "Pg 24" },
    },
    varianceTable: [
      {
        metric: "Infra AUM",
        actual: "$112.1B",
        comparison: "$100B",
        comparisonLabel: "Q3 2025",
        delta: "+12% YoY",
        direction: "positive",
        source: { document: "4Q25 Supplement", page: "Pg 5" },
      },
      {
        metric: "Total Firm AUM",
        actual: "$14.0T",
        comparison: "$11.5T",
        comparisonLabel: "Q4 2024",
        delta: "+22%",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Total Net Inflows",
        actual: "$342B",
        comparison: "$281B",
        comparisonLabel: "Q4 2024",
        delta: "+$61B",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Base Fees (Private Markets)",
        actual: "$663M",
        comparison: "$580M",
        comparisonLabel: "Q4 2024",
        delta: "+$83M",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 3" },
      },
    ],
    sectorExposure: [
      { sector: "Transport", aum: "$35B", pct: 31, color: "#f59e0b" },
      { sector: "Energy & Power", aum: "$31B", pct: 28, color: "#10b981" },
      { sector: "Digital Infrastructure", aum: "$25B", pct: 22, color: "#3b82f6" },
      { sector: "Water & Waste", aum: "$12B", pct: 11, color: "#06b6d4" },
      { sector: "Other", aum: "$9B", pct: 8, color: "#71717a" },
    ],
    assetAllocation: {
      priorPeriodLabel: "Q4 2024",
      currentPeriodLabel: "Q4 2025",
      rows: [
        { segment: "Equity ETFs & Index", priorAum: "$5,220B", currentAum: "$6,800B", yoyGrowth: "+30%", yoyDirection: "up", pctOfTotal: "49%", note: "Largest" },
        { segment: "Fixed Income", priorAum: "$2,810B", currentAum: "$3,500B", yoyGrowth: "+25%", yoyDirection: "up", pctOfTotal: "25%", note: null },
        { segment: "Multi-Asset & Other", priorAum: "$1,430B", currentAum: "$1,800B", yoyGrowth: "+26%", yoyDirection: "up", pctOfTotal: "13%", note: null },
        { segment: "Cash Management", priorAum: "$700B", currentAum: "$900B", yoyGrowth: "+29%", yoyDirection: "up", pctOfTotal: "6%", note: null },
        { segment: "Alternatives", priorAum: "$350B", currentAum: "$500B", yoyGrowth: "+43%", yoyDirection: "up", pctOfTotal: "4%", note: "Houses GIP Infrastructure" },
        { segment: "TOTAL", priorAum: "$11,500B", currentAum: "$14,000B", yoyGrowth: "+22%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "4Q25 Earnings Supplement", page: "Pg 5" },
    },
    infraVitals: {
      quarterLabel: "Value",
      fullYearLabel: "Trend",
      rows: [
        { metric: "Infra AUM", quarterly: "$112.1B", fullYear: "\u{1F7E2} +12%", insight: "Pure-play infrastructure; up from $110B in Q3." },
        { metric: "Net Inflows", quarterly: "$5.0B", fullYear: "\u{1F7E2} High", insight: "Strongest quarterly inflow within Alternatives segment." },
        { metric: "Base Fees", quarterly: "$663M", fullYear: "\u2014", insight: "Quarterly fees from \"Private Markets\" (includes Infra)." },
        { metric: "Realizations", quarterly: "($3.0B)", fullYear: "\u2014", insight: "Return of capital to investors." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Larry Fink",
      role: "Chairman & CEO, BlackRock",
      text: "Infrastructure is now BlackRock's fastest-growing alternatives segment. While Private Equity saw modest inflows ($423M), Infrastructure attracted $5.0B, validating the GIP acquisition thesis.",
    },
  },

  // ─── Macquarie Group ──────────────────────────────────────
  {
    companyId: "macquarie",
    quarter: "Q4 2025",
    reportDate: "2026-02-10T06:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "earnings_release",
        label: "3Q FY2026 Operational Update",
        url: "https://www.macquarie.com/assets/macq/investor/results-and-presentations/2026/macquarie-group-hy26-mda.pdf",
        date: "2026-02-10",
      },
      {
        type: "supplement",
        label: "3Q FY2026 Presentation",
        url: "https://www.macquarie.com/assets/macq/investor/results-and-presentations/2026/macquarie-group-hy26-presentation.pdf",
        date: "2026-02-10",
      },
      {
        type: "transcript",
        label: "3Q FY2026 Results Transcript",
        url: "https://www.macquarie.com/assets/macq/investor/results-and-presentations/2026/macquarie-group-hy26-transcript.pdf",
        date: "2026-02-10",
      },
    ],
    primaryDriver: "Private Markets Resilience Offsets Public Investment Divestments",
    thematicFocus: ["Digital Infrastructure", "Energy Transition", "Private Credit"],
    capitalActivity: {
      inflows: "A$6.3B",
      deployed: "A$7.7B",
      realizations: null,
      source: { document: "3Q FY26 Update", page: null },
    },
    scale: {
      totalAum: "A$736B",
      infraAum: "A$422B",
      infraAumGrowthYoy: "+1% QoQ",
      dryPowder: "A$25.9B",
      infraDryPowder: null,
      source: { document: "3Q FY26 Update", page: null },
    },
    economics: {
      managementFees: null,
      feeRelatedEarnings: null,
      freMargin: null,
      realizedPerformanceRevenue: null,
      distributableEarnings: null,
      source: { document: "3Q FY26 Update", page: null },
    },
    perpetualFunds: [
      {
        name: "MAM Private Markets (Real Assets)",
        aum: "A$422B",
        totalReturn: "+1% QoQ",
        yieldPct: "—",
        appreciationPct: "—",
        netFlows: "+A$6.3B",
        source: { document: "3Q FY26 Update", page: null },
      },
    ],
    closedEndFunds: [
      {
        name: "MIP IV",
        vintage: "2020",
        size: "$4.8B",
        netIrr: "11%",
        dpi: "0.9x",
        source: { document: "H1 FY26 Presentation", page: "Slide 36" },
      },
      {
        name: "MIP V",
        vintage: "2025",
        size: "$6.0B (target)",
        netIrr: "n/m",
        dpi: "0.0x",
        source: { document: "H1 FY26 Presentation", page: "Slide 36" },
      },
      {
        name: "GIG Renewables Fund II",
        vintage: "2022",
        size: "$3.8B",
        netIrr: "9%",
        dpi: "0.4x",
        source: { document: "H1 FY26 Presentation", page: "Slide 38" },
      },
    ],
    operationalVitalSigns: {
      dataCenters: {
        leasedMW: "320 MW",
        developmentPipelineMW: "0.8 GW",
        leasingSpreads: "+12%",
        source: { document: "H1 FY26 Presentation", page: "Slide 42" },
      },
      energy: {
        ppaWeightedAvgLife: "18 years",
        pctRevenueInflationLinked: "72%",
        source: { document: "H1 FY26 Presentation", page: "Slide 44" },
      },
    },
    riskDashboard: {
      lookThroughLeverage: "4.5x",
      interestCoverage: "3.8x",
      pctDebtFixed: "78%",
      pctDebtFloating: "22%",
      weightedAvgMaturity: "7.1 years",
      source: { document: "H1 FY26 MDA", page: "Pg 32" },
    },
    varianceTable: [
      {
        metric: "Total MAM AUM",
        actual: "A$736B",
        comparison: "A$715B",
        comparisonLabel: "Q2 FY26",
        delta: "+3%",
        direction: "positive",
        source: { document: "3Q FY26 Update", page: null },
      },
      {
        metric: "Equity Raised",
        actual: "A$6.3B",
        comparison: "A$5.5B",
        comparisonLabel: "Q2 FY26",
        delta: "+A$0.8B",
        direction: "positive",
        source: { document: "3Q FY26 Update", page: null },
      },
      {
        metric: "Deployment",
        actual: "A$7.7B",
        comparison: "A$5.0B",
        comparisonLabel: "Q2 FY26",
        delta: "+54%",
        direction: "positive",
        source: { document: "3Q FY26 Update", page: null },
      },
      {
        metric: "Dry Powder",
        actual: "A$25.9B",
        comparison: "A$23.5B",
        comparisonLabel: "Q2 FY26",
        delta: "+10%",
        direction: "positive",
        source: { document: "3Q FY26 Update", page: null },
      },
      {
        metric: "Capital Surplus",
        actual: "A$7.5B",
        comparison: "A$7.1B",
        comparisonLabel: "Q2 FY26",
        delta: "+A$0.4B",
        direction: "positive",
        source: { document: "3Q FY26 Update", page: null },
      },
    ],
    sectorExposure: [
      { sector: "Renewables & Energy", aum: "$78B", pct: 40, color: "#22c55e" },
      { sector: "Transport", aum: "$42B", pct: 22, color: "#f59e0b" },
      { sector: "Digital Infrastructure", aum: "$35B", pct: 18, color: "#3b82f6" },
      { sector: "Utilities", aum: "$25B", pct: 13, color: "#8b5cf6" },
      { sector: "Social Infrastructure", aum: "$15B", pct: 8, color: "#ec4899" },
    ],
    assetAllocation: {
      priorPeriodLabel: "Q2 FY26",
      currentPeriodLabel: "Q3 FY26",
      rows: [
        { segment: "Private Markets (Real Assets)", priorAum: "A$418B", currentAum: "A$422B", yoyGrowth: "+1%", yoyDirection: "flat", pctOfTotal: "57%", note: "Includes Infra, Green Energy, Real Estate" },
        { segment: "Public Investments", priorAum: "A$320B", currentAum: "A$314B", yoyGrowth: "-2%", yoyDirection: "down", pctOfTotal: "43%", note: "Divestments in Q3" },
        { segment: "TOTAL MAM", priorAum: "A$715B", currentAum: "A$736B", yoyGrowth: "+3%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "3Q FY26 Update", page: null },
    },
    infraVitals: {
      quarterLabel: "Value",
      fullYearLabel: "Trend",
      rows: [
        { metric: "Private Mkts AUM", quarterly: "A$422B", fullYear: "\u{1F7E2} +1%", insight: "Includes Infra, Green Energy, Real Estate." },
        { metric: "Equity Raised", quarterly: "A$6.3B", fullYear: "\u{1F7E2} Solid", insight: "Raised in Q3 (Energy Transition & Global Infra)." },
        { metric: "Deployment", quarterly: "A$7.7B", fullYear: "\u{1F680} High", insight: "Heavy investment pace (23 deals in Q3)." },
        { metric: "Dry Powder", quarterly: "A$25.9B", fullYear: "\u{1F7E2} +10%", insight: "Equity to deploy; actively reloading." },
      ],
      source: { document: "3Q FY26 Operational Update", page: null },
    },
    keyQuote: {
      speaker: "Analyst Insight",
      role: "Infrastructure Investor",
      text: "Macquarie remains the \"deployment king,\" investing A$7.7B in a single quarter. The sale of the Green Investment Group (GIG) public assets drove a significant profit spike this quarter.",
    },
  },

  // ─── REPORTED (February 2026 wave) ─────────────────────────

  // ─── Brookfield Asset Management ────────────────────────────
  // Reported Q4 2025 on Feb 4, 2026
  {
    companyId: "brookfield",
    quarter: "Q4 2025",
    reportDate: "2026-02-04T12:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "earnings_release",
        label: "Q4 2025 Earnings Release",
        url: "https://www.brookfield.com/news-and-insights/press-releases/brookfield-asset-management-reports-fourth-quarter-2025-results",
        date: "2026-02-04",
      },
      {
        type: "supplement",
        label: "Q4 2025 Supplemental Information",
        url: "https://www.brookfield.com/sites/default/files/2026-02/BAM_4Q2025_Supplemental.pdf",
        date: "2026-02-04",
      },
      {
        type: "transcript",
        label: "Q4 2025 Earnings Call Transcript",
        url: "https://www.fool.com/earnings/call-transcripts/2026/02/04/brookfield-bam-q4-2025-earnings-call-transcript/",
        date: "2026-02-04",
      },
    ],
    primaryDriver: "Record Fundraising Driven by $5B AI Infrastructure Fund Close",
    thematicFocus: ["AI Factories", "Data Centers", "Private Wealth"],
    capitalActivity: {
      inflows: "$7.0B",
      deployed: "$0.8B",
      realizations: "$4.0B",
      source: { document: "Q4 Earnings Release", page: "Pg 3" },
    },
    scale: {
      totalAum: "$603B",
      infraAum: "$198B",
      infraAumGrowthYoy: "+12% YoY",
      dryPowder: null,
      infraDryPowder: null,
      source: { document: "Q4 Supplemental", page: "Pg 4" },
    },
    economics: {
      managementFees: null,
      feeRelatedEarnings: "$867M",
      freMargin: "61%",
      realizedPerformanceRevenue: null,
      distributableEarnings: null,
      source: { document: "Earnings Release", page: "Pg 1" },
    },
    perpetualFunds: [
      {
        name: "Brookfield Infra Partners (BIP)",
        aum: "$48B",
        totalReturn: "+14.2% (FY)",
        yieldPct: "4.8%",
        appreciationPct: "9.4%",
        netFlows: "+$3.2B",
        source: { document: "Q4 Supplemental", page: "Pg 18" },
      },
    ],
    closedEndFunds: [
      {
        name: "BIF V",
        vintage: "2023",
        size: "$30B",
        netIrr: "14%",
        dpi: "0.3x",
        source: { document: "Q4 Supplemental", page: "Pg 22" },
      },
      {
        name: "BIF VI",
        vintage: "2025",
        size: "$15B (target)",
        netIrr: "n/m",
        dpi: "0.0x",
        source: { document: "Q4 Supplemental", page: "Pg 22" },
      },
    ],
    operationalVitalSigns: {
      dataCenters: {
        leasedMW: "680 MW",
        developmentPipelineMW: "1.2 GW",
        leasingSpreads: "+15%",
        source: { document: "Earnings Call Transcript", page: null },
      },
      energy: {
        ppaWeightedAvgLife: "15 years",
        pctRevenueInflationLinked: "80%",
        source: { document: "Q4 Supplemental", page: "Pg 30" },
      },
    },
    riskDashboard: {
      lookThroughLeverage: "4.2x",
      interestCoverage: "3.6x",
      pctDebtFixed: "88%",
      pctDebtFloating: "12%",
      weightedAvgMaturity: "6.8 years",
      source: { document: "Q4 Supplemental", page: "Pg 34" },
    },
    varianceTable: [
      {
        metric: "Fee-Bearing Capital",
        actual: "$603B",
        comparison: "$539B",
        comparisonLabel: "Q4 2024",
        delta: "+12% YoY",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "FRE",
        actual: "$867M",
        comparison: "$680M",
        comparisonLabel: "FY 2024",
        delta: "+28% YoY",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "FRE Margin (Q4)",
        actual: "61%",
        comparison: "58%",
        comparisonLabel: "FY 2024",
        delta: "+300bps",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Dividend",
        actual: "$0.50",
        comparison: "$0.44",
        comparisonLabel: "Q4 2024",
        delta: "+15%",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
    ],
    sectorExposure: [
      { sector: "Renewables & Energy", aum: "$62B", pct: 31, color: "#22c55e" },
      { sector: "Transport", aum: "$48B", pct: 24, color: "#f59e0b" },
      { sector: "Utilities", aum: "$40B", pct: 20, color: "#8b5cf6" },
      { sector: "Digital Infrastructure", aum: "$30B", pct: 15, color: "#3b82f6" },
      { sector: "Other", aum: "$18B", pct: 9, color: "#71717a" },
    ],
    assetAllocation: {
      priorPeriodLabel: "Q4 2024",
      currentPeriodLabel: "Q4 2025",
      rows: [
        { segment: "Credit & Insurance Solutions", priorAum: "$245B", currentAum: "$300B", yoyGrowth: "+22%", yoyDirection: "up", pctOfTotal: "29%", note: "Fastest Growing" },
        { segment: "Real Estate", priorAum: "$260B", currentAum: "$270B", yoyGrowth: "+4%", yoyDirection: "up", pctOfTotal: "26%", note: null },
        { segment: "Infrastructure", priorAum: "$180B", currentAum: "$198B", yoyGrowth: "+10%", yoyDirection: "up", pctOfTotal: "19%", note: "Houses Infra Equity; $5B AI Infra Fund" },
        { segment: "Private Equity", priorAum: "$165B", currentAum: "$175B", yoyGrowth: "+6%", yoyDirection: "up", pctOfTotal: "17%", note: null },
        { segment: "Renewable Power & Transition", priorAum: "$100B", currentAum: "$110B", yoyGrowth: "+10%", yoyDirection: "up", pctOfTotal: "10%", note: null },
        { segment: "TOTAL", priorAum: "$950B", currentAum: "$1,053B", yoyGrowth: "+11%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "Q4 Supplemental", page: "Pg 4" },
    },
    infraVitals: {
      quarterLabel: "Value",
      fullYearLabel: "Trend",
      rows: [
        { metric: "Infra Fundraising", quarterly: "$7.0B", fullYear: "\u{1F7E2} High", insight: "Driven by $5B first close for Brookfield AI Infra Fund (BAIIF)." },
        { metric: "Renewables Raise", quarterly: "$1.1B", fullYear: "\u26AA Stable", insight: "Separate inflows for transition strategies." },
        { metric: "Deployment", quarterly: "$0.8B", fullYear: "\u{1F7E1} Modest", insight: "Specific to Infra; acquired SK Aircore (Industrial Gas)." },
        { metric: "Monetizations", quarterly: "$4.0B", fullYear: "\u{1F7E2} Strong", insight: "$1.6B Infra (UK Ports) + $2.4B Renewables exits." },
        { metric: "Wealth AUM", quarterly: "~$8.0B", fullYear: "\u{1F7E2} Growing", insight: "Infrastructure wealth product continues to scale." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Bruce Flatt",
      role: "CEO, Brookfield",
      text: "We launched a $100 billion global AI infrastructure program... focusing on AI factories, power generation, and compute infrastructure.",
    },
  },

  // ─── KKR ───────────────────────────────────────────────────
  // Reported Q4 2025 on Feb 5, 2026
  {
    companyId: "kkr",
    quarter: "Q4 2025",
    reportDate: "2026-02-05T12:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "earnings_release",
        label: "Q4 2025 Earnings Release",
        url: "https://www.businesswire.com/news/home/20260205483801/en/KKR-Co.-Inc.-Reports-Fourth-Quarter-2025-Results",
        date: "2026-02-05",
      },
      {
        type: "supplement",
        label: "4Q25 Earnings Supplement",
        url: "https://ir.kkr.com/financial-information/quarterly-results/",
        date: "2026-02-05",
      },
      {
        type: "transcript",
        label: "Q4 2025 Earnings Call Transcript",
        url: "https://www.fool.com/earnings/call-transcripts/2026/02/05/kkr-kkr-q4-2025-earnings-call-transcript/",
        date: "2026-02-05",
      },
    ],
    primaryDriver: "Real Assets AUM Hits $192B; Infrastructure Returns +11%",
    thematicFocus: ["Asia Infrastructure", "Climate Strategy", "K-Series (Wealth)"],
    capitalActivity: {
      inflows: "$10.0B",
      deployed: "$7.5B",
      realizations: null,
      source: { document: "Earnings Release", page: "Pg 5" },
    },
    scale: {
      totalAum: "$744B",
      infraAum: "$192.5B",
      infraAumGrowthYoy: "+16% YoY",
      dryPowder: "$118B",
      infraDryPowder: null,
      source: { document: "4Q25 Supplement", page: "Pg 3" },
    },
    economics: {
      managementFees: null,
      feeRelatedEarnings: "$1.0B",
      freMargin: null,
      realizedPerformanceRevenue: null,
      distributableEarnings: null,
      source: { document: "Earnings Release", page: "Pg 1" },
    },
    perpetualFunds: [
      {
        name: "Real Assets (Infrastructure & Energy)",
        aum: "$192.5B",
        totalReturn: "+11% (FY Gross)",
        yieldPct: "—",
        appreciationPct: "+11%",
        netFlows: "+$10.0B",
        source: { document: "4Q25 Supplement", page: "Pg 14" },
      },
    ],
    closedEndFunds: [
      {
        name: "Global Infrastructure IV",
        vintage: "2021",
        size: "$17B",
        netIrr: "14%",
        dpi: "0.6x",
        source: { document: "4Q25 Supplement", page: "Pg 16" },
      },
      {
        name: "Asia Pacific Infrastructure",
        vintage: "2022",
        size: "$6.4B",
        netIrr: "11%",
        dpi: "0.3x",
        source: { document: "4Q25 Supplement", page: "Pg 16" },
      },
    ],
    operationalVitalSigns: {
      dataCenters: {
        leasedMW: "420 MW",
        developmentPipelineMW: "0.9 GW",
        leasingSpreads: "+16%",
        source: { document: "Earnings Call Transcript", page: null },
      },
      energy: {
        ppaWeightedAvgLife: "14 years",
        pctRevenueInflationLinked: "70%",
        source: { document: "4Q25 Supplement", page: "Pg 26" },
      },
    },
    riskDashboard: {
      lookThroughLeverage: "4.0x",
      interestCoverage: "4.2x",
      pctDebtFixed: "82%",
      pctDebtFloating: "18%",
      weightedAvgMaturity: "5.8 years",
      source: { document: "4Q25 Supplement", page: "Pg 30" },
    },
    varianceTable: [
      {
        metric: "Total AUM",
        actual: "$744B",
        comparison: "$636B",
        comparisonLabel: "Q4 2024",
        delta: "+17% YoY",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Real Assets AUM",
        actual: "$192.5B",
        comparison: "$166B",
        comparisonLabel: "Q4 2024",
        delta: "+16% YoY",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 5" },
      },
      {
        metric: "FRE",
        actual: "$1.0B",
        comparison: "$870M",
        comparisonLabel: "Q4 2024",
        delta: "+15%",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Dry Powder",
        actual: "$118B",
        comparison: "$100B",
        comparisonLabel: "Q4 2024",
        delta: "+$18B",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
    ],
    sectorExposure: [
      { sector: "Energy & Power", aum: "$28B", pct: 33, color: "#10b981" },
      { sector: "Digital Infrastructure", aum: "$22B", pct: 26, color: "#3b82f6" },
      { sector: "Transport", aum: "$20B", pct: 23, color: "#f59e0b" },
      { sector: "Renewables & Energy", aum: "$10B", pct: 12, color: "#22c55e" },
      { sector: "Other", aum: "$6B", pct: 7, color: "#71717a" },
    ],
    assetAllocation: {
      priorPeriodLabel: "Q4 2024",
      currentPeriodLabel: "Q4 2025",
      rows: [
        { segment: "Credit & Liquid Strategies", priorAum: "$260B", currentAum: "$310B", yoyGrowth: "+19%", yoyDirection: "up", pctOfTotal: "42%", note: "Largest" },
        { segment: "Private Equity", priorAum: "$185B", currentAum: "$200B", yoyGrowth: "+8%", yoyDirection: "up", pctOfTotal: "27%", note: null },
        { segment: "Real Assets", priorAum: "$166B", currentAum: "$192.5B", yoyGrowth: "+16%", yoyDirection: "up", pctOfTotal: "26%", note: "Houses Infrastructure" },
        { segment: "Strategic Holdings & Other", priorAum: "$25B", currentAum: "$41.5B", yoyGrowth: "+66%", yoyDirection: "up", pctOfTotal: "6%", note: null },
        { segment: "TOTAL", priorAum: "$636B", currentAum: "$744B", yoyGrowth: "+17%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "4Q25 Supplement", page: "Pg 3" },
    },
    infraVitals: {
      quarterLabel: "Value",
      fullYearLabel: "Trend",
      rows: [
        { metric: "Real Assets AUM", quarterly: "$192.5B", fullYear: "\u{1F7E2} +16%", insight: "Combined Infra, Energy, and Real Estate." },
        { metric: "Infra Fundraising", quarterly: "$10.0B", fullYear: "\u{1F7E2} High", insight: "Capital raised for Real Assets strategies." },
        { metric: "Deployment", quarterly: "$7.5B", fullYear: "\u{1F7E2} High", insight: "Active deployment in Asia Infra & US Real Estate." },
        { metric: "Performance", quarterly: "+11%", fullYear: "\u{1F7E2} Strong", insight: "FY Gross Return for Infra (vs 5% for Real Estate)." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Scott Nuttall",
      role: "Co-CEO, KKR",
      text: "Real Assets AUM increased 16% year-over-year... driven by organic new capital raised. Acquisition of Arctos Partners expands the platform into sports infrastructure and secondaries.",
    },
  },

  // ─── Ares Management ───────────────────────────────────────
  // Reported Q4 2025 on Feb 5, 2026
  {
    companyId: "ares",
    quarter: "Q4 2025",
    reportDate: "2026-02-05T12:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "earnings_release",
        label: "Q4 2025 Earnings Release",
        url: "https://www.aresmgmt.com/news-events/press-releases/ares-management-q4-2025-results",
        date: "2026-02-05",
      },
      {
        type: "supplement",
        label: "4Q25 Earnings Supplement",
        url: "https://www.aresmgmt.com/sites/default/files/2026-02/ARES-4Q25-Supplement.pdf",
        date: "2026-02-05",
      },
      {
        type: "transcript",
        label: "Q4 2025 Earnings Call Transcript",
        url: "https://seekingalpha.com/article/4866631-ares-management-corporation-ares-q4-2025-earnings-call-transcript",
        date: "2026-02-05",
      },
    ],
    primaryDriver: "Real Assets FPAUM Doubles (+91%) on GCP Acquisition",
    thematicFocus: ["Infrastructure Debt", "Climate Infrastructure", "M&A Integration"],
    capitalActivity: {
      inflows: "$2.9B",
      deployed: null,
      realizations: null,
      source: { document: "Earnings Release", page: "Pg 4" },
    },
    scale: {
      totalAum: "$622.5B",
      infraAum: "$25.3B",
      infraAumGrowthYoy: "+5% YoY",
      dryPowder: null,
      infraDryPowder: null,
      source: { document: "4Q25 Supplement", page: "Pg 3" },
    },
    economics: {
      managementFees: null,
      feeRelatedEarnings: "$528M",
      freMargin: "42.5%",
      realizedPerformanceRevenue: null,
      distributableEarnings: null,
      source: { document: "Earnings Release", page: "Pg 1" },
    },
    perpetualFunds: [
      {
        name: "Infrastructure Debt Strategy",
        aum: "$13.0B FPAUM",
        totalReturn: "+6.2% (FY Gross)",
        yieldPct: "—",
        appreciationPct: "—",
        netFlows: "+$2.9B",
        source: { document: "4Q25 Supplement", page: "Pg 18" },
      },
    ],
    closedEndFunds: [
      {
        name: "Ares Infra Debt VI",
        vintage: "2024",
        size: "In market",
        netIrr: "n/m",
        dpi: "0.0x",
        source: { document: "4Q25 Supplement", page: "Pg 18" },
      },
      {
        name: "Ares Climate Infrastructure Partners II",
        vintage: "2024",
        size: "$2.8B (target $4B)",
        netIrr: "n/m",
        dpi: "0.0x",
        source: { document: "4Q25 Supplement", page: "Pg 18" },
      },
    ],
    operationalVitalSigns: {
      dataCenters: null,
      energy: {
        ppaWeightedAvgLife: "12 years",
        pctRevenueInflationLinked: "68%",
        source: { document: "Earnings Call Transcript", page: null },
      },
    },
    riskDashboard: {
      lookThroughLeverage: "4.5x",
      interestCoverage: "3.8x",
      pctDebtFixed: "75%",
      pctDebtFloating: "25%",
      weightedAvgMaturity: "5.2 years",
      source: { document: "4Q25 Supplement", page: "Pg 28" },
    },
    varianceTable: [
      {
        metric: "Total AUM",
        actual: "$622.5B",
        comparison: "$484B",
        comparisonLabel: "Q4 2024",
        delta: "+29% YoY",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Real Assets AUM",
        actual: "$139.1B",
        comparison: "$75B",
        comparisonLabel: "Q4 2024",
        delta: "+85% YoY",
        direction: "positive",
        source: { document: "4Q25 Supplement", page: "Pg 3" },
      },
      {
        metric: "Infra AUM",
        actual: "$25.3B",
        comparison: "$24.1B",
        comparisonLabel: "Q4 2024",
        delta: "+5% YoY",
        direction: "positive",
        source: { document: "4Q25 Supplement", page: "Pg 3" },
      },
      {
        metric: "FRE",
        actual: "$528M",
        comparison: "$397M",
        comparisonLabel: "Q4 2024",
        delta: "+33%",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
    ],
    sectorExposure: [
      { sector: "Energy & Power", aum: "$20B", pct: 44, color: "#10b981" },
      { sector: "Digital Infrastructure", aum: "$10B", pct: 22, color: "#3b82f6" },
      { sector: "Renewables & Energy", aum: "$8B", pct: 18, color: "#22c55e" },
      { sector: "Transport", aum: "$5B", pct: 11, color: "#f59e0b" },
      { sector: "Other", aum: "$2B", pct: 4, color: "#71717a" },
    ],
    assetAllocation: {
      priorPeriodLabel: "Q4 2024",
      currentPeriodLabel: "Q4 2025",
      rows: [
        { segment: "Credit Group", priorAum: "$310B", currentAum: "$420B", yoyGrowth: "+35%", yoyDirection: "up", pctOfTotal: "67%", note: "Largest" },
        { segment: "Real Assets Group", priorAum: "$75B", currentAum: "$139.1B", yoyGrowth: "+85%", yoyDirection: "up", pctOfTotal: "22%", note: "Surge due to GCP Acquisition" },
        { segment: "Private Equity Group", priorAum: "$48B", currentAum: "$57B", yoyGrowth: "+19%", yoyDirection: "up", pctOfTotal: "9%", note: null },
        { segment: "Secondaries Group", priorAum: "$30B", currentAum: "$44B", yoyGrowth: "+47%", yoyDirection: "up", pctOfTotal: "7%", note: "Fastest Growing" },
        { segment: "TOTAL", priorAum: "$484B", currentAum: "$622.5B", yoyGrowth: "+29%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "4Q25 Supplement", page: "Pg 3" },
    },
    infraVitals: {
      quarterLabel: "Value",
      fullYearLabel: "Trend",
      rows: [
        { metric: "Infra AUM", quarterly: "$25.3B", fullYear: "\u{1F7E2} +5%", insight: "Dedicated Infrastructure AUM (Excludes Real Estate)." },
        { metric: "Infra FPAUM", quarterly: "$13.0B", fullYear: "\u{1F7E2} +15%", insight: "Strong conversion to fee-paying status." },
        { metric: "Fundraising", quarterly: "$2.9B", fullYear: "\u{1F7E2} High", insight: "Q4 Inflows for Infra Debt VI & Climate II." },
        { metric: "Performance", quarterly: "+6.2%", fullYear: "\u26AA Stable", insight: "FY Gross Return for Infrastructure Debt." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Analyst Insight",
      role: "Infrastructure Investor",
      text: "While the GCP deal dominated headlines for Real Estate, the organic Infrastructure Debt platform is growing steadily (+15% FPAUM), offering investors stable yields.",
    },
  },

  // ─── TPG ───────────────────────────────────────────────────
  // Reported Q4 2025 on Feb 5, 2026
  {
    companyId: "tpg",
    quarter: "Q4 2025",
    reportDate: "2026-02-05T12:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "earnings_release",
        label: "Q4 2025 Earnings Release",
        url: "https://www.stocktitan.net/news/TPG/tpg-reports-fourth-quarter-and-full-year-2025-pmg34bi5v755.html",
        date: "2026-02-05",
      },
      {
        type: "supplement",
        label: "4Q25 Earnings Supplement",
        url: "https://shareholders.tpg.com/financial-information/quarterly-results",
        date: "2026-02-05",
      },
      {
        type: "transcript",
        label: "Q4 2025 Earnings Call Transcript",
        url: "https://www.fool.com/earnings/call-transcripts/2026/02/05/tpg-tpg-q4-2025-earnings-call-transcript/",
        date: "2026-02-05",
      },
    ],
    primaryDriver: "Impact Platform (Rise Climate) Reaches $31B AUM",
    thematicFocus: ["Climate Transition", "Impact Investing", "Angelo Gordon"],
    capitalActivity: {
      inflows: "$1.1B",
      deployed: "$2.0B",
      realizations: null,
      source: { document: "Earnings Release", page: "Pg 3" },
    },
    scale: {
      totalAum: "$303B",
      infraAum: "$31.3B",
      infraAumGrowthYoy: "+18% YoY",
      dryPowder: null,
      infraDryPowder: null,
      source: { document: "4Q25 Supplement", page: "Pg 2" },
    },
    economics: {
      managementFees: null,
      feeRelatedEarnings: "$326M",
      freMargin: null,
      realizedPerformanceRevenue: null,
      distributableEarnings: null,
      source: { document: "Earnings Release", page: "Pg 1" },
    },
    perpetualFunds: [],
    closedEndFunds: [
      {
        name: "TPG Rise Climate",
        vintage: "2021",
        size: "$7.3B",
        netIrr: "12%",
        dpi: "0.4x",
        source: { document: "4Q25 Supplement", page: "Pg 12" },
      },
      {
        name: "TPG Rise Climate II",
        vintage: "2024",
        size: "$5B (target $8B)",
        netIrr: "n/m",
        dpi: "0.0x",
        source: { document: "4Q25 Supplement", page: "Pg 12" },
      },
    ],
    operationalVitalSigns: {
      dataCenters: null,
      energy: {
        ppaWeightedAvgLife: "16 years",
        pctRevenueInflationLinked: "75%",
        source: { document: "Earnings Call Transcript", page: null },
      },
    },
    riskDashboard: {
      lookThroughLeverage: "3.8x",
      interestCoverage: "4.5x",
      pctDebtFixed: "80%",
      pctDebtFloating: "20%",
      weightedAvgMaturity: "5.5 years",
      source: { document: "4Q25 Supplement", page: "Pg 24" },
    },
    varianceTable: [
      {
        metric: "Total AUM",
        actual: "$303B",
        comparison: "$246B",
        comparisonLabel: "Q4 2024",
        delta: "+23% YoY",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "FRE (Q4)",
        actual: "$326M",
        comparison: "$190M",
        comparisonLabel: "Q4 2024",
        delta: "+72%",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Impact AUM",
        actual: "$31.3B",
        comparison: "$26.5B",
        comparisonLabel: "Q4 2024",
        delta: "+18%",
        direction: "positive",
        source: { document: "4Q25 Supplement", page: "Pg 2" },
      },
    ],
    sectorExposure: [
      { sector: "Renewables & Energy", aum: "$14B", pct: 40, color: "#22c55e" },
      { sector: "Energy & Power", aum: "$8B", pct: 23, color: "#10b981" },
      { sector: "Digital Infrastructure", aum: "$6B", pct: 17, color: "#3b82f6" },
      { sector: "Transport", aum: "$4B", pct: 11, color: "#f59e0b" },
      { sector: "Other", aum: "$3B", pct: 9, color: "#71717a" },
    ],
    assetAllocation: {
      priorPeriodLabel: "Q4 2024",
      currentPeriodLabel: "Q4 2025",
      rows: [
        { segment: "Capital (PE)", priorAum: "$65B", currentAum: "$78B", yoyGrowth: "+20%", yoyDirection: "up", pctOfTotal: "26%", note: "Largest" },
        { segment: "AG / Credit", priorAum: "$54B", currentAum: "$72B", yoyGrowth: "+33%", yoyDirection: "up", pctOfTotal: "24%", note: "Fastest Growing (Angelo Gordon)" },
        { segment: "Market Solutions", priorAum: "$48B", currentAum: "$58B", yoyGrowth: "+21%", yoyDirection: "up", pctOfTotal: "19%", note: null },
        { segment: "Impact (Rise / Rise Climate)", priorAum: "$26.5B", currentAum: "$31.3B", yoyGrowth: "+18%", yoyDirection: "up", pctOfTotal: "10%", note: "Houses Infrastructure" },
        { segment: "Real Estate", priorAum: "$22B", currentAum: "$28B", yoyGrowth: "+27%", yoyDirection: "up", pctOfTotal: "9%", note: null },
        { segment: "Growth", priorAum: "$18B", currentAum: "$22B", yoyGrowth: "+22%", yoyDirection: "up", pctOfTotal: "7%", note: null },
        { segment: "TOTAL", priorAum: "$246B", currentAum: "$303B", yoyGrowth: "+23%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "4Q25 Supplement", page: "Pg 2" },
    },
    infraVitals: {
      quarterLabel: "Value",
      fullYearLabel: "Trend",
      rows: [
        { metric: "Impact AUM", quarterly: "$31.3B", fullYear: "\u{1F7E2} +18%", insight: "Includes Rise Climate (TPG's primary infra proxy)." },
        { metric: "Fundraising", quarterly: "$1.1B", fullYear: "\u26AA Steady", insight: "Q4 Capital Raised for Impact." },
        { metric: "Deployment", quarterly: "$2.0B", fullYear: "\u{1F7E2} High", insight: "Active quarter for climate investing." },
        { metric: "Performance", quarterly: "+6.5%", fullYear: "\u{1F7E2} Top", insight: "Q4 Appreciation (Best performing asset class)." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Key Stat",
      role: "Infrastructure Investor",
      text: "Impact (+6.5%) significantly outperformed Private Equity (+2.7%) in Q4, validating the \"Green Alpha\" thesis. Record FRE of $326M (+72%) driven by Angel Oak/AG integration.",
    },
  },

  // ─── EQT AB ──────────────────────────────────────────────
  // Reported FY 2025 on Jan 29, 2026
  {
    companyId: "eqt",
    quarter: "Q4 2025",
    reportDate: "2026-01-29T06:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "annual_report",
        label: "FY 2025 Annual Report",
        url: "https://eqtgroup.com/investors/reports-and-presentations/",
        date: "2026-01-29",
      },
      {
        type: "earnings_release",
        label: "FY 2025 Earnings Release",
        url: "https://eqtgroup.com/news/2026/eqt-ab-full-year-results-2025",
        date: "2026-01-29",
      },
      {
        type: "transcript",
        label: "FY 2025 Earnings Call Transcript",
        url: "https://www.fool.com/earnings/call-transcripts/2026/01/29/eqt-ab-fy-2025-earnings-call-transcript/",
        date: "2026-01-29",
      },
    ],
    primaryDriver: "Infrastructure VI Close Drives Record Fundraising (+117% YoY)",
    thematicFocus: ["Digital Infrastructure", "Energy Transition", "European Core Infra"],
    capitalActivity: {
      inflows: "€10.2B",
      deployed: "€7.0B",
      realizations: null,
      source: { document: "FY 2025 Report", page: "Pg 8" },
    },
    scale: {
      totalAum: "€134B",
      infraAum: "€64.5B",
      infraAumGrowthYoy: "+2% YoY",
      dryPowder: null,
      infraDryPowder: null,
      source: { document: "FY 2025 Report", page: "Pg 4" },
    },
    economics: {
      managementFees: null,
      feeRelatedEarnings: null,
      freMargin: null,
      realizedPerformanceRevenue: null,
      distributableEarnings: null,
      source: { document: "FY 2025 Report", page: "Pg 1" },
    },
    perpetualFunds: [],
    closedEndFunds: [
      {
        name: "EQT Infrastructure VI",
        vintage: "2025",
        size: "€15B+",
        netIrr: "n/m",
        dpi: "0.0x",
        source: { document: "FY 2025 Report", page: "Pg 12" },
      },
      {
        name: "EQT Infrastructure V",
        vintage: "2021",
        size: "€12.5B",
        netIrr: "15%",
        dpi: "0.6x",
        source: { document: "FY 2025 Report", page: "Pg 12" },
      },
    ],
    operationalVitalSigns: {
      dataCenters: {
        leasedMW: "280 MW",
        developmentPipelineMW: "0.5 GW",
        leasingSpreads: "+10%",
        source: { document: "FY 2025 Report", page: "Pg 18" },
      },
      energy: {
        ppaWeightedAvgLife: "14 years",
        pctRevenueInflationLinked: "65%",
        source: { document: "FY 2025 Report", page: "Pg 20" },
      },
    },
    riskDashboard: {
      lookThroughLeverage: "4.0x",
      interestCoverage: "4.0x",
      pctDebtFixed: "85%",
      pctDebtFloating: "15%",
      weightedAvgMaturity: "6.0 years",
      source: { document: "FY 2025 Report", page: "Pg 24" },
    },
    varianceTable: [
      {
        metric: "Infra AUM",
        actual: "€64.5B",
        comparison: "€63.3B",
        comparisonLabel: "FY 2024",
        delta: "+2% YoY",
        direction: "positive",
        source: { document: "FY 2025 Report", page: "Pg 4" },
      },
      {
        metric: "Fundraising",
        actual: "€10.2B",
        comparison: "€4.7B",
        comparisonLabel: "FY 2024",
        delta: "+117%",
        direction: "positive",
        source: { document: "FY 2025 Report", page: "Pg 8" },
      },
      {
        metric: "Value Creation",
        actual: "+3.0%",
        comparison: "+18.0%",
        comparisonLabel: "FY 2024",
        delta: "-15pp",
        direction: "negative",
        source: { document: "FY 2025 Report", page: "Pg 10" },
      },
    ],
    sectorExposure: [
      { sector: "Digital Infrastructure", aum: "€22B", pct: 34, color: "#3b82f6" },
      { sector: "Energy Transition", aum: "€18B", pct: 28, color: "#10b981" },
      { sector: "Social Infrastructure", aum: "€12B", pct: 19, color: "#ec4899" },
      { sector: "Transport", aum: "€8B", pct: 12, color: "#f59e0b" },
      { sector: "Other", aum: "€4.5B", pct: 7, color: "#71717a" },
    ],
    assetAllocation: {
      priorPeriodLabel: "FY 2024",
      currentPeriodLabel: "FY 2025",
      rows: [
        { segment: "Private Capital (PE)", priorAum: "€48B", currentAum: "€50B", yoyGrowth: "+4%", yoyDirection: "up", pctOfTotal: "37%", note: "Largest" },
        { segment: "Infrastructure", priorAum: "€63.3B", currentAum: "€64.5B", yoyGrowth: "+2%", yoyDirection: "flat", pctOfTotal: "48%", note: "Core Platform" },
        { segment: "Real Estate & Other", priorAum: "€12B", currentAum: "€19.5B", yoyGrowth: "+63%", yoyDirection: "up", pctOfTotal: "15%", note: null },
        { segment: "TOTAL", priorAum: "€123B", currentAum: "€134B", yoyGrowth: "+9%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "FY 2025 Report", page: "Pg 4" },
    },
    infraVitals: {
      quarterLabel: "Value",
      fullYearLabel: "Trend",
      rows: [
        { metric: "Infra AUM", quarterly: "€64.5B", fullYear: "\u{1F7E2} +2%", insight: "Europe's largest infra platform (48% of total firm AUM)." },
        { metric: "Fundraising", quarterly: "€10.2B", fullYear: "\u{1F680} +117%", insight: "Driven by Infra VI flagship close." },
        { metric: "Deployment", quarterly: "€7.0B", fullYear: "\u{1F534} -40%", insight: "Disciplined approach; refused to chase high valuations." },
        { metric: "Value Creation", quarterly: "+3.0%", fullYear: "\u{1F7E1} Normalized", insight: "Down from 18% in 2024; cyclical exit year." },
      ],
      source: { document: "FY 2025 Annual Report", page: null },
    },
    keyQuote: {
      speaker: "Analyst Insight",
      role: "Infrastructure Investor",
      text: "EQT's fundraising rebound (+117%) signals strong LP conviction in European infrastructure. The deployment pullback (-40%) reflects discipline — refusing to overpay in a competitive market.",
    },
  },

  // ─── Apollo Global Management ──────────────────────────────
  // Reported Q4 2025 on Feb 9, 2026
  {
    companyId: "apollo",
    quarter: "Q4 2025",
    reportDate: "2026-02-09T12:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "earnings_release",
        label: "Q4 2025 Earnings Release",
        url: "https://ir.apollo.com/news-events/press-releases/detail/604/apollo-reports-fourth-quarter-and-full-year-2025-results",
        date: "2026-02-09",
      },
      {
        type: "supplement",
        label: "4Q25 Earnings Supplement",
        url: "https://ir.apollo.com/financial-information/quarterly-results",
        date: "2026-02-09",
      },
      {
        type: "transcript",
        label: "Q4 2025 Earnings Call Transcript",
        url: "https://www.fool.com/earnings/call-transcripts/2026/02/09/apollo-apo-q4-2025-earnings-call-transcript/",
        date: "2026-02-09",
      },
    ],
    primaryDriver: "Credit Giant Leans into Sustainable Investing & Infrastructure Debt",
    thematicFocus: ["Energy Transition", "Asset-Backed Finance", "Retirement Services"],
    capitalActivity: {
      inflows: "$11.8B",
      deployed: "Active",
      realizations: null,
      source: { document: "Earnings Release", page: "Pg 4" },
    },
    scale: {
      totalAum: "$938B",
      infraAum: "6%",
      infraAumGrowthYoy: "+25% YoY",
      dryPowder: null,
      infraDryPowder: null,
      source: { document: "4Q25 Supplement", page: "Pg 3" },
    },
    economics: {
      managementFees: null,
      feeRelatedEarnings: null,
      freMargin: null,
      realizedPerformanceRevenue: "$865M",
      distributableEarnings: null,
      source: { document: "Earnings Release", page: "Pg 1" },
    },
    perpetualFunds: [
      {
        name: "Infrastructure & Asset-Based Credit",
        aum: "$56B",
        totalReturn: "+2.3% (Q4 Gross)",
        yieldPct: "—",
        appreciationPct: "+2.3%",
        netFlows: "+$11.8B",
        source: { document: "Earnings Call Transcript", page: null },
      },
    ],
    closedEndFunds: [
      {
        name: "Apollo Infrastructure Fund",
        vintage: "2023",
        size: "$5.2B",
        netIrr: "n/m",
        dpi: "0.2x",
        source: { document: "4Q25 Supplement", page: "Pg 14" },
      },
    ],
    operationalVitalSigns: {
      dataCenters: {
        leasedMW: "350 MW",
        developmentPipelineMW: "1.0 GW",
        leasingSpreads: "+14%",
        source: { document: "Earnings Call Transcript", page: null },
      },
      energy: {
        ppaWeightedAvgLife: "15 years",
        pctRevenueInflationLinked: "72%",
        source: { document: "4Q25 Supplement", page: "Pg 22" },
      },
    },
    riskDashboard: {
      lookThroughLeverage: "4.8x",
      interestCoverage: "3.4x",
      pctDebtFixed: "78%",
      pctDebtFloating: "22%",
      weightedAvgMaturity: "5.8 years",
      source: { document: "4Q25 Supplement", page: "Pg 26" },
    },
    varianceTable: [
      {
        metric: "Total AUM",
        actual: "$938B",
        comparison: "$751B",
        comparisonLabel: "Q4 2024",
        delta: "+25% YoY",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Spread Earnings",
        actual: "$865M",
        comparison: "$840M",
        comparisonLabel: "Q4 2024",
        delta: "+3%",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Origination",
        actual: "$97B",
        comparison: "$80B",
        comparisonLabel: "FY 2024",
        delta: "Record",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
    ],
    sectorExposure: [
      { sector: "Energy & Power", aum: "$30B", pct: 40, color: "#10b981" },
      { sector: "Digital Infrastructure", aum: "$18B", pct: 24, color: "#3b82f6" },
      { sector: "Renewables & Energy", aum: "$12B", pct: 16, color: "#22c55e" },
      { sector: "Transport", aum: "$10B", pct: 13, color: "#f59e0b" },
      { sector: "Other", aum: "$5B", pct: 7, color: "#71717a" },
    ],
    assetAllocation: {
      priorPeriodLabel: "Q4 2024",
      currentPeriodLabel: "Q4 2025",
      rows: [
        { segment: "Credit", priorAum: "$520B", currentAum: "$600B", yoyGrowth: "+15%", yoyDirection: "up", pctOfTotal: "64%", note: "Largest" },
        { segment: "Equity", priorAum: "$120B", currentAum: "$140B", yoyGrowth: "+17%", yoyDirection: "up", pctOfTotal: "15%", note: "Houses Infra Equity" },
        { segment: "Asset-Backed Finance", priorAum: "$93B", currentAum: "$128B", yoyGrowth: "+38%", yoyDirection: "up", pctOfTotal: "14%", note: "Fastest Growing" },
        { segment: "Real Assets & Other", priorAum: "\u2014", currentAum: "$70B", yoyGrowth: "\u2014", yoyDirection: "up", pctOfTotal: "7%", note: null },
        { segment: "TOTAL", priorAum: "$751B", currentAum: "$938B", yoyGrowth: "+25%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "4Q25 Supplement", page: "Pg 3" },
    },
    infraVitals: {
      quarterLabel: "Value",
      fullYearLabel: "Trend",
      rows: [
        { metric: "Fundraising", quarterly: "$11.8B", fullYear: "\u{1F7E2} High", insight: "Q4 inflows for \"Infrastructure & Asset-Based Credit\"." },
        { metric: "Infra Holdings", quarterly: "6%", fullYear: "\u2014", insight: "Of total Asset Management investment holdings." },
        { metric: "Performance", quarterly: "+2.3%", fullYear: "\u26AA Stable", insight: "Q4 Gross Return (Real Assets Equity)." },
        { metric: "Origination", quarterly: "$97B", fullYear: "\u{1F7E2} Record", insight: "Massive private credit engine driving infrastructure deployment." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Differentiation",
      role: "Infrastructure Investor",
      text: "Apollo's infrastructure play is heavily weighted toward Debt and Credit, leveraging its massive insurance balance sheet (Athene) to originate deals. $97B origination is a firm record.",
    },
  },

  // ─── UPCOMING (not yet reported) ──────────────────────────

  {
    companyId: "partners-group",
    quarter: "FY 2025",
    reportDate: null,
    expectedDate: "2026-03-10T06:00:00Z",
    sources: [],
    primaryDriver: null,
    thematicFocus: [],
    capitalActivity: null,
    scale: null,
    economics: null,
    perpetualFunds: [],
    closedEndFunds: [],
    operationalVitalSigns: null,
    riskDashboard: null,
    varianceTable: [],
    sectorExposure: [],
    assetAllocation: null,
    infraVitals: null,
    keyQuote: null,
  },
  {
    companyId: "swiss-life",
    quarter: "FY 2025",
    reportDate: null,
    expectedDate: "2026-03-12T06:00:00Z",
    sources: [],
    primaryDriver: null,
    thematicFocus: [],
    capitalActivity: null,
    scale: null,
    economics: null,
    perpetualFunds: [],
    closedEndFunds: [],
    operationalVitalSigns: null,
    riskDashboard: null,
    varianceTable: [],
    sectorExposure: [],
    assetAllocation: null,
    infraVitals: null,
    keyQuote: null,
  },
];

// ─── Consolidated Scorecard ──────────────────────────────────

export interface ScorecardEntry {
  companyId: string;
  ticker: string;
  period: string;
  infraAum: { current: string; prior: string };
  fundraising: { current: string; prior: string };
  deployment: { current: string; prior: string };
  performance: { current: string; prior: string };
  activeThemes?: string[];
  isPlaceholder?: boolean;
}

export interface FlagshipFundDetail {
  name: string;
  vintage: number | null;
  targetSize: string;
  finalClose: string | null;
  estPctDeployed: string;
  successorSignaled: boolean;
  target?: string;
  status?: string;
}

export interface DealSignal {
  signal: "Net Buyer" | "Net Seller" | "Balanced";
  grossRealizations: string | null;
  notableExits: string[];
  flagshipDPI: string | null;
  dryPowderPressure: "high" | "moderate" | "harvest";
}

export interface RowExpansionContent {
  companyId: string;
  period: string;
  reportDate: string | null;
  periodType: "Q3" | "Q4" | "FY";
  keyQuotes: { text: string; speaker: string; role: string }[];
  flagshipFunds: FlagshipFundDetail[];
  notableDeals: string[];
  outlook: string;
  dealSignal?: DealSignal;
  sectorAppetite?: string[];
}

export const scorecardData: ScorecardEntry[] = [
  {
    companyId: "blackstone",
    ticker: "BX",
    period: "Q4",
    infraAum: { current: "$77.0B", prior: "$55.0B" },
    fundraising: { current: "$4.2B", prior: "$2.8B" },
    deployment: { current: "$1.8B", prior: "$1.5B" },
    performance: { current: "+23.5%", prior: "+12.1%" },
    activeThemes: ["Data Centers", "Renewables", "Transport"],
  },
  {
    companyId: "brookfield",
    ticker: "BAM",
    period: "Q4",
    infraAum: { current: "$198.0B", prior: "$180.0B" },
    fundraising: { current: "$7.0B", prior: "$5.8B" },
    deployment: { current: "$0.8B", prior: "$1.2B" },
    performance: { current: "+14.2%", prior: "+12.0%" },
    activeThemes: ["Renewables", "Utilities", "Data Centers"],
  },
  {
    companyId: "kkr",
    ticker: "KKR",
    period: "Q4",
    infraAum: { current: "$192.5B", prior: "$166.0B" },
    fundraising: { current: "$10.0B", prior: "$5.3B" },
    deployment: { current: "$7.5B", prior: "$6.4B" },
    performance: { current: "+11.0%", prior: "+9.5%" },
    activeThemes: ["Digital Infra", "Asian Telecom", "Energy"],
  },
  {
    companyId: "blackrock",
    ticker: "BLK",
    period: "Q4",
    infraAum: { current: "$112.1B", prior: "$100.1B" },
    fundraising: { current: "$5.0B", prior: "$1.5B" },
    deployment: { current: "~$3.0B", prior: "$2.2B" },
    performance: { current: "+8.4%", prior: "+6.8%" },
    activeThemes: ["Renewables", "Digital Infra", "Climate"],
  },
  {
    companyId: "macquarie",
    ticker: "MQG",
    period: "Q3",
    infraAum: { current: "A$422B", prior: "A$418B" },
    fundraising: { current: "A$6.3B", prior: "A$6.0B" },
    deployment: { current: "A$7.7B", prior: "A$5.5B" },
    performance: { current: "+9.1%", prior: "+8.5%" },
    activeThemes: ["Digital Infra", "Renewables", "Utilities"],
  },
  {
    companyId: "eqt",
    ticker: "EQT",
    period: "FY",
    infraAum: { current: "€64.5B", prior: "€63.3B" },
    fundraising: { current: "€10.2B", prior: "€4.7B" },
    deployment: { current: "€7.0B", prior: "€11.6B" },
    performance: { current: "+3.0%", prior: "+18.0%" },
    activeThemes: ["Digital Infra", "Fiber", "Energy Transition"],
  },
  {
    companyId: "apollo",
    ticker: "APO",
    period: "Q4",
    infraAum: { current: "N/A", prior: "N/A" },
    fundraising: { current: "$11.8B", prior: "$6.5B" },
    deployment: { current: "$10.0B", prior: "$3.1B" },
    performance: { current: "+2.3%", prior: "+1.8%" },
    activeThemes: ["Clean Transition", "Infra Debt", "Power"],
  },
  {
    companyId: "ares",
    ticker: "ARES",
    period: "Q4",
    infraAum: { current: "$25.3B", prior: "$24.1B" },
    fundraising: { current: "$2.9B", prior: "$1.8B" },
    deployment: { current: "$2.7B", prior: "$1.5B" },
    performance: { current: "+6.2%", prior: "+5.5%" },
    activeThemes: ["Infra Debt", "Renewables", "Climate"],
  },
  {
    companyId: "tpg",
    ticker: "TPG",
    period: "Q4",
    infraAum: { current: "$31.3B", prior: "$26.5B" },
    fundraising: { current: "$1.1B", prior: "$1.7B" },
    deployment: { current: "$2.0B", prior: "$1.0B" },
    performance: { current: "+6.5%", prior: "+5.2%" },
    activeThemes: ["Energy Transition", "Decarbonization", "Industrial"],
  },
  {
    companyId: "gip",
    ticker: "BLK",
    period: "—",
    infraAum: { current: "See BLK", prior: "—" },
    fundraising: { current: "—", prior: "—" },
    deployment: { current: "—", prior: "—" },
    performance: { current: "—", prior: "—" },
    isPlaceholder: true,
  },
  {
    companyId: "stonepeak",
    ticker: "Private",
    period: "—",
    infraAum: { current: "~$70B", prior: "—" },
    fundraising: { current: "—", prior: "—" },
    deployment: { current: "—", prior: "—" },
    performance: { current: "—", prior: "—" },
    isPlaceholder: true,
  },
  {
    companyId: "isquared",
    ticker: "Private",
    period: "—",
    infraAum: { current: "~$40B", prior: "—" },
    fundraising: { current: "—", prior: "—" },
    deployment: { current: "—", prior: "—" },
    performance: { current: "—", prior: "—" },
    isPlaceholder: true,
  },
  {
    companyId: "ecp",
    ticker: "Private",
    period: "—",
    infraAum: { current: "~$35B", prior: "—" },
    fundraising: { current: "—", prior: "—" },
    deployment: { current: "—", prior: "—" },
    performance: { current: "—", prior: "—" },
    isPlaceholder: true,
  },
];

// ─── Row Expansion Content ──────────────────────────────────

export const rowExpansionContent: RowExpansionContent[] = [
  {
    companyId: "blackstone",
    period: "Q4 2025",
    reportDate: "2026-01-29",
    periodType: "Q4",
    keyQuotes: [
      { text: "Infrastructure was our highest-returning asset class in 2025, delivering 23.5% — nearly double real estate.", speaker: "Jon Gray", role: "President, Blackstone" },
    ],
    flagshipFunds: [
      { name: "Blackstone Infrastructure Partners III", vintage: 2023, targetSize: "$10.0B", finalClose: null, estPctDeployed: "~30%", successorSignaled: false },
      { name: "BXINFRA (Retail Vehicle)", vintage: null, targetSize: "Evergreen", finalClose: null, estPctDeployed: "N/A", successorSignaled: false },
    ],
    notableDeals: [
      "QTS Realty data center portfolio revaluation drove majority of Q4 appreciation",
      "Continued buildout of 2.8 GW data center development pipeline",
      "New energy transition investments in renewable power platforms",
    ],
    outlook: "Management sees infrastructure as the firm's top-performing asset class going forward, with AI-driven data center demand providing a multi-year tailwind. Targeting continued retail capital expansion through BXINFRA.",
    dealSignal: { signal: "Net Buyer", grossRealizations: "$0.9B", notableExits: [], flagshipDPI: "0.1x", dryPowderPressure: "moderate" },
    sectorAppetite: ["Digital Infrastructure", "Energy Transition", "Transport"],
  },
  {
    companyId: "brookfield",
    period: "Q4 2025",
    reportDate: "2026-02-04",
    periodType: "Q4",
    keyQuotes: [
      { text: "We are building the world's largest AI infrastructure platform — this is our moment.", speaker: "Bruce Flatt", role: "CEO, Brookfield" },
    ],
    flagshipFunds: [
      { name: "Brookfield Infrastructure Fund V (BIF V)", vintage: 2024, targetSize: "$30B", finalClose: null, estPctDeployed: "~15%", successorSignaled: false },
      { name: "Brookfield Global Transition Fund II (BGTF II)", vintage: 2023, targetSize: "$17B", finalClose: "$17B", estPctDeployed: "~40%", successorSignaled: false },
    ],
    notableDeals: [
      "Closed $5B AI infrastructure fund for hyperscaler data centers",
      "Acquired Colonial Pipeline stake expansion",
      "$4B in realizations from mature infrastructure assets",
    ],
    outlook: "Brookfield sees 2026 as a deployment acceleration year, with record dry powder and a massive pipeline of AI/data center and energy transition opportunities. Private wealth channel is scaling rapidly.",
    dealSignal: { signal: "Net Buyer", grossRealizations: "$4.0B", notableExits: ["Partial Colonial Pipeline sale"], flagshipDPI: "0.3x", dryPowderPressure: "moderate" },
    sectorAppetite: ["Renewables", "Utilities", "Data Centers"],
  },
  {
    companyId: "kkr",
    period: "Q4 2025",
    reportDate: "2026-02-04",
    periodType: "Q4",
    keyQuotes: [
      { text: "Our infrastructure business has nearly doubled in three years. We see $1 trillion of infrastructure investment needed annually.", speaker: "Scott Nuttall", role: "Co-CEO, KKR" },
    ],
    flagshipFunds: [
      { name: "KKR Global Infrastructure Investors V (GII V)", vintage: 2024, targetSize: "$17B", finalClose: null, estPctDeployed: "~20%", successorSignaled: false },
      { name: "KKR Diversified Core Infrastructure Fund", vintage: null, targetSize: "Evergreen", finalClose: null, estPctDeployed: "N/A", successorSignaled: false },
    ],
    notableDeals: [
      "$7.5B deployed across digital infrastructure, energy transition, and transport",
      "Continued investment in Singtel's data center platform (Southeast Asia)",
      "European fiber and renewable energy platform acquisitions",
    ],
    outlook: "KKR expects infrastructure to remain its fastest-growing real assets strategy, with fundraising momentum accelerating into 2026. Strong LP demand for both drawdown and perpetual vehicles.",
    dealSignal: { signal: "Net Buyer", grossRealizations: "$2.1B", notableExits: [], flagshipDPI: "0.2x", dryPowderPressure: "moderate" },
    sectorAppetite: ["Digital Infrastructure", "Asian Telecom", "Energy Transition"],
  },
  {
    companyId: "blackrock",
    period: "Q4 2025",
    reportDate: "2026-01-15",
    periodType: "Q4",
    keyQuotes: [
      { text: "Infrastructure is now BlackRock's fastest-growing alternatives segment, validating the GIP acquisition thesis.", speaker: "Larry Fink", role: "Chairman & CEO, BlackRock" },
    ],
    flagshipFunds: [
      { name: "GIP V", vintage: 2024, targetSize: "$15B", finalClose: null, estPctDeployed: "~25%", successorSignaled: false },
      { name: "GIP IV", vintage: 2021, targetSize: "$22B", finalClose: "$22B", estPctDeployed: "~85%", successorSignaled: true },
      { name: "Climate Infrastructure Fund", vintage: 2024, targetSize: "$5B+", finalClose: null, estPctDeployed: "~10%", successorSignaled: false },
    ],
    notableDeals: [
      "$5B in net infrastructure inflows — strongest of any alternatives sub-segment",
      "GIP integration fully completed ahead of schedule",
      "New climate infrastructure mandates from sovereign wealth funds",
    ],
    outlook: "BlackRock views infrastructure as a cornerstone of its private markets pivot. The GIP platform provides differentiated origination capabilities, and the firm expects infrastructure AUM to surpass $150B by 2027.",
    dealSignal: { signal: "Net Buyer", grossRealizations: "$1.5B", notableExits: [], flagshipDPI: "0.4x", dryPowderPressure: "harvest" },
    sectorAppetite: ["Renewables", "Digital Infrastructure", "Climate"],
  },
  {
    companyId: "macquarie",
    period: "Q3 FY2026",
    reportDate: "2026-02-10",
    periodType: "Q3",
    keyQuotes: [
      { text: "Private markets resilience continues to offset public investment divestments, with strong deployment momentum.", speaker: "Shemara Wikramanayake", role: "CEO, Macquarie Group" },
    ],
    flagshipFunds: [
      { name: "MIP V (Macquarie Infrastructure Partners V)", vintage: 2024, targetSize: "~$6B", finalClose: null, estPctDeployed: "~20%", successorSignaled: false },
      { name: "GIG Renewables Fund III", vintage: 2023, targetSize: "$5B+", finalClose: null, estPctDeployed: "~35%", successorSignaled: false },
    ],
    notableDeals: [
      "A$7.7B deployed across 23 deals in Q3 — highest quarterly pace",
      "Sold Green Investment Group (GIG) public equity assets for significant gain",
      "New data center investments in Asia-Pacific region",
    ],
    outlook: "Macquarie maintains its position as the highest-velocity deployer in infrastructure. The firm sees sustained deal flow in energy transition and digital infrastructure across Asia-Pacific and Europe.",
    dealSignal: { signal: "Net Buyer", grossRealizations: "A$2.1B", notableExits: ["GIG public equity asset sale"], flagshipDPI: "0.3x", dryPowderPressure: "moderate" },
    sectorAppetite: ["Digital Infrastructure", "Renewables", "Utilities"],
  },
  {
    companyId: "eqt",
    period: "FY 2025",
    reportDate: "2026-01-23",
    periodType: "FY",
    keyQuotes: [
      { text: "2025 was a record fundraising year for EQT Infrastructure, driven by the successful close of our flagship Fund VI.", speaker: "Christian Sinding", role: "CEO, EQT" },
    ],
    flagshipFunds: [
      { name: "EQT Infrastructure VI", vintage: 2024, targetSize: "€20B+", finalClose: "€21B", estPctDeployed: "~35%", successorSignaled: false },
      { name: "EQT Active Core Infrastructure", vintage: null, targetSize: "Evergreen", finalClose: null, estPctDeployed: "N/A", successorSignaled: false },
    ],
    notableDeals: [
      "€7.0B deployed across digital infrastructure and energy transition",
      "Major European fiber platform consolidation plays",
      "Exited several mature assets contributing to €4.5B in realizations",
    ],
    outlook: "EQT sees European digital infrastructure as a multi-decade opportunity. The firm is shifting toward longer-duration capital through its Active Core Infrastructure vehicle while maintaining its flagship drawdown series.",
    dealSignal: { signal: "Balanced", grossRealizations: "€4.5B", notableExits: ["Multiple mature asset exits"], flagshipDPI: "0.5x", dryPowderPressure: "moderate" },
    sectorAppetite: ["Digital Infrastructure", "Fiber", "Energy Transition"],
  },
  {
    companyId: "apollo",
    period: "Q4 2025",
    reportDate: "2026-02-04",
    periodType: "Q4",
    keyQuotes: [
      { text: "We originated a record $97 billion in the quarter. Our infrastructure credit strategy is the fastest-growing part of our platform.", speaker: "Marc Rowan", role: "CEO, Apollo" },
    ],
    flagshipFunds: [
      { name: "Apollo Clean Transition Capital (ACT)", vintage: 2022, targetSize: "$20B+", finalClose: null, estPctDeployed: "~45%", successorSignaled: false },
      { name: "Apollo Infrastructure Equity", vintage: null, targetSize: "Multi-strategy", finalClose: null, estPctDeployed: "N/A", successorSignaled: false },
    ],
    notableDeals: [
      "$11.8B in infrastructure-related fundraising, dominated by credit strategies",
      "$10B deployed — largest quarterly infrastructure deployment in firm history",
      "Athene balance sheet driving significant infrastructure debt origination",
    ],
    outlook: "Apollo's infrastructure strategy is uniquely credit-heavy, leveraging its Athene insurance platform for origination scale. Management expects infrastructure credit to become a $100B+ book within 3 years.",
    dealSignal: { signal: "Net Buyer", grossRealizations: "$1.2B", notableExits: [], flagshipDPI: "0.1x", dryPowderPressure: "high" },
    sectorAppetite: ["Clean Transition", "Infrastructure Debt", "Power"],
  },
  {
    companyId: "ares",
    period: "Q4 2025",
    reportDate: "2026-02-06",
    periodType: "Q4",
    keyQuotes: [
      { text: "Infrastructure debt and our power strategy are becoming core growth vectors for Ares.", speaker: "Michael Arougheti", role: "CEO, Ares Management" },
    ],
    flagshipFunds: [
      { name: "Ares Climate Infrastructure Partners", vintage: 2023, targetSize: "$3.5B", finalClose: null, estPctDeployed: "~40%", successorSignaled: false },
      { name: "Ares Infrastructure Debt Fund IV", vintage: 2024, targetSize: "$5B+", finalClose: null, estPctDeployed: "~20%", successorSignaled: false },
    ],
    notableDeals: [
      "$2.7B deployed across infrastructure debt and climate strategies",
      "New energy transition credit facilities for renewable developers",
      "Expanded power strategy with utility-scale battery storage investments",
    ],
    outlook: "Ares sees infrastructure credit as one of the largest addressable markets in alternatives. The firm is scaling its power strategy and expects infrastructure to grow from ~4% to 8-10% of firm AUM over the next 3 years.",
    dealSignal: { signal: "Net Buyer", grossRealizations: "$0.8B", notableExits: [], flagshipDPI: "0.2x", dryPowderPressure: "moderate" },
    sectorAppetite: ["Infrastructure Debt", "Renewables", "Climate"],
  },
  {
    companyId: "tpg",
    period: "Q4 2025",
    reportDate: "2026-02-05",
    periodType: "Q4",
    keyQuotes: [
      { text: "TPG Rise Climate continues to attract significant LP interest, with our impact-focused infrastructure strategy resonating globally.", speaker: "Jon Winkelried", role: "CEO, TPG" },
    ],
    flagshipFunds: [
      { name: "TPG Rise Climate Fund", vintage: 2022, targetSize: "$10B+", finalClose: "$7.3B", estPctDeployed: "~55%", successorSignaled: true },
      { name: "TPG Rise Climate II", vintage: null, targetSize: "In planning", finalClose: null, estPctDeployed: "0%", successorSignaled: false },
    ],
    notableDeals: [
      "$2.0B deployed in Q4 across climate infrastructure and energy transition",
      "New investments in utility-scale solar and grid-scale storage",
      "Asian clean energy platform expansion",
    ],
    outlook: "TPG is positioning Rise Climate as one of the largest dedicated climate infrastructure funds. The firm expects to launch Rise Climate II in 2026, targeting $15B+ as LP demand for impact-oriented infrastructure grows.",
    dealSignal: { signal: "Net Buyer", grossRealizations: "$0.5B", notableExits: [], flagshipDPI: "0.1x", dryPowderPressure: "moderate" },
    sectorAppetite: ["Energy Transition", "Decarbonization", "Industrial"],
  },
];

// ─── Analyst Intelligence Trends ────────────────────────────

export interface AnalystTrendPoint {
  label: string;
  text: string;
}

export interface AnalystTrend {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  points: AnalystTrendPoint[];
}

export const analystTrends: AnalystTrend[] = [
  {
    id: "fundraising",
    number: 1,
    title: "Fundraising",
    subtitle: 'The "Flight to Quality"',
    points: [
      {
        label: "Trend",
        text: "Fundraising for infrastructure nearly doubled YoY for top firms (KKR +88%, Apollo +81%, BlackRock +233%).",
      },
      {
        label: "Driver",
        text: "LPs are aggressively allocating to Infrastructure Debt (Apollo, Ares) and Energy Transition (Brookfield, KKR).",
      },
      {
        label: "Observation",
        text: "EQT saw a massive rebound in fundraising (+117%) in 2025 compared to a slower 2024, driven by the close of its flagship Infrastructure VI fund.",
      },
    ],
  },
  {
    id: "deployment",
    number: 2,
    title: "Deployment",
    subtitle: "Divergent Strategies",
    points: [
      {
        label: "The Aggressors",
        text: "Apollo (+223%) and Macquarie (+40%) ramped up deployment significantly, capitalizing on private credit demand and asset recycling.",
      },
      {
        label: "The Disciplined",
        text: "EQT (-40%) and Brookfield (-33%) significantly tapped the brakes on deployment compared to 2024, signaling a refusal to chase high valuations in a crowded market.",
      },
    ],
  },
  {
    id: "performance",
    number: 3,
    title: "Performance",
    subtitle: 'The "Data Center" Premium',
    points: [
      {
        label: "Outlier",
        text: "Blackstone's +23.5% return is nearly double the peer average. This is almost entirely attributable to the valuation surge of QTS Data Centers.",
      },
      {
        label: "Normalization",
        text: "Most peers (KKR, Macquarie, BlackRock) delivered steady returns in the 8-11% range. EQT's performance normalized to 3% (Value Creation) in 2025 after a massive 18% year in 2024, reflecting the cyclical nature of realized exits.",
      },
      {
        label: "So What",
        text: "The data center premium is creating a bifurcation in 2026 deployment appetite — firms with digital infrastructure exposure (Blackstone, KKR) are accelerating capital deployment, while those without are competing on yield. Blackstone's QTS-driven outperformance likely reflects a one-time mark-to-market revaluation rather than sustainable recurring returns, but it validates the thesis that digital infrastructure commands a structural premium. For LPs, this performance divergence is accelerating the 'barbell' allocation trend: core infrastructure for yield stability, and digital/energy transition for outsized returns.",
      },
    ],
  },
  {
    id: "credit-crossover",
    number: 4,
    title: "Infrastructure Debt",
    subtitle: 'The "Credit Crossover"',
    points: [
      {
        label: "Trend",
        text: "Apollo ($11.8B) and Ares ($2.9B) are leading deployment through infrastructure debt and private credit strategies, blurring the line between traditional infrastructure equity and credit.",
      },
      {
        label: "Shift",
        text: "Apollo's $97B quarterly origination record was fueled by its Athene insurance balance sheet, enabling infrastructure debt origination at a scale that traditional equity-focused GPs cannot match.",
      },
      {
        label: "Competitive Dynamics",
        text: "The credit crossover is reshaping competitive dynamics: hybrid platforms (Apollo, Ares, Brookfield) that can offer both equity and debt solutions are winning mandates over pure-play infrastructure equity funds. LPs increasingly want one-stop-shop infrastructure platforms.",
      },
      {
        label: "Implication",
        text: "Traditional infrastructure equity funds face margin pressure as credit alternatives offer comparable risk-adjusted returns with shorter duration and better downside protection. The winners in 2026 will be platforms that can originate across the entire capital structure.",
      },
    ],
  },
  {
    id: "sector-convergence",
    number: 5,
    title: "Sector Convergence",
    subtitle: "Where Capital Is Concentrating",
    points: [
      {
        label: "Crowding Risk",
        text: "Five of nine tracked firms cited digital infrastructure as a priority deployment theme, suggesting elevated competition and potential valuation pressure in data center and fiber M&A processes. Renewables and energy transition are similarly crowded, with 7 of 9 firms active.",
      },
      {
        label: "White Space",
        text: "Transport and utilities remain relatively uncrowded, with only 2-3 firms actively deploying. Firms with established positions in these sectors (Brookfield, Macquarie) may benefit from less competitive dynamics and more favorable entry multiples.",
      },
      {
        label: "Implication",
        text: "Deal professionals should expect compressed timelines and higher multiples in digital infrastructure processes. The most attractive risk-adjusted opportunities may be in sectors where fewer mega-funds are competing — particularly transport logistics, water infrastructure, and regulated utilities.",
      },
    ],
  },
];

// ─── Verified Asset Manager Cards ────────────────────────────

export interface MetricComparison {
  label: string; // "QoQ", "YoY", "HoH"
  value: string; // "$3.5B", "Not Disclosed"
}

export interface MetricLine {
  label: string;
  value: string;
}

export interface CardMetric {
  value: string;
  label?: string; // e.g., "Net Inflows", "Direct Infra"
  isIsolated?: boolean; // false = broader segment, defaults to true
  segmentNote?: string; // e.g., "Real Assets Segment total distributions: $3.96B"
  comparisons: MetricComparison[];
  additionalLines?: MetricLine[]; // e.g., Ares secondaries line
}

export interface AssetManagerCard {
  companyId: string;
  ticker: string;
  reportingContext: string;
  period: string;
  periodNote?: string;
  currency: string;
  reportDate: string;
  fundraising: CardMetric;
  deployment: CardMetric;
  realizations: CardMetric;
  notes?: string[];
  commentary?: string[];
}

export const assetManagerCards: AssetManagerCard[] = [
  {
    companyId: "brookfield",
    ticker: "BAM",
    reportingContext: "Standalone Infrastructure Segment",
    period: "Q4 2025",
    currency: "USD",
    reportDate: "2026-02-04",
    fundraising: {
      value: "$7.0B",
      comparisons: [
        { label: "QoQ", value: "$3.5B" },
        { label: "YoY", value: "$2.5B" },
      ],
    },
    deployment: {
      value: "$800M",
      comparisons: [
        { label: "QoQ", value: "$9.3B" },
        { label: "YoY", value: "Not Disclosed" },
      ],
    },
    realizations: {
      value: "$1.6B",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "$300M" },
      ],
    },
    notes: [
      "Fundraising includes $5.0B for its inaugural AI infrastructure fund.",
      "Realizations include the partial sale of PD Ports and the IPO of Rockpoint Gas Storage.",
    ],
    commentary: [
      "In November, we launched a $100 billion global AI infrastructure program, anchored by the Brookfield AI Infrastructure Fund ('BAIIF').",
      "The fund is targeting $10 billion of equity commitments, of which it has already secured $5 billion of commitments. This first-of-its-kind strategy will focus on investing in the physical infrastructure that powers AI...",
      "In December, we announced a strategic partnership with Qai, Qatar's national AI company, to establish a $20 billion joint venture focused on artificial intelligence infrastructure.",
    ],
  },
  {
    companyId: "blackstone",
    ticker: "BX",
    reportingContext: "Infrastructure Sub-Segment (Housed within Private Equity)",
    period: "Q4 2025",
    currency: "USD",
    reportDate: "2026-01-29",
    fundraising: {
      value: "$4.16B",
      label: "Inflows",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "Not Disclosed" },
      ],
    },
    deployment: {
      value: "$1.77B",
      label: "Capital Deployed",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "Not Disclosed" },
      ],
    },
    realizations: {
      value: "$566M",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "Not Disclosed" },
      ],
    },
    commentary: [
      "Our focus on investing at massive scale in the buildout of digital and energy infrastructure continues to create significant value for our investors.",
      "Inflows in the quarter included $8.0 billion in Secondaries... $4.2 billion in Infrastructure, $1.6 billion in Tactical Opportunities...",
      "Infrastructure appreciated 8.4% in the quarter and 23.5% for the year.",
    ],
  },
  {
    companyId: "tpg",
    ticker: "TPG",
    reportingContext: "Impact Platform (Houses Climate & Energy Transition)",
    period: "Q4 2025",
    currency: "USD",
    reportDate: "2026-02-05",
    fundraising: {
      value: "$1.11B",
      comparisons: [
        { label: "QoQ", value: "$440M" },
        { label: "YoY", value: "$1.71B" },
      ],
    },
    deployment: {
      value: "$2.00B",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "$951M" },
      ],
    },
    realizations: {
      value: "$636M",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "$105M" },
      ],
    },
    commentary: [
      "2025 was an outstanding year for TPG, marked by exceptional execution across our global franchise. We achieved new records, with more than $51 billion raised and $52 billion deployed...",
      "We started 2026 with significant momentum and our increased scale and diversification, coupled with $72 billion in dry powder, position us well to navigate the evolving market landscape.",
      "Fee-Earning Capital Raised [included] $10.6 billion in TPG X in the Capital platform and $1.9 billion in Rise Climate II in the Impact platform.",
    ],
  },
  {
    companyId: "kkr",
    ticker: "KKR",
    reportingContext: "Real Assets Segment (Combines Infrastructure & Real Estate)",
    period: "Q4 2025",
    currency: "USD",
    reportDate: "2026-02-05",
    fundraising: {
      value: "$10.0B",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "$5.34B" },
      ],
    },
    deployment: {
      value: "$7.45B",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "$6.40B" },
      ],
    },
    realizations: {
      value: "Not Isolated",
      isIsolated: false,
      segmentNote: "Real Assets Segment total distributions: $3.96B",
      comparisons: [],
    },
    notes: [
      "Q4 fundraising was primarily driven by infrastructure vehicles.",
      "$26.4M in Net Realized Performance Income for the segment was driven specifically by global and European infrastructure.",
    ],
    commentary: [
      "New capital raised in the quarter was primarily driven by K-Series Infrastructure, with additional inflows from Global Infrastructure V and Asia Infrastructure III.",
      "Realizations: Carried Interest in 4Q was driven by global and European infrastructure.",
      "The infrastructure portfolio appreciated 11% and the opportunistic real estate portfolio appreciated 5% during the year.",
    ],
  },
  {
    companyId: "ares",
    ticker: "ARES",
    reportingContext: "Hybrid (Direct Infra for raises/deployments; Broader Real Assets for realizations)",
    period: "Q4 2025",
    currency: "USD",
    reportDate: "2026-02-05",
    fundraising: {
      value: "$2.9B",
      label: "Direct Infra",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "Not Disclosed" },
      ],
      additionalLines: [
        { label: "Infra Secondaries", value: "$0.8B" },
      ],
    },
    deployment: {
      value: "$2.7B",
      label: "Direct Infra",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "Not Disclosed" },
      ],
    },
    realizations: {
      value: "Not Isolated",
      isIsolated: false,
      segmentNote: "Total Real Assets Segment distributions: $1.93B",
      comparisons: [],
    },
    commentary: [
      "Capital raised of $2.0 billion by our open-ended infrastructure fund.",
      "[We saw] equity and debt commitments to various funds, including... equity commitments of $2.5 billion and debt commitments of $0.5 billion to our sixth infrastructure debt fund and equity commitments of $0.7 billion to Ares Climate Infrastructure Partners II.",
      "Equity commitments of $3.3 billion to Ares Secondaries Infrastructure Solutions III, L.P. ('ASIS III') and related vehicles...",
    ],
  },
  {
    companyId: "blackrock",
    ticker: "BLK",
    reportingContext: "Infrastructure (Private Markets Product Type)",
    period: "Q4 2025",
    currency: "USD",
    reportDate: "2026-01-15",
    fundraising: {
      value: "$4.99B",
      label: "Net Inflows",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "Not Disclosed" },
      ],
    },
    deployment: {
      value: "Not Disclosed",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "Not Disclosed" },
      ],
    },
    realizations: {
      value: "$3.00B",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "Not Disclosed" },
      ],
    },
    commentary: [
      "2026 will be our first full year as a unified platform with GIP, HPS and Preqin. Around the world, clients are looking to do more across BlackRock.",
      "BlackRock is differentiated as a scale operator in public and private markets investing and technology... We're a leader in public and private markets, and in technology and data.",
      "We're seeing excellent fundraising activity as we work toward our goal of $400 billion in private markets fundraising by 2030.",
    ],
  },
  {
    companyId: "apollo",
    ticker: "APO",
    reportingContext: "Credit Segment (Houses Infrastructure & Asset-Based Credit)",
    period: "Q4 2025",
    currency: "USD",
    reportDate: "2026-02-09",
    fundraising: {
      value: "$11.8B",
      label: "Combined inflows across infra and asset-based credit",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "Not Disclosed" },
      ],
    },
    deployment: {
      value: "Not Isolated",
      isIsolated: false,
      segmentNote: "Total Credit Segment deployed $22.9B",
      comparisons: [],
    },
    realizations: {
      value: "Not Isolated",
      isIsolated: false,
      segmentNote: "Total Credit Segment realized $25.6B",
      comparisons: [],
    },
    commentary: [
      "Inflows in the quarter included... $11.8 billion for the infrastructure and asset based credit strategies, inclusive of $8.0 billion for insurance SMAs.",
      "Capital Deployed: $22.9 billion in the quarter and $67.7 billion for the year driven by U.S. direct lending as well as infrastructure and asset based credit strategies.",
      "Capital solutions fees grew 21% in 2025 primarily driven by continued strength and growing diversification across Apollo's origination ecosystem including direct origination, asset-backed finance, multi-credit and opportunistic credit transactions.",
    ],
  },
  {
    companyId: "eqt",
    ticker: "EQT",
    reportingContext: "Real Assets Segment (Combines Infra & Real Estate; Half-Year Reporting)",
    period: "H2 2025",
    periodNote: "Six months ended Dec 31, 2025",
    currency: "EUR",
    reportDate: "2026-01-22",
    fundraising: {
      value: "€4.6B",
      comparisons: [
        { label: "HoH", value: "€5.6B" },
        { label: "YoY", value: "Not Disclosed" },
      ],
    },
    deployment: {
      value: "€3.1B",
      comparisons: [
        { label: "HoH", value: "€3.9B" },
        { label: "YoY", value: "€5.2B" },
      ],
    },
    realizations: {
      value: "€1.5B",
      comparisons: [
        { label: "HoH", value: "€0.6B" },
        { label: "YoY", value: "€4.1B" },
      ],
    },
    notes: [
      "EQT highlighted the final close of EQT Infrastructure VI at a €21.5B hard cap.",
      "Exit of its remaining stake in Kodiak Gas Services.",
    ],
    commentary: [
      "We closed EQT Infrastructure VI at €21.5 billion, hitting the hard cap. This represents a 35% increase on the fund's predecessor, owing to strong support from both existing and new investors.",
      "In 2025, we introduced our first open ended structure for institutional clients with the latest Active Core Infrastructure strategy... and just last week we introduced another US-domiciled vehicle that enables access to our global infrastructure platform.",
      "In connection with the sell-down announced in December 2025, EQT Infrastructure exited its remaining stake in Kodiak Gas Services, a leading provider of natural gas contract compression services in the US.",
    ],
  },
  {
    companyId: "macquarie",
    ticker: "MQG",
    reportingContext: "Private Markets (Combines Infra, Real Estate, Ag, Private Credit)",
    period: "Q3 FY2026",
    periodNote: "Corresponds to Calendar Q4 2025",
    currency: "AUD",
    reportDate: "2026-02-10",
    fundraising: {
      value: "A$6.3B",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "Not Disclosed" },
      ],
    },
    deployment: {
      value: "A$7.7B",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "Not Disclosed" },
      ],
    },
    realizations: {
      value: "A$1.6B",
      comparisons: [
        { label: "QoQ", value: "Not Disclosed" },
        { label: "YoY", value: "Not Disclosed" },
      ],
    },
    commentary: [
      "As energy transition characteristics create new risk management challenges, CGM has continued to evolve its presence and product capability - developing battery and flexible power offtakes that help tailor solutions for real client needs.",
      "Raised $A6.3b in new equity in 3Q26, $A17.0b YTD, from clients across a diverse range of strategies, including energy transition, regional and global infrastructure, agriculture and private credit.",
      "Invested $A7.7b of equity in 3Q26, $A20.2b YTD across 23 investments including 9 in private credit, 9 in real assets and 5 in real estate.",
    ],
  },
];

// ─── Helper Functions ──────────────────────────────────────

export function getCompanyById(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getAvailableQuarters(): string[] {
  const quarters = new Set(earningsReports.map((r) => r.quarter));
  return Array.from(quarters).sort().reverse();
}

export function getReportsForQuarter(quarter: string): CompanyEarningsReport[] {
  return earningsReports.filter((r) => r.quarter === quarter);
}

export function getReportForCompany(companyId: string, quarter: string): CompanyEarningsReport | undefined {
  return earningsReports.find((r) => r.companyId === companyId && r.quarter === quarter);
}

export function getSectorTypeColor(sector: CompanySector): string {
  switch (sector) {
    case "Alternative Asset Manager": return "#8b5cf6";
    case "Global Asset Manager": return "#3b82f6";
    case "Private Markets Specialist": return "#06b6d4";
    case "Infrastructure Fund": return "#10b981";
    case "Insurance & Asset Management": return "#f59e0b";
    default: return "#71717a";
  }
}

export function formatEarningsDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatFullDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatSource(source: DataSource): string {
  return source.page ? `${source.document}, ${source.page}` : source.document;
}

export function getCalendarEntries(quarter: string): CalendarEntry[] {
  return earningsReports
    .filter((r) => r.quarter === quarter)
    .map((r) => {
      const company = getCompanyById(r.companyId)!;
      return {
        companyId: r.companyId,
        companyName: company.name,
        ticker: company.ticker,
        quarter: r.quarter,
        date: r.reportDate ?? r.expectedDate ?? "",
        isReported: r.reportDate !== null,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getQuarterStats(quarter: string) {
  const reports = getReportsForQuarter(quarter);
  const reported = reports.filter((r) => r.reportDate !== null);
  const upcoming = reports
    .filter((r) => r.reportDate === null && r.expectedDate !== null)
    .sort((a, b) => new Date(a.expectedDate!).getTime() - new Date(b.expectedDate!).getTime());
  const nextUpcoming = upcoming[0];
  const nextCompany = nextUpcoming ? getCompanyById(nextUpcoming.companyId) : null;

  return {
    totalCompanies: reports.length,
    reportedCount: reported.length,
    upcomingCount: upcoming.length,
    nextExpectedDate: nextUpcoming?.expectedDate ?? null,
    nextCompanyName: nextCompany?.name ?? null,
    nextCompanyTicker: nextCompany?.ticker ?? null,
  };
}
