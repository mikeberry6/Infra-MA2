import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dealFindFirst: vi.fn(),
  fundFindFirst: vi.fn(),
  companyFindFirst: vi.fn(),
  companyFindMany: vi.fn(),
  redirectFindUnique: vi.fn(),
  redirectFindMany: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (callback: (...args: never[]) => unknown) => callback,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    deal: {
      findFirst: mocks.dealFindFirst,
      findMany: vi.fn(),
      count: vi.fn(),
    },
    fund: {
      findFirst: mocks.fundFindFirst,
      findMany: vi.fn(),
      count: vi.fn(),
    },
    company: {
      findFirst: mocks.companyFindFirst,
      findMany: mocks.companyFindMany,
      count: vi.fn(),
    },
    companyRedirect: {
      findUnique: mocks.redirectFindUnique,
      findMany: mocks.redirectFindMany,
    },
    $transaction: (callback: (client: unknown) => unknown) => callback({
      company: {
        findFirst: mocks.companyFindFirst,
        findMany: mocks.companyFindMany,
      },
      companyRedirect: {
        findUnique: mocks.redirectFindUnique,
      },
    }),
  },
}));

import { getCompanyByFocusId, getCompanyById } from "@/modules/companies/queries";
import { getDealById } from "@/modules/deals/queries";
import { getFundById } from "@/modules/funds/queries";

describe("public query trust contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.dealFindFirst.mockResolvedValue(null);
    mocks.fundFindFirst.mockResolvedValue(null);
    mocks.companyFindFirst.mockResolvedValue(null);
    mocks.companyFindMany.mockResolvedValue([]);
    mocks.redirectFindUnique.mockResolvedValue(null);
    mocks.redirectFindMany.mockResolvedValue([]);
  });

  it("loads only published deals and exposes only their reviewed primary citation", async () => {
    await expect(getDealById("deal-1")).resolves.toBeNull();

    expect(mocks.dealFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { legacyId: "deal-1", status: "PUBLISHED" },
      include: expect.objectContaining({
        citations: expect.objectContaining({
          where: { isPrimary: true },
          orderBy: { id: "asc" },
          take: 1,
        }),
      }),
    }));
  });

  it("loads only published funds and excludes nonpublished portfolio companies", async () => {
    await expect(getFundById("fund-1")).resolves.toBeNull();

    expect(mocks.fundFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { legacyId: "fund-1", status: "PUBLISHED" },
      include: expect.objectContaining({
        ownershipPeriods: expect.objectContaining({
          where: {
            company: {
              status: "PUBLISHED",
              retirement: { is: null },
            },
          },
        }),
      }),
    }));
  });

  it("loads company IDs through the canonical redirect-aware published predicate", async () => {
    await expect(getCompanyById("company-1")).resolves.toBeNull();

    expect(mocks.companyFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: "company-1",
        status: "PUBLISHED",
        retirement: { is: null },
      }),
      select: { id: true },
    }));
  });

  it("resolves a retired ID only when its canonical company is published", async () => {
    mocks.redirectFindUnique.mockResolvedValue({
      company: { id: "company-canonical", status: "PUBLISHED", retirement: null },
    });
    mocks.companyFindMany
      .mockResolvedValueOnce([{ id: "company-canonical", name: "GridCo" }])
      .mockResolvedValueOnce([]);

    await expect(getCompanyByFocusId("company-retired")).resolves.toBeNull();

    expect(mocks.redirectFindUnique).toHaveBeenCalledWith({
      where: { retiredId: "company-retired" },
      select: {
        company: {
          select: {
            id: true,
            status: true,
            retirement: { select: { retiredId: true } },
          },
        },
      },
    });
    expect(mocks.companyFindFirst).not.toHaveBeenCalled();
    expect(mocks.companyFindMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: { in: ["company-canonical"] },
        status: "PUBLISHED",
        retirement: { is: null },
      }),
    }));
  });

  it("does not follow retired IDs to a nonpublished canonical company", async () => {
    mocks.redirectFindUnique.mockResolvedValue({
      company: { id: "company-draft", status: "IN_REVIEW", retirement: null },
    });

    await expect(getCompanyByFocusId("company-retired")).resolves.toBeNull();
    expect(mocks.companyFindMany).not.toHaveBeenCalled();
  });
});
