import { describe, expect, it } from "vitest";
import { loadArchiveIssues } from "./sources-archive";

describe("weekly briefing archive input extraction", () => {
  it("freezes all 25 issues and all 335 card appearances through August 7", () => {
    const issues = loadArchiveIssues({ repoRoot: process.cwd(), cutoff: "2026-08-07" });

    expect(issues).toHaveLength(25);
    expect(issues[0].issueDate).toBe("2026-02-14");
    expect(issues.at(-1)?.issueDate).toBe("2026-08-07");
    expect(issues.reduce((total, issue) => total + issue.cards.length, 0)).toBe(335);
    expect(issues.every((issue) => /^[a-f0-9]{64}$/.test(issue.file.sha256))).toBe(true);
  });

  it("marks all fifteen February 21 placeholder links as recovered evidence", () => {
    const issue = loadArchiveIssues({ repoRoot: process.cwd(), cutoff: "2026-08-07" })
      .find((candidate) => candidate.issueDate === "2026-02-21");

    expect(issue?.cards).toHaveLength(15);
    expect(issue?.cards.every((card) => card.sourceUrlOrigin === "RECOVERED")).toBe(true);
    expect(issue?.cards.every((card) => card.sourceUrl?.startsWith("https://"))).toBe(true);
    expect(new Set(issue?.cards.map((card) => card.recoveredCitationLegacyId))).toHaveProperty("size", 15);
  });

  it("preserves the source DOM order of August 7 controls", () => {
    const issue = loadArchiveIssues({ repoRoot: process.cwd(), cutoff: "2026-08-07" }).at(-1);

    expect(issue?.ytdSectorControls).toEqual([
      { label: "Power & ET", count: 154 },
      { label: "Transportation", count: 72 },
      { label: "Digital", count: 71 },
      { label: "Social Infra", count: 38 },
      { label: "Utilities", count: 36 },
      { label: "Midstream", count: 22 },
    ]);
    expect(issue?.ytdRegionControls).toEqual([
      { label: "Europe", count: 159 },
      { label: "North America", count: 158 },
      { label: "Asia-Pacific", count: 56 },
      { label: "Latin America", count: 15 },
      { label: "Middle East & Africa", count: 5 },
    ]);
  });
});
