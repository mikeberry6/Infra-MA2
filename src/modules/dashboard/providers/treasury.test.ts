import { afterEach, describe, expect, it, vi } from "vitest";
import { treasuryProvider } from "@/modules/dashboard/providers/treasury";

function xml(date: string, values: Record<string, number | null>): string {
  const fields = Object.entries(values)
    .map(([name, value]) => value === null ? `<d:${name} m:null="true" />` : `<d:${name}>${value}</d:${name}>`)
    .join("");
  return `<feed><entry><content><m:properties><d:NEW_DATE>${date}T00:00:00</d:NEW_DATE>${fields}</m:properties></content></entry></feed>`;
}

describe("Treasury provider fixtures", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("parses official nominal/real releases, derives curves, and skips missing values", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const isReal = String(input).includes("daily_treasury_real_yield_curve");
      const body = isReal
        ? xml("2026-07-21", { TC_10YEAR: 1.8 })
        : xml("2026-07-21", {
          BC_2YEAR: 4.1,
          BC_5YEAR: 4.2,
          BC_10YEAR: 4.5,
          BC_30YEARDISPLAY: null,
        });
      return new Response(body, { status: 200, headers: { "Content-Type": "application/xml" } });
    }));

    const result = await treasuryProvider(new Date("2026-07-22T11:30:00.000Z")).fetch();

    expect(result.observations).toEqual(expect.arrayContaining([
      expect.objectContaining({ metricId: "curve_2s10s", value: 40, unit: "bp" }),
      expect.objectContaining({ metricId: "tips_10y_real_yield", value: 1.8, unit: "%" }),
      expect.objectContaining({ metricId: "breakeven_10y_inflation", value: 2.7, unit: "%" }),
    ]));
    expect(result.observations.some((item) => item.metricId === "us_treasury_30y")).toBe(false);
  });

  it("falls back to the prior-year release when new-year feeds are empty", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      const year = url.searchParams.get("field_tdr_date_value");
      if (year === "2027") return new Response("<feed />", { status: 200 });
      const isReal = url.searchParams.get("data") === "daily_treasury_real_yield_curve";
      const body = isReal
        ? xml("2026-12-31", { TC_10YEAR: 1.9 })
        : xml("2026-12-31", {
          BC_2YEAR: 4.0,
          BC_5YEAR: 4.1,
          BC_10YEAR: 4.4,
          BC_30YEARDISPLAY: 4.7,
        });
      return new Response(body, { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await treasuryProvider(new Date("2027-01-01T12:30:00.000Z")).fetch();

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(result.observations).toEqual(expect.arrayContaining([
      expect.objectContaining({ metricId: "us_treasury_10y", periodEnd: "2026-12-31T00:00:00.000Z" }),
      expect.objectContaining({ metricId: "tips_10y_real_yield", periodEnd: "2026-12-31T00:00:00.000Z" }),
    ]));
  });
});
