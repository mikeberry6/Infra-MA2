import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { z } from "zod";
import { resolveOrgName } from "../../prisma/entity-resolution";
import {
  FUND_REFRESH_CRITICAL_FIELDS,
  FUND_REFRESH_SNAPSHOT_FIELDS,
  fundEvidenceManifestRecordSchema,
  fundEvidenceManifestSchema,
  fundRefreshCandidateSchema,
  fundRefreshProposalSchema,
  type FundRefreshCandidate,
  type FundRefreshProposal,
  type FundRefreshSnapshot,
} from "../../src/modules/funds/refresh-schema";

export const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
export const FUND_MANIFEST_PATH = path.join(REPO_ROOT, "prisma/seed-data/funds.manifest.json");
export const FUND_EVIDENCE_MANIFEST_PATH = path.join(REPO_ROOT, "prisma/seed-data/fund-evidence.manifest.json");

export interface FundManifestRecord {
  id: string;
  managerName: string;
  fundName: string;
  ticker: string | null;
  investmentStrategy: string;
  sourceUrls: string[];
  size: string;
  sizeUsdMm: number | null;
  sizeNativeCurrency?: string | null;
  sizeNativeAmount?: string | null;
  sizeBasis?: FundRefreshSnapshot["sizeBasis"];
  sizeAsOf?: string | null;
  sizeUsdFxRate?: string | null;
  sizeUsdFxDate?: string | null;
  vintage: string;
  strategies: FundRefreshSnapshot["strategies"];
  structure: FundRefreshSnapshot["structure"];
  status: FundRefreshSnapshot["fundStatus"];
  sectors: FundRefreshSnapshot["sectors"];
  regions: FundRefreshSnapshot["regions"];
  portfolioCompanies: unknown[];
  strategyUrl: string;
}

export interface FundManifest {
  schemaVersion: number;
  funds: FundManifestRecord[];
}

export type EvidenceManifestRecord = z.infer<typeof fundEvidenceManifestRecordSchema>;
export type FundEvidenceManifest = z.infer<typeof fundEvidenceManifestSchema>;

export interface OperationalEvidenceState {
  url: string;
  evidenceLabel: string;
  supportedFields: string[];
  sourceTier: EvidenceManifestRecord["sourceTier"];
  scope: EvidenceManifestRecord["scope"];
  publishedAt: string | null;
  retrievedAt: string;
  confidence: EvidenceManifestRecord["confidence"];
}

export interface ValidationIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  legacyId?: string;
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

export function loadFundManifest(): FundManifest {
  return readJson<FundManifest>(FUND_MANIFEST_PATH);
}

export function loadFundManifestAtCommit(commitSha: string): FundManifest {
  if (!/^[a-f0-9]{40}$/i.test(commitSha)) throw new Error("A full Git SHA is required to read the base fund manifest");
  const contents = execFileSync(
    "git",
    ["show", `${commitSha}:prisma/seed-data/funds.manifest.json`],
    { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
  const manifest = JSON.parse(contents) as FundManifest;
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.funds)) {
    throw new Error(`Base commit ${commitSha} does not contain a supported fund manifest`);
  }
  return manifest;
}

export function loadFundEvidenceManifest(): FundEvidenceManifest {
  return fundEvidenceManifestSchema.parse(readJson<unknown>(FUND_EVIDENCE_MANIFEST_PATH));
}

