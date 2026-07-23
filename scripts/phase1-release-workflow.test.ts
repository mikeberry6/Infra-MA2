import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");

describe("Phase 1 baseline inside the current release gate", () => {
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
    expect(workflow).toContain("MIGRATION_DATABASE_URL");
    expect(workflow).toContain("MIGRATION_DATABASE_HOST");
    expect(workflow).toContain("MIGRATION_DATABASE_NAME");
    expect(workflow).toContain("PRODUCTION_DATABASE_HOST");
    expect(workflow).toContain("audit-additive-migrations.ts");
    expect(workflow).toContain("reconcile-validation-migration-lineage.ts");
    expect(workflow).toContain("validation-migration-lineage.json");
    expect(workflow).toContain("prisma migrate deploy");
    expect(workflow).toContain("prisma migrate status");
    expect(workflow).toContain("--to-config-datasource");

    const targetGuard = workflow.indexOf("scripts/assert-database-target.ts");
    const reconciliation = workflow.indexOf("scripts/reconcile-validation-migration-lineage.ts");
    const deploy = workflow.indexOf("prisma migrate deploy");
    const status = workflow.indexOf("prisma migrate status");
    const drift = workflow.indexOf("--to-config-datasource", status);
    expect(reconciliation).toBeGreaterThan(targetGuard);
    expect(deploy).toBeGreaterThan(reconciliation);
    expect(status).toBeGreaterThan(deploy);
    expect(drift).toBeGreaterThan(status);
  });

  it("keeps the protected build check red unless static, migration, and data gates pass", () => {
    expect(workflow).toContain("quality:");
    expect(workflow).toContain("validation:");
    expect(workflow).toContain("needs: [quality, validation]");
    expect(workflow).toContain("QUALITY_RESULT: ${{ needs.quality.result }}");
    expect(workflow).toContain("VALIDATION_RESULT: ${{ needs.validation.result }}");
    expect(workflow).toContain(
      'if [ "$QUALITY_RESULT" != "success" ] || [ "$VALIDATION_RESULT" != "success" ]; then',
    );
  });

  it("retains editorial/browser gates and adds the Phase 4 performance gate", () => {
    expect(workflow).toContain("source-coverage-report");
    expect(workflow).toContain("report-company-merge-candidates");
    expect(workflow).toContain("playwright");
    expect(workflow).toContain("visual-regression.spec.ts");
    expect(workflow).toContain("check:bundle-budget");
  });
});
