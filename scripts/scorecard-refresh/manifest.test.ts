import { describe, expect, it } from "vitest";
import {
  buildScorecardManifest,
  loadManagerUniverse,
  recordMalformedResponse,
  resumePausedManifest,
  startNextTask,
  transitionTask,
} from "./manifest";
import { HASH_A, HASH_B } from "./test-fixtures";

const at = (hour: number) => `2026-08-03T${String(hour).padStart(2, "0")}:00:00.000Z`;

function company(
  companyId: string,
  canonicalName: string,
  applicableManagers: string[],
  isPublished = true,
) {
  return { companyId, canonicalName, country: "United States", applicableManagers, isPublished, companySnapshotHash: HASH_A };
}

function manifest() {
  return buildScorecardManifest({
    asOfDate: "2026-08-03",
    generatedAt: at(9),
    sourceDatabaseSnapshotHash: HASH_B,
    companies: [
      company("remaining", "Aardvark Remaining", ["Manager Outside Universe"]),
      company("blackrock", "BlackRock Company", ["Global Infrastructure Partners", "BlackRock"]),
      company("acadia-z", "Zeta Utility", ["Acadia Infrastructure Capital"]),
      company("first", "First Company", ["3i Infrastructure"]),
      company("acadia-a", "Alpha Utility", ["Acadia Infrastructure Capital"]),
      company("draft", "Unpublished Company", ["3i Infrastructure"], false),
    ],
  });
}

describe("deterministic scorecard manifest", () => {
  it("uses manager order, alphabetizes within manager, assigns overlaps once, then appends remaining companies", () => {
    const result = manifest();
    expect(loadManagerUniverse()).toHaveLength(100);
    expect(result.entries.map((entry) => entry.canonicalName)).toEqual([
      "First Company",
      "Alpha Utility",
      "Zeta Utility",
      "BlackRock Company",
      "Aardvark Remaining",
    ]);
    const overlap = result.entries.find((entry) => entry.companyId === "blackrock")!;
    expect(overlap.assignedManager).toBe("BlackRock");
    expect(overlap.applicableManagers).toEqual(["BlackRock", "Global Infrastructure Partners"]);
    expect(result.entries.filter((entry) => entry.companyId === "blackrock")).toHaveLength(1);
  });

  it("rejects duplicate canonical company identities", () => {
    expect(() => buildScorecardManifest({
      asOfDate: "2026-08-03",
      generatedAt: at(9),
      sourceDatabaseSnapshotHash: HASH_B,
      companies: [company("one", "Duplicate Co", []), company("two", "duplicate co", [])],
    })).toThrow("duplicate canonical");
  });
});

describe("single-company manifest lifecycle", () => {
  it("allows one repair, then fails and pauses on a second malformed response", () => {
    let state = startNextTask(manifest(), {
      startedAt: at(10),
      conversationUrl: "https://chatgpt.com/c/first-company",
    });
    expect(() => startNextTask(state, {
      startedAt: at(11),
      conversationUrl: "https://chatgpt.com/c/second-company",
    })).toThrow("already active");

    const taskId = state.entries[0].taskId;
    state = recordMalformedResponse(state, { taskId, at: at(11), validationMessage: "Missing citations" });
    expect(state.entries[0]).toMatchObject({ status: "REPAIRING", repairAttempts: 1 });
    state = recordMalformedResponse(state, { taskId, at: at(12), validationMessage: "Still malformed" });
    expect(state.entries[0]).toMatchObject({ status: "FAILED", repairAttempts: 1 });
    expect(state.runStatus).toBe("PAUSED");
    expect(() => startNextTask(state, {
      startedAt: at(13),
      conversationUrl: "https://chatgpt.com/c/second-company",
    })).toThrow("Resume");

    state = resumePausedManifest(state, { resumedAt: at(13), reason: "Failure reviewed" });
    expect(() => startNextTask(state, {
      startedAt: at(14),
      conversationUrl: "https://chatgpt.com/c/first-company",
    })).toThrow("fresh ChatGPT conversation URL");
    state = startNextTask(state, {
      startedAt: at(14),
      conversationUrl: "https://chatgpt.com/c/second-company",
    });
    expect(state.entries[1].status).toBe("RESEARCHING");
  });

  it("requires the same approved proposal hash through application and verification", () => {
    let state = startNextTask(manifest(), {
      startedAt: at(10),
      conversationUrl: "https://chatgpt.com/c/first-company",
    });
    const taskId = state.entries[0].taskId;
    state = transitionTask(state, { taskId, to: "AWAITING_APPROVAL", at: at(11), proposalHash: HASH_A });
    expect(() => transitionTask(state, {
      taskId,
      to: "APPLYING",
      at: at(12),
      approvalId: "approval-1",
      approvedProposalHash: HASH_B,
    })).toThrow("different proposal hash");
    state = transitionTask(state, {
      taskId,
      to: "APPLYING",
      at: at(12),
      approvalId: "approval-1",
      approvedProposalHash: HASH_A,
    });
    state = transitionTask(state, { taskId, to: "VERIFYING", at: at(13) });
    state = transitionTask(state, { taskId, to: "COMPLETED", at: at(14) });
    expect(state.entries[0].status).toBe("COMPLETED");
    expect(state.runStatus).toBe("READY");
  });
});
