import { describe, expect, it } from "vitest";
import {
  canArchive,
  canPublish,
  canSubmitForReview,
  canVerify,
  statusAfterEditorialEdit,
} from "@/modules/admin/workflow";

describe("editorial record workflow", () => {
  it("moves edits to published records back through review without changing draft state", () => {
    expect(statusAfterEditorialEdit("PUBLISHED")).toBe("IN_REVIEW");
    expect(statusAfterEditorialEdit("DRAFT")).toBe("DRAFT");
    expect(statusAfterEditorialEdit("IN_REVIEW")).toBe("IN_REVIEW");
    expect(statusAfterEditorialEdit("ARCHIVED")).toBeNull();
  });

  it("allows only explicit forward workflow transitions", () => {
    expect(canSubmitForReview("DRAFT")).toBe(true);
    expect(canSubmitForReview("PUBLISHED")).toBe(false);
    expect(canPublish("IN_REVIEW")).toBe(true);
    expect(canPublish("DRAFT")).toBe(false);
    expect(canArchive("PUBLISHED")).toBe(true);
    expect(canArchive("ARCHIVED")).toBe(false);
    expect(canVerify("PUBLISHED")).toBe(true);
    expect(canVerify("IN_REVIEW")).toBe(false);
  });
});
