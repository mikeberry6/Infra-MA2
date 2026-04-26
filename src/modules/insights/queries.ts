import { prisma } from "@/lib/prisma";
import type { DatabaseCounts } from "@/modules/shared/types";

export async function getDatabaseCounts(): Promise<DatabaseCounts> {
  // The portfolio count uses DISTINCT on company name to match the view layer's
  // dedup (see `mergeByName` in src/modules/companies/queries.ts). Without this
  // the tile reports the raw row count (1,207) while the table — which renders
  // one card per company — shows 1,194, a confusing discrepancy.
  const [deals, funds, portfolioRows] = await Promise.all([
    prisma.deal.count({ where: { status: "PUBLISHED" } }),
    prisma.fund.count({ where: { status: "PUBLISHED" } }),
    prisma.company.findMany({ where: { status: "PUBLISHED" }, select: { name: true }, distinct: ["name"] }),
  ]);
  return { deals, funds, portfolio: portfolioRows.length };
}
