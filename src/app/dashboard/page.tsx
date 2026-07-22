export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { getDashboardView } from "@/modules/dashboard/queries";
import { DataUnavailable } from "@/components/shared/DataUnavailable";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardRoute() {
  try {
    const view = await getDashboardView();
    return <DashboardPage view={view} />;
  } catch (error) {
    console.error("Dashboard query failed on /dashboard:", error);
    return <DataUnavailable title="Dashboard data could not be loaded." />;
  }
}
