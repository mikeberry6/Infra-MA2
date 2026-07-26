import { describe, expect, it } from "vitest";
import {
  ImportConflictError,
  ImportRequestError,
  importUserErrorDetails,
} from "./user-error";

describe("importUserErrorDetails", () => {
  it("exposes only deliberately typed request and conflict messages", () => {
    expect(importUserErrorDetails(new ImportRequestError("No file provided in form data")))
      .toEqual({ message: "No file provided in form data", status: 400 });
    expect(importUserErrorDetails(new ImportConflictError("Review state changed during commit")))
      .toEqual({ message: "Review state changed during commit", status: 409 });
  });

  it("rejects arbitrary exception messages", () => {
    expect(importUserErrorDetails(new Error("postgresql://admin:secret@private-db"))).toBeNull();
    expect(importUserErrorDetails("private upstream response")).toBeNull();
  });
});
