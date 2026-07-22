import { describe, expect, it } from "vitest";
import { AdminActionUserError, adminActionErrorMessage } from "./action-error";

describe("adminActionErrorMessage", () => {
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
});
