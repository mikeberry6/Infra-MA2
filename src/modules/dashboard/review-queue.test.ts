import { describe, expect, it } from "vitest";
import type { Prisma } from "@/generated/prisma/client";
import {
  DASHBOARD_SIGNAL_REVIEW_PAGE_SIZE,
  dashboardSignalReviewPagination,
  dashboardSignalReviewQueueWhere,
} from "@/modules/dashboard/review-queue";

describe("dashboard signal review queue", () => {
  it("queries pending, never-reviewed, and content-changed rows at the database boundary", () => {
    const contentHashField = { _ref: "contentHash" } as unknown as Prisma.StringFieldRefInput<"DashboardSignal">;
    expect(dashboardSignalReviewQueueWhere(contentHashField)).toEqual({
      OR: [
        { reviewStatus: "PENDING" },
        { reviewedContentHash: null },
        { NOT: { reviewedContentHash: { equals: contentHashField } } },
      ],
    });
  });

  it("bounds every request to a stable page size and clamps invalid or stale pages", () => {
    expect(dashboardSignalReviewPagination(undefined, 0)).toEqual({
      page: 1,
      totalPages: 1,
      skip: 0,
      take: DASHBOARD_SIGNAL_REVIEW_PAGE_SIZE,
    });
    expect(dashboardSignalReviewPagination("2", 125)).toEqual({
      page: 2,
      totalPages: 3,
      skip: 50,
      take: 50,
    });
    expect(dashboardSignalReviewPagination("999", 125).page).toBe(3);
    expect(dashboardSignalReviewPagination("-1", 125).page).toBe(1);
  });
});
