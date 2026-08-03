import { describe, expect, it } from "vitest";
import {
  SCORECARD_JSON_END,
  SCORECARD_JSON_START,
  SCORECARD_REPORT_END,
  SCORECARD_REPORT_START,
  ScorecardResponseValidationError,
  parseScorecardResponse,
  renderScorecardRepairPrompt,
  renderScorecardWorkerPrompt,
} from "./prompt";
import { finalizeProposal } from "./integrity";
import { renderScorecardReviewReport } from "./report";
import { validPromptContext, validResearchResult } from "./test-fixtures";

describe("one-company GPT-5.6 Pro scorecard prompt", () => {
  it("renders the entire task context and strict output contract", () => {
    const prompt = renderScorecardWorkerPrompt(validPromptContext());
    expect(prompt).toContain("entire scorecard");
    expect(prompt).toContain("GPT-5.6 Sol");
    expect(prompt).toContain("Global Infrastructure Partners");
    expect(prompt).toContain("currentScorecardSnapshot");
    expect(prompt).toContain("subsequent sale or disposition");
    expect(prompt).toContain(SCORECARD_JSON_START);
    expect(prompt).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });

  it("parses a strictly marked response and checks task identity", () => {
    const result = validResearchResult();
    const report = `${result.requestedCompany}\n\nIdentity, ownership, operations, milestones, management, evidence, differences, and deal reconciliation were reviewed in full. The proposal is ready for individual approval.`;
    const response = `${SCORECARD_JSON_START}\n${JSON.stringify(result)}\n${SCORECARD_JSON_END}\n${SCORECARD_REPORT_START}\n${report}\n${SCORECARD_REPORT_END}`;
    expect(parseScorecardResponse(response, validPromptContext()).result.companyId).toBe("company-1");
  });

  it("rejects ambiguous duplicate marked sections", () => {
    const response = `${SCORECARD_JSON_START}{}${SCORECARD_JSON_END}${SCORECARD_JSON_START}{}${SCORECARD_JSON_END}${SCORECARD_REPORT_START}report${SCORECARD_REPORT_END}`;
    expect(() => parseScorecardResponse(response, validPromptContext())).toThrow(ScorecardResponseValidationError);
  });

  it("renders a narrow single-repair prompt", () => {
    const prompt = renderScorecardRepairPrompt({
      originalResponse: "malformed response",
      validationErrors: ["citations: exactly one primary citation is required"],
    });
    expect(prompt).toContain("single permitted repair");
    expect(prompt).toContain("Do not perform new research");
    expect(prompt).toContain("exactly one primary citation");
    expect(prompt).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });

  it("renders a trusted Markdown review from finalized JSON", () => {
    const report = renderScorecardReviewReport(finalizeProposal(validResearchResult()));
    expect(report).toContain("# Example Infrastructure, LLC — scorecard proposal");
    expect(report).toContain("## Current ownership");
    expect(report).toContain("## Material milestones");
    expect(report).toContain("Proposal hash:");
  });
});
