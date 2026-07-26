#!/usr/bin/env node

import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  databaseUrlSecretRepresentations,
} from "./assert-playwright-artifact-secret-safety.ts";

const ENVIRONMENT_NAME = /^[A-Z][A-Z0-9_]{0,127}$/;
const SAFE_FAILURE = "Database secret mask registration failed.";

export function escapeGithubCommandData(value: string): string {
  return value
    .replaceAll("%", "%25")
    .replaceAll("\r", "%0D")
    .replaceAll("\n", "%0A");
}

export function databaseSecretMaskCommands(
  databaseUrls: readonly string[],
): string[] {
  const representations = new Map<string, string>();
  try {
    for (const databaseUrl of databaseUrls) {
      for (const representation of databaseUrlSecretRepresentations(databaseUrl)) {
        const value = representation.toString("utf8");
        representations.set(representation.toString("base64"), value);
      }
    }
  } catch {
    throw new Error(SAFE_FAILURE);
  }
  return [...representations.values()].map(
    (value) => `::add-mask::${escapeGithubCommandData(value)}`,
  );
}

function databaseUrlEnvironmentNames(argv: readonly string[]): string[] {
  const names: string[] = [];
  for (const argument of argv) {
    const prefix = "--database-url-env=";
    if (!argument.startsWith(prefix)) throw new Error(SAFE_FAILURE);
    const name = argument.slice(prefix.length);
    if (!ENVIRONMENT_NAME.test(name)) throw new Error(SAFE_FAILURE);
    names.push(name);
  }
  if (names.length === 0) throw new Error(SAFE_FAILURE);
  return [...new Set(names)];
}

export function registerGithubDatabaseSecretMasks(input: {
  argv: readonly string[];
  environment?: NodeJS.ProcessEnv;
  write?: (value: string) => void;
}): void {
  const environment = input.environment ?? process.env;
  const write = input.write ?? ((value) => process.stdout.write(value));
  const names = databaseUrlEnvironmentNames(input.argv);
  const urls = names.map((name) => environment[name] ?? "");
  const commands = databaseSecretMaskCommands(urls);
  // Derive and validate every representation before emitting anything. A
  // malformed later URL therefore cannot leave the runner partially masked.
  for (const command of commands) write(`${command}\n`);
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) {
  try {
    registerGithubDatabaseSecretMasks({ argv: process.argv.slice(2) });
  } catch {
    console.error(SAFE_FAILURE);
    process.exitCode = 1;
  }
}
