/** Historical identity proof only. This function cannot admit names or authorize a write. */
import { z } from "zod";
import { canonicalLedgerSchema } from "../portco-reconciliation/schema";
import { verifyDatasetSnapshot } from "../portco-reconciliation/artifacts";
import { executionTerminalStatuses, verifyExecutionManifest } from "../portco-reconciliation/execution-control";
import { assertArtifactHash, sha256Canonical } from "../portco-reconciliation/hash";

const targetsSchema = z.array(z.strictObject({ companyId: z.string().min(1), name: z.string().min(1) })).min(1);
const retainedRationale = "Production and evaluated seed agree; the company is retained even though it was not linked to this 100-manager census.";
const comparableFields = ["seedKey", "name", "country", "countryTags", "sector", "subsector", "region",
  "companyStatus", "recordStatus", "website", "relationCounts"] as const;
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);

export function verifyBaselineIdentities(input: {
  source: unknown; ledger: unknown; production: unknown; seed: unknown; targets: unknown;
}) {
  const source = verifyExecutionManifest(input.source), ledger = canonicalLedgerSchema.parse(input.ledger);
  assertArtifactHash(ledger, "ledgerSha256", "Baseline ledger");
  const production = verifyDatasetSnapshot(input.production), seed = verifyDatasetSnapshot(input.seed);
  if (source.activeTaskId || source.tasks.some(t => !executionTerminalStatuses.includes(t.status))) throw Error("Terminal idle source required");
  if (production.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT" || seed.artifactType !== "PORTCO_SEED_SNAPSHOT"
    || ledger.ledgerSha256 !== source.source.ledgerSha256
    || production.snapshotSha256 !== source.source.baselineProductionSnapshotSha256
    || seed.snapshotSha256 !== source.source.baselineSeedSnapshotSha256
    || ledger.productionSnapshotSha256 !== production.snapshotSha256 || ledger.seedSnapshotSha256 !== seed.snapshotSha256) throw Error("Exact original baseline hashes required");
  const targets = targetsSchema.parse(input.targets);
  if (new Set(targets.map(t => t.companyId)).size !== targets.length) throw Error("Duplicate baseline target");
  return targets.map(target => {
    const matches = ledger.canonicalCompanies.filter(c => c.canonicalRepoCompanyId === target.companyId || c.repoCompanyIds.includes(target.companyId));
    if (matches.length !== 1) throw Error("Unique canonical baseline identity required");
    const canonical = matches[0];
    if (canonical.canonicalRepoCompanyId !== target.companyId || canonical.displayName !== target.name
      || !same(canonical.repoCompanyIds, [target.companyId]) || canonical.decisionStatus !== "NO_CHANGE"
      || !same(canonical.recommendedActions, ["VERIFY_NO_CHANGE"])
      || source.tasks.some(t => t.canonicalKey === canonical.canonicalKey)) throw Error("Exact baseline-only NO_CHANGE identity required");
    const repo = ledger.repoRows.filter(r => r.productionCompanyId === target.companyId);
    if (repo.length !== 1 || repo[0].sourcePresence !== "BOTH" || repo[0].canonicalKey !== canonical.canonicalKey
      || repo[0].companyName !== target.name || !same(canonical.seedKeys, [repo[0].seedKey])) throw Error("Exact unique production/seed ledger binding required");
    if (new Set(canonical.censusHoldingIds).size !== canonical.censusHoldingIds.length) throw Error("Duplicate census holding");
    const census = canonical.censusHoldingIds.map(id => {
      const rows = ledger.censusRows.filter(r => r.holdingId === id);
      if (rows.length !== 1 || rows[0].canonicalKey !== canonical.canonicalKey || rows[0].disposition !== "VERIFIED_EXISTING") throw Error("Exact census identity binding required");
      return rows[0];
    });
    if (census.length ? repo[0].disposition !== "MATCHED_CENSUS" :
      (repo[0].disposition !== "RETAIN_UNLINKED" || canonical.repoOnlyRecordIds.length !== 0
        || ledger.repoOnlyRows.some(r => r.canonicalKey === canonical.canonicalKey)
        || canonical.rationale !== retainedRationale || repo[0].rationale !== retainedRationale)) throw Error("Explicit census or retained-unlinked disposition required");
    const prod = production.companies.filter(c => c.id === target.companyId);
    const seeded = seed.companies.filter(c => c.seedKey === repo[0].seedKey);
    if (prod.length !== 1 || seeded.length !== 1 || prod[0].name !== target.name || prod[0].seedKey !== repo[0].seedKey) throw Error("Unique original dataset identities required");
    for (const field of comparableFields) if (!same(prod[0][field], seeded[0][field])) throw Error(`Original dataset field differs: ${field}`);
    const ordered = [...census].sort((a,b) => a.managerIndex - b.managerIndex || ledger.censusRows.indexOf(a) - ledger.censusRows.indexOf(b));
    const order: [number, number, number] = ordered.length
      ? [0, ordered[0].managerIndex, ledger.censusRows.indexOf(ordered[0])]
      : [1, 0, ledger.repoRows.indexOf(repo[0])];
    return { ...target, canonicalKey: canonical.canonicalKey, order,
      provenance: census.length ? "CENSUS_MATCH" as const : "EXPLICIT_RETAIN_UNLINKED" as const,
      canonicalRowSha256: sha256Canonical(canonical), repoRowSha256: sha256Canonical(repo[0]),
      censusRowHashes: census.map(r => ({ holdingId: r.holdingId, sha256: sha256Canonical(r) })),
      productionCompanySnapshotSha256: prod[0].companySnapshotSha256,
      seedCompanySnapshotSha256: seeded[0].companySnapshotSha256,
      ownershipVerified: false as const, metadataVerified: false as const, writeAuthorized: false as const };
  }).sort((a,b) => a.order[0] - b.order[0] || a.order[1] - b.order[1] || a.order[2] - b.order[2]);
}
