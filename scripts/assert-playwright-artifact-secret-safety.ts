#!/usr/bin/env node

import { inflateRawSync } from "node:zlib";
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ZIP_LOCAL_FILE = 0x04034b50;
const ZIP_CENTRAL_FILE = 0x02014b50;
const ZIP_END = 0x06054b50;
const MAX_ZIP_COMMENT_BYTES = 65_535;
const MAX_ARCHIVE_ENTRIES = 20_000;
const MAX_ARCHIVE_DEPTH = 6;
const MAX_ENTRY_BYTES = 256 * 1024 * 1024;
const EMBEDDED_ZIP_PREFIX = Buffer.from("data:application/zip;base64,", "ascii");

type ArchiveEntry = {
  data: Buffer;
  name: string;
};

type SecretNeedles = Buffer | readonly Buffer[];

type ArtifactSafetyReport = {
  checkedAt: string;
  filesScanned: number;
  matches: string[];
  roots: string[];
  status: "passed" | "failed";
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
    const name = buffer.subarray(nameStart, nameEnd).toString("utf8");

    if (
      localOffset + 30 > buffer.length
      || buffer.readUInt32LE(localOffset) !== ZIP_LOCAL_FILE
    ) {
      throw new Error(`ZIP local entry for ${name || index + 1} is malformed.`);
    }
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > buffer.length) {
      throw new Error(`ZIP data for ${name || index + 1} exceeds the archive.`);
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
      throw new Error(`ZIP entry ${name || index + 1} has an invalid expanded size.`);
    }
    if (!name.endsWith("/")) entries.push({ data, name: name || `entry-${index + 1}` });
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

export function scanBufferForSecret(
  buffer: Buffer,
  label: string,
  secret: SecretNeedles,
  depth = 0,
): string[] {
  if (depth > MAX_ARCHIVE_DEPTH) {
    throw new Error(`Archive nesting exceeds ${MAX_ARCHIVE_DEPTH} levels at ${label}.`);
  }

  const matches = new Set<string>();
  const needles = Array.isArray(secret) ? secret : [secret];
  if (needles.some((needle) => buffer.indexOf(needle) !== -1)) matches.add(label);

  if (buffer.length >= 4 && buffer.readUInt32LE(0) === ZIP_LOCAL_FILE) {
    for (const entry of readZipEntries(buffer)) {
      for (const match of scanBufferForSecret(
        entry.data,
        `${label}!/${entry.name}`,
        secret,
        depth + 1,
      )) matches.add(match);
    }
  }

  for (const [index, payload] of embeddedZipPayloads(buffer).entries()) {
    for (const match of scanBufferForSecret(
      payload,
      `${label}!/embedded-report-${index + 1}.zip`,
      secret,
      depth + 1,
    )) matches.add(match);
  }

  return [...matches].sort();
}

/**
 * Reporters serialize API arguments through one or more JSON string layers.
 * Scan the raw credential plus bounded escaped, URI, and base64 forms without
 * ever writing or logging any representation.
 */
export function secretRepresentations(value: string): Buffer[] {
  const values = new Set<string>([
    value,
    encodeURIComponent(value),
    Buffer.from(value).toString("base64"),
  ]);
  let escaped = value;
  for (let depth = 0; depth < 3; depth += 1) {
    escaped = JSON.stringify(escaped).slice(1, -1);
    values.add(escaped);
  }
  return [...values].map((candidate) => Buffer.from(candidate));
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
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  if (metadata.isSymbolicLink()) {
    throw new Error(`Refusing to scan symbolic link: ${root}`);
  }
  if (metadata.isDirectory()) {
    for (const entry of (await readdir(root)).sort()) {
      await scanRoot(path.join(root, entry), secret, report);
    }
    return;
  }
  if (!metadata.isFile()) return;

  report.filesScanned += 1;
  const buffer = await readFile(root);
  report.matches.push(...scanBufferForSecret(buffer, root, secret));
}

function parseArgs(argv: string[]): {
  output: string;
  roots: string[];
  secretEnv: string;
} {
  const roots: string[] = [];
  let output = "tmp/ci/playwright-artifact-secret-safety.json";
  let secretEnv = "E2E_ADMIN_PASSWORD";
  for (const arg of argv) {
    if (arg.startsWith("--root=")) roots.push(arg.slice("--root=".length));
    else if (arg.startsWith("--output=")) output = arg.slice("--output=".length);
    else if (arg.startsWith("--secret-env=")) secretEnv = arg.slice("--secret-env=".length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (roots.length === 0) throw new Error("At least one --root path is required.");
  return { output, roots, secretEnv };
}

export async function main(argv = process.argv.slice(2)): Promise<void> {
  const { output, roots, secretEnv } = parseArgs(argv);
  const secretValue = process.env[secretEnv];
  if (!secretValue || Buffer.byteLength(secretValue) < 14) {
    throw new Error(`${secretEnv} must contain a validation credential of at least 14 bytes.`);
  }

  const report: ArtifactSafetyReport = {
    checkedAt: new Date().toISOString(),
    filesScanned: 0,
    matches: [],
    roots,
    status: "passed",
  };
  const secret = secretRepresentations(secretValue);
  for (const root of roots) await scanRoot(root, secret, report);
  report.matches = [...new Set(report.matches)].sort();
  report.status = report.matches.length === 0 ? "passed" : "failed";

  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  if (report.matches.length > 0) {
    throw new Error(
      `Protected validation credential detected in ${report.matches.length} retained artifact location(s).`,
    );
  }
  console.log(`Playwright artifact secret scan passed across ${report.filesScanned} files.`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Artifact secret scan failed.");
    process.exitCode = 1;
  });
}
