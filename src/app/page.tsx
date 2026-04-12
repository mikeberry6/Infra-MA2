export const dynamic = "force-dynamic";

import { getAllDeals } from "@/modules/deals/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { DealDatabaseClient } from "@/components/DealDatabaseClient";

export default async function Home() {
  const [deals, counts] = await Promise.all([
    getAllDeals(),
    getDatabaseCounts(),
  ]);

  return <DealDatabaseClient deals={deals} counts={counts} />;
}
