"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { assertMutationDatabaseTargetFromEnv } from "@/lib/database-target";
import { withImportTransaction } from "@/lib/prisma-transaction";
import { isAuthorizationError, requireAdminIdentity } from "@/modules/auth/guards";
import { applyReviewedDealLifecycle } from "./mutations";

export async function applyNewsDealLifecycle(revisionId: string) {
  try {
    const actor = await requireAdminIdentity();
    if (process.env.NEWS_DEAL_MUTATIONS_ENABLED !== "true") {
      return { ok: false, error: "Deal changes are in preview mode." };
    }
    assertMutationDatabaseTargetFromEnv();
    const id = z.string().min(1).max(180).parse(revisionId);
    await withImportTransaction((tx) => applyReviewedDealLifecycle(tx, { revisionId: id, actorId: actor.id }));
    revalidateTag(CACHE_TAGS.deals);
    revalidateTag(CACHE_TAGS.news);
    revalidatePath("/admin/news-evidence");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: isAuthorizationError(error) ? "Forbidden"
        : error instanceof Error ? error.message : "The deal update failed.",
    };
  }
}
