import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import { describe, expect, it } from "vitest";
import { companies } from "../../prisma/seed-data/companies";
import { buildOwnerSemanticContract, latestSemanticOverlays, type AppliedOwnerProof, type SemanticOverlay } from "./owner-semantic-contract";
import { sha256Canonical, sha256Text, hashWithoutField } from "./hash";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";

const directory = "audits/portco-reconciliation/2026-09-06/owner-semantic-contract";
const json = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const audit = json(`${directory}/audit.json`);
const snapshot = json(`${directory}/production-snapshot.json`);
const stored = json(`${directory}/owner-contract.json`);
const overlays: SemanticOverlay[] = json("prisma/seed-data/approved-portco-after-images.json");
const readRef = (location: string) => {
  const [file, fragment] = location.split("#");
  let value = json(file);
  if (fragment) for (const part of fragment.replace(/^\//, "").split("/")) value = value[part];
  return value;
};
const proofs: AppliedOwnerProof[] = audit.proofReferences.map((binding: { references: Array<{ location: string }> }) => {
  const [proposal, approval, receipt] = binding.references.map((reference) => readRef(reference.location));
  return { proposal, approval, receipt };
});
const chicagoPlan = json("audits/portco-reconciliation/2026-09-06/chicago-seed-state-persistence/repair-plan.json");
const input = { companies, overlays, production: snapshot.production.companies, proofs, chicagoPlan };

describe("exact owner semantics versus legacy display projections", () => {
  it("binds 298 current applied source chains, all 45 fresh adjudications and unchanged dependencies", () => {
    expect(hashWithoutField(audit, "auditSha256")).toBe(audit.auditSha256);
    expect(sha256Canonical(snapshot.production)).toBe(audit.productionSnapshotSha256);
    expect(sha256Canonical(companies)).toBe(audit.seedSha256);
    const manifest = verifyExecutionManifest(json("audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json"));
    const ledger = verifyBatchExecutionLedger(json("audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json"));
    expect([manifest.manifestSha256, ledger.ledgerSha256]).toEqual([audit.executionManifestSha256, audit.ledgerSha256]);
    expect([manifest.activeTaskId, ledger.activeBatchId]).toEqual([null, null]);
    expect(audit.proofReferences).toHaveLength(298);
    for (const binding of audit.proofReferences) {
      const task = manifest.tasks.find((task) => task.taskId === binding.taskId)!;
      expect(task.status).toBe("COMPLETED");
      expect(task.artifacts.proposal!.sha256).toBe(binding.proposalSha256);
      for (const reference of binding.references) expect(sha256Text(readFileSync(reference.location.split("#")[0], "utf8"))).toBe(reference.fileSha256);
    }
    expect(audit.freshReferences).toHaveLength(315);
    expect(new Set(audit.freshReferences.map((reference: { taskIndex: number }) => reference.taskIndex)).size).toBe(45);
    for (const reference of audit.freshReferences) expect(sha256Text(readFileSync(reference.location, "utf8"))).toBe(reference.sha256);
    for (const dependency of audit.dependencies) expect(sha256Text(readFileSync(dependency.path, "utf8"))).toBe(dependency.sha256);
    expect(sha256Text(readFileSync(`${directory}/historical-approved-seed-before-f943b55f.txt`, "utf8"))).toBe(audit.historicalProjection.fileSha256);
  });

  it("reproduces all 1128 exact core comparisons without modifying seed, overlays, receipts or production", () => {
    const before = sha256Canonical(input);
    const contract = buildOwnerSemanticContract(input);
    expect(sha256Canonical(input)).toBe(before);
    expect(contract).toEqual(stored);
    expect(sha256Canonical(contract)).toBe(audit.contractSha256);
    expect(contract.publishedCompanies).toBe(1128);
    expect(contract.canonicalCompanies).toBe(298);
    expect(contract.canonicalOwners).toBe(711);
    expect(contract.legacyCompanies).toBe(829);
    expect(contract.scopedChicagoCompanies).toBe(1);
    expect(contract.coreOwnershipParity).toBe(true);
    expect(contract.fundLinkAttributionParity).toBe("NOT_ADJUDICATED");
    expect(contract.fullSeedReplayParity).toBe(false);
    expect([audit.databaseWrites, audit.seedChanges, audit.sourceTransitions, audit.attributionChanges]).toEqual([0, 0, 0, 0]);
    expect(audit.completionAllowed).toBe(false);
  });

  it("retains explicit nulls, early projection shapes and exact canonical organizations", () => {
    const rich = stored.rows.filter((row: { authority: string }) => row.authority === "RECEIPT_BACKED_CANONICAL_AFTER_IMAGE");
    expect(rich.filter((row: { projectionVersion: string }) => row.projectionVersion === "COMBINED_ONLY_PRE_F943B55F")).toHaveLength(42);
    expect(rich.filter((row: { projectionVersion: string }) => row.projectionVersion === "SEPARATE_DISPLAY_FIELDS")).toHaveLength(256);
    const changed = rich.filter((row: { representationDifferences: unknown[] }) => row.representationDifferences.length);
    expect(changed).toHaveLength(73);
    const differences = changed.flatMap((row: { name: string; representationDifferences: Array<{ field: string; semantic: unknown }> }) => row.representationDifferences.map((difference) => ({ company: row.name, ...difference })));
    expect(differences.filter((difference: { field: string; semantic: unknown }) => difference.field === "vehicleName" && difference.semantic === null)).toHaveLength(106);
    expect(differences.filter((difference: { field: string; semantic: unknown }) => difference.field === "vehicleName" && difference.semantic !== null).map((difference: { company: string }) => difference.company)).toEqual(["Broad Reach Power"]);
    expect(differences.filter((difference: { field: string }) => difference.field === "organizationName").map((difference: { company: string }) => difference.company).sort()).toEqual(["Skyway Concession Company LLC", "Terra-Gen"]);
    expect(differences.every((difference: { field: string }) => ["vehicleName", "organizationName"].includes(difference.field))).toBe(true);
    const chicago = stored.rows.find((row: { authority: string }) => row.authority === "PR918_SCOPED_EXISTING_DISPLAY_BINDING");
    expect(chicago.companyId).toBe(chicagoPlan.canonicalCompanyId);
    expect(chicago.representationDifferences).toHaveLength(1);
    expect(chicago.representationDifferences[0].field).toBe("organizationName");
  });

  it("rejects tampered/missing/duplicate receipt proof instead of trusting stored assertions", () => {
    const bad = structuredClone(proofs);
    (bad[0].receipt as Record<string, unknown>).transactionId = "tampered";
    expect(() => buildOwnerSemanticContract({ ...input, proofs: bad })).toThrow(/hash/i);
    expect(() => buildOwnerSemanticContract({ ...input, proofs: proofs.slice(1) })).toThrow(/Unbound/);
    expect(() => buildOwnerSemanticContract({ ...input, proofs: [...proofs, proofs[0]] })).toThrow(/Duplicate applied proof/);
  });

  it("rejects identity collisions, seed edits and production owner drift", () => {
    expect(() => buildOwnerSemanticContract({ ...input, companies: [...companies, companies[0]] })).toThrow(/collision/);
    const changedSeed = structuredClone(companies);
    const richName = stored.rows.find((row: { authority: string }) => row.authority === "RECEIPT_BACKED_CANONICAL_AFTER_IMAGE").name;
    changedSeed.find((company) => company.name === richName)!.description = "Unapproved seed edit";
    expect(() => buildOwnerSemanticContract({ ...input, companies: changedSeed })).toThrow(/projection changed/);
    const changedProduction = structuredClone(snapshot.production.companies);
    changedProduction[0].ownershipPeriods[0].stake = "Unapproved stake";
    expect(() => buildOwnerSemanticContract({ ...input, production: changedProduction })).toThrow(/Semantic core ownership differs/);
    expect(() => buildOwnerSemanticContract({ ...input, chicagoPlan: { ...chicagoPlan, repairSha256: "0".repeat(64) } })).toThrow(/Chicago/);
  });

  it("applies ordered supersession/retirement without accepting a shadowed proof as current", () => {
    expect(() => latestSemanticOverlays([...overlays, overlays[0]])).toThrow(/duplicate overlay/);
    const latest = latestSemanticOverlays(overlays);
    for (const binding of audit.proofReferences) expect([...latest.values()].filter((entry) => entry.proposalSha256 === binding.proposalSha256)).toHaveLength(1);
    const entry = structuredClone([...latest.values()].find((entry) => entry.canonicalAfterImage)!);
    entry.operation = "ARCHIVE";
    entry.proposalSha256 = "f".repeat(64);
    const after = latestSemanticOverlays([...overlays, entry]);
    expect(after.has(`${entry.company.name.trim().toLowerCase()}\0${entry.company.country.trim().toLowerCase()}`)).toBe(false);
  });
});
