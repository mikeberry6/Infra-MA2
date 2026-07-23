import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    company: { findFirst: vi.fn(), updateMany: vi.fn() },
    organization: { upsert: vi.fn() },
    ownershipPeriod: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
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
  prisma: {
    $transaction: mocks.transaction,
    fund: { findFirst: vi.fn(), findMany: vi.fn() },
  },
}));
vi.mock("@/modules/auth/guards", () => ({
  requireAdmin: mocks.requireAdmin,
  isAuthorizationError: () => false,
}));
vi.mock("@/modules/operations/audit", () => ({ recordAuditEvent: mocks.recordAuditEvent }));
vi.mock("@/lib/revalidation", () => ({ revalidateAppData: mocks.revalidate }));
import {
  addOwnershipPeriod,
  deleteOwnershipPeriod,
  updateOwnershipPeriod,
} from "@/modules/admin/actions";

const companyUpdatedAt = new Date("2026-07-22T12:00:00.000Z");
const ownership = {
  id: "ownership-1",
  companyId: "company-1",
  organizationId: "organization-1",
  fundId: null,
  vehicleName: "Infra Fund I",
  stake: null,
  investmentYear: 2024,
  exitYear: null,
  isActive: true,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
};

function ownershipForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  const values = {
    investmentFirm: "Infrastructure Partners",
    investmentYear: "2024",
    isActive: "true",
    ...overrides,
  };
  Object.entries(values).forEach(([key, value]) => form.set(key, value));
  return form;
}

describe("ownership child editorial workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.recordAuditEvent.mockResolvedValue("audit-1");
    mocks.transaction.mockImplementation(async (callback: (tx: typeof mocks.tx) => unknown) => callback(mocks.tx));
    mocks.tx.company.findFirst.mockResolvedValue({
      id: "company-1",
      status: "PUBLISHED",
      updatedAt: companyUpdatedAt,
    });
    mocks.tx.company.updateMany.mockResolvedValue({ count: 1 });
    mocks.tx.organization.upsert.mockResolvedValue({ id: "organization-1" });
    mocks.tx.ownershipPeriod.create.mockResolvedValue(ownership);
    mocks.tx.ownershipPeriod.findUnique.mockResolvedValue(ownership);
    mocks.tx.ownershipPeriod.update.mockResolvedValue({ ...ownership, investmentYear: 2025 });
    mocks.tx.ownershipPeriod.delete.mockResolvedValue(ownership);
  });

  it("demotes a published parent before creating an ownership child", async () => {
    await expect(addOwnershipPeriod("company-1", ownershipForm())).resolves.toEqual({
      success: true,
      id: "ownership-1",
    });

    expect(mocks.tx.company.updateMany).toHaveBeenCalledWith({
      where: {
        id: "company-1",
        status: "PUBLISHED",
        updatedAt: companyUpdatedAt,
        retirement: { is: null },
        redirects: { none: {} },
      },
      data: { status: "IN_REVIEW" },
    });
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      entityType: "Company",
      entityId: "company-1",
      action: "INVALIDATE_FOR_OWNERSHIP_EDIT",
      changes: { changedFields: ["status"] },
    }), mocks.tx);
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      entityType: "OwnershipPeriod",
      entityId: "ownership-1",
      action: "CREATE",
      changes: expect.objectContaining({
        changedFields: expect.arrayContaining([
          "companyId",
          "organizationId",
          "investmentYear",
          "isActive",
        ]),
        parentCompany: {
          companyId: "company-1",
          statusBefore: "PUBLISHED",
          statusAfter: "IN_REVIEW",
        },
      }),
    }), mocks.tx);
  });

  it("keeps an in-review parent in review while updating the child with before/after evidence", async () => {
    mocks.tx.company.findFirst.mockResolvedValue({
      id: "company-1",
      status: "IN_REVIEW",
      updatedAt: companyUpdatedAt,
    });

    await expect(updateOwnershipPeriod(
      "ownership-1",
      ownershipForm({ investmentYear: "2025" }),
    )).resolves.toEqual({ success: true });

    expect(mocks.tx.company.updateMany).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      entityType: "OwnershipPeriod",
      action: "UPDATE",
      changes: expect.objectContaining({
        changedFields: ["investmentYear"],
        beforeSnapshot: expect.objectContaining({ investmentYear: 2024 }),
        afterSnapshot: expect.objectContaining({ investmentYear: 2025 }),
      }),
    }), mocks.tx);
  });

  it("captures a deletion snapshot before deleting and invalidates the published parent", async () => {
    await expect(deleteOwnershipPeriod("ownership-1")).resolves.toEqual({ success: true });

    const deletionAudit = mocks.recordAuditEvent.mock.calls.find(
      ([event]) => event.entityType === "OwnershipPeriod" && event.action === "DELETE",
    );
    expect(deletionAudit?.[0]).toMatchObject({
      changes: {
        changedFields: expect.arrayContaining([
          "companyId",
          "organizationId",
          "investmentYear",
          "isActive",
        ]),
        beforeSnapshot: expect.objectContaining({
          id: "ownership-1",
          companyId: "company-1",
          investmentYear: 2024,
        }),
        parentCompany: {
          companyId: "company-1",
          statusBefore: "PUBLISHED",
          statusAfter: "IN_REVIEW",
        },
      },
    });
    expect(mocks.recordAuditEvent.mock.invocationCallOrder.at(-1)).toBeLessThan(
      mocks.tx.ownershipPeriod.delete.mock.invocationCallOrder[0],
    );
  });

  it("rejects ownership edits for an archived company", async () => {
    mocks.tx.company.findFirst.mockResolvedValue({
      id: "company-1",
      status: "ARCHIVED",
      updatedAt: companyUpdatedAt,
    });

    await expect(deleteOwnershipPeriod("ownership-1")).resolves.toEqual({
      success: false,
      error: "Archived companies cannot be edited.",
    });
    expect(mocks.tx.ownershipPeriod.delete).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
  });
});
