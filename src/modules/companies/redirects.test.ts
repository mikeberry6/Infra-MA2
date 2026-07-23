import { describe, expect, it, vi } from "vitest";
import { rehomeCompanyRedirects } from "@/modules/companies/redirects";

describe("canonical company redirect preservation", () => {
  it("re-homes older redirects before recording the newly retired ID", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 2 });
    const upsert = vi.fn().mockResolvedValue({ retiredId: "retired-now" });

    await rehomeCompanyRedirects({ companyRedirect: { updateMany, upsert } } as never, "retired-now", "canonical");

    expect(updateMany).toHaveBeenCalledWith({
      where: { companyId: "retired-now" },
      data: { companyId: "canonical" },
    });
    expect(upsert).toHaveBeenCalledWith({
      where: { retiredId: "retired-now" },
      create: { retiredId: "retired-now", companyId: "canonical" },
      update: { companyId: "canonical", reason: "CANONICAL_MERGE" },
    });
    expect(updateMany.mock.invocationCallOrder[0]).toBeLessThan(upsert.mock.invocationCallOrder[0]);
  });
});
