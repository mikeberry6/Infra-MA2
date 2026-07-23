import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  deleteMany: vi.fn(),
  findMany: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { importPreview: mocks },
}));

import {
  createImportPreviewToken,
  consumeImportPreviewToken,
  hashImportPayload,
  ImportPreviewTokenError,
} from "./preview-token";

const items = [{ target: "Asset", id: "DEAL-1", categories: ["Acquisition"] }];
const summary = {
  total: 1,
  valid: 1,
  creates: 1,
  updates: 0,
  unchanged: 0,
  quarantined: 0,
  errors: 0,
};

describe("import preview tokens", () => {
  beforeEach(() => {
    vi.stubEnv("NEXTAUTH_SECRET", "test-secret-that-is-at-least-thirty-two-characters");
    mocks.create.mockReset().mockResolvedValue({});
    mocks.deleteMany.mockReset().mockResolvedValue({ count: 0 });
    mocks.findMany.mockReset().mockResolvedValue([]);
    mocks.updateMany.mockReset().mockResolvedValue({ count: 1 });
  });

  it("hashes object keys canonically", () => {
    expect(hashImportPayload([{ a: 1, b: 2 }])).toBe(hashImportPayload([{ b: 2, a: 1 }]));
  });

  it("binds a single-use token to actor, entity, payload, summary, and expiry", async () => {
    const token = await createImportPreviewToken({ actorId: "admin-1", entityType: "deals", items, summary });
    await consumeImportPreviewToken({ token, actorId: "admin-1", entityType: "deals", items, summary });

    expect(mocks.create).toHaveBeenCalledOnce();
    expect(mocks.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ actorId: "admin-1", entityType: "deals", consumedAt: null }),
      data: { consumedAt: expect.any(Date) },
    }));
  });

  it("prunes at most 500 expired previews without logging payloads or summaries", async () => {
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.findMany.mockResolvedValue(
      Array.from({ length: 500 }, (_, index) => ({ id: `expired-${index}` })),
    );

    await createImportPreviewToken({ actorId: "admin-1", entityType: "deals", items, summary });

    expect(mocks.findMany).toHaveBeenCalledWith({
      where: { expiresAt: { lte: expect.any(Date) } },
      select: { id: true },
      orderBy: { expiresAt: "asc" },
      take: 500,
    });
    expect(mocks.deleteMany).toHaveBeenCalledOnce();
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: Array.from({ length: 500 }, (_, index) => `expired-${index}`) },
        expiresAt: { lte: expect.any(Date) },
      },
    });
    expect(mocks.deleteMany.mock.calls[0]?.[0]).not.toHaveProperty("data");
    expect(consoleLog).not.toHaveBeenCalled();
    expect(consoleInfo).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();

    consoleLog.mockRestore();
    consoleInfo.mockRestore();
    consoleWarn.mockRestore();
    consoleError.mockRestore();
  });

  it("does not issue a deletion when there are no expired previews", async () => {
    await createImportPreviewToken({ actorId: "admin-1", entityType: "deals", items, summary });

    expect(mocks.findMany).toHaveBeenCalledOnce();
    expect(mocks.deleteMany).not.toHaveBeenCalled();
  });

  it("atomically consumes through the caller's transaction client", async () => {
    const transactionUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
    const transactionClient = {
      importPreview: { updateMany: transactionUpdateMany },
    };
    const token = await createImportPreviewToken({ actorId: "admin-1", entityType: "deals", items, summary });

    await consumeImportPreviewToken(
      { token, actorId: "admin-1", entityType: "deals", items, summary },
      transactionClient as never,
    );

    expect(transactionUpdateMany).toHaveBeenCalledOnce();
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("rejects changed payloads, summaries, actors, and consumed tokens", async () => {
    const token = await createImportPreviewToken({ actorId: "admin-1", entityType: "deals", items, summary });
    await expect(consumeImportPreviewToken({
      token,
      actorId: "admin-1",
      entityType: "deals",
      items: [{ ...items[0], target: "Changed" }],
      summary,
    })).rejects.toBeInstanceOf(ImportPreviewTokenError);
    await expect(consumeImportPreviewToken({
      token,
      actorId: "other-admin",
      entityType: "deals",
      items,
      summary,
    })).rejects.toBeInstanceOf(ImportPreviewTokenError);

    mocks.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(consumeImportPreviewToken({ token, actorId: "admin-1", entityType: "deals", items, summary }))
      .rejects.toBeInstanceOf(ImportPreviewTokenError);
  });
});
