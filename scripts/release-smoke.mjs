#!/usr/bin/env node

import { execFile as execFileCallback } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

function option(name, fallback) {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

const baseUrl = option("base-url");
const basePath = option("base-path", "/Infra-MA2").replace(/\/$/, "");
const expectedVersion = option("expected-version");
const outputPath = option("output", "tmp/release-smoke.json");
const skipHealth = process.argv.includes("--skip-health");
const allowLegacyRoot = process.argv.includes("--allow-legacy-root");
const transport = option("transport", "fetch");
if (!baseUrl) {
  console.error("--base-url is required.");
  process.exit(2);
}
if (expectedVersion && !/^[0-9a-f]{40}$/.test(expectedVersion)) {
  console.error("--expected-version must be a full lowercase 40-character Git SHA.");
  process.exit(2);
}

const origin = new URL(baseUrl).origin;
const checks = [];
if (!new Set(["fetch", "vercel-cli"]).has(transport)) {
  console.error("--transport must be fetch or vercel-cli.");
  process.exit(2);
}
if (transport === "vercel-cli" && (!process.env.VERCEL_CLI_CWD || !process.env.VERCEL_TOKEN || !process.env.VERCEL_SCOPE)) {
  console.error("VERCEL_CLI_CWD, VERCEL_TOKEN, and VERCEL_SCOPE are required for the Vercel CLI transport.");
  process.exit(2);
}

const redirectStatuses = new Set([301, 302, 303, 307, 308]);

async function vercelCliRequest(url) {
  const parsed = new URL(url);
  if (parsed.origin !== origin) throw new Error(`Refusing Vercel CLI request outside candidate origin: ${parsed.origin}`);
  const requestPath = `${parsed.pathname}${parsed.search}`;
  const requestDir = await mkdtemp(path.join(tmpdir(), "release-smoke-"));
  const headersPath = path.join(requestDir, "headers.txt");
  const bodyPath = path.join(requestDir, "body.txt");
  const marker = "__RELEASE_SMOKE__";
  try {
    const { stdout } = await execFile("npx", [
      "--yes", "vercel@51.7.0", "curl", requestPath,
      "--deployment", origin,
      "--yes",
      "--cwd", process.env.VERCEL_CLI_CWD,
      "--scope", process.env.VERCEL_SCOPE,
      "--token", process.env.VERCEL_TOKEN,
      "--",
      "--silent", "--show-error", "--connect-timeout", "10", "--max-time", "20", "--max-redirs", "0",
      "--dump-header", headersPath,
      "--output", bodyPath,
      "--write-out", `\n${marker}%{http_code}\t%{url_effective}\n`,
    ], { maxBuffer: 4 * 1024 * 1024, timeout: 45_000 });
    const matches = [...stdout.matchAll(new RegExp(`${marker}(\\d{3})\\t([^\\r\\n]+)`, "g"))];
    const match = matches.at(-1);
    if (!match) throw new Error("Vercel CLI transport did not return HTTP metadata.");
    const rawHeaders = await readFile(headersPath, "utf8");
    const body = await readFile(bodyPath, "utf8");
    const location = rawHeaders.match(/^location:\s*(.+)$/im)?.[1]?.trim() ?? null;
    return {
      status: Number(match[1]),
      url: match[2],
      location,
      async json() { return JSON.parse(body); },
      async text() { return body; },
    };
  } finally {
    await rm(requestDir, { recursive: true, force: true });
  }
}

async function fetchViaVercelCli(url) {
  let currentUrl = url;
  for (let redirectCount = 0; redirectCount <= 10; redirectCount += 1) {
    const response = await vercelCliRequest(currentUrl);
    if (!redirectStatuses.has(response.status) || !response.location) return response;
    const nextUrl = new URL(response.location, currentUrl);
    if (nextUrl.origin !== origin) throw new Error(`Refusing cross-origin redirect to ${nextUrl.origin}.`);
    currentUrl = nextUrl.toString();
  }
  throw new Error("Candidate exceeded 10 same-origin redirects.");
}

async function fetchWithRetry(url, init = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = transport === "vercel-cli"
        ? await fetchViaVercelCli(url)
        : await fetch(url, { ...init, redirect: "follow", signal: AbortSignal.timeout(20_000) });
      if (response.status < 500 || attempt === 3) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === 3) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 2_000));
  }
  throw lastError;
}

