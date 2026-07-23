import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dealCount: vi.fn(),
  dealFindMany: vi.fn(),
  companyCount: vi.fn(),
  companyFindMany: vi.fn(),
  fundCount: vi.fn(),
  fundFindMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    deal: { count: mocks.dealCount, findMany: mocks.dealFindMany },
    company: { count: mocks.companyCount, findMany: mocks.companyFindMany },
    fund: { count: mocks.fundCount, findMany: mocks.fundFindMany },
  },
}));

import {
  coerceSearchScope,
  normalizeSearchQuery,
  searchAll,
  searchResultHref,
  type SearchResult,
} from "./queries";

function deal(legacyId: string, target: string) {
  return {
    legacyId,
    target,
    title: `${target} transaction`,
    sector: "DIGITAL",
    region: "NORTH_AMERICA",
  };
}

function company(id: string, name: string) {
  return {
    id,
    name,
    sector: "DIGITAL",
    region: "NORTH_AMERICA",
    country: "United States",
  };
}

function fund(legacyId: string, fundName: string) {
  return {
    legacyId,
    fundName,
    manager: { name: `${fundName} Manager` },
  };
}

describe("cross-database search queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.dealCount.mockResolvedValue(0);
    mocks.companyCount.mockResolvedValue(0);
    mocks.fundCount.mockResolvedValue(0);
    mocks.dealFindMany.mockResolvedValue([]);
    mocks.companyFindMany.mockResolvedValue([]);
    mocks.fundFindMany.mockResolvedValue([]);
  });

  it("normalizes whitespace, validates scope, and avoids database work for short queries", async () => {
    expect(normalizeSearchQuery("  Brookfield   Infrastructure  ")).toBe("Brookfield Infrastructure");
    expect(coerceSearchScope("funds")).toBe("funds");
    expect(coerceSearchScope("unknown")).toBe("all");

    const response = await searchAll(" a ");

    expect(response).toMatchObject({ query: "a", total: 0, totalPages: 0, results: [] });
    expect(mocks.dealCount).not.toHaveBeenCalled();
    expect(mocks.companyCount).not.toHaveBeenCalled();
    expect(mocks.fundCount).not.toHaveBeenCalled();
  });

  it("ranks exact primary names before prefixes and body matches with stable entity tie-breaks", async () => {
    mocks.dealCount.mockResolvedValue(3);
    mocks.companyCount.mockResolvedValue(2);
    mocks.fundCount.mockResolvedValue(2);
    mocks.dealFindMany
      .mockResolvedValueOnce([deal("deal-exact", "Grid")])
      .mockResolvedValueOnce([deal("deal-prefix", "Grid Networks")])
      .mockResolvedValueOnce([deal("deal-body", "Utility Holdings")]);
    mocks.companyFindMany
      .mockResolvedValueOnce([company("company-exact", "Grid")])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([company("company-body", "Network Operator")]);
    mocks.fundFindMany
      .mockResolvedValueOnce([fund("fund-exact", "Grid")])
      .mockResolvedValueOnce([fund("fund-prefix", "Grid Infrastructure Fund")])
      .mockResolvedValueOnce([]);

    const response = await searchAll("Grid", { pageSize: 20 });

    expect(response.results.map((result) => `${result.match}:${result.type}:${result.id}`)).toEqual([
      "exact:deal:deal-exact",
      "exact:company:company-exact",
      "exact:fund:fund-exact",
      "prefix:deal:deal-prefix",
      "prefix:fund:fund-prefix",
      "body:deal:deal-body",
      "body:company:company-body",
    ]);
    expect(response).toMatchObject({
      counts: { deals: 3, companies: 2, funds: 2 },
      total: 7,
      scopedTotal: 7,
      page: 1,
      totalPages: 1,
    });

    for (const call of mocks.dealFindMany.mock.calls) {
      expect(call[0]).toMatchObject({
        orderBy: [{ target: "asc" }, { legacyId: "asc" }],
        take: 20,
      });
    }
    for (const call of mocks.companyFindMany.mock.calls) {
      expect(call[0]).toMatchObject({
        orderBy: [{ name: "asc" }, { country: "asc" }, { id: "asc" }],
        take: 20,
      });
    }
  });

  it("applies published and active-company predicates to count, exact, prefix, and body queries", async () => {
    mocks.companyCount.mockResolvedValue(1);
    mocks.companyFindMany
      .mockResolvedValueOnce([company("company-exact", "Fiber")])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await searchAll("Fiber", { scope: "companies" });

    const companyQueries = [
      mocks.companyCount.mock.calls[0][0],
      ...mocks.companyFindMany.mock.calls.map((call) => call[0]),
    ];
    expect(companyQueries).toHaveLength(4);
    for (const query of companyQueries) {
      expect(query.where).toEqual(expect.objectContaining({
        status: "PUBLISHED",
        retirement: { is: null },
      }));
    }
    expect(mocks.companyFindMany.mock.calls[0][0].where).toEqual(expect.objectContaining({
      name: { equals: "Fiber", mode: "insensitive" },
    }));
    expect(mocks.companyFindMany.mock.calls[1][0].where.AND).toEqual(expect.arrayContaining([
      { name: { startsWith: "Fiber", mode: "insensitive" } },
    ]));
    expect(mocks.companyFindMany.mock.calls[2][0].where.AND).toEqual(expect.arrayContaining([
      expect.objectContaining({ OR: expect.any(Array) }),
    ]));
  });

  it("returns accurate totals while paginating only the selected entity scope", async () => {
    mocks.dealCount.mockResolvedValue(5);
    mocks.companyCount.mockResolvedValue(2);
    mocks.fundCount.mockResolvedValue(1);
    mocks.dealFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        deal("deal-1", "Alpha"),
        deal("deal-2", "Beta"),
        deal("deal-3", "Gamma"),
        deal("deal-4", "Omega"),
      ]);

    const response = await searchAll("in", { scope: "deals", page: 2, pageSize: 2 });

    expect(response).toMatchObject({
      counts: { deals: 5, companies: 2, funds: 1 },
      total: 8,
      scopedTotal: 5,
      page: 2,
      pageSize: 2,
      totalPages: 3,
    });
    expect(response.results.map((result) => result.id)).toEqual(["deal-3", "deal-4"]);
    expect(mocks.dealFindMany).toHaveBeenCalledTimes(3);
    expect(mocks.companyFindMany).not.toHaveBeenCalled();
    expect(mocks.fundFindMany).not.toHaveBeenCalled();
    expect(mocks.dealFindMany.mock.calls.every((call) => call[0].take === 4)).toBe(true);
  });

  it("keeps publication guards on every entity and searches buyer and manager names in the body tier", async () => {
    mocks.dealCount.mockResolvedValue(1);
    mocks.fundCount.mockResolvedValue(1);

    await searchAll("Brookfield");

    expect(mocks.dealCount.mock.calls[0][0].where.status).toBe("PUBLISHED");
    expect(mocks.fundCount.mock.calls[0][0].where.status).toBe("PUBLISHED");
    expect(JSON.stringify(mocks.dealCount.mock.calls[0][0].where)).toContain("participants");
    expect(JSON.stringify(mocks.fundCount.mock.calls[0][0].where)).toContain("manager");
    for (const call of [...mocks.dealFindMany.mock.calls, ...mocks.fundFindMany.mock.calls]) {
      expect(call[0].where.status).toBe("PUBLISHED");
    }
  });
});

describe("search drawer links", () => {
  const base = {
    title: "Example",
    subtitle: "Example record",
    match: "exact" as const,
  };

  it("encodes stable focus identifiers for every owning database", () => {
    const dealResult: SearchResult = {
      ...base,
      type: "deal",
      id: "deal/one?",
      legacyId: "deal/one?",
    };
    const companyResult: SearchResult = { ...base, type: "company", id: "company & one" };
    const fundResult: SearchResult = {
      ...base,
      type: "fund",
      id: "fund#one",
      legacyId: "fund#one",
    };

    expect(searchResultHref(dealResult)).toBe("/tracker?focus=deal%2Fone%3F");
    expect(searchResultHref(companyResult)).toBe("/portfolio?focus=company%20%26%20one");
    expect(searchResultHref(fundResult)).toBe("/funds?focus=fund%23one");
  });
});
