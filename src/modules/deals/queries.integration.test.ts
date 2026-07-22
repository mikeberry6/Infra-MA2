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
    deal: {
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
      findFirst: mocks.findFirst,
      count: mocks.count,
    },
  },
}));

import {
  getAllDeals,
  getDealById,
  getDealCount,
  getLatestDealDate,
  getWeeklyDeals,
} from "@/modules/deals/queries";

const listRow = {
  legacyId: "DEAL-1",
  title: "Buyer acquires Target",
  target: "Target",
  sector: "DIGITAL",
  subsector: "Fiber",
  region: "NORTH_AMERICA",
  categories: ["ACQUISITION_BUYOUT"],
  date: new Date("2026-07-20T00:00:00.000Z"),
  dealStatus: "ANNOUNCED",
  country: "United States",
  citations: [{ source: { label: "Primary source", url: "https://example.test/deal" } }],
  participants: [
    { role: "BUYER", displayName: "Buyer", organization: { name: "Buyer Legal Name" } },
    { role: "BUYER", displayName: "Buyer", organization: { name: "Buyer Legal Name" } },
    { role: "SELLER", displayName: null, organization: { name: "Seller" } },
  ],
};

const detailRow = {
  ...listRow,
  id: "database-deal-1",
  description: "Full deal description",
  targetDescription: "Full target description",
  enterpriseValue: "$1bn",
  equityValue: null,
  stake: "100%",
  closingDate: null,
  assetScale: "1,000 route miles",
  valuationMultiple: null,
  fundVehicle: "Infrastructure Fund V",
  keyHighlights: ["Scaled platform"],
  status: "PUBLISHED",
  createdAt: new Date("2026-07-20T00:00:00.000Z"),
  updatedAt: new Date("2026-07-21T00:00:00.000Z"),
  lastVerifiedAt: new Date("2026-07-21T00:00:00.000Z"),
};

describe("deal query projections", () => {
  beforeEach(() => {
    mocks.findMany.mockReset();
    mocks.findUnique.mockReset();
    mocks.findFirst.mockReset();
    mocks.count.mockReset();
  });

  it("loads only published list rows and strips drawer-only fields", async () => {
    mocks.findMany.mockResolvedValue([{ ...listRow, description: "must not leak" }]);

    const deals = await getAllDeals();

    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: "PUBLISHED" },
      orderBy: { date: "desc" },
      select: expect.objectContaining({ legacyId: true, title: true, target: true }),
    }));
    expect(deals).toEqual([expect.objectContaining({
      id: "DEAL-1",
      buyer: "Buyer",
      seller: "Seller",
      sector: "Digital",
      region: "North America",
      category: ["Acquisition (Buyout)"],
      sourceName: "Primary source",
    })]);
    expect(deals[0]).not.toHaveProperty("description");
    expect(deals[0]).not.toHaveProperty("enterpriseValue");
    expect(deals[0]).not.toHaveProperty("keyHighlights");
  });

  it("hydrates full drawer details and deduplicates participant display names", async () => {
    mocks.findFirst.mockResolvedValue(detailRow);

    const deal = await getDealById("DEAL-1");

    expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { legacyId: "DEAL-1", status: "PUBLISHED" },
      include: expect.objectContaining({ participants: expect.any(Object), citations: expect.any(Object) }),
    }));
    expect(deal).toMatchObject({
      id: "DEAL-1",
      buyer: "Buyer",
      seller: "Seller",
      description: "Full deal description",
      enterpriseValue: "$1bn",
      keyHighlights: ["Scaled platform"],
    });
  });

  it("enforces published-only weekly, latest-date, and count queries", async () => {
    mocks.findMany.mockResolvedValue([detailRow]);
    mocks.findFirst.mockResolvedValue({ date: new Date("2026-07-20T00:00:00.000Z") });
    mocks.count.mockResolvedValue(12);
    const anchor = new Date("2026-07-22T00:00:00.000Z");

    await expect(getWeeklyDeals(anchor)).resolves.toHaveLength(1);
    await expect(getLatestDealDate()).resolves.toEqual(new Date("2026-07-20T00:00:00.000Z"));
    await expect(getDealCount()).resolves.toBe(12);

    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        status: "PUBLISHED",
        date: {
          gte: new Date("2026-07-15T00:00:00.000Z"),
          lte: anchor,
        },
      },
    }));
    expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { status: "PUBLISHED" } }));
    expect(mocks.count).toHaveBeenCalledWith({ where: { status: "PUBLISHED" } });
  });
});
