import type { Prisma } from "@/generated/prisma/client";
import { isHttpUrl } from "@/lib/source-utils";

export const PUBLISHED_DEAL_MISSING_PRIMARY_WHERE = {
  status: "PUBLISHED",
  citations: { none: { isPrimary: true } },
} satisfies Prisma.DealWhereInput;

export const PUBLISHED_COMPANY_MISSING_PRIMARY_WHERE = {
  status: "PUBLISHED",
  citations: { none: { isPrimary: true } },
} satisfies Prisma.CompanyWhereInput;

export const PUBLISHED_FUND_PRIMARY_SOURCE_REVIEW_WHERE = {
  status: "PUBLISHED",
} satisfies Prisma.FundWhereInput;

export function fundHasPrimarySource(fund: { primarySourceUrl: string | null }): boolean {
  return isHttpUrl(fund.primarySourceUrl);
}

export function coveragePercentage(covered: number, total: number): number {
  return total === 0 ? 100 : Math.round((covered / total) * 10_000) / 100;
}

export function sourceCoverageIsComplete(input: {
  dealsMissingPrimary: number;
  fundsMissingPrimary: number;
  companiesMissingPrimary: number;
}): boolean {
  return input.dealsMissingPrimary === 0
    && input.fundsMissingPrimary === 0
    && input.companiesMissingPrimary === 0;
}
