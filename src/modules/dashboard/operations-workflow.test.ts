import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("dashboard operational workflows", () => {
  const pipeline = readFileSync(path.join(process.cwd(), ".github/workflows/data-pipelines.yml"), "utf8");
  const release = readFileSync(path.join(process.cwd(), ".github/workflows/release-production.yml"), "utf8");
  const schemaStage = readFileSync(path.join(process.cwd(), ".github/workflows/stage-production-schema.yml"), "utf8");
  const rollback = readFileSync(path.join(process.cwd(), ".github/workflows/rollback-production.yml"), "utf8");
  const linkedIn = readFileSync(path.join(process.cwd(), ".github/workflows/scrape-linkedin.yml"), "utf8");

  const pipelineStep = (name: string) => {
    const marker = `      - name: ${name}\n`;
    const start = pipeline.indexOf(marker);
    expect(start, `missing workflow step: ${name}`).toBeGreaterThanOrEqual(0);
    const next = pipeline.indexOf("\n      - ", start + marker.length);
    return pipeline.slice(start, next === -1 ? pipeline.length : next);
  };

  const pipelineJob = (id: string) => {
    const marker = `\n  ${id}:\n`;
    const start = pipeline.indexOf(marker);
    expect(start, `missing workflow job: ${id}`).toBeGreaterThanOrEqual(0);
    const contentStart = start + marker.length;
    const next = pipeline.slice(contentStart).search(/\n  [a-z][a-z0-9_-]*:\n/);
    return pipeline.slice(start, next === -1 ? pipeline.length : contentStart + next);
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
    for (const source of [pipeline, schemaStage, release]) {
      expect(source).not.toContain("PHASE2_PIPELINES_ENABLED");
    }
    expect(pipeline).toContain("run-with-retry.mjs --attempts=3 -- npm run dashboard:sync");
    expect(pipeline).toContain("--min-success-rate=0.95");
    expect(pipeline).toContain("npm run dashboard:sync:dry-run");
    expect(pipeline).toContain("npm run dashboard:verify -- --require-complete");
    expect(release).toContain("npm run dashboard:verify -- --require-complete");
    expect(release.match(/--require-full-window/g)).toHaveLength(2);
    expect(release).toContain("verify-vercel-deployment.ts");
    expect(release).toContain("--require-immutable-url");
    expect(release).toContain("--operation=promote");
    expect(release).toContain("VERCEL_TOKEN");
    for (const source of [release, rollback]) {
      expect(source).toContain("scripts/mutate-vercel-production.ts");
      expect(source).toContain('--project-id="$EXPECTED_VERCEL_PROJECT_ID"');
      expect(source).toContain("--transport=vercel-bypass");
      expect(source).toContain("VERCEL_AUTOMATION_BYPASS_SECRET");
    }
    expect(pipeline).toContain("group: production-release");
    expect(schemaStage).toContain("DASHBOARD_WRITES_ENABLED: ${{ vars.DASHBOARD_WRITES_ENABLED }}");
    expect(schemaStage).toContain(
      "FORBIDDEN_DATABASE_HOST: ${{ vars.MIGRATION_DATABASE_HOST }}",
    );
    expect(schemaStage).toContain(
      "FORBIDDEN_DATABASE_HOST_2: ${{ vars.PRODUCTION_DATABASE_HOST }}",
    );
    expect(schemaStage).toContain('test -n "$VERCEL_TEAM_ID"');
    expect(release).toContain(
      "FORBIDDEN_DATABASE_HOST_2: ${{ vars.MIGRATION_DATABASE_HOST }}",
    );
    expect(release).toContain("VERCEL_TEAM_ID");
    expect(schemaStage).not.toContain("PHASE2_MIGRATION_DATABASE_HOST");
    expect(release).not.toContain("PHASE2_MIGRATION_DATABASE_HOST");
    expect(schemaStage).toContain('if [ "$DASHBOARD_WRITES_ENABLED" != "false" ]');
    expect(schemaStage.indexOf('if [ "$DASHBOARD_WRITES_ENABLED" != "false" ]'))
      .toBeLessThan(schemaStage.indexOf("npm ci"));
  });

  it("authenticates exact main code before exposing production pipeline credentials", () => {
    const workflowEnvironment = pipeline.slice(
      pipeline.indexOf("\nenv:\n"),
      pipeline.indexOf("\njobs:\n"),
    );
    const trustedMain = pipelineJob("trusted_main");
    const credentialLines = pipeline.split("\n").filter((line) => line.includes("secrets."));

    expect(workflowEnvironment).not.toContain("DATABASE_URL");
    expect(workflowEnvironment).not.toContain("secrets.");
    expect(credentialLines.length).toBeGreaterThan(0);
    expect(credentialLines.filter((line) => (
      !line.includes("github.ref == 'refs/heads/main'") || !line.endsWith("|| '' }}")
    ))).toEqual([]);
    expect(trustedMain).toContain('if [ "$GITHUB_REF" != "refs/heads/main" ]');
    expect(trustedMain).toContain('"$GITHUB_EVENT_NAME" != "schedule"');
    expect(trustedMain).toContain('"$GITHUB_EVENT_NAME" != "repository_dispatch"');
    expect(trustedMain).toContain('case "$REQUESTED_PIPELINE" in');
    expect(pipeline).toContain("repository_dispatch:");
    expect(pipeline).toContain("types: [run-data-pipeline]");
    expect(pipeline).not.toContain("workflow_dispatch:");
    expect(pipeline).not.toContain("inputs.pipeline");
    expect(trustedMain).toContain("ref: refs/heads/main");
    expect(trustedMain).toContain('checked_out_sha="$(git rev-parse HEAD)"');
    expect(trustedMain).toContain('checked_out_main_sha="$(git rev-parse refs/heads/main)"');
    expect(trustedMain).toContain('"$checked_out_sha" != "$GITHUB_SHA"');
    expect(trustedMain).toContain('"$checked_out_main_sha" != "$GITHUB_SHA"');
    expect(trustedMain).toContain('echo "release_sha=$checked_out_sha" >> "$GITHUB_OUTPUT"');
    expect(trustedMain).not.toContain("secrets.");

    for (const id of ["dashboard", "news", "verify", "source-audit"]) {
      const job = pipelineJob(id);
      const checkout = job.indexOf("- name: Checkout verified main pipeline code");
      const identity = job.indexOf("- name: Verify checked-out main pipeline identity");
      const identityEnd = job.indexOf("\n      - ", identity + 1);
      const firstSecret = job.indexOf("secrets.");

      expect(job, id).toContain("needs: trusted_main");
      expect(job, id).toContain("needs.trusted_main.result == 'success'");
      expect(checkout, id).toBeGreaterThanOrEqual(0);
      expect(identity, id).toBeGreaterThan(checkout);
      expect(identityEnd, id).toBeGreaterThan(identity);
      expect(firstSecret, id).toBeGreaterThan(identityEnd);
      expect(job.slice(0, identityEnd), id).not.toContain("secrets.");
      expect(job.slice(checkout, identity), id).toContain("ref: refs/heads/main");
      expect(job.slice(checkout, identity), id).toContain("persist-credentials: false");
      expect(job.slice(identity, identityEnd), id).toContain(
        "TRUSTED_MAIN_SHA: ${{ needs.trusted_main.outputs.release_sha }}",
      );
      expect(job.slice(identity, identityEnd), id).toContain(
        '"$(git rev-parse HEAD)" != "$TRUSTED_MAIN_SHA"',
      );
      expect(job.slice(identity, identityEnd), id).toContain(
        '"$(git rev-parse refs/heads/main)" != "$TRUSTED_MAIN_SHA"',
      );
    }
  });

  it("keeps the research scraper token behind exact default-branch provenance", () => {
    const provenance = linkedIn.indexOf("Verify exact default-branch scraper provenance");
    const firstSecret = linkedIn.indexOf("secrets.APIFY_TOKEN");

    expect(linkedIn).toContain("repository_dispatch:");
    expect(linkedIn).toContain("types: [collect-linkedin-candidates]");
    expect(linkedIn).not.toContain("workflow_dispatch:");
    expect(linkedIn).toContain("ref: refs/heads/main");
    expect(provenance).toBeGreaterThanOrEqual(0);
    expect(firstSecret).toBeGreaterThan(provenance);
    expect(linkedIn.slice(0, firstSecret)).not.toContain("secrets.");
    expect(linkedIn).toContain('"$(git rev-parse HEAD)" != "$GITHUB_SHA"');
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
    const newsScan = pipelineStep("Scan public sources with bounded transient retries");
    expect(newsScan).toMatch(/news:scan -- --max-targets=200 --max-pages=750/);
    expect(newsScan).toContain("NEWS_SCAN_AS_OF: ${{ steps.news_clock.outputs.scan_as_of }}");
    expect(newsScan).toContain("NEWS_SCAN_ROTATION_DATE: ${{ steps.news_clock.outputs.rotation_date }}");
    const newsClock = pipelineStep("Pin the UTC news window across every retry");
    expect(newsClock).toContain("EVENT_NAME: ${{ github.event_name }}");
    expect(newsClock).toContain("date -u -d '6 hours ago'");
    expect(newsClock).toContain('rotation_date="${scan_as_of%%T*}"');

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
    expect(weeklyFreshness).toMatch(
      /--pipeline=NEWS_SCAN[^\n]*--max-source-failure-rate=0\.25/,
    );
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
    expect(rollback).toContain("--operation=rollback");
    expect(rollback).toContain("PRODUCTION_URL: ${{ vars.PRODUCTION_URL }}");
    expect(rollback).toContain('--expected-sha="$ROLLBACK_SHA"');
    expect(rollback).toContain("--transport=vercel-bypass");
    expect(rollback).toContain("--skip-health");
    expect(rollback).toContain("--allow-legacy-root");
    expect(rollback).toContain("--output=tmp/rollback/production-smoke.json");
    expect(rollback.match(/--expected-version="\$ROLLBACK_SHA"/g) ?? []).toHaveLength(2);
    expect(rollback).not.toMatch(/\b(?:npx\s+|node_modules\/\.bin\/)vercel\b/);
    expect(rollback).toContain("scripts/verify-rollback-provenance.ts");
  });
});
