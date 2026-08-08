import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { finalizeProposal, verifyProposal } from "./artifacts";
import { renderCanonicalLedgerMarkdown, renderProposalMarkdown } from "./markdown";
import { ledgerFixture } from "./test-fixtures";

describe("deterministic Markdown rendering", () => {
  it("renders the same ledger independently of input row order", () => {
    const { ledger } = ledgerFixture();
    const reordered = {
      ...ledger,
      censusRows: [...ledger.censusRows].reverse(),
      repoRows: [...ledger.repoRows].reverse(),
      canonicalCompanies: [...ledger.canonicalCompanies].reverse(),
      unresolvedConflicts: [...ledger.unresolvedConflicts].reverse(),
    };
    const first = renderCanonicalLedgerMarkdown(ledger);
    expect(renderCanonicalLedgerMarkdown(reordered)).toBe(first);
    expect(first).toContain("# PortCo canonical reconciliation ledger");
    expect(first).toContain(ledger.ledgerSha256);
  });

  it("renders reviewed seed identities and both bound entry hashes", () => {
    const existing = verifyProposal(JSON.parse(readFileSync(
      "audits/portco-reconciliation/2026-08-03/proposals/0002-ec-waste-v1/proposal.json",
      "utf8",
    )) as unknown);
    const { proposalSha256: _proposalSha256, ...input } = existing;
    const proposal = finalizeProposal({
      ...input,
      actions: [...input.actions, "MERGE_COMPANIES"],
      reviewedSeedRetirements: [{
        sourceQueueTaskId: "ledger:0485:seed-duplicate",
        sourceQueueEntrySha256: "a".repeat(64),
        name: "EC Waste Legacy",
        country: "United States",
        rawSeedEntrySha256: "b".repeat(64),
        evaluatedSeedEntrySha256: "c".repeat(64),
      }],
    });
    const markdown = renderProposalMarkdown(proposal);

    expect(markdown).toContain("ledger:0485:seed-duplicate");
    expect(markdown).toContain("EC Waste Legacy");
    expect(markdown).toContain("b".repeat(64));
    expect(markdown).toContain("c".repeat(64));
  });
});
