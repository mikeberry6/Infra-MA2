"use client";

// Thin client wrapper that receives server-fetched data as props.
// During the transition period, the underlying PortfolioDatabase component
// still imports its own data from TS files. When Phase 6 completes,
// this component will pass props through and the TS imports will be removed.

import { PortfolioDatabase } from "@/components/PortfolioDatabase";
import type { CompanyView, FundView, DatabaseCounts } from "@/modules/shared/types";

interface PortfolioDatabaseClientProps {
  companies: CompanyView[];
  funds: FundView[];
  counts: DatabaseCounts;
}

export function PortfolioDatabaseClient(_props: PortfolioDatabaseClientProps) {
  // TODO (Phase 6): Pass props.companies, props.funds, props.counts to PortfolioDatabase
  // instead of it importing data directly from TS files
  return <PortfolioDatabase />;
}
