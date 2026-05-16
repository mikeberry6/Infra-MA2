// Canonical constant arrays for filter UIs
// Self-contained — no imports from data files.

import type {
  FundStrategy,
  FundStatus,
  FundSector,
  FundRegion,
  FundStructure,
  FundSizeRange,
  PortCoSector,
  PortCoRegion,
  PortCoStatus,
  PortCoCountryTag,
} from "@/lib/types";

// ─── Deal Constants ────────────────────────────────────────

export const DEAL_SECTORS = [
  "Power & ET",
  "Utilities",
  "Digital",
  "Midstream",
  "Transportation",
  "Social Infra",
] as const;

export const DEAL_REGIONS = [
  "North America",
  "Europe",
  "Asia-Pacific",
  "Middle East & Africa",
  "Latin America",
] as const;

export const DEAL_CATEGORIES = [
  "Acquisition (Buyout)",
  "Acquisition (Majority Stake)",
  "Acquisition (Minority Stake)",
  "Acquisition (Bolt-On)",
  "Sale (Buyout)",
  "Sale (Majority Stake)",
  "Sale (Minority Stake)",
  "Sale (Carve-Out)",
  "Platform Launch",
  "IPO",
  "Joint Venture",
] as const;

export const DEAL_STATUSES = [
  "Announced",
  "Closed",
  "Pending Regulatory Approval",
  "Terminated",
] as const;

// ─── Fund Constants ────────────────────────────────────────

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
  "Greenfield",
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

// ─── PortCo Constants ──────────────────────────────────────

export const PORTCO_SECTORS: PortCoSector[] = [
  "Power & ET",
  "Utilities",
  "Digital",
  "Midstream",
  "Transportation",
  "Social Infra",
];

export const PORTCO_REGIONS: PortCoRegion[] = [
  "North America",
  "Europe",
  "Asia-Pacific",
  "Latin America",
  "Global",
];

export const PORTCO_STATUSES: PortCoStatus[] = ["Active", "Realized"];

export const PORTCO_COUNTRY_TAGS: PortCoCountryTag[] = ["United States", "Canada", "Mexico"];

// ─── Deal-row entity classification ────────────────────────
// Buyer/seller names that appear in deals but are NOT infrastructure funds.
// Used to:
//   1) exclude these names from the "Top Fund Activity" ranking in DynamicInsightsHero
//   2) suppress the "Infra Fund" tag on deal rows in DealDatabase
// When adding a deal whose buyer is a corporate acquirer, undisclosed party,
// or non-infra investor, add the exact name here.
export const NON_INFRA_FUND_ENTITIES = new Set<string>([
  "Undisclosed Buyer",
  "Undisclosed Seller",
  "Public Market",
  "Bain Capital",
  "Mitsui O.S.K. Lines",
  "Talen Energy",
  "Drax Group",
  "Pilot Fiber",
  "Siris",
  "Polus Capital Management",
  "Corsair Capital",
  "Equinix",
  "Exus Renewables",
  "IHS Towers",
  "TPI Composites",
  "Claro",
  "Taylor Farms",
  "Abertis",
  "VINCI Highways",
  "Technique Solaire",
  "Algoma Central Corporation",
  "Dubai Aerospace Enterprise",
  "Power2X",
  "Nobian",
  "Jupiter Energy Investor",
  "Airtel",
  "DataBank",
  "Goodman",
  "JEXI",
  "Long-term investor consortium",
  "Grupo México",
  "Monarch Private Capital",
  "Neoenergia",
  "T-Mobile",
  "CRH",
  "Enagás",
  "Premier Energy Group",
  "CleanPeak Energy",
  "BrightNight",
  "BMO Financial Group",
  "Halliburton",
  "Craftskills Energy",
  "J&V Energy",
  "Kinetic",
  "Grupo Energía Bogotá",
  "Kimmeridge Energy",
  "Caturus",
  "DivcoWest",
]);
