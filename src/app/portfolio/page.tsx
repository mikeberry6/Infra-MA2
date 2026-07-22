export const revalidate = 300;

import type { Metadata } from "next";
import { getAllCompanyListItems } from "@/modules/companies/queries";
import { getFundStrategyIndex } from "@/modules/funds/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { PortfolioDatabaseClient } from "@/components/PortfolioDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";

export const metadata: Metadata = {
  title: "PortCos",
};

export default async function PortfolioPage() {
  try {
    const [companies, funds, counts] = await Promise.all([
      getAllCompanyListItems(),
      getFundStrategyIndex(),
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
    return <DataUnavailable title="Portfolio company data could not be loaded." retryHref="/portfolio" />;
  }
}
