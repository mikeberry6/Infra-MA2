import { describe, expect, it, vi } from "vitest";
import {
  PORTCO_PAGE_SIZE,
  clampCompanyPage,
  fetchCompanyDetail,
  parseCompanyPage,
  parseCompanySort,
  parseCompanySortDirection,
  sortCompanyRows,
} from "./PortfolioDatabase";

type CompanyFixture = {
  name: string;
  sector: string;
  country: string;
  investmentFirm: string;
};

function company(name: string, overrides: Partial<CompanyFixture> = {}): CompanyFixture {
  return {
    name,
    sector: "Digital",
    country: "United States",
    investmentFirm: "Alpha Infrastructure",
    ...overrides,
  };
}

describe("portfolio URL result state", () => {
  it("normalizes unsupported page, sort, and direction values", () => {
    expect(parseCompanyPage("4")).toBe(4);
    expect(parseCompanyPage("2.5")).toBe(1);
    expect(parseCompanyPage("0")).toBe(1);
    expect(parseCompanySort("country")).toBe("country");
    expect(parseCompanySort("unsupported")).toBe("name");
    expect(parseCompanySortDirection("desc")).toBe("desc");
    expect(parseCompanySortDirection("sideways")).toBe("asc");
  });

  it("clamps against the 25-company result contract", () => {
    expect(PORTCO_PAGE_SIZE).toBe(25);
    expect(clampCompanyPage(8, 51)).toBe(3);
    expect(clampCompanyPage(3, 0)).toBe(1);
  });

  it("sorts all public columns without mutating the source", () => {
    const source = [
      company("Zulu", { sector: "Utilities", country: "United Kingdom", investmentFirm: "Beta" }),
      company("Alpha", { sector: "Digital", country: "Canada", investmentFirm: "Alpha" }),
    ];

    expect(sortCompanyRows(source, "name", "asc")[0].name).toBe("Alpha");
    expect(sortCompanyRows(source, "sector", "asc")[0].name).toBe("Alpha");
    expect(sortCompanyRows(source, "country", "asc")[0].name).toBe("Alpha");
    expect(sortCompanyRows(source, "firm", "desc")[0].name).toBe("Zulu");
    expect(source[0].name).toBe("Zulu");
  });
});

describe("portfolio lazy detail request", () => {
  it("passes the AbortSignal and returns the company envelope", async () => {
    const controller = new AbortController();
    const detail = {
      id: "company/1",
      focusIds: ["PORTCO-1"],
      name: "GridCo",
      investmentFirm: "Alpha Infrastructure",
      sector: "Utilities",
      subsector: "Electricity Networks",
      region: "North America",
      country: "United States",
      ownershipVehicle: "Alpha Fund I",
      status: "Active",
      countryTags: ["United States"],
      owners: [],
      description: "GridCo operates electricity networks.",
    };
    const envelope = {
      data: detail,
      meta: {
        canonicalId: "company/1",
        updatedAt: "2026-07-22T12:00:00.000Z",
        lastVerifiedAt: null,
        sourceCount: 0,
      },
    };
    const fetcher = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) =>
      new Response(JSON.stringify(envelope), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(fetchCompanyDetail("company/1", controller.signal, fetcher)).resolves.toEqual(envelope);
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("/api/portfolio/company%2F1"),
      { cache: "no-store", signal: controller.signal },
    );
  });

  it("rejects failed and malformed responses so the drawer can offer retry", async () => {
    const controller = new AbortController();
    const failed = vi.fn(async () => new Response(null, { status: 503 }));
    const malformed = vi.fn(async () => new Response(JSON.stringify({ data: null }), { status: 200 }));

    await expect(fetchCompanyDetail("company-1", controller.signal, failed)).rejects.toThrow("status 503");
    await expect(fetchCompanyDetail("company-1", controller.signal, malformed)).rejects.toThrow("complete company envelope");
  });
});
