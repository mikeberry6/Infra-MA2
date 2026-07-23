import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const applySource = readFileSync(
  path.join(process.cwd(), "scripts", "apply-deal-seller-disclosure-remediation.ts"),
  "utf8",
);
const reportSource = readFileSync(
  path.join(process.cwd(), "scripts", "report-deal-seller-disclosure-remediation.ts"),
  "utf8",
);
const stageWorkflow = readFileSync(
  path.join(process.cwd(), ".github", "workflows", "stage-production-schema.yml"),
  "utf8",
);
const releaseWorkflow = readFileSync(
  path.join(process.cwd(), ".github", "workflows", "release-production.yml"),
  "utf8",
);
const remediationWorkflow = readFileSync(
  path.join(process.cwd(), ".github", "workflows", "remediate-production-data.yml"),
  "utf8",
);

describe("deal seller-disclosure remediation script safety", () => {
  it("binds apply to canonical approval bytes committed at RELEASE_SHA", () => {
    expect(applySource).toContain("DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH");
    expect(applySource).toContain(
      '["show", `${input.context.releaseSha}:${DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH}`]',
    );
    expect(applySource).toContain("raw.equals(committed)");
    expect(applySource).toContain(
      "verifyExactDealSellerDisclosureSha256(raw, input.expectedSha256)",
    );
  });

  it("requires all mutation guards before constructing Prisma", () => {
    const applyFlag = applySource.indexOf('includes("--apply")');
    const maintenance = applySource.indexOf("assertMaintenanceMutationContext()");
    const reviewer = applySource.indexOf("assertApprovalReviewerMatchesMutationContext(");
    const client = applySource.indexOf("new PrismaClient(");
    expect(applyFlag).toBeGreaterThan(-1);
    expect(maintenance).toBeGreaterThan(applyFlag);
    expect(reviewer).toBeGreaterThan(maintenance);
    expect(client).toBeGreaterThan(reviewer);
  });

  it("uses one serializable transaction and a reviewer-neutral tmp-only report", () => {
    expect(applySource).toContain("await prisma.$transaction(");
    expect(applySource).toContain('isolationLevel: "Serializable"');
    expect(reportSource).toContain("prepareReviewerNeutralJsonOutput");
    expect(reportSource).not.toContain("process.stdout.write(json)");
    expect(reportSource).toContain("decisionStatus and decisionReason");
  });

  it("emits neutral seller-disclosure evidence during schema staging and release", () => {
    expect(stageWorkflow).toContain("scripts/report-deal-seller-disclosure-remediation.ts");
    expect(stageWorkflow).toContain("tmp/schema-stage/deal-seller-disclosure-approval-template.json");
    expect(releaseWorkflow).toContain("scripts/report-deal-seller-disclosure-remediation.ts");
    expect(releaseWorkflow).toContain("tmp/release/deal-seller-disclosure-approval-template.json");
    expect(releaseWorkflow.indexOf("scripts/report-deal-seller-disclosure-remediation.ts"))
      .toBeLessThan(releaseWorkflow.indexOf("npm run db:verify"));
  });

  it("isolates the post-remediation seller report from failures in unrelated reports", () => {
    const sellerReportStep = remediationWorkflow.indexOf(
      "- name: Record the current deal seller-disclosure backlog",
    );
    const generalReportStep = remediationWorkflow.indexOf(
      "- name: Generate reviewer-neutral current-state reports",
    );
    expect(sellerReportStep).toBeGreaterThan(-1);
    expect(generalReportStep).toBeGreaterThan(sellerReportStep);
    expect(
      remediationWorkflow.indexOf(
        "scripts/report-deal-seller-disclosure-remediation.ts",
        sellerReportStep,
      ),
    ).toBeLessThan(generalReportStep);
  });
});
