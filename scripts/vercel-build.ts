import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { hasSafeDatabaseConnectionQuery } from "../src/lib/database-connection-query.ts";

export type BuildEnvironment = Record<string, string | undefined>;

export type BuildCommand = {
  label: string;
  failureCode: string;
  file: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  shell: false;
};

export type BuildCommandRunner = (command: BuildCommand) => void;

export type VercelBuildPlan = {
  target: "preview" | "non-preview";
  migrations: "enabled" | "skipped";
  commands: BuildCommand[];
};

export const LONG_LIVED_DATABASE_HOST_VARIABLES = [
  "PRODUCTION_DATABASE_HOST",
  "PRODUCTION_MIGRATION_DATABASE_HOST",
  "MIGRATION_DATABASE_HOST",
  "DASHBOARD_MIGRATION_DATABASE_HOST",
] as const;

export const FORBIDDEN_PREVIEW_DATABASE_URL_VARIABLES = [
  "MIGRATION_DATABASE_URL",
  "PRODUCTION_MIGRATION_DATABASE_URL",
  "DASHBOARD_MIGRATION_DATABASE_URL",
  "E2E_DATABASE_URL",
  "PRODUCTION_DATABASE_URL",
  "VALIDATION_DATABASE_URL",
] as const;

export class VercelBuildGuardError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.name = "VercelBuildGuardError";
    this.code = code;
  }
}

function fail(code: string): never {
  throw new VercelBuildGuardError(code);
}

function required(environment: BuildEnvironment, name: string): string {
  const value = environment[name]?.trim();
  if (!value) fail(`${name.toLowerCase()}_required`);
  return value;
}

function requireExact(
  environment: BuildEnvironment,
  actualName: string,
  expectedName: string,
  failureCode: string,
): string {
  const actual = required(environment, actualName);
  const expected = required(environment, expectedName);
  if (actual !== expected) fail(failureCode);
  return actual;
}

function parsePostgresUrl(value: string, failureCode: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    fail(failureCode);
  }
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    fail(failureCode);
  }
  if (!parsed.hostname || !databaseName(parsed)) fail(failureCode);
  return parsed;
}

function databaseName(parsed: URL): string {
  try {
    const encoded = parsed.pathname.replace(/^\/+/, "");
    if (!encoded || encoded.includes("/")) fail("database_name_invalid");
    return decodeURIComponent(encoded);
  } catch {
    fail("database_name_invalid");
  }
}

function decodedCredential(
  value: string,
  failureCode: string,
): string {
  try {
    const decoded = decodeURIComponent(value);
    if (!decoded) fail(failureCode);
    return decoded;
  } catch {
    fail(failureCode);
  }
}

function normalizeHost(value: string, failureCode: string): string {
  const host = value.trim().toLowerCase().replace(/\.$/, "");
  if (
    !host
    || host.includes("/")
    || host.includes(":")
    || host.includes("@")
    || host.includes("?")
    || host.includes("#")
    || !/^[a-z0-9.-]+$/.test(host)
  ) {
    fail(failureCode);
  }
  return host;
}

function neonEndpointIdentity(host: string): string {
  const [label, ...suffix] = host.split(".");
  return [label.replace(/-pooler$/, ""), ...suffix].join(".");
}

function requireNeonDirectHost(host: string, failureCode: string): void {
  if (
    !/^ep-[a-z0-9-]+\.[a-z0-9.-]+\.neon\.tech$/.test(host)
    || host.split(".", 1)[0].endsWith("-pooler")
  ) {
    fail(failureCode);
  }
}

function requireNeonPooledPair(
  pooledHost: string,
  directHost: string,
  failureCode: string,
): void {
  const [directLabel, ...suffix] = directHost.split(".");
  const expectedPooledHost = [`${directLabel}-pooler`, ...suffix].join(".");
  if (pooledHost !== expectedPooledHost) fail(failureCode);
}

type ParsedDatabaseConnection = {
  host: string;
  database: string;
  username: string;
  password: string;
  port: string;
};

