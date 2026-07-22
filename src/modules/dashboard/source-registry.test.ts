import { describe, expect, it } from "vitest";
import { ACTIVE_DASHBOARD_METRICS, DASHBOARD_METRICS } from "@/modules/dashboard/catalog";
import {
  applyDashboardValueTransform,
  DASHBOARD_SOURCE_REGISTRY,
} from "@/modules/dashboard/source-registry";

describe("dashboard source registry", () => {
  it("is the exact publication allowlist and contains the required source contract", () => {
    const activeIds = ACTIVE_DASHBOARD_METRICS.map((metric) => metric.id).sort();
    const registryIds = DASHBOARD_SOURCE_REGISTRY.map((entry) => entry.metricId).sort();

    expect(new Set(registryIds).size).toBe(registryIds.length);
    expect(activeIds).toEqual(registryIds);
    expect(DASHBOARD_METRICS.filter((metric) => metric.status === "ROADMAP").length).toBeGreaterThan(0);
    for (const metric of ACTIVE_DASHBOARD_METRICS) {
      expect(metric.description).not.toMatch(/placeholder|sample|manual fallback/i);
      expect(metric.source.url).toBeTruthy();
    }
    for (const entry of DASHBOARD_SOURCE_REGISTRY) {
      expect(entry.endpoint).toMatch(/^(https:\/\/|prisma:)/);
      expect(entry.nativeCadence).not.toBe("");
      expect(entry.expectedLagHours).toBeGreaterThanOrEqual(0);
      expect(entry.staleAfterDays).toBeGreaterThan(0);
      expect(entry.revisionPolicy).not.toBe("");
      expect(entry.termsUrl).not.toBe("");
      expect(entry.owner).not.toBe("");
      expect(entry.observationPublicationMode).toBe("AUTOMATIC");
    }
  });

  it("applies declared provider-unit conversions deterministically", () => {
    expect(applyDashboardValueTransform(1.25, "MULTIPLY_100")).toBe(125);
    expect(applyDashboardValueTransform(2500, "DIVIDE_1000")).toBe(2.5);
    expect(applyDashboardValueTransform(2_500_000_000, "DIVIDE_1_BILLION")).toBe(2.5);
    expect(applyDashboardValueTransform(42, "IDENTITY")).toBe(42);
    expect(applyDashboardValueTransform([4.25, 3.75], "DIFFERENCE")).toBe(0.5);
    expect(applyDashboardValueTransform([4.25, 3.75], "DIFFERENCE_MULTIPLY_100")).toBe(50);
    expect(applyDashboardValueTransform([1, 2, 3], "SUM_HOURLY_TO_DAILY")).toBe(6);
    expect(applyDashboardValueTransform([1_000, 2_000], "SUM_THEN_DIVIDE_1000")).toBe(3);
    expect(() => applyDashboardValueTransform(1, "SUM_HOURLY_TO_DAILY")).toThrow("requires one or more values");
  });

  it("declares composite provider transformations and preserves Treasury weekend freshness", () => {
    const entries = new Map(DASHBOARD_SOURCE_REGISTRY.map((entry) => [entry.metricId, entry]));

    expect(entries.get("curve_2s10s")?.transform).toBe("DIFFERENCE_MULTIPLY_100");
    expect(entries.get("curve_5s30s")?.transform).toBe("DIFFERENCE_MULTIPLY_100");
    expect(entries.get("breakeven_10y_inflation")?.transform).toBe("DIFFERENCE");
    expect(entries.get("eia_grid_load")?.transform).toBe("SUM_HOURLY_TO_DAILY");
    expect(entries.get("public_water_sewer_construction")).toMatchObject({
      seriesId: "PBWSCONS+PBSWGCONS",
      transform: "SUM_THEN_DIVIDE_1000",
    });
    expect(DASHBOARD_SOURCE_REGISTRY
      .filter((entry) => entry.sourceId === "treasury")
      .every((entry) => entry.staleAfterDays === 5)).toBe(true);
  });
});
