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

  it("expands known short company names into public-news aliases", () => {
    const aliases = companyAliases("IAC");

    expect(aliases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ term: "iac", confidence: "High" }),
        expect.objectContaining({ term: "international aerospace coatings", confidence: "High" }),
      ]),
    );

    const matches = matchNewsCandidates("H.I.G. Capital Completes Acquisition of International Aerospace Coatings", [
      {
        id: "company-iac",
        label: "IAC",
        type: "PortCo",
        aliases,
      },
    ]);

    expect(matches.map((match) => match.label)).toEqual(["IAC"]);
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

  it("matches dotted and collapsed manager acronyms", () => {
    const aliases = managerAliases("H.I.G. Capital");

    expect(aliases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ term: "h i g capital", confidence: "High" }),
        expect.objectContaining({ term: "hig capital", confidence: "High" }),
      ]),
    );

    const matches = matchNewsCandidates("HIG Capital snaps up International Aerospace Coatings", [
      {
        id: "firm-hig",
        label: "H.I.G. Capital",
        type: "Investment Firm",
        aliases,
      },
    ]);

    expect(matches.map((match) => match.label)).toEqual(["H.I.G. Capital"]);
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
