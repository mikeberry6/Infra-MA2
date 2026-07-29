import { describe, expect, it } from "vitest";
import {
  hashImportValue,
  mergeUniqueStrings,
  partyArray,
  stringArray,
} from "./domain";

describe("import domain helpers", () => {
  it("hashes object keys canonically while preserving array order", () => {
    expect(hashImportValue({ b: 2, a: 1 })).toBe(
      hashImportValue({ a: 1, b: 2 }),
    );
    expect(hashImportValue({ values: ["a", "b"] })).not.toBe(
      hashImportValue({ values: ["b", "a"] }),
    );
  });

  it("normalizes delimited values, parties, and URL-style merge inputs", () => {
    expect(stringArray(" Core ; Value-Add ; Core ")).toEqual([
      "Core",
      "Value-Add",
    ]);
    expect(partyArray(" Buyer A / N/A / Buyer A / — / Buyer B ")).toEqual([
      "Buyer A",
      "Buyer B",
    ]);
    expect(
      mergeUniqueStrings(
        ["https://example.com/old"],
        ["https://example.com/old", " https://example.com/new "],
      ),
    ).toEqual([
      "https://example.com/old",
      "https://example.com/new",
    ]);
  });
});
