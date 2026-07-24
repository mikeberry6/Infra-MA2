import { describe, expect, it } from "vitest";
import {
  FUND_PAGE_SIZE,
  clampFundPage,
  paginateManagerFunds,
  parseFundPage,
  parseFundSort,
  parseSortDirection,
  sortFundRows,
} from "./FundDatabase";

type FundFixture = {
  managerName: string;
  fundName: string;
  strategies: string[];
  sizeUsdMm: number | null;
  vintage: string;
};

function fund(
  managerName: string,
  fundName: string,
  overrides: Partial<FundFixture> = {},
): FundFixture {
  return {
    managerName,
    fundName,
    strategies: ["Core"],
    sizeUsdMm: 1_000,
    vintage: "2024",
    ...overrides,
  };
}

describe("fund URL result state", () => {
  it("normalizes unsupported page, sort, and direction values", () => {
    expect(parseFundPage("4")).toBe(4);
    expect(parseFundPage("2.5")).toBe(1);
    expect(parseFundPage("0")).toBe(1);
    expect(parseFundPage("unknown")).toBe(1);
    expect(parseFundSort("size")).toBe("size");
    expect(parseFundSort("unknown")).toBe("name");
    expect(parseSortDirection("desc")).toBe("desc");
    expect(parseSortDirection("sideways")).toBe("asc");
  });

  it("clamps against the 25-fund result contract", () => {
    expect(FUND_PAGE_SIZE).toBe(25);
    expect(clampFundPage(9, 51)).toBe(3);
    expect(clampFundPage(2, 0)).toBe(1);
  });
});

describe("fund sorting and manager pagination", () => {
  it("sorts without mutating the source and keeps undisclosed values last", () => {
    const source = [
      fund("Manager B", "Undisclosed", { sizeUsdMm: null, vintage: "Evergreen" }),
      fund("Manager A", "Large", { sizeUsdMm: 2_000, vintage: "2025" }),
      fund("Manager A", "Small", { sizeUsdMm: 500, vintage: "2021" }),
    ];

    expect(sortFundRows(source, "size", "desc").map((item) => item.fundName)).toEqual([
      "Large",
      "Small",
      "Undisclosed",
    ]);
    expect(sortFundRows(source, "vintage", "asc").map((item) => item.fundName)).toEqual([
      "Small",
      "Large",
      "Undisclosed",
    ]);
    expect(source.map((item) => item.fundName)).toEqual(["Undisclosed", "Large", "Small"]);
  });

  it("limits a manager-grouped result page to 25 funds", () => {
    const source = Array.from({ length: 58 }, (_, index) =>
      fund(index < 30 ? "Manager A" : "Manager B", `Fund ${String(index + 1).padStart(2, "0")}`),
    );

    const secondPage = paginateManagerFunds(source, 2);
    expect(secondPage.flatMap((group) => group.funds)).toHaveLength(25);
    expect(secondPage[0].managerName).toBe("Manager A");
    expect(secondPage[0].totalMatchingFunds).toBe(30);
    expect(secondPage.at(-1)?.managerName).toBe("Manager B");
    expect(secondPage.at(-1)?.totalMatchingFunds).toBe(28);
    expect(paginateManagerFunds(source, 3).flatMap((group) => group.funds)).toHaveLength(8);
  });

  it("keeps managers A-Z while applying column order within each manager", () => {
    const sorted = sortFundRows([
      fund("Manager B", "B Small", { sizeUsdMm: 500 }),
      fund("Manager A", "A Small", { sizeUsdMm: 250 }),
      fund("Manager B", "B Large", { sizeUsdMm: 2_000 }),
      fund("Manager A", "A Large", { sizeUsdMm: 1_500 }),
    ], "size", "desc");

    const groups = paginateManagerFunds(sorted, 1);
    expect(groups.map((group) => group.managerName)).toEqual(["Manager A", "Manager B"]);
    expect(groups.map((group) => group.funds.map((item) => item.fundName))).toEqual([
      ["A Large", "A Small"],
      ["B Large", "B Small"],
    ]);
    expect(groups.map((group) => group.totalMatchingFunds)).toEqual([2, 2]);
  });
});
