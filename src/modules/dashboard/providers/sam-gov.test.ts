import { afterEach, describe, expect, it, vi } from "vitest";
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

    expect(result.observations[0]).toMatchObject({ metricId: "sam_opportunities", value: 2, unit: "count" });
    expect(result.signals).toHaveLength(2);
    expect(result.signals?.[0]).toMatchObject({ signalKey: "sam-opportunity-A", reviewStatus: "PENDING" });
    expect(fetchMock).toHaveBeenCalledTimes(9);
    expect(fetchMock.mock.calls
      .filter(([input]) => new URL(String(input)).searchParams.get("title") === "infrastructure")
      .map(([input]) => new URL(String(input)).searchParams.get("offset")))
      .toEqual(["0", "1"]);
    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname)
      .toBe("/opportunities/v2/search");
    expect(new Set(fetchMock.mock.calls.map(([input]) =>
      new URL(String(input)).searchParams.get("postedFrom"))))
      .toEqual(new Set(["07/16/2026"]));
    expect(new URL(String(fetchMock.mock.calls[0][0])).searchParams.getAll("ptype"))
      .toEqual(["p", "r", "o", "k", "i"]);
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

  it("treats SAM.gov's documented 404 No Data response as an objective zero", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, {
      status: 404,
      statusText: "Not Found",
    })));

    const result = await samGovProvider("fixture-key", new Date("2026-07-22T11:30:00.000Z")).fetch();

    expect(result.observations[0]).toMatchObject({ metricId: "sam_opportunities", value: 0 });
    expect(result.signals).toEqual([]);
  });

  it("rejects a 404 after pagination begins instead of publishing an incomplete count", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      if (url.searchParams.get("title") !== "infrastructure") {
        return new Response(JSON.stringify({ totalRecords: 0, opportunitiesData: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.searchParams.get("offset") === "0") {
        return new Response(JSON.stringify({
          totalRecords: 1001,
          opportunitiesData: [{ noticeId: "A", active: "Yes" }],
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response(null, { status: 404, statusText: "Not Found" });
    }));

    await expect(samGovProvider("fixture-key", new Date("2026-07-22T11:30:00.000Z")).fetch())
      .rejects.toThrow("returned no data after pagination began on page 1");
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
