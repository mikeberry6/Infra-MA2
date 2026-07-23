import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  count: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (callback: (...args: never[]) => unknown) => callback,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { fund: mocks },
}));

import {
  getAllFunds,
  getFundDetailResponse,
} from "@/modules/funds/queries";

const ownershipPeriod = {
  isActive: true,
  investmentYear: 2022,
  exitYear: null,
  company: {
    name: "FiberCo",
    sector: "DIGITAL",
    subsector: "Fiber",
    region: "NORTH_AMERICA",
    country: "United States",
    description: "Published operating company",
  },
};

const baseFund = {
  id: "db-fund-1",
  legacyId: "fund-1",
  managerId: "manager-1",
  fundName: "Infra Fund I",
  ticker: null,
  investmentStrategy: "Core infrastructure",
  size: "$2bn",
  sizeUsdMm: 2_000,
  vintage: "2024",
  strategies: ["CORE"],
  structure: "CLOSED_END",
  fundStatus: "FINANCIAL_CLOSE",
  sectors: ["DIGITAL"],
  regions: ["NORTH_AMERICA"],
  sourceUrls: ["https://example.test/source", "https://example.test/source"],
  primarySourceUrl: "https://example.test/source",
  strategyUrl: "https://example.test/strategy",
  status: "PUBLISHED",
  lastVerifiedAt: new Date("2026-07-15T00:00:00.000Z"),
  createdAt: new Date("2026-07-10T00:00:00.000Z"),
  updatedAt: new Date("2026-07-20T00:00:00.000Z"),
  ownershipPeriods: [ownershipPeriod],
  manager: {
    name: "Manager One",
    managedFunds: [{
      fundName: "Infra Fund I",
      strategies: ["CORE"],
      ownershipPeriods: [ownershipPeriod],
    }],
  },
};

describe("fund list/detail query contracts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses a minimal published-only list projection", async () => {
    mocks.findMany.mockResolvedValue([baseFund]);

    const [item] = await getAllFunds();

    const query = mocks.findMany.mock.calls[0][0];
    expect(query.where).toEqual({ status: "PUBLISHED" });
    expect(query.select).toEqual(expect.objectContaining({
      legacyId: true,
      fundName: true,
      manager: { select: { name: true } },
    }));
    expect(query.select).not.toHaveProperty("investmentStrategy");
    expect(query.select).not.toHaveProperty("ownershipPeriods");
    expect(item).toEqual(expect.objectContaining({
      legacyId: "fund-1",
      managerName: "Manager One",
      strategies: ["Core"],
    }));
    expect(item).not.toHaveProperty("sourceUrls");
  });

  it("keeps every nested company path active and published and dedupes source metadata", async () => {
    mocks.findFirst.mockResolvedValue(baseFund);

    const response = await getFundDetailResponse("fund-1");

    expect(mocks.findFirst).toHaveBeenCalledTimes(1);
    const query = mocks.findFirst.mock.calls[0][0];
    expect(query.where).toEqual({ legacyId: "fund-1", status: "PUBLISHED" });
    expect(query.include.ownershipPeriods.where).toEqual({
      company: { status: "PUBLISHED", retirement: { is: null } },
    });
    expect(query.include.manager.select.managedFunds.where).toEqual({ status: "PUBLISHED" });
    expect(query.include.manager.select.managedFunds.select.ownershipPeriods.where).toEqual({
      company: { status: "PUBLISHED", retirement: { is: null } },
    });
    expect(response).toEqual(expect.objectContaining({
      data: expect.objectContaining({
        portfolioCompanies: [expect.objectContaining({ name: "FiberCo" })],
        managerPortfolioCompanies: [expect.objectContaining({ fundName: "Infra Fund I" })],
      }),
      meta: {
        canonicalId: "fund-1",
        updatedAt: "2026-07-20T00:00:00.000Z",
        lastVerifiedAt: "2026-07-15T00:00:00.000Z",
        sourceCount: 2,
      },
    }));
  });
});
