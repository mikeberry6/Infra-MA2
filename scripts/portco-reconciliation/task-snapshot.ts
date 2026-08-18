import type { PortCo } from "../../prisma/seed-data/portco-types";
import { companyImageSha256 } from "./artifacts";
import {
  executionInFlightStatuses,
  finalizeExecutionTaskSnapshot,
  type ExecutionManifest,
  type ExecutionTaskStatus,
  type ExecutionTaskSnapshot,
  type ProposalQueueIndexArtifact,
} from "./execution-control";
import { digestsEqual, sha256Canonical } from "./hash";
import {
  loadPrismaCompanyImageRow,
  prismaCompanyRowToImage,
  prismaCompanyRowToSnapshot,
} from "./prisma-company-image";
import { seedKey, type DatabaseTargetIdentity } from "./snapshot";
import type {
  CompanyImage,
  ProductionSnapshot,
  ReviewedSeedRetirement,
  SnapshotCompany,
} from "./schema";

interface ReadDelegate {
  findFirst(args: unknown): Promise<unknown>;
  findMany(args: unknown): Promise<unknown[]>;
}

interface TaskSnapshotTransaction {
  $executeRawUnsafe(query: string): Promise<unknown>;
  companyRevision: ReadDelegate;
  ownershipPeriod: ReadDelegate;
  companyRedirect: ReadDelegate;
  fund: ReadDelegate;
  organization: ReadDelegate;
}

export interface TaskSnapshotClient {
  $transaction<T>(
    callback: (transaction: TaskSnapshotTransaction) => Promise<T>,
    options: { isolationLevel: "RepeatableRead"; timeout: number },
  ): Promise<T>;
}

interface DependencyRecord {
  id: string;
  name: string;
  updatedAt: string | Date;
}

interface FundDependencyRecord {
  id: string;
  fundName: string;
  managerId: string;
  updatedAt: string | Date;
}

export interface TaskSnapshotDependencySpec {
  fundNames: string[];
  organizationNames: string[];
}

export function verifyTaskSnapshotDependencySpec(input: unknown): TaskSnapshotDependencySpec {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Task dependency spec must be an object");
  }
  const record = input as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  if (JSON.stringify(keys) !== JSON.stringify(["fundNames", "organizationNames"])) {
    throw new Error("Task dependency spec must contain only fundNames and organizationNames");
  }
  const names = (field: "fundNames" | "organizationNames"): string[] => {
    const value = record[field];
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || !entry.trim())) {
      throw new Error(`Task dependency spec ${field} must be an array of non-empty strings`);
    }
    const normalized = value.map((entry) => (entry as string).trim());
    if (new Set(normalized).size !== normalized.length) {
      throw new Error(`Task dependency spec ${field} must not contain duplicates`);
    }
    return normalized.sort((left, right) => left.localeCompare(right, "en"));
  };
  return {
    fundNames: names("fundNames"),
    organizationNames: names("organizationNames"),
  };
}

interface RedirectDependencyRecord {
  retiredId: string;
  companyId: string;
  reason: string;
  createdAt: string | Date;
}

interface RevisionRecord {
  id: string;
  proposalHash: string;
  appliedAt: string | Date;
}

function iso(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.valueOf())) throw new Error("Task snapshot dependency contains an invalid timestamp");
  return parsed.toISOString();
}

function normalizeDependencies<T extends { id: string; updatedAt: Date | string }>(rows: readonly T[]): Array<Omit<T, "updatedAt"> & { updatedAt: string }> {
  return rows
    .map((row) => ({ ...row, updatedAt: iso(row.updatedAt) }))
    .sort((left, right) => left.id.localeCompare(right.id, "en"));
}

function normalizeRedirects(rows: readonly RedirectDependencyRecord[]): Array<Omit<RedirectDependencyRecord, "createdAt"> & { createdAt: string }> {
  return rows
    .map((row) => ({ ...row, createdAt: iso(row.createdAt) }))
    .sort((left, right) => left.retiredId.localeCompare(right.retiredId, "en"));
}

export interface TaskSnapshotContext {
  schemaVersion: 1;
  artifactType: "PORTCO_RECONCILIATION_TASK_CONTEXT";
  methodologyVersion: "PORTCO_TASK_SNAPSHOT_V1";
  runId: string;
  taskId: string;
  taskIndex: number;
  companyName: string;
  generatedAt: string;
  productionSnapshotLocation: string;
  sourceQueueEntry: ProposalQueueIndexArtifact["entries"][number];
  targetResolution: TaskSnapshotTargetResolution;
  resolvedCanonicalKey: string | null;
  targetCompanyImage: CompanyImage | null;
  seedEntry: PortCo | null;
  seedRetirementCandidates: ReviewedSeedRetirement[];
  dependencies: {
    funds: FundDependencyRecord[];
    organizations: DependencyRecord[];
    redirects: RedirectDependencyRecord[];
  };
  taskSnapshot: ExecutionTaskSnapshot;
  contextSha256: string;
}

