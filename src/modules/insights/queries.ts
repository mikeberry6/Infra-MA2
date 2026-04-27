import { prisma } from "@/lib/prisma";
import type { DatabaseCounts } from "@/modules/shared/types";
import { canonicalCompanyKey } from "@/lib/company-key";

export async function getDatabaseCounts(): Promise<DatabaseCounts> {
  // The portfolio count must match the view-layer dedup in
  // `getAllCompanies` (which groups by `canonicalCompanyKey(name) | country`).
  // Plain `distinct: ["name"]` would miss entity-suffix and
  // parenthetical-alias variants ("ALLO Communications, LLC" vs
  // "ALLO Communications"), making the tile drift higher than the table.
  const [deals, funds, portfolioRows] = await Promise.all([
    prisma.deal.count({ where: { status: "PUBLISHED" } }),
    prisma.fund.count({ where: { status: "PUBLISHED" } }),
    prisma.company.findMany({
      where: { status: "PUBLISHED" },
      select: { name: true, country: true },
    }),
  ]);
  const portfolioKeys = new Set(
    portfolioRows.map((c) => `${canonicalCompanyKey(c.name)}|${c.country}`),
  );
  return { deals, funds, portfolio: portfolioKeys.size };
}
