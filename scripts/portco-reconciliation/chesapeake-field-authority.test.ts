import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { CHESAPEAKE, CHESAPEAKE_OWNERS, CHESAPEAKE_SOURCES, CHESAPEAKE_SOURCE_ROOT, CHESAPEAKE_PACKET, CHESAPEAKE_TASK_ROOT, proveChesapeakeFieldAuthority, type ChesapeakeInput } from "./chesapeake-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";
const json = (path: string) => JSON.parse(readFileSync(path,"utf8"));
const base = "audits/portco-reconciliation/2026-08-03";
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json");
const reference = chronology.receiptReferences.find((row: {pipelineRunId: string}) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
const [manifest, approval, receipt] = reference.sourceFiles.map((file: {path: string}) => json(file.path));
const snapshot = json(`${CHESAPEAKE_SOURCE_ROOT}/production-snapshot.json`), report = json(`${CHESAPEAKE_SOURCE_ROOT}/authority.json`);
const input: ChesapeakeInput = {
  chronology, priorAuthority: json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/vig/authority.json"),
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"),
  seedFund: json("prisma/seed-data/funds.manifest.json").funds.find((row: {id: string}) => row.id === "FUND-026"),
  proposal: json(`${base}/proposals/0112-transurban-chesapeake-v1/proposal.json`), approval: json(`${base}/approvals/0112-transurban-chesapeake-v1.json`),
  receipt: json(`${CHESAPEAKE_TASK_ROOT}/production-apply/apply-receipt.json`),
  seedOverlay: json("prisma/seed-data/approved-portco-after-images.json"), attribution: {manifest,approval,receipt}, production: snapshot.production,
  originalState: { company: original.production.companies.find((row: {id: string}) => row.id === CHESAPEAKE.companyId),
    redirects: original.production.redirects.filter((row: {companyId: string; retiredId: string}) => row.companyId === CHESAPEAKE.companyId || row.retiredId === CHESAPEAKE.companyId) },
  packet: CHESAPEAKE_PACKET.map(([file]) => ({file,bytes:readFileSync(`${CHESAPEAKE_TASK_ROOT}/${file}`)})),
  sources: CHESAPEAKE_SOURCES.map(source => ({id:source.id,bytes:readFileSync(`${CHESAPEAKE_SOURCE_ROOT}/${source.file}`)})),
};
const bytesHash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const fingerprint = (value: ChesapeakeInput) => sha256Canonical({...value,
  packet: value.packet.map(row => ({file:row.file,sha256:bytesHash(row.bytes)})),
  sources: value.sources.map(row => ({id:row.id,sha256:bytesHash(row.bytes)}))});
const change = (value: unknown, path: string, replacement: unknown) => {
  const keys = path.split("."); let parent = value as Record<string,unknown>;
  for (const key of keys.slice(0,-1)) parent = parent[key] as Record<string,unknown>;
  parent[keys.at(-1)!] = replacement;
};
describe("Chesapeake distinguishes direct pension portfolios from deal funds without touching canonical identity", () => {
  it("reproduces the exact report, full dependencies, source scope and immutable input", () => {
    const before = fingerprint(input), result = proveChesapeakeFieldAuthority(input);
    expect(report.reportSha256).toBe("8336935955cf34ef88c68c02eb178480e0486efd65f267c76882dab20afdd75e");
    expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path,"utf8"))).toBe(file.sha256);
    for (const [key,value] of Object.entries(result)) expect(report[key]).toEqual(value);
    expect(sha256Canonical(original.production)).toBe(original.stateSha256);
    expect(fingerprint(input)).toBe(before);
  });
  it("separates two original decisions from six equality-blind decisions", () => {
    const result = proveChesapeakeFieldAuthority(input), fields = result.rows.flatMap(row => row.fieldDecisions);
    expect([result.candidateFieldsAdjudicated,result.cumulativeCandidateFieldsAdjudicated,result.remainingCandidateFields]).toEqual([2,77,526]);
    expect(fields).toHaveLength(8);
    expect(fields.filter(row => !row.outsideOriginal603).map(row => row.field)).toEqual(["attributionConfidence","attributionRationale"]);
    expect(fields.filter(row => row.outsideOriginal603)).toHaveLength(6);
    expect(fields.filter(row => row.productionWriteRequired)).toHaveLength(8);
    expect(fields.filter(row => row.seedPersistenceRequired)).toHaveLength(8);
    for (const row of result.rows) {
      expect(row.recommended.fundAttribution).toBe("DIRECT_PROGRAM");
      expect(row.recommended.linkedFundName).toBeNull(); expect(row.recommended.attributedFundName).toBeNull(); expect(row.recommended.attributionConfidence).toBeNull();
      expect(new Set(row.fieldDecisions.map(field => field.primarySourceUrl)).size).toBe(1);
    }
    expect(result.rows[0].canonicalCompatibilityRequired).toBe(true);
    expect(result.rows[1].fieldDecisions.every(row => row.outsideOriginal603 && row.primarySourceUrl === CHESAPEAKE_SOURCES[3].url)).toBe(true);
  });
  it("preserves both stakes, dates, legal-vehicle qualifications and completed merge", () => {
    const result = proveChesapeakeFieldAuthority(input);
    for (const [index,row] of result.rows.entries()) {
      expect(row.preserves.id).toBe(CHESAPEAKE_OWNERS[index].ownerId);
      expect(row.preserves.stake).toBe(CHESAPEAKE_OWNERS[index].stake);
      expect(row.preserves.vehicleName).toBe(CHESAPEAKE_OWNERS[index].vehicle);
      expect(row.preserves.investmentYear).toBe(2021); expect(row.preserves.isActive).toBe(true);
    }
    expect(result.rows[0].preserves.fundName).toBe(CHESAPEAKE.fundName);
    expect(result.rows[0].originalCompanyId).toBe(CHESAPEAKE.retiredId);
    expect(result.rows[0].originalRecordId).not.toBe(result.rows[0].recordId);
    expect(result.rows[0].missingSeedUpsertBinding).toBe(true);
    expect(input.production.retiredCompany).toBeNull(); expect(input.production.redirects).toHaveLength(1);
    expect(result.qualifications.join(" ")).toContain("never silent alteration");
  });
  it("honestly distinguishes fresh AustralianSuper PDF from historical 403 HTML", () => {
    const capture = json(`${CHESAPEAKE_SOURCE_ROOT}/source-capture.json`), result = proveChesapeakeFieldAuthority(input);
    expect(sha256Canonical(capture)).toBe(report.sourceCaptureSha256);
    for (const source of CHESAPEAKE_SOURCES) {
      const record = capture.sources.find((row: {id:string}) => row.id === source.id);
      expect(record.requestedUrl).toBe(source.url); expect(record.finalUrl).toBe(source.url); expect(record.sha256).toBe(source.sha256);
      expect(record.httpStatus).toBe(200); expect(record.mediaType).toBe("application/pdf"); expect(record.authorityAvailable).toBe(true);
    }
    expect(capture.sources[0].bytes).toBe(123702);
    expect(result.qualifications.join(" ")).toContain("historical 403 HTML hash");
    expect(result.qualifications.join(" ")).toContain("pointer-only transcript index");
    expect(result.historicalPacket).toHaveLength(9);
    expect([result.databaseWrites,result.seedChanges,result.sourceTransitions,result.applyAuthorized,result.completionAllowed]).toEqual([0,0,0,false,false]);
    expect(result).not.toHaveProperty("mutations");
  });
  it.each(CHESAPEAKE_PACKET)("rejects changed historical %s bytes", file => {
    const altered = structuredClone(input); altered.packet.find(row => row.file === file)!.bytes[0] ^= 1;
    expect(() => proveChesapeakeFieldAuthority(altered)).toThrow("Historical packet changed");
  });
  it.each(CHESAPEAKE_SOURCES)("rejects changed primary/supporting source $id", source => {
    const altered = structuredClone(input); altered.sources.find(row => row.id === source.id)!.bytes[0] ^= 1;
    expect(() => proveChesapeakeFieldAuthority(altered)).toThrow("Reviewed source bytes changed");
  });
  it.each([
    ["chronology.candidates.0.recordId","different"], ["priorAuthority.remainingCandidateFields",0], ["seed.recordCount",0],
    ["proposal.rationale","changed"], ["approval.reviewedBy","changed"], ["receipt.transactionId","repeat"], ["attribution.receipt.changed",0],
    ["seedFund.id","another-fund"], ["production.fund.id","another-fund"], ["production.fund.manager.name","another-manager"],
    ["production.fund.status","ARCHIVED"], ["production.retiredCompany",{id:CHESAPEAKE.retiredId}],
    ["production.redirects.0.companyId","different"], ["production.redirects.0.reason","different"], ["originalState.redirects.0.reason","different"],
    ["production.owners.0.companyId","different"], ["production.owners.0.id","different"], ["production.owners.0.fundId",null],
    ["production.owners.0.isActive",false], ["production.owners.0.fundAttribution","DIRECT_PROGRAM"], ["production.owners.0.attributionConfidence","MEDIUM"],
    ["production.owners.1.attributionRationale","different"], ["production.owners.1.fundId","CPP Fund"],
    ["production.images.0.description","changed"], ["production.images.0.headquarters","Northern Virginia"],
    ["production.images.0.ownershipPeriods.0.stake","50%"], ["production.images.0.ownershipPeriods.0.vehicleName","inferred SPV"],
    ["production.images.0.ownershipPeriods.0.investmentYear",2020], ["production.images.0.ownershipPeriods.0.exitYear",2026],
    ["production.images.0.ownershipPeriods.1.vehicleName","CPP Fund"], ["production.images.0.ownershipPeriods.1.organizationName","new alias"],
    ["production.images.0.pendingOwnershipTransactions",[{transactionState:"SIGNED_PENDING_EXIT"}]],
    ["sources.0.id","wrong"], ["packet.0.file","wrong"],
  ])("rejects drift at %s", (path,replacement) => {
    const altered = structuredClone(input); change(altered,path as string,replacement);
    expect(() => proveChesapeakeFieldAuthority(altered)).toThrow();
  });
  it("rejects duplicate canonical overlay", () => {
    const altered = structuredClone(input); altered.seedOverlay.push(altered.seedOverlay.find(row => row.proposalSha256 === CHESAPEAKE.proposalSha256)!);
    expect(() => proveChesapeakeFieldAuthority(altered)).toThrow("Canonical seed overlay changed");
  });
  it("rejects a changed canonical overlay", () => {
    const altered = structuredClone(input); altered.seedOverlay.find(row => row.proposalSha256 === CHESAPEAKE.proposalSha256)!.canonicalAfterImage = {};
    expect(() => proveChesapeakeFieldAuthority(altered)).toThrow("Canonical seed overlay changed");
  });
  it.each(["sources","packet","owners","images"])("rejects non-unique %s scope", key => {
    const altered = structuredClone(input);
    if (key === "sources") altered.sources.push(altered.sources[0]);
    if (key === "packet") altered.packet.push(altered.packet[0]);
    if (key === "owners") altered.production.owners.push(altered.production.owners[0]);
    if (key === "images") altered.production.images.push(altered.production.images[0]);
    expect(() => proveChesapeakeFieldAuthority(altered)).toThrow();
  });
});
