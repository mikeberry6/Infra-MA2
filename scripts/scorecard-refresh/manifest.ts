import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  scorecardCompanyInputSchema,
  scorecardManifestSchema,
  type ScorecardCompanyInput,
  type ScorecardManifest,
  type ScorecardManifestEntry,
} from "./schema";

const MANAGER_UNIVERSE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../research/manager-universe.json",
);
const TERMINAL_STATUSES = new Set<ScorecardManifestEntry["status"]>(["COMPLETED", "FAILED", "BLOCKED"]);
const ACTIVE_STATUSES = new Set<ScorecardManifestEntry["status"]>([
  "RESEARCHING",
  "REPAIRING",
  "AWAITING_APPROVAL",
  "APPLYING",
  "VERIFYING",
]);

const ALLOWED_TRANSITIONS: Record<ScorecardManifestEntry["status"], ScorecardManifestEntry["status"][]> = {
  PENDING: ["RESEARCHING"],
  RESEARCHING: ["REPAIRING", "AWAITING_APPROVAL", "FAILED", "BLOCKED"],
  REPAIRING: ["AWAITING_APPROVAL", "FAILED", "BLOCKED"],
  AWAITING_APPROVAL: ["APPLYING", "FAILED", "BLOCKED"],
  APPLYING: ["VERIFYING", "FAILED", "BLOCKED"],
  VERIFYING: ["COMPLETED", "FAILED", "BLOCKED"],
  COMPLETED: [],
  FAILED: [],
  BLOCKED: [],
};

function compareNames(left: string, right: string): number {
  const compared = left.localeCompare(right, "en-US", { sensitivity: "base", numeric: true });
  return compared || left.localeCompare(right, "en-US", { sensitivity: "variant", numeric: true });
}

function canonicalIdentityKey(company: Pick<ScorecardCompanyInput, "canonicalName" | "country">): string {
  return `${company.canonicalName.normalize("NFKC").toLocaleLowerCase("en-US").trim()}\u0000${company.country
    .normalize("NFKC").toLocaleLowerCase("en-US").trim()}`;
}

export function loadManagerUniverse(filePath = MANAGER_UNIVERSE_PATH): string[] {
  const raw: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(raw)) throw new Error("Manager universe must be a JSON array");
  const managers = raw.map((value, index) => {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`Manager universe entry ${index + 1} must be a non-empty string`);
    }
    return value.trim();
  });
  if (managers.length !== 100) {
    throw new Error(`Scorecard refresh requires exactly 100 managers; found ${managers.length}`);
  }
  if (new Set(managers).size !== managers.length) {
    throw new Error("Manager universe contains duplicates");
  }
  return managers;
}

function validateInputs(companies: ScorecardCompanyInput[]): ScorecardCompanyInput[] {
  const parsed = companies.map((company, index) => {
    const result = scorecardCompanyInputSchema.safeParse(company);
    if (!result.success) {
      throw new Error(`Invalid company input at index ${index}: ${result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`);
    }
    return result.data;
  });
  const ids = parsed.map((company) => company.companyId);
  if (new Set(ids).size !== ids.length) throw new Error("Company inputs contain duplicate companyId values");
  const publishedKeys = parsed.filter((company) => company.isPublished).map(canonicalIdentityKey);
  if (new Set(publishedKeys).size !== publishedKeys.length) {
    throw new Error("Published inputs contain duplicate canonical company-and-country identities");
  }
  return parsed;
}

