import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
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
const summary = { total: 1, valid: 1, creates: 1, updates: 0, quarantined: 0, errors: 0 };

describe("import preview tokens", () => {
  beforeEach(() => {
    vi.stubEnv("NEXTAUTH_SECRET", "test-secret-that-is-at-least-thirty-two-characters");
    mocks.create.mockReset().mockResolvedValue({});
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
