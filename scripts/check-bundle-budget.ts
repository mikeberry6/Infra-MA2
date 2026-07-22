import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { measurePublicRouteBundles } from "./bundle-budget.ts";
import { withServerTask } from "../src/lib/server-log.ts";

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const buildDir = option("build-dir") ?? ".next";
  const output = option("output");
  const results = await measurePublicRouteBundles({ buildDir });
  for (const result of results) {
    console.log(
      `${result.passed ? "OK" : "FAIL"} ${result.route}: `
      + `${(result.gzipBytes / 1_000).toFixed(1)} kB gzip / `
      + `${(result.budgetBytes / 1_000).toFixed(1)} kB budget `
      + `(${result.chunks.length} chunks)`,
    );
  }

  if (output) {
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, `${JSON.stringify({
      version: 1,
      generatedAt: new Date().toISOString(),
      compression: "gzip",
      buildDir,
      results,
    }, null, 2)}\n`);
  }

  const failures = results.filter((result) => !result.passed);
  if (failures.length > 0) {
    throw new Error(`Public JavaScript bundle budget exceeded for: ${failures.map((result) => result.route).join(", ")}`);
  }
}

withServerTask({ task: "bundle_budget", operation: "check_public_bundle_budget" }, main).catch(() => {
  process.exitCode = 1;
});
