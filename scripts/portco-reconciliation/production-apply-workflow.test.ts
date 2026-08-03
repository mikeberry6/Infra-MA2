import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workflowPath = resolve(
  process.cwd(),
  ".github/workflows/portco-reconciliation-apply.yml",
);
const workflow = readFileSync(workflowPath, "utf8");

function position(value: string): number {
  const index = workflow.indexOf(value);
  expect(index, `Expected workflow to contain ${value}`).toBeGreaterThanOrEqual(
    0,
  );
  return index;
}

describe("protected PortCo production apply workflow", () => {
  it("is manual, serialized with schema/promotion, and protected by production approval", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toMatch(/\n\s+push:/);
    expect(workflow).not.toMatch(/\n\s+pull_request:/);
    expect(workflow).not.toMatch(/\n\s+schedule:/);
    expect(workflow).toContain("group: production-release");
    expect(workflow).toContain("cancel-in-progress: false");
    expect(workflow).toContain("environment:\n      name: production");
    expect(workflow).toContain('if [ "$CONFIRMATION" != "APPLY" ]');
  });

  it("binds the write to exact protected-main and deployed release provenance", () => {
    expect(workflow).toContain(
      'if [ "$DISPATCH_REF" != "refs/heads/$DEFAULT_BRANCH" ]',
    );
    expect(workflow).toContain('if [ "$DEFAULT_BRANCH" != "main" ]');
    expect(workflow).toContain("ref: main");
    expect(workflow).toContain("fetch-depth: 0");
    expect(workflow).toContain(
      "git checkout -B main refs/remotes/origin/main",
    );
    expect(workflow).toContain("git branch --set-upstream-to=origin/main main");
    expect(workflow).toContain("git symbolic-ref --short HEAD");
    expect(workflow).toContain("git rev-parse '@{upstream}'");
    expect(workflow).toContain(
      'if [ "$(git rev-parse HEAD)" != "$RELEASE_SHA" ]',
    );
    expect(workflow).toContain("pull_request_number:");
    expect(workflow).toContain(
      "Bind the exact merged pull request to the release SHA",
    );
    expect(workflow).toContain("pr.merge_commit_sha !== expectedReleaseSha");
    expect(workflow).toContain("pr.base.ref !== defaultBranch");
    expect(
      workflow.match(/scripts\/verify-release-provenance\.ts/g),
    ).toHaveLength(2);
    expect(
      workflow.match(/scripts\/verify-vercel-deployment\.ts/g),
    ).toHaveLength(2);
    expect(workflow).toContain("--required-check=build");
    expect(workflow).toContain('--deployment-url="$PRODUCTION_URL"');
    expect(workflow).toContain('--expected-sha="$RELEASE_SHA"');
    expect(workflow).toContain(
      "EXPECTED_GITHUB_REPOSITORY_ID: ${{ github.repository_id }}",
    );
    expect(workflow).toContain(
      "CANONICAL_PRODUCTION_URL: https://infra-ma-2.vercel.app",
    );
    expect(workflow).toContain(
      'if [ "$PRODUCTION_URL" != "$CANONICAL_PRODUCTION_URL" ]',
    );
  });

  it("accepts only one tightly related proposal, approval, and snapshot lineage", () => {
    expect(workflow).toContain(
      "^audits/portco-reconciliation/[0-9]{4}-[0-9]{2}-[0-9]{2}/proposals/[A-Za-z0-9._-]+/proposal\\.json$",
    );
    expect(workflow).toContain(
      'if [ "$APPROVAL_PATH" != "$run_root/approvals/$proposal_key.json" ]',
    );
    expect(workflow).toContain(
      'if [ "$PRODUCTION_SNAPSHOT_PATH" != "$run_root/snapshots/production-snapshot.json" ]',
    );
    for (const hash of [
      "PROPOSAL_SHA256",
      "APPROVAL_SHA256",
      "SNAPSHOT_SHA256",
    ]) {
      expect(workflow).toContain(hash);
    }
    expect(workflow.match(/verify-production-inputs\.ts/g)).toHaveLength(2);
    expect(workflow).toContain('git ls-files --error-unmatch -- "$path"');
    expect(workflow).toContain(
      "SEED_ARTIFACT_PATH: prisma/seed-data/approved-portco-after-images.json",
    );
  });

  it("pins the pooler production database and forbids migration/validation hosts", () => {
    expect(workflow).toContain("DATABASE_URL: ${{ secrets.DATABASE_URL }}");
    expect(workflow).toContain(
      "EXPECTED_DATABASE_HOST: ${{ vars.PRODUCTION_DATABASE_HOST }}",
    );
    expect(workflow).toContain(
      "FORBIDDEN_DATABASE_HOST: ${{ vars.PRODUCTION_MIGRATION_DATABASE_HOST }}",
    );
    expect(workflow).toContain(
      "FORBIDDEN_DATABASE_HOST_2: ${{ vars.MIGRATION_DATABASE_HOST }}",
    );
    expect(workflow).toContain(
      "FORBIDDEN_DATABASE_HOST_3: ${{ vars.DASHBOARD_MIGRATION_DATABASE_HOST }}",
    );
    expect(workflow).toContain('[[ "$EXPECTED_DATABASE_HOST" == *-pooler.* ]]');
    expect(workflow).toContain(
      "node --experimental-strip-types scripts/assert-database-target.ts",
    );
    expect(workflow.match(/npx prisma migrate status/g)).toHaveLength(2);
    expect(workflow.match(/npx prisma migrate diff/g)).toHaveLength(2);
    expect(workflow).not.toContain("prisma migrate deploy");
    expect(workflow).not.toContain("db:seed:apply");
  });

  it("dry-runs before the sole hash-bound transactional apply and saves its receipt", () => {
    const dryRun = position(
      "Dry-run the exact approved proposal against fresh production state",
    );
    const finalGate = position(
      "Final authorization, release, schema, target, and artifact recheck",
    );
    const apply = position(
      "Apply the exact approved PortCo proposal transactionally",
    );
    const receipt = position(
      "Verify receipt and canonical detail API after apply",
    );
    expect(dryRun).toBeLessThan(finalGate);
    expect(finalGate).toBeLessThan(apply);
    expect(apply).toBeLessThan(receipt);
    expect(workflow).toContain(
      "PROTECTED_PRODUCTION_WRITE_APPROVAL_SHA256: ${{ inputs.approval_sha256 }}",
    );
    expect(workflow).toContain("--write-token=APPLY_APPROVED_PORTCO_CHANGE");
    expect(workflow).toContain('--receipt="$receipt"');
    expect(workflow).toContain(
      '--public-base-url="${PRODUCTION_URL}${PUBLIC_BASE_PATH}/"',
    );
    expect(workflow).toContain("verify-production-receipt.ts");
    expect(workflow).toContain("tmp/portco-reconciliation/production/");
    expect(workflow).toContain("retention-days: 90");
    expect(workflow).not.toContain("vercel promote");
  });
});