function urlFor(route) {
  return new URL(`${basePath}${route}`, origin).toString();
}

function pathMatches(actualPath, expectedPath) {
  return actualPath === expectedPath || (expectedPath !== "/" && actualPath === `${expectedPath}/`);
}

async function statusCheck(name, route, expectedStatus, expectedPaths = [`${basePath}${route}`]) {
  const startedAt = performance.now();
  const response = await fetchWithRetry(urlFor(route));
  const result = {
    name,
    route,
    expectedStatus,
    actualStatus: response.status,
    durationMs: Math.round(performance.now() - startedAt),
    finalUrl: response.url,
    passed: response.status === expectedStatus
      && new URL(response.url).origin === origin
      && expectedPaths.some((expectedPath) => pathMatches(new URL(response.url).pathname, expectedPath)),
  };
  checks.push(result);
  return response;
}

async function contentCheck(
  name,
  route,
  requiredContent,
  expectedPaths = [`${basePath}${route}`],
) {
  const response = await statusCheck(name, route, 200, expectedPaths);
  const check = checks.at(-1);
  const expectedContent = Array.isArray(requiredContent) ? requiredContent : [requiredContent];
  try {
    const body = await response.text();
    check.expectedContent = expectedContent;
    check.missingContent = expectedContent.filter((value) => !body.includes(value));
    check.dataUnavailablePresent = body.includes("Data unavailable");
    check.passed &&= check.missingContent.length === 0 && !check.dataUnavailablePresent;
  } catch {
    check.expectedContent = expectedContent;
    check.missingContent = expectedContent;
    check.dataUnavailablePresent = null;
    check.passed = false;
  }
}

const rootPaths = [`${basePath}/tracker`];
if (allowLegacyRoot) rootPaths.push(basePath);
await contentCheck("canonical root", "/", "Infrastructure Deal Tape", rootPaths);

for (const [route, expectedText] of [
  ["/tracker", ["Infrastructure Deal Tape", "data-deal-row-trigger"]],
  ["/funds", [
    "Infrastructure Fund Database",
    allowLegacyRoot ? " fund details\"" : "data-fund-row-trigger",
  ]],
  ["/portfolio", [
    "Infrastructure Portfolio Company Database",
    allowLegacyRoot ? " company details\"" : "data-company-row-trigger",
  ]],
  ["/news", "Daily Intelligence Feed"],
  ["/dashboard", "M&amp;A Conditions Dashboard"],
]) {
  await contentCheck(`public ${route}`, route, expectedText);
}

for (const route of ["/search", "/earnings", "/login"]) {
  await statusCheck(`public ${route}`, route, 200);
}

await statusCheck("anonymous deal export denied", "/api/exports/deals", 403);
let health = null;
if (!skipHealth) {
  const healthResponse = await statusCheck("service health", "/api/health", 200);
  try {
    health = await healthResponse.json();
  } catch {
    checks.at(-1).passed = false;
  }
  if (health) {
    checks.at(-1).passed &&= health.status === "healthy" && health.database === "connected";
    if (expectedVersion) checks.at(-1).passed &&= health.version === expectedVersion;
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  origin,
  basePath,
  expectedVersion: expectedVersion ?? null,
  healthCheckSkipped: skipHealth,
  legacyRootAllowed: allowLegacyRoot,
  transport,
  passed: checks.every((check) => check.passed),
  health,
  checks,
};
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
for (const check of checks) {
  console.log(`${check.passed ? "PASS" : "FAIL"} ${check.name}: ${check.actualStatus} in ${check.durationMs}ms`);
}
if (!report.passed) process.exitCode = 1;
