export const dynamic = "force-dynamic";

import { getAllDeals } from "@/modules/deals/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { DealDatabaseClient } from "@/components/DealDatabaseClient";

export default async function Home() {
  try {
    const [deals, counts] = await Promise.all([
      getAllDeals(),
      getDatabaseCounts(),
    ]);
    return <DealDatabaseClient deals={deals} counts={counts} />;
  } catch (error) {
    console.error("Database query failed on /:", error);
    return <DealDatabaseClient deals={[]} counts={{ deals: 0, funds: 0, portfolio: 0 }} />;
  }
}
