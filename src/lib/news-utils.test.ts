import { describe, expect, it } from "vitest";
import {
  companyAliases,
  isUsefulNewsTerm,
  managerAliases,
  matchNewsCandidates,
  textContainsNewsTerm,
  type NewsMatchCandidate,
} from "./news-utils";

describe("news matching utilities", () => {
  it("rejects low-signal one-word infrastructure terms", () => {
    expect(isUsefulNewsTerm("Energy")).toBe(false);
    expect(isUsefulNewsTerm("Infrastructure")).toBe(false);
    expect(isUsefulNewsTerm("Brookfield")).toBe(true);
  });

  it("matches normalized company names without matching partial words", () => {
    const matches = matchNewsCandidates("ALLO Communications expands fiber service.", [
      {
        id: "company-1",
        label: "ALLO Communications, LLC",
        type: "PortCo",
        href: "/portfolio?focus=company-1",
        aliases: companyAliases("ALLO Communications, LLC"),
      },
    ]);
    expect(matches).toHaveLength(1);
    expect(textContainsNewsTerm("The megawattage increased.", "Watt")).toBe(false);
  });

  it("creates short-form manager aliases with medium confidence", () => {
    const aliases = managerAliases("Brookfield Asset Management");
    expect(aliases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ term: "brookfield asset management", confidence: "High" }),
        expect.objectContaining({ term: "brookfield", confidence: "Medium" }),
      ]),
    );
  });

  it("returns matched tracked entities in stable priority order", () => {
    const candidates: NewsMatchCandidate[] = [
      {
        id: "firm-1",
        label: "Brookfield Asset Management",
        type: "Investment Firm",
        href: "/funds",
        aliases: managerAliases("Brookfield Asset Management"),
      },
      {
        id: "company-1",
        label: "DataBank",
        type: "PortCo",
        href: "/portfolio?focus=company-1",
        aliases: companyAliases("DataBank"),
      },
    ];

    const matches = matchNewsCandidates(
      "Brookfield is evaluating options for DataBank after a period of digital infrastructure growth.",
      candidates,
    );

    expect(matches.map((m) => m.label)).toEqual(["DataBank", "Brookfield Asset Management"]);
    expect(matches[1].confidence).toBe("Medium");
  });
});

describe("investment firm subject matching", () => {
  const firms = ["Morgan Stanley", "Morgan Stanley Infrastructure", "Morgan Stanley Infrastructure Partners"]
    .map((label, index): NewsMatchCandidate => ({
      id: `firm-${index}`,
      label,
      type: "Investment Firm",
      aliases: managerAliases(label),
    }));

  it("excludes a firm that is only providing ratings commentary", () => {
    expect(matchNewsCandidates(
      "Morgan Stanley downgrades flatexDEGIRO as customer growth slows, slashes target. Morgan Stanley downgraded flatexDEGIRO AG.",
      firms,
    )).toEqual([]);
    expect(matchNewsCandidates("Morgan Stanley Infrastructure Partners downgraded an issuer.", firms)).toEqual([]);
  });

  it("attributes a longer exact organization name to the firm identified as investing", () => {
    expect(matchNewsCandidates(
      "Morgan Stanley Infrastructure Partners acquires a controlling stake in an operator.",
      firms,
    ).map(({ label }) => label)).toEqual(["Morgan Stanley Infrastructure Partners"]);
    expect(matchNewsCandidates(
      "Morgan Stanley agrees to acquire an infrastructure company.",
      firms,
    ).map(({ label }) => label)).toEqual(["Morgan Stanley"]);
  });
});
