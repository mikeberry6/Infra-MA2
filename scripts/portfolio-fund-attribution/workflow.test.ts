import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  resolve(process.cwd(), ".github/workflows/portfolio-fund-attribution-apply.yml"),
  "utf8",
);
const migration = readFileSync(
  resolve(
    process.cwd(),
    "prisma/migrations/20260816120000_ownership_fund_attribution/migration.sql",
  ),
  "utf8",
);

function position(value: string): number {
  const index = workflow.indexOf(value);
  expect(index, `Expected workflow to contain ${value}`).toBeGreaterThanOrEqual(0);
  return index;
}

describe("portfolio fund attribution production workflow", () => {
  it("is manual, serialized, and protected by the production environment", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toMatch(/\n\s+push:/);
    expect(workflow).not.toMatch(/\n\s+pull_request:/);
    expect(workflow).toContain("group: production-release");
    expect(workflow).toContain("environment:\n      name: production");
    expect(workflow).toContain('[ "$CONFIRMATION" = "APPLY" ]');
  });

  it("replaces Prisma's existing ownership unique index using index DDL", () => {
    expect(migration).toContain(
      'CREATE UNIQUE INDEX "OwnershipPeriod_companyId_organizationId_vehicleName_investmentYear_key"',
    );
    expect(migration).not.toContain(
      'DROP CONSTRAINT "OwnershipPeriod_companyId_organizationId_vehicleName_key"',
    );
    expect(migration).not.toContain(
      'DROP INDEX "OwnershipPeriod_companyId_organizationId_vehicleName_key"',
    );
  });

  it("binds the write to protected main, the merged PR, build, and canonical deployment", () => {
    expect(workflow).toContain("ref: main");
    expect(workflow).toContain('git checkout -B main refs/remotes/origin/main');
    expect(workflow).toContain('[ "$(git rev-parse HEAD)" = "$RELEASE_SHA" ]');
    expect(workflow).toContain("pr.merge_commit_sha !== process.env.EXPECTED_RELEASE_SHA");
    expect(workflow.match(/verify-release-provenance\.ts/g)).toHaveLength(2);
    expect(workflow.match(/verify-vercel-deployment\.ts/g)).toHaveLength(2);
    expect(workflow).toContain("--required-check=build");
    expect(workflow).toContain("CANONICAL_PRODUCTION_URL: https://infra-ma-2.vercel.app");
  });

  it("requires immutable full-ledger artifacts and a clean staged schema", () => {
    expect(workflow).toContain("^audits/portfolio-fund-attribution/");
    expect(workflow).toContain("SEED_MANIFEST_PATH: prisma/seed-data/ownership-attributions.manifest.json");
    expect(workflow).toContain('git ls-files --error-unmatch -- "$artifact"');
    expect(workflow).toContain("--validate-only=true");
    expect(workflow.match(/npx prisma migrate status/g)).toHaveLength(2);
    expect(workflow.match(/npx prisma migrate diff/g)).toHaveLength(2);
    expect(workflow).not.toContain("prisma migrate deploy");
    expect(workflow).not.toContain("db:seed:apply");
  });

  it("dry-runs before the sole protected transaction and verifies public output", () => {
    const dryRun = position("Dry-run all reviewed mutations against fresh production state");
    const finalGate = position("Final release, schema, target, and artifact recheck");
    const apply = position("Apply reviewed portfolio fund attribution transactionally");
    const cache = position("Revalidate public portfolio caches");
    const verify = position("Verify public attribution samples and portfolio page");
    expect(dryRun).toBeLessThan(finalGate);
    expect(finalGate).toBeLessThan(apply);
    expect(apply).toBeLessThan(cache);
    expect(cache).toBeLessThan(verify);
    expect(workflow).toContain("PROTECTED_PRODUCTION_WRITE_APPROVAL_SHA256: ${{ inputs.approval_sha256 }}");
    expect(workflow).toContain("--write-token=APPLY_REVIEWED_PORTFOLIO_FUND_ATTRIBUTION");
    expect(workflow).toContain("verify-portfolio-fund-attribution-release.ts");
    expect(workflow).toContain("cache-preflight.json");
    expect(workflow).toContain("retention-days: 90");
    expect(workflow).not.toContain("vercel promote");
  });
});
