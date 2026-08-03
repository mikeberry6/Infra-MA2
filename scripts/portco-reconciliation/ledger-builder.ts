import { companyDedupKeys } from "../../src/lib/company-key";
import { validateRecoveredCensusCohort } from "./artifacts";
import { sha256Canonical } from "./hash";
import { finalizeCanonicalLedger } from "./ledger";
import { createReconciliationManifest } from "./manifest";
import type {
  CanonicalLedger,
  ProductionSnapshot,
  ReconciliationManifest,
  RecoveredCensusHolding,
  RecoveredCensusInput,
  RecoveredRepoOnlyRecord,
  SeedSnapshot,
  SnapshotCompany,
} from "./schema";

type ProposalAction = CanonicalLedger["canonicalCompanies"][number]["recommendedActions"][number];
type CensusDisposition = CanonicalLedger["censusRows"][number]["disposition"];
type RepoDisposition = CanonicalLedger["repoRows"][number]["disposition"];

interface RepoUnit {
  unitId: string;
  production: SnapshotCompany | null;
  seed: SnapshotCompany | null;
  canonicalKey: string;
  displayName: string;
  country: string;
  exactKeys: Set<string>;
  candidateKeys: Set<string>;
  exactPair: boolean;
  sourceAligned: boolean;
  ambiguityReasons: string[];
}

interface CanonicalWorkingCompany {
  canonicalKey: string;
  displayName: string;
  country: string;
  repoUnit: RepoUnit | null;
  holdings: Array<{ artifact: RecoveredCensusInput; holding: RecoveredCensusHolding }>;
  repoOnlyRecords: Array<{ artifact: RecoveredCensusInput; record: RecoveredRepoOnlyRecord }>;
  candidateKeys: Set<string>;
  ambiguityReasons: string[];
  candidateCanonicalKeys: Set<string>;
}

interface RepoOnlyResolution {
  artifact: RecoveredCensusInput;
  record: RecoveredRepoOnlyRecord;
  canonicalKey: string | null;
  candidateCanonicalKeys: string[];
  resolutionNotes: string[];
}

export interface ProposalQueueEntry {
  taskIndex: number;
  taskId: string;
  canonicalKey: string | null;
  companyName: string;
  country: string;
  decisionStatus: "READY_FOR_PROPOSAL" | "NEEDS_REVIEW" | "DEFERRED";
  queueKind: "CANONICAL_COMPANY" | "REPO_ONLY_JUDGMENT";
  earliestManagerIndex: number | null;
  managers: string[];
  actionScopes: {
    company: ProposalAction[];
    ownership: ProposalAction[];
    verification: ProposalAction[];
  };
  sourceHoldingIds: string[];
  sourceRepoOnlyIds: string[];
  productionCompanyIds: string[];
  seedKeys: string[];
  evidenceUrls: string[];
  candidateCanonicalKeys: string[];
  rationale: string;
  unresolvedQuestions: string[];
}

export interface ProposalQueueIndex {
  schemaVersion: 1;
  artifactType: "PORTCO_PROPOSAL_QUEUE_INDEX";
  methodologyVersion: "PORTCO_TWO_SIDED_LEDGER_V2";
  runId: string;
  asOfDate: string;
  generatedAt: string;
  ledgerSha256: string;
  productionSnapshotSha256: string;
  seedSnapshotSha256: string;
  entries: ProposalQueueEntry[];
  summary: {
    total: number;
    readyForProposal: number;
    needsReview: number;
    deferred: number;
    companyLevelActions: number;
    ownershipLevelActions: number;
    repoOnlyJudgmentTasks: number;
    repoOnlyJudgmentSources: number;
  };
  proposalQueueSha256: string;
}

export interface BuiltLedgerArtifacts {
  ledger: CanonicalLedger;
  manifest: ReconciliationManifest;
  proposalQueue: ProposalQueueIndex;
}

const COMPANY_ACTIONS = new Set<ProposalAction>([
  "CREATE_COMPANY",
  "CORRECT_COMPANY",
  "MERGE_COMPANIES",
  "REALIZE_COMPANY",
]);
const OWNERSHIP_ACTIONS = new Set<ProposalAction>([
  "ADD_OWNER",
  "RETIRE_OWNERSHIP",
  "ADD_PENDING_TRANSACTION",
  "RESOLVE_PENDING_TRANSACTION",
]);

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCountry(value: string): string {
  const normalized = normalizeText(value);
  if (["us", "u s", "usa", "u s a", "united states of america"].includes(normalized)) {
    return "united states";
  }
  if (normalized === "ca") return "canada";
  if (["mx", "united mexican states"].includes(normalized)) return "mexico";
  return normalized;
}

function stableSlug(value: string): string {
  return normalizeText(value).replace(/\s+/g, "-") || "unknown";
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right, "en"));
}

function intersects(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
  for (const value of left) if (right.has(value)) return true;
  return false;
}

function snapshotCountries(company: SnapshotCompany): string[] {
  return sortedUnique(company.countryTags.length > 0 ? company.countryTags : [company.country]);
}

function exactIdentityKeys(names: readonly string[], countries: readonly string[]): Set<string> {
  return new Set(names.flatMap((name) => countries.map((country) =>
    `${normalizeText(name)}\u0000${normalizeCountry(country)}`)));
}

function snapshotExactKeys(company: SnapshotCompany): Set<string> {
  return exactIdentityKeys([company.name], snapshotCountries(company));
}

function holdingNames(holding: RecoveredCensusHolding): string[] {
  return sortedUnique([
    holding.canonicalName,
    holding.companyName,
    ...holding.aliases,
  ].filter((value): value is string => value !== null));
}

function holdingExactKeys(holding: RecoveredCensusHolding): Set<string> {
  return exactIdentityKeys(holdingNames(holding), holding.countries);
}

function heuristicKeys(names: readonly string[], countries: readonly string[]): Set<string> {
  return new Set(names.flatMap((name) => [...companyDedupKeys(name)].flatMap((companyKey) =>
    countries.map((country) => `${companyKey}\u0000${normalizeCountry(country)}`))));
}

function snapshotHeuristicKeys(company: SnapshotCompany): Set<string> {
  return heuristicKeys([company.name], snapshotCountries(company));
}

function holdingHeuristicKeys(holding: RecoveredCensusHolding): Set<string> {
  return heuristicKeys(holdingNames(holding), holding.countries);
}

