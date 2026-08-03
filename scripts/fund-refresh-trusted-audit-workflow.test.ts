import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  resolve(process.cwd(), ".github/workflows/fund-refresh-trusted-audit.yml"),
  "utf8",
);

describe("trusted fund-refresh audit workflow", () => {
  it("is an explicit read-only default-branch workflow", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("commit_sha:");
    expect(workflow).toContain("actions: read");
    expect(workflow).toContain("contents: read");
    expect(workflow).not.toContain("pull_request:");
    expect(workflow).not.toContain("push:");
  });

  it("binds the audit to the production database identifiers", () => {
    expect(workflow).toContain("DATABASE_URL: ${{ secrets.DATABASE_URL }}");
    expect(workflow).toContain("EXPECTED_DATABASE_HOST: ${{ vars.PRODUCTION_DATABASE_HOST }}");
    expect(workflow).toContain("EXPECTED_DATABASE_NAME: ${{ vars.PRODUCTION_DATABASE_NAME }}");
    expect(workflow).toContain("scripts/assert-database-target.ts");
  });

  it("captures complete live and ownership snapshots without a write path", () => {
    expect(workflow).toContain("--include-live-snapshots");
    expect(workflow).toContain("liveDatabaseFingerprint");
    expect(workflow).toContain("ownershipFingerprint");
    expect(workflow).not.toContain("--apply");
    expect(workflow).not.toContain("prisma migrate");
    expect(workflow).not.toContain("db:seed");
  });

  it("uploads an immutable commit-bound audit artifact", () => {
    expect(workflow).toContain("fund-refresh-trusted-audit-${{ inputs.commit_sha }}-${{ github.run_id }}");
    expect(workflow).toContain("retention-days: 30");
  });
});
