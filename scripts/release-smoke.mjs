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
if (!baseUrl) {
  console.error("--base-url is required.");
  process.exit(2);
}

const origin = new URL(baseUrl).origin;
const checks = [];

async function fetchWithRetry(url, init = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { ...init, redirect: "follow", signal: AbortSignal.timeout(20_000) });
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

async function statusCheck(name, route, expectedStatus) {
  const startedAt = performance.now();
  const response = await fetchWithRetry(urlFor(route));
  const result = {
    name,
    route,
    expectedStatus,
    actualStatus: response.status,
    durationMs: Math.round(performance.now() - startedAt),
    finalUrl: response.url,
    passed: response.status === expectedStatus,
  };
  checks.push(result);
  return response;
}

const root = await statusCheck("canonical root", "/", 200);
if (!allowLegacyRoot) {
  checks.at(-1).passed &&= new URL(root.url).pathname === `${basePath}/tracker`;
}

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
    checks.at(-1).passed &&= health.status === "healthy" && health.database === "connected";
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
