// ─── Color Maps & Helpers ──────────────────────────────────
// Self-contained module — all color records and accessor functions live here.
//
// Palette philosophy: a single harmonious gamut shared across all categorical
// dimensions (sectors, regions, strategies, etc.). Hex values are tuned toward
// the Mercury / Linear / Stripe sensibility — slightly cooler, slightly less
// saturated than raw Tailwind defaults, so colors read as a family rather than
// a marker palette. Categories that share a meaning (e.g. Acquisition + North
// America + Value-Add as the "primary blue") deliberately share a hex.

import type {
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

// ─── Core gamut (single source of truth) ───────────────────
// Every categorical color the app uses is one of these. Keeping the palette
// to ~10 colors total is what makes the dot+text encoding feel coherent.

const PALETTE = {
  blue: "#3b6cf2",      // cooler than tailwind blue-500, less saturated
  violet: "#7d6cf0",    // lavender, not candy purple
  cyan: "#1796b4",      // deeper teal, more confident than cyan-500
  green: "#1d9d76",     // muted emerald, less neon
  emerald: "#168c66",   // distinct from green for callouts (entry markers)
  amber: "#d98b1c",     // warmer ochre, not kid-poster amber
  orange: "#dd6a1c",    // warmer than tailwind orange
  rose: "#d6498f",      // less hot than tailwind pink
  red: "#d8443f",       // warmer than tailwind red, less candy
  lime: "#7ab83a",      // muted, distinct from green
  teal: "#1d9b8e",      // for co-investments / similar
  indigo: "#5b6dd9",    // muted indigo for communications
  sky: "#1c8fd1",       // for water / sky-coded categories
  lavender: "#9988e8",  // softer purple for fund-of-funds
} as const;

// Neutral fallbacks — never carry meaning, used when a value isn't in the map.
const FALLBACK = "#a1a1aa";
const MILESTONE_FALLBACK = "#71717a";

// ─── Deal Colors ───────────────────────────────────────────

export function getSectorColor(sector: string): string {
  switch (sector) {
    case "Power & ET":
      return PALETTE.amber;
    case "Utilities":
      return PALETTE.cyan;
    case "Digital":
      return PALETTE.blue;
    case "Midstream":
      return PALETTE.orange;
    case "Transportation":
      return PALETTE.violet;
    case "Social Infra":
      return PALETTE.rose;
    default:
      return FALLBACK;
  }
}

export function getCategoryColor(category: string): string {
  if (category.startsWith("Acquisition")) return PALETTE.blue;
  if (category.startsWith("Sale")) return PALETTE.amber;
  if (category === "Platform Launch") return PALETTE.cyan;
  if (category === "IPO") return PALETTE.green;
  if (category === "Joint Venture") return PALETTE.cyan;
  return FALLBACK;
}

export function getRegionColor(region: string): string {
  switch (region) {
    case "North America":
      return PALETTE.blue;
    case "Europe":
      return PALETTE.violet;
    case "Asia-Pacific":
      return PALETTE.amber;
    case "Middle East & Africa":
      return PALETTE.green;
    case "Latin America":
      return PALETTE.rose;
    default:
      return FALLBACK;
  }
}

/**
 * Buyer / Seller role color — used by the deal-activity ranking and the
 * deal-drawer "Infra Fund" badge. Buyers carry the primary blue (the same as
 * the Acquisition category, which is intentional — buying = acquiring); sellers
 * carry the secondary amber.
 */
export function getDealPartyRoleColor(role: "Buyer" | "Seller"): string {
  return role === "Buyer" ? PALETTE.blue : PALETTE.amber;
}

// ─── Fund Colors ───────────────────────────────────────────

const STRATEGY_COLORS: Record<FundStrategy, string> = {
  "Core": PALETTE.green,
  "Core-Plus": PALETTE.cyan,
  "Value-Add": PALETTE.blue,
  "Opportunistic": PALETTE.amber,
  "Growth": PALETTE.violet,
  "Credit / Debt": PALETTE.rose,
  "Fund-of-Funds": PALETTE.lavender,
  "Secondaries": PALETTE.orange,
  "Co-Investments": PALETTE.teal,
  "Greenfield": PALETTE.lime,
  "Retail Act '40": PALETTE.red,
};

const FUND_STATUS_COLORS: Record<FundStatus, string> = {
  "Evergreen": PALETTE.green,
  "Financial Close": PALETTE.blue,
  "Raising": PALETTE.amber,
};

const FUND_SECTOR_COLORS: Record<FundSector, string> = {
  "Power & ET": PALETTE.amber,
  "Utilities": PALETTE.cyan,
  "Digital": PALETTE.blue,
  "Midstream": PALETTE.orange,
  "Transportation": PALETTE.violet,
  "Social Infra": PALETTE.rose,
};

const FUND_REGION_COLORS: Record<FundRegion, string> = {
  "North America": PALETTE.blue,
  "Europe": PALETTE.green,
  "Asia-Pacific": PALETTE.amber,
  "Latin America": PALETTE.violet,
  "Middle East & Africa": PALETTE.rose,
  "Global": PALETTE.cyan,
};

const STRUCTURE_COLORS: Record<FundStructure, string> = {
  "Open-End": PALETTE.green,
  "Closed-End": PALETTE.blue,
  "Permanent Capital": PALETTE.amber,
  "Evergreen": PALETTE.cyan,
  "Listed / Evergreen": PALETTE.sky,
  "Listed / Closed-End": PALETTE.indigo,
};

export function getStrategyColor(strategy: string): string {
  return STRATEGY_COLORS[strategy as FundStrategy] ?? FALLBACK;
}

export function getStatusColor(status: string): string {
  return FUND_STATUS_COLORS[status as FundStatus] ?? FALLBACK;
}

export function getFundSectorColor(sector: string): string {
  return FUND_SECTOR_COLORS[sector as FundSector] ?? FALLBACK;
}

export function getFundRegionColor(region: string): string {
  return FUND_REGION_COLORS[region as FundRegion] ?? FALLBACK;
}

export function getStructureColor(structure: string): string {
  return STRUCTURE_COLORS[structure as FundStructure] ?? FALLBACK;
}

export function getSizeRangeColor(): string {
  return PALETTE.lavender;
}

// ─── PortCo Colors ─────────────────────────────────────────

const PORTCO_SECTOR_COLORS: Record<PortCoSector, string> = {
  "Power & ET": PALETTE.amber,
  "Utilities": PALETTE.cyan,
  "Digital": PALETTE.blue,
  "Midstream": PALETTE.orange,
  "Transportation": PALETTE.violet,
  "Social Infra": PALETTE.rose,
};

const PORTCO_REGION_COLORS: Record<PortCoRegion, string> = {
  "North America": PALETTE.blue,
  "Europe": PALETTE.green,
  "Asia-Pacific": PALETTE.amber,
  "Latin America": PALETTE.violet,
  "Global": PALETTE.cyan,
};

const PORTCO_STATUS_COLORS: Record<PortCoStatus, string> = {
  "Active": PALETTE.green,
  "Realized": FALLBACK,
};

const COUNTRY_TAG_COLORS: Record<PortCoCountryTag, string> = {
  "United States": PALETTE.blue,
  "Canada": PALETTE.red,
  "Mexico": PALETTE.green,
};

const MILESTONE_CATEGORY_COLORS: Record<MilestoneCategory, string> = {
  Founding: PALETTE.green,
  Acquisition: PALETTE.blue,
  Financing: PALETTE.violet,
  Expansion: PALETTE.cyan,
  Management: PALETTE.amber,
  Divestiture: PALETTE.red,
  IPO: PALETTE.emerald,
  Other: MILESTONE_FALLBACK,
};

export function getPortCoSectorColor(sector: string): string {
  return PORTCO_SECTOR_COLORS[sector as PortCoSector] ?? FALLBACK;
}

export function getPortCoRegionColor(region: string): string {
  return PORTCO_REGION_COLORS[region as PortCoRegion] ?? FALLBACK;
}

export function getPortCoStatusColor(status: string): string {
  return PORTCO_STATUS_COLORS[status as PortCoStatus] ?? FALLBACK;
}

export function getPortCoCountryTagColor(tag: string): string {
  return COUNTRY_TAG_COLORS[tag as PortCoCountryTag] ?? FALLBACK;
}

export function getMilestoneCategoryColor(category: string): string {
  return MILESTONE_CATEGORY_COLORS[category as MilestoneCategory] ?? MILESTONE_FALLBACK;
}

// ─── Activity Colors (DynamicInsightsHero) ─────────────────

export const ACTIVITY_COLORS: Record<string, string> = {
  Acquisition: PALETTE.blue,
  Sale: PALETTE.amber,
  "Platform Launch": PALETTE.cyan,
  IPO: PALETTE.green,
  "Joint Venture": PALETTE.violet,
};

export function getActivityColor(activity: string): string {
  return ACTIVITY_COLORS[activity] ?? FALLBACK;
}

// ─── Admin / record meta colors ────────────────────────────

/**
 * Record-level publish status used in admin index pages. The dot-only
 * treatment keeps admin tables visually quiet while still flagging drafts.
 */
export function getRecordStatusColor(status: string): string {
  switch (status) {
    case "PUBLISHED":
      return PALETTE.green;
    case "DRAFT":
      return PALETTE.amber;
    case "ARCHIVED":
      return FALLBACK;
    default:
      return FALLBACK;
  }
}

/**
 * User role color — admin / analyst / viewer. Used as a small dot prefix in
 * the admin users page.
 */
export function getUserRoleColor(role: string): string {
  switch (role) {
    case "ADMIN":
      return PALETTE.red;
    case "ANALYST":
      return PALETTE.blue;
    case "VIEWER":
      return FALLBACK;
    default:
      return FALLBACK;
  }
}
