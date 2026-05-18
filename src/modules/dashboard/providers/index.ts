import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import type { DashboardProvider } from "@/modules/dashboard/types";
import { federalRegisterProvider } from "@/modules/dashboard/providers/federal-register";
import { fredProvider } from "@/modules/dashboard/providers/fred";
import { infrasightDealFlowProvider } from "@/modules/dashboard/providers/infrasight";
import { treasuryProvider } from "@/modules/dashboard/providers/treasury";
import { usaSpendingProvider } from "@/modules/dashboard/providers/usaspending";
import { keyMissingProvider, placeholderProvider } from "@/modules/dashboard/providers/shared";

type DashboardPrisma = Parameters<typeof infrasightDealFlowProvider>[0];

export function getDashboardProviders(prisma?: DashboardPrisma): DashboardProvider[] {
  const providers: DashboardProvider[] = [
    treasuryProvider(),
    fredProvider(),
    usaSpendingProvider(),
    federalRegisterProvider(),
  ];

  if (prisma) providers.push(infrasightDealFlowProvider(prisma));

  providers.push(
    process.env.EIA_API_KEY
      ? placeholderProvider(DASHBOARD_SOURCES.eia, "EIA adapter is scaffolded but not enabled for production import yet.")
      : keyMissingProvider(DASHBOARD_SOURCES.eia, "EIA_API_KEY"),
    process.env.SAM_API_KEY
      ? placeholderProvider(DASHBOARD_SOURCES.samGov, "SAM.gov opportunities adapter is scaffolded; map opportunity fields before enabling writes.")
      : keyMissingProvider(DASHBOARD_SOURCES.samGov, "SAM_API_KEY"),
    placeholderProvider(DASHBOARD_SOURCES.sec, "SEC EDGAR watchlist requires a configured watchlist and compliant SEC user agent before automated polling."),
    placeholderProvider(DASHBOARD_SOURCES.manual, "Manual CSV/import adapters for EMMA, ISO/RTO, TSA, FHWA, AAR, FCC, NTIA, EPA, and licensed data are not configured yet."),
  );

  return providers;
}
