// ─── Deal Colors ───────────────────────────────────────────

import type { DealSector, DealCategory, DealRegion } from "@/data/deals";
import type {
  FundStrategy,
  FundStatus,
  FundSector,
  FundRegion,
  FundStructure,
} from "@/data/funds";
import type {
  PortCoSector,
  PortCoRegion,
  PortCoStatus,
  PortCoCountryTag,
  MilestoneCategory,
} from "@/data/portcos/types";

// Re-export all color functions from their original locations
// This module serves as the canonical import point for UI color helpers
export {
  getSectorColor,
  getCategoryColor,
  getRegionColor,
} from "@/data/deals";

export {
  getStrategyColor,
  getStatusColor,
  getFundSectorColor,
  getFundRegionColor,
  getStructureColor,
  getSizeRangeColor,
} from "@/data/funds";

export {
  getPortCoSectorColor,
  getPortCoRegionColor,
  getPortCoStatusColor,
  getPortCoCountryTagColor,
  getMilestoneCategoryColor,
} from "@/data/portcos/types";

// Activity type colors (used in DynamicInsightsHero)
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