function parseDatabaseConnection(
  value: string,
  failureCode: string,
): ParsedDatabaseConnection {
  const parsed = parsePostgresUrl(value, failureCode);
  if (parsed.hash) fail(failureCode);
  if (!hasSafeDatabaseConnectionQuery(parsed, { requireSslMode: true })) {
    fail(failureCode);
  }
  return {
    host: normalizeHost(parsed.hostname, failureCode),
    database: databaseName(parsed),
    username: decodedCredential(parsed.username, failureCode),
    password: decodedCredential(parsed.password, failureCode),
    port: parsed.port || "5432",
  };
}

function sameConnectionIdentity(
  actual: ParsedDatabaseConnection,
  expected: ParsedDatabaseConnection,
): boolean {
  return actual.host === expected.host
    && actual.database === expected.database
    && actual.username === expected.username
    && actual.password === expected.password
    && actual.port === expected.port;
}

function isOptionalConnectionAlias(name: string): boolean {
  return name === "DATABASE_POSTGRES_URL"
    || name === "POSTGRES_URL"
    || name === "PRISMA_URL"
    || name.endsWith("_PRISMA_URL")
    || (name.includes("_URL") && name.endsWith("_NON_POOLING"));
}

function assertNoForbiddenPreviewDatabaseUrls(
  environment: BuildEnvironment,
): void {
  const forbiddenNames = new Set<string>(
    FORBIDDEN_PREVIEW_DATABASE_URL_VARIABLES,
  );
  for (const [name, value] of Object.entries(environment)) {
    if (
      value !== undefined
      && (forbiddenNames.has(name) || name.endsWith("_URL_NO_SSL"))
    ) {
      fail("forbidden_preview_database_url_present");
    }
  }
}

function classifyVercelTarget(
  environment: BuildEnvironment,
): "preview" | "non-preview" {
  if (required(environment, "VERCEL") !== "1") fail("vercel_runtime_invalid");
  if (required(environment, "CI") !== "1") fail("ci_runtime_invalid");

  const environmentName = required(environment, "VERCEL_ENV");
  const targetEnvironmentName = required(environment, "VERCEL_TARGET_ENV");
  const claimsPreview = environmentName === "preview" || targetEnvironmentName === "preview";
  if (claimsPreview) {
    if (environmentName !== "preview" || targetEnvironmentName !== "preview") {
      fail("vercel_preview_environment_mismatch");
    }
    return "preview";
  }

  if (
    environmentName !== targetEnvironmentName
    || (environmentName !== "production" && environmentName !== "development")
  ) {
    fail("vercel_non_preview_environment_invalid");
  }
  return "non-preview";
}

function previewMigrationsEnabled(
  environment: BuildEnvironment,
  target: "preview" | "non-preview",
): boolean {
  const value = environment.PREVIEW_DATABASE_MIGRATIONS_ENABLED ?? "";
  if (target === "preview") {
    if (value === "true") return true;
    if (value === "" || value === "false") return false;
    fail("preview_database_migrations_opt_in_invalid");
  }
  if (value !== "" && value !== "false") {
    fail("preview_database_migrations_forbidden_outside_preview");
  }
  return false;
}

function assertPreviewVercelMetadata(environment: BuildEnvironment): void {
  const projectId = requireExact(
    environment,
    "VERCEL_PROJECT_ID",
    "EXPECTED_VERCEL_PROJECT_ID",
    "vercel_project_id_mismatch",
  );
  if (!/^prj_[A-Za-z0-9]+$/.test(projectId)) fail("vercel_project_id_invalid");

  if (required(environment, "VERCEL_GIT_PROVIDER") !== "github") {
    fail("vercel_git_provider_invalid");
  }
  if (required(environment, "VERCEL_GIT_REPO_OWNER") !== "mikeberry6") {
    fail("vercel_git_repository_owner_invalid");
  }
  if (required(environment, "VERCEL_GIT_REPO_SLUG") !== "Infra-MA2") {
    fail("vercel_git_repository_slug_invalid");
  }
  const repositoryId = requireExact(
    environment,
    "VERCEL_GIT_REPO_ID",
    "EXPECTED_GITHUB_REPOSITORY_ID",
    "vercel_git_repository_id_mismatch",
  );
  if (!/^[1-9][0-9]*$/.test(repositoryId)) {
    fail("vercel_git_repository_id_invalid");
  }

  const deploymentId = required(environment, "VERCEL_DEPLOYMENT_ID");
  if (!/^dpl_[A-Za-z0-9]+$/.test(deploymentId)) {
    fail("vercel_deployment_id_invalid");
  }
  const gitRef = required(environment, "VERCEL_GIT_COMMIT_REF");
  if (
    gitRef === "main"
    || gitRef === "refs/heads/main"
    || gitRef.length > 200
    || !/^[A-Za-z0-9](?:[A-Za-z0-9._/-]*[A-Za-z0-9])?$/.test(gitRef)
    || gitRef.includes("..")
    || gitRef.includes("//")
    || gitRef.endsWith(".lock")
  ) {
    fail("vercel_preview_git_ref_invalid");
  }
  if (!/^[0-9a-f]{40}$/.test(required(environment, "VERCEL_GIT_COMMIT_SHA"))) {
    fail("vercel_git_commit_sha_invalid");
  }
  const pullRequestId = environment.VERCEL_GIT_PULL_REQUEST_ID?.trim() ?? "";
  if (pullRequestId && !/^[1-9][0-9]*$/.test(pullRequestId)) {
    fail("vercel_pull_request_id_invalid");
  }
}

