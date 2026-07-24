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

  it("collects every strict publication artifact before aggregating failures", () => {
    expect(workflow).toContain("database_status=${PIPESTATUS[0]}");
    expect(workflow).toContain("source_coverage_status=$?");
    expect(workflow).toContain("company_canonical_status=$?");
    expect(workflow).toContain("strict-publication-gate.json");

    const database = workflow.indexOf("database_status=${PIPESTATUS[0]}");
    const sourceCoverage = workflow.indexOf("source_coverage_status=$?", database);
    const companyCanonical = workflow.indexOf("company_canonical_status=$?", sourceCoverage);
    const aggregate = workflow.indexOf('if [ "$database_status" -ne 0 ]', companyCanonical);
    expect(database).toBeGreaterThanOrEqual(0);
    expect(sourceCoverage).toBeGreaterThan(database);
    expect(companyCanonical).toBeGreaterThan(sourceCoverage);
    expect(aggregate).toBeGreaterThan(companyCanonical);
  });

  it("scans required browser reports while adding sparse failure media only when present", () => {
    const validationScan = workflow.indexOf(
      "- name: Prove retained validation evidence contains no validation credential",
    );
    const browserScan = workflow.indexOf(
      "- name: Prove retained browser evidence contains no validation credential",
      validationScan,
    );
    const validationUpload = workflow.indexOf(
      "- name: Upload migration and data evidence",
      browserScan,
    );
    const browserSection = workflow.slice(browserScan, validationUpload);
    const postValidationScan = workflow.slice(validationScan, validationUpload);
    const requiredRoots = [
      "browser-playwright-report",
      "visual-playwright-report",
      "top-level-failure-playwright-report",
      "provider-failure-playwright-report",
    ];
    const optionalRoots = [
      "playwright-report",
      "test-results",
      "browser-test-results",
      "sensitive-browser-test-results",
      "visual-test-results",
      "top-level-failure-test-results",
      "provider-failure-test-results",
    ];
    const scanArgsStart = browserSection.indexOf("scan_args=(");
    const scanArgsEnd = browserSection.indexOf("\n          )", scanArgsStart);
    const requiredScanArgs = browserSection.slice(scanArgsStart, scanArgsEnd);

    expect(scanArgsStart).toBeGreaterThanOrEqual(0);
    expect(scanArgsEnd).toBeGreaterThan(scanArgsStart);
    for (const requiredRoot of requiredRoots) {
      expect(requiredScanArgs).toContain(`--root=${requiredRoot}`);
    }
    for (const optionalRoot of optionalRoots) {
      expect(browserSection).toContain(`\n            ${optionalRoot}`);
      expect(requiredScanArgs).not.toContain(`--root=${optionalRoot}`);
    }

    const optionalLoop = browserSection.indexOf("for optional_root in");
    const existenceGuard = browserSection.indexOf('if [ -e "$optional_root" ]', optionalLoop);
    const guardedAppend = browserSection.indexOf(
      'scan_args+=("--root=$optional_root")',
      existenceGuard,
    );
    expect(optionalLoop).toBeGreaterThanOrEqual(0);
    expect(existenceGuard).toBeGreaterThan(optionalLoop);
    expect(guardedAppend).toBeGreaterThan(existenceGuard);
    expect(browserSection).toContain('"${scan_args[@]}"');

    expect(postValidationScan).toContain(
      "--output=tmp/validation-secret-scans/validation-artifact-secret-safety.json",
    );
    expect(postValidationScan).toContain(
      "--output=tmp/validation-secret-scans/playwright-artifact-secret-safety.json",
    );
    expect(postValidationScan).not.toContain("--output=tmp/ci/");
    expect(validationScan).toBeGreaterThanOrEqual(0);
    expect(browserScan).toBeGreaterThan(validationScan);
    expect(validationUpload).toBeGreaterThan(browserScan);

    const uploadSection = workflow.slice(
      validationUpload,
      workflow.indexOf(
        "- name: Enforce browser, visual, and strict publication gates",
        validationUpload,
      ),
    );
    expect(uploadSection).toContain("path: tmp/ci/");

    const browserUpload = workflow.indexOf(
      "- name: Upload Playwright report and failure media",
      validationUpload,
    );
    const browserUploadEnd = workflow.indexOf("\n  # Branch protection", browserUpload);
    const browserUploadSection = workflow.slice(browserUpload, browserUploadEnd);
    const uploadPathStart = browserUploadSection.indexOf("path: |");
    const uploadPathEnd = browserUploadSection.indexOf(
      "if-no-files-found:",
      uploadPathStart,
    );
    const uploadedRoots = browserUploadSection
      .slice(browserUploadSection.indexOf("\n", uploadPathStart) + 1, uploadPathEnd)
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.endsWith("/"))
      .map((line) => line.slice(0, -1))
      .sort();
    expect(browserUpload).toBeGreaterThan(validationUpload);
    expect(browserUploadEnd).toBeGreaterThan(browserUpload);
    expect(uploadPathStart).toBeGreaterThanOrEqual(0);
    expect(uploadPathEnd).toBeGreaterThan(uploadPathStart);
    expect(uploadedRoots).toEqual([...requiredRoots, ...optionalRoots].sort());
  });
});
