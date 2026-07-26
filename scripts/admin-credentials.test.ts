import { describe, expect, it } from "vitest";
import {
  normalizeAdminEmail,
  validateAdminEmail,
  validateAdminPassword,
} from "./admin-credentials";

describe("administrator bootstrap credential validation", () => {
  it.each([
    ["", "missing"],
    ["administrator", "missing at-sign"],
    ["administrator@", "missing domain"],
    ["@example.com", "missing local part"],
    ["administrator@example", "missing public suffix"],
    ["administrator @example.com", "embedded whitespace"],
    ["administrator@@example.com", "multiple at-signs"],
  ])("rejects an invalid administrator email (%s: %s)", (email) => {
    expect(validateAdminEmail(email)).toBe("ADMIN_EMAIL must be a valid email address.");
  });

  it("normalizes and accepts a valid administrator email", () => {
    const email = normalizeAdminEmail("  Administrator@Example.com ");

    expect(email).toBe("administrator@example.com");
    expect(validateAdminEmail(email)).toBeNull();
  });

  it.each([
    ["Short1!", "fewer than 14 characters"],
    ["alllowercase123!", "no uppercase letter"],
    ["ALLUPPERCASE123!", "no lowercase letter"],
    ["NoNumberPresent!", "no number"],
    ["NoSymbolPresent1", "no symbol"],
  ])("rejects a weak administrator password (%s: %s)", (password) => {
    expect(validateAdminPassword(password)).not.toBeNull();
  });

  it("accepts a strong administrator password without accessing the database", () => {
    expect(validateAdminPassword("Correct-Horse-7-Battery")).toBeNull();
  });

  it("accepts an ASCII password at bcrypt's 72-byte boundary and rejects the next byte", () => {
    const exactBoundary = `Aa1!${"x".repeat(68)}`;

    expect(Buffer.byteLength(exactBoundary, "utf8")).toBe(72);
    expect(validateAdminPassword(exactBoundary)).toBeNull();
    expect(validateAdminPassword(`${exactBoundary}x`))
      .toBe("ADMIN_PASSWORD must not exceed 72 UTF-8 bytes.");
  });

  it("enforces bcrypt's byte boundary for multibyte passwords", () => {
    const exactBoundary = `Aa1!${"é".repeat(34)}`;
    const overBoundary = `${exactBoundary}é`;

    expect(exactBoundary.length).toBeLessThan(72);
    expect(Buffer.byteLength(exactBoundary, "utf8")).toBe(72);
    expect(Buffer.byteLength(overBoundary, "utf8")).toBe(74);
    expect(validateAdminPassword(exactBoundary)).toBeNull();
    expect(validateAdminPassword(overBoundary))
      .toBe("ADMIN_PASSWORD must not exceed 72 UTF-8 bytes.");
  });
});
