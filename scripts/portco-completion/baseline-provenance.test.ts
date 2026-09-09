import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { verifyBaselineIdentities } from "./baseline-provenance";
import { seal } from "./batch";

const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const base = "audits/portco-reconciliation/2026-08-03/";
function fixture() {
  const scope = read("audits/portco-reconciliation/2026-09-08/completion/closeout-v1/baseline-scope-bindings.json");
  return { source: read(base + "execution-v1/manifest.json"), ledger: read(base + "ledger-run-v4-repo-only/ledger.json"),
    production: read(base + "snapshots/production-snapshot.json"), seed: read(base + "snapshots/seed-snapshot.json"),
    targets: scope.companies.map((c: {companyId: string; name: string}) => ({companyId: c.companyId, name: c.name})) };
}
function reseal(value: Record<string, unknown>, field: string) {
  const { [field]: _old, ...content } = value; return seal(content, field);
}

describe("baseline identity provenance, never mutation authority", () => {
  it("validates 59 original identities without modifying inputs or claiming owner proof", () => {
    const f = fixture(), before = JSON.stringify(f), result = verifyBaselineIdentities(f);
    expect(JSON.stringify(f)).toBe(before);
    expect(result).toHaveLength(59);
    expect(result.filter(r => r.provenance === "CENSUS_MATCH")).toHaveLength(50);
    expect(result.filter(r => r.provenance === "EXPLICIT_RETAIN_UNLINKED")).toHaveLength(9);
    expect(result.every(r => !r.ownershipVerified && !r.metadataVerified && !r.writeAuthorized)).toBe(true);
  });
  it("orders original census managers/rows before retained repo rows, not alphabetically", () => {
    const f = fixture(), rows = verifyBaselineIdentities(f);
    expect(rows.slice(0, 4).map(r => r.name)).toEqual(["Arevon Energy, Inc.", "FirstEnergy Transmission, LLC",
      "Sempra Infrastructure Partners, LP", "Alberta Schools Alternative Procurement I"]);
    expect(verifyBaselineIdentities({...f, targets: [...f.targets].reverse()})).toEqual(rows);
    expect(rows.slice(-9).every(r => r.order[0] === 1)).toBe(true);
  });
  it("rejects duplicate, invented and relabeled identities", () => {
    const f = fixture();
    for (const targets of [[f.targets[0], f.targets[0]], [{...f.targets[0], companyId: "invented"}],
      [{...f.targets[0], name: "Unproven alias"}]]) expect(() => verifyBaselineIdentities({...f, targets})).toThrow();
  });
  it("rejects changed bytes/schema content, even a rehashed ledger detached from source", () => {
    const f = fixture(); f.ledger.canonicalCompanies[0].displayName += " changed";
    expect(() => verifyBaselineIdentities(f)).toThrow(/hash/i);
    f.ledger = reseal(f.ledger, "ledgerSha256");
    expect(() => verifyBaselineIdentities(f)).toThrow(/baseline hashes/);
  });
  it("rejects wrong snapshot type, modified company fields and changed baseline hashes", () => {
    const f = fixture();
    expect(() => verifyBaselineIdentities({...f, seed: f.production})).toThrow(/baseline hashes/);
    f.seed.companies[0].name += " changed";
    expect(() => verifyBaselineIdentities(f)).toThrow(/hash/i);
  });
  it("rejects nonterminal source state without reopening any task", () => {
    const f = fixture(); f.source.tasks[0].status = "PENDING";
    f.source = reseal(f.source, "manifestSha256");
    expect(() => verifyBaselineIdentities(f)).toThrow();
  });
  it("keeps exact disposition and uniqueness checks even when a test fixture rebinds hashes", () => {
    for (const mutation of ["duplicateRepo", "eraseCensus", "changeRetainedReason", "pendingDecision"]) {
      const f = fixture(), target = f.targets.find((t: {name: string}) => t.name === (mutation === "changeRetainedReason" ? "Captis Energy" : "A25 Concession"));
      const canonical = f.ledger.canonicalCompanies.find((c: {canonicalRepoCompanyId: string}) => c.canonicalRepoCompanyId === target.companyId);
      const repo = f.ledger.repoRows.find((r: {productionCompanyId: string}) => r.productionCompanyId === target.companyId);
      if (mutation === "duplicateRepo") f.ledger.repoRows.push({...repo});
      if (mutation === "eraseCensus") canonical.censusHoldingIds = [];
      if (mutation === "changeRetainedReason") canonical.rationale = "Assumed retained";
      if (mutation === "pendingDecision") canonical.decisionStatus = "DEFERRED";
      f.ledger = reseal(f.ledger, "ledgerSha256");
      f.source.source.ledgerSha256 = f.ledger.ledgerSha256;
      f.source = reseal(f.source, "manifestSha256");
      expect(() => verifyBaselineIdentities({...f, targets: [target]})).toThrow();
    }
  });
  it("does not bypass a source execution task even when its label differs", () => {
    const f = fixture();
    f.source.tasks[0].canonicalKey = f.ledger.canonicalCompanies.find((c: {canonicalRepoCompanyId: string}) => c.canonicalRepoCompanyId === f.targets[0].companyId).canonicalKey;
    f.source = reseal(f.source, "manifestSha256");
    expect(() => verifyBaselineIdentities(f)).toThrow(/baseline-only/);
  });
});
