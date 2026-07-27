import { describe, expect, it } from "vitest";
import {
  BCRYPT_MAX_PASSWORD_BYTES,
  exceedsBcryptPasswordLimit,
} from "./password-policy";

describe("bcrypt password input policy", () => {
  it("accepts exactly 72 ASCII bytes and rejects 73", () => {
    expect(exceedsBcryptPasswordLimit("a".repeat(BCRYPT_MAX_PASSWORD_BYTES))).toBe(false);
    expect(exceedsBcryptPasswordLimit("a".repeat(BCRYPT_MAX_PASSWORD_BYTES + 1))).toBe(true);
  });

  it("measures UTF-8 bytes rather than JavaScript characters", () => {
    expect(exceedsBcryptPasswordLimit("é".repeat(36))).toBe(false);
    expect(exceedsBcryptPasswordLimit("é".repeat(37))).toBe(true);
  });
});
