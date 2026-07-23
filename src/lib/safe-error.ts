export type SafeErrorClassification =
  | "authorization_error"
  | "configuration_error"
  | "conflict_error"
  | "database_error"
  | "internal_error"
  | "not_found"
  | "timeout_error"
  | "upstream_error"
  | "validation_error";

export type SafeErrorDetails = {
  classification: SafeErrorClassification;
  message: string;
};

export type SafeOperationalErrorCode =
  | "dashboard_refresh_window_invalid"
  | "database_protocol_invalid"
  | "database_target_forbidden"
  | "database_target_metadata_missing"
  | "database_target_mismatch"
  | "database_url_invalid"
  | "database_url_missing"
  | "database_url_mutation_required"
  | "database_url_required"
  | "maintenance_review_metadata_missing"
  | "maintenance_target_invalid"
  | "release_sha_invalid"
  | "seed_target_invalid";

const CLASSIFICATION_MESSAGES: Record<SafeErrorClassification, string> = {
  authorization_error: "Operation is not authorized.",
  configuration_error: "Required server configuration is unavailable.",
  conflict_error: "Operation could not be completed because state changed.",
  database_error: "Database operation failed.",
  internal_error: "Server operation failed.",
  not_found: "Requested resource was not found.",
  timeout_error: "Server operation timed out.",
  upstream_error: "Upstream operation failed.",
  validation_error: "Operation validation failed.",
};

const OPERATIONAL_ERRORS: Record<SafeOperationalErrorCode, SafeErrorDetails> = {
  dashboard_refresh_window_invalid: {
    classification: "configuration_error",
    message: "DASHBOARD_REFRESH_WINDOW must use YYYY-MM-DD Eastern calendar format.",
  },
  database_protocol_invalid: {
    classification: "configuration_error",
    message: "DATABASE_URL must use the postgres protocol",
  },
  database_target_forbidden: {
    classification: "configuration_error",
    message: "Database mutation target is explicitly forbidden",
  },
  database_target_metadata_missing: {
    classification: "configuration_error",
    message: "EXPECTED_DATABASE_HOST, EXPECTED_DATABASE_NAME, and at least one forbidden host are required for a database mutation",
  },
  database_target_mismatch: {
    classification: "configuration_error",
    message: "Database mutation target does not match the explicitly approved host and database",
  },
  database_url_invalid: {
    classification: "configuration_error",
    message: "DATABASE_URL is not a valid URL",
  },
  database_url_missing: {
    classification: "configuration_error",
    message: "DATABASE_URL is not set.",
  },
  database_url_mutation_required: {
    classification: "configuration_error",
    message: "DATABASE_URL is required for a database mutation",
  },
  database_url_required: {
    classification: "configuration_error",
    message: "DATABASE_URL is required.",
  },
  maintenance_review_metadata_missing: {
    classification: "configuration_error",
    message: "MUTATION_REVIEWED_BY and MUTATION_REASON are required for maintenance writes",
  },
  maintenance_target_invalid: {
    classification: "configuration_error",
    message: "TARGET_DATABASE must explicitly be development, validation, or production",
  },
  release_sha_invalid: {
    classification: "configuration_error",
    message: "RELEASE_SHA must be the exact lowercase 40-character reviewed commit",
  },
  seed_target_invalid: {
    classification: "configuration_error",
    message: "Database seeding requires TARGET_DATABASE=development or validation; production is forbidden",
  },
};

const SAFE_CLASSIFICATIONS = new Set<SafeErrorClassification>(
  Object.keys(CLASSIFICATION_MESSAGES) as SafeErrorClassification[],
);
const SAFE_SYSTEM_CODES = new Set([
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "ETIMEDOUT",
]);
const DATABASE_SCHEMA_READINESS_CODES = new Set([
  "42P01", // PostgreSQL undefined_table
  "42703", // PostgreSQL undefined_column
  "P2021", // Prisma table does not exist
  "P2022", // Prisma column does not exist
]);

export class SafeOperationalError extends Error {
  readonly safeCode: SafeOperationalErrorCode;

  constructor(code: SafeOperationalErrorCode) {
    super(OPERATIONAL_ERRORS[code].message);
    this.name = "SafeOperationalError";
    this.safeCode = code;
  }
}

function errorMetadata(error: unknown): {
  name?: string;
  code?: string;
  message?: string;
  httpStatus?: number;
} {
  if (!error || typeof error !== "object") {
    return typeof error === "string" ? { message: error } : {};
  }

  try {
    const candidate = error as {
      name?: unknown;
      code?: unknown;
      message?: unknown;
      status?: unknown;
      statusCode?: unknown;
    };
    const status = typeof candidate.status === "number"
      ? candidate.status
      : typeof candidate.statusCode === "number" ? candidate.statusCode : undefined;
    return {
      name: typeof candidate.name === "string" ? candidate.name : undefined,
      code: typeof candidate.code === "string" ? candidate.code : undefined,
      message: typeof candidate.message === "string" ? candidate.message : undefined,
      httpStatus: status && status >= 400 && status <= 599 ? Math.round(status) : undefined,
    };
  } catch {
    return {};
  }
}

