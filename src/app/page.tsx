export const dynamic = "force-dynamic";

import { getAllDeals } from "@/modules/deals/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { DealDatabaseClient } from "@/components/DealDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import { canExportData } from "@/modules/auth/guards";

export default async function Home() {
  try {
    const [deals, counts, canExport] = await Promise.all([
      getAllDeals(),
      getDatabaseCounts(),
      canExportData(),
    ]);
    return <DealDatabaseClient deals={deals} counts={counts} canExport={canExport} />;
  } catch (error) {
    console.error("Database query failed on /:", error);
    return <DataUnavailable title="Deal data could not be loaded." />;
  }
}
