import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import {
  FUND_STRATEGY_DISPLAY,
  FUND_STRUCTURE_DISPLAY,
  FUND_STATUS_DISPLAY,
  FUND_SECTOR_DISPLAY,
  FUND_REGION_DISPLAY,
  COMPANY_SECTOR_DISPLAY,
  COMPANY_REGION_DISPLAY,
} from "@/modules/shared/enum-maps";
import type { FundListItem, FundStrategyView, FundView, PortfolioCompanyView } from "@/modules/shared/types";
import type { Fund as DbFund } from "@/generated/prisma/client";

function toFundView(
  fund: DbFund & {
    manager: { name: string };
    ownershipPeriods: {
      isActive: boolean;
      investmentYear: number | null;
      exitYear: number | null;
      company: {
        name: string;
        sector: string;
        subsector: string;
        region: string;
        country: string;
        description: string;
      };
    }[];
  },
): FundView {
  const portfolioCompanies: PortfolioCompanyView[] = fund.ownershipPeriods.map((op) => ({
    name: op.company.name,
    sector:
      COMPANY_SECTOR_DISPLAY[op.company.sector as keyof typeof COMPANY_SECTOR_DISPLAY] ||
      op.company.sector,
    subsector: op.company.subsector || undefined,
    region:
      COMPANY_REGION_DISPLAY[op.company.region as keyof typeof COMPANY_REGION_DISPLAY] ||
      op.company.region,
    country: op.company.country,
    description: op.company.description || undefined,
    isActive: op.isActive,
    investmentYear: op.investmentYear ?? undefined,
    exitYear: op.exitYear ?? undefined,
  }));

  return {
    id: fund.legacyId,
    legacyId: fund.legacyId,
    managerName: fund.manager.name,
    fundName: fund.fundName,
    ticker: fund.ticker,
    investmentStrategy: fund.investmentStrategy,
    sourceUrls: fund.sourceUrls,
    size: fund.size,
    sizeUsdMm: fund.sizeUsdMm,
    vintage: fund.vintage,
    strategies: fund.strategies.map((s) => FUND_STRATEGY_DISPLAY[s]),
    structure: FUND_STRUCTURE_DISPLAY[fund.structure],
    status: FUND_STATUS_DISPLAY[fund.fundStatus],
    sectors: fund.sectors.map((s) => FUND_SECTOR_DISPLAY[s]),
    regions: fund.regions.map((r) => FUND_REGION_DISPLAY[r]),
    portfolioCompanies,
    strategyUrl: fund.strategyUrl,
  };
}

// Include both active and realized ownership periods. The drawer flags
// realized investments visually so users see the full track record.
const FUND_INCLUDE = {
  manager: { select: { name: true } },
  ownershipPeriods: {
    // A published fund must never expose an editorial company record through
    // its nested holdings. This relation-level predicate is deliberately kept
    // in the database query (rather than filtering the mapped response) so
    // draft, in-review, and archived company fields never cross the public
    // query boundary.
    where: { company: { status: "PUBLISHED" } },
    select: {
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
    },
  },
} as const;

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
} as const;

async function getAllFundsRaw(): Promise<FundListItem[]> {
  const funds = await prisma.fund.findMany({
    where: { status: "PUBLISHED" },
    select: FUND_LIST_SELECT,
    orderBy: { fundName: "asc" },
  });
  return funds.map((fund) => ({
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
  }));
}

const getAllFundsCached = unstable_cache(
  getAllFundsRaw,
  ["funds:all"],
  { tags: [CACHE_TAGS.funds], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getAllFunds(): Promise<FundListItem[]> {
  return getAllFundsCached();
}

export async function getAllFundDetails(): Promise<FundView[]> {
  const funds = await prisma.fund.findMany({
    where: { status: "PUBLISHED" },
    include: FUND_INCLUDE,
    orderBy: { fundName: "asc" },
  });
  return funds.map(toFundView);
}

async function getFundStrategyIndexRaw(): Promise<FundStrategyView[]> {
  const funds = await prisma.fund.findMany({
    where: { status: "PUBLISHED" },
    select: {
      fundName: true,
      strategies: true,
    },
    orderBy: { fundName: "asc" },
  });
  return funds.map((fund) => ({
    fundName: fund.fundName,
    strategies: fund.strategies.map((strategy) => FUND_STRATEGY_DISPLAY[strategy]),
  }));
}

const getFundStrategyIndexCached = unstable_cache(
  getFundStrategyIndexRaw,
  ["funds:strategy-index"],
  { tags: [CACHE_TAGS.funds], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getFundStrategyIndex(): Promise<FundStrategyView[]> {
  return getFundStrategyIndexCached();
}

export async function getFundById(legacyId: string): Promise<FundView | null> {
  const fund = await prisma.fund.findFirst({
    where: { legacyId, status: "PUBLISHED" },
    include: FUND_INCLUDE,
  });
  return fund ? toFundView(fund) : null;
}

export async function getFundCount(): Promise<number> {
  return prisma.fund.count({ where: { status: "PUBLISHED" } });
}
