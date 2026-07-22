import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    auditEvent: { count: vi.fn() },
    deal: { findUnique: vi.fn(), deleteMany: vi.fn() },
    dealParticipant: { count: vi.fn(), deleteMany: vi.fn() },
    citation: { count: vi.fn(), deleteMany: vi.fn() },
    newsMention: { count: vi.fn() },
    fund: { findUnique: vi.fn(), deleteMany: vi.fn() },
    ownershipPeriod: { count: vi.fn(), deleteMany: vi.fn() },
    company: { findUnique: vi.fn(), deleteMany: vi.fn() },
    companyRedirect: { count: vi.fn() },
    milestone: { count: vi.fn(), deleteMany: vi.fn() },
    managementRole: { count: vi.fn(), deleteMany: vi.fn() },
  };
  return {
    tx,
    transaction: vi.fn(),
    requireAdmin: vi.fn(),
    recordAuditEvent: vi.fn(),
    revalidate: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: { $transaction: mocks.transaction },
}));
vi.mock("@/modules/auth/guards", () => ({
  requireAdmin: mocks.requireAdmin,
  isAuthorizationError: () => false,
}));
vi.mock("@/modules/operations/audit", () => ({ recordAuditEvent: mocks.recordAuditEvent }));
vi.mock("@/lib/revalidation", () => ({ revalidateAppData: mocks.revalidate }));

import { deleteCompany, deleteDeal, deleteFund } from "@/modules/admin/actions";

const updatedAt = new Date("2026-07-22T12:00:00Z");

describe("admin hard-delete actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.transaction.mockImplementation(async (callback: (tx: typeof mocks.tx) => unknown) => callback(mocks.tx));
    mocks.tx.auditEvent.count.mockResolvedValue(0);
    mocks.tx.newsMention.count.mockResolvedValue(0);
    mocks.tx.dealParticipant.count.mockResolvedValue(0);
    mocks.tx.citation.count.mockResolvedValue(0);
    mocks.tx.ownershipPeriod.count.mockResolvedValue(0);
    mocks.tx.companyRedirect.count.mockResolvedValue(0);
    mocks.tx.milestone.count.mockResolvedValue(0);
    mocks.tx.managementRole.count.mockResolvedValue(0);
    mocks.tx.deal.deleteMany.mockResolvedValue({ count: 1 });
    mocks.tx.fund.deleteMany.mockResolvedValue({ count: 1 });
    mocks.tx.company.deleteMany.mockResolvedValue({ count: 1 });
    mocks.recordAuditEvent.mockResolvedValue("audit-1");
  });

  it("rejects a published deal without deleting its owned records", async () => {
    mocks.tx.deal.findUnique.mockResolvedValue({
      id: "deal-1",
      status: "PUBLISHED",
      lastVerifiedAt: updatedAt,
      updatedAt,
    });

    await expect(deleteDeal("deal-1")).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining("Use Archive"),
    });
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
    expect(mocks.tx.dealParticipant.deleteMany).not.toHaveBeenCalled();
    expect(mocks.tx.deal.deleteMany).not.toHaveBeenCalled();
  });

  it("atomically records the full draft snapshot before deleting a clean deal", async () => {
    const deal = { id: "deal-1", legacyId: "draft-1", status: "DRAFT", lastVerifiedAt: null, updatedAt };
    mocks.tx.deal.findUnique.mockResolvedValue(deal);
    mocks.tx.dealParticipant.count.mockResolvedValue(2);
    mocks.tx.citation.count.mockResolvedValue(1);

    await expect(deleteDeal("deal-1")).resolves.toEqual({ success: true });
    expect(mocks.transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      entityType: "Deal",
      entityId: "deal-1",
      action: "DELETE",
      changes: expect.objectContaining({
        beforeSnapshot: expect.objectContaining({ id: "deal-1", status: "DRAFT" }),
        deletedOwnedRecords: { participants: 2, citations: 1 },
      }),
    }), mocks.tx);
    expect(mocks.recordAuditEvent.mock.invocationCallOrder[0]).toBeLessThan(mocks.tx.deal.deleteMany.mock.invocationCallOrder[0]);
    expect(mocks.tx.deal.deleteMany).toHaveBeenCalledWith({
      where: { id: "deal-1", status: "DRAFT", updatedAt },
    });
  });

  it("blocks a draft fund that is referenced by ownership history", async () => {
    mocks.tx.fund.findUnique.mockResolvedValue({
      id: "fund-1",
      status: "DRAFT",
      lastVerifiedAt: null,
      updatedAt,
    });
    mocks.tx.ownershipPeriod.count.mockResolvedValue(1);

    await expect(deleteFund("fund-1")).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining("ownership periods (1)"),
    });
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
    expect(mocks.tx.fund.deleteMany).not.toHaveBeenCalled();
  });

  it("blocks a company deletion when a canonical redirect depends on it", async () => {
    mocks.tx.company.findUnique.mockResolvedValue({
      id: "company-1",
      status: "DRAFT",
      lastVerifiedAt: null,
      updatedAt,
    });
    mocks.tx.companyRedirect.count.mockResolvedValue(2);

    await expect(deleteCompany("company-1")).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining("redirects (2)"),
    });
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
    expect(mocks.tx.milestone.deleteMany).not.toHaveBeenCalled();
    expect(mocks.tx.company.deleteMany).not.toHaveBeenCalled();
  });
});