export function loadFundEvidenceManifestAtCommit(commitSha: string): FundEvidenceManifest {
  if (!/^[a-f0-9]{40}$/i.test(commitSha)) throw new Error("A full Git SHA is required to read the base fund evidence manifest");
  const contents = execFileSync(
    "git",
    ["show", `${commitSha}:prisma/seed-data/fund-evidence.manifest.json`],
    { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
  const parsed = fundEvidenceManifestSchema.safeParse(JSON.parse(contents));
  if (!parsed.success) {
    throw new Error(`Base commit ${commitSha} does not contain a supported fund evidence manifest`);
  }
  return parsed.data;
}

export function evidenceSourceId(url: string): string {
  return `fundsrc_${sha256(url).slice(0, 20)}`;
}

export function validateFundEvidenceManifest(manifest: FundEvidenceManifest): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sortedRecords = [...manifest.records].sort((left, right) =>
    left.legacyId.localeCompare(right.legacyId)
      || left.url.localeCompare(right.url)
      || left.evidenceLabel.localeCompare(right.evidenceLabel),
  );
  if (canonicalJson(sortedRecords) !== canonicalJson(manifest.records)) {
    issues.push({ severity: "error", code: "EVIDENCE_MANIFEST_ORDER", message: "Evidence records must be sorted by legacyId, URL, then evidenceLabel" });
  }
  const sortedNotes = [...manifest.fundNotes].sort((left, right) => left.legacyId.localeCompare(right.legacyId));
  if (canonicalJson(sortedNotes) !== canonicalJson(manifest.fundNotes)) {
    issues.push({ severity: "error", code: "EVIDENCE_NOTE_ORDER", message: "Evidence fund notes must be sorted by legacyId" });
  }

  const evidenceKeys = new Set<string>();
  const sourceIdToUrl = new Map<string, string>();
  const sourceUrlToId = new Map<string, string>();
  for (const record of manifest.records) {
    const key = `${record.legacyId}\u0000${record.sourceId}\u0000${record.evidenceLabel}`;
    if (evidenceKeys.has(key)) {
      issues.push({ severity: "error", code: "DUPLICATE_EVIDENCE", legacyId: record.legacyId, message: `Duplicate evidence key for ${record.url} (${record.evidenceLabel})` });
    }
    evidenceKeys.add(key);
    const expectedSourceId = evidenceSourceId(record.url);
    if (record.sourceId !== expectedSourceId) {
      issues.push({ severity: "error", code: "EVIDENCE_SOURCE_ID", legacyId: record.legacyId, message: `${record.sourceId} must equal deterministic ID ${expectedSourceId}` });
    }
    const existingUrl = sourceIdToUrl.get(record.sourceId);
    if (existingUrl && existingUrl !== record.url) {
      issues.push({ severity: "error", code: "EVIDENCE_SOURCE_ID_COLLISION", legacyId: record.legacyId, message: `${record.sourceId} maps to both ${existingUrl} and ${record.url}` });
    }
    const existingId = sourceUrlToId.get(record.url);
    if (existingId && existingId !== record.sourceId) {
      issues.push({ severity: "error", code: "EVIDENCE_SOURCE_URL_COLLISION", legacyId: record.legacyId, message: `${record.url} maps to both ${existingId} and ${record.sourceId}` });
    }
    sourceIdToUrl.set(record.sourceId, record.url);
    sourceUrlToId.set(record.url, record.sourceId);
    if (!isSortedUnique(record.supportedFields)) {
      issues.push({ severity: "error", code: "EVIDENCE_SUPPORTED_FIELD_ORDER", legacyId: record.legacyId, message: `${record.url} supportedFields must be sorted and unique` });
    }
    for (const field of record.supportedFields) {
      if (!(FUND_REFRESH_SNAPSHOT_FIELDS as readonly string[]).includes(field)) {
        issues.push({ severity: "error", code: "UNKNOWN_SUPPORTED_FIELD", legacyId: record.legacyId, message: `${record.url} supports unknown snapshot field ${field}` });
      }
    }
    if (record.publishedAt && record.publishedAt > record.retrievedAt) {
      issues.push({ severity: "error", code: "EVIDENCE_DATE_ORDER", legacyId: record.legacyId, message: `${record.url} publishedAt cannot be after retrievedAt` });
    }
    if (record.retrievedAt > manifest.asOf) {
      issues.push({ severity: "error", code: "EVIDENCE_AS_OF", legacyId: record.legacyId, message: `${record.url} retrievedAt is after manifest asOf` });
    }
    if (record.scope === "PROGRAM_EXCEPTION" && record.confidence === "HIGH") {
      issues.push({ severity: "error", code: "PROGRAM_CONFIDENCE", legacyId: record.legacyId, message: `${record.url} program-level evidence cannot be HIGH confidence` });
    }
    if (["REPUTABLE_SECONDARY", "OTHER_SECONDARY"].includes(record.sourceTier) && record.confidence === "HIGH") {
      issues.push({ severity: "error", code: "SECONDARY_CONFIDENCE", legacyId: record.legacyId, message: `${record.url} secondary evidence cannot be HIGH confidence` });
    }
  }

  const noteIds = new Set<string>();
  for (const note of manifest.fundNotes) {
    if (noteIds.has(note.legacyId)) {
      issues.push({ severity: "error", code: "DUPLICATE_EVIDENCE_NOTE", legacyId: note.legacyId, message: "Fund has multiple evidence notes" });
    }
    noteIds.add(note.legacyId);
  }
  return issues;
}

export interface RevisionEvidenceManifestInput {
  url: string;
  evidenceLabel: string;
  existing: null | {
    supportedFields: string[];
    sourceTier: EvidenceManifestRecord["sourceTier"];
    scope: EvidenceManifestRecord["scope"];
    publishedAt: string | null;
    retrievedAt: string;
    confidence: EvidenceManifestRecord["confidence"];
    pipelineRunId?: string | null;
  };
}

export function compareManifestEvidenceToRevision(
  manifest: FundEvidenceManifest,
  legacyId: string,
  revisionEvidence: RevisionEvidenceManifestInput[],
): { matches: boolean; expected: EvidenceManifestRecord[]; actual: EvidenceManifestRecord[]; differences: string[] } {
  const key = (value: Pick<EvidenceManifestRecord, "url" | "evidenceLabel">) => `${value.url}\u0000${value.evidenceLabel}`;
  const actual = manifest.records
    .filter((record) => record.legacyId === legacyId)
    .sort((left, right) => left.url.localeCompare(right.url) || left.evidenceLabel.localeCompare(right.evidenceLabel));
  const expected = revisionEvidence.flatMap((record): EvidenceManifestRecord[] => {
    if (!record.existing) return [];
    return [{
      legacyId,
      sourceId: evidenceSourceId(record.url),
      url: record.url,
      supportedFields: [...record.existing.supportedFields].sort(),
      sourceTier: record.existing.sourceTier,
      scope: record.existing.scope,
      publishedAt: record.existing.publishedAt?.slice(0, 10) ?? null,
      retrievedAt: record.existing.retrievedAt.slice(0, 10),
      confidence: record.existing.confidence,
      evidenceLabel: record.evidenceLabel,
    }];
  }).sort((left, right) => left.url.localeCompare(right.url) || left.evidenceLabel.localeCompare(right.evidenceLabel));
  const differences: string[] = [];
  const duplicateRevisionKeys = revisionEvidence
    .map(key)
    .filter((value, index, values) => values.indexOf(value) !== index);
  if (duplicateRevisionKeys.length > 0) differences.push(`Revision evidence contains duplicate keys: ${[...new Set(duplicateRevisionKeys)].join(", ")}`);
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    differences.push(`${legacyId}: version-controlled evidence does not match the revision before-image for affected source/label keys`);
  }
  return { matches: differences.length === 0, expected, actual, differences };
}

export function compareManifestEvidenceRecords(
  manifest: FundEvidenceManifest,
  legacyId: string,
  expectedRecords: EvidenceManifestRecord[],
): { matches: boolean; expected: EvidenceManifestRecord[]; actual: EvidenceManifestRecord[]; differences: string[] } {
  const sortRecords = (records: EvidenceManifestRecord[]) => [...records].sort((left, right) =>
    left.url.localeCompare(right.url) || left.evidenceLabel.localeCompare(right.evidenceLabel),
  );
  const actual = sortRecords(manifest.records.filter((record) => record.legacyId === legacyId));
  const expected = sortRecords(expectedRecords);
  const differences = canonicalJson(actual) === canonicalJson(expected)
    ? []
    : [`${legacyId}: version-controlled evidence does not match the recorded manifest before-image`];
  return { matches: differences.length === 0, expected, actual, differences };
}

/**
 * Proves that a reviewed rollback commit changes desired state only for funds
 * covered by the original applied proposal. The rollback tool separately
 * checks those records against each revision's exact before-image.
 */
export function rollbackManifestScopeBlockers(input: {
  baseManifest: FundManifest;
  currentManifest: FundManifest;
  baseEvidence: FundEvidenceManifest;
  currentEvidence: FundEvidenceManifest;
  allowedLegacyIds: Set<string>;
}): string[] {
  const blockers: string[] = [];
  const findUnrelatedChanges = <T extends { legacyId: string }>(
    baseRows: T[],
    currentRows: T[],
    label: string,
  ) => {
    const group = (rows: T[]) => {
      const grouped = new Map<string, T[]>();
      for (const row of rows) {
        const values = grouped.get(row.legacyId) ?? [];
        values.push(row);
        grouped.set(row.legacyId, values);
      }
      return grouped;
    };
    const baseById = group(baseRows);
    const currentById = group(currentRows);
    const legacyIds = [...new Set([...baseById.keys(), ...currentById.keys()])].sort();
    for (const legacyId of legacyIds) {
      if (canonicalJson(baseById.get(legacyId) ?? []) === canonicalJson(currentById.get(legacyId) ?? [])) continue;
      if (!input.allowedLegacyIds.has(legacyId)) {
        blockers.push(`${legacyId}: rollback PR changes unrelated ${label}`);
      }
    }
  };

  if (input.baseManifest.schemaVersion !== input.currentManifest.schemaVersion) {
    blockers.push("Rollback PR cannot change the fund manifest schema version");
  }
  findUnrelatedChanges(
    input.baseManifest.funds.map((fund) => ({ legacyId: fund.id, fund })),
    input.currentManifest.funds.map((fund) => ({ legacyId: fund.id, fund })),
    "fund manifest state",
  );

  if (input.baseEvidence.schemaVersion !== input.currentEvidence.schemaVersion) {
    blockers.push("Rollback PR cannot change the evidence manifest schema version");
  }
  if (input.baseEvidence.asOf !== input.currentEvidence.asOf) {
    blockers.push("Rollback PR cannot change the global evidence manifest asOf date");
  }
  findUnrelatedChanges(input.baseEvidence.records, input.currentEvidence.records, "evidence records");
  findUnrelatedChanges(input.baseEvidence.fundNotes, input.currentEvidence.fundNotes, "evidence notes");

  return blockers.sort();
}

