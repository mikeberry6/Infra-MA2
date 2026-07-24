#!/usr/bin/env node

import { constants } from "node:fs";
import { open } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { prepareProtectedTemporaryJsonOutput } from "../src/lib/reviewer-neutral-output.ts";
import { withServerTask } from "../src/lib/server-log.ts";

const SAFE_FAILURE = "Vercel protected health verification failed.";
const MAX_HEADER_BYTES = 16 * 1024;
const MAX_HEADER_LINE_BYTES = 4 * 1024;
const MAX_HEADER_COUNT = 128;
const MAX_REQUESTED_URL_BYTES = 2 * 1024;
const VERCEL_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/;
const NONCE = /^[0-9A-Fa-f]{64}$/;
const HEADER_NAME = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const STATUS_LINE = /^HTTP\/(?:1\.0|1\.1|2|3) ([1-5][0-9]{2})(?: [\x20-\x7E]{0,128})?$/;
const HEALTH_PATH = "/Infra-MA2/api/health";

export type VercelProtectedHealthEvidence = {
  healthPathProtected: true;
  status: 401 | 302;
  responseKind: "unauthorized" | "sso_redirect";
  result: "passed";
};

type ParsedHeaders = {
  status: number;
  values: ReadonlyMap<string, readonly string[]>;
};

type CliOptions = {
  status: string;
  headers: string;
  requestedUrl: string;
  output: string;
};

function fail(): never {
  throw new Error(SAFE_FAILURE);
}

function utf8ByteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}

function parseHeaders(rawHeaders: string): ParsedHeaders {
  if (
    rawHeaders.length === 0
    || utf8ByteLength(rawHeaders) > MAX_HEADER_BYTES
    || /[^\t\x20-\x7E\r\n]/.test(rawHeaders)
  ) {
    fail();
  }

  const normalized = rawHeaders.replaceAll("\r\n", "\n");
  if (normalized.includes("\r") || !normalized.endsWith("\n\n")) fail();
  const headerBlock = normalized.slice(0, -2);
  if (!headerBlock || headerBlock.includes("\n\n")) fail();

  const lines = headerBlock.split("\n");
  if (
    lines.length < 2
    || lines.length - 1 > MAX_HEADER_COUNT
    || lines.some((line) => utf8ByteLength(line) > MAX_HEADER_LINE_BYTES)
  ) {
    fail();
  }

  const statusMatch = STATUS_LINE.exec(lines[0]);
  if (!statusMatch) fail();
  const status = Number(statusMatch[1]);
  const values = new Map<string, string[]>();

  for (const line of lines.slice(1)) {
    if (!line || line.startsWith(" ") || line.startsWith("\t")) fail();
    const separator = line.indexOf(":");
    if (separator <= 0) fail();
    const name = line.slice(0, separator);
    if (!HEADER_NAME.test(name)) fail();
    const value = line.slice(separator + 1).trim();
    if (!value || /[\r\n]/.test(value)) fail();
    const normalizedName = name.toLowerCase();
    const existing = values.get(normalizedName) ?? [];
    existing.push(value);
    values.set(normalizedName, existing);
  }

  return { status, values };
}

function exactlyOneHeader(headers: ParsedHeaders, name: string): string {
  const values = headers.values.get(name);
  if (!values || values.length !== 1) fail();
  return values[0];
}

function noHeader(headers: ParsedHeaders, name: string): void {
  if (headers.values.has(name)) fail();
}

function assertRequestedImmutableHealthUrl(requestedUrl: string): void {
  if (
    requestedUrl.length === 0
    || utf8ByteLength(requestedUrl) > MAX_REQUESTED_URL_BYTES
    || requestedUrl.trim() !== requestedUrl
    || /[\u0000-\u001F\u007F]/.test(requestedUrl)
  ) {
    fail();
  }

  let parsed: URL;
  try {
    parsed = new URL(requestedUrl);
  } catch {
    fail();
  }
  if (
    parsed.href !== requestedUrl
    || parsed.protocol !== "https:"
    || parsed.username
    || parsed.password
    || parsed.port
    || parsed.search
    || parsed.hash
    || parsed.pathname !== HEALTH_PATH
    || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/.test(parsed.hostname)
  ) {
    fail();
  }
}

function strictQueryDecode(value: string): string {
  if (/%(?![0-9A-Fa-f]{2})/.test(value)) fail();
  try {
    return decodeURIComponent(value.replaceAll("+", "%20"));
  } catch {
    fail();
  }
}

