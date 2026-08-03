import { digestsEqual, sha256Canonical } from "./hash";
import {
  manifestInFlightStatuses,
  reconciliationManifestSchema,
  type ReconciliationManifest,
  type ReconciliationManifestTask,
  type ReconciliationManifestTaskStatus,
} from "./schema";

type ManifestWithoutHash = Omit<ReconciliationManifest, "manifestSha256">;

const TERMINAL_STATUSES: readonly ReconciliationManifestTaskStatus[] = [
  "COMPLETED",
  "DEFERRED",
];

const ALLOWED_TRANSITIONS: Record<ReconciliationManifestTaskStatus, readonly ReconciliationManifestTaskStatus[]> = {
  PENDING: ["ACTIVE", "DEFERRED"],
  ACTIVE: ["AWAITING_APPROVAL", "COMPLETED", "FAILED", "BLOCKED"],
  AWAITING_APPROVAL: ["APPLYING", "DEFERRED", "BLOCKED"],
  APPLYING: ["VERIFYING", "FAILED", "BLOCKED"],
  VERIFYING: ["COMPLETED", "FAILED", "BLOCKED"],
  COMPLETED: [],
  FAILED: ["ACTIVE", "DEFERRED"],
  BLOCKED: ["ACTIVE", "DEFERRED"],
  DEFERRED: [],
};

function finalizeManifestValue(input: ManifestWithoutHash): ReconciliationManifest {
  const normalized = reconciliationManifestSchema.parse({
    ...input,
    manifestSha256: "0".repeat(64),
  });
  const { manifestSha256: _manifestSha256, ...withoutHash } = normalized;
  return reconciliationManifestSchema.parse({
    ...withoutHash,
    manifestSha256: sha256Canonical(withoutHash),
  });
}

export function createReconciliationManifest(
  input: ManifestWithoutHash,
): ReconciliationManifest {
  return finalizeManifestValue(input);
}

export function verifyReconciliationManifest(input: unknown): ReconciliationManifest {
  const manifest = reconciliationManifestSchema.parse(input);
  const { manifestSha256, ...withoutHash } = manifest;
  if (!digestsEqual(manifestSha256, sha256Canonical(withoutHash))) {
    throw new Error("Reconciliation manifest hash does not match its canonical contents");
  }
  return manifest;
}

function derivedRunState(
  tasks: readonly ReconciliationManifestTask[],
): Pick<ReconciliationManifest, "runStatus" | "phase"> {
  const inFlight = tasks.filter((task) =>
    (manifestInFlightStatuses as readonly string[]).includes(task.status));
  if (inFlight.length > 1) {
    throw new Error("Cannot derive run state with more than one in-flight task");
  }
  if (inFlight.length === 1) {
    const task = inFlight[0];
    return {
      runStatus: task.status === "AWAITING_APPROVAL" ? "AWAITING_APPROVAL" : "RUNNING",
      phase: task.kind === "CENSUS_MANAGER"
        ? "RECOVERY"
        : task.kind === "LEDGER_CHANGE"
          ? "RECONCILIATION"
          : "SCORECARD_REFRESH",
    };
  }
  if (tasks.length > 0 && tasks.every((task) => TERMINAL_STATUSES.includes(task.status))) {
    return { runStatus: "COMPLETE", phase: "COMPLETE" };
  }
  if (tasks.some((task) => task.status === "BLOCKED" || task.status === "FAILED")) {
    return { runStatus: "BLOCKED", phase: phaseForNextTask(tasks) };
  }
  return { runStatus: "IDLE", phase: phaseForNextTask(tasks) };
}

function phaseForNextTask(tasks: readonly ReconciliationManifestTask[]): ReconciliationManifest["phase"] {
  const next = [...tasks]
    .sort((left, right) => left.sequence - right.sequence)
    .find((task) => !TERMINAL_STATUSES.includes(task.status));
  if (!next) return "COMPLETE";
  if (next.kind === "CENSUS_MANAGER") return "RECOVERY";
  if (next.kind === "LEDGER_CHANGE") return "RECONCILIATION";
  return "SCORECARD_REFRESH";
}

export interface ManifestTransitionOptions {
  error?: string | null;
  artifacts?: ReconciliationManifestTask["artifacts"];
}

