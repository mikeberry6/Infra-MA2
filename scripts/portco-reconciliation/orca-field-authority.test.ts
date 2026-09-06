import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { ORCA, ORCA_SOURCES, ORCA_SOURCE_ROOT, ORCA_PACKET, ORCA_TASK_ROOT, proveOrcaFieldAuthority, type OrcaInput } from "./orca-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const out = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/orca";
const base = "audits/portco-reconciliation/2026-08-03";
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
const [manifest, approval, receipt] = reference.sourceFiles.map((file: { path: string }) => json(file.path));
const snapshot = json(`${out}/production-snapshot.json`), report = json(`${out}/authority.json`);
const input: OrcaInput = {
  chronology, priorAuthority: json(`${ORCA_SOURCE_ROOT}/authority.json`),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"), seedFund: json("prisma/seed-data/funds.manifest.json").funds.find((fund: { id: string }) => fund.id === "FUND-153"),
  proposal: json(`${base}/proposals/0079-orca-v1/proposal.json`), approval: json(`${base}/approvals/0079-orca-v1.json`),
  receipt: json(`${ORCA_TASK_ROOT}/production-apply/apply-receipt.json`),
  seedOverlay: json("prisma/seed-data/approved-portco-after-images.json"), attribution: { manifest, approval, receipt }, production: snapshot.production,
  packet: ORCA_PACKET.map(([file]) => ({ file, bytes: readFileSync(`${ORCA_TASK_ROOT}/${file}`) })),
  sources: ORCA_SOURCES.map(source => ({ id: source.id, bytes: readFileSync(`${ORCA_SOURCE_ROOT}/${source.file}`) })),
};
const bytesHash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const inputFingerprint = (value: OrcaInput) => sha256Canonical({ ...value,
  packet: value.packet.map(file => ({ file: file.file, sha256: bytesHash(file.bytes) })),
  sources: value.sources.map(source => ({ id: source.id, sha256: bytesHash(source.bytes) })) });

