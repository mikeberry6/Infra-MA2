import { describe, expect, it } from "vitest";
import { DEAL_SECTORS, FUND_SECTORS, PORTCO_SECTORS } from "./constants";
import {
  COMPANY_SECTOR_DISPLAY,
  COMPANY_SECTOR_MAP,
  DEAL_SECTOR_DISPLAY,
  DEAL_SECTOR_MAP,
  FUND_SECTOR_DISPLAY,
  FUND_SECTOR_MAP,
} from "@/modules/shared/enum-maps";

const CANONICAL_SECTORS = [
  "Power & ET",
  "Utilities",
  "Digital",
  "Midstream",
  "Transportation",
  "Social Infra",
];

describe("weekly sector taxonomy", () => {
  it("exposes only the latest weekly email sectors in filter constants", () => {
    expect(DEAL_SECTORS).toEqual(CANONICAL_SECTORS);
    expect(FUND_SECTORS).toEqual(CANONICAL_SECTORS);
    expect(PORTCO_SECTORS).toEqual(CANONICAL_SECTORS);
  });

  it("displays only canonical sector labels from database enums", () => {
    expect(Object.values(DEAL_SECTOR_DISPLAY)).toEqual(CANONICAL_SECTORS);
    expect(Object.values(FUND_SECTOR_DISPLAY)).toEqual(CANONICAL_SECTORS);
    expect(Object.values(COMPANY_SECTOR_DISPLAY)).toEqual(CANONICAL_SECTORS);
  });

  it("normalizes legacy sector aliases for imports and backfills", () => {
    expect(DEAL_SECTOR_MAP["Waste & ES"]).toBe("SOCIAL_INFRA");
    expect(DEAL_SECTOR_MAP.Social).toBe("SOCIAL_INFRA");

    expect(FUND_SECTOR_MAP["Renewables / Energy Transition"]).toBe("POWER_ET");
    expect(FUND_SECTOR_MAP["Power Generation"]).toBe("POWER_ET");
    expect(FUND_SECTOR_MAP["Digital Infrastructure"]).toBe("DIGITAL");
    expect(FUND_SECTOR_MAP.Communications).toBe("DIGITAL");
    expect(FUND_SECTOR_MAP["Midstream / Energy"]).toBe("MIDSTREAM");
    expect(FUND_SECTOR_MAP["Waste / Environmental Services"]).toBe("SOCIAL_INFRA");
    expect(FUND_SECTOR_MAP.Water).toBe("UTILITIES");
    expect(FUND_SECTOR_MAP.Logistics).toBe("TRANSPORTATION");
    expect(FUND_SECTOR_MAP["Social Infrastructure"]).toBe("SOCIAL_INFRA");

    expect(COMPANY_SECTOR_MAP["Energy Transition"]).toBe("POWER_ET");
    expect(COMPANY_SECTOR_MAP["Power Generation"]).toBe("POWER_ET");
    expect(COMPANY_SECTOR_MAP["Renewable Resources"]).toBe("POWER_ET");
    expect(COMPANY_SECTOR_MAP["Digital Infrastructure"]).toBe("DIGITAL");
    expect(COMPANY_SECTOR_MAP["Midstream Energy"]).toBe("MIDSTREAM");
    expect(COMPANY_SECTOR_MAP["Regulated Utilities"]).toBe("UTILITIES");
    expect(COMPANY_SECTOR_MAP["Environmental / Waste"]).toBe("SOCIAL_INFRA");
    expect(COMPANY_SECTOR_MAP["Infrastructure Services"]).toBe("UTILITIES");
    expect(COMPANY_SECTOR_MAP["Social Infrastructure"]).toBe("SOCIAL_INFRA");
  });
});