type TaskContextWithoutHash = Omit<TaskSnapshotContext, "contextSha256">;

export type TaskSnapshotTargetResolution =
  | {
    method: "IMMUTABLE_QUEUE_TARGET";
    targetCompanyId: string;
    linkedQueueTaskId: null;
  }
  | {
    method: "REVIEWED_MERGE_CANONICAL_TARGET";
    targetCompanyId: string;
    linkedQueueTaskId: null;
    immutableRetiredCompanyId: string;
  }
  | {
    method: "REVIEWED_SYMMETRIC_CANDIDATE";
    targetCompanyId: string;
    linkedQueueTaskId: string;
  }
  | {
    method: "REVIEWED_POST_QUEUE_EXACT_IDENTITY";
    targetCompanyId: string;
    linkedQueueTaskId: null;
  }
  | {
    method: "REVIEWED_POST_QUEUE_DBA_IDENTITY";
    targetCompanyId: string;
    linkedQueueTaskId: null;
  }
  | {
    method: "REVIEWED_POST_QUEUE_PARENTHETICAL_ALIAS_IDENTITY";
    targetCompanyId: string;
    linkedQueueTaskId: null;
  }
  | {
    method: "REVIEWED_POST_QUEUE_MANAGER_SHORT_NAME_ALIAS_IDENTITY";
    targetCompanyId: string;
    linkedQueueTaskId: null;
  }
  | {
    method: "NO_EXISTING_TARGET";
    targetCompanyId: null;
    linkedQueueTaskId: null;
  };

export function canCaptureTaskSnapshot(status: ExecutionTaskStatus): boolean {
  return executionInFlightStatuses.includes(status);
}

function finalizeContext(input: TaskContextWithoutHash): TaskSnapshotContext {
  return { ...input, contextSha256: sha256Canonical(input) };
}

export function assertExpectedSeedEntry(input: {
  expectedSeedKeyCount: number;
  seedEntryPresent: boolean;
  targetRecordStatus: CompanyImage["recordStatus"] | null;
  requireEvaluatedSeedEntry?: boolean;
}): void {
  if (
    input.expectedSeedKeyCount > 0
    && !input.seedEntryPresent
    && (input.requireEvaluatedSeedEntry || input.targetRecordStatus !== "ARCHIVED")
  ) {
    throw new Error("Expected evaluated seed entry is missing or changed identity");
  }
}

