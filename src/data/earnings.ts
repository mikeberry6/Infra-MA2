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
  infraAum: number;        // billions USD
  totalAum: number;        // billions USD
  headquarters: string;
  reportingCurrency: string;
  website: string;
}

export interface QuarterlyEarning {
  companyId: string;
  quarter: string;
  reportDate: string;
  revenue: number;         // millions USD
  netIncome: number;       // millions USD
  eps: number;
  epsEstimate: number | null;
  feeRelatedEarnings: number | null;
  distributableEarnings: number | null;
  infraAum: number;        // billions USD
  totalAum: number;        // billions USD
  fundraising: number | null;   // billions USD
  deployment: number | null;    // billions USD
  dryPowder: number | null;     // billions USD
  keyHighlights: string[];
}

export interface UpcomingEarning {
  companyId: string;
  quarter: string;
  expectedDate: string;
  epsEstimate: number | null;
  revenueEstimate: number | null;  // millions
}

export interface CalendarEntry {
  companyId: string;
  companyName: string;
  ticker: string;
  quarter: string;
  date: string;
  isReported: boolean;
  epsSurprise: number | null;
  epsEstimate: number | null;
  eps: number | null;
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

// ─── Quarterly Earnings ────────────────────────────────────
// Companies that have reported Q4 2025: BlackRock, 3i Infrastructure, Macquarie, Blackstone
// Others: latest available is Q3 2025

export const quarterlyEarnings: QuarterlyEarning[] = [
  // ─── 3i Infrastructure ────────────────────────────────────
  {
    companyId: "3i-infrastructure",
    quarter: "Q1 2025",
    reportDate: "2025-05-15T06:00:00Z",
    revenue: 42,
    netIncome: 38,
    eps: 0.17,
    epsEstimate: 0.15,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 4.4,
    totalAum: 4.4,
    fundraising: null,
    deployment: 0.2,
    dryPowder: 0.4,
    keyHighlights: [
      "NAV per share increased 1.8% to 331p driven by portfolio income returns",
      "Completed refinancing of Infinis Energy credit facility at improved terms",
    ],
  },
  {
    companyId: "3i-infrastructure",
    quarter: "Q2 2025",
    reportDate: "2025-08-14T06:00:00Z",
    revenue: 48,
    netIncome: 43,
    eps: 0.19,
    epsEstimate: 0.17,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 4.5,
    totalAum: 4.5,
    fundraising: null,
    deployment: 0.3,
    dryPowder: 0.3,
    keyHighlights: [
      "NAV per share rose to 336p; total return of 4.1% for the half-year",
      "Acquired additional stake in TCR, an Australian airport ground support business",
    ],
  },
  {
    companyId: "3i-infrastructure",
    quarter: "Q3 2025",
    reportDate: "2025-11-13T06:00:00Z",
    revenue: 39,
    netIncome: 34,
    eps: 0.15,
    epsEstimate: 0.14,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 4.6,
    totalAum: 4.6,
    fundraising: null,
    deployment: 0.1,
    dryPowder: 0.3,
    keyHighlights: [
      "NAV per share of 338p reflecting steady portfolio performance",
      "Declared interim dividend of 5.875p per share, up 6% YoY",
    ],
  },
  {
    companyId: "3i-infrastructure",
    quarter: "Q4 2025",
    reportDate: "2026-01-23T06:00:00Z",
    revenue: 53,
    netIncome: 47,
    eps: 0.21,
    epsEstimate: 0.18,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 4.8,
    totalAum: 4.8,
    fundraising: null,
    deployment: 0.3,
    dryPowder: 0.2,
    keyHighlights: [
      "NAV per share increased 3.2% to 342p driven by strong operational performance across portfolio",
      "Full-year total return of 12.8% exceeded 8-10% target range",
    ],
  },

  // ─── Apollo Global Management ─────────────────────────────
  {
    companyId: "apollo",
    quarter: "Q1 2025",
    reportDate: "2025-05-02T11:00:00Z",
    revenue: 1520,
    netIncome: 680,
    eps: 2.12,
    epsEstimate: 1.98,
    feeRelatedEarnings: 490,
    distributableEarnings: 720,
    infraAum: 52,
    totalAum: 690,
    fundraising: 8.2,
    deployment: 6.1,
    dryPowder: 38,
    keyHighlights: [
      "Infrastructure origination volumes up 22% YoY driven by data center and energy transition financing",
      "Launched Apollo Clean Transition fund targeting $10B for energy infrastructure",
    ],
  },
  {
    companyId: "apollo",
    quarter: "Q2 2025",
    reportDate: "2025-08-05T11:00:00Z",
    revenue: 1610,
    netIncome: 720,
    eps: 2.24,
    epsEstimate: 2.15,
    feeRelatedEarnings: 510,
    distributableEarnings: 750,
    infraAum: 54,
    totalAum: 705,
    fundraising: 9.1,
    deployment: 7.3,
    dryPowder: 36,
    keyHighlights: [
      "Completed first close of Apollo Clean Transition fund at $5B",
      "Fee-related earnings grew 14% YoY reflecting management fee expansion",
    ],
  },
  {
    companyId: "apollo",
    quarter: "Q3 2025",
    reportDate: "2025-11-04T12:00:00Z",
    revenue: 1680,
    netIncome: 760,
    eps: 2.37,
    epsEstimate: 2.28,
    feeRelatedEarnings: 530,
    distributableEarnings: 770,
    infraAum: 56,
    totalAum: 720,
    fundraising: 7.8,
    deployment: 8.5,
    dryPowder: 34,
    keyHighlights: [
      "Infrastructure deployment accelerated 18% YoY with major digital and midstream transactions",
      "Total AUM crossed $720B for the first time on strong organic inflows",
    ],
  },

  // ─── Ares Management ──────────────────────────────────────
  {
    companyId: "ares",
    quarter: "Q1 2025",
    reportDate: "2025-05-06T11:00:00Z",
    revenue: 880,
    netIncome: 240,
    eps: 0.88,
    epsEstimate: 0.82,
    feeRelatedEarnings: 290,
    distributableEarnings: null,
    infraAum: 28,
    totalAum: 428,
    fundraising: 5.4,
    deployment: 3.8,
    dryPowder: 18,
    keyHighlights: [
      "Infrastructure & Power strategy AUM grew 28% YoY driven by climate infrastructure demand",
      "Closed Ares Climate Infrastructure Partners Fund I at $3.7B",
    ],
  },
  {
    companyId: "ares",
    quarter: "Q2 2025",
    reportDate: "2025-08-07T11:00:00Z",
    revenue: 940,
    netIncome: 260,
    eps: 0.95,
    epsEstimate: 0.90,
    feeRelatedEarnings: 310,
    distributableEarnings: null,
    infraAum: 30,
    totalAum: 442,
    fundraising: 6.2,
    deployment: 4.5,
    dryPowder: 17,
    keyHighlights: [
      "Expanded power infrastructure platform with two utility-scale solar acquisitions totaling 1.2 GW",
      "FRE margin expanded 120bps YoY to 42.8%",
    ],
  },
  {
    companyId: "ares",
    quarter: "Q3 2025",
    reportDate: "2025-11-06T12:00:00Z",
    revenue: 1010,
    netIncome: 290,
    eps: 1.06,
    epsEstimate: 0.98,
    feeRelatedEarnings: 330,
    distributableEarnings: null,
    infraAum: 32,
    totalAum: 455,
    fundraising: 5.8,
    deployment: 5.1,
    dryPowder: 16,
    keyHighlights: [
      "Record quarterly revenue of $1.01B driven by management fee growth across all strategies",
      "Infrastructure deployment pace doubled YoY with significant energy transition investments",
    ],
  },

  // ─── BlackRock ────────────────────────────────────────────
  {
    companyId: "blackrock",
    quarter: "Q1 2025",
    reportDate: "2025-04-11T11:00:00Z",
    revenue: 4900,
    netIncome: 1510,
    eps: 10.48,
    epsEstimate: 10.20,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 152,
    totalAum: 10800,
    fundraising: null,
    deployment: null,
    dryPowder: null,
    keyHighlights: [
      "GIP integration on track; combined infrastructure team now managing $152B across 45+ countries",
      "Net inflows of $236B, highest Q1 on record driven by ETF and private markets demand",
    ],
  },
  {
    companyId: "blackrock",
    quarter: "Q2 2025",
    reportDate: "2025-07-14T11:00:00Z",
    revenue: 5100,
    netIncome: 1580,
    eps: 10.96,
    epsEstimate: 10.75,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 160,
    totalAum: 11000,
    fundraising: null,
    deployment: null,
    dryPowder: null,
    keyHighlights: [
      "Infrastructure AUM grew to $160B on new capital commitments and portfolio appreciation",
      "Launched BlackRock Infrastructure Solutions series targeting mid-market digital infra",
    ],
  },
  {
    companyId: "blackrock",
    quarter: "Q3 2025",
    reportDate: "2025-10-13T11:00:00Z",
    revenue: 5200,
    netIncome: 1640,
    eps: 11.38,
    epsEstimate: 11.10,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 165,
    totalAum: 11300,
    fundraising: null,
    deployment: null,
    dryPowder: null,
    keyHighlights: [
      "Total AUM surpassed $11.3T for the first time; infrastructure platform contributed record fees",
      "Completed final close of GIP V successor fund at $15B",
    ],
  },
  {
    companyId: "blackrock",
    quarter: "Q4 2025",
    reportDate: "2026-01-15T12:00:00Z",
    revenue: 5370,
    netIncome: 1720,
    eps: 11.93,
    epsEstimate: 11.65,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 170,
    totalAum: 11550,
    fundraising: null,
    deployment: null,
    dryPowder: null,
    keyHighlights: [
      "GIP integration complete; infrastructure platform now $170B in AUM, making BlackRock the second-largest infra manager globally",
      "Record quarterly inflows of $281B driven by ETFs and private markets capital formation",
    ],
  },

  // ─── Blackstone ───────────────────────────────────────────
  {
    companyId: "blackstone",
    quarter: "Q1 2025",
    reportDate: "2025-04-17T11:00:00Z",
    revenue: 1880,
    netIncome: 820,
    eps: 0.98,
    epsEstimate: 0.94,
    feeRelatedEarnings: 1080,
    distributableEarnings: 1150,
    infraAum: 54,
    totalAum: 1050,
    fundraising: 10.2,
    deployment: 8.4,
    dryPowder: 45,
    keyHighlights: [
      "Infrastructure inflows of $3.2B led by BXINFRA perpetual vehicle and energy transition mandates",
      "Committed $1.8B to data center developments across North America and Europe",
    ],
  },
  {
    companyId: "blackstone",
    quarter: "Q2 2025",
    reportDate: "2025-07-17T11:00:00Z",
    revenue: 2010,
    netIncome: 890,
    eps: 1.06,
    epsEstimate: 1.02,
    feeRelatedEarnings: 1120,
    distributableEarnings: 1230,
    infraAum: 57,
    totalAum: 1080,
    fundraising: 11.5,
    deployment: 9.8,
    dryPowder: 43,
    keyHighlights: [
      "Closed $4.1B acquisition of AirTrunk, the largest Asia-Pacific data center platform",
      "Infrastructure AUM grew 18% YoY to $57B driven by secular digitalization tailwinds",
    ],
  },
  {
    companyId: "blackstone",
    quarter: "Q3 2025",
    reportDate: "2025-10-16T11:00:00Z",
    revenue: 2150,
    netIncome: 960,
    eps: 1.14,
    epsEstimate: 1.10,
    feeRelatedEarnings: 1180,
    distributableEarnings: 1310,
    infraAum: 59,
    totalAum: 1100,
    fundraising: 12.8,
    deployment: 10.5,
    dryPowder: 42,
    keyHighlights: [
      "Record total AUM of $1.1T; infrastructure represented fastest-growing segment at 22% YoY",
      "Deploying into energy security theme with $2.3B committed to LNG and pipeline infrastructure",
    ],
  },
  {
    companyId: "blackstone",
    quarter: "Q4 2025",
    reportDate: "2026-02-06T12:00:00Z",
    revenue: 2340,
    netIncome: 1020,
    eps: 1.21,
    epsEstimate: 1.17,
    feeRelatedEarnings: 1240,
    distributableEarnings: 1410,
    infraAum: 62,
    totalAum: 1130,
    fundraising: 14.2,
    deployment: 11.6,
    dryPowder: 40,
    keyHighlights: [
      "Infrastructure AUM grew 15% YoY to $62B; closed $4.2B in infrastructure co-investments during the quarter",
      "Full-year distributable earnings of $5.1B, up 21% YoY driven by realization activity and fee growth",
    ],
  },

  // ─── Brookfield Asset Management ──────────────────────────
  {
    companyId: "brookfield",
    quarter: "Q1 2025",
    reportDate: "2025-05-08T11:00:00Z",
    revenue: 1320,
    netIncome: 310,
    eps: 0.41,
    epsEstimate: 0.38,
    feeRelatedEarnings: 540,
    distributableEarnings: 510,
    infraAum: 180,
    totalAum: 970,
    fundraising: 15.0,
    deployment: 12.3,
    dryPowder: 48,
    keyHighlights: [
      "Infrastructure AUM of $180B, largest allocation across all Brookfield strategies",
      "Closed Brookfield Global Transition Fund II at $10B for decarbonization infrastructure",
    ],
  },
  {
    companyId: "brookfield",
    quarter: "Q2 2025",
    reportDate: "2025-08-07T11:00:00Z",
    revenue: 1410,
    netIncome: 340,
    eps: 0.45,
    epsEstimate: 0.42,
    feeRelatedEarnings: 570,
    distributableEarnings: 540,
    infraAum: 186,
    totalAum: 995,
    fundraising: 16.5,
    deployment: 14.1,
    dryPowder: 46,
    keyHighlights: [
      "Record fee-related earnings of $570M driven by infrastructure and renewable power strategies",
      "Completed acquisition of Origin Energy's energy markets business for A$18.7B alongside MidOcean",
    ],
  },
  {
    companyId: "brookfield",
    quarter: "Q3 2025",
    reportDate: "2025-11-06T12:00:00Z",
    revenue: 1480,
    netIncome: 370,
    eps: 0.49,
    epsEstimate: 0.46,
    feeRelatedEarnings: 600,
    distributableEarnings: 570,
    infraAum: 192,
    totalAum: 1020,
    fundraising: 18.0,
    deployment: 15.8,
    dryPowder: 44,
    keyHighlights: [
      "Infrastructure flagship fund (BIF VI) first close at $18B, on track for $30B target",
      "Total AUM surpassed $1T milestone; infrastructure remains largest and fastest-growing pillar",
    ],
  },

  // ─── KKR ──────────────────────────────────────────────────
  {
    companyId: "kkr",
    quarter: "Q1 2025",
    reportDate: "2025-05-01T11:00:00Z",
    revenue: 1380,
    netIncome: 620,
    eps: 1.09,
    epsEstimate: 1.02,
    feeRelatedEarnings: 680,
    distributableEarnings: 920,
    infraAum: 68,
    totalAum: 580,
    fundraising: 7.5,
    deployment: 6.8,
    dryPowder: 32,
    keyHighlights: [
      "Infrastructure AUM of $68B with strong pipeline in Asia-Pacific renewables and fiber",
      "Raised $5.2B for KKR Global Infrastructure Investors V in first two quarters of fundraising",
    ],
  },
  {
    companyId: "kkr",
    quarter: "Q2 2025",
    reportDate: "2025-07-31T11:00:00Z",
    revenue: 1480,
    netIncome: 680,
    eps: 1.19,
    epsEstimate: 1.12,
    feeRelatedEarnings: 720,
    distributableEarnings: 980,
    infraAum: 72,
    totalAum: 600,
    fundraising: 8.8,
    deployment: 7.5,
    dryPowder: 30,
    keyHighlights: [
      "Completed $6.2B take-private of Alinta Energy, Australia's largest integrated power company",
      "FRE grew 18% YoY reflecting fee base expansion across infrastructure and credit",
    ],
  },
  {
    companyId: "kkr",
    quarter: "Q3 2025",
    reportDate: "2025-10-30T12:00:00Z",
    revenue: 1560,
    netIncome: 730,
    eps: 1.28,
    epsEstimate: 1.20,
    feeRelatedEarnings: 750,
    distributableEarnings: 1020,
    infraAum: 75,
    totalAum: 612,
    fundraising: 9.2,
    deployment: 8.3,
    dryPowder: 28,
    keyHighlights: [
      "Infrastructure deployment velocity at record pace with $8.3B deployed across digital, transport, and energy",
      "KKR Global Infrastructure Investors V surpassed $12B, targeting $15B final close",
    ],
  },

  // ─── Macquarie Group ──────────────────────────────────────
  {
    companyId: "macquarie",
    quarter: "Q1 2025",
    reportDate: "2025-05-02T06:00:00Z",
    revenue: 2100,
    netIncome: 580,
    eps: 2.85,
    epsEstimate: 2.70,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 182,
    totalAum: 560,
    fundraising: 6.0,
    deployment: 5.5,
    dryPowder: 28,
    keyHighlights: [
      "Macquarie Asset Management infrastructure AUM steady at $182B with net positive flows",
      "Green energy investments comprised 38% of infrastructure deployment in the quarter",
    ],
  },
  {
    companyId: "macquarie",
    quarter: "Q2 2025",
    reportDate: "2025-07-18T06:00:00Z",
    revenue: 2250,
    netIncome: 620,
    eps: 3.05,
    epsEstimate: 2.90,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 186,
    totalAum: 572,
    fundraising: 7.2,
    deployment: 6.8,
    dryPowder: 26,
    keyHighlights: [
      "Closed final round of MEIF7 at A$8.5B, largest Australian-domiciled infrastructure fund",
      "Commodity and Global Markets division contributed A$1.8B to group profit from energy trading",
    ],
  },
  {
    companyId: "macquarie",
    quarter: "Q3 2025",
    reportDate: "2025-10-31T06:00:00Z",
    revenue: 2180,
    netIncome: 600,
    eps: 2.95,
    epsEstimate: 2.85,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 190,
    totalAum: 585,
    fundraising: 6.5,
    deployment: 6.2,
    dryPowder: 25,
    keyHighlights: [
      "Infrastructure AUM grew to $190B with particular strength in digital and renewables",
      "Completed sale of UK Green Investment Group portfolio at 1.4x MOIC",
    ],
  },
  {
    companyId: "macquarie",
    quarter: "Q4 2025",
    reportDate: "2026-01-30T06:00:00Z",
    revenue: 2380,
    netIncome: 660,
    eps: 3.25,
    epsEstimate: 3.10,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 195,
    totalAum: 600,
    fundraising: 8.0,
    deployment: 7.5,
    dryPowder: 24,
    keyHighlights: [
      "Macquarie Asset Management infra platform reached $195B in AUM, solidifying position as world's largest infra manager",
      "Green energy investments represented 42% of new deployment; full-year profit up 8% to A$3.52B",
    ],
  },

  // ─── Partners Group ───────────────────────────────────────
  {
    companyId: "partners-group",
    quarter: "Q1 2025",
    reportDate: "2025-05-13T06:00:00Z",
    revenue: 440,
    netIncome: 195,
    eps: 4.82,
    epsEstimate: 4.60,
    feeRelatedEarnings: 220,
    distributableEarnings: null,
    infraAum: 28,
    totalAum: 142,
    fundraising: 3.2,
    deployment: 2.8,
    dryPowder: 12,
    keyHighlights: [
      "Infrastructure commitments of CHF 2.4B in Q1 focused on European digital and energy assets",
      "Direct equity portfolio generated 14% gross return LTM, led by infra and renewables holdings",
    ],
  },
  {
    companyId: "partners-group",
    quarter: "Q2 2025",
    reportDate: "2025-09-02T06:00:00Z",
    revenue: 480,
    netIncome: 215,
    eps: 5.31,
    epsEstimate: 5.10,
    feeRelatedEarnings: 240,
    distributableEarnings: null,
    infraAum: 29,
    totalAum: 146,
    fundraising: 3.8,
    deployment: 3.2,
    dryPowder: 11,
    keyHighlights: [
      "Completed acquisition of Techem, a leading European energy services company, for €6.7B EV",
      "Management fees grew 12% YoY driven by infrastructure and private credit client mandates",
    ],
  },
  {
    companyId: "partners-group",
    quarter: "Q3 2025",
    reportDate: "2025-11-18T06:00:00Z",
    revenue: 460,
    netIncome: 205,
    eps: 5.06,
    epsEstimate: 4.90,
    feeRelatedEarnings: 230,
    distributableEarnings: null,
    infraAum: 31,
    totalAum: 149,
    fundraising: 3.5,
    deployment: 3.0,
    dryPowder: 10,
    keyHighlights: [
      "Infrastructure AUM grew to $31B; secured two new sovereign wealth fund mandates for infra",
      "Performance fees of CHF 180M driven by infrastructure and private equity realizations",
    ],
  },

  // ─── StepStone Group ──────────────────────────────────────
  {
    companyId: "stepstone",
    quarter: "Q1 2025",
    reportDate: "2025-05-22T11:00:00Z",
    revenue: 175,
    netIncome: 42,
    eps: 0.44,
    epsEstimate: 0.40,
    feeRelatedEarnings: 85,
    distributableEarnings: null,
    infraAum: 36,
    totalAum: 155,
    fundraising: 2.8,
    deployment: 2.2,
    dryPowder: 8,
    keyHighlights: [
      "Infrastructure allocations grew 18% YoY as institutional clients increased infra weighting",
      "Advisory & data analytics revenue up 22% YoY driven by infrastructure due diligence mandates",
    ],
  },
  {
    companyId: "stepstone",
    quarter: "Q2 2025",
    reportDate: "2025-08-14T11:00:00Z",
    revenue: 192,
    netIncome: 48,
    eps: 0.50,
    epsEstimate: 0.46,
    feeRelatedEarnings: 92,
    distributableEarnings: null,
    infraAum: 38,
    totalAum: 160,
    fundraising: 3.2,
    deployment: 2.5,
    dryPowder: 7.5,
    keyHighlights: [
      "Launched StepStone Infrastructure Secondaries Fund II targeting $2B",
      "FRE margin improved to 48%, highest in company history, driven by operating leverage",
    ],
  },
  {
    companyId: "stepstone",
    quarter: "Q3 2025",
    reportDate: "2025-11-20T12:00:00Z",
    revenue: 205,
    netIncome: 53,
    eps: 0.55,
    epsEstimate: 0.51,
    feeRelatedEarnings: 98,
    distributableEarnings: null,
    infraAum: 40,
    totalAum: 165,
    fundraising: 3.5,
    deployment: 2.8,
    dryPowder: 7,
    keyHighlights: [
      "Total capital allocations grew to $165B; infrastructure now represents 24% of total platform",
      "Record quarterly advisory fees of $48M reflecting growing demand for private markets guidance",
    ],
  },

  // ─── Swiss Life ───────────────────────────────────────────
  {
    companyId: "swiss-life",
    quarter: "Q1 2025",
    reportDate: "2025-05-16T06:00:00Z",
    revenue: 5200,
    netIncome: 420,
    eps: 8.40,
    epsEstimate: 8.10,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 12.0,
    totalAum: 272,
    fundraising: 1.2,
    deployment: 0.8,
    dryPowder: 3.0,
    keyHighlights: [
      "Swiss Life Asset Managers infrastructure allocation increased to CHF 10.5B, up 15% YoY",
      "Premium income grew 4.2% driven by Swiss group life and international unit-linked business",
    ],
  },
  {
    companyId: "swiss-life",
    quarter: "Q2 2025",
    reportDate: "2025-08-19T06:00:00Z",
    revenue: 5400,
    netIncome: 440,
    eps: 8.80,
    epsEstimate: 8.50,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 12.5,
    totalAum: 278,
    fundraising: 1.5,
    deployment: 1.0,
    dryPowder: 2.8,
    keyHighlights: [
      "Third-party asset management AUM crossed CHF 120B; infrastructure mandates a key growth driver",
      "Committed CHF 800M to European social infrastructure including healthcare and education assets",
    ],
  },
  {
    companyId: "swiss-life",
    quarter: "Q3 2025",
    reportDate: "2025-11-14T06:00:00Z",
    revenue: 5300,
    netIncome: 430,
    eps: 8.60,
    epsEstimate: 8.30,
    feeRelatedEarnings: null,
    distributableEarnings: null,
    infraAum: 13.0,
    totalAum: 284,
    fundraising: 1.3,
    deployment: 0.9,
    dryPowder: 2.6,
    keyHighlights: [
      "Infrastructure portfolio generated 8.2% net return LTM, outperforming broader real assets allocation",
      "Expanded renewable energy portfolio with 450 MW of Nordic wind farm acquisitions",
    ],
  },

  // ─── TPG ──────────────────────────────────────────────────
  {
    companyId: "tpg",
    quarter: "Q1 2025",
    reportDate: "2025-05-08T11:00:00Z",
    revenue: 420,
    netIncome: 82,
    eps: 0.38,
    epsEstimate: 0.35,
    feeRelatedEarnings: 175,
    distributableEarnings: null,
    infraAum: 22,
    totalAum: 215,
    fundraising: 2.5,
    deployment: 1.8,
    dryPowder: 10,
    keyHighlights: [
      "TPG Rise Climate deployed $1.2B into renewable energy and sustainable infrastructure globally",
      "Total platform AUM grew 22% YoY driven by Rise Climate and Asia infrastructure fundraising",
    ],
  },
  {
    companyId: "tpg",
    quarter: "Q2 2025",
    reportDate: "2025-08-06T11:00:00Z",
    revenue: 460,
    netIncome: 95,
    eps: 0.44,
    epsEstimate: 0.40,
    feeRelatedEarnings: 190,
    distributableEarnings: null,
    infraAum: 24,
    totalAum: 224,
    fundraising: 3.0,
    deployment: 2.2,
    dryPowder: 9.5,
    keyHighlights: [
      "Rise Climate Fund II first close at $4.5B, targeting $7B final close for climate infrastructure",
      "Completed acquisition of majority stake in a Southeast Asian district cooling platform for $620M",
    ],
  },
  {
    companyId: "tpg",
    quarter: "Q3 2025",
    reportDate: "2025-11-05T12:00:00Z",
    revenue: 500,
    netIncome: 108,
    eps: 0.50,
    epsEstimate: 0.46,
    feeRelatedEarnings: 210,
    distributableEarnings: null,
    infraAum: 25,
    totalAum: 232,
    fundraising: 3.5,
    deployment: 2.6,
    dryPowder: 9.0,
    keyHighlights: [
      "Infrastructure AUM reached $25B across Rise Climate, Asia, and core strategies",
      "FRE grew 32% YoY, fastest growth rate among all TPG platforms",
    ],
  },
];

// ─── Upcoming Earnings ─────────────────────────────────────

export const upcomingEarnings: UpcomingEarning[] = [
  {
    companyId: "brookfield",
    quarter: "Q4 2025",
    expectedDate: "2026-02-12T12:00:00Z",
    epsEstimate: 0.53,
    revenueEstimate: 1560,
  },
  {
    companyId: "apollo",
    quarter: "Q4 2025",
    expectedDate: "2026-02-13T12:00:00Z",
    epsEstimate: 2.45,
    revenueEstimate: 1750,
  },
  {
    companyId: "kkr",
    quarter: "Q4 2025",
    expectedDate: "2026-02-18T12:00:00Z",
    epsEstimate: 1.35,
    revenueEstimate: 1640,
  },
  {
    companyId: "ares",
    quarter: "Q4 2025",
    expectedDate: "2026-02-20T12:00:00Z",
    epsEstimate: 1.12,
    revenueEstimate: 1080,
  },
  {
    companyId: "tpg",
    quarter: "Q4 2025",
    expectedDate: "2026-02-20T12:00:00Z",
    epsEstimate: 0.55,
    revenueEstimate: 540,
  },
  {
    companyId: "stepstone",
    quarter: "Q4 2025",
    expectedDate: "2026-02-25T12:00:00Z",
    epsEstimate: 0.59,
    revenueEstimate: 218,
  },
  {
    companyId: "partners-group",
    quarter: "FY 2025",
    expectedDate: "2026-03-04T06:00:00Z",
    epsEstimate: 5.40,
    revenueEstimate: 490,
  },
  {
    companyId: "swiss-life",
    quarter: "FY 2025",
    expectedDate: "2026-03-13T06:00:00Z",
    epsEstimate: 9.20,
    revenueEstimate: 5500,
  },
];

// ─── Helper Functions ──────────────────────────────────────

export function getCompanyById(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getQuarterlyEarnings(companyId: string): QuarterlyEarning[] {
  return quarterlyEarnings
    .filter((e) => e.companyId === companyId)
    .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime());
}

export function getLatestQuarter(companyId: string): QuarterlyEarning | undefined {
  const earnings = getQuarterlyEarnings(companyId);
  return earnings[earnings.length - 1];
}

export function getUpcomingEarning(companyId: string): UpcomingEarning | undefined {
  return upcomingEarnings.find((e) => e.companyId === companyId);
}

export function getEpsSurprise(earning: QuarterlyEarning): number | null {
  if (earning.epsEstimate === null || earning.epsEstimate === 0) return null;
  return ((earning.eps - earning.epsEstimate) / Math.abs(earning.epsEstimate)) * 100;
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

export function formatCurrency(value: number, decimals = 0): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}B`;
  }
  return `$${value.toFixed(decimals)}M`;
}

export function formatBillions(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}T`;
  }
  if (value < 1) {
    return `$${(value * 1000).toFixed(0)}M`;
  }
  return `$${value.toFixed(0)}B`;
}

