export const revalidate = 300;

import { publicMetadata } from "@/lib/public-metadata";
import { getDealList, getBriefingIssues } from "@/modules/deals/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { DealDatabaseClient } from "@/components/DealDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";

export const metadata = publicMetadata("/tracker");

export default async function TrackerPage() {
  try {
    const [deals, counts, briefingIssues] = await Promise.all([
      getDealList(),
      getDatabaseCounts(),
      getBriefingIssues(),
    ]);
    return <DealDatabaseClient deals={deals} counts={counts} briefingIssues={briefingIssues} />;
  } catch (error) {
    console.error("Database query failed on /tracker:", error);
    return <DataUnavailable title="Deal data could not be loaded." />;
  }
}
