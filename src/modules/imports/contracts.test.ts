// @vitest-environment node

import { describe, expect, it } from "vitest";
import { IMPORT_CONTRACTS, importFieldNames } from "./contracts";
import { ImportRequestError, parseImportRequest } from "./request";

const URL = "https://example.test/api/imports";

const dealRow = {
  legacyId: "deal-1",
  title: "Digital acquisition",
  target: "Target",
  buyer: "Buyer",
  seller: "Seller",
  sector: "Digital",
  subsector: "Data Centers",
  region: "North America",
  category: ["Acquisition (Buyout)"],
  date: "2026-07-29",
  status: "Announced",
  description: "Description",
  targetDescription: "",
  country: "United States",
  enterpriseValue: null,
  equityValue: null,
  stake: null,
  closingDate: null,
  assetScale: null,
  valuationMultiple: null,
  fundVehicle: null,
  keyHighlights: [],
  sourceName: null,
  sourceUrl: null,
};

const fundRow = {
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
  investmentStrategy: "",
  sourceUrls: ["https://example.test/fund"],
  ticker: null,
  strategyUrl: null,
};

const portfolioRow = {
  name: "Company",
  investmentFirm: "Manager",
  sector: "Digital",
  subsector: "Data Centers",
  region: "North America",
  country: "United States",
  countryTags: ["United States"],
  ownershipVehicle: "Fund I",
  status: "Active",
  description: "",
  website: null,
  yearFounded: 2010,
  investmentYear: null,
  headquarters: null,
};

function jsonRequest(value: unknown): Request {
  return new Request(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(value),
  });
}

function csvRequest(csv: string, name: string): Request {
  const form = new FormData();
  form.append("file", new File([csv], name, { type: "text/csv" }));
  return new Request(URL, { method: "POST", body: form });
}

async function expectContractError(
  promise: Promise<unknown>,
  code: ImportRequestError["code"],
) {
  await expect(promise).rejects.toMatchObject({
    name: "ImportRequestError",
    code,
    status: 400,
  });
}

async function expectRowError(
  promise: Promise<ReturnType<typeof parseImportRequest> extends Promise<infer T> ? T : never>,
  code: ImportRequestError["code"],
) {
  const parsed = await promise;
  expect(parsed.rows).toEqual([]);
  expect(parsed.totalRows).toBe(1);
  expect(parsed.rowErrors).toEqual([
    expect.objectContaining({ row: 1, code }),
  ]);
}