describe("Orca's disclosed Fund VI authority preserves Class A versus economic rights", () => {
  it("reproduces the entire frozen proof and dependencies without input mutation", () => {
    const before = inputFingerprint(input), result = proveOrcaFieldAuthority(input);
    expect(report.reportSha256).toBe("59d996bc96ecab05d52240f497c2753db6528106127eebec3186a520d8b82aa4");
    expect(hashWithoutField(report, "reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path, "utf8"))).toBe(file.sha256);
    for (const [key, value] of Object.entries(result)) expect(report[key]).toEqual(value);
    expect([result.candidateFieldsAdjudicated, result.cumulativeCandidateFieldsAdjudicated, result.remainingCandidateFields]).toEqual([3, 66, 537]);
    expect(inputFingerprint(input)).toBe(before);
  });
  it("requires three production corrections and one overlapping seed rationale, with one primary per field", () => {
    const result = proveOrcaFieldAuthority(input), row = result.rows[0], fields = row.fieldDecisions;
    expect(fields).toHaveLength(3);
    expect(fields.filter(f => f.productionWriteRequired)).toHaveLength(3);
    expect(fields.filter(f => f.seedPersistenceRequired)).toHaveLength(1);
    expect(fields.every(f => f.primarySourceUrl === ORCA_SOURCES[0].url && f.primaryOneBasedPage === 19 && !f.outsideOriginal603)).toBe(true);
    expect(result.additionalFieldsOutsideOriginal603).toBe(0);
    expect(row.recommended.fundAttribution).toBe("DISCLOSED");
    expect(row.recommended.attributionConfidence).toBeNull();
    expect(row.recommended.linkedFundName).toBe(ORCA.fundName);
    expect(row.recommended.attributedFundName).toBe(ORCA.fundName);
    expect(row.preserves.stake).toBe(ORCA.stake);
    expect(row.preserves.investmentYear).toBe(2016);
    expect(row.preserves.vehicleName).toBe(ORCA.vehicle);
  });
  it("preserves distinct record IDs, missing upsert lineage, historical capture qualifications and no-write boundary", () => {
    const result = proveOrcaFieldAuthority(input);
    expect([result.rows[0].recordId, result.rows[0].originalRecordId]).toEqual(["OFA-65C03C85D47B", "OFA-C7BD6865BEFB"]);
    expect(result.missingSeedUpsertBindings).toBe(1);
    expect(result.historicalPacket).toHaveLength(13);
    expect(result.canonicalResearchSha256).toBe(ORCA.researchSha256);
    expect(result.qualifications.join(" ")).toContain("normalized virtualized-editor capture");
    expect(result.qualifications.join(" ")).toContain("not a byte-for-byte conversation export");
    expect(result.qualifications.join(" ")).toContain("does not name Fund VI");
    expect([result.databaseWrites, result.seedChanges, result.sourceTransitions, result.applyAuthorized, result.completionAllowed]).toEqual([0, 0, 0, false, false]);
    expect(result).not.toHaveProperty("mutations");
  });
  it.each(ORCA_PACKET)("rejects changed historical %s bytes", file => {
    const changed = structuredClone(input);
    changed.packet.find(row => row.file === file)!.bytes[0] ^= 1;
    expect(() => proveOrcaFieldAuthority(changed)).toThrow("Historical packet bytes changed");
  });
  it.each(["source", "sourceId", "sourceScope", "extractedText", "packetScope", "packetId", "chronology", "prior", "seed", "seedFund", "proposal", "approval", "receipt", "attribution", "overlay", "overlayDuplicate"] as const)("rejects changed %s provenance", field => {
    const changed = structuredClone(input);
    if (field === "source") changed.sources[0].bytes[10] ^= 1;
    if (field === "sourceId") changed.sources[0].id = "wrong-source";
    if (field === "sourceScope") changed.sources.push(changed.sources[0]);
    if (field === "extractedText") changed.sources[2].bytes[10] ^= 1;
    if (field === "packetScope") changed.packet.pop();
    if (field === "packetId") changed.packet[0].file = changed.packet[1].file;
    if (field === "chronology") changed.chronology.candidates[0].recordId = "wrong";
    if (field === "prior") changed.priorAuthority.remainingCandidateFields--;
    if (field === "seed") (changed.seed as { recordCount: number }).recordCount--;
    if (field === "seedFund") changed.seedFund.managerName = "different";
    if (field === "proposal") (changed.proposal as { rationale: string }).rationale = "different";
    if (field === "approval") (changed.approval as { reviewedBy: string }).reviewedBy = "different";
    if (field === "receipt") (changed.receipt as { transactionId: string }).transactionId = "different";
    if (field === "attribution") (changed.attribution.receipt as { changed: number }).changed++;
    const overlay = changed.seedOverlay.find(row => row.proposalSha256 === ORCA.proposalSha256)!;
    if (field === "overlay") overlay.canonicalAfterImage = {};
    if (field === "overlayDuplicate") changed.seedOverlay.push(overlay);
    expect(() => proveOrcaFieldAuthority(changed)).toThrow();
  });
  it.each(["company", "active", "owner", "fundId", "fundManager", "fundName", "fundStatus", "metadata", "scope", "redirect", "stake", "vehicle", "organization", "pending", "entryYear", "exitYear", "extraOwner", "economicClaim"] as const)("rejects changed current %s state", field => {
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
    const image = changed.production.images[0] as { description: string; ownershipPeriods: Array<{ stake: string; vehicleName: string; organizationName: string; investmentYear: number; exitYear: number | null }>; pendingOwnershipTransactions: unknown[] };
    if (field === "stake") image.ownershipPeriods[0].stake = "95% overall economics";
    if (field === "vehicle") image.ownershipPeriods[0].vehicleName = "invented";
    if (field === "organization") image.ownershipPeriods[0].organizationName = "different";
    if (field === "pending") image.pendingOwnershipTransactions.push({ target: "invented" });
    if (field === "entryYear") image.ownershipPeriods[0].investmentYear = 2015;
    if (field === "exitYear") image.ownershipPeriods[0].exitYear = 2026;
    if (field === "extraOwner") image.ownershipPeriods.push(image.ownershipPeriods[0]);
    if (field === "economicClaim") image.description = "Olympus has precisely 5% of overall economics.";
    expect(() => proveOrcaFieldAuthority(changed)).toThrow();
  });
});
