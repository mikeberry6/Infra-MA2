import type { Prisma } from "@/generated/prisma/client";

export const DASHBOARD_SIGNAL_REVIEW_PAGE_SIZE = 25;

export interface DashboardSignalReviewEligibility {
  reviewStatus: string;
  contentHash: string;
  reviewedContentHash: string | null;
}

const DASHBOARD_SIGNAL_REVIEW_REASONS = [
  "pending",
  "missing-reviewed-hash",
  "stale-reviewed-hash",
] as const;
type DashboardSignalReviewReason = typeof DASHBOARD_SIGNAL_REVIEW_REASONS[number];

function reviewReasonMatches(
  reason: DashboardSignalReviewReason,
  signal: DashboardSignalReviewEligibility,
): boolean {
  if (reason === "pending") return signal.reviewStatus === "PENDING";
  if (reason === "missing-reviewed-hash") return signal.reviewedContentHash === null;
  return signal.reviewedContentHash !== signal.contentHash;
}

function reviewReasonWhere(
  reason: DashboardSignalReviewReason,
  contentHashField: Prisma.StringFieldRefInput<"DashboardSignal">,
): Prisma.DashboardSignalWhereInput {
  if (reason === "pending") return { reviewStatus: "PENDING" };
  if (reason === "missing-reviewed-hash") return { reviewedContentHash: null };
  return { NOT: { reviewedContentHash: { equals: contentHashField } } };
}

/**
 * Server actions and database queue queries both derive from the same ordered
 * eligibility reasons: pending, never reviewed, or changed since review.
 */
export function dashboardSignalNeedsReview(
  signal: DashboardSignalReviewEligibility,
): boolean {
  return DASHBOARD_SIGNAL_REVIEW_REASONS.some((reason) =>
    reviewReasonMatches(reason, signal));
}

export function dashboardSignalReviewQueueWhere(
  contentHashField: Prisma.StringFieldRefInput<"DashboardSignal">,
): Prisma.DashboardSignalWhereInput {
  return {
    OR: DASHBOARD_SIGNAL_REVIEW_REASONS.map((reason) =>
      reviewReasonWhere(reason, contentHashField)),
  };
}

export function dashboardSignalReviewPagination(
  rawPage: string | undefined,
  total: number,
): { page: number; totalPages: number; skip: number; take: number } {
  const requestedPage = positiveInteger(rawPage);
  const totalPages = Math.max(1, Math.ceil(Math.max(0, total) / DASHBOARD_SIGNAL_REVIEW_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  return {
    page,
    totalPages,
    skip: (page - 1) * DASHBOARD_SIGNAL_REVIEW_PAGE_SIZE,
    take: DASHBOARD_SIGNAL_REVIEW_PAGE_SIZE,
  };
}

function positiveInteger(value?: string): number {
  if (!value || !/^\d+$/.test(value)) return 1;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}
