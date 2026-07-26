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

export type WeeklyProposalWriteDecision = {
  result: "created" | "updated" | "skipped";
  changedFields: string[];
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

  return [...new Set(changedFields)].sort();
}

/**
 * Decide whether a proposal needs a write before entering the mutation phase.
 * Exact replays are no-ops so they do not advance updatedAt, replace relations,
 * or append duplicate audit records.
 */
export function weeklyProposalWriteDecision(
  existing: WeeklyProposalAuditState | null,
  proposed: WeeklyProposalAuditState,
): WeeklyProposalWriteDecision {
  const changedFields = weeklyProposalChangedFields(existing, proposed);
  return {
    result: !existing
      ? "created"
      : changedFields.length > 0 ? "updated" : "skipped",
    changedFields,
  };
}
