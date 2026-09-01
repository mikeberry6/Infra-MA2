import { beforeAll, describe, expect, it } from "vitest";
import {
  buildPortfolioFundAttributionLedger,
  validateLedger,
} from "./generate-portfolio-fund-attribution";

let ledger: ReturnType<typeof buildPortfolioFundAttributionLedger>;

beforeAll(() => {
  ledger = buildPortfolioFundAttributionLedger("2026-08-16");
}, 60_000);

describe("portfolio fund attribution ledger", () => {
  it("covers every active ownership row exactly once", () => {
    expect(() => validateLedger(ledger)).not.toThrow();
    expect(ledger.rows).toHaveLength(ledger.summary.activeOwnershipRows);
    expect(new Set(ledger.rows.map((row) => row.recordId))).toHaveProperty("size", ledger.rows.length);
  });

  it("never presents an inference as disclosed or high confidence", () => {
    const inferred = ledger.rows.filter((row) => row.attribution === "INFERRED");
    expect(inferred.length).toBeGreaterThan(0);
    expect(inferred.every((row) => row.confidence === "LOW" || row.confidence === "MEDIUM")).toBe(true);
    expect(inferred.every((row) => !!row.disclosedOrEstimatedFundName && !!row.rationale)).toBe(true);
  });

  it("leaves reviewed owners unresolved when the current vehicle is not a disclosed fund", () => {
    const unresolved = ledger.rows.filter((row) => row.attribution === "UNRESOLVED");
    expect(unresolved).toHaveLength(57);
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "Potters Industries, LLC",
      investmentFirm: "UniSuper",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "Potters Industries, LLC",
      investmentFirm: "Partners Capital",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "TraPac, LLC",
      investmentFirm: "Ocean Network Express",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "Yusen Terminals LLC",
      investmentFirm: "Ocean Network Express",
      currentVehicleName: "Undisclosed ONE subsidiary / NYK Ports LLC",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "Maverick 6 & 7",
      investmentFirm: "EDF Renewables North America",
      currentVehicleName: "Retained Maverick 67 interests; internal vehicle not publicly disclosed",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "38 Degrees North",
      investmentFirm: "Climate Adaptive Infrastructure",
      currentVehicleName: "Climate Adaptive Infrastructure",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "38 Degrees North",
      investmentFirm: "S2G Ventures",
      currentVehicleName: "S2G Ventures",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "EdgeConneX",
      investmentFirm: "Sixth Street",
      currentVehicleName: "Sixth Street-managed funds; exact vehicles not publicly disclosed",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "Environmental 360 Solutions",
      investmentFirm: "Donato Ardellini",
      currentVehicleName: "Donato Ardellini",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "Edwards Sanborn Solar + Storage",
      investmentFirm: "Axium Infrastructure",
      currentVehicleName: "Axium ES Holdings LLC / AxInfra US LP",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "Virginia International Gateway",
      investmentFirm: "Astatine Investment Partners",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "Axium Extendicare LTC II LP",
      investmentFirm: "Axium Infrastructure",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "Axium Aster & Axium Bloom",
      investmentFirm: "Axium Infrastructure",
      currentVehicleName: "Aster Joint Venture Limited Partnership",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "Axium Aster & Axium Bloom",
      investmentFirm: "Axium Infrastructure",
      currentVehicleName: "Bloom Limited Partnership",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "Axium Aster & Axium Bloom",
      investmentFirm: "AgeCare",
      currentVehicleName: "Aster Joint Venture Limited Partnership",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
    expect(unresolved).toContainEqual(expect.objectContaining({
      companyName: "Axium Aster & Axium Bloom",
      investmentFirm: "AgeCare",
      currentVehicleName: "Bloom Limited Partnership",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "RESEARCH_REQUIRED",
    }));
  });

  it("keeps fund-database additions behind the separate size gate", () => {
    const gated = ledger.rows.filter((row) => row.fundDatabaseAction !== "NONE");
    expect(gated.length).toBeGreaterThan(0);
    expect(gated.every((row) => row.proposedAction === "SET_DISCLOSED_UNLISTED")).toBe(true);
    expect(gated.every((row) => !row.applyEligible)).toBe(true);
  });

  it("keeps BBGI and ENGIE direct ownership out of the fund-inference queue", () => {
    expect(ledger.rows).toContainEqual(expect.objectContaining({
      companyName: "Kelowna and Vernon Hospitals Project",
      investmentFirm: "BBGI",
      attribution: "DIRECT_PROGRAM",
      attributedFundName: null,
      targetLinkedFundName: null,
    }));
    expect(ledger.rows).toContainEqual(expect.objectContaining({
      companyName: "Live Oak Wind Farm",
      investmentFirm: "ENGIE",
      attribution: "DIRECT_PROGRAM",
      attributedFundName: null,
      targetLinkedFundName: null,
    }));
  });

  it("only admits high-confidence disclosed existing funds to the deterministic batch", () => {
    const eligible = ledger.rows.filter((row) => row.applyEligible);
    expect(eligible.length).toBe(ledger.summary.applyEligibleRows);
    expect(eligible.every((row) => (
      row.attribution === "DISCLOSED"
      && row.confidence === "HIGH"
      && !!row.linkedCanonicalFundName
    ))).toBe(true);
  });

  it("normalizes ECP to the historical fund lineage without adding fund records", () => {
    const ecpRows = ledger.rows.filter((row) => row.investmentFirm === "ECP");
    expect(ecpRows.length).toBeGreaterThan(0);
    expect(ecpRows.every((row) => row.attribution !== "UNRESOLVED")).toBe(true);
    expect(ecpRows.some((row) => row.attributedFundName === "ECP Fund III")).toBe(true);
    expect(ecpRows.some((row) => row.attributedFundName === "ECP Fund IV")).toBe(true);
    expect(ecpRows.some((row) => row.attributedFundName === "ECP Fund V")).toBe(true);
    expect(ledger.policy.fundAdditionThreshold).toContain("attribution never bypasses");
  });

  it("classifies known pension, sovereign, corporate, and structured-equity owners as direct programs", () => {
    const directFirms = new Set([
      "Wren House",
      "Allianz Global Investors",
      "Acadia Infrastructure Capital",
      "ADIA Infrastructure",
      "Allied Industrial Partners",
      "BTG Pactual Timberland Investment Group",
      "QIC",
      "Stem, Inc.",
      "Chevron New Energies",
      "Mitsubishi Power Americas",
    ]);
    const directRows = ledger.rows.filter((row) => directFirms.has(row.investmentFirm));
    expect(directRows.length).toBeGreaterThan(0);
    expect(directRows.every((row) => row.attribution === "DIRECT_PROGRAM")).toBe(true);
    expect(directRows.every((row) => row.attributedFundName === null)).toBe(true);
  });

  it("does not rank funds from an unrelated manager through generic suffix overlap", () => {
    const quinbrookRows = ledger.rows.filter((row) => row.investmentFirm === "Quinbrook");
    expect(quinbrookRows.length).toBeGreaterThan(0);
    expect(quinbrookRows.flatMap((row) => row.alternatives).every((candidate) => (
      candidate.managerName === "Quinbrook Infrastructure Partners"
    ))).toBe(true);
  });

  it("keeps reviewed lineage decisions explicit and sourced", () => {
    const reviewed = [
      ["Vigor Marine Group", "Lone Star Fund XI", "DISCLOSED"],
      ["Monterey Mushrooms", "Paine Schwartz Food Chain Fund VI, L.P.", "DISCLOSED"],
      ["Sparkfund", "Vision Ridge Sustainable Asset Fund I", "INFERRED"],
      ["Ports America", "Oaktree Ports America Fund (HS III), L.P.", "INFERRED"],
    ] as const;
    for (const [companyName, fundName, attribution] of reviewed) {
      const row = ledger.rows.find((candidate) => candidate.companyName === companyName && candidate.attributedFundName === fundName);
      expect(row, companyName).toBeDefined();
      expect(row?.attribution).toBe(attribution);
      expect(row?.evidenceUrls.length).toBeGreaterThan(0);
    }
  });

  it("preserves Etobicoke's disclosed Axium vehicle without linking a generic fund", () => {
    const row = ledger.rows.find((candidate) => (
      candidate.companyName === "Etobicoke Healthcare Partnership"
      && candidate.investmentFirm === "Axium Infrastructure"
    ));
    expect(row).toMatchObject({
      attribution: "DISCLOSED",
      confidence: "HIGH",
      attributedFundName: "Axium Infrastructure Canada II L.P.",
      targetLinkedFundName: null,
      proposedAction: "SET_DISCLOSED_UNLISTED",
    });
    expect(row?.evidenceUrls.length).toBeGreaterThan(0);
  });

  it("preserves Montreal Gateway Terminals' disclosed Axium vehicle without linking a generic fund", () => {
    const row = ledger.rows.find((candidate) => (
      candidate.companyName === "Montreal Gateway Terminals Partnership"
      && candidate.investmentFirm === "Axium Infrastructure"
    ));
    expect(row).toMatchObject({
      attribution: "DISCLOSED",
      confidence: "HIGH",
      attributedFundName: "Fiera Axium Infrastructure Canada II L.P.",
      targetLinkedFundName: null,
      proposedAction: "SET_DISCLOSED_UNLISTED",
    });
    expect(row?.evidenceUrls.length).toBeGreaterThan(0);
  });

  it("preserves PUC Transmission's disclosed Axium vehicle and direct retained owner", () => {
    const axium = ledger.rows.find((candidate) => (
      candidate.companyName === "PUC Transmission LP"
      && candidate.investmentFirm === "Axium Infrastructure"
    ));
    expect(axium).toMatchObject({
      attribution: "DISCLOSED",
      confidence: "HIGH",
      attributedFundName: "Axium Infrastructure Canada II Limited Partnership",
      targetLinkedFundName: null,
      proposedAction: "SET_DISCLOSED_UNLISTED",
    });
    expect(axium?.evidenceUrls.length).toBeGreaterThan(0);

    const puc = ledger.rows.find((candidate) => (
      candidate.companyName === "PUC Transmission LP"
      && candidate.investmentFirm === "PUC Inc."
    ));
    expect(puc).toMatchObject({
      attribution: "DIRECT_PROGRAM",
      confidence: "HIGH",
      attributedFundName: null,
      targetLinkedFundName: null,
      proposedAction: "SET_DIRECT_PROGRAM",
    });
    expect(puc?.evidenceUrls.length).toBeGreaterThan(0);
  });
});