export function resolveTaskSnapshotTarget(input: {
  queueEntry: ProposalQueueIndexArtifact["entries"][number];
  queueEntries: ProposalQueueIndexArtifact["entries"];
  reviewedTargetCompanyId?: string;
}): TaskSnapshotTargetResolution {
  const productionIds = input.queueEntry.productionCompanyIds;
  if (productionIds.length > 1) {
    throw new Error("Task snapshot requires one canonical production target; resolve merge targets first");
  }
  const reviewedTargetCompanyId = input.reviewedTargetCompanyId?.trim() || null;
  const immutableTargetCompanyId = productionIds[0] ?? null;
  if (immutableTargetCompanyId) {
    if (reviewedTargetCompanyId && reviewedTargetCompanyId !== immutableTargetCompanyId) {
      const reviewedMergeTarget = input.queueEntry.queueKind === "CANONICAL_COMPANY"
        && input.queueEntry.decisionStatus === "NEEDS_REVIEW"
        && input.queueEntry.actionScopes.company.includes("MERGE_COMPANIES")
        && input.queueEntry.sourceRepoOnlyIds.length > 0
        && input.queueEntry.sourceHoldingIds.length === 0
        && input.queueEntry.seedKeys.length === 1
        && input.queueEntry.candidateCanonicalKeys.length === 0;
      if (!reviewedMergeTarget) {
        throw new Error("Reviewed target company cannot replace the immutable queue target");
      }
      return {
        method: "REVIEWED_MERGE_CANONICAL_TARGET",
        targetCompanyId: reviewedTargetCompanyId,
        linkedQueueTaskId: null,
        immutableRetiredCompanyId: immutableTargetCompanyId,
      };
    }
    return {
      method: "IMMUTABLE_QUEUE_TARGET",
      targetCompanyId: immutableTargetCompanyId,
      linkedQueueTaskId: null,
    };
  }
  if (!reviewedTargetCompanyId) {
    return {
      method: "NO_EXISTING_TARGET",
      targetCompanyId: null,
      linkedQueueTaskId: null,
    };
  }
  const queueCanonicalKey = input.queueEntry.canonicalKey;
  if (!queueCanonicalKey) {
    if (
      input.queueEntry.queueKind === "REPO_ONLY_JUDGMENT"
      && input.queueEntry.decisionStatus === "NEEDS_REVIEW"
      && input.queueEntry.sourceRepoOnlyIds.length > 0
      && input.queueEntry.sourceHoldingIds.length === 0
      && input.queueEntry.productionCompanyIds.length === 0
      && input.queueEntry.seedKeys.length === 0
      && input.queueEntry.candidateCanonicalKeys.length === 0
    ) {
      return {
        method: "REVIEWED_POST_QUEUE_EXACT_IDENTITY",
        targetCompanyId: reviewedTargetCompanyId,
        linkedQueueTaskId: null,
      };
    }
    throw new Error("Reviewed target company requires a canonical-key queue task");
  }
  const symmetricLinks = input.queueEntries.filter((candidate) =>
    candidate.taskId !== input.queueEntry.taskId
    && candidate.canonicalKey !== null
    && candidate.productionCompanyIds.length === 1
    && candidate.productionCompanyIds[0] === reviewedTargetCompanyId
    && input.queueEntry.candidateCanonicalKeys.includes(candidate.canonicalKey)
    && candidate.candidateCanonicalKeys.includes(queueCanonicalKey),
  );
  const reviewedDbaAlias = dbaAlias(input.queueEntry.companyName);
  if (
    symmetricLinks.length === 0
    && reviewedDbaAlias
    && input.queueEntry.queueKind === "CANONICAL_COMPANY"
    && input.queueEntry.decisionStatus === "NEEDS_REVIEW"
    && input.queueEntry.sourceHoldingIds.length > 0
    && input.queueEntry.sourceRepoOnlyIds.length === 0
    && input.queueEntry.productionCompanyIds.length === 0
    && input.queueEntry.seedKeys.length === 0
    && input.queueEntry.candidateCanonicalKeys.length === 0
  ) {
    return {
      method: "REVIEWED_POST_QUEUE_DBA_IDENTITY",
      targetCompanyId: reviewedTargetCompanyId,
      linkedQueueTaskId: null,
    };
  }
  const reviewedParentheticalAliasBase = parentheticalAcronymBase(input.queueEntry.companyName);
  if (
    symmetricLinks.length === 0
    && reviewedParentheticalAliasBase
    && input.queueEntry.queueKind === "CANONICAL_COMPANY"
    && input.queueEntry.decisionStatus === "READY_FOR_PROPOSAL"
    && input.queueEntry.sourceHoldingIds.length > 0
    && input.queueEntry.sourceRepoOnlyIds.length === 0
    && input.queueEntry.productionCompanyIds.length === 0
    && input.queueEntry.seedKeys.length === 0
    && input.queueEntry.candidateCanonicalKeys.length === 0
  ) {
    return {
      method: "REVIEWED_POST_QUEUE_PARENTHETICAL_ALIAS_IDENTITY",
      targetCompanyId: reviewedTargetCompanyId,
      linkedQueueTaskId: null,
    };
  }
  if (
    symmetricLinks.length === 0
    && !/[()[\]/]/.test(input.queueEntry.companyName)
    && input.queueEntry.queueKind === "CANONICAL_COMPANY"
    && input.queueEntry.decisionStatus === "NEEDS_REVIEW"
    && input.queueEntry.sourceHoldingIds.length > 0
    && input.queueEntry.sourceRepoOnlyIds.length === 0
    && input.queueEntry.productionCompanyIds.length === 0
    && input.queueEntry.seedKeys.length === 0
    && input.queueEntry.candidateCanonicalKeys.length === 0
  ) {
    return {
      method: "REVIEWED_POST_QUEUE_MANAGER_SHORT_NAME_ALIAS_IDENTITY",
      targetCompanyId: reviewedTargetCompanyId,
      linkedQueueTaskId: null,
    };
  }
  if (symmetricLinks.length !== 1) {
    throw new Error(
      symmetricLinks.length === 0
        ? "Reviewed target company is not supported by one symmetric immutable queue candidate"
        : "Reviewed target company is ambiguous across symmetric immutable queue candidates",
    );
  }
  return {
    method: "REVIEWED_SYMMETRIC_CANDIDATE",
    targetCompanyId: reviewedTargetCompanyId,
    linkedQueueTaskId: symmetricLinks[0].taskId,
  };
}

function normalizedIdentity(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

function dbaAlias(value: string): string | null {
  const match = value.match(/\(\s*d\s*\/\s*b\s*\/\s*a\s+([^)]+?)\s*\)/i);
  return match?.[1]?.trim() || null;
}

function parentheticalAcronymBase(value: string): string | null {
  const match = value.match(/^(.*?)\s*\(\s*([A-Z][A-Z0-9&.-]{1,15})\s*\)\s*$/);
  return match?.[1]?.trim() || null;
}

const LEGAL_SUFFIXES = new Set([
  "co",
  "company",
  "corp",
  "corporation",
  "inc",
  "incorporated",
  "limited",
  "llc",
  "llp",
  "lp",
  "ltd",
  "plc",
]);

function normalizedCompanyBaseName(value: string): string {
  return normalizedCompanyBaseTokens(value).join("-");
}

function normalizedCompanyBaseTokens(value: string): string[] {
  const tokens = canonicalIdentityPart(value).split("-").filter(Boolean);
  while (tokens.length > 1 && LEGAL_SUFFIXES.has(tokens[tokens.length - 1])) tokens.pop();
  return tokens;
}

