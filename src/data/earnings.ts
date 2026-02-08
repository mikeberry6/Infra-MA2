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
    infraAum: 62,
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
  {
    companyId: "blackstone",
    quarter: "Q4 2025",
    reportDate: "2026-02-06T12:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "earnings_release",
        label: "Q4 2025 Earnings Release",
        url: "https://www.blackstone.com/wp-content/uploads/sites/2/2026/01/Blackstone4Q25EarningsPressRelease.pdf",
        date: "2026-02-06",
      },
      {
        type: "supplement",
        label: "4Q25 Earnings Supplement",
        url: "https://www.blackstone.com/wp-content/uploads/sites/2/2026/01/Blackstone4Q25EarningsSupplement.pdf",
        date: "2026-02-06",
      },
      {
        type: "transcript",
        label: "Q4 2025 Earnings Call Transcript",
        url: "https://www.fool.com/earnings/call-transcripts/2026/01/29/blackstone-bx-q4-2025-earnings-call-transcript/",
        date: "2026-02-06",
      },
      {
        type: "10k",
        label: "2025 10-K (pending)",
        url: "https://ir.blackstone.com/financial-information/sec-filings",
        date: null,
      },
    ],
    scale: {
      totalAum: "$1.13T",
      infraAum: "$62B",
      infraAumGrowthYoy: "+15% YoY",
      dryPowder: "$40B",
      infraDryPowder: "$24B",
      source: { document: "4Q25 Supplement", page: "Pg 3" },
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
        name: "BXINFRA (Perpetual Vehicle)",
        aum: "$18.0B",
        totalReturn: "10.2%",
        yieldPct: "5.1%",
        appreciationPct: "5.1%",
        netFlows: "+$3.8B",
        source: { document: "4Q25 Supplement", page: "Pg 8" },
      },
    ],
    closedEndFunds: [
      {
        name: "BIP II",
        vintage: "2023",
        size: "$12.4B",
        netIrr: "14%",
        dpi: "0.3x",
        source: { document: "4Q25 Supplement", page: "Pg 12" },
      },
      {
        name: "BIP I",
        vintage: "2019",
        size: "$8.5B",
        netIrr: "18%",
        dpi: "1.2x",
        source: { document: "4Q25 Supplement", page: "Pg 12" },
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
        metric: "Infra AUM",
        actual: "$62.0B",
        comparison: "$58.2B",
        comparisonLabel: "Consensus",
        delta: "+$3.8B",
        direction: "positive",
        source: { document: "4Q25 Supplement", page: "Pg 3" },
      },
      {
        metric: "FRE",
        actual: "$1.24B",
        comparison: "$1.18B",
        comparisonLabel: "Consensus",
        delta: "+$60M",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "FRE Margin",
        actual: "68.0%",
        comparison: "66.1%",
        comparisonLabel: "Consensus",
        delta: "+190bps",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 1" },
      },
      {
        metric: "Infra Deployment",
        actual: "$11.6B",
        comparison: "$9.5B",
        comparisonLabel: "Q4 2024",
        delta: "+$2.1B",
        direction: "positive",
        source: { document: "4Q25 Supplement", page: "Pg 8" },
      },
      {
        metric: "Infra Realizations",
        actual: "$8.4B",
        comparison: "$7.0B",
        comparisonLabel: "Q4 2024",
        delta: "+$1.4B",
        direction: "positive",
        source: { document: "4Q25 Supplement", page: "Pg 12" },
      },
      {
        metric: "DE per Share",
        actual: "$1.41",
        comparison: "$1.35",
        comparisonLabel: "Consensus",
        delta: "+$0.06",
        direction: "positive",
        source: { document: "Earnings Release", page: "Pg 2" },
      },
    ],
    sectorExposure: [
      { sector: "Energy & Power", aum: "$22B", pct: 36, color: "#10b981" },
      { sector: "Digital Infrastructure", aum: "$18B", pct: 29, color: "#3b82f6" },
      { sector: "Transport", aum: "$14B", pct: 23, color: "#f59e0b" },
      { sector: "Water & Waste", aum: "$8B", pct: 13, color: "#06b6d4" },
    ],
    keyQuote: {
      speaker: "Steve Schwarzman",
      role: "Chairman & CEO, Blackstone",
      text: "Infrastructure is the single biggest deployment opportunity we see globally. The convergence of AI-driven data center demand, energy security imperatives, and aging infrastructure creates a generational investment backdrop.",
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
    keyQuote: {
      speaker: "Richard Laing",
      role: "Chairman, 3i Infrastructure",
      text: "European mid-market infrastructure continues to offer attractive risk-adjusted returns. Our portfolio of essential-service businesses has demonstrated resilient operational performance throughout 2025.",
    },
  },

  // ─── UPCOMING (not yet reported) ──────────────────────────

  {
    companyId: "brookfield",
    quarter: "Q4 2025",
    reportDate: null,
    expectedDate: "2026-02-12T12:00:00Z",
    sources: [],
    scale: null,
    economics: null,
    perpetualFunds: [],
    closedEndFunds: [],
    operationalVitalSigns: null,
    riskDashboard: null,
    varianceTable: [],
    sectorExposure: [],
    keyQuote: null,
  },
  {
    companyId: "apollo",
    quarter: "Q4 2025",
    reportDate: null,
    expectedDate: "2026-02-13T12:00:00Z",
    sources: [],
    scale: null,
    economics: null,
    perpetualFunds: [],
    closedEndFunds: [],
    operationalVitalSigns: null,
    riskDashboard: null,
    varianceTable: [],
    sectorExposure: [],
    keyQuote: null,
  },
  {
    companyId: "kkr",
    quarter: "Q4 2025",
    reportDate: null,
    expectedDate: "2026-02-18T12:00:00Z",
    sources: [],
    scale: null,
    economics: null,
    perpetualFunds: [],
    closedEndFunds: [],
    operationalVitalSigns: null,
    riskDashboard: null,
    varianceTable: [],
    sectorExposure: [],
    keyQuote: null,
  },
  {
    companyId: "ares",
    quarter: "Q4 2025",
    reportDate: null,
    expectedDate: "2026-02-20T12:00:00Z",
    sources: [],
    scale: null,
    economics: null,
    perpetualFunds: [],
    closedEndFunds: [],
    operationalVitalSigns: null,
    riskDashboard: null,
    varianceTable: [],
    sectorExposure: [],
    keyQuote: null,
  },
  {
    companyId: "tpg",
    quarter: "Q4 2025",
    reportDate: null,
    expectedDate: "2026-02-20T12:00:00Z",
    sources: [],
    scale: null,
    economics: null,
    perpetualFunds: [],
    closedEndFunds: [],
    operationalVitalSigns: null,
    riskDashboard: null,
    varianceTable: [],
    sectorExposure: [],
    keyQuote: null,
  },
  {
    companyId: "stepstone",
    quarter: "Q4 2025",
    reportDate: null,
    expectedDate: "2026-02-25T12:00:00Z",
    sources: [],
    scale: null,
    economics: null,
    perpetualFunds: [],
    closedEndFunds: [],
    operationalVitalSigns: null,
    riskDashboard: null,
    varianceTable: [],
    sectorExposure: [],
    keyQuote: null,
  },
  {
    companyId: "partners-group",
    quarter: "FY 2025",
    reportDate: null,
    expectedDate: "2026-03-04T06:00:00Z",
    sources: [],
    scale: null,
    economics: null,
    perpetualFunds: [],
    closedEndFunds: [],
    operationalVitalSigns: null,
    riskDashboard: null,
    varianceTable: [],
    sectorExposure: [],
    keyQuote: null,
  },
  {
    companyId: "swiss-life",
    quarter: "FY 2025",
    reportDate: null,
    expectedDate: "2026-03-13T06:00:00Z",
    sources: [],
    scale: null,
    economics: null,
    perpetualFunds: [],
    closedEndFunds: [],
    operationalVitalSigns: null,
    riskDashboard: null,
    varianceTable: [],
    sectorExposure: [],
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
