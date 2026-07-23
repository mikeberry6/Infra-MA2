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
  prisma: { deal: mocks },
}));

import {
  getAllDeals,
  getDealDetailResponse,
} from "@/modules/deals/queries";

const baseDeal = {
  id: "db-deal-1",
  legacyId: "deal-1",
  title: "Buyer acquires Target",
  target: "Target",
  sector: "DIGITAL",
  subsector: "Fiber",
  region: "NORTH_AMERICA",
  categories: ["ACQUISITION_BUYOUT"],
  date: new Date("2026-07-20T00:00:00.000Z"),
  description: "Reviewed narrative",
  targetDescription: "Target narrative",
  country: "United States",
  enterpriseValue: "$1bn",
  equityValue: null,
  stake: "100%",
  dealStatus: "ANNOUNCED",
  closingDate: null,
  sellerDisclosureStatus: "DISCLOSED",
  sellerDisclosureReason: null,
  assetScale: null,
  valuationMultiple: null,
  fundVehicle: null,
  keyHighlights: ["Reviewed"],
  status: "PUBLISHED",
  lastVerifiedAt: new Date("2026-07-19T00:00:00.000Z"),
  createdAt: new Date("2026-07-18T00:00:00.000Z"),
  updatedAt: new Date("2026-07-21T00:00:00.000Z"),
  participants: [
    { id: "p1", role: "BUYER", displayName: null, organization: { name: "Buyer Infra" } },
    { id: "p2", role: "SELLER", displayName: "Seller Display", organization: { name: "Seller Legal" } },
  ],
  citations: [{ source: { label: "Primary", url: "https://example.test/primary" } }],
  _count: { citations: 3 },
};

describe("deal list/detail query contracts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("selects a published-only minimal list projection", async () => {
    mocks.findMany.mockResolvedValue([baseDeal]);

    const [item] = await getAllDeals();

    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: "PUBLISHED" },
      select: expect.objectContaining({
        legacyId: true,
        participants: expect.objectContaining({
          where: { role: { in: ["BUYER", "SELLER"] } },
        }),
      }),
    }));
    const query = mocks.findMany.mock.calls[0][0];
    expect(query.select).not.toHaveProperty("description");
    expect(query.select).not.toHaveProperty("keyHighlights");
    expect(item).toEqual(expect.objectContaining({
      legacyId: "deal-1",
      buyer: "Buyer Infra",
      seller: "Seller Display",
      sourceUrl: "https://example.test/primary",
    }));
    expect(item).not.toHaveProperty("description");
  });

  it("returns detail and metadata from one published row read", async () => {
    mocks.findFirst.mockResolvedValue(baseDeal);

    const response = await getDealDetailResponse("deal-1");

    expect(mocks.findFirst).toHaveBeenCalledTimes(1);
    expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { legacyId: "deal-1", status: "PUBLISHED" },
      include: expect.objectContaining({
        citations: expect.objectContaining({ where: { isPrimary: true }, take: 1 }),
        _count: { select: { citations: true } },
      }),
    }));
    expect(response).toEqual(expect.objectContaining({
      data: expect.objectContaining({
        legacyId: "deal-1",
        description: "Reviewed narrative",
        sellerDisclosureStatus: "DISCLOSED",
      }),
      meta: {
        canonicalId: "deal-1",
        updatedAt: "2026-07-21T00:00:00.000Z",
        lastVerifiedAt: "2026-07-19T00:00:00.000Z",
        sourceCount: 3,
      },
    }));
  });
});