function evidenceWriteKey(value: Pick<OperationalEvidenceState, "url" | "evidenceLabel">): string {
  return `${value.url}\u0000${value.evidenceLabel}`;
}

function evidenceWriteSemantics(value: OperationalEvidenceState) {
  return {
    supportedFields: [...value.supportedFields].sort(),
    sourceTier: value.sourceTier,
    scope: value.scope,
    publishedAt: value.publishedAt?.slice(0, 10) ?? null,
    retrievedAt: value.retrievedAt.slice(0, 10),
    confidence: value.confidence,
  };
}

/**
 * Returns desired evidence rows that would be inserted or semantically changed
 * in the database without an exact copy in the candidate's reviewed evidence.
 * This binds operational evidence writes to the proposal hash and Pro review
 * packet instead of treating the whole manifest as implicit authorization.
 */
export function findUnreviewedEvidenceWrites(
  desired: OperationalEvidenceState[],
  current: OperationalEvidenceState[],
  reviewed: OperationalEvidenceState[],
): string[] {
  const currentByKey = new Map(current.map((record) => [evidenceWriteKey(record), record]));
  const reviewedByKey = new Map(reviewed.map((record) => [evidenceWriteKey(record), record]));
  const unreviewed: string[] = [];

  for (const desiredRecord of desired) {
    const key = evidenceWriteKey(desiredRecord);
    const currentRecord = currentByKey.get(key);
    const wouldWrite = !currentRecord ||
      canonicalJson(evidenceWriteSemantics(currentRecord)) !== canonicalJson(evidenceWriteSemantics(desiredRecord));
    if (!wouldWrite) continue;

    const reviewedRecord = reviewedByKey.get(key);
    if (
      !reviewedRecord ||
      canonicalJson(evidenceWriteSemantics(reviewedRecord)) !== canonicalJson(evidenceWriteSemantics(desiredRecord))
    ) {
      unreviewed.push(key);
    }
  }

  return unreviewed.sort();
}

export function manifestRecordToSnapshot(fund: FundManifestRecord): FundRefreshSnapshot {
  return {
    legacyId: fund.id,
    managerName: fund.managerName,
    fundName: fund.fundName,
    ticker: fund.ticker,
    investmentStrategy: fund.investmentStrategy,
    size: fund.size,
    sizeUsdMm: fund.sizeUsdMm,
    sizeNativeCurrency: fund.sizeNativeCurrency ?? null,
    sizeNativeAmount: fund.sizeNativeAmount ?? null,
    sizeBasis: fund.sizeBasis ?? null,
    sizeAsOf: fund.sizeAsOf ?? null,
    sizeUsdFxRate: fund.sizeUsdFxRate ?? null,
    sizeUsdFxDate: fund.sizeUsdFxDate ?? null,
    vintage: fund.vintage,
    strategies: [...fund.strategies].sort() as FundRefreshSnapshot["strategies"],
    structure: fund.structure,
    fundStatus: fund.status,
    sectors: [...fund.sectors].sort() as FundRefreshSnapshot["sectors"],
    regions: [...fund.regions].sort() as FundRefreshSnapshot["regions"],
    sourceUrls: [...fund.sourceUrls].sort(),
    strategyUrl: fund.strategyUrl || null,
  };
}

