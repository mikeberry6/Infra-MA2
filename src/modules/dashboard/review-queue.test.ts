import { describe, expect, it } from "vitest";
import type { Prisma } from "@/generated/prisma/client";
import {
  DASHBOARD_SIGNAL_REVIEW_PAGE_SIZE,
  dashboardSignalNeedsReview,
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

  it.each([
    ["pending", { reviewStatus: "PENDING", contentHash: "current", reviewedContentHash: "current" }, true],
    ["never reviewed", { reviewStatus: "APPROVED", contentHash: "current", reviewedContentHash: null }, true],
    ["approved stale content", { reviewStatus: "APPROVED", contentHash: "current", reviewedContentHash: "old" }, true],
    ["rejected stale content", { reviewStatus: "REJECTED", contentHash: "current", reviewedContentHash: "old" }, true],
    ["approved current content", { reviewStatus: "APPROVED", contentHash: "current", reviewedContentHash: "current" }, false],
    ["rejected current content", { reviewStatus: "REJECTED", contentHash: "current", reviewedContentHash: "current" }, false],
  ])("classifies %s with the same runtime eligibility contract", (_label, signal, expected) => {
    expect(dashboardSignalNeedsReview(signal)).toBe(expected);
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
      totalPages: Math.ceil(125 / DASHBOARD_SIGNAL_REVIEW_PAGE_SIZE),
      skip: DASHBOARD_SIGNAL_REVIEW_PAGE_SIZE,
      take: DASHBOARD_SIGNAL_REVIEW_PAGE_SIZE,
    });
    expect(dashboardSignalReviewPagination("999", 125).page).toBe(
      Math.ceil(125 / DASHBOARD_SIGNAL_REVIEW_PAGE_SIZE),
    );
    expect(dashboardSignalReviewPagination("-1", 125).page).toBe(1);
  });
});