type PreviewDatabaseTarget = {
  directUrl: string;
  directHost: string;
  database: string;
  forbiddenHosts: string[];
};

function assertPreviewNeonMetadata(
  environment: BuildEnvironment,
): PreviewDatabaseTarget {
  assertNoForbiddenPreviewDatabaseUrls(environment);
  const directUrl = required(environment, "DATABASE_URL_UNPOOLED");
  const direct = parseDatabaseConnection(
    directUrl,
    "database_url_unpooled_invalid",
  );
  const runtime = parseDatabaseConnection(
    required(environment, "DATABASE_URL"),
    "database_url_invalid",
  );
  const directHost = direct.host;
  const runtimeHost = runtime.host;
  requireNeonDirectHost(directHost, "database_url_unpooled_host_not_neon_direct");
  requireNeonPooledPair(runtimeHost, directHost, "database_url_host_not_pooled_pair");
  if (
    direct.database !== runtime.database
    || direct.username !== runtime.username
    || direct.password !== runtime.password
    || direct.port !== runtime.port
  ) {
    fail("database_connection_identity_mismatch");
  }

  const metadataHost = normalizeHost(
    required(environment, "DATABASE_PGHOST_UNPOOLED"),
    "database_pghost_unpooled_invalid",
  );
  if (metadataHost !== directHost) fail("database_unpooled_host_metadata_mismatch");
  const pooledMetadataHost = normalizeHost(
    required(environment, "DATABASE_PGHOST"),
    "database_pghost_invalid",
  );
  if (pooledMetadataHost !== runtimeHost) fail("database_pooled_host_metadata_mismatch");

  const expectedDatabase = required(environment, "EXPECTED_DATABASE_NAME");
  const metadataDatabase = required(environment, "DATABASE_PGDATABASE");
  if (
    metadataDatabase !== expectedDatabase
    || direct.database !== expectedDatabase
    || runtime.database !== expectedDatabase
  ) {
    fail("database_name_metadata_mismatch");
  }

  const neonProjectId = requireExact(
    environment,
    "DATABASE_NEON_PROJECT_ID",
    "EXPECTED_NEON_PROJECT_ID",
    "neon_project_id_mismatch",
  );
  if (!/^[a-z][a-z0-9-]*-[0-9]{4,}$/.test(neonProjectId)) {
    fail("neon_project_id_invalid");
  }

  const forbiddenHosts = LONG_LIVED_DATABASE_HOST_VARIABLES.map((name) =>
    normalizeHost(required(environment, name), `${name.toLowerCase()}_invalid`)
  );
  const previewEndpoint = neonEndpointIdentity(directHost);
  if (
    forbiddenHosts.some((host) =>
      host === directHost
      || host === runtimeHost
      || neonEndpointIdentity(host) === previewEndpoint
    )
  ) {
    fail("preview_database_host_is_long_lived");
  }

  for (const [name, value] of Object.entries(environment)) {
    if (!isOptionalConnectionAlias(name) || value === undefined) continue;
    const alias = parseDatabaseConnection(value, "database_connection_alias_invalid");
    if (
      forbiddenHosts.some((host) =>
        host === alias.host
        || neonEndpointIdentity(host) === neonEndpointIdentity(alias.host)
      )
    ) {
      fail("database_connection_alias_is_long_lived");
    }
    const expected = name.endsWith("_NON_POOLING") ? direct : runtime;
    if (!sameConnectionIdentity(alias, expected)) {
      fail("database_connection_alias_mismatch");
    }
  }

  return {
    directUrl,
    directHost,
    database: expectedDatabase,
    forbiddenHosts,
  };
}

