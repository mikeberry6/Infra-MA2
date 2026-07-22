import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  path.join(process.cwd(), ".github/workflows/deploy.yml"),
  "utf8",
);

describe("isolated validation workflow remediation context", () => {
  it("derives each mutation reviewer from the committed approval", () => {
    expect(workflow).toContain(
      "company_reviewer=\"$(jq -er '.reviewedBy | select(type == \"string\" and length > 0)' \"$company_approval\")\"",
    );
    expect(workflow).toContain(
      "citation_reviewer=\"$(jq -er '.reviewedBy | select(type == \"string\" and length > 0)' \"$citation_approval\")\"",
    );
    expect(workflow).toContain('MUTATION_REVIEWED_BY="$company_reviewer"');
    expect(workflow).toContain('MUTATION_REVIEWED_BY="$citation_reviewer"');
  });

  it("supplies a validation-only reason before both guarded apply commands", () => {
    const companyReason = workflow.indexOf(
      'MUTATION_REASON="Validate the committed company-merge approval on the isolated database"',
    );
    const companyApply = workflow.indexOf("scripts/merge-duplicate-companies.ts", companyReason);
    const citationReason = workflow.indexOf(
      'MUTATION_REASON="Validate the committed primary-citation approval on the isolated database"',
    );
    const citationApply = workflow.indexOf("scripts/apply-primary-citation-remediation.ts", citationReason);

    expect(companyReason).toBeGreaterThan(-1);
    expect(companyApply).toBeGreaterThan(companyReason);
    expect(citationReason).toBeGreaterThan(-1);
    expect(citationApply).toBeGreaterThan(citationReason);
  });
});
