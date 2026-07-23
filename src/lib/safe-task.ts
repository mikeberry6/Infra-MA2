import { reportSafeScriptError } from "./safe-error";

type SafeTaskContext = {
  task: string;
  operation: string;
};

/**
 * Keep scheduled and maintenance command failures privacy-safe without
 * introducing the request IDs, timing fields, or structured route logging
 * owned by the later observability phase.
 */
export async function withSafeTask<T>(
  context: SafeTaskContext,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    reportSafeScriptError(context.task, error);
    throw error;
  }
}
