// Shared types for the module layer

import type { SourceFormat, SourcePurpose } from "@/lib/source-utils";

export type { RecordStatus, UserRole } from "@/generated/prisma/client";

// Public list payloads intentionally contain only fields used by the index
// table/cards and filters. Narrative, diligence, and advisor fields are loaded
// from the corresponding detail endpoint when a drawer opens.
export interface DealListItem {
  id: string;
  legacyId: string;
  title: string;
  target: string;
  buyer: string;
  seller: string;
  sector: string;
  subsector: string;
  region: string;
  category: string[];
  date: string;
  sourceName: string;
  sourceUrl: string;
  status: string;
  country: string;
}

export interface DealDetail extends DealListItem {
  sellerDisclosureStatus?: "DISCLOSED" | "NOT_DISCLOSED" | "NOT_APPLICABLE" | "LEGACY_UNREVIEWED";
  sellerDisclosureReason?: string | null;
  description: string;
  targetDescription: string;
  enterpriseValue: string | null;
  equityValue: string | null;
  stake: string | null;
  closingDate: string | null;
  financialAdvisorBuyer: string[] | null;
  financialAdvisorSeller: string[] | null;
  legalAdvisorBuyer: string[] | null;
  legalAdvisorSeller: string[] | null;
  assetScale: string | null;
  valuationMultiple: string | null;
  fundVehicle: string | null;
  keyHighlights: string[] | null;
}

/** Full-detail compatibility name used by admin forms and legacy utilities. */
export type DealView = DealDetail;

export interface FundListItem {
  id: string;
  legacyId: string;
  managerName: string;
  fundName: string;
  size: string;
  sizeUsdMm: number | null;
  vintage: string;
  strategies: string[];
  status: string;
  sectors: string[];
}

export interface FundDetail extends FundListItem {
  ticker: string | null;
  investmentStrategy: string;
  sourceUrls: string[];
  primarySourceUrl: string | null;
  structure: string;
  regions: string[];
  portfolioCompanies: PortfolioCompanyView[];
  managerPortfolioCompanies: FundPortfolioCompanyView[];
  strategyUrl: string;
}

/** Full-detail compatibility name used by admin forms and legacy utilities. */
export type FundView = FundDetail;

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

export interface CompanyListItem {
  id: string;
  focusIds: string[];
  name: string;
  investmentFirm: string;
  sector: string;
  subsector: string;
  region: string;
  country: string;
  ownershipVehicle: string;
  status: string;
  countryTags: string[];
  investmentYear?: number;
  owners: OwnerView[];
}

export interface CompanyDetail extends CompanyListItem {
  description: string;
  website?: string;
  yearFounded?: number;
  headquarters?: string;
  milestones?: MilestoneView[];
  management?: ExecutiveView[];
  sources?: SourceView[];
}

/** Full-detail compatibility name used by admin forms and legacy utilities. */
export type CompanyView = CompanyDetail;

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
  scanWindow?: NewsScanWindowView;
  message: string;
}

export interface NewsScanWindowView {
  selectionDateUtc: string;
  fullUniverseCount: number;
  eligibleCount: number;
  selectedCount: number;
  offset: number;
  windowIndex: number;
  windowsPerCycle: number;
}

export interface NewsSourceCoverage extends Record<string, number> {
  attempted: number;
  succeeded: number;
  failed: number;
}
