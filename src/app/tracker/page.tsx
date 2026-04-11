export const dynamic = "force-dynamic";

import { getAllDeals } from "@/modules/deals/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { DealDatabaseClient } from "@/components/DealDatabaseClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deal Tracker",
};

export default async function TrackerPage() {
  const [deals, counts] = await Promise.all([
    getAllDeals(),
    getDatabaseCounts(),
  ]);

  return <DealDatabaseClient deals={deals} counts={counts} />;
}
