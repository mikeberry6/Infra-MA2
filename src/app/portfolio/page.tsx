export const revalidate = 300;

import type { Metadata } from "next";
import { getAllCompanyListItems } from "@/modules/companies/queries";
import { getFundStrategyIndex } from "@/modules/funds/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { PortfolioDatabaseClient } from "@/components/PortfolioDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import { withServerTask } from "@/lib/server-log";

export const metadata: Metadata = {
  title: "PortCos",
};

export default async function PortfolioPage() {
  try {
    return await withServerTask({ route: "/portfolio", operation: "render_portfolio" }, async () => {
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
    });
  } catch {
    return <DataUnavailable title="Portfolio company data could not be loaded." retryHref="/portfolio" />;
  }
}
