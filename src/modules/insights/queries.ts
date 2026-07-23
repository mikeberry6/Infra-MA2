import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import type { DatabaseCounts } from "@/modules/shared/types";
import { companyDedupKeys, groupByDedupKeys } from "@/lib/company-key";
import { ACTIVE_COMPANY_WHERE } from "@/modules/companies/retirement";

async function getDatabaseCountsRaw(): Promise<DatabaseCounts> {
  // The portfolio count must match the view-layer dedup in
  // `getAllCompanies` (which groups via `companyDedupKeys` + union-find).
  // Counting cluster sizes — not unique key strings — is required because
  // a single cluster can span multiple keys when parens are involved.
  const [deals, funds, portfolioRows] = await Promise.all([
    prisma.deal.count({ where: { status: "PUBLISHED" } }),
    prisma.fund.count({ where: { status: "PUBLISHED" } }),
    prisma.company.findMany({
      where: { status: "PUBLISHED", ...ACTIVE_COMPANY_WHERE },
      select: { name: true },
    }),
  ]);
  const clusters = groupByDedupKeys(portfolioRows, (c) => companyDedupKeys(c.name));
  return { deals, funds, portfolio: clusters.length };
}

const getDatabaseCountsCached = unstable_cache(
  getDatabaseCountsRaw,
  ["database:counts"],
  { tags: [CACHE_TAGS.counts], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getDatabaseCounts(): Promise<DatabaseCounts> {
  return getDatabaseCountsCached();
}
