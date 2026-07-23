const SAFE_CACHE_NAMESPACE = /^[A-Za-z0-9._:-]{1,128}$/;

type CacheEnvironment = Record<string, string | undefined>;

/**
 * Scope persisted Next data-cache entries to the deployment or database
 * fixture that produced them without ever putting connection details in a
 * cache key. DATA_CACHE_NAMESPACE is an opaque, non-sensitive identifier;
 * URLs and other free-form values fail closed.
 */
export function resolveDataCacheNamespace(
  environment: CacheEnvironment = process.env,
): string {
  const configured = environment.DATA_CACHE_NAMESPACE?.trim();
  if (configured) {
    if (!SAFE_CACHE_NAMESPACE.test(configured)) {
      throw new Error(
        "DATA_CACHE_NAMESPACE must be a non-sensitive identifier using only letters, numbers, dot, underscore, colon, or hyphen.",
      );
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
