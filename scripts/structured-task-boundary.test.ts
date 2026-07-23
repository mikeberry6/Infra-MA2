import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const TASK_FILES = [
  "prisma/seed.ts",
  "prisma/verify-seed.ts",
  "scripts/cleanup-apollo-argo-conflation.ts",
  "scripts/ingest-ownership-corrections.ts",
  "scripts/manual-merges.ts",
  "scripts/reconcile-portfolio-milestones.ts",
  "scripts/report-company-merge-candidates.ts",
  "scripts/sync-portfolio-investment-years.ts",
  "scripts/sync-weekly-briefing-deals.ts",
] as const;

const PRESERVED_CLEANUP_TASK_FILES = [
  "prisma/seed.ts",
  "prisma/verify-seed.ts",
  "scripts/apply-deal-seller-disclosure-remediation.ts",
  "scripts/apply-fund-primary-source-remediation.ts",
  "scripts/apply-ownership-fund-link-remediation.ts",
  "scripts/apply-primary-citation-remediation.ts",
  "scripts/backfill-dashboard-signal-approvals.ts",
  "scripts/cleanup-apollo-argo-conflation.ts",
  "scripts/create-admin.ts",
  "scripts/dashboard-sync.ts",
  "scripts/dashboard-verify.ts",
  "scripts/ingest-ownership-corrections.ts",
  "scripts/manual-merges.ts",
  "scripts/merge-duplicate-companies.ts",
  "scripts/news-scan.ts",
  "scripts/quarantine-dashboard-methodology-history.ts",
  "scripts/reconcile-portfolio-milestones.ts",
  "scripts/report-company-merge-candidates.ts",
  "scripts/report-deal-seller-disclosure-remediation.ts",
  "scripts/report-fund-primary-source-remediation.ts",
  "scripts/report-ownership-fund-link-remediation.ts",
  "scripts/report-primary-citation-remediation.ts",
  "scripts/source-coverage-report.ts",
  "scripts/sync-portfolio-investment-years.ts",
  "scripts/sync-weekly-briefing-deals.ts",
  "scripts/verify-migration-baseline.ts",
  "scripts/verify-pipeline-health.ts",
] as const;

function source(file: string): string {
  return readFileSync(path.join(process.cwd(), file), "utf8");
}

describe("structured database task boundaries", () => {
  it.each(PRESERVED_CLEANUP_TASK_FILES)(
    "%s preserves the primary task failure across cleanup",
    (file) => {
      const text = source(file);

      expect(text).toContain("runWithPreservedCleanup");
      expect(text).toMatch(/runWithPreservedCleanup\(\{[\s\S]*cleanup:/);
      expect(text).toContain("onSuppressedCleanupError");
    },
  );

  it.each(TASK_FILES)("%s includes client cleanup in the structured task outcome", (file) => {
    const text = source(file);
    const runner = text.indexOf("async function runTask()");
    const disconnect = text.indexOf("$disconnect()", runner);
    const wrapper = text.indexOf("withServerTask(", runner);

    expect(runner).toBeGreaterThanOrEqual(0);
    expect(disconnect).toBeGreaterThan(runner);
    expect(wrapper).toBeGreaterThan(disconnect);
    expect(text.slice(wrapper)).toMatch(/withServerTask\([\s\S]*runTask\)/);
    expect(text.slice(wrapper)).not.toContain(".finally(");
  });

  it("keeps seed and maintenance preflights inside the logged task", () => {
    const seed = source("prisma/seed.ts");
    const cleanup = source("scripts/cleanup-apollo-argo-conflation.ts");
    const report = source("scripts/report-company-merge-candidates.ts");

    expect(seed.indexOf("assertNonProductionSeedTarget();"))
      .toBeGreaterThan(seed.indexOf("async function runTask()"));
    expect(cleanup.indexOf("assertMaintenanceMutationContext()"))
      .toBeGreaterThan(cleanup.indexOf("async function runTask()"));
    expect(report.indexOf('throw new SafeOperationalError("database_url_required")'))
      .toBeGreaterThan(report.indexOf("async function runTask()"));

    for (const text of [seed, cleanup, report]) {
      const runner = text.indexOf("async function runTask()");
      expect(text.indexOf("new PrismaClient(", runner)).toBeGreaterThan(runner);
      expect(text.slice(0, runner)).not.toContain("new PrismaClient(");
    }
  });

  it("allows only explicit unique conflicts to be swallowed during seeding", () => {
    const seed = source("prisma/seed.ts");

    expect(seed).not.toMatch(/catch\s*{/);
    expect(
      seed.match(/if \(!isPrismaUniqueConstraint\(error\)\) throw error;/g) ?? [],
    ).toHaveLength(5);
    expect(seed).toContain("if (!existing) throw error;");
    expect(seed).toMatch(
      /onSuppressedCleanupError:[\s\S]*task: "database_seed_cleanup"[\s\S]*operation: "disconnect_database"/,
    );
  });
});
