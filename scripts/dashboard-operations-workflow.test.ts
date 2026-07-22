import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = (name: string) => readFileSync(`.github/workflows/${name}`, "utf8");

describe("focused dashboard operations workflows", () => {
  it("schedules a DST-safe weekday refresh and read-only source audit", () => {
    const source = workflow("data-pipelines.yml");
    expect(source).toContain('cron: "30 11 * * 1-5"');
    expect(source).toContain('cron: "30 12 * * 1-5"');
    expect(source).toContain("TZ=America/New_York");
    expect(source).toContain("DASHBOARD_WRITES_ENABLED");
    expect(source).toContain("dashboard:sync:dry-run");
    expect(source).toContain("verify-dashboard-health.ts");
    expect(source).toContain("--min-success-rate=0.95");
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
    expect(source).not.toContain("source-coverage-report");
    expect(source).not.toContain("company-merge");
    expect(source).not.toContain("citation");
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
    expect(release).not.toContain("db:verify");
    expect(release).not.toContain("NEWS_SCAN");
  });
});
