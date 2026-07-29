import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ImportTransactionClient } from "@/lib/prisma-transaction";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  findMany: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    importPreview: {
      create: mocks.create,
      findMany: mocks.findMany,
      deleteMany: mocks.deleteMany,
    },
  },
}));

vi.mock("@/lib/prisma-transaction", () => ({
  withImportTransaction: vi.fn(async (
    work: (tx: unknown) => Promise<unknown>,
  ) => work({
    importPreview: {
      create: mocks.create,
    },
  })),
}));

import {
  cleanupStoredImportPreviews,
  createStoredImportPreview,
  hashImportPayload,
  hashImportPreviewState,
  ImportPreviewError,
  lockStoredImportPreview,
  markStoredImportPreviewCommitted,
} from "./preview-store";

const NOW = new Date("2026-07-29T16:00:00.000Z");
const PAYLOAD = [{ id: "DEAL-1", target: "Digital platform" }];
const REPORT = {
  rows: [{ row: 2, action: "create", messages: [] }],
};
const SUMMARY = {
  total: 1,
  valid: 1,
  creates: 1,
  updates: 0,
  quarantined: 0,
  errors: 0,
};
const STATE_HASH = hashImportPreviewState({
  records: [{ id: "DEAL-1", status: null }],
});

function transaction(
  queryRaw: ReturnType<typeof vi.fn>,
  updateMany = vi.fn(),
): ImportTransactionClient {
  return {
    $queryRaw: queryRaw,
    importPreview: { updateMany },
  } as unknown as ImportTransactionClient;
}

function storedRow(overrides: Record<string, unknown> = {}) {
  const data = mocks.create.mock.calls.at(-1)?.[0].data;
  return {
    id: data.id,
    tokenHash: data.tokenHash,
    actorId: data.actorId,
    entityType: data.entityType,
    payloadHash: data.payloadHash,
    summary: data.summary,
    expiresAt: data.expiresAt,
    consumedAt: null,
    payload: data.payload,
    report: data.report,
    stateHash: data.stateHash,
    fileName: data.fileName,
    committedAt: null,
    auditEventId: null,
    result: null,
    ...overrides,
  };
}

