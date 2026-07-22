import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  transaction: vi.fn(),
  requireAdmin: vi.fn(),
  recordAuditEvent: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    deal: { findUnique: mocks.findUnique },
    $transaction: mocks.transaction,
  },
}));
vi.mock("@/modules/auth/guards", () => ({
  requireAdmin: mocks.requireAdmin,
  isAuthorizationError: () => false,
}));
vi.mock("@/modules/operations/audit", () => ({ recordAuditEvent: mocks.recordAuditEvent }));
vi.mock("@/lib/revalidation", () => ({ revalidateAppData: mocks.revalidate }));

import { publishDeal } from "@/modules/admin/actions";

const publishable = {
  status: "IN_REVIEW",
  updatedAt: new Date("2026-07-22T12:00:00.000Z"),
  target: "Target",
  country: "United States",
  date: new Date("2026-07-21T00:00:00.000Z"),
  dealStatus: "ANNOUNCED",
  categories: ["ACQUISITION_BUYOUT"],
  participants: [{ role: "BUYER" }],
  citations: [{ id: "citation-1" }],
};

describe("deal publication seller gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.recordAuditEvent.mockResolvedValue("audit-1");
  });

  it("blocks a legacy seller-free record until an editor reviews the absence", async () => {
    mocks.findUnique.mockResolvedValue({
      ...publishable,
      sellerDisclosureStatus: "LEGACY_UNREVIEWED",
      sellerDisclosureReason: null,
    });

    await expect(publishDeal("deal-1")).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining("seller or reviewed seller-disclosure reason"),
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("publishes a seller-free record with an explicit reviewed reason", async () => {
    mocks.findUnique.mockResolvedValue({
      ...publishable,
      sellerDisclosureStatus: "NOT_DISCLOSED",
      sellerDisclosureReason: "The primary announcement does not identify a seller.",
    });
    const tx = { deal: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) } };
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );

    await expect(publishDeal("deal-1")).resolves.toEqual({ success: true });
    expect(tx.deal.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "deal-1", status: "IN_REVIEW" }),
      data: expect.objectContaining({ status: "PUBLISHED", lastVerifiedAt: expect.any(Date) }),
    }));
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      entityType: "Deal",
      entityId: "deal-1",
      action: "PUBLISH",
    }), tx);
  });

  it("keeps a named-seller legacy record publishable", async () => {
    mocks.findUnique.mockResolvedValue({
      ...publishable,
      participants: [{ role: "BUYER" }, { role: "SELLER" }],
      sellerDisclosureStatus: "LEGACY_UNREVIEWED",
      sellerDisclosureReason: null,
    });
    const tx = { deal: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) } };
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );

    await expect(publishDeal("deal-1")).resolves.toEqual({ success: true });
  });
});