const REVIEWED_MANAGER_SHORT_NAME_DESCRIPTORS = new Set(["renewable", "renewables"]);

function isReviewedManagerShortNameAlias(shortName: string, fullName: string): boolean {
  const prefixTokens = normalizedCompanyBaseTokens(shortName);
  const fullNameTokens = normalizedCompanyBaseTokens(fullName);
  return prefixTokens.length > 0
    && fullNameTokens.length === prefixTokens.length + 1
    && prefixTokens.every((token, index) => token === fullNameTokens[index])
    && REVIEWED_MANAGER_SHORT_NAME_DESCRIPTORS.has(fullNameTokens[fullNameTokens.length - 1]);
}

function normalizedParentheticalAliasBaseName(value: string): string {
  return canonicalIdentityPart(value)
    .split("-")
    .map((token) => token === "co" ? "company" : token)
    .join("-");
}

export function matchesImmutableTaskIdentity(
  queueEntry: ProposalQueueIndexArtifact["entries"][number],
  company: Pick<SnapshotCompany, "name" | "country">,
): boolean {
  return normalizedIdentity(company.name) === normalizedIdentity(queueEntry.companyName)
    && normalizedIdentity(company.country) === normalizedIdentity(queueEntry.country);
}

function canonicalIdentityPart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolvedTaskCanonicalKey(input: {
  queueEntry: ProposalQueueIndexArtifact["entries"][number];
  targetResolution: TaskSnapshotTargetResolution;
  targetCompanyImage: CompanyImage | null;
}): string | null {
  if (
    input.targetResolution.method === "REVIEWED_MERGE_CANONICAL_TARGET"
    ||
    input.targetResolution.method === "REVIEWED_POST_QUEUE_DBA_IDENTITY"
    || input.targetResolution.method === "REVIEWED_POST_QUEUE_PARENTHETICAL_ALIAS_IDENTITY"
    || input.targetResolution.method === "REVIEWED_POST_QUEUE_MANAGER_SHORT_NAME_ALIAS_IDENTITY"
  ) {
    if (!input.targetCompanyImage) {
      throw new Error("Reviewed alias target cannot resolve a canonical identity without a company");
    }
    const name = canonicalIdentityPart(input.targetCompanyImage.name);
    const country = canonicalIdentityPart(input.targetCompanyImage.country);
    if (!name || !country) throw new Error("Reviewed alias target cannot resolve an empty canonical identity");
    return `${name}|${country}`;
  }
  if (input.queueEntry.canonicalKey) return input.queueEntry.canonicalKey;
  if (input.targetResolution.method !== "REVIEWED_POST_QUEUE_EXACT_IDENTITY") return null;
  if (!input.targetCompanyImage) {
    throw new Error("Reviewed post-queue target cannot resolve a canonical identity without a company");
  }
  const name = canonicalIdentityPart(input.targetCompanyImage.name);
  const country = canonicalIdentityPart(input.targetCompanyImage.country);
  if (!name || !country) {
    throw new Error("Reviewed post-queue target cannot resolve an empty canonical identity");
  }
  return `${name}|${country}`;
}

