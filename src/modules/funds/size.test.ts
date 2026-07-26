import { describe, expect, it } from "vitest";
import { isValidFundSize, normalizeFundSize } from "@/modules/funds/size";

describe("fund size validation", () => {
  it.each([
    "$739M",
    "$5 billion",
    ">$1.0B",
    ">C$100B",
    "~C$32B",
    "£3.8B",
    "€1.15B",
    "USD 2.0bn",
    "[$176.5M+]",
    "[€2.5B]",
    "$1,000,000,000",
    "TBD",
    "[TBD]",
  ])("accepts a disclosed size or explicit TBD: %s", (size) => {
    expect(isValidFundSize(size)).toBe(true);
  });

  it.each([
    "",
    "—",
    "–",
    "-",
    "N/A",
    "n/a",
    "TBU",
    "[TBU]",
    "unknown",
    "undisclosed",
    "large fund",
    "123",
    "$500",
  ])("rejects a missing, ambiguous, or arbitrary placeholder: %s", (size) => {
    expect(isValidFundSize(size)).toBe(false);
  });

  it("canonicalizes legacy bracketed TBD input without rewriting disclosed values", () => {
    expect(normalizeFundSize("  [ TBD ]  ")).toBe("TBD");
    expect(normalizeFundSize("  ~$3.0B  ")).toBe("~$3.0B");
  });
});
