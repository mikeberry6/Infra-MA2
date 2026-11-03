// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { loadIssues, parseIssue } from "./archive";
import { buildProposal, candidateIds, validateApprovedProposal, type SnapshotDeal } from "./domain";

const issues = loadIssues(process.cwd());
describe("published weekly deal extraction", () => {
  it("requires the structured publication manifest to match the final archive", () => {
    const manifest = JSON.parse(readFileSync("audits/briefing-deals/archive.json", "utf8"));
    expect(manifest.issues).toEqual(issues);
  });
  it("accounts for every Source link across every archived weekly layout", () => {
    expect(issues.length).toBeGreaterThanOrEqual(37);
    expect(issues.find(i => i.edition === "2026-08-14")?.cards).toHaveLength(14);
    expect(issues.find(i => i.edition === "2026-10-30")?.cards).toHaveLength(14);
    expect(issues.every(i => i.cards.every(c => c.sector && c.target && c.metadata && c.description))).toBe(true);
  });
  it("uses machine-readable announcement dates and distinct edition coverage", () => {
    expect(issues.find(i => i.edition === "2026-10-30")?.cards[0].announcementDate).toBe("2026-10-29");
    expect(issues.find(i => i.edition === "2026-10-17")?.coverageEnd).toBe("2026-10-16");
    expect(issues[0].cards[0].announcementDate).toBeNull();
  });
  it("retains legacy identities after cards are reordered", () => {
    const card = (name: string) => `<table><tr><td style="font-weight:700;color:#442142;line-height:1.2">${name} | Fund</td></tr><tr><td>Fund (Buyout) · Solar · US</td></tr><tr><td>Description</td></tr><tr><td><a href="https://example.com/${name}">Source</a></td></tr></table>`;
    const wrap = (body: string) => `<td style="text-transform:uppercase">Power &amp; ET</td>${body}`;
    const a = parseIssue("2026-10-30", wrap(card("One") + card("Two")));
    const b = parseIssue("2026-10-30", wrap(card("Two") + card("One")));
    expect(a.cards[0].key).toBe(b.cards[1].key);
  });
});
const dbDeal: SnapshotDeal = { id: "db1", legacyId: "DEAL-1", target: "One", date: "2026-10-29", status: "PUBLISHED", updatedAt: "2026-10-30", sources: ["https://example.com/shared"], buyers: ["Fund"], sellers: [] };
describe("review gates", () => {
  it("does not merge different transactions merely sharing a URL", () => {
    expect(candidateIds({ ...issues[0].cards[0], target: "Another target", sourceUrl: dbDeal.sources[0] }, [dbDeal])).toEqual([]);
  });
  it("leaves all candidates pending individual review", () => {
    const proposal = buildProposal([issues[0]], [], "snapshot");
    expect(proposal.decisions.every(r => !r.approved)).toBe(true);
    expect(() => validateApprovedProposal(proposal)).toThrow("Unreviewed");
  });
  it("rejects missing or repeated decisions and incomplete creates", () => {
    const proposal = buildProposal([{ ...issues[0], cards: [issues[0].cards[0]] }], [], "snapshot");
    proposal.decisions[0] = { ...proposal.decisions[0], action: "MATCH", approved: true, reviewer: "User", evidence: "Reviewed source" };
    expect(validateApprovedProposal(proposal)).toEqual(proposal);
    expect(() => validateApprovedProposal({ ...proposal, decisions: [] })).toThrow("Every card");
    expect(() => validateApprovedProposal({ ...proposal, decisions: [...proposal.decisions, ...proposal.decisions] })).toThrow("duplicate");
    proposal.decisions[0].action = "CREATE";
    expect(() => validateApprovedProposal(proposal)).toThrow("Invalid deal data");
  });
});
