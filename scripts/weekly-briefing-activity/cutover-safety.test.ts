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

  it("validates the exact user waiver before either rendering or advancing", () => {
    const source = readFileSync(
      "scripts/weekly-briefing-activity/workflow-cli.ts",
      "utf8",
    );
    const renderStart = source.indexOf("function renderCommand");
    const advanceStart = source.indexOf("async function advanceCommand");
    const mainStart = source.indexOf("async function main", advanceStart);
    const render = source.slice(renderStart, advanceStart);
    const advance = source.slice(advanceStart, mainStart);

    const renderWaiverValidation = render.indexOf(
      "validateUserAuthorizedWaiverForEmail",
    );
    const emailWrite = render.indexOf("atomicWriteArtifact(repoRoot");
    const advanceWaiverValidation = advance.indexOf(
      "validateUserAuthorizedWaiverForEmail",
    );
    const indexWrite = advance.indexOf("atomicWriteArtifact(repoRoot");

    expect(renderWaiverValidation).toBeGreaterThanOrEqual(0);
    expect(emailWrite).toBeGreaterThan(renderWaiverValidation);
    expect(advanceWaiverValidation).toBeGreaterThanOrEqual(0);
    expect(indexWrite).toBeGreaterThan(advanceWaiverValidation);
    expect(advance).toContain(
      "advance requires exactly one of --qa FILE or --waiver FILE",
    );
  });
});
