export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { getDashboardView } from "@/modules/dashboard/queries";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import { currentServerRequestId } from "@/lib/server-request-context";
import { withServerTask } from "@/lib/server-log";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardRoute() {
  try {
    const requestId = await currentServerRequestId();
    return await withServerTask({ route: "/dashboard", operation: "render_dashboard", requestId }, async () => {
      const view = await getDashboardView();
      return <DashboardPage view={view} />;
    });
  } catch {
    return <DataUnavailable title="Dashboard data could not be loaded." retryHref="/dashboard" />;
  }
}
