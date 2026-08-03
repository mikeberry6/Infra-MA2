import { randomBytes } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { portfolioCensusResultSchema } from "../portfolio-census/schema";
import {
  finalizeRecoveredCensusInput,
  validateRecoveredCensusCohort,
  verifyRecoveredCensusInput,
} from "./artifacts";
import { sha256Canonical, sha256Text } from "./hash";
import {
  recoveredCensusInputSchema,
  sourceRepoOnlyDispositions,
  type RecoveredCensusInput,
} from "./schema";

const EXPECTED_TOTALS = {
  managers: 100,
  holdings: 992,
  excludedCandidates: 484,
  repoOnlyRecords: 202,
  repoOnlyDispositionCounts: {
    MATCHED_ELSEWHERE: 129,
    OUT_OF_SCOPE: 38,
    PROPOSED_RETIRE: 28,
    NEEDS_REVIEW: 6,
    UNVERIFIED_EXISTING: 1,
  },
} as const;

const sha256Value = z.string().regex(/^[a-f0-9]{64}$/);
const relativePath = z.string().trim().min(1).refine((value) =>
  !value.startsWith("/") && !value.includes("\\") && !value.split("/").includes(".."));
const dispositionCountsSchema = z.record(
  z.enum(sourceRepoOnlyDispositions),
  z.number().int().nonnegative(),
);

const manifestEntrySchema = z.strictObject({
  managerIndex: z.number().int().min(1).max(100),
  requestedManager: z.string().trim().min(1),
  artifactPath: relativePath,
  acceptedResultPath: relativePath,
  acceptedResultSha256: sha256Value,
  acceptedResponseSha256: sha256Value,
  recoveredInputV1Sha256: sha256Value,
  reconciliationInputV2Sha256: sha256Value,
  holdings: z.number().int().nonnegative(),
  excludedCandidates: z.number().int().nonnegative(),
  repoOnlyRecords: z.number().int().nonnegative(),
});

export const reconciliationInputManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTCO_CENSUS_RECONCILIATION_INPUT_MANIFEST"),
  methodologyVersion: z.literal("PORTCO_RECONCILIATION_INPUT_V2"),
  asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  generatedAt: z.string().datetime({ offset: true }),
  managerCount: z.number().int().nonnegative(),
  holdingCount: z.number().int().nonnegative(),
  excludedCandidateCount: z.number().int().nonnegative(),
  repoOnlyRecordCount: z.number().int().nonnegative(),
  repoOnlyDispositionCounts: dispositionCountsSchema,
  acceptedResultSha256: z.array(sha256Value),
  recoveredInputV1Sha256: z.array(sha256Value),
  artifacts: z.array(manifestEntrySchema),
  manifestSha256: sha256Value,
});

export type ReconciliationInputManifest = z.infer<typeof reconciliationInputManifestSchema>;
type HistoricalResult = z.infer<typeof portfolioCensusResultSchema>;

const recoveryReportSchema = z.object({
  status: z.literal("PASS"),
  recoveredManagers: z.literal(100),
  managers: z.array(z.object({
    index: z.number().int().min(1).max(100),
    requestedManager: z.string().trim().min(1),
    artifactStem: z.string().trim().min(1),
    acceptedJsonSha256: sha256Value,
    acceptedResponseSha256: sha256Value,
    recoveredInputSha256: sha256Value,
  })),
});

const EXCLUDED_REASON_MAP = {
  REALIZED: "REALIZED",
  NON_INFRASTRUCTURE_STRATEGY: "NON_INFRASTRUCTURE_STRATEGY",
  OUTSIDE_NORTH_AMERICA: "OUTSIDE_NORTH_AMERICA",
  DEBT_ONLY: "DEBT_ONLY",
  FUND_OR_LP_EXPOSURE: "LP_OR_FUND_OF_FUNDS",
  PUBLIC_MARKET_SECURITY: "PUBLIC_SECURITY",
  SUBSIDIARY_OR_PROJECT: "SUBSIDIARY_OR_PROJECT",
  DUPLICATE_PLATFORM: "DUPLICATE_PLATFORM",
  INSUFFICIENT_EVIDENCE: "INSUFFICIENT_EVIDENCE",
  OTHER: "OTHER",
} as const;

