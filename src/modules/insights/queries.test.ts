import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dealCount: vi.fn(),
  fundCount: vi.fn(),
  companyCount: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    deal: { count: mocks.dealCount },
    fund: { count: mocks.fundCount },
    company: { count: mocks.companyCount },
  },
}));

import { getDatabaseCounts } from "@/modules/insights/queries";

describe("database counts", () => {
  beforeEach(() => {
    mocks.dealCount.mockReset().mockResolvedValue(101);
    mocks.fundCount.mockReset().mockResolvedValue(23);
    mocks.companyCount.mockReset().mockResolvedValue(57);
  });

  it("counts published company rows directly instead of clustering names", async () => {
    await expect(getDatabaseCounts()).resolves.toEqual({
      deals: 101,
      funds: 23,
      portfolio: 57,
    });

    expect(mocks.dealCount).toHaveBeenCalledWith({ where: { status: "PUBLISHED" } });
    expect(mocks.fundCount).toHaveBeenCalledWith({ where: { status: "PUBLISHED" } });
    expect(mocks.companyCount).toHaveBeenCalledWith({ where: { status: "PUBLISHED" } });
  });
});
