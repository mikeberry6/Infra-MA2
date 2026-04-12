export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { FundDatabaseClient } from "@/components/FundDatabaseClient";

export const metadata: Metadata = {
  title: "Funds",
};

export default async function FundsPage() {
  try {
    const { getAllFunds } = await import("@/modules/funds/queries");
    const { getDatabaseCounts } = await import("@/modules/insights/queries");

    const [funds, counts] = await Promise.all([
      getAllFunds(),
      getDatabaseCounts(),
    ]);

    return <FundDatabaseClient funds={funds} counts={counts} />;
  } catch (error) {
    console.error("Failed to load funds from database, falling back:", error);
    // Fall back to client component which imports its own data from TS files
    return <FundDatabaseClient funds={[]} counts={{ deals: 0, funds: 0, portfolio: 0 }} />;
  }
}
