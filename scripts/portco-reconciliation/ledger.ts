import { companyDedupKeys } from "../../src/lib/company-key";
import { digestsEqual, sha256Canonical } from "./hash";
import {
  canonicalLedgerSchema,
  ledgerCensusDispositions,
  ledgerRepoOnlyDispositions,
  ledgerRepoDispositions,
  type CanonicalLedger,
  type ProductionSnapshot,
  type RecoveredCensusHolding,
  type RecoveredCensusInput,
  type SeedSnapshot,
  type SnapshotCompany,
} from "./schema";
import {
  verifyDatasetSnapshot,
  verifyRecoveredCensusInput,
} from "./artifacts";

function normalizedCountry(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Candidate keys are deliberately suggestions, never merge authority. The
 * existing conservative company-key implementation catches suffix/alias
 * variants while country prevents accidental cross-border joins.
 */
export function companyMatchCandidateKeys(name: string, countries: readonly string[]): string[] {
  return [...companyDedupKeys(name)]
    .flatMap((companyKey) => countries.map((country) =>
      `${companyKey}\u0000${normalizedCountry(country)}`))
    .sort();
}

export function snapshotCompanyCandidateKeys(company: SnapshotCompany): string[] {
  const countries = company.countryTags.length > 0
    ? company.countryTags
    : [company.country];
  return companyMatchCandidateKeys(company.name, countries);
}

export function holdingCandidateKeys(holding: RecoveredCensusHolding): string[] {
  return companyMatchCandidateKeys(
    holding.canonicalName ?? holding.companyName,
    holding.countries,
  );
}

export function findSnapshotMatchCandidates(
  holding: RecoveredCensusHolding,
  companies: readonly SnapshotCompany[],
): SnapshotCompany[] {
  const holdingKeys = new Set(holdingCandidateKeys(holding));
  return companies
    .filter((company) => snapshotCompanyCandidateKeys(company).some((key) => holdingKeys.has(key)))
    .sort((left, right) =>
      left.name.localeCompare(right.name) || left.seedKey.localeCompare(right.seedKey));
}

function countsFor<T extends readonly string[]>(values: T, rows: readonly string[]): Record<T[number], number> {
  const counts = Object.fromEntries(values.map((value) => [value, 0])) as Record<T[number], number>;
  for (const row of rows) counts[row as T[number]] += 1;
  return counts;
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

export function assertLedgerCoverage(input: {
  ledger: CanonicalLedger;
  recoveredInputs: readonly RecoveredCensusInput[];
  productionSnapshot: ProductionSnapshot;
  seedSnapshot: SeedSnapshot;
}): void {
  const ledger = canonicalLedgerSchema.parse(input.ledger);
  const recovered = input.recoveredInputs.map(verifyRecoveredCensusInput);
  const production = verifyDatasetSnapshot(input.productionSnapshot);
  const seed = verifyDatasetSnapshot(input.seedSnapshot);
  if (production.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") {
    throw new Error("Production snapshot artifact type mismatch");
  }
  if (seed.artifactType !== "PORTCO_SEED_SNAPSHOT") {
    throw new Error("Seed snapshot artifact type mismatch");
  }

  const managerIndexes = recovered.map((artifact) => artifact.managerIndex);
  if (new Set(managerIndexes).size !== managerIndexes.length) {
    throw new Error("Recovered census contains duplicate manager indexes");
  }
  const expectedHoldingIds = sortedUnique(
    recovered.flatMap((artifact) => artifact.holdings.map((holding) => holding.holdingId)),
  );
  const actualHoldingIds = sortedUnique(ledger.censusRows.map((row) => row.holdingId));
  if (JSON.stringify(expectedHoldingIds) !== JSON.stringify(actualHoldingIds)) {
    throw new Error("Canonical ledger does not cover every recovered census holding exactly once");
  }

  const expectedRepoOnlyIds = sortedUnique(recovered.flatMap((artifact) =>
    (artifact.repoOnlyRecords ?? []).map((record) => record.repoOnlyId)));
  const actualRepoOnlyIds = sortedUnique(ledger.repoOnlyRows.map((row) => row.repoOnlyId));
  if (JSON.stringify(expectedRepoOnlyIds) !== JSON.stringify(actualRepoOnlyIds)) {
    throw new Error("Canonical ledger does not cover every recovered repo-only judgment exactly once");
  }

  const expectedExcludedIds = sortedUnique(recovered.flatMap((artifact) =>
    artifact.excludedCandidates.flatMap((candidate) =>
      candidate.excludedCandidateId === undefined ? [] : [candidate.excludedCandidateId])));
  const actualExcludedIds = sortedUnique(
    ledger.excludedCandidateLineage.map((row) => row.excludedCandidateId),
  );
  if (JSON.stringify(expectedExcludedIds) !== JSON.stringify(actualExcludedIds)) {
    throw new Error("Canonical ledger excluded-candidate lineage is incomplete");
  }

  const expectedProductionIds = sortedUnique(
    production.companies.map((company) => company.id).filter((id): id is string => id !== null),
  );
  const actualProductionIds = sortedUnique(
    ledger.repoRows.flatMap((row) => row.productionCompanyId === null ? [] : [row.productionCompanyId]),
  );
  if (JSON.stringify(expectedProductionIds) !== JSON.stringify(actualProductionIds)) {
    throw new Error("Canonical ledger does not cover every production company exactly once");
  }

  const expectedSeedKeys = sortedUnique(seed.companies.map((company) => company.seedKey));
  const actualSeedKeys = sortedUnique(
    ledger.repoRows.flatMap((row) => row.seedKey === null ? [] : [row.seedKey]),
  );
  if (JSON.stringify(expectedSeedKeys) !== JSON.stringify(actualSeedKeys)) {
    throw new Error("Canonical ledger does not cover every evaluated seed company exactly once");
  }

  const recoveredHashes = sortedUnique(recovered.map((artifact) => artifact.artifactSha256));
  if (JSON.stringify(recoveredHashes) !== JSON.stringify(sortedUnique(ledger.recoveredCensusArtifactSha256))) {
    throw new Error("Canonical ledger is not bound to the supplied recovered census artifacts");
  }
  if (!digestsEqual(ledger.productionSnapshotSha256, production.snapshotSha256)) {
    throw new Error("Canonical ledger production snapshot hash mismatch");
  }
  if (!digestsEqual(ledger.seedSnapshotSha256, seed.snapshotSha256)) {
    throw new Error("Canonical ledger seed snapshot hash mismatch");
  }

  const canonicalByKey = new Map(ledger.canonicalCompanies.map((company) => [company.canonicalKey, company]));
  for (const row of ledger.censusRows) {
    if (row.canonicalKey === null) continue;
    const company = canonicalByKey.get(row.canonicalKey);
    if (!company?.censusHoldingIds.includes(row.holdingId)) {
      throw new Error(`Canonical company ${row.canonicalKey} does not back-reference holding ${row.holdingId}`);
    }
  }
  for (const row of ledger.repoRows) {
    const company = canonicalByKey.get(row.canonicalKey);
    if (!company) throw new Error(`Unknown canonical company ${row.canonicalKey}`);
    if (row.productionCompanyId && !company.repoCompanyIds.includes(row.productionCompanyId)) {
      throw new Error(`Canonical company ${row.canonicalKey} does not back-reference production company ${row.productionCompanyId}`);
    }
    if (row.seedKey && !company.seedKeys.includes(row.seedKey)) {
      throw new Error(`Canonical company ${row.canonicalKey} does not back-reference seed company ${row.seedKey}`);
    }
  }
  for (const row of ledger.repoOnlyRows) {
    if (row.canonicalKey === null) continue;
    const company = canonicalByKey.get(row.canonicalKey);
    if (!company?.repoOnlyRecordIds.includes(row.repoOnlyId)) {
      throw new Error(
        `Canonical company ${row.canonicalKey} does not back-reference repo-only judgment ${row.repoOnlyId}`,
      );
    }
  }

  if (ledger.summary.recoveredManagers !== recovered.length
    || ledger.summary.censusHoldings !== ledger.censusRows.length
    || ledger.summary.repoOnlyJudgments !== ledger.repoOnlyRows.length
    || ledger.summary.excludedCandidates !== ledger.excludedCandidateLineage.length
    || ledger.summary.productionCompanies !== production.companies.length
    || ledger.summary.seedCompanies !== seed.companies.length
    || ledger.summary.canonicalCompanies !== ledger.canonicalCompanies.length) {
    throw new Error("Canonical ledger summary counts do not match its inputs");
  }
}

type LedgerWithoutDerived = Omit<CanonicalLedger, "summary" | "ledgerSha256">;

export function finalizeCanonicalLedger(
  input: LedgerWithoutDerived,
  dependencies: {
    recoveredInputs: readonly RecoveredCensusInput[];
    productionSnapshot: ProductionSnapshot;
    seedSnapshot: SeedSnapshot;
  },
): CanonicalLedger {
  const summary: CanonicalLedger["summary"] = {
    recoveredManagers: dependencies.recoveredInputs.length,
    censusHoldings: input.censusRows.length,
    repoOnlyJudgments: input.repoOnlyRows.length,
    excludedCandidates: input.excludedCandidateLineage.length,
    productionCompanies: dependencies.productionSnapshot.companies.length,
    seedCompanies: dependencies.seedSnapshot.companies.length,
    canonicalCompanies: input.canonicalCompanies.length,
    unresolvedItems: input.unresolvedConflicts.length
      + input.canonicalCompanies.filter((company) => company.decisionStatus === "NEEDS_REVIEW").length,
    censusDispositionCounts: countsFor(
      ledgerCensusDispositions,
      input.censusRows.map((row) => row.disposition),
    ),
    repoDispositionCounts: countsFor(
      ledgerRepoDispositions,
      input.repoRows.map((row) => row.disposition),
    ),
    repoOnlyDispositionCounts: countsFor(
      ledgerRepoOnlyDispositions,
      input.repoOnlyRows.map((row) => row.disposition),
    ),
  };
  const withoutHash = { ...input, summary };
  const normalized = canonicalLedgerSchema.parse({
    ...withoutHash,
    ledgerSha256: "0".repeat(64),
  });
  const { ledgerSha256: _ledgerSha256, ...normalizedWithoutHash } = normalized;
  const ledger = canonicalLedgerSchema.parse({
    ...normalizedWithoutHash,
    ledgerSha256: sha256Canonical(normalizedWithoutHash),
  });
  assertLedgerCoverage({ ledger, ...dependencies });
  return ledger;
}

export function verifyCanonicalLedger(
  input: unknown,
  dependencies: {
    recoveredInputs: readonly RecoveredCensusInput[];
    productionSnapshot: ProductionSnapshot;
    seedSnapshot: SeedSnapshot;
  },
): CanonicalLedger {
  const ledger = canonicalLedgerSchema.parse(input);
  const { ledgerSha256, ...withoutHash } = ledger;
  if (!digestsEqual(ledgerSha256, sha256Canonical(withoutHash))) {
    throw new Error("Canonical ledger hash does not match its canonical contents");
  }
  assertLedgerCoverage({ ledger, ...dependencies });
  return ledger;
}
