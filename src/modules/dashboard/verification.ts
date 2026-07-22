import { isSampleDashboardRecord } from "@/modules/dashboard/publication";
import { DASHBOARD_SOURCE_REGISTRY_BY_METRIC } from "@/modules/dashboard/source-registry";
import type { DashboardMetric } from "@/modules/dashboard/types";

export const MIN_SUPPORTED_DASHBOARD_DATE = Date.UTC(2000, 0, 1);
const FUTURE_TOLERANCE_MS = 26 * 3_600_000;

export interface StoredDashboardObservationState {
  sourceId: string;
  observedAt: Date;
  periodEnd: Date;
  value: number | null;
  textValue: string | null;
  unit: string | null;
  status: string;
  metadata: unknown;
}

export function dashboardObservationProblems(
  metric: DashboardMetric,
  row: StoredDashboardObservationState,
  now = new Date(),
): string[] {
  const registry = DASHBOARD_SOURCE_REGISTRY_BY_METRIC.get(metric.id);
  const numericMetric = metric.format !== "text";
  const hasText = Boolean(row.textValue?.trim());
  const hasFiniteNumber = row.value !== null && Number.isFinite(row.value);
  const problems: string[] = [];

  if (row.sourceId !== metric.source.id) problems.push(`source ${row.sourceId}`);
  if (!(["LIVE", "CACHED"] as string[]).includes(row.status)) problems.push(`status ${row.status}`);
  if (isSampleDashboardRecord({ sourceId: row.sourceId, metadata: row.metadata })) problems.push("sample provenance");
  if (numericMetric && !hasFiniteNumber) problems.push("missing numeric value");
  if (numericMetric && hasText) problems.push("unexpected text value");
  if (!numericMetric && row.value !== null) problems.push("unexpected numeric value");
  if (!numericMetric && !hasText) problems.push("missing text value");
  if (registry?.unit && row.unit !== registry.unit) problems.push(`unit ${row.unit ?? "missing"}`);
  if (row.value !== null && registry?.minValue !== undefined && row.value < registry.minValue) problems.push("below minimum");
  if (row.value !== null && registry?.maxValue !== undefined && row.value > registry.maxValue) problems.push("above maximum");
  if (row.periodEnd.getTime() < MIN_SUPPORTED_DASHBOARD_DATE) problems.push("unsupported old period");
  if (row.observedAt.getTime() < MIN_SUPPORTED_DASHBOARD_DATE) problems.push("unsupported old observation date");
  if (row.periodEnd.getTime() > now.getTime() + FUTURE_TOLERANCE_MS) problems.push("future period");
  if (row.observedAt.getTime() > now.getTime() + FUTURE_TOLERANCE_MS) problems.push("future observation");
  return problems;
}
