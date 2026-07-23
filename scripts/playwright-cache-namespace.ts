import { randomUUID } from "node:crypto";

type CacheNamespaceEnvironment = Record<string, string | undefined>;

/**
 * CI runs remain reproducible for a workflow attempt; each local Playwright
 * config load gets a unique cache namespace even when it reuses the same port.
 */
export function resolvePlaywrightCacheNamespace(
  environment: CacheNamespaceEnvironment,
  port: number,
  localNonce = randomUUID(),
): string {
  if (environment.DATA_CACHE_NAMESPACE) return environment.DATA_CACHE_NAMESPACE;
  if (environment.GITHUB_RUN_ID) {
    return `e2e-${environment.GITHUB_RUN_ID}-${environment.GITHUB_RUN_ATTEMPT || "1"}`;
  }
  return `e2e-local-${port}-${localNonce}`;
}
