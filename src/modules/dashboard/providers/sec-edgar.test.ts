import { afterEach, describe, expect, it, vi } from "vitest";
import {
  latestAnnualCapex,
  parseSecWatchlist,
  secEdgarProvider,
} from "@/modules/dashboard/providers/sec-edgar";

describe("SEC EDGAR provider fixtures", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("normalizes and de-duplicates configured CIKs", () => {
    expect(parseSecWatchlist("320193:Apple,0000320193:Apple Inc.")).toEqual([
      { cik: "0000320193", name: "Apple Inc." },
    ]);
    expect(() => parseSecWatchlist("not-a-cik:Bad")).toThrow("Invalid SEC watchlist CIK");
  });

  it("counts watchlist filings automatically and review-gates interpretations", async () => {
    const fixture = {
      cik: "320193",
      name: "Apple Inc.",
      filings: {
        recent: {
          accessionNumber: ["0000320193-26-000001", "0000320193-26-000002", "0000320193-26-000003", "0000320193-26-000004"],
          filingDate: ["2026-07-21", "2026-07-20", "2026-07-20", "2026-07-15"],
          acceptanceDateTime: ["2026-07-21T15:00:00.000Z", "2026-07-20T14:00:00.000Z", "2026-07-20T13:00:00.000Z", "2026-07-15T12:00:00.000Z"],
          form: ["8-K", "DEFM14A", "10-Q", "S-4"],
          items: ["2.01", "", "", ""],
          primaryDocument: ["a8k.htm", "merger.htm", "q.htm", "old-s4.htm"],
          primaryDocDescription: ["Completion of Acquisition", "Definitive merger proxy", "Quarterly report", "Registration statement for merger"],
        },
      },
    };
    const companyFacts = {
      entityName: "Apple Inc.",
      facts: {
        "us-gaap": {
          PaymentsToAcquirePropertyPlantAndEquipment: {
            units: {
              USD: [{
                start: "2025-01-01",
                end: "2025-12-31",
                val: 12_500_000_000,
                form: "10-K",
                fp: "FY",
                filed: "2026-02-01",
                accn: "0000320193-26-000099",
              }],
            },
          },
        },
      },
    };
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (input: string | URL | Request) => {
      const body = String(input).includes("companyfacts") ? companyFacts : fixture;
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }));

    const result = await secEdgarProvider(
      "InfraSight dashboard test@example.com",
      "320193:Apple",
      new Date("2026-07-22T11:30:00.000Z"),
      [{ cik: "0000320193", name: "Apple" }],
      0,
    ).fetch();

    expect(result.observations).toEqual(expect.arrayContaining([
      expect.objectContaining({ metricId: "sec_ma_watchlist", value: 2, unit: "count" }),
      expect.objectContaining({ metricId: "hyperscaler_capex_backlog", value: 12.5, unit: "$bn" }),
    ]));
    expect(result.signals).toHaveLength(2);
    expect(result.signals?.every((signal) => signal.reviewStatus === "PENDING")).toBe(true);
  });

  it("uses the newest valid fiscal-year fact across SEC capex tag variants", () => {
    const result = latestAnnualCapex({
      entityName: "Amazon.com, Inc.",
      facts: {
        "us-gaap": {
          PaymentsToAcquirePropertyPlantAndEquipment: {
            units: { USD: [{ start: "2016-01-01", end: "2016-12-31", val: 6, form: "10-K", fp: "FY", filed: "2017-02-01" }] },
          },
          PaymentsToAcquireProductiveAssets: {
            units: { USD: [{ start: "2025-01-01", end: "2025-12-31", val: 100, form: "10-K", fp: "FY", filed: "2026-02-01" }] },
          },
        },
      },
    }, { cik: "0001018724", name: "Amazon" });

    expect(result).toMatchObject({
      tag: "PaymentsToAcquireProductiveAssets",
      valueUsd: 100,
      periodEnd: "2025-12-31",
    });
  });

  it("fails rather than publishing an incomplete aggregate when company facts are unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (input: string | URL | Request) => {
      if (String(input).includes("companyfacts")) {
        return new Response("unavailable", { status: 503, statusText: "Service Unavailable" });
      }
      return new Response(JSON.stringify({
        cik: "320193",
        name: "Apple",
        filings: { recent: { accessionNumber: [], filingDate: [], form: [] } },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }));

    await expect(secEdgarProvider(
      "InfraSight dashboard test@example.com",
      "320193:Apple",
      new Date("2026-07-22T11:30:00.000Z"),
      [{ cik: "0000320193", name: "Apple" }],
      0,
    ).fetch()).rejects.toThrow("SEC hyperscaler capex is incomplete for Apple");
  });

  it("rejects a malformed HTTP-200 submissions payload instead of publishing a zero filing count", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (input: string | URL | Request) => {
      const body = String(input).includes("companyfacts") ? { facts: {} } : {};
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }));

    await expect(secEdgarProvider(
      "InfraSight dashboard test@example.com",
      "320193:Apple",
      new Date("2026-07-22T11:30:00.000Z"),
      [{ cik: "0000320193", name: "Apple" }],
      0,
    ).fetch()).rejects.toThrow("SEC submissions watchlist is incomplete for Apple");
  });
});
