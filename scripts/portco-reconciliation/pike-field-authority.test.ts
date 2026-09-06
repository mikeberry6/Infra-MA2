import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { PIKE, PIKE_SOURCES, PIKE_SOURCE_ROOT, PIKE_PACKET, PIKE_TASK_ROOT, provePikeFieldAuthority, type PikeInput } from "./pike-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const out = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/pike";
const base = "audits/portco-reconciliation/2026-08-03";
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
const [manifest, approval, receipt] = reference.sourceFiles.map((file: { path: string }) => json(file.path));
const snapshot = json(`${out}/production-snapshot.json`), report = json(`${out}/authority.json`);
const input: PikeInput = {
  chronology, priorAuthority: json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/orca/authority.json"),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"), seedFund: json("prisma/seed-data/funds.manifest.json").funds.find((fund: { id: string }) => fund.id === "FUND-153"),
  proposal: json(`${base}/proposals/0081-pike-holdings-transmontaigne-partners-llc-v1/proposal.json`), approval: json(`${base}/approvals/0081-pike-holdings-transmontaigne-partners-llc-v1.json`),
  receipt: json(`${PIKE_TASK_ROOT}/production-apply/apply-receipt.json`),
  seedOverlay: json("prisma/seed-data/approved-portco-after-images.json"), attribution: { manifest, approval, receipt }, production: snapshot.production,
  packet: PIKE_PACKET.map(([file]) => ({ file, bytes: readFileSync(`${PIKE_TASK_ROOT}/${file}`) })),
  sources: PIKE_SOURCES.map(source => ({ id: source.id, bytes: readFileSync(`${PIKE_SOURCE_ROOT}/${source.file}`) })),
};
const bytesHash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const inputFingerprint = (value: PikeInput) => sha256Canonical({ ...value,
  packet: value.packet.map(file => ({ file: file.file, sha256: bytesHash(file.bytes) })),
  sources: value.sources.map(source => ({ id: source.id, sha256: bytesHash(source.bytes) })) });

