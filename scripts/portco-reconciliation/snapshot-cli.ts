import "dotenv/config";
import { randomBytes } from "node:crypto";
import {
  mkdir,
  link,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PortCo } from "../../prisma/seed-data/portco-types";
import {
  buildProductionSnapshot,
  buildSeedSnapshot,
  currentGitCommit,
  databaseTargetIdentity,
  readProductionSnapshot,
  redactDatabaseError,
  type ApprovedSeedAfterImageMetadata,
  type ProductionSnapshotClient,
} from "./snapshot";
import type { ProductionSnapshot, SeedSnapshot } from "./schema";

export type SnapshotCommand = "production" | "seed" | "both";

export interface SnapshotCliOptions {
  command: SnapshotCommand;
  asOfDate: string;
  output: string | null;
  runDir: string | null;
  databaseUrlEnvironment: string;
  databaseTargetLabel: string | null;
  expectedHost: string | null;
  expectedDatabase: string | null;
  legacySchema: boolean;
}

type ParsedOptions = Record<string, string>;

const VALUE_OPTIONS = new Set([
  "as-of",
  "output",
  "run-dir",
  "database-url-env",
  "database-target-label",
  "expected-host",
  "expected-database",
]);

const FLAG_OPTIONS = new Set(["legacy-schema"]);

function validCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseValueOptions(argv: readonly string[]): ParsedOptions {
  const parsed: ParsedOptions = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) throw new Error(`Unexpected positional argument ${JSON.stringify(argument)}`);
    const equals = argument.indexOf("=");
    const name = argument.slice(2, equals === -1 ? undefined : equals);
    if (FLAG_OPTIONS.has(name)) {
      if (equals !== -1) throw new Error(`Flag --${name} does not accept a value`);
      if (Object.hasOwn(parsed, name)) throw new Error(`Flag --${name} may be supplied only once`);
      parsed[name] = "true";
      continue;
    }
    if (!VALUE_OPTIONS.has(name)) throw new Error(`Unknown option --${name}`);
    if (Object.hasOwn(parsed, name)) throw new Error(`Option --${name} may be supplied only once`);
    const value = equals === -1 ? argv[++index] : argument.slice(equals + 1);
    if (!value || value.startsWith("--")) throw new Error(`Option --${name} requires a value`);
    parsed[name] = value;
  }
  return parsed;
}