export function buildScorecardManifest(input: {
  asOfDate: string;
  generatedAt: string;
  sourceDatabaseSnapshotHash: string;
  companies: ScorecardCompanyInput[];
  managerUniverse?: string[];
}): ScorecardManifest {
  const managers = input.managerUniverse ?? loadManagerUniverse();
  if (managers.length !== 100 || new Set(managers).size !== managers.length) {
    throw new Error("A scorecard manifest requires 100 unique managers");
  }
  const managerIndex = new Map(managers.map((manager, index) => [manager, index]));
  const published = validateInputs(input.companies).filter((company) => company.isPublished);

  const assigned = published.map((company) => {
    const distinctManagers = [...new Set(company.applicableManagers)];
    const applicableManagers = distinctManagers.sort((left, right) => {
      const leftIndex = managerIndex.get(left);
      const rightIndex = managerIndex.get(right);
      if (leftIndex !== undefined && rightIndex !== undefined) return leftIndex - rightIndex;
      if (leftIndex !== undefined) return -1;
      if (rightIndex !== undefined) return 1;
      return compareNames(left, right);
    });
    const assignedManager = applicableManagers.find((manager) => managerIndex.has(manager)) ?? null;
    return { company, applicableManagers, assignedManager };
  });

  assigned.sort((left, right) => {
    const leftManagerIndex = left.assignedManager === null ? Number.POSITIVE_INFINITY : managerIndex.get(left.assignedManager)!;
    const rightManagerIndex = right.assignedManager === null ? Number.POSITIVE_INFINITY : managerIndex.get(right.assignedManager)!;
    if (leftManagerIndex !== rightManagerIndex) return leftManagerIndex - rightManagerIndex;
    const nameOrder = compareNames(left.company.canonicalName, right.company.canonicalName);
    if (nameOrder !== 0) return nameOrder;
    const countryOrder = compareNames(left.company.country, right.company.country);
    return countryOrder || left.company.companyId.localeCompare(right.company.companyId);
  });

  const draft: ScorecardManifest = {
    schemaVersion: 1,
    artifactType: "SCORECARD_REFRESH_MANIFEST",
    methodologyVersion: "PORTCO_SCORECARD_GPT56_PRO_V1",
    asOfDate: input.asOfDate,
    generatedAt: input.generatedAt,
    updatedAt: input.generatedAt,
    sourceDatabaseSnapshotHash: input.sourceDatabaseSnapshotHash,
    managerUniverse: [...managers],
    runStatus: assigned.length === 0 ? "COMPLETE" : "READY",
    pauseReason: null,
    entries: assigned.map(({ company, applicableManagers, assignedManager }, index) => ({
      queueIndex: index + 1,
      taskId: `company:${company.companyId}`,
      companyId: company.companyId,
      canonicalName: company.canonicalName,
      country: company.country,
      assignmentBasis: assignedManager === null ? "REMAINING_PUBLISHED" : "MANAGER_LINKED",
      assignedManager,
      applicableManagers,
      companySnapshotHash: company.companySnapshotHash,
      status: "PENDING",
      repairAttempts: 0,
      conversationUrl: null,
      proposalHash: null,
      approvalId: null,
      approvedProposalHash: null,
      lastError: null,
      startedAt: null,
      completedAt: null,
    })),
  };
  return scorecardManifestSchema.parse(draft);
}

function cloneManifest(manifest: ScorecardManifest): ScorecardManifest {
  return structuredClone(scorecardManifestSchema.parse(manifest));
}

function activeEntries(manifest: ScorecardManifest): ScorecardManifestEntry[] {
  return manifest.entries.filter((entry) => ACTIVE_STATUSES.has(entry.status));
}

function findEntry(manifest: ScorecardManifest, taskId: string): ScorecardManifestEntry {
  const entry = manifest.entries.find((candidate) => candidate.taskId === taskId);
  if (!entry) throw new Error(`Unknown scorecard task: ${taskId}`);
  return entry;
}

export function startNextTask(
  manifest: ScorecardManifest,
  input: { startedAt: string; conversationUrl: string },
): ScorecardManifest {
  const next = cloneManifest(manifest);
  if (next.runStatus === "PAUSED") throw new Error("Resume the paused manifest before starting another company");
  if (next.runStatus === "COMPLETE") throw new Error("The scorecard manifest is complete");
  if (activeEntries(next).length > 0) throw new Error("Another scorecard company is already active");
  if (next.entries.some((candidate) => candidate.conversationUrl === input.conversationUrl)) {
    throw new Error("Each scorecard company requires a fresh ChatGPT conversation URL");
  }
  const entry = next.entries.find((candidate) => candidate.status === "PENDING");
  if (!entry) throw new Error("No pending scorecard company remains");
  entry.status = "RESEARCHING";
  entry.startedAt = input.startedAt;
  entry.conversationUrl = input.conversationUrl;
  entry.lastError = null;
  next.runStatus = "RUNNING";
  next.pauseReason = null;
  next.updatedAt = input.startedAt;
  return scorecardManifestSchema.parse(next);
}

