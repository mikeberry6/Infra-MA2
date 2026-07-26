import type { RecordStatus } from "@/generated/prisma/client";

/**
 * Editing a published record must remove it from the public projection until
 * the edited values pass the publication gate again. Draft/review records keep
 * their state; archived records are immutable.
 */
export function statusAfterEditorialEdit(status: RecordStatus): RecordStatus | null {
  if (status === "ARCHIVED") return null;
  return status === "PUBLISHED" ? "IN_REVIEW" : status;
}

export function canSubmitForReview(status: RecordStatus): boolean {
  return status === "DRAFT";
}

export function canPublish(status: RecordStatus): boolean {
  return status === "IN_REVIEW";
}

export function canArchive(status: RecordStatus): boolean {
  return status !== "ARCHIVED";
}

export function canVerify(status: RecordStatus): boolean {
  return status === "PUBLISHED";
}
