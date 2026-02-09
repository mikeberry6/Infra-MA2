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
    id: "3i-infrastructure",
    name: "3i Infrastructure",
    ticker: "3IN",
    exchange: "LSE",
    sector: "Infrastructure Fund",
    description: "Listed closed-end infrastructure investment fund managed by 3i Investments, focused on mid-market core-plus infrastructure in Europe.",
    infraAum: 4.8,
    totalAum: 4.8,
    headquarters: "London, UK",
    reportingCurrency: "GBP",
    website: "https://www.3i-infrastructure.com",
  },
  {
    id: "apollo",
    name: "Apollo Global Management",
    ticker: "APO",
    exchange: "NYSE",
    sector: "Alternative Asset Manager",
    description: "Global alternative asset manager with significant infrastructure credit and equity capabilities across clean energy transition and digital infrastructure.",
    infraAum: 58,
    totalAum: 733,
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
    description: "Global alternative investment manager with a growing infrastructure and power strategy investing across energy transition, digital, and transport.",
    infraAum: 33,
    totalAum: 464,
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
    description: "World's largest asset manager. Acquired Global Infrastructure Partners (GIP) in 2024, creating a $170B+ infrastructure platform spanning transport, energy, digital, and water.",
    infraAum: 170,
    totalAum: 11550,
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
    totalAum: 1130,
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
    description: "Global investment firm with a major infrastructure platform spanning energy, transport, digital, and renewables with $78B in infrastructure AUM.",
    infraAum: 78,
    totalAum: 624,
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
    id: "stepstone",
    name: "StepStone Group",
    ticker: "STEP",
    exchange: "NASDAQ",
    sector: "Private Markets Specialist",
    description: "Global private markets investment firm with $42B in infrastructure capital allocations, providing fund investments, co-investments, and secondaries advisory.",
    infraAum: 42,
    totalAum: 170,
    headquarters: "New York, NY",
    reportingCurrency: "USD",
    website: "https://www.stepstonegroup.com",
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
    description: "Global alternative asset manager with infrastructure exposure through TPG Rise Climate and Asia-focused infrastructure funds targeting energy transition.",
    infraAum: 27,
    totalAum: 239,
    headquarters: "Fort Worth, TX",
    reportingCurrency: "USD",
    website: "https://www.tpg.com",
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
    primaryDriver: "QTS Data Centers",
    thematicFocus: ["Digital Infrastructure", "Energy Transition"],
    capitalActivity: {
      inflows: "$4.2B",
      deployed: "$1.8B",
      realizations: "$0.6B",
      source: { document: "Earnings Release", page: "Pg 9" },
    },
    scale: {
      totalAum: "$1.13T",
      infraAum: "$77B",
      infraAumGrowthYoy: "+40% YoY",
      dryPowder: "$40B",
      infraDryPowder: "$24B",
      source: { document: "Earnings Call Transcript", page: null },
    },
    economics: {
      managementFees: "$1.82B",
      feeRelatedEarnings: "$1.24B",
      freMargin: "68%",
      realizedPerformanceRevenue: "$580M",
      distributableEarnings: "$1.41B",
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
        { segment: "TOTAL", priorAum: "$1,127.2B", currentAum: "$1,274.9B", yoyGrowth: "+13%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "4Q25 Earnings Supplement", page: "Pg 3" },
    },
    infraVitals: {
      quarterLabel: "Q4 2025",
      fullYearLabel: "Full Year 2025",
      rows: [
        { metric: "Appreciation (Asset Performance)", quarterly: "+8.4%", fullYear: "+23.5%", insight: "Top Performer. Driven by \"Digital Infrastructure\" (Data Centers) and \"Energy Transition\" themes." },
        { metric: "Capital Inflows (Fundraising)", quarterly: "$4.2B", fullYear: "$13.3B", insight: "Robust demand. Includes $728M raised in Q4 for BXINFRA (retail/wealth vehicle)." },
        { metric: "Capital Deployed", quarterly: "$1.8B", fullYear: "$6.8B", insight: "Disciplined Pacing. Deployment is selectively focused (only ~50% of inflows were deployed), implying a rigorous valuation discipline." },
        { metric: "Realizations (Exits)", quarterly: "$0.6B", fullYear: "$2.4B", insight: "Low Exit Volume. Represents a \"Buy & Build\" strategy; the firm is holding assets to compound value rather than selling." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Steve Schwarzman",
      role: "Chairman & CEO, Blackstone",
      text: "We are investing at massive scale in digital infrastructure and electrification. High conviction in data center demand and grid modernization.",
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
    primaryDriver: "GIP Platform Integration",
    thematicFocus: ["Transport", "Energy & Power", "Digital Infrastructure"],
    capitalActivity: {
      inflows: "+$2.1B",
      deployed: "~$12B",
      realizations: null,
      source: { document: "Earnings Call Transcript", page: null },
    },
    scale: {
      totalAum: "$11.55T",
      infraAum: "$170B",
      infraAumGrowthYoy: "+12% YoY",
      dryPowder: null,
      infraDryPowder: "$18B",
      source: { document: "4Q25 Supplement", page: "Pg 5" },
    },
    economics: {
      managementFees: "$4.41B",
      feeRelatedEarnings: null,
      freMargin: null,
      realizedPerformanceRevenue: "$306M",
      distributableEarnings: null,
      source: { document: "Earnings Release", page: "Pg 3" },
    },
    perpetualFunds: [
      {
        name: "GIP Open-End Infra Fund",
        aum: "$28.0B",
        totalReturn: "8.4%",
        yieldPct: "4.2%",
        appreciationPct: "4.2%",
        netFlows: "+$2.1B",
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
        actual: "$170B",
        comparison: "$165B",
        comparisonLabel: "Consensus",
        delta: "+$5B",
        direction: "positive",
        source: { document: "4Q25 Supplement", page: "Pg 5" },
      },
      {
        metric: "Total Net Inflows",
        actual: "$281B",
        comparison: "$210B",
        comparisonLabel: "Consensus",
        delta: "+$71B",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Base Fees",
        actual: "$4.41B",
        comparison: "$4.25B",
        comparisonLabel: "Consensus",
        delta: "+$160M",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 3" },
      },
      {
        metric: "Adj. Operating Margin",
        actual: "45.5%",
        comparison: "44.2%",
        comparisonLabel: "Consensus",
        delta: "+130bps",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 2" },
      },
      {
        metric: "Infra Deployment",
        actual: "~$12B",
        comparison: "~$9B",
        comparisonLabel: "Q4 2024",
        delta: "+~$3B",
        direction: "positive",
        source: { document: "Earnings Call Transcript", page: null },
      },
      {
        metric: "Performance Fees",
        actual: "$306M",
        comparison: "$245M",
        comparisonLabel: "Q4 2024",
        delta: "+$61M",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 3" },
      },
    ],
    sectorExposure: [
      { sector: "Transport", aum: "$52B", pct: 31, color: "#f59e0b" },
      { sector: "Energy & Power", aum: "$48B", pct: 28, color: "#10b981" },
      { sector: "Digital Infrastructure", aum: "$38B", pct: 22, color: "#3b82f6" },
      { sector: "Water & Waste", aum: "$18B", pct: 11, color: "#06b6d4" },
      { sector: "Other", aum: "$14B", pct: 8, color: "#71717a" },
    ],
    assetAllocation: {
      priorPeriodLabel: "Q4 2024",
      currentPeriodLabel: "Q4 2025",
      rows: [
        { segment: "Equity ETFs & Index", priorAum: "$5,220B", currentAum: "$5,690B", yoyGrowth: "+9%", yoyDirection: "up", pctOfTotal: "49%", note: "Largest" },
        { segment: "Fixed Income", priorAum: "$2,810B", currentAum: "$3,050B", yoyGrowth: "+9%", yoyDirection: "up", pctOfTotal: "26%", note: null },
        { segment: "Multi-Asset & Other", priorAum: "$1,430B", currentAum: "$1,600B", yoyGrowth: "+12%", yoyDirection: "up", pctOfTotal: "14%", note: null },
        { segment: "Cash Management", priorAum: "$700B", currentAum: "$810B", yoyGrowth: "+16%", yoyDirection: "up", pctOfTotal: "7%", note: null },
        { segment: "Alternatives", priorAum: "$350B", currentAum: "$400B", yoyGrowth: "+14%", yoyDirection: "up", pctOfTotal: "3%", note: "Houses GIP Infrastructure" },
        { segment: "TOTAL", priorAum: "$10,510B", currentAum: "$11,550B", yoyGrowth: "+10%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "4Q25 Earnings Supplement", page: "Pg 5" },
    },
    infraVitals: {
      quarterLabel: "Q4 2025",
      fullYearLabel: "Full Year 2025",
      rows: [
        { metric: "Total Return (GIP Open-End)", quarterly: "+4.2%", fullYear: "+8.4%", insight: "Steady Performer. Balanced 50/50 split between yield (4.2%) and appreciation (4.2%), demonstrating stable cash generation." },
        { metric: "Platform Scale", quarterly: "$170B AUM", fullYear: "+12% YoY", insight: "Milestone. First full year post-GIP acquisition; infrastructure is now BlackRock's fastest-growing alternatives segment." },
        { metric: "Capital Deployed", quarterly: "~$12B", fullYear: "~$35B", insight: "Accelerating. GIP integration enabled cross-selling to BlackRock's $11.5T client base and larger deal capacity." },
        { metric: "Net Inflows", quarterly: "+$2.1B", fullYear: "~$8B", insight: "Strong Demand. GIP V targeting $15B with robust institutional LP pipeline. BXINFRA-style retail vehicle under development." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Larry Fink",
      role: "Chairman & CEO, BlackRock",
      text: "Infrastructure is the defining investment opportunity of the next decade. The combination of BlackRock's scale and GIP's operational expertise has created a truly differentiated platform.",
    },
  },

  // ─── Macquarie Group ──────────────────────────────────────
  {
    companyId: "macquarie",
    quarter: "Q4 2025",
    reportDate: "2026-01-30T06:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "earnings_release",
        label: "H1 FY2026 Results (MDA)",
        url: "https://www.macquarie.com/assets/macq/investor/results-and-presentations/2026/macquarie-group-hy26-mda.pdf",
        date: "2026-01-30",
      },
      {
        type: "supplement",
        label: "H1 FY2026 Presentation",
        url: "https://www.macquarie.com/assets/macq/investor/results-and-presentations/2026/macquarie-group-hy26-presentation.pdf",
        date: "2026-01-30",
      },
      {
        type: "transcript",
        label: "H1 FY2026 Results Transcript",
        url: "https://www.macquarie.com/assets/macq/investor/results-and-presentations/2026/macquarie-group-hy26-transcript.pdf",
        date: "2026-01-30",
      },
    ],
    primaryDriver: "Green Investment Group (GIG)",
    thematicFocus: ["Renewables & Energy", "Transport", "Digital Infrastructure"],
    capitalActivity: {
      inflows: "$8.0B",
      deployed: "$7.5B",
      realizations: null,
      source: { document: "H1 FY26 Presentation", page: "Slide 30" },
    },
    scale: {
      totalAum: "A$924B",
      infraAum: "$195B",
      infraAumGrowthYoy: "+8% YoY",
      dryPowder: "$24B",
      infraDryPowder: "$16B",
      source: { document: "H1 FY26 Presentation", page: "Slide 28" },
    },
    economics: {
      managementFees: "$1.1B",
      feeRelatedEarnings: null,
      freMargin: null,
      realizedPerformanceRevenue: "$320M",
      distributableEarnings: null,
      source: { document: "H1 FY26 MDA", page: "Pg 18" },
    },
    perpetualFunds: [
      {
        name: "MEIF7 (Open-Ended)",
        aum: "A$8.5B",
        totalReturn: "9.1%",
        yieldPct: "5.5%",
        appreciationPct: "3.6%",
        netFlows: "+A$1.2B",
        source: { document: "H1 FY26 Presentation", page: "Slide 32" },
      },
      {
        name: "MIRA Listed Infra Fund",
        aum: "$4.2B",
        totalReturn: "7.8%",
        yieldPct: "4.6%",
        appreciationPct: "3.2%",
        netFlows: "+$0.4B",
        source: { document: "H1 FY26 Presentation", page: "Slide 34" },
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
        metric: "Infra AUM",
        actual: "$195B",
        comparison: "$190B",
        comparisonLabel: "Consensus",
        delta: "+$5B",
        direction: "positive",
        source: { document: "H1 FY26 Presentation", page: "Slide 28" },
      },
      {
        metric: "MAM Base Fees",
        actual: "$1.1B",
        comparison: "$1.0B",
        comparisonLabel: "H1 FY25",
        delta: "+$100M",
        direction: "positive",
        source: { document: "H1 FY26 MDA", page: "Pg 18" },
      },
      {
        metric: "Capital Raised (Q)",
        actual: "$8.0B",
        comparison: "$6.5B",
        comparisonLabel: "Q3 FY26",
        delta: "+$1.5B",
        direction: "positive",
        source: { document: "H1 FY26 Presentation", page: "Slide 30" },
      },
      {
        metric: "Infra Deployment",
        actual: "$7.5B",
        comparison: "$6.2B",
        comparisonLabel: "H1 FY25",
        delta: "+$1.3B",
        direction: "positive",
        source: { document: "H1 FY26 Presentation", page: "Slide 40" },
      },
      {
        metric: "Performance Fees",
        actual: "$320M",
        comparison: "$280M",
        comparisonLabel: "H1 FY25",
        delta: "+$40M",
        direction: "positive",
        source: { document: "H1 FY26 MDA", page: "Pg 18" },
      },
      {
        metric: "Group Net Profit",
        actual: "A$1.76B",
        comparison: "A$1.62B",
        comparisonLabel: "H1 FY25",
        delta: "+A$140M",
        direction: "positive",
        source: { document: "H1 FY26 MDA", page: "Pg 2" },
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
      priorPeriodLabel: "H1 FY25",
      currentPeriodLabel: "H1 FY26",
      rows: [
        { segment: "Infrastructure Equity (MIRA)", priorAum: "A$280B", currentAum: "A$300B", yoyGrowth: "+7%", yoyDirection: "up", pctOfTotal: "32%", note: "Largest MAM Segment" },
        { segment: "Fixed Income", priorAum: "A$210B", currentAum: "A$230B", yoyGrowth: "+10%", yoyDirection: "up", pctOfTotal: "25%", note: null },
        { segment: "Equities & Multi-Asset", priorAum: "A$150B", currentAum: "A$160B", yoyGrowth: "+7%", yoyDirection: "up", pctOfTotal: "17%", note: null },
        { segment: "Private Credit", priorAum: "A$80B", currentAum: "A$95B", yoyGrowth: "+19%", yoyDirection: "up", pctOfTotal: "10%", note: "Fastest Growing" },
        { segment: "Real Assets (ex-Infra)", priorAum: "A$75B", currentAum: "A$82B", yoyGrowth: "+9%", yoyDirection: "up", pctOfTotal: "9%", note: null },
        { segment: "Other / Advisory", priorAum: "A$52B", currentAum: "A$57B", yoyGrowth: "+10%", yoyDirection: "up", pctOfTotal: "6%", note: null },
        { segment: "TOTAL MAM", priorAum: "A$847B", currentAum: "A$924B", yoyGrowth: "+9%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "H1 FY26 Presentation", page: "Slide 28" },
    },
    infraVitals: {
      quarterLabel: "H1 FY26",
      fullYearLabel: "FY26 Run-Rate",
      rows: [
        { metric: "Capital Raised", quarterly: "A$12B", fullYear: "A$24B (ann.)", insight: "Strong Fundraising. GIG renewables and MIRA equity strategies attracting global institutional capital." },
        { metric: "Capital Deployed", quarterly: "A$11B", fullYear: "A$22B (ann.)", insight: "Full Deployment. Near-complete utilization of raised capital, focused on energy transition and digital infrastructure." },
        { metric: "GIG Renewables Pipeline", quarterly: "12 GW", fullYear: "25 GW pipeline", insight: "Scale Leader. Green Investment Group remains the largest dedicated renewables developer globally." },
        { metric: "MAM Base Fees", quarterly: "A$1.7B", fullYear: "A$3.4B (ann.)", insight: "Margin Expansion. +10% YoY growth driven by infrastructure platform scale and performance fee crystallizations." },
      ],
      source: { document: "H1 FY26 MDA & Presentation", page: null },
    },
    keyQuote: {
      speaker: "Shemara Wikramanayake",
      role: "CEO, Macquarie Group",
      text: "The energy transition remains the most significant investment theme of our generation, and our deep operational capabilities position us to capture outsized value for our investors.",
    },
  },

  // ─── 3i Infrastructure ────────────────────────────────────
  {
    companyId: "3i-infrastructure",
    quarter: "Q4 2025",
    reportDate: "2026-01-23T07:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "annual_report",
        label: "Half-Year Results (Sep 2025)",
        url: "https://www.3i-infrastructure.com/media/buejtni2/3in-september-2025-half-year-results-full-report.pdf",
        date: "2026-01-23",
      },
      {
        type: "investor_presentation",
        label: "Results Presentation",
        url: "https://www.3i-infrastructure.com/media/hw0o1caz/3in-september-2025-half-year-results-press-release-highlights.pdf",
        date: "2026-01-23",
      },
    ],
    primaryDriver: null,
    thematicFocus: ["Energy & Power", "Transport"],
    capitalActivity: {
      inflows: null,
      deployed: null,
      realizations: "£130M",
      source: { document: "Half-Year Results", page: "Pg 8" },
    },
    scale: {
      totalAum: "£3.4B",
      infraAum: "£3.4B",
      infraAumGrowthYoy: "+9% YoY",
      dryPowder: "£240M",
      infraDryPowder: "£240M",
      source: { document: "Half-Year Results", page: "Pg 4" },
    },
    economics: {
      managementFees: "£12.8M",
      feeRelatedEarnings: null,
      freMargin: null,
      realizedPerformanceRevenue: null,
      distributableEarnings: null,
      source: { document: "Half-Year Results", page: "Pg 18" },
    },
    perpetualFunds: [],
    closedEndFunds: [
      {
        name: "3i Infrastructure PLC (Listed CEF)",
        vintage: "2007",
        size: "£3.4B NAV",
        netIrr: "12.8% (NAV Total Return)",
        dpi: "11.325p/share (FY div)",
        source: { document: "Half-Year Results", page: "Pg 2" },
      },
    ],
    operationalVitalSigns: {
      dataCenters: null,
      energy: {
        ppaWeightedAvgLife: "12 years",
        pctRevenueInflationLinked: "65%",
        source: { document: "Half-Year Results", page: "Pg 24" },
      },
    },
    riskDashboard: {
      lookThroughLeverage: "4.8x",
      interestCoverage: "3.5x",
      pctDebtFixed: "85%",
      pctDebtFloating: "15%",
      weightedAvgMaturity: "4.8 years",
      source: { document: "Half-Year Results", page: "Pg 30" },
    },
    varianceTable: [
      {
        metric: "NAV per Share",
        actual: "342p",
        comparison: "331p",
        comparisonLabel: "Jun 2025",
        delta: "+3.2%",
        direction: "positive",
        source: { document: "Half-Year Results", page: "Pg 2" },
      },
      {
        metric: "NAV Total Return",
        actual: "12.8%",
        comparison: "8-10%",
        comparisonLabel: "Target",
        delta: "Above range",
        direction: "positive",
        source: { document: "Half-Year Results", page: "Pg 2" },
      },
      {
        metric: "Portfolio Revenue",
        actual: "+8% YoY",
        comparison: "+5% YoY",
        comparisonLabel: "H1 FY25",
        delta: "+300bps",
        direction: "positive",
        source: { document: "Half-Year Results", page: "Pg 12" },
      },
      {
        metric: "Portfolio EBITDA",
        actual: "+10% YoY",
        comparison: "+7% YoY",
        comparisonLabel: "H1 FY25",
        delta: "+300bps",
        direction: "positive",
        source: { document: "Half-Year Results", page: "Pg 12" },
      },
      {
        metric: "Realizations",
        actual: "£130M",
        comparison: "£95M",
        comparisonLabel: "H1 FY25",
        delta: "+£35M",
        direction: "positive",
        source: { document: "Half-Year Results", page: "Pg 8" },
      },
      {
        metric: "TER",
        actual: "1.68%",
        comparison: "1.72%",
        comparisonLabel: "H1 FY25",
        delta: "-4bps",
        direction: "positive",
        source: { document: "Half-Year Results", page: "Pg 18" },
      },
    ],
    sectorExposure: [
      { sector: "Energy & Power", aum: "28%", pct: 28, color: "#10b981" },
      { sector: "Transport", aum: "24%", pct: 24, color: "#f59e0b" },
      { sector: "Digital Infrastructure", aum: "18%", pct: 18, color: "#3b82f6" },
      { sector: "Waste", aum: "15%", pct: 15, color: "#64748b" },
      { sector: "Other", aum: "15%", pct: 15, color: "#71717a" },
    ],
    assetAllocation: {
      priorPeriodLabel: "H1 FY25",
      currentPeriodLabel: "H1 FY26",
      rows: [
        { segment: "European Utilities", priorAum: "£880M", currentAum: "£960M", yoyGrowth: "+9%", yoyDirection: "up", pctOfTotal: "28%", note: "Largest" },
        { segment: "Transport & Logistics", priorAum: "£760M", currentAum: "£830M", yoyGrowth: "+9%", yoyDirection: "up", pctOfTotal: "24%", note: null },
        { segment: "Telecoms & Digital", priorAum: "£580M", currentAum: "£650M", yoyGrowth: "+12%", yoyDirection: "up", pctOfTotal: "19%", note: "Fastest Growing" },
        { segment: "Projects & PPP", priorAum: "£440M", currentAum: "£480M", yoyGrowth: "+9%", yoyDirection: "up", pctOfTotal: "14%", note: null },
        { segment: "Cash & Commitments", priorAum: "£300M", currentAum: "£340M", yoyGrowth: "+13%", yoyDirection: "up", pctOfTotal: "10%", note: null },
        { segment: "Other", priorAum: "£150M", currentAum: "£140M", yoyGrowth: "-7%", yoyDirection: "down", pctOfTotal: "4%", note: null },
        { segment: "TOTAL NAV", priorAum: "£3,110M", currentAum: "£3,400M", yoyGrowth: "+9%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "Half-Year Results", page: "Pg 4" },
    },
    infraVitals: {
      quarterLabel: "H1 FY26",
      fullYearLabel: "FY26 Annualized",
      rows: [
        { metric: "NAV Total Return", quarterly: "+6.4%", fullYear: "+12.8% (ann.)", insight: "Above Target. Outperforming the 8-10% target range, driven by portfolio companies' organic revenue growth." },
        { metric: "Realizations", quarterly: "£130M", fullYear: "£250M (ann.)", insight: "Active Rotation. Selective disposals at premium-to-NAV valuations, recycling capital into higher-growth opportunities." },
        { metric: "Dividend Growth", quarterly: "5.6625p (H1)", fullYear: "11.325p target", insight: "Progressive Policy. +6.4% YoY increase, underpinned by strong portfolio cash generation and inflation linkage." },
        { metric: "Portfolio Revenue Growth", quarterly: "+8% YoY", fullYear: "+8% YoY", insight: "Resilient. All portfolio companies delivering organic revenue growth above inflation, with 65% of revenues inflation-linked." },
      ],
      source: { document: "Half-Year Results", page: "Pg 2" },
    },
    keyQuote: {
      speaker: "Richard Laing",
      role: "Chairman, 3i Infrastructure",
      text: "European mid-market infrastructure continues to offer attractive risk-adjusted returns. Our portfolio of essential-service businesses has demonstrated resilient operational performance throughout 2025.",
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
    primaryDriver: "Record Capital Raising",
    thematicFocus: ["Energy Transition", "Digital Infrastructure", "Transport"],
    capitalActivity: {
      inflows: "$28B",
      deployed: "$15B",
      realizations: "$8B",
      source: { document: "Q4 Earnings Release", page: "Pg 3" },
    },
    scale: {
      totalAum: "$1.05T",
      infraAum: "$198B",
      infraAumGrowthYoy: "+10% YoY",
      dryPowder: "$52B",
      infraDryPowder: "$22B",
      source: { document: "Q4 Supplemental", page: "Pg 4" },
    },
    economics: {
      managementFees: "$2.2B",
      feeRelatedEarnings: "$867M",
      freMargin: "58%",
      realizedPerformanceRevenue: "$310M",
      distributableEarnings: "$1.18B",
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
        metric: "FRE",
        actual: "$867M",
        comparison: "$680M",
        comparisonLabel: "FY 2024",
        delta: "+28% YoY",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Capital Raised",
        actual: "$112B",
        comparison: "$93B",
        comparisonLabel: "FY 2024",
        delta: "+$19B",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 3" },
      },
      {
        metric: "Infra AUM",
        actual: "$198B",
        comparison: "$180B",
        comparisonLabel: "Q4 2024",
        delta: "+10% YoY",
        direction: "positive",
        source: { document: "Q4 Supplemental", page: "Pg 4" },
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
        { segment: "Infrastructure", priorAum: "$180B", currentAum: "$198B", yoyGrowth: "+10%", yoyDirection: "up", pctOfTotal: "19%", note: "Houses Infra Equity" },
        { segment: "Private Equity", priorAum: "$165B", currentAum: "$175B", yoyGrowth: "+6%", yoyDirection: "up", pctOfTotal: "17%", note: null },
        { segment: "Renewable Power & Transition", priorAum: "$100B", currentAum: "$110B", yoyGrowth: "+10%", yoyDirection: "up", pctOfTotal: "10%", note: null },
        { segment: "TOTAL", priorAum: "$950B", currentAum: "$1,053B", yoyGrowth: "+11%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "Q4 Supplemental", page: "Pg 4" },
    },
    infraVitals: {
      quarterLabel: "Q4 2025",
      fullYearLabel: "Full Year 2025",
      rows: [
        { metric: "FFO Growth (BIP)", quarterly: "+12%", fullYear: "+18% YoY", insight: "Strong operational performance. Utilities and transport portfolios delivering organic FFO growth above targets." },
        { metric: "Capital Raised", quarterly: "$28B", fullYear: "$112B (record)", insight: "Record Year. Largest annual fundraise in firm history; institutional and retail demand across all infrastructure strategies." },
        { metric: "FRE", quarterly: "$220M", fullYear: "$867M", insight: "+28% YoY. Driven by scaling AUM base and disciplined cost management across the asset-light manager platform." },
        { metric: "Capital Deployed (Infra)", quarterly: "$15B", fullYear: "$50B", insight: "Active Deployment. Major investments across energy transition, data centers, and global transport infrastructure." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Bruce Flatt",
      role: "CEO, Brookfield",
      text: "2025 was a record year for Brookfield. We raised $112 billion of capital and deployed at scale across infrastructure, renewable power, and credit strategies.",
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
    primaryDriver: "Record Fundraising ($129B)",
    thematicFocus: ["Digital Infrastructure", "Energy Transition", "Transport"],
    capitalActivity: {
      inflows: "$8B",
      deployed: "$4B",
      realizations: "$2B",
      source: { document: "Earnings Release", page: "Pg 5" },
    },
    scale: {
      totalAum: "$704B",
      infraAum: "$86B",
      infraAumGrowthYoy: "+10% YoY",
      dryPowder: "$48B",
      infraDryPowder: "$14B",
      source: { document: "4Q25 Supplement", page: "Pg 3" },
    },
    economics: {
      managementFees: "$958M",
      feeRelatedEarnings: "$640M",
      freMargin: "67%",
      realizedPerformanceRevenue: "$420M",
      distributableEarnings: "$1.06B",
      source: { document: "Earnings Release", page: "Pg 1" },
    },
    perpetualFunds: [
      {
        name: "Global Infrastructure Strategy",
        aum: "$86B",
        totalReturn: "+15.2% (FY)",
        yieldPct: "5.2%",
        appreciationPct: "10.0%",
        netFlows: "+$8B",
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
        actual: "$704B",
        comparison: "$624B",
        comparisonLabel: "Q4 2024",
        delta: "+13% YoY",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Annual Fundraising",
        actual: "$129B",
        comparison: "$100B",
        comparisonLabel: "FY 2024",
        delta: "+$29B (record)",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 5" },
      },
      {
        metric: "FRE",
        actual: "$640M",
        comparison: "$580M",
        comparisonLabel: "Q4 2024",
        delta: "+10%",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Adj. Net Income/Share",
        actual: "$1.57",
        comparison: "$1.32",
        comparisonLabel: "Q4 2024",
        delta: "+19%",
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
        { segment: "Credit & Liquid Strategies", priorAum: "$240B", currentAum: "$290B", yoyGrowth: "+21%", yoyDirection: "up", pctOfTotal: "41%", note: "Fastest Growing" },
        { segment: "Private Equity", priorAum: "$185B", currentAum: "$195B", yoyGrowth: "+5%", yoyDirection: "up", pctOfTotal: "28%", note: "Largest" },
        { segment: "Real Assets", priorAum: "$125B", currentAum: "$140B", yoyGrowth: "+12%", yoyDirection: "up", pctOfTotal: "20%", note: "Houses Infrastructure" },
        { segment: "Strategic Holdings & Other", priorAum: "$74B", currentAum: "$79B", yoyGrowth: "+7%", yoyDirection: "up", pctOfTotal: "11%", note: null },
        { segment: "TOTAL", priorAum: "$624B", currentAum: "$704B", yoyGrowth: "+13%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "4Q25 Supplement", page: "Pg 3" },
    },
    infraVitals: {
      quarterLabel: "Q4 2025",
      fullYearLabel: "Full Year 2025",
      rows: [
        { metric: "Capital Raised (Infra)", quarterly: "$8B", fullYear: "$32B", insight: "Record Fundraising. Global Infrastructure IV fully deployed; successor fund raising with strong institutional demand." },
        { metric: "Asset Performance", quarterly: "+6.5%", fullYear: "+15.2%", insight: "Strong Returns. Portfolio benefiting from data center demand, energy transition, and transport infrastructure tailwinds." },
        { metric: "Capital Deployed (Infra)", quarterly: "$4B", fullYear: "$15B", insight: "Active Pacing. Focused on digital infrastructure, fiber networks, and renewable energy development." },
        { metric: "Realizations", quarterly: "$2B", fullYear: "$8B", insight: "Healthy Exits. Selective realizations at premium multiples demonstrating embedded value creation across the portfolio." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Scott Nuttall",
      role: "Co-CEO, KKR",
      text: "We raised a record $129 billion in 2025. Infrastructure continues to be a cornerstone strategy, with massive capital needs in digital, energy transition, and transport.",
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
    primaryDriver: "AUM Surged 29% to $622.5B",
    thematicFocus: ["Energy Transition", "Digital Infrastructure"],
    capitalActivity: {
      inflows: "$2.5B",
      deployed: "$3.2B",
      realizations: "$1.8B",
      source: { document: "Earnings Release", page: "Pg 4" },
    },
    scale: {
      totalAum: "$622.5B",
      infraAum: "$45B",
      infraAumGrowthYoy: "+36% YoY",
      dryPowder: "$38B",
      infraDryPowder: "$8B",
      source: { document: "4Q25 Supplement", page: "Pg 3" },
    },
    economics: {
      managementFees: "$820M",
      feeRelatedEarnings: "$345M",
      freMargin: "42%",
      realizedPerformanceRevenue: "$95M",
      distributableEarnings: "$440M",
      source: { document: "Earnings Release", page: "Pg 1" },
    },
    perpetualFunds: [],
    closedEndFunds: [
      {
        name: "Ares Infrastructure & Power Fund",
        vintage: "2023",
        size: "$3.5B",
        netIrr: "n/m",
        dpi: "0.1x",
        source: { document: "4Q25 Supplement", page: "Pg 18" },
      },
      {
        name: "Ares Climate Infrastructure Partners",
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
        metric: "Q4 EPS",
        actual: "$1.45",
        comparison: "$1.70",
        comparisonLabel: "Consensus",
        delta: "-$0.25",
        direction: "negative",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Infra AUM",
        actual: "$45B",
        comparison: "$33B",
        comparisonLabel: "Q4 2024",
        delta: "+36% YoY",
        direction: "positive",
        source: { document: "4Q25 Supplement", page: "Pg 3" },
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
        { segment: "Real Assets Group", priorAum: "$66B", currentAum: "$82B", yoyGrowth: "+24%", yoyDirection: "up", pctOfTotal: "13%", note: "Houses Infrastructure" },
        { segment: "Private Equity Group", priorAum: "$48B", currentAum: "$57B", yoyGrowth: "+19%", yoyDirection: "up", pctOfTotal: "9%", note: null },
        { segment: "Secondaries Group", priorAum: "$30B", currentAum: "$44B", yoyGrowth: "+47%", yoyDirection: "up", pctOfTotal: "7%", note: "Fastest Growing" },
        { segment: "Other", priorAum: "$30B", currentAum: "$19.5B", yoyGrowth: "-35%", yoyDirection: "down", pctOfTotal: "3%", note: null },
        { segment: "TOTAL", priorAum: "$484B", currentAum: "$622.5B", yoyGrowth: "+29%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "4Q25 Supplement", page: "Pg 3" },
    },
    infraVitals: {
      quarterLabel: "Q4 2025",
      fullYearLabel: "Full Year 2025",
      rows: [
        { metric: "AUM Growth (Real Assets)", quarterly: "+$4B", fullYear: "+24% YoY", insight: "Rapid Scaling. Infrastructure and power strategy gaining significant institutional traction in energy transition." },
        { metric: "Capital Raised (Infra)", quarterly: "$2.5B", fullYear: "$12B", insight: "Strong Inflows. Ares Climate Infrastructure Partners and Infrastructure & Power Fund driving fundraising momentum." },
        { metric: "Q4 EPS", quarterly: "$1.45", fullYear: "$5.20", insight: "Below Consensus. Q4 missed the $1.70 estimate due to lower-than-expected performance income realization." },
        { metric: "FRE Margin", quarterly: "42%", fullYear: "43%", insight: "Expanding. Fee-related earnings benefiting from AUM scale and operating leverage across the platform." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Michael Arougheti",
      role: "CEO, Ares Management",
      text: "Our AUM surged 29% to $622 billion in 2025. Real Assets, including our growing infrastructure platform, is becoming a major growth engine alongside our dominant credit franchise.",
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
    primaryDriver: "AUM Surpassed $300B; FRE +72%",
    thematicFocus: ["Energy Transition", "Renewables & Energy"],
    capitalActivity: {
      inflows: "$6B",
      deployed: "$3B",
      realizations: "$1.5B",
      source: { document: "Earnings Release", page: "Pg 3" },
    },
    scale: {
      totalAum: "$300B",
      infraAum: "$35B",
      infraAumGrowthYoy: "+30% YoY",
      dryPowder: "$22B",
      infraDryPowder: "$6B",
      source: { document: "4Q25 Supplement", page: "Pg 2" },
    },
    economics: {
      managementFees: "$480M",
      feeRelatedEarnings: "$120M",
      freMargin: "52%",
      realizedPerformanceRevenue: "$85M",
      distributableEarnings: "$205M",
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
        actual: "$300B",
        comparison: "$239B",
        comparisonLabel: "Q4 2024",
        delta: "+26% YoY",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "FRE (Q4)",
        actual: "$120M",
        comparison: "$70M",
        comparisonLabel: "Q4 2024",
        delta: "+72%",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Annual Fundraising",
        actual: "$25B",
        comparison: "$18B",
        comparisonLabel: "FY 2024",
        delta: "+$7B",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 3" },
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
        { segment: "AG / Credit", priorAum: "$54B", currentAum: "$72B", yoyGrowth: "+33%", yoyDirection: "up", pctOfTotal: "24%", note: "Fastest Growing" },
        { segment: "Market Solutions", priorAum: "$48B", currentAum: "$58B", yoyGrowth: "+21%", yoyDirection: "up", pctOfTotal: "19%", note: null },
        { segment: "Impact (Rise / Rise Climate)", priorAum: "$32B", currentAum: "$42B", yoyGrowth: "+31%", yoyDirection: "up", pctOfTotal: "14%", note: "Houses Infrastructure" },
        { segment: "Real Estate", priorAum: "$22B", currentAum: "$28B", yoyGrowth: "+27%", yoyDirection: "up", pctOfTotal: "9%", note: null },
        { segment: "Growth", priorAum: "$18B", currentAum: "$22B", yoyGrowth: "+22%", yoyDirection: "up", pctOfTotal: "7%", note: null },
        { segment: "TOTAL", priorAum: "$239B", currentAum: "$300B", yoyGrowth: "+26%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "4Q25 Supplement", page: "Pg 2" },
    },
    infraVitals: {
      quarterLabel: "Q4 2025",
      fullYearLabel: "Full Year 2025",
      rows: [
        { metric: "FRE Growth", quarterly: "$120M", fullYear: "$420M (+72% YoY)", insight: "Breakout Year. Fee-related earnings nearly doubled, driven by scaling AUM and management fee base across Rise Climate." },
        { metric: "Rise Climate AUM", quarterly: "$18B", fullYear: "+30% YoY", insight: "Energy Transition Focus. Flagship climate infrastructure strategy attracting global institutional demand for decarbonization." },
        { metric: "Capital Deployed (Infra)", quarterly: "$3B", fullYear: "$10B", insight: "Active Deployment. Focus on renewable energy, grid modernization, and sustainable transport infrastructure." },
        { metric: "Fundraising", quarterly: "$6B", fullYear: "$25B (record)", insight: "Record Year. Broad-based growth across all platforms, with Rise Climate III actively in market." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Jon Winkelried",
      role: "CEO, TPG",
      text: "TPG surpassed $300 billion in AUM. Rise Climate is a signature franchise—the energy transition is creating a once-in-a-generation investment opportunity.",
    },
  },

  // ─── StepStone Group ───────────────────────────────────────
  // Reported Fiscal Q3 FY2026 (Dec 2025 quarter) on Feb 5, 2026
  {
    companyId: "stepstone",
    quarter: "Q4 2025",
    reportDate: "2026-02-05T12:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "earnings_release",
        label: "Q3 FY2026 Earnings Release",
        url: "https://www.stocktitan.net/news/STEP/step-stone-group-reports-third-quarter-fiscal-year-2026-pez1vfq0xmvw.html",
        date: "2026-02-05",
      },
      {
        type: "supplement",
        label: "Q3 FY2026 Supplement",
        url: "https://ir.stepstonegroup.com/financial-information/quarterly-results",
        date: "2026-02-05",
      },
      {
        type: "transcript",
        label: "Q3 FY2026 Earnings Call Transcript",
        url: "https://www.fool.com/earnings/call-transcripts/2026/02/05/stepstone-step-q3-fy2026-earnings-call-transcript/",
        date: "2026-02-05",
      },
    ],
    primaryDriver: "Infrastructure Allocations Accelerating",
    thematicFocus: ["Energy Transition", "Digital Infrastructure"],
    capitalActivity: {
      inflows: "$2B",
      deployed: "$1.5B",
      realizations: "$0.8B",
      source: { document: "Q3 FY26 Release", page: "Pg 3" },
    },
    scale: {
      totalAum: "$192B",
      infraAum: "$48B",
      infraAumGrowthYoy: "+14% YoY",
      dryPowder: "$18B",
      infraDryPowder: "$5B",
      source: { document: "Q3 FY26 Supplement", page: "Pg 2" },
    },
    economics: {
      managementFees: "$185M",
      feeRelatedEarnings: "$72M",
      freMargin: "39%",
      realizedPerformanceRevenue: "$28M",
      distributableEarnings: "$100M",
      source: { document: "Earnings Release", page: "Pg 1" },
    },
    perpetualFunds: [],
    closedEndFunds: [
      {
        name: "StepStone Infra Fund (Fund-of-Funds)",
        vintage: "2023",
        size: "$4.2B",
        netIrr: "n/m",
        dpi: "0.1x",
        source: { document: "Q3 FY26 Supplement", page: "Pg 10" },
      },
    ],
    operationalVitalSigns: {
      dataCenters: null,
      energy: null,
    },
    riskDashboard: null,
    varianceTable: [
      {
        metric: "Total AUM",
        actual: "$192B",
        comparison: "$170B",
        comparisonLabel: "Q3 FY25",
        delta: "+13% YoY",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Infra AUM",
        actual: "$48B",
        comparison: "$42B",
        comparisonLabel: "Q3 FY25",
        delta: "+14% YoY",
        direction: "positive",
        source: { document: "Q3 FY26 Supplement", page: "Pg 2" },
      },
      {
        metric: "Management Fees",
        actual: "$185M",
        comparison: "$162M",
        comparisonLabel: "Q3 FY25",
        delta: "+14%",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
    ],
    sectorExposure: [
      { sector: "Energy & Power", aum: "$16B", pct: 33, color: "#10b981" },
      { sector: "Transport", aum: "$12B", pct: 25, color: "#f59e0b" },
      { sector: "Digital Infrastructure", aum: "$8B", pct: 17, color: "#3b82f6" },
      { sector: "Renewables & Energy", aum: "$7B", pct: 15, color: "#22c55e" },
      { sector: "Other", aum: "$5B", pct: 10, color: "#71717a" },
    ],
    assetAllocation: {
      priorPeriodLabel: "Q3 FY25",
      currentPeriodLabel: "Q3 FY26",
      rows: [
        { segment: "Private Equity", priorAum: "$70B", currentAum: "$75B", yoyGrowth: "+7%", yoyDirection: "up", pctOfTotal: "39%", note: "Largest" },
        { segment: "Infrastructure", priorAum: "$42B", currentAum: "$48B", yoyGrowth: "+14%", yoyDirection: "up", pctOfTotal: "25%", note: "Fastest Growing" },
        { segment: "Private Debt", priorAum: "$28B", currentAum: "$32B", yoyGrowth: "+14%", yoyDirection: "up", pctOfTotal: "17%", note: null },
        { segment: "Real Estate", priorAum: "$25B", currentAum: "$26B", yoyGrowth: "+4%", yoyDirection: "up", pctOfTotal: "14%", note: null },
        { segment: "Other / Advisory", priorAum: "$5B", currentAum: "$11B", yoyGrowth: "+120%", yoyDirection: "up", pctOfTotal: "6%", note: null },
        { segment: "TOTAL", priorAum: "$170B", currentAum: "$192B", yoyGrowth: "+13%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "Q3 FY26 Supplement", page: "Pg 2" },
    },
    infraVitals: {
      quarterLabel: "Q3 FY26",
      fullYearLabel: "FY26 Run-Rate",
      rows: [
        { metric: "AUM Growth (Infra)", quarterly: "+$2B", fullYear: "+14% YoY", insight: "Leading Allocator. Institutional clients increasing infrastructure allocation targets, driving advisory mandates." },
        { metric: "Advisory Revenue (Infra)", quarterly: "$35M", fullYear: "$130M (ann.)", insight: "Scaling Fees. Infrastructure advisory and co-investment fees growing as LP demand for the asset class increases." },
        { metric: "New Mandates", quarterly: "8 new", fullYear: "25 (ann.)", insight: "Broad Demand. Pension funds, endowments, and sovereign wealth funds expanding dedicated infrastructure programs." },
        { metric: "Secondaries Volume", quarterly: "$1.5B", fullYear: "$5B (ann.)", insight: "Growing Market. Infrastructure secondaries emerging as a key liquidity tool for LPs seeking portfolio rebalancing." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Scott Hart",
      role: "CEO, StepStone Group",
      text: "Infrastructure is our fastest-growing allocation class. LP demand for infrastructure secondaries, co-investments, and advisory is accelerating across every client segment.",
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
    primaryDriver: "Record FRE + SRE of $5.9B",
    thematicFocus: ["Energy Transition", "Digital Infrastructure"],
    capitalActivity: {
      inflows: "$5B",
      deployed: "$4B",
      realizations: "$2.5B",
      source: { document: "Earnings Release", page: "Pg 4" },
    },
    scale: {
      totalAum: "$938B",
      infraAum: "$75B",
      infraAumGrowthYoy: "+29% YoY",
      dryPowder: "$62B",
      infraDryPowder: "$12B",
      source: { document: "4Q25 Supplement", page: "Pg 3" },
    },
    economics: {
      managementFees: "$1.90B",
      feeRelatedEarnings: "$580M",
      freMargin: "72%",
      realizedPerformanceRevenue: "$285M",
      distributableEarnings: "$865M",
      source: { document: "Earnings Release", page: "Pg 1" },
    },
    perpetualFunds: [
      {
        name: "Apollo Clean Energy Commerce",
        aum: "$40B",
        totalReturn: "+12.5% (FY)",
        yieldPct: "6.2%",
        appreciationPct: "6.3%",
        netFlows: "+$5B",
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
        comparison: "$733B",
        comparisonLabel: "Q4 2024",
        delta: "+28% YoY",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "FRE + SRE",
        actual: "$5.9B",
        comparison: "$4.8B",
        comparisonLabel: "FY 2024",
        delta: "+23% (record)",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Infra AUM",
        actual: "$75B",
        comparison: "$58B",
        comparisonLabel: "Q4 2024",
        delta: "+29% YoY",
        direction: "positive",
        source: { document: "4Q25 Supplement", page: "Pg 3" },
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
        { segment: "Real Assets & Other", priorAum: "—", currentAum: "$70B", yoyGrowth: "—", yoyDirection: "up", pctOfTotal: "7%", note: null },
        { segment: "TOTAL", priorAum: "$733B", currentAum: "$938B", yoyGrowth: "+28%", yoyDirection: "up", pctOfTotal: "100%", note: null, isTotal: true },
      ],
      source: { document: "4Q25 Supplement", page: "Pg 3" },
    },
    infraVitals: {
      quarterLabel: "Q4 2025",
      fullYearLabel: "Full Year 2025",
      rows: [
        { metric: "FRE + SRE (Combined)", quarterly: "$1.5B", fullYear: "$5.9B (record)", insight: "Record Year. Combined fee-related and spread-related earnings hit all-time high, driven by Athene scale and platform growth." },
        { metric: "Clean Energy Platform", quarterly: "$40B AUM", fullYear: "+35% YoY", insight: "Scaling Rapidly. Apollo Clean Energy Commerce expanding across data center power, grid modernization, and energy transition." },
        { metric: "Capital Deployed (Infra)", quarterly: "$4B", fullYear: "$18B", insight: "Aggressive Deployment. Focus on energy transition infrastructure, digital, and midstream assets." },
        { metric: "Athene Insurance AUM", quarterly: "$550B+", fullYear: "+20% YoY", insight: "Flywheel Effect. Retirement services providing permanent capital base for long-duration infrastructure credit investments." },
      ],
      source: { document: "Earnings Release & Transcript", page: null },
    },
    keyQuote: {
      speaker: "Marc Rowan",
      role: "CEO, Apollo",
      text: "Apollo delivered record combined FRE and SRE of $5.9 billion. Our clean energy platform and infrastructure credit capabilities are uniquely positioned for the energy transition.",
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
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr);
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
