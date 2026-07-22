import { afterEach, describe, expect, it, vi } from "vitest";

describe("Playwright NextAuth configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("serves NextAuth from the full application base-path endpoint", async () => {
    vi.stubEnv("E2E_PORT", "3199");
    vi.stubEnv("E2E_BASE_PATH", "/CustomBase");
    vi.stubEnv("E2E_DATABASE_URL", "");
    vi.stubEnv("PLAYWRIGHT_BASE_URL", "");

    const { default: config } = await import("../../playwright.config");
    const webServer = config.webServer;

    expect(webServer).toBeTruthy();
    expect(Array.isArray(webServer)).toBe(false);
    if (!webServer || Array.isArray(webServer)) throw new Error("Expected one local web server");

    expect(webServer.url).toBe("http://127.0.0.1:3199/CustomBase/tracker");
    expect(webServer.env?.NEXTAUTH_URL).toBe(
      "http://127.0.0.1:3199/CustomBase/api/auth",
    );
  });
});
