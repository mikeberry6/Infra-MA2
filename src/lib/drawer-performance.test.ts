import { afterEach, describe, expect, it, vi } from "vitest";
import {
  drawerShellBudgetExceededMark,
  drawerShellMeasure,
  markDrawerOpen,
  measureDrawerShell,
  recordDrawerShellTiming,
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
    expect(measure).toHaveBeenCalledWith(drawerShellMeasure("deal"), "infrasight:drawer-shell:deal:start");
    expect(clearMeasures).toHaveBeenCalledWith(drawerShellMeasure("deal"));
    expect(clearMarks).toHaveBeenLastCalledWith("infrasight:drawer-shell:deal:start");
  });

  it("does not invent a measurement for URL-opened drawers without a start mark", () => {
    vi.stubGlobal("performance", {
      getEntriesByName: () => [],
      measure: vi.fn(),
    });
    expect(measureDrawerShell("company")).toBeNull();
  });

  it("evaluates and marks an over-budget shell without record payloads", () => {
    const marks = new Set<string>();
    vi.stubGlobal("performance", {
      mark: vi.fn((name: string) => marks.add(name)),
      clearMarks: vi.fn((name: string) => marks.delete(name)),
      clearMeasures: vi.fn(),
      getEntriesByName: (name: string) => marks.has(name) ? [{ name }] : [],
      measure: vi.fn((name: string) => ({ name, duration: 125 })),
    });

    markDrawerOpen("fund");
    expect(recordDrawerShellTiming("fund")).toEqual({
      durationMs: 125,
      withinBudget: false,
    });
    expect(performance.mark).toHaveBeenLastCalledWith(
      drawerShellBudgetExceededMark("fund"),
    );
    expect(drawerShellBudgetExceededMark("fund")).not.toMatch(/record|query|url|id/i);
  });

  it("passes a shell below the 100ms budget without an over-budget mark", () => {
    const marks = new Set<string>();
    const mark = vi.fn((name: string) => marks.add(name));
    vi.stubGlobal("performance", {
      mark,
      clearMarks: vi.fn((name: string) => marks.delete(name)),
      clearMeasures: vi.fn(),
      getEntriesByName: (name: string) => marks.has(name) ? [{ name }] : [],
      measure: vi.fn((name: string) => ({ name, duration: 99 })),
    });

    markDrawerOpen("company");
    expect(recordDrawerShellTiming("company")).toEqual({
      durationMs: 99,
      withinBudget: true,
    });
    expect(mark).not.toHaveBeenCalledWith(drawerShellBudgetExceededMark("company"));
  });
});
