export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { getDashboardView } from "@/modules/dashboard/queries";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import {
  logServerRequest,
  SERVER_OPERATIONS,
  SERVER_ROUTES,
} from "@/lib/server-log";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardRoute() {
  const startedAt = performance.now();
  try {
    const view = await getDashboardView();
    logServerRequest({
      route: SERVER_ROUTES.dashboardPage,
      operation: SERVER_OPERATIONS.dashboardPageRead,
      startedAt,
      status: 200,
    });
    return <DashboardPage view={view} />;
  } catch (error) {
    logServerRequest({
      route: SERVER_ROUTES.dashboardPage,
      operation: SERVER_OPERATIONS.dashboardPageRead,
      startedAt,
      status: 500,
      error,
    });
    return <DataUnavailable title="Dashboard data could not be loaded." />;
  }
}
