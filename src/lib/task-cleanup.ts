import { logServerFailure } from "./server-log";

export function reportSuppressedTaskFailure(
  details: Parameters<typeof logServerFailure>[0],
  error: unknown,
): void {
  try {
    logServerFailure(details, error);
  } catch {
    // Failure reporting is best-effort and must never mask the primary error.
  }
}

export async function runWithPreservedCleanup<T>({
  run,
  cleanup,
  onSuppressedCleanupError,
}: {
  run: () => Promise<T> | T;
  cleanup: () => Promise<void> | void;
  onSuppressedCleanupError: (error: unknown) => void;
}): Promise<T> {
  let hasPrimaryError = false;
  try {
    return await run();
  } catch (error) {
    hasPrimaryError = true;
    throw error;
  } finally {
    try {
      await cleanup();
    } catch (cleanupError) {
      if (!hasPrimaryError) throw cleanupError;
      try {
        onSuppressedCleanupError(cleanupError);
      } catch {
        // Cleanup reporting must never replace the primary task failure.
      }
    }
  }
}
