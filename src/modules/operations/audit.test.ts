import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  getSessionIdentity: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { auditEvent: { create: mocks.create } },
}));
vi.mock("@/modules/auth/guards", () => ({
  getSessionIdentity: mocks.getSessionIdentity,
}));

import { recordAuditEvent } from "@/modules/operations/audit";

describe("audit event attribution", () => {
  beforeEach(() => {
    mocks.create.mockReset().mockResolvedValue({ id: "audit-1" });
    mocks.getSessionIdentity.mockReset().mockResolvedValue({ id: "admin-1", role: "ADMIN" });
  });

  it("attributes interactive mutations to the authenticated actor", async () => {
    await expect(recordAuditEvent({
      entityType: "Deal",
      entityId: "deal-1",
      action: "PUBLISH",
      changes: { status: { from: "DRAFT", to: "PUBLISHED" } },
    })).resolves.toBe("audit-1");

    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        actorId: "admin-1",
        entityType: "Deal",
        entityId: "deal-1",
        action: "PUBLISH",
        changes: { status: { from: "DRAFT", to: "PUBLISHED" } },
        metadata: undefined,
      },
      select: { id: true },
    });
  });

  it("supports explicitly attributed automation without reading a user session", async () => {
    await recordAuditEvent({
      entityType: "Fund",
      action: "IMPORT",
      actorId: null,
      metadata: { pipeline: "BULK_IMPORT_FUNDS" },
    });

    expect(mocks.getSessionIdentity).not.toHaveBeenCalled();
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ actorId: null, entityId: null }),
    }));
  });

  it("can write through a transaction client so mutations and audit stay atomic", async () => {
    const transactionCreate = vi.fn().mockResolvedValue({ id: "audit-transaction-1" });

    await expect(recordAuditEvent({
      entityType: "Company",
      action: "BULK_IMPORT",
      changes: { inserted: 1 },
    }, {
      auditEvent: { create: transactionCreate },
    } as never)).resolves.toBe("audit-transaction-1");

    expect(transactionCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        actorId: "admin-1",
        entityType: "Company",
        action: "BULK_IMPORT",
      }),
    }));
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