function repoOnlyExactKeys(record: RecoveredRepoOnlyRecord): Set<string> {
  return exactIdentityKeys([record.repoCompanyName], [record.repoCountry]);
}

function repoOnlyHeuristicKeys(record: RecoveredRepoOnlyRecord): Set<string> {
  return heuristicKeys([record.repoCompanyName], [record.repoCountry]);
}

function repoOnlyLedgerDisposition(
  record: RecoveredRepoOnlyRecord,
): CanonicalLedger["repoOnlyRows"][number]["disposition"] {
  if (record.disposition === "PROPOSED_RETIRE") return "OWNERSHIP_RETIREMENT_REVIEW";
  if (record.disposition === "MATCHED_ELSEWHERE") return "CONSOLIDATION_REVIEW";
  if (record.disposition === "OUT_OF_SCOPE") return "SCOPE_REVIEW";
  return "BLOCKED_REVIEW";
}

function repoOnlyReviewQuestion(record: RecoveredRepoOnlyRecord): string {
  if (record.disposition === "PROPOSED_RETIRE") {
    return "Confirm the exact manager-specific ownership period to retire; do not realize or delete the company while any other current owner may remain.";
  }
  if (record.disposition === "MATCHED_ELSEWHERE") {
    return "Identify and approve the canonical keep record and consolidation boundary; no merge is inferred from this source judgment.";
  }
  if (record.disposition === "OUT_OF_SCOPE") {
    return "Confirm whether the manager ownership, the company itself, or only this census scope is out of scope before proposing any change.";
  }
  if (record.disposition === "UNVERIFIED_EXISTING") {
    return "Current ownership remains unverified and must be resolved with direct evidence before any proposal can be applied.";
  }
  return "Resolve the accepted repo-only review issue with direct evidence before any proposal can be applied.";
}

function isChicagoParkingMetersName(name: string): boolean {
  return companyDedupKeys(name).has("chicago parking meters");
}

function isChicagoParkingMeters(holding: RecoveredCensusHolding): boolean {
  return holdingNames(holding).some(isChicagoParkingMetersName);
}

function holdingManagerTokens(
  artifact: RecoveredCensusInput,
  holding: RecoveredCensusHolding,
): string {
  return normalizeText([
    artifact.requestedManager,
    artifact.canonicalManager ?? "",
    holding.ownership.canonicalManager,
    holding.ownership.organizationName ?? "",
  ].join(" "));
}

function isDeferredCpmStonepeak(
  artifact: RecoveredCensusInput,
  holding: RecoveredCensusHolding,
): boolean {
  return isChicagoParkingMeters(holding)
    && holdingManagerTokens(artifact, holding).includes("stonepeak");
}

function isApprovedCpmOwner(
  artifact: RecoveredCensusInput,
  holding: RecoveredCensusHolding,
): boolean {
  if (!isChicagoParkingMeters(holding)) return false;
  const managers = holdingManagerTokens(artifact, holding);
  return managers.includes("morgan stanley")
    || managers.includes("msip")
    || managers.includes("allianz")
    || managers.includes("adia")
    || managers.includes("abu dhabi investment authority");
}

function effectiveOwnershipState(
  artifact: RecoveredCensusInput,
  holding: RecoveredCensusHolding,
): RecoveredCensusHolding["ownership"]["state"] {
  // Explicit, previously approved CPM exception: retain MSIP, Allianz, and
  // ADIA as current owners and do not surface their announced exit as pending.
  if (isApprovedCpmOwner(artifact, holding) && holding.ownership.state === "SIGNED_PENDING_EXIT") {
    return "CLOSED_ACTIVE";
  }
  return holding.ownership.state;
}

function comparableSnapshot(company: SnapshotCompany): unknown {
  return {
    name: normalizeText(company.name),
    country: normalizeCountry(company.country),
    countryTags: snapshotCountries(company).map(normalizeCountry).sort(),
    sector: company.sector,
    subsector: company.subsector,
    region: company.region,
    companyStatus: company.companyStatus,
    recordStatus: company.recordStatus,
    website: company.website,
    relationCounts: company.relationCounts,
  };
}

function sourceSnapshotsAligned(production: SnapshotCompany, seed: SnapshotCompany): boolean {
  return sha256Canonical(comparableSnapshot(production)) === sha256Canonical(comparableSnapshot(seed));
}

function assignUniqueCanonicalKeys(units: Array<Omit<RepoUnit, "canonicalKey">>): RepoUnit[] {
  const groups = new Map<string, Array<Omit<RepoUnit, "canonicalKey">>>();
  for (const unit of units) {
    const base = `${stableSlug(unit.displayName)}|${stableSlug(unit.country)}`;
    groups.set(base, [...(groups.get(base) ?? []), unit]);
  }
  return [...groups.entries()].flatMap(([base, group]) => {
    const ordered = [...group].sort((left, right) => left.unitId.localeCompare(right.unitId, "en"));
    return ordered.map((unit, index) => ({
      ...unit,
      canonicalKey: ordered.length === 1 ? base : `${base}|record-${index + 1}`,
      ambiguityReasons: ordered.length === 1
        ? unit.ambiguityReasons
        : [...unit.ambiguityReasons, "Multiple repository records share the same exact normalized identity."],
    }));
  }).sort((left, right) => left.canonicalKey.localeCompare(right.canonicalKey, "en"));
}

