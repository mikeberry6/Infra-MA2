// Canonical constant arrays for filter UIs
// Re-exported from original data files for now; will become the single source
// once the TS data files are removed.

export {
  FUND_STRATEGIES,
  FUND_STATUSES,
  FUND_SECTORS,
  FUND_REGIONS,
  FUND_STRUCTURES,
  FUND_SIZE_RANGES,
} from "@/data/funds";

export {
  PORTCO_SECTORS,
  PORTCO_REGIONS,
  PORTCO_STATUSES,
  PORTCO_COUNTRY_TAGS,
} from "@/data/portcos/types";

// Deal-level constants (not separately exported from deals.ts, defined here)
export const DEAL_SECTORS = [
  "Transportation",
  "Power & ET",
  "Midstream",
  "Utilities",
  "Waste & ES",
  "Digital",
  "Social",
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