export function parseSnapshotCliArguments(
  argv: readonly string[],
  environment: NodeJS.ProcessEnv = process.env,
): SnapshotCliOptions {
  const [command, ...optionArguments] = argv;
  if (command !== "production" && command !== "seed" && command !== "both") {
    throw new Error("Choose one snapshot command: production, seed, or both");
  }
  const options = parseValueOptions(optionArguments);
  const asOfDate = options["as-of"];
  if (!asOfDate || !validCalendarDate(asOfDate)) {
    throw new Error("--as-of is required and must be a real YYYY-MM-DD calendar date");
  }

  const output = options.output ?? null;
  const runDir = options["run-dir"] ?? null;
  if (command === "both") {
    if (!runDir || output) throw new Error("The both command requires --run-dir and does not accept --output");
  } else if (!output || runDir) {
    throw new Error(`${command} requires --output and does not accept --run-dir`);
  }

  const databaseUrlEnvironment = options["database-url-env"] ?? "DATABASE_URL";
  if (!/^[A-Z][A-Z0-9_]*$/.test(databaseUrlEnvironment)) {
    throw new Error("--database-url-env must be an uppercase environment variable name");
  }

  const usesDatabase = command === "production" || command === "both";
  const legacySchema = options["legacy-schema"] === "true";
  const databaseTargetLabel = options["database-target-label"] ?? null;
  const expectedHost = options["expected-host"] ?? environment.SNAPSHOT_EXPECTED_DATABASE_HOST ?? null;
  const expectedDatabase = options["expected-database"] ?? environment.SNAPSHOT_EXPECTED_DATABASE_NAME ?? null;
  if (usesDatabase && (!databaseTargetLabel || !expectedHost || !expectedDatabase)) {
    throw new Error(
      "Production snapshots require --database-target-label and explicit expected host/database values",
    );
  }
  if (!usesDatabase && (
    databaseTargetLabel !== null
    || options["expected-host"] !== undefined
    || options["expected-database"] !== undefined
    || options["database-url-env"] !== undefined
    || legacySchema
  )) {
    throw new Error("Seed snapshots do not accept database target options");
  }

  return {
    command,
    asOfDate,
    output,
    runDir,
    databaseUrlEnvironment,
    databaseTargetLabel,
    expectedHost,
    expectedDatabase,
    legacySchema,
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

function serializedArtifact(value: ProductionSnapshot | SeedSnapshot): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function writeArtifactAtomically(
  outputPath: string,
  artifact: ProductionSnapshot | SeedSnapshot,
): Promise<void> {
  const resolvedOutput = resolve(outputPath);
  if (await pathExists(resolvedOutput)) {
    throw new Error(`Refusing to overwrite existing snapshot artifact ${resolvedOutput}`);
  }
  await mkdir(dirname(resolvedOutput), { recursive: true });
  const temporary = `${resolvedOutput}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;
  try {
    await writeFile(temporary, serializedArtifact(artifact), { encoding: "utf8", flag: "wx", mode: 0o600 });
    await link(temporary, resolvedOutput);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
  // The hard link publishes a fully-written inode with EEXIST protection.
  // A failed best-effort removal only leaves an unreferenced staging name; it
  // does not invalidate the already-complete destination artifact.
  await rm(temporary, { force: true }).catch(() => undefined);
}

export async function writeSnapshotRunAtomically(input: {
  runDir: string;
  production: ProductionSnapshot;
  seed: SeedSnapshot;
}): Promise<void> {
  const resolvedRunDir = resolve(input.runDir);
  if (await pathExists(resolvedRunDir)) {
    throw new Error(`Refusing to overwrite existing snapshot run directory ${resolvedRunDir}`);
  }
  const parent = dirname(resolvedRunDir);
  await mkdir(parent, { recursive: true });
  const staging = resolve(
    parent,
    `.${basename(resolvedRunDir)}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`,
  );
  try {
    await mkdir(staging, { mode: 0o700 });
    await writeFile(
      resolve(staging, "production-snapshot.json"),
      serializedArtifact(input.production),
      { encoding: "utf8", flag: "wx", mode: 0o600 },
    );
    await writeFile(
      resolve(staging, "seed-snapshot.json"),
      serializedArtifact(input.seed),
      { encoding: "utf8", flag: "wx", mode: 0o600 },
    );
    await rename(staging, resolvedRunDir);
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
}

function parseApprovedAfterImages(value: unknown): ApprovedSeedAfterImageMetadata[] {
  if (!Array.isArray(value)) throw new Error("Approved PortCo after-image file must contain an array");
  return value.map((entry, index) => {
    if (!entry || typeof entry !== "object") throw new Error(`Approved after-image ${index} is not an object`);
    const record = entry as Record<string, unknown>;
    const company = record.company;
    const retired = record.retiredCompanies;
    if (!company || typeof company !== "object" || !Array.isArray(retired)) {
      throw new Error(`Approved after-image ${index} is missing company or retiredCompanies`);
    }
    const canonical = company as Record<string, unknown>;
    if (typeof canonical.name !== "string" || typeof canonical.country !== "string") {
      throw new Error(`Approved after-image ${index} has an invalid canonical company identity`);
    }
    const retiredCompanies = retired.map((item, retiredIndex) => {
      if (!item || typeof item !== "object") {
        throw new Error(`Approved after-image ${index} retired company ${retiredIndex} is invalid`);
      }
      const retiredCompany = item as Record<string, unknown>;
      if (typeof retiredCompany.name !== "string" || typeof retiredCompany.country !== "string") {
        throw new Error(`Approved after-image ${index} retired company ${retiredIndex} is invalid`);
      }
      return { name: retiredCompany.name, country: retiredCompany.country };
    });
    return {
      company: { name: canonical.name, country: canonical.country },
      retiredCompanies,
    };
  });
}

async function createProductionSnapshot(input: {
  options: SnapshotCliOptions;
  capturedAt: string;
  connectionString: string;
}): Promise<ProductionSnapshot> {
  const target = databaseTargetIdentity({
    connectionString: input.connectionString,
    expectedHost: input.options.expectedHost!,
    expectedDatabase: input.options.expectedDatabase!,
    label: input.options.databaseTargetLabel!,
  });
  const generatedClientModule = "../../src/generated/prisma/client";
  const { PrismaClient } = await import(generatedClientModule) as {
    PrismaClient: new (options: unknown) => {
      $disconnect(): Promise<void>;
    };
  };
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: input.connectionString }),
  });
  try {
    const read = await readProductionSnapshot(
      client as unknown as ProductionSnapshotClient,
      { allowLegacySchema: input.options.legacySchema },
    );
    return buildProductionSnapshot({
      asOfDate: input.options.asOfDate,
      capturedAt: input.capturedAt,
      target,
      read,
    });
  } finally {
    await client.$disconnect();
  }
}

async function createSeedSnapshot(input: {
  options: SnapshotCliOptions;
  capturedAt: string;
  repoRoot: string;
}): Promise<SeedSnapshot> {
  const seedCompaniesModule = "../../prisma/seed-data/companies";
  const [{ companies }, afterImageText, baseCommit] = await Promise.all([
    import(seedCompaniesModule) as Promise<{ companies: PortCo[] }>,
    readFile(resolve(input.repoRoot, "prisma/seed-data/approved-portco-after-images.json"), "utf8"),
    currentGitCommit(input.repoRoot),
  ]);
  let rawAfterImages: unknown;
  try {
    rawAfterImages = JSON.parse(afterImageText);
  } catch {
    throw new Error("Approved PortCo after-image file is not valid JSON");
  }
  return buildSeedSnapshot({
    asOfDate: input.options.asOfDate,
    capturedAt: input.capturedAt,
    baseCommit,
    companies,
    approvedAfterImages: parseApprovedAfterImages(rawAfterImages),
  });
}

export async function executeSnapshotCli(
  argv: readonly string[],
  environment: NodeJS.ProcessEnv = process.env,
): Promise<{ production?: ProductionSnapshot; seed?: SeedSnapshot }> {
  const options = parseSnapshotCliArguments(argv, environment);
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const capturedAt = new Date().toISOString();
  const connectionString = options.command === "seed"
    ? null
    : environment[options.databaseUrlEnvironment]?.trim() || null;
  if (options.command !== "seed" && !connectionString) {
    throw new Error(`Database connection environment ${options.databaseUrlEnvironment} is not set`);
  }

  const production = options.command === "seed"
    ? undefined
    : await createProductionSnapshot({ options, capturedAt, connectionString: connectionString! });
  const seed = options.command === "production"
    ? undefined
    : await createSeedSnapshot({ options, capturedAt, repoRoot });

  if (options.command === "both") {
    await writeSnapshotRunAtomically({ runDir: options.runDir!, production: production!, seed: seed! });
  } else if (production) {
    await writeArtifactAtomically(options.output!, production);
  } else if (seed) {
    await writeArtifactAtomically(options.output!, seed);
  } else {
    throw new Error("Snapshot command did not produce an artifact");
  }
  return { production, seed };
}

async function main(): Promise<void> {
  let connectionString = "";
  try {
    const options = parseSnapshotCliArguments(process.argv.slice(2));
    connectionString = options.command === "seed"
      ? ""
      : process.env[options.databaseUrlEnvironment]?.trim() ?? "";
    const result = await executeSnapshotCli(process.argv.slice(2));
    if (result.production) {
      console.log(
        `Production snapshot: ${result.production.companies.length} companies, ${result.production.snapshotSha256}`,
      );
    }
    if (result.seed) {
      console.log(`Seed snapshot: ${result.seed.companies.length} companies, ${result.seed.snapshotSha256}`);
    }
  } catch (error) {
    console.error(`Snapshot failed: ${redactDatabaseError(error, connectionString)}`);
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  void main();
}
