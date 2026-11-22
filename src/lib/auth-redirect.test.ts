import { describe, expect, it } from "vitest";
import { normalizeLoginCallback, normalizeNextAuthRedirect } from "./auth-redirect";

describe("login callbacks", () => {
  const origin = "https://infrasight.example";

  it("preserves local return paths, query strings and fragments", () => {
    const path = "/admin/deals?status=draft#recent";
    expect(normalizeLoginCallback(path)).toBe(path);
    expect(normalizeNextAuthRedirect(path, origin)).toBe(origin + path);
    expect(normalizeNextAuthRedirect(origin + path, origin)).toBe(origin + path);
  });

  it("accepts bookmarks and same-origin callbacks from the previous deployment", () => {
    expect(normalizeLoginCallback("/Infra-MA2")).toBe("/");
    expect(normalizeLoginCallback("/Infra-MA2/admin?from=login")).toBe("/admin?from=login");
    expect(normalizeNextAuthRedirect(origin + "/Infra-MA2/admin", origin)).toBe(origin + "/admin");
    expect(normalizeLoginCallback("/Infra-MA2-other")).toBe("/Infra-MA2-other");
  });

  it("keeps invalid and external redirects on the site", () => {
    for (const input of [undefined, "https://outside.example", "//outside.example", "/\\outside.example", "/Infra-MA2//outside.example"]) {
      expect(normalizeLoginCallback(input)).toBe("/");
      expect(normalizeNextAuthRedirect(input, origin)).toBe(origin + "/");
    }
  });
});
