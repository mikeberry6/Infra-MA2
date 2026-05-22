export const revalidate = 300;

import { getAllDeals } from "@/modules/deals/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { DealDatabaseClient } from "@/components/DealDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";

export default async function Home() {
  try {
    const [deals, counts] = await Promise.all([
      getAllDeals(),
      getDatabaseCounts(),
    ]);
    return <DealDatabaseClient deals={deals} counts={counts} />;
  } catch (error) {
    console.error("Database query failed on /:", error);
    return <DataUnavailable title="Deal data could not be loaded." />;
  }
}
