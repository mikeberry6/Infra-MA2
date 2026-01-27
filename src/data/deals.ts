export type DealStatus = "Active" | "Closed" | "Rumored" | "Terminated";
export type DealSector = "Energy" | "Digital" | "Transport" | "Water" | "Social";

export interface Deal {
  id: string;
  title: string;
  buyer: string;
  seller: string;
  value: number; // in billions USD
  sector: DealSector;
  status: DealStatus;
  date: string; // ISO date
  description: string;
  sourceName: string;
  sourceUrl: string;
  banker?: string;
  debtPackage?: string;
  timeline?: string;
}

export const deals: Deal[] = [
  {
    id: "INF-2025-001",
    title: "Brookfield Acquires Colonial Pipeline Stake",
    buyer: "Brookfield Infrastructure Partners",
    seller: "KKR & Co.",
    value: 12.4,
    sector: "Energy",
    status: "Active",
    date: "2025-07-15T09:30:00Z",
    description:
      "Brookfield Infrastructure Partners is in advanced talks to acquire a controlling stake in Colonial Pipeline, the largest refined products pipeline in the US spanning 5,500 miles from Houston to New York Harbor. The deal would mark one of the largest midstream infrastructure transactions in North American history.",
    sourceName: "Reuters",
    sourceUrl: "https://www.reuters.com",
    banker: "Goldman Sachs / Barclays",
    debtPackage: "$7.2B Senior Secured Term Loan, $2.1B Revolving Credit Facility",
    timeline: "Expected close Q4 2025",
  },
  {
    id: "INF-2025-002",
    title: "Equinix Mega Data Center Portfolio Expansion",
    buyer: "Equinix Inc.",
    seller: "CyrusOne (KKR Portfolio)",
    value: 8.7,
    sector: "Digital",
    status: "Closed",
    date: "2025-07-14T14:15:00Z",
    description:
      "Equinix has completed the acquisition of 12 hyperscale data centers across North America from CyrusOne, significantly expanding its colocation capacity in key markets including Dallas, Phoenix, and Northern Virginia. The transaction adds 240MW of critical IT load capacity.",
    sourceName: "Bloomberg",
    sourceUrl: "https://www.bloomberg.com",
    banker: "JP Morgan / Morgan Stanley",
    debtPackage: "$5.5B Green Bond Issuance, $1.8B Equity Raise",
    timeline: "Closed July 2025",
  },
  {
    id: "INF-2025-003",
    title: "Blackstone Toll Road Platform Consolidation",
    buyer: "Blackstone Infrastructure",
    seller: "Macquarie Asset Management",
    value: 6.2,
    sector: "Transport",
    status: "Active",
    date: "2025-07-15T11:00:00Z",
    description:
      "Blackstone is assembling a North American toll road platform through the acquisition of Macquarie's portfolio of managed lane assets across Texas, Virginia, and Florida. The combined platform would represent over 400 lane-miles of toll infrastructure.",
    sourceName: "Wall Street Journal",
    sourceUrl: "https://www.wsj.com",
    banker: "Evercore / RBC Capital Markets",
    debtPackage: "$3.8B TIFIA Loan, $1.5B Private Placement",
    timeline: "Regulatory review in progress",
  },
  {
    id: "INF-2025-004",
    title: "NextEra Acquires Canadian Wind Portfolio",
    buyer: "NextEra Energy Partners",
    seller: "TransAlta Renewables",
    value: 4.5,
    sector: "Energy",
    status: "Closed",
    date: "2025-07-13T08:45:00Z",
    description:
      "NextEra Energy Partners completed the acquisition of TransAlta's 2.8GW Canadian wind portfolio spanning Alberta and Ontario. The deal includes 15 operational wind farms and a 500MW development pipeline, strengthening NextEra's position as the continent's largest wind operator.",
    sourceName: "Financial Times",
    sourceUrl: "https://www.ft.com",
    banker: "Citi / TD Securities",
    debtPackage: "$2.8B Project Finance, $800M Holdco Debt",
    timeline: "Closed June 2025",
  },
  {
    id: "INF-2025-005",
    title: "DigitalBridge 5G Tower Mega-Deal",
    buyer: "DigitalBridge Group",
    seller: "Tillman Infrastructure",
    value: 9.3,
    sector: "Digital",
    status: "Rumored",
    date: "2025-07-15T07:00:00Z",
    description:
      "DigitalBridge is reportedly in early-stage discussions to acquire Tillman Infrastructure's portfolio of 20,000+ wireless towers across the southeastern United States. If completed, the transaction would create the fourth-largest tower company in North America.",
    sourceName: "Wall Street Journal",
    sourceUrl: "https://www.wsj.com",
    banker: "Not disclosed",
    debtPackage: "Expected ABS securitization",
    timeline: "Early discussions",
  },
  {
    id: "INF-2025-006",
    title: "GIP Acquires Port of Long Beach Terminal",
    buyer: "Global Infrastructure Partners",
    seller: "Orient Overseas Container Line",
    value: 3.8,
    sector: "Transport",
    status: "Active",
    date: "2025-07-14T16:30:00Z",
    description:
      "GIP has entered exclusive negotiations to acquire the Long Beach Container Terminal from OOCL, one of the busiest container handling facilities on the US West Coast. The terminal processes over 3 million TEUs annually and would be a cornerstone of GIP's port infrastructure strategy.",
    sourceName: "Bloomberg",
    sourceUrl: "https://www.bloomberg.com",
    banker: "Lazard / CIBC",
    debtPackage: "$2.2B Revenue Bonds",
    timeline: "CFIUS review pending",
  },
  {
    id: "INF-2025-007",
    title: "AES Ohio River Basin Water Treatment PPP",
    buyer: "AES Corporation",
    seller: "State of Ohio (PPP Award)",
    value: 2.1,
    sector: "Water",
    status: "Active",
    date: "2025-07-15T10:00:00Z",
    description:
      "AES has been awarded the 35-year public-private partnership to design, build, finance, operate, and maintain a new integrated water treatment system serving the Ohio River Basin communities. The project will serve 2.4 million residents across three states.",
    sourceName: "Infrastructure Investor",
    sourceUrl: "https://www.infrastructureinvestor.com",
    banker: "MUFG / KeyBanc",
    debtPackage: "$1.4B PAB Issuance, $350M Equity",
    timeline: "Financial close expected Q3 2025",
  },
  {
    id: "INF-2025-008",
    title: "CPP Investments Acquires SunEdison Solar Portfolio",
    buyer: "CPP Investments",
    seller: "SunEdison (Brookfield-managed)",
    value: 5.6,
    sector: "Energy",
    status: "Active",
    date: "2025-07-12T13:20:00Z",
    description:
      "Canada Pension Plan Investment Board is acquiring a 4.2GW operational utility-scale solar portfolio across California, Texas, and Arizona. The portfolio includes some of the largest solar installations in North America with long-term PPAs with investment-grade offtakers.",
    sourceName: "Reuters",
    sourceUrl: "https://www.reuters.com",
    banker: "Credit Suisse / BMO Capital",
    debtPackage: "$3.4B Project Finance Refinancing",
    timeline: "Due diligence phase",
  },
  {
    id: "INF-2025-009",
    title: "Vantage Data Centers US Hyperscale Expansion",
    buyer: "Vantage Data Centers",
    seller: "QTS Realty Trust (Blackstone)",
    value: 7.1,
    sector: "Digital",
    status: "Rumored",
    date: "2025-07-11T09:00:00Z",
    description:
      "Sources indicate Vantage Data Centers is in preliminary discussions with Blackstone regarding the acquisition of select QTS hyperscale campuses in Ashburn, VA and Hillsboro, OR. The combined capacity would exceed 500MW across the acquired facilities.",
    sourceName: "The Information",
    sourceUrl: "https://www.theinformation.com",
    banker: "Not disclosed",
    debtPackage: "TBD",
    timeline: "Preliminary discussions",
  },
  {
    id: "INF-2025-010",
    title: "Ferrovial US Airport Concession Platform",
    buyer: "Ferrovial SE",
    seller: "Multiple Municipal Authorities",
    value: 4.9,
    sector: "Transport",
    status: "Active",
    date: "2025-07-14T12:00:00Z",
    description:
      "Ferrovial is assembling a US airport concession platform through P3 awards at Denver International, JFK Terminal One, and Austin-Bergstrom International. The combined concession value represents a significant entry into the US airport infrastructure market.",
    sourceName: "Financial Times",
    sourceUrl: "https://www.ft.com",
    banker: "Santander CIB / Goldman Sachs",
    debtPackage: "$3.1B Airport Revenue Bonds",
    timeline: "Multiple closings through 2025",
  },
  {
    id: "INF-2025-011",
    title: "Ontario Teachers' Acquires Puget Sound Energy",
    buyer: "Ontario Teachers' Pension Plan",
    seller: "PSE Parent Holdings",
    value: 11.2,
    sector: "Energy",
    status: "Active",
    date: "2025-07-15T06:30:00Z",
    description:
      "Ontario Teachers' is leading a consortium to acquire Puget Sound Energy, Washington State's largest electric and natural gas utility serving 1.2 million customers. The deal includes a commitment to invest $4B in grid modernization over the next decade.",
    sourceName: "Wall Street Journal",
    sourceUrl: "https://www.wsj.com",
    banker: "Morgan Stanley / Scotiabank",
    debtPackage: "$6.5B Investment-Grade Bond Issuance, $2.8B Term Loan",
    timeline: "State PUC approval pending",
  },
  {
    id: "INF-2025-012",
    title: "Stonepeak Fiber-to-the-Home Rollup",
    buyer: "Stonepeak Partners",
    seller: "Multiple Regional ISPs",
    value: 3.2,
    sector: "Digital",
    status: "Closed",
    date: "2025-07-10T15:00:00Z",
    description:
      "Stonepeak has completed a series of acquisitions consolidating six regional fiber-to-the-home providers across the Midwest and Southeast, creating a platform passing 2.8 million homes. The combined entity operates under the unified 'LightPath Networks' brand.",
    sourceName: "Bloomberg",
    sourceUrl: "https://www.bloomberg.com",
    banker: "Jefferies / Deutsche Bank",
    debtPackage: "$2.0B Senior Secured, $600M Second Lien",
    timeline: "Integration underway",
  },
  {
    id: "INF-2025-013",
    title: "TC Energy CCUS Pipeline Network",
    buyer: "TC Energy Corporation",
    seller: "Summit Carbon Solutions (Partial)",
    value: 2.8,
    sector: "Energy",
    status: "Rumored",
    date: "2025-07-09T11:30:00Z",
    description:
      "TC Energy is rumored to be in discussions to acquire a 40% stake in Summit Carbon Solutions' 2,500-mile CO2 pipeline network spanning the Midwest. The infrastructure is designed to transport captured carbon from ethanol plants to permanent sequestration sites in North Dakota.",
    sourceName: "Reuters",
    sourceUrl: "https://www.reuters.com",
    banker: "Not disclosed",
    debtPackage: "DOE Loan Guarantee application pending",
    timeline: "Initial discussions",
  },
  {
    id: "INF-2025-014",
    title: "IFM Investors I-66 Managed Lanes Acquisition",
    buyer: "IFM Investors",
    seller: "Cintra / Meridiam Consortium",
    value: 5.4,
    sector: "Transport",
    status: "Closed",
    date: "2025-07-08T09:15:00Z",
    description:
      "Australian fund manager IFM Investors has completed the acquisition of the I-66 Outside the Beltway managed lanes concession in Northern Virginia. The 22.5-mile express lanes project is one of the largest PPP transportation projects in US history with a 50-year concession period.",
    sourceName: "Infrastructure Investor",
    sourceUrl: "https://www.infrastructureinvestor.com",
    banker: "Macquarie Capital / BofA Securities",
    debtPackage: "$3.5B TIFIA + PABs, $1.2B Equity",
    timeline: "Closed July 2025",
  },
  {
    id: "INF-2025-015",
    title: "American Water Works Municipal Portfolio",
    buyer: "American Water Works",
    seller: "City of Pittsburgh Water Authority",
    value: 1.9,
    sector: "Water",
    status: "Active",
    date: "2025-07-13T14:00:00Z",
    description:
      "American Water Works has been selected as the preferred bidder for Pittsburgh's water and wastewater system concession, a 30-year agreement to operate, maintain, and invest in the aging infrastructure serving 300,000 residents. The deal includes a $800M capital improvement commitment.",
    sourceName: "Wall Street Journal",
    sourceUrl: "https://www.wsj.com",
    banker: "PFM Financial Advisors",
    debtPackage: "$1.2B Water Revenue Bonds",
    timeline: "City council vote pending",
  },
  {
    id: "INF-2025-016",
    title: "KKR Acquires Landmark US Hospital Portfolio",
    buyer: "KKR & Co.",
    seller: "Steward Health Care System",
    value: 6.8,
    sector: "Social",
    status: "Active",
    date: "2025-07-14T08:00:00Z",
    description:
      "KKR is acquiring Steward Health Care's portfolio of 23 hospital properties across Massachusetts, Texas, Florida, and Arizona through a sale-leaseback structure. The real estate portfolio spans 12 million square feet of critical healthcare infrastructure.",
    sourceName: "Bloomberg",
    sourceUrl: "https://www.bloomberg.com",
    banker: "Houlihan Lokey / Centerview",
    debtPackage: "$4.2B CMBS, $1.5B Mezz",
    timeline: "FTC review in progress",
  },
  {
    id: "INF-2025-017",
    title: "Pembina Pipeline Border Crossing Expansion",
    buyer: "Pembina Pipeline Corp",
    seller: "Alliance Pipeline LP",
    value: 3.5,
    sector: "Energy",
    status: "Closed",
    date: "2025-07-07T10:45:00Z",
    description:
      "Pembina Pipeline has closed the acquisition of the remaining 50% interest in Alliance Pipeline, a 3,848km integrated natural gas gathering and transportation system running from northeast BC and northwest Alberta to the Chicago market hub.",
    sourceName: "Financial Times",
    sourceUrl: "https://www.ft.com",
    banker: "TD Securities / CIBC Capital",
    debtPackage: "$2.0B Medium-Term Notes",
    timeline: "Closed and integrated",
  },
  {
    id: "INF-2025-018",
    title: "Brightspeed Fiber Network Recapitalization",
    buyer: "Apollo Global Management",
    seller: "Brightspeed (Existing Shareholders)",
    value: 4.3,
    sector: "Digital",
    status: "Active",
    date: "2025-07-12T16:00:00Z",
    description:
      "Apollo is leading a recapitalization of Brightspeed's fiber-to-the-home network covering 6.5 million locations across 20 states. The deal includes $2.5B of new equity to fund the continued buildout of fiber infrastructure in underserved communities across the Southeast and Midwest.",
    sourceName: "Wall Street Journal",
    sourceUrl: "https://www.wsj.com",
    banker: "Goldman Sachs / Guggenheim",
    debtPackage: "$2.8B First Lien, $1.0B Second Lien, $2.5B New Equity",
    timeline: "Lender consent process",
  },
  {
    id: "INF-2025-019",
    title: "Aecon Group Trans-Mountain Maintenance Contract",
    buyer: "Aecon Group Inc.",
    seller: "Trans Mountain Corporation",
    value: 1.4,
    sector: "Energy",
    status: "Closed",
    date: "2025-07-06T12:30:00Z",
    description:
      "Aecon Group has been awarded a 15-year operations and maintenance contract for the newly expanded Trans Mountain Pipeline system. The contract covers routine and emergency maintenance for the 1,150km twinned pipeline from Edmonton to Burnaby.",
    sourceName: "Reuters",
    sourceUrl: "https://www.reuters.com",
    banker: "N/A (Government procurement)",
    debtPackage: "Government-backed performance bonds",
    timeline: "Contract commenced",
  },
  {
    id: "INF-2025-020",
    title: "SBA Communications Tower Divestiture",
    buyer: "American Tower Corp",
    seller: "SBA Communications",
    value: 8.1,
    sector: "Digital",
    status: "Terminated",
    date: "2025-07-05T08:00:00Z",
    description:
      "American Tower's proposed acquisition of SBA Communications' 15,000-tower portfolio across the US Southeast has been terminated following antitrust concerns raised by the DOJ. The combined entity would have controlled over 40% of wireless tower infrastructure in key metropolitan markets.",
    sourceName: "Bloomberg",
    sourceUrl: "https://www.bloomberg.com",
    banker: "JP Morgan / BofA Securities",
    debtPackage: "N/A - Deal terminated",
    timeline: "Terminated - DOJ block",
  },
  {
    id: "INF-2025-021",
    title: "CDPQ Mexican Toll Road Cross-Border Portfolio",
    buyer: "CDPQ (Caisse de dépôt)",
    seller: "Grupo ICA",
    value: 3.9,
    sector: "Transport",
    status: "Rumored",
    date: "2025-07-15T13:00:00Z",
    description:
      "CDPQ is reportedly exploring the acquisition of Grupo ICA's toll road portfolio spanning key corridors between Mexico City, Guadalajara, and Monterrey. The portfolio includes 800km of concession roads and cross-border logistics infrastructure connecting to the US market.",
    sourceName: "Infrastructure Investor",
    sourceUrl: "https://www.infrastructureinvestor.com",
    banker: "Not disclosed",
    debtPackage: "TBD",
    timeline: "Market rumors - unconfirmed",
  },
  {
    id: "INF-2025-022",
    title: "AltaGas Canadian Utility Consolidation",
    buyer: "AltaGas Ltd.",
    seller: "ATCO Energy Distribution",
    value: 5.1,
    sector: "Energy",
    status: "Active",
    date: "2025-07-11T07:45:00Z",
    description:
      "AltaGas is pursuing the acquisition of ATCO's natural gas distribution business in Alberta, serving over 1.1 million customers. The combination would create Western Canada's largest integrated gas utility with significant rate base growth opportunities.",
    sourceName: "Financial Times",
    sourceUrl: "https://www.ft.com",
    banker: "RBC Capital / National Bank",
    debtPackage: "$3.0B Investment-Grade Bonds, $1.2B Equity Rights Offering",
    timeline: "AUC regulatory filing submitted",
  },
  {
    id: "INF-2025-023",
    title: "Poseidon Water Carlsbad Desalination Expansion",
    buyer: "Brookfield Renewable Partners",
    seller: "Poseidon Water LLC",
    value: 2.4,
    sector: "Water",
    status: "Active",
    date: "2025-07-10T10:00:00Z",
    description:
      "Brookfield Renewable is acquiring Poseidon Water and its flagship Carlsbad Desalination Plant in San Diego County, the largest seawater desalination facility in the Western Hemisphere. The deal includes expansion rights to double capacity to 100 million gallons per day.",
    sourceName: "Reuters",
    sourceUrl: "https://www.reuters.com",
    banker: "Barclays / Wells Fargo",
    debtPackage: "$1.5B Green Revenue Bonds",
    timeline: "CPUC approval pending",
  },
  {
    id: "INF-2025-024",
    title: "Plenary Group University Health Network P3",
    buyer: "Plenary Group",
    seller: "Province of Ontario (P3 Award)",
    value: 2.7,
    sector: "Social",
    status: "Active",
    date: "2025-07-09T14:30:00Z",
    description:
      "Plenary Group has been selected as the preferred proponent for the University Health Network's new acute care tower in downtown Toronto. The 30-year DBFM concession includes a 500-bed facility with state-of-the-art surgical suites and integrated research space.",
    sourceName: "Infrastructure Investor",
    sourceUrl: "https://www.infrastructureinvestor.com",
    banker: "National Bank / Desjardins",
    debtPackage: "$1.8B P3 Revenue Bonds, $500M Infrastructure Ontario Loan",
    timeline: "Financial close Q4 2025",
  },
];

