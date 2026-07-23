import { describe, expect, it } from "vitest";
import { resolveDataCacheNamespace } from "./data-cache-namespace";

describe("resolveDataCacheNamespace", () => {
  it("prefers unique deployment identity over an explicit namespace", () => {
    expect(resolveDataCacheNamespace({
      DATA_CACHE_NAMESPACE: "validation-failure:29965813266",
      VERCEL_DEPLOYMENT_ID: "deployment-fallback",
    })).toBe("deployment-fallback");
  });

  it("uses an explicit non-sensitive namespace when deployment identity is unavailable", () => {
    expect(resolveDataCacheNamespace({
      DATA_CACHE_NAMESPACE: "validation-failure:29965813266",
      VERCEL: "1",
    })).toBe("validation-failure:29965813266");
  });

  it("uses commit identity only outside a hosted runtime", () => {
    expect(resolveDataCacheNamespace({ VERCEL_GIT_COMMIT_SHA: "abc123" })).toBe("abc123");
  });

  it("fails closed on a hosted runtime without unique cache identity", () => {
    expect(() => resolveDataCacheNamespace({
      VERCEL: "1",
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_SHA: "abc123",
    })).toThrowError(/Hosted data caching requires/);
  });

  it("fails closed for production builds when Vercel system variables are unavailable", () => {
    expect(() => resolveDataCacheNamespace({
      NODE_ENV: "production",
      VERCEL_GIT_COMMIT_SHA: "abc123",
    })).toThrowError(/Hosted data caching requires/);
  });

  it("uses a deterministic build-only namespace for an ordinary clean build", () => {
    expect(resolveDataCacheNamespace({
      NODE_ENV: "production",
      NEXT_PHASE: "phase-production-build",
    })).toBe("build");
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
