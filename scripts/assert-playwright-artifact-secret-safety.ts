#!/usr/bin/env node

import { inflateRawSync } from "node:zlib";
import { createHash } from "node:crypto";
import {
  lstat,
  readFile,
  readdir,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { prepareProtectedTemporaryJsonOutput } from "../src/lib/reviewer-neutral-output.ts";

const ZIP_LOCAL_FILE = 0x04034b50;
const ZIP_CENTRAL_FILE = 0x02014b50;
const ZIP_END = 0x06054b50;
const MAX_ZIP_COMMENT_BYTES = 65_535;
const MAX_ARCHIVE_ENTRIES = 20_000;
const MAX_ARCHIVE_DEPTH = 6;
const MAX_ENTRY_BYTES = 256 * 1024 * 1024;
const EMBEDDED_ZIP_PREFIX = Buffer.from("data:application/zip;base64,", "ascii");
const MAX_DATABASE_URL_BYTES = 16 * 1024;
const MAX_TRANSFORM_DEPTH = 4;
const MAX_TRANSFORM_VIEWS = 4_096;
const MAX_TRANSFORM_BYTES = 512 * 1024 * 1024;
const MAX_ROOT_FILE_BYTES = MAX_ENTRY_BYTES;
const CANONICAL_DATABASE_CREDENTIAL = /^[A-Za-z0-9._-]+$/;
const ENVIRONMENT_NAME = /^[A-Z][A-Z0-9_]{0,127}$/;
const SAFE_FAILURE = "Artifact secret scan failed.";

// Lower bounds keep component needles meaningful; upper bounds keep scans
// deterministic even when the protected environment is misconfigured.
export const DATABASE_USERNAME_BYTES = {
  min: 8,
  max: 256,
} as const;

export const DATABASE_PASSWORD_BYTES = {
  min: 14,
  max: 512,
} as const;

type ArchiveEntry = {
  data: Buffer;
  ordinal: number;
};

type SecretNeedles = Buffer | readonly Buffer[];

type ArtifactSafetyReport = {
  checkedAt: string;
  filesScanned: number;
  matches: string[];
  rootsScanned: number;
  status: "passed" | "failed";
};

export type DatabaseUrlSecretCredentials = {
  decodedPassword: string;
  decodedUsername: string;
  rawPassword: string;
  rawUsername: string;
};

function findEndOfCentralDirectory(buffer: Buffer): number {
  const earliest = Math.max(0, buffer.length - 22 - MAX_ZIP_COMMENT_BYTES);
  for (let offset = buffer.length - 22; offset >= earliest; offset -= 1) {
    if (buffer.readUInt32LE(offset) === ZIP_END) return offset;
  }
  throw new Error("ZIP end-of-central-directory record is missing.");
}

/** Reads normal (non-Zip64), unencrypted stored/deflated ZIP entries in memory. */
export function readZipEntries(buffer: Buffer): ArchiveEntry[] {
  if (buffer.length < 22 || buffer.readUInt32LE(0) !== ZIP_LOCAL_FILE) {
    throw new Error("Input is not a supported ZIP archive.");
  }

  const endOffset = findEndOfCentralDirectory(buffer);
  const diskNumber = buffer.readUInt16LE(endOffset + 4);
  const centralDisk = buffer.readUInt16LE(endOffset + 6);
  const entriesOnDisk = buffer.readUInt16LE(endOffset + 8);
  const entryCount = buffer.readUInt16LE(endOffset + 10);
  const centralOffset = buffer.readUInt32LE(endOffset + 16);
  if (diskNumber !== 0 || centralDisk !== 0 || entriesOnDisk !== entryCount) {
    throw new Error("Multi-disk ZIP archives are not supported.");
  }
  if (entryCount === 0xffff || centralOffset === 0xffffffff) {
    throw new Error("Zip64 archives are not supported.");
  }
  if (entryCount > MAX_ARCHIVE_ENTRIES) {
    throw new Error(`ZIP archive exceeds the ${MAX_ARCHIVE_ENTRIES}-entry safety limit.`);
  }

  const entries: ArchiveEntry[] = [];
  let offset = centralOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== ZIP_CENTRAL_FILE) {
      throw new Error(`ZIP central-directory entry ${index + 1} is malformed.`);
    }

    const flags = buffer.readUInt16LE(offset + 8);
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    if (
      compressedSize === 0xffffffff
      || uncompressedSize === 0xffffffff
      || localOffset === 0xffffffff
    ) {
      throw new Error("Zip64 entries are not supported.");
    }
    if ((flags & 0x1) !== 0) throw new Error("Encrypted ZIP entries are not supported.");
    if (uncompressedSize > MAX_ENTRY_BYTES) {
      throw new Error(`ZIP entry exceeds the ${MAX_ENTRY_BYTES}-byte safety limit.`);
    }

    const nameStart = offset + 46;
    const nameEnd = nameStart + nameLength;
    if (nameEnd + extraLength + commentLength > buffer.length) {
      throw new Error(`ZIP central-directory entry ${index + 1} exceeds the archive.`);
    }
    const isDirectory = buffer.subarray(nameStart, nameEnd).toString("utf8").endsWith("/");

    if (
      localOffset + 30 > buffer.length
      || buffer.readUInt32LE(localOffset) !== ZIP_LOCAL_FILE
    ) {
      throw new Error(`ZIP local entry ${index + 1} is malformed.`);
    }
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > buffer.length) {
      throw new Error(`ZIP data for entry ${index + 1} exceeds the archive.`);
    }

    const compressed = buffer.subarray(dataStart, dataEnd);
    let data: Buffer;
    if (method === 0) {
      data = Buffer.from(compressed);
    } else if (method === 8) {
      data = inflateRawSync(compressed);
    } else {
      throw new Error(`ZIP compression method ${method} is not supported.`);
    }
    if (data.length !== uncompressedSize) {
      throw new Error(`ZIP entry ${index + 1} has an invalid expanded size.`);
    }
    if (!isDirectory) entries.push({ data, ordinal: index + 1 });
    offset = nameEnd + extraLength + commentLength;
  }

  return entries;
}

