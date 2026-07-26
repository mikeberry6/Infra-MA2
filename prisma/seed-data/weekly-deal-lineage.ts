/**
 * Explicit weekly-card → canonical seed lineage for records whose curated
 * source replaced the source retained in the historical email or whose
 * historical card/seed has no source. These mappings are identity exceptions,
 * not publication approvals: target and date must still match before a caller
 * may use the canonical seed ID.
 *
 * Keep this list narrow. A same-target record with a missing or different
 * source is otherwise treated as a potentially distinct transaction and
 * fails closed.
 */
export const WEEKLY_DEAL_SEED_LINEAGE = {
  "WB-2026-02-14-001": "INF-2026-012",
  "WB-2026-02-14-002": "INF-2026-030",
  "WB-2026-02-14-004": "INF-2026-024",
  "WB-2026-02-14-006": "INF-2026-062",
  "WB-2026-02-14-008": "INF-2026-049",
  "WB-2026-02-21-001": "INF-2026-080",
  "WB-2026-02-21-002": "INF-2026-081",
  "WB-2026-02-21-003": "INF-2026-082",
  "WB-2026-02-21-004": "INF-2026-083",
  "WB-2026-02-21-005": "INF-2026-084",
  "WB-2026-02-21-006": "INF-2026-085",
  "WB-2026-02-21-007": "INF-2026-087",
  "WB-2026-02-21-008": "INF-2026-088",
  "WB-2026-02-21-009": "INF-2026-089",
  "WB-2026-02-21-010": "INF-2026-090",
  "WB-2026-02-21-011": "INF-2026-091",
  "WB-2026-02-21-012": "INF-2026-092",
  "WB-2026-02-21-013": "INF-2026-093",
  "WB-2026-02-21-014": "INF-2026-094",
  "WB-2026-02-21-015": "INF-2026-095",
  "WB-2026-03-07-008": "INF-2026-107",
  "WB-2026-03-14-006": "INF-2026-134",
  "WB-2026-03-14-008": "INF-2026-129",
  "WB-2026-03-21-008": "INF-2026-146",
  "WB-2026-05-02-010": "INF-2026-197",
} as const satisfies Readonly<Record<string, string>>;
