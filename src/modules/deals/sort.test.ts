import { describe, expect, it } from "vitest";
import type { DealListItem } from "@/modules/shared/types";
import { parseDealSortField, sortDeals } from "./sort";

function deal(overrides: Partial<DealListItem> & Pick<DealListItem, "legacyId" | "target">): DealListItem {
  const { legacyId, target, ...rest } = overrides;
  return {
    id: legacyId,
    legacyId,
    title: target,
    target,
    buyer: "Buyer",
    seller: "Seller",
    sector: "Digital",
    subsector: "Fiber",
    region: "North America",
    category: ["Acquisition (Buyout)"],
    date: "2026-07-01T00:00:00.000Z",
    status: "Announced",
    country: "United States",
    sourceName: "Source",
    sourceUrl: "https://example.test",
    ...rest,
  };
}

describe("deal URL sorting", () => {
  const deals = [
    deal({ legacyId: "DEAL-2", target: "Zulu Grid", buyer: "Alpha", date: "2026-06-01T00:00:00.000Z" }),
    deal({ legacyId: "DEAL-1", target: "Alpha Fiber", buyer: "Zulu", date: "2026-07-01T00:00:00.000Z" }),
  ];

  it("accepts supported URL fields and safely falls back to date", () => {
    expect(parseDealSortField("buyer")).toBe("buyer");
    expect(parseDealSortField("not-a-field")).toBe("date");
  });

  it("sorts date and text fields in either direction", () => {
    expect(sortDeals(deals, "date", "desc").map((item) => item.legacyId)).toEqual(["DEAL-1", "DEAL-2"]);
    expect(sortDeals(deals, "target", "asc").map((item) => item.legacyId)).toEqual(["DEAL-1", "DEAL-2"]);
    expect(sortDeals(deals, "buyer", "asc").map((item) => item.legacyId)).toEqual(["DEAL-2", "DEAL-1"]);
  });

  it("uses stable tie-breakers so pagination does not shuffle", () => {
    const tied = [
      deal({ legacyId: "DEAL-B", target: "Same", buyer: "Buyer" }),
      deal({ legacyId: "DEAL-A", target: "Same", buyer: "Buyer" }),
    ];
    expect(sortDeals(tied, "buyer", "desc").map((item) => item.legacyId)).toEqual(["DEAL-A", "DEAL-B"]);
  });
});
