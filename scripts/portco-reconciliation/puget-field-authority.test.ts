import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PUGET_SOURCES, provePugetFieldAuthority, type PugetInput } from "./puget-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const out = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/puget-energy";
const batch = "audits/portco-reconciliation/2026-08-23/batches/batch-0126-0130-v1";
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
const [manifest, approval, receipt] = reference.sourceFiles.map((file: { path: string }) => json(file.path));
const snapshot = json(`${out}/production-snapshot.json`), report = json(`${out}/authority.json`);
const input: PugetInput = {
  chronology, priorAuthority: json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/coastal-gaslink/authority.json"),
  originalSnapshot: json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json"),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"), seedSpec: json(`${batch}/seed-attribution-reconciliation-spec.json`),
  proposal: json("audits/portco-reconciliation/2026-08-03/proposals/0128-puget-energy-v1/proposal.json"),
  approval: json("audits/portco-reconciliation/2026-08-03/approvals/0128-puget-energy-v1.json"),
  batch: json(`${batch}/batch-manifest.json`), batchReceipt: json(`${batch}/production-apply/batch-apply-receipt.json`),
  attribution: { manifest, approval, receipt }, production: snapshot.production,
  research: json("audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0128-puget-energy/attempt-1/research-decision.json"),
  sources: PUGET_SOURCES.map(source => ({ id: source.id, bytes: readFileSync(`${out}/${source.file}`) })),
  filingText: readFileSync(`${out}/bci-program.txt`, "utf8"),
};

