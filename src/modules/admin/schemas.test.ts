import { describe, expect, it } from "vitest";
import { companySchema, dealSchema, fundSchema } from "@/modules/admin/schemas";

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

describe("public URL validation", () => {
  const validFund = {
    managerName: "Manager",
    fundName: "Fund I",
    size: "TBD",
    vintage: "2026",
    strategies: ["Core" as const],
    structure: "Closed-End" as const,
    status: "Raising" as const,
    sectors: [],
    regions: [],
  };
  const validCompany = {
    name: "GridCo",
    country: "United States",
    sector: "Utilities" as const,
    region: "North America" as const,
  };

  it.each(["javascript:alert(1)", "data:text/html,unsafe", "ftp://example.com/source"])(
    "rejects a non-HTTP source scheme: %s",
    (sourceUrl) => {
      expect(dealSchema.safeParse({ ...validDeal, sourceUrl }).success).toBe(false);
      expect(fundSchema.safeParse({ ...validFund, primarySourceUrl: sourceUrl }).success).toBe(false);
      expect(companySchema.safeParse({ ...validCompany, website: sourceUrl }).success).toBe(false);
    },
  );

  it("accepts absolute HTTP(S) sources and rejects credential-bearing links", () => {
    expect(fundSchema.safeParse({
      ...validFund,
      primarySourceUrl: "https://example.com/fund",
      sourceUrls: ["http://filings.example.com/fund"],
    }).success).toBe(true);
    expect(fundSchema.safeParse({
      ...validFund,
      primarySourceUrl: "https://user:secret@example.com/fund",
    }).success).toBe(false);
  });

  it("trims accepted URLs before they cross the persistence boundary", () => {
    expect(fundSchema.parse({
      ...validFund,
      primarySourceUrl: "  https://example.com/fund-primary  ",
      sourceUrls: [" https://example.com/fund-supporting "],
      strategyUrl: " https://example.com/fund-strategy ",
    })).toMatchObject({
      primarySourceUrl: "https://example.com/fund-primary",
      sourceUrls: ["https://example.com/fund-supporting"],
      strategyUrl: "https://example.com/fund-strategy",
    });
    expect(dealSchema.parse({
      ...validDeal,
      sourceUrl: " https://example.com/deal ",
    }).sourceUrl).toBe("https://example.com/deal");
    expect(companySchema.parse({
      ...validCompany,
      website: " https://example.com/company ",
    }).website).toBe("https://example.com/company");
  });
});
