export const dynamic = "force-dynamic";

import { DealDatabaseClient } from "@/components/DealDatabaseClient";

export default async function Home() {
  try {
    const { getAllDeals } = await import("@/modules/deals/queries");
    const { getDatabaseCounts } = await import("@/modules/insights/queries");

    const [deals, counts] = await Promise.all([
      getAllDeals(),
      getDatabaseCounts(),
    ]);

    return <DealDatabaseClient deals={deals} counts={counts} />;
  } catch (error) {
    console.error("Failed to load deals from database, falling back:", error);
    return <DealDatabaseClient deals={[]} counts={{ deals: 0, funds: 0, portfolio: 0 }} />;
  }
}
