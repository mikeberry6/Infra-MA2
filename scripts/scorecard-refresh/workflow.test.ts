import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { finalizeProposal } from "./integrity";
import {
  SCORECARD_JSON_END,
  SCORECARD_JSON_START,
  SCORECARD_REPORT_END,
  SCORECARD_REPORT_START,
} from "./prompt";
import { HASH_A, HASH_B, validPromptContext, validResearchResult } from "./test-fixtures";
import {
  ingestScorecardResponse,
  initializeScorecardRun,
  inspectNextScorecardTask,
  loadScorecardManifest,
  startNextScorecardTask,
  validateScorecardApprovalForRun,
  validateScorecardResponse,
  writeScorecardWorkerPrompt,
} from "./workflow";

const temporaryDirectories: string[] = [];

afterEach(() => {
  temporaryDirectories.splice(0).forEach((directory) => {
    fs.rmSync(directory, { recursive: true, force: true });
  });
});

function createRunDirectory(): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "scorecard-refresh-test-"));
  temporaryDirectories.push(directory);
  return directory;
}

function initialize(runDirectory = createRunDirectory()) {
  return initializeScorecardRun({
    runDirectory,
    generatedAt: "2026-08-03T13:00:00.000Z",
    runInput: {
      schemaVersion: 1,
      artifactType: "SCORECARD_REFRESH_RUN_INPUT",
      asOfDate: "2026-08-03",
      sourceDatabaseSnapshotHash: HASH_B,
      companies: [{
        companyId: "company-1",
        canonicalName: "Example Infrastructure, LLC",
        country: "United States",
        isPublished: true,
        applicableManagers: ["Global Infrastructure Partners", "BlackRock"],
        companySnapshotHash: HASH_A,
      }],
    },
  });
}

function startAndWritePrompt(runDirectory: string): void {
  startNextScorecardTask({
    runDirectory,
    conversationUrl: "https://chatgpt.com/c/example-scorecard",
    startedAt: "2026-08-03T13:30:00.000Z",
  });
  writeScorecardWorkerPrompt({ runDirectory, context: validPromptContext() });
}

function validResponse(): string {
  const result = validResearchResult();
  const report = `${result.requestedCompany}\n\nIdentity, ownership, operations, milestones, management, evidence, changes, and deal reconciliation were reviewed in full. The resulting proposal is ready for individual approval without any unresolved ownership or identity blocker.`;
  return [
    SCORECARD_JSON_START,
    JSON.stringify(result),
    SCORECARD_JSON_END,
    SCORECARD_REPORT_START,
    report,
    SCORECARD_REPORT_END,
  ].join("\n");
}

