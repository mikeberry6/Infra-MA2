export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAllFunds } from "@/modules/funds/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { FundDatabaseClient } from "@/components/FundDatabaseClient";

export const metadata: Metadata = {
  title: "Funds",
};

export default async function FundsPage() {
  try {
    const [funds, counts] = await Promise.all([
      getAllFunds(),
      getDatabaseCounts(),
    ]);
    return <FundDatabaseClient funds={funds} counts={counts} />;
  } catch (error) {
    console.error("Database query failed on /funds:", error);
    return <FundDatabaseClient funds={[]} counts={{ deals: 0, funds: 0, portfolio: 0 }} />;
  }
}
