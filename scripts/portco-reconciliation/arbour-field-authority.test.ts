import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { ARBOUR, ARBOUR_SOURCES, ARBOUR_SOURCE_ROOT, ARBOUR_PACKET, ARBOUR_TASK_ROOT, proveArbourFieldAuthority, type ArbourInput } from "./arbour-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";
const json = (path: string) => JSON.parse(readFileSync(path,"utf8"));
const base = "audits/portco-reconciliation/2026-08-03";
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json");
const reference = chronology.receiptReferences.find((row: {pipelineRunId: string}) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
const [manifest, approval, receipt] = reference.sourceFiles.map((file: {path: string}) => json(file.path));
const snapshot = json(`${ARBOUR_SOURCE_ROOT}/production-snapshot.json`), report = json(`${ARBOUR_SOURCE_ROOT}/authority.json`);
const input: ArbourInput = {
  chronology, priorAuthority: json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/chesapeake/authority.json"),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal: json(`${base}/proposals/0113-arbour-heights-v2/proposal.json`), approval: json(`${base}/approvals/0113-arbour-heights-v2.json`),
  receipt: json(`${base}/execution-v1/tasks/0113-arbour-heights/attempt-2/production-apply/apply-receipt.json`),
  correction: json(`${base}/execution-v1/tasks/0113-arbour-heights/attempt-2/retry-binding.json`),
  supersededProposal: json(`${base}/proposals/0113-arbour-heights-v1/proposal.json`),
  seedOverlay: json("prisma/seed-data/approved-portco-after-images.json"), attribution: {manifest,approval,receipt}, production: snapshot.production,
  originalState: { company: original.production.companies.find((row: {id: string}) => row.id === ARBOUR.companyId),
    redirects: original.production.redirects.filter((row: {companyId: string; retiredId: string}) => row.companyId === ARBOUR.companyId || row.retiredId === ARBOUR.companyId) },
  packet: ARBOUR_PACKET.map(([file]) => ({file,bytes:readFileSync(`${ARBOUR_TASK_ROOT}/${file}`)})),
  sources: ARBOUR_SOURCES.map(source => ({id:source.id,bytes:readFileSync(`${ARBOUR_SOURCE_ROOT}/${source.file}`)})),
};
const bytesHash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const fingerprint = (value: ArbourInput) => sha256Canonical({...value,
  packet: value.packet.map(row => ({file:row.file,sha256:bytesHash(row.bytes)})),
  sources: value.sources.map(row => ({id:row.id,sha256:bytesHash(row.bytes)}))});
const change = (value: unknown, path: string, replacement: unknown) => {
  const keys = path.split("."); let parent = value as Record<string,unknown>;
  for (const key of keys.slice(0,-1)) parent = parent[key] as Record<string,unknown>;
  parent[keys.at(-1)!] = replacement;
};
describe("Arbour corporate JV field authority preserves the completed company and explicit historical limitations", () => {
  it("reproduces the frozen report, full dependencies, scope and immutable input", () => {
    const before = fingerprint(input), result = proveArbourFieldAuthority(input);
    expect(report.reportSha256).toBe("325b09b13b5b093b37b0af232e5c14960643376cb8475d597de9772d89510d53");
    expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path,"utf8"))).toBe(file.sha256);
    for (const [key,value] of Object.entries(result)) expect(report[key]).toEqual(value);
    expect(sha256Canonical(original.production)).toBe(original.stateSha256);
    expect(fingerprint(input)).toBe(before);
  });
  it("distinguishes three field decisions from two production and three overlapping seed corrections", () => {
    const result = proveArbourFieldAuthority(input), row = result.rows[0];
    expect([result.candidateFieldsAdjudicated,result.cumulativeCandidateFieldsAdjudicated,result.remainingCandidateFields]).toEqual([3,80,523]);
    expect(result.additionalFieldsOutsideOriginal603).toBe(0);
    expect(row.fieldDecisions.map(field => field.field)).toEqual(["attributedFundName","attributionRationale","fundAttribution"]);
    expect(row.fieldDecisions.filter(field => field.productionWriteRequired)).toHaveLength(2);
    expect(row.fieldDecisions.filter(field => field.seedPersistenceRequired)).toHaveLength(3);
    expect(row.fieldDecisions.every(field => !field.outsideOriginal603 && field.primarySourceUrl === ARBOUR_SOURCES[0].url)).toBe(true);
    expect(new Set(row.fieldDecisions.map(field => field.primarySourceUrl)).size).toBe(1);
    expect(row.recommended.fundAttribution).toBe("DIRECT_PROGRAM");
    expect(row.recommended.linkedFundName).toBeNull(); expect(row.recommended.attributedFundName).toBeNull(); expect(row.recommended.attributionConfidence).toBeNull();
    expect(row.fieldDecisions.find(field => field.field === "attributedFundName")!.productionWriteRequired).toBe(false);
  });
  it("preserves managed-interest qualification, vehicle, all three owners and completed redirect", () => {
    const result = proveArbourFieldAuthority(input), row = result.rows[0];
    expect(row.preserves.id).toBe(ARBOUR.ownerId);
    expect(row.preserves.stake).toBe("15% managed interest");
    expect(row.preserves.vehicleName).toBe("Axium Extendicare LTC II LP");
    expect(row.preserves.investmentYear).toBe(2023); expect(row.preserves.exitYear).toBeNull();
    expect(row.preserves.organizationName).toBe("Extendicare Inc."); expect(row.preserves.fundName).toBeNull();
    expect(row.missingSeedUpsertBinding).toBe(true); expect(row.originalAttributionReceiptAbsent).toBe(true);
    expect(input.production.owners).toHaveLength(3); expect(input.production.owners[2].isActive).toBe(false);
    expect(input.production.retiredCompany).toBeNull(); expect(input.production.redirects).toHaveLength(1);
    expect(row.recommended.attributionRationale).toContain("management fees are separate from ownership");
    expect(result.qualifications.join(" ")).toContain("Western AgeCare and redevelopment Axium JV I remain separate");
  });
  it("preserves the historical transcript hash discrepancy without fabricated attestation", () => {
    const result = proveArbourFieldAuthority(input);
    expect(result.historicalTranscript).toMatchObject({
      attestedSha256:"1ac5b3c8ea8ae2bf79a74c23f1eba6dbba27bfa07968fe6ad961a5c56c1606df",
      committedSha256:"8cb98659167072117fe5d7e5eb70332a4e4c9b10f9ede036132d6ba9681c19d1",
      attestedHashMatches:false, exactResponseCompositionVerified:true, promptWhitespaceEquivalent:true,
    });
    expect(result.historicalTranscript.qualification).toContain("does not depend on repairing that record");
    expect(result.historicalPacket).toHaveLength(12);
    expect(result.supersededProposalSha256).toBe("4b43d7de87d12fc1b0cc0d966caca76a39e83e544486788aae83fb1080e58576");
    expect(result.qualifications.join(" ")).toContain("One transport-only repair preserves identical JSON");
  });
  it("binds fresh source bytes without claiming the changed Axium landing page is historically identical", () => {
    const capture = json(`${ARBOUR_SOURCE_ROOT}/source-capture.json`), result = proveArbourFieldAuthority(input);
    expect(sha256Canonical(capture)).toBe(report.sourceCaptureSha256);
    for (const source of ARBOUR_SOURCES) {
      const record = capture.sources.find((row: {id:string}) => row.id === source.id);
      expect(record.requestedUrl).toBe(source.url); expect(record.finalUrl).toBe(source.url); expect(record.sha256).toBe(source.sha256);
      expect(record.httpStatus).toBe(200); expect(record.path).toBe(`${ARBOUR_SOURCE_ROOT}/${source.file}`);
      expect(record.mediaType).toContain(source.file.endsWith(".pdf") ? "application/pdf" : "text/html");
    }
    expect(capture.sources.map((row: {bytes:number}) => row.bytes)).toEqual([1098485,1190728,63541]);
    expect(result.qualifications.join(" ")).toContain("Both complete PDFs exactly match historical raw hashes");
    expect(result.qualifications.join(" ")).toContain("Supporting Axium formation landing-page bytes changed");
    expect([result.databaseWrites,result.seedChanges,result.sourceTransitions,result.applyAuthorized,result.completionAllowed]).toEqual([0,0,0,false,false]);
    expect(result).not.toHaveProperty("mutations");
  });
  it.each(ARBOUR_PACKET)("rejects changed historical %s bytes", file => {
    const altered = structuredClone(input); altered.packet.find(row => row.file === file)!.bytes[0] ^= 1;
    expect(() => proveArbourFieldAuthority(altered)).toThrow("Historical packet changed");
  });
  it.each(ARBOUR_SOURCES)("rejects changed primary/supporting source $id", source => {
    const altered = structuredClone(input); altered.sources.find(row => row.id === source.id)!.bytes[0] ^= 1;
    expect(() => proveArbourFieldAuthority(altered)).toThrow("Reviewed source bytes changed");
  });
  it.each([
    ["chronology.candidates.0.recordId","different"], ["priorAuthority.remainingCandidateFields",0], ["seed.recordCount",0],
    ["proposal.rationale","changed"], ["approval.reviewedBy","changed"], ["receipt.transactionId","repeat"], ["attribution.receipt.changed",0],
    ["correction.newResearchRequired",true], ["supersededProposal.rationale","changed"],
    ["production.retiredCompany",{id:ARBOUR.retiredId}],
    ["production.redirects.0.companyId","different"], ["production.redirects.0.reason","different"], ["originalState.redirects.0.reason","different"],
    ["production.owners.0.companyId","different"], ["production.owners.0.id","different"], ["production.owners.0.fundId","guessed-fund"],
    ["production.owners.0.isActive",false], ["production.owners.0.fundAttribution","DIRECT_PROGRAM"], ["production.owners.0.attributionConfidence","MEDIUM"],
    ["production.owners.1.attributionRationale","different"], ["production.owners.1.fundId","Extendicare Fund"],
    ["production.owners.1.attributedFundName","Axium Extendicare LTC II LP"], ["production.owners.1.fundAttribution","DIRECT_PROGRAM"],
    ["production.owners.2.attributionRationale","different"], ["production.owners.2.isActive",true],
    ["production.images.0.description","changed"], ["production.images.0.headquarters","Toronto"],
    ["production.images.0.ownershipPeriods.0.stake","50%"], ["production.images.0.ownershipPeriods.0.vehicleName","inferred SPV"],
    ["production.images.0.ownershipPeriods.1.investmentYear",2020], ["production.images.0.ownershipPeriods.1.exitYear",2026],
    ["production.images.0.ownershipPeriods.1.stake","15%"], ["production.images.0.ownershipPeriods.1.organizationName","new alias"],
    ["production.images.0.pendingOwnershipTransactions",[{transactionState:"SIGNED_PENDING_EXIT"}]],
    ["sources.0.id","wrong"], ["packet.0.file","wrong"],
  ])("rejects drift at %s", (path,replacement) => {
    const altered = structuredClone(input); change(altered,path as string,replacement);
    expect(() => proveArbourFieldAuthority(altered)).toThrow();
  });
  it("rejects duplicate canonical overlay", () => {
    const altered = structuredClone(input); altered.seedOverlay.push(altered.seedOverlay.find(row => row.proposalSha256 === ARBOUR.proposalSha256)!);
    expect(() => proveArbourFieldAuthority(altered)).toThrow("Canonical seed overlay changed");
  });
  it("rejects a changed canonical overlay", () => {
    const altered = structuredClone(input); altered.seedOverlay.find(row => row.proposalSha256 === ARBOUR.proposalSha256)!.canonicalAfterImage = {};
    expect(() => proveArbourFieldAuthority(altered)).toThrow("Canonical seed overlay changed");
  });
  it("rejects duplicate owner IDs at unchanged cardinality", () => {
    const altered = structuredClone(input); altered.production.owners[2] = altered.production.owners[0];
    expect(() => proveArbourFieldAuthority(altered)).toThrow("Owner identity coverage changed");
  });
  it("rejects omitted metadata even when all other values match", () => {
    const altered = structuredClone(input); Reflect.deleteProperty(altered.production.owners[2],"attributionRationale");
    expect(() => proveArbourFieldAuthority(altered)).toThrow("Owner metadata field scope changed");
  });
  it.each(["sources","packet","owners","images"])("rejects non-unique %s scope", key => {
    const altered = structuredClone(input);
    if (key === "sources") altered.sources.push(altered.sources[0]);
    if (key === "packet") altered.packet.push(altered.packet[0]);
    if (key === "owners") altered.production.owners.push(altered.production.owners[0]);
    if (key === "images") altered.production.images.push(altered.production.images[0]);
    expect(() => proveArbourFieldAuthority(altered)).toThrow();
  });
});
