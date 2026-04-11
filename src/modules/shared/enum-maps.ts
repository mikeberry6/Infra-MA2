// Bidirectional mapping between Prisma DB enums (SCREAMING_SNAKE)
// and the display strings used in the existing TypeScript data files and UI.

import type {
  FundStrategy as DbFundStrategy,
  FundStructure as DbFundStructure,
  FundStatusEnum as DbFundStatus,
  FundSectorEnum as DbFundSector,
  FundRegionEnum as DbFundRegion,
  CompanySector as DbCompanySector,
  CompanyRegion as DbCompanyRegion,
  CompanyStatus as DbCompanyStatus,
  DealSector as DbDealSector,
  DealRegion as DbDealRegion,
  DealCategory as DbDealCategory,
  DealStatusEnum as DbDealStatus,
  MilestoneCategory as DbMilestoneCategory,
  ParticipantRole as DbParticipantRole,
} from "@/generated/prisma/client";

// ── Fund Strategy ──────────────────────────────────────────

export const FUND_STRATEGY_MAP: Record<string, DbFundStrategy> = {
  "Core": "CORE",
  "Core-Plus": "CORE_PLUS",
  "Value-Add": "VALUE_ADD",
  "Opportunistic": "OPPORTUNISTIC",
  "Growth": "GROWTH",
  "Credit / Debt": "CREDIT_DEBT",
  "Fund-of-Funds": "FUND_OF_FUNDS",
  "Secondaries": "SECONDARIES",
  "Co-Investments": "CO_INVESTMENTS",
  "Greenfield": "GREENFIELD",
  "Retail Act '40": "RETAIL_ACT_40",
};

export const FUND_STRATEGY_DISPLAY: Record<DbFundStrategy, string> = {
  CORE: "Core",
  CORE_PLUS: "Core-Plus",
  VALUE_ADD: "Value-Add",
  OPPORTUNISTIC: "Opportunistic",
  GROWTH: "Growth",
  CREDIT_DEBT: "Credit / Debt",
  FUND_OF_FUNDS: "Fund-of-Funds",
  SECONDARIES: "Secondaries",
  CO_INVESTMENTS: "Co-Investments",
  GREENFIELD: "Greenfield",
  RETAIL_ACT_40: "Retail Act '40",
};

// ── Fund Structure ─────────────────────────────────────────

export const FUND_STRUCTURE_MAP: Record<string, DbFundStructure> = {
  "Open-End": "OPEN_END",
  "Closed-End": "CLOSED_END",
  "Permanent Capital": "PERMANENT_CAPITAL",
  "Evergreen": "EVERGREEN",
  "Listed / Evergreen": "LISTED_EVERGREEN",
  "Listed / Closed-End": "LISTED_CLOSED_END",
};

export const FUND_STRUCTURE_DISPLAY: Record<DbFundStructure, string> = {
  OPEN_END: "Open-End",
  CLOSED_END: "Closed-End",
  PERMANENT_CAPITAL: "Permanent Capital",
  EVERGREEN: "Evergreen",
  LISTED_EVERGREEN: "Listed / Evergreen",
  LISTED_CLOSED_END: "Listed / Closed-End",
};

// ── Fund Status ────────────────────────────────────────────

export const FUND_STATUS_MAP: Record<string, DbFundStatus> = {
  "Evergreen": "EVERGREEN",
  "Financial Close": "FINANCIAL_CLOSE",
  "Raising": "RAISING",
};

export const FUND_STATUS_DISPLAY: Record<DbFundStatus, string> = {
  EVERGREEN: "Evergreen",
  FINANCIAL_CLOSE: "Financial Close",
  RAISING: "Raising",
};

// ── Fund Sector ────────────────────────────────────────────

export const FUND_SECTOR_MAP: Record<string, DbFundSector> = {
  "Transportation": "TRANSPORTATION",
  "Utilities": "UTILITIES",
  "Digital Infrastructure": "DIGITAL_INFRASTRUCTURE",
  "Renewables / Energy Transition": "RENEWABLES_ENERGY_TRANSITION",
  "Waste / Environmental Services": "WASTE_ENVIRONMENTAL_SERVICES",
  "Power Generation": "POWER_GENERATION",
  "Midstream / Energy": "MIDSTREAM_ENERGY",
  "Social Infrastructure": "SOCIAL_INFRASTRUCTURE",
  "Communications": "COMMUNICATIONS",
  "Logistics": "LOGISTICS",
  "Water": "WATER",
};

