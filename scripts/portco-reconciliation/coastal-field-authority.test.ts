import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COASTAL_SOURCES, proveCoastalFieldAuthority, type CoastalInput } from "./coastal-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const out = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/coastal-gaslink";
const batch = "audits/portco-reconciliation/2026-08-23/batches/batch-0319-0323-v1";
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
const [manifest, approval, receipt] = reference.sourceFiles.map((file: { path: string }) => json(file.path));
const snapshot = json(`${out}/production-snapshot.json`), report = json(`${out}/authority.json`);
const input: CoastalInput = {
  chronology, priorAuthority: json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/three-i/authority.json"),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"), seedSpec: json(`${batch}/seed-attribution-reconciliation-spec.json`),
  proposal: json("audits/portco-reconciliation/2026-08-03/proposals/0321-coastal-gaslink-pipeline-v1/proposal.json"),
  approval: json("audits/portco-reconciliation/2026-08-03/approvals/0321-coastal-gaslink-pipeline-v1.json"),
  batch: json(`${batch}/batch-manifest-v4.json`), batchReceipt: json(`${batch}/production-apply/batch-apply-receipt.json`),
  attribution: { manifest, approval, receipt }, production: snapshot.production,
  research: json("audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0321-coastal-gaslink-pipeline/attempt-1/application-research-decision-v1.json"),
  sources: COASTAL_SOURCES.map(source => ({ id: source.id, bytes: readFileSync(`${out}/${source.file}`) })),
  filingText: readFileSync(`${out}/tc-q2-2020-page-35.txt`, "utf8"),
};

describe("Coastal attribution authority keeps provenance distinct from substantive disclosure", () => {
  it("reproduces the frozen source, seed, batch, full company and field proofs without writes", () => {
    const before = sha256Canonical({ ...input, sources: input.sources.map(source => ({ ...source, bytes: [...source.bytes] })) });
    const result = proveCoastalFieldAuthority(input);
    expect(report.reportSha256).toBe("54b46da42be290050fecd7c0abacab26b2b718a124f770eb20fc44371b4c6e32");
    expect(hashWithoutField(report, "reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path, "utf8"))).toBe(file.sha256);
    expect(result.rows).toEqual(report.rows);
    expect(result.candidateFieldsAdjudicated).toBe(12);
    expect(result.cumulativeCandidateFieldsAdjudicated).toBe(18);
    expect(result.remainingCandidateFields).toBe(585);
    expect(sha256Canonical({ ...input, sources: input.sources.map(source => ({ ...source, bytes: [...source.bytes] })) })).toBe(before);
  });
  it("does not blindly adopt the stale KKR seed or inferred fund link", () => {
    const result = proveCoastalFieldAuthority(input), kkr = result.rows[1];
    expect(kkr.current.linkedFundName).toBe("K-INFRA");
    expect(kkr.seedExpectation.fundAttribution).toBe("UNRESOLVED");
    expect(kkr.recommendedAttribution.fundAttribution).toBe("DIRECT_PROGRAM");
    expect(kkr.recommendedAttribution.linkedFundName).toBeNull();
    expect(kkr.recommendedAttribution.attributedFundName).toBeNull();
    expect(kkr.recommendedAttribution.attributionConfidence).toBeNull();
    expect(result.rows[0].recommendedAttribution.fundAttribution).toBe("UNRESOLVED");
    expect(result.rows[2].recommendedAttribution.fundAttribution).toBe("DIRECT_PROGRAM");
    expect(result.rows.every(row => new Set(row.fieldDecisions.map(field => field.primarySourceUrl)).size === 1)).toBe(true);
  });
  it("preserves unknown individual stakes and keeps the disclosed closing vehicle outside an attribution apply", () => {
    const result = proveCoastalFieldAuthority(input);
    expect(result.rows[0].preserves.stake).toContain("individual split not publicly disclosed");
    expect(result.rows[1].preserves.vehicleName).toBe("n.a.");
    expect(result.rows[2].preserves.stake).toBe("35%");
    expect(result.vehicleFollowup.disclosedClosingVehicle).toBe("KKR-Keats Pipeline Investors II (Canada) Ltd.");
    expect(result.vehicleFollowup.outsideOriginal603).toBe(true);
    expect(result.rows.every(row => !row.wholeCompanyReconciled)).toBe(true);
    expect([result.databaseWrites, result.seedChanges, result.sourceTransitions, result.applyAuthorized, result.completionAllowed]).toEqual([0, 0, 0, false, false]);
    expect(result).not.toHaveProperty("mutations");
  });
  it.each(["source", "filingText", "sourceScope", "chronology", "priorAuthority", "seed", "seedSpec", "proposal", "approval", "batch", "batchReceipt", "attributionReceipt", "research"] as const)("rejects changed %s provenance", field => {
    const changed = structuredClone(input);
    if (field === "source") changed.sources[0].bytes[10] ^= 1;
    if (field === "filingText") changed.filingText += "unsupported";
    if (field === "sourceScope") changed.sources[0].id = "wrong-source";
    if (field === "chronology") changed.chronology.candidates[0].recordId = "wrong-record";
    if (field === "priorAuthority") changed.priorAuthority.remainingCandidateFields--;
    if (field === "seed") (changed.seed as { recordCount: number }).recordCount--;
    if (field === "seedSpec") (changed.seedSpec as { rationale: string }).rationale = "different";
    if (field === "proposal") (changed.proposal as { rationale: string }).rationale = "different";
    if (field === "approval") (changed.approval as { reviewedBy: string }).reviewedBy = "different";
    if (field === "batch") (changed.batch as { batchId: string }).batchId = "different";
    if (field === "batchReceipt") (changed.batchReceipt as { transactionId: string }).transactionId = "different";
    if (field === "attributionReceipt") (changed.attribution.receipt as { changed: number }).changed++;
    if (field === "research") changed.research.result.ownershipResolution.currentOwners[1].fund = "K-INFRA";
    expect(() => proveCoastalFieldAuthority(changed)).toThrow();
  });
  it.each(["owner", "active", "fundId", "fundManager", "metadata", "scope", "stake", "pending"] as const)("rejects changed current %s state", field => {
    const changed = structuredClone(input);
    if (field === "owner") changed.production.owners[0].companyId = "other-company";
    if (field === "active") changed.production.owners[0].isActive = false;
    if (field === "fundId") changed.production.owners[0].fundId = "other-fund";
    if (field === "fundManager") changed.production.funds[0].manager.name = "other-manager";
    if (field === "metadata") changed.production.owners[0].attributionRationale = "different";
    if (field === "scope") changed.production.owners.push(changed.production.owners[0]);
    if (field === "stake") (changed.production.image as { ownershipPeriods: Array<{ stake: string }> }).ownershipPeriods[0].stake = "32.5%";
    if (field === "pending") (changed.production.image as { pendingOwnershipTransactions: unknown[] }).pendingOwnershipTransactions = [];
    expect(() => proveCoastalFieldAuthority(changed)).toThrow();
  });
});