describe("executable scorecard refresh workflow", () => {
  it("initializes, starts exactly one task, writes its prompt, ingests a proposal, and validates approval binding", () => {
    const initialized = initialize();
    expect(initialized.manifest.entries).toHaveLength(1);
    expect(inspectNextScorecardTask(initialized.manifest).state).toBe("PENDING");

    startAndWritePrompt(initialized.runDirectory);
    expect(() => startNextScorecardTask({
      runDirectory: initialized.runDirectory,
      conversationUrl: "https://chatgpt.com/c/second-scorecard",
      startedAt: "2026-08-03T13:45:00.000Z",
    })).toThrow("already active");

    const validated = validateScorecardResponse({
      runDirectory: initialized.runDirectory,
      response: validResponse(),
      attempt: "initial",
    });
    expect(validated.valid).toBe(true);

    const ingested = ingestScorecardResponse({
      runDirectory: initialized.runDirectory,
      response: validResponse(),
      attempt: "initial",
      ingestedAt: "2026-08-03T15:00:00.000Z",
    });
    expect(ingested.outcome).toBe("AWAITING_APPROVAL");
    expect(fs.existsSync(ingested.artifacts.proposal)).toBe(true);
    expect(fs.existsSync(ingested.artifacts.report)).toBe(true);
    expect(loadScorecardManifest(initialized.runDirectory).entries[0].status).toBe("AWAITING_APPROVAL");

    const proposal = finalizeProposal(validResearchResult());
    const approval = {
      schemaVersion: 1,
      artifactType: "SCORECARD_REFRESH_APPROVAL",
      approvalId: "approval-company-1",
      companyId: proposal.companyId,
      requestedCompany: proposal.requestedCompany,
      decision: "APPROVED",
      proposalHash: proposal.proposalHash,
      companySnapshotHash: HASH_A,
      sourceDatabaseSnapshotHash: HASH_B,
      approvedBy: "User",
      approvedAt: "2026-08-03T16:00:00.000Z",
    };
    expect(validateScorecardApprovalForRun({
      runDirectory: initialized.runDirectory,
      approval,
      currentCompanySnapshotHash: HASH_A,
      currentSourceDatabaseSnapshotHash: HASH_B,
    }).approval.approvalId).toBe("approval-company-1");
    expect(() => validateScorecardApprovalForRun({
      runDirectory: initialized.runDirectory,
      approval,
      currentCompanySnapshotHash: "c".repeat(64),
      currentSourceDatabaseSnapshotHash: HASH_B,
    })).toThrow("changed after approval");
  });

  it("opens one repair after the first malformed response and fails on the second", () => {
    const initialized = initialize();
    startAndWritePrompt(initialized.runDirectory);

    const first = ingestScorecardResponse({
      runDirectory: initialized.runDirectory,
      response: "malformed first response",
      attempt: "initial",
      ingestedAt: "2026-08-03T15:00:00.000Z",
    });
    expect(first.outcome).toBe("REPAIR_REQUIRED");
    expect(first.manifest.entries[0].status).toBe("REPAIRING");
    expect(first.manifest.entries[0].repairAttempts).toBe(1);
    expect(fs.readFileSync(first.artifacts.repairPrompt, "utf8")).toContain("single permitted repair");
    expect(validateScorecardResponse({
      runDirectory: initialized.runDirectory,
      response: "malformed repaired response",
      attempt: "repair",
    }).valid).toBe(false);

    const second = ingestScorecardResponse({
      runDirectory: initialized.runDirectory,
      response: "malformed repaired response",
      attempt: "repair",
      ingestedAt: "2026-08-03T15:30:00.000Z",
    });
    expect(second.outcome).toBe("FAILED");
    expect(second.manifest.entries[0].status).toBe("FAILED");
    expect(second.manifest.runStatus).toBe("PAUSED");
    expect(() => ingestScorecardResponse({
      runDirectory: initialized.runDirectory,
      response: "a third response is forbidden",
      attempt: "repair",
    })).toThrow("exactly one active");
  });

  it("rejects non-ChatGPT and reused conversation URLs", () => {
    const initialized = initialize();
    expect(() => startNextScorecardTask({
      runDirectory: initialized.runDirectory,
      conversationUrl: "https://example.com/c/not-chatgpt",
    })).toThrow("chatgpt.com");
  });

  it("writes a valid blocked proposal and pauses without opening approval", () => {
    const initialized = initialize();
    startAndWritePrompt(initialized.runDirectory);
    const result = structuredClone(validResearchResult());
    result.taskStatus = "BLOCKED";
    result.blockers = ["Current regulatory records conflict on the legal identity."];
    result.applicationRecommendation = "BLOCKED";
    result.identityDecision.decision = "UNRESOLVED";
    result.recommendedCompany.companyStatus = "REALIZED";
    result.ownerships = [];
    result.milestones = [];
    result.transactionState = "REALIZED";
    result.completenessChecks.identityAndBoundaryResolved = false;
    result.completenessChecks.allActiveOwnersDirectlyEvidenced = false;
    const report = `${result.requestedCompany}\n\nResearch produced a reviewable but blocked scorecard proposal. The legal identity conflict is preserved explicitly and must be resolved before any application can occur.`;
    const response = [
      SCORECARD_JSON_START,
      JSON.stringify(result),
      SCORECARD_JSON_END,
      SCORECARD_REPORT_START,
      report,
      SCORECARD_REPORT_END,
    ].join("\n");
    const ingested = ingestScorecardResponse({
      runDirectory: initialized.runDirectory,
      response,
      attempt: "initial",
      ingestedAt: "2026-08-03T15:00:00.000Z",
    });
    expect(ingested.outcome).toBe("BLOCKED");
    expect(ingested.manifest.runStatus).toBe("PAUSED");
    expect(ingested.manifest.entries[0].proposalHash).toMatch(/^[a-f0-9]{64}$/);
    expect(fs.existsSync(ingested.artifacts.proposal)).toBe(true);
  });
});
