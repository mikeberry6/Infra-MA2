import { describe, expect, it, vi } from "vitest";

const permanentRedirect = vi.hoisted(() => vi.fn(() => {
  throw new Error("NEXT_REDIRECT");
}));

vi.mock("next/navigation", () => ({ permanentRedirect }));

import Home from "./page";

describe("root route", () => {
  it("permanently redirects the duplicate landing page to the canonical tracker", () => {
    expect(() => Home()).toThrow("NEXT_REDIRECT");
    expect(permanentRedirect).toHaveBeenCalledWith("/tracker");
  });
});
