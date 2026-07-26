import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public dashboard table accessibility contract", () => {
  it("labels both horizontal table scrollers and includes them in keyboard order", () => {
    const source = readFileSync(
      `${process.cwd()}/src/components/dashboard/DashboardPage.tsx`,
      "utf8",
    );

    expect(source).toContain('aria-label={`${title} signals table`}');
    expect(source).toContain('aria-label="Dashboard source health table"');
    expect(source.match(/role="region"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(source.match(/tabIndex=\{0\}/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
