import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RIO_GRANDE_SOURCES, proveRioGrandeFieldAuthority, type RioGrandeInput } from "./rio-grande-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const out = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/rio-grande-lng";
const batch = "audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3";
const task = "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0151-rio-grande-lng/attempt-1";
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const chain = (id: string) => {
  const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === id);
  const [manifest, approval, receipt] = reference.sourceFiles.map((file: { path: string }) => json(file.path));
  return { manifest, approval, receipt };
};
const snapshot = json(`${out}/production-snapshot.json`), report = json(`${out}/authority.json`);
const input: RioGrandeInput = {
  chronology, priorAuthority: json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/databank/authority.json"),
  originalSnapshot: json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json"),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"), seedSpec: json(`${batch}/seed-attribution-reconciliation-spec-v2.json`),
  proposal: json("audits/portco-reconciliation/2026-08-03/proposals/0151-rio-grande-lng-v3/proposal.json"),
  approval: json("audits/portco-reconciliation/2026-08-03/approvals/0151-rio-grande-lng-v3.json"),
  batch: json(`${batch}/batch-manifest.json`), batchReceipt: json(`${batch}/production-apply/batch-apply-receipt.json`),
  attribution: chain("cmsxywrmw0000fn6hw9gllg6y"), repair: chain("cmt5tkox30000ddyy1mp0d3yd"), production: snapshot.production,
  research: json(`${task}/research-decision.json`), sourceVerification: json(`${task}/source-verification.json`),
  sources: RIO_GRANDE_SOURCES.map(source => ({ id: source.id, bytes: readFileSync(`${out}/${source.file}`) })),
  filingText: readFileSync(`${out}/doe.txt`, "utf8"), originalFilingText: readFileSync(`${out}/original-filing.txt`, "utf8"),
};

