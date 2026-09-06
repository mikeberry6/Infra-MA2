import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { VIG, VIG_OWNERS, VIG_SOURCES, VIG_SOURCE_ROOT, VIG_PACKET, VIG_TASK_ROOT, proveVigFieldAuthority, type VigInput } from "./vig-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";
const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const base = "audits/portco-reconciliation/2026-08-03";
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
const [manifest, approval, receipt] = reference.sourceFiles.map((file: { path: string }) => json(file.path));
const snapshot = json(`${VIG_SOURCE_ROOT}/production-snapshot.json`), report = json(`${VIG_SOURCE_ROOT}/authority.json`);
const input: VigInput = {
  chronology, priorAuthority: json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/rover/authority.json"),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal: json(`${base}/proposals/0109-virginia-international-gateway-v2/proposal.json`), approval: json(`${base}/approvals/0109-virginia-international-gateway-v2.json`),
  receipt: json(`${VIG_TASK_ROOT}/../attempt-2/production-apply/apply-receipt.json`), correction: json(`${VIG_TASK_ROOT}/../attempt-2/research-binding.json`),
  supersededProposal: json(`${base}/proposals/0109-virginia-international-gateway-v1/proposal.json`),
  seedOverlay: json("prisma/seed-data/approved-portco-after-images.json"), attribution: { manifest, approval, receipt }, production: snapshot.production,
  packet: VIG_PACKET.map(([file]) => ({ file, bytes: readFileSync(`${VIG_TASK_ROOT}/${file}`) })),
  sources: VIG_SOURCES.map(source => ({ id: source.id, bytes: readFileSync(`${VIG_SOURCE_ROOT}/${source.file}`) })),
};
const bytesHash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const fingerprint = (value: VigInput) => sha256Canonical({ ...value,
  packet: value.packet.map(file => ({ file: file.file, sha256: bytesHash(file.bytes) })),
  sources: value.sources.map(source => ({ id: source.id, sha256: bytesHash(source.bytes) })) });

