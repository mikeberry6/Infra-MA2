// ─── PortCo Types ───────────────────────────────────────────

export type MilestoneCategory =
  | "Founding"
  | "Acquisition"
  | "Financing"
  | "Expansion"
  | "Management"
  | "Divestiture"
  | "IPO"
  | "Other";

export interface PortCoMilestone {
  date: string;
  event: string;
  category: MilestoneCategory;
}

export type PortCoSector =
  | "Power & ET"
  | "Utilities"
  | "Digital"
  | "Midstream"
  | "Transportation"
  | "Social Infra";

export type PortCoRegion =
  | "North America"
  | "Europe"
  | "Asia-Pacific"
  | "Latin America"
  | "Global";

export type PortCoCountryTag = "United States" | "Canada" | "Mexico";

export const PORTCO_COUNTRY_TAGS: PortCoCountryTag[] = ["United States", "Canada", "Mexico"];

export type PortCoStatus = "Active" | "Realized";

export interface PortCoExecutive {
  name: string;
  title: string;
}

export interface PortCoSource {
  label: string;
  url: string;
}

export interface PortCoOwner {
  investmentFirm: string;
  ownershipVehicle: string;
  investmentYear?: number;
  exitYear?: number;
  stake?: string;
  status: PortCoStatus;
}

export interface PortCo {
  name: string;
  investmentFirm: string;
  sector: PortCoSector;
  subsector: string;
  region: PortCoRegion;
  country: string;
  ownershipVehicle: string;
  description: string;
  status: PortCoStatus;
  countryTags: PortCoCountryTag[];
  website?: string;
  yearFounded?: number;
  investmentYear?: number;
  headquarters?: string;
  milestones?: PortCoMilestone[];
  management?: PortCoExecutive[];
  sources?: PortCoSource[];
  owners?: PortCoOwner[];
}

// ─── Constants ──────────────────────────────────────────────

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

// ─── Color Helpers ──────────────────────────────────────────

const SECTOR_COLORS: Record<PortCoSector, string> = {
  "Power & ET": "#f59e0b",
  "Utilities": "#06b6d4",
  "Digital": "#3b82f6",
  "Midstream": "#f97316",
  "Transportation": "#8b5cf6",
  "Social Infra": "#ec4899",
};

const REGION_COLORS: Record<PortCoRegion, string> = {
  "North America": "#3b82f6",
  "Europe": "#10b981",
  "Asia-Pacific": "#f59e0b",
  "Latin America": "#8b5cf6",
  "Global": "#06b6d4",
};

const STATUS_COLORS: Record<PortCoStatus, string> = {
  "Active": "#10b981",
  "Realized": "#a1a1aa",
};

export function getPortCoSectorColor(sector: string): string {
  return SECTOR_COLORS[sector as PortCoSector] ?? "#a1a1aa";
}

export function getPortCoRegionColor(region: string): string {
  return REGION_COLORS[region as PortCoRegion] ?? "#a1a1aa";
}

export function getPortCoStatusColor(status: string): string {
  return STATUS_COLORS[status as PortCoStatus] ?? "#a1a1aa";
}

const COUNTRY_TAG_COLORS: Record<PortCoCountryTag, string> = {
  "United States": "#3b82f6",
  "Canada": "#ef4444",
  "Mexico": "#22c55e",
};

export function getPortCoCountryTagColor(tag: string): string {
  return COUNTRY_TAG_COLORS[tag as PortCoCountryTag] ?? "#a1a1aa";
}

// ─── Utility Functions ──────────────────────────────────────

export function getUniqueCountries(companies: { country: string }[]): string[] {
  return Array.from(new Set(companies.map((c) => c.country))).sort();
}

export function getUniqueFirms(companies: { investmentFirm: string }[]): string[] {
  return Array.from(new Set(companies.map((c) => c.investmentFirm))).sort();
}

export function getUniqueSubsectors(companies: { subsector: string }[]): string[] {
  return Array.from(new Set(companies.map((c) => c.subsector).filter(Boolean))).sort();
}

export function getUniqueVehicles(companies: { ownershipVehicle: string }[]): string[] {
  return Array.from(new Set(companies.map((c) => c.ownershipVehicle))).sort();
}

// ─── Milestone Colors ──────────────────────────────────────

const MILESTONE_CATEGORY_COLORS: Record<MilestoneCategory, string> = {
  Founding: "#10b981",
  Acquisition: "#3b82f6",
  Financing: "#8b5cf6",
  Expansion: "#06b6d4",
  Management: "#f59e0b",
  Divestiture: "#ef4444",
  IPO: "#059669",
  Other: "#71717a",
};

export function getMilestoneCategoryColor(category: string): string {
  return MILESTONE_CATEGORY_COLORS[category as MilestoneCategory] ?? "#71717a";
}
