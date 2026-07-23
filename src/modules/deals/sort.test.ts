import { describe, expect, it } from "vitest";
import type { DealView } from "@/modules/shared/types";
import {
  clampDealPage,
  defaultDirectionForDealSort,
  parseDealPage,
  parseDealSortDirection,
  parseDealSortField,
  sortDeals,
} from "./sort";

function deal(
  legacyId: string,
  target: string,
  date: string,
  overrides: Partial<DealView> = {},
): DealView {
  return {
    id: legacyId,
    legacyId,
    title: target,
    target,
    buyer: "Buyer",
    seller: "Seller",
    sector: "Digital",
    subsector: "Data Centers",
    region: "North America",
    category: ["Acquisition (Buyout)"],
    date,
    description: "Description",
    targetDescription: "Target description",
    sourceName: "Source",
    sourceUrl: "https://example.com",
    enterpriseValue: null,
    equityValue: null,
    stake: null,
    status: "Announced",
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    country: "United States",
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: null,
    ...overrides,
  };
}

describe("deal URL sorting", () => {
  it("normalizes unsupported sort and direction values", () => {
    expect(parseDealSortField("target")).toBe("target");
    expect(parseDealSortField("unsupported")).toBe("date");
    expect(parseDealSortDirection("asc")).toBe("asc");
    expect(parseDealSortDirection("sideways")).toBe("desc");
  });

  it("uses descending dates and ascending text as field defaults", () => {
    expect(defaultDirectionForDealSort("date")).toBe("desc");
    expect(defaultDirectionForDealSort("target")).toBe("asc");
  });

  it("sorts without mutating the source array", () => {
    const source = [
      deal("DEAL-2", "Zulu", "2026-01-01"),
      deal("DEAL-1", "Alpha", "2026-02-01"),
    ];

    expect(sortDeals(source, "date", "desc").map((item) => item.legacyId)).toEqual([
      "DEAL-1",
      "DEAL-2",
    ]);
    expect(sortDeals(source, "target", "asc").map((item) => item.target)).toEqual([
      "Alpha",
      "Zulu",
    ]);
    expect(source.map((item) => item.legacyId)).toEqual(["DEAL-2", "DEAL-1"]);
  });

  it("supports the remaining public table fields", () => {
    const source = [
      deal("DEAL-2", "B", "2026-01-01", {
        buyer: "Zulu",
        sector: "Utilities",
        region: "Europe",
        category: ["Sale (Buyout)"],
      }),
      deal("DEAL-1", "A", "2026-01-01", {
        buyer: "Alpha",
        sector: "Digital",
        region: "Asia-Pacific",
        category: ["Acquisition (Buyout)"],
      }),
    ];

    expect(sortDeals(source, "buyer", "asc")[0].legacyId).toBe("DEAL-1");
    expect(sortDeals(source, "sector", "asc")[0].legacyId).toBe("DEAL-1");
    expect(sortDeals(source, "region", "asc")[0].legacyId).toBe("DEAL-1");
    expect(sortDeals(source, "category", "asc")[0].legacyId).toBe("DEAL-1");
  });
});

describe("deal URL pagination", () => {
  it("accepts only positive safe integers", () => {
    expect(parseDealPage("4")).toBe(4);
    expect(parseDealPage("0")).toBe(1);
    expect(parseDealPage("2.5")).toBe(1);
    expect(parseDealPage("not-a-page")).toBe(1);
  });

  it("clamps the page against the 25-record page size", () => {
    expect(clampDealPage(9, 51)).toBe(3);
    expect(clampDealPage(2, 0)).toBe(1);
  });
});
