"use client";

import { FundDatabase } from "@/components/FundDatabase";
import type { FundListItem, DatabaseCounts } from "@/modules/shared/types";

interface FundDatabaseClientProps {
  funds: FundListItem[];
  counts: DatabaseCounts;
}

export function FundDatabaseClient(props: FundDatabaseClientProps) {
  return <FundDatabase funds={props.funds} counts={props.counts} />;
}
