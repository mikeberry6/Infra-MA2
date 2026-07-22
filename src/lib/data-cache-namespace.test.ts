import { describe, expect, it } from "vitest";
import { resolveDataCacheNamespace } from "./data-cache-namespace";

describe("resolveDataCacheNamespace", () => {
  it("prefers an explicit non-sensitive cache namespace", () => {
    expect(resolveDataCacheNamespace({
      DATA_CACHE_NAMESPACE: "validation-failure:29965813266",
      VERCEL_DEPLOYMENT_ID: "deployment-fallback",
    })).toBe("validation-failure:29965813266");
  });

  it("uses deployment identity when no explicit namespace is configured", () => {
    expect(resolveDataCacheNamespace({ VERCEL_GIT_COMMIT_SHA: "abc123" })).toBe("abc123");
  });

  it("uses a deterministic local default without connection details", () => {
    expect(resolveDataCacheNamespace({})).toBe("default");
  });

  it("rejects unsafe or secret-like free-form identifiers without echoing them", () => {
    const unsafe = "postgresql://user:password@example.com/database";
    expect(() => resolveDataCacheNamespace({ DATA_CACHE_NAMESPACE: unsafe }))
      .toThrowError(/DATA_CACHE_NAMESPACE must be a non-sensitive identifier/);
    try {
      resolveDataCacheNamespace({ DATA_CACHE_NAMESPACE: unsafe });
    } catch (error) {
      expect(String(error)).not.toContain(unsafe);
    }
  });
});