describe("durable import preview storage", () => {
  beforeEach(() => {
    vi.stubEnv(
      "NEXTAUTH_SECRET",
      "test-import-preview-secret-that-is-at-least-32-characters",
    );
    mocks.create.mockReset().mockResolvedValue({});
    mocks.findMany.mockReset().mockResolvedValue([]);
    mocks.deleteMany.mockReset().mockResolvedValue({ count: 0 });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hashes semantically identical object keys canonically", () => {
    expect(hashImportPayload([{ a: 1, b: 2 }])).toBe(
      hashImportPayload([{ b: 2, a: 1 }]),
    );
    expect(hashImportPreviewState({ z: [2, 1], a: true })).toBe(
      hashImportPreviewState({ a: true, z: [2, 1] }),
    );
  });

  it("stores the authoritative payload, report, summary, and a 15-minute token", async () => {
    const preview = await createStoredImportPreview({
      actorId: "admin-1",
      entityType: "deals",
      fileName: "../imports/deals.csv",
      payload: PAYLOAD,
      report: REPORT,
      summary: SUMMARY,
      stateHash: STATE_HASH,
      now: NOW,
    });

    expect(preview.expiresAt).toEqual(
      new Date(NOW.getTime() + 15 * 60 * 1000),
    );
    expect(preview.token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/);
    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "admin-1",
        entityType: "deals",
        fileName: "deals.csv",
        payload: PAYLOAD,
        report: REPORT,
        summary: SUMMARY,
        stateHash: STATE_HASH,
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    });
  });

  it("rejects token tampering and a different actor before querying storage", async () => {
    const preview = await createStoredImportPreview({
      actorId: "admin-1",
      entityType: "deals",
      payload: PAYLOAD,
      report: REPORT,
      summary: SUMMARY,
      stateHash: STATE_HASH,
      now: NOW,
    });
    const queryRaw = vi.fn();
    const tx = transaction(queryRaw);

    await expect(lockStoredImportPreview(tx, {
      token: `${preview.token.slice(0, -1)}x`,
      actorId: "admin-1",
      entityType: "deals",
      now: NOW,
    })).rejects.toBeInstanceOf(ImportPreviewError);
    await expect(lockStoredImportPreview(tx, {
      token: preview.token,
      actorId: "admin-2",
      entityType: "deals",
      now: NOW,
    })).rejects.toBeInstanceOf(ImportPreviewError);
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("locks and returns only the server-stored authoritative preview", async () => {
    const preview = await createStoredImportPreview({
      actorId: "admin-1",
      entityType: "deals",
      payload: PAYLOAD,
      report: REPORT,
      summary: SUMMARY,
      stateHash: STATE_HASH,
      now: NOW,
    });
    const queryRaw = vi.fn().mockResolvedValue([storedRow()]);

    const locked = await lockStoredImportPreview(transaction(queryRaw), {
      token: preview.token,
      actorId: "admin-1",
      entityType: "deals",
      now: NOW,
    });

    expect(queryRaw).toHaveBeenCalledOnce();
    const query = queryRaw.mock.calls[0][0].join("?");
    expect(query).toContain(`"expiresAt" AT TIME ZONE 'UTC' AS "expiresAt"`);
    expect(query).toContain(`"consumedAt" AT TIME ZONE 'UTC' AS "consumedAt"`);
    expect(query).toContain(`"committedAt" AT TIME ZONE 'UTC' AS "committedAt"`);
    expect(locked).toMatchObject({
      id: preview.id,
      payload: PAYLOAD,
      report: REPORT,
      summary: SUMMARY,
      stateHash: STATE_HASH,
      committedReceipt: null,
    });
  });

  it("rejects a stored payload that no longer matches the signed hash", async () => {
    const preview = await createStoredImportPreview({
      actorId: "admin-1",
      entityType: "deals",
      payload: PAYLOAD,
      report: REPORT,
      summary: SUMMARY,
      stateHash: STATE_HASH,
      now: NOW,
    });

    await expect(lockStoredImportPreview(
      transaction(vi.fn().mockResolvedValue([storedRow({
        payload: [{ id: "DEAL-1", target: "Changed after preview" }],
      })])),
      {
        token: preview.token,
        actorId: "admin-1",
        entityType: "deals",
        now: NOW,
      },
    )).rejects.toBeInstanceOf(ImportPreviewError);
  });

  it("rejects an expired uncommitted preview but returns a committed receipt idempotently", async () => {
    const preview = await createStoredImportPreview({
      actorId: "admin-1",
      entityType: "deals",
      payload: PAYLOAD,
      report: REPORT,
      summary: SUMMARY,
      stateHash: STATE_HASH,
      now: NOW,
    });
    const afterExpiry = new Date(preview.expiresAt.getTime() + 1);

    await expect(lockStoredImportPreview(
      transaction(vi.fn().mockResolvedValue([storedRow()])),
      {
        token: preview.token,
        actorId: "admin-1",
        entityType: "deals",
        now: afterExpiry,
      },
    )).rejects.toBeInstanceOf(ImportPreviewError);

    const committedAt = new Date("2026-07-29T16:05:00.000Z");
    const locked = await lockStoredImportPreview(
      transaction(vi.fn().mockResolvedValue([storedRow({
        consumedAt: committedAt,
        committedAt,
        auditEventId: "audit-1",
        result: { created: 1, updated: 0 },
        payload: null,
        report: null,
        fileName: null,
      })])),
      {
        token: preview.token,
        actorId: "admin-1",
        entityType: "deals",
        now: afterExpiry,
      },
    );
    expect(locked.committedReceipt).toEqual({
      previewId: preview.id,
      committedAt,
      auditEventId: "audit-1",
      result: { created: 1, updated: 0 },
    });
  });

  it("marks a locked preview only after the surrounding transaction succeeds", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const tx = transaction(vi.fn(), updateMany);
    const committedAt = new Date("2026-07-29T16:04:00.000Z");

    const receipt = await markStoredImportPreviewCommitted(tx, {
      id: "preview-1",
      auditEventId: "audit-1",
      result: { created: 1 },
      committedAt,
    });

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "preview-1", committedAt: null },
      data: {
        consumedAt: committedAt,
        committedAt,
        auditEventId: "audit-1",
        result: { created: 1 },
        payload: expect.anything(),
        report: expect.anything(),
        fileName: null,
      },
    });
    expect(receipt).toEqual({
      previewId: "preview-1",
      committedAt,
      auditEventId: "audit-1",
      result: { created: 1 },
    });
  });

  it("bounds opportunistic cleanup and deletes only selected stale IDs", async () => {
    const client = {
      importPreview: {
        findMany: vi.fn().mockResolvedValue([{ id: "old-1" }, { id: "old-2" }]),
        deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
    };

    const deleted = await cleanupStoredImportPreviews({
      client: client as never,
      now: NOW,
      limit: 5_000,
    });

    expect(client.importPreview.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { expiresAt: "asc" },
        take: 500,
      }),
    );
    expect(client.importPreview.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["old-1", "old-2"] } },
    });
    expect(deleted).toBe(2);
  });
});
