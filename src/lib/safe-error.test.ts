import { describe, expect, it } from "vitest";
import {
  formatSafeErrorSummary,
  getSafeErrorDetails,
  SafeOperationalError,
} from "@/lib/safe-error";

describe("safe operational error summaries", () => {
  it("preserves only fixed messages from typed operational errors", () => {
    expect(getSafeErrorDetails(new SafeOperationalError("database_target_metadata_missing"))).toEqual({
      classification: "configuration_error",
      message: "EXPECTED_DATABASE_HOST, EXPECTED_DATABASE_NAME, and at least one forbidden host are required for a database mutation",
    });
  });

  it("reduces raw errors to a category and safe code without sensitive values", () => {
    const error = Object.assign(
      new Error("duplicate email person@example.com at postgres://user:secret@private/db?token=abc"),
      {
        code: "P2002",
        requestBody: { password: "private" },
        rows: [{ imported: "private row" }],
      },
    );
    const summary = formatSafeErrorSummary(error);

    expect(summary).toBe("database_error: Database operation failed (P2002).");
    expect(summary).not.toMatch(/person@example|postgres:|secret|token|password|private row/i);
  });

  it("extracts only safe HTTP or network codes from upstream failures", () => {
    expect(formatSafeErrorSummary(new Error("GET https://private.example/path?q=secret returned HTTP 429 with body token=abc")))
      .toBe("upstream_error: Upstream operation failed (HTTP 429).");
    expect(formatSafeErrorSummary(Object.assign(new Error("private host"), { code: "ECONNREFUSED" })))
      .toBe("upstream_error: Upstream operation failed (ECONNREFUSED).");
  });

  it("never trusts arbitrary explicit classifications", () => {
    const details = getSafeErrorDetails(
      new Error("api-token=private"),
      500,
      "private_error=token" as never,
    );
    expect(details).toEqual({
      classification: "internal_error",
      message: "Server operation failed.",
    });
  });
});
