import { gzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const PUBLIC_JAVASCRIPT_BUDGET_BYTES = 150_000;

export const PUBLIC_ROUTE_BUDGETS: Readonly<Record<string, number>> = {
  "/tracker/page": PUBLIC_JAVASCRIPT_BUDGET_BYTES,
  "/funds/page": PUBLIC_JAVASCRIPT_BUDGET_BYTES,
  "/portfolio/page": PUBLIC_JAVASCRIPT_BUDGET_BYTES,
};

type AppBuildManifest = {
  pages?: Record<string, string[]>;
};

export type RouteBundleResult = {
  route: string;
  budgetBytes: number;
  rawBytes: number;
  gzipBytes: number;
  chunks: string[];
  passed: boolean;
};

function resolveBuildAsset(buildDir: string, asset: string): string {
  const buildRoot = path.resolve(buildDir);
  const assetPath = path.resolve(buildRoot, asset);
  if (assetPath !== buildRoot && !assetPath.startsWith(`${buildRoot}${path.sep}`)) {
    throw new Error(`Build manifest asset escapes the build directory: ${asset}`);
  }
  return assetPath;
}
export async function measurePublicRouteBundles({
  buildDir = ".next",
  routeBudgets = PUBLIC_ROUTE_BUDGETS,
}: {
  buildDir?: string;
  routeBudgets?: Readonly<Record<string, number>>;
} = {}): Promise<RouteBundleResult[]> {
  const manifestPath = path.join(buildDir, "app-build-manifest.json");
  let manifest: AppBuildManifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8")) as AppBuildManifest;
  } catch (error) {
    throw new Error(`Unable to read ${manifestPath}. Run the production build first.`, { cause: error });
  }

  if (!manifest.pages || typeof manifest.pages !== "object") {
    throw new Error(`${manifestPath} does not contain an App Router pages manifest.`);
  }

  return Promise.all(Object.entries(routeBudgets).map(async ([route, budgetBytes]) => {
    if (!Number.isSafeInteger(budgetBytes) || budgetBytes <= 0) {
      throw new Error(`Bundle budget for ${route} must be a positive integer.`);
    }
    const chunks = Array.from(new Set(manifest.pages?.[route] ?? []))
      .filter((asset) => asset.endsWith(".js"));
    if (chunks.length === 0) {
      throw new Error(`No JavaScript chunks were found for ${route} in ${manifestPath}.`);
    }

    const payloads = await Promise.all(chunks.map(async (chunk) => {
      const source = await readFile(resolveBuildAsset(buildDir, chunk));
      return { rawBytes: source.byteLength, gzipBytes: gzipSync(source).byteLength };
    }));
    const rawBytes = payloads.reduce((sum, payload) => sum + payload.rawBytes, 0);
    const gzipBytes = payloads.reduce((sum, payload) => sum + payload.gzipBytes, 0);
    return {
      route,
      budgetBytes,
      rawBytes,
      gzipBytes,
      chunks,
      passed: gzipBytes <= budgetBytes,
    };
  }));
}
