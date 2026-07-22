#!/usr/bin/env node

import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const separator = args.indexOf("--");
if (separator < 0 || separator === args.length - 1) {
  console.error("Usage: node scripts/run-with-retry.mjs [--attempts=3] [--base-delay-ms=10000] -- command [args...]");
  process.exit(2);
}

function numberOption(name, fallback) {
  const prefix = `--${name}=`;
  const raw = args.slice(0, separator).find((value) => value.startsWith(prefix))?.slice(prefix.length);
  const parsed = raw === undefined ? fallback : Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    console.error(`${name} must be a positive number.`);
    process.exit(2);
  }
  return Math.floor(parsed);
}

const maxAttempts = numberOption("attempts", 3);
const baseDelayMs = numberOption("base-delay-ms", 10_000);
const [command, ...commandArgs] = args.slice(separator + 1);
const transientPattern = /(?:ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|ENETUNREACH|socket hang up|network error|fetch failed|timed? out|temporarily unavailable|rate.?limit|\b429\b|\b50[234]\b|\bP10(?:01|02|17)\b)/i;

function runOnce() {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      env: process.env,
      shell: false,
      stdio: ["inherit", "pipe", "pipe"],
    });
    let tail = "";
    const collect = (stream, destination) => {
      stream.on("data", (chunk) => {
        destination.write(chunk);
        tail = `${tail}${chunk.toString("utf8")}`.slice(-65_536);
      });
    };
    collect(child.stdout, process.stdout);
    collect(child.stderr, process.stderr);
    child.on("error", reject);
    child.on("close", (code, signal) => resolve({ code: code ?? 1, signal, tail }));
  });
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  if (attempt > 1) console.log(`Retry attempt ${attempt}/${maxAttempts}.`);
  const result = await runOnce();
  if (result.code === 0) process.exit(0);
  if (result.signal) {
    console.error(`Command terminated by signal ${result.signal}; not retrying.`);
    process.exit(result.code);
  }
  const transient = transientPattern.test(result.tail);
  if (!transient || attempt === maxAttempts) {
    console.error(
      transient
        ? `Transient command failure persisted after ${attempt} attempt(s).`
        : "Command failed deterministically; not retrying.",
    );
    process.exit(result.code);
  }
  const delayMs = Math.min(baseDelayMs * 2 ** (attempt - 1), 30_000);
  console.warn(`Transient failure detected; retrying in ${delayMs}ms.`);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
