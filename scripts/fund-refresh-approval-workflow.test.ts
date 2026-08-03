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
const proposalValidator = readFileSync(
  resolve(process.cwd(), "scripts/validate-fund-refresh-proposal.ts"),
  "utf8",
);
const proposalApply = readFileSync(
  resolve(process.cwd(), "scripts/apply-fund-refresh.ts"),
  "utf8",
);
const packageScripts = Object.keys(
  JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"))
    .scripts as Record<string, string>,
);

const workflowNpmScripts = (workflow: string) =>
  [...workflow.matchAll(/npm run ([A-Za-z0-9:_-]+)/g)].map((match) => match[1]);

describe("fund refresh owner-operated approval policy", () => {
  it("binds approval to an exact owner comment and immutable proposal identity", () => {
    expect(applyWorkflow).toContain("FUND_REFRESH_REVIEWER_LOGIN");
    expect(applyWorkflow).toContain(
      "FUND_REFRESH_OWNER_PASS pr=${pull_number} head_sha=${reviewedHeadSha}",
    );
    expect(applyWorkflow).toContain("github.rest.issues.listComments");
    expect(applyWorkflow).toContain("github.rest.issues.getComment");
    expect(applyWorkflow).toContain("approval_comment_id");
    expect(applyWorkflow).not.toContain("FUND_REFRESH_PRO_REVIEWER_LOGIN");
    expect(applyWorkflow).not.toContain("FUND_REFRESH_PRO_PASS");
  });

  it("supports an exact later owner revocation", () => {
    expect(applyWorkflow).toContain("FUND_REFRESH_OWNER_REVOKE");
    expect(applyWorkflow).toContain("laterRevocation");
    expect(applyWorkflow).toContain(
      "A later owner revocation invalidates the approval.",
    );
  });

  it("requires an environment reviewer while allowing self-review and blocking administrator bypass", () => {
    for (const workflow of [applyWorkflow, rollbackWorkflow]) {
      expect(workflow).toContain("approvalRule.prevent_self_review !== false");
      expect(workflow).toContain("can_admins_bypass !== false");
      expect(workflow).toContain("approvalRule.reviewers?.length");
    }
  });

  it("only invokes npm scripts that exist and validates Prisma directly", () => {
    for (const workflow of [applyWorkflow, rollbackWorkflow]) {
      for (const script of workflowNpmScripts(workflow)) {
        expect(packageScripts).toContain(script);
      }

      expect(workflow).toContain("npx prisma validate");
      expect(workflow).not.toContain("npm run db:validate");
    }
  });

  it("permits a reviewed data merge recovery only from unchanged data on current main", () => {
    expect(applyWorkflow).toContain("reviewed_merge_sha");
    expect(applyWorkflow).toContain("compareCommitsWithBasehead");
    expect(applyWorkflow).toContain("git merge-base --is-ancestor");
    expect(applyWorkflow).toContain(
      'git diff --quiet "$REVIEWED_MERGE_SHA" "$REVIEWED_COMMIT_SHA"',
    );
    expect(applyWorkflow).toContain(
      'proposal_directory="$(dirname "$REVIEWED_PROPOSAL_PATH")"',
    );
    expect(applyWorkflow).toContain(
      "pr.merge_commit_sha !== process.env.REVIEWED_MERGE_SHA",
    );
    expect(applyWorkflow).toContain(
      "branch.commit.sha !== process.env.HEAD_SHA",
    );
  });

  it("keeps verification-only candidates bound to live state without descriptive mutation", () => {
    expect(proposalValidator).toContain(
      'if (!["CREATE", "UPDATE"].includes(candidate.action)) continue;',
    );
    expect(proposalApply).toContain(
      'item.action === "CREATE" || item.action === "UPDATE"',
    );
    expect(proposalApply).toMatch(
      /candidate\.action === "VERIFY_NO_CHANGE"\s+\? \{ lastVerifiedAt: verifiedAt \}/,
    );
  });
});
