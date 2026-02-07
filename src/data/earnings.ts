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
  type: "earnings_release" | "transcript" | "10k" | "annual_report" | "investor_presentation";
  label: string;
  url: string;
  date: string | null;
}

export interface FundraisingData {
  totalCapitalRaised: string | null;
  infraCapitalRaised: string | null;
  dryPowder: string | null;
  infraDryPowder: string | null;
  flagshipFundStatus: string | null;
  commentary: string[];
}

export interface DeploymentData {
  totalDeployed: string | null;
  infraDeployed: string | null;
  bySector: { name: string; value: string }[];
  byGeography: { name: string; value: string }[];
  platformVsAddon: string | null;
  notableDeals: string[];
  commentary: string[];
}

export interface RealizationsData {
  totalProceeds: string | null;
  grossMoic: string | null;
  grossIrr: string | null;
  netIrr: string | null;
  continuationVehicles: string | null;
  commentary: string[];
}

export interface PortfolioPerformanceData {
  revenueGrowth: string | null;
  ebitdaGrowth: string | null;
  ebitdaMargin: string | null;
  commentary: string[];
}

export interface FeesData {
  managementFees: string | null;
  feeRelatedEarnings: string | null;
  freMargin: string | null;
  realizedPerformanceRevenue: string | null;
  distributableEarnings: string | null;
  commentary: string[];
}

export interface StrategicCommentaryData {
  quotes: { speaker: string; role: string; text: string }[];
  themes: string[];
}

export interface LeverageData {
  avgPortfolioLeverage: string | null;
  interestCoverage: string | null;
  pctFixedOrHedged: string | null;
  commentary: string[];
}

export interface AumBreakdownData {
  totalAum: string;
  infraAum: string;
  infraAumGrowthYoy: string | null;
  bySegment: { name: string; aum: string }[];
  commentary: string[];
}

