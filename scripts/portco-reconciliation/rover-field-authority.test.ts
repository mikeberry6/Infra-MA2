import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { ROVER, ROVER_SOURCES, ROVER_SOURCE_ROOT, ROVER_PACKET, ROVER_TASK_ROOT, proveRoverFieldAuthority, type RoverInput } from "./rover-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const out = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/rover";
const base = "audits/portco-reconciliation/2026-08-03";
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
const [manifest, approval, receipt] = reference.sourceFiles.map((file: { path: string }) => json(file.path));
const snapshot = json(`${out}/production-snapshot.json`), report = json(`${out}/authority.json`);
const input: RoverInput = {
  chronology, priorAuthority: json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/pike/authority.json"),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"), seedFund: json("prisma/seed-data/funds.manifest.json").funds.find((fund: { id: string }) => fund.id === "FUND-021"),
  proposal: json(`${base}/proposals/0091-rover-pipeline-v2/proposal.json`), approval: json(`${base}/approvals/0091-rover-pipeline-v2.json`),
  receipt: json(`${ROVER_TASK_ROOT}/../attempt-2/production-apply/apply-receipt.json`),
  correction: json(`${ROVER_TASK_ROOT}/../attempt-2/execution-correction.json`),
  supersededProposal: json(`${base}/proposals/0091-rover-pipeline-v1/proposal.json`),
  seedOverlay: json("prisma/seed-data/approved-portco-after-images.json"), attribution: { manifest, approval, receipt }, production: snapshot.production,
  packet: ROVER_PACKET.map(([file]) => ({ file, bytes: readFileSync(`${ROVER_TASK_ROOT}/${file}`) })),
  sources: ROVER_SOURCES.map(source => ({ id: source.id, bytes: readFileSync(`${ROVER_SOURCE_ROOT}/${source.file}`) })),
};
const bytesHash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const inputFingerprint = (value: RoverInput) => sha256Canonical({ ...value,
  packet: value.packet.map(file => ({ file: file.file, sha256: bytesHash(file.bytes) })),
  sources: value.sources.map(source => ({ id: source.id, sha256: bytesHash(source.bytes) })) });

