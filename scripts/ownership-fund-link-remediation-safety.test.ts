import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const applySource = readFileSync(
  path.join(process.cwd(), "scripts", "apply-ownership-fund-link-remediation.ts"),
  "utf8",
);
const reportSource = readFileSync(
  path.join(process.cwd(), "scripts", "report-ownership-fund-link-remediation.ts"),
  "utf8",
);
const outputSafetySource = readFileSync(
  path.join(process.cwd(), "src", "lib", "reviewer-neutral-output.ts"),
  "utf8",
);

describe("ownership-fund remediation script safety", () => {
  it("binds apply to the canonical approval bytes committed at RELEASE_SHA", () => {
    expect(applySource).toContain("OWNERSHIP_FUND_LINK_APPROVAL_REPOSITORY_PATH");
    expect(applySource).toContain('["show", `${input.context.releaseSha}:${OWNERSHIP_FUND_LINK_APPROVAL_REPOSITORY_PATH}`]');
    expect(applySource).toContain("raw.equals(committed)");
    expect(applySource).toContain("verifyExactOwnershipFundLinkSha256(raw, input.expectedSha256)");
  });

  it("requires every mutation gate before constructing Prisma", () => {
    const applyFlag = applySource.indexOf('includes("--apply")');
    const maintenance = applySource.indexOf("assertMaintenanceMutationContext()");
    const reviewer = applySource.indexOf("assertApprovalReviewerMatchesMutationContext(");
    const client = applySource.indexOf("new PrismaClient(");
    expect(applyFlag).toBeGreaterThan(-1);
    expect(maintenance).toBeGreaterThan(applyFlag);
    expect(reviewer).toBeGreaterThan(maintenance);
    expect(client).toBeGreaterThan(reviewer);
  });

  it("uses one serializable transaction for apply", () => {
    expect(applySource).toContain("await prisma.$transaction(");
    expect(applySource).toContain('isolationLevel: "Serializable"');
  });

  it("confines neutral templates to tmp and refuses overwrites", () => {
    expect(reportSource).toContain("prepareReviewerNeutralJsonOutput");
    expect(outputSafetySource).toContain('path.join(repositoryRoot, "tmp")');
    expect(outputSafetySource).toContain('path.extname(outputPath) !== ".json"');
    expect(outputSafetySource).toContain("stats.isSymbolicLink()");
    expect(outputSafetySource).toContain("realpath(path.dirname(outputPath))");
    expect(outputSafetySource).toContain("constants.O_EXCL");
    expect(outputSafetySource).toContain("constants.O_NOFOLLOW");
    expect(reportSource).not.toContain("process.stdout.write(json)");
  });
});
