import { describe, expect, it } from "vitest";
import { adminBootstrapChangedFields } from "@/modules/operations/admin-bootstrap-audit";

const rotated = {
  email: "admin@example.com",
  name: "Administrator",
  passwordHash: "new-hash",
  role: "ADMIN",
};

describe("admin bootstrap audit summaries", () => {
  it("reports all persisted credential fields for a new administrator", () => {
    expect(adminBootstrapChangedFields(null, rotated)).toEqual([
      "email",
      "name",
      "passwordHash",
      "role",
    ]);
  });

  it("reports only the password hash for a credential rotation", () => {
    expect(adminBootstrapChangedFields({
      ...rotated,
      passwordHash: "old-hash",
    }, rotated)).toEqual(["passwordHash"]);
  });

  it("includes profile and role fields only when they actually change", () => {
    expect(adminBootstrapChangedFields({
      ...rotated,
      name: "Previous Administrator",
      passwordHash: "old-hash",
      role: "ANALYST",
    }, rotated)).toEqual(["name", "passwordHash", "role"]);
  });
});
