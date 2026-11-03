export function validateApplyTarget(connectionString: string, mode: string | undefined, environment: NodeJS.ProcessEnv, confirmation?: string) {
  const target = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(target.protocol)) throw new Error("Postgres URL required");
  for (const key of target.searchParams.keys()) if (["host", "hostaddr", "port", "database", "dbname", "user", "password", "service", "options", "connectionstring"].includes(key.toLowerCase())) throw new Error("Connection target overrides are forbidden");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname);
  if (mode === "production") {
    if (local || target.hostname !== environment.EXPECTED_DATABASE_HOST || decodeURIComponent(target.pathname.slice(1)) !== environment.EXPECTED_DATABASE_NAME || confirmation !== "APPLY-REVIEWED-BRIEFINGS") throw new Error("Production requires explicit approved host, database and confirmation");
  } else if (mode !== "local" || !local) throw new Error("Apply requires --target local on localhost, or protected production configuration");
  return target;
}
