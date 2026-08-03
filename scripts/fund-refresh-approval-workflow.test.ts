import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const applyWorkflow = readFileSync(
  resolve(process.cwd(), ".github/workflows/fund-refresh-apply.yml"),
  "utf8",
);
const rollbackWorkflow = readFileSync(
  resolve(process.cwd(), ".github/workflows/fund-refresh-rollback.yml"),
  "utf8",
);

describe("fund refresh owner-operated approval policy", () => {
  it("binds approval to an exact owner comment and immutable proposal identity", () => {
    expect(applyWorkflow).toContain("FUND_REFRESH_REVIEWER_LOGIN");
    expect(applyWorkflow).toContain("FUND_REFRESH_OWNER_PASS pr=${pull_number} head_sha=${reviewedHeadSha}");
    expect(applyWorkflow).toContain("github.rest.issues.listComments");
    expect(applyWorkflow).toContain("github.rest.issues.getComment");
    expect(applyWorkflow).toContain("approval_comment_id");
    expect(applyWorkflow).not.toContain("FUND_REFRESH_PRO_REVIEWER_LOGIN");
    expect(applyWorkflow).not.toContain("FUND_REFRESH_PRO_PASS");
  });

  it("supports an exact later owner revocation", () => {
    expect(applyWorkflow).toContain("FUND_REFRESH_OWNER_REVOKE");
    expect(applyWorkflow).toContain("laterRevocation");
    expect(applyWorkflow).toContain("A later owner revocation invalidates the approval.");
  });

  it("requires an environment reviewer while allowing self-review and blocking administrator bypass", () => {
    for (const workflow of [applyWorkflow, rollbackWorkflow]) {
      expect(workflow).toContain("approvalRule.prevent_self_review !== false");
      expect(workflow).toContain("can_admins_bypass !== false");
      expect(workflow).toContain("approvalRule.reviewers?.length");
    }
  });
});
