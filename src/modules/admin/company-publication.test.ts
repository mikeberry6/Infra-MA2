import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  transaction: vi.fn(),
  requireAdmin: vi.fn(),
  recordAuditEvent: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    company: { findFirst: mocks.findFirst },
    $transaction: mocks.transaction,
  },
}));
vi.mock("@/modules/auth/guards", () => ({
  requireAdmin: mocks.requireAdmin,
  isAuthorizationError: () => false,
}));
vi.mock("@/modules/operations/audit", () => ({ recordAuditEvent: mocks.recordAuditEvent }));
vi.mock("@/lib/revalidation", () => ({ revalidateAppData: mocks.revalidate }));
import { publishCompany, verifyCompany } from "@/modules/admin/actions";

const completeCompany = {
  updatedAt: new Date("2026-07-22T12:00:00.000Z"),
  name: "GridCo",
  country: "United States",
  sector: "UTILITIES",
  description: "An electric utility platform.",
  website: "https://example.com",
  citations: [{ id: "citation-1" }],
};

describe("company publication ownership gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.recordAuditEvent.mockResolvedValue("audit-1");
  });

  it("blocks publication when an ownership row identifies no investor", async () => {
    mocks.findFirst.mockResolvedValue({
      ...completeCompany,
      status: "IN_REVIEW",
      ownershipPeriods: [{
        id: "ownership-empty",
        fundId: null,
        organizationId: null,
        fund: null,
      }],
    });

    await expect(publishCompany("company-1")).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining(
        "ownership period backed by a published fund or investor organization",
      ),
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("blocks verification when a published company has an empty ownership row", async () => {
    mocks.findFirst.mockResolvedValue({
      ...completeCompany,
      status: "PUBLISHED",
      ownershipPeriods: [{
        id: "ownership-empty",
        fundId: null,
        organizationId: null,
        fund: null,
      }],
    });

    await expect(verifyCompany("company-1")).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining(
        "ownership period backed by a published fund or investor organization",
      ),
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("accepts an ownership row backed by an investor organization", async () => {
    mocks.findFirst.mockResolvedValue({
      ...completeCompany,
      status: "IN_REVIEW",
      ownershipPeriods: [{
        id: "ownership-1",
        fundId: null,
        organizationId: "organization-1",
        fund: null,
      }],
    });
    const tx = {
      company: {
        findMany: vi.fn().mockResolvedValue([]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );

    await expect(publishCompany("company-1")).resolves.toEqual({ success: true });
    expect(tx.company.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "PUBLISHED", lastVerifiedAt: expect.any(Date) }),
    }));
  });
});
