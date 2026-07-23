import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  AuthorizationError: class AuthorizationError extends Error {
    constructor() {
      super("Forbidden");
      this.name = "AuthorizationError";
    }
  },
  requireAdmin: vi.fn(),
  getSessionIdentity: vi.fn(),
  transaction: vi.fn(),
  findUnique: vi.fn(),
  updateMany: vi.fn(),
  recordAuditEvent: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/modules/auth/guards", () => ({
  AuthorizationError: mocks.AuthorizationError,
  requireAdmin: mocks.requireAdmin,
  getSessionIdentity: mocks.getSessionIdentity,
  isAuthorizationError: (error: unknown) => error instanceof mocks.AuthorizationError,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { $transaction: mocks.transaction },
}));
vi.mock("@/modules/operations/audit", () => ({
  recordAuditEvent: mocks.recordAuditEvent,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  approveDashboardSignal,
  rejectDashboardSignal,
} from "@/modules/dashboard/admin-actions";
import { dashboardSignalContentHash } from "@/modules/dashboard/content-hash";

const signal = {
  id: "signal-1",
  updatedAt: new Date("2026-07-23T12:00:00.000Z"),
  reviewStatus: "PENDING",
  reviewedAt: null,
  reviewedById: null,
  contentHash: "",
  reviewedContentHash: null,
  section: "policy-regulatory",
  title: "Notice 1",
  summary: "Fixture",
  direction: "needs_review",
  severity: 1,
  sourceName: "Federal Register",
  sourceUrl: "https://example.test/notice-1",
  sourceId: "federal-register",
  signalKey: "notice-1",
};
const renderedHash = dashboardSignalContentHash(signal);

describe("dashboard signal review actions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocks.requireAdmin.mockReset().mockResolvedValue(undefined);
    mocks.getSessionIdentity.mockReset().mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mocks.findUnique.mockReset().mockResolvedValue(signal);
    mocks.updateMany.mockReset().mockResolvedValue({ count: 1 });
    mocks.recordAuditEvent.mockReset().mockResolvedValue("audit-1");
    mocks.revalidatePath.mockReset();
    mocks.transaction.mockReset().mockImplementation(async (callback) => callback({
      dashboardSignal: {
        findUnique: mocks.findUnique,
        updateMany: mocks.updateMany,
      },
    }));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  it("binds approval to the content hash that the administrator rendered", async () => {
    await expect(approveDashboardSignal("signal-1", renderedHash)).resolves.toEqual({ success: true });

    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: {
        id: "signal-1",
        updatedAt: signal.updatedAt,
        reviewStatus: "PENDING",
        reviewedAt: null,
        reviewedById: null,
        contentHash: "",
        reviewedContentHash: null,
        section: signal.section,
        title: signal.title,
        summary: signal.summary,
        direction: signal.direction,
        severity: signal.severity,
        sourceName: signal.sourceName,
        sourceUrl: signal.sourceUrl,
      },
      data: expect.objectContaining({
        reviewStatus: "APPROVED",
        reviewedById: "admin-1",
        contentHash: renderedHash,
        reviewedContentHash: renderedHash,
      }),
    });
    expect(mocks.transaction).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: "Serializable" },
    );
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "APPROVED",
        metadata: expect.objectContaining({ reviewedContentHash: renderedHash }),
      }),
      expect.anything(),
    );
  });

  it("fails without a write or audit when content changed after rendering", async () => {
    mocks.findUnique.mockResolvedValue({ ...signal, title: "Revised notice" });

    const result = await rejectDashboardSignal("signal-1", renderedHash);

    expect(result).toEqual({
      success: false,
      error: "This signal changed after it was rendered. Refresh the review queue before reviewing it.",
    });
    expect(mocks.updateMany).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
  });

  it("allows an approved signal whose reviewed hash is stale to be reviewed again", async () => {
    const previouslyReviewedAt = new Date("2026-07-22T12:00:00.000Z");
    mocks.findUnique.mockResolvedValue({
      ...signal,
      reviewStatus: "APPROVED",
      reviewedAt: previouslyReviewedAt,
      reviewedById: "admin-old",
      contentHash: renderedHash,
      reviewedContentHash: "previous-content-hash",
    });

    await expect(approveDashboardSignal("signal-1", renderedHash)).resolves.toEqual({
      success: true,
    });

    expect(mocks.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: "signal-1",
        reviewStatus: "APPROVED",
        reviewedAt: previouslyReviewedAt,
        reviewedById: "admin-old",
        contentHash: renderedHash,
        reviewedContentHash: "previous-content-hash",
      }),
      data: expect.objectContaining({
        reviewStatus: "APPROVED",
        reviewedById: "admin-1",
        contentHash: renderedHash,
        reviewedContentHash: renderedHash,
      }),
    }));
    const auditInput = mocks.recordAuditEvent.mock.calls[0][0];
    expect(auditInput.changes.changedFields).toEqual([
      "reviewedAt",
      "reviewedById",
      "reviewedContentHash",
    ]);
  });

  it("rejects an approved signal whose reviewed hash is already current", async () => {
    mocks.findUnique.mockResolvedValue({
      ...signal,
      reviewStatus: "APPROVED",
      reviewedAt: new Date("2026-07-22T12:00:00.000Z"),
      reviewedById: "admin-old",
      contentHash: renderedHash,
      reviewedContentHash: renderedHash,
    });

    await expect(approveDashboardSignal("signal-1", renderedHash)).resolves.toEqual({
      success: false,
      error: "This signal is already current and no longer requires review. Refresh the review queue.",
    });
    expect(mocks.updateMany).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
  });

  it("allows only one of two reviewers holding the same stale snapshot to succeed", async () => {
    mocks.getSessionIdentity
      .mockResolvedValueOnce({ id: "admin-1", role: "ADMIN" })
      .mockResolvedValueOnce({ id: "admin-2", role: "ADMIN" });
    mocks.findUnique.mockResolvedValue({ ...signal });
    mocks.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    const [first, second] = await Promise.all([
      approveDashboardSignal("signal-1", renderedHash),
      rejectDashboardSignal("signal-1", renderedHash),
    ]);

    expect(first).toEqual({ success: true });
    expect(second).toEqual({
      success: false,
      error: "This signal changed during review. Refresh the review queue before trying again.",
    });
    expect(mocks.recordAuditEvent).toHaveBeenCalledTimes(1);
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(3);
  });

  it("omits review fields whose values did not change from the audit summary", async () => {
    mocks.findUnique.mockResolvedValue({
      ...signal,
      contentHash: renderedHash,
    });

    await expect(approveDashboardSignal("signal-1", renderedHash)).resolves.toEqual({
      success: true,
    });

    const auditInput = mocks.recordAuditEvent.mock.calls[0][0];
    expect(auditInput.changes.changedFields).toEqual([
      "reviewStatus",
      "reviewedAt",
      "reviewedById",
      "reviewedContentHash",
    ]);
    expect(auditInput.changes.changedFields).not.toContain("contentHash");
  });

  it("fails the optimistic compare-and-set when content changes during review", async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });

    const result = await approveDashboardSignal("signal-1", renderedHash);

    expect(result.success).toBe(false);
    expect(result.error).toContain("changed during review");
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
  });

  it("reports a serializable write conflict as a safe stale-review rejection", async () => {
    mocks.transaction.mockRejectedValueOnce(
      Object.assign(new Error("serialization conflict"), { code: "P2034" }),
    );

    await expect(approveDashboardSignal("signal-1", renderedHash)).resolves.toEqual({
      success: false,
      error: "This signal changed during review. Refresh the review queue before trying again.",
    });
  });

  it("does not expose unexpected database details", async () => {
    mocks.transaction.mockRejectedValueOnce(
      new Error("connection failed for postgresql://admin:secret@private-db/signals"),
    );

    await expect(approveDashboardSignal("signal-1", renderedHash)).resolves.toEqual({
      success: false,
      error: "Dashboard signal review failed.",
    });
  });

  it("logs a stale or revoked identity as one sanitized authorization failure", async () => {
    mocks.getSessionIdentity.mockResolvedValueOnce(null);

    await expect(approveDashboardSignal("signal-1", renderedHash)).resolves.toEqual({
      success: false,
      error: "Forbidden",
    });

    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(
      (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string,
    ) as Record<string, unknown>;
    expect(payload).toMatchObject({
      task: "dashboard_admin_action",
      operation: "authorize_dashboard_admin_action",
      status: 403,
      errorClassification: "authorization_error",
      errorMessage: "Operation is not authorized.",
    });
    expect(JSON.stringify(payload)).not.toContain("signal-1");
  });
});