export function transitionManifestTask(
  input: ReconciliationManifest,
  taskId: string,
  targetStatus: ReconciliationManifestTaskStatus,
  now: string,
  options: ManifestTransitionOptions = {},
): ReconciliationManifest {
  const manifest = verifyReconciliationManifest(input);
  const parsedNow = new Date(now);
  if (Number.isNaN(parsedNow.valueOf()) || parsedNow.toISOString() !== now) {
    throw new Error("Manifest transitions require a canonical UTC ISO timestamp");
  }
  const index = manifest.tasks.findIndex((task) => task.taskId === taskId);
  if (index < 0) throw new Error(`Unknown manifest task ${taskId}`);
  const current = manifest.tasks[index];
  if (!ALLOWED_TRANSITIONS[current.status].includes(targetStatus)) {
    throw new Error(`Invalid manifest transition ${current.status} -> ${targetStatus}`);
  }

  if (targetStatus === "ACTIVE") {
    const otherInFlight = manifest.tasks.find((task) =>
      task.taskId !== taskId
      && (manifestInFlightStatuses as readonly string[]).includes(task.status));
    if (otherInFlight) {
      throw new Error(`Cannot activate ${taskId}; ${otherInFlight.taskId} is still in flight`);
    }
    const unfinishedPredecessor = manifest.tasks
      .filter((task) => task.sequence < current.sequence)
      .find((task) => !TERMINAL_STATUSES.includes(task.status));
    if (unfinishedPredecessor) {
      throw new Error(
        `Cannot activate ${taskId} before predecessor ${unfinishedPredecessor.taskId} reaches a terminal state`,
      );
    }
  }

  const completed = targetStatus === "COMPLETED" || targetStatus === "DEFERRED";
  const nextTask: ReconciliationManifestTask = {
    ...current,
    status: targetStatus,
    attempts: targetStatus === "ACTIVE" ? current.attempts + 1 : current.attempts,
    startedAt: targetStatus === "ACTIVE" ? now : current.startedAt,
    updatedAt: now,
    completedAt: completed ? now : null,
    artifacts: options.artifacts ?? current.artifacts,
    error: options.error === undefined
      ? (targetStatus === "FAILED" || targetStatus === "BLOCKED" ? current.error : null)
      : options.error,
  };
  if ((targetStatus === "FAILED" || targetStatus === "BLOCKED") && !nextTask.error) {
    throw new Error(`${targetStatus} tasks require a non-empty error`);
  }
  const tasks = manifest.tasks.map((task, taskIndex) => taskIndex === index ? nextTask : task);
  const runState = derivedRunState(tasks);
  const { manifestSha256: _manifestSha256, ...withoutHash } = manifest;
  return finalizeManifestValue({
    ...withoutHash,
    ...runState,
    updatedAt: now,
    tasks,
  });
}

export function activateNextManifestTask(
  input: ReconciliationManifest,
  now: string,
): ReconciliationManifest {
  const manifest = verifyReconciliationManifest(input);
  const inFlight = manifest.tasks.find((task) =>
    (manifestInFlightStatuses as readonly string[]).includes(task.status));
  if (inFlight) throw new Error(`Cannot activate another task while ${inFlight.taskId} is in flight`);
  const next = [...manifest.tasks]
    .sort((left, right) => left.sequence - right.sequence)
    .find((task) => task.status === "PENDING" || task.status === "FAILED" || task.status === "BLOCKED");
  if (!next) throw new Error("Manifest has no resumable task");
  return transitionManifestTask(manifest, next.taskId, "ACTIVE", now);
}

export function appendManifestTasks(
  input: ReconciliationManifest,
  tasksToAppend: readonly ReconciliationManifestTask[],
  now: string,
): ReconciliationManifest {
  const manifest = verifyReconciliationManifest(input);
  if (!["IDLE", "COMPLETE"].includes(manifest.runStatus)) {
    throw new Error("Tasks can be appended only while the manifest is idle or complete");
  }
  if (tasksToAppend.length === 0) return manifest;
  const maxSequence = manifest.tasks.reduce((maximum, task) => Math.max(maximum, task.sequence), 0);
  if (tasksToAppend.some((task) => task.sequence <= maxSequence || task.status !== "PENDING")) {
    throw new Error("Appended tasks must be pending with sequence values after the existing queue");
  }
  const tasks = [...manifest.tasks, ...tasksToAppend];
  const runState = derivedRunState(tasks);
  const { manifestSha256: _manifestSha256, ...withoutHash } = manifest;
  return finalizeManifestValue({
    ...withoutHash,
    ...runState,
    updatedAt: now,
    tasks,
  });
}
