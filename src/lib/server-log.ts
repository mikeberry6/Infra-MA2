type ServerLog = {
  route: string;
  operation: string;
  durationMs: number;
  status: number;
  requestId?: string | null;
};

export function logServerOperation(entry: ServerLog) {
  console.info(JSON.stringify({
    level: entry.status >= 500 ? "error" : entry.status >= 400 ? "warn" : "info",
    timestamp: new Date().toISOString(),
    ...entry,
  }));
}
