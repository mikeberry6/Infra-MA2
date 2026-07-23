import { describe, expect, it } from "vitest";
import type { DealView } from "@/modules/shared/types";
import { deriveFundRanking } from "./DynamicInsightsHero";

function deal(overrides: Partial<DealView>): DealView {
  return {
    id: "deal-1",
    legacyId: "DEAL-1",
    title: "Transaction announced",
    target: "Target",
    buyer: "Buyer Infrastructure",
    seller: "N/A",
    sector: "Digital",
    subsector: "Fiber",
    region: "North America",
    category: ["Acquisition (Buyout)"],
    date: "2026-07-22",
    status: "Announced",
    country: "United States",
    sourceName: "Source",
    sourceUrl: "https://example.com",
    description: "Description",
    targetDescription: "Target description",
    enterpriseValue: null,
    equityValue: null,
    stake: null,
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: null,
    ...overrides,
  };
}

describe("deriveFundRanking", () => {
  it("counts a multi-category buyer only once per deal", () => {
    const [row] = deriveFundRanking([
      deal({ category: ["Acquisition (Buyout)", "Joint Venture"] }),
    ]);

    expect(row).toEqual({
      name: "Buyer Infrastructure",
      total: 1,
      breakdown: [{ activity: "Acquisition", count: 1 }],
    });
  });

  it("deduplicates buyer aliases after canonical-name normalization", () => {
    const [row] = deriveFundRanking([
      deal({ buyer: "Greencoat Renewables / Schroders Greencoat" }),
    ]);

    expect(row).toEqual({
      name: "Schroders Greencoat",
      total: 1,
      breakdown: [{ activity: "Acquisition", count: 1 }],
    });
  });

  it("applies explicit operating-platform and renamed-parent compound policy", () => {
    const rows = deriveFundRanking([
      deal({ id: "standard-solar", buyer: "Standard Solar / Brookfield" }),
      deal({ id: "gip", buyer: "Global Infrastructure Partners / BlackRock" }),
    ]);

    expect(rows).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "Brookfield Asset Management", total: 1 }),
      expect.objectContaining({ name: "GIP", total: 1 }),
    ]));
    expect(rows.some((row) => row.name === "Standard Solar" || row.name === "BlackRock")).toBe(false);
  });

  it("preserves genuine co-sponsors as separate fund activity", () => {
    const rows = deriveFundRanking([
      deal({ buyer: "Brookfield / La Caisse" }),
    ]);

    expect(rows).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "Brookfield Asset Management", total: 1 }),
      expect.objectContaining({ name: "La Caisse de dépôt (CDPQ)", total: 1 }),
    ]));
  });

  it("counts the seller sale and buyer acquisition once on a dual-role record", () => {
    const rows = deriveFundRanking([
      deal({
        buyer: "Buyer Infrastructure",
        seller: "Seller Infrastructure",
        category: ["Sale (Buyout)", "Acquisition (Buyout)"],
      }),
    ]);

    expect(rows).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: "Buyer Infrastructure",
        total: 1,
        breakdown: [{ activity: "Acquisition", count: 1 }],
      }),
      expect.objectContaining({
        name: "Seller Infrastructure",
        total: 1,
        breakdown: [{ activity: "Sale", count: 1 }],
      }),
    ]));
  });
});
