import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { afterAll, describe, expect, it } from "vitest";
import { finalizeProposal } from "./integrity";
import {
  SCORECARD_JSON_END,
  SCORECARD_JSON_START,
  SCORECARD_REPORT_END,
  SCORECARD_REPORT_START,
} from "./prompt";
import { HASH_A, HASH_B, validPromptContext, validResearchResult } from "./test-fixtures";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const tsxCliPath = path.join(projectRoot, "node_modules/tsx/dist/cli.mjs");
const runDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "scorecard-refresh-cli-test-"));
const inputPath = path.join(runDirectory, "input.json");
const contextPath = path.join(runDirectory, "context-input.json");
const responsePath = path.join(runDirectory, "response-input.txt");
const approvalPath = path.join(runDirectory, "approval-input.json");

afterAll(() => fs.rmSync(runDirectory, { recursive: true, force: true }));

function run(script: string, args: string[]): string {
  return execFileSync(process.execPath, [tsxCliPath, path.join(import.meta.dirname, script), ...args], {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

describe("scorecard refresh command-line entry points", () => {
  it("runs the complete non-database research and approval-validation CLI lifecycle", () => {
    fs.writeFileSync(inputPath, JSON.stringify({
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
    }));

    const initialized = JSON.parse(run("init-run.ts", [
      "--input", inputPath,
      "--run-dir", runDirectory,
      "--generated-at", "2026-08-03T12:00:00.000Z",
    ])) as { initialized: boolean; companyCount: number };
    expect(initialized).toMatchObject({ initialized: true, companyCount: 1 });

    const pending = JSON.parse(run("next-task.ts", ["--run-dir", runDirectory])) as { state: string };
    expect(pending.state).toBe("PENDING");

    const active = JSON.parse(run("next-task.ts", [
      "--run-dir", runDirectory,
      "--start",
      "--conversation-url", "https://chatgpt.com/c/example-scorecard",
      "--started-at", "2026-08-03T12:30:00.000Z",
    ])) as { state: string; task: { status: string } };
    expect(active).toMatchObject({ state: "ACTIVE", task: { status: "RESEARCHING" } });

    fs.writeFileSync(contextPath, JSON.stringify(validPromptContext()));
    const prompt = JSON.parse(run("build-worker-prompt.ts", [
      "--run-dir", runDirectory,
      "--context", contextPath,
    ])) as { taskId: string; promptPath: string };
    expect(prompt.taskId).toBe("company:company-1");
    expect(fs.readFileSync(prompt.promptPath, "utf8")).toContain("entire scorecard");

    const result = validResearchResult();
    const report = `${result.requestedCompany}\n\nIdentity, ownership, operations, milestones, management, evidence, changes, and deal reconciliation were independently reviewed. The complete proposal is ready for individual approval.`;
    fs.writeFileSync(responsePath, [
      SCORECARD_JSON_START,
      JSON.stringify(result),
      SCORECARD_JSON_END,
      SCORECARD_REPORT_START,
      report,
      SCORECARD_REPORT_END,
    ].join("\n"));
    const validated = JSON.parse(run("validate-response.ts", [
      "--run-dir", runDirectory,
      "--input", responsePath,
      "--attempt", "initial",
    ])) as { valid: boolean };
    expect(validated.valid).toBe(true);

    const ingested = JSON.parse(run("ingest-response.ts", [
      "--run-dir", runDirectory,
      "--input", responsePath,
      "--attempt", "initial",
      "--ingested-at", "2026-08-03T15:00:00.000Z",
    ])) as { outcome: string; artifacts: { proposal: string; report: string } };
    expect(ingested.outcome).toBe("AWAITING_APPROVAL");
    expect(fs.existsSync(ingested.artifacts.proposal)).toBe(true);
    expect(fs.existsSync(ingested.artifacts.report)).toBe(true);

    const proposal = finalizeProposal(result);
    fs.writeFileSync(approvalPath, JSON.stringify({
      schemaVersion: 1,
      artifactType: "SCORECARD_REFRESH_APPROVAL",
      approvalId: "approval-cli-company",
      companyId: proposal.companyId,
      requestedCompany: proposal.requestedCompany,
      decision: "APPROVED",
      proposalHash: proposal.proposalHash,
      companySnapshotHash: HASH_A,
      sourceDatabaseSnapshotHash: HASH_B,
      approvedBy: "User",
      approvedAt: "2026-08-03T16:00:00.000Z",
    }));
    const approval = JSON.parse(run("validate-approval.ts", [
      "--run-dir", runDirectory,
      "--approval", approvalPath,
      "--current-company-snapshot-hash", HASH_A,
      "--current-source-database-snapshot-hash", HASH_B,
    ])) as { valid: boolean; approvalId: string };
    expect(approval).toMatchObject({ valid: true, approvalId: "approval-cli-company" });
  });
});