describe("Puget attribution authority distinguishes programs from named funds", () => {
  it("reproduces the frozen nine original decisions without changing the inputs", () => {
    const before = sha256Canonical(input.production);
    const result = provePugetFieldAuthority(input);
    expect(report.reportSha256).toBe("b6d4a155a55b6618a08962937e7d38c15154352cdd2354ac46e242bafe902e73");
    expect(hashWithoutField(report, "reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path, "utf8"))).toBe(file.sha256);
    expect(result.rows).toEqual(report.rows);
    expect([result.candidateFieldsAdjudicated, result.cumulativeCandidateFieldsAdjudicated, result.remainingCandidateFields]).toEqual([9, 27, 576]);
    expect(sha256Canonical(input.production)).toBe(before);
  });
  it("does not blindly adopt either seed or production program/fund assertions", () => {
    const result = provePugetFieldAuthority(input);
    expect(result.rows.map(row => row.recommendedAttribution.fundAttribution)).toEqual(["UNRESOLVED", "DIRECT_PROGRAM", "DISCLOSED", "DIRECT_PROGRAM", "DIRECT_PROGRAM", "DIRECT_PROGRAM"]);
    expect(result.rows[2].recommendedAttribution.attributedFundName).toBe("Macquarie Global Infrastructure Fund");
    expect(result.rows.every(row => row.recommendedAttribution.linkedFundName === null)).toBe(true);
    expect(result.rows[1].recommendedAttribution.attributionRationale).toContain("not a legal entity");
    expect(result.rows[4].seedExpectation.fundAttribution).toBe("DISCLOSED");
    expect(result.rows[4].recommendedAttribution.fundAttribution).toBe("DIRECT_PROGRAM");
  });
  it("tracks the nine equality-blind fields separately, with one primary source per owner", () => {
    const result = provePugetFieldAuthority(input);
    expect(result.additionalFieldsOutsideOriginal603).toBe(9);
    expect(result.rows.map(row => row.additionalFieldDecisions.length)).toEqual([4, 3, 0, 0, 2, 0]);
    for (const row of result.rows) {
      expect(new Set([...row.fieldDecisions, ...row.additionalFieldDecisions].map(field => field.primarySourceUrl)).size).toBe(1);
      expect(row.fieldDecisions.every(field => !field.outsideOriginal603)).toBe(true);
      expect(row.additionalFieldDecisions.every(field => field.outsideOriginal603)).toBe(true);
    }
  });
  it("preserves both historical owners, legal-vehicle nulls, firm distinctions and all stakes", () => {
    const result = provePugetFieldAuthority(input);
    expect(result.historicalOwnerIdsPreserved).toHaveLength(2);
    expect(result.rows.filter(row => row.preserves.vehicleName === null)).toHaveLength(5);
    expect(result.rows[4].manager).toBe("OMERS Infrastructure");
    expect(result.rows[4].preserves.organizationName).toBe("OMERS");
    expect(result.rows[4].preserves.stake).toBe("23.9%");
    expect(result.rows[4].preserves.investmentYear).toBe(2019);
    expect([result.databaseWrites, result.seedChanges, result.sourceTransitions, result.applyAuthorized, result.completionAllowed]).toEqual([0, 0, 0, false, false]);
    expect(result).not.toHaveProperty("mutations");
  });
  it.each(["source", "filingText", "sourceScope", "chronology", "originalSnapshot", "priorAuthority", "seed", "seedSpec", "proposal", "approval", "batch", "batchReceipt", "attributionReceipt", "research"] as const)("rejects changed %s provenance", field => {
    const changed = structuredClone(input);
    if (field === "source") changed.sources[0].bytes[10] ^= 1;
    if (field === "filingText") changed.filingText += "unsupported";
    if (field === "sourceScope") changed.sources[0].id = "wrong-source";
    if (field === "chronology") changed.chronology.candidates[0].recordId = "wrong-record";
    if (field === "originalSnapshot") changed.originalSnapshot.production.companies[0].id = "different";
    if (field === "priorAuthority") changed.priorAuthority.remainingCandidateFields--;
    if (field === "seed") (changed.seed as { recordCount: number }).recordCount--;
    if (field === "seedSpec") (changed.seedSpec as { rationale: string }).rationale = "different";
    if (field === "proposal") (changed.proposal as { rationale: string }).rationale = "different";
    if (field === "approval") (changed.approval as { reviewedBy: string }).reviewedBy = "different";
    if (field === "batch") (changed.batch as { batchId: string }).batchId = "different";
    if (field === "batchReceipt") (changed.batchReceipt as { transactionId: string }).transactionId = "different";
    if (field === "attributionReceipt") (changed.attribution.receipt as { changed: number }).changed++;
    if (field === "research") changed.research.result.ownershipResolution.owners[0].fund = "Bolsena Fund";
    expect(() => provePugetFieldAuthority(changed)).toThrow();
  });
  it.each(["owner", "active", "fundId", "fundManager", "metadata", "scope", "historicalMetadata", "historicalId", "redirect", "stake", "vehicle", "organization", "pending"] as const)("rejects changed current %s state", field => {
    const changed = structuredClone(input);
    if (field === "owner") changed.production.owners[0].companyId = "other-company";
    if (field === "active") changed.production.owners[0].isActive = false;
    if (field === "fundId") changed.production.owners[0].fundId = "other-fund";
    if (field === "fundManager") changed.production.funds[0].manager.name = "other-manager";
    if (field === "metadata") changed.production.owners[0].attributionRationale = "different";
    if (field === "scope") changed.production.owners.push(changed.production.owners[0]);
    if (field === "historicalMetadata") changed.production.owners.find(o => !o.isActive)!.attributionRationale = "not in scope";
    if (field === "historicalId") changed.production.owners.find(o => !o.isActive)!.id = "different";
    if (field === "redirect") changed.production.redirects[0].companyId = "different";
    const image = changed.production.image as { ownershipPeriods: Array<{ stake: string; vehicleName: string | null; organizationName: string }>; pendingOwnershipTransactions: unknown[] };
    if (field === "stake") image.ownershipPeriods[0].stake = "13.7%";
    if (field === "vehicle") image.ownershipPeriods[0].vehicleName = "invented";
    if (field === "organization") image.ownershipPeriods[0].organizationName = "different";
    if (field === "pending") image.pendingOwnershipTransactions.push({ target: "invented" });
    expect(() => provePugetFieldAuthority(changed)).toThrow();
  });
});
