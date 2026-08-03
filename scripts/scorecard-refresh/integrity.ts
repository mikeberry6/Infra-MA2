import crypto from "crypto";
import {
  scorecardApprovalSchema,
  scorecardProposalSchema,
  scorecardResearchResultSchema,
  type ScorecardApproval,
  type ScorecardProposal,
  type ScorecardResearchResult,
} from "./schema";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, canonicalize(item)]));
  }
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new Error("Cannot hash non-finite JSON numbers");
  }
  if (["bigint", "function", "symbol", "undefined"].includes(typeof value)) {
    throw new Error(`Cannot hash non-JSON value of type ${typeof value}`);
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function hashSnapshot(value: unknown): string {
  return crypto.createHash("sha256").update(`scorecard-snapshot-v1\n${canonicalJson(value)}`).digest("hex");
}

export function computeProposalHash(result: ScorecardResearchResult): string {
  const parsed = scorecardResearchResultSchema.parse(result);
  return crypto.createHash("sha256").update(`scorecard-proposal-v1\n${canonicalJson(parsed)}`).digest("hex");
}

export function finalizeProposal(result: ScorecardResearchResult): ScorecardProposal {
  const parsed = scorecardResearchResultSchema.parse(result);
  return scorecardProposalSchema.parse({ ...parsed, proposalHash: computeProposalHash(parsed) });
}

export function assertProposalIntegrity(value: unknown): ScorecardProposal {
  const proposal = scorecardProposalSchema.parse(value);
  const { proposalHash, ...researchResult } = proposal;
  const expected = computeProposalHash(researchResult as ScorecardResearchResult);
  if (proposalHash !== expected) {
    throw new Error(`Proposal hash mismatch: expected ${expected}, received ${proposalHash}`);
  }
  return proposal;
}

export interface ApprovalBindingCheck {
  ok: boolean;
  issues: string[];
  proposal: ScorecardProposal | null;
  approval: ScorecardApproval | null;
}

export function validateApprovalBinding(input: {
  proposal: unknown;
  approval: unknown;
  currentCompanySnapshotHash: string;
  currentSourceDatabaseSnapshotHash: string;
}): ApprovalBindingCheck {
  const issues: string[] = [];
  let proposal: ScorecardProposal | null = null;
  let approval: ScorecardApproval | null = null;
  try {
    proposal = assertProposalIntegrity(input.proposal);
  } catch (error) {
    issues.push(error instanceof Error ? error.message : String(error));
  }
  const parsedApproval = scorecardApprovalSchema.safeParse(input.approval);
  if (!parsedApproval.success) {
    issues.push(`Approval failed schema validation: ${parsedApproval.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ")}`);
  } else {
    approval = parsedApproval.data;
  }
  if (proposal && approval) {
    if (approval.proposalHash !== proposal.proposalHash) issues.push("Approval references a different proposal hash");
    if (approval.companyId !== proposal.companyId) issues.push("Approval references a different company ID");
    if (approval.requestedCompany !== proposal.requestedCompany) issues.push("Approval references a different company name");
    if (approval.companySnapshotHash !== proposal.companySnapshotHash) {
      issues.push("Approval references a different company snapshot hash");
    }
    if (approval.sourceDatabaseSnapshotHash !== proposal.sourceDatabaseSnapshotHash) {
      issues.push("Approval references a different database snapshot hash");
    }
    if (proposal.applicationRecommendation === "BLOCKED" || proposal.taskStatus === "BLOCKED") {
      issues.push("A blocked proposal cannot be applied");
    }
  }
  if (approval && approval.companySnapshotHash !== input.currentCompanySnapshotHash) {
    issues.push("Current company snapshot changed after approval");
  }
  if (approval && approval.sourceDatabaseSnapshotHash !== input.currentSourceDatabaseSnapshotHash) {
    issues.push("Current database snapshot changed after approval");
  }
  return { ok: issues.length === 0, issues, proposal, approval };
}

export function assertApprovalBinding(input: {
  proposal: unknown;
  approval: unknown;
  currentCompanySnapshotHash: string;
  currentSourceDatabaseSnapshotHash: string;
}): { proposal: ScorecardProposal; approval: ScorecardApproval } {
  const result = validateApprovalBinding(input);
  if (!result.ok || !result.proposal || !result.approval) {
    throw new Error(`Scorecard approval binding failed:\n${result.issues.map((issue) => `- ${issue}`).join("\n")}`);
  }
  return { proposal: result.proposal, approval: result.approval };
}
