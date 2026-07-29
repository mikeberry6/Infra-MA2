import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dealCount: vi.fn(),
  fundCount: vi.fn(),
  companyCount: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(callback: T) => callback,
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
    mocks.dealCount.mockReset().mockResolvedValue(400);
    mocks.fundCount.mockReset().mockResolvedValue(80);
    mocks.companyCount.mockReset().mockResolvedValue(1_173);
  });

  it("reports the physical number of published company rows directly from Prisma", async () => {
    await expect(getDatabaseCounts()).resolves.toEqual({
      deals: 400,
      funds: 80,
      portfolio: 1_173,
    });

    expect(mocks.companyCount).toHaveBeenCalledOnce();
    expect(mocks.companyCount).toHaveBeenCalledWith({
      where: { status: "PUBLISHED" },
    });
  });
});