function command(
  input: Omit<BuildCommand, "shell">,
): BuildCommand {
  return { ...input, shell: false };
}

export function createVercelBuildPlan(
  environment: BuildEnvironment = process.env,
  cwd = process.cwd(),
): VercelBuildPlan {
  const target = classifyVercelTarget(environment);
  const migrationsEnabled = previewMigrationsEnabled(environment, target);
  if ("PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK" in environment) {
    fail("prisma_schema_disable_advisory_lock_must_be_unset");
  }
  const buildEnvironment = { ...environment };
  const build = command({
    label: "application build",
    failureCode: "application_build_failed",
    file: process.platform === "win32" ? "npm.cmd" : "npm",
    args: ["run", "build"],
    cwd,
    env: buildEnvironment,
  });
  if (!migrationsEnabled) {
    return { target, migrations: "skipped", commands: [build] };
  }

  assertPreviewVercelMetadata(environment);
  const database = assertPreviewNeonMetadata(environment);
  const migrationEnvironment: NodeJS.ProcessEnv = {
    ...environment,
    DATABASE_URL: database.directUrl,
    EXPECTED_DATABASE_HOST: database.directHost,
    EXPECTED_DATABASE_NAME: database.database,
    FORBIDDEN_DATABASE_HOST: database.forbiddenHosts[0],
    FORBIDDEN_DATABASE_HOST_2: database.forbiddenHosts[1],
    TARGET_DATABASE: "validation",
  };
  const prisma = path.join(cwd, "node_modules", ".bin", "prisma");

  return {
    target,
    migrations: "enabled",
    commands: [
      command({
        label: "database target guard",
        failureCode: "database_target_guard_failed",
        file: process.execPath,
        args: [
          "--experimental-strip-types",
          "scripts/assert-database-target.ts",
        ],
        cwd,
        env: migrationEnvironment,
      }),
      command({
        label: "Prisma migration deployment",
        failureCode: "prisma_migrate_deploy_failed",
        file: prisma,
        args: ["migrate", "deploy"],
        cwd,
        env: migrationEnvironment,
      }),
      command({
        label: "Prisma migration status",
        failureCode: "prisma_migrate_status_failed",
        file: prisma,
        args: ["migrate", "status"],
        cwd,
        env: migrationEnvironment,
      }),
      command({
        label: "Prisma schema equivalence check",
        failureCode: "prisma_migrate_diff_failed",
        file: prisma,
        args: [
          "migrate",
          "diff",
          "--from-schema=prisma/schema.prisma",
          "--to-config-datasource",
          "--exit-code",
        ],
        cwd,
        env: migrationEnvironment,
      }),
      build,
    ],
  };
}

export function runBuildCommand(commandToRun: BuildCommand): void {
  console.log(`Starting ${commandToRun.label}.`);
  const result = spawnSync(commandToRun.file, commandToRun.args, {
    cwd: commandToRun.cwd,
    env: commandToRun.env,
    stdio: "inherit",
    shell: commandToRun.shell,
  });
  if (result.error || result.signal || result.status !== 0) {
    fail(commandToRun.failureCode);
  }
}

export function runVercelBuild(
  environment: BuildEnvironment = process.env,
  cwd = process.cwd(),
  runner: BuildCommandRunner = runBuildCommand,
): VercelBuildPlan {
  const plan = createVercelBuildPlan(environment, cwd);
  for (const plannedCommand of plan.commands) {
    runner(plannedCommand);
  }
  return plan;
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (invokedPath === import.meta.url) {
  try {
    runVercelBuild();
  } catch (error) {
    const code = error instanceof VercelBuildGuardError
      ? error.code
      : "unexpected_failure";
    console.error(`Vercel build guard failed: ${code}.`);
    process.exitCode = 1;
  }
}
