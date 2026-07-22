import { describe, expect, it } from "vitest";
import { validateAdminPassword } from "./create-admin";

describe("administrator bootstrap password policy", () => {
  it("requires length and mixed character classes", () => {
    expect(validateAdminPassword("Short1!")).toMatch(/14 characters/);
    expect(validateAdminPassword("alllowercase123!")).toMatch(/upper- and lowercase/);
    expect(validateAdminPassword("MixedCaseOnlyPass")).toMatch(/number and a symbol/);
    expect(validateAdminPassword("StrongAdmin123!")).toBeNull();
  });
});
