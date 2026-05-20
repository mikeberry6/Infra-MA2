"use client";

import { DealDatabase } from "@/components/DealDatabase";
import type { DealView, DatabaseCounts } from "@/modules/shared/types";

interface DealDatabaseClientProps {
  deals: DealView[];
  counts: DatabaseCounts;
  canExport: boolean;
}

export function DealDatabaseClient(props: DealDatabaseClientProps) {
  return <DealDatabase deals={props.deals} counts={props.counts} canExport={props.canExport} />;
}
