import { describe, expect, it } from "vitest";
import { buildFundSourceLinks } from "./sources";

describe("buildFundSourceLinks", () => {
  it("puts the reviewed primary source first and removes its duplicate", () => {
    expect(buildFundSourceLinks(
      "https://www.example.com/fund",
      ["https://www.example.com/fund", "https://manager.example/strategy"],
    )).toEqual([
      {
        url: "https://www.example.com/fund",
        hostname: "example.com",
        label: "Primary source",
        isPrimary: true,
      },
      {
        url: "https://manager.example/strategy",
        hostname: "manager.example",
        label: "Supporting source 1",
        isPrimary: false,
      },
    ]);
  });

  it("renders a distinct primary URL even when there are no supporting sources", () => {
    expect(buildFundSourceLinks("https://example.com/primary", [])).toEqual([
      expect.objectContaining({
        url: "https://example.com/primary",
        label: "Primary source",
        isPrimary: true,
      }),
    ]);
  });

  it("numbers supporting sources and excludes invalid or unsafe URLs", () => {
    expect(buildFundSourceLinks(null, [
      "javascript:alert(1)",
      "not a URL",
      "https://one.example/source",
      "http://two.example/source",
    ])).toEqual([
      expect.objectContaining({ label: "Supporting source 1", hostname: "one.example" }),
      expect.objectContaining({ label: "Supporting source 2", hostname: "two.example" }),
    ]);
  });
});
