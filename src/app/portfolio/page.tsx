export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAllCompanies } from "@/modules/companies/queries";
import { getAllFunds } from "@/modules/funds/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { PortfolioDatabaseClient } from "@/components/PortfolioDatabaseClient";

export const metadata: Metadata = {
  title: "PortCos",
};

export default async function PortfolioPage() {
  try {
    const [companies, funds, counts] = await Promise.all([
      getAllCompanies({ detail: false }),
      getAllFunds(),
      getDatabaseCounts(),
    ]);
    return (
      <PortfolioDatabaseClient
        companies={companies}
        funds={funds}
        counts={counts}
      />
    );
  } catch (error) {
    console.error("Database query failed on /portfolio:", error);
    return <PortfolioDatabaseClient companies={[]} funds={[]} counts={{ deals: 0, funds: 0, portfolio: 0 }} />;
  }
}
