"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionIdentity, isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
import { recordAuditEvent } from "@/modules/operations/audit";
import type { DashboardSignalReviewStatus } from "@/generated/prisma/client";
import { dashboardSignalContentHash } from "@/modules/dashboard/content-hash";
import { AdminActionUserError, adminActionErrorMessage } from "@/modules/admin/action-error";
import { changedFieldSummary } from "@/modules/admin/change-summary";
import { dashboardSignalNeedsReview } from "@/modules/dashboard/review-queue";

type ReviewActionResult = { success: boolean; error?: string };
const STALE_REVIEW_ERROR =
  "This signal changed during review. Refresh the review queue before trying again.";
const REVIEW_NOT_REQUIRED_ERROR =
  "This signal is already current and no longer requires review. Refresh the review queue.";

function isSerializableWriteConflict(error: unknown): boolean {
  return Boolean(
    error
    && typeof error === "object"
    && "code" in error
    && (error as { code?: unknown }).code === "P2034",
  );
}

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
          updatedAt: true,
          reviewStatus: true,
          reviewedAt: true,
          reviewedById: true,
          contentHash: true,
          reviewedContentHash: true,
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
      if (!dashboardSignalNeedsReview(signal)) {
        throw new AdminActionUserError(REVIEW_NOT_REQUIRED_ERROR);
      }
      const currentContentHash = dashboardSignalContentHash(signal);
      if (currentContentHash !== renderedContentHash) {
        throw new AdminActionUserError(
          "This signal changed after it was rendered. Refresh the review queue before reviewing it.",
        );
      }

      const reviewedAt = new Date();
      const beforeReview = {
        reviewStatus: signal.reviewStatus,
        reviewedAt: signal.reviewedAt,
        reviewedById: signal.reviewedById,
        contentHash: signal.contentHash,
        reviewedContentHash: signal.reviewedContentHash,
      };
      const afterReview = {
        reviewStatus,
        reviewedAt,
        reviewedById: identity.id,
        contentHash: currentContentHash,
        reviewedContentHash: currentContentHash,
      };
      const updated = await tx.dashboardSignal.updateMany({
        where: {
          id,
          updatedAt: signal.updatedAt,
          reviewStatus: signal.reviewStatus,
          reviewedAt: signal.reviewedAt,
          reviewedById: signal.reviewedById,
          contentHash: signal.contentHash,
          reviewedContentHash: signal.reviewedContentHash,
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
          reviewedAt,
          reviewedById: identity.id,
          contentHash: currentContentHash,
          reviewedContentHash: currentContentHash,
        },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError(STALE_REVIEW_ERROR);
      }
      await recordAuditEvent({
        actorId: identity.id,
        entityType: "DashboardSignal",
        entityId: id,
        action: reviewStatus,
        changes: {
          changedFields: changedFieldSummary(beforeReview, afterReview),
          before: { reviewStatus: signal.reviewStatus, contentHash: signal.contentHash },
          after: { reviewStatus, contentHash: currentContentHash },
        },
        metadata: {
          sourceId: signal.sourceId,
          signalKey: signal.signalKey,
          reviewedContentHash: currentContentHash,
        },
      }, tx);
    }, { isolationLevel: "Serializable" });

    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/dashboard-signals");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: isAuthorizationError(error)
        ? "Forbidden"
        : isSerializableWriteConflict(error)
          ? STALE_REVIEW_ERROR
          : adminActionErrorMessage(error, "Dashboard signal review failed."),
    };
  }
}
