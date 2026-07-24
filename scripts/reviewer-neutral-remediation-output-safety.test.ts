import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

const citationReport = source("scripts/report-primary-citation-remediation.ts");
const citationWorksheet = source("scripts/build-primary-citation-review-worksheet.ts");
const citationCompiler = source("scripts/compile-primary-citation-review-approval.ts");
const citationApply = source("scripts/apply-primary-citation-remediation.ts");
const citationModule = source("src/modules/operations/primary-citation-remediation.ts");
const citationWorksheetModule = source(
  "src/modules/operations/primary-citation-review-worksheet.ts",
);
const packageJson = source("package.json");
const companyReport = source("scripts/report-company-merge-candidates.ts");
const outputBoundary = source("src/lib/reviewer-neutral-output.ts");
const validationWorkflow = source(".github/workflows/deploy.yml");
const stageWorkflow = source(".github/workflows/stage-production-schema.yml");
const releaseWorkflow = source(".github/workflows/release-production.yml");
const remediationWorkflow = source(".github/workflows/remediate-production-data.yml");

describe("remaining reviewer-neutral remediation output contracts", () => {
  it.each([
    ["primary-citation", citationReport],
    ["company-merge", companyReport],
  ])("%s templates use the shared tmp-only, no-overwrite boundary", (_label, report) => {
    expect(report).toContain("prepareReviewerNeutralJsonOutput");
    expect(report).not.toContain("process.stdout.write(json)");
    expect(report).not.toMatch(/\bwriteFile\(/);
  });

  it("keeps the shared boundary fail-closed against traversal, symlinks, and overwrites", () => {
    expect(outputBoundary).toContain('path.join(repositoryRoot, "tmp")');
    expect(outputBoundary).toContain('path.extname(outputPath) !== ".json"');
    expect(outputBoundary).toContain("stats.isSymbolicLink()");
    expect(outputBoundary).toContain("realpath(path.dirname(outputPath))");
    expect(outputBoundary).toContain("constants.O_EXCL");
    expect(outputBoundary).toContain("constants.O_NOFOLLOW");
  });

  it("uses only ignored tmp destinations in every protected workflow", () => {
    for (const workflow of [
      validationWorkflow,
      stageWorkflow,
      releaseWorkflow,
      remediationWorkflow,
    ]) {
      for (const line of workflow.split("\n").filter(
        (candidate) => candidate.includes("primary-citation-approval-template.json")
          || candidate.includes("primary-citation-review-worksheet.json")
          || candidate.includes("company-merge-approval-template.json"),
      )) {
        expect(line).toMatch(/tmp\//);
        expect(line).not.toMatch(/audits\/approvals\//);
      }
    }
  });

  it.each([
    ["validation", validationWorkflow, "tmp/ci/primary-citation-review-worksheet.json"],
    ["schema stage", stageWorkflow, "tmp/schema-stage/primary-citation-review-worksheet.json"],
    ["release", releaseWorkflow, "tmp/release/primary-citation-review-worksheet.json"],
    ["remediation", remediationWorkflow, "tmp/remediation/primary-citation-review-worksheet.json"],
  ])("emits the hash-bound worksheet in the %s evidence packet", (_label, workflow, output) => {
    expect(workflow).toContain("scripts/build-primary-citation-review-worksheet.ts");
    expect(workflow).toContain(`--output=${output}`);
  });

  it("keeps every generated decision field explicitly neutral", () => {
    expect(citationReport).toContain("buildPrimaryCitationApprovalTemplate");
    expect(citationModule).toContain("selectedCitationId: null");
    expect(companyReport).toContain("canonicalId: null");
    expect(companyReport).toContain("retiredIds: []");
  });

  it("keeps worksheet generation and compilation database-free and tmp-only", () => {
    expect(citationWorksheet).toContain("prepareReviewerNeutralJsonOutput");
    expect(citationCompiler).toContain("prepareProtectedTemporaryJsonOutput");
    for (const script of [citationWorksheet, citationCompiler]) {
      expect(script).not.toContain("PrismaClient");
      expect(script).not.toContain("DATABASE_URL");
      expect(script).not.toMatch(/\bwriteFile\(/);
      expect(script).not.toContain("audits/approvals/primary-citations.json");
    }
    expect(citationWorksheet).toContain(
      'const DEFAULT_OUTPUT = "tmp/primary-citation-review-worksheet.json"',
    );
    expect(citationCompiler).toContain(
      'const DEFAULT_OUTPUT = "tmp/primary-citation-reviewed-approval.json"',
    );
    expect(packageJson).toContain('"db:citations:worksheet"');
    expect(packageJson).toContain('"db:citations:compile-review"');
  });

  it("strictly parses exact approval bytes again at the production apply boundary", () => {
    expect(citationApply).toContain(
      "parseReviewedPrimaryCitationApprovalBytes(raw)",
    );
    expect(citationApply).not.toContain("JSON.parse");
  });

  it("keeps the worksheet distinct, hash-bound, and unselected by default", () => {
    expect(citationWorksheetModule).toContain(
      "PRIMARY_CITATION_SEMANTIC_REVIEW_WORKSHEET",
    );
    expect(citationWorksheetModule).toContain(
      "sourceTemplateSha256",
    );
    expect(citationWorksheetModule).toContain("selectedGroupKey: null");
    expect(citationWorksheetModule).toContain(
      "parseReviewedPrimaryCitationApproval",
    );
  });
});