export function formatEarningsDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getCalendarEntries(): CalendarEntry[] {
  const entries: CalendarEntry[] = [];

  // Reported quarters — use the latest quarter per company
  for (const company of companies) {
    const latest = getLatestQuarter(company.id);
    if (latest) {
      entries.push({
        companyId: company.id,
        companyName: company.name,
        ticker: company.ticker,
        quarter: latest.quarter,
        date: latest.reportDate,
        isReported: true,
        epsSurprise: getEpsSurprise(latest),
        epsEstimate: latest.epsEstimate,
        eps: latest.eps,
      });
    }
  }

  // Upcoming — only add if the company doesn't already have a more recent entry
  for (const upcoming of upcomingEarnings) {
    const company = getCompanyById(upcoming.companyId);
    if (!company) continue;
    entries.push({
      companyId: upcoming.companyId,
      companyName: company.name,
      ticker: company.ticker,
      quarter: upcoming.quarter,
      date: upcoming.expectedDate,
      isReported: false,
      epsSurprise: null,
      epsEstimate: upcoming.epsEstimate,
      eps: null,
    });
  }

  // Sort by date, most recent first
  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return entries;
}

export function getAggregateStats() {
  const totalInfraAum = companies.reduce((sum, c) => sum + c.infraAum, 0);

  const reportedQ4 = quarterlyEarnings.filter(
    (e) => e.quarter === "Q4 2025" && new Date(e.reportDate) <= new Date()
  );

  const surprises = reportedQ4
    .map(getEpsSurprise)
    .filter((s): s is number => s !== null);
  const avgSurprise = surprises.length > 0
    ? surprises.reduce((a, b) => a + b, 0) / surprises.length
    : 0;

  const beats = surprises.filter((s) => s > 0).length;
  const misses = surprises.filter((s) => s < 0).length;

  const nextUpcoming = upcomingEarnings
    .filter((e) => new Date(e.expectedDate) > new Date())
    .sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime())[0];
  const nextCompany = nextUpcoming ? getCompanyById(nextUpcoming.companyId) : null;

  return {
    totalInfraAum,
    totalCompanies: companies.length,
    reportedCount: reportedQ4.length,
    upcomingCount: upcomingEarnings.filter((e) => new Date(e.expectedDate) > new Date()).length,
    avgSurprise,
    beats,
    misses,
    nextUpcoming,
    nextCompanyName: nextCompany?.name ?? null,
    nextCompanyTicker: nextCompany?.ticker ?? null,
  };
}
