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
 * reviews. SHA-256 binds the approved content to the public record and also
 * serves as the optimistic-concurrency token for review actions.
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
  return createHash("sha256").update(content).digest("hex");
}
