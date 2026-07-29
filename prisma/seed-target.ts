export const SEED_CONFIRMATION = "SEED-NON-PRODUCTION";

const CURRENT_PRODUCTION_NEON_ENDPOINTS = new Set([
  "ep-soft-feather-am7a9o9j",
]);

const SYSTEM_DATABASES = new Set(["postgres", "template0", "template1"]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
const CONNECTION_OVERRIDE_PARAMETERS = new Set([
  "connectionstring",
  "database",
  "dbname",
  "host",
  "hostaddr",
  "password",
  "port",
  "service",
  "user",
  "username",
]);

export type SeedMode = "apply" | "dry-run";
export type SeedTarget = "local" | "neon-validation";
export type SeedEnvironment = Record<string, string | undefined>;

export interface ApprovedSeedTarget {
  connectionString: string;
  database: string;
  host: string;
  target: SeedTarget;
}

export interface SeedValidationSummary {
  errors: readonly unknown[];
}

interface SeedRuntime {
  run(): Promise<void>;
  disconnect(): Promise<void>;
}

export interface ExecuteSeedCommandOptions<
  TReport extends SeedValidationSummary,
> {
  argv: readonly string[];
  environment?: SeedEnvironment;
  loadValidation(): Promise<TReport>;
  loadRuntime(connectionString: string): Promise<SeedRuntime>;
}

export interface ExecuteSeedCommandResult<
  TReport extends SeedValidationSummary,
> {
  mode: SeedMode;
  report: TReport;
  target?: Omit<ApprovedSeedTarget, "connectionString">;
}

function cleanHost(value: string | undefined): string {
  return value?.trim().toLowerCase().replace(/\.$/, "") ?? "";
}

function neonEndpointIdentity(host: string): string | null {
  const normalizedHost = cleanHost(host);
  if (!normalizedHost.endsWith(".neon.tech")) return null;

  const endpoint = normalizedHost.split(".")[0].replace(/-pooler$/, "");
  return /^ep-[a-z0-9-]+$/.test(endpoint) ? endpoint : null;
}

function isNeonHost(host: string): boolean {
  const normalizedHost = cleanHost(host);
  return (
    neonEndpointIdentity(normalizedHost) !== null &&
    /^ep-[a-z0-9-]+(?:-pooler)?(?:\.[a-z0-9-]+)+\.neon\.tech$/.test(
      normalizedHost,
    )
  );
}

function parsePostgresUrl(connectionString: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL is not a valid URL.");
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("DATABASE_URL must use the postgres protocol.");
  }

  for (const [parameter] of parsed.searchParams) {
    if (CONNECTION_OVERRIDE_PARAMETERS.has(parameter.toLowerCase())) {
      throw new Error(
        `DATABASE_URL query parameter ${JSON.stringify(parameter)} may override the approved connection target.`,
      );
    }
  }

  return parsed;
}

function parseForbiddenHosts(environment: SeedEnvironment): string[] {
  const hosts = [
    environment.FORBIDDEN_DATABASE_HOST,
    environment.FORBIDDEN_DATABASE_HOST_2,
  ]
    .map(cleanHost)
    .filter(Boolean);

  if (hosts.length === 0) {
    throw new Error(
      "At least one production FORBIDDEN_DATABASE_HOST is required.",
    );
  }

  for (const host of hosts) {
    if (
      host.includes("/") ||
      host.includes(":") ||
      host.includes("@") ||
      host.includes("?")
    ) {
      throw new Error(
        "FORBIDDEN_DATABASE_HOST values must be hostnames, not URLs.",
      );
    }
  }

  return hosts;
}

export function parseSeedMode(argv: readonly string[]): SeedMode {
  if (argv.length !== 1 || !["--apply", "--dry-run"].includes(argv[0])) {
    throw new Error(
      "Choose exactly one seed mode: --dry-run or --apply.",
    );
  }

  return argv[0] === "--apply" ? "apply" : "dry-run";
}

