import { describe, it, expect } from "vitest";
import {
  canonicalCompanyKey,
  companyDedupKeys,
  groupByDedupKeys,
  preferredDisplayName,
} from "./company-key";

const intersects = (a: Set<string>, b: Set<string>) => {
  for (const x of a) if (b.has(x)) return true;
  return false;
};

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

describe("canonicalCompanyKey — trailing asset descriptors", () => {
  it("strips 'Pipeline Project' to match 'Pipeline'", () => {
    expect(canonicalCompanyKey("Coastal GasLink Pipeline Project")).toBe(
      canonicalCompanyKey("Coastal GasLink Pipeline"),
    );
  });
  it("strips 'Portfolio'", () => {
    expect(canonicalCompanyKey("Pearl/Ruby Solar Portfolio")).toBe(
      canonicalCompanyKey("Pearl Ruby Solar"),
    );
  });
});

describe("companyDedupKeys — multi-key matching", () => {
  it("returns two keys for parenthetical descriptive subnames", () => {
    const a = companyDedupKeys("Etobicoke General Hospital (Phase 1 Patient Tower)");
    const b = companyDedupKeys("Etobicoke General Hospital Phase 1 Patient Tower");
    expect(intersects(a, b)).toBe(true);
  });

  it("still collapses ASTP-style aliases", () => {
    const a = companyDedupKeys("American Student Transportation Partners (ASTP)");
    const b = companyDedupKeys("American Student Transportation Partners");
    expect(intersects(a, b)).toBe(true);
  });

  it("collapses ALLO-style entity-suffix dupes", () => {
    const a = companyDedupKeys("ALLO Communications, LLC");
    const b = companyDedupKeys("ALLO Communications");
    expect(intersects(a, b)).toBe(true);
  });

  it("does NOT collapse legitimately different companies", () => {
    expect(intersects(
      companyDedupKeys("Renewable Energy AssetCo 1"),
      companyDedupKeys("Renewable Energy AssetCo 2"),
    )).toBe(false);
    expect(intersects(
      companyDedupKeys("Vantage Data Centers"),
      companyDedupKeys("Vantage Data Centers Stabilized North America Portfolio"),
    )).toBe(false);
  });
});

describe("groupByDedupKeys — union-find clustering", () => {
  it("collapses items that share any key (transitively)", () => {
    const items = ["A LLC", "A Inc", "B Corp"];
    const groups = groupByDedupKeys(items, companyDedupKeys);
    expect(groups).toHaveLength(2);
    const aGroup = groups.find((g) => g.includes("A LLC"))!;
    expect(aGroup).toEqual(expect.arrayContaining(["A LLC", "A Inc"]));
  });

  it("transitively merges chains: a≈b, b≈c → {a,b,c}", () => {
    // The "(Phase 1)" form bridges between "Hospital" and "Hospital Phase 1".
    const items = [
      "Etobicoke General Hospital",
      "Etobicoke General Hospital (Phase 1 Patient Tower)",
      "Etobicoke General Hospital Phase 1 Patient Tower",
    ];
    const groups = groupByDedupKeys(items, companyDedupKeys);
    expect(groups).toHaveLength(1);
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
