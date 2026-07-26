import type { Prisma, RecordStatus } from "@/generated/prisma/client";

export interface DraftDeletionFacts {
  status: RecordStatus;
  lastVerifiedAt: Date | null;
  publicationAuditCount: number;
  blockingDependencies: Record<string, number>;
}

export function draftDeletionBlockReason(facts: DraftDeletionFacts): string | null {
  if (facts.status !== "DRAFT") {
    return "Only never-published draft records may be deleted. Use Archive to preserve editorial history.";
  }
  if (facts.lastVerifiedAt || facts.publicationAuditCount > 0) {
    return "This draft has publication history and cannot be deleted. Use Archive to preserve editorial history.";
  }

  const dependencies = Object.entries(facts.blockingDependencies)
    .filter(([, count]) => count > 0)
    .map(([label, count]) => `${label} (${count})`);
  if (dependencies.length > 0) {
    return `Delete blocked by dependent records: ${dependencies.join(", ")}. Remove or reconcile those links first.`;
  }
  return null;
}

export function toAuditSnapshot(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
