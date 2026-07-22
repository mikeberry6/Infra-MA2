import { createHash } from "node:crypto";

export interface DashboardSignalHashContent {
  section: string;
  title: string;
  summary: string;
  direction: string;
  severity: number;
  sourceName: string;
  sourceUrl?: string | null;
}

/**
 * Deterministic change detector for the fields an administrator actually
 * reviews. MD5 is not used as an authentication primitive; its compact output
 * is only an optimistic-concurrency token.
 */
export function dashboardSignalContentHash(item: DashboardSignalHashContent): string {
  const content = [
    item.section,
    item.title,
    item.summary,
    item.direction,
    String(item.severity),
    item.sourceName,
    item.sourceUrl ?? "",
  ].join("\u001f");
  return createHash("md5").update(content).digest("hex");
}
