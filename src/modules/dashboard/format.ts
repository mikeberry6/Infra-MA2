import type { DashboardMetric, DashboardObservation, DashboardSeries } from "@/modules/dashboard/types";

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function dateOnlyUtc(dateLike: string | Date): Date {
  const raw = typeof dateLike === "string" ? dateLike : dateLike.toISOString();
  const date = raw.slice(0, 10);
  return new Date(`${date}T00:00:00.000Z`);
}

export function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 86_400_000;
}

export function sortObservations(observations: DashboardObservation[]): DashboardObservation[] {
  return [...observations].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
}

export function latestNumeric(series: DashboardSeries): number | null {
  const value = series.latest?.value;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function formatMetricValue(metric: DashboardMetric, observation?: DashboardObservation): string {
  if (!observation) return "Unavailable";
  if (observation.textValue) return observation.textValue;
  if (typeof observation.value !== "number" || !Number.isFinite(observation.value)) return "Unavailable";
  const value = observation.value;

  if (metric.format === "percent") return `${value.toFixed(2)}%`;
  if (metric.format === "basis-points") return `${Math.round(value).toLocaleString()} bp`;
  if (metric.format === "currency") {
    if (metric.unit === "$/bbl" || metric.unit === "$/MMBtu" || metric.unit === "$/MWh") {
      return `$${value.toFixed(2)}`;
    }
    if (Math.abs(value) >= 1_000) return `$${Math.round(value).toLocaleString()}`;
    return `$${value.toFixed(1)}`;
  }
  if (metric.format === "count") return Math.round(value).toLocaleString();
  if (metric.format === "index") return value >= 1_000 ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value.toFixed(1);
  if (Math.abs(value) >= 1_000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Math.abs(value) >= 100) return value.toFixed(1);
  return value.toFixed(2);
}

export function formatChange(metric: DashboardMetric, change?: number | null): string {
  if (change == null || !Number.isFinite(change)) return "n/a";
  if (metric.format === "percent") return `${change >= 0 ? "+" : ""}${Math.round(change * 100)} bp`;
  if (metric.format === "basis-points") return `${change >= 0 ? "+" : ""}${Math.round(change)} bp`;
  if (metric.format === "currency") return `${change >= 0 ? "+" : ""}${change.toFixed(2)}`;
  if (metric.format === "count") return `${change >= 0 ? "+" : ""}${Math.round(change).toLocaleString()}`;
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}`;
}

export function observationDateLabel(observation?: DashboardObservation): string {
  if (!observation) return "No observation";
  return observation.periodEnd.slice(0, 10);
}
