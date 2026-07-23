import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}));

import { CACHE_TAGS } from "@/lib/cache-tags";
import { revalidateAppData } from "@/lib/revalidation";

describe("application cache invalidation", () => {
  it("invalidates every data tag and all public and administrative consumers", () => {
    revalidateAppData();

    expect(mocks.revalidateTag.mock.calls.map(([tag]) => tag).sort()).toEqual(
      Object.values(CACHE_TAGS).sort(),
    );
    expect(mocks.revalidatePath.mock.calls.map(([path]) => path)).toEqual(expect.arrayContaining([
      "/",
      "/tracker",
      "/funds",
      "/portfolio",
      "/news",
      "/search",
      "/dashboard",
      "/admin",
      "/admin/deals",
      "/admin/funds",
      "/admin/companies",
      "/admin/dashboard-signals",
    ]));
  });
});
