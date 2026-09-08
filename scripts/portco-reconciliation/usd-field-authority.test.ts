import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import { describe, expect, it } from "vitest";
import { USD_SOURCES, proveUsdFieldAuthority, type UsdInput } from "./usd-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const out = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/usd-clean-fuels";
const base = "audits/portco-reconciliation/2026-08-03";
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
const [manifest, approval, receipt] = reference.sourceFiles.map((file: { path: string }) => json(file.path));
const snapshot = json(`${out}/production-snapshot.json`), report = json(`${out}/authority.json`);
const input: UsdInput = {
  chronology, priorAuthority: json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/durham-region-courthouse/authority.json"),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"), seedFund: json("prisma/seed-data/funds.manifest.json").funds.find((fund: { id: string }) => fund.id === "FUND-017"),
  proposal: json(`${base}/proposals/0062-usd-clean-fuels-v1/proposal.json`), approval: json(`${base}/approvals/0062-usd-clean-fuels-v1.json`),
  receipt: json(`${base}/execution-v1/tasks/0062-usd-clean-fuels/attempt-1/production-apply/apply-receipt.json`),
  attribution: { manifest, approval, receipt }, production: snapshot.production,
  sources: USD_SOURCES.map(source => ({ id: source.id, bytes: readFileSync(`${out}/${source.file}`) })),
};

describe("USD's exact Infrastructure Fund I attribution preserves the majority-interest exception", () => {
  it("reproduces the decision, dependencies and cumulative progress without mutation", () => {
    const before = sha256Canonical(input.production), result = proveUsdFieldAuthority(input);
    expect(report.reportSha256).toBe("373eba1a4cc378aade9d6ce4d2e4e7c5ecff2b638cefaeedc8f42f6e58d5fc36");
    expect(hashWithoutField(report, "reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path, "utf8"))).toBe(file.sha256);
    expect(result.rows).toEqual(report.rows);
    expect([result.candidateFieldsAdjudicated, result.cumulativeCandidateFieldsAdjudicated, result.remainingCandidateFields]).toEqual([1, 30, 573]);
    expect(sha256Canonical(input.production)).toBe(before);
  });
  it("retains the exact Infrastructure Fund I link rather than adopting an unlinked seed", () => {
    const row = proveUsdFieldAuthority(input).rows[0];
    expect(row.fieldDecisions).toHaveLength(1);
    expect(row.fieldDecisions[0].recommended).toBe("Ara Infrastructure Fund I");
    expect(row.fieldDecisions[0].productionWriteRequired).toBe(false);
    expect(row.seedExpectation.linkedFundName).toBeNull();
    expect(row.seedExpectation.attributedFundName).toBe(row.current.attributedFundName);
    expect(row.originalAttributionRecordId).toBe("OFA-0FDDAADF54ED");
    expect(row.recordId).toBe("OFA-163D37942AED");
  });
  it("preserves the exact majority exception, 2023 date and metadata with one primary citation", () => {
    const result = proveUsdFieldAuthority(input), row = result.rows[0];
    expect(result.additionalFieldsOutsideOriginal603).toBe(0);
    expect(row.preserves.stake).toBe("Majority interest; exact percentage not publicly disclosed");
    expect(row.preserves.investmentYear).toBe(2023);
    expect(row.fieldDecisions[0].primarySourceUrl).toBe("https://www.arapartners.com/portfolio/");
    expect(row.current.fundAttribution).toBe("DISCLOSED");
    expect(row.current.attributionConfidence).toBeNull();
    expect(result.interpretation).toContain("Adjacent Private Equity Ara Fund I panels are separate companies");
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
    expect(() => proveUsdFieldAuthority(changed)).toThrow();
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
    expect(() => proveUsdFieldAuthority(changed)).toThrow();
  });
});
