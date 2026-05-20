export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAllCompanies } from "@/modules/companies/queries";
import { getFundStrategyIndex } from "@/modules/funds/queries";
import { getDatabaseCounts } from "@/modules/insights/queries";
import { PortfolioDatabaseClient } from "@/components/PortfolioDatabaseClient";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import { canExportData } from "@/modules/auth/guards";

export const metadata: Metadata = {
  title: "PortCos",
};

export default async function PortfolioPage() {
  try {
    const [companies, funds, counts, canExport] = await Promise.all([
      getAllCompanies({ detail: false }),
      getFundStrategyIndex(),
      getDatabaseCounts(),
      canExportData(),
    ]);
    return (
      <PortfolioDatabaseClient
        companies={companies}
        funds={funds}
        counts={counts}
        canExport={canExport}
      />
    );
  } catch (error) {
    console.error("Database query failed on /portfolio:", error);
    return <DataUnavailable title="Portfolio company data could not be loaded." />;
  }
}
