import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  path.join(process.cwd(), ".github/workflows/deploy.yml"),
  "utf8",
);
const releaseRunbook = readFileSync(
  path.join(process.cwd(), "docs/release-runbook.md"),
  "utf8",
);

describe("isolated validation workflow remediation context", () => {
  it("documents the whole-program isolated validation contract", () => {
    for (const name of [
      "MIGRATION_DATABASE_URL",
      "MIGRATION_DATABASE_HOST",
      "MIGRATION_DATABASE_NAME",
    ]) {
      expect(releaseRunbook).toContain(`\`${name}\``);
    }
    expect(releaseRunbook).not.toContain("PHASE1_MIGRATION_DATABASE");
    expect(releaseRunbook).not.toContain("PHASE2_MIGRATION_DATABASE");
  });

  it("isolates migration and browser validation from every production database", () => {
    const validationJob = workflow.slice(workflow.indexOf("  validation:"));
    const migrationStep = validationJob.indexOf("- name: Apply additive migrations to validation branch");
    const buildStep = validationJob.indexOf(
      "- name: Build against migrated validation database",
    );

    expect(validationJob).toContain(
      "DATABASE_URL: ${{ secrets.MIGRATION_DATABASE_URL }}",
    );
    expect(validationJob).toContain(
      "EXPECTED_DATABASE_HOST: ${{ vars.MIGRATION_DATABASE_HOST }}",
    );
    expect(validationJob).toContain(
      "EXPECTED_DATABASE_NAME: ${{ vars.MIGRATION_DATABASE_NAME }}",
    );
    expect(validationJob).toContain(
      "FORBIDDEN_DATABASE_HOST: ${{ vars.PRODUCTION_DATABASE_HOST }}",
    );
    expect(validationJob).toContain(
      "FORBIDDEN_DATABASE_HOST_2: ${{ vars.PRODUCTION_MIGRATION_DATABASE_HOST }}",
    );
    expect(migrationStep).toBeGreaterThan(-1);
    expect(buildStep).toBeGreaterThan(migrationStep);
    expect(validationJob).toContain("playwright");
    expect(validationJob).toContain("E2E_DATABASE_URL: ${{ secrets.MIGRATION_DATABASE_URL }}");
    expect(validationJob).not.toContain("bundle-budget");
    expect(validationJob).not.toContain("/api/health");
  });

  it("derives each mutation reviewer from the committed approval", () => {
    expect(workflow).toContain(
      "company_reviewer=\"$(jq -er '.reviewedBy | select(type == \"string\" and length > 0)' \"$company_approval\")\"",
    );
    expect(workflow).toContain(
      "citation_reviewer=\"$(jq -er '.reviewedBy | select(type == \"string\" and length > 0)' \"$citation_approval\")\"",
    );
    expect(workflow).toContain(
      "ownership_reviewer=\"$(jq -er '.reviewedBy | select(type == \"string\" and length > 0)' \"$ownership_approval\")\"",
    );
    expect(workflow).toContain(
      "seller_disclosure_reviewer=\"$(jq -er '.reviewedBy | select(type == \"string\" and length > 0)' \"$seller_disclosure_approval\")\"",
    );
    expect(workflow).toContain('MUTATION_REVIEWED_BY="$company_reviewer"');
    expect(workflow).toContain('MUTATION_REVIEWED_BY="$ownership_reviewer"');
    expect(workflow).toContain('MUTATION_REVIEWED_BY="$seller_disclosure_reviewer"');
    expect(workflow).toContain('MUTATION_REVIEWED_BY="$citation_reviewer"');
  });

  it("supplies a validation-only reason before every guarded apply command", () => {
    const companyReason = workflow.indexOf(
      'MUTATION_REASON="Validate the committed company-merge approval on the isolated database"',
    );
    const companyApply = workflow.indexOf("scripts/merge-duplicate-companies.ts", companyReason);
    const citationReason = workflow.indexOf(
      'MUTATION_REASON="Validate the committed primary-citation approval on the isolated database"',
    );
    const citationApply = workflow.indexOf("scripts/apply-primary-citation-remediation.ts", citationReason);
    const ownershipReason = workflow.indexOf(
      'MUTATION_REASON="Validate the committed ownership-fund-link approval on the isolated database"',
    );
    const ownershipApply = workflow.indexOf(
      "scripts/apply-ownership-fund-link-remediation.ts",
      ownershipReason,
    );
    const sellerReason = workflow.indexOf(
      'MUTATION_REASON="Validate the committed deal seller-disclosure approval on the isolated database"',
    );
    const sellerApply = workflow.indexOf(
      "scripts/apply-deal-seller-disclosure-remediation.ts",
      sellerReason,
    );

    expect(companyReason).toBeGreaterThan(-1);
    expect(companyApply).toBeGreaterThan(companyReason);
    expect(ownershipReason).toBeGreaterThan(-1);
    expect(ownershipApply).toBeGreaterThan(ownershipReason);
    expect(sellerReason).toBeGreaterThan(-1);
    expect(sellerApply).toBeGreaterThan(sellerReason);
    expect(citationReason).toBeGreaterThan(-1);
    expect(citationApply).toBeGreaterThan(citationReason);
  });

  it("applies merge, ownership-link, seller-treatment, and citation decisions in dependency order", () => {
    const companyApply = workflow.indexOf("scripts/merge-duplicate-companies.ts");
    const ownershipApply = workflow.indexOf("scripts/apply-ownership-fund-link-remediation.ts");
    const sellerApply = workflow.indexOf("scripts/apply-deal-seller-disclosure-remediation.ts");
    const citationApply = workflow.indexOf("scripts/apply-primary-citation-remediation.ts");

    expect(companyApply).toBeGreaterThan(-1);
    expect(ownershipApply).toBeGreaterThan(companyApply);
    expect(sellerApply).toBeGreaterThan(ownershipApply);
    expect(citationApply).toBeGreaterThan(sellerApply);
  });

  it("uploads neutral evidence after strict-gate failures and still fails closed", () => {
    const strictGate = workflow.indexOf("- name: Verify database integrity and strict publication gates");
    const evidenceUpload = workflow.indexOf("- name: Upload migration and data evidence");
    const enforcement = workflow.indexOf(
      "- name: Enforce browser, visual, and strict publication gates after collecting validation evidence",
    );

    expect(strictGate).toBeGreaterThan(-1);
    expect(workflow.slice(strictGate, evidenceUpload)).toContain("continue-on-error: true");
    expect(evidenceUpload).toBeGreaterThan(strictGate);
    expect(enforcement).toBeGreaterThan(evidenceUpload);
    expect(workflow.slice(evidenceUpload, enforcement)).toContain("if: always()");
    expect(workflow.slice(enforcement)).toContain(
      'if [ "$STRICT_PUBLICATION_GATE_OUTCOME" != "success" ]',
    );
    expect(workflow.slice(enforcement)).toContain('exit "$failed"');
    expect(workflow).toContain("playwright");
  });
});
