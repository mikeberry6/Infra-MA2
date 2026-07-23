import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");

describe("Phase 2 release gate", () => {
  it("runs on protected main and every active reviewed stack base", () => {
    expect(workflow).toContain('- "main"');
    expect(workflow).toContain('- "codex/infra-90-day-phase-1-stabilize"');
    expect(workflow).toContain('- "codex/infra-90-day-phase-2-data-trust"');
    expect(workflow).toContain('- "codex/infra-90-day-phase-3-product-ux"');
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
      "npm run check:bundle-budget",
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

  it("preserves the Phase 2 trust gates alongside additive later-phase checks", () => {
    expect(workflow).toContain("source-coverage-report");
    expect(workflow).toContain("report-company-merge-candidates");
    expect(workflow).toContain("bundle-budget");
    expect(workflow).toContain("E2E_DATABASE_URL");
    expect(workflow).toContain("playwright install --with-deps chromium");
    expect(workflow).toContain("npm run test:e2e");
  });
});
