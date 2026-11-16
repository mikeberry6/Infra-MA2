"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { isAuthorizationError, requireAdminIdentity } from "@/modules/auth/guards";
import { newsEvidenceEnabled } from "@/modules/news-evidence/feature";
import { NewsReviewConflict, newsReviewInput, reviewNewsDraft, type NewsReviewInput } from "@/modules/news-evidence/review";

export async function reviewNews(input: NewsReviewInput) {
  try {
    const identity = await requireAdminIdentity();
    if (!newsEvidenceEnabled()) return { error: "News review is disabled." };
    const parsed = newsReviewInput.safeParse(input);
    if (!parsed.success) return { error: "Check the review fields and try again." };

    const result = await reviewNewsDraft(identity.id, parsed.data);
    revalidatePath("/admin/news-evidence");
    revalidatePath(`/admin/news-evidence/${parsed.data.revisionId}`);
    if (parsed.data.action === "approve") {
      revalidateTag(CACHE_TAGS.news);
      revalidatePath("/news");
    }
    return result;
  } catch (error) {
    if (isAuthorizationError(error)) return { error: "Forbidden" };
    if (error instanceof NewsReviewConflict) return { error: error.message };
    console.error("News review failed.");
    return { error: "Review could not be saved. Reload and try again." };
  }
}
