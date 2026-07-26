import type { SafeErrorClassification } from "@/lib/safe-error";

/**
 * Marks an error message as deliberately safe to show to an authenticated
 * administrator. Arbitrary exceptions must never cross the server-action
 * boundary because Prisma and driver messages can contain database details.
 */
export class AdminActionUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminActionUserError";
  }
}

export function adminActionErrorMessage(error: unknown, fallback: string): string {
  return error instanceof AdminActionUserError ? error.message : fallback;
}

export interface AdminActionLogOutcome {
  status: 403 | 404 | 409 | 422 | 500;
  errorClassification?: SafeErrorClassification;
}

function errorCode(error: unknown): string | undefined {
  return error && typeof error === "object" && "code" in error
    && typeof (error as { code?: unknown }).code === "string"
    ? (error as { code: string }).code
    : undefined;
}

/**
 * Maps an already-caught admin failure to truthful operational semantics.
 * The returned classification selects a fixed safe log message; the original
 * admin message, identifiers, form contents, and Prisma payload never enter
 * the structured envelope.
 */
export function adminActionLogOutcome(
  error: unknown,
  options: { authorizationError?: boolean } = {},
): AdminActionLogOutcome {
  if (options.authorizationError) {
    return { status: 403, errorClassification: "authorization_error" };
  }
  if (errorCode(error) === "P2034") {
    return { status: 409, errorClassification: "conflict_error" };
  }
  if (error instanceof AdminActionUserError) {
    if (/\bnot found\b/i.test(error.message)) {
      return { status: 404, errorClassification: "not_found" };
    }
    if (
      /\b(?:already current|archive|archived|blocked|cannot|changed|conflict|delete|dependent|history|in progress|must retain|never-published|no longer requires|publication|published|stale|workflow)\b/i
        .test(error.message)
    ) {
      return { status: 409, errorClassification: "conflict_error" };
    }
    return { status: 422, errorClassification: "validation_error" };
  }
  return { status: 500 };
}