function buildRepositoryUnits(
  production: ProductionSnapshot,
  seed: SeedSnapshot,
): RepoUnit[] {
  const productionCandidates = new Map<string, SnapshotCompany[]>();
  const seedCandidates = new Map<string, SnapshotCompany[]>();
  for (const productionCompany of production.companies) {
    productionCandidates.set(productionCompany.id!, seed.companies.filter((seedCompany) =>
      intersects(snapshotExactKeys(productionCompany), snapshotExactKeys(seedCompany))));
  }
  for (const seedCompany of seed.companies) {
    seedCandidates.set(seedCompany.seedKey, production.companies.filter((productionCompany) =>
      intersects(snapshotExactKeys(productionCompany), snapshotExactKeys(seedCompany))));
  }

  const pairedProduction = new Set<string>();
  const pairedSeed = new Set<string>();
  const rawUnits: Array<Omit<RepoUnit, "canonicalKey">> = [];
  for (const productionCompany of production.companies) {
    const candidates = productionCandidates.get(productionCompany.id!) ?? [];
    if (candidates.length !== 1) continue;
    const seedCompany = candidates[0];
    if ((seedCandidates.get(seedCompany.seedKey) ?? []).length !== 1) continue;
    pairedProduction.add(productionCompany.id!);
    pairedSeed.add(seedCompany.seedKey);
    rawUnits.push({
      unitId: `both:${productionCompany.id}`,
      production: productionCompany,
      seed: seedCompany,
      displayName: productionCompany.name,
      country: productionCompany.country,
      exactKeys: new Set([...snapshotExactKeys(productionCompany), ...snapshotExactKeys(seedCompany)]),
      candidateKeys: new Set([...snapshotHeuristicKeys(productionCompany), ...snapshotHeuristicKeys(seedCompany)]),
      exactPair: true,
      sourceAligned: sourceSnapshotsAligned(productionCompany, seedCompany),
      ambiguityReasons: [],
    });
  }
  for (const productionCompany of production.companies) {
    if (pairedProduction.has(productionCompany.id!)) continue;
    const exactCandidates = productionCandidates.get(productionCompany.id!) ?? [];
    rawUnits.push({
      unitId: `production:${productionCompany.id}`,
      production: productionCompany,
      seed: null,
      displayName: productionCompany.name,
      country: productionCompany.country,
      exactKeys: snapshotExactKeys(productionCompany),
      candidateKeys: snapshotHeuristicKeys(productionCompany),
      exactPair: false,
      sourceAligned: false,
      ambiguityReasons: exactCandidates.length > 0
        ? [`Production record has ${exactCandidates.length} non-bijective exact seed candidate(s).`]
        : [],
    });
  }
  for (const seedCompany of seed.companies) {
    if (pairedSeed.has(seedCompany.seedKey)) continue;
    const exactCandidates = seedCandidates.get(seedCompany.seedKey) ?? [];
    rawUnits.push({
      unitId: `seed:${seedCompany.seedKey}`,
      production: null,
      seed: seedCompany,
      displayName: seedCompany.name,
      country: seedCompany.country,
      exactKeys: snapshotExactKeys(seedCompany),
      candidateKeys: snapshotHeuristicKeys(seedCompany),
      exactPair: false,
      sourceAligned: false,
      ambiguityReasons: exactCandidates.length > 0
        ? [`Seed record has ${exactCandidates.length} non-bijective exact production candidate(s).`]
        : [],
    });
  }

  const units = assignUniqueCanonicalKeys(rawUnits);
  for (let left = 0; left < units.length; left += 1) {
    for (let right = left + 1; right < units.length; right += 1) {
      if (intersects(units[left].candidateKeys, units[right].candidateKeys)) {
        const reason = `Heuristic identity overlap with ${units[right].canonicalKey}; no automatic merge was made.`;
        const reverse = `Heuristic identity overlap with ${units[left].canonicalKey}; no automatic merge was made.`;
        units[left].ambiguityReasons.push(reason);
        units[right].ambiguityReasons.push(reverse);
      }
    }
  }
  return units;
}

function provisionalKey(
  holdings: Array<{ artifact: RecoveredCensusInput; holding: RecoveredCensusHolding }>,
  used: Set<string>,
): string {
  const ordered = [...holdings].sort((left, right) =>
    left.artifact.managerIndex - right.artifact.managerIndex
    || left.holding.holdingId.localeCompare(right.holding.holdingId, "en"));
  const preferred = ordered[0].holding.canonicalName ?? ordered[0].holding.companyName;
  const country = [...ordered[0].holding.countries].sort()[0];
  const base = `${stableSlug(preferred)}|${stableSlug(country)}`;
  if (!used.has(base)) return base;
  let sequence = 1;
  while (used.has(`${base}|census-${sequence}`)) sequence += 1;
  return `${base}|census-${sequence}`;
}

function groupExactUnmatchedHoldings(
  rows: Array<{ artifact: RecoveredCensusInput; holding: RecoveredCensusHolding }>,
): Array<Array<{ artifact: RecoveredCensusInput; holding: RecoveredCensusHolding }>> {
  const parent = rows.map((_, index) => index);
  const find = (index: number): number => {
    while (parent[index] !== index) {
      parent[index] = parent[parent[index]];
      index = parent[index];
    }
    return index;
  };
  const union = (left: number, right: number): void => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parent[rightRoot] = leftRoot;
  };
  const firstByKey = new Map<string, number>();
  rows.forEach((row, index) => {
    for (const key of holdingExactKeys(row.holding)) {
      const prior = firstByKey.get(key);
      if (prior === undefined) firstByKey.set(key, index);
      else union(prior, index);
    }
  });
  const groups = new Map<number, typeof rows>();
  rows.forEach((row, index) => {
    const root = find(index);
    groups.set(root, [...(groups.get(root) ?? []), row]);
  });
  return [...groups.values()];
}

