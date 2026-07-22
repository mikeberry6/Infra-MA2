"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionIdentity, isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
import { recordAuditEvent } from "@/modules/operations/audit";
import type { DashboardSignalReviewStatus } from "@/generated/prisma/client";
import { dashboardSignalContentHash } from "@/modules/dashboard/content-hash";
import { currentServerRequestId } from "@/lib/server-request-context";
import { logServerFailure } from "@/lib/server-log";
import { AdminActionUserError, adminActionErrorMessage } from "@/modules/admin/action-error";

type ReviewActionResult = { success: boolean; error?: string };

export async function approveDashboardSignal(
  id: string,
  renderedContentHash: string,
): Promise<ReviewActionResult> {
  return reviewDashboardSignal(id, renderedContentHash, "APPROVED");
}

export async function rejectDashboardSignal(
  id: string,
  renderedContentHash: string,
): Promise<ReviewActionResult> {
  return reviewDashboardSignal(id, renderedContentHash, "REJECTED");
}

async function reviewDashboardSignal(
  id: string,
  renderedContentHash: string,
  reviewStatus: Extract<DashboardSignalReviewStatus, "APPROVED" | "REJECTED">,
): Promise<ReviewActionResult> {
  try {
    await requireAdmin();
    const identity = await getSessionIdentity();
    if (!identity) return { success: false, error: "Forbidden" };

    await prisma.$transaction(async (tx) => {
      const signal = await tx.dashboardSignal.findUnique({
        where: { id },
        select: {
          id: true,
          reviewStatus: true,
          contentHash: true,
          section: true,
          title: true,
          summary: true,
          direction: true,
          severity: true,
          sourceName: true,
          sourceUrl: true,
          sourceId: true,
          signalKey: true,
        },
      });
      if (!signal) throw new AdminActionUserError("Dashboard signal not found.");
      const currentContentHash = dashboardSignalContentHash(signal);
      if (currentContentHash !== renderedContentHash) {
        throw new AdminActionUserError(
          "This signal changed after it was rendered. Refresh the review queue before reviewing it.",
        );
      }

      const updated = await tx.dashboardSignal.updateMany({
        where: {
          id,
          contentHash: signal.contentHash,
          section: signal.section,
          title: signal.title,
          summary: signal.summary,
          direction: signal.direction,
          severity: signal.severity,
          sourceName: signal.sourceName,
          sourceUrl: signal.sourceUrl,
        },
        data: {
          reviewStatus,
          reviewedAt: new Date(),
          reviewedById: identity.id,
          contentHash: currentContentHash,
          reviewedContentHash: currentContentHash,
        },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError(
          "This signal changed during review. Refresh the review queue before trying again.",
        );
      }
      await recordAuditEvent({
        actorId: identity.id,
        entityType: "DashboardSignal",
        entityId: id,
        action: reviewStatus,
        changes: {
          changedFields: ["reviewStatus", "reviewedAt", "reviewedById", "contentHash", "reviewedContentHash"],
          before: { reviewStatus: signal.reviewStatus, contentHash: signal.contentHash },
          after: { reviewStatus, contentHash: currentContentHash },
        },
        metadata: {
          sourceId: signal.sourceId,
          signalKey: signal.signalKey,
          reviewedContentHash: currentContentHash,
        },
      }, tx);
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/dashboard-signals");
    return { success: true };
  } catch (error) {
    if (!isAuthorizationError(error)) {
      const requestId = await currentServerRequestId();
      logServerFailure({
        task: "dashboard_admin_action",
        operation: "review_dashboard_signal",
        requestId,
      }, error);
    }
    return {
      success: false,
      error: isAuthorizationError(error)
        ? "Forbidden"
        : adminActionErrorMessage(error, "Dashboard signal review failed."),
    };
  }
}