function classificationForStatus(status: number | undefined): SafeErrorClassification | undefined {
  if (status === 401 || status === 403) return "authorization_error";
  if (status === 404) return "not_found";
  if (status === 408 || status === 504) return "timeout_error";
  if (status === 409) return "conflict_error";
  if (status === 400 || status === 422) return "validation_error";
  if (status === 502 || status === 503) return "upstream_error";
  if (status && status >= 500) return "internal_error";
  return undefined;
}

function classificationForMessage(message: string): SafeErrorClassification | undefined {
  if (/timeout|timed out/i.test(message)) return "timeout_error";
  if (/unauthori[sz]ed|forbidden|permission denied/i.test(message)) return "authorization_error";
  if (/not found|missing resource/i.test(message)) return "not_found";
  if (/conflict|changed (?:during|after)|stale write/i.test(message)) return "conflict_error";
  if (/DATABASE_URL|EXPECTED_DATABASE_|DASHBOARD_REFRESH_WINDOW|TARGET_DATABASE|RELEASE_SHA|NEXTAUTH_SECRET|not configured|required configuration/i.test(message)) {
    return "configuration_error";
  }
  if (/validation|invalid|malformed|parse|schema/i.test(message)) return "validation_error";
  if (/provider|upstream|fetch|network|outage|HTTP\s*[45]\d{2}/i.test(message)) return "upstream_error";
  return undefined;
}

function safeCodeSuffix(code: string, classification: SafeErrorClassification): string | undefined {
  if (classification === "database_error" && /^P\d{4}$/.test(code)) return code;
  if (SAFE_SYSTEM_CODES.has(code)) return code;
  return undefined;
}

function safeHttpStatus(message: string, metadataStatus: number | undefined): number | undefined {
  if (metadataStatus) return metadataStatus;
  const match = message.match(/\bHTTP(?:\s+status)?\s*[:=]?\s*([45]\d{2})\b/i)
    ?? message.match(/\b([45]\d{2})\s+(?:rate limit|response|status|error)\b/i);
  return match ? Number(match[1]) : undefined;
}

export function getSafeErrorDetails(
  error: unknown,
  status?: number,
  explicitClassification?: SafeErrorClassification,
): SafeErrorDetails | undefined {
  if (error instanceof SafeOperationalError) return OPERATIONAL_ERRORS[error.safeCode];

  const { name = "", code = "", message = "", httpStatus: metadataStatus } = errorMetadata(error);
  const explicit = explicitClassification && SAFE_CLASSIFICATIONS.has(explicitClassification)
    ? explicitClassification
    : undefined;
  const classification = explicit
    ?? (/^P\d{4}$/.test(code) || name.includes("Prisma") ? "database_error" : undefined)
    ?? (name === "AuthorizationError" ? "authorization_error" : undefined)
    ?? (name === "AbortError" || code === "ETIMEDOUT" ? "timeout_error" : undefined)
    ?? (SAFE_SYSTEM_CODES.has(code) ? "upstream_error" : undefined)
    ?? (["SyntaxError", "ValidationError", "ZodError"].includes(name) ? "validation_error" : undefined)
    ?? classificationForMessage(message)
    ?? classificationForStatus(status)
    ?? (error === undefined ? undefined : "internal_error");

  if (!classification) return undefined;

  const baseMessage = CLASSIFICATION_MESSAGES[classification];
  const httpStatus = safeHttpStatus(message, metadataStatus);
  const safeCode = safeCodeSuffix(code, classification);
  const suffix = httpStatus ? `HTTP ${httpStatus}` : safeCode;
  return {
    classification,
    message: suffix ? `${baseMessage.slice(0, -1)} (${suffix}).` : baseMessage,
  };
}

export function formatSafeErrorSummary(
  error: unknown,
  status?: number,
  explicitClassification?: SafeErrorClassification,
): string {
  const details = getSafeErrorDetails(error, status, explicitClassification)
    ?? { classification: "internal_error" as const, message: CLASSIFICATION_MESSAGES.internal_error };
  return `${details.classification}: ${details.message}`;
}

/**
 * Identify only the fixed database codes that mean the deployed application
 * schema is not yet readable. No message parsing is used because driver
 * messages can contain database, table, host, or query details.
 */
export function isDatabaseSchemaReadinessError(error: unknown): boolean {
  return DATABASE_SCHEMA_READINESS_CODES.has(errorMetadata(error).code ?? "");
}

/**
 * Emits a bounded, machine-readable failure record for scheduled and
 * maintenance scripts. Raw exception messages are intentionally excluded so
 * database URLs, imported row contents, and provider payloads cannot leak into
 * CI logs or workflow artifacts.
 */
export function reportSafeScriptError(task: string, error: unknown): void {
  const details = getSafeErrorDetails(error)
    ?? { classification: "internal_error" as const, message: CLASSIFICATION_MESSAGES.internal_error };
  console.error(JSON.stringify({
    task,
    errorClassification: details.classification,
    errorMessage: details.message,
  }));
}
