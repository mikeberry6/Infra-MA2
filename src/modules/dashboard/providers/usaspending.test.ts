import { afterEach, describe, expect, it, vi } from "vitest";
import { usaSpendingProvider } from "@/modules/dashboard/providers/usaspending";

function jsonResponse(value: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("USAspending provider fixtures", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses complete aggregate endpoints while separately paginating and de-duplicating review candidates", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const body = JSON.parse(String(init?.body));
      if (url.includes("spending_by_award_count")) {
        return jsonResponse({ results: awardCounts({ contracts: 30, grants: 5 }) });
      }
      if (url.includes("spending_over_time")) {
        return jsonResponse({ results: [{ aggregated_amount: 3_000_000_000 }, { aggregated_amount: -500_000_000 }] });
      }
      const page = Number(body.page);
      const codes = body.filters.award_type_codes as string[];
      if (codes.includes("07")) {
        return jsonResponse({
          results: [{
            generated_internal_id: "LOAN",
            "Award ID": "LOAN-1",
            "Recipient Name": "Loan recipient",
            "Loan Value": 125,
            "Issued Date": "2026-07-04",
          }],
          page_metadata: { hasNext: false },
        });
      }
      if (!codes.includes("A")) {
        return jsonResponse({ results: [], page_metadata: { hasNext: false } });
      }
      if (page === 1) {
        return jsonResponse({
          results: [
            { generated_internal_id: "A", "Award ID": "A-1", "Recipient Name": "Alpha", "Award Amount": 100, "Start Date": "2026-07-01" },
            { generated_internal_id: "C", "Award ID": "C-1", "Recipient Name": "Gamma", "Award Amount": 75, "Start Date": "2026-07-03" },
          ],
          page_metadata: { hasNext: true },
        });
      }
      return jsonResponse({
        results: [
          { generated_internal_id: "A", "Award ID": "A-1", "Recipient Name": "Alpha", "Award Amount": 110, "Start Date": "2026-07-01" },
          { generated_internal_id: "B", "Award ID": "B-1", "Recipient Name": "Beta", "Award Amount": 50, "Start Date": "2026-07-02" },
        ],
        page_metadata: { hasNext: false },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await usaSpendingProvider(new Date("2026-07-22T11:30:00.000Z")).fetch();

    expect(result.observations).toEqual(expect.arrayContaining([
      expect.objectContaining({ metricId: "usaspending_infra_awards_30d", value: 35, unit: "count" }),
      expect.objectContaining({ metricId: "usaspending_infra_obligations_30d", value: 2.5, unit: "$bn" }),
    ]));
    expect(result.signals).toHaveLength(4);
    expect(result.signals?.find((signal) => signal.signalKey === "usaspending-LOAN")).toMatchObject({
      signalKey: "usaspending-LOAN",
      observedAt: "2026-07-04T00:00:00.000Z",
      metadata: { observedAtBasis: "Issued Date" },
    });
    expect(result.signals?.find((signal) => signal.signalKey === "usaspending-A")).toMatchObject({
      signalKey: "usaspending-A",
      reviewStatus: "PENDING",
      observedAt: "2026-07-01T00:00:00.000Z",
      metadata: { observedAtBasis: "Start Date" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(9);
    expect(new Set(fetchMock.mock.calls.map(([, init]) =>
      JSON.parse(String(init?.body)).filters.time_period[0].start_date))).toEqual(new Set(["2026-06-23"]));
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)).filters.award_type_codes)
      .toEqual(expect.arrayContaining(["06", "07", "09", "F001", "F010", "IDV_A", "IDV_E"]));
    const candidateBodies = fetchMock.mock.calls
      .filter(([input]) => String(input).includes("spending_by_award/"))
      .map(([, init]) => JSON.parse(String(init?.body)));
    expect(candidateBodies.every((body) => body.filters.award_type_codes.length <= 8)).toBe(true);
    expect(candidateBodies.find((body) => body.filters.award_type_codes.includes("07"))).toMatchObject({
      fields: expect.arrayContaining(["Loan Value", "Issued Date"]),
      sort: "Loan Value",
    });

    const rerun = await usaSpendingProvider(new Date("2026-07-23T11:30:00.000Z")).fetch();
    expect(rerun.signals?.find((signal) => signal.signalKey === "usaspending-A")?.observedAt)
      .toBe("2026-07-01T00:00:00.000Z");
    expect(new Set(fetchMock.mock.calls.slice(9).map(([, init]) =>
      JSON.parse(String(init?.body)).filters.time_period[0].start_date))).toEqual(new Set(["2026-06-24"]));
  });

  it("keeps aggregate observations publishable when a review candidate has no official start date", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("spending_by_award_count")) return jsonResponse({ results: awardCounts({ contracts: 1 }) });
      if (url.includes("spending_over_time")) return jsonResponse({ results: [{ aggregated_amount: 10 }] });
      return jsonResponse({
        results: [{
          generated_internal_id: "missing-date",
          "Award ID": "MISSING-DATE",
          "Recipient Name": "Fixture recipient",
          "Award Amount": 10,
          "Start Date": null,
        }],
        page_metadata: { hasNext: false },
      });
    }));

    const result = await usaSpendingProvider(new Date("2026-07-22T11:30:00.000Z")).fetch();

    expect(result.observations).toEqual(expect.arrayContaining([
      expect.objectContaining({ metricId: "usaspending_infra_awards_30d", value: 1 }),
    ]));
    expect(result.signals).toEqual([]);
    expect(result.warnings).toContain("USAspending award missing-date has no valid official award date.");
  });

  it("accepts a schema-valid empty release as an objective zero", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("spending_by_award_count")) return jsonResponse({ results: awardCounts() });
      if (url.includes("spending_over_time")) return jsonResponse({ results: [] });
      return jsonResponse({ results: [], page_metadata: { hasNext: false } });
    }));

    const result = await usaSpendingProvider(new Date("2026-07-22T11:30:00.000Z")).fetch();
    expect(result.observations).toEqual(expect.arrayContaining([
      expect.objectContaining({ metricId: "usaspending_infra_awards_30d", value: 0 }),
      expect.objectContaining({ metricId: "usaspending_infra_obligations_30d", value: 0 }),
    ]));
  });

  it.each([
    ["award count", { count: {}, overTime: { results: [] }, awards: { results: [], page_metadata: { hasNext: false } } }],
    ["spending over time", { count: { results: awardCounts() }, overTime: {}, awards: { results: [], page_metadata: { hasNext: false } } }],
    ["leading awards", { count: { results: awardCounts() }, overTime: { results: [] }, awards: { results: [] } }],
  ])("rejects a malformed HTTP-200 %s response instead of publishing zero", async (_label, fixtures) => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("spending_by_award_count")) return jsonResponse(fixtures.count);
      if (url.includes("spending_over_time")) return jsonResponse(fixtures.overTime);
      return jsonResponse(fixtures.awards);
    }));

    await expect(usaSpendingProvider(new Date("2026-07-22T11:30:00.000Z")).fetch())
      .rejects.toThrow(/USAspending/);
  });
});

function awardCounts(overrides: Partial<Record<"grants" | "loans" | "contracts" | "direct_payments" | "other" | "idvs", number>> = {}) {
  return {
    grants: 0,
    loans: 0,
    contracts: 0,
    direct_payments: 0,
    other: 0,
    idvs: 0,
    ...overrides,
  };
}
