import { describe, expect, it } from "vitest";
import { compareUnicodeCodePoints } from "@/lib/deterministic-string-order";

describe("deterministic string ordering", () => {
  it("uses stable Unicode code-point order instead of the host locale", () => {
    const values = ["Ørsted", "Zeta", "Énergir", "Alpha", "😀 Grid", "💡 Power"];
    const expected = ["Alpha", "Zeta", "Énergir", "Ørsted", "💡 Power", "😀 Grid"];

    expect([...values].sort(compareUnicodeCodePoints)).toEqual(expected);
    expect([...values].reverse().sort(compareUnicodeCodePoints)).toEqual(expected);
    expect([...values].sort(new Intl.Collator("en-US").compare)).not.toEqual(
      [...values].sort(new Intl.Collator("sv-SE").compare),
    );
  });

  it("orders prefixes before longer strings and treats equal strings equally", () => {
    expect(compareUnicodeCodePoints("Grid", "Grid")).toBe(0);
    expect(compareUnicodeCodePoints("Grid", "Grid A")).toBeLessThan(0);
    expect(compareUnicodeCodePoints("Grid A", "Grid")).toBeGreaterThan(0);
  });
});
