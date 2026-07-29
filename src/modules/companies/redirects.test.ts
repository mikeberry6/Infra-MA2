import { describe, expect, it, vi } from "vitest";
import { rehomeCompanyRedirects } from "./redirects";

describe("rehomeCompanyRedirects", () => {
  it("rehomes older redirect chains before upserting the newly retired ID", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 2 });
    const upsert = vi.fn().mockResolvedValue({
      retiredId: "retired-company",
      companyId: "canonical-company",
    });
    const tx = {
      companyRedirect: {
        updateMany,
        upsert,
      },
    };

    await rehomeCompanyRedirects(
      tx as unknown as Parameters<typeof rehomeCompanyRedirects>[0],
      "retired-company",
      "canonical-company",
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: { companyId: "retired-company" },
      data: { companyId: "canonical-company" },
    });
    expect(upsert).toHaveBeenCalledWith({
      where: { retiredId: "retired-company" },
      create: {
        retiredId: "retired-company",
        companyId: "canonical-company",
      },
      update: {
        companyId: "canonical-company",
        reason: "CANONICAL_MERGE",
      },
    });
    expect(updateMany.mock.invocationCallOrder[0]).toBeLessThan(
      upsert.mock.invocationCallOrder[0],
    );
  });
});
