import { describe, expect, it } from "vitest";
import {
  citationIdentity,
  planExactCompanyCitationDeduplication,
  type CitationSnapshot,
} from "./duplicate-citations.ts";

function citation(overrides: Partial<CitationSnapshot> = {}): CitationSnapshot {
  return {
    id: "citation-a",
    sourceId: "source-a",
    dealId: null,
    companyId: "company-a",
    purpose: "COMPANY_PROFILE",
    evidenceLabel: null,
    isPrimary: false,
    ...overrides,
  };
}

describe("exact company citation deduplication", () => {
  it("keeps one deterministic row and removes only exact identity duplicates", () => {
    const first = citation({ id: "b" });
    const second = citation({ id: "a" });
    const distinctPurpose = citation({ id: "c", purpose: "OPERATIONS_ASSETS" });
    const plan = planExactCompanyCitationDeduplication([first, second, distinctPurpose]);
    expect(plan.duplicateGroups).toBe(1);
    expect(plan.excessRows).toBe(1);
    expect(plan.groups[0].keepId).toBe("a");
    expect(plan.groups[0].deleteIds).toEqual(["b"]);
  });

  it("preserves the reviewed primary citation regardless of lexical ID order", () => {
    const plan = planExactCompanyCitationDeduplication([
      citation({ id: "a" }),
      citation({ id: "z", isPrimary: true }),
    ]);
    expect(plan.groups[0].keepId).toBe("z");
    expect(plan.groups[0].deleteIds).toEqual(["a"]);
  });

  it("treats deal linkage and evidence labels as material identity", () => {
    const rows = [
      citation({ id: "a" }),
      citation({ id: "b", dealId: "deal-a" }),
      citation({ id: "c", evidenceLabel: "Ownership close" }),
    ];
    expect(new Set(rows.map(citationIdentity)).size).toBe(3);
    expect(planExactCompanyCitationDeduplication(rows).excessRows).toBe(0);
  });

  it("fails closed if corrupt data marks multiple exact rows primary", () => {
    expect(() => planExactCompanyCitationDeduplication([
      citation({ id: "a", isPrimary: true }),
      citation({ id: "b", isPrimary: true }),
    ])).toThrow(/more than one primary/);
  });
});
