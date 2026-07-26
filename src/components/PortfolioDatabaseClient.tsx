"use client";

import { PortfolioDatabase } from "@/components/PortfolioDatabase";
import type { CompanyListItem, FundStrategyView, DatabaseCounts } from "@/modules/shared/types";

interface PortfolioDatabaseClientProps {
  companies: CompanyListItem[];
  funds: FundStrategyView[];
  counts: DatabaseCounts;
}

export function PortfolioDatabaseClient(props: PortfolioDatabaseClientProps) {
  return <PortfolioDatabase companies={props.companies} funds={props.funds} counts={props.counts} />;
}
