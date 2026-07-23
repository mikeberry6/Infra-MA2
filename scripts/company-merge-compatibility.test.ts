import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");

describe("company merge rollback compatibility", () => {
  it("logically retires reviewed duplicate IDs without deleting their Phase 1 fallback rows", () => {
    const merge = read("scripts/merge-duplicate-companies.ts");
    const legacy = read("scripts/manual-merges.ts");

    expect(merge).toContain("compatibilityRowsPreserved");
    expect(merge).toContain("excludeRedirectedCompanies(companies, redirects)");
    expect(merge).not.toContain("tx.company.deleteMany");
    expect(merge).not.toContain("tx.company.delete(");
    expect(legacy).not.toContain("tx.company.deleteMany");
    expect(legacy).not.toContain("tx.company.delete(");
    expect(legacy).not.toContain("prisma.$transaction");
  });

  it("excludes logically retired rows from canonical reports and public list reads", () => {
    const report = read("scripts/report-company-merge-candidates.ts");
    const queries = read("src/modules/companies/queries.ts");

    expect(report).toContain("...ACTIVE_COMPANY_WHERE");
    expect(queries).toContain('import { ACTIVE_COMPANY_WHERE } from "@/modules/companies/retirement"');
    expect(queries.match(/\.\.\.ACTIVE_COMPANY_WHERE/g)?.length).toBeGreaterThanOrEqual(5);
    expect(queries.indexOf("prisma.companyRedirect.findUnique"))
      .toBeLessThan(queries.indexOf("const direct = redirect ? null"));
  });

  it("filters every direct public, trust, scan, and legacy maintenance Company consumer", () => {
    for (const file of [
      "src/modules/search/queries.ts",
      "src/modules/insights/queries.ts",
      "src/modules/funds/queries.ts",
      "src/modules/operations/source-coverage.ts",
      "src/modules/operations/ownership-fund-link-remediation.ts",
      "scripts/source-coverage-report.ts",
      "scripts/news-scan.ts",
      "scripts/reconcile-portfolio-milestones.ts",
      "scripts/ingest-ownership-corrections.ts",
      "scripts/sync-portfolio-investment-years.ts",
      "prisma/verify-seed.ts",
    ]) {
      expect(read(file), file).toContain("ACTIVE_COMPANY_WHERE");
    }
  });

  it("prevents ordinary seed runs from reattaching data to retired company rows", () => {
    const seed = read("prisma/seed.ts");

    expect(seed).toContain("const canonicalSeedMode = existingRedirects.length > 0");
    expect(seed).toContain("redirectByExactSeedKey");
    expect(seed).toContain("companyDedupKeys(pc.name)");
    expect(seed).toContain("candidates.size !== 1");
    expect(seed).toContain("no reviewed canonical destination after CompanyRedirect state exists");
  });

  it("locks rollback-sensitive admin edits for retired IDs and canonical survivors", () => {
    const actions = read("src/modules/admin/actions.ts");
    const listPage = read("src/app/admin/companies/page.tsx");
    const editPage = read("src/app/admin/companies/[id]/edit/page.tsx");

    expect(actions.match(/\.\.\.MUTABLE_COMPANY_WHERE/g)?.length).toBeGreaterThanOrEqual(8);
    expect(listPage).toContain("Merge survivor · compatibility locked");
    expect(listPage).toContain("_count: { select: { redirects: true } }");
    expect(editPage).toContain("MUTABLE_COMPANY_WHERE");
  });

  it("enforces compatibility-row retention at the database boundary", () => {
    const schema = read("prisma/schema.prisma");
    const migration = read(
      "prisma/migrations/20260722221000_data_trust_foundations/migration.sql",
    );

    expect(schema).toContain('@relation("CompanyRedirectRetired", fields: [retiredId]');
    expect(schema).toContain('@relation("CompanyRedirectCanonical", fields: [companyId], references: [id], onDelete: Restrict)');
    expect(migration).toContain(
      'FOREIGN KEY ("retiredId") REFERENCES "Company"("id") ON DELETE RESTRICT',
    );
    expect(migration).toContain(
      'FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT',
    );
  });
});
