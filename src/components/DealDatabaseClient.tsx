"use client";

import { DealDatabase } from "@/components/DealDatabase";
import type { DealListView } from "@/modules/shared/types";

interface DealDatabaseClientProps {
  deals: DealListView[];
  briefingIssues?: { edition: string; archivePath: string }[];
}

export function DealDatabaseClient(props: DealDatabaseClientProps) {
  return <DealDatabase {...props} />;
}