export function assertReviewedPostQueueExactIdentity(input: {
  queueEntry: ProposalQueueIndexArtifact["entries"][number];
  targetResolution: TaskSnapshotTargetResolution;
  targetCompanyImage: CompanyImage | null;
  productionCompanies: readonly Pick<SnapshotCompany, "id" | "name" | "country">[];
}): void {
  if (input.targetResolution.method === "REVIEWED_MERGE_CANONICAL_TARGET") {
    if (!input.targetCompanyImage) throw new Error("Reviewed merge target no longer exists");
    if (input.targetCompanyImage.id !== input.targetResolution.targetCompanyId) {
      throw new Error("Reviewed merge target id does not match the captured company");
    }
    if (input.targetResolution.targetCompanyId === input.targetResolution.immutableRetiredCompanyId) {
      throw new Error("Reviewed merge target must differ from the immutable retired company");
    }
    if (
      input.queueEntry.productionCompanyIds.length !== 1
      || input.queueEntry.productionCompanyIds[0] !== input.targetResolution.immutableRetiredCompanyId
    ) {
      throw new Error("Reviewed merge source no longer matches the immutable queue target");
    }
    if (normalizedIdentity(input.targetCompanyImage.country) !== normalizedIdentity(input.queueEntry.country)) {
      throw new Error("Reviewed merge target country differs from the immutable queue country");
    }
    const targetMatches = input.productionCompanies.filter(
      (company) => company.id === input.targetResolution.targetCompanyId,
    );
    const retiredMatches = input.productionCompanies.filter(
      (company) => company.id === input.targetResolution.immutableRetiredCompanyId,
    );
    if (targetMatches.length !== 1 || retiredMatches.length !== 1) {
      throw new Error("Reviewed merge requires exactly one canonical target and one immutable retired company");
    }
    return;
  }
  if (
    input.targetResolution.method !== "REVIEWED_POST_QUEUE_EXACT_IDENTITY"
    && input.targetResolution.method !== "REVIEWED_POST_QUEUE_DBA_IDENTITY"
    && input.targetResolution.method !== "REVIEWED_POST_QUEUE_PARENTHETICAL_ALIAS_IDENTITY"
    && input.targetResolution.method !== "REVIEWED_POST_QUEUE_MANAGER_SHORT_NAME_ALIAS_IDENTITY"
  ) return;
  if (!input.targetCompanyImage) {
    throw new Error("Reviewed post-queue target no longer exists");
  }
  const isDba = input.targetResolution.method === "REVIEWED_POST_QUEUE_DBA_IDENTITY";
  const isParentheticalAlias = input.targetResolution.method
    === "REVIEWED_POST_QUEUE_PARENTHETICAL_ALIAS_IDENTITY";
  const isManagerShortNameAlias = input.targetResolution.method
    === "REVIEWED_POST_QUEUE_MANAGER_SHORT_NAME_ALIAS_IDENTITY";
  const reviewedDbaAlias = isDba ? dbaAlias(input.queueEntry.companyName) : null;
  const reviewedParentheticalAliasBase = isParentheticalAlias
    ? parentheticalAcronymBase(input.queueEntry.companyName)
    : null;
  const matchesTargetIdentity = (company: Pick<SnapshotCompany, "name" | "country">): boolean => {
    if (isDba) {
      return reviewedDbaAlias !== null
        && normalizedCompanyBaseName(company.name) === normalizedCompanyBaseName(reviewedDbaAlias)
        && normalizedIdentity(company.country) === normalizedIdentity(input.queueEntry.country);
    }
    if (isParentheticalAlias) {
      return reviewedParentheticalAliasBase !== null
        && normalizedParentheticalAliasBaseName(company.name)
          === normalizedParentheticalAliasBaseName(reviewedParentheticalAliasBase)
        && normalizedIdentity(company.country) === normalizedIdentity(input.queueEntry.country);
    }
    if (isManagerShortNameAlias) {
      return isReviewedManagerShortNameAlias(input.queueEntry.companyName, company.name)
        && normalizedIdentity(company.country) === normalizedIdentity(input.queueEntry.country);
    }
    return matchesImmutableTaskIdentity(input.queueEntry, company);
  };
  if (!matchesTargetIdentity(input.targetCompanyImage)) {
    throw new Error(
      isDba
        ? "Reviewed post-queue target does not exactly match the immutable DBA alias and country"
        : isParentheticalAlias
          ? "Reviewed post-queue target does not exactly match the immutable parenthetical-alias base and country"
          : isManagerShortNameAlias
            ? "Reviewed post-queue target does not match the immutable manager short-name alias and country"
          : "Reviewed post-queue target does not exactly match the immutable task identity",
    );
  }
  const matches = input.productionCompanies.filter(matchesTargetIdentity);
  if (matches.length !== 1) {
    throw new Error(
      `Reviewed post-queue identity resolved to ${matches.length} production records instead of exactly one`,
    );
  }
  if (
    matches[0].id !== input.targetResolution.targetCompanyId
    || input.targetCompanyImage.id !== input.targetResolution.targetCompanyId
  ) {
    throw new Error("Reviewed post-queue target id does not match the unique exact production identity");
  }
}

export function resolvedTaskSeedKeys(input: {
  queueEntry: ProposalQueueIndexArtifact["entries"][number];
  queueEntries: ProposalQueueIndexArtifact["entries"];
  targetResolution: TaskSnapshotTargetResolution;
  targetCompanyImage: CompanyImage | null;
}): string[] {
  if (input.targetResolution.method === "REVIEWED_MERGE_CANONICAL_TARGET") {
    if (!input.targetCompanyImage) {
      throw new Error("Reviewed merge target cannot bind an absent evaluated seed identity");
    }
    return [seedKey(input.targetCompanyImage.name, input.targetCompanyImage.country)];
  }
  if (input.queueEntry.seedKeys.length > 0) return input.queueEntry.seedKeys;
  if (input.targetResolution.method === "REVIEWED_SYMMETRIC_CANDIDATE") {
    const linked = input.queueEntries.filter((entry) =>
      entry.taskId === input.targetResolution.linkedQueueTaskId
      && entry.productionCompanyIds.length === 1
      && entry.productionCompanyIds[0] === input.targetResolution.targetCompanyId,
    );
    if (linked.length !== 1) {
      throw new Error("Reviewed symmetric target no longer has one linked immutable queue entry");
    }
    if (linked[0].seedKeys.length > 1) {
      throw new Error("Reviewed symmetric target resolves to more than one evaluated seed identity");
    }
    return linked[0].seedKeys;
  }
  if (
    input.targetResolution.method !== "REVIEWED_POST_QUEUE_EXACT_IDENTITY"
    && input.targetResolution.method !== "REVIEWED_POST_QUEUE_DBA_IDENTITY"
    && input.targetResolution.method !== "REVIEWED_POST_QUEUE_PARENTHETICAL_ALIAS_IDENTITY"
    && input.targetResolution.method !== "REVIEWED_POST_QUEUE_MANAGER_SHORT_NAME_ALIAS_IDENTITY"
  ) return [];
  if (!input.targetCompanyImage) {
    throw new Error("Reviewed post-queue target cannot bind an absent evaluated seed identity");
  }
  return [seedKey(input.targetCompanyImage.name, input.targetCompanyImage.country)];
}