export function normalizeIdentity(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function canonicalManagerKey(managerName: string): string {
  return normalizeIdentity(resolveOrgName(managerName));
}

export function utcCalendarDate(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`).join(",")}}`;
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function managerCohort(managerName: string): 0 | 1 | 2 | 3 {
  const prefix = sha256(normalizeIdentity(managerName)).slice(0, 8);
  return (Number.parseInt(prefix, 16) % 4) as 0 | 1 | 2 | 3;
}

export function isoWeekNumber(date: Date): number {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  return Math.ceil((((day.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
}

export function scheduledManagerCohort(date: Date): 0 | 1 | 2 | 3 {
  return (isoWeekNumber(date) % 4) as 0 | 1 | 2 | 3;
}

export function expectedManagerCoverageCohort(date: Date): "ALL" | 0 | 1 | 2 | 3 {
  const isQuarterOpeningWeek = [0, 3, 6, 9].includes(date.getUTCMonth()) && date.getUTCDate() <= 7;
  return isQuarterOpeningWeek ? "ALL" : scheduledManagerCohort(date);
}

export function proposalHash(proposal: Omit<FundRefreshProposal, "proposalHash"> | FundRefreshProposal): string {
  // Run metadata does not affect the reviewed decision, but retrievedAt is
  // deliberately part of each evidence record. An exact retry hashes the
  // same way; opening the same source in a later weekly cycle produces a new
  // verification proposal and can advance evidence freshness/lastVerifiedAt.
  return sha256(canonicalJson({
    schemaVersion: proposal.schemaVersion,
    candidates: proposal.candidates,
  }));
}

export function snapshotFingerprint(snapshots: FundRefreshSnapshot[]): string {
  const normalized = [...snapshots]
    .sort((left, right) => left.legacyId.localeCompare(right.legacyId))
    .map((snapshot) => {
      const sorted: Record<string, unknown> = {};
      for (const field of FUND_REFRESH_SNAPSHOT_FIELDS) sorted[field] = snapshot[field];
      return sorted;
    });
  return sha256(canonicalJson(normalized));
}

export function snapshotChangedFields(
  before: FundRefreshSnapshot | null,
  after: FundRefreshSnapshot | null,
): Array<keyof FundRefreshSnapshot> {
  if (!before && !after) return [];
  return FUND_REFRESH_SNAPSHOT_FIELDS.filter((field) =>
    canonicalJson(before?.[field] ?? null) !== canonicalJson(after?.[field] ?? null),
  ).sort();
}

export function rollbackGuard(input: {
  legacyId: string;
  before: FundRefreshSnapshot | null;
  appliedAfter: FundRefreshSnapshot | null;
  current: FundRefreshSnapshot | undefined;
  laterRevisionId?: string | null;
}): string[] {
  const blockers: string[] = [];
  if (!input.before) blockers.push(`${input.legacyId}: CREATE has no before-image and cannot be automatically rolled back`);
  if (!input.appliedAfter) blockers.push(`${input.legacyId}: applied after-image is missing`);
  if (input.laterRevisionId) blockers.push(`${input.legacyId}: later revision ${input.laterRevisionId} exists`);
  if (input.appliedAfter && canonicalJson(input.current) !== canonicalJson(input.appliedAfter)) {
    blockers.push(`${input.legacyId}: live fund no longer matches the recorded applied image`);
  }
  return blockers;
}

function addIssue(
  issues: ValidationIssue[],
  code: string,
  message: string,
  candidate?: FundRefreshCandidate,
  severity: ValidationIssue["severity"] = "error",
) {
  issues.push({ severity, code, message, legacyId: candidate?.identity.legacyId });
}

function isSortedUnique(values: string[]): boolean {
  return canonicalJson(values) === canonicalJson([...new Set(values)].sort());
}

function validateSortedUnique(
  values: string[],
  field: string,
  issues: ValidationIssue[],
  candidate: FundRefreshCandidate,
) {
  if (!isSortedUnique(values)) {
    addIssue(issues, "NONCANONICAL_LIST", `${field} must be sorted and contain no duplicates`, candidate);
  }
}

function validateSnapshotLists(
  snapshot: FundRefreshSnapshot,
  label: string,
  issues: ValidationIssue[],
  candidate: FundRefreshCandidate,
) {
  validateSortedUnique(snapshot.strategies, `${label}.strategies`, issues, candidate);
  validateSortedUnique(snapshot.sectors, `${label}.sectors`, issues, candidate);
  validateSortedUnique(snapshot.regions, `${label}.regions`, issues, candidate);
  validateSortedUnique(snapshot.sourceUrls, `${label}.sourceUrls`, issues, candidate);
}

function approximatelyEqual(actual: number, expected: number): boolean {
  const tolerance = Math.max(0.1, Math.abs(expected) * 0.005);
  return Math.abs(actual - expected) <= tolerance;
}

function validateSize(
  snapshot: FundRefreshSnapshot,
  changedFields: string[],
  issues: ValidationIssue[],
  candidate: FundRefreshCandidate,
) {
  const nativePresent = snapshot.sizeNativeAmount !== null || snapshot.sizeNativeCurrency !== null;
  if (nativePresent && (!snapshot.sizeNativeAmount || !snapshot.sizeNativeCurrency || !snapshot.sizeBasis)) {
    addIssue(issues, "SIZE_NATIVE_INCOMPLETE", "Native amount, ISO currency, and size basis must be supplied together", candidate);
  }
  const sizeChanged = changedFields.some((field) => [
    "size",
    "sizeUsdMm",
    "sizeNativeCurrency",
    "sizeNativeAmount",
    "sizeBasis",
    "sizeAsOf",
    "sizeUsdFxRate",
    "sizeUsdFxDate",
  ].includes(field));
  const structuredAmountPresent = nativePresent || snapshot.sizeUsdMm !== null;
  const displayClaimsAmount = /(?:[$€£¥]|\d|\b(?:million|billion|trillion|mm|bn)\b)/i.test(snapshot.size);
  if (sizeChanged && snapshot.sizeBasis === null && structuredAmountPresent) {
    addIssue(issues, "SIZE_BASIS_REQUIRED", "A structured size amount must classify the active amount basis", candidate);
  }
  if (sizeChanged && snapshot.sizeBasis === null && displayClaimsAmount) {
    addIssue(issues, "SIZE_DISPLAY_UNCLASSIFIED", "A numeric size display requires structured amount and basis metadata; use an explicit nonnumeric undisclosed label otherwise", candidate);
  }
  if (snapshot.sizeBasis !== null && snapshot.sizeNativeAmount === null && snapshot.sizeUsdMm === null) {
    addIssue(issues, "SIZE_AMOUNT_REQUIRED", "A size basis requires a native or USD amount", candidate);
  }
  if (snapshot.sizeBasis !== null && snapshot.sizeAsOf === null) {
    addIssue(issues, "SIZE_DATE_REQUIRED", "A classified amount requires a sizeAsOf date", candidate);
  }
  const fxPresent = snapshot.sizeUsdFxRate !== null || snapshot.sizeUsdFxDate !== null;
  if (fxPresent && (!snapshot.sizeUsdFxRate || !snapshot.sizeUsdFxDate || !snapshot.sizeNativeAmount || snapshot.sizeUsdMm === null)) {
    addIssue(issues, "SIZE_FX_INCOMPLETE", "Recorded FX requires native amount, rate/date, and a USD snapshot", candidate);
  }
  if (snapshot.sizeNativeCurrency === "USD" && snapshot.sizeNativeAmount !== null) {
    const expectedUsdMm = Number(snapshot.sizeNativeAmount) / 1_000_000;
    if (snapshot.sizeUsdMm === null || !approximatelyEqual(snapshot.sizeUsdMm, expectedUsdMm)) {
      addIssue(issues, "SIZE_USD_INCONSISTENT", `USD native amount implies sizeUsdMm approximately ${expectedUsdMm}`, candidate);
    }
  } else if (snapshot.sizeUsdFxRate !== null && snapshot.sizeNativeAmount !== null && snapshot.sizeUsdMm !== null) {
    const expectedUsdMm = Number(snapshot.sizeNativeAmount) * Number(snapshot.sizeUsdFxRate) / 1_000_000;
    if (!approximatelyEqual(snapshot.sizeUsdMm, expectedUsdMm)) {
      addIssue(issues, "SIZE_FX_INCONSISTENT", `Recorded FX implies sizeUsdMm approximately ${expectedUsdMm}`, candidate);
    }
  }
  if (snapshot.sizeBasis === "FINAL_CLOSE" && snapshot.fundStatus !== "Financial Close") {
    addIssue(issues, "SIZE_STATUS_INCONSISTENT", "FINAL_CLOSE basis requires Financial Close status", candidate);
  }
}

function evidenceSupports(candidate: FundRefreshCandidate, field: string): boolean {
  return candidate.evidence.some((evidence) => evidence.supportedFields.includes(field));
}

function evidenceHost(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
}

function isSecHost(url: string): boolean {
  const host = evidenceHost(url);
  return host === "sec.gov" || host.endsWith(".sec.gov");
}

function validateCandidate(candidate: FundRefreshCandidate, issues: ValidationIssue[]) {
  const computedFields = snapshotChangedFields(candidate.before, candidate.after);
  const declaredFields = [...candidate.changedFields].sort();

  validateSortedUnique(candidate.changedFields, "changedFields", issues, candidate);
  validateSortedUnique(candidate.unresolvedQuestions, "unresolvedQuestions", issues, candidate);
  validateSortedUnique(candidate.ownershipLinkImpact.matchedOwnershipVehicles, "ownershipLinkImpact.matchedOwnershipVehicles", issues, candidate);
  validateSortedUnique(candidate.ownershipLinkImpact.linkedCompanyIds, "ownershipLinkImpact.linkedCompanyIds", issues, candidate);
  if (candidate.before) validateSnapshotLists(candidate.before, "before", issues, candidate);
  if (candidate.after) validateSnapshotLists(candidate.after, "after", issues, candidate);
  for (const item of candidate.evidence) {
    validateSortedUnique(item.supportedFields, `evidence[${item.sourceId}].supportedFields`, issues, candidate);
    for (const field of item.supportedFields) {
      if (!(FUND_REFRESH_SNAPSHOT_FIELDS as readonly string[]).includes(field)) {
        addIssue(issues, "UNKNOWN_SUPPORTED_FIELD", `Evidence supports unknown snapshot field ${field}`, candidate);
      }
    }
    if (item.publishedAt && item.publishedAt > item.retrievedAt) {
      addIssue(issues, "EVIDENCE_DATE_ORDER", "Evidence publishedAt cannot be after retrievedAt", candidate);
    }
    if (item.scope === "PROGRAM_EXCEPTION" && item.confidence === "HIGH") {
      addIssue(issues, "PROGRAM_CONFIDENCE", "Program-level exception evidence cannot be HIGH confidence", candidate);
    }
  }
  const sortedEvidence = [...candidate.evidence].sort((left, right) =>
    left.url.localeCompare(right.url) || left.evidenceLabel.localeCompare(right.evidenceLabel),
  );
  if (canonicalJson(sortedEvidence) !== canonicalJson(candidate.evidence)) {
    addIssue(issues, "EVIDENCE_ORDER", "Evidence must be sorted by URL then evidenceLabel", candidate);
  }
  const evidenceKeys = new Set<string>();
  for (const item of candidate.evidence) {
    const key = `${item.url}\u0000${item.evidenceLabel}`;
    if (evidenceKeys.has(key)) addIssue(issues, "DUPLICATE_EVIDENCE", `Duplicate evidence URL/label: ${item.url}`, candidate);
    evidenceKeys.add(key);
  }

  if (canonicalJson(computedFields) !== canonicalJson(declaredFields)) {
    addIssue(issues, "FIELD_DIFF_MISMATCH", `Declared changedFields do not match computed fields (${computedFields.join(", ")})`, candidate);
  }
  if (candidate.action === "CREATE" && candidate.before !== null) {
    addIssue(issues, "CREATE_HAS_BEFORE", "CREATE must have a null before snapshot", candidate);
  }
  if (candidate.action !== "CREATE" && candidate.before === null) {
    addIssue(issues, "MISSING_BEFORE", `${candidate.action} requires a before snapshot`, candidate);
  }
  if (["CREATE", "UPDATE", "VERIFY_NO_CHANGE"].includes(candidate.action) && candidate.after === null) {
    addIssue(issues, "MISSING_AFTER", `${candidate.action} requires an after snapshot`, candidate);
  }
  if (["CREATE", "UPDATE", "VERIFY_NO_CHANGE"].includes(candidate.action) && candidate.evidence.length === 0) {
    addIssue(issues, "MISSING_EVIDENCE", `${candidate.action} requires opened evidence`, candidate);
  }
  if (candidate.action === "UPDATE" && computedFields.length === 0) {
    addIssue(issues, "EMPTY_UPDATE", "UPDATE requires at least one changed field", candidate);
  }
  if (candidate.action === "VERIFY_NO_CHANGE" && computedFields.length > 0) {
    addIssue(issues, "VERIFY_HAS_CHANGES", "VERIFY_NO_CHANGE cannot change fields", candidate);
  }
  if (candidate.after && candidate.after.legacyId !== candidate.identity.legacyId) {
    addIssue(issues, "LEGACY_ID_CHANGED", "The stable legacyId cannot change", candidate);
  }
  if (candidate.before && candidate.before.legacyId !== candidate.identity.legacyId) {
    addIssue(issues, "BEFORE_IDENTITY_MISMATCH", "Before snapshot legacyId does not match candidate identity", candidate);
  }
  const identitySnapshot = candidate.after ?? candidate.before;
  if (identitySnapshot && candidate.identity.managerName !== identitySnapshot.managerName) {
    addIssue(issues, "IDENTITY_MANAGER_MISMATCH", "Candidate identity managerName must equal the after snapshot managerName (or before when after is absent)", candidate);
  }
  if (identitySnapshot && candidate.identity.fundName !== identitySnapshot.fundName) {
    addIssue(issues, "IDENTITY_FUND_MISMATCH", "Candidate identity fundName must equal the after snapshot fundName (or before when after is absent)", candidate);
  }
  if (candidate.ownershipLinkImpact.mutationProposed !== false) {
    addIssue(issues, "OWNERSHIP_MUTATION", "Fund refresh proposals may not mutate ownership links", candidate);
  }
  if (candidate.ownershipLinkImpact.matchedOwnershipPeriodCount === 0 && candidate.ownershipLinkImpact.matchedOwnershipVehicles.length > 0) {
    addIssue(issues, "OWNERSHIP_IMPACT_MISMATCH", "Ownership vehicle names require a positive exact-match count", candidate);
  }
  if (candidate.ownershipLinkImpact.matchedOwnershipPeriodCount > 0 && candidate.ownershipLinkImpact.matchedOwnershipVehicles.length === 0) {
    addIssue(issues, "OWNERSHIP_IMPACT_MISSING_NAMES", "Positive ownership impact must enumerate the exact-match vehicle names", candidate);
  }
  if (candidate.ownershipLinkImpact.linkedOwnershipPeriodCount === 0 && candidate.ownershipLinkImpact.linkedCompanyIds.length > 0) {
    addIssue(issues, "OWNERSHIP_LINK_IMPACT_MISMATCH", "Linked company IDs require a positive fund-linked OwnershipPeriod count", candidate);
  }
  if (candidate.ownershipLinkImpact.linkedOwnershipPeriodCount > 0 && candidate.ownershipLinkImpact.linkedCompanyIds.length === 0) {
    addIssue(issues, "OWNERSHIP_LINK_IMPACT_MISSING_COMPANIES", "Positive fund-linked ownership impact must enumerate affected company IDs", candidate);
  }
  if (candidate.after) {
    validateSize(candidate.after, computedFields, issues, candidate);
    if (!(candidate.after.vintage === "Evergreen" || /^\d{4}$/.test(candidate.after.vintage))) {
      addIssue(issues, "INVALID_VINTAGE", `After vintage must be a four-digit year or Evergreen, got ${candidate.after.vintage}`, candidate);
    }
  }

  for (const field of computedFields.filter((value) => FUND_REFRESH_CRITICAL_FIELDS.has(value))) {
    const supportingEvidence = candidate.evidence.filter((evidence) => evidence.supportedFields.includes(field));
    if (!evidenceSupports(candidate, field)) {
      addIssue(issues, "UNSUPPORTED_FIELD", `Changed critical field ${field} has no explicit supporting evidence`, candidate);
      continue;
    }
    const fundSpecificPrimary = supportingEvidence.some((evidence) =>
      evidence.scope === "FUND" && (evidence.sourceTier === "PRIMARY" || evidence.sourceTier === "INSTITUTIONAL"),
    );
    const fundSpecificFields = [
      "managerName",
      "fundName",
      "vintage",
      "fundStatus",
      "size",
      "sizeUsdMm",
      "sizeNativeCurrency",
      "sizeNativeAmount",
      "sizeBasis",
      "sizeAsOf",
      "sizeUsdFxRate",
      "sizeUsdFxDate",
    ];
    const programEligible = Boolean(candidate.after && (
      candidate.after.fundStatus === "Evergreen" ||
      ["Evergreen", "Permanent Capital", "Listed / Evergreen"].includes(candidate.after.structure)
    ));
    const programAllowedFields = new Set([
      "fundStatus",
      "size",
      "sizeUsdMm",
      "sizeNativeCurrency",
      "sizeNativeAmount",
      "sizeBasis",
      "sizeAsOf",
      "sizeUsdFxRate",
      "sizeUsdFxDate",
    ]);
    const programPrimary = supportingEvidence.some((evidence) =>
      evidence.scope === "PROGRAM_EXCEPTION" && (evidence.sourceTier === "PRIMARY" || evidence.sourceTier === "INSTITUTIONAL"),
    );
    const programSizeSemanticsAllowed = !field.startsWith("size") ||
      candidate.after?.sizeBasis === "AUM" || candidate.after?.sizeBasis === "COMMITMENTS";
    const documentedProgramException = programEligible && programAllowedFields.has(field) && programPrimary &&
      candidate.confidence !== "HIGH" && programSizeSemanticsAllowed;
    if (fundSpecificFields.includes(field) && !fundSpecificPrimary && !documentedProgramException) {
      addIssue(issues, "FUND_PRIMARY_REQUIRED", `Changed ${field} requires fund-specific primary or filing-grade evidence`, candidate);
    }
    if (supportingEvidence.length > 0 && supportingEvidence.every((evidence) =>
      evidence.sourceTier === "REPUTABLE_SECONDARY" || evidence.sourceTier === "OTHER_SECONDARY"
    )) {
      const fieldHosts = new Set(supportingEvidence.map((evidence) => evidenceHost(evidence.url)));
      if (fieldHosts.size < 2) {
        addIssue(issues, "SECONDARY_FIELD_CORROBORATION", `Changed ${field} needs two independent secondary domains`, candidate);
      }
    }
    const fieldEvidenceConfidence = Math.max(
      -1,
      ...supportingEvidence.map((evidence) => ({ LOW: 0, MEDIUM: 1, HIGH: 2 }[evidence.confidence])),
    );
    const declaredCandidateConfidence = { LOW: 0, MEDIUM: 1, HIGH: 2 }[candidate.confidence];
    if (declaredCandidateConfidence > fieldEvidenceConfidence) {
      addIssue(issues, "FIELD_CONFIDENCE_OVERSTATED", `${candidate.confidence} candidate confidence exceeds evidence supporting changed ${field}`, candidate);
    }
    if (fieldEvidenceConfidence === 0 && candidate.unresolvedQuestions.length === 0) {
      addIssue(issues, "LOW_FIELD_EVIDENCE_UNRESOLVED", `Low-confidence evidence for changed ${field} requires an unresolved question`, candidate);
    }
  }

  const highestEvidenceConfidence = Math.max(
    -1,
    ...candidate.evidence.map((evidence) => ({ LOW: 0, MEDIUM: 1, HIGH: 2 }[evidence.confidence])),
  );
  const candidateConfidence = { LOW: 0, MEDIUM: 1, HIGH: 2 }[candidate.confidence];
  if (candidateConfidence > highestEvidenceConfidence) {
    addIssue(issues, "CANDIDATE_CONFIDENCE_OVERSTATED", `${candidate.confidence} candidate confidence exceeds its strongest evidence`, candidate);
  }

  if (candidate.confidence === "LOW" && candidate.unresolvedQuestions.length === 0) {
    addIssue(issues, "LOW_CONFIDENCE_NOT_EXPLAINED", "Low-confidence candidate must state an unresolved question", candidate);
  }

  const secondaryOnly = candidate.evidence.length > 0 && candidate.evidence.every((evidence) =>
    evidence.sourceTier === "REPUTABLE_SECONDARY" || evidence.sourceTier === "OTHER_SECONDARY",
  );
  if (secondaryOnly) {
    const hosts = new Set(candidate.evidence.map((evidence) => evidenceHost(evidence.url)));
    if (hosts.size < 2 || candidate.confidence === "HIGH") {
      addIssue(issues, "SECONDARY_EVIDENCE_INSUFFICIENT", "Secondary-only facts need two independent domains and cannot be high confidence", candidate);
    }
  }

  if (candidate.after?.sizeBasis && ["FINAL_CLOSE", "COMMITMENTS", "AUM"].includes(candidate.after.sizeBasis)) {
    const sizeEvidence = candidate.evidence.filter((evidence) =>
      evidence.supportedFields.some((field) => ["size", "sizeUsdMm", "sizeNativeAmount", "sizeBasis"].includes(field)),
    );
    const onlySec = sizeEvidence.length > 0 && sizeEvidence.every((evidence) => isSecHost(evidence.url));
    if (onlySec) {
      addIssue(
        issues,
        candidate.after.sizeBasis === "FINAL_CLOSE" ? "FORM_D_FINAL_CLOSE" : "FORM_D_COMMITTED_CAPITAL",
        `SEC/Form D evidence alone cannot establish ${candidate.after.sizeBasis} capital semantics`,
        candidate,
      );
    }
  }

  const statusChangedToClose = Boolean(
    candidate.before && candidate.after &&
    candidate.before.fundStatus !== "Financial Close" &&
    candidate.after.fundStatus === "Financial Close",
  );
  if (statusChangedToClose) {
    const statusEvidence = candidate.evidence.filter((evidence) => evidence.supportedFields.includes("fundStatus"));
    if (statusEvidence.length > 0 && statusEvidence.every((evidence) => isSecHost(evidence.url))) {
      addIssue(issues, "FORM_D_STATUS_CLOSE", "SEC/Form D evidence alone cannot establish a final fund close", candidate);
    }
  }

  if (candidate.before && candidate.after) {
    const isRename = candidate.before.fundName !== candidate.after.fundName;
    if (isRename && candidate.ownershipLinkImpact.matchedOwnershipPeriodCount > 0) {
      const reportedNames = new Set(candidate.ownershipLinkImpact.matchedOwnershipVehicles);
      if (!reportedNames.has(candidate.before.fundName) && !reportedNames.has(candidate.after.fundName)) {
        addIssue(issues, "RENAME_OWNERSHIP_NAMES", "Rename impact must include the old or proposed fund name among exact-match ownership vehicles", candidate);
      }
      if (candidate.unresolvedQuestions.length === 0) {
        addIssue(issues, "RENAME_REMEDIATION_UNRESOLVED", "A rename with exact OwnershipPeriod matches must remain unresolved pending a separately approved link-remediation or alias plan", candidate);
      }
      if (candidate.confidence === "HIGH") {
        addIssue(issues, "RENAME_APPLY_CONFIDENCE", "A rename with exact OwnershipPeriod matches cannot be marked HIGH/apply-eligible", candidate);
      }
      addIssue(
        issues,
        "RENAME_OWNERSHIP_APPLY_BLOCKED",
        "This rename is reviewable but automated apply remains blocked while exact OwnershipPeriod matches exist",
        candidate,
        "warning",
      );
    }
    const removed = candidate.before.sourceUrls.filter((url) => !candidate.after!.sourceUrls.includes(url));
    const added = candidate.after.sourceUrls.filter((url) => !candidate.before!.sourceUrls.includes(url));
    if (removed.length > added.length) {
      addIssue(issues, "SOURCE_REMOVAL", "Source removal requires at least one replacement for each removed source", candidate);
    }
    const from = candidate.before.fundStatus;
    const to = candidate.after.fundStatus;
    const establishedSizeBases = new Set(["FINAL_CLOSE", "COMMITMENTS", "AUM"]);
    const fundraisingProgressBases = new Set(["TARGET", "AMOUNT_SOLD", "FIRST_CLOSE"]);
    if (
      candidate.before.sizeBasis && candidate.after.sizeBasis &&
      establishedSizeBases.has(candidate.before.sizeBasis) &&
      fundraisingProgressBases.has(candidate.after.sizeBasis)
    ) {
      addIssue(
        issues,
        "SIZE_BASIS_REGRESSION",
        `Established ${candidate.before.sizeBasis} semantics cannot be overwritten by ${candidate.after.sizeBasis}; retain the established amount and report fundraising progress separately for manual review`,
        candidate,
      );
    }
    const programEvergreenTransition = to === "Evergreen" && candidate.confidence !== "HIGH" &&
      ["Evergreen", "Permanent Capital", "Listed / Evergreen"].includes(candidate.after.structure) &&
      candidate.evidence.some((evidence) =>
        evidence.scope === "PROGRAM_EXCEPTION" && evidence.supportedFields.includes("fundStatus") &&
        (evidence.sourceTier === "PRIMARY" || evidence.sourceTier === "INSTITUTIONAL"),
      );
    const allowed = from === to || (from === "Raising" && to === "Financial Close") || programEvergreenTransition;
    if (!allowed) addIssue(issues, "STATUS_TRANSITION", `Status transition ${from} -> ${to} requires manual resolution`, candidate);
  }
}

export function validateFundRefreshCandidate(
  raw: unknown,
): {
  candidate?: FundRefreshCandidate;
  issues: ValidationIssue[];
  zodIssues?: z.core.$ZodIssue[];
} {
  const parsed = fundRefreshCandidateSchema.safeParse(raw);
  if (!parsed.success) {
    return { issues: [], zodIssues: parsed.error.issues };
  }
  const issues: ValidationIssue[] = [];
  validateCandidate(parsed.data, issues);
  return { candidate: parsed.data, issues };
}

export function parseAndValidateProposal(
  raw: unknown,
  manifest: FundManifest = loadFundManifest(),
  coverageManifest: FundManifest = manifest,
): { proposal?: FundRefreshProposal; issues: ValidationIssue[]; zodIssues?: z.core.$ZodIssue[] } {
  const parsed = fundRefreshProposalSchema.safeParse(raw);
  if (!parsed.success) return { issues: [], zodIssues: parsed.error.issues };

  const proposal = parsed.data;
  const issues: ValidationIssue[] = [];
  const computedHash = proposalHash(proposal);
  if (computedHash !== proposal.proposalHash) {
    addIssue(issues, "PROPOSAL_HASH_MISMATCH", `Stored proposal hash does not match ${computedHash}`);
  }
  if (proposal.coverage.candidates !== proposal.candidates.length) {
    addIssue(issues, "COVERAGE_CANDIDATE_COUNT", "Coverage candidate count does not match candidates array");
  }
  const unresolved = proposal.candidates.filter((candidate) =>
    candidate.unresolvedQuestions.length > 0 || candidate.confidence !== "HIGH" || candidate.action === "ARCHIVE_REVIEW",
  ).length;
  if (proposal.coverage.unresolvedCandidates !== unresolved) {
    addIssue(issues, "COVERAGE_UNRESOLVED_COUNT", `Expected unresolvedCandidates=${unresolved}`);
  }
  for (const [field, values] of [
    ["knownManagerKeys", proposal.coverage.knownManagerKeys],
    ["raisingFundIds", proposal.coverage.raisingFundIds],
    ["searchedManagerKeys", proposal.coverage.searchedManagerKeys],
  ] as const) {
    if (!isSortedUnique(values)) addIssue(issues, "COVERAGE_LIST_ORDER", `coverage.${field} must be sorted and unique`);
  }
  const expectedManagerKeys = [...new Set(coverageManifest.funds.map((fund) => canonicalManagerKey(fund.managerName)))].sort();
  const expectedRaisingFundIds = coverageManifest.funds
    .filter((fund) => fund.status === "Raising")
    .map((fund) => fund.id)
    .sort();
  if (canonicalJson(proposal.coverage.knownManagerKeys) !== canonicalJson(expectedManagerKeys)) {
    addIssue(issues, "COVERAGE_MANAGER_IDENTITIES", "coverage.knownManagerKeys must enumerate the exact manifest manager universe");
  }
  if (canonicalJson(proposal.coverage.raisingFundIds) !== canonicalJson(expectedRaisingFundIds)) {
    addIssue(issues, "COVERAGE_RAISING_IDENTITIES", "coverage.raisingFundIds must enumerate every currently raising fund");
  }
  const proposalCandidateIds = new Set(proposal.candidates.map((candidate) => candidate.identity.legacyId));
  const unreviewedRaisingFundIds = expectedRaisingFundIds.filter((legacyId) => !proposalCandidateIds.has(legacyId));
  if (unreviewedRaisingFundIds.length > 0) {
    addIssue(
      issues,
      "COVERAGE_RAISING_CANDIDATES",
      `Every raising vehicle requires a candidate (normally VERIFY_NO_CHANGE); missing: ${unreviewedRaisingFundIds.join(", ")}`,
    );
  }
  if (proposal.coverage.knownManagers !== proposal.coverage.knownManagerKeys.length) {
    addIssue(issues, "COVERAGE_MANAGER_COUNT", "knownManagers does not match knownManagerKeys");
  }
  if (proposal.coverage.raisingFunds !== proposal.coverage.raisingFundIds.length) {
    addIssue(issues, "COVERAGE_RAISING_COUNT", "raisingFunds does not match raisingFundIds");
  }
  if (proposal.coverage.searchedManagers !== proposal.coverage.searchedManagerKeys.length) {
    addIssue(issues, "COVERAGE_SEARCHED_COUNT", "searchedManagers does not match searchedManagerKeys");
  }
  const knownManagerKeySet = new Set(expectedManagerKeys);
  for (const managerKey of proposal.coverage.searchedManagerKeys) {
    if (!knownManagerKeySet.has(managerKey)) addIssue(issues, "COVERAGE_UNKNOWN_SEARCHED_MANAGER", `Searched manager is outside the known universe: ${managerKey}`);
  }
  const coverageDate = new Date(`${proposal.researchWindow.end}T00:00:00.000Z`);
  const expectedCohort = expectedManagerCoverageCohort(coverageDate);
  const declaredCohort = proposal.coverage.managerCohort;
  const cohortIsValid = expectedCohort === "ALL"
    ? declaredCohort === "ALL"
    : declaredCohort === expectedCohort || declaredCohort === "ALL";
  if (!cohortIsValid) {
    addIssue(
      issues,
      "COVERAGE_COHORT_SCHEDULE",
      `coverage.managerCohort must be ${expectedCohort}${expectedCohort === "ALL" ? "" : " or the stronger ALL coverage"} for research-window end ${proposal.researchWindow.end}`,
    );
  }
  const requiredManagerKeys = new Set<string>(
    declaredCohort === "ALL"
      ? expectedManagerKeys
      : expectedManagerKeys.filter((managerKey) => managerCohort(managerKey) === expectedCohort),
  );
  for (const raising of coverageManifest.funds.filter((fund) => fund.status === "Raising")) {
    requiredManagerKeys.add(canonicalManagerKey(raising.managerName));
  }
  const searchedManagerKeySet = new Set(proposal.coverage.searchedManagerKeys);
  const missingRequiredManagers = [...requiredManagerKeys].filter((managerKey) => !searchedManagerKeySet.has(managerKey)).sort();
  if (missingRequiredManagers.length > 0) {
    addIssue(issues, "COVERAGE_REQUIRED_MANAGERS", `Missing raising/cohort managers: ${missingRequiredManagers.join(", ")}`);
  }

  const researchStart = Date.parse(`${proposal.researchWindow.start}T00:00:00.000Z`);
  const researchEnd = Date.parse(`${proposal.researchWindow.end}T00:00:00.000Z`);
  if ((researchEnd - researchStart) / 86_400_000 !== 9) {
    addIssue(issues, "RESEARCH_WINDOW", "Research window must cover exactly ten inclusive calendar days");
  }
  if (utcCalendarDate(proposal.generatedAt) !== proposal.researchWindow.end) {
    addIssue(issues, "RESEARCH_WINDOW_GENERATED_AT", "generatedAt UTC date must equal researchWindow.end");
  }

  const sortedCandidates = [...proposal.candidates].sort((left, right) =>
    left.identity.legacyId.localeCompare(right.identity.legacyId) || left.action.localeCompare(right.action),
  );
  if (canonicalJson(sortedCandidates) !== canonicalJson(proposal.candidates)) {
    addIssue(issues, "CANDIDATE_ORDER", "Candidates must be sorted by legacyId then action");
  }
  const candidateIds = new Set<string>();
  const sourceIdToUrl = new Map<string, string>();
  const sourceUrlToId = new Map<string, string>();
  for (const candidate of proposal.candidates) {
    if (candidateIds.has(candidate.identity.legacyId)) {
      addIssue(issues, "DUPLICATE_CANDIDATE", `Only one candidate is allowed for ${candidate.identity.legacyId}`, candidate);
    }
    candidateIds.add(candidate.identity.legacyId);
    for (const evidence of candidate.evidence) {
      const existingUrl = sourceIdToUrl.get(evidence.sourceId);
      if (existingUrl && existingUrl !== evidence.url) {
        addIssue(issues, "SOURCE_ID_COLLISION", `Evidence sourceId ${evidence.sourceId} maps to multiple URLs`, candidate);
      }
      const existingId = sourceUrlToId.get(evidence.url);
      if (existingId && existingId !== evidence.sourceId) {
        addIssue(issues, "SOURCE_URL_COLLISION", `Evidence URL ${evidence.url} maps to multiple sourceIds`, candidate);
      }
      sourceIdToUrl.set(evidence.sourceId, evidence.url);
      sourceUrlToId.set(evidence.url, evidence.sourceId);
      const retrievedAt = Date.parse(`${evidence.retrievedAt}T00:00:00.000Z`);
      if (retrievedAt < researchStart || retrievedAt > researchEnd) {
        addIssue(issues, "EVIDENCE_RETRIEVAL_WINDOW", `Evidence retrievedAt ${evidence.retrievedAt} falls outside the research window`, candidate);
      }
    }
  }

  const actionable = proposal.candidates.filter((candidate) => candidate.action === "CREATE" || candidate.action === "UPDATE");
  if (coverageManifest.funds.length > 0 && actionable.length / coverageManifest.funds.length > 0.1) {
    addIssue(issues, "CHANGE_THRESHOLD", `Actionable changes affect ${actionable.length}/${coverageManifest.funds.length} reviewed base funds (>10%)`);
  }

  const knownManagers = new Set(coverageManifest.funds.map((fund) => canonicalManagerKey(fund.managerName)));
  const desired = new Map(manifest.funds.map((fund) => [fund.id, manifestRecordToSnapshot(fund)]));
  for (const candidate of proposal.candidates) {
    validateCandidate(candidate, issues);
    if (!knownManagers.has(canonicalManagerKey(candidate.identity.managerName))) {
      addIssue(issues, "UNKNOWN_MANAGER", `Manager is not in the reviewed manifest: ${candidate.identity.managerName}`, candidate);
    }
    if (candidate.action === "CREATE" || candidate.action === "UPDATE") {
      if (candidate.after) desired.set(candidate.identity.legacyId, candidate.after);
    }
  }

  const identities = new Map<string, string>();
  for (const snapshot of desired.values()) {
    const identity = `${canonicalManagerKey(snapshot.managerName)}::${normalizeIdentity(snapshot.fundName)}`;
    const existing = identities.get(identity);
    if (existing && existing !== snapshot.legacyId) {
      addIssue(issues, "DUPLICATE_IDENTITY", `Normalized identity duplicates ${existing} and ${snapshot.legacyId}`);
    }
    identities.set(identity, snapshot.legacyId);
  }

  return { proposal, issues };
}

export function formatZodIssues(issues: z.core.$ZodIssue[]): ValidationIssue[] {
  return issues.map((issue) => ({
    severity: "error",
    code: "SCHEMA",
    message: `${issue.path.join(".") || "proposal"}: ${issue.message}`,
  }));
}

export function parseCliArgs(argv: string[]): Map<string, string | boolean> {
  const args = new Map<string, string | boolean>();
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) throw new Error(`Unexpected argument: ${value}`);
    const raw = value.slice(2);
    const separator = raw.indexOf("=");
    const key = separator === -1 ? raw : raw.slice(0, separator);
    if (!key) throw new Error(`Invalid argument: ${value}`);
    if (args.has(key)) throw new Error(`Duplicate argument: --${key}`);
    if (separator !== -1) {
      const inline = raw.slice(separator + 1);
      if (!inline) throw new Error(`--${key} requires a value after '='`);
      args.set(key, inline);
      continue;
    }
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) args.set(key, true);
    else {
      args.set(key, next);
      index += 1;
    }
  }
  return args;
}

export function requiredString(args: Map<string, string | boolean>, name: string): string {
  const value = args.get(name);
  if (typeof value !== "string" || !value) throw new Error(`--${name} is required`);
  return value;
}
