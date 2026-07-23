type IsolationEnvironment = Record<string, string | undefined>;
const FULL_RELEASE_SHA = /^[0-9a-f]{40}$/;

export function requireFullReleaseSha(
  environment: IsolationEnvironment = process.env,
): string {
  const releaseSha = environment.RELEASE_SHA;
  if (!releaseSha || !FULL_RELEASE_SHA.test(releaseSha)) {
    throw new Error(
      "Browser validation requires RELEASE_SHA to be a full lowercase Git SHA.",
    );
  }
  return releaseSha;
}

export function assertIsolatedE2EDatabase(environment: IsolationEnvironment = process.env) {
  const connectionString = environment.E2E_DATABASE_URL;
  const expectedHost = environment.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const expectedDatabase = environment.EXPECTED_DATABASE_NAME?.trim();
  const forbiddenHosts = [
    environment.FORBIDDEN_DATABASE_HOST,
    environment.FORBIDDEN_DATABASE_HOST_2,
  ]
    .map((host) => host?.trim().toLowerCase())
    .filter((host): host is string => Boolean(host));

  if (!connectionString) throw new Error("Browser validation requires E2E_DATABASE_URL.");
  if (!expectedHost) throw new Error("Browser validation requires EXPECTED_DATABASE_HOST.");
  if (!expectedDatabase) throw new Error("Browser validation requires EXPECTED_DATABASE_NAME.");
  if (forbiddenHosts.length === 0) {
    throw new Error("Browser validation requires at least one forbidden production host.");
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
  const actualDatabase = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (actualHost !== expectedHost) {
    throw new Error("Browser validation database host does not match EXPECTED_DATABASE_HOST.");
  }
  if (forbiddenHosts.includes(actualHost)) {
    throw new Error("Browser validation database host matches a forbidden production host.");
  }
  if (actualDatabase !== expectedDatabase) {
    throw new Error("Browser validation database name does not match EXPECTED_DATABASE_NAME.");
  }
}

export function assertLocalE2EApplication(environment: IsolationEnvironment = process.env) {
  if (environment.PLAYWRIGHT_BASE_URL) {
    throw new Error("Database-backed browser validation must use Playwright's local server.");
  }
}

export function assertIsolatedBrowserTarget(environment: IsolationEnvironment = process.env) {
  assertLocalE2EApplication(environment);
  assertIsolatedE2EDatabase(environment);
  requireFullReleaseSha(environment);
}
