import { describe, it, expect } from "vitest";
import { deriveRanking } from "./RankingBars";

const constColor = () => "#000000";

describe("deriveRanking", () => {
  it("returns empty array for empty input", () => {
    expect(deriveRanking([], constColor)).toEqual([]);
  });

  it("counts occurrences and sorts descending", () => {
    const rows = deriveRanking(["A", "B", "A", "C", "B", "A"], constColor);
    expect(rows.map((r) => [r.name, r.count])).toEqual([
      ["A", 3],
      ["B", 2],
      ["C", 1],
    ]);
  });

  it("respects the limit argument", () => {
    const items = ["A", "A", "B", "B", "C", "C", "D", "E"];
    const rows = deriveRanking(items, constColor, 2);
    expect(rows.map((r) => r.name)).toEqual(["A", "B"]);
  });

  it("defaults the limit to 5", () => {
    const items = ["A", "B", "C", "D", "E", "F", "G"];
    const rows = deriveRanking(items, constColor);
    expect(rows).toHaveLength(5);
  });

  it("applies the color function to each row", () => {
    const colorMap: Record<string, string> = { A: "#ff0000", B: "#00ff00" };
    const rows = deriveRanking(["A", "B", "A"], (item) => colorMap[item]);
    expect(rows[0]).toMatchObject({ name: "A", color: "#ff0000" });
    expect(rows[1]).toMatchObject({ name: "B", color: "#00ff00" });
  });
});