describe("import field contracts", () => {
  it.each([
    ["deals", dealRow],
    ["funds", fundRow],
    ["portfolio", portfolioRow],
  ] as const)("normalizes a complete %s JSON export row", async (entity, row) => {
    const contract = IMPORT_CONTRACTS[entity];
    const parsed = await parseImportRequest(
      jsonRequest({ data: [row], count: 1, exportedAt: "2026-07-29" }),
      { bodyKey: contract.bodyKey, contract },
    );

    expect(parsed.rows).toHaveLength(1);
    expect(Object.keys(parsed.rows[0])).toEqual([
      "__row",
      ...importFieldNames(contract),
    ]);
    expect(parsed.rows[0]).toEqual({ __row: 1, ...row });
  });

  it("rejects unknown or misspelled JSON keys before they reach storage", async () => {
    await expectRowError(
      parseImportRequest(
        jsonRequest([{
          ...dealRow,
          sourceURl: dealRow.sourceUrl,
          privateEditorialNotes: "must never persist",
        }]),
        {
          bodyKey: IMPORT_CONTRACTS.deals.bodyKey,
          contract: IMPORT_CONTRACTS.deals,
        },
      ),
      "INVALID_IMPORT_FIELDS",
    );
  });

  it("keeps valid rows when another JSON row violates the contract", async () => {
    const parsed = await parseImportRequest(
      jsonRequest([
        dealRow,
        {
          ...dealRow,
          legacyId: "deal-2",
          privateEditorialNotes: "must never persist",
        },
      ]),
      {
        bodyKey: IMPORT_CONTRACTS.deals.bodyKey,
        contract: IMPORT_CONTRACTS.deals,
      },
    );

    expect(parsed.rows).toEqual([{ __row: 1, ...dealRow }]);
    expect(parsed.totalRows).toBe(2);
    expect(parsed.rowErrors).toEqual([
      expect.objectContaining({
        row: 2,
        code: "INVALID_IMPORT_FIELDS",
      }),
    ]);
    expect(JSON.stringify(parsed.rows)).not.toContain("privateEditorialNotes");
    expect(JSON.stringify(parsed.rows)).not.toContain("must never persist");
  });

  it("rejects a missing nullable field instead of treating omission as clear", async () => {
    const { targetDescription: _omitted, ...incomplete } = dealRow;
    await expectRowError(
      parseImportRequest(jsonRequest([incomplete]), {
        bodyKey: IMPORT_CONTRACTS.deals.bodyKey,
        contract: IMPORT_CONTRACTS.deals,
      }),
      "INVALID_IMPORT_FIELDS",
    );
  });

  it.each([
    ["object string", { ...dealRow, title: { text: "not a string" } }],
    ["boolean string", { ...dealRow, title: true }],
    ["mixed array", { ...dealRow, category: ["Acquisition (Buyout)", 1] }],
    ["JSON numeric string", { ...fundRow, sizeUsdMm: "1000" }],
    ["boolean number", { ...fundRow, sizeUsdMm: false }],
  ])("rejects strict JSON type violations: %s", async (_label, row) => {
    const entity = "fundName" in row ? "funds" : "deals";
    const contract = IMPORT_CONTRACTS[entity];
    await expectRowError(
      parseImportRequest(jsonRequest([row]), {
        bodyKey: contract.bodyKey,
        contract,
      }),
      "INVALID_IMPORT_VALUE",
    );
  });

  it("accepts numeric CSV text and treats whitespace-only optional numbers as null", async () => {
    const columns = importFieldNames(IMPORT_CONTRACTS.funds);
    const values = columns.map((column) => {
      const value = fundRow[column as keyof typeof fundRow];
      if (column === "sizeUsdMm") return " 1000 ";
      if (Array.isArray(value)) return value.join("; ");
      return value ?? "";
    });
    const parsed = await parseImportRequest(
      csvRequest(
        `${columns.join(",")}\n${values.join(",")}`,
        "funds.csv",
      ),
      {
        bodyKey: IMPORT_CONTRACTS.funds.bodyKey,
        contract: IMPORT_CONTRACTS.funds,
      },
    );
    expect(parsed.rows[0].sizeUsdMm).toBe(1000);

    values[columns.indexOf("sizeUsdMm")] = "   ";
    const blankParsed = await parseImportRequest(
      csvRequest(
        `${columns.join(",")}\n${values.join(",")}`,
        "funds.csv",
      ),
      {
        bodyKey: IMPORT_CONTRACTS.funds.bodyKey,
        contract: IMPORT_CONTRACTS.funds,
      },
    );
    expect(blankParsed.rows[0].sizeUsdMm).toBeNull();
  });

  it("rejects a case-mismatched CSV header even when every other column is present", async () => {
    const columns = importFieldNames(IMPORT_CONTRACTS.portfolio);
    columns[0] = "Name";
    const values = columns.map(() => "");
    await expectContractError(
      parseImportRequest(
        csvRequest(`${columns.join(",")}\n${values.join(",")}`, "portfolio.csv"),
        {
          bodyKey: IMPORT_CONTRACTS.portfolio.bodyKey,
          contract: IMPORT_CONTRACTS.portfolio,
        },
      ),
      "INVALID_IMPORT_FIELDS",
    );
  });

  it("continues to reject case-insensitive duplicate CSV headers", async () => {
    const columns = importFieldNames(IMPORT_CONTRACTS.deals);
    columns.push("LEGACYID");
    await expectContractError(
      parseImportRequest(
        csvRequest(
          `${columns.join(",")}\n${columns.map(() => "").join(",")}`,
          "deals.csv",
        ),
        {
          bodyKey: IMPORT_CONTRACTS.deals.bodyKey,
          contract: IMPORT_CONTRACTS.deals,
        },
      ),
      "INVALID_CSV_HEADERS",
    );
  });
});