export const FUND_SECTOR_DISPLAY: Record<DbFundSector, string> = {
  TRANSPORTATION: "Transportation",
  UTILITIES: "Utilities",
  DIGITAL_INFRASTRUCTURE: "Digital Infrastructure",
  RENEWABLES_ENERGY_TRANSITION: "Renewables / Energy Transition",
  WASTE_ENVIRONMENTAL_SERVICES: "Waste / Environmental Services",
  POWER_GENERATION: "Power Generation",
  MIDSTREAM_ENERGY: "Midstream / Energy",
  SOCIAL_INFRASTRUCTURE: "Social Infrastructure",
  COMMUNICATIONS: "Communications",
  LOGISTICS: "Logistics",
  WATER: "Water",
};

// ── Fund Region ────────────────────────────────────────────

export const FUND_REGION_MAP: Record<string, DbFundRegion> = {
  "North America": "NORTH_AMERICA",
  "Europe": "EUROPE",
  "Asia-Pacific": "ASIA_PACIFIC",
  "Latin America": "LATIN_AMERICA",
  "Middle East & Africa": "MIDDLE_EAST_AFRICA",
  "Global": "GLOBAL",
};

export const FUND_REGION_DISPLAY: Record<DbFundRegion, string> = {
  NORTH_AMERICA: "North America",
  EUROPE: "Europe",
  ASIA_PACIFIC: "Asia-Pacific",
  LATIN_AMERICA: "Latin America",
  MIDDLE_EAST_AFRICA: "Middle East & Africa",
  GLOBAL: "Global",
};

// ── Company Sector ─────────────────────────────────────────

export const COMPANY_SECTOR_MAP: Record<string, DbCompanySector> = {
  "Transportation": "TRANSPORTATION",
  "Digital Infrastructure": "DIGITAL_INFRASTRUCTURE",
  "Energy Transition": "ENERGY_TRANSITION",
  "Power Generation": "POWER_GENERATION",
  "Midstream Energy": "MIDSTREAM_ENERGY",
  "Regulated Utilities": "REGULATED_UTILITIES",
  "Utilities": "UTILITIES",
  "Social Infrastructure": "SOCIAL_INFRASTRUCTURE",
  "Environmental / Waste": "ENVIRONMENTAL_WASTE",
  "Renewable Resources": "RENEWABLE_RESOURCES",
  "Infrastructure Services": "INFRASTRUCTURE_SERVICES",
};

export const COMPANY_SECTOR_DISPLAY: Record<DbCompanySector, string> = {
  TRANSPORTATION: "Transportation",
  DIGITAL_INFRASTRUCTURE: "Digital Infrastructure",
  ENERGY_TRANSITION: "Energy Transition",
  POWER_GENERATION: "Power Generation",
  MIDSTREAM_ENERGY: "Midstream Energy",
  REGULATED_UTILITIES: "Regulated Utilities",
  UTILITIES: "Utilities",
  SOCIAL_INFRASTRUCTURE: "Social Infrastructure",
  ENVIRONMENTAL_WASTE: "Environmental / Waste",
  RENEWABLE_RESOURCES: "Renewable Resources",
  INFRASTRUCTURE_SERVICES: "Infrastructure Services",
};

// ── Company Region ─────────────────────────────────────────

export const COMPANY_REGION_MAP: Record<string, DbCompanyRegion> = {
  "North America": "NORTH_AMERICA",
  "Europe": "EUROPE",
  "Asia-Pacific": "ASIA_PACIFIC",
  "Latin America": "LATIN_AMERICA",
  "Global": "GLOBAL",
};

export const COMPANY_REGION_DISPLAY: Record<DbCompanyRegion, string> = {
  NORTH_AMERICA: "North America",
  EUROPE: "Europe",
  ASIA_PACIFIC: "Asia-Pacific",
  LATIN_AMERICA: "Latin America",
  GLOBAL: "Global",
};

// ── Company Status ─────────────────────────────────────────

export const COMPANY_STATUS_MAP: Record<string, DbCompanyStatus> = {
  "Active": "ACTIVE",
  "Realized": "REALIZED",
};

export const COMPANY_STATUS_DISPLAY: Record<DbCompanyStatus, string> = {
  ACTIVE: "Active",
  REALIZED: "Realized",
};

// ── Deal Sector ────────────────────────────────────────────

export const DEAL_SECTOR_MAP: Record<string, DbDealSector> = {
  "Transportation": "TRANSPORTATION",
  "Power & ET": "POWER_ET",
  "Midstream": "MIDSTREAM",
  "Utilities": "UTILITIES",
  "Waste & ES": "WASTE_ES",
  "Digital": "DIGITAL",
  "Social": "SOCIAL",
};

export const DEAL_SECTOR_DISPLAY: Record<DbDealSector, string> = {
  TRANSPORTATION: "Transportation",
  POWER_ET: "Power & ET",
  MIDSTREAM: "Midstream",
  UTILITIES: "Utilities",
  WASTE_ES: "Waste & ES",
  DIGITAL: "Digital",
  SOCIAL: "Social",
};

