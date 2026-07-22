import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import type { DatabaseCounts } from "@/modules/shared/types";

async function getDatabaseCountsRaw(): Promise<DatabaseCounts> {
  const [deals, funds, portfolio] = await Promise.all([
    prisma.deal.count({ where: { status: "PUBLISHED" } }),
    prisma.fund.count({ where: { status: "PUBLISHED" } }),
    prisma.company.count({ where: { status: "PUBLISHED" } }),
  ]);
  return { deals, funds, portfolio };
}

const getDatabaseCountsCached = unstable_cache(
  getDatabaseCountsRaw,
  ["database:counts"],
  { tags: [CACHE_TAGS.counts], revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getDatabaseCounts(): Promise<DatabaseCounts> {
  return getDatabaseCountsCached();
}
