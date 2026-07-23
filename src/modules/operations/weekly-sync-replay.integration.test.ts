import { describe, expect, it, vi } from "vitest";
import {
  weeklyProposalWriteDecision,
  type WeeklyProposalAuditState,
} from "@/modules/operations/weekly-deal-audit";
import { runSerializableTransaction } from "@/modules/operations/serializable-transaction";
import {
  runWeeklySyncLifecycle,
  type WeeklySyncResult,
} from "@/modules/operations/weekly-sync-lifecycle";

type TransactionView = {
  read: () => WeeklyProposalAuditState | null;
  write: (state: WeeklyProposalAuditState) => void;
  audit: (changedFields: string[]) => void;
};

function cloneState(
  state: WeeklyProposalAuditState | null,
): WeeklyProposalAuditState | null {
  return state
    ? {
        record: { ...state.record },
        participants: state.participants.map((participant) => ({ ...participant })),
        citations: state.citations.map((citation) => ({ ...citation })),
      }
    : null;
}

class IsolatedProposalStore {
  state: WeeklyProposalAuditState | null = null;
  audits: string[][] = [];
  transactionAttempts = 0;
  conflictsAfterCallback = 0;
  transactionOptions: unknown[] = [];

  $transaction = async <T>(
    execute: (tx: unknown) => Promise<T>,
    options: unknown,
  ): Promise<T> => {
    this.transactionAttempts += 1;
    this.transactionOptions.push(options);
    const stateSnapshot = cloneState(this.state);
    const auditSnapshot = this.audits.map((fields) => [...fields]);
    const tx: TransactionView = {
      read: () => cloneState(this.state),
      write: (state) => {
        this.state = cloneState(state);
      },
      audit: (changedFields) => {
        this.audits.push([...changedFields]);
      },
    };

    try {
      const result = await execute(tx);
      if (this.conflictsAfterCallback > 0) {
        this.conflictsAfterCallback -= 1;
        throw Object.assign(new Error("serialization conflict"), { code: "P2034" });
      }
      return result;
    } catch (error) {
      this.state = stateSnapshot;
      this.audits = auditSnapshot;
      throw error;
    }
  };
}

function proposal(title = "Infrastructure proposal"): WeeklyProposalAuditState {
  return {
    record: {
      legacyId: "WB-2026-07-18-01",
      title,
      status: "DRAFT",
    },
    participants: [{
      organizationName: "Infrastructure Partners",
      role: "BUYER",
      displayName: "Infrastructure Partners",
    }],
    citations: [{
      sourceUrl: "https://example.com/proposal",
      isPrimary: true,
    }],
  };
}

async function syncProposal(
  store: IsolatedProposalStore,
  proposed: WeeklyProposalAuditState,
): Promise<WeeklySyncResult> {
  return runSerializableTransaction(
    store as never,
    async (rawTx) => {
      const tx = rawTx as unknown as TransactionView;
      const decision = weeklyProposalWriteDecision(tx.read(), proposed);
      if (decision.result === "skipped") return decision.result;
      tx.write(proposed);
      tx.audit(decision.changedFields);
      return decision.result;
    },
    { maxAttempts: 3, maxWait: 10_000, timeout: 30_000 },
  );
}

async function runPipelineAttempt(
  store: IsolatedProposalStore,
  proposed: WeeklyProposalAuditState,
) {
  const complete = vi.fn();
  const fail = vi.fn();
  await runWeeklySyncLifecycle({
    weeklyCardCount: 1,
    execute: async (progress) => {
      progress.setPlan(1, 0);
      progress.beginSync();
      progress.record(await syncProposal(store, proposed));
      progress.beginVerification();
    },
    complete,
    fail,
  });
  expect(fail).not.toHaveBeenCalled();
  return complete.mock.calls[0];
}

describe("weekly sync transactional replay and idempotency", () => {
  it("rolls back a serialization conflict, then records one committed create", async () => {
    const store = new IsolatedProposalStore();
    store.conflictsAfterCallback = 1;

    const [counts, metadata] = await runPipelineAttempt(store, proposal());

    expect(store.transactionAttempts).toBe(2);
    expect(store.state).toEqual(proposal());
    expect(store.audits).toHaveLength(1);
    expect(counts).toEqual({ inserted: 1, updated: 0, skipped: 0 });
    expect(metadata).toEqual({
      phase: "completing",
      weeklyCardCount: 1,
      candidateCount: 1,
      attempted: 1,
    });
    expect(store.transactionOptions).toEqual([
      { isolationLevel: "Serializable", maxWait: 10_000, timeout: 30_000 },
      { isolationLevel: "Serializable", maxWait: 10_000, timeout: 30_000 },
    ]);
  });

  it("turns an exact replay into a skipped no-op with no duplicate audit", async () => {
    const store = new IsolatedProposalStore();
    await runPipelineAttempt(store, proposal());

    const [counts] = await runPipelineAttempt(store, proposal());

    expect(store.state).toEqual(proposal());
    expect(store.audits).toHaveLength(1);
    expect(counts).toEqual({ inserted: 0, updated: 0, skipped: 1 });
  });

  it("records one material update after an idempotent replay", async () => {
    const store = new IsolatedProposalStore();
    await runPipelineAttempt(store, proposal());
    await runPipelineAttempt(store, proposal());

    const [counts] = await runPipelineAttempt(store, proposal("Revised proposal"));

    expect(store.state?.record.title).toBe("Revised proposal");
    expect(store.audits).toEqual([
      ["citations", "legacyId", "participants", "status", "title"],
      ["title"],
    ]);
    expect(counts).toEqual({ inserted: 0, updated: 1, skipped: 0 });
  });
});