function actionsForCompany(company: CanonicalWorkingCompany): ProposalAction[] {
  if (isChicagoParkingMetersName(company.displayName)) {
    return company.repoUnit !== null ? ["VERIFY_NO_CHANGE"] : [];
  }
  const actions = new Set<ProposalAction>();
  const hasRepo = company.repoUnit !== null;
  const rows = company.holdings;
  const holdings = rows.map((row) => row.holding);
  const ambiguous = company.ambiguityReasons.length > 0
    || holdings.some((holding) => ["POSSIBLE_DUPLICATE", "NEEDS_REVIEW"].includes(holding.repoDisposition));
  if (ambiguous) return [];

  if (!hasRepo) {
    if (holdings.some((holding) => holding.ownership.state !== "REALIZED")) {
      actions.add("CREATE_COMPANY");
    }
  } else if (!company.repoUnit!.exactPair || !company.repoUnit!.sourceAligned) {
    actions.add("CORRECT_COMPANY");
  }
  if (holdings.some((holding) => holding.repoDisposition === "PROPOSED_CORRECTION")) {
    actions.add("CORRECT_COMPANY");
  }
  if (rows.some(({ artifact, holding }) =>
    effectiveOwnershipState(artifact, holding) === "CLOSED_ACTIVE"
    && (holding.repoDisposition === "PROPOSED_NEW" || !hasRepo))) {
    actions.add("ADD_OWNER");
  }
  if (rows.some(({ artifact, holding }) => {
    const state = effectiveOwnershipState(artifact, holding);
    return state === "SIGNED_PENDING_INCOMING" || state === "SIGNED_PENDING_EXIT";
  })) {
    actions.add("ADD_PENDING_TRANSACTION");
  }
  if (rows.some(({ artifact, holding }) => effectiveOwnershipState(artifact, holding) === "REALIZED")) {
    actions.add("RETIRE_OWNERSHIP");
    const currentLegalOwner = rows.some(({ artifact, holding }) => {
      const state = effectiveOwnershipState(artifact, holding);
      return state === "CLOSED_ACTIVE" || state === "SIGNED_PENDING_EXIT";
    });
    if (hasRepo && !currentLegalOwner) actions.add("REALIZE_COMPANY");
  }
  if (company.repoOnlyRecords.some(({ record }) => record.disposition === "PROPOSED_RETIRE")) {
    actions.add("RETIRE_OWNERSHIP");
  }
  if (company.repoOnlyRecords.some(({ record }) => record.disposition === "MATCHED_ELSEWHERE")) {
    actions.add("MERGE_COMPANIES");
  }
  if (company.repoOnlyRecords.length > 0) actions.delete("VERIFY_NO_CHANGE");
  if (company.repoOnlyRecords.length > 0 && actions.size === 0) return [];
  if (actions.size === 0) actions.add("VERIFY_NO_CHANGE");
  return [...actions].sort();
}

function decisionForCompany(
  company: CanonicalWorkingCompany,
  actions: readonly ProposalAction[],
): CanonicalLedger["canonicalCompanies"][number]["decisionStatus"] {
  if (isChicagoParkingMetersName(company.displayName)) {
    return company.repoUnit !== null ? "NO_CHANGE" : "DEFERRED";
  }
  if (company.ambiguityReasons.length > 0
    || company.holdings.some(({ holding }) =>
      ["POSSIBLE_DUPLICATE", "NEEDS_REVIEW"].includes(holding.repoDisposition))) {
    return "NEEDS_REVIEW";
  }
  if (company.repoOnlyRecords.some(({ record }) => record.disposition !== "PROPOSED_RETIRE")) {
    return "NEEDS_REVIEW";
  }
  if (actions.length === 0) return "DEFERRED";
  if (actions.length === 1 && actions[0] === "VERIFY_NO_CHANGE") return "NO_CHANGE";
  return "READY_FOR_PROPOSAL";
}

function censusDisposition(
  artifact: RecoveredCensusInput,
  holding: RecoveredCensusHolding,
  hasRepo: boolean,
  ambiguous: boolean,
): CensusDisposition {
  const state = effectiveOwnershipState(artifact, holding);
  if (state === "SIGNED_PENDING_INCOMING" || state === "SIGNED_PENDING_EXIT") return "PENDING_TRANSACTION";
  if (state === "REALIZED") {
    return hasRepo ? "OWNERSHIP_RETIREMENT" : "DOCUMENTED_DEFERRAL";
  }
  if (ambiguous || ["POSSIBLE_DUPLICATE", "NEEDS_REVIEW"].includes(holding.repoDisposition)) {
    return "PROPOSED_CORRECTION";
  }
  if (!hasRepo) return "PROPOSED_NEW";
  if (holding.repoDisposition === "PROPOSED_NEW") return "ADDITIONAL_OWNER";
  if (holding.repoDisposition === "PROPOSED_CORRECTION") return "PROPOSED_CORRECTION";
  return "VERIFIED_EXISTING";
}

function repoDisposition(company: CanonicalWorkingCompany): RepoDisposition {
  const unit = company.repoUnit!;
  if (company.ambiguityReasons.length > 0) return "DOCUMENTED_DEFERRAL";
  if (!unit.exactPair || !unit.sourceAligned) return "PROPOSED_CORRECTION";
  if (company.holdings.length > 0) return "MATCHED_CENSUS";
  return "RETAIN_UNLINKED";
}

function rationaleForCompany(
  company: CanonicalWorkingCompany,
  actions: readonly ProposalAction[],
): string {
  if (isChicagoParkingMetersName(company.displayName)) {
    return "Documented user-approved exception: retain MSIP, Allianz, and ADIA; do not add Stonepeak or present a pending exit. The approved CPM after-image remains authoritative.";
  }
  if (company.ambiguityReasons.length > 0) {
    const ambiguitySummary = sortedUnique(company.ambiguityReasons)
      .map((reason) => /[.!?]$/.test(reason) ? reason : `${reason}.`)
      .join(" ");
    return `${ambiguitySummary} Exact identity approval is required before any merge or correction.`;
  }
  if (company.repoOnlyRecords.length > 0) {
    const judgments = company.repoOnlyRecords
      .sort((left, right) =>
        left.artifact.managerIndex - right.artifact.managerIndex
        || left.record.sourceOrdinal - right.record.sourceOrdinal)
      .map(({ artifact, record }) =>
        `${artifact.requestedManager} ${record.disposition}: ${record.rationale}`)
      .join(" ");
    return `Accepted manager repo-only judgment(s) require one consolidated company proposal: ${judgments}`;
  }
  if (company.repoUnit === null) {
    if (actions.length === 0) return "The census identifies only realized ownership and no current repository company; the row is documented for review without creating a company.";
    return `No exact normalized production or seed match exists. Census evidence supports a new canonical company with ${company.holdings.length} manager holding record(s).`;
  }
  if (!company.repoUnit.exactPair) {
    return "The company appears on only one repository side; reconcile production and evaluated seed through an individually approved correction.";
  }
  if (!company.repoUnit.sourceAligned) {
    return "Production and evaluated seed resolve to one exact normalized identity but their list-level fields or relation counts differ.";
  }
  if (actions.length === 1 && actions[0] === "VERIFY_NO_CHANGE") {
    return company.holdings.length > 0
      ? "Production, evaluated seed, and the manager census agree on the exact normalized company identity."
      : "Production and evaluated seed agree; the company is retained even though it was not linked to this 100-manager census.";
  }
  return `The exact normalized company identity is established; ${actions.join(", ")} requires individual review.`;
}

function actionScopes(actions: readonly ProposalAction[]): ProposalQueueEntry["actionScopes"] {
  return {
    company: actions.filter((action) => COMPANY_ACTIONS.has(action)),
    ownership: actions.filter((action) => OWNERSHIP_ACTIONS.has(action)),
    verification: actions.filter((action) => action === "VERIFY_NO_CHANGE"),
  };
}

