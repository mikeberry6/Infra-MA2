import type { Prisma } from "@/generated/prisma/client";

export const PUBLISHED_DEAL_MISSING_PRIMARY_WHERE = {
  status: "PUBLISHED",
  citations: { none: { isPrimary: true } },
} satisfies Prisma.DealWhereInput;

export const PUBLISHED_COMPANY_MISSING_PRIMARY_WHERE = {
  status: "PUBLISHED",
  citations: { none: { isPrimary: true } },
} satisfies Prisma.CompanyWhereInput;

export const PUBLISHED_FUND_SOURCE_REVIEW_WHERE = {
  status: "PUBLISHED",
} satisfies Prisma.FundWhereInput;

export function fundHasSource(fund: { sourceUrls: string[]; strategyUrl: string }): boolean {
  return fund.sourceUrls.some((url) => url.trim().length > 0)
    || fund.strategyUrl.trim().length > 0;
}

export function coveragePercentage(covered: number, total: number): number {
  return total === 0 ? 100 : Math.round((covered / total) * 10_000) / 100;
}

export function sourceCoverageIsComplete(input: {
  dealsMissingPrimary: number;
  fundsMissingSource: number;
  companiesMissingPrimary: number;
}): boolean {
  return input.dealsMissingPrimary === 0
    && input.fundsMissingSource === 0
    && input.companiesMissingPrimary === 0;
}
