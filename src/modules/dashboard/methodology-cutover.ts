export type DashboardMethodologyHistoryRow = {
  metricId: string;
  sourceId: string;
  status: string;
  metadata?: unknown;
};

/**
 * These values are durable data-contract identifiers, not release labels.
 * Changing a methodology requires a new value and an explicit history cutover;
 * existing values must never be repurposed for a different calculation.
 */
export const DASHBOARD_METHODOLOGY_VERSIONS = {
  usaSpendingAwards30d: "usaspending-award-count-v1",
  usaSpendingObligations30d: "usaspending-obligations-over-time-v1",
  samGovOpportunities: "sam-gov-offset-pagination-v1",
  federalRegisterInfraNotices: "federal-register-term-dedupe-v1",
} as const;

export const FEDERAL_REGISTER_METHODOLOGY_DOCUMENT_TYPES = [
  "Notice",
  "Rule",
  "Proposed Rule",
] as const;

export const SAM_GOV_METHODOLOGY_PAGE_SIZE = 1_000;

/**
 * Exported so maintenance scripts can build a complete database predicate from
 * the same allowlist used by the classifier instead of duplicating metric ids.
 */
export const DASHBOARD_METHODOLOGY_CUTOVER_TARGETS = [
  {
    metricId: "usaspending_infra_awards_30d",
    sourceId: "usaspending",
    methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.usaSpendingAwards30d,
    incompatibleReason: "pre-version USAspending award-count methodology",
  },
  {
    metricId: "usaspending_infra_obligations_30d",
    sourceId: "usaspending",
    methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.usaSpendingObligations30d,
    incompatibleReason: "pre-version USAspending obligations methodology",
  },
  {
    metricId: "sam_opportunities",
    sourceId: "sam-gov",
    methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.samGovOpportunities,
    incompatibleReason: "pre-version SAM.gov opportunities methodology",
  },
  {
    metricId: "federal_register_infra_notices",
    sourceId: "federal-register",
    methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.federalRegisterInfraNotices,
    incompatibleReason: "pre-version Federal Register term-deduplication methodology",
  },
] as const;

export const DASHBOARD_METHODOLOGY_VERSION_BY_METRIC_ID = Object.freeze(
  Object.fromEntries(DASHBOARD_METHODOLOGY_CUTOVER_TARGETS.map((target) => [
    target.metricId,
    target.methodologyVersion,
  ])) as Readonly<Record<(typeof DASHBOARD_METHODOLOGY_CUTOVER_TARGETS)[number]["metricId"], string>>,
);

/**
 * The prototype wrote these metric ids using materially different contracts.
 * Keep the rows for auditability, but remove them from public series rather
 * than drawing changes across an invalid methodology boundary.
 */
export function dashboardMethodologyCutoverReason(
  row: DashboardMethodologyHistoryRow,
): string | null {
  if (row.status === "SAMPLE" || row.status === "UNAVAILABLE") return null;

  const target = DASHBOARD_METHODOLOGY_CUTOVER_TARGETS.find(
    (candidate) => candidate.metricId === row.metricId && candidate.sourceId === row.sourceId,
  );
  if (!target) return null;

  const metadata = objectMetadata(row.metadata);
  if (metadata?.methodologyVersion !== target.methodologyVersion) {
    return target.incompatibleReason;
  }

  if (row.metricId === "usaspending_infra_awards_30d") {
    return metadata.countEndpoint === true ? null : target.incompatibleReason;
  }

  if (row.metricId === "usaspending_infra_obligations_30d") {
    return metadata.aggregation === "spending_over_time.aggregated_amount"
      ? null
      : target.incompatibleReason;
  }

  if (row.metricId === "sam_opportunities") {
    return metadata.pagination === "offset"
      && metadata.pageSize === SAM_GOV_METHODOLOGY_PAGE_SIZE
      ? null
      : target.incompatibleReason;
  }

  if (row.metricId === "federal_register_infra_notices") {
    return metadata.deduplicatedBy === "document_number"
      && hasExactStringMembers(metadata.documentTypes, FEDERAL_REGISTER_METHODOLOGY_DOCUMENT_TYPES)
      ? null
      : target.incompatibleReason;
  }

  return target.incompatibleReason;
}

function objectMetadata(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function hasExactStringMembers(
  value: unknown,
  expected: readonly string[],
): boolean {
  if (!Array.isArray(value) || value.length !== expected.length) return false;
  const members = new Set(value.filter((item): item is string => typeof item === "string"));
  return members.size === expected.length && expected.every((item) => members.has(item));
}
