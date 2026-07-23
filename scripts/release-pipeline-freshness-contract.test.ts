import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("production release pipeline freshness contract", () => {
  const workflow = readFileSync(
    path.join(process.cwd(), ".github", "workflows", "release-production.yml"),
    "utf8",
  );
  const dataPipelines = readFileSync(
    path.join(process.cwd(), ".github", "workflows", "data-pipelines.yml"),
    "utf8",
  );

  it("uses the canonical weekday schedule for dashboard promotion checks", () => {
    expect(workflow).toMatch(
      /verify-pipeline-health\.ts --pipeline=DASHBOARD_SYNC --freshness-schedule=dashboard-weekday\b/,
    );
    expect(workflow).not.toMatch(
      /verify-pipeline-health\.ts --pipeline=DASHBOARD_SYNC[^\n]*--max-age-hours=/,
    );
  });

  it("retains the explicit max-age contract for the daily news pipeline", () => {
    expect(workflow).toMatch(
      /verify-pipeline-health\.ts --pipeline=NEWS_SCAN --max-age-hours=36\b[^\n]*--max-source-failure-rate=0\.25\b/,
    );
  });

  it("uses the weekday schedule for recurring dashboard checks, including weekends", () => {
    const dashboardChecks = dataPipelines.match(
      /verify-pipeline-health\.ts --pipeline=DASHBOARD_SYNC[^\n]*/g,
    ) ?? [];

    expect(dashboardChecks).toHaveLength(1);
    expect(dashboardChecks[0]).toContain("--freshness-schedule=dashboard-weekday");
    expect(dataPipelines).toContain("--freshness-schedule=dashboard-weekday");
    expect(dataPipelines).not.toMatch(
      /--pipeline=DASHBOARD_SYNC[\s\S]{0,220}--max-age-hours=/,
    );
  });
});
