export const revalidate = 300;

import type { Metadata } from "next";
import { getAllFunds } from "@/modules/funds/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { FundDatabaseClient } from "@/components/FundDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import {
  logServerRequest,
  SERVER_OPERATIONS,
  SERVER_ROUTES,
} from "@/lib/server-log";

export const metadata: Metadata = {
  title: "Funds",
};

export default async function FundsPage() {
  const startedAt = performance.now();
  try {
    const [funds, counts] = await Promise.all([
      getAllFunds(),
      getDatabaseCounts(),
    ]);
    logServerRequest({
      route: SERVER_ROUTES.fundsPage,
      operation: SERVER_OPERATIONS.fundsPageRead,
      startedAt,
      status: 200,
    });
    return <FundDatabaseClient funds={funds} counts={counts} />;
  } catch (error) {
    logServerRequest({
      route: SERVER_ROUTES.fundsPage,
      operation: SERVER_OPERATIONS.fundsPageRead,
      startedAt,
      status: 500,
      error,
    });
    return <DataUnavailable title="Fund data could not be loaded." />;
  }
}
