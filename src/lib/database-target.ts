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
  if (forbiddenHosts.includes(host)) {
    throw new Error("Database mutation target is explicitly forbidden");
  }
}