describe("TransMontaigne Fund VI authority preserves platform versus Pike-shell ownership", () => {
  it("reproduces the entire frozen proof and dependencies without input mutation", () => {
    const before = inputFingerprint(input), result = provePikeFieldAuthority(input);
    expect(report.reportSha256).toBe("84ff5200c20e35c4f4b3ee807288c1a548beb0b00321975e0256372ec2caa100");
    expect(hashWithoutField(report, "reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path, "utf8"))).toBe(file.sha256);
    for (const [key, value] of Object.entries(result)) expect(report[key]).toEqual(value);
    expect([result.candidateFieldsAdjudicated, result.cumulativeCandidateFieldsAdjudicated, result.remainingCandidateFields]).toEqual([3, 69, 534]);
    expect(inputFingerprint(input)).toBe(before);
  });
  it("requires three production corrections and one overlapping seed rationale, with one primary per field", () => {
    const result = provePikeFieldAuthority(input), row = result.rows[0], fields = row.fieldDecisions;
    expect(fields).toHaveLength(3);
    expect(fields.filter(f => f.productionWriteRequired)).toHaveLength(3);
    expect(fields.filter(f => f.seedPersistenceRequired)).toHaveLength(1);
    expect(fields.every(f => f.primarySourceUrl === PIKE_SOURCES[0].url && f.primarySection === "About TransMontaigne" && !f.outsideOriginal603)).toBe(true);
    expect(result.additionalFieldsOutsideOriginal603).toBe(0);
    expect(row.recommended.fundAttribution).toBe("DISCLOSED");
    expect(row.recommended.attributionConfidence).toBeNull();
    expect(row.recommended.linkedFundName).toBe(PIKE.fundName);
    expect(row.recommended.attributedFundName).toBe(PIKE.fundName);
    expect(row.preserves.stake).toBe(PIKE.stake);
    expect(row.preserves.investmentYear).toBe(2016);
    expect(row.preserves.vehicleName).toBe(PIKE.vehicle);
  });
  it("preserves distinct record IDs, missing upsert lineage, historical capture qualifications and no-write boundary", () => {
    const result = provePikeFieldAuthority(input);
    expect([result.rows[0].recordId, result.rows[0].originalRecordId]).toEqual(["OFA-917913E3AD1F", "OFA-606DBBE1ED4A"]);
    expect(result.missingSeedUpsertBindings).toBe(1);
    expect(result.historicalPacket).toHaveLength(13);
    expect(result.canonicalResearchSha256).toBe(PIKE.researchSha256);
    expect(result.qualifications.join(" ")).toContain("code-block-copied repaired JSON");
    expect(result.qualifications.join(" ")).toContain("not a complete raw trace");
    expect(result.qualifications.join(" ")).toContain("script/noscript");
    expect([result.databaseWrites, result.seedChanges, result.sourceTransitions, result.applyAuthorized, result.completionAllowed]).toEqual([0, 0, 0, false, false]);
    expect(result).not.toHaveProperty("mutations");
  });
  it("binds the complete SEC response and its exact historical exhibit despite delivery-only additions", () => {
    const raw = Buffer.from(input.sources[0].bytes), historical = raw.toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");
    expect(raw.length).toBe(11522);
    expect(Buffer.byteLength(historical)).toBe(11162);
    expect(bytesHash(Buffer.from(historical))).toBe("99e9a0944d5e97cfff0a2284ad81d09b7dfeb8d41befe0a38994ff0569e84b6d");
    const capture = json(`${out}/source-capture.json`);
    expect(sha256Canonical(capture)).toBe(report.sourceCaptureSha256);
    expect(capture.sources[0].sha256).toBe(bytesHash(raw));
    expect(capture.sources[0].requestedUrl).toBe(PIKE_SOURCES[0].url);
    expect(capture.sources[0].httpStatus).toBe(200);
  });
  it.each(PIKE_PACKET)("rejects changed historical %s bytes", file => {
    const changed = structuredClone(input);
    changed.packet.find(row => row.file === file)!.bytes[0] ^= 1;
    expect(() => provePikeFieldAuthority(changed)).toThrow("Historical packet bytes changed");
  });
  it.each(["source", "sourceId", "sourceScope", "packetScope", "packetId", "chronology", "prior", "seed", "seedFund", "proposal", "approval", "receipt", "attribution", "overlay", "overlayDuplicate"] as const)("rejects changed %s provenance", field => {
    const changed = structuredClone(input);
    if (field === "source") changed.sources[0].bytes[10] ^= 1;
    if (field === "sourceId") changed.sources[0].id = "wrong-source";
    if (field === "sourceScope") changed.sources.push(changed.sources[0]);
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
    const overlay = changed.seedOverlay.find(row => row.proposalSha256 === PIKE.proposalSha256)!;
    if (field === "overlay") overlay.canonicalAfterImage = {};
    if (field === "overlayDuplicate") changed.seedOverlay.push(overlay);
    expect(() => provePikeFieldAuthority(changed)).toThrow();
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
    if (field === "stake") image.ownershipPeriods[0].stake = "100% of Pike Petroleum Holdings, LLC";
    if (field === "vehicle") image.ownershipPeriods[0].vehicleName = "invented";
    if (field === "organization") image.ownershipPeriods[0].organizationName = "different";
    if (field === "pending") image.pendingOwnershipTransactions.push({ target: "invented" });
    if (field === "entryYear") image.ownershipPeriods[0].investmentYear = 2019;
    if (field === "exitYear") image.ownershipPeriods[0].exitYear = 2026;
    if (field === "extraOwner") image.ownershipPeriods.push(image.ownershipPeriods[0]);
    if (field === "economicClaim") image.description = "Pike Holdings is currently 54% owned by ArcLight.";
    expect(() => provePikeFieldAuthority(changed)).toThrow();
  });
});
