import { changedFieldSummary } from "@/modules/admin/change-summary";

export type WeeklyProposalParticipantAudit = {
  organizationName: string;
  role: string;
  displayName: string | null;
};

export type WeeklyProposalCitationAudit = {
  sourceUrl: string;
  isPrimary: boolean;
};

export type WeeklyProposalAuditState = {
  record: Record<string, unknown>;
  participants: readonly WeeklyProposalParticipantAudit[];
  citations: readonly WeeklyProposalCitationAudit[];
};

function sortedParticipants(
  participants: readonly WeeklyProposalParticipantAudit[],
): WeeklyProposalParticipantAudit[] {
  return [...participants].sort((left, right) => (
    left.organizationName.localeCompare(right.organizationName)
    || left.role.localeCompare(right.role)
    || (left.displayName ?? "").localeCompare(right.displayName ?? "")
  ));
}

function sortedCitations(
  citations: readonly WeeklyProposalCitationAudit[],
): WeeklyProposalCitationAudit[] {
  return [...citations].sort((left, right) => (
    left.sourceUrl.localeCompare(right.sourceUrl)
    || Number(left.isPrimary) - Number(right.isPrimary)
  ));
}

/**
 * Summarize a weekly proposal write using field names only. The proposal
 * values are compared in memory and are never returned to the audit payload.
 */
export function weeklyProposalChangedFields(
  existing: WeeklyProposalAuditState | null,
  proposed: WeeklyProposalAuditState,
): string[] {
  const changedFields = changedFieldSummary(
    existing?.record ?? {},
    proposed.record,
  );

  if (
    JSON.stringify(sortedParticipants(existing?.participants ?? []))
    !== JSON.stringify(sortedParticipants(proposed.participants))
  ) {
    changedFields.push("participants");
  }
  if (
    JSON.stringify(sortedCitations(existing?.citations ?? []))
    !== JSON.stringify(sortedCitations(proposed.citations))
  ) {
    changedFields.push("citations");
  }

  // An otherwise identical proposal still executes a Deal update and Prisma
  // advances the @updatedAt field.
  if (existing && changedFields.length === 0) changedFields.push("updatedAt");
  return [...new Set(changedFields)].sort();
}
