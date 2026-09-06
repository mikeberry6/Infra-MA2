import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DURHAM_SOURCES, proveDurhamFieldAuthority, type DurhamInput } from "./durham-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const out = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/durham-region-courthouse";
const base = "audits/portco-reconciliation/2026-08-03";
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
const [manifest, approval, receipt] = reference.sourceFiles.map((file: { path: string }) => json(file.path));
const snapshot = json(`${out}/production-snapshot.json`), report = json(`${out}/authority.json`);
const input: DurhamInput = {
  chronology, priorAuthority: json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/puget-energy/authority.json"),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"), seedFund: json("prisma/seed-data/funds.manifest.json").funds.find((fund: { id: string }) => fund.id === "FUND-005"),
  proposal: json(`${base}/proposals/0017-durham-region-courthouse-v3/proposal.json`), approval: json(`${base}/approvals/0017-durham-region-courthouse-v3.json`),
  receipt: json(`${base}/execution-v1/tasks/0017-durham-region-courthouse/attempt-3/production-apply/apply-receipt.json`),
  attribution: { manifest, approval, receipt }, production: snapshot.production,
  sources: DURHAM_SOURCES.map(source => ({ id: source.id, bytes: readFileSync(`${out}/${source.file}`) })),
};

describe("Durham's exact INPP authority preserves canonical ownership", () => {
  it("reproduces two decisions, dependencies and cumulative progress without mutation", () => {
    const before = sha256Canonical(input.production), result = proveDurhamFieldAuthority(input);
    expect(report.reportSha256).toBe("49ed4c982808cc5d1e18300ab45ea9eb607b63fb5d7b1af98eacfcda1982f532");
    expect(hashWithoutField(report, "reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path, "utf8"))).toBe(file.sha256);
    expect(result.rows).toEqual(report.rows);
    expect([result.candidateFieldsAdjudicated, result.cumulativeCandidateFieldsAdjudicated, result.remainingCandidateFields]).toEqual([2, 29, 574]);
    expect(sha256Canonical(input.production)).toBe(before);
  });
  it("retains the two source-supported production labels while requiring separate seed persistence", () => {
    const row = proveDurhamFieldAuthority(input).rows[0];
    expect(row.fieldDecisions.every(field => !field.productionWriteRequired && field.recommended === "International Public Partnerships (INPP)")).toBe(true);
    expect(row.seedExpectation.linkedFundName).toBeNull();
    expect(row.seedExpectation.attributedFundName).toBe("International Public Partnerships");
    expect(row.originalAttributionRecordId).toBe("OFA-562C1C433D63");
    expect(row.recordId).toBe("OFA-0AE7BA9757C5");
    expect(row.preserves.managerName).toBe("Amber Infrastructure Group");
    expect(row.preserves.organizationName).toBe("Amber Infrastructure");
  });
  it("separately records the equality-blind stale rationale and exactly one primary citation", () => {
    const result = proveDurhamFieldAuthority(input), row = result.rows[0];
    expect(result.additionalFieldsOutsideOriginal603).toBe(1);
    expect(row.additionalFieldDecisions[0].recommended).toContain("100% equity ownership");
    expect(row.additionalFieldDecisions[0].current).toContain("Not publicly disclosed");
    expect(new Set([...row.fieldDecisions, ...row.additionalFieldDecisions].map(field => field.primarySourceUrl)).size).toBe(1);
    expect([result.databaseWrites, result.seedChanges, result.sourceTransitions, result.applyAuthorized, result.completionAllowed]).toEqual([0, 0, 0, false, false]);
    expect(result).not.toHaveProperty("mutations");
  });
  it.each(["source", "sourceId", "sourceScope", "chronology", "prior", "seed", "seedFund", "proposal", "approval", "receipt", "attribution"] as const)("rejects changed %s provenance", field => {
    const changed = structuredClone(input);
    if (field === "source") changed.sources[0].bytes[10] ^= 1;
    if (field === "sourceId") changed.sources[0].id = "wrong-source";
    if (field === "sourceScope") changed.sources.push(changed.sources[0]);
    if (field === "chronology") changed.chronology.candidates[0].recordId = "wrong";
    if (field === "prior") changed.priorAuthority.remainingCandidateFields--;
    if (field === "seed") (changed.seed as { recordCount: number }).recordCount--;
    if (field === "seedFund") changed.seedFund.managerName = "different";
    if (field === "proposal") (changed.proposal as { rationale: string }).rationale = "different";
    if (field === "approval") (changed.approval as { reviewedBy: string }).reviewedBy = "different";
    if (field === "receipt") (changed.receipt as { transactionId: string }).transactionId = "different";
    if (field === "attribution") (changed.attribution.receipt as { changed: number }).changed++;
    expect(() => proveDurhamFieldAuthority(changed)).toThrow();
  });
  it.each(["company", "active", "owner", "fundId", "fundManager", "fundName", "fundStatus", "metadata", "scope", "redirect", "stake", "vehicle", "organization", "pending"] as const)("rejects changed current %s state", field => {
    const changed = structuredClone(input), owner = changed.production.owners[0];
    if (field === "company") owner.companyId = "other-company";
    if (field === "active") owner.isActive = false;
    if (field === "owner") owner.id = "different";
    if (field === "fundId") owner.fundId = "different";
    if (field === "fundManager") changed.production.fund.manager.name = "different";
    if (field === "fundName") changed.production.fund.fundName = "different";
    if (field === "fundStatus") changed.production.fund.status = "ARCHIVED";
    if (field === "metadata") owner.attributionRationale = "different";
    if (field === "scope") changed.production.owners.push(owner);
    if (field === "redirect") changed.production.redirects.push({ companyId: "different" });
    const image = changed.production.images[0] as { ownershipPeriods: Array<{ stake: string; vehicleName: string; organizationName: string }>; pendingOwnershipTransactions: unknown[] };
    if (field === "stake") image.ownershipPeriods[0].stake = "99%";
    if (field === "vehicle") image.ownershipPeriods[0].vehicleName = "invented";
    if (field === "organization") image.ownershipPeriods[0].organizationName = "different";
    if (field === "pending") image.pendingOwnershipTransactions.push({ target: "invented" });
    expect(() => proveDurhamFieldAuthority(changed)).toThrow();
  });
});
