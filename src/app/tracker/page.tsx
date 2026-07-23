export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAllDeals } from "@/modules/deals/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { DealDatabaseClient } from "@/components/DealDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import { currentServerRequestId } from "@/lib/server-request-context";
import { withServerTask } from "@/lib/server-log";

export const metadata: Metadata = {
  title: "Deal Tracker",
};

export default async function TrackerPage() {
  try {
    const requestId = await currentServerRequestId();
    return await withServerTask({ route: "/tracker", operation: "render_tracker", requestId }, async () => {
      const [deals, counts] = await withServerTask({
        route: "/tracker",
        operation: "load_tracker_data",
        requestId,
      }, () => Promise.all([getAllDeals(), getDatabaseCounts()]));
      return <DealDatabaseClient deals={deals} counts={counts} />;
    });
  } catch {
    return <DataUnavailable title="Deal data could not be loaded." retryHref="/tracker" />;
  }
}
