import { describe, it, expect } from "vitest";
import { canonicalCompanyKey, preferredDisplayName } from "./company-key";

describe("canonicalCompanyKey", () => {
  it("collapses entity suffixes (LLC, Inc, Ltd, etc.)", () => {
    expect(canonicalCompanyKey("ALLO Communications, LLC")).toBe(
      canonicalCompanyKey("ALLO Communications"),
    );
    expect(canonicalCompanyKey("Foo Capital Partners")).toBe(
      canonicalCompanyKey("Foo Capital, LLC"),
    );
    expect(canonicalCompanyKey("Acme Inc.")).toBe(canonicalCompanyKey("Acme"));
    expect(canonicalCompanyKey("Acme Corporation")).toBe(canonicalCompanyKey("Acme"));
  });

  it("strips parenthetical aliases", () => {
    expect(canonicalCompanyKey("American Student Transportation Partners (ASTP)")).toBe(
      canonicalCompanyKey("American Student Transportation Partners"),
    );
    expect(canonicalCompanyKey("CVC (CVC DIF)")).toBe(canonicalCompanyKey("CVC"));
  });

  it("strips '(via X)' subsidiary tags", () => {
    expect(canonicalCompanyKey("Brookfield Renewable (via TerraForm)")).toBe(
      canonicalCompanyKey("Brookfield Renewable"),
    );
  });

  it("normalizes ampersands and punctuation", () => {
    expect(canonicalCompanyKey("AT&T")).toBe(canonicalCompanyKey("AT and T"));
    expect(canonicalCompanyKey("Pacific Gas & Electric Co.")).toBe(
      canonicalCompanyKey("Pacific Gas and Electric"),
    );
  });

  it("strips a leading 'The'", () => {
    expect(canonicalCompanyKey("The Boring Company")).toBe(canonicalCompanyKey("Boring"));
  });

  it("does NOT collapse legitimately different companies", () => {
    // Different leading words → different keys, even with suffix-strip.
    expect(canonicalCompanyKey("Student Transportation Inc.")).not.toBe(
      canonicalCompanyKey("Landmark Student Transportation"),
    );
    // Different sectors / no shared root.
    expect(canonicalCompanyKey("Apple Inc.")).not.toBe(canonicalCompanyKey("Microsoft Corp"));
    // Hyphen vs space: "ALL-CO" and "ALLO" should NOT match (different tokens).
    expect(canonicalCompanyKey("ALL-CO Power")).not.toBe(canonicalCompanyKey("ALLO Power"));
  });

  it("is idempotent (canonical(canonical(x)) === canonical(x))", () => {
    const samples = [
      "ALLO Communications, LLC",
      "American Student Transportation Partners (ASTP)",
      "AT&T",
      "Brookfield Renewable (via TerraForm)",
    ];
    for (const s of samples) {
      const once = canonicalCompanyKey(s);
      expect(canonicalCompanyKey(once)).toBe(once);
    }
  });

  it("handles empty / whitespace input", () => {
    expect(canonicalCompanyKey("")).toBe("");
    expect(canonicalCompanyKey("   ")).toBe("");
  });
});

describe("preferredDisplayName", () => {
  it("picks the variant with the most tokens", () => {
    expect(preferredDisplayName(["ALLO Communications", "ALLO Communications, LLC"])).toBe(
      "ALLO Communications, LLC",
    );
  });

  it("ties on tokens are broken by length", () => {
    expect(preferredDisplayName(["AT&T Inc", "AT and T Inc"])).toBe("AT and T Inc");
  });

  it("returns the only entry when given one", () => {
    expect(preferredDisplayName(["Acme Corp"])).toBe("Acme Corp");
  });

  it("returns empty string for an empty list", () => {
    expect(preferredDisplayName([])).toBe("");
  });
});
