import type { DashboardProvider } from "@/modules/dashboard/types";
import { federalRegisterProvider } from "@/modules/dashboard/providers/federal-register";
import { fredProvider } from "@/modules/dashboard/providers/fred";
import { eiaProvider } from "@/modules/dashboard/providers/eia";
import { infrasightDealFlowProvider } from "@/modules/dashboard/providers/infrasight";
import { samGovProvider } from "@/modules/dashboard/providers/sam-gov";
import { secEdgarProvider } from "@/modules/dashboard/providers/sec-edgar";
import { treasuryProvider } from "@/modules/dashboard/providers/treasury";
import { usaSpendingProvider } from "@/modules/dashboard/providers/usaspending";
import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import { keyMissingProvider } from "@/modules/dashboard/providers/shared";

type DashboardPrisma = Parameters<typeof infrasightDealFlowProvider>[0];

export function getDashboardProviders(prisma?: DashboardPrisma): DashboardProvider[] {
  const providers: DashboardProvider[] = [
    treasuryProvider(),
    fredProvider(),
    eiaProvider(),
    usaSpendingProvider(),
    federalRegisterProvider(),
    samGovProvider(),
    secEdgarProvider(),
  ];

  if (prisma) providers.push(infrasightDealFlowProvider(prisma));
  else providers.push(keyMissingProvider(DASHBOARD_SOURCES.infrasight, "DATABASE_URL"));

  return providers;
}