// Helper to get sector color
export function getSectorColor(sector: DealSector): string {
  switch (sector) {
    case "Energy":
      return "#f59e0b";
    case "Digital":
      return "#3b82f6";
    case "Transport":
      return "#8b5cf6";
    case "Water":
      return "#06b6d4";
    case "Social":
      return "#ec4899";
    default:
      return "#a1a1aa";
  }
}

// Helper to get status CSS class
export function getStatusClass(status: DealStatus): string {
  switch (status) {
    case "Active":
      return "status-active";
    case "Closed":
      return "status-closed";
    case "Rumored":
      return "status-rumored";
    case "Terminated":
      return "status-terminated";
    default:
      return "";
  }
}

// Utility: format currency
export function formatValue(value: number): string {
  return `$${value.toFixed(1)}B`;
}

// Utility: format date for display
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Utility: format time
export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Get aggregate stats
export function getDealStats() {
  const totalVolume = deals.reduce((sum, d) => sum + d.value, 0);
  const activeCount = deals.filter((d) => d.status === "Active").length;
  const closedCount = deals.filter((d) => d.status === "Closed").length;

  const sectorCounts = deals.reduce(
    (acc, d) => {
      acc[d.sector] = (acc[d.sector] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topSector = Object.entries(sectorCounts).sort(
    ([, a], [, b]) => b - a,
  )[0];

  return {
    totalVolume,
    totalCount: deals.length,
    activeCount,
    closedCount,
    topSector: topSector[0] as DealSector,
    topSectorCount: topSector[1],
  };
}

// Get today's deals (most recent for mock purposes)
export function getTodayDeals(): Deal[] {
  return [...deals]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12);
}
