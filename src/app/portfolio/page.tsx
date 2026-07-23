export const revalidate = 300;

import type { Metadata } from "next";
import { getAllCompanies } from "@/modules/companies/queries";
import { getFundStrategyIndex } from "@/modules/funds/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { PortfolioDatabaseClient } from "@/components/PortfolioDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import {
  logServerRequest,
  SERVER_OPERATIONS,
  SERVER_ROUTES,
} from "@/lib/server-log";

export const metadata: Metadata = {
  title: "PortCos",
};

export default async function PortfolioPage() {
  const startedAt = performance.now();
  try {
    const [companies, funds, counts] = await Promise.all([
      getAllCompanies(),
      getFundStrategyIndex(),
      getDatabaseCounts(),
    ]);
    logServerRequest({
      route: SERVER_ROUTES.portfolioPage,
      operation: SERVER_OPERATIONS.portfolioPageRead,
      startedAt,
      status: 200,
    });
    return (
      <PortfolioDatabaseClient
        companies={companies}
        funds={funds}
        counts={counts}
      />
    );
  } catch (error) {
    logServerRequest({
      route: SERVER_ROUTES.portfolioPage,
      operation: SERVER_OPERATIONS.portfolioPageRead,
      startedAt,
      status: 500,
      error,
    });
    return <DataUnavailable title="Portfolio company data could not be loaded." />;
  }
}
