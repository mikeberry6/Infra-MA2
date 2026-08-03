import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = (name: string) => readFileSync(`.github/workflows/${name}`, "utf8");

describe("focused dashboard operations workflows", () => {
  it("classifies paired DST schedules without reporting an inactive slot as a sync", () => {
    const source = workflow("data-pipelines.yml");
    const admission = source.slice(
      source.indexOf("\n  admission:"),
      source.indexOf("\n  dashboard:"),
    );
    expect(source).toContain('cron: "30 11 * * 1-5"');
    expect(source).toContain('cron: "30 12 * * 1-5"');
    expect(source).toContain("TZ=America/New_York");
    expect(source).toContain("Classify dashboard pipeline invocation");
    expect(source).toContain("admitted: ${{ steps.classify.outputs.admitted }}");
    expect(source).toContain("daylight-schedule-not-current");
    expect(source).toContain("standard-schedule-not-current");
    expect(source).toContain(
      "if: needs.admission.outputs.operation == 'dashboard' && needs.admission.outputs.admitted == 'true'",
    );
    expect(source).not.toContain("if: steps.cadence.outputs.run == 'true'");
    expect(source).not.toContain('echo "run=$should_run"');
    expect(admission).not.toContain("DATABASE_URL");
    expect(admission).not.toContain("secrets.");
  });

  it("requires an enabled write flag and typed confirmation for manual production syncs", () => {
    const source = workflow("data-pipelines.yml");
    const dashboard = source.slice(
      source.indexOf("\n  dashboard:"),
      source.indexOf("\n  verify:"),
    );

    expect(source).toContain("DASHBOARD_WRITES_ENABLED");
    expect(source).toContain("write_confirmation:");
    expect(dashboard).toContain('[ "$DASHBOARD_WRITES_ENABLED" != "true" ]');
    expect(dashboard).toContain('[ "$EVENT_NAME" = "workflow_dispatch" ]');
    expect(dashboard).toContain('[ "$WRITE_CONFIRMATION" != "SYNC-PRODUCTION" ]');
    expect(dashboard).toContain("scripts/assert-database-target.ts");
    expect(dashboard.indexOf("scripts/assert-database-target.ts"))
      .toBeLessThan(dashboard.indexOf("dashboard:sync"));
    expect(dashboard.indexOf("Require explicit production writes"))
      .toBeLessThan(dashboard.indexOf("Install locked dependencies"));
    expect(dashboard).toContain("node scripts/run-with-retry.mjs --attempts=3 -- npm run dashboard:sync");
  });

  it("keeps source audits read-only and emits durable run evidence and summaries", () => {
    const source = workflow("data-pipelines.yml");
    const sourceAudit = source.slice(source.indexOf("\n  source-audit:"));

    expect(source).toContain("dashboard:sync:dry-run");
    expect(source).toContain("verify-dashboard-health.ts");
    expect(source).toContain("--min-success-rate=0.95");
    expect(source).toContain("DASHBOARD_RELIABILITY_START_DATE");
    expect(source).toContain('--start-date="$DASHBOARD_RELIABILITY_START_DATE"');
    expect(source).toContain("dashboard-run-context.json");
    expect(source).toContain("GITHUB_STEP_SUMMARY");
    expect(source).toContain("steps.sync.outcome");
    expect(source).toContain("steps.reliability.outcome");
    expect(sourceAudit).toContain("scripts/assert-database-target.ts");
    expect(sourceAudit).toContain(
      "node scripts/run-with-retry.mjs --attempts=3 -- npm run dashboard:sync:dry-run",
    );
    expect(sourceAudit).not.toContain("DASHBOARD_WRITES_ENABLED");
    expect(sourceAudit).not.toContain("SYNC-PRODUCTION");
    expect(source).not.toContain("dashboard:verify -- --require-complete\n          npm run dashboard:sync:dry-run");
    expect(source).not.toContain("NEWS_SCAN");
  });

  it("keeps schema staging additive and repeats live proofs before writes", () => {
    const source = workflow("stage-production-schema.yml");
    expect(source).toContain("audit-additive-migrations.ts");
    expect(source.match(/verify-vercel-deployment\.ts/g)?.length).toBeGreaterThanOrEqual(2);
    expect(source.match(/verify-migration-baseline\.ts/g)?.length).toBeGreaterThanOrEqual(2);
    expect(source).toContain("quarantine-dashboard-methodology-history.ts");
    expect(source).toContain("backfill-dashboard-signal-approvals.ts");
    expect(source).toContain("verify-auth-throttle-schema.ts");
    expect(source.indexOf("verify-auth-throttle-schema.ts"))
      .toBeLessThan(source.indexOf("prisma migrate deploy"));
    const importPreviewPreflight = source.indexOf(
      "verify-import-preview-schema.ts",
    );
    const migration = source.indexOf("prisma migrate deploy");
    const lifecycleFinalization = source.indexOf(
      "finalize-portco-lifecycle-schema.ts",
    );
    const importPreviewFinal = source.indexOf(
      "verify-import-preview-schema.ts",
      importPreviewPreflight + 1,
    );
    expect(importPreviewPreflight).toBeGreaterThan(
      source.indexOf("verify-auth-throttle-schema.ts"),
    );
    expect(importPreviewPreflight).toBeLessThan(migration);
    expect(lifecycleFinalization).toBeGreaterThan(migration);
    expect(lifecycleFinalization).toBeLessThan(importPreviewFinal);
    expect(importPreviewFinal).toBeGreaterThan(migration);
    expect(source.slice(importPreviewFinal)).toContain("--require-state=final");
    expect(source).toContain("import-preview-schema-preflight.json");
    expect(source).toContain("import-preview-schema-final.json");
    expect(source).not.toContain("source-coverage-report");
    expect(source).not.toContain("company-merge");
    expect(source).not.toContain("citation");
  });

  it("preflights the AuthThrottle catalog before validation migrations", () => {
    const source = workflow("dashboard-validation.yml");
    const preflight = source.indexOf("verify-auth-throttle-schema.ts");
    const deploy = source.indexOf("prisma migrate deploy");
    expect(preflight).toBeGreaterThan(source.indexOf("assert-database-target.ts"));
    expect(preflight).toBeLessThan(deploy);
    expect(source).toContain("auth-throttle-schema-preflight.json");
  });

  it("proves ImportPreview before and after each validation migration pass", () => {
    const source = workflow("dashboard-validation.yml");
    const preflight = source.indexOf("verify-import-preview-schema.ts");
    const deploy = source.indexOf("prisma migrate deploy");
    const lifecycleFinalization = source.indexOf(
      "finalize-portco-lifecycle-schema.ts",
      deploy,
    );
    const finalVerification = source.indexOf(
      "verify-import-preview-schema.ts",
      preflight + 1,
    );
    expect(preflight).toBeGreaterThan(source.indexOf("assert-database-target.ts"));
    expect(preflight).toBeLessThan(deploy);
    expect(lifecycleFinalization).toBeGreaterThan(deploy);
    expect(lifecycleFinalization).toBeLessThan(finalVerification);
    expect(finalVerification).toBeGreaterThan(deploy);
    expect(source.slice(finalVerification)).toContain("--require-state=final");
    expect(source).toContain("import-preview-schema-preflight.json");
    expect(source).toContain("import-preview-schema-final-${pass}.json");
  });

  it("finalizes PortCo lifecycle columns after every migration deploy", () => {
    for (const name of [
      "stage-production-schema.yml",
      "dashboard-validation.yml",
      "fund-refresh-apply.yml",
      "fund-refresh-rollback.yml",
    ]) {
      const source = workflow(name);
      let deploy = source.indexOf("prisma migrate deploy");
      expect(deploy, name).toBeGreaterThanOrEqual(0);
      while (deploy >= 0) {
        const nextDeploy = source.indexOf("prisma migrate deploy", deploy + 1);
        const finalizer = source.indexOf("finalize-portco-lifecycle-schema.ts", deploy);
        expect(finalizer, name).toBeGreaterThan(deploy);
        if (nextDeploy >= 0) expect(finalizer, name).toBeLessThan(nextDeploy);
        deploy = nextDeploy;
      }
    }
  });

  it("promotes and rolls back only verified immutable deployments", () => {
    const release = workflow("release-production.yml");
    const rollback = workflow("rollback-production.yml");
    for (const source of [release, rollback]) {
      expect(source).toContain("--require-immutable-url");
      expect(source).toContain("expected-github-repository-id");
      expect(source).toContain("CANONICAL_PRODUCTION_URL");
      expect(source).toContain("candidate-inspect-before-");
    }
    expect(release).toContain("dashboard:verify -- --require-complete");
    expect(release).toContain("verify-dashboard-health.ts");
    expect(release).toContain("DASHBOARD_RELIABILITY_START_DATE");
    expect(release).toContain('--start-date="$DASHBOARD_RELIABILITY_START_DATE"');
    expect(release.match(/--allow-legacy-root/g)).toHaveLength(2);
    for (const source of [release, rollback]) {
      expect(source).toContain("vercel@51.7.0 link");
      expect(source).toContain("--project \"$EXPECTED_VERCEL_PROJECT_ID\"");
      expect(source).toContain("--transport=vercel-cli");
    }
    expect(release).not.toContain("db:verify");
    expect(release).not.toContain("NEWS_SCAN");
  });
});
