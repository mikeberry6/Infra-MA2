// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  actor: vi.fn(), review: vi.fn(), tag: vi.fn(), path: vi.fn(), enabled: vi.fn(),
}));

vi.mock("@/modules/auth/guards", () => ({
  requireAdminIdentity: mocks.actor,
  isAuthorizationError: (error: Error) => error.message === "Unauthorized",
}));
vi.mock("@/modules/news-evidence/feature", () => ({ newsEvidenceEnabled: mocks.enabled }));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/prisma-transaction", () => ({}));
vi.mock("@/modules/news-evidence/review", async (load) => ({
  ...await load<typeof import("@/modules/news-evidence/review")>(),
  reviewNewsDraft: mocks.review,
}));
vi.mock("next/cache", () => ({ revalidateTag: mocks.tag, revalidatePath: mocks.path }));

import { reviewNews } from "./actions";

const approval = {
  action: "approve", revisionId: "draft-1", expectedApprovedRevisionId: null,
  evidenceReviewed: true, correction: false, distinctFromLegacy: false,
} as const;

describe("news evidence review action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.actor.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mocks.review.mockResolvedValue({ revisionId: "draft-1" });
    mocks.enabled.mockReturnValue(true);
  });

  it("requires the current admin identity before accessing evidence or review state", async () => {
    mocks.actor.mockRejectedValueOnce(new Error("Unauthorized"));
    expect(await reviewNews(approval)).toEqual({ error: "Forbidden" });
    expect(mocks.review).not.toHaveBeenCalled();
  });

  it("rejects invalid and disabled requests before opening a transaction", async () => {
    expect(await reviewNews({ ...approval, revisionId: "" })).toHaveProperty("error");
    mocks.enabled.mockReturnValue(false);
    expect(await reviewNews(approval)).toEqual({ error: "News review is disabled." });
    expect(mocks.review).not.toHaveBeenCalled();
  });

  it("invalidates the public cache only for a successful approval", async () => {
    await reviewNews({ ...approval, action: "reject", reason: "Already covered." });
    expect(mocks.tag).not.toHaveBeenCalled();
    expect(await reviewNews(approval)).toEqual({ revisionId: "draft-1" });
    expect(mocks.review).toHaveBeenLastCalledWith("admin-1", approval);
    expect(mocks.tag).toHaveBeenCalledExactlyOnceWith("news");
    expect(mocks.path).toHaveBeenCalledWith("/news");
  });
});
