const SAFE_CACHE_NAMESPACE = /^[A-Za-z0-9._:-]{1,128}$/;

type CacheEnvironment = Record<string, string | undefined>;

/**
 * Keep persisted Next data-cache entries scoped to the database/deployment
 * target that produced them. This prevents a promoted build artifact (or an
 * isolated validation fixture) from serving records cached against a
 * different database without putting connection details into the cache key.
 */
export function resolveDataCacheNamespace(
  environment: CacheEnvironment = process.env,
): string {
  const configured = environment.DATA_CACHE_NAMESPACE?.trim();
  if (configured !== undefined && configured.length > 0) {
    if (!SAFE_CACHE_NAMESPACE.test(configured)) {
      throw new Error("DATA_CACHE_NAMESPACE must be a non-sensitive identifier using only letters, numbers, dot, underscore, colon, or hyphen.");
    }
    return configured;
  }

  const deploymentIdentifier = [
    environment.VERCEL_DEPLOYMENT_ID,
    environment.VERCEL_GIT_COMMIT_SHA,
    environment.GITHUB_SHA,
  ]
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value && SAFE_CACHE_NAMESPACE.test(value)));

  return deploymentIdentifier ?? "default";
}

export function dataCacheKeyParts(...parts: string[]): string[] {
  return ["infrasight", resolveDataCacheNamespace(), ...parts];
}
