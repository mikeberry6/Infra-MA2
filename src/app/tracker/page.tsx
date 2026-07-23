export const revalidate = 300;

import type { Metadata } from "next";
import { getAllDeals } from "@/modules/deals/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { DealDatabaseClient } from "@/components/DealDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import {
  logServerRequest,
  SERVER_OPERATIONS,
  SERVER_ROUTES,
} from "@/lib/server-log";

export const metadata: Metadata = {
  title: "Deal Tracker",
};

export default async function TrackerPage() {
  const startedAt = performance.now();
  try {
    const [deals, counts] = await Promise.all([
      getAllDeals(),
      getDatabaseCounts(),
    ]);
    logServerRequest({
      route: SERVER_ROUTES.trackerPage,
      operation: SERVER_OPERATIONS.trackerPageRead,
      startedAt,
      status: 200,
    });
    return <DealDatabaseClient deals={deals} counts={counts} />;
  } catch (error) {
    logServerRequest({
      route: SERVER_ROUTES.trackerPage,
      operation: SERVER_OPERATIONS.trackerPageRead,
      startedAt,
      status: 500,
      error,
    });
    return <DataUnavailable title="Deal data could not be loaded." />;
  }
}
