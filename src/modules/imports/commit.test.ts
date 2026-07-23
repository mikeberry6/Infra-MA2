import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  recordAuditEvent: vi.fn(),
  startPipelineRun: vi.fn(),
  completePipelineRun: vi.fn(),
  failPipelineRun: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { $transaction: mocks.transaction },
}));
vi.mock("@/modules/operations/audit", () => ({
  recordAuditEvent: mocks.recordAuditEvent,
}));
vi.mock("@/modules/operations/pipeline-runs", () => ({
  startPipelineRun: mocks.startPipelineRun,
  completePipelineRun: mocks.completePipelineRun,
  failPipelineRun: mocks.failPipelineRun,
}));

import { commitImport, sanitizeImportError } from "@/modules/imports/commit";

describe("atomic import commits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.startPipelineRun.mockResolvedValue("pipeline-run-1");
    mocks.recordAuditEvent.mockResolvedValue("audit-event-1");
    mocks.completePipelineRun.mockResolvedValue(undefined);
    mocks.failPipelineRun.mockResolvedValue(undefined);
  });

  it("commits imported rows, their audit, and successful run state in one transaction", async () => {
    const tx = { deal: { create: vi.fn().mockResolvedValue({ id: "deal-1" }) } };
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );

    await expect(commitImport({
      pipeline: "DEAL_IMPORT",
      entityType: "Deal",
      rowCount: 1,
      execute: async (client) => {
        await client.deal.create({ data: {} as never });
        return {
          value: { imported: 1 },
          counts: { inserted: 1, updated: 0, skipped: 0 },
          auditChanges: { changedFields: ["rows"] },
        };
      },
    })).resolves.toEqual({
      value: { imported: 1 },
      auditEventId: "audit-event-1",
      pipelineRunId: "pipeline-run-1",
    });

    expect(mocks.startPipelineRun).toHaveBeenCalledWith(
      expect.anything(),
      "DEAL_IMPORT",
      { rowCount: 1 },
    );
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      entityType: "Deal",
      action: "BULK_IMPORT",
    }), tx);
    expect(mocks.completePipelineRun).toHaveBeenCalledWith(
      tx,
      "pipeline-run-1",
      { inserted: 1, updated: 0, skipped: 0 },
      { auditEventId: "audit-event-1" },
    );
    expect(mocks.recordAuditEvent.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.completePipelineRun.mock.invocationCallOrder[0],
    );
    expect(mocks.failPipelineRun).not.toHaveBeenCalled();
    expect(mocks.transaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ isolationLevel: "Serializable" }),
    );
  });

  it("retries a bounded serializable conflict without duplicating the pipeline run", async () => {
    const tx = {};
    const conflict = Object.assign(new Error("write conflict"), { code: "P2034" });
    mocks.transaction
      .mockRejectedValueOnce(conflict)
      .mockImplementationOnce(async (callback: (client: typeof tx) => unknown) => callback(tx));

    await expect(commitImport({
      pipeline: "COMPANY_IMPORT",
      entityType: "Company",
      rowCount: 1,
      execute: async () => ({
        value: { imported: 1 },
        counts: { inserted: 1, updated: 0, skipped: 0 },
        auditChanges: { changedFields: ["rows"] },
      }),
    })).resolves.toMatchObject({ pipelineRunId: "pipeline-run-1" });

    expect(mocks.transaction).toHaveBeenCalledTimes(2);
    expect(mocks.startPipelineRun).toHaveBeenCalledTimes(1);
    expect(mocks.failPipelineRun).not.toHaveBeenCalled();
  });

  it("records a safe failed run after the import transaction rolls back", async () => {
    const raw = Object.assign(
      new Error("duplicate key includes private imported row"),
      { code: "P2002" },
    );
    mocks.transaction.mockRejectedValue(raw);

    await expect(commitImport({
      pipeline: "FUND_IMPORT",
      entityType: "Fund",
      rowCount: 2,
      execute: vi.fn(),
    })).rejects.toBe(raw);

    expect(mocks.completePipelineRun).not.toHaveBeenCalled();
    expect(mocks.failPipelineRun).toHaveBeenCalledWith(
      expect.anything(),
      "pipeline-run-1",
      expect.objectContaining({ message: "Import database uniqueness conflict (P2002)" }),
    );
    expect(JSON.stringify(mocks.failPipelineRun.mock.calls)).not.toContain("private imported row");
  });

  it("never returns imported contents from sanitized errors", () => {
    const message = sanitizeImportError(
      new Error("postgresql://user:secret@private/db row=Confidential Company"),
    );
    expect(message).toBe("Import commit failed");
    expect(message).not.toMatch(/secret|confidential|postgresql/i);
  });
});
