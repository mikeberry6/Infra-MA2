export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAllCompanyListItems } from "@/modules/companies/queries";
import { getFundStrategyIndex } from "@/modules/funds/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { PortfolioDatabaseClient } from "@/components/PortfolioDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import { currentServerRequestId } from "@/lib/server-request-context";
import { withServerTask } from "@/lib/server-log";

export const metadata: Metadata = {
  title: "PortCos",
};

export default async function PortfolioPage() {
  try {
    const requestId = await currentServerRequestId();
    return await withServerTask({ route: "/portfolio", operation: "render_portfolio", requestId }, async () => {
      const [companies, funds, counts] = await withServerTask({
        route: "/portfolio",
        operation: "load_portfolio_data",
        requestId,
      }, () => Promise.all([
        getAllCompanyListItems(),
        getFundStrategyIndex(),
        getDatabaseCounts(),
      ]));
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
