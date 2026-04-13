"use client";

import { PortfolioDatabase } from "@/components/PortfolioDatabase";
import type { CompanyView, FundView, DatabaseCounts } from "@/modules/shared/types";

interface PortfolioDatabaseClientProps {
  companies: CompanyView[];
  funds: FundView[];
  counts: DatabaseCounts;
}

export function PortfolioDatabaseClient(props: PortfolioDatabaseClientProps) {
  return <PortfolioDatabase companies={props.companies} funds={props.funds} counts={props.counts} />;
}
