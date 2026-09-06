import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RIO_GRANDE_SOURCES } from "./rio-grande-field-authority";
import { proveRioMubadalaFieldAuthority, RIO_MUBADALA_OWNER, type RioMubadalaInput } from "./rio-mubadala-field-authority";
import { createHash } from "node:crypto";
import { hashWithoutField, sha256Canonical } from "./hash";

const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const out = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/rio-mubadala";
const evidence = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/rio-grande-lng";
const batch = "audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3";
const task = "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0151-rio-grande-lng/attempt-1";
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const chain = (id: string) => {
  const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === id);
  const [manifest, approval, receipt] = reference.sourceFiles.map((file: { path: string }) => json(file.path));
  return { manifest, approval, receipt };
};
const snapshot = json(`${out}/production-snapshot.json`), report = json(`${out}/authority.json`);
const input: RioMubadalaInput = {
  rioAuthority: json(`${evidence}/authority.json`),
  chronology, priorAuthority: json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/databank/authority.json"),
  originalSnapshot: json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json"),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"), seedSpec: json(`${batch}/seed-attribution-reconciliation-spec-v2.json`),
  proposal: json("audits/portco-reconciliation/2026-08-03/proposals/0151-rio-grande-lng-v3/proposal.json"),
  approval: json("audits/portco-reconciliation/2026-08-03/approvals/0151-rio-grande-lng-v3.json"),
  batch: json(`${batch}/batch-manifest.json`), batchReceipt: json(`${batch}/production-apply/batch-apply-receipt.json`),
  attribution: chain("cmsxywrmw0000fn6hw9gllg6y"), repair: chain("cmt5tkox30000ddyy1mp0d3yd"), production: snapshot.production,
  research: json(`${task}/research-decision.json`), sourceVerification: json(`${task}/source-verification.json`),
  sources: RIO_GRANDE_SOURCES.map(source => ({ id: source.id, bytes: readFileSync(`${evidence}/${source.file}`) })),
  filingText: readFileSync(`${evidence}/doe.txt`, "utf8"), originalFilingText: readFileSync(`${evidence}/original-filing.txt`, "utf8"),
};


