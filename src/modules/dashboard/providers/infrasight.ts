import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import type { DashboardProvider, DashboardProviderResult } from "@/modules/dashboard/types";
import { observation, todayIsoDate } from "@/modules/dashboard/providers/shared";

type DashboardPrisma = {
  deal: {
    count(args: Record<string, unknown>): Promise<number>;
  };
};

export function infrasightDealFlowProvider(prisma: DashboardPrisma): DashboardProvider {
  return {
    source: DASHBOARD_SOURCES.infrasight,
    async fetch(): Promise<DashboardProviderResult> {
      const end = new Date();
      const start = new Date(end.getTime() - 30 * 86_400_000);
      const count = await prisma.deal.count({
        where: {
          status: "PUBLISHED",
          date: {
            gte: start,
            lte: end,
          },
        },
      });

      return {
        observations: [
          observation("deal_flow_30d", DASHBOARD_SOURCES.infrasight.id, todayIsoDate(end), count, {
            unit: "count",
            metadata: {
              lookbackDays: 30,
              source: "Deal.date where RecordStatus is PUBLISHED",
            },
          }),
        ],
      };
    },
  };
}
