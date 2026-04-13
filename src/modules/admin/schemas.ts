import { z } from "zod";

// ── Valid display-string values (derived from enum-maps) ──────────────

const DEAL_SECTORS = [
  "Transportation",
  "Power & ET",
  "Midstream",
  "Utilities",
  "Waste & ES",
  "Digital",
  "Social",
] as const;

const DEAL_REGIONS = [
  "North America",
  "Europe",
  "Asia-Pacific",
  "Middle East & Africa",
  "Latin America",
] as const;

const DEAL_CATEGORIES = [
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

const DEAL_STATUSES = [
  "Announced",
  "Closed",
  "Pending Regulatory Approval",
  "Terminated",
] as const;

const FUND_STRATEGIES = [
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
] as const;

const FUND_STRUCTURES = [
  "Open-End",
  "Closed-End",
  "Permanent Capital",
  "Evergreen",
  "Listed / Evergreen",
  "Listed / Closed-End",
] as const;

const FUND_STATUSES = [
  "Evergreen",
  "Financial Close",
  "Raising",
] as const;

const FUND_SECTORS = [
  "Transportation",
  "Utilities",
  "Digital Infrastructure",
  "Renewables / Energy Transition",
  "Waste / Environmental Services",
  "Power Generation",
  "Midstream / Energy",
  "Social Infrastructure",
  "Communications",
  "Logistics",
  "Water",
] as const;

const FUND_REGIONS = [
  "North America",
  "Europe",
  "Asia-Pacific",
  "Latin America",
  "Middle East & Africa",
  "Global",
] as const;

const COMPANY_SECTORS = [
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
] as const;

const COMPANY_REGIONS = [
  "North America",
  "Europe",
  "Asia-Pacific",
  "Latin America",
  "Global",
] as const;

const COMPANY_STATUSES = [
  "Active",
  "Realized",
] as const;

// ── Deal Schema ───────────────────────────────────────────────────────

export const dealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  target: z.string().min(1, "Target is required"),
  buyer: z.string().min(1, "Buyer is required"),
  seller: z.string().min(1, "Seller is required"),
  sector: z.enum(DEAL_SECTORS, { message: "Invalid deal sector" }),
  region: z.enum(DEAL_REGIONS, { message: "Invalid deal region" }),
  category: z
    .array(z.enum(DEAL_CATEGORIES, { message: "Invalid deal category" }))
    .min(1, "At least one category is required"),
  date: z.string().min(1, "Date is required").refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "Invalid date format" },
  ),
  description: z.string().min(1, "Description is required"),
  targetDescription: z.string().default(""),
  country: z.string().default(""),
  status: z.enum(DEAL_STATUSES, { message: "Invalid deal status" }),

  // Optional financial fields
  enterpriseValue: z.string().optional(),
  equityValue: z.string().optional(),
  stake: z.string().optional(),
  closingDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid closing date format",
    }),

  // Optional detail fields
  assetScale: z.string().optional(),
  valuationMultiple: z.string().optional(),
  fundVehicle: z.string().optional(),
  keyHighlights: z.array(z.string()).optional(),

  // Source
  sourceName: z.string().optional(),
  sourceUrl: z.string().url("Invalid source URL").optional().or(z.literal("")),

  // Advisors
  financialAdvisorBuyer: z.array(z.string()).optional(),
  financialAdvisorSeller: z.array(z.string()).optional(),
  legalAdvisorBuyer: z.array(z.string()).optional(),
  legalAdvisorSeller: z.array(z.string()).optional(),
});

export type DealInput = z.infer<typeof dealSchema>;

// ── Fund Schema ───────────────────────────────────────────────────────

export const fundSchema = z.object({
  managerName: z.string().min(1, "Manager name is required"),
  fundName: z.string().min(1, "Fund name is required"),
  investmentStrategy: z.string().optional(),
  size: z.string().min(1, "Size is required"),
  sizeUsdMm: z.number().optional(),
  vintage: z.string().min(1, "Vintage is required"),
  strategies: z
    .array(z.enum(FUND_STRATEGIES, { message: "Invalid fund strategy" }))
    .min(1, "At least one strategy is required"),
  structure: z.enum(FUND_STRUCTURES, { message: "Invalid fund structure" }),
  status: z.enum(FUND_STATUSES, { message: "Invalid fund status" }),
  sectors: z.array(z.enum(FUND_SECTORS, { message: "Invalid fund sector" })).default([]),
  regions: z.array(z.enum(FUND_REGIONS, { message: "Invalid fund region" })).default([]),
  sourceUrls: z.array(z.string().url("Invalid source URL")).optional(),
  ticker: z.string().optional(),
  strategyUrl: z.string().url("Invalid strategy URL").optional().or(z.literal("")),
});

export type FundInput = z.infer<typeof fundSchema>;

// ── Company Schema ────────────────────────────────────────────────────

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  country: z.string().min(1, "Country is required"),
  sector: z.enum(COMPANY_SECTORS, { message: "Invalid company sector" }),
  subsector: z.string().optional(),
  region: z.enum(COMPANY_REGIONS, { message: "Invalid company region" }),
  description: z.string().optional(),
  status: z.enum(COMPANY_STATUSES, { message: "Invalid company status" }).default("Active"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  yearFounded: z.number().int().min(1800).max(2100).optional(),
  investmentYear: z.number().int().min(1900).max(2100).optional(),
  headquarters: z.string().optional(),
  investmentFirm: z.string().optional(),
  ownershipVehicle: z.string().optional(),
});

export type CompanyInput = z.infer<typeof companySchema>;
