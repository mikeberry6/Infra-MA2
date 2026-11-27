// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Issue } from "../../../scripts/briefing-deals/archive";
import archivedDealFacts from "./archived-deal-facts.json";
import { selectDealEmphasis } from "./deal-emphasis";

describe("deal overview emphasis", () => {
  it("resolves each archived editorial selection to exactly one span of the published text", () => {
    const inventory: { issues: Issue[] } = JSON.parse(readFileSync("audits/briefing-deals/archive.json", "utf8"));
    const cards = new Map(inventory.issues.flatMap(issue => issue.cards.map(card => [card.key, card] as const)));
    for (const [key, fact] of Object.entries(archivedDealFacts)) {
      const card = cards.get(key)!;
      expect(fact.trim(), key).not.toBe("");
      expect(card.description.split(fact), key).toHaveLength(2);
      expect(selectDealEmphasis(card), key).toBe(fact);
    }
  });

  it("uses the original wording when an unmarked issue contains an abbreviation or decimal", () => {
    const description = "The fund agreed to buy a U.S. utility for US$1.5bn. Approval is pending.";
    const card = { key: "new-utility", description, scaleNote: "valuation unavailable" };
    expect(selectDealEmphasis(card, "US$2bn")).toBe("The fund agreed to buy a U.S. utility for US$1.5bn.");
    expect(selectDealEmphasis({ ...card, scaleNote: "for US$1.5bn" })).toBe("for US$1.5bn");
  });
});
