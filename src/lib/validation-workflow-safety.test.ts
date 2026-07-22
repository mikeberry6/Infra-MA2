import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  path.join(process.cwd(), ".github/workflows/deploy.yml"),
  "utf8",
);

describe("isolated validation workflow remediation context", () => {
  it("builds and serves the validation app with the full base-path auth endpoint", () => {
    const validationJob = workflow.slice(workflow.indexOf("  validation:"));
    const buildStep = validationJob.indexOf("- name: Build against migrated validation database");
    const visualStep = validationJob.indexOf(
      "- name: Run deterministic visual baselines before mutation journeys",
    );

    expect(validationJob).toContain(
      "NEXTAUTH_URL: http://127.0.0.1:3100/Infra-MA2/api/auth",
    );
    expect(buildStep).toBeGreaterThan(-1);
    expect(visualStep).toBeGreaterThan(buildStep);
    expect(validationJob.slice(buildStep, visualStep)).toContain(
      "NEXTAUTH_URL: http://127.0.0.1:3100/Infra-MA2/api/auth",
    );
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

  it("collects independent evidence after gate failures but still fails closed", () => {
    const strictGate = workflow.indexOf("- name: Verify database integrity and strict publication gates");
    const visualGate = workflow.indexOf(
      "- name: Run deterministic visual baselines before mutation journeys",
    );
    const browserGate = workflow.indexOf(
      "- name: Run end-to-end, axe, keyboard, and responsive checks",
    );
    const topLevelFailureGate = workflow.indexOf(
      "- name: Prove top-level database failure and retry journeys",
    );
    const providerFailureGate = workflow.indexOf(
      "- name: Prove failed external-provider browser journeys",
    );
    const evidenceUpload = workflow.indexOf("- name: Upload migration and data evidence");
    const enforcement = workflow.indexOf(
      "- name: Enforce browser, visual, and strict publication gates after collecting validation evidence",
    );

    expect(strictGate).toBeGreaterThan(-1);
    expect(workflow.slice(strictGate, visualGate)).toContain("continue-on-error: true");
    expect(visualGate).toBeGreaterThan(strictGate);
    const visualBlock = workflow.slice(visualGate, browserGate);
    expect(visualBlock).toContain("continue-on-error: true");
    expect(visualBlock).toContain("--workers=1");
    expect(visualBlock).toContain("--output=visual-test-results");
    expect(browserGate).toBeGreaterThan(visualGate);
    const browserBlock = workflow.slice(browserGate, topLevelFailureGate);
    expect(browserBlock).toContain("continue-on-error: true");
    expect(browserBlock).toContain('npx playwright test --grep-invert "@visual"');
    expect(topLevelFailureGate).toBeGreaterThan(browserGate);
    const topLevelFailureBlock = workflow.slice(topLevelFailureGate, providerFailureGate);
    expect(topLevelFailureBlock).toContain("id: top_level_failure_gate");
    expect(topLevelFailureBlock).toContain("continue-on-error: true");
    expect(topLevelFailureBlock).toContain(
      "DATA_CACHE_NAMESPACE: top-level-failure-${{ github.run_id }}",
    );
    expect(topLevelFailureBlock).toContain("--output=top-level-failure-test-results");
    expect(providerFailureGate).toBeGreaterThan(topLevelFailureGate);
    const providerFailureBlock = workflow.slice(providerFailureGate, evidenceUpload);
    expect(providerFailureBlock).toContain("id: provider_failure_gate");
    expect(providerFailureBlock).toContain("continue-on-error: true");
    expect(providerFailureBlock).toContain("--output=provider-failure-test-results");
    expect(evidenceUpload).toBeGreaterThan(browserGate);
    expect(enforcement).toBeGreaterThan(evidenceUpload);
    expect(workflow.slice(enforcement)).toContain(
      'if [ "$BROWSER_GATE_OUTCOME" != "success" ]',
    );
    expect(workflow.slice(enforcement)).toContain(
      'if [ "$VISUAL_GATE_OUTCOME" != "success" ]',
    );
    expect(workflow.slice(enforcement)).toContain(
      'if [ "$TOP_LEVEL_FAILURE_GATE_OUTCOME" != "success" ]',
    );
    expect(workflow.slice(enforcement)).toContain(
      'if [ "$PROVIDER_FAILURE_GATE_OUTCOME" != "success" ]',
    );
    expect(workflow.slice(enforcement)).toContain(
      'if [ "$STRICT_PUBLICATION_GATE_OUTCOME" != "success" ]',
    );
    expect(workflow.slice(enforcement)).toContain('exit "$failed"');
  });
});