describe("Rover ACI authority preserves indirect stake, complete owner image and attempt2 lineage", () => {
  it("reproduces the entire frozen proof and dependencies without input mutation", () => {
    const before = inputFingerprint(input), result = proveRoverFieldAuthority(input);
    expect(report.reportSha256).toBe("103fb9d7710f205f0369dc7c3be8ace80f0e3038b7b68377f4154e8c406512dd");
    expect(hashWithoutField(report, "reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path, "utf8"))).toBe(file.sha256);
    for (const [key, value] of Object.entries(result)) expect(report[key]).toEqual(value);
    expect([result.candidateFieldsAdjudicated, result.cumulativeCandidateFieldsAdjudicated, result.remainingCandidateFields]).toEqual([3, 72, 531]);
    expect(inputFingerprint(input)).toBe(before);
  });
  it("requires three production corrections and one overlapping seed rationale, with one primary per field", () => {
    const result = proveRoverFieldAuthority(input), row = result.rows[0], fields = row.fieldDecisions;
    expect(fields).toHaveLength(3);
    expect(fields.filter(f => f.productionWriteRequired)).toHaveLength(3);
    expect(fields.filter(f => f.seedPersistenceRequired)).toHaveLength(1);
    expect(fields.every(f => f.primarySourceUrl === ROVER_SOURCES[0].url && f.primarySection === "Item 2.03 — Rover Credit Agreement" && !f.outsideOriginal603)).toBe(true);
    expect(result.additionalFieldsOutsideOriginal603).toBe(0);
    expect(row.recommended.fundAttribution).toBe("DISCLOSED");
    expect(row.recommended.attributionConfidence).toBeNull();
    expect(row.recommended.linkedFundName).toBe(ROVER.fundName);
    expect(row.recommended.attributedFundName).toBe(ROVER.fundName);
    expect(row.preserves.stake).toBe(ROVER.stake);
    expect(row.preserves.investmentYear).toBe(2026);
    expect(row.preserves.vehicleName).toBe(ROVER.vehicle);
  });
  it("preserves distinct record IDs, missing upsert lineage, historical capture qualifications and no-write boundary", () => {
    const result = proveRoverFieldAuthority(input);
    expect([result.rows[0].recordId, result.rows[0].originalRecordId]).toEqual(["OFA-384A8A142A91", "OFA-A2B471D234C3"]);
    expect(result.missingSeedUpsertBindings).toBe(1);
    expect(result.historicalPacket).toHaveLength(9);
    expect(result.canonicalResearchSha256).toBe(ROVER.researchSha256);
    expect(result.qualifications.join(" ")).toContain("pointer-only index");
    expect(result.qualifications.join(" ")).toContain("zero ChatGPT repairs");
    expect(result.qualifications.join(" ")).toContain("script/noscript");
    expect([result.databaseWrites, result.seedChanges, result.sourceTransitions, result.applyAuthorized, result.completionAllowed]).toEqual([0, 0, 0, false, false]);
    expect(result).not.toHaveProperty("mutations");
  });
  it("binds the complete SEC response and its exact historical exhibit despite delivery-only additions", () => {
    const raw = Buffer.from(input.sources[0].bytes), historical = raw.toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");
    expect(raw.length).toBe(36177);
    expect(Buffer.byteLength(historical)).toBe(35817);
    expect(bytesHash(Buffer.from(historical))).toBe("40bc64b55a39e864f746e171234f0d95d01be9f8eccbdce030cfdefda270350e");
    const capture = json(`${out}/source-capture.json`);
    expect(sha256Canonical(capture)).toBe(report.sourceCaptureSha256);
    expect(capture.sources[0].sha256).toBe(bytesHash(raw));
    expect(capture.sources[0].requestedUrl).toBe(ROVER_SOURCES[0].url);
    expect(capture.sources[0].httpStatus).toBe(200);
  });
  it.each(ROVER_PACKET)("rejects changed historical %s bytes", file => {
    const changed = structuredClone(input);
    changed.packet.find(row => row.file === file)!.bytes[0] ^= 1;
    expect(() => proveRoverFieldAuthority(changed)).toThrow("Historical packet bytes changed");
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
    const overlay = changed.seedOverlay.find(row => row.proposalSha256 === ROVER.proposalSha256)!;
    if (field === "overlay") overlay.canonicalAfterImage = {};
    if (field === "overlayDuplicate") changed.seedOverlay.push(overlay);
    expect(() => proveRoverFieldAuthority(changed)).toThrow();
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
    if (field === "stake") image.ownershipPeriods[0].stake = "49.9% of Rover Pipeline LLC";
    if (field === "vehicle") image.ownershipPeriods[0].vehicleName = "invented";
    if (field === "organization") image.ownershipPeriods[0].organizationName = "different";
    if (field === "pending") image.pendingOwnershipTransactions.push({ target: "invented" });
    if (field === "entryYear") image.ownershipPeriods[0].investmentYear = 2017;
    if (field === "exitYear") image.ownershipPeriods[0].exitYear = 2026;
    if (field === "extraOwner") image.ownershipPeriods.push(image.ownershipPeriods[0]);
    if (field === "economicClaim") image.description = "Ares holds 49.9% of operating Rover, not an indirect holding-company interest.";
    expect(() => proveRoverFieldAuthority(changed)).toThrow();
  });

  it("binds the non-replayed corrected action set and preserves other owners without adjudicating their rationale issues", () => {
    const result = proveRoverFieldAuthority(input);
    expect(result.correctionSha256).toBe("5e7f2754801e53582063a963287ba832c71e6d1f2b4f54175ec6edb80373385c");
    expect(result.supersededProposalSha256).toBe("7239da5d04940a4a6fb5d9f3f9418dfaf9e3783338507111ac0fc077a2024ef0");
    expect(result.preservedOwners).toHaveLength(3);
    expect(result.preservedOwners.filter(row => row.core.isActive)).toHaveLength(2);
    expect(result.preservedOwners.find(row => row.core.managerName === "Energy Transfer LP")!.core.investmentYear).toBeNull();
    expect(result.preservedOwners.find(row => row.core.managerName === "Blackstone")!.core.exitYear).toBe(2026);
    expect(result.additionalIssuesNotAdjudicated).toHaveLength(2);
    expect(result.additionalIssuesNotAdjudicated.every(row => row.outsideOriginal603)).toBe(true);
    expect(result.additionalFieldsOutsideOriginal603).toBe(0);
    const image = input.production.images[0] as { citations: Array<{ isPrimary: boolean; url: string }> };
    expect(image.citations.filter(row => row.isPrimary)).toHaveLength(1);
    expect(image.citations.find(row => row.isPrimary)!.url).toContain("blackstone.com");
    expect(result.rows[0].fieldDecisions.every(row => row.primarySourceUrl.includes("aci-20260428.htm"))).toBe(true);
  });
  it.each(["correction", "predecessor"] as const)("rejects changed %s lineage", field => {
    const changed = structuredClone(input);
    if (field === "correction") (changed.correction as { newChatgptConversationStarted: boolean }).newChatgptConversationStarted = true;
    else (changed.supersededProposal as { actions: string[] }).actions.push("RETIRE_OWNERSHIP");
    expect(() => proveRoverFieldAuthority(changed)).toThrow();
  });
  it.each(["cmrxpjus401ljivhe34mwseet", "cmsvbu6a20009i26htjxkt26v", "cmsvbu6aj000bi26hy4frkjxt"])("rejects other-owner %s metadata drift", id => {
    const changed = structuredClone(input);
    changed.production.owners.find(row => row.id === id)!.attributionRationale = "changed";
    expect(() => proveRoverFieldAuthority(changed)).toThrow();
  });
  it.each(["identity", "vehicle", "stake", "year", "fund", "active"] as const)("rejects non-target current-owner %s drift", field => {
    const changed = structuredClone(input);
    const image = changed.production.images[0] as { ownershipPeriods: Array<{ id: string; vehicleName: string; stake: string; investmentYear: number | null; fundName: string | null; isActive: boolean }> };
    const owner = image.ownershipPeriods.find(row => row.id === "cmsvbu6a20009i26htjxkt26v")!;
    if (field === "identity") owner.id = "other";
    if (field === "vehicle") owner.vehicleName = "other";
    if (field === "stake") owner.stake = "65%";
    if (field === "year") owner.investmentYear = 2017;
    if (field === "fund") owner.fundName = ROVER.fundName;
    if (field === "active") owner.isActive = false;
    expect(() => proveRoverFieldAuthority(changed)).toThrow();
  });

});
