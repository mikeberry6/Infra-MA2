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
import type { FundStrategyView, FundView, PortfolioCompanyView } from "@/modules/shared/types";
import type { Prisma } from "@/generated/prisma/client";
import { isPublicSponsor, SPONSOR_IDENTITY_SELECT } from "@/lib/sponsor-profile";

const SIZE_BASIS_LABELS = {
  TARGET: "Target",
  AMOUNT_SOLD: "Amount sold",
  FIRST_CLOSE: "First close",
  FINAL_CLOSE: "Final close",
  AUM: "Assets under management",
  COMMITMENTS: "Commitments",
} as const;

type FundListRow = Prisma.FundGetPayload<{ select: typeof FUND_LIST_SELECT }>;
type FundDetailRow = Prisma.FundGetPayload<{ include: typeof FUND_INCLUDE }>;

function toFundView(fund: FundListRow | FundDetailRow): FundView {
  const detail = "ownershipPeriods" in fund ? fund : null;
  const portfolioCompanies: PortfolioCompanyView[] = (detail?.ownershipPeriods ?? []).map((op) => ({
    companyId: op.company.id,
    fundAttribution: op.fundAttribution,
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
    managerId: isPublicSponsor(fund.manager) ? fund.manager.id : undefined,
    fundName: fund.fundName,
    ticker: fund.ticker,
    investmentStrategy: detail?.investmentStrategy ?? "",
    sourceUrls: detail?.sourceUrls ?? [],
    size: fund.size,
    sizeUsdMm: fund.sizeUsdMm,
    sizeBasis: fund.sizeBasis ? SIZE_BASIS_LABELS[fund.sizeBasis] : undefined,
    sizeAsOf: fund.sizeAsOf?.toISOString().slice(0, 10),
    sizeNativeAmount: fund.sizeNativeAmount?.toString(),
    sizeNativeCurrency: fund.sizeNativeCurrency ?? undefined,
    sizeSourceUrl: detail?.evidence.find(({ supportedFields }) => supportedFields.some((field) =>
      ["size", "sizeUsdMm", "sizeNativeAmount", "sizeBasis"].includes(field)
    ))?.source.url
      ?? detail?.primarySourceUrl ?? detail?.sourceUrls[0],
    vintage: fund.vintage,
    strategies: fund.strategies.map((s) => FUND_STRATEGY_DISPLAY[s]),
    structure: FUND_STRUCTURE_DISPLAY[fund.structure],
    status: FUND_STATUS_DISPLAY[fund.fundStatus],
    sectors: fund.sectors.map((s) => FUND_SECTOR_DISPLAY[s]),
    regions: fund.regions.map((r) => FUND_REGION_DISPLAY[r]),
    portfolioCompanies,
    strategyUrl: detail?.strategyUrl ?? "",
  };
}

// Include both active and realized ownership periods. The drawer flags
// realized investments visually so users see the full track record.
const FUND_INCLUDE = {
  manager: { select: SPONSOR_IDENTITY_SELECT },
  evidence: {
    select: { source: { select: { url: true } }, supportedFields: true },
    orderBy: { retrievedAt: "desc" },
  },
  ownershipPeriods: {
    where: { company: { status: "PUBLISHED" } },
    select: {
      isActive: true,
      investmentYear: true,
      exitYear: true,
      fundAttribution: true,
      company: {
        select: {
          id: true,
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
  ticker: true,
  manager: FUND_INCLUDE.manager,
  size: true,
  sizeUsdMm: true,
  sizeBasis: true,
  sizeAsOf: true,
  sizeNativeAmount: true,
  sizeNativeCurrency: true,
  vintage: true,
  strategies: true,
  structure: true,
  fundStatus: true,
  sectors: true,
  regions: true,
} as const satisfies Prisma.FundSelect;

async function getFundListRaw(): Promise<FundView[]> {
  const funds = await prisma.fund.findMany({
    where: { status: "PUBLISHED" },
    select: FUND_LIST_SELECT,
    orderBy: { fundName: "asc" },
  });
  return funds.map(toFundView);
}

export const getFundList = unstable_cache(
  getFundListRaw,
  ["funds:list:coverage-v1"],
  { tags: [CACHE_TAGS.funds], revalidate: CACHE_REVALIDATE_SECONDS },
);

async function getAllFundsRaw(): Promise<FundView[]> {
  const funds = await prisma.fund.findMany({
    where: { status: "PUBLISHED" },
    include: FUND_INCLUDE,
    orderBy: { fundName: "asc" },
  });
  return funds.map(toFundView);
}

const getAllFundsCached = unstable_cache(
  getAllFundsRaw,
  ["funds:all:coverage-v2"],
  { tags: [CACHE_TAGS.funds, CACHE_TAGS.companies], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getAllFunds(): Promise<FundView[]> {
  return getAllFundsCached();
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
  const fund = await prisma.fund.findUnique({
    where: { legacyId, status: "PUBLISHED" },
    include: FUND_INCLUDE,
  });
  return fund ? toFundView(fund) : null;
}

export async function getFundCount(): Promise<number> {
  return prisma.fund.count({ where: { status: "PUBLISHED" } });
}
