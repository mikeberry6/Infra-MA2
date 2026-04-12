export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAllDeals } from "@/modules/deals/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { DealDatabaseClient } from "@/components/DealDatabaseClient";

export const metadata: Metadata = {
  title: "Deal Tracker",
};

export default async function TrackerPage() {
  try {
    const [deals, counts] = await Promise.all([
      getAllDeals(),
      getDatabaseCounts(),
    ]);
    return <DealDatabaseClient deals={deals} counts={counts} />;
  } catch (error) {
    console.error("Database query failed on /tracker:", error);
    return <DealDatabaseClient deals={[]} counts={{ deals: 0, funds: 0, portfolio: 0 }} />;
  }
}
