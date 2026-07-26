import { afterEach, describe, expect, it, vi } from "vitest";

describe("callback URL validation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("accepts application-relative paths and rejects external or protocol-relative redirects", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/Infra-MA2");
    vi.resetModules();
    const { normalizeBasePathCallback, normalizeNextAuthRedirect } = await import("./base-path");
    expect(normalizeBasePathCallback("/admin/deals")).toBe("/Infra-MA2/admin/deals");
    expect(normalizeBasePathCallback("https://attacker.example/phish")).toBe("/Infra-MA2/");
    expect(normalizeBasePathCallback("//attacker.example/phish")).toBe("/Infra-MA2/");
    expect(normalizeBasePathCallback("/\\attacker.example/phish")).toBe("/Infra-MA2/");
    expect(normalizeNextAuthRedirect("/admin/deals", "https://infrasight.example")).toBe(
      "https://infrasight.example/Infra-MA2/admin/deals",
    );
    expect(
      normalizeNextAuthRedirect(
        "https://infrasight.example/Infra-MA2/admin/deals",
        "https://infrasight.example",
      ),
    ).toBe("https://infrasight.example/Infra-MA2/admin/deals");
    expect(normalizeNextAuthRedirect("https://attacker.example/phish", "https://infrasight.example")).toBe(
      "https://infrasight.example/Infra-MA2/",
    );
    expect(normalizeNextAuthRedirect("//attacker.example/phish", "https://infrasight.example")).toBe(
      "https://infrasight.example/Infra-MA2/",
    );
    expect(normalizeNextAuthRedirect("/\\attacker.example/phish", "https://infrasight.example")).toBe(
      "https://infrasight.example/Infra-MA2/",
    );
  });
});
