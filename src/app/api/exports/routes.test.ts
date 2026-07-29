// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { IMPORT_CONTRACTS, importFieldNames } from "@/modules/imports/contracts";
import { parseImportRequest } from "@/modules/imports/request";

const mocks = vi.hoisted(() => ({
  canExportData: vi.fn(),
  getAllDeals: vi.fn(),
  getAllFunds: vi.fn(),
  getAllCompanies: vi.fn(),
}));

vi.mock("@/modules/auth/guards", () => ({
  canExportData: mocks.canExportData,
}));
vi.mock("@/modules/deals/queries", () => ({
  getAllDeals: mocks.getAllDeals,
}));
vi.mock("@/modules/funds/queries", () => ({
  getAllFunds: mocks.getAllFunds,
}));
vi.mock("@/modules/companies/queries", () => ({
  getAllCompanies: mocks.getAllCompanies,
}));

import { GET as exportDeals } from "./deals/route";
import { GET as exportFunds } from "./funds/route";
import { GET as exportPortfolio } from "./portfolio/route";

const deal = {
  id: "deal-1",
  legacyId: "deal-1",
  title: "Digital acquisition",
  target: "Target",
  buyer: "Buyer",
  seller: "Seller",
  sector: "Digital",
  subsector: "Data Centers",
  region: "North America",
  category: ["Acquisition (Buyout)"],
  date: "2026-07-29T00:00:00.000Z",
  status: "Announced",
  description: "Description",
  targetDescription: "Target description",
  country: "United States",
  enterpriseValue: null,
  equityValue: null,
  stake: null,
  closingDate: null,
  assetScale: null,
  valuationMultiple: null,
  fundVehicle: null,
  keyHighlights: ["One", "Two"],
  sourceName: "Source",
  sourceUrl: "https://example.test/deal",
  financialAdvisorBuyer: ["Private extra"],
  financialAdvisorSeller: null,
  legalAdvisorBuyer: null,
  legalAdvisorSeller: null,
};

const fund = {
  id: "fund-1",
  legacyId: "fund-1",
  managerName: "Manager",
  fundName: "Fund I",
  strategies: ["Core"],
  structure: "Closed-End",
  status: "Financial Close",
  size: "$1 billion",
  sizeUsdMm: 1_000,
  vintage: "2026",
  sectors: ["Digital"],
  regions: ["North America"],
  investmentStrategy: "Strategy",
  sourceUrls: ["https://example.test/fund"],
  ticker: null,
  strategyUrl: null,
  portfolioCompanies: [{ name: "Private extra" }],
};

const company = {
  id: "company-1",
  focusIds: ["company-1"],
  name: "Company",
  investmentFirm: "Manager",
  sector: "Digital",
  subsector: "Data Centers",
  region: "North America",
  country: "United States",
  countryTags: ["United States"],
  ownershipVehicle: "Fund I",
  status: "Active",
  description: "Description",
  website: "https://example.test/company",
  yearFounded: 2010,
  investmentYear: 2020,
  headquarters: "New York",
  owners: [{ firm: "Private extra" }],
};

type ExportHandler = typeof exportDeals;

async function parseJsonExport(
  handler: ExportHandler,
  entity: keyof typeof IMPORT_CONTRACTS,
) {
  const response = await handler(
    new Request(`https://example.test/api/exports/${entity}?format=json`) as never,
  );
  expect(response.status).toBe(200);
  const json = await response.json();
  const contract = IMPORT_CONTRACTS[entity];
  const parsed = await parseImportRequest(
    new Request("https://example.test/api/imports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(json),
    }),
    { bodyKey: contract.bodyKey, contract },
  );
  expect(parsed.rowErrors).toBeUndefined();
  expect(Object.keys(parsed.rows[0])).toEqual([
    "__row",
    ...importFieldNames(contract),
  ]);
}

async function parseCsvExport(
  handler: ExportHandler,
  entity: keyof typeof IMPORT_CONTRACTS,
) {
  const response = await handler(
    new Request(`https://example.test/api/exports/${entity}`) as never,
  );
  expect(response.status).toBe(200);
  const csv = await response.text();
  const form = new FormData();
  form.append("file", new File([csv], `${entity}.csv`, { type: "text/csv" }));
  const contract = IMPORT_CONTRACTS[entity];
  const parsed = await parseImportRequest(
    new Request("https://example.test/api/imports", {
      method: "POST",
      body: form,
    }),
    { bodyKey: contract.bodyKey, contract },
  );
  expect(parsed.rowErrors).toBeUndefined();
  expect(Object.keys(parsed.rows[0])).toEqual([
    "__row",
    ...importFieldNames(contract),
  ]);
}

describe("export/import contract round trips", () => {
  beforeEach(() => {
    mocks.canExportData.mockReset().mockResolvedValue(true);
    mocks.getAllDeals.mockReset().mockResolvedValue([deal]);
    mocks.getAllFunds.mockReset().mockResolvedValue([fund]);
    mocks.getAllCompanies.mockReset().mockResolvedValue([company]);
  });

  it.each([
    ["deals", exportDeals],
    ["funds", exportFunds],
    ["portfolio", exportPortfolio],
  ] as const)("round-trips the %s JSON export without private view fields", async (entity, handler) => {
    await parseJsonExport(handler, entity);
  });

  it.each([
    ["deals", exportDeals],
    ["funds", exportFunds],
    ["portfolio", exportPortfolio],
  ] as const)("round-trips the %s CSV export without clearing writable fields", async (entity, handler) => {
    await parseCsvExport(handler, entity);
  });
});
