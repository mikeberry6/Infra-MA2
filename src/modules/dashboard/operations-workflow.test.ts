import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("dashboard operational workflows", () => {
  const pipeline = readFileSync(path.join(process.cwd(), ".github/workflows/data-pipelines.yml"), "utf8");
  const release = readFileSync(path.join(process.cwd(), ".github/workflows/release-production.yml"), "utf8");
  const schemaStage = readFileSync(path.join(process.cwd(), ".github/workflows/stage-production-schema.yml"), "utf8");
  const rollback = readFileSync(path.join(process.cwd(), ".github/workflows/rollback-production.yml"), "utf8");

  const pipelineStep = (name: string) => {
    const marker = `      - name: ${name}\n`;
    const start = pipeline.indexOf(marker);
    expect(start, `missing workflow step: ${name}`).toBeGreaterThanOrEqual(0);
    const next = pipeline.indexOf("\n      - ", start + marker.length);
    return pipeline.slice(start, next === -1 ? pipeline.length : next);
  };

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
    expect(release.match(/--require-full-window/g)).toHaveLength(2);
    expect(release).toContain("verify-vercel-deployment.ts");
    expect(release).toContain("--require-immutable-url");
    expect(release).toContain('promote "$deployment_id"');
    expect(release).toContain('--token "$VERCEL_TOKEN"');
    expect(pipeline).toContain("group: production-release");
    expect(schemaStage).toContain("DASHBOARD_WRITES_ENABLED: ${{ vars.DASHBOARD_WRITES_ENABLED }}");
    expect(schemaStage).toContain('if [ "$DASHBOARD_WRITES_ENABLED" != "false" ]');
    expect(schemaStage.indexOf('if [ "$DASHBOARD_WRITES_ENABLED" != "false" ]'))
      .toBeLessThan(schemaStage.indexOf("npm ci"));
  });

  it("collects independent pipeline diagnostics before returning a failure", () => {
    const dashboardReliability = pipelineStep("Enforce provider and rolling reliability thresholds");
    const newsReliability = pipelineStep("Enforce scan and rolling reliability thresholds");
    const weeklyDatabase = pipelineStep("Verify database integrity and source coverage");
    const weeklyFreshness = pipelineStep("Verify dashboard and news freshness contracts");
    const monthlyDependencies = pipelineStep("Audit production dependencies");
    const monthlyCoverage = pipelineStep("Audit database and source coverage");

    expect(dashboardReliability).toContain("always()");
    expect(dashboardReliability).toContain("steps.install.outcome == 'success'");
    expect(newsReliability).toContain("if: always() && steps.install.outcome == 'success'");
    expect(newsReliability).toContain("if [ -f tmp/news-scan-summary.json ]");

    for (const step of [weeklyDatabase, weeklyFreshness, monthlyCoverage]) {
      expect(step).toContain("if: always()");
      expect(step).toContain("overall=0");
      expect(step).toContain("set +e");
      expect(step).toContain("overall=1");
      expect(step).toContain('exit "$overall"');
    }

    expect(weeklyDatabase).toContain("source-coverage-report.ts --require-complete");
    expect(weeklyDatabase).toContain("report-company-merge-candidates.ts --published-only --require-clean");
    expect(weeklyDatabase.match(/overall=1/g)).toHaveLength(3);
    expect(weeklyFreshness.match(/verify-pipeline-health\.ts/g)).toHaveLength(2);
    expect(weeklyFreshness.match(/overall=1/g)).toHaveLength(3);
    expect(monthlyDependencies).toContain("if: always()");
    expect(monthlyDependencies).toContain("tmp/monthly-audit/dependency-audit.log");
    expect(monthlyCoverage).toContain("validate-portfolios");
    expect(monthlyCoverage).toContain("audit-portfolio-duplicates.ts");
    expect(monthlyCoverage.match(/overall=1/g)).toHaveLength(5);

    expect(pipeline.match(/      - name: Upload run evidence\n        if: .*always\(\).*\n/g)).toHaveLength(2);
    expect(pipelineStep("Upload weekly verification evidence")).toContain("always()");
    expect(pipelineStep("Upload monthly audit evidence")).toContain("always()");
  });

  it("separates the live application from the applied migration baseline", () => {
    expect(schemaStage).toContain("production_app_sha:");
    expect(schemaStage).toContain("migration_base_sha:");
    expect(schemaStage).toContain("verify-migration-baseline.ts");
    expect(schemaStage).toContain('--base-sha="$MIGRATION_BASE_SHA"');
    expect(schemaStage).toContain('--production-app-sha="$PRODUCTION_APP_SHA"');
    expect(schemaStage).toContain("verify-vercel-deployment.ts");
    expect(schemaStage).toContain("production-app-inspect.json");
    expect(schemaStage).toContain("production-app-inspect-before-write.json");
    expect(schemaStage).toContain("migration-baseline-before-write.json");
    expect(schemaStage).toContain("migration-baseline-after-write.json");
    expect(schemaStage).toContain('git merge-base --is-ancestor "$MIGRATION_BASE_SHA" "$RELEASE_SHA"');
    expect(schemaStage).not.toContain('git merge-base --is-ancestor "$MIGRATION_BASE_SHA" "$PRODUCTION_APP_SHA"');
    expect(schemaStage).toContain('git merge-base --is-ancestor "$PRODUCTION_APP_SHA" "$RELEASE_SHA"');
    expect(schemaStage).toContain("PRODUCTION_URL: ${{ vars.PRODUCTION_URL }}");
    expect(schemaStage).not.toContain("production_base_sha");
  });

  it("verifies rollback provenance and uses immutable deployment identity", () => {
    expect(rollback).toContain("release_sha:");
    expect(rollback).toContain("verify-vercel-deployment.ts");
    expect(rollback).toContain("--require-immutable-url");
    expect(rollback).toContain('rollback "$deployment_id"');
    expect(rollback).toContain("PRODUCTION_URL: ${{ vars.PRODUCTION_URL }}");
    expect(rollback).toContain("canonical-production-inspect.json");
    expect(rollback).toContain('--expected-sha="$ROLLBACK_SHA"');
    expect(rollback).toContain('--expected-version="$ROLLBACK_SHA"');
    expect(rollback).not.toContain("vercel@51.7.0 inspect");
  });
});
