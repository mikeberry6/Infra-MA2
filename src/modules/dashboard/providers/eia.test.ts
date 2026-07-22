import { describe, expect, it } from "vitest";
import { aggregateHourlyRows, mapWeeklyRows } from "@/modules/dashboard/providers/eia";

describe("EIA provider fixtures", () => {
  it("aggregates only days with all 24 distinct valid hourly observations", () => {
    const completeDay = Array.from({ length: 24 }, (_, hour) => ({
      period: `2026-07-21T${String(hour).padStart(2, "0")}`,
      respondent: "US48",
      type: "D",
      value: hour + 1,
      "value-units": "megawatthours",
    }));
    const missingValueDay = Array.from({ length: 24 }, (_, hour) => ({
      period: `2026-07-20T${String(hour).padStart(2, "0")}`,
      respondent: "US48",
      type: "D",
      value: hour === 4 ? null : 10,
      "value-units": "MWh",
    }));
    const partialDay = Array.from({ length: 19 }, (_, hour) => ({
      period: `2026-07-19T${String(hour).padStart(2, "0")}`,
      respondent: "US48",
      type: "D",
      value: 10,
      "value-units": "megawatthours",
    }));

    const observations = aggregateHourlyRows([...partialDay, ...missingValueDay, ...completeDay]);

    expect(observations).toHaveLength(1);
    expect(observations[0]).toMatchObject({
      metricId: "eia_grid_load",
      periodEnd: "2026-07-21T00:00:00.000Z",
      value: 300,
      unit: "MWh",
      metadata: { hourlyObservations: 24, aggregation: "sum-hourly-to-daily" },
    });
  });

  it("retains the latest duplicate weekly value as an official revision", () => {
    const observations = mapWeeklyRows([
      { period: "2026-07-17", series: "WGTSTUS1", value: "221000", "value-units": "MBBL" },
      { period: "2026-07-17", series: "WGTSTUS1", value: "222500", "value-units": "thousand barrels" },
      { period: "2026-07-17", series: "WCESTUS1", value: "invalid", "value-units": "MBBL" },
    ]);

    expect(observations).toEqual([
      expect.objectContaining({
        metricId: "refined_products",
        periodEnd: "2026-07-17T00:00:00.000Z",
        value: 222500,
        unit: "Mbbl",
      }),
    ]);
  });

  it("rejects a provided unit that does not match the registered EIA series", () => {
    expect(() => aggregateHourlyRows([{
      period: "2026-07-21T00",
      respondent: "US48",
      type: "D",
      value: 1,
      "value-units": "kilowatthours",
    }])).toThrow("unexpected value-units");

    expect(() => mapWeeklyRows([{
      period: "2026-07-17",
      series: "WGTSTUS1",
      value: 1,
      "value-units": "BCF",
    }])).toThrow("unexpected value-units");
  });
});
