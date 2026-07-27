import { describe, expect, it } from "vitest";
import {
  normalizeAdminEmail,
  validateAdminEmail,
  validateAdminPassword,
} from "./admin-credentials";

describe("administrator credential validation", () => {
  it("normalizes email addresses", () => {
    expect(normalizeAdminEmail("  ADMIN@Example.COM ")).toBe("admin@example.com");
  });

  it("rejects missing or malformed email addresses", () => {
    expect(validateAdminEmail("")).toMatch(/required/i);
    expect(validateAdminEmail("not-an-email")).toMatch(/valid/i);
  });

  it("requires a strong administrator password", () => {
    expect(validateAdminPassword("short")).toMatch(/14/);
    expect(validateAdminPassword("alllowercasebutlong")).toMatch(/uppercase/i);
    expect(validateAdminPassword("StrongLaunch1!")).toBeNull();
    expect(validateAdminPassword(`StrongLaunch1!${"é".repeat(30)}`)).toMatch(/72 UTF-8 bytes/);
  });
});
