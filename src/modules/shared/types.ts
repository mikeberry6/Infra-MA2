// Shared types for the module layer

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
  strategyUrl: string;
}

export interface PortfolioCompanyView {
  name: string;
  sector: string;
  subsector?: string;
  region: string;
  country: string;
  description?: string;
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
}

export interface DatabaseCounts {
  deals: number;
  funds: number;
  portfolio: number;
}
