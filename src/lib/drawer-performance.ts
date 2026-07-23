export type DrawerKind = "deal" | "fund" | "company";

export const DRAWER_SHELL_BUDGET_MS = 100;

function startMark(kind: DrawerKind): string {
  return `infrasight:drawer-shell:${kind}:start`;
}

export function drawerShellMeasure(kind: DrawerKind): string {
  return `infrasight:drawer-shell:${kind}`;
}

export function isDrawerShellWithinBudget(durationMs: number): boolean {
  return Number.isFinite(durationMs) && durationMs >= 0 && durationMs < DRAWER_SHELL_BUDGET_MS;
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