describe("VIG exact attribution authority preserves manager versus beneficial owner boundaries", () => {
  it("reproduces the complete frozen proof, dependencies and untouched input", () => {
    const before = fingerprint(input), result = proveVigFieldAuthority(input);
    expect(report.reportSha256).toBe("0efafc3302187108546b285b45500f21ea42829c0a656d6606fb198fbdb39587");
    expect(hashWithoutField(report, "reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path, "utf8"))).toBe(file.sha256);
    for (const [key, value] of Object.entries(result)) expect(report[key]).toEqual(value);
    expect([result.candidateFieldsAdjudicated, result.cumulativeCandidateFieldsAdjudicated, result.remainingCandidateFields]).toEqual([3, 75, 528]);
    expect(fingerprint(input)).toBe(before);
  });
  it("adjudicates three original fields, with three production and one overlapping seed correction", () => {
    const result = proveVigFieldAuthority(input), fields = result.rows.flatMap(row => row.fieldDecisions);
    expect(fields).toHaveLength(3);
    expect(fields.filter(f => f.productionWriteRequired)).toHaveLength(3);
    expect(fields.filter(f => f.seedPersistenceRequired)).toHaveLength(1);
    expect(fields.every(f => !f.outsideOriginal603 && f.primarySourceUrl && f.primarySourceSha256)).toBe(true);
    expect(result.rows[0].recommended.fundAttribution).toBe("UNRESOLVED");
    expect(result.rows[0].recommended.attributionRationale).toEqual(result.rows[0].seedExpectation.attributionRationale);
    expect(result.rows[1].recommended.fundAttribution).toBe("DIRECT_PROGRAM");
    expect(result.rows[1].fieldDecisions.every(f => f.primarySourceUrl === VIG_SOURCES[4].url)).toBe(true);
    expect(result.rows[0].fieldDecisions[0].primarySourceUrl).toBe(VIG_SOURCES[0].url);
  });
  it("preserves exact exceptions, null vehicles and the historical Fund II period", () => {
    const result = proveVigFieldAuthority(input);
    for (const [index, row] of result.rows.entries()) {
      expect(row.preserves.vehicleName).toBeNull();
      expect(row.preserves.investmentYear).toBeNull();
      expect(row.preserves.stake).toBe(VIG_OWNERS[index].stake);
      expect(row.recommended.linkedFundName).toBeNull();
      expect(row.recommended.attributedFundName).toBeNull();
      expect(row.recommended.attributionConfidence).toBeNull();
      expect(row.seedVehicleQualification).toContain("display fallback");
      expect(row.originalAttributionReceiptAbsent).toBe(true);
    }
    expect(result.missingSeedUpsertBindings).toBe(2);
    expect(result.preservedOwners[0].core.vehicleName).toBe("Alinda Infrastructure Fund II");
    expect(result.preservedOwners[0].core.investmentYear).toBe(2014);
    expect(result.preservedOwners[0].core.exitYear).toBe(2019);
    expect(result.preservedOwners[0].metadata.attributionRationale).toBeNull();
    expect(result.additionalIssuesNotAdjudicated).toHaveLength(0);
    expect(result.qualifications.join(" ")).toContain("USS is narrative-only");
    expect(result.qualifications.join(" ")).toContain("not asserted to be an additional beneficial owner");
  });
  it("binds all five identical historical source responses and ten-file repaired research packet", () => {
    const result = proveVigFieldAuthority(input), capture = json(`${VIG_SOURCE_ROOT}/source-capture.json`);
    expect(sha256Canonical(capture)).toBe(report.sourceCaptureSha256);
    expect(capture.sources).toHaveLength(5);
    for (const source of VIG_SOURCES) {
      const record = capture.sources.find((row: { id: string }) => row.id === source.id);
      expect(record.sha256).toBe(source.sha256); expect(record.requestedUrl).toBe(source.url); expect(record.finalUrl).toBe(source.url); expect(record.httpStatus).toBe(200);
    }
    expect(capture.sources[4].byteLength).toBe(24146908);
    expect(result.historicalPacket).toHaveLength(10);
    expect(result.qualifications.join(" ")).toContain("pointer-only index");
    expect(result.qualifications.join(" ")).toContain("One mechanical ChatGPT repair");
    expect(result.correctionSha256).toBe(VIG.bindingSha256);
    expect(result.qualifications.join(" ")).toContain("hyphen to em dash");
    expect([result.databaseWrites, result.seedChanges, result.sourceTransitions, result.applyAuthorized, result.completionAllowed]).toEqual([0, 0, 0, false, false]);
    expect(result).not.toHaveProperty("mutations");
  });
  it.each(VIG_PACKET)("rejects changed historical %s bytes", file => {
    const changed = structuredClone(input); changed.packet.find(row => row.file === file)!.bytes[0] ^= 1;
    expect(() => proveVigFieldAuthority(changed)).toThrow("Historical packet bytes changed");
  });
  it.each(VIG_SOURCES)("rejects changed source $id bytes", source => {
    const changed = structuredClone(input); changed.sources.find(row => row.id === source.id)!.bytes[0] ^= 1;
    expect(() => proveVigFieldAuthority(changed)).toThrow("Reviewed source bytes changed");
  });
  it.each(["sourceId", "sourceScope", "packetScope", "packetId", "chronology", "prior", "seed", "proposal", "approval", "receipt", "attribution", "overlay", "overlayDuplicate", "correction", "predecessor"] as const)("rejects changed %s provenance", field => {
    const changed = structuredClone(input);
    if (field === "sourceId") changed.sources[0].id = "wrong-source";
    if (field === "sourceScope") changed.sources.push(changed.sources[0]);
    if (field === "packetScope") changed.packet.pop();
    if (field === "packetId") changed.packet[0].file = changed.packet[1].file;
    if (field === "chronology") changed.chronology.candidates[0].recordId = "wrong";
    if (field === "prior") changed.priorAuthority.remainingCandidateFields--;
    if (field === "seed") (changed.seed as { recordCount: number }).recordCount--;
    if (field === "proposal") (changed.proposal as { rationale: string }).rationale = "different";
    if (field === "approval") (changed.approval as { reviewedBy: string }).reviewedBy = "different";
    if (field === "receipt") (changed.receipt as { transactionId: string }).transactionId = "different";
    if (field === "attribution") (changed.attribution.receipt as { changed: number }).changed++;
    const overlay = changed.seedOverlay.find(row => row.proposalSha256 === VIG.proposalSha256)!;
    if (field === "overlay") overlay.canonicalAfterImage = {};
    if (field === "overlayDuplicate") changed.seedOverlay.push(overlay);
    if (field === "correction") (changed.correction as { attempt: number }).attempt++;
    if (field === "predecessor") (changed.supersededProposal as { rationale: string }).rationale = "different";
    expect(() => proveVigFieldAuthority(changed)).toThrow();
  });
  it.each(["company", "active", "owner", "fundId", "metadata", "scope", "redirect", "stake", "vehicle", "organization", "pending", "entryYear", "exitYear", "extraOwner", "description"] as const)("rejects changed current %s state", field => {
    const changed = structuredClone(input), owner = changed.production.owners[0];
    if (field === "company") owner.companyId = "other-company";
    if (field === "active") owner.isActive = false;
    if (field === "owner") owner.id = "different";
    if (field === "fundId") owner.fundId = "inferred-later-astatine-fund";
    if (field === "metadata") owner.attributionRationale = "different";
    if (field === "scope") changed.production.owners.push(owner);
    if (field === "redirect") changed.production.redirects.push({ companyId: "different" });
    const image = changed.production.images[0] as { description: string; ownershipPeriods: Array<{ stake: string; vehicleName: string; organizationName: string; investmentYear: number; exitYear: number | null }>; pendingOwnershipTransactions: unknown[] };
    if (field === "stake") image.ownershipPeriods[0].stake = "50%";
    if (field === "vehicle") image.ownershipPeriods[0].vehicleName = "Astatine Investment Partners";
    if (field === "organization") image.ownershipPeriods[0].organizationName = "VIG";
    if (field === "pending") image.pendingOwnershipTransactions.push({ target: "VPA" });
    if (field === "entryYear") image.ownershipPeriods[0].investmentYear = 2014;
    if (field === "exitYear") image.ownershipPeriods[0].exitYear = 2025;
    if (field === "extraOwner") image.ownershipPeriods.push(image.ownershipPeriods[0]);
    if (field === "description") image.description = "VPA acquired title in 2025";
    expect(() => proveVigFieldAuthority(changed)).toThrow();
  });
  it.each(["cmsy7x07j0008dx6hgibhfue0", "cmsy7x0bx0009dx6h6mp61aj3", "cmsy7x0fq000adx6h6ui4jj4g"])("rejects owner %s metadata drift", id => {
    const changed = structuredClone(input); changed.production.owners.find(row => row.id === id)!.attributionConfidence = "LOW";
    expect(() => proveVigFieldAuthority(changed)).toThrow();
  });
});
