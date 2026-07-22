import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getSessionIdentity: vi.fn(),
  transaction: vi.fn(),
  findUnique: vi.fn(),
  updateMany: vi.fn(),
  recordAuditEvent: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/modules/auth/guards", () => ({
  requireAdmin: mocks.requireAdmin,
  getSessionIdentity: mocks.getSessionIdentity,
  isAuthorizationError: () => false,
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
  reviewStatus: "PENDING",
  contentHash: "",
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
  });

  it("binds approval to the content hash that the administrator rendered", async () => {
    await expect(approveDashboardSignal("signal-1", renderedHash)).resolves.toEqual({ success: true });

    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: {
        id: "signal-1",
        contentHash: "",
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

  it("fails the optimistic compare-and-set when content changes during review", async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });

    const result = await approveDashboardSignal("signal-1", renderedHash);

    expect(result.success).toBe(false);
    expect(result.error).toContain("changed during review");
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
  });
});
