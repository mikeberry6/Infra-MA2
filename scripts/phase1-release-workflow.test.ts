import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");

describe("Phase 2 release gate", () => {
  it("runs on protected main and the reviewed Phase 1 stack base", () => {
    expect(workflow).toContain('branches: ["main", "codex/infra-90-day-phase-1-stabilize"]');
  });

  it("preserves the Node 24 clean-checkout quality baseline", () => {
    expect(workflow.match(/node-version: "24"/g)).toHaveLength(2);
    for (const contract of [
      "npm ci",
      "npm run db:generate",
      "npm run db:validate",
      "npm run lint",
      "npm run typecheck",
      "npm run typecheck:scripts",
      "npm test",
      "npm run validate-portfolios",
      "npm run audit:prod",
      "npm run build",
    ]) {
      expect(workflow).toContain(contract);
    }
  });

  it("validates additive migrations and drift only on the isolated database", () => {
    expect(workflow).toContain("PHASE2_MIGRATION_DATABASE_URL");
    expect(workflow).toContain("PHASE2_MIGRATION_DATABASE_HOST");
    expect(workflow).toContain("PHASE2_MIGRATION_DATABASE_NAME");
    expect(workflow).toContain("PRODUCTION_DATABASE_HOST");
    expect(workflow).toContain("audit-additive-migrations.ts");
    expect(workflow).toContain("prisma migrate deploy");
    expect(workflow).toContain("prisma migrate status");
    expect(workflow).toContain("--to-config-datasource");
  });

  it("adds Phase 2 trust gates without pulling in Phase 3 or Phase 4 contracts", () => {
    expect(workflow).toContain("source-coverage-report");
    expect(workflow).toContain("report-company-merge-candidates");
    for (const laterPhaseContract of [
      "playwright",
      "bundle-budget",
      "/api/health",
    ]) {
      expect(workflow).not.toContain(laterPhaseContract);
    }
  });
});
