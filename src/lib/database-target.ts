import { SafeOperationalError } from "@/lib/safe-error";

/**
 * Fail closed before a script creates a database client capable of mutation.
 * The selected host and database must both match explicit, non-secret workflow
 * inputs, and at least one opposite-environment host must be forbidden.
 */
export function assertMutationDatabaseTarget(input: {
  connectionString?: string;
  expectedHost?: string;
  expectedDatabase?: string;
  forbiddenHosts?: Array<string | undefined>;
}): void {
  if (!input.connectionString) throw new SafeOperationalError("database_url_mutation_required");
  const expectedHost = input.expectedHost?.trim().toLowerCase();
  const expectedDatabase = input.expectedDatabase?.trim();
  const forbiddenHosts = (input.forbiddenHosts ?? [])
    .map((host) => host?.trim().toLowerCase())
    .filter((host): host is string => Boolean(host));
  if (!expectedHost || !expectedDatabase || forbiddenHosts.length === 0) {
    throw new SafeOperationalError("database_target_metadata_missing");
  }

  let parsed: URL;
  try {
    parsed = new URL(input.connectionString);
  } catch {
    throw new SafeOperationalError("database_url_invalid");
  }
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new SafeOperationalError("database_protocol_invalid");
  }

  const host = parsed.hostname.toLowerCase();
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (host !== expectedHost || database !== expectedDatabase) {
    throw new SafeOperationalError("database_target_mismatch");
  }
  if (forbiddenHosts.includes(host)) {
    throw new SafeOperationalError("database_target_forbidden");
  }
}

type MutationEnvironment = Record<string, string | undefined>;

function mutationTargetInput(environment: MutationEnvironment) {
  return {
    connectionString: environment.DATABASE_URL,
    expectedHost: environment.EXPECTED_DATABASE_HOST,
    expectedDatabase: environment.EXPECTED_DATABASE_NAME,
    forbiddenHosts: [
      environment.FORBIDDEN_DATABASE_HOST,
      environment.FORBIDDEN_DATABASE_HOST_2,
    ],
  };
}

export function assertMutationDatabaseTargetFromEnv(
  environment: MutationEnvironment = process.env,
): void {
  assertMutationDatabaseTarget(mutationTargetInput(environment));
}

export function assertNonProductionSeedTarget(
  environment: MutationEnvironment = process.env,
): "development" | "validation" {
  assertMutationDatabaseTarget(mutationTargetInput(environment));
  const target = environment.TARGET_DATABASE;
  if (target !== "development" && target !== "validation") {
    throw new SafeOperationalError("seed_target_invalid");
  }
  return target;
}

export type MaintenanceMutationContext = {
  targetDatabase: "development" | "validation" | "production";
  releaseSha: string;
  reviewedBy: string;
  reason: string;
};

export function assertMaintenanceMutationContext(
  environment: MutationEnvironment = process.env,
): MaintenanceMutationContext {
  assertMutationDatabaseTarget(mutationTargetInput(environment));
  const targetDatabase = environment.TARGET_DATABASE;
  if (!["development", "validation", "production"].includes(targetDatabase ?? "")) {
    throw new SafeOperationalError("maintenance_target_invalid");
  }
  const releaseSha = environment.RELEASE_SHA?.trim() ?? "";
  if (!/^[0-9a-f]{40}$/.test(releaseSha)) {
    throw new SafeOperationalError("release_sha_invalid");
  }
  const reviewedBy = environment.MUTATION_REVIEWED_BY?.trim() ?? "";
  const reason = environment.MUTATION_REASON?.trim() ?? "";
  if (!reviewedBy || !reason) {
    throw new SafeOperationalError("maintenance_review_metadata_missing");
  }
  return {
    targetDatabase: targetDatabase as MaintenanceMutationContext["targetDatabase"],
    releaseSha,
    reviewedBy,
    reason,
  };
}

export function assertApprovalReviewerMatchesMutationContext(
  approvalReviewedBy: string,
  context: MaintenanceMutationContext,
): void {
  if (approvalReviewedBy !== context.reviewedBy) {
    throw new Error("MUTATION_REVIEWED_BY must exactly match the committed approval reviewer.");
  }
}
