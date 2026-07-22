// Shared types for the module layer

import type { SourceFormat, SourcePurpose } from "@/lib/source-utils";

export type { RecordStatus, UserRole } from "@/generated/prisma/client";

// View model types used to pass data from Server Components to Client Components.
// These mirror the TS-file interfaces so client components can switch from
// importing static data to receiving props without changing their internal logic.

export interface DealView {
  id: string;
  legacyId: string;
  title: string;
  target: string;
  buyer: string;
  seller: string;
  sellerDisclosureStatus?: "DISCLOSED" | "NOT_DISCLOSED" | "NOT_APPLICABLE" | "LEGACY_UNREVIEWED";
  sellerDisclosureReason?: string | null;
  sector: string;
  subsector: string;
  region: string;
  category: string[];
  date: string;
  description: string;
  targetDescription: string;
  sourceName: string;
  sourceUrl: string;
  enterpriseValue: string | null;
  equityValue: string | null;
  stake: string | null;
  status: string;
  closingDate: string | null;
  financialAdvisorBuyer: string[] | null;
  financialAdvisorSeller: string[] | null;
  legalAdvisorBuyer: string[] | null;
  legalAdvisorSeller: string[] | null;
  country: string;
  assetScale: string | null;
  valuationMultiple: string | null;
  fundVehicle: string | null;
  keyHighlights: string[] | null;
}

export type DealListItem = Pick<
  DealView,
  | "id"
  | "legacyId"
  | "title"
  | "target"
  | "buyer"
  | "seller"
  | "sector"
  | "subsector"
  | "region"
  | "category"
  | "date"
  | "status"
  | "country"
  | "sourceName"
  | "sourceUrl"
>;

export type DealDetail = DealView;

export interface FundView {
  id: string;
  legacyId: string;
  managerName: string;
  fundName: string;
  ticker: string | null;
  investmentStrategy: string;
  sourceUrls: string[];
  size: string;
  sizeUsdMm: number | null;
  vintage: string;
  strategies: string[];
  structure: string;
  status: string;
  sectors: string[];
  regions: string[];
  portfolioCompanies: PortfolioCompanyView[];
  managerPortfolioCompanies: FundPortfolioCompanyView[];
  strategyUrl: string;
}

export type FundListItem = Pick<
  FundView,
  | "id"
  | "legacyId"
  | "managerName"
  | "fundName"
  | "size"
  | "sizeUsdMm"
  | "vintage"
  | "strategies"
  | "status"
  | "sectors"
>;

export type FundDetail = FundView;

export interface FundStrategyView {
  fundName: string;
  strategies: string[];
}

export interface PortfolioCompanyView {
  name: string;
  sector: string;
  subsector?: string;
  region: string;
  country: string;
  description?: string;
  isActive: boolean;
  investmentYear?: number;
  exitYear?: number;
}

export interface FundPortfolioCompanyView {
  company: PortfolioCompanyView;
  fundName: string;
  strategies: string[];
}

export interface OwnerView {
  firm: string;
  vehicle: string;
  fundName?: string;
  investmentYear?: number;
  exitYear?: number;
  isActive: boolean;
  stake?: string;
}

export interface CompanyView {
  id: string;
  focusIds: string[];
  name: string;
  investmentFirm: string;
  sector: string;
  subsector: string;
  region: string;
  country: string;
  ownershipVehicle: string;
  description: string;
  status: string;
  countryTags: string[];
  website?: string;
  yearFounded?: number;
  investmentYear?: number;
  headquarters?: string;
  milestones?: MilestoneView[];
  management?: ExecutiveView[];
  sources?: SourceView[];
  owners: OwnerView[];
}

/**
 * The portfolio index projection. Drawer-only narrative, evidence, management,
 * milestone, and website fields are intentionally excluded from the initial
 * page payload and are hydrated through the public detail endpoint.
 */
export type CompanyListItem = Pick<
  CompanyView,
  | "id"
  | "focusIds"
  | "name"
  | "investmentFirm"
  | "sector"
  | "subsector"
  | "region"
  | "country"
  | "ownershipVehicle"
  | "status"
  | "countryTags"
  | "investmentYear"
  | "owners"
>;

export type CompanyDetail = CompanyView;

export interface MilestoneView {
  date: string;
  event: string;
  category: string;
}

export interface ExecutiveView {
  name: string;
  title: string;
}

export interface SourceView {
  label: string;
  url: string;
  type?: SourceFormat;
  purpose?: SourcePurpose;
  evidenceLabel?: string;
}

export interface DatabaseCounts {
  deals: number;
  funds: number;
  portfolio: number;
}

export type NewsCategory =
  | "Transaction Activity"
  | "Fundraising Activity"
  | "Portfolio Company News"
  | "Investment Firm News"
  | "Rumored Sales Processes"
  | "Low Confidence / Needs Review";

export type NewsMentionType = "PortCo" | "Investment Firm" | "Fund" | "Deal";

export type NewsConfidence = "High" | "Medium" | "Low";

export interface NewsMentionView {
  id: string;
  label: string;
  type: NewsMentionType;
  href?: string;
  confidence: NewsConfidence;
  reason?: string;
}

export interface NewsItemView {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  sourceName: string;
  sourceUrl: string;
  linkedinUrls: string[];
  publishedAt: string;
  isRumor: boolean;
  confidence: NewsConfidence;
  sector?: string;
  region?: string;
  mentions: NewsMentionView[];
}

export interface NewsFeedView {
  items: NewsItemView[];
  lastUpdated: string | null;
  operations: FeedOperationsView;
}

export interface FeedOperationsView {
  state: "healthy" | "pending" | "overdue" | "failed" | "never-run";
  lastAttemptAt?: string;
  lastSuccessfulAt?: string;
  nextExpectedAt?: string;
  sourceCoverage?: NewsSourceCoverage;
  message: string;
}

export interface NewsSourceCoverage {
  attempted: number;
  succeeded: number;
  failed: number;
}

export interface RecordMeta {
  canonicalId: string;
  updatedAt: string;
  lastVerifiedAt: string | null;
  sourceCount: number;
}

export interface DetailResponse<T> {
  data: T;
  meta: RecordMeta;
}
