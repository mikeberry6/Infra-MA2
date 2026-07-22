import { describe, expect, it } from "vitest";
import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import {
  inspectRequiredDashboardMetrics,
  validateDashboardProviderResult,
} from "@/modules/dashboard/validation";
import type { DashboardObservation, DashboardSignal } from "@/modules/dashboard/types";
import { DASHBOARD_SOURCE_REGISTRY } from "@/modules/dashboard/source-registry";

const validObservation: DashboardObservation = {
  metricId: "us_treasury_10y",
  sourceId: "treasury",
  observedAt: "2026-07-22T00:00:00.000Z",
  periodEnd: "2026-07-22T00:00:00.000Z",
  value: 4.25,
  unit: "%",
  status: "LIVE",
};

const validSignal: DashboardSignal = {
  signalKey: "document-1",
  section: "policy-regulatory",
  title: "Document",
  summary: "Fixture",
  direction: "needs_review",
  severity: 1,
  observedAt: "2026-07-22T00:00:00.000Z",
  sourceId: "federal-register",
  sourceName: "Federal Register",
  sourceUrl: "https://example.test/document",
  reviewStatus: "PENDING",
};

describe("dashboard provider validation", () => {
  it("de-duplicates observations and retains the revised value", () => {
    const result = validateDashboardProviderResult(DASHBOARD_SOURCES.treasury, {
      observations: [validObservation, { ...validObservation, value: 4.3 }],
    }, new Date("2026-07-22T12:00:00.000Z"));

    expect(result.observations).toHaveLength(1);
    expect(result.observations[0].value).toBe(4.3);
    expect(result.warnings).toEqual(expect.arrayContaining([
      expect.stringContaining("duplicate observation"),
      expect.stringContaining("returned no observations for active metric(s)"),
    ]));
  });

  it("rejects roadmap metrics, invalid ranges, and attempts to bypass review", () => {
    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.fred, {
      observations: [{ ...validObservation, metricId: "move", sourceId: "fred", unit: "index" }],
    })).toThrow("non-active metric move");

    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.treasury, {
      observations: [{ ...validObservation, value: 100 }],
    })).toThrow("above the configured maximum");

    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.federalRegister, {
      observations: [],
      signals: [{ ...validSignal, reviewStatus: "APPROVED" }],
    })).toThrow("attempted to bypass review");
  });

  it("rejects provider-supplied review decisions for every source", () => {
    const treasurySignal: DashboardSignal = {
      ...validSignal,
      sourceId: DASHBOARD_SOURCES.treasury.id,
      sourceName: DASHBOARD_SOURCES.treasury.name,
      reviewStatus: "REJECTED",
    };

    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.treasury, {
      observations: [],
      signals: [treasurySignal],
    })).toThrow("attempted to bypass review");

    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.federalRegister, {
      observations: [],
      signals: [{ ...validSignal, reviewedById: "provider-user" }],
    })).toThrow("attempted to provide review metadata");
  });

  it("enforces provider observation status, value shape, metadata, and date sanity", () => {
    const now = new Date("2026-07-22T12:00:00.000Z");
    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.treasury, {
      observations: [{ ...validObservation, status: "CACHED" }],
    }, now)).toThrow("invalid provider status CACHED");

    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.treasury, {
      observations: [{ ...validObservation, value: null }],
    }, now)).toThrow("invalid numeric value shape");

    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.treasury, {
      observations: [{ ...validObservation, textValue: "4.25" }],
    }, now)).toThrow("invalid numeric value shape");

    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.treasury, {
      observations: [{ ...validObservation, metadata: [] as unknown as Record<string, unknown> }],
    }, now)).toThrow("invalid metadata");

    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.treasury, {
      observations: [{ ...validObservation, observedAt: "2026-08-01T00:00:00.000Z" }],
    }, now)).toThrow("future observation timestamp");
  });

  it("enforces signal source and classification fields at runtime", () => {
    const invalidSection = { ...validSignal, section: "other" } as unknown as DashboardSignal;
    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.federalRegister, {
      observations: [],
      signals: [invalidSection],
    })).toThrow("invalid signal section other");

    const invalidDirection = { ...validSignal, direction: "positive" } as unknown as DashboardSignal;
    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.federalRegister, {
      observations: [],
      signals: [invalidDirection],
    })).toThrow("invalid signal direction positive");

    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.federalRegister, {
      observations: [],
      signals: [{ ...validSignal, sourceName: "Wrong source" }],
    })).toThrow("mismatched source name");

    expect(() => validateDashboardProviderResult(DASHBOARD_SOURCES.federalRegister, {
      observations: [],
      signals: [{ ...validSignal, observedAt: "2026-08-01T00:00:00.000Z" }],
    }, new Date("2026-07-22T12:00:00.000Z"))).toThrow("future signal");
  });

  it("accepts an empty but valid release and reports missing active metrics", () => {
    const result = validateDashboardProviderResult(DASHBOARD_SOURCES.eia, { observations: [] });
    expect(result.observations).toEqual([]);
    expect(result.warnings?.[0]).toContain("returned no observations for active metric(s)");
  });

  it("marks a valid but old official release stale without replacing its value", () => {
    const result = validateDashboardProviderResult(DASHBOARD_SOURCES.treasury, {
      observations: [{ ...validObservation, periodEnd: "2026-07-01T00:00:00.000Z" }],
    }, new Date("2026-07-22T12:00:00.000Z"));

    expect(result.observations[0].value).toBe(4.25);
    expect(result.warnings).toContain("U.S. Treasury returned stale latest data for us_treasury_10y: 2026-07-01.");
  });

  it("defines required coverage from active registry metrics and separates missing from stale", () => {
    const health = inspectRequiredDashboardMetrics("treasury", [
      validObservation,
      {
        ...validObservation,
        metricId: "us_treasury_2y",
        periodEnd: "2026-07-01T00:00:00.000Z",
      },
    ], new Date("2026-07-22T12:00:00.000Z"));

    expect(health.requiredMetricIds).toEqual(expect.arrayContaining([
      "us_treasury_10y",
      "us_treasury_2y",
      "curve_2s10s",
    ]));
    expect(health.currentMetricIds).toContain("us_treasury_10y");
    expect(health.staleMetricIds).toEqual(["us_treasury_2y"]);
    expect(health.missingMetricIds).toContain("curve_2s10s");
    expect(health.requiredMetricIds).toHaveLength(
      health.currentMetricIds.length + health.staleMetricIds.length + health.missingMetricIds.length,
    );
  });

  it("keeps Friday Treasury releases current for the Monday 7:30 a.m. Eastern refresh", () => {
    const fridayObservations = DASHBOARD_SOURCE_REGISTRY
      .filter((entry) => entry.sourceId === "treasury")
      .map((entry) => ({
        ...validObservation,
        metricId: entry.metricId,
        periodEnd: "2026-07-17T00:00:00.000Z",
        unit: entry.unit,
      }));

    const health = inspectRequiredDashboardMetrics(
      "treasury",
      fridayObservations,
      new Date("2026-07-20T11:30:00.000Z"),
    );

    expect(health.missingMetricIds).toEqual([]);
    expect(health.staleMetricIds).toEqual([]);
    expect(health.currentMetricIds).toHaveLength(fridayObservations.length);
  });
});
