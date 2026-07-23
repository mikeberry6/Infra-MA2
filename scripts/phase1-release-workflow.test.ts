import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");

describe("Phase 1 release gate", () => {
  it("pins Node 24 and executes the complete clean-checkout quality gate", () => {
    expect(workflow.match(/node-version: "24"/g)).toHaveLength(2);
    for (const contract of [
      "npm ci",
      "npm run db:generate",
      "npm run db:validate",
      "npm run lint",
      "npm run typecheck",
      "npm test",
      "npm run validate-portfolios",
      "npm audit --audit-level=high",
      "npm run audit:prod",
      "npm run build",
    ]) {
      expect(workflow).toContain(contract);
    }
  });

  it("validates additive migrations and drift only on the isolated database", () => {
    expect(workflow).toContain("PHASE1_MIGRATION_DATABASE_URL");
    expect(workflow).toContain("PHASE1_MIGRATION_DATABASE_HOST");
    expect(workflow).toContain("PHASE1_MIGRATION_DATABASE_NAME");
    expect(workflow).toContain("PRODUCTION_DATABASE_HOST");
    expect(workflow).toContain("audit-additive-migrations.ts");
    expect(workflow).toContain("prisma migrate deploy");
    expect(workflow).toContain("prisma migrate status");
    expect(workflow).toContain("--to-config-datasource");
  });

  it("keeps the protected build check red unless static and migration gates pass", () => {
    expect(workflow).toContain("quality:");
    expect(workflow).toContain("migration-validation:");
    expect(workflow).toContain("needs: [quality, migration-validation]");
    expect(workflow).toContain(
      "QUALITY_OUTCOME: ${{ needs.quality.result }}",
    );
    expect(workflow).toContain(
      "MIGRATION_OUTCOME: ${{ needs.migration-validation.result }}",
    );
    expect(workflow).toContain(
      'if [ "$QUALITY_OUTCOME" != "success" ] || [ "$MIGRATION_OUTCOME" != "success" ]; then',
    );
  });

  it("does not pull later-phase editorial, browser, analytics, or health gates into Phase 1", () => {
    for (const laterPhaseContract of [
      "source-coverage-report",
      "report-company-merge-candidates",
      "playwright",
      "bundle-budget",
      "/api/health",
    ]) {
      expect(workflow).not.toContain(laterPhaseContract);
    }
  });
});
