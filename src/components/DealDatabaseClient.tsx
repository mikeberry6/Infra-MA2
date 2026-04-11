"use client";

import { DealDatabase } from "@/components/DealDatabase";
import type { DealView, DatabaseCounts } from "@/modules/shared/types";

interface DealDatabaseClientProps {
  deals: DealView[];
  counts: DatabaseCounts;
}

export function DealDatabaseClient(_props: DealDatabaseClientProps) {
  // TODO (Phase 6): Pass props.deals, props.counts to DealDatabase
  // instead of it importing data directly from TS files
  return <DealDatabase />;
}
