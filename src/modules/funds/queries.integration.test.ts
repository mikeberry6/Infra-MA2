import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  count: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    fund: {
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
      findFirst: mocks.findFirst,
      count: mocks.count,
    },
  },
}));

import {
  getAllFundDetails,
  getAllFunds,
  getFundById,
  getFundCount,
  getFundStrategyIndex,
} from "@/modules/funds/queries";

const listRow = {
  legacyId: "FUND-1",
  fundName: "Infrastructure Fund V",
  size: "$5 billion",
  sizeUsdMm: 5000,
  vintage: "2026",
  strategies: ["CORE_PLUS"],
  fundStatus: "RAISING",
  sectors: ["DIGITAL", "POWER_ET"],
  manager: { name: "Manager" },
};

const ownershipRow = {
  isActive: true,
  investmentYear: 2024,
  exitYear: null,
  company: {
    name: "Portfolio Company",
    sector: "DIGITAL",
    subsector: "Fiber",
    region: "NORTH_AMERICA",
    country: "United States",
    description: "A fiber platform",
  },
};

const siblingOwnershipRow = {
  ...ownershipRow,
  company: {
    ...ownershipRow.company,
    name: "Sibling Portfolio Company",
  },
};

const detailRow = {
  ...listRow,
  id: "database-fund-1",
  managerId: "manager-1",
  ticker: null,
  investmentStrategy: "Core-plus infrastructure",
  sourceUrls: ["https://example.test/fund"],
  structure: "CLOSED_END",
  regions: ["NORTH_AMERICA"],
  strategyUrl: "https://example.test/strategy",
  status: "PUBLISHED",
  createdAt: new Date("2026-07-20T00:00:00.000Z"),
  updatedAt: new Date("2026-07-21T00:00:00.000Z"),
  lastVerifiedAt: new Date("2026-07-21T00:00:00.000Z"),
  manager: {
    name: "Manager",
    managedFunds: [
      {
        fundName: "Infrastructure Fund V",
        strategies: ["CORE_PLUS"],
        ownershipPeriods: [ownershipRow],
      },
      {
        fundName: "Infrastructure Fund IV",
        strategies: ["CORE"],
        ownershipPeriods: [siblingOwnershipRow],
      },
    ],
  },
  ownershipPeriods: [ownershipRow],
};

describe("fund query projections", () => {
  beforeEach(() => {
    mocks.findMany.mockReset();
    mocks.findUnique.mockReset();
    mocks.findFirst.mockReset();
    mocks.count.mockReset();
  });

  it("loads only published list fields and omits drawer-heavy portfolio data", async () => {
    mocks.findMany.mockResolvedValue([{ ...listRow, investmentStrategy: "must not leak" }]);

    const funds = await getAllFunds();

    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: "PUBLISHED" },
      select: expect.objectContaining({ legacyId: true, fundName: true, manager: expect.any(Object) }),
      orderBy: { fundName: "asc" },
    }));
    expect(funds[0]).toMatchObject({
      id: "FUND-1",
      managerName: "Manager",
      strategies: ["Core-Plus"],
      status: "Raising",
      sectors: ["Digital", "Power & ET"],
    });
    expect(funds[0]).not.toHaveProperty("investmentStrategy");
    expect(funds[0]).not.toHaveProperty("portfolioCompanies");
    expect(funds[0]).not.toHaveProperty("sourceUrls");
  });

  it("hydrates a complete detail projection including realized and active holdings", async () => {
    mocks.findFirst.mockResolvedValue(detailRow);

    const fund = await getFundById("FUND-1");

    expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { legacyId: "FUND-1", status: "PUBLISHED" },
      include: expect.objectContaining({
        ownershipPeriods: expect.objectContaining({
          where: { company: { status: "PUBLISHED" } },
        }),
      }),
    }));
    expect(fund).toMatchObject({
      id: "FUND-1",
      investmentStrategy: "Core-plus infrastructure",
      structure: "Closed-End",
      regions: ["North America"],
      portfolioCompanies: [{
        name: "Portfolio Company",
        isActive: true,
        investmentYear: 2024,
      }],
      managerPortfolioCompanies: [
        { company: { name: "Portfolio Company" }, fundName: "Infrastructure Fund V", strategies: ["Core-Plus"] },
        { company: { name: "Sibling Portfolio Company" }, fundName: "Infrastructure Fund IV", strategies: ["Core"] },
      ],
    });
    const include = mocks.findFirst.mock.calls[0][0].include;
    expect(include.manager.select.managedFunds).toMatchObject({
      where: { status: "PUBLISHED" },
      orderBy: { fundName: "asc" },
    });
    expect(include.manager.select.managedFunds.select.ownershipPeriods.where)
      .toEqual({ company: { status: "PUBLISHED" } });
  });

  it.each(["DRAFT", "IN_REVIEW", "ARCHIVED"])(
    "excludes %s companies at the nested ownership query boundary",
    async (nonPublicStatus) => {
      mocks.findFirst.mockResolvedValue({ ...detailRow, ownershipPeriods: [] });

      await getFundById("FUND-1");

      const ownershipQuery = mocks.findFirst.mock.calls[0][0].include.ownershipPeriods;
      expect(ownershipQuery.where).toEqual({ company: { status: "PUBLISHED" } });
      expect(ownershipQuery.where.company.status).not.toBe(nonPublicStatus);
    },
  );

  it("applies published-only constraints to full indexes, strategy indexes, and counts", async () => {
    mocks.findMany
      .mockResolvedValueOnce([detailRow])
      .mockResolvedValueOnce([{ fundName: listRow.fundName, strategies: listRow.strategies }]);
    mocks.count.mockResolvedValue(9);

    await expect(getAllFundDetails()).resolves.toHaveLength(1);
    await expect(getFundStrategyIndex()).resolves.toEqual([{
      fundName: "Infrastructure Fund V",
      strategies: ["Core-Plus"],
    }]);
    await expect(getFundCount()).resolves.toBe(9);

    expect(mocks.findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({ where: { status: "PUBLISHED" } }));
    expect(mocks.findMany).toHaveBeenNthCalledWith(2, expect.objectContaining({ where: { status: "PUBLISHED" } }));
    expect(mocks.count).toHaveBeenCalledWith({ where: { status: "PUBLISHED" } });
  });
});
