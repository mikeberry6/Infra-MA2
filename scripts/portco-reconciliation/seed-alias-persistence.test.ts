import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { baseCompanies, companies } from "../../prisma/seed-data/companies";
import { sha256Canonical, sha256Text, hashWithoutField } from "./hash";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";
import { canonicalSha256 as attributionSha256, verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifySeedAttributionReconciliationSpec } from "../portfolio-fund-attribution/reconcile-seed-manifest";

const directory = "audits/portco-reconciliation/2026-09-06/seed-alias-persistence";
const json = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const plan = json(`${directory}/repair-plan.json`);

describe("already-superseded PortCo seed identity persistence", () => {
  it("binds the exact idle terminal source state and the five reviewed alias decisions", () => {
    expect(hashWithoutField(plan, "repairSha256")).toBe(plan.repairSha256);
    expect(plan.members.map((member: { sourceSequence: number }) => member.sourceSequence)).toEqual([466, 472, 490, 495, 496]);
    const manifest = verifyExecutionManifest(json("audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json"));
    const ledger = verifyBatchExecutionLedger(json("audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json"));
    expect(manifest.manifestSha256).toBe(plan.executionManifestSha256);
    expect(ledger.ledgerSha256).toBe(plan.ledgerSha256);
    expect(ledger.activeBatchId).toBeNull();
    for (const member of plan.members) {
      const task = manifest.tasks.find((entry) => entry.taskId === member.sourceTaskId)!;
      expect(task.status).toBe("SUPERSEDED");
      expect(task.supersededByTaskId).toBe(member.canonicalTaskId);
      expect(task.artifacts.decision?.sha256).toBe(member.terminalDecisionSha256);
    }
    expect(plan.databaseWrites).toBe(0);
    expect(plan.sourceTransitions).toBe(0);
    expect(plan.canonicalCompanyChanges).toBe(0);
  });

  it("removes only five duplicate seed entries without altering any retained company field", () => {
    expect(companies).toHaveLength(plan.sourceCompanyCount - 5);
    expect(sha256Canonical(companies)).toBe(plan.resultingSeedSha256);
    for (const member of plan.members) {
      expect(baseCompanies.some((company) => company.name === member.retiredSeed.name && company.country === member.country)).toBe(false);
      expect(companies.some((company) => company.name === member.retiredSeed.name && company.country === member.country)).toBe(false);
      const canonical = companies.filter((company) => company.name === member.canonicalName && company.country === member.country);
      expect(canonical).toHaveLength(1);
      expect(sha256Canonical(canonical[0])).toBe(member.canonicalSeedSha256);
      expect(sha256Canonical(member.retiredSeed)).toBe(member.retiredSeedSha256);
    }
  });

  it("removes only eight obsolete attribution records and leaves all canonical attributions unchanged", () => {
    const spec = verifySeedAttributionReconciliationSpec(json(`${directory}/seed-attribution-spec.json`));
    const manifest = verifySeedManifest(json("prisma/seed-data/ownership-attributions.manifest.json"));
    const artifact = json(`${directory}/seed-attribution-reconciliation.json`);
    expect(spec.batchSha256).toBe(plan.repairSha256);
    expect(spec.upsertRecords).toEqual([]);
    expect(spec.removeRecordIds).toHaveLength(8);
    expect(artifact.replacedRecords).toEqual([]);
    const { reconciliationSha256, ...reconciliationContent } = artifact;
    expect(attributionSha256(reconciliationContent)).toBe(reconciliationSha256);
    expect(artifact.resultingManifestSha256).toBe(manifest.manifestSha256);
    expect(manifest).toEqual(json(`${directory}/resulting-attribution-manifest.json`));
    for (const record of artifact.removedRecords) {
      expect(plan.members.some((member: { retiredSeed: { name: string }; country: string }) => member.retiredSeed.name === record.companyName && member.country === record.country)).toBe(true);
    }
  });

  it("preserves all original overlays, redirects, source evidence and unrelated dependencies", () => {
    for (const dependency of plan.dependencies) {
      if (["prisma/seed-data/companies.ts", "prisma/seed-data/ownership-attributions.manifest.json"].includes(dependency.path)) continue;
      expect(sha256Text(readFileSync(dependency.path, "utf8"))).toBe(dependency.sha256);
    }
    for (const reference of plan.references) {
      expect(sha256Text(readFileSync(reference.location.split("#")[0], "utf8"))).toBe(reference.fileSha256);
    }
    // These unresolved companies remain untouched, not silently retired by this repair.
    for (const name of ["Extenet", "ExteNet Systems", "Chicago Parking Meters"]) {
      expect(companies.some((company) => company.name.includes(name))).toBe(true);
    }
  });
});
