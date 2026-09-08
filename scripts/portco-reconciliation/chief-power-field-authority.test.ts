import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { CHIEF_SOURCES, CHIEF_TEXT, CHIEF, proveChiefPowerFieldAuthority, type ChiefInput } from "./chief-power-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const out = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/chief-power";
const base = "audits/portco-reconciliation/2026-08-03";
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
const [manifest, approval, receipt] = reference.sourceFiles.map((file: { path: string }) => json(file.path));
const snapshot = json(`${out}/production-snapshot.json`), report = json(`${out}/authority.json`);
const input: ChiefInput = {
  chronology, priorAuthority: json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/rio-mubadala/authority.json"),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"), seedFund: json("prisma/seed-data/funds.manifest.json").funds.find((fund: { id: string }) => fund.id === "FUND-152"),
  proposal: json(`${base}/proposals/0066-chief-power-v2/proposal.json`), approval: json(`${base}/approvals/0066-chief-power-v2.json`),
  receipt: json(`${base}/execution-v1/tasks/0066-chief-power/attempt-2/production-apply/apply-receipt.json`),
  seedOverlay: json("prisma/seed-data/approved-portco-after-images.json"), attribution: { manifest, approval, receipt }, production: snapshot.production,
  sources: [...CHIEF_SOURCES, ...CHIEF_TEXT].map(source => ({ id: source.id, bytes: readFileSync(`${out}/${source.file}`) })),
};
// Hash PDF bytes directly instead of expanding each byte into a JSON number.
// This preserves complete input-mutation detection within the default timeout.
const inputFingerprint = (value: ChiefInput) => sha256Canonical({ ...value,
  sources: value.sources.map(source => ({ id: source.id, sha256: createHash("sha256").update(source.bytes).digest("hex") })) });

describe("Chief Power's disclosed Fund V authority preserves both tranches and exact exceptions", () => {
  it("reproduces the frozen proof and all dependencies without writes", () => {
    const before = inputFingerprint(input), result = proveChiefPowerFieldAuthority(input);
    expect(report.reportSha256).toBe("a74bce5b68d6b71ce75a6c9cd83580797ea2d60c48fcb7aecff409cc3d26e446");
    expect(hashWithoutField(report, "reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path, "utf8"))).toBe(file.sha256);
    for (const [key, value] of Object.entries(result)) expect(report[key]).toEqual(value);
    expect([result.candidateFieldsAdjudicated, result.cumulativeCandidateFieldsAdjudicated, result.remainingCandidateFields]).toEqual([6, 63, 540]);
    expect(inputFingerprint(input)).toBe(before);
  });
  it("requires six production corrections but only two seed rationales, not eight distinct decisions", () => {
    const result = proveChiefPowerFieldAuthority(input), fields = result.rows.flatMap(row => row.fieldDecisions);
    expect(fields).toHaveLength(6);
    expect(fields.filter(f => f.productionWriteRequired)).toHaveLength(6);
    expect(fields.filter(f => f.seedPersistenceRequired)).toHaveLength(2);
    expect(fields.every(f => f.primarySourceUrl === CHIEF_SOURCES[0].url && f.primaryOneBasedPage === 18 && !f.outsideOriginal603)).toBe(true);
    expect(result.additionalFieldsOutsideOriginal603).toBe(0);
    for (const row of result.rows) {
      expect(row.recommended.fundAttribution).toBe("DISCLOSED");
      expect(row.recommended.attributionConfidence).toBeNull();
      expect(row.recommended.linkedFundName).toBe(CHIEF.fundName);
      expect(row.recommended.attributedFundName).toBe(CHIEF.fundName);
      expect(row.preserves.stake).toContain("exact economic percentage not publicly disclosed");
      expect(row.preserves.investmentYear).toBe(row.year);
      expect(row.preserves.vehicleName).toBe(row.vehicle);
    }
  });
  it("keeps distinct original/seed record IDs and absent research/upsert lineage explicit", () => {
    const result = proveChiefPowerFieldAuthority(input);
    expect(result.rows.map(r => [r.recordId, r.originalRecordId])).toEqual([
      ["OFA-C5C4181CF197", "OFA-7CC0DE2F9E89"], ["OFA-44F1F236D9F0", "OFA-F75D67E0FA03"],
    ]);
    expect(result.missingSeedUpsertBindings).toBe(2);
    expect(result.qualifications.join(" ")).toContain("no standalone research/ChatGPT packet");
    expect(result.qualifications.join(" ")).toContain("Docket Alarm mirror");
    expect(result.qualifications.join(" ")).toContain("does not name Fund V");
    expect([result.databaseWrites, result.seedChanges, result.sourceTransitions, result.applyAuthorized, result.completionAllowed]).toEqual([0, 0, 0, false, false]);
    expect(result).not.toHaveProperty("mutations");
  });
  it.each(["source", "sourceId", "sourceScope", "extractedText", "chronology", "prior", "seed", "seedFund", "proposal", "approval", "receipt", "attribution", "overlay", "overlayDuplicate"] as const)("rejects changed %s provenance", field => {
    const changed = structuredClone(input);
    if (field === "source") changed.sources[0].bytes[10] ^= 1;
    if (field === "sourceId") changed.sources[0].id = "wrong-source";
    if (field === "sourceScope") changed.sources.push(changed.sources[0]);
    if (field === "extractedText") changed.sources[3].bytes[10] ^= 1;
    if (field === "chronology") changed.chronology.candidates[0].recordId = "wrong";
    if (field === "prior") changed.priorAuthority.remainingCandidateFields--;
    if (field === "seed") (changed.seed as { recordCount: number }).recordCount--;
    if (field === "seedFund") changed.seedFund.managerName = "different";
    if (field === "proposal") (changed.proposal as { rationale: string }).rationale = "different";
    if (field === "approval") (changed.approval as { reviewedBy: string }).reviewedBy = "different";
    if (field === "receipt") (changed.receipt as { transactionId: string }).transactionId = "different";
    if (field === "attribution") (changed.attribution.receipt as { changed: number }).changed++;
    const overlay = changed.seedOverlay.find(row => row.proposalSha256 === CHIEF.proposalSha256)!;
    if (field === "overlay") overlay.canonicalAfterImage = {};
    if (field === "overlayDuplicate") changed.seedOverlay.push(overlay);
    expect(() => proveChiefPowerFieldAuthority(changed)).toThrow();
  });
  it.each(["company", "active", "owner", "fundId", "fundManager", "fundName", "fundStatus", "metadata", "scope", "redirect", "stake", "vehicle", "organization", "pending", "historicalMetadata", "historicalExit"] as const)("rejects changed current %s state", field => {
    const changed = structuredClone(input), owner = changed.production.owners.find(r => r.id === "cmsqy1ks0000hee4s99nkni2v")!;
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
    const image = changed.production.images[0] as { ownershipPeriods: Array<{ stake: string; vehicleName: string; organizationName: string; exitYear: number | null }>; pendingOwnershipTransactions: unknown[] };
    if (field === "stake") image.ownershipPeriods[1].stake = "99%";
    if (field === "vehicle") image.ownershipPeriods[1].vehicleName = "invented";
    if (field === "organization") image.ownershipPeriods[1].organizationName = "different";
    if (field === "pending") image.pendingOwnershipTransactions.push({ target: "invented" });
    if (field === "historicalMetadata") changed.production.owners.find(r => !r.isActive)!.fundAttribution = "DISCLOSED";
    if (field === "historicalExit") image.ownershipPeriods.find(r => r.exitYear === 2020)!.exitYear = 2021;
    expect(() => proveChiefPowerFieldAuthority(changed)).toThrow();
  });
});