function slug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "unknown";
}

function padOrdinal(value: number): string {
  return String(value).padStart(3, "0");
}

function sortedDispositionCounts(
  records: readonly { disposition: typeof sourceRepoOnlyDispositions[number] }[],
): Record<typeof sourceRepoOnlyDispositions[number], number> {
  const counts = Object.fromEntries(sourceRepoOnlyDispositions.map((value) => [value, 0])) as
    Record<typeof sourceRepoOnlyDispositions[number], number>;
  for (const record of records) counts[record.disposition] += 1;
  return counts;
}

function assertEqual(label: string, left: unknown, right: unknown): void {
  if (sha256Canonical(left) !== sha256Canonical(right)) {
    throw new Error(`${label} does not match the immutable accepted result`);
  }
}

export function extendRecoveredInputV2(input: {
  recoveredV1: RecoveredCensusInput;
  historicalResult: HistoricalResult;
  artifactStem: string;
  acceptedResultPath: string;
  acceptedResultSha256: string;
}): RecoveredCensusInput {
  const recovered = verifyRecoveredCensusInput(input.recoveredV1);
  if (recovered.reconciliationInputVersion !== undefined) {
    throw new Error("Expected an immutable v1 recovered input, received an already extended artifact");
  }
  const historical = portfolioCensusResultSchema.parse(input.historicalResult);
  if (historical.requestedManager !== recovered.requestedManager
    || historical.canonicalManager !== recovered.canonicalManager
    || historical.asOfDate !== recovered.asOfDate) {
    throw new Error("Accepted result manager identity or as-of date does not match recovered input");
  }
  if (historical.holdings.length !== recovered.holdings.length) {
    throw new Error("Accepted holding count does not match recovered input");
  }
  const normalizedExcluded = historical.excludedCandidates.map((candidate) => ({
    companyName: candidate.companyName,
    reasonCode: EXCLUDED_REASON_MAP[candidate.reasonCode],
    rationale: candidate.rationale,
    evidenceUrls: candidate.sourceUrl ? [candidate.sourceUrl] : [],
  }));
  assertEqual(
    "Normalized excluded-candidate lineage",
    recovered.excludedCandidates.map(({ excludedCandidateId: _id, sourceOrdinal: _ordinal, ...value }) => value),
    normalizedExcluded,
  );
  const { artifactSha256: recoveredInputV1Sha256, ...withoutHash } = recovered;
  return finalizeRecoveredCensusInput({
    ...withoutHash,
    reconciliationInputVersion: 2,
    sourceResult: {
      acceptedResultPath: input.acceptedResultPath,
      acceptedResultSha256: input.acceptedResultSha256,
      acceptedResponseSha256: recovered.recovery.responseSha256,
      recoveredInputV1Sha256,
    },
    repoOnlyRecords: historical.repoOnlyRecords.map((record, offset) => ({
      repoOnlyId: `${input.artifactStem}:repo-only:${padOrdinal(offset + 1)}:${slug(record.repoCompanyName)}`,
      sourceOrdinal: offset + 1,
      repoCompanyName: record.repoCompanyName,
      repoCountry: record.repoCountry,
      disposition: record.disposition,
      rationale: record.rationale,
      evidenceUrls: record.evidenceUrls,
    })),
    excludedCandidates: recovered.excludedCandidates.map((candidate, offset) => ({
      ...candidate,
      excludedCandidateId: `${input.artifactStem}:excluded:${padOrdinal(offset + 1)}:${slug(candidate.companyName)}`,
      sourceOrdinal: offset + 1,
    })),
  });
}

