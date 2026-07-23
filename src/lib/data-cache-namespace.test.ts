import { describe, expect, it } from "vitest";
import {
  dataCacheKeyParts,
  resolveDataCacheNamespace,
} from "@/lib/data-cache-namespace";

describe("resolveDataCacheNamespace", () => {
  it("prefers an explicit non-sensitive cache namespace", () => {
    expect(resolveDataCacheNamespace({
      DATA_CACHE_NAMESPACE: "preview:phase4-29965813266",
      VERCEL_DEPLOYMENT_ID: "deployment-fallback",
    })).toBe("preview:phase4-29965813266");
  });

  it("falls back through deployment identities", () => {
    expect(resolveDataCacheNamespace({
      VERCEL_GIT_COMMIT_SHA: "abc123",
      GITHUB_SHA: "def456",
    })).toBe("abc123");
  });

  it("does not derive a namespace from database or application secrets", () => {
    expect(resolveDataCacheNamespace({
      DATABASE_URL: "postgresql://user:password@example.com/database",
      NEXTAUTH_SECRET: "do-not-cache-me",
    })).toBe("default");
  });

  it("rejects unsafe explicit values without reflecting them", () => {
    const unsafe = "postgresql://user:password@example.com/database";
    expect(() => resolveDataCacheNamespace({ DATA_CACHE_NAMESPACE: unsafe }))
      .toThrowError(/non-sensitive identifier/);
    try {
      resolveDataCacheNamespace({ DATA_CACHE_NAMESPACE: unsafe });
    } catch (error) {
      expect(String(error)).not.toContain(unsafe);
    }
  });

  it("builds deterministic cache key parts without secret-bearing inputs", () => {
    expect(dataCacheKeyParts("deals", "list").slice(0, 1)).toEqual(["infrasight"]);
  });
});
