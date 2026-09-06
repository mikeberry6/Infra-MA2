import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { baseCompanies, companies } from "../../prisma/seed-data/companies";
import { applyApprovedPortCoAfterImages } from "../../prisma/seed-data/approved-portco-after-images";
import { CHICAGO_SEED_NAME, persistChicagoDisplayedOwnerStates } from "../../prisma/seed-data/chicago-seed-state-persistence";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";
import { verifyExecutionManifest } from "./execution-control";
import { verifyBatchExecutionLedger } from "./batch-control";

const directory = "audits/portco-reconciliation/2026-09-06/chicago-seed-state-persistence";
const json = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const plan = json(`${directory}/repair-plan.json`);
const snapshot = json(`${directory}/production-snapshot.json`);
const source = applyApprovedPortCoAfterImages(baseCompanies);

describe("Chicago display-state seed persistence, not fresh ownership adjudication", () => {
  it("binds the idle source state, immutable overlay, fresh production and all exception evidence", () => {
    expect(hashWithoutField(plan, "repairSha256")).toBe(plan.repairSha256);
    expect(sha256Canonical(snapshot.production)).toBe(plan.productionSnapshotSha256);
    const manifest = verifyExecutionManifest(json("audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json"));
    const ledger = verifyBatchExecutionLedger(json("audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json"));
    expect(manifest.manifestSha256).toBe(plan.executionManifestSha256);
    expect(ledger.ledgerSha256).toBe(plan.ledgerSha256);
    expect([manifest.activeTaskId, ledger.activeBatchId]).toEqual([null, null]);
    const task = manifest.tasks.find((task) => task.sequence === 345)!;
    expect(task.status).toBe("DEFERRED");
    expect([task.artifacts.proposal, task.artifacts.approval, task.artifacts.applyReceipt]).toEqual([null, null, null]);
    const research = json(task.reAdjudications!.at(-1)!.evidence.researchDecision.location);
    expect(research.seedMutationCandidate).toBe(false);
    expect(research.databaseMutationCandidate).toBe(false);
    expect(research.transactionResolution.pendingTransaction.signedPendingExitAuthorized).toBe(false);
    expect(research.transactionResolution.pendingTransaction.stonepeakCurrentOwnerVerified).toBe(false);
    expect(research.freshException).toEqual(plan.freshException);
    expect(sha256Canonical(research.freshException)).toBe(plan.freshExceptionSha256);
    for (const reference of plan.references) expect(sha256Text(readFileSync(reference.location.split("#")[0], "utf8"))).toBe(reference.fileSha256);
    for (const dependency of plan.dependencies) {
      if (dependency.path === "prisma/seed-data/companies.ts") continue;
      expect(sha256Text(readFileSync(dependency.path, "utf8"))).toBe(dependency.sha256);
    }
  });

  it("changes exactly three machine-state fields in the entire evaluated seed, without mutating inputs", () => {
    const sourceCopy = structuredClone(source);
    expect(sha256Canonical(source)).toBe(plan.sourceSeedSha256);
    const result = persistChicagoDisplayedOwnerStates(source);
    expect(source).toEqual(sourceCopy);
    expect(result).toEqual(companies);
    expect(sha256Canonical(companies)).toBe(plan.resultingSeedSha256);
    expect(result).toHaveLength(1128);
    const before = source.find((company) => company.name === CHICAGO_SEED_NAME)!;
    const after = result.find((company) => company.name === CHICAGO_SEED_NAME)!;
    expect(before).toEqual(plan.before);
    expect(after).toEqual(plan.after);
    expect(after).toEqual({ ...before, owners: before.owners!.map((owner) => ({ ...owner, transactionState: "CLOSED_ACTIVE" })) });
    expect(result.filter((company) => company.name !== CHICAGO_SEED_NAME)).toEqual(source.filter((company) => company.name !== CHICAGO_SEED_NAME));
    expect(after.sources).toEqual(before.sources);
    expect([plan.databaseWrites, plan.sourceTransitions, plan.attributionChanges, plan.citationChanges]).toEqual([0, 0, 0, 0]);
    const key = (company: { name: string; country: string }) => `${company.name.toLowerCase()}\0${company.country.toLowerCase()}`;
    expect(new Set(result.map(key)).size).toBe(1128);
    expect(result.map(key).sort()).toEqual(snapshot.production.publishedIdentities.map(key).sort());
  });

  it("matches all three scoped production display states without inventing aliases, owners, dates or transactions", () => {
    const company = snapshot.production.companies[0];
    expect(snapshot.production.companies).toHaveLength(1);
    expect(company.id).toBe(plan.canonicalCompanyId);
    expect(company.aliases).toEqual([]);
    expect(company.pendingOwnershipTransactions).toEqual([]);
    expect(company.ownershipPeriods).toHaveLength(3);
    for (const binding of plan.ownerBindings) {
      const actual = company.ownershipPeriods.find((owner: { id: string }) => owner.id === binding.productionId);
      const seed = plan.after.owners.find((owner: { investmentFirm: string }) => owner.investmentFirm === binding.seedName);
      expect(actual.organization.name).toBe(binding.productionName);
      expect([actual.vehicleName, actual.stake, actual.investmentYear, actual.exitYear, actual.isActive, actual.transactionState])
        .toEqual([binding.vehicle, binding.stake, 2009, null, true, "CLOSED_ACTIVE"]);
      expect([seed.ownershipVehicle, seed.stake, seed.investmentYear, seed.status, seed.transactionState])
        .toEqual([binding.vehicle, binding.stake, 2009, "Active", "CLOSED_ACTIVE"]);
    }
    // Legacy source annotations are deliberately preserved in BOTH sides. They
    // are not machine-state authority or a claim that an agreement was executed.
    const pendingLabels = plan.before.sources.filter((source: { evidenceLabel?: string }) => source.evidenceLabel?.includes("SIGNED_PENDING_EXIT"));
    expect(pendingLabels).toHaveLength(3);
    for (const source of pendingLabels) expect(company.citations.some((citation: { evidenceLabel: string; source: { url: string } }) => citation.source.url === source.url && citation.evidenceLabel === source.evidenceLabel)).toBe(true);
  });

  it("fails closed on missing/duplicate identity, future content, owner changes and replay", () => {
    const before = source.find((company) => company.name === CHICAGO_SEED_NAME)!;
    expect(() => persistChicagoDisplayedOwnerStates(source.filter((company) => company !== before))).toThrow(/missing or ambiguous/);
    expect(() => persistChicagoDisplayedOwnerStates([...source, { ...before }])).toThrow(/missing or ambiguous/);
    for (const altered of [
      { ...before, description: "Future overlay" },
      { ...before, owners: before.owners!.slice(1) },
      { ...before, owners: before.owners!.map((owner) => ({ ...owner, stake: "0%" })) },
      { ...before, sources: [] },
    ]) expect(() => persistChicagoDisplayedOwnerStates(source.map((company) => company === before ? altered : company))).toThrow(/changed before-image/);
    expect(() => persistChicagoDisplayedOwnerStates(companies)).toThrow(/repeated application/);
  });
});
