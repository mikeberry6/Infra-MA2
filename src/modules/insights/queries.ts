import { prisma } from "@/lib/prisma";
import type { DatabaseCounts } from "@/modules/shared/types";
import { companyDedupKeys, groupByDedupKeys } from "@/lib/company-key";

export async function getDatabaseCounts(): Promise<DatabaseCounts> {
  // The portfolio count must match the view-layer dedup in
  // `getAllCompanies` (which groups via `companyDedupKeys` + union-find).
  // Counting cluster sizes — not unique key strings — is required because
  // a single cluster can span multiple keys when parens are involved.
  const [deals, funds, portfolioRows] = await Promise.all([
    prisma.deal.count({ where: { status: "PUBLISHED" } }),
    prisma.fund.count({ where: { status: "PUBLISHED" } }),
    prisma.company.findMany({
      where: { status: "PUBLISHED" },
      select: { name: true },
    }),
  ]);
  const clusters = groupByDedupKeys(portfolioRows, (c) => companyDedupKeys(c.name));
  return { deals, funds, portfolio: clusters.length };
}
