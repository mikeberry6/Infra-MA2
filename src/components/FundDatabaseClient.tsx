"use client";

import { FundDatabase } from "@/components/FundDatabase";
import type { FundView, DatabaseCounts } from "@/modules/shared/types";

interface FundDatabaseClientProps {
  funds: FundView[];
  counts: DatabaseCounts;
}

export function FundDatabaseClient(_props: FundDatabaseClientProps) {
  // TODO (Phase 6): Pass props.funds, props.counts to FundDatabase
  // instead of it importing data directly from TS files
  return <FundDatabase />;
}
