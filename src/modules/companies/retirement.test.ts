import { describe, expect, it } from "vitest";
import {
  ACTIVE_COMPANY_WHERE,
  MUTABLE_COMPANY_WHERE,
  companyRetirementMap,
  excludeRedirectedCompanies,
} from "./retirement";

describe("canonical company retirement compatibility", () => {
  it("provides the canonical-row predicate used by public and trust queries", () => {
    expect(ACTIVE_COMPANY_WHERE).toEqual({ retirement: { is: null } });
  });

  it("locks both retired IDs and merge survivors against compatibility-breaking edits", () => {
    expect(MUTABLE_COMPANY_WHERE).toEqual({
      retirement: { is: null },
      redirects: { none: {} },
    });
  });

  it("keeps compatibility rows in storage while excluding them from canonical reads", () => {
    const companies = [{ id: "canonical" }, { id: "retired" }, { id: "unrelated" }];
    const redirects = [{ retiredId: "retired", companyId: "canonical" }];

    expect(excludeRedirectedCompanies(companies, redirects)).toEqual([
      { id: "canonical" },
      { id: "unrelated" },
    ]);
    expect(companies).toHaveLength(3);
  });

  it("maps every retired ID to its reviewed canonical survivor", () => {
    expect(companyRetirementMap([
      { retiredId: "retired-a", companyId: "canonical" },
      { retiredId: "retired-b", companyId: "canonical" },
    ])).toEqual(new Map([
      ["retired-a", "canonical"],
      ["retired-b", "canonical"],
    ]));
  });
});