function embeddedZipPayloads(buffer: Buffer): Buffer[] {
  const payloads: Buffer[] = [];
  let cursor = 0;
  while (cursor < buffer.length) {
    const prefix = buffer.indexOf(EMBEDDED_ZIP_PREFIX, cursor);
    if (prefix === -1) break;
    const start = prefix + EMBEDDED_ZIP_PREFIX.length;
    let end = start;
    while (end < buffer.length) {
      const byte = buffer[end];
      const isBase64 =
        (byte >= 0x41 && byte <= 0x5a)
        || (byte >= 0x61 && byte <= 0x7a)
        || (byte >= 0x30 && byte <= 0x39)
        || byte === 0x2b
        || byte === 0x2f
        || byte === 0x3d;
      if (!isBase64) break;
      end += 1;
    }
    if (end > start) payloads.push(Buffer.from(buffer.subarray(start, end).toString("ascii"), "base64"));
    cursor = Math.max(end, start + 1);
  }
  return payloads;
}

type TransformationBudget = {
  bytes: number;
  views: number;
};

function safeArtifactLabel(value: string): string {
  return `artifact-${createHash("sha256").update(value).digest("hex").slice(0, 16)}`;
}

function decodePercentTriplets(value: string): string {
  return value.replace(/(?:%[0-9A-Fa-f]{2})+/g, (encoded) => {
    const bytes = Buffer.from(
      encoded.replaceAll("%", ""),
      "hex",
    );
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      return encoded;
    }
  });
}