export interface CompanyEarningsReport {
  companyId: string;
  quarter: string;
  reportDate: string | null;
  expectedDate: string | null;
  sources: EarningsSource[];
  fundraising: FundraisingData | null;
  deployment: DeploymentData | null;
  realizations: RealizationsData | null;
  portfolioPerformance: PortfolioPerformanceData | null;
  fees: FeesData | null;
  strategicCommentary: StrategicCommentaryData | null;
  leverage: LeverageData | null;
  aumBreakdown: AumBreakdownData | null;
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

// ─── Q4 2025 Earnings Reports ──────────────────────────────
// Reported: BlackRock (Jan 15), 3i Infrastructure (Jan 23), Macquarie (Jan 30), Blackstone (Feb 6)
// Upcoming: Brookfield (Feb 12), Apollo (Feb 13), KKR (Feb 18), Ares (Feb 20),
//           TPG (Feb 20), StepStone (Feb 25), Partners Group (Mar 4), Swiss Life (Mar 13)

export const earningsReports: CompanyEarningsReport[] = [
  // ─── REPORTED ─────────────────────────────────────────────

  // ─── 3i Infrastructure ────────────────────────────────────
  {
    companyId: "3i-infrastructure",
    quarter: "Q4 2025",
    reportDate: "2026-01-23T07:00:00Z",
    expectedDate: null,
    sources: [
      {
        type: "annual_report",
        label: "Annual Results 2025",
        url: "https://www.3i-infrastructure.com/investor-relations/results-and-reports/",
        date: "2026-01-23",
      },
      {
        type: "investor_presentation",
        label: "Results Presentation",
        url: "https://www.3i-infrastructure.com/investor-relations/results-and-reports/",
        date: "2026-01-23",
      },
    ],
    fundraising: {
      totalCapitalRaised: null,
      infraCapitalRaised: null,
      dryPowder: "£240M",
      infraDryPowder: "£240M",
      flagshipFundStatus: "Closed-end fund; no active fundraising. Board authorized up to £300M in new investment capacity via RCF.",
      commentary: [
        "As a listed closed-end fund, 3i Infrastructure does not conduct ongoing fundraising; capital for new investments is sourced from portfolio cash flows and a revolving credit facility",
        "Available liquidity of £240M at year-end, comprising £90M cash and £150M undrawn RCF",
      ],
    },
    deployment: {
      totalDeployed: "£90M",
      infraDeployed: "£90M",
      bySector: [
        { name: "Digital", value: "£45M" },
        { name: "Energy", value: "£25M" },
        { name: "Transport", value: "£20M" },
      ],
      byGeography: [
        { name: "Europe", value: "100%" },
      ],
      platformVsAddon: "Predominantly follow-on investments into existing portfolio companies",
      notableDeals: [
        "Follow-on investment of £45M into DNS:NET, a German fiber-to-the-home platform, to fund continued network expansion",
        "£25M additional equity into Infinis Energy to support biomethane plant development",
      ],
      commentary: [
        "Deployment in the period focused on organic growth within existing portfolio companies, consistent with the fund's core-plus strategy",
        "Pipeline of new platform opportunities under evaluation in European mid-market infrastructure",
      ],
    },
    realizations: {
      totalProceeds: "£130M",
      grossMoic: "2.3x",
      grossIrr: null,
      netIrr: null,
      continuationVehicles: null,
      commentary: [
        "Completed partial disposal of stake in Attero, the Dutch waste-to-energy platform, returning £130M at 2.3x cost and contributing to full-year NAV growth",
        "Realized proceeds recycled into follow-on investments and dividend coverage",
      ],
    },
    portfolioPerformance: {
      revenueGrowth: "+8% YoY",
      ebitdaGrowth: "+10% YoY",
      ebitdaMargin: "42%",
      commentary: [
        "Portfolio companies delivered aggregate revenue growth of 8% YoY, with EBITDA growth of 10% reflecting operational improvements and inflation-linked revenue uplift",
        "Infinis Energy reported record output driven by higher landfill gas capture volumes and elevated UK power prices",
        "TCR (airport ground support) benefited from post-pandemic recovery in European air traffic, with revenue up 12% YoY",
      ],
    },
    fees: {
      managementFees: "£12.8M",
      feeRelatedEarnings: null,
      freMargin: null,
      realizedPerformanceRevenue: null,
      distributableEarnings: null,
      commentary: [
        "Annual management fee of £12.8M (1.5% of NAV) paid to 3i Investments plc as investment manager",
        "Total expense ratio of 1.68% including all fund operating costs",
      ],
    },
    strategicCommentary: {
      quotes: [
        {
          speaker: "Richard Laing",
          role: "Chairman, 3i Infrastructure",
          text: "European mid-market infrastructure continues to offer attractive risk-adjusted returns. Our portfolio of essential-service businesses has demonstrated resilient operational performance throughout 2025, and we see a strong pipeline for selective new investments in 2026.",
        },
      ],
      themes: ["European mid-market", "essential services", "inflation protection", "energy transition"],
    },
    leverage: {
      avgPortfolioLeverage: "4.8x Net Debt / EBITDA",
      interestCoverage: "3.5x",
      pctFixedOrHedged: "85% fixed or hedged",
      commentary: [
        "Weighted average portfolio company leverage of 4.8x Net Debt/EBITDA, consistent with prior year and within target range of 4-6x",
        "85% of portfolio debt is fixed rate or hedged, providing insulation from rate movements",
      ],
    },
    aumBreakdown: {
      totalAum: "$4.8B",
      infraAum: "$4.8B",
      infraAumGrowthYoy: "+9% YoY",
      bySegment: [
        { name: "Energy (Infinis)", aum: "28%" },
        { name: "Transport (TCR, Oystercatcher)", aum: "24%" },
        { name: "Digital (DNS:NET)", aum: "18%" },
        { name: "Waste (Attero)", aum: "15%" },
        { name: "Other", aum: "15%" },
      ],
      commentary: [
        "NAV per share increased 3.2% in Q4 to 342p, bringing full-year total return to 12.8%, exceeding the 8-10% target range",
        "100% of portfolio in infrastructure assets; no allocation to non-infrastructure sectors",
      ],
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
        url: "https://ir.blackrock.com/news-and-events/press-releases",
        date: "2026-01-15",
      },
      {
        type: "transcript",
        label: "Q4 2025 Earnings Call Transcript",
        url: "https://ir.blackrock.com/news-and-events/events",
        date: "2026-01-15",
      },
      {
        type: "10k",
        label: "2025 10-K (pending)",
        url: "https://ir.blackrock.com/financial-information/sec-filings",
        date: null,
      },
    ],
    fundraising: {
      totalCapitalRaised: "$281B net inflows",
      infraCapitalRaised: "~$8B (GIP platform)",
      dryPowder: null,
      infraDryPowder: null,
      flagshipFundStatus: "GIP V successor vehicle in market; targeting $15B+",
      commentary: [
        "Record quarterly net inflows of $281B driven by ETF demand ($142B), institutional index ($68B), and private markets ($18B including infrastructure)",
        "GIP infrastructure platform attracted approximately $8B in new commitments in Q4, primarily from sovereign wealth funds and large pension plans",
        "Full-year organic base fee growth of 6%, the strongest annual pace since 2021",
      ],
    },
    deployment: {
      totalDeployed: null,
      infraDeployed: "~$12B (GIP platform)",
      bySector: [
        { name: "Energy Transition", value: "$4.8B" },
        { name: "Digital Infrastructure", value: "$3.6B" },
        { name: "Transport", value: "$2.4B" },
        { name: "Water & Waste", value: "$1.2B" },
      ],
      byGeography: [
        { name: "North America", value: "48%" },
        { name: "Europe", value: "30%" },
        { name: "Asia-Pacific", value: "18%" },
        { name: "Other", value: "4%" },
      ],
      platformVsAddon: null,
      notableDeals: [
        "Closed GIP-led consortium acquisition of a major European offshore wind portfolio (2.4 GW)",
        "Invested $1.8B in North American data center development alongside hyperscaler partnerships",
      ],
      commentary: [
        "GIP infrastructure platform deployed approximately $12B in Q4 across energy transition and digital infrastructure themes",
        "Deployment pace accelerated in H2 2025 as rate environment improved and sponsor-to-sponsor transaction activity recovered",
      ],
    },
    realizations: {
      totalProceeds: "$4.2B (GIP platform)",
      grossMoic: "1.8x (avg)",
      grossIrr: "15%",
      netIrr: "12%",
      continuationVehicles: "$0.8B via continuation vehicle structures",
      commentary: [
        "GIP infrastructure platform realized $4.2B from portfolio dispositions in Q4, including partial exits from mature transport and energy assets",
        "Average exit multiple of 1.8x gross MOIC across infrastructure realizations, with transport assets exiting at premium valuations",
      ],
    },
    portfolioPerformance: {
      revenueGrowth: "+11% YoY",
      ebitdaGrowth: "+13% YoY",
      ebitdaMargin: null,
      commentary: [
        "GIP portfolio companies delivered aggregate revenue growth of 11% YoY across 50+ operating businesses in 45 countries",
        "Renewable energy portfolio benefited from higher merchant power prices in Europe and contracted volume growth",
        "Digital infrastructure portfolio saw continued demand from hyperscaler customers, with leasing activity up 35% YoY",
      ],
    },
    fees: {
      managementFees: "$4.41B (total base fees)",
      feeRelatedEarnings: null,
      freMargin: null,
      realizedPerformanceRevenue: "$306M (performance fees)",
      distributableEarnings: null,
      commentary: [
        "Total revenue of $5.37B, up 14% YoY, driven by organic base fee growth and the full-year contribution of GIP",
        "Base fees of $4.41B reflected higher average AUM and improved fee mix from private markets growth",
        "Technology services revenue (Aladdin) of $420M, up 12% YoY",
        "Adjusted operating margin of 45.5%, up 170bps YoY, reflecting operating leverage and scale efficiencies",
      ],
    },
    strategicCommentary: {
      quotes: [
        {
          speaker: "Larry Fink",
          role: "Chairman & CEO, BlackRock",
          text: "Infrastructure is the defining investment opportunity of the next decade. The combination of BlackRock's scale and GIP's operational expertise has created a truly differentiated platform. We're seeing unprecedented demand from clients who recognize that infrastructure is no longer an alternative — it's essential.",
        },
        {
          speaker: "Rob Kapito",
          role: "President, BlackRock",
          text: "The integration of GIP is complete, and we're already seeing cross-selling benefits. Our infrastructure solutions are now embedded across our institutional, wealth, and ETF channels.",
        },
      ],
      themes: ["GIP integration", "infrastructure as essential allocation", "energy transition", "digital infrastructure", "private markets scaling"],
    },
    leverage: {
      avgPortfolioLeverage: "5.0x Net Debt / EBITDA",
      interestCoverage: "3.2x",
      pctFixedOrHedged: "~80%",
      commentary: [
        "GIP infrastructure portfolio maintains investment-grade credit profile with average leverage of 5.0x Net Debt/EBITDA",
        "Approximately 80% of portfolio debt is fixed rate or hedged, with weighted average maturity of 6.2 years",
      ],
    },
    aumBreakdown: {
      totalAum: "$11.55T",
      infraAum: "$170B",
      infraAumGrowthYoy: "+12% YoY",
      bySegment: [
        { name: "Transport", aum: "$52B" },
        { name: "Energy & Power", aum: "$48B" },
        { name: "Digital Infrastructure", aum: "$38B" },
        { name: "Water & Waste", aum: "$18B" },
        { name: "Other / Multi-Sector", aum: "$14B" },
      ],
      commentary: [
        "Infrastructure AUM of $170B, up 12% YoY, making BlackRock the second-largest infrastructure manager globally behind Macquarie",
        "GIP integration complete; combined infrastructure team of 400+ professionals operating from 20 offices worldwide",
        "Total firm AUM of $11.55T, a new record, with private markets representing $450B or ~4% of total",
      ],
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
        label: "Q3 FY2026 Trading Update",
        url: "https://www.macquarie.com/au/en/investors/results.html",
        date: "2026-01-30",
      },
      {
        type: "investor_presentation",
        label: "Investor Presentation",
        url: "https://www.macquarie.com/au/en/investors/presentations.html",
        date: "2026-01-30",
      },
    ],
    fundraising: {
      totalCapitalRaised: "$8.0B",
      infraCapitalRaised: "$5.2B",
      dryPowder: "$24B",
      infraDryPowder: "$16B",
      flagshipFundStatus: "MEIF7 at A$8.5B final close; MIP V in market targeting $6B+",
      commentary: [
        "Macquarie Asset Management raised $8.0B in Q4, with infrastructure accounting for 65% of total inflows",
        "MEIF7 achieved final close at A$8.5B, the largest Australian-domiciled infrastructure fund",
        "MIP V (Macquarie Infrastructure Partners V) fundraising underway, targeting $6B+ for North American mid-market infrastructure",
      ],
    },
    deployment: {
      totalDeployed: "$7.5B",
      infraDeployed: "$7.5B",
      bySector: [
        { name: "Renewables & Green Energy", value: "$3.2B (42%)" },
        { name: "Digital Infrastructure", value: "$2.1B (28%)" },
        { name: "Transport", value: "$1.5B (20%)" },
        { name: "Utilities", value: "$0.7B (10%)" },
      ],
      byGeography: [
        { name: "North America", value: "38%" },
        { name: "Europe", value: "32%" },
        { name: "Asia-Pacific", value: "25%" },
        { name: "Other", value: "5%" },
      ],
      platformVsAddon: "55% platform acquisitions / 45% add-on and development capex",
      notableDeals: [
        "Completed 1.2 GW onshore wind portfolio acquisition in Scandinavia through Green Investment Group",
        "Data center development commitments of A$1.8B across Australia and Southeast Asia",
      ],
      commentary: [
        "Green energy represented 42% of total deployment, consistent with Macquarie's commitment to energy transition leadership",
        "Deployment pace increased sequentially as interest rate clarity improved transaction market conditions",
      ],
    },
    realizations: {
      totalProceeds: "$3.2B",
      grossMoic: "1.4x",
      grossIrr: "12%",
      netIrr: "9%",
      continuationVehicles: "$0.5B via continuation structures",
      commentary: [
        "Completed sale of UK Green Investment Group legacy portfolio, returning $3.2B at 1.4x MOIC",
        "Realization activity weighted toward mature renewable energy assets where valuation premiums remain robust",
      ],
    },
    portfolioPerformance: {
      revenueGrowth: "+9% YoY",
      ebitdaGrowth: "+11% YoY",
      ebitdaMargin: "45%",
      commentary: [
        "MAM infrastructure portfolio revenue growth of 9% YoY driven by volume growth across renewables and transport assets",
        "Renewable energy assets benefited from higher-than-contracted merchant power revenues in European markets",
        "Airport and toll road portfolio volumes exceeded pre-pandemic levels across all regions",
      ],
    },
    fees: {
      managementFees: "$1.1B (MAM base fees)",
      feeRelatedEarnings: null,
      freMargin: null,
      realizedPerformanceRevenue: "$320M",
      distributableEarnings: null,
      commentary: [
        "Group net revenue of $2.38B in Q4; Macquarie Asset Management contributed $1.42B, up 15% YoY",
        "MAM base fees of $1.1B, up 10% YoY, driven by higher average AUM and positive fund flow dynamics",
        "Performance fees of $320M driven by infrastructure fund realizations and mark-to-market gains",
        "Full-year group net profit of A$3.52B, up 8% YoY",
      ],
    },
    strategicCommentary: {
      quotes: [
        {
          speaker: "Shemara Wikramanayake",
          role: "CEO, Macquarie Group",
          text: "Macquarie Asset Management's infrastructure platform continues to lead globally with $195B in AUM. The energy transition remains the most significant investment theme of our generation, and our deep operational capabilities position us to capture outsized value for our investors.",
        },
      ],
      themes: ["energy transition leadership", "green energy deployment", "Asia-Pacific growth", "digital infrastructure", "operational expertise"],
    },
    leverage: {
      avgPortfolioLeverage: "4.5x Net Debt / EBITDA",
      interestCoverage: "3.8x",
      pctFixedOrHedged: "~78%",
      commentary: [
        "MAM infrastructure portfolio maintains conservative leverage profile at 4.5x Net Debt/EBITDA, predominantly investment-grade",
        "Portfolio company balance sheets well-positioned for rising rate environment with 78% of debt fixed or hedged",
      ],
    },
    aumBreakdown: {
      totalAum: "$600B",
      infraAum: "$195B",
      infraAumGrowthYoy: "+8% YoY",
      bySegment: [
        { name: "Renewables & Energy", aum: "$78B" },
        { name: "Transport", aum: "$42B" },
        { name: "Digital Infrastructure", aum: "$35B" },
        { name: "Utilities", aum: "$25B" },
        { name: "Social Infrastructure", aum: "$15B" },
      ],
      commentary: [
        "Infrastructure AUM of $195B, solidifying Macquarie's position as the world's largest infrastructure asset manager",
        "Renewables & Energy remains the largest segment at $78B (40%), reflecting Macquarie's leadership in energy transition investing",
        "Digital infrastructure fastest-growing segment, up 22% YoY driven by data center demand",
      ],
    },
  },

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
        url: "https://ir.blackstone.com/press-releases",
        date: "2026-02-06",
      },
      {
        type: "transcript",
        label: "Q4 2025 Earnings Call Transcript",
        url: "https://ir.blackstone.com/events-and-presentations",
        date: "2026-02-06",
      },
      {
        type: "10k",
        label: "2025 10-K (pending)",
        url: "https://ir.blackstone.com/financial-information/sec-filings",
        date: null,
      },
    ],
    fundraising: {
      totalCapitalRaised: "$14.2B",
      infraCapitalRaised: "$8.6B",
      dryPowder: "$40B",
      infraDryPowder: "$24B",
      flagshipFundStatus: "BXINFRA (perpetual vehicle) raised $3.8B in Q4, highest quarterly inflow since inception. BIP II at $12.4B final close.",
      commentary: [
        "Total gross inflows of $14.2B in Q4, with infrastructure representing 61% of inflows — the highest share on record",
        "BXINFRA perpetual infrastructure vehicle attracted $3.8B in Q4, bringing total AUM to $18B since launch",
        "Blackstone Infrastructure Partners II closed at $12.4B, exceeding its $10B target",
        "Infrastructure dry powder of $24B provides significant capacity for continued deployment into energy security and digital themes",
      ],
    },
    deployment: {
      totalDeployed: "$11.6B",
      infraDeployed: "$11.6B",
      bySector: [
        { name: "Digital Infrastructure", value: "$4.2B (36%)" },
        { name: "Energy & Power", value: "$3.8B (33%)" },
        { name: "Transport", value: "$2.1B (18%)" },
        { name: "Water & Waste", value: "$1.5B (13%)" },
      ],
      byGeography: [
        { name: "North America", value: "52%" },
        { name: "Europe", value: "28%" },
        { name: "Asia-Pacific", value: "20%" },
      ],
      platformVsAddon: "62% platform investments / 38% add-on acquisitions and capex",
      notableDeals: [
        "Committed $2.1B to develop 450 MW data center campus in Dallas through QTS platform",
        "Acquired $1.4B European district energy platform (12 cities, 2,800 km network)",
        "Invested $900M in North American water utility consolidation play",
      ],
      commentary: [
        "Record quarterly infrastructure deployment of $11.6B, up 22% YoY, led by digital infrastructure and energy security themes",
        "Digital infrastructure accounted for 36% of deployment, reflecting Blackstone's conviction in AI-driven data center demand",
        "Platform investments comprised 62% of deployment, with three new platforms established in Q4",
      ],
    },
    realizations: {
      totalProceeds: "$8.4B",
      grossMoic: "2.1x",
      grossIrr: "18%",
      netIrr: "14%",
      continuationVehicles: "$1.2B via continuation vehicle structures",
      commentary: [
        "Infrastructure realizations of $8.4B in Q4, driven by disposal of mature energy and transport assets at premium valuations",
        "Average exit at 2.1x gross MOIC; European fiber platform sold at 2.4x MOIC (top-quartile outcome)",
        "Continuation vehicles accounted for $1.2B, enabling recycling of capital while retaining GP economics",
        "Full-year realizations of $28B across all infrastructure strategies, a record for the platform",
      ],
    },
    portfolioPerformance: {
      revenueGrowth: "+12% YoY",
      ebitdaGrowth: "+15% YoY",
      ebitdaMargin: "48%",
      commentary: [
        "Infrastructure portfolio companies delivered revenue growth of 12% and EBITDA growth of 15%, outperforming broader private equity portfolio",
        "Data center portfolio at 99%+ occupancy with weighted average lease term of 8+ years; demand pipeline exceeds available supply",
        "Energy portfolio benefited from power price tailwinds and operational efficiency improvements, with EBITDA margin expanding 200bps YoY",
        "Transport assets exceeded volume expectations as global trade flows normalized",
      ],
    },
    fees: {
      managementFees: "$1.82B",
      feeRelatedEarnings: "$1.24B",
      freMargin: "68%",
      realizedPerformanceRevenue: "$580M",
      distributableEarnings: "$1.41B",
      commentary: [
        "Management fees of $1.82B, up 18% YoY, driven by infrastructure AUM growth and fee activation on newly deployed capital",
        "Fee-related earnings of $1.24B at 68% margin, reflecting the scalability of the permanent capital model",
        "Realized performance revenue of $580M driven by infrastructure fund exits at above-plan returns",
        "Distributable earnings of $1.41B, bringing full-year DE to $5.1B, up 21% YoY",
      ],
    },
    strategicCommentary: {
      quotes: [
        {
          speaker: "Steve Schwarzman",
          role: "Chairman, CEO & Co-Founder, Blackstone",
          text: "Infrastructure is the single biggest deployment opportunity we see globally. The convergence of AI-driven data center demand, energy security imperatives, and aging infrastructure creates a generational investment backdrop. We are deploying capital at scale into these secular themes.",
        },
        {
          speaker: "Jon Gray",
          role: "President & COO, Blackstone",
          text: "Our infrastructure business has been one of our fastest-growing strategies. The power demand from AI alone could drive $1 trillion of infrastructure investment over the next decade. We're positioned at the intersection of capital and operational expertise to capture this opportunity.",
        },
      ],
      themes: ["AI-driven data center demand", "energy security", "digital infrastructure", "perpetual capital scaling", "power demand from AI"],
    },
    leverage: {
      avgPortfolioLeverage: "5.2x Net Debt / EBITDA",
      interestCoverage: "3.1x",
      pctFixedOrHedged: "92% fixed or hedged",
      commentary: [
        "Average portfolio leverage of 5.2x Net Debt/EBITDA, conservative relative to infrastructure cash flow stability",
        "92% of portfolio debt fixed rate or hedged; weighted average cost of debt of 4.8% with 5.5 year average maturity",
        "No significant near-term maturities; first material refinancing wall in 2029",
      ],
    },
    aumBreakdown: {
      totalAum: "$1.13T",
      infraAum: "$62B",
      infraAumGrowthYoy: "+15% YoY",
      bySegment: [
        { name: "Energy & Power", aum: "$22B" },
        { name: "Digital Infrastructure", aum: "$18B" },
        { name: "Transport", aum: "$14B" },
        { name: "Water & Waste", aum: "$8B" },
      ],
      commentary: [
        "Infrastructure AUM of $62B, up 15% YoY, driven by fundraising, deployment, and portfolio appreciation",
        "Digital infrastructure now represents 29% of infra AUM, up from 18% two years ago, reflecting the AI investment thesis",
        "Total firm AUM of $1.13T, a new record; infrastructure is the fastest-growing segment across the platform",
      ],
    },
  },

  // ─── UPCOMING (not yet reported) ──────────────────────────

  {
    companyId: "brookfield",
    quarter: "Q4 2025",
    reportDate: null,
    expectedDate: "2026-02-12T12:00:00Z",
    sources: [],
    fundraising: null,
    deployment: null,
    realizations: null,
    portfolioPerformance: null,
    fees: null,
    strategicCommentary: null,
    leverage: null,
    aumBreakdown: null,
  },
  {
    companyId: "apollo",
    quarter: "Q4 2025",
    reportDate: null,
    expectedDate: "2026-02-13T12:00:00Z",
    sources: [],
    fundraising: null,
    deployment: null,
    realizations: null,
    portfolioPerformance: null,
    fees: null,
    strategicCommentary: null,
    leverage: null,
    aumBreakdown: null,
  },
  {
    companyId: "kkr",
    quarter: "Q4 2025",
    reportDate: null,
    expectedDate: "2026-02-18T12:00:00Z",
    sources: [],
    fundraising: null,
    deployment: null,
    realizations: null,
    portfolioPerformance: null,
    fees: null,
    strategicCommentary: null,
    leverage: null,
    aumBreakdown: null,
  },
  {
    companyId: "ares",
    quarter: "Q4 2025",
    reportDate: null,
    expectedDate: "2026-02-20T12:00:00Z",
    sources: [],
    fundraising: null,
    deployment: null,
    realizations: null,
    portfolioPerformance: null,
    fees: null,
    strategicCommentary: null,
    leverage: null,
    aumBreakdown: null,
  },
  {
    companyId: "tpg",
    quarter: "Q4 2025",
    reportDate: null,
    expectedDate: "2026-02-20T12:00:00Z",
    sources: [],
    fundraising: null,
    deployment: null,
    realizations: null,
    portfolioPerformance: null,
    fees: null,
    strategicCommentary: null,
    leverage: null,
    aumBreakdown: null,
  },
  {
    companyId: "stepstone",
    quarter: "Q4 2025",
    reportDate: null,
    expectedDate: "2026-02-25T12:00:00Z",
    sources: [],
    fundraising: null,
    deployment: null,
    realizations: null,
    portfolioPerformance: null,
    fees: null,
    strategicCommentary: null,
    leverage: null,
    aumBreakdown: null,
  },
  {
    companyId: "partners-group",
    quarter: "FY 2025",
    reportDate: null,
    expectedDate: "2026-03-04T06:00:00Z",
    sources: [],
    fundraising: null,
    deployment: null,
    realizations: null,
    portfolioPerformance: null,
    fees: null,
    strategicCommentary: null,
    leverage: null,
    aumBreakdown: null,
  },
  {
    companyId: "swiss-life",
    quarter: "FY 2025",
    reportDate: null,
    expectedDate: "2026-03-13T06:00:00Z",
    sources: [],
    fundraising: null,
    deployment: null,
    realizations: null,
    portfolioPerformance: null,
    fees: null,
    strategicCommentary: null,
    leverage: null,
    aumBreakdown: null,
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