export function assertNonProductionSeedTarget(
  environment: SeedEnvironment = process.env,
): ApprovedSeedTarget {
  if (
    environment.NODE_ENV?.trim().toLowerCase() === "production" ||
    environment.VERCEL_ENV?.trim().toLowerCase() === "production"
  ) {
    throw new Error(
      "Database seeding is disabled in a production runtime environment.",
    );
  }

  if (environment.SEED_CONFIRM !== SEED_CONFIRMATION) {
    throw new Error(
      `SEED_CONFIRM must exactly equal ${SEED_CONFIRMATION}.`,
    );
  }

  const target = environment.SEED_TARGET?.trim();
  if (target !== "local" && target !== "neon-validation") {
    throw new Error(
      "SEED_TARGET must be either local or neon-validation; production is never accepted.",
    );
  }

  const connectionString = environment.DATABASE_URL?.trim();
  const expectedHost = cleanHost(environment.EXPECTED_DATABASE_HOST);
  const expectedDatabase = environment.EXPECTED_DATABASE_NAME?.trim() ?? "";
  if (!connectionString || !expectedHost || !expectedDatabase) {
    throw new Error(
      "DATABASE_URL, EXPECTED_DATABASE_HOST, and EXPECTED_DATABASE_NAME are required.",
    );
  }

  const parsed = parsePostgresUrl(connectionString);
  const host = cleanHost(parsed.hostname);
  if (parsed.pathname.startsWith("//")) {
    throw new Error(
      "DATABASE_URL must contain exactly one path separator before the database name.",
    );
  }
  const databasePath = parsed.pathname.slice(1);
  if (/%(?:00|2f|5c)/i.test(databasePath)) {
    throw new Error(
      "DATABASE_URL database name may not contain encoded NUL or path separators.",
    );
  }
  let database: string;
  try {
    // Match node-postgres/pg-connection-string target parsing exactly.
    database = decodeURI(databasePath);
  } catch {
    throw new Error(
      "DATABASE_URL database name contains invalid percent encoding.",
    );
  }
  if (/[\u0000-\u001f\u007f]/.test(database)) {
    throw new Error(
      "DATABASE_URL database name may not contain control characters.",
    );
  }
  if (host !== expectedHost || database !== expectedDatabase) {
    throw new Error(
      "The database URL does not match the explicitly approved host and database.",
    );
  }

  if (!database || SYSTEM_DATABASES.has(database.toLowerCase())) {
    throw new Error("Refusing to seed an empty or system database.");
  }

  if (target === "local" && !LOCAL_HOSTS.has(host)) {
    throw new Error("A local seed target must use a loopback hostname.");
  }
  if (target === "neon-validation" && !isNeonHost(host)) {
    throw new Error(
      "A neon-validation seed target must be a valid Neon endpoint hostname.",
    );
  }

  const forbiddenHosts = parseForbiddenHosts(environment);
  const targetIdentity = neonEndpointIdentity(host);
  for (const forbiddenHost of forbiddenHosts) {
    if (host === forbiddenHost) {
      throw new Error("The selected database host is explicitly forbidden.");
    }

    const forbiddenIdentity = neonEndpointIdentity(forbiddenHost);
    if (
      targetIdentity &&
      forbiddenIdentity &&
      targetIdentity === forbiddenIdentity
    ) {
      throw new Error(
        "The selected Neon endpoint is an alias of a forbidden production endpoint.",
      );
    }
  }

  if (
    targetIdentity &&
    CURRENT_PRODUCTION_NEON_ENDPOINTS.has(targetIdentity)
  ) {
    throw new Error(
      "The selected Neon endpoint is the known production endpoint.",
    );
  }

  return {
    connectionString,
    database,
    host,
    target,
  };
}

export async function executeSeedCommand<
  TReport extends SeedValidationSummary,
>(
  options: ExecuteSeedCommandOptions<TReport>,
): Promise<ExecuteSeedCommandResult<TReport>> {
  const mode = parseSeedMode(options.argv);
  const approvedTarget =
    mode === "apply"
      ? assertNonProductionSeedTarget(options.environment)
      : undefined;

  const report = await options.loadValidation();
  if (report.errors.length > 0) {
    throw new Error(
      `Seed data validation failed with ${report.errors.length} error(s).`,
    );
  }

  if (mode === "dry-run") {
    return { mode, report };
  }

  const runtime = await options.loadRuntime(
    approvedTarget!.connectionString,
  );
  try {
    await runtime.run();
  } finally {
    await runtime.disconnect();
  }

  return {
    mode,
    report,
    target: {
      database: approvedTarget!.database,
      host: approvedTarget!.host,
      target: approvedTarget!.target,
    },
  };
}
