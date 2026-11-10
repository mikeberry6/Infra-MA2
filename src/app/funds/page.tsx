export const revalidate = 300;

import { publicMetadata } from "@/lib/public-metadata";
import { getFundList } from "@/modules/funds/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { FundDatabaseClient } from "@/components/FundDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";

export const metadata = publicMetadata("/funds");

export default async function FundsPage() {
  try {
    const [funds, counts] = await Promise.all([
      getFundList(),
      getDatabaseCounts(),
    ]);
    return <FundDatabaseClient funds={funds} counts={counts} />;
  } catch (error) {
    console.error("Database query failed on /funds:", error);
    return <DataUnavailable title="Fund data could not be loaded." />;
  }
}