function exactSeedEntry(
  companies: readonly PortCo[],
  expectedSeedKey: string,
  label: string,
): PortCo {
  const matches = companies.filter((company) => seedKey(company.name, company.country) === expectedSeedKey);
  if (matches.length !== 1) {
    throw new Error(
      `${label} seed identity ${expectedSeedKey} resolved to ${matches.length} entries instead of exactly one`,
    );
  }
  return matches[0];
}

export function resolveSeedRetirementCandidates(input: {
  queueEntry: ProposalQueueIndexArtifact["entries"][number];
  queueEntries: ProposalQueueIndexArtifact["entries"];
  rawSeedCompanies: readonly PortCo[];
  evaluatedSeedCompanies: readonly PortCo[];
}): ReviewedSeedRetirement[] {
  if (!input.queueEntry.canonicalKey) return [];
  const reciprocal = input.queueEntries
    .filter((candidate) =>
      candidate.taskId !== input.queueEntry.taskId
      && candidate.canonicalKey !== null
      && input.queueEntry.candidateCanonicalKeys.includes(candidate.canonicalKey)
      && candidate.candidateCanonicalKeys.includes(input.queueEntry.canonicalKey!),
    )
    .sort((left, right) => left.taskIndex - right.taskIndex);
  const seedOnly = reciprocal.filter((candidate) =>
    candidate.productionCompanyIds.length === 0 && candidate.seedKeys.length > 0);
  const seenSeedKeys = new Set<string>();
  return seedOnly.map((candidate) => {
    if (candidate.seedKeys.length !== 1) {
      throw new Error(
        `Seed-only queue task ${candidate.taskId} must identify exactly one evaluated seed entry`,
      );
    }
    const candidateSeedKey = candidate.seedKeys[0];
    if (seenSeedKeys.has(candidateSeedKey)) {
      throw new Error(`Reciprocal seed-only queue tasks repeat seed identity ${candidateSeedKey}`);
    }
    seenSeedKeys.add(candidateSeedKey);
    const raw = exactSeedEntry(input.rawSeedCompanies, candidateSeedKey, "Raw");
    const evaluated = exactSeedEntry(input.evaluatedSeedCompanies, candidateSeedKey, "Evaluated");
    if (
      raw.name.trim().toLowerCase() !== evaluated.name.trim().toLowerCase()
      || raw.country.trim().toLowerCase() !== evaluated.country.trim().toLowerCase()
    ) {
      throw new Error(`Raw and evaluated seed identities disagree for ${candidateSeedKey}`);
    }
    return {
      sourceQueueTaskId: candidate.taskId,
      sourceQueueEntrySha256: sha256Canonical(candidate),
      name: evaluated.name,
      country: evaluated.country,
      rawSeedEntrySha256: sha256Canonical(raw),
      evaluatedSeedEntrySha256: sha256Canonical(evaluated),
    };
  });
}