export function transitionTask(
  manifest: ScorecardManifest,
  input: {
    taskId: string;
    to: Exclude<ScorecardManifestEntry["status"], "PENDING" | "RESEARCHING" | "REPAIRING">;
    at: string;
    proposalHash?: string;
    approvalId?: string;
    approvedProposalHash?: string;
    error?: { code: string; message: string };
  },
): ScorecardManifest {
  const next = cloneManifest(manifest);
  if (next.runStatus !== "RUNNING") throw new Error("Task transitions require a running manifest");
  const active = activeEntries(next);
  if (active.length !== 1 || active[0].taskId !== input.taskId) {
    throw new Error("Only the single active company may transition");
  }
  const entry = findEntry(next, input.taskId);
  if (!ALLOWED_TRANSITIONS[entry.status].includes(input.to)) {
    throw new Error(`Invalid scorecard transition ${entry.status} -> ${input.to}`);
  }

  if (input.to === "AWAITING_APPROVAL") {
    if (!input.proposalHash) throw new Error("AWAITING_APPROVAL requires a proposal hash");
    entry.proposalHash = input.proposalHash;
  }
  if (input.to === "BLOCKED" && input.proposalHash) {
    entry.proposalHash = input.proposalHash;
  }
  if (input.to === "APPLYING") {
    if (!input.approvalId || !input.approvedProposalHash) {
      throw new Error("APPLYING requires an approval ID and approved proposal hash");
    }
    if (entry.proposalHash !== input.approvedProposalHash) {
      throw new Error("Approval is bound to a different proposal hash");
    }
    entry.approvalId = input.approvalId;
    entry.approvedProposalHash = input.approvedProposalHash;
  }
  if ((input.to === "FAILED" || input.to === "BLOCKED") && !input.error) {
    throw new Error(`${input.to} requires an error or blocker`);
  }
  if (input.error) {
    entry.lastError = { ...input.error, recordedAt: input.at };
  }

  entry.status = input.to;
  next.updatedAt = input.at;
  if (input.to === "COMPLETED") {
    if (!entry.proposalHash || !entry.approvalId || entry.approvedProposalHash !== entry.proposalHash) {
      throw new Error("A completed scorecard requires its hash-bound approval");
    }
    entry.completedAt = input.at;
    next.runStatus = next.entries.some((candidate) => candidate.status === "PENDING") ? "READY" : "COMPLETE";
    next.pauseReason = null;
  } else if (TERMINAL_STATUSES.has(input.to)) {
    entry.completedAt = input.at;
    next.runStatus = "PAUSED";
    next.pauseReason = input.error!.message;
  }
  return scorecardManifestSchema.parse(next);
}

export function recordMalformedResponse(
  manifest: ScorecardManifest,
  input: { taskId: string; at: string; validationMessage: string },
): ScorecardManifest {
  const next = cloneManifest(manifest);
  if (next.runStatus !== "RUNNING") throw new Error("Malformed responses require a running manifest");
  const active = activeEntries(next);
  if (active.length !== 1 || active[0].taskId !== input.taskId) {
    throw new Error("Only the single active company may record a malformed response");
  }
  const entry = findEntry(next, input.taskId);
  if (entry.status === "RESEARCHING" && entry.repairAttempts === 0) {
    entry.status = "REPAIRING";
    entry.repairAttempts = 1;
    entry.lastError = {
      code: "SCHEMA_VALIDATION_FAILED",
      message: input.validationMessage,
      recordedAt: input.at,
    };
    next.updatedAt = input.at;
    return scorecardManifestSchema.parse(next);
  }
  if (entry.status === "REPAIRING" && entry.repairAttempts === 1) {
    entry.status = "FAILED";
    entry.completedAt = input.at;
    entry.lastError = {
      code: "SCHEMA_REPAIR_LIMIT_EXCEEDED",
      message: input.validationMessage,
      recordedAt: input.at,
    };
    next.runStatus = "PAUSED";
    next.pauseReason = "The single permitted schema repair also failed";
    next.updatedAt = input.at;
    return scorecardManifestSchema.parse(next);
  }
  throw new Error(`Cannot record a malformed response while task is ${entry.status}`);
}

export function resumePausedManifest(
  manifest: ScorecardManifest,
  input: { resumedAt: string; reason: string },
): ScorecardManifest {
  const next = cloneManifest(manifest);
  if (next.runStatus !== "PAUSED") throw new Error("Only a paused manifest may be resumed");
  if (activeEntries(next).length > 0) throw new Error("A paused manifest cannot retain an active company");
  next.runStatus = next.entries.some((entry) => entry.status === "PENDING") ? "READY" : "COMPLETE";
  next.pauseReason = null;
  next.updatedAt = input.resumedAt;
  void input.reason;
  return scorecardManifestSchema.parse(next);
}
