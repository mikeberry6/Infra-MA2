export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAllFunds } from "@/modules/funds/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { FundDatabaseClient } from "@/components/FundDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import { currentServerRequestId } from "@/lib/server-request-context";
import { withServerTask } from "@/lib/server-log";

export const metadata: Metadata = {
  title: "Funds",
};

export default async function FundsPage() {
  try {
    const requestId = await currentServerRequestId();
    return await withServerTask({ route: "/funds", operation: "render_funds", requestId }, async () => {
      const [funds, counts] = await withServerTask({
        route: "/funds",
        operation: "load_fund_data",
        requestId,
      }, () => Promise.all([getAllFunds(), getDatabaseCounts()]));
      return <FundDatabaseClient funds={funds} counts={counts} />;
    });
  } catch {
    return <DataUnavailable title="Fund data could not be loaded." retryHref="/funds" />;
  }
}
