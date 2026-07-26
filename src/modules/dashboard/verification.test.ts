import { describe, expect, it } from "vitest";
import { ACTIVE_DASHBOARD_METRICS } from "@/modules/dashboard/catalog";
import {
  dashboardObservationProblems,
  type StoredDashboardObservationState,
} from "@/modules/dashboard/verification";
import { DASHBOARD_METHODOLOGY_VERSIONS } from "@/modules/dashboard/methodology-cutover";

const now = new Date("2026-07-22T12:00:00.000Z");
const numericMetric = ACTIVE_DASHBOARD_METRICS.find((metric) => metric.id === "us_treasury_10y")!;

describe("dashboard release observation verification", () => {
  it("accepts only correctly shaped live or cached numeric observations", () => {
    expect(dashboardObservationProblems(numericMetric, observation(), now)).toEqual([]);
    expect(dashboardObservationProblems(numericMetric, observation({ status: "CACHED" }), now)).toEqual([]);
    expect(dashboardObservationProblems(numericMetric, observation({ status: "MANUAL" }), now)).toContain("status MANUAL");
    expect(dashboardObservationProblems(numericMetric, observation({ value: null }), now)).toContain("missing numeric value");
    expect(dashboardObservationProblems(numericMetric, observation({ textValue: "4.25" }), now)).toContain("unexpected text value");
  });

  it("rejects sample provenance, bad units, ranges, and unsupported dates", () => {
    expect(dashboardObservationProblems(numericMetric, observation({ metadata: { sample: true } }), now)).toContain("sample provenance");
    expect(dashboardObservationProblems(numericMetric, observation({ unit: "count" }), now)).toContain("unit count");
    expect(dashboardObservationProblems(numericMetric, observation({ value: 100 }), now)).toContain("above maximum");
    expect(dashboardObservationProblems(numericMetric, observation({ periodEnd: new Date("1999-12-31T00:00:00.000Z") }), now)).toContain("unsupported old period");
    expect(dashboardObservationProblems(numericMetric, observation({ observedAt: new Date("2026-07-24T00:00:00.000Z") }), now)).toContain("future observation");
  });

  it("enforces the inverse shape for text metrics", () => {
    const textMetric = { ...numericMetric, id: "text-fixture", format: "text" as const };
    expect(dashboardObservationProblems(textMetric, observation({ value: null, textValue: "Stable" }), now)).toEqual([]);
    expect(dashboardObservationProblems(textMetric, observation({ value: 1, textValue: null }), now)).toEqual([
      "unexpected numeric value",
      "missing text value",
    ]);
  });

  it("rejects pre-version methodology rows at the release gate", () => {
    const metric = ACTIVE_DASHBOARD_METRICS.find(
      (item) => item.id === "usaspending_infra_awards_30d",
    )!;
    const base = observation({
      sourceId: metric.source.id,
      unit: metric.unit,
      value: 4,
    });

    expect(dashboardObservationProblems(metric, {
      ...base,
      metadata: { countEndpoint: true },
    }, now)).toContain("incompatible methodology");
    expect(dashboardObservationProblems(metric, {
      ...base,
      metadata: {
        methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.usaSpendingAwards30d,
        countEndpoint: true,
      },
    }, now)).not.toContain("incompatible methodology");
  });
});

function observation(overrides: Partial<StoredDashboardObservationState> = {}) {
  return { ...baseObservation(), ...overrides };
}

function baseObservation(): StoredDashboardObservationState {
  return {
    sourceId: "treasury",
    observedAt: new Date("2026-07-22T00:00:00.000Z"),
    periodEnd: new Date("2026-07-22T00:00:00.000Z"),
    value: 4.25,
    textValue: null,
    unit: "%",
    status: "LIVE",
    metadata: null,
  };
}
