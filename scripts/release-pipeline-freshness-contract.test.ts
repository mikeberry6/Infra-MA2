import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("production release pipeline freshness contract", () => {
  const workflow = readFileSync(
    path.join(process.cwd(), ".github", "workflows", "release-production.yml"),
    "utf8",
  );

  it("uses the canonical weekday schedule for dashboard promotion checks", () => {
    expect(workflow).toMatch(
      /verify-pipeline-health\.ts --pipeline=DASHBOARD_SYNC --reliability-schedule=dashboard-weekday --freshness-schedule=dashboard-weekday\b/,
    );
    expect(workflow).not.toMatch(
      /verify-pipeline-health\.ts --pipeline=DASHBOARD_SYNC[^\n]*--max-age-hours=/,
    );
  });

  it("retains the explicit max-age contract for the daily news pipeline", () => {
    expect(workflow).toMatch(
      /verify-pipeline-health\.ts --pipeline=NEWS_SCAN --reliability-schedule=news-daily --max-age-hours=36\b[^\n]*--max-source-failure-rate=0\.25\b/,
    );
  });
});
