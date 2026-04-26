import { prisma } from "@/lib/prisma";
import {
  FUND_STRATEGY_DISPLAY,
  FUND_STRUCTURE_DISPLAY,
  FUND_STATUS_DISPLAY,
  FUND_SECTOR_DISPLAY,
  FUND_REGION_DISPLAY,
  COMPANY_SECTOR_DISPLAY,
  COMPANY_REGION_DISPLAY,
} from "@/modules/shared/enum-maps";
import type { FundView, PortfolioCompanyView } from "@/modules/shared/types";
import type { Fund as DbFund } from "@/generated/prisma/client";

function toFundView(
  fund: DbFund & {
    manager: { name: string };
    ownershipPeriods: {
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

const FUND_INCLUDE = {
  manager: { select: { name: true } },
  ownershipPeriods: {
    where: { isActive: true },
    include: {
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

export async function getAllFunds(): Promise<FundView[]> {
  const funds = await prisma.fund.findMany({
    where: { status: "PUBLISHED" },
    include: FUND_INCLUDE,
    orderBy: { fundName: "asc" },
  });
  return funds.map(toFundView);
}

export async function getFundById(legacyId: string): Promise<FundView | null> {
  const fund = await prisma.fund.findUnique({
    where: { legacyId },
    include: FUND_INCLUDE,
  });
  return fund ? toFundView(fund) : null;
}

export async function getFundCount(): Promise<number> {
  return prisma.fund.count({ where: { status: "PUBLISHED" } });
}