// ── Deal Region ────────────────────────────────────────────

export const DEAL_REGION_MAP: Record<string, DbDealRegion> = {
  "North America": "NORTH_AMERICA",
  "Europe": "EUROPE",
  "Asia-Pacific": "ASIA_PACIFIC",
  "Middle East & Africa": "MIDDLE_EAST_AFRICA",
  "Latin America": "LATIN_AMERICA",
};

export const DEAL_REGION_DISPLAY: Record<DbDealRegion, string> = {
  NORTH_AMERICA: "North America",
  EUROPE: "Europe",
  ASIA_PACIFIC: "Asia-Pacific",
  MIDDLE_EAST_AFRICA: "Middle East & Africa",
  LATIN_AMERICA: "Latin America",
};

// ── Deal Category ──────────────────────────────────────────

export const DEAL_CATEGORY_MAP: Record<string, DbDealCategory> = {
  "Acquisition (Buyout)": "ACQUISITION_BUYOUT",
  "Acquisition (Majority Stake)": "ACQUISITION_MAJORITY_STAKE",
  "Acquisition (Minority Stake)": "ACQUISITION_MINORITY_STAKE",
  "Acquisition (Bolt-On)": "ACQUISITION_BOLT_ON",
  "Sale (Buyout)": "SALE_BUYOUT",
  "Sale (Majority Stake)": "SALE_MAJORITY_STAKE",
  "Sale (Minority Stake)": "SALE_MINORITY_STAKE",
  "Sale (Carve-Out)": "SALE_CARVE_OUT",
  "Platform Launch": "PLATFORM_LAUNCH",
  "IPO": "IPO",
  "Joint Venture": "JOINT_VENTURE",
};

export const DEAL_CATEGORY_DISPLAY: Record<DbDealCategory, string> = {
  ACQUISITION_BUYOUT: "Acquisition (Buyout)",
  ACQUISITION_MAJORITY_STAKE: "Acquisition (Majority Stake)",
  ACQUISITION_MINORITY_STAKE: "Acquisition (Minority Stake)",
  ACQUISITION_BOLT_ON: "Acquisition (Bolt-On)",
  SALE_BUYOUT: "Sale (Buyout)",
  SALE_MAJORITY_STAKE: "Sale (Majority Stake)",
  SALE_MINORITY_STAKE: "Sale (Minority Stake)",
  SALE_CARVE_OUT: "Sale (Carve-Out)",
  PLATFORM_LAUNCH: "Platform Launch",
  IPO: "IPO",
  JOINT_VENTURE: "Joint Venture",
};

// ── Deal Status ────────────────────────────────────────────

export const DEAL_STATUS_MAP: Record<string, DbDealStatus> = {
  "Announced": "ANNOUNCED",
  "Closed": "CLOSED",
  "Pending Regulatory Approval": "PENDING_REGULATORY_APPROVAL",
  "Terminated": "TERMINATED",
};

export const DEAL_STATUS_DISPLAY: Record<DbDealStatus, string> = {
  ANNOUNCED: "Announced",
  CLOSED: "Closed",
  PENDING_REGULATORY_APPROVAL: "Pending Regulatory Approval",
  TERMINATED: "Terminated",
};

// ── Milestone Category ─────────────────────────────────────

export const MILESTONE_CATEGORY_MAP: Record<string, DbMilestoneCategory> = {
  "Founding": "FOUNDING",
  "Acquisition": "ACQUISITION",
  "Financing": "FINANCING",
  "Expansion": "EXPANSION",
  "Management": "MANAGEMENT",
  "Divestiture": "DIVESTITURE",
  "IPO": "IPO",
  "Other": "OTHER",
};

export const MILESTONE_CATEGORY_DISPLAY: Record<DbMilestoneCategory, string> = {
  FOUNDING: "Founding",
  ACQUISITION: "Acquisition",
  FINANCING: "Financing",
  EXPANSION: "Expansion",
  MANAGEMENT: "Management",
  DIVESTITURE: "Divestiture",
  IPO: "IPO",
  OTHER: "Other",
};

// ── Participant Role ───────────────────────────────────────

export const PARTICIPANT_ROLE_DISPLAY: Record<DbParticipantRole, string> = {
  BUYER: "Buyer",
  SELLER: "Seller",
  FINANCIAL_ADVISOR_BUYER: "Financial Advisor (Buyer)",
  FINANCIAL_ADVISOR_SELLER: "Financial Advisor (Seller)",
  LEGAL_ADVISOR_BUYER: "Legal Advisor (Buyer)",
  LEGAL_ADVISOR_SELLER: "Legal Advisor (Seller)",
};
