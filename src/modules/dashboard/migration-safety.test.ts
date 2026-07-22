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

  it("never auto-approves legacy signals during schema staging", () => {
    const stageWorkflow = readFileSync(path.join(
      process.cwd(),
      ".github/workflows/stage-production-schema.yml",
    ), "utf8");
    const packageJson = readFileSync(path.join(process.cwd(), "package.json"), "utf8");

    expect(stageWorkflow).toContain("npx prisma migrate deploy");
    expect(stageWorkflow).not.toContain("backfill-signal-approvals");
    expect(packageJson).not.toContain("backfill-signal-approvals");
  });
});
