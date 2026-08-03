import { randomBytes } from "node:crypto";
import {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  verifyDatasetSnapshot,
  verifyRecoveredCensusInput,
} from "./artifacts";
import { buildTwoSidedLedger, type BuiltLedgerArtifacts } from "./ledger-builder";
import { renderCanonicalLedgerMarkdown } from "./markdown";
import type { ProductionSnapshot, RecoveredCensusInput, SeedSnapshot } from "./schema";

export interface LedgerCliOptions {
  censusDir: string;
  productionSnapshot: string;
  seedSnapshot: string;
  managerUniverse: string;
  outputDir: string;
  runId: string;
  generatedAt: string;
}

const VALUE_OPTIONS = new Set([
  "census-dir",
  "production-snapshot",
  "seed-snapshot",
  "manager-universe",
  "output-dir",
  "run-id",
  "generated-at",
]);

export function parseLedgerCliArguments(argv: readonly string[]): LedgerCliOptions {
  const parsed = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) throw new Error(`Unexpected positional argument ${JSON.stringify(argument)}`);
    const equals = argument.indexOf("=");
    const name = argument.slice(2, equals < 0 ? undefined : equals);
    if (!VALUE_OPTIONS.has(name)) throw new Error(`Unknown option --${name}`);
    if (parsed.has(name)) throw new Error(`Option --${name} may be supplied only once`);
    const value = equals < 0 ? argv[++index] : argument.slice(equals + 1);
    if (!value || value.startsWith("--")) throw new Error(`Option --${name} requires a value`);
    parsed.set(name, value);
  }
  for (const name of VALUE_OPTIONS) {
    if (!parsed.has(name)) throw new Error(`--${name} is required`);
  }
  const generatedAt = parsed.get("generated-at")!;
  const timestamp = new Date(generatedAt);
  if (Number.isNaN(timestamp.valueOf()) || timestamp.toISOString() !== generatedAt) {
    throw new Error("--generated-at must be a canonical UTC ISO timestamp");
  }
  const runId = parsed.get("run-id")!;
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/.test(runId)) {
    throw new Error("--run-id must contain only letters, numbers, dot, underscore, or hyphen");
  }
  return {
    censusDir: parsed.get("census-dir")!,
    productionSnapshot: parsed.get("production-snapshot")!,
    seedSnapshot: parsed.get("seed-snapshot")!,
    managerUniverse: parsed.get("manager-universe")!,
    outputDir: parsed.get("output-dir")!,
    runId,
    generatedAt,
  };
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function jsonFile(path: string): Promise<unknown> {
  const text = await readFile(path, "utf8");
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Invalid JSON in ${resolve(path)}`);
  }
}

async function recursiveJsonFiles(directory: string): Promise<string[]> {
  const resolved = resolve(directory);
  const entries = await readdir(resolved, { withFileTypes: true });
  const paths = await Promise.all(entries.map(async (entry) => {
    const path = resolve(resolved, entry.name);
    if (entry.isDirectory()) return recursiveJsonFiles(path);
    return entry.isFile() && entry.name.endsWith(".json") ? [path] : [];
  }));
  return paths.flat().sort((left, right) => left.localeCompare(right, "en"));
}

export async function loadRecoveredCensusDirectory(directory: string): Promise<RecoveredCensusInput[]> {
  const artifacts: RecoveredCensusInput[] = [];
  for (const path of await recursiveJsonFiles(directory)) {
    const value = await jsonFile(path);
    if (!value || typeof value !== "object"
      || (value as Record<string, unknown>).artifactType !== "PORTCO_CENSUS_RECOVERED_INPUT") {
      continue;
    }
    try {
      artifacts.push(verifyRecoveredCensusInput(value));
    } catch (error) {
      throw new Error(`Invalid recovered census artifact ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (artifacts.length === 0) {
    throw new Error(`No recovered census artifacts found beneath ${resolve(directory)}`);
  }
  return artifacts.sort((left, right) => left.managerIndex - right.managerIndex);
}

function parseManagerUniverse(value: unknown): string[] {
  if (!Array.isArray(value)
    || value.some((manager) => typeof manager !== "string" || manager.trim().length === 0)) {
    throw new Error("Manager universe must be a JSON array of non-empty strings");
  }
  const managers = value.map((manager) => (manager as string).trim());
  if (managers.length !== 100 || new Set(managers).size !== 100) {
    throw new Error("Manager universe must contain exactly 100 unique managers");
  }
  return managers;
}

function serialize(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function writeLedgerRunAtomically(input: {
  outputDir: string;
  artifacts: BuiltLedgerArtifacts & { proposalQueueMarkdown: string };
}): Promise<void> {
  const outputDir = resolve(input.outputDir);
  if (await pathExists(outputDir)) {
    throw new Error(`Refusing to overwrite existing ledger run directory ${outputDir}`);
  }
  const parent = dirname(outputDir);
  await mkdir(parent, { recursive: true });
  const staging = resolve(parent, `.${basename(outputDir)}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`);
  try {
    await mkdir(staging, { mode: 0o700 });
    const files: Array<[string, string]> = [
      ["ledger.json", serialize(input.artifacts.ledger)],
      ["ledger.md", renderCanonicalLedgerMarkdown(input.artifacts.ledger)],
      ["manifest.json", serialize(input.artifacts.manifest)],
      ["proposal-index.json", serialize(input.artifacts.proposalQueue)],
      ["proposal-index.md", input.artifacts.proposalQueueMarkdown],
    ];
    for (const [name, contents] of files) {
      await writeFile(resolve(staging, name), contents, { encoding: "utf8", flag: "wx", mode: 0o600 });
    }
    await rename(staging, outputDir);
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
}

export async function executeLedgerCli(argv: readonly string[]): Promise<BuiltLedgerArtifacts> {
  const options = parseLedgerCliArguments(argv);
  const [recoveredInputs, rawProduction, rawSeed, rawManagers] = await Promise.all([
    loadRecoveredCensusDirectory(options.censusDir),
    jsonFile(options.productionSnapshot),
    jsonFile(options.seedSnapshot),
    jsonFile(options.managerUniverse),
  ]);
  const production = verifyDatasetSnapshot(rawProduction);
  if (production.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") {
    throw new Error("--production-snapshot is not a production snapshot artifact");
  }
  const seed = verifyDatasetSnapshot(rawSeed);
  if (seed.artifactType !== "PORTCO_SEED_SNAPSHOT") {
    throw new Error("--seed-snapshot is not an evaluated seed snapshot artifact");
  }
  const built = buildTwoSidedLedger({
    runId: options.runId,
    generatedAt: options.generatedAt,
    managerUniverse: parseManagerUniverse(rawManagers),
    recoveredInputs,
    productionSnapshot: production as ProductionSnapshot,
    seedSnapshot: seed as SeedSnapshot,
  });
  await writeLedgerRunAtomically({ outputDir: options.outputDir, artifacts: built });
  return built;
}

async function main(): Promise<void> {
  try {
    const result = await executeLedgerCli(process.argv.slice(2));
    console.log(`Canonical ledger: ${result.ledger.summary.canonicalCompanies} companies, ${result.ledger.ledgerSha256}`);
    console.log(`Review queue: ${result.proposalQueue.summary.total} individually reviewable item(s)`);
  } catch (error) {
    console.error(`Ledger build failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) void main();
