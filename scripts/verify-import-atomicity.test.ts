import { describe, expect, it } from "vitest";
import {
  ImportAtomicityGuardError,
  validateImportAtomicityTarget,
  type ImportAtomicityEnvironment,
} from "./verify-import-atomicity";

const validEnvironment = {
  IMPORT_VALIDATION_DATABASE_URL:
    "postgresql://synthetic:synthetic@ep-import-validation.example.invalid/db?sslmode=require",
  EXPECTED_IMPORT_VALIDATION_HOST: "ep-import-validation.example.invalid",
  IMPORT_VALIDATION_CONFIRM: "VERIFY",
} satisfies ImportAtomicityEnvironment;

function expectGuardCode(
  environment: ImportAtomicityEnvironment,
  expectedCode: string,
) {
  try {
    validateImportAtomicityTarget(environment);
    throw new Error("Expected target validation to fail.");
  } catch (error) {
    expect(error).toBeInstanceOf(ImportAtomicityGuardError);
    expect((error as ImportAtomicityGuardError).code).toBe(expectedCode);
  }
}

describe("import atomicity probe target guard", () => {
  it("accepts only the exact expected Postgres hostname and confirmation", () => {
    expect(validateImportAtomicityTarget(validEnvironment)).toEqual({
      databaseUrl: validEnvironment.IMPORT_VALIDATION_DATABASE_URL,
      hostname: validEnvironment.EXPECTED_IMPORT_VALIDATION_HOST,
    });
  });

  it("requires a validation URL", () => {
    expectGuardCode(
      { ...validEnvironment, IMPORT_VALIDATION_DATABASE_URL: undefined },
      "VALIDATION_DATABASE_URL_REQUIRED",
    );
  });

  it("requires an explicit expected host", () => {
    expectGuardCode(
      { ...validEnvironment, EXPECTED_IMPORT_VALIDATION_HOST: undefined },
      "EXPECTED_VALIDATION_HOST_REQUIRED",
    );
  });

  it("requires the exact case-sensitive VERIFY confirmation", () => {
    expectGuardCode(
      { ...validEnvironment, IMPORT_VALIDATION_CONFIRM: "verify" },
      "EXACT_CONFIRMATION_REQUIRED",
    );
  });

  it("rejects malformed and non-Postgres URLs", () => {
    expectGuardCode(
      { ...validEnvironment, IMPORT_VALIDATION_DATABASE_URL: "not a url" },
      "VALIDATION_DATABASE_URL_INVALID",
    );
    expectGuardCode(
      {
        ...validEnvironment,
        IMPORT_VALIDATION_DATABASE_URL:
          "https://ep-import-validation.example.invalid/db",
      },
      "VALIDATION_DATABASE_PROTOCOL_INVALID",
    );
  });

  it("rejects every hostname except the exact expected host", () => {
    expectGuardCode(
      {
        ...validEnvironment,
        IMPORT_VALIDATION_DATABASE_URL:
          "postgresql://synthetic:synthetic@ep-import-validation.example.invalid.attacker.test/db",
      },
      "VALIDATION_DATABASE_HOST_MISMATCH",
    );
    expectGuardCode(
      {
        ...validEnvironment,
        EXPECTED_IMPORT_VALIDATION_HOST:
          "EP-IMPORT-VALIDATION.EXAMPLE.INVALID",
      },
      "VALIDATION_DATABASE_HOST_MISMATCH",
    );
  });
});
