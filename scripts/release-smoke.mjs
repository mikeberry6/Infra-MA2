#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

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
  console.error("--expected-version must be a full lowercase Git SHA.");
  process.exit(2);
}

const origin = new URL(baseUrl).origin;
const checks = [];
if (!new Set(["fetch", "vercel-bypass"]).has(transport)) {
  console.error("--transport must be fetch or vercel-bypass.");
  process.exit(2);
}
const protectionBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
if (
  transport === "vercel-bypass"
  && (!protectionBypass || protectionBypass.length < 16 || /[\r\n]/.test(protectionBypass))
) {
  console.error("VERCEL_AUTOMATION_BYPASS_SECRET is required for the Vercel bypass transport.");
  process.exit(2);
}

const redirectStatuses = new Set([301, 302, 303, 307, 308]);

async function fetchViaVercelBypass(url, init) {
  let currentUrl = url;
  for (let redirectCount = 0; redirectCount <= 10; redirectCount += 1) {
    if (new URL(currentUrl).origin !== origin) {
      throw new Error(`Refusing Vercel bypass request outside candidate origin: ${new URL(currentUrl).origin}`);
    }
    const headers = new Headers(init.headers);
    headers.set("x-vercel-protection-bypass", protectionBypass);
    const response = await fetch(currentUrl, {
      ...init,
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
    const location = response.headers.get("location");
    if (!redirectStatuses.has(response.status) || !location) return response;
    const nextUrl = new URL(location, currentUrl);
    if (nextUrl.origin !== origin) throw new Error(`Refusing cross-origin redirect to ${nextUrl.origin}.`);
    currentUrl = nextUrl.toString();
  }
  throw new Error("Candidate exceeded 10 same-origin redirects.");
}

async function fetchWithRetry(url, init = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = transport === "vercel-bypass"
        ? await fetchViaVercelBypass(url, init)
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

const HEALTH_KEYS = [
  "database",
  "generatedAt",
  "generationTimeMs",
  "pipelines",
  "status",
  "version",
];
const PIPELINE_KEYS = [
  "lastAttemptAt",
  "lastSuccessfulAt",
  "name",
  "status",
];
const CRITICAL_PIPELINES = new Set(["DASHBOARD_SYNC", "NEWS_SCAN"]);

function isIsoTimestamp(value) {
  return typeof value === "string"
    && !Number.isNaN(Date.parse(value))
    && new Date(value).toISOString() === value;
}

function isPassingPipeline(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(PIPELINE_KEYS)) return false;
  if (!CRITICAL_PIPELINES.has(value.name)) return false;
  if (!isIsoTimestamp(value.lastAttemptAt)) return false;
  if (!isIsoTimestamp(value.lastSuccessfulAt)) return false;
  return value.status === "healthy" || value.status === "running";
}

function isHealthyEnvelope(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(HEALTH_KEYS)) return false;
  if (value.status !== "healthy" || value.database !== "connected") return false;
  if (value.version !== "local" && !/^[0-9a-f]{12}$/.test(value.version)) return false;
  if (!isIsoTimestamp(value.generatedAt)) return false;
  if (!Number.isFinite(value.generationTimeMs) || value.generationTimeMs < 0) return false;
  if (!Array.isArray(value.pipelines) || value.pipelines.length !== CRITICAL_PIPELINES.size) return false;
  if (!value.pipelines.every(isPassingPipeline)) return false;
  return new Set(value.pipelines.map((pipeline) => pipeline.name)).size === CRITICAL_PIPELINES.size;
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

const rootPaths = [`${basePath}/tracker`];
if (allowLegacyRoot) rootPaths.push(basePath);
await statusCheck("canonical root", "/", 200, rootPaths);

for (const route of ["/tracker", "/funds", "/portfolio", "/news", "/dashboard", "/search", "/earnings", "/login"]) {
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
    checks.at(-1).passed &&= isHealthyEnvelope(health);
    if (expectedVersion) checks.at(-1).passed &&= health.version === expectedVersion.slice(0, 12);
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  origin,
  basePath,
  expectedVersion: expectedVersion?.slice(0, 12) ?? null,
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
