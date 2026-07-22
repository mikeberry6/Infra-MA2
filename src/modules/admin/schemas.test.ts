import { describe, expect, it } from "vitest";
import { dealSchema } from "@/modules/admin/schemas";

const validDeal = {
  title: "Buyer acquires Target",
  target: "Target",
  buyer: "Buyer",
  seller: "Seller",
  sector: "Digital" as const,
  region: "North America" as const,
  category: ["Acquisition (Buyout)" as const],
  date: "2026-07-22",
  description: "A reviewed infrastructure transaction.",
  country: "United States",
  status: "Announced" as const,
};

describe("deal seller-disclosure input validation", () => {
  it("keeps legacy payloads with a named seller valid", () => {
    const parsed = dealSchema.safeParse(validDeal);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.sellerDisclosureStatus).toBe("LEGACY_UNREVIEWED");
  });

  it("accepts a seller-free record only with an explicit reviewed reason", () => {
    expect(dealSchema.safeParse({
      ...validDeal,
      seller: "N/A",
      sellerDisclosureStatus: "NOT_DISCLOSED",
      sellerDisclosureReason: "The cited announcement does not identify a seller.",
    }).success).toBe(true);
  });

  it.each([
    { sellerDisclosureStatus: "LEGACY_UNREVIEWED", sellerDisclosureReason: "Legacy import" },
    { sellerDisclosureStatus: "DISCLOSED", sellerDisclosureReason: "Seller omitted" },
    { sellerDisclosureStatus: "NOT_APPLICABLE", sellerDisclosureReason: "short" },
  ])("rejects a seller-free record without reviewed treatment: $sellerDisclosureStatus", (disclosure) => {
    const parsed = dealSchema.safeParse({ ...validDeal, seller: "N/A", ...disclosure });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: ["sellerDisclosureReason"] }),
      ]));
    }
  });
});
