import type { Prisma } from "@/generated/prisma/client";

export type CompanyRetirement = {
  retiredId: string;
  companyId: string;
};

export const ACTIVE_COMPANY_WHERE = {
  retirement: { is: null },
} satisfies Prisma.CompanyWhereInput;

// Canonical survivors with retired IDs must keep their status, name, and
// ownership shape stable while Phase 1 remains a rollback target.
export const MUTABLE_COMPANY_WHERE = {
  ...ACTIVE_COMPANY_WHERE,
  redirects: { none: {} },
} satisfies Prisma.CompanyWhereInput;

export function excludeRedirectedCompanies<T extends { id: string }>(
  companies: readonly T[],
  redirects: readonly Pick<CompanyRetirement, "retiredId">[],
): T[] {
  if (redirects.length === 0) return [...companies];
  const retiredIds = new Set(redirects.map((redirect) => redirect.retiredId));
  return companies.filter((company) => !retiredIds.has(company.id));
}

export function companyRetirementMap(
  redirects: readonly CompanyRetirement[],
): ReadonlyMap<string, string> {
  return new Map(redirects.map((redirect) => [redirect.retiredId, redirect.companyId]));
}
