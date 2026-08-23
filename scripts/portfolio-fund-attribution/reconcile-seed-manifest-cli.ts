#!/usr/bin/env npx tsx
import { access, open, readFile, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { companies } from "../../prisma/seed-data/companies";
import { reconcileSeedAttributionManifest } from "./reconcile-seed-manifest";

function options(argv: string[]): Map<string, string> {
  return new Map(argv.map((argument) => {
    const separator = argument.indexOf("=");
    if (!argument.startsWith("--") || separator < 0) throw new Error(`Expected --name=value, received ${argument}`);
    return [argument.slice(2, separator), argument.slice(separator + 1)];
  }));
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`--${name}=... is required`);
  return value;
}

async function json(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), "utf8"));
}

async function atomicWrite(path: string, value: unknown, force: boolean): Promise<void> {
  const absolute = resolve(path);
  if (!force) {
    try {
      await access(absolute);
      throw new Error(`Refusing to overwrite ${path} without --force=true`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Refusing to overwrite")) throw error;
    }
  }
  const temporary = `${absolute}.next-${process.pid}-${Date.now()}`;
  const handle = await open(temporary, "wx", 0o600);
  try {
    await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(temporary, absolute);
  const directory = await open(dirname(absolute), "r");
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
}

async function main(): Promise<void> {
  const values = options(process.argv.slice(2));
  const sourcePath = required(values, "source");
  const specPath = required(values, "spec");
  const outputPath = required(values, "output");
  const artifactPath = required(values, "artifact");
  if (resolve(outputPath) === resolve(artifactPath)) throw new Error("Manifest and reconciliation artifact paths must differ");
  const result = reconcileSeedAttributionManifest({
    sourceManifest: await json(sourcePath),
    spec: await json(specPath),
    evaluatedCompanies: companies,
  });
  const force = values.get("force") === "true";
  await atomicWrite(artifactPath, result.artifact, force);
  await atomicWrite(outputPath, result.manifest, force);
  console.log(JSON.stringify({
    output: outputPath,
    artifact: artifactPath,
    recordCount: result.manifest.recordCount,
    manifestSha256: result.manifest.manifestSha256,
    reconciliationSha256: result.artifact.reconciliationSha256,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
