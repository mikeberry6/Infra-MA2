import type { Prisma } from "@/generated/prisma/client";
import { companyDedupKeys } from "@/lib/company-key";

export interface CompanyIdentityRow {
  id: string;
  name: string;
  retirement: { companyId: string } | null;
}

type CompanyIdentityClient = Pick<Prisma.TransactionClient, "company">;

export const COMPANY_IDENTITY_SELECT = {
  id: true,
  name: true,
  retirement: { select: { companyId: true } },
} as const;

function overlaps(left: Set<string>, right: Set<string>): boolean {
  for (const key of left) {
    if (right.has(key)) return true;
  }
  return false;
}

export function findCompanyIdentityConflicts(
  name: string,
  rows: CompanyIdentityRow[],
  excludeId?: string,
): CompanyIdentityRow[] {
  const requestedKeys = companyDedupKeys(name);
  return rows.filter((row) => (
    row.id !== excludeId
    && overlaps(requestedKeys, companyDedupKeys(row.name))
  ));
}

export async function queryCompanyIdentityConflicts(
  client: CompanyIdentityClient,
  name: string,
  excludeId?: string,
): Promise<CompanyIdentityRow[]> {
  const rows = await client.company.findMany({ select: COMPANY_IDENTITY_SELECT });
  return findCompanyIdentityConflicts(name, rows, excludeId);
}

export function companyIdentityConflictMessage(conflicts: CompanyIdentityRow[]): string {
  const retired = conflicts.some((row) => row.retirement !== null);
  return retired
    ? "Company identity matches a retired canonical alias and requires reviewed merge/disambiguation."
    : "Company identity matches an existing company and requires reviewed merge/disambiguation.";
}
