export type DrawerKind = "deal" | "fund" | "company";

export const DRAWER_SHELL_BUDGET_MS = 100;

function startMark(kind: DrawerKind): string {
  return `infrasight:drawer-shell:${kind}:start`;
}

export function drawerShellMeasure(kind: DrawerKind): string {
  return `infrasight:drawer-shell:${kind}`;
}

export function drawerShellBudgetExceededMark(kind: DrawerKind): string {
  return `infrasight:drawer-shell:${kind}:over-budget`;
}

/** Starts a payload-free browser timing immediately before a drawer state update. */
export function markDrawerOpen(kind: DrawerKind): void {
  if (typeof performance === "undefined" || typeof performance.mark !== "function") return;
  const name = startMark(kind);
  performance.clearMarks(name);
  performance.mark(name);
}

/** Records only the latest shell timing so long sessions do not accumulate entries. */
export function measureDrawerShell(kind: DrawerKind): number | null {
  if (
    typeof performance === "undefined"
    || typeof performance.measure !== "function"
    || typeof performance.getEntriesByName !== "function"
  ) return null;

  const start = startMark(kind);
  if (performance.getEntriesByName(start, "mark").length === 0) return null;

  const measure = drawerShellMeasure(kind);
  try {
    performance.clearMeasures(measure);
    const entry = performance.measure(measure, start);
    return entry.duration;
  } finally {
    performance.clearMarks(start);
  }
}

/**
 * Evaluates the committed shell against the fixed regression budget. A
 * payload-free over-budget mark lets browser diagnostics identify the drawer
 * kind without recording IDs, labels, URLs, or query state.
 */
export function recordDrawerShellTiming(
  kind: DrawerKind,
): { durationMs: number; withinBudget: boolean } | null {
  const durationMs = measureDrawerShell(kind);
  if (durationMs === null) return null;
  const withinBudget = durationMs < DRAWER_SHELL_BUDGET_MS;
  if (!withinBudget && typeof performance.mark === "function") {
    const mark = drawerShellBudgetExceededMark(kind);
    performance.clearMarks(mark);
    performance.mark(mark);
  }
  return { durationMs, withinBudget };
}
