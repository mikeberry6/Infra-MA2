import { DASHBOARD_METRIC_BY_ID } from "@/modules/dashboard/catalog";
import {
  DASHBOARD_SOURCE_REGISTRY,
  DASHBOARD_SOURCE_REGISTRY_BY_METRIC,
} from "@/modules/dashboard/source-registry";
import { dashboardMethodologyCutoverReason } from "@/modules/dashboard/methodology-cutover";
import type {
  DashboardObservation,
  DashboardProviderResult,
  DashboardSignal,
  DashboardSource,
} from "@/modules/dashboard/types";

const FUTURE_TOLERANCE_MS = 26 * 3_600_000;
const EARLIEST_SUPPORTED_DATE_MS = Date.UTC(1900, 0, 1);
const VALID_SIGNAL_SECTIONS = new Set([
  "capital-markets",
  "macro-backdrop",
  "sector-micro",
  "policy-regulatory",
  "deal-friction",
]);
const VALID_SIGNAL_DIRECTIONS = new Set([
  "supportive",
  "neutral",
  "restrictive",
  "needs_review",
]);
const ACTIVE_SOURCE_IDS = new Set(DASHBOARD_SOURCE_REGISTRY.map((entry) => entry.sourceId));

export interface DashboardRequiredMetricHealth {
  requiredMetricIds: string[];
  currentMetricIds: string[];
  missingMetricIds: string[];
  staleMetricIds: string[];
}

export function validateDashboardProviderResult(
  source: DashboardSource,
  result: DashboardProviderResult,
  now = new Date(),
): DashboardProviderResult {
  const warnings = [...(result.warnings ?? [])];
  const observations = new Map<string, DashboardObservation>();

  for (const item of result.observations) {
    validateObservation(source, item, now);
    const key = `${item.metricId}:${item.sourceId}:${item.periodEnd}`;
    if (observations.has(key)) warnings.push(`${source.name} returned duplicate observation ${key}; the final value was retained.`);
    observations.set(key, item);
  }

  const signals = new Map<string, DashboardSignal>();
  for (const item of result.signals ?? []) {
    validateSignal(source, item, now);
    const key = `${item.signalKey}:${item.sourceId}:${item.observedAt}`;
    if (signals.has(key)) warnings.push(`${source.name} returned duplicate signal ${key}; the final value was retained.`);
    signals.set(key, item);
  }

  const requiredMetricHealth = inspectRequiredDashboardMetrics(
    source.id,
    Array.from(observations.values()),
    now,
  );
  if (requiredMetricHealth.missingMetricIds.length > 0) {
    warnings.push(
      `${source.name} returned no observations for active metric(s): ${requiredMetricHealth.missingMetricIds.join(", ")}.`,
    );
  }
  for (const metricId of requiredMetricHealth.staleMetricIds) {
    const latest = Array.from(observations.values())
      .filter((item) => item.metricId === metricId)
      .sort((left, right) => right.periodEnd.localeCompare(left.periodEnd))[0];
    if (!latest) continue;
    warnings.push(`${source.name} returned stale latest data for ${metricId}: ${latest.periodEnd.slice(0, 10)}.`);
  }

  return {
    observations: Array.from(observations.values()),
    signals: Array.from(signals.values()),
    warnings,
  };
}

/**
 * Every registry-backed metric is ACTIVE and required for its provider. A
 * metric is current only when the run returned at least one observation and
 * the latest period falls within that metric's configured staleAfterDays
 * contract. This structured result is used by the pipeline health gate rather
 * than trying to infer operational severity from warning text.
 */
export function inspectRequiredDashboardMetrics(
  sourceId: string,
  observations: DashboardObservation[],
  now = new Date(),
): DashboardRequiredMetricHealth {
  const entries = DASHBOARD_SOURCE_REGISTRY.filter((entry) => entry.sourceId === sourceId);
  const currentMetricIds: string[] = [];
  const missingMetricIds: string[] = [];
  const staleMetricIds: string[] = [];

  for (const entry of entries) {
    const latest = observations
      .filter((item) => item.sourceId === sourceId && item.metricId === entry.metricId)
      .sort((left, right) => right.periodEnd.localeCompare(left.periodEnd))[0];
    if (!latest) {
      missingMetricIds.push(entry.metricId);
      continue;
    }

    const ageDays = (now.getTime() - new Date(latest.periodEnd).getTime()) / 86_400_000;
    if (latest.status === "SAMPLE" || latest.status === "UNAVAILABLE" || ageDays > entry.staleAfterDays) {
      staleMetricIds.push(entry.metricId);
      continue;
    }
    currentMetricIds.push(entry.metricId);
  }

  return {
    requiredMetricIds: entries.map((entry) => entry.metricId),
    currentMetricIds,
    missingMetricIds,
    staleMetricIds,
  };
}