function decodeJsonEscapes(value: string): string {
  return value.replace(
    /\\(?:["\\/bfnrt]|u[0-9A-Fa-f]{4})/g,
    (escaped) => {
      try {
        return JSON.parse(`"${escaped}"`) as string;
      } catch {
        return escaped;
      }
    },
  );
}

function transformedArtifactViews(
  buffer: Buffer,
  budget: TransformationBudget,
): Buffer[] {
  if (buffer.length > MAX_ROOT_FILE_BYTES) {
    throw new Error("Artifact exceeds the deterministic scan size limit.");
  }
  // Replacement characters preserve later ASCII escape sequences, so an
  // unrelated invalid UTF-8 byte cannot disable transformations for the rest
  // of an otherwise textual artifact.
  const source = new TextDecoder("utf-8").decode(buffer);

  const views: Buffer[] = [];
  const queue: Array<{ depth: number; value: string }> = [{
    depth: 0,
    value: source,
  }];
  const seen = new Set([
    `${buffer.length}:${createHash("sha256").update(buffer).digest("hex")}`,
  ]);
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    const candidates = [
      decodePercentTriplets(current.value),
      decodePercentTriplets(current.value.replaceAll("+", " ")),
      decodeJsonEscapes(current.value),
    ];
    if (
      current.depth >= MAX_TRANSFORM_DEPTH
      && candidates.some((candidate) => candidate !== current.value)
    ) {
      throw new Error("Artifact transformations exceed deterministic scan depth.");
    }
    if (current.depth >= MAX_TRANSFORM_DEPTH) continue;
    for (const candidate of candidates) {
      if (candidate === current.value) continue;
      const candidateBuffer = Buffer.from(candidate);
      const identity =
        `${candidateBuffer.length}:${createHash("sha256").update(candidateBuffer).digest("hex")}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      budget.views += 1;
      budget.bytes += candidateBuffer.length;
      if (
        budget.views > MAX_TRANSFORM_VIEWS
        || budget.bytes > MAX_TRANSFORM_BYTES
      ) {
        throw new Error("Artifact transformations exceed deterministic scan limits.");
      }
      views.push(candidateBuffer);
      queue.push({ depth: current.depth + 1, value: candidate });
    }
  }
  return views;
}

function scanBufferWithSafeLabel(
  buffer: Buffer,
  safeLabel: string,
  secret: SecretNeedles,
  depth: number,
  budget: TransformationBudget,
): string[] {
  if (depth > MAX_ARCHIVE_DEPTH) {
    throw new Error(`Archive nesting exceeds ${MAX_ARCHIVE_DEPTH} levels.`);
  }

  const matches = new Set<string>();
  const needles = Array.isArray(secret) ? secret : [secret];
  const isZipArchive =
    buffer.length >= 4 && buffer.readUInt32LE(0) === ZIP_LOCAL_FILE;
  // Compressed container bytes are not a textual serialization surface.
  // Inspect them raw, then apply bounded text transformations only to each
  // decompressed entry so archive noise cannot consume the file budget.
  const views = isZipArchive
    ? [buffer]
    : [buffer, ...transformedArtifactViews(buffer, budget)];
  if (
    views.some((view) =>
      needles.some((needle) => view.indexOf(needle) !== -1))
  ) {
    matches.add(safeLabel);
  }

  if (isZipArchive) {
    for (const entry of readZipEntries(buffer)) {
      for (const match of scanBufferWithSafeLabel(
        entry.data,
        `${safeLabel}!/zip-entry-${entry.ordinal}`,
        secret,
        depth + 1,
        budget,
      )) matches.add(match);
    }
  }

  for (const [index, payload] of embeddedZipPayloads(buffer).entries()) {
    for (const match of scanBufferWithSafeLabel(
      payload,
      `${safeLabel}!/embedded-zip-${index + 1}`,
      secret,
      depth + 1,
      budget,
    )) matches.add(match);
  }

  return [...matches].sort();
}

export function scanBufferForSecret(
  buffer: Buffer,
  label: string,
  secret: SecretNeedles,
  depth = 0,
): string[] {
  return scanBufferWithSafeLabel(
    buffer,
    safeArtifactLabel(label),
    secret,
    depth,
    { bytes: 0, views: 0 },
  );
}

/**
 * Reporters serialize API arguments through one or more JSON string layers.
 * Scan the raw credential plus bounded escaped, URI, and base64 forms without
 * ever writing or logging any representation.
 */
export function secretRepresentations(value: string): Buffer[] {
  const values = new Set<string>();
  const addEncodedValues = (candidate: string): void => {
    values.add(candidate);
    values.add(encodeURIComponent(candidate));
    const form = new URLSearchParams();
    form.set("secret", candidate);
    values.add(form.toString().slice("secret=".length));
  };
  addEncodedValues(value);
  values.add(Buffer.from(value).toString("base64"));
  let escaped = value;
  for (let depth = 0; depth < 3; depth += 1) {
    escaped = JSON.stringify(escaped).slice(1, -1);
    addEncodedValues(escaped);
  }
  for (const candidate of [...values]) {
    values.add(normalizePercentTriplets(candidate, "upper"));
    values.add(normalizePercentTriplets(candidate, "lower"));
  }
  return [...values].map((candidate) => Buffer.from(candidate));
}

function normalizePercentTriplets(
  value: string,
  letterCase: "lower" | "upper",
): string {
  return value.replace(/%[0-9a-f]{2}/gi, (triplet) => {
    const encodedByte = triplet.slice(1);
    return `%${letterCase === "upper"
      ? encodedByte.toUpperCase()
      : encodedByte.toLowerCase()}`;
  });
}

function hasSafeDecodedCredential(
  value: string,
  bounds: { min: number; max: number },
): boolean {
  const bytes = Buffer.byteLength(value);
  return bytes >= bounds.min
    && bytes <= bounds.max
    && CANONICAL_DATABASE_CREDENTIAL.test(value)
    && !/[\u0000-\u0020\u007f-\u009f\u2028\u2029\ufffd]/u.test(value);
}

export function hasSafeDecodedDatabaseCredentials(
  username: string,
  password: string,
): boolean {
  return hasSafeDecodedCredential(username, DATABASE_USERNAME_BYTES)
    && hasSafeDecodedCredential(password, DATABASE_PASSWORD_BYTES);
}

/**
 * Parse a bounded PostgreSQL connection URL for secret scanning. Errors are
 * deliberately value-independent so a malformed credential can never reach
 * retained logs.
 */
export function parseDatabaseUrlSecretCredentials(
  value: string,
): DatabaseUrlSecretCredentials {
  if (
    !value
    || value !== value.trim()
    || Buffer.byteLength(value) > MAX_DATABASE_URL_BYTES
    || /[\u0000-\u001f\u007f]/u.test(value)
  ) {
    throw new Error("database_url_secret_invalid");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("database_url_secret_invalid");
  }
  if (
    (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:")
    || !parsed.hostname
    || !parsed.pathname
    || parsed.pathname === "/"
    || parsed.hash
    || !parsed.username
    || !parsed.password
  ) {
    throw new Error("database_url_secret_invalid");
  }

  let decodedUsername: string;
  let decodedPassword: string;
  try {
    decodedUsername = decodeURIComponent(parsed.username);
    decodedPassword = decodeURIComponent(parsed.password);
  } catch {
    throw new Error("database_url_secret_invalid");
  }
  if (
    !hasSafeDecodedDatabaseCredentials(decodedUsername, decodedPassword)
    || parsed.username !== decodedUsername
    || parsed.password !== decodedPassword
  ) {
    throw new Error("database_url_secret_invalid");
  }

  return {
    decodedPassword,
    decodedUsername,
    rawPassword: parsed.password,
    rawUsername: parsed.username,
  };
}

/**
 * Scan the exact URL and each credential component in the forms reporters can
 * retain: raw URL encoding, decoded text, canonical URI encoding, JSON escapes,
 * and base64. Component needles also catch a password embedded in a larger log
 * message even when the full connection URL is absent.
 */
export function databaseUrlSecretRepresentations(value: string): Buffer[] {
  const credentials = parseDatabaseUrlSecretCredentials(value);
  const sensitiveValues = [
    value,
    credentials.rawUsername,
    credentials.decodedUsername,
    encodeURIComponent(credentials.decodedUsername),
    credentials.rawPassword,
    credentials.decodedPassword,
    encodeURIComponent(credentials.decodedPassword),
  ];
  const representations = new Map<string, Buffer>();
  for (const sensitiveValue of sensitiveValues) {
    for (const representation of secretRepresentations(sensitiveValue)) {
      representations.set(representation.toString("base64"), representation);
    }
  }
  return [...representations.values()];
}

async function scanRoot(
  root: string,
  secret: SecretNeedles,
  report: ArtifactSafetyReport,
): Promise<void> {
  let metadata;
  try {
    metadata = await lstat(root);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("Required artifact scan root is missing.");
    }
    throw new Error("Artifact scan root could not be inspected.");
  }
  if (metadata.isSymbolicLink()) {
    throw new Error("Artifact scan roots cannot contain symbolic links.");
  }
  if (metadata.isDirectory()) {
    for (const entry of (await readdir(root)).sort()) {
      await scanRoot(path.join(root, entry), secret, report);
    }
    return;
  }
  if (!metadata.isFile()) return;
  if (metadata.size > MAX_ROOT_FILE_BYTES) {
    throw new Error("Artifact exceeds the deterministic scan size limit.");
  }

  report.filesScanned += 1;
  let buffer: Buffer;
  try {
    buffer = await readFile(root);
  } catch {
    throw new Error("Artifact file could not be read.");
  }
  report.matches.push(...scanBufferWithSafeLabel(
    buffer,
    `artifact-${report.filesScanned}`,
    secret,
    0,
    { bytes: 0, views: 0 },
  ));
}

function parseArgs(argv: string[]): {
  databaseUrlSecretEnv?: string;
  output: string;
  roots: string[];
  secretEnv: string;
} {
  const roots: string[] = [];
  let output = "tmp/ci/playwright-artifact-secret-safety.json";
  let secretEnv = "E2E_ADMIN_PASSWORD";
  let databaseUrlSecretEnv: string | undefined;
  let explicitSecretEnv = false;
  let explicitOutput = false;
  for (const arg of argv) {
    if (arg.startsWith("--root=")) {
      const root = arg.slice("--root=".length);
      if (!root) throw new Error(SAFE_FAILURE);
      roots.push(root);
    }
    else if (arg.startsWith("--output=")) {
      if (explicitOutput) throw new Error(SAFE_FAILURE);
      output = arg.slice("--output=".length);
      explicitOutput = true;
    }
    else if (arg.startsWith("--secret-env=")) {
      if (explicitSecretEnv) throw new Error(SAFE_FAILURE);
      secretEnv = arg.slice("--secret-env=".length);
      explicitSecretEnv = true;
    } else if (arg.startsWith("--database-url-secret-env=")) {
      if (databaseUrlSecretEnv !== undefined) throw new Error(SAFE_FAILURE);
      databaseUrlSecretEnv = arg.slice("--database-url-secret-env=".length);
    }
    else throw new Error(SAFE_FAILURE);
  }
  if (roots.length === 0 || !output) throw new Error(SAFE_FAILURE);
  if (!ENVIRONMENT_NAME.test(secretEnv)) throw new Error(SAFE_FAILURE);
  if (
    databaseUrlSecretEnv !== undefined
    && !ENVIRONMENT_NAME.test(databaseUrlSecretEnv)
  ) throw new Error(SAFE_FAILURE);
  if (databaseUrlSecretEnv && explicitSecretEnv) {
    throw new Error(SAFE_FAILURE);
  }
  return { databaseUrlSecretEnv, output, roots, secretEnv };
}

async function runArtifactSecretScan(input: {
  argv: string[];
  environment: NodeJS.ProcessEnv;
  repositoryRoot: string;
}): Promise<void> {
    const { databaseUrlSecretEnv, output, roots, secretEnv } = parseArgs(input.argv);
    const selectedSecretEnv = databaseUrlSecretEnv ?? secretEnv;
    const secretValue = input.environment[selectedSecretEnv];
    let secret: Buffer[];
    if (databaseUrlSecretEnv) {
      secret = databaseUrlSecretRepresentations(secretValue ?? "");
    } else {
      if (!secretValue || Buffer.byteLength(secretValue) < 14) {
        throw new Error(SAFE_FAILURE);
      }
      secret = secretRepresentations(secretValue);
    }

    const report: ArtifactSafetyReport = {
      checkedAt: new Date().toISOString(),
      filesScanned: 0,
      matches: [],
      rootsScanned: roots.length,
      status: "passed",
    };
    for (const root of roots) await scanRoot(root, secret, report);
    if (report.filesScanned === 0) {
      throw new Error("No artifact files were available for scanning.");
    }
    report.matches = [...new Set(report.matches)].sort();
    report.status = report.matches.length === 0 ? "passed" : "failed";

    const destination = await prepareProtectedTemporaryJsonOutput({
      repositoryRoot: input.repositoryRoot,
      output,
    });
    await destination.write(`${JSON.stringify(report, null, 2)}\n`);
    if (report.matches.length > 0) throw new Error(SAFE_FAILURE);
    console.log(`Artifact secret scan passed across ${report.filesScanned} files.`);
}

export async function main(
  argv = process.argv.slice(2),
  options: {
    environment?: NodeJS.ProcessEnv;
    repositoryRoot?: string;
  } = {},
): Promise<void> {
  try {
    await runArtifactSecretScan({
      argv,
      environment: options.environment ?? process.env,
      repositoryRoot: options.repositoryRoot ?? process.cwd(),
    });
  } catch {
    throw new Error(SAFE_FAILURE);
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  main().catch(() => {
    console.error(SAFE_FAILURE);
    process.exitCode = 1;
  });
}
