import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("dashboard operational workflows", () => {
  const pipeline = readFileSync(path.join(process.cwd(), ".github/workflows/data-pipelines.yml"), "utf8");
  const release = readFileSync(path.join(process.cwd(), ".github/workflows/release-production.yml"), "utf8");

  it("uses DST-safe weekday 07:30 America/New_York scheduling", () => {
    expect(pipeline).toContain('cron: "30 11 * * 1-5"');
    expect(pipeline).toContain('cron: "30 12 * * 1-5"');
    expect(pipeline).toContain("TZ=America/New_York date +%z");
    expect(pipeline).toContain('"-0400"');
    expect(pipeline).toContain('"-0500"');
  });

  it("keeps writes fail-closed and retains retry, freshness, and source-audit gates", () => {
    for (const key of ["FRED_API_KEY", "EIA_API_KEY", "SAM_API_KEY", "SEC_USER_AGENT"]) {
      expect(pipeline).toContain(key);
      expect(release).toContain(key);
    }
    expect(pipeline).toContain("DASHBOARD_WRITES_ENABLED");
    expect(pipeline).toContain("run-with-retry.mjs --attempts=3 -- npm run dashboard:sync");
    expect(pipeline).toContain("--min-success-rate=0.95");
    expect(pipeline).toContain("npm run dashboard:sync:dry-run");
    expect(pipeline).toContain("npm run dashboard:verify -- --require-complete");
    expect(release).toContain("npm run dashboard:verify -- --require-complete");
  });
});
