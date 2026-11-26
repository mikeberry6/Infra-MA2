export const revalidate = 300;

import { publicMetadata } from "@/lib/public-metadata";
import { getDealList, getBriefingIssues } from "@/modules/deals/queries";
import { DealDatabaseClient } from "@/components/DealDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";

export const metadata = publicMetadata("/tracker");

export default async function TrackerPage() {
  try {
    const [deals, briefingIssues] = await Promise.all([
      getDealList(),
      getBriefingIssues(),
    ]);
    return <DealDatabaseClient deals={deals} briefingIssues={briefingIssues} />;
  } catch (error) {
    console.error("Database query failed on /tracker:", error);
    return <DataUnavailable title="Deal data could not be loaded." />;
  }
}
