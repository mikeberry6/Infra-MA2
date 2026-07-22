export type DashboardMethodologyHistoryRow = {
  metricId: string;
  sourceId: string;
  status: string;
  metadata: unknown;
};

/**
 * The prototype wrote these metric ids using materially different contracts.
 * Keep the rows for auditability, but remove them from public series rather
 * than drawing changes across an invalid methodology boundary.
 */
export function dashboardMethodologyCutoverReason(
  row: DashboardMethodologyHistoryRow,
): string | null {
  if (row.status === "SAMPLE" || row.status === "UNAVAILABLE") return null;
  const metadata = objectMetadata(row.metadata);

  if (row.metricId === "usaspending_infra_awards_30d" && row.sourceId === "usaspending") {
    return metadata?.countEndpoint === true
      ? null
      : "legacy USAspending first-page count";
  }

  if (row.metricId === "federal_register_infra_notices" && row.sourceId === "federal-register") {
    const types = metadata?.documentTypes;
    const currentTypes = Array.isArray(types)
      && ["Notice", "Rule", "Proposed Rule"].every((type) => types.includes(type));
    return metadata?.deduplicatedBy === "document_number" && currentTypes
      ? null
      : "legacy Federal Register combined-query count";
  }

  return null;
}

function objectMetadata(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
