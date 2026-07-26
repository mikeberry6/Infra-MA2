export type DatabaseConnectionQueryPolicy = {
  requireSslMode?: boolean;
};

export function hasSafeDatabaseConnectionQuery(
  parsed: URL,
  policy: DatabaseConnectionQueryPolicy = {},
): boolean {
  const seen = new Set<string>();
  for (const [name, value] of parsed.searchParams) {
    if (seen.has(name)) return false;
    seen.add(name);
    if (name === "sslmode") {
      if (!/^(?:require|verify-ca|verify-full)$/.test(value)) return false;
    } else if (name === "channel_binding") {
      if (value !== "require") return false;
    } else if (name === "pgbouncer") {
      if (value !== "true") return false;
    } else if (name === "connect_timeout") {
      if (!/^[1-9][0-9]*$/.test(value) || Number(value) > 60) return false;
    } else {
      return false;
    }
  }
  return !policy.requireSslMode || seen.has("sslmode");
}