function validateObservation(source: DashboardSource, item: DashboardObservation, now: Date): void {
  const metric = DASHBOARD_METRIC_BY_ID.get(item.metricId);
  const registry = DASHBOARD_SOURCE_REGISTRY_BY_METRIC.get(item.metricId);
  if (!metric || metric.status !== "ACTIVE" || !registry) {
    throw new Error(`${source.name} returned observation for non-active metric ${item.metricId}.`);
  }
  if (item.sourceId !== source.id || registry.sourceId !== source.id || metric.source.id !== source.id) {
    throw new Error(`${source.name} returned mismatched source id for ${item.metricId}.`);
  }
  if (registry.unit && item.unit !== registry.unit) {
    throw new Error(`${source.name} returned ${item.unit ?? "no unit"} for ${item.metricId}; expected ${registry.unit}.`);
  }
  if (item.status !== "LIVE") {
    throw new Error(`${source.name} returned invalid provider status ${item.status} for ${item.metricId}; expected LIVE.`);
  }
  const periodEnd = validDate(item.periodEnd, `${item.metricId} periodEnd`);
  const observedAt = validDate(item.observedAt, `${item.metricId} observedAt`);
  if (periodEnd.getTime() < EARLIEST_SUPPORTED_DATE_MS || observedAt.getTime() < EARLIEST_SUPPORTED_DATE_MS) {
    throw new Error(`${source.name} returned an unsupported historical date for ${item.metricId}.`);
  }
  if (periodEnd.getTime() > now.getTime() + FUTURE_TOLERANCE_MS) {
    throw new Error(`${source.name} returned a future period for ${item.metricId}.`);
  }
  if (observedAt.getTime() > now.getTime() + FUTURE_TOLERANCE_MS) {
    throw new Error(`${source.name} returned a future observation timestamp for ${item.metricId}.`);
  }
  if (item.metadata !== undefined && !isPlainObject(item.metadata)) {
    throw new Error(`${source.name} returned invalid metadata for ${item.metricId}.`);
  }
  if (dashboardMethodologyCutoverReason(item) !== null) {
    throw new Error(`${source.name} returned incompatible methodology metadata for ${item.metricId}.`);
  }

  const numericValue = item.value;
  const hasNumericValue = typeof numericValue === "number";
  const hasTextField = item.textValue !== null && item.textValue !== undefined;
  const hasTextValue = typeof item.textValue === "string" && item.textValue.trim().length > 0;
  if (metric.format === "text") {
    if (!hasTextValue || hasNumericValue) {
      throw new Error(`${source.name} returned an invalid text value shape for ${item.metricId}.`);
    }
    return;
  }
  if (typeof numericValue !== "number" || hasTextField) {
    throw new Error(`${source.name} returned an invalid numeric value shape for ${item.metricId}.`);
  }
  if (!Number.isFinite(numericValue)) throw new Error(`${source.name} returned a non-finite value for ${item.metricId}.`);
  if (registry.minValue !== undefined && numericValue < registry.minValue) {
    throw new Error(`${source.name} returned ${numericValue} below the configured minimum for ${item.metricId}.`);
  }
  if (registry.maxValue !== undefined && numericValue > registry.maxValue) {
    throw new Error(`${source.name} returned ${numericValue} above the configured maximum for ${item.metricId}.`);
  }
}

function validateSignal(source: DashboardSource, item: DashboardSignal, now: Date): void {
  if (item.sourceId !== source.id) throw new Error(`${source.name} returned a signal with mismatched source id.`);
  if (!ACTIVE_SOURCE_IDS.has(source.id)) throw new Error(`${source.name} is not an active dashboard signal source.`);
  if (item.sourceName !== source.name) throw new Error(`${source.name} returned a signal with mismatched source name.`);
  if (!nonEmptyString(item.signalKey) || !nonEmptyString(item.title) || !nonEmptyString(item.summary)) {
    throw new Error(`${source.name} returned an incomplete signal.`);
  }
  if (!VALID_SIGNAL_SECTIONS.has(item.section)) {
    throw new Error(`${source.name} returned invalid signal section ${item.section}.`);
  }
  if (!VALID_SIGNAL_DIRECTIONS.has(item.direction)) {
    throw new Error(`${source.name} returned invalid signal direction ${item.direction}.`);
  }
  if (!Number.isInteger(item.severity) || item.severity < 1 || item.severity > 5) {
    throw new Error(`${source.name} returned invalid signal severity ${item.severity}.`);
  }
  const observedAt = validDate(item.observedAt, `${item.signalKey} observedAt`);
  if (observedAt.getTime() < EARLIEST_SUPPORTED_DATE_MS) {
    throw new Error(`${source.name} returned an unsupported historical signal date for ${item.signalKey}.`);
  }
  if (observedAt.getTime() > now.getTime() + FUTURE_TOLERANCE_MS) {
    throw new Error(`${source.name} returned a future signal ${item.signalKey}.`);
  }
  if (item.sourceUrl !== undefined && typeof item.sourceUrl !== "string") {
    throw new Error(`${source.name} returned an invalid signal source URL.`);
  }
  if (item.sourceUrl) {
    const url = new URL(item.sourceUrl);
    if (url.protocol !== "https:") throw new Error(`${source.name} returned a non-HTTPS source URL.`);
  }
  if (item.metadata !== undefined && !isPlainObject(item.metadata)) {
    throw new Error(`${source.name} returned invalid signal metadata for ${item.signalKey}.`);
  }
  if (item.reviewStatus !== undefined && item.reviewStatus !== "PENDING") {
    throw new Error(`${source.name} attempted to bypass review for ${item.signalKey}.`);
  }
  if (
    item.reviewedAt !== undefined
    || item.reviewedById !== undefined
    || item.contentHash !== undefined
    || item.reviewedContentHash !== undefined
  ) {
    throw new Error(`${source.name} attempted to provide review metadata for ${item.signalKey}.`);
  }
}

function validDate(value: string, label: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid ${label}: ${value}`);
  return parsed;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
