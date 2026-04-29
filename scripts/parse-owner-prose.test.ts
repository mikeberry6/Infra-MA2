import { describe, it, expect } from "vitest";
import { parseOwners, stakeFromProse } from "./parse-owner-prose";

describe("parseOwners — clean comma/and/semicolon splits", () => {
  it("splits comma + and into individual firms", () => {
    const r = parseOwners("Ferrovial, CPP Investments and PSP Investments");
    expect(r.firms).toEqual(["Ferrovial", "CPP Investments", "PSP Investments"]);
    expect(r.flagged).toEqual([]);
  });

  it("handles 'and' with slash co-naming", () => {
    const r = parseOwners("Transurban and La Caisse / CDPQ");
    expect(r.firms).toEqual(["Transurban", "La Caisse", "CDPQ"]);
  });

  it("preserves multi-word firm names", () => {
    const r = parseOwners("Canada Pension Plan Investment Board and Global Infrastructure Partners");
    expect(r.firms).toEqual([
      "Canada Pension Plan Investment Board",
      "Global Infrastructure Partners",
    ]);
  });
});

describe("parseOwners — noise filtering", () => {
  it("drops 'management' fragments as pure descriptor", () => {
    const r = parseOwners("Nelnet, SDC-managed funds and management");
    expect(r.firms).toEqual(["Nelnet", "SDC"]);
  });

  it("drops 'management minority' but keeps the named firms", () => {
    const r = parseOwners("Northleaf-managed funds and AVALT; management minority");
    expect(r.firms).toEqual(["Northleaf", "AVALT"]);
    expect(r.flagged.some((f) => f.toLowerCase().includes("management minority"))).toBe(true);
  });

  it("strips '-owned X' descriptor", () => {
    const r = parseOwners("Stonepeak-owned Air Transport Services Group");
    expect(r.firms).toEqual(["Stonepeak"]);
  });

  it("strips 'X% minority interest' suffix", () => {
    const r = parseOwners("CPV Group/OPC majority owners and Harrison Street 33.33% minority interest");
    expect(r.firms).toContain("CPV Group");
    expect(r.firms).toContain("OPC");
    expect(r.firms).toContain("Harrison Street");
  });

  it("strips trailing percentages", () => {
    const r = parseOwners("InfraRed managed funds 60%; Shell retained 40%");
    expect(r.firms).toContain("InfraRed");
    expect(r.firms).toContain("Shell");
  });

  it("flags project-level prose for human review", () => {
    const r = parseOwners("Fengate-led P3/project company with Clackamas County as public owner/client");
    expect(r.firms).toEqual([]);
    expect(r.flagged.length).toBeGreaterThan(0);
  });
});

describe("parseOwners — single-firm edge cases", () => {
  it("returns just the firm when prose is a clean replace", () => {
    const r = parseOwners("ENGIE North America");
    expect(r.firms).toEqual(["ENGIE North America"]);
  });

  it("strips date-suffix and clauses about acquisition", () => {
    const r = parseOwners("Apollo-managed funds agreed to acquire Eagle Creek Renewable Energy in 2025");
    expect(r.firms).toEqual(["Apollo"]);
  });
});

describe("stakeFromProse", () => {
  it("extracts a percentage near the firm name", () => {
    expect(stakeFromProse("InfraRed managed funds 60%; Shell retained 40%", "InfraRed")).toBe("60%");
    expect(stakeFromProse("InfraRed managed funds 60%; Shell retained 40%", "Shell")).toBe("40%");
  });

  it("extracts 'majority' when present near firm name", () => {
    expect(
      stakeFromProse(
        "TC Energy 35%; KKR and AIMCo consortium 65% combined",
        "TC Energy",
      ),
    ).toBe("35%");
  });

  it("returns null when no stake info is near", () => {
    expect(stakeFromProse("Ferrovial, CPP Investments and PSP Investments", "Ferrovial")).toBeNull();
  });

  it("returns null when firm name is not in the prose", () => {
    expect(stakeFromProse("Ferrovial, CPP Investments", "Apollo")).toBeNull();
  });
});