function finalizeManifest(
  input: Omit<ReconciliationInputManifest, "manifestSha256">,
): ReconciliationInputManifest {
  const normalized = reconciliationInputManifestSchema.parse({
    ...input,
    manifestSha256: "0".repeat(64),
  });
  const { manifestSha256: _hash, ...withoutHash } = normalized;
  return reconciliationInputManifestSchema.parse({
    ...withoutHash,
    manifestSha256: sha256Canonical(withoutHash),
  });
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function repositoryRelative(path: string): string {
  const value = relative(process.cwd(), resolve(path)).replaceAll("\\", "/");
  if (value.startsWith("../") || value === ".." || value.startsWith("/")) {
    throw new Error(`Artifact path must remain beneath the repository: ${resolve(path)}`);
  }
  return value;
}

async function parseJson(path: string): Promise<{ text: string; value: unknown }> {
  const text = await readFile(path, "utf8");
  try {
    return { text, value: JSON.parse(text) as unknown };
  } catch {
    throw new Error(`Invalid JSON in ${resolve(path)}`);
  }
}

export interface BuildInputOptions {
  acceptedDir: string;
  recoveredDir: string;
  recoveryReport: string;
  managerUniverse: string;
  outputDir: string;
  generatedAt: string;
}

export async function buildReconciliationInputs(options: BuildInputOptions): Promise<{
  manifest: ReconciliationInputManifest;
  artifacts: RecoveredCensusInput[];
}> {
  const timestamp = new Date(options.generatedAt);
  if (Number.isNaN(timestamp.valueOf()) || timestamp.toISOString() !== options.generatedAt) {
    throw new Error("generatedAt must be a canonical UTC ISO timestamp");
  }
  const [{ value: rawReport }, { value: rawManagers }] = await Promise.all([
    parseJson(options.recoveryReport),
    parseJson(options.managerUniverse),
  ]);
  const report = recoveryReportSchema.parse(rawReport);
  if (!Array.isArray(rawManagers) || rawManagers.length !== 100
    || rawManagers.some((value) => typeof value !== "string" || value.trim().length === 0)) {
    throw new Error("Manager universe must contain exactly 100 manager names");
  }
  const managers = rawManagers.map((value) => String(value).trim());
  const artifacts: RecoveredCensusInput[] = [];
  const entries: ReconciliationInputManifest["artifacts"] = [];
  for (const record of [...report.managers].sort((left, right) => left.index - right.index)) {
    if (managers[record.index - 1] !== record.requestedManager) {
      throw new Error(`Recovery report manager ${record.index} does not match supplied universe`);
    }
    const acceptedPath = resolve(options.acceptedDir, `${record.artifactStem}.json`);
    const recoveredPath = resolve(options.recoveredDir, `${record.artifactStem}.json`);
    const [{ text: acceptedText, value: rawAccepted }, { value: rawRecovered }] = await Promise.all([
      parseJson(acceptedPath),
      parseJson(recoveredPath),
    ]);
    const acceptedResultSha256 = sha256Text(acceptedText);
    if (acceptedResultSha256 !== record.acceptedJsonSha256) {
      throw new Error(`Immutable accepted JSON hash mismatch for manager ${record.index}`);
    }
    const historical = portfolioCensusResultSchema.parse(rawAccepted);
    const recoveredV1 = verifyRecoveredCensusInput(rawRecovered);
    if (record.acceptedResponseSha256 !== recoveredV1.recovery.responseSha256
      || record.recoveredInputSha256 !== recoveredV1.artifactSha256) {
      throw new Error(`Recovery provenance hash mismatch for manager ${record.index}`);
    }
    const acceptedResultPath = repositoryRelative(acceptedPath);
    const extended = extendRecoveredInputV2({
      recoveredV1,
      historicalResult: historical,
      artifactStem: record.artifactStem,
      acceptedResultPath,
      acceptedResultSha256,
    });
    artifacts.push(extended);
    entries.push({
      managerIndex: record.index,
      requestedManager: record.requestedManager,
      artifactPath: `${repositoryRelative(options.outputDir)}/${record.artifactStem}.json`,
      acceptedResultPath,
      acceptedResultSha256,
      acceptedResponseSha256: record.acceptedResponseSha256,
      recoveredInputV1Sha256: recoveredV1.artifactSha256,
      reconciliationInputV2Sha256: extended.artifactSha256,
      holdings: extended.holdings.length,
      excludedCandidates: extended.excludedCandidates.length,
      repoOnlyRecords: extended.repoOnlyRecords!.length,
    });
  }
  const cohort = validateRecoveredCensusCohort(artifacts, managers, { requireCompleteUniverse: true });
  const allRepoOnly = artifacts.flatMap((artifact) => artifact.repoOnlyRecords ?? []);
  const counts = sortedDispositionCounts(allRepoOnly);
  if (cohort.managerCount !== EXPECTED_TOTALS.managers
    || cohort.holdingCount !== EXPECTED_TOTALS.holdings
    || cohort.excludedCandidateCount !== EXPECTED_TOTALS.excludedCandidates
    || cohort.repoOnlyRecordCount !== EXPECTED_TOTALS.repoOnlyRecords
    || sha256Canonical(counts) !== sha256Canonical(EXPECTED_TOTALS.repoOnlyDispositionCounts)) {
    throw new Error("Superseding reconciliation inputs do not match the fixed accepted-census aggregate");
  }
  const manifest = finalizeManifest({
    schemaVersion: 1,
    artifactType: "PORTCO_CENSUS_RECONCILIATION_INPUT_MANIFEST",
    methodologyVersion: "PORTCO_RECONCILIATION_INPUT_V2",
    asOfDate: cohort.asOfDate,
    generatedAt: options.generatedAt,
    managerCount: cohort.managerCount,
    holdingCount: cohort.holdingCount,
    excludedCandidateCount: cohort.excludedCandidateCount,
    repoOnlyRecordCount: cohort.repoOnlyRecordCount,
    repoOnlyDispositionCounts: counts,
    acceptedResultSha256: entries.map((entry) => entry.acceptedResultSha256),
    recoveredInputV1Sha256: entries.map((entry) => entry.recoveredInputV1Sha256),
    artifacts: entries,
  });
  const outputDir = resolve(options.outputDir);
  if (await exists(outputDir)) throw new Error(`Refusing to overwrite ${outputDir}`);
  await mkdir(dirname(outputDir), { recursive: true });
  const staging = resolve(
    dirname(outputDir),
    `.${basename(outputDir)}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`,
  );
  try {
    await mkdir(staging, { mode: 0o700 });
    for (const artifact of artifacts) {
      const entry = entries.find((item) => item.managerIndex === artifact.managerIndex)!;
      await writeFile(
        resolve(staging, basename(entry.artifactPath)),
        `${JSON.stringify(artifact, null, 2)}\n`,
        { encoding: "utf8", flag: "wx", mode: 0o600 },
      );
    }
    await writeFile(
      resolve(staging, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      { encoding: "utf8", flag: "wx", mode: 0o600 },
    );
    await rename(staging, outputDir);
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
  return { manifest, artifacts };
}

function parseArguments(argv: readonly string[]): BuildInputOptions {
  const names = [
    "accepted-dir",
    "recovered-dir",
    "recovery-report",
    "manager-universe",
    "output-dir",
    "generated-at",
  ] as const;
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) throw new Error(`Unexpected argument ${argument}`);
    const equals = argument.indexOf("=");
    const name = argument.slice(2, equals < 0 ? undefined : equals);
    if (!names.includes(name as typeof names[number])) throw new Error(`Unknown option --${name}`);
    if (values.has(name)) throw new Error(`Option --${name} may be supplied only once`);
    const value = equals < 0 ? argv[++index] : argument.slice(equals + 1);
    if (!value || value.startsWith("--")) throw new Error(`Option --${name} requires a value`);
    values.set(name, value);
  }
  for (const name of names) if (!values.has(name)) throw new Error(`--${name} is required`);
  return {
    acceptedDir: values.get("accepted-dir")!,
    recoveredDir: values.get("recovered-dir")!,
    recoveryReport: values.get("recovery-report")!,
    managerUniverse: values.get("manager-universe")!,
    outputDir: values.get("output-dir")!,
    generatedAt: values.get("generated-at")!,
  };
}

async function main(): Promise<void> {
  try {
    const result = await buildReconciliationInputs(parseArguments(process.argv.slice(2)));
    console.log(
      `Reconciliation inputs: ${result.manifest.managerCount} managers, `
      + `${result.manifest.repoOnlyRecordCount} repo-only judgments, `
      + `${result.manifest.excludedCandidateCount} exclusions`,
    );
    console.log(`Manifest SHA-256: ${result.manifest.manifestSha256}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) void main();
