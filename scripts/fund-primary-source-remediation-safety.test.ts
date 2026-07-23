import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(
  path.join(process.cwd(), relativePath),
  "utf8",
);

const applySource = read("scripts/apply-fund-primary-source-remediation.ts");
const reportSource = read("scripts/report-fund-primary-source-remediation.ts");
const moduleSource = read("src/modules/operations/fund-primary-source-remediation.ts");
const validationWorkflow = read(".github/workflows/deploy.yml");
const stageWorkflow = read(".github/workflows/stage-production-schema.yml");
const releaseWorkflow = read(".github/workflows/release-production.yml");
const remediationWorkflow = read(".github/workflows/remediate-production-data.yml");

describe("Fund primary-source remediation safety contract", () => {
  it("binds apply to canonical approval bytes committed at RELEASE_SHA", () => {
    expect(applySource).toContain("FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH");
    expect(applySource).toContain(
      '["show", `${input.context.releaseSha}:${FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH}`]',
    );
    expect(applySource).toContain("raw.equals(committed)");
    expect(applySource).toContain("verifyExactFundPrimarySourceSha256(raw, input.expectedSha256)");
  });

  it("requires explicit mutation guards before constructing Prisma", () => {
    const applyFlag = applySource.indexOf('includes("--apply")');
    const maintenance = applySource.indexOf("assertMaintenanceMutationContext()");
    const reviewer = applySource.indexOf("assertApprovalReviewerMatchesMutationContext(");
    const client = applySource.indexOf("new PrismaClient(");
    expect(applyFlag).toBeGreaterThan(-1);
    expect(maintenance).toBeGreaterThan(applyFlag);
    expect(reviewer).toBeGreaterThan(maintenance);
    expect(client).toBeGreaterThan(reviewer);
  });

  it("keeps report output neutral, HTTP-only, and confined to ignored tmp", () => {
    expect(reportSource).toContain("prepareReviewerNeutralJsonOutput");
    expect(reportSource).not.toContain("process.stdout.write(json)");
    expect(moduleSource).toContain("selectedPrimarySourceUrl: null");
    expect(moduleSource).toContain("isHttpUrl(sourceUrl)");
    expect(moduleSource).not.toMatch(/selectedPrimarySourceUrl:\s*(?:fund\.|candidate)/);
  });

  it("runs an exact serializable transaction with complete audit provenance", () => {
    expect(applySource).toContain("await prisma.$transaction(");
    expect(applySource).toContain('isolationLevel: "Serializable"');
    expect(moduleSource).toContain("approvalSha256,");
    expect(moduleSource).toContain("reviewedBy: approval.reviewedBy");
    expect(moduleSource).toContain("executedBy: context.reviewedBy");
    expect(moduleSource).toContain("mutationReason: context.reason");
    expect(moduleSource).toContain("releaseSha: context.releaseSha");
    expect(moduleSource).toContain("targetDatabase: context.targetDatabase");
    expect(moduleSource).toContain("targetFundLegacyId: item.legacyId");
  });

  it("applies reviewed validation data before strict gates or generates a neutral template", () => {
    expect(validationWorkflow).toContain('fund_primary_source_approval="audits/approvals/fund-primary-sources.json"');
    expect(validationWorkflow).toContain("scripts/apply-fund-primary-source-remediation.ts");
    expect(validationWorkflow).toContain("tmp/ci/fund-primary-source-approval-template.json");
    expect(validationWorkflow.indexOf("scripts/apply-fund-primary-source-remediation.ts"))
      .toBeLessThan(validationWorkflow.indexOf("npm run db:verify"));
  });

  it("emits stage/release evidence and exposes one protected apply operation", () => {
    expect(stageWorkflow).toContain("tmp/schema-stage/fund-primary-source-approval-template.json");
    expect(releaseWorkflow).toContain("tmp/release/fund-primary-source-approval-template.json");
    expect(releaseWorkflow.indexOf("scripts/report-fund-primary-source-remediation.ts"))
      .toBeLessThan(releaseWorkflow.indexOf("npm run db:verify"));
    expect(remediationWorkflow).toContain("apply-fund-primary-sources");
    expect(remediationWorkflow).toContain("scripts/apply-fund-primary-source-remediation.ts");
    expect(remediationWorkflow).toContain("tmp/remediation/fund-primary-source-approval-template.json");
  });
});
