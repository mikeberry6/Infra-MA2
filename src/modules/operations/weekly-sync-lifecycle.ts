import type { Prisma } from "@/generated/prisma/client";
import { reportSuppressedTaskFailure } from "@/lib/task-cleanup";
import type { PipelineCounts } from "@/modules/operations/pipeline-runs";

export type WeeklySyncResult = "created" | "updated" | "skipped";
export type WeeklySyncPhase = "planning" | "syncing" | "verifying" | "completing";

export type WeeklySyncLifecycleMetadata = Prisma.InputJsonObject & {
  phase: WeeklySyncPhase;
  weeklyCardCount: number;
  candidateCount: number;
  attempted: number;
};

function nonNegativeInteger(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative safe integer.`);
  }
  return value;
}

export class WeeklySyncProgress {
  readonly #weeklyCardCount: number;
  #phase: WeeklySyncPhase = "planning";
  #candidateCount = 0;
  #attempted = 0;
  #inserted = 0;
  #updated = 0;
  #skipped = 0;

  constructor(weeklyCardCount: number) {
    this.#weeklyCardCount = nonNegativeInteger(weeklyCardCount, "weeklyCardCount");
  }

  setPlan(candidateCount: number, skipped: number): void {
    this.#candidateCount = nonNegativeInteger(candidateCount, "candidateCount");
    this.#skipped = nonNegativeInteger(skipped, "skipped");
  }

  beginSync(): void {
    this.#phase = "syncing";
  }

  record(result: WeeklySyncResult): void {
    this.#attempted += 1;
    if (result === "created") this.#inserted += 1;
    else if (result === "updated") this.#updated += 1;
    else this.#skipped += 1;
  }

  beginVerification(): void {
    this.#phase = "verifying";
  }

  beginCompletion(): void {
    this.#phase = "completing";
  }

  counts(): Required<PipelineCounts> {
    return {
      inserted: this.#inserted,
      updated: this.#updated,
      skipped: this.#skipped,
    };
  }

  metadata(): WeeklySyncLifecycleMetadata {
    return {
      phase: this.#phase,
      weeklyCardCount: this.#weeklyCardCount,
      candidateCount: this.#candidateCount,
      attempted: this.#attempted,
    };
  }
}

export async function runWeeklySyncLifecycle(input: {
  weeklyCardCount: number;
  execute: (progress: WeeklySyncProgress) => Promise<void>;
  complete: (
    counts: Required<PipelineCounts>,
    metadata: WeeklySyncLifecycleMetadata,
  ) => Promise<void>;
  fail: (
    error: unknown,
    counts: Required<PipelineCounts>,
    metadata: WeeklySyncLifecycleMetadata,
  ) => Promise<void>;
}): Promise<void> {
  const progress = new WeeklySyncProgress(input.weeklyCardCount);
  try {
    await input.execute(progress);
    progress.beginCompletion();
    await input.complete(progress.counts(), progress.metadata());
  } catch (error) {
    try {
      await input.fail(error, progress.counts(), progress.metadata());
    } catch (failureRecordingError) {
      reportSuppressedTaskFailure({
        task: "weekly_deal_sync",
        operation: "record_pipeline_failure",
      }, failureRecordingError);
    }
    throw error;
  }
}
