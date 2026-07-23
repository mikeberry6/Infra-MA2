"use client";

import { DealDatabase } from "@/components/DealDatabase";
import type { DealListItem, DatabaseCounts } from "@/modules/shared/types";

interface DealDatabaseClientProps {
  deals: DealListItem[];
  counts: DatabaseCounts;
}

export function DealDatabaseClient(props: DealDatabaseClientProps) {
  return <DealDatabase deals={props.deals} counts={props.counts} />;
}
