export const revalidate = 300;

import type { Metadata } from "next";
import { getAllFunds } from "@/modules/funds/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { FundDatabaseClient } from "@/components/FundDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import { withServerTask } from "@/lib/server-log";

export const metadata: Metadata = {
  title: "Funds",
};

export default async function FundsPage() {
  try {
    return await withServerTask({ route: "/funds", operation: "render_funds" }, async () => {
      const [funds, counts] = await Promise.all([
        getAllFunds(),
        getDatabaseCounts(),
      ]);
      return <FundDatabaseClient funds={funds} counts={counts} />;
    });
  } catch {
    return <DataUnavailable title="Fund data could not be loaded." retryHref="/funds" />;
  }
}
