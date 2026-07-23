import { unstable_cache } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import { dataCacheKeyParts } from "@/lib/data-cache-namespace";
import { prisma } from "@/lib/prisma";
import { ACTIVE_COMPANY_WHERE } from "@/modules/companies/retirement";
import {
  COMPANY_REGION_DISPLAY,
  COMPANY_SECTOR_DISPLAY,
  FUND_REGION_DISPLAY,
  FUND_SECTOR_DISPLAY,
  FUND_STATUS_DISPLAY,
  FUND_STRATEGY_DISPLAY,
  FUND_STRUCTURE_DISPLAY,
} from "@/modules/shared/enum-maps";
import type {
  DetailResponse,
  FundDetail,
  FundListItem,
  FundPortfolioCompanyView,
  FundStrategyView,
  PortfolioCompanyView,
} from "@/modules/shared/types";

const PUBLISHED_ACTIVE_COMPANY_WHERE = {
  status: "PUBLISHED",
  ...ACTIVE_COMPANY_WHERE,
} satisfies Prisma.CompanyWhereInput;

const OWNERSHIP_PERIOD_SELECT = {
  isActive: true,
  investmentYear: true,
  exitYear: true,
  company: {
    select: {
      name: true,
      sector: true,
      subsector: true,
      region: true,
      country: true,
      description: true,
    },
  },
} satisfies Prisma.OwnershipPeriodSelect;

const PUBLISHED_OWNERSHIP_RELATION = {
  where: { company: PUBLISHED_ACTIVE_COMPANY_WHERE },
  select: OWNERSHIP_PERIOD_SELECT,
  orderBy: { createdAt: "asc" },
} satisfies Prisma.Fund$ownershipPeriodsArgs;

const FUND_LIST_SELECT = {
  legacyId: true,
  fundName: true,
  size: true,
  sizeUsdMm: true,
  vintage: true,
  strategies: true,
  fundStatus: true,
  sectors: true,
  manager: { select: { name: true } },
} satisfies Prisma.FundSelect;

const FUND_EXPORT_INCLUDE = {
  manager: { select: { name: true } },
  ownershipPeriods: PUBLISHED_OWNERSHIP_RELATION,
} satisfies Prisma.FundInclude;

const FUND_DETAIL_INCLUDE = {
  ownershipPeriods: PUBLISHED_OWNERSHIP_RELATION,
  manager: {
    select: {
      name: true,
      managedFunds: {
        where: { status: "PUBLISHED" },
        orderBy: { fundName: "asc" },
        select: {
          fundName: true,
          strategies: true,
          ownershipPeriods: PUBLISHED_OWNERSHIP_RELATION,
        },
      },
    },
  },
} satisfies Prisma.FundInclude;

type FundListRow = Prisma.FundGetPayload<{ select: typeof FUND_LIST_SELECT }>;
type FundExportRow = Prisma.FundGetPayload<{ include: typeof FUND_EXPORT_INCLUDE }>;
type FundDetailRow = Prisma.FundGetPayload<{ include: typeof FUND_DETAIL_INCLUDE }>;
type OwnershipPeriodRow = FundExportRow["ownershipPeriods"][number];

function toPortfolioCompany(period: OwnershipPeriodRow): PortfolioCompanyView {
  return {
    name: period.company.name,
    sector: COMPANY_SECTOR_DISPLAY[period.company.sector],
    subsector: period.company.subsector || undefined,
    region: COMPANY_REGION_DISPLAY[period.company.region],
    country: period.company.country,
    description: period.company.description || undefined,
    isActive: period.isActive,
    investmentYear: period.investmentYear ?? undefined,
    exitYear: period.exitYear ?? undefined,
  };
}

function toFundListItem(fund: FundListRow): FundListItem {
  return {
    id: fund.legacyId,
    legacyId: fund.legacyId,
    managerName: fund.manager.name,
    fundName: fund.fundName,
    size: fund.size,
    sizeUsdMm: fund.sizeUsdMm,
    vintage: fund.vintage,
    strategies: fund.strategies.map((strategy) => FUND_STRATEGY_DISPLAY[strategy]),
    status: FUND_STATUS_DISPLAY[fund.fundStatus],
    sectors: fund.sectors.map((sector) => FUND_SECTOR_DISPLAY[sector]),
  };
}

function ownPortfolioEntries(fund: FundExportRow): FundPortfolioCompanyView[] {
  const strategies = fund.strategies.map((strategy) => FUND_STRATEGY_DISPLAY[strategy]);
  return fund.ownershipPeriods.map((period) => ({
    company: toPortfolioCompany(period),
    fundName: fund.fundName,
    strategies,
  }));
}

