"use client";

import { FundDatabase } from "@/components/FundDatabase";
import type { FundView, DatabaseCounts } from "@/modules/shared/types";

interface FundDatabaseClientProps {
  funds: FundView[];
  counts: DatabaseCounts;
  canExport: boolean;
}

export function FundDatabaseClient(props: FundDatabaseClientProps) {
  return <FundDatabase funds={props.funds} counts={props.counts} canExport={props.canExport} />;
}
