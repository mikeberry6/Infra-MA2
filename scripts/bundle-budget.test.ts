import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { measurePublicRouteBundles } from "./bundle-budget.ts";

const temporaryDirectories: string[] = [];

async function buildFixture(pages: Record<string, string[]>) {
  const buildDir = await mkdtemp(path.join(os.tmpdir(), "infrasight-bundle-budget-"));
  temporaryDirectories.push(buildDir);
  await mkdir(path.join(buildDir, "static", "chunks"), { recursive: true });
  await writeFile(path.join(buildDir, "static", "chunks", "shared.js"), "const shared = 'shared';\n");
  await writeFile(path.join(buildDir, "static", "chunks", "route.js"), "const route = 'route';\n");
  await writeFile(path.join(buildDir, "app-build-manifest.json"), JSON.stringify({ pages }));
  return buildDir;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, {
    recursive: true,
    force: true,
  })));
});

describe("measurePublicRouteBundles", () => {
  it("deduplicates chunks and reports ok, warning, and failed status", async () => {
    const route = "/tracker/page";
    const buildDir = await buildFixture({
      [route]: ["static/chunks/shared.js", "static/chunks/shared.js", "static/chunks/route.js"],
    });
    const baseline = await measurePublicRouteBundles({
      buildDir,
      routeBudgets: { [route]: 10_000 },
      warningBytes: 9_000,
    });
    expect(baseline[0]).toMatchObject({ route, status: "ok", passed: true });
    expect(baseline[0]?.chunks).toHaveLength(2);

    const gzipBytes = baseline[0]?.gzipBytes ?? 1;
    const warning = await measurePublicRouteBundles({
      buildDir,
      routeBudgets: { [route]: gzipBytes + 1 },
      warningBytes: gzipBytes - 1,
    });
    expect(warning[0]).toMatchObject({ status: "warning", passed: true });

    const failed = await measurePublicRouteBundles({
      buildDir,
      routeBudgets: { [route]: gzipBytes - 1 },
      warningBytes: gzipBytes - 2,
    });
    expect(failed[0]).toMatchObject({ status: "failed", passed: false });
  });

  it("fails closed when a required route is absent", async () => {
    const buildDir = await buildFixture({});
    await expect(measurePublicRouteBundles({
      buildDir,
      routeBudgets: { "/portfolio/page": 150_000 },
    })).rejects.toThrow("No JavaScript chunks were found");
  });

  it("rejects manifest assets outside the build directory", async () => {
    const route = "/funds/page";
    const buildDir = await buildFixture({ [route]: ["../outside.js"] });
    await expect(measurePublicRouteBundles({
      buildDir,
      routeBudgets: { [route]: 150_000 },
    })).rejects.toThrow("escapes the build directory");
  });
});