function assertSsoRedirect(location: string, requestedUrl: string): void {
  if (
    location.length === 0
    || utf8ByteLength(location) > MAX_REQUESTED_URL_BYTES * 2
    || location.trim() !== location
    || !location.startsWith("https://vercel.com/sso-api?")
    || location.includes("#")
  ) {
    fail();
  }

  let parsed: URL;
  try {
    parsed = new URL(location);
  } catch {
    fail();
  }
  if (
    parsed.protocol !== "https:"
    || parsed.hostname !== "vercel.com"
    || parsed.host !== "vercel.com"
    || parsed.username
    || parsed.password
    || parsed.pathname !== "/sso-api"
    || parsed.hash
  ) {
    fail();
  }

  const rawQuery = location.slice("https://vercel.com/sso-api?".length);
  const segments = rawQuery.split("&");
  if (segments.length !== 2) fail();
  const query = new Map<string, string>();
  for (const segment of segments) {
    const separator = segment.indexOf("=");
    if (
      separator <= 0
      || separator !== segment.lastIndexOf("=")
    ) {
      fail();
    }
    const name = segment.slice(0, separator);
    if ((name !== "url" && name !== "nonce") || query.has(name)) fail();
    query.set(name, strictQueryDecode(segment.slice(separator + 1)));
  }
  if (query.size !== 2) fail();
  if (query.get("url") !== requestedUrl || !NONCE.test(query.get("nonce") ?? "")) {
    fail();
  }
}

export function verifyUnauthenticatedVercelHealthProbe(input: {
  status: string;
  headers: string;
  requestedUrl: string;
}): VercelProtectedHealthEvidence {
  if (input.status !== "401" && input.status !== "302") fail();
  assertRequestedImmutableHealthUrl(input.requestedUrl);
  const parsedHeaders = parseHeaders(input.headers);
  const status = Number(input.status) as 401 | 302;
  if (parsedHeaders.status !== status) fail();

  if (exactlyOneHeader(parsedHeaders, "server") !== "Vercel") fail();
  if (!VERCEL_ID.test(exactlyOneHeader(parsedHeaders, "x-vercel-id"))) fail();

  if (status === 401) {
    noHeader(parsedHeaders, "location");
    return {
      healthPathProtected: true,
      status,
      responseKind: "unauthorized",
      result: "passed",
    };
  }

  assertSsoRedirect(
    exactlyOneHeader(parsedHeaders, "location"),
    input.requestedUrl,
  );
  return {
    healthPathProtected: true,
    status,
    responseKind: "sso_redirect",
    result: "passed",
  };
}

function parseCliOptions(argv: readonly string[]): CliOptions {
  const allowed = new Set(["status", "headers", "requested-url", "output"]);
  const values = new Map<string, string>();
  for (const argument of argv) {
    const match = /^--([a-z-]+)=(.*)$/.exec(argument);
    if (!match || !allowed.has(match[1]) || values.has(match[1]) || !match[2]) {
      fail();
    }
    values.set(match[1], match[2]);
  }
  if (values.size !== allowed.size) fail();
  return {
    status: values.get("status") ?? fail(),
    headers: values.get("headers") ?? fail(),
    requestedUrl: values.get("requested-url") ?? fail(),
    output: values.get("output") ?? fail(),
  };
}

async function readHeaderCapture(inputPath: string): Promise<string> {
  let handle;
  try {
    handle = await open(
      path.resolve(process.cwd(), inputPath),
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );
    const stats = await handle.stat();
    if (!stats.isFile() || stats.size <= 0 || stats.size > MAX_HEADER_BYTES) fail();
    const contents = await handle.readFile();
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(contents);
    } catch {
      return fail();
    }
  } catch {
    return fail();
  } finally {
    await handle?.close();
  }
}

export async function writeVercelProtectedHealthEvidence(input: {
  evidence: VercelProtectedHealthEvidence;
  output: string;
  repositoryRoot: string;
}): Promise<string> {
  const evidence: VercelProtectedHealthEvidence =
    input.evidence.healthPathProtected === true
    && input.evidence.result === "passed"
    && (
      (input.evidence.status === 401 && input.evidence.responseKind === "unauthorized")
      || (input.evidence.status === 302 && input.evidence.responseKind === "sso_redirect")
    )
      ? {
          healthPathProtected: true,
          status: input.evidence.status,
          responseKind: input.evidence.responseKind,
          result: "passed",
        }
      : fail();
  const destination = await prepareProtectedTemporaryJsonOutput({
    repositoryRoot: input.repositoryRoot,
    output: input.output,
  });
  await destination.write(`${JSON.stringify(evidence, null, 2)}\n`);
  return destination.outputPath;
}

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const evidence = verifyUnauthenticatedVercelHealthProbe({
    status: options.status,
    headers: await readHeaderCapture(options.headers),
    requestedUrl: options.requestedUrl,
  });
  await writeVercelProtectedHealthEvidence({
    evidence,
    output: options.output,
    repositoryRoot: process.cwd(),
  });
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) {
  withServerTask(
    {
      task: "vercel_protected_health_verification",
      operation: "verify_unauthenticated_probe",
    },
    main,
  ).catch(() => {
    process.exitCode = 1;
  });
}