function toFundDetail(
  fund: FundExportRow,
  managerPortfolioCompanies: FundPortfolioCompanyView[],
): FundDetail {
  return {
    id: fund.legacyId,
    legacyId: fund.legacyId,
    managerName: fund.manager.name,
    fundName: fund.fundName,
    ticker: fund.ticker,
    investmentStrategy: fund.investmentStrategy,
    sourceUrls: fund.sourceUrls,
    primarySourceUrl: fund.primarySourceUrl,
    size: fund.size,
    sizeUsdMm: fund.sizeUsdMm,
    vintage: fund.vintage,
    strategies: fund.strategies.map((strategy) => FUND_STRATEGY_DISPLAY[strategy]),
    structure: FUND_STRUCTURE_DISPLAY[fund.structure],
    status: FUND_STATUS_DISPLAY[fund.fundStatus],
    sectors: fund.sectors.map((sector) => FUND_SECTOR_DISPLAY[sector]),
    regions: fund.regions.map((region) => FUND_REGION_DISPLAY[region]),
    portfolioCompanies: fund.ownershipPeriods.map(toPortfolioCompany),
    managerPortfolioCompanies,
    strategyUrl: fund.strategyUrl,
  };
}

function sourceCount(fund: Pick<FundDetailRow, "primarySourceUrl" | "sourceUrls" | "strategyUrl">): number {
  return new Set(
    [fund.primarySourceUrl, ...fund.sourceUrls, fund.strategyUrl]
      .map((url) => url?.trim())
      .filter((url): url is string => Boolean(url)),
  ).size;
}

async function getAllFundsRaw(): Promise<FundListItem[]> {
  const funds = await prisma.fund.findMany({
    where: { status: "PUBLISHED" },
    select: FUND_LIST_SELECT,
    orderBy: { fundName: "asc" },
  });
  return funds.map(toFundListItem);
}

const getAllFundsCached = unstable_cache(
  getAllFundsRaw,
  dataCacheKeyParts("funds", "list"),
  { tags: [CACHE_TAGS.funds], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getAllFunds(): Promise<FundListItem[]> {
  return getAllFundsCached();
}

async function getAllFundDetailsRaw(): Promise<FundDetail[]> {
  const funds = await prisma.fund.findMany({
    where: { status: "PUBLISHED" },
    include: FUND_EXPORT_INCLUDE,
    orderBy: { fundName: "asc" },
  });
  const managerPortfolios = new Map<string, FundPortfolioCompanyView[]>();
  for (const fund of funds) {
    const existing = managerPortfolios.get(fund.managerId) ?? [];
    existing.push(...ownPortfolioEntries(fund));
    managerPortfolios.set(fund.managerId, existing);
  }
  return funds.map((fund) => toFundDetail(
    fund,
    managerPortfolios.get(fund.managerId) ?? [],
  ));
}

const getAllFundDetailsCached = unstable_cache(
  getAllFundDetailsRaw,
  dataCacheKeyParts("funds", "export-details"),
  { tags: [CACHE_TAGS.funds], revalidate: CACHE_REVALIDATE_SECONDS },
);

/** Full published collection for authenticated exports. */
export async function getAllFundDetails(): Promise<FundDetail[]> {
  return getAllFundDetailsCached();
}

async function getFundStrategyIndexRaw(): Promise<FundStrategyView[]> {
  const funds = await prisma.fund.findMany({
    where: { status: "PUBLISHED" },
    select: { fundName: true, strategies: true },
    orderBy: { fundName: "asc" },
  });
  return funds.map((fund) => ({
    fundName: fund.fundName,
    strategies: fund.strategies.map((strategy) => FUND_STRATEGY_DISPLAY[strategy]),
  }));
}

const getFundStrategyIndexCached = unstable_cache(
  getFundStrategyIndexRaw,
  dataCacheKeyParts("funds", "strategy-index"),
  { tags: [CACHE_TAGS.funds], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getFundStrategyIndex(): Promise<FundStrategyView[]> {
  return getFundStrategyIndexCached();
}

/** One query-layer operation returns data and metadata from the same row read. */
export async function getFundDetailResponse(
  legacyId: string,
): Promise<DetailResponse<FundDetail> | null> {
  const fund = await prisma.fund.findFirst({
    where: { legacyId, status: "PUBLISHED" },
    include: FUND_DETAIL_INCLUDE,
  });
  if (!fund) return null;

  const managerPortfolioCompanies = fund.manager.managedFunds.flatMap((managerFund) => {
    const strategies = managerFund.strategies.map((strategy) => FUND_STRATEGY_DISPLAY[strategy]);
    return managerFund.ownershipPeriods.map((period) => ({
      company: toPortfolioCompany(period),
      fundName: managerFund.fundName,
      strategies,
    }));
  });
  const detail = toFundDetail(fund, managerPortfolioCompanies);

  return {
    data: detail,
    meta: {
      canonicalId: fund.legacyId,
      updatedAt: fund.updatedAt.toISOString(),
      lastVerifiedAt: fund.lastVerifiedAt?.toISOString() ?? null,
      sourceCount: sourceCount(fund),
    },
  };
}

export async function getFundById(legacyId: string): Promise<FundDetail | null> {
  return (await getFundDetailResponse(legacyId))?.data ?? null;
}

export async function getFundCount(): Promise<number> {
  return prisma.fund.count({ where: { status: "PUBLISHED" } });
}
