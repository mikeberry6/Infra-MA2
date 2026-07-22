import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

export function revalidateAppData() {
  Object.values(CACHE_TAGS).forEach((tag) => revalidateTag(tag));

  revalidatePath("/");
  revalidatePath("/tracker");
  revalidatePath("/funds");
  revalidatePath("/portfolio");
  revalidatePath("/news");
  revalidatePath("/search");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/admin/deals");
  revalidatePath("/admin/funds");
  revalidatePath("/admin/companies");
  revalidatePath("/admin/dashboard-signals");
}
