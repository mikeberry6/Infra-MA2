import type { Prisma } from "@/generated/prisma/client";

export const DASHBOARD_SIGNAL_REVIEW_PAGE_SIZE = 25;

export function dashboardSignalReviewQueueWhere(
  contentHashField: Prisma.StringFieldRefInput<"DashboardSignal">,
): Prisma.DashboardSignalWhereInput {
  return {
    OR: [
      { reviewStatus: "PENDING" },
      { reviewedContentHash: null },
      { NOT: { reviewedContentHash: { equals: contentHashField } } },
    ],
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
