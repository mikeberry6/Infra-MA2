#!/usr/bin/env node

import path from "node:path";
import { pathToFileURL } from "node:url";
import { hasSafeDatabaseConnectionQuery } from "../src/lib/database-connection-query.ts";
import { prepareProtectedTemporaryJsonOutput } from "../src/lib/reviewer-neutral-output.ts";
import { hasSafeDecodedDatabaseCredentials } from "./assert-playwright-artifact-secret-safety.ts";

export type ParsedDatabaseConnection = {
  host: string;
  database: string;
  username: string;
  password: string;
  port: string;
};

export type PreviewDatabasePair = {
  pooled: ParsedDatabaseConnection;
  direct: ParsedDatabaseConnection;
};

export type PreviewDatabasePairEvidence = {
  schemaVersion: 1;
  target: "preview";
  result: "passed";
  database: string;
  pooledHost: string;
  directHost: string;
  port: string;
};

export class PreviewDatabasePairGuardError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.name = "PreviewDatabasePairGuardError";
    this.code = code;
  }
}

function fail(code: string): never {
  throw new PreviewDatabasePairGuardError(code);
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

function decodedCredential(value: string, failureCode: string): string {
  try {
    const decoded = decodeURIComponent(value);
    if (!decoded) fail(failureCode);
    return decoded;
  } catch {
    fail(failureCode);
  }
}

export function normalizeDatabaseHost(value: string, failureCode: string): string {
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

export function neonEndpointIdentity(host: string): string {
  const [label, ...suffix] = host.split(".");
  return [label.replace(/-pooler$/, ""), ...suffix].join(".");
}

export function parseDatabaseConnection(
  value: string,
  failureCode: string,
): ParsedDatabaseConnection {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    fail(failureCode);
  }
  if (
    (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:")
    || !parsed.hostname
    || parsed.hash
    || !hasSafeDatabaseConnectionQuery(parsed, { requireSslMode: true })
  ) {
    fail(failureCode);
  }
  const username = decodedCredential(parsed.username, failureCode);
  const password = decodedCredential(parsed.password, failureCode);
  if (!hasSafeDecodedDatabaseCredentials(username, password)) {
    fail(failureCode);
  }
  return {
    host: normalizeDatabaseHost(parsed.hostname, failureCode),
    database: databaseName(parsed),
    username,
    password,
    port: parsed.port || "5432",
  };
}

export function sameConnectionIdentity(
  actual: ParsedDatabaseConnection,
  expected: ParsedDatabaseConnection,
): boolean {
  return actual.host === expected.host
    && actual.database === expected.database
    && actual.username === expected.username
    && actual.password === expected.password
    && actual.port === expected.port;
}

export function assertPreviewDatabasePair(input: {
  pooledUrl: string;
  directUrl: string;
  expectedPooledHost: string;
  expectedDirectHost: string;
  expectedDatabase: string;
  forbiddenHosts: string[];
}): PreviewDatabasePair {
  const pooled = parseDatabaseConnection(input.pooledUrl, "database_url_invalid");
  const direct = parseDatabaseConnection(
    input.directUrl,
    "database_url_unpooled_invalid",
  );
  if (
    !/^ep-[a-z0-9-]+\.[a-z0-9.-]+\.neon\.tech$/.test(direct.host)
    || direct.host.split(".", 1)[0].endsWith("-pooler")
  ) {
    fail("database_url_unpooled_host_not_neon_direct");
  }
  const [directLabel, ...suffix] = direct.host.split(".");
  const expectedPooledPair = [`${directLabel}-pooler`, ...suffix].join(".");
  if (pooled.host !== expectedPooledPair) {
    fail("database_url_host_not_pooled_pair");
  }
  if (
    direct.database !== pooled.database
    || direct.username !== pooled.username
    || direct.password !== pooled.password
    || direct.port !== pooled.port
  ) {
    fail("database_connection_identity_mismatch");
  }

  const expectedPooledHost = normalizeDatabaseHost(
    input.expectedPooledHost,
    "database_pooled_host_metadata_mismatch",
  );
  const expectedDirectHost = normalizeDatabaseHost(
    input.expectedDirectHost,
    "database_unpooled_host_metadata_mismatch",
  );
  if (pooled.host !== expectedPooledHost) {
    fail("database_pooled_host_metadata_mismatch");
  }
  if (direct.host !== expectedDirectHost) {
    fail("database_unpooled_host_metadata_mismatch");
  }
  if (
    !input.expectedDatabase
    || pooled.database !== input.expectedDatabase
    || direct.database !== input.expectedDatabase
  ) {
    fail("database_name_metadata_mismatch");
  }

  const previewEndpoint = neonEndpointIdentity(direct.host);
  const forbiddenHosts = input.forbiddenHosts.map((host) =>
    normalizeDatabaseHost(host, "forbidden_preview_database_host_invalid"));
  if (
    forbiddenHosts.some((host) =>
      host === pooled.host
      || host === direct.host
      || neonEndpointIdentity(host) === previewEndpoint
    )
  ) {
    fail("preview_database_host_is_long_lived");
  }
  return { pooled, direct };
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) fail(`${name.toLowerCase()}_required`);
  return value;
}

function outputPath(): string {
  const argument = process.argv.slice(2).find((value) => value.startsWith("--output="));
  return argument?.slice("--output=".length)
    ?? "tmp/preview-dashboard-bootstrap/database-pair.json";
}

export async function writePreviewDatabasePairEvidence(input: {
  evidence: PreviewDatabasePairEvidence;
  output: string;
  repositoryRoot: string;
}): Promise<string> {
  const destination = await prepareProtectedTemporaryJsonOutput({
    repositoryRoot: input.repositoryRoot,
    output: input.output,
  });
  await destination.write(`${JSON.stringify(input.evidence, null, 2)}\n`);
  return destination.outputPath;
}

async function main(): Promise<void> {
  const pair = assertPreviewDatabasePair({
    pooledUrl: requiredEnvironment("PREVIEW_DATABASE_URL"),
    directUrl: requiredEnvironment("PREVIEW_MIGRATION_DATABASE_URL"),
    expectedPooledHost: requiredEnvironment("PREVIEW_DATABASE_HOST"),
    expectedDirectHost: requiredEnvironment("PREVIEW_MIGRATION_DATABASE_HOST"),
    expectedDatabase: requiredEnvironment("PREVIEW_DATABASE_NAME"),
    forbiddenHosts: [
      requiredEnvironment("PRODUCTION_DATABASE_HOST"),
      requiredEnvironment("PRODUCTION_MIGRATION_DATABASE_HOST"),
      requiredEnvironment("MIGRATION_DATABASE_HOST"),
      requiredEnvironment("DASHBOARD_MIGRATION_DATABASE_HOST"),
    ],
  });
  await writePreviewDatabasePairEvidence({
    repositoryRoot: process.cwd(),
    output: outputPath(),
    evidence: {
      schemaVersion: 1,
      target: "preview",
      result: "passed",
      database: pair.direct.database,
      pooledHost: pair.pooled.host,
      directHost: pair.direct.host,
      port: pair.direct.port,
    },
  });
  console.log("Preview pooled/direct database identity guard passed.");
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Preview database pair guard failed.");
    process.exitCode = 1;
  });
}
