export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAllFunds } from "@/modules/funds/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { FundDatabaseClient } from "@/components/FundDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import { canExportData } from "@/modules/auth/guards";

export const metadata: Metadata = {
  title: "Funds",
};

export default async function FundsPage() {
  try {
    const [funds, counts, canExport] = await Promise.all([
      getAllFunds(),
      getDatabaseCounts(),
      canExportData(),
    ]);
    return <FundDatabaseClient funds={funds} counts={counts} canExport={canExport} />;
  } catch (error) {
    console.error("Database query failed on /funds:", error);
    return <DataUnavailable title="Fund data could not be loaded." />;
  }
}
