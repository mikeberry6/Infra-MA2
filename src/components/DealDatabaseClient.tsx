"use client";

import { DealDatabase } from "@/components/DealDatabase";
import type { DealListView, DatabaseCounts } from "@/modules/shared/types";

interface DealDatabaseClientProps {
  deals: DealListView[];
  counts: DatabaseCounts;
  briefingIssues?: { edition: string; archivePath: string }[];
}

export function DealDatabaseClient(props: DealDatabaseClientProps) {
  return <DealDatabase deals={props.deals} counts={props.counts} briefingIssues={props.briefingIssues} />;
}
