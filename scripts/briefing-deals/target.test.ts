import { it, expect } from "vitest";
import { validateApplyTarget } from "./target";
it("rejects remote writes without a protected production target", () => {
  expect(() => validateApplyTarget("postgresql://u:p@remote/db", "local", {})).toThrow();
  expect(() => validateApplyTarget("postgresql://u:p@remote/db", "production", {}, "APPLY-REVIEWED-BRIEFINGS")).toThrow();
  expect(() => validateApplyTarget("postgresql://u:p@localhost/db?host=remote", "local", {})).toThrow("overrides");
  expect(validateApplyTarget("postgresql://u:p@localhost/db", "local", {}).hostname).toBe("localhost");
  expect(validateApplyTarget("postgresql://u:p@remote/db", "production", { EXPECTED_DATABASE_HOST: "remote", EXPECTED_DATABASE_NAME: "db" }, "APPLY-REVIEWED-BRIEFINGS").hostname).toBe("remote");
});