describe("Rio Mubadala separate equality-blind authority without a data apply", () => {
  it("reproduces the complete new report and all 42 protected byte dependencies", () => {
    const before = sha256Canonical(input), result = proveRioMubadalaFieldAuthority(input);
    expect(report.reportSha256).toBe("3bd1bd20057948a1d10a666792afc99b90b01b7d4ad892856e201a6d5903bee9");
    expect(hashWithoutField(report, "reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    expect(report.dependencies).toHaveLength(42);
    for (const file of report.dependencies) expect(createHash("sha256").update(readFileSync(file.path)).digest("hex")).toBe(file.sha256);
    for (const key of Object.keys(result) as Array<keyof typeof result>) expect(report[key]).toEqual(result[key]);
    expect(sha256Canonical(input)).toBe(before);
  });
  it("supports sovereign-program classification without inferring a named managed fund", () => {
    const result = proveRioMubadalaFieldAuthority(input);
    expect(result.current.fundAttribution).toBe("DISCLOSED");
    expect(result.current.attributedFundName).toBe("MIC TI Holding LLC");
    expect(result.recommendedAttribution).toMatchObject({ linkedFundName: null, fundAttribution: "DIRECT_PROGRAM", attributedFundName: null, attributionConfidence: null });
    expect(result.recommendedAttribution.attributionRationale).toContain("Government of Abu Dhabi");
    expect(result.recommendedAttribution.attributionRationale).toContain("separately verified MIC TI Holding Company 2 RSC Limited");
  });
  it("resolves only the three flagged fields outside the original603", () => {
    const result = proveRioMubadalaFieldAuthority(input);
    expect([result.candidateFieldsAdjudicated, result.cumulativeCandidateFieldsAdjudicated, result.remainingCandidateFields, result.additionalFieldsOutsideOriginal603]).toEqual([0, 57, 546, 3]);
    expect(result.fieldDecisions.map(row => row.field)).toEqual(["fundAttribution", "attributedFundName", "attributionRationale"]);
    expect(result.fieldDecisions.every(row => row.outsideOriginal603 && row.productionWriteRequired && row.seedPersistenceRequired)).toBe(true);
    expect(new Set(result.fieldDecisions.map(row => row.primarySourceUrl)).size).toBe(1);
    expect(result.fieldDecisions.every(row => row.primaryOneBasedPage === 6)).toBe(true);
    expect(input.rioAuthority.separateEqualityBlindFollowup.disposition).toContain("NOT_ADJUDICATED");
  });
  it("preserves the project vehicle, exact stake exceptions and materialized organization", () => {
    const result = proveRioMubadalaFieldAuthority(input);
    expect(result.preserves).toMatchObject({ id: RIO_MUBADALA_OWNER, managerName: "Mubadala", organizationName: "Mubadala", vehicleName: "MIC TI Holding Company 2 RSC Limited", investmentYear: 2023, fundName: null, exitYear: null, isActive: true, transactionState: "CLOSED_ACTIVE", physicalComparisonsUnchanged: true });
    expect(result.preserves.stake).toBe("Phase 1 minimum 6.57%; Train 4 5.2%; Train 5 included in 13.2% combined GIC/Mubadala interest");
    expect(result.preserves.remainingOwnerIds).toHaveLength(5);
    expect(result.qualifications.some(text => text.includes("Nineteenth Investment Company"))).toBe(true);
  });
  it("reuses frozen evidence, preserves full lineage and never authorizes persistence", () => {
    const result = proveRioMubadalaFieldAuthority(input);
    expect(report.sourceCaptureReusedWithoutNetwork).toBe(true);
    expect(report.visualReview.originalFilingOneBasedPages).toEqual([6]);
    expect(result.recordId).toBe("OFA-20166140109D");
    expect(result.originalRecordId).toBe("OFA-08D66635201C");
    expect(result.priorAuthoritySha256).toBe("d975522b0684d8c5276d3f3e337ca7beaf5a602b8f1704621cbf49f48f24c70f");
    expect([result.databaseWrites, result.seedChanges, result.sourceTransitions, result.applyAuthorized, result.completionAllowed]).toEqual([0, 0, 0, false, false]);
    expect(result).not.toHaveProperty("mutations");
  });
  it.each(["rioAuthority", "chronology", "priorAuthority", "originalSnapshot", "seed", "seedSpec", "proposal", "approval", "batch", "batchReceipt", "originalReceipt", "repairReceipt", "sourceBytes", "filingText", "research", "sourceVerification"] as const)("rejects changed %s provenance", field => {
    const changed = structuredClone(input);
    if (field === "rioAuthority") changed.rioAuthority.remainingCandidateFields--;
    if (field === "chronology") changed.chronology.candidates[0].recordId = "wrong";
    if (field === "priorAuthority") changed.priorAuthority.remainingCandidateFields--;
    if (field === "originalSnapshot") changed.originalSnapshot.production.companies[0].id = "wrong";
    if (field === "seed") (changed.seed as { recordCount: number }).recordCount--;
    if (field === "seedSpec") (changed.seedSpec as { rationale: string }).rationale = "wrong";
    if (field === "proposal") (changed.proposal as { rationale: string }).rationale = "wrong";
    if (field === "approval") (changed.approval as { reviewedBy: string }).reviewedBy = "wrong";
    if (field === "batch") (changed.batch as { batchId: string }).batchId = "wrong";
    if (field === "batchReceipt") (changed.batchReceipt as { transactionId: string }).transactionId = "wrong";
    if (field === "originalReceipt") (changed.attribution.receipt as { changed: number }).changed++;
    if (field === "repairReceipt") (changed.repair.receipt as { changed: number }).changed++;
    if (field === "sourceBytes") changed.sources[0].bytes[10] ^= 1;
    if (field === "filingText") changed.originalFilingText += "invented";
    if (field === "research") changed.research.result.ownershipResolution.owners.find(row => row.manager === "Mubadala")!.fund = "MIC Fund I";
    if (field === "sourceVerification") (changed.sourceVerification as { sha256: string }).sha256 = "wrong";
    expect(() => proveRioMubadalaFieldAuthority(changed)).toThrow();
  });
  it.each(["fund", "name", "rationale", "active", "otherOwner", "vehicle", "stake", "organization", "year", "redirect", "ownerScope"] as const)("rejects changed current %s", field => {
    const changed = structuredClone(input), owner = changed.production.owners.find(row => row.id === RIO_MUBADALA_OWNER)!;
    const image = changed.production.image as { ownershipPeriods: Array<{ id: string; vehicleName: string | null; stake: string; organizationName: string; investmentYear: number }> };
    const core = image.ownershipPeriods.find(row => row.id === RIO_MUBADALA_OWNER)!;
    if (field === "fund") owner.fundId = "wrong";
    if (field === "name") owner.attributedFundName = "wrong";
    if (field === "rationale") owner.attributionRationale = "wrong";
    if (field === "active") owner.isActive = false;
    if (field === "otherOwner") changed.production.owners.find(row => row.id !== RIO_MUBADALA_OWNER)!.attributionRationale = "wrong";
    if (field === "vehicle") core.vehicleName = "Nineteenth Investment Company LLC";
    if (field === "stake") core.stake = "13.2%";
    if (field === "organization") core.organizationName = "Mubadala Investment Company PJSC";
    if (field === "year") core.investmentYear = 2025;
    if (field === "redirect") changed.production.redirects.push({ retiredId: "wrong", companyId: "wrong", reason: "CANONICAL_MERGE", createdAt: "2026-09-06T00:00:00Z" });
    if (field === "ownerScope") changed.production.owners.push(owner);
    expect(() => proveRioMubadalaFieldAuthority(changed)).toThrow();
  });
});
