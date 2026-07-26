import { describe, expect, it } from "vitest";
import {
  PORTCO_PAGE_SIZE,
  clampCompanyPage,
  parseCompanyPage,
  parseCompanySort,
  parseCompanySortDirection,
  sortCompanyRows,
} from "./PortfolioDatabase";

type CompanyFixture = {
  name: string;
  sector: string;
  country: string;
  investmentFirm: string;
};

function company(name: string, overrides: Partial<CompanyFixture> = {}): CompanyFixture {
  return {
    name,
    sector: "Digital",
    country: "United States",
    investmentFirm: "Alpha Infrastructure",
    ...overrides,
  };
}

describe("portfolio URL result state", () => {
  it("normalizes unsupported page, sort, and direction values", () => {
    expect(parseCompanyPage("4")).toBe(4);
    expect(parseCompanyPage("2.5")).toBe(1);
    expect(parseCompanyPage("0")).toBe(1);
    expect(parseCompanySort("country")).toBe("country");
    expect(parseCompanySort("unsupported")).toBe("name");
    expect(parseCompanySortDirection("desc")).toBe("desc");
    expect(parseCompanySortDirection("sideways")).toBe("asc");
  });

  it("clamps against the 25-company result contract", () => {
    expect(PORTCO_PAGE_SIZE).toBe(25);
    expect(clampCompanyPage(8, 51)).toBe(3);
    expect(clampCompanyPage(3, 0)).toBe(1);
  });

  it("sorts all public columns without mutating the source", () => {
    const source = [
      company("Zulu", { sector: "Utilities", country: "United Kingdom", investmentFirm: "Beta" }),
      company("Alpha", { sector: "Digital", country: "Canada", investmentFirm: "Alpha" }),
    ];

    expect(sortCompanyRows(source, "name", "asc")[0].name).toBe("Alpha");
    expect(sortCompanyRows(source, "sector", "asc")[0].name).toBe("Alpha");
    expect(sortCompanyRows(source, "country", "asc")[0].name).toBe("Alpha");
    expect(sortCompanyRows(source, "firm", "desc")[0].name).toBe("Zulu");
    expect(source[0].name).toBe("Zulu");
  });
});
