import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { auditAdditiveMigrationSql } from "@/lib/migration-safety";

describe("dashboard recurring-source migration", () => {
  it("is additive, constrains metric status, and defaults new signals to pending", () => {
    const migration = readFileSync(path.join(
      process.cwd(),
      "prisma/migrations/20260722190000_dashboard_recurring_sources/migration.sql",
    ), "utf8");

    expect(migration).toContain("DEFAULT 'PENDING'");
    expect(migration).not.toMatch(/(?:^|;)\s*UPDATE\s+/im);
    expect(migration).not.toMatch(/ALTER\s+COLUMN/i);
    expect(migration).toContain('CONSTRAINT "DashboardMetricDefinition_status_check"');
    expect(migration).toContain("CHECK (\"status\" IN ('ACTIVE', 'ROADMAP'))");
    expect(auditAdditiveMigrationSql(migration)).toEqual([]);
  });

  it("generates reviewer-neutral cutover manifests after migration without applying data changes", () => {
    const stageWorkflow = readFileSync(path.join(
      process.cwd(),
      ".github/workflows/stage-production-schema.yml",
    ), "utf8");

    expect(stageWorkflow).toContain("./node_modules/.bin/prisma migrate deploy");
    expect(stageWorkflow).toContain("dashboard-methodology-cutover-approval-template.json");
    expect(stageWorkflow).toContain("dashboard-signal-backfill-approval-template.json");
    expect(stageWorkflow).not.toMatch(/quarantine-dashboard-methodology-history\.ts[\s\S]{0,120}--(?:apply|rollback)/);
    expect(stageWorkflow).not.toMatch(/backfill-dashboard-signal-approvals\.ts[\s\S]{0,120}--(?:apply|rollback)/);
    expect(stageWorkflow.indexOf("dashboard-methodology-cutover-approval-template.json"))
      .toBeGreaterThan(stageWorkflow.indexOf("./node_modules/.bin/prisma migrate deploy"));
  });

  it("gives remote cutover transactions an explicit bounded timeout", () => {
    for (const script of [
      "scripts/quarantine-dashboard-methodology-history.ts",
      "scripts/backfill-dashboard-signal-approvals.ts",
    ]) {
      const contents = readFileSync(path.join(process.cwd(), script), "utf8");
      expect(contents).toContain('isolationLevel: "Serializable"');
      expect(contents).toContain("maxWait: 15_000");
      expect(contents).toContain("timeout: 120_000");
      expect(contents).toContain("updatedAt: new Date(item.updatedAtBefore)");
      const guardCall = 'mode === "report" ? null : assertMaintenanceMutationContext()';
      expect(contents).toContain(guardCall);
      expect(contents.indexOf(guardCall))
        .toBeLessThan(contents.indexOf("const prisma = createPrisma()"));
    }
  });
});
