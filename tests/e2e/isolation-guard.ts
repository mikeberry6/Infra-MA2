type IsolationEnvironment = Record<string, string | undefined>;

/**
 * Fail closed before any authenticated browser test can run unless its
 * PostgreSQL URL matches the explicit validation allow-list and differs from
 * every configured production host.
 */
export function assertIsolatedE2EDatabase(environment: IsolationEnvironment = process.env) {
  const connectionString = environment.E2E_DATABASE_URL;
  const expectedHost = environment.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const forbiddenHosts = [
    environment.FORBIDDEN_DATABASE_HOST,
    environment.FORBIDDEN_DATABASE_HOST_2,
  ]
    .map((host) => host?.trim().toLowerCase())
    .filter((host): host is string => Boolean(host));

  if (!connectionString) {
    throw new Error("Authenticated write E2E requires E2E_DATABASE_URL.");
  }
  if (!expectedHost) {
    throw new Error("Authenticated write E2E requires EXPECTED_DATABASE_HOST.");
  }
  if (forbiddenHosts.length === 0) {
    throw new Error("Authenticated write E2E requires at least one FORBIDDEN_DATABASE_HOST.");
  }

  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new Error("E2E_DATABASE_URL must be a valid PostgreSQL URL.");
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("E2E_DATABASE_URL must use the postgres or postgresql protocol.");
  }

  const actualHost = parsed.hostname.toLowerCase();
  if (actualHost !== expectedHost) {
    throw new Error(
      `Authenticated write E2E database host ${actualHost || "(missing)"} does not match EXPECTED_DATABASE_HOST.`,
    );
  }
  if (forbiddenHosts.includes(actualHost)) {
    throw new Error("Authenticated write E2E database host matches a forbidden production host.");
  }

  const expectedDatabase = environment.EXPECTED_DATABASE_NAME?.trim();
  const actualDatabase = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (expectedDatabase && actualDatabase !== expectedDatabase) {
    throw new Error(
      `Authenticated write E2E database ${actualDatabase || "(missing)"} does not match EXPECTED_DATABASE_NAME.`,
    );
  }
}

/** A remote app ignores the local E2E database override and is never writable. */
export function assertLocalE2EApplication(environment: IsolationEnvironment = process.env) {
  if (environment.PLAYWRIGHT_BASE_URL) {
    throw new Error(
      "Authenticated write E2E refuses PLAYWRIGHT_BASE_URL; it must use Playwright's local web server.",
    );
  }
}

export function assertIsolatedWriteTarget(environment: IsolationEnvironment = process.env) {
  assertLocalE2EApplication(environment);
  assertIsolatedE2EDatabase(environment);
}
