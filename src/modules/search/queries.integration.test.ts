import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deals: vi.fn(),
  dealCount: vi.fn(),
  companies: vi.fn(),
  companyCount: vi.fn(),
  funds: vi.fn(),
  fundCount: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    deal: { findMany: mocks.deals, count: mocks.dealCount },
    company: { findMany: mocks.companies, count: mocks.companyCount },
    fund: { findMany: mocks.funds, count: mocks.fundCount },
  },
}));

import { searchAll, searchAllWithMeta } from "@/modules/search/queries";

describe("cross-database search integration", () => {
  beforeEach(() => {
    mocks.deals.mockReset().mockResolvedValue([]);
    mocks.dealCount.mockReset().mockResolvedValue(0);
    mocks.companies.mockReset().mockResolvedValue([]);
    mocks.companyCount.mockReset().mockResolvedValue(0);
    mocks.funds.mockReset().mockResolvedValue([]);
    mocks.fundCount.mockReset().mockResolvedValue(0);
  });

  it("does not query the database for blank or one-character searches", async () => {
    await expect(searchAll("B")).resolves.toEqual([]);
    await expect(searchAll(" ")).resolves.toEqual([]);
    expect(mocks.deals).not.toHaveBeenCalled();
    expect(mocks.dealCount).not.toHaveBeenCalled();
    expect(mocks.companies).not.toHaveBeenCalled();
    expect(mocks.funds).not.toHaveBeenCalled();
  });

  it("queries only published records and ranks exact, prefix, then name/body matches", async () => {
    mocks.deals.mockResolvedValue([
      {
        legacyId: "DEAL-1",
        title: "Brookfield acquires an asset",
        target: "Global Brookfield Asset",
        description: "Digital platform",
        sector: "DIGITAL",
        region: "NORTH_AMERICA",
        participants: [],
      },
    ]);
    mocks.companies.mockResolvedValue([
      {
        id: "company-1",
        name: "Brookfield Renewables",
        description: "Operating company",
        subsector: "Solar",
        sector: "POWER_ET",
        region: "NORTH_AMERICA",
        country: "United States",
      },
    ]);
    mocks.funds.mockResolvedValue([
      {
        legacyId: "FUND-1",
        fundName: "Brookfield",
        investmentStrategy: "Core infrastructure",
        manager: { name: "Brookfield Asset Management" },
      },
      {
        legacyId: "FUND-2",
        fundName: "Alpha Infrastructure Fund",
        investmentStrategy: "Managed for Brookfield clients",
        manager: { name: "Alpha Manager" },
      },
    ]);
    mocks.dealCount.mockResolvedValue(1);
    mocks.companyCount.mockResolvedValue(1);
    mocks.fundCount.mockResolvedValue(2);

    const results = await searchAll("  Brookfield  ", 10);

    expect(results.map((result) => result.title)).toEqual([
      "Brookfield",
      "Brookfield Renewables",
      "Global Brookfield Asset",
      "Alpha Infrastructure Fund",
    ]);
    for (const query of [mocks.deals, mocks.companies, mocks.funds]) {
      expect(query).toHaveBeenCalledTimes(3);
      for (const [options] of query.mock.calls) {
        expect(options).toEqual(expect.objectContaining({
          where: expect.objectContaining({ status: "PUBLISHED" }),
          take: expect.any(Number),
          orderBy: expect.any(Array),
        }));
        expect(options.take).toBeLessThanOrEqual(90);
      }
    }
    expect(mocks.deals.mock.calls[0][0].where.target.equals).toBe("Brookfield");
    expect(mocks.deals.mock.calls[1][0].where.target.startsWith).toBe("Brookfield");
    expect(mocks.deals.mock.calls[2][0].where.OR[0].title.contains).toBe("Brookfield");
    expect(results[1]).toMatchObject({
      type: "company",
      sector: "Power & ET",
      region: "North America",
    });
  });

  it("globally ranks mutually exclusive exact, prefix, and contains tiers", async () => {
    mocks.deals.mockResolvedValue(Array.from({ length: 5 }, (_, index) => ({
      legacyId: `DEAL-${index}`,
      title: `Matching deal ${index}`,
      target: `Match Deal ${index}`,
      description: "",
      sector: "DIGITAL",
      region: "EUROPE",
      participants: [],
    })));
    mocks.companies.mockResolvedValue([{
      id: "company-exact",
      name: "Match",
      description: "",
      subsector: "",
      sector: "DIGITAL",
      region: "EUROPE",
      country: "United Kingdom",
    }]);
    mocks.funds.mockResolvedValue([{
      legacyId: "fund-exact",
      fundName: "Match",
      investmentStrategy: "",
      manager: { name: "Manager" },
    }]);

    const results = await searchAll("Match", 3);

    expect(mocks.deals.mock.calls.map(([options]) => options.take)).toEqual([3, 3, 3]);
    expect(mocks.companies.mock.calls.map(([options]) => options.take)).toEqual([3, 3, 3]);
    expect(mocks.funds.mock.calls.map(([options]) => options.take)).toEqual([3, 3, 3]);
    expect(mocks.deals.mock.calls[1][0].where.NOT.target.equals).toBe("Match");
    expect(mocks.deals.mock.calls[2][0].where.NOT.target.startsWith).toBe("Match");
    expect(results).toHaveLength(3);
    expect(results.slice(0, 2).map((result) => result.type).sort()).toEqual(["company", "fund"]);
  });

  it("uses pure global relevance in All scope instead of reserving entity quotas", async () => {
    mocks.deals.mockResolvedValue(Array.from({ length: 4 }, (_, index) => ({
      legacyId: `DEAL-${index}`,
      title: `Match transaction ${index}`,
      target: `Match Asset ${index}`,
      description: "",
      sector: "DIGITAL",
      region: "EUROPE",
      participants: [],
    })));
    mocks.companies.mockResolvedValue([{
      id: "company-body",
      name: "Alpha Networks",
      description: "A Match operating company",
      subsector: "Fiber",
      sector: "DIGITAL",
      region: "EUROPE",
      country: "United Kingdom",
    }]);
    mocks.funds.mockResolvedValue([{
      legacyId: "fund-body",
      fundName: "Alpha Infrastructure Fund",
      investmentStrategy: "Match strategy",
      manager: { name: "Manager" },
    }]);
    mocks.dealCount.mockResolvedValue(4);
    mocks.companyCount.mockResolvedValue(1);
    mocks.fundCount.mockResolvedValue(1);

    const search = await searchAllWithMeta("Match", { pageSize: 3 });

    expect(search.results).toHaveLength(3);
    expect(search.results.every((result) => result.type === "deal")).toBe(true);
    expect(search.total).toBe(6);
    expect(search.totalPages).toBe(2);
  });

  it("reports complete totals while globally limiting the ranked display set", async () => {
    mocks.deals.mockResolvedValue([
      {
        legacyId: "DEAL-BODY",
        title: "Buyer acquires a platform",
        target: "Platform",
        description: "Managed by Match",
        sector: "DIGITAL",
        region: "EUROPE",
        participants: [],
      },
    ]);
    mocks.companies.mockResolvedValue([{
      id: "company-prefix",
      name: "Match Networks",
      description: "",
      subsector: "",
      sector: "DIGITAL",
      region: "EUROPE",
      country: "United Kingdom",
    }]);
    mocks.funds.mockResolvedValue([{
      legacyId: "fund-exact",
      fundName: "Match",
      investmentStrategy: "",
      manager: { name: "Manager" },
    }]);
    mocks.dealCount.mockResolvedValue(1);
    mocks.companyCount.mockResolvedValue(1);
    mocks.fundCount.mockResolvedValue(1);

    const search = await searchAllWithMeta("Match", 2);

    expect(search.results.map((result) => result.title)).toEqual(["Match", "Match Networks"]);
    expect(search.total).toBe(3);
    expect(search.scopeTotal).toBe(3);
    expect(search.counts).toEqual({ deal: 1, company: 1, fund: 1 });
    expect(search).toMatchObject({ scope: "all", page: 1, pageSize: 2, totalPages: 2 });
  });

  it("hydrates later pages and isolates entity-scoped result queries", async () => {
    const deals = Array.from({ length: 20 }, (_, index) => ({
      legacyId: `DEAL-${String(index + 1).padStart(2, "0")}`,
      title: `Match transaction ${index + 1}`,
      target: `Match Asset ${String(index + 1).padStart(2, "0")}`,
      description: "",
      sector: "DIGITAL",
      region: "EUROPE",
      participants: [],
    }));
    mocks.dealCount.mockResolvedValue(25);
    mocks.companyCount.mockResolvedValue(7);
    mocks.fundCount.mockResolvedValue(4);
    mocks.deals
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(deals)
      .mockResolvedValueOnce([]);

    const search = await searchAllWithMeta("Match", {
      scope: "deal",
      page: 2,
      pageSize: 10,
    });

    expect(search.results.map((result) => result.id)).toEqual(
      Array.from({ length: 10 }, (_, index) => `DEAL-${String(index + 11).padStart(2, "0")}`),
    );
    expect(search).toMatchObject({
      total: 36,
      scopeTotal: 25,
      counts: { deal: 25, company: 7, fund: 4 },
      scope: "deal",
      page: 2,
      pageSize: 10,
      totalPages: 3,
    });
    expect(mocks.deals).toHaveBeenCalledTimes(3);
    expect(mocks.deals.mock.calls.map(([options]) => options.take)).toEqual([20, 20, 20]);
    expect(mocks.companies).not.toHaveBeenCalled();
    expect(mocks.funds).not.toHaveBeenCalled();
  });

  it("keeps non-zero-padded equal-score pages disjoint and complete", async () => {
    const deals = Array.from({ length: 25 }, (_, index) => ({
      legacyId: `DEAL-${String(index + 1).padStart(2, "0")}`,
      title: `Match transaction ${index + 1}`,
      target: `Match Asset ${index + 1}`,
      description: "",
      sector: "DIGITAL",
      region: "EUROPE",
      participants: [],
    }));
    const databaseOrdered = [...deals].sort((a, b) => (
      a.target < b.target ? -1 : a.target > b.target ? 1 : 0
    ));
    mocks.dealCount.mockResolvedValue(deals.length);
    mocks.deals.mockImplementation(async (options) => {
      // Exact and contains tiers are empty. The prefix tier emulates the
      // database's lexical title order and honors the requested candidate cap.
      if (!options.where.target?.startsWith) return [];
      return databaseOrdered.slice(0, options.take);
    });

    const pages = [];
    for (const page of [1, 2, 3]) {
      pages.push(await searchAllWithMeta("Match", {
        scope: "deal",
        page,
        pageSize: 10,
      }));
    }

    const pageIds = pages.map((result) => result.results.map((row) => row.id));
    expect(pageIds.map((ids) => ids.length)).toEqual([10, 10, 5]);
    expect(pageIds[0].filter((id) => pageIds[1].includes(id))).toEqual([]);
    expect(pageIds[0].filter((id) => pageIds[2].includes(id))).toEqual([]);
    expect(pageIds[1].filter((id) => pageIds[2].includes(id))).toEqual([]);
    expect(new Set(pageIds.flat())).toEqual(new Set(deals.map((deal) => deal.legacyId)));
  });

  it("clamps an out-of-range page before hydrating candidates", async () => {
    mocks.dealCount.mockResolvedValue(3);
    mocks.deals.mockResolvedValue([
      {
        legacyId: "DEAL-1",
        title: "Match transaction",
        target: "Match Asset",
        description: "",
        sector: "DIGITAL",
        region: "EUROPE",
        participants: [],
      },
    ]);

    const search = await searchAllWithMeta("Match", {
      scope: "deal",
      page: 999,
      pageSize: 10,
    });

    expect(search.page).toBe(1);
    expect(search.totalPages).toBe(1);
    expect(mocks.deals.mock.calls.map(([options]) => options.take)).toEqual([10, 10, 10]);
  });

  it("searches deal participants and includes them in fallback scoring", async () => {
    mocks.deals.mockResolvedValue([{
      legacyId: "DEAL-BUYER",
      title: "Acquisition announced",
      target: "GridCo",
      description: "",
      sector: "POWER_ET",
      region: "NORTH_AMERICA",
      participants: [{ displayName: "Brookfield", organization: { name: "Brookfield Asset Management" } }],
    }]);

    const results = await searchAll("Brookfield");

    expect(mocks.deals.mock.calls[2][0].where.OR).toEqual(expect.arrayContaining([
      expect.objectContaining({
        participants: {
          some: {
            OR: [
              { displayName: { contains: "Brookfield", mode: "insensitive" } },
              { organization: { name: { contains: "Brookfield", mode: "insensitive" } } },
            ],
          },
        },
      }),
    ]));
    expect(results).toEqual([expect.objectContaining({ type: "deal", id: "DEAL-BUYER" })]);
  });
});
