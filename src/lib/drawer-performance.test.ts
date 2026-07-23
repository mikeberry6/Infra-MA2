import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DRAWER_SHELL_BUDGET_MS,
  drawerShellMeasure,
  isDrawerShellWithinBudget,
  markDrawerOpen,
  measureDrawerShell,
} from "@/lib/drawer-performance";

describe("drawer performance timing", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("measures a payload-free shell interval and clears its start mark", () => {
    const marks = new Set<string>();
    const clearMeasures = vi.fn();
    const clearMarks = vi.fn((name: string) => marks.delete(name));
    const measure = vi.fn((name: string) => ({ name, duration: 42 }));
    vi.stubGlobal("performance", {
      mark: (name: string) => marks.add(name),
      clearMarks,
      clearMeasures,
      getEntriesByName: (name: string) => marks.has(name) ? [{ name }] : [],
      measure,
    });

    markDrawerOpen("deal");
    expect(measureDrawerShell("deal")).toBe(42);
    expect(measure).toHaveBeenCalledWith(
      drawerShellMeasure("deal"),
      "infrasight:drawer-shell:deal:start",
    );
    expect(clearMeasures).toHaveBeenCalledWith(drawerShellMeasure("deal"));
    expect(clearMarks).toHaveBeenLastCalledWith("infrasight:drawer-shell:deal:start");
  });

  it("defines the shell acceptance target as strictly below 100 ms", () => {
    expect(DRAWER_SHELL_BUDGET_MS).toBe(100);
    expect(isDrawerShellWithinBudget(0)).toBe(true);
    expect(isDrawerShellWithinBudget(99.99)).toBe(true);
    expect(isDrawerShellWithinBudget(100)).toBe(false);
    expect(isDrawerShellWithinBudget(Number.NaN)).toBe(false);
  });

  it("does not invent a measurement for URL-opened drawers without a start mark", () => {
    vi.stubGlobal("performance", {
      getEntriesByName: () => [],
      measure: vi.fn(),
    });
    expect(measureDrawerShell("company")).toBeNull();
  });
});
