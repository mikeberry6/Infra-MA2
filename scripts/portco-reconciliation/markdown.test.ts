import { describe, expect, it } from "vitest";
import { renderCanonicalLedgerMarkdown } from "./markdown";
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
});