describe("Rio Grande exact attribution authority without a data apply", () => {
  it("reproduces seven original and six additional decisions and every protected dependency", () => {
    const before = sha256Canonical(input.production), result = proveRioGrandeFieldAuthority(input);
    expect(report.reportSha256).toBe("d975522b0684d8c5276d3f3e337ca7beaf5a602b8f1704621cbf49f48f24c70f");
    expect(hashWithoutField(report, "reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path, "utf8"))).toBe(file.sha256);
    expect(result.rows).toEqual(report.rows);
    expect([result.candidateFieldsAdjudicated, result.cumulativeCandidateFieldsAdjudicated, result.remainingCandidateFields, result.additionalFieldsOutsideOriginal603]).toEqual([7, 57, 546, 6]);
    expect(sha256Canonical(input.production)).toBe(before);
  });
  it("distinguishes sovereign reserve program and named GIP project SPVs from specific funds", () => {
    const { rows } = proveRioGrandeFieldAuthority(input);
    expect(rows.map(row => row.recommendedAttribution.fundAttribution)).toEqual(["DIRECT_PROGRAM", "UNRESOLVED", "DIRECT_PROGRAM", "DIRECT_PROGRAM", "DIRECT_PROGRAM"]);
    expect(rows.every(row => row.recommendedAttribution.linkedFundName === null && row.recommendedAttribution.attributedFundName === null && row.recommendedAttribution.attributionConfidence === null)).toBe(true);
    expect(rows[1].recommendedAttribution.attributionRationale).toContain("not inferred from the SPV prefix");
    expect(rows[1].preserves.stake).toContain("current residual not publicly disclosed");
    expect(rows[0].preserves.stake).toContain("13.2% combined GIC/Mubadala");
  });
  it("retains three independently sourced corporate rationales with exact repair lineage", () => {
    const result = proveRioGrandeFieldAuthority(input);
    expect(result.subsequentAttributionReceiptSha256).toBe("b9f52c2b5beda928a14451b1dfecf45630f29393144103ef4a006542749d31e6");
    for (const row of result.rows.slice(2)) {
      expect(row.recommendedAttribution).toEqual(row.current);
      expect(row.fieldDecisions[0].productionWriteRequired).toBe(false);
      expect(row.fieldDecisions[0].seedPersistenceRequired).toBe(true);
      expect(row.originalAttributionRecordId).toMatch(/^OFA-REPAIR-0151-/);
    }
    expect(result.rows[2].preserves.organizationName).toBe("NextDecade Corporation");
    expect(result.rows[4].preserves.organizationName).toBe("XRG P.J.S.C.");
  });
  it("counts original versus equality-blind issues separately and binds one primary per owner", () => {
    const result = proveRioGrandeFieldAuthority(input);
    expect(result.rows.map(row => row.additionalFieldDecisions.length)).toEqual([4, 2, 0, 0, 0]);
    for (const row of result.rows) expect(new Set([...row.fieldDecisions, ...row.additionalFieldDecisions].map(field => field.primarySourceUrl)).size).toBe(1);
    expect(result.separateEqualityBlindFollowup.fieldsRequiringReview).toHaveLength(3);
    expect(result.separateEqualityBlindFollowup.current.attributedFundName).toBe("MIC TI Holding LLC");
    expect(result.separateEqualityBlindFollowup.disposition).toContain("NOT_ADJUDICATED");
    expect([result.databaseWrites, result.seedChanges, result.sourceTransitions, result.applyAuthorized, result.completionAllowed]).toEqual([0, 0, 0, false, false]);
    expect(result).not.toHaveProperty("mutations");
  });
  it("does not label rendered XRG text as raw HTTP bytes or assert an unobserved status", () => {
    const capture = json(`${out}/source-capture.json`), xrg = capture.sources.find((s: { id: string }) => s.id === "xrg");
    expect(xrg.httpStatus).toBeNull();
    expect(xrg.contentType).toContain("rendered browser");
    expect(xrg.method).toContain("Not raw response bytes");
    expect(sha256Text(readFileSync(xrg.path, "utf8"))).toBe(xrg.sha256);
    expect(capture.sourceAccess.sidley).toContain("Not used as authority");
    expect(report.visualReview.originalFilingOneBasedPages).toEqual([3, 6, 12, 13]);
    expect(report.visualReview.doeResponseOneBasedPages).toEqual([3, 4]);
  });
  it.each(["source", "filingText", "originalFiling", "sourceScope", "chronology", "originalSnapshot", "priorAuthority", "seed", "seedSpec", "proposal", "approval", "batch", "batchReceipt", "attributionReceipt", "repairReceipt", "research", "sourceVerification"] as const)("rejects changed %s provenance", field => {
    const changed = structuredClone(input);
    if (field === "source") changed.sources[0].bytes[10] ^= 1;
    if (field === "filingText") changed.filingText += "unsupported";
    if (field === "originalFiling") changed.originalFilingText += "unsupported";
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
    if (field === "repairReceipt") (changed.repair.receipt as { changed: number }).changed++;
    if (field === "research") changed.research.result.ownershipResolution.owners[0].fund = "GIP V";
    if (field === "sourceVerification") (changed.sourceVerification as { sha256: string }).sha256 = "different";
    expect(() => proveRioGrandeFieldAuthority(changed)).toThrow();
  });
  it.each(["owner", "active", "fundId", "metadata", "scope", "mubadalaMetadata", "mubadalaId", "redirect", "stake", "vehicle", "organization", "pending", "fundScope"] as const)("rejects changed current %s state", field => {
    const changed = structuredClone(input);
    if (field === "owner") changed.production.owners[0].companyId = "other-company";
    if (field === "active") changed.production.owners[0].isActive = false;
    if (field === "fundId") changed.production.owners[0].fundId = "other-fund";
    if (field === "metadata") changed.production.owners[0].attributionRationale = "different";
    if (field === "scope") changed.production.owners.push(changed.production.owners[0]);
    if (field === "mubadalaMetadata") changed.production.owners.find(o => o.id === "cmrxpk2ef01xgivhe1pzzw4h7")!.attributionRationale = "different";
    if (field === "mubadalaId") changed.production.owners.find(o => o.id === "cmrxpk2ef01xgivhe1pzzw4h7")!.id = "different";
    if (field === "redirect") changed.production.redirects.push({ retiredId: "different", companyId: "different", reason: "CANONICAL_MERGE", createdAt: "2026-09-06T00:00:00Z" });
    if (field === "fundScope") changed.production.funds.push({ id: "different", fundName: "GIP V", status: "PUBLISHED", manager: { name: "GIP" } });
    const image = changed.production.image as { ownershipPeriods: Array<{ stake: string; vehicleName: string | null; organizationName: string }>; pendingOwnershipTransactions: unknown[] };
    if (field === "stake") image.ownershipPeriods[0].stake = "12.94%";
    if (field === "vehicle") image.ownershipPeriods[0].vehicleName = "invented";
    if (field === "organization") image.ownershipPeriods[0].organizationName = "different";
    if (field === "pending") image.pendingOwnershipTransactions.push({ target: "invented" });
    expect(() => proveRioGrandeFieldAuthority(changed)).toThrow();
  });
});
