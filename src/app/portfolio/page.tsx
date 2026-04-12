export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAllCompanies } from "@/modules/companies/queries";
import { getAllFunds } from "@/modules/funds/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { PortfolioDatabaseClient } from "@/components/PortfolioDatabaseClient";

export const metadata: Metadata = {
  title: "Portfolio Companies",
};

export default async function PortfolioPage() {
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
}