function makeTaskId(index: number, companyName: string, stableIdentity: string): string {
  return `ledger:${String(index).padStart(4, "0")}:${stableSlug(companyName)}:${sha256Canonical(stableIdentity).slice(0, 8)}`;
}

function renderQueueMarkdown(queue: ProposalQueueIndex): string {
  const rows = queue.entries.map((entry) => {
    const actions = [...entry.actionScopes.company, ...entry.actionScopes.ownership].join(", ") || "Identity review";
    return `| ${entry.taskIndex} | ${entry.companyName.replace(/\|/g, "\\|")} | ${entry.queueKind} | ${entry.decisionStatus} | ${actions} | ${entry.managers.join(", ") || "—"} |`;
  });
  return [
    "# PortCo reconciliation proposal queue",
    "",
    `- Run ID: ${queue.runId}`,
    `- As of: ${queue.asOfDate}`,
    `- Queue SHA-256: ${queue.proposalQueueSha256}`,
    `- Individually reviewable items: ${queue.summary.total}`,
    `- Ready for proposal: ${queue.summary.readyForProposal}`,
    `- Needs identity/ownership review: ${queue.summary.needsReview}`,
    `- Documented deferrals: ${queue.summary.deferred}`,
    "",
    "| # | Company | Queue source | State | Proposed action | Managers |",
    "| ---: | --- | --- | --- | --- | --- |",
    ...(rows.length > 0 ? rows : ["| — | — | — | — | No changes | — |"]),
    "",
    "Heuristic identity overlaps are review signals only. This queue never authorizes or performs a merge or database write.",
    "",
  ].join("\n");
}

