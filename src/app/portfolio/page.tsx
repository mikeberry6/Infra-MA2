export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { PortfolioDatabaseClient } from "@/components/PortfolioDatabaseClient";

export const metadata: Metadata = {
  title: "Portfolio Companies",
};

export default async function PortfolioPage() {
  try {
    const { getAllCompanies } = await import("@/modules/companies/queries");
    const { getAllFunds } = await import("@/modules/funds/queries");
    const { getDatabaseCounts } = await import("@/modules/insights/queries");

    const [companies, funds, counts] = await Promise.all([
      getAllCompanies(),
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
    console.error("Failed to load portfolio from database, falling back:", error);
    return <PortfolioDatabaseClient companies={[]} funds={[]} counts={{ deals: 0, funds: 0, portfolio: 0 }} />;
  }
}
