import { prisma } from "@/lib/prisma";
import type { DatabaseCounts } from "@/modules/shared/types";

export async function getDatabaseCounts(): Promise<DatabaseCounts> {
  const [deals, funds, portfolio] = await Promise.all([
    prisma.deal.count({ where: { status: "PUBLISHED" } }),
    prisma.fund.count({ where: { status: "PUBLISHED" } }),
    prisma.company.count({ where: { status: "PUBLISHED" } }),
  ]);
  return { deals, funds, portfolio };
}
