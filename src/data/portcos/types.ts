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
  | "Transportation"
  | "Digital Infrastructure"
  | "Energy Transition"
  | "Power Generation"
  | "Midstream Energy"
  | "Regulated Utilities"
  | "Utilities"
  | "Social Infrastructure"
  | "Environmental / Waste"
  | "Renewable Resources"
  | "Infrastructure Services";

export type PortCoRegion =
  | "North America"
  | "Europe"
  | "Asia-Pacific"
  | "Latin America"
  | "Global";

export type PortCoStatus = "Active" | "Realized";

export interface PortCoExecutive {
  name: string;
  title: string;
}

export interface PortCoSource {
  label: string;
  url: string;
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
  website?: string;
  yearFounded?: number;
  investmentYear?: number;
  headquarters?: string;
  milestones?: PortCoMilestone[];
  management?: PortCoExecutive[];
  sources?: PortCoSource[];
}

// ─── Constants ──────────────────────────────────────────────

export const PORTCO_SECTORS: PortCoSector[] = [
  "Transportation",
  "Digital Infrastructure",
  "Energy Transition",
  "Power Generation",
  "Midstream Energy",
  "Regulated Utilities",
  "Utilities",
  "Social Infrastructure",
  "Environmental / Waste",
  "Renewable Resources",
  "Infrastructure Services",
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
  "Transportation": "#3b82f6",
  "Digital Infrastructure": "#8b5cf6",
  "Energy Transition": "#06b6d4",
  "Power Generation": "#f59e0b",
  "Midstream Energy": "#f97316",
  "Regulated Utilities": "#10b981",
  "Utilities": "#0ea5e9",
  "Social Infrastructure": "#ec4899",
  "Environmental / Waste": "#84cc16",
  "Renewable Resources": "#22c55e",
  "Infrastructure Services": "#a78bfa",
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

export function getPortCoSectorColor(sector: PortCoSector): string {
  return SECTOR_COLORS[sector] ?? "#a1a1aa";
}

export function getPortCoRegionColor(region: PortCoRegion): string {
  return REGION_COLORS[region] ?? "#a1a1aa";
}

export function getPortCoStatusColor(status: PortCoStatus): string {
  return STATUS_COLORS[status] ?? "#a1a1aa";
}

// ─── Utility Functions ──────────────────────────────────────

export function getUniqueCountries(companies: PortCo[]): string[] {
  return Array.from(new Set(companies.map((c) => c.country))).sort();
}

export function getUniqueFirms(companies: PortCo[]): string[] {
  return Array.from(new Set(companies.map((c) => c.investmentFirm))).sort();
}

export function getUniqueSubsectors(companies: PortCo[]): string[] {
  return Array.from(new Set(companies.map((c) => c.subsector).filter(Boolean))).sort();
}

export function getUniqueVehicles(companies: PortCo[]): string[] {
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

export function getMilestoneCategoryColor(category: MilestoneCategory): string {
  return MILESTONE_CATEGORY_COLORS[category] ?? "#71717a";
}
