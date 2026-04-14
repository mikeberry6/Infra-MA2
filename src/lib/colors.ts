// ─── Color Maps & Helpers ──────────────────────────────────
// Self-contained module — all color records and accessor functions live here.

import type {
  DealSector,
  DealRegion,
  FundStrategy,
  FundStatus,
  FundSector,
  FundRegion,
  FundStructure,
  PortCoSector,
  PortCoRegion,
  PortCoStatus,
  PortCoCountryTag,
  MilestoneCategory,
} from "@/lib/types";

// ─── Deal Colors ───────────────────────────────────────────

export function getSectorColor(sector: string): string {
  switch (sector) {
    case "Transportation":
      return "#8b5cf6";
    case "Power & ET":
      return "#f59e0b";
    case "Midstream":
      return "#f97316";
    case "Utilities":
      return "#06b6d4";
    case "Waste & ES":
      return "#10b981";
    case "Digital":
      return "#3b82f6";
    case "Social":
      return "#ec4899";
    default:
      return "#a1a1aa";
  }
}

export function getCategoryColor(category: string): string {
  if (category.startsWith("Acquisition")) return "#3b82f6";
  if (category.startsWith("Sale")) return "#f59e0b";
  if (category === "Platform Launch") return "#06b6d4";
  if (category === "IPO") return "#10b981";
  if (category === "Joint Venture") return "#06b6d4";
  return "#a1a1aa";
}

export function getRegionColor(region: string): string {
  switch (region) {
    case "North America":
      return "#3b82f6";
    case "Europe":
      return "#8b5cf6";
    case "Asia-Pacific":
      return "#f59e0b";
    case "Middle East & Africa":
      return "#10b981";
    case "Latin America":
      return "#ec4899";
    default:
      return "#a1a1aa";
  }
}

// ─── Fund Colors ───────────────────────────────────────────

const STRATEGY_COLORS: Record<FundStrategy, string> = {
  "Core": "#10b981",
  "Core-Plus": "#06b6d4",
  "Value-Add": "#3b82f6",
  "Opportunistic": "#f59e0b",
  "Growth": "#8b5cf6",
  "Credit / Debt": "#ec4899",
  "Fund-of-Funds": "#a78bfa",
  "Secondaries": "#f97316",
  "Co-Investments": "#14b8a6",
  "Greenfield": "#22c55e",
  "Retail Act '40": "#ef4444",
};

const FUND_STATUS_COLORS: Record<FundStatus, string> = {
  "Evergreen": "#10b981",
  "Financial Close": "#3b82f6",
  "Raising": "#f59e0b",
};

const FUND_SECTOR_COLORS: Record<FundSector, string> = {
  "Transportation": "#3b82f6",
  "Utilities": "#10b981",
  "Digital Infrastructure": "#8b5cf6",
  "Renewables / Energy Transition": "#06b6d4",
  "Waste / Environmental Services": "#84cc16",
  "Power Generation": "#f59e0b",
  "Midstream / Energy": "#ef4444",
  "Social Infrastructure": "#ec4899",
  "Communications": "#6366f1",
  "Logistics": "#f97316",
  "Water": "#0ea5e9",
};

const FUND_REGION_COLORS: Record<FundRegion, string> = {
  "North America": "#3b82f6",
  "Europe": "#10b981",
  "Asia-Pacific": "#f59e0b",
  "Latin America": "#8b5cf6",
  "Middle East & Africa": "#ec4899",
  "Global": "#06b6d4",
};

const STRUCTURE_COLORS: Record<FundStructure, string> = {
  "Open-End": "#10b981",
  "Closed-End": "#3b82f6",
  "Permanent Capital": "#f59e0b",
  "Evergreen": "#06b6d4",
  "Listed / Evergreen": "#0ea5e9",
  "Listed / Closed-End": "#6366f1",
};

export function getStrategyColor(strategy: string): string {
  return STRATEGY_COLORS[strategy as FundStrategy] ?? "#a1a1aa";
}

export function getStatusColor(status: string): string {
  return FUND_STATUS_COLORS[status as FundStatus] ?? "#a1a1aa";
}

export function getFundSectorColor(sector: string): string {
  return FUND_SECTOR_COLORS[sector as FundSector] ?? "#a1a1aa";
}

export function getFundRegionColor(region: string): string {
  return FUND_REGION_COLORS[region as FundRegion] ?? "#a1a1aa";
}

export function getStructureColor(structure: string): string {
  return STRUCTURE_COLORS[structure as FundStructure] ?? "#a1a1aa";
}

export function getSizeRangeColor(): string {
  return "#a78bfa";
}

// ─── PortCo Colors ─────────────────────────────────────────

const PORTCO_SECTOR_COLORS: Record<PortCoSector, string> = {
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

const PORTCO_REGION_COLORS: Record<PortCoRegion, string> = {
  "North America": "#3b82f6",
  "Europe": "#10b981",
  "Asia-Pacific": "#f59e0b",
  "Latin America": "#8b5cf6",
  "Global": "#06b6d4",
};

const PORTCO_STATUS_COLORS: Record<PortCoStatus, string> = {
  "Active": "#10b981",
  "Realized": "#a1a1aa",
};

const COUNTRY_TAG_COLORS: Record<PortCoCountryTag, string> = {
  "United States": "#3b82f6",
  "Canada": "#ef4444",
  "Mexico": "#22c55e",
};

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

export function getPortCoSectorColor(sector: string): string {
  return PORTCO_SECTOR_COLORS[sector as PortCoSector] ?? "#a1a1aa";
}

export function getPortCoRegionColor(region: string): string {
  return PORTCO_REGION_COLORS[region as PortCoRegion] ?? "#a1a1aa";
}

export function getPortCoStatusColor(status: string): string {
  return PORTCO_STATUS_COLORS[status as PortCoStatus] ?? "#a1a1aa";
}

export function getPortCoCountryTagColor(tag: string): string {
  return COUNTRY_TAG_COLORS[tag as PortCoCountryTag] ?? "#a1a1aa";
}

export function getMilestoneCategoryColor(category: string): string {
  return MILESTONE_CATEGORY_COLORS[category as MilestoneCategory] ?? "#71717a";
}

// ─── Activity Colors (DynamicInsightsHero) ─────────────────

export const ACTIVITY_COLORS: Record<string, string> = {
  Acquisition: "#3b82f6",
  Sale: "#f59e0b",
  "Platform Launch": "#06b6d4",
  IPO: "#10b981",
  "Joint Venture": "#8b5cf6",
};

export function getActivityColor(activity: string): string {
  return ACTIVITY_COLORS[activity] ?? "#a1a1aa";
}
