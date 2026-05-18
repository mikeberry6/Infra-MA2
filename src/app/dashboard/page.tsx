export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { getDashboardView } from "@/modules/dashboard/queries";
import { buildSampleDashboardView } from "@/modules/dashboard/sample";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardRoute() {
  try {
    const view = await getDashboardView();
    return <DashboardPage view={view} />;
  } catch (error) {
    console.error("Dashboard query failed on /dashboard:", error);
    const message = error instanceof Error ? error.message : "Unknown dashboard query error.";
    return (
      <DashboardPage
        view={buildSampleDashboardView("Dashboard query failed; rendering sample fallback.")}
        error={message}
      />
    );
  }
}
