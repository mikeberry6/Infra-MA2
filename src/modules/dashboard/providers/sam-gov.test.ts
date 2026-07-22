import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DASHBOARD_METHODOLOGY_VERSIONS,
  SAM_GOV_METHODOLOGY_PAGE_SIZE,
} from "@/modules/dashboard/methodology-cutover";
import { samGovProvider } from "@/modules/dashboard/providers/sam-gov";

describe("SAM.gov provider fixtures", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("paginates and de-duplicates opportunity matches before publishing a count", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      const keyword = url.searchParams.get("title");
      const offset = Number(url.searchParams.get("offset"));
      const body = keyword === "infrastructure"
        ? offset === 0
          ? {
              totalRecords: 1001,
              opportunitiesData: [{ noticeId: "A", title: "Infrastructure program", postedDate: "2026-07-21", active: "Yes" }],
            }
          : {
              totalRecords: 1001,
              opportunitiesData: [
                { noticeId: "A", title: "Infrastructure program revised", postedDate: "2026-07-21", active: "Yes" },
                { noticeId: "B", title: "Bridge work", postedDate: "2026-07-20", active: "Yes" },
              ],
            }
        : { totalRecords: 0, opportunitiesData: [] };
      return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await samGovProvider("fixture-key", new Date("2026-07-22T11:30:00.000Z")).fetch();

    expect(result.observations[0]).toMatchObject({
      metricId: "sam_opportunities",
      value: 2,
      unit: "count",
      metadata: {
        methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.samGovOpportunities,
        pagination: "offset",
        pageSize: SAM_GOV_METHODOLOGY_PAGE_SIZE,
      },
    });
    expect(result.signals).toHaveLength(2);
    expect(result.signals?.[0]).toMatchObject({ signalKey: "sam-opportunity-A", reviewStatus: "PENDING" });
    expect(fetchMock).toHaveBeenCalledTimes(9);
    expect(fetchMock.mock.calls
      .filter(([input]) => new URL(String(input)).searchParams.get("title") === "infrastructure")
      .map(([input]) => new URL(String(input)).searchParams.get("offset")))
      .toEqual(["0", "1000"]);
    expect(new Set(fetchMock.mock.calls.map(([input]) =>
      new URL(String(input)).searchParams.get("postedFrom"))))
      .toEqual(new Set(["07/16/2026"]));
    expect(new URL(String(fetchMock.mock.calls[0][0])).searchParams.getAll("ptype"))
      .toEqual(["p", "r", "o", "k", "i"]);
  });

  it("retrieves a 2,000-record result set at offsets 0 and 1,000", async () => {
    const firstPage = Array.from({ length: 1_000 }, (_, index) => ({
      noticeId: `first-${index}`,
      title: `Infrastructure first page ${index}`,
      postedDate: "2026-07-21",
      active: "Yes",
    }));
    const secondPage = Array.from({ length: 1_000 }, (_, index) => ({
      noticeId: `second-${index}`,
      title: `Infrastructure second page ${index}`,
      postedDate: "2026-07-20",
      active: "Yes",
    }));
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      if (url.searchParams.get("title") !== "infrastructure") {
        return jsonResponse({ totalRecords: 0, opportunitiesData: [] });
      }
      const offset = Number(url.searchParams.get("offset"));
      return jsonResponse({
        totalRecords: 2_000,
        offset,
        opportunitiesData: offset === 0 ? firstPage : secondPage,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await samGovProvider("fixture-key", new Date("2026-07-22T11:30:00.000Z")).fetch();

    expect(result.observations[0]).toMatchObject({ value: 2_000 });
    expect(result.signals).toHaveLength(2_000);
    expect(fetchMock.mock.calls
      .filter(([input]) => new URL(String(input)).searchParams.get("title") === "infrastructure")
      .map(([input]) => Number(new URL(String(input)).searchParams.get("offset"))))
      .toEqual([0, 1_000]);
  });

  it("rejects a repeated page that makes no opportunity progress", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      if (url.searchParams.get("title") !== "infrastructure") {
        return jsonResponse({ totalRecords: 0, opportunitiesData: [] });
      }
      return jsonResponse({
        totalRecords: 2_000,
        opportunitiesData: [{
          noticeId: "repeated",
          title: "Repeated infrastructure opportunity",
          postedDate: "2026-07-21",
          active: "Yes",
        }],
      });
    }));

    await expect(samGovProvider("fixture-key", new Date("2026-07-22T11:30:00.000Z")).fetch())
      .rejects.toThrow("repeated a page without advancing");
  });

  it("rejects a response that echoes an earlier offset", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      if (url.searchParams.get("title") !== "infrastructure") {
        return jsonResponse({ totalRecords: 0, opportunitiesData: [] });
      }
      const requestedOffset = Number(url.searchParams.get("offset"));
      return jsonResponse({
        totalRecords: 2_000,
        offset: 0,
        opportunitiesData: [{
          noticeId: `offset-${requestedOffset}`,
          title: "Infrastructure opportunity",
          postedDate: "2026-07-21",
          active: "Yes",
        }],
      });
    }));

    await expect(samGovProvider("fixture-key", new Date("2026-07-22T11:30:00.000Z")).fetch())
      .rejects.toThrow("echoed a non-advancing offset");
  });

  it("emits every matched opportunity for analyst review", async () => {
    const opportunitiesData = Array.from({ length: 30 }, (_, index) => ({
      noticeId: `notice-${index}`,
      title: `Infrastructure opportunity ${index}`,
      postedDate: "2026-07-21",
      active: "Yes",
    }));
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      const body = url.searchParams.get("title") === "infrastructure"
        ? { totalRecords: opportunitiesData.length, opportunitiesData }
        : { totalRecords: 0, opportunitiesData: [] };
      return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
    }));

    const result = await samGovProvider("fixture-key", new Date("2026-07-22T11:30:00.000Z")).fetch();

    expect(result.observations[0]).toMatchObject({ value: 30 });
    expect(result.signals).toHaveLength(30);
  });

  it("accepts a schema-valid empty release as an objective zero", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      totalRecords: 0,
      opportunitiesData: [],
    }), { status: 200, headers: { "Content-Type": "application/json" } })));

    const result = await samGovProvider("fixture-key", new Date("2026-07-22T11:30:00.000Z")).fetch();
    expect(result.observations[0]).toMatchObject({ metricId: "sam_opportunities", value: 0 });
    expect(result.signals).toEqual([]);
  });

  it("excludes inactive notices from the automatic procurement count and review queue", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      const body = url.searchParams.get("title") === "infrastructure"
        ? {
            totalRecords: 2,
            opportunitiesData: [
              { noticeId: "active", title: "Active infrastructure solicitation", postedDate: "2026-07-21", active: "Yes" },
              { noticeId: "inactive", title: "Closed infrastructure solicitation", postedDate: "2026-07-20", active: "No" },
            ],
          }
        : { totalRecords: 0, opportunitiesData: [] };
      return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
    }));

    const result = await samGovProvider("fixture-key", new Date("2026-07-22T11:30:00.000Z")).fetch();

    expect(result.observations[0]).toMatchObject({ value: 1 });
    expect(result.signals).toHaveLength(1);
    expect(result.signals?.[0]).toMatchObject({ signalKey: "sam-opportunity-active" });
  });

  it.each([
    [{ opportunitiesData: [] }, "totalRecords"],
    [{ totalRecords: 0 }, "opportunitiesData"],
    [{ totalRecords: 0, opportunitiesData: [{ noticeId: "unexpected", active: "Yes" }] }, "zero total"],
    [{ totalRecords: 1, opportunitiesData: [{ noticeId: "missing-active" }] }, "active flag"],
  ])("rejects malformed HTTP-200 pagination instead of publishing zero", async (body, message) => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })));

    await expect(samGovProvider("fixture-key", new Date("2026-07-22T11:30:00.000Z")).fetch())
      .rejects.toThrow(message);
  });
});

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
