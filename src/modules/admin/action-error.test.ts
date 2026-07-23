import { afterEach, describe, expect, it, vi } from "vitest";
import { logServerFailure } from "@/lib/server-log";
import {
  AdminActionUserError,
  adminActionErrorMessage,
  adminActionLogOutcome,
} from "./action-error";

describe("adminActionErrorMessage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("preserves messages deliberately marked as safe for admin UX", () => {
    expect(adminActionErrorMessage(
      new AdminActionUserError("Deal workflow state changed during publication"),
      "Failed to publish deal",
    )).toBe("Deal workflow state changed during publication");
  });

  it("does not expose arbitrary database exceptions", () => {
    const databaseError = Object.assign(
      new Error("Unique constraint failed on postgresql://admin:secret@private-db/deals"),
      { code: "P2002" },
    );

    expect(adminActionErrorMessage(databaseError, "Failed to create deal"))
      .toBe("Failed to create deal");
  });

  it("does not expose non-Error exception values", () => {
    expect(adminActionErrorMessage("private upstream response", "Failed to update fund"))
      .toBe("Failed to update fund");
  });

  it("maps authorization, not-found, conflict, validation, and unexpected failures truthfully", () => {
    expect(adminActionLogOutcome(new Error("private"), { authorizationError: true })).toEqual({
      status: 403,
      errorClassification: "authorization_error",
    });
    expect(adminActionLogOutcome(new AdminActionUserError("Company not found"))).toEqual({
      status: 404,
      errorClassification: "not_found",
    });
    expect(adminActionLogOutcome(
      new AdminActionUserError("Company workflow state changed during publication"),
    )).toEqual({
      status: 409,
      errorClassification: "conflict_error",
    });
    expect(adminActionLogOutcome(Object.assign(new Error("write conflict"), { code: "P2034" })))
      .toEqual({
        status: 409,
        errorClassification: "conflict_error",
      });
    expect(adminActionLogOutcome(new AdminActionUserError("Select a valid primary source")))
      .toEqual({
        status: 422,
        errorClassification: "validation_error",
      });
    expect(adminActionLogOutcome(new Error("private database details"))).toEqual({ status: 500 });
  });

  it("uses fixed safe messages and never emits admin text or private payloads", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = Object.assign(
      new AdminActionUserError("Company workflow state changed for private-id-42"),
      { formData: { password: "private-password" } },
    );
    const outcome = adminActionLogOutcome(error);

    logServerFailure({
      task: "admin_action",
      operation: "publish_company",
      taskId: "admin-test",
      ...outcome,
    }, error);

    expect(warning).toHaveBeenCalledOnce();
    const serialized = String(warning.mock.calls[0][0]);
    expect(JSON.parse(serialized)).toEqual({
      taskId: "admin-test",
      task: "admin_action",
      operation: "publish_company",
      durationMs: 0,
      status: 409,
      errorClassification: "conflict_error",
      errorMessage: "Operation could not be completed because state changed.",
    });
    expect(serialized).not.toMatch(/private-id-42|private-password|formData/i);
  });

  it("lets the safe logger infer an unexpected Prisma classification without raw details", () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const error = Object.assign(
      new Error("Unique constraint at postgresql://admin:secret@private-db"),
      { code: "P2002", rows: [{ private: "record" }] },
    );

    logServerFailure({
      task: "admin_action",
      operation: "create_deal",
      taskId: "admin-database-test",
      ...adminActionLogOutcome(error),
    }, error);

    const serialized = String(errorLog.mock.calls[0][0]);
    expect(JSON.parse(serialized)).toMatchObject({
      status: 500,
      errorClassification: "database_error",
      errorMessage: "Database operation failed (P2002).",
    });
    expect(serialized).not.toMatch(/postgresql|secret|private-db|rows|record/i);
  });
});
