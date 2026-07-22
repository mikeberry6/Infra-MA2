import { afterEach, describe, expect, it, vi } from "vitest";
import { federalRegisterProvider } from "@/modules/dashboard/providers/federal-register";

function document(documentNumber: string, publicationDate = "2026-07-21") {
  return {
    title: `Document ${documentNumber}`,
    type: "Notice",
    document_number: documentNumber,
    html_url: `https://www.federalregister.gov/documents/${documentNumber}`,
    publication_date: publicationDate,
    agencies: [{ name: "Department of Energy" }],
  };
}

describe("Federal Register provider fixtures", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("queries terms separately, paginates every result, and de-duplicates documents", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => document(`2026-${String(index).padStart(4, "0")}`));
    const shared = document("2026-0100", "2026-07-22");
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      const term = url.searchParams.get("conditions[term]");
      const page = Number(url.searchParams.get("page"));
      const body = term === "infrastructure"
        ? page === 1
          ? { count: 101, results: firstPage }
          : { count: 101, results: [shared] }
        : { count: 1, results: [shared] };
      return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await federalRegisterProvider(
      new Date("2026-07-22T11:30:00.000Z"),
      ["infrastructure", "energy"],
    ).fetch();

    expect(result.observations[0]).toMatchObject({
      metricId: "federal_register_infra_notices",
      value: 101,
      unit: "count",
    });
    expect(result.signals).toHaveLength(101);
    expect(result.signals?.[0]).toMatchObject({
      signalKey: "federal-register-2026-0100",
      reviewStatus: "PENDING",
      metadata: { matchedTerms: ["energy", "infrastructure"] },
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.map(([input]) => new URL(String(input)).searchParams.get("page"))).toEqual(["1", "2", "1"]);
    expect(new Set(fetchMock.mock.calls.map(([input]) =>
      new URL(String(input)).searchParams.get("conditions[publication_date][gte]"))))
      .toEqual(new Set(["2026-07-16"]));
  });

  it("publishes a zero count for an empty but valid release", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ count: 0, results: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })));

    const result = await federalRegisterProvider(
      new Date("2026-07-22T11:30:00.000Z"),
      ["infrastructure"],
    ).fetch();

    expect(result.observations[0]).toMatchObject({ value: 0, unit: "count" });
    expect(result.signals).toEqual([]);
  });

  it("rejects a malformed HTTP-200 response instead of publishing a zero count", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ count: 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })));

    await expect(federalRegisterProvider(
      new Date("2026-07-22T11:30:00.000Z"),
      ["infrastructure"],
    ).fetch()).rejects.toThrow("no results array");
  });
});