export function buildTwoSidedLedger(input: {
  runId: string;
  generatedAt: string;
  managerUniverse: readonly string[];
  recoveredInputs: readonly RecoveredCensusInput[];
  productionSnapshot: ProductionSnapshot;
  seedSnapshot: SeedSnapshot;
}): BuiltLedgerArtifacts & { proposalQueueMarkdown: string } {
  validateRecoveredCensusCohort(input.recoveredInputs, input.managerUniverse, {
    requireCompleteUniverse: true,
  });
  if (input.productionSnapshot.asOfDate !== input.seedSnapshot.asOfDate) {
    throw new Error("Production and evaluated seed snapshots must share one as-of date");
  }
  const parsedGeneratedAt = new Date(input.generatedAt);
  if (Number.isNaN(parsedGeneratedAt.valueOf()) || parsedGeneratedAt.toISOString() !== input.generatedAt) {
    throw new Error("generatedAt must be a canonical UTC ISO timestamp");
  }

  const repoUnits = buildRepositoryUnits(input.productionSnapshot, input.seedSnapshot);
  const working = new Map<string, CanonicalWorkingCompany>();
  for (const unit of repoUnits) {
    working.set(unit.canonicalKey, {
      canonicalKey: unit.canonicalKey,
      displayName: unit.displayName,
      country: unit.country,
      repoUnit: unit,
      holdings: [],
      repoOnlyRecords: [],
      candidateKeys: new Set(unit.candidateKeys),
      ambiguityReasons: [...unit.ambiguityReasons],
      candidateCanonicalKeys: new Set(),
    });
  }

  const recoveredRows = [...input.recoveredInputs]
    .sort((left, right) => left.managerIndex - right.managerIndex)
    .flatMap((artifact) => artifact.holdings.map((holding) => ({ artifact, holding })));
  const deferredCpmHoldingIds = new Set(recoveredRows
    .filter(({ artifact, holding }) => isDeferredCpmStonepeak(artifact, holding))
    .map(({ holding }) => holding.holdingId));
  const unmatched: typeof recoveredRows = [];
  const ambiguousCandidates = new Map<string, RepoUnit[]>();
  for (const row of recoveredRows) {
    if (deferredCpmHoldingIds.has(row.holding.holdingId)) continue;
    const exactKeys = holdingExactKeys(row.holding);
    const candidates = repoUnits.filter((unit) => intersects(exactKeys, unit.exactKeys));
    if (candidates.length === 1) {
      working.get(candidates[0].canonicalKey)!.holdings.push(row);
    } else {
      unmatched.push(row);
      if (candidates.length > 1) ambiguousCandidates.set(row.holding.holdingId, candidates);
    }
  }

  const usedKeys = new Set(working.keys());
  for (const group of groupExactUnmatchedHoldings(unmatched)) {
    const key = provisionalKey(group, usedKeys);
    usedKeys.add(key);
    const ordered = [...group].sort((left, right) =>
      left.artifact.managerIndex - right.artifact.managerIndex
      || left.holding.holdingId.localeCompare(right.holding.holdingId, "en"));
    const first = ordered[0].holding;
    const names = ordered.flatMap(({ holding }) => holdingNames(holding));
    const countries = sortedUnique(ordered.flatMap(({ holding }) => holding.countries));
    const heuristic = new Set(ordered.flatMap(({ holding }) => [...holdingHeuristicKeys(holding)]));
    const exactAmbiguities = sortedUnique(ordered.flatMap(({ holding }) =>
      (ambiguousCandidates.get(holding.holdingId) ?? []).map((unit) => unit.canonicalKey)));
    const heuristicCandidates = repoUnits
      .filter((unit) => intersects(heuristic, unit.candidateKeys))
      .map((unit) => unit.canonicalKey);
    const candidateKeys = sortedUnique([...exactAmbiguities, ...heuristicCandidates]);
    const ambiguityReasons: string[] = [];
    if (exactAmbiguities.length > 0) {
      ambiguityReasons.push(`Census identity matches multiple exact repository candidates: ${exactAmbiguities.join(", ")}.`);
    } else if (heuristicCandidates.length > 0) {
      ambiguityReasons.push(`Only heuristic repository candidate(s) exist: ${sortedUnique(heuristicCandidates).join(", ")}; no automatic merge was made.`);
    }
    if (ordered.some(({ holding }) => ["POSSIBLE_DUPLICATE", "NEEDS_REVIEW"].includes(holding.repoDisposition))) {
      ambiguityReasons.push("The accepted census result explicitly requires identity or duplicate review.");
    }
    const company: CanonicalWorkingCompany = {
      canonicalKey: key,
      displayName: first.canonicalName ?? first.companyName,
      country: countries.join(" / "),
      repoUnit: null,
      holdings: ordered,
      repoOnlyRecords: [],
      candidateKeys: new Set([...heuristic, ...heuristicKeys(names, countries)]),
      ambiguityReasons,
      candidateCanonicalKeys: new Set(candidateKeys),
    };
    working.set(key, company);
    for (const candidateKey of candidateKeys) {
      const candidate = working.get(candidateKey);
      if (!candidate) continue;
      candidate.ambiguityReasons.push(`Census candidate ${key} overlaps this record without an exact approved identity decision.`);
      candidate.candidateCanonicalKeys.add(key);
    }
  }

  // An exact identity match does not resolve a research-level review flag.
  // Carry the accepted holding's concrete rationale into every downstream
  // review surface so a NEEDS_REVIEW task can never become an empty prompt.
  for (const company of working.values()) {
    for (const { holding } of company.holdings) {
      if (holding.repoDisposition === "POSSIBLE_DUPLICATE"
        || holding.repoDisposition === "NEEDS_REVIEW") {
        company.ambiguityReasons.push(
          `Accepted census ${holding.repoDisposition} for ${holding.holdingId}: ${holding.rationale}`,
        );
      }
    }
  }

  const repoOnlyResolutions: RepoOnlyResolution[] = [...input.recoveredInputs]
    .sort((left, right) => left.managerIndex - right.managerIndex)
    .flatMap((artifact) => (artifact.repoOnlyRecords ?? []).map((record) => ({ artifact, record })))
    .map(({ artifact, record }) => {
      const exactCandidates = repoUnits.filter((unit) =>
        intersects(repoOnlyExactKeys(record), unit.exactKeys));
      if (exactCandidates.length === 1) {
        const canonicalKey = exactCandidates[0].canonicalKey;
        working.get(canonicalKey)!.repoOnlyRecords.push({ artifact, record });
        return {
          artifact,
          record,
          canonicalKey,
          candidateCanonicalKeys: [],
          resolutionNotes: [],
        };
      }
      const heuristicCandidates = repoUnits.filter((unit) =>
        intersects(repoOnlyHeuristicKeys(record), unit.candidateKeys));
      const candidateCanonicalKeys = sortedUnique([
        ...exactCandidates.map((unit) => unit.canonicalKey),
        ...heuristicCandidates.map((unit) => unit.canonicalKey),
      ]);
      const resolutionNotes = exactCandidates.length > 1
        ? [`Repo-only identity matches ${exactCandidates.length} exact repository records; no record was selected automatically.`]
        : heuristicCandidates.length > 0
          ? ["Repo-only identity has only heuristic repository candidate(s); no match or merge was made automatically."]
          : ["Repo-only identity has no matching production or evaluated-seed record in the captured snapshots."];
      return {
        artifact,
        record,
        canonicalKey: null,
        candidateCanonicalKeys,
        resolutionNotes,
      };
    });

  const companies = [...working.values()].sort((left, right) =>
    left.displayName.localeCompare(right.displayName, "en")
    || left.country.localeCompare(right.country, "en")
    || left.canonicalKey.localeCompare(right.canonicalKey, "en"));
  const actions = new Map(companies.map((company) => [company.canonicalKey, actionsForCompany(company)]));
  const decisions = new Map(companies.map((company) => [
    company.canonicalKey,
    decisionForCompany(company, actions.get(company.canonicalKey)!),
  ]));

  const generatedConflicts = companies.flatMap((company) =>
    sortedUnique(company.ambiguityReasons).map((issue) => ({
      subject: company.displayName,
      issue,
      recommendedResolution: "Review direct evidence and approve an explicit canonical identity decision; do not infer or auto-merge from heuristic keys.",
      evidenceUrls: sortedUnique(company.holdings.flatMap(({ holding }) => holding.evidence.map((item) => item.url))),
    })));
  const repoOnlyConflicts = repoOnlyResolutions.map(({ record, resolutionNotes }) => ({
    subject: record.repoCompanyName,
    issue: `Accepted repo-only ${record.disposition} judgment: ${record.rationale}`,
    recommendedResolution: [repoOnlyReviewQuestion(record), ...resolutionNotes].join(" "),
    evidenceUrls: sortedUnique(record.evidenceUrls),
  }));
  const sourceConflicts = input.recoveredInputs.flatMap((artifact) => artifact.unresolvedConflicts);
  const unresolvedConflicts = [...sourceConflicts, ...generatedConflicts, ...repoOnlyConflicts].sort((left, right) =>
    left.subject.localeCompare(right.subject, "en") || left.issue.localeCompare(right.issue, "en"));

  const censusRows = recoveredRows.map(({ artifact, holding }) => {
    const deferredCpm = deferredCpmHoldingIds.has(holding.holdingId);
    const company = deferredCpm ? null : companies.find((candidate) =>
      candidate.holdings.some((row) => row.holding.holdingId === holding.holdingId))!;
    const ambiguous = company?.ambiguityReasons.length ? true : false;
    const approvedCpmOwner = isApprovedCpmOwner(artifact, holding);
    return {
      holdingId: holding.holdingId,
      managerIndex: artifact.managerIndex,
      requestedManager: artifact.requestedManager,
      companyName: holding.companyName,
      canonicalKey: company?.canonicalKey ?? null,
      disposition: deferredCpm
        ? "DOCUMENTED_DEFERRAL" as const
        : approvedCpmOwner
          ? (company!.repoUnit !== null ? "VERIFIED_EXISTING" as const : "DOCUMENTED_DEFERRAL" as const)
          : censusDisposition(artifact, holding, company!.repoUnit !== null, ambiguous),
      rationale: deferredCpm
        ? "Documented user-approved CPM exception: Stonepeak is not added; MSIP, Allianz, and ADIA remain the authoritative owners."
        : approvedCpmOwner
          ? "Documented user-approved CPM exception: retain MSIP, Allianz, and ADIA as current owners and do not present the announced exit as pending."
        : ambiguous
          ? "Identity or ownership requires individual review; no heuristic candidate was merged automatically."
          : rationaleForCompany(company!, actions.get(company!.canonicalKey)!),
      evidenceUrls: sortedUnique(holding.evidence.map((item) => item.url)),
    };
  });
  const repoRows = companies.flatMap((company) => {
    const unit = company.repoUnit;
    if (!unit) return [];
    return [{
      repoRowId: unit.unitId,
      productionCompanyId: unit.production?.id ?? null,
      seedKey: unit.seed?.seedKey ?? null,
      sourcePresence: unit.production && unit.seed
        ? "BOTH" as const
        : unit.production
          ? "PRODUCTION_ONLY" as const
          : "SEED_ONLY" as const,
      companyName: unit.displayName,
      canonicalKey: company.canonicalKey,
      disposition: repoDisposition(company),
      rationale: rationaleForCompany(company, actions.get(company.canonicalKey)!),
    }];
  });
  const repoOnlyRows: CanonicalLedger["repoOnlyRows"] = repoOnlyResolutions.map((resolution) => ({
    repoOnlyId: resolution.record.repoOnlyId,
    sourceOrdinal: resolution.record.sourceOrdinal,
    managerIndex: resolution.artifact.managerIndex,
    requestedManager: resolution.artifact.requestedManager,
    sourceResultSha256: resolution.artifact.sourceResult!.acceptedResultSha256,
    companyName: resolution.record.repoCompanyName,
    country: resolution.record.repoCountry,
    sourceDisposition: resolution.record.disposition,
    disposition: repoOnlyLedgerDisposition(resolution.record),
    canonicalKey: resolution.canonicalKey,
    candidateCanonicalKeys: resolution.candidateCanonicalKeys,
    rationale: resolution.record.rationale,
    evidenceUrls: sortedUnique(resolution.record.evidenceUrls),
  })).sort((left, right) =>
    left.managerIndex - right.managerIndex
    || left.sourceOrdinal - right.sourceOrdinal
    || left.repoOnlyId.localeCompare(right.repoOnlyId, "en"));
  const excludedCandidateLineage: CanonicalLedger["excludedCandidateLineage"] = input.recoveredInputs
    .flatMap((artifact) => artifact.excludedCandidates.flatMap((candidate) => {
      if (candidate.excludedCandidateId === undefined || candidate.sourceOrdinal === undefined) return [];
      return [{
        excludedCandidateId: candidate.excludedCandidateId,
        sourceOrdinal: candidate.sourceOrdinal,
        managerIndex: artifact.managerIndex,
        requestedManager: artifact.requestedManager,
        sourceResultSha256: artifact.sourceResult!.acceptedResultSha256,
        companyName: candidate.companyName,
        reasonCode: candidate.reasonCode,
        rationale: candidate.rationale,
        evidenceUrls: sortedUnique(candidate.evidenceUrls),
      }];
    }))
    .sort((left, right) =>
      left.managerIndex - right.managerIndex
      || left.sourceOrdinal - right.sourceOrdinal
      || left.excludedCandidateId.localeCompare(right.excludedCandidateId, "en"));

  const ledger = finalizeCanonicalLedger({
    schemaVersion: 1,
    artifactType: "PORTCO_CANONICAL_LEDGER",
    methodologyVersion: "PORTCO_TWO_SIDED_LEDGER_V2",
    runId: input.runId,
    asOfDate: input.productionSnapshot.asOfDate,
    generatedAt: input.generatedAt,
    recoveredCensusArtifactSha256: sortedUnique(input.recoveredInputs.map((artifact) => artifact.artifactSha256)),
    productionSnapshotSha256: input.productionSnapshot.snapshotSha256,
    seedSnapshotSha256: input.seedSnapshot.snapshotSha256,
    censusRows,
    repoRows,
    repoOnlyRows,
    excludedCandidateLineage,
    canonicalCompanies: companies.map((company) => ({
      canonicalKey: company.canonicalKey,
      displayName: company.displayName,
      country: company.country,
      canonicalRepoCompanyId: company.repoUnit?.production?.id ?? null,
      censusHoldingIds: sortedUnique(company.holdings.map(({ holding }) => holding.holdingId)),
      repoOnlyRecordIds: sortedUnique(company.repoOnlyRecords.map(({ record }) => record.repoOnlyId)),
      repoCompanyIds: sortedUnique(company.repoUnit?.production?.id ? [company.repoUnit.production.id] : []),
      seedKeys: sortedUnique(company.repoUnit?.seed?.seedKey ? [company.repoUnit.seed.seedKey] : []),
      candidateMatchKeys: sortedUnique([...company.candidateKeys]),
      decisionStatus: decisions.get(company.canonicalKey)!,
      recommendedActions: actions.get(company.canonicalKey)!,
      rationale: rationaleForCompany(company, actions.get(company.canonicalKey)!),
    })),
    unresolvedConflicts,
  }, {
    recoveredInputs: input.recoveredInputs,
    productionSnapshot: input.productionSnapshot,
    seedSnapshot: input.seedSnapshot,
  });

  type QueueDraft = Omit<ProposalQueueEntry, "taskIndex" | "taskId"> & { stableIdentity: string };
  const reviewable = companies.filter((company) => decisions.get(company.canonicalKey) !== "NO_CHANGE");
  const companyDrafts: QueueDraft[] = reviewable.map((company) => {
    const companyActions = actions.get(company.canonicalKey)!;
    const repoOnlyReviewQuestions = company.repoOnlyRecords.flatMap(({ record }) =>
      record.disposition === "PROPOSED_RETIRE" && record.evidenceUrls.length > 0
        ? []
        : [repoOnlyReviewQuestion(record)]);
    const managerIndexes = [
      ...company.holdings.map((row) => row.artifact.managerIndex),
      ...company.repoOnlyRecords.map((row) => row.artifact.managerIndex),
    ];
    return {
      stableIdentity: `canonical-company:${company.canonicalKey}`,
      canonicalKey: company.canonicalKey,
      companyName: company.displayName,
      country: company.country,
      decisionStatus: decisions.get(company.canonicalKey)! as ProposalQueueEntry["decisionStatus"],
      queueKind: "CANONICAL_COMPANY",
      earliestManagerIndex: managerIndexes.length > 0
        ? Math.min(...managerIndexes)
        : null,
      managers: sortedUnique([
        ...company.holdings.map((row) => row.artifact.requestedManager),
        ...company.repoOnlyRecords.map((row) => row.artifact.requestedManager),
      ]),
      actionScopes: actionScopes(companyActions),
      sourceHoldingIds: sortedUnique(company.holdings.map((row) => row.holding.holdingId)),
      sourceRepoOnlyIds: sortedUnique(company.repoOnlyRecords.map((row) => row.record.repoOnlyId)),
      productionCompanyIds: sortedUnique(company.repoUnit?.production?.id ? [company.repoUnit.production.id] : []),
      seedKeys: sortedUnique(company.repoUnit?.seed?.seedKey ? [company.repoUnit.seed.seedKey] : []),
      evidenceUrls: sortedUnique([
        ...company.holdings.flatMap((row) => row.holding.evidence.map((item) => item.url)),
        ...company.repoOnlyRecords.flatMap((row) => row.record.evidenceUrls),
      ]),
      candidateCanonicalKeys: sortedUnique([...company.candidateCanonicalKeys]),
      rationale: rationaleForCompany(company, companyActions),
      unresolvedQuestions: sortedUnique([...company.ambiguityReasons, ...repoOnlyReviewQuestions]),
    };
  });
  const repoOnlyDrafts: QueueDraft[] = repoOnlyResolutions
    .filter((resolution) => resolution.canonicalKey === null)
    .map((resolution) => {
    return {
      stableIdentity: `repo-only:${resolution.record.repoOnlyId}`,
      canonicalKey: resolution.canonicalKey,
      companyName: resolution.record.repoCompanyName,
      country: resolution.record.repoCountry,
      decisionStatus: "NEEDS_REVIEW",
      queueKind: "REPO_ONLY_JUDGMENT",
      earliestManagerIndex: resolution.artifact.managerIndex,
      managers: [resolution.artifact.requestedManager],
      actionScopes: actionScopes([]),
      sourceHoldingIds: [],
      sourceRepoOnlyIds: [resolution.record.repoOnlyId],
      productionCompanyIds: [],
      seedKeys: [],
      evidenceUrls: sortedUnique(resolution.record.evidenceUrls),
      candidateCanonicalKeys: resolution.candidateCanonicalKeys,
      rationale: `Accepted repo-only ${resolution.record.disposition} judgment for ${resolution.artifact.requestedManager}: ${resolution.record.rationale}`,
      unresolvedQuestions: sortedUnique([repoOnlyReviewQuestion(resolution.record), ...resolution.resolutionNotes]),
    };
  });
  const drafts = [...companyDrafts, ...repoOnlyDrafts].sort((left, right) =>
    (left.earliestManagerIndex ?? 101) - (right.earliestManagerIndex ?? 101)
    || left.companyName.localeCompare(right.companyName, "en")
    || left.queueKind.localeCompare(right.queueKind, "en")
    || left.stableIdentity.localeCompare(right.stableIdentity, "en"));
  const entries: ProposalQueueEntry[] = drafts.map(({ stableIdentity, ...draft }, index) => ({
    ...draft,
    taskIndex: index + 1,
    taskId: makeTaskId(index + 1, draft.companyName, stableIdentity),
  }));
  const queuedRepoOnlyIds = entries.flatMap((entry) => entry.sourceRepoOnlyIds).sort();
  const ledgerRepoOnlyIds = repoOnlyRows.map((row) => row.repoOnlyId).sort();
  if (new Set(queuedRepoOnlyIds).size !== queuedRepoOnlyIds.length
    || sha256Canonical(queuedRepoOnlyIds) !== sha256Canonical(ledgerRepoOnlyIds)) {
    throw new Error("Proposal queue must reference every repo-only judgment exactly once");
  }
  const queueWithoutHash = {
    schemaVersion: 1 as const,
    artifactType: "PORTCO_PROPOSAL_QUEUE_INDEX" as const,
    methodologyVersion: "PORTCO_TWO_SIDED_LEDGER_V2" as const,
    runId: input.runId,
    asOfDate: input.productionSnapshot.asOfDate,
    generatedAt: input.generatedAt,
    ledgerSha256: ledger.ledgerSha256,
    productionSnapshotSha256: input.productionSnapshot.snapshotSha256,
    seedSnapshotSha256: input.seedSnapshot.snapshotSha256,
    entries,
    summary: {
      total: entries.length,
      readyForProposal: entries.filter((entry) => entry.decisionStatus === "READY_FOR_PROPOSAL").length,
      needsReview: entries.filter((entry) => entry.decisionStatus === "NEEDS_REVIEW").length,
      deferred: entries.filter((entry) => entry.decisionStatus === "DEFERRED").length,
      companyLevelActions: entries.reduce((count, entry) => count + entry.actionScopes.company.length, 0),
      ownershipLevelActions: entries.reduce((count, entry) => count + entry.actionScopes.ownership.length, 0),
      repoOnlyJudgmentTasks: entries.filter((entry) => entry.sourceRepoOnlyIds.length > 0).length,
      repoOnlyJudgmentSources: entries.reduce((count, entry) => count + entry.sourceRepoOnlyIds.length, 0),
    },
  };
  const proposalQueue: ProposalQueueIndex = {
    ...queueWithoutHash,
    proposalQueueSha256: sha256Canonical(queueWithoutHash),
  };
  const managerUniverseSha256 = sha256Canonical(input.managerUniverse);
  const manifest = createReconciliationManifest({
    schemaVersion: 1,
    artifactType: "PORTCO_RECONCILIATION_MANIFEST",
    runId: input.runId,
    asOfDate: input.productionSnapshot.asOfDate,
    createdAt: input.generatedAt,
    updatedAt: input.generatedAt,
    phase: "RECONCILIATION",
    runStatus: "IDLE",
    managerUniverseSha256,
    productionSnapshotSha256: input.productionSnapshot.snapshotSha256,
    seedSnapshotSha256: input.seedSnapshot.snapshotSha256,
    ledgerSha256: ledger.ledgerSha256,
    tasks: entries.map((entry) => ({
      sequence: entry.taskIndex,
      taskId: entry.taskId,
      kind: "LEDGER_CHANGE" as const,
      subject: entry.companyName,
      managerIndex: entry.earliestManagerIndex,
      status: "PENDING" as const,
      attempts: 0,
      startedAt: null,
      updatedAt: input.generatedAt,
      completedAt: null,
      artifacts: [],
      error: null,
    })),
  });
  return { ledger, manifest, proposalQueue, proposalQueueMarkdown: renderQueueMarkdown(proposalQueue) };
}
