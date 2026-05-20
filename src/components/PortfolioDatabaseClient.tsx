"use client";

import { PortfolioDatabase } from "@/components/PortfolioDatabase";
import type { CompanyView, FundStrategyView, DatabaseCounts } from "@/modules/shared/types";

interface PortfolioDatabaseClientProps {
  companies: CompanyView[];
  funds: FundStrategyView[];
  counts: DatabaseCounts;
  canExport: boolean;
}

export function PortfolioDatabaseClient(props: PortfolioDatabaseClientProps) {
  return <PortfolioDatabase companies={props.companies} funds={props.funds} counts={props.counts} canExport={props.canExport} />;
}
