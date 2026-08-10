import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("weekly briefing approved-edition cutover", () => {
  it("validates every prospective dependency before writing public routing state", () => {
    const source = readFileSync(
      "scripts/weekly-briefing-activity/workflow-cli.ts",
      "utf8",
    );
    const start = source.indexOf("async function advanceCommand");
    const end = source.indexOf("async function main", start);
    const advance = source.slice(start, end);
    const preflight = advance.indexOf(
      "await validateApprovedWeeklyBriefingIndexDependencies(updated, repoRoot)",
    );
    const publicWrite = advance.indexOf(
      "atomicWriteArtifact(repoRoot, artifactFile(indexPath, updated))",
    );

    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    expect(preflight).toBeGreaterThanOrEqual(0);
    expect(publicWrite).toBeGreaterThan(preflight);
  });
});
