import { describe, expect, it } from "vitest";
import { resolvePlaywrightCacheNamespace } from "./playwright-cache-namespace";

describe("Playwright data-cache namespaces", () => {
  it("does not collide across two local config resolutions on the same port", () => {
    const first = resolvePlaywrightCacheNamespace({}, 3100);
    const second = resolvePlaywrightCacheNamespace({}, 3100);

    expect(first).toMatch(/^e2e-local-3100-[0-9a-f-]{36}$/);
    expect(second).toMatch(/^e2e-local-3100-[0-9a-f-]{36}$/);
    expect(second).not.toBe(first);
  });

  it("keeps explicit and GitHub run namespaces deterministic", () => {
    expect(resolvePlaywrightCacheNamespace({ DATA_CACHE_NAMESPACE: "reviewed-run" }, 3100))
      .toBe("reviewed-run");
    expect(resolvePlaywrightCacheNamespace({
      GITHUB_RUN_ID: "123",
      GITHUB_RUN_ATTEMPT: "2",
    }, 3100)).toBe("e2e-123-2");
  });
});
