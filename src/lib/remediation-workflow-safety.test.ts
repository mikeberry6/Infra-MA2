import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  path.join(process.cwd(), ".github/workflows/remediate-production-data.yml"),
  "utf8",
);
const releaseRunbook = readFileSync(
  path.join(process.cwd(), "docs/release-runbook.md"),
  "utf8",
);

describe("production remediation workflow safety", () => {
  it("uses the documented Phase 2 remediation validation-variable contract", () => {
    for (const contract of [
      "VALIDATION_DATABASE_URL: ${{ secrets.MIGRATION_DATABASE_URL }}",
      "VALIDATION_DATABASE_HOST: ${{ vars.MIGRATION_DATABASE_HOST }}",
      "VALIDATION_DATABASE_NAME: ${{ vars.MIGRATION_DATABASE_NAME }}",
    ]) {
      expect(workflow).toContain(contract);
    }
    expect(workflow).not.toContain("PHASE1_MIGRATION_DATABASE");
    expect(workflow).not.toContain("PHASE2_MIGRATION_DATABASE");
    for (const name of [
      "MIGRATION_DATABASE_URL",
      "MIGRATION_DATABASE_HOST",
      "MIGRATION_DATABASE_NAME",
    ]) {
      expect(releaseRunbook).toContain(`\`${name}\``);
    }
    expect(releaseRunbook).toContain("Review or Remediate Release Data");
  });

  it("passes dispatch values through quoted environment variables and local tools", () => {
    expect(workflow).toContain("CONFIRMATION: ${{ inputs.confirmation }}");
    expect(workflow).toContain('if [ "$CONFIRMATION" != "$expected" ]');
    expect(workflow).not.toContain('if [ "${{ inputs.confirmation }}"');
    expect(workflow).not.toMatch(/\bnpx tsx\b/);
    expect(workflow).toContain("./node_modules/.bin/tsx scripts/merge-duplicate-companies.ts");
    expect(workflow).toContain("./node_modules/.bin/tsx scripts/apply-ownership-fund-link-remediation.ts");
    expect(workflow).toContain("./node_modules/.bin/tsx scripts/apply-deal-seller-disclosure-remediation.ts");
  });

  it("fails closed on target selection and rechecks release provenance before apply", () => {
    expect(workflow).toContain('case "$TARGET_DATABASE" in');
    expect(workflow).toContain("Unsupported database target");
    expect(workflow.match(/scripts\/verify-release-provenance\.ts/g)).toHaveLength(2);
    expect(workflow).toContain("release-provenance-before-apply.json");
    expect(workflow).toContain("company-merge-approval-template.json");
    expect(workflow).toContain("company-public-duplicate-review.md");
    expect(workflow).toContain("ownership-fund-link-approval-template.json");
    expect(workflow).toContain("deal-seller-disclosure-approval-template.json");
  });

  it("routes explicit reviewed ownership-to-fund-link remediation", () => {
    expect(workflow).toContain("apply-ownership-fund-links");
    expect(workflow).toContain("scripts/apply-ownership-fund-link-remediation.ts");
    expect(workflow).toContain('--expected-sha256="$APPROVAL_SHA256"');
    expect(workflow).toContain("scripts/report-ownership-fund-link-remediation.ts");
  });

  it("routes explicit reviewed deal seller-disclosure remediation", () => {
    expect(workflow).toContain("apply-deal-seller-disclosures");
    expect(workflow).toContain("scripts/apply-deal-seller-disclosure-remediation.ts");
    expect(workflow).toContain('--expected-sha256="$APPROVAL_SHA256"');
    expect(workflow).toContain("scripts/report-deal-seller-disclosure-remediation.ts");
  });

  it("routes explicit reviewed dashboard cutover apply and rollback operations", () => {
    for (const operation of [
      "apply-dashboard-methodology-cutover",
      "rollback-dashboard-methodology-cutover",
      "apply-dashboard-signal-backfill",
      "rollback-dashboard-signal-backfill",
    ]) {
      expect(workflow).toContain(operation);
    }
    expect(workflow).toContain("MUTATION_REVIEWED_BY: ${{ inputs.mutation_reviewed_by }}");
    expect(workflow).toContain("MUTATION_REASON: ${{ inputs.mutation_reason }}");
    expect(workflow).toContain("DASHBOARD_WRITES_ENABLED: ${{ vars.DASHBOARD_WRITES_ENABLED }}");
    expect(workflow).toContain('if [ "$DASHBOARD_WRITES_ENABLED" != "false" ]');
    expect(workflow).toContain("must exactly equal false for dashboard cutover apply or rollback");
    expect(workflow.indexOf('if [ "$DASHBOARD_WRITES_ENABLED" != "false" ]'))
      .toBeLessThan(workflow.indexOf("- name: Apply the exact reviewed decision"));
    expect(workflow).toContain('--approval-sha256="$APPROVAL_SHA256"');
    expect(workflow).toContain("scripts/quarantine-dashboard-methodology-history.ts");
    expect(workflow).toContain("scripts/backfill-dashboard-signal-approvals.ts");
    expect(workflow).toContain("mode=--rollback");
  });
});
