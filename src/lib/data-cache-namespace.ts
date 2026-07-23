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
  const deploymentId = environment.VERCEL_DEPLOYMENT_ID?.trim();
  if (deploymentId) {
    if (!SAFE_CACHE_NAMESPACE.test(deploymentId)) {
      throw new Error("VERCEL_DEPLOYMENT_ID must be a non-sensitive identifier using only letters, numbers, dot, underscore, colon, or hyphen.");
    }
    return deploymentId;
  }

  const configured = environment.DATA_CACHE_NAMESPACE?.trim();
  if (configured !== undefined && configured.length > 0) {
    if (!SAFE_CACHE_NAMESPACE.test(configured)) {
      throw new Error("DATA_CACHE_NAMESPACE must be a non-sensitive identifier using only letters, numbers, dot, underscore, colon, or hyphen.");
    }
    return configured;
  }

  const localIdentifier = [
    environment.VERCEL_GIT_COMMIT_SHA,
    environment.GITHUB_SHA,
  ]
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value && SAFE_CACHE_NAMESPACE.test(value)));

  // `next build` may evaluate cache declarations without running a hosted
  // request. No public database page is statically rendered, so this bounded
  // build-only namespace cannot carry records into a runtime cache.
  if (environment.NEXT_PHASE === "phase-production-build") {
    return localIdentifier ?? "build";
  }

  // A commit SHA is not a sufficient hosted namespace: Preview validation and
  // Production can deploy the same SHA against different databases. Hosted
  // runtimes therefore require a unique deployment ID or an explicit
  // non-sensitive namespace.
  if (
    environment.NODE_ENV === "production"
    || environment.VERCEL === "1"
    || environment.VERCEL_ENV?.trim()
  ) {
    throw new Error("Hosted data caching requires VERCEL_DEPLOYMENT_ID or DATA_CACHE_NAMESPACE.");
  }

  return localIdentifier ?? "default";
}

export function dataCacheKeyParts(...parts: string[]): string[] {
  return ["infrasight", resolveDataCacheNamespace(), ...parts];
}
