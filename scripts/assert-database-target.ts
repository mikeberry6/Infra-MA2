/**
 * Fail closed unless DATABASE_URL resolves to the explicitly approved host
 * and database and does not resolve to a forbidden opposite-environment host.
 * Workflows use this before any migration, verification, or pipeline write.
 * Only non-sensitive host/database identifiers are printed.
 */

const connectionString = process.env.DATABASE_URL;
const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
const forbiddenHosts = [
  process.env.FORBIDDEN_DATABASE_HOST,
  process.env.FORBIDDEN_DATABASE_HOST_2,
]
  .map((value) => value?.trim().toLowerCase())
  .filter((value): value is string => Boolean(value));
const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();

function fail(message: string): never {
  console.error(`Database target guard failed: ${message}`);
  process.exit(1);
}

if (!connectionString) fail("DATABASE_URL is required.");
if (!expectedHost) fail("EXPECTED_DATABASE_HOST is required.");
if (!expectedDatabase) fail("EXPECTED_DATABASE_NAME is required.");
if (forbiddenHosts.length === 0) fail("at least one FORBIDDEN_DATABASE_HOST is required.");

let parsed: URL;
try {
  parsed = new URL(connectionString);
} catch {
  fail("DATABASE_URL is not a valid URL.");
}

if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
  fail(`unsupported protocol ${parsed.protocol || "unknown"}.`);
}

const actualHost = parsed.hostname.toLowerCase();
const actualDatabase = decodeURIComponent(parsed.pathname.replace(/^\//, ""));

if (actualHost !== expectedHost) {
  fail(`actual host ${actualHost || "unknown"} does not match the approved host.`);
}
if (forbiddenHosts.includes(actualHost)) {
  fail("the approved target matches a forbidden database host.");
}
if (actualDatabase !== expectedDatabase) {
  fail(`database ${actualDatabase || "unknown"} does not match EXPECTED_DATABASE_NAME.`);
}

console.log(
  `Database target guard passed for host ${actualHost}, database ${actualDatabase || "(default)"}.`,
);
