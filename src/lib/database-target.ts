export function assertMutationDatabaseTarget(input: {
  connectionString?: string;
  expectedHost?: string;
  expectedDatabase?: string;
  forbiddenHosts?: Array<string | undefined>;
}): void {
  if (!input.connectionString) throw new Error("DATABASE_URL is required for a database mutation");
  const expectedHost = input.expectedHost?.trim().toLowerCase();
  const expectedDatabase = input.expectedDatabase?.trim();
  const forbiddenHosts = (input.forbiddenHosts ?? [])
    .map((host) => host?.trim().toLowerCase())
    .filter((host): host is string => Boolean(host));
  if (!expectedHost || !expectedDatabase || forbiddenHosts.length === 0) {
    throw new Error(
      "EXPECTED_DATABASE_HOST, EXPECTED_DATABASE_NAME, and at least one forbidden host are required for a database mutation",
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(input.connectionString);
  } catch {
    throw new Error("DATABASE_URL is not a valid URL");
  }
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("DATABASE_URL must use the postgres protocol");
  }
  const host = parsed.hostname.toLowerCase();
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (host !== expectedHost || database !== expectedDatabase) {
    throw new Error("Database mutation target does not match the explicitly approved host and database");
  }
  if (forbiddenHosts.includes(host)) throw new Error("Database mutation target is explicitly forbidden");
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
    throw new Error("TARGET_DATABASE must be development or validation; production seeding is forbidden");
  }
  return target;
}
