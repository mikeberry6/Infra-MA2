import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import { describe, expect, it } from "vitest";
import { DATABANK_SOURCES, proveDatabankFieldAuthority, type DatabankInput } from "./databank-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const out = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/databank";
const base = "audits/portco-reconciliation/2026-08-03";
const task = `${base}/execution-v1/tasks/0110-databank/attempt-1`;
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
const [manifest, approval, receipt] = reference.sourceFiles.map((file: { path: string }) => json(file.path));
const snapshot = json(`${out}/production-snapshot.json`), report = json(`${out}/authority.json`);
const input: DatabankInput = {
  chronology, priorAuthority: json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/usd-clean-fuels/authority.json"),
  originalSnapshot: json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json"),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal: json(`${base}/proposals/0110-databank-v1/proposal.json`), approval: json(`${base}/approvals/0110-databank-v1.json`),
  receipt: json(`${task}/production-apply/apply-receipt.json`), research: json(`${task}/research-decision.json`), researchBinding: json(`${task}/research-binding.json`),
  attribution: { manifest, approval, receipt }, production: snapshot.production,
  sources: DATABANK_SOURCES.map(source => ({ id: source.id, bytes: readFileSync(`${out}/${source.file}`) })),
};

describe("DataBank five-owner attribution without fund, share or legal-entity inference", () => {
  it("reproduces the frozen decision, complete state and protected dependency hashes", () => {
    const before = sha256Canonical(input.production), result = proveDatabankFieldAuthority(input);
    expect(report.reportSha256).toBe("0c9a00866574eb4b2097cbec9d71cfb7286d58316855f615afc8b7b047807009");
    expect(hashWithoutField(report, "reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path, "utf8"))).toBe(file.sha256);
    expect(result.rows).toEqual(report.rows);
    expect([result.candidateFieldsAdjudicated, result.cumulativeCandidateFieldsAdjudicated, result.remainingCandidateFields, result.additionalFieldsOutsideOriginal603]).toEqual([20, 50, 553, 5]);
    expect(sha256Canonical(input.production)).toBe(before);
  });
  it("distinguishes pension and corporate balance-sheet programs from inferred managed funds", () => {
    const [pension, corporate] = proveDatabankFieldAuthority(input).rows;
    for (const row of [pension, corporate]) {
      expect(row.recommendedAttribution.fundAttribution).toBe("DIRECT_PROGRAM");
      expect(row.recommendedAttribution.linkedFundName).toBeNull();
      expect(row.recommendedAttribution.attributedFundName).toBeNull();
      expect(row.recommendedAttribution.attributionConfidence).toBeNull();
      expect(row.seedWriteBinding).toBeNull();
      expect(row.originalRecordId).not.toBe(row.recordId);
    }
    expect(pension.additionalFieldDecisions.map(d => d.field)).toEqual(["attributedFundName", "fundAttribution", "fundName"]);
    expect(corporate.additionalFieldDecisions.map(d => d.field)).toEqual(["attributedFundName", "fundName"]);
    expect(corporate.preserves.investmentYear).toBe(2016);
    expect(corporate.recommendedAttribution.attributionRationale).toContain("December 2019 balance-sheet entry is distinct");
  });
  it("keeps three exact fund exceptions and unallocated consortium shares", () => {
    const rows = proveDatabankFieldAuthority(input).rows.slice(2);
    for (const row of rows) {
      expect(row.recommendedAttribution.fundAttribution).toBe("UNRESOLVED");
      expect(row.recommendedAttribution.linkedFundName).toBeNull();
      expect(row.originalRecordId).toBeNull();
      expect(row.preserves.vehicleName).toBeNull();
      expect(row.fieldDecisions.filter(d => d.productionWriteRequired).map(d => d.field)).toEqual(["attributionRationale"]);
    }
    expect(rows[0].preserves.stake).toBe("Member of the 35% 2022 consortium; individual percentage not publicly disclosed");
    expect(rows[1].preserves.stake).toBe(rows[0].preserves.stake);
    expect(rows[2].preserves.investmentYear).toBeNull();
    expect(rows[2].preserves.stake).toBe("Exact entry date, vehicle and percentage not publicly disclosed");
  });
  it("preserves Swiss Life GIO III, IMCO, all seven legal-vehicle gaps and the exact source boundary", () => {
    const result = proveDatabankFieldAuthority(input), owners = input.production.owners;
    expect(result.untouchedOwnerIdsPreserved).toEqual(["cmrxpjsmg01hyivheczn6hwqa", "cmrxpjsnf01i0ivhebiyk4oiw"]);
    expect(owners.find(o => o.id === result.untouchedOwnerIdsPreserved[0])?.attributedFundName).toBe("Swiss Life Funds (LUX) ESG Global Infrastructure Opportunities III");
    expect(owners.find(o => o.id === result.untouchedOwnerIdsPreserved[1])?.fundAttribution).toBe("DIRECT_PROGRAM");
    for (const row of result.rows) expect(new Set([...row.fieldDecisions, ...row.additionalFieldDecisions].map(d => d.primarySourceUrl)).size).toBe(1);
    expect([result.databaseWrites, result.seedChanges, result.sourceTransitions, result.applyAuthorized, result.completionAllowed]).toEqual([0, 0, 0, false, false]);
    expect(result).not.toHaveProperty("mutations");
  });
  it.each(["source", "sourceId", "sourceScope", "chronology", "prior", "originalSnapshot", "seed", "proposal", "approval", "receipt", "attribution", "research", "researchBinding"] as const)("rejects changed %s provenance", field => {
    const changed = structuredClone(input);
    if (field === "source") changed.sources[0].bytes[10] ^= 1;
    if (field === "sourceId") changed.sources[0].id = "wrong-source";
    if (field === "sourceScope") changed.sources.push(changed.sources[0]);
    if (field === "chronology") changed.chronology.candidates[0].recordId = "wrong";
    if (field === "prior") changed.priorAuthority.remainingCandidateFields--;
    if (field === "originalSnapshot") changed.originalSnapshot.production.companies[0].id = "wrong";
    if (field === "seed") (changed.seed as { recordCount: number }).recordCount--;
    if (field === "proposal") (changed.proposal as { rationale: string }).rationale = "different";
    if (field === "approval") (changed.approval as { reviewedBy: string }).reviewedBy = "different";
    if (field === "receipt") (changed.receipt as { transactionId: string }).transactionId = "different";
    if (field === "attribution") (changed.attribution.receipt as { changed: number }).changed++;
    if (field === "research") (changed.research as { rationale: string }).rationale = "different";
    if (field === "researchBinding") (changed.researchBinding as { proposalSha256: string }).proposalSha256 = "different";
    expect(() => proveDatabankFieldAuthority(changed)).toThrow();
  });
  it.each(["company", "active", "owner", "fundId", "fundManager", "fundName", "fundStatus", "metadata", "scope", "fundScope", "redirect", "stake", "vehicle", "organization", "pending", "entryYear", "swissLife", "imco", "newOwnerFund"] as const)("rejects changed current %s state", field => {
    const changed = structuredClone(input), owner = changed.production.owners[0];
    if (field === "company") owner.companyId = "other-company";
    if (field === "active") owner.isActive = false;
    if (field === "owner") owner.id = "different";
    if (field === "fundId") owner.fundId = "different";
    if (field === "fundManager") changed.production.funds[0].manager.name = "different";
    if (field === "fundName") changed.production.funds[0].fundName = "different";
    if (field === "fundStatus") changed.production.funds[0].status = "ARCHIVED";
    if (field === "metadata") owner.attributionRationale = "different";
    if (field === "scope") changed.production.owners.push(owner);
    if (field === "fundScope") changed.production.funds.push(changed.production.funds[0]);
    if (field === "redirect") changed.production.redirects.push({ companyId: "different", retiredId: "unexpected", reason: "CANONICAL_MERGE", createdAt: "2026-09-06" });
    if (field === "swissLife") changed.production.owners.find(o => o.id === "cmrxpjsmg01hyivheczn6hwqa")!.attributedFundName = null;
    if (field === "imco") changed.production.owners.find(o => o.id === "cmrxpjsnf01i0ivhebiyk4oiw")!.fundAttribution = "DISCLOSED";
    if (field === "newOwnerFund") changed.production.owners.find(o => o.id === "cmsydgkpw000kb46hpgan1qz3")!.fundId = "guessed";
    const image = changed.production.image as { ownershipPeriods: Array<{ stake: string; vehicleName: string; organizationName: string; investmentYear: number }>; pendingOwnershipTransactions: unknown[] };
    if (field === "stake") image.ownershipPeriods[0].stake = "35%";
    if (field === "vehicle") image.ownershipPeriods[0].vehicleName = "invented";
    if (field === "organization") image.ownershipPeriods[0].organizationName = "different";
    if (field === "pending") image.pendingOwnershipTransactions.push({ target: "invented" });
    if (field === "entryYear") image.ownershipPeriods[0].investmentYear = 2019;
    expect(() => proveDatabankFieldAuthority(changed)).toThrow();
  });
});
