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

  it("runs the bounded legacy-signal approval backfill immediately after migration", () => {
    const stageWorkflow = readFileSync(path.join(
      process.cwd(),
      ".github/workflows/stage-production-schema.yml",
    ), "utf8");

    expect(stageWorkflow).toContain("npx prisma migrate deploy");
    expect(stageWorkflow).toContain("npx tsx scripts/quarantine-dashboard-methodology-history.ts");
    expect(stageWorkflow).toContain("npx tsx scripts/backfill-dashboard-signal-approvals.ts");
    expect(stageWorkflow.indexOf("npx tsx scripts/quarantine-dashboard-methodology-history.ts"))
      .toBeGreaterThan(stageWorkflow.indexOf("npx prisma migrate deploy"));
    expect(stageWorkflow.indexOf("npx tsx scripts/backfill-dashboard-signal-approvals.ts"))
      .toBeGreaterThan(stageWorkflow.indexOf("npx tsx scripts/quarantine-dashboard-methodology-history.ts"));
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
    }
  });
});