export async function buildTaskSnapshotContext(input: {
  client: TaskSnapshotClient;
  manifest: ExecutionManifest;
  proposalQueue: ProposalQueueIndexArtifact;
  productionSnapshot: ProductionSnapshot;
  productionSnapshotLocation: string;
  target: DatabaseTargetIdentity;
  baseSeedCompanies: readonly PortCo[];
  seedCompanies: readonly PortCo[];
  capturedAt: string;
  reviewedTargetCompanyId?: string;
  dependencySpec?: TaskSnapshotDependencySpec;
}): Promise<TaskSnapshotContext> {
  const task = input.manifest.activeTaskId
    ? input.manifest.tasks.find((candidate) => candidate.taskId === input.manifest.activeTaskId)
    : null;
  if (!task || !canCaptureTaskSnapshot(task.status)) {
    throw new Error("A task snapshot can be built only for the sole in-flight task");
  }
  const queueEntry = input.proposalQueue.entries.find((entry) => entry.taskId === task.taskId);
  if (!queueEntry || queueEntry.taskIndex !== task.sequence) {
    throw new Error("Active task is absent from the immutable proposal queue");
  }
  if (!digestsEqual(sha256Canonical(queueEntry), task.sourceQueueEntrySha256)) {
    throw new Error("Active task proposal queue entry changed after execution initialization");
  }
  if (!digestsEqual(input.proposalQueue.proposalQueueSha256, input.manifest.source.proposalIndex.sha256)) {
    throw new Error("Proposal queue does not match the execution manifest source lineage");
  }
  const targetResolution = resolveTaskSnapshotTarget({
    queueEntry,
    queueEntries: input.proposalQueue.entries,
    reviewedTargetCompanyId: input.reviewedTargetCompanyId,
  });
  const targetId = targetResolution.targetCompanyId;
  const seedRetirementCandidates = resolveSeedRetirementCandidates({
    queueEntry,
    queueEntries: input.proposalQueue.entries,
    rawSeedCompanies: input.baseSeedCompanies,
    evaluatedSeedCompanies: input.seedCompanies,
  });

  const read = await input.client.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    const row = targetId ? await loadPrismaCompanyImageRow(transaction, targetId) : null;
    if (targetId && !row) throw new Error(`Production target ${targetId} no longer exists`);
    const revision = targetId
      ? await transaction.companyRevision.findFirst({
        where: { companyId: targetId },
        orderBy: [{ appliedAt: "desc" }, { id: "desc" }],
        select: { id: true, proposalHash: true, appliedAt: true },
      }) as RevisionRecord | null
      : null;
    const ownershipDependencies = targetId
      ? await transaction.ownershipPeriod.findMany({
        where: { companyId: targetId },
        select: {
          fund: { select: { id: true, fundName: true, managerId: true, updatedAt: true } },
          organization: { select: { id: true, name: true, updatedAt: true } },
        },
        orderBy: { id: "asc" },
      }) as Array<{
        fund: FundDependencyRecord | null;
        organization: DependencyRecord | null;
      }>
      : [];
    const redirects = targetId
      ? await transaction.companyRedirect.findMany({
        where: { OR: [{ companyId: targetId }, { retiredId: targetId }] },
        select: { retiredId: true, companyId: true, reason: true, createdAt: true },
        orderBy: { retiredId: "asc" },
      }) as RedirectDependencyRecord[]
      : [];
    const requestedFundNames = input.dependencySpec?.fundNames ?? [];
    const requestedOrganizationNames = input.dependencySpec?.organizationNames ?? [];
    const requestedFunds = requestedFundNames.length > 0
      ? await transaction.fund.findMany({
          where: { fundName: { in: requestedFundNames } },
          select: { id: true, fundName: true, managerId: true, updatedAt: true },
          orderBy: { id: "asc" },
        }) as FundDependencyRecord[]
      : [];
    const requestedFundManagerIds = [...new Set(requestedFunds.map((fund) => fund.managerId))];
    const requestedFundManagers = requestedFundManagerIds.length > 0
      ? await transaction.organization.findMany({
          where: { id: { in: requestedFundManagerIds } },
          select: { id: true, name: true, updatedAt: true },
          orderBy: { id: "asc" },
        }) as DependencyRecord[]
      : [];
    const requestedOrganizations = requestedOrganizationNames.length > 0
      ? await transaction.organization.findMany({
          where: { name: { in: requestedOrganizationNames } },
          select: { id: true, name: true, updatedAt: true },
          orderBy: { id: "asc" },
        }) as DependencyRecord[]
      : [];
    const foundFundNames = new Set(requestedFunds.map((fund) => fund.fundName));
    const foundOrganizationNames = new Set(requestedOrganizations.map((organization) => organization.name));
    const missingFunds = requestedFundNames.filter((name) => !foundFundNames.has(name));
    const missingOrganizations = requestedOrganizationNames.filter((name) => !foundOrganizationNames.has(name));
    if (missingFunds.length > 0) {
      throw new Error(`Requested task dependency funds do not exist: ${missingFunds.join(", ")}`);
    }
    if (missingOrganizations.length > 0) {
      throw new Error(`Requested task dependency organizations do not exist: ${missingOrganizations.join(", ")}`);
    }
    const foundFundManagerIds = new Set(requestedFundManagers.map((organization) => organization.id));
    const missingFundManagers = requestedFundManagerIds.filter((id) => !foundFundManagerIds.has(id));
    if (missingFundManagers.length > 0) {
      throw new Error(`Requested task dependency fund managers do not exist: ${missingFundManagers.join(", ")}`);
    }
    return {
      row,
      revision,
      ownershipDependencies,
      redirects,
      requestedFunds,
      requestedOrganizations,
      requestedFundManagers,
    };
  }, { isolationLevel: "RepeatableRead", timeout: 30_000 });

  const targetCompanyImage = read.row ? prismaCompanyRowToImage(read.row) : null;
  assertReviewedPostQueueExactIdentity({
    queueEntry,
    targetResolution,
    targetCompanyImage,
    productionCompanies: input.productionSnapshot.companies,
  });
  const targetCompanySnapshotSha256 = targetCompanyImage
    ? companyImageSha256(targetCompanyImage)
    : null;
  if (read.row) {
    const baseline = input.productionSnapshot.companies.find((company) => company.id === read.row!.id);
    if (!baseline) throw new Error("Fresh production target is absent from the proposal-bound production snapshot");
    const observed = prismaCompanyRowToSnapshot(read.row);
    if (!digestsEqual(baseline.companySnapshotSha256, observed.companySnapshotSha256)) {
      throw new Error("Production target changed between baseline and task-scoped capture");
    }
  } else {
    const collision = input.productionSnapshot.companies.find((company) =>
      matchesImmutableTaskIdentity(queueEntry, company));
    if (collision) throw new Error("Create task now collides with an existing production company");
  }

  const expectedSeedKeys = resolvedTaskSeedKeys({
    queueEntry,
    queueEntries: input.proposalQueue.entries,
    targetResolution,
    targetCompanyImage,
  });
  const seedCandidates = input.seedCompanies.filter((company) =>
    expectedSeedKeys.includes(seedKey(company.name, company.country)));
  if (seedCandidates.length > 1) throw new Error("Task resolves to more than one evaluated seed entry");
  const seedEntry = seedCandidates[0] ?? null;
  assertExpectedSeedEntry({
    expectedSeedKeyCount: expectedSeedKeys.length,
    seedEntryPresent: seedEntry !== null,
    targetRecordStatus: targetCompanyImage?.recordStatus ?? null,
    requireEvaluatedSeedEntry: targetResolution.method === "REVIEWED_POST_QUEUE_EXACT_IDENTITY"
      || targetResolution.method === "REVIEWED_MERGE_CANONICAL_TARGET"
      || targetResolution.method === "REVIEWED_POST_QUEUE_DBA_IDENTITY"
      || targetResolution.method === "REVIEWED_POST_QUEUE_PARENTHETICAL_ALIAS_IDENTITY"
      || targetResolution.method === "REVIEWED_POST_QUEUE_MANAGER_SHORT_NAME_ALIAS_IDENTITY",
  });
  const resolvedCanonicalKey = resolvedTaskCanonicalKey({
    queueEntry,
    targetResolution,
    targetCompanyImage,
  });
  const funds = normalizeDependencies(
    read.ownershipDependencies.flatMap((dependency) => dependency.fund ? [dependency.fund] : [])
      .concat(read.requestedFunds),
  ).filter((dependency, index, rows) => rows.findIndex((candidate) => candidate.id === dependency.id) === index);
  const organizations = normalizeDependencies(
    read.ownershipDependencies.flatMap((dependency) => dependency.organization ? [dependency.organization] : [])
      .concat(read.requestedOrganizations, read.requestedFundManagers),
  ).filter((dependency, index, rows) => rows.findIndex((candidate) => candidate.id === dependency.id) === index);
  const redirects = normalizeRedirects(read.redirects);
  const ownershipPeriods = targetCompanyImage?.ownershipPeriods ?? [];
  const pendingTransactions = targetCompanyImage?.pendingOwnershipTransactions ?? [];
  const citations = targetCompanyImage?.citations ?? [];
  const databaseRevision = read.revision
    ? `revision:${sha256Canonical({
      id: read.revision.id,
      proposalHash: read.revision.proposalHash,
      appliedAt: iso(read.revision.appliedAt),
    })}`
    : targetCompanySnapshotSha256
      ? `company-state:${targetCompanySnapshotSha256}`
      : "company-state:ABSENT";
  const taskSnapshot = finalizeExecutionTaskSnapshot({
    schemaVersion: 1,
    artifactType: "PORTCO_RECONCILIATION_TASK_SNAPSHOT",
    methodologyVersion: "PORTCO_TASK_SNAPSHOT_V1",
    runId: input.manifest.runId,
    taskId: task.taskId,
    taskIndex: task.sequence,
    canonicalKey: task.canonicalKey,
    capturedAt: input.capturedAt,
    databaseRevision,
    databaseTargetFingerprint: input.target.fingerprint,
    sourceLedgerSha256: input.manifest.source.ledgerSha256,
    sourceQueueEntrySha256: task.sourceQueueEntrySha256,
    productionSnapshotSha256: input.productionSnapshot.snapshotSha256,
    targetCompanySnapshotSha256,
    seedEntrySha256: seedEntry ? sha256Canonical(seedEntry) : null,
    seedRetirementCandidates,
    dependencies: {
      ownershipPeriodsSha256: sha256Canonical(ownershipPeriods),
      pendingTransactionsSha256: sha256Canonical(pendingTransactions),
      fundsSha256: sha256Canonical(funds),
      organizationsSha256: sha256Canonical(organizations),
      citationsSha256: sha256Canonical(citations),
      redirectsSha256: sha256Canonical(redirects),
    },
  });
  return finalizeContext({
    schemaVersion: 1,
    artifactType: "PORTCO_RECONCILIATION_TASK_CONTEXT",
    methodologyVersion: "PORTCO_TASK_SNAPSHOT_V1",
    runId: input.manifest.runId,
    taskId: task.taskId,
    taskIndex: task.sequence,
    companyName: task.subject,
    generatedAt: input.capturedAt,
    productionSnapshotLocation: input.productionSnapshotLocation,
    sourceQueueEntry: queueEntry,
    targetResolution,
    resolvedCanonicalKey,
    targetCompanyImage,
    seedEntry,
    seedRetirementCandidates,
    dependencies: { funds, organizations, redirects },
    taskSnapshot,
  });
}
