import { afterEach, describe, expect, it, vi } from "vitest";
import { fredPeriodEnd, fredProvider } from "@/modules/dashboard/providers/fred";

describe("FRED provider period dates", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("normalizes monthly and quarterly period-start dates to period ends", () => {
    expect(fredPeriodEnd("2026-06-01", "Monthly")).toBe("2026-06-30");
    expect(fredPeriodEnd("2024-02-01", "Monthly")).toBe("2024-02-29");
    expect(fredPeriodEnd("2026-01-01", "Quarterly")).toBe("2026-03-31");
    expect(fredPeriodEnd("2026-10-01", "Quarterly")).toBe("2026-12-31");
  });

  it("leaves daily and weekly observation dates unchanged", () => {
    expect(fredPeriodEnd("2026-07-21", "Daily")).toBe("2026-07-21");
    expect(fredPeriodEnd("2026-07-18", "Weekly")).toBe("2026-07-18");
  });

  it("uses cadence-normalized dates in provider observations", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      const seriesId = url.searchParams.get("series_id");
      if (seriesId === "PBWSCONS") {
        return new Response(JSON.stringify({ observations: [
          { date: "2026-05-01", value: "1000" },
          { date: "2026-06-01", value: "1200" },
        ] }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (seriesId === "PBSWGCONS") {
        return new Response(JSON.stringify({ observations: [
          { date: "2026-05-01", value: "2000" },
        ] }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      const date = seriesId === "A191RL1Q225SBEA"
        ? "2026-01-01"
        : seriesId === "CPIAUCSL"
          ? "2026-06-01"
          : "2026-07-21";
      return new Response(JSON.stringify({ observations: [{ date, value: "1" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }));

    const result = await fredProvider("fixture-key").fetch();

    expect(result.observations).toEqual(expect.arrayContaining([
      expect.objectContaining({ metricId: "gdp", periodEnd: "2026-03-31T00:00:00.000Z" }),
      expect.objectContaining({ metricId: "cpi", periodEnd: "2026-06-30T00:00:00.000Z" }),
      expect.objectContaining({ metricId: "sofr", periodEnd: "2026-07-21T00:00:00.000Z" }),
    ]));
    expect(result.observations.filter((item) => item.metricId === "public_water_sewer_construction"))
      .toEqual([expect.objectContaining({
        periodEnd: "2026-05-31T00:00:00.000Z",
        value: 3,
        unit: "$bn",
        metadata: expect.objectContaining({
          fredSeriesIds: ["PBWSCONS", "PBSWGCONS"],
          componentValues: { PBWSCONS: 1000, PBSWGCONS: 2000 },
        }),
      })]);
  });
});
