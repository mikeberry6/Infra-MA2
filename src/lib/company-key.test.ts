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

  it("normalizes AlphaGen to Alpha Generation", () => {
    expect(canonicalCompanyKey("AlphaGen")).toBe("alpha generation");
    expect(canonicalCompanyKey("Alpha Generation, LLC")).toBe("alpha generation");
    expect(canonicalCompanyKey("Alpha Generation (AlphaGen)")).toBe("alpha generation");
  });

  it.each(["US", "U.S.", "United States"])(
    "preserves a geographic (%s) parenthetical",
    (scope) => {
      expect(canonicalCompanyKey(`Boldyn Networks (${scope})`)).not.toBe(
        canonicalCompanyKey("Boldyn Networks"),
      );
    },
  );

  it("normalizes equivalent geographic parenthetical scopes", () => {
    const scopedNames = ["US", "U.S.", "USA", "United States"]
      .map((scope) => canonicalCompanyKey(`Boldyn Networks (${scope})`));
    expect(new Set(scopedNames)).toEqual(new Set(["boldyn networks united states"]));
  });

  it("preserves identity-defining JV parentheticals", () => {
    expect(canonicalCompanyKey(
      "U.S. Medical Outpatient Facilities Portfolio (Montecito JV)",
    )).not.toBe(canonicalCompanyKey(
      "U.S. Medical Outpatient Facilities Portfolio (MedCraft JV)",
    ));
  });

  it.each([
    ["SOLCAP (KeyState Renewables JVs)", "SOLCAP"],
    ["Platform (North America)", "Platform"],
    ["Platform (United Kingdom)", "Platform"],
    ["Platform (Asia Pacific)", "Platform"],
    ["Platform (Latin America)", "Platform"],
    ["Platform (Global)", "Platform"],
  ])("preserves other explicit scope parentheticals: %s", (scoped, unscoped) => {
    expect(canonicalCompanyKey(scoped)).not.toBe(canonicalCompanyKey(unscoped));
  });

  it.each([
    "Platform (via Acme JV)",
    "Platform (formerly Legacy JV)",
    "Platform (aka Legacy JV)",
    "Platform (including Acme JV)",
  ])("continues stripping explicit alias parentheticals: %s", (variant) => {
    expect(canonicalCompanyKey(variant)).toBe(canonicalCompanyKey("Platform"));
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

  it("clusters all Alpha Generation and AlphaGen variants", () => {
    const groups = groupByDedupKeys([
      "Alpha Generation, LLC",
      "Alpha Generation (AlphaGen)",
      "AlphaGen",
    ], companyDedupKeys);
    expect(groups).toEqual([[
      "Alpha Generation, LLC",
      "Alpha Generation (AlphaGen)",
      "AlphaGen",
    ]]);
  });

  it.each([
    ["American Student Transportation Partners (ASTP)", "American Student Transportation Partners"],
    ["Direct ChassisLink Inc. (DCLI)", "Direct ChassisLink Inc."],
    ["Gulf Coast Express Pipeline (GCX)", "Gulf Coast Express Pipeline"],
    ["Transportation Equipment Network (TEN)", "Transportation Equipment Network"],
    ["Skyservice US (formerly Leading Edge Jet Center)", "Skyservice US"],
  ])("continues collapsing non-identity parenthetical variants: %s", (variant, base) => {
    expect(intersects(companyDedupKeys(variant), companyDedupKeys(base))).toBe(true);
  });

  it("keeps geographic and JV parenthetical scopes distinct", () => {
    for (const scope of ["US", "U.S.", "United States"]) {
      expect(intersects(
        companyDedupKeys(`Boldyn Networks (${scope})`),
        companyDedupKeys("Boldyn Networks"),
      )).toBe(false);
    }

    expect(intersects(
      companyDedupKeys("Boldyn Networks (US)"),
      companyDedupKeys("Boldyn Networks (United States)"),
    )).toBe(true);

    expect(intersects(
      companyDedupKeys("U.S. Medical Outpatient Facilities Portfolio (Montecito JV)"),
      companyDedupKeys("U.S. Medical Outpatient Facilities Portfolio (MedCraft JV)"),
    )).toBe(false);
  });

  it("collapses ALLO-style entity-suffix dupes", () => {
    const a = companyDedupKeys("ALLO Communications, LLC");
    const b = companyDedupKeys("ALLO Communications");
    expect(intersects(a, b)).toBe(true);
  });

  it("collapses Vantage platform and stabilized-portfolio variants", () => {
    const canonical = companyDedupKeys("Vantage Data Centers");
    expect(intersects(
      canonical,
      companyDedupKeys("Vantage Data Centers North America"),
    )).toBe(true);
    expect(intersects(
      canonical,
      companyDedupKeys("Vantage Data Centers Stabilized North America Portfolio"),
    )).toBe(true);
    expect(intersects(
      canonical,
      companyDedupKeys("Vantage SDC"),
    )).toBe(true);
  });

  it("collapses intended BCI portfolio-company variants", () => {
    const cleco = companyDedupKeys("Cleco Corporation");
    expect(intersects(
      cleco,
      companyDedupKeys("Cleco Group"),
    )).toBe(true);
    expect(intersects(
      cleco,
      companyDedupKeys("Cleco Corporate Holdings LLC"),
    )).toBe(true);

    expect(intersects(
      companyDedupKeys("GCT Global Container Terminals"),
      companyDedupKeys("GCT Global Container Terminals Inc."),
    )).toBe(true);
  });

  it("does not conflate Puget Energy / Puget Sound Energy with the utility", () => {
    expect(intersects(
      companyDedupKeys("Puget Energy / Puget Sound Energy"),
      companyDedupKeys("Puget Sound Energy"),
    )).toBe(false);
  });

  it("does NOT collapse legitimately different companies", () => {
    expect(intersects(
      companyDedupKeys("Renewable Energy AssetCo 1"),
      companyDedupKeys("Renewable Energy AssetCo 2"),
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

  it("keeps the Vantage platform name when variants are merged", () => {
    expect(preferredDisplayName([
      "Vantage Data Centers",
      "Vantage Data Centers Stabilized North America Portfolio",
      "Vantage SDC",
    ])).toBe("Vantage Data Centers");
  });

  it("uses clean BCI canonical names when portfolio variants are merged", () => {
    expect(preferredDisplayName([
      "Cleco Corporate Holdings LLC",
      "Cleco Corporation",
    ])).toBe("Cleco Corporation");
    expect(preferredDisplayName([
      "GCT Global Container Terminals Inc.",
      "GCT Global Container Terminals",
    ])).toBe("GCT Global Container Terminals");
  });

  it("returns the only entry when given one", () => {
    expect(preferredDisplayName(["Acme Corp"])).toBe("Acme Corp");
  });

  it("returns empty string for an empty list", () => {
    expect(preferredDisplayName([])).toBe("");
  });
});
